/* =========================================================
   Le P’tit Donjon — motion design
   GSAP 3.12.5 + ScrollTrigger + Flip (cdnjs)
   N’anime que transform et opacity.
   ========================================================= */
(function () {
  "use strict";
  window.__donjonReady = true;

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduceMotion;

  if (!animate) root.classList.remove("js-anim");

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Texture de grain (canvas → data URL) ---------- */
  (function grain() {
    try {
      var c = document.createElement("canvas");
      c.width = c.height = 140;
      var ctx = c.getContext("2d");
      var img = ctx.createImageData(140, 140);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = Math.random() < 0.5 ? 14 : 0;
      }
      ctx.putImageData(img, 0, 0);
      root.style.setProperty("--grain", "url(" + c.toDataURL("image/png") + ")");
    } catch (e) { /* texture facultative */ }
  })();

  /* ---------- En-tête : fond au scroll ---------- */
  var header = $(".site-header");
  var hero = $(".hero");
  var callSticky = $("#call-sticky");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 40);
    callSticky.classList.toggle("is-visible", y > (hero ? hero.offsetHeight * 0.55 : 300));
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var navToggle = $(".nav-toggle");
  var nav = $("#nav");
  function setNav(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }
  navToggle.addEventListener("click", function () {
    setNav(navToggle.getAttribute("aria-expanded") !== "true");
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); navToggle.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
  });

  /* ---------- Onglets Sur place / À emporter / Livraison ---------- */
  var tabs = $$(".tab");
  var tablist = $(".tablist");
  var scooterPlayed = false;
  function activateTab(tab, focus) {
    var index = tabs.indexOf(tab);
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      if (on && animate) panelIn(panel);
    });
    tablist.style.setProperty("--i", index);
    if (focus) tab.focus();
    if (tab.id === "tab-livraison" && animate) runScooter();
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.getAttribute("aria-selected") === "true" && tab.id === "tab-livraison" && animate) { runScooter(); return; }
      activateTab(tab, false);
    });
    tab.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(tab), next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activateTab(next, true); }
    });
  });

  /* ---------- Filtres de la carte ---------- */
  var chips = $$(".chip");
  var cards = $$(".card");
  var status = $("#filter-status");
  var labels = { all: "tous les produits", burgers: "burgers", tacos: "tacos", sides: "sides", desserts: "desserts", boissons: "boissons" };
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      if (animate) {
        // Les cartes pas encore « collées » au scroll deviennent visibles avant le Flip
        gsap.killTweensOf(cards);
        gsap.set(cards, { opacity: 1, clearProps: "transform" });
      }
      var state = animate && window.Flip ? Flip.getState(cards) : null;
      var count = 0;
      cards.forEach(function (card) {
        var show = f === "all" || card.dataset.cat === f;
        card.hidden = !show;
        if (show) count++;
      });
      status.textContent = count + " exemple" + (count > 1 ? "s" : "") + " affiché" + (count > 1 ? "s" : "") + " : " + labels[f];
      if (state) {
        Flip.from(state, {
          duration: 0.65,
          ease: "back.out(1.5)",
          absolute: true,
          stagger: 0.03,
          onComplete: function () { ScrollTrigger.refresh(); },
          onEnter: function (els) {
            return gsap.fromTo(els, { opacity: 0, scale: 0.4, rotation: -15 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.05 });
          },
          onLeave: function (els) {
            return gsap.to(els, { opacity: 0, scale: 0.4, rotation: 12, duration: 0.35, ease: "power2.in" });
          }
        });
      }
    });
  });

  if (!animate) {
    // Version statique : tout est déjà visible.
    $$("[data-stamp]").forEach(function (el) { el.classList.add("is-split"); });
    return;
  }

  /* =========================================================
     À partir d’ici : animations GSAP
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);

  /* ---------- 1. HERO : tampon lettre par lettre + mascotte ---------- */
  var chars = [];
  $$("[data-stamp]").forEach(function (line) {
    var text = line.textContent;
    line.textContent = "";
    Array.from(text).forEach(function (ch) {
      var s = document.createElement("span");
      s.className = "char";
      s.textContent = ch === " " ? " " : ch;
      line.appendChild(s);
      chars.push(s);
    });
    line.classList.add("is-split");
  });

  var mascot = $(".mascot");
  var mascotWrap = $(".mascot-wrap");
  gsap.set(chars, { opacity: 0 });
  gsap.set(mascot, { opacity: 0, transformOrigin: "50% 100%" });
  gsap.set(".m-flag", { scaleX: 0, transformOrigin: "150px 60px" });
  gsap.set("[data-hero-fade], .eyebrow", { opacity: 0, y: 24 });
  gsap.set(".hero-sticker", { opacity: 0, scale: 0 });
  gsap.set(".sunburst", { opacity: 0, scale: 0.6 });

  var intro = gsap.timeline({ delay: 0.2, defaults: { overwrite: "auto" } });
  intro
    .to(".eyebrow", { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" })
    .to(".sunburst", { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0.1)
    .fromTo(mascot, { y: -420, opacity: 1, scaleX: 0.9, scaleY: 1.12 },
      { y: 0, scaleX: 1, scaleY: 1, duration: 1.15, ease: "bounce.out" }, 0.15)
    .to(mascot, { scaleY: 0.86, scaleX: 1.1, duration: 0.12, ease: "power2.out" }, ">-0.05")
    .to(mascot, { scaleY: 1, scaleX: 1, duration: 0.7, ease: "elastic.out(1.1, 0.35)" })
    .to(".m-flag", { scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" }, "-=0.6");

  // Titre façon tampon : chaque lettre « claque » sur la page.
  chars.forEach(function (c, i) {
    intro.fromTo(c,
      { opacity: 0, scale: 3.4, rotation: gsap.utils.random(-35, 35), y: -30 },
      { opacity: 1, scale: 1, rotation: gsap.utils.random(-5, 5), y: 0, duration: 0.32, ease: "power4.in" },
      0.35 + i * 0.075);
    intro.to(c, { scaleY: 0.82, scaleX: 1.12, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.out" }, 0.35 + i * 0.075 + 0.32);
  });
  intro
    .fromTo(".hero-title", { x: 0 }, { x: 5, duration: 0.05, repeat: 5, yoyo: true, ease: "none", clearProps: "x" }, ">-0.05")
    .to("[data-hero-fade]", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.8)", stagger: 0.12 }, "-=0.25")
    .to(".hero-sticker", {
      opacity: 1, scale: 1, duration: 0.6, ease: "back.out(3)", stagger: 0.14,
      rotation: function (i) { return [14, -5, -9][i]; }
    }, "-=0.4");

  // Mascotte vivante : balancement, salut, clignement, regard qui suit le curseur
  gsap.to(mascotWrap, { y: -10, duration: 1.7, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.8 });
  gsap.to(".m-arm-left", { rotation: 22, svgOrigin: "78 262", duration: 0.32, ease: "sine.inOut", repeat: -1, yoyo: true, repeatDelay: 0.05, delay: 1.6 });
  gsap.timeline({ repeat: -1, repeatDelay: 2.8, delay: 2.4 })
    .to(".m-eye", { scaleY: 0.08, transformOrigin: "50% 50%", duration: 0.08, ease: "power1.in" })
    .to(".m-eye", { scaleY: 1, duration: 0.14, ease: "power1.out" });

  var pupils = $$(".m-pupil").map(function (p) {
    return { x: gsap.quickTo(p, "x", { duration: 0.35, ease: "power3" }), y: gsap.quickTo(p, "y", { duration: 0.35, ease: "power3" }) };
  });
  window.addEventListener("pointermove", function (e) {
    var r = mascot.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height * 0.47;
    var dx = e.clientX - cx, dy = e.clientY - cy;
    var d = Math.max(1, Math.hypot(dx, dy));
    var k = Math.min(1, d / 260);
    pupils.forEach(function (p) { p.x((dx / d) * 7 * k); p.y((dy / d) * 8 * k); });
  }, { passive: true });

  // Petit saut au clic sur la mascotte
  mascot.addEventListener("click", function () {
    gsap.timeline()
      .to(mascot, { scaleY: 0.85, scaleX: 1.08, duration: 0.1, ease: "power2.out" })
      .to(mascot, { y: -70, scaleY: 1.08, scaleX: 0.94, duration: 0.32, ease: "power2.out" })
      .to(mascot, { rotation: 360, duration: 0.5, ease: "power2.inOut" }, "<")
      .to(mascot, { y: 0, scaleY: 1, scaleX: 1, duration: 0.6, ease: "bounce.out" })
      .set(mascot, { rotation: 0 });
  });

  // Le hero s’éloigne légèrement au scroll (parallaxe)
  gsap.to(".hero-visual", {
    yPercent: 14, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- 5. MARQUEES : défilement + accélération au scroll ---------- */
  var marquees = $$("[data-marquee]").map(function (track) {
    var dir = track.dataset.marquee === "right" ? 1 : -1;
    var tween = dir < 0
      ? gsap.to(track, { xPercent: -50, ease: "none", duration: 26, repeat: -1 })
      : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 30, repeat: -1 });
    return tween;
  });
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
      marquees.forEach(function (t) {
        t.timeScale(boost);
        gsap.to(t, { timeScale: 1, duration: 0.9, ease: "power2.out", overwrite: true });
      });
    }
  });

  /* ---------- 2. BURGER qui s’assemble au scroll ---------- */
  var layers = $$(".b-layer");
  var steps = $$(".build-steps li");
  gsap.set(layers, { y: -520, opacity: 0 });
  gsap.set(steps, { opacity: 0.28, x: -8 });
  gsap.set(".miam", { opacity: 0, scale: 0 });

  var mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 860px)", mobile: "(max-width: 859px)" }, function (ctx) {
    var build = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".build",
        start: "top top",
        end: ctx.conditions.desktop ? "+=2400" : "+=1800",
        scrub: 0.7,
        pin: ".build-pin",
        anticipatePin: 1
      }
    });
    layers.forEach(function (layer, i) {
      var at = i * 1;
      var isFlag = i === layers.length - 1;
      build.fromTo(layer,
        { y: isFlag ? -360 : -520, opacity: 0, rotation: isFlag ? -20 : (i % 2 ? 5 : -5), transformOrigin: isFlag ? "50% 100%" : "50% 50%" },
        { y: 0, opacity: 1, rotation: 0, duration: 1, ease: "bounce.out" }, at);
      build.to(steps[i], { opacity: 1, x: 0, duration: 0.4, ease: "back.out(2)" }, at + 0.35);
    });
    build
      .fromTo(".burger", { scaleY: 1 }, { scaleY: 0.92, scaleX: 1.04, transformOrigin: "50% 95%", duration: 0.25, ease: "power2.out" }, layers.length)
      .to(".burger", { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1, 0.35)" })
      .to(".miam", { opacity: 1, scale: 1, rotation: 12, duration: 0.6, ease: "back.out(3)" }, "-=0.5")
      .to({}, { duration: 0.6 }); // petite pause avant de libérer l’épingle
    return function () { gsap.set(layers, { clearProps: "transform" }); };
  });

  /* ---------- Révélations au scroll ---------- */
  gsap.set("[data-reveal]", { opacity: 0, y: 46 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.6)", stagger: 0.12, overwrite: true, clearProps: "transform" });
    }
  });

  // Les cartes « stickers » se collent une à une
  gsap.set(cards, { opacity: 0, y: 60, scale: 0.85 });
  ScrollTrigger.batch(cards, {
    start: "top 92%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(2.2)", stagger: 0.08, overwrite: true, clearProps: "transform" });
    }
  });

  // Filtres et onglets : apparition élastique
  gsap.from(".chip", {
    opacity: 0, y: 20, scale: 0.8, stagger: 0.06, duration: 0.5, ease: "back.out(2.5)",
    scrollTrigger: { trigger: ".filters", start: "top 90%", once: true }
  });
  gsap.from(".tablist", {
    opacity: 0, scale: 0.85, y: 30, duration: 0.7, ease: "back.out(2)",
    scrollTrigger: { trigger: ".tablist", start: "top 90%", once: true }
  });
  gsap.from(".panel:not([hidden])", {
    opacity: 0, y: 50, rotation: -1.5, duration: 0.8, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".tabs", start: "top 80%", once: true }
  });

  /* ---------- 4. Panneaux + scooter de livraison ---------- */
  function panelIn(panel) {
    gsap.fromTo(panel, { opacity: 0, y: 26, rotation: gsap.utils.random(-1.5, 1.5) },
      { opacity: 1, y: 0, rotation: 0, duration: 0.6, ease: "back.out(1.8)", overwrite: true });
    gsap.fromTo($$(".panel-ill, .panel-copy > *, .infolist li", panel),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out", delay: 0.1, overwrite: true });
    var dots = $$(".route circle", panel);
    if (dots.length) {
      gsap.fromTo(dots, { scale: 0, transformOrigin: "50% 50%" },
        { scale: 1, duration: 0.3, stagger: 0.12, ease: "back.out(4)", delay: 0.6 });
      gsap.fromTo($(".house", panel), { scale: 0, transformOrigin: "50% 100%" },
        { scale: 1, duration: 0.6, ease: "back.out(2.5)", delay: 1.3 });
    }
  }

  var scooter = $(".scooter");
  var scooterTl = null;
  function runScooter() {
    var lane = $(".scooter-lane");
    var w = lane.getBoundingClientRect().width;
    var sw = scooter.getBoundingClientRect().width || 220;
    if (scooterTl) scooterTl.kill();
    scooterTl = gsap.timeline();
    scooterTl
      .set(scooter, { x: -sw - 30, opacity: 1 })
      .to(scooter, { x: w + 30, duration: Math.max(2, w / 520), ease: "power1.inOut" }, 0)
      .to(".sc-wheel", { rotation: "+=1440", transformOrigin: "50% 50%", duration: Math.max(2, w / 520), ease: "power1.inOut" }, 0)
      .fromTo(".sc-body", { y: 0 }, { y: -3, duration: 0.09, repeat: Math.round(Math.max(2, w / 520) / 0.09), yoyo: true, ease: "sine.inOut" }, 0)
      .fromTo(".sc-lines", { opacity: 0.2, x: 0 }, { opacity: 0.7, x: -6, duration: 0.15, repeat: 12, yoyo: true, ease: "none" }, 0)
      .fromTo(".puff",
        { scale: 0.3, opacity: 0.9, x: 0, transformOrigin: "50% 50%" },
        { scale: 1.5, opacity: 0, x: -34, duration: 0.5, stagger: { each: 0.16, repeat: 4 }, ease: "power1.out" }, 0)
      .fromTo(scooter, { rotation: 0 }, { rotation: -6, transformOrigin: "80% 90%", duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 0.05)
      .set(scooter, { opacity: 0 });
    scooterPlayed = true;
  }

  // Si l’onglet Livraison n’a pas encore été ouvert, le scooter fait un passage d’invitation
  ScrollTrigger.create({
    trigger: ".tabs",
    start: "top 60%",
    once: true,
    onEnter: function () { gsap.delayedCall(1.1, function () { if (!scooterPlayed) runScooter(); }); }
  });

  // Recalcule les positions une fois les polices chargées
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
