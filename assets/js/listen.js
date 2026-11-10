// Listen (Player E): floating section chip + read-along highlighting.
// Activates only on posts that carry the listen markup (audio front matter).
(function () {
  var entry = document.querySelector('[data-listen-entry]');
  if (!entry) return;

  var chip = document.querySelector('[data-listen-chip]');
  var audio = document.querySelector('[data-listen-audio]');
  var playBtn = chip.querySelector('[data-listen-play]');
  var sectionEl = chip.querySelector('[data-listen-section]');
  var timeEl = chip.querySelector('[data-listen-time]');
  var track = chip.querySelector('[data-listen-track]');
  var fill = chip.querySelector('[data-listen-fill]');
  var speedBtn = chip.querySelector('[data-listen-speed]');

  // Page units in narration order: headings, paragraphs, list items in the
  // article body, excluding layout furniture and diagram fallbacks.
  var units = Array.prototype.filter.call(
    document.querySelectorAll('#article h2, #article h3, #article p, #article li'),
    function (el) {
      if (el.closest('.post-foot, .why-note, .series-nav, .series-check, figure')) return false;
      if (el.tagName === 'P' && el.parentElement && el.parentElement.tagName === 'LI') return false;
      return true;
    });

  var map = null;         // [{s, sec, el}] from the timing JSON
  var curUnit = -2;       // map index currently shown
  var rates = [1, 1.25, 1.5, 2];
  var rateIdx = 0;
  var idleTimer = null;

  fetch(audio.getAttribute('data-timing'))
    .then(function (r) { return r.json(); })
    .then(function (j) { map = j.units; })
    .catch(function () { map = null; });

  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }

  function setPlayingUI(playing) {
    playBtn.classList.toggle('playing', playing);
    entry.classList.toggle('playing', playing);
  }

  function armIdle() {
    chip.classList.remove('idle');
    if (idleTimer) clearTimeout(idleTimer);
    if (!audio.paused) {
      idleTimer = setTimeout(function () { chip.classList.add('idle'); }, 3000);
    }
  }

  function update() {
    var t = audio.currentTime, d = audio.duration || 0;
    if (d > 0) fill.style.width = (t / d * 100).toFixed(2) + '%';
    timeEl.textContent = fmt(t) + ' / ' + fmt(d);
    if (!map) return;
    var idx = -1;
    for (var i = 0; i < map.length; i++) {
      if (map[i].s <= t + 0.05) idx = i; else break;
    }
    if (idx === curUnit) return;
    curUnit = idx;
    var prev = document.querySelector('#article .reading-now');
    if (prev) prev.classList.remove('reading-now');
    if (idx >= 0) {
      sectionEl.textContent = map[idx].sec;
      if (map[idx].el !== null && map[idx].el !== undefined && units[map[idx].el]) {
        units[map[idx].el].classList.add('reading-now');
      }
    }
  }

  function toggle() {
    if (audio.paused) { audio.play(); } else { audio.pause(); }
  }

  entry.addEventListener('click', function () {
    if (chip.hidden) { chip.hidden = false; }
    toggle();
  });
  playBtn.addEventListener('click', toggle);
  audio.addEventListener('play', function () { setPlayingUI(true); armIdle(); });
  audio.addEventListener('pause', function () { setPlayingUI(false); chip.classList.remove('idle'); if (idleTimer) clearTimeout(idleTimer); });
  audio.addEventListener('timeupdate', update);
  audio.addEventListener('seeked', update);
  audio.addEventListener('loadedmetadata', update);
  audio.addEventListener('ended', function () {
    setPlayingUI(false);
    var prev = document.querySelector('#article .reading-now');
    if (prev) prev.classList.remove('reading-now');
  });

  speedBtn.addEventListener('click', function () {
    rateIdx = (rateIdx + 1) % rates.length;
    audio.playbackRate = rates[rateIdx];
    speedBtn.textContent = rates[rateIdx] + '×';
  });

  function seekFromEvent(e) {
    if (!audio.duration) return;
    var r = track.getBoundingClientRect();
    var f = (e.clientX - r.left) / r.width;
    f = Math.min(1, Math.max(0, f));
    audio.currentTime = f * audio.duration;
    update();
  }
  var dragging = false;
  track.addEventListener('pointerdown', function (e) { dragging = true; track.setPointerCapture(e.pointerId); seekFromEvent(e); });
  track.addEventListener('pointermove', function (e) { if (dragging) seekFromEvent(e); });
  track.addEventListener('pointerup', function () { dragging = false; });
  track.addEventListener('pointercancel', function () { dragging = false; });

  chip.addEventListener('pointermove', armIdle);
  chip.addEventListener('pointerdown', armIdle);
})();
