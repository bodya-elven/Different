(function () {
    'use strict';

    function TMDBKeywords() {
        var _this = this;

        // Локалізація меню
        if (Lampa.Lang) {
            Lampa.Lang.add({
                tmdb_keywords: {
                    en: 'Tags',
                    uk: 'Теги',
                    ru: 'Теги'
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

            // Стилі для іконки
            var style = document.createElement('style');
            style.innerHTML = `
                .keywords-icon-img { 
                    width: 1.6em; 
                    height: 1.6em; 
                    object-fit: contain;
                    display: block;
                    filter: invert(1); 
                }
                .button--keywords { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 0.4em; 
                }
                @media screen and (max-width: 768px) {
                    .button--keywords { padding: 0.5em !important; }
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
                async: true,
                success: function (resp) {
                    var tags = resp.keywords || resp.results || [];
                    if (tags.length > 0) {
                        // Запускаємо переклад перед рендером
                        _this.translateTags(tags, function(translatedTags) {
                            _this.renderButton(html, translatedTags, method);
                        });
                    }
                },
                error: function () {}
            });
        };

        // Функція перекладу через Google Translate API
        this.translateTags = function (tags, callback) {
            var lang = Lampa.Storage.get('language', 'uk'); // Отримуємо мову інтерфейсу
            
            // Якщо мова англійська - перекладати не треба
            if (lang == 'en') {
                callback(tags);
                return;
            }

            // Формуємо текст для перекладу (об'єднуємо через символ, щоб зробити 1 запит)
            var originalNames = tags.map(function(t) { return t.name; });
            var textToTranslate = originalNames.join(' ||| '); 

            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + lang + '&dt=t&q=' + encodeURIComponent(textToTranslate);

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (result) {
                    try {
                        // Google повертає масив масивів. Збираємо перекладений текст.
                        var translatedText = '';
                        if (result && result[0]) {
                            result[0].forEach(function(item) {
                                if (item[0]) translatedText += item[0];
                            });
                        }

                        // Розбиваємо назад по роздільнику
                        var translatedArray = translatedText.split('|||');

                        // Оновлюємо назви в об'єкті тегів
                        tags.forEach(function(tag, index) {
                            if (translatedArray[index]) {
                                // Чистим від зайвих пробілів
                                tag.name = translatedArray[index].trim();
                            }
                        });

                        callback(tags);
                    } catch (e) {
                        // Якщо помилка парсингу - повертаємо оригінал
                        console.log('Translation parse error', e);
                        callback(tags);
                    }
                },
                error: function () {
                    // Якщо помилка запиту (блокування) - повертаємо оригінал
                    console.log('Translation request error');
                    callback(tags);
                }
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
            // Ваша іконка
            var icon = '<img src="https://bodya-elven.github.io/Different/tag.svg" class="keywords-icon-img" />';
            
            var button = $('<div class="full-start__button selector view--category button--keywords">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                var items = tags.map(function(tag) {
                    // tag.name тепер перекладений (або оригінал, якщо переклад не вдався)
                    // tag.id залишається оригінальним, тому пошук правильний
                    return { 
                        title: tag.name, 
                        url: 'discover/' + method + '?with_keywords=' + tag.id 
                    };
                });

                Lampa.Select.show({
                    title: title, 
                    items: items,
                    onSelect: function (a) {
                        Lampa.Activity.push({ 
                            url: a.url, 
                            title: title + ': ' + a.title, 
                            component: 'category_full', 
                            source: 'tmdb', 
                            page: 1 
                        });
                    }
                });
            });

            container.append(button);
            Lampa.Controller.toggle('full_start');
        };
    }

    if (!window.plugin_tmdb_keywords_translate) {
        window.plugin_tmdb_keywords_translate = new TMDBKeywords();
        window.plugin_tmdb_keywords_translate.init();
    }
})();
