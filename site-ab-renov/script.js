/* AB Renov — interactions & motion design
   GSAP 3.12.5 + ScrollTrigger. N'anime que transform / opacity
   (exception : tracé des illustrations au trait via stroke-dashoffset). */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = !reduce && hasGsap;
  if (!motion) root.classList.remove("motion");

  /* ------------------------------------------------------------
     1. Veinage de bois procédural (canvas) → textures CSS & SVG
     ------------------------------------------------------------ */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // bruit de valeur périodique (pour une texture qui se répète sans couture)
  function periodicNoise(px, py, seed) {
    var r = rng(seed), g = new Float32Array(px * py);
    for (var i = 0; i < g.length; i++) g[i] = r();
    return function (x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var x0 = ((xi % px) + px) % px, y0 = ((yi % py) + py) % py;
      var x1 = (x0 + 1) % px, y1 = (y0 + 1) % py;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = g[y0 * px + x0], b = g[y0 * px + x1], c = g[y1 * px + x0], d = g[y1 * px + x1];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
  }
  function woodCanvas(o) {
    var W = 256, H = 512;
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d"), img = ctx.createImageData(W, H), d = img.data;
    var nA = periodicNoise(3, 2, o.seed), nB = periodicNoise(12, 3, o.seed + 7);
    var nP = periodicNoise(96, 6, o.seed + 13), nF = periodicNoise(4, 8, o.seed + 21);
    for (var y = 0; y < H; y++) {
      var v = y / H;
      for (var x = 0; x < W; x++) {
        var u = x / W;
        var t = u * o.rings + 1.5 * nA(u * 3, v * 2) + 0.35 * nB(u * 12, v * 3);
        var ring = t - Math.floor(t);
        var band = Math.pow(Math.sin(Math.PI * ring), 0.7);
        var late = Math.exp(-Math.pow(ring - 0.86, 2) / 0.003);
        var pore = nP(u * 96, v * 6);
        var flame = nF(u * 4, v * 8);
        var k = 0.84 + 0.16 * band - late * 0.32 - (pore > 0.72 ? (pore - 0.72) * 0.9 : 0) + (flame - 0.5) * 0.08;
        var i = (y * W + x) * 4;
        d[i] = Math.min(255, o.c[0] * k + late * o.dk[0]);
        d[i + 1] = Math.min(255, o.c[1] * k + late * o.dk[1]);
        d[i + 2] = Math.min(255, o.c[2] * k + late * o.dk[2]);
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }
  function rotated(cv) {
    var r = document.createElement("canvas"); r.width = cv.height; r.height = cv.width;
    var c = r.getContext("2d");
    c.translate(r.width, 0); c.rotate(Math.PI / 2); c.drawImage(cv, 0, 0);
    return r;
  }
  var tex = {};
  try {
    var oak = woodCanvas({ seed: 11, rings: 7, c: [204, 145, 68], dk: [-40, -30, -14] });
    var walnut = woodCanvas({ seed: 29, rings: 9, c: [112, 72, 50], dk: [-30, -22, -14] });
    tex.oakV = oak.toDataURL("image/jpeg", 0.86);
    tex.oakH = rotated(oak).toDataURL("image/jpeg", 0.86);
    tex.walnutV = walnut.toDataURL("image/jpeg", 0.86);
    tex.walnutH = rotated(walnut).toDataURL("image/jpeg", 0.86);
    root.style.setProperty("--tex-oak-v", 'url("' + tex.oakV + '")');
    root.style.setProperty("--tex-oak-h", 'url("' + tex.oakH + '")');
    root.style.setProperty("--tex-walnut-v", 'url("' + tex.walnutV + '")');
    root.style.setProperty("--tex-walnut-h", 'url("' + tex.walnutH + '")');
    document.querySelectorAll("image.tex-img").forEach(function (im) {
      var src = tex[im.getAttribute("data-tex")];
      if (src) im.setAttribute("href", src);
    });
  } catch (e) { /* les dégradés CSS de secours restent en place */ }

  /* ------------------------------------------------------------
     2. Navigation, en-tête, formulaire (toujours actifs)
     ------------------------------------------------------------ */
  var header = document.querySelector("[data-header]");
  var nav = document.querySelector(".nav");
  var navBtn = document.querySelector(".nav__toggle");
  function closeNav() { nav.classList.remove("is-open"); navBtn.setAttribute("aria-expanded", "false"); }
  navBtn.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    navBtn.setAttribute("aria-expanded", String(open));
    header.classList.remove("is-hidden");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); navBtn.focus(); } });

  var form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.getElementById("form-note");
      var nom = form.querySelector("#f-nom"), ct = form.querySelector("#f-contact");
      if (!nom.value.trim() || !ct.value.trim()) {
        note.textContent = "Merci d’indiquer votre nom et un moyen de vous recontacter.";
        (nom.value.trim() ? ct : nom).focus();
        return;
      }
      note.classList.add("is-sent");
      note.textContent = "Merci ! (Démonstration : aucun message n’a été envoyé. L’envoi sera branché sur la messagerie de l’entreprise.)";
    });
  }

  /* ------------------------------------------------------------
     3. Toggle Bois / PVC
     ------------------------------------------------------------ */
  var mat = document.querySelector(".mat");
  var wipeRect = document.getElementById("wipeRect");
  var rabot = document.querySelector(".rabot");
  var matLabel = document.querySelector("[data-mat-label]");
  var matTl = null;
  var W_MAT = 540;
  function setMaterial(v, ev) {
    if (!mat || mat.dataset.mat === v) return;
    mat.dataset.mat = v;
    mat.querySelectorAll(".mat-toggle__btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.set === v)); });
    matLabel.textContent = v === "pvc" ? "PVC" : "bois";
    var toPvc = v === "pvc";
    if (!motion) { wipeRect.setAttribute("x", toPvc ? 0 : -W_MAT); return; }
    if (matTl) matTl.kill();
    var cur = parseFloat(wipeRect.getAttribute("x")) || 0;
    var proxy = { e: cur + W_MAT };
    var svg = document.querySelector(".mat-svg");
    var lastChip = 0;
    matTl = gsap.timeline();
    matTl.set(rabot, { autoAlpha: 1, x: proxy.e })
      .to(proxy, {
        e: toPvc ? W_MAT : 0, duration: 1.25, ease: "power2.inOut",
        onUpdate: function () {
          wipeRect.setAttribute("x", proxy.e - W_MAT);
          gsap.set(rabot, { x: proxy.e });
          var now = performance.now();
          if (now - lastChip > 90) {
            lastChip = now;
            var r = rabot.querySelector(".rabot__body").getBoundingClientRect();
            if (r.width) chips(r.left + r.width / 2, r.top, 2, -Math.PI / 2);
          }
        }
      }, 0)
      .fromTo(svg, { scale: 1 }, { scale: 0.975, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut", transformOrigin: "50% 50%" }, 0)
      .to(rabot, { autoAlpha: 0, duration: 0.3 });
  }
  if (mat) {
    mat.querySelectorAll(".mat-toggle__btn").forEach(function (b) {
      b.addEventListener("click", function () { setMaterial(b.dataset.set); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          var next = mat.dataset.mat === "bois" ? "pvc" : "bois";
          setMaterial(next);
          mat.querySelector('[data-set="' + next + '"]').focus();
        }
      });
    });
  }

  /* ------------------------------------------------------------
     4. Copeaux (particules) — transform/opacity uniquement
     ------------------------------------------------------------ */
  var CURL = '<svg viewBox="0 0 40 40"><path d="M20 20c0-2 2-3 3.5-2s1.6 4-.6 5.5-6 .8-7-2.8 1.6-7.6 5.6-8 8.6 2.4 8.8 6.6-3 9.2-8 9.6-10.6-2.6-11.2-7.8" fill="none" stroke="COL" stroke-width="3.2" stroke-linecap="round"/></svg>';
  var COLS = ["#C68B3E", "#E6BE7E", "#8A5A1F", "#D9A65C"];
  function chips(x, y, n, dir) {
    if (!motion) return;
    for (var i = 0; i < n; i++) {
      var el = document.createElement("span");
      el.className = "chip";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = CURL.replace("COL", COLS[(Math.random() * COLS.length) | 0]);
      document.body.appendChild(el);
      var a = dir == null ? Math.random() * Math.PI * 2 : dir + (Math.random() - 0.5) * 1.6;
      var dist = 30 + Math.random() * 50;
      gsap.set(el, { x: x, y: y, rotation: Math.random() * 360, scale: 0.5 + Math.random() * 0.6 });
      gsap.timeline({ onComplete: el.remove.bind(el) })
        .to(el, { x: x + Math.cos(a) * dist, y: y + Math.sin(a) * dist, rotation: "+=" + (200 + Math.random() * 300), duration: 0.6 + Math.random() * 0.4, ease: "power3.out" })
        .to(el, { y: "+=" + (30 + Math.random() * 30), autoAlpha: 0, duration: 0.5, ease: "power1.in" }, ">-0.2");
    }
  }

  if (!motion) {
    // mode statique : en-tête plein dès qu'on défile
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (wipeRect) wipeRect.setAttribute("x", -W_MAT);
    return;
  }

  /* ============================================================
     MOTION DESIGN
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
  var mm = gsap.matchMedia();

  // ---------- Intro ----------
  gsap.from(".win", { y: 50, autoAlpha: 0, duration: 1.3, delay: 0.1 });
  gsap.from(".win__cote", { scaleY: 0, duration: 1.1, delay: 0.6, ease: "power2.inOut" });
  gsap.from(".brand__tenon", { x: 18, duration: 1, delay: 0.5, ease: "back.out(2)" });
  gsap.from(".site-header .nav, .brand__txt", { y: -14, autoAlpha: 0, duration: 0.8, delay: 0.3, stagger: 0.1, clearProps: "transform" });
  gsap.from(".scroll-cue, .wall__tag", { autoAlpha: 0, duration: 1, delay: 1 });

  // ---------- 1. Hero : la fenêtre s'ouvre au scroll ----------
  var hero = document.querySelector(".hero");
  var heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero, start: "top top",
      end: function () { return "+=" + Math.round(window.innerHeight * 1.6); },
      scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) { hero.classList.toggle("is-open", self.progress > 0.62); }
    }
  });
  heroTl
    .to(".scroll-cue", { autoAlpha: 0, y: 12, duration: 0.08 }, 0)
    .to(".handle__lever", { rotation: -90, duration: 0.12, ease: "power1.inOut" }, 0.02)
    .to(".leaf--l", { rotationY: -112, duration: 0.5, ease: "power2.inOut" }, 0.12)
    .to(".leaf--r", { rotationY: 112, duration: 0.5, ease: "power2.inOut" }, 0.14)
    .to(".wall__tag", { autoAlpha: 0, duration: 0.15 }, 0.3)
    .to(".hero__wall", { scale: 4.8, duration: 0.5, ease: "power2.in" }, 0.42)
    .to(".hero__wall", { autoAlpha: 0, duration: 0.1 }, 0.84)
    .fromTo(".hero__content", { scale: 0.92, autoAlpha: 0.55 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.45)
    .fromTo(".hero__sky", { scale: 1.12 }, { scale: 1, duration: 0.6 }, 0.35)
    .fromTo(".hero__hills", { yPercent: 12 }, { yPercent: 0, duration: 0.6 }, 0.4);

  // focus clavier dans le hero fermé → on ouvre directement la fenêtre
  hero.addEventListener("focusin", function () {
    if (!hero.classList.contains("is-open")) window.scrollTo(0, heroTl.scrollTrigger.end);
  });

  // ---------- En-tête & progression ----------
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var y = self.scroll(), past = heroTl.scrollTrigger.end - 80;
      header.classList.toggle("is-solid", y > past);
      var hide = self.direction === 1 && y > past + 300 && !nav.classList.contains("is-open");
      header.classList.toggle("is-hidden", hide);
    }
  });
  gsap.to(".progress__bar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  // ---------- Apparitions & tracés ----------
  function draw(svg, delay) {
    if (!svg) return;
    gsap.to(svg.querySelectorAll("*"), { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, delay: delay || 0, ease: "power2.inOut" });
  }
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%", once: true,
    onEnter: function (els) {
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 });
      els.forEach(function (el, i) {
        var c = el.querySelector(".cote span");
        if (c) gsap.from(c, { scaleX: 0, duration: 1.1, delay: 0.25, ease: "power2.inOut" });
        draw(el.querySelector(".card__ico"), 0.2 + i * 0.12);
      });
    }
  });

  // ---------- 2. Vue éclatée ----------
  var layers = gsap.utils.toArray(".ex-layer");
  var legend = gsap.utils.toArray(".ex-legend li");
  var exState = document.querySelector("[data-ex-state]");
  var VX = -105, VY = 44;
  gsap.set(".ex-badge", { autoAlpha: 0 });
  function setLegend(p) {
    var on = p < 0.5 ? Math.ceil(p / 0.1) : p < 0.62 ? 5 : Math.max(0, 5 - Math.ceil((p - 0.62) / 0.06));
    var cur = p < 0.5 ? on - 1 : p < 0.62 ? 4 : on - 1;
    legend.forEach(function (li, i) {
      li.classList.toggle("is-on", i < on);
      li.classList.toggle("is-cur", i === cur);
    });
    if (exState) exState.textContent = p < 0.04 || p > 0.93 ? "Assemblée" : p < 0.5 ? "Démontage…" : p < 0.62 ? "Éclatée" : "Remontage…";
  }
  mm.add({ desk: "(min-width: 900px)", mob: "(max-width: 899px)" }, function (ctx) {
    var desk = ctx.conditions.desk;
    var tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: desk
        ? { trigger: ".explode__pin", start: "top top", end: "+=220%", scrub: 0.8, pin: true, anticipatePin: 1, onUpdate: function (s) { setLegend(s.progress); } }
        : { trigger: ".explode__body", start: "top 64px", end: "+=200%", scrub: 0.8, pin: true, anticipatePin: 1, onUpdate: function (s) { setLegend(s.progress); } }
    });
    layers.forEach(function (g, i) {
      var k = parseFloat(g.style.getPropertyValue("--k"));
      var badge = g.querySelector(".ex-badge");
      var at = i * 0.1;
      if (k === 0) tl.to(g, { y: -16, duration: 0.1 }, at);
      else tl.to(g, { x: k * VX, y: k * VY, duration: 0.12 }, at);
      tl.to(badge, { autoAlpha: 1, duration: 0.05, ease: "none" }, at + 0.06);
    });
    tl.to({}, { duration: 0.12 }, 0.5); // pause : vue éclatée
    tl.to(layers, { x: 0, y: 0, duration: 0.3, stagger: { each: 0.03, from: "end" } }, 0.62);
    tl.to(".ex-badge", { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.62);
    tl.to({}, { duration: 0.08 }, 0.92);
    return function () { setLegend(0); };
  });

  // ---------- 4. Aménagement : galerie horizontale ----------
  var amen = document.querySelector(".amen");
  var track = document.querySelector(".amen__track");
  amen.classList.add("amen--h");
  var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
  var hScroll = gsap.to(track, {
    x: function () { return -dist(); }, ease: "none",
    scrollTrigger: {
      trigger: amen, start: "top top",
      end: function () { return "+=" + dist(); },
      scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true
    }
  });
  gsap.utils.toArray(".panel").forEach(function (p) {
    var art = p.querySelector(".panel__art");
    ScrollTrigger.create({
      trigger: p, containerAnimation: hScroll, start: "left 82%", once: true,
      onEnter: function () { draw(art); }
    });
    gsap.fromTo(p, { rotation: 2.5, yPercent: 6 }, {
      rotation: 0, yPercent: 0, ease: "none",
      scrollTrigger: { trigger: p, containerAnimation: hScroll, start: "left right", end: "left 55%", scrub: true }
    });
    gsap.fromTo(p.querySelector(".panel__n"), { xPercent: 120 }, {
      xPercent: -40, ease: "none",
      scrollTrigger: { trigger: p, containerAnimation: hScroll, start: "left right", end: "right left", scrub: true }
    });
  });

  // ---------- Méthode : le mètre ruban se déroule ----------
  mm.add({ desk: "(min-width: 900px)", mob: "(max-width: 899px)" }, function (ctx) {
    var desk = ctx.conditions.desk;
    gsap.fromTo(".tape__ruler", desk ? { xPercent: -100 } : { yPercent: -100 }, {
      xPercent: 0, yPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".tape", start: desk ? "top 78%" : "top 70%", end: desk ? "bottom 60%" : "bottom 55%", scrub: 0.6 }
    });
  });
  gsap.utils.toArray(".step").forEach(function (s, i) {
    gsap.from(s, { autoAlpha: 0, y: 24, duration: 0.8, delay: i * 0.08, scrollTrigger: { trigger: s, start: "top 85%", once: true } });
  });

  // ---------- Matériaux : les coupes apparaissent ----------
  gsap.from(".mat-svg", { autoAlpha: 0, y: 40, duration: 1.1, scrollTrigger: { trigger: ".mat", start: "top 80%", once: true } });
  gsap.from(".mat-toggle", { autoAlpha: 0, y: -14, duration: 0.8, delay: 0.3, scrollTrigger: { trigger: ".mat", start: "top 80%", once: true } });
  gsap.from(".cmp__row", { autoAlpha: 0, x: 24, duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: ".cmp", start: "top 85%", once: true } });

  // ---------- 5. Curseur copeau & micro-interactions ----------
  var fine = window.matchMedia("(pointer: fine)").matches;
  var cursor = document.querySelector(".copeau-cursor");
  if (fine && cursor) {
    var xTo = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power3" });
    var yTo = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power3" });
    var rTo = gsap.quickTo(cursor, "rotation", { duration: 0.8, ease: "power2" });
    var lastX = 0;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      root.classList.add("has-cursor");
      xTo(e.clientX + 22); yTo(e.clientY + 22);
      rTo((e.clientX - lastX) * 4); lastX = e.clientX;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { root.classList.remove("has-cursor"); });
    var hot = "a, button, input, select, textarea, label";
    document.addEventListener("pointerover", function (e) { cursor.classList.toggle("is-hover", !!e.target.closest(hot)); });
    window.addEventListener("pointerdown", function () { cursor.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { cursor.classList.remove("is-down"); });
  }
  // éclats de copeaux au clic sur les boutons
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".btn, .mat-toggle__btn, .card__link");
    if (!b) return;
    var x = e.clientX, y = e.clientY;
    if (!x && !y) { var r = b.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    chips(x, y, 9);
  });
  // boutons « aimantés » (léger)
  if (fine) {
    document.querySelectorAll(".btn").forEach(function (b) {
      var bx = gsap.quickTo(b, "x", { duration: 0.4 }), by = gsap.quickTo(b, "y", { duration: 0.4 });
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.18); by((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener("pointerleave", function () { bx(0); by(0); });
    });
  }

  // recalcul après chargement des polices
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
