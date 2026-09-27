/* Redline - post TOC: sticky nav + scrollspy from h2/h3.
   Chapter kickers are a CSS counter (see _post.scss); this script only
   assigns ids, builds the list, and observes. */
(function () {
  function slug(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 64) || 'section';
  }
  function init() {
    var list = document.getElementById('toc-list');
    var article = document.getElementById('article');
    if (!list || !article) return;
    var heads = article.querySelectorAll('h2, h3');
    if (!heads.length) { list.closest('.post-toc').style.display = 'none'; return; }
    var seen = {};
    var items = [];
    heads.forEach(function (h, i) {
      var base = slug(h.textContent);
      var id = base, n = 1;
      while (seen[id]) id = base + '-' + (++n);
      seen[id] = true;
      h.id = id;
      if (h.tagName === 'H2') {
        // If the author already numbered the heading ("1. ..."), drop it -
        // the CSS chapter counter provides numbering so they never double up.
        var first = h.firstChild;
        if (first && first.nodeType === 3) first.nodeValue = first.nodeValue.replace(/^\d+[.)]\s*/, '');
      }
      var li = document.createElement('li');
      if (h.tagName === 'H3') li.className = 'toc-h3';
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent.trim();
      li.appendChild(a);
      list.appendChild(li);
      items.push({ lvl: h.tagName === 'H2' ? 2 : 3, a: a, id: id });
    });
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    items.forEach(function (it) { links[it.id] = it.a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          var a = links[e.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(function (h) { io.observe(h); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
