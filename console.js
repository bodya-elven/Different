(function () {
    'use strict';

    if (window.mobileConsoleInitialized) return;
    window.mobileConsoleInitialized = true;

    var logBuffer = [];
    var netBuffer = [];
    var uiReady = false;
    var counts = { logs: 0, errors: 0, network: 0 };
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
            return '<div class="lmc-collapsible collapsed">' + escapeHtml(str) + '</div>' +
                   '<div class="lmc-more-btn selector">Розгорнути <span>▼</span></div>';
        }
        return escapeHtml(str);
    }

    function updateCounter(type) {
        if (!uiReady) return;
        var tabId = type === 'log' || type === 'warn' || type === 'info' ? 'lmc-content-logs' : 
                    type === 'error' ? 'lmc-content-errors' : 
                    type === 'net' ? 'lmc-content-network' : '';
        
        if (tabId === 'lmc-content-logs') counts.logs++;
        if (type === 'error') { counts.errors++; counts.logs++; }
        if (type === 'net') counts.network++;

        $('.lmc-tab[data-target="lmc-content-logs"]').text('Console - ' + counts.logs);
        $('.lmc-tab[data-target="lmc-content-errors"]').text('Errors - ' + counts.errors);
        $('.lmc-tab[data-target="lmc-content-network"]').text('Network - ' + counts.network);
    }

    function applySearch() {
        var query = $('#lmc-search-input').val().toLowerCase();
        var $activeContent = $('.lmc-content.active');
        $activeContent.children('.lmc-row, .lmc-network-row').each(function () {
            var text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(query) !== -1);
        });
        if (query.length > 0) $('#lmc-search-clear').show();
        else $('#lmc-search-clear').hide();
    }

    function showToast(text) {
        $('.lmc-toast').remove();
        var $toast = $('<div class="lmc-toast">' + text + '</div>').appendTo('body');
        setTimeout(function() { $toast.fadeOut(300, function() { $(this).remove(); }); }, 1500);
    }

    var originalLog = console.log, originalWarn = console.warn, originalError = console.error, originalInfo = console.info;

    function getPluginNameFromUrl(url) {
        if (!url) return 'Unknown Script';
        var filename = url.substring(url.lastIndexOf('/')+1);
        if (filename.indexOf('?') > -1) filename = filename.substring(0, filename.indexOf('?'));
        return filename || 'Inline Script';
    }

    window.addEventListener('error', function(event) {
        var plugin = getPluginNameFromUrl(event.filename);
        var msg = "Критична помилка в [" + plugin + "]: " + event.message;
        if (event.filename) msg += "\nФайл: " + event.filename + " (" + event.lineno + ":" + event.colno + ")";
        if (event.error && event.error.stack) msg += "\nСтек:\n" + event.error.stack;
        
        pushLogToUI(msg, 'error');
        originalError.apply(console, [msg]);
    }, true);

    window.addEventListener('unhandledrejection', function(event) {
        var msg = "Необроблений Promise: " + (event.reason && event.reason.stack ? event.reason.stack : event.reason);
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
            if ($errs.children().length > 100) $errs.children().first().remove();
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

    function pushNetToUI(method, url, status, responseText) {
        if (!uiReady) return;
        var $net = $('#lmc-content-network');
        if ($net.children().length > 150) {
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
            var html = '<div class="lmc-row lmc-flex-row selector"><div style="flex:1; overflow:hidden;"><strong style="color:#20c997;">' + escapeHtml(key) + '</strong>: ' + formatLongText(val) + '</div><div class="lmc-del-btn selector" data-key="' + escapeHtml(key) + '">Видалити</div></div>';
            if (key.indexOf('cache') > -1 || key.indexOf('hash') > -1 || key.indexOf('history') > -1) $cache.append(html); else $storage.append(html);
        }
    }

    function updateInfoTab() {
        var $info = $('#lmc-content-info').empty();
        var lsTotal = 0;
        for (var x in localStorage) { if (localStorage.hasOwnProperty(x)) lsTotal += ((localStorage[x].length + x.length) * 2); }
        var lsSize = (lsTotal / 1024).toFixed(2) + ' KB';
        var activeComp = window.Lampa && Lampa.Activity && Lampa.Activity.active() ? Lampa.Activity.active().component : 'None';
        var pluginsStorage = window.Lampa && Lampa.Storage ? (Lampa.Storage.get('plugins')||[]) : [];
        var activePlugs = pluginsStorage.filter(function(p){return p.status;}).length;
        var ms = performance.now() - startTime;
        var uptime = Math.floor(ms / 1000 / 60) + ' хв ' + Math.floor((ms / 1000) % 60) + ' сек';
        var dpr = window.devicePixelRatio || 1;
        var screenW = Math.round(window.screen.width * dpr);
        var screenH = Math.round(window.screen.height * dpr);

        var data = [
            { k: 'location', v: window.location.href },
            { k: 'hash', v: window.Lampa && Lampa.Storage ? Lampa.Storage.get('hash', 'unknown') : 'unknown' },
            { k: 'build date', v: window.Lampa && Lampa.Manifest && Lampa.Manifest.time ? new Date(Lampa.Manifest.time).toLocaleString() : 'Unknown' },
            { k: 'version', v: window.Lampa && Lampa.Manifest ? Lampa.Manifest.app_version : 'Unknown' },
            { k: 'platform', v: window.Lampa && Lampa.Platform ? Lampa.Platform.get() : 'Unknown' },
            { k: 'is PWA', v: window.matchMedia('(display-mode: standalone)').matches ? 'true' : 'false' },
            { k: 'is touch', v: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ? 'true' : 'false' },
            { k: 'is mobile', v: /Mobi|Android/i.test(navigator.userAgent) ? 'true' : 'false' },
            { k: 'is tv', v: window.Lampa && Lampa.Platform ? Lampa.Platform.is('tv') : 'false' },
            { k: 'touch points', v: navigator.maxTouchPoints || 0 },
            { k: 'user agent', v: navigator.userAgent },
            { k: 'pixel ratio', v: dpr },
            { k: 'interface size', v: window.innerWidth + ' / ' + window.innerHeight },
            { k: 'screen size', v: screenW + ' / ' + screenH }
        ];
        
        data.forEach(function(item) { 
            $info.append('<div class="lmc-row selector"><strong>' + item.k + ':</strong> <span style="color:#aaa;">' + escapeHtml(item.v) + '</span></div>'); 
        });
    }

    function updateExtensionsTab() {
        var $ext = $('#lmc-content-extensions').empty();
        $ext.append('<div class="lmc-section-title">Завантажені скрипти (DOM)</div>');
        $('script').each(function() { if (this.src) $ext.append('<div class="lmc-row selector"><span style="color:#aaa;">' + escapeHtml(this.src) + '</span></div>'); });
        if (window.Lampa && Lampa.Storage) {
            $ext.append('<div class="lmc-section-title" style="margin-top:10px;">Встановлені плагіни (Storage)</div>');
            var plugins = Lampa.Storage.get('plugins') || [];
            plugins.forEach(function(p) {
                var stat = p.status ? '<span style="color:#20c997;">[ON]</span>' : '<span style="color:#f44336;">[OFF]</span>';
                $ext.append('<div class="lmc-row selector">' + stat + ' <strong>' + escapeHtml(p.name || 'Без назви') + '</strong><br><span style="color:#888;">' + escapeHtml(p.url) + '</span></div>');
            });
        }
    }
    function initUI() {
        if (uiReady) return;

        var css = `
            #lampa-mob-console-window { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; height: 100dvh; background: #0c0d0f; z-index: 9999999; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #ddd; font-size: 11.5px; }
            #lampa-mob-console-header { display: flex; justify-content: space-between; padding: 10px 14px; background: #1a1c1f; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; }
            
            #lmc-search-bar { padding: 8px 14px; background: #141619; border-bottom: 1px solid rgba(255,255,255,0.03); position: relative; display: flex; align-items: center; }
            #lmc-search-input { flex: 1; background: #212429; color: #fff; border: 1px solid transparent; padding: 8px 30px 8px 10px; border-radius: 4px; outline: none; font-family: inherit; font-size: inherit; box-sizing: border-box; }
            #lmc-search-input.focus, #lmc-search-input:focus { border-color: #20c997; background: #2a2e33; }
            #lmc-search-clear { position: absolute; right: 24px; top: 15px; color: #888; font-size: 16px; cursor: pointer; display: none; font-weight: bold; width: 18px; height: 18px; text-align: center; line-height: 16px; }

            #lampa-mob-console-tabs { display: flex; background: #0c0d0f; overflow-x: auto; white-space: nowrap; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); }
            #lampa-mob-console-tabs::-webkit-scrollbar { display: none; }
            .lmc-tab { padding: 6px 12px; background: #16181b; border-radius: 6px; margin-right: 6px; text-align: center; color: #aaa; font-size: 11px; cursor: pointer; border: 1px solid rgba(255,255,255,0.03); transition: all 0.2s; user-select: none; font-weight: 500; }
            .lmc-tab.active { background: rgba(32, 201, 151, 0.1); color: #20c997; border-color: #20c997; }
            .lmc-tab.focus { outline: 1.5px solid #fff; }

            .lmc-content { display: none; flex: 1; overflow-y: auto; padding: 8px 14px; word-wrap: break-word; white-space: pre-wrap; overscroll-behavior: contain; padding-bottom: 40px; flex-direction: column; }
            .lmc-content.active { display: flex; }
            .lmc-content.lmc-reversed { flex-direction: column-reverse; }

            #lampa-mob-console-close { padding: 2px 12px; font-size: 22px; line-height: 1; border-radius: 4px; cursor: pointer; color: #aaa; transition: color 0.2s; }
            #lampa-mob-console-close:hover { color: #fff; }
            #lampa-mob-console-close.focus { color: #fff; background: rgba(255,255,255,0.1); outline: none; }
            
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
            .lmc-collapsible.collapsed { max-height: 50px; position: relative; }
            .lmc-collapsible.collapsed::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 20px; background: linear-gradient(to bottom, rgba(12,13,15,0), rgba(12,13,15,1)); }
            .lmc-more-btn { color: #888; font-size: 10.5px; margin-top: 4px; font-weight: bold; display: inline-block; padding: 3px 6px; background: #16181b; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); pointer-events: none; }
            
            .lmc-network-row { font-size: 11.5px; margin-bottom: 0; padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,0.07); user-select: none; cursor: pointer; border-radius: 2px; }
            .lmc-network-row:hover { background: rgba(255,255,255,0.02); }
            .lmc-net-head { margin-bottom: 4px; pointer-events: none; font-weight: 500; }
            .lmc-net-status { font-weight: bold; font-size: 10.5px; color: #aaa; margin-right: 4px; }
            .lmc-net-200 { color: #4caf50; }
            .lmc-net-err { color: #f44336; }
            .lmc-net-url { color: #aaa; word-break: break-all; margin-left: 4px; }
            .lmc-net-response { color: #eee; font-size: 11.5px; background: #0c0d0f; padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); pointer-events: none; }

            .lmc-flex-row { display: flex; justify-content: space-between; align-items: flex-start; }
            .lmc-del-btn { background: rgba(244, 67, 54, 0.05); color: #f44336; padding: 3px 7px; border-radius: 4px; font-size: 9px; margin-left: 8px; cursor: pointer; font-weight: 600; border: 1px solid rgba(244, 67, 54, 0.15); z-index: 2; text-transform: uppercase; }
            .lmc-del-btn.focus { outline: 1.5px solid #fff; background: #f44336; color: #fff; }
            .lmc-section-title { font-weight: bold; color: #fff; padding: 8px 0 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px; text-transform: uppercase; font-size: 10.5px; }

            .lmc-toast { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: #20c997; color: #000; padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: bold; z-index: 99999999; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.3); pointer-events: none; }
        `;
        $('<style>').text(css).appendTo('head');

        $('body').append(`
            <div id="lampa-mob-console-window">
                <div id="lampa-mob-console-header">
                    <span style="font-weight:bold; font-size: 16px;">Console Tools</span>
                    <div id="lampa-mob-console-close" class="selector" title="Закрити">×</div>
                </div>
                <div id="lmc-search-bar">
                    <input type="text" id="lmc-search-input" class="selector" placeholder="Пошук...">
                    <div id="lmc-search-clear">×</div>
                </div>
                <div id="lampa-mob-console-tabs">
                    <div class="lmc-tab selector active" data-target="lmc-content-logs">Console - 0</div>
                    <div class="lmc-tab selector" data-target="lmc-content-errors">Errors - 0</div>
                    <div class="lmc-tab selector" data-target="lmc-content-network">Network - 0</div>
                    <div class="lmc-tab selector" data-target="lmc-content-info">Info</div>
                    <div class="lmc-tab selector" data-target="lmc-content-extensions">Plugins</div>
                    <div class="lmc-tab selector" data-target="lmc-content-cache">Cache</div>
                    <div class="lmc-tab selector" data-target="lmc-content-storage">Storage</div>
                </div>
                <div id="lmc-content-logs" class="lmc-content active"></div>
                <div id="lmc-content-errors" class="lmc-content"></div>
                <div id="lmc-content-network" class="lmc-content"></div>
                <div id="lmc-content-info" class="lmc-content"></div>
                <div id="lmc-content-extensions" class="lmc-content"></div>
                <div id="lmc-content-cache" class="lmc-content"></div>
                <div id="lmc-content-storage" class="lmc-content"></div>
            </div>
        `);

        uiReady = true;

        logBuffer.forEach(function (item) { pushLogToUI(item.msg, item.type); }); logBuffer = [];
        netBuffer.forEach(function (item) { pushNetToUI(item.method, item.url, item.status, item.response); }); netBuffer = [];

        function injectHeaderBtn() {
            if ($('#lmc-head-btn-wrap').length) return; 
            
            // Твій SVG, stroke-width 1.6
            var iconSvg = '<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">' +
                          '<path d="M3.5 4.5L6.5 7.5L3.5 10.5M8 10.5H12M1.5 1.5H13.5C14.0523 1.5 14.5 1.94772 14.5 2.5V12.5C14.5 13.0523 14.0523 13.5 13.5 13.5H1.5C0.947716 13.5 0.5 13.0523 0.5 12.5V2.5C0.5 1.94772 0.947715 1.5 1.5 1.5Z"/>' +
                          '</svg>';
            
            // Залишаємо ТІЛЬКИ рідні класи Лампи. Жодних кастомних .lmc-head-btn в CSS
            var btnHtml = '<div id="lmc-head-btn-wrap" class="head__action selector" title="Console Tools">' + iconSvg + '</div>';
            
            var $actions = $('.head__actions');
            if ($actions.length) {
                var $reloadBtn = $actions.find('.open--reload, [data-action="reload"]').first();
                if ($reloadBtn.length) $reloadBtn.before(btnHtml); else $actions.append(btnHtml);
            }
            
            // Явно вішаємо обидві події
            $('#lmc-head-btn-wrap').on('click hover:enter', function(e) { 
                e.stopPropagation();
                openConsole(); 
            });
        }
        
        setInterval(injectHeaderBtn, 1000);
        injectHeaderBtn();

        function closeConsole() {
            $('#lampa-mob-console-window').hide();
            
            if (window.history.state && window.history.state.lmc_open) {
                window.history.back(); 
            }
            
            if (window.Lampa && Lampa.Controller && prev_controller) {
                Lampa.Controller.toggle(prev_controller);
            }
        }

        function openConsole() {
            if (window.Lampa && Lampa.Controller && Lampa.Controller.enabled()) {
                prev_controller = Lampa.Controller.enabled().name;
            }

            $('#lampa-mob-console-window').css('display', 'flex');
            
            if (!window.history.state || !window.history.state.lmc_open) {
                window.history.pushState({lmc_open: true}, "");
            }
            
            if (window.Lampa && Lampa.Controller) {
                if (!window.lmc_controller_added) {
                    Lampa.Controller.add('lmc_console', {
                        toggle: function() {
                            Lampa.Controller.collectionSet($('#lampa-mob-console-window .selector'));
                            Lampa.Controller.collectionFocus(false, $('#lampa-mob-console-window'));
                        },
                        right: function() { Lampa.Controller.collectionDirection('right', $('#lampa-mob-console-window .selector')); },
                        left: function() { Lampa.Controller.collectionDirection('left', $('#lampa-mob-console-window .selector')); },
                        down: function() { Lampa.Controller.collectionDirection('down', $('#lampa-mob-console-window .selector')); },
                        up: function() { Lampa.Controller.collectionDirection('up', $('#lampa-mob-console-window .selector')); },
                        back: function() { closeConsole(); }
                    });
                    window.lmc_controller_added = true;
                }
                Lampa.Controller.toggle('lmc_console');
            }
        }

        $('#lampa-mob-console-close').on('click hover:enter', function (e) { 
            e.stopPropagation();
            closeConsole(); 
        });

        window.addEventListener('popstate', function(e) {
            if ($('#lampa-mob-console-window').is(':visible')) {
                e.stopImmediatePropagation();
                e.preventDefault();
                closeConsole(); 
            }
        }, false);

        window.addEventListener('keydown', function(e) {
            if ($('#lampa-mob-console-window').is(':visible')) {
                if (e.keyCode === 8 && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                    return; 
                }
                if (e.keyCode === 27 || e.keyCode === 8 || e.keyCode === 10009 || e.keyCode === 461) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    closeConsole();
                }
            }
        }, true);
        
        $(document).on('hover:enter', '.selector', function(e) {
            // Щоб уникнути подвійного кліку на хрестику чи іконці
            if ($(this).attr('id') !== 'lampa-mob-console-close' && $(this).attr('id') !== 'lmc-head-btn-wrap') {
                $(this).trigger('click');
            }
            e.stopPropagation();
        });

        $('.lmc-tab').on('click', function () {
            var target = $(this).attr('data-target');
            
            if ($(this).hasClass('active')) {
                if (target === 'lmc-content-info') {
                    updateInfoTab();
                } else if (target === 'lmc-content-network') {
                    var $content = $('#' + target);
                    $content.toggleClass('lmc-reversed');
                    var children = $content.children('.lmc-network-row').get();
                    $content.append(children.reverse());
                    $content.scrollTop(0); 
                    showToast($content.hasClass('lmc-reversed') ? "Нові зверху" : "Старі зверху");
                }
                return;
            }

            $('.lmc-tab').removeClass('active');
            $('.lmc-content').removeClass('active');
            
            $(this).addClass('active');
            $('#' + target).addClass('active');

            if (target === 'lmc-content-storage' || target === 'lmc-content-cache') updateStorageAndCache();
            if (target === 'lmc-content-info') updateInfoTab();
            if (target === 'lmc-content-extensions') updateExtensionsTab();
            
            applySearch();
        });

        $('#lmc-search-input').on('keydown keyup keypress', function(e) { e.stopPropagation(); });
        $('#lmc-search-input').on('input', applySearch);
        $('#lmc-search-clear').on('click', function() { $('#lmc-search-input').val('').trigger('input'); });

        $(document).on('click', '.lmc-row, .lmc-network-row', function(e) {
            if ($(e.target).hasClass('lmc-del-btn')) return;
            var $collapsible = $(this).find('.lmc-collapsible');
            if ($collapsible.length) {
                var isCollapsed = $collapsible.hasClass('collapsed');
                $collapsible.toggleClass('collapsed');
                var $btn = $(this).find('.lmc-more-btn');
                $btn.html(isCollapsed ? 'Згорнути <span>▲</span>' : 'Розгорнути <span>▼</span>');
            }
        });

        $(document).on('click', '.lmc-del-btn', function(e) {
            e.stopPropagation(); 
            var key = $(this).attr('data-key');
            localStorage.removeItem(key);
            $(this).closest('.lmc-row').remove();
            showToast("Видалено: " + key);
        });

        var pressTimer;
        $(document).on('touchstart mousedown', '.lmc-row, .lmc-network-row', function(e) {
            if ($(e.target).hasClass('lmc-del-btn')) return;
            var $row = $(this);
            pressTimer = window.setTimeout(function() {
                var clone = $row.clone();
                clone.find('.lmc-more-btn, .lmc-del-btn').remove();
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

    var checkReady = setInterval(function () {
        if (window.appready || document.querySelector('.app') || document.body) {
            clearInterval(checkReady);
            setTimeout(initUI, 500);
        }
    }, 200);

})();
