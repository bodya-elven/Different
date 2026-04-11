(function () {
    'use strict';

    const APPLECATION_VERSION = '1.3';

    // Иконка плагина
    const PLUGIN_ICON = '<svg viewBox="110 90 180 210"xmlns=http://www.w3.org/2000/svg><g id=sphere><circle cx=200 cy=140 fill="hsl(200, 80%, 40%)"opacity=0.3 r=1.2 /><circle cx=230 cy=150 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=170 cy=155 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=245 cy=175 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=155 cy=180 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=215 cy=165 fill="hsl(200, 80%, 46%)"opacity=0.36 r=1.2 /><circle cx=185 cy=170 fill="hsl(200, 80%, 43%)"opacity=0.33 r=1.3 /><circle cx=260 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=140 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=250 cy=220 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=150 cy=225 fill="hsl(200, 80%, 47%)"opacity=0.37 r=1.4 /><circle cx=235 cy=240 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=165 cy=245 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=220 cy=255 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=180 cy=258 fill="hsl(200, 80%, 41%)"opacity=0.31 r=1.2 /><circle cx=200 cy=120 fill="hsl(200, 80%, 60%)"opacity=0.5 r=1.8 /><circle cx=240 cy=135 fill="hsl(200, 80%, 65%)"opacity=0.55 r=2 /><circle cx=160 cy=140 fill="hsl(200, 80%, 62%)"opacity=0.52 r=1.9 /><circle cx=270 cy=165 fill="hsl(200, 80%, 70%)"opacity=0.6 r=2.2 /><circle cx=130 cy=170 fill="hsl(200, 80%, 67%)"opacity=0.57 r=2.1 /><circle cx=255 cy=190 fill="hsl(200, 80%, 72%)"opacity=0.62 r=2.3 /><circle cx=145 cy=195 fill="hsl(200, 80%, 69%)"opacity=0.59 r=2.2 /><circle cx=280 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=120 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=275 cy=215 fill="hsl(200, 80%, 73%)"opacity=0.63 r=2.4 /><circle cx=125 cy=220 fill="hsl(200, 80%, 71%)"opacity=0.61 r=2.3 /><circle cx=260 cy=235 fill="hsl(200, 80%, 68%)"opacity=0.58 r=2.2 /><circle cx=140 cy=240 fill="hsl(200, 80%, 66%)"opacity=0.56 r=2.1 /><circle cx=245 cy=255 fill="hsl(200, 80%, 63%)"opacity=0.53 r=2 /><circle cx=155 cy=260 fill="hsl(200, 80%, 61%)"opacity=0.51 r=1.9 /><circle cx=225 cy=270 fill="hsl(200, 80%, 58%)"opacity=0.48 r=1.8 /><circle cx=175 cy=272 fill="hsl(200, 80%, 56%)"opacity=0.46 r=1.7 /><circle cx=200 cy=100 fill="hsl(200, 80%, 85%)"opacity=0.8 r=2.8 /><circle cx=230 cy=115 fill="hsl(200, 80%, 90%)"opacity=0.85 r=3 /><circle cx=170 cy=120 fill="hsl(200, 80%, 87%)"opacity=0.82 r=2.9 /><circle cx=250 cy=140 fill="hsl(200, 80%, 92%)"opacity=0.88 r=3.2 /><circle cx=150 cy=145 fill="hsl(200, 80%, 89%)"opacity=0.84 r=3.1 /><circle cx=265 cy=170 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.4 /><circle cx=135 cy=175 fill="hsl(200, 80%, 93%)"opacity=0.87 r=3.3 /><circle cx=275 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=125 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=200 cy=200 fill="hsl(200, 80%, 100%)"opacity=1 r=4 /><circle cx=220 cy=195 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.8 /><circle cx=180 cy=205 fill="hsl(200, 80%, 97%)"opacity=0.93 r=3.7 /><circle cx=240 cy=210 fill="hsl(200, 80%, 96%)"opacity=0.92 r=3.6 /><circle cx=160 cy=215 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.5 /><circle cx=270 cy=230 fill="hsl(200, 80%, 94%)"opacity=0.88 r=3.4 /><circle cx=130 cy=235 fill="hsl(200, 80%, 92%)"opacity=0.86 r=3.3 /><circle cx=255 cy=250 fill="hsl(200, 80%, 90%)"opacity=0.84 r=3.2 /><circle cx=145 cy=255 fill="hsl(200, 80%, 88%)"opacity=0.82 r=3.1 /><circle cx=235 cy=265 fill="hsl(200, 80%, 86%)"opacity=0.8 r=3 /><circle cx=165 cy=268 fill="hsl(200, 80%, 84%)"opacity=0.78 r=2.9 /><circle cx=215 cy=280 fill="hsl(200, 80%, 82%)"opacity=0.76 r=2.8 /><circle cx=185 cy=282 fill="hsl(200, 80%, 80%)"opacity=0.74 r=2.7 /><circle cx=200 cy=290 fill="hsl(200, 80%, 78%)"opacity=0.72 r=2.6 /><circle cx=210 cy=130 fill="hsl(200, 80%, 88%)"opacity=0.83 r=2.5 /><circle cx=190 cy=135 fill="hsl(200, 80%, 86%)"opacity=0.81 r=2.4 /><circle cx=225 cy=155 fill="hsl(200, 80%, 91%)"opacity=0.86 r=2.8 /><circle cx=175 cy=160 fill="hsl(200, 80%, 89%)"opacity=0.84 r=2.7 /><circle cx=245 cy=185 fill="hsl(200, 80%, 94%)"opacity=0.89 r=3.3 /><circle cx=155 cy=190 fill="hsl(200, 80%, 92%)"opacity=0.87 r=3.2 /><circle cx=260 cy=210 fill="hsl(200, 80%, 95%)"opacity=0.91 r=3.4 /><circle cx=140 cy=215 fill="hsl(200, 80%, 93%)"opacity=0.88 r=3.3 /><circle cx=250 cy=230 fill="hsl(200, 80%, 91%)"opacity=0.85 r=3.2 /><circle cx=150 cy=235 fill="hsl(200, 80%, 89%)"opacity=0.83 r=3.1 /><circle cx=230 cy=245 fill="hsl(200, 80%, 87%)"opacity=0.81 r=3 /><circle cx=170 cy=250 fill="hsl(200, 80%, 85%)"opacity=0.79 r=2.9 /><circle cx=210 cy=260 fill="hsl(200, 80%, 83%)"opacity=0.77 r=2.8 /><circle cx=190 cy=265 fill="hsl(200, 80%, 81%)"opacity=0.75 r=2.7 /></g></svg>';


    /**
     * Проверяет, является ли активность все еще активной
     */
    function isAlive(activity) {
        return activity && !activity.__destroyed;
    }



    // Главная функция плагина
    function initializePlugin() {
        console.log('Applecation', 'v' + APPLECATION_VERSION);
        
        if (!Lampa.Platform.screen('tv')) {
            console.log('Applecation', 'TV mode only');
            return;
        }

        patchApiImg();
        addCustomTemplate();
        addOverlayTemplate();
        addStyles();
        addSettings();
        attachLogoLoader();
    }


    // Переводы для настроек
    const translations = {
        show_ratings: {
            en: 'Show ratings',
            uk: 'Показувати рейтинги'
        },


        settings_title_ratings: {
            en: 'Ratings',
            uk: 'Рейтинги'
        },
        show_ratings_desc: {
            en: 'Show ratings on the card',
            uk: 'Відображати рейтинги в картці'
        },

        show_foreign_logo: {
            en: 'No language logo',
            uk: 'Логотип англійською'
        },
        show_foreign_logo_desc: {
            en: 'Show no language logo if localized version is missing',
            uk: 'Показувати логотип англійською мовою, якщо немає українською'
        },
        ratings_position: {
            en: 'Ratings position',
            uk: 'Розташування рейтингів'
        },
        ratings_position_desc: {
            en: 'Choose where to display ratings',
            uk: 'Виберіть де відображати рейтинги'
        },
        position_above_desc: {
            en: 'Above description',
            uk: 'Над описом'
        },
        position_under_desc: {
            en: 'Under description',
            uk: 'Під описом'
        },
        position_corner: {
            en: 'Bottom right corner',
            uk: 'У правому нижньому куті'
        },
        year_short: {
            en: '',
            uk: ' р.'
        },
        logo_scale: {
            en: 'Logo Size',
            uk: 'Розмір логотипу'
        },
        logo_scale_desc: {
            en: 'Movie logo scale',
            uk: 'Масштаб логотипу фільму'
        },
        text_scale: {
            en: 'Text Size',
            uk: 'Розмір тексту'
        },
        text_scale_desc: {
            en: 'Movie data text scale',
            uk: 'Масштаб тексту даних про фільм'
        },
        scale_default: {
            en: 'Default',
            uk: 'За замовчуванням'
        },
        spacing_scale: {
            en: 'Spacing Between Lines',
            uk: 'Відступи між рядками'
        },
        spacing_scale_desc: {
            en: 'Distance between information elements',
            uk: 'Відстань між елементами інформації'
        },
        settings_title_display: {
            en: 'Display',
            uk: 'Відображення'
        },
        settings_title_scaling: {
            en: 'Scaling',
            uk: 'Масштабування'
        },
        show_episode_count: {
            en: 'Episode Count',
            uk: 'Кількість серій'
        },
        show_episode_count_desc: {
            en: 'Show total episode count for TV shows',
            uk: 'Показувати загальну кількість серій для серіалів'
        },
        description_overlay: {
            en: 'Description in Overlay',
            uk: 'Опис в оверлеї'
        },
        description_overlay_desc: {
            en: 'Show description in a separate window when clicked',
            uk: 'Показувати опис в окремому вікні при натисканні'
        },
        about_author: {
            en: 'Author',
            uk: 'Автор'
        },
        about_description: {
            en: 'Makes the movie card interface look like Apple TV and optimizes for 4K',
            uk: 'Робить інтерфейс у картці фільму схожим на Apple TV та оптимізує під 4K'
        },
        extra_title_show: {
            en: 'Extra Title',
            uk: 'Додаткова назва'
        },
        extra_title_show_desc: {
            en: 'Shows localized or original title (depending on the logo) with year and country',
            uk: 'Відображає локалізовану або оригінальну назву (залежно від логотипу) разом із роком та країною'
        },
        extra_title_size: {
            en: 'Extra Title Size',
            uk: 'Розмір додаткової назви'
        },
        extra_title_size_desc: {
            en: 'Title text size relative to other information',
            uk: 'Розмір тексту назви відносно іншої інформації'
        }
        
    };

    function t(key) {
        const lang = Lampa.Storage.get('language', 'ru');
        return translations[key] && translations[key][lang] || translations[key].ru;
    }

    // ===================================================================
    // ДОДАТКОВА НАЗВА (EXTRA TITLE)
    // ===================================================================
    const EXTRA_TITLE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
    const EXTRA_TITLE_CACHE_KEY = "applecation_title_cache";
    let titleCache = Lampa.Storage.get(EXTRA_TITLE_CACHE_KEY) || {};
    const isUK = Lampa.Storage.get('language') === 'uk';

    const countryNames = {
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
        const code = iso.toLowerCase().trim();
        if (!isUK) return Lampa.Lang.translate(code) || iso;
        return countryNames[code] || Lampa.Lang.translate(code) || iso; 
    }

    function cleanOldTitleCache() {
        const now = Date.now();
        let changed = false;
        Object.keys(titleCache).forEach(key => {
            if (now - titleCache[key].timestamp > EXTRA_TITLE_CACHE_TTL) {
                delete titleCache[key];
                changed = true;
            }
        });
        if (changed) Lampa.Storage.set(EXTRA_TITLE_CACHE_KEY, titleCache);
    }
    // ===================================================================
    


    // Добавляем настройки плагина
    function addSettings() {
        // Инициализируем значения по умолчанию
        if (Lampa.Storage.get('applecation_extra_title_show') === undefined) {
            Lampa.Storage.set('applecation_extra_title_show', true);
        }
        if (Lampa.Storage.get('applecation_extra_title_size') === undefined) {
            Lampa.Storage.set('applecation_extra_title_size', '120');
        }
        
        if (Lampa.Storage.get('applecation_show_ratings') === undefined) {
            Lampa.Storage.set('applecation_show_ratings', false);
        }
        if (Lampa.Storage.get('applecation_ratings_position') === undefined) {
            Lampa.Storage.set('applecation_ratings_position', 'above_desc');
        }
        if (Lampa.Storage.get('applecation_logo_scale') === undefined) {
            Lampa.Storage.set('applecation_logo_scale', '100');
        }
        if (Lampa.Storage.get('applecation_text_scale') === undefined) {
            Lampa.Storage.set('applecation_text_scale', '100');
        }
        if (Lampa.Storage.get('applecation_spacing_scale') === undefined) {
            Lampa.Storage.set('applecation_spacing_scale', '100');
        }
        if (Lampa.Storage.get('applecation_description_overlay') === undefined) {
            Lampa.Storage.set('applecation_description_overlay', true);
        }
        if (Lampa.Storage.get('applecation_show_foreign_logo') === undefined) {
            Lampa.Storage.set('applecation_show_foreign_logo', true);
        }
        if (Lampa.Storage.get('applecation_show_episode_count') === undefined) {
            Lampa.Storage.set('applecation_show_episode_count', false);
        }

        // Создаем раздел настроек
        Lampa.SettingsApi.addComponent({
            component: 'applecation_settings',
            name: 'Applecation',
            icon: PLUGIN_ICON
        });
        
        // Добавляем информацию о плагине
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_about',
                type: 'static'
            },
            field: {
                name: '<div>Applecation v' + APPLECATION_VERSION + '</div>'
            },
            onRender: function(item) {
                item.css('opacity', '0.7');
                item.find('.settings-param__name').css({
                    'font-size': '1.2em',
                    'margin-bottom': '0.3em'
                });
                item.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">' + t('about_author') + ': DarkestClouds<br>' + t('about_description') + '</div>');
            }
        });

        // Заголовок: Рейтинги
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_ratings_title',
                type: 'title'
            },
            field: {
                name: t('settings_title_ratings')
            }
        });

        // Показывать рейтинги
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_show_ratings',
                type: 'trigger',
                default: false
            },
            field: {
                name: t('show_ratings'),
                description: t('show_ratings_desc')
            },
            onChange: function(value) {
                if (value) {
                    $('body').removeClass('applecation--hide-ratings');
                } else {
                    $('body').addClass('applecation--hide-ratings');
                }

                // Обновляем видимость зависимых параметров
                Lampa.Settings.update();
            }
        });


        // Розташування рейтингів
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_ratings_position',
                type: 'select',
                values: {
                    above_desc: t('position_above_desc'),
                    under_desc: t('position_under_desc'),
                    corner: t('position_corner')
                },
                default: 'above_desc'
            },
            field: {
                name: t('ratings_position'),
                description: t('ratings_position_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_ratings_position', value);
                $('body').removeClass('applecation--ratings-above_desc applecation--ratings-under_desc applecation--ratings-corner');
                $('body').addClass('applecation--ratings-' + value);
                
                // Оновлюємо шаблони та перезавантажуємо активність
                addCustomTemplate();
                addOverlayTemplate();
                Lampa.Activity.back();
            },
            onRender: function(item) {
                const showRatings = Lampa.Storage.get('applecation_show_ratings', false);
                if (!showRatings) {
                    item.hide();
                } else {
                    item.show();
                }
            }
        });
        


        // Заголовок: Відображення
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_display_title',
                type: 'title'
            },
            field: {
                name: t('settings_title_display')
            }
        });


        // Показувати логотип іншою мовою
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_show_foreign_logo',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('show_foreign_logo'),
                description: t('show_foreign_logo_desc')
            }
        });

        // Додаткова назва (Увімк/Вимк)
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_extra_title_show',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('extra_title_show'),
                description: t('extra_title_show_desc')
            }
        });
        
        // Описание в оверлее
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_description_overlay',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('description_overlay'),
                description: t('description_overlay_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_description_overlay', value);
            }
        });

        // Количество серий
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_show_episode_count',
                type: 'trigger',
                default: false
            },
            field: {
                name: t('show_episode_count'),
                description: t('show_episode_count_desc')
            }
        });

        // Заголовок: Масштабирование
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_scaling_title',
                type: 'title'
            },
            field: {
                name: t('settings_title_scaling')
            }
        });

        // Размер логотипа
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_logo_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': t('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%'
                },
                default: '100'
            },
            field: {
                name: t('logo_scale'),
                description: t('logo_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_logo_scale', value);
                applyScales();
            }
        });

        // Размер текста
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_text_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': t('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%'
                },
                default: '100'
            },
            field: {
                name: t('text_scale'),
                description: t('text_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_text_scale', value);
                applyScales();
            }
        });

        // Розмір додаткової назви
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_extra_title_size',
                type: 'select',
                values: {
                    '100': '100%', '110': '110%', '120': '120%', 
                    '130': '130%', '140': '140%', '150': '150%', 
                    '160': '160%', '170': '170%', '180': '180%', 
                    '190': '190%', '200': '200%'
                },
                default: '120'
            },
            field: {
                name: t('extra_title_size'),
                description: t('extra_title_size_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_extra_title_size', value);
                // Динамічне оновлення розміру без перезавантаження
                $('.applecation-extra-title__main').css('font-size', value + '%');
            }
        });
        
        // Отступы между строками
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_spacing_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': t('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%',
                    '200': '200%',
                    '250': '250%',
                    '300': '300%'
                },
                default: '100'
            },
            field: {
                name: t('spacing_scale'),
                description: t('spacing_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_spacing_scale', value);
                applyScales();
            }
        });

        // Применяем текущие настройки
        if (!Lampa.Storage.get('applecation_show_ratings', false)) {
            $('body').addClass('applecation--hide-ratings');
        }
        $('body').addClass('applecation--ratings-' + Lampa.Storage.get('applecation_ratings_position', 'above_desc'));
                
        applyScales();
    }

    // Применяем масштабирование контента
    function applyScales() {
        const logoScale = parseInt(Lampa.Storage.get('applecation_logo_scale', '100'));
        const textScale = parseInt(Lampa.Storage.get('applecation_text_scale', '100'));
        const spacingScale = parseInt(Lampa.Storage.get('applecation_spacing_scale', '100'));

        // Удаляем старые стили если есть
        $('style[data-id="applecation_scales"]').remove();

        // Создаем новые стили
        const scaleStyles = `
            <style data-id="applecation_scales">
                /* Масштаб логотипа */
                
                .applecation .applecation__logo img {
                    max-width: ${35 * logoScale / 100}vw !important;
                    max-height: ${180 * logoScale / 100}px !important;
                }

                /* Масштаб текста и мета-информации */
                .applecation .applecation__content-wrapper {
                    font-size: ${textScale}% !important;
                }

                /* Отступы между элементами */
                .applecation .full-start-new__title {
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
                
                .applecation .applecation__meta {
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
                
                .applecation .applecation__ratings {
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
                
                .applecation .applecation__description {
                    max-width: ${35 * textScale / 100}vw !important;
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
                
                .applecation .applecation__info {
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
            </style>
        `;

        $('body').append(scaleStyles);
    }

    // Регистрируем шаблон для оверлея описания
    function addOverlayTemplate() {
        const overlayTemplate = `
            <div class="applecation-description-overlay">
                <div class="applecation-description-overlay__bg"></div>
                <div class="applecation-description-overlay__content selector">
                    <div class="applecation-description-overlay__logo"></div>
                    <div class="applecation-description-overlay__title">{title}</div>
                    <div class="applecation-description-overlay__text">{text}</div>
                    <div class="applecation-description-overlay__details">
                        <div class="applecation-description-overlay__info">
                            <div class="applecation-description-overlay__info-name">#{full_date_of_release}</div>
                            <div class="applecation-description-overlay__info-body">{relise}</div>
                        </div>
                        <div class="applecation-description-overlay__info applecation--budget">
                            <div class="applecation-description-overlay__info-name">#{full_budget}</div>
                            <div class="applecation-description-overlay__info-body">{budget}</div>
                        </div>
                        <div class="applecation-description-overlay__info applecation--countries">
                            <div class="applecation-description-overlay__info-name">#{full_countries}</div>
                            <div class="applecation-description-overlay__info-body">{countries}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        Lampa.Template.add('applecation_overlay', overlayTemplate);
    }

    // Реєструємо кастомний шаблон сторінки full
    function addCustomTemplate() {
        const ratingsPosition = Lampa.Storage.get('applecation_ratings_position', 'above_desc');
        
        // Блок з рейтингами
        const ratingsBlock = `<!-- Рейтинги -->
                    <div class="applecation__ratings">
                        <!-- Це невидимий якір, за який зачепиться ваш плагін -->
                        <div class="full-start__rate" style="display: none;"></div>
                    </div>`;
        
        const template = `<div class="full-start-new applecation">
        <div class="full-start-new__body">
            <div class="full-start-new__left hide">
                <div class="full-start-new__poster">
                    <img class="full-start-new__img full--poster" />
                </div>
            </div>

            <div class="full-start-new__right">
                <div class="applecation__left">
                    <div class="applecation__logo"></div>
                    
                    <div class="applecation__content-wrapper">
                        <div class="full-start-new__title" style="display: none;">{title}</div>
                        
                        <div class="applecation__meta">
                            <div class="applecation__meta-left">
                                <span class="applecation__network"></span>
                                <span class="applecation__meta-text"></span>
                            </div>
                        </div>
                        
                        ${ratingsPosition === 'above_desc' ? ratingsBlock : ''}
                        
                        <div class="applecation__description-wrapper">
                            <div class="applecation__description"></div>
                        </div>
                        
                        <div class="applecation__info"></div>
                    </div>
                    
                        ${ratingsPosition === 'under_desc' ? ratingsBlock : ''}
                                            
                    <div class="full-start-new__head" style="display: none;"></div>
                    <div class="full-start-new__details" style="display: none;"></div>

                    <div class="full-start-new__buttons">
                        <div class="full-start__button selector button--play">
                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                            </svg>
                            <span>#{title_watch}</span>
                        </div>

                        <div class="full-start__button selector button--book">
                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{settings_input_links}</span>
                        </div>

                        <div class="full-start__button selector button--subscribe hide">
                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{title_subscribe}</span>
                        </div>

                        <div class="full-start__button selector button--options">
                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="applecation__right">
                    
                    ${ratingsPosition === 'corner' ? ratingsBlock : ''}

                    <!-- Прихований елемент для сумісності (запобігає виходу реакцій за екран) -->
                    <div class="full-start-new__rate-line">
                        <div class="full-start__status hide"></div>
                    </div>
                    
                    <!-- Порожній маркер для запобігання вставці елементів від modss.js -->
                    <div class="rating--modss" style="display: none;"></div>
                </div>
            </div>
        </div>

        <div class="hide buttons--container">
            <div class="full-start__button view--torrent hide">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>
                </svg>
                <span>#{full_torrents}</span>
            </div>

            <div class="full-start__button selector view--trailer">
                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>
                </svg>
                <span>#{full_trailers}</span>
            </div>
        </div>
    </div>`;

        Lampa.Template.add('full_start_new', template);
    
    
        

        // Переопределяем шаблон эпизода для стиля Apple TV
        const episodeTemplate = `<div class="full-episode selector layer--visible">
            <div class="full-episode__img">
                <img />
                <div class="full-episode__time">{time}</div>
            </div>

            <div class="full-episode__body">
                <div class="full-episode__num">#{full_episode} {num}</div>
                <div class="full-episode__name">{name}</div>
                <div class="full-episode__overview">{overview}</div>
                <div class="full-episode__date">{date}</div>
            </div>
        </div>`;
        
        Lampa.Template.add('full_episode', episodeTemplate);
    }

    function disableFullDescription(e) {
        if (e.type === 'start' && e.link) {
            // Удаляем 'description' из списка rows перед рендерингом
            const rows = e.link.rows;
            const index = rows.indexOf('description');
            if (index > -1) {
                rows.splice(index, 1);
            }
        }
    }

    function addStyles() {
        const styles = `<style>


/* =========================================================
   ОСНОВНИЙ КОНТЕЙНЕР ТА ІЄРАРХІЯ ШАРІВ (z-index)
   ========================================================= */

.applecation {
    transition: all .3s;
}

.applecation .full-start-new__body {
    height: 80vh;
}

.applecation .full-start-new__right {
    display: flex;
    align-items: flex-end;
}

/* Вищий пріоритет для всієї інформації та кнопок (Шар 5) */
.applecation__left, 
.applecation__right,
.full-start-new__buttons,
.applecation-description-overlay {
    position: relative;
    z-index: 10 !important;
}

/* =========================================================
   ФОН, СЛАЙД-ШОУ ТА ЕФЕКТИ
   ========================================================= */

/* 1. Базовий фон Lampa (Шар 1 - найнижчий) */
.full-start__background {
    height: calc(100% + 6em);
    left: 0 !important;
    opacity: 0 !important;
    transition: opacity 0.6s ease-out, filter 0.3s ease-out !important;
    animation: none !important;
    transform: none !important;
    will-change: opacity, filter;
    overflow: hidden;
    z-index: 1 !important;
    background-size: cover !important;
    background-position: center center !important;
}

/* 2. Контейнер слайд-шоу (Шар 2 - над базовим фоном) */
.applecation-slideshow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2 !important;
    pointer-events: none;
}

