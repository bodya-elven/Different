/* Created by Elven (1|1) */
(function () {
    'use strict';

    // Налаштування за замовчуванням
    var settings = {
        hide_ru: false,
        hide_asian: false,
        hide_in: false,
        hide_tr: false,
        hide_ar: false,
        hide_untranslated: false,
        hide_custom_langs: '',
        hide_rating: 'none',
        hide_history: false,
        hide_words: ''
    };

    // Отримання безпечної текстової назви
    function getSafeTitle(item) {
        if (!item) return 'Контент';
        var title = item.title || item.name || item.original_title || item.original_name || 'Контент';
        if (typeof title === 'object' && title !== null) {
            title = title.uk || title.ru || title.en || title.original || 'Контент';
        }
        return String(title);
    }

    // Перевірка на медіа-контент
    function isMediaContent(item) {
        if (!item) return false;
        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || typeLower === 'extension' || typeLower === 'theme' || typeLower === 'addon') return false;
        }
        var hasExtensionFields = (item.plugin !== undefined || item.extension !== undefined || (item.type && item.type === 'extension') || (item.type && item.type === 'plugin'));
        var hasMediaFields = item.original_language !== undefined || item.vote_average !== undefined || item.media_type !== undefined || item.first_air_date !== undefined || item.release_date !== undefined || item.original_title !== undefined || item.original_name !== undefined || (item.genre_ids && Array.isArray(item.genre_ids)) || (item.genres && Array.isArray(item.genres));
        
        if (hasExtensionFields && !hasMediaFields) return false;
        if (!hasMediaFields) return false;
        
        return true;
    }

    // Керування чорним списком + безпечна передача фокусу
    function toggleBlacklist(cardData) {
        var blacklist = Lampa.Storage.get('content_blacklist', []);
        var isBlocked = false;
        var newList = [];
        
        for (var i = 0; i < blacklist.length; i++) {
            if (blacklist[i].id === cardData.id) isBlocked = true;
            else newList.push(blacklist[i]);
        }
        
        var title = getSafeTitle(cardData);
        
        if (isBlocked) {
            Lampa.Storage.set('content_blacklist', newList);
            Lampa.Noty.show('"' + title + '" ' + Lampa.Lang.translate('blacklist_removed_suffix'));
        } else {
            newList.push({ id: cardData.id, title: title });
            Lampa.Storage.set('content_blacklist', newList);
            Lampa.Noty.show('"' + title + '" ' + Lampa.Lang.translate('blacklist_added_suffix'));
            
            // Безпечна логіка передачі естафети для пульта на Smart TV
            var active = Lampa.Activity.active();
            if (active && active.activity && active.activity.render) {
                var focusEl = active.activity.render().find('.focus');
                if (focusEl.length) {
                    var next = focusEl.nextAll('.item:visible').first();
                    if (!next.length) next = focusEl.prevAll('.item:visible').first();

                    // Візуально ховаємо і забираємо клас 'item', щоб не зламати внутрішні індекси Lampa
                    focusEl.css('display', 'none').removeClass('item');

                    Lampa.Controller.toggle('content');
                    if (next.length) {
                        next.trigger('hover:focus');
                    }
                }
            }
        }
    }

    // Оптимізований процесор приховування (усі перевірки в одному циклі)
    var hideProcessor = {
        apply: function (data) {
            var blacklist = Lampa.Storage.get('content_blacklist', []);
            var langsToHide = [];
            
            if (settings.hide_ru) langsToHide.push('ru');
            if (settings.hide_asian) langsToHide.push('ja', 'ko', 'zh', 'th', 'id');
            if (settings.hide_in) langsToHide.push('hi', 'te', 'ta', 'ml', 'kn');
            if (settings.hide_tr) langsToHide.push('tr');
            if (settings.hide_ar) langsToHide.push('ar');
            
            var customLangs = (settings.hide_custom_langs || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);
            langsToHide = langsToHide.concat(customLangs);

            var limit = settings.hide_rating === 'none' ? 0 : parseFloat(settings.hide_rating);
            var words = (settings.hide_words || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);
            
            var favorite = settings.hide_history ? Lampa.Storage.get('favorite', '{}') : null;
            var timeline = settings.hide_history ? Lampa.Storage.cache('timetable', 300, []) : null;

            return data.filter(function (item) {
                if (!isMediaContent(item)) return true;
                if (!item) return true;

                // 1. Перевірка чорного списку
                if (blacklist.length > 0) {
                    for (var i = 0; i < blacklist.length; i++) {
                        if (blacklist[i].id === item.id) return false;
                    }
                }

                // 2. Перевірка мови
                if (langsToHide.length > 0 && item.original_language) {
                    if (langsToHide.indexOf(item.original_language.toLowerCase()) !== -1) return false;
                }

                // 3. Перевірка наявності перекладу (опису)
                if (settings.hide_untranslated) {
                    if (!item.overview || item.overview.trim().length === 0) return false;
                }

                // 4. Перевірка рейтингу
                if (limit > 0) {
                    var isSpecial = item.media_type === 'video' || item.type === 'Trailer' || item.site === 'YouTube' || (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (!isSpecial) {
                        if (!item.vote_average || item.vote_average === 0 || item.vote_average < limit) return false;
                    }
                }

                // 5. Перевірка слів у назві
                if (words.length > 0) {
                    var titleLower = getSafeTitle(item).toLowerCase();
                    for (var w = 0; w < words.length; w++) {
                        if (titleLower.indexOf(words[w]) !== -1) return false;
                    }
                }

                // 6. Перевірка історії
                if (settings.hide_history && item.id) {
                    var mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    var card = Lampa.Favorite.check(item);
                    var isThrown = card && card.thrown;
                    
                    if (isThrown) return false;
                    
                    var hasHistory = card && card.history;
                    if (hasHistory && mediaType === 'movie') return false;

                    if (hasHistory || mediaType === 'tv') {
                        var watchedFromFavorite = getWatchedEpisodesFromFavorite(item.id, favorite);
                        var watchedFromTimeline = getWatchedEpisodesFromTimeline(item.id, timeline);
                        var allWatchedEpisodes = mergeWatchedEpisodes(watchedFromFavorite, watchedFromTimeline);
                        var itemTitle = item.original_title || item.original_name || item.title || item.name || '';
                        
                        if (allWatchedEpisodes.length > 0 && isSeriesFullyWatched(itemTitle, allWatchedEpisodes)) {
                            return false;
                        }
                    }
                }

                return true;
            });
        }
    };

    // Історія переглядів (допоміжні функції)
    function getWatchedEpisodesFromFavorite(id, favoriteData) {
        var card = (favoriteData.card || []).find(function (c) { return c.id === id && Array.isArray(c.seasons) && c.seasons.length > 0; });
        if (!card) return [];
        var airedSeasons = card.seasons.filter(function (s) { return s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date(); });
        var episodes = [];
        airedSeasons.forEach(function (season) {
            for (var ep = 1; ep <= season.episode_count; ep++) episodes.push({ season_number: season.season_number, episode_number: ep });
        });
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
            var hash = Lampa.Utils.hash([ ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title ].join(''));
            var view = Lampa.Timeline.view(hash);
            if (!view || view.percent < 100) return false;
        }
        return true;
    }
    // Динамічна локалізація (Англійська як резервна для всіх можливих мов)
    function t(ukText, enText) {
        var langs = ['uk', 'en', 'ru', 'be', 'kk', 'uz', 'pt', 'zh', 'es', 'fr', 'de', 'pl', 'ro', 'tr', 'it'];
        var result = {};
        var currentLang = Lampa.Storage.get('language', 'en');
        
        // Заповнюємо англійською для всіх поширених мов
        langs.forEach(function(l) { result[l] = enText; });
        // Гарантовано додаємо для поточної мови користувача (навіть якщо її немає в списку)
        result[currentLang] = currentLang === 'uk' ? ukText : enText;
        // Перезаписуємо українську
        result['uk'] = ukText;
        
        return result;
    }

    function addTranslations() {
        Lampa.Lang.add({
            content_hiding: t('Приховування контенту', 'Hide Content'),
            content_hiding_desc: t('Налаштування приховування небажаного контенту', 'Settings for hiding unwanted content'),
            hide_ru: t('Приховати російський контент', 'Hide Russian content'),
            hide_ru_desc: t('Приховує картки з мовою оригіналу: ru', 'Hides cards with original language: ru'),
            hide_asian: t('Приховати азійський контент', 'Hide Asian content'),
            hide_asian_desc: t('Приховує картки з мовами оригіналу: ja, ko, zh, th, id', 'Hides cards with original languages: ja, ko, zh, th, id'),
            hide_in: t('Приховати індійський контент', 'Hide Indian content'),
            hide_in_desc: t('Приховує картки з мовами оригіналу: hi, te, ta, ml, kn', 'Hides cards with original languages: hi, te, ta, ml, kn'),
            hide_tr: t('Приховати турецький контент', 'Hide Turkish content'),
            hide_tr_desc: t('Приховує картки з мовою оригіналу: tr', 'Hides cards with original language: tr'),
            hide_ar: t('Приховати арабський контент', 'Hide Arabic content'),
            hide_ar_desc: t('Приховує картки з мовою оригіналу: ar', 'Hides cards with original language: ar'),
            hide_untranslated: t('Приховати контент без перекладу', 'Hide untranslated content'),
            hide_untranslated_desc: t('Приховує картки, у яких відсутня локалізація під мову за замовчуванням', 'Hides cards that lack localization for the default language'),
            hide_custom_langs: t('Інші мови', 'Other languages'),
            hide_custom_langs_desc: t('Впишіть коди мов через кому', 'Enter language codes separated by commas'),
            hide_rating: t('Приховати низький рейтинг', 'Hide low rating'),
            hide_rating_desc: t('Приховує контент за рейтингом TMDb', 'Hides content based on TMDb rating'),
            hide_rating_none: t('Ні', 'No'),
            hide_history: t('Приховати переглянуте', 'Hide watched'),
            hide_history_desc: t('Приховує фільми та серіали, які є в історії перегляду', 'Hides movies and TV series that are in the viewing history'),
            hide_words: t('Приховати за словами в назві', 'Hide by words in title'),
            hide_words_desc: t('Приховує картки, у назві яких є певні слова чи фрази (через кому)', 'Hides cards containing specific words or phrases in the title (comma separated)'),
            blacklist_manage: t('Чорний список', 'Blacklist'),
            blacklist_count: t('Заблоковано карток', 'Blocked cards'),
            blacklist_empty: t('Чорний список порожній', 'Blacklist is empty'),
            blacklist_remove_action: t('Натисніть на назву нижче, щоб видалити з чорного списку', 'Click on the title below to remove from blacklist'),
            blacklist_clear_all: t('Очистити весь список', 'Clear all list'),
            blacklist_add: t('Приховати', 'Hide'),
            blacklist_added_suffix: t('додано до чорного списку', 'added to blacklist'),
            blacklist_removed_suffix: t('видалено з чорного списку', 'removed from blacklist')
        });
    }

    // Вивід тексту справа в меню
    function updateSettingsValue(el, value) {
        var valEl = el.find('.settings-param__value');
        if (!valEl.length) {
            valEl = $('<div class="settings-param__value"></div>');
            el.find('.settings-param__name').after(valEl);
        }
        valEl.text(value || '');
    }

    // Налаштування плагіна (Ізольоване меню без милиць)
    function addSettings() {
        // Додаємо кнопку лише в розділ "Інтерфейс"
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_hiding_link', type: 'static' },
            field: { name: Lampa.Lang.translate('content_hiding'), description: Lampa.Lang.translate('content_hiding_desc') },
            onRender: function (el) {
                // Надійна вставка після налаштування "Розмір інтерфейсу"
                setTimeout(function () {
                    var interfaceSizeItem = $('div[data-name="interface_size"]');
                    if (interfaceSizeItem.length) {
                        el.insertAfter(interfaceSizeItem.closest('.settings-param'));
                    }
                }, 0);
                
                el.on('hover:enter', function () {
                    Lampa.Settings.create('content_hiding'); // Генеруємо нашу сторінку налаштувань
                    Lampa.Controller.enabled().controller.back = function () { 
                        Lampa.Settings.create('interface'); // Повертаємось в Інтерфейс
                    };
                });
            }
        });

        // Наповнюємо наш кастомний компонент 'content_hiding' (Він не з'явиться в головному меню!)
        ['ru', 'asian', 'in', 'tr', 'ar', 'untranslated'].forEach(function (key) {
            Lampa.SettingsApi.addParam({
                component: 'content_hiding',
                param: { name: 'hide_' + key, type: 'trigger', default: false },
                field: { name: Lampa.Lang.translate('hide_' + key), description: Lampa.Lang.translate('hide_' + key + '_desc') },
                onChange: function (value) {
                    settings['hide_' + key] = value;
                    Lampa.Storage.set('hide_' + key, value);
                }
            });
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_custom_langs', type: 'static', default: '' },
            field: { name: Lampa.Lang.translate('hide_custom_langs'), description: Lampa.Lang.translate('hide_custom_langs_desc') },
            onRender: function (el) {
                updateSettingsValue(el, settings.hide_custom_langs);
                el.on('hover:enter', function () {
                    Lampa.Input.edit({
                        title: Lampa.Lang.translate('hide_custom_langs'),
                        value: settings.hide_custom_langs,
                        free: true,
                        nosave: false
                    }, function (new_value) {
                        settings.hide_custom_langs = new_value;
                        Lampa.Storage.set('hide_custom_langs', new_value);
                        updateSettingsValue(el, new_value);
                    });
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { 
                name: 'hide_rating', 
                type: 'select', 
                values: { 'none': Lampa.Lang.translate('hide_rating_none'), '4.0': '< 4.0', '5.0': '< 5.0', '6.0': '< 6.0', '7.0': '< 7.0' }, 
                default: 'none' 
            },
            field: { name: Lampa.Lang.translate('hide_rating'), description: Lampa.Lang.translate('hide_rating_desc') },
            onChange: function (value) {
                settings.hide_rating = value;
                Lampa.Storage.set('hide_rating', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_history', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('hide_history'), description: Lampa.Lang.translate('hide_history_desc') },
            onChange: function (value) {
                settings.hide_history = value;
                Lampa.Storage.set('hide_history', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_words', type: 'static', default: '' },
            field: { name: Lampa.Lang.translate('hide_words'), description: Lampa.Lang.translate('hide_words_desc') },
            onRender: function (el) {
                updateSettingsValue(el, settings.hide_words);
                el.on('hover:enter', function () {
                    Lampa.Input.edit({
                        title: Lampa.Lang.translate('hide_words'),
                        value: settings.hide_words,
                        free: true,
                        nosave: false
                    }, function (new_value) {
                        settings.hide_words = new_value;
                        Lampa.Storage.set('hide_words', new_value);
                        updateSettingsValue(el, new_value);
                    });
                });
            }
        });

        // Менеджер Чорного списку
        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_blacklist_manage', type: 'static' },
            field: { name: Lampa.Lang.translate('blacklist_manage'), description: '' },
            onRender: function (el) {
                var updateCount = function() {
                    var list = Lampa.Storage.get('content_blacklist', []);
                    updateSettingsValue(el, list.length.toString());
                };
                updateCount();
                
                var showManager = function() {
                    var list = Lampa.Storage.get('content_blacklist', []);
                    if (list.length === 0) {
                        Lampa.Noty.show(Lampa.Lang.translate('blacklist_empty'));
                        Lampa.Controller.toggle('settings_component');
                        return;
                    }
                    
                    var items = [];
                    items.push({
                        title: Lampa.Lang.translate('blacklist_clear_all'),
                        subtitle: Lampa.Lang.translate('blacklist_remove_action'),
                        onSelect: function() {
                            Lampa.Storage.set('content_blacklist', []);
                            updateCount();
                            Lampa.Controller.toggle('settings_component');
                        }
                    });
                    
                    list.forEach(function(item) {
                        items.push({ title: item.title, itemData: item });
                    });
                    
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('blacklist_manage'),
                        items: items,
                        onSelect: function(selected) {
                            if (selected.itemData) {
                                var newList = Lampa.Storage.get('content_blacklist', []).filter(function(i) { return i.id !== selected.itemData.id; });
                                Lampa.Storage.set('content_blacklist', newList);
                                Lampa.Noty.show('"' + selected.itemData.title + '" ' + Lampa.Lang.translate('blacklist_removed_suffix'));
                                updateCount();
                                showManager(); // Рекурсивне оновлення списку
                            }
                        },
                        onBack: function() { Lampa.Controller.toggle('settings_component'); }
                    });
                };

                el.on('hover:enter', showManager);
            }
        });
    }

    function loadSettings() {
        for (var key in settings) settings[key] = Lampa.Storage.get(key, settings[key]);
    }

    // Реєстрація пункту в контекстному меню (твоя перевірена стабільна логіка)
    function registerContextMenu() {
        if (!Lampa.Manifest) Lampa.Manifest = {};
        if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = [];

        var pluginName = Lampa.Lang.translate('blacklist_add') || 'Приховати';
        var exists = Array.isArray(Lampa.Manifest.plugins) && Lampa.Manifest.plugins.some(function(p) { return p.component === 'content_hiding_context'; });
        if (exists) return;

        var contextPlugin = {
            type: 'video',
            name: pluginName,
            component: 'content_hiding_context',
            onContextMenu: function (card) {
                if (card && card.id && isMediaContent(card)) {
                    return { name: pluginName };
                }
            },
            onContextLauch: function (card) { 
                if (card && card.id) {
                    toggleBlacklist(card);
                }
            }
        };

        if (Array.isArray(Lampa.Manifest.plugins)) {
            Lampa.Manifest.plugins.push(contextPlugin);
        } else {
            Lampa.Manifest.plugins = [contextPlugin];
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (window.content_hiding_plugin) return;
        window.content_hiding_plugin = true;

        loadSettings();
        addTranslations();
        addSettings();
        registerContextMenu(); 

        // Перехоплення даних контенту
        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            var urlStr = (e.url || (e.data && e.data.url) || '').toLowerCase();
            if (urlStr.indexOf('extension') !== -1 || urlStr.indexOf('plugin') !== -1 || urlStr.indexOf('store') !== -1) return;
            var componentStr = (e.component || (e.data && e.data.component) || '').toLowerCase();
            if (componentStr.indexOf('extension') !== -1 || componentStr.indexOf('plugin') !== -1) return;
            if (e.data.results.length === 0) return;
            
            var hasMediaContent = e.data.results.some(function(item) { return isMediaContent(item); });
            if (!hasMediaContent) return;
            
            var originalCount = e.data.results.length;
            
            // Передаємо дані у наш оновлений єдиний оптимізований фільтр
            e.data.results = hideProcessor.apply(e.data.results);
            e.data.original_length = originalCount;
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initPlugin(); });
})();
