/* =========================================================
   Pro Façade Rénovation — motion design
   GSAP 3.12.5 + ScrollTrigger (cdnjs). Seules transform / opacity
   sont animées. prefers-reduced-motion : tout est affiché, rien ne bouge.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = reduceMQ.matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduce;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const releaseIntro = () => root.classList.remove('intro-pending');
  if (!motion) releaseIntro();
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------------------------------------------------------
     En-tête : fond au scroll, masquage, niveau à bulle, menu
     --------------------------------------------------------- */
  const header = $('[data-header]');
  const bubble = $('[data-level-bubble]');
  const toggle = $('.nav-toggle');
  const menu = $('#menu-principal');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = menu.classList.contains('is-open');
    if (!menuOpen && y > 600 && y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 600) header.classList.remove('is-hidden');
    lastY = y;
    if (bubble) bubble.style.transform = `translateX(${((y / max) - 0.5) * 2 * 26}px)`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Fermer' : 'Menu';
    menu.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
  });

  /* ---------------------------------------------------------
     1. HERO — révélation au « coup de taloche »
     Chaque ligne est dans un masque à bord courbe qui pivote
     autour d'un point situé sous le texte (geste en arc), tandis
     que le texte contre-pivote pour rester immobile.
     --------------------------------------------------------- */
  function heroIntro() {
    const lines = $$('.hero-line');
    const fades = $$('[data-hero-fade]');
    const panneau = $('[data-panneau]');
    const swipe = $('[data-hero-swipe]');
    const START = -58;

    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.inOut' } });

    gsap.set(fades, { opacity: 0, y: 26 });
    gsap.set(panneau, { opacity: 0, y: -50, rotation: -12 });
    gsap.set(swipe, { scaleX: 0, opacity: 0 });

    lines.forEach((line, i) => {
      const sweep = $('.sweep', line);
      const inner = $('.sweep-in', line);
      const tool = $('.taloche', line);
      const w = sweep.offsetWidth;
      const h = sweep.offsetHeight;
      // pivot (coordonnées locales du masque) : bas-gauche, loin sous la ligne
      const px = w * 0.1;
      const py = h + w * 0.9;
      const ix = inner.offsetLeft - sweep.offsetLeft;
      const iy = inner.offsetTop - sweep.offsetTop;

      // la taloche se cale sur le bord d'attaque (bord droit, courbe)
      const tw = tool.offsetWidth;
      tool.style.left = `${sweep.offsetLeft + w - tw * 0.7}px`;
      const tx = tool.offsetLeft;
      const ty = tool.offsetTop;
      const pivotX = sweep.offsetLeft + px;
      const pivotY = sweep.offsetTop + py;

      gsap.set(sweep, { transformOrigin: `${px}px ${py}px`, rotation: START });
      gsap.set(inner, { transformOrigin: `${px - ix}px ${py - iy}px`, rotation: -START });
      gsap.set(tool, { transformOrigin: `${pivotX - tx}px ${pivotY - ty}px`, rotation: START - 4, opacity: 0 });

      const at = i * 0.28;
      tl.to(sweep, { rotation: 0, duration: 1.25 }, at)
        .to(inner, { rotation: 0, duration: 1.25 }, at)
        .to(tool, { rotation: 0, duration: 1.25 }, at)
        .to(tool, { opacity: 1, duration: 0.25, ease: 'none' }, at)
        .to(tool, { opacity: 0, y: -18, x: 14, duration: 0.45, ease: 'power2.out' }, at + 1.12);
    });

    tl.to(swipe, { scaleX: 1, opacity: 0.95, duration: 1.3, ease: 'expo.out' }, 0.9)
      .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 1.1)
      .to(panneau, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.25)
      .to(panneau, { rotation: 0, duration: 1.8, ease: 'elastic.out(1, 0.32)' }, 1.25)
      .add(() => {
        gsap.set($$('.hero-line .sweep, .hero-line .sweep-in'), { clearProps: 'transform' });
        heroSway(panneau);
      });

    releaseIntro();

    // parallaxe légère du geste d'enduit en fond
    gsap.to(swipe, {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  function heroSway(panneau) {
    if (!finePointer || !panneau) return;
    const hero = $('.hero');
    const rot = gsap.quickTo(panneau, 'rotation', { duration: 1.2, ease: 'power3.out' });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      rot(((e.clientX - r.left) / r.width - 0.5) * 5);
    });
    hero.addEventListener('pointerleave', () => rot(0));
  }

  /* ---------------------------------------------------------
     Reveals génériques + texte mot à mot
     --------------------------------------------------------- */
  function reveals() {
    const els = $$('[data-reveal]');
    gsap.set(els, { opacity: 0, y: 40, rotation: 0.6 });
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, rotation: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
        onStart() { batch.forEach((el) => { el.style.transition = 'none'; }); },
        onComplete() { gsap.set(batch, { clearProps: 'transform,opacity,transition' }); }
      })
    });

    $$('[data-words]').forEach((el) => {
      const parts = el.textContent.trim().split(/([ \t\n\r]+)/);
      el.textContent = '';
      parts.forEach((p) => {
        if (/^[ \t\n\r]+$/.test(p)) { el.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = p;
        el.appendChild(s);
      });
      gsap.fromTo($$('.w', el), { opacity: 0.14 }, {
        opacity: 1, ease: 'none', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: 0.6 }
      });
    });
  }

  /* ---------------------------------------------------------
     2. NUANCIER — textures d'enduit générées (carte de hauteur
     + éclairage rasant), qui se « posent » au scroll / survol
     --------------------------------------------------------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function heightMap(type, w, h, R) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const s = w / 420;
    const N = (w / s) * (h / s); // densités indépendantes de la résolution
    const TAU = Math.PI * 2;
    g.fillStyle = '#808080';
    g.fillRect(0, 0, w, h);

    const dots = (n, rMin, rMax, darkRatio, aDark, aLight) => {
      for (let i = 0; i < n; i++) {
        const dark = R() < darkRatio;
        g.fillStyle = dark ? `rgba(0,0,0,${aDark})` : `rgba(255,255,255,${aLight})`;
        g.beginPath();
        g.arc(R() * w, R() * h, (rMin + R() * (rMax - rMin)) * s, 0, TAU);
        g.fill();
      }
    };

    if (type === 'gratte') {
      dots(N * 0.11, 0.5, 1.5, 0.55, 0.42, 0.38);
      dots(N * 0.005, 1.4, 2.8, 1, 0.5, 0); // grains arrachés
    } else if (type === 'taloche') {
      dots(N * 0.035, 0.5, 1.1, 0.5, 0.25, 0.25);
      g.lineCap = 'round';
      const n = N / 650;
      for (let i = 0; i < n; i++) {
        const cx = R() * w * 1.1 - w * 0.05;
        const cy = R() * h * 1.1 - h * 0.05;
        const r = (14 + R() * 48) * s;
        const a0 = R() * TAU;
        const a1 = a0 + (0.5 + R() * 1.2) * Math.PI;
        const lw = (0.8 + R() * 2.2) * s;
        g.lineWidth = lw;
        g.strokeStyle = 'rgba(255,255,255,.11)';
        g.beginPath(); g.arc(cx, cy, r, a0, a1); g.stroke();
        g.strokeStyle = 'rgba(0,0,0,.08)';
        g.beginPath(); g.arc(cx, cy, r + lw, a0, a1); g.stroke();
      }
    } else if (type === 'ecrase') {
      dots(N * 0.07, 0.5, 1.5, 0.55, 0.4, 0.32);
      const n = N / 1300;
      for (let i = 0; i < n; i++) {
        const cx = R() * w, cy = R() * h;
        const rad = (8 + R() * 26) * s;
        const k = 10 + ((R() * 5) | 0);
        const v = 175 + ((R() * 30) | 0);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.beginPath();
        for (let j = 0; j < k; j++) {
          const a = (j / k) * TAU + R() * 0.3;
          const rr = rad * (0.55 + R() * 0.5);
          const x = cx + Math.cos(a) * rr * 1.25;
          const y = cy + Math.sin(a) * rr * 0.9;
          if (j === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
        g.fill();
      }
      dots(N * 0.015, 0.4, 1, 0.5, 0.15, 0.15);
    } else if (type === 'ribbe') {
      dots(N * 0.05, 0.5, 1.4, 0.5, 0.33, 0.33);
      g.lineCap = 'round';
      const n = N / 240;
      for (let i = 0; i < n; i++) {
        const x = R() * w, y = R() * h;
        const ang = R() * TAU;
        const len = (6 + R() * 20) * s;
        const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
        const bend = (R() - 0.5) * len * 0.8;
        const qx = (x + ex) / 2 - Math.sin(ang) * bend;
        const qy = (y + ey) / 2 + Math.cos(ang) * bend;
        const lw = (1.2 + R() * 1.8) * s;
        g.lineWidth = lw;
        g.strokeStyle = 'rgba(0,0,0,.5)';
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(qx, qy, ex, ey); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.7)';
        g.beginPath(); g.arc(ex, ey, lw * 0.9, 0, TAU); g.fill();
      }
    }
    return g.getImageData(0, 0, w, h).data;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function renderTexture(canvas, type, tone, seed) {
    const cw = canvas.clientWidth || 320;
    const w = Math.round(clamp(cw * Math.min(window.devicePixelRatio || 1, 1.5), 240, 640));
    const h = Math.round(w * 0.75);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const R = rng(seed);
    const src = heightMap(type, w, h, R);
    const n = w * h;
    const H0 = new Float32Array(n);
    for (let i = 0; i < n; i++) H0[i] = src[i * 4] / 255 + (R() - 0.5) * 0.05;

    // flou 3x3 séparable, mélangé au relief brut (garde le piquant du grain)
    const tmp = new Float32Array(n);
    const H = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      const o = y * w;
      for (let x = 0; x < w; x++) {
        const a = H0[o + Math.max(0, x - 1)], b = H0[o + x], c = H0[o + Math.min(w - 1, x + 1)];
        tmp[o + x] = (a + b + c) / 3;
      }
    }
    const sharp = type === 'gratte' ? 0.5 : 0.3;
    for (let y = 0; y < h; y++) {
      const ym = Math.max(0, y - 1) * w, yp = Math.min(h - 1, y + 1) * w, o = y * w;
      for (let x = 0; x < w; x++) {
        const bl = (tmp[ym + x] + tmp[o + x] + tmp[yp + x]) / 3;
        H[o + x] = bl * (1 - sharp) + H0[o + x] * sharp;
      }
    }

    // variations de teinte à basse fréquence (nuances naturelles de l'enduit)
    const cell = 56;
    const gx = Math.ceil(w / cell) + 2, gy = Math.ceil(h / cell) + 2;
    const grid = new Float32Array(gx * gy);
    for (let i = 0; i < grid.length; i++) grid[i] = R() - 0.5;

    const out = ctx.createImageData(w, h);
    const d = out.data;
    const [tr, tg, tb] = hexToRgb(tone);
    const k = type === 'ecrase' ? 2.2 : type === 'taloche' ? 3.2 : 2.6;
    const lx = 0.62, ly = 0.62;
    for (let y = 0; y < h; y++) {
      const fy = y / cell, iy = fy | 0, ty = fy - iy;
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const xm = x > 0 ? i - 1 : i, xp = x < w - 1 ? i + 1 : i;
        const ym = y > 0 ? i - w : i, yp = y < h - 1 ? i + w : i;
        const dx = H[xp] - H[xm], dy = H[yp] - H[ym];
        const light = 1 + (dx * lx + dy * ly) * k;
        const ao = (H[i] - 0.5) * 0.32;
        const shade = clamp(light + ao, 0.52, 1.38);
        const fx = x / cell, ix = fx | 0, txx = fx - ix;
        const g00 = grid[iy * gx + ix], g10 = grid[iy * gx + ix + 1];
        const g01 = grid[(iy + 1) * gx + ix], g11 = grid[(iy + 1) * gx + ix + 1];
        const alb = 1 + lerp(lerp(g00, g10, txx), lerp(g01, g11, txx), ty) * 0.12;
        const m = shade * alb;
        const p = i * 4;
        d[p] = clamp(tr * m, 0, 255);
        d[p + 1] = clamp(tg * m, 0, 255);
        d[p + 2] = clamp(tb * m, 0, 255);
        d[p + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  }

  function nuancier() {
    const cards = $$('[data-swatch]');
    // génération étalée pour ne pas bloquer le fil principal
    cards.forEach((card, i) => {
      const run = () => renderTexture($('canvas', card), card.dataset.swatch, card.dataset.tone, 1337 + i * 97);
      setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(run, { timeout: 600 }) : run()), 60 + i * 50);
    });

    if (!motion) return;

    cards.forEach((card) => {
      const tex = $('.swatch-tex', card);
      const cv = $('canvas', card);
      const light = $('.swatch-light', card);
      const tool = $('.swatch-tool', card);
      let busy = false;

      const pass = (strong) => {
        const tw = tex.offsetWidth, th = tex.offsetHeight;
        const t = gsap.timeline({ onComplete: () => { busy = false; } });
        t.fromTo(tool,
          { x: -tw * 0.45, y: th * 0.72, rotation: -14, opacity: 0 },
          { x: tw * 1.05, y: th * 0.12, rotation: 8, duration: strong ? 1.05 : 0.8, ease: 'power2.inOut' }, 0)
          .to(tool, { opacity: 1, duration: 0.18, ease: 'none' }, 0)
          .to(tool, { opacity: 0, duration: 0.25 }, strong ? 0.8 : 0.58)
          .fromTo(light, { xPercent: -70, opacity: 0 }, { xPercent: 70, opacity: 1, duration: 0.9, ease: 'power2.inOut' }, 0.05)
          .to(light, { opacity: 0, duration: 0.3 }, 0.7);
        return t;
      };

      gsap.set(cv, { opacity: 0, scale: 1.35, rotation: -7, xPercent: -14, transformOrigin: '20% 80%' });

      ScrollTrigger.create({
        trigger: card,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          busy = true;
          gsap.to(cv, { opacity: 1, scale: 1, rotation: 0, xPercent: 0, duration: 1.15, ease: 'expo.out', delay: 0.05 });
          pass(true);
        }
      });

      const press = () => {
        if (busy) return;
        busy = true;
        gsap.fromTo(cv, { scale: 1.07, rotation: -1.2 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(2.2)' });
        pass(false);
      };
      card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') press(); });
      card.addEventListener('focus', press);
    });
  }

  /* ---------------------------------------------------------
     3. SPLIT INTÉRIEUR / EXTÉRIEUR — bascule au scroll
     Le panneau « dehors » est dans un masque translaté + incliné ;
     son contenu reçoit la transformation inverse (même origine)
     pour rester immobile pendant que la frontière bascule.
     --------------------------------------------------------- */
  function split() {
    const sec = $('[data-split]');
    if (!sec) return;
    const mask = $('[data-split-mask]', sec);
    const ext = $('[data-split-ext]', sec);
    const extC = $('[data-split-extc]', sec);
    const intC = $('[data-split-int]', sec);
    const joint = $('[data-split-joint]', sec);
    const badge = $('[data-split-badge]', sec);
    const hint = $('[data-split-hint]', sec);
    const words = $$('.split-bigword', sec);
    const D2R = Math.PI / 180;

    const mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, (ctx) => {
      const axis = ctx.conditions.desk ? 'x' : 'y';
      sec.classList.add('is-live');
      sec.dataset.axis = axis;
      let W = 0, H = 0;
      const proxy = { p: 0 };

      const measure = () => {
        W = sec.clientWidth; H = sec.clientHeight;
        if (axis === 'x') {
          mask.style.transformOrigin = `${1.5 * W}px ${H / 2}px`;
          ext.style.transformOrigin = `${W}px ${H / 2}px`;
        } else {
          mask.style.transformOrigin = `${W / 2}px ${1.5 * H}px`;
          ext.style.transformOrigin = `${W / 2}px ${H}px`;
        }
      };

      const render = (p) => {
        const e = smooth(0.08, 0.92, p);
        const size = axis === 'x' ? W : H;
        const d = lerp(0.7, 0.3, e) * size;
        const a = axis === 'x' ? lerp(-9, 9, e) : lerp(-5, 5, e);
        // chaque contenu reste lisible tant que sa moitié est dominante
        const extO = 1 - 0.75 * smooth(0.55, 0.95, e);
        const intO = 0.25 + 0.75 * smooth(0.05, 0.45, e);
        if (axis === 'x') {
          mask.style.transform = `translateX(${d - W}px) skewX(${a}deg)`;
          ext.style.transform = `skewX(${-a}deg) translateX(${W - d}px)`;
          joint.style.transform = `translateX(${d}px) skewX(${a}deg)`;
          badge.style.transform = `translate(${d}px, ${H / 2}px) rotate(${e * 180}deg)`;
          extC.style.transform = `translate(${-e * 50}px, -50%)`;
          intC.style.transform = `translate(${(1 - e) * 50}px, -50%)`;
        } else {
          mask.style.transform = `translateY(${d - H}px) skewY(${a}deg)`;
          ext.style.transform = `skewY(${-a}deg) translateY(${H - d}px)`;
          joint.style.transform = `translateY(${d}px) skewY(${a}deg)`;
          const bx = W * 0.84;
          badge.style.transform = `translate(${bx}px, ${d + Math.tan(a * D2R) * (bx - W / 2)}px) rotate(${90 + e * 180}deg)`;
          extC.style.transform = `translateY(${-e * 30}px)`;
          intC.style.transform = `translateY(${(1 - e) * 30}px)`;
        }
        extC.style.opacity = extO.toFixed(3);
        intC.style.opacity = intO.toFixed(3);
        if (words[0]) words[0].style.transform = `translateX(${(1 - e) * 8}%)`;
        if (words[1]) words[1].style.transform = `translateX(${-e * 8}%)`;
        if (hint) hint.style.opacity = (1 - smooth(0.0, 0.25, p)).toFixed(3);
      };

      measure();
      render(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: () => `+=${Math.round(H * (axis === 'x' ? 1.6 : 1.4))}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onRefresh: () => { measure(); render(proxy.p); }
        }
      });
      tl.to(proxy, { p: 1, ease: 'none', duration: 1, onUpdate: () => render(proxy.p) });

      return () => {
        sec.classList.remove('is-live');
        delete sec.dataset.axis;
        [mask, ext, joint, badge, extC, intC, hint, ...words].forEach((el) => {
          if (el) { el.style.transform = ''; el.style.transformOrigin = ''; el.style.opacity = ''; }
        });
      };
    });
  }

  /* ---------------------------------------------------------
     4. ESTIMATION — surface indicative (aucun tarif)
     --------------------------------------------------------- */
  function estimation() {
    const form = $('[data-calc]');
    if (!form) return;
    const el = (n) => form.elements[n];
    const odo = $('[data-odo]');
    const live = $('[data-odo-live]');
    const detail = $('[data-calc-detail]');
    const wall = $('[data-calc-wall]');
    const cta = $('[data-calc-cta]');
    const DIGITS = 4;
    const NS = 'http://www.w3.org/2000/svg';

    // compteur à rouleaux (translateY uniquement)
    const strips = [];
    for (let i = 0; i < DIGITS; i++) {
      const dg = document.createElement('span');
      dg.className = 'odo-digit';
      const strip = document.createElement('span');
      strip.className = 'odo-strip';
      for (let n = 0; n <= 9; n++) {
        const s = document.createElement('span');
        s.textContent = n;
        strip.appendChild(s);
      }
      dg.appendChild(strip);
      odo.appendChild(dg);
      strips.push({ dg, strip });
    }
    const setOdo = (v) => {
      const str = String(clamp(v, 0, 9999)).padStart(DIGITS, '0');
      const len = String(clamp(v, 0, 9999)).length;
      strips.forEach(({ dg, strip }, i) => {
        strip.style.transform = `translateY(${-Number(str[i]) * 10}%)`;
        dg.classList.toggle('is-lead', i < DIGITS - len);
      });
    };

    const fmt = (v) => String(v).replace('.', ',');
    const svgEl = (tag, attrs) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      return n;
    };

    function drawWall(L, Hm, F, O) {
      while (wall.firstChild) wall.removeChild(wall.firstChild);
      const ground = 240;
      const k = Math.min(330 / L, 196 / Hm, 30);
      const ww = L * k, wh = Hm * k;
      const x0 = (420 - ww) / 2 - 14;
      const y0 = ground - wh;
      // façades supplémentaires, en retrait
      for (let f = F - 1; f >= 1; f--) {
        wall.appendChild(svgEl('rect', { x: x0 + f * 10, y: y0 - f * 8, width: ww, height: wh, rx: 2, fill: '#C9AE84', opacity: 0.22 + 0.08 * (3 - f) }));
      }
      wall.appendChild(svgEl('rect', { x: x0, y: y0, width: ww, height: wh, rx: 2, fill: '#DCC6A3' }));
      wall.appendChild(svgEl('rect', { x: x0, y: y0, width: ww, height: Math.min(8, wh * 0.06), fill: '#B4532E' }));
      // ouvertures (1,2 m × 1,4 m environ chacune)
      const nWin = Math.round((L * Hm * O) / 100 / (1.2 * 1.4));
      const floors = Math.max(1, Math.floor(Hm / 2.8));
      const perFloor = Math.min(Math.max(1, Math.floor(L / 2)), Math.ceil(nWin / floors) || 0);
      let placed = 0;
      const winW = 1.2 * k, winH = 1.4 * k;
      for (let fl = 0; fl < floors && placed < nWin; fl++) {
        const cy = ground - (fl + 0.5) * (wh / floors);
        for (let c = 0; c < perFloor && placed < nWin; c++) {
          const cx = x0 + ((c + 0.5) * ww) / perFloor;
          wall.appendChild(svgEl('rect', { x: cx - winW / 2, y: cy - winH / 2, width: winW, height: winH, rx: 1.5, fill: 'url(#hatch)' }));
          placed++;
        }
      }
      // cotes
      const dim = { stroke: '#F2C2A5', 'stroke-width': 1.5, fill: 'none' };
      wall.appendChild(svgEl('path', { d: `M${x0} ${ground + 10}h${ww}M${x0} ${ground + 5}v10M${x0 + ww} ${ground + 5}v10`, ...dim }));
      wall.appendChild(svgEl('path', { d: `M${x0 + ww + 12} ${y0}v${wh}M${x0 + ww + 7} ${y0}h10M${x0 + ww + 7} ${ground}h10`, ...dim }));
      const lab = (x, y, txt, anchor) => {
        const t = svgEl('text', { x, y, fill: '#F2C2A5', 'font-size': 12, 'font-family': 'JetBrains Mono, monospace', 'font-weight': 700, 'text-anchor': anchor });
        t.textContent = txt;
        wall.appendChild(t);
      };
      const labelY = Math.min(256, ground + 16);
      const tb = svgEl('rect', { x: x0 + ww / 2 - 26, y: labelY - 10, width: 52, height: 14, rx: 4, fill: '#2A211C' });
      wall.appendChild(tb);
      lab(x0 + ww / 2, labelY + 1, `${fmt(L)} m`, 'middle');
      lab(Math.min(x0 + ww + 18, 418), y0 + wh / 2 + 4, `${fmt(Hm)} m`, 'start');
      // silhouette 1,75 m pour l'échelle
      const ph = 1.75 * k, px = Math.max(8, x0 - 22);
      const g = svgEl('g', { fill: '#F3EEE6', opacity: 0.85 });
      g.appendChild(svgEl('circle', { cx: px, cy: ground - ph + ph * 0.09, r: ph * 0.09 }));
      g.appendChild(svgEl('rect', { x: px - ph * 0.11, y: ground - ph * 0.8, width: ph * 0.22, height: ph * 0.42, rx: ph * 0.06 }));
      g.appendChild(svgEl('rect', { x: px - ph * 0.09, y: ground - ph * 0.42, width: ph * 0.07, height: ph * 0.42, rx: ph * 0.03 }));
      g.appendChild(svgEl('rect', { x: px + ph * 0.02, y: ground - ph * 0.42, width: ph * 0.07, height: ph * 0.42, rx: ph * 0.03 }));
      wall.appendChild(g);
    }

    let lastPop = 0;
    function update() {
      const L = Number(el('largeur').value);
      const Hm = Number(el('hauteur').value);
      const F = Number(el('faces').value);
      const O = Number(el('ouvertures').value);
      const surface = Math.round(L * Hm * F * (1 - O / 100));
      ['largeur', 'hauteur', 'faces', 'ouvertures'].forEach((n) => {
        const inp = el(n);
        const pct = ((inp.value - inp.min) / (inp.max - inp.min)) * 100;
        inp.style.setProperty('--p', `${pct}%`);
      });
      $('[data-out="largeur"]', form).textContent = `${fmt(L)} m`;
      $('[data-out="hauteur"]', form).textContent = `${fmt(Hm)} m`;
      $('[data-out="faces"]', form).textContent = String(F);
      $('[data-out="ouvertures"]', form).textContent = `${O} %`;
      setOdo(surface);
      live.textContent = `Surface estimée : ${surface} m²`;
      detail.textContent = `${fmt(L)} m × ${fmt(Hm)} m × ${F} façade${F > 1 ? 's' : ''}, moins ${O} % d'ouvertures`;
      drawWall(L, Hm, F, O);
      if (motion && performance.now() - lastPop > 180) {
        lastPop = performance.now();
        gsap.fromTo(wall, { scaleY: 0.97, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, ease: 'back.out(3)' });
      }
      return { L, Hm, F, O, surface };
    }

    form.addEventListener('input', update);
    update();

    // « Envoyer ces mesures » : pré-remplit le formulaire de contact
    cta.addEventListener('click', () => {
      const { L, Hm, F, O, surface } = update();
      const type = (form.querySelector('input[name="type"]:checked') || {}).value || '';
      const msg = $('#f-msg');
      msg.value = `${type} — surface estimée ≈ ${surface} m² (${fmt(L)} m × ${fmt(Hm)} m × ${F} façade${F > 1 ? 's' : ''}, ${O} % d'ouvertures déduites).\n`;
      $$('.chips input').forEach((c) => { if (c.value === type || (type === 'Ravalement de façade' && c.value === 'Ravalement')) c.checked = true; });
    });
  }

  /* ---------------------------------------------------------
     Formulaire de contact (démonstration, non relié)
     --------------------------------------------------------- */
  function contactForm() {
    const form = $('[data-contact-form]');
    if (!form) return;
    const status = $('[data-form-status]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nom = form.elements.nom;
      const mail = form.elements.email;
      const okNom = nom.value.trim().length > 1;
      const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim());
      nom.setAttribute('aria-invalid', String(!okNom));
      mail.setAttribute('aria-invalid', String(!okMail));
      status.classList.remove('is-ok', 'is-error');
      if (!okNom || !okMail) {
        status.classList.add('is-error');
        status.textContent = !okNom ? 'Merci d\'indiquer votre nom.' : 'Merci d\'indiquer une adresse e-mail valide.';
        (!okNom ? nom : mail).focus();
        return;
      }
      status.classList.add('is-ok');
      status.textContent = 'Merci ! (Maquette : ce formulaire n\'est pas encore relié — adresse de réception [à compléter].)';
      if (motion) gsap.fromTo(status, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    });
  }

  /* ---------------------------------------------------------
     Micro-interactions : boutons magnétiques
     --------------------------------------------------------- */
  function magnetic() {
    if (!finePointer) return;
    $$('[data-magnetic]').forEach((btn) => {
      const label = btn.firstElementChild;
      const bx = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' });
      const by = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' });
      const lx = label ? gsap.quickTo(label, 'x', { duration: 0.45, ease: 'power3.out' }) : null;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        bx(dx * 0.22); by(dy * 0.32);
        if (lx) lx(dx * 0.08);
      });
      btn.addEventListener('pointerleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: true });
        if (label) gsap.to(label, { x: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: true });
      });
    });
  }

  /* ---------------------------------------------------------
     5. FOOTER — la truelle suit (un peu) le curseur
     --------------------------------------------------------- */
  function truelle() {
    const stage = $('.truelle-stage');
    const tr = $('[data-truelle]');
    const sh = $('[data-truelle-shadow]');
    if (!stage || !tr) return;
    let visible = false, raf = 0;
    let tx = 0, ty = 0, tr0 = 0, cx = 0, cy = 0, cr = 0, hasPointer = false;
    const t0 = performance.now();

    window.addEventListener('pointermove', (e) => {
      if (!visible || e.pointerType === 'touch') return;
      hasPointer = true;
      const r = stage.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      tx = clamp(dx * 0.1, -70, 70);
      ty = clamp(dy * 0.12, -34, 34);
      tr0 = clamp(Math.atan2(dy, Math.abs(dx) + 260) * 57.3 * 0.9, -22, 22);
    }, { passive: true });

    const loop = (now) => {
      const t = (now - t0) / 1000;
      const idle = hasPointer ? 0.35 : 1;
      const fx = tx + Math.sin(t * 0.9) * 6 * idle;
      const fy = ty + Math.sin(t * 1.3) * 5 * idle;
      const vx = fx - cx;
      cx += vx * 0.075;
      cy += (fy - cy) * 0.075;
      cr += ((tr0 + clamp(vx * 0.35, -10, 10) + Math.sin(t * 1.1) * 2 * idle) - cr) * 0.08;
      tr.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) rotate(${cr.toFixed(2)}deg)`;
      if (sh) {
        sh.style.transform = `translateX(${(cx * 0.8).toFixed(2)}px) scale(${(1 - cy / 160).toFixed(3)})`;
        sh.style.opacity = clamp(0.9 - cy / 90, 0.3, 1).toFixed(3);
      }
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }, { rootMargin: '100px' }).observe(stage);
  }

  /* ---------------------------------------------------------
     Démarrage
     --------------------------------------------------------- */
  estimation();
  contactForm();
  nuancier();

  if (!motion) return;

  const start = () => {
    heroIntro();
    reveals();
    split();
    magnetic();
    truelle();
    ScrollTrigger.refresh();
  };
  // attendre les polices pour mesurer correctement les lignes du titre
  let started = false;
  const go = () => { if (!started) { started = true; start(); } };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(go);
    setTimeout(go, 2500);
  } else {
    go();
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
