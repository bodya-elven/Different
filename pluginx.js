(function () {
    'use strict';

    var PORNO365_DOMAIN = 'https://w.porno365.gold'; 
    var LENKINO_DOMAIN = 'https://wes.lenkino.adult';
    var LONGVIDEOS_DOMAIN = 'https://www.longvideos.xxx';

    function startPlugin() {
        if (window.pluginx_ready) return;
        window.pluginx_ready = true;

        var css = '<style>' +
            /* ЧИСТИЙ КОНТЕЙНЕР: Жодних flex чи float, щоб не ламати пульт ТБ */
            '.main-grid { padding: 0 !important; }' +
            
            /* ПРАВИЛЬНІ РОЗМІРИ: 1 колонка відео на телефоні, 4 на ТБ */
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
            '.main-grid .card__img { object-fit: cover !important; border-radius: 12px !important; z-index: 2; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1 !important; }' +
            
            '.main-grid .card__title { ' +
                'display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; white-space: normal !important; text-align: left !important; ' +
                'line-height: 1.2 !important; max-height: 3.6em !important; padding-top: 2px !important; margin-top: 0 !important; text-overflow: ellipsis !important; ' +
            '}' +
            '.main-grid.is-categories-grid .card__title, .main-grid.is-models-grid .card__title { -webkit-line-clamp: 2 !important; text-align: center !important; font-weight: normal !important; margin-top: 5px !important; }' +
            
            /* СТУДІЇ: Низькі (25%) і сірі (#c4c4c4) */
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
                    
                    var imgEl = el.querySelector('img.thumb, img.thumb_img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                    if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;

                    var previewEl = el.querySelector('.img.thumb__img'), pUrl = previewEl ? previewEl.getAttribute('data-preview') : '';
                    if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;

                    // ВИПРАВЛЕНА ПОМИЛКА ТУТ: Прибрано зайвий querySelector
                    var timeEl = el.querySelector('.duration'), timeText = timeEl ? timeEl.innerText.replace(/Full Video/gi, '').trim() : '';
                    
                    var modelEls = el.querySelectorAll('.models__item'), cardModels = [];
                    for (var m = 0; m < modelEls.length; m++) cardModels.push({ title: modelEls[m].innerText.trim(), url: modelEls[m].getAttribute('href') });

                    results.push({ name: formatTitle(name, timeText, '▶'), url: vUrl, picture: img, img: img, preview: pUrl, card_models: cardModels });
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
                var headlines = doc.querySelectorAll('.list-sponsors .headline, .headline'); 
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
