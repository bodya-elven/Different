(function () {
    'use strict';

    Lampa.Platform.tv();

    // Реєстрація налаштувань з новою назвою
    Lampa.SettingsApi.add({
        title: 'AI Search',
        component: 'ai_search_settings',
        icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="white"/></svg>',
        onRender: function (render) {
            render.plugin_info = {
                name: 'AI Search',
                description: 'Розумний пошук через OpenRouter'
            };
            
            render.add({
                title: 'API ключ OpenRouter',
                type: 'input',
                name: 'ai_search_api_key',
                placeholder: 'sk-or-v1-...'
            });

            render.add({
                title: 'Модель AI',
                type: 'input',
                name: 'ai_search_model',
                placeholder: 'qwen/qwen-2.5-72b-instruct:free'
            });

            render.add({
                title: 'Кількість результатів',
                type: 'select',
                name: 'ai_search_limit',
                values: [5, 10, 15, 20, 25, 30],
                default: 15
            });

            render.add({
                title: 'Очистити кеш',
                type: 'button',
                name: 'ai_search_clear_cache',
                onClick: function () {
                    Lampa.Storage.set('ai_search_cache', {});
                    Lampa.Noty.show('Кеш очищено');
                }
            });
        }
    });

    // Функція запиту до AI з покращеним парсингом
    async function askAI(query) {
        const apiKey = Lampa.Storage.get('ai_search_api_key');
        const model = Lampa.Storage.get('ai_search_model') || 'qwen/qwen-2.5-72b-instruct:free';
        const limit = Lampa.Storage.get('ai_search_limit') || 15;

        if (!apiKey) {
            Lampa.Noty.show('Помилка: API ключ не налаштовано');
            return null;
        }

        // Просимо AI видавати результат з нового рядка для легшого розбиття
        const prompt = `Користувач хоче подивитися: "${query}". 
        Знайди ${limit} назв фільмів або серіалів. 
        Поверни ТІЛЬКИ список назв, кожна назва з нового рядка, без нумерації, без років та без зайвого тексту.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const data = await response.json();
            
            // Розбиваємо по рядках, чистимо від можливих дефісів/цифр і порожніх рядків
            const rawText = data.choices[0].message.content;
            return rawText.split('\n')
                .map(s => s.trim().replace(/^[-*•]\s*/, '').replace(/^\d+[\.)]\s*/, ''))
                .filter(s => s.length > 0);

        } catch (e) {
            Lampa.Noty.show('Помилка запиту до AI');
            return null;
        }
    }

    // Додавання кнопки та обробка відображення результатів
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            const btn = $(`<div class="menu__item selector">
                <div class="menu__icons">
                    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
                </div>
                <div class="menu__title">AI Search</div>
            </div>`);

            btn.on('hover:enter', function () {
                Lampa.Input.edit({
                    title: 'AI Search',
                    value: '',
                    free: true,
                    nosave: true
                }, async function (value) {
                    if (value) {
                        Lampa.Noty.show('AI шукає варіанти...');
                        
                        const movies = await askAI(value);
                        
                        if (movies && movies.length > 0) {
                            // Формуємо список для меню Lampa
                            const items = movies.map(title => ({
                                title: title,
                                search_query: title
                            }));

                            // Показуємо список знайдених фільмів
                            Lampa.Select.show({
                                title: 'Знайдено AI:',
                                items: items,
                                onSelect: function (item) {
                                    // При виборі фільму запускаємо стандартний пошук Lampa
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
                            Lampa.Noty.show('AI нічого не знайшов за цим запитом');
                        }
                    }
                });
            });

            $('.menu .menu__list').append(btn);
        }
    });
})();
