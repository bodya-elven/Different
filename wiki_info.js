(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        var ICON_WIKI = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Wikipedia_svg_logo.svg';
        var cachedResults = null;
        var searchPromise = null;

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
                
                // --- МЕНЮ ВИБОРУ (Оновлене) ---
                '.wiki-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-select-body { width: 90%; max-width: 650px; background: #1a1a1a; border-radius: 10px; padding: 20px; border: 1px solid #333; max-height: 80%; display: flex; flex-direction: column; }' +
                '.wiki-items-list { overflow-y: auto; flex: 1; }' +
                '.wiki-item { padding: 12px; margin: 6px 0; background: #252525; border-radius: 8px; display: flex; align-items: center; gap: 15px; border: 2px solid transparent; position: relative; }' +
                '.wiki-item.focus { border-color: #fff; background: #333; }' +
                
                // Стилі для типу контенту
                '.wiki-item__icon { font-size: 1.6em; width: 40px; text-align: center; }' +
                '.wiki-item__content { flex: 1; display: flex; flex-direction: column; }' +
                '.wiki-item__title { font-size: 1.1em; color: #fff; font-weight: 500; }' +
                '.wiki-item__type { font-size: 0.85em; color: #aaa; margin-top: 3px; }' +
                '.wiki-item__lang { font-size: 1.2em; opacity: 0.7; }' +
                
                // --- ПЕРЕГЛЯДАЧ ---
                '.wiki-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #121212; z-index: 2001; display: flex; flex-direction: column; }' +
                '.wiki-header { padding: 15px; background: #1f1f1f; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.wiki-title { font-size: 1.4em; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }' +
                '.wiki-close-btn { width: 40px; height: 40px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 2px solid transparent; }' +
                '.wiki-close-btn.focus { border-color: #fff; background: #555; }' +
                
                // --- СТАТТЯ ---
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 20px 5%; color: #d0d0d0; line-height: 1.6; font-size: 1.1em; }' +
                '.wiki-loader { text-align: center; margin-top: 50px; color: #888; }' +
                '.wiki-content-scroll h1, .wiki-content-scroll h2 { color: #fff; border-bottom: 1px solid #333; margin-top: 1.5em; padding-bottom: 0.3em; }' +
                '.wiki-content-scroll p { margin-bottom: 1em; text-align: justify; }' +
                '.wiki-content-scroll a { color: #8ab4f8; text-decoration: none; pointer-events: none; }' +
                '.wiki-content-scroll .infobox { background: #1a1a1a !important; border: 1px solid #333; color: #ccc; margin-bottom: 20px; box-sizing: border-box; }' +
                '.wiki-content-scroll .infobox td, .wiki-content-scroll .infobox th { padding: 5px; border-bottom: 1px solid #333; vertical-align: top; }' +
                '.wiki-content-scroll .infobox img { max-width: 100%; height: auto; border-radius: 5px; }' +
                '.wiki-content-scroll table { background: #1a1a1a !important; color: #ccc !important; width: 100% !important; display: block; overflow-x: auto; margin: 15px 0; border-collapse: collapse; }' +
                '.wiki-content-scroll table td, .wiki-content-scroll table th { border: 1px solid #444; padding: 8px; background: transparent !important; color: inherit !important; min-width: 100px; }' +
                '.wiki-content-scroll .thumb { background: transparent; margin: 10px auto; max-width: 100%; width: auto !important; }' +
                '.wiki-content-scroll .thumbinner { background: #1a1a1a; padding: 5px; border-radius: 5px; width: auto !important; max-width: 100%; box-sizing: border-box; }' +
                '.wiki-content-scroll img { max-width: 100%; height: auto; }' +
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
                _this.handleButtonClick(data.movie);
            });
        };

        this.handleButtonClick = function(movie) {
            var _this = this;
            if (cachedResults) {
                if (cachedResults.length > 0) _this.showMenu(cachedResults, movie.title || movie.name);
                else Lampa.Noty.show('Нічого не знайдено');
            } else if (searchPromise) {
                Lampa.Noty.show('Пошук...');
                searchPromise.done(function(results) {
                    if (results.length) _this.showMenu(results, movie.title || movie.name);
                    else Lampa.Noty.show('Нічого не знайдено');
                });
            } else {
                _this.performSearch(movie, function(hasResults) {
                     if (hasResults) _this.showMenu(cachedResults, movie.title || movie.name);
                     else Lampa.Noty.show('Нічого не знайдено');
                });
            }
        };

        // --- ГОЛОВНА ЛОГІКА: Класифікатор типу контенту ---
        this.detectType = function(item, movieYear) {
            var t = (item.title + ' ' + (item.snippet || '')).toLowerCase();
            var title = item.title.toLowerCase();

            // 1. Фільм/Серіал
            // Якщо є рік фільму в заголовку або слова "фільм/серіал"
            if (movieYear && title.includes(movieYear)) return { type: 'Цей фільм/серіал', icon: '🎬', priority: 1 };
            if (t.includes('фільм') || t.includes('film') || t.includes('movie') || t.includes('серіал') || t.includes('series') || t.includes('episode') || t.includes('сезон')) {
                return { type: 'Фільм / Серіал', icon: '🎬', priority: 2 };
            }

            // 2. Книга / Комікс
            if (t.includes('роман') || t.includes('novel') || t.includes('книга') || t.includes('book') || t.includes('комікс') || t.includes('comic') || t.includes('манґа') || t.includes('manga') || t.includes('writer') || t.includes('письменник')) {
                return { type: 'Книга / Першоджерело', icon: '📖', priority: 3 };
            }

            // 3. Персонаж
            if (t.includes('персонаж') || t.includes('character') || t.includes('герой') || t.includes('fictional')) {
                return { type: 'Персонаж', icon: '👤', priority: 4 };
            }

            // 4. Гра
            if (t.includes('відеогра') || t.includes('video game') || t.includes('shooter') || t.includes('rpg')) {
                return { type: 'Відеогра', icon: '🎮', priority: 5 };
            }
            
            // 5. Люди (актори, режисери) - проста евристика: якщо немає слів "фільм/книга" і це просто Ім'я Прізвище
            // Це складно визначити точно без NLP, тому залишимо як "Стаття" або "Інше"
            
            return { type: 'Стаття', icon: '📄', priority: 6 };
        };

        this.performSearch = function (movie, callback) {
            if (!movie) return;
            var _this = this;

            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            var titleUA = (movie.title || movie.name || '').replace(/[^\w\sа-яієїґ]/gi, '');
            var titleEN = (movie.original_title || movie.original_name || '').replace(/[^\w\s]/gi, '');
            
            // Шукаємо ШИРОКО (без року в запиті), щоб знайти книги, ігри і т.д.
            // Srlimit збільшено до 7, щоб захопити більше варіантів
            var p1 = $.ajax({ url: 'https://uk.wikipedia.org/w/api.php', data: { action: 'query', list: 'search', srsearch: titleUA, srlimit: 7, format: 'json', origin: '*' }, dataType: 'json' });
            var p2 = $.ajax({ url: 'https://en.wikipedia.org/w/api.php', data: { action: 'query', list: 'search', srsearch: titleEN, srlimit: 7, format: 'json', origin: '*' }, dataType: 'json' });

            searchPromise = $.when(p1, p2).then(function (r1, r2) {
                var results = [];

                // Обробка UA
                if (r1[0] && r1[0].query && r1[0].query.search) {
                    r1[0].query.search.forEach(function(i) {
                        var info = _this.detectType(i, year);
                        results.push({ ...i, lang: 'ua', lang_icon: '🇺🇦', key: i.title, typeInfo: info });
                    });
                }
                // Обробка EN
                if (r2[0] && r2[0].query && r2[0].query.search) {
                    r2[0].query.search.forEach(function(i) {
                        if (!results.some(function(r) { return r.title === i.title && r.lang === 'ua' })) {
                            var info = _this.detectType(i, year);
                            results.push({ ...i, lang: 'en', lang_icon: '🇺🇸', key: i.title, typeInfo: info });
                        }
                    });
                }

                // Сортування: Спочатку пріоритетні (фільм/рік), потім книги, потім все інше
                results.sort(function(a, b) {
                    return a.typeInfo.priority - b.typeInfo.priority;
                });

                cachedResults = results;
                if (callback) callback(results.length > 0);
                return results;
            }, function() {
                cachedResults = [];
                if (callback) callback(false);
                return [];
            });
        };

        this.showMenu = function(items, movieTitle) {
            var _this = this;
            var current_controller = Lampa.Controller.enabled().name;
            var menu = $('<div class="wiki-select-container"><div class="wiki-select-body">' +
                            '<div style="font-size: 1.4em; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">Wikipedia: ' + movieTitle + '</div>' +
                            '<div class="wiki-items-list"></div></div></div>');

            items.forEach(function(item) {
                // Рендер елемента з іконкою та типом
                var el = $('<div class="wiki-item selector">' +
                                '<div class="wiki-item__icon">' + item.typeInfo.icon + '</div>' +
                                '<div class="wiki-item__content">' + 
                                    '<div class="wiki-item__title">' + item.title + '</div>' +
                                    '<div class="wiki-item__type">' + item.typeInfo.type + '</div>' +
                                '</div>' +
                                '<div class="wiki-item__lang">' + item.lang_icon + '</div>' +
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
                    if (index > 0) Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index - 1], menu);
                },
                down: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index < items.length - 1) Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index + 1], menu);
                },
                back: function() {
                    menu.remove();
                    Lampa.Controller.toggle(current_controller);
                }
            });
            Lampa.Controller.toggle('wiki_menu');
        };

        this.showViewer = function (lang, key, title, prev_controller) {
            var viewer = $('<div class="wiki-viewer-container">' +
                                '<div class="wiki-header">' +
                                    '<div class="wiki-title">' + title + '</div>' +
                                    '<div class="wiki-close-btn selector">×</div>' +
                                '</div>' +
                                '<div class="wiki-content-scroll">' +
                                    '<div class="wiki-loader">Завантаження...</div>' +
                                '</div></div>');

            $('body').append(viewer);

            var closeViewer = function() {
                viewer.remove();
                Lampa.Controller.toggle(prev_controller);
            };

            viewer.find('.wiki-close-btn').on('hover:enter click', closeViewer);

            Lampa.Controller.add('wiki_viewer', {
                toggle: function() {
                    Lampa.Controller.collectionSet(viewer);
                    Lampa.Controller.collectionFocus(viewer.find('.wiki-close-btn')[0], viewer);
                },
                up: function() { 
                    viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() - 50); 
                },
                down: function() { 
                    viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() + 50); 
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
