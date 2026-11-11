/* Conseil Rénov Habitat — interactions & motion design
   GSAP 3.12.5 + ScrollTrigger (cdnjs). Sans GSAP ou en mouvement réduit,
   le site reste entièrement lisible (états finaux affichés). */
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;
  root.classList.add(motion ? 'motion' : 'static');

  /* ---------- commun : en-tête, menu, formulaire ---------- */
  const header = $('#header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('.nav-toggle');
  const nav = $('#nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      $('.sr-only', toggle).textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = $('.form__status', form);
      const name = $('#f-name', form);
      const contact = $('#f-contact', form);
      if (!name.value.trim() || !contact.value.trim()) {
        status.classList.add('is-error');
        status.textContent = 'Merci d\'indiquer votre nom et un moyen de vous recontacter.';
        (name.value.trim() ? contact : name).focus();
        return;
      }
      status.classList.remove('is-error');
      status.textContent = 'Merci ! (Démonstration : ce formulaire n\'est pas encore relié à une messagerie.)';
      form.reset();
    });
  }

  /* ---------- cartes matériaux (retournement) ---------- */
  $$('.mat').forEach((card) => {
    const btn = $('.mat__btn', card);
    btn.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      btn.setAttribute('aria-pressed', String(flipped));
    });
  });

  /* ---------- accordéon conseil ---------- */
  const accBtns = $$('.acc__btn');
  const openAcc = (btn, animate) => {
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    accBtns.forEach((b) => {
      const panel = document.getElementById(b.getAttribute('aria-controls'));
      const stayOpen = b === btn && !wasOpen;
      b.setAttribute('aria-expanded', String(stayOpen));
      panel.hidden = !stayOpen;
      b.closest('.acc__item').classList.toggle('is-open', stayOpen);
      if (stayOpen && animate && motion) {
        gsap.fromTo($$('.acc__body > *', panel), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
      }
    });
  };
  accBtns.forEach((b, i) => {
    const panel = document.getElementById(b.getAttribute('aria-controls'));
    panel.hidden = i !== 0;
    b.addEventListener('click', () => openAcc(b, true));
  });

  /* ---------- vue thermique : bascule avant/après (mode statique) ---------- */
  const thermo = $('#thermo');
  $$('.thermo__toggle button').forEach((b) => {
    b.addEventListener('click', () => {
      thermo.dataset.state = b.dataset.set;
      $$('.thermo__toggle button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    });
  });

  /* ---------- étapes de la coupe (boutons) ---------- */
  const chips = $$('.coupe__chips .chip');
  const descs = $$('.coupe__desc');
  let coupeST = null;
  let coupeTimes = [0, 1.5, 3, 4.5];
  let coupeDur = 6;
  const setStep = (idx) => {
    chips.forEach((c, i) => { c.classList.toggle('is-active', i === idx); c.setAttribute('aria-pressed', String(i === idx)); });
    descs.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  };
  chips.forEach((c, i) => c.addEventListener('click', () => {
    if (coupeST) {
      const t = Math.min(coupeDur, coupeTimes[i] + 1.3) / coupeDur;
      window.scrollTo({ top: coupeST.start + t * (coupeST.end - coupeST.start), behavior: 'smooth' });
    } else {
      setStep(i);
      descs[i].scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }));
  setStep(0);

  if (!motion) return;

  /* =====================================================
     MOTION (GSAP)
     ===================================================== */
  gsap.registerPlugin(ScrollTrigger);
  thermo.dataset.state = 'motion';

  /* ---------- 0. intro du hero ---------- */
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro.from('.hero__title .line__in', { yPercent: 110, duration: 1.1, stagger: .12 })
       .from('.hero .eyebrow', { opacity: 0, y: 12, duration: .7 }, 0)
       .from('[data-hero-fade]', { opacity: 0, y: 18, duration: .8, stagger: .08 }, .35)
       .from('.thermo', { opacity: 0, y: 40, scale: .96, duration: 1.2 }, .15);

  /* ---------- 1. HERO : la maison « refroidit » au scroll ---------- */
  const q = (s) => $$(s, thermo);
  const tiles = q('.th-tile');
  const caps = q('.thermo__cap');
  gsap.set(q('.is-after, .th-envelope, .th-roof-cool, .th-win-cool'), { opacity: 0 });
  gsap.set(q('.is-before, .th-hot, .th-waves, .th-roof-hot, .th-win-hot'), { opacity: 1 });
  gsap.set(tiles, { scale: 0, opacity: 0, transformOrigin: '50% 100%' });
  gsap.set(q('.th-rail'), { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set(caps, { opacity: 0 });
  gsap.set(caps[0], { opacity: 1 });
  gsap.set('.aura--hot', { opacity: 1 });
  gsap.set('.aura--cold', { opacity: 0 });

  // ondes de chaleur en boucle (indépendantes du scroll)
  q('.wv').forEach((w, i) => {
    const dir = w.classList.contains('wv--up') ? { y: -16 } : w.classList.contains('wv--left') ? { x: -14 } : { x: 14 };
    gsap.timeline({ repeat: -1, delay: i * .23 })
      .fromTo(w, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: .5, ease: 'sine.out' })
      .to(w, { ...dir, duration: 1.4, ease: 'sine.inOut' }, 0)
      .to(w, { opacity: 0, duration: .5, ease: 'sine.in' }, .9);
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'none' } });
  heroTl
    .to(q('.thermo__mk'), { xPercent: 100, duration: 5.4 }, .6)
    .to('.aura--hot', { opacity: 0, duration: 4 }, 1.4)
    .to('.aura--cold', { opacity: 1, duration: 4 }, 1.4)
    .to(q('.is-before'), { opacity: 0, duration: .8 }, .6)
    .to(caps[0], { opacity: 0, y: -8, duration: .4 }, 1)
    .fromTo(caps[1], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, 1.3)
    .to(q('.th-rail'), { scaleX: 1, duration: .7, ease: 'power2.out' }, 1.1)
    .to(tiles, { scale: 1, opacity: 1, duration: .55, stagger: .17, ease: 'back.out(1.7)' }, 1.5)
    .to(q('.th-hot'), { opacity: 0, duration: 2.8 }, 2)
    .to(q('.th-waves'), { opacity: 0, duration: 1.8 }, 2.2)
    .to(q('.th-roof-hot, .th-win-hot'), { opacity: 0, duration: 1.4 }, 4)
    .to(q('.th-roof-cool, .th-win-cool'), { opacity: 1, duration: 1.4 }, 4)
    .fromTo(q('.th-envelope'), { opacity: 0, scale: 1.04, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .8, ease: 'power2.out' }, 5)
    .to(caps[1], { opacity: 0, y: -8, duration: .4 }, 5)
    .fromTo(caps[2], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, 5.3)
    .to(q('.is-after'), { opacity: 1, duration: .6, stagger: .1 }, 5.4)
    .to({}, { duration: .6 });

  const mm = gsap.matchMedia();
  mm.add({
    big: '(min-width: 900px) and (min-height: 640px)',
    small: '(max-width: 899px), (max-height: 639px)'
  }, (ctx) => {
    const { big } = ctx.conditions;
    ScrollTrigger.create({
      trigger: big ? '.hero' : '#thermo',
      start: big ? 'top top' : 'center center',
      end: big ? '+=150%' : '+=130%',
      pin: true,
      scrub: .6,
      animation: heroTl,
      invalidateOnRefresh: true
    });
  });

  // viseur qui suit le pointeur
  const screen = $('.thermo__screen');
  const cross = $('.thermo__cross');
  if (screen && cross && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const xTo = gsap.quickTo(cross, 'x', { duration: .45, ease: 'power3' });
    const yTo = gsap.quickTo(cross, 'y', { duration: .45, ease: 'power3' });
    screen.addEventListener('pointermove', (e) => {
      const r = screen.getBoundingClientRect();
      xTo(e.clientX - r.left - r.width / 2);
      yTo(e.clientY - r.top - r.height * .42);
    });
    screen.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  }

  /* ---------- 2. COUPE DE MUR en 4 étapes ---------- */
  const stage = $('.coupe__stage');
  gsap.set($$('.c-blk', stage), { y: -40, opacity: 0 });
  gsap.set($$('.c-plaster', stage), { opacity: 0 });
  gsap.set($('.c-glue', stage), { scaleX: 0, transformOrigin: '0% 50%' });
  gsap.set($('.c-iso', stage), { x: 150, opacity: 0 });
  gsap.set($$('.c-dowel', stage), { scaleX: 0, transformOrigin: '100% 50%' });
  gsap.set($('.c-mesh', stage), { scaleY: 0, transformOrigin: '50% 0%' });
  gsap.set($('.c-finish', stage), { scaleY: 0, transformOrigin: '50% 0%' });
  gsap.set($$('.c-label', stage), { opacity: 0 });
  gsap.set($('.c-flow-escape', stage), { opacity: 1 });
  gsap.set($('.c-flow-kept', stage), { opacity: 0 });
  gsap.set(descs, { opacity: 0 });
  gsap.set(descs[0], { opacity: 1 });

  const lbl = (i) => $$(`.c-label[data-step="${i}"]`, stage);
  const coupeTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  coupeTl
    // étape 1 : support
    .to($$('.c-plaster', stage), { opacity: 1, duration: .3 }, 0)
    .to($$('.c-blk', stage), { y: 0, opacity: 1, duration: .45, stagger: .08, ease: 'bounce.out' }, .05)
    .fromTo(lbl(0), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .3 }, .8)
    // étape 2 : isolant + chevilles, la chaleur est renvoyée
    .to($('.c-glue', stage), { scaleX: 1, duration: .25 }, 1.5)
    .to($('.c-iso', stage), { x: 0, opacity: 1, duration: .7, ease: 'power3.out' }, 1.6)
    .to($$('.c-dowel', stage), { scaleX: 1, duration: .45, stagger: .12, ease: 'power3.in' }, 2.2)
    .to($('.c-flow-escape', stage), { opacity: 0, duration: .4 }, 2)
    .to($('.c-flow-kept', stage), { opacity: 1, duration: .4 }, 2.2)
    .fromTo(lbl(1), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .3 }, 2.5)
    // étape 3 : armature
    .to($('.c-mesh', stage), { scaleY: 1, duration: .8, ease: 'power1.inOut' }, 3)
    .fromTo(lbl(2), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: .3 }, 3.6)
    // étape 4 : enduit
    .to($('.c-finish', stage), { scaleY: 1, duration: .8, ease: 'power1.inOut' }, 4.5)
    .fromTo(lbl(3), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: .3 }, 5.1)
    .to({}, { duration: .6 }, 5.4);
  coupeDur = coupeTl.duration();

  // particules de chaleur
  $$('.c-flow-escape circle', stage).forEach((c, i) => {
    gsap.timeline({ repeat: -1, delay: (i % 2) * 1.5 + i * .12 })
      .fromTo(c, { x: 0, opacity: 0 }, { x: 590, duration: 3, ease: 'none' })
      .to(c, { opacity: 1, duration: .3 }, 0)
      .to(c, { opacity: 0, duration: .4 }, 2.6);
  });
  $$('.c-flow-kept circle', stage).forEach((c, i) => {
    const cx = parseFloat(c.getAttribute('cx'));
    gsap.fromTo(c, { x: -cx + 26 }, { x: 250 - cx, duration: 1.7, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * .25 });
  });

  const bar = $('.coupe__progress i');
  let current = 0;
  const showDesc = (idx) => {
    if (idx === current) return;
    gsap.to(descs[current], { opacity: 0, y: -10, duration: .25, overwrite: true });
    gsap.fromTo(descs[idx], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, delay: .1, overwrite: true });
    current = idx;
    setStep(idx);
  };
  coupeST = ScrollTrigger.create({
    trigger: '.coupe__pin',
    start: 'center center',
    end: '+=260%',
    pin: true,
    scrub: .5,
    animation: coupeTl,
    onUpdate: (self) => {
      const t = self.progress * coupeDur;
      const idx = t < coupeTimes[1] ? 0 : t < coupeTimes[2] ? 1 : t < coupeTimes[3] ? 2 : 3;
      showDesc(idx);
      gsap.set(bar, { scaleX: self.progress });
    }
  });

  /* ---------- 3. ÉTIQUETTE : la jauge monte de G à B ---------- */
  const gauge = $('.gauge');
  const rows = $$('.gauge__row', gauge);
  const ind = $('.gauge__ind', gauge);
  const indL = $('.gauge__ind-l', gauge);
  const bRow = rows[1];
  const gRow = rows[6];
  const offs = () => rows.map((r) => r.offsetTop - bRow.offsetTop);
  const tint = { A: '#5CC08F', B: '#8FD19A', C: '#C6DE9A', D: '#F4E70F', E: '#F0B50F', F: '#F29A55', G: '#FF6B5E' };
  const updLetter = () => {
    const y = gsap.getProperty(ind, 'y');
    const o = offs();
    let best = 0;
    o.forEach((v, i) => { if (Math.abs(v - y) < Math.abs(o[best] - y)) best = i; });
    const l = rows[best].dataset.l;
    if (indL.textContent !== l) { indL.textContent = l; indL.style.color = tint[l]; }
  };
  const gaugeTl = gsap.timeline({ paused: true });
  gaugeTl
    .fromTo($$('.gauge__bar', gauge), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: .6, stagger: { each: .07, from: 'end' }, ease: 'power3.out' })
    .fromTo($$('.gauge__bar b', gauge), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: .3, stagger: { each: .07, from: 'end' } }, .2)
    .fromTo($('.gauge__start', gauge), { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .4 }, .6)
    .fromTo(ind, { y: () => gRow.offsetTop - bRow.offsetTop, opacity: 0 }, { opacity: 1, duration: .35, onStart: updLetter }, .9)
    .to(ind, { y: 0, duration: 2.4, ease: 'power2.inOut', onUpdate: updLetter, onComplete: updLetter }, 1.4)
    .fromTo(ind, { scale: 1 }, { scale: 1.06, duration: .18, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '100% 50%' }, 3.8);
  gaugeTl.progress(0).pause();
  ScrollTrigger.create({ trigger: gauge, start: 'top 72%', once: true, onEnter: () => gaugeTl.play(0) });
  const replay = $('.gauge-replay');
  if (replay) replay.addEventListener('click', () => gaugeTl.play(0));

  /* ---------- reveals génériques ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 32, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-reveal-stagger]').forEach((el) => {
    gsap.from(el.children, { y: 40, opacity: 0, duration: .8, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  // chemin conseil : points qui apparaissent
  gsap.from('.cs-pts circle', { scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .18, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.conseil__visual', start: 'top 85%', once: true } });
  gsap.from('.minimap__pin', { y: -30, opacity: 0, duration: .8, ease: 'bounce.out', scrollTrigger: { trigger: '.minimap', start: 'top 85%', once: true } });

  /* ---------- barre de progression ---------- */
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------- micro-interactions pointeur ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.btn').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .22);
        yTo((e.clientY - r.top - r.height / 2) * .3);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    $$('.mat').forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 10);
        rx(-((e.clientY - r.top) / r.height - .5) * 8);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
