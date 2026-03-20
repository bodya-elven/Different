/*
 * Plugin: Extra Title
 * Original creator: @yaroslav_films
 * Edited by: @bodya_elven
 */
(function () {
    "use strict";

    function startPlugin() {
        var CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 днів
        var CACHE_KEY = "title_cache_extra_v2";
        var titleCache = Lampa.Storage.get(CACHE_KEY) || {};

        // 1. Очищення старого кешу (запобігаємо переповненню LocalStorage)
        function cleanOldCache() {
            var now = Date.now();
            var keys = Object.keys(titleCache);
            var changed = false;
            keys.forEach(function(key) {
                if (now - titleCache[key].timestamp > CACHE_TTL) {
                    delete titleCache[key];
                    changed = true;
                }
            });
            if (changed) Lampa.Storage.set(CACHE_KEY, titleCache);
        }
        cleanOldCache();

        // 2. Локалізація текстів плагіна
        Lampa.Lang.add({
            extra_title_menu: {
                uk: "Додаткова назва",
                en: "Extra Title",
                ru: "Дополнительное название"
            },
            extra_title_desc: {
                uk: "Налаштування відображення назви та країни",
                en: "Settings for displaying title and country",
                ru: "Настройки отображения названия и страны"
            },
            extra_title_mode: {
                uk: "Режим відображення",
                en: "Display Mode",
                ru: "Режим отображения"
            },
            extra_title_mode_desc: {
                uk: "Визначає, яку назву показувати поруч із логотипом",
                en: "Determines which title to show next to the logo",
                ru: "Определяет, какое название показывать рядом с логотипом"
            },
            extra_title_size: {
                uk: "Розмір назви",
                en: "Title Size",
                ru: "Размер названия"
            },
            extra_title_back: {
                uk: "Назад",
                en: "Back",
                ru: "Назад"
            }
        });

        // 3. Безпечне додавання стилів (Адаптовано під стиль Applecation)
        if ($('#plugin-extra-title-style').length === 0) {
            var style = '<style id="plugin-extra-title-style">' +
                '.plugin-extra-title { margin-top: 5px; margin-bottom: 5px; width: 100%; position: relative; z-index: 10; text-align: left; }' +
                '.plugin-extra-title__body { ' +
                    'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; ' +
                    'line-height: 1.2; font-weight: 600; letter-spacing: 0.3px; ' +
                    'display: flex; align-items: baseline; flex-wrap: wrap; justify-content: flex-start; ' +
                '}' +
                '@media screen and (orientation: portrait), screen and (max-width: 767px) {' +
                    '.plugin-extra-title { text-align: center !important; }' +
                    '.plugin-extra-title__body { justify-content: center !important; }' +
                '}' +
            '</style>';
            $('head').append(style);
        }

        var SETTINGS_COMPONENT = "extra_title_settings";

        // Інтеграція в меню налаштувань
        Lampa.Settings.listener.follow("open", function (e) {
            if (e.name == "main") {
                var render = Lampa.Settings.main().render();
                if (render.find('[data-component="' + SETTINGS_COMPONENT + '"]').length == 0) {
                    Lampa.SettingsApi.addComponent({
                        component: SETTINGS_COMPONENT,
                        name: Lampa.Lang.translate('extra_title_menu')
                    });
                }
                Lampa.Settings.main().update();
                render.find('[data-component="' + SETTINGS_COMPONENT + '"]').addClass("hide");
            }
        });

        Lampa.SettingsApi.addParam({
            component: "interface",
            param: { name: "extra_title_entry", type: "static" },
            field: { name: Lampa.Lang.translate('extra_title_menu'), description: Lampa.Lang.translate('extra_title_desc') },
            onRender: function (item) {
                item.on("hover:enter", function () {
                    Lampa.Settings.create(SETTINGS_COMPONENT);
                    Lampa.Controller.enabled().controller.back = function () {
                        Lampa.Settings.create("interface");
                    };
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: "extra_title_back", type: "static" },
            field: { name: Lampa.Lang.translate('extra_title_back'), description: "" },
            onRender: function (item) {
                item.on("hover:enter", function () {
                    Lampa.Settings.create("interface");
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: "extra_title_mode",
                type: "select",
                values: {
                    'smart': 'Smart (Залежно від лого)',
                    'always_ua': 'Завжди локальна'
                },
                default: 'smart'
            },
            field: { name: Lampa.Lang.translate('extra_title_mode'), description: Lampa.Lang.translate('extra_title_mode_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: "extra_title_size",
                type: "select",
                values: {
                    'xs': 'Дуже мала',
                    's': 'Мала',
                    'm': 'Нормальна',
                    'l': 'Велика',
                    'xl': 'Дуже велика'
                },
                default: 'm'
            },
            field: { name: Lampa.Lang.translate('extra_title_size'), description: "" }
        });

        // Повний масив країн
        var countryNames = {
            'us': 'США', 'usa': 'США', 'gb': 'Велика Британія', 'uk': 'Велика Британія',
            'ua': 'Україна', 'ca': 'Канада', 'hk': 'Гонконг', 'fr': 'Франція',
            'de': 'Німеччина', 'it': 'Італія', 'es': 'Іспанія', 'jp': 'Японія',
            'kr': 'Південна Корея', 'cn': 'Китай', 'pl': 'Польща', 'au': 'Австралія',
            'ie': 'Ірландія', 'be': 'Бельгія', 'dk': 'Данія', 'no': 'Норвегія',
            'se': 'Швеція', 'fi': 'Фінляндія', 'tr': 'Туреччина', 'in': 'Індія',
            'br': 'Бразилія', 'mx': 'Мексика', 'nl': 'Нідерланди', 'at': 'Австрія',
            'ch': 'Швейцарія', 'cz': 'Чехія', 'hu': 'Угорщина', 'nz': 'Нова Зеландія',
            'za': 'ПАР', 'il': 'Ізраїль', 'th': 'Таїланд', 'tw': 'Тайвань', 
            'ru': 'Країна-агресор', 'pt': 'Португалія', 'gr': 'Греція',
            'is': 'Ісландія', 'ro': 'Румунія', 'bg': 'Болгарія',
            'ar': 'Аргентина', 'cl': 'Чилі', 'co': 'Колумбія', 'pe': 'Перу',
            'id': 'Індонезія', 'my': 'Малайзія', 'ph': 'Філіппіни', 'sg': 'Сінгапур',
            'vn': 'В\'єтнам', 'ae': 'ОАЕ', 'sa': 'Саудівська Аравія', 'eg': 'Єгипет'
        };

        function getCountryUA(iso) {
            if (!iso) return '';
            var code = iso.toLowerCase().trim();
            return countryNames[code] || Lampa.Lang.translate(code) || iso; 
        }

        // Рендер з перевіркою контексту активності
        function renderTitle(ukTitle, enTitle, hasLogo, country, activityRender) {
            // Переконуємось, що DOM-елемент досі існує
            if (!activityRender || !activityRender.parent().length) return;

            $(".plugin-extra-title", activityRender).remove();

            var mode = Lampa.Storage.get('extra_title_mode', 'smart');
            var sizeKey = Lampa.Storage.get('extra_title_size', 'm');

            var displayTitle = (mode === 'smart' && hasLogo) ? enTitle : ukTitle;
            if (!displayTitle || displayTitle === "undefined") displayTitle = "";

            var sizes = {
                'xs': { title: '1.0em', info: '0.8em' },
                's':  { title: '1.2em', info: '0.9em' },
                'm':  { title: '1.4em', info: '1.0em' },
                'l':  { title: '1.7em', info: '1.1em' },
                'xl': { title: '2.0em', info: '1.2em' }
            };
            var currentSize = sizes[sizeKey] || sizes['m'];

            var secondaryInfo = (country && country !== "undefined") ? country : '';

            var html = '<div class="plugin-extra-title">' +
                '<div class="plugin-extra-title__body">' +
                    '<span style="font-size: ' + currentSize.title + '; color: #fff; opacity: 0.85;">' + displayTitle + '</span>' + 
                    '<span style="font-size: ' + currentSize.info + '; color: #fff; opacity: 0.55; margin-left: 8px;">' + secondaryInfo + '</span>' +
                '</div>' +
           '</div>';

            var target = $(".full-start-new__title", activityRender);
            if (!target.length) target = $(".full-start__title", activityRender);
            target.after(html);
        }

        function checkLogoAndRender(card, activityRender) {
            var cached = titleCache[card.id];
            var now = Date.now();

            if (cached && (now - cached.timestamp < CACHE_TTL)) {
                renderTitle(cached.ukTitle, cached.enTitle, cached.hasLogo, cached.country, activityRender);
                return;
            }

            var type = card.first_air_date ? "tv" : "movie";
            var url = "https://api.themoviedb.org/3/" + type + "/" + card.id + "?api_key=" + Lampa.TMDB.key() + "&append_to_response=translations,images&include_image_language=uk,en,null";

            $.getJSON(url, function (data) {
                var hasUkrainianLogo = false;
                if (data.images && data.images.logos) {
                    hasUkrainianLogo = data.images.logos.some(function (l) {
                        return l.iso_639_1 === "uk" || l.iso_639_1 === "ru";
                    });
                }

                var originalName = data.original_title || data.original_name || card.original_title || card.original_name || "";
                var enTitle = data.title || data.name || originalName;
                var ukTitle = enTitle;

                if (data.translations && data.translations.translations) {
                    var translation = data.translations.translations.find(function (t) {
                        return t.iso_3166_1 === "UA" || t.iso_639_1 === "uk";
                    });
                    if (translation) {
                        ukTitle = translation.data.title || translation.data.name || enTitle;
                    }
                }

                var countryList = (data.production_countries || []).map(function (c) {
                    return getCountryUA(c.iso_3166_1);
                });
                var countryString = countryList.join(" / ");

                titleCache[card.id] = {
                    ukTitle: ukTitle || "",
                    enTitle: enTitle || "",
                    hasLogo: hasUkrainianLogo,
                    country: countryString || "",
                    timestamp: now
                };
                Lampa.Storage.set(CACHE_KEY, titleCache);

                renderTitle(ukTitle, enTitle, hasUkrainianLogo, countryString, activityRender);
            }).fail(function() {
                var fallbackTitle = card.title || card.name || card.original_title || "";
                renderTitle(fallbackTitle, fallbackTitle, false, "", activityRender);
            });
        }

        // 4. Безпечний запуск рендеру лише коли сторінка відкрита
        if (!window.extra_title_plugin_loaded) {
            window.extra_title_plugin_loaded = true;
            Lampa.Listener.follow("full", function (e) {
                if (e.type === "complite" && e.data && e.data.movie) {
                    var activityRender = e.object && e.object.activity ? e.object.activity.render() : Lampa.Activity.active().activity.render();
                    checkLogoAndRender(e.data.movie, activityRender);
                }
            });
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow("app", function (e) {
            if (e.type === "ready") startPlugin();
        });
    }
})();
