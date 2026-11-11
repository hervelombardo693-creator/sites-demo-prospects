/* ==========================================================
   Bene Naranjas — motion design
   1. Agrumes qui tombent (petite physique maison)
   2. Parallaxe de l'étal
   3. Ardoise qui s'écrit toute seule
   4. Roue des saisons
   5. Épicerie (icônes animées) + reveals
   ========================================================== */
(() => {
  "use strict";

  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hasGSAP = () => typeof window.gsap !== "undefined";

  // PRNG déterministe pour les illustrations générées
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------------- Header, menu, progression ---------------- */
  const header = $("[data-header]");
  const toggle = $("[data-nav-toggle]");
  const nav = $("[data-nav]");
  const bar = $(".progress span");

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  const scrollHandlers = [];
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      scrollHandlers.forEach((fn) => fn());
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  scrollHandlers.push(() => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  });

  /* ---------------- Titre : lettres ---------------- */
  const title = $("#hero-title");
  title.setAttribute("aria-label", "Bene Naranjas");
  $$(".ht-line", title).forEach((line) => {
    const txt = line.textContent.trim();
    line.setAttribute("aria-hidden", "true");
    line.innerHTML = [...txt].map((c) => `<span class="ch">${c}</span>`).join("");
  });

  /* ==========================================================
     1. HERO — agrumes avec une physique simple
     ========================================================== */
  const hero = $("[data-hero]");
  const layer = $("[data-fruits]");
  const moreBtn = $("[data-more-fruit]");
  const TYPES = [
    { id: "f-orange", s: 1, w: 5 },
    { id: "f-sanguine", s: 1, w: 3 },
    { id: "f-lemon", s: 0.92, w: 3 },
    { id: "f-lime", s: 0.78, w: 2 },
    { id: "f-clem", s: 0.8, w: 3 },
    { id: "f-grape", s: 1.2, w: 1 },
    { id: "f-half", s: 0.9, w: 2 },
  ];
  const pickType = (() => {
    const bag = TYPES.flatMap((t) => Array(t.w).fill(t));
    return () => bag[Math.floor(Math.random() * bag.length)];
  })();

  const COUNTER_H = 74;
  let W = 0, H = 0, FLOOR = 0, BASE_R = 36;
  const bodies = [];
  let running = false, visible = true, raf = 0, last = 0, still = 0;

  const measure = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    FLOOR = H - COUNTER_H;
    BASE_R = W < 600 ? 25 : W < 1000 ? 31 : 37;
  };

  const makeBody = (x, y, type) => {
    const r = BASE_R * type.s;
    const size = r * 2.5;
    const el = document.createElement("div");
    el.className = "fruit";
    el.style.width = el.style.height = size + "px";
    el.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${type.id}"/></svg>`;
    layer.appendChild(el);
    const b = { el, x, y, px: x, py: y, vx: (Math.random() - 0.5) * 160, vy: 0, r, half: size / 2, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 4 };
    bodies.push(b);
    render(b);
    return b;
  };

  const render = (b) => {
    b.el.style.transform = `translate3d(${(b.x - b.half).toFixed(1)}px, ${(b.y - b.half).toFixed(1)}px, 0) rotate(${b.a.toFixed(3)}rad)`;
  };

  const G = 2300, E_FLOOR = 0.52, E_BALL = 0.35;
  const step = (dt) => {
    for (const b of bodies) {
      b.vy += G * dt;
      b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
      if (b.y + b.r > FLOOR) {
        b.y = FLOOR - b.r;
        if (b.vy > 0) b.vy = Math.abs(b.vy) < 60 ? 0 : -b.vy * E_FLOOR;
        b.vx *= 1 - 3.2 * dt;
        b.va = b.vx / b.r;
      }
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.6; }
      else if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.6; }
    }
    for (let it = 0; it < 3; it++) {
      for (let i = 0; i < bodies.length; i++) {
        const A = bodies[i];
        for (let j = i + 1; j < bodies.length; j++) {
          const B = bodies[j];
          const dx = B.x - A.x, dy = B.y - A.y, min = A.r + B.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = (min - d) / 2;
          A.x -= nx * ov; A.y -= ny * ov; B.x += nx * ov; B.y += ny * ov;
          const vn = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
          if (vn < 0) {
            const jimp = (-(1 + E_BALL) * vn) / 2;
            A.vx -= jimp * nx; A.vy -= jimp * ny; B.vx += jimp * nx; B.vy += jimp * ny;
            const tang = (B.vx - A.vx) * -ny + (B.vy - A.vy) * nx;
            A.va += tang / A.r * 0.15; B.va -= tang / B.r * 0.15;
          }
        }
      }
      for (const b of bodies) if (b.y + b.r > FLOOR) b.y = FLOOR - b.r;
    }
  };

  const loop = (t) => {
    if (!running) return;
    let dt = Math.min(0.033, (t - last) / 1000 || 0.016);
    last = t;
    const sub = 2;
    for (let s = 0; s < sub; s++) step(dt / sub);
    let maxMove = 0;
    for (const b of bodies) {
      maxMove = Math.max(maxMove, Math.abs(b.x - b.px) + Math.abs(b.y - b.py));
      b.px = b.x; b.py = b.y;
      render(b);
    }
    still = maxMove < 0.25 ? still + 1 : 0;
    if (still > 90) { running = false; return; } // tout est posé : on dort
    raf = requestAnimationFrame(loop);
  };

  const wake = () => {
    if (RM || running || !visible) return;
    running = true; still = 0; last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const spawn = (n, spread = 260) => {
    if (!W) measure();
    if (!W) { setTimeout(() => spawn(n, spread), 200); return; } // héro pas encore mis en page
    const cap = W < 600 ? 18 : 30;
    for (let i = 0; i < n; i++) {
      const type = pickType();
      const r = BASE_R * type.s;
      const x = r + Math.random() * (W - 2 * r);
      makeBody(x, -r - i * spread * (0.6 + Math.random() * 0.5), type);
    }
    while (bodies.length > cap) {
      const old = bodies.shift();
      old.el.style.transition = "opacity .4s"; old.el.style.opacity = "0";
      setTimeout(() => old.el.remove(), 450);
    }
    wake();
  };

  const placeStatic = () => {
    // Mouvement réduit : une rangée bien rangée sur le comptoir
    let x = 30;
    let k = 0;
    while (x < W - 30 && k < 40) {
      const type = TYPES[k % TYPES.length];
      const r = BASE_R * type.s;
      if (x + r * 2 > W - 10) break;
      const b = makeBody(x + r, FLOOR - r, type);
      b.a = (k * 0.7) % 6.28; render(b);
      x += r * 2 + 6; k++;
    }
  };

  const impulse = (px, py, strength = 1) => {
    let hit = false;
    for (const b of bodies) {
      const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy) || 1;
      const reach = b.r + 110;
      if (d < reach) {
        const f = (1 - d / reach) * strength;
        b.vx += (dx / d) * 700 * f + (Math.random() - 0.5) * 120;
        b.vy = Math.min(b.vy, -(650 + Math.random() * 450) * (0.5 + f));
        b.va += (Math.random() - 0.5) * 12;
        hit = true;
      }
    }
    if (hit) wake();
  };

  measure();
  if (RM) {
    placeStatic();
  } else {
    // première pluie d'agrumes, un peu après l'apparition du titre
    const firstRain = () => {
      measure();
      if (!W) { setTimeout(firstRain, 200); return; }
      spawn(W < 600 ? 10 : 16, W < 600 ? 140 : 110);
    };
    setTimeout(firstRain, 450);

    hero.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button")) return;
      const r = hero.getBoundingClientRect();
      impulse(e.clientX - r.left, e.clientY - r.top, e.target.closest(".fruit") ? 1.4 : 1);
    });
    let lastP = null;
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
      if (lastP) {
        const dtp = Math.max(1, p.t - lastP.t) / 1000;
        const vx = (p.x - lastP.x) / dtp, vy = (p.y - lastP.y) / dtp;
        if (Math.hypot(vx, vy) > 700) {
          for (const b of bodies) {
            if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 12) {
              b.vx += vx * 0.35; b.vy += Math.min(0, vy * 0.35) - 250; b.va += vx / b.r * 0.2;
              wake();
            }
          }
        }
      }
      lastP = p;
    });
    hero.addEventListener("pointerleave", () => { lastP = null; });
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) wake(); else { running = false; cancelAnimationFrame(raf); }
    }).observe(hero);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
  }
  moreBtn.addEventListener("click", () => {
    if (RM) return;
    spawn(W < 600 ? 3 : 5, 90);
  });
  if (RM) { moreBtn.hidden = true; const hint = $(".counter-hint"); if (hint) hint.hidden = true; }

  let resizeT;
  const onHeroResize = () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const oldW = W;
      measure();
      if (!W) return;
      for (const b of bodies) {
        if (oldW) b.x = Math.min(W - b.r, b.x * (W / oldW));
        b.x = Math.max(b.r, Math.min(W - b.r, b.x));
        if (b.y + b.r > FLOOR) b.y = FLOOR - b.r;
        render(b);
      }
      wake();
    }, 120);
  };
  if ("ResizeObserver" in window) new ResizeObserver(onHeroResize).observe(hero);
  else window.addEventListener("resize", onHeroResize);

  /* ==========================================================
     2. L'ÉTAL — cagettes générées + parallaxe
     ========================================================== */
  const PRODUCE = {
    oranges:   { label: "ORANGES" },
    citrons:   { label: "CITRONS" },
    tomates:   { label: "TOMATES" },
    pommes:    { label: "POMMES" },
    poireaux:  { label: "POIREAUX" },
    carottes:  { label: "CAROTTES" },
    aubergines:{ label: "AUBERGINES" },
    salades:   { label: "SALADES" },
    courges:   { label: "COURGES" },
    clems:     { label: "CLÉMENTINES" },
  };

  const pileRows = [
    { y: 94, n: 7, r: 16, x0: 22, x1: 198 },
    { y: 72, n: 6, r: 16, x0: 34, x1: 186 },
    { y: 52, n: 5, r: 15, x0: 48, x1: 172 },
    { y: 34, n: 3, r: 15, x0: 76, x1: 144 },
  ];
  const roundItem = (x, y, r, fill, extra, rnd) => {
    const hl = `<ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.32}" ry="${r * 0.2}" fill="#fff" opacity=".38" transform="rotate(-30 ${x - r * 0.35} ${y - r * 0.4})"/>`;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${hl}${extra ? extra(x, y, r, rnd) : ""}`;
  };
  const drawPile = (type, rnd) => {
    let s = "";
    const jit = (v) => v + (rnd() - 0.5) * 4;
    const each = (fn) => pileRows.forEach((row) => {
      for (let i = 0; i < row.n; i++) {
        const x = jit(row.x0 + (row.x1 - row.x0) * (row.n === 1 ? 0.5 : i / (row.n - 1)));
        s += fn(x, jit(row.y), row.r, i);
      }
    });
    switch (type) {
      case "oranges":
      case "clems": {
        const cols = type === "oranges" ? ["#F3851F", "#F08A24", "#E87420", "#F79B32"] : ["#F59A2A", "#F7A43A", "#EE8A22"];
        each((x, y, r) => roundItem(x, y, type === "clems" ? r * 0.85 : r, cols[Math.floor(rnd() * cols.length)],
          (x2, y2, r2) => type === "clems" && rnd() > 0.6 ? `<path d="M${x2} ${y2 - r2 * 0.8} c5 -7 12 -7 15 -3 c-4 4 -10 5 -15 3z" fill="#3E8E41"/>` : `<circle cx="${x2 + r2 * 0.2}" cy="${y2 - r2 * 0.1}" r="1.2" fill="#B4441A" opacity=".4"/>`, rnd));
        break;
      }
      case "citrons":
        each((x, y, r) => {
          const a = Math.round((rnd() - 0.5) * 60);
          return `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r * 1.12}" ry="${r * 0.82}" fill="${rnd() > 0.5 ? "#F7D23E" : "#F4C92E"}"/><ellipse cx="${x + r * 1.1}" cy="${y}" rx="3" ry="2.6" fill="#E0B21E"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.35}" rx="${r * 0.4}" ry="${r * 0.18}" fill="#fff" opacity=".45"/></g>`;
        });
        break;
      case "tomates":
        each((x, y, r) => roundItem(x, y, r, rnd() > 0.5 ? "#E03B2F" : "#D8332A",
          (x2, y2, r2) => `<path d="M${x2} ${y2 - r2 * 0.9} l4 -3 l-1 5 l5 1 l-5 2 l1 5 l-4 -4 l-4 4 l1 -5 l-5 -2 l5 -1 l-1 -5z" fill="#2F7A3A"/>`, rnd));
        break;
      case "pommes":
        each((x, y, r) => roundItem(x, y, r, ["#D9412F", "#9BC53D", "#C8372A", "#E9B03A"][Math.floor(rnd() * 4)],
          (x2, y2, r2) => `<path d="M${x2} ${y2 - r2 * 0.7} q1 -6 4 -8" stroke="#5A3A1A" stroke-width="2" fill="none"/>`, rnd));
        break;
      case "courges":
        [{ y: 92, n: 4, x0: 34, x1: 186, r: 23 }, { y: 62, n: 3, x0: 56, x1: 164, r: 22 }, { y: 38, n: 1, x0: 110, x1: 110, r: 20 }].forEach((row) => {
          for (let i = 0; i < row.n; i++) {
            const x = row.x0 + (row.x1 - row.x0) * (row.n === 1 ? 0.5 : i / (row.n - 1)) + (rnd() - 0.5) * 5;
            const fill = rnd() > 0.4 ? "#E7772B" : "#E9A85A";
            s += `<ellipse cx="${x}" cy="${row.y}" rx="${row.r}" ry="${row.r * 0.78}" fill="${fill}"/>
                  <path d="M${x - row.r * 0.45} ${row.y - row.r * 0.7} q-6 ${row.r * 0.7} 0 ${row.r * 1.4} M${x + row.r * 0.45} ${row.y - row.r * 0.7} q6 ${row.r * 0.7} 0 ${row.r * 1.4} M${x} ${row.y - row.r * 0.78} v${row.r * 1.5}" stroke="#B4501A" stroke-width="2" opacity=".45" fill="none"/>
                  <rect x="${x - 2.5}" y="${row.y - row.r * 0.78 - 8}" width="5" height="9" rx="2" fill="#5A7A2A"/>`;
          }
        });
        break;
      case "salades":
        [{ y: 88, n: 4, x0: 38, x1: 182, r: 26 }, { y: 58, n: 3, x0: 62, x1: 158, r: 25 }].forEach((row) => {
          for (let i = 0; i < row.n; i++) {
            const x = row.x0 + (row.x1 - row.x0) * (i / (row.n - 1)) + (rnd() - 0.5) * 5;
            const c = rnd() > 0.5 ? "#8CC152" : "#7DB534";
            s += `<circle cx="${x}" cy="${row.y}" r="${row.r}" fill="${c}"/><circle cx="${x}" cy="${row.y + 2}" r="${row.r * 0.62}" fill="#B5D96A"/><circle cx="${x}" cy="${row.y + 4}" r="${row.r * 0.3}" fill="#D9EE9A"/><path d="M${x - row.r * 0.9} ${row.y} q${row.r * 0.5} -8 ${row.r * 0.9} 0 M${x} ${row.y} q${row.r * 0.5} -8 ${row.r * 0.9} 0" stroke="#5E9A30" stroke-width="2" fill="none"/>`;
          }
        });
        break;
      case "aubergines":
        each((x, y, r, i) => {
          const a = (i % 2 ? 1 : -1) * (20 + rnd() * 20);
          return `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r * 1.5}" ry="${r * 0.8}" fill="${rnd() > 0.5 ? "#5B2A6E" : "#4A2160"}"/><path d="M${x - r * 1.5} ${y} l-6 -4 l2 4 l-2 4z" fill="#3E7A2E"/><ellipse cx="${x - r * 0.2}" cy="${y - r * 0.35}" rx="${r * 0.6}" ry="${r * 0.15}" fill="#fff" opacity=".25"/></g>`;
        });
        break;
      case "poireaux":
        for (let i = 0; i < 9; i++) {
          const x = 30 + i * 20 + (rnd() - 0.5) * 6;
          const a = (rnd() - 0.5) * 16;
          s += `<g transform="rotate(${a} ${x} 100)">
            <path d="M${x - 8} -14 q-14 -10 -20 -28 q14 8 22 24z M${x + 6} -14 q16 -12 18 -32 q-12 10 -20 28z" fill="#2F7A3A"/>
            <rect x="${x - 7}" y="-18" width="14" height="70" rx="6" fill="#5E9A30"/>
            <rect x="${x - 7}" y="40" width="14" height="64" rx="6" fill="#EFF0D6"/>
            <rect x="${x - 7}" y="30" width="14" height="16" fill="#B5D96A"/></g>`;
        }
        break;
      case "carottes":
        for (let i = 0; i < 12; i++) {
          const x = 24 + (i % 6) * 32 + (rnd() - 0.5) * 6;
          const y = i < 6 ? 88 : 62;
          const a = -35 + (rnd() - 0.5) * 20;
          s += `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 7} ${y - 26} h14 l-6 52 h-2z" fill="${rnd() > 0.5 ? "#F07A1E" : "#E86A18"}"/><path d="M${x - 4} ${y - 26} l-6 -14 M${x} ${y - 26} v-16 M${x + 4} ${y - 26} l6 -14" stroke="#3E8E41" stroke-width="4" stroke-linecap="round"/></g>`;
        }
        break;
    }
    return s;
  };

  const crateSVG = (type, seed, opts = {}) => {
    const rnd = rng(seed);
    const label = PRODUCE[type].label;
    const fs = label.length > 9 ? 12 : 15;
    const wood = ["#C98A4B", "#BE7F41", "#D29655"][seed % 3];
    let tag = "";
    if (opts.tag) {
      tag = `<g class="price-tag" transform="rotate(${6 - (seed % 3) * 4} 186 40)"><path d="M186 60 V112" stroke="#8A5226" stroke-width="4"/><rect x="160" y="22" width="56" height="38" rx="5" fill="#27312C" stroke="#8A5226" stroke-width="3"/><text x="188" y="47" text-anchor="middle" font-size="15" font-weight="700" fill="#F4F1E8">[prix]</text></g>`;
    }
    return `<svg viewBox="0 -40 220 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="66" width="200" height="110" rx="6" fill="#7A4A26"/>
      ${drawPile(type, rnd)}
      <g fill="${wood}" stroke="#6F3F1C" stroke-width="2.5">
        <rect x="6" y="96" width="208" height="24" rx="3"/>
        <rect x="6" y="124" width="208" height="24" rx="3"/>
        <rect x="6" y="152" width="208" height="24" rx="3"/>
        <rect x="4" y="90" width="18" height="90" rx="3"/>
        <rect x="198" y="90" width="18" height="90" rx="3"/>
      </g>
      <g stroke="#6F3F1C" stroke-width="1.5" opacity=".35" fill="none"><path d="M30 103 q40 4 80 0 t80 0 M28 135 q50 -4 90 1 t70 -1 M30 163 q40 3 80 -1 t80 1"/></g>
      <rect x="52" y="124" width="116" height="24" rx="4" fill="#FFF1D9" stroke="#6F3F1C" stroke-width="2"/>
      <text x="110" y="${141 - (15 - fs) / 2}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="${fs}" letter-spacing="1.5" fill="#7A3A14">${label}</text>
      <circle cx="13" cy="100" r="2.4" fill="#5A3A1A"/><circle cx="207" cy="100" r="2.4" fill="#5A3A1A"/>
      <circle cx="13" cy="170" r="2.4" fill="#5A3A1A"/><circle cx="207" cy="170" r="2.4" fill="#5A3A1A"/>
      ${tag}
    </svg>`;
  };

  const leafSVG = (seed) => {
    const rnd = rng(seed);
    const a = Math.round((rnd() - 0.5) * 50);
    const fruit = seed % 2 ? `<circle cx="96" cy="112" r="34" fill="url(#g-orange)"/><ellipse cx="84" cy="100" rx="10" ry="6" fill="#fff" opacity=".35"/>` : `<g transform="rotate(-20 96 116)"><ellipse cx="96" cy="116" rx="36" ry="27" fill="url(#g-lemon)"/><ellipse cx="86" cy="106" rx="11" ry="5" fill="#fff" opacity=".45"/></g>`;
    return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(${a} 80 80)">
      <path d="M80 150 C20 120 10 60 60 20 C70 70 90 110 80 150Z" fill="#2F7A3A"/>
      <path d="M80 150 C140 120 150 60 100 24 C92 74 74 110 80 150Z" fill="#3E8E41"/>
      <path d="M80 150 C70 100 64 60 60 24 M80 150 C88 100 96 64 100 28" stroke="#1F5E33" stroke-width="3" fill="none"/></g>${fruit}</svg>`;
  };

  const stall = $("[data-stall]");
  if (stall) {
    const order = ["oranges", "poireaux", "citrons", "tomates", "courges", "pommes", "salades", "clems", "carottes", "aubergines"];
    const fill = (el, count, offset, tagEvery) => {
      let s = "";
      for (let i = 0; i < count; i++) {
        const t = order[(i + offset) % order.length];
        s += crateSVG(t, i * 7 + offset * 13 + 3, { tag: tagEvery && i % tagEvery === 1 });
      }
      el.innerHTML = s;
    };
    fill($(".layer-back", stall), 22, 5, 0);
    fill($(".layer-mid", stall), 18, 2, 0);
    fill($(".layer-front", stall), 14, 0, 3);
    $(".layer-fg", stall).innerHTML = Array.from({ length: 9 }, (_, i) => leafSVG(i + 1)).join("");

    if (!RM) {
      const layers = $$(".stall-layer", stall).map((el) => ({ el, speed: parseFloat(el.dataset.speed) }));
      const updateStall = () => {
        const r = stall.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const dist = Math.max(window.innerWidth * 0.9, 340);
        for (const l of layers) l.el.style.transform = `translate3d(${(-p * dist * l.speed).toFixed(1)}px,0,0)`;
      };
      scrollHandlers.push(updateStall);
    }
  }

  /* ==========================================================
     3. ARDOISE — texte manuscrit qui s'écrit
     ========================================================== */
  const slate = $("[data-slate]");
  const chalk = $("[data-chalk]");
  const sponge = $("[data-sponge]");
  const rewriteBtn = $("[data-rewrite]");
  const queue = []; // { el, kind: 'c' | 'd' | 'pause' }

  const offsetIn = (el, root) => {
    let x = 0, y = 0, n = el;
    while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  };

  if (slate) {
    $$("[data-write]", slate).forEach((el) => {
      const text = el.textContent;
      const sr = document.createElement("span");
      sr.className = "sr-only"; sr.textContent = text;
      const vis = document.createElement("span");
      vis.setAttribute("aria-hidden", "true");
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { vis.appendChild(document.createTextNode(" ")); return; }
        const w = document.createElement("span");
        w.style.display = "inline-block"; w.style.whiteSpace = "nowrap";
        [...part].forEach((ch) => {
          const c = document.createElement("span");
          c.className = "c"; c.textContent = ch;
          w.appendChild(c);
        });
        vis.appendChild(w);
      });
      el.textContent = "";
      el.append(sr, vis);
    });
    // ordre d'écriture
    const walk = (el) => {
      if (el.matches("[data-write]")) { $$(".c", el).forEach((c) => queue.push({ el: c, kind: "c" })); queue.push({ kind: "pause" }); return; }
      if (el.classList.contains("sd")) { queue.push({ el, kind: "d" }); return; }
      [...el.children].forEach(walk);
    };
    walk(slate);

    const allOn = () => { queue.forEach((q) => q.el && q.el.classList.add("on")); };
    let writing = false;

    const write = () => {
      if (writing) return;
      writing = true;
      slate.classList.remove("is-pre");
      slate.classList.add("is-writing");
      queue.forEach((q) => q.el && q.el.classList.remove("on"));
      chalk.classList.add("on");
      rewriteBtn.disabled = true;
      let i = 0, acc = 0, prev = performance.now(), wait = 0;
      const tick = (t) => {
        acc += t - prev; prev = t;
        while (acc > 0 && i < queue.length) {
          if (wait > 0) { const w = Math.min(acc, wait); wait -= w; acc -= w; if (wait > 0) break; }
          const q = queue[i++];
          if (q.kind === "pause") { wait = 160; continue; }
          q.el.classList.add("on");
          const o = offsetIn(q.el, slate);
          chalk.style.transform = `translate(${o.x + q.el.offsetWidth - 4}px, ${o.y + q.el.offsetHeight - 10}px) rotate(-38deg)`;
          acc -= q.kind === "d" ? 200 : 22 + Math.random() * 22;
        }
        if (i < queue.length || wait > 0) requestAnimationFrame(tick);
        else {
          chalk.classList.remove("on");
          slate.classList.remove("is-writing");
          writing = false; rewriteBtn.disabled = false;
        }
      };
      requestAnimationFrame(tick);
    };

    if (RM) {
      allOn();
      rewriteBtn.hidden = true;
    } else {
      slate.classList.add("is-pre");
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { obs.disconnect(); setTimeout(write, 350); }
      }, { threshold: 0.35 }).observe(slate);

      rewriteBtn.addEventListener("click", () => {
        if (writing) return;
        rewriteBtn.disabled = true;
        const w = slate.clientWidth, h = slate.clientHeight;
        const dur = 1500;
        sponge.animate([
          { transform: `translate(-140px, 10px) rotate(-8deg)`, opacity: 0 },
          { transform: `translate(-60px, 20px) rotate(-8deg)`, opacity: 1, offset: 0.06 },
          { transform: `translate(${w - 60}px, ${h * 0.2}px) rotate(6deg)`, opacity: 1, offset: 0.3 },
          { transform: `translate(-20px, ${h * 0.45}px) rotate(-6deg)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${w - 60}px, ${h * 0.7}px) rotate(6deg)`, opacity: 1, offset: 0.8 },
          { transform: `translate(${w / 2}px, ${h + 20}px) rotate(0deg)`, opacity: 0 },
        ], { duration: dur, easing: "ease-in-out" });
        queue.forEach((q) => {
          if (!q.el) return;
          const y = offsetIn(q.el, slate).y;
          setTimeout(() => q.el.classList.remove("on"), 80 + (y / h) * dur * 0.85);
        });
        setTimeout(() => { rewriteBtn.disabled = false; write(); }, dur + 150);
      });
    }
  }

  /* ==========================================================
     4. ROUE DES SAISONS
     ========================================================== */
  const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  // Repères saisonniers généraux (France métropolitaine)
  const SEASON = [
    { f: ["Orange", "Clémentine", "Mandarine", "Citron", "Pamplemousse", "Kiwi", "Pomme", "Poire", "Litchi"],
      l: ["Poireau", "Chou vert", "Chou de Bruxelles", "Carotte", "Céleri-rave", "Endive", "Mâche", "Navet", "Panais", "Potiron", "Topinambour", "Betterave", "Salsifis", "Oignon"] },
    { f: ["Orange", "Clémentine", "Mandarine", "Citron", "Pamplemousse", "Kiwi", "Pomme", "Poire"],
      l: ["Poireau", "Chou vert", "Chou de Bruxelles", "Carotte", "Céleri-rave", "Endive", "Mâche", "Navet", "Panais", "Topinambour", "Betterave", "Salsifis", "Oignon"] },
    { f: ["Orange", "Citron", "Pamplemousse", "Kiwi", "Pomme", "Poire"],
      l: ["Poireau", "Chou vert", "Carotte", "Endive", "Épinard", "Navet", "Radis", "Mâche", "Betterave", "Panais", "Oignon"] },
    { f: ["Pamplemousse", "Citron", "Kiwi", "Pomme", "Rhubarbe", "Fraise"],
      l: ["Asperge", "Radis", "Épinard", "Laitue", "Chou-fleur", "Navet", "Oignon blanc", "Poireau"] },
    { f: ["Fraise", "Rhubarbe", "Cerise", "Pamplemousse"],
      l: ["Asperge", "Artichaut", "Radis", "Petit pois", "Laitue", "Épinard", "Carotte", "Fève", "Navet", "Oignon blanc", "Concombre"] },
    { f: ["Fraise", "Cerise", "Abricot", "Melon", "Framboise", "Groseille", "Pêche", "Nectarine", "Rhubarbe"],
      l: ["Asperge", "Artichaut", "Courgette", "Concombre", "Haricot vert", "Petit pois", "Radis", "Laitue", "Tomate", "Fève", "Carotte", "Ail"] },
    { f: ["Abricot", "Cerise", "Fraise", "Framboise", "Groseille", "Cassis", "Myrtille", "Melon", "Pastèque", "Pêche", "Nectarine", "Prune"],
      l: ["Tomate", "Courgette", "Aubergine", "Poivron", "Concombre", "Haricot vert", "Artichaut", "Laitue", "Radis", "Fenouil", "Ail", "Oignon", "Carotte", "Blette"] },
    { f: ["Abricot", "Melon", "Pastèque", "Pêche", "Nectarine", "Prune", "Mirabelle", "Figue", "Mûre", "Myrtille", "Framboise", "Poire", "Raisin"],
      l: ["Tomate", "Courgette", "Aubergine", "Poivron", "Concombre", "Haricot vert", "Maïs doux", "Fenouil", "Laitue", "Ail", "Oignon", "Blette", "Carotte"] },
    { f: ["Raisin", "Figue", "Prune", "Mirabelle", "Pomme", "Poire", "Melon", "Pêche", "Mûre", "Noisette", "Noix"],
      l: ["Tomate", "Poivron", "Aubergine", "Courgette", "Haricot vert", "Brocoli", "Fenouil", "Potiron", "Courge butternut", "Blette", "Épinard", "Poireau", "Carotte", "Céleri", "Maïs doux"] },
    { f: ["Pomme", "Poire", "Raisin", "Coing", "Châtaigne", "Noix", "Noisette", "Figue", "Kaki"],
      l: ["Potiron", "Courge butternut", "Poireau", "Chou vert", "Brocoli", "Chou-fleur", "Céleri-rave", "Carotte", "Épinard", "Panais", "Betterave", "Navet", "Fenouil"] },
    { f: ["Pomme", "Poire", "Kiwi", "Clémentine", "Mandarine", "Kaki", "Coing", "Châtaigne", "Noix"],
      l: ["Poireau", "Chou vert", "Chou de Bruxelles", "Potiron", "Courge butternut", "Carotte", "Céleri-rave", "Endive", "Mâche", "Navet", "Panais", "Topinambour", "Betterave", "Épinard", "Salsifis"] },
    { f: ["Orange", "Clémentine", "Mandarine", "Citron", "Pamplemousse", "Kiwi", "Pomme", "Poire", "Kaki", "Litchi", "Châtaigne"],
      l: ["Poireau", "Chou vert", "Chou de Bruxelles", "Potiron", "Courge butternut", "Carotte", "Céleri-rave", "Endive", "Mâche", "Navet", "Panais", "Topinambour", "Betterave", "Salsifis"] },
  ];
  const LOOK = {
    "Orange": ["#F3851F", "r"], "Clémentine": ["#F59A2A", "r"], "Mandarine": ["#F08C25", "r"], "Citron": ["#F7D23E", "o"],
    "Pamplemousse": ["#F7C25A", "r"], "Kiwi": ["#8B6A3A", "o"], "Pomme": ["#D9412F", "r"], "Poire": ["#B8C43A", "p"],
    "Litchi": ["#D9534F", "r"], "Kaki": ["#EE7A22", "r"], "Rhubarbe": ["#C8384A", "l"], "Fraise": ["#E03B2F", "h"],
    "Cerise": ["#B3192B", "b"], "Abricot": ["#F6A53A", "r"], "Melon": ["#E9B45A", "r"], "Framboise": ["#D63A5C", "b"],
    "Groseille": ["#E2333B", "b"], "Pêche": ["#F7A06B", "r"], "Nectarine": ["#E8643A", "r"], "Pastèque": ["#3E8E41", "r"],
    "Cassis": ["#3B1F3F", "b"], "Myrtille": ["#3E4C9A", "b"], "Prune": ["#6E2C6E", "o"], "Mirabelle": ["#F2C230", "r"],
    "Figue": ["#6A3A6A", "p"], "Mûre": ["#2E1A33", "b"], "Raisin": ["#7A3D8A", "b"], "Noisette": ["#A0662E", "n"],
    "Noix": ["#B98A55", "n"], "Coing": ["#E7C53A", "p"], "Châtaigne": ["#7A3E1C", "n"],
    "Poireau": ["#6DAA3C", "l"], "Chou vert": ["#5FA24A", "f"], "Chou de Bruxelles": ["#7DB534", "f"], "Carotte": ["#F07A1E", "c"],
    "Céleri-rave": ["#D9CBA0", "r"], "Endive": ["#E8DC8A", "o"], "Mâche": ["#3E8E41", "f"], "Navet": ["#C9A6D6", "r"],
    "Panais": ["#E1D2A0", "c"], "Potiron": ["#E7772B", "r"], "Topinambour": ["#C79A6A", "o"], "Betterave": ["#8E1F4A", "r"],
    "Salsifis": ["#6B4A2E", "l"], "Oignon": ["#D9A35A", "r"], "Épinard": ["#2F7A3A", "f"], "Radis": ["#E0475B", "r"],
    "Asperge": ["#9BBF4A", "l"], "Laitue": ["#8CC152", "f"], "Chou-fleur": ["#E9DFC0", "f"], "Oignon blanc": ["#E6E0C8", "r"],
    "Artichaut": ["#6E8E4A", "f"], "Petit pois": ["#7DB534", "b"], "Fève": ["#8CC152", "o"], "Concombre": ["#3E7A2E", "o"],
    "Courgette": ["#4C8A2E", "o"], "Haricot vert": ["#5FA24A", "l"], "Tomate": ["#E03B2F", "r"], "Ail": ["#E6E0C8", "r"],
    "Aubergine": ["#5B2A6E", "o"], "Poivron": ["#E03B2F", "p"], "Fenouil": ["#CFDD96", "r"], "Blette": ["#4C8A2E", "f"],
    "Maïs doux": ["#F2C230", "o"], "Brocoli": ["#3E7A2E", "f"], "Courge butternut": ["#E9A85A", "p"], "Céleri": ["#9BBF4A", "l"],
  };
  const HL = `<ellipse cx="-4" cy="-5" rx="4" ry="2.4" fill="#fff" opacity=".45"/>`;
  const iconFor = (name) => {
    const [c, sh] = LOOK[name] || ["#F3851F", "r"];
    let s = "";
    switch (sh) {
      case "o": s = `<g transform="rotate(-30)"><ellipse rx="15" ry="9" fill="${c}"/><ellipse cx="-4" cy="-3" rx="5" ry="2" fill="#fff" opacity=".4"/></g>`; break;
      case "l": s = `<g transform="rotate(-35)"><path d="M-2 -16 l-5 -4 M2 -16 l5 -4" stroke="#2F7A3A" stroke-width="3" stroke-linecap="round"/><rect x="-4" y="-17" width="8" height="34" rx="4" fill="${c}"/><rect x="-4" y="5" width="8" height="12" rx="4" fill="#fff" opacity=".55"/></g>`; break;
      case "f": s = `<circle cx="-6" cy="4" r="9" fill="${c}"/><circle cx="6" cy="4" r="9" fill="${c}"/><circle cy="-5" r="10" fill="${c}"/><circle cy="-5" r="10" fill="#fff" opacity=".18"/><path d="M0 12 V-10 M0 2 l-6 -5 M0 -3 l6 -5" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none"/>`; break;
      case "b": s = `<path d="M0 -14 q2 -4 6 -5" stroke="#3E6A1C" stroke-width="2" fill="none"/><g fill="${c}"><circle cx="-6" cy="-6" r="6"/><circle cx="6" cy="-6" r="6"/><circle cx="0" cy="3" r="6"/><circle cx="-8" cy="6" r="5"/><circle cx="8" cy="6" r="5"/><circle cx="0" cy="12" r="5"/></g><g fill="#fff" opacity=".4"><circle cx="-8" cy="-8" r="1.6"/><circle cx="4" cy="-8" r="1.6"/><circle cx="-2" cy="1" r="1.6"/></g>`; break;
      case "c": s = `<g transform="rotate(-30)"><path d="M-3 -12 l-5 -7 M0 -12 v-8 M3 -12 l5 -7" stroke="#3E8E41" stroke-width="3" stroke-linecap="round"/><path d="M-6 -12 h12 l-5 30 h-2z" fill="${c}"/></g>`; break;
      case "p": s = `<path d="M0 -13 c5 0 6 6 5 9 c5 4 8 8 8 13 c0 6 -6 8 -13 8 c-7 0 -13 -2 -13 -8 c0 -5 3 -9 8 -13 c-1 -3 0 -9 5 -9z" fill="${c}"/><path d="M0 -13 q1 -4 4 -6" stroke="#5A3A1A" stroke-width="2" fill="none"/>${HL}`; break;
      case "n": s = `<circle r="12" cy="2" fill="${c}"/><path d="M-12 0 a12 12 0 0 1 24 0z" fill="#000" opacity=".2"/><circle cx="-4" cy="5" r="2.5" fill="#fff" opacity=".35"/>`; break;
      case "h": s = `<path d="M0 15 C-12 5 -14 -5 -8 -9 C-4 -11 0 -9 0 -9 C0 -9 4 -11 8 -9 C14 -5 12 5 0 15Z" fill="${c}"/><g fill="#FFE27A"><circle cx="-4" cy="-2" r="1"/><circle cx="4" cy="-1" r="1"/><circle cx="0" cy="5" r="1"/><circle cx="-5" cy="5" r="1"/><circle cx="5" cy="5" r="1"/></g><path d="M-7 -10 l7 3 l7 -3 l-4 -4 l-3 2 l-3 -2z" fill="#3E8E41"/>`; break;
      default: s = `<circle r="12.5" fill="${c}"/>${HL}<path d="M1 -12 c4 -5 9 -5 11 -2 c-3 3 -7 4 -11 2z" fill="#3E8E41"/>`;
    }
    return `<svg viewBox="-20 -20 40 40" aria-hidden="true">${s}</svg>`;
  };
  const SEASON_OF = (m) => (m === 11 || m <= 1 ? 0 : m <= 4 ? 1 : m <= 7 ? 2 : 3);
  const SEASON_NAMES = ["Hiver", "Printemps", "Été", "Automne"];
  const SEASON_ICONS = [
    `<svg viewBox="-20 -20 40 40"><g stroke="#1E5AA8" stroke-width="2.6" stroke-linecap="round"><path d="M0 -16V16M-14 -8L14 8M-14 8L14 -8"/><path d="M-4 -13l4 4 4 -4M-4 13l4 -4 4 4M-14 -3l5 -2 -1 -5M14 3l-5 2 1 5M14 -3l-5 -2 1 -5M-14 3l5 2 -1 5" fill="none"/></g></svg>`,
    `<svg viewBox="-20 -20 40 40"><g fill="#E9789A"><circle cx="0" cy="-9" r="7"/><circle cx="8.5" cy="-3" r="7"/><circle cx="5.3" cy="7.3" r="7"/><circle cx="-5.3" cy="7.3" r="7"/><circle cx="-8.5" cy="-3" r="7"/></g><circle r="5" fill="#F7D23E"/></svg>`,
    `<svg viewBox="-20 -20 40 40"><g stroke="#F3851F" stroke-width="3" stroke-linecap="round"><path d="M0 -18v5M0 13v5M-18 0h5M13 0h5M-12.7 -12.7l3.5 3.5M9.2 9.2l3.5 3.5M-12.7 12.7l3.5 -3.5M9.2 -9.2l3.5 -3.5"/></g><circle r="9" fill="#F7D23E"/></svg>`,
    `<svg viewBox="-20 -20 40 40"><path d="M-14 14 C-16 -6 -2 -16 16 -16 C16 4 4 16 -14 14Z" fill="#D9541A"/><path d="M-14 14 L10 -10 M-6 6 l-2 -8 M2 -2 l8 2 M-2 2 l-6 -2" stroke="#8E2E12" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  ];

  const wheel = $("[data-wheel]");
  if (wheel) {
    const ring = $("[data-ring]", wheel);
    const nameEl = $("[data-month-name]");
    const seasonEl = $("[data-season-name]");
    const iconEl = $("[data-season-icon]");
    const fruitsList = $("[data-fruits-list]");
    const vegList = $("[data-veg-list]");
    const cF = $("[data-count-fruits]");
    const cV = $("[data-count-veg]");
    let current = -1, ringAngle = 0;

    const buttons = MONTHS.map((m, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "month-btn";
      b.style.setProperty("--a", i * 30 + "deg");
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", m);
      b.innerHTML = `<span>${SHORT[i]}</span>`;
      b.addEventListener("click", () => select(i));
      b.addEventListener("keydown", (e) => {
        const k = e.key;
        let n = null;
        if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % 12;
        if (k === "ArrowLeft" || k === "ArrowUp") n = (i + 11) % 12;
        if (k === "Home") n = 0;
        if (k === "End") n = 11;
        if (n !== null) { e.preventDefault(); select(n); buttons[n].focus(); }
      });
      ring.appendChild(b);
      return b;
    });

    const sizeRing = () => {
      const r = wheel.clientWidth / 2 - 34;
      ring.style.setProperty("--r", r + "px");
    };
    sizeRing();
    window.addEventListener("resize", sizeRing);

    const fillList = (ul, items, animate) => {
      ul.innerHTML = items.map((n, k) => `<li class="chip${animate ? " pop" : ""}" style="--i:${k}">${iconFor(n)}<span>${n}</span></li>`).join("");
    };

    const select = (i, first = false) => {
      if (i === current) return;
      current = i;
      const target = -i * 30;
      const delta = ((((target - ringAngle) % 360) + 540) % 360) - 180;
      ringAngle += delta;
      ring.style.transform = `rotate(${ringAngle}deg)`;
      buttons.forEach((b, k) => {
        b.setAttribute("aria-pressed", String(k === i));
        b.firstElementChild.style.transform = `rotate(${-(k * 30 + ringAngle)}deg)`;
      });
      const s = SEASON_OF(i);
      nameEl.textContent = MONTHS[i];
      seasonEl.textContent = SEASON_NAMES[s];
      iconEl.innerHTML = SEASON_ICONS[s];
      const animate = !RM && !first;
      fillList(fruitsList, SEASON[i].f, animate || !RM);
      fillList(vegList, SEASON[i].l, animate || !RM);
      cF.textContent = SEASON[i].f.length;
      cV.textContent = SEASON[i].l.length;
      if (!RM && !first) {
        $$(".wheel-center > *", wheel).forEach((el, k) => el.animate(
          [{ opacity: 0, transform: "translateY(8px) scale(.85)" }, { opacity: 1, transform: "none" }],
          { duration: 450, delay: k * 60, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "backwards" }));
      }
    };

    $("[data-month-prev]").addEventListener("click", () => select((current + 11) % 12));
    $("[data-month-next]").addEventListener("click", () => select((current + 1) % 12));
    $("[data-month-today]").addEventListener("click", () => select(new Date().getMonth()));
    // la roue démarre sans transition
    ring.style.transition = "none";
    select(new Date().getMonth(), true);
    buttons.forEach((b) => { b.firstElementChild.style.transition = "none"; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.transition = "";
      buttons.forEach((b) => { b.firstElementChild.style.transition = ""; });
    }));
  }

  /* ==========================================================
     5. ÉPICERIE — sur écran tactile, les icônes s'animent au passage
     ========================================================== */
  if (!RM && window.matchMedia("(hover: none)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle("is-play", en.intersectionRatio > 0.75));
    }, { threshold: [0, 0.75, 1] });
    $$(".epi-card").forEach((c) => io.observe(c));
  }

  /* ---------------- Intro + reveals (GSAP) ---------------- */
  const startGSAP = () => {
    if (RM || !hasGSAP()) return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    gsap.from(".hero-slice", { scale: 0.2, rotation: -160, opacity: 0, duration: 1.6, ease: "elastic.out(1, 0.6)" });
    gsap.from(".hero-rays", { opacity: 0, duration: 1.4, delay: 0.3 });
    gsap.from(".ht-1 .ch", { y: -90, opacity: 0, rotation: () => gsap.utils.random(-25, 25), duration: 0.9, ease: "bounce.out", stagger: 0.05, delay: 0.1 });
    gsap.from(".ht-2 .ch", { y: -160, opacity: 0, rotation: () => gsap.utils.random(-30, 30), duration: 1.1, ease: "bounce.out", stagger: 0.055, delay: 0.3 });
    gsap.from([".badge", ".hero-sub", ".hero-ctas"], { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.12, delay: 0.8 });

    if (!window.ScrollTrigger) return;
    $$("[data-reveal]").forEach((el) => {
      gsap.from(el, { y: 46, opacity: 0, duration: 0.95, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    gsap.from(".epi-card", { y: 50, opacity: 0, scale: 0.9, duration: 0.7, ease: "back.out(1.6)", stagger: 0.07, scrollTrigger: { trigger: ".epi-grid", start: "top 85%", once: true } });
    const sf = $("[data-storefront]");
    if (sf) {
      gsap.timeline({ scrollTrigger: { trigger: sf, start: "top 75%", once: true } })
        .from(".sf-awning", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.9, ease: "elastic.out(1, 0.5)" }, 0.3)
        .from(".sf-crates > *", { y: 30, opacity: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.06 }, 0.5);
    }
  };
  startGSAP(); // les scripts sont en defer : GSAP est déjà chargé ici

  onScroll();
})();
