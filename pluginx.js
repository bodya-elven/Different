(function () {
    'use strict';

    var PORNO365_DOMAIN = 'https://w.porno365.gold'; 
    var LENKINO_DOMAIN = 'https://wes.lenkino.adult';

    function startPlugin() {
        if (window.pluginx_ready) return;
        window.pluginx_ready = true;

        // ВИПРАВЛЕНО: Прибрано приховування ::after та ::before, щоб повернути фокус пульта на ТБ
        var css = '<style>' +
            '.my-youtube-style { padding: 0 !important; }' +
            '@media screen and (max-width: 580px) {' +
                '.my-youtube-style .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 5px !important; }' +
                '.my-youtube-style.is-grid-cat .card, .my-youtube-style.is-models-grid .card { width: 50% !important; }' + 
            '}' +
            '@media screen and (min-width: 581px) {' +
                '.my-youtube-style .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; }' +
                '.my-youtube-style.is-grid-cat .card, .my-youtube-style.is-models-grid .card { width: 16.666% !important; }' + 
            '}' +
            '.my-youtube-style .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; overflow: hidden !important; }' +
            
            /* Стилі для Студій/Категорій (5:4 = 80%) та Моделей (2:3 = 150%) */
            '.my-youtube-style.is-grid-cat .card__view { padding-bottom: 80% !important; background: #ffffff !important; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); }' + 
            '.my-youtube-style.is-models-grid .card__view { padding-bottom: 150% !important; background: #ffffff !important; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); }' + 
            
            '.my-youtube-style .card__img { object-fit: cover !important; border-radius: 12px !important; }' +
            '.my-youtube-style.is-grid-cat .card__img, .my-youtube-style.is-models-grid .card__img { object-fit: cover !important; z-index: 2; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1 !important; }' +
            
            '.my-youtube-style .card__title { ' +
                'display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; white-space: normal !important; text-align: left !important; ' +
                'line-height: 1.2 !important; max-height: 3.6em !important; padding-top: 2px !important; margin-top: 0 !important; text-overflow: ellipsis !important; ' +
            '}' +
            /* Звичайний шрифт для назви сітки */
            '.my-youtube-style.is-grid-cat .card__title, .my-youtube-style.is-models-grid .card__title { -webkit-line-clamp: 2 !important; text-align: center !important; font-weight: normal !important; margin-top: 5px !important; }' +
            '.my-youtube-style .card__age, .my-youtube-style .card__textbox { display: none !important; }' +
            
            /* Заглушка для карток без картинки */
            '.grid-cat-empty { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000; text-align: center; padding: 10px; box-sizing: border-box; font-size: 1.1em; background: #ffffff !important; z-index: 1; word-break: break-word; border-radius: 12px !important; }' +
            
            '.pluginx-sep { font-size: 0.85em !important; opacity: 0.5; pointer-events: none !important; text-align: left !important; padding: 10px 20px 5px 20px !important; text-transform: uppercase; letter-spacing: 1px; color: #fff; border: none !important; background: transparent !important; box-shadow: none !important; }' +
            '.pluginx-filter-btn { order: -1 !important; margin-right: auto !important; }' +
            '.studio-count { font-size: 0.85em; color: #aaa; margin-top: 2px; display: block; text-align: center; }' +
            '</style>';
        $('body').append(css);

        var previewTimeout;
        var activePreviewNode;

        function hidePreview() {
            clearTimeout(previewTimeout);
            if (activePreviewNode) {
                var vid = activePreviewNode.find('video')[0];
                if (vid) { try { vid.pause(); } catch(e) {} vid.removeAttribute('src'); vid.load(); }
                activePreviewNode.remove(); activePreviewNode = null;
            }
        }

        function showPreview(target, src) {
            var previewContainer = $('<div class="sisi-video-preview" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;overflow:hidden;z-index:4;background:#000;"><video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video></div>');
            var videoEl = previewContainer.find('video')[0];
            videoEl.src = src;
            target.find('.card__view').append(previewContainer);
            activePreviewNode = previewContainer;
            var p = videoEl.play(); if (p !== undefined) p.catch(function(){});
        }

        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object);
            var currentSite = object.site || 'porno365';

            function smartRequest(url, onSuccess, onError) {
                var network = new Lampa.Reguest();
                var headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" };
                var isAndroid = typeof window !== 'undefined' && window.Lampa && window.Lampa.Platform && window.Lampa.Platform.is('android');
                if (isAndroid) network.native(url, function (res) { onSuccess(typeof res === 'object' ? JSON.stringify(res) : res); }, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                else network.silent(url, onSuccess, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
            }

            function parseCards365(doc, siteBaseUrl, isRelated) {
                var sel = isRelated ? '.related .related_video' : 'li.video_block, li.trailer';
                var elements = doc.querySelectorAll(sel), results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector('a.image'), titleEl = el.querySelector('a.image p, .title'), imgEl = el.querySelector('img'), timeEl = el.querySelector('.duration'), vP = el.querySelector('video');
                    if (linkEl && titleEl) {
                        var img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img;
                        var vUrl = linkEl.getAttribute('href');
                        if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        var pUrl = vP ? vP.getAttribute('src') : '';
                        if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                        results.push({ name: titleEl.innerText.trim() + (timeEl ? ' (' + timeEl.innerText.trim() + ')' : ''), url: vUrl, picture: img, img: img, preview: pUrl });
                    }
                }
                return results;
            }

            // РОЗУМНИЙ ПАРСЕР Lenkino: ігнорує каруселі студій/моделей при парсингу відео
            function parseCardsLenkino(doc, siteBaseUrl) {
                var isStudios = doc.querySelector('#list_content_sources_sponsors_list') !== null;
                var results = [];
                var elements = [];
                
                if (isStudios) {
                    elements = doc.querySelectorAll('.itm-crd-spn');
                } else {
                    var listContainer = doc.querySelector('#list_videos_videos_list');
                    if (listContainer) {
                        elements = listContainer.querySelectorAll('.item');
                    } else {
                        // Якщо ми в пошуку чи категоріях, шукаємо всі картки, але відкидаємо сміття
                        var allItems = doc.querySelectorAll('.item');
                        for(var k=0; k<allItems.length; k++) {
                            // Ігноруємо картки з класів студій/моделей або слайдери
                            if(!allItems[k].closest('.sxn-top') && !allItems[k].classList.contains('itm-crd') && !allItems[k].classList.contains('itm-crd-spn')) {
                                elements.push(allItems[k]);
                            }
                        }
                    }
                }

                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    var linkEl = el.querySelector(isStudios ? 'a.len_pucl' : 'a');
                    var titleEl = el.querySelector(isStudios ? '.itm-opt' : '.itm-tit'); 
                    var imgEl = el.querySelector('img.lzy') || el.querySelector('img');
                    var timeEl = el.querySelector(isStudios ? '.itm-opt li' : '.itm-dur');

                    if (linkEl) {
                        var title = "";
                        if (isStudios) {
                            title = linkEl.getAttribute('title') || (imgEl ? imgEl.getAttribute('alt') : '') || linkEl.innerText.trim();
                        } else {
                            title = titleEl ? titleEl.innerText.trim() : linkEl.innerText.trim();
                        }

                        var img = imgEl ? (imgEl.getAttribute('data-srcset') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img;
                        else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                        var vUrl = linkEl.getAttribute('href');
                        if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        
                        var pUrl = (!isStudios && imgEl) ? (imgEl.getAttribute('data-preview') || '') : '';
                        if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                        else if (pUrl && pUrl.indexOf('/') === 0) pUrl = siteBaseUrl + pUrl;

                        var countText = timeEl ? timeEl.innerText.trim().replace(/видео/gi, 'відео') : '';
                        
                        if (title) {
                            results.push({ 
                                name: title, 
                                video_count: isStudios ? countText : '', 
                                url: vUrl, 
                                picture: img, 
                                img: img, 
                                is_grid: isStudios, 
                                preview: pUrl,
                                no_img: isStudios && !img 
                            });
                        }
                    }
                }
                return results;
            }

            function parseCategories(doc, siteBaseUrl, siteType) {
                var results = [];
                var sel = (siteType === 'lenkino') ? '.grd-cat a' : '.categories-list-div a';
                var links = doc.querySelectorAll(sel);
                for (var i = 0; i < links.length; i++) {
                    var el = links[i];
                    var title = el.getAttribute('title') || el.innerText.trim();
                    var href = el.getAttribute('href');
                    var imgEl = el.querySelector('img');
                    var img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                    
                    if (img && img.indexOf('//') === 0) img = 'https:' + img;
                    else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                    if (href && title) {
                        var vUrl = href.startsWith('http') ? href : siteBaseUrl + (href.startsWith('/') ? '' : '/') + href;
                        results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true, no_img: !img });
                    }
                }
                return results;
            }

            function parseModels(doc, siteBaseUrl, siteType) {
                var results = [];
                if (siteType === 'lenkino') {
                    // Об'єднуємо список топу та загальний список
                    var elements = [];
                    var topList = doc.querySelector('#list_models_top_models_list');
                    var regList = doc.querySelector('#list_models_models_list');
                    
                    if (topList) {
                        var tops = topList.querySelectorAll('.item.itm-crd');
                        for(var t=0; t<tops.length; t++) elements.push(tops[t]);
                    }
                    if (regList) {
                        var regs = regList.querySelectorAll('.item.itm-crd');
                        for(var r=0; r<regs.length; r++) elements.push(regs[r]);
                    }
                    if(elements.length === 0) {
                        var all = doc.querySelectorAll('.item.itm-crd');
                        for(var a=0; a<all.length; a++) elements.push(all[a]);
                    }

                    for (var i = 0; i < elements.length; i++) {
                        var el = elements[i];
                        var linkEl = el.querySelector('a.len_pucl');
                        var imgEl = el.querySelector('img.lzy') || el.querySelector('img');
                        var titleEl = el.querySelector('.itm-tit');
                        
                        var liEls = el.querySelectorAll('.itm-opt li');
                        var countText = '';
                        for(var j=0; j<liEls.length; j++) {
                            if(liEls[j].innerText.indexOf('видео') !== -1) {
                                countText = liEls[j].innerText.trim().replace(/видео/gi, 'відео');
                                break;
                            }
                        }

                        if (linkEl && imgEl) {
                            var title = titleEl ? titleEl.innerText.trim() : (imgEl.getAttribute('alt') || 'Модель');
                            var href = linkEl.getAttribute('href');
                            var img = imgEl.getAttribute('data-srcset') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                            
                            if (img && img.indexOf('//') === 0) img = 'https:' + img;
                            else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                            var vUrl = href.startsWith('http') ? href : siteBaseUrl + (href.startsWith('/') ? '' : '/') + href;
                            results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true, is_model: true, video_count: countText, no_img: !img });
                        }
                    }
                } else {
                    var elements365 = doc.querySelectorAll('.item_model');
                    for (var k = 0; k < elements365.length; k++) {
                        var el365 = elements365[k];
                        var linkEl365 = el365.querySelector('a');
                        var nameEl = el365.querySelector('.model_eng_name');
                        var countEl = el365.querySelector('.cnt_span');
                        var imgEl365 = el365.querySelector('img');

                        if (linkEl365 && imgEl365 && nameEl) {
                            var title365 = nameEl.innerText.trim();
                            var countText365 = countEl ? countEl.innerText.trim() + ' відео' : '';
                            var href365 = linkEl365.getAttribute('href');
                            var img365 = imgEl365.getAttribute('data-src') || imgEl365.getAttribute('src') || '';
                            
                            if (img365 && img365.indexOf('//') === 0) img365 = 'https:' + img365;
                            else if (img365 && img365.indexOf('/') === 0) img365 = siteBaseUrl + img365;
                            
                            var vUrl365 = href365.startsWith('http') ? href365 : siteBaseUrl + (href365.startsWith('/') ? '' : '/') + href365;
                            results.push({ name: title365, url: vUrl365, picture: img365, img: img365, is_grid: true, is_model: true, video_count: countText365, no_img: !img365 });
                        }
                    }
                }
                return results;
            }
            comp.create = function () {
                var _this = this; this.activity.loader(true);
                var target = object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN);
                if (currentSite === 'lenkino') target = target.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '') + '/page/' + (object.page || 1);
                
                smartRequest(target, function (html) {
                    var parser = new DOMParser(), doc = parser.parseFromString(html, 'text/html');
                    
                    var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, '');
                    // Витягуємо чистий шлях для точного розпізнавання сторінки
                    var targetPath = target.replace(cleanD, '').split('?')[0].replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    
                    var isStudios = currentSite === 'lenkino' && targetPath === '/channels';
                    var isCategories = targetPath === '/categories';
                    
                    // ТОЧНА маршрутизація: відрізняємо каталог моделей від сторінки конкретної моделі
                    var isModels = false;
                    if (currentSite === 'lenkino') {
                        isModels = targetPath === '/pornstars';
                    } else {
                        isModels = targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0;
                    }
                    
                    var isGrid = isStudios || isCategories || isModels;
                    var res = [];

                    if (isCategories) {
                        res = parseCategories(doc, cleanD, currentSite);
                    } else if (isModels) {
                        res = parseModels(doc, cleanD, currentSite);
                    } else if (currentSite === 'lenkino') {
                        res = parseCardsLenkino(doc, cleanD);
                    } else {
                        res = parseCards365(doc, cleanD, object.is_related);
                    }
                    
                    if (res.length > 0) { 
                        _this.build({ results: res, collection: true, total_pages: 50, page: 1 }); 
                        var rendered = _this.render();
                        rendered.addClass('my-youtube-style');
                        
                        if (isStudios || isCategories) rendered.addClass('is-grid-cat');
                        if (isModels) rendered.addClass('is-models-grid');
                    } else { 
                        _this.empty(); 
                    }
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                var base = (object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN)).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                var url = (currentSite === 'lenkino') ? base + '/page/' + object.page : base + (base.indexOf('?') !== -1 ? '&' : '/') + object.page;
                
                smartRequest(url, function (html) {
                    var parser = new DOMParser(), doc = parser.parseFromString(html, 'text/html');
                    var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, '');
                    var targetPath = url.replace(cleanD, '').split('?')[0].replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    
                    var isCategories = targetPath === '/categories';
                    var isModels = false;
                    if (currentSite === 'lenkino') {
                        isModels = targetPath === '/pornstars';
                    } else {
                        isModels = targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0;
                    }
                    var res = [];

                    if (isCategories) {
                        res = parseCategories(doc, cleanD, currentSite);
                    } else if (isModels) {
                        res = parseModels(doc, cleanD, currentSite);
                    } else if (currentSite === 'lenkino') {
                        res = parseCardsLenkino(doc, cleanD);
                    } else {
                        res = parseCards365(doc, cleanD, false);
                    }

                    if (res.length > 0) resolve({ results: res, collection: true, total_pages: 50, page: object.page }); else reject();
                }, reject);
            };

            comp.filter = function () {
                var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, '');
                var curUrl = (object.url || cleanD).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                var targetPath = curUrl.replace(cleanD, '').split('?')[0];
                
                var items = [
                    { title: 'Пошук', action: 'search' }, 
                    { title: 'Категорії', action: 'categories' },
                    { title: 'Моделі', action: 'models' }
                ];

                var sortItems = [];
                var currentSortTitle = 'Нові'; 

                if (currentSite === 'lenkino') {
                    items.push({ title: 'Студії', action: 'studios' });
                    
                    if (curUrl.indexOf('/channels') !== -1) {
                        var bS = cleanD + '/channels';
                        sortItems.push({ title: 'Кращі', url: bS }, { title: 'Нові', url: bS + '-new' }, { title: 'Популярні', url: bS + '-views' });
                        if (curUrl === bS + '-new') currentSortTitle = 'Нові';
                        else if (curUrl === bS + '-views') currentSortTitle = 'Популярні';
                        else currentSortTitle = 'Кращі';
                    } else {
                        var bV = curUrl.replace(/\/top-porno$/, '').replace(/\/hot-porno$/, '').replace(/-top$/, '');
                        if (bV === cleanD) {
                            sortItems.push({ title: 'Нові', url: cleanD }, { title: 'Кращі', url: cleanD + '/top-porno' }, { title: 'Гарячі', url: cleanD + '/hot-porno' });
                            if (curUrl.indexOf('/top-porno') !== -1) currentSortTitle = 'Кращі';
                            else if (curUrl.indexOf('/hot-porno') !== -1) currentSortTitle = 'Гарячі';
                            else currentSortTitle = 'Нові';
                        } else {
                            sortItems.push({ title: 'Нові', url: bV }, { title: 'Кращі', url: bV + '-top' }, { title: 'Гарячі', url: bV });
                            if (curUrl.indexOf('-top') !== -1) currentSortTitle = 'Кращі';
                            else currentSortTitle = 'Нові';
                        }
                    }
                } else {
                    var mUrl = cleanD + '/models';
                    
                    // КАСТОМНЕ СОРТУВАННЯ ТІЛЬКИ ДЛЯ КАТАЛОГУ МОДЕЛЕЙ (Porno365)
                    if (targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0) {
                        sortItems.push({ title: 'По кількості', url: mUrl });
                        sortItems.push({ title: 'По популярності', url: mUrl + '/sort-by-subscribers' });
                        sortItems.push({ title: 'По імені', url: mUrl + '/sort-by-alphabetical' });
                        sortItems.push({ title: 'Нові', url: mUrl + '/sort-by-date' });

                        if (curUrl.indexOf('sort-by-subscribers') !== -1) currentSortTitle = 'По популярності';
                        else if (curUrl.indexOf('sort-by-alphabetical') !== -1) currentSortTitle = 'По імені';
                        else if (curUrl.indexOf('sort-by-date') !== -1) currentSortTitle = 'Нові';
                        else currentSortTitle = 'По кількості';
                    } else {
                        // СТАНДАРТНЕ СОРТУВАННЯ ДЛЯ ВІДЕО (Porno365)
                        var b3 = curUrl.split('?')[0].replace(/\/popular\/week$/, '').replace(/\/popular\/month$/, '').replace(/\/popular\/year$/, '').replace(/\/popular$/, '').replace(/\/+$/, '');
                        var isH = (b3 === cleanD), isC = (b3.indexOf('/categories/') !== -1), isT = (b3.indexOf('/tags/') !== -1), isM = (b3.indexOf('/models/') !== -1);
                        
                        sortItems.push({ title: 'Нові', url: b3 });
                        
                        // Якщо ми на сторінці конкретної моделі (isM = true, але шлях не дорівнює списку моделей)
                        if (isT || (isM && targetPath !== '/models' && targetPath.indexOf('/models/sort-by-') !== 0)) {
                            sortItems.push({ title: 'Топ переглядів', url: b3 + '/popular' });
                        } else {
                            sortItems.push({ title: 'Топ переглядів', url: b3 + '/popular' });
                            if (isH) sortItems.push({ title: 'Топ переглядів (тиждень)', url: b3 + '/popular/week' });
                            if (isH || isC) {
                                sortItems.push({ title: 'Топ переглядів (місяць)', url: b3 + '/popular/month' });
                                sortItems.push({ title: 'Топ переглядів (рік)', url: b3 + '/popular/year' });
                            }
                        }
                        
                        if (curUrl.indexOf('/popular/week') !== -1) currentSortTitle = 'Топ переглядів (тиждень)';
                        else if (curUrl.indexOf('/popular/month') !== -1) currentSortTitle = 'Топ переглядів (місяць)';
                        else if (curUrl.indexOf('/popular/year') !== -1) currentSortTitle = 'Топ переглядів (рік)';
                        else if (curUrl.indexOf('/popular') !== -1) currentSortTitle = 'Топ переглядів';
                        else currentSortTitle = 'Нові';
                    }
                }

                items.push({ 
                    title: 'Сортування', 
                    subtitle: currentSortTitle, 
                    action: 'sort',
                    sort_items: sortItems
                });

                Lampa.Select.show({
                    title: 'Навігація', 
                    items: items,
                    onSelect: function (a) {
                        if (a.action === 'search') {
                            Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(v) {
                                if (v) Lampa.Activity.push({ url: cleanD + (currentSite === 'lenkino' ? '/search/' : '/search/?q=') + encodeURIComponent(v), title: 'Пошук: ' + v, component: 'pluginx_comp', site: currentSite, page: 1 });
                                Lampa.Controller.toggle('content');
                            });
                        } else if (a.action === 'sort') {
                            Lampa.Select.show({
                                title: 'Сортування',
                                items: a.sort_items,
                                onSelect: function(s) {
                                    Lampa.Activity.push({ url: s.url, title: s.title, component: 'pluginx_comp', site: currentSite, page: 1 });
                                },
                                onBack: function() { comp.filter(); }
                            });
                        } else if (a.action === 'categories') {
                            Lampa.Activity.push({ url: cleanD + '/categories', title: 'Категорії', component: 'pluginx_comp', site: currentSite, page: 1 });
                        } else if (a.action === 'studios') {
                            Lampa.Activity.push({ url: cleanD + '/channels', title: 'Студії', component: 'pluginx_comp', site: currentSite, page: 1 });
                        } else if (a.action === 'models') {
                            var targetModelsUrl = cleanD + (currentSite === 'lenkino' ? '/pornstars' : '/models');
                            Lampa.Activity.push({ url: targetModelsUrl, title: 'Моделі', component: 'pluginx_comp', site: currentSite, page: 1 });
                        }
                    },
                    onBack: function () { Lampa.Controller.toggle('content'); }
                });
            };

            comp.onRight = comp.filter.bind(comp);

            comp.cardRender = function (card, element, events) {
                if (element.is_grid) {
                    if (element.video_count) {
                        var info = $('<div class="studio-count">' + element.video_count + '</div>');
                        $(card).find('.card__title').after(info); 
                    }
                    if (element.no_img) {
                        $(card).find('.card__img').css('display', 'none');
                        $(card).find('.card__view').append('<div class="grid-cat-empty">' + element.name + '</div>');
                    }
                }

                events.onEnter = function () {
                    hidePreview();
                    if (element.is_grid) {
                        Lampa.Activity.push({ url: element.url, title: element.name, component: 'pluginx_comp', site: currentSite, page: 1 });
                        return;
                    }
                    
                    smartRequest(element.url, function(html) {
                        var str = []; 
                        if (currentSite === 'lenkino') {
                            var u = html.match(/video_url:[\t ]+'([^']+)'/), a = html.match(/video_alt_url:[\t ]+'([^']+)'/);
                            if (u && u[1]) str.push({ title: 'Стандарт', url: u[1] });
                            if (a && a[1]) str.push({ title: 'Основний (HD)', url: a[1] });
                        } else {
                            var doc = new DOMParser().parseFromString(html, 'text/html'), q = doc.querySelectorAll('.quality_chooser a');
                            for (var j = 0; j < q.length; j++) if (q[j].getAttribute('href')) str.push({ title: q[j].innerText.trim(), url: q[j].getAttribute('href') });
                            if (str.length === 0) { var p = doc.querySelector('a.btn-play.play-video'); if (p && p.getAttribute('href')) str.push({ title: 'Оригінал', url: p.getAttribute('href') }); }
                        }
                        if (str.length > 0) {
                            var b = str[str.length - 1];
                            var playData = { title: element.name, url: b.url, quality: str };
                            if (currentSite === 'lenkino') {
                                playData.headers = {
                                    'Referer': 'https://wes.lenkino.adult/',
                                    'Origin': 'https://wes.lenkino.adult',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
                                };
                            }
                            Lampa.Player.play(playData);
                            Lampa.Player.playlist([playData]);
                        }
                    });
                };

                events.onMenu = function () {
                    hidePreview();
                    smartRequest(element.url, function (html) {
                        var doc = new DOMParser().parseFromString(html, 'text/html'), menu = [];
                        var mEls = doc.querySelectorAll(currentSite === 'lenkino' ? '.grd-mdl a' : '.video-categories.video-models a');
                        for (var m = 0; m < mEls.length; m++) menu.push({ title: mEls[m].innerText.trim(), action: 'direct', url: mEls[m].getAttribute('href') });
                        if (currentSite === 'lenkino') {
                            var sEls = doc.querySelectorAll('.vid-aut a, .itm-aut a, .grd-spn a');
                            for (var s = 0; s < sEls.length; s++) {
                                var sT = sEls[s].innerText.trim().replace(/\s+/g, ' ');
                                var p = sT.split(' '); if (p.length >= 2 && p.length % 2 === 0) { var h = p.length / 2; if (p.slice(0, h).join(' ') === p.slice(h).join(' ')) sT = p.slice(0, h).join(' '); }
                                if (!menu.some(function(i) { return i.title === sT; }) && sT) menu.push({ title: sT, action: 'direct', url: sEls[s].getAttribute('href') });
                            }
                            menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        } else {
                            menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Теги', action: 'tags' }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        }
                        Lampa.Select.show({ title: 'Дії', items: menu, onSelect: function (a) {
                            if (a.action === 'sim' || a.action === 'direct') Lampa.Activity.push({ url: a.url, title: a.title || 'Схожі', component: 'pluginx_comp', site: currentSite, page: 1, is_related: (a.action === 'sim') });
                            else {
                                var sel = (a.action === 'cats') ? (currentSite === 'lenkino' ? '.vid-cat a' : '.video-categories:not(.video-models) a') : '.video-tags a';
                                var subEls = doc.querySelectorAll(sel), sub = [];
                                for (var i = 0; i < subEls.length; i++) sub.push({ title: subEls[i].innerText.trim(), url: subEls[i].getAttribute('href') });
                                Lampa.Select.show({ title: a.title, items: sub, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function () { events.onMenu(); } });
                            }
                        }, onBack: function () { Lampa.Controller.toggle('content'); } });
                    });
                };

                events.onFocus = function (t) {
                    hidePreview();
                    if (element.preview && !element.is_grid) {
                        previewTimeout = setTimeout(function () { 
                            showPreview($(t), element.preview); 
                        }, 1000);
                    }
                };
            };
            return comp;
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);

        (function() {
            var active_curr;
            var filter_btn = $('<div class="head__action head__settings selector pluginx-filter-btn"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect><rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect><circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle><circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle><circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle></svg></div>');
            
            filter_btn.hide().on('hover:enter click', function() {
                if (active_curr && active_curr.activity) {
                    var c = (window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) ? active_curr.activity.component : active_curr.activity.component();
                    if (c && c.filter) c.filter();
                }
            });

            Lampa.Listener.follow('activity', function(e) {
                if (e.type == 'start') active_curr = e.object;
                try { hidePreview(); } catch(h) {}
                
                setTimeout(function() {
                    if (active_curr && active_curr.component !== 'pluginx_comp') filter_btn.hide();
                }, 1000);

                if (e.type == 'start' && e.component == 'pluginx_comp') {
                    if (!$('.head__actions').find('.pluginx-filter-btn').length) {
                        $('.head__actions').prepend(filter_btn);
                    } else {
                        $('.head__actions').prepend(filter_btn);
                    }
                    filter_btn.show();
                    active_curr = e.object;
                }
            });
        })();
    }

    function addMenu() {
        var menu_list = $('.menu .menu__list').eq(0);
        if (menu_list.length && !menu_list.find('[data-action="pluginx"]').length) {
            var menu_item = $('<li class="menu__item selector" data-action="pluginx"><div class="menu__ico"><img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" /></div><div class="menu__text">Каталоги X</div></li>');
            menu_item.on('hover:enter', function () { Lampa.Select.show({ title: 'Оберіть сайт', items: [{ title: 'Porno365', site: 'porno365' }, { title: 'Lenkino', site: 'lenkino' }], onSelect: function(a) { Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 }); }, onBack: function() { Lampa.Controller.toggle('menu'); } }); });
            var settings_item = menu_list.find('[data-action="settings"]');
            if (settings_item.length) menu_item.insertBefore(settings_item); else menu_list.append(menu_item);
        }
    }

    if (window.Lampa) {
        startPlugin();
        addMenu();
    }
    
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            startPlugin();
            addMenu();
        }
    });
    
})();