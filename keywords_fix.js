(function () {
    'use strict';

    function KeywordsPlugin() {
        var _this = this;
        var ICON_TAG = 'https://bodya-elven.github.io/different/icons/tag.svg';

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
                if (e.type == 'complite') {
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
                @media screen and (max-width: 768px) { .button--keywords { padding: 0.5em !important; } }
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

            var originalNames = tags.map(function(t) { return t.name; });
            var textToTranslate = originalNames.join(' ||| '); 
            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=uk&dt=t&q=' + encodeURIComponent(textToTranslate);

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (result) {
                    try {
                        var translatedText = '';
                        if (result && result[0]) result[0].forEach(function(item) { if (item[0]) translatedText += item[0]; });
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

            var title = Lampa.Lang.translate('plugin_keywords_title');
            var icon = '<img src="' + ICON_TAG + '" class="keywords-icon-img" />';
            var button = $('<div class="full-start__button selector view--category button--keywords">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                // 1. ЗАПАМ'ЯТОВУЄМО АКТИВНИЙ КОНТРОЛЕР
                var currentController = Lampa.Controller.enabled().name;
                _this.showTagsMenu(tags, button, html, currentController);
            });

            container.append(button);
        };

        // Передаємо currentController далі
        this.showTagsMenu = function(tags, btnElement, renderContainer, prevController) {
            var title = Lampa.Lang.translate('plugin_keywords_title');
            var items = tags.map(function(tag) {
                return { title: tag.name, tag_data: tag };
            });

            Lampa.Select.show({
                title: title, 
                items: items,
                onSelect: function (selectedItem) {
                    _this.showTypeMenu(selectedItem.tag_data, tags, btnElement, renderContainer, prevController);
                },
                onBack: function() {
                    // 2. ВІДНОВЛЮЄМО САМЕ ТОЙ КОНТРОЛЕР, ЩО БУВ
                    Lampa.Controller.toggle(prevController);

                    // Фокус тільки для ТВ
                    if (!Lampa.Platform.is('touch')) {
                        if (btnElement && renderContainer) {
                            Lampa.Controller.collectionFocus(btnElement[0], renderContainer[0]);
                        }
                    }
                }
            });
        };

        this.showTypeMenu = function(tag, allTags, btnElement, renderContainer, prevController) {
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
                    // Повертаємось до списку тегів, передаючи контролер далі
                    _this.showTagsMenu(allTags, btnElement, renderContainer, prevController);
                }
            });
        };
    }

    if (!window.plugin_keywords_instance) {
        window.plugin_keywords_instance = new KeywordsPlugin();
        window.plugin_keywords_instance.init();
    }
})();
