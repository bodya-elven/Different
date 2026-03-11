(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        
        // ОРИГІНАЛЬНИЙ SVG код Вікіпедії, з правильним viewBox і СУЦІЛЬНИМИ кольорами (біла куля, чорні символи)
        // Це виправляє проблему деформації та відсутності символів, роблячи іконку чіткою та стильною.
        var ICON_WIKI = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><g><path fill="#fff" d="M63.607 74.503c-.996-.052-2.687-.084-2.9-1.889-.107-.907 3.614-4.249 2.68-5.58-.233-.332-.909-.69-2.504-1.143-1.904-.42-5.314-.146-11.204 1.977-.265.096.079-.032-.132.044-.229.081-.111.033-.264.088.182-.061-.266.112-1.055.396-.064.031-.11.058-1.054.352-1.293-4.653 2.193-13.24 5.141-13.533 1.2-.119 2.541 1.554 4.262.615 3.1-1.691 3.417-4.277 2.988-7.469-.327-2.43-2.838-.132-4.525.527-1.833.716-1.871 1.146-2.373.659-1.528-1.483-.681-4.84 5.316-11.468 2.105-2.326 3.053-5.638 3.164-6.766.127-1.299-4.059 2.34-4.482 1.45-.294-.62 3.356-4.171 5.229-5.141.869-.45.874.51 1.494.439.808-.092 5.868-4.71 5.536-5.448-.218-.483-3.872 1.626-4.042 1.099-.092-.285 3.779-2.241 3.779-2.241s-.021-.099 0-.176c-1.523.546-21.552 6.944-37.303 30.537C6.151 89.584 16.574 140.516 54.6 165.541s89.339 14.686 114.546-23.067c12.603-18.876 16.318-41.086 12.127-61.688-4.193-20.602-17.543-39.097-22.496-41.477.989.968 1.641 1.579 1.361 1.933-.162.206-1.373.438-2.504-.791-1.132-1.228-6.436-5.342-7.074-6.283-.64-.94-.518-1.26-.176-1.318.342-.058.908.137 1.143.264.233.126-5.178-4.201-5.537-4.438-.357-.236-1.348-.638-1.537-.571-.332.117.862.941.658 1.143-.186.184-.742.08-1.186-.308-.223-.194-6.137-4.498-9.754-5.888-2.141.322-3.507.527-3.734.966-.326.629 4.822 2.7 5.096 3.208.288.532-.811 1.31-1.845 1.45-3.236.438-4.49-1.133-4.878-2.021-1.359-3.121-7.203-1.975-12.346 1.362-2.221 1.441-10.902 1.425-10.984.308-.158-2.147.639-3.563-4.614-2.68-3.693.62-4.682 1.931-4.35 2.197.615.495 3.137 1.382 3.339 2.197.137.554-3.165 3.657-12.259 3.032-.904 4.828-.866 5.897.044 7.381s2.371 2.057 3.208 1.846c1.93-.488 3.839-2.784 5.272-2.812 2.507-.052 4.208 2.361 4.086 5.624.013-.005.032.005.044 0-.003.114-.035.201-.044.308-.004.044.005.088 0 .132-.401 3.607-4.548 2.264-7.338 1.582-3.55-.869-3.575 11.03-.22 13.313-6.562-.697-14.868 2.424-19.245 4.35-3.61 1.588 3.413 4.926 2.197 6.063-1.427 1.335-4.397 2.606-6.678 3.164-1.283.311-4.358.531-5.315.481z"/><path fill="#000" d="M172.113 85.299c-.967.927-1.264 2.099-.941 2.596.804 1.244 2.05-.029 2.58-.719.371-.481.592-1.152.541-1.706-.045-.494-.558-1.727-2.18-.171zm4.866 2.596c-.088-.452-1.49-5.836-1.514-5.91-.025-.073-.043-.131-.055-.173-.061-.218-.43-.188-.675-.234-.245-.046-.484-.063-.718-.048-.232.014-.359-.016-.379-.092-.031-.109.061-.231.271-.366.227-.144.582-.275 1.068-.396.486-.121.748-.08.787.122.122.593.281.922.572 2.066l1.088 4.28c.111.439.352 1.723.44 2.377s-.042 1.053-.211 1.161c-.132.085-.477-1.778-.674-2.787zm-.565-.766-2.438 2.766.28 1.094c.065.235.063.45.135.789.072.339.125.747.156 1.225.033.478-.026.76-.178.845-.072.007-.16-.11-.264-.35-.104-.24-.184-.481-.237-.723-.054-.242-.101-.419-.141-.533l-.398-1.786-1.257 1.033c-.066.062-.176.189-.331.381-.154.192-.281.319-.38.382-.163.104-.494.181-.995.232s-.772.001-.813-.15c-.01-.034 0-.074.029-.122.027-.047.057-.076.088-.086.504-.221 1.077-.536 1.72-.944.487-.309 1.177-.923 1.933-1.595.752-.67 1.371-1.322 1.892-1.811l1.032-1.146.167.499zm-4.014-2.833c.471-.279.98-.635 1.46-.524.479.11.898.697.952 1.254.064.676-.04 1.292-.371 1.912-.332.62-.799 1.247-1.33 1.68-1.371 1.115-2.192.694-2.592-.106-.396-.792.12-2.458.939-3.342.018-.022.095-.098.229-.228s.21-.21.227-.24c.038-.074.05-.136.036-.186s-.053-.094-.117-.133c-.064-.038-.102-.074-.111-.107l.011-.051c.013-.018.039-.04.081-.066.078-.049.191-.089.341-.12s.233-.013.252.055c.022.084.009.212-.044.383l.037-.181z"/><path fill="#000" d="m103.961 31.505 1.01-.483.758 1.986 2.913-1.468c1.34 4.981.802 9.445-2.849 14.859-.476-.436-.757-.975-.988-1.327 4.097-6.718 3.788-7.722 3.077-12.109l-4.487 2.434-.013 3.498-1.188.863.049-4.853 2.404-1.341m9.778-.697 3.335 5.569-.86.628-2.921-4.698c-.256.55-1.045 1.997-1.826 2.821-.086-.111-.178-.197-.273-.257-.086-.111-.156-.189-.213-.236 0 0-.136-.075-.408-.224.787-1.313 1.144-1.729 1.729-3.041.514-1.15.944-1.882 1.032-3.555l1.019-.045c-.089 1.414-.426 2.161-.614 3.038"/><path fill="#000" d="M178.598 107.902c1.643-2.445-.746-2.914-.467-4.624.494-3.038 3.916-8.803 4.438-9.109-1.035-.245-2-11.437-1.542-12.192-.687.412-.175 7.76 1.028 12.192-2.416 3.692-4.18 8.092-4.252 9.062-.149 2.02 1.713 2.822.795 4.671z"/><path fill="#000" d="M55.229 31.184c.885-.853 1.984-1.952 1.941-1.988-.162-.14-1.229.233-1.59.37-1.958 1.721-3.576 3.544-5.273 5.383l-.773.12c2.392-2.53 4.829-5.06 7.95-7.578l.649-.114-2.068 1.756c.244-.063.629-.189.806-.226.159-.032.945-.258 1.191-.146.313.143-1.321 1.537-1.993 2.281l-.84.142z"/><path fill="#000" d="M161.449 52.919c-.496.066-1.586.375-1.754.822-.118.316-.291.765.789 1.258.371.169 1.1-.34 1.711-.366 1.221-.052 2.189 2.046 1.615 3.61-.4 1.085-1.649 1.941-2.94 2.477-.895.372-1.572.294-2.188.143-.67-.164-1.162-.625-1.477-1.384-.217-.523-.359-1.106-.426-1.75.002-.541.434-.634.66.592.255.613.722 1.231 1.273 1.361.553.13 1.223.032 2.012-.296.604-.25 1.283-.871 1.824-1.592.903-1.203.557-2.109-.044-2.299-.286-.09-1.134.487-1.762.425-1.143-.114-1.999-1.556-2.001-2.071-.002-.652.468-1.021.906-1.326.699-.484 1.922-1.061 1.802.396zm2.795 6.933-.137 1.33-1.49-.141.242-1.248 1.385.059zm-2.012 1.318-.119 1.331-1.483-.126.104-1.325 1.498.12z"/><path fill="#000" d="M145.187 140.114c-.021-3.786-.076-3.94-.208-6.634-4.428 1.7-11.522 4.574-12.641 4.791-1.17.228-2.635.102-2.391-.762.199-.708 1.609-2.193 2.875-2.657-.405.536-.694 1.016 0 1.063.892.061 4.592-1.49 6.398-2.082 1.789-.587 5.521-2.623 6.624-2.18 1.12.451.882 4.145.882 6.814.001.38.115.701-.063.971-.325.5-.958.557-1.476.676z"/><path fill="#000" d="m173.42 118.395-.14 1.331-1.49-.12.115-1.33 1.515.119zm.12-2.731-.12 1.331-1.49-.12.115-1.33 1.495.119z"/><path fill="#000" d="M136.489 99.318c-.171-.547-.909-.302-2.011-.067l-.084-.269 6.609-2.317.082.269c-1.174.571-2.123 1.088-1.938 1.647l1.751 7.807c.082.219.89.061 2.086-.222l.083.269-6.488 2.455-.082-.269c1.322-.657 2.117-1.132 1.877-1.882l-1.324-6.236-8.182 10.198c.425.067 1.489-.018 2.287-.194l.082.27-7.271 2.209-.082-.27c1.531-.727 2.307-1.111 2.235-1.504l-1.731-7.873c-.054-.456-1.4-.392-2.521-.112l-.083-.269 7.73-2.429.083.269c-.82.394-2.871 1.131-2.659 1.831l1.458 6.608 8.093-9.919z"/><path fill="#000" d="m116.711 113.827-1.18 1.055 1.18-.135.1-.561-1.1.135 1.1-.115-.1-.379zm-62.2 10.798-1.609.047-.792-.302 1.896.347 1.62-.047-.115.045-1-.09z"/></g></svg>';

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
            if (容器.find('.lampa-wiki-button').length) return;

            // Змінено структуру кнопки: вставлено SVG безпосередньо, без img
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
                
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 20px 5%; color: #d0d0d0; line-height: 1.6; font-size: 1.3em; -webkit-overflow-scrolling: touch; }' +
                '.wiki-loader { text-align: center; margin-top: 50px; color: #888; }' +
                
                '.wiki-content-scroll table { font-size: inherit !important; }' + 
                
                '.wiki-content-scroll h1, .wiki-content-scroll h2 { color: #fff; border-bottom: 1px solid #333; margin-top: 1.5em; padding-bottom: 0.3em; }' +
                '.wiki-content-scroll p { margin-bottom: 1em; text-align: justify; }' +
                '.wiki-content-scroll a { color: #8ab4f8; text-decoration: none; pointer-events: none; }' +
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
