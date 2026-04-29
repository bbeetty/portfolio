(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Cursor light ──────────────────────────────────────────────
  // Only on desktop (fine pointer: mouse), not touch/tablet
  const cursorLight = document.querySelector('.cursor-light');
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorLight && hasFinePointer && !reducedMotion) {
    let targetX = -1000, targetY = -1000;
    let currentX = -1000, currentY = -1000;

    document.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorLight.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      cursorLight.style.opacity = '0';
    });

    (function tickLight() {
      // Eased follow — 0.07 gives a soft, slightly-delayed trail
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      cursorLight.style.left = currentX + 'px';
      cursorLight.style.top  = currentY + 'px';
      requestAnimationFrame(tickLight);
    })();
  }

  // ── Hero text: scroll-driven fade + rise ─────────────────────
  const heroText = document.querySelector('.hero-text-content');
  const heroSection = document.querySelector('.hero');

  if (heroText && heroSection && !reducedMotion) {
    let scrollTicking = false;

    function updateHeroFade() {
      const scrollY = window.scrollY;
      const heroH   = heroSection.offsetHeight;
      // Fade starts at 15% of hero height scrolled, gone at 55%
      const start   = heroH * 0.15;
      const end     = heroH * 0.55;
      const t       = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));

      heroText.style.opacity   = String(1 - t);
      heroText.style.transform = 'translateY(' + (-t * 32) + 'px)';
      scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        requestAnimationFrame(updateHeroFade);
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // ── Pause crossfade when floating-visual scrolls out of view ──
  var floatingAlt = document.querySelector('.floating-alt');
  if (floatingAlt && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      floatingAlt.style.animationPlayState = entries[0].isIntersecting ? 'running' : 'paused';
    }, { threshold: 0 }).observe(floatingAlt);
  }

  // ── Pause blob drift when ambient bg scrolls out of view ─────
  var ambientBg = document.querySelector('.site-ambient-bg');
  if (ambientBg && !reducedMotion && 'IntersectionObserver' in window) {
    var blobs = ambientBg.querySelectorAll('.ambient-blob');
    var blobObserver = new IntersectionObserver(function (entries) {
      var state = entries[0].isIntersecting ? 'running' : 'paused';
      blobs.forEach(function (b) { b.style.animationPlayState = state; });
    }, { threshold: 0 });
    blobObserver.observe(ambientBg);
  }

  // ── Scroll reveal for project + side cards ───────────────────
  var revealItems = document.querySelectorAll('.reveal-item');

  if (revealItems.length) {
    if (reducedMotion) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    } else if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      revealItems.forEach(function (el) { observer.observe(el); });
    } else {
      // IO not available — show everything
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // ── Floating image bounce (moved from inline script) ─────────
  var floatImg  = document.querySelector('.floating-visual');
  var heroEl    = document.querySelector('.hero');
  var hejEl     = document.querySelector('.hero-hej');

  if (floatImg && heroEl && hejEl) {
    setTimeout(function () {
      var cRect = heroEl.getBoundingClientRect();
      var hRect = hejEl.getBoundingClientRect();
      var iW    = floatImg.offsetWidth  || 480;
      var iH    = floatImg.offsetHeight || 480;
      var hL    = hRect.left - cRect.left;
      var hT    = hRect.top  - cRect.top;
      var hR    = hL + hRect.width;
      var hB    = hT + hRect.height;

      var x  = Math.max(hL, Math.min(hL + (hRect.width  / 2) - (iW / 2), hR - iW));
      var y  = Math.max(hT, Math.min(hT + (hRect.height / 2) - (iH / 2), hB - iH));
      var rotation = 0, vx = 0.6, vy = 0.2;

      floatImg.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(0deg)';

      (function animateFloat() {
        var cR = heroEl.getBoundingClientRect();
        var hR2 = hejEl.getBoundingClientRect();
        var hl = hR2.left - cR.left;
        var ht = hR2.top  - cR.top;
        var hr = hl + hR2.width;
        var hb = ht + hR2.height;
        var w  = floatImg.offsetWidth;
        var h  = floatImg.offsetHeight;

        x += vx;  y += vy;  rotation += 0.5;

        if (x < hl || x + w > hr) { vx = -vx; x = Math.max(hl, Math.min(x, hr - w)); }
        if (y < ht || y + h > hb) { vy = -vy; y = Math.max(ht, Math.min(y, hb - h)); }

        floatImg.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rotation + 'deg)';
        requestAnimationFrame(animateFloat);
      })();
    }, 100);
  }

})();
