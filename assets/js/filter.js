/* Redline - tag filter for the posts index, with animated transitions. */
(function () {
  function init() {
    var bar = document.getElementById('filter-bar');
    var grid = document.getElementById('posts-grid');
    var count = document.getElementById('posts-count');
    if (!bar || !grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
    var total = cards.length;

    function paintCount(n, label) {
      if (count) count.textContent = n + ' / ' + total + ' - #' + label;
    }
    paintCount(total, 'all');

    function apply(filter, label) {
      var visible = [];
      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(/\s+/);
        var show = filter === 'all' || tags.indexOf(filter) !== -1;
        if (show) visible.push(card);
      });
      // phase 1: fade everything out
      cards.forEach(function (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(.97)';
      });
      setTimeout(function () {
        cards.forEach(function (card) {
          var show = visible.indexOf(card) !== -1;
          card.classList.toggle('is-hidden', !show);
        });
        // phase 2: stagger back in
        visible.forEach(function (card, i) {
          card.style.transitionDelay = (i * 35) + 'ms';
          requestAnimationFrame(function () {
            card.style.opacity = '1';
            card.style.transform = '';
          });
        });
        setTimeout(function () {
          cards.forEach(function (c) { c.style.transitionDelay = ''; });
        }, visible.length * 35 + 400);
        paintCount(visible.length, label);
      }, 190);
    }

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      apply(btn.getAttribute('data-filter'), btn.textContent.trim().split(/\s/)[0]);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
