/* Redline - split [data-split] headings into words for masked line reveals. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (n.parentNode.closest && n.parentNode.closest('svg')) continue;
      if (n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part, i) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = 'w';
        var ch = document.createElement('span');
        ch.className = 'ch';
        ch.style.transitionDelay = (i * 28) + 'ms';
        ch.textContent = part;
        w.appendChild(ch);
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function init() {
    var els = document.querySelectorAll('[data-split]');
    if (!els.length || reduced || !('IntersectionObserver' in window)) return;
    els.forEach(splitWords);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
