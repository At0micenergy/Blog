/* Redline - scramble/decode text effect. Hero decodes on boot; [data-scramble-onview] on scroll. */
(function () {
  var GLYPHS = '!<>-_/[]{}=+*^?#@$%&';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function textNodes(el) {
    var out = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        // skip SVG internals and empty nodes
        if (n.parentNode && n.parentNode.closest && n.parentNode.closest('svg')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  }

  function scramble(el) {
    var nodes = textNodes(el);
    var originals = nodes.map(function (n) { return n.nodeValue; });
    var total = originals.join('').length;
    var revealed = 0;
    var start = performance.now();
    var DURATION = Math.min(1400, 500 + total * 22);

    function frame(now) {
      var p = Math.min(1, (now - start) / DURATION);
      var target = Math.floor(p * total);
      var count = 0;
      nodes.forEach(function (node, ni) {
        var orig = originals[ni];
        var out = '';
        for (var i = 0; i < orig.length; i++) {
          if (count < target) { out += orig[i]; }
          else if (orig[i] === ' ' || orig[i] === '\n') { out += orig[i]; }
          else { out += GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
          count++;
        }
        node.nodeValue = out;
      });
      revealed = target;
      if (p < 1) requestAnimationFrame(frame);
      else nodes.forEach(function (node, ni) { node.nodeValue = originals[ni]; });
    }
    requestAnimationFrame(frame);
  }

  function init() {
    var els = document.querySelectorAll('[data-scramble]');
    if (!els.length) return;
    if (reduced) return; // leave text as-is
    var heroDone = false;
    window.addEventListener('redline:ready', function () {
      els.forEach(function (el) {
        if (el.hasAttribute('data-scramble-onview')) return;
        if (!heroDone) { heroDone = true; setTimeout(function () { scramble(el); }, 150); }
        else scramble(el);
      });
    });
    var onview = document.querySelectorAll('[data-scramble-onview]');
    if (onview.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      onview.forEach(function (el) { io.observe(el); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
