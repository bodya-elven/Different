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
            '.pluginx-separator { font-size: 0.7em !important; opacity: 0.6; pointer-events: none; padding-top: 10px !important; text-align: center; text-transform: uppercase; letter-spacing: 1px; }' +
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
                var headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" };

                if (isAndroid) {
                    network.native(url, function (res) { onSuccess(typeof res === 'object' ? JSON.stringify(res) : res); }, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
                } else {
                    network.silent(url, onSuccess, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 });
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
                        if (videoUrl && videoUrl.indexOf('http') !== 0) videoUrl = siteBaseUrl + (videoUrl.indexOf('/') === 0 ? '' : '/') + videoUrl;
                        var previewUrl = videoPreviewEl ? videoPreviewEl.getAttribute('src') : '';
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
                var targetUrl = object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN);
                if (currentSite === 'lenkino') {
                    targetUrl = targetUrl.replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '') + '/page/' + (object.page || 1);
                }
                smartRequest(targetUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var results = (currentSite === 'lenkino') ? parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, '')) : parseCards365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''), object.is_related);
                    if (results.length > 0) {
                        _this.build({ results: results, collection: true, total_pages: 50, page: 1 });
                        _this.render().addClass('my-youtube-style');
                    } else { _this.empty(); }
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                var baseUrl = (object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN)).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                var pageUrl = (currentSite === 'lenkino') ? baseUrl + '/page/' + object.page : baseUrl + (baseUrl.indexOf('?') !== -1 ? '&' : '/') + object.page;
                smartRequest(pageUrl, function (htmlText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(htmlText, 'text/html');
                    var results = (currentSite === 'lenkino') ? parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, '')) : parseCards365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''), false);
                    if (results.length > 0) resolve({ results: results, collection: true, total_pages: 50, page: object.page });
                    else reject();
                }, reject);
            };
