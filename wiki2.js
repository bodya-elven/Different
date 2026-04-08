(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        
        var ICON_WIKI = 'https://bodya-elven.github.io/different/icons/wikipedia.svg';
        var cachedResults = null;
        var searchPromise = null;
        var isOpened = false;

        this.init = function () {
            // Для фільмів та серіалів
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') {
                    _this.cleanup();
                    setTimeout(function() {
                        try {
                            _this.render(e.data.movie, e.object.activity.render(), 'movie');
                        } catch (err) {}
                    }, 100);
                }
            });

            // Для персон (акторів, режисерів тощо)
            Lampa.Listener.follow('activity', function (e) {
                if (e.type === 'complite' && e.component === 'actor') {
                    _this.cleanup();
                    
                    var activity = e.object.activity;
                    // Агресивний пошук ID
                    var id = activity.id || (activity.data && activity.data.id) || (activity.item && activity.item.id) || (activity.person && activity.person.id);
                    var name = activity.title || (activity.data && (activity.data.name || activity.data.title)) || 'Особа';
                    
                    if (!id && window.location.href.indexOf('id=') !== -1) {
                        var match = window.location.href.match(/[?&]id=(\d+)/);
                        if (match) id = match[1];
                    }

                    if (id) {
                        var personData = { id: id, name: name };
                        var html = activity.render();
                        
                        // Цикл очікування: чекаємо поки Lampa підтягне дані і відмалює сторінку актора
                        var attempts = 0;
                        var tryRender = function() {
                            var hasButtons = html.find('.selector').length > 0 || html.find('.full-start__buttons, .full-start-new__buttons').length > 0;
                            if (hasButtons) {
                                _this.render(personData, html, 'person');
                            } else if (attempts < 30) { // Чекаємо до 3 секунд
                                attempts++;
                                setTimeout(tryRender, 100);
                            } else {
                                // Резервний варіант, якщо кнопок так і не з'явилося
                                _this.render(personData, html, 'person');
                            }
                        };
                        tryRender();
                    }
                }
            });
        };

        this.cleanup = function() {
            $('.lampa-wiki-button').remove();
            cachedResults = null;
            searchPromise = null;
            isOpened = false;
        };

        this.render = function (item, html, type) {
            var container = $(html);
            if (container.find('.lampa-wiki-button').length) return;

            // Логіка лише для іконки, якщо це персона
            var btnClass = type === 'person' ? 'lampa-wiki-button wiki-icon-only' : 'lampa-wiki-button';
            var btnInner = '<img src="' + ICON_WIKI + '" class="wiki-icon-img">' + (type === 'person' ? '' : '<span>Wikipedia</span>');
            
            var button = $('<div class="full-start__button selector ' + btnClass + '">' + btnInner + '</div>');

            var style = '<style>' +
                '.lampa-wiki-button { display: flex !important; align-items: center; justify-content: center; gap: 7px; opacity: 0.7; transition: opacity 0.3s; } ' +
                '.lampa-wiki-button.ready { opacity: 1; } ' +
                '.lampa-wiki-button svg, .lampa-wiki-button img { width: 1.6em !important; height: 1.6em !important; max-width: 1.6em !important; max-height: 1.6em !important; object-fit: contain !important; margin: 0 7px 0 0 !important; } ' +
                
                /* Фікс відступу для кнопки лише з іконкою */
                '.wiki-icon-only svg, .wiki-icon-only img { margin: 0 !important; } ' +
                
                '.wiki-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 5000; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-select-body { width: 90%; max-width: 700px; background: #1a1a1a; border-radius: 10px; padding: 20px; border: 1px solid #333; max-height: 85vh; display: flex; flex-direction: column; position: relative; overflow: hidden; }' +
                '.wiki-items-list { overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; }' +
                '.wiki-item { padding: 12px 15px; margin: 8px 0; background: #252525; border-radius: 8px; display: flex; align-items: center; gap: 15px; border: 2px solid transparent; cursor: pointer; }' +
                '.wiki-item.focus { border-color: #fff; background: #333; outline: none; }' +
                '.wiki-item__lang { font-size: 1.5em; width: 35px; text-align: center; }' +
                '.wiki-item__info { display: flex; flex-direction: column; flex: 1; }' +
                '.wiki-item__type { font-size: 0.85em; color: #999; margin-bottom: 2px; text-transform: none; }' + 
                '.wiki-item__title { font-size: 1.2em; color: #fff; font-weight: 500; }' + 
                
                '.wiki-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-viewer-body { width: 100%; height: 100%; background: #121212; display: flex; flex-direction: column; position: relative; }' +
                '.wiki-header { padding: 15px; background: #1f1f1f; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.wiki-title { font-size: 1.6em; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }' +
                '.wiki-close-btn { width: 45px; height: 45px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; border: 2px solid transparent; cursor: pointer; }' +
                '.wiki-close-btn.focus { border-color: #fff; background: #555; outline: none; }' +
                
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 20px 5%; color: #efefef; line-height: 1.6; font-size: 1.3em; -webkit-overflow-scrolling: touch; }' +
                '.wiki-loader { text-align: center; margin-top: 50px; color: #888; }' +
                
                '.wiki-content-scroll table { font-size: inherit !important; }' + 
                '.wiki-content-scroll h1, .wiki-content-scroll h2 { color: #fff; border-bottom: 1px solid #333; margin-top: 1.5em; padding-bottom: 0.3em; }' +
                '.wiki-content-scroll p { margin-bottom: 1em; text-align: justify; }' +
                '.wiki-content-scroll a { color: inherit !important; text-decoration: none; pointer-events: none; }' +
                '.wiki-content-scroll .infobox { background: #1a1a1a !important; border: 1px solid #333; color: #ccc; margin-bottom: 20px; box-sizing: border-box; }' +
                '.wiki-content-scroll .infobox td, .wiki-content-scroll .infobox th { padding: 5px; border-bottom: 1px solid #333; vertical-align: top; }' +
                '.wiki-content-scroll img { max-width: 100%; height: auto; border-radius: 5px; }' +
                '.wiki-content-scroll table { background: #1a1a1a !important; color: #ccc !important; width: 100% !important; display: block; overflow-x: auto; margin: 15px 0; border-collapse: collapse; }' +
                '.wiki-content-scroll table td, .wiki-content-scroll table th { border: 1px solid #444; padding: 8px; background: transparent !important; color: inherit !important; min-width: 100px; }' +
                '.wiki-content-scroll .mw-empty-elt, .wiki-content-scroll .hatnote, .wiki-content-scroll .ambox, .wiki-content-scroll .navbox { display: none; }' +

                '@media (max-width: 900px) {' +
                    '.wiki-content-scroll .infobox { float: none !important; width: 100% !important; margin: 0 auto 20px auto !important; }' +
                '}' +
                '@media (min-width: 901px) {' +
                    '.wiki-content-scroll .infobox { float: right; width: 320px; margin-left: 20px; }' +
                '}' +
                '</style>';

            if (!$('style#wiki-plugin-style').length) $('head').append('<style id="wiki-plugin-style">' + style + '</style>');

            // Розміщення: другою кнопкою для персон, або в кінець для фільмів
            if (type === 'person') {
                var firstSelector = container.find('.selector').first();
                if (firstSelector.length) {
                    firstSelector.after(button); 
                } else {
                    container.append(button);
                }
            } else {
                var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
                if (buttons_container.length) {
                    buttons_container.append(button);
                } else {
                    container.append(button);
                }
            }

            _this.performSearch(item, type, function(hasResults) {
                if (hasResults) button.addClass('ready');
            });

            button.on('hover:enter click', function() {
                if (!isOpened) _this.handleButtonClick(item, type); 
            });
        };

        this.getTitle = function(item, type) {
            if (type === 'person') {
                return item.title || (item.item && item.item.name) || (item.data && item.data.name) || 'Особа';
            }
            return item.title || item.name;
        };

        this.handleButtonClick = function(item, type) {
            var _this = this;
            if (!item) return;
            isOpened = true;

            var title = _this.getTitle(item, type);

            if (cachedResults) {
                if (cachedResults.length > 0) _this.showMenu(cachedResults, title);
                else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
            } else if (searchPromise) {
                Lampa.Noty.show('Збір даних з Wikidata...');
                searchPromise.done(function(results) {
                    if (results.length) _this.showMenu(results, title);
                    else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                }).fail(function() {
                    Lampa.Noty.show('Помилка завантаження даних'); isOpened = false;
                });
            } else {
                _this.performSearch(item, type, function(hasResults) {
                     if (hasResults) _this.showMenu(cachedResults, title);
                     else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                });
            }
        };

        this.performSearch = function (item, type, callback) {
            var id = null;

            if (type === 'person') {
                id = item.id || (item.item && item.item.id) || (item.data && item.data.id) || (item.person && item.person.id);
                if (!id && window.Lampa && Lampa.Activity && Lampa.Activity.active()) {
                    var active = Lampa.Activity.active();
                    id = active.id || (active.item && active.item.id) || (active.data && active.data.id);
                }
                if (!id && window.location.href.indexOf('id=') !== -1) {
                    var match = window.location.href.match(/[?&]id=(\d+)/);
                    if (match) id = match[1];
                }
            } else {
                id = item ? item.id : null;
            }

            if (!id) return $.Deferred().reject().promise();
            
            var _this = this;
            var def = $.Deferred();
            var method = type === 'person' ? 'person' : ((item.original_name || item.name) ? 'tv' : 'movie');
            
            // Повернення оригінальних англійських назв для головного типу
            var mainType = type === 'person' ? 'biography' : (method === 'tv' ? 'television series' : 'film');
            var tmdbKey = Lampa.TMDB.key();

            $.ajax({
                url: Lampa.TMDB.api(method + '/' + id + '/external_ids?api_key=' + tmdbKey),
                dataType: 'json',
                success: function(extResp) {
                    var mainQId = extResp.wikidata_id;
                    if (!mainQId) {
                        cachedResults = [];
                        if (callback) callback(false);
                        def.reject();
                        return;
                    }

                    $.ajax({
                        url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + mainQId + '&props=claims&format=json&origin=*',
                        dataType: 'json',
                        success: function(claimResp) {
                            var claims = claimResp.entities[mainQId].claims || {};
                            var targets = [];
                            var extractQIds = function(prop, typeName, limit) {
                                if (claims[prop]) {
                                    var items = claims[prop];
                                    if (limit) items = items.slice(0, limit);
                                    items.forEach(function(item) {
                                        if (item.mainsnak && item.mainsnak.datavalue && item.mainsnak.datavalue.value && item.mainsnak.datavalue.value.id) {
                                            targets.push({ qId: item.mainsnak.datavalue.value.id, type: typeName });
                                        }
                                    });
                                }
                            };

                            targets.push({ qId: mainQId, type: mainType });
                            
                            // Повернення оригінальних англійських підписів (Property names)
                            if (type === 'person') extractQIds('P1283', 'filmography');
                            else {
                                extractQIds('P144', 'based on');
                                extractQIds('P155', 'follows');
                                extractQIds('P156', 'followed by');
                                extractQIds('P161', 'cast member', 5);
                                extractQIds('P725', 'voice actor', 3);
                                extractQIds('P57', 'director');
                                extractQIds('P1877', 'after a work by');
                                extractQIds('P138', 'named after');
                                extractQIds('P179', 'part of the series');
                            }

                            var qIdList = targets.map(function(t) { return t.qId; });
                            var uniqueQIds = qIdList.filter(function(item, pos) { return qIdList.indexOf(item) == pos; });

                            $.ajax({
                                url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + uniqueQIds.join('|') + '&props=sitelinks&format=json&origin=*',
                                dataType: 'json',
                                success: function(siteResp) {
                                    var finalResults = [];
                                    var entities = siteResp.entities || {};
                                    targets.forEach(function(t) {
                                        var entity = entities[t.qId];
                                        if (entity && entity.sitelinks) {
                                            var hasUa = false;
                                            
                                            if (entity.sitelinks.ukwiki) {
                                                finalResults.push({ typeTitle: t.type, title: entity.sitelinks.ukwiki.title, lang: 'ua', lang_icon: '🇺🇦', key: entity.sitelinks.ukwiki.title });
                                                hasUa = true;
                                            }
                                            
                                            // Для персон виводимо ОБИДВІ мови. Для фільмів англійську виводимо лише якщо немає української.
                                            if (entity.sitelinks.enwiki) {
                                                if (type === 'person' || !hasUa) {
                                                    finalResults.push({ typeTitle: t.type, title: entity.sitelinks.enwiki.title, lang: 'en', lang_icon: '🇺🇸', key: entity.sitelinks.enwiki.title });
                                                }
                                            }
                                        }
                                    });
                                    cachedResults = finalResults;
                                    if (callback) callback(finalResults.length > 0);
                                    def.resolve(finalResults);
                                },
                                error: function() { cachedResults = []; if (callback) callback(false); def.reject(); }
                            });
                        },
                        error: function() { cachedResults = []; if (callback) callback(false); def.reject(); }
                    });
                },
                error: function() { cachedResults = []; if (callback) callback(false); def.reject(); }
            });
            searchPromise = def.promise();
            return searchPromise;
        };

        this.showMenu = function(items, movieTitle) {
            var _this = this;
            var current_controller = Lampa.Controller.enabled().name;
            var menu = $('<div class="wiki-select-container"><div class="wiki-select-body">' +
                            '<div style="font-size: 1.4em; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">Wikipedia: ' + movieTitle + '</div>' +
                            '<div class="wiki-items-list"></div></div></div>');

            items.forEach(function(item) {
                var el = $('<div class="wiki-item selector">' +
                                '<div class="wiki-item__lang">' + item.lang_icon + '</div>' +
                                '<div class="wiki-item__info">' +
                                    '<div class="wiki-item__type">' + item.typeTitle + '</div>' +
                                    '<div class="wiki-item__title">' + item.title + '</div>' +
                                '</div>' +
                            '</div>');
                el.on('hover:enter click', function() { menu.remove(); _this.showViewer(item.lang, item.key, item.title, current_controller); });
                menu.find('.wiki-items-list').append(el);
            });
            $('body').append(menu);
            Lampa.Controller.add('wiki_menu', {
                toggle: function() { Lampa.Controller.collectionSet(menu); Lampa.Controller.collectionFocus(menu.find('.wiki-item')[0], menu); },
                up: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index > 0) Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index - 1], menu);
                },
                down: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index < items.length - 1) Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index + 1], menu);
                },
                back: function() { menu.remove(); isOpened = false; Lampa.Controller.toggle(current_controller); }
            });
            Lampa.Controller.toggle('wiki_menu');
        };

        this.showViewer = function (lang, key, title, prev_controller) {
            var viewer = $('<div class="wiki-viewer-container"><div class="wiki-viewer-body">' +
                                '<div class="wiki-header">' +
                                    '<div class="wiki-title">' + title + '</div>' +
                                    '<div class="wiki-close-btn selector">×</div>' +
                                '</div>' +
                                '<div class="wiki-content-scroll"><div class="wiki-loader">Завантаження...</div></div></div></div>');
            $('body').append(viewer);
            var closeViewer = function() { viewer.remove(); isOpened = false; Lampa.Controller.toggle(prev_controller); };
            viewer.find('.wiki-close-btn').on('click hover:enter', function(e) { e.preventDefault(); closeViewer(); });
            Lampa.Controller.add('wiki_viewer', {
                toggle: function() { Lampa.Controller.collectionSet(viewer); Lampa.Controller.collectionFocus(viewer.find('.wiki-close-btn')[0], viewer); },
                up: function() { viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() - 100); },
                down: function() { viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() + 100); },
                back: closeViewer
            });
            Lampa.Controller.toggle('wiki_viewer');
            $.ajax({
                url: 'https://' + (lang === 'ua' ? 'uk' : 'en') + '.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(key),
                success: function(html) {
                    html = html.replace(/src="\/\//g, 'src="https://').replace(/href="\//g, 'href="https://wikipedia.org/').replace(/srcset=/g, 'data-srcset=').replace(/style="[^"]*"/g, "").replace(/bgcolor="[^"]*"/g, "");
                    viewer.find('.wiki-content-scroll').html(html).find('script, style, link').remove();
                },
                error: function() { viewer.find('.wiki-loader').text('Не вдалося завантажити'); }
            });
        };
    }
    if (window.Lampa) window.wiki_info = new WikiInfoPlugin().init();
})();