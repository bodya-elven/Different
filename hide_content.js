/* Created by Elven (1|1) */
(function () {
    'use strict';

    // 1. Налаштування плагіна
    var settings = {
        asian_filter_enabled: false, 
        language_filter_enabled: false, 
        rating_filter_enabled: false, 
        history_filter_enabled: false,
        country_filter_enabled: false,
        country_list: '',
        keyword_filter_enabled: false,
        keyword_list: '',
        ru_content_filter_enabled: false,
        blacklist: []
    };

    [cite_start]// 2. Перевірка медіа-контенту [cite: 1-10]
    function isMediaContent(item) {
        if (!item) return false;
        
        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || typeLower === 'extension' || typeLower === 'theme' || typeLower === 'addon') {
                return false;
            }
        }
        
        var hasExtensionFields = (item.plugin !== undefined || item.extension !== undefined || (item.type && item.type === 'extension') || (item.type && item.type === 'plugin'));
        var hasMediaFields = item.original_language !== undefined || item.vote_average !== undefined || item.media_type !== undefined || item.first_air_date !== undefined || item.release_date !== undefined || item.original_title !== undefined || item.original_name !== undefined;
        
        if (hasExtensionFields && !hasMediaFields) return false;
        if (!hasMediaFields) return false;
        
        return true;
    }

    // 3. Логіка фільтрів
    var filterProcessor = {
        filters: [
            [cite_start]// Азіатський контент [cite: 10-13]
            function (items) {
                if (!settings.asian_filter_enabled) return items;
                var asianLangs = ['ja', 'ko', 'zh', 'th', 'vi', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'ur', 'pa', 'gu', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'kk', 'ky', 'tg', 'tk', 'uz'];
                return items.filter(function (item) {
                    if (!isMediaContent(item) || !item.original_language) return true;
                    return asianLangs.indexOf(item.original_language.toLowerCase()) === -1;
                });
            },
            // Фільтр за країною
            function (items) {
                if (!settings.country_filter_enabled || !settings.country_list) return items;
                var countries = settings.country_list.split(',').map(function(c) { return c.trim().toUpperCase(); });
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var itemCountry = (item.origin_country || []).join(','); 
                    return !countries.some(function(c) { return itemCountry.indexOf(c) !== -1; });
                });
            },
            // Фільтр за ключовими словами
            function (items) {
                if (!settings.keyword_filter_enabled || !settings.keyword_list) return items;
                var keywords = settings.keyword_list.split(',').map(function(k) { return k.trim().toLowerCase(); }).filter(Boolean);
                if (keywords.length === 0) return items;
                
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var title = (item.title || '').toLowerCase();
                    var originalTitle = (item.original_title || '').toLowerCase();
                    var name = (item.name || '').toLowerCase();
                    var originalName = (item.original_name || '').toLowerCase();
                    
                    var hasKeyword = keywords.some(function(kw) {
                        return title.indexOf(kw) !== -1 || originalTitle.indexOf(kw) !== -1 || name.indexOf(kw) !== -1 || originalName.indexOf(kw) !== -1;
                    });
                    return !hasKeyword; 
                });
            },
            // Фільтр російського/радянського контенту
            function (items) {
                if (!settings.ru_content_filter_enabled) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var lang = (item.original_language || '').toLowerCase();
                    var countries = (item.origin_country || []).join(',').toUpperCase();
                    if (lang === 'ru' || countries.indexOf('RU') !== -1 || countries.indexOf('SU') !== -1) return false;
                    return true;
                });
            },
            // Чорний список
            function (items) {
                if (!settings.blacklist || settings.blacklist.length === 0) return items;
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

    // 4. Додавання пункту в контекстне меню (Чорний список)
    function addContextMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'contextmenu' && isMediaContent(e.object)) {
                e.menu.push({
                    title: Lampa.Lang.translate('content_filter_hide_item'),
                    icon: '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/></svg>',
                    onSelect: function () {
                        if (!settings.blacklist.some(function(b) { return b.id === e.object.id; })) {
                            settings.blacklist.push({ id: e.object.id, title: e.object.title || e.object.name });
                            Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                            Lampa.Noty.show(Lampa.Lang.translate('content_filter_added_to_blacklist'));
                            if (Lampa.Activity.active() && Lampa.Activity.active().activity) {
                                Lampa.Activity.active().activity.component.render();
                            }
                        }
                    }
                });
            }
        });
    }

    [cite_start]// 5. Локалізація [cite: 46-48]
    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { uk: 'Фільтр контенту', en: 'Content Filter' },
            content_filters_desc: { uk: 'Налаштування відображення карток', en: 'Card display settings' },
            asian_filter: { uk: 'Убрать азіатський контент', en: 'Hide Asian content' },
            asian_filter_desc: { uk: 'Скрываем карточки азіатського походження', en: 'Hide cards of Asian origin' },
            ru_filter: { uk: 'Приховати російський/радянський контент', en: 'Hide Russian/Soviet content' },
            ru_filter_desc: { uk: 'Приховує фільми та серіали РФ та СРСР', en: 'Hides movies and series from Russia and USSR' },
            country_filter: { uk: 'Фільтр за країнами', en: 'Country Filter' },
            country_filter_desc: { uk: 'Коди країн через кому (наприклад: US, IN)', en: 'Country codes separated by comma (e.g., US, IN)' },
            keyword_filter: { uk: 'Фільтр за словами', en: 'Keyword Filter' },
            keyword_filter_desc: { uk: 'Слова в назві через кому (наприклад: шоу, концерт)', en: 'Words in title separated by comma' },
            content_filter_hide_item: { uk: 'Приховати цей контент', en: 'Hide this content' },
            content_filter_added_to_blacklist: { uk: 'Додано в чорний список', en: 'Added to blacklist' },
            content_filter_blacklist_title: { uk: 'Чорний список (натисніть, щоб видалити)', en: 'Blacklist (click to remove)' }
        });
    }

    [cite_start]// 6. Інтеграція в меню налаштувань (ВИПРАВЛЕНО) [cite: 49-58]
    function addSettings() {
        [cite_start]// Створюємо категорію [cite: 49-51]
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

        [cite_start]// Додаємо кнопку переходу в інтерфейс [cite: 52-55]
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters_menu', type: 'static', default: true },
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

        // Параметри
        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'asian_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('asian_filter'), description: Lampa.Lang.translate('asian_filter_desc') },
            onChange: function (value) { settings.asian_filter_enabled = value; Lampa.Storage.set('asian_filter_enabled', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'ru_content_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('ru_filter'), description: Lampa.Lang.translate('ru_filter_desc') },
            onChange: function (value) { settings.ru_content_filter_enabled = value; Lampa.Storage.set('ru_content_filter_enabled', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'country_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('country_filter'), description: 'Увімкнути фільтрацію за кодом країни' },
            onChange: function (value) { settings.country_filter_enabled = value; Lampa.Storage.set('country_filter_enabled', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'country_list', type: 'input', default: '' },
            field: { name: 'Список країн', description: Lampa.Lang.translate('country_filter_desc') },
            onChange: function (value) { settings.country_list = value; Lampa.Storage.set('country_list', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'keyword_filter_enabled', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('keyword_filter'), description: 'Увімкнути фільтрацію за словами в назві' },
            onChange: function (value) { settings.keyword_filter_enabled = value; Lampa.Storage.set('keyword_filter_enabled', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'keyword_list', type: 'input', default: '' },
            field: { name: 'Список слів', description: Lampa.Lang.translate('keyword_filter_desc') },
            onChange: function (value) { settings.keyword_list = value; Lampa.Storage.set('keyword_list', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'blacklist_manager', type: 'static' },
            field: { name: Lampa.Lang.translate('content_filter_blacklist_title'), description: 'Керування прихованими елементами' },
            onRender: function (el) {
                el.css('cursor', 'pointer').on('hover:enter', function () {
                    var items = settings.blacklist.map(function(b) { return { title: b.title, id: b.id }; });
                    if (items.length === 0) { Lampa.Noty.show('Список порожній'); return; }
                    Lampa.Select.show({
                        title: 'Чорний список',
                        items: items,
                        onSelect: function (item) {
                            settings.blacklist = settings.blacklist.filter(function(b) { return b.id !== item.id; });
                            Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                            Lampa.Noty.show('Видалено: ' + item.title);
                        }
                    });
                });
            }
        });
    }

    [cite_start]// 7. Завантаження збережених параметрів [cite: 59-60]
    function loadSettings() {
        settings.asian_filter_enabled = Lampa.Storage.get('asian_filter_enabled', false);
        settings.ru_content_filter_enabled = Lampa.Storage.get('ru_content_filter_enabled', false);
        settings.country_filter_enabled = Lampa.Storage.get('country_filter_enabled', false);
        settings.country_list = Lampa.Storage.get('country_list', '');
        settings.keyword_filter_enabled = Lampa.Storage.get('keyword_filter_enabled', false);
        settings.keyword_list = Lampa.Storage.get('keyword_list', '');
        settings.blacklist = Lampa.Storage.get('content_filter_blacklist', []);
    }

    [cite_start]// 8. Ініціалізація [cite: 66-82]
    function initPlugin() {
        if (window.content_filter_ultimate_plugin) return;
        window.content_filter_ultimate_plugin = true;

        loadSettings();
        addTranslations();
        addSettings();
        addContextMenu();

        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results) || e.data.results.length === 0) return;
            if (!e.data.results.some(isMediaContent)) return;
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
