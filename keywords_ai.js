(function () {
    'use strict';

    function KeywordsAIPlugin() {
        var _this = this;
        var ICON_TAG = 'https://bodya-elven.github.io/Different/tag.svg';

        // Локалізація
        if (Lampa.Lang) {
            Lampa.Lang.add({
                plugin_keywords_title: { en: 'Tags', uk: 'Теги' },
                plugin_keywords_movies: { en: 'Movies', uk: 'Фільми' },
                plugin_keywords_tv: { en: 'TV Series', uk: 'Серіали' },
                keywords_api_key: { en: 'Gemini API Key', uk: 'Gemini API Key' },
                keywords_api_descr: { en: 'Key from Google AI Studio for smart translation', uk: 'Ключ від Google AI Studio для розумного перекладу' }
            });
        }

        this.init = function () {
            // Додаємо налаштування для API ключа
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'keywords_gemini_key',
                    type: 'input',
                    default: '',
                    placeholder: 'AIzaSy...'
                },
                field: {
                    name: Lampa.Lang.translate('keywords_api_key'),
                    description: Lampa.Lang.translate('keywords_api_descr')
                }
            });

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
                        _this.processTranslation(tags, function(finalTags) {
                            _this.renderButton(html, finalTags);
                        });
                    }
                }
            });
        };

        this.processTranslation = function (tags, callback) {
            var lang = Lampa.Storage.get('language', 'uk');
            if (lang !== 'uk') return callback(tags);

            var apiKey = Lampa.Storage.get('keywords_gemini_key', '');

            // Якщо є ключ - пробуємо AI, якщо ні - Google Translate
            if (apiKey && apiKey.length > 10) {
                _this.translateWithGemini(tags, apiKey, callback);
            } else {
                _this.translateWithGoogle(tags, callback);
            }
        };

        this.translateWithGemini = function(tags, apiKey, callback) {
            var originalNames = tags.map(function(t) { return t.name; });
            
            // Промпт для AI
            var prompt = "Translate these movie tags from English to Ukrainian. Context: cinema metadata. " +
                         "Rules: 'based on comic' -> 'за мотивами коміксів', 'anime' -> 'аніме', 'short' -> 'короткометражка'. " +
                         "Return ONLY a JSON array of strings. Input: " + JSON.stringify(originalNames);

            var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;

            var payload = {
                contents: [{ parts: [{ text: prompt }] }]
            };

            $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                success: function(resp) {
                    try {
                        var text = resp.candidates[0].content.parts[0].text;
                        // Очищення відповіді від markdown ```json ... ```
                        text = text.replace(/```json|```/g, '').trim();
                        var translatedArray = JSON.parse(text);

                        if (Array.isArray(translatedArray) && translatedArray.length === tags.length) {
                            tags.forEach(function(tag, index) {
                                tag.name = translatedArray[index];
                            });
                            callback(tags);
                        } else {
                            // Якщо AI повернув щось дивне, фолбек на Google
                            _this.translateWithGoogle(tags, callback);
                        }
                    } catch (e) {
                        console.error('Gemini Parse Error', e);
                        _this.translateWithGoogle(tags, callback);
                    }
                },
                error: function() {
                    _this.translateWithGoogle(tags, callback);
                }
            });
        };

        this.translateWithGoogle = function (tags, callback) {
            var originalNames = tags.map(function(t) { return t.name; });
            var textToTranslate = originalNames.join(' ||| '); 
            var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=uk&dt=t&q=' + encodeURIComponent(textToTranslate);

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
                        Lampa.Controller.toggle('full_start');
                    }
                });
            });

            container.append(button);
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
                    Lampa.Controller.toggle('full_start');
                }
            });
        };
    }

    if (!window.plugin_keywords_ai) {
        window.plugin_keywords_ai = new KeywordsAIPlugin();
        window.plugin_keywords_ai.init();
    }
})();
