/* Redline — main init: smooth scroll (Lenis) wired to ScrollTrigger. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (reduced) return;
    if (!window.Lenis) return;
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // anchor links through lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1) {
          var t = document.querySelector(id);
          if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
        }
      });
    });
  }

  window.addEventListener('redline:ready', init);
})();
