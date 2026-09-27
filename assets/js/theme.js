/* Redline - theme toggle (ink <-> paper), persisted. */
(function () {
  function init() {
    var root = document.documentElement;
    var btn = document.getElementById('theme-toggle');
    try {
      var saved = localStorage.getItem('redline-theme');
      if (saved === 'paper' || saved === 'ink') root.setAttribute('data-theme', saved);
    } catch (e) {}
    function paint() {
      if (!btn) return;
      btn.textContent = root.getAttribute('data-theme') === 'paper' ? '◑ ink' : '◐ paper';
    }
    paint();
    if (btn) btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'paper' ? 'ink' : 'paper';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('redline-theme', next); } catch (e) {}
      paint();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
