/* Redline — scroll choreography (GSAP ScrollTrigger). Progressive enhancement only:
   everything is visible by default; this layer only adds motion. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (reduced) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero parallax — title drifts slower than the scroll
    var heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      gsap.to(heroTitle, {
        yPercent: 18, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // Pinned horizontal series timeline (desktop only)
    var track = document.getElementById('series-track');
    if (track && window.matchMedia('(min-width: 961px)').matches) {
      var getDist = function () {
        return Math.max(0, track.scrollWidth - document.documentElement.clientWidth + 48);
      };
      gsap.to(track, {
        x: function () { return -getDist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.series', start: 'top top',
          end: function () { return '+=' + (getDist() + window.innerHeight * 0.4); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
    }

    // Curtain reveals for framed media
    document.querySelectorAll('[data-curtain]').forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', ease: 'power3.out', duration: 1.1,
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });

    // Post images: clip-path wipe in
    gsap.utils.toArray('.post-article img').forEach(function (img) {
      gsap.fromTo(img, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', ease: 'power3.out', duration: 1,
        scrollTrigger: { trigger: img, start: 'top 88%' }
      });
    });

    // Section eyebrows: quick red rule draw
    gsap.utils.toArray('.eyebrow').forEach(function (el) {
      gsap.from(el, {
        x: -24, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // Series progress bar fills when the section arrives
    var prog = document.querySelector('[data-progress]');
    if (prog) {
      var pct = Math.min(100, (parseInt(prog.getAttribute('data-progress'), 10) / 7) * 100);
      gsap.to(prog, {
        width: pct + '%', ease: 'power2.out', duration: 1.2,
        scrollTrigger: { trigger: '.series', start: 'top 70%' }
      });
    }
  }

  window.addEventListener('redline:ready', init);
})();
