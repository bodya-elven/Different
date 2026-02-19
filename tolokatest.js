 (function () {
    'use strict';

    var plugin_name = 'Toloka Dub Badges';

    // 1. Додаємо красивий стиль для наших бейджів
    var css = `
        .toloka-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(46, 125, 50, 0.8); /* Темно-зелений колір */
            color: #fff;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            margin-right: 6px;
            margin-top: 6px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .toloka-badge-container {
            margin-top: 5px;
            margin-bottom: 5px;
            display: flex;
            flex-wrap: wrap;
        }
    `;
    $('head').append('<style>' + css + '</style>');

    // 2. Функція, яка "витягує" назви студій з HTML-коду Толоки
    function extractStudios(html) {
        var studios = [];
        // Шукаємо рядок типу "переклад: багатоголосий закадровий | InariDuB"
        var regex = /переклад:.*?\|\s*([^<\n\r]+)/g;
        var match;

        while ((match = regex.exec(html)) !== null) {
            // Очищаємо від випадкових HTML тегів, якщо вони є
            var name = match[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
            
            // Запобігаємо дублям (якщо 10 доріжок від однієї студії)
            if (name && name.length > 0 && name.length < 40 && !studios.includes(name)) {
                studios.push(name);
            }
        }
        return studios;
    }

    // 3. Основна функція обробки кожного торрента в списку
    function processTorrentItem(item_dom, torrent_data) {
        // Перевіряємо, чи це Толока
        var tracker = (torrent_data.tracker || '').toLowerCase();
        if (tracker.indexOf('toloka') === -1) return;

        // Шукаємо посилання на роздачу в даних парсера (Jackett/TorrServe)
        var url = torrent_data.details || torrent_data.url || torrent_data.magnet || '';
        
        // Витягуємо ID теми (наприклад, з https://toloka.to/t123456)
        var idMatch = url.match(/t(\d+)/) || url.match(/viewtopic\.php\?t=(\d+)/);
        if (!idMatch) return; 
        
        var topicId = idMatch[1];
        
        // Захист від повторного малювання бейджів на одному й тому ж елементі
        if (item_dom.find('.toloka-badge-container').length > 0) return;
        
        // Створюємо контейнер для бейджів і додаємо під інфо-панеллю
        var badgeContainer = $('<div class="toloka-badge-container"></div>');
        item_dom.find('.torrent-item__info').after(badgeContainer);

        // Показуємо статус завантаження (можна закоментувати, якщо дратує)
        var loadingBadge = $('<span class="toloka-badge" style="background: #555;">⏳ Шукаю озвучку...</span>');
        badgeContainer.append(loadingBadge);

        // Робимо фоновий запит на сторінку Толоки
        var network = new Lampa.Reguest();
        network.timeout(5000); 

        network.native('https://toloka.to/t' + topicId, function (html) {
            loadingBadge.remove(); // Прибираємо значок завантаження
            var studios = extractStudios(html);
            
            if (studios.length > 0) {
                studios.forEach(function(studio) {
                    // Малюємо фінальний бейдж
                    badgeContainer.append('<span class="toloka-badge">🎤 UKR - ' + studio + '</span>');
                });
            } else {
                // Якщо студій не знайдено (наприклад, чистий оригінал)
                // badgeContainer.append('<span class="toloka-badge" style="background: #444;">Тільки оригінал / Не вказано</span>');
            }
        }, function (a, c) {
            // У разі помилки (наприклад, Толока лежить)
            loadingBadge.text('❌ Помилка');
            setTimeout(function() { loadingBadge.remove(); }, 3000);
        }, false, {
            dataType: 'text'
        });
    }

    // 4. Слідкуємо за появою нових торрентів на екрані
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                $(mutation.addedNodes).each(function() {
                    var el = $(this);
                    // Якщо з'явився новий рядок торрента
                    if (el.hasClass('torrent-item')) {
                        // Робимо невеличку затримку, щоб Lampa встигла "прив'язати" дані до DOM-елемента
                        setTimeout(function() {
                            var rawElem = el[0];
                            var tData = rawElem.data || rawElem.parsed_data; // Дані від парсера
                            
                            // Якщо парсер не віддав трекер явно, шукаємо в тексті інтерфейсу
                            var trackerNameDom = el.find('.torrent-item__tracker, .torrent-item__source').text().toLowerCase();
                            
                            if (tData) {
                                // Якщо tracker не вказаний в data, підкинемо з DOM
                                if (!tData.tracker) tData.tracker = trackerNameDom;
                                processTorrentItem(el, tData);
                            }
                        }, 50);
                    }
                });
            }
        });
    });

    // Запускаємо спостерігач після повного завантаження Lampa
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            observer.observe(document.body, { childList: true, subtree: true });
            console.log(plugin_name + ' успішно запущено!');
        }
    });

})();
