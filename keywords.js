(function () {
    'use strict';

    function TMDBKeywords() {
        var _this = this;

        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var html = e.object.activity.render();
                    var card_data = e.data.movie;
                    
                    // Перевіряємо, чи є ID і чи це TMDB
                    if (card_data.id) {
                        _this.getKeywords(html, card_data);
                    }
                }
            });

            // Стилі для кнопок-тегів
            var style = document.createElement('style');
            style.innerHTML = `
                .tmdb-tags-wrapper { margin: 1em 1.2em; }
                .tmdb-tags-label { font-size: 0.9em; opacity: 0.6; margin-bottom: 0.5em; }
                .tmdb-tags-list { display: flex; flex-wrap: wrap; gap: 0.5em; }
                .tmdb-tag-btn {
                    border: 2px solid rgba(255,255,255,0.1);
                    background-color: rgba(0,0,0,0.3);
                    border-radius: 0.5em;
                    padding: 0.4em 0.8em;
                    font-size: 0.9em;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #fff;
                }
                .tmdb-tag-btn:hover, .tmdb-tag-btn.focus {
                    background-color: #fff;
                    color: #000;
                    border-color: #fff;
                }
            `;
            document.head.appendChild(style);
        };

        this.getKeywords = function (html, data) {
            // Визначаємо тип: фільм чи серіал
            var method = (data.original_name || data.name) ? 'tv' : 'movie';
            var url = method + '/' + data.id + '/keywords';

            Lampa.TMDB.get(url, function (resp) {
                // API TMDB віддає 'keywords' для фільмів і 'results' для серіалів
                var tags = resp.keywords || resp.results || [];
                
                if (tags.length > 0) {
                    _this.render(html, tags, method);
                }
            }, function (err) {
                console.log('TMDB Tags Error:', err);
            });
        };

        this.render = function (html, tags, method) {
            var container = $('<div class="tmdb-tags-wrapper"></div>');
            var label = $('<div class="tmdb-tags-label">Теги:</div>');
            var list = $('<div class="tmdb-tags-list"></div>');

            tags.forEach(function (tag) {
                // Клас selector робить елемент видимим для пульта
                var item = $('<div class="tmdb-tag-btn selector">' + tag.name + '</div>');

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

            container.append(label);
            container.append(list);

            // === ГОЛОВНА ЗМІНА: КУДИ ВСТАВЛЯТИ ===
            
            // Шукаємо опис (текст). У різних скінах класи можуть відрізнятися.
            // Перебираємо найпопулярніші варіанти.
            var description_block = html.find('.full-start__description'); // Стандарт
            if (!description_block.length) description_block = html.find('.full-descr'); // Мобільні/Моди
            if (!description_block.length) description_block = html.find('.full-story'); // Інші скіни

            if (description_block.length) {
                // Вставляємо ПІСЛЯ опису
                description_block.after(container);
            } else {
                // Якщо опис не знайдено, вставляємо в кінець блоку інформації
                var body = html.find('.full-start__body');
                if(body.length) {
                    body.append(container);
                } else {
                    // Аварійний варіант - просто в кінець всього
                    html.append(container);
                }
            }
            
            // Оновлюємо навігацію пульта
            Lampa.Controller.toggle('full_start');
        };
    }

    if (!window.plugin_tmdb_keywords) {
        window.plugin_tmdb_keywords = new TMDBKeywords();
        window.plugin_tmdb_keywords.init();
    }
})();
