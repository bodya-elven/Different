(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        var ICON_WIKI = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Wikipedia_svg_logo.svg';
        var cachedResults = null;
        var searchPromise = null;
        var isOpened = false;

        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') {
                    _this.cleanup();
                    setTimeout(function() {
                        try {
                            _this.render(e.data, e.object.activity.render());
                        } catch (err) {}
                    }, 100);
                }
            });
        };

        this.cleanup = function() {
            $('.lampa-wiki-button').remove();
            cachedResults = null;
            searchPromise = null;
            isOpened = false;
        };

        this.render = function (data, html) {
            var container = $(html);
            if (container.find('.lampa-wiki-button').length) return;

            var button = $('<div class="full-start__button selector lampa-wiki-button">' +
                                '<img src="' + ICON_WIKI + '" class="wiki-icon-img">' +
                                '<span>Wikipedia</span>' +
                            '</div>');

            var style = '<style>' +
                '.lampa-wiki-button { display: flex !important; align-items: center; justify-content: center; opacity: 0.7; transition: opacity 0.3s; } ' +
                '.lampa-wiki-button.ready { opacity: 1; } ' +
                '.wiki-icon-img { width: 1.6em; height: 1.6em; object-fit: contain; margin-right: 5px; filter: grayscale(100%) brightness(2); } ' +
                
                '.wiki-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 5000; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-select-body { width: 95%; max-width: 900px; background: #1a1a1a; border-radius: 10px; padding: 20px; border: 1px solid #333; max-height: 80vh; display: flex; flex-direction: column; position: relative; overflow: hidden; }' +
                
                /* Використовуємо GRID для колонок - це надійніше для ТБ */
                '.wiki-items-list { overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 10px; padding: 5px; }' +
                
                '.wiki-item { padding: 12px 15px; background: #252525; border-radius: 8px; display: flex; align-items: center; gap: 15px; border: 2px solid transparent; cursor: pointer; box-sizing: border-box; }' +
                '.wiki-item.focus { border-color: #fff; background: #333; outline: none; }' +
                '.wiki-item__lang { font-size: 1.5em; width: 40px; text-align: center; }' +
                '.wiki-item__info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }' +
                '.wiki-item__type { font-size: 0.95em; color: #aaa; margin-bottom: 2px; text-transform: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' + 
                '.wiki-item__title { font-size: 1.25em; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
                
                '.wiki-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-viewer-body { width: 100%; height: 100%; background: #121212; display: flex; flex-direction: column; position: relative; }' +
                '.wiki-header { padding: 15px; background: #1f1f1f; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.wiki-title { font-size: 1.6em; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }' +
                '.wiki-close-btn { width: 50px; height: 50px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 2px solid transparent; cursor: pointer; }' +
                '.wiki-close-btn.focus { border-color: #fff; background: #555; outline: none; }' +
                
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 25px 5%; color: #d0d0d0; line-height: 1.7; font-size: 1.3em; -webkit-overflow-scrolling: touch; }' +
                '.wiki-loader { text-align: center; margin-top: 50px; color: #888; }' +
                '.wiki-content-scroll h2 { border-bottom: 1px solid #333; margin-top: 1.5em; padding-bottom: 0.3em; color: #fff; }' +
                '.wiki-content-scroll p { margin-bottom: 1.2em; text-align: justify; }' +
                /* Посилання сірого кольору */
                '.wiki-content-scroll a { color: #bbb !important; text-decoration: none; pointer-events: none; }' +
                /* Таблиці великого розміру */
                '.wiki-content-scroll table { background: #1a1a1a !important; color: #ccc !important; width: 100% !important; margin: 20px 0; border-collapse: collapse; display: block; overflow-x: auto; font-size: 1.0em !important; }' +
                '.wiki-content-scroll table td, .wiki-content-scroll table th { border: 1px solid #444; padding: 10px; }' +
                '.wiki-content-scroll .infobox { background: #1a1a1a !important; border: 1px solid #333; padding: 15px; margin-bottom: 25px; width: 100%; box-sizing: border-box; }' +
                '.wiki-content-scroll img { max-width: 100%; height: auto; border-radius: 8px; }' +
                '.wiki-content-scroll .mw-empty-elt, .wiki-content-scroll .hatnote, .wiki-content-scroll .ambox, .wiki-content-scroll .navbox { display: none; }' +
                '</style>';

            if (!$('style#wiki-plugin-style').length) $('head').append('<style id="wiki-plugin-style">' + style + '</style>');

            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            buttons_container.append(button);

            _this.performSearch(data.movie, function(hasResults) {
                if (hasResults) button.addClass('ready');
            });

            button.on('hover:enter click', function() {
                if (!isOpened) _this.handleButtonClick(data.movie);
            });
        };

        this.handleButtonClick = function(movie) {
            var _this = this;
            if (!movie) return;
            isOpened = true;

            if (cachedResults) {
                if (cachedResults.length > 0) _this.showMenu(cachedResults, movie.title || movie.name);
                else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
            } else if (searchPromise) {
                Lampa.Noty.show('Пошук у Wikidata...');
                searchPromise.done(function(results) {
                    if (results.length) _this.showMenu(results, movie.title || movie.name);
                    else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                }).fail(function() {
                    Lampa.Noty.show('Помилка даних'); isOpened = false;
                });
            } else {
                _this.performSearch(movie, function(hasResults) {
                     if (hasResults) _this.showMenu(cachedResults, movie.title || movie.name);
                     else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                });
            }
        };

        this.performSearch = function (movie, callback) {
            if (!movie || !movie.id) return $.Deferred().reject().promise();
            var _this = this;
            var def = $.Deferred();
            var method = (movie.original_name || movie.name) ? 'tv' : 'movie';
            var mainType = method === 'tv' ? 'television series' : 'film';
            var tmdbKey = Lampa.TMDB.key();

            $.ajax({
                url: Lampa.TMDB.api(method + '/' + movie.id + '/external_ids?api_key=' + tmdbKey),
                dataType: 'json',
                success: function(extResp) {
                    var mainQId = extResp.wikidata_id;
                    if (!mainQId) { cachedResults = []; if (callback) callback(false); def.reject(); return; }

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
                            extractQIds('P144', 'based on');
                            extractQIds('P155', 'follows');
                            extractQIds('P156', 'followed by');
                            extractQIds('P161', 'cast member', 5);
                            extractQIds('P725', 'voice actor', 3);
                            extractQIds('P57', 'director');
                            extractQIds('P1877', 'after a work by');
                            extractQIds('P138', 'named after');
                            extractQIds('P179', 'part of the series');

                            var uniqueQIds = targets.map(function(t) { return t.qId; }).filter(function(v, i, a) { return a.indexOf(v) === i; });

                            $.ajax({
                                url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + uniqueQIds.join('|') + '&props=sitelinks&format=json&origin=*',
                                dataType: 'json',
                                success: function(siteResp) {
                                    var finalResults = [];
                                    var entities = siteResp.entities || {};
                                    targets.forEach(function(t) {
                                        var entity = entities[t.qId];
                                        if (entity && entity.sitelinks) {
                                            var link = entity.sitelinks.ukwiki || entity.sitelinks.enwiki;
                                            if (link) {
                                                finalResults.push({
                                                    typeTitle: t.type,
                                                    title: link.title,
                                                    lang: entity.sitelinks.ukwiki ? 'ua' : 'en',
                                                    lang_icon: entity.sitelinks.ukwiki ? '🇺🇦' : '🇺🇸',
                                                    key: link.title
                                                });
                                            }
                                        }
                                    });
                                    cachedResults = finalResults;
                                    if (callback) callback(finalResults.length > 0);
                                    def.resolve(finalResults);
                                },
                                error: function() { def.reject(); }
                            });
                        }
                    });
                }
            });
            return def.promise();
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
                                </div>' +
                            '</div>');
                el.on('hover:enter click', function() {
                    menu.remove();
                    _this.showViewer(item.lang, item.key, item.title, current_controller); 
                });
                menu.find('.wiki-items-list').append(el);
            });

            $('body').append(menu);

            Lampa.Controller.add('wiki_menu', {
                toggle: function() {
                    Lampa.Controller.collectionSet(menu);
                    Lampa.Controller.collectionFocus(menu.find('.wiki-item')[0], menu);
                },
                up: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index > 0) {
                        Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index - 1], menu);
                        var list = menu.find('.wiki-items-list');
                        list.scrollTop(list.scrollTop() - 80);
                    }
                },
                down: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index < items.length - 1) {
                        Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index + 1], menu);
                        var list = menu.find('.wiki-items-list');
                        list.scrollTop(list.scrollTop() + 80);
                    }
                },
                back: function() {
                    menu.remove();
                    isOpened = false;
                    Lampa.Controller.toggle(current_controller); 
                }
            });
            Lampa.Controller.toggle('wiki_menu');
        };

        this.showViewer = function (lang, key, title, prev_controller) {
            var viewer = $('<div class="wiki-viewer-container"><div class="wiki-viewer-body">' +
                                '<div class="wiki-header">' +
                                    '<div class="wiki-title">' + title + '</div>' +
                                    '<div class="wiki-close-btn selector">×</div>' +
                                '</div>' +
                                '<div class="wiki-content-scroll">' +
                                    '<div class="wiki-loader">Завантаження...</div>' +
                                '</div></div></div>');
            $('body').append(viewer);

            var closeViewer = function() {
                viewer.remove();
                isOpened = false;
                Lampa.Controller.toggle(prev_controller);
            };

            Lampa.Controller.add('wiki_viewer', {
                toggle: function() {
                    Lampa.Controller.collectionSet(viewer);
                    Lampa.Controller.collectionFocus(viewer.find('.wiki-close-btn')[0], viewer);
                },
                up: function() { viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() - 150); },
                down: function() { viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() + 150); },
                back: closeViewer
            });
            Lampa.Controller.toggle('wiki_viewer');

            $.ajax({
                url: 'https://' + (lang === 'ua' ? 'uk' : 'en') + '.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(key),
                success: function(htmlContent) {
                    htmlContent = htmlContent.replace(/src="\/\//g, 'src="https://').replace(/href="\//g, 'href="https://wikipedia.org/').replace(/style="[^"]*"/g, "").replace(/bgcolor="[^"]*"/g, "");
                    var contentDiv = viewer.find('.wiki-content-scroll');
                    contentDiv.html(htmlContent);
                    contentDiv.find('script, style, link').remove();
                },
                error: function() { viewer.find('.wiki-loader').text('Помилка завантаження'); }
            });
        };
    }
    if (window.Lampa) window.wiki_info = new WikiInfoPlugin().init();
})();
