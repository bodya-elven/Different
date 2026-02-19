(function () {
    'use strict';

    // 1. ЗАХИСТ ВІД ПОДВІЙНОГО ЗАПУСКУ (як у LME)
    if (window.plugin_ai_search_ready) return;
    window.plugin_ai_search_ready = true;

    // 2. МАНІФЕСТ ПЛАГІНА
    var manifest = {
        type: "other",
        version: "1.0.0",
        name: "AI Search",
        description: "Розумний пошук фільмів та серіалів через AI",
        component: "ai_search"
    };

    // 3. ЛОКАЛІЗАЦІЯ
    function addLang() {
        Lampa.Lang.add({
            ai_search_title: { ru: 'AI Search', uk: 'AI Search', en: 'AI Search' },
            ai_search_api_key: { ru: 'API ключ OpenRouter', uk: 'API ключ OpenRouter', en: 'OpenRouter API Key' },
            ai_search_model: { ru: 'Модель AI', uk: 'Модель AI', en: 'AI Model' },
            ai_search_limit: { ru: 'Лимит результатов', uk: 'Кількість результатів', en: 'Results limit' },
            ai_search_clear: { ru: 'Очистить кэш', uk: 'Очистити кеш', en: 'Clear cache' }
        });
    }

    // 4. ІНІЦІАЛІЗАЦІЯ НАЛАШТУВАНЬ
    function addSettings() {
        // Реєстрація розділу в меню налаштувань
        Lampa.SettingsApi.addComponent({
            component: 'ai_search',
            name: Lampa.Lang.translate('ai_search_title'),
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
        });

        // Поле: API ключ
        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { name: 'ai_search_api_key', type: 'input', default: '' },
            field: { name: Lampa.Lang.translate('ai_search_api_key'), description: 'Вставте ключ (sk-or-v1-...)' }
        });

        // Поле: Модель
        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { name: 'ai_search_model', type: 'input', default: 'qwen/qwen-2.5-72b-instruct:free' },
            field: { name: Lampa.Lang.translate('ai_search_model'), description: 'Рекомендовано: qwen/qwen-2.5-72b-instruct:free' }
        });

        // Поле: Кількість результатів
        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: {
                name: 'ai_search_limit',
                type: 'select',
                values: { 5: '5', 10: '10', 15: '15', 20: '20', 25: '25', 30: '30' },
                default: 15
            },
            field: { name: Lampa.Lang.translate('ai_search_limit'), description: 'Скільки варіантів показувати' }
        });

        // Кнопка: Очищення
        Lampa.SettingsApi.addParam({
            component: 'ai_search',
            param: { name: 'ai_search_clear_cache', type: 'button' },
            field: { name: Lampa.Lang.translate('ai_search_clear'), description: 'Видалити тимчасові дані пошуку' },
            onChange: function () {
                Lampa.Storage.set('ai_search_cache', {});
                Lampa.Noty.show(Lampa.Lang.translate('ai_search_clear'));
            }
        });
    }

    // 5. ЛОГІКА ЗАПИТУ ДО AI
    async function askAI(query) {
        const apiKey = Lampa.Storage.get('ai_search_api_key');
        const model = Lampa.Storage.get('ai_search_model') || 'qwen/qwen-2.5-72b-instruct:free';
        const limit = Lampa.Storage.get('ai_search_limit') || 15;

        if (!apiKey) {
            Lampa.Noty.show('Помилка: API ключ не налаштовано');
            return null;
        }

        const prompt = `Користувач хоче подивитися: "${query}". Знайди ${limit} назв фільмів або серіалів. Поверни ТІЛЬКИ список назв, кожна назва з нового рядка, без нумерації, без років та без зайвого тексту.`;

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
            
            const rawText = data.choices[0].message.content;
            return rawText.split('\n')
                .map(s => s.trim().replace(/^[-*•]\s*/, '').replace(/^\d+[\.)]\s*/, ''))
                .filter(s => s.length > 0);

        } catch (e) {
            Lampa.Noty.show('Помилка запиту до AI');
            return null;
        }
    }

    // 6. ДОДАВАННЯ КНОПКИ В БОКОВЕ МЕНЮ
    function addMenuButton() {
        if ($('.menu__item[data-action="ai_search"]').length) return;

        const btn = $(`<div class="menu__item selector" data-action="ai_search">
            <div class="menu__icons">
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
            </div>
            <div class="menu__title">${Lampa.Lang.translate('ai_search_title')}</div>
        </div>`);

        btn.on('hover:enter', function () {
            Lampa.Input.edit({
                title: Lampa.Lang.translate('ai_search_title'),
                value: '',
                free: true,
                nosave: true
            }, async function (value) {
                if (value) {
                    Lampa.Noty.show('AI шукає варіанти...');
                    const movies = await askAI(value);
                    
                    if (movies && movies.length > 0) {
                        const items = movies.map(title => ({
                            title: title,
                            search_query: title
                        }));

                        Lampa.Select.show({
                            title: 'Знайдено AI:',
                            items: items,
                            onSelect: function (item) {
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
                        Lampa.Noty.show('Нічого не знайдено');
                    }
                }
            });
        });

        $('.menu .menu__list').append(btn);
    }

    // 7. ГОЛОВНИЙ СТАРТ ПЛАГІНА
    function startPlugin() {
        window.plugin_ai_search_ready = true;
        
        // Реєструємо маніфест
        if (Lampa.Manifest) Lampa.Manifest.plugins = manifest;
        
        addLang();
        addSettings();
        addMenuButton();
    }

    // Перевірка, чи ядро Lampa вже завантажилось (точно як у LME)
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow("app", function (e) {
            if (e.type === "ready") startPlugin();
        });
    }

})();
