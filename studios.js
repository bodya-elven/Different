(function () {
    'use strict';

    function TMDBStudios() {
        var _this = this;

        // 1. Локалізація
        if (Lampa.Lang) {
            Lampa.Lang.add({
                tmdb_studios: {
                    en: 'Studios',
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
                        var render = e.object.activity.render();
                        _this.getStudios(render, card);
                    }
                }
            });

            var style = document.createElement('style');
            style.innerHTML = `
                .studios-icon-svg { 
                    width: 1.4em; 
                    height: 1.4em; 
                    display: block;
                    fill: currentColor; /* Іконка буде білою, як текст */
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
            
            // Вшита іконка кіноплівки (SVG)
            var icon = '<svg class="studios-icon-svg" viewBox="0 0 512 512"><path d="M414.1 113c-4.4-1.6-9.1-.8-12.7 2.1l-50.6 40.5V112c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h254.9c26.5 0 48-21.5 48-48v-43.6l50.6 40.5c3.6 2.9 8.3 3.7 12.7 2.1 4.4-1.6 7.3-5.8 7.3-10.4V123.4c0-4.6-2.9-8.8-7.3-10.4zM302.9 400H48V112h254.9v288zm161.1-23.4l-64-51.2V186.6l64-51.2v241.2z"/></svg>';
            
            var button = $('<div class="full-start__button selector view--category button--studios">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                var items = studios.map(function(s) {
                    return { 
                        title: s.name, 
                        id: s.id 
                    };
                });

                Lampa.Select.show({
                    title: title, 
                    items: items,
                    onSelect: function (selectedItem) {
                        // Відкриваємо сторінку студії (компанії). 
                        // Lampa автоматично підтягне розділення на фільми/серіали
                        Lampa.Activity.push({ 
                            url: 'company/' + selectedItem.id, 
                            title: selectedItem.title, 
                            component: 'category_full', 
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

    if (!window.plugin_tmdb_studios_v2) {
        window.plugin_tmdb_studios_v2 = new TMDBStudios();
        window.plugin_tmdb_studios_v2.init();
    }
})();
