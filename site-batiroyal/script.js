/* =========================================================
   BatiRoyal — motion design
   GSAP 3.12.5 + ScrollTrigger (cdnjs). Seuls transform et
   opacity sont animés. prefers-reduced-motion respecté.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGSAP && !reduce;
  const mqMobile = window.matchMedia('(max-width: 767px)');
  const mqDesktop = window.matchMedia('(min-width: 900px)');
  if (!animate) root.classList.add('no-motion');
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Palette d'enduits ---------------- */
  const PALETTE = [
    { id: 'ocre', name: 'Ocre royal', hex: '#d3a656' },
    { id: 'sable', name: 'Sable doré', hex: '#e3cf9f' },
    { id: 'blanc', name: 'Blanc cassé', hex: '#eee7d7' },
    { id: 'gres', name: 'Grès rosé', hex: '#cf9d82' },
    { id: 'perle', name: 'Gris perle', hex: '#bdbab1' },
    { id: 'sienne', name: 'Terre de Sienne', hex: '#b97447' },
    { id: 'sauge', name: 'Vert sauge', hex: '#a9b090' },
    { id: 'ardoise', name: 'Bleu ardoise', hex: '#8592a2' }
  ];
  let current = PALETTE[0];

  /* ---------------- Géométrie de la façade ---------------- */
  const WALL = { x: 170, y: 160, w: 500, h: 320 };
  const RX = WALL.x + WALL.w;   // 670
  const BY = WALL.y + WALL.h;   // 480
  const CUTS = { c2: [100, 90], c3: [145, 130], c4: [190, 170] };  // écorché en escalier
  const WIN = [
    { x: 238, y: 200, w: 64, h: 80 },
    { x: 388, y: 200, w: 64, h: 80 },
    { x: 538, y: 200, w: 64, h: 80 },
    { x: 388, y: 340, w: 64, h: 80 }
  ];
  const DOOR = { x: 538, y: 332, w: 64, h: 148 };
  const ROOF = '146,164 236,82 604,82 694,164';
  const LABELS = [
    { i: 1, t: 'MUR EXISTANT', tx: 203, ty: 452, y: 432 },
    { i: 2, t: 'ISOLANT', tx: 231, ty: 425, y: 386 },
    { i: 3, t: 'SOUS-ENDUIT ARMÉ', tx: 254, ty: 404, y: 340 },
    { i: 4, t: 'FINITION', tx: 302, ty: 362, y: 294 }
  ];
  const VB = {
    hero: '0 0 720 540',
    heroMobile: '150 6 570 520',
    scene: '110 36 610 470'
  };
  const STEP_NAMES = ['Mur existant', 'Isolant', 'Sous-enduit armé', 'Finition'];

  const cutPoly = (a, b) =>
    `${WALL.x},${WALL.y} ${RX},${WALL.y} ${RX},${BY} ${WALL.x + a},${BY} ${WALL.x},${BY - b}`;
  const wallRect = (attrs = '') =>
    `<rect x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="${WALL.h}" ${attrs}/>`;

  // Pseudo-aléatoire déterministe (même façade à chaque chargement)
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function defs(p, o) {
    let s = `
      <linearGradient id="${p}-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${o.old ? '#4a5670' : '#3c5a9a'}"/><stop offset=".55" stop-color="${o.old ? '#263048' : '#1a2b5c'}"/><stop offset="1" stop-color="#0f1a3d"/>
      </linearGradient>
      <linearGradient id="${p}-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/>
      </linearGradient>
      <linearGradient id="${p}-roofshade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".25"/>
      </linearGradient>
      <pattern id="${p}-tiles" width="26" height="22" patternUnits="userSpaceOnUse">
        <path d="M0 10.5H26M0 21.5H26M6 0V11M19 11V22" stroke="rgba(30,15,10,.4)" stroke-width="1.2"/>
      </pattern>
      <pattern id="${p}-grain" width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r=".7" fill="rgba(0,0,0,.13)"/><circle cx="5" cy="4.5" r=".7" fill="rgba(255,255,255,.22)"/><circle cx="3" cy="6" r=".5" fill="rgba(0,0,0,.08)"/>
      </pattern>
      <pattern id="${p}-ground" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0V9" stroke="rgba(201,162,74,.45)" stroke-width="1"/>
      </pattern>
      <clipPath id="${p}-wall">${wallRect()}</clipPath>
      <clipPath id="${p}-sw"><rect class="sw" x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="${WALL.h}" transform="translate(-${WALL.w} 0)"/></clipPath>`;
    if (o.cutaway) {
      s += `
      <pattern id="${p}-dots" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(80,70,50,.2)"/><circle cx="6.5" cy="6" r=".8" fill="rgba(80,70,50,.14)"/>
      </pattern>
      <pattern id="${p}-mesh" width="14" height="14" patternUnits="userSpaceOnUse">
        <path d="M0 .5H14M.5 0V14" stroke="rgba(40,45,60,.4)" stroke-width="1"/>
      </pattern>
      <clipPath id="${p}-c2"><polygon points="${cutPoly(...CUTS.c2)}"/></clipPath>
      <clipPath id="${p}-c3"><polygon points="${cutPoly(...CUTS.c3)}"/></clipPath>
      <clipPath id="${p}-c4"><polygon points="${cutPoly(...CUTS.c4)}"/></clipPath>
      <clipPath id="${p}-b3"><rect class="b3" x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="${WALL.h}"/></clipPath>
      <clipPath id="${p}-b4"><rect class="b4" x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="${WALL.h}"/></clipPath>`;
    }
    if (o.old) {
      s += `
      <linearGradient id="${p}-streak" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a342c" stop-opacity=".6"/><stop offset="1" stop-color="#3a342c" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${p}-moss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4f5e3a" stop-opacity="0"/><stop offset="1" stop-color="#46552f" stop-opacity=".75"/>
      </linearGradient>
      <linearGradient id="${p}-soot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2c2722" stop-opacity=".5"/><stop offset=".35" stop-color="#2c2722" stop-opacity="0"/>
      </linearGradient>
      <pattern id="${p}-blocks" width="50" height="40" patternUnits="userSpaceOnUse">
        <rect width="50" height="40" fill="#4a443d"/><rect x="1" y="1" width="48" height="18" fill="#776d62"/>
        <rect x="-24" y="21" width="48" height="18" fill="#6c635a"/><rect x="26" y="21" width="48" height="18" fill="#7d7368"/>
      </pattern>`;
    }
    return `<defs>${s}</defs>`;
  }

  function masonry() {
    const rnd = rng(7);
    const shades = ['#7a7066', '#71685f', '#837a6e', '#6b625a', '#786d61', '#8a8074'];
    let s = '';
    for (let r = 0; r < 16; r++) {
      const y = WALL.y + r * 20;
      let row = `<g class="mrow"><rect x="${WALL.x}" y="${y}" width="${WALL.w}" height="20" fill="#47413b"/>`;
      for (let bx = WALL.x - (r % 2 ? 25 : 0); bx < RX; bx += 50) {
        row += `<rect x="${bx + 1}" y="${y + 1}" width="48" height="18" fill="${shades[Math.floor(rnd() * shades.length)]}"/>`;
      }
      s += row + '</g>';
    }
    return s;
  }

  function insulation(p) {
    let panels = '', dowels = '';
    for (let r = 0; r < 4; r++) {
      const y = WALL.y + r * 80;
      for (let bx = WALL.x - (r % 2 ? 62.5 : 0); bx < RX; bx += 125) {
        panels += `<g class="panel"><rect x="${bx + 1.5}" y="${y + 1.5}" width="122" height="77" fill="#e9e3d4" stroke="#c4bba6"/><rect x="${bx + 1.5}" y="${y + 1.5}" width="122" height="77" fill="url(#${p}-dots)"/></g>`;
        for (const [dx, dy] of [[30, 22], [95, 58]]) {
          const cx = bx + dx, cy = y + dy;
          if (cx > WALL.x + 6 && cx < RX - 6) {
            dowels += `<g class="dowel"><circle cx="${cx}" cy="${cy}" r="5" fill="#d8cfba" stroke="#a39a85"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="#857d6b"/></g>`;
          }
        }
      }
    }
    return panels + dowels;
  }

  function finish(p, o) {
    let s = `<rect class="paint-base" x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="${WALL.h}" fill="${o.old ? '#b3a790' : o.color}"/>`;
    if (!o.old) s += `<g clip-path="url(#${p}-sw)"><rect class="paint-over" x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="${WALL.h}" fill="${o.color}"/></g>`;
    s += wallRect(`fill="url(#${p}-grain)"`);
    s += wallRect(`fill="url(#${p}-shade)"`);
    // chaîne d'angle (harpage)
    for (let i = 0; i < 10; i++) {
      const w = i % 2 ? 26 : 40;
      s += `<rect x="${RX - w}" y="${WALL.y + i * 32 + 1}" width="${w}" height="30" fill="rgba(255,255,255,${o.old ? '.1' : '.22'})" stroke="rgba(0,0,0,.08)"/>`;
    }
    // bandeau d'étage, soubassement, ombre de génoise
    s += `<rect x="${WALL.x}" y="300" width="${WALL.w}" height="9" fill="rgba(255,255,255,${o.old ? '.12' : '.3'})"/><rect x="${WALL.x}" y="309" width="${WALL.w}" height="2" fill="rgba(0,0,0,.15)"/>`;
    s += `<rect x="${WALL.x}" y="${BY - 30}" width="${WALL.w}" height="30" fill="rgba(30,22,15,.2)"/><rect x="${WALL.x}" y="${BY - 31}" width="${WALL.w}" height="2" fill="rgba(0,0,0,.18)"/>`;
    s += `<rect x="${WALL.x}" y="${WALL.y}" width="${WALL.w}" height="14" fill="rgba(0,0,0,.2)"/>`;
    return s;
  }

  function grime(p) {
    let s = wallRect(`fill="url(#${p}-soot)"`);
    const rnd = rng(42);
    for (const o of WIN) {
      s += `<rect x="${o.x - 4}" y="${o.y + o.h + 10}" width="${o.w + 8}" height="95" fill="url(#${p}-streak)" opacity=".8"/>`;
      for (let k = 0; k < 3; k++) {
        const x = o.x + 6 + rnd() * (o.w - 12);
        s += `<rect x="${x.toFixed(1)}" y="${o.y + o.h + 10}" width="${(3 + rnd() * 4).toFixed(1)}" height="${(90 + rnd() * 70).toFixed(0)}" fill="url(#${p}-streak)"/>`;
      }
    }
    s += `<rect x="${WALL.x}" y="${BY - 85}" width="${WALL.w}" height="85" fill="url(#${p}-moss)"/>`;
    for (const pts of ['196,372 238,360 262,384 244,410 206,404', '452,452 488,440 506,462 480,474 458,470', '280,312 312,302 334,322 312,340 286,334', '600,170 632,166 640,184 616,194']) {
      s += `<polygon points="${pts}" fill="url(#${p}-blocks)" stroke="rgba(240,230,210,.6)" stroke-width="1.2"/>`;
    }
    s += `<g fill="none" stroke="#3b342c" stroke-width="1.6" stroke-linejoin="bevel">
      <path d="M332 292l10 16-5 12 13 18-3 14 9 16"/><path d="M180 250l18 8 6 18 16 6 4 14"/>
      <path d="M648 296l-8 20 10 16-6 22 8 18"/><path d="M470 170l6 14-4 10 8 12"/><path d="M204 318l14 10"/>
    </g>`;
    return s;
  }

  function windowSVG(p, o, old) {
    const { x, y, w, h } = o;
    const sur = old ? '#a69c88' : '#f1ead9';
    const sh = old ? '#5d6670' : '#22325f';
    const sw = 29;
    let s = '<g class="win">';
    for (const sx of [x - 7 - 2 - sw, x + w + 7 + 2]) {
      s += `<rect x="${sx}" y="${y - 4}" width="${sw}" height="${h + 2}" fill="${sh}"/>`;
      let slats = '';
      for (let k = y + 4; k < y + h - 2; k += 7) slats += `M${sx + 3} ${k}H${sx + sw - 3}`;
      s += `<path d="${slats}" stroke="rgba(255,255,255,${old ? '.12' : '.16'})" stroke-width="1.4"/>`;
      s += `<rect x="${sx}" y="${y - 4}" width="${sw}" height="${h + 2}" fill="none" stroke="rgba(0,0,0,.25)"/>`;
    }
    s += `<rect x="${x - 7}" y="${y - 7}" width="${w + 14}" height="${h + 7}" fill="${sur}"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${p}-glass)"/>`;
    s += `<path d="M${x + 8} ${y + h - 6}L${x + w / 2 - 4} ${y + 8}" stroke="rgba(255,255,255,.16)" stroke-width="7"/>`;
    s += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="none" stroke="${old ? '#d8d0c0' : '#f7f3ea'}" stroke-width="3"/>`;
    s += `<path d="M${x + w / 2} ${y + 2}V${y + h - 2}M${x + 2} ${y + h * 0.42}H${x + w - 2}" stroke="${old ? '#d8d0c0' : '#f7f3ea'}" stroke-width="2.5"/>`;
    s += `<rect x="${x - 11}" y="${y + h}" width="${w + 22}" height="8" fill="${sur}"/><rect x="${x - 11}" y="${y + h + 8}" width="${w + 22}" height="2" fill="rgba(0,0,0,.25)"/>`;
    return s + '</g>';
  }

  function doorSVG(p, old) {
    const { x, y, w, h } = DOOR;
    const sur = old ? '#a69c88' : '#f1ead9';
    return `<g class="door">
      <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 8}" fill="${sur}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${old ? '#5b4a3c' : '#1a2850'}"/>
      <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="26" fill="url(#${p}-glass)"/>
      <rect x="${x + 9}" y="${y + 40}" width="${w - 18}" height="44" fill="none" stroke="rgba(255,255,255,.18)"/>
      <rect x="${x + 9}" y="${y + 92}" width="${w - 18}" height="46" fill="none" stroke="rgba(255,255,255,.18)"/>
      <circle cx="${x + w - 10}" cy="${y + 88}" r="3" fill="#c9a24a"/>
      <rect x="${x - 14}" y="${BY - 5}" width="${w + 28}" height="5" fill="${sur}"/>
    </g>`;
  }

  function roofSVG(old) {
    return `<g class="roof">
      <rect x="548" y="50" width="34" height="74" fill="${old ? '#6f4a3b' : '#8c5843'}"/>
      <path d="M548 62H582M548 74H582M548 86H582M548 98H582" stroke="rgba(0,0,0,.18)"/>
      <rect x="543" y="44" width="44" height="9" fill="#4e3127"/>
      <polygon points="${ROOF}" fill="${old ? '#5c3a2f' : '#7b4433'}"/>
      <polygon points="${ROOF}" fill="url(#${'P'}-tiles)"/>
      <polygon points="${ROOF}" fill="url(#${'P'}-roofshade)"/>
      ${old ? '<ellipse cx="300" cy="140" rx="34" ry="7" fill="rgba(90,105,60,.55)"/><ellipse cx="520" cy="118" rx="22" ry="5" fill="rgba(90,105,60,.5)"/>' : ''}
      <path d="M236 82H604" stroke="#a8644b" stroke-width="3"/>
      <path d="M146 164H694" stroke="${old ? '#3a2e26' : '#2a1d18'}" stroke-width="6"/>
    </g>`;
  }

  function trowel(cls) {
    return `<g transform="translate(${WALL.x} ${WALL.y + WALL.h / 2})"><g class="${cls}" opacity="0">
      <rect x="-1.5" y="-${WALL.h / 2}" width="3" height="${WALL.h}" fill="rgba(255,250,235,.55)"/>
      <rect x="-3" y="-70" width="6" height="140" rx="2" fill="#dfe3e8" stroke="#7d848e"/>
      <path d="M-3 -9h-22a9 9 0 0 0 0 18h22z" fill="#c9a24a" stroke="#7a5c18"/>
    </g></g>`;
  }

  function heroExtras() {
    const surround = WIN.map(o => `<rect x="${o.x - 7}" y="${o.y - 7}" width="${o.w + 14}" height="${o.h + 7}"/>`).join('');
    const cotes = `
      <g class="plan" fill="none" stroke="#c9a24a" stroke-width="1.2" stroke-dasharray="5 4">
        ${wallRect()}<polygon points="${ROOF}"/><rect x="548" y="50" width="34" height="74"/>${surround}
        <rect x="${DOOR.x - 8}" y="${DOOR.y - 8}" width="${DOOR.w + 16}" height="${DOOR.h + 8}"/>
        <path d="M420 40V500" stroke-dasharray="14 4 2 4" opacity=".6"/>
      </g>`;
    const dims = `
      <g class="cotes" stroke="#c9a24a" stroke-width="1" fill="none">
        <path d="M170 34H670M170 26V58M670 26V58M164 40l12-12M664 40l12-12"/>
        <path d="M704 160V480M676 160H712M676 480H712M698 166l12-12M698 486l12-12"/>
      </g>
      <text x="420" y="24" text-anchor="middle" class="cote-txt">ÉLÉVATION · FAÇADE PRINCIPALE</text>
      <text transform="translate(694 320) rotate(-90)" text-anchor="middle" class="cote-txt">HAUTEUR · À RELEVER</text>`;
    const labels = LABELS.map(l => `
      <g class="lbl" data-step="${l.i}">
        <path class="lbl-line" d="M150 ${l.y}H162L${l.tx} ${l.ty}" fill="none" stroke="#e6cd8f" stroke-width="1"/>
        <g class="lbl-text"><text x="146" y="${l.y - 5}" text-anchor="end" class="lbl-n">0${l.i} —</text><text x="146" y="${l.y + 12}" text-anchor="end" class="lbl-t">${l.t}</text></g>
        <circle class="badge-c" cx="${l.tx}" cy="${l.ty}" r="11" fill="#0b1530" stroke="#e6cd8f" stroke-width="1.5"/>
        <text x="${l.tx}" y="${l.ty}" dy=".36em" text-anchor="middle" class="badge-t">${l.i}</text>
      </g>`).join('');
    return { cotes, dims, labels };
  }

  function edges() {
    return ['c2', 'c3', 'c4'].map((k, i) => {
      const [a, b] = CUTS[k];
      return `<g class="edge e${i + 2}"><path d="M${WALL.x + a} ${BY}L${WALL.x} ${BY - b}" stroke="rgba(0,0,0,.45)" stroke-width="2"/><path d="M${WALL.x + a + 2} ${BY}L${WALL.x} ${BY - b - 2}" stroke="rgba(255,255,255,.35)" stroke-width="1"/></g>`;
    }).join('');
  }

  function facadeSVG(p, o) {
    const old = !!o.old;
    const color = o.color || current.hex;
    const opt = { ...o, color, old };
    const extras = o.cutaway ? heroExtras() : null;
    let s = `<svg class="facade" xmlns="http://www.w3.org/2000/svg" viewBox="${o.viewBox}" role="img" aria-label="${o.label}" focusable="false">`;
    s += defs(p, opt);
    if (extras) s += extras.dims;
    // couches
    if (o.cutaway) {
      s += `<g class="L1" clip-path="url(#${p}-wall)">${masonry()}</g>`;
      s += `<g class="L2" clip-path="url(#${p}-c2)">${insulation(p)}</g>`;
      s += `<g class="L3" clip-path="url(#${p}-c3)"><g clip-path="url(#${p}-b3)">${wallRect('fill="#c8c2b6"')}${wallRect(`fill="url(#${p}-mesh)"`)}</g></g>`;
      s += `<g class="L4" clip-path="url(#${p}-c4)"><g clip-path="url(#${p}-b4)">${finish(p, opt)}</g></g>`;
      s += `<g class="edges">${edges()}</g>`;
    } else {
      s += `<g class="L4" clip-path="url(#${p}-wall)">${finish(p, opt)}${old ? grime(p) : ''}</g>`;
    }
    s += roofSVG(old).replace(/#P-/g, `#${p}-`);
    s += `<g class="openings">${WIN.map(w => windowSVG(p, w, old)).join('')}${doorSVG(p, old)}</g>`;
    s += `<rect x="110" y="${BY}" width="610" height="16" fill="url(#${p}-ground)"/><path d="M110 ${BY}H720" stroke="#c9a24a" stroke-width="1.6"/>`;
    if (o.cutaway) s += trowel('trowel-b');
    if (!old) s += trowel('trowel');
    if (extras) s += extras.cotes + `<g class="labels">${extras.labels}</g>`;
    return s + '</svg>';
  }

  /* ---------------- Montage des façades ---------------- */
  const mounts = {
    hero: { cutaway: true, viewBox: mqMobile.matches ? VB.heroMobile : VB.hero, label: "Illustration : façade en coupe montrant le mur existant, l'isolant, le sous-enduit armé et la finition" },
    old: { old: true, viewBox: VB.scene, label: 'Illustration : façade défraîchie avant ravalement' },
    after: { viewBox: VB.scene, label: 'Illustration : la même façade après ravalement' },
    nuancier: { viewBox: VB.scene, label: 'Aperçu de la façade dans la teinte sélectionnée' }
  };
  document.querySelectorAll('[data-facade]').forEach(el => {
    const key = el.dataset.facade;
    if (mounts[key]) el.innerHTML = facadeSVG(`fc-${key}`, mounts[key]);
  });
  const heroSvg = document.querySelector('[data-facade="hero"] svg');
  if (heroSvg) {
    mqMobile.addEventListener('change', e => {
      heroSvg.setAttribute('viewBox', e.matches ? VB.heroMobile : VB.hero);
      if (hasGSAP) ScrollTrigger.refresh();
    });
  }

  /* ---------------- Nuancier ---------------- */
  const checkSvg = '<svg viewBox="0 0 12 12" focusable="false"><path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  document.querySelectorAll('[data-swatches]').forEach(box => {
    const mini = box.dataset.swatches === 'mini';
    box.innerHTML = PALETTE.map(c => mini
      ? `<button type="button" class="swatch-mini" data-color="${c.id}" style="--c:${c.hex}" aria-pressed="${c === current}" aria-label="Teinte ${c.name}" title="${c.name}"></button>`
      : `<button type="button" class="swatch" data-color="${c.id}" style="--c:${c.hex}" aria-pressed="${c === current}"><span class="swatch-chip"></span><span class="swatch-name">${c.name}</span><span class="swatch-check" aria-hidden="true">${checkSvg}</span></button>`
    ).join('');
  });

  const paintTargets = [...document.querySelectorAll('.facade')].filter(svg => svg.querySelector('.paint-over')).map(svg => ({
    base: svg.querySelector('.paint-base'),
    over: svg.querySelector('.paint-over'),
    sw: svg.querySelector('.sw'),
    trowel: svg.querySelector('.trowel'),
    tl: null
  }));
  const nameEl = document.getElementById('teinte-name');

  function paintAll(hex) {
    paintTargets.forEach((t, i) => {
      if (t.tl) { t.tl.kill(); t.tl = null; }
      if (t.pending) t.base.setAttribute('fill', t.pending);
      if (!animate) { t.base.setAttribute('fill', hex); t.pending = null; return; }
      t.pending = hex;
      t.over.setAttribute('fill', hex);
      gsap.set(t.sw, { x: -WALL.w });
      gsap.set(t.trowel, { x: 0, opacity: 0 });
      t.tl = gsap.timeline({
        delay: i * 0.05,
        onComplete() {
          t.base.setAttribute('fill', hex);
          gsap.set(t.sw, { x: -WALL.w });
          t.pending = null; t.tl = null;
        }
      })
        .to(t.trowel, { opacity: 1, duration: 0.15 }, 0)
        .to(t.sw, { x: 0, duration: 1.15, ease: 'power2.inOut' }, 0)
        .to(t.trowel, { x: WALL.w, duration: 1.15, ease: 'power2.inOut' }, 0)
        .to(t.trowel, { opacity: 0, duration: 0.2 }, 1.0);
    });
  }

  function choose(id) {
    const c = PALETTE.find(s => s.id === id);
    if (!c || c === current) return;
    current = c;
    root.style.setProperty('--enduit', c.hex);
    document.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === id)));
    if (nameEl) nameEl.textContent = c.name;
    paintAll(c.hex);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-color]');
    if (b) choose(b.dataset.color);
  });

  /* ---------------- En-tête & menu ---------------- */
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Fermer le menu' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------------- Avant / après ---------------- */
  const ba = document.getElementById('ba');
  let baTease = null;
  if (ba) {
    const range = ba.querySelector('.ba-range');
    let dragging = false, touched = false;
    const setPos = v => {
      const p = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--pos', p.toFixed(2) + '%');
      range.value = String(Math.round(p));
      range.setAttribute('aria-valuetext', `Avant ${Math.round(p)} %, après ${100 - Math.round(p)} %`);
    };
    const fromEvent = e => {
      const r = ba.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };
    const stopTease = () => { touched = true; if (baTease) { baTease.kill(); baTease = null; } };
    ba.addEventListener('pointerdown', e => {
      stopTease(); dragging = true; ba.classList.add('is-dragging');
      try { ba.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      fromEvent(e);
    });
    ba.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => ba.addEventListener(t, () => { dragging = false; ba.classList.remove('is-dragging'); }));
    range.addEventListener('input', () => { stopTease(); setPos(+range.value); });
    setPos(50);

    if (animate) {
      const proxy = { p: 50 };
      baTease = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut', onUpdate: () => { if (!touched) setPos(proxy.p); } }
      })
        .to(proxy, { p: 22, duration: 1 })
        .to(proxy, { p: 74, duration: 1.3 })
        .to(proxy, { p: 50, duration: 0.9 });
      ScrollTrigger.create({ trigger: ba, start: 'top 65%', once: true, onEnter: () => { if (!touched && baTease) baTease.play(); } });
    }
  }

  /* ---------------- Formulaire (démo) ---------------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      let firstInvalid = null;
      form.querySelectorAll('[required]').forEach(f => {
        const bad = !f.value.trim();
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        status.textContent = 'Merci d\'indiquer votre nom et un moyen de vous recontacter.';
        firstInvalid.focus();
        return;
      }
      status.textContent = 'Merci ! (démonstration : aucun message n\'a été envoyé.)';
      form.reset();
    });
  }

  /* ---------------- Sans animation : tout est visible ---------------- */
  if (!animate) {
    document.querySelectorAll('.step').forEach(s => s.classList.add('is-on'));
    document.querySelectorAll('.layers-list li').forEach(li => li.classList.add('is-done'));
    return;
  }

  /* =========================================================
     MOTION
     ========================================================= */

  /* --- Intro du héros --- */
  gsap.from('.hero-title .w > *', { yPercent: 115, duration: 1.15, ease: 'power4.out', stagger: 0.09, delay: 0.1 });
  gsap.from(['.eyebrow', '.hero-lead', '.hero-cta', '.layers-list'], { y: 22, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.4 });

  /* --- Lueur qui suit le pointeur --- */
  const hero = document.querySelector('.hero');
  const glow = document.querySelector('.hero-glow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    const gx = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3' });
    const gy = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3' });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      gx(e.clientX - r.left); gy(e.clientY - r.top);
    });
  }

  /* --- 1. La façade se construit au scroll --- */
  if (heroSvg) {
    const $ = s => heroSvg.querySelector(s);
    const $$ = s => [...heroSvg.querySelectorAll(s)];
    const rows = $$('.mrow').reverse();
    const panels = $$('.panel');
    const dowels = $$('.dowel');
    const lbl = n => $(`.lbl[data-step="${n}"]`);
    const tb = $('.trowel-b');
    const listItems = [...document.querySelectorAll('.layers-list li')];
    const capNum = document.querySelector('.hc-num');
    const capTxt = document.querySelector('.hc-txt');
    const swatchesBox = document.querySelector('.hero-swatches');
    const caption = document.querySelector('.hero-caption');
    const hint = document.querySelector('.scroll-hint');

    gsap.from($$('.plan > *'), { opacity: 0, duration: 0.6, stagger: 0.04, delay: 0.3 });
    gsap.from($$('.cotes, .cote-txt'), { opacity: 0, duration: 0.9, delay: 0.7 });

    gsap.set(rows, { opacity: 0, y: 12 });
    gsap.set($('.roof'), { opacity: 0, y: -14 });
    gsap.set($('.openings'), { opacity: 0 });
    gsap.set(panels, { opacity: 0, y: -18 });
    gsap.set(dowels, { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set([$('.b3'), $('.b4')], { x: -WALL.w });
    gsap.set($$('.lbl'), { opacity: 0 });
    gsap.set($$('.edge'), { opacity: 0 });

    const T = [0, 1.2, 2.5, 3.8];
    let lastStep = 0;
    const syncSteps = t => {
      const step = t >= T[3] ? 4 : t >= T[2] ? 3 : t >= T[1] ? 2 : 1;
      if (step === lastStep) return;
      lastStep = step;
      listItems.forEach((li, i) => {
        li.classList.toggle('is-active', i + 1 === step);
        li.classList.toggle('is-done', i + 1 < step);
      });
      if (capNum) { capNum.textContent = '0' + step; capTxt.textContent = STEP_NAMES[step - 1]; }
    };

    const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => syncSteps(tl.time()) });
    tl.to(hint, { opacity: 0, duration: 0.3 }, 0)
      // 01 — mur existant, rang par rang
      .to(rows, { opacity: 1, y: 0, duration: 0.3, stagger: 0.045, ease: 'power1.out' }, 0)
      .to($('.roof'), { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.5)
      .to($('.openings'), { opacity: 1, duration: 0.4 }, 0.6)
      .to(lbl(1), { opacity: 1, duration: 0.25 }, 0.7)
      // 02 — isolant, panneau par panneau, puis chevilles
      .to(panels, { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' }, T[1])
      .to(dowels, { opacity: 1, scale: 1, duration: 0.15, stagger: 0.012, ease: 'back.out(2)' }, 1.85)
      .to([lbl(2), $('.e2')], { opacity: 1, duration: 0.25 }, 2.05)
      // 03 — sous-enduit armé, passe de lisseuse
      .to($('.b3'), { x: 0, duration: 1 }, T[2])
      .to(tb, { opacity: 1, duration: 0.08 }, T[2])
      .fromTo(tb, { x: 0 }, { x: WALL.w, duration: 1, immediateRender: false }, T[2])
      .to(tb, { opacity: 0, duration: 0.1 }, T[2] + 0.92)
      .to([lbl(3), $('.e3')], { opacity: 1, duration: 0.25 }, 3.25)
      // 04 — finition teintée
      .to($('.b4'), { x: 0, duration: 1 }, T[3])
      .to(tb, { opacity: 1, duration: 0.08 }, T[3])
      .fromTo(tb, { x: 0 }, { x: WALL.w, duration: 1, immediateRender: false }, T[3])
      .to(tb, { opacity: 0, duration: 0.1 }, T[3] + 0.92)
      .to([lbl(4), $('.e4')], { opacity: 1, duration: 0.25 }, 4.5)
      .to($('.plan'), { opacity: 0.18, duration: 0.4 }, 4.4)
      .to(caption, { autoAlpha: 0, duration: 0.2 }, 4.9)
      .to(swatchesBox, { autoAlpha: 1, duration: 0.3 }, 4.95)
      .to({}, { duration: 0.35 });
    syncSteps(0);

    ScrollTrigger.create({
      animation: tl,
      trigger: hero,
      start: 'top top',
      end: () => '+=' + Math.round(window.innerHeight * (mqMobile.matches ? 1.9 : 2.5)),
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: () => syncSteps(tl.time()),
      onRefresh: () => syncSteps(tl.time())
    });
    gsap.ticker.add(() => syncSteps(tl.time()));
  }

  /* --- Reveals génériques --- */
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.from(el, { y: 36, opacity: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.from('.seal', { rotate: -25, scale: 0.85, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: '.intro', start: 'top 75%', once: true } });

  /* --- 3. Cartes : la coupe de mur se monte --- */
  document.querySelectorAll('[data-card]').forEach((card, idx) => {
    const svg = card.querySelector('.card-coupe svg');
    const layers = [...svg.querySelectorAll('.cl')];
    const meta = svg.querySelector('.coupe-meta');
    gsap.set(layers, { opacity: 0, x: -26 });
    gsap.set(meta, { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%', once: true }, delay: mqDesktop.matches ? idx * 0.12 : 0 });
    tl.from(card, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out' });
    layers.forEach(l => {
      tl.to(l, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, '-=0.22');
      if (l.classList.contains('cl-old')) tl.to(l, { opacity: 0, x: 26, duration: 0.45, ease: 'power2.in' }, '+=0.35');
    });
    tl.to(meta, { opacity: 1, duration: 0.5 }, '-=0.2');
    tl.from(card.querySelectorAll('.card-list li'), { opacity: 0, x: -12, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '-=0.6');
  });

  /* --- 4. Nuancier : apparition en cascade --- */
  gsap.from('.swatch', { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: '.swatches', start: 'top 85%', once: true } });
  gsap.from('.nuancier-visual', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.nuancier-visual', start: 'top 85%', once: true } });

  /* --- 5. Parcours : la ligne se dessine --- */
  const proc = document.querySelector('.process');
  if (proc) {
    const rail = proc.querySelector('.process-rail');
    const st = { trigger: proc, start: 'top 60%', end: 'bottom 60%', scrub: 0.5, invalidateOnRefresh: true };
    gsap.fromTo('.process-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.process-head', { y: 0 }, { y: () => rail.offsetHeight, ease: 'none', scrollTrigger: { ...st } });
    proc.querySelectorAll('.step').forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step.querySelector('.step-node'), start: 'top 60%',
        onEnter: () => step.classList.add('is-on'),
        onLeaveBack: () => step.classList.remove('is-on')
      });
      gsap.from(step.querySelector('.step-card'), {
        opacity: 0, x: () => (mqDesktop.matches ? (i % 2 ? 50 : -50) : 30), duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 82%', once: true }
      });
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
