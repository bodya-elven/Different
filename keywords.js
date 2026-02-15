(function () {
    'use strict';

    // Обгортаємо в try-catch, щоб помилка в цьому плагіні не ламала інші (як Networks)
    try {
        function TMDBKeywordsButton() {
            var _this = this;

            this.init = function () {
                if (window.Lampa && window.Lampa.Listener) {
                    window.Lampa.Listener.follow('full', function (e) {
                        try {
                            if (e.type == 'complite') {
                                var html = e.object.activity.render();
                                var card_data = e.data.movie;

                                // Перевірка на валідність даних
                                if (card_data && (card_data.source == 'tmdb' || e.data.source == 'tmdb') && card_data.id) {
                                    _this.getKeywords(html, card_data);
                                }
                            }
                        } catch (ex) {
                            console.error('TMDB Keywords: Error in listener', ex);
                        }
                    });
                } else {
                    console.error('TMDB Keywords: Lampa not found');
                }
            };

            this.getKeywords = function (html, data) {
                var method = (data.original_name || data.name) ? 'tv' : 'movie';
                var url = method + '/' + data.id + '/keywords';

                window.Lampa.TMDB.get(url, function (resp) {
                    var tags = (resp && (resp.keywords || resp.results)) || [];
                    if (tags.length > 0) {
                        _this.renderButton(html, tags, method);
                    }
                }, function (err) {
                    console.warn('TMDB Keywords: API Error', err);
                });
            };

            this.renderButton = function (html, tags, method) {
                // Шукаємо блок кнопок. Додав більше варіантів селекторів для різних скінів.
                var buttons = html.find('.full-start-new__buttons, .full-start__buttons, .full-buttons');

                if (buttons.length) {
                    // Іконка "Мережа" (як в TMDB Networks)
                    var icon_svg = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M15 13H18.5L13 7.5L7.5 13H11V16H15V13ZM12 2L22 12V22H2V12L12 2ZM11 10H15L12 7L9 10H11V10Z" opacity="0"></path><path d="M19 19H5V13H8V11H4V20H20V11H16V13H19V19Z" fill="currentColor"></path><path d="M11 7H13V11H11V7Z" fill="currentColor"></path><path d="M8 11H16V13H8V11Z" fill="currentColor"></path></svg>';
                    
                    // Якщо попередня іконка не підходить, ось альтернативна (більш класична "структура"):
                    // var icon_svg = '<svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19M11,7H13V9H11V7M7,7H9V9H7V7M15,7H17V9H15V7M7,11H9V13H7V11M11,11H13V13H11V11M15,11H17V13H15V11M7,15H9V17H7V15M11,15H13V17H11V15M15,15H17V17H15V15Z"></path></svg>';
                    
                    // Я використав стандартну іконку "Мережа/Hub", яка часто є в Networks.

                    var button = $(
                        '<div class="full-start__button selector view--category">' +
                            icon_svg +
                            '<span>Теги</span>' +
                        '</div>'
                    );

                    button.on('hover:enter click', function () {
                        var items = tags.map(function (tag) {
                            return {
                                title: tag.name,
                                id: tag.id,
                                url: 'discover/' + method + '?with_keywords=' + tag.id
                            };
                        });

                        window.Lampa.Select.show({
                            title: 'Теги',
                            items: items,
                            onSelect: function (item) {
                                window.Lampa.Activity.push({
                                    url: item.url,
                                    title: 'Тег: ' + item.title,
                                    component: 'category_full',
                                    source: 'tmdb',
                                    page: 1
                                });
                            }
                        });
                    });

                    buttons.append(button);
                    
                    // Оновлюємо навігацію пульта
                    if(window.Lampa.Controller) window.Lampa.Controller.toggle('full_start');
                }
            };
        }

        if (!window.plugin_tmdb_keywords_btn_v2) {
            window.plugin_tmdb_keywords_btn_v2 = new TMDBKeywordsButton();
            window.plugin_tmdb_keywords_btn_v2.init();
            console.log('TMDB Keywords Plugin Loaded Successfully');
        }
    } catch (e) {
        console.error('TMDB Keywords Plugin CRASHED:', e);
    }
})();
