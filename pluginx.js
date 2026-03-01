(function () {
    'use strict';

    var MY_CATALOG_DOMAIN = 'https://w.porno365.gold'; 
    var LENKINO_DOMAIN = 'https://wes.lenkino.adult';

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

        var previewTimeout;
        var activePreviewNode;

        function hidePreview() {
            clearTimeout(previewTimeout);
            if (activePreviewNode) {
                var vid = activePreviewNode.find('video')[0];
                if (vid) {
                    try { vid.pause(); } catch(e) {}
                    vid.removeAttribute('src');
                    vid.load();
                }
                activePreviewNode.remove();
                activePreviewNode = null;
            }
        }

        function showPreview(element, src) {
            var previewContainer = $('<div class="sisi-video-preview" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;overflow:hidden;z-index:2;background:#000;"><video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video></div>');
            var videoEl = previewContainer.find('video')[0];
            videoEl.src = src;
            $(element).find('.card__view').append(previewContainer);
            activePreviewNode = previewContainer;
            
            var playPromise = videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(function(){});
            }
        }

        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object);
            var currentSite = object.site || 'porno365';

            function smartRequest(url, onSuccess, onError) {
                var network = new Lampa.Reguest();
                var isAndroid = typeof window !== 'undefined' && window.Lampa && window.Lampa.Platform && typeof window.Lampa.Platform.is === 'function' && window.Lampa.Platform.is('android');
                var headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
                };

                if (isAndroid) {
                    network.native(url, function (res) {
                        onSuccess(typeof res === 'object' ? JSON.stringify(res) : res);
                    }, function (err) {
                        if (onError) onError(err);
                    }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                } else {
                    network.silent(url, onSuccess, function (err) {
                        if (onError) onError(err);
                    }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                }
            }

            function parseCards365(doc, siteBaseUrl, isRelated) {
                var selector = isRelated ? '.related .related_video' : 'li.video_block, li.trailer';
                var elements = doc.querySelectorAll(selector);
                var results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var linkEl = el.querySelector('a.image');
                    var titleEl = el.querySelector('a.image p, .title');
                    var imgEl = el.querySelector('img'); 
                    var timeEl = el.querySelector('.duration'); 
                    var videoPreviewEl = el.querySelector('video'); 
                    
                    if (linkEl && titleEl) {
                        var imgSrc = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || imgEl.getAttribute('src')) : '';
                        if (imgSrc && imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc;
                        var videoUrl = linkEl.getAttribute('href');
                        if (videoUrl && videoUrl.indexOf('http') !== 0) {
                            videoUrl = siteBaseUrl + (videoUrl.indexOf('/') === 0 ? '' : '/') + videoUrl;
                        }
                        var previewUrl = videoPreviewEl ? videoPreviewEl.getAttribute('src') : '';
                        if (previewUrl && previewUrl.indexOf('//') === 0) previewUrl = 'https:' + previewUrl;

                        results.push({
                            name: titleEl.innerText.trim() + (timeEl ? ' (' + timeEl.innerText.trim() + ')' : ''), 
                            url: videoUrl,
                            picture: imgSrc,
                            img: imgSrc,
                            preview: previewUrl
                        });
                    }
                }
                return results;
            }

            function parseCardsLenkino(doc, siteBaseUrl) {
                var listBlock = doc.querySelector('#list_videos_videos_list');
                var elements = listBlock ? listBlock.querySelectorAll('.item') : doc.querySelectorAll('.grd-vid .item, #list_videos_videos_list_items .item');
                
                if (elements.length === 0) elements = doc.querySelectorAll('.item'); 
                
                var results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var linkEl = el.querySelector('a');
                    var titleEl = el.querySelector('.itm-tit');
                    var imgEl = el.querySelector('img.lzy') || el.querySelector('img');
                    var timeEl = el.querySelector('.itm-dur');
                    
                    if (linkEl && titleEl) {
                        var imgSrc = imgEl ? (imgEl.getAttribute('data-srcset') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                        if (imgSrc && imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc;
                        else if (imgSrc && imgSrc.indexOf('/') === 0) imgSrc = siteBaseUrl + imgSrc;
                        
                        var videoUrl = linkEl.getAttribute('href');
                        if (videoUrl && videoUrl.indexOf('http') !== 0) {
                            videoUrl = siteBaseUrl + (videoUrl.indexOf('/') === 0 ? '' : '/') + videoUrl;
                        }

                        var previewUrl = imgEl ? (imgEl.getAttribute('data-preview') || '') : '';
                        if (previewUrl && previewUrl.indexOf('//') === 0) previewUrl = 'https:' + previewUrl;
                        else if (previewUrl && previewUrl.indexOf('/') === 0) previewUrl = siteBaseUrl + previewUrl;
                        
                        results.push({
                            name: titleEl.innerText.trim() + (timeEl ? ' (' + timeEl.innerText.trim() + ')' : ''), 
                            url: videoUrl,
                            picture: imgSrc,
                            img: imgSrc,
                            preview: previewUrl
                        });
                    }
                }
                return results;
            }
            comp.create = function () {
                var _this = this;
                this.activity.loader(true);
                
                var targetUrl = object.url;
                if (!targetUrl) targetUrl = currentSite === 'lenkino' ? LENKINO_DOMAIN : MY_CATALOG_DOMAIN;

                if (currentSite === 'lenkino') {
                    targetUrl = targetUrl.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    targetUrl = targetUrl + '/page/' + (object.page || 1);
                }

                smartRequest(targetUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var results = [];
                    
                    if (currentSite === 'lenkino') {
                        var siteBaseLenkino = LENKINO_DOMAIN.replace(/\/+$/, '');
                        results = parseCardsLenkino(doc, siteBaseLenkino);
                    } else {
                        var siteBase365 = MY_CATALOG_DOMAIN.replace(/\/+$/, '');
                        results = parseCards365(doc, siteBase365, object.is_related);
                    }

                    if (results.length > 0) {
                        _this.build({ results: results, collection: true, total_pages: 50, page: 1 });
                        _this.render().addClass('my-youtube-style');
                    } else { _this.empty(); }
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                
                var baseUrl = object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : MY_CATALOG_DOMAIN);
                var pageUrl = '';

                if (currentSite === 'lenkino') {
                    baseUrl = baseUrl.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    pageUrl = baseUrl + '/page/' + object.page;
                } else {
                    var separator = baseUrl.indexOf('?') !== -1 ? '&' : '/';
                    pageUrl = baseUrl + (baseUrl.endsWith('/') ? '' : separator) + object.page;
                }
                
                smartRequest(pageUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var results = [];

                    if (currentSite === 'lenkino') {
                        results = parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, ''));
                    } else {
                        results = parseCards365(doc, MY_CATALOG_DOMAIN.replace(/\/+$/, ''), false);
                    }

                    if (results.length > 0) resolve({ results: results, collection: true, total_pages: 50, page: object.page });
                    else reject();
                }, reject);
            };

            comp.filter = function () {
                try {
                    if (currentSite === 'lenkino') {
                        var currentLUrl = (object.url || LENKINO_DOMAIN).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                        var baseLUrl = currentLUrl.replace(/\/top-porno$/, '').replace(/\/hot-porno$/, '').replace(/-top$/, '');
                        var cleanLDomain = LENKINO_DOMAIN.replace(/\/+$/, '');
                        
                        var lFilterItems = [
                            { title: 'Пошук', action: 'search' },
                            { title: 'Категорії', action: 'categories' },
                            { title: 'Студії', action: 'studios' },
                            { title: 'Нові', url: baseLUrl || cleanLDomain },
                            { title: 'Топ переглядів', action: 'popular_menu' }
                        ];

                        Lampa.Select.show({
                            title: 'Сортування Lenkino',
                            items: lFilterItems,
                            onSelect: function (a) {
                                if (a.action === 'search') {
                                    Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(value) {
                                        if (value) {
                                            var searchUrl = cleanLDomain + '/search/' + encodeURIComponent(value);
                                            Lampa.Activity.push({ url: searchUrl, title: 'Пошук: ' + value, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                        }
                                        Lampa.Controller.toggle('content');
                                    });
                                } else if (a.action === 'categories') {
                                    var lenkinoCats = [
                                        {title: "Русское порно", url: "a1-russian"}, {title: "Порно зрелых", url: "milf-porn"},
                                        {title: "Анал", url: "anal-porno"}, {title: "Большие сиськи", url: "big-tits"},
                                        {title: "Домашнее порно", url: "amateur"}, {title: "Молодые", url: "teen"},
                                        {title: "Лесби", url: "lesbi-porno"}, {title: "Мастурбация", url: "masturbation"},
                                        {title: "Минет", url: "blowjob"}, {title: "Групповуха", url: "group-videos"},
                                        {title: "Азиатки", url: "asian"}, {title: "БДСМ", url: "bdsm"},
                                        {title: "Красивый секс", url: "beautiful"}, {title: "POV", url: "pov"}
                                    ];
                                    var catItems = lenkinoCats.map(function(c) {
                                        return { title: c.title, url: cleanLDomain + '/' + c.url };
                                    });
                                    Lampa.Select.show({
                                        title: 'Категорії',
                                        items: catItems,
                                        onSelect: function(sub) {
                                            Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                        },
                                        onBack: function() { comp.filter(); }
                                    });
                                } else if (a.action === 'studios') {
                                    smartRequest(cleanLDomain + '/channels/', function(htmlText) {
                                        var parser = new DOMParser();
                                        var doc = parser.parseFromString(htmlText, 'text/html');
                                        var studiosEls = doc.querySelectorAll('.grd-spn a');
                                        var studiosItems = [];
                                        for (var i = 0; i < studiosEls.length; i++) {
                                            var title = studiosEls[i].getAttribute('title') || studiosEls[i].innerText.trim();
                                            var href = studiosEls[i].getAttribute('href');
                                            if (href && title) {
                                                var fullUrl = href.startsWith('http') ? href : cleanLDomain + (href.startsWith('/') ? '' : '/') + href;
                                                studiosItems.push({ title: title, url: fullUrl });
                                            }
                                        }
                                        if (studiosItems.length > 0) {
                                            Lampa.Select.show({
                                                title: 'Студії',
                                                items: studiosItems,
                                                onSelect: function(sub) {
                                                    Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                                },
                                                onBack: function() { comp.filter(); }
                                            });
                                        } else {
                                            if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Студії не знайдено');
                                        }
                                    }, function() {
                                        if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Помилка завантаження студій');
                                    });
                                } else if (a.action === 'popular_menu') {
                                    var isLCategory = baseLUrl !== cleanLDomain && baseLUrl.indexOf('/search/') === -1 && baseLUrl.indexOf('/channels/') === -1;
                                    var lPopularItems = [];
                                    if (isLCategory) {
                                        lPopularItems.push({ title: 'Кращі (Топ)', url: baseLUrl + '-top' });
                                    } else {
                                        lPopularItems.push({ title: 'Кращі (Топ)', url: cleanLDomain + '/top-porno' });
                                        lPopularItems.push({ title: 'Гарячі', url: cleanLDomain + '/hot-porno' });
                                    }
                                    Lampa.Select.show({
                                        title: 'Топ переглядів',
                                        items: lPopularItems,
                                        onSelect: function(sub) {
                                            Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                        },
                                        onBack: function() { comp.filter(); }
                                    });
                                } else {
                                    Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                }
                            },
                            onBack: function () { Lampa.Controller.toggle('content'); }
                        });
                    } else {
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
                                            Lampa.Activity.push({ url: searchUrl, title: 'Пошук: ' + value, component: 'pluginx_comp', site: 'porno365', page: 1 });
                                        }
                                        Lampa.Controller.toggle('content');
                                    });
                                } else if (a.action === 'categories') {
                                    smartRequest(cleanDomain + '/categories', function(htmlText) {
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
                                                    Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'porno365', page: 1 });
                                                },
                                                onBack: function() { comp.filter(); }
                                            });
                                        } else {
                                            if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Категорії не знайдено');
                                        }
                                    }, function() {
                                        if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Помилка завантаження категорій');
                                    });
                                } else if (a.action === 'popular_menu') {
                                    var popularItems = [{ title: 'За весь час', url: baseUrl + '/popular' }];
                                    if (!isModelOrTag) {
                                        popularItems.push({ title: 'За місяць', url: baseUrl + '/popular/month' });
                                        popularItems.push({ title: 'За рік', url: baseUrl + '/popular/year' });
                                        if (isHome) { popularItems.push({ title: 'За тиждень', url: baseUrl + '/popular/week' }); }
                                    }
                                    Lampa.Select.show({
                                        title: 'Топ переглядів',
                                        items: popularItems,
                                        onSelect: function(sub) {
                                            Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'porno365', page: 1 });
                                        },
                                        onBack: function() { comp.filter(); }
                                    });
                                } else {
                                    Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: 'porno365', page: 1 });
                                }
                            },
                            onBack: function () { Lampa.Controller.toggle('content'); }
                        });
                    }
                } catch (e) {
                    if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Помилка фільтра: ' + e.message);
                }
            };

            comp.onRight = comp.filter.bind(comp);

            comp.cardRender = function (card, element, events) {
                events.onEnter = function () {
                    hidePreview();
                    smartRequest(element.url, function(html) {
                        var videoStreams = []; 
                        if (currentSite === 'lenkino') {
                            var matchUrl = html.match(/video_url:[\t ]+'([^']+)'/);
                            var matchAlt = html.match(/video_alt_url:[\t ]+'([^']+)'/);
                            if (matchAlt && matchAlt[1]) videoStreams.push({ title: 'Сервер 2', url: matchAlt[1] });
                            if (matchUrl && matchUrl[1]) videoStreams.push({ title: 'Сервер 1', url: matchUrl[1] });
                        } else {
                            var parser = new DOMParser();
                            var doc = parser.parseFromString(html, 'text/html');
                            var qualityLinks = doc.querySelectorAll('.quality_chooser a');
                            for (var j = 0; j < qualityLinks.length; j++) {
                                var link = qualityLinks[j];
                                if (link.getAttribute('href')) videoStreams.push({ title: link.innerText.trim() || 'Відео', url: link.getAttribute('href') });
                            }
                            if (videoStreams.length === 0) {
                                var playBtn = doc.querySelector('a.btn-play.play-video');
                                if (playBtn && playBtn.getAttribute('href')) videoStreams.push({ title: 'Оригінал', url: playBtn.getAttribute('href') });
                            }
                        }

                        if (videoStreams.length > 0) {
                            var best = videoStreams[videoStreams.length - 1];
                            Lampa.Player.play({ title: element.name, url: best.url, quality: videoStreams });
                            Lampa.Player.playlist([{ title: element.name, url: best.url, quality: videoStreams }]);
                        } else {
                            if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Відео не знайдено');
                        }
                    }, function() {
                        if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Помилка завантаження відео');
                    });
                };
                events.onMenu = function () {
                    hidePreview();
                    if (currentSite === 'lenkino') {
                        smartRequest(element.url, function (htmlText) {
                            var parser = new DOMParser();
                            var doc = parser.parseFromString(htmlText, 'text/html');
                            var menuItems = [];
                            
                            var modelElements = doc.querySelectorAll('.grd-mdl a');
                            for (var m = 0; m < modelElements.length; m++) {
                                menuItems.push({ title: modelElements[m].innerText.trim(), action: 'direct_link', url: modelElements[m].getAttribute('href') });
                            }
                            menuItems.push({ title: 'Категорії', action: 'categories' }, { title: 'Схожі відео', action: 'similar' });
                            
                            Lampa.Select.show({
                                title: 'Дії',
                                items: menuItems,
                                onSelect: function (a) {
                                    if (a.action === 'similar') {
                                        Lampa.Activity.push({ url: element.url, title: 'Схожі', component: 'pluginx_comp', site: 'lenkino', page: 1, is_related: true });
                                    } else if (a.action === 'direct_link') {
                                        Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                    } else if (a.action === 'categories') {
                                        var subItems = [];
                                        var subEls = doc.querySelectorAll('.vid-cat a');
                                        for (var i = 0; i < subEls.length; i++) {
                                            if (subEls[i].getAttribute('href')) subItems.push({ title: subEls[i].innerText.trim(), url: subEls[i].getAttribute('href') });
                                        }
                                        if (subItems.length > 0) {
                                            Lampa.Select.show({
                                                title: 'Категорії',
                                                items: subItems,
                                                onSelect: function (item) { Lampa.Activity.push({ url: item.url, title: item.title, component: 'pluginx_comp', site: 'lenkino', page: 1 }); },
                                                onBack: function () { events.onMenu(); }
                                            });
                                        } else {
                                            if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Категорії не знайдено');
                                        }
                                    }
                                },
                                onBack: function () { Lampa.Controller.toggle('content'); }
                            });
                        }, function() {});
                    } else {
                        smartRequest(element.url, function (htmlText) {
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
                                        Lampa.Activity.push({ url: element.url, title: 'Схожі', component: 'pluginx_comp', site: 'porno365', page: 1, is_related: true });
                                    } else if (a.action === 'direct_link') {
                                        Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: 'porno365', page: 1 });
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
                                                onSelect: function (item) { Lampa.Activity.push({ url: item.url, title: item.title, component: 'pluginx_comp', site: 'porno365', page: 1 }); },
                                                onBack: function () { events.onMenu(); }
                                            });
                                        }
                                    }
                                },
                                onBack: function () { Lampa.Controller.toggle('content'); }
                            });
                        }, function() {});
                    }
                };

                // 1. Стандартний фокус для телевізора (пульт)
                var originalOnFocus = events.onFocus;
                events.onFocus = function (target, card_data) {
                    if (originalOnFocus) originalOnFocus(target, card_data);
                    hidePreview();
                    if (card.preview) {
                        previewTimeout = setTimeout(function () {
                            showPreview(element, card.preview);
                        }, 1000);
                    }
                };

                // 2. Для ПК (мишка) та Телефонів (тапи)
                var startY = 0;
                var isTouching = false;

                element.on('mouseenter', function() {
                    if (isTouching) return;
                    hidePreview();
                    if (card.preview) {
                        previewTimeout = setTimeout(function () {
                            showPreview(element, card.preview);
                        }, 800);
                    }
                }).on('mouseleave', function() {
                    if (!isTouching) hidePreview();
                });

                element.on('touchstart', function(e) {
                    if (e.originalEvent && e.originalEvent.touches) {
                        startY = e.originalEvent.touches[0].clientY;
                    }
                    isTouching = true;
                    hidePreview();
                    if (card.preview) {
                        previewTimeout = setTimeout(function () {
                            if (isTouching) showPreview(element, card.preview);
                        }, 500); // 0.5 сек для швидкого прев'ю на телефоні
                    }
                });

                element.on('touchmove', function(e) {
                    if (e.originalEvent && e.originalEvent.touches) {
                        var moveY = e.originalEvent.touches[0].clientY;
                        if (Math.abs(moveY - startY) > 10) { // Якщо палець зсунувся
                            isTouching = false;
                            hidePreview();
                        }
                    }
                });

                element.on('touchend touchcancel', function() {
                    isTouching = false;
                    hidePreview();
                });

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
                        if (c && typeof c.filter === 'function') c.filter();
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
                
                try { if (typeof hidePreview === 'function') hidePreview(); } catch (err) {}
                
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function() {
                    if (currentActivity && currentActivity.component !== 'pluginx_comp') filterBtn.hide();
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
                         '<div class="menu__text">Каталоги X</div>' +
                         '</li>');
            
            item.on('hover:enter', function () {
                Lampa.Select.show({
                    title: 'Оберіть сайт',
                    items: [
                        { title: 'Porno365', site: 'porno365' },
                        { title: 'Lenkino', site: 'lenkino' }
                    ],
                    onSelect: function(a) {
                        Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 });
                    },
                    onBack: function() { Lampa.Controller.toggle('menu'); }
                });
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
