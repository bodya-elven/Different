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
                        _this.getKeywords(render, card);
                    }
                }
            });

            var style = document.createElement('style');
            style.innerHTML = `
                .keywords-icon-img { width: 1.6em; height: 1.6em; object-fit: contain; display: block; filter: invert(1); }
                .button--keywords { display: flex; align-items: center; justify-content: center; gap: 0.4em; }
            `;
            document.head.appendChild(style);
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
                            _this.renderButton(render, translatedTags);
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

        this.renderButton = function (render, tags) {
            var container = render.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length) return;

            // Видаляємо стару кнопку, щоб не дублювалася
            container.find('.button--keywords').remove();

            var title = Lampa.Lang.translate('plugin_keywords_title');
            var icon = '<img src="' + ICON_TAG + '" class="keywords-icon-img" />';
            
            // Важливо: додаємо клас selector
            var btn = $('<div class="full-start__button selector view--category button--keywords">' + icon + '<span>' + title + '</span></div>');

            btn.on('hover:enter click', function () {
                var controllerName = Lampa.Controller.enabled().name;
                
                var items = tags.map(function(tag) {
                    var niceName = tag.name.charAt(0).toUpperCase() + tag.name.slice(1);
                    return { title: niceName, tag_data: tag };
                });

                Lampa.Select.show({
                    title: title, 
                    items: items,
                    onSelect: function (selectedItem) {
                        _this.showTypeMenu(selectedItem.tag_data);
                    },
                    onBack: function() {
                        // ТУТ КЛЮЧОВИЙ МОМЕНТ:
                        // 1. Повертаємо ім'я попереднього контролера
                        Lampa.Controller.toggle(controllerName);
                        // 2. Примусово ставимо фокус на кнопку (btn) всередині картки (render)
                        Lampa.Controller.collectionFocus(btn, render);
                    }
                });
            });

            container.append(btn);
            
            // Оновлюємо активність, щоб нова кнопка зареєструвалася в навігації
            if (Lampa.Activity.active().activity.toggle) {
                Lampa.Activity.active().activity.toggle();
            }
        };

        this.showTypeMenu = function(tag) {
            var menu = [
                { title: Lampa.Lang.translate('plugin_keywords_movies'), method: 'movie' },
                { title: Lampa.Lang.translate('plugin_keywords_tv'), method: 'tv' }
            ];

            Lampa.Select.show({
                title: tag.name, 
                items: menu,
                onSelect: function(item) {
                    Lampa.Activity.push({ 
                        url: 'discover/' + item.method + '?with_keywords=' + tag.id + '&sort_by=popularity.desc', 
                        title: tag.name + ' - ' + item.title, 
                        component: 'category_full', 
                        source: 'tmdb', 
                        page: 1 
                    });
                },
                onBack: function() {
                    // При поверненні з підменю (фільм/серіал) повертаємося до списку тегів
                    Lampa.Controller.toggle('select'); 
                }
            });
        };
    }

    if (!window.plugin_keywords_instance) {
        window.plugin_keywords_instance = new KeywordsPlugin();
        window.plugin_keywords_instance.init();
    }
})();
