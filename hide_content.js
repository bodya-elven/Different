/* Created by Elven (1|1) */
(function () {
    'use strict';

    var settings = {
        ru_content_filter_enabled: false,
        asian_filter_enabled: false,
        language_filter_enabled: false,
        rating_filter_enabled: false,
        history_filter_enabled: false,
        country_filter_enabled: false,
        country_list: '',
        keyword_filter_enabled: false,
        keyword_list: '',
        blacklist: []
    };

    // ВИДЯГНЕННЯ КРАЇНИ: Тепер працює і для фільмів (production_countries), і для серіалів (origin_country)
    function extractCountries(item) {
        var countries = [];
        if (item.origin_country) {
            if (Array.isArray(item.origin_country)) countries = countries.concat(item.origin_country);
            else if (typeof item.origin_country === 'string') countries.push(item.origin_country);
        }
        if (item.production_countries && Array.isArray(item.production_countries)) {
            item.production_countries.forEach(function(c) {
                if (c && c.iso_3166_1) countries.push(c.iso_3166_1);
                else if (typeof c === 'string') countries.push(c);
            });
        }
        return countries.join(',').toUpperCase();
    }

    // ПРОСТА ТА НАДІЙНА ПЕРЕВІРКА КОНТЕНТУ
    function isMediaContent(item) {
        if (!item) return false;
        var typeStr = (item.type || '').toString().toLowerCase();
        var compStr = (item.component || '').toString().toLowerCase();
        
        if (['plugin', 'extension', 'theme', 'addon', 'torrent', 'person'].indexOf(typeStr) !== -1) return false;
        if (['torrent', 'plugins', 'extensions'].indexOf(compStr) !== -1) return false;
        if (item.plugin !== undefined || item.extension !== undefined) return false;

        return (item.id && (item.title || item.name));
    }

    var filterProcessor = {
        filters: [
            function (items) { // 1. РОСІЙСЬКИЙ КОНТЕНТ (Перевіряє мову та всі варіанти країн)
                if (!settings.ru_content_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var lang = (item.original_language || '').toLowerCase();
                    var countries = extractCountries(item);
                    if (lang === 'ru' || countries.indexOf('RU') !== -1 || countries.indexOf('SU') !== -1) return false;
                    return true;
                });
            },
            function (items) { // 2. АЗІАТСЬКИЙ КОНТЕНТ
                if (!settings.asian_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item) || !item.original_language) return true;
                    var lang = item.original_language.toLowerCase();
                    var asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLangs.indexOf(lang) === -1;
                });
            },
            function (items) { // 3. МОВНИЙ ФІЛЬТР
                if (!settings.language_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item) || !item.original_language) return true;
                    var defaultLang = Lampa.Storage.get('language') || 'uk';
                    var original = item.original_title || item.original_name;
                    var translated = item.title || item.name;
                    if (item.original_language === defaultLang) return true;
                    if (item.original_language !== defaultLang && translated !== original) return true;
                    return false;
                });
            },
            function (items) { // 4. РЕЙТИНГ
                if (!settings.rating_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var isSpecial = item.media_type === 'video' || item.type === 'Trailer' || item.site === 'YouTube' || (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecial) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },
            function (items) { // 5. ІСТОРІЯ ПЕРЕГЛЯДІВ
                if (!settings.history_filter_enabled) return items;
                var favorite = Lampa.Storage.get('favorite', '{}');
                var timeline = Lampa.Storage.cache('timetable', 300, []);
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    var card = Lampa.Favorite.check(item);
                    if (card && card.thrown) return false;
                    if (!card || !card.history) return true;
                    if (card.history && mediaType === 'movie') return false;
                    var watchedFromFavorite = getWatchedEpisodesFromFavorite(item.id, favorite);
                    var watchedFromTimeline = getWatchedEpisodesFromTimeline(item.id, timeline);
                    var allWatchedEpisodes = mergeWatchedEpisodes(watchedFromFavorite, watchedFromTimeline);
                    var title = item.original_title || item.original_name || item.title || item.name || '';
                    return !isSeriesFullyWatched(title, allWatchedEpisodes);
                });
            },
            function (items) { // 6. ФІЛЬТР КРАЇН
                if (!settings.country_filter_enabled || !settings.country_list) return items;
                var blocked = settings.country_list.split(',').map(function(c) { return c.trim().toUpperCase(); }).filter(Boolean);
                if (blocked.length === 0) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var itemCountry = extractCountries(item);
                    if (!itemCountry) return true;
                    return !blocked.some(function(c) { return itemCountry.indexOf(c) !== -1; });
                });
            },
            function (items) { // 7. ФІЛЬТР СЛІВ
                if (!settings.keyword_filter_enabled || !settings.keyword_list) return items;
                var keywords = settings.keyword_list.split(',').map(function(k) { return k.trim().toLowerCase(); }).filter(Boolean);
                if (keywords.length === 0) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var text = [item.title, item.original_title, item.name, item.original_name].filter(Boolean).join(' ').toLowerCase();
                    return !keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
                });
            },
            function (items) { // 8. ЧОРНИЙ СПИСОК
                if (!Array.isArray(settings.blacklist) || settings.blacklist.length === 0) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    return !settings.blacklist.some(function(b) { return b.id === item.id; });
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
    // КОНТЕКСТНЕ МЕНЮ (За алгоритмом Trakt TV)
    function addContextMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'contextmenu' && e.object && e.menu && Array.isArray(e.menu)) {
                var item = e.object;
                
                // Розкриваємо можливі вкладення Lampa
                if (item.movie && item.movie.id) item = item.movie;
                else if (item.data && item.data.id) item = item.data;
                else if (item.card && item.card.id) item = item.card;

                // Перевіряємо чи є ID і Назва (головний критерій)
                if (item && item.id && (item.title || item.name)) {
                    var comp = (item.component || '').toLowerCase();
                    var type = (item.type || '').toLowerCase();
                    
                    // Відкидаємо меню для торрентів та акторів
                    if (comp === 'torrent' || type === 'torrent' || type === 'person') return;

                    var isBlacklisted = false;
                    if (Array.isArray(settings.blacklist)) {
                        isBlacklisted = settings.blacklist.some(function(b) { return b.id === item.id; });
                    }

                    if (!isBlacklisted) {
                        e.menu.push({
                            title: Lampa.Lang.translate('content_filter_hide_item'),
                            onSelect: function () {
                                if (!Array.isArray(settings.blacklist)) settings.blacklist = [];
                                settings.blacklist.push({ id: item.id, title: item.title || item.name || 'Unknown' });
                                Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                                Lampa.Noty.show(Lampa.Lang.translate('content_filter_added_to_blacklist'));
                                
                                // Приховуємо картку з екрана без перезавантаження
                                $('.card[data-id="' + item.id + '"]').addClass('hide').css('display', 'none');
                            }
                        });
                    }
                }
            }
        });
    }

    // ЛОКАЛІЗАЦІЯ (Тільки UK та EN)
    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { uk: 'Приховування контенту', en: 'Hide Content' },
            content_filters_desc: { uk: 'Налаштування приховування небажаного контенту', en: 'Content hiding settings' },
            ru_content_filter: { uk: 'Приховати російський контент', en: 'Hide Russian content' },
            ru_content_filter_desc: { uk: 'Приховує фільми та серіали РФ та СРСР', en: 'Hides movies from Russia and USSR' },
            asian_filter: { uk: 'Приховати азіатський контент', en: 'Hide Asian content' },
            asian_filter_desc: { uk: 'Приховує картки азіатського походження', en: 'Hides cards of Asian origin' },
            language_filter: { uk: 'Приховати без перекладу', en: 'Hide without translation' },
            language_filter_desc: { uk: 'Приховує картки без перекладу назви', en: 'Hides cards without title translation' },
            rating_filter: { uk: 'Приховати низький рейтинг', en: 'Hide low rating' },
            rating_filter_desc: { uk: 'Приховує картки з рейтингом нижче 6.0', en: 'Hides cards with rating below 6.0' },
            history_filter: { uk: 'Приховати переглянуте', en: 'Hide watched' },
            history_filter_desc: { uk: 'Приховує повністю переглянуті фільми та серіали', en: 'Hides fully watched items' },
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

    // НАЛАШТУВАННЯ
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

        var triggers = [
            'ru_content_filter_enabled', // Російський контент ПЕРШИЙ в списку
            'asian_filter_enabled', 
            'language_filter_enabled', 
            'rating_filter_enabled', 
            'history_filter_enabled', 
            'country_filter_enabled', 
            'keyword_filter_enabled'
        ];
        
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
                }
            });
        }
    }

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
        if (window.content_filter_stable) return;
        window.content_filter_stable = true;

        loadSettings();
        addTranslations();
        addSettings();
        addContextMenu();

        // Кнопка 'Ще'
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

        // Класичний перехоплювач даних: ніяких візуальних дірок у рядах
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            var urlStr = typeof (e.url || (e.data && e.data.url)) === 'string' ? (e.url || (e.data && e.data.url)).toLowerCase() : '';
            if (urlStr.indexOf('extension') !== -1 || urlStr.indexOf('plugin') !== -1 || urlStr.indexOf('store') !== -1 || urlStr.indexOf('market') !== -1) return;
            if (e.data.results.length === 0) return;
            
            var hasMediaContent = e.data.results.some(function(item) { return isMediaContent(item); });
            if (!hasMediaContent) return;
            
            e.data.original_length = e.data.results.length;
            e.data.results = filterProcessor.apply(e.data.results);
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initPlugin(); });
})();
