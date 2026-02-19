(function () {
    'use strict';

    // Інформація про плагін
    var AISearchPlugin = {
        name: 'AI Search',
        version: '1.0.1',
        description: 'Розумний пошук фільмів через AI (OpenRouter)'
    };

    // Головна функція ініціалізації
    function startPlugin() {
        // 1. Реєстрація розділу в Налаштуваннях (як у interface_mod)
        Lampa.SettingsApi.addComponent({
            component: 'ai_search',
            name: 'AI Search',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><path d="M11 8v6"></path><path d="M8 11h6"></path></svg>'
        });

        // 2. Додавання параметрів
        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { name: 'ai_search_api_key', type: 'input', default: '' },
            field: { name: 'API ключ OpenRouter', description: 'Вставте ваш ключ доступу (sk-or-v1-...)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { name: 'ai_search_model', type: 'input', default: 'qwen/qwen-2.5-72b-instruct:free' },
            field: { name: 'Модель AI', description: 'Рекомендовано: qwen/qwen-2.5-72b-instruct:free' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: {
                name: 'ai_search_limit',
                type: 'select',
                values: { 5: '5', 10: '10', 15: '15', 20: '20', 25: '25', 30: '30' },
                default: 15
            },
            field: { name: 'Кількість результатів', description: 'Скільки варіантів показувати' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { name: 'ai_search_clear_cache', type: 'button' },
            field: { name: 'Очистити кеш', description: 'Натисніть для видалення тимчасових даних' },
            onChange: function () {
                Lampa.Storage.set('ai_search_cache', {});
                Lampa.Noty.show('Кеш успішно очищено');
            }
        });

        // 3. Додавання кнопки в головне (ліве) меню
        // ВАЖЛИВО: Не використовуємо data-action, щоб уникнути крашу роутера Lampa
        if (!$('.menu__item.ai-search-btn').length) {
            var btn = $('<div class="menu__item selector ai-search-btn">' +
                '<div class="menu__icons">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>' +
                '</div>' +
                '<div class="menu__title">AI Search</div>' +
            '</div>');

            btn.on('hover:enter', function () {
                Lampa.Input.edit({
                    title: 'Що хочете подивитися?',
                    value: '',
                    free: true,
                    nosave: true
                }, function (value) {
                    if (value) {
                        Lampa.Noty.show('AI шукає варіанти...');
                        
                        askAI(value).then(function(movies) {
                            if (movies && movies.length > 0) {
                                var items = movies.map(function(title) {
                                    return {
                                        title: title,
                                        search_query: title
                                    };
                                });

                                // Показуємо список знайденого
                                Lampa.Select.show({
                                    title: 'AI рекомендує:',
                                    items: items,
                                    onSelect: function (item) {
                                        // Запускаємо стандартний пошук Lampa для обраного фільму
                                        Lampa.Activity.push({
                                            url: '',
                                            title: 'Пошук',
                                            component: 'search',
                                            query: item.search_query
                                        });
                                    },
                                    onBack: function () {
                                        Lampa.Controller.toggle('menu');
                                    }
                                });
                            } else if (movies && movies.length === 0) {
                                Lampa.Noty.show('AI нічого не знайшов. Спробуйте змінити запит.');
                            }
                        });
                    }
                });
            });

            $('.menu .menu__list').append(btn);
        }
    }

    // 4. Логіка спілкування з OpenRouter
    async function askAI(query) {
        var apiKey = Lampa.Storage.get('ai_search_api_key');
        var model = Lampa.Storage.get('ai_search_model') || 'qwen/qwen-2.5-72b-instruct:free';
        var limit = Lampa.Storage.get('ai_search_limit') || 15;

        if (!apiKey) {
            Lampa.Noty.show('Помилка: API ключ не налаштовано в меню Налаштувань');
            return null;
        }

        var prompt = 'Користувач хоче подивитися: "' + query + '". ' +
            'Знайди ' + limit + ' назв фільмів або серіалів, які найбільше підходять під опис. ' +
            'Поверни ТІЛЬКИ список назв, кожна назва з нового рядка, без нумерації, без років та без жодного зайвого тексту.';

        try {
            var response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            var data = await response.json();
            
            // Чистимо текст від маркерів та розбиваємо на масив
            var rawText = data.choices[0].message.content;
            return rawText.split('\n')
                .map(function(s) { return s.trim().replace(/^[-*•]\s*/, '').replace(/^\d+[\.)]\s*/, ''); })
                .filter(function(s) { return s.length > 0; });

        } catch (e) {
            Lampa.Noty.show('Помилка з\'єднання з AI сервером');
            return null;
        }
    }

    // 5. Запуск плагіна
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

    // 6. Реєстрація в системі Lampa
    if (Lampa.Manifest) {
        Lampa.Manifest.plugins = AISearchPlugin;
    }
})();
