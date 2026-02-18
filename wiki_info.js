(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        var ICON_WIKI = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Wikipedia_svg_logo.svg';
        var isOpened = false;

        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') {
                    _this.cleanup();
                    setTimeout(function() {
                        try {
                            _this.render(e.data, e.object.activity.render());
                        } catch (err) {}
                    }, 200);
                }
            });
        };

        this.cleanup = function() {
            $('.lampa-wiki-button').remove();
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
                '.lampa-wiki-button { display: flex !important; align-items: center; justify-content: center; } ' +
                '.wiki-icon-img { width: 1.6em; height: 1.6em; object-fit: contain; margin-right: 5px; filter: grayscale(100%) brightness(2); } ' + // Іконка кнопки світла
                '.wiki-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 2000; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-select-body { width: 50%; background: #1a1a1a; border-radius: 10px; padding: 25px; border: 1px solid #333; }' +
                '.wiki-item { padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.05); border-radius: 5px; cursor: pointer; border: 2px solid transparent; display: flex; align-items: center; gap: 10px; }' +
                '.wiki-item.focus { border-color: #fff; background: rgba(255,255,255,0.1); outline: none; }' +
                '.wiki-item__lang { font-size: 1.2em; }' +
                '.wiki-item__title { font-size: 1.1em; color: #fff; }' +
                
                // Стилі для переглядача (Viewer)
                '.wiki-viewer-container { position: fixed; top: 5%; left: 5%; width: 90%; height: 90%; background: #121212; z-index: 2001; border-radius: 10px; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.7); border: 1px solid #333; display: flex; flex-direction: column; }' +
                '.wiki-header { padding: 15px; background: #1f1f1f; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.wiki-title { font-size: 1.5em; font-weight: bold; color: #fff; margin-left: 10px; }' +
                '.wiki-close-btn { width: 40px; height: 40px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 24px; font-weight: bold; }' +
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 20px; color: #e0e0e0; font-family: sans-serif; line-height: 1.6; font-size: 1.1em; }' +
                
                // Стилізація контенту статті
                '.wiki-content-scroll h1, .wiki-content-scroll h2, .wiki-content-scroll h3 { color: #fff; border-bottom: 1px solid #333; padding-bottom: 0.3em; margin-top: 1.5em; }' +
                '.wiki-content-scroll a { color: #8ab4f8; text-decoration: none; pointer-events: none; }' + // Посилання неклікабельні
                '.wiki-content-scroll img { max-width: 100%; height: auto; border-radius: 5px; display: block; margin: 10px auto; }' +
                '.wiki-content-scroll table { background: #1e1e1e; color: #ccc; width: 100%; margin: 10px 0; border-collapse: collapse; }' +
                '.wiki-content-scroll th, .wiki-content-scroll td { padding: 8px; border: 1px solid #444; }' +
                '.wiki-content-scroll .infobox { background: #1e1e1e; border: 1px solid #333; float: right; margin-left: 20px; max-width: 300px; }' +
                '.wiki-content-scroll .thumb { background: #1e1e1e; border: 1px solid #333; padding: 5px; margin: 10px; }' +
                '.wiki-content-scroll .mw-empty-elt, .wiki-content-scroll .mw-editsection, .wiki-content-scroll .hatnote { display: none; }' + // Приховуємо сміття
                '</style>';

            if (!$('style#wiki-plugin-style').length) $('head').append('<style id="wiki-plugin-style">' + style + '</style>');

            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            buttons_container.append(button);

            button.on('hover:enter click', function() {
                if (!isOpened) _this.startSearch(data.movie);
            });

            if (Lampa.Controller.enabled().name === 'full_start') {
                Lampa.Controller.enable('full_start');
            }
        };

        this.startSearch = function (movie) {
            var _this = this;
            if (!movie) return;
            isOpened = true;
            Lampa.Noty.show('Пошук у Wikipedia...');

            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            var titleUA = (movie.title || movie.name || '').replace(/[^\w\sа-яієїґ]/gi, '');
            var titleEN = (movie.original_title || movie.original_name || '').replace(/[^\w\s]/gi, '');
            var isTV = !!(movie.first_air_date || movie.number_of_seasons);
            
            var results = [];
            var p1 = $.ajax({ url: 'https://uk.wikipedia.org/w/api.php', data: { action: 'query', list: 'search', srsearch: titleUA + ' ' + year + (isTV ? ' серіал' : ' фільм'), srlimit: 4, format: 'json', origin: '*' }, dataType: 'json' });
            var p2 = $.ajax({ url: 'https://en.wikipedia.org/w/api.php', data: { action: 'query', list: 'search', srsearch: titleEN + ' ' + year + (isTV ? ' series' : ' film'), srlimit: 4, format: 'json', origin: '*' }, dataType: 'json' });

            $.when(p1, p2).done(function (r1, r2) {
                if (r1[0].query && r1[0].query.search) {
                    r1[0].query.search.forEach(function(i) {
                        // Зберігаємо ключ сторінки (key) для API запиту
                        results.push({ title: i.title, lang: 'ua', lang_icon: '🇺🇦', key: i.title });
                    });
                }
                if (r2[0].query && r2[0].query.search) {
                    r2[0].query.search.forEach(function(i) {
                        results.push({ title: i.title, lang: 'en', lang_icon: '🇺🇸', key: i.title });
                    });
                }

                if (results.length) _this.showMenu(results, movie.title || movie.name);
                else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
            }).fail(function() { Lampa.Noty.show('Помилка запиту'); isOpened = false; });
        };

        this.showMenu = function(items, movieTitle) {
            var _this = this;
            var current_controller = Lampa.Controller.enabled().name;
            var menu = $('<div class="wiki-select-container"><div class="wiki-select-body">' +
                            '<div style="font-size: 1.4em; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">Wikipedia: ' + movieTitle + '</div>' +
                            '<div class="wiki-items-list" style="max-height: 60vh; overflow-y: auto;"></div></div></div>');

            items.forEach(function(item) {
                var el = $('<div class="wiki-item selector">' +
                                '<div class="wiki-item__lang">' + item.lang_icon + '</div>' +
                                '<div class="wiki-item__title">' + item.title + '</div>' +
                            '</div>');
                el.on('hover:enter click', function() {
                    menu.remove();
                    // Завантажуємо контент через API
                    _this.loadContent(item.lang, item.key, current_controller);
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
                    isOpened = false;
                    Lampa.Controller.toggle(current_controller);
                }
            });
            Lampa.Controller.toggle('wiki_menu');
        };

        this.loadContent = function(lang, key, prev_controller) {
            var _this = this;
            Lampa.Noty.show('Завантаження статті...');
            
            // Використовуємо REST API для отримання чистого HTML
            var apiUrl = 'https://' + (lang === 'ua' ? 'uk' : 'en') + '.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(key);

            $.ajax({
                url: apiUrl,
                success: function(htmlContent) {
                    _this.showViewer(htmlContent, key, prev_controller);
                },
                error: function() {
                    Lampa.Noty.show('Не вдалося завантажити статтю');
                    Lampa.Controller.toggle(prev_controller);
                }
            });
        };

        this.showViewer = function (content, title, prev_controller) {
            // Очищуємо HTML від зайвого
            // Базовий URL для картинок (щоб відносні шляхи працювали)
            content = content.replace(/src="\/\//g, 'src="https://');
            content = content.replace(/href="\//g, 'href="https://wikipedia.org/');

            var viewer = $('<div class="wiki-viewer-container">' +
                                '<div class="wiki-header">' +
                                    '<div class="wiki-title">' + title + '</div>' +
                                    '<div class="wiki-close-btn">×</div>' +
                                '</div>' +
                                '<div class="wiki-content-scroll">' +
                                    content +
                                '</div></div>');

            $('body').append(viewer);

            var closeViewer = function() {
                viewer.remove();
                isOpened = false;
                Lampa.Controller.toggle(prev_controller);
            };

            viewer.find('.wiki-close-btn').on('click', function(e) {
                e.preventDefault();
                closeViewer();
            });

            Lampa.Controller.add('wiki_viewer', {
                toggle: function() {
                    // Фокус на кнопці закриття або просто на контейнері
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
        };
    }

    if (window.Lampa) window.wiki_info = new WikiInfoPlugin().init();
})();
