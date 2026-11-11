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
  var chaptersBtn = chip.querySelector('[data-listen-chapters-btn]');
  var drawer = document.querySelector('[data-listen-drawer]');
  var drawerList = drawer.querySelector('[data-listen-drawer-list]');
  var drawerClose = drawer.querySelector('[data-listen-drawer-close]');
  var rail = chip.querySelector('.lc-rail');

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
  var chapters = null;    // [{t, label, el}] from the timing JSON
  var chapterRows = [];
  var curChapter = -2;
  var curUnit = -2;       // map index currently shown
  var rates = [1, 1.25, 1.5, 2];
  var rateIdx = 0;
  var idleTimer = null;

  // Follow-scroll: while the narration plays, keep the highlighted unit in
  // a comfortable band of the viewport with smooth scrolls. Any manual
  // scroll (wheel, touch, scroll keys, scrollbar) releases the page to the
  // reader until follow is re-engaged by pressing play again, seeking, a
  // chapter tap, or tapping the section name in the chip. Paused or ended
  // playback never scrolls.
  var follow = true;
  var progTarget = null;
  var progScrollUntil = 0;
  var motionOK = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function scrollToEl(el) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var target = Math.max(0, window.scrollY + r.top - vh * 0.30);
    progTarget = target;
    progScrollUntil = Date.now() + 2500;
    window.scrollTo({ top: target, behavior: motionOK ? 'smooth' : 'auto' });
  }

  function maybeFollow(el) {
    if (!follow || audio.paused || !el) return;
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.bottom < vh * 0.15 || r.top > vh * 0.75) scrollToEl(el);
  }

  function releaseFollow(e) {
    if (e && e.target && e.target.closest && e.target.closest('[data-listen-chip], [data-listen-drawer]')) return;
    follow = false;
  }
  window.addEventListener('wheel', releaseFollow, { passive: true });
  window.addEventListener('touchmove', releaseFollow, { passive: true });
  window.addEventListener('scroll', function () {
    if (chip.hidden || audio.paused) return;
    if (progTarget !== null) {
      if (Math.abs(window.scrollY - progTarget) <= 2 || Date.now() > progScrollUntil) progTarget = null;
      return;  // still animating toward the follow target
    }
    follow = false;  // scrollbar drag or any other non-programmatic scroll
  }, { passive: true });

  sectionEl.style.cursor = 'pointer';
  sectionEl.title = 'Jump to what is playing';
  sectionEl.addEventListener('click', function () {
    follow = true;
    if (curUnit >= 0 && map && map[curUnit] && units[map[curUnit].el]) scrollToEl(units[map[curUnit].el]);
  });

  fetch(audio.getAttribute('data-timing'))
    .then(function (r) { return r.json(); })
    .then(function (j) {
      map = j.units;
      if (j.chapters && j.chapters.length) buildChapters(j.chapters, j.duration);
    })
    .catch(function () { map = null; });

  function buildChapters(list, total) {
    chapters = list;
    list.forEach(function (c, i) {
      if (c.t > 0 && total > 0) {
        var tick = document.createElement('span');
        tick.className = 'lc-tick';
        tick.style.left = (c.t / total * 100).toFixed(2) + '%';
        rail.appendChild(tick);
      }
      var row = document.createElement('button');
      row.className = 'ld-row';
      row.type = 'button';
      var t = document.createElement('span');
      t.className = 'ld-t';
      t.textContent = fmt(c.t);
      var n = document.createElement('span');
      n.className = 'ld-name';
      n.textContent = c.label;
      row.appendChild(t);
      row.appendChild(n);
      row.addEventListener('click', function () {
        follow = true;
        audio.currentTime = c.t;
        if (audio.paused) audio.play();
        if (c.el !== null && c.el !== undefined && units[c.el]) {
          var cr = units[c.el].getBoundingClientRect();
          progTarget = Math.max(0, window.scrollY + cr.top);
          progScrollUntil = Date.now() + 2500;
          units[c.el].scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' });
        }
        drawer.hidden = true;
        update();
      });
      drawerList.appendChild(row);
      chapterRows.push(row);
    });
  }

  function markChapter(t) {
    if (!chapters) return;
    var idx = -1;
    for (var i = 0; i < chapters.length; i++) {
      if (chapters[i].t <= t + 0.05) idx = i; else break;
    }
    if (idx === curChapter) return;
    curChapter = idx;
    chapterRows.forEach(function (row, i) { row.classList.toggle('now', i === idx); });
  }

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
    if (!audio.paused && drawer.hidden) {
      idleTimer = setTimeout(function () { chip.classList.add('idle'); }, 3000);
    }
  }

  function update() {
    var t = audio.currentTime, d = audio.duration || 0;
    if (d > 0) fill.style.width = (t / d * 100).toFixed(2) + '%';
    timeEl.textContent = fmt(t) + ' / ' + fmt(d);
    markChapter(t);
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
        maybeFollow(units[map[idx].el]);
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
  audio.addEventListener('play', function () { follow = true; setPlayingUI(true); armIdle(); });
  audio.addEventListener('pause', function () { setPlayingUI(false); chip.classList.remove('idle'); if (idleTimer) clearTimeout(idleTimer); });
  audio.addEventListener('timeupdate', update);
  audio.addEventListener('seeked', function () { follow = true; update(); });
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

  chaptersBtn.addEventListener('click', function () {
    drawer.hidden = !drawer.hidden;
    if (!drawer.hidden) { chip.classList.remove('idle'); if (idleTimer) clearTimeout(idleTimer); }
    else armIdle();
  });
  drawerClose.addEventListener('click', function () { drawer.hidden = true; armIdle(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.hidden) { drawer.hidden = true; armIdle(); }
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].indexOf(e.key) >= 0 &&
        e.target === document.body) follow = false;
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
