/* Redline - custom cursor. Fine pointers only; expands on links, says READ on cards. */
(function () {
  function init() {
    if (!document.documentElement.classList.contains('has-cursor')) return;
    var cur = document.getElementById('cursor');
    if (!cur) return;
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
      var read = e.target.closest && e.target.closest('.card-read');
      var link = e.target.closest && e.target.closest('a, button');
      cur.classList.toggle('is-read', !!read);
      cur.classList.toggle('is-link', !!link && !read);
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
