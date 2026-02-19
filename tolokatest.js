(function () {
    'use strict';

    var plugin_name = 'Toloka Dub Badges';
    
    // Налаштування черги
    var maxConcurrent = 2; // Максимальна кількість одночасних запитів
    var activeRequests = 0; // Поточна кількість активних запитів
    var requestQueue = []; // Сама черга завдань

    // Додаємо стилі для бейджів
    var css = `
        .toloka-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(46, 125, 50, 0.8);
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

    // Функція пошуку студій у тексті
    function extractStudios(html) {
        var studios = [];
        var regex = /переклад:.*?\|\s*([^<\n\r]+)/g;
        var match;

        while ((match = regex.exec(html)) !== null) {
            var name = match[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
            if (name && name.length > 0 && name.length < 40 && !studios.includes(name)) {
                studios.push(name);
            }
        }
        return studios;
    }

    // Головний контролер черги
    function processQueue() {
        // Якщо черга порожня або ліміт запитів вичерпано, чекаємо
        if (requestQueue.length === 0 || activeRequests >= maxConcurrent) {
            return;
        }

        // Беремо завдання з черги та збільшуємо лічильник активних запитів
        activeRequests++;
        var task = requestQueue.shift();

        var network = new Lampa.Reguest();
        network.timeout(5000); 

        network.native('https://toloka.to/t' + task.topicId, function (html) {
            task.loadingBadge.remove();
            var studios = extractStudios(html);
            
            if (studios.length > 0) {
                studios.forEach(function(studio) {
                    task.badgeContainer.append('<span class="toloka-badge">🎤 UKR - ' + studio + '</span>');
                });
            }
            
            // Звільняємо слот і запускаємо наступний запит із невеличкою затримкою
            activeRequests--;
            setTimeout(processQueue, 500); 

        }, function (a, c) {
            task.loadingBadge.text('❌ Помилка');
            setTimeout(function() { task.loadingBadge.remove(); }, 3000);
            
            // Навіть у разі помилки звільняємо слот
            activeRequests--;
            setTimeout(processQueue, 500); 
        }, false, {
            dataType: 'text'
        });
        
        // Одразу намагаємося запустити ще один запит (щоб їх було 2)
        processQueue(); 
    }

    // Обробка окремого торрента в списку
    function processTorrentItem(item_dom, torrent_data) {
        var tracker = (torrent_data.tracker || '').toLowerCase();
        if (tracker.indexOf('toloka') === -1) return;

        var url = torrent_data.details || torrent_data.url || torrent_data.magnet || '';
        var idMatch = url.match(/t(\d+)/) || url.match(/viewtopic\.php\?t=(\d+)/);
        if (!idMatch) return; 
        
        var topicId = idMatch[1];
        
        if (item_dom.find('.toloka-badge-container').length > 0) return;
        
        var badgeContainer = $('<div class="toloka-badge-container"></div>');
        item_dom.find('.torrent-item__info').after(badgeContainer);

        var loadingBadge = $('<span class="toloka-badge" style="background: #555;">⏳ Шукаю...</span>');
        badgeContainer.append(loadingBadge);

        // Додаємо завдання в чергу
        requestQueue.push({
            topicId: topicId,
            badgeContainer: badgeContainer,
            loadingBadge: loadingBadge
        });

        // "Штурхаємо" чергу, щоб вона почала працювати
        processQueue();
    }

    // Відстеження появи нових елементів на екрані
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                $(mutation.addedNodes).each(function() {
                    var el = $(this);
                    if (el.hasClass('torrent-item')) {
                        setTimeout(function() {
                            var rawElem = el[0];
                            var tData = rawElem.data || rawElem.parsed_data; 
                            var trackerNameDom = el.find('.torrent-item__tracker, .torrent-item__source').text().toLowerCase();
                            
                            if (tData) {
                                if (!tData.tracker) tData.tracker = trackerNameDom;
                                processTorrentItem(el, tData);
                            }
                        }, 50);
                    }
                });
            }
        });
    });

    // Ініціалізація
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            observer.observe(document.body, { childList: true, subtree: true });
            console.log(plugin_name + ' успішно запущено!');
        }
    });

})();
