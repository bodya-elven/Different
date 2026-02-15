(function () {
    'use strict';

    function TMDBKeywords() {
        var _this = this;

        // Локалізація
        if (Lampa.Lang) {
            Lampa.Lang.add({
                tmdb_keywords: {
                    en: 'Tags',
                    uk: 'Теги',
                    ru: 'Теги'
                },
                tmdb_keywords_popular: {
                    en: 'Popular',
                    uk: 'Популярні',
                    ru: 'Популярные'
                },
                tmdb_keywords_new: {
                    en: 'New Releases',
                    uk: 'Новинки',
                    ru: 'Новинки'
                },
                tmdb_keywords_top: {
                    en: 'Top Rated',
                    uk: 'Високий рейтинг',
                    ru: 'Высокий рейтинг'
                }
            });
        }

        this.init = function () {
            if (!Lampa.Listener) return;

            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var card = e.data.movie;
                    if (card && (card.source == 'tmdb' || e.data.source == 'tmdb') && card.id) {
                        var render = e.object.activity.render();
                        _this.getKeywords(render, card);
                    }
                }
            });

            // Стилі
            var style = document.createElement('style');
            style.innerHTML = `
                .keywords-icon-img { width: 1.6em; height: 1.6em; object-fit: contain; display: block; filter: invert(1); }
                .button--keywords { display: flex; align-items: center; justify-content: center; gap: 0.4em; }
                @media screen and (max-width: 768px) {
                    .button--keywords { padding: 0.5em !important; }
                }
            `;
            document.head.appendChild(style);
        };

        this.getKeywords = function (html, card) {
            var method = (card.original_name || card.name) ? 'tv' : 'movie';
            // Запитуємо теги з мовою (хоча TMDB часто віддає англ)
            var lang = Lampa.Storage.get('language', 'uk');
            var url = Lampa.TMDB.api(method + '/' + card.id + '/keywords?api_key=' + Lampa.TMDB.key() + '&language=' + lang);

            $.ajax({
                url: url,
                dataType: 'json',
                async: true,
                success: function (resp) {
                    var tags = resp.keywords || resp.results || [];
                    if (tags.length > 0) {
                        // Спочатку перекладаємо, потім малюємо
                        _this.translateTags(tags, function(translatedTags) {
                            _this.renderButton(html, translatedTags, method);
                        });
                    }
                },
                error: function () {}
            });
        };

        // Автопереклад (Google)
        this.translateTags = function (tags, callback) {
            var lang = Lampa.Storage.get('language', 'uk');
            if (lang == 'en') { callback(tags); return; }

            var originalNames = tags.map(function(t) { return t.name; });
            var textToTranslate = originalNames.join(' ||| '); 
            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + lang + '&dt=t&q=' + encodeURIComponent(textToTranslate);

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (result) {
                    try {
                        var translatedText = '';
                        if (result && result[0]) {
                            result[0].forEach(function(item) {
                                if (item[0]) translatedText += item[0];
                            });
                        }
                        var translatedArray = translatedText.split('|||');
                        tags.forEach(function(tag, index) {
                            if (translatedArray[index]) tag.name = translatedArray[index].trim();
                        });
                        callback(tags);
                    } catch (e) { callback(tags); }
                },
                error: function () { callback(tags); }
            });
        };

        this.renderButton = function (html, tags, method) {
            var container = html.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length) {
                var btn = html.find('.button--play, .button--trailer, .full-start__button').first();
                if (btn.length) container = btn.parent();
            }
            if (!container.length || container.find('.button--keywords').length) return;

            var title = Lampa.Lang.translate('tmdb_keywords');
            var icon = '<img src="https://bodya-elven.github.io/Different/tag.svg" class="keywords-icon-img" />';
            var button = $('<div class="full-start__button selector view--category button--keywords">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                // Відкриваємо список тегів
                var items = tags.map(function(tag) {
                    return { 
                        title: tag.name, 
                        tag_data: tag // Зберігаємо весь об'єкт тегу
                    };
                });

                Lampa.Select.show({
                    title: title, 
                    items: items,
                    onSelect: function (selectedItem) {
                        // Коли вибрали тег, показуємо меню сортування (Як у Networks)
                        _this.showSortMenu(selectedItem.tag_data, method);
                    }
                });
            });

            container.append(button);
            Lampa.Controller.toggle('full_start');
        };

        // Меню вибору сортування (Популярні / Новинки / Рейтинг)
        this.showSortMenu = function(tag, method) {
            var menu = [
                {
                    title: Lampa.Lang.translate('tmdb_keywords_popular'),
                    sort: 'popularity.desc'
                },
                {
                    title: Lampa.Lang.translate('tmdb_keywords_new'),
                    sort: (method == 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc')
                },
                {
                    title: Lampa.Lang.translate('tmdb_keywords_top'),
                    sort: 'vote_average.desc',
                    params: '&vote_count.gte=100' // Фільтр, щоб прибрати фільми з 1 голосом
                }
            ];

            Lampa.Select.show({
                title: tag.name,
                items: menu,
                onSelect: function(sortItem) {
                    // Формуємо фінальне посилання
                    var url = 'discover/' + method + '?with_keywords=' + tag.id + '&sort_by=' + sortItem.sort;
                    
                    if(sortItem.params) url += sortItem.params;

                    Lampa.Activity.push({ 
                        url: url, 
                        title: tag.name + ' - ' + sortItem.title, 
                        component: 'category_full', 
                        source: 'tmdb', 
                        page: 1 
                    });
                }
            });
        };
    }

    if (!window.plugin_tmdb_keywords_smart) {
        window.plugin_tmdb_keywords_smart = new TMDBKeywords();
        window.plugin_tmdb_keywords_smart.init();
    }
})();
