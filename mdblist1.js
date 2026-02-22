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
  | КОНФІГУРАЦІЯ ТА ЗМІННІ
  |==========================================================================
  */
  var LMP_ENH_CONFIG = {
    apiKeys: { mdblist: '' }
  };

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
    popcorn_bad: ICONS_BASE_URL + 'popcorn-bad.svg',
    mdblist: ICONS_BASE_URL + 'mdblist.svg',
    mal: ICONS_BASE_URL + 'mal.svg'
  };

  var pluginStyles = "<style>" +
    /* ЗМІННІ ДЛЯ МАСШТАБУВАННЯ (Пікселі) */
    ":root{" +
    "  --lmp-logo-offset: 0px;" +
    "  --lmp-text-offset: 0px;" +
    "}" +

    /* ЛОАДЕР */
    ".loading-dots-container { display: inline-flex; align-items: center; font-size: 0.85em; color: #ccc; padding: 0.6em 1em; border-radius: 0.5em; margin-right: 0.5em; margin-bottom: 0.4em; }" +
    ".loading-dots__text { margin-right: 1em; }" +
    ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
    ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
    ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
    "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +

    /* СТИЛІ ПЛИТОК РЕЙТИНГІВ */
    ".lmp-custom-rate { display: inline-flex !important; align-items: center; justify-content: center; gap: 0.3em; padding: 0.2em 0.4em; border-radius: 0.4em; transition: background 0.2s; margin-right: 0.5em !important; margin-bottom: 0.4em !important; }" +
    ".lmp-custom-rate .source--name { display: flex !important; align-items: center; justify-content: center; margin: 0; }" +
    
    /* ІКОНКИ БАЗОВІ (Кольорові з темною тінню) */
    ".lmp-custom-rate .source--name img { display: block !important; position: relative; z-index: 2; color: transparent; object-fit: contain; height: calc(22px + var(--lmp-logo-offset)) !important; }" +
    "body:not(.lmp-enh--mono) .lmp-custom-rate .source--name img { filter: drop-shadow(0px 0px 4px rgba(0,0,0,0.8)); }" +
    
    /* === ЕКСКЛЮЗИВНІ Ч/Б ФІЛЬТРИ (Працюють тільки якщо ввімкнено Ч/Б режим) === */
    /* Базовий Ч/Б для всіх іконок */
    "body.lmp-enh--mono .lmp-custom-rate .source--name img { filter: grayscale(100%) contrast(1000%) drop-shadow(0px 0px 4px rgba(0,0,0,0.8)) !important; }" +
    
    /* Томати (СВІЖИЙ) */
    "body.lmp-enh--mono .lmp-rate-rottentomatoes .source--name img[src$='rt.svg'] { filter: grayscale(100%) invert(1) contrast(1000%) drop-shadow(0px 0px 4px rgba(0,0,0,0.8)) !important; }" + 

    /* Томати (ГНИЛИЙ) */
    "body.lmp-enh--mono .lmp-rate-rottentomatoes .source--name img[src$='rt-bad.svg'] { filter: brightness(0) invert(1) drop-shadow(0px 0px 4px rgba(0,0,0,0.8)) !important; }" +

    /* Індивідуально для IMDB */
    "body.lmp-enh--mono .lmp-rate-imdb .source--name img { filter: invert(1) grayscale(100%) contrast(1000%) drop-shadow(0px 0px 4px rgba(0,0,0,0.8)) !important; }" +
    
    /* Індивідуально для MDBList */
    "body.lmp-enh--mono .lmp-rate-mdblist .source--name img { filter: grayscale(100%) brightness(0.7) contrast(1000%) drop-shadow(0px 0px 4px rgba(0,0,0,0.8)) !important; }" +

    /* ТЕКСТ */
    ".lmp-custom-rate .rate--text-block { display: flex; align-items: baseline; text-shadow: 0 0 5px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.8); }" +
    ".lmp-custom-rate .rate--value { font-weight: bold; line-height: 1; font-size: calc(1.1em + var(--lmp-text-offset)); transition: color 0.2s; }" +
    ".lmp-custom-rate .rate--votes { font-size: 0.6em; opacity: 0.8; margin-left: 0.25em; line-height: 1; }" +

    /* ПОЗИЦІЯ ІКОНКИ */
    ".lmp-dir-right { flex-direction: row-reverse; }" +
    ".lmp-dir-left { flex-direction: row; }" +

    /* КОЛЬОРОВІ ОЦІНКИ */
    ".lmp-color-green { color: #2ecc71 !important; }" +
    ".lmp-color-blue { color: #60a5fa !important; }" +
    ".lmp-color-orange { color: #f59e0b !important; }" +
    ".lmp-color-red { color: #ef4444 !important; }" +

    "body.lmp-enh--rate-border .lmp-custom-rate { border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(0, 0, 0, 0.2); }" +
    
    ".settings-param__descr,.settings-param__subtitle{white-space:pre-line;}" +
    "</style>";
  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';

  var RCFG_DEFAULT = {
    ratings_mdblist_key: '',
    ratings_cache_days: '3',
    ratings_icon_left: true, 
    ratings_show_votes: true,
    ratings_logo_scale_val: 's_0', 
    ratings_text_scale_val: 's_0',
    ratings_bw_logos: false,
    ratings_badge_alpha: 0,
    ratings_badge_tone: 0,
    ratings_colorize_all: true,
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

  function iconImg(url, alt) {
    return '<img src="' + url + '" alt="' + (alt || '') + '">';
  }

  function getPrimaryRateLine(render){
    if (!render || !render.length) return $();
    var $nativeRate = render.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp').first();
    if ($nativeRate.length && $nativeRate.parent().length) return $nativeRate.parent();

    var $left = $('.cardify__left .full-start-new__rate-line:not([data-lmp-fake]), .cardify__left .full-start__rate-line:not([data-lmp-fake])', render).first();
    if ($left.length) return $left;
    var $any = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render).first();
    return $any;
  }

  function cleanupRtgInjected(render){
    if (!render || !render.length) return;
    var rateLine = getPrimaryRateLine(render);
    rateLine.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp, .b-rating').not('.lmp-custom-rate').remove();
    rateLine.find('.lmp-custom-rate').remove(); 
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
      if (!response) return callback(null);

      var res = {
        mdblist: null, imdb: null, tmdb: null, trakt: null,
        letterboxd: null, metacritic: null,
        rottentomatoes: null, popcorn: null, mal: null
      };

      var mdbScore = response.score;
      if (mdbScore) {
          var normMdb = parseFloat(mdbScore);
          if (normMdb > 10) normMdb = normMdb / 10;
          res.mdblist = {
              display: normMdb.toFixed(1),
              avg: normMdb,
              votes: response.score_votes || 0,
              fresh: normMdb >= 6.0
          };
      }

      if (!response.ratings || !response.ratings.length) {
          if (res.mdblist) return callback(res);
          return callback(null);
      }

      response.ratings.forEach(function(r) {
        var src = (r.source || '').toLowerCase();
        var valText = String(r.value || '').replace(/[^0-9.]/g, '');
        var val = parseFloat(valText);
        if (isNaN(val)) return;
        
        var normalized = val;
        
        if (src === 'letterboxd') {
            normalized = val * 2; 
        } else if (val > 10) {
            normalized = val / 10; 
        }

        normalized = Math.max(0, Math.min(10, normalized));
        var displayVal = normalized.toFixed(1);

        var item = { display: displayVal, avg: normalized, votes: r.votes || 0, fresh: normalized >= 6.0 };

        if (src === 'imdb') res.imdb = item;
        else if (src === 'tmdb') res.tmdb = item;
        else if (src === 'trakt') res.trakt = item;
        else if (src === 'letterboxd') res.letterboxd = item;
        else if (src.indexOf('metacritic') !== -1 && src.indexOf('user') === -1) res.metacritic = item;
        else if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) res.rottentomatoes = item;
        else if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) res.popcorn = item;
        else if (src.indexOf('myanimelist') !== -1 || src === 'mal') res.mal = item;
      });

      callback(res);
    }
  }
  /*
  |==========================================================================
  | РЕНДЕР РЕЙТИНГІВ
  |==========================================================================
  */
  function formatVotes(num) {
    if (!num) return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  }

  function insertRatings(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var rateLine = getPrimaryRateLine(render);
    if (!rateLine.length) return;
    
    rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
    cleanupRtgInjected(render);

    var cfg = getCfg();
    var elementsToInsert = [];

    cfg.sourcesConfig.forEach(function(src) {
      if (!src.enabled || !data[src.id]) return;
      var itemData = data[src.id];

      var iconUrl = src.icon;
      if (src.id === 'rottentomatoes') iconUrl = itemData.fresh ? ICONS.rotten_good : ICONS.rotten_bad;
      if (src.id === 'popcorn' && itemData.avg < 6) iconUrl = ICONS.popcorn_bad || iconUrl;

      var colorClass = '';
      if (cfg.colorizeAll) {
          if (itemData.avg >= 7.5) colorClass = 'lmp-color-green';
          else if (itemData.avg >= 6.0) colorClass = 'lmp-color-blue';
          else if (itemData.avg >= 4.0) colorClass = 'lmp-color-orange';
          else colorClass = 'lmp-color-red';
      }
      
      var votesHtml = (cfg.showVotes && itemData.votes) ? '<span class="rate--votes">' + formatVotes(itemData.votes) + '</span>' : '';
      var dirClass = cfg.iconLeft ? 'lmp-dir-left' : 'lmp-dir-right';

      // Додано клас lmp-rate-ID для індивідуального Ч/Б стилю
      var cont = $(
        '<div class="lmp-custom-rate lmp-rate-' + src.id + ' ' + dirClass + '">' +
            '<div class="source--name" title="' + src.name + '">' + iconImg(iconUrl, src.name) + '</div>' +
            '<div class="rate--text-block">' + 
                '<span class="rate--value ' + colorClass + '">' + itemData.display + '</span>' + 
                votesHtml + 
            '</div>' +
        '</div>'
      );
      
      elementsToInsert.push(cont);
    });

    if (elementsToInsert.length > 0) {
        rateLine.prepend(elementsToInsert);
    }
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
      return;
    }

    var rateLine = getPrimaryRateLine(render);
    if (rateLine.length && !$('#lmp-search-loader', render).length) {
      rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
      rateLine.prepend('<div id="lmp-search-loader" class="loading-dots-container"><div class="loading-dots__text">MDBList...</div><div class="loading-dots__dot"></div><div class="loading-dots__dot"></div></div>');
    }

    fetchMdbListRatings(normalizedCard, function(res) {
      $('#lmp-search-loader', render).remove();

      if (res) {
        currentRatingsData = res;
        cache[cacheKey] = { timestamp: Date.now(), data: res };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
        
        insertRatings(currentRatingsData);
        applyStylesToAll();
      }
    });
  }
  /*
  |==========================================================================
  | НАЛАШТУВАННЯ ТА СТИЛІ
  |==========================================================================
  */
  var DEFAULT_SOURCES_ORDER = [
    { id: 'mdblist', name: 'MDBList', enabled: true },
    { id: 'imdb', name: 'IMDb', enabled: true },
    { id: 'tmdb', name: 'TMDB', enabled: true },
    { id: 'trakt', name: 'Trakt', enabled: true },
    { id: 'letterboxd', name: 'Letterboxd', enabled: true },
    { id: 'rottentomatoes', name: 'Rotten Tomatoes', enabled: true },
    { id: 'popcorn', name: 'Popcornmeter', enabled: true },
    { id: 'metacritic', name: 'Metacritic', enabled: true },
    { id: 'mal', name: 'MyAnimeList', enabled: true }
  ];

  function getCfg() {
    var parseIntDef = function(key, def) { var v = parseInt(Lampa.Storage.get(key, def), 10); return isNaN(v) ? def : v; };
    var parseFloatDef = function(key, def) { var v = parseFloat(Lampa.Storage.get(key, def)); return isNaN(v) ? def : v; };
    
    var savedConfig = Lampa.Storage.get('ratings_sources_config', null);
    
    if (savedConfig && Array.isArray(savedConfig)) {
      savedConfig.forEach(function(s) {
        if (s.id === 'rt') s.id = 'rottentomatoes';
        if (s.id === 'mc') s.id = 'metacritic';
      });
      if (!savedConfig.find(function(s) { return s.id === 'mdblist'; })) savedConfig.push({ id: 'mdblist', name: 'MDBList', enabled: true });
      if (!savedConfig.find(function(s) { return s.id === 'mal'; })) savedConfig.push({ id: 'mal', name: 'MyAnimeList', enabled: true });
    } else {
      savedConfig = DEFAULT_SOURCES_ORDER;
    }

    var iconsMap = {
      'imdb': { icon: ICONS.imdb },
      'tmdb': { icon: ICONS.tmdb },
      'trakt': { icon: ICONS.trakt },
      'letterboxd': { icon: ICONS.letterboxd },
      'rottentomatoes': {  }, 
      'popcorn': { icon: ICONS.popcorn },
      'metacritic': { icon: ICONS.metacritic },
      'mdblist': { icon: ICONS.mdblist },
      'mal': { icon: ICONS.mal }
    };

    var fullSourcesConfig = savedConfig.map(function(s) {
      var extra = iconsMap[s.id] || {};
      return { id: s.id, name: s.name, enabled: s.enabled, icon: extra.icon };
    });
    
    // Мапа для правильного сортування в Select
    var scaleMap = { 's_m2': -2, 's_m1': -1, 's_0': 0, 's_p1': 1, 's_p2': 2 };
    
    var logoRaw = Lampa.Storage.get('ratings_logo_scale_val', 's_0');
    var textRaw = Lampa.Storage.get('ratings_text_scale_val', 's_0');
    
    var logoInput = scaleMap[logoRaw] !== undefined ? scaleMap[logoRaw] : (parseInt(logoRaw) || 0);
    var textInput = scaleMap[textRaw] !== undefined ? scaleMap[textRaw] : (parseInt(textRaw) || 0);

    return {
      mdblistKey: Lampa.Storage.get('ratings_mdblist_key', RCFG_DEFAULT.ratings_mdblist_key),
      cacheDays: parseIntDef('ratings_cache_days', parseInt(RCFG_DEFAULT.ratings_cache_days)),
      iconLeft: !!Lampa.Storage.field('ratings_icon_left', RCFG_DEFAULT.ratings_icon_left),
      logoOffset: (logoInput * 2) + 'px',
      textOffset: (textInput * 2) + 'px',
      showVotes: !!Lampa.Storage.field('ratings_show_votes', RCFG_DEFAULT.ratings_show_votes),
      bwLogos: !!Lampa.Storage.field('ratings_bw_logos', RCFG_DEFAULT.ratings_bw_logos),
      badgeAlpha: parseFloatDef('ratings_badge_alpha', RCFG_DEFAULT.ratings_badge_alpha),
      badgeTone: parseIntDef('ratings_badge_tone', RCFG_DEFAULT.ratings_badge_tone),
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
    
    document.documentElement.style.setProperty('--lmp-logo-offset', cfg.logoOffset);
    document.documentElement.style.setProperty('--lmp-text-offset', cfg.textOffset);

    cfg.bwLogos ? $('body').addClass('lmp-enh--mono') : $('body').removeClass('lmp-enh--mono');
    cfg.rateBorder ? $('body').addClass('lmp-enh--rate-border') : $('body').removeClass('lmp-enh--rate-border');
    
    var tiles = document.querySelectorAll('.lmp-custom-rate');
    var rgba = 'rgba(' + cfg.badgeTone + ',' + cfg.badgeTone + ',' + cfg.badgeTone + ',' + cfg.badgeAlpha + ')';
    
    tiles.forEach(function(tile) {
      tile.style.background = rgba;
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
      field: { name: 'Налаштувати джерела', description: 'Зміна порядку та видимості рейтингів' },
      onChange: function() { openSourcesEditor(); },
      onRender: function() {}
    });

    var scaleValuesMap = { 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2' };

    Lampa.SettingsApi.addParam({ 
        component: 'lmp_ratings', 
        param: { name: 'ratings_logo_scale_val', type: 'select', values: scaleValuesMap, "default": 's_0' }, 
        field: { name: 'Розмір логотипів', description: 'Збільшення/зменшення іконок.' }, 
        onRender: function() {} 
    });

    Lampa.SettingsApi.addParam({ 
        component: 'lmp_ratings', 
        param: { name: 'ratings_text_scale_val', type: 'select', values: scaleValuesMap, "default": 's_0' }, 
        field: { name: 'Розмір оцінки', description: 'Збільшення/зменшення цифр.' }, 
        onRender: function() {} 
    });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_show_votes', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_show_votes }, field: { name: 'Кількість голосів', description: 'Показувати кількість тих, хто проголосував.' }, onRender: function() {} });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_icon_left', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_icon_left }, field: { name: 'Іконка зліва від цифри', description: 'Перемістити логотип джерела на лівий бік.' }, onRender: function() {} });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_cache_days', type: 'input', values: '', "default": RCFG_DEFAULT.ratings_cache_days }, field: { name: 'Термін зберігання кешу', description: 'Кількість днів (наприклад: 3).' }, onRender: function() {} });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { type: 'button', name: 'lmp_clear_cache_btn' }, field: { name: 'Очистити кеш рейтингів', description: 'Примусово видалити всі збережені рейтинги з пам\'яті.' }, onChange: function() { lmpRatingsClearCache(); }, onRender: function() {} });

    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_bw_logos', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_bw_logos }, field: { name: 'Ч/Б логотипи', description: 'Спеціальний чорно-білий контраст.' }, onRender: function() {} });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_colorize_all', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_colorize_all }, field: { name: 'Кольорові оцінки рейтингів' }, onRender: function() {} });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_rate_border', type: 'trigger', values: '', "default": RCFG_DEFAULT.ratings_rate_border }, field: { name: 'Рамка плиток рейтингів' }, onRender: function() {} });
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
