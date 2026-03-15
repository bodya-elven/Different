/* Created by Elven (1|1) */
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

    // Глибокий пошук ID (Логіка Trakt TV для контекстного меню та фільтрів)
    function getMediaData(item) {
        if (!item) return null;
        var data = item;
        if (item.movie && (item.movie.id || item.movie.tmdb_id)) data = item.movie;
        else if (item.data && (item.data.id || item.data.tmdb_id)) data = item.data;
        else if (item.card && (item.card.id || item.card.tmdb_id)) data = item.card;

        if (data && (data.id || data.tmdb_id)) {
            var type = (data.type || item.type || '').toString().toLowerCase();
            var comp = (data.component || item.component || '').toString().toLowerCase();
            if (['torrent', 'person', 'plugins', 'extensions'].indexOf(type) !== -1) return null;
            if (['torrent', 'plugins', 'extensions'].indexOf(comp) !== -1) return null;
            return data;
        }
        return null;
    }

    var filterProcessor = {
        apply: function (items) {
            if (!Array.isArray(items)) return items;
            return items.filter(function (item) {
                var data = getMediaData(item);
                if (!data) return true;

                // 1. Чорний список (ручне приховування)
                var id = data.id || data.tmdb_id;
                if (settings.blacklist.some(function(b) { return b.id == id; })) return false;

                var lang = (data.original_language || '').toLowerCase();

                // 2. Російська (ru)
                if (settings.ru_lang_enabled && lang === 'ru') return false;

                // 3. Азійські (ja, ko, zh)
                if (settings.asian_lang_enabled && ['ja', 'ko', 'zh'].indexOf(lang) !== -1) return false;

                // 4. Індійська (hi)
                if (settings.indian_lang_enabled && lang === 'hi') return false;

                // 5. Турецька (tr)
                if (settings.turkish_lang_enabled && lang === 'tr') return false;

                // 6. Арабська (ar)
                if (settings.arabic_lang_enabled && lang === 'ar') return false;

                // 7. Інші мови
                if (settings.other_languages) {
                    var other = settings.other_languages.split(',').map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
                    if (other.indexOf(lang) !== -1) return false;
                }

                // 8. Низький рейтинг (Контент з 0 також приховується)
                if (settings.rating_limit > 0) {
                    var vote = parseFloat(data.vote_average || 0);
                    if (vote < settings.rating_limit) return false;
                }

                // 9. Переглянуте
                if (settings.hide_watched) {
                    var cardStatus = Lampa.Favorite.check(data);
                    if (cardStatus) {
                        if (cardStatus.thrown) return false;
                        var mediaType = data.media_type || (data.first_air_date ? 'tv' : 'movie');
                        if (mediaType === 'movie' && cardStatus.history) return false;
                        if (mediaType === 'tv' && cardStatus.viewed) return false;
                    }
                }

                // 10. Приховування за словами
                if (settings.keyword_filter) {
                    var words = settings.keyword_filter.split(',').map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
                    var title = (data.title || data.name || data.original_title || data.original_name || '').toLowerCase();
                    if (words.some(function(w) { return title.indexOf(w) !== -1; })) return false;
                }

                return true;
            });
        }
    };
    // КОНТЕКСТНЕ МЕНЮ: Додавання у розділ «Дії» (Actions)
    function addContextMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'contextmenu' && e.object && e.menu) {
                var data = getMediaData(e.object);
                if (data) {
                    var id = data.id || data.tmdb_id;
                    var title = data.title || data.name || 'Content';
                    var isBlacklisted = settings.blacklist.some(function(b) { return b.id == id; });

                    if (!isBlacklisted) {
                        e.menu.push({
                            title: Lampa.Lang.translate('content_filter_hide_item'),
                            onSelect: function () {
                                if (!Array.isArray(settings.blacklist)) settings.blacklist = [];
                                settings.blacklist.push({ id: id, title: title });
                                Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                                Lampa.Noty.show(Lampa.Lang.translate('content_filter_added_to_blacklist'));
                                // Приховуємо картку візуально
                                if (e.object.card && e.object.card.node) $(e.object.card.node).fadeOut(300);
                                else $('.card[data-id="' + id + '"]').fadeOut(300);
                            }
                        });
                    }
                }
            }
        });
    }

    function addTranslations() {
        Lampa.Lang.add({
            content_filters: { uk: 'Приховування контенту', en: 'Content Hiding' },
            content_filters_desc: { uk: 'Налаштування приховування небажаного контенту', en: 'Settings for hiding unwanted content' },
            ru_lang: { uk: 'Приховати російський контент', en: 'Hide Russian content' },
            ru_lang_desc: { uk: 'Приховує картки з мовою оригіналу: **ru**', en: 'Hides cards with original language: **ru**' },
            asian_lang: { uk: 'Приховати азійський контент', en: 'Hide Asian content' },
            asian_lang_desc: { uk: 'Приховує картки з мовами оригіналу: **ja**, **ko**, **zh**', en: 'Hides cards with original languages: **ja**, **ko**, **zh**' },
            indian_lang: { uk: 'Приховати індійський контент', en: 'Hide Indian content' },
            indian_lang_desc: { uk: 'Приховує картки з мовою оригіналу: **hi**', en: 'Hides cards with original language: **hi**' },
            turkish_lang: { uk: 'Приховати турецький контент', en: 'Hide Turkish content' },
            turkish_lang_desc: { uk: 'Приховує картки з мовою оригіналу: **tr**', en: 'Hides cards with original language: **tr**' },
            arabic_lang: { uk: 'Приховати арабський контент', en: 'Hide Arabic content' },
            arabic_lang_desc: { uk: 'Приховує картки з мовою оригіналу: **ar**', en: 'Hides cards with original language: **ar**' },
            other_langs: { uk: 'Інші мови', en: 'Other languages' },
            other_langs_desc: { uk: 'Впишіть коди мов через кому для приховування відповідного контенту', en: 'Enter language codes separated by comma to hide relevant content' },
            low_rating: { uk: 'Приховати низький рейтинг', en: 'Hide low rating' },
            low_rating_desc: { uk: 'Приховує контент за рейтингом TMDb', en: 'Hides content by TMDb rating' },
            hide_watched: { uk: 'Приховати переглянуте', en: 'Hide watched' },
            hide_watched_desc: { uk: 'Приховує переглянуті фільми та серіали', en: 'Hides watched movies and TV shows' },
            word_filter: { uk: 'Приховування за словами', en: 'Hiding by words' },
            word_filter_desc: { uk: 'Приховує фільми та серіали, у назві яких є певні слова чи фрази', en: 'Hides movies and TV shows that have certain words or phrases in the title' },
            blacklist_title: { uk: 'Чорний список', en: 'Blacklist' },
            blacklist_desc: { uk: 'Керування контентом, що був прихований вручну через меню «Дії»', en: 'Manage content hidden manually via the "Actions" menu' },
            content_filter_hide_item: { uk: 'Приховати цей контент', en: 'Hide this content' },
            content_filter_added_to_blacklist: { uk: 'Додано в чорний список', en: 'Added to blacklist' },
            rating_none: { uk: 'Ні', en: 'None' }
        });
    }

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
                    Lampa.Input.edit({ title: Lampa.Lang.translate('other_langs'), value: settings.other_languages, free: true }, function (newVal) {
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
                    Lampa.Input.edit({ title: Lampa.Lang.translate('word_filter'), value: settings.keyword_filter, free: true }, function (newVal) {
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
                    if (items.length === 0) return Lampa.Noty.show(Lampa.Lang.translate('blacklist_empty') || 'List is empty');
                    Lampa.Select.show({ title: Lampa.Lang.translate('blacklist_title'), items: items, onSelect: function (item) {
                        settings.blacklist = settings.blacklist.filter(function(b) { return b.id !== item.id; });
                        Lampa.Storage.set('content_filter_blacklist', settings.blacklist);
                        Lampa.Noty.show((Lampa.Lang.translate('blacklist_removed') || 'Removed: ') + item.title);
                    }});
                });
            }
        });
    }

    function initPlugin() {
        if (window.content_filter_final_v1) return;
        window.content_filter_final_v1 = true;

        var keys = ['ru_lang_enabled', 'asian_lang_enabled', 'indian_lang_enabled', 'turkish_lang_enabled', 'arabic_lang_enabled', 'other_languages', 'rating_limit', 'hide_watched', 'keyword_filter'];
        keys.forEach(function(k) { settings[k] = Lampa.Storage.get(k, settings[k]); });
        var bl = Lampa.Storage.get('content_filter_blacklist', []);
        settings.blacklist = Array.isArray(bl) ? bl : [];

        addTranslations();
        addSettings();
        addContextMenu();

        // Фільтрація каталогів
        Lampa.Listener.follow('request_secuses', function (e) {
            if (e.data && Array.isArray(e.data.results)) {
                e.data.results = filterProcessor.apply(e.data.results);
            }
        });

        // Фільтрація при відмальовці (Закладки, Історія)
        var origRender = Lampa.Card.prototype.render;
        Lampa.Card.prototype.render = function () {
            if (this.data) {
                var passed = filterProcessor.apply([this.data]);
                if (passed.length === 0) {
                    this.card = $('<div class="hide" style="display:none !important"></div>');
                    return this.card;
                }
            }
            return origRender.apply(this, arguments);
        };
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initPlugin(); });
})();
