(function () {
  'use strict';

  var menu = document.querySelector('.nav-menu');
  var menuButton = document.querySelector('.menu-button');
  var search = document.querySelector('.search');
  var searchButton = document.querySelector('.search-button');
  var searchInput = document.getElementById('js-search-input');
  var activeOverlay = null;
  var returnFocus = null;

  function closeOverlay(restoreFocus) {
    if (!activeOverlay) return;
    activeOverlay.classList.remove('active');
    if (activeOverlay === search) search.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    searchButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overlay-open');
    activeOverlay = null;
    if (restoreFocus && returnFocus) returnFocus.focus();
    returnFocus = null;
  }

  function openOverlay(overlay, button, focusTarget) {
    closeOverlay(false);
    returnFocus = button;
    activeOverlay = overlay;
    overlay.hidden = false;
    overlay.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overlay-open');
    focusTarget.focus();
  }

  menuButton.addEventListener('click', function () {
    openOverlay(menu, menuButton, menu.querySelector('.menu-close'));
  });
  menu.querySelector('.menu-close').addEventListener('click', function () {
    closeOverlay(true);
  });
  searchButton.addEventListener('click', function () {
    openOverlay(search, searchButton, searchInput);
  });
  search.querySelector('.search-close-button').addEventListener('click', function () {
    closeOverlay(true);
  });
  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeOverlay(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992 && activeOverlay === menu) closeOverlay(false);
  });

  document.addEventListener('keydown', function (event) {
    if (!activeOverlay) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay(true);
      return;
    }
    if (event.key !== 'Tab') return;
    var targets = Array.prototype.filter.call(
      activeOverlay.querySelectorAll('a[href], button, input, [tabindex="0"]'),
      function (element) { return !element.disabled && element.getClientRects().length > 0; }
    );
    var first = targets[0];
    var last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelector('.top').addEventListener('click', function () {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    document.querySelector('.logo-text').focus({ preventScroll: true });
  });

  // Keep wide tables inside the article on small screens.
  document.querySelectorAll('.post-body table, .page-body table').forEach(function (table) {
    if (table.parentElement.classList.contains('table-container')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'table-container';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable table');
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  if (window.jQuery && window.jQuery.fn.fitVids) {
    window.jQuery('.post-content, .page-content').fitVids({
      customSelector: ['iframe[src*="ted.com"]']
    });
  }
}());
