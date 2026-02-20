(function () {
    'use strict';

    if (window.plugin_ai_search_ready) return;
    window.plugin_ai_search_ready = true;

    var manifest = {
        type: "other",
        version: "1.4.0",
        name: "AI Search (Gemini)",
        description: "Розумний пошук фільмів через Google Gemini",
        component: "ai_search"
    };

    // --- РОЗУМНИЙ ПАРСЕР ---
    function parseJsonFromResponse(response) {
        if (!response || typeof response !== 'string') return null;
        response = response.trim();

        var codeBlockStart = response.indexOf("```");
        if (codeBlockStart !== -1) {
            var contentStart = codeBlockStart + 3;
            if (response.substring(contentStart, contentStart + 4).toLowerCase() === "json") contentStart += 4;
            while (contentStart < response.length && /[\s\n\r]/.test(response[contentStart])) contentStart++;
            var codeBlockEnd = response.indexOf("```", contentStart);
            if (codeBlockEnd !== -1) {
                try { return JSON.parse(response.substring(contentStart, codeBlockEnd).trim()); } catch (e) {}
            }
        }

        var braceCount = 0, jsonStart = -1, jsonEnd = -1;
        for (var i = 0; i < response.length; i++) {
            if (response[i] === '{') { if (jsonStart === -1) jsonStart = i; braceCount++; }
            else if (response[i] === '}') { braceCount--; if (braceCount === 0 && jsonStart !== -1) { jsonEnd = i; break; } }
        }
        if (jsonStart !== -1 && jsonEnd !== -1) {
            try { return JSON.parse(response.substring(jsonStart, jsonEnd + 1)); } catch (e) {}
        }
        return null;
    }

    function extractRecommendations(parsedData) {
        var recommendations = [];
        if (!parsedData) return recommendations;
        var items = parsedData.recommendations || parsedData.movies || parsedData.items || parsedData.results || [];
        if (!Array.isArray(items)) items = [];

        var limit = parseInt(Lampa.Storage.get('ai_search_limit')) || 15;
        for (var i = 0; i < items.length && recommendations.length < limit; i++) {
            var item = items[i];
            if (!item || typeof item !== "object") continue;
            var rec = {
                title: item.title || item.name || item.film || '',
                year: parseInt(item.year || item.release_year || item.date || '0') || null
            };
            if (rec.title && rec.title.trim()) recommendations.push(rec);
        }
        return recommendations;
    }

    // --- ПОШУК ПОСТЕРІВ ЧЕРЕЗ TMDB ---
    function fetchTmdbData(recommendations, callback) {
        var results = [];
        var processed = 0;
        var limit = recommendations.length;
        
        if (limit === 0) return callback([]);

        var request = new Lampa.Reguest();

        function checkDone() {
            processed++;
            if (processed >= limit) callback(results);
        }

        recommendations.forEach(function(item) {
            if (!item.title) return checkDone();
            
            var url = Lampa.TMDB.api("search/multi?query=" + encodeURIComponent(item.title) + "&api_key=" + Lampa.TMDB.key() + "&language=uk-UA");
            
            request.silent(url, function (data) {
                if (data && data.results && data.results.length > 0) {
                    var best = data.results[0];
                    if (item.year) {
                        for (var i = 0; i < data.results.length; i++) {
                            var r = data.results[i];
                            var year = (r.release_date || r.first_air_date || '').substring(0, 4);
                            if (year && parseInt(year) === parseInt(item.year)) { best = r; break; }
                        }
                    }
                    if (best.media_type === 'movie' || best.media_type === 'tv') {
                        results.push({
                            title: best.title || best.name,
                            id: best.id,
                            type: best.media_type,
                            poster_path: best.poster_path,
                            vote_average: best.vote_average || 0,
                            year: (best.release_date || best.first_air_date || '').substring(0, 4)
                        });
                    }
                }
                checkDone();
            }, checkDone);
        });
    }

    // --- ЗАПИТ ДО GEMINI API ---
    function askAI(query) {
        var apiKey = (Lampa.Storage.get('ai_search_api_key') || '').trim();
        var model = Lampa.Storage.get('ai_search_model');
        var limit = parseInt(Lampa.Storage.get('ai_search_limit')) || 15;

        // Захист: якщо в пам'яті залишився старий текст, скидаємо на дефолт
        var validModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.0-pro'];
        if (validModels.indexOf(model) === -1) {
            model = 'gemini-1.5-flash';
        }

        var prompt = 'Дій як професійний кінокритик. Користувач шукає: "' + query + '".\n' +
            'Знайди рівно ' + limit + ' найкращих фільмів або серіалів, які ідеально підходять під цей запит.\n' +
            'ВАЖЛИВО: Поверни результат ВИКЛЮЧНО у форматі JSON.\n' +
            'Структура має бути такою:\n' +
            '{"recommendations": [{"title": "Оригінальна назва або назва українською", "year": 2020}]}';

        return new Promise(function(resolve) {
            var apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

            $.ajax({
                url: apiUrl,
                type: 'POST',
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                }),
                success: function(response) {
                    if (response && response.candidates && response.candidates.length > 0) {
                        var rawText = response.candidates[0].content.parts[0].text;
                        var parsed = parseJsonFromResponse(rawText);
                        var recs = extractRecommendations(parsed);
                        
                        if (recs.length > 0) {
                            resolve(recs);
                        } else {
                            Lampa.Noty.show('Gemini відповів текстом замість списку.');
                            resolve([]);
                        }
                    } else {
                        resolve([]);
                    }
                },
                error: function(jqXHR, textStatus) {
                    var status = jqXHR.status;
                    if (textStatus === 'timeout') {
                        Lampa.Noty.show('Помилка: Gemini думає занадто довго.');
                    } else if (status === 404) {
                        // Оновлене повідомлення, яке підказує рішення
                        Lampa.Noty.show('Помилка 404: Доступ до цієї моделі закритий. Виберіть Gemini 1.0 Pro в налаштуваннях.');
                    } else if (status === 400) {
                        Lampa.Noty.show('Помилка 400: Неправильний формат запиту.');
                    } else if (status === 403) {
                        Lampa.Noty.show('Помилка 403: Доступ заборонено (перевірте ключ).');
                    } else {
                        Lampa.Noty.show('Помилка сервера: ' + status);
                    }
                    console.error('Помилка Gemini API:', jqXHR.responseText);
                    resolve(null);
                }
            });
        });
    }

    // --- ІНТЕГРАЦІЯ У ВКЛАДКУ ПОШУКУ LAMPA ---
    var AiSearchSource = {
        title: 'AI Пошук',
        search: function (params, oncomplite) {
            var query = decodeURIComponent(params.query || '').trim();
            if (!query) return oncomplite([]);

            var apiKey = (Lampa.Storage.get('ai_search_api_key') || '').trim();
            if (!apiKey) {
                Lampa.Noty.show('Введіть API ключ Gemini у Налаштуваннях!');
                return oncomplite([]);
            }
            if (apiKey.indexOf('AIza') !== 0) {
                Lampa.Noty.show('Помилка: Потрібен ключ від Google (починається з AIza...)');
                return oncomplite([]);
            }

            Lampa.Noty.show('Gemini шукає фільми (зачекайте)...');

            askAI(query).then(function(recs) {
                if (!recs || recs.length === 0) {
                    return oncomplite([]); 
                }

                Lampa.Noty.show('Завантаження постерів...');
                
                fetchTmdbData(recs, function(tmdbResults) {
                    if (tmdbResults.length === 0) {
                        Lampa.Noty.show('Знайдені фільми відсутні в базі TMDB.');
                        return oncomplite([]);
                    }

                    var formattedResults = tmdbResults.map(function(item) {
                        return {
                            id: item.id,
                            title: item.title,
                            name: item.title,
                            poster_path: item.poster_path ? Lampa.TMDB.image('t/p/w200' + item.poster_path) : '',
                            release_year: item.year,
                            vote_average: item.vote_average,
                            type: item.type,
                            method: item.type,
                            source: 'tmdb'
                        };
                    });

                    oncomplite([{
                        title: 'Знайдено штучним інтелектом',
                        results: formattedResults,
                        total: formattedResults.length
                    }]);
                });
            });
        },
        params: {
            save: true,
            lazy: true,
            nofound: 'За цим запитом AI нічого не рекомендує'
        },
        onSelect: function (params, close) {
            close();
            if (params.element) {
                Lampa.Activity.push({
                    url: '',
                    title: params.element.type === 'tv' ? 'Сериал' : 'Фильм',
                    component: 'full',
                    id: params.element.id,
                    method: params.element.method,
                    source: 'tmdb'
                });
            }
        }
    };

    // --- ГОЛОВНА ЛОГІКА ІНІЦІАЛІЗАЦІЇ ---
    function startPlugin() {
        if (Lampa.Search) {
            Lampa.Search.addSource(AiSearchSource);
        }

        Lampa.SettingsApi.addComponent({
            component: 'ai_search',
            name: 'AI Search (Gemini)',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { type: 'button', component: 'ai_search_key_btn' },
            field: { 
                name: 'API ключ Gemini', 
                description: Lampa.Storage.get('ai_search_api_key') ? 'Ключ встановлено' : 'Отримати в Google AI Studio'
            },
            onChange: function () {
                Lampa.Input.edit({
                    title: 'API ключ Gemini (AIza...)',
                    value: Lampa.Storage.get('ai_search_api_key', ''),
                    free: true,
                    nosave: true
                }, function (new_val) {
                    Lampa.Storage.set('ai_search_api_key', new_val.trim());
                    Lampa.Settings.update();
                });
            }
        });

        // НОВЕ ВИПАДАЮЧЕ МЕНЮ МОДЕЛЕЙ
        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: {
                name: 'ai_search_model',
                type: 'select',
                values: { 
                    'gemini-2.0-flash': 'Gemini 2.0 Flash (Найновіша)', 
                    'gemini-1.5-flash': 'Gemini 1.5 Flash (Швидка)', 
                    'gemini-1.0-pro': 'Gemini 1.0 Pro (СТАБІЛЬНА БАЗОВА)' 
                },
                default: 'gemini-1.5-flash'
            },
            field: { 
                name: 'Модель Gemini', 
                description: 'Якщо отримуєте помилку 404, виберіть Gemini 1.0 Pro' 
            },
            onChange: function (val) { Lampa.Storage.set('ai_search_model', val); }
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: {
                name: 'ai_search_limit',
                type: 'select',
                values: { 5: '5', 10: '10', 15: '15', 20: '20' },
                default: 15
            },
            field: { name: 'Кількість результатів', description: 'Скільки варіантів показувати' },
            onChange: function (val) { Lampa.Storage.set('ai_search_limit', val); }
        });
    }

    if (window.appready) {
        setTimeout(startPlugin, 500); 
    } else {
        Lampa.Listener.follow('app', function (e) { 
            if (e.type === 'ready') setTimeout(startPlugin, 500); 
        });
    }

    if (Lampa.Manifest) Lampa.Manifest.plugins = manifest;
})();
