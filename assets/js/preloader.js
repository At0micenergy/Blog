/* Redline — terminal boot preloader. Once per session, skippable, <2s. */
(function () {
  var el = document.getElementById('boot');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready() {
    window.dispatchEvent(new Event('redline:ready'));
  }
  if (!el) { ready(); return; }

  function finish(instant) {
    if (instant) {
      el.remove();
      ready();
      return;
    }
    el.classList.add('done');
    setTimeout(function () { el.remove(); ready(); }, 750);
  }

  // Repeat visits + reduced motion: no theatre, straight to content.
  if (reduced || sessionStorage.getItem('redline-boot')) { finish(true); return; }
  sessionStorage.setItem('redline-boot', '1');

  var lines = Array.prototype.slice.call(el.querySelectorAll('.bl'));
  var CHAR_MS = 5, STAGGER_MS = 140, HOLD_MS = 350;
  var longest = 0;
  lines.forEach(function (line, i) {
    var full = line.getAttribute('data-line');
    line.innerHTML = '';
    // last line keeps its blinking block cursor
    var keepCursor = i === lines.length - 1;
    // strip the cursor-block placeholder from the typed text
    var text = full.replace(/<span class='cursor-block'><\/span>/, '');
    if (text.length > longest) longest = text.length;
    setTimeout(function () {
      var span = document.createElement('span');
      line.appendChild(span);
      var j = 0;
      var iv = setInterval(function () {
        span.textContent = text.slice(0, ++j);
        if (j >= text.length) {
          clearInterval(iv);
          if (keepCursor) line.insertAdjacentHTML('beforeend', "<span class='cursor-block'></span>");
        }
      }, CHAR_MS);
    }, i * STAGGER_MS);
  });

  var skipped = false;
  function skip() { if (!skipped) { skipped = true; finish(false); } }
  el.addEventListener('click', skip);
  window.addEventListener('keydown', skip, { once: true });
  // auto-dismiss shortly after the last line finishes typing: total theatre <2s
  var theatre = (lines.length - 1) * STAGGER_MS + longest * CHAR_MS + HOLD_MS;
  setTimeout(skip, theatre);
  setTimeout(skip, theatre + 2000); // safety net
})();
