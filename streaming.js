(function () {
    'use strict';

    function StreamingPlugin() {
        var _this = this;
        
        // Посилання на твою іконку
        var ICON_STREAM = 'https://bodya-elven.github.io/Different/stream.svg';

        // Локалізація назви кнопки
        if (Lampa.Lang) {
            Lampa.Lang.add({
                plugin_streaming_title: {
                    en: 'Streaming',
                    uk: 'Стрімінги'
                }
            });
        }

        this.init = function () {
            if (!Lampa.Listener) return;

            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    var card = e.data.movie;
                    // Працюємо тільки з TMDB
                    if (card && (card.source == 'tmdb' || e.data.source == 'tmdb') && card.id) {
                        _this.getStreamingData(e.object.activity.render(), card);
                    }
                }
            });

            // Стилі для іконки та пунктів меню
            var style = document.createElement('style');
            style.innerHTML = `
                .streaming-icon-img { 
                    width: 1.6em; 
                    height: 1.6em; 
                    object-fit: contain;
                    display: block;
                    filter: invert(1); 
                }
                .button--streaming { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 0.4em; 
                }
                .streaming-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px;
                }
                .streaming-item img {
                    width: 2.2em;
                    height: 2.2em;
                    border-radius: 6px;
                }
            `;
            document.head.appendChild(style);
        };

        this.getStreamingData = function (html, card) {
            var type = (card.original_name || card.name) ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(type + '/' + card.id + '/watch/providers?api_key=' + Lampa.TMDB.key());

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (resp) {
                    // Тільки регіон США (US)
                    var us_data = resp.results ? resp.results.US : null;
                    var providers = [];
                    
                    if (us_data && us_data.flatrate) {
                        providers = us_data.flatrate;
                    }

                    if (providers.length > 0) {
                        _this.renderButton(html, providers, type);
                    }
                }
            });
        };

        this.renderButton = function (html, providers, type) {
            var container = html.find('.full-start-new__buttons, .full-start__buttons').first();
            if (!container.length) return;
            if (container.find('.button--streaming').length) return;

            var title = Lampa.Lang.translate('plugin_streaming_title');
            var icon = '<img src="' + ICON_STREAM + '" class="streaming-icon-img" />';
            var button = $('<div class="full-start__button selector button--streaming">' + icon + '<span>' + title + '</span></div>');

            button.on('hover:enter click', function () {
                var items = providers.map(function(p) {
                    return {
                        title: p.provider_name,
                        id: p.provider_id,
                        icon: 'https://image.tmdb.org/t/p/w500' + p.logo_path
                    };
                });

                Lampa.Select.show({
                    title: title + ' (US)',
                    items: items,
                    onRender: function(item, html_item) {
                        $(html_item).addClass('streaming-item');
                        $(html_item).prepend('<img src="' + item.icon + '">');
                    },
                    onSelect: function (selected) {
                        // Відкриваємо категорію цієї платформи (фільми або серіали)
                        Lampa.Activity.push({
                            url: 'discover/' + type,
                            title: selected.title + ' (US)',
                            component: 'category_full',
                            source: 'tmdb',
                            card_type: true,
                            page: 1,
                            filter: {
                                watch_region: 'US',
                                with_watch_providers: selected.id
                            }
                        });
                    },
                    onBack: function() {
                        Lampa.Controller.toggle('full_start');
                    }
                });
            });

            // Кнопка в самому кінці списку
            container.append(button);
        };
    }

    if (!window.streaming_plugin_instance) {
        window.streaming_plugin_instance = new StreamingPlugin();
        window.streaming_plugin_instance.init();
    }
})();
