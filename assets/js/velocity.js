/* Redline — scroll-velocity reactive variable type for [data-velocity] titles. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function init() {
    var els = document.querySelectorAll('[data-velocity]');
    if (!els.length || reduced) return;
    var lastY = window.scrollY, vel = 0, wght = 560, ticking = false;

    function tick() {
      // ease weight toward target, decay to rest
      var target = 560 + Math.min(280, Math.abs(vel) * 0.55);
      wght += (target - wght) * 0.12;
      if (Math.abs(vel) < 2) wght += (560 - wght) * 0.08;
      var w = Math.round(Math.max(400, Math.min(840, wght)));
      for (var i = 0; i < els.length; i++) {
        els[i].style.fontVariationSettings = "'wght' " + w;
      }
      vel *= 0.9;
      ticking = Math.abs(vel) > 0.5 || Math.abs(wght - 560) > 1;
      if (ticking) requestAnimationFrame(tick);
    }
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      vel = vel * 0.6 + (y - lastY) * 0.4;
      lastY = y;
      if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
