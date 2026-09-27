/* Footer terminal easter egg: a working fake shell in the footer.
   Progressive enhancement: without JS a static "stay paranoid" line shows.
   Output is built with textContent (XSS-safe). History via up/down arrows. */
(function () {
  'use strict';
  var root = document.querySelector('[data-ft]');
  if (!root) return;
  var staticLine = root.parentElement.querySelector('.ft-static');
  var out = root.querySelector('[data-ft-out]');
  var form = root.querySelector('[data-ft-form]');
  var input = root.querySelector('.ft-input');

  if (staticLine) staticLine.hidden = true;
  root.hidden = false;

  var COMMANDS = {
    help: 'commands: whoami · ls · sudo · rm -rf / · paranoid · hello · clear · exit',
    whoami: 'visitor — here to break agents, hopefully',
    ls: 'posts/  series/  tags/  about/  feed.xml',
    sudo: 'nice try.',
    paranoid: 'always.',
    hello: 'hey.',
    hi: 'hey.',
    clear: '',
    exit: 'there is no escape. the blog is static.',
    quit: 'there is no escape. the blog is static.'
  };

  var history = [];
  var hIndex = -1;

  function line(text, cls) {
    var p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    out.appendChild(p);
    return p;
  }

  function run(raw) {
    var cmd = raw.trim();
    line('$ ' + cmd, 'ft-echo');
    if (!cmd) return;
    history.unshift(cmd);
    hIndex = -1;
    var c = cmd.toLowerCase();
    if (c === 'clear') { out.textContent = ''; return; }
    if (/^rm\b/.test(c)) { line('this is a static site. there is nothing to delete.', 'ft-resp'); return; }
    if (c === 'vim' || c === 'emacs' || c === 'nano') { line('no.', 'ft-resp'); return; }
    if (Object.prototype.hasOwnProperty.call(COMMANDS, c)) {
      line(COMMANDS[c], 'ft-resp');
    } else {
      line("command not found: " + cmd.split(/\s+/)[0] + " — try 'help'", 'ft-resp');
    }
    while (out.children.length > 24) out.removeChild(out.firstChild);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    run(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length && hIndex < history.length - 1) input.value = history[++hIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIndex > 0) input.value = history[--hIndex];
      else { hIndex = -1; input.value = ''; }
    }
  });
})();
