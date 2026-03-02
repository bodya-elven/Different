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
                '.my-youtube-style.is-studios .card { width: 50% !important; }' +
            '}' +
            '@media screen and (min-width: 581px) {' +
                '.my-youtube-style .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; }' +
                '.my-youtube-style.is-studios .card { width: 16.66% !important; }' +
            '}' +
            '.my-youtube-style .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; }' +
            '.my-youtube-style.is-studios .card__view { padding-bottom: 75% !important; background: #fff !important; }' +
            '.my-youtube-style .card__img { object-fit: cover !important; }' +
            '.my-youtube-style.is-studios .card__img { object-fit: contain !important; padding: 10px; }' +
            '.my-youtube-style .card__title { ' +
                'display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; ' +
                'overflow: hidden !important; white-space: normal !important; text-align: left !important; ' +
                'line-height: 1.2 !important; margin-top: 5px !important; text-overflow: ellipsis !important; ' +
            '}' +
            '.my-youtube-style .card__age, .my-youtube-style .card__textbox { display: none !important; }' +
            '.pluginx-sep { font-size: 0.75em !important; opacity: 0.5; pointer-events: none; text-align: center; padding: 12px 0 6px 0 !important; text-transform: uppercase; letter-spacing: 2px; color: #fff; border: none !important; }' +
            '.pluginx-filter-btn { order: -1 !important; margin-right: auto !important; }' +
            '.studio-count { font-size: 0.8em; color: #aaa; margin-top: 2px; display: block; }' +
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
            var pr = $('<div class="sisi-video-preview" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;overflow:hidden;z-index:2;background:#000;"><video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video></div>');
            pr.find('video')[0].src = src;
            target.find('.card__view').append(pr); activePreviewNode = pr;
            var p = pr.find('video')[0].play(); if (p !== undefined) p.catch(function(){});
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

            function parseCardsLenkino(doc, siteBaseUrl) {
                var isStudios = doc.querySelector('#list_content_sources_sponsors_list') !== null;
                var elements = isStudios ? doc.querySelectorAll('.itm-crd-spn') : doc.querySelectorAll('.item');
                var results = [];
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector('a'), titleEl = el.querySelector('.itm-tit'), imgEl = el.querySelector('img');
                    var timeEl = el.querySelector('.itm-dur') || el.querySelector('.itm-opt li');
                    if (linkEl && titleEl) {
                        var img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                        if (img && img.indexOf('//') === 0) img = 'https:' + img;
                        else if (img && img.indexOf('/') === 0) img = siteBaseUrl + img;
                        var vUrl = linkEl.getAttribute('href');
                        if (vUrl && vUrl.indexOf('http') !== 0) vUrl = siteBaseUrl + (vUrl.indexOf('/') === 0 ? '' : '/') + vUrl;
                        var countText = timeEl ? timeEl.innerText.trim().replace('видео', 'відео') : '';
                        results.push({ name: titleEl.innerText.trim(), video_count: countText, url: vUrl, picture: img, img: img, is_studio: isStudios, preview: imgEl ? (imgEl.getAttribute('data-preview') || '') : '' });
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
                    var isStudios = target.indexOf('/channels') !== -1;
                    var res = (currentSite === 'lenkino') ? parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, '')) : parseCards365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''), object.is_related);
                    if (res.length > 0) { 
                        _this.build({ results: res, collection: true, total_pages: 50, page: 1 }); 
                        var r = _this.render().addClass('my-youtube-style');
                        if (isStudios) r.addClass('is-studios');
                    } else { _this.empty(); }
                }, this.empty.bind(this));
            };
            comp.nextPageReuest = function (object, resolve, reject) {
                if (object.is_related) return reject();
                var base = (object.url || (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN)).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                var url = (currentSite === 'lenkino') ? base + '/page/' + object.page : base + (base.indexOf('?') !== -1 ? '&' : '/') + object.page;
                smartRequest(url, function (html) {
                    var parser = new DOMParser(), doc = parser.parseFromString(html, 'text/html');
                    var res = (currentSite === 'lenkino') ? parseCardsLenkino(doc, LENKINO_DOMAIN.replace(/\/+$/, '')) : parseCards365(doc, PORNO365_DOMAIN.replace(/\/+$/, ''), false);
                    if (res.length > 0) resolve({ results: res, collection: true, total_pages: 50, page: object.page }); else reject();
                }, reject);
            };

            comp.filter = function () {
                var cleanD = (currentSite === 'lenkino' ? LENKINO_DOMAIN : PORNO365_DOMAIN).replace(/\/+$/, '');
                var curUrl = (object.url || cleanD).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, '');
                var items = [{ title: 'Пошук', action: 'search' }, { title: 'Категорії', action: 'categories' }];

                if (currentSite === 'lenkino') {
                    items.push({ title: 'Студії', action: 'studios' });
                    items.push({ title: 'Сортування', is_sep: true });
                    if (curUrl.indexOf('/channels') !== -1) {
                        var bS = cleanD + '/channels';
                        items.push({ title: 'Кращі', url: bS }, { title: 'Нові', url: bS + '-new' }, { title: 'Популярні', url: bS + '-views' });
                    } else {
                        var bV = curUrl.replace(/\/top-porno$/, '').replace(/\/hot-porno$/, '').replace(/-top$/, '');
                        if (bV === cleanD) items.push({ title: 'Нові', url: cleanD }, { title: 'Кращі', url: cleanD + '/top-porno' }, { title: 'Гарячі', url: cleanD + '/hot-porno' });
                        else items.push({ title: 'Нові', url: bV }, { title: 'Кращі', url: bV + '-top' }, { title: 'Гарячі', url: bV });
                    }
                } else {
                    items.push({ title: 'Сортування', is_sep: true });
                    var b3 = curUrl.split('?')[0].replace(/\/popular\/week$/, '').replace(/\/popular\/month$/, '').replace(/\/popular\/year$/, '').replace(/\/popular$/, '').replace(/\/+$/, '');
                    var isH = (b3 === cleanD), isC = (b3.indexOf('/categories/') !== -1);
                    items.push({ title: 'Нові', url: b3 }, { title: 'Топ переглядів', url: b3 + '/popular' });
                    if (isH) items.push({ title: 'Топ переглядів (тиждень)', url: b3 + '/popular/week' });
                    if (isH || isC) items.push({ title: 'Топ переглядів (місяць)', url: b3 + '/popular/month' }, { title: 'Топ переглядів (рік)', url: b3 + '/popular/year' });
                }

                Lampa.Select.show({
                    title: 'Навігація', items: items,
                    onRender: function(el) { $(el).find('.selector').each(function(i, item_el) { if (items[i] && items[i].is_sep) $(item_el).removeClass('selector').addClass('pluginx-sep').text(items[i].title); }); },
                    onSelect: function (a) {
                        if (a.is_sep) return;
                        if (a.action === 'search') {
                            Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(v) {
                                if (v) Lampa.Activity.push({ url: cleanD + (currentSite === 'lenkino' ? '/search/' : '/search/?q=') + encodeURIComponent(v), title: 'Пошук: ' + v, component: 'pluginx_comp', site: currentSite, page: 1 });
                                Lampa.Controller.toggle('content');
                            });
                        } else if (a.action === 'categories' || a.action === 'studios') {
                            if (a.action === 'studios') { Lampa.Activity.push({ url: cleanD + '/channels', title: 'Студії', component: 'pluginx_comp', site: currentSite, page: 1 }); return; }
                            smartRequest(cleanD + '/categories', function(html) {
                                var parser = new DOMParser(), doc = parser.parseFromString(html, 'text/html');
                                var sel = (currentSite === 'lenkino') ? '.grd-cat a' : '.categories-list-div a';
                                var links = doc.querySelectorAll(sel), sub = [];
                                for (var i = 0; i < links.length; i++) {
                                    var href = links[i].getAttribute('href'), title = links[i].getAttribute('title') || links[i].innerText.trim();
                                    if (href) sub.push({ title: title, url: href.startsWith('http') ? href : cleanD + (href.startsWith('/') ? '' : '/') + href });
                                }
                                Lampa.Select.show({ title: a.title, items: sub, onSelect: function(s) { Lampa.Activity.push({ url: s.url, title: s.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function() { comp.filter(); } });
                            });
                        } else if (a.url) Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: currentSite, page: 1 });
                    },
                    onBack: function () { Lampa.Controller.toggle('content'); }
                });
            };
            comp.onRight = comp.filter.bind(comp);

            comp.cardRender = function (card, element, events) {
                if (element.is_studio) {
                    var info = $('<div class="studio-count">' + element.video_count + '</div>');
                    card.querySelector('.card__title').after(info[0]);
                }

                events.onEnter = function () {
                    hidePreview();
                    if (element.is_studio) { Lampa.Activity.push({ url: element.url, title: element.name, component: 'pluginx_comp', site: currentSite, page: 1 }); return; }
                    smartRequest(element.url, function(html) {
                        var u = html.match(/video_url:[\t ]+'([^']+)'/), a = html.match(/video_alt_url:[\t ]+'([^']+)'/);
                        if (currentSite === 'lenkino') {
                            var pD = { title: element.name, url: (a && a[1] ? a[1] : (u ? u[1] : '')), headers: { 'Referer': 'https://wes.lenkino.adult/', 'User-Agent': 'Mozilla/5.0' } };
                            if (pD.url) { Lampa.Player.play(pD); Lampa.Player.playlist([pD]); }
                        } else {
                            var doc = new DOMParser().parseFromString(html, 'text/html'), q = doc.querySelectorAll('.quality_chooser a'), str = [];
                            for (var j = 0; j < q.length; j++) if (q[j].getAttribute('href')) str.push({ title: q[j].innerText.trim(), url: q[j].getAttribute('href') });
                            if (str.length > 0) { Lampa.Player.play({ title: element.name, url: str[str.length-1].url, quality: str }); }
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
                            var sEls = doc.querySelectorAll('.vid-aut a, .itm-aut a, .len_pucl');
                            for (var s = 0; s < sEls.length; s++) {
                                var sT = sEls[s].innerText.trim().replace(/\s+/g, ' ');
                                var p = sT.split(' '); if (p.length >= 2 && p.length % 2 === 0) { var h = p.length / 2; if (p.slice(0, h).join(' ') === p.slice(h).join(' ')) sT = p.slice(0, h).join(' '); }
                                if (!menu.some(function(i) { return i.title === sT; }) && sT) menu.push({ title: sT, action: 'direct', url: sEls[s].getAttribute('href') });
                            }
                            menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Схожі відео', action: 'sim', url: element.url });
                        } else { menu.push({ title: 'Категорії', action: 'cats' }, { title: 'Теги', action: 'tags' }, { title: 'Схожі відео', action: 'sim', url: element.url }); }
                        Lampa.Select.show({ title: 'Дії', items: menu, onSelect: function (a) {
                            if (a.action === 'sim' || a.action === 'direct') Lampa.Activity.push({ url: a.url, title: a.title, component: 'pluginx_comp', site: currentSite, page: 1 });
                            else {
                                var subEls = doc.querySelectorAll((a.action === 'cats') ? (currentSite === 'lenkino' ? '.vid-cat a' : '.video-categories:not(.video-models) a') : '.video-tags a');
                                var sub = []; for (var i = 0; i < subEls.length; i++) sub.push({ title: subEls[i].innerText.trim(), url: subEls[i].getAttribute('href') });
                                Lampa.Select.show({ title: a.title, items: sub, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function () { events.onMenu(); } });
                            }
                        }, onBack: function () { Lampa.Controller.toggle('content'); } });
                    });
                };

                events.onFocus = function (t) { hidePreview(); if (card.preview && !element.is_studio) previewTimeout = setTimeout(function () { showPreview($(t), card.preview); }, 1000); };
            };
            return comp;
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);

        (function() {
            var active_curr;
            var filter_btn = $('<div class="head__action head__settings selector pluginx-filter-btn"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect><rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect><circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle><circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle><circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle></svg></div>');
            filter_btn.hide().on('hover:enter click', function() { if (active_curr && active_curr.activity) { var c = (window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) ? active_curr.activity.component : active_curr.activity.component(); if (c && c.filter) c.filter(); } });
            Lampa.Listener.follow('activity', function(e) {
                if (e.type == 'start') active_curr = e.object;
                try { hidePreview(); } catch(h) {}
                setTimeout(function() { if (active_curr && active_curr.component !== 'pluginx_comp') filter_btn.hide(); }, 1000);
                if (e.type == 'start' && e.component == 'pluginx_comp') { $('.head__actions').prepend(filter_btn); filter_btn.show(); active_curr = e.object; }
            });
        })();
    }

    function addMenu() {
        var menu_list = $('.menu .menu__list').eq(0);
        if (menu_list.length && !menu_list.find('[data-action="pluginx"]').length) {
            var menu_item = $('<li class="menu__item selector" data-action="pluginx"><div class="menu__ico"><img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" /></div><div class="menu__text">Каталоги X</div></li>');
            menu_item.on('hover:enter', function () { Lampa.Select.show({ title: 'Оберіть сайт', items: [{ title: 'Porno365', site: 'porno365' }, { title: 'Lenkino', site: 'lenkino' }], onSelect: function(a) { Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 }); }, onBack: function() { Lampa.Controller.toggle('menu'); } }); });
            if (menu_list.find('[data-action="settings"]').length) menu_item.insertBefore(menu_list.find('[data-action="settings"]')); else menu_list.append(menu_item);
        }
    }

    if (window.Lampa) { startPlugin(); addMenu(); }
    Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') { startPlugin(); addMenu(); } });
})();
