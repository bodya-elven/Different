(function () {
    'use strict';

    // Іконка: ліва частина біла (#fff), права - світло-сіра (#e0e0e0)
    var PLUGIN_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.cls-left{fill:#fff;fill-rule:evenodd;}.cls-right{fill:#e0e0e0;fill-rule:evenodd;}</style><g><polygon class="cls-right" points="16.64 15.13 17.38 13.88 20.91 13.88 22 12 19.82 8.25 16.75 8.25 15.69 6.39 14.5 6.39 14.5 5.13 16.44 5.13 17.5 7 19.09 7 16.9 3.25 12.63 3.25 12.63 8.25 14.36 8.25 15.09 9.5 12.63 9.5 12.63 12 14.89 12 15.94 10.13 18.75 10.13 19.47 11.38 16.67 11.38 15.62 13.25 12.63 13.25 12.63 17.63 16.03 17.63 15.31 18.88 12.63 18.88 12.63 20.75 16.9 20.75 20.18 15.13 18.09 15.13 17.36 16.38 14.5 16.38 14.5 15.13 16.64 15.13"/><polygon class="cls-left" points="7.36 15.13 6.62 13.88 3.09 13.88 2 12 4.18 8.25 7.25 8.25 8.31 6.39 9.5 6.39 9.5 5.13 7.56 5.13 6.5 7 4.91 7 7.1 3.25 11.38 3.25 11.38 8.25 9.64 8.25 8.91 9.5 11.38 9.5 11.38 12 9.11 12 8.06 10.13 5.25 10.13 4.53 11.38 7.33 11.38 8.38 13.25 11.38 13.25 11.38 17.63 7.97 17.63 8.69 18.88 11.38 18.88 11.38 20.75 7.1 20.75 3.82 15.13 5.91 15.13 6.64 16.38 9.5 16.38 9.5 15.13 7.36 15.13"/></g></svg>';

    var TARGET_MODEL = 'gemini-flash-lite-latest';
    var STORAGE_KEY = 'google_native_key_v1';
    window.ai_cached_results = [];

    if (window.Lampa && Lampa.Api) {
        Lampa.Api.sources.ai_list_source = {
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

        // --- ГЛОБАЛЬНИЙ ПОШУК (Позиція 3 + Фільтрація) ---
        this.setupGlobalSearch = function() {
            var searchSource = {
                title: 'AI Пошук',
                search: function (params, done) {
                    var q = decodeURIComponent(params.query || '').trim().toLowerCase();
                    var limit = Lampa.Storage.get('ai_result_count', '20');
                    if (!q) return done([]);
                    
                    var filter = 'movies and TV series';
                    if (q.indexOf('фільм') > -1) filter = 'strictly only movies';
                    else if (q.indexOf('серіал') > -1) filter = 'strictly only TV series';

                    var p = 'Act as a movie expert. Suggest exactly ' + limit + ' ' + filter + ' for query: "' + q + '". Return JSON: [{"uk":"Title","orig":"Original Title","year":Year}].';
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

        // --- ДИЗАЙН ТА СТИЛІ ---
        this.injectStyles = function() {
            if ($('#ai-assistant-styles').length) return;
            var tCol = window.look_dynamic_current_hex || 'var(--main-color, #0cf)';
            $('<style id="ai-assistant-styles">').prop('type', 'text/css').html(
                '.button--ai-assist { display: flex !important; align-items: center; justify-content: center; gap: 7px; } ' + 
                '.button--ai-assist svg { width: 1.6em !important; height: 1.6em !important; margin: 0 !important; } ' +
                '#ai-assist-status { position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none; display: flex; justify-content: center; }' +
                '.ai-toast { display: inline-flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 10px 24px; border-radius: 50px; color: #fff; font-size: 1.1em; line-height: 24px; min-height: 44px; position: relative; }' +
                '.ai-spinner { width: 24px; height: 24px; border: 3px solid transparent; border-top-color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }' +
                
                /* НОВИЙ СТИЛЬ: Морська хвиля (Fluid Waving Blob) */
                '.ai-st-wave { animation: ai-morph-wave 4s linear infinite; border: none; }' +
                '.ai-st-wave::before { content: ""; position: absolute; inset: -2px; padding: 2px; border-radius: inherit; background: conic-gradient(from 0deg, #fff, #0cf, #0077be, #0cf, #fff); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: ai-rot 3s linear infinite; }' +
                '@keyframes ai-morph-wave { 0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } }' +

                /* Старі 4 стилі */
                '.ai-st-liquid { animation: ai-liquid 2s ease-in-out infinite; } @keyframes ai-liquid { 0%,100%{border-radius:50px;} 50%{border-radius:20px 80px 20px 80px;} }' +
                '.ai-st-glass { position:relative; overflow:hidden; } .ai-st-glass:after { content:""; position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); animation: ai-gl 1.5s infinite; } @keyframes ai-gl { to {left:150%;} }' +
                '.ai-st-pulse { animation: ai-pulse 2s infinite; } @keyframes ai-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }' +
                '.ai-st-blur { animation: ai-blur 3s infinite; } @keyframes ai-blur { 0%,100%{backdrop-filter:blur(20px);} 50%{backdrop-filter:blur(5px);} }' +

                '@keyframes ai-rot { to { transform: rotate(360deg); } }' +
                
                '.ai-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.ai-viewer-body { width: 80%; max-width: 800px; height: 70%; background: #121212; display: flex; flex-direction: column; border-radius: 16px; border: 1px solid ' + tCol + '; overflow: hidden; }' +
                '.ai-header { height: 44px; padding: 0 15px; background: #1a1a1a; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.ai-close-btn { width: 32px; height: 32px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; border: 2px solid transparent; padding: 0; line-height: 1; }' +
                '.ai-close-btn.focus { border-color: #fff; background: ' + tCol + '; }' +
                '.ai-content-scroll { flex: 1; overflow-y: auto; padding: 20px; color: #efefef; font-size: 1.15em; line-height: 1.4; }' +
                '.ai-fact-block { margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }' +
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

        // --- НАВІГАЦІЯ ТА ФОКУС (Фікс історії та циклів) ---
        this.openAiMenu = function(card, btnElement, renderContainer) {
            var currCtrl = Lampa.Controller.enabled().name;
            var items = [
                { title: 'Рекомендації', action: 'recommendations' },
                { title: 'Маловідомі факти', action: 'facts' },
                { title: 'Спільні проєкти', action: 'together' }
            ];
            if ((card.number_of_seasons && card.number_of_seasons > 1) || card.belongs_to_collection) {
                items.push({ title: 'Стислий переказ', action: 'recap' });
            }
            items.push({ title: 'По настрою', action: 'mood' });

            Lampa.Select.show({
                title: 'AI Асистент',
                items: items,
                onSelect: function (item) {
                    if (item.action === 'facts') _this.actionFacts(card, btnElement, renderContainer, currCtrl);
                    else if (item.action === 'together') _this.actionTogether(card, btnElement, renderContainer, currCtrl);
                    else if (item.action === 'recap') _this.actionRecapMenu(card, btnElement, renderContainer, currCtrl);
                    else if (item.action === 'mood') _this.actionMoodMenu(card, btnElement, renderContainer, currCtrl);
                    else if (item.action === 'recommendations') _this.actionRecommendations(card, btnElement, renderContainer, currCtrl);
                },
                onBack: function () { 
                    Lampa.Controller.toggle(currCtrl);
                    if (!Lampa.Platform.is('touch')) {
                        setTimeout(function() { Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]); }, 10);
                    }
                }
            });
        };

        this.showViewer = function(title, contentHtml, backAction) {
            var viewer = $('<div class="ai-viewer-container"><div class="ai-viewer-body">' +
                                '<div class="ai-header"><div class="ai-title">' + title + '</div><div class="ai-close-btn selector">×</div></div>' +
                                '<div class="ai-content-scroll">' + contentHtml + '</div>' +
                            '</div></div>');
            $('body').append(viewer);
            var close = function() { viewer.remove(); backAction(); };
            viewer.find('.ai-close-btn').on('click hover:enter', close);
            Lampa.Controller.add('ai_viewer', {
                toggle: function() { Lampa.Controller.collectionSet(viewer); Lampa.Controller.collectionFocus(viewer.find('.ai-close-btn')[0], viewer); },
                up: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() - 100); },
                down: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() + 100); },
                back: close
            });
            Lampa.Controller.toggle('ai_viewer');
        };

        // --- ЛОГІЧНІ ДІЇ (З контекстом) ---
        this.actionFacts = function(card, btn, render, ctrl) {
            var t = card.original_title || card.original_name;
            var type = card.number_of_seasons ? 'TV series' : 'movie';
            var year = (card.release_date || card.first_air_date || '').slice(0,4);
            _this.updateStatus('Пошук фактів');
            var p = 'Give 5 facts about ' + type + ' "' + t + '" (' + year + ') in Ukrainian. JSON: [{"title":"..","text":".."}].';
            _this.askGemini(p, function(text) {
                _this.hideStatus();
                var data = _this.parseJsonSafe(text);
                if (!data) return;
                var html = '';
                data.forEach(function(f) { html += '<div class="ai-fact-block"><span class="ai-fact-title">'+f.title+'</span>'+f.text+'</div>'; });
                _this.showViewer('Факти: ' + (card.title || card.name), html, function() { _this.openAiMenu(card, btn, render); });
            });
        };

        this.actionRecapMenu = function(card, btn, render, ctrl) {
            var items = [];
            if (card.number_of_seasons > 1) {
                for (var i = 1; i < card.number_of_seasons; i++) items.push({ title: 'Сезон ' + i, type: 'season', value: i });
                _this.showRecapSelect(items, card, btn, render, ctrl);
            } else if (card.belongs_to_collection) {
                _this.updateStatus('Збір історії');
                Lampa.Network.silent(Lampa.TMDB.api('collection/' + card.belongs_to_collection.id + '?api_key=' + Lampa.TMDB.key() + '&language=uk-UA'), function(res) {
                    _this.hideStatus();
                    (res.parts || []).forEach(function(p) { if (p.id != card.id) items.push({ title: p.title, type: 'movie', value: p.original_title }); });
                    _this.showRecapSelect(items, card, btn, render, ctrl);
                });
            }
        };

        this.showRecapSelect = function(items, card, btn, render, ctrl) {
            Lampa.Select.show({
                title: 'Переказ сюжету',
                items: items,
                onSelect: function(item) {
                    var t = card.original_title || card.original_name;
                    _this.updateStatus('Підготовка переказу');
                    var p = 'Recap of ' + item.title + ' from "' + t + '" in Ukrainian. 5-7 points. JSON: [{"point":".."}].';
                    _this.askGemini(p, function(text) {
                        _this.hideStatus();
                        var data = _this.parseJsonSafe(text);
                        var html = '';
                        (data || []).forEach(function(i) { html += '<div style="margin-bottom:8px">• ' + i.point + '</div>'; });
                        _this.showViewer('Переказ: ' + item.title, html, function() { _this.showRecapSelect(items, card, btn, render, ctrl); });
                    });
                },
                onBack: function() { _this.openAiMenu(card, btn, render); }
            });
        };

        this.actionTogether = function(card, btn, render, ctrl) {
            var method = (card.name || card.original_name) ? 'tv' : 'movie';
            var limit = Lampa.Storage.get('ai_result_count', '20');
            _this.updateStatus('Аналіз складу');
            Lampa.Network.silent(Lampa.TMDB.api(method + '/' + card.id + '/credits?api_key=' + Lampa.TMDB.key()), function(res) {
                var cast = res.cast || [], crew = res.crew || [];
                var dir = crew.filter(function(p){return p.job==='Director'})[0];
                var names = cast.slice(0, 15).map(function(a){return a.name});
                if(dir) names.push('Director: ' + dir.name);
                var p = 'Find exactly ' + limit + ' projects where these people worked together: ' + names.join(', ') + '. JSON: [{"uk":"..","orig":"...","year":Year}].';
                _this.fetchList(p, 'Спільні проєкти', card, btn, render, ctrl);
            });
        };

        this.actionMoodMenu = function(card, btn, render, ctrl) {
            var items = [{ title: 'Візуальне задоволення', mood: 'Visual masterpiece' }, { title: 'Темна сторона', mood: 'Dark/Antivillain' }, { title: 'Посміятися', mood: 'Comedy' }, { title: 'Поплакати', mood: 'Drama' }];
            Lampa.Select.show({
                title: 'Настрій',
                items: items,
                onSelect: function(i) {
                    var limit = Lampa.Storage.get('ai_result_count', '20');
                    var t = card.original_title || card.original_name;
                    var p = 'Exactly ' + limit + ' projects like "' + t + '" with mood: ' + i.mood + '. JSON: [{"uk":"..","orig":"..","year":Year}].';
                    _this.fetchList(p, i.title, card, btn, render, ctrl);
                },
                onBack: function() { _this.openAiMenu(card, btn, render); }
            });
        };

        this.actionRecommendations = function(card, btn, render, ctrl) {
            var limit = Lampa.Storage.get('ai_result_count', '20');
            var t = card.original_title || card.original_name;
            var p = 'Exactly ' + limit + ' similar to "' + t + '". JSON: [{"uk":"..","orig":"..","year":Year}].';
            _this.fetchList(p, 'Рекомендації', card, btn, render, ctrl);
        };

        // --- CORE ---
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
                    else {
                        window.ai_cached_results = results;
                        Lampa.Activity.push({ url: 'ai_list', title: title, component: 'category_full', source: 'ai_list_source', page: 1 });
                    }
                });
            });
        };

        this.updateStatus = function(text) {
            var sClass = Lampa.Storage.get('ai_loader_style', 'ai-st-wave');
            if (!statusBox) {
                $('body').append('<div id="ai-assist-status"><div class="ai-toast"><div class="ai-spinner"></div><span class="status-text"></span></div></div>');
                statusBox = $('#ai-assist-status');
            }
            statusBox.find('.ai-toast').attr('class', 'ai-toast ' + sClass);
            statusBox.find('.status-text').text(text);
            statusBox.fadeIn(200);
        };
        this.hideStatus = function() { if(statusBox) statusBox.fadeOut(500); };

        this.setupSettings = function() {
            Lampa.SettingsApi.addComponent({ component: 'ai_assistant_cfg', name: 'AI Асистент', icon: PLUGIN_ICON });
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_key_trigger', type: 'trigger' }, field: { name: 'API Ключ (Gemini)' }, onRender: function(item) {
                var updateText = function() { var val = Lampa.Storage.get(STORAGE_KEY, ''); item.find('.settings-param__value').text(val ? 'Так' : 'Ні').css('color', val ? '#4b5':'#f55'); };
                updateText();
                item.on('hover:enter', function() { Lampa.Input.edit({ title: 'Введіть ключ', value: Lampa.Storage.get(STORAGE_KEY, ''), free: true }, function(v) { 
                    if(v){ Lampa.Storage.set(STORAGE_KEY, v.trim()); updateText(); } 
                }); });
            }});
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_result_count', type: 'select', values: { '10':'10','20':'20','30':'30','50':'50' }, default: '20' }, field: { name: 'Кількість результатів' } });
            Lampa.SettingsApi.addParam({ component: 'ai_assistant_cfg', param: { name: 'ai_loader_style', type: 'select', values: { 
                'ai-st-wave':'Морська хвиля (Blob)', 'ai-st-glass':'Скляний відблиск', 'ai-st-liquid':'Рідкі краї', 'ai-st-pulse':'Масштабний пульс', 'ai-st-blur':'Пульсуючий блюр' 
            }, default: 'ai-st-wave' }, field: { name: 'Стиль завантаження' } });
        };
    }

    if (!window.plugin_ai_assistant_instance) {
        window.plugin_ai_assistant_instance = new AIAssistantPlugin();
        if (window.appready) window.plugin_ai_assistant_instance.init();
        else Lampa.Listener.follow('app', function(e) { if (e.type == 'ready') window.plugin_ai_assistant_instance.init(); });
    }
})();