/* Шари окремих слайдів: заповнення 100% без деформації */
.applecation-slideshow__layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-size: cover !important; /* Заповнення екрана зі збереженням пропорцій */
    background-position: center center !important;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 1000ms ease-in-out !important; 
    will-change: opacity;
}

.applecation-slideshow__layer.active {
    opacity: 1;
}

/* 3. Оверлей затемнення (Шар 3 - над слайдами, під текстом) */
.applecation__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3 !important;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0) 65%);
    pointer-events: none;
}

/* 4. Блюр (Шар 4 - ефект на весь фоновий стек) */
.full-start__background.dim {
    filter: blur(30px) !important;
}

.full-start__background.loaded:not(.dim) {
    opacity: 1 !important;
}

/* =========================================================
   ЕЛЕМЕНТИ ІНТЕРФЕЙСУ (ЛОГО, ТЕКСТ, ОПИС)
   ========================================================= */

.applecation .full-start-new__title {
    font-size: 2.5em;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5em;
    text-shadow: 0 0 .1em rgba(0, 0, 0, 0.3);
}

/* Логотип */
.applecation__logo {
    margin-bottom: 0.5em;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.applecation__logo.loaded {
    opacity: 1;
    transform: translateY(0);
}

.applecation__logo img {
    display: block;
    max-width: 35vw;
    max-height: 180px;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: left center;
}

.applecation__content-wrapper {
    font-size: 100%;
}

/* Метаінформація */
.applecation__meta {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 1.1em;
    margin-bottom: 0.5em;
    line-height: 1;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    transition-delay: 0.05s;
}

.applecation__meta.show {
    opacity: 1;
    transform: translateY(0);
}

.applecation__meta-left {
    display: flex;
    align-items: center;
    line-height: 1;
}

.applecation__network {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    margin-right: 1em;
}

.applecation__network img {
    display: block;
    max-height: 0.8em;
    width: auto;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.applecation__meta-text {
    line-height: 1;
}

/* Додаткова назва (Extra Title) */
.applecation-extra-title {
    line-height: 1.2;
    letter-spacing: 0.3px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-top: 0.4em;
    margin-bottom: 0.4em;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    transition-delay: 0.05s;
}

.applecation-extra-title.show {
    opacity: 1;
    transform: translateY(0);
}

.applecation-extra-title__main {
    color: #ffffff;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
    transition: font-size 0.3s ease;
}

.applecation-extra-title__info {
    color: #ffffff;
    font-weight: 400;
    font-size: 1em;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.applecation-extra-title__sep {
    margin: 0 0.4em;
    opacity: 0.8;
}

/* Рейтинги */
.applecation__ratings {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.8em;
    margin-bottom: 0.5em;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    transition-delay: 0.08s;
}

.applecation__ratings.show {
    opacity: 1;
    transform: translateY(0);
}

/* Опис */
.applecation__description-wrapper {
    background-color: transparent !important;
    padding: .15em .4em 0 .7em !important;
    margin-left: -0.7em;
    border-radius: 1em;
    width: fit-content;
    position: relative;
    z-index: 10;
    transform-origin: left center;
    opacity: 0;
    transform: translateY(15px) scale(1);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out;
    transition-delay: 0.1s;
}

.applecation__description-wrapper.show {
    opacity: 1;
}

.applecation__description-wrapper.focus {
    background-color: rgba(0, 0, 0, 0.6) !important;
    transform: translateY(0) scale(1.05);
}

.applecation__description {
    color: #ffffff !important;
    font-size: 0.95em;
    line-height: 1.5;
    margin-bottom: 0.5em;
    max-width: 35vw;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.applecation__info {
    color: rgba(255, 255, 255, 0.75);
    font-size: 1em;
    line-height: 1.4;
    margin-bottom: 0.5em;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    transition-delay: 0.15s;
}

.applecation__info.show {
    opacity: 1;
    transform: translateY(0);
}

/* Допоміжні класи */
.full-start__background.loaded.applecation-animated {
    opacity: 1 !important;
}

body:not(.menu--open) .full-start__background {
    mask-image: none;
}

.applecation .full-start__status {
    display: none;
}



/* Епізоди Apple TV */
.applecation .full-episode--small {
    width: 20em !important;
    height: auto !important;
    margin-right: 1.5em !important;
    background: none !important;
    display: flex !important;
    flex-direction: column !important;
    transition: transform 0.3s !important;
}

.applecation .full-episode--small.focus {
    transform: scale(1.02);
}

.applecation .full-episode--next .full-episode__img::after {
  border: none !important;
}

.applecation .full-episode__img {
    padding-bottom: 56.25% !important;
    border-radius: 0.8em !important;
    margin-bottom: 1em !important;
    background-color: rgba(255,255,255,0.05) !important;
    position: relative !important;
    overflow: visible !important;
    transition: box-shadow 0.4s ease, transform 0.4s ease !important;
}

.applecation .full-episode__img img {
    border-radius: 0.8em !important;
    object-fit: cover !important;
}

.applecation .full-episode__time {
    position: absolute;
    bottom: 0.8em;
    left: 0.8em;
    background: rgba(0,0,0,0.6);
    padding: 0.2em 0.5em;
    border-radius: 0.4em;
    font-size: 0.75em;
    font-weight: 600;
    color: #fff;
    backdrop-filter: blur(5px);
    z-index: 2;
}

.applecation .full-episode__time:empty {
    display: none;
}

.applecation .full-episode__body {
    position: static !important;
    display: flex !important;
    flex-direction: column !important;
    background: none !important;
    padding: 0 0.5em !important;
    opacity: 0.6;
    transition: opacity 0.3s;
}

.applecation .full-episode.focus .full-episode__body {
    opacity: 1;
}

.applecation .full-episode__num {
    font-size: 0.75em !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    color: rgba(255,255,255,0.4) !important;
    margin-bottom: 0.2em !important;
    letter-spacing: 0.05em !important;
}

.applecation .full-episode__name {
    font-size: 1.1em !important;
    font-weight: 600 !important;
    color: #fff !important;
    margin-bottom: 0.4em !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.4 !important;
    padding-bottom: 0.1em !important;
}

.applecation .full-episode__overview {
    font-size: 0.85em !important;
    line-height: 1.4 !important;
    color: rgba(255,255,255,0.5) !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    margin-bottom: 0.6em !important;
    height: 2.8em !important;
}

.applecation .full-episode__date {
    font-size: 0.8em !important;
    color: rgba(255,255,255,0.3) !important;
}

.applecation .full-episode{
  position: relative;
  z-index: 1;
  opacity: 1;
  filter: none;
  transition: transform .4s cubic-bezier(.16,1,.3,1);
}

.applecation .full-episode:not(.focus){
  transform: none;
}

.applecation .full-episode.focus{
  z-index: 10;
  transform: scale(1.03) translateY(-6px);
}

/* Тінь для епізодів при фокусі замість скла */
.applecation .full-episode.focus .full-episode__img {
  box-shadow: 0 12px 30px rgba(0,0,0,0.6) !important;
}

.applecation .full-episode__viewed {
    top: 0.8em !important;
    right: 0.8em !important;
    background: rgba(0,0,0,0.5) !important;
    border-radius: 50% !important;
    padding: 0.3em !important;
    backdrop-filter: blur(10px) !important;
}

/* Статус наступної серії */
.applecation .full-episode--next .full-episode__img:after {
    border-radius: 0.8em !important;
}

/* Оверлей для повного опису */
.applecation-description-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.applecation-description-overlay.show {
    opacity: 1;
    visibility: visible;
    pointer-events: all;
}

.applecation-description-overlay__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-backdrop-filter: blur(100px);
    backdrop-filter: blur(100px);
}

.applecation-description-overlay__content {
    position: relative;
    z-index: 1;
    max-width: 60vw;
    max-height: 90vh;
    overflow-y: auto;
}

.applecation-description-overlay__logo {
    text-align: center;
    margin-bottom: 1.5em;
    display: none;
}

.applecation-description-overlay__logo img {
    max-width: 40vw;
    max-height: 150px;
    width: auto;
    height: auto;
    object-fit: contain;
}

.applecation-description-overlay__title {
    font-size: 2em;
    font-weight: 600;
    margin-bottom: 1em;
    color: #fff;
    text-align: center;
}

.applecation-description-overlay__text {
    font-size: 1.2em;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    white-space: pre-wrap;
    margin-bottom: 1.5em;
}

.applecation-description-overlay__details {
    display: flex;
    flex-wrap: wrap;
    margin: -1em;
}

.applecation-description-overlay__details > * {
    margin: 1em;
}

.applecation-description-overlay__info-name {
    font-size: 1.1em;
    margin-bottom: 0.5em;
}

.applecation-description-overlay__info-body {
    font-size: 1.2em;
    opacity: 0.6;
}

/* Скролбар для опису */
.applecation-description-overlay__content::-webkit-scrollbar {
    width: 0.5em;
}

.applecation-description-overlay__content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1em;
}

.applecation-description-overlay__content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1em;
}

.applecation-description-overlay__content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* =========================================================
   ПЕРСОНИ
   ========================================================= */

/* ТРЮК З ФОНОМ: Наш фон застосовується ТІЛЬКИ коли картка не у фокусі. 
   Коли наводимо фокус, цей фон зникає, і плагін тем вільно заливає картку своїм градієнтом! */
.applecation .full-person:not(.focus) {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 2px solid transparent !important;
}

/* Сама картка - суттєво збільшуємо розміри */
.applecation .full-person {
    display: flex !important;
    flex-direction: row !important; 
    align-items: center !important;
    width: 20em !important;
    border-radius: 14px !important; /* Трохи м'якші кути */
    padding: 0.8em !important; /* Збільшено з 0.5em */
    margin: 0.5em 1.2em 0.5em 0 !important;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s !important;
    box-sizing: border-box !important;
    will-change: transform;
}

/* Стан фокусу */
.applecation .full-person.focus {
    transform: scale(1.05) !important;
    /* Тут НЕМАЄ background !important, щоб тема могла застосувати свій колір */
    box-shadow: 0 8px 25px rgba(0,0,0,0.4) !important;
    z-index: 10;
}

/* Фото персони - робимо значно більшим */
.applecation .full-person__photo {
    position: relative !important;
    width: 6.8em !important; /* Збільшили фото (було 5.2em) */
    height: 6.8em !important; /* Збільшили фото (було 5.2em) */
    margin: 0 !important;
    border-radius: 12px !important; 
    overflow: hidden !important;
    background: rgba(255, 255, 255, 0.05) !important;
    flex-shrink: 0 !important;
}

.applecation .full-person__photo img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 12px !important; 
    transition: none !important;
}

/* Текстова інформація - підганяємо під нове велике фото */
.applecation .full-person__body {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    text-align: left !important;
    padding-left: 1.2em !important; /* Збільшено відступ від фото */
    overflow: hidden !important;
    flex-grow: 1 !important;
    width: calc(100% - 6.8em) !important; /* Скоригували обчислення під нову ширину фото */
}

/* Ім'я персони */
.applecation .full-person__name {
    font-size: 1.2em !important;
    font-weight: 500 !important;
    color: #fff !important;
    line-height: 1.3 !important;
    width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    position: relative !important;
}

/* Роль персони */
.applecation .full-person__role {
    font-size: 0.9em !important;
    color: rgba(255, 255, 255, 0.5) !important;
    line-height: 1.3 !important;
    width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    margin-top: 0.3em !important;
}

.applecation .full-person.focus .full-person__role {
    color: rgba(255, 255, 255, 0.9) !important;
}

/* Корекція кропу для обличчя */
.applecation.applecation--poster-high .full-person__photo img {
    object-position: center top !important; 
}

.applecation .full-person__photo img[src*="actor.svg"],
.applecation .full-person__photo img[src*="img_broken.svg"] {
    object-position: center !important;
}


/* =========================================================
   РУХОМИЙ РЯДОК (MARQUEE) - ІМ'Я ТА РОЛЬ
   ========================================================= */

