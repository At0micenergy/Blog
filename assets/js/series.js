/* Series reading progress: localStorage-backed "mark complete" + read counts.
   No network, no cookies. Storage key holds an array of completed part numbers.
   Progressive enhancement: the post-page control is hidden until this runs,
   and counts default to 0/7 without JS. */
(function () {
  'use strict';
  var KEY = 'redline.series.read.v1';
  var TOTAL = 7;

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(v)) return v.filter(function (n) { return Number.isInteger(n) && n >= 1 && n <= TOTAL; });
    } catch (e) { /* storage unavailable or corrupt: start empty */ }
    return [];
  }
  function save(read) {
    try { localStorage.setItem(KEY, JSON.stringify(read)); } catch (e) { /* private mode etc. */ }
  }

  var read = load();

  function paint() {
    // Filled markers + "read" suffix on tracker steps
    var steps = document.querySelectorAll('.series-step[data-part]');
    for (var i = 0; i < steps.length; i++) {
      var part = parseInt(steps[i].getAttribute('data-part'), 10);
      var done = read.indexOf(part) !== -1;
      steps[i].classList.toggle('is-read', done);
      var st = steps[i].querySelector('.step-status');
      if (st) {
        if (!st.getAttribute('data-status')) st.setAttribute('data-status', st.textContent);
        st.textContent = done ? st.getAttribute('data-status') + ' · read' : st.getAttribute('data-status');
      }
    }
    // Counts on the tracker and the homepage hero
    var counts = document.querySelectorAll('[data-series-read-count]');
    for (var j = 0; j < counts.length; j++) counts[j].textContent = read.length;
    // Read-progress bar on the tracker
    var bars = document.querySelectorAll('[data-series-read-bar]');
    for (var k = 0; k < bars.length; k++) bars[k].style.width = (read.length / TOTAL * 100) + '%';
  }

  // Post-page toggle control
  var box = document.querySelector('[data-series-check]');
  if (box) {
    box.removeAttribute('hidden');
    var part = parseInt(box.getAttribute('data-series-check'), 10);
    var btn = box.querySelector('.series-check-btn');
    var label = box.querySelector('.sc-label');
    var paintBtn = function () {
      var done = read.indexOf(part) !== -1;
      btn.setAttribute('aria-pressed', done ? 'true' : 'false');
      box.classList.toggle('is-done', done);
      label.textContent = done ? 'Part ' + part + ' complete - tap to undo' : 'Mark part ' + part + ' complete';
    };
    btn.addEventListener('click', function () {
      var at = read.indexOf(part);
      if (at === -1) read.push(part); else read.splice(at, 1);
      save(read);
      paintBtn();
      paint();
    });
    paintBtn();
  }

  paint();
})();
