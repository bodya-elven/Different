(function () {
    'use strict';

    const CONFIG = {
        api_url: 'https://api.mdblist.com/tmdb/',
        cache_time: 60 * 60 * 24 * 7 * 1000, // Кеш на 7 днів
        cache_key: 'mdblists_ratings_cache',
        cache_limit: 500
    };

    // --- КЕШУВАННЯ ---
    class RatingsCache {
        static get() { return Lampa.Storage.cache(CONFIG.cache_key, CONFIG.cache_limit, {}); }
        static load(id) {
            const cache = this.get();
            const item = cache[id];
            if (item && (Date.now() - item.time < CONFIG.cache_time)) return item.data;
            return null;
        }
        static save(id, data) {
            const cache = this.get();
            cache[id] = { time: Date.now(), data };
            Lampa.Storage.set(CONFIG.cache_key, cache);
        }
    }

    // --- ОТРИМАННЯ ДАНИХ ---
    class MDBProvider {
        static fetch(movie, callback) {
            const apiKey = Lampa.Storage.get('mdblists_api_key', '');
            if (!apiKey || !movie.id) return callback(null);

            const type = movie.number_of_seasons ? 'show' : 'movie';
            const url = CONFIG.api_url + type + '/' + movie.id + '?apikey=' + apiKey;

            const req = new Lampa.Reguest();
            req.silent(url, (res) => {
                const result = {};
                if (res && res.ratings) {
                    res.ratings.forEach(r => {
                        if (r.source !== 'tmdb') result[r.source.toLowerCase()] = r.value;
                    });
                }
                callback(result);
            }, () => callback(null));
        }
    }

    // --- ВІДОБРАЖЕННЯ (Тільки рейтинги) ---
    function renderRatings(container, ratings) {
        container.find('.mdb-ratings-row').remove();
        if (!ratings || Object.keys(ratings).length === 0) return;

        const row = $('<div class="mdb-ratings-row" style="display: flex; gap: 15px; margin-top: 10px; font-weight: bold; font-size: 1.1em;"></div>');
        const colors = { imdb: '#f5c518', tomatoes: '#fa320a', metacritic: '#333', letterboxd: '#00e676' };

        const enabled = Lampa.Storage.get('mdblists_sources', ['imdb', 'tomatoes']);

        Object.keys(ratings).forEach(key => {
            if (enabled.includes(key)) {
                const color = colors[key] || '#fff';
                row.append(`<span style="color: ${color}">${key.toUpperCase()}: ${ratings[key]}</span>`);
            }
        });

        container.append(row);
    }

    // --- НАЛАШТУВАННЯ ---
    function initSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'mdblist_only',
            name: 'Рейтинги MDBList',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/></svg>'
        });

        Lampa.Component.add('mdblist_only', function (object, exam) {
            this.create = function () {
                var gui = new Lampa.Settings.Gui();
                gui.create(exam);
                return gui.render();
            };
        });

        Lampa.SettingsApi.addParam({
            component: 'mdblist_only',
            param: { name: 'mdblists_api_key', type: 'input', default: '' },
            field: { name: 'API-ключ MDBList', description: 'Введіть ключ з сайту mdblist.com' }
        });

        Lampa.SettingsApi.addParam({
            component: 'mdblist_only',
            param: {
                name: 'mdblists_sources',
                type: 'select',
                multiple: true,
                values: { imdb: 'IMDb', tomatoes: 'Rotten Tomatoes', metacritic: 'Metacritic', letterboxd: 'Letterboxd' },
                default: ['imdb', 'tomatoes']
            },
            field: { name: 'Джерела рейтингів' }
        });
    }

    // --- СТАРТ ---
    function start() {
        initSettings();
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                const container = e.object.find('.full-start__title');
                const cached = RatingsCache.load(e.data.movie.id);
                
                if (cached) renderRatings(container, cached);
                else MDBProvider.fetch(e.data.movie, (data) => {
                    if (data) {
                        RatingsCache.save(e.data.movie.id, data);
                        renderRatings(container, data);
                    }
                });
            }
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') start(); });
})();
    class MDBListProvider {
        static fetch(movie, callback) {
            const apiKey = Lampa.Storage.get('mdblists_api_key', '');
            if (!apiKey || !movie || !movie.id) return callback(null);
            const type = movie.number_of_seasons ? 'show' : 'movie';
            const url  = `https://api.mdblist.com/tmdb/${type}/${movie.id}?apikey=${apiKey}`;
            const req = new Lampa.Reguest();
            req.timeout(RATINGS_CONFIG.requestTimeout);
            req.silent(url, (json) => { callback(this.parse(json)); }, () => callback(null), false, { dataType: 'json' });
        }
        static parse(response) {
            const enabled = Lampa.Storage.get('mdblists_sources', ['imdb']);
            const result = { logo: response.logo || null, ratings: {} };
            if (response && response.ratings) {
                response.ratings.forEach(r => {
                    const key = (r.source || '').toLowerCase();
                    if (enabled.includes(key)) result.ratings[key] = r.value;
                });
            }
            return result;
        }
    }

    // --- РЕНДЕР ---
    function render(container, data) {
        if (!data) return;
        container.find('.mdb-ext').remove();
        if (data.logo) {
            container.find('.full-start__title-text').hide();
            container.prepend(`<img class="mdb-ext" src="${data.logo}" style="max-height: 100px; margin-bottom: 15px; display: block; border: none;">`);
        }
        if (data.ratings && Object.keys(data.ratings).length > 0) {
            let row = $('<div class="mdb-ext" style="display: flex; gap: 15px; margin-top: 10px; font-weight: bold; font-size: 1.2em; color: #fff;"></div>');
            Object.keys(data.ratings).forEach(k => {
                row.append(`<span>${k.toUpperCase()}: ${data.ratings[k]}</span>`);
            });
            container.append(row);
        }
    }

    // --- РЕЄСТРАЦІЯ КОМПОНЕНТА (ФІКС ПОМИЛКИ) ---
    Lampa.Component.add(PLUGIN_KEY, function (object, exam) {
        var gui = new Lampa.Settings.Gui();
        
        this.create = function () {
            this.activity.loader(true); // Показуємо завантаження
            gui.create(exam);
            this.activity.loader(false);
            return gui.render();
        };

        this.render = function () {
            return gui.render();
        };
    });

    // --- НАЛАШТУВАННЯ ---
    function initSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_KEY,
            name: PLUGIN_NAME,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: { name: 'mdblists_api_key', type: 'input', placeholder: 'MDBList API key', default: '' },
            field: { name: 'API-ключ MDBList' }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: {
                name: 'mdblists_sources',
                type: 'select',
                multiple: true,
                values: { imdb: 'IMDb', metacritic: 'Metacritic', tomatoes: 'Rotten Tomatoes', popcorn: 'Audience', letterboxd: 'Letterboxd' },
                default: ['imdb']
            },
            field: { name: 'Джерела рейтингів' }
        });
    }

    // --- СТАРТ ---
    function startPlugin() {
        initSettings();
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                const container = e.object.find('.full-start__title');
                const cached = RatingsCache.load(e.data.movie.id);
                if (cached) render(container, cached);
                else MDBListProvider.fetch(e.data.movie, (d) => { if (d) { RatingsCache.save(e.data.movie.id, d); render(container, d); } });
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });

})();
    class MDBListProvider {
        static fetch(movie, callback) {
            const apiKey = Lampa.Storage.get('mdblists_api_key', '');
            if (!apiKey || !movie || !movie.id) return callback(null);
            const type = movie.number_of_seasons ? 'show' : 'movie';
            const url  = `https://api.mdblist.com/tmdb/${type}/${movie.id}?apikey=${apiKey}`;
            const req = new Lampa.Reguest();
            req.timeout(RATINGS_CONFIG.requestTimeout);
            req.silent(url, (json) => { callback(this.parse(json)); }, () => callback(null), false, { dataType: 'json' });
        }
        static parse(response) {
            const enabled = Lampa.Storage.get('mdblists_sources', ['imdb']);
            const result = { logo: response.logo || null, ratings: {} };
            if (response && response.ratings) {
                response.ratings.forEach(r => {
                    const key = (r.source || '').toLowerCase();
                    if (enabled.includes(key)) result.ratings[key] = r.value;
                });
            }
            return result;
        }
    }

    // --- РЕНДЕР ---
    function render(container, data) {
        if (!data) return;
        container.find('.mdb-ext').remove();
        if (data.logo) {
            container.find('.full-start__title-text').hide();
            container.prepend(`<img class="mdb-ext" src="${data.logo}" style="max-height: 100px; margin-bottom: 15px; display: block; border: none;">`);
        }
        if (data.ratings && Object.keys(data.ratings).length > 0) {
            let row = $('<div class="mdb-ext" style="display: flex; gap: 15px; margin-top: 10px; font-weight: bold; font-size: 1.2em; color: #fff;"></div>');
            Object.keys(data.ratings).forEach(k => {
                row.append(`<span>${k.toUpperCase()}: ${data.ratings[k]}</span>`);
            });
            container.append(row);
        }
    }

    // --- РЕЄСТРАЦІЯ КОМПОНЕНТА (ФІКС ПОМИЛКИ) ---
    Lampa.Component.add(PLUGIN_KEY, function (object, exam) {
        var gui = new Lampa.Settings.Gui();
        
        this.create = function () {
            this.activity.loader(true); // Показуємо завантаження
            gui.create(exam);
            this.activity.loader(false);
            return gui.render();
        };

        this.render = function () {
            return gui.render();
        };
    });

    // --- НАЛАШТУВАННЯ ---
    function initSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_KEY,
            name: PLUGIN_NAME,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: { name: 'mdblists_api_key', type: 'input', placeholder: 'MDBList API key', default: '' },
            field: { name: 'API-ключ MDBList' }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: {
                name: 'mdblists_sources',
                type: 'select',
                multiple: true,
                values: { imdb: 'IMDb', metacritic: 'Metacritic', tomatoes: 'Rotten Tomatoes', popcorn: 'Audience', letterboxd: 'Letterboxd' },
                default: ['imdb']
            },
            field: { name: 'Джерела рейтингів' }
        });
    }

    // --- СТАРТ ---
    function startPlugin() {
        initSettings();
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                const container = e.object.find('.full-start__title');
                const cached = RatingsCache.load(e.data.movie.id);
                if (cached) render(container, cached);
                else MDBListProvider.fetch(e.data.movie, (d) => { if (d) { RatingsCache.save(e.data.movie.id, d); render(container, d); } });
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });

})();
(function () {
    'use strict';

    const PLUGIN_NAME = 'Рейтинги MDBLists';
    const PLUGIN_KEY  = 'mdblists'; // Уніфікуємо ключ
    const VERSION     = '1.1.0';

    const RATINGS_CONFIG = {
        cacheKey: 'mdblists_ratings_cache',
        cacheLifetime: 7 * 24 * 60 * 60 * 1000, // Встановив тиждень, як ви хотіли раніше
        cacheLimit: 500,
        requestTimeout: 15000
    };

    /* Кешування та Провайдер залишаємо без змін (вони працюють) */
    class RatingsCache {
        static get() { return Lampa.Storage.cache(RATINGS_CONFIG.cacheKey, RATINGS_CONFIG.cacheLimit, {}); }
        static load(id) {
            const cache = this.get();
            const item = cache[id];
            if (!item) return null;
            if (Date.now() - item.time > RATINGS_CONFIG.cacheLifetime) {
                delete cache[id];
                Lampa.Storage.set(RATINGS_CONFIG.cacheKey, cache);
                return null;
            }
            return item.data;
        }
        static save(id, data) {
            const cache = this.get();
            cache[id] = { time: Date.now(), data };
            Lampa.Storage.set(RATINGS_CONFIG.cacheKey, cache);
        }
    }

    class MDBListProvider {
        static fetch(movie, callback) {
            const apiKey = Lampa.Storage.get('mdblists_api_key', '');
            if (!apiKey || !movie || !movie.id) return callback({});
            const type = movie.number_of_seasons ? 'show' : 'movie';
            const url  = `https://api.mdblist.com/tmdb/${type}/${movie.id}?apikey=${apiKey}`;
            const req = new Lampa.Reguest();
            req.timeout(RATINGS_CONFIG.requestTimeout);
            req.silent(url, (json) => { callback(this.parse(json)); }, () => callback({}), false, { dataType: 'json' });
        }
        static parse(response) {
            const enabled = Lampa.Storage.get('mdblists_sources', ['imdb']);
            const result = { logo: response.logo || null, ratings: {} };
            if (!response || !response.ratings) return result;
            response.ratings.forEach(r => {
                const key = (r.source || '').toLowerCase();
                if (enabled.includes(key)) {
                    result.ratings[key] = r.value;
                }
            });
            return result;
        }
    }

    /* РЕЄСТРАЦІЯ КОМПОНЕНТА (ВИПРАВЛЕННЯ ПУСТОГО МЕНЮ) */
    Lampa.Component.add(PLUGIN_KEY, function (object, exam) {
        this.create = function () {
            // Gui створює список параметрів, які ми зареєстрували через addParam
            var gui = new Lampa.Settings.Gui();
            gui.create(exam); 
            return gui.render();
        };
        
        this.prepare = function () {
            // Потрібно для коректного завантаження
        };
    });

    /* НАЛАШТУВАННЯ */
    function initSettings() {
        // Додаємо сам розділ у список налаштувань
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_KEY,
            name: PLUGIN_NAME,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: {
                name: 'mdblists_api_key',
                type: 'input',
                placeholder: 'MDBList API key',
                default: ''
            },
            field: { name: 'API-ключ MDBList' }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: {
                name: 'mdblists_sources',
                type: 'select',
                multiple: true,
                values: {
                    imdb: 'IMDb',
                    metacritic: 'Metacritic',
                    tomatoes: 'Rotten Tomatoes',
                    popcorn: 'Audience',
                    letterboxd: 'Letterboxd'
                },
                default: ['imdb']
            },
            field: { name: 'Джерела рейтингів' }
        });
    }

    /* ЗАПУСК */
    function startPlugin() {
        initSettings();
        
        // Тут ваша логіка відображення у картці фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                const movie = e.data.movie;
                const container = e.object.find('.full-start__title');
                
                const cached = RatingsCache.load(movie.id);
                if (cached) render(container, cached);
                else {
                    MDBListProvider.fetch(movie, (data) => {
                        RatingsCache.save(movie.id, data);
                        render(container, data);
                    });
                }
            }
        });
    }

    function render(container, data) {
        if (!data) return;
        container.find('.mdb-ext').remove();
        
        if (data.logo) {
            container.find('.full-start__title-text').hide();
            container.prepend(`<img class="mdb-ext" src="${data.logo}" style="max-height: 100px; margin-bottom: 15px; display: block;">`);
        }
        
        if (data.ratings && Object.keys(data.ratings).length > 0) {
            let row = $('<div class="mdb-ext" style="display: flex; gap: 15px; margin-top: 10px; font-weight: bold;"></div>');
            Object.keys(data.ratings).forEach(k => {
                row.append(`<span>${k.toUpperCase()}: ${data.ratings[k]}</span>`);
            });
            container.append(row);
        }
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });

})();
