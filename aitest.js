(function () {
    'use strict';

    if (window.plugin_ai_search_ready) return;
    window.plugin_ai_search_ready = true;

    var manifest = {
        type: "other",
        version: "1.1.0",
        name: "AI Search",
        description: "Розумний пошук фільмів з інтеграцією TMDB",
        component: "ai_search"
    };

    // --- УТИЛІТИ З НОВОГО ПЛАГІНА ---
    
    // Розумний парсер (витягує JSON, навіть якщо ШІ додав зайвий текст)
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

    // Витягування масиву рекомендацій
    function extractRecommendations(parsedData) {
        var recommendations = [];
        if (!parsedData) return recommendations;
        var items = parsedData.recommendations || parsedData.movies || parsedData.items || parsedData.results || [];
        if (!Array.isArray(items)) items = [];

        var limit = Lampa.Storage.get('ai_search_limit') || 15;
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

    // Пошук реальних фільмів у базі TMDB
    function fetchTmdbData(recommendations, callback) {
        var results = [];
        var processed = 0;
        var limit = recommendations.length;
        
        if (limit === 0) return callback([]);

        var request = new Lampa.Reguest(); // Системний мережевий клас Lampa

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
                    // Спроба знайти точний збіг за роком випуску
                    if (item.year) {
                        for (var i = 0; i < data.results.length; i++) {
                            var r = data.results[i];
                            var year = (r.release_date || r.first_air_date || '').substring(0, 4);
                            if (year && parseInt(year) === parseInt(item.year)) { best = r; break; }
                        }
                    }
                    if (best.media_type === 'movie' || best.media_type === 'tv') {
                        results.push({
                            title: (best.title || best.name) + (item.year ? ' (' + item.year + ')' : ''),
                            id: best.id,
                            type: best.media_type
                        });
                    }
                }
                checkDone();
            }, checkDone);
        });
    }

    // --- ГОЛОВНА ЛОГІКА ПЛАГІНА ---

    function startPlugin() {
        // Налаштування (безпечний варіант)
        Lampa.SettingsApi.addComponent({
            component: 'ai_search',
            name: 'AI Search',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="M11 8v6"></path><path d="M8 11h6"></path></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { type: 'button', component: 'ai_search_key_btn' },
            field: { 
                name: 'API ключ OpenRouter', 
                description: Lampa.Storage.get('ai_search_api_key') ? 'Ключ встановлено' : 'Не встановлено (натисніть, щоб ввести)'
            },
            onChange: function () {
                Lampa.Input.edit({
                    title: 'API ключ OpenRouter',
                    value: Lampa.Storage.get('ai_search_api_key', ''),
                    free: true,
                    nosave: true
                }, function (new_val) {
                    Lampa.Storage.set('ai_search_api_key', new_val.trim());
                    Lampa.Settings.update();
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { type: 'button', component: 'ai_search_model_btn' },
            field: { 
                name: 'Модель AI', 
                description: Lampa.Storage.get('ai_search_model', 'google/gemini-2.0-flash-lite-preview-02-05:free') 
            },
            onChange: function () {
                Lampa.Input.edit({
                    title: 'Введіть назву моделі',
                    value: Lampa.Storage.get('ai_search_model', 'google/gemini-2.0-flash-lite-preview-02-05:free'),
                    free: true,
                    nosave: true
                }, function (new_val) {
                    Lampa.Storage.set('ai_search_model', new_val.trim());
                    Lampa.Settings.update(); 
                });
            }
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

        // Додавання кнопки в головне меню
        if (!$('.menu__item.ai-search-btn').length) {
            var btn = $('<div class="menu__item selector ai-search-btn">' +
                '<div class="menu__icons">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>' +
                '</div>' +
                '<div class="menu__title">AI Search</div>' +
            '</div>');

            btn.on('hover:enter', function () {
                var apiKey = Lampa.Storage.get('ai_search_api_key');
                if (!apiKey) {
                    Lampa.Noty.show('Спочатку введіть API ключ у Налаштуваннях!');
                    return;
                }

                Lampa.Input.edit({
                    title: 'Що хочете подивитися?',
                    value: '',
                    free: true,
                    nosave: true
                }, function (query) {
                    if (query) {
                        Lampa.Noty.show('AI генерує підбірку (може зайняти до 30с)...');
                        
                        askAI(query).then(function(recs) {
                            if (recs && recs.length > 0) {
                                Lampa.Noty.show('Пошук постерів у базі...');
                                
                                fetchTmdbData(recs, function(tmdbResults) {
                                    if (tmdbResults.length > 0) {
                                        Lampa.Select.show({
                                            title: 'AI рекомендує:',
                                            items: tmdbResults,
                                            onSelect: function (item) {
                                                // ВАУ-ефект: одразу відкриваємо картку фільму!
                                                Lampa.Activity.push({
                                                    url: '',
                                                    title: item.title,
                                                    component: 'full',
                                                    id: item.id,
                                                    method: item.type,
                                                    source: 'tmdb'
                                                });
                                            },
                                            onBack: function () { Lampa.Controller.toggle('menu'); }
                                        });
                                    } else {
                                        Lampa.Noty.show('AI знайшов фільми, але їх немає у базі TMDB.');
                                    }
                                });
                            }
                        });
                    }
                });
            });

            $('.menu .menu__list').append(btn);
        }
    }

    // Запит до OpenRouter з примусом до JSON
    function askAI(query) {
        var apiKey = Lampa.Storage.get('ai_search_api_key');
        var model = Lampa.Storage.get('ai_search_model') || 'google/gemini-2.0-flash-lite-preview-02-05:free';
        var limit = Lampa.Storage.get('ai_search_limit') || 15;

        // Строгий промпт, як у плагіні-прикладі
        var prompt = 'Запит: "' + query + '"\n' +
            'Запропонуй рівно ' + limit + ' фільмів/серіалів.\n' +
            'Формат СУВОРО JSON: {"recommendations":[{"title":"Назва","year":2023}]}\n' +
            'ТОЛЬКО JSON, без жодного тексту.';

        return new Promise(function(resolve) {
            $.ajax({
                url: 'https://openrouter.ai/api/v1/chat/completions',
                type: 'POST',
                timeout: 60000, // 60 секунд на "подумати"
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/lampa-app',
                    'X-Title': 'Lampa AI Search'
                },
                data: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "Ти кіноексперт. Відповідай ТІЛЬКИ валідним JSON." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" } // Змушуємо OpenRouter віддати JSON
                }),
                success: function(response) {
                    if (response && response.choices && response.choices.length > 0) {
                        var rawText = response.choices[0].message.content;
                        var parsed = parseJsonFromResponse(rawText);
                        var recs = extractRecommendations(parsed);
                        
                        if (recs.length > 0) {
                            resolve(recs);
                        } else {
                            Lampa.Noty.show('Помилка: ШІ не зміг сформувати список.');
                            resolve([]);
                        }
                    } else {
                        Lampa.Noty.show('Порожня відповідь від сервера.');
                        resolve([]);
                    }
                },
                error: function(jqXHR, textStatus) {
                    var status = jqXHR.status;
                    if (textStatus === 'timeout') Lampa.Noty.show('Помилка: ШІ думає занадто довго.');
                    else if (status === 429) Lampa.Noty.show('Помилка 429: Сервер AI перевантажений.');
                    else Lampa.Noty.show('Помилка ' + status + '. Див. консоль.');
                    
                    resolve(null);
                }
            });
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });

    if (Lampa.Manifest) Lampa.Manifest.plugins = manifest;
})();
