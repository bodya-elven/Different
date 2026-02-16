(function () {
    'use strict';

    function KeywordsAIPlugin() {
        var _this = this;
        
        // === ВСТАВ СВІЙ КЛЮЧ ===
        var GEMINI_API_KEY = 'AIzaSyA7txXLnMtCdUvKFde9W-tXYJHVxXOW4_Q'; 
        
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

            // Якщо ключ є - використовуємо Gemini з контекстом
            if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10 && GEMINI_API_KEY !== 'ВСТАВ_СВІЙ_КЛЮЧ_СЮДИ') {
                _this.translateWithGemini(tags, callback);
            } else {
                _this.translateWithGoogle(tags, callback);
            }
        };

        this.translateWithGemini = function(tags, callback) {
            var originalNames = tags.map(function(t) { return t.name; });
            
            // === ПРАВИЛЬНИЙ ЗАПИТ З КОНТЕКСТОМ ===
            // Ми кажемо: "Це теги фільмів. Переклади правильно."
            var prompt = 
                "Translate the following JSON array of strings from English to Ukrainian.\n" +
                "CONTEXT: These are **movie tags** (metadata) describing genres, plots, or sources.\n" +
                "INSTRUCTIONS:\n" +
                "- Translate specifically for a cinema interface.\n" +
                "- E.g. interpret 'comic' as 'comic book' (комікс), NOT 'funny'.\n" +
                "- E.g. interpret 'short' as 'short film' (короткометражка).\n" +
                "OUTPUT: Return ONLY the raw JSON array of translated strings.\n\n" +
                "Input: " + JSON.stringify(originalNames);

            var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
            var payload = { contents: [{ parts: [{ text: prompt }] }] };

            $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                success: function(resp) {
                    try {
                        var text = resp.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
                        var translatedArray = JSON.parse(text);

                        if (Array.isArray(translatedArray) && translatedArray.length === tags.length) {
                            tags.forEach(function(tag, index) {
                                tag.name = translatedArray[index];
                            });
                            callback(tags);
                        } else {
                            _this.translateWithGoogle(tags, callback);
                        }
                    } catch (e) {
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
                    onBack: function() { Lampa.Controller.toggle('full_start'); }
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
                onBack: function() { Lampa.Controller.toggle('full_start'); }
            });
        };
    }

    if (!window.plugin_keywords_ai) {
        window.plugin_keywords_ai = new KeywordsAIPlugin();
        window.plugin_keywords_ai.init();
    }
})();
