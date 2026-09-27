/* Redline - terminal command palette (Cmd/Ctrl+K) + /search/ page filter.
   Index (/search.json) is built by Jekyll and fetched lazily on first use,
   so search never costs anything on initial page load. Ranking:
   title > tags > excerpt > body. */
(function () {
  'use strict';

  var INDEX_URL = '/search.json';
  var MAX_RESULTS = 8;
  var W_TITLE = 10, W_TITLE_PREFIX = 5, W_TAGS = 6, W_EXCERPT = 3, W_BODY = 1;

  function tokensOf(q) {
    return q.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 0; });
  }

  function score(post, tokens) {
    var title = (post.title || '').toLowerCase();
    var tags = (post.tags || []).join(' ').toLowerCase();
    var excerpt = (post.excerpt || '').toLowerCase();
    var body = (post.body || '').toLowerCase();
    var titleWords = title.split(/[^a-z0-9]+/);
    var s = 0, i, w, t, found;
    for (i = 0; i < tokens.length; i++) {
      t = tokens[i];
      if (title.indexOf(t) !== -1) {
        s += W_TITLE;
        for (w = 0; w < titleWords.length; w++) {
          if (titleWords[w].indexOf(t) === 0) { s += W_TITLE_PREFIX; break; }
        }
      }
      if (tags.indexOf(t) !== -1) s += W_TAGS;
      if (excerpt.indexOf(t) !== -1) s += W_EXCERPT;
      if (body.indexOf(t) !== -1) s += W_BODY;
    }
    return s;
  }

  function rank(index, query) {
    var tokens = tokensOf(query);
    if (!tokens.length || !index) return [];
    var scored = [], i, s;
    for (i = 0; i < index.length; i++) {
      s = score(index[i], tokens);
      if (s > 0) scored.push({ post: index[i], score: s });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored;
  }

  var index = null, indexPromise = null;
  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL).then(function (r) {
      if (!r.ok) throw new Error('search index ' + r.status);
      return r.json();
    }).then(function (data) { index = data; return data; });
    return indexPromise;
  }

  function initPalette() {
    var backdrop = document.getElementById('palette-backdrop');
    var input = document.getElementById('palette-input');
    var results = document.getElementById('palette-results');
    var trigger = document.getElementById('search-trigger');
    if (!backdrop || !input || !results) return;

    var lastFocus = null, activeIdx = -1, current = [];

    function hint(text) {
      results.innerHTML = '';
      var li = document.createElement('li');
      li.className = 'palette-empty';
      li.textContent = text;
      results.appendChild(li);
      input.setAttribute('aria-activedescendant', '');
      current = []; activeIdx = -1;
    }

    function setActive(i) {
      var items = results.querySelectorAll('.palette-result');
      if (!items.length) return;
      activeIdx = (i + items.length) % items.length;
      for (var k = 0; k < items.length; k++) {
        var on = k === activeIdx;
        items[k].classList.toggle('active', on);
        items[k].setAttribute('aria-selected', on ? 'true' : 'false');
      }
      input.setAttribute('aria-activedescendant', items[activeIdx].id);
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    }

    function render(scored, query) {
      results.innerHTML = '';
      if (!scored.length) { hint('no matches for "' + query + '"'); return; }
      current = scored.slice(0, MAX_RESULTS);
      current.forEach(function (item, i) {
        var post = item.post;
        var li = document.createElement('li');
        li.className = 'palette-result';
        li.id = 'palette-r' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        var a = document.createElement('a');
        a.href = post.url;
        var t = document.createElement('span');
        t.className = 'r-title'; t.textContent = post.title;
        a.appendChild(t);
        var tags = post.tags || [];
        if (tags.length) {
          var g = document.createElement('span');
          g.className = 'r-tags'; g.textContent = tags.join(' \u00B7 ');
          a.appendChild(g);
        }
        if (post.excerpt) {
          var e = document.createElement('span');
          e.className = 'r-excerpt'; e.textContent = post.excerpt;
          a.appendChild(e);
        }
        li.appendChild(a);
        results.appendChild(li);
      });
      setActive(0);
    }

    function open() {
      lastFocus = document.activeElement;
      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      input.value = '';
      hint('loading index_');
      loadIndex().then(function () {
        hint('type to search across ' + index.length + ' posts_');
      }).catch(function () {
        hint('index failed to load - try /search/ instead');
      });
      input.focus();
    }

    function close() {
      backdrop.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (trigger) trigger.addEventListener('click', function (ev) {
      ev.preventDefault();
      open();
    });

    document.addEventListener('keydown', function (ev) {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        if (backdrop.hidden) open(); else close();
      }
      // Escape closes from anywhere while the palette is open - not only
      // when the input has focus (focus may sit on a result link)
      if (ev.key === 'Escape' && !backdrop.hidden) { ev.preventDefault(); close(); }
    });

    backdrop.addEventListener('click', function (ev) {
      if (ev.target === backdrop) close();
    });

    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setActive(activeIdx + 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(activeIdx - 1); }
      else if (ev.key === 'Enter') {
        if (current[activeIdx]) window.location.href = current[activeIdx].post.url;
      }
    });

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (!index || !q) {
        if (index) hint('type to search across ' + index.length + ' posts_');
        return;
      }
      render(rank(index, q), q);
    });
  }

  function initSearchPage() {
    var field = document.getElementById('search-page-input');
    var list = document.getElementById('search-page-results');
    var count = document.getElementById('search-page-count');
    if (!field || !list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.search-page-item'));

    function apply(q) {
      var query = (q || '').trim();
      if (!query) {
        items.forEach(function (li) { li.hidden = false; });
        if (count) count.textContent = items.length + ' posts';
        return;
      }
      loadIndex().then(function () {
        var scored = rank(index, query);
        var order = {}, i;
        for (i = 0; i < scored.length; i++) order[scored[i].post.url] = i;
        var visible = 0;
        items.slice().sort(function (a, b) {
          var oa = order[a.getAttribute('data-url')], ob = order[b.getAttribute('data-url')];
          oa = (oa === undefined) ? 1e9 : oa;
          ob = (ob === undefined) ? 1e9 : ob;
          return oa - ob;
        }).forEach(function (li) {
          var show = order[li.getAttribute('data-url')] !== undefined;
          li.hidden = !show;
          list.appendChild(li);
          if (show) visible++;
        });
        if (count) count.textContent = visible + ' of ' + items.length + ' posts';
      });
    }

    try {
      var initial = new URLSearchParams(window.location.search).get('q');
      if (initial) { field.value = initial; apply(initial); }
      else if (count) count.textContent = items.length + ' posts';
    } catch (e) {
      if (count) count.textContent = items.length + ' posts';
    }

    var t;
    field.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { apply(field.value); }, 150);
    });
  }

  function init() {
    initPalette();
    initSearchPage();
  }

  if (typeof document !== 'undefined' && document.getElementById) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { score: score, rank: rank, tokensOf: tokensOf };
  }
})();
