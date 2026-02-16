(function () {
    'use strict';

    if (window.keywords_ai_plugin) return;
    window.keywords_ai_plugin = true;

    var ICON = 'https://bodya-elven.github.io/Different/tag.svg';

    Lampa.Lang.add({
        keywords_ai_title: {
            en: 'Tags',
            uk: 'Теги'
        },
        keywords_ai_movies: {
            en: 'Movies',
            uk: 'Фільми'
        },
        keywords_ai_tv: {
            en: 'TV Series',
            uk: 'Серіали'
        }
    });

    function addButton(render, movie) {
        $('.keywords-ai-btn', render).remove();

        var btn = $(
            '<div class="full-start__button selector keywords-ai-btn">' +
                '<img src="' + ICON + '" style="width:1.4em;margin-right:.4em;filter:invert(1)">' +
                '<span>' + Lampa.Lang.translate('keywords_ai_title') + '</span>' +
            '</div>'
        );

        btn.on('hover:enter click', function () {
            loadKeywords(movie);
        });

        $('.full-start-new__buttons, .full-start__buttons', render)
            .first()
            .append(btn);
    }

    function loadKeywords(movie) {
        var type = movie.name ? 'tv' : 'movie';
        var url  = Lampa.TMDB.api(
            type + '/' + movie.id + '/keywords?api_key=' + Lampa.TMDB.key()
        );

        $.getJSON(url, function (data) {
            var list = data.keywords || data.results || [];
            if (!list.length) return;

            showKeywords(list);
        });
    }

    function showKeywords(list) {
        Lampa.Select.show({
            title: Lampa.Lang.translate('keywords_ai_title'),

            items: list.map(function (item) {
                return {
                    title: item.name,
                    id: item.id
                };
            }),

            onSelect: function (item) {
                showTypeSelect(item);
            },

            onBack: function () {
                // 🔑 КЛЮЧОВИЙ ФІКС
                Lampa.Select.close();
                Lampa.Controller.restore();
            }
        });
    }

    function showTypeSelect(keyword) {
        Lampa.Select.show({
            title: keyword.title,

            items: [
                {
                    title: Lampa.Lang.translate('keywords_ai_movies'),
                    type: 'movie'
                },
                {
                    title: Lampa.Lang.translate('keywords_ai_tv'),
                    type: 'tv'
                }
            ],

            onSelect: function (item) {
                Lampa.Select.close();

                Lampa.Activity.push({
                    url: 'discover/' + item.type +
                        '?with_keywords=' + keyword.id +
                        '&sort_by=popularity.desc',
                    title: keyword.title,
                    component: 'category_full',
                    source: 'tmdb',
                    page: 1
                });
            },

            onBack: function () {
                Lampa.Select.close();
                Lampa.Controller.restore();
            }
        });
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'complite' && e.type !== 'complete') return;

        var movie = e.data.movie;
        if (!movie || movie.source !== 'tmdb') return;

        addButton(e.object.activity.render(), movie);
    });

})();