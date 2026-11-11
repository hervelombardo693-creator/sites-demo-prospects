/* Secteur Immo — interactions & motion design */
(function () {
  'use strict';

  var doc = document.documentElement;
  var hasGsap = typeof window.gsap !== 'undefined';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = hasGsap && !reduce;
  window.__siReady = true;
  if (!motion) doc.classList.remove('motion');
  if (motion && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Header ---------------- */
  var hdr = $('.hdr');
  var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('.burger');
  var nav = $('#nav');
  function closeNav() {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    nav.classList.remove('is-open');
  }
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    nav.classList.toggle('is-open', open);
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------------- Plan : données des secteurs ---------------- */
  var ICONS = {
    desk: '<path d="M3 10h18M5 10v9M19 10v9M8 10V6h8v4"/>',
    wifi: '<path d="M2 9a14 14 0 0 1 20 0M5.5 12.5a9 9 0 0 1 13 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    locker: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M12 3v18M9 11v2M15 11v2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    door: '<path d="M6 21V3h12v18M3 21h18"/><circle cx="15" cy="12" r="1"/>',
    chair: '<path d="M7 3h10v9H7zM5 12h14M8 12v9M16 12v9"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
    board: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M7 9l3 3 3-4 4 4M8 20l2-4M16 20l-2-4"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 17v2M19 17v2"/>',
    fridge: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 10h12M9 6v2M9 13v3"/>',
    people: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-4 3-6 6-6s6 2 6 6M10 20c0-4 3-6 6-6s6 2 6 6"/>'
  };
  var ZONES = {
    openspace: {
      code: 'Secteur S-01', title: 'Open space',
      desc: 'Des postes partagés pour travailler au calme, entouré d’autres indépendants.',
      items: [['desk', 'Postes de travail partagés'], ['wifi', 'Connexion internet'], ['plug', 'Prises à chaque poste'], ['locker', 'Casiers de rangement'], ['sun', 'Lumière naturelle'], ['people', 'Ambiance de travail']]
    },
    bureaux: {
      code: 'Secteur S-02', title: 'Bureaux fermés',
      desc: 'Des bureaux privatifs pour s’isoler, passer des appels ou installer une petite équipe.',
      items: [['door', 'Porte qui ferme à clé'], ['chair', 'Mobilier de bureau'], ['screen', 'Écran de travail'], ['phone', 'Calme pour les appels'], ['wifi', 'Connexion internet'], ['locker', 'Rangements']]
    },
    reunion: {
      code: 'Secteur S-03', title: 'Salle de réunion',
      desc: 'Un lieu pour recevoir clients et partenaires, présenter un projet ou former une équipe.',
      items: [['screen', 'Écran de présentation'], ['video', 'Visioconférence'], ['board', 'Tableau blanc'], ['people', 'Grande table de réunion'], ['calendar', 'Réservation à l’heure'], ['coffee', 'Café pour vos invités']]
    },
    cafe: {
      code: 'Secteur S-04', title: 'Coin café',
      desc: 'La pause qui fait du bien, et le meilleur endroit pour rencontrer ses voisins de bureau.',
      items: [['coffee', 'Machine à café'], ['sofa', 'Coin détente'], ['fridge', 'Réfrigérateur'], ['desk', 'Mange-debout'], ['people', 'Moments partagés'], ['sun', 'Pause au calme']]
    }
  };

  var svg = $('svg.iso');
  var zonesG = $('.iso .zones');
  var panel = $('#zone-panel');
  var pEmpty = $('.zp-empty', panel);
  var pBody = $('.zp-body', panel);
  var active = null;

  function lift(id, y, dur) {
    var els = [$('#zone-' + id + ' .zone-lift'), $('.zlabel[data-zone="' + id + '"]')];
    if (motion) {
      gsap.to(els, { y: y, duration: dur || 0.6, ease: y < -10 ? 'back.out(1.7)' : 'power3.out', overwrite: 'auto' });
    } else {
      els.forEach(function (el) { el.style.transform = 'translateY(' + y + 'px)'; });
    }
  }
  function shadow(id, op) {
    var el = $('.zshadow[data-zone="' + id + '"]');
    if (motion) gsap.to(el, { opacity: op, duration: 0.5, overwrite: 'auto' });
    else el.style.opacity = op;
  }

  function renderPanel(id) {
    if (!id) {
      pBody.hidden = true; pEmpty.hidden = false;
      return;
    }
    var z = ZONES[id];
    $('.zp-code', pBody).textContent = z.code;
    $('.zp-title', pBody).textContent = z.title;
    $('.zp-desc', pBody).textContent = z.desc;
    $('.zp-list', pBody).innerHTML = z.items.map(function (it) {
      return '<li><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[it[0]] + '</svg><span>' + it[1] + '</span></li>';
    }).join('');
    pEmpty.hidden = true; pBody.hidden = false;
    if (motion) {
      gsap.fromTo($$('.zp-code, .zp-title, .zp-desc, .zp-list li, .zp-note', pBody),
        { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power3.out', overwrite: true });
    }
  }

  function select(id) {
    if (id === active) id = null;
    var prev = active;
    active = id;
    if (prev) { lift(prev, 0); shadow(prev, 0); }
    if (id) { lift(id, -22); shadow(id, 0.22); }
    zonesG.classList.toggle('has-active', !!id);
    $$('.iso .zone').forEach(function (z) {
      var on = z.dataset.zone === id;
      z.classList.toggle('is-active', on);
      z.setAttribute('aria-pressed', String(on));
    });
    $$('.iso .zlabel').forEach(function (l) { l.classList.toggle('is-active', l.dataset.zone === id); });
    $$('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.zone === id)); });
    renderPanel(id);
  }

  $$('.iso .zone').forEach(function (z) {
    var id = z.dataset.zone;
    z.addEventListener('click', function () { select(id); });
    z.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); }
    });
    z.addEventListener('pointerenter', function () { if (active !== id) lift(id, -7, 0.4); });
    z.addEventListener('pointerleave', function () { if (active !== id) lift(id, 0, 0.4); });
  });
  $$('.chip').forEach(function (c) { c.addEventListener('click', function () { select(c.dataset.zone); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active) select(null); });

  /* ---------------- Plan : personnages ---------------- */
  var S = parseFloat(svg.dataset.s), OX = parseFloat(svg.dataset.ox), OY = parseFloat(svg.dataset.oy);
  var C30 = Math.cos(Math.PI / 6);
  function iso(x, y) { return { x: (x - y) * C30 * S + OX, y: (x + y) * 0.5 * S + OY }; }

  var ROUTES = [
    // vers l'open space, allée centrale
    { pts: [[21, 9], [11.4, 9], [11.4, 4.35], [2.2, 4.35], [11.4, 4.35], [11.4, 9]], pause: [0, 0, 0, 2.2, 0, 0.6], speed: 1.7, delay: 0.2 },
    // pause café
    { pts: [[19.5, 9], [14.2, 9], [14.2, 12.7], [11.2, 12.7], [11.2, 9]], pause: [0.4, 0, 2.6, 0.5, 0], speed: 1.5, delay: 1.1 },
    // bureau fermé
    { pts: [[6, 9], [20, 9], [20, 6.6], [20, 9]], pause: [1, 0, 2.4, 0], speed: 1.8, delay: 2.0 }
  ];

  function placeWalkers() {
    $$('.iso .walker').forEach(function (w, i) {
      var r = ROUTES[i], p = iso(r.pts[0][0], r.pts[0][1]);
      w.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')');
    });
  }

  function animateWalkers() {
    $$('.iso .walker').forEach(function (w, i) {
      var r = ROUTES[i];
      var flip = $('.walker-flip', w);
      var start = iso(r.pts[0][0], r.pts[0][1]);
      w.removeAttribute('transform');
      gsap.set(w, { x: start.x, y: start.y });
      var tl = gsap.timeline({ repeat: -1, delay: r.delay });
      var n = r.pts.length;
      for (var k = 0; k < n; k++) {
        var a = r.pts[k], b = r.pts[(k + 1) % n];
        var pa = iso(a[0], a[1]), pb = iso(b[0], b[1]);
        var dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (r.pause[k]) {
          tl.call(function () { w.classList.remove('is-walking'); });
          tl.to({}, { duration: r.pause[k] });
        }
        (function (dir) {
          tl.call(function () { w.classList.add('is-walking'); gsap.set(flip, { scaleX: dir }); });
        })(pb.x >= pa.x ? 1 : -1);
        tl.to(w, { x: pb.x, y: pb.y, duration: dist / r.speed, ease: 'none' });
      }
    });
  }

  /* ---------------- Intro : héros + construction du plan ---------------- */
  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.h-display .line-in', { y: 0, duration: 1.1, stagger: 0.09 }, 0.1)
      .to('.hero-txt .eyebrow', { opacity: 1, duration: 0.6 }, 0.1)
      .fromTo('.hero-txt .lead', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .fromTo('.hero-txt .hero-cta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.68)
      .fromTo('.plan-frame', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9 }, 0.2);

    // surlignage menthe des deux dernières lignes
    $$('.accent-line').forEach(function (el, i) {
      tl.add(function () { el.classList.add('hl-on'); }, 0.75 + i * 0.12);
    });

    var p = 0;
    var bt = gsap.timeline({ defaults: { ease: 'power4.out' }, paused: true });
    var playBuild = function () { gsap.delayedCall(0.5, function () { bt.play(); }); };
    if (window.ScrollTrigger) ScrollTrigger.create({ trigger: '.plan-stage', start: 'top 85%', once: true, onEnter: playBuild });
    else playBuild();
    gsap.set('.iso .b-ground, .iso .b-slab, .iso .b-wall, .iso .b-item, .iso .entry', { opacity: 0 });
    bt.fromTo('.iso .b-ground', { opacity: 0 }, { opacity: 1, duration: 0.6 }, p)
      .fromTo('.iso .b-slab', { opacity: 0, y: -46 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.4)' }, p + 0.1)
      .fromTo('.iso .b-wall', { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' }, { opacity: 1, scaleY: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, p + 0.55)
      .fromTo('.iso .b-item', { opacity: 0, y: -14, scale: 0.6, transformOrigin: '50% 100%' }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: { each: 0.012, from: 'start' }, ease: 'back.out(2)' }, p + 0.8)
      .fromTo('.iso .entry', { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.6 }, p + 1.6)
      .fromTo('.iso .zlabel-in', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(2)' }, p + 1.9)
      .to('.iso .walker', { opacity: 1, duration: 0.5, stagger: 0.2 }, p + 2.1)
      .add(animateWalkers, p + 2.0);
  }

  /* ---------------- Chiffres ---------------- */
  function counters() {
    $$('.stat-n[data-count]').forEach(function (el) {
      var to = parseInt(el.dataset.count, 10);
      var from = to > 1000 ? to - 26 : 0;
      var o = { v: from };
      el.textContent = from;
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: function () { el.textContent = Math.round(o.v); }
      });
    });
  }

  /* ---------------- Formules : bascule ---------------- */
  var sw = $('#plan-switch');
  var cards = $('.cards');
  function setPlans(on) {
    sw.setAttribute('aria-checked', String(on));
    cards.classList.toggle('is-flipped', on);
    $('#sw-a').classList.toggle('is-on', !on);
    $('#sw-b').classList.toggle('is-on', on);
    $$('.face-a', cards).forEach(function (f) { f.toggleAttribute('inert', on); f.setAttribute('aria-hidden', String(on)); });
    $$('.face-b', cards).forEach(function (f) { f.toggleAttribute('inert', !on); f.setAttribute('aria-hidden', String(!on)); });
    if (motion) {
      gsap.fromTo('.flip', { y: 0 }, { y: -14, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out', stagger: 0.09 });
    }
  }
  sw.addEventListener('click', function () { setPlans(sw.getAttribute('aria-checked') !== 'true'); });
  $$('.sw-label').forEach(function (l) { l.addEventListener('click', function () { setPlans(l.dataset.side === '1'); }); });
  $('#sw-a').classList.add('is-on');

  /* ---------------- Journée : défilement horizontal ---------------- */
  function dayTimeline() {
    var pin = $('.day-pin');
    var track = $('.day-track');
    var slots = $$('.slot', track);
    var sun = $('.sun');
    var ruler = $('.ruler');
    var fill = $('.ruler-fill');
    var am = $('.sky-am'), noon = $('.sky-noon'), pm = $('.sky-pm');
    var dist = function () { return Math.max(0, track.scrollWidth - document.documentElement.clientWidth); };
    var current = -1;

    function update(p) {
      var w = ruler.clientWidth;
      var t = p;
      var x = ((1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 500 + t * t * 990) / 1000 * w;
      var y = ((1 - t) * (1 - t) * 115 + 2 * (1 - t) * t * -60 + t * t * 115) / 120 * 54;
      gsap.set(sun, { x: x, y: y });
      gsap.set(fill, { scaleX: p });
      gsap.set(am, { opacity: Math.max(0, 1 - p * 2) });
      gsap.set(noon, { opacity: 1 - Math.min(1, Math.abs(p - 0.5) * 2.2) });
      gsap.set(pm, { opacity: Math.max(0, (p - 0.5) * 2) });
      var idx = Math.min(slots.length - 1, Math.round(p * (slots.length - 1)));
      if (idx !== current) {
        if (slots[current]) slots[current].classList.remove('is-now');
        slots[idx].classList.add('is-now');
        current = idx;
      }
    }

    gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: function () { return '+=' + dist(); },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) { update(self.progress); },
        onRefresh: function (self) { update(self.progress); }
      }
    });
    update(0);
    gsap.from(slots, { opacity: 0, y: 40, duration: 0.8, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: pin, start: 'top 75%', once: true } });
  }

  /* ---------------- Révélations au scroll ---------------- */
  function reveals() {
    $$('[data-reveal]').forEach(function (el) {
      var sibs = $$(':scope > [data-reveal]', el.parentNode);
      var i = Math.max(0, sibs.indexOf(el));
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, delay: (i % 4) * 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onComplete: function () {
          el.classList.add('is-in');
          if (el.classList.contains('serv')) setTimeout(function () { el.classList.remove('is-in'); }, 2600);
        }
      });
    });
  }

  /* ---------------- Boutons magnétiques ---------------- */
  function magnetic() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.magnetic').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------------- Lancement ---------------- */
  placeWalkers();
  if (motion) {
    intro();
    counters();
    reveals();
    magnetic();
    if (window.ScrollTrigger) {
      dayTimeline();
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  } else {
    $$('.serv').forEach(function (s) { s.classList.add('is-in'); });
  }
})();
