/* =========================================================
   EXIT 0.1 — motion design
   GSAP 3.12.5 + ScrollTrigger + MotionPathPlugin (cdnjs)
   Tout ce qui bouge passe par transform / opacity.
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGsap && !reduce;

  /* ---------- Toujours actif (avec ou sans animations) ---------- */
  initGrain();
  initNav();
  initTickets();

  if (!motion) {
    // Rideau déjà ouvert, contenu entièrement visible.
    doc.classList.remove('intro');
    return;
  }

  doc.classList.add('motion', 'intro-running');
  gsap.registerPlugin(ScrollTrigger);
  if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  splitKinetic();
  initIntro();
  initChrome();
  initCursor();
  initMagnetic();
  initSpotlight();
  initPoles();
  initTour();
  initReveals();
  initParallax();

  /* =======================================================
     Grain de film : une texture de bruit générée en canvas
     ======================================================= */
  function initGrain() {
    var el = qs('.grain');
    if (!el) return;
    try {
      var c = document.createElement('canvas');
      c.width = c.height = 180;
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(180, 180);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = Math.random() * 90 + 30;
      }
      ctx.putImageData(img, 0, 0);
      el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
    } catch (e) { /* pas de grain, pas grave */ }
  }

  /* =======================================================
     Navigation mobile
     ======================================================= */
  function initNav() {
    var nav = qs('.nav');
    var toggle = qs('.nav__toggle');
    if (!nav || !toggle) return;
    var label = qs('.nav__toggle-label', toggle);
    function set(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Fermer' : 'Menu';
      doc.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', function () { set(!nav.classList.contains('is-open')); });
    qsa('.nav__menu a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960 && nav.classList.contains('is-open')) set(false); });
  }

  /* =======================================================
     Billets : le talon se détache (hover en CSS, bouton pour tactile/clavier)
     ======================================================= */
  function initTickets() {
    qsa('.ticket__tear').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.closest('.ticket');
        var torn = !t.classList.contains('is-torn');
        t.classList.toggle('is-torn', torn);
        btn.setAttribute('aria-pressed', String(torn));
        btn.textContent = torn ? 'Recoller' : 'Détacher';
      });
    });
  }

  /* =======================================================
     Découpe des titres cinétiques en mots / lettres
     ======================================================= */
  function splitKinetic() {
    qsa('.kinetic').forEach(function (el) {
      var text = el.textContent.replace(/­/g, '').replace(/\s+/g, ' ').trim();
      el.setAttribute('aria-label', text);
      var frag = document.createDocumentFragment();
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeName === 'BR') { frag.appendChild(document.createElement('br')); return; }
        var words = node.textContent.replace(/­/g, '').split(/\s+/).filter(Boolean);
        words.forEach(function (w, wi) {
          var word = document.createElement('span');
          word.className = 'word';
          word.setAttribute('aria-hidden', 'true');
          w.split('').forEach(function (ch) {
            var c = document.createElement('span');
            c.className = 'char';
            c.textContent = ch;
            word.appendChild(c);
          });
          frag.appendChild(word);
          if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
        });
      });
      el.textContent = '';
      el.appendChild(frag);
    });
  }

  /* =======================================================
     1. Intro : les trois coups, le rideau s'ouvre, le néon s'allume
     ======================================================= */
  function initIntro() {
    var curtain = qs('.curtain');
    var skip = qs('.intro-skip');
    var left = qs('.curtain__panel--left');
    var right = qs('.curtain__panel--right');
    var valance = qs('.curtain__valance');
    var knocks = qsa('.knock');
    var hint = qs('.curtain__hint');
    var lines = qsa('.hero__title .line__in');
    var heroBits = qsa('[data-hero="meta"], [data-hero="lede"]');
    var photo = qs('[data-hero="photo"]');
    var neon = qs('.neon');
    var tube = qs('.neon__box');
    var glow = qs('.neon__glow');
    var cue = qs('.scroll-cue');
    var header = qs('.site-header');

    gsap.set(lines, { yPercent: 110 });
    gsap.set(heroBits, { opacity: 0, y: 24 });
    gsap.set(photo, { opacity: 0, y: 60, rotate: 6 });
    gsap.set(tube, { opacity: 0.08 });
    gsap.set(glow, { opacity: 0 });
    gsap.set([cue, header], { opacity: 0 });

    var playIntro = doc.classList.contains('intro') && curtain;
    var tl = gsap.timeline({ onComplete: done });

    if (playIntro) {
      // Les trois coups : trois pulsations lentes, le rideau frémit à chaque coup.
      knocks.forEach(function (k, i) {
        var at = 0.25 + i * 0.42;
        tl.fromTo(k, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(3)' }, at)
          .to([left, right], { x: function (j) { return j ? 5 : -5; }, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, at);
      });
      tl.to(hint, { opacity: 1, duration: 0.4 }, 0.3)
        .to([knocks, hint], { opacity: 0, duration: 0.35 }, 1.75)
        // Ouverture : les pans se froncent vers les coulisses (scaleX) en glissant.
        .to(valance, { yPercent: -110, duration: 1.3, ease: 'power3.inOut' }, 1.95)
        .to(left, { xPercent: -100, scaleX: 0.55, duration: 1.6, ease: 'power3.inOut' }, 1.85)
        .to(right, { xPercent: 100, scaleX: 0.55, duration: 1.6, ease: 'power3.inOut' }, 1.85)
        .to(curtain, { opacity: 0, duration: 0.4 }, 3.25)
        .add(function () { doc.classList.remove('intro'); ScrollTrigger.refresh(); }, 3.5);
    } else {
      doc.classList.remove('intro');
    }

    var t0 = playIntro ? 2.45 : 0.1;
    tl.to(lines, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12 }, t0)
      .to(heroBits, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, t0 + 0.35)
      .to(photo, { opacity: 1, y: 0, rotate: 2, duration: 1.4, ease: 'expo.out' }, t0 + 0.2)
      .to([cue, header], { opacity: 1, duration: 0.8 }, t0 + 0.8);

    // Néon : allumage avec un scintillement doux (2 hésitations, lentes et partielles).
    var n = t0 + 0.5;
    tl.to(tube, { opacity: 0.7, duration: 0.2, ease: 'power2.out' }, n)
      .to(glow, { opacity: 0.4, duration: 0.2 }, n)
      .to(tube, { opacity: 0.35, duration: 0.22, ease: 'power1.in' }, n + 0.22)
      .to(glow, { opacity: 0.1, duration: 0.22 }, n + 0.22)
      .to(tube, { opacity: 0.9, duration: 0.2, ease: 'power2.out' }, n + 0.5)
      .to(glow, { opacity: 0.7, duration: 0.2 }, n + 0.5)
      .to(tube, { opacity: 0.6, duration: 0.25 }, n + 0.75)
      .to(tube, { opacity: 1, duration: 0.4, ease: 'power2.out' }, n + 1.05)
      .to(glow, { opacity: 1, duration: 0.6 }, n + 1.05)
      .add(function () { neon.classList.add('is-breathing'); }, n + 1.7);

    function finish() { tl.progress(1); }
    if (skip) skip.addEventListener('click', finish);
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' && doc.classList.contains('intro')) { finish(); document.removeEventListener('keydown', onKey); }
    });

    function done() {
      doc.classList.remove('intro', 'intro-running');
      doc.classList.add('intro-done');
      gsap.set(glow, { clearProps: 'opacity' });
      neon.classList.add('is-breathing');
      ScrollTrigger.refresh();
    }
  }

  /* =======================================================
     En-tête qui se rétracte + barre de progression
     ======================================================= */
  function initChrome() {
    var header = qs('.site-header');
    var nav = qs('.nav');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        if (nav.classList.contains('is-open')) return;
        header.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 240);
      }
    });
    gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* =======================================================
     Curseur personnalisé (souris uniquement)
     ======================================================= */
  function initCursor() {
    if (!finePointer) return;
    var cursor = qs('.cursor');
    var dot = qs('.cursor__dot');
    var ring = qs('.cursor__ring');
    var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      cursor.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      cursor.classList.toggle('is-link', !!e.target.closest('a, button'));
    });
    document.documentElement.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
  }

  /* Boutons magnétiques */
  function initMagnetic() {
    if (!finePointer) return;
    qsa('.magnetic').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* =======================================================
     2. Projecteur : le halo suit le curseur (auto sur mobile)
     ======================================================= */
  function initSpotlight() {
    var spot = qs('.spot');
    if (!spot) return;
    var dark = qs('.spot__dark', spot);
    var warm = qs('.spot__warm', spot);
    var beam = qs('.spot__beam', spot);
    var toggle = qs('.spot__toggle', spot);
    var toggleText = qs('.spot__toggle-text', spot);

    var w = 0, h = 0, rect = null;
    var cx = 0, cy = 0, tx = 0, ty = 0, wx = 0, wy = 0;
    var pointerInside = false, lastMove = 0, active = false, t = Math.random() * 10;

    function measure() { w = spot.offsetWidth; h = spot.offsetHeight; }
    measure();
    cx = tx = wx = w * 0.3; cy = ty = wy = h * 0.4;
    window.addEventListener('resize', measure);

    spot.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      rect = spot.getBoundingClientRect();
      tx = e.clientX - rect.left; ty = e.clientY - rect.top;
      pointerInside = true; lastMove = performance.now();
    });
    spot.addEventListener('pointerleave', function () { pointerInside = false; });

    function tick(time, delta) {
      t += (delta || 16) / 1000;
      if (!pointerInside || performance.now() - lastMove > 4000) {
        // Balayage automatique, lent, en lissajous.
        tx = w * (0.5 + 0.34 * Math.sin(t * 0.45));
        ty = h * (0.46 + 0.3 * Math.sin(t * 0.62 + 1.3));
      }
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      wx += (tx - wx) * 0.06; wy += (ty - wy) * 0.06;
      dark.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      warm.style.transform = 'translate3d(' + wx + 'px,' + wy + 'px,0)';
      var ox = w / 2, oy = 52;
      var ang = Math.atan2(cx - ox, cy - oy) * -180 / Math.PI;
      var len = Math.max(60, Math.hypot(cx - ox, cy - oy));
      beam.style.transform = 'rotate(' + ang + 'deg) scaleY(' + (len / 1000) + ')';
    }

    ScrollTrigger.create({
      trigger: spot, start: 'top bottom', end: 'bottom top',
      onToggle: function (self) {
        if (self.isActive && !active) { measure(); gsap.ticker.add(tick); active = true; }
        else if (!self.isActive && active) { gsap.ticker.remove(tick); active = false; }
      }
    });

    toggle.addEventListener('click', function () {
      var lit = !spot.classList.contains('is-lit');
      spot.classList.toggle('is-lit', lit);
      toggle.setAttribute('aria-pressed', String(lit));
      toggleText.textContent = lit ? 'Éteindre la salle' : 'Rallumer la salle';
    });

    // Le texte du manifeste monte doucement.
    gsap.from('.spot__title, .spot__text, .spot__verbs li', {
      y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: '.spot__content', start: 'top 75%' }
    });
  }

  /* =======================================================
     3. Trois pôles plein écran, épinglés, texte cinétique
     ======================================================= */
  function initPoles() {
    var section = qs('.poles');
    if (!section) return;
    var panels = qsa('.pole', section);
    var bars = qsa('.poles__progress i', section);
    var n = panels.length;

    gsap.set(panels.slice(1), { yPercent: 100 });

    var first = panels[0];
    gsap.from(qsa('.char', first), {
      yPercent: 115, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: 0.03,
      scrollTrigger: { trigger: section, start: 'top 70%' }
    });
    gsap.from([qs('.pole__text', first), qs('.pole__art', first)], {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: section, start: 'top 55%' }
    });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section, start: 'top top',
        end: function () { return '+=' + window.innerHeight * (n - 1) * 1.35; },
        pin: true, scrub: 0.8, anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress * n;
          bars.forEach(function (b, i) { b.style.setProperty('--p', Math.min(1, Math.max(0, p - i)).toFixed(3)); });
        }
      }
    });

    // Fantômes en contre-mouvement sur toute la durée.
    panels.forEach(function (p, i) {
      tl.fromTo(qs('.pole__ghost', p), { xPercent: 5 }, { xPercent: -40, duration: n }, 0);
      var art = qs('.pole__art', p);
      if (art) tl.fromTo(art, { y: 30 }, { y: -30, duration: n }, 0);
    });

    for (var i = 1; i < n; i++) {
      var at = i - 0.6;
      var prev = panels[i - 1], cur = panels[i];
      tl.to(qs('.pole__inner', prev), { yPercent: -12, scale: 0.92, opacity: 0.2, duration: 0.6, ease: 'power2.in' }, at)
        .to(cur, { yPercent: 0, duration: 0.6, ease: 'power2.inOut' }, at)
        // fromTo (et non from) : les valeurs finales restent justes quand ScrollTrigger invalide la timeline.
        .fromTo(qsa('.char', cur), { yPercent: 115, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 0.45, stagger: 0.025, ease: 'power3.out' }, at + 0.25)
        .fromTo([qs('.pole__num', cur), qs('.act-label', cur), qs('.pole__text', cur)], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }, at + 0.4);
    }
    tl.to({}, { duration: 0.4 }); // un temps de respiration sur le dernier pôle
  }

  /* =======================================================
     4. La tournée : le tracé relie les villes au scroll
     ======================================================= */
  function initTour() {
    var section = qs('.tour');
    if (!section) return;
    var legs = qsa('.leg', section);
    var cities = qsa('.city', section);
    var stops = qsa('.stop', section);
    var marker = qs('.map-marker', section);
    var canMotion = !!window.MotionPathPlugin;
    var SEG = 1.25;

    legs.forEach(function (leg) {
      var len = leg.getTotalLength();
      gsap.set(leg, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
    });
    cities.slice(1).forEach(function (c) {
      gsap.set(qsa('circle', c), { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(qs('text', c), { opacity: 0 });
    });
    if (canMotion) gsap.set(marker, { x: 379, y: 297.8 }); else marker.style.display = 'none';

    function build(stConfig) {
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () { mark(tl.time()); },
        scrollTrigger: Object.assign({ scrub: 0.6 }, stConfig)
      });
      legs.forEach(function (leg, i) {
        var at = i * SEG;
        tl.set(leg, { opacity: 1 }, at)
          .to(leg, { strokeDashoffset: 0, duration: 1 }, at);
        if (canMotion) tl.to(marker, { motionPath: { path: leg, align: leg, alignOrigin: [0.5, 0.5] }, duration: 1, ease: 'power1.inOut' }, at);
        var c = cities[i + 1];
        tl.to(qsa('circle', c), { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at + 0.95)
          .to(qs('text', c), { opacity: 1, duration: 0.2 }, at + 0.95);
      });
      mark(0);
      return tl;
    }

    function mark(time) {
      var idx = Math.min(stops.length - 1, Math.floor((time + 0.26) / SEG));
      stops.forEach(function (s, i) {
        s.classList.toggle('is-reached', i <= idx);
        s.classList.toggle('is-current', i === idx);
      });
    }

    var mm = gsap.matchMedia();
    mm.add('(min-width: 1000px)', function () {
      build({ trigger: section, start: 'top top', end: function () { return '+=' + window.innerHeight * 1.8; }, pin: true, anticipatePin: 1 });
    });
    mm.add('(max-width: 999px)', function () {
      // Sur mobile, la carte reste collée en haut pendant que la liste défile.
      build({ trigger: qs('.tour__stops', section), start: 'top 85%', end: 'bottom 75%' });
    });

    gsap.from('.tour__title, .tour__note', {
      y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: section, start: 'top 70%' }
    });
  }

  /* =======================================================
     Révélations au scroll
     ======================================================= */
  function initReveals() {
    var els = qsa('[data-reveal]');
    els.forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: (i % 2) * 0.1,
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' }
      });
    });
  }

  /* =======================================================
     Parallaxes discrètes
     ======================================================= */
  function initParallax() {
    gsap.to('.hero__photo', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__title .line:nth-child(2)', { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.neon', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.spot__ghost', { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.spot', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.footer__big', { xPercent: 12 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.fromTo('.contact__sign', { y: 60, rotate: 4 }, { y: 0, rotate: -4, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 30%', scrub: true } });
    qsa('.wings__grid .photo-slot').forEach(function (el, i) {
      gsap.fromTo(el.querySelector('svg'), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }
})();
