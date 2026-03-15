/* Created by Elven (1|1) - Bulletproof Architecture */
(function () {
    'use strict';

    var settings = {
        ru_lang_enabled: false,
        asian_lang_enabled: false,
        indian_lang_enabled: false,
        turkish_lang_enabled: false,
        arabic_lang_enabled: false,
        other_languages: '',
        rating_limit: 0,
        hide_watched: false,
        keyword_filter: '',
        blacklist: []
    };

    // Оригінальний захист від фільтрації плагінів
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

    function getMediaData(item) {
        if (!item) return null;
        var data = item;
        if (item.movie && (item.movie.id || item.movie.tmdb_id)) data = item.movie;
        else if (item.data && (item.data.id || item.data.tmdb_id)) data = item.data;
        else if (item.card && (item.card.id || item.card.tmdb_id)) data = item.card;

        if (data && (data.id || data.tmdb_id)) return data;
        return null;
    }

    var filterProcessor = {
        apply: function (items) {
            var results = Lampa.Arrays.clone(items);
            return results.filter(function (item) {
                if (!isMediaContent(item)) return true;
                
                var data = getMediaData(item);
                if (!data) return true;

                // 1. Чорний список
                var id = data.id || data.tmdb_id;
                if (settings.blacklist.some(function(b) { return b.id == id; })) return false;

                var lang = (data.original_language || '').toLowerCase();

                // 2. Мовні фільтри
                if (settings.ru_lang_enabled && lang === 'ru') return false;
                if (settings.asian_lang_enabled && ['ja', 'ko', 'zh'].indexOf(lang) !== -1) return false;
                if (settings.indian_lang_enabled && ['hi', 'te', 'ta', 'kn', 'ml'].indexOf(lang) !== -1) return false;
                if (settings.turkish_lang_enabled && lang === 'tr') return false;
                if (settings.arabic_lang_enabled && lang === 'ar') return false;

                if (settings.other_languages) {
                    var other = settings.other_languages.split(',').map(function(s){ return s.trim().toLowerCase(); });
                    if (other.indexOf(lang) !== -1) return false;
                }

                // 3. Рейтинг
                if (settings.rating_limit > 0) {
                    var vote = parseFloat(data.vote_average || 0);
                    if (vote < settings.rating_limit) return false;
                }

                // 4. Переглянуте
                if (settings.hide_watched) {
                    var cardStatus = Lampa.Favorite.check(data);
                    if (cardStatus) {
                        if (cardStatus.thrown) return false;
                        var mediaType = data.media_type || (data.first_air_date ? 'tv' : 'movie');
                        if (mediaType === 'movie' && cardStatus.history) return false;
                        if (mediaType === 'tv' && cardStatus.viewed) return false;
                    }
                }

                // 5. Слова
                if (settings.keyword_filter) {
                    var words = settings.keyword_filter.split(',').map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
                    var title = (data.title || data.name || data.original_title || data.original_name || '').toLowerCase();
                    if (words.some(function(w) { return title.indexOf(w) !== -1; })) return false;
                }

                return true;
            });
        }
    };
    function addContextMenu() {
        var menuHandler = function (e) {
            if (e.type === 'contextmenu' && e.menu && e.object) {
                var data = getMediaData(e.object);
                if (data) {
                    var id = data.id || data.tmdb_id;
                    var title = data.title || data.name || 'Unknown';
                    
                    if (!settings.blacklist.some(function(b) { return b.id == id; })) {
                        e.menu.push({
                            title: Lampa.Lang.translate('content_filter_hide_item'),
                            onSelect: function () {
                                if (!Array.isArray(settings.blacklist)) settings.blacklist = [];
                                settings.blacklist.push({ id: id, title: title });
                                Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                                Lampa.Noty.show(Lampa.Lang.translate('content_filter_added_to_blacklist'));
                            }
                        });
                    }
                }
            }
        };

        Lampa.Listener.follow('app', menuHandler);
        Lampa.Listener.follow('card', menuHandler);
    }

    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { ru: 'Скрытие контента', uk: 'Приховування контенту', en: 'Content Hiding' },
            content_filters_desc: { ru: 'Настройка скрытия контента', uk: 'Налаштування приховування небажаного контенту', en: 'Settings for hiding unwanted content' },
            ru_lang: { ru: 'Скрыть русский контент', uk: 'Приховати російський контент', en: 'Hide Russian content' },
            ru_lang_desc: { ru: 'Скрывает карточки с языком: <b>ru</b>', uk: 'Приховує картки з мовою оригіналу: <b>ru</b>', en: 'Hides cards with original language: <b>ru</b>' },
            asian_lang: { ru: 'Скрыть азиатский контент', uk: 'Приховати азійський контент', en: 'Hide Asian content' },
            asian_lang_desc: { ru: 'Скрывает карточки с языком: <b>ja</b>, <b>ko</b>, <b>zh</b>', uk: 'Приховує картки з мовами оригіналу: <b>ja</b>, <b>ko</b>, <b>zh</b>', en: 'Hides cards with languages: <b>ja</b>, <b>ko</b>, <b>zh</b>' },
            indian_lang: { ru: 'Скрыть индийский контент', uk: 'Приховати індійський контент', en: 'Hide Indian content' },
            indian_lang_desc: { ru: 'Скрывает карточки с языком: <b>hi</b>', uk: 'Приховує картки з мовою оригіналу: <b>hi</b>', en: 'Hides cards with original language: <b>hi</b>' },
            turkish_lang: { ru: 'Скрыть турецкий контент', uk: 'Приховати турецький контент', en: 'Hide Turkish content' },
            turkish_lang_desc: { ru: 'Скрывает карточки с языком: <b>tr</b>', uk: 'Приховує картки з мовою оригіналу: <b>tr</b>', en: 'Hides cards with original language: <b>tr</b>' },
            arabic_lang: { ru: 'Скрыть арабский контент', uk: 'Приховати арабський контент', en: 'Hide Arabic content' },
            arabic_lang_desc: { ru: 'Скрывает карточки с языком: <b>ar</b>', uk: 'Приховує картки з мовою оригіналу: <b>ar</b>', en: 'Hides cards with original language: <b>ar</b>' },
            other_langs: { ru: 'Другие языки', uk: 'Інші мови', en: 'Other languages' },
            other_langs_desc: { ru: 'Коды языков через запятую', uk: 'Впишіть коди мов через кому', en: 'Enter language codes separated by comma' },
            low_rating: { ru: 'Скрыть низкий рейтинг', uk: 'Приховати низький рейтинг', en: 'Hide low rating' },
            low_rating_desc: { ru: 'Скрывает контент по рейтингу', uk: 'Приховує контент за рейтингом TMDb', en: 'Hides content by TMDb rating' },
            hide_watched: { ru: 'Скрыть просмотренное', uk: 'Приховати переглянуте', en: 'Hide watched' },
            hide_watched_desc: { ru: 'Скрывает просмотренные карточки', uk: 'Приховує переглянуті фільми та серіали', en: 'Hides watched movies and TV shows' },
            word_filter: { ru: 'Скрытие по словам', uk: 'Приховування за словами', en: 'Hiding by words' },
            word_filter_desc: { ru: 'Слова в названии через запятую', uk: 'Приховує фільми та серіали за словами', en: 'Hides movies and TV shows by words in title' },
            blacklist_title: { ru: 'Черный список', uk: 'Чорний список', en: 'Blacklist' },
            blacklist_desc: { ru: 'Скрытый вручную контент', uk: 'Керування контентом, що був прихований вручну через меню «Дії»', en: 'Manage manually hidden content' },
            content_filter_hide_item: { ru: 'Скрыть этот контент', uk: 'Приховати цей контент', en: 'Hide this content' },
            content_filter_added_to_blacklist: { ru: 'Добавлено в черный список. Обновите страницу', uk: 'Додано в чорний список. Оновіть сторінку', en: 'Added to blacklist. Refresh page' },
            rating_none: { ru: 'Нет', uk: 'Ні', en: 'None' },
            blacklist_empty: { ru: 'Список пуст', uk: 'Список порожній', en: 'List is empty' },
            blacklist_removed: { ru: 'Удалено: ', uk: 'Видалено: ', en: 'Removed: ' }
        });
    }

    function addSettings() {
        // 1. Офіційна реєстрація. Lampa сама створить правильний шаблон, жодного крашу.
        Lampa.SettingsApi.addComponent({
            component: 'content_filters',
            name: Lampa.Lang.translate('content_filters'),
            icon: '<svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>'
        });

        // 2. БЕЗПЕЧНЕ керування вікнами. Ніяких .update() і setTimeout.
        Lampa.Settings.listener.follow('open', function (e) {
            // Тихо ховаємо дублікат із Головного меню
            if (e.name === 'main') {
                e.render.find('[data-component="content_filters"]').removeClass('selector').hide();
            }
            // Синхронно пересуваємо кнопку в Інтерфейсі на 4-те місце ДО ТОГО, як ініціалізується пульт!
            if (e.name === 'interface') {
                var myBtn = e.render.find('.settings-param').filter(function() {
                    return $(this).find('.settings-param__name').text() === Lampa.Lang.translate('content_filters');
                });
                var target = e.render.find('.settings-param').eq(2);
                if (myBtn.length && target.length && myBtn[0] !== target[0]) {
                    myBtn.insertAfter(target);
                }
            }
        });

        // 3. Додаємо кнопку.
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_filters_btn', type: 'static' },
            field: { name: Lampa.Lang.translate('content_filters'), description: Lampa.Lang.translate('content_filters_desc') },
            onRender: function (el) {
                el.on('hover:enter', function () {
                    Lampa.Settings.create('content_filters');
                    var controller = Lampa.Controller.enabled().controller;
                    if (controller) {
                        controller.back = function () { Lampa.Settings.create('interface'); };
                    }
                });
            }
        });

        // 4. Внутрішні налаштування плагіна.
        var params = [
            { id: 'ru_lang', name: 'ru_lang_enabled' },
            { id: 'asian_lang', name: 'asian_lang_enabled' },
            { id: 'indian_lang', name: 'indian_lang_enabled' },
            { id: 'turkish_lang', name: 'turkish_lang_enabled' },
            { id: 'arabic_lang', name: 'arabic_lang_enabled' }
        ];

        params.forEach(function (p) {
            Lampa.SettingsApi.addParam({
                component: 'content_filters',
                param: { name: p.name, type: 'trigger', default: false },
                field: { name: Lampa.Lang.translate(p.id), description: Lampa.Lang.translate(p.id + '_desc') },
                onChange: function (value) { settings[p.name] = value; Lampa.Storage.set(p.name, value); }
            });
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'other_languages', type: 'static' },
            field: { name: Lampa.Lang.translate('other_langs'), description: Lampa.Lang.translate('other_langs_desc') },
            onRender: function (el) {
                var valStr = settings.other_languages || '';
                var valueDiv = $('<div class="settings-param__value"></div>').text(valStr);
                el.find('.settings-param__name').after(valueDiv);
                
                el.on('hover:enter', function () {
                    if (Lampa.Keypad) Lampa.Keypad.enable();
                    Lampa.Input.edit({ title: Lampa.Lang.translate('other_langs'), value: settings.other_languages || '', free: true }, function (newVal) {
                        settings.other_languages = newVal; Lampa.Storage.set('other_languages', newVal); valueDiv.text(newVal);
                    });
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'rating_limit', type: 'select', default: 0 },
            field: { name: Lampa.Lang.translate('low_rating'), description: Lampa.Lang.translate('low_rating_desc') },
            values: { 0: Lampa.Lang.translate('rating_none'), 4: '< 4.0', 5: '< 5.0', 6: '< 6.0', 7: '< 7.0' },
            onChange: function (value) { settings.rating_limit = parseFloat(value); Lampa.Storage.set('rating_limit', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'hide_watched', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('hide_watched'), description: Lampa.Lang.translate('hide_watched_desc') },
            onChange: function (value) { settings.hide_watched = value; Lampa.Storage.set('hide_watched', value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'keyword_filter', type: 'static' },
            field: { name: Lampa.Lang.translate('word_filter'), description: Lampa.Lang.translate('word_filter_desc') },
            onRender: function (el) {
                var valStr = settings.keyword_filter || '';
                var valueDiv = $('<div class="settings-param__value"></div>').text(valStr);
                el.find('.settings-param__name').after(valueDiv);
                
                el.on('hover:enter', function () {
                    if (Lampa.Keypad) Lampa.Keypad.enable();
                    Lampa.Input.edit({ title: Lampa.Lang.translate('word_filter'), value: settings.keyword_filter || '', free: true }, function (newVal) {
                        settings.keyword_filter = newVal; Lampa.Storage.set('keyword_filter', newVal); valueDiv.text(newVal);
                    });
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_filters',
            param: { name: 'blacklist_manager', type: 'static' },
            field: { name: Lampa.Lang.translate('blacklist_title'), description: Lampa.Lang.translate('blacklist_desc') },
            onRender: function (el) {
                el.on('hover:enter', function () {
                    var items = settings.blacklist.map(function(b) { return { title: b.title, id: b.id }; });
                    if (items.length === 0) return Lampa.Noty.show(Lampa.Lang.translate('blacklist_empty'));
                    Lampa.Select.show({ title: Lampa.Lang.translate('blacklist_title'), items: items, onSelect: function (item) {
                        settings.blacklist = settings.blacklist.filter(function(b) { return b.id !== item.id; });
                        Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                        Lampa.Noty.show(Lampa.Lang.translate('blacklist_removed') + item.title);
                    }});
                });
            }
        });
    }

    function initPlugin() {
        if (window.content_filter_bulletproof_final) return;
        window.content_filter_bulletproof_final = true;

        var keys = ['ru_lang_enabled', 'asian_lang_enabled', 'indian_lang_enabled', 'turkish_lang_enabled', 'arabic_lang_enabled', 'other_languages', 'rating_limit', 'hide_watched', 'keyword_filter'];
        keys.forEach(function(k) { settings[k] = Lampa.Storage.get(k, settings[k]); });
        var bl = Lampa.Storage.get('content_filter_blacklist', []);
        settings.blacklist = Array.isArray(bl) ? bl : [];

        addTranslations();
        addSettings();
        addContextMenu();

        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            var urlStr = typeof (e.url || (e.data && e.data.url)) === 'string' ? (e.url || (e.data && e.data.url)).toLowerCase() : '';
            if (urlStr.indexOf('extension') !== -1 || urlStr.indexOf('plugin') !== -1 || urlStr.indexOf('store') !== -1 || urlStr.indexOf('market') !== -1) return;
            
            var compStr = typeof (e.component || (e.data && e.data.component)) === 'string' ? (e.component || (e.data && e.data.component)).toLowerCase() : '';
            if (compStr.indexOf('extension') !== -1 || compStr.indexOf('plugin') !== -1 || compStr.indexOf('store') !== -1 || compStr.indexOf('market') !== -1) return;

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
