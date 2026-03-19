/* Created by Elven (1|1) */
(function () {
    'use strict';

    if (window.mobileConsoleInitialized) return;
    window.mobileConsoleInitialized = true;

    var PLUGIN_VERSION = '1.0.4';
    var PLUGIN_NAME = 'Console';

    var logBuffer = [];
    var netBuffer = [];
    var actBuffer = []; 
    var uiReady = false;
    var counts = { logs: 0, errors: 0, network: 0, activity: 0 };
    var startTime = performance.now();
    var prev_controller = 'content'; 

    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return String(unsafe);
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function formatLongText(text) {
        if (!text) return 'null';
        var str = String(text);
        if (str.length > 150 || str.split('\n').length > 3) {
            return '<div class="lmc-collapsible collapsed">' + escapeHtml(str) + '</div>';
        }
        return escapeHtml(str);
    }

    var lmcUpdateTimer = null;
    window.lmcUpdateCollection = function() {
        var wd = document.getElementById('lampa-mob-console-window');
        if (!wd || !window.Lampa || !Lampa.Controller) return;
        
        if (Lampa.Controller.enabled().name !== 'lmc_console') return;

        clearTimeout(lmcUpdateTimer);
        lmcUpdateTimer = setTimeout(function() {
            var currentFocus = window.Navigator.getFocusedElement();
            Lampa.Controller.collectionSet(wd);
            
            if (currentFocus && document.body.contains(currentFocus)) {
                window.Navigator.focus(currentFocus);
            } else {
                var activeTab = wd.querySelector('.lmc-tab.active');
                if (activeTab) window.Navigator.focus(activeTab);
            }
        }, 150);
    };

    function updateCounter(type) {
        if (!uiReady) return;
        var tabId = type === 'log' || type === 'warn' || type === 'info' ? 'lmc-content-logs' : 
                    type === 'error' ? 'lmc-content-errors' : 
                    type === 'net' ? 'lmc-content-network' : 
                    type === 'activity' ? 'lmc-content-activity' : '';
        
        if (tabId === 'lmc-content-logs') counts.logs++;
        if (type === 'error') { counts.errors++; counts.logs++; }
        if (type === 'net') counts.network++;
        if (type === 'activity') counts.activity++;

        $('.lmc-tab[data-target="lmc-content-logs"]').text('Console (' + counts.logs + ')');
        $('.lmc-tab[data-target="lmc-content-errors"]').text('Errors (' + counts.errors + ')');
        $('.lmc-tab[data-target="lmc-content-network"]').text('Network (' + counts.network + ')');
        $('.lmc-tab[data-target="lmc-content-activity"]').text('Activity (' + counts.activity + ')');
    }

    function applySearch() {
        var query = $('#lmc-search-input').val().toLowerCase();
        var $activeContent = $('.lmc-content.active');
        $activeContent.children().each(function () {
            var text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(query) !== -1);
        });
        if (query.length > 0) $('#lmc-search-clear').show();
        else $('#lmc-search-clear').hide();
        
        if (window.Lampa && Lampa.Controller && Lampa.Controller.enabled().name === 'lmc_console') {
            window.lmcUpdateCollection();
        }
    }

    function showToast(text) {
        $('.lmc-toast').remove();
        var $toast = $('<div class="lmc-toast">' + text + '</div>').appendTo('body');
        setTimeout(function() { $toast.fadeOut(300, function() { $(this).remove(); }); }, 1500);
    }

    var originalLog = console.log, originalWarn = console.warn, originalError = console.error, originalInfo = console.info;

    function getPluginNameFromUrl(url) {
        if (!url || typeof url !== 'string') return 'Unknown Script';
        var filename = url.substring(url.lastIndexOf('/')+1);
        if (filename.indexOf('?') > -1) filename = filename.substring(0, filename.indexOf('?'));
        return filename || 'Inline Script';
    }

    window.addEventListener('error', function(event) {
        var plugin = getPluginNameFromUrl(event.filename);
        var errMsg = event.message;
        if (!errMsg || errMsg === 'Script error.') {
            errMsg = (event.error && event.error.message) ? event.error.message : '(CORS/Cross-origin або порожня помилка)';
        }
        var msg = "Критична помилка в [" + plugin + "]: " + errMsg;
        if (event.filename) msg += "\nФайл: " + event.filename + (event.lineno ? " (" + event.lineno + ":" + event.colno + ")" : "");
        if (event.error && event.error.stack) msg += "\nСтек:\n" + event.error.stack;
        
        pushLogToUI(msg, 'error');
        originalError.apply(console, [msg]);
    }, true);

    window.addEventListener('unhandledrejection', function(event) {
        var reason = event.reason;
        var errMsg = reason ? (reason.message || (typeof reason === 'object' ? JSON.stringify(reason) : String(reason))) : 'Невідома причина (undefined)';
        var msg = "Необроблений Promise: " + errMsg;
        if (reason && reason.stack) msg += "\nСтек:\n" + reason.stack;

        pushLogToUI(msg, 'error');
        originalError.apply(console, [msg]);
    });

    function processMessage(args) {
        var output = [];
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object' && args[i] !== null) {
                try { output.push(JSON.stringify(args[i], null, 2)); } catch (e) { output.push('[Об\'єкт]'); }
            } else if (args[i] === undefined) output.push('undefined');
            else if (args[i] === null) output.push('null');
            else output.push(String(args[i]));
        }
        return output.join(' ');
    }

    function pushLogToUI(msg, type) {
        if (!uiReady) return;
        var cssClass = type === 'warn' ? 'lmc-warn' : type === 'error' ? 'lmc-error' : type === 'info' ? 'lmc-info' : '';
        var time = new Date().toLocaleTimeString('uk-UA', { hour12: false }).substring(0, 5);
        var formattedMsg = formatLongText(msg);
        var html = '<div class="lmc-row selector ' + cssClass + '"><span class="lmc-time">' + time + ' - </span><span class="lmc-prefix">[' + type.toUpperCase() + ']</span> ' + formattedMsg + '</div>';

        var $logs = $('#lmc-content-logs');
        if ($logs.children().length > 300) $logs.children().first().remove();
        $(html).appendTo($logs);

        if (type === 'error') {
            var $errs = $('#lmc-content-errors');
            if ($errs.children().length > 300) $errs.children().first().remove();
            $errs.append(html);
        }
        updateCounter(type); applySearch();
    }

    function interceptLog(type, args) {
        var msg = processMessage(args);
        if (uiReady) pushLogToUI(msg, type); else logBuffer.push({ msg: msg, type: type });
    }

    console.log = function () { interceptLog('log', arguments); originalLog.apply(console, arguments); };
    console.warn = function () { interceptLog('warn', arguments); originalWarn.apply(console, arguments); };
    console.error = function () { interceptLog('error', arguments); originalError.apply(console, arguments); };
    console.info = function () { interceptLog('info', arguments); originalInfo.apply(console, arguments); };

    // --- ACTIVITY ТА EVENTS TRACKER ---
    function pushActivityToUI(source, type, component, payload) {
        if (!uiReady) return;
        var time = new Date().toLocaleTimeString('uk-UA', { hour12: false }).substring(0, 5);
        var color = source === 'APP' ? '#03a9f4' : '#e91e63';
        var formattedPayload = payload ? formatLongText(payload) : '';
        var html = '<div class="lmc-row selector"><span class="lmc-time">' + time + ' - </span><strong style="color:'+color+';">[' + source + ']</strong> <strong>' + escapeHtml(type) + '</strong> <span style="color:#aaa;">' + escapeHtml(component) + '</span> ' + formattedPayload + '</div>';

        var $act = $('#lmc-content-activity');
        if ($act.children().length > 300) $act.children().first().remove();
        $(html).appendTo($act);

        updateCounter('activity'); applySearch();
    }

    function interceptActivity(source, type, component, payload) {
        if (uiReady) pushActivityToUI(source, type, component, payload);
        else actBuffer.push({ source: source, type: type, component: component, payload: payload });
    }

    // Слухаємо глобальні події Lampa з безпечним фільтром
    var setupTracker = setInterval(function() {
        if (window.Lampa && Lampa.Listener) {
            clearInterval(setupTracker);
            
            Lampa.Listener.follow('app', function(e) {
                var safeApp = {};
                for (var key in e) {
                    if (key !== 'type' && typeof e[key] !== 'object' && typeof e[key] !== 'function') safeApp[key] = e[key];
                }
                interceptActivity('APP', e.type || 'unknown', 'system', Object.keys(safeApp).length ? JSON.stringify(safeApp, null, 2) : '');
            });
            
            Lampa.Listener.follow('activity', function(e) {
                // Безпечний екстрактор, щоб уникнути помилок циклічних посилань
                var safeData = {};
                if (e.id) safeData.id = e.id;
                if (e.source) safeData.source = e.source;
                if (e.page) safeData.page = e.page;
                if (e.query) safeData.query = e.query;
                
                if (e.movie && typeof e.movie === 'object') {
                    safeData.movie = e.movie.title || e.movie.name || e.movie.original_title || e.movie.id;
                }
                if (e.item && typeof e.item === 'object') {
                    safeData.item = e.item.title || e.item.name || e.item.id;
                }
                if (e.card && typeof e.card === 'object') {
                    safeData.card = e.card.title || e.card.name || e.card.id;
                }
                
                var payloadStr = Object.keys(safeData).length ? JSON.stringify(safeData, null, 2) : '';
                interceptActivity('ACTIVITY', e.type || 'unknown', e.component || 'unknown', payloadStr);
            });
        }
    }, 200);
    function pushNetToUI(method, url, status, responseText) {
        if (!uiReady) return;
        var $net = $('#lmc-content-network');
        if ($net.children().length > 300) {
            if ($net.hasClass('lmc-reversed')) $net.children().last().remove();
            else $net.children().first().remove();
        }

        var time = new Date().toLocaleTimeString('uk-UA', { hour12: false }).substring(0, 5);
        var statusClass = (status >= 200 && status < 300) ? 'lmc-net-200' : 'lmc-net-err';
        var formattedResponse = formatLongText(responseText || 'Немає відповіді');

        var html = '<div class="lmc-network-row selector">' +
            '<div class="lmc-net-head"><span class="lmc-time">' + time + ' - </span><span class="lmc-net-status ' + statusClass + '">' + status + '</span> ' + 
            '<strong style="color:#20c997;">' + method + '</strong> <span class="lmc-net-url">' + escapeHtml(url) + '</span></div>' +
            '<div class="lmc-net-response">' + formattedResponse + '</div></div>';

        if ($net.hasClass('lmc-reversed')) $(html).prependTo($net);
        else $(html).appendTo($net);
        
        updateCounter('net'); applySearch();
    }

    function interceptNet(method, url, status, responseText) {
        if (uiReady) pushNetToUI(method, url, status, responseText); else netBuffer.push({ method: method, url: url, status: status, response: responseText });
    }

    var originalXhrOpen = window.XMLHttpRequest.prototype.open, originalXhrSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.open = function (method, url) { this._lmcMethod = method; this._lmcUrl = url; return originalXhrOpen.apply(this, arguments); };
    window.XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () { interceptNet(this._lmcMethod, this._lmcUrl, this.status, this.responseText); });
        this.addEventListener('error', function () { interceptNet(this._lmcMethod, this._lmcUrl, 'ERR', 'Network Error / CORS'); });
        return originalXhrSend.apply(this, arguments);
    };

    var originalFetch = window.fetch;
    window.fetch = function () {
        var url = typeof arguments[0] === 'object' ? arguments[0].url : arguments[0];
        var method = arguments[1] && arguments[1].method ? arguments[1].method : 'GET';
        return originalFetch.apply(this, arguments).then(function (response) {
            var clone = response.clone(); clone.text().then(function (text) { interceptNet(method, url, response.status, text); }); return response;
        }).catch(function (error) { interceptNet(method, url, 'ERR', error.message); throw error; });
    };

    function updateStorageAndCache() {
        var $storage = $('#lmc-content-storage').empty(), $cache = $('#lmc-content-cache').empty();
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i), val = localStorage.getItem(key);
            var html = '<div class="lmc-item-wrap">' +
                       '<div class="lmc-item-text selector"><strong style="color:#20c997;">' + escapeHtml(key) + '</strong>: ' + formatLongText(val) + '</div>' +
                       '<div class="lmc-del-btn selector" data-key="' + escapeHtml(key) + '">Видалити</div>' +
                       '</div>';
            if (key.indexOf('cache') > -1 || key.indexOf('hash') > -1 || key.indexOf('history') > -1) $cache.append(html); else $storage.append(html);
        }
    }

    function updateInfoTab() {
        var $info = $('#lmc-content-info').empty();
        var ms = performance.now() - startTime;
        var uptime = Math.floor(ms / 1000 / 60) + ' хв ' + Math.floor((ms / 1000) % 60) + ' сек';
        var dpr = window.devicePixelRatio || 1;
        var screenW = Math.round(window.screen.width * dpr);
        var screenH = Math.round(window.screen.height * dpr);
        var memUsage = (window.performance && performance.memory) ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'Not supported';

        var data = [
            { k: 'Version', v: window.Lampa && Lampa.Manifest ? Lampa.Manifest.app_version : 'Unknown' },
            { k: 'Build date', v: window.Lampa && Lampa.Manifest && Lampa.Manifest.time ? new Date(Lampa.Manifest.time).toLocaleString() : 'Unknown' },
            { k: 'Active component', v: window.Lampa && Lampa.Activity && Lampa.Activity.active() ? Lampa.Activity.active().component : 'None' },
            { k: 'Session uptime', v: uptime },
            { k: 'Location', v: window.location.href },
            { k: 'Hash', v: window.Lampa && Lampa.Storage ? Lampa.Storage.get('hash', 'unknown') : 'unknown' },
            { k: 'Platform', v: window.Lampa && Lampa.Platform ? Lampa.Platform.get() : 'Unknown' },
            { k: 'Is TV', v: window.Lampa && Lampa.Platform ? Lampa.Platform.is('tv') : 'false' },
            { k: 'Is Mobile', v: /Mobi|Android/i.test(navigator.userAgent) ? 'true' : 'false' },
            { k: 'Is PWA', v: window.matchMedia('(display-mode: standalone)').matches ? 'true' : 'false' },
            { k: 'Is touch', v: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ? 'true' : 'false' },
            { k: 'Touch points', v: navigator.maxTouchPoints || 0 },
            { k: 'User agent', v: navigator.userAgent },
            { k: 'Memory Usage', v: memUsage },
            { k: 'Screen size', v: screenW + ' / ' + screenH },
            { k: 'Interface size', v: window.innerWidth + ' / ' + window.innerHeight },
            { k: 'Pixel ratio', v: dpr }
        ];
        
        data.forEach(function(item) { 
            $info.append('<div class="lmc-row selector"><strong>' + item.k + ':</strong> <span style="color:#aaa;">' + escapeHtml(item.v) + '</span></div>'); 
        });
    }

    function updateExtensionsTab() {
        var $ext = $('#lmc-content-extensions').empty();
        if (window.Lampa && Lampa.Storage) {
            $ext.append('<div class="lmc-section-title">Встановлені плагіни (Storage)</div>');
            var plugins = Lampa.Storage.get('plugins') || [];
            plugins.forEach(function(p) {
                var stat = p.status ? '<span style="color:#20c997;">[ON]</span>' : '<span style="color:#f44336;">[OFF]</span>';
                var btnClass = p.status ? 'lmc-plug-off' : 'lmc-plug-on';
                var btnText = p.status ? 'Вимкнути' : 'Увімкнути';

                var html = '<div class="lmc-item-wrap">' +
                           '<div class="lmc-item-text selector">' + stat + ' <strong>' + escapeHtml(p.name || 'Без назви') + '</strong><br><span class="lmc-plugin-url">' + escapeHtml(p.url) + '</span></div>' +
                           '<div class="lmc-plugin-toggle selector ' + btnClass + '" data-url="' + escapeHtml(p.url) + '">' + btnText + '</div>' +
                           '</div>';
                $ext.append(html);
            });
        }
        $ext.append('<div class="lmc-section-title" style="margin-top:10px;">Завантажені скрипти (DOM)</div>');
        $('script').each(function() { if (this.src) $ext.append('<div class="lmc-row selector"><span class="lmc-plugin-url">' + escapeHtml(this.src) + '</span></div>'); });
    }

    // ЛОГІКА МОДАЛЬНОГО ВІКНА ДЛЯ ТВ
    function showModal(text) {
        $('#lmc-modal').remove();
        var html = '<div id="lmc-modal">' +
                   '<div id="lmc-modal-close" class="selector">Закрити</div>' +
                   '<div id="lmc-modal-content" class="selector"></div>' +
                   '</div>';
        $('body').append(html);
        $('#lmc-modal-content').text(text);

        var prevFocus = window.Navigator.getFocusedElement();

        Lampa.Controller.add('lmc_modal', {
            toggle: function() {
                Lampa.Controller.collectionSet(document.getElementById('lmc-modal'));
                Lampa.Controller.collectionFocus(false, document.getElementById('lmc-modal'));
            },
            right: function() { window.Navigator.move('right'); },
            left:  function() { window.Navigator.move('left'); },
            down:  function() { 
                var focus = window.Navigator.getFocusedElement();
                if (focus && focus.id === 'lmc-modal-content') focus.scrollTop += 120;
                else window.Navigator.move('down');
            },
            up:    function() { 
                var focus = window.Navigator.getFocusedElement();
                if (focus && focus.id === 'lmc-modal-content') focus.scrollTop -= 120;
                else window.Navigator.move('up');
            },
            enter: function() { 
                var focus = window.Navigator.getFocusedElement();
                if (focus && focus.id === 'lmc-modal-close') closeModal(prevFocus);
            },
            back: function() { closeModal(prevFocus); }
        });

        Lampa.Controller.toggle('lmc_modal');
        window.Navigator.focus(document.getElementById('lmc-modal-content'));

        $('#lmc-modal').on('hover:enter click', '#lmc-modal-close', function() { closeModal(prevFocus); });
    }

    function closeModal(prevFocus) {
        $('#lmc-modal').remove();
        Lampa.Controller.toggle('lmc_console');
        if (prevFocus) {
            window.Navigator.focus(prevFocus);
            scrollToFocused(); 
        }
    }

    function closeConsole() {
        $('#lampa-mob-console-window').hide();
        $('#lmc-search-input').val('');
        applySearch();
        if (window.Lampa && Lampa.Controller && prev_controller && prev_controller !== 'lmc_console') {
            Lampa.Controller.toggle(prev_controller);
        }
    }

    function scrollToFocused() {
        var focus = window.Navigator.getFocusedElement();
        if (!focus) return;
        try {
            focus.scrollIntoView({ 
                block: 'center', 
                behavior: (window.Lampa && window.Lampa.Platform && Lampa.Platform.is('tv')) ? 'auto' : 'smooth' 
            });
        } catch (e) {
            focus.scrollIntoView(); 
        }
    }

    function openConsole() {
        if (window.Lampa && Lampa.Controller) {
            var activeControl = Lampa.Controller.enabled();
            if (activeControl && activeControl.name !== 'lmc_console') {
                prev_controller = activeControl.name;
            }
        }

        $('#lampa-mob-console-window').css('display', 'flex');
        var winDom = document.getElementById('lampa-mob-console-window');
        
        if (window.Lampa && Lampa.Controller) {
            if (!window.lmc_controller_added) {
                Lampa.Controller.add('lmc_console', {
                    toggle: function() {
                        Lampa.Controller.collectionSet(winDom);
                        Lampa.Controller.collectionFocus(false, winDom);
                    },
                    right: function() { window.Navigator.move('right'); scrollToFocused(); },
                    left:  function() { window.Navigator.move('left'); scrollToFocused(); },
                    down:  function() { window.Navigator.move('down'); scrollToFocused(); },
                    up:    function() { window.Navigator.move('up'); scrollToFocused(); },
                    enter: function() { 
                        var focused = window.Navigator.getFocusedElement();
                        if (focused) {
                            if (focused.id === 'lmc-search-input') focused.focus();
                            else $(focused).trigger('click'); 
                        }
                    },
                    back:  function() { closeConsole(); }
                });
                window.lmc_controller_added = true;
            }
            Lampa.Controller.toggle('lmc_console');
            if (window.Navigator) window.Navigator.focus(winDom.querySelector('.lmc-tab.active'));
        }
    }

    function injectHeaderBtn() {
        if ($('#lmc-head-btn-wrap').length) return; 
        var iconSvg = '<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">' +
                      '<path d="M3.5 4.5L6.5 7.5L3.5 10.5M8 10.5H12M1.5 1.5H13.5C14.0523 1.5 14.5 1.94772 14.5 2.5V12.5C14.5 13.0523 14.0523 13.5 13.5 13.5H1.5C0.947716 13.5 0.5 13.0523 0.5 12.5V2.5C0.5 1.94772 0.947715 1.5 1.5 1.5Z"/>' +
                      '</svg>';
        var btn = $('<div id="lmc-head-btn-wrap" class="head__action selector" title="Console Tools">' + iconSvg + '</div>');
        btn.on('click hover:enter', function(e) {
            e.stopPropagation();
            if (!$('#lampa-mob-console-window').is(':visible')) openConsole();
        });
        var $actions = $('.head__actions');
        if ($actions.length) {
            var $reloadBtn = $actions.find('.open--reload, [data-action="reload"]').first();
            if ($reloadBtn.length) $reloadBtn.before(btn); else $actions.append(btn);
        }
    }
    function initUI() {
        if (uiReady) return;

        var css = `
            #lampa-mob-console-window { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; height: 100dvh; background: #0c0d0f; z-index: 9999999; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #ddd; font-size: 11.5px; }
            #lampa-mob-console-header { display: flex; justify-content: space-between; padding: 10px 14px; background: #1a1c1f; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; flex-shrink: 0; }
            #lmc-search-bar { padding: 8px 14px; background: #141619; border-bottom: 1px solid rgba(255,255,255,0.03); position: relative; display: flex; align-items: center; flex-shrink: 0; }
            #lmc-search-input { flex: 1; background: #212429; color: #fff; border: 1px solid transparent; padding: 8px 30px 8px 10px; border-radius: 4px; outline: none; font-family: inherit; font-size: inherit; box-sizing: border-box; }
            #lmc-search-input.focus, #lmc-search-input:focus { border-color: #20c997; background: #2a2e33; }
            #lmc-search-clear { position: absolute; right: 24px; top: 15px; color: #888; font-size: 16px; cursor: pointer; display: none; font-weight: bold; width: 18px; height: 18px; text-align: center; line-height: 16px; }
            #lampa-mob-console-tabs { display: flex; background: #0c0d0f; overflow-x: auto; white-space: nowrap; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); flex-shrink: 0; }
            #lampa-mob-console-tabs::-webkit-scrollbar { display: none; }
            .lmc-tab { padding: 6px 12px; background: #16181b; border-radius: 6px; margin-right: 6px; text-align: center; color: #aaa; font-size: 11px; cursor: pointer; border: 1px solid rgba(255,255,255,0.03); transition: all 0.2s; user-select: none; font-weight: 500; }
            .lmc-tab.active { background: rgba(32, 201, 151, 0.1); color: #20c997; border-color: #20c997; }
            .lmc-tab.focus { outline: 1.5px solid #fff; }
            .lmc-content { display: none; flex: 1; overflow-y: auto; padding: 8px 14px 40px 14px; word-wrap: break-word; white-space: pre-wrap; flex-direction: column; position: relative; scroll-behavior: smooth; }
            .lmc-content.active { display: flex; }
            #lampa-mob-console-close { padding: 0 8px; font-size: 26px; line-height: 0.8; cursor: pointer; color: #888; transition: color 0.2s; font-weight: normal; }
            #lampa-mob-console-close:hover { color: #fff; }
            #lampa-mob-console-close.focus { color: #fff; outline: none; text-shadow: 0 0 10px rgba(255,255,255,0.5); }
            .lmc-row { font-size: 11.5px; margin-bottom: 0; padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,0.07); user-select: none; cursor: pointer; border-radius: 2px; }
            .lmc-row:hover { background: rgba(255,255,255,0.02); }
            .lmc-row.focus, .lmc-network-row.focus { outline: 1.5px solid #20c997; background: rgba(32, 201, 151, 0.05); }
            .lmc-time { color: #666; font-size: 10.5px; margin-right: 4px; }
            .lmc-prefix { color: #999; font-size: 10.5px; margin-right: 4px; font-weight: bold; }
            .lmc-warn .lmc-prefix { color: #ffeb3b; }
            .lmc-warn { border-left: 2px solid #ffeb3b; padding-left: 6px; }
            .lmc-error .lmc-prefix { color: #f44336; }
            .lmc-error { border-left: 2px solid #f44336; background: rgba(244, 67, 54, 0.03); padding-left: 6px; }
            .lmc-info .lmc-prefix { color: #03a9f4; }
            .lmc-collapsible { overflow: hidden; pointer-events: none; }
            .lmc-collapsible.collapsed { max-height: 40px; position: relative; }
            .lmc-collapsible.collapsed::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 20px; background: linear-gradient(to bottom, rgba(12,13,15,0), rgba(12,13,15,1)); }
            .lmc-network-row { font-size: 11.5px; margin-bottom: 0; padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,0.07); user-select: none; cursor: pointer; border-radius: 2px; }
            .lmc-network-row:hover { background: rgba(255,255,255,0.02); }
            .lmc-net-head { margin-bottom: 4px; pointer-events: none; font-weight: 500; }
            .lmc-net-status { font-weight: bold; font-size: 10.5px; color: #aaa; margin-right: 4px; }
            .lmc-net-200 { color: #4caf50; }
            .lmc-net-err { color: #f44336; }
            .lmc-net-url { color: #aaa; word-break: break-all; margin-left: 4px; }
            .lmc-net-response { color: #eee; font-size: 11.5px; background: #0c0d0f; padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); pointer-events: none; }
            .lmc-item-wrap { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 5px 0; }
            .lmc-item-text { flex: 1; min-width: 0; padding: 5px; border-radius: 2px; cursor: pointer; user-select: none; }
            .lmc-item-text:hover { background: rgba(255,255,255,0.02); }
            .lmc-item-text.focus { outline: 1.5px solid #20c997; background: rgba(32, 201, 151, 0.05); }
            .lmc-plugin-url { color: #888; word-break: break-all; display: block; margin-top: 2px; pointer-events: none; }
            .lmc-section-title { font-weight: bold; color: #fff; padding: 8px 0 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px; text-transform: uppercase; font-size: 10.5px; }
            .lmc-del-btn, .lmc-plugin-toggle { flex-shrink: 0; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; text-transform: uppercase; font-weight: bold; align-self: center; white-space: nowrap; margin-left: 10px; }
            .lmc-del-btn { background: rgba(244, 67, 54, 0.05); color: #f44336; border: 1px solid rgba(244, 67, 54, 0.15); }
            .lmc-plug-off { background: rgba(244, 67, 54, 0.1); color: #f44336; border: 1px solid rgba(244, 67, 54, 0.2); }
            .lmc-plug-on { background: rgba(32, 201, 151, 0.1); color: #20c997; border: 1px solid rgba(32, 201, 151, 0.2); }
            .lmc-del-btn.focus, .lmc-plugin-toggle.focus { outline: 1.5px solid #fff; background: rgba(255,255,255,0.1); color: #fff; }
            .lmc-toast { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: #20c997; color: #000; padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: bold; z-index: 99999999; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.3); pointer-events: none; }
            
            #lmc-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(12,13,15,0.98); z-index: 99999999; display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
            #lmc-modal-close { align-self: flex-end; margin-bottom: 12px; padding: 8px 16px; background: rgba(255,255,255,0.05); color: #888; border-radius: 4px; cursor: pointer; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); }
            #lmc-modal-close.focus { background: #20c997; color: #000; border-color: #20c997; outline: none; }
            #lmc-modal-content { flex: 1; overflow-y: auto; color: #ccc; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; background: #16181b; padding: 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
            #lmc-modal-content.focus { border-color: #20c997; outline: 1px solid #20c997; }
        `;
        $('<style>').text(css).appendTo('head');

        // Нове логічне сортування вкладок
        $('body').append(`
            <div id="lampa-mob-console-window">
                <div id="lampa-mob-console-header">
                    <span style="font-weight:bold; font-size: 16px;">Console</span>
                    <div id="lampa-mob-console-close" class="selector" title="Закрити">×</div>
                </div>
                <div id="lmc-search-bar">
                    <input type="text" id="lmc-search-input" class="selector" placeholder="Пошук...">
                    <div id="lmc-search-clear" class="selector">×</div>
                </div>
                <div id="lampa-mob-console-tabs">
                    <div class="lmc-tab selector active" data-target="lmc-content-logs">Console (0)</div>
                    <div class="lmc-tab selector" data-target="lmc-content-errors">Errors (0)</div>
                    <div class="lmc-tab selector" data-target="lmc-content-network">Network (0)</div>
                    <div class="lmc-tab selector" data-target="lmc-content-activity">Activity (0)</div>
                    <div class="lmc-tab selector" data-target="lmc-content-extensions">Plugins</div>
                    <div class="lmc-tab selector" data-target="lmc-content-storage">Storage</div>
                    <div class="lmc-tab selector" data-target="lmc-content-cache">Cache</div>
                    <div class="lmc-tab selector" data-target="lmc-content-info">Info</div>
                </div>
                <div id="lmc-content-logs" class="lmc-content active"></div>
                <div id="lmc-content-errors" class="lmc-content"></div>
                <div id="lmc-content-network" class="lmc-content"></div>
                <div id="lmc-content-activity" class="lmc-content"></div>
                <div id="lmc-content-extensions" class="lmc-content"></div>
                <div id="lmc-content-storage" class="lmc-content"></div>
                <div id="lmc-content-cache" class="lmc-content"></div>
                <div id="lmc-content-info" class="lmc-content"></div>
            </div>
        `);

        uiReady = true;

        logBuffer.forEach(function (item) { pushLogToUI(item.msg, item.type); }); logBuffer = [];
        netBuffer.forEach(function (item) { pushNetToUI(item.method, item.url, item.status, item.response); }); netBuffer = [];
        actBuffer.forEach(function (item) { pushActivityToUI(item.source, item.type, item.component, item.payload); }); actBuffer = [];

        injectHeaderBtn();

        $('#lampa-mob-console-window').on('hover:focus', '.selector', function() { scrollToFocused(); });

        window.addEventListener('keydown', function(e) {
            if ($('#lampa-mob-console-window').is(':visible') && $('#lmc-modal').length === 0) {
                var isInputFocused = document.activeElement && document.activeElement.id === 'lmc-search-input';
                
                if (e.keyCode === 8 && isInputFocused) {
                    e.stopPropagation(); return; 
                }
                
                if (e.keyCode === 27 || e.keyCode === 10009 || e.keyCode === 461) {
                    if (isInputFocused) {
                        document.activeElement.blur(); 
                        e.stopPropagation(); e.preventDefault();
                        if (window.Navigator) window.Navigator.focus(document.getElementById('lmc-search-input'));
                        return;
                    }
                }
            }
        }, true);

        $('#lampa-mob-console-window').on('keydown', '#lmc-search-input', function(e) {
            if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) { 
                if (e.keyCode !== 13) e.preventDefault(); 
                $(this).blur();
                if (e.keyCode === 40 && window.Lampa && Lampa.Controller) {
                    window.Navigator.focus(document.getElementById('lampa-mob-console-window').querySelector('.lmc-tab.active'));
                }
            }
        });

        $('#lampa-mob-console-window').on('hover:enter', '.selector', function(e) {
            if ($(this).is('input')) $(this).focus();
            else $(this).trigger('click');
            e.stopPropagation(); return false;
        });

        $('#lampa-mob-console-window').on('click', '.selector', function(e) {
            var $this = $(this);
            e.stopPropagation();

            if ($this.attr('id') === 'lampa-mob-console-close') { closeConsole(); return false; }

            if ($this.hasClass('lmc-tab')) {
                var target = $this.attr('data-target');
                if ($this.hasClass('active')) {
                    if (target === 'lmc-content-info') updateInfoTab();
                    else if (target === 'lmc-content-network') {
                        var $content = $('#' + target);
                        $content.toggleClass('lmc-reversed');
                        var children = $content.children('.lmc-network-row').detach().toArray();
                        children.reverse();
                        $content.append(children);
                        $content.scrollTop(0);
                        showToast($content.hasClass('lmc-reversed') ? "Нові зверху" : "Старі зверху");
                    }
                } else {
                    $('.lmc-tab').removeClass('active');
                    $('.lmc-content').removeClass('active');
                    $this.addClass('active');
                    $('#' + target).addClass('active');

                    if (target === 'lmc-content-storage' || target === 'lmc-content-cache') updateStorageAndCache();
                    if (target === 'lmc-content-info') updateInfoTab();
                    if (target === 'lmc-content-extensions') updateExtensionsTab();
                    
                    applySearch();
                    $('#' + target).scrollTop(0);
                }
                window.lmcUpdateCollection();
                return false;
            }

            if ($this.hasClass('lmc-del-btn')) {
                var key = $this.attr('data-key');
                localStorage.removeItem(key);
                $this.closest('.lmc-item-wrap').remove();
                showToast("Видалено: " + key);
                window.lmcUpdateCollection();
                return false;
            }

            if ($this.hasClass('lmc-plugin-toggle')) {
                var url = $this.attr('data-url');
                var plugins = Lampa.Storage.get('plugins') || [];
                var changed = false;

                plugins.forEach(function(p) {
                    if (p.url === url) {
                        p.status = p.status ? 0 : 1;
                        changed = true;
                        showToast(p.status ? "Увімкнено. Оновіть сторінку!" : "Вимкнено. Оновіть сторінку!");
                    }
                });

                if (changed) {
                    Lampa.Storage.set('plugins', plugins);
                    updateExtensionsTab();
                    window.lmcUpdateCollection();
                }
                return false;
            }

            // Повернення фокусу на input після стирання
            if ($this.attr('id') === 'lmc-search-clear') {
                var $input = $('#lmc-search-input');
                $input.val('').trigger('input'); 
                $input.focus();
                if (window.Navigator) window.Navigator.focus($input[0]);
                return false;
            }

            if ($this.hasClass('lmc-row') || $this.hasClass('lmc-network-row') || $this.hasClass('lmc-item-text')) {
                var $collapsible = $this.find('.lmc-collapsible');
                if ($collapsible.length) {
                    if (window.Lampa && window.Lampa.Platform && Lampa.Platform.is('tv')) {
                        showModal($collapsible.text());
                    } else {
                        $collapsible.toggleClass('collapsed');
                        scrollToFocused(); 
                    }
                }
                return false;
            }
        });

        $('#lmc-search-input').on('input', function() { applySearch(); });

        var pressTimer;
        $(document).on('touchstart mousedown', '.lmc-row, .lmc-network-row, .lmc-item-text', function(e) {
            if ($(e.target).closest('.lmc-del-btn, .lmc-plugin-toggle').length) return;
            var $row = $(this);
            pressTimer = window.setTimeout(function() {
                var clone = $row.clone();
                clone.find('.lmc-del-btn, .lmc-plugin-toggle').remove();
                var textToCopy = clone.text().trim();
                var textarea = document.createElement("textarea");
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                try { document.execCommand("copy"); showToast("Скопійовано"); } 
                catch (err) { showToast("Помилка копіювання"); }
                document.body.removeChild(textarea);
            }, 600);
        }).on('touchend touchmove mouseup mouseleave', function() {
            clearTimeout(pressTimer);
        });
    }

    function startPlugin() {
        if (window.Lampa && Lampa.Manifest && Lampa.Manifest.plugins) {
            var manifest = {
                type: 'other',
                version: PLUGIN_VERSION,
                name: PLUGIN_NAME,
                description: 'Інструмент для логування, дебагу та відладки додатку',
                author: '@elven'
            };
            Lampa.Manifest.plugins = Object.assign(Lampa.Manifest.plugins || {}, { [PLUGIN_NAME]: manifest });
        }
        setTimeout(initUI, 200); 
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
