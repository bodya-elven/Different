(function () {
    'use strict';

    function TMDBStudios() {
        var _this = this;

        // Локалізація
        if (Lampa.Lang) {
            Lampa.Lang.add({
                tmdb_studios: {
                    en: 'Production',
                    uk: 'Виробництво'
                }
            });
        }

        this.init = function () {
            if (!Lampa.Listener) return;

            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var card = e.data.movie;
                    if (card && (card.source == 'tmdb' || e.data.source == 'tmdb') && card.id) {
                        _this.getStudios(e.object.activity.render(), card);
                    }
                }
            });

            // Стилі для кнопки та іконки
            var style = document.createElement('style');
            style.innerHTML = `
                .studios-icon-img { 
                    width: 1.4em; 
                    height: 1.4em; 
                    object-fit: contain;
                    display: block;
                    filter: invert(1); 
                }
                .button--studios { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 0.5em; 
                }
            `;
            document.head.appendChild(style);
        };

        this.getStudios = function (html, card) {
            var method = (card.original_name || card.name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(method + '/' + card.id + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'uk'));

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (resp) {
                    var studios = resp.production_companies || [];
                    if (studios.length > 0) {
                        _this.renderButton(html, studios);
                    }
                }
            });
        };

        this.renderButton = function (html, studios) {
            var container = html.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length) {
                var btn = html.find('.button--play, .button--trailer, .full-start__button').first();
                if (btn.length) container = btn.parent();
            }

            if (!container.length || container.find('.button--studios').length) return;

            var title = Lampa.Lang.translate('tmdb_studios');
            var icon = '<img src="https://bodya-elven.github.io/different/icons/film.svg" class="studios-icon-img" />';
            
            var button = $('<div class="full-start__button selector view--category button--studios">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                var items = studios.map(function(s) {
                    return { title: s.name, id: s.id };
                });

                Lampa.Select.show({
                    title: title, 
                    items: items,
                    onSelect: function (selectedItem) {
                        // Точне копіювання логіки з надісланого тобою плагіна
                        Lampa.Activity.push({
                            url: 'movie', // Це ключовий момент для фільтрації
                            id: selectedItem.id,
                            title: selectedItem.title,
                            component: 'company',
                            source: 'tmdb',
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

    if (!window.plugin_tmdb_studios_vfinal) {
        window.plugin_tmdb_studios_vfinal = new TMDBStudios();
        window.plugin_tmdb_studios_vfinal.init();
    }
})();
