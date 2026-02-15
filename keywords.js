(function () {
    'use strict';

    function TMDBKeywords() {
        var _this = this;

        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var html = e.object.activity.render();
                    var card_data = e.data.movie;
                    
                    console.log('[TMDB Tags] Card opened:', card_data.title || card_data.name);

                    // Перевірка джерела та наявності ID
                    if ((e.data.source == 'tmdb' || card_data.source == 'tmdb') && card_data.id) {
                        _this.getKeywords(html, card_data);
                    } else {
                        console.log('[TMDB Tags] Not TMDB source or no ID');
                    }
                }
            });

            // Стилі
            var style = document.createElement('style');
            style.innerHTML = `
                .tmdb-keywords-list { padding: 0 1.2em; margin-top: 0.8em; display: flex; flex-wrap: wrap; gap: 0.6em; }
                .tmdb-keyword-item { background-color: rgba(255, 255, 255, 0.15); padding: 0.4em 0.8em; border-radius: 0.4em; font-size: 0.9em; cursor: pointer; transition: background-color 0.2s; color: #ccc; white-space: nowrap; }
                .tmdb-keyword-item.focus { background-color: #fff; color: #000; }
                .tmdb-keywords-title { padding: 0 1.2em; margin-top: 1.2em; font-size: 1em; font-weight: bold; opacity: 0.7; }
            `;
            document.head.appendChild(style);
        };

        this.getKeywords = function (html, data) {
            var method = (data.original_name || data.name) ? 'tv' : 'movie';
            var url = method + '/' + data.id + '/keywords';

            console.log('[TMDB Tags] Requesting:', url);

            Lampa.TMDB.get(url, function (resp) {
                var keywords = resp.keywords || resp.results || [];
                console.log('[TMDB Tags] Found tags:', keywords.length);

                if (keywords.length > 0) {
                    _this.renderKeywords(html, keywords, method);
                }
            }, function (err) {
                console.log('[TMDB Tags] API Error:', err);
            });
        };

        this.renderKeywords = function (html, keywords, method) {
            // Створюємо блок
            var container = $('<div class="tmdb-keywords-block"></div>');
            var title = $('<div class="tmdb-keywords-title">Теги</div>');
            var list = $('<div class="tmdb-keywords-list"></div>');

            keywords.forEach(function (tag) {
                var item = $('<div class="tmdb-keyword-item selector">' + tag.name + '</div>');
                
                // Обробник натискання (універсальний)
                item.on('hover:enter click', function () {
                    Lampa.Activity.push({
                        url: 'discover/' + method + '?with_keywords=' + tag.id,
                        title: 'Тег: ' + tag.name,
                        component: 'category_full',
                        source: 'tmdb',
                        page: 1
                    });
                });

                list.append(item);
            });

            container.append(title);
            container.append(list);

            // === ПОШУК МІСЦЯ ДЛЯ ВСТАВКИ ===
            
            // 1. Спробуємо знайти блок кнопок (стандартний скін)
            var buttons = html.find('.full-start-new__buttons, .full-start__buttons');
            
            // 2. Якщо не знайшли, шукаємо опис (часто на мобільних)
            if (!buttons.length) {
                buttons = html.find('.full-start__description');
                console.log('[TMDB Tags] Buttons not found, appending after description');
            } else {
                console.log('[TMDB Tags] Buttons found, appending after buttons');
            }

            // 3. Якщо і опису немає, додаємо в кінець картки
            if (!buttons.length) {
                 html.find('.full-start__body').append(container);
                 console.log('[TMDB Tags] Appending to body end');
            } else {
                buttons.after(container);
            }
            
            // Оновлюємо контролер, щоб пульт побачив нові елементи
            Lampa.Controller.toggle('full_start');
        };
    }

    if (!window.plugin_tmdb_keywords) {
        window.plugin_tmdb_keywords = new TMDBKeywords();
        window.plugin_tmdb_keywords.init();
        console.log('[TMDB Tags] Plugin loaded v2');
    }
})();
