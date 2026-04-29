(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function charMs(ch) {
    var base = 45 + Math.random() * 25; // 45–70 ms
    if (/[.!?]/.test(ch))    return base + 160;
    if (/[,;:\-–]/.test(ch)) return base + 60;
    return base;
  }

  function fadeCursor(cursor) {
    setTimeout(function () {
      cursor.style.animation = 'none';
      cursor.offsetHeight;         // force reflow so transition fires
      cursor.style.opacity = '0';
    }, 2200);
  }

  // Type text into el; cursor is moved to follow the active typing-text span.
  // Moving an already-attached node is a single atomic DOM operation — no flash.
  function typeOne(el, text, cursor, onDone) {
    el.classList.add('typing-active');
    var textSpan = el.querySelector('.typing-text');
    textSpan.insertAdjacentElement('afterend', cursor); // move cursor here
    var i = 0;
    (function tick() {
      if (i < text.length) {
        textSpan.textContent += text[i];
        var delay = charMs(text[i]);
        i++;
        setTimeout(tick, delay);
      } else {
        onDone();
      }
    })();
  }

  // ── index.html: two-line sequence — ONE shared cursor ──────
  var seqEls = document.querySelectorAll('[data-typeseq]');
  if (seqEls.length) {
    var items = Array.prototype.slice.call(seqEls)
      .sort(function (a, b) { return +a.dataset.typeseq - +b.dataset.typeseq; })
      .map(function (el) { return { el: el, text: el.dataset.text }; });

    var fadeEl = document.querySelector('.hero-fade-late');

    if (reducedMotion) {
      items.forEach(function (item) {
        item.el.classList.add('typing-active');
        var ts = item.el.querySelector('.typing-text');
        if (ts) ts.textContent = item.text;
      });
      if (fadeEl) fadeEl.classList.add('is-revealed');
    } else {
      // Single cursor for the entire sequence — created once, moved between lines
      var seqCursor = document.createElement('span');
      seqCursor.className = 'typing-cursor';
      seqCursor.setAttribute('aria-hidden', 'true');

      var idx = 0;
      function nextSeq() {
        if (idx >= items.length) {
          fadeCursor(seqCursor);
          if (fadeEl) fadeEl.classList.add('is-revealed');
          return;
        }
        var item  = items[idx];
        var delay = idx === 0 ? 200 : 450; // brief pause between lines
        idx++;
        setTimeout(function () { typeOne(item.el, item.text, seqCursor, nextSeq); }, delay);
      }
      nextSeq();
    }
  }

  // ── about.html: single line (cursor is in HTML) ─────────────
  var singleEl = document.querySelector('[data-typing]:not([data-typeseq])');
  if (singleEl) {
    var text     = singleEl.dataset.text;
    var textSpan = singleEl.querySelector('.typing-text');
    var cursor   = singleEl.querySelector('.typing-cursor');

    if (reducedMotion) {
      singleEl.classList.add('typing-active');
      if (textSpan) textSpan.textContent = text;
      if (cursor)   cursor.style.display = 'none';
    } else {
      singleEl.classList.add('typing-active');
      var j = 0;
      (function tickSingle() {
        if (j < text.length) {
          textSpan.textContent += text[j];
          var delay = charMs(text[j]);
          j++;
          setTimeout(tickSingle, delay);
        } else {
          if (cursor) fadeCursor(cursor);
        }
      })();
    }
  }

})();
