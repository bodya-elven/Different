(function () {
    'use strict';

    var PLUGIN_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>';

    var pluginManifest = {
        type: 'other',
        version: 1.2,
        name: 'AI Assistant Ultra',
        description: 'AI Асистент з кастомним інтерфейсом та оптимізованим пошуком.',
        author: '@bodya_elven',
        icon: PLUGIN_ICON
    };

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
        var isOpened = false;

        this.init = function () {
            this.setupSettings();
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'complete') {
                    var render = e.object.activity.render();
                    _this.drawButton(render, e.data.movie);
                }
            });
            this.injectStyles();
        };

        this.injectStyles = function() {
            if ($('#ai-assistant-styles').length) return;
            $('<style id="ai-assistant-styles">').prop('type', 'text/css').html(
                '.button--ai-assist { display: flex !important; align-items: center; justify-content: center; gap: 7px; } ' + 
                '.button--ai-assist svg { width: 1.6em; height: 1.6em; margin: 0 7px 0 0 !important; color: #0cf; } ' +
                '.ai-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.ai-viewer-body { width: 100%; height: 100%; background: #121212; display: flex; flex-direction: column; }' +
                '.ai-header { padding: 15px; background: #1f1f1f; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.ai-title { font-size: 1.6em; color: #fff; font-weight: bold; }' +
                '.ai-close-btn { width: 45px; height: 45px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; border: 2px solid transparent; }' +
                '.ai-close-btn.focus { border-color: #fff; background: #555; }' +
                '.ai-content-scroll { flex: 1; overflow-y: auto; padding: 20px 5%; color: #efefef; font-size: 1.3em; line-height: 1.6; }' +
                '.ai-item-point { margin-bottom: 15px; padding-left: 20px; position: relative; }' +
                '.ai-item-point:before { content: "•"; position: absolute; left: 0; color: #0cf; }' +
                '.ai-fact-block { margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 15px; }' +
                '.ai-fact-title { color: #0cf; font-weight: bold; display: block; margin-bottom: 5px; }'
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
                            if(v){ Lampa.Storage.set(STORAGE_KEY, v.trim()); item.find('.settings-param__value').text('OK').css('color', '#4b5'); } 
                        });
                    });
                }
            });
        };

        this.drawButton = function (render, card) {
            var container = render.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length || container.find('.button--ai-assist').length) return;
            var btn = $('<div class="full-start__button selector button--ai-assist">' + PLUGIN_ICON + '<span>AI Асистент</span></div>');
            btn.on('hover:enter click', function () { _this.openAiMenu(card, btn, render); });
            var bookmarkBtn = container.find('.button--book, .button--like, .button--keywords, .lampa-wiki-button').first();
            if (bookmarkBtn.length) bookmarkBtn.before(btn); else container.append(btn);
        };

        this.openAiMenu = function(card, btnElement, renderContainer) {
            var currCtrl = Lampa.Controller.enabled().name;
            var items = [
                { title: 'Рекомендації (Схоже)', action: 'recommendations' },
                { title: 'Маловідомі факти', action: 'facts' },
                { title: 'Разом у кадрі', action: 'together' },
                { title: 'Стислий переказ', action: 'recap' },
                { title: 'По настрою', action: 'mood' }
            ];
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
                onBack: function () { Lampa.Controller.toggle(currCtrl); }
            });
        };

        // --- CUSTOM VIEWER (як у Wikipedia плагіні) ---
        this.showViewer = function(title, contentHtml, prev_controller) {
            var viewer = $('<div class="ai-viewer-container"><div class="ai-viewer-body">' +
                                '<div class="ai-header">' +
                                    '<div class="ai-title">' + title + '</div>' +
                                    '<div class="ai-close-btn selector">×</div>' +
                                '</div>' +
                                '<div class="ai-content-scroll">' + contentHtml + '</div>' +
                            '</div></div>');

            $('body').append(viewer);

            var closeViewer = function() {
                viewer.remove();
                Lampa.Controller.toggle(prev_controller);
            };

            viewer.find('.ai-close-btn').on('click hover:enter', function() { closeViewer(); });

            Lampa.Controller.add('ai_viewer', {
                toggle: function() {
                    Lampa.Controller.collectionSet(viewer);
                    Lampa.Controller.collectionFocus(viewer.find('.ai-close-btn')[0], viewer);
                },
                up: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() - 100); },
                down: function() { viewer.find('.ai-content-scroll').scrollTop(viewer.find('.ai-content-scroll').scrollTop() + 100); },
                back: closeViewer
            });
            Lampa.Controller.toggle('ai_viewer');
        };

        // --- ACTIONS ---

        this.actionFacts = function(card, btn, render, ctrl) {
            var t = card.original_title || card.original_name;
            _this.updateStatus('🤖 Шукаю факти...');
            var p = 'Write 5 interesting facts about "' + t + '" in Ukrainian. Return JSON array: [{"title": "...", "text": "..."}].';
            _this.askGemini(p, function(text) {
                _this.hideStatus();
                var data = _this.parseJsonSafe(text);
                if (!data) return;
                var html = '';
                data.forEach(function(f) { html += '<div class="ai-fact-block"><span class="ai-fact-title">'+f.title+'</span>'+f.text+'</div>'; });
                _this.showViewer('Факти: ' + (card.title || card.name), html, ctrl);
            });
        };

        this.actionRecapMenu = function(card, btn, render, ctrl) {
            var items = [];
            if (card.number_of_seasons > 1) {
                for (var i = 1; i < card.number_of_seasons; i++) items.push({ title: 'Сезон ' + i, type: 'season', value: i });
            } else if (card.belongs_to_collection) {
                _this.updateStatus('🤖 Збираю історію колекції...');
                Lampa.Network.silent(Lampa.TMDB.api('collection/' + card.belongs_to_collection.id + '?api_key=' + Lampa.TMDB.key() + '&language=uk-UA'), function(res) {
                    (res.parts || []).forEach(function(p) {
                        if (p.id != card.id) items.push({ title: p.title, type: 'movie', value: p.original_title });
                    });
                    if (items.length) _this.showRecapSelect(items, card, ctrl);
                    else Lampa.Noty.show('Попередніх частин не знайдено');
                    _this.hideStatus();
                });
                return;
            }
            if (items.length) _this.showRecapSelect(items, card, ctrl);
            else Lampa.Noty.show('Це перша частина або єдиний сезон');
        };

        this.showRecapSelect = function(items, card, ctrl) {
            Lampa.Select.show({
                title: 'Оберіть частину для переказу',
                items: items,
                onSelect: function(item) {
                    var target = item.type === 'season' ? item.title : '"' + item.value + '"';
                    var p = 'Provide a brief recap of ' + target + ' in Ukrainian. 5-7 key points. Return JSON array: [{"point": "..."}].';
                    _this.updateStatus('🤖 Готую переказ...');
                    _this.askGemini(p, function(text) {
                        _this.hideStatus();
                        var data = _this.parseJsonSafe(text);
                        var html = '';
                        (data || []).forEach(function(i) { html += '<div class="ai-item-point">' + i.point + '</div>'; });
                        _this.showViewer('Переказ: ' + item.title, html, ctrl);
                    });
                },
                onBack: function() { Lampa.Controller.toggle(ctrl); }
            });
        };

        this.actionTogether = function(card, btn, render, ctrl) {
            var method = (card.name || card.original_name) ? 'tv' : 'movie';
            _this.updateStatus('🤖 Аналізую акторів...');
            Lampa.Network.silent(Lampa.TMDB.api(method + '/' + card.id + '/credits?api_key=' + Lampa.TMDB.key()), function(res) {
                var cast = res.cast || [];
                var names = cast.slice(0, 15).map(function(a) { return a.name; }).join(', ');
                var p = 'Find 15 movies where at least 2 of these actors work together: ' + names + '. Prioritize first 5. Return JSON: [{"uk":"...","orig":"...","year":Year}].';
                _this.fetchList(p, 'Разом у кадрі', ctrl);
            });
        };

        this.actionMoodMenu = function(card, btn, render, ctrl) {
            var items = [
                { title: 'Візуальне задоволення', mood: 'Visual masterpiece' },
                { title: 'Темна сторона', mood: 'Dark/Antivillain' },
                { title: 'Посміятися', mood: 'Comedy' },
                { title: 'Поплакати', mood: 'Drama' }
            ];
            Lampa.Select.show({
                title: 'Настрій',
                items: items,
                onSelect: function(i) {
                    var p = 'Suggest 20 movies like "' + (card.original_title || card.original_name) + '" with mood: ' + i.mood + '. Return JSON: [{"uk":"...","orig":"...","year":Year}].';
                    _this.fetchList(p, i.title, ctrl);
                },
                onBack: function() { Lampa.Controller.toggle(ctrl); }
            });
        };

        this.actionRecommendations = function(card, btn, render, ctrl) {
            var p = 'Suggest 20 movies similar to "' + (card.original_title || card.original_name) + '". Return JSON: [{"uk":"...","orig":"...","year":Year}].';
            _this.fetchList(p, 'Рекомендації', ctrl);
        };

        // --- CORE ---

        this.askGemini = function(prompt, onSuccess) {
            var key = Lampa.Storage.get(STORAGE_KEY, '').split(',')[0];
            if (!key) return Lampa.Noty.show('API Ключ не встановлено');
            fetch('https://generativelanguage.googleapis.com/v1beta/models/'+TARGET_MODEL+':generateContent?key='+key.trim(), {
                method: "POST", body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }).then(function(r) { return r.json(); }).then(function(d) {
                if (d.candidates && d.candidates[0].content) onSuccess(d.candidates[0].content.parts[0].text);
            }).catch(function() { _this.hideStatus(); Lampa.Noty.show('Помилка запиту'); });
        };

        this.parseJsonSafe = function(text) {
            try {
                var clean = text.trim().replace(/^```json/gi, '').replace(/```$/g, '').trim();
                var s = clean.indexOf('['), e = clean.lastIndexOf(']');
                return JSON.parse(clean.substring(s, e + 1));
            } catch (e) { return null; }
        };

        this.fetchList = function(prompt, title, ctrl) {
            _this.updateStatus('🤖 AI працює...');
            _this.askGemini(prompt, function(text) {
                var list = _this.parseJsonSafe(text);
                if (!list) return _this.hideStatus();
                
                var results = [], processed = 0, ids = new Set();
                _this.updateStatus('🤖 TMDB: пошук...');
                
                // Паралельний запуск запитів для швидкості
                list.forEach(function(item) {
                    var q = encodeURIComponent(item.orig || item.uk);
                    Lampa.Network.silent(Lampa.TMDB.api('search/multi?query=' + q + '&api_key=' + Lampa.TMDB.key() + '&language=uk-UA'), function(res) {
                        processed++;
                        if (res.results && res.results[0]) {
                            var b = res.results[0];
                            if (b.media_type !== 'person' && !ids.has(b.id)) {
                                ids.add(b.id);
                                b.source = 'tmdb';
                                results.push(b);
                            }
                        }
                        if (processed === list.length) {
                            _this.hideStatus();
                            if (!results.length) Lampa.Noty.show('Нічого не знайдено');
                            else {
                                window.ai_cached_results = results;
                                Lampa.Activity.push({ url: 'ai_list', title: title, component: 'category_full', source: 'ai_list_source', page: 1 });
                            }
                        }
                    });
                });
            });
        };

        this.updateStatus = function(text) {
            if (!statusBox) {
                $('body').append('<div id="ai-assist-status" style="position: fixed; bottom: 80px; left: 0; right: 0; text-align: center; z-index: 10001; pointer-events: none;"><div style="display: inline-block; background: rgba(0,0,0,0.9); padding: 15px 25px; border-radius: 50px; border: 1px solid #0cf;"><span class="status-text" style="color: #fff; font-size: 1.2em;"></span></div></div>');
                statusBox = $('#ai-assist-status');
            }
            statusBox.find('.status-text').text(text);
            statusBox.fadeIn(200);
        };
        this.hideStatus = function() { if(statusBox) statusBox.fadeOut(500); };
    }

    if (!window.plugin_ai_assistant_instance) {
        window.plugin_ai_assistant_instance = new AIAssistantPlugin();
        if (window.appready) window.plugin_ai_assistant_instance.init();
        else Lampa.Listener.follow('app', function(e) { if (e.type == 'ready') window.plugin_ai_assistant_instance.init(); });
    }
})();
