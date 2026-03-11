(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        
        // Вшита SVG іконка Вікіпедії (адаптована під Lampa: єдиний колір, без градієнтів, правильний viewBox)
        var ICON_WIKI = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path d="M63.607 74.503c-.996-.052-2.687-.084-2.9-1.889-.107-.907 3.614-4.249 2.68-5.58-.233-.332-.909-.69-2.504-1.143-1.904-.42-5.314-.146-11.204 1.977-.265.096.079-.032-.132.044-.229.081-.111.033-.264.088.182-.061-.266.112-1.055.396-.064.031-.11.058-1.054.352-1.293-4.653 2.193-13.24 5.141-13.533 1.2-.119 2.541 1.554 4.262.615 3.1-1.691 3.417-4.277 2.988-7.469-.327-2.43-2.838-.132-4.525.527-1.833.716-1.871 1.146-2.373.659-1.528-1.483-.681-4.84 5.316-11.468 2.105-2.326 3.053-5.638 3.164-6.766.127-1.299-4.059 2.34-4.482 1.45-.294-.62 3.356-4.171 5.229-5.141.869-.45.874.51 1.494.439.808-.092 5.868-4.71 5.536-5.448-.218-.483-3.872 1.626-4.042 1.099-.092-.285 3.779-2.241 3.779-2.241s-.021-.099 0-.176c-1.523.546-21.552 6.944-37.303 30.537C6.151 89.584 16.574 140.516 54.6 165.541s89.339 14.686 114.546-23.067c12.603-18.876 16.318-41.086 12.127-61.688-4.193-20.602-17.543-39.097-22.496-41.477.989.968 1.641 1.579 1.361 1.933-.162.206-1.373.438-2.504-.791-1.132-1.228-6.436-5.342-7.074-6.283-.64-.94-.518-1.26-.176-1.318.342-.058.908.137 1.143.264.233.126-5.178-4.201-5.537-4.438-.357-.236-1.348-.638-1.537-.571-.332.117.862.941.658 1.143-.186.184-.742.08-1.186-.308-.223-.194-6.137-4.498-9.754-5.888-2.141.322-3.507.527-3.734.966-.326.629 4.822 2.7 5.096 3.208.288.532-.811 1.31-1.845 1.45-3.236.438-4.49-1.133-4.878-2.021-1.359-3.121-7.203-1.975-12.346 1.362-2.221 1.441-10.902 1.425-10.984.308-.158-2.147.639-3.563-4.614-2.68-3.693.62-4.682 1.931-4.35 2.197.615.495 3.137 1.382 3.339 2.197.137.554-3.165 3.657-12.259 3.032-.904 4.828-.866 5.897.044 7.381s2.371 2.057 3.208 1.846c1.93-.488 3.839-2.784 5.272-2.812 2.507-.052 4.208 2.361 4.086 5.624.013-.005.032.005.044 0-.003.114-.035.201-.044.308-.004.044.005.088 0 .132-.401 3.607-4.548 2.264-7.338 1.582-3.55-.869-3.575 11.03-.22 13.313-6.562-.697-14.868 2.424-19.245 4.35-3.61 1.588 3.413 4.926 2.197 6.063-1.427 1.335-4.397 2.606-6.678 3.164-1.283.311-4.358.531-5.315.481z"/><path d="M68.489 20.802c-30.185 12.312-51.411 41.46-51.411 75.89 0 45.48 37.123 82.382 82.867 82.382 45.744 0 82.866-36.902 82.866-82.382 0-21.583-8.381-41.194-22.057-55.889-.944.973-2.523.854-4.744-1.538-1.664-1.792-8.016-7.024-5.141-6.283 2.34.604-5.632-5.603-6.226-4.856-.637.8-.178.256-.636.806-4.143-2.673-8.955-6.833-11.77-5.616-2.064.893-1.936.31-1.701 1.249.236.939 1.389 3.212 3.1 4.092-.036.003-.125.294-2.561-.078-2.87-.438-1.668-3.673-5.035-3.626-1.932.027-4.068-.089-5.577.911-4.81 3.187-8.321 2.968-13.231 3.148-3.752.138-.028-2.932-3.334-3.412-1.465-.214-4.625.04-6.143.931-1.193.702-1.676.047-.931 5.648-3.553 1.583-8.125.495-9.007 1.286-.751.674-1.661 7.343.823 10.7 3.15 4.257 6.264-2.86 9.239-1.122.895.522 2.204 2.139 1.845 2.417-1.58 1.221-2.623-.077-6.59.878-1.654.398-7.293 3.618-11.983 3.38.175-.259.494-.176.847-1.335.56-1.844-3.014-3.809-8.194.031-.395.292.766 1.616 1.319 2.45-2.042.533-5.433 3.064-13.149 2.726.464-3.383-2.749-6.471-3.56-6.399-1.137.101-2.325 1.274-3.6 1.895 1.542-2.774 1.806-3.543 2.713-4.587 2.836-3.266 4.478-4.803 5.559-8.992.108-.417.604-.193-1.271-2.734 3.548-3.262 2.242-.979 3.749-1.461 1.502-.481 4.676-4.711 4.046-5.947-.825-1.619.134-1.868-1.121-4.563z"/></svg>';
        
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
                                ICON_WIKI +
                                '<span>Wikipedia</span>' +
                            '</div>');

            var style = '<style>' +
                /* Оновлені стилі для ідеального центрування іконки */
                '.lampa-wiki-button { display: flex !important; align-items: center; justify-content: center; gap: 7px; opacity: 0.7; transition: opacity 0.3s; } ' +
                '.lampa-wiki-button.ready { opacity: 1; } ' +
                '.lampa-wiki-button svg { width: 1.6em; height: 1.6em; margin: 0 !important; } ' +
                
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
                
                /* Висвітлення основного тексту статті */
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 20px 5%; color: #efefef; line-height: 1.6; font-size: 1.3em; -webkit-overflow-scrolling: touch; }' +
                '.wiki-loader { text-align: center; margin-top: 50px; color: #888; }' +
                
                '.wiki-content-scroll table { font-size: inherit !important; }' + 
                
                '.wiki-content-scroll h1, .wiki-content-scroll h2 { color: #fff; border-bottom: 1px solid #333; margin-top: 1.5em; padding-bottom: 0.3em; }' +
                '.wiki-content-scroll p { margin-bottom: 1em; text-align: justify; }' +
                /* Висвітлення посилань */
                '.wiki-content-scroll a { color: #aaa !important; text-decoration: none; pointer-events: none; }' +
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
                Lampa.Noty.show('Збір даних з Wikidata...');
                searchPromise.done(function(results) {
                    if (results.length) _this.showMenu(results, movie.title || movie.name);
                    else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                }).fail(function() {
                    Lampa.Noty.show('Помилка завантаження даних'); isOpened = false;
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
                            extractQIds('P144', 'based on');
                            extractQIds('P155', 'follows');
                            extractQIds('P156', 'followed by');
                            extractQIds('P161', 'cast member', 5);
                            extractQIds('P725', 'voice actor', 3);
                            extractQIds('P57', 'director');
                            extractQIds('P1877', 'after a work by');
                            extractQIds('P138', 'named after');
                            extractQIds('P179', 'part of the series');

                            if (targets.length === 0) {
                                cachedResults = [];
                                if (callback) callback(false);
                                def.reject();
                                return;
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
                                            if (entity.sitelinks.ukwiki) {
                                                finalResults.push({
                                                    typeTitle: t.type,
                                                    title: entity.sitelinks.ukwiki.title,
                                                    lang: 'ua',
                                                    lang_icon: '🇺🇦',
                                                    key: entity.sitelinks.ukwiki.title
                                                });
                                            } else if (entity.sitelinks.enwiki) {
                                                finalResults.push({
                                                    typeTitle: t.type,
                                                    title: entity.sitelinks.enwiki.title,
                                                    lang: 'en',
                                                    lang_icon: '🇺🇸',
                                                    key: entity.sitelinks.enwiki.title
                                                });
                                            }
                                        }
                                    });

                                    cachedResults = finalResults;
                                    if (callback) callback(finalResults.length > 0);
                                    def.resolve(finalResults);
                                },
                                error: function() {
                                    cachedResults = [];
                                    if (callback) callback(false);
                                    def.reject();
                                }
                            });
                        },
                        error: function() {
                            cachedResults = [];
                            if (callback) callback(false);
                            def.reject();
                        }
                    });
                },
                error: function() {
                    cachedResults = [];
                    if (callback) callback(false);
                    def.reject();
                }
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
                        
                        /* Повноцінна прокрутка вгору */
                        var list = menu.find('.wiki-items-list');
                        var focusItem = menu.find('.wiki-item.focus');
                        if (focusItem.length && focusItem.position().top < 50) {
                            list.scrollTop(list.scrollTop() - 100);
                        }
                    }
                },
                down: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index < items.length - 1) {
                        Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index + 1], menu);
                        
                        /* Оптимізована прокрутка вниз */
                        var list = menu.find('.wiki-items-list');
                        var focusItem = menu.find('.wiki-item.focus');
                        if (focusItem.length && focusItem.position().top > list.height() - 100) {
                            list.scrollTop(list.scrollTop() + 100);
                        }
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

            viewer.find('.wiki-close-btn').on('click hover:enter', function(e) {
                e.preventDefault();
                closeViewer();
            });

            Lampa.Controller.add('wiki_viewer', {
                toggle: function() {
                    Lampa.Controller.collectionSet(viewer);
                    Lampa.Controller.collectionFocus(viewer.find('.wiki-close-btn')[0], viewer);
                },
                up: function() { 
                    viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() - 100); 
                },
                down: function() { 
                    viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() + 100); 
                },
                back: closeViewer
            });

            Lampa.Controller.toggle('wiki_viewer');

            var apiUrl = 'https://' + (lang === 'ua' ? 'uk' : 'en') + '.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(key);

            $.ajax({
                url: apiUrl,
                timeout: 15000,
                success: function(htmlContent) {
                    htmlContent = htmlContent.replace(/src="\/\//g, 'src="https://');
                    htmlContent = htmlContent.replace(/href="\//g, 'href="https://wikipedia.org/');
                    htmlContent = htmlContent.replace(/srcset=/g, 'data-srcset='); // Фікс для відображення фото
                    htmlContent = htmlContent.replace(/style="[^"]*"/g, ""); 
                    htmlContent = htmlContent.replace(/bgcolor="[^"]*"/g, "");
                    
                    var contentDiv = viewer.find('.wiki-content-scroll');
                    contentDiv.html(htmlContent);
                    contentDiv.find('script, style, link').remove();
                },
                error: function() {
                    viewer.find('.wiki-loader').text('Не вдалося завантажити статтю');
                }
            });
        };
    }

    if (window.Lampa) window.wiki_info = new WikiInfoPlugin().init();
})();