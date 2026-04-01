(function () {
    'use strict';

    // ==========================================
    // СТРУКТУРНІ КОМПОНЕНТИ ТА ДОПОМІЖНІ ФУНКЦІЇ
    // ==========================================

    var pluginManifest = {
        name: 'CatalogX',
        version: '2.2.8',
        description: 'Мульти-каталог для медіаконтенту.',
        author: '@bodya_elven'
    };
g
    // Глобальна функція для авто-повтору завантаження картинок
    window.pluginx_handleImageRetry = function(img) {
        var maxRetries = 3; // Максимальна кількість спроб
        var retryCount = parseInt(img.getAttribute('data-retry-count')) || 0;
        var originalSrc = img.getAttribute('data-src-original');
        
        if (!originalSrc || retryCount >= maxRetries) {
            img.onerror = null; // Зупиняємо спроби
            return;
        }
        
        retryCount++;
        img.setAttribute('data-retry-count', retryCount);
        
        // Додаємо анти-кеш хвіст
        var separator = originalSrc.indexOf('?') === -1 ? '?' : '&';
        var newSrc = originalSrc + separator + 'retry_ph=' + retryCount;
        var delay = 1000 * Math.pow(2, retryCount - 1); // Експоненціальна затримка: 1с, 2с, 4с
        
        setTimeout(function() {
            img.src = newSrc; // Завантажуємо знову
        }, delay);
    };
    
    

    function startPlugin() {
        if (window.pluginx_ready) return;
        window.pluginx_ready = true;

var css = '<style>.main-grid { padding: 0 !important; } @media screen and (max-width: 580px) { .main-grid .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 5px !important; } .main-grid.categories-grid .card, .main-grid.models-grid .card, .main-grid.noimg-grid .card { width: 50% !important; } } @media screen and (min-width: 581px) { .main-grid .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; } .main-grid.noimg-main-grid .card { width: 50% !important; } .main-grid.categories-grid .card, .main-grid.models-grid .card, .main-grid.noimg-grid .card { width: 16.666% !important; } } .main-grid .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; position: relative !important; } .main-grid.categories-grid .card__view { padding-bottom: 62.5% !important; background: #ffffff !important; } .main-grid.models-grid .card__view { padding-bottom: 150% !important; background: #ffffff !important; } .main-grid .card__img { object-fit: cover !important; border-radius: 12px !important; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1 !important; } .main-grid .card__title { display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; white-space: normal !important; text-align: left !important; line-height: 1.2 !important; max-height: 3.6em !important; padding-top: 2px !important; margin-top: 0 !important; text-overflow: ellipsis !important; } .main-grid.categories-grid .card__title, .main-grid.models-grid .card__title { -webkit-line-clamp: 2 !important; text-align: center !important; font-weight: normal !important; margin-top: 5px !important; } .main-grid.noimg-grid .card, .main-grid.noimg-main-grid .card { height: auto !important; position: relative !important; display: flex !important; align-items: stretch !important; } .main-grid.noimg-grid .card__view, .main-grid.noimg-main-grid .card__view { display: none !important; } .main-grid.noimg-grid .card__title, .main-grid.noimg-main-grid .card__title { position: relative !important; width: 100% !important; height: 100% !important; min-height: 80px !important; color: #ffffff !important; font-weight: normal !important; font-size: 1.3em !important; text-align: center !important; display: flex !important; align-items: center !important; justify-content: center !important; white-space: normal !important; word-break: break-word !important; -webkit-line-clamp: unset !important; -webkit-box-orient: unset !important; padding: 15px !important; margin: 0 !important; background: rgba(35,35,35,0.9) !important; border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.1) !important; transition: transform 0.2s, background 0.2s !important; z-index: 10 !important; } .main-grid.noimg-grid .card.focus .card__title, .main-grid.noimg-main-grid .card.focus .card__title { transform: scale(1.03) !important; background: rgba(70,70,70,0.95) !important; border-color: #fff !important; box-shadow: 0 0 10px rgba(255,255,255,0.3) !important; } @media screen and (min-width: 581px) { .main-grid.noimg-main-grid .card__title { font-size: 1.4em !important; min-height: 100px !important; } .main-grid.noimg-grid .card__title { font-size: 1.1em !important; min-height: 60px !important; padding: 10px !important; } } .main-grid .card__age, .main-grid .card__textbox { display: none !important; } .pluginx-filter-btn { order: -1 !important; margin-right: auto !important; }</style>';

        $('body').append(css);

        window.pluginx_smartRequest = function(url, onSuccess, onError, customHeaders) {
            var network = new Lampa.Reguest(), headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" };
            if (customHeaders) { for (var k in customHeaders) headers[k] = customHeaders[k]; }
            var isAndroid = typeof window !== 'undefined' && window.Lampa && window.Lampa.Platform && window.Lampa.Platform.is('android');
            if (isAndroid) {
                network.native(url, function (res) { onSuccess(typeof res === 'object' ? JSON.stringify(res) : res); }, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
            } else {
                network.silent(url, onSuccess, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
            }
        };

        window.pluginx_formatTitle = function(name, info, symbol) {
            if (!info) return name;
            var cleanInfo = info.replace(/[^0-9:]/g, '');
            return name + ' ' + symbol + ' ' + cleanInfo;
        };

        var previewTimeout, activePreviewNode;
        window.pluginx_hidePreview = function() {
            clearTimeout(previewTimeout);
            if (activePreviewNode) {
                var vid = activePreviewNode.find('video')[0];
                if (vid) { try { vid.pause(); } catch(e) {} vid.removeAttribute('src'); vid.load(); }
                activePreviewNode.remove();
                activePreviewNode = null;
            }
        };

        window.pluginx_showPreview = function(target, src) {
            var previewContainer = $('<div class="sisi-video-preview" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;overflow:hidden;z-index:4;background:#000;"><video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video></div>');
            var videoEl = previewContainer.find('video')[0], sources = Array.isArray(src) ? src : [src];
            if (!sources || sources.length === 0 || !sources[0]) return;
            var currentIdx = 0;
            videoEl.src = sources[currentIdx];
            videoEl.onerror = function() {
                currentIdx++;
                if (currentIdx < sources.length) {
                    videoEl.src = sources[currentIdx];
                    var p = videoEl.play();
                    if (p !== undefined) p.catch(function(){});
                }
            };
            target.find('.card__view').append(previewContainer);
            activePreviewNode = previewContainer;
            var playPromise = videoEl.play();
            if (playPromise !== undefined) playPromise.catch(function(){});
        };

        // ==========================================
        // БАЗА АДАПТЕРІВ САЙТІВ (Модульна система)
        // ==========================================

        var Adapters = {

            // Блок Porno365
            porno365: {
                title: 'Porno365',
                domain: 'https://w.porno365.gold',
                getHomeUrl: function() { return this.domain; },
                getSearchUrl: function(query) { return this.domain + '/search/?q=' + encodeURIComponent(query); },
                getUrl: function(object, page) {
                    var url = object.url || this.domain;
                    var base = url.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                    if (page > 1) return base + (base.indexOf('?') !== -1 ? '&' : '/') + page;
                    return url;
                },
                getFilters: function(doc, currentUrl) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0];
                    var isModels = targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0;
                    var sortItems = [], activeTitle = 'Сортування';
                    if (isModels) {
                        var mUrl = this.domain + '/models', p365CurrentSort = 'По количеству';
                        if (currentUrl.indexOf('sort-by-subscribers') !== -1) p365CurrentSort = 'По популярности';
                        else if (currentUrl.indexOf('sort-by-alphabetical') !== -1) p365CurrentSort = 'По алфавиту';
                        else if (currentUrl.indexOf('sort-by-date') !== -1) p365CurrentSort = 'Новые';
                        activeTitle = p365CurrentSort;
                        if (p365CurrentSort !== 'По количеству') sortItems.push({ title: 'По количеству', url: mUrl });
                        if (p365CurrentSort !== 'По популярности') sortItems.push({ title: 'По популярности', url: mUrl + '/sort-by-subscribers' });
                        if (p365CurrentSort !== 'По алфавиту') sortItems.push({ title: 'По алфавиту', url: mUrl + '/sort-by-alphabetical' });
                        if (p365CurrentSort !== 'Новые') sortItems.push({ title: 'Новые', url: mUrl + '/sort-by-date' });
                        return { subtitle: activeTitle, items: sortItems };
                    }
                    var stextWrapper = doc.querySelector('.stext_wrapper');
                    if (stextWrapper) {
                        var divs = stextWrapper.querySelectorAll('.div_sort');
                        for (var i = 0; i < divs.length; i++) {
                            var span = divs[i].querySelector('span');
                            var prefix = span ? (span.textContent || '').replace(/:$/, '').trim() + ' - ' : '';
                            var els = divs[i].querySelectorAll('a, span.active_sort, strong');
                            for (var j = 0; j < els.length; j++) {
                                var el = els[j];
                                if (el.tagName.toLowerCase() === 'span' && el === span) continue;
                                var text = (el.textContent || '').trim(), fullTitle = prefix ? prefix + text : text, pUrl = el.getAttribute('href');
                                if (pUrl && (pUrl.indexOf('/ru') !== -1 || pUrl.indexOf('/male') !== -1 || pUrl.indexOf('/all') !== -1) && pUrl.indexOf('sort-by') === -1) continue;
                                if (!pUrl || el.classList.contains('active_sort') || el.tagName.toLowerCase() === 'strong') {
                                    activeTitle = fullTitle;
                                } else {
                                    if (pUrl.indexOf('http') !== 0) pUrl = this.domain + pUrl;
                                    sortItems.push({ title: fullTitle, url: pUrl });
                                }
                            }
                        }
                    }
                    return { subtitle: activeTitle, items: sortItems };
                },
                getNavItems: function() {
                    return [
                        { title: '🗄️ Категорії', action: 'nav', url: this.domain + '/categories', is_categories: true },
                        { title: '👸 Моделі', action: 'nav', url: this.domain + '/models', is_models: true }
                    ];
                },
                parse: function(doc, currentUrl, object) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    var results = [];
                    if (targetPath === '/categories' || object.is_categories) {
                        var linksCat = doc.querySelectorAll('.categories-list-div a'), added = [];
                        for (var i = 0; i < linksCat.length; i++) {
                            var el = linksCat[i], title = el.getAttribute('title') || '';
                            if (!title) { var tEl = el.querySelector('.category-title'); title = tEl ? tEl.textContent : el.textContent; }
                            title = (title || '').trim();
                            var href = el.getAttribute('href');
                            if (!title || title.toLowerCase().indexOf('ai') !== -1 || title.toLowerCase().indexOf('extra') !== -1) continue;
                            var imgEl = el.querySelector('img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                            if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = this.domain + img;
                            if (href && title && added.indexOf(href) === -1 && href.indexOf('javascript') === -1) {
                                var vUrl = href.startsWith('http') ? href : this.domain + (href.startsWith('/') ? '' : '/') + href;
                                results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true });
                                added.push(href);
                            }
                        }
                    } else if (object.is_models || targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0) {
                        var mEls = doc.querySelectorAll('.item_model');
                        for (var k = 0; k < mEls.length; k++) {
                            var elM = mEls[k], linkM = elM.querySelector('a'), nameM = elM.querySelector('.model_eng_name'), countM = elM.querySelector('.cnt_span'), imgM = elM.querySelector('img');
                            if (linkM && nameM) {
                                var vUrlM = linkM.getAttribute('href');
                                if (vUrlM && vUrlM.indexOf('http') !== 0) vUrlM = this.domain + vUrlM;
                                results.push({ name: window.pluginx_formatTitle((nameM.textContent || '').trim(), countM ? (countM.textContent || '').trim() : '', '☰'), url: vUrlM, picture: imgM ? imgM.getAttribute('src') : '', img: imgM ? imgM.getAttribute('src') : '', is_grid: true, is_models: true });
                            }
                        }
                    } else {
                        var sel = object.is_related ? '.related .related_video' : 'li.video_block, li.trailer', elements = doc.querySelectorAll(sel);
                        for (var p = 0; p < elements.length; p++) {
                            var elV = elements[p], linkEl = elV.querySelector('a.image'), titleEl = elV.querySelector('a.image p, .title'), imgElV = elV.querySelector('img'), timeEl = elV.querySelector('.duration'), vP = elV.querySelector('video#videoPreview') || elV.querySelector('video');
                            if (linkEl && titleEl) {
                                var imgV = imgElV ? (imgElV.getAttribute('data-src') || imgElV.getAttribute('data-original') || imgElV.getAttribute('src')) : '';
                                if (imgV && imgV.indexOf('//') === 0) imgV = 'https:' + imgV;
                                var vUrlV = linkEl.getAttribute('href');
                                if (vUrlV && vUrlV.indexOf('http') !== 0) vUrlV = this.domain + (vUrlV.startsWith('/') ? '' : '/') + vUrlV.replace(/^\//, '');
                                var pUrl = vP ? (vP.getAttribute('src') || vP.getAttribute('data-src') || '') : '';
                                if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                                var previewData = pUrl, matchId = vUrlV.match(/\/movie\/(\d+)/);
                                if (matchId && matchId[1]) {
                                    var vidId = matchId[1], f1 = vidId.charAt(0), f2 = vidId.length > 1 ? vidId.charAt(1) : '0', subs = ['53', '33', '26', '18', '51', '32', '54'];
                                    if (!previewData) previewData = [];
                                    if (Array.isArray(previewData)) for (var s = 0; s < subs.length; s++) previewData.push('https://tr' + subs[s] + '.vide365.com/porno365/trailers/' + f1 + '/' + f2 + '/' + vidId + '.webm');
                                }
                                var nameV = (titleEl.textContent || '').trim(), time = timeEl ? (timeEl.textContent || '').trim() : '';
                                results.push({ name: window.pluginx_formatTitle(nameV, time, '▶'), url: vUrlV, picture: imgV, img: imgV, preview: previewData });
                            }
                        }
                    }
                    return results;
                },
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var str = [], q = doc.querySelectorAll('.quality_chooser a');
                    for (var j = q.length - 1; j >= 0; j--) {
                        var qHref = q[j].getAttribute('href');
                        if(qHref) str.push({ title: (q[j].textContent || '').trim(), url: qHref });
                    }
                    if (str.length > 0) startPlayback(str); else onError();
                },
                getMenu: function(doc, htmlText, element) {
                    var menu = [], q = doc.querySelectorAll('.quality_chooser a'), p365Streams = [];
                    for (var j = q.length - 1; j >= 0; j--) {
                        var qH = q[j].getAttribute('href');
                        if(qH) p365Streams.push({ title: (q[j].textContent || '').trim(), url: qH });
                    }
                    if (p365Streams.length > 1) menu.push({ title: 'Відтворити в ' + p365Streams[1].title, action: 'play_direct', url: p365Streams[1].url });
                    var mEls365 = doc.querySelectorAll('.video-categories.video-models a');
                    for (var m = 0; m < mEls365.length; m++) menu.push({ title: (mEls365[m].textContent || '').trim(), action: 'direct', url: mEls365[m].getAttribute('href') });
                    menu.push({ title: 'Категорії', action: 'cats_custom', sel: '.video-categories:not(.video-models) a' });
                    menu.push({ title: 'Теги', action: 'cats_custom', sel: '.video-tags a' });
                    menu.push({ title: 'Схожі відео', action: 'sim', url: element.url });
                    return menu;
                }
            },

            // Блок Lenkino
            lenkino: {
                title: 'Lenkino',
                domain: 'https://wes.lenkino.adult', // Залишаємо базовий домен
                getHomeUrl: function() { return this.domain; },
                getSearchUrl: function(query) { 
                    // Пробіли змінюємо на дефіси, як ти просив
                    var formattedQuery = query.trim().replace(/\s+/g, '-');
                    return this.domain + '/search/' + encodeURIComponent(formattedQuery); 
                },
                getUrl: function(object, page) {
                    var url = object.url || this.domain;
                    var uParts = url.split('?');
                    // Видаляємо всі можливі варіанти старого /page/X
                    var base = uParts[0].replace(/\/page\/[0-9]+(\/?)$/, '').replace(/\/+$/, '');
                    
                    if (base.indexOf('.html') === -1 && url.indexOf('do=search') === -1) {
                        // Відновлено стару логіку: жорстко додаємо /page/ без скісного слеша в кінці
                        return base + (page > 1 ? '/page/' + page : '') + (uParts.length > 1 ? '?' + uParts[1] : '');
                    }
                    return url;
                },
                getFilters: function(doc, currentUrl) {
                    var btnsContainer = doc.querySelector('.tabs .btns.btns-s');
                    if (btnsContainer) {
                        var activeTitle = 'Сортування', activeSpan = btnsContainer.querySelector('.act');
                        if (activeSpan) activeTitle = (activeSpan.textContent || '').trim();
                        var items = [], links = btnsContainer.querySelectorAll('a');
                        // Оскільки ми беремо тільки <a>, кнопка "Фільтр" (яка <span>) сюди не потрапить
                        for(var i=0; i<links.length; i++) {
                            var href = links[i].getAttribute('href');
                            if (href && href.indexOf('http') !== 0 && href.indexOf('//') !== 0) href = this.domain + (href.startsWith('/') ? '' : '/') + href.replace(/^\//, '');
                            else if (href && href.indexOf('//') === 0) href = 'https:' + href;
                            if (href && href.indexOf('javascript') === -1) items.push({title: (links[i].textContent || '').trim(), url: href});
                        }
                        if (items.length > 0) return { subtitle: activeTitle, items: items };
                    }
                    return null;
                },
                getNavItems: function() {
                    return [
                        { title: '🗄️ Категорії', action: 'nav', url: this.domain + '/categories', is_categories: true },
                        { title: '👸 Моделі', action: 'nav', url: this.domain + '/pornstars', is_models: true },
                        { title: '🎬 Студії', action: 'nav', url: this.domain + '/channels', is_studios: true }
                    ];
                },
                parse: function(doc, currentUrl, object) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    var results = [];

                    if (targetPath === '/categories' || object.is_categories) {
                        // Стара логіка категорій
                        var linksCat = doc.querySelectorAll('.grd-cat a'), added = [];
                        for (var i = 0; i < linksCat.length; i++) {
                            var el = linksCat[i], title = el.getAttribute('title') || (el.textContent || '').trim();
                            if (!title) { var tEl = el.querySelector('.itm-tit'); title = tEl ? tEl.textContent : el.textContent; }
                            title = (title || '').trim();
                            var href = el.getAttribute('href');
                            if (!title || title.toLowerCase().indexOf('ai') !== -1 || title.toLowerCase().indexOf('extra') !== -1) continue;
                            var imgEl = el.querySelector('img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                            if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = this.domain + img;
                            if (href && title && added.indexOf(href) === -1 && href.indexOf('javascript') === -1) {
                                var vUrl = href.startsWith('http') ? href : this.domain + (href.startsWith('/') ? '' : '/') + href.replace(/^\//, '');
                                results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true });
                                added.push(href);
                            }
                        }
                    } else if (object.is_models || targetPath === '/pornstars') {
                        // Відновлено гнучкий пошук моделей: шукаємо .item тільки всередині .grd-mdl
                        var all = doc.querySelectorAll('.item');
                        for (var m = 0; m < all.length; m++) {
                            var elM = all[m]; 
                            if (!elM.closest('.grd-mdl')) continue; // Захист від інших блоків
                            
                            var linkM = elM.querySelector('a'), imgM = elM.querySelector('img'), titleM = elM.querySelector('.itm-tit'), countM = elM.querySelector('.itm-opt li');
                            if (linkM && imgM) {
                                var nameM = titleM ? (titleM.textContent || '').trim() : (imgM.getAttribute('alt') || 'Model');
                                if (titleM) { var clone = titleM.cloneNode(true); var flag = clone.querySelector('img.flg'); if (flag) flag.remove(); nameM = (clone.textContent || '').trim(); }
                                var count = countM ? (countM.textContent || '').trim() : '', imgSrc = imgM.getAttribute('data-src') || imgM.getAttribute('src') || '';
                                if (imgSrc && imgSrc.indexOf('/') === 0) imgSrc = this.domain + imgSrc;
                                var urlM = linkM.getAttribute('href'); if (urlM && urlM.indexOf('http') !== 0) urlM = this.domain + (urlM.startsWith('/') ? '' : '/') + urlM.replace(/^\//, '');
                                results.push({ name: window.pluginx_formatTitle(nameM, count, '☰'), url: urlM, picture: imgSrc, img: imgSrc, is_grid: true, is_models: true });
                            }
                        }
                    } else {
                        // Відновлено ГНУЧКИЙ ПАРСИНГ відео та студій
                        var isStudios = object.is_studios || (targetPath === '/channels' || targetPath === '/channels-new' || targetPath === '/channels-views');
                        var elements = [];
                        
                        if (isStudios) elements = doc.querySelectorAll('.itm-crd-spn, .itm-crd'); 
                        else {
                            // Той самий "запасний план", який працював ідеально
                            var listContainer = doc.querySelector('#list_videos_videos_list');
                            if (listContainer) elements = listContainer.querySelectorAll('.item');
                            else {
                                var allItems = doc.querySelectorAll('.item');
                                for(var k=0; k<allItems.length; k++) {
                                    if(!allItems[k].closest('.sxn-top') && !allItems[k].classList.contains('itm-crd') && !allItems[k].classList.contains('itm-crd-spn')) {
                                        elements.push(allItems[k]);
                                    }
                                }
                            }
                        }
                        
                        for (var c = 0; c < elements.length; c++) {
                            var elC = elements[c], linkC = elC.querySelector(isStudios ? 'a.len_pucl' : 'a'), titleC = elC.querySelector(isStudios ? '.itm-opt' : '.itm-tit'); 
                            var imgC = elC.querySelector('img.lzy') || elC.querySelector('img'), timeC = elC.querySelector(isStudios ? '.itm-opt li' : '.itm-dur');
                            
                            if (linkC) {
                                var nameC = isStudios ? (linkC.getAttribute('title') || (imgC ? imgC.getAttribute('alt') : '') || (linkC.textContent || '').trim()) : (titleC ? (titleC.textContent || '').trim() : (linkC.textContent || '').trim());
                                var imgFinal = imgC ? (imgC.getAttribute('data-srcset') || imgC.getAttribute('data-src') || imgC.getAttribute('src')) : '';
                                if (imgFinal && imgFinal.indexOf('//') === 0) imgFinal = 'https:' + imgFinal; else if (imgFinal && imgFinal.indexOf('/') === 0) imgFinal = this.domain + imgFinal;
                                var urlC = linkC.getAttribute('href'); if (urlC && urlC.indexOf('http') !== 0) urlC = this.domain + (urlC.startsWith('/') ? '' : '/') + urlC.replace(/^\//, '');
                                var pUrl = (!isStudios && imgC) ? (imgC.getAttribute('data-preview') || '') : ''; if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl; else if (pUrl && pUrl.indexOf('/') === 0) pUrl = this.domain + pUrl;
                                var infoText = (timeC ? (timeC.textContent || '').trim() : ''), symbol = isStudios ? '☰' : '▶';
                                if (nameC) results.push({ name: window.pluginx_formatTitle(nameC, infoText, symbol), url: urlC, picture: imgFinal, img: imgFinal, is_grid: isStudios, preview: pUrl });
                            }
                        }
                    }
                    return results;
                },
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var str = [], u = htmlText.match(/video_url:[\t ]+'([^']+)'/), a = htmlText.match(/video_alt_url:[\t ]+'([^']+)'/);
                    if (u && u[1]) str.push({ title: 'Стандарт', url: u[1], headers: { 'Referer': this.domain + '/', 'Origin': this.domain } });
                    if (a && a[1]) str.push({ title: 'Основний (HD)', url: a[1], headers: { 'Referer': this.domain + '/', 'Origin': this.domain } });
                    if (str.length > 0) startPlayback(str); else onError();
                },
                getMenu: function(doc, htmlText, element) {
                    var menu = [], mEls = doc.querySelectorAll('.grd-mdl a'); 
                    for (var m = 0; m < mEls.length; m++) menu.push({ title: (mEls[m].textContent || '').trim(), action: 'direct', url: mEls[m].getAttribute('href') });
                    
                    var sEls = doc.querySelectorAll('.vid-aut a, .itm-aut a, .grd-spn a');
                    for (var s = 0; s < sEls.length; s++) { 
                        var sT = (sEls[s].textContent || '').trim().replace(/\s+/g, ' '); 
                        if (!menu.some(function(i) { return i.title === sT; }) && sT) menu.push({ title: sT, action: 'direct', url: sEls[s].getAttribute('href') }); 
                    }
                    menu.push({ title: 'Категорії', action: 'cats_custom', sel: '.vid-cat a' });
                    menu.push({ title: 'Схожі відео', action: 'sim', url: element.url });
                    return menu;
                }
            },

            // Блок Porn36
            porn36: {
                title: 'Porn36',
                domain: 'https://www.porn36.com',
                getHomeUrl: function() { return this.domain + '/latest-updates/'; },
                getSearchUrl: function(query) { return this.domain + '/search/' + encodeURIComponent(query) + '/relevance/'; },
                getUrl: function(object, page) {
                    var url = object.url || (this.domain + '/latest-updates/'), uParts = url.split('?'), base = uParts[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/+$/, '');
                    if (!base.endsWith('/')) base += '/';
                    if (page > 1) return base + 'page/' + page + '/' + (uParts.length > 1 ? '?' + uParts[1] : '');
                    return url;
                },
                getFilters: function(doc, currentUrl) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0];
                    var isTopRated = currentUrl.indexOf('/top-rated') !== -1, isMostViewed = currentUrl.indexOf('/most-popular') !== -1, isLatest = !isTopRated && !isMostViewed && currentUrl.indexOf('/models') === -1 && currentUrl.indexOf('/sites') === -1 && currentUrl.indexOf('/search') === -1;
                    var sortListUl = doc.querySelector('#_sort_list, #list_videos_common_videos_list_sort_list, #list_content_sources_sponsors_list_sort_list, #custom_list_videos_videos_list_search_result_sort_list');
                    if (sortListUl) {
                        var sortLinks = sortListUl.querySelectorAll('a'), items = [], lvPrefix = '';
                        if (isTopRated) lvPrefix = 'Top Rated - '; else if (isMostViewed) lvPrefix = 'Most Viewed - ';
                        for (var s = 0; s < sortLinks.length; s++) {
                            var sHref = sortLinks[s].getAttribute('href');
                            if (sHref && sHref.indexOf('http') !== 0) sHref = this.domain + sHref;
                            items.push({ title: lvPrefix + (sortLinks[s].textContent || '').trim(), url: sHref });
                        }
                        if (items.length > 0) {
                            var activeTitle = 'Сортування', sortStrong = doc.querySelector('.sort strong, .filter-channels strong, .sort-open strong');
                            if (sortStrong) {
                                var rawTitle = (sortStrong.textContent || '').trim(), innerSpan = sortStrong.querySelector('span, small');
                                if (innerSpan) rawTitle = rawTitle.replace((innerSpan.textContent || '').trim(), '').trim();
                                activeTitle = lvPrefix + rawTitle;
                            }
                            if (isTopRated) { items.push({ title: 'Latest', url: this.domain + '/latest-updates/' }, { title: 'Most Viewed', url: this.domain + '/most-popular/all/' }); }
                            else if (isMostViewed) { items.push({ title: 'Latest', url: this.domain + '/latest-updates/' }, { title: 'Top Rated', url: this.domain + '/top-rated/all/' }); }
                            return { subtitle: activeTitle, items: items };
                        }
                    } else if (isLatest) {
                        return { subtitle: 'Latest', items: [ { title: 'Top Rated', url: this.domain + '/top-rated/all/' }, { title: 'Most Viewed', url: this.domain + '/most-popular/all/' } ] };
                    }
                    return null;
                },
                getNavItems: function() {
                    return [
                        { title: '🗄️ Категорії', action: 'custom_select', fetchUrl: this.domain + '/categories/', parseSelect: function(doc) {
                            var links = doc.querySelectorAll('.list-categories__row--list a'), menu = [];
                            for(var i=0; i<links.length; i++) { var h = links[i].getAttribute('href'); if(h) menu.push({title: (links[i].textContent || '').trim(), url: h.startsWith('http') ? h : 'https://www.porn36.com' + h, is_categories: true}); }
                            return menu;
                        }},
                        { title: '🔥 Трендові запити', action: 'custom_select', fetchUrl: this.domain + '/categories/', parseSelect: function(doc) {
                            var links = doc.querySelectorAll('.tags__item'), menu = [];
                            for(var i=0; i<links.length; i++) { var h = links[i].getAttribute('href'); if(h) menu.push({title: (links[i].textContent || '').trim(), url: h.startsWith('http') ? h : 'https://www.porn36.com' + h, is_trends: true}); }
                            return menu;
                        }},
                        { title: '👸 Моделі', action: 'nav', url: this.domain + '/models/', is_models: true },
                        { title: '🎬 Студії', action: 'nav', url: this.domain + '/sites/', is_studios: true }
                    ];
                },
                parse: function(doc, currentUrl, object) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    var cleanPath = targetPath.replace(/\/+$/, ''), isModelsList = object.is_models || cleanPath === '/models', isSitesList = object.is_studios || cleanPath === '/sites', results = [];
                    if (isModelsList) {
                        var mEls = doc.querySelectorAll('.list-models .item');
                        for (var i = 0; i < mEls.length; i++) {
                            var elM = mEls[i]; if (elM.querySelector('.no-thumb')) continue;
                            var imgM = elM.querySelector('img'); if (!imgM) continue;
                            var imgSrc = imgM.getAttribute('data-original') || imgM.getAttribute('data-src') || imgM.getAttribute('src') || '';
                            if (imgSrc && imgSrc.indexOf('data:image') === 0) imgSrc = imgM.getAttribute('data-src') || imgM.getAttribute('data-original') || '';
                            if (!imgSrc) continue;
                            if (imgSrc.indexOf('//') === 0) imgSrc = 'https:' + imgSrc; else if (imgSrc.indexOf('/') === 0) imgSrc = this.domain + imgSrc;
                            var linkM = elM.tagName === 'A' ? elM : (elM.querySelector('a') || elM), rawName = imgM.getAttribute('alt') || linkM.getAttribute('title') || '';
                            if (!rawName) { var titleM = elM.querySelector('.title, .name, h5'); if (titleM) rawName = (titleM.textContent || '').trim(); else rawName = 'Model'; }
                            var countM = elM.querySelector('.videos'), count = countM ? (countM.textContent || '').trim() : '', urlM = linkM.getAttribute('href');
                            if (urlM && urlM.indexOf('http') !== 0) urlM = this.domain + urlM;
                            if (rawName) results.push({ name: window.pluginx_formatTitle(rawName, count, '☰'), url: urlM, picture: imgSrc, img: imgSrc, is_grid: true, is_models: true });
                        }
                    } else if (isSitesList) {
                        var container = doc.querySelector('#list_content_sources_sponsors_list_items');
                        if (container) {
                            var headlines = container.querySelectorAll('.headline');
                            for (var h = 0; h < headlines.length; h++) {
                                var elH = headlines[h], linkH = elH.querySelector('a.more') || elH.querySelector('a'), titleH = elH.querySelector('h1, h2, h3, h4, .title') || linkH;
                                if (linkH) {
                                    var urlH = linkH.getAttribute('href'); if (!urlH || urlH.indexOf('/sites/') === -1) continue;
                                    var rawNameH = (titleH.textContent || '').trim(), spanH = titleH.querySelector('span');
                                    if (spanH && rawNameH !== (spanH.textContent || '').trim()) rawNameH = rawNameH.replace((spanH.textContent || '').trim(), '').trim();
                                    if (!rawNameH) rawNameH = (linkH.textContent || '').trim();
                                    if (urlH.indexOf('http') !== 0) urlH = this.domain + urlH;
                                    if (rawNameH && !results.some(function(r) { return r.url === urlH; })) results.push({ name: rawNameH, url: urlH, picture: '', img: '', is_noimg: true, is_grid: true });
                                }
                            }
                        }
                    } else if (object.is_categories || object.is_trends || cleanPath === '/categories') {
                        var selC = object.is_trends ? '.tags__item' : '.list-categories__row--list a', linksC = doc.querySelectorAll(selC);
                        for (var k = 0; k < linksC.length; k++) {
                            var elLV = linksC[k], titleLV = (elLV.textContent || '').trim(), hrefLV = elLV.getAttribute('href');
                            if (hrefLV && titleLV) { var vUrlLV = hrefLV.startsWith('http') ? hrefLV : this.domain + hrefLV; results.push({ name: titleLV, url: vUrlLV, picture: '', img: '', is_grid: true }); }
                        }
                    } else {
                        var relCont = object.is_related ? doc.querySelector('.related-videos, .related_videos') : doc;
                        var elements = (relCont || doc).querySelectorAll('.list-videos .item, .item');
                        for (var v = 0; v < elements.length; v++) {
                            var elV = elements[v], linkV = elV.querySelector('a.thumb_title'); if (!linkV) continue;
                            var nameV = (linkV.textContent || '').trim(), urlV = linkV.getAttribute('href');
                            if (urlV && urlV.indexOf('http') !== 0) urlV = this.domain + urlV;
                            var imgElV = elV.querySelector('img.thumb'), imgV = '';
                            if (imgElV) { imgV = imgElV.getAttribute('data-src') || imgElV.getAttribute('src') || ''; if (imgV.indexOf('data:image') === 0) imgV = imgElV.getAttribute('data-src') || imgElV.getAttribute('data-original') || ''; }
                            if (imgV && imgV.indexOf('//') === 0) imgV = 'https:' + imgV; else if (imgV && imgV.indexOf('/') === 0) imgV = this.domain + imgV;
                            var previewEl = elV.querySelector('.img.thumb__img'), pUrl = previewEl ? previewEl.getAttribute('data-preview') : '';
                            if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl;
                            var timeEl = elV.querySelector('.duration'), timeText = timeEl ? (timeEl.textContent || '').replace(/Full Video/gi, '').trim() : '';
                            results.push({ name: window.pluginx_formatTitle(nameV, timeText, '▶'), url: urlV, picture: imgV, img: imgV, preview: pUrl });
                        }
                    }
                    return results;
                },
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var str = [], sources = doc.querySelectorAll('video source');
                    for(var i=0; i<sources.length; i++) str.push({ title: sources[i].getAttribute('label') || 'Оригінал', url: sources[i].getAttribute('src') });
                    if (str.length > 0) startPlayback(str); else onError();
                },
                getMenu: function(doc, htmlText, element) {
                    var menu = [], sources = doc.querySelectorAll('video source');
                    if (sources.length > 1) menu.push({ title: 'Відтворити в ' + (sources[1].getAttribute('label') || 'Альтернативна якість'), action: 'play_direct', url: sources[1].getAttribute('src') });
                    var lvModels = doc.querySelectorAll('.btn_model'), addedModels = [];
                    for (var m = 0; m < lvModels.length; m++) {
                        var mTitle = (lvModels[m].textContent || '').trim(), mUrl = lvModels[m].getAttribute('href');
                        if (mTitle && mUrl && addedModels.indexOf(mTitle) === -1) { menu.push({ title: mTitle, action: 'direct', url: mUrl }); addedModels.push(mTitle); }
                    }
                    menu.push({ title: 'Схожі відео', action: 'sim', url: element.url });
                    return menu;
                }
            },

            // =========================================================================
            // АДАПТЕР: PORNHUB (DEKTOP-READY VERSION + AUTO-FALLBACK)
            // =========================================================================
            pornhub: {
                title: 'Pornhub',
                domain: 'https://www.pornhub.com',
                
                getHomeUrl: function() { return this.domain + '/video'; },
                getSearchUrl: function(query) { return this.domain + '/video/search?search=' + encodeURIComponent(query); },
                
                getUrl: function(object, page) {
                    var target = object.url || (this.domain + '/video');
                    if (page > 1) {
                        var sep = target.indexOf('?') === -1 ? '?' : '&';
                        target = target + sep + 'page=' + page;
                    }
                    return target;
                },
                
                getFilters: function(doc, currentUrl) {
                    if (currentUrl.indexOf('/categories') !== -1) return null;

                    var items = [], activeTitle = '';
                    
                    var isChannelsList = (currentUrl.indexOf('/channels') !== -1 && currentUrl.indexOf('/channels/') === -1);
                    var selector = '';
                    
                    if (isChannelsList) {
                        selector = '#mainMenuChannels ul li';
                    } else if (currentUrl.indexOf('/pornstars') !== -1 || currentUrl.indexOf('/model/') !== -1) {
                        selector = 'div[data-dropdown-id="2"] ul.filterListItem li';
                    } else {
                        selector = '.subFilterList li, #subFilterListVideos li, .filterList li';
                    }
                    
                    var filterItems = doc.querySelectorAll(selector);
                    for (var i = 0; i < filterItems.length; i++) {
                        var li = filterItems[i];
                        if (li.closest && li.closest('.innerHeaderSubMenu')) continue; 

                        var a = li.querySelector('a');
                        var title = (li.textContent || '').trim();
                        var href = a ? a.getAttribute('href') : '';
                        
                        if (isChannelsList && href && href.indexOf('o=al') !== -1) {
                            continue; 
                        }

                        if (li.classList.contains('active') || li.classList.contains('selected') || li.id === 'browse') {
                            if (title) activeTitle = title;
                        } else if (a && href) {
                            if (href.indexOf('javascript') === -1 && title) {
                                if (href.indexOf('http') !== 0) href = 'https://www.pornhub.com/' + href.replace(/^\//, '');
                                items.push({ title: title, url: href });
                            }
                        }
                    }
                    
                    if (items.length === 0) return null;
                    if (!activeTitle) activeTitle = 'Сортування';
                    return { subtitle: activeTitle, items: items };
                },

                
                getNavItems: function() {
                    return [
                        { title: '🗄️ Категорії', action: 'nav', url: this.domain + '/categories', is_categories: true },
                        { title: '👸 Моделі', action: 'nav', url: this.domain + '/pornstars', is_models: true },
                        { title: '🎬 Студії', action: 'nav', url: this.domain + '/channels', is_studios: true }
                    ];
                },
                
                parse: function(doc, currentUrl, object) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    var results = [];
                    
                    if (targetPath.indexOf('/model/') !== -1 || targetPath.indexOf('/pornstar/') !== -1 || targetPath.indexOf('/channels/') !== -1) {
                        object.is_models = false;
                    }

                    // --- КАТЕГОРІЇ ---
                    if (targetPath.indexOf('/categories') !== -1 || object.is_categories) {
                        var cEls = doc.querySelectorAll('li.catPic');
                        for (var c = 0; c < cEls.length; c++) {
                            var elC = cEls[c];
                            if (elC.closest && elC.closest('.innerHeaderSubMenu')) continue;
                            
                            var linkC = elC.querySelector('a'), imgC = elC.querySelector('img');
                            if (linkC && imgC) {
                                var nameC = (imgC.getAttribute('alt') || '').replace(' Porn Category', '').trim();
                                var urlC = linkC.getAttribute('href'); 
                                if (urlC && urlC.indexOf('http') !== 0) urlC = this.domain + '/' + urlC.replace(/^\//, '');
                                var imgSrc = imgC.getAttribute('src') || ''; 
                                if (nameC) results.push({ name: nameC, url: urlC, picture: imgSrc, img: imgSrc, is_grid: true });
                            }
                        }
                    } 
                    // --- МОДЕЛІ ---
                    else if ((targetPath.indexOf('/pornstars') !== -1 || object.is_models) && targetPath.indexOf('/model/') === -1 && targetPath.indexOf('/pornstar/') === -1) {
                        var mEls = doc.querySelectorAll('li.performerCard, .performerCard');
                        for (var m = 0; m < mEls.length; m++) {
                            var elM = mEls[m];
                            if (elM.closest && (elM.closest('.innerHeaderSubMenu') || elM.closest('.top_trending_pornstar'))) continue;

                            var linkM = elM.querySelector('a'), imgM = elM.querySelector('img');
                            if (linkM && imgM) {
                                var urlM = linkM.getAttribute('href');
                                var nameEl = elM.querySelector('.performerCardName');
                                var rawName = nameEl ? (nameEl.textContent || '').trim() : imgM.getAttribute('alt');
                                var countEl = elM.querySelector('.performerCount');
                                var countText = countEl ? (countEl.textContent || '').trim() : '';

                                if (rawName && urlM) {
                                    if (urlM.indexOf('http') !== 0) urlM = this.domain + (urlM.charAt(0) === '/' ? '' : '/') + urlM;
                                    if (urlM.indexOf('/videos') === -1) urlM = urlM.replace(/\/$/, '') + '/videos';
                                    var imgSrcM = imgM.getAttribute('data-thumb_url') || imgM.getAttribute('src') || ''; 
                                    results.push({ name: window.pluginx_formatTitle(rawName, countText, '👸'), url: urlM, picture: imgSrcM, img: imgSrcM, is_grid: true, is_models: true });
                                }
                            }
                        }
                    } 
                    // --- СТУДІЇ (CHANNELS) ---
                    else if ((targetPath === '/channels' || object.is_studios) && targetPath.indexOf('/channels/') === -1) {
                        var sEls = doc.querySelectorAll('ul#allChannelsSection > li, ul.channelGridWrapper > li');
                        for (var s = 0; s < sEls.length; s++) {
                            var elS = sEls[s];
                            if (elS.closest && elS.closest('.innerHeaderSubMenu')) continue;

                            var linkS = elS.querySelector('a.usernameLink, .avatar a');
                            var imgS = elS.querySelector('.avatar img');
                            
                            if (linkS && imgS) {
                                var urlS = linkS.getAttribute('href');
                                var nameS = (imgS.getAttribute('alt') || '').trim();
                                var statsLi = elS.querySelectorAll('.descriptionContainer ul li');
                                var statsText = (statsLi.length >= 3) ? (statsLi[2].textContent || '').replace('Videos', 'V:').trim() : '';

                                if (nameS && urlS) {
                                    if (urlS.indexOf('http') !== 0) urlS = this.domain + (urlS.charAt(0) === '/' ? '' : '/') + urlS;
                                    var imgSrcS = imgS.getAttribute('src') || imgS.getAttribute('data-thumb_url') || '';
                                    results.push({ name: window.pluginx_formatTitle(nameS, statsText, '🎬'), url: urlS, picture: imgSrcS, img: imgSrcS, is_grid: true });
                                }
                            }
                        }
                    }
                    // --- ВІДЕО ---
                    else {
                        var vEls;
                        if (targetPath.indexOf('/model/') !== -1 || targetPath.indexOf('/pornstar/') !== -1 || targetPath.indexOf('/channels/') !== -1) {
                            vEls = doc.querySelectorAll('#mostRecentVideosSection li, #pornstarsVideoSection li, ul#moreData li.pcVideoListItem, ul.videoList li');
                        } else {
                            vEls = doc.querySelectorAll('div.gridWrapper li.pcVideoListItem, .videoBox');
                        }
                        
                        for (var v = 0; v < vEls.length; v++) {
                            var el = vEls[v];
                            if (el.closest && el.closest('.innerHeaderSubMenu')) continue;

                            var img = el.querySelector('img');
                            var a = el.querySelector('a.thumbnailTitle, a.js-linkVideoThumb, a.js-videoPreview, a');
                            var timeEl = el.querySelector('var.duration, .duration');
                            
                            if (img && a) {
                                var title = img.getAttribute('alt') || img.getAttribute('title') || (a.textContent || '').trim();
                                var href = a.getAttribute('href');
                                var posterUrl = img.getAttribute('src') || img.getAttribute('data-mediumthumb') || img.getAttribute('data-thumb_url');
                                var timeText = timeEl ? (timeEl.textContent || '').trim() : '';
                                
                                if (title && href && href.indexOf('viewkey=') !== -1) {
                                    if (href.indexOf('http') !== 0) href = this.domain + (href.charAt(0) === '/' ? '' : '/') + href;
                                    results.push({ name: window.pluginx_formatTitle(title, timeText, '▶'), url: href, picture: posterUrl, img: posterUrl });
                                }
                            }
                        }
                    }
                    return results;
                },

                
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var str = [];
                    var match = htmlText.match(/var\s+flashvars_\d+\s*=\s*(\{[\s\S]+?\});/);
                    if (match) {
                        try {
                            var fv = JSON.parse(match[1]);
                            if (fv.mediaDefinitions) {
                                for (var k = 0; k < fv.mediaDefinitions.length; k++) {
                                    var def = fv.mediaDefinitions[k];
                                    if (def.videoUrl && def.videoUrl !== '') {
                                        var quality = def.quality || 'Unknown';
                                        if (!isNaN(quality)) quality += 'p';
                                        var cleanUrl = def.videoUrl.replace(/\\/g, '');
                                        str.push({ 
                                            title: quality, 
                                            url: cleanUrl,
                                            headers: { 
                                                'Referer': 'https://www.pornhub.com/',
                                                'Cookie': 'hasVisited=1; accessAgeDisclaimerPH=1',
                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/147.0'
                                            }
                                        });
                                    }
                                }
                                str.sort(function(a, b) { return parseInt(b.title) - parseInt(a.title); });
                            }
                        } catch(e) {}
                    }
                    if (str.length > 0) startPlayback(str); else onError();
                },
                
                getMenu: function(doc, htmlText, element) {
                    var menu = [];
                    var actors = doc.querySelectorAll('.pornstarsWrapper a.pstar-list-btn, a.pstar-list-btn');
                    for (var i = 0; i < actors.length; i++) {
                        var name = (actors[i].textContent || '').trim();
                        var href = actors[i].getAttribute('href');
                        if (name && href) {
                            if (href.indexOf('http') !== 0) href = this.domain + (href.charAt(0) === '/' ? '' : '/') + href;
                            menu.push({ title: name, action: 'direct', url: href });
                        }
                    }
                    menu.push({ title: '🔥 Схожі відео', action: 'sim', url: element.url });
                    return menu;
                }
            },


            // =========================================================================
            // АДАПТЕР: AllPornStream
            // =========================================================================
            allpornstream: {
                title: 'AllPornStream',
                domain: 'https://allpornstream.com',
                
                getHomeUrl: function() { return this.domain + '/'; },
                getSearchUrl: function(query) { return this.domain + '/search?q=' + encodeURIComponent(query); },
                
                getUrl: function(object, page) {
                    var url = object.url || this.domain;
                    if (page > 1) {
                        var uParts = url.split('?');
                        var base = uParts[0];
                        var query = uParts.length > 1 ? '&' + uParts[1].replace(/page=\d+&?/, '') : '';
                        return base + '?page=' + page + query;
                    }
                    return url;
                },
                
                getFilters: function(doc, currentUrl) {
                    return null;
                },
                
                getNavItems: function() {
                    return [
                        { title: '🎥 Всі відео', action: 'nav', url: this.domain + '/' },
                        { title: '🎬 Blacked', action: 'nav', url: this.domain + '/search?q=Blacked' },
                        { title: '🎬 Tushy', action: 'nav', url: this.domain + '/search?q=Tushy' },
                        { title: '🎬 Brazzers', action: 'nav', url: this.domain + '/search?q=Brazzers' },
                        { title: '🎬 Vixen', action: 'nav', url: this.domain + '/search?q=Vixen' }
                    ];
                },
                
                parse: function(doc, currentUrl, object) {
                    var results = [];
                    // Шукаємо контейнери карток за їхніми унікальними атрибутами
                    var elements = doc.querySelectorAll('div[data-href*="/post/"], div[data-slug*="/post/"]');

                    for (var i = 0; i < elements.length; i++) {
                        var el = elements[i];
                        var href = el.getAttribute('data-href') || el.getAttribute('data-slug');
                        var title = el.getAttribute('data-title');
                        
                        // Якщо атрибутів раптом немає, підстрахуємось пошуком всередині
                        if (!href) {
                            var aEl = el.querySelector('a[href*="/post/"]');
                            if (aEl) href = aEl.getAttribute('href');
                        }
                        if (!title) {
                            var h2 = el.querySelector('h2');
                            if (h2) title = (h2.textContent || '').trim();
                        }
                        
                        if (!href || !title) continue;
                        
                        // Золота жила: дістаємо пряме посилання на картинку з data-images
                        var img = '';
                        var dataImages = el.getAttribute('data-images');
                        if (dataImages) {
                            try {
                                var imgs = JSON.parse(dataImages);
                                if (imgs && imgs.length > 0) img = imgs[0]; // Беремо першу найкращу
                            } catch(e) {}
                        }
                        
                        // Запасний варіант картинки через атрибут src
                        if (!img) {
                            var imgEl = el.querySelector('img');
                            if (imgEl) {
                                var rawSrc = imgEl.getAttribute('src') || '';
                                if (rawSrc.indexOf('/api/images?src=') !== -1) {
                                    try { img = decodeURIComponent(rawSrc.split('src=')[1].split('&')[0]); } catch(e) {}
                                } else {
                                    img = rawSrc;
                                }
                            }
                        }
                        
                        // Шукаємо час відео у span
                        var timeText = '';
                        var spans = el.querySelectorAll('span');
                        for (var s = 0; s < spans.length; s++) {
                            var txt = (spans[s].textContent || '').trim();
                            if (/^\d+:\d+(:\d+)?$/.test(txt)) {
                                timeText = txt;
                                break;
                            }
                        }

                        var vUrl = href.indexOf('http') === 0 ? href : this.domain + (href.indexOf('/') === 0 ? '' : '/') + href;

                        results.push({
                            name: window.pluginx_formatTitle(title, timeText, '▶'),
                            url: vUrl,
                            picture: img,
                            img: img
                            // Ми навмисно прибрали is_grid: true, щоб Лампа використала базову кіношну сітку (main-grid)
                        });
                    }
                    return results;
                },
                
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    Lampa.Noty.show('Пошук відео...');
                    onError(); // Поки стоїть заглушка, наступним кроком зробимо плеєр
                },
                
                getMenu: function(doc, htmlText, element) {
                    return [
                        { title: '🔥 Схожі відео', action: 'sim', url: element.url }
                    ];
                }
            },



            // =========================================================================
            // АДАПТЕР: PORNDISH
            // =========================================================================
            porndish: {
                title: 'Porndish',
                domain: 'https://www.porndish.com',
                getHomeUrl: function() { return this.domain; },
                getSearchUrl: function(query) { return this.domain + '/?s=' + encodeURIComponent(query); },
                getUrl: function(object, page) {
                    var url = object.url || this.domain, uParts = url.split('?'), base = uParts[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/+$/, '');
                    if (!base.endsWith('/')) base += '/';
                    if (page > 1) return base + 'page/' + page + '/' + (uParts.length > 1 ? '?' + uParts[1] : '');
                    return url;
                },
                getFilters: function(doc, currentUrl) { return null; },
                getNavItems: function() {
                    return [ { title: '🗄️ Категорії', action: 'nav', url: this.domain + '/', is_categories: true } ];
                },
                parse: function(doc, currentUrl, object) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    var results = [];
                    if (targetPath === '/categories' || object.is_categories) {
                        var linksCat = doc.querySelectorAll('.g1-nav-menu li a, .entry-category'), added = [];
                        for (var i = 0; i < linksCat.length; i++) {
                            var el = linksCat[i], title = el.getAttribute('title') || '';
                            if (!title) { var tEl = el.querySelector('.category-title'); title = tEl ? tEl.textContent : el.textContent; }
                            title = (title || '').trim();
                            var href = el.getAttribute('href');
                            if (!title || title.toLowerCase().indexOf('ai') !== -1 || title.toLowerCase().indexOf('extra') !== -1) continue;
                            if (href && title && added.indexOf(href) === -1 && href.indexOf('javascript') === -1) {
                                var vUrl = href.startsWith('http') ? href : this.domain + '/' + href.replace(/^\//, '');
                                results.push({ name: title, url: vUrl, picture: '', img: '', is_grid: true });
                                added.push(href);
                            }
                        }
                    } else {
                        var elements = doc.querySelectorAll('article.post, .g1-collection-item article, .g1-featured-item article, .g1-mosaic-item article, article.entry-tpl-tile, article.entry-tpl-grid');
                        for (var v = 0; v < elements.length; v++) {
                            var elV = elements[v], linkV = elV.querySelector('.entry-title a') || elV.querySelector('a.g1-frame'), titleV = elV.querySelector('.entry-title a'), imgV = elV.querySelector('img'), timeV = elV.querySelector('.mace-video-duration');
                            if (linkV) {
                                var urlV = linkV.getAttribute('href');
                                if (urlV && urlV.indexOf('http') !== 0) urlV = this.domain + '/' + urlV.replace(/^\//, '');
                                var nameV = titleV ? (titleV.textContent || '').trim() : (imgV ? imgV.getAttribute('alt') : (linkV.textContent || '').trim()), timeText = timeV ? (timeV.textContent || '').trim() : '';
                                if (nameV && urlV) results.push({ name: window.pluginx_formatTitle(nameV, timeText, '▶'), url: urlV, picture: '', img: '', is_noimg_main: true });
                            }
                        }
                    }
                    return results;
                },
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var streamixMatch = htmlText.match(/streamixContent.*?src=\\?["']([^"'\s>]+)\\?["']/i);
                    if (streamixMatch && streamixMatch[1]) {
                        var rawUrl = streamixMatch[1].replace(/\\/g, '');
                        var urlParts = rawUrl.match(/https?:\/\/([^\/]+)\/.*?(?:e|v|embed|d)\/([a-zA-Z0-9_-]+)/i);
                        if (urlParts && urlParts[1] && urlParts[2]) {
                            var dynamicDomain = urlParts[1];
                            var filecode = urlParts[2];
                            var vidaraHeaders = { "Referer": "https://" + dynamicDomain + "/" };
                            
                            window.pluginx_smartRequest('https://' + dynamicDomain + '/api/stream?filecode=' + filecode, function(jTxt) {
                                try {
                                    var jd = JSON.parse(jTxt);
                                    if (jd && jd.streaming_url) {
                                        // ВИПРАВЛЕННЯ ВІДТВОРЕННЯ: Системний синтаксис Lampa |Referer=
                                        var streamUrl = jd.streaming_url + '|Referer=https://' + dynamicDomain + '/';
                                        var pData = { title: element.name, url: streamUrl };
                                        
                                        // Для Porndish запускаємо напряму в обхід стандратної функції (як було раніше)
                                        Lampa.Player.play(pData);
                                        Lampa.Player.playlist([pData]);
                                    } else {
                                        Lampa.Noty.show('Помилка: Немає відео на ' + dynamicDomain);
                                        onError();
                                    }
                                } catch(e){ Lampa.Noty.show('Помилка JSON ' + dynamicDomain); onError(); }
                            }, function() { Lampa.Noty.show('Помилка мережі ' + dynamicDomain); onError(); }, vidaraHeaders);
                            
                            return;
                        }
                    }
                    Lampa.Noty.show('Не знайдено підтримуваного плеєра');
                    onError();
                },
                getMenu: function(doc, htmlText, element) {
                    return [ { title: 'Схожі відео', action: 'sim', url: element.url } ];
                }
            },


            // Блок YouPerv
            youperv: {
                title: 'YouPerv',
                domain: 'https://youperv.com',
                getHomeUrl: function() { return this.domain; },
                getSearchUrl: function(query) { 
                    if(query.length < 4) { Lampa.Noty.show('Мінімум 4 символи для YouPerv'); return null; }
                    return this.domain + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(query); 
                },
                getUrl: function(object, page) {
                    var url = object.url || this.domain, uParts = url.split('?'), base = uParts[0].replace(/\/page\/[0-9]+(\/?)$/, '').replace(/\/+$/, '');
                    if (base.indexOf('.html') === -1 && url.indexOf('do=search') === -1) {
                        return base + (page > 1 ? '/page/' + page + '/' : '/') + (uParts.length > 1 ? '?' + uParts[1] : '');
                    }
                    return url;
                },
                getFilters: function(doc, currentUrl) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0];
                    var ypActiveSort = '';
                    if (targetPath === '' || targetPath === '/') ypActiveSort = 'New';
                    else if (targetPath.indexOf('top-50-most-viewed') !== -1) ypActiveSort = 'Most Viewed 30 Days';
                    else if (targetPath.indexOf('top-porn-videos') !== -1) ypActiveSort = 'Top Rated 30 Days';
                    if (ypActiveSort !== '') {
                        var items = [];
                        if (ypActiveSort !== 'New') items.push({ title: 'New', url: this.domain + '/' });
                        if (ypActiveSort !== 'Most Viewed 30 Days') items.push({ title: 'Most Viewed 30 Days', url: this.domain + '/top-50-most-viewed-videos.html' });
                        if (ypActiveSort !== 'Top Rated 30 Days') items.push({ title: 'Top Rated 30 Days', url: this.domain + '/top-porn-videos.html' });
                        return { subtitle: ypActiveSort, items: items };
                    }
                    return null;
                },
                getNavItems: function() {
                    return [
                        { title: '🗄️ Популярні категорії', action: 'custom_select', fetchUrl: this.domain + '/', parseSelect: function(doc) {
                            var links = doc.querySelectorAll('span[class^="clouds_"] a'), menu = [], added = [];
                            for(var i=0; i<links.length; i++) {
                                var h = links[i].getAttribute('href'), t = (links[i].textContent || '').trim();
                                if(h && t && added.indexOf(t) === -1) { menu.push({title: t, url: h.startsWith('http') ? h : 'https://youperv.com' + h}); added.push(t); }
                            }
                            return menu;
                        }}
                    ];
                },
                parse: function(doc, currentUrl, object) {
                    var results = [], container = doc;
                    if (object.is_related) { var itemsBlocks = doc.querySelectorAll('.items.clearfix'); container = itemsBlocks.length > 0 ? itemsBlocks[itemsBlocks.length - 1] : doc; }
                    var elements = container.querySelectorAll('.item');
                    for (var i = 0; i < elements.length; i++) {
                        var el = elements[i];
                        if (!el.closest('.items') && !el.closest('.pages-bg')) continue;
                        var linkEl = el.querySelector('a.item-link') || el.querySelector('.item-title a'), imgEl = el.querySelector('img.xfieldimage.poster'), timeEl = el.querySelector('.item-meta.meta-time') || el.querySelector('.item-title .tim'), titleEl = el.querySelector('.item-title h2');
                        if (linkEl) {
                            var vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('http') !== 0) vUrl = this.domain + (vUrl.startsWith('/') ? '' : '/') + vUrl.replace(/^\//, '');
                            var img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '') : ''; if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = this.domain + img;
                            var name = titleEl ? (titleEl.textContent || '').trim() : (imgEl ? imgEl.getAttribute('alt') : (linkEl.textContent || '').trim());
                            name = name.replace(/\(\s*\d{2}\.\d{2}\.\d{4}\s*\)/, '').trim();
                            var time = timeEl ? (timeEl.textContent || '').trim() : '';
                            if (name && vUrl) results.push({ name: window.pluginx_formatTitle(name, time, '▶'), url: vUrl, picture: img, img: img });
                        }
                    }
                    return results;
                },
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var str = [], ypSources = doc.querySelectorAll('video source');
                    for(var y=0; y<ypSources.length; y++) { var sUrl = ypSources[y].getAttribute('src'); if (sUrl) str.push({ title: 'Оригінал', url: sUrl, headers: { 'Referer': 'https://youperv.com/', 'Origin': 'https://youperv.com' } }); }
                    if (str.length > 0) startPlayback(str); else onError();
                },
                getMenu: function(doc, htmlText, element) {
                    var menu = [], fmetaBlock = doc.querySelector('.fmeta');
                    if (fmetaBlock) {
                        var ypModels = fmetaBlock.querySelectorAll('a[href*="/xfsearch/pornstar/"]'), addedYP = [];
                        for (var ym = 0; ym < ypModels.length; ym++) {
                            var mName = (ypModels[ym].textContent || '').trim(), mHref = ypModels[ym].getAttribute('href');
                            if (mName && addedYP.indexOf(mName) === -1) { menu.push({ title: mName, action: 'direct', url: mHref }); addedYP.push(mName); }
                        }
                    }
                    menu.push({ title: 'Категорії', action: 'cats_custom', sel: '.full-tags a' });
                    menu.push({ title: 'Схожі відео', action: 'sim', url: element.url });
                    return menu;
                }
            },

            // Блок Pornmz
            pornmz: {
                title: 'Pornmz',
                domain: 'https://pornmz.net',
                getHomeUrl: function() { return this.domain; },
                getSearchUrl: function(query) { return this.domain + '/?s=' + encodeURIComponent(query); },
                getUrl: function(object, page) {
                    var url = object.url || this.domain, uParts = url.split('?'), base = uParts[0].replace(/\/page\/[0-9]+(\/?)$/, '').replace(/\/+$/, '');
                    if (base.indexOf('.html') === -1 && url.indexOf('do=search') === -1) {
                        return base + (page > 1 ? '/page/' + page + '/' : '/') + (uParts.length > 1 ? '?' + uParts[1] : '');
                    }
                    return url;
                },
                checkPagination: function(doc, page) {
                    var pagination = doc.querySelector('.pagination');
                    if (pagination) { var currentSpan = pagination.querySelector('.current'); if (!currentSpan || parseInt(currentSpan.textContent) !== page) return false; } else return false;
                    return true;
                },
                getFilters: function(doc, currentUrl) {
                    var mzFilters = doc.querySelector('.filters-list');
                    if (mzFilters) {
                        var activeTitle = 'Сортування', mzActiveA = mzFilters.querySelector('a.active');
                        if (mzActiveA) activeTitle = (mzActiveA.textContent || '').trim();
                        var items = [], mzLinks = mzFilters.querySelectorAll('a');
                        for(var z=0; z<mzLinks.length; z++) {
                            var zHref = mzLinks[z].getAttribute('href');
                            if (zHref && zHref.indexOf('javascript') === -1) {
                                if (zHref.indexOf('http') !== 0) zHref = this.domain + (zHref.startsWith('/') ? '' : '/') + zHref.replace(/^\//, '');
                                items.push({title: (mzLinks[z].textContent || '').trim(), url: zHref});
                            }
                        }
                        if (items.length > 0) return { subtitle: activeTitle, items: items };
                    }
                    return null;
                },
                getNavItems: function() {
                    return [
                        { title: '🗄️ Категорії', action: 'nav', url: this.domain + '/categories', is_categories: true },
                        { title: '👸 Моделі', action: 'nav', url: this.domain + '/actors', is_models: true }
                    ];
                },
                parse: function(doc, currentUrl, object) {
                    var targetPath = currentUrl.replace(this.domain, '').split('?')[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/[0-9]+\/$/, '').replace(/\/+$/, '');
                    var results = [];
                    if (targetPath === '/categories' || targetPath === '/actors' || object.is_categories || object.is_models) {
                        var linksCat = doc.querySelectorAll('.categories a, .category-list a, a.category'), added = [];
                        for (var i = 0; i < linksCat.length; i++) {
                            var el = linksCat[i], title = el.getAttribute('title') || '';
                            if (!title) { var tEl = el.querySelector('.category-title'); title = tEl ? tEl.textContent : el.textContent; }
                            title = (title || '').trim();
                            var href = el.getAttribute('href');
                            if (!title || title.toLowerCase().indexOf('ai') !== -1 || title.toLowerCase().indexOf('extra') !== -1) continue;
                            var imgEl = el.querySelector('img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                            if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = this.domain + img;
                            if (href && title && added.indexOf(href) === -1 && href.indexOf('javascript') === -1) {
                                var vUrl = href.startsWith('http') ? href : this.domain + (href.startsWith('/') ? '' : '/') + href;
                                results.push({ name: title, url: vUrl, picture: img, img: img, is_grid: true });
                                added.push(href);
                            }
                        }
                    } else {
                        var elements = doc.querySelectorAll('.videos-list article, article[data-video-id], article.thumb-block');
                        for (var v = 0; v < elements.length; v++) {
                            var elV = elements[v], linkV = elV.querySelector('a'), titleSpan = elV.querySelector('.title, .entry-title, .cat-title');
                            if (linkV) {
                                var urlV = linkV.getAttribute('href'); if (urlV && urlV.indexOf('http') !== 0) urlV = this.domain + (urlV.startsWith('/') ? '' : '/') + urlV.replace(/^\//, '');
                                var imgV = elV.getAttribute('data-main-thumb') || '';
                                if (!imgV) { var imgElV = elV.querySelector('img'); if(imgElV) imgV = imgElV.getAttribute('data-src') || imgElV.getAttribute('src') || ''; }
                                if (imgV && imgV.indexOf('//') === 0) imgV = 'https:' + imgV; else if (imgV && imgV.indexOf('/') === 0) imgV = this.domain + imgV;
                                var nameV = titleSpan ? (titleSpan.textContent || '').replace(/\d+[KM]*$/, '').trim() : linkV.getAttribute('title') || '';
                                if (!nameV && elV.querySelector('img')) nameV = elV.querySelector('img').getAttribute('alt') || '';
                                var timeEl = elV.querySelector('.duration, .time'), time = timeEl ? (timeEl.textContent || '').trim() : '';
                                if (nameV && urlV) results.push({ name: window.pluginx_formatTitle(nameV, time, '▶'), url: urlV, picture: imgV, img: imgV });
                            }
                        }
                    }
                    return results;
                },
                getStreams: function(htmlText, doc, element, startPlayback, onError) {
                    var metaVid = doc.querySelector('meta[itemprop="contentURL"]'), vSrc = metaVid ? metaVid.getAttribute('content') : null, str = [];
                    if (vSrc && vSrc.indexOf('.m3u8') !== -1) {
                        window.pluginx_smartRequest(vSrc, function(m3Text) {
                            var lines = m3Text.split('\n'), bestRes = -1, bestUrl = '';
                            for (var l = 0; l < lines.length; l++) {
                                if (lines[l].indexOf('#EXT-X-STREAM-INF') !== -1) {
                                    var resM = lines[l].match(/RESOLUTION=\d+x(\d+)/), resVal = resM ? parseInt(resM[1]) : 0, nextL = lines[l+1] ? lines[l+1].trim() : '';
                                    if (nextL && nextL.indexOf('#') !== 0 && resVal > bestRes) {
                                        bestRes = resVal; var sUrl = nextL;
                                        if (sUrl.indexOf('http') !== 0) {
                                            if (sUrl.indexOf('/') === 0) sUrl = vSrc.match(/^(https?:\/\/[^\/]+)/)[1] + sUrl;
                                            else sUrl = vSrc.substring(0, vSrc.lastIndexOf('/') + 1) + sUrl;
                                        }
                                        bestUrl = sUrl;
                                    }
                                }
                            }
                            if (bestUrl) str.push({title: 'HD', url: bestUrl, headers: { 'Referer': 'https://pornmz.net/', 'Origin': 'https://pornmz.net' }});
                            else str.push({title: 'HLS', url: vSrc, headers: { 'Referer': 'https://pornmz.net/', 'Origin': 'https://pornmz.net' }});
                            startPlayback(str);
                        }, function() {
                            str.push({title: 'HLS', url: vSrc, headers: { 'Referer': 'https://pornmz.net/', 'Origin': 'https://pornmz.net' }});
                            startPlayback(str);
                        });
                        return;
                    } else if (vSrc) {
                        str.push({ title: 'Оригінал', url: vSrc, headers: { 'Referer': 'https://pornmz.net/', 'Origin': 'https://pornmz.net' } });
                    }
                    if (str.length === 0) {
                        var pzSources = doc.querySelectorAll('video source');
                        for(var z=0; z<pzSources.length; z++) {
                            var zUrl = pzSources[z].getAttribute('src');
                            if (zUrl) str.push({ title: pzSources[z].getAttribute('label') || 'Оригінал', url: zUrl, headers: { 'Referer': 'https://pornmz.net/', 'Origin': 'https://pornmz.net' } });
                        }
                    }
                    if (str.length === 0 && doc.querySelector('iframe')) { Lampa.Noty.show('Знайдено сторонній плеєр (не підтримується)'); onError(); return; }
                    startPlayback(str);
                },
                getMenu: function(doc, htmlText, element) {
                    var menu = [], mzModels = doc.querySelectorAll('.tags-list a[href*="pmactor"]');
                    for (var zm = 0; zm < mzModels.length; zm++) {
                        var mdlTitle = (mzModels[zm].textContent || '').trim();
                        if (mdlTitle) menu.push({ title: mdlTitle, action: 'direct', url: mzModels[zm].getAttribute('href') });
                    }
                    menu.push({ title: 'Категорії', action: 'cats_custom', sel: '.tags-list a[href*="/c/"]' });
                    menu.push({ title: 'Схожі відео', action: 'sim', url: element.url });
                    return menu;
                }
            }

        };

        // ==========================================
        // ЯДРО ПЛАГІНА (Взаємодія з Lampa та Адаптерами)
        // ==========================================

        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object), currentSite = object.site || 'porno365';
            
            comp.create = function () {
                var _this = this; this.activity.loader(true);
                if (currentSite === 'bookmarks') {
                    var bmarks = window.Lampa.Storage.get('pluginx_bookmarks', []);
                    if (bmarks.length > 0) {
                        _this.build({ results: bmarks, collection: true, total_pages: 1, page: 1 });
                        var rendered = _this.render(); rendered.addClass('main-grid');
                        if (bmarks[0].is_noimg_main) rendered.addClass('noimg-main-grid'); else if (bmarks[0].is_noimg) rendered.addClass('noimg-grid'); else if (bmarks[0].is_models) rendered.addClass('models-grid'); else if (bmarks[0].is_grid) rendered.addClass('categories-grid');

                    } else _this.empty(); return;
                }
                
                var adapter = Adapters[currentSite];
                if (!adapter) { this.empty(); return; }
                
                var target = adapter.getUrl(object, object.page || 1);
                
                window.pluginx_smartRequest(target, function (htmlText) {
                    var doc = new DOMParser().parseFromString(htmlText, 'text/html');
                    _this._dynamicFilters = adapter.getFilters(doc, target);
                    var res = adapter.parse(doc, target, object);
                    if (res.length > 0) {
                        _this.build({ results: res, collection: true, total_pages: 1000, page: object.page || 1 });
                        var rendered = _this.render(); rendered.addClass('main-grid');
                        if (res[0].is_noimg_main) rendered.addClass('noimg-main-grid'); else if (res[0].is_noimg) rendered.addClass('noimg-grid'); else if (res[0].is_models) rendered.addClass('models-grid'); else if (res[0].is_grid) rendered.addClass('categories-grid');

                    } else _this.empty(); 
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (currentSite === 'bookmarks' || object.is_related) return reject();
                var adapter = Adapters[currentSite]; if (!adapter) return reject();
                var targetPath = (object.url || '').replace(adapter.domain, '').split('?')[0].replace(/\/+$/, '');
                if (targetPath === '/categories' || object.is_categories || object.is_trends) return reject(); 
                if (currentSite === 'youperv' && (targetPath.indexOf('.html') !== -1 || (object.url || '').indexOf('do=search') !== -1)) return reject(); 
                
                var target = adapter.getUrl(object, object.page);
                window.pluginx_smartRequest(target, function (htmlText) {
                    var doc = new DOMParser().parseFromString(htmlText, 'text/html');
                    if (adapter.checkPagination && !adapter.checkPagination(doc, object.page)) return reject();
                    var res = adapter.parse(doc, target, object);
                    if (res.length > 0) resolve({ results: res, collection: true, total_pages: 1000, page: object.page }); else reject();
                }, reject);
            };

            comp.filter = function () {
                var adapter = Adapters[currentSite];
                var items = [ { title: '🏠 Головна', action: 'home' }, { title: '🔍 Пошук', action: 'search' }, { title: '⭐ Обране', action: 'bookmarks' } ];
                
                if (currentSite !== 'bookmarks' && adapter) {
                    var navItems = adapter.getNavItems();
                    items = items.concat(navItems);
                    if (this._dynamicFilters) {
                        items.push({ title: '↕️ ' + this._dynamicFilters.subtitle, action: 'sort', sort_items: this._dynamicFilters.items });
                    }
                }
                
                Lampa.Select.show({ title: 'Навігація', items: items, onSelect: function (a) {
                    if (a.action === 'none') return;
                    if (a.action === 'home') { Lampa.Activity.push({ url: adapter.getHomeUrl(), title: 'Головна', component: 'pluginx_comp', site: currentSite, page: 1 }); }
                    else if (a.action === 'search') {
                        Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(v) {
                            if (v) {
                                var sUrl = adapter.getSearchUrl(v);
                                if (sUrl) Lampa.Activity.push({ url: sUrl, title: 'Пошук: ' + v, component: 'pluginx_comp', site: currentSite, page: 1 });
                            }
                            Lampa.Controller.toggle('content');
                        });
                    }
                    else if (a.action === 'bookmarks') Lampa.Activity.push({ title: '⭐ Обране', component: 'pluginx_comp', site: 'bookmarks', page: 1 });
                    else if (a.action === 'nav') Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: currentSite, page: 1, is_categories: a.is_categories, is_models: a.is_models, is_studios: a.is_studios });
                    else if (a.action === 'custom_select') {
                        window.pluginx_smartRequest(a.fetchUrl, function(html) {
                            var doc = new DOMParser().parseFromString(html, 'text/html');
                            var subMenu = a.parseSelect(doc);
                            if(subMenu.length) Lampa.Select.show({ title: a.title, items: subMenu, onSelect: function(it) {
                                Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1, is_categories: it.is_categories, is_trends: it.is_trends });
                            }, onBack: function() { comp.filter(); } });
                        });
                    }
                    else if (a.action === 'static_select') {
                        Lampa.Select.show({ title: a.title, items: a.items, onSelect: function(it) {
                            Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1, is_categories: it.is_categories });
                        }, onBack: function() { comp.filter(); } });
                    }
                    else if (a.action === 'sort') {
                        Lampa.Select.show({ title: 'Сортування', items: a.sort_items, onSelect: function(s) {
                            var cleanTitle = s.title.replace('Top Rated - ', '').replace('Most Viewed - ', '').replace('⇅ ', '');
                            Lampa.Activity.push({ url: s.url, title: cleanTitle, component: 'pluginx_comp', site: currentSite, page: 1, is_models: object.is_models, is_studios: object.is_studios });
                        }, onBack: function() { comp.filter(); } });
                    }
                }, onBack: function () { Lampa.Controller.toggle('content'); } });
            };

            comp.cardRender = function (card, element, events) {
                // Бронебійний варіант: отримуємо реальний HTML з об'єкта Lampa.Card
                var $card = (typeof card.render === 'function') ? card.render() : $(card);
                if ($card && typeof $card.find === 'function') {
                    var imgEl = $card.find('.card__img')[0];
                    if (imgEl && element.picture) {
                        imgEl.setAttribute('data-src-original', element.picture);
                        imgEl.onerror = function() {
                            if (typeof window.pluginx_handleImageRetry === 'function') window.pluginx_handleImageRetry(this);
                        };
                    }
                }
                
                events.onEnter = function () {
                    window.pluginx_hidePreview();
                    var targetSite = currentSite;
                    if (currentSite === 'bookmarks') {
                        for (var siteKey in Adapters) { if (element.url.indexOf(Adapters[siteKey].domain) !== -1) { targetSite = siteKey; break; } }
                        if (targetSite === 'bookmarks') targetSite = 'porno365';
                    }
                    if (element.is_grid) { Lampa.Activity.push({ url: element.url, title: element.name, component: 'pluginx_comp', site: targetSite, page: 1, is_models: false }); return; }
                    
                    window.pluginx_smartRequest(element.url, function(htmlText) {
                        var doc = new DOMParser().parseFromString(htmlText, 'text/html');
                        var startPlayback = function(videoStreams) {
                            if (videoStreams.length > 0) {
                                var playData = { title: element.name, url: videoStreams[0].url, quality: videoStreams };
                                if (videoStreams[0].headers) playData.headers = videoStreams[0].headers;
                                Lampa.Player.play(playData); Lampa.Player.playlist([playData]);
                            } else Lampa.Noty.show('Не вдалося отримати відео');
                        };
                        Adapters[targetSite].getStreams(htmlText, doc, element, startPlayback, function() { Lampa.Noty.show('Помилка відтворення'); });
                    }, function() { Lampa.Noty.show('Помилка мережі'); });
                };

                events.onMenu = function () {
                    window.pluginx_hidePreview();
                    var bmarks = window.Lampa.Storage.get('pluginx_bookmarks', []), isBookmarked = bmarks.some(function(b) { return b.url === element.url; });
                    var toggleBookmark = function() {
                        var currentBmarks = window.Lampa.Storage.get('pluginx_bookmarks', []), idx = currentBmarks.findIndex(function(b) { return b.url === element.url; });
                        if (idx !== -1) { currentBmarks.splice(idx, 1); Lampa.Noty.show('Видалено з обраного'); }
                        else { currentBmarks.unshift(element); Lampa.Noty.show('Додано до обраного'); }
                        window.Lampa.Storage.set('pluginx_bookmarks', currentBmarks);
                    };
                    
                    var targetSite = currentSite;
                    if (currentSite === 'bookmarks') {
                        for (var siteKey in Adapters) { if (element.url.indexOf(Adapters[siteKey].domain) !== -1) { targetSite = siteKey; break; } }
                        if (targetSite === 'bookmarks') targetSite = 'porno365';
                    }
                    
                    window.pluginx_smartRequest(element.url, function (htmlText) {
                        var doc = new DOMParser().parseFromString(htmlText, 'text/html'), menu = [];
                        
                        // Додаємо кнопку відтворення у вбудованому плеєрі ТІЛЬКИ для відео з Pornhub
                        if (!element.is_grid && targetSite === 'pornhub') {
                            menu.push({ title: '▶ Відтворити в плеєрі Lampa', action: 'play_lampa_internal' });
                        }
                        
                        menu.push({ title: isBookmarked ? '★ Видалити з обраного' : '☆ Додати до обраного', action: 'bookmark' });
                        if (!element.is_grid) {
                            var adapterActions = Adapters[targetSite].getMenu(doc, htmlText, element);
                            menu = menu.concat(adapterActions);
                        }
                        
                        Lampa.Select.show({ title: 'Дії', items: menu, onSelect: function (a) { 
                            if (a.action === 'bookmark') toggleBookmark(); 
                            // Обробка нашої нової кнопки
                            else if (a.action === 'play_lampa_internal') {
                                window.pluginx_smartRequest(element.url, function(hText) {
                                    var d = new DOMParser().parseFromString(hText, 'text/html');
                                    Adapters[targetSite].getStreams(hText, d, element, function(videoStreams) {
                                        if (videoStreams.length > 0) {
                                            var playData = { title: element.name, url: videoStreams[0].url, quality: videoStreams, player: 'inner' };
                                            if (videoStreams[0].headers) playData.headers = videoStreams[0].headers;
                                            Lampa.Player.play(playData); 
                                            Lampa.Player.playlist([playData]);
                                        } else Lampa.Noty.show('Не вдалося отримати відео');
                                    }, function() { Lampa.Noty.show('Помилка відтворення'); });
                                }, function() { Lampa.Noty.show('Помилка мережі'); });
                            }
                            else if (a.action === 'play_direct') { Lampa.Player.play({ title: element.name, url: a.url, headers: a.headers }); Lampa.Player.playlist([{ title: element.name, url: a.url, headers: a.headers }]); } 
                            else if (a.action === 'sim' || a.action === 'direct') { Lampa.Activity.push({ url: a.url, title: a.title || 'Схожі', component: 'pluginx_comp', site: targetSite, page: 1, is_related: (a.action === 'sim') }); }                             
                            else if (a.action === 'cats_custom') {
                                var subEls = doc.querySelectorAll(a.sel), sub = [];
                                for (var i = 0; i < subEls.length; i++) {
                                    var st = (subEls[i].textContent || '').trim();
                                    if (st) sub.push({ title: st, url: subEls[i].getAttribute('href') });
                                }
                                if (sub.length > 0) Lampa.Select.show({ title: a.title, items: sub, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: targetSite, page: 1 }); }, onBack: function () { events.onMenu(); } });
                            } 
                        }, onBack: function () { Lampa.Controller.toggle('content'); } });
                    });
                };

                var originalFocus = events.onFocus;
                events.onFocus = function (target) {
                    if (typeof originalFocus === 'function') originalFocus(target);
                    window.pluginx_hidePreview();
                    if (element.preview && !element.is_grid) previewTimeout = setTimeout(function () { window.pluginx_showPreview($(target), element.preview); }, 1000);
                };
            };
            comp.onRight = comp.filter.bind(comp); return comp;
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);
        (function() {
            var currentActivity, hideTimeout, isClicking = false, filterBtn = $('<div class="head__action head__settings selector pluginx-filter-btn"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect><rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect><circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle><circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle><circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle></svg></div>');
            filterBtn.hide().on('hover:enter click', function() {
                if (isClicking) return; isClicking = true; setTimeout(function() { isClicking = false; }, 300);
                try { if (currentActivity && currentActivity.activity) { var c = (window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) ? currentActivity.activity.component : currentActivity.activity.component(); if (c && typeof c.filter === 'function') c.filter(); } } catch (e) { }
            });
            Lampa.Listener.follow('activity', function(e) {
                if (e.type == 'start') currentActivity = e.object;
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function() { if (currentActivity && currentActivity.component !== 'pluginx_comp') filterBtn.hide(); }, 1000);
                if (e.type == 'start' && e.component == 'pluginx_comp') {
                    if ($('.head .open--search').length) $('.head .open--search').before(filterBtn); else $('.head__actions').prepend(filterBtn); filterBtn.show(); currentActivity = e.object;
                }
            });
        })();

        // ==========================================
        // ІНТЕГРАЦІЯ В МЕНЮ LAMPA
        // ==========================================

        function addMenu() {
            if (window.Lampa && window.Lampa.Storage) { var hiddenMenu = window.Lampa.Storage.get('menu_hide'); if (hiddenMenu && Array.isArray(hiddenMenu)) { var idx = hiddenMenu.indexOf('pluginx'); if (idx !== -1) { hiddenMenu.splice(idx, 1); window.Lampa.Storage.set('menu_hide', hiddenMenu); } } }
            var menuList = $('.menu .menu__list').eq(0);
            if (menuList.length && menuList.find('[data-action="pluginx"]').length === 0) {
                var item = $('<li class="menu__item selector" data-action="pluginx" id="menu_pluginx"><div class="menu__ico"><img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" /></div><div class="menu__text">CatalogX</div></li>');
                item.on('hover:enter', function () {
                    var siteOptions = [];
                    for (var key in Adapters) siteOptions.push({ title: Adapters[key].title, site: key });
                    Lampa.Select.show({ title: 'CatalogX', items: siteOptions, onSelect: function(a) { Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 }); }, onBack: function() { Lampa.Controller.toggle('menu'); } });
                });
                var settings = menuList.find('[data-action="settings"]'); if (settings.length) item.insertBefore(settings); else menuList.append(item);
            }
        }
        addMenu();
    }

    if (Lampa.Manifest && Lampa.Manifest.plugins) Lampa.Manifest.plugins = pluginManifest;
    if (window.appready) startPlugin(); else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
