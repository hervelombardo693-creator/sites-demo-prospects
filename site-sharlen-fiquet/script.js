/* ==========================================================================
   Sharlen Fiquet, Fleuriste — motion design
   - Fleurs SVG générées (pivoine, renoncule, rose, anémone, tulipe, cosmos, eucalyptus)
   - Hero qui éclot, pétales en canvas, univers en défilement horizontal,
     « Composez votre bouquet », transitions feuille.
   ========================================================================== */
(function () {
  'use strict';
  window.__sfReady = true;

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGSAP && !reduce;
  if (!motion) root.classList.remove('motion');
  if (hasGSAP) { gsap.registerPlugin(ScrollTrigger); gsap.config({ nullTargetWarn: false }); }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var r1 = function (n) { return Math.round(n * 10) / 10; };

  /* ------------------------------------------------------------------------
     1. BIBLIOTHÈQUE DE FLEURS (chaînes SVG, centrées en 0,0, rayon ≈ 45)
     ------------------------------------------------------------------------ */
  var T = {
    ruffle: 'M0,0 C-26,-6 -34,-30 -20,-42 C-14,-46 -10,-40 -6,-46 C-2,-50 2,-50 6,-46 C10,-40 14,-46 20,-42 C34,-30 26,-6 0,0Z',
    round: 'M0,0 C-24,-4 -28,-34 -9,-42 C-3,-44.5 3,-44.5 9,-42 C28,-34 24,-4 0,0Z',
    broad: 'M0,0 C-30,-6 -32,-38 -12,-44 C-4,-46 4,-46 12,-44 C32,-38 30,-6 0,0Z',
    cup: 'M0,0 C-18,-3 -21,-27 -1,-31 C19,-27 18,-3 0,0Z',
    long: 'M0,0 C-9,-8 -11,-34 -6,-44 L-2,-40 L0,-45 L2,-40 L6,-44 C11,-34 9,-8 0,0Z'
  };

  function ring(tpl, n, s, off, fill, stroke) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = off + (i * 360) / n;
      out += '<g transform="rotate(' + r1(a) + ')"><g transform="scale(' + s + ')"><path class="petal" d="' + tpl +
        '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.9" stroke-opacity="0.35" vector-effect="non-scaling-stroke"/></g></g>';
    }
    return out;
  }
  function dots(n, rad, r, fill, off) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = ((off || 0) + (i * 360) / n) * Math.PI / 180;
      out += '<circle class="core" cx="' + r1(Math.cos(a) * rad) + '" cy="' + r1(Math.sin(a) * rad) + '" r="' + r + '" fill="' + fill + '"/>';
    }
    return out;
  }

  var F = {
    pivoine: function (p) {
      return ring(T.ruffle, 8, 1, 0, p.b, p.c) + ring(T.ruffle, 7, 0.82, 25, p.a, p.c) +
        ring(T.round, 6, 0.64, 8, p.d, p.c) + ring(T.cup, 6, 0.58, 35, p.a, p.c) +
        ring(T.cup, 5, 0.42, 10, p.b, p.c) + ring(T.cup, 4, 0.27, 45, p.c, p.c);
    },
    renoncule: function (p) {
      return ring(T.cup, 12, 1.25, 0, p.b, p.c) + ring(T.cup, 11, 1.05, 15, p.a, p.c) +
        ring(T.cup, 10, 0.86, 5, p.d, p.c) + ring(T.cup, 9, 0.68, 20, p.a, p.c) +
        ring(T.cup, 8, 0.5, 8, p.b, p.c) + ring(T.cup, 7, 0.34, 25, p.a, p.c) +
        '<circle class="core" r="4.5" fill="#8B9C5A"/><circle class="core" r="2" fill="#647540"/>';
    },
    rose: function (p) {
      return ring(T.broad, 5, 1, 0, p.b, p.c) + ring(T.round, 5, 0.8, 36, p.a, p.c) +
        ring(T.cup, 4, 0.56, 10, p.d, p.c) +
        '<circle class="core" r="11" fill="' + p.a + '"/>' +
        '<path class="core" d="M-8,1 C-8,-8 6,-10 9,-2 C11,5 3,10 -3,7 C-8,4 -5,-4 1,-4 C5,-4 6,1 2,3" fill="none" stroke="' + p.c + '" stroke-width="1.6" stroke-linecap="round"/>';
    },
    anemone: function (p) {
      return ring(T.broad, 6, 1, 0, p.d, p.c) + ring(T.broad, 6, 0.86, 30, p.a, p.c) +
        dots(16, 15, 1.6, '#2E2629') +
        '<circle class="core" r="11" fill="#2E2629"/><circle class="core" r="5.5" fill="#4A3F44"/>';
    },
    tulipe: function (p) {
      var st = '" stroke="' + p.c + '" stroke-width="0.9" stroke-opacity="0.35" vector-effect="non-scaling-stroke"/>';
      return '<path class="petal" d="M0,16 C-22,14 -30,-12 -18,-38 C-8,-30 -2,-16 0,-4Z" fill="' + p.b + st +
        '<path class="petal" d="M0,16 C22,14 30,-12 18,-38 C8,-30 2,-16 0,-4Z" fill="' + p.b + st +
        '<path class="petal" d="M0,18 C-17,14 -19,-18 0,-40 C19,-18 17,14 0,18Z" fill="' + p.a + st +
        '<path class="core" d="M0,10 C-2,-6 -2,-20 0,-32" fill="none" stroke="' + p.d + '" stroke-width="1.5" stroke-opacity=".7" stroke-linecap="round"/>';
    },
    cosmos: function (p) {
      return ring(T.long, 8, 1, 0, p.a, p.c) + ring(T.long, 8, 0.7, 22, p.d, p.c) +
        '<circle class="core" r="9" fill="#D8A73C"/>' + dots(10, 5.5, 1.3, '#A97B22');
    },
    bouton: function (p) {
      return '<path class="petal" d="M0,6 C-11,2 -12,-16 0,-24 C12,-16 11,2 0,6Z" fill="' + p.a + '"/>' +
        '<path class="leaf" d="M0,6 C-8,4 -12,-4 -10,-10 C-6,-4 -2,0 0,6Z"/><path class="leaf" d="M0,6 C8,4 12,-4 10,-10 C6,-4 2,0 0,6Z"/>';
    }
  };

  function flower(type, pal) { return '<g class="flower">' + F[type](pal) + '</g>'; }
  function place(inner, x, y, s, rot, cls) {
    return '<g transform="translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + (rot || 0) + ') scale(' + (s || 1) + ')"><g class="head ' + (cls || '') + '">' + inner + '</g></g>';
  }
  /* rameau d'eucalyptus : tige courbe + feuilles rondes */
  function sprig(len, bend, r, n) {
    var s = '<path class="stem stem--thin sprig-stem" d="M0,0 Q' + bend + ',' + (-len / 2) + ' 0,' + (-len) + '"/>';
    for (var i = 0; i < n; i++) {
      var t = 0.16 + (0.84 * i) / (n - 1);
      var x = 2 * (1 - t) * t * bend;
      var y = -(2 * (1 - t) * t * (len / 2) + t * t * len);
      var side = i % 2 ? 1 : -1;
      var rr = r * (1 - t * 0.45);
      s += '<ellipse class="euc-leaf' + (i % 3 === 0 ? ' euc-leaf--b' : '') + '" cx="' + r1(x + side * rr * 0.95) + '" cy="' + r1(y) + '" rx="' + r1(rr) + '" ry="' + r1(rr * 0.86) + '"/>';
    }
    return s;
  }
  function placeSprig(x, y, rot, len, bend, r, n, s) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (s || 1) + ')"><g class="sprig">' + sprig(len, bend, r, n) + '</g></g>';
  }
  /* feuille pointue posée sur une tige */
  function stemLeaf(x, y, rot, s, deep) {
    return '<g transform="translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + r1(rot) + ') scale(' + (s || 1) + ')"><path class="leaf' + (deep ? ' leaf--deep' : '') + '" d="M0,0 C10,-9 24,-11 38,-4 C24,5 10,5 0,0Z"/></g>';
  }
  function quad(p0, p1, p2, t) {
    var u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
  }
  function stemPath(bx, by, x, y, bendK) {
    var cx = (bx + x) / 2 + (x - bx) * (bendK == null ? 0.2 : bendK);
    var cy = (by + y) / 2 + 50;
    return { d: 'M' + bx + ',' + by + ' Q' + r1(cx) + ',' + r1(cy) + ' ' + x + ',' + y, c: [cx, cy] };
  }

  /* palettes fixes pour les illustrations */
  var PAL = {
    powder: { a: '#EFC3BE', b: '#E2A7A6', c: '#B9737A', d: '#F8E2DE' },
    blush: { a: '#F6D9D3', b: '#ECC1BA', c: '#C48A86', d: '#FDF0EC' },
    cream: { a: '#F5ECDD', b: '#E9D9C0', c: '#B9A07E', d: '#FFFBF4' },
    peach: { a: '#F4C9AA', b: '#EBAE8C', c: '#C27552', d: '#FBE4D3' },
    white: { a: '#FBF8F3', b: '#EEE7DD', c: '#A99D90', d: '#FFFFFF' },
    wine: { a: '#8E2A3D', b: '#6B1D2C', c: '#3E0F19', d: '#B4505E' },
    rose: { a: '#D99A9C', b: '#C57E83', c: '#8F4B55', d: '#EBC0BF' }
  };

  /* ------------------------------------------------------------------------
     2. HERO : le bouquet qui éclot
     ------------------------------------------------------------------------ */
  var heroSvg = $('#hero-bouquet');
  var heroTl = null;
  function buildHero() {
    if (!heroSvg) return;
    var B = [300, 735];
    var heads = [
      { t: 'rose', x: 172, y: 212, s: 1.15, p: PAL.blush, r: -12 },
      { t: 'cosmos', x: 378, y: 118, s: 0.85, p: PAL.rose, r: 10 },
      { t: 'renoncule', x: 452, y: 258, s: 1.2, p: PAL.peach, r: 8 },
      { t: 'renoncule', x: 146, y: 392, s: 1.38, p: PAL.powder, r: -20 },
      { t: 'anemone', x: 452, y: 446, s: 1.12, p: PAL.white, r: 14 },
      { t: 'pivoine', x: 296, y: 302, s: 2.2, p: PAL.powder, r: 0 }
    ];
    var buds = [{ x: 92, y: 250, s: 1.2, r: -30 }, { x: 520, y: 150, s: 1.05, r: 28 }, { x: 262, y: 120, s: 0.9, r: -6 }];

    var sprigs = placeSprig(300, 700, -44, 380, 30, 13, 12) + placeSprig(300, 700, -18, 320, -24, 12, 11) +
      placeSprig(300, 700, 26, 360, 26, 13, 12) + placeSprig(300, 700, 54, 260, -18, 11, 9) +
      placeSprig(300, 700, -64, 230, 22, 10, 8, 0.9);

    var stems = '', leaves = '', headsStr = '';
    buds.forEach(function (b, i) {
      var sp = stemPath(B[0], B[1], b.x, b.y + 10, 0.1);
      stems += '<path class="stem stem--thin" d="' + sp.d + '"/>';
      headsStr += place(flower('bouton', PAL.rose), b.x, b.y, b.s, b.r, 'bud');
    });
    heads.forEach(function (h, i) {
      var sp = stemPath(B[0], B[1], h.x, h.y);
      stems += '<path class="stem" d="' + sp.d + '"/>';
      if (i % 2 === 0) {
        var p = quad(B, sp.c, [h.x, h.y], 0.5);
        leaves += stemLeaf(p[0], p[1], h.x < 300 ? 200 : -20, 1.3, i === 2);
      }
      headsStr += place(flower(h.t, h.p), h.x, h.y, h.s, h.r);
    });

    var bow = '<g class="bow" transform="translate(300 668)">' +
      '<path d="M0,0 C-30,-26 -62,-12 -54,8 C-48,22 -20,12 0,0Z" fill="#6B1D2C"/>' +
      '<path d="M0,0 C30,-26 62,-12 54,8 C48,22 20,12 0,0Z" fill="#7E2636"/>' +
      '<path d="M-4,2 C-14,24 -22,44 -30,62" fill="none" stroke="#6B1D2C" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M4,2 C12,26 22,44 34,58" fill="none" stroke="#7E2636" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse rx="9" ry="7" fill="#561522"/></g>';

    heroSvg.insertAdjacentHTML('beforeend',
      '<g class="hero-sway"><g class="hero-layer hero-layer--back">' + sprigs + '</g>' +
      '<g class="hero-layer hero-layer--stems">' + stems + leaves + '</g>' +
      '<g class="hero-layer hero-layer--heads">' + headsStr + '</g>' + bow + '</g>');
  }

  function bloom(scope, opts) {
    // éclosion : pétales intérieurs d'abord, puis déploiement vers l'extérieur
    opts = opts || {};
    var tl = gsap.timeline({ delay: opts.delay || 0 });
    var flowers = $$('.flower', scope);
    flowers.forEach(function (f, i) {
      var petals = $$('.petal', f);
      var cores = $$('.core', f);
      var leafs = $$('.leaf', f);
      var at = (opts.start || 0) + i * (opts.gap == null ? 0.22 : opts.gap);
      tl.fromTo(petals, { scale: 0, rotation: -38, opacity: 0, transformOrigin: '50% 100%'}, {
        scale: 1, rotation: 0, opacity: 1, transformOrigin: '50% 100%',
        duration: opts.dur || 1.2, ease: 'back.out(1.5)', stagger: { each: opts.each || 0.028, from: 'end' }
      }, at);
      if (cores.length) tl.fromTo(cores, { scale: 0, opacity: 0, transformOrigin: '50% 50%'}, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)', stagger: 0.01 }, at + 0.05);
      if (leafs.length) tl.fromTo(leafs, { scale: 0, opacity: 0, transformOrigin: '50% 100%'}, { scale: 1, opacity: 1, transformOrigin: '50% 100%', duration: 0.7, ease: 'back.out(2)' }, at);
    });
    return tl;
  }
  function drawStems(paths, tl, at, dur, each) {
    paths.forEach(function (p) {
      var L = p.getTotalLength();
      p.style.strokeDasharray = L + ' ' + L;
      p.style.strokeDashoffset = L;
    });
    tl.to(paths, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', stagger: each }, at);
    tl.add(function () { paths.forEach(function (p) { p.style.strokeDasharray = 'none'; }); }, '>');
  }

  function animateHero() {
    if (!heroSvg) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl = tl;
    tl.to('.hero__title .line > span', { y: 0, yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out' }, 0.15);
    tl.to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.55);

    var stems = $$('.hero-layer--stems .stem, .hero-layer--back .sprig-stem', heroSvg);
    drawStems(stems, tl, 0.2, 1.6, 0.06);
    tl.fromTo($$('.euc-leaf', heroSvg), { scale: 0, opacity: 0, transformOrigin: '50% 50%'}, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2.4)', stagger: { each: 0.012, from: 'start' } }, 0.9);
    tl.fromTo($$('.hero-layer--stems .leaf', heroSvg), { scale: 0, opacity: 0, transformOrigin: '0% 50%'}, { scale: 1, opacity: 1, transformOrigin: '0% 50%', duration: 0.9, ease: 'back.out(1.8)', stagger: 0.12 }, 1.2);
    tl.add(bloom($('.hero-layer--heads', heroSvg), { gap: 0.2, dur: 1.3, each: 0.03 }), 1.3);
    tl.from($('.bow', heroSvg), { scale: 0, rotation: -30, transformOrigin: '50% 50%', duration: 1, ease: 'back.out(2)' }, 1.5);

    tl.add(function () {
      gsap.to($('.hero-sway', heroSvg), { rotation: 1.4, svgOrigin: '300 735', duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      $$('.hero-layer--heads .head', heroSvg).forEach(function (h, i) {
        gsap.to(h, { scale: 1.035, rotation: (i % 2 ? 3 : -3), transformOrigin: '50% 50%', duration: 2.6 + (i % 3) * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2 });
      });
    });

    // parallaxe au curseur
    var hero = $('.hero');
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var layers = [
        { el: $('.hero-layer--back', heroSvg), k: 10 },
        { el: $('.hero-layer--heads', heroSvg), k: 22 },
        { el: $('.hero__halo'), k: -14 }
      ].map(function (l) { return { qx: gsap.quickTo(l.el, 'x', { duration: 1.2, ease: 'power3' }), qy: gsap.quickTo(l.el, 'y', { duration: 1.2, ease: 'power3' }), k: l.k }; });
      hero.addEventListener('pointermove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach(function (l) { l.qx(nx * l.k); l.qy(ny * l.k * 0.6); });
      });
    }
    // sortie au scroll
    gsap.to('.hero__art', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__text', { yPercent: -10, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });
  }

  /* ------------------------------------------------------------------------
     3. UNIVERS : illustrations des cartes
     ------------------------------------------------------------------------ */
  var ILLU = {
    compositions: function () {
      return placeSprig(160, 250, -58, 150, 14, 9, 8) + placeSprig(160, 250, 60, 140, -14, 9, 8) + placeSprig(160, 250, -20, 175, 10, 9, 9) +
        place(flower('anemone', PAL.white), 112, 140, 0.72, 10) + place(flower('cosmos', PAL.wine), 214, 128, 0.62, -12) +
        place(flower('renoncule', PAL.rose), 92, 205, 0.82, -10) + place(flower('rose', PAL.wine), 228, 200, 0.86, 18) +
        place(flower('pivoine', PAL.cream), 160, 182, 1.2, 0) +
        '<path d="M118,236 C100,282 108,330 130,350 L190,350 C212,330 220,282 202,236Z" fill="#FBF6EF" fill-opacity=".72" stroke="#B9A07E" stroke-opacity=".5"/>' +
        '<path d="M126,252 C118,284 122,318 136,338" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>';
    },
    plantes: function () {
      var leaf = function (rot, s, c) {
        return '<g transform="translate(160 262) rotate(' + rot + ') scale(' + s + ')"><g class="flower"><path class="petal" d="M0,0 C-6,-30 -2,-60 0,-70 C-38,-74 -60,-118 -34,-150 C-20,-166 -6,-160 0,-150 C6,-160 20,-166 34,-150 C60,-118 38,-74 0,-70 C2,-60 6,-30 0,0Z" fill="' + c + '"/>' +
          '<path class="core" d="M0,-70 C0,-100 0,-128 0,-150 M0,-94 C-14,-104 -26,-110 -40,-112 M0,-112 C14,-122 26,-128 38,-128 M0,-128 C-12,-136 -20,-142 -28,-148" fill="none" stroke="#DCE6DF" stroke-width="2" stroke-linecap="round" opacity=".7"/></g></g>';
      };
      return leaf(-52, 0.85, '#4C6A5C') + leaf(48, 0.8, '#5E7F6E') + leaf(-14, 1.05, '#3E5A4D') + leaf(18, 0.9, '#6F9180') +
        '<path d="M100,350 L110,276 L210,276 L220,350Z" fill="#C98A6B"/><rect x="98" y="262" width="124" height="20" rx="4" fill="#B77657"/>' +
        '<path d="M120,300 C150,292 172,306 204,296" fill="none" stroke="#E2B095" stroke-width="2" opacity=".6"/>';
    },
    decoration: function () {
      var candle = function (x, h) {
        return '<rect x="' + (x - 9) + '" y="' + (270 - h) + '" width="18" height="' + h + '" rx="3" fill="#FBF6EF" stroke="#D9C7AE"/>' +
          '<path d="M' + x + ',' + (270 - h) + ' v-8" stroke="#2A2123" stroke-width="1.5"/>' +
          '<g class="flame" transform="translate(' + x + ' ' + (262 - h) + ')"><path d="M0,0 C-7,-6 -6,-16 0,-24 C6,-16 7,-6 0,0Z" fill="#E7B65A"/><path d="M0,-2 C-3,-6 -3,-11 0,-15 C3,-11 3,-6 0,-2Z" fill="#FBF0D0"/></g>';
      };
      return '<path d="M20,300 H300" stroke="#B9A07E" stroke-width="2" opacity=".5"/>' + candle(58, 120) + candle(266, 96) +
        placeSprig(160, 268, -82, 130, 10, 8, 8) + placeSprig(160, 268, 82, 130, -10, 8, 8) + placeSprig(160, 264, -60, 90, 8, 7, 6) + placeSprig(160, 264, 62, 90, -8, 7, 6) +
        place(flower('renoncule', PAL.peach), 104, 244, 0.62, 0) + place(flower('rose', PAL.blush), 214, 242, 0.66, 0) +
        place(flower('cosmos', PAL.rose), 130, 214, 0.5, 0) + place(flower('pivoine', PAL.powder), 165, 232, 0.86, 0) +
        '<path d="M108,268 H212 L200,296 H120Z" fill="#E8D6BF" stroke="#B9A07E" stroke-opacity=".5"/>';
    },
    mariages: function () {
      var gyp = '';
      [[96, 140], [222, 132], [108, 230], [214, 238], [160, 108], [84, 190], [238, 188]].forEach(function (p) {
        gyp += '<circle class="core" cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="#fff"/><circle class="core" cx="' + (p[0] + 6) + '" cy="' + (p[1] - 4) + '" r="2.4" fill="#fff"/><circle class="core" cx="' + (p[0] - 5) + '" cy="' + (p[1] + 5) + '" r="2" fill="#fff"/>';
      });
      return '<path d="M150,250 L142,342 M160,250 L160,346 M170,250 L178,342" stroke="#6F8F7E" stroke-width="5" stroke-linecap="round"/>' +
        placeSprig(160, 230, -64, 120, 10, 8, 7) + placeSprig(160, 230, 66, 120, -10, 8, 7) +
        place(flower('rose', PAL.cream), 110, 168, 0.8, -12) + place(flower('rose', PAL.cream), 212, 166, 0.8, 16) +
        place(flower('renoncule', PAL.blush), 126, 218, 0.72, 0) + place(flower('renoncule', PAL.blush), 198, 216, 0.72, 0) +
        place(flower('pivoine', PAL.white), 160, 182, 1.05, 0) + gyp +
        '<path d="M144,262 C120,290 112,320 122,352" fill="none" stroke="#F7E7E2" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M176,262 C196,292 212,318 206,352" fill="none" stroke="#EFD6D0" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M160,262 C140,240 118,246 124,262 C130,276 152,268 160,262Z M160,262 C180,240 202,246 196,262 C190,276 168,268 160,262Z" fill="#F7E7E2" stroke="#D49C9A" stroke-opacity=".5"/>' +
        '<g fill="none" stroke="#C9A45C" stroke-width="3"><circle cx="252" cy="320" r="13"/><circle cx="270" cy="320" r="13"/></g>';
    },
    deuil: function () {
      var out = '', cx = 160, cy = 172, R = 96, i;
      for (i = 0; i < 34; i++) {
        var a = (i / 34) * Math.PI * 2, rr = R + (i % 2 ? 9 : -9);
        out += '<ellipse class="euc-leaf' + (i % 3 ? '' : ' euc-leaf--b') + '" cx="' + r1(cx + Math.cos(a) * rr) + '" cy="' + r1(cy + Math.sin(a) * rr) + '" rx="13" ry="11"/>';
      }
      var types = ['anemone', 'rose', 'renoncule'];
      for (i = 0; i < 9; i++) {
        var b = (i / 9) * Math.PI * 2 - Math.PI / 2;
        out += place(flower(types[i % 3], i % 3 === 2 ? PAL.cream : PAL.white), cx + Math.cos(b) * R, cy + Math.sin(b) * R, i % 3 === 0 ? 0.62 : 0.54, i * 40);
      }
      out += '<path d="M150,262 C136,290 128,316 120,346 L136,340 L142,352 C150,322 158,294 160,266Z" fill="#7A6E86"/>' +
        '<path d="M170,262 C184,290 192,316 200,346 L184,340 L178,352 C170,322 162,294 160,266Z" fill="#8C819A"/>' +
        '<ellipse cx="160" cy="262" rx="12" ry="9" fill="#675B73"/>';
      return out;
    }
  };
  function buildUnivers() {
    $$('[data-illu]').forEach(function (svg) {
      var f = ILLU[svg.getAttribute('data-illu')];
      if (f) svg.insertAdjacentHTML('beforeend', f());
    });
  }

  /* ------------------------------------------------------------------------
     4. COMPOSEZ VOTRE BOUQUET
     ------------------------------------------------------------------------ */
  var FLOWERS = [
    { id: 'pivoine', label: 'Pivoine', k: 1.05 },
    { id: 'renoncule', label: 'Renoncule', k: 0.82 },
    { id: 'rose', label: 'Rose de jardin', k: 0.9 },
    { id: 'anemone', label: 'Anémone', k: 0.86 },
    { id: 'tulipe', label: 'Tulipe', k: 0.92 },
    { id: 'cosmos', label: 'Cosmos', k: 0.78 }
  ];
  var TINTS = [
    { id: 'poudre', label: 'Rose poudré', name: 'Aube poudrée', a: '#EFC3BE', b: '#E2A7A6', c: '#B9737A', d: '#F8E2DE', ribbon: '#6B1D2C' },
    { id: 'creme', label: 'Crème', name: 'Lin & lumière', a: '#F5ECDD', b: '#E9D9C0', c: '#B9A07E', d: '#FFFCF6', ribbon: '#4C6A5C' },
    { id: 'bordeaux', label: 'Bordeaux', name: 'Velours d’automne', a: '#8E2A3D', b: '#6B1D2C', c: '#3E0F19', d: '#B4505E', ribbon: '#EBC9C3' },
    { id: 'peche', label: 'Pêche', name: 'Fin d’été', a: '#F4C2A1', b: '#EBA582', c: '#C27552', d: '#FBE1CF', ribbon: '#6B1D2C' },
    { id: 'lilas', label: 'Lilas', name: 'Heure bleue', a: '#D6C3E0', b: '#BBA1CC', c: '#86699E', d: '#EEE4F3', ribbon: '#4C6A5C' }
  ];
  function variant(t, i) {
    if (i === 1) return { a: t.d, b: t.a, c: t.b, d: '#FFFDFB' };
    if (i === 2) return { a: t.b, b: t.a, c: t.c, d: t.d };
    return { a: t.a, b: t.b, c: t.c, d: t.d };
  }
  var SLOTS = [
    { x: 210, y: 88, s: 0.72, k: 0 }, { x: 262, y: 136, s: 0.9, k: 1 }, { x: 165, y: 140, s: 0.95, k: 2 },
    { x: 210, y: 205, s: 1.28, k: 0 }, { x: 293, y: 240, s: 1.08, k: 2 }, { x: 128, y: 245, s: 1.04, k: 1 },
    { x: 210, y: 300, s: 1.0, k: 0 }, { x: 85, y: 312, s: 0.85, k: 2 }, { x: 338, y: 308, s: 0.85, k: 1 }
  ];
  var GYP = [[120, 170], [300, 180], [210, 145], [168, 262], [254, 270], [96, 230], [330, 246], [250, 90], [170, 96]];

  var state = { picks: ['pivoine', 'renoncule', 'anemone'], tint: 'poudre' };
  var prevSlots = [];
  var bouquetSvg = $('#bouquet-svg');

  function tintObj() { return TINTS.filter(function (t) { return t.id === state.tint; })[0]; }
  function flowerObj(id) { return FLOWERS.filter(function (f) { return f.id === id; })[0]; }

  function renderBouquet(animateAll) {
    if (!bouquetSvg) return;
    var t = tintObj();
    var C = [210, 440];
    var picks = state.picks.length ? state.picks : ['pivoine'];

    var back = '<path d="M210,500 L36,226 C92,198 150,246 210,212 C270,246 328,198 384,226Z" fill="#EADCC6"/>' +
      '<path d="M210,500 L36,226 C60,214 82,214 104,222Z" fill="#E0CFB4"/>';
    var green = placeSprig(210, 430, -52, 290, 26, 13, 12, 1) + placeSprig(210, 430, -24, 330, -20, 12, 12, 1) +
      placeSprig(210, 430, 22, 320, 22, 12, 12, 1) + placeSprig(210, 430, 50, 280, -24, 13, 11, 1);
    var stems = '', heads = '', gyp = '', slotsNow = [];
    SLOTS.forEach(function (s, i) {
      var id = picks[s.k % picks.length];
      var fo = flowerObj(id);
      var idx = picks.indexOf(id);
      var pal = variant(t, idx);
      slotsNow.push(id);
      var sp = stemPath(C[0], C[1], s.x, s.y, 0.08);
      stems += '<path class="stem b-stem" d="' + sp.d + '"/>';
      var changed = animateAll || prevSlots[i] !== id;
      heads += place(flower(id, pal), s.x, s.y, s.s * fo.k, ((i * 37) % 50) - 25, changed ? 'is-new' : '');
    });
    GYP.forEach(function (p) {
      gyp += '<g class="gyp"><circle class="core" cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#fff"/><circle class="core" cx="' + (p[0] + 6) + '" cy="' + (p[1] - 5) + '" r="2.3" fill="#fff"/><circle class="core" cx="' + (p[0] - 5) + '" cy="' + (p[1] + 4) + '" r="2" fill="#fff"/></g>';
    });
    var front = '<path d="M210,506 L92,326 C138,350 176,334 210,348 C244,334 282,350 328,326Z" fill="#F3E8D8"/>' +
      '<path d="M210,506 L150,340 M210,506 L268,338" stroke="#DCC9AC" stroke-width="1.4" fill="none"/>' +
      '<path d="M200,506 L196,532 M210,506 L210,536 M220,506 L225,531" stroke="#5D7B6C" stroke-width="4" stroke-linecap="round"/>';
    var bow = '<g class="b-bow" transform="translate(210 438)">' +
      '<path d="M0,0 C-26,-22 -54,-10 -47,7 C-42,19 -18,10 0,0Z" fill="' + t.ribbon + '"/>' +
      '<path d="M0,0 C26,-22 54,-10 47,7 C42,19 18,10 0,0Z" fill="' + t.ribbon + '" opacity=".88"/>' +
      '<path d="M-3,2 C-12,20 -18,36 -26,52 M3,2 C10,22 18,36 28,48" fill="none" stroke="' + t.ribbon + '" stroke-width="6" stroke-linecap="round"/>' +
      '<ellipse rx="8" ry="6" fill="' + t.ribbon + '" stroke="rgba(0,0,0,.15)"/></g>';

    // le titre accessible reste en premier enfant
    var title = bouquetSvg.querySelector('title');
    bouquetSvg.innerHTML = '';
    if (title) bouquetSvg.appendChild(title);
    bouquetSvg.insertAdjacentHTML('beforeend', back + '<g class="b-green">' + green + '</g><g class="b-stems">' + stems + '</g><g class="b-heads">' + heads + '</g>' + gyp + front + bow);

    var labels = picks.map(function (id) { return flowerObj(id).label.toLowerCase(); });
    var list = labels.length > 1 ? labels.slice(0, -1).join(', ') + ' & ' + labels[labels.length - 1] : labels[0];
    list = list.charAt(0).toUpperCase() + list.slice(1);
    $('#bouquet-name').textContent = '« ' + t.name + ' »';
    $('#bouquet-desc').textContent = list + ', en ' + t.label.toLowerCase() + '.';
    if (title) title.textContent = 'Votre bouquet illustré : ' + list + ', teinte ' + t.label.toLowerCase();

    if (motion) {
      var fresh = $$('.head.is-new', bouquetSvg);
      var tl = gsap.timeline();
      if (animateAll) {
        drawStems($$('.b-stems .stem, .b-green .sprig-stem', bouquetSvg), tl, 0, 1.1, 0.03);
        tl.fromTo($$('.b-green .euc-leaf', bouquetSvg), { scale: 0, transformOrigin: '50% 50%'}, { scale: 1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)', stagger: 0.008 }, 0.3);
      }
      fresh.forEach(function (h, i) {
        tl.add(bloom(h, { gap: 0, dur: 0.95, each: 0.018 }), (animateAll ? 0.5 : 0) + i * 0.08);
      });
      tl.fromTo($$('.gyp', bouquetSvg), { scale: 0.4, opacity: 0, transformOrigin: '50% 50%'}, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.03, ease: 'back.out(2)' }, animateAll ? 0.9 : 0.15);
      tl.fromTo($('.b-bow', bouquetSvg), { scale: 0.6, rotation: -14, transformOrigin: '50% 50%'}, { scale: 1, rotation: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'elastic.out(1, .5)' }, animateAll ? 1 : 0.1);
      gsap.fromTo('.composer__card', { rotation: -2, y: 0 }, { keyframes: [{ rotation: 1, y: -6, duration: 0.25 }, { rotation: -2, y: 0, duration: 0.6, ease: 'elastic.out(1,.4)' }] });
    }
    prevSlots = slotsNow;
  }

  function miniFlower(id) {
    return '<svg viewBox="-52 -52 104 104" aria-hidden="true">' + flower(id, variant(tintObj(), 0)) + '</svg>';
  }
  function buildComposer() {
    var picksEl = $('#flower-picks'), tintsEl = $('#tints');
    if (!picksEl || !tintsEl) return;
    picksEl.innerHTML = FLOWERS.map(function (f) {
      return '<button type="button" class="flower-pick" data-id="' + f.id + '" aria-pressed="false">' + miniFlower(f.id) +
        '<span>' + f.label + '</span><span class="flower-pick__badge" aria-hidden="true"></span></button>';
    }).join('');
    tintsEl.innerHTML = TINTS.map(function (t) {
      return '<div class="tint"><input type="radio" name="tint" id="tint-' + t.id + '" value="' + t.id + '"' + (t.id === state.tint ? ' checked' : '') + '>' +
        '<label for="tint-' + t.id + '"><span class="tint__sw" style="background: radial-gradient(circle at 35% 35%, ' + t.d + ', ' + t.a + ' 55%, ' + t.b + ')"></span>' + t.label + '</label></div>';
    }).join('');

    function syncPicks() {
      $$('.flower-pick', picksEl).forEach(function (b) {
        var i = state.picks.indexOf(b.getAttribute('data-id'));
        b.setAttribute('aria-pressed', i > -1 ? 'true' : 'false');
        $('.flower-pick__badge', b).textContent = i > -1 ? String(i + 1) : '';
      });
      $('#flower-count').textContent = state.picks.length + ' / 3';
    }
    function refreshIcons() {
      $$('.flower-pick', picksEl).forEach(function (b) {
        var old = $('svg', b);
        old.insertAdjacentHTML('afterend', miniFlower(b.getAttribute('data-id')));
        old.remove();
      });
    }
    picksEl.addEventListener('click', function (e) {
      var b = e.target.closest('.flower-pick');
      if (!b) return;
      var id = b.getAttribute('data-id');
      var i = state.picks.indexOf(id);
      if (i > -1) {
        if (state.picks.length === 1) return; // il faut au moins une fleur
        state.picks.splice(i, 1);
      } else {
        state.picks.push(id);
        if (state.picks.length > 3) state.picks.shift();
      }
      syncPicks();
      renderBouquet(false);
      if (motion) gsap.fromTo($('svg', b), { scale: 0.6, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.2)' });
    });
    tintsEl.addEventListener('change', function (e) {
      if (e.target.name !== 'tint') return;
      state.tint = e.target.value;
      prevSlots = [];
      refreshIcons();
      renderBouquet(false);
    });
    $('#shuffle').addEventListener('click', function () {
      var pool = FLOWERS.map(function (f) { return f.id; });
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
      state.picks = pool.slice(0, 3);
      var others = TINTS.filter(function (t) { return t.id !== state.tint; });
      state.tint = others[Math.floor(Math.random() * others.length)].id;
      $('#tint-' + state.tint).checked = true;
      prevSlots = [];
      syncPicks();
      refreshIcons();
      renderBouquet(false);
    });
    syncPicks();
    renderBouquet(false);
    if (motion) {
      // premier rendu : on cache puis on fait éclore à l'entrée dans l'écran
      gsap.set($$('.petal, .core', bouquetSvg), { opacity: 0 });
      ScrollTrigger.create({ trigger: '.composer__stage', start: 'top 75%', once: true, onEnter: function () { prevSlots = []; renderBouquet(true); } });
    }
  }

  /* étiquette cadeau */
  function buildTag() {
    var svg = $('#tag-flower');
    if (!svg) return;
    svg.innerHTML = placeSprig(60, 108, -40, 70, 8, 7, 6) + placeSprig(60, 108, 40, 70, -8, 7, 6) +
      '<path class="stem" d="M60,110 Q58,90 60,62" />' + place(flower('anemone', PAL.powder), 60, 58, 0.9, 0);
    if (motion) {
      gsap.set($$('.petal, .core, .euc-leaf', svg), { opacity: 0 });
      ScrollTrigger.create({
        trigger: svg, start: 'top 85%', once: true, onEnter: function () {
          var tl = gsap.timeline();
          tl.fromTo($$('.euc-leaf', svg), { scale: 0, opacity: 0, transformOrigin: '50% 50%'}, { scale: 1, opacity: 1, transformOrigin: '50% 50%', stagger: 0.03, duration: 0.5, ease: 'back.out(2)' });
          tl.add(bloom(svg, { dur: 1.1 }), 0.2);
          tl.fromTo('.gift-tag', { rotation: -10 }, { rotation: -4, duration: 2.2, ease: 'elastic.out(1, .3)' }, 0);
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. PÉTALES QUI DÉRIVENT (canvas léger, réagit au curseur)
     ------------------------------------------------------------------------ */
  function initPetals() {
    var cv = $('#petals');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, petals = [], raf = 0, lastScroll = window.scrollY;
    var COLORS = ['#EBC9C3', '#F2D5D0', '#E2B0AE', '#F7E4DF', '#D49C9A', '#C9D6CE', '#E8C3BE'];
    var mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial) {
      return {
        x: Math.random() * W, y: initial ? Math.random() * H : -30 - Math.random() * 120,
        s: 6 + Math.random() * 10, vx: 0, vy: 0, fall: 0.25 + Math.random() * 0.5, drift: (Math.random() - 0.5) * 0.3,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02, flip: Math.random() * 6.28, vf: 0.01 + Math.random() * 0.025,
        seed: Math.random() * 1000, c: COLORS[(Math.random() * COLORS.length) | 0], a: 0.45 + Math.random() * 0.4
      };
    }
    function drawPetal(p) {
      var s = p.s, f = Math.cos(p.flip);
      if (Math.abs(f) < 0.12) f = f < 0 ? -0.12 : 0.12;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(f, 1);
      ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.75, s * 0.75, s * 0.7, 0, s);
      ctx.bezierCurveTo(-s * 0.75, s * 0.7, -s * 0.95, -s * 0.75, 0, -s);
      ctx.fill();
      ctx.globalAlpha = p.a * 0.5; ctx.strokeStyle = '#A65E66'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(0, s * 0.85); ctx.quadraticCurveTo(s * 0.18, 0, 0, -s * 0.65); ctx.stroke();
      ctx.restore();
    }
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      var R = 150, R2 = R * R;
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        var wind = Math.sin(t * 0.0004 + p.seed) * 0.35;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          var d = Math.sqrt(d2) || 1, k = 1 - d / R;
          p.vx += (dx / d) * k * 0.55 + mouse.vx * 0.025 * k;
          p.vy += (dy / d) * k * 0.35 + mouse.vy * 0.02 * k;
          p.vr += (dx > 0 ? 1 : -1) * k * 0.003;
        }
        p.vx *= 0.94; p.vy *= 0.94; p.vr = Math.max(-0.05, Math.min(0.05, p.vr * 0.995));
        p.x += p.vx + p.drift + wind; p.y += p.vy + p.fall;
        p.rot += p.vr; p.flip += p.vf;
        if (p.y > H + 30 || p.x < -50 || p.x > W + 50) { petals[i] = make(false); }
        drawPetal(p);
      }
      mouse.vx *= 0.9; mouse.vy *= 0.9;
      raf = requestAnimationFrame(frame);
    }
    resize();
    var n = W < 700 ? 11 : 24;
    for (var i = 0; i < n; i++) petals.push(make(true));

    if (reduce) { petals.forEach(drawPetal); return; } // une seule image fixe

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      mouse.vx = e.clientX - mouse.x; mouse.vy = e.clientY - mouse.y;
      if (Math.abs(mouse.vx) > 200) mouse.vx = mouse.vy = 0;
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('scroll', function () {
      var d = window.scrollY - lastScroll; lastScroll = window.scrollY;
      d = Math.max(-60, Math.min(60, d));
      for (var i = 0; i < petals.length; i++) petals[i].vy -= d * 0.012;
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
    });
    raf = requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------------
     6. EN-TÊTE, MENU, LIENS
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = $('.header'), nav = $('.nav'), toggle = $('.nav__toggle'), last = 0;
    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 20);
      if (!nav.classList.contains('is-open')) header.classList.toggle('is-hidden', y > 500 && y > last + 2);
      if (y < last - 2) header.classList.remove('is-hidden');
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.nav__toggle-label', toggle).textContent = open ? 'Fermer' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) header.classList.remove('is-hidden');
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    $$('.nav__list a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });

    // lien actif
    var links = $$('.nav__list a[href^="#"]:not(.btn)');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) io.observe(s); });
    }
    // liens à compléter : pas de saut en haut de page
    $$('[data-placeholder-link]').forEach(function (a) {
      a.setAttribute('title', 'Lien à compléter');
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });
  }

  /* ------------------------------------------------------------------------
     7. SCROLL : reveals, mots, défilement horizontal, feuilles
     ------------------------------------------------------------------------ */
  function splitWords(el) {
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    }
    walk(el);
    return $$('.w', el);
  }

  function initScroll() {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.15, ease: 'power3.out', stagger: 0.12, overwrite: true }); }
    });

    $$('[data-words]').forEach(function (el) {
      var words = splitWords(el);
      gsap.fromTo(words, { opacity: 0.14, y: 14 }, {
        opacity: 1, y: 0, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 }
      });
    });

    // parallaxe douce du portrait
    gsap.fromTo('.manifesto__portrait .placeholder__art', { yPercent: 10, rotation: -4 }, { yPercent: -10, rotation: 4, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true } });

    // transitions feuille
    $$('.leaf-divider').forEach(function (div) {
      var wipe = $('.leaf-divider__wipe', div);
      var leaf = $('.leaf-divider__leaf:not(.leaf-divider__leaf--small)', div);
      var small = $('.leaf-divider__leaf--small', div);
      var edge = $('.leaf-divider__edge', div);
      var st = { trigger: div, start: 'top 92%', end: 'bottom 25%', scrub: 0.7, invalidateOnRefresh: true };
      var tl = gsap.timeline({ scrollTrigger: st, defaults: { ease: 'none' } });
      tl.fromTo(wipe, { x: function () { return -(div.offsetWidth + Math.max(edge.getBoundingClientRect().width, leaf.getBoundingClientRect().width * 0.6) + 40); } }, { x: 0, duration: 1 }, 0)
        .fromTo(leaf, { rotation: -22, x: 0, y: 20 }, { rotation: 10, x: function () { return leaf.getBoundingClientRect().width * 0.75; }, y: -10, duration: 1 }, 0)
        .fromTo(small, { rotation: 50, y: 30 }, { rotation: -16, y: -20, duration: 1 }, 0);
    });

    // univers : défilement horizontal épinglé (desktop) / glisser natif (mobile)
    var uni = $('.univers'), pin = $('.univers__pin'), track = $('.univers__track'), viewport = $('.univers__viewport'), bar = $('.univers__progress span');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () {
      uni.classList.add('is-hscroll');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: pin, pin: true, start: 'top top', end: function () { return '+=' + dist(); }, scrub: 0.8,
          invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); }
        }
      });
      $$('.u-card__mask', track).forEach(function (m, i) {
        gsap.fromTo(m, { rotation: i % 2 ? 5 : -5, y: 18 }, {
          rotation: i % 2 ? -3 : 3, y: -10, ease: 'none',
          scrollTrigger: { trigger: m, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
        });
        gsap.fromTo($('.u-card__illu', m), { xPercent: 8 }, {
          xPercent: -8, ease: 'none',
          scrollTrigger: { trigger: m, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
        });
      });
      ScrollTrigger.refresh();
      return function () { uni.classList.remove('is-hscroll'); gsap.set(track, { x: 0 }); };
    });
    viewport.addEventListener('scroll', function () {
      if (uni.classList.contains('is-hscroll')) return;
      var max = viewport.scrollWidth - viewport.clientWidth;
      bar.style.transform = 'scaleX(' + (max > 0 ? viewport.scrollLeft / max : 0) + ')';
    }, { passive: true });

    // éclosion des fleurs de chaque carte quand elle apparaît
    $$('.u-card__illu').forEach(function (svg) {
      gsap.set($$('.petal, .core, .euc-leaf', svg), { opacity: 0 });
    });
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || seen.has(en.target)) return;
        seen.add(en.target);
        var svg = en.target;
        var tl = gsap.timeline();
        tl.fromTo($$('.euc-leaf', svg), { scale: 0, opacity: 0, transformOrigin: '50% 50%'}, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)', stagger: 0.012 }, 0);
        tl.add(bloom(svg, { gap: 0.1, dur: 1, each: 0.02 }), 0.1);
      });
    }, { threshold: 0.25 });
    $$('.u-card__illu').forEach(function (svg) { io.observe(svg); });

    // flammes des bougies
    gsap.to('.flame', { scaleY: 1.12, scaleX: 0.9, transformOrigin: '50% 100%', duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.3 });

    // étapes : légère inclinaison au scroll
    gsap.fromTo('.step__icon', { rotation: -12 }, { rotation: 6, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ------------------------------------------------------------------------
     8. MICRO-INTERACTIONS : boutons magnétiques, curseur
     ------------------------------------------------------------------------ */
  function initMicro() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-magnetic]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.25);
        qy((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' });
      });
    });
    var cur = $('.cursor');
    if (cur) {
      var cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
      var cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      window.addEventListener('pointermove', function (e) {
        cx(e.clientX); cy(e.clientY);
        cur.classList.remove('is-hidden');
        cur.classList.toggle('is-hover', !!e.target.closest('a, button, label, input, [tabindex]'));
      }, { passive: true });
      document.addEventListener('pointerleave', function () { cur.classList.add('is-hidden'); });
    }
  }

  /* ------------------------------------------------------------------------
     DÉMARRAGE
     ------------------------------------------------------------------------ */
  buildHero();
  buildUnivers();
  buildComposer();
  buildTag();
  initHeader();
  initPetals();

  if (motion) {
    animateHero();
    initScroll();
    initMicro();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
