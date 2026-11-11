/* Chez Nicolas — motion design
   Ardoise écrite à la craie, cocotte, menu qui tourne ses pages,
   étapes animées, étiquettes qui pivotent. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var animate = hasGsap && !reduced;
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* ---------- année ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  var burger = $('.burger');
  var nav = $('#menu-principal');
  function closeNav() {
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    $('.sr-only', burger).textContent = 'Ouvrir le menu';
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      $('.sr-only', burger).textContent = open ? 'Ouvrir le menu' : 'Fermer le menu';
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeNav(); burger.focus(); }
    });
  }

  /* =========================================================
     1. L'ARDOISE — le plat du jour s'écrit à la craie
     ========================================================= */
  var slate = $('#slate');
  var svg = $('.slate-svg');
  var dustLayer = $('#dust');
  var chalkStick = $('#chalk-stick');

  // la date du jour, écrite en haut à gauche
  var dateEl = $('#slate-date');
  if (dateEl) {
    try {
      var d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      dateEl.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    } catch (e) { /* garde « Aujourd'hui » */ }
  }

  // nuage de poussière de craie (coordonnées SVG -> % de l'ardoise)
  function dust(x, y, count, spread) {
    if (!dustLayer) return;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'dust';
      p.style.left = (x / 600 * 100) + '%';
      p.style.top = (y / 460 * 100) + '%';
      dustLayer.appendChild(p);
      var s = rand(.6, 2.4);
      gsap.fromTo(p,
        { x: 0, y: 0, scale: s * .4, opacity: rand(.5, .95) },
        {
          x: rand(-spread, spread),
          y: rand(-spread * .9, spread * .5),
          scale: s,
          opacity: 0,
          duration: rand(.9, 1.9),
          ease: 'power2.out',
          onComplete: (function (el) { return function () { el.remove(); }; })(p)
        });
    }
  }

  function writeSlate() {
    var chalkGroup = $('.chalk', svg);
    var items = Array.prototype.slice.call(chalkGroup.children);
    var tl = gsap.timeline({ delay: .5 });
    var lastDust = 0;
    var wobble = 0;

    function follow(x, y) {
      wobble += .7;
      gsap.set(chalkStick, { x: x, y: y + Math.sin(wobble) * 2.2 });
      var now = performance.now();
      if (now - lastDust > 70) { lastDust = now; dust(x - 4, y + 2, 1, 10); }
    }

    // la craie quitte le rebord
    tl.to(chalkStick, { y: '-=24', rotation: -8, duration: .3, ease: 'power2.out' });

    items.forEach(function (item) {
      if (item.matches('g[mask]')) {
        var text = $('text', item);
        var id = item.getAttribute('mask').replace(/^url\(#|\)$/g, '');
        var rect = $('#' + id + ' .wipe');
        var bb = text.getBBox();
        var baseY = bb.y + bb.height * .72;
        var dur = Math.max(.55, bb.width / 300);
        var state = { x: bb.x - 640 };
        tl.to(chalkStick, { x: bb.x, y: baseY, rotation: 0, duration: .32, ease: 'power2.inOut' });
        tl.to(state, {
          x: bb.x + bb.width + 50 - 640,
          duration: dur,
          ease: 'none',
          onUpdate: function () {
            gsap.set(rect, { x: state.x });
            follow(Math.min(state.x + 640 - 40, bb.x + bb.width), baseY);
          }
        });
        tl.add(function () { dust(bb.x + bb.width, baseY, 6, 26); });
      } else if (item.matches('path.chalk-draw')) {
        var path = item;
        if (path.hasAttribute('stroke-dasharray')) {
          // ligne pointillée : simple apparition
          tl.to(path, { opacity: .6, duration: .35 });
          return;
        }
        var len = path.getTotalLength();
        var prog = { v: 0 };
        var start = path.getPointAtLength(0);
        tl.to(chalkStick, { x: start.x, y: start.y, duration: .28, ease: 'power2.inOut' });
        tl.to(prog, {
          v: 1,
          duration: Math.max(.4, len / 520),
          ease: 'power1.inOut',
          onUpdate: function () {
            path.style.strokeDashoffset = len * (1 - prog.v);
            var pt = path.getPointAtLength(len * prog.v);
            follow(pt.x, pt.y);
          }
        });
      }
    });

    // la craie retourne sur le rebord, petit nuage
    tl.to(chalkStick, { x: 470, y: 440, rotation: 0, duration: .6, ease: 'power3.inOut' });
    tl.add(function () { dust(470, 432, 18, 46); });
    tl.from('.slate-sticker', { scale: 0, rotation: -30, opacity: 0, duration: .7, ease: 'back.out(2.2)' }, '-=.1');
    return tl;
  }

  function prepareSlate() {
    // état de départ : rien d'écrit
    $$('.wipe', svg).forEach(function (r) { gsap.set(r, { x: -700 }); });
    $$('path.chalk-draw', svg).forEach(function (p) {
      if (p.hasAttribute('stroke-dasharray')) { gsap.set(p, { opacity: 0 }); return; }
      var len = p.getTotalLength();
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = len;
    });
  }

  if (animate && svg) {
    prepareSlate();
    gsap.set('.slate-sticker', { opacity: 0 });
    var fontsReady = (document.fonts && document.fonts.load)
      ? Promise.race([
          Promise.all([document.fonts.load('700 76px Caveat'), document.fonts.load('500 50px Caveat')]),
          new Promise(function (r) { setTimeout(r, 2500); })
        ])
      : Promise.resolve();
    fontsReady.then(function () {
      gsap.set('.slate-sticker', { clearProps: 'opacity' });
      writeSlate();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    // l'ardoise se balance au chargement, puis réagit au survol
    gsap.from(slate, { rotation: -7, duration: 2.6, ease: 'elastic.out(1, 0.28)', transformOrigin: '50% -40px' });
    slate.addEventListener('mouseenter', function () {
      gsap.fromTo(slate, { rotation: 1.8 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)', overwrite: true });
    });

    // titre du hero
    gsap.from('.hero-title .line > span', { yPercent: 110, duration: 1.1, stagger: .12, ease: 'power4.out' });
    gsap.from('.kicker, .hero-lead, .hero-actions, .hero-note', { y: 22, opacity: 0, duration: .9, stagger: .1, delay: .35, ease: 'power3.out' });
  }

  /* =========================================================
     2. LA COCOTTE — couvercle au survol / au toucher
     ========================================================= */
  var pot = $('#pot');
  if (pot) {
    pot.addEventListener('click', function () {
      var open = !pot.classList.contains('is-open');
      pot.classList.toggle('is-open', open);
      pot.setAttribute('aria-pressed', String(open));
      pot.setAttribute('aria-label', open ? 'Reposer le couvercle de la cocotte' : 'Soulever le couvercle de la cocotte');
    });
  }

  /* =========================================================
     3. MENU DE LA SEMAINE — onglets + page qui se tourne
     ========================================================= */
  var tabs = $$('.tab');
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  var current = 0;
  var turning = null;

  function setTabs(i) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
  }

  function selectDay(i, instant) {
    if (i === current) return;
    if (turning) turning.progress(1);
    var oldP = panels[current];
    var newP = panels[i];
    var forward = i > current;
    setTabs(i);
    current = i;

    if (!animate || instant) {
      oldP.hidden = true;
      newP.hidden = false;
      return;
    }

    newP.hidden = false;
    var top = forward ? oldP : newP;
    var bottom = forward ? newP : oldP;
    top.style.zIndex = 2;
    bottom.style.zIndex = 1;
    var shade = document.createElement('span');
    shade.className = 'page-shade';
    top.appendChild(shade);

    turning = gsap.timeline({
      onComplete: function () {
        oldP.hidden = true;
        gsap.set([oldP, newP], { clearProps: 'transform,zIndex' });
        shade.remove();
        turning = null;
      }
    });
    if (forward) {
      turning.fromTo(top, { rotationY: 0 }, { rotationY: -180, duration: 1, ease: 'power2.inOut' }, 0);
      turning.fromTo(shade, { opacity: 0 }, { opacity: .7, duration: .5, ease: 'power1.in' }, 0);
    } else {
      turning.fromTo(top, { rotationY: -180 }, { rotationY: 0, duration: 1, ease: 'power2.inOut' }, 0);
      turning.fromTo(shade, { opacity: .7 }, { opacity: 0, duration: .5, ease: 'power1.out' }, .5);
    }
    turning.from($$('.page-head, .courses > div, .page-foot', newP), {
      opacity: 0, x: 14, duration: .5, stagger: .07, ease: 'power2.out'
    }, forward ? .35 : .6);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectDay(i); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); tabs[n].focus(); selectDay(n); }
    });
  });

  // ouvre le menu sur le jour d'aujourd'hui (lundi → vendredi)
  var today = new Date().getDay();
  if (today >= 1 && today <= 5 && tabs.length) {
    var tTab = tabs[today - 1];
    var badge = document.createElement('span');
    badge.className = 'today-dot';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = "aujourd'hui";
    tTab.appendChild(badge);
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = " (aujourd'hui)";
    tTab.appendChild(sr);
    selectDay(today - 1, true);
  }

  /* =========================================================
     4. COMMENT ÇA MARCHE — les icônes s'animent à l'apparition
     ========================================================= */
  var steps = $$('.step');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: .35 });
    steps.forEach(function (s) { io.observe(s); });
  } else {
    steps.forEach(function (s) { s.classList.add('is-in'); });
  }

  /* =========================================================
     5. BOISSONS — étiquettes qui pivotent
     ========================================================= */
  $$('.bottle').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = !b.classList.contains('is-flipped');
      b.classList.toggle('is-flipped', on);
      b.setAttribute('aria-pressed', String(on));
    });
  });

  /* =========================================================
     Révélations au scroll
     ========================================================= */
  if (animate && window.ScrollTrigger) {
    // évite le conflit avec les transitions CSS de survol
    var reveal = function (targets, from, trigger, extra) {
      var els = gsap.utils.toArray(targets);
      if (!els.length) return;
      gsap.from(els, Object.assign({
        duration: .9,
        ease: 'power3.out',
        immediateRender: true,
        scrollTrigger: { trigger: trigger || els[0], start: 'top 86%', once: true },
        onStart: function () { els.forEach(function (e) { e.style.transition = 'none'; }); },
        onComplete: function () { gsap.set(els, { clearProps: 'transform,opacity,transition' }); }
      }, from, extra || {}));
    };

    $$('[data-reveal]').forEach(function (el) {
      if (el.classList.contains('polaroid')) return;
      reveal(el, { y: 28, opacity: 0 }, el);
    });
    reveal('.polaroid', { y: 60, opacity: 0, rotation: 6, stagger: .12 }, '.polaroids');
    reveal('.pot', { scale: .85, opacity: 0, duration: 1.2, ease: 'back.out(1.6)' }, '.pot-stage');
    reveal('.pot-hint', { opacity: 0, x: -20, delay: .6 }, '.pot-stage');
    reveal('.step', { y: 60, opacity: 0, stagger: .15 }, '.steps-list');
    reveal('.book', { y: 50, opacity: 0, rotationX: 8, transformPerspective: 1200 }, '.book');
    reveal('.tab', { y: 20, opacity: 0, stagger: .06 }, '.tabs');
    reveal('.bottle', { rotationY: 90, opacity: 0, transformPerspective: 700, stagger: .1, duration: 1.1, ease: 'back.out(1.4)' }, '.shelf');

    // dessin à la craie de la boutique
    var shopPaths = $$('.shop-svg .draw');
    shopPaths.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = len;
    });
    gsap.set('.shop-sign', { opacity: 0 });
    var shopTl = gsap.timeline({ scrollTrigger: { trigger: '.shopfront', start: 'top 80%', once: true } });
    shopPaths.forEach(function (p, k) {
      shopTl.to(p, { strokeDashoffset: 0, duration: .55, ease: 'power1.inOut' }, k * .22);
    });
    shopTl.to('.shop-sign', { opacity: 1, duration: .6 }, '-=.2');

    // le ruban accélère légèrement avec le scroll
    var track = $('.ribbon-track');
    if (track && track.getAnimations) {
      ScrollTrigger.create({
        trigger: '.ribbon',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: function (self) {
          var anims = track.getAnimations();
          if (anims[0]) anims[0].playbackRate = 1 + Math.min(Math.abs(self.getVelocity()) / 800, 3);
        }
      });
    }
  }
})();
