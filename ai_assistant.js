(function () {
    'use strict';

    var PLUGIN_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.cls-left{fill:#fff;fill-rule:evenodd;}.cls-right{fill:#e0e0e0;fill-rule:evenodd;}</style><g><polygon class="cls-right" points="16.64 15.13 17.38 13.88 20.91 13.88 22 12 19.82 8.25 16.75 8.25 15.69 6.39 14.5 6.39 14.5 5.13 16.44 5.13 17.5 7 19.09 7 16.9 3.25 12.63 3.25 12.63 8.25 14.36 8.25 15.09 9.5 12.63 9.5 12.63 12 14.89 12 15.94 10.13 18.75 10.13 19.47 11.38 16.67 11.38 15.62 13.25 12.63 13.25 12.63 17.63 16.03 17.63 15.31 18.88 12.63 18.88 12.63 20.75 16.9 20.75 20.18 15.13 18.09 15.13 17.36 16.38 14.5 16.38 14.5 15.13 16.64 15.13"/><polygon class="cls-left" points="7.36 15.13 6.62 13.88 3.09 13.88 2 12 4.18 8.25 7.25 8.25 8.31 6.39 9.5 6.39 9.5 5.13 7.56 5.13 6.5 7 4.91 7 7.1 3.25 11.38 3.25 11.38 8.25 9.64 8.25 8.91 9.5 11.38 9.5 11.38 12 9.11 12 8.06 10.13 5.25 10.13 4.53 11.38 7.33 11.38 8.38 13.25 11.38 13.25 11.38 17.63 7.97 17.63 8.69 18.88 11.38 18.88 11.38 20.75 7.1 20.75 3.82 15.13 5.91 15.13 6.64 16.38 9.5 16.38 9.5 15.13 7.36 15.13"/></g></svg>';

    var TARGET_MODEL = 'gemini-flash-lite-latest';
    var STORAGE_KEY = 'google_native_key_v1';
    window.ai_cached_results = [];

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
                    var p = 'Act as a movie expert. Suggest strictly ' + limit + ' ' + filter + ' for: "' + q + '". Return strictly a JSON array: [{"uk":"Назва","orig":"Original Title","year":Year}].';
                    _this.updateStatus('Пошук результатів');
                    _this.askGemini(p, function(text) {
                        var list = _this.parseJsonSafe(text);
                        if (!list) { _this.hideStatus(); return done([]); }
                        _this.processAiList(list, function(results) { _this.hideStatus(); done([{ title: 'AI: ' + q, results: results, total: results.length }]); });
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
            var tCol = window.look_dynamic_current_hex || 'var(--main-color, #0cf)';
            $('<style id="ai-assistant-styles">').prop('type', 'text/css').html(
                '.button--ai-assist { display: flex !important; align-items: center; justify-content: center; gap: 5px; } ' + 
                '.button--ai-assist svg { width: 1.8em !important; height: 1.8em !important; margin: 0 !important; } ' +
                '#ai-assist-status { position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none; display: flex; justify-content: center; }' +
                '.ai-toast { display: inline-flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 10px 24px; border-radius: 50px; color: #fff; font-size: 1.1em; position: relative; overflow: hidden; height: 44px; }' +
                '.ai-toast:after { content:""; position:absolute; top:0; left:-100%; width:30%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: ai-shimmer 4s infinite; }' +
                '@keyframes ai-shimmer { to {left:150%} }' +
                '.ai-spinner { width: 22px; height: 22px; border-radius: 50%; border: 3px solid transparent; border-top-color: #fff; animation: ai-rot 0.8s linear infinite, ai-rainbow 3s linear infinite; }' +
                '@keyframes ai-rot { to { transform: rotate(360deg); } }' +
                '@keyframes ai-rainbow { 0%{border-top-color:#fff} 25%{border-top-color:'+tCol+'} 50%{border-top-color:#0cf} 75%{border-top-color:#f0f} 100%{border-top-color:#fff} }' +
                '.ai-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.ai-viewer-body { width: 80%; max-width: 800px; height: 70%; background: #121212; display: flex; flex-direction: column; border-radius: 16px; border: 1px solid ' + tCol + '; overflow: hidden; }' +
                '.ai-header { height: 44px; padding: 0 15px; background: #1a1a1a; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.ai-close-btn { width: 32px; height: 32px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; border: 2px solid transparent; line-height: 1; padding: 0; }' +
                '.ai-close-btn.focus { border-color: #fff; background: ' + tCol + '; }' +
                '.ai-content-scroll { flex: 1; overflow-y: auto; padding: 20px; color: #efefef; font-size: 1.15em; line-height: 1.4; }' +
                '.ai-fact-title { color: ' + tCol + '; font-weight: bold; display: block; margin-bottom: 2px; }'
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

        // --- НАВІГАЦІЯ (Логіка keywords.js) ---
        this.openAiMenu = function(card, btnElement, renderContainer) {
            var controllerName = Lampa.Controller.enabled().name; 
            var items = [{ title: 'Рекомендації', action: 'recommendations' }, { title: 'Цікаві факти', action: 'facts' }, { title: 'Спільні проєкти', action: 'together' }];
            if ((card.number_of_seasons && card.number_of_seasons > 1) || card.belongs_to_collection) items.push({ title: 'Стислий переказ', action: 'recap' });

            Lampa.Select.show({
                title: 'AI Асистент',
                items: items,
                onSelect: function (item) {
                    if (item.action === 'facts') _this.actionFacts(card, btnElement, renderContainer, controllerName);
                    else if (item.action === 'together') _this.actionTogether(card, btnElement, renderContainer, controllerName);
                    else if (item.action === 'recap') _this.actionRecapMenu(card, btnElement, renderContainer, controllerName);
                    else if (item.action === 'recommendations') _this.actionRecommendations(card, btnElement, renderContainer, controllerName);
                },
                onBack: function () { 
                    Lampa.Controller.toggle(controllerName); 
                    if (!Lampa.Platform.is('touch')) {
                        setTimeout(function() { Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]); }, 10); 
                    }
                }
            });
        };

        this.showViewer = function(title, contentHtml, btnElement, renderContainer, controllerName) {
            var viewer = $('<div class="ai-viewer-container"><div class="ai-viewer-body">' +
                                '<div class="ai-header"><div class="ai-title">' + title + '</div><div class="ai-close-btn selector">×</div></div>' +
                                '<div class="ai-content-scroll">' + contentHtml + '</div>' +
                            '</div></div>');
            $('body').append(viewer);
            
            // Фікс навігації: при закритті повертаємося в картку фільму
            var close = function() { 
                viewer.remove(); 
                Lampa.Controller.toggle(controllerName);
                if (!Lampa.Platform.is('touch')) {
                    setTimeout(function() { Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]); }, 10);
                }
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

        // --- ЛОГІЧНІ ДІЇ ---
        this.actionFacts = function(card, btn, render, ctrl) {
            var t = card.original_title || card.original_name, year = (card.release_date || card.first_air_date || '').slice(0,4);
            _this.updateStatus('Пошук фактів');
            var p = 'Provide strictly 5 interesting facts about the movie "' + t + '" (' + year + ') in Ukrainian. IMPORTANT: This project is already released. Return strictly a JSON array: [{"title":"..","text":".."}].';
            _this.askGemini(p, function(text) {
                _this.hideStatus();
                var data = _this.parseJsonSafe(text);
                if (!data) return;
                var html = (data || []).map(function(f){ return '<div style="margin-bottom:12px"><span class="ai-fact-title">'+f.title+'</span>'+f.text+'</div>'; }).join('');
                _this.showViewer('Цікаві факти: ' + (card.title || card.name), html, btn, render, ctrl);
            });
        };

        this.actionRecapMenu = function(card, btn, render, ctrl) {
            var items = [];
            if (card.number_of_seasons > 1) { for (var i = 1; i < card.number_of_seasons; i++) items.push({ title: 'Сезон ' + i, type: 'season', value: i }); }
            else if (card.belongs_to_collection) {
                _this.updateStatus('Збір історії');
                Lampa.Network.silent(Lampa.TMDB.api('collection/' + card.belongs_to_collection.id + '?api_key=' + Lampa.TMDB.key() + '&language=uk-UA'), function(res) {
                    _this.hideStatus();
                    (res.parts || []).forEach(function(p) { if (p.id != card.id) items.push({ title: p.title, type: 'movie', value: p.original_title }); });
                    _this.showRecapSelect(items, card, btn, render, ctrl);
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
                    _this.updateStatus('Підготовка переказу');
                    var p = 'Provide a brief recap strictly ' + item.title + ' from "' + t + '" (' + year + ') in Ukrainian. 5-7 points. JSON array: [{"point":".."}] .';
                    _this.askGemini(p, function(text) {
                        _this.hideStatus();
                        var data = _this.parseJsonSafe(text);
                        var html = (data || []).map(function(i){ return '<div style="margin-bottom:10px">• '+i.point+'</div>'; }).join('');
                        _this.showViewer('Переказ: ' + item.title, html, btn, render, ctrl);
                    });
                },
                onBack: function() { _this.openAiMenu(card, btn, render); }
            });
        };

        this.actionTogether = function(card, btn, render, ctrl) {
            var method = (card.name || card.original_name) ? 'tv' : 'movie', limit = Lampa.Storage.get('ai_result_count', '20');
            _this.updateStatus('Аналіз складу');
            Lampa.Network.silent(Lampa.TMDB.api(method + '/' + card.id + '/credits?api_key=' + Lampa.TMDB.key()), function(res) {
                var cast = res.cast || [], crew = res.crew || [], dir = crew.filter(function(p){return p.job==='Director'})[0];
                var names = cast.slice(0, 15).map(function(a){return a.name});
                if(dir) names.push('Director: ' + dir.name);
                var p = 'Name strictly ' + limit + ' movies/TV shows where these people crossed paths: ' + names.join(', ') + '. Priority to director and first 5 names. Return strictly a JSON array: [{"uk":"Назва","orig":"Original Title","year":Year}].';
                _this.fetchList(p, 'Спільні проєкти', card, btn, render, ctrl);
            });
        };

        this.actionRecommendations = function(card, btn, render, ctrl) {
            var limit = Lampa.Storage.get('ai_result_count', '20'), t = card.original_title || card.original_name, year = (card.release_date || card.first_air_date || '').slice(0,4);
            var p = 'Suggest strictly ' + limit + ' movies or TV series similar to "' + t + ' (' + year + ')" in terms of vibe and themes. Return strictly a JSON array: [{"uk":"Назва","orig":"Original Title","year":Year}].';
            _this.fetchList(p, 'Рекомендації', card, btn, render, ctrl);
        };

        // --- CORE API ---
        this.askGemini = function(p, onSuccess) {
            var key = Lampa.Storage.get(STORAGE_KEY, '').split(',')[0];
            if (!key) return Lampa.Noty.show('API Ключ не задано');
            fetch('https://generativelanguage.googleapis.com/v1beta/models/'+TARGET_MODEL+':generateContent?key='+key.trim(), {
                method: "POST", body: JSON.stringify({ contents: [{ parts: [{ text: p }] }] })
            }).then(function(r) { return r.json(); }).then(function(d) {
                if (d.candidates && d.candidates[0].content) onSuccess(d.candidates[0].content.parts[0].text);
            }).catch(function() { _this.hideStatus(); Lampa.Noty.show('Помилка мережі'); });
        };

        this.parseJsonSafe = function(text) {
            try {
                var clean = text.trim().replace(/^```json/gi, '').replace(/```$/g, '').trim();
                var s = clean.indexOf('['), e = clean.lastIndexOf(']');
                return (s !== -1 && e !== -1) ? JSON.parse(clean.substring(s, e + 1)) : JSON.parse(clean);
            } catch (e) { return null; }
        };

        this.processAiList = function(list, callback) {
            var results = [], processed = 0, ids = new Set();
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

        this.fetchList = function(prompt, title, card, btn, render, ctrl) {
            _this.updateStatus('Підбір результатів');
            _this.askGemini(prompt, function(text) {
                var list = _this.parseJsonSafe(text);
                if (!list) { _this.hideStatus(); return; }
                _this.processAiList(list, function(results) {
                    _this.hideStatus();
                    if (!results.length) Lampa.Noty.show('Нічого не знайдено');
                    else { window.ai_cached_results = results; Lampa.Activity.push({ url: 'ai_assistant_list', title: title, component: 'category_full', source: 'ai_assistant_list', page: 1 }); }
                });
            });
        };

        this.updateStatus = function(text) {
            if (!statusBox) {
                $('body').append('<div id="ai-assist-status"><div class="ai-toast"><div class="ai-spinner"></div><span class="status-text"></span></div></div>');
                statusBox = $('#ai-assist-status');
            }
            statusBox.find('.status-text').text(text);
            statusBox.fadeIn(200);
        };
        this.hideStatus = function() { if(statusBox) statusBox.fadeOut(500); };

        this.setupSettings = function() {
            Lampa.SettingsApi.addComponent({ component: 'ai_assistant_cfg', name: 'AI Асистент', icon: PLUGIN_ICON });
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_key_trigger', type: 'trigger' }, field: { name: 'API Ключ (Gemini)' }, onRender: function(item) {
                var updateText = function() { var val = Lampa.Storage.get(STORAGE_KEY, ''); item.find('.settings-param__value').text(val ? 'Так' : 'Ні').css('color', val ? '#4b5':'#f55'); };
                updateText();
                item.on('hover:enter', function() { Lampa.Input.edit({ title: 'Введіть ключ', value: Lampa.Storage.get(STORAGE_KEY, ''), free: true }, function(v) { if(v){ Lampa.Storage.set(STORAGE_KEY, v.trim()); updateText(); } }); });
            }});
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_result_count', type: 'select', values: { '10':'10','20':'20','30':'30','50':'50' }, default: '20' }, field: { name: 'Кількість результатів' } });
        };
    }

    // Реєстрація плагіна в маніфесті Lampa
    Lampa.Plugins.add({
        id: 'ai_assistant',
        name: 'AI Асистент',
        type: 'other',
        icon: PLUGIN_ICON,
        author: '@bodya_elven',
        description: '',
        version: '2.2',
        onInit: function() {
            if (!window.plugin_ai_assistant_instance) {
                window.plugin_ai_assistant_instance = new AIAssistantPlugin();
                window.plugin_ai_assistant_instance.init();
            }
        }
    });
})();
                                                                                                              
