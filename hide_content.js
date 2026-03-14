/* Created by Elven (1|1) */
(function () {
    'use strict';

    try {
        var settings = {
            asian_filter_enabled: false,
            language_filter_enabled: false,
            rating_filter_enabled: false,
            history_filter_enabled: false,
            ru_content_filter_enabled: false,
            country_filter_enabled: false,
            country_list: '',
            keyword_filter_enabled: false,
            keyword_list: '',
            blacklist: []
        };

        // 1. ГЛИБОКИЙ СКАНЕР: Розпаковує "матрьошку" даних Lampa
        function getMediaData(item) {
            if (!item) return null;
            
            var data = item;
            if (item.movie && item.movie.id) data = item.movie;
            else if (item.card && item.card.id) data = item.card;
            else if (item.data && item.data.id) data = item.data;

            var typeStr = (data.type || item.type || '').toString().toLowerCase();
            if (['plugin', 'extension', 'theme', 'addon', 'torrent', 'person'].indexOf(typeStr) !== -1) return null;
            
            var compStr = (data.component || item.component || '').toString().toLowerCase();
            if (['torrent', 'plugins', 'extensions'].indexOf(compStr) !== -1) return null;
            
            if (data.plugin !== undefined || item.plugin !== undefined) return null;

            var hasTitle = data.title || data.name || data.original_title || data.original_name;
            var hasId = data.id !== undefined && data.id !== null;

            if (hasTitle && hasId) return data;
            return null;
        }

        // 2. ПРОЦЕСОР ФІЛЬТРІВ
        var filterProcessor = {
            filters: [
                function (items) { // Азіатський контент
                    if (!settings.asian_filter_enabled) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data || !data.original_language) return true;
                        var lang = data.original_language.toLowerCase();
                        var asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                        return asianLangs.indexOf(lang) === -1;
                    });
                },
                function (items) { // Фільтр мови
                    if (!settings.language_filter_enabled) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data || !data.original_language) return true;
                        var defaultLang = Lampa.Storage.get('language') || 'uk';
                        var original = data.original_title || data.original_name;
                        var translated = data.title || data.name;
                        if (data.original_language === defaultLang) return true;
                        if (data.original_language !== defaultLang && translated !== original) return true;
                        return false;
                    });
                },
                function (items) { // Рейтинг
                    if (!settings.rating_filter_enabled) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data) return true;
                        var isSpecial = data.media_type === 'video' || data.type === 'Trailer' || data.site === 'YouTube' || (data.key && data.name && data.name.toLowerCase().indexOf('trailer') !== -1);
                        if (isSpecial) return true;
                        if (!data.vote_average || data.vote_average === 0) return false;
                        return data.vote_average >= 6;
                    });
                },
                function (items) { // Переглянуте
                    if (!settings.history_filter_enabled) return items;
                    var favorite = Lampa.Storage.get('favorite', '{}');
                    var timeline = Lampa.Storage.cache('timetable', 300, []);
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data) return true;
                        var mediaType = data.media_type || (data.first_air_date ? 'tv' : 'movie');
                        var card = Lampa.Favorite.check(data);
                        if (card && card.thrown) return false;
                        if (!card || !card.history) return true;
                        if (card.history && mediaType === 'movie') return false;
                        var watchedFromFavorite = getWatchedEpisodesFromFavorite(data.id, favorite);
                        var watchedFromTimeline = getWatchedEpisodesFromTimeline(data.id, timeline);
                        var allWatchedEpisodes = mergeWatchedEpisodes(watchedFromFavorite, watchedFromTimeline);
                        var title = data.original_title || data.original_name || data.title || data.name || '';
                        return !isSeriesFullyWatched(title, allWatchedEpisodes);
                    });
                },
                function (items) { // RU/SU Контент (Тепер бачить країни у фільмів!)
                    if (!settings.ru_content_filter_enabled) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data) return true;
                        var lang = (data.original_language || '').toLowerCase();
                        var countryArr = Array.isArray(data.origin_country) ? data.origin_country : (typeof data.origin_country === 'string' ? [data.origin_country] : []);
                        var countries = countryArr.join(',').toUpperCase();
                        if (lang === 'ru' || countries.indexOf('RU') !== -1 || countries.indexOf('SU') !== -1) return false;
                        return true;
                    });
                },
                function (items) { // Країни
                    if (!settings.country_filter_enabled || typeof settings.country_list !== 'string') return items;
                    var blocked = settings.country_list.split(',').map(function(c) { return c.trim().toUpperCase(); }).filter(Boolean);
                    if (blocked.length === 0) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data) return true;
                        var countryArr = Array.isArray(data.origin_country) ? data.origin_country : (typeof data.origin_country === 'string' ? [data.origin_country] : []);
                        var itemCountry = countryArr.join(',').toUpperCase();
                        if (!itemCountry) return true;
                        return !blocked.some(function(c) { return itemCountry.indexOf(c) !== -1; });
                    });
                },
                function (items) { // Ключові слова
                    if (!settings.keyword_filter_enabled || typeof settings.keyword_list !== 'string') return items;
                    var keywords = settings.keyword_list.split(',').map(function(k) { return k.trim().toLowerCase(); }).filter(Boolean);
                    if (keywords.length === 0) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data) return true;
                        var text = [data.title, data.original_title, data.name, data.original_name].filter(Boolean).join(' ').toLowerCase();
                        return !keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
                    });
                },
                function (items) { // Чорний список
                    if (!Array.isArray(settings.blacklist) || settings.blacklist.length === 0) return items;
                    return items.filter(function (item) {
                        var data = getMediaData(item);
                        if (!data) return true;
                        return !settings.blacklist.some(function(b) { return b.id === data.id; });
                    });
                }
            ],
            apply: function (data) {
                var results = Lampa.Arrays.clone(data);
                for (var i = 0; i < this.filters.length; i++) {
                    results = this.filters[i](results);
                }
                return results;
            }
        };

        function getWatchedEpisodesFromFavorite(id, favoriteData) {
            var card = (favoriteData.card || []).find(function (c) { return c.id === id && Array.isArray(c.seasons) && c.seasons.length > 0; });
            if (!card) return [];
            var airedSeasons = card.seasons.filter(function (s) { return s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date(); });
            var episodes = [];
            airedSeasons.forEach(function (season) { for (var ep = 1; ep <= season.episode_count; ep++) episodes.push({ season_number: season.season_number, episode_number: ep }); });
            return episodes;
        }

        function getWatchedEpisodesFromTimeline(id, timelineData) {
            var entry = (timelineData || []).find(function (e) { return e.id === id; }) || {};
            if (!Array.isArray(entry.episodes) || entry.episodes.length === 0) return [];
            return entry.episodes.filter(function (ep) { return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date(); });
        }

        function mergeWatchedEpisodes(arr1, arr2) {
            var merged = (arr1 || []).concat(arr2 || []);
            var unique = [];
            merged.forEach(function (ep) {
                var exists = unique.some(function (u) { return u.season_number === ep.season_number && u.episode_number === ep.episode_number; });
                if (!exists) unique.push(ep);
            });
            return unique;
        }

        function isSeriesFullyWatched(title, watchedEpisodes) {
            if (!watchedEpisodes || watchedEpisodes.length === 0) return false;
            for (var i = 0; i < watchedEpisodes.length; i++) {
                var ep = watchedEpisodes[i];
                var hash = Lampa.Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title].join(''));
                var view = Lampa.Timeline.view(hash);
                if (!view || view.percent < 100) return false;
            }
            return true;
        }

        // 3. ГЛОБАЛЬНЕ ПЕРЕХОПЛЕННЯ ВІДМАЛЬОВКИ (Вирішує проблему Пошуку та Закладок)
        function initCardInterceptor() {
            if (window.content_filter_interceptor_final) return;
            window.content_filter_interceptor_final = true;
            
            if (Lampa.Card && Lampa.Card.prototype && Lampa.Card.prototype.create) {
                var origCreate = Lampa.Card.prototype.create;
                Lampa.Card.prototype.create = function () {
                    var mediaData = getMediaData(this.data);
                    if (mediaData) {
                        var passed = filterProcessor.apply([mediaData]);
                        if (passed.length === 0) {
                            this.card = $('<div style="display:none !important;" class="hide content-filter-blocked"></div>');
                            this.render = function() { return this.card; };
                            this.destroy = function() {};
                            this.build = function() {};
                            this.visible = function() {};
                            return; 
                        }
                    }
                    origCreate.apply(this, arguments);
                };
            }
        }
        // 4. КОНТЕКСТНЕ МЕНЮ (Слухає канали 'app' та 'card')
        function handleContextMenu(e) {
            if (e.type === 'contextmenu' && e.object && e.menu && Array.isArray(e.menu)) {
                var data = getMediaData(e.object);
                if (data) {
                    var isBlacklisted = Array.isArray(settings.blacklist) && settings.blacklist.some(function(b) { return b.id === data.id; });
                    if (!isBlacklisted) {
                        e.menu.push({
                            title: Lampa.Lang.translate('content_filter_hide_item'),
                            onSelect: function () {
                                if (!Array.isArray(settings.blacklist)) settings.blacklist = [];
                                settings.blacklist.push({ id: data.id, title: data.title || data.name || 'Unknown' });
                                Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                                Lampa.Noty.show(Lampa.Lang.translate('content_filter_added_to_blacklist'));
                                
                                if (e.object.card) {
                                    e.object.card.addClass('hide').removeClass('focusable').css('display', 'none', 'important');
                                } else {
                                    $('.card[data-id="'+data.id+'"]').addClass('hide').removeClass('focusable').css('display', 'none', 'important');
                                }
                            }
                        });
                    }
                }
            }
        }

        function addContextMenu() {
            Lampa.Listener.follow('app', handleContextMenu);
            Lampa.Listener.follow('card', handleContextMenu);
        }

        // 5. ЛОКАЛІЗАЦІЯ (Тільки UK та EN, нові назви)
        function addTranslations() {
            Lampa.Lang.add({
                content_filters: { uk: 'Приховування контенту', en: 'Hide Content' },
                content_filters_desc: { uk: 'Налаштування приховування небажаного контенту', en: 'Content hiding settings' },
                asian_filter: { uk: 'Приховати азіатський контент', en: 'Hide Asian content' },
                asian_filter_desc: { uk: 'Приховує картки азіатського походження', en: 'Hides cards of Asian origin' },
                language_filter: { uk: 'Приховати без перекладу', en: 'Hide without translation' },
                language_filter_desc: { uk: 'Приховує картки без перекладу назви', en: 'Hides cards without title translation' },
                rating_filter: { uk: 'Приховати низький рейтинг', en: 'Hide low rating' },
                rating_filter_desc: { uk: 'Приховує картки з рейтингом нижче 6.0', en: 'Hides cards with rating below 6.0' },
                history_filter: { uk: 'Приховати переглянуте', en: 'Hide watched' },
                history_filter_desc: { uk: 'Приховує повністю переглянуті фільми та серіали', en: 'Hides fully watched items' },
                ru_content_filter: { uk: 'Приховати російський/радянський', en: 'Hide Russian/Soviet content' },
                ru_content_filter_desc: { uk: 'Приховує фільми та серіали РФ та СРСР', en: 'Hides movies from Russia and USSR' },
                country_filter: { uk: 'Фільтр за країнами', en: 'Country Filter' },
                country_filter_desc: { uk: 'Увімкнути фільтр', en: 'Enable filter' },
                country_list: { uk: 'Коди країн', en: 'Country codes' },
                country_list_desc: { uk: 'Коди через кому (наприклад: US, IN)', en: 'Codes separated by comma' },
                keyword_filter: { uk: 'Фільтр за словами', en: 'Keyword Filter' },
                keyword_filter_desc: { uk: 'Увімкнути фільтрацію за словами', en: 'Enable keyword filter' },
                keyword_list: { uk: 'Список слів', en: 'List of words' },
                keyword_list_desc: { uk: 'Слова через кому', en: 'Words separated by comma' },
                blacklist_manager: { uk: 'Чорний список (керування)', en: 'Blacklist (manage)' },
                blacklist_manager_desc: { uk: 'Натисніть для видалення прихованого', en: 'Click to remove hidden items' },
                content_filter_hide_item: { uk: 'Приховати цей контент', en: 'Hide this content' },
                content_filter_added_to_blacklist: { uk: 'Додано в чорний список', en: 'Added to blacklist' },
                blacklist_empty: { uk: 'Список порожній', en: 'List is empty' },
                blacklist_removed: { uk: 'Видалено: ', en: 'Removed: ' },
                more: { uk: 'ще', en: 'more' },
                title_category: { uk: 'Категорія', en: 'Category' }
            });
        }

        // 6. НАЛАШТУВАННЯ В ІНТЕРФЕЙСІ
        function addSettings() {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'main') {
                    var render = Lampa.Settings.main().render();
                    if (render.find('[data-component="content_filters"]').length === 0) {
                        Lampa.SettingsApi.addComponent({ component: 'content_filters', name: Lampa.Lang.translate('content_filters') });
                    }
                    Lampa.Settings.main().update();
                    render.find('[data-component="content_filters"]').addClass('hide');
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'content_filters', type: 'static', default: true },
                field: { name: Lampa.Lang.translate('content_filters'), description: Lampa.Lang.translate('content_filters_desc') },
                onRender: function (el) {
                    setTimeout(function () {
                        var title = Lampa.Lang.translate('content_filters');
                        $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                    }, 0);
                    el.on('hover:enter', function () {
                        Lampa.Settings.create('content_filters');
                        Lampa.Controller.enabled().controller.back = function () { Lampa.Settings.create('interface'); };
                    });
                }
            });

            var triggers = ['asian_filter_enabled', 'language_filter_enabled', 'rating_filter_enabled', 'history_filter_enabled', 'ru_content_filter_enabled', 'country_filter_enabled', 'keyword_filter_enabled'];
            triggers.forEach(function (name) {
                var shortName = name === 'ru_content_filter_enabled' ? 'ru_content_filter' : name.replace('_enabled', '');
                Lampa.SettingsApi.addParam({
                    component: 'content_filters',
                    param: { name: name, type: 'trigger', default: false },
                    field: { name: Lampa.Lang.translate(shortName), description: Lampa.Lang.translate(shortName + '_desc') },
                    onChange: function (value) { settings[name] = value; Lampa.Storage.set(name, value); }
                });
            });

            ['country_list', 'keyword_list'].forEach(function(name) {
                Lampa.SettingsApi.addParam({
                    component: 'content_filters',
                    param: { name: name, type: 'static' },
                    field: { name: Lampa.Lang.translate(name), description: Lampa.Lang.translate(name + '_desc') },
                    onRender: function (el) {
                        var val = settings[name] || '';
                        var valueDiv = $('<div class="settings-param__value"></div>').text(val);
                        el.find('.settings-param__name').after(valueDiv);

                        el.on('hover:enter', function () {
                            if (Lampa.Keypad) Lampa.Keypad.enable();
                            Lampa.Input.edit({
                                title: Lampa.Lang.translate(name),
                                value: settings[name] || '',
                                free: true,
                                nosave: false
                            }, function (newVal) {
                                settings[name] = newVal;
                                Lampa.Storage.set(name, newVal);
                                valueDiv.text(newVal);
                            });
                        });
                    }
                });
            });

            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: 'blacklist_manager', type: 'static' },
                field: { name: Lampa.Lang.translate('blacklist_manager'), description: Lampa.Lang.translate('blacklist_manager_desc') },
                onRender: function (el) {
                    el.css('cursor', 'pointer').on('hover:enter', function () {
                        var items = (settings.blacklist || []).map(function(b) { return { title: b.title, id: b.id }; });
                        if (items.length === 0) { Lampa.Noty.show(Lampa.Lang.translate('blacklist_empty')); return; }
                        Lampa.Select.show({
                            title: Lampa.Lang.translate('blacklist_manager'),
                            items: items,
                            onSelect: function (item) {
                                settings.blacklist = settings.blacklist.filter(function(b) { return b.id !== item.id; });
                                Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                                Lampa.Noty.show(Lampa.Lang.translate('blacklist_removed') + item.title);
                            }
                        });
                    });
                }
            });
        }

        // 7. ЗАВАНТАЖЕННЯ І СТАРТ
        function loadSettings() {
            var params = ['asian_filter_enabled', 'language_filter_enabled', 'rating_filter_enabled', 'history_filter_enabled', 'ru_content_filter_enabled', 'country_filter_enabled', 'keyword_filter_enabled'];
            params.forEach(function (name) { settings[name] = Lampa.Storage.get(name, false); });
            settings.country_list = Lampa.Storage.get('country_list', '');
            settings.keyword_list = Lampa.Storage.get('keyword_list', '');
            var bl = Lampa.Storage.get('content_filter_blacklist', []);
            settings.blacklist = Array.isArray(bl) ? bl : [];
        }

        function needMoreButton(data) {
            if (!data || !Array.isArray(data.results)) return false;
            var orig = data.original_length || 0;
            return orig > data.results.length && data.page === 1 && data.total_pages > 1;
        }

        function closest(el, selector) {
            if (el && el.closest) return el.closest(selector);
            while (el && el !== document) {
                if (el.matches && el.matches(selector)) return el;
                el = el.parentElement || el.parentNode;
            }
            return null;
        }

        function initPlugin() {
            if (window.content_filter_surgery_final) return;
            window.content_filter_surgery_final = true;

            loadSettings();
            addTranslations();
            addSettings();
            addContextMenu();
            initCardInterceptor(); // Активація глобального блокування карток

            Lampa.Listener.follow('line', function (e) {
                if (e.type !== 'visible' || !needMoreButton(e.data)) return;
                var head = $(closest(e.body, '.items-line')).find('.items-line__head');
                if (head.find('.items-line__more').length) return;
                var more = document.createElement('div');
                more.classList.add('items-line__more', 'selector');
                more.innerText = Lampa.Lang.translate('more');
                more.addEventListener('hover:enter', function () {
                    Lampa.Activity.push({
                        url: e.data.url,
                        title: e.data.title || Lampa.Lang.translate('title_category'),
                        component: 'category_full',
                        page: 1,
                        genres: e.params.genres,
                        filter: e.data.filter,
                        source: e.data.source || (e.params.object ? e.params.object.source : '')
                    });
                });
                head.append(more);
            });

            Lampa.Listener.follow('line', function (e) {
                if (e.type !== 'append' || !needMoreButton(e.data)) return;
                if (e.items.length === e.data.results.length && Lampa.Controller.own(e.line)) {
                    Lampa.Controller.collectionAppend(e.line.more());
                }
            });

            // Мережевий фільтр залишаємо для підвантаження наступних сторінок
            Lampa.Listener.follow('request_secuses', function (e) {
                if (!e.data || !Array.isArray(e.data.results)) return;
                var url = e.url || (e.data && e.data.url) || '';
                var urlStr = typeof url === 'string' ? url.toLowerCase() : '';
                if (urlStr.indexOf('extension') !== -1 || urlStr.indexOf('plugin') !== -1 || urlStr.indexOf('store') !== -1 || urlStr.indexOf('market') !== -1) return;
                if (e.data.results.length === 0) return;
                
                var hasMediaContent = e.data.results.some(function(item) { return getMediaData(item) !== null; });
                if (!hasMediaContent) return;
                
                e.data.original_length = e.data.results.length;
                e.data.results = filterProcessor.apply(e.data.results);
            });
        }

        if (window.appready) initPlugin();
        else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initPlugin(); });

    } catch (globalErr) {
        console.error("Content Filter Error:", globalErr);
    }
})();
