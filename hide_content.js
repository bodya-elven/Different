/* Created by Elven (1|1) */
(function () {
    'use strict';

    // Налаштування фільтрів
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

    // Функція перевірки, чи є елемент медіа-контентом
    function isMediaContent(item) {
        if (!item) return false;
        
        // Якщо це явно розширення/плагін за типом
        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || 
                typeLower === 'extension' || 
                typeLower === 'theme' ||
                typeLower === 'addon') {
                return false;
            }
        }
        
        // Якщо є явні поля розширень (і немає медіа-полів)
        var hasExtensionFields = (item.plugin !== undefined || 
                                 item.extension !== undefined ||
                                 (item.type && item.type === 'extension') ||
                                 (item.type && item.type === 'plugin'));
        
        // Перевіряємо наявність характерних медіа-полів
        var hasMediaFields = 
            item.original_language !== undefined ||
            item.vote_average !== undefined ||
            item.media_type !== undefined ||
            item.first_air_date !== undefined ||
            item.release_date !== undefined ||
            item.original_title !== undefined ||
            item.original_name !== undefined ||
            (item.genre_ids && Array.isArray(item.genre_ids)) ||
            (item.genres && Array.isArray(item.genres));

        // Якщо є поля розширень, але немає медіа-полів - це не медіа-контент
        if (hasExtensionFields && !hasMediaFields) return false;
        // Якщо немає медіа-полів взагалі, це не медіа-контент
        if (!hasMediaFields) return false;
        return true;
    }

    // Процесор фільтрів
    var filterProcessor = {
        filters: [
            // 1. Фільтр азіатського контенту
            function (items) {
                if (!settings.asian_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item || !item.original_language) return true;
                    var lang = item.original_language.toLowerCase();
                    var asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                    return asianLangs.indexOf(lang) === -1;
                });
            },

            // 2. Фільтр мови
            function (items) {
                if (!settings.language_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;
                    var defaultLang = Lampa.Storage.get('language') || 'ru';
                    var original = item.original_title || item.original_name;
                    var translated = item.title || item.name;
                    if (item.original_language === defaultLang) return true;
                    if (item.original_language !== defaultLang && translated !== original) return true;
                    return false;
                });
            },

            // 3. Фільтр низького рейтингу (< 6.0)
            function (items) {
                if (!settings.rating_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;
                    var isSpecial = 
                        item.media_type === 'video' ||
                        item.type === 'Trailer' ||
                        item.site === 'YouTube' ||
                        (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecial) return true;
                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= 6;
                });
            },

            // 4. Переглянутий контент
            function (items) {
                if (!settings.history_filter_enabled) return items;
                var favorite = Lampa.Storage.get('favorite', '{}');
                var timeline = Lampa.Storage.cache('timetable', 300, []);
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item || !item.id) return true;

                    var mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    var card = Lampa.Favorite.check(item);
                    var hasHistory = card && card.history;
                    var isThrown = card && card.thrown;

                    if (isThrown) return false;
                    if (!hasHistory) return true;
                    if (hasHistory && mediaType === 'movie') return false;

                    var watchedFromFavorite = getWatchedEpisodesFromFavorite(item.id, favorite);
                    var watchedFromTimeline = getWatchedEpisodesFromTimeline(item.id, timeline);
                    var allWatchedEpisodes = mergeWatchedEpisodes(watchedFromFavorite, watchedFromTimeline);
                    var title = item.original_title || item.original_name || item.title || item.name || '';
                    var isFullyWatched = isSeriesFullyWatched(title, allWatchedEpisodes);

                    return !isFullyWatched;
                });
            },

            // 5. RU/SU Контент
            function (items) {
                if (!settings.ru_content_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var lang = (item.original_language || '').toLowerCase();
                    var countryArr = Array.isArray(item.origin_country) ? item.origin_country : (typeof item.origin_country === 'string' ? [item.origin_country] : []);
                    var countries = countryArr.join(',').toUpperCase();
                    if (lang === 'ru' || countries.indexOf('RU') !== -1 || countries.indexOf('SU') !== -1) return false;
                    return true;
                });
            },

            // 6. Фільтр за країною
            function (items) {
                if (!settings.country_filter_enabled || typeof settings.country_list !== 'string') return items;
                var blocked = settings.country_list.split(',').map(function(c) { return c.trim().toUpperCase(); }).filter(Boolean);
                if (blocked.length === 0) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var countryArr = Array.isArray(item.origin_country) ? item.origin_country : (typeof item.origin_country === 'string' ? [item.origin_country] : []);
                    var itemCountry = countryArr.join(',').toUpperCase();
                    return !blocked.some(function(c) { return itemCountry.indexOf(c) !== -1; });
                });
            },

            // 7. Ключові слова
            function (items) {
                if (!settings.keyword_filter_enabled || typeof settings.keyword_list !== 'string') return items;
                var keywords = settings.keyword_list.split(',').map(function(k) { return k.trim().toLowerCase(); }).filter(Boolean);
                if (keywords.length === 0) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var text = [item.title, item.original_title, item.name, item.original_name].filter(Boolean).join(' ').toLowerCase();
                    return !keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
                });
            },

            // 8. Чорний список
            function (items) {
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

    // Допоміжні функції для історії
    function getWatchedEpisodesFromFavorite(id, favoriteData) {
        var card = (favoriteData.card || []).find(function (c) {
            return c.id === id && Array.isArray(c.seasons) && c.seasons.length > 0;
        });
        if (!card) return [];
        var airedSeasons = card.seasons.filter(function (s) {
            return s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date();
        });
        var episodes = [];
        airedSeasons.forEach(function (season) {
            for (var ep = 1; ep <= season.episode_count; ep++) {
                episodes.push({ season_number: season.season_number, episode_number: ep });
            }
        });
        return episodes;
    }

    function getWatchedEpisodesFromTimeline(id, timelineData) {
        var entry = (timelineData || []).find(function (e) { return e.id === id; }) || {};
        if (!Array.isArray(entry.episodes) || entry.episodes.length === 0) return [];
        return entry.episodes.filter(function (ep) {
            return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date();
        });
    }

    function mergeWatchedEpisodes(arr1, arr2) {
        var merged = (arr1 || []).concat(arr2 || []);
        var unique = [];
        merged.forEach(function (ep) {
            var exists = unique.some(function (u) {
                return u.season_number === ep.season_number && u.episode_number === ep.episode_number;
            });
            if (!exists) unique.push(ep);
        });
        return unique;
    }

    function isSeriesFullyWatched(title, watchedEpisodes) {
        if (!watchedEpisodes || watchedEpisodes.length === 0) return false;
        for (var i = 0; i < watchedEpisodes.length; i++) {
            var ep = watchedEpisodes[i];
            var hash = Lampa.Utils.hash([
                ep.season_number,
                ep.season_number > 10 ? ':' : '',
                ep.episode_number,
                title
            ].join(''));
            var view = Lampa.Timeline.view(hash);
            if (!view || view.percent < 100) return false;
        }
        return true;
    }

    function initCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(Lampa.Card.prototype, 'build', {
            get: function () { return this._build; },
            set: function (value) {
                this._build = function () {
                    value.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                }.bind(this);
            }
        });
    }

    function addContextMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'contextmenu' && e.object && isMediaContent(e.object) && e.menu && Array.isArray(e.menu)) {
                e.menu.push({
                    title: Lampa.Lang.translate('content_filter_hide_item'),
                    icon: '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/></svg>',
                    onSelect: function () {
                        if (!Array.isArray(settings.blacklist)) settings.blacklist = [];
                        if (!settings.blacklist.some(function(b) { return b.id === e.object.id; })) {
                            settings.blacklist.push({ id: e.object.id, title: e.object.title || e.object.name || 'Unknown' });
                            Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                            Lampa.Noty.show(Lampa.Lang.translate('content_filter_added_to_blacklist'));
                            if (Lampa.Activity.active() && Lampa.Activity.active().activity && Lampa.Activity.active().activity.component) {
                                Lampa.Activity.active().activity.component.render();
                            }
                        }
                    }
                });
            }
        });
    }

    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { ru: 'Фильтр контента', uk: 'Фільтр контенту', en: 'Content Filter' },
            content_filters_desc: { ru: 'Настройка отображения карточек по фильтрам', uk: 'Налаштування відображення контенту', en: 'Card display settings' },
            asian_filter: { ru: 'Убрать азиатский контент', uk: 'Приховати азіатський контент', en: 'Hide Asian content' },
            asian_filter_desc: { ru: 'Скрываем карточки азиатского происхождения', uk: 'Приховує картки азіатського походження', en: 'Hides cards of Asian origin' },
            language_filter: { ru: 'Убрать контент на другом языке', uk: 'Приховати без перекладу', en: 'Hide without translation' },
            language_filter_desc: { ru: 'Скрываем карточки, названия которых не переведены', uk: 'Приховує картки без перекладу назви', en: 'Hides cards without title translation' },
            rating_filter: { ru: 'Убрать низкорейтинговый контент', uk: 'Приховати низький рейтинг', en: 'Hide low rating' },
            rating_filter_desc: { ru: 'Скрываем карточки с рейтингом ниже 6.0', uk: 'Приховує картки з рейтингом нижче 6.0', en: 'Hides cards with rating below 6.0' },
            history_filter: { ru: 'Убрать просмотренный контент', uk: 'Приховати переглянуте', en: 'Hide watched' },
            history_filter_desc: { ru: 'Скрываем карточки фильмов и сериалов из истории', uk: 'Приховує повністю переглянуті фільми та серіали', en: 'Hides fully watched items' },
            ru_content_filter: { ru: 'Убрать русский/советский контент', uk: 'Приховати російський/радянський', en: 'Hide Russian/Soviet content' },
            ru_content_filter_desc: { ru: 'Скрываем фильмы и сериалы РФ и СССР', uk: 'Приховує фільми та серіали РФ та СРСР', en: 'Hides movies from Russia and USSR' },
            country_filter: { ru: 'Фильтр по странам', uk: 'Фільтр за країнами', en: 'Country Filter' },
            country_filter_desc: { ru: 'Включить фильтр', uk: 'Увімкнути фільтр', en: 'Enable filter' },
            country_list: { ru: 'Коды стран', uk: 'Коди країн', en: 'Country codes' },
            country_list_desc: { ru: 'Коды через запятую (например: US, IN)', uk: 'Коди через кому (наприклад: US, IN)', en: 'Codes separated by comma' },
            keyword_filter: { ru: 'Фильтр по словам', uk: 'Фільтр за словами', en: 'Keyword Filter' },
            keyword_filter_desc: { ru: 'Включить фильтр', uk: 'Увімкнути фільтрацію за словами', en: 'Enable keyword filter' },
            keyword_list: { ru: 'Список слов', uk: 'Список слів', en: 'List of words' },
            keyword_list_desc: { ru: 'Слова через запятую', uk: 'Слова через кому', en: 'Words separated by comma' },
            blacklist_manager: { ru: 'Черный список (управление)', uk: 'Чорний список (керування)', en: 'Blacklist (manage)' },
            blacklist_manager_desc: { ru: 'Нажмите для удаления скрытого', uk: 'Натисніть для видалення прихованого', en: 'Click to remove hidden items' },
            content_filter_hide_item: { ru: 'Скрыть этот контент', uk: 'Приховати цей контент', en: 'Hide this content' },
            content_filter_added_to_blacklist: { ru: 'Добавлено в черный список', uk: 'Додано в чорний список', en: 'Added to blacklist' },
            more: { ru: 'ещё', uk: 'ще', en: 'more' },
            title_category: { ru: 'Категория', uk: 'Категорія', en: 'Category' }
        });
    }

    function addSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var render = Lampa.Settings.main().render();
                if (render.find('[data-component="content_filters"]').length === 0) {
                    Lampa.SettingsApi.addComponent({
                        component: 'content_filters',
                        name: Lampa.Lang.translate('content_filters')
                    });
                }
                Lampa.Settings.main().update();
                render.find('[data-component="content_filters"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters', type: 'static', default: true },
            field: {
                name: Lampa.Lang.translate('content_filters'),
                description: Lampa.Lang.translate('content_filters_desc')
            },
            onRender: function (el) {
                setTimeout(function () {
                    var title = Lampa.Lang.translate('content_filters');
                    $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                el.on('hover:enter', function () {
                    Lampa.Settings.create('content_filters');
                    Lampa.Controller.enabled().controller.back = function () {
                        Lampa.Settings.create('interface');
                    };
                });
            }
        });

        // Додаємо тригери для всіх фільтрів
        var triggers = ['asian_filter_enabled', 'language_filter_enabled', 'rating_filter_enabled', 'history_filter_enabled', 'ru_content_filter_enabled', 'country_filter_enabled', 'keyword_filter_enabled'];
        triggers.forEach(function (name) {
            var shortName = name === 'ru_content_filter_enabled' ? 'ru_content_filter' : name.replace('_enabled', '');
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: name, type: 'trigger', default: false },
                field: {
                    name: Lampa.Lang.translate(shortName),
                    description: Lampa.Lang.translate(shortName + '_desc')
                },
                onChange: function (value) {
                    settings[name] = value;
                    Lampa.Storage.set(name, value);
                }
            });
        });

        // Додаємо поля вводу
        ['country_list', 'keyword_list'].forEach(function(name) {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: name, type: 'input', default: '' },
                field: {
                    name: Lampa.Lang.translate(name),
                    description: Lampa.Lang.translate(name + '_desc')
                },
                onChange: function (value) {
                    settings[name] = value;
                    Lampa.Storage.set(name, value);
                }
            });
        });

        // Додаємо керування чорним списком
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'blacklist_manager', type: 'static' },
            field: {
                name: Lampa.Lang.translate('blacklist_manager'),
                description: Lampa.Lang.translate('blacklist_manager_desc')
            },
            onRender: function (el) {
                el.css('cursor', 'pointer').on('hover:enter', function () {
                    var items = (settings.blacklist || []).map(function(b) { return { title: b.title, id: b.id }; });
                    if (items.length === 0) { Lampa.Noty.show('Список порожній / Список пуст'); return; }
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('blacklist_manager'),
                        items: items,
                        onSelect: function (item) {
                            settings.blacklist = settings.blacklist.filter(function(b) { return b.id !== item.id; });
                            Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                            Lampa.Noty.show('Видалено / Удалено: ' + item.title);
                        }
                    });
                });
            }
        });
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
        if (window.content_filter_plugin) return;
        window.content_filter_plugin = true;

        initCardListener();
        loadSettings();
        addTranslations();
        addSettings();
        addContextMenu();

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

        // Автозавантаження
        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'append' || !needMoreButton(e.data)) return;
            if (e.items.length === e.data.results.length && Lampa.Controller.own(e.line)) {
                Lampa.Controller.collectionAppend(e.line.more());
            }
        });

        // Застосування фільтрів
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            
            var url = e.url || (e.data && e.data.url) || '';
            var urlStr = typeof url === 'string' ? url.toLowerCase() : '';
            if (urlStr.indexOf('extension') !== -1 ||
                urlStr.indexOf('plugin') !== -1 ||
                urlStr.indexOf('store') !== -1 ||
                urlStr.indexOf('market') !== -1 ||
                urlStr.indexOf('магазин') !== -1) {
                return; 
            }
            
            var component = e.component || (e.data && e.data.component) || '';
            var componentStr = typeof component === 'string' ? component.toLowerCase() : '';
            if (componentStr.indexOf('extension') !== -1 ||
                componentStr.indexOf('plugin') !== -1 ||
                componentStr.indexOf('store') !== -1 ||
                componentStr.indexOf('market') !== -1) {
                return;
            }
            
            if (e.data.results.length === 0) return;
            
            var hasMediaContent = e.data.results.some(function(item) {
                return isMediaContent(item);
            });
            
            if (!hasMediaContent) return;
            
            e.data.original_length = e.data.results.length;
            e.data.results = filterProcessor.apply(e.data.results);
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();