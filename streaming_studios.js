(function () {
    'use strict';

    /**
     * STUDIOS MASTER v3.1 (White Icons & Logic Fixes)
     * Unified Collections for Lampa
     */

    var ICON_BASE = 'https://bodya-elven.github.io/different/icons/';

    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'netflix.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { title: "Нові серіали", type: "tv", params: { "with_networks": "213", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_networks": "213", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "tv", params: { "with_networks": "213", "with_genres": "16", "sort_by": "popularity.desc" } },
                { title: "Документалістика", type: "tv", params: { "with_networks": "213", "with_genres": "99", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'apple.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Нові серіали", type: "tv", params: { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "movie", params: { "with_watch_providers": "350", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'hbo': {
            title: 'HBO',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'hbo.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_companies": "174", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Нові серіали", type: "tv", params: { "with_networks": "49", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_networks": "49", "sort_by": "popularity.desc" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_companies": "174", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "tv", params: { "with_networks": "49|80", "with_genres": "16", "sort_by": "popularity.desc" } },
                { title: "Топ серіалів", type: "tv", params: { "with_networks": "49", "vote_average.gte": "8.0", "vote_count.gte": "500", "sort_by": "vote_average.desc" } },
                { title: "Топ фільмів", type: "movie", params: { "with_companies": "174", "vote_average.gte": "7.5", "sort_by": "vote_average.desc" } },
                { title: "Всесвіт DC", type: "movie", params: { "with_companies": "174", "with_keywords": "9715", "sort_by": "popularity.desc" } }
            ]
        },
        'prime': {
            title: 'Prime Video',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'primevideo.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_watch_providers": "119", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Нові серіали", type: "tv", params: { "with_watch_providers": "119", "watch_region": "UA", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_watch_providers": "119", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_watch_providers": "119", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "tv", params: { "with_watch_providers": "119", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'disney': {
            title: 'Disney+',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'disneyplus.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_watch_providers": "337", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Нові серіали", type: "tv", params: { "with_watch_providers": "337", "watch_region": "UA", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_watch_providers": "337", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_watch_providers": "337", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "movie", params: { "with_watch_providers": "337", "with_genres": "16", "sort_by": "popularity.desc" } },
                { title: "Всесвіт Marvel", type: "movie", params: { "with_companies": "420", "sort_by": "release_date.desc" } }
            ]
        },
        'hulu': {
            title: 'Hulu',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'hulu.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_networks": "453", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Нові серіали", type: "tv", params: { "with_networks": "453", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_networks": "453", "sort_by": "popularity.desc" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_networks": "453", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "tv", params: { "with_networks": "453", "with_genres": "16", "sort_by": "popularity.desc" } },
                { title: "Топ серіалів FX", type: "tv", params: { "with_networks": "88", "sort_by": "popularity.desc" } }
            ]
        },
        'paramount': {
            title: 'Paramount+',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'paramount.svg" />',
            categories: [
                { title: "Нові серіали", type: "tv", params: { "with_networks": "4330", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Топ серіали", type: "tv", params: { "with_networks": "4330", "vote_average.gte": "7.5", "sort_by": "popularity.desc" } },
                { title: "Нові фільми", type: "movie", params: { "with_companies": "4", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Топ фільми", type: "movie", params: { "with_companies": "4", "vote_count.gte": "500", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "tv", params: { "with_networks": "13|403", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'syfy': {
            title: 'Syfy',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'syfy.svg" />',
            categories: [
                { title: "Нові серіали", type: "tv", params: { "with_networks": "77", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Популярні серіали", type: "tv", params: { "with_networks": "77", "sort_by": "popularity.desc" } },
                { title: "Фантастика", type: "tv", params: { "with_networks": "77", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { title: "Містика та жахи", type: "tv", params: { "with_networks": "77", "with_genres": "9648", "sort_by": "popularity.desc" } }
            ]
        },
        'peacock': {
            title: 'Peacock',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'peacock.svg" />',
            categories: [
                { title: "Нові фільми", type: "movie", params: { "with_companies": "33", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}" } },
                { title: "Нові серіали", type: "tv", params: { "with_networks": "6", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Серіали в тренді", type: "tv", params: { "with_networks": "6", "sort_by": "popularity.desc" } },
                { title: "Фільми в тренді", type: "movie", params: { "with_companies": "33", "sort_by": "popularity.desc" } },
                { title: "Комедії та ситкоми", type: "tv", params: { "with_networks": "6", "with_genres": "35", "sort_by": "popularity.desc" } },
                { title: "Анімація", type: "movie", params: { "with_companies": "521", "sort_by": "popularity.desc" } }
            ]
        },
        'bbc': {
            title: 'BBC',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'bbc.svg" />',
            categories: [
                { title: "Нові серіали", type: "tv", params: { "with_networks": "4|2", "origin_country": "GB", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Популярні серіали", type: "tv", params: { "with_networks": "4|2", "sort_by": "popularity.desc" } },
                { title: "Детективи", type: "tv", params: { "with_networks": "4|2", "with_genres": "80", "sort_by": "popularity.desc" } },
                { title: "Драма", type: "tv", params: { "with_networks": "4|2", "with_genres": "18", "sort_by": "popularity.desc" } }
            ]
        },
        'amc': {
            title: 'AMC+',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'amcplus.svg" />',
            categories: [
                { title: "Нові серіали", type: "tv", params: { "with_networks": "174", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}" } },
                { title: "Топ серіали", type: "tv", params: { "with_networks": "174", "vote_average.gte": "8.0", "sort_by": "popularity.desc" } },
                { title: "Жахи та Містика від Shudder", type: "tv", params: { "with_networks": "174", "with_genres": "18|9648", "with_keywords": "3335", "sort_by": "popularity.desc" } }
            ]
        },
        'educational': {
            title: 'Пізнавальне',
            icon: '<img class="studios_icon" src="' + ICON_BASE + 'world.svg" />',
            categories: [
                // Виправлена логіка: шукаємо шоу, що мали ефір за останні 30 днів
                { title: "Нові випуски", type: "tv", params: { "with_networks": "64|91|43|2696|4|65", "air_date.gte": "{date_30_days_ago}", "air_date.lte": "{current_date}", "sort_by": "popularity.desc" } },
                { title: "BBC Earth", type: "tv", params: { "with_networks": "4", "with_genres": "99", "sort_by": "vote_average.desc" } },
                { title: "National Geographic", type: "tv", params: { "with_networks": "43", "sort_by": "popularity.desc" } },
                { title: "Discovery Channel", type: "tv", params: { "with_networks": "64", "sort_by": "popularity.desc" } },
                { title: "Animal Planet", type: "tv", params: { "with_networks": "91", "sort_by": "popularity.desc" } },
                { title: "History Channel", type: "tv", params: { "with_networks": "65|2696", "sort_by": "popularity.desc" } }
            ]
        }
    };
    // -----------------------------------------------------------------
    // COMPONENTS & HELPERS
    // -----------------------------------------------------------------

    // Функція для підстановки дат
    function processParams(paramsObj) {
        var result = [];
        result.push('api_key=' + Lampa.TMDB.key());
        result.push('language=' + Lampa.Storage.get('language', 'uk'));

        if (paramsObj) {
            for (var key in paramsObj) {
                var val = paramsObj[key];
                if (val === '{current_date}' || val === '{date_30_days_ago}') {
                    var d = new Date();
                    if (val === '{date_30_days_ago}') {
                        d.setDate(d.getDate() - 30);
                    }
                    val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                }
                result.push(key + '=' + val);
            }
        }
        return result;
    }

    function StudiosMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var status = new Lampa.Status(categories.length);

            status.onComplite = function () {
                var fulldata = [];
                Object.keys(status.data).sort(function (a, b) { return a - b; }).forEach(function (key) {
                    var data = status.data[key];
                    if (data && data.results && data.results.length) {
                        var cat = categories[parseInt(key)];
                        Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                        fulldata.push({
                            title: cat.title,
                            results: data.results,
                            url: cat.type === 'movie' ? 'discover/movie' : 'discover/tv',
                            params: cat.params,
                            service_id: object.service_id
                        });
                    }
                });

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            categories.forEach(function (cat, index) {
                var params = processParams(cat.params);
                var url = Lampa.TMDB.api((cat.type === 'movie' ? 'discover/movie' : 'discover/tv') + '?' + params.join('&'));

                network.silent(url, function (json) {
                    status.append(index.toString(), json);
                }, function () {
                    status.error();
                });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    function StudiosView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = processParams(object.params);
            params.push('page=' + page);
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // -----------------------------------------------------------------
    // INJECTION
    // -----------------------------------------------------------------

    function startPlugin() {
        if (window.plugin_studios_master_v3_1_ready) return;
        window.plugin_studios_master_v3_1_ready = true;

        // Register components
        Lampa.Component.add('studios_main', StudiosMain);
        Lampa.Component.add('studios_view', StudiosView);

        // Inject CSS: Wide cards + WHITE ICON FILTER
        if (!$('#studios-unified-css').length) {
            $('body').append(`
                <style id="studios-unified-css">
                    .studios_main .card--wide { width: 18.3em !important; }
                    .studios_view .card--wide { width: 18.3em !important; }
                    .studios_view .category-full { padding-top: 1em; }
                    .studios_icon { 
                        width: 100%; 
                        height: 100%; 
                        display: block; 
                        object-fit: contain;
                        filter: brightness(0) invert(1); 
                    }
                </style>
            `);
        }

        // Add Menu Buttons
        function addMenuButtons() {
            var menu = $('.menu .menu__list').eq(0);
            if (!menu.length) return;

            Object.keys(SERVICE_CONFIGS).forEach(function (sid) {
                var conf = SERVICE_CONFIGS[sid];
                if (menu.find('.menu__item[data-sid="' + sid + '"]').length) return;

                var btn = $(`<li class="menu__item selector" data-action="studios_action_${sid}" data-sid="${sid}">
                    <div class="menu__ico">${conf.icon}</div>
                    <div class="menu__text">${conf.title}</div>
                </li>`);

                btn.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: conf.title,
                        component: 'studios_main',
                        service_id: sid,
                        page: 1
                    });
                });

                menu.append(btn);
            });
        }

        if (window.appready) {
            addMenuButtons();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') addMenuButtons();
            });
        }

        setInterval(function () {
            if (window.appready && $('.menu .menu__list').eq(0).length) {
                addMenuButtons();
            }
        }, 3000);
    }

    if (!window.plugin_studios_master_v3_1_ready) startPlugin();
})();
