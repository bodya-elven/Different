(function() {
  'use strict';

  /*
  |==========================================================================
  | localStorage shim & Promise & Fetch Polyfills (Для сумісності)
  |==========================================================================
  */
  (function() {
    var ok = true;
    try {
      var t = '__lmp_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
    } catch (e) { ok = false; }
    if (!ok) {
      var mem = {};
      window.localStorage = {
        getItem: function(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
        setItem: function(k, v) { mem[k] = String(v); },
        removeItem: function(k) { delete mem[k]; },
        clear: function() { mem = {}; }
      };
    }
  })();

  (function(global) {
    if (global.Promise) return;
    var PENDING = 0, FULFILLED = 1, REJECTED = 2;
    function asap(fn) { setTimeout(fn, 0); }
    function MiniPromise(executor) {
      if (!(this instanceof MiniPromise)) return new MiniPromise(executor);
      var self = this; self._state = PENDING; self._value = void 0; self._handlers = [];
      function resolve(value) {
        if (self._state !== PENDING) return;
        if (value && (typeof value === 'object' || typeof value === 'function')) {
          var then;
          try { then = value.then; } catch (e) { return reject(e); }
          if (typeof then === 'function') return then.call(value, resolve, reject);
        }
        self._state = FULFILLED; self._value = value; finale();
      }
      function reject(reason) {
        if (self._state !== PENDING) return;
        self._state = REJECTED; self._value = reason; finale();
      }
      function finale() { asap(function() { var q = self._handlers; self._handlers = []; for (var i = 0; i < q.length; i++) handle(q[i]); }); }
      function handle(h) {
        if (self._state === PENDING) { self._handlers.push(h); return; }
        var cb = self._state === FULFILLED ? h.onFulfilled : h.onRejected;
        if (!cb) { (self._state === FULFILLED ? h.resolve : h.reject)(self._value); return; }
        try { var ret = cb(self._value); h.resolve(ret); } catch (e) { h.reject(e); }
      }
      this.then = function(onFulfilled, onRejected) {
        return new MiniPromise(function(resolve, reject) { handle({ onFulfilled: onFulfilled, onRejected: onRejected, resolve: resolve, reject: reject }); });
      };
      this.catch = function(onRejected) { return this.then(null, onRejected); };
      try { executor(resolve, reject); } catch (e) { reject(e); }
    }
    MiniPromise.resolve = function(v) { return new MiniPromise(function(res) { res(v); }); };
    MiniPromise.reject = function(r) { return new MiniPromise(function(_, rej) { rej(r); }); };
    global.Promise = MiniPromise;
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

  (function(global) {
    if (global.fetch) return;
    function Response(body, init) {
      this.status = init && init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this._body = body == null ? '' : String(body);
      this.headers = (init && init.headers) || {};
    }
    Response.prototype.json = function() {
      var self = this;
      return Promise.resolve().then(function() { return JSON.parse(self._body || 'null'); });
    };
    global.fetch = function(input, init) {
      init = init || {};
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var method = (init.method || 'GET').toUpperCase();
      var headers = init.headers || {};
      if (global.Lampa && Lampa.Reguest) {
        return new Promise(function(resolve) {
          new Lampa.Reguest().native(url, function(data) {
            var text = (typeof data === 'string') ? data : (data != null ? JSON.stringify(data) : '');
            resolve(new Response(text, { status: 200, headers: headers }));
          }, function() { resolve(new Response('', { status: 500, headers: headers })); }, false, { dataType: 'text', method: method, headers: headers });
        });
      }
    };
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

})();

(function() {
  'use strict';

  /* Шими для старих Webview */
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) callback.call(thisArg, this[i], i, this);
    };
  }
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
      var el = this;
      while (el && el.nodeType === 1) {
        if (el.matches(selector)) return el;
        el = el.parentElement || el.parentNode;
      }
      return null;
    };
  }
  /*
  |==========================================================================
  | КОНФІГУРАЦІЯ
  |==========================================================================
  */
  var LMP_ENH_CONFIG = {
    apiKeys: { mdblist: '' },
    monochromeIcons: false
  };

  // Твоє зовнішнє посилання на папку з іконками
  var ICONS_BASE_URL = 'https://bodya-elven.github.io/different/icons/';

  var ICONS = {
    imdb: ICONS_BASE_URL + 'imdb.svg',
    tmdb: ICONS_BASE_URL + 'tmdb.svg',
    trakt: ICONS_BASE_URL + 'trakt.svg',
    letterboxd: ICONS_BASE_URL + 'letterboxd.svg',
    metacritic: ICONS_BASE_URL + 'metacritic.svg',
    rotten_good: ICONS_BASE_URL + 'rt.svg',
    rotten_bad: ICONS_BASE_URL + 'rt-bad.svg',
    popcorn: ICONS_BASE_URL + 'popcorn.svg',
    popcorn_bad: ICONS_BASE_URL + 'popcorn-bad.svg' // Додано для майбутньої перевірки глядацького рейтингу
  };

  var pluginStyles = "<style>" +
    ".loading-dots-container { display: flex; align-items: center; font-size: 0.85em; color: #ccc; padding: 0.6em 1em; border-radius: 0.5em; }" +
    ".loading-dots__text { margin-right: 1em; }" +
    ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
    ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
    ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
    "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +

    ".full-start__rate .source--name img:not(:first-child) { display: none !important; }" +
    ".full-start__rate .source--name { background: none !important; position: relative; display: inline-flex; align-items: center; justify-content: center; }" +
    ".full-start__rate .source--name img { position: relative; z-index: 2; display: block !important; }" +

    ":root{" +
    "  --lmp-h-imdb:22px; --lmp-h-mc:22px; --lmp-h-rt:24px;" +
    "  --lmp-h-popcorn:24px; --lmp-h-tmdb:24px;" +
    "  --lmp-h-trakt:22px; --lmp-h-letterboxd:22px;" +
    "}" +

    "body:not(.lmp-enh--mono) .full-start__rate.rating--green  { color: #2ecc71; }" +
    "body:not(.lmp-enh--mono) .full-start__rate.rating--blue   { color: #60a5fa; }" +
    "body:not(.lmp-enh--mono) .full-start__rate.rating--orange { color: #f59e0b; }" +
    "body:not(.lmp-enh--mono) .full-start__rate.rating--red    { color: #ef4444; }" +
    "body.lmp-enh--mono .rating--green, body.lmp-enh--mono .rating--blue, body.lmp-enh--mono .rating--orange, body.lmp-enh--mono .rating--red, body.lmp-enh--mono .full-start__rate { color: inherit !important; }" +

    ".full-start-new__rate-line .full-start__rate { margin-right: 0.3em !important; }" +
    ".full-start-new__rate-line .full-start__rate:last-child { margin-right: 0 !important; }" +

    ".full-start-new__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader)," +
    ".full-start__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader) { opacity: 0 !important; pointer-events: none !important; transition: opacity 0.15s; }" +

    ".rate--imdb .source--name img{height:var(--lmp-h-imdb);}" +
    ".rate--mc .source--name img{height:var(--lmp-h-mc);}" +
    ".rate--rt .source--name img{height:var(--lmp-h-rt);}" +
    ".rate--popcorn .source--name img{height:var(--lmp-h-popcorn);}" +
    ".rate--tmdb .source--name img{height:var(--lmp-h-tmdb);}" +
    ".rate--trakt .source--name img{height:var(--lmp-h-trakt);}" +
    ".rate--letterboxd .source--name img{height:var(--lmp-h-letterboxd);}" +

    ".full-start__rate .source--name{ display:inline-flex; align-items:center; justify-content:center; }" +
    ".settings-param__descr,.settings-param__subtitle{white-space:pre-line;}" +

    "@media (max-width: 600px){" +
    "  .full-start-new__rate-line{flex-wrap:wrap;}" +
    "  .full-start__rate{ margin-right:.25em !important; margin-bottom:.25em; font-size:16px; min-width:unset; }" +
    "  :root{ --lmp-h-imdb:14px; --lmp-h-mc:14px; --lmp-h-rt:16px; --lmp-h-popcorn:16px; --lmp-h-tmdb:16px; --lmp-h-trakt:14px; --lmp-h-letterboxd:14px; }" +
    "  .loading-dots-container{font-size:.8em; padding:.4em .8em;}" +
    "}" +
    "@media (max-width: 360px){" +
    "  .full-start__rate{font-size:14px;}" +
    "  :root{ --lmp-h-imdb:12px; --lmp-h-mc:12px; --lmp-h-rt:14px; --lmp-h-popcorn:14px; --lmp-h-tmdb:14px; --lmp-h-trakt:12px; --lmp-h-letterboxd:12px; }" +
    "}" +

    "body.lmp-enh--rate-border .full-start__rate{ border: 1px solid rgba(255, 255, 255, 0.45); border-radius: 0.3em; box-sizing: border-box; }" +
    "</style>";

  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';

  var RCFG_DEFAULT = {
    ratings_mdblist_key: (LMP_ENH_CONFIG.apiKeys.mdblist || ''),
    ratings_cache_days: '3',
    ratings_bw_logos: false,
    ratings_logo_offset: 0,
    ratings_font_offset: 0,
    ratings_badge_alpha: 0.15,
    ratings_badge_tone: 0,
    ratings_gap_step: 0,
    ratings_colorize_all: false,
    ratings_rate_border: false
  };

  var __lmpRateLineObs = null;
  var currentRatingsData = null;
  var __lmpLastReqToken = null;
  function getCardType(card) {
    var type = card.media_type || card.type;
    if (type === 'movie' || type === 'tv') return type;
    return card.name || card.original_name ? 'tv' : 'movie';
  }

  function getRatingClass(rating) {
    var r = parseFloat(rating);
    if (isNaN(r)) return 'rating--red';
    if (r >= 8.0) return 'rating--green';
    if (r >= 6.0) return 'rating--blue';
    if (r >= 4.0) return 'rating--orange';
    return 'rating--red';
  }

  function iconImg(url, alt, sizePx, extraStyle) {
    return '<img style="width:auto; display:inline-block; vertical-align:middle; object-fit:contain; ' + (extraStyle || '') + '" src="' + url + '" alt="' + (alt || '') + '">';
  }

  function getPrimaryRateLine(render){
    if (!render || !render.length) return $();
    var $left = $('.cardify__left .full-start-new__rate-line.rate-fix:not([data-lmp-fake]), .cardify__left .full-start__rate-line.rate-fix:not([data-lmp-fake])', render).first();
    if ($left.length) return $left;
    var $any = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render)
      .filter(function(){ return !$(this).closest('.cardify__right').length; }).first();
    return $any;
  }

  function cleanupRtgInjected(render){
    if (!render || !render.length) return;
    render.find('.lmp-custom-rate').remove(); 
  }

  function lmpToast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') return Lampa.Noty(msg);
      if (Lampa && Lampa.Noty && Lampa.Noty.show) return Lampa.Noty.show(msg);
    } catch (e) {}
  }

  function lmpRatingsClearCache() {
    Lampa.Storage.set(RATING_CACHE_KEY, {});
    lmpToast('Кеш рейтингів успішно очищено');
  }

  function fetchMdbListRatings(card, callback) {
    var key = LMP_ENH_CONFIG.apiKeys.mdblist;
    if (!key) return callback(null);

    var typeSegment = (card.type === 'tv') ? 'show' : card.type;
    var url = 'https://api.mdblist.com/tmdb/' + typeSegment + '/' + card.id + '?apikey=' + encodeURIComponent(key);

    new Lampa.Reguest().silent(url, handleSuccess, function() { callback(null); });

    function handleSuccess(response) {
      if (!response || !response.ratings || !response.ratings.length) return callback(null);

      var res = {
        imdb: null, tmdb: null, trakt: null,
        letterboxd: null, metacritic: null,
        rottentomatoes: null, popcorn: null
      };

      response.ratings.forEach(function(r) {
        var src = (r.source || '').toLowerCase();
        var valText = String(r.value || '').replace('%', '').split('/')[0];
        var val = parseFloat(valText);
        if (isNaN(val)) return;
        
        var votes = r.votes || 0;
        var norm10 = val > 10 ? (val / 10) : val; 

        var item = { display: valText, avg: norm10, votes: votes };

        if (src === 'imdb') res.imdb = item;
        else if (src === 'tmdb') res.tmdb = item;
        else if (src === 'trakt') { item.display += '%'; res.trakt = item; }
        else if (src === 'letterboxd') res.letterboxd = item;
        else if (src.indexOf('metacritic') !== -1 && src.indexOf('user') === -1) res.metacritic = item;
        else if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) {
          item.display += '%';
          item.fresh = val >= 60;
          res.rottentomatoes = item;
        }
        else if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) {
          item.display += '%';
          res.popcorn = item;
        }
      });

      callback(res);
    }
  }
  function insertRatings(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var rateLine = getPrimaryRateLine(render);
    if (!rateLine.length) return;
    cleanupRtgInjected(render);

    var cfg = getCfg();

    // Ховаємо оригінальні рейтинги Lampa
    $('.rate--imdb:not(.lmp-custom-rate), .rate--tmdb:not(.lmp-custom-rate)', rateLine).addClass('hide').hide();

    // Проходимось по масиву налаштувань (він вже відсортований користувачем)
    cfg.sourcesConfig.forEach(function(src) {
      if (!src.enabled || !data[src.id]) return;
      var itemData = data[src.id];

      var iconUrl = src.icon;
      var extraStyle = '';
      if (src.id === 'rottentomatoes') {
        iconUrl = itemData.fresh ? ICONS.rotten_good : ICONS.rotten_bad;
        if (itemData.fresh) extraStyle = 'border-radius:4px;';
      }

      var colorClass = cfg.colorizeAll ? getRatingClass(itemData.avg) : '';

      var cont = $(
        '<div class="full-start__rate lmp-custom-rate ' + src.class + ' ' + colorClass + '">' +
        '<div>' + itemData.display + '</div>' +
        '<div class="source--name" title="' + src.name + '">' + iconImg(iconUrl, src.name, 22, extraStyle) + '</div>' +
        '</div>'
      );
      rateLine.append(cont);
    });
  }

  function fetchAdditionalRatings(card) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var cfg = getCfg();
    refreshConfigFromStorage();
    
    var normalizedCard = { id: card.id, type: getCardType(card) };
    var cacheKey = normalizedCard.type + '_' + normalizedCard.id;
    
    var cacheTimeMs = cfg.cacheDays * 24 * 60 * 60 * 1000;
    
    var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
    var cachedItem = cache[cacheKey];
    
    if (cachedItem && (Date.now() - cachedItem.timestamp < cacheTimeMs) && cachedItem.data) {
      currentRatingsData = cachedItem.data;
      insertRatings(currentRatingsData);
      applyStylesToAll();
      $('#lmp-search-loader', render).remove();
      undimRateLine(getPrimaryRateLine(render));
      return;
    }

    var rateLine = getPrimaryRateLine(render);
    if (rateLine.length && !$('#lmp-search-loader', render).length) {
      rateLine.append('<div id="lmp-search-loader" class="loading-dots-container"><div class="loading-dots__text">Пошук MDBList…</div><div class="loading-dots__dot"></div><div class="loading-dots__dot"></div></div>');
      rateLine.addClass('lmp-is-loading-ratings');
    }

    fetchMdbListRatings(normalizedCard, function(res) {
      $('#lmp-search-loader', render).remove();
      undimRateLine(rateLine);

      if (res) {
        currentRatingsData = res;
        cache[cacheKey] = { timestamp: Date.now(), data: res };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
        
        insertRatings(currentRatingsData);
        applyStylesToAll();
      }
    });
  }

  function undimRateLine(rateLine) {
    if (!rateLine || !rateLine.length) return;
    rateLine.removeClass('lmp-is-loading-ratings');
  }
  /*
  |==========================================================================
  | НАЛАШТУВАННЯ ТА СТИЛІ
  |==========================================================================
  */

  // Базовий список рейтингів (Виправлені ID для Rotten Tomatoes та Metacritic)
  var DEFAULT_SOURCES_ORDER = [
    { id: 'imdb', name: 'IMDb', enabled: true },
    { id: 'tmdb', name: 'TMDB', enabled: true },
    { id: 'trakt', name: 'Trakt', enabled: true },
    { id: 'letterboxd', name: 'Letterboxd', enabled: true },
    { id: 'rottentomatoes', name: 'Rotten Tomatoes', enabled: true },
    { id: 'popcorn', name: 'Popcornmeter', enabled: true },
    { id: 'metacritic', name: 'Metacritic', enabled: true }
  ];

  function getCfg() {
    var parseIntDef = function(key, def) { var v = parseInt(Lampa.Storage.get(key, def), 10); return isNaN(v) ? def : v; };
    var parseFloatDef = function(key, def) { var v = parseFloat(Lampa.Storage.get(key, def)); return isNaN(v) ? def : v; };
    
    var savedConfig = Lampa.Storage.get('ratings_sources_config', null);
    
    if (savedConfig && Array.isArray(savedConfig)) {
      // Міграція для старих некоректних ID, якщо вони вже встигли зберегтися в пам'ять
      savedConfig.forEach(function(s) {
        if (s.id === 'rt') s.id = 'rottentomatoes';
        if (s.id === 'mc') s.id = 'metacritic';
      });
    } else {
      savedConfig = DEFAULT_SOURCES_ORDER;
    }

    var iconsMap = {
      'imdb': { icon: ICONS.imdb, class: 'rate--imdb' },
      'tmdb': { icon: ICONS.tmdb, class: 'rate--tmdb' },
      'trakt': { icon: ICONS.trakt, class: 'rate--trakt' },
      'letterboxd': { icon: ICONS.letterboxd, class: 'rate--letterboxd' },
      'rottentomatoes': { class: 'rate--rt' }, // Іконка визначається динамічно (свіжий/гнилий)
      'popcorn': { icon: ICONS.popcorn, class: 'rate--popcorn' },
      'metacritic': { icon: ICONS.metacritic, class: 'rate--mc' }
    };

    var fullSourcesConfig = savedConfig.map(function(s) {
      var extra = iconsMap[s.id] || {};
      return {
        id: s.id,
        name: s.name,
        enabled: s.enabled,
        icon: extra.icon,
        class: extra.class
      };
    });
    
    return {
      mdblistKey: Lampa.Storage.get('ratings_mdblist_key', RCFG_DEFAULT.ratings_mdblist_key),
      cacheDays: parseIntDef('ratings_cache_days', parseInt(RCFG_DEFAULT.ratings_cache_days)),
      bwLogos: !!Lampa.Storage.field('ratings_bw_logos', RCFG_DEFAULT.ratings_bw_logos),
      logoOffset: parseIntDef('ratings_logo_offset', RCFG_DEFAULT.ratings_logo_offset),
      fontOffset: parseIntDef('ratings_font_offset', RCFG_DEFAULT.ratings_font_offset),
      badgeAlpha: parseFloatDef('ratings_badge_alpha', RCFG_DEFAULT.ratings_badge_alpha),
      badgeTone: parseIntDef('ratings_badge_tone', RCFG_DEFAULT.ratings_badge_tone),
      gapStep: parseIntDef('ratings_gap_step', RCFG_DEFAULT.ratings_gap_step),
      colorizeAll: !!Lampa.Storage.field('ratings_colorize_all', RCFG_DEFAULT.ratings_colorize_all),
      rateBorder: !!Lampa.Storage.field('ratings_rate_border', RCFG_DEFAULT.ratings_rate_border),
      sourcesConfig: fullSourcesConfig
    };
  }

  function refreshConfigFromStorage() {
    var cfg = getCfg();
    LMP_ENH_CONFIG.apiKeys.mdblist = cfg.mdblistKey || '';
    cfg.bwLogos ? $('body').addClass('lmp-enh--mono') : $('body').removeClass('lmp-enh--mono');
    return cfg;
  }

  function applyStylesToAll() {
    var cfg = getCfg();
    cfg.bwLogos ? $('body').addClass('lmp-enh--mono') : $('body').removeClass('lmp-enh--mono');
    cfg.rateBorder ? $('body').addClass('lmp-enh--rate-border') : $('body').removeClass('lmp-enh--rate-border');
    
    var tiles = document.querySelectorAll('.full-start__rate');
    var rgba = 'rgba(' + cfg.badgeTone + ',' + cfg.badgeTone + ',' + cfg.badgeTone + ',' + cfg.badgeAlpha + ')';
    
    tiles.forEach(function(tile) {
      var prev = tile.style.fontSize; tile.style.fontSize = '';
      var basePx = parseFloat(getComputedStyle(tile).fontSize) || 23;
      tile.style.fontSize = Math.max(1, basePx + cfg.fontOffset) + 'px';
      tile.style.background = rgba;
      if (tile.firstElementChild) tile.firstElementChild.style.background = rgba;
    });

    var lines = document.querySelectorAll('.full-start-new__rate-line');
    var totalEm = (0.3 + cfg.gapStep * 0.1);
    lines.forEach(function(line) {
      for (var i = 0; i < line.children.length; i++) line.children[i].style.setProperty('margin-right', totalEm + 'em', 'important');
      if (line.lastElementChild) line.lastElementChild.style.setProperty('margin-right', '0', 'important');
    });

    var scale = (28 + cfg.logoOffset) / 28; if (scale < 0.1) scale = 0.1;
    var logos = document.querySelectorAll('.full-start__rate .source--name img');
    logos.forEach(function(img) {
      var cssVar = '--lmp-h-' + (img.closest('.full-start__rate').className.match(/rate--([a-z]+)/) || [])[1];
      var baseH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || 24;
      img.style.height = Math.max(1, baseH * scale) + 'px';
      img.style.filter = cfg.bwLogos ? 'grayscale(100%)' : '';
    });
  }

  function openSourcesEditor() {
    var cfg = getCfg();
    var currentOrder = JSON.parse(JSON.stringify(cfg.sourcesConfig));
    var listContainer = $('<div class="menu-edit-list" style="padding-bottom:10px;"></div>');

    var svgUp = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var svgDown = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var svgCheck = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" stroke-linecap="round"/></svg>';

    function renderList() {
      listContainer.empty();
      
      currentOrder.forEach(function(src, index) {
        var itemSort = $(`
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="font-size:16px; opacity: ${src.enabled ? '1' : '0.4'}; transition: opacity 0.2s;">${src.name}</div>
            <div style="display:flex; gap:10px; align-items:center;">
              <div class="move-up selector" style="padding:6px 12px; background:rgba(255,255,255,0.1); border-radius:6px; cursor:pointer; opacity: ${index === 0 ? '0.2' : '1'};">${svgUp}</div>
              <div class="move-down selector" style="padding:6px 12px; background:rgba(255,255,255,0.1); border-radius:6px; cursor:pointer; opacity: ${index === currentOrder.length - 1 ? '0.2' : '1'};">${svgDown}</div>
              <div class="toggle selector" style="padding:4px; background:rgba(255,255,255,0.1); border-radius:6px; cursor:pointer; margin-left:8px;">${svgCheck}</div>
            </div>
          </div>
        `);

        itemSort.find('.dot').attr('opacity', src.enabled ? 1 : 0);

        if (index > 0) {
          itemSort.find('.move-up').on('hover:enter click', function() {
            var temp = currentOrder[index];
            currentOrder[index] = currentOrder[index - 1];
            currentOrder[index - 1] = temp;
            renderList();
          });
        }

        if (index < currentOrder.length - 1) {
          itemSort.find('.move-down').on('hover:enter click', function() {
            var temp = currentOrder[index];
            currentOrder[index] = currentOrder[index + 1];
            currentOrder[index + 1] = temp;
            renderList();
          });
        }

        itemSort.find('.toggle').on('hover:enter click', function() {
          src.enabled = !src.enabled;
          renderList();
        });

        listContainer.append(itemSort);
      });
    }

    renderList();

    Lampa.Modal.open({
      title: 'Сортування та видимість',
      html: listContainer,
      size: 'small',
      scroll_to_center: true,
      onBack: function() {
        var configToSave = currentOrder.map(function(s) {
          return { id: s.id, name: s.name, enabled: s.enabled };
        });
        Lampa.Storage.set('ratings_sources_config', configToSave);
        Lampa.Modal.close();
        Lampa.Controller.toggle('settings_component');
        
        setTimeout(function() {
          if (typeof currentRatingsData !== 'undefined' && currentRatingsData) {
            insertRatings(currentRatingsData);
            applyStylesToAll();
          }
        }, 150);
      }
    });
  }

  function addSettingsSection() {
    if (window.lmp_ratings_add_param_ready) return;
    window.lmp_ratings_add_param_ready = true;

    Lampa.SettingsApi.addComponent({ 
      component: 'lmp_ratings', 
      name: 'Рейтинги (MDBList)', 
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>' 
    });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_mdblist_key', type: 'input', values: '', "default": RCFG_DEFAULT.ratings_mdblist_key }, field: { name: 'API ключ (MDBList)', description: 'Введи свій ключ з mdblist.com' }, onRender: function() {} });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: { type: 'button', name: 'lmp_edit_sources_btn' },
      field: { name: 'Налаштувати джерела', description: 'Зміна порядку та видимості рейтингів (IMDb, TMDB, Trakt та ін.)' },
      onChange: function() { openSourcesEditor(); },
      onRender: function() {}
    });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_cache_days', type: 'input', values: '', "default": RCFG_DEFAULT.ratings_cache_days }, field: { name: 'Термін зберігання кешу', description: 'Кількість днів (наприклад: 3).' }, onRender: function() {} });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { type: 'button', name: 'lmp_clear_cache_btn' }, field: { name: 'Очистити кеш рейтингів', description: 'Примусово видалити всі збережені рейтинги з пам\'яті пристрою.' }, onChange: function() { lmpRatingsClearCache(); }, onRender: function() {} });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_bw_logos', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_bw_logos }, field: { name: 'Ч/Б логотипи' }, onRender: function() {} });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_rate_border', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_rate_border }, field: { name: 'Рамка плиток рейтингів' }, onRender: function() {} });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_colorize_all', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_colorize_all }, field: { name: 'Кольорові оцінки рейтингів' }, onRender: function() {} });
  }

  function initRatingsPluginUI() {
    addSettingsSection();
    var _set = Lampa.Storage.set;
    Lampa.Storage.set = function(k, v) {
      var out = _set.apply(this, arguments);
      if (typeof k === 'string' && k.indexOf('ratings_') === 0 && k !== 'ratings_sources_config') {
        setTimeout(function(){ if(currentRatingsData) insertRatings(currentRatingsData); applyStylesToAll(); }, 150);
      }
      return out;
    };
    applyStylesToAll();
  }

  function startPlugin() {
    window.combined_ratings_plugin = true;
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        setTimeout(function() { fetchAdditionalRatings(e.data.movie || e.object || {}); }, 500);
      }
    });
  }

  Lampa.Template.add('lmp_enh_styles', pluginStyles);
  $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));
  initRatingsPluginUI();
  refreshConfigFromStorage();
  
  if (!window.combined_ratings_plugin) startPlugin();

})();
