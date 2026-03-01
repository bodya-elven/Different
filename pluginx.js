(function () {
    'use strict';

    var PORNO365_DOMAIN = 'https://w.porno365.gold'; 
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
            '.my-studios-style { padding: 0 !important; }' +
            '@media screen and (max-width: 580px) {' +
                '.my-studios-style .card { width: 50% !important; margin-bottom: 10px !important; padding: 0 5px !important; }' +
            '}' +
            '@media screen and (min-width: 581px) {' +
                '.my-studios-style .card { width: 16.666% !important; margin-bottom: 15px !important; padding: 0 6px !important; }' +
            '}' +
            '.my-studios-style .card__view { padding-bottom: 60% !important; border-radius: 12px !important; }' +
            '.my-studios-style .card__img { object-fit: contain !important; background: #111; }' +
            '.my-studios-style .card__title { ' +
                'display: -webkit-box !important; ' +
                '-webkit-line-clamp: 2 !important; ' + 
                '-webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; ' +
                'white-space: normal !important; ' +
                'text-align: center !important; ' +
                'line-height: 1.2 !important; ' +
                'padding-top: 4px !important; ' + 
                'margin-top: 0 !important; ' +
            '}' +
            '.my-studios-style .card__age, .my-studios-style .card__textbox { display: none !important; }' +
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

        function showPreview(target, src) {
            var previewContainer = $('<div class="sisi-video-preview" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;overflow:hidden;z-index:2;background:#000;"><video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video></div>');
            var videoEl = previewContainer.find('video')[0];
            videoEl.src = src;
            target.find('.card__view').append(previewContainer);
            activePreviewNode = previewContainer;
            var playPromise = videoEl.play();
            if (playPromise !== undefined) playPromise.catch(function(){});
        }
        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object);
            var currentSite = object.site || 'porno365';

            function smartRequest(url, onSuccess, onError) {
                var network = new Lampa.Reguest();
                var isAndroid = typeof window !== 'undefined' && window.Lampa && window.Lampa.Platform && typeof window.Lampa.Platform.is === 'function' && window.Lampa.Platform.is('android');
                var headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" };

                if (isAndroid) {
                    network.native(url, function (res) { onSuccess(typeof res === 'object' ? JSON.stringify(res) : res); }, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                } else {
                    network.silent(url, onSuccess, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                }
            }

            function parseFolders365(doc, siteBaseUrl) {
                var elements = doc.querySelectorAll('.categories-list-div, .categories-item');
                var results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var linkEl = el.querySelector('a');
                    var titleEl = el.querySelector('.title, .categories-title');
                    var imgEl = el.querySelector('img');
                    var countEl = el.querySelector('.text');
                    if (linkEl && titleEl) {
                        var imgSrc = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                        if (imgSrc && imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc;
                        var url = linkEl.getAttribute('href');
                        if (url && url.indexOf('http') !== 0) url = siteBaseUrl + (url.indexOf('/') === 0 ? '' : '/') + url;
                        var timeText = countEl ? countEl.innerText.trim() + ' відео' : '';
                        results.push({ name: titleEl.innerText.trim() + (timeText ? ' (' + timeText + ')' : ''), url: url, picture: imgSrc, img: imgSrc, is_folder: true });
                    }
                }
                return results;
            }

            function parseFoldersLenkino(doc, siteBaseUrl, type) {
                var selector = type === 'spn' ? '.grd-spn .item' : '.grd-cat .item';
                var elements = doc.querySelectorAll(selector);
                var results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var linkEl = el.querySelector('a');
                    var titleEl = el.querySelector('.itm-tit');
                    var imgEl = el.querySelector('img');
                    var countEl = el.querySelector('.itm-opt li');
                    if (linkEl && titleEl) {
                        var imgSrc = imgEl ? (imgEl.getAttribute('data-srcset') || imgEl.getAttribute('src')) : '';
                        if (imgSrc && imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc;
                        else if (imgSrc && imgSrc.indexOf('/') === 0) imgSrc = siteBaseUrl + imgSrc;
                        var url = linkEl.getAttribute('href');
                        if (url && url.indexOf('http') !== 0) url = siteBaseUrl + (url.indexOf('/') === 0 ? '' : '/') + url;
                        var timeText = countEl ? countEl.innerText.trim() : '';
                        results.push({ name: titleEl.innerText.trim() + (timeText ? ' (' + timeText + ')' : ''), url: url, picture: imgSrc, img: imgSrc, is_folder: true });
                    }
                }
                return results;
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
                        if (videoUrl && videoUrl.indexOf('http') !== 0) videoUrl = siteBaseUrl + (videoUrl.indexOf('/') === 0 ? '' : '/') + videoUrl;
                        
                        var previewUrl = '';
                        if (videoPreviewEl) {
                            previewUrl = videoPreviewEl.getAttribute('data-src') || videoPreviewEl.getAttribute('src') || '';
                            if (!previewUrl) {
                                var sourceEl = videoPreviewEl.querySelector('source');
                                if (sourceEl) previewUrl = sourceEl.getAttribute('data-src') || sourceEl.getAttribute('src') || '';
                            }
                        }
                        if (previewUrl && previewUrl.indexOf('//') === 0) previewUrl = 'https:' + previewUrl;
                        
                        results.push({ name: titleEl.innerText.trim() + (timeEl ? ' (' + timeEl.innerText.trim() + ')' : ''), url: videoUrl, picture: imgSrc, img: imgSrc, preview: previewUrl });
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
                        if (videoUrl && videoUrl.indexOf('http') !== 0) videoUrl = siteBaseUrl + (videoUrl.indexOf('/') === 0 ? '' : '/') + videoUrl;
                        
                        var previewUrl = imgEl ? (imgEl.getAttribute('data-preview') || '') : '';
                        if (!previewUrl && linkEl) previewUrl = linkEl.getAttribute('data-preview') || '';
                        
                        if (previewUrl && previewUrl.indexOf('//') === 0) previewUrl = 'https:' + previewUrl;
                        else if (previewUrl && previewUrl.indexOf('/') === 0) previewUrl = siteBaseUrl + previewUrl;
                        
                        results.push({ name: titleEl.innerText.trim() + (timeEl ? ' (' + timeEl.innerText.trim() + ')' : ''), url: videoUrl, picture: imgSrc, img: imgSrc, preview: previewUrl });
                    }
                }
                return results;
            }
            comp.create = function () {
                var _this = this;
                this.activity.loader(true);
                
                var targetUrl = object.url;
                if (!targetUrl) targetUrl = currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN;

                if (currentSite === 'lenkino' && !object.is_folder_list) {
                    targetUrl = targetUrl.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    targetUrl = targetUrl + '/page/' + (object.page || 1);
                } else if (currentSite === 'lenkino' && object.is_folder_list && object.folder_type === 'spn' && object.page > 1) {
                    targetUrl = targetUrl.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    targetUrl = targetUrl + '/page/' + object.page;
                }

                smartRequest(targetUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var results = [];
                    
                    if (object.is_folder_list) {
                        if (currentSite === 'lenkino') results = parseFoldersLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, ''), object.folder_type);
                        else results = parseFolders365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''));
                    } else {
                        if (currentSite === 'lenkino') results = parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, ''));
                        else results = parseCards365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''), object.is_related);
                    }

                    if (results.length > 0) {
                        _this.build({ results: results, collection: true, total_pages: object.is_folder_list ? (currentSite === 'lenkino' ? 50 : 1) : 50, page: 1 });
                        _this.render().addClass(object.is_folder_list ? 'my-studios-style' : 'my-youtube-style');
                    } else { _this.empty(); }
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                
                var baseUrl = object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN);
                var pageUrl = '';

                if (currentSite === 'lenkino') {
                    baseUrl = baseUrl.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    pageUrl = baseUrl + '/page/' + object.page;
                } else {
                    if (object.is_folder_list) return reject(); 
                    var separator = baseUrl.indexOf('?') !== -1 ? '&' : '/';
                    pageUrl = baseUrl + (baseUrl.endsWith('/') ? '' : separator) + object.page;
                }
                
                smartRequest(pageUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var results = [];

                    if (object.is_folder_list) {
                        if (currentSite === 'lenkino') results = parseFoldersLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, ''), object.folder_type);
                        else results = [];
                    } else {
                        if (currentSite === 'lenkino') results = parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, ''));
                        else results = parseCards365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''), false);
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
                            title: 'Навігація',
                            items: lFilterItems,
                            onSelect: function (a) {
                                if (a.action === 'search') {
                                    Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(value) {
                                        if (value) Lampa.Activity.push({ url: cleanLDomain + '/search/' + encodeURIComponent(value), title: 'Пошук: ' + value, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                        Lampa.Controller.toggle('content');
                                    });
                                } else if (a.action === 'categories') {
                                    Lampa.Activity.push({ url: cleanLDomain + '/categories', title: 'Категорії', component: 'pluginx_comp', site: 'lenkino', is_folder_list: true, folder_type: 'cat', page: 1 });
                                } else if (a.action === 'studios') {
                                    Lampa.Activity.push({ url: cleanLDomain + '/channels', title: 'Студії', component: 'pluginx_comp', site: 'lenkino', is_folder_list: true, folder_type: 'spn', page: 1 });
                                } else if (a.action === 'popular_menu') {
                                    var isLCategory = baseLUrl !== cleanLDomain && baseLUrl.indexOf('/search/') === -1 && baseLUrl.indexOf('/channels') === -1 && baseLUrl.indexOf('/categories') === -1;
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
                                        onSelect: function(sub) { Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'lenkino', page: 1 }); },
                                        onBack: function() { comp.filter(); }
                                    });
                                } else {
                                    Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: 'lenkino', page: 1 });
                                }
                            },
                            onBack: function () { Lampa.Controller.toggle('content'); }
                        });
                    } else {
                        var currentUrl = (object.url || PORNO365_DOMAIN).replace(/\/+$/, '');
                        if (currentUrl.indexOf('/search/?q=') !== -1) currentUrl = currentUrl.replace('/search/?q=', '/search/');
                        var baseUrl = currentUrl.split('?')[0].replace(/\/popular\/week$/, '').replace(/\/popular\/month$/, '').replace(/\/popular\/year$/, '').replace(/\/popular$/, '').replace(/\/+$/, '');
                        var cleanDomain = PORNO365_DOMAIN.replace(/\/+$/, '');
                        var isHome = (baseUrl === cleanDomain);
                        var isModelOrTag = baseUrl.indexOf('/models/') !== -1 || baseUrl.indexOf('/tags/') !== -1;
                        
                        var filter_items = [
                            { title: 'Пошук', action: 'search' },
                            { title: 'Категорії', action: 'categories' },
                            { title: 'Нові', url: baseUrl || cleanDomain }
                        ];

                        if (isModelOrTag) filter_items.push({ title: 'Топ переглядів', url: baseUrl + '/popular' });
                        else filter_items.push({ title: 'Топ переглядів', action: 'popular_menu' });

                        Lampa.Select.show({
                            title: 'Навігація',
                            items: filter_items,
                            onSelect: function (a) {
                                if (a.action === 'search') {
                                    Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(value) {
                                        if (value) Lampa.Activity.push({ url: cleanDomain + '/search/?q=' + encodeURIComponent(value), title: 'Пошук: ' + value, component: 'pluginx_comp', site: 'porno365', page: 1 });
                                        Lampa.Controller.toggle('content');
                                    });
                                } else if (a.action === 'categories') {
                                    Lampa.Activity.push({ url: cleanDomain + '/categories', title: 'Категорії', component: 'pluginx_comp', site: 'porno365', is_folder_list: true, folder_type: 'cat', page: 1 });
                                } else if (a.action === 'popular_menu') {
                                    var popularItems = [{ title: 'За весь час', url: baseUrl + '/popular' }];
                                    if (!isModelOrTag) {
                                        popularItems.push({ title: 'За місяць', url: baseUrl + '/popular/month' });
                                        popularItems.push({ title: 'За рік', url: baseUrl + '/popular/year' });
                                        if (isHome) popularItems.push({ title: 'За тиждень', url: baseUrl + '/popular/week' });
                                    }
                                    Lampa.Select.show({
                                        title: 'Топ переглядів',
                                        items: popularItems,
                                        onSelect: function(sub) { Lampa.Activity.push({ url: sub.url, title: sub.title, component: 'pluginx_comp', site: 'porno365', page: 1 }); },
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
                var $el = $(element);
                
                if (card.is_folder) {
                    events.onEnter = function () {
                        Lampa.Activity.push({ url: card.url, title: card.name, component: 'pluginx_comp', site: currentSite, page: 1 });
                    };
                    events.onMenu = function () {};
                } else {
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
                                    var modHref = modelElements[m].getAttribute('href');
                                    if(modHref) menuItems.push({ title: modelElements[m].innerText.trim(), action: 'direct_link', url: modHref });
                                }
                                menuItems.push({ title: 'Категорії / Студії', action: 'categories' }, { title: 'Схожі відео', action: 'similar' });
                                
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
                                                var cHref = subEls[i].getAttribute('href');
                                                if (cHref) subItems.push({ title: subEls[i].innerText.trim(), url: cHref });
                                            }
                                            if (subItems.length > 0) {
                                                Lampa.Select.show({
                                                    title: 'Категорії / Студії',
                                                    items: subItems,
                                                    onSelect: function (item) { Lampa.Activity.push({ url: item.url, title: item.title, component: 'pluginx_comp', site: 'lenkino', page: 1 }); },
                                                    onBack: function () { events.onMenu(); }
                                                });
                                            } else {
                                                if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show('Дані не знайдено');
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
                                    var modHref = modelElements[m].getAttribute('href');
                                    if (modHref) {
                                        if (modHref.indexOf('http') !== 0) modHref = PORNO365_DOMAIN + (modHref.indexOf('/') === 0 ? '' : '/') + modHref;
                                        menuItems.push({ title: modelElements[m].innerText.trim(), action: 'direct_link', url: modHref });
                                    }
                                }
                                menuItems.push({ title: 'Категорії та Теги', action: 'categories' }, { title: 'Схожі відео', action: 'similar' });
                                Lampa.Select.show({
                                    title: 'Дії',
                                    items: menuItems,
                                    onSelect: function (a) {
                                        if (a.action === 'similar') {
                                            Lampa.Activity.push({ url: element.url, title: 'Схожі', component: 'pluginx_comp', site: 'porno365', page: 1, is_related: true });
                                        } else if (a.action === 'direct_link') {
                                            Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: 'porno365', page: 1 });
                                        } else {
                                            var subItems = [];
                                            var subEls = doc.querySelectorAll('.video-categories:not(.video-models) a, .video-tags a');
                                            for (var i = 0; i < subEls.length; i++) {
                                                var cHref = subEls[i].getAttribute('href');
                                                if (cHref) {
                                                    if (cHref.indexOf('http') !== 0) cHref = PORNO365_DOMAIN + (cHref.indexOf('/') === 0 ? '' : '/') + cHref;
                                                    subItems.push({ title: subEls[i].innerText.trim(), url: cHref });
                                                }
                                            }
                                            if (subItems.length > 0) {
                                                Lampa.Select.show({
                                                    title: 'Категорії / Теги',
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

                    // Фокус для ТБ
                    var originalOnFocus = events.onFocus;
                    events.onFocus = function (target, card_data) {
                        if (originalOnFocus) originalOnFocus(target, card_data);
                        hidePreview();
                        if (card.preview) {
                            previewTimeout = setTimeout(function () {
                                showPreview($(target), card.preview);
                            }, 1000);
                        }
                    };

                    // Мишка для ПК
                    $el.on('mouseenter', function() {
                        hidePreview();
                        if (card.preview) {
                            previewTimeout = setTimeout(function () {
                                showPreview($el, card.preview);
                            }, 800);
                        }
                    }).on('mouseleave', function() {
                        hidePreview();
                    });

                    // Тач для мобільних (тривалий натиск 0.6 сек)
                    var touchTimer;
                    var isScrolling = false;
                    $el.on('touchstart', function() {
                        isScrolling = false;
                        hidePreview();
                        if (card.preview) {
                            touchTimer = setTimeout(function() {
                                if (!isScrolling) showPreview($el, card.preview);
                            }, 600);
                        }
                    }).on('touchmove', function() {
                        isScrolling = true;
                        clearTimeout(touchTimer);
                        hidePreview();
                    }).on('touchend touchcancel', function() {
                        clearTimeout(touchTimer);
                    });
                }
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
