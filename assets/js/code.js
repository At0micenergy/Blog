/* Redline - terminal chrome + copy buttons for code blocks; copy-link buttons. */
(function () {
  function init() {
    // Wrap post code blocks in terminal chrome
    document.querySelectorAll('.post-article pre').forEach(function (pre) {
      if (pre.closest('.codeblock')) return;
      var code = pre.querySelector('code');
      var lang = '';
      if (code && code.className) {
        var m = code.className.match(/language-([\w+-]+)/);
        if (m) lang = m[1];
      }
      var wrap = document.createElement('div');
      wrap.className = 'codeblock';
      var bar = document.createElement('div');
      bar.className = 'codeblock-bar';
      bar.innerHTML = '<span class="cdot r"></span><span class="cdot"></span><span class="cdot"></span>' +
        '<span>' + (lang ? lang + ' - ' : '') + 'lab terminal</span>';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'copy';
      btn.addEventListener('click', function () {
        var text = pre.innerText;
        function ok() { btn.textContent = 'copied ✓'; btn.classList.add('copied'); setTimeout(function(){ btn.textContent='copy'; btn.classList.remove('copied'); }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok, ok);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta); ok();
        }
      });
      bar.appendChild(btn);
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(bar);
      wrap.appendChild(pre);
    });

    // Copy-link buttons
    document.querySelectorAll('.copy-link').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-url') || location.href;
        function ok() { var o = btn.textContent; btn.textContent = 'copied ✓'; setTimeout(function(){ btn.textContent = o; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, ok);
        else ok();
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
