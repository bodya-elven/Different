(function () {
    'use strict';

    function KeywordsPlugin() {
        var _this = this;
        var ICON_TAG = 'https://bodya-elven.github.io/Different/tag.svg';

        if (Lampa.Lang) {
            Lampa.Lang.add({
                plugin_keywords_title: { en: 'Tags', uk: 'Теги' },
                plugin_keywords_movies: { en: 'Movies', uk: 'Фільми' },
                plugin_keywords_tv: { en: 'TV Series', uk: 'Серіали' }
            });
        }

        this.init = function () {
            if (!Lampa.Listener) return;

            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'complete') {
                    var card = e.data.movie;
                    if (card && (card.source == 'tmdb' || e.data.source == 'tmdb') && card.id) {
                        var render = e.object.activity.render();
                        // 1. Спочатку малюємо пусту кнопку-заглушку, щоб зайняти місце
                        _this.drawPlaceholder(render);
                        // 2. Потім вантажимо дані
                        _this.getKeywords(render, card);
                    }
                }
            });

            $('<style>').prop('type', 'text/css').html(
                '.keywords-icon-img { width: 1.4em; height: 1.4em; object-fit: contain; filter: invert(1); margin-right: 0.5em; } ' +
                '.button--keywords { display: none; align-items: center; } ' + // Спочатку display: none
                '.button--keywords.visible { display: flex; }' // Показуємо тільки коли готові
            ).appendTo('head');
        };

        // Функція створення кнопки-заглушки в правильному місці
        this.drawPlaceholder = function (render) {
            var container = render.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length || container.find('.button--keywords').length) return;

            var title = Lampa.Lang.translate('plugin_keywords_title');
            var btn = $('<div class="full-start__button selector button--keywords"><img src="' + ICON_TAG + '" class="keywords-icon-img" /><span>' + title + '</span></div>');

            // Спроба вставити кнопку ПЕРЕД закладками (book) або лайком, щоб вона була на місці "дірки"
            var bookmarkBtn = container.find('.button--book, .button--like').first();
            if (bookmarkBtn.length) {
                bookmarkBtn.before(btn);
            } else {
                container.append(btn);
            }
        };

        this.getKeywords = function (render, card) {
            var method = (card.original_name || card.name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '/keywords?api_key=' + Lampa.TMDB.key());

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (resp) {
                    var tags = resp.keywords || resp.results || [];
                    if (tags.length > 0) {
                        _this.translateTags(tags, function(translatedTags) {
                            _this.activateButton(render, translatedTags);
                        });
                    }
                }
            });
        };

        this.translateTags = function (tags, callback) {
            var lang = Lampa.Storage.get('language', 'uk');
            if (lang !== 'uk') return callback(tags);

            var tagsWithContext = tags.map(function(t) { return "Movie tag: " + t.name; });
            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=uk&dt=t&q=' + encodeURIComponent(tagsWithContext.join(' ||| '));

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (result) {
                    try {
                        var translatedText = '';
                        if (result && result[0]) result[0].forEach(function(item) { if (item[0]) translatedText += item[0]; });
                        var translatedArray = translatedText.split('|||');
                        tags.forEach(function(tag, index) {
                            if (translatedArray[index]) {
                                tag.name = translatedArray[index]
                                    .replace(/тег до фільму[:\s]*/gi, '')
                                    .replace(/тег фільму[:\s]*/gi, '')
                                    .replace(/movie tag[:\s]*/gi, '')
                                    .replace(/^[:\s\-]*/, '')
                                    .trim();
                            }
                        });
                        callback(tags);
                    } catch (e) { callback(tags); }
                },
                error: function () { callback(tags); }
            });
        };

        this.activateButton = function (render, tags) {
            var btn = render.find('.button--keywords');
            if (!btn.length) return; // Якщо раптом заглушка зникла

            // Робимо кнопку видимою
            btn.addClass('visible');

            // Навішуємо події
            btn.on('hover:enter click', function () {
                _this.openTagsMenu(tags, btn, render);
            });

            // Оновлюємо навігацію, щоб пульт побачив нову кнопку
            if (Lampa.Activity.active().activity.toggle) {
                Lampa.Activity.active().activity.toggle();
            }
        };

        // Логіка відкриття меню винесена окремо для повторного використання (кнопка Назад)
        this.openTagsMenu = function(tags, btnElement, renderContainer) {
            var controllerName = Lampa.Controller.enabled().name;
            var items = tags.map(function(tag) {
                return { 
                    title: tag.name.charAt(0).toUpperCase() + tag.name.slice(1), 
                    tag_data: tag 
                };
            });

            Lampa.Select.show({
                title: Lampa.Lang.translate('plugin_keywords_title'),
                items: items,
                onSelect: function (selectedItem) {
                    _this.openTypeMenu(selectedItem.tag_data, tags, btnElement, renderContainer, controllerName);
                },
                onBack: function () {
                    // Виправлення для телефону: не чіпаємо фокус, якщо це тач-інтерфейс
                    if (!Lampa.Platform.is('android') || Lampa.Platform.is('tv')) {
                        Lampa.Controller.toggle(controllerName);
                        Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]);
                    }
                }
            });
        };

        // Меню вибору типу (Фільм/Серіал)
        this.openTypeMenu = function(tag, allTags, btnElement, renderContainer, prevController) {
            Lampa.Select.show({
                title: tag.name,
                items: [
                    { title: Lampa.Lang.translate('plugin_keywords_movies'), method: 'movie' },
                    { title: Lampa.Lang.translate('plugin_keywords_tv'), method: 'tv' }
                ],
                onSelect: function(item) {
                    Lampa.Activity.push({
                        url: 'discover/' + item.method + '?with_keywords=' + tag.id + '&sort_by=popularity.desc',
                        title: tag.name,
                        component: 'category_full',
                        source: 'tmdb',
                        page: 1
                    });
                },
                onBack: function() {
                    // ТУТ ВИПРАВЛЕННЯ: Повертаємося до списку всіх тегів
                    _this.openTagsMenu(allTags, btnElement, renderContainer);
                }
            });
        };
    }

    if (!window.plugin_keywords_instance) {
        window.plugin_keywords_instance = new KeywordsPlugin();
        window.plugin_keywords_instance.init();
    }
})();
