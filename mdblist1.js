(function() {
  'use strict';

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
  if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
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
  var LMP_ENH_CONFIG = { apiKeys: { mdblist: '' } };
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
    ":root{ --lmp-logo-offset: 0px; --lmp-text-offset: 0px; }" +
    ".loading-dots-container { display: inline-flex; align-items: center; font-size: 0.85em; color: #ccc; padding: 0.6em 1em; border-radius: 0.5em; margin-right: 0.5em; margin-bottom: 0.4em; }" +
    ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
    "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +

    ".lmp-custom-rate { display: inline-flex !important; align-items: center; justify-content: center; gap: 0.3em; padding: 0.2em 0.4em; border-radius: 0.4em; transition: background 0.2s; margin-right: 0.5em !important; margin-bottom: 0.4em !important; }" +
    ".lmp-custom-rate .source--name { display: flex !important; align-items: center; justify-content: center; margin: 0; }" +
    
    /* ІКОНКИ + БАЗОВА ТІНЬ */
    ".lmp-custom-rate .source--name img { display: block !important; position: relative; z-index: 2; color: transparent; object-fit: contain; height: calc(22px + var(--lmp-logo-offset)) !important; filter: drop-shadow(0px 0px 4px rgba(0,0,0,0.8)); }" +
    
    /* ЕКСКЛЮЗИВНИЙ Ч/Б ФІЛЬТР: Threshold (Чорний/Білий) + Білий контур */
    "body.lmp-enh--mono .lmp-custom-rate .source--name img { " +
    "  filter: grayscale(100%) brightness(1.2) contrast(1000%) " + 
    "  drop-shadow(0.5px 0.5px 0px #fff) drop-shadow(-0.5px -0.5px 0px #fff) " + 
    "  drop-shadow(0.5px -0.5px 0px #fff) drop-shadow(-0.5px 0.5px 0px #fff) !important; " +
    "}" +

    ".lmp-custom-rate .rate--text-block { display: flex; align-items: baseline; text-shadow: 0 0 5px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.8); }" +
    ".lmp-custom-rate .rate--value { font-weight: bold; line-height: 1; font-size: calc(1.1em + var(--lmp-text-offset)); transition: color 0.2s; }" +
    ".lmp-custom-rate .rate--votes { font-size: 0.6em; opacity: 0.8; margin-left: 0.25em; line-height: 1; }" +

    ".lmp-dir-right { flex-direction: row-reverse; }" +
    ".lmp-dir-left { flex-direction: row; }" +

    ".lmp-color-green { color: #2ecc71 !important; } .lmp-color-blue { color: #60a5fa !important; } .lmp-color-orange { color: #f59e0b !important; } .lmp-color-red { color: #ef4444 !important; }" +
    "body.lmp-enh--rate-border .lmp-custom-rate { border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(0, 0, 0, 0.2); }" +
    "</style>";

  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';
  var RCFG_DEFAULT = { ratings_mdblist_key: '', ratings_cache_days: '3', ratings_icon_left: true, ratings_show_votes: true, ratings_logo_scale_val: '0', ratings_text_scale_val: '0', ratings_bw_logos: false, ratings_badge_alpha: 0, ratings_colorize_all: true, ratings_rate_border: false };
  var currentRatingsData = null;
  function getCardType(card) {
    var type = card.media_type || card.type;
    return (type === 'movie' || type === 'tv') ? type : (card.name || card.original_name ? 'tv' : 'movie');
  }

  function getPrimaryRateLine(render){
    var $nativeRate = render.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp').first();
    if ($nativeRate.length && $nativeRate.parent().length) return $nativeRate.parent();
    var $left = $('.cardify__left .full-start-new__rate-line:not([data-lmp-fake])', render).first();
    return $left.length ? $left : $('.full-start-new__rate-line:not([data-lmp-fake])', render).first();
  }

  function fetchMdbListRatings(card, callback) {
    var key = LMP_ENH_CONFIG.apiKeys.mdblist;
    if (!key) return callback(null);
    var url = 'https://api.mdblist.com/tmdb/' + (card.type === 'tv' ? 'show' : card.type) + '/' + card.id + '?apikey=' + encodeURIComponent(key);
    new Lampa.Reguest().silent(url, function(response) {
      if (!response) return callback(null);
      var res = { mdblist: null, imdb: null, tmdb: null, trakt: null, letterboxd: null, metacritic: null, rottentomatoes: null, popcorn: null, mal: null };
      var mdbScore = response.score;
      if (mdbScore) {
          var normMdb = parseFloat(mdbScore);
          if (normMdb > 10) normMdb /= 10;
          res.mdblist = { display: normMdb.toFixed(1), avg: normMdb, votes: response.score_votes || 0 };
      }
      if (response.ratings) {
        response.ratings.forEach(function(r) {
          var src = (r.source || '').toLowerCase();
          var val = parseFloat(String(r.value || '').replace(/[^0-9.]/g, ''));
          if (isNaN(val)) return;
          var norm = (src === 'letterboxd') ? val * 2 : (val > 10 ? val / 10 : val);
          norm = Math.max(0, Math.min(10, norm));
          var item = { display: norm.toFixed(1), avg: norm, votes: r.votes || 0, fresh: norm >= 6.0 };
          if (src === 'imdb') res.imdb = item;
          else if (src === 'tmdb') res.tmdb = item;
          else if (src === 'trakt') res.trakt = item;
          else if (src === 'letterboxd') res.letterboxd = item;
          else if (src.indexOf('metacritic') !== -1) res.metacritic = item;
          else if (src.indexOf('rotten') !== -1) res.rottentomatoes = item;
          else if (src.indexOf('popcorn') !== -1) res.popcorn = item;
          else if (src.indexOf('mal') !== -1 || src.indexOf('myanimelist') !== -1) res.mal = item;
        });
      }
      callback(res);
    }, function() { callback(null); });
  }

  function insertRatings(data) {
    var render = Lampa.Activity.active().activity.render();
    var rateLine = getPrimaryRateLine(render);
    if (!rateLine.length) return;
    rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
    rateLine.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp, .b-rating').not('.lmp-custom-rate').remove();
    rateLine.find('.lmp-custom-rate').remove();
    var cfg = getCfg();
    cfg.sourcesConfig.forEach(function(src) {
      if (!src.enabled || !data[src.id]) return;
      var item = data[src.id];
      var iconUrl = src.icon;
      if (src.id === 'rottentomatoes') iconUrl = item.fresh ? ICONS.rotten_good : ICONS.rotten_bad;
      if (src.id === 'popcorn' && item.avg < 6) iconUrl = ICONS.popcorn_bad || iconUrl;
      var color = '';
      if (cfg.colorizeAll) {
        if (item.avg >= 7.5) color = 'lmp-color-green';
        else if (item.avg >= 6.0) color = 'lmp-color-blue';
        else if (item.avg >= 4.0) color = 'lmp-color-orange';
        else color = 'lmp-color-red';
      }
      var cont = $('<div class="lmp-custom-rate ' + (cfg.iconLeft ? 'lmp-dir-left' : 'lmp-dir-right') + ' lmp-rate-' + src.id + '">' +
        '<div class="source--name"><img src="' + iconUrl + '"></div>' +
        '<div class="rate--text-block"><span class="rate--value ' + color + '">' + item.display + '</span>' +
        (cfg.showVotes && item.votes ? '<span class="rate--votes">' + (item.votes >= 1000 ? (item.votes/1000).toFixed(1)+'k' : item.votes) + '</span>' : '') +
        '</div></div>');
      rateLine.prepend(cont);
    });
  }
  function getCfg() {
    var s = Lampa.Storage;
    var saved = s.get('ratings_sources_config', null);
    var logoIn = parseInt(s.get('ratings_logo_scale_val', '0'), 10);
    var textIn = parseInt(s.get('ratings_text_scale_val', '0'), 10);
    return {
      mdblistKey: s.get('ratings_mdblist_key', ''),
      cacheDays: parseInt(s.get('ratings_cache_days', '3'), 10),
      iconLeft: !!s.field('ratings_icon_left', true),
      showVotes: !!s.field('ratings_show_votes', true),
      logoOffset: (logoIn * 2) + 'px',
      textOffset: (textIn * 2) + 'px',
      bwLogos: !!s.field('ratings_bw_logos', false),
      colorizeAll: !!s.field('ratings_colorize_all', true),
      rateBorder: !!s.field('ratings_rate_border', false),
      badgeAlpha: parseFloat(s.get('ratings_badge_alpha', '0')),
      badgeTone: 0,
      sourcesConfig: (saved || DEFAULT_SOURCES_ORDER).map(function(o){ 
        return { id: o.id, name: o.name, enabled: o.enabled, icon: ICONS[o.id] }; 
      })
    };
  }

  function applyStylesToAll() {
    var cfg = getCfg();
    document.documentElement.style.setProperty('--lmp-logo-offset', cfg.logoOffset);
    document.documentElement.style.setProperty('--lmp-text-offset', cfg.textOffset);
    cfg.bwLogos ? $('body').addClass('lmp-enh--mono') : $('body').removeClass('lmp-enh--mono');
    cfg.rateBorder ? $('body').addClass('lmp-enh--rate-border') : $('body').removeClass('lmp-enh--rate-border');
    var rgba = 'rgba(0,0,0,' + cfg.badgeAlpha + ')';
    document.querySelectorAll('.lmp-custom-rate').forEach(function(t) { t.style.background = rgba; });
  }

  function addSettingsSection() {
    if (window.lmp_ratings_add_param_ready) return;
    window.lmp_ratings_add_param_ready = true;
    Lampa.SettingsApi.addComponent({ component: 'lmp_ratings', name: 'Рейтинги (MDBList)', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z"/></svg>' });
    
    var scaleValues = { '-2': '-2', '-1': '-1', '0': '0', '1': '1', '2': '2' };
    
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_mdblist_key', type: 'input', "default": '' }, field: { name: 'API ключ (MDBList)' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_logo_scale_val', type: 'select', values: scaleValues, "default": '0' }, field: { name: 'Розмір логотипів' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_text_scale_val', type: 'select', values: scaleValues, "default": '0' }, field: { name: 'Розмір оцінки' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_icon_left', type: 'trigger', "default": true }, field: { name: 'Іконка зліва' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_show_votes', type: 'trigger', "default": true }, field: { name: 'Кількість голосів' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_bw_logos', type: 'trigger', "default": false }, field: { name: 'Ч/Б логотипи' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_colorize_all', type: 'trigger', "default": true }, field: { name: 'Кольорові оцінки' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { name: 'ratings_rate_border', type: 'trigger', "default": false }, field: { name: 'Рамка плиток' } });
    Lampa.SettingsApi.addParam({ component: 'lmp_ratings', param: { type: 'button' }, field: { name: 'Очистити кеш' }, onChange: function() { Lampa.Storage.set(RATING_CACHE_KEY, {}); Lampa.Noty.show('Кеш очищено'); } });
  }

  var DEFAULT_SOURCES_ORDER = [{id:'mdblist',name:'MDBList',enabled:true},{id:'imdb',name:'IMDb',enabled:true},{id:'tmdb',name:'TMDB',enabled:true},{id:'trakt',name:'Trakt',enabled:true},{id:'letterboxd',name:'Letterboxd',enabled:true},{id:'rottentomatoes',name:'Rotten Tomatoes',enabled:true},{id:'popcorn',name:'Popcornmeter',enabled:true},{id:'metacritic',name:'Metacritic',enabled:true},{id:'mal',name:'MyAnimeList',enabled:true}];

  function refreshConfigFromStorage() { var cfg = getCfg(); LMP_ENH_CONFIG.apiKeys.mdblist = cfg.mdblistKey; return cfg; }

  Lampa.Template.add('lmp_enh_styles', pluginStyles);
  $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));
  addSettingsSection();
  
  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      var card = e.data.movie || e.object || {};
      fetchMdbListRatings({id: card.id, type: getCardType(card)}, function(res){ if(res){ insertRatings(res); applyStylesToAll(); } });
    }
  });

})();
