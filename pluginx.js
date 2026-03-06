(function () {
    'use strict';

    var PORNO365_DOMAIN = 'https://w.porno365.gold'; 
    var LENKINO_DOMAIN = 'https://wes.lenkino.adult';
    var LONGVIDEOS_DOMAIN = 'https://www.longvideos.xxx';

    function startPlugin() {
        if (window.pluginx_ready) return;
        window.pluginx_ready = true;

        var css = '<style>' +
            '.main-grid { padding: 0 !important; }' +
            
            '@media screen and (max-width: 580px) {' +
                '.main-grid .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 5px !important; }' +
                '.main-grid.is-categories-grid .card, .main-grid.is-models-grid .card, .main-grid.is-noimg-grid .card { width: 50% !important; }' + 
            '}' +
            '@media screen and (min-width: 581px) {' +
                '.main-grid .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; }' +
                '.main-grid.is-categories-grid .card, .main-grid.is-models-grid .card, .main-grid.is-noimg-grid .card { width: 16.666% !important; }' + 
            '}' +
            
            '.main-grid .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; position: relative !important; }' +
            '.main-grid.is-categories-grid .card__view { padding-bottom: 80% !important; background: #ffffff !important; }' + 
            '.main-grid.is-models-grid .card__view { padding-bottom: 150% !important; background: #ffffff !important; }' + 
            '.main-grid .card__img { object-fit: cover !important; border-radius: 12px !important; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1 !important; }' +
            
            '.main-grid .card__title { ' +
                'display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; white-space: normal !important; text-align: left !important; ' +
                'line-height: 1.2 !important; max-height: 3.6em !important; padding-top: 2px !important; margin-top: 0 !important; text-overflow: ellipsis !important; ' +
            '}' +
            '.main-grid.is-categories-grid .card__title, .main-grid.is-models-grid .card__title { -webkit-line-clamp: 2 !important; text-align: center !important; font-weight: normal !important; margin-top: 5px !important; }' +
            
            '.main-grid.is-noimg-grid .card { position: relative !important; }' +
            '.main-grid.is-noimg-grid .card__view { padding-bottom: 25% !important; background: #c4c4c4 !important; border-radius: 8px !important; border: 1px solid #aaa; transition: transform 0.2s; }' +
            '.main-grid.is-noimg-grid .card.focus .card__view { transform: scale(1.05); background: #b0b0b0 !important; border-color: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.8); }' +
            '.main-grid.is-noimg-grid .card__img { display: none !important; }' +
            '.main-grid.is-noimg-grid .card__title { ' +
                'position: absolute !important; top: 0; left: 0; width: 100%; height: 100%; ' +
                'display: flex !important; align-items: center !important; justify-content: center !important; ' +
                'color: #000000 !important; font-weight: bold !important; ' +
                'font-size: 1.3em !important; line-height: 1.2 !important; ' + 
                'text-align: center !important; white-space: normal !important; word-break: break-word !important; ' +
                '-webkit-line-clamp: unset !important; -webkit-box-orient: unset !important; ' + 
                'padding: 8px !important; margin: 0 !important; ' +
                'z-index: 10; box-sizing: border-box !important; background: transparent !important; text-shadow: none !important; ' +
            '}' +

            '.main-grid .card__age, .main-grid .card__textbox { display: none !important; }' +
            '.pluginx-filter-btn { order: -1 !important; margin-right: auto !important; }' +
            '</style>';
        $('body').append(css);

        var previewTimeout, activePreviewNode;

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
            
            var sources = Array.isArray(src) ? src : [src];
            if (!sources || sources.length === 0 || !sources[0]) return;
            
            var currentIdx = 0;
            videoEl.src = sources[currentIdx];
            
            videoEl.onerror = function() {
                currentIdx++;
                if (currentIdx < sources.length) {
                    videoEl.src = sources[currentIdx];
                    var p = videoEl.play(); if (p !== undefined) p.catch(function(){});
                }
            };

            target.find('.card__view').append(previewContainer);
            activePreviewNode = previewContainer;
            var playPromise = videoEl.play(); 
            if (playPromise !== undefined) playPromise.catch(function(){});
        }

        function formatTitle(name, info, symbol) {
            if (!info) return name;
            var cleanInfo = info.replace(/[^0-9:]/g, ''); 
            return name + ' ' + symbol + ' ' + cleanInfo;
        }

        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object), currentSite = object.site || 'porno365';

            function smartRequest(url, onSuccess, onError) {
                var network = new Lampa.Reguest(), headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" };
                var isAndroid = typeof window !== 'undefined' && window.Lampa && window.Lampa.Platform && window.Lampa.Platform.is('android');
                if (isAndroid) network.native(url, function (res) { onSuccess(typeof res === 'object' ? JSON.stringify(res) : res); }, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                else network.silent(url, onSuccess, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
            }
            // --- ПАРСЕРИ PORNO365 та LENKINO ---
            function parseCards365(doc, siteBaseUrl, isRelated) {
                var sel = isRelated ? '.related .related_video' : 'li.video_block, li.trailer';
                var elements = doc.querySelectorAll(sel), results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector('a.image'), titleEl = el.querySelector('a.image p, .title'), imgEl = el.querySelector('img'), timeEl = el.querySelector('.duration');
                    var vP = el.querySelector('video#videoPreview') || el.querySelector('video'); 
                    if (linkEl && titleEl) {
                        var img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img;
                        var vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        
                        var pUrl = vP ? (vP.getAttribute('src') || vP.getAttribute('data-src') || '') : ''; 
                        if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                        
                        var previewData = pUrl;
                        var matchId = vUrl.match(/\/movie\/(\d+)/);
                        if (matchId && matchId[1]) {
                            var vidId = matchId[1];
                            var f1 = vidId.charAt(0), f2 = vidId.length > 1 ? vidId.charAt(1) : '0';
                            var subs = ['53', '33', '26', '18', '51', '32', '54'];
                            previewData = [];
                            for (var s = 0; s < subs.length; s++) {
                                previewData.push('https://tr' + subs[s] + '.vide365.com/porno365/trailers/' + f1 + '/' + f2 + '/' + vidId + '.webm');
                            }
                        }

                        var name = titleEl.innerText.trim(), time = timeEl ? timeEl.innerText.trim() : '';
                        results.push({ name: formatTitle(name, time, '▶'), url: vUrl, picture: img, img: img, preview: previewData });
                    }
                }
                return results;
            }

            function parseCardsLenkino(doc, siteBaseUrl, isStudios) {
                var results = [], elements = [];
                if (isStudios) elements = doc.querySelectorAll('.itm-crd-spn, .itm-crd'); 
                else {
                    var listContainer = doc.querySelector('#list_videos_videos_list');
                    if (listContainer) elements = listContainer.querySelectorAll('.item');
                    else {
                        var allItems = doc.querySelectorAll('.item');
                        for(var k=0; k<allItems.length; k++) if(!allItems[k].closest('.sxn-top') && !allItems[k].classList.contains('itm-crd') && !allItems[k].classList.contains('itm-crd-spn')) elements.push(allItems[k]);
                    }
                }
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector(isStudios ? 'a.len_pucl' : 'a'), titleEl = el.querySelector(isStudios ? '.itm-opt' : '.itm-tit'); 
                    var imgEl = el.querySelector('img.lzy') || el.querySelector('img'), timeEl = el.querySelector(isStudios ? '.itm-opt li' : '.itm-dur');
                    if (linkEl) {
                        var name = isStudios ? (linkEl.getAttribute('title') || (imgEl ? imgEl.getAttribute('alt') : '') || linkEl.innerText.trim()) : (titleEl ? titleEl.innerText.trim() : linkEl.innerText.trim());
                        var img = imgEl ? (imgEl.getAttribute('data-srcset') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;
                        var vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        var pUrl = (!isStudios && imgEl) ? (imgEl.getAttribute('data-preview') || '') : ''; if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl; else if (pUrl && pUrl.indexOf('/') === 0) pUrl = siteBaseUrl + pUrl;
                        var infoText = (timeEl ? timeEl.innerText.trim() : ''), symbol = isStudios ? '☰' : '▶';
                        if (name) results.push({ name: formatTitle(name, infoText, symbol), url: vUrl, picture: img, img: img, is_grid: isStudios, preview: pUrl });
                    }
                }
                return results;
            }

            // --- ПАРСЕРИ LONGVIDEOS ---
            function parseCardsLongvideos(doc, siteBaseUrl) {
                var results = [], elements = doc.querySelectorAll('.list-videos .item, .item');
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector('a.thumb_title');
                    if (!linkEl) continue;
                    var name = linkEl.innerText.trim(), vUrl = linkEl.getAttribute('href');
                    if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + vUrl;
                    
                    var imgEl = el.querySelector('img.thumb');
                    var img = '';
                    if (imgEl) {
                        img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                        if (img.indexOf('data:image') === 0) {
                            img = imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || '';
                        }
                    }
                    if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                    var previewEl = el.querySelector('.img.thumb__img'), pUrl = previewEl ? previewEl.getAttribute('data-preview') : '';
                    if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;

                    var timeEl = el.querySelector('.duration');
                    var timeText = timeEl ? timeEl.innerText.replace(/Full Video/gi, '').trim() : '';

                    results.push({ name: formatTitle(name, timeText, '▶'), url: vUrl, picture: img, img: img, preview: pUrl });
                }
                return results;
            }

            function parseModelsLongvideos(doc, siteBaseUrl) {
                var results = [], elements = doc.querySelectorAll('.list-models .item');
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    if (el.querySelector('.no-thumb')) continue; 
                    
                    var imgEl = el.querySelector('img');
                    if (!imgEl) continue; 
                    
                    var imgSrc = imgEl.getAttribute('data-original') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                    if (imgSrc && imgSrc.indexOf('data:image') === 0) imgSrc = imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || '';
                    if (!imgSrc) continue; 
                    if (imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc; else if (imgSrc.indexOf('/') === 0) imgSrc = siteBaseUrl + imgSrc;

                    var linkEl = el.tagName === 'A' ? el : (el.querySelector('a') || el);
                    var rawName = imgEl.getAttribute('alt') || linkEl.getAttribute('title') || '';
                    if (!rawName) {
                        var titleEl = el.querySelector('.title, .name, h5');
                        if (titleEl) rawName = titleEl.innerText.trim(); else rawName = 'Model';
                    }
                    
                    var countEl = el.querySelector('.videos'), count = countEl ? countEl.innerText.trim() : '';
                    var vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + vUrl;
                    
                    if (rawName) results.push({ name: formatTitle(rawName, count, '☰'), url: vUrl, picture: imgSrc, img: imgSrc, is_grid: true, is_models_grid: true });
                }
                return results;
            }

            function parseStudiosLongvideos(doc, siteBaseUrl) {
                var results = [];
                var container = doc.querySelector('#list_content_sources_sponsors_list_items');
                if (!container) return results;
                
                var headlines = container.querySelectorAll('.headline'); 
                for (var i = 0; i < headlines.length; i++) {
                    var el = headlines[i];
                    var linkEl = el.querySelector('a.more') || el.querySelector('a');
                    var titleEl = el.querySelector('h1, h2, h3, h4, .title') || linkEl;
                    
                    if (linkEl) {
                        var vUrl = linkEl.getAttribute('href');
                        if (!vUrl || vUrl.indexOf('/sites/') === -1) continue; 
                        var rawName = titleEl.innerText.trim();
                        var span = titleEl.querySelector('span');
                        if (span && rawName !== span.innerText.trim()) rawName = rawName.replace(span.innerText, '').trim(); 
                        if (!rawName) rawName = linkEl.innerText.trim();
                        if (vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + vUrl;
                        
                        if (rawName && !results.some(function(r) { return r.url === vUrl; })) {
                            results.push({ name: rawName, url: vUrl, picture: '', img: '', is_studios_noimg: true, is_grid: true });
                        }
                    }
                }
                return results;
            }

            function parseCategories(doc, siteBaseUrl, siteType) {
                var results = [], sel = (siteType === 'lenkino') ? '.grd-cat a' : '.categories-list-div a';
                var links = doc.querySelectorAll(sel);
                for (var i = 0; i < links.length; i++) {
                    var el = links[i], title = el.getAttribute('title') || el.innerText.trim(), href = el.getAttribute('href');
                    if (title.toLowerCase().indexOf('ai') !== -1 || title.toLowerCase().indexOf('extra') !== -1) continue;
                    var imgEl = el.querySelector('img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                    if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;
                    if (href && title) { var vUrl = href.startsWith('http') ? href : siteBaseUrl + (href.startsWith('/') ? '' : '/') + href; results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true }); }
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
                            var name = titleEl ? titleEl.innerText.trim() : (imgEl.getAttribute('alt') || 'Model'), count = countEl ? countEl.innerText.trim() : '', img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                            if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;
                            var vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + vUrl;
                            results.push({ name: formatTitle(name, count, '☰'), url: vUrl, picture: img, img: img, is_grid: true, is_models_grid: true });
                        }
                    }
                } else {
                    var mEls = doc.querySelectorAll('.item_model');
                    for (var k = 0; k < mEls.length; k++) {
                        var elM = mEls[k], linkM = elM.querySelector('a'), nameM = elM.querySelector('.model_eng_name'), countM = elM.querySelector('.cnt_span'), imgM = elM.querySelector('img');
                        if (linkM && nameM) {
                            var vUrlM = linkM.getAttribute('href'); if (vUrlM && vUrlM.indexOf('http') !== 0) vUrlM = siteBaseUrl + vUrlM;
                            results.push({ name: formatTitle(nameM.innerText.trim(), countM ? countM.innerText.trim() : '', '☰'), url: vUrlM, picture: imgM ? imgM.getAttribute('src') : '', img: imgM ? imgM.getAttribute('src') : '', is_grid: true, is_models_grid: true });
                        }
                    }
                }
                return results;
            }
            comp.create = function () {
                var _this = this; 
                this.activity.loader(true);

                if (currentSite === 'bookmarks') {
                    var bmarks = window.Lampa.Storage.get('pluginx_bookmarks', []);
                    if (bmarks.length > 0) {
                        _this.build({ results: bmarks, collection: true, total_pages: 1, page: 1 });
                        var rendered = _this.render();
                        rendered.addClass('main-grid'); 
                        if (bmarks[0].is_studios_noimg) rendered.addClass('is-noimg-grid');
                        else if (bmarks[0].is_models_grid) rendered.addClass('is-models-grid');
                        else if (bmarks[0].is_grid) rendered.addClass('is-categories-grid');
                    } else {
                        _this.empty();
                    }
                    return;
                }
                
                var target = object.url || PORNO365_DOMAIN;
                if (currentSite === 'lenkino') target = object.url || LENKINO_DOMAIN;
                if (currentSite === 'longvideos') target = object.url || (LONGVIDEOS_DOMAIN + '/latest-updates/');

                if (currentSite === 'lenkino') {
                    target = target.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '') + '/page/' + (object.page || 1);
                } else if (currentSite === 'longvideos' && object.page > 1) {
                    var uParts = target.split('?');
                    var baseS = uParts[0].replace(/\/[0-9]+\/$/, '/');
                    if (!baseS.endsWith('/')) baseS += '/';
                    target = baseS + object.page + '/' + (uParts.length > 1 ? '?' + uParts[1] : '');
                }
                
                smartRequest(target, function (htmlText) {
                    var parser = new DOMParser(), doc = parser.parseFromString(htmlText, 'text/html');
                    var cleanD = currentSite === 'lenkino' ? LENKINO_DOMAIN : (currentSite === 'longvideos' ? LONGVIDEOS_DOMAIN : PORNO365_DOMAIN);
                    var targetPath = target.replace(cleanD, '').split('?')[0].replace(/\/page\/[0-9]+$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    
                    if (currentSite === 'longvideos') {
                        var sortListUl = doc.querySelector('#_sort_list, #list_videos_common_videos_list_sort_list, #list_content_sources_sponsors_list_sort_list');
                        if (sortListUl) {
                            var sortLinks = sortListUl.querySelectorAll('a');
                            var dynamicSortItems = [];
                            for (var s = 0; s < sortLinks.length; s++) {
                                var sHref = sortLinks[s].getAttribute('href');
                                if (sHref && sHref.indexOf('http') !== 0) sHref = cleanD + sHref;
                                dynamicSortItems.push({ title: sortLinks[s].innerText.trim(), url: sHref });
                            }
                            if (dynamicSortItems.length > 0) {
                                var activeSortTitle = 'Сортування';
                                var sortStrong = doc.querySelector('.sort strong, .filter-channels strong');
                                if (sortStrong) {
                                    activeSortTitle = sortStrong.innerText.trim();
                                    var innerSpan = sortStrong.querySelector('span, small');
                                    if (innerSpan) activeSortTitle = activeSortTitle.replace(innerSpan.innerText.trim(), '').trim();
                                }
                                _this._dynamicSort = { subtitle: activeSortTitle, items: dynamicSortItems };
                            }
                        }
                    }

                    var res = [];
                    if (currentSite === 'longvideos') {
                        var cleanPath = targetPath.replace(/\/+$/, ''); 
                        // ВИПРАВЛЕНО: Використовуємо переданий контекст сторінки (object.is_models)
                        var isModelsList = object.is_models || cleanPath === '/models';
                        var isSitesList = object.is_studios || cleanPath === '/sites';
                        
                        if (isModelsList) res = parseModelsLongvideos(doc, cleanD);
                        else if (isSitesList) res = parseStudiosLongvideos(doc, cleanD);
                        else if (object.is_related) {
                            var relCont = doc.querySelector('.related-videos, .related_videos');
                            if (relCont) res = parseCardsLongvideos(relCont, cleanD);
                        } else res = parseCardsLongvideos(doc, cleanD);
                    } else if (currentSite === 'lenkino') {
                        var isStudiosLenkino = object.is_studios || (targetPath === '/channels' || targetPath === '/channels-new' || targetPath === '/channels-views');
                        if (targetPath === '/categories') res = parseCategories(doc, cleanD, currentSite);
                        else if (object.is_models || targetPath === '/pornstars') res = parseModels(doc, cleanD, currentSite);
                        else res = parseCardsLenkino(doc, cleanD, isStudiosLenkino);
                    } else {
                        if (targetPath === '/categories') res = parseCategories(doc, cleanD, currentSite);
                        else if (object.is_models || targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0) res = parseModels(doc, cleanD, currentSite);
                        else res = parseCards365(doc, cleanD, object.is_related);
                    }
                    
                    if (res.length > 0) { 
                        _this.build({ results: res, collection: true, total_pages: 50, page: object.page || 1 }); 
                        var rendered = _this.render();
                        rendered.addClass('main-grid');
                        
                        if (res[0].is_studios_noimg) rendered.addClass('is-noimg-grid');
                        else if (res[0].is_models_grid) rendered.addClass('is-models-grid');
                        else if (res[0].is_grid && !res[0].is_models_grid && !res[0].is_studios_noimg) rendered.addClass('is-categories-grid');
                        
                    } else _this.empty(); 
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (currentSite === 'bookmarks') return reject();
                if (object.is_related) return reject();
                var cleanD = currentSite === 'lenkino' ? LENKINO_DOMAIN : (currentSite === 'longvideos' ? LONGVIDEOS_DOMAIN : PORNO365_DOMAIN);
                var targetPath = (object.url || '').replace(cleanD, '').split('?')[0].replace(/\/page\/[0-9]+$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                if (targetPath === '/categories') return reject(); 

                var url = object.url || cleanD;
                if (currentSite === 'lenkino') {
                    var baseLen = (object.url || LENKINO_DOMAIN).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    url = baseLen + '/page/' + object.page;
                } else if (currentSite === 'longvideos') {
                    var uP = (object.url || (LONGVIDEOS_DOMAIN + '/latest-updates/')).split('?');
                    var bL = uP[0].replace(/\/[0-9]+\/$/, '/');
                    if (!bL.endsWith('/')) bL += '/';
                    url = bL + object.page + '/' + (uP.length > 1 ? '?' + uP[1] : '');
                } else {
                    var base365 = (object.url || PORNO365_DOMAIN).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    url = base365 + (base365.indexOf('?') !== -1 ? '&' : '/') + object.page;
                }
                
                smartRequest(url, function (htmlText) {
                    var parser = new DOMParser(), doc = parser.parseFromString(htmlText, 'text/html');
                    var res = [];
                    
                    if (currentSite === 'longvideos') {
                        var cleanPath = targetPath.replace(/\/+$/, '');
                        var isModelsList = object.is_models || cleanPath === '/models';
                        var isSitesList = object.is_studios || cleanPath === '/sites';

                        if (isModelsList) res = parseModelsLongvideos(doc, cleanD);
                        else if (isSitesList) res = parseStudiosLongvideos(doc, cleanD);
                        else res = parseCardsLongvideos(doc, cleanD);
                    } else if (currentSite === 'lenkino') {
                        var isStudiosLenkino = object.is_studios || (targetPath === '/channels' || targetPath === '/channels-new' || targetPath === '/channels-views');
                        if (object.is_models || targetPath === '/pornstars') res = parseModels(doc, cleanD, currentSite);
                        else res = parseCardsLenkino(doc, cleanD, isStudiosLenkino);
                    } else {
                        if (object.is_models || targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0) res = parseModels(doc, cleanD, currentSite);
                        else res = parseCards365(doc, cleanD, false);
                    }

                    if (res.length > 0) resolve({ results: res, collection: true, total_pages: 50, page: object.page }); 
                    else reject();
                }, reject);
            };

            comp.filter = function () {
                var cleanD = currentSite === 'lenkino' ? LENKINO_DOMAIN : (currentSite === 'longvideos' ? LONGVIDEOS_DOMAIN : PORNO365_DOMAIN);
                var curUrl = object.url || '';
                if (currentSite === 'longvideos' && !curUrl) curUrl = cleanD + '/latest-updates/';
                var targetPath = curUrl.replace(cleanD, '').split('?')[0];
                var cleanPath = targetPath.replace(/\/+$/, '');
                var isCategories = targetPath === '/categories';
                
                var items = [
                    { title: 'Пошук', action: 'search' },
                    { title: '⭐ Обране', action: 'bookmarks' }
                ];
                
                if (currentSite === 'longvideos') items.push({ title: 'Моделі', action: 'models' }, { title: 'Студії', action: 'studios' });
                else if (currentSite !== 'bookmarks') items.push({ title: 'Категорії', action: 'categories' }, { title: 'Моделі', action: 'models' });
                
                var sortItems = [], currentSortTitle = 'Нові'; 
                
                if (currentSite === 'longvideos') {
                    if (this._dynamicSort) {
                        sortItems = this._dynamicSort.items;
                        currentSortTitle = this._dynamicSort.subtitle;
                    } else {
                        sortItems.push({ title: 'Нові', url: cleanD + '/latest-updates/' }, { title: 'Рейтингові', url: cleanD + '/top-rated/all/' }, { title: 'Популярні (весь час)', url: cleanD + '/most-popular/all/' });
                    }
                } else if (currentSite === 'lenkino') {
                    items.push({ title: 'Студії', action: 'studios_lenkino' });
                    if (curUrl.indexOf('/channels') !== -1) {
                        var bS = cleanD + '/channels'; sortItems.push({ title: 'Кращі', url: bS }, { title: 'Нові', url: bS + '-new' }, { title: 'Популярні', url: bS + '-views' });
                        if (curUrl === bS + '-new') currentSortTitle = 'Нові'; else if (curUrl === bS + '-views') currentSortTitle = 'Популярні'; else currentSortTitle = 'Кращі';
                    } else {
                        var bV = curUrl.replace(/\/top-porno$/, '').replace(/\/hot-porno$/, '').replace(/-top$/, '').replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                        if (bV === cleanD) { sortItems.push({ title: 'Нові', url: cleanD }, { title: 'Кращі', url: cleanD + '/top-porno' }, { title: 'Гарячі', url: cleanD + '/hot-porno' }); if (curUrl.indexOf('/top-porno') !== -1) currentSortTitle = 'Кращі'; else if (curUrl.indexOf('/hot-porno') !== -1) currentSortTitle = 'Гарячі'; else currentSortTitle = 'Нові'; }
                        else { sortItems.push({ title: 'Нові', url: bV }, { title: 'Кращі', url: bV + '-top' }, { title: 'Гарячі', url: bV }); if (curUrl.indexOf('-top') !== -1) currentSortTitle = 'Кращі'; else currentSortTitle = 'Нові'; }
                    }
                } else if (currentSite === 'porno365') {
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
                
                if (!isCategories && sortItems.length > 0 && currentSite !== 'bookmarks') items.push({ title: 'Сортування', subtitle: currentSortTitle, action: 'sort', sort_items: sortItems });

                Lampa.Select.show({ title: 'Навігація', items: items, onSelect: function (a) {
                    if (a.action === 'search') {
                        Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(v) { 
                            if (v) {
                                var sUrl = cleanD + '/search/?q=' + encodeURIComponent(v);
                                if (currentSite === 'lenkino') sUrl = cleanD + '/search/' + encodeURIComponent(v);
                                if (currentSite === 'longvideos') sUrl = cleanD + '/search/' + encodeURIComponent(v) + '/relevance/';
                                Lampa.Activity.push({ url: sUrl, title: 'Пошук: ' + v, component: 'pluginx_comp', site: currentSite, page: 1 }); 
                            }
                            Lampa.Controller.toggle('content'); 
                        });
                    }
                    else if (a.action === 'bookmarks') Lampa.Activity.push({ title: 'Обране', component: 'pluginx_comp', site: 'bookmarks', page: 1 });
                    
                    // ВИПРАВЛЕНО: Додаємо прапорці при переході в Моделі/Студії, щоб плагін запам'ятав контекст
                    else if (a.action === 'models') Lampa.Activity.push({ url: cleanD + (currentSite === 'lenkino' ? '/pornstars' : '/models/'), title: 'Моделі', component: 'pluginx_comp', site: currentSite, page: 1, is_models: true });
                    else if (a.action === 'studios') Lampa.Activity.push({ url: cleanD + '/sites/', title: 'Студії', component: 'pluginx_comp', site: currentSite, page: 1, is_studios: true });
                    else if (a.action === 'studios_lenkino') Lampa.Activity.push({ url: cleanD + '/channels', title: 'Студії', component: 'pluginx_comp', site: currentSite, page: 1, is_studios: true });
                    else if (a.action === 'categories') Lampa.Activity.push({ url: cleanD + '/categories', title: 'Категорії', component: 'pluginx_comp', site: currentSite, page: 1 });
                    
                    // ВИПРАВЛЕНО: При сортуванні наслідуємо контекст (якщо були в моделях, залишаємось в моделях)
                    else if (a.action === 'sort') Lampa.Select.show({ title: 'Сортування', items: a.sort_items, onSelect: function(s) { 
                        Lampa.Activity.push({ 
                            url: s.url, title: s.title, component: 'pluginx_comp', site: currentSite, page: 1,
                            is_models: object.is_models,
                            is_studios: object.is_studios
                        }); 
                    }, onBack: function() { comp.filter(); } });
                }, onBack: function () { Lampa.Controller.toggle('content'); } });
            };
            comp.cardRender = function (card, element, events) {
                events.onEnter = function () {
                    hidePreview();
                    var targetSite = currentSite;
                    if (currentSite === 'bookmarks') {
                        if (element.url.indexOf(LENKINO_DOMAIN) !== -1) targetSite = 'lenkino';
                        else if (element.url.indexOf(LONGVIDEOS_DOMAIN) !== -1) targetSite = 'longvideos';
                        else targetSite = 'porno365';
                    }

                    if (element.is_grid) { 
                        Lampa.Activity.push({ url: element.url, title: element.name, component: 'pluginx_comp', site: targetSite, page: 1 }); 
                        return; 
                    }
                    
                    smartRequest(element.url, function(htmlText) {
                        var str = [], doc = new DOMParser().parseFromString(htmlText, 'text/html');
                        if (targetSite === 'longvideos') {
                            var sources = doc.querySelectorAll('video source');
                            if (sources.length > 0) str.push({ title: sources[0].getAttribute('label') || 'Оригінал', url: sources[0].getAttribute('src') });
                        } else if (targetSite === 'lenkino') {
                            var u = htmlText.match(/video_url:[\t ]+'([^']+)'/), a = htmlText.match(/video_alt_url:[\t ]+'([^']+)'/);
                            if (u && u[1]) str.push({ title: 'Стандарт', url: u[1] });
                            if (a && a[1]) str.push({ title: 'Основний (HD)', url: a[1] });
                        } else {
                            var q = doc.querySelectorAll('.quality_chooser a');
                            for (var j = 0; j < q.length; j++) if (q[j].getAttribute('href')) str.push({ title: q[j].innerText.trim(), url: q[j].getAttribute('href') });
                        }
                        if (str.length > 0) {
                            var bestStream = (targetSite === 'longvideos') ? str[0] : str[str.length - 1];
                            var playData = { title: element.name, url: bestStream.url, quality: str };
                            if (targetSite === 'lenkino') playData.headers = { 'Referer': 'https://wes.lenkino.adult/', 'Origin': 'https://wes.lenkino.adult' };
                            Lampa.Player.play(playData); Lampa.Player.playlist([playData]);
                        }
                    });
                };

                events.onMenu = function () {
                    hidePreview();
                    var bmarks = window.Lampa.Storage.get('pluginx_bookmarks', []);
                    var isBookmarked = bmarks.some(function(b) { return b.url === element.url; });
                    var toggleBookmark = function() {
                        var currentBmarks = window.Lampa.Storage.get('pluginx_bookmarks', []);
                        var idx = currentBmarks.findIndex(function(b) { return b.url === element.url; });
                        if (idx !== -1) {
                            currentBmarks.splice(idx, 1);
                            Lampa.Noty.show('Видалено з обраного');
                        } else {
                            currentBmarks.unshift(element);
                            Lampa.Noty.show('Додано до обраного');
                        }
                        window.Lampa.Storage.set('pluginx_bookmarks', currentBmarks);
                    };

                    var targetSite = currentSite;
                    if (currentSite === 'bookmarks') {
                        if (element.url.indexOf(LENKINO_DOMAIN) !== -1) targetSite = 'lenkino';
                        else if (element.url.indexOf(LONGVIDEOS_DOMAIN) !== -1) targetSite = 'longvideos';
                        else targetSite = 'porno365';
                    }

                    smartRequest(element.url, function (htmlText) {
                        var doc = new DOMParser().parseFromString(htmlText, 'text/html'), menu = [];
                        menu.push({ title: isBookmarked ? '★ Видалити з обраного' : '☆ Додати до обраного', action: 'bookmark' });
                        
                        if (targetSite === 'longvideos') {
                            var sources = doc.querySelectorAll('video source');
                            if (sources.length > 1) menu.push({ title: 'Відтворити в ' + (sources[1].getAttribute('label') || 'Альтернативна якість'), action: 'play_direct', url: sources[1].getAttribute('src') });
                            
                            // ВИПРАВЛЕНО: Рівно .btn_model. 
                            var lvModels = doc.querySelectorAll('.btn_model');
                            var addedModels = [];
                            for (var m = 0; m < lvModels.length; m++) {
                                var mTitle = lvModels[m].innerText.trim();
                                var mUrl = lvModels[m].getAttribute('href');
                                if (mTitle && mUrl && addedModels.indexOf(mTitle) === -1) {
                                    menu.push({ title: mTitle, action: 'direct', url: mUrl });
                                    addedModels.push(mTitle);
                                }
                            }
                            
                            var sponsors = doc.querySelectorAll('.btn_sponsor, .btn_sponsor_group');
                            for (var sp = 0; sp < sponsors.length; sp++) {
                                var spName = sponsors[sp].innerText.trim();
                                if (sponsors[sp].classList.contains('btn_sponsor_group')) spName += ' (Network)';
                                menu.push({ title: spName, action: 'direct', url: sponsors[sp].getAttribute('href') });
                            }
                            menu.push({ title: 'Категорії', action: 'lv_cats', html: htmlText }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        } else if (targetSite === 'lenkino') {
                            var mEls = doc.querySelectorAll('.grd-mdl a'); for (var m = 0; m < mEls.length; m++) menu.push({ title: mEls[m].innerText.trim(), action: 'direct', url: mEls[m].getAttribute('href') });
                            var sEls = doc.querySelectorAll('.vid-aut a, .itm-aut a, .grd-spn a');
                            for (var s = 0; s < sEls.length; s++) { var sT = sEls[s].innerText.trim().replace(/\s+/g, ' '); if (!menu.some(function(i) { return i.title === sT; }) && sT) menu.push({ title: sT, action: 'direct', url: sEls[s].getAttribute('href') }); }
                            menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        } else {
                            var mEls365 = doc.querySelectorAll('.video-categories.video-models a'); for (var m365 = 0; m365 < mEls365.length; m365++) menu.push({ title: mEls365[m365].innerText.trim(), action: 'direct', url: mEls365[m365].getAttribute('href') });
                            menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Теги', action: 'tags' }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        }

                        Lampa.Select.show({ title: 'Дії', items: menu, onSelect: function (a) {
                            if (a.action === 'bookmark') toggleBookmark();
                            else if (a.action === 'play_direct') { Lampa.Player.play({ title: element.name, url: a.url }); Lampa.Player.playlist([{ title: element.name, url: a.url }]); } 
                            else if (a.action === 'sim' || a.action === 'direct') { Lampa.Activity.push({ url: a.url, title: a.title || 'Схожі', component: 'pluginx_comp', site: targetSite, page: 1, is_related: (a.action === 'sim') }); } 
                            else if (a.action === 'lv_cats') {
                                var tempDoc = new DOMParser().parseFromString(a.html, 'text/html'), tags = tempDoc.querySelectorAll('.btn_tag, .btn_tag.hidden'), tagItems = [];
                                for (var t = 0; t < tags.length; t++) tagItems.push({ title: tags[t].innerText.trim(), url: tags[t].getAttribute('href') });
                                if (tagItems.length > 0) Lampa.Select.show({ title: 'Категорії', items: tagItems, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: targetSite, page: 1 }); }, onBack: function () { events.onMenu(); } });
                            } else {
                                var sel = (a.action === 'cats') ? (targetSite === 'lenkino' ? '.vid-cat a' : '.video-categories:not(.video-models) a') : '.video-tags a';
                                var subEls = doc.querySelectorAll(sel), sub = [];
                                for (var i = 0; i < subEls.length; i++) sub.push({ title: subEls[i].innerText.trim(), url: subEls[i].getAttribute('href') });
                                if (sub.length > 0) Lampa.Select.show({ title: a.title, items: sub, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: targetSite, page: 1 }); }, onBack: function () { events.onMenu(); } });
                            }
                        }, onBack: function () { Lampa.Controller.toggle('content'); } });
                    });
                };

                var originalFocus = events.onFocus;
                events.onFocus = function (target) {
                    if (typeof originalFocus === 'function') {
                        originalFocus(target); 
                    }
                    hidePreview(); 
                    if (element.preview && !element.is_grid) {
                        previewTimeout = setTimeout(function () { 
                            showPreview($(target), element.preview); 
                        }, 1000);
                    }
                };
            };
            
            comp.onRight = comp.filter.bind(comp); 
            return comp;
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);

        (function() {
            var currentActivity, hideTimeout, isClicking = false; 
            var filterBtn = $('<div class="head__action head__settings selector pluginx-filter-btn"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect><rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect><circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle><circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle><circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle></svg></div>');

            filterBtn.hide().on('hover:enter click', function() {
                if (isClicking) return;
                isClicking = true; setTimeout(function() { isClicking = false; }, 300);
                try { if (currentActivity && currentActivity.activity) { var c = (window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) ? currentActivity.activity.component : currentActivity.activity.component(); if (c && typeof c.filter === 'function') c.filter(); } } catch (e) { }
            });

            Lampa.Listener.follow('activity', function(e) {
                if (e.type == 'start') currentActivity = e.object;
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function() { if (currentActivity && currentActivity.component !== 'pluginx_comp') filterBtn.hide(); }, 1000);
                if (e.type == 'start' && e.component == 'pluginx_comp') {
                    if ($('.head .open--search').length) $('.head .open--search').before(filterBtn);
                    else $('.head__actions').prepend(filterBtn);
                    filterBtn.show(); currentActivity = e.object;
                }
            });
        })();
    }

    function addMenu() {
        if (window.Lampa && window.Lampa.Storage) {
            var hiddenMenu = window.Lampa.Storage.get('menu_hide');
            if (hiddenMenu && Array.isArray(hiddenMenu)) { var idx = hiddenMenu.indexOf('pluginx'); if (idx !== -1) { hiddenMenu.splice(idx, 1); window.Lampa.Storage.set('menu_hide', hiddenMenu); } }
        }
        var menuList = $('.menu .menu__list').eq(0);
        if (menuList.length && menuList.find('[data-action="pluginx"]').length === 0) {
            var item = $('<li class="menu__item selector" data-action="pluginx" id="menu_pluginx"><div class="menu__ico"><img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" /></div><div class="menu__text">CatalogX</div></li>');
            item.on('hover:enter', function () {
                Lampa.Select.show({ title: 'CatalogX', items: [ { title: 'Porno365', site: 'porno365' }, { title: 'Lenkino', site: 'lenkino' }, { title: 'LongVideos', site: 'longvideos' } ], onSelect: function(a) { Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 }); }, onBack: function() { Lampa.Controller.toggle('menu'); } });
            });
            var settings = menuList.find('[data-action="settings"]');
            if (settings.length) item.insertBefore(settings); else menuList.append(item);
        }
    }

    function initPlugin() { startPlugin(); addMenu(); }
    if (window.appready) initPlugin(); else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') initPlugin(); });
})();
