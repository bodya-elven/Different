(function () {
    'use strict';

    var PLUGIN_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.cls-left{fill:currentColor;fill-rule:evenodd;}.cls-right{fill:#a0a0a0;fill-rule:evenodd;}</style><g><polygon class="cls-right" points="16.64 15.13 17.38 13.88 20.91 13.88 22 12 19.82 8.25 16.75 8.25 15.69 6.39 14.5 6.39 14.5 5.13 16.44 5.13 17.5 7 19.09 7 16.9 3.25 12.63 3.25 12.63 8.25 14.36 8.25 15.09 9.5 12.63 9.5 12.63 12 14.89 12 15.94 10.13 18.75 10.13 19.47 11.38 16.67 11.38 15.62 13.25 12.63 13.25 12.63 17.63 16.03 17.63 15.31 18.88 12.63 18.88 12.63 20.75 16.9 20.75 20.18 15.13 18.09 15.13 17.36 16.38 14.5 16.38 14.5 15.13 16.64 15.13"/><polygon class="cls-left" points="7.36 15.13 6.62 13.88 3.09 13.88 2 12 4.18 8.25 7.25 8.25 8.31 6.39 9.5 6.39 9.5 5.13 7.56 5.13 6.5 7 4.91 7 7.1 3.25 11.38 3.25 11.38 8.25 9.64 8.25 8.91 9.5 11.38 9.5 11.38 12 9.11 12 8.06 10.13 5.25 10.13 4.53 11.38 7.33 11.38 8.38 13.25 11.38 13.25 11.38 17.63 7.97 17.63 8.69 18.88 11.38 18.88 11.38 20.75 7.1 20.75 3.82 15.13 5.91 15.13 6.64 16.38 9.5 16.38 9.5 15.13 7.36 15.13"/></g></svg>';

    var STORAGE_KEY = 'google_native_key_v1';
    window.ai_pagination = { base_prompt: '', exclude_list: [], preloaded_results: null, preloaded_raw_list: null, is_loading: false, is_preloading: false };
    window.ai_cached_results = [];
    window.ai_active_controller = null;

    if (!window.ai_push_patched) {
        var originalPush = Lampa.Activity.push;
        Lampa.Activity.push = function(obj) {
            var card = obj.card || obj.movie;
            if (card && card.is_load_more) {
                if (window.plugin_ai_assistant_instance) window.plugin_ai_assistant_instance.loadMore(Lampa.Activity.active());
                return;
            }
            originalPush.apply(Lampa.Activity, arguments);
        };
        window.ai_push_patched = true;
    }

    if (window.Lampa && Lampa.Api) {
        Lampa.Api.sources.ai_assistant_list = {
            list: function(params, oncomplite) { oncomplite({ results: window.ai_cached_results, total_pages: 1 }); }
        };
    }

    function AIAssistantPlugin() {
        var _this = this;
        var statusBox = null;

        this.init = function () {
            this.setupSettings();
            this.injectStyles();
            this.setupGlobalSearch();
            
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'complete') {
                    _this.drawButton(e.object.activity.render(), e.data.movie);
                    _this.preloadTags(e.data.movie);
                }
            });

            Lampa.Listener.follow('card', function(e) {
                if (e.action == 'render' && e.card) {
                    if (e.card.is_load_more) {
                        e.element.attr('data-id', 'ai_load_more');
                        e.element.find('.card__title, .card__age, .item__title, .item__age, .card__vote, .card__icons').hide();
                    } else if (e.card.id) {
                        e.element.attr('data-id', e.card.id);
                    }
                }
            });
        };

        this.getTMDBDetails = function(card, callback) {
            var method = (card.name || card.original_name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '?api_key=' + Lampa.TMDB.key() + '&language=en-US&append_to_response=credits');
            
            Lampa.Network.silent(url, function(res) {
                var overview = (res.overview || '').replace(/"/g, "'").replace(/\n/g, ' ');
                var leadActor = 'unknown';
                var director = '';
                var topCast = [];
                if (res.credits && res.credits.cast && res.credits.cast.length > 0) {
                    leadActor = res.credits.cast[0].name;
                    topCast = res.credits.cast.slice(0, 5).map(function(c) { return c.name; });
                }
                if (res.credits && res.credits.crew) {
                    var dirObj = res.credits.crew.filter(function(c) { return c.job === 'Director'; })[0];
                    if (dirObj) director = dirObj.name;
                }
                callback({ overview: overview, leadActor: leadActor, director: director, topCast: topCast });
            }, function() {
                callback({ overview: '', leadActor: 'unknown', director: '', topCast: [] });
            });
        };

        this.preloadTags = function(card) {
            if (card.ai_translated_tags !== undefined) return;
            card.ai_translated_tags = null; 
            
            var method = (card.original_name || card.name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '/keywords?api_key=' + Lampa.TMDB.key());

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (resp) {
                    var tags = resp.keywords || resp.results || [];
                    if (tags.length > 0) {
                        _this.translateTags(tags, function(translatedTags) {
                            card.ai_translated_tags = translatedTags;
                        });
                    } else {
                        card.ai_translated_tags = [];
                    }
                }
            });
        };
        
        this.setupGlobalSearch = function() {
            var searchSource = {
                title: 'AI Пошук',
                search: function (params, done) {
                    var q = decodeURIComponent(params.query || '').trim().toLowerCase();
                    var limit = Lampa.Storage.get('ai_result_count', '20');
                    if (!q) return done([]);
                    var filter = (q.indexOf('фільм') > -1) ? 'strictly only movies' : (q.indexOf('серіал') > -1 ? 'strictly only TV series' : 'movies and TV series');
                    var p = 'Act as a movie expert. Suggest strictly ' + limit + ' ' + filter + ' for query: "' + q + '". Respond ONLY with a valid JSON array: [{"uk":"Назва","orig":"Original Title","year":Year}]. No markdown, no intro text.';
                    
                    window.ai_active_controller = Lampa.Controller.enabled().name;
                    _this.updateStatus('Пошук результатів');
                    _this.askGemini(p, function(text) {
                        var list = _this.parseJsonSafe(text);
                        if (!list) { _this.hideStatus(); return done([]); }
                        _this.processAiList(list, function(results) { _this.hideStatus(); done([{ title: 'AI: ' + q, results: results, total: results.length }]); });
                    }, function() { 
                        done([]); 
                    });
                },
                params: { save: true, lazy: true },
                onSelect: function (p, close) { close(); Lampa.Activity.push({ url: p.element.media_type+'/'+p.element.id, component: 'full', id: p.element.id, method: p.element.media_type, card: p.element, source: 'tmdb' }); }
            };
            setTimeout(function() {
                var s = Lampa.Search.sources ? Lampa.Search.sources() : [];
                if (s.length >= 2) s.splice(2, 0, searchSource); else Lampa.Search.addSource(searchSource);
            }, 1500);
        };

        this.injectStyles = function() {
            if ($('#ai-assistant-styles').length) return;
            $('<style id="ai-assistant-styles">').prop('type', 'text/css').html(
                '.button--ai-assist { display: flex !important; align-items: center; justify-content: center; gap: 1px; } ' + 
                '.button--ai-assist svg { width: 1.9em !important; height: 1.9em !important; margin: 0 !important; } ' +
                '#ai-assist-status { position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none; display: flex; justify-content: center; }' +
                '.ai-toast { display: inline-flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 10px 24px; border-radius: 50px; color: #fff; font-size: 1.1em; position: relative; overflow: hidden; height: 44px; }' +
                '.ai-toast:after { content:""; position:absolute; top:0; left:-100%; width:30%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: ai-shimmer 4s infinite; }' +
                '@keyframes ai-shimmer { to {left:150%} }' +
                '.ai-spinner { width: 22px; height: 22px; border-radius: 50%; border: 3px solid transparent; border-top-color: #fff; animation: ai-rot 0.8s linear infinite, ai-rainbow 3s linear infinite; }' +
                '@keyframes ai-rot { to { transform: rotate(360deg); } }' +
                '@keyframes ai-rainbow { 0%{border-top-color:#fff} 25%{border-top-color:var(--main-color, #0cf)} 50%{border-top-color:#0cf} 75%{border-top-color:#f0f} 100%{border-top-color:#fff} }' +
                '.ai-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.ai-viewer-body { width: 85%; max-width: 900px; height: 80%; background: #121212; display: flex; flex-direction: column; border-radius: 16px; border: 1px solid var(--main-color, #0cf); overflow: hidden; }' +
                '.ai-header { height: 48px; padding: 0 15px; background: #1a1a1a; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.ai-title { font-size: 1.25em; font-weight: bold; }' +
                '.ai-close-btn { width: 32px; height: 32px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-family: sans-serif; cursor: pointer; border: 2px solid transparent; line-height: 0; padding-bottom: 3px; }' +
                '.ai-close-btn.focus { background: #fff; color: #000; outline: none; }' +
                '.ai-content-scroll { flex: 1; overflow-y: auto; padding: 5px 20px 20px 20px; color: #efefef; font-size: 1.25em; line-height: 1.4; }' +
                '.ai-fact-title { color: var(--main-color, #0cf); font-weight: bold; display: block; margin-bottom: 2px; }'
            ).appendTo('head');
        };

        this.drawButton = function (render, card) {
            var container = render.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length || container.find('.button--ai-assist').length) return;
            var btn = $('<div class="full-start__button selector button--ai-assist">' + PLUGIN_ICON + '<span>AI Асистент</span></div>');
            btn.on('hover:enter click', function () { _this.openAiMenu(card, btn, render); });
            var lastBtn = container.find('.selector').last();
            if (lastBtn.length) lastBtn.after(btn); else container.append(btn);
        };

        this.restoreFocus = function(controllerName) {
            Lampa.Controller.toggle(controllerName || 'full');
            setTimeout(function() {
                var act = Lampa.Activity.active();
                // Шукаємо нашу кнопку тільки якщо ми досі в картці фільму
                if (act && act.activity && act.component === 'full') {
                    var rnder = act.activity.render();
                    var btn = rnder.find('.button--ai-assist');
                    if (btn.length) Lampa.Controller.collectionFocus(btn[0], btn.closest('.full-start-new__buttons, .full-start__buttons')[0]);
                }
            }, 50);
        };

        this.openAiMenu = function(card, btnElement, renderContainer, prevCtrl) {
            var controllerName = prevCtrl || Lampa.Controller.enabled().name; 
            var items = [
                { title: 'Рекомендації', action: 'recommendations' },
                { title: 'Добірки за тегами', action: 'tags' },
                { title: 'Цікаві факти', action: 'facts' },
                { title: 'Спільні роботи акторів', action: 'together' }
            ];
            
            if ((card.number_of_seasons && card.number_of_seasons > 1) || card.belongs_to_collection) {
                items.splice(3, 0, { title: 'Стислий переказ', action: 'recap' });
            }

            Lampa.Select.show({
                title: 'AI Асистент',
                items: items,
                onSelect: function (item) {
                    // Даємо Лампі 50мс, щоб вона спокійно закрила своє меню перед нашими діями
                    setTimeout(function() {
                        if (item.action === 'facts') _this.actionFacts(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'together') _this.actionTogether(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'recap') _this.actionRecapMenu(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'recommendations') _this.actionRecommendations(card, btnElement, renderContainer, controllerName);
                        else if (item.action === 'tags') _this.actionTags(card, btnElement, renderContainer, controllerName);
                    }, 50);
                },
                onBack: function () { 
                    _this.restoreFocus(controllerName);
                }
            });
        };

        this.showViewer = function(title, contentHtml, btnElement, renderContainer, controllerName) {
            var viewer = $('<div class="ai-viewer-container"><div class="ai-viewer-body">' +
                                '<div class="ai-header"><div class="ai-title">' + title + '</div><div class="ai-close-btn selector">×</div></div>' +
                                '<div class="ai-content-scroll">' + contentHtml + '</div>' +
                            '</div></div>');
            $('body').append(viewer);
            
            var close = function() { 
                viewer.remove(); 
                _this.restoreFocus(controllerName); // Гарантоване повернення фокусу
            };

            viewer.find('.ai-close-btn').on('click hover:enter', close);
            Lampa.Controller.add('ai_viewer', {
                toggle: function() { Lampa.Controller.collectionSet(viewer); Lampa.Controller.collectionFocus(viewer.find('.ai-close-btn')[0], viewer); },
                up: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() - 100); },
                down: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() + 100); },
                back: close
            });
            Lampa.Controller.toggle('ai_viewer');
        };


        this.actionFacts = function(card, btn, render, ctrl) {
            var t = card.original_title || card.original_name, year = (card.release_date || card.first_air_date || '').slice(0,4);
            var type = (card.name || card.original_name) ? 'TV series' : 'movie';
            
            window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
            _this.updateStatus('Пошук фактів');
            
            _this.getTMDBDetails(card, function(tmdb) {
                var p = 'Provide 6 to 10 little-known interesting facts about the ' + type + ' "' + t + '" (' + year + ') with ' + tmdb.leadActor + ' in the lead role, in Ukrainian. IMPORTANT: This project is already released. Respond ONLY with a valid JSON array: [{"title":"..","text":".."}]. No markdown, no intro text.';
                
                _this.askGemini(p, function(text) {
                    _this.hideStatus();
                    // ЗАХИСТ: Якщо юзер вже вийшов з картки - просто глушимо відповідь
                    if (Lampa.Activity.active().component !== 'full') return; 
                    
                    var data = _this.parseJsonSafe(text);
                    if (!data) { 
                        Lampa.Noty.show('Помилка обробки результату'); 
                        if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                        return; 
                    }
                    var html = (data || []).map(function(f){ return '<div style="margin-bottom:12px"><span class="ai-fact-title">'+f.title+'</span>'+f.text+'</div>'; }).join('');
                    _this.showViewer('Цікаві факти: ' + (card.title || card.name), html, btn, render, ctrl);
                });
            });
        };

        this.actionRecapMenu = function(card, btn, render, ctrl) {
            var items = [];
            if (card.number_of_seasons > 1) { for (var i = 1; i < card.number_of_seasons; i++) items.push({ title: 'Сезон ' + i, type: 'season', value: i }); }
            else if (card.belongs_to_collection) {
                window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
                _this.updateStatus('Збір історії');
                Lampa.Network.silent(Lampa.TMDB.api('collection/' + card.belongs_to_collection.id + '?api_key=' + Lampa.TMDB.key() + '&language=uk-UA'), function(res) {
                    _this.hideStatus();
                    (res.parts || []).forEach(function(p) { if (p.id != card.id) items.push({ title: p.title, type: 'movie', value: p.original_title }); });
                    _this.showRecapSelect(items, card, btn, render, ctrl);
                }, function() {
                    _this.hideStatus();
                    Lampa.Noty.show('Помилка завантаження колекції');
                    if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                });
                return;
            }
            _this.showRecapSelect(items, card, btn, render, ctrl);
        };

        this.showRecapSelect = function(items, card, btn, render, ctrl) {
            Lampa.Select.show({
                title: 'Що переказати?',
                items: items,
                onSelect: function(item) {
                    var t = card.original_title || card.original_name, year = (card.release_date || card.first_air_date || '').slice(0,4);
                    window.ai_active_controller = Lampa.Controller.enabled().name;
                    _this.updateStatus('Підготовка переказу');
                    
                    var p = 'Provide a 10-point brief recap in Ukrainian of "' + item.title + '" from the franchise "' + t + '" (' + year + '). Respond ONLY with a valid JSON array: [{"point":".."}]. No markdown, no intro text.';
                    
                    _this.askGemini(p, function(text) {
                        _this.hideStatus();
                        // ЗАХИСТ ВІД ПРИВИДІВ
                        if (Lampa.Activity.active().component !== 'full') return; 
                        
                        var data = _this.parseJsonSafe(text);
                        if (!data) { 
                            Lampa.Noty.show('Помилка обробки результату'); 
                            if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                            return; 
                        }
                        var html = (data || []).map(function(i){ return '<div style="margin-bottom:10px">• '+i.point+'</div>'; }).join('');
                        _this.showViewer('Переказ: ' + item.title, html, btn, render, ctrl);
                    });
                },
                onBack: function() { _this.openAiMenu(card, btn, render, ctrl); }
            });
        };


        this.actionTogether = function(card, btn, render, ctrl) {
            var limit = Lampa.Storage.get('ai_result_count', '20');
            window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
            _this.updateStatus('Аналіз складу');
            
            _this.getTMDBDetails(card, function(tmdb) {
                var names = tmdb.topCast.slice();
                if (tmdb.director) names.unshift('Director: ' + tmdb.director);
                if (!names.length) {
                    _this.hideStatus();
                    Lampa.Noty.show('Склад невідомий');
                    if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                    return;
                }
                
                var p = 'Name strictly ' + limit + ' movies/TV shows where these specific actors and directors worked together: ' + names.join(', ') + '. Priority to director and first 5 names.';
                _this.fetchList(p, 'Спільні проєкти', card, btn, render, ctrl);
            });
        };

        this.actionRecommendations = function(card, btn, render, ctrl) {
            var limit = Lampa.Storage.get('ai_result_count', '20'), t = card.original_title || card.original_name, year = (card.release_date || card.first_air_date || '').slice(0,4);
            window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
            _this.updateStatus('Аналіз фільму');
            
            _this.getTMDBDetails(card, function(tmdb) {
                var p = 'Suggest strictly ' + limit + ' movies or TV series that closely match the vibe, genre, and plot of "' + t + '" (' + year + ') with ' + tmdb.leadActor + ' in the lead role and the following plot description: "' + tmdb.overview + '".';
                _this.fetchList(p, 'Рекомендації', card, btn, render, ctrl);
            });
        };

        this.actionTags = function(card, btn, render, ctrl) {
            if (card.ai_translated_tags && card.ai_translated_tags.length > 0) {
                _this.showTagsMenu(card.ai_translated_tags, card, btn, render, ctrl);
            } 
            else if (card.ai_translated_tags && card.ai_translated_tags.length === 0) {
                Lampa.Noty.show('Теги відсутні');
                _this.openAiMenu(card, btn, render, ctrl);
            } 
            else {
                window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
                _this.updateStatus('Завантаження тегів');
                var method = (card.original_name || card.name) ? 'tv' : 'movie';
                var url = Lampa.TMDB.api(method + '/' + card.id + '/keywords?api_key=' + Lampa.TMDB.key());

                $.ajax({
                    url: url,
                    dataType: 'json',
                    success: function (resp) {
                        var tags = resp.keywords || resp.results || [];
                        if (tags.length > 0) {
                            _this.translateTags(tags, function(translatedTags) {
                                card.ai_translated_tags = translatedTags;
                                _this.hideStatus();
                                _this.showTagsMenu(translatedTags, card, btn, render, ctrl);
                            });
                        } else {
                            card.ai_translated_tags = [];
                            _this.hideStatus();
                            Lampa.Noty.show('Теги відсутні');
                            _this.openAiMenu(card, btn, render, ctrl);
                        }
                    },
                    error: function() { 
                        _this.hideStatus(); 
                        Lampa.Noty.show('Помилка завантаження тегів'); 
                        if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                    }
                });
            }
        };

        this.translateTags = function (tags, callback) {
            var lang = Lampa.Storage.get('language', 'uk');
            tags.forEach(function(tag) { tag.orig_name = tag.name; });
            if (lang !== 'uk') return callback(tags);

            var tagsWithContext = tags.map(function(t) { return "Movie tag: " + t.name; });
            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=uk&dt=t&q=' + encodeURIComponent(tagsWithContext.join(' ||| '));

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (result) {
                    try {
                        var translatedText = '';
                        if (result && result[0]) result[0].forEach(function(item) { if (item[0]) translatedText += item[0]; });
                        var translatedArray = translatedText.split('|||');
                        tags.forEach(function(tag, index) {
                            if (translatedArray[index]) {
                                tag.name = translatedArray[index]
                                    .replace(/позначка до фільму[:\s]*/gi, '')
                                    .replace(/тег до фільму[:\s]*/gi, '')
                                    .replace(/тег фільму[:\s]*/gi, '')
                                    .replace(/movie tag[:\s]*/gi, '')
                                    .replace(/^[:\s\-]*/, '')
                                    .trim();
                            }
                        });
                        callback(tags);
                    } catch (e) { callback(tags); }
                },
                error: function () { callback(tags); }
            });
        };

        this.showTagsMenu = function(tags, card, btn, render, ctrl) {
            var items = tags.map(function(tag) {
                return { title: tag.name.charAt(0).toUpperCase() + tag.name.slice(1), tag_data: tag };
            });

            Lampa.Select.show({
                title: 'Оберіть тег',
                items: items,
                onSelect: function (item) {
                    var limit = Lampa.Storage.get('ai_result_count', '20');
                    var p = 'Suggest strictly ' + limit + ' movies or TV series that are strongly associated with the specific TMDB keyword: "' + item.tag_data.orig_name + '".';
                    _this.fetchList(p, 'Тег: ' + item.title, card, btn, render, ctrl);
                },
                onBack: function () { _this.openAiMenu(card, btn, render, ctrl); }
            });
        };

        this.askGemini = function(p, onSuccess, onError, isSilent) {
            var key = Lampa.Storage.get(STORAGE_KEY, '').split(',')[0];
            if (!key) { 
                if (!isSilent) Lampa.Noty.show('API Ключ не задано'); 
                if(onError) onError(); 
                return; 
            }
            
            var targetModel = Lampa.Storage.get('ai_model', 'gemini-2.5-flash-lite');
            var payload = { contents: [{ parts: [{ text: p }] }] };

            fetch('https://generativelanguage.googleapis.com/v1beta/models/' + targetModel + ':generateContent?key=' + key.trim(), {
                method: "POST", body: JSON.stringify(payload)
            }).then(function(r) { 
                if (r.status === 503) {
                    throw new Error('503 Service Unavailable');
                }
                return r.json(); 
            }).then(function(d) {
                if (d.error) { 
                    throw new Error(d.error.message); 
                }
                else if (d.candidates && d.candidates[0].content) onSuccess(d.candidates[0].content.parts[0].text);
                else {
                    throw new Error('Блокування або пуста відповідь');
                }
            }).catch(function(e) { 
                if (!isSilent) {
                    _this.hideStatus(); 
                    var msg = (e.message === '503 Service Unavailable') ? 'Сервер перевантажено (503)' : 'Помилка: ' + e.message;
                    Lampa.Noty.show(msg); 
                    if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                }
                if(onError) onError(e.message); 
            });
        };

        this.parseJsonSafe = function(text) {
            try {
                var s = text.indexOf('['), e = text.lastIndexOf(']');
                if (s !== -1 && e !== -1 && e > s) {
                    return JSON.parse(text.substring(s, e + 1));
                }
                var clean = text.trim().replace(/^```json/gi, '').replace(/```$/g, '').trim();
                return JSON.parse(clean);
            } catch (e) { return null; }
        };

        this.processAiList = function(list, callback) {
            var results = [], processed = 0, ids = new Set();
            if (!list || !list.length) return callback(results);
            
            list.forEach(function(item) {
                var q = encodeURIComponent(item.orig || item.uk);
                Lampa.Network.silent(Lampa.TMDB.api('search/multi?query=' + q + '&api_key=' + Lampa.TMDB.key() + '&language=uk-UA'), function(res) {
                    processed++;
                    if (res.results && res.results[0]) {
                        var b = res.results[0];
                        if (b.media_type !== 'person' && !ids.has(b.id)) { ids.add(b.id); b.source = 'tmdb'; results.push(b); }
                    }
                    if (processed === list.length) callback(results);
                });
            });
        };

        this.fetchNextPageData = function(callback, isSilent) {
            var limit = Lampa.Storage.get('ai_result_count', '20');
            var exclusions = window.ai_pagination.exclude_list.slice(-50).join(', ');
            var p = window.ai_pagination.base_prompt + ' IMPORTANT: You MUST EXCLUDE these titles from your suggestions: ' + exclusions + '. Provide strictly NEW ' + limit + ' suggestions. Respond ONLY with a valid JSON array: [{"uk":"Назва","orig":"Original Title","year":Year}]. No markdown, no intro text.';

            _this.askGemini(p, function(text) {
                var list = _this.parseJsonSafe(text);
                if (!list || !list.length) { callback(null, null); return; }
                _this.processAiList(list, function(results) {
                    callback(list, results);
                });
            }, function() { callback(null, null); }, isSilent);
        };

        this.preloadNextPage = function() {
            if (window.ai_pagination.is_preloading) return;
            window.ai_pagination.is_preloading = true;
            _this.fetchNextPageData(function(list, results) {
                if (results && results.length) {
                    window.ai_pagination.preloaded_results = results;
                    window.ai_pagination.preloaded_raw_list = list;
                }
                window.ai_pagination.is_preloading = false;
            }, true);
        };

        this.loadMore = function(activeActivity) {
            if (window.ai_pagination.is_loading) return;
            window.ai_active_controller = Lampa.Controller.enabled().name;
            
            var renderResults = function(results, rawList) {
                rawList.forEach(function(i) { window.ai_pagination.exclude_list.push(i.orig || i.uk); });
                window.ai_pagination.preloaded_results = null;
                window.ai_pagination.preloaded_raw_list = null;
                window.ai_pagination.is_loading = false;
                _this.hideStatus();
                
                if (!results.length) { 
                    Lampa.Noty.show('Більше нічого не знайдено'); 
                    if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                    return; 
                }

                window.ai_cached_results = window.ai_cached_results.filter(function(r) { return !r.is_load_more; });
                window.ai_cached_results = window.ai_cached_results.concat(results);
                window.ai_cached_results.push({ 
                    id: 'ai_load_more', is_load_more: true, name: '',
                    poster: 'https://bodya-elven.github.io/different/icons/more.webp',
                    img: 'https://bodya-elven.github.io/different/icons/more.webp'
                });

                if (activeActivity && activeActivity.activity) {
                    var act = activeActivity.activity;
                    var rnder = act.render();
                    
                    var oldBtn = rnder.find('.item[data-id="ai_load_more"]');
                    if (oldBtn.length) oldBtn.remove();
                    
                    var items_to_append = results.slice();
                    items_to_append.push({ 
                        id: 'ai_load_more', is_load_more: true, name: '',
                        poster: 'https://bodya-elven.github.io/different/icons/more.webp',
                        img: 'https://bodya-elven.github.io/different/icons/more.webp' 
                    });

                    if (act.append) {
                        act.append(items_to_append);
                        setTimeout(function() {
                            var firstNewId = results[0].id;
                            var cardToFocus = rnder.find('.item[data-id="' + firstNewId + '"]');
                            if (cardToFocus.length) Lampa.Controller.collectionFocus(cardToFocus[0], rnder[0]);
                        }, 100);
                    } else {
                        Lampa.Activity.replace({ url: 'ai_assistant_list', title: activeActivity.title, component: 'category_full', source: 'ai_assistant_list', page: 1 });
                    }
                }
                setTimeout(function() { _this.preloadNextPage(); }, 1000);
            };

            if (window.ai_pagination.preloaded_results) {
                window.ai_pagination.is_loading = true;
                renderResults(window.ai_pagination.preloaded_results, window.ai_pagination.preloaded_raw_list);
            } else if (window.ai_pagination.is_preloading) {
                window.ai_pagination.is_loading = true;
                _this.updateStatus('Підбір результатів...');
                var waitInterval = setInterval(function() {
                    if (window.ai_pagination.preloaded_results) {
                        clearInterval(waitInterval);
                        renderResults(window.ai_pagination.preloaded_results, window.ai_pagination.preloaded_raw_list);
                    } else if (!window.ai_pagination.is_preloading) {
                        clearInterval(waitInterval);
                        window.ai_pagination.is_loading = false;
                        _this.hideStatus();
                        Lampa.Noty.show('Помилка підбору, спробуйте ще');
                        if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                    }
                }, 500);
            } else {
                window.ai_pagination.is_loading = true;
                _this.updateStatus('Підбір результатів...');
                _this.fetchNextPageData(function(list, results) {
                    if(results && results.length) renderResults(results, list);
                    else { 
                        window.ai_pagination.is_loading = false; 
                        _this.hideStatus(); 
                        Lampa.Noty.show('Нічого не знайдено'); 
                        if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                    }
                }, false);
            }
        };

        this.fetchList = function(base_prompt_task, title, card, btn, render, ctrl) {
            window.ai_pagination = { base_prompt: base_prompt_task, exclude_list: [], preloaded_results: null, preloaded_raw_list: null, is_loading: false, is_preloading: false };
            window.ai_cached_results = [];
            window.ai_active_controller = ctrl || Lampa.Controller.enabled().name;
            
            var full_prompt = base_prompt_task + ' Respond ONLY with a valid JSON array: [{"uk":"Назва","orig":"Original Title","year":Year}]. No markdown, no intro text.';

            _this.updateStatus('Підбір результатів');
            _this.askGemini(full_prompt, function(text) {
                var list = _this.parseJsonSafe(text);
                
                // ЗАХИСТ ВІД ПРИВИДІВ: Якщо ми вже вийшли з фільму в меню, відміняємо завантаження
                if (Lampa.Activity.active().component !== 'full') {
                    _this.hideStatus();
                    return; 
                }

                if (!list || !list.length) { 
                    _this.hideStatus(); 
                    Lampa.Noty.show('Нічого не знайдено або помилка парсингу'); 
                    if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                    return; 
                }

                list.forEach(function(i) { window.ai_pagination.exclude_list.push(i.orig || i.uk); });

                _this.processAiList(list, function(results) {
                    _this.hideStatus();
                    // Додаткова перевірка перед пушем нової сторінки
                    if (Lampa.Activity.active().component !== 'full') return; 

                    if (!results.length) { 
                        Lampa.Noty.show('Нічого не знайдено'); 
                        if (window.ai_active_controller) Lampa.Controller.toggle(window.ai_active_controller);
                        return; 
                    }

                    window.ai_cached_results = results;
                    window.ai_cached_results.push({ 
                        id: 'ai_load_more', is_load_more: true, name: '',
                        poster: 'https://bodya-elven.github.io/different/icons/more.webp',
                        img: 'https://bodya-elven.github.io/different/icons/more.webp'
                    });

                    Lampa.Activity.push({ url: 'ai_assistant_list', title: title, component: 'category_full', source: 'ai_assistant_list', page: 1 });
                    
                    setTimeout(function() { _this.preloadNextPage(); }, 1000);
                });
            }, null, false);
        };


        this.updateStatus = function(text) {
            if (!statusBox) {
                $('body').append('<div id="ai-assist-status"><div class="ai-toast"><div class="ai-spinner"></div><span class="status-text"></span></div></div>');
                statusBox = $('#ai-assist-status');
            }
            statusBox.find('.status-text').text(text);
            statusBox.fadeIn(200);
        };
        
        this.hideStatus = function() { 
            if(statusBox) statusBox.fadeOut(500); 
        };

        this.setupSettings = function() {
            Lampa.SettingsApi.addComponent({ component: 'ai_assistant_cfg', name: 'AI Асистент', icon: PLUGIN_ICON });
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_key_trigger', type: 'trigger' }, field: { name: 'API Ключ (Gemini)' }, onRender: function(item) {
                var updateText = function() { var val = Lampa.Storage.get(STORAGE_KEY, ''); item.find('.settings-param__value').text(val ? 'Так' : 'Ні').css('color', val ? '#4b5':'#f55'); };
                updateText();
                item.on('hover:enter', function() { Lampa.Input.edit({ title: 'Введіть ключ', value: Lampa.Storage.get(STORAGE_KEY, ''), free: true }, function(v) { if(v){ Lampa.Storage.set(STORAGE_KEY, v.trim()); updateText(); } }); });
            }});
            
            Lampa.SettingsApi.addParam({ 
                component: 'ai_assistant_cfg', 
                param: { 
                    name: 'ai_model', 
                    type: 'select', 
                    values: { 
                        'gemini-3.1-flash-lite-preview': '3.1 Flash Lite Preview',
                        'gemini-3-flash-preview': '3.0 Flash Preview',
                        'gemini-2.5-flash-lite': '2.5 Flash Lite',
                        'gemini-2.5-flash': '2.5 Flash',
                        'gemini-flash-lite-latest': 'Flash Lite Latest',
                        'gemini-flash-latest': 'Flash Latest'
                    }, 
                    default: 'gemini-2.5-flash-lite' 
                }, 
                field: { name: 'Модель ШІ' } 
            });

            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_result_count', type: 'select', values: { '10':'10','20':'20','30':'30','50':'50' }, default: '20' }, field: { name: 'Кількість результатів' } });
        };
    }

var pluginManifest = {
    type: 'other',
    version: '3.0',
    name: 'AI Асистент',
    description: 'Ваш розумний та швидкий ШІ помічник',
    author: '@bodya_elven',
    icon: PLUGIN_ICON
};

if (Lampa.Manifest && Lampa.Manifest.plugins) {
    Lampa.Manifest.plugins.ai_assistant = pluginManifest;
}

if (!window.plugin_ai_assistant_instance) {
    window.plugin_ai_assistant_instance = new AIAssistantPlugin();
    if (window.appready) window.plugin_ai_assistant_instance.init();
    else Lampa.Listener.follow('app', function(e) { if (e.type == 'ready') window.plugin_ai_assistant_instance.init(); });
}
})();
