(function () {
    'use strict';

    function TMDBKeywordsButton() {
        var _this = this;

        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var html = e.object.activity.render();
                    var card_data = e.data.movie;

                    // Перевіряємо, чи це TMDB і чи є ID
                    if (card_data.id) {
                        _this.getKeywords(html, card_data);
                    }
                }
            });
        };

        this.getKeywords = function (html, data) {
            var method = (data.original_name || data.name) ? 'tv' : 'movie';
            var url = method + '/' + data.id + '/keywords';

            Lampa.TMDB.get(url, function (resp) {
                // Отримуємо список тегів
                var tags = resp.keywords || resp.results || [];

                if (tags.length > 0) {
                    _this.renderButton(html, tags, method);
                }
            }, function (err) {
                console.log('TMDB Keywords Error:', err);
            });
        };

        this.renderButton = function (html, tags, method) {
            // Знаходимо блок кнопок
            var buttons = html.find('.full-start-new__buttons, .full-start__buttons');

            if (buttons.length) {
                // Створюємо кнопку в стилі Lampa
                // SVG іконка (можна замінити на будь-яку іншу всередині тегу <svg>)
                var icon = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7V17C4 19 6 20 8 20H16C18 20 20 19 20 17V7C20 5 18 4 16 4H8C6 4 4 5 4 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                
                var button = $(
                    '<div class="full-start__button selector view--category">' +
                        icon +
                        '<span>Теги</span>' +
                    '</div>'
                );

                // Додаємо дію при натисканні
                button.on('hover:enter click', function () {
                    // Формуємо масив для меню Lampa
                    var items = tags.map(function (tag) {
                        return {
                            title: tag.name,
                            id: tag.id,
                            url: 'discover/' + method + '?with_keywords=' + tag.id
                        };
                    });

                    // Відкриваємо меню вибору
                    Lampa.Select.show({
                        title: 'Теги',
                        items: items,
                        onSelect: function (item) {
                            Lampa.Activity.push({
                                url: item.url,
                                title: 'Тег: ' + item.title,
                                component: 'category_full',
                                source: 'tmdb',
                                page: 1
                            });
                        }
                    });
                });

                // Додаємо кнопку в кінець списку
                buttons.append(button);

                // Оновлюємо навігацію (щоб пульт побачив нову кнопку)
                Lampa.Controller.toggle('full_start');
            }
        };
    }

    if (!window.plugin_tmdb_keywords_btn) {
        window.plugin_tmdb_keywords_btn = new TMDBKeywordsButton();
        window.plugin_tmdb_keywords_btn.init();
    }
})();
