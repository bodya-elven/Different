(function () {
    'use strict';

    var MY_CATALOG_DOMAIN = 'https://w.porno365.gold'; 

    function startPlugin() {
        if (window.pluginx_ready) return;
        window.pluginx_ready = true;

        var css = '<style>' +
            '.my-youtube-style { padding: 0 !important; }' +
            '@media screen and (max-width: 580px) {' +
                '.my-youtube-style .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 5px !important; }' +
            '}' +
            '@media screen and (min-width: 581px) {' +
                '.my-youtube-style .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; }' +
            '}' +
            '.my-youtube-style .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; }' +
            '.my-youtube-style .card__img { object-fit: cover !important; }' +
            '.my-youtube-style .card__title { ' +
                'display: -webkit-box !important; ' +
                '-webkit-line-clamp: 3 !important; ' + 
                '-webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; ' +
                'white-space: normal !important; ' +
                'text-align: left !important; ' +
                'line-height: 1.2 !important; ' +
                'max-height: 3.6em !important; ' + 
                'padding-top: 2px !important; ' + 
                'margin-top: 0 !important; ' +
                'text-overflow: ellipsis !important; ' +
            '}' +
            '.my-youtube-style .card__age, .my-youtube-style .card__textbox { display: none !important; }' +
            '</style>';
        $('body').append(css);

        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object);
            var network = new Lampa.Reguest();

            function parseCards(doc, siteBaseUrl, isRelated) {
                var selector = isRelated ? '.related .related_video' : 'li.video_block, li.trailer';
                var elements = doc.querySelectorAll(selector);
                var results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var linkEl = el.querySelector('a.image');
                    var titleEl = el.querySelector('a.image p, .title');
                    var imgEl = el.querySelector('img'); 
                    var timeEl = el.querySelector('.duration'); 
                    if (linkEl && titleEl) {
                        var imgSrc = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || imgEl.getAttribute('src')) : '';
                        if (imgSrc && imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc;
                        var videoUrl = linkEl.getAttribute('href');
                        if (videoUrl && videoUrl.indexOf('http') !== 0) {
                            videoUrl = siteBaseUrl + (videoUrl.indexOf('/') === 0 ? '' : '/') + videoUrl;
                        }
                        results.push({
                            name: titleEl.innerText.trim() + (timeEl ? ' (' + timeEl.innerText.trim() + ')' : ''), 
                            url: videoUrl,
                            picture: imgSrc,
                            img: imgSrc
                        });
                    }
                }
                return results;
            }

            comp.create = function () {
                var _this = this;
                this.activity.loader(true);
                network.silent(object.url || MY_CATALOG_DOMAIN, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var siteBase = MY_CATALOG_DOMAIN.match(/^(https?:\/\/[^\/]+)/)[1];
                    var results = parseCards(doc, siteBase, object.is_related);
                    if (results.length > 0) {
                        _this.build({ results: results, collection: true, total_pages: 50, page: 1 });
                        _this.render().addClass('my-youtube-style');
                    } else { _this.empty(); }
                }, this.empty.bind(this), false, { dataType: 'text' });
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                var baseUrl = object.url || MY_CATALOG_DOMAIN;
                var separator = baseUrl.indexOf('?') !== -1 ? '&' : '/';
                var pageUrl = baseUrl + (baseUrl.endsWith('/') ? '' : separator) + object.page;
                
                network.silent(pageUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var siteBase = MY_CATALOG_DOMAIN.match(/^(https?:\/\/[^\/]+)/)[1];
                    var results = parseCards(doc, siteBase, false);
                    if (results.length > 0) resolve({ results: results, collection: true, total_pages: 50, page: object.page });
                    else reject();
                }, reject, false, { dataType: 'text' });
            };
            comp.filter = function () {
                try {
                    var currentUrl = (object.url || MY_CATALOG_DOMAIN).replace(/\/+$/, '');
                    
                    if (currentUrl.indexOf('/search/?q=') !== -1) {
                        currentUrl = currentUrl.replace('/search/?q=', '/search/');
                    }

                    var baseUrl = currentUrl
                        .split('?')[0]
                        .replace(/\/popular\/week$/, '')
                        .replace(/\/popular\/month$/, '')
                        .replace(/\/popular\/year$/, '')
                        .replace(/\/popular$/, '')
                        .replace(/\/+$/, '');

                    var cleanDomain = MY_CATALOG_DOMAIN.replace(/\/+$/, '');
                    
                    var isHome = (baseUrl === cleanDomain);
                    var isModelOrTag = baseUrl.indexOf('/models/') !== -1 || baseUrl.indexOf('/tags/') !== -1;
                    
                    var filter_items = [
                        { title: 'Пошук', action: 'search' },
                        { title: 'Категорії', action: 'categories' },
                        { title: 'Нові', url: baseUrl || cleanDomain }
                    ];

                    if (isModelOrTag) {
                        filter_items.push({ title: 'Топ переглядів', url: baseUrl + '/popular' });
                    } else {
                        filter_items.push({ title: 'Топ переглядів', action: 'popular_menu' });
                    }

                    Lampa.Select.show({
                        title: 'Сортування',
                        items: filter_items,
                        onSelect: function (a) {
                            if (a.action === 'search') {
                                Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(value) {
                                    if (value) {
                                        var searchUrl = cleanDomain + '/search/?q=' + encodeURIComponent(value);
                                        Lampa.Activity.push({ url: searchUrl, title: 'Пошук: ' + value, component: 'pluginx_comp', page: 1 });
                                    }
                                    Lampa.Controller.toggle('content');
                                });
                            } else if (a.action === 'categories') {
                                network.silent(cleanDomain + '/categories', function(htmlText) {
                                    var parser = new DOMParser();
                                    var doc = parser.parseFromString(htmlText, 'text/html');
                                    var catLinks = doc.querySelectorAll('.categories-list-div a');
                                    var catItems = [];
                                    
                                    for (var i = 0; i < catLinks.length; i++) {
                                        var title = catLinks[i].getAttribute('title') || catLinks[i].innerText.trim();
                                        var href = catLinks[i].getAttribute('href');
                                        if (href && title) {
                                            var fullUrl = href.startsWith('http') ? href : cleanDomain + (href.startsWith('/') ? '' : '/') + href;
                                            catItems.push({ title: title, url: fullUrl });
                                        }
                                    }
                                    
                                    if (catItems.length > 0) {
                                        Lampa.Select.show({
                                            title: 'Категорії',
                                            items: catItems,
                                            onSelect: function(sub) {
                                                Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', page: 1 });
                                            },
                                            onBack: function() { comp.filter(); }
                                        });
                                    } else {
                                        if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Категорії не знайдено');
                                    }
                                }, function() {
                                    if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Помилка завантаження категорій');
                                }, false, { dataType: 'text' });

                            } else if (a.action === 'popular_menu') {
                                var popularItems = [
                                    { title: 'За весь час', url: baseUrl + '/popular' }
                                ];
                                
                                if (!isModelOrTag) {
                                    popularItems.push({ title: 'За місяць', url: baseUrl + '/popular/month' });
                                    popularItems.push({ title: 'За рік', url: baseUrl + '/popular/year' });
                                    if (isHome) { 
                                        popularItems.push({ title: 'За тиждень', url: baseUrl + '/popular/week' });
                                    }
                                }
                                
                                Lampa.Select.show({
                                    title: 'Топ переглядів',
                                    items: popularItems,
                                    onSelect: function(sub) {
                                        Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', page: 1 });
                                    },
                                    onBack: function() { comp.filter(); }
                                });
                            } else {
                                Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', page: 1 });
                            }
                        },
                        onBack: function () { Lampa.Controller.toggle('content'); }
                    });
                } catch (e) {
                    if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Помилка фільтра: ' + e.message);
                }
            };

            comp.onRight = comp.filter.bind(comp);

            comp.cardRender = function (card, element, events) {
                events.onEnter = function () {
                    network.silent(element.url, function(videoPageHtml) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(videoPageHtml, 'text/html');
                        var videoStreams = []; 
                        var qualityLinks = doc.querySelectorAll('.quality_chooser a');
                        for (var j = 0; j < qualityLinks.length; j++) {
                            var link = qualityLinks[j];
                            if (link.getAttribute('href')) videoStreams.push({ title: link.innerText.trim() || 'Відео', url: link.getAttribute('href') });
                        }
                        if (videoStreams.length === 0) {
                            var playBtn = doc.querySelector('a.btn-play.play-video');
                            if (playBtn && playBtn.getAttribute('href')) videoStreams.push({ title: 'Оригінал', url: playBtn.getAttribute('href') });
                        }
                        if (videoStreams.length > 0) {
                            var best = videoStreams[videoStreams.length - 1];
                            Lampa.Player.play({ title: element.name, url: best.url, quality: videoStreams });
                            Lampa.Player.playlist([{ title: element.name, url: best.url, quality: videoStreams }]);
                        }
                    }, false, false, { dataType: 'text' });
                };

                events.onMenu = function () {
                    network.silent(element.url, function (htmlText) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(htmlText, 'text/html');
                        var menuItems = [];
                        var modelElements = doc.querySelectorAll('.video-categories.video-models a');
                        for (var m = 0; m < modelElements.length; m++) {
                            menuItems.push({ title: modelElements[m].innerText.trim(), action: 'direct_link', url: modelElements[m].getAttribute('href') });
                        }
                        menuItems.push({ title: 'Категорії', action: 'categories' }, { title: 'Теги', action: 'tags' }, { title: 'Схожі відео', action: 'similar' });
                        Lampa.Select.show({
                            title: 'Дії',
                            items: menuItems,
                            onSelect: function (a) {
                                if (a.action === 'similar') {
                                    Lampa.Activity.push({ url: element.url, title: 'Схожі', component: 'pluginx_comp', page: 1, is_related: true });
                                } else if (a.action === 'direct_link') {
                                    Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', page: 1 });
                                } else {
                                    var selector = (a.action === 'categories') ? '.video-categories:not(.video-models) a' : '.video-tags a';
                                    var subItems = [];
                                    var subEls = doc.querySelectorAll(selector);
                                    for (var i = 0; i < subEls.length; i++) {
                                        if (subEls[i].getAttribute('href')) subItems.push({ title: subEls[i].innerText.trim(), url: subEls[i].getAttribute('href') });
                                    }
                                    if (subItems.length > 0) {
                                        Lampa.Select.show({
                                            title: a.action === 'categories' ? 'Категорії' : 'Теги',
                                            items: subItems,
                                            onSelect: function (item) { Lampa.Activity.push({ url: item.url, title: item.title, component: 'pluginx_comp', page: 1 }); },
                                            onBack: function () { events.onMenu(); }
                                        });
                                    }
                                }
                            },
                            onBack: function () { Lampa.Controller.toggle('content'); }
                        });
                    }, null, false, { dataType: 'text' });
                };
            };
            return comp;
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);

        (function() {
            var currentActivity;
            var hideTimeout;
            var isClicking = false; 
            
            var filterBtn = $('<div class="head__action head__settings selector">\n' +
                '            <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                '                <rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect>\n' +
                '                <rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect>\n' +
                '                <rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect>\n' +
                '                <rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect>\n' +
                '                <circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle>\n' +
                '                <circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle>\n' +
                '                <circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle>\n' +
                '            </svg>\n' +
                '        </div>');

            filterBtn.hide().on('hover:enter click', function() {
                if (isClicking) return;
                isClicking = true;
                setTimeout(function() { isClicking = false; }, 300);

                try {
                    if (currentActivity && currentActivity.activity) {
                        var c;
                        if (window.Lampa && window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) {
                            c = currentActivity.activity.component;
                        } else {
                            c = currentActivity.activity.component();
                        }

                        if (c && typeof c.filter === 'function') {
                            c.filter();
                        }
                    }
                } catch (e) {
                    console.log('Помилка виклику фільтра:', e);
                }
            });

            if ($('.head .open--search').length) {
                $('.head .open--search').before(filterBtn);
            } else {
                $('.head__actions').prepend(filterBtn);
            }

            Lampa.Listener.follow('activity', function(e) {
                if (e.type == 'start') currentActivity = e.object;
                
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function() {
                    if (currentActivity && currentActivity.component !== 'pluginx_comp') {
                        filterBtn.hide();
                    }
                }, 1000);

                if (e.type == 'start' && e.component == 'pluginx_comp') {
                    filterBtn.show();
                    currentActivity = e.object;
                }
            });
        })();
    }

    function addMenu() {
        var menuList = $('.menu .menu__list').eq(0);
        if (menuList.length && menuList.find('[data-action="pluginx"]').length === 0) {
            var item = $('<li class="menu__item selector" data-action="pluginx" id="menu_pluginx">' +
                         '<div class="menu__ico">' +
                         '<img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" />' +
                         '</div>' +
                         '<div class="menu__text">Каталог Х</div>' +
                         '</li>');
            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'Каталог Х', component: 'pluginx_comp', page: 1 });
            });
            var settings = menuList.find('[data-action="settings"]');
            if (settings.length) item.insertBefore(settings);
            else menuList.append(item);
        }
    }

    function initPlugin() {
        startPlugin();
        addMenu();
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                initPlugin();
            }
        });
    }

})();
