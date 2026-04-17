(function () {
    'use strict';

    var PLUGIN_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>';

    var pluginManifest = {
        type: 'other',
        version: 1.0,
        name: 'AI Assistant',
        description: 'Інтелектуальний помічник на базі Google Gemini: Факти, рекомендації, настрій.',
        author: '@bodya_elven',
        icon: PLUGIN_ICON
    };

    // Реєстрація маніфесту в Lampa (якщо підтримується поточною версією)
    if (window.Lampa && Lampa.Manifest) {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
        Lampa.Manifest.plugins['ai_assistant'] = pluginManifest;
    }

    var TARGET_MODEL = 'gemini-2.0-flash';
    var STORAGE_KEY = 'google_native_key_v1';
    
    // Глобальне сховище для результатів, щоб Lampa могла їх відрендерити як сторінку
    window.ai_cached_results = [];

    // Додаємо власне джерело даних для відображення згенерованих списків
    if (window.Lampa && Lampa.Api) {
        Lampa.Api.sources.ai_list_source = {
            list: function(params, oncomplite) {
                // Віддаємо закешовані результати (одна сторінка, бо AI видає одразу список)
                oncomplite({ results: window.ai_cached_results, total_pages: 1 });
            }
        };
    }

    function AIAssistantPlugin() {
        var _this = this;

        this.init = function () {
            if (!Lampa.Listener) return;

            // Налаштування в меню
            this.setupSettings();

            // Додаємо кнопку в картку фільму
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'complete') {
                    var card = e.data.movie;
                    if (card && card.id) {
                        var render = e.object.activity.render();
                        _this.drawButton(render, card);
                    }
                }
            });

            // Стилі для кнопки та модалки
            $('<style>').prop('type', 'text/css').html(
                '.button--ai-assist { display: flex !important; align-items: center; justify-content: center; gap: 7px; } ' + 
                '.button--ai-assist svg { width: 1.6em; height: 1.6em; margin: 0 !important; color: #0cf; } ' +
                '.ai-facts-list { padding: 10px 20px; font-size: 1.1em; line-height: 1.5; } ' +
                '.ai-facts-list b { color: #0cf; display: inline-block; margin-bottom: 5px; } ' +
                '.ai-facts-list .fact-item { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }'
            ).appendTo('head');
        };

        this.setupSettings = function() {
            Lampa.SettingsApi.addComponent({ component: 'ai_assistant_cfg', name: 'AI Асистент', icon: PLUGIN_ICON });
            Lampa.SettingsApi.addParam({ 
                component: 'ai_assistant_cfg', 
                param: { name: 'ai_key_trigger', type: 'trigger' }, 
                field: { name: 'API Ключ (Google Gemini)' }, 
                onRender: function(item) {
                    var val = Lampa.Storage.get(STORAGE_KEY, '');
                    item.find('.settings-param__value').text(val ? 'Встановлено' : 'Немає').css('color', val ? '#4b5':'#f55');
                    item.on('hover:enter', function() {
                        Lampa.Input.edit({ title: 'Google Gemini API Key', value: val, free: true, nosave: true }, function(v) { 
                            if(v){ 
                                Lampa.Storage.set(STORAGE_KEY, v.trim()); 
                                item.find('.settings-param__value').text('OK').css('color', '#4b5'); 
                            } 
                        });
                    });
                }
            });
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_result_count', type: 'select', values: { '10': '10', '20': '20', '30': '30' }, default: '20' }, field: { name: 'Кількість рекомендацій' } });
        };

        // UI: Статус завантаження
        var statusBox = null;
        this.updateStatus = function(text) {
            if (!statusBox) {
                var html = '<div id="ai-assist-status" style="position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none;">' +
                           '<div style="display: inline-block; background: rgba(0,0,0,0.9); padding: 15px 25px; border-radius: 50px; border: 1px solid #0cf; box-shadow: 0 5px 20px rgba(0,0,0,0.8); backdrop-filter: blur(10px);">' +
                           '<span class="status-text" style="color: #fff; font-size: 1.2em; font-weight: 500;"></span>' +
                           '</div></div>';
                $('body').append(html);
                statusBox = $('#ai-assist-status');
            }
            statusBox.find('.status-text').text(text);
            statusBox.fadeIn(200);
        };
        this.hideStatus = function() { if(statusBox) statusBox.fadeOut(500); };

        // Додавання кнопки
        this.drawButton = function (render, card) {
            var container = render.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length || container.find('.button--ai-assist').length) return;

            var btn = $('<div class="full-start__button selector button--ai-assist">' + PLUGIN_ICON + '<span>AI Асистент</span></div>');

            btn.on('hover:enter click', function () {
                _this.openAiMenu(card, btn, render);
            });

            var bookmarkBtn = container.find('.button--book, .button--like, .button--keywords').first();
            if (bookmarkBtn.length) bookmarkBtn.before(btn);
            else container.append(btn);
        };

        // Фокус і навігація
        this.returnFocus = function(btnElement, renderContainer, prevController) {
            if (Lampa.Activity.active() && Lampa.Activity.active().activity) {
                Lampa.Activity.active().activity.toggle();
            } else if (prevController) {
                Lampa.Controller.toggle(prevController);
            }

            if (!Lampa.Platform.is('touch') && btnElement && renderContainer) {
                Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]);
            }
        };

        // Головне AI Меню
        this.openAiMenu = function(card, btnElement, renderContainer) {
            var controllerName = Lampa.Controller.enabled().name;
            var items = [
                { title: 'Рекомендації (Схоже)', action: 'recommendations' },
                { title: 'Маловідомі факти', action: 'facts' },
                { title: 'По настрою', action: 'mood' }
            ];

            Lampa.Select.show({
                title: 'AI Асистент',
                items: items,
                onSelect: function (item) {
                    if (item.action === 'facts') _this.generateFacts(card, btnElement, renderContainer, controllerName);
                    else if (item.action === 'recommendations') _this.generateRecommendations(card, btnElement, renderContainer, controllerName);
                    else if (item.action === 'mood') _this.openMoodMenu(card, btnElement, renderContainer, controllerName);
                },
                onBack: function () {
                    _this.returnFocus(btnElement, renderContainer, controllerName);
                }
            });
        };

        // Меню Настроїв
        this.openMoodMenu = function(card, btnElement, renderContainer, prevController) {
            var items = [
                { title: 'Посміятися (Комедія)', mood: 'Комедія, смішне, легке' },
                { title: 'Поплакати (Драма)', mood: 'Драма, сльози, емоційне' },
                { title: 'Полоскотати нерви (Трилер)', mood: 'Трилер, напруга, несподівані повороти' },
                { title: 'Натхнення (Мотивація)', mood: 'Мотивація, досягнення цілей, натхнення' },
                { title: 'Подумати (Детектив)', mood: 'Детектив, головоломка, розслідування' },
                { title: 'Пошук пригод', mood: 'Пригоди, епік, фентезі, екшен' }
            ];

            Lampa.Select.show({
                title: 'Оберіть настрій',
                items: items,
                onSelect: function (item) {
                    _this.generateMoodList(card, item, btnElement, renderContainer, prevController);
                },
                onBack: function () {
                    _this.openAiMenu(card, btnElement, renderContainer); // Повертаємось на рівень вище
                }
            });
        };

        // --- ЛОГІКА AI ---

        this.askGemini = function(prompt, onSuccess, onError) {
            var keys = Lampa.Storage.get(STORAGE_KEY, '').split(',');
            if (!keys[0]) {
                Lampa.Noty.show('Не задано API ключ Google');
                if(onError) onError();
                return;
            }
            
            var key = keys[0].trim();
            var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + TARGET_MODEL + ':generateContent?key=' + key;

            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                success: function(d) {
                    if (d.candidates && d.candidates[0] && d.candidates[0].content) {
                        onSuccess(d.candidates[0].content.parts[0].text);
                    } else {
                        if(onError) onError('Порожня відповідь від AI');
                    }
                },
                error: function(e) {
                    if(onError) onError('Помилка мережі або API');
                }
            });
        };

        this.parseJsonSafe = function(text) {
            try {
                var cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                var start = cleanText.indexOf('[');
                var end = cleanText.lastIndexOf(']');
                if (start !== -1 && end !== -1) {
                    return JSON.parse(cleanText.substring(start, end + 1));
                }
                return JSON.parse(cleanText);
            } catch (e) { return null; }
        };

        // 1. Факти
        this.generateFacts = function(card, btnElement, renderContainer, prevController) {
            var title = card.name || card.title || card.original_name || card.original_title;
            var year = (card.release_date || card.first_air_date || '').substring(0, 4);
            
            _this.updateStatus('🤖 Шукаю цікаві факти про "' + title + '"...');

            var prompt = 'Act as a movie expert. Write 5 interesting and little-known facts about the movie/series "' + title + '" (' + year + ') in Ukrainian. ' +
                         'Return strictly a JSON array with no markdown: [{"title": "Короткий заголовок", "text": "Детальний опис факту"}].';

            _this.askGemini(prompt, function(responseText) {
                _this.hideStatus();
                var facts = _this.parseJsonSafe(responseText);
                
                if (!facts || !Array.isArray(facts)) {
                    Lampa.Noty.show('Помилка обробки відповіді від AI');
                    _this.returnFocus(btnElement, renderContainer, prevController);
                    return;
                }

                var html = $('<div class="ai-facts-list"></div>');
                facts.forEach(function(f) {
                    html.append('<div class="fact-item"><b>' + f.title + '</b><br><span>' + f.text + '</span></div>');
                });

                Lampa.Modal.show({
                    title: 'Факти: ' + title,
                    html: html,
                    size: 'large',
                    onBack: function() {
                        Lampa.Modal.close();
                        _this.returnFocus(btnElement, renderContainer, prevController);
                    }
                });

            }, function(err) {
                _this.hideStatus();
                Lampa.Noty.show(err || 'Помилка AI');
                _this.returnFocus(btnElement, renderContainer, prevController);
            });
        };

        // 2. Рекомендації та Настрої (загальна логіка)
        this.fetchAiMovieList = function(prompt, pageTitle, btnElement, renderContainer, prevController) {
            _this.updateStatus('🤖 Аналізую та підбираю контент...');

            _this.askGemini(prompt, function(responseText) {
                var list = _this.parseJsonSafe(responseText);
                if (!list || !Array.isArray(list)) {
                    _this.hideStatus();
                    Lampa.Noty.show('Помилка обробки відповіді від AI');
                    _this.returnFocus(btnElement, renderContainer, prevController);
                    return;
                }

                _this.updateStatus('🤖 Знайдено назви. Шукаю картки в TMDB...');
                
                _this.convertAiListToCards(list, function(results) {
                    _this.hideStatus();
                    if (results.length === 0) {
                        Lampa.Noty.show('AI щось знайшов, але в TMDB цього немає');
                        _this.returnFocus(btnElement, renderContainer, prevController);
                        return;
                    }

                    // Зберігаємо в глобальну змінну для джерела ai_list_source
                    window.ai_cached_results = results;

                    // Відкриваємо сторінку
                    Lampa.Activity.push({
                        url: 'ai_results', // URL ролі не грає, головне source
                        title: pageTitle,
                        component: 'category_full',
                        source: 'ai_list_source',
                        page: 1
                    });
                });

            }, function(err) {
                _this.hideStatus();
                Lampa.Noty.show(err || 'Помилка AI');
                _this.returnFocus(btnElement, renderContainer, prevController);
            });
        };

        this.generateRecommendations = function(card, btnElement, renderContainer, prevController) {
            var title = card.name || card.title || card.original_name || card.original_title;
            var year = (card.release_date || card.first_air_date || '').substring(0, 4);
            var limit = parseInt(Lampa.Storage.get('ai_result_count', '20'));

            var prompt = 'Act as a movie expert. Suggest ' + limit + ' distinct movies or TV series similar in vibe, style, and themes to "' + title + '" (' + year + '). ' +
                         'Return strictly a JSON array with no markdown: [{"ru":"Ukrainian Title","orig":"Original Title","year":Year}].';

            _this.fetchAiMovieList(prompt, 'Рекомендації: ' + title, btnElement, renderContainer, prevController);
        };

        this.generateMoodList = function(card, moodItem, btnElement, renderContainer, prevController) {
            var title = card.name || card.title || card.original_name || card.original_title;
            var limit = parseInt(Lampa.Storage.get('ai_result_count', '20'));

            var prompt = 'Act as a movie expert. Suggest ' + limit + ' distinct movies or TV series that match the mood "' + moodItem.mood + '" ' +
                         'and might appeal to a fan of "' + title + '". ' +
                         'Return strictly a JSON array with no markdown: [{"ru":"Ukrainian Title","orig":"Original Title","year":Year}].';

            _this.fetchAiMovieList(prompt, 'Настрій: ' + moodItem.title, btnElement, renderContainer, prevController);
        };

        // --- TMDB Обробка (З попереднього файлу) ---
        var GENRES_MAP = {28:"Бойовик",12:"Пригоди",16:"Мультфільм",35:"Комедія",80:"Кримінал",99:"Документальний",18:"Драма",10751:"Сімейний",14:"Фентезі",36:"Історія",27:"Жахи",10402:"Музика",9648:"Детектив",10749:"Мелодрама",878:"Фантастика",10770:"Телефільм",53:"Трилер",10752:"Військовий",37:"Вестерн"};

        this.buildSafeCard = function(item, type) {
            if (!item || !item.id || !item.backdrop_path) return null; 

            var card = {
                id: item.id,
                source: 'tmdb',
                media_type: (type === 'cartoon') ? 'movie' : (item.media_type || type),
                ready: true,
                title: String(item.title || item.name || 'Без назви'),
                original_title: String(item.original_title || item.original_name || item.title || item.name || ''),
                overview: String(item.overview || ''),
                release_date: String(item.release_date || item.first_air_date || '2000-01-01'),
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                vote_average: parseFloat(item.vote_average || 0),
                vote_count: parseInt(item.vote_count || 0),
                genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
                production_countries: [],
                origin_country: item.origin_country || []
            };

            card.genres = card.genre_ids.length ? card.genre_ids.map(function(id) { return { id: id, name: GENRES_MAP[id] || 'Жанр' }; }) : [{ id: 0, name: 'Інше' }];
            return card;
        };

        this.convertAiListToCards = function(list, onComplete) {
            var results = [];
            var queue = list.slice();
            var active = 0;
            var processed = 0;
            var total = queue.length;

            function next() {
                if (!queue.length && active === 0) {
                    onComplete(results);
                    return;
                }
                if (!queue.length || active >= 3) return; // Максимум 3 паралельні запити

                var item = queue.shift();
                active++;

                var qTmdb = item.orig || item.original || item.ru;
                var url = "search/multi?query=" + encodeURIComponent(qTmdb) + "&api_key=" + Lampa.TMDB.key() + "&language=uk-UA";

                Lampa.Network.silent(Lampa.TMDB.api(url), function(t) {
                    processed++;
                    _this.updateStatus('🤖 TMDB: ' + results.length + ' знайдено (' + processed + '/' + total + ')');
                    
                    if (t.results && t.results[0]) {
                        // Беремо найперший результат
                        var best = t.results[0];
                        if (best.media_type === 'movie' || best.media_type === 'tv') {
                            var c = _this.buildSafeCard(best, best.media_type);
                            if (c) results.push(c);
                        }
                    }
                    active--; next();
                }, function() {
                    processed++; active--; next();
                });
            }
            next();
        };
    }

    // Запуск плагіна
    if (!window.plugin_ai_assistant_instance) {
        window.plugin_ai_assistant_instance = new AIAssistantPlugin();
        if (window.appready) {
            window.plugin_ai_assistant_instance.init();
        } else {
            Lampa.Listener.follow('app', function(e) { 
                if (e.type == 'ready') window.plugin_ai_assistant_instance.init(); 
            });
        }
        console.log('AI Assistant Plugin Loaded!');
    }
})();
