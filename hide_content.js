/* Created by Elven (1|1) */
(function () {
    'use strict';

    // Налаштування фільтрів за замовчуванням
    var settings = {
        filter_ru: false,
        filter_asian: false,
        filter_in: false,
        filter_tr: false,
        filter_ar: false,
        filter_custom_langs: '',
        filter_rating: 'none',
        filter_history: false,
        filter_words: ''
    };

    // Функція перевірки, чи є елемент медіа-контентом (щоб не приховати плагіни)
    function isMediaContent(item) {
        if (!item) return false;
        
        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || typeLower === 'extension' || typeLower === 'theme' || typeLower === 'addon') {
                return false;
            }
        }
        
        var hasExtensionFields = (item.plugin !== undefined || item.extension !== undefined || (item.type && item.type === 'extension') || (item.type && item.type === 'plugin'));
        var hasMediaFields = item.original_language !== undefined || item.vote_average !== undefined || item.media_type !== undefined || item.first_air_date !== undefined || item.release_date !== undefined || item.original_title !== undefined || item.original_name !== undefined || (item.genre_ids && Array.isArray(item.genre_ids)) || (item.genres && Array.isArray(item.genres));
        
        if (hasExtensionFields && !hasMediaFields) return false;
        if (!hasMediaFields) return false;
        
        return true;
    }

    // Процесор фільтрів
    var filterProcessor = {
        filters: [
            // Фільтр мов (Російська, Азійська, Індійська, Турецька, Арабська + кастомні)
            function (items) {
                var langsToHide = [];
                if (settings.filter_ru) langsToHide.push('ru');
                if (settings.filter_asian) langsToHide.push('ja', 'ko', 'zh');
                if (settings.filter_in) langsToHide.push('hi');
                if (settings.filter_tr) langsToHide.push('tr');
                if (settings.filter_ar) langsToHide.push('ar');
                
                var customLangs = (settings.filter_custom_langs || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(function(s) { return s; });
                langsToHide = langsToHide.concat(customLangs);

                if (langsToHide.length === 0) return items;

                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item || !item.original_language) return true;
                    return langsToHide.indexOf(item.original_language.toLowerCase()) === -1;
                });
            },

            // Фільтр низького рейтингу
            function (items) {
                if (settings.filter_rating === 'none') return items;
                var limit = parseFloat(settings.filter_rating);
                
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;

                    var isSpecial = item.media_type === 'video' || item.type === 'Trailer' || item.site === 'YouTube' || (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecial) return true;
                    
                    if (!item.vote_average || item.vote_average === 0) return false; 
                    return item.vote_average >= limit;
                });
            },

            // Фільтр переглянутого контенту
            function (items) {
                if (!settings.filter_history) return items;

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
                    
                    return !isSeriesFullyWatched(title, allWatchedEpisodes);
                });
            },

            // Фільтр слів у назві
            function (items) {
                var words = (settings.filter_words || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(function(s) { return s; });
                if (words.length === 0) return items;

                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var title = (item.title || item.name || item.original_title || item.original_name || '').toLowerCase();
                    
                    for (var i = 0; i < words.length; i++) {
                        if (title.indexOf(words[i]) !== -1) return false;
                    }
                    return true;
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

    // Допоміжні функції для проглянутого контенту
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

    // Локалізація
    function addTranslations() {
        Lampa.Lang.add({
            content_hiding: {
                uk: 'Приховування контенту',
                en: 'Hide Content'
            },
            content_hiding_desc: {
                uk: 'Налаштування приховування небажаного контенту',
                en: 'Settings for hiding unwanted content'
            },
            filter_ru: { uk: 'Приховати російський контент', en: 'Hide Russian content' },
            filter_ru_desc: { uk: 'Приховує картки з мовою оригіналу: ru', en: 'Hides cards with original language: ru' },
            filter_asian: { uk: 'Приховати азійський контент', en: 'Hide Asian content' },
            filter_asian_desc: { uk: 'Приховує картки з мовами оригіналу: ja, ko, zh', en: 'Hides cards with original languages: ja, ko, zh' },
            filter_in: { uk: 'Приховати індійський контент', en: 'Hide Indian content' },
            filter_in_desc: { uk: 'Приховує картки з мовою оригіналу: hi', en: 'Hides cards with original language: hi' },
            filter_tr: { uk: 'Приховати турецький контент', en: 'Hide Turkish content' },
            filter_tr_desc: { uk: 'Приховує картки з мовою оригіналу: tr', en: 'Hides cards with original language: tr' },
            filter_ar: { uk: 'Приховати арабський контент', en: 'Hide Arabic content' },
            filter_ar_desc: { uk: 'Приховує картки з мовою оригіналу: ar', en: 'Hides cards with original language: ar' },
            filter_custom_langs: { uk: 'Інші мови', en: 'Other languages' },
            filter_custom_langs_desc: { uk: 'Впишіть коди мов через кому (наприклад: fr, de, it)', en: 'Enter language codes separated by commas (e.g.: fr, de, it)' },
            filter_rating: { uk: 'Приховати низький рейтинг', en: 'Hide low rating' },
            filter_rating_desc: { uk: 'Приховує контент за рейтингом TMDb', en: 'Hides content based on TMDb rating' },
            filter_rating_none: { uk: 'Ні', en: 'No' },
            filter_history: { uk: 'Приховати переглянуте', en: 'Hide watched' },
            filter_history_desc: { uk: 'Приховує фільми та серіали, які ви вже повністю подивилися', en: 'Hides movies and TV series that you have already fully watched' },
            filter_words: { uk: 'Фільтр слів у назві', en: 'Title word filter' },
            filter_words_desc: { uk: 'Приховує картки, що містять ці слова (через кому)', en: 'Hides cards containing these words (comma separated)' },
            more: { uk: 'ще', en: 'more' }
        });
    }

    // Створення інтерфейсу налаштувань
    function addSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var render = Lampa.Settings.main().render();
                if (render.find('[data-component="content_hiding"]').length === 0) {
                    Lampa.SettingsApi.addComponent({
                        component: 'content_hiding',
                        name: Lampa.Lang.translate('content_hiding')
                    });
                }
                Lampa.Settings.main().update();
                render.find('[data-component="content_hiding"]').addClass('hide');
            }
        });

        // Додаємо пункт в розділ "Інтерфейс"
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_hiding', type: 'static', default: true },
            field: {
                name: Lampa.Lang.translate('content_hiding'),
                description: Lampa.Lang.translate('content_hiding_desc')
            },
            onRender: function (el) {
                setTimeout(function () {
                    var title = Lampa.Lang.translate('content_hiding');
                    $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                el.on('hover:enter', function () {
                    Lampa.Settings.create('content_hiding');
                    Lampa.Controller.enabled().controller.back = function () {
                        Lampa.Settings.create('interface');
                    };
                });
            }
        });

        // Створюємо перемикачі для мов
        ['ru', 'asian', 'in', 'tr', 'ar'].forEach(function (langKey) {
            Lampa.SettingsApi.addParam({
                component: 'content_hiding',
                param: { name: 'filter_' + langKey, type: 'trigger', default: false },
                field: {
                    name: Lampa.Lang.translate('filter_' + langKey),
                    description: Lampa.Lang.translate('filter_' + langKey + '_desc')
                },
                onChange: function (value) {
                    settings['filter_' + langKey] = value;
                    Lampa.Storage.set('filter_' + langKey, value);
                }
            });
        });

        // Поле для вводу кастомних мов
        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'filter_custom_langs', type: 'input', default: '' },
            field: {
                name: Lampa.Lang.translate('filter_custom_langs'),
                description: Lampa.Lang.translate('filter_custom_langs_desc')
            },
            onChange: function (value) {
                settings.filter_custom_langs = value;
                Lampa.Storage.set('filter_custom_langs', value);
            }
        });

        // Випадаючий список для рейтингу
        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { 
                name: 'filter_rating', 
                type: 'select', 
                values: {
                    'none': Lampa.Lang.translate('filter_rating_none'),
                    '4.0': '< 4.0',
                    '5.0': '< 5.0',
                    '6.0': '< 6.0',
                    '7.0': '< 7.0'
                }, 
                default: 'none' 
            },
            field: {
                name: Lampa.Lang.translate('filter_rating'),
                description: Lampa.Lang.translate('filter_rating_desc')
            },
            onChange: function (value) {
                settings.filter_rating = value;
                Lampa.Storage.set('filter_rating', value);
            }
        });

        // Перемикач для переглянутого
        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'filter_history', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('filter_history'),
                description: Lampa.Lang.translate('filter_history_desc')
            },
            onChange: function (value) {
                settings.filter_history = value;
                Lampa.Storage.set('filter_history', value);
            }
        });

        // Поле для вводу слів (фільтр назви)
        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'filter_words', type: 'input', default: '' },
            field: {
                name: Lampa.Lang.translate('filter_words'),
                description: Lampa.Lang.translate('filter_words_desc')
            },
            onChange: function (value) {
                settings.filter_words = value;
                Lampa.Storage.set('filter_words', value);
            }
        });
    }

    // Завантаження налаштувань
    function loadSettings() {
        for (var key in settings) {
            settings[key] = Lampa.Storage.get(key, settings[key]);
        }
    }

    // Ініціалізація
    function initPlugin() {
        if (window.content_hiding_plugin) return;
        window.content_hiding_plugin = true;

        loadSettings();
        addTranslations();
        addSettings();

        // Застосування фільтрів
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            
            var urlStr = (e.url || (e.data && e.data.url) || '').toLowerCase();
            if (urlStr.indexOf('extension') !== -1 || urlStr.indexOf('plugin') !== -1 || urlStr.indexOf('store') !== -1) return;
            
            var componentStr = (e.component || (e.data && e.data.component) || '').toLowerCase();
            if (componentStr.indexOf('extension') !== -1 || componentStr.indexOf('plugin') !== -1) return;
            
            if (e.data.results.length === 0) return;
            
            var hasMediaContent = e.data.results.some(function(item) {
                return isMediaContent(item);
            });
            
            if (!hasMediaContent) return;
            
            e.data.original_length = e.data.results.length;
            e.data.results = filterProcessor.apply(e.data.results);
        });
    }

    // Запуск
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
