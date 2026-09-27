/* Redline - scroll-velocity ticker. Takes over the CSS marquee with a rAF loop:
   the strip drifts at its resting speed, accelerates with scroll velocity and
   skews into the motion. Pauses on hover. Without JS the CSS animation runs;
   under prefers-reduced-motion this file bails and the CSS kill-switch applies. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function init() {
    var ticker = document.querySelector('.ticker');
    var track = ticker ? ticker.querySelector('.ticker-track') : null;
    if (!track || reduced) return;
    track.classList.add('is-live');

    var half = 0, x = 0;
    var vel = 0, spd = 0, lastY = window.scrollY;
    var hovering = false, running = false, rafId = 0, last = 0;

    function measure() {
      half = track.scrollWidth / 2;
    }
    measure();
    window.addEventListener('resize', measure);

    function frame(now) {
      var dt = Math.min(64, now - last) / 1000;
      last = now;
      vel *= 0.94;
      spd *= 0.94;
      var base = half / 36; // px/s - matches the 36s CSS loop
      var target = hovering ? 0 : base * (1 + Math.min(4, spd * 0.02));
      x -= target * dt;
      if (x <= -half) x += half;
      var skew = hovering ? 0 : Math.max(-10, Math.min(10, vel * 0.03));
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
      if (running) rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var dy = y - lastY;
      vel = vel * 0.7 + dy * 0.3;
      spd = spd * 0.7 + Math.abs(dy) * 0.3;
      lastY = y;
    }, { passive: true });

    ticker.addEventListener('mouseenter', function () { hovering = true; });
    ticker.addEventListener('mouseleave', function () { hovering = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start(); else stop();
      }, { threshold: 0 }).observe(ticker);
    } else {
      start();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
