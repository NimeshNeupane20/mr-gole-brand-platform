/* ============================================================
   Mr Gole + The Second Plate — main.js
   Header scroll state, scroll-reveal, hero parallax, year stamp.
   Vanilla JS, no dependencies. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky header: transparent over hero -> solid on scroll ---- */
  var header = document.querySelector('.site-header');
  if (header && !header.classList.contains('site-header--prefers-solid')) {
    var onScroll = function () {
      if (window.scrollY > 60) header.classList.add('is-solid');
      else header.classList.remove('is-solid');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Scroll-reveal: fade + small translate, once ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Hero parallax (subtle drift + zoom) ---- */
  var heroMedia = document.querySelector('.hero__media');
  if (heroMedia && !reduceMotion) {
    var raf = 0;
    var park = function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 900) {
          heroMedia.style.transform = 'translateY(' + (y * 0.32) + 'px) scale(' + (1 + Math.min(y, 600) * 0.0004) + ')';
        }
      });
    };
    window.addEventListener('scroll', park, { passive: true });
  }

  /* ---- Mobile nav toggle (progressive: nav hidden < 600px) ---- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = mobileNav.hasAttribute('hidden') === false;
      if (open) { mobileNav.setAttribute('hidden', ''); navToggle.setAttribute('aria-expanded', 'false'); }
      else { mobileNav.removeAttribute('hidden'); navToggle.setAttribute('aria-expanded', 'true'); }
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.setAttribute('hidden', ''); navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Count-up numbers (timeline stats) ---- */
  function fmtCount(el, v) {
    var target = parseFloat(el.getAttribute('data-count'));
    var plain = el.getAttribute('data-plain');
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;
    return (plain ? Math.round(v).toString() : v.toFixed(decimals)) + suffix;
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var startTs = null, dur = 1100;
    function tick(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min(1, (ts - startTs) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtCount(el, target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmtCount(el, target);
    }
    requestAnimationFrame(tick);
  }
  var counts = document.querySelectorAll('[data-count]');
  if (counts.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counts.forEach(function (el) { el.textContent = fmtCount(el, parseFloat(el.getAttribute('data-count'))); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counts.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---- Video gallery: scroll-driven scatter -> settle into an ARC/fan (transform/opacity only) ---- */
  var gallery = document.querySelector('.vgallery');
  if (gallery && !reduceMotion && window.matchMedia('(min-width: 901px)').matches) {
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    gallery.classList.add('vgallery--arc');
    var vcards = Array.prototype.slice.call(gallery.querySelectorAll('.vcard'));
    var n = vcards.length, mid = (n - 1) / 2, amp = 72;
    var scat = vcards.map(function (c, i) {
      return { sx: (i - mid) * 26 + ((i * 53) % 70 - 35), sy: 150 + (i * 37) % 90, sr: (i % 2 ? -1 : 1) * (12 + (i * 9) % 16) };
    });
    vcards.forEach(function (c, i) { c.style.zIndex = String(Math.round(100 - Math.abs(i - mid) * 4)); });
    var ticking = false;
    var draw = function () {
      ticking = false;
      var rect = gallery.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var usable = gallery.clientWidth || 1100;
      var spacing = Math.min(96, (usable - 168) / 2 / Math.max(mid, 1));
      var p = clamp((vh * 0.9 - rect.top) / (vh * 0.5), 0, 1);
      for (var i = 0; i < n; i++) {
        var off = i - mid;
        var fx = off * spacing;
        var fy = amp * Math.pow(off / Math.max(mid, 1), 2);
        var fr = off * 3.0;
        var cp = clamp((p - i * 0.045) / 0.5, 0, 1);
        cp = 1 - Math.pow(1 - cp, 3);
        var x = scat[i].sx + (fx - scat[i].sx) * cp;
        var y = scat[i].sy + (fy - scat[i].sy) * cp;
        var r = scat[i].sr + (fr - scat[i].sr) * cp;
        vcards[i].style.setProperty('--r', fr.toFixed(2) + 'deg');
        vcards[i].style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg)';
        vcards[i].style.opacity = cp.toFixed(3);
      }
    };
    var onScrollG = function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } };
    window.addEventListener('scroll', onScrollG, { passive: true });
    window.addEventListener('resize', onScrollG, { passive: true });
    draw();
  }

  /* ---- Magnetic buttons (vanilla port of React Bits <Magnet/>) on the shiny CTAs ---- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var magnets = Array.prototype.slice.call(document.querySelectorAll('.mg-btn--shiny'));
    var pad = 60, strength = 3;
    magnets.forEach(function (el) {
      el.style.willChange = 'transform';
      window.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (Math.abs(cx - e.clientX) < r.width / 2 + pad && Math.abs(cy - e.clientY) < r.height / 2 + pad) {
          el.style.transition = 'transform 0.3s ease-out';
          el.style.transform = 'translate3d(' + ((e.clientX - cx) / strength).toFixed(1) + 'px,' + ((e.clientY - cy) / strength).toFixed(1) + 'px,0)';
        } else if (el.style.transform && el.style.transform !== 'translate3d(0px,0px,0)') {
          el.style.transition = 'transform 0.5s ease-in-out';
          el.style.transform = 'translate3d(0px,0px,0)';
        }
      }, { passive: true });
    });
  }

  /* ---- Footer year ---- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
