// == Movie Logos & Extended Ratings (ERL) ==
(function () {
    'use strict';

    const ERL_VERSION = '1.6.0';

    // --- Конфігурація ---
    const CONFIG = {
        api_url: 'https://api.mdblist.com/tmdb/',
        cache_time: 60 * 60 * 24 * 7 * 1000, // Рівно 7 днів (тиждень)
        cache_key: 'erl_ratings_cache',
        cache_limit: 500,
        request_timeout: 10000
    };

    // --- Переклади ---
    if (window.Lampa && Lampa.Lang) {
        Lampa.Lang.add({
            erl_title: { uk: 'Рейтинги та Логотипи', ru: 'Рейтинги и Логотипы', en: 'Ratings & Logos' },
            erl_mdblist_key: { uk: 'MDBList API Ключ', ru: 'MDBList API Ключ', en: 'MDBList API Key' },
            erl_show_logo: { uk: 'Показувати логотип', ru: 'Показывать логотип', en: 'Show Logo' },
            erl_logo_height: { uk: 'Висота логотипу', ru: 'Высота логотипа', en: 'Logo Height' }
        });
    }

    // --- Система кешування (7 днів) ---
    class CacheManager {
        static get(id) {
            if (!window.Lampa || !Lampa.Storage) return null;
            let cache = Lampa.Storage.cache(CONFIG.cache_key, CONFIG.cache_limit, {});
            let entry = cache[id];
            
            if (entry && (Date.now() - entry.timestamp < CONFIG.cache_time)) {
                return entry.data;
            }
            return null;
        }
        static set(id, data) {
            if (!window.Lampa || !Lampa.Storage) return;
            let cache = Lampa.Storage.cache(CONFIG.cache_key, CONFIG.cache_limit, {});
            cache[id] = { 
                timestamp: Date.now(), 
                data: data 
            };
            Lampa.Storage.set(CONFIG.cache_key, cache);
        }
    }

    // --- Провайдер MDBList ---
    class MDBList {
        static fetch(movie, callback) {
            let key = Lampa.Storage.get('erl_mdblist_key', '');
            if (!key) return callback(null);
            
            let type = movie.number_of_seasons ? 'show' : 'movie';
            let url = CONFIG.api_url + type + '/' + movie.id + '?apikey=' + key;
            
            let network = new Lampa.Reguest();
            network.timeout(CONFIG.request_timeout);
            network.silent(url, (res) => {
                let result = { 
                    logo: res.logo || null, 
                    ratings: {} 
                };
                if (res.ratings && Array.isArray(res.ratings)) {
                    res.ratings.forEach(r => {
                        let source = r.source.toLowerCase().trim();
                        // Беремо всі доступні рейтинги крім tmdb (бо він і так є в Лампі)
                        if (source !== 'tmdb') {
                            result.ratings[source] = r.value;
                        }
                    });
                }
                callback(result);
            }, () => callback(null));
        }
    }

    // --- Налаштування ---
    function setupSettings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'erl_settings',
            name: Lampa.Lang.translate('erl_title'),
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'erl_settings',
            param: { name: 'erl_mdblist_key', type: 'input', default: '' },
            field: { name: Lampa.Lang.translate('erl_mdblist_key'), description: 'Введіть API ключ з сайту mdblist.com' }
        });

        Lampa.SettingsApi.addParam({
            component: 'erl_settings',
            param: {
                name: 'erl_logo_height',
                type: 'select',
                values: { '60': '60px', '80': '80px', '100': '100px', '120': '120px', '150': '150px' },
                default: '100'
            },
            field: { name: Lampa.Lang.translate('erl_logo_height') }
        });
    }

    // --- Рендеринг ---
    function renderERL(container, data) {
        if (!data) return;

        // Видаляємо старі елементи плагіна, якщо вони є (при перемиканні)
        container.find('.erl-element').remove();

        // 1. Логотип
        if (data.logo) {
            let height = Lampa.Storage.get('erl_logo_height', '100');
            let logoImg = $(`<img class="erl-element erl-logo" src="${data.logo}" style="max-height: ${height}px; margin-bottom: 15px; display: block; outline: none;">`);
            
            // Ховаємо текстовий заголовок і додаємо лого
            container.find('.full-start__title-text').hide(); 
            container.prepend(logoImg);
        }

        // 2. Рейтинги
        if (data.ratings && Object.keys(data.ratings).length > 0) {
            let ratingsRow = $('<div class="erl-element erl-ratings" style="display: flex; gap: 15px; margin-top: 10px; font-weight: bold; font-size: 1.2em;"></div>');
            
            const styles = {
                imdb: { label: 'IMDb', color: '#f5c518' },
                tomatoes: { label: 'RT', color: '#fa320a' },
                metacritic: { label: 'MC', color: '#333' },
                letterboxd: { label: 'LB', color: '#00e676' }
            };

            Object.keys(data.ratings).forEach(key => {
                let style = styles[key] || { label: key.toUpperCase(), color: '#fff' };
                ratingsRow.append(`<span style="color: ${style.color}">${style.label}: ${data.ratings[key]}</span>`);
            });

            container.append(ratingsRow);
        }
    }

    // --- Ініціалізація ---
    function startPlugin() {
        setupSettings();

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                let movie = e.data.movie;
                let container = e.object.find('.full-start__title');
                
                // Перевірка кешу
                let cached = CacheManager.get(movie.id);
                if (cached) {
                    renderERL(container, cached);
                } else {
                    MDBList.fetch(movie, (data) => {
                        if (data) {
                            CacheManager.set(movie.id, data);
                            renderERL(container, data);
                        }
                    });
                }
            }
        });
    }

    // Запуск при готовності
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
