/* ════════════════════════════════════════════════════════════════════
   VOLTIER & CIE. — Static JS
   ────────────────────────────────────────────────────────────────────
   No build step. No framework. Plain ES2020.
   Implements:
   1. Preloader counter
   2. Hero tilt + dynamic lighting
   3. Bento reveal-on-scroll
   4. Object Studio 360° drag + hotspots
   5. Atelier sticky-scroll stage scrub
   6. Couture variant selection + add-to-cart
   7. Cart drawer toggle + line items
   8. Locale switcher (visual)
   9. Live clocks
   ════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ── 1. PRELOADER ─────────────────────────────────────────────── */
  (function preloader() {
    const el = $('#vc-preloader');
    if (!el) return;
    const num = $('#vc-preloader-num');
    const fill = $('#vc-preloader-fill');
    const start = performance.now();
    const duration = 1400;
    let raf = 0;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.round(t * 100);
      if (num) num.textContent = v.toString().padStart(2, '0');
      if (fill) fill.style.width = `${v}%`;
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          el.classList.add('is-done');
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          setTimeout(() => el.remove(), 700);
        }, 240);
      }
    }
    raf = requestAnimationFrame(tick);
  })();

  /* ── 2. HERO TILT ─────────────────────────────────────────────── */
  (function heroTilt() {
    const stage = $('#vc-hero-stage');
    const img = $('#vc-hero-img');
    const light = $('#vc-hero-light');
    if (!stage || !img) return;

    const rect = () => stage.getBoundingClientRect();
    let raf = 0, tx = 0, ty = 0, lx = 50, ly = 50, applied = false;

    function apply() {
      // Translate pixel motion into small rotation (+/- 6°).
      const rotY = Math.max(-6, Math.min(6, tx * 6));
      const rotX = Math.max(-6, Math.min(6, ty * 6)) * -1; // invert so cursor-up tilts top back
      img.style.setProperty('--tilt-y', `${rotY}deg`);
      img.style.setProperty('--tilt-x', `${rotX}deg`);
      if (light) {
        light.style.setProperty('--light-x', `${lx}%`);
        light.style.setProperty('--light-y', `${ly}%`);
      }
      applied = false;
      raf = 0;
    }

    stage.addEventListener('mousemove', (e) => {
      const r = rect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      lx = (e.clientX - r.left) / r.width * 100;
      ly = (e.clientY - r.top) / r.height * 100;
      if (!applied) { applied = true; raf = requestAnimationFrame(apply); }
    });
    stage.addEventListener('mouseleave', () => {
      tx = ty = 0; lx = ly = 50;
      if (!applied) { applied = true; raf = requestAnimationFrame(apply); }
    });
  })();

  /* ── 3. REVEAL-ON-SCROLL (Bento + atelier stages) ─────────────── */
  (function revealOnScroll() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.idx || 0);
          entry.target.style.transitionDelay = `${idx * 60}ms`;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '-10% 0% -10% 0%', threshold: 0.15 });
    els.forEach((el, i) => { el.dataset.idx = String(i % 6); io.observe(el); });
  })();

  /* ── 4. OBJECT STUDIO 360° + HOTSPOTS ─────────────────────────── */
  (function objectStudio() {
    const wrap = $('#vc-360');
    const img = $('#vc-360-img');
    const fill = $('#vc-360-fill');
    if (!wrap || !img) return;

    const tipsHost = $('#vc-hotspot-tips');
    const HOTSPOTS = [
      { label: 'Caseback engraving',  detail: 'Hand-engraved with the watchmaker\'s signature and edition number.' },
      { label: 'Escapement',          detail: '28,800 vph · free-sprung balance · 312 components total.' },
      { label: 'Free-sprung balance', detail: 'Glucydur balance, adjusted to within ±2 seconds per day.' },
      { label: 'Power reserve',       detail: '72 hours · single mainspring barrel · hand-wound.' }
    ];

    let dragging = false, dragStart = 0, baseRot = 0, curRot = 0;

    function apply() {
      img.style.setProperty('--rot-y', `${curRot}deg`);
      const halfWidth = wrap.offsetWidth || 700;
      const progress = Math.max(0, Math.min(100, ((curRot + 180) / 360) * 100));
      if (fill) fill.style.width = `${progress}%`;
    }

    wrap.addEventListener('pointerdown', (e) => {
      wrap.setPointerCapture(e.pointerId);
      dragging = true;
      dragStart = e.clientX;
      baseRot = curRot;
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const delta = e.clientX - dragStart;
      const halfWidth = wrap.offsetWidth || 700;
      curRot = baseRot + (delta / halfWidth) * 360;
      apply();
    });
    const stop = () => { dragging = false; };
    wrap.addEventListener('pointerup',     stop);
    wrap.addEventListener('pointercancel', stop);
    wrap.addEventListener('pointerleave',  stop);

    // Keyboard rotation
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { curRot -= 30; apply(); }
      if (e.key === 'ArrowRight') { curRot += 30; apply(); }
    });

    // Hotspots
    let openIdx = null;
    function closeTip() {
      if (tipsHost) tipsHost.innerHTML = '';
      openIdx = null;
    }
    function showTip(idx, anchorEl) {
      if (!tipsHost) return;
      const rect = anchorEl.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const left = ((rect.left - wrapRect.left) + rect.width / 2);
      const top  = ((rect.top - wrapRect.top) + rect.height / 2);
      tipsHost.style.cssText += `; --tip-x: ${left}px; --tip-y: ${top}px;`;
      const data = HOTSPOTS[idx];
      tipsHost.innerHTML = `
        <div style="position:absolute; left:${left}px; top:${top + 14}px; transform:translateX(-50%);">
          <p>${data.label}</p>
          <p>${data.detail}</p>
        </div>`;
      openIdx = idx;
    }
    $$('.vc-hotspot').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (openIdx === i) { closeTip(); return; }
        showTip(i, btn);
      });
    });
    wrap.addEventListener('click', () => { if (openIdx !== null) closeTip(); });
  })();

  /* ── 5. ATELIER STICKY-SCROLL (per-stage scrub) ──────────────── */
  (function atelierScroll() {
    const section = $('#atelier');
    if (!section) return;
    const imgs = $$('.vc-atelier__img');
    const stages = $$('.vc-atelier__stage');

    function updateStage() {
      const rect = section.getBoundingClientRect();
      const h = rect.height - window.innerHeight;
      if (h <= 0) return;
      let p = (0 - rect.top) / h;
      p = Math.max(0, Math.min(0.9999, p));
      const stageIdx = Math.min(3, Math.floor(p * 4));

      imgs.forEach((im, i) => im.classList.toggle('is-on', i === stageIdx));
      stages.forEach((st, i) => st.classList.toggle('is-on', i === stageIdx));
    }

    updateStage();
    window.addEventListener('scroll', updateStage, { passive: true });
    window.addEventListener('resize', updateStage);
  })();

  /* ── 6. COUTURE VARIANT SELECTION ────────────────────────────── */
  (function couture() {
    const VARIANTS = {
      'steel':     { name: 'Steel',     metal: 'Grade 5 Titanium', priceCHF: 84000 },
      'rose-gold': { name: 'Rose Gold', metal: '18k Rose Gold',    priceCHF: 96000 },
      'platinum':  { name: 'Platinum',  metal: '950 Platinum',     priceCHF: 112000 },
      'blacked':   { name: 'Blacked',   metal: 'DLC-Coated Steel', priceCHF: 88000 }
    };
    let active = 'steel';

    function fmt(n) { return n.toLocaleString('en-US'); }
    function setActive(id) {
      active = id;
      const v = VARIANTS[id];
      const sel = $('#vc-couture-selected');
      const pr  = $('#vc-couture-price');
      const de  = $('#vc-couture-desc');
      if (sel) sel.textContent = `Selected · ${v.name}`;
      if (pr)  pr.textContent = `CHF ${fmt(v.priceCHF)}`;
      if (de)  de.textContent = `${v.metal} · hand-stitched alligator · calibre V-12`;

      $$('.vc-couture__card').forEach(c => {
        const on = c.dataset.variant === id;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-selected', String(on));
        c.tabIndex = on ? 0 : -1;
      });
      $$('.vc-swatch').forEach(s => {
        s.classList.toggle('is-active', s.dataset.variant === id);
      });

      // Bring active card into view inside the track.
      const card = $(`.vc-couture__card[data-variant="${id}"]`);
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    $$('.vc-couture__card').forEach(card => {
      card.addEventListener('click', () => setActive(card.dataset.variant));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(card.dataset.variant); }
      });
    });
    $$('.vc-swatch').forEach(sw => {
      sw.addEventListener('click', () => setActive(sw.dataset.variant));
    });

    // Add-to-acquisition
    const addBtn = $('#vc-couture-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const v = VARIANTS[active];
        window.__vcCart = window.__vcCart || [];
        if (!window.__vcCart.some(i => i.id === active)) {
          window.__vcCart.push({ id: active, name: v.name, priceCHF: v.priceCHF });
        }
        renderCart();
        openCart();
        addBtn.querySelector('span').textContent = 'In acquisition';
        addBtn.setAttribute('disabled', 'true');
      });
    }
  })();

  /* ── 7. CART DRAWER ──────────────────────────────────────────── */
  const FREE_SHIPPING_THRESHOLD = 80000;
  function fmt(n) { return n.toLocaleString('en-US'); }

  function renderCart() {
    const items = window.__vcCart || [];
    const subtotal = items.reduce((s, i) => s + i.priceCHF, 0);
    const fill  = $('#vc-cart-ship-fill');
    const label = $('#vc-cart-ship-label');
    const pct   = $('#vc-cart-ship-pct');
    const subEl = $('#vc-cart-subtotal');
    const list  = $('#vc-cart-items');
    const empty = $('#vc-cart-empty');
    const badge = $('#vc-cart-badge');

    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    if (fill) fill.style.width = `${progress}%`;
    const freeShippingMet = subtotal >= FREE_SHIPPING_THRESHOLD;
    if (label) label.textContent = freeShippingMet
      ? 'Atelier shipping complimentary'
      : `CHF ${fmt(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} to complimentary shipping`;
    if (pct) pct.textContent = `${Math.round(progress)}%`;
    if (subEl) subEl.textContent = `CHF ${fmt(subtotal)}`;
    if (badge) {
      badge.textContent = String(items.length);
      badge.hidden = items.length === 0;
    }

    if (list) {
      if (items.length === 0) {
        list.hidden = true;
        if (empty) empty.hidden = false;
        list.innerHTML = '';
      } else {
        list.hidden = false;
        if (empty) empty.hidden = true;
        list.innerHTML = items.map(i => `
          <li>
            <div>
              <p class="vc-h3 italic" style="font-size:1.125rem">${i.name}</p>
              <p>Calibre V-12 · Edition of 12</p>
            </div>
            <div style="text-align:right">
              <p style="color:var(--bone); margin:0;">CHF ${fmt(i.priceCHF)}</p>
              <button data-remove="${i.id}">Remove</button>
            </div>
          </li>
        `).join('');
        list.querySelectorAll('button[data-remove]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.remove;
            window.__vcCart = (window.__vcCart || []).filter(i => i.id !== id);
            renderCart();
          });
        });
      }
    }
  }

  function openCart() {
    const drawer = $('#vc-cart-drawer');
    const scrim  = $('#vc-cart-scrim');
    if (drawer) { drawer.hidden = false; document.body.style.overflow = 'hidden'; }
    if (scrim)  { scrim.hidden = false; }
  }
  function closeCart() {
    const drawer = $('#vc-cart-drawer');
    const scrim  = $('#vc-cart-scrim');
    if (drawer) drawer.hidden = true;
    if (scrim)  scrim.hidden  = true;
    document.body.style.overflow = '';
  }

  $('#vc-cart-open')?.addEventListener('click', openCart);
  $('#vc-cart-close')?.addEventListener('click', closeCart);
  $('#vc-cart-scrim')?.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  /* ── 8. LOCALE SWITCHER (visual) ─────────────────────────────── */
  $$('.vc-locale__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.vc-locale__btn').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      document.documentElement.dataset.locale = btn.dataset.locale;
    });
  });

  /* ── 9. LIVE CLOCKS ──────────────────────────────────────────── */
  function tickClocks() {
    $$('.vc-clock').forEach((el) => {
      const tz = el.dataset.tz;
      if (!tz) return;
      el.textContent = new Date().toLocaleTimeString('en-GB', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
    });
  }
  tickClocks();
  setInterval(tickClocks, 1000);

  /* ── 10. FOOTER YEAR ─────────────────────────────────────────── */
  const yr = $('#vc-copy-year');
  if (yr) {
    yr.textContent = `© ${new Date().getFullYear()} VOLTIER & CIE.`;
  }

  /* ── Initial render ─────────────────────────────────────────── */
  renderCart();
})();