/* Ефект згасання по краях для імені та ролі */
.applecation .full-person__name.marquee-active,
.applecation .full-person__role.marquee-active {
    text-overflow: clip !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    mask-image: linear-gradient(to right, #000 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, #000 92%, transparent 100%);
}

/* При фокусі додаємо згасання і з лівого боку */
.applecation .full-person.focus .full-person__name.marquee-active,
.applecation .full-person.focus .full-person__role.marquee-active {
    mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
}

.applecation .marquee__inner {
    display: inline-block;
    white-space: nowrap;
}

.applecation .marquee__inner span {
    padding-right: 2.5em; /* Відступ між повтореннями тексту */
    display: inline-block;
}

/* Запуск анімації при фокусі для обох рядків */
.applecation .full-person.focus .marquee-active .marquee__inner {
    animation: marquee var(--marquee-duration, 5s) linear infinite;
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}


/* Роль персони */
.applecation .full-person__role {
    font-size: 0.85em !important;
    font-weight: 400 !important;
    color: rgba(255, 255, 255, 0.5) !important;
    line-height: 1.3 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width: 100% !important;
    margin-top: 0.2em !important;
}

.applecation .full-person.focus .full-person__role {
    color: rgb(255, 255, 255) !important;
}
</style>`;
   
        Lampa.Template.add('applecation_css', styles);
        $('body').append(Lampa.Template.get('applecation_css', {}, true));
    }


    // Патчим внутренние методы Лампы для корректной работы эпизодов и качества
    function patchApiImg() {
        const tmdbSource = Lampa.Api.sources.tmdb;

        if (!tmdbSource) return;

        // 0. Патчим формирование URL для TMDB, чтобы добавить логотипы в основной запрос (append_to_response)
        if (window.Lampa && Lampa.TMDB && Lampa.TMDB.api) {
            const originalTmdbApi = Lampa.TMDB.api;
            Lampa.TMDB.api = function(url) {
                let newUrl = url;
                if (typeof newUrl === 'string' && newUrl.indexOf('append_to_response=') !== -1 && newUrl.indexOf('images') === -1) {
                    // Добавляем images в список append_to_response
                    newUrl = newUrl.replace('append_to_response=', 'append_to_response=images,');
                    
                    // Добавляем языки для картинок, если они еще не указаны
                    if (newUrl.indexOf('include_image_language=') === -1) {
                        const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
                        newUrl += (newUrl.indexOf('?') === -1 ? '?' : '&') + 'include_image_language=en,null,' + lang;
                    }
                }
                return originalTmdbApi.call(Lampa.TMDB, newUrl);
            };
        }
        
        // 1. Патчим шаблонизатор, чтобы принудительно изменить формат даты и времени в карточках
        const originalTemplateJs = Lampa.Template.js;
        Lampa.Template.js = function(name, vars) {
            if (name === 'full_episode' && vars) {
                // Форматируем время (локализовано: 1 ч 10 м или 39 м) - убираем точки
                if (vars.runtime > 0) {
                    vars.time = Lampa.Utils.secondsToTimeHuman(vars.runtime * 60).replace(/\./g, '');
                } else {
                    vars.time = '';
                }

                // Форматируем дату: всегда с годом
                if (vars.air_date) {
                    const dateObj = new Date(vars.air_date.replace(/-/g, '/'));
                    const month = dateObj.getMonth() + 1;
                    const monthEnd = Lampa.Lang.translate('month_' + month + '_e');
                    const yearSuffix = t('year_short');
                    vars.date = dateObj.getDate() + ' ' + monthEnd + ' ' + dateObj.getFullYear() + yearSuffix;
                }
            }
            return originalTemplateJs.call(Lampa.Template, name, vars);
        };

        // 2. Патчим метод изображений для улучшения качества
        const originalImg = tmdbSource.img;
        tmdbSource.img = function(src, size) {
            const posterSize = Lampa.Storage.field('poster_size');

            if (size === 'w1280') {
                const backdropMap = {
                    'w200': 'w780',
                    'w300': 'w1280',
                    'w500': 'original'
                };
                size = backdropMap[posterSize] || 'w1280';
            }

            if (size === 'w300') {
                const episodeMap = {
                    'w200': 'w300',
                    'w300': 'w780',
                    'w500': 'w780'
                };
                size = episodeMap[posterSize] || 'w300';
            }

            if (size === 'w276_and_h350_face' && posterSize === 'w500') {
                size = 'w600_and_h900_face';
            }

            return originalImg.call(tmdbSource, src, size);
        };

        Lampa.Api.img = tmdbSource.img;
    }

    // Получаем качество логотипа на основе poster_size
    function getLogoQuality() {
        const posterSize = Lampa.Storage.field('poster_size');
        const qualityMap = {
            'w200': 'w300',      // Низкое постера → низкое лого
            'w300': 'w500',      // Среднее постера → среднее лого
            'w500': 'original'   // Высокое постера → оригинальное лого
        };
        return qualityMap[posterSize] || 'w500';
    }

    // Получаем локализованный тип медиа
    function getMediaType(data) {
        const lang = Lampa.Storage.get('language', 'ru');
        const isTv = !!data.name;
        
        const types = {
            ru: isTv ? 'Сериал' : 'Фильм',
            en: isTv ? 'TV Series' : 'Movie',
            uk: isTv ? 'Серіал' : 'Фільм',
            be: isTv ? 'Серыял' : 'Фільм',
            bg: isTv ? 'Сериал' : 'Филм',
            cs: isTv ? 'Seriál' : 'Film',
            he: isTv ? 'סדרה' : 'סרט',
            pt: isTv ? 'Série' : 'Filme',
            zh: isTv ? '电视剧' : '电影'
        };
        
        return types[lang] || types['en'];
    }

    // Загружаем иконку студии/сети
    function loadNetworkIcon(activity, data) {
        const networkContainer = activity.render().find('.applecation__network');
        
        // Для сериалов - телесеть
        if (data.networks && data.networks.length) {
            const network = data.networks[0];
            if (network.logo_path) {
                const logoUrl = Lampa.Api.img(network.logo_path, 'w200');
                networkContainer.html(`<img src="${logoUrl}" alt="${network.name}">`);
                return;
            }
        }
        
        // Для фильмов - студия
        if (data.production_companies && data.production_companies.length) {
            const company = data.production_companies[0];
            if (company.logo_path) {
                const logoUrl = Lampa.Api.img(company.logo_path, 'w200');
                networkContainer.html(`<img src="${logoUrl}" alt="${company.name}">`);
                return;
            }
        }
        
        // Если нет иконки - скрываем контейнер
        networkContainer.remove();
    }

    // Заполняем мета информацию (Тип/Жанр/поджанр)
    function fillMetaInfo(activity, data) {
        const metaTextContainer = activity.render().find('.applecation__meta-text');
        const metaParts = [];

        // Тип контента
        metaParts.push(getMediaType(data));

        // Жанры (первые 2-3)
        if (data.genres && data.genres.length) {
            const genres = data.genres.slice(0, 2).map(g => 
                Lampa.Utils.capitalizeFirstLetter(g.name)
            );
            metaParts.push(...genres);
        }

        metaTextContainer.html(metaParts.join(' · '));
        
        // Загружаем иконку студии/сети
        loadNetworkIcon(activity, data);
    }

    // Заполняем описание
    function fillDescription(activity, data) {
        const descContainer = activity.render().find('.applecation__description');
        const descWrapper = activity.render().find('.applecation__description-wrapper');
        const description = data.overview || '';
        const useOverlay = Lampa.Storage.get('applecation_description_overlay', true);
        
        descContainer.text(description);
        
        if (useOverlay) {
            // Создаем оверлей заранее
            createDescriptionOverlay(activity, data);
            
            // Добавляем обработчик клика для показа полного описания
            descWrapper.off('hover:enter').on('hover:enter', function() {
                showFullDescription();
            });
        } else {
            // Если оверлей отключен, убираем обработчики и удаляем оверлей
            descWrapper.off('hover:enter');
            $('.applecation-description-overlay').remove();
        }
    }
    
    // Обновляем логотип в оверлее
    function updateOverlayLogo(logoUrl) {
        const overlay = $('.applecation-description-overlay');
        
        if (!overlay.length) return;
        
        if (logoUrl) {
            const newLogoImg = $('<img>').attr('src', logoUrl);
            overlay.find('.applecation-description-overlay__logo').html(newLogoImg).css('display', 'block');
            overlay.find('.applecation-description-overlay__title').css('display', 'none');
        }
    }
    
    // Парсим страны с локализацией (как в ядре Lampa)
    function parseCountries(movie) {
        if (!movie.production_countries) return [];
        
        return movie.production_countries.map(country => {
            const isoCode = country.iso_3166_1;
            const langKey = 'country_' + isoCode.toLowerCase();
            const translated = Lampa.Lang.translate(langKey);
            
            // Если перевод найден (не равен ключу), используем его, иначе оригинальное имя
            return translated !== langKey ? translated : country.name;
        });
    }
    
    // Создаем оверлей заранее
    function createDescriptionOverlay(activity, data) {
        const text = data.overview || '';
        const title = data.title || data.name;
        
        if (!text) return;
        
        // Удаляем старый оверлей если есть
        $('.applecation-description-overlay').remove();
        
        // Парсим данные как в Lampa
        const date = (data.release_date || data.first_air_date || '') + '';
        const relise = date.length > 3 ? Lampa.Utils.parseTime(date).full : date.length > 0 ? date : Lampa.Lang.translate('player_unknown');
        const budget = '$ ' + Lampa.Utils.numberWithSpaces(data.budget || 0);
        const countriesArr = parseCountries(data);
        const countries = countriesArr.join(', ');
        
        // Создаем оверлей через шаблон Lampa
        const overlay = $(Lampa.Template.get('applecation_overlay', {
            title: title,
            text: text,
            relise: relise,
            budget: budget,
            countries: countries
        }));
        
        // Скрываем бюджет если 0
        if (!data.budget || data.budget === 0) {
            overlay.find('.applecation--budget').remove();
        }
        
        // Скрываем страны если пусто
        if (!countries) {
            overlay.find('.applecation--countries').remove();
        }
        
        // Добавляем в body но НЕ показываем
        $('body').append(overlay);
        
        // Сохраняем ссылку
        overlay.data('controller-created', false);
    }
    
    // Показываем полное описание в оверлее
    function showFullDescription() {
        const overlay = $('.applecation-description-overlay');
        
        if (!overlay.length) return;
        
        // Анимация появления
        setTimeout(() => overlay.addClass('show'), 10);
        
        // Создаем контроллер только один раз
        if (!overlay.data('controller-created')) {
            const controller = {
                toggle: function() {
                    Lampa.Controller.collectionSet(overlay);
                    Lampa.Controller.collectionFocus(overlay.find('.applecation-description-overlay__content'), overlay);
                },
                back: function() {
                    closeDescriptionOverlay();
                }
            };
            
            Lampa.Controller.add('applecation_description', controller);
            overlay.data('controller-created', true);
        }
        
        Lampa.Controller.toggle('applecation_description');
    }
    
    // Закрываем оверлей с описанием
    function closeDescriptionOverlay() {
        const overlay = $('.applecation-description-overlay');
        
        if (!overlay.length) return;
        
        overlay.removeClass('show');
        
        setTimeout(() => {
            Lampa.Controller.toggle('content');
        }, 300);
    }

    // Відмінювання сезонів (Українська та Англійська)
    function formatSeasons(count) {
        const lang = Lampa.Storage.get('language', 'uk');
        
        if (lang === 'en') {
            return count === 1 ? `${count} Season` : `${count} Seasons`;
        }

        // Логіка для української мови (основна)
        const titles = ['сезон', 'сезони', 'сезонів'];
        const cases = [2, 0, 1, 1, 1, 2];
        const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
        
        return `${count} ${titles[index]}`;
    }

    // Відмінювання серій (Українська та Англійська)
    function formatEpisodes(count) {
        const lang = Lampa.Storage.get('language', 'uk');
        
        if (lang === 'en') {
            return count === 1 ? `${count} Episode` : `${count} Episodes`;
        }

        // Логіка для української мови (основна)
        const titles = ['серія', 'серії', 'серій'];
        const cases = [2, 0, 1, 1, 1, 2];
        const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
        
        return `${count} ${titles[index]}`;
    }
    

    // Заполняем дополнительную информацию (Год/длительность)
    function fillAdditionalInfo(activity, data) {
        const infoContainer = activity.render().find('.applecation__info');
        const infoParts = [];

        // Тривалість
        if (data.name) {
            // Сериал - показываем и продолжительность эпизода, и количество сезонов
            if (data.episode_run_time && data.episode_run_time.length) {
                const avgRuntime = data.episode_run_time[0];
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                infoParts.push(`${avgRuntime} ${timeM}`);
            }
            
            // Завжди показувати кількість сезонів для серіалів
            const seasons = Lampa.Utils.countSeasons(data);
            if (seasons) {
                infoParts.push(formatSeasons(seasons));
            }

            // Показувати кількість серій, якщо увімкнено в налаштуваннях
            if (Lampa.Storage.get('applecation_show_episode_count', false)) {
                const episodes = data.number_of_episodes;
                if (episodes) {
                    infoParts.push(formatEpisodes(episodes));
                }
            }
        } else {
            // Фільм - загальна тривалість
            if (data.runtime && data.runtime > 0) {
                const hours = Math.floor(data.runtime / 60);
                const minutes = data.runtime % 60;
                const timeH = Lampa.Lang.translate('time_h').replace('.', '');
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                const timeStr = hours > 0 
                    ? `${hours} ${timeH} ${minutes} ${timeM}` 
                    : `${minutes} ${timeM}`;
                infoParts.push(timeStr);
            }
        }

        const textContent = infoParts.length > 0 ? infoParts.join(' · ') : '';
        infoContainer.html(textContent);
    }
    

    function renderExtraTitle(ukTitle, enTitle, hasLogo, year, country, network, activityRender) {
        if (!activityRender || !activityRender.parent().length) return;
        $(".applecation-extra-title", activityRender).remove();

        let displayTitle = hasLogo ? enTitle : ukTitle;
        if (!displayTitle || displayTitle === "undefined") displayTitle = "";

        const nativeTitle = activityRender.find('.full-start-new__title, .full-start__title');
        if (!hasLogo) {
            nativeTitle.hide(); 
        }

        const sizePercent = Lampa.Storage.get('applecation_extra_title_size', '120');

        const infoParts = [];
        if (year && year !== "undefined") infoParts.push(year);
        if (country && country !== "undefined") infoParts.push(country);
        const secondaryInfo = infoParts.join('<span class="applecation-extra-title__sep">·</span>');

        let infoSpan = '';
        if (secondaryInfo) {
            const separator = displayTitle ? '<span class="applecation-extra-title__sep">·</span>' : '';
            infoSpan = `<span class="applecation-extra-title__info">${separator}${secondaryInfo}</span>`;
        }

        // Додано клас "show" одразу, щоб текст точно проявився
        const html = `
            <div class="applecation-extra-title show">
                <span class="applecation-extra-title__main" style="font-size: ${sizePercent}%;">${displayTitle}</span>
                ${infoSpan}
            </div>`;

        const target = $(".applecation__meta", activityRender);
        if (target.length) target.before(html);
    }


    function checkLogoAndRenderExtra(card, activity, activityRender) {
        if (!Lampa.Storage.get('applecation_extra_title_show', true)) return;

        cleanOldTitleCache();
        const cached = titleCache[card.id];
        const now = Date.now();

        // ВИПРАВЛЕНО: Додано порожній рядок "" як 6-й аргумент, щоб зберегти порядок
        if (cached && (now - cached.timestamp < EXTRA_TITLE_CACHE_TTL)) {
            renderExtraTitle(cached.ukTitle, cached.enTitle, cached.hasLogo, cached.year, cached.country, "", activityRender);
        }

        const type = card.first_air_date ? "tv" : "movie";
        const url = `https://api.themoviedb.org/3/${type}/${card.id}?api_key=${Lampa.TMDB.key()}&append_to_response=translations,images&include_image_language=uk,en,null`;

        $.getJSON(url, function (data) {
            if (!isAlive(activity)) return;

            let hasUkrainianLogo = false;
            if (data.images && data.images.logos) {
                hasUkrainianLogo = data.images.logos.some(l => l.iso_639_1 === "uk");
            }

            const originalName = data.original_title || data.original_name || card.original_title || card.original_name || "";
            const enTitle = data.title || data.name || originalName;
            let ukTitle = enTitle;

            if (data.translations && data.translations.translations) {
                const translation = data.translations.translations.find(t => t.iso_3166_1 === "UA" || t.iso_639_1 === "uk");
                if (translation) {
                    ukTitle = translation.data.title || translation.data.name || enTitle;
                }
            }

            const year = (data.release_date || data.first_air_date || "").split("-")[0];
            const countryString = (data.production_countries || []).map(c => getCountryUA(c.iso_3166_1)).join(", ");

            titleCache[card.id] = {
                ukTitle: ukTitle, enTitle: enTitle, hasLogo: hasUkrainianLogo,
                year: year, country: countryString, timestamp: now
            };
            Lampa.Storage.set(EXTRA_TITLE_CACHE_KEY, titleCache);

            // ВИПРАВЛЕНО: Додано порожній рядок "" як 6-й аргумент
            renderExtraTitle(ukTitle, enTitle, hasUkrainianLogo, year, countryString, "", activityRender);

            // ЗАПУСК СЛАЙД-ШОУ ФОНІВ
            if (data.images && data.images.backdrops) {
                const anchorPath = data.backdrop_path;
                
                let otherBackdrops = data.images.backdrops
                    .filter(b => b.iso_639_1 === null && b.file_path !== anchorPath)
                    .map(b => Lampa.TMDB.image('t/p/original' + b.file_path));

                otherBackdrops = shuffleArray(otherBackdrops).slice(0, 5);
                
                // Захист від битих посилань, якщо anchorPath відсутній
                const finalBackdrops = [];
                if (anchorPath) finalBackdrops.push(Lampa.TMDB.image('t/p/original' + anchorPath));
                finalBackdrops.push(...otherBackdrops);

                if (finalBackdrops.length > 1) {
                    startBackdropSlideshow(activity, finalBackdrops);
                }
            }
        });
    }
    


    // Функція для запуску слайд-шоу фонів
    function startBackdropSlideshow(activity, backdrops) {
        // backdrops[0] — це базовий фон, який вже є. Нам потрібні інші.
        if (!backdrops || backdrops.length <= 1 || !isAlive(activity)) return;

        const render = activity.render();
        let bgContainer = render.find('.full-start__background').first();
        
        if (!bgContainer.length) {
            setTimeout(() => startBackdropSlideshow(activity, backdrops), 500);
            return;
        }

        // Створюємо окремий контейнер для слайдів всередині фону
        if (bgContainer.find('.applecation-slideshow').length === 0) {
            bgContainer.append('<div class="applecation-slideshow"></div>');
        }
        const slideshowCont = bgContainer.find('.applecation-slideshow');
        
        // Очищаємо старі шари
        slideshowCont.empty();
        slideshowCont.append('<div class="applecation-slideshow__layer layer-1"></div>');
        slideshowCont.append('<div class="applecation-slideshow__layer layer-2"></div>');

        const layers = [slideshowCont.find('.layer-1'), slideshowCont.find('.layer-2')];
        let currentLayerIdx = 0;
        let currentBackdropIdx = 0; // 0 — це база Lampa, ми її не вантажимо в шари

        function nextSlide() {
            if (!isAlive(activity)) return;

            currentBackdropIdx++;

            // Якщо ми пройшли всі додаткові фони (цикл завершився)
            if (currentBackdropIdx >= backdrops.length) {
                // Ховаємо всі шари слайд-шоу, щоб стало видно базовий фон Lampa
                layers[0].removeClass('active');
                layers[1].removeClass('active');
                currentBackdropIdx = 0; // Повертаємося до бази
                
                // Чекаємо 8 секунд на базі та запускаємо коло знову
                activity.__backdropTimeout = setTimeout(nextSlide, 8000);
                return;
            }

            // Робота з шарами для плавного перемикання
            const nextLayerIdx = (currentLayerIdx + 1) % 2;
            const nextLayer = layers[nextLayerIdx];
            const currentLayer = layers[currentLayerIdx];

            // Вантажимо наступний фон (починаючи з індексу 1)
            nextLayer.css('background-image', 'url(' + backdrops[currentBackdropIdx] + ')');

            setTimeout(() => {
                if (!isAlive(activity)) return;
                
                nextLayer.addClass('active');
                // Якщо ми на другому фоні (перший слайд), то currentLayer ще порожній,
                // але ми все одно знімаємо активність про всяк випадок
                currentLayer.removeClass('active');

                currentLayerIdx = nextLayerIdx;

                // Всі наступні слайди по 7 секунд
                activity.__backdropTimeout = setTimeout(nextSlide, 7000);
            }, 200); // Короткий прелоад
        }

        // Перший запуск: чекаємо 8 секунд, поки висить рідний фон Lampa, і проявляємо другий
        activity.__backdropTimeout = setTimeout(nextSlide, 8000);
    }

    // Допоміжна функція для перемішування масиву (Алгоритм Фішера-Єйтса)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    

    // Завантажуємо логотип фільму
    function loadLogo(event) {
        const data = event.data.movie;
        const activity = event.object.activity;
        
        if (!data || !activity) return;

        // Заповнюємо основну інформацію
        fillMetaInfo(activity, data);
        fillDescription(activity, data);
        fillAdditionalInfo(activity, data);

        // Чекаємо завантаження фону
        waitForBackgroundLoad(activity, () => {
            if (!isAlive(activity)) return;

        // Після завантаження фону показуємо контент
        activity.render().find('.applecation-extra-title').addClass('show'); 
        activity.render().find('.applecation__meta').addClass('show');

        
        const useOverlay = Lampa.Storage.get('applecation_description_overlay', true);
        const descWrapper = activity.render().find('.applecation__description-wrapper').addClass('show');
        
        if (useOverlay) {
            descWrapper.addClass('selector');
            if (window.Lampa && Lampa.Controller) {
                Lampa.Controller.collectionAppend(descWrapper);
            }
        }
        
        activity.render().find('.applecation__info').addClass('show');
        activity.render().find('.applecation__ratings').addClass('show');
    });

    const logoContainer = activity.render().find('.applecation__logo');
    const titleElement = activity.render().find('.full-start-new__title');

    // Функція для відтворення знайденого логотипа
    const renderLogo = (logoPath) => {
        const quality = getLogoQuality();
        const logoUrl = Lampa.TMDB.image(`/t/p/${quality}${logoPath}`);

        const img = new Image();
        img.onload = () => {
            if (!isAlive(activity)) return;

            logoContainer.html(`<img src="${logoUrl}" alt="" />`);
            waitForBackgroundLoad(activity, () => {
                if (!isAlive(activity)) return;
                logoContainer.addClass('loaded');
            });
            
            // Оновлюємо логотип в оверлеї
            updateOverlayLogo(logoUrl);
        };
        img.src = logoUrl;
    };
    

        // 1. Пытаемся взять логотип из уже загруженных данных (благодаря патчу append_to_response)
        if (data.images && data.images.logos && data.images.logos.length > 0) {
            // Находим логотип на текущем языке или английский/нейтральный
            const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
            let logo = data.images.logos.find(l => l.iso_639_1 === lang);
            
            // Если логотипа на текущем языке нет, ищем на английском или нейтральном
            if (!logo && Lampa.Storage.get('applecation_show_foreign_logo', true)) {
                logo = data.images.logos.find(l => l.iso_639_1 === 'en');
                if (!logo) logo = data.images.logos.find(l => !l.iso_639_1); // null
                if (!logo) logo = data.images.logos[0];
            }

            if (logo && logo.file_path) {
                return renderLogo(logo.file_path);
            }
        }

        // 2. Если логотипа нет в данных (например, другой источник или ошибка патча), делаем старый запрос
        const mediaType = data.name ? 'tv' : 'movie';
        const apiUrl = Lampa.TMDB.api(
            `${mediaType}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}`
        );

        $.get(apiUrl, (imagesData) => {
            if (!isAlive(activity)) return;

            if (imagesData.logos && imagesData.logos.length > 0) {
                const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
                let logo = imagesData.logos.find(l => l.iso_639_1 === lang);

                if (!logo && Lampa.Storage.get('applecation_show_foreign_logo', true)) {
                    logo = imagesData.logos.find(l => l.iso_639_1 === 'en') || imagesData.logos.find(l => !l.iso_639_1) || imagesData.logos[0];
                }

                if (logo && logo.file_path) {
                    return renderLogo(logo.file_path);
                }
            }
            
            // Нет подходящего логотипа - показываем текстовое название
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        }).fail(() => {
            // При ошибке показываем текстовое название
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        });
    }


    // Чекаємо завантаження та появи фону
    function waitForBackgroundLoad(activity, callback) {
        const background = activity.render().find('.full-start__background:not(.applecation__overlay)');
        
        if (!background.length) {
            callback();
            return;
        }

        // Якщо фон уже завантажений і анімація завершена
        if (background.hasClass('loaded') && background.hasClass('applecation-animated')) {
            callback();
            return;
        }

        // Якщо фон завантажений, але анімація ще триває
        if (background.hasClass('loaded')) {
            // Чекаємо завершення transition + невелика затримка для надійності
            setTimeout(() => {
                if (!isAlive(activity)) return;
                background.addClass('applecation-animated');
                callback();
            }, 350); // 600ms transition + запас
            return;
        }

        // Чекаємо на завантаження фону через інтервал
        const checkInterval = setInterval(() => {
            if (!isAlive(activity)) {
                clearInterval(checkInterval);
                return;
            }

            if (background.hasClass('loaded')) {
                clearInterval(checkInterval);
                // Чекаємо завершення transition + затримка
                setTimeout(() => {
                    if (!isAlive(activity)) return;
                    
                    background.addClass('applecation-animated');
                    callback();
                }, 650); 
            }
        }, 50);

        // Таймаут (запобіжник) на випадок, якщо фон не завантажився
        setTimeout(() => {
            clearInterval(checkInterval);
            if (isAlive(activity) && !background.hasClass('applecation-animated')) {
                background.addClass('applecation-animated');
                callback();
            }
        }, 2000);
    }

    // Додаємо оверлей затемнення поруч із фоном
    function addOverlay(activity) {
        const render = activity.render();
        const background = render.find('.full-start__background').first();
        
        // Перевіряємо, чи немає оверлею вже, щоб не дублювати шари
        if (background.length && !background.next('.applecation__overlay').length) {
            const overlay = $('<div class="full-start__background loaded applecation__overlay"></div>');
            
            // Встановлюємо pointer-events: none, щоб оверлей НЕ перехоплював кліки по кнопках
            // та не перекривав взаємодію з текстом
            overlay.css({
                'pointer-events': 'none',
                'z-index': '1'
            });
            
            background.after(overlay);
        }
    }

    // Застосовуємо розмиття (blur) фону при прокручуванні сторінки вниз (до акторів)
    function attachScrollBlur(activity) {
        const render = activity.render();
        // Знаходимо саме контейнер фону (де тепер живуть наші слайди)
        const background = render.find('.full-start__background:not(.applecation__overlay)')[0];
        const scrollBody = render.find('.scroll__body')[0];
        
        if (!background || !scrollBody) return;
        
        // Кешуємо стан для уникнення зайвих DOM-операцій (економія ресурсів ТБ)
        let isBlurred = false;
        
        // Перехоплюємо сеттер стилю трансформації — найбільш продуктивний спосіб для ТБ
        const originalDescriptor = Object.getOwnPropertyDescriptor(scrollBody.style, '-webkit-transform') || 
                                   Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'webkitTransform');
        
        Object.defineProperty(scrollBody.style, '-webkit-transform', {
            set: function(value) {
                if (value) {
                    const yStart = value.indexOf(',') + 1;
                    const yEnd = value.indexOf(',', yStart);
                    if (yStart > 0 && yEnd > yStart) {
                        const yValue = parseFloat(value.substring(yStart, yEnd));
                        const shouldBlur = yValue < 0;
                        
                        // Змінюємо клас 'dim' тільки при зміні стану
                        if (shouldBlur !== isBlurred) {
                            isBlurred = shouldBlur;
                            if (background && background.classList) {
                                background.classList.toggle('dim', shouldBlur);
                            }
                        }
                    }
                }
                
                // Викликаємо оригінальний сеттер Lampa
                if (originalDescriptor && originalDescriptor.set) {
                    originalDescriptor.set.call(this, value);
                } else {
                    this.setProperty('-webkit-transform', value);
                }
            },
            get: function() {
                if (originalDescriptor && originalDescriptor.get) {
                    return originalDescriptor.get.call(this);
                }
                return this.getPropertyValue('-webkit-transform');
            },
            configurable: true
        });
    }
    

    // Додаємо рухому стрічку для довгих імен та ролей персон
    function attachPersonMarquee(activity) {
        const render = activity.render();
        // Тепер шукаємо і імена, і ролі акторів
        const targets = render.find('.full-person__name, .full-person__role');
        
        // Очищаємо старі marquee, якщо вони є (на випадок повторного виклику)
        targets.each(function() {
            const el = $(this);
            if (el.hasClass('marquee-processed')) {
                const originalText = el.find('span').first().text();
                if (originalText) {
                    el.text(originalText);
                    el.removeClass('marquee-processed marquee-active');
                    el.css('--marquee-duration', '');
                }
            }
        });

        // Функція для перевірки переповнення тексту
        function isTextOverflowing(element) {
            // Для коректної перевірки на прихованих елементах або в процесі малювання
            return element.scrollWidth > element.clientWidth + 1;
        }
        
        // Ініціалізуємо marquee для тих, хто не вміщується в ширину
        // Невелика затримка 200мс, щоб лейаут встиг перерахуватися на ТБ
        setTimeout(() => {
            if (!isAlive(activity)) return;

            targets.each(function() {
                const el = $(this);
                const text = el.text().trim();
                
                if (!text) return;
                
                if (isTextOverflowing(el[0])) {
                    // Розраховуємо тривалість: ~250мс на символ, але не менше 5с і не більше 20с
                    const duration = Math.min(Math.max(text.length * 0.25, 5), 20);
                    
                    el.addClass('marquee-processed marquee-active');
                    el.css('--marquee-duration', duration + 's');
                    
                    // Огортаємо в структуру для анімації
                    // Використовуємо text() для безпеки від XSS
                    const span1 = $('<span>').text(text);
                    const span2 = $('<span>').text(text);
                    const inner = $('<div class="marquee__inner">').append(span1).append(span2);
                    
                    el.empty().append(inner);
                } else {
                    el.addClass('marquee-processed');
                }
            });
        }, 200);
    }
    

    // Підключаємо завантаження логотипів та логіку карток
    function attachLogoLoader() {
        Lampa.Listener.follow('full', (event) => {
            // Вимикаємо стандартний блок "Докладно", якщо увімкнено наш оверлей опису
            if (Lampa.Storage.get('applecation_description_overlay', true)) {
                disableFullDescription(event);
            }
            
            if (event.type === 'complite') {
                const activity = event.object.activity;
                const render = activity.render();
                
                // Додаємо основний клас плагіна для застосування стилів
                render.addClass('applecation');

                // Позначаємо активність як "живу"
                activity.__destroyed = false;
                
                // Перевизначаємо метод destroy для очищення пам'яті та таймерів
                var originalDestroy = activity.destroy;
                activity.destroy = function() {
                    activity.__destroyed = true;

                    // ЗУПИНКА СЛАЙД-ШОУ: Очищаємо таймер, щоб він не спрацював після закриття картки
                    if (activity.__backdropTimeout) {
                        clearTimeout(activity.__backdropTimeout);
                        activity.__backdropTimeout = null;
                    }

                    if (originalDestroy) originalDestroy.apply(activity, arguments);
                };

                // Додаємо клас залежно від вибраного розміру постерів
                const posterSize = Lampa.Storage.field('poster_size');
                render.toggleClass('applecation--poster-high', posterSize === 'w500');

                // Ініціалізація додаткових елементів інтерфейсу
                addOverlay(activity);
                loadLogo(event);
                
                // Запуск логіки Додаткової Назви та Слайд-шоу фонів
                const movieData = event.data && event.data.movie;
                if (movieData) {
                    // ТЕПЕР ПЕРЕДАЄМО ВСІ ТРИ АРГУМЕНТИ: дані, об'єкт активності та рендер
                    checkLogoAndRenderExtra(movieData, activity, render);
                }                                
                                
                // Підключаємо ефект блюру при скролі та рухомий рядок для довгих імен
                attachScrollBlur(activity);
                attachPersonMarquee(activity);
            }
        });
    }
        

    // Регистрация плагина в манифесте
    var pluginManifest = {
        type: 'other',
        version: APPLECATION_VERSION,
        name: 'Applecation',
        description: 'Делает интерфейс в карточке фильма похожим на Apple TV и оптимизирует под 4K',
        author: '@darkestclouds',
        icon: PLUGIN_ICON
    };
    
    // Регистрируем плагин
    if (Lampa.Manifest && Lampa.Manifest.plugins) {
        Lampa.Manifest.plugins = pluginManifest;
    }

    // Запуск плагина
    if (window.appready) {
        initializePlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') {
                initializePlugin();
            }
        });
    }

})();

