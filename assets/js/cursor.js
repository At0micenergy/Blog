/* Redline - custom cursor. Fine pointers only; context states per hover target:
   default dot, ring on links, READ disc on post cards, COPY disc on code
   copy buttons, hidden (native I-beam) over text inputs. */
(function () {
  'use strict';
  function init() {
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      document.documentElement.classList.add('has-cursor');
    }
    if (!document.documentElement.classList.contains('has-cursor')) return;
    var cur = document.getElementById('cursor');
    if (!cur) return;
    var label = cur.querySelector('.cur-label');
    var x = -100, y = -100, tx = -100, ty = -100, raf = null;

    function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var t = (e.target && e.target.closest) ? e.target : null;
      var copy = !!(t && t.closest('.copy-btn'));
      var read = !!(t && t.closest('.card-read'));
      var link = !!(t && t.closest('a, button'));
      var type = !!(t && t.closest('input[type="text"], input:not([type]), textarea'));
      cur.classList.toggle('is-copy', copy);
      cur.classList.toggle('is-read', read && !copy);
      cur.classList.toggle('is-link', link && !read && !copy);
      cur.classList.toggle('is-type', type);
      if (label) label.textContent = copy ? 'COPY' : 'READ';
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
