/* Pizz'O'Matic [nom commercial à confirmer] — motion & interactions */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!gsap && !reduce;
  if (gsap && ST) gsap.registerPlugin(ST);

  /* ---------------------------------------------------------
     1. Pictos pixel
     --------------------------------------------------------- */
  const PAL = { K: "#e9913a", Y: "#ffd23f", R: "#ff4b3e", W: "#fff3d6", D: "#0b1238", G: "#3fe08a", O: "#ff9a3d" };
  const PIX = {
    slice: ["KKKKKKKKK", "KYYRYYYYK", ".YYYYYRY.", "..YRYYY..", "..YYYYY..", "...YRY...", "...YYY...", "....Y...."],
    star: ["...Y...", "...Y...", "..YYY..", "YYYWYYY", "..YYY..", "...Y...", "...Y..."],
    bolt: ["....YY", "...YY.", "..YY..", ".YYYYY", "...YY.", "..YY..", ".YY...", "YY...."],
    pin: ["..RRR..", ".RRRRR.", "RRRWRRR", "RRWWWRR", "RRRWRRR", ".RRRRR.", "..RRR..", "...R..."],
    heart: [".RR.RR.", "RRRRRRR", "RRWRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."],
    camera: ["..YYY....", "YYYYYYYYY", "YDDDDDDDY", "YDDWWWDDY", "YDDWDWDDY", "YDDWWWDDY", "YDDDDDDDY", "YYYYYYYYY"],
    phone: [".YYYYY.", ".YDDDY.", ".YDDDY.", ".YDDDY.", ".YDDDY.", ".YYYYY.", ".YYWYY.", ".YYYYY."],
    mail: ["YYYYYYYYY", "YWYYYYYWY", "YYWYYYWYY", "YYYWYWYYY", "YYYYWYYYY", "YYYYYYYYY", "YYYYYYYYY"]
  };
  const pixelSVG = (name) => {
    const rows = PIX[name];
    if (!rows) return "";
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    let rects = "";
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (PAL[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${PAL[ch]}"/>`;
      });
    });
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${rects}</svg>`;
  };
  $$("[data-pixel]").forEach((el) => { el.innerHTML = pixelSVG(el.dataset.pixel); });

  /* ---------------------------------------------------------
     2. Pizzas en SVG (générées, déterministes)
     --------------------------------------------------------- */
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const polar = (r, a) => [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
  const scatter = (rand, n, maxR, minR = 0) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.7;
      const r = minR + Math.sqrt(rand()) * (maxR - minR);
      pts.push(polar(r, a));
    }
    return pts;
  };
  const f = (n) => n.toFixed(1);

  function pizzaSVG(kind) {
    const rand = rng(kind.length * 977 + kind.charCodeAt(0) * 31);
    let s = `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">`;
    // pâte
    s += `<circle cx="100" cy="100" r="97" fill="#c97a32"/><circle cx="100" cy="100" r="93" fill="#e9a24b"/>`;
    for (let i = 0; i < 26; i++) {
      const [x, y] = polar(86 + rand() * 8, rand() * Math.PI * 2);
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2 + rand() * 3)}" ry="${f(1.2 + rand() * 1.5)}" fill="#b5682a" opacity=".55"/>`;
    }
    // sauce
    s += `<circle cx="100" cy="100" r="81" fill="#c8331f"/><circle cx="100" cy="100" r="77" fill="#e0452f"/>`;

    if (kind === "margherita") {
      scatter(rand, 9, 58, 8).forEach(([x, y]) => {
        const rx = 11 + rand() * 7, ry = 9 + rand() * 5, rot = rand() * 180;
        s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="#fff4dc"/>`;
        s += `<ellipse cx="${f(x - 3)}" cy="${f(y - 3)}" rx="${f(rx * 0.4)}" ry="${f(ry * 0.3)}" fill="#fff" opacity=".7"/>`;
      });
      scatter(rand, 6, 62, 14).forEach(([x, y]) => {
        const rot = rand() * 180;
        s += `<g transform="rotate(${f(rot)} ${f(x)} ${f(y)})"><ellipse cx="${f(x)}" cy="${f(y)}" rx="11" ry="5.5" fill="#2f9a42"/><path d="M${f(x - 9)} ${f(y)}h18" stroke="#1f6e2e" stroke-width="1.2"/></g>`;
      });
    } else if (kind === "reine") {
      s += `<circle cx="100" cy="100" r="75" fill="#ffe3a0" opacity=".55"/>`;
      scatter(rand, 8, 60, 10).forEach(([x, y]) => {
        const rot = rand() * 90;
        s += `<rect x="${f(x - 11)}" y="${f(y - 8)}" width="22" height="16" rx="5" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="#f29a9a" stroke="#d76d6d" stroke-width="1.5"/>`;
      });
      scatter(rand, 8, 62, 18).forEach(([x, y]) => {
        const rot = rand() * 360;
        s += `<g transform="rotate(${f(rot)} ${f(x)} ${f(y)})"><path d="M${f(x - 10)} ${f(y)}a10 9 0 0 1 20 0z" fill="#ead7b4" stroke="#a88a5e" stroke-width="1.4"/><rect x="${f(x - 3.5)}" y="${f(y)}" width="7" height="8" rx="2" fill="#e2cda6" stroke="#a88a5e" stroke-width="1.2"/></g>`;
      });
    } else {
      s += `<circle cx="100" cy="100" r="77" fill="#ffd98a"/>`;
      const cheeses = [["#fff8e8", null], ["#fbe39a", null], ["#f4efe2", "#5b7fd6"], ["#ffbf5e", null]];
      cheeses.forEach(([col, dots], q) => {
        for (let i = 0; i < 4; i++) {
          const a = (q / 4) * Math.PI * 2 + 0.25 + rand() * 1.1;
          const [x, y] = polar(14 + rand() * 48, a);
          const rx = 12 + rand() * 9, ry = 9 + rand() * 7;
          s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="${col}"/>`;
          if (dots) for (let d = 0; d < 4; d++) s += `<circle cx="${f(x + (rand() - 0.5) * rx)}" cy="${f(y + (rand() - 0.5) * ry)}" r="${f(1 + rand() * 1.6)}" fill="${dots}" opacity=".75"/>`;
        }
      });
      for (let i = 0; i < 10; i++) {
        const [x, y] = polar(rand() * 66, rand() * Math.PI * 2);
        s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + rand() * 4)}" ry="${f(2 + rand() * 2)}" fill="#c9782f" opacity=".4"/>`;
      }
    }
    // découpe
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI + 0.2;
      const [x1, y1] = polar(90, a), [x2, y2] = polar(90, a + Math.PI);
      s += `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="#5a1e0a" stroke-opacity=".22" stroke-width="1.6"/>`;
    }
    s += `<ellipse cx="78" cy="66" rx="40" ry="20" fill="#fff" opacity=".07" transform="rotate(-30 78 66)"/></svg>`;
    return s;
  }

  /* ---------------------------------------------------------
     3. Ciel étoilé + particules (canvas)
     --------------------------------------------------------- */
  (function starfield() {
    const cv = $("#stars");
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, stars = [], embers = [], raf = 0, last = 0, shoot = null, nextShoot = 6;
    const rand = Math.random;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(240, Math.round((W * H) / 6500));
      stars = Array.from({ length: n }, () => ({
        x: rand() * W, y: rand() * H, r: 0.35 + rand() * 1.25,
        a: 0.25 + rand() * 0.7, p: rand() * Math.PI * 2, s: 0.25 + rand() * 0.9,
        c: rand() < 0.12 ? "255,210,63" : rand() < 0.3 ? "170,190,255" : "255,255,255",
        z: 0.02 + rand() * 0.06
      }));
      embers = Array.from({ length: Math.round(Math.min(34, W / 40)) }, () => newEmber(true));
    }
    function newEmber(anywhere) {
      return {
        x: rand() * W, y: anywhere ? rand() * H : H + 10, r: 0.8 + rand() * 1.8,
        vy: 8 + rand() * 16, ph: rand() * 6.28, amp: 6 + rand() * 14,
        c: rand() < 0.55 ? "255,75,62" : "255,210,63", a: 0.25 + rand() * 0.45
      };
    }
    function draw(t, dt) {
      ctx.clearRect(0, 0, W, H);
      const sy = window.scrollY || 0;
      for (const st of stars) {
        const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(st.p + t * st.s);
        let y = (st.y - sy * st.z) % H; if (y < 0) y += H;
        ctx.fillStyle = `rgba(${st.c},${(st.a * tw).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(st.x, y, st.r, 0, 6.283); ctx.fill();
      }
      for (const e of embers) {
        if (!reduce) { e.y -= e.vy * dt; if (e.y < -20) Object.assign(e, newEmber(false)); }
        const x = e.x + Math.sin(e.ph + t * 0.6) * e.amp;
        const fade = Math.min(1, e.y / (H * 0.5));
        ctx.fillStyle = `rgba(${e.c},${(e.a * 0.25 * fade).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, e.y, e.r * 3.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = `rgba(${e.c},${(e.a * fade).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, e.y, e.r, 0, 6.283); ctx.fill();
      }
      // étoile filante occasionnelle (lente, discrète)
      if (!reduce) {
        nextShoot -= dt;
        if (!shoot && nextShoot <= 0) {
          shoot = { x: rand() * W * 0.7, y: rand() * H * 0.35, life: 0 };
          nextShoot = 9 + rand() * 8;
        }
        if (shoot) {
          shoot.life += dt;
          const k = shoot.life / 1.4;
          if (k >= 1) shoot = null;
          else {
            const x = shoot.x + k * 260, y = shoot.y + k * 110;
            const g = ctx.createLinearGradient(x - 90, y - 38, x, y);
            g.addColorStop(0, "rgba(255,255,255,0)");
            g.addColorStop(1, `rgba(255,243,196,${(0.7 * Math.sin(k * Math.PI)).toFixed(3)})`);
            ctx.strokeStyle = g; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(x - 90, y - 38); ctx.lineTo(x, y); ctx.stroke();
          }
        }
      }
    }
    function loop(now) {
      const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016);
      last = t; draw(t, dt);
      raf = requestAnimationFrame(loop);
    }
    build();
    if (reduce) draw(0, 0);
    else raf = requestAnimationFrame(loop);
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { build(); if (reduce) draw(0, 0); }, 150);
    });
    if (reduce) window.addEventListener("scroll", () => draw(0, 0), { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (reduce) return;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
  })();

  /* ---------------------------------------------------------
     4. En-tête & navigation mobile
     --------------------------------------------------------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $(".nav-toggle"), nav = $("#nav");
  const setNav = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setNav(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); toggle.focus(); }
  });

  /* ---------------------------------------------------------
     5. Titre néon : allumage avec « buzz » doux
     --------------------------------------------------------- */
  const neonLines = $$("[data-neon]");
  const neonChars = [];
  neonLines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = "";
    words.forEach((w, wi) => {
      const ws = document.createElement("span");
      ws.className = "w";
      [...w].forEach((c) => {
        const cs = document.createElement("span");
        cs.className = "ch"; cs.textContent = c;
        ws.appendChild(cs); neonChars.push(cs);
      });
      line.appendChild(ws);
      if (wi < words.length - 1) line.appendChild(document.createTextNode(" "));
    });
  });

  if (motion) {
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".hero__sun", { opacity: 0, scale: 0.85, duration: 1.6 }, 0)
      .from("#heroVm", { y: 90, opacity: 0, duration: 1.3 }, 0.1)
      .from(".hero__kicker", { y: 18, opacity: 0, duration: 0.7 }, 0.2);

    // Allumage lettre par lettre : fondus lents (≥ 0,2 s), jamais de flash rapide
    gsap.set(neonChars, { opacity: 0.08 });
    const buzz = gsap.timeline({ delay: 0.45 });
    neonLines.forEach((line, li) => {
      $$(".ch", line).forEach((c, i) => {
        const t = gsap.timeline()
          .to(c, { opacity: 0.7, duration: 0.24, ease: "sine.inOut" })
          .to(c, { opacity: 0.28, duration: 0.26, ease: "sine.inOut" })
          .to(c, { opacity: 1, duration: 0.45, ease: "sine.out" });
        buzz.add(t, li * 0.75 + i * 0.03 + Math.random() * 0.3);
      });
    });
    // un petit « grésillement » tardif sur deux lettres, lent
    const pick = neonChars.filter((_, i) => i % 7 === 3).slice(0, 2);
    buzz.to(pick, { opacity: 0.45, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, "+=0.5");

    gsap.from([".hero__lead", ".hero__cta", ".hero__note"], { y: 24, opacity: 0, duration: 0.8, stagger: 0.12, delay: 1.3, ease: "power3.out" });
  }

  /* ---------------------------------------------------------
     6. Distributeur du hero : vie au repos
     --------------------------------------------------------- */
  const heroNames = ["MARGHERITA", "REINE", "4 FROMAGES"];
  if (motion) {
    gsap.to(".vm-bulbs circle", { opacity: 0.25, duration: 0.8, ease: "sine.inOut", stagger: { each: 0.2, repeat: -1, yoyo: true } });
    gsap.to(".vm-halo", { opacity: 0.85, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".vm-strip", { opacity: 0.4, duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 1 });
    gsap.to(".vm-oven", { opacity: 0.78, duration: 1.8, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".vm-coil", { opacity: 0.55, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".vm-oven-pizza", { rotation: 360, svgOrigin: "136 334", duration: 12, ease: "none", repeat: -1 });
    gsap.to(".vm-screen-pizza", { rotation: 360, svgOrigin: "184 200", duration: 7, ease: "none", repeat: -1 });
    gsap.to(".vm-cursor", { opacity: 0.1, duration: 0.8, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".vm-ok-glow", { opacity: 0.75, scale: 1.12, svgOrigin: "256 336", duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true });

    const keys = $$(".vm-key__lit");
    const nameEl = $("#heroScreenName");
    const steam = $$(".vm-steam path");
    let k = 0;
    const cycle = gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 2.6 });
    [9, 0, 4].forEach((idx, n) => {
      cycle.to(keys[idx], { opacity: 0.85, duration: 0.2, ease: "sine.out" }, n * 0.45)
           .to(keys[idx], { opacity: 0, duration: 0.35, ease: "sine.in" }, n * 0.45 + 0.25);
    });
    cycle
      .call(() => { k = (k + 1) % heroNames.length; nameEl.textContent = heroNames[k]; }, null, 1.5)
      .fromTo(nameEl, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.4 }, 1.5)
      .to(".vm-oven", { opacity: 1, duration: 0.6 }, 1.6)
      .to(".vm-flap, .vm-flap-handle", { scaleY: 0.12, transformOrigin: "50% 0%", duration: 0.6, ease: "power2.inOut" }, 3.4)
      .to(".vm-flap-handle", { opacity: 0, duration: 0.2 }, 3.4)
      .fromTo(".vm-hatch-box", { y: 12 }, { y: 0, duration: 0.7, ease: "back.out(1.6)" }, 3.7)
      .set(".vm-steam", { opacity: 1 }, 3.8)
      .fromTo(steam, { y: 14, opacity: 0 }, { y: -18, opacity: 0.8, duration: 1.1, stagger: 0.18, ease: "sine.out" }, 3.8)
      .to(steam, { opacity: 0, duration: 0.7, stagger: 0.18 }, 4.9)
      .to(".vm-flap, .vm-flap-handle", { scaleY: 1, duration: 0.6, ease: "power2.inOut" }, 5.6)
      .to(".vm-flap-handle", { opacity: 1, duration: 0.3 }, 5.9);

    // Légère inclinaison au pointeur (desktop)
    const wrap = $("#heroVm");
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const hero = $(".hero");
      const rx = gsap.quickTo(wrap, "rotationX", { duration: 0.8, ease: "power3.out" });
      const ry = gsap.quickTo(wrap, "rotationY", { duration: 0.8, ease: "power3.out" });
      gsap.set(wrap, { transformPerspective: 900 });
      hero.addEventListener("pointermove", (e) => {
        const b = hero.getBoundingClientRect();
        const dx = (e.clientX - b.left) / b.width - 0.5, dy = (e.clientY - b.top) / b.height - 0.5;
        ry(dx * 10); rx(-dy * 6);
      });
      hero.addEventListener("pointerleave", () => { rx(0); ry(0); });
    }
    if (ST) {
      gsap.to(".hero__visual", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__sun", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
  }

  /* ---------------------------------------------------------
     7. Distributeur interactif
     --------------------------------------------------------- */
  const PIZZAS = [
    { code: "A1", name: "Margherita", screen: "MARGHERITA", kind: "margherita", desc: "La classique : tomate, mozzarella, basilic." },
    { code: "A2", name: "Reine", screen: "REINE", kind: "reine", desc: "Tomate, mozzarella, jambon et champignons." },
    { code: "A3", name: "4 fromages", screen: "4 FROMAGES", kind: "4fromages", desc: "Quatre fromages qui filent, pour les gourmands." }
  ];
  const SVGS = PIZZAS.map((p) => pizzaSVG(p.kind));

  const vm = $("#vm");
  const opts = $$(".screen__opt", vm);
  const status = $("#vmStatus");
  const fill = $(".gauge__fill", vm);
  const pct = $("#cookPct");
  const again = $("#vmAgain");
  const goBtns = $$('[data-act="go"]');
  const padBtns = $$(".pad-btn, .pad-ok", vm);
  const thumb = $("#pizzaThumb"), ovenPizza = $("#ovenPizza"), boxPizza = $("#boxPizza");
  let current = 0, state = "idle", timers = [];

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  function render(i, animate) {
    const p = PIZZAS[i];
    $("#pizzaCode").textContent = p.code;
    $("#pizzaName").textContent = p.name;
    $("#pizzaDesc").textContent = p.desc;
    thumb.innerHTML = SVGS[i];
    ovenPizza.innerHTML = SVGS[i];
    boxPizza.innerHTML = SVGS[i];
    if (animate && motion) {
      gsap.fromTo(thumb, { scale: 0.6, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
      gsap.fromTo(".pizza-card__body", { x: 10, opacity: 0.3 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }
  function select(i, focus) {
    if (state !== "idle") return;
    current = (i + PIZZAS.length) % PIZZAS.length;
    opts.forEach((o, n) => {
      const on = n === current;
      o.setAttribute("aria-checked", String(on));
      o.tabIndex = on ? 0 : -1;
    });
    if (focus) opts[current].focus();
    status.textContent = `SÉLECTION : ${PIZZAS[current].screen}`;
    render(current, true);
  }
  function setBusy(busy) {
    [...opts, ...padBtns, ...goBtns].forEach((b) => b.setAttribute("aria-disabled", String(busy)));
  }
  function inView(el) {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  }
  function go(fromOutside) {
    if (state === "served") { reset(); }
    if (state !== "idle") return;
    state = "cooking";
    vm.dataset.state = "cooking";
    setBusy(true);
    const p = PIZZAS[current];
    status.textContent = `CUISSON : ${p.screen}…`;
    if (fromOutside && !inView(vm)) vm.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });

    const dur = reduce ? 1 : 3400;
    fill.style.transition = `transform ${dur}ms linear`;
    void fill.offsetWidth;
    fill.style.transform = "scaleX(1)";
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      pct.textContent = `${Math.round(k * 100)}%`;
      if (k < 1 && state === "cooking") requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    later(() => serve(), dur + (reduce ? 0 : 150));
  }
  function serve() {
    state = "served";
    pct.textContent = "100%";
    vm.dataset.state = "served";
    status.textContent = `PRÊTE ! ${PIZZAS[current].screen} → TRAPPE`;
    later(() => {
      again.hidden = false;
      if (motion) gsap.fromTo(again, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, clearProps: "transform" });
      const a = document.activeElement;
      if (a && vm.contains(a) || goBtns.includes(a)) again.focus({ preventScroll: true });
    }, reduce ? 0 : 2300);
  }
  function reset() {
    clearTimers();
    state = "idle";
    vm.dataset.state = "idle";
    fill.style.transition = "none";
    fill.style.transform = "scaleX(0)";
    pct.textContent = "0%";
    again.hidden = true;
    setBusy(false);
    status.textContent = `SÉLECTION : ${PIZZAS[current].screen}`;
  }

  opts.forEach((o, n) => {
    o.addEventListener("click", () => select(n, false));
    o.addEventListener("keydown", (e) => {
      const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in map) { e.preventDefault(); select(current + map[e.key], true); }
      else if (e.key === "Home") { e.preventDefault(); select(0, true); }
      else if (e.key === "End") { e.preventDefault(); select(PIZZAS.length - 1, true); }
      else if (e.key === "Enter") { e.preventDefault(); go(false); }
    });
  });
  $$("[data-act]").forEach((b) => b.addEventListener("click", () => {
    const act = b.dataset.act;
    if (act === "prev") select(current - 1, false);
    else if (act === "next") select(current + 1, false);
    else if (act === "go") go(!vm.contains(b));
  }));
  again.addEventListener("click", () => {
    reset();
    opts[current].focus({ preventScroll: true });
  });
  render(0, false);

  /* ---------------------------------------------------------
     8. « Comment ça marche » : séquence
     --------------------------------------------------------- */
  const steps = $(".steps");
  if (motion && ST) {
    const desk = window.matchMedia("(min-width: 960px)").matches;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ".steps__list", start: "top 78%", once: true },
      onComplete: () => steps.classList.add("is-live")
    });
    const items = $$(".step"), links = $$(".step__link span");
    items.forEach((it, i) => {
      tl.from(it, { y: 50, opacity: 0, duration: 0.7, ease: "power3.out" }, i * 0.55)
        .from($(".step__icon", it), { scale: 0.4, rotation: -12, opacity: 0, duration: 0.7, ease: "back.out(1.8)" }, i * 0.55 + 0.15);
      if (links[i]) tl.from(links[i], { [desk ? "scaleX" : "scaleY"]: 0, duration: 0.45, ease: "power2.inOut" }, i * 0.55 + 0.4);
    });
  } else if (!reduce) {
    steps.classList.add("is-live");
  }

  /* ---------------------------------------------------------
     9. Emplacements : pins néon
     --------------------------------------------------------- */
  const pins = $$(".pin"), places = $$(".place");
  const setActive = (n) => {
    pins.forEach((p) => p.classList.toggle("is-active", p.dataset.pin === n));
    places.forEach((p) => p.classList.toggle("is-active", p.dataset.pin === n));
  };
  [...pins, ...places].forEach((el) => {
    el.addEventListener("mouseenter", () => setActive(el.dataset.pin));
    el.addEventListener("mouseleave", () => setActive(null));
    el.addEventListener("focus", () => setActive(el.dataset.pin));
    el.addEventListener("blur", () => setActive(null));
  });
  pins.forEach((p) => p.addEventListener("click", () => {
    setActive(p.dataset.pin);
    const target = places.find((pl) => pl.dataset.pin === p.dataset.pin);
    if (target && !inView(target)) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }));
  if (motion && ST) {
    gsap.from(pins, {
      y: -60, opacity: 0, duration: 0.9, ease: "bounce.out", stagger: 0.22,
      scrollTrigger: { trigger: ".map", start: "top 70%", once: true }
    });
  }

  /* ---------------------------------------------------------
     10. Horloge (heure de Paris)
     --------------------------------------------------------- */
  const hEl = $("#clockH"), mEl = $("#clockM");
  const fmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Paris" });
  const updateClock = () => {
    const parts = fmt.formatToParts(new Date());
    hEl.textContent = parts.find((p) => p.type === "hour").value;
    mEl.textContent = parts.find((p) => p.type === "minute").value;
  };
  updateClock();
  setInterval(updateClock, 15000);

  /* ---------------------------------------------------------
     11. Révélations au scroll
     --------------------------------------------------------- */
  if (motion && ST) {
    const els = $$("[data-reveal]");
    gsap.set(els, { opacity: 0, y: 34 });
    ST.batch(els, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, overwrite: true })
    });
    gsap.from(".clock", {
      scale: 0.9, opacity: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: ".clock-band", start: "top 75%", once: true }
    });
    window.addEventListener("load", () => ST.refresh());
  }

  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
