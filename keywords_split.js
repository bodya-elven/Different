(function () {
    'use strict';

    function TMDBKeywords() {
        var _this = this;

        if (Lampa.Lang) {
            Lampa.Lang.add({
                tmdb_keywords: {
                    en: 'Tags',
                    uk: 'Теги'
                }
            });
        }

        this.init = function () {
            if (!Lampa.Listener) return;

            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var card = e.data.movie;
                    if (card && (card.source == 'tmdb' || e.data.source == 'tmdb') && card.id) {
                        _this.getKeywords(e.object.activity.render(), card);
                    }
                }
            });

            var style = document.createElement('style');
            style.innerHTML = `
                .keywords-icon-img { 
                    width: 1.4em; 
                    height: 1.4em; 
                    object-fit: contain;
                    display: block;
                    filter: invert(1); 
                }
                .button--keywords { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 0.5em; 
                }
            `;
            document.head.appendChild(style);
        };

        this.getKeywords = function (html, card) {
            var method = (card.original_name || card.name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '/keywords?api_key=' + Lampa.TMDB.key());

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (resp) {
                    var tags = resp.keywords || resp.results || [];
                    if (tags.length > 0) {
                        _this.translateTags(tags, function(translatedTags) {
                            _this.renderButton(html, translatedTags);
                        });
                    }
                }
            });
        };

        this.translateTags = function (tags, callback) {
            var lang = Lampa.Storage.get('language', 'uk');
            if (lang !== 'uk') return callback(tags);

            var textToTranslate = tags.map(function(t) { return t.name; }).join(' ||| '); 
            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=uk&dt=t&q=' + encodeURIComponent(textToTranslate);

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (result) {
                    try {
                        var translatedText = '';
                        if (result && result[0]) {
                            result[0].forEach(function(item) { if (item[0]) translatedText += item[0]; });
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

        this.renderButton = function (html, tags) {
            var container = html.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length) {
                var btn = html.find('.button--play, .button--trailer, .full-start__button').first();
                if (btn.length) container = btn.parent();
            }

            if (!container.length || container.find('.button--keywords').length) return;

            var title = Lampa.Lang.translate('tmdb_keywords');
            // Використовуємо твою іконку для тегів
            var icon = '<img src="https://bodya-elven.github.io/Different/tag.svg" class="keywords-icon-img" />';
            
            var button = $('<div class="full-start__button selector view--category button--keywords">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                var items = tags.map(function(tag) {
                    return { title: tag.name, id: tag.id };
                });

                Lampa.Select.show({
                    title: title, 
                    items: items,
                    onSelect: function (selectedItem) {
                        // ПЕРЕКЛЮЧЕННЯ НА КОМБІНОВАНИЙ КАТАЛОГ
                        Lampa.Activity.push({
                            url: '', 
                            title: selectedItem.title,
                            component: 'category', // Використовуємо 'category' для побудови списків
                            id: selectedItem.id,
                            source: 'tmdb',
                            card_type: true,
                            type: 'keyword', // Вказуємо Lampa, що це пошук за тегом
                            page: 1
                        });
                    },
                    onBack: function() {
                        Lampa.Controller.toggle('full_start');
                    }
                });
            });

            container.append(button);
            Lampa.Controller.toggle('full_start');
        };
    }

    if (!window.plugin_tmdb_keywords_split) {
        window.plugin_tmdb_keywords_split = new TMDBKeywords();
        window.plugin_tmdb_keywords_split.init();
    }
})();
