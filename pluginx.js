(function () {
    'use strict';

    var PORNO365_DOMAIN = 'https://w.porno365.gold'; 
    var LENKINO_DOMAIN = 'https://wes.lenkino.adult';

    function startPlugin() {
        if (window.pluginx_ready) return;
        window.pluginx_ready = true;

        var css = '<style>' +
            /* Основна сітка - main-grid */
            '.main-grid { padding: 0 !important; }' +
            '@media screen and (max-width: 580px) {' +
                '.main-grid .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 5px !important; }' +
                '.main-grid.is-categories-grid .card, .main-grid.is-models-grid .card { width: 50% !important; }' + 
            '}' +
            '@media screen and (min-width: 581px) {' +
                '.main-grid .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; }' +
                '.main-grid.is-categories-grid .card, .main-grid.is-models-grid .card { width: 16.666% !important; }' + 
            '}' +
            
            /* Спільні налаштування перегляду */
            '.main-grid .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; overflow: hidden !important; position: relative !important; }' +
            
            /* Сітка категорій та студій - is-categories-grid */
            '.main-grid.is-categories-grid .card__view { padding-bottom: 80% !important; background: #ffffff !important; }' + 
            
            /* Сітка моделей - is-models-grid */
            '.main-grid.is-models-grid .card__view { padding-bottom: 150% !important; background: #ffffff !important; }' + 
            
            '.main-grid .card__img { object-fit: cover !important; border-radius: 12px !important; z-index: 2; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1 !important; }' +
            
            /* Назва відео (3 рядки) */
            '.main-grid .card__title { ' +
                'display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; white-space: normal !important; text-align: left !important; ' +
                'line-height: 1.2 !important; max-height: 3.6em !important; padding-top: 2px !important; margin-top: 0 !important; text-overflow: ellipsis !important; ' +
            '}' +
            '.main-grid.is-categories-grid .card__title, .main-grid.is-models-grid .card__title { -webkit-line-clamp: 2 !important; text-align: center !important; font-weight: normal !important; margin-top: 5px !important; }' +
            
            /* Приховуємо службові бейджі Лампи */
            '.main-grid .card__age, .main-grid .card__textbox { display: none !important; }' +
            
            /* Лічильник відео - video-count */
            '.video-count { font-size: 0.85em; color: #aaa; margin-top: 2px; display: block; text-align: center; }' +
            
            '.pluginx-filter-btn { order: -1 !important; margin-right: auto !important; }' +
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

        function formatTitle(name, info, symbol) {
            if (!info) return name;
            var cleanInfo = info.replace(/[^0-9:]/g, ''); 
            return name + ' ' + symbol + ' ' + cleanInfo;
        }

        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object);
            var currentSite = object.site || 'porno365';
            var network = new Lampa.Reguest(); // Повертаємо мережу зі старої версії
            function parseCards365(doc, siteBaseUrl, isRelated) {
                var sel = isRelated ? '.related .related_video' : 'li.video_block, li.trailer';
                var elements = doc.querySelectorAll(sel), results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector('a.image'), titleEl = el.querySelector('a.image p, .title'), imgEl = el.querySelector('img'), timeEl = el.querySelector('.duration');
                    var vP = el.querySelector('video#videoPreview') || el.querySelector('video'); 
                    
                    if (linkEl && titleEl) {
                        var img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img;
                        var vUrl = linkEl.getAttribute('href');
                        if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        var pUrl = vP ? (vP.getAttribute('src') || vP.getAttribute('data-src') || '') : '';
                        if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                        
                        var name = titleEl.innerText.trim();
                        var time = timeEl ? timeEl.innerText.trim() : '';
                        
                        /* Використовуємо безпечне форматування тексту */
                        results.push({ name: formatTitle(name, time, '▶'), url: vUrl, picture: img, img: img, preview: pUrl });
                    }
                }
                return results;
            }

            function parseCardsLenkino(doc, siteBaseUrl, isStudios) {
                var results = [];
                var elements = [];
                if (isStudios) elements = doc.querySelectorAll('.itm-crd-spn, .itm-crd'); 
                else {
                    var listContainer = doc.querySelector('#list_videos_videos_list');
                    if (listContainer) elements = listContainer.querySelectorAll('.item');
                    else {
                        var allItems = doc.querySelectorAll('.item');
                        for(var k=0; k<allItems.length; k++) {
                            if(!allItems[k].closest('.sxn-top') && !allItems[k].classList.contains('itm-crd') && !allItems[k].classList.contains('itm-crd-spn')) elements.push(allItems[k]);
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
                        var name = isStudios ? (linkEl.getAttribute('title') || (imgEl ? imgEl.getAttribute('alt') : '') || linkEl.innerText.trim()) : (titleEl ? titleEl.innerText.trim() : linkEl.innerText.trim());
                        var img = imgEl ? (imgEl.getAttribute('data-srcset') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img;
                        else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                        var vUrl = linkEl.getAttribute('href');
                        if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        var pUrl = (!isStudios && imgEl) ? (imgEl.getAttribute('data-preview') || '') : '';
                        if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                        else if (pUrl && pUrl.indexOf('/') === 0) pUrl = siteBaseUrl + pUrl;

                        var infoText = (timeEl ? timeEl.innerText.trim() : '');
                        
                        if (name) {
                            /* Підставляємо потрібний значок залежно від типу сітки */
                            var symbol = isStudios ? '☰' : '▶';
                            results.push({ name: formatTitle(name, infoText, symbol), url: vUrl, picture: img, img: img, is_grid: isStudios, preview: pUrl });
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
                    var el = links[i], title = el.getAttribute('title') || el.innerText.trim(), href = el.getAttribute('href');
                    if (title.toLowerCase().indexOf('ai') !== -1 || title.toLowerCase().indexOf('extra') !== -1) continue;

                    var imgEl = el.querySelector('img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                    if (img && img.indexOf('//') === 0) img = 'https:' + img;
                    else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                    if (href && title) {
                        var vUrl = href.startsWith('http') ? href : siteBaseUrl + (href.startsWith('/') ? '' : '/') + href;
                        results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true });
                    }
                }
                return results;
            }

            function parseModels(doc, siteBaseUrl, siteType) {
                var results = [];
                if (siteType === 'lenkino') {
                    var all = doc.querySelectorAll('.item');
                    for (var i = 0; i < all.length; i++) {
                        var el = all[i]; if (!el.closest('.grd-mdl')) continue;
                        var linkEl = el.querySelector('a'), imgEl = el.querySelector('img'), titleEl = el.querySelector('.itm-tit'), countEl = el.querySelector('.itm-opt li');
                        if (linkEl && imgEl) {
                            var name = titleEl ? titleEl.innerText.trim() : (imgEl.getAttribute('alt') || 'Model');
                            var count = countEl ? countEl.innerText.trim() : '';
                            var img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                            if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;
                            var vUrl = linkEl.getAttribute('href');
                            if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + vUrl;
                            results.push({ name: formatTitle(name, count, '☰'), url: vUrl, picture: img, img: img, is_grid: true });
                        }
                    }
                } else {
                    var mEls = doc.querySelectorAll('.item_model');
                    for (var k = 0; k < mEls.length; k++) {
                        var elM = mEls[k], linkM = elM.querySelector('a'), nameM = elM.querySelector('.model_eng_name'), countM = elM.querySelector('.cnt_span'), imgM = elM.querySelector('img');
                        if (linkM && nameM) {
                            var vUrlM = linkM.getAttribute('href'); if (vUrlM && vUrlM.indexOf('http') !== 0) vUrlM = siteBaseUrl + vUrlM;
                            results.push({ name: formatTitle(nameM.innerText.trim(), countM ? countM.innerText.trim() : '', '☰'), url: vUrlM, picture: imgM ? imgM.getAttribute('src') : '', img: imgM ? imgM.getAttribute('src') : '', is_grid: true });
                        }
                    }
                }
                return results;
            }
            comp.create = function () {
                var _this = this; 
                this.activity.loader(true);
                var target = object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN);
                if (currentSite === 'lenkino') target = target.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '') + '/page/' + (object.page || 1);
                
                network.silent(target, function (htmlText) {
                    var parser = new DOMParser(), doc = parser.parseFromString(htmlText, 'text/html');
                    var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, '');
                    var targetPath = target.replace(cleanD, '').split('?')[0].replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    
                    var isStudios = currentSite === 'lenkino' && (targetPath === '/channels' || targetPath === '/channels-new' || targetPath === '/channels-views');
                    var isCategories = targetPath === '/categories';
                    var isModels = (currentSite === 'lenkino' ? targetPath === '/pornstars' : (targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0));
                    
                    var res = [];
                    if (isCategories) res = parseCategories(doc, cleanD, currentSite);
                    else if (isModels) res = parseModels(doc, cleanD, currentSite);
                    else if (currentSite === 'lenkino') res = parseCardsLenkino(doc, cleanD, isStudios);
                    else res = parseCards365(doc, cleanD, object.is_related);
                    
                    if (res.length > 0) { 
                        _this.build({ results: res, collection: true, total_pages: 50, page: 1 }); 
                        var rendered = _this.render();
                        
                        /* Додаємо класи безпечно, як у старій версії */
                        rendered.addClass('main-grid');
                        if (isStudios || isCategories) rendered.addClass('is-categories-grid');
                        if (isModels) rendered.addClass('is-models-grid');
                    } else _this.empty(); 
                }, this.empty.bind(this), false, { dataType: 'text' });
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, '');
                var targetPath = (object.url || '').replace(cleanD, '').split('?')[0].replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                if (targetPath === '/categories') return reject();

                var base = (object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN)).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                var url = (currentSite === 'lenkino') ? base + '/page/' + object.page : base + (base.indexOf('?') !== -1 ? '&' : '/') + object.page;
                
                network.silent(url, function (htmlText) {
                    var parser = new DOMParser(), doc = parser.parseFromString(htmlText, 'text/html');
                    var isModels = (currentSite === 'lenkino' ? targetPath === '/pornstars' : (targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0));
                    var isStudios = currentSite === 'lenkino' && (targetPath === '/channels' || targetPath === '/channels-new' || targetPath === '/channels-views');
                    var res = [];
                    
                    if (isModels) res = parseModels(doc, cleanD, currentSite);
                    else if (currentSite === 'lenkino') res = parseCardsLenkino(doc, cleanD, isStudios);
                    else res = parseCards365(doc, cleanD, false);

                    if (res.length > 0) resolve({ results: res, collection: true, total_pages: 50, page: object.page }); 
                    else reject();
                }, reject, false, { dataType: 'text' });
            };

            comp.filter = function () {
                var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, ''), curUrl = (object.url || cleanD).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, ''), targetPath = curUrl.replace(cleanD, '').split('?')[0], isCategories = targetPath === '/categories';
                var items = [{ title: 'Пошук', action: 'search' }, { title: 'Категорії', action: 'categories' }, { title: 'Моделі', action: 'models' }], sortItems = [], currentSortTitle = 'Нові'; 
                
                if (currentSite === 'lenkino') {
                    items.push({ title: 'Студії', action: 'studios' });
                    if (curUrl.indexOf('/channels') !== -1) {
                        var bS = cleanD + '/channels'; sortItems.push({ title: 'Кращі', url: bS }, { title: 'Нові', url: bS + '-new' }, { title: 'Популярні', url: bS + '-views' });
                        if (curUrl === bS + '-new') currentSortTitle = 'Нові'; else if (curUrl === bS + '-views') currentSortTitle = 'Популярні'; else currentSortTitle = 'Кращі';
                    } else {
                        var bV = curUrl.replace(/\/top-porno$/, '').replace(/\/hot-porno$/, '').replace(/-top$/, '');
                        if (bV === cleanD) { sortItems.push({ title: 'Нові', url: cleanD }, { title: 'Кращі', url: cleanD + '/top-porno' }, { title: 'Гарячі', url: cleanD + '/hot-porno' }); if (curUrl.indexOf('/top-porno') !== -1) currentSortTitle = 'Кращі'; else if (curUrl.indexOf('/hot-porno') !== -1) currentSortTitle = 'Гарячі'; else currentSortTitle = 'Нові'; }
                        else { sortItems.push({ title: 'Нові', url: bV }, { title: 'Кращі', url: bV + '-top' }, { title: 'Гарячі', url: bV }); if (curUrl.indexOf('-top') !== -1) currentSortTitle = 'Кращі'; else currentSortTitle = 'Нові'; }
                    }
                } else {
                    var mUrl = cleanD + '/models';
                    if (targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0) {
                        sortItems.push({ title: 'По кількості', url: mUrl }, { title: 'Популярність', url: mUrl + '/sort-by-subscribers' }, { title: 'За алфавітом', url: mUrl + '/sort-by-alphabetical' }, { title: 'Нові', url: mUrl + '/sort-by-date' });
                        if (curUrl.indexOf('sort-by-subscribers') !== -1) currentSortTitle = 'Популярність'; else if (curUrl.indexOf('sort-by-alphabetical') !== -1) currentSortTitle = 'За алфавітом'; else if (curUrl.indexOf('sort-by-date') !== -1) currentSortTitle = 'Нові'; else currentSortTitle = 'По кількості';
                    } else {
                        var b3 = curUrl.split('?')[0].replace(/\/popular\/week$/, '').replace(/\/popular\/month$/, '').replace(/\/popular\/year$/, '').replace(/\/popular$/, '').replace(/\/+$/, '');
                        sortItems.push({ title: 'Нові', url: b3 }, { title: 'Топ переглядів', url: b3 + '/popular' });
                        if (curUrl.indexOf('/popular') !== -1) currentSortTitle = 'Топ переглядів'; else currentSortTitle = 'Нові';
                    }
                }
                if (!isCategories) items.push({ title: 'Сортування', subtitle: currentSortTitle, action: 'sort', sort_items: sortItems });

                Lampa.Select.show({ title: 'Навігація', items: items, onSelect: function (a) {
                    if (a.action === 'search') Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(v) { if (v) Lampa.Activity.push({ url: cleanD + (currentSite === 'lenkino' ? '/search/' : '/search/?q=') + encodeURIComponent(v), title: 'Пошук: ' + v, component: 'pluginx_comp', site: currentSite, page: 1 }); Lampa.Controller.toggle('content'); });
                    else if (a.action === 'sort') Lampa.Select.show({ title: 'Сортування', items: a.sort_items, onSelect: function(s) { Lampa.Activity.push({ url: s.url, title: s.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function() { comp.filter(); } });
                    else if (a.action === 'categories') Lampa.Activity.push({ url: cleanD + '/categories', title: 'Категорії', component: 'pluginx_comp', site: currentSite, page: 1 });
                    else if (a.action === 'studios') Lampa.Activity.push({ url: cleanD + '/channels', title: 'Студії', component: 'pluginx_comp', site: currentSite, page: 1 });
                    else if (a.action === 'models') Lampa.Activity.push({ url: cleanD + (currentSite === 'lenkino' ? '/pornstars' : '/models'), title: 'Моделі', component: 'pluginx_comp', site: currentSite, page: 1 });
                }, onBack: function () { Lampa.Controller.toggle('content'); } });
            };

            comp.cardRender = function (card, element, events) {
                events.onEnter = function () {
                    hidePreview();
                    if (element.is_grid) { Lampa.Activity.push({ url: element.url, title: element.name, component: 'pluginx_comp', site: currentSite, page: 1 }); return; }
                    
                    network.silent(element.url, function(htmlText) {
                        var str = []; 
                        if (currentSite === 'lenkino') {
                            var u = htmlText.match(/video_url:[\t ]+'([^']+)'/), a = htmlText.match(/video_alt_url:[\t ]+'([^']+)'/);
                            if (u && u[1]) str.push({ title: 'Стандарт', url: u[1] });
                            if (a && a[1]) str.push({ title: 'Основний (HD)', url: a[1] });
                        } else {
                            var doc = new DOMParser().parseFromString(htmlText, 'text/html'), q = doc.querySelectorAll('.quality_chooser a');
                            for (var j = 0; j < q.length; j++) if (q[j].getAttribute('href')) str.push({ title: q[j].innerText.trim(), url: q[j].getAttribute('href') });
                        }
                        if (str.length > 0) {
                            var playData = { title: element.name, url: str[str.length - 1].url, quality: str };
                            if (currentSite === 'lenkino') playData.headers = { 'Referer': 'https://wes.lenkino.adult/', 'Origin': 'https://wes.lenkino.adult' };
                            Lampa.Player.play(playData); Lampa.Player.playlist([playData]);
                        }
                    }, false, false, { dataType: 'text' });
                };

                events.onMenu = function () {
                    hidePreview();
                    network.silent(element.url, function (htmlText) {
                        var doc = new DOMParser().parseFromString(htmlText, 'text/html'), menu = [];
                        var mEls = doc.querySelectorAll(currentSite === 'lenkino' ? '.grd-mdl a' : '.video-categories.video-models a');
                        for (var m = 0; m < mEls.length; m++) menu.push({ title: mEls[m].innerText.trim(), action: 'direct', url: mEls[m].getAttribute('href') });
                        
                        if (currentSite === 'lenkino') {
                            var sEls = doc.querySelectorAll('.vid-aut a, .itm-aut a, .grd-spn a');
                            for (var s = 0; s < sEls.length; s++) { var sT = sEls[s].innerText.trim().replace(/\s+/g, ' '); if (!menu.some(function(i) { return i.title === sT; }) && sT) menu.push({ title: sT, action: 'direct', url: sEls[s].getAttribute('href') }); }
                            menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        } else menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Теги', action: 'tags' }, { title: 'Схожі відео', action: 'sim', url: element.url });

                        Lampa.Select.show({ title: 'Дії', items: menu, onSelect: function (a) {
                            if (a.action === 'sim' || a.action === 'direct') Lampa.Activity.push({ url: a.url, title: a.title || 'Схожі', component: 'pluginx_comp', site: currentSite, page: 1, is_related: (a.action === 'sim') });
                            else {
                                var sel = (a.action === 'cats') ? (currentSite === 'lenkino' ? '.vid-cat a' : '.video-categories:not(.video-models) a') : '.video-tags a';
                                var subEls = doc.querySelectorAll(sel), sub = [];
                                for (var i = 0; i < subEls.length; i++) sub.push({ title: subEls[i].innerText.trim(), url: subEls[i].getAttribute('href') });
                                if (sub.length > 0) Lampa.Select.show({ title: a.title, items: sub, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function () { events.onMenu(); } });
                            }
                        }, onBack: function () { Lampa.Controller.toggle('content'); } });
                    }, false, false, { dataType: 'text' });
                };

                events.onFocus = function (t) {
                    hidePreview(); if (element.preview && !element.is_grid) previewTimeout = setTimeout(function () { showPreview($(t), element.preview); }, 1000);
                };
            };
            
            comp.onRight = comp.filter.bind(comp); 
            
            /* ВАЖЛИВО: Обов'язкове повернення компонента для ТБ! */
            return comp; 
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);

        (function() {
            var currentActivity;
            var hideTimeout;
            var isClicking = false; 
            
            var filterBtn = $('<div class="head__action head__settings selector pluginx-filter-btn"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect><rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect><circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle><circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle><circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle></svg></div>');

            filterBtn.hide().on('hover:enter click', function() {
                if (isClicking) return;
                isClicking = true;
                setTimeout(function() { isClicking = false; }, 300);

                try {
                    if (currentActivity && currentActivity.activity) {
                        var c = (window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) ? currentActivity.activity.component : currentActivity.activity.component();
                        if (c && typeof c.filter === 'function') c.filter();
                    }
                } catch (e) { console.log('Помилка виклику фільтра:', e); }
            });

            Lampa.Listener.follow('activity', function(e) {
                if (e.type == 'start') currentActivity = e.object;
                
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function() {
                    if (currentActivity && currentActivity.component !== 'pluginx_comp') filterBtn.hide();
                }, 1000);

                if (e.type == 'start' && e.component == 'pluginx_comp') {
                    if ($('.head .open--search').length) $('.head .open--search').before(filterBtn);
                    else $('.head__actions').prepend(filterBtn);
                    filterBtn.show();
                    currentActivity = e.object;
                }
            });
        })();
    }

    function addMenu() {
        if (window.Lampa && window.Lampa.Storage) {
            var hiddenMenu = window.Lampa.Storage.get('menu_hide');
            if (hiddenMenu && Array.isArray(hiddenMenu)) {
                var idx = hiddenMenu.indexOf('pluginx');
                if (idx !== -1) { hiddenMenu.splice(idx, 1); window.Lampa.Storage.set('menu_hide', hiddenMenu); }
            }
        }
        
        var menuList = $('.menu .menu__list').eq(0);
        if (menuList.length && menuList.find('[data-action="pluginx"]').length === 0) {
            var item = $('<li class="menu__item selector" data-action="pluginx" id="menu_pluginx">' +
                         '<div class="menu__ico">' +
                         '<img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" />' +
                         '</div>' +
                         '<div class="menu__text">CatalogX</div>' +
                         '</li>');
            item.on('hover:enter', function () {
                Lampa.Select.show({ title: 'CatalogX', items: [{ title: 'Porno365', site: 'porno365' }, { title: 'Lenkino', site: 'lenkino' }], onSelect: function(a) { Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 }); }, onBack: function() { Lampa.Controller.toggle('menu'); } });
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
            if (e.type == 'ready') initPlugin();
        });
    }
})();
