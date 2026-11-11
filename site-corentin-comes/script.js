/* =========================================================
   Corentin Comes, Atelier — interactions & motion design
   ========================================================= */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* Sans GSAP (CDN indisponible) : on retire les états cachés pour tout afficher */
  if (!hasGsap) root.classList.remove('motion');

  /* ---------------- En-tête, menu, barre de progression ---------------- */
  var header = document.querySelector('.header');
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var progress = document.querySelector('.progress span');

  if (burger) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        header.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 20);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================================================
     HERO — commode à décaper (canvas)
     ========================================================= */
  function initHero() {
    var canvas = document.getElementById('decap');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = 560, H = 600, RES = 2, TAU = Math.PI * 2;

    var meterEl = document.querySelector('[data-meter]');
    var meterBar = document.querySelector('[data-meter-bar]');
    var hintEl = document.querySelector('[data-hint]');
    var stateEl = document.querySelector('[data-state]');
    var btnAll = document.querySelector('[data-decap-all]');
    var btnRepaint = document.querySelector('[data-repaint]');

    function layer() {
      var c = document.createElement('canvas');
      c.width = W * RES; c.height = H * RES;
      var x = c.getContext('2d');
      x.setTransform(RES, 0, 0, RES, 0, 0);
      return { c: c, x: x };
    }
    var wood = layer(), primer = layer(), paint = layer();

    /* --- Générateur pseudo-aléatoire déterministe --- */
    function rng(seed) {
      var s = seed % 2147483647; if (s <= 0) s += 2147483646;
      return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    }

    /* --- Géométrie de la commode (coordonnées logiques) --- */
    var G = {
      top: { x: 66, y: 128, w: 428, h: 32 },
      body: { x: 88, y: 158, w: 384, h: 320 },
      drawers: [
        { x: 106, y: 176, w: 348, h: 88 },
        { x: 106, y: 276, w: 348, h: 88 },
        { x: 106, y: 376, w: 348, h: 88 }
      ],
      knobs: [190, 370]
    };
    function apronPath(c) {
      c.beginPath();
      c.moveTo(88, 476); c.lineTo(472, 476); c.lineTo(472, 496);
      c.bezierCurveTo(430, 496, 410, 500, 390, 512);
      c.bezierCurveTo(350, 528, 210, 528, 170, 512);
      c.bezierCurveTo(150, 500, 130, 496, 88, 496);
      c.closePath();
    }
    function legPath(c, left) {
      c.beginPath();
      if (left) { c.moveTo(90, 492); c.lineTo(124, 492); c.lineTo(116, 566); c.lineTo(102, 566); }
      else { c.moveTo(436, 492); c.lineTo(470, 492); c.lineTo(458, 566); c.lineTo(444, 566); }
      c.closePath();
    }
    function rr(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
    }

    /* Silhouette pour le test « sur le meuble ? » */
    var hit = new Path2D();
    hit.rect(G.top.x, G.top.y, G.top.w, G.top.h);
    hit.rect(G.body.x, G.body.y, G.body.w, G.body.h + 40);
    hit.rect(90, 490, 34, 76); hit.rect(436, 490, 34, 76);
    var hitCtx = document.createElement('canvas').getContext('2d');
    function onFurniture(x, y) { return hitCtx.isPointInPath(hit, x, y); }

    /* --- Veinage du bois --- */
    function grain(c, x, y, w, h, o) {
      var r = rng(o.seed || 7);
      c.save();
      c.beginPath(); c.rect(x, y, w, h); c.clip();
      if (o.vertical) { c.translate(x + w, y); c.rotate(Math.PI / 2); var t = w; w = h; h = t; x = 0; y = 0; }
      var g = c.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, o.c1 || '#8a5a35'); g.addColorStop(1, o.c2 || '#6e4529');
      c.fillStyle = g; c.fillRect(x, y, w, h);
      var n = Math.round(h / 2.6);
      for (var i = 0; i < n; i++) {
        var yy = y + (i / n) * h + r() * 2;
        var amp = r() * 2.6 + .6, f = r() * .018 + .004, ph = r() * 6;
        c.beginPath();
        for (var xx = x - 6; xx <= x + w + 6; xx += 7) {
          var off = Math.sin(xx * f + ph) * amp + Math.sin(xx * f * 3.3 + ph * 2) * amp * .35;
          if (xx === x - 6) c.moveTo(xx, yy + off); else c.lineTo(xx, yy + off);
        }
        c.strokeStyle = r() < .55
          ? 'rgba(48,26,12,' + (.12 + r() * .28).toFixed(2) + ')'
          : 'rgba(214,156,100,' + (.06 + r() * .14).toFixed(2) + ')';
        c.lineWidth = .4 + r() * 1.4;
        c.stroke();
      }
      if (o.figure) { /* dessin en « cathédrale » */
        var cx = x + w * (.35 + r() * .3);
        for (var k = 0; k < 8; k++) {
          var s = 14 + k * 10;
          c.beginPath();
          c.moveTo(cx - s * 3.2, y + h + 4);
          c.quadraticCurveTo(cx + (r() - .5) * 10, y + h * .12 + k * 7, cx + s * 3.2, y + h + 4);
          c.strokeStyle = 'rgba(45,24,10,' + (.16 + r() * .14).toFixed(2) + ')';
          c.lineWidth = .8 + r();
          c.stroke();
        }
      }
      /* lumière : haut clair, bas sombre */
      var sh = c.createLinearGradient(x, y, x, y + h);
      sh.addColorStop(0, 'rgba(255,225,180,.12)'); sh.addColorStop(1, 'rgba(0,0,0,.18)');
      c.fillStyle = sh; c.fillRect(x, y, w, h);
      c.restore();
    }

    function bevel(c, x, y, w, h) {
      c.save();
      c.strokeStyle = 'rgba(25,12,5,.55)'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
      c.strokeStyle = 'rgba(255,215,160,.18)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x + 3, y + h - 3); c.lineTo(x + 3, y + 3); c.lineTo(x + w - 3, y + 3); c.stroke();
      c.restore();
    }

    function knob(c, x, y, painted) {
      c.save();
      c.fillStyle = 'rgba(0,0,0,.35)';
      c.beginPath(); c.arc(x + 2, y + 3, 11, 0, TAU); c.fill();
      var g = c.createRadialGradient(x - 4, y - 4, 1, x, y, 11);
      if (painted) { g.addColorStop(0, '#cbd6c4'); g.addColorStop(1, '#7f8f79'); }
      else { g.addColorStop(0, '#fbe3a0'); g.addColorStop(.5, '#c4913d'); g.addColorStop(1, '#6d4718'); }
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 10, 0, TAU); c.fill();
      c.restore();
    }
    function escutcheon(c, x, y, painted) {
      c.save();
      c.fillStyle = painted ? '#93a38d' : '#b98634';
      c.beginPath(); c.ellipse(x, y, 9, 13, 0, 0, TAU); c.fill();
      c.fillStyle = painted ? '#6f7f6a' : '#1a0f08';
      c.beginPath(); c.arc(x, y - 3, 3, 0, TAU); c.fill();
      c.fillRect(x - 1.5, y - 2, 3, 8);
      c.restore();
    }

    /* --- Couche bois (le dessous) --- */
    function drawWood() {
      var c = wood.x;
      c.clearRect(0, 0, W, H);
      /* ombre au sol */
      var sg = c.createRadialGradient(280, 568, 10, 280, 568, 240);
      sg.addColorStop(0, 'rgba(10,5,2,.55)'); sg.addColorStop(1, 'rgba(10,5,2,0)');
      c.save(); c.scale(1, .08); c.fillStyle = sg; c.beginPath(); c.arc(280, 568 / .08, 240, 0, TAU); c.fill(); c.restore();

      /* pieds */
      [true, false].forEach(function (left, i) {
        c.save(); legPath(c, left); c.clip();
        grain(c, left ? 88 : 434, 490, 40, 80, { vertical: true, seed: 31 + i, c1: '#704628', c2: '#4e301b' });
        c.restore();
        c.save(); legPath(c, left); c.strokeStyle = 'rgba(25,12,5,.5)'; c.lineWidth = 1.5; c.stroke(); c.restore();
      });
      /* ceinture */
      c.save(); apronPath(c); c.clip();
      grain(c, 88, 476, 384, 56, { seed: 21, c1: '#7d4f2e', c2: '#5c3a21' });
      c.restore();
      c.save(); apronPath(c); c.strokeStyle = 'rgba(25,12,5,.5)'; c.lineWidth = 1.5; c.stroke(); c.restore();
      /* caisse */
      grain(c, G.body.x, G.body.y, G.body.w, G.body.h, { vertical: true, seed: 11, c1: '#7f512f', c2: '#603d23' });
      /* logements des tiroirs */
      G.drawers.forEach(function (d) {
        c.fillStyle = 'rgba(20,10,4,.75)';
        c.fillRect(d.x - 4, d.y - 4, d.w + 8, d.h + 8);
      });
      /* façades */
      G.drawers.forEach(function (d, i) {
        grain(c, d.x, d.y, d.w, d.h, { seed: 41 + i * 7, figure: true, c1: '#91603a', c2: '#6c4428' });
        bevel(c, d.x, d.y, d.w, d.h);
        G.knobs.forEach(function (kx) { knob(c, kx, d.y + d.h / 2, false); });
        escutcheon(c, 280, d.y + d.h / 2, false);
      });
      /* ombre sous plateau */
      c.fillStyle = 'rgba(15,8,3,.45)'; c.fillRect(G.body.x, G.body.y, G.body.w, 8);
      /* plateau */
      c.save(); rr(c, G.top.x, G.top.y, G.top.w, G.top.h, 7); c.clip();
      grain(c, G.top.x, G.top.y, G.top.w, G.top.h, { seed: 5, c1: '#966340', c2: '#6e4529' });
      var lg = c.createLinearGradient(0, G.top.y, 0, G.top.y + G.top.h);
      lg.addColorStop(0, 'rgba(255,230,190,.28)'); lg.addColorStop(.25, 'rgba(255,230,190,0)'); lg.addColorStop(.85, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = lg; c.fillRect(G.top.x, G.top.y, G.top.w, G.top.h);
      c.restore();
      /* reflet de cire */
      var rf = c.createLinearGradient(140, 0, 420, 0);
      rf.addColorStop(0, 'rgba(255,240,210,0)'); rf.addColorStop(.5, 'rgba(255,240,210,.16)'); rf.addColorStop(1, 'rgba(255,240,210,0)');
      c.fillStyle = rf; c.fillRect(120, G.body.y + 10, 320, G.body.h - 20);
    }

    /* Remplit toute la silhouette (une couleur ou un dégradé) */
    function fillSilhouette(c, style) {
      c.fillStyle = style;
      rr(c, G.top.x, G.top.y, G.top.w, G.top.h, 7); c.fill();
      c.fillRect(G.body.x, G.body.y, G.body.w, G.body.h);
      apronPath(c); c.fill();
      legPath(c, true); c.fill(); legPath(c, false); c.fill();
    }

    /* --- Sous-couche blanche (apprêt) --- */
    function drawPrimer() {
      var c = primer.x, r = rng(99);
      c.clearRect(0, 0, W, H);
      fillSilhouette(c, '#e4dac4');
      c.save();
      c.globalCompositeOperation = 'source-atop';
      for (var i = 0; i < 900; i++) {
        c.fillStyle = r() < .5 ? 'rgba(160,140,100,.10)' : 'rgba(255,255,255,.18)';
        c.fillRect(60 + r() * 440, 120 + r() * 450, 2 + r() * 10, 1 + r() * 2);
      }
      G.drawers.forEach(function (d) {
        c.strokeStyle = 'rgba(120,100,70,.45)'; c.lineWidth = 3; c.strokeRect(d.x - 2, d.y - 2, d.w + 4, d.h + 4);
      });
      c.restore();
    }

    /* --- Vieille peinture vert-de-gris --- */
    function drawPaint() {
      var c = paint.x, r = rng(1234);
      c.clearRect(0, 0, W, H);
      var pg = c.createLinearGradient(0, 120, 0, 570);
      pg.addColorStop(0, '#aebda6'); pg.addColorStop(1, '#8e9e88');
      fillSilhouette(c, pg);
      c.save();
      c.globalCompositeOperation = 'source-atop';
      /* coups de pinceau */
      for (var i = 0; i < 1300; i++) {
        var x = 60 + r() * 440, y = 120 + r() * 450;
        c.strokeStyle = r() < .5 ? 'rgba(200,212,192,.22)' : 'rgba(110,128,104,.18)';
        c.lineWidth = 1 + r() * 3;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + r() * 30, y + (r() - .5) * 2); c.stroke();
      }
      /* creux des tiroirs (la peinture épouse la forme) */
      G.drawers.forEach(function (d) {
        c.fillStyle = 'rgba(55,70,52,.55)';
        c.fillRect(d.x - 4, d.y - 4, d.w + 8, 4); c.fillRect(d.x - 4, d.y + d.h, d.w + 8, 4);
        c.fillRect(d.x - 4, d.y, 4, d.h); c.fillRect(d.x + d.w, d.y, 4, d.h);
        c.strokeStyle = 'rgba(230,238,224,.35)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(d.x + 3, d.y + d.h - 3); c.lineTo(d.x + 3, d.y + 3); c.lineTo(d.x + d.w - 3, d.y + 3); c.stroke();
      });
      c.fillStyle = 'rgba(40,52,38,.4)'; c.fillRect(G.body.x, G.body.y, G.body.w, 7);
      var tg = c.createLinearGradient(0, G.top.y, 0, G.top.y + G.top.h);
      tg.addColorStop(0, 'rgba(255,255,255,.2)'); tg.addColorStop(.3, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(30,40,28,.3)');
      c.fillStyle = tg; c.fillRect(G.top.x, G.top.y, G.top.w, G.top.h);
      /* craquelures */
      c.strokeStyle = 'rgba(50,62,46,.55)'; c.lineWidth = .9;
      for (var k = 0; k < 46; k++) {
        var cx = 70 + r() * 420, cy = 130 + r() * 430;
        c.beginPath(); c.moveTo(cx, cy);
        for (var s = 0; s < 5; s++) { cx += (r() - .5) * 26; cy += (r() - .5) * 18; c.lineTo(cx, cy); }
        c.stroke();
      }
      /* taches de crasse */
      for (var m = 0; m < 14; m++) {
        var gx = 90 + r() * 380, gy = 150 + r() * 400, gr = 10 + r() * 30;
        var gg = c.createRadialGradient(gx, gy, 0, gx, gy, gr);
        gg.addColorStop(0, 'rgba(70,60,40,.22)'); gg.addColorStop(1, 'rgba(70,60,40,0)');
        c.fillStyle = gg; c.beginPath(); c.arc(gx, gy, gr, 0, TAU); c.fill();
      }
      c.restore();
      /* boutons peints par-dessus */
      G.drawers.forEach(function (d) {
        G.knobs.forEach(function (kx) { knob(c, kx, d.y + d.h / 2, true); });
        escutcheon(c, 280, d.y + d.h / 2, true);
      });
      /* écailles déjà parties : dévoilent l'apprêt, parfois le bois */
      chip(paint.x, 38, 5, 16, r);
      chip(primer.x, 16, 3, 9, r);
      /* usure des arêtes */
      c.save(); c.globalCompositeOperation = 'destination-out';
      for (var e = 0; e < 160; e++) {
        var ex = G.top.x + r() * G.top.w, ey = G.top.y + G.top.h - 2 - r() * 6;
        c.beginPath(); c.arc(ex, ey, .8 + r() * 2.4, 0, TAU); c.fill();
      }
      c.restore();
    }
    function chip(c, count, rmin, rmax, r) {
      c.save(); c.globalCompositeOperation = 'destination-out';
      for (var i = 0; i < count; i++) {
        var x = 80 + r() * 400, y = 130 + r() * 430, rad = rmin + r() * (rmax - rmin);
        c.beginPath();
        for (var a = 0; a <= 12; a++) {
          var ang = a / 12 * TAU, rr2 = rad * (.55 + r() * .6);
          var px = x + Math.cos(ang) * rr2 * 1.4, py = y + Math.sin(ang) * rr2;
          if (a === 0) c.moveTo(px, py); else c.lineTo(px, py);
        }
        c.closePath(); c.fill();
      }
      c.restore();
    }

    /* --- Mesure de la surface décapée --- */
    var sampleW = 70, sampleH = 75;
    var sample = document.createElement('canvas'); sample.width = sampleW; sample.height = sampleH;
    var sctx = sample.getContext('2d', { willReadFrequently: true });
    var baseCount = 1;
    function coveredCount() {
      sctx.clearRect(0, 0, sampleW, sampleH);
      sctx.globalCompositeOperation = 'source-over';
      sctx.drawImage(primer.c, 0, 0, sampleW, sampleH);
      sctx.drawImage(paint.c, 0, 0, sampleW, sampleH);
      var d = sctx.getImageData(0, 0, sampleW, sampleH).data, n = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 70) n++;
      return n;
    }
    function silhouetteCount() {
      sctx.clearRect(0, 0, sampleW, sampleH);
      sctx.save(); sctx.scale(sampleW / W, sampleH / H); fillSilhouette(sctx, '#000'); sctx.restore();
      var d = sctx.getImageData(0, 0, sampleW, sampleH).data, n = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 70) n++;
      return n;
    }

    /* --- État --- */
    var pct = 0, done = false, lastMeasure = 0;
    var particles = [];
    var pointer = { x: 0, y: 0, over: false, down: false, type: 'mouse' };
    var last = null;
    var mode = 'idle'; // idle | user | auto | sweep
    var autoT = 0, lastUser = 0, inView = true, running = false;
    var sweep = null;
    var nozzle = { x: 330, y: 300, visible: false };

    /* --- Décapage : un « coup » de buse --- */
    var BRUSH = 24;
    function stamp(x, y, str, R) {
      R = R || BRUSH;
      blast(paint.x, x, y, R, Math.min(1, str));
      blast(primer.x, x, y, R * .92, Math.min(1, str * .5));
    }
    function blast(c, x, y, R, a) {
      c.save();
      c.globalCompositeOperation = 'destination-out';
      var g = c.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(0,0,0,' + a + ')');
      g.addColorStop(.55, 'rgba(0,0,0,' + (a * .55) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.fillStyle = 'rgba(0,0,0,' + Math.min(1, .35 + a) + ')';
      for (var i = 0; i < 10; i++) { /* piqûres du sablage */
        var ang = Math.random() * TAU, d = Math.sqrt(Math.random()) * R * 1.15;
        var s = .8 + Math.random() * 1.8;
        c.fillRect(x + Math.cos(ang) * d, y + Math.sin(ang) * d, s, s);
      }
      c.restore();
    }

    var COLORS_PAINT = ['#a7b6a0', '#c8d3c1', '#8e9e88'];
    var COLORS_PRIMER = ['#ece3cf', '#dcd1b9'];
    var COLORS_WOOD = ['#a8784a', '#7a5030', '#c08a58'];
    function emit(x, y, n) {
      for (var i = 0; i < n; i++) {
        if (particles.length > 420) particles.shift();
        var roll = Math.random(), col;
        if (roll < .45 - pct * .3) col = COLORS_PAINT[(Math.random() * 3) | 0];
        else if (roll < .7) col = COLORS_PRIMER[(Math.random() * 2) | 0];
        else col = COLORS_WOOD[(Math.random() * 3) | 0];
        var ang = -Math.PI * (.05 + Math.random() * .9) + Math.PI * .1 * (Math.random() - .5);
        var sp = 1.5 + Math.random() * 4.5;
        particles.push({
          x: x + (Math.random() - .5) * 10, y: y + (Math.random() - .5) * 10,
          vx: Math.cos(ang) * sp - 1.2, vy: Math.sin(ang) * sp,
          life: 0, max: 30 + Math.random() * 40, s: .8 + Math.random() * 2.4, c: col, dust: false
        });
      }
      if (Math.random() < .35) {
        particles.push({ x: x, y: y, vx: (Math.random() - .5) * .8 - .4, vy: -.4 - Math.random() * .5, life: 0, max: 60, s: 10 + Math.random() * 12, c: 'rgba(235,225,205,', dust: true });
      }
    }

    function updateParticles() {
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.life++;
        if (p.life > p.max) { particles.splice(i, 1); continue; }
        if (p.dust) { p.x += p.vx; p.y += p.vy; p.s += .35; }
        else { p.vy += .16; p.vx *= .985; p.x += p.vx; p.y += p.vy; }
      }
    }

    /* --- Dessin de la buse --- */
    function drawNozzle(c, ix, iy, spraying) {
      var tx = ix + 40, ty = iy - 46;
      var a = Math.atan2(iy - ty, ix - tx);
      var dist = Math.hypot(ix - tx, iy - ty);
      c.save();
      c.translate(tx, ty); c.rotate(a);
      /* jet */
      if (spraying) {
        var jg = c.createLinearGradient(0, 0, dist, 0);
        jg.addColorStop(0, 'rgba(245,238,225,.55)'); jg.addColorStop(1, 'rgba(245,238,225,.08)');
        c.fillStyle = jg;
        var spread = BRUSH * (.7 + Math.random() * .15);
        c.beginPath(); c.moveTo(0, -3); c.lineTo(dist + 4, -spread); c.lineTo(dist + 4, spread); c.lineTo(0, 3); c.closePath(); c.fill();
      }
      /* tuyau */
      c.strokeStyle = '#1e1e1e'; c.lineWidth = 11; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-70, 0); c.bezierCurveTo(-120, 0, -150, -50, -300, -70); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(-70, -3); c.bezierCurveTo(-120, -3, -150, -53, -300, -73); c.stroke();
      /* corps métal */
      var mg = c.createLinearGradient(0, -9, 0, 9);
      mg.addColorStop(0, '#c8d2d6'); mg.addColorStop(.5, '#6c7c84'); mg.addColorStop(1, '#2f3b42');
      c.fillStyle = mg;
      rr(c, -74, -9, 62, 18, 4); c.fill();
      c.fillStyle = '#b5532a'; c.fillRect(-58, -9, 8, 18);
      /* embout */
      c.fillStyle = '#3a464d';
      c.beginPath(); c.moveTo(-14, -7); c.lineTo(0, -4); c.lineTo(0, 4); c.lineTo(-14, 7); c.closePath(); c.fill();
      c.restore();
    }

    /* --- Composition d'une image --- */
    function render() {
      var sx = canvas.width / W, sy = canvas.height / H;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ctx.drawImage(wood.c, 0, 0, W, H);
      ctx.drawImage(primer.c, 0, 0, W, H);
      ctx.drawImage(paint.c, 0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i], k = 1 - p.life / p.max;
        if (p.dust) {
          ctx.fillStyle = p.c + (k * .16).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, TAU); ctx.fill();
        } else {
          ctx.globalAlpha = Math.min(1, k * 1.4);
          ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
          ctx.globalAlpha = 1;
        }
      }
      if (nozzle.visible) drawNozzle(ctx, nozzle.x, nozzle.y, nozzle.spraying);
    }

    /* --- Taille d'affichage --- */
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.width * (H / W) * dpr);
      render();
    }

    function toLogical(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }

    function sprayAlong(from, to, str, R) {
      var dx = to.x - from.x, dy = to.y - from.y;
      var d = Math.hypot(dx, dy), step = (R || BRUSH) * .35;
      var n = Math.max(1, Math.ceil(d / step));
      for (var i = 1; i <= n; i++) {
        var x = from.x + dx * i / n, y = from.y + dy * i / n;
        if (onFurniture(x, y)) {
          stamp(x, y, str, R);
          if (i % 2 === 0 || n === 1) emit(x, y, 3);
        }
      }
    }

    function setPct(p) {
      pct = p;
      var v = Math.round(p * 100);
      if (meterEl) meterEl.textContent = v + ' %';
      if (meterBar) meterBar.style.transform = 'scaleX(' + p + ')';
      if (stateEl) stateEl.textContent = v >= 96 ? 'état : bois nu' : v > 8 ? 'état : en cours' : 'état : avant';
    }
    function measure(force) {
      var now = performance.now();
      if (!force && now - lastMeasure < 220) return;
      lastMeasure = now;
      var p = 1 - coveredCount() / baseCount;
      setPct(Math.max(0, Math.min(1, p)));
      if (pct >= .955 && !done) finish();
    }

    function finish() {
      done = true;
      /* on nettoie les derniers résidus avec une bouffée de poussière */
      paint.x.clearRect(0, 0, W, H);
      primer.x.clearRect(0, 0, W, H);
      for (var i = 0; i < 40; i++) emit(100 + Math.random() * 360, 150 + Math.random() * 380, 2);
      setPct(1);
      mode = 'idle'; sweep = null; nozzle.visible = pointer.over;
      if (btnAll) { btnAll.disabled = true; }
      if (hintEl) { hintEl.querySelector('.hint-desk').textContent = 'Le bois est à nu.'; hintEl.querySelector('.hint-touch').textContent = 'Le bois est à nu.'; hintEl.classList.remove('is-hidden'); }
      kick();
    }

    function repaint() {
      drawPrimer(); drawPaint();
      done = false; particles.length = 0;
      if (btnAll) btnAll.disabled = false;
      if (hintEl) {
        hintEl.querySelector('.hint-desk').textContent = 'Passez la buse sur la commode';
        hintEl.querySelector('.hint-touch').textContent = 'Frottez la commode du doigt';
        hintEl.classList.remove('is-hidden');
      }
      measure(true);
      lastUser = performance.now();
      render();
      kick();
    }

    /* --- Démo automatique & « tout décaper » --- */
    function autoPoint(t) {
      return { x: 280 + 175 * Math.sin(t * 1.3), y: 330 + 165 * Math.sin(t * 1.9 + .6) };
    }
    function buildSweep() {
      var pts = [], row = 0;
      for (var y = 132; y <= 566; y += 24) {
        var l = y > 490 ? 92 : 70, r = y > 490 ? 468 : 490;
        if (row % 2 === 0) { pts.push({ x: l, y: y }, { x: r, y: y }); } else { pts.push({ x: r, y: y }, { x: l, y: y }); }
        row++;
      }
      return { pts: pts, i: 0, pos: { x: pts[0].x, y: pts[0].y } };
    }

    /* --- Boucle d'animation --- */
    function frame() {
      running = false;
      var now = performance.now();
      var active = false;

      if (mode === 'sweep' && sweep) {
        active = true;
        var target = sweep.pts[sweep.i + 1];
        var from = { x: sweep.pos.x, y: sweep.pos.y };
        var dx = target.x - sweep.pos.x, dy = target.y - sweep.pos.y, d = Math.hypot(dx, dy), sp = 30;
        if (d <= sp) { sweep.pos = { x: target.x, y: target.y }; sweep.i++; }
        else { sweep.pos = { x: sweep.pos.x + dx / d * sp, y: sweep.pos.y + dy / d * sp }; }
        sprayAlong(from, sweep.pos, 1, 30);
        nozzle.x = sweep.pos.x; nozzle.y = sweep.pos.y; nozzle.visible = true; nozzle.spraying = true;
        if (sweep.i >= sweep.pts.length - 1) { sweep = null; mode = 'idle'; measure(true); if (!done) finish(); }
      } else if (pointer.over && (pointer.type === 'mouse' || pointer.down) && !done) {
        active = true;
        var cur = { x: pointer.x, y: pointer.y };
        if (last) sprayAlong(last, cur, .3);
        /* jet maintenu au même endroit */
        var jx = cur.x + (Math.random() - .5) * 8, jy = cur.y + (Math.random() - .5) * 8;
        if (onFurniture(jx, jy)) { stamp(jx, jy, .12); emit(jx, jy, 2); }
        last = cur;
        nozzle.x = cur.x; nozzle.y = cur.y; nozzle.visible = true; nozzle.spraying = true;
      } else if (!done && inView && !pointer.over && now - lastUser > 3200) {
        /* démo automatique quand personne ne touche */
        active = true;
        if (mode !== 'auto') { mode = 'auto'; last = null; }
        var a = autoPoint(autoT), b;
        autoT += .011;
        b = autoPoint(autoT);
        sprayAlong(a, b, .2);
        nozzle.x = b.x; nozzle.y = b.y; nozzle.visible = true; nozzle.spraying = true;
      } else {
        nozzle.spraying = false;
        if (!pointer.over && mode !== 'sweep') nozzle.visible = false;
        if (pointer.over) active = true;
      }

      updateParticles();
      render();
      if (!done) measure(false);

      if (inView && (active || particles.length || (!done && !pointer.over))) kick();
    }
    function kick() {
      if (running || !inView) return;
      running = true;
      requestAnimationFrame(frame);
    }

    /* --- Événements pointeur --- */
    function userActed() {
      lastUser = performance.now();
      if (mode === 'auto') mode = 'user';
      if (hintEl) hintEl.classList.add('is-hidden');
    }
    canvas.addEventListener('pointerenter', function (e) {
      pointer.type = e.pointerType; pointer.over = true;
      var p = toLogical(e); pointer.x = p.x; pointer.y = p.y; last = p;
      if (e.pointerType === 'mouse') userActed();
      kick();
    });
    canvas.addEventListener('pointermove', function (e) {
      pointer.type = e.pointerType;
      var p = toLogical(e); pointer.x = p.x; pointer.y = p.y; pointer.over = true;
      if (e.pointerType === 'mouse' || pointer.down) userActed();
      kick();
    });
    canvas.addEventListener('pointerdown', function (e) {
      pointer.type = e.pointerType; pointer.down = true; pointer.over = true;
      var p = toLogical(e); pointer.x = p.x; pointer.y = p.y; last = p;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      userActed(); kick();
    });
    function up(e) {
      pointer.down = false;
      if (e.pointerType !== 'mouse') { pointer.over = false; last = null; }
      lastUser = performance.now();
      kick();
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' || !pointer.down) { pointer.over = false; last = null; }
      lastUser = performance.now();
      kick();
    });

    if (btnAll) btnAll.addEventListener('click', function () {
      if (done) return;
      userActed();
      if (REDUCE) { finish(); particles.length = 0; render(); return; }
      mode = 'sweep'; sweep = buildSweep(); btnAll.disabled = true;
      kick();
    });
    if (btnRepaint) btnRepaint.addEventListener('click', function () {
      sweep = null; mode = 'idle';
      repaint();
      if (REDUCE) { render(); }
    });

    /* --- Initialisation --- */
    drawWood();
    if (REDUCE) {
      /* Mouvement réduit : meuble déjà décapé, pas d'animation */
      baseCount = silhouetteCount() || 1;
      done = true; setPct(1);
      if (btnAll) btnAll.disabled = true;
      if (hintEl) hintEl.classList.add('is-hidden');
      if (stateEl) stateEl.textContent = 'état : bois nu';
      resize();
      window.addEventListener('resize', resize);
      /* repeindre reste possible, sans animation automatique */
      kick = function () {};
      return;
    }
    drawPrimer(); drawPaint();
    baseCount = silhouetteCount() || 1;
    measure(true);
    lastUser = performance.now();
    resize();
    window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) kick();
      }, { threshold: .05 }).observe(canvas);
    }
    kick();
  }

  /* =========================================================
     Avant / après
     ========================================================= */
  var sliders = [];
  function initBA() {
    document.querySelectorAll('[data-ba]').forEach(function (el) {
      var stage = el.querySelector('.ba__stage');
      var range = el.querySelector('.ba__range');
      var s = { el: el, touched: false, set: function (v) { stage.style.setProperty('--p', v); range.value = v; } };
      range.addEventListener('input', function () { s.touched = true; stage.style.setProperty('--p', range.value); });
      s.set(50);
      sliders.push(s);
    });
  }

  /* =========================================================
     Étiquettes : balancement au toucher
     ========================================================= */
  function initTags() {
    document.querySelectorAll('.tag__swing').forEach(function (t) {
      t.addEventListener('click', function () {
        t.classList.remove('is-swinging');
        void t.offsetWidth;
        t.classList.add('is-swinging');
      });
      t.addEventListener('animationend', function () { t.classList.remove('is-swinging'); });
    });
  }

  /* =========================================================
     Activation des boucles d'illustration quand visibles
     ========================================================= */
  function initInView() {
    if (REDUCE || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-on', en.isIntersecting); });
    }, { threshold: .25 });
    document.querySelectorAll('[data-step], .vs').forEach(function (el) { io.observe(el); });
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-in', en.isIntersecting); });
    }, { threshold: .1 });
    document.querySelectorAll('.tag').forEach(function (el) { io2.observe(el); });
  }

  /* =========================================================
     Formulaire de démonstration
     ========================================================= */
  function initForm() {
    var f = document.querySelector('[data-form]');
    if (!f) return;
    var msg = f.querySelector('[data-form-msg]');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = f.nom.value.trim(), contact = f.contact.value.trim();
      if (!nom || !contact) {
        msg.textContent = 'Merci d’indiquer votre nom et un moyen de vous recontacter.';
        (nom ? f.contact : f.nom).focus();
        return;
      }
      msg.textContent = 'Merci ! (Démonstration : aucun message n’a été envoyé.)';
      f.reset();
    });
  }

  /* =========================================================
     GSAP : entrées, reveals, scrub
     ========================================================= */
  function initGsap() {
    if (!hasGsap || REDUCE) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    /* Hero */
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero .kicker', { opacity: 1, y: 0, duration: .7 })
      .to('.hero__title [data-hero]', { y: 0, duration: 1.1, stagger: .14, ease: 'power4.out' }, '-=.4')
      .to('.hero__lead, .hero__ctas, .hero__facts', { opacity: 1, y: 0, duration: .8, stagger: .1 }, '-=.6')
      .to('[data-hero-stage]', { opacity: 1, y: 0, scale: 1, duration: 1.1 }, .25)
      .from('.stage__tag', { rotation: -30, y: -40, opacity: 0, duration: 1.4, ease: 'elastic.out(1, .4)' }, .9);

    /* Filet de sécurité : si le ticker ne démarre pas (onglet en arrière-plan), on affiche tout */
    setTimeout(function () { if (tl.progress() < .05) tl.progress(1); }, 3500);

    /* Reveals génériques */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* Rail de la méthode, rempli au scroll */
    var rail = document.querySelector('.steps__rail span');
    if (rail) {
      gsap.to(rail, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 60%', scrub: .4 }
      });
    }

    /* Split-screen : les deux moitiés arrivent de chaque côté */
    gsap.from('[data-vs-half="left"]', { xPercent: -14, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '[data-vs]', start: 'top 80%', once: true } });
    gsap.from('[data-vs-half="right"]', { xPercent: 14, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '[data-vs]', start: 'top 80%', once: true } });
    gsap.from('.vs__badge', { scale: 0, rotation: -180, duration: 1, ease: 'back.out(1.8)', delay: .4, scrollTrigger: { trigger: '[data-vs]', start: 'top 80%', once: true } });

    /* Étiquettes qui tombent sur la tringle */
    gsap.from('.tag__swing', {
      y: -60, opacity: 0, rotation: function (i) { return i % 2 ? 10 : -10; },
      duration: 1.2, ease: 'elastic.out(1, .5)', stagger: .09,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '[data-tags]', start: 'top 85%', once: true }
    });

    /* Avant / après : petit balayage de démonstration */
    sliders.forEach(function (s, i) {
      var o = { p: 50 };
      window.ScrollTrigger.create({
        trigger: s.el, start: 'top 75%', once: true,
        onEnter: function () {
          gsap.timeline({ delay: .3 + i * .15 })
            .to(o, { p: 14, duration: .9, ease: 'power2.inOut', onUpdate: function () { if (!s.touched) s.set(o.p.toFixed(1)); } })
            .to(o, { p: 86, duration: 1.2, ease: 'power2.inOut', onUpdate: function () { if (!s.touched) s.set(o.p.toFixed(1)); } })
            .to(o, { p: 50, duration: .8, ease: 'power2.out', onUpdate: function () { if (!s.touched) s.set(o.p.toFixed(1)); } });
        }
      });
    });

    /* Tampon du pied de page */
    gsap.from('.footer__stamp', { rotation: -120, scale: .6, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.footer', start: 'top 90%', once: true } });

    /* Sécurité : tout afficher si un déclencheur ne s'est pas produit */
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
  }

  function boot() {
    initHero();
    initBA();
    initTags();
    initInView();
    initForm();
    initGsap();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
