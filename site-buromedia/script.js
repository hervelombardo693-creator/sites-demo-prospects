/* =========================================================
   Buromedia — motion design
   1. Intro « boot » + allumage de l'écran
   2. Pistes de circuit imprimé dessinées au scroll
   3. Assistant « Quel est votre problème ? »
   4. Portable qui s'ouvre, catégories qui sortent de l'écran
   5. Carte du secteur (pulse en CSS)
   Tout le contenu reste visible sans JS, sans GSAP ou en
   mouvement réduit : les états cachés ne sont posés qu'ici.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap;
  var anim = !!(G && window.ScrollTrigger) && !reduce;
  if (anim) {
    G.registerPlugin(window.ScrollTrigger);
  }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var debounce = function (fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
     En-tête, menu mobile, lien actif, bouton d'appel mobile
     --------------------------------------------------------- */
  var header = $('.header');
  var burger = $('.burger');
  var onScrollHeader = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  var setMenu = function (open) {
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); burger.focus(); }
  });

  if ('IntersectionObserver' in window) {
    var navLinks = $$('.nav__list a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });

    var mobileCall = $('.mobile-call');
    var heroVisible = true, contactVisible = false;
    var updateCall = function () { mobileCall.classList.toggle('is-hidden', heroVisible || contactVisible); };
    mobileCall.classList.add('is-hidden');
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; updateCall(); }, { threshold: 0.35 }).observe($('#accueil'));
    new IntersectionObserver(function (en) { contactVisible = en[0].isIntersecting; updateCall(); }, { threshold: 0.1 }).observe($('#contact'));
  }

  /* ---------------------------------------------------------
     1. HERO — états initiaux + séquence d'allumage
     --------------------------------------------------------- */
  var heroPlayed = false;
  if (anim) {
    G.set('.hero__title .line__in', { yPercent: 110 });
    G.set('[data-hero]', { opacity: 0, y: 18 });
    G.set('.monitor', { opacity: 0, y: 30, scale: 0.96, transformOrigin: '50% 100%' });
    G.set('.monitor .scr-row', { opacity: 0 });
    G.set('.monitor .scr-bar', { scaleX: 0, transformOrigin: '0% 50%' });
    G.set('.monitor .scr-ok', { opacity: 0 });
    G.set('[data-hero-bubble]', { opacity: 0, scale: 0.6, y: 10, transformOrigin: '0% 100%' });
  }

  function playHero() {
    if (heroPlayed || !anim) return;
    heroPlayed = true;
    var tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__title .line__in', { yPercent: 0, duration: 1, stagger: 0.09 })
      .to('[data-hero]', { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.35)
      .to('.monitor', { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 0.15)
      // flicker d'allumage de l'écran
      .fromTo('.monitor .scr-glow', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'steps(4)' }, 0.5);
    $$('.monitor .scr-row').forEach(function (row, i) {
      var at = 0.8 + i * 0.22;
      tl.to(row, { opacity: 1, duration: 0.2, ease: 'none' }, at)
        .to($('.scr-bar', row), { scaleX: 1, duration: 0.55, ease: 'power3.out' }, at)
        .to($('.scr-ok', row), { opacity: 1, duration: 0.15, ease: 'none' }, at + 0.45);
    });
    tl.to('[data-hero-bubble]', { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2)' }, 1.9);
  }

  /* ---------------------------------------------------------
     1b. INTRO BOOT — ~1,5 s, passable (clic, touche, molette)
     --------------------------------------------------------- */
  (function boot() {
    var log = $('#bootLog');
    if (!root.classList.contains('is-booting') || !log) { playHero(); return; }

    var lines = [
      '<span class="hi">BUROMEDIA</span> <span class="dim">bios v1.0 · 03130 Neuilly-en-Donjon</span>',
      '<span class="dim">────────────────────────────────────</span>',
      'Test mémoire ..................... <span class="ok">OK</span>',
      'Clavier, souris .................. <span class="ok">OK</span>',
      'Réseau local ..................... <span class="ok">OK</span>',
      'Module « patience » .............. <span class="ok">OK</span>',
      'Module « explications claires » .. <span class="ok">OK</span>',
      'Filtre anti-jargon ............... <span class="ok">ACTIF</span>',
      '',
      '<span class="hi">Système prêt. Bonjour !</span>'
    ];
    var i = 0, done = false, timer;

    function step() {
      if (done) return;
      if (i < lines.length) {
        log.innerHTML += (i ? '\n' : '') + lines[i];
        i++;
        timer = setTimeout(step, i === lines.length ? 260 : 125);
      } else {
        finish();
      }
    }

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(window.__bmBootFailsafe);
      try { sessionStorage.setItem('bm-boot', '1'); } catch (e) {}
      root.classList.add('is-powering');
      setTimeout(playHero, 160);
      setTimeout(function () {
        root.classList.remove('is-booting', 'is-powering');
        detach();
      }, 700);
    }

    var skip = function () { finish(); };
    var onKey = function (e) { if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') finish(); };
    function detach() {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
    }
    $('.boot').addEventListener('click', skip);
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchstart', skip, { passive: true });

    // Si le filet de sécurité a déjà retiré l'intro, on ne fait rien de plus.
    if (!root.classList.contains('is-booting')) { done = true; playHero(); return; }
    step();
  })();

  /* ---------------------------------------------------------
     2. PISTES DE CIRCUIT IMPRIMÉ
     Construites d'après la position réelle des sections, puis
     « gravées » au fil du scroll (pointe lumineuse verte).
     --------------------------------------------------------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var mainEl = $('#contenu');
  var circuitSvg = $('.circuit');
  var circuitST = null;
  var branchTweens = [];

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function buildCircuit() {
    if (!circuitSvg || !mainEl) return;
    if (circuitST) { circuitST.kill(); circuitST = null; }
    branchTweens.forEach(function (t) { t.kill(); });
    branchTweens = [];
    circuitSvg.innerHTML = '';

    var W = mainEl.clientWidth;
    var H = mainEl.offsetHeight;
    circuitSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var mr = mainEl.getBoundingClientRect();
    var cont = $('.hero .container').getBoundingClientRect();
    var mobile = W < 900;
    var sx = mobile ? 7 : Math.max(16, Math.round(cont.left - mr.left) - 26);
    var J = mobile ? 0 : 16;
    var hero = $('#accueil');
    var y0 = hero.offsetHeight - (mobile ? 40 : 140);

    var anchors = $$('[data-node]', mainEl).map(function (n) {
      var r = n.getBoundingClientRect();
      return { x: r.left - mr.left, y: Math.round(r.top - mr.top + r.height / 2) };
    }).filter(function (a) { return a.y > y0 + 40; });
    if (!anchors.length) return;

    var yEnd = anchors[anchors.length - 1].y + 60;

    // Piste principale avec décrochements à 45°
    function spine(offset, flip) {
      var x = sx + offset, prevY = y0;
      var d = 'M' + x + ' ' + y0;
      var juncs = [];
      anchors.forEach(function (a, i) {
        var lane = ((i + (flip ? 1 : 0)) % 2) ? J : 0;
        var tx = sx + offset + (flip ? -lane : lane);
        if (tx !== x) {
          var mid = (prevY + a.y) / 2, dx = Math.abs(tx - x);
          d += ' V' + (mid - dx / 2) + ' L' + tx + ' ' + (mid + dx / 2);
          x = tx;
        }
        d += ' V' + a.y;
        juncs.push({ x: x, y: a.y, a: a });
        prevY = a.y;
      });
      d += ' V' + yEnd;
      return { d: d, juncs: juncs };
    }

    var main = spine(0, false);
    var gBase = el('g', {});
    var gTop = el('g', {});
    circuitSvg.appendChild(gBase);
    circuitSvg.appendChild(gTop);

    if (!mobile) {
      // pistes secondaires (décor) : une parallèle à gauche, une à droite
      gBase.appendChild(el('path', { d: spine(-11, true).d, class: 'trace trace--dim' }));
      var rx = W - sx;
      var rd = 'M' + rx + ' ' + (y0 + 60), ry = y0 + 60, rlane = 0;
      anchors.forEach(function (a, i) {
        var target = (i % 2) ? -24 : 0;
        if (target !== rlane) {
          var mid = (ry + a.y) / 2, dx = Math.abs(target - rlane);
          rd += ' V' + (mid - dx / 2) + ' L' + (rx + target) + ' ' + (mid + dx / 2);
          rlane = target;
        }
        rd += ' V' + (a.y + 120);
        ry = a.y + 120;
      });
      gBase.appendChild(el('path', { d: rd, class: 'trace trace--dim' }));
    }

    var mainPath = el('path', { d: main.d, class: 'trace trace--main' });
    var litPath = el('path', { d: main.d, class: 'trace trace--lit' });
    gBase.appendChild(mainPath);
    gBase.appendChild(litPath);

    // Branches vers chaque titre de section + pastilles
    var branches = main.juncs.map(function (j) {
      var endX = j.a.x - 12;
      var g = el('g', {});
      var path = null;
      var padX = j.x, padY = j.y;
      if (endX > j.x + 26) {
        var bd = 'M' + j.x + ' ' + (j.y - 18) + ' L' + (j.x + 18) + ' ' + j.y + ' H' + endX;
        path = el('path', { d: bd, class: 'trace trace--main' });
        g.appendChild(path);
        g.appendChild(el('circle', { cx: j.x, cy: j.y - 18, r: 3.2, class: 'via' }));
        padX = endX + 4;
      }
      var pad = el('circle', { cx: padX, cy: padY, r: mobile ? 4 : 5, class: 'pad' });
      g.appendChild(pad);
      gTop.appendChild(g);
      return { y: j.y, path: path, pad: pad, on: false };
    });

    var spark = el('circle', { r: 3.5, class: 'spark', cx: 0, cy: 0 });
    gTop.appendChild(spark);

    if (!anim) { litPath.style.display = 'none'; spark.style.display = 'none'; return; }

    var L = mainPath.getTotalLength();
    var SEG = 140;
    mainPath.style.strokeDasharray = L + ' ' + L;
    litPath.style.strokeDasharray = SEG + ' ' + (L + SEG);
    branches.forEach(function (b) {
      if (b.path) {
        var bl = b.path.getTotalLength();
        b.len = bl;
        b.path.style.strokeDasharray = bl + ' ' + bl;
        b.path.style.strokeDashoffset = bl;
      }
      G.set(b.pad, { scale: 0, transformOrigin: '50% 50%' });
    });

    function toggleBranch(b, on) {
      b.on = on;
      if (b.path) branchTweens.push(G.to(b.path, { strokeDashoffset: on ? 0 : b.len, duration: on ? 0.6 : 0.3, ease: 'power2.out' }));
      branchTweens.push(G.to(b.pad, { scale: on ? 1 : 0, duration: on ? 0.5 : 0.2, delay: on && b.path ? 0.35 : 0, ease: on ? 'back.out(3)' : 'power1.in' }));
      b.pad.classList.toggle('pad--ok', on);
    }

    var update = function (self) {
      var vh = window.innerHeight;
      var target = self.scroll() + vh * 0.72 - (mainEl.getBoundingClientRect().top + window.scrollY);
      var t = Math.min(1, Math.max(0, (target - y0) / (yEnd - y0)));
      var p = t * L;
      mainPath.style.strokeDashoffset = L - p;
      litPath.style.strokeDashoffset = SEG - p;
      litPath.style.opacity = t > 0 && t < 1 ? '' : '0';
      var pt = mainPath.getPointAtLength(p);
      spark.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      spark.style.opacity = t > 0 && t < 1 ? 1 : 0;
      var tipY = y0 + t * (yEnd - y0);
      branches.forEach(function (b) {
        if (!b.on && tipY >= b.y) toggleBranch(b, true);
        else if (b.on && tipY < b.y - 4) toggleBranch(b, false);
      });
    };

    circuitST = window.ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update(circuitST);
  }

  /* ---------------------------------------------------------
     3. ASSISTANT « QUEL EST VOTRE PROBLÈME ? »
     --------------------------------------------------------- */
  var DIAG = {
    lent: {
      cmd: 'diagnostic --symptome "pc lent"',
      title: 'Diagnostic et remise en forme',
      signs: 'Démarrage interminable, programmes qui mettent du temps à s\'ouvrir, ventilateur qui souffle fort.',
      does: ['Recherche de ce qui ralentit l\'ordinateur', 'Nettoyage des programmes inutiles au démarrage', 'Vérification du disque et de la mémoire', 'Conseil si une pièce mérite d\'être changée'],
      tip: 'Notez quand ça rame (au démarrage, sur internet, tout le temps) : ça aide beaucoup pour le diagnostic.'
    },
    virus: {
      cmd: 'diagnostic --symptome "virus"',
      title: 'Désinfection et sécurisation',
      signs: 'Publicités qui s\'ouvrent toutes seules, page d\'accueil changée, message alarmant qui vous demande d\'appeler ou de payer.',
      does: ['Recherche et suppression des logiciels malveillants', 'Mises à jour de sécurité', 'Vérification du navigateur et des extensions', 'Conseils simples pour repérer les arnaques'],
      tip: 'Ne payez rien, n\'appelez pas le numéro affiché et ne donnez aucun mot de passe. En cas de doute, débranchez internet.'
    },
    noir: {
      cmd: 'diagnostic --symptome "ecran noir"',
      title: 'Diagnostic matériel',
      signs: 'L\'ordinateur ne s\'allume plus, s\'allume sans image, ou s\'éteint tout seul.',
      does: ['Contrôle de l\'alimentation et de l\'écran', 'Test des composants (disque, mémoire, carte graphique)', 'Réparation ou remplacement de la pièce en cause', 'Récupération des données quand c\'est possible'],
      tip: 'Vérifiez la prise, le câble de l\'écran et la multiprise : ça arrive à tout le monde, et parfois ça suffit.'
    },
    wifi: {
      cmd: 'diagnostic --symptome "wifi"',
      title: 'Réseau et Wi-Fi',
      signs: 'Connexion qui coupe, internet très lent dans certaines pièces, appareil qui refuse de se connecter.',
      does: ['Vérification de la box et des réglages', 'Conseil sur l\'emplacement de la box', 'Ajout d\'un répéteur ou d\'un point d\'accès si besoin', 'Connexion de vos appareils (ordinateur, téléphone, imprimante, TV)'],
      tip: 'Éteignez la box trente secondes puis rallumez-la : c\'est souvent la première chose à essayer.'
    },
    imprimante: {
      cmd: 'diagnostic --symptome "imprimante"',
      title: 'Installation et dépannage d\'imprimante',
      signs: 'Elle n\'imprime plus, n\'est pas reconnue, sort des pages blanches, ou le scanner ne répond pas.',
      does: ['Installation des bons pilotes', 'Connexion en Wi-Fi ou par câble', 'Réglage du scanner vers l\'ordinateur', 'Conseil sur un modèle adapté si elle est à remplacer'],
      tip: 'Regardez s\'il y a un message sur l\'imprimante (papier, cartouche, bourrage) et notez-le pour l\'appel.'
    },
    sauvegarde: {
      cmd: 'diagnostic --symptome "sauvegarde"',
      title: 'Mise en place de sauvegardes',
      signs: 'Photos de famille, factures, fichiers clients… et si le disque lâchait demain ?',
      does: ['Inventaire de ce qui est important à garder', 'Sauvegarde sur disque externe ou en ligne, selon vos besoins', 'Sauvegarde automatique, pour ne plus y penser', 'Vérification que la restauration fonctionne'],
      tip: 'Le plus tôt est le mieux : une sauvegarde se prépare avant la panne, pas après.'
    }
  };

  var symptoms = $$('.symptom');
  var typedEl = $('#termTyped');
  var resultEl = $('#diagResult');
  var diagToken = 0;
  var PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  function resultHTML(d) {
    return '' +
      '<div class="res__scan" aria-hidden="true"><span></span></div>' +
      '<p class="res__status res__item"><span class="dot dot--ok" aria-hidden="true"></span> prestation adaptée trouvée</p>' +
      '<h3 class="res__title res__item">' + d.title + '</h3>' +
      '<p class="res__symptoms res__item"><strong>Ça ressemble à ça&nbsp;?</strong> ' + d.signs + '</p>' +
      '<div class="res__grid">' +
        '<div class="res__box res__item"><h4>Ce que Buromedia peut faire</h4><ul>' +
          d.does.map(function (x) { return '<li>' + x + '</li>'; }).join('') +
        '</ul></div>' +
        '<div class="res__box res__box--tip res__item"><h4>En attendant</h4><p>' + d.tip + '</p></div>' +
      '</div>' +
      '<div class="res__foot res__item">' +
        '<a class="btn btn--ok" href="#contact">' + PHONE + '<span>Appeler · <span class="tbc tbc--inline">[à compléter]</span></span></a>' +
        '<span class="res__price">tarif&nbsp;: <span class="tbc">[à compléter]</span></span>' +
      '</div>';
  }

  function showDiag(key) {
    var d = DIAG[key];
    if (!d) return;
    var token = ++diagToken;
    symptoms.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.key === key)); });

    if (!anim) {
      typedEl.textContent = d.cmd;
      resultEl.innerHTML = resultHTML(d);
      return;
    }

    // efface l'ancienne réponse, tape la commande, puis révèle
    G.killTweensOf('.res__item, .res__scan span');
    G.to(resultEl, {
      opacity: 0, y: 8, duration: 0.18, ease: 'power1.in', onComplete: function () {
        if (token !== diagToken) return;
        resultEl.innerHTML = resultHTML(d);
        G.set(resultEl, { opacity: 1, y: 0 });
        G.set('.res__item', { opacity: 0, y: 16 });
        G.set('.res__scan span', { scaleX: 0, transformOrigin: '0% 50%' });
        typedEl.textContent = '';
        var n = 0;
        (function type() {
          if (token !== diagToken) return;
          n += 2;
          typedEl.textContent = d.cmd.slice(0, n);
          if (n < d.cmd.length) { setTimeout(type, 16); return; }
          G.timeline()
            .to('.res__scan span', { scaleX: 1, duration: 0.45, ease: 'power2.inOut' })
            .to('.res__scan', { opacity: 0, duration: 0.2 })
            .to('.res__item', { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'expo.out' }, '-=0.15');
        })();
      }
    });
  }

  symptoms.forEach(function (b) {
    b.addEventListener('click', function () { showDiag(b.dataset.key); });
  });

  /* ---------------------------------------------------------
     4. VENTE DE MATÉRIEL — le portable s'ouvre
     --------------------------------------------------------- */
  var shopTl = null;
  function buildShop() {
    if (!anim) return;
    var stage = $('.shop__stage');
    var lid = $('.laptop__lid');
    var ui = $('.laptop__ui');
    var cats = $$('.cat');
    if (!stage || !lid) return;
    if (shopTl) { shopTl.scrollTrigger && shopTl.scrollTrigger.kill(); shopTl.kill(); shopTl = null; }
    G.set([lid, ui].concat(cats), { clearProps: 'transform,opacity' });

    // mesures sans aucune transformation
    var sr = $('.laptop__screen').getBoundingClientRect();
    var cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
    var offsets = cats.map(function (c) {
      var r = c.getBoundingClientRect();
      return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
    });

    G.set(lid, { rotationX: -84, transformOrigin: '50% 100%' });
    G.set(ui, { opacity: 0 });
    cats.forEach(function (c, i) { G.set(c, { x: offsets[i].x, y: offsets[i].y, scale: 0.15, opacity: 0 }); });

    shopTl = G.timeline({
      scrollTrigger: { trigger: stage, start: 'top 72%', toggleActions: 'play none none reverse' }
    });
    shopTl.to(lid, { rotationX: 0, duration: 1.1, ease: 'power3.out' })
      .to(ui, { opacity: 1, duration: 0.45, ease: 'steps(5)' }, 0.7)
      .to(cats, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.85, stagger: 0.08, ease: 'back.out(1.3)' }, 0.95);
  }

  /* ---------------------------------------------------------
     5. CARTE DU SECTEUR — tracés + villes (pulse en CSS)
     --------------------------------------------------------- */
  function buildMap() {
    if (!anim) return;
    var svg = $('.map__svg');
    if (!svg) return;
    var draws = $$('.map__draw', svg);
    draws.forEach(function (p) {
      var l = p.getTotalLength();
      p.style.strokeDasharray = l + ' ' + l;
      p.style.strokeDashoffset = l;
    });
    G.set('.map .town', { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
    G.set('.map__radius', { scale: 0, opacity: 0, svgOrigin: '384 259' });
    G.set('.map__home-label, .map__radius-label', { opacity: 0, y: 8 });
    G.timeline({ scrollTrigger: { trigger: svg, start: 'top 75%', once: true } })
      .to(draws, { strokeDashoffset: 0, duration: 1.4, stagger: 0.06, ease: 'power2.inOut' })
      .to('.map__radius', { scale: 1, opacity: 0.7, duration: 1.2, ease: 'expo.out' }, 0.3)
      .to('.map .town', { opacity: 1, scale: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(2)' }, 0.5)
      .to('.map__home-label', { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.9)
      .to('.map__radius-label', { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 1.2);
  }

  /* ---------------------------------------------------------
     Révélations au scroll + micro-interactions
     --------------------------------------------------------- */
  function buildReveals() {
    if (!anim) return;
    G.set('[data-reveal]', { opacity: 0, y: 28 });
    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        G.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out', overwrite: true });
      }
    });
    // apparition des pictos de symptômes en cascade
    G.from('.symptom', {
      opacity: 0, y: 20, scale: 0.96, duration: 0.6, stagger: 0.06, ease: 'expo.out',
      scrollTrigger: { trigger: '.diag__symptoms', start: 'top 85%', once: true }
    });
  }

  /* ---------------------------------------------------------
     Initialisation + reconstruction au redimensionnement
     --------------------------------------------------------- */
  buildReveals();
  buildShop();
  buildMap();

  var lastW = window.innerWidth;
  var rebuildCircuit = debounce(function () {
    buildCircuit();
    if (anim) window.ScrollTrigger.refresh();
  }, 180);

  var start = function () {
    buildCircuit();
    if (anim) window.ScrollTrigger.refresh();
    if ('ResizeObserver' in window) {
      var lastH = mainEl.offsetHeight;
      new ResizeObserver(function () {
        var h = mainEl.offsetHeight;
        if (Math.abs(h - lastH) > 2) { lastH = h; rebuildCircuit(); }
      }).observe(mainEl);
    }
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();

  window.addEventListener('resize', debounce(function () {
    if (window.innerWidth === lastW) return; // barre d'adresse mobile : on ignore
    lastW = window.innerWidth;
    buildShop();
    buildCircuit();
    if (anim) window.ScrollTrigger.refresh();
  }, 200));
})();
