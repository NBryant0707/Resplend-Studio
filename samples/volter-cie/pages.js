/* ════════════════════════════════════════════════════════════════════
   VOLTIER & CIE. — Shared page behaviour
   ────────────────────────────────────────────────────────────────────
   Loaded on every page alongside volter-cie.js (which owns the
   preloader, hero tilt, 360° studio, atelier scrub, couture, cart,
   locale, clocks and the base .reveal observer).

   This file owns only what the multi-page shell added:
     1. Active-link marking (derived from the URL — pages need no flags)
     2. Mobile menu overlay + hamburger morph
     3. Header condense-on-scroll
     4. Accordion
     5. Tabs
     6. Count-up statistics
     7. Magnetic button physics
     8. Ambient orb parallax
   ════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. ACTIVE LINK ───────────────────────────────────────────────
     Compare each nav/menu link's filename against the current one so
     every page gets its own highlight without per-page markup. */
  (function markCurrent() {
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.vc-nav__link, .vc-menu__link').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('#')[0].split('/').pop().toLowerCase();
      if (!href) return;
      if (href === here) a.classList.add('is-current');
    });
  })();

  /* ── 2. MOBILE MENU ───────────────────────────────────────────────
     The overlay is inert until opened; scroll locks behind it. */
  (function menu() {
    const burger = $('#vc-burger');
    const menu   = $('#vc-menu');
    if (!burger || !menu) return;

    let open = false;
    let lastFocus = null;

    function setOpen(next) {
      open = next;
      burger.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';

      if (open) {
        lastFocus = document.activeElement;
        // Wait for the first staggered link to be interactive.
        setTimeout(() => $('.vc-menu__link', menu)?.focus(), 120);
      } else if (lastFocus) {
        lastFocus.focus();
      }
    }

    burger.addEventListener('click', () => setOpen(!open));
    menu.addEventListener('click', (e) => {
      if (e.target.closest('.vc-menu__link')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    });
    // Leaving the mobile breakpoint should never strand a locked scroll.
    window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
      if (e.matches && open) setOpen(false);
    });
  })();

  /* ── 3. HEADER CONDENSE ──────────────────────────────────────────
     Tightens the floating pill once the page has scrolled past the
     first viewport third. Transform/opacity only. */
  (function headerScroll() {
    const header = $('#vc-header');
    if (!header) return;
    let ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 120);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ── 4. ACCORDION ────────────────────────────────────────────────
     One panel open at a time within a given .vc-acc group. */
  $$('.vc-acc').forEach((group) => {
    const items = $$('.vc-acc__item', group);
    items.forEach((item) => {
      const btn   = $('.vc-acc__btn', item);
      const panel = $('.vc-acc__panel', item);
      if (!btn || !panel) return;

      btn.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          $('.vc-acc__btn', other)?.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  /* ── 5. TABS ─────────────────────────────────────────────────────
     <div data-tabs> wraps .vc-tab[data-tab] buttons and
     .vc-tabpanel[data-panel] regions. */
  $$('[data-tabs]').forEach((group) => {
    const tabs   = $$('.vc-tab', group);
    const panels = $$('.vc-tabpanel', group);

    function select(key) {
      tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === key));
    }

    tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
    if (tabs.length) select(tabs.find((t) => t.classList.contains('is-active'))?.dataset.tab || tabs[0].dataset.tab);
  });

  /* ── 6. COUNT-UP STATS ───────────────────────────────────────────
     <span data-count="312" data-suffix="">312</span> — counts once
     when scrolled into view. Honours reduced motion. */
  (function counters() {
    const els = $$('[data-count]');
    if (!els.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => { el.textContent = format(el, Number(el.dataset.count)); });
      return;
    }

    function format(el, value) {
      const decimals = Number(el.dataset.decimals || 0);
      const body = decimals
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString('en-US');
      return `${el.dataset.prefix || ''}${body}${el.dataset.suffix || ''}`;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);

        const target   = Number(el.dataset.count);
        const duration = Number(el.dataset.duration || 1600);
        const start    = performance.now();

        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          // Same deceleration curve as the CSS easing.
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(el, target * eased);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = format(el, target);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    els.forEach((el) => io.observe(el));
  })();

  /* ── 7. MAGNETIC BUTTONS ─────────────────────────────────────────
     Pointer-tracked translation on .vc-btn, capped at 6px so the
     control never detaches from its hit area. */
  (function magnetic() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;

    $$('.vc-btn').forEach((btn) => {
      let frame = 0;

      btn.addEventListener('pointermove', (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const r = btn.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
          const y = ((e.clientY - r.top)  / r.height - 0.5) * 12;
          btn.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
          frame = 0;
        });
      });

      btn.addEventListener('pointerleave', () => {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        btn.style.transform = '';
      });
    });
  })();

  /* ── 8. ORB PARALLAX ─────────────────────────────────────────────
     The two fixed ambient orbs drift against the scroll direction. */
  (function orbs() {
    if (reduced) return;
    const top    = $('.vc-orb--top');
    const bottom = $('.vc-orb--bottom');
    if (!top && !bottom) return;

    let ticking = false;
    function update() {
      const y = window.scrollY;
      if (top)    top.style.transform    = `translate3d(0, ${(y *  0.06).toFixed(1)}px, 0)`;
      if (bottom) bottom.style.transform = `translate3d(0, ${(y * -0.04).toFixed(1)}px, 0)`;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  })();
})();
