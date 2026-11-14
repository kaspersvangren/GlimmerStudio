/* ================= Arkaden =================
   En mørk, hyggelig spillehal: neonskilt, ternet gulv, lamper i loftet og fire maskiner.
   To er gamle spilleautomater med skærm (Stjerneskjoldet og Hekse-invaders). To er rigtige, fysiske maskiner:
   Bank en gnom er et bord med huller og en blød hammer, og Gribemaskinen er en glaskasse fuld af bamser.
   Spillene ligger i hver sin fil og melder sig i GAMES. Fælles for dem er rammen her: Stop-knap, point,
   et slutkort med rekord og "Spil igen". */
const Arkade = (() => {
  const E = '#1A1238';
  const CABS = [
    { id:'gnom',    name:'Bank en gnom',    kind:'phys' },
    { id:'skjold',  name:'Stjerneskjoldet', kind:'screen', sub:'Red skolen',    body:'#3A4AA8', trim:'#7FD8FF', glow:'#7FD8FF', screen: shieldArt },
    { id:'invader', name:'Hekse-invaders',  kind:'screen', sub:'Skyd stjerner', body:'#7A2A8A', trim:'#FF8FC7', glow:'#FF8FC7', screen: invArt },
    { id:'gribe',   name:'Gribemaskinen',   kind:'phys' },
  ];
  const GAMES = {};   /* hvert spil: GAMES.id = { start(stage, api), stop() } */
  let busy = false, cur = null;

  /* ---------- rekorder ---------- */
  const KEY_HI = 'glimmerstudiet.arkade';
  const hiAll = () => store.get(KEY_HI, {}) || {};
  const hiOf = id => hiAll()[id] || 0;
  function hiSet(id, n){ const h = hiAll(); if (n > (h[id] || 0)){ h[id] = n; store.set(KEY_HI, h); return true; } return false; }

  /* ---------- tegningerne på skærmautomaterne (felt på 160 x 120) ---------- */
  function shieldArt(){
    let o = `<rect width="160" height="120" fill="#0E1638"/>` + [[20, 14], [60, 30], [130, 18], [100, 8], [146, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#FFF"/>`).join('');
    o += `<path d="M 30 0 L 64 70 M 120 0 L 96 58" stroke="#FF8A3D" stroke-width="2" stroke-dasharray="3 3"/><circle cx="64" cy="70" r="5" fill="#FFB347"/><circle cx="96" cy="58" r="11" fill="#7FD8FF" opacity=".55"/><circle cx="96" cy="58" r="5" fill="#E9FFFF"/>`;
    o += `<path d="M 50 120 V 98 L 60 88 L 70 98 V 120 Z M 72 120 V 92 L 80 80 L 88 92 V 120 Z M 90 120 V 98 L 100 88 L 110 98 V 120 Z" fill="#5A4AA8"/><rect x="0" y="114" width="160" height="6" fill="#2E5A3A"/>`;
    return o;
  }
  function invArt(){
    let o = `<rect width="160" height="120" fill="#1A0E2E"/>`;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++){ const x = 24 + c * 28, y = 22 + r * 22;
      o += `<path d="M ${x - 9} ${y} q 4 -8 9 -2 q 5 -6 9 2 q -4 2 -9 6 q -5 -4 -9 -6 Z" fill="${r ? '#C79BFF' : '#9BE36A'}"/><circle cx="${x - 3}" cy="${y - 1}" r="1.2" fill="${E}"/><circle cx="${x + 3}" cy="${y - 1}" r="1.2" fill="${E}"/>`; }
    o += `<path d="M 80 74 l 1.6 3.4 l 3.6 .4 l -2.7 2.4 l .8 3.6 l -3.3 -1.8 l -3.3 1.8 l .8 -3.6 l -2.7 -2.4 l 3.6 -.4 Z" fill="#FFE27A"/>`;
    o += `<g transform="translate(80 104)"><path d="M -24 4 L 24 -2" stroke="#8A5A3C" stroke-width="3" stroke-linecap="round"/><path d="M -8 -2 L 0 -22 L 8 -2 Z" fill="#7A2A8A"/><circle cx="0" cy="-6" r="5" fill="#F2C8A0"/></g>`;
    return o;
  }

  /* ---------- en spilleautomat med skærm ---------- */
  function cabinet(c, x, i){
    const W = 250, top = 290, base = 900, cx = x + W / 2, hi = hiOf(c.id);
    let o = `<g class="ak-cab" data-cab="${c.id}" tabindex="0" role="button" aria-label="${c.name}"><g class="anim">`;
    o += `<ellipse cx="${cx}" cy="${base + 6}" rx="${W / 2 + 20}" ry="16" fill="#000" opacity=".35"/>`;
    o += `<path d="M ${x} ${base} V ${top + 60} Q ${x} ${top} ${x + 20} ${top} H ${x + W - 20} Q ${x + W} ${top} ${x + W} ${top + 60} V ${base} Z" fill="${c.body}" stroke="${E}" stroke-width="5" stroke-linejoin="round"/>`;
    o += `<path d="M ${x + 10} ${base} V ${top + 64} Q ${x + 10} ${top + 12} ${x + 26} ${top + 12}" stroke="${c.trim}" stroke-width="3" fill="none" opacity=".55"/>`;
    o += `<path d="M ${x + W - 22} ${base - 3} V ${top + 58} Q ${x + W - 22} ${top + 14} ${x + W - 34} ${top + 6} Q ${x + W - 4} ${top + 10} ${x + W - 3} ${top + 60} V ${base - 3} Z" fill="#000" opacity=".22"/>`;
    o += `<rect x="${x + 16}" y="${top + 16}" width="${W - 32}" height="66" rx="10" fill="#140C2A" stroke="${c.trim}" stroke-width="3"/>`;
    o += `<text class="ak-neon" x="${cx}" y="${top + 50}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="${c.name.length > 13 ? 22 : 25}" fill="${c.glow}" style="--glow:${c.glow}">${c.name}</text>`;
    o += `<text x="${cx}" y="${top + 72}" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="14" fill="#F2EEDC" opacity=".85">${hi ? `Rekord: ${hi}` : c.sub}</text>`;
    o += `<rect x="${x + 22}" y="${top + 100}" width="${W - 44}" height="168" rx="12" fill="#0A0614" stroke="${E}" stroke-width="4"/>`;
    o += `<g transform="translate(${x + 30} ${top + 108}) scale(${((W - 60) / 160).toFixed(3)} ${(152 / 120).toFixed(3)})"><g clip-path="url(#akScr)">${c.screen()}</g></g>`;
    o += `<rect x="${x + 30}" y="${top + 108}" width="${W - 60}" height="152" rx="6" fill="url(#akGlass)"/>`;
    o += `<rect x="${x + 30}" y="${top + 236}" width="${W - 60}" height="24" fill="#0A0614" opacity=".72"/>`;
    o += `<text class="ak-blink" x="${cx}" y="${top + 252}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="15" fill="#FFF6D0" style="animation-delay:${i * .37}s">TRYK FOR AT SPILLE</text>`;
    o += `<path d="M ${x - 8} ${top + 330} L ${x + 8} ${top + 288} H ${x + W - 8} L ${x + W + 8} ${top + 330} Z" fill="#2A1E52" stroke="${E}" stroke-width="4" stroke-linejoin="round"/>`;
    o += `<path d="M ${x + 56} ${top + 312} V ${top + 294}" stroke="#1A1238" stroke-width="6" stroke-linecap="round"/><circle cx="${x + 56}" cy="${top + 292}" r="10" fill="#E0457A" stroke="${E}" stroke-width="2"/><ellipse cx="${x + 56}" cy="${top + 314}" rx="18" ry="6" fill="#140C2A"/>`;
    o += [['#FFD36E', 130], ['#7FD8FF', 166], ['#9BE36A', 202]].map(([bc, bx]) => `<ellipse cx="${x + bx}" cy="${top + 312}" rx="13" ry="7" fill="#140C2A"/><ellipse cx="${x + bx}" cy="${top + 309}" rx="11" ry="6" fill="${bc}" stroke="${E}" stroke-width="1.5"/>`).join('');
    o += `<rect x="${cx - 26}" y="${top + 380}" width="52" height="70" rx="8" fill="#140C2A" stroke="${E}" stroke-width="3"/><rect x="${cx - 4}" y="${top + 392}" width="8" height="24" rx="3" fill="${c.glow}" class="ak-coin"/><text x="${cx}" y="${top + 440}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="11" fill="${c.glow}">GRATIS</text>`;
    o += `<path d="M ${x + 24} ${top + 480} h ${W - 48}" stroke="${c.trim}" stroke-width="4" stroke-linecap="round" opacity=".5"/><path d="M ${x + 24} ${top + 500} h ${W - 48}" stroke="${c.trim}" stroke-width="2" stroke-linecap="round" opacity=".35"/>`;
    o += `<rect x="${x - 20}" y="${top - 20}" width="${W + 40}" height="${base - top + 40}" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- Bank en gnom: et bord i hoftehøjde med ni huller i en skrå plade, en høj bagplade og en blød hammer ---------- */
  const GNOME_HEAD = (s = 1, mood = 'sur') => `<g transform="scale(${s})"><path d="M -22 4 C -24 -26 24 -26 22 4 Z" fill="#F2C8A0" stroke="${E}" stroke-width="2.5"/>`
    + `<path d="M -24 -14 L 0 -58 L 24 -14 Z" fill="#E0457A" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-58" r="5" fill="#FFF6D0" stroke="${E}" stroke-width="1.5"/>`
    + `<path d="M -26 -14 Q 0 -8 26 -14" stroke="#B5305A" stroke-width="5" fill="none" stroke-linecap="round"/>`
    + (mood === 'sur' ? `<path d="M -13 -7 l 8 4 M 13 -7 l -8 4" stroke="${E}" stroke-width="3" stroke-linecap="round"/><circle cx="-8" cy="-2" r="2.4" fill="${E}"/><circle cx="8" cy="-2" r="2.4" fill="${E}"/>` : `<path d="M -12 -4 l 6 6 M -6 -4 l -6 6 M 6 -4 l 6 6 M 12 -4 l -6 6" stroke="${E}" stroke-width="2.4" stroke-linecap="round"/>`)
    + `<ellipse cx="0" cy="5" rx="5" ry="4" fill="#E8A888"/><path d="M -18 6 C -14 26 14 26 18 6 C 10 12 -10 12 -18 6 Z" fill="#FFFFFF" stroke="${E}" stroke-width="2"/>`
    + (mood === 'sur' ? `<path d="M -7 11 q 7 -4 14 0" stroke="${E}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : `<ellipse cx="0" cy="12" rx="4" ry="3" fill="${E}"/>`) + `</g>`;
  function gnomMachine(){
    const g = '#3E8A4A', gt = '#9BE36A', hi = hiOf('gnom');
    let o = `<g class="ak-cab" data-cab="gnom" tabindex="0" role="button" aria-label="Bank en gnom"><g class="anim">`;
    o += `<ellipse cx="240" cy="906" rx="210" ry="18" fill="#000" opacity=".35"/>`;
    /* bagpladen med neon-navn, en malet gnom og et lysdisplay */
    o += `<path d="M 104 566 V 318 Q 104 292 130 292 H 350 Q 376 292 376 318 V 566 Z" fill="#2E6A3A" stroke="${E}" stroke-width="5"/>`;
    o += `<rect x="122" y="306" width="236" height="64" rx="12" fill="#140C2A" stroke="${gt}" stroke-width="3"/><text class="ak-neon" x="240" y="350" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="28" fill="${gt}" style="--glow:${gt}">Bank en gnom</text>`;
    o += `<g transform="translate(240 470)">${GNOME_HEAD(1.25)}</g><g transform="translate(300 448) rotate(26)"><rect x="-5" y="-4" width="10" height="56" rx="4" fill="#8A5A3C" stroke="${E}" stroke-width="2"/><rect x="-22" y="-26" width="44" height="26" rx="10" fill="#E0457A" stroke="${E}" stroke-width="2.5"/></g>`;
    o += `<rect x="150" y="510" width="180" height="40" rx="6" fill="#140C2A" stroke="${E}" stroke-width="3"/><text x="240" y="538" text-anchor="middle" font-family="'Courier New',monospace" font-weight="700" font-size="22" fill="#FF5A5A" class="ak-led">${hi ? `REKORD ${String(hi).padStart(3, '0')}` : 'GRATIS'}</text>`;
    /* den skrå spilleplade med ni huller */
    o += `<path d="M 60 650 L 104 566 H 376 L 420 650 Z" fill="#3A7A44" stroke="${E}" stroke-width="5" stroke-linejoin="round"/><path d="M 74 642 L 112 574 H 368 L 406 642 Z" fill="#2E6A3A"/>`;
    const rows = [[588, 0.62], [612, 0.8], [636, 1]];
    rows.forEach(([y, k], r) => [-1, 0, 1].forEach(c => { const x = 240 + c * 92 * (0.72 + k * 0.28);
      o += `<ellipse cx="${x}" cy="${y}" rx="${30 * k}" ry="${9 * k}" fill="#0E2414" stroke="#1E4A2A" stroke-width="2"/>`;
      if ((r === 0 && c === 1) || (r === 2 && c === -1)) o += `<g transform="translate(${x} ${y - 2}) scale(${0.85 * k})"><g clip-path="url(#akHole)">${GNOME_HEAD(1)}</g></g>`; }));
    /* bordet */
    o += `<path d="M 60 650 H 420 V 892 Q 420 900 412 900 H 68 Q 60 900 60 892 Z" fill="${g}" stroke="${E}" stroke-width="5"/>`;
    o += `<path d="M 72 662 H 408" stroke="${gt}" stroke-width="3" opacity=".6"/><rect x="190" y="760" width="100" height="70" rx="10" fill="#140C2A" stroke="${E}" stroke-width="3"/><text x="240" y="790" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="14" fill="${gt}">BANK</text><text x="240" y="812" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="14" fill="${gt}">GNOMEN!</text>`;
    o += [100, 380].map(x => `<rect x="${x - 10}" y="680" width="20" height="200" rx="6" fill="#2E6A3A" opacity=".6"/>`).join('');
    /* den bløde hammer ligger på kanten med en snor */
    o += `<path d="M 420 700 C 452 720 448 780 424 800" stroke="#2A1E52" stroke-width="3" fill="none"/><g transform="translate(396 628) rotate(-24)"><rect x="-5" y="-4" width="10" height="70" rx="4" fill="#8A5A3C" stroke="${E}" stroke-width="2"/><rect x="-26" y="-30" width="52" height="30" rx="12" fill="#E0457A" stroke="${E}" stroke-width="3"/><path d="M -18 -20 h 36" stroke="#FF8FB0" stroke-width="3" stroke-linecap="round"/></g>`;
    o += `<rect x="40" y="280" width="410" height="640" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- Gribemaskinen: glaskasse med bamser, en klo i en skinne, kontrolpanel og præmieluge ---------- */
  const PLUSH = (c, s = 1, kind = 0) => `<g transform="scale(${s})"><circle cx="0" cy="0" r="22" fill="${c}" stroke="${E}" stroke-width="2.5"/>`
    + (kind === 1 ? `<path d="M -16 -14 L -10 -32 L -2 -18 M 16 -14 L 10 -32 L 2 -18" fill="${c}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/>` : `<circle cx="-16" cy="-16" r="8" fill="${c}" stroke="${E}" stroke-width="2.5"/><circle cx="16" cy="-16" r="8" fill="${c}" stroke="${E}" stroke-width="2.5"/>`)
    + `<circle cx="-7" cy="-3" r="2.8" fill="${E}"/><circle cx="7" cy="-3" r="2.8" fill="${E}"/><ellipse cx="0" cy="6" rx="6" ry="4" fill="#FFF" opacity=".7"/><circle cx="0" cy="4" r="2" fill="${E}"/></g>`;
  function clawMachine(){
    const o0 = '#C0602A', ot = '#FFD36E';
    let o = `<g class="ak-cab" data-cab="gribe" tabindex="0" role="button" aria-label="Gribemaskinen"><g class="anim">`;
    o += `<ellipse cx="1300" cy="906" rx="230" ry="18" fill="#000" opacity=".35"/>`;
    /* toppen med lyspærer og navnet */
    o += `<rect x="1096" y="228" width="408" height="78" rx="16" fill="${o0}" stroke="${E}" stroke-width="5"/><rect x="1114" y="242" width="372" height="50" rx="10" fill="#140C2A"/>`;
    o += `<text class="ak-neon" x="1300" y="278" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="30" fill="${ot}" style="--glow:${ot}">Gribemaskinen</text>`;
    o += Array.from({ length: 12 }, (_, i) => `<circle class="ak-bulb" cx="${1110 + i * 34.5}" cy="236" r="5" fill="#FFF3C0" style="animation-delay:${(i % 3) * .3}s"/>`).join('');
    /* glaskassen */
    o += `<rect x="1106" y="304" width="388" height="390" fill="#2A1A3A" stroke="${E}" stroke-width="5"/><rect x="1112" y="310" width="376" height="378" fill="#3A2648"/>`;
    o += `<path d="M 1112 326 H 1488" stroke="#8A8AA8" stroke-width="8"/><path d="M 1112 326 H 1488" stroke="#C8C4D8" stroke-width="3"/>`;
    o += `<path d="M 1300 326 V 450" stroke="#C8C4D8" stroke-width="2.5"/><rect x="1286" y="318" width="28" height="16" rx="4" fill="#6A6480" stroke="${E}" stroke-width="2"/>`;
    o += `<g transform="translate(1300 452)"><rect x="-14" y="-6" width="28" height="16" rx="4" fill="#8A8AA8" stroke="${E}" stroke-width="2"/><path d="M -10 10 C -26 26 -24 44 -12 54 M 10 10 C 26 26 24 44 12 54 M 0 10 V 50" stroke="#C8C4D8" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    /* præmieskakten til venstre, med plexiglas */
    o += `<rect x="1116" y="590" width="92" height="98" fill="#140C2A" opacity=".55"/><path d="M 1208 590 V 688" stroke="#DDEFFF" stroke-width="4" opacity=".7"/><path d="M 1116 590 H 1208" stroke="#DDEFFF" stroke-width="3" opacity=".7"/>`;
    /* bunken af bamser */
    const pl = [[1240, 672, '#FF8FC7', 0], [1286, 668, '#7FD8FF', 1], [1334, 672, '#9BE36A', 0], [1380, 668, '#FFD36E', 0], [1428, 672, '#C79BFF', 1], [1466, 666, '#FF8A3D', 0],
                [1262, 634, '#FFD36E', 1], [1310, 630, '#E0457A', 0], [1358, 632, '#7FD8FF', 0], [1404, 630, '#9BE36A', 1], [1448, 634, '#FF8FC7', 0], [1334, 596, '#C79BFF', 0], [1390, 598, '#FFFFFF', 1]];
    pl.forEach(([x, y], i) => { o += `<g transform="translate(${x} ${y - 6}) rotate(${(i * 37) % 40 - 20})">${plush(BAMSER[i % BAMSER.length].k, 0.78)}</g>`; });
    /* glasset glimter */
    o += `<path d="M 1130 310 L 1210 310 L 1130 470 Z M 1400 310 L 1440 310 L 1300 688 L 1270 688 Z" fill="#FFF" opacity=".07"/><path d="M 1106 304 V 694 M 1494 304 V 694" stroke="${o0}" stroke-width="10"/>`;
    /* underskabet med kontrolpanel og præmieluge */
    o += `<path d="M 1086 694 H 1514 L 1504 724 H 1096 Z" fill="#2A1E52" stroke="${E}" stroke-width="4" stroke-linejoin="round"/>`;
    o += `<path d="M 1300 704 V 690" stroke="${E}" stroke-width="6" stroke-linecap="round"/><circle cx="1300" cy="688" r="10" fill="#E0457A" stroke="${E}" stroke-width="2"/><ellipse cx="1300" cy="706" rx="18" ry="5" fill="#140C2A"/>`;
    o += `<ellipse cx="1400" cy="708" rx="24" ry="9" fill="#140C2A"/><ellipse cx="1400" cy="703" rx="21" ry="8" fill="#FFD36E" stroke="${E}" stroke-width="2"/>`;
    o += `<path d="M 1100 724 H 1500 V 892 Q 1500 900 1492 900 H 1108 Q 1100 900 1100 892 Z" fill="${o0}" stroke="${E}" stroke-width="5"/>`;
    o += `<rect x="1120" y="748" width="100" height="88" rx="8" fill="#140C2A" stroke="${E}" stroke-width="3"/><path d="M 1126 762 H 1214" stroke="#3A2E5A" stroke-width="3"/><text x="1170" y="856" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="13" fill="${ot}">PRÆMIE</text>`;
    o += `<rect x="1250" y="756" width="230" height="66" rx="10" fill="#140C2A" stroke="${E}" stroke-width="3"/><text x="1365" y="784" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="17" fill="${ot}">1 ★ PR. FORSØG</text><text x="1365" y="806" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="13" fill="#F2EEDC">Præmien kommer på værelset</text>`;
    o += `<rect x="1076" y="216" width="448" height="704" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- selve hallen ---------- */
  function scene(){
    let o = `<svg class="scene" id="akSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet"><defs>`
      + `<linearGradient id="akWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C1240"/><stop offset="1" stop-color="#2E1E5A"/></linearGradient>`
      + `<linearGradient id="akGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".22"/><stop offset=".35" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#FFF" stop-opacity=".06"/></linearGradient>`
      + `<radialGradient id="akLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".45"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="akNeonGlow"><stop offset="0" stop-color="#FF5FB0" stop-opacity=".5"/><stop offset="1" stop-color="#FF5FB0" stop-opacity="0"/></radialGradient>`
      + `<clipPath id="akScr"><rect width="160" height="120" rx="5"/></clipPath><clipPath id="akHole"><rect x="-60" y="-120" width="120" height="124"/></clipPath>`
      + `<pattern id="akStars" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M 20 18 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 Z" fill="#3E2E78"/><circle cx="66" cy="62" r="3" fill="#3E2E78"/><circle cx="54" cy="24" r="1.6" fill="#4C3A8A"/></pattern>`
      + `</defs>`;
    o += `<rect x="-1700" y="-200" width="5000" height="1400" fill="url(#akWall)"/><rect x="-1700" y="-200" width="5000" height="1000" fill="url(#akStars)"/>`;
    o += `<rect x="-1700" y="600" width="5000" height="70" fill="#3A2448"/><path d="M -1700 600 H 3300" stroke="#5A3A68" stroke-width="6"/>`;
    o += `<rect x="-1700" y="670" width="5000" height="600" fill="#22163E"/>`;
    for (let r = 0; r < 7; r++){
      const y0 = 670 + r * r * 9 + r * 26, y1 = 670 + (r + 1) * (r + 1) * 9 + (r + 1) * 26;
      for (let c = -12; c < 13; c++){
        if ((r + c) % 2) continue;
        const xa = 800 + c * (110 + r * 22), xb = 800 + (c + 1) * (110 + r * 22), xc = 800 + (c + 1) * (110 + (r + 1) * 22), xd = 800 + c * (110 + (r + 1) * 22);
        o += `<path d="M ${xa} ${y0} L ${xb} ${y0} L ${xc} ${y1} L ${xd} ${y1} Z" fill="#33215A"/>`;
      }
    }
    o += `<ellipse cx="800" cy="130" rx="420" ry="120" fill="url(#akNeonGlow)"/>`;
    o += `<g class="ak-sign"><rect x="520" y="70" width="560" height="120" rx="26" fill="#140C2A" stroke="#FF5FB0" stroke-width="6"/><rect x="534" y="84" width="532" height="92" rx="18" fill="none" stroke="#7FD8FF" stroke-width="2" opacity=".6"/>`
      + `<text class="ak-neon" x="800" y="152" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="66" letter-spacing="8" fill="#FFB8DC" style="--glow:#FF5FB0">ARKADEN</text>`
      + `<path d="M 560 110 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z M 1040 110 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z" fill="#FFE27A" class="ak-twinkle"/></g>`;
    [240, 1300].forEach(lx => { const ly = 200;
      o += `<path d="M ${lx} -20 V ${ly - 40}" stroke="#140C2A" stroke-width="3"/><path d="M ${lx - 34} ${ly - 10} Q ${lx} ${ly - 54} ${lx + 34} ${ly - 10} Z" fill="#5A3A68" stroke="${E}" stroke-width="3"/><ellipse cx="${lx}" cy="${ly - 8}" rx="16" ry="6" fill="#FFE9A8"/><path d="M ${lx - 170} ${ly + 700} L ${lx - 30} ${ly - 8} L ${lx + 30} ${ly - 8} L ${lx + 170} ${ly + 700} Z" fill="url(#akLamp)" opacity=".45"/>`; });
    o += gnomMachine() + cabinet(CABS[1], 478, 1) + cabinet(CABS[2], 778, 2) + clawMachine();
    return o + `</svg>`;
  }

  /* ---------- hallen som skærm ---------- */
  function show(){
    if (cur && cur.game.stop) cur.game.stop(); cur = null;
    showScreen('#arkade'); playMusic('byen'); busy = false;
    const box = $('#arkadeBody'); box.innerHTML = '';
    box.append(el('div', { class:'scene-wrap', id:'akScene' }), ...placeUi([ backBtn('Byen', showTown) ], [ starPill(), audioBtns() ]));
    $('#akScene').innerHTML = scene(); updateAudioBtns();
    const svg = $('#akSvg');
    svg.addEventListener('click', e => { const g = e.target.closest('[data-cab]'); if (g) tapCab(g); });
    svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-cab]')){ e.preventDefault(); tapCab(e.target.closest('[data-cab]')); } });
  }
  function tapCab(g){
    if (busy) return;
    const id = g.dataset.cab, c = CABS.find(x => x.id === id);
    replay(g, 'jiggle');
    if (!GAMES[id]){ sfx.nope(); toast(`${c.name} kommer snart!`); return; }
    sfx.coin(); busy = true;
    setTimeout(() => openGame(id), 260);
  }

  /* ---------- fælles ramme om et spil ---------- */
  function openGame(id){
    const game = GAMES[id], c = CABS.find(x => x.id === id);
    const box = $('#arkadeBody'); box.innerHTML = '';
    const stage = el('div', { class:'ak-stage', id:'akStage' });
    const stopBtn = el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); show(); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + 'Stop' });
    box.append(stage, ...placeUi([ stopBtn ], [ el('span', { class:'ak-pill', id:'akInfo', hidden: true }), el('span', { class:'ak-pill ak-score' }, [ el('span', { class:'lab' }, 'Point'), el('span', { id:'akScore' }, '0') ]), audioBtns() ]));
    updateAudioBtns();
    const gen = {};
    cur = { id, game, gen, score: 0 };
    const api = {
      alive: () => cur && cur.gen === gen,
      score(n){ if (!api.alive()) return; cur.score = n; const s = $('#akScore'); if (s) s.textContent = n; },
      info(t){ const i = $('#akInfo'); if (!i) return; i.hidden = !t; i.textContent = t || ''; },
      end(n, line, opts){ if (!api.alive()) return; endCard(id, c.name, n, line, opts); },
    };
    game.start(stage, api);
  }
  /* opts (gribemaskinen): { title, big, art, again } i stedet for point og rekord */
  function endCard(id, name, n, line, opts){
    const o = opts || {}, rec = !opts && hiSet(id, n), hi = hiOf(id);
    if (o.sound !== false){ if (rec && n > 0 || o.win) sfx.fanfare(); else sfx.magic(); }
    const card = el('div', { class:'ak-end' }, [ el('div', { class:'ak-card' }, [
      el('h2', {}, o.title || (rec && n > 0 ? 'Ny rekord!' : 'Godt spillet!')),
      o.art ? el('div', { class:'ak-art', html: o.art }) : null,
      el('p', { class:'big' }, o.big != null ? o.big : `${n} point`),
      el('p', {}, line || (rec && n > 0 ? `Det er det bedste nogensinde i ${name}.` : `Rekorden er ${hi} point.`)),
      el('div', { class:'row' }, [
        el('button', { class:'btn primary', type:'button', on:{ click: () => { sfx.coin(); if (cur && cur.game.stop) cur.game.stop(); openGame(id); } } }, o.again || 'Spil igen'),
        el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); show(); } } }, 'Til arkaden') ]) ]) ]);
    $('#arkadeBody').append(card);
    const b = card.querySelector('.btn.primary'); if (b) b.focus();
  }
  /* ---------- bamserne fra gribemaskinen: tegnet siddende, ca. 60 høje, med bunden i y = 34 ---------- */
  const BAMSER = [
    { k:'bjoern', name:'bamse-bjørn', c:'#B5743A', c2:'#E8C8A0' }, { k:'kat', name:'kattebamse', c:'#A8A4C0', c2:'#F2EEFF' },
    { k:'kanin', name:'kaninbamse', c:'#F7F4FF', c2:'#FFC8DC' }, { k:'drage', name:'dragebamse', c:'#7AC86A', c2:'#F2E2A0' },
    { k:'enhjoerning', name:'enhjørningebamse', c:'#FFFFFF', c2:'#FF9FD0' }, { k:'ugle', name:'uglebamse', c:'#9C6A48', c2:'#F2E2C0' },
    { k:'froe', name:'frøbamse', c:'#5AB85A', c2:'#C8F0A0' }, { k:'spoegelse', name:'spøgelsesbamse', c:'#F2EEFF', c2:'#C8C4E8' } ];
  function plush(k, s = 1){
    const b = BAMSER.find(x => x.k === k) || BAMSER[0], c = b.c, c2 = b.c2, st = `stroke="${E}" stroke-width="2.5"`;
    let o = `<g transform="scale(${s})">`;
    if (k === 'spoegelse') return o + `<path d="M -26 34 V -6 C -26 -40 26 -40 26 -6 V 34 Q 17 26 9 34 Q 0 26 -9 34 Q -17 26 -26 34 Z" fill="${c}" ${st}/><ellipse cx="-9" cy="-6" rx="4" ry="6" fill="${E}"/><ellipse cx="9" cy="-6" rx="4" ry="6" fill="${E}"/><ellipse cx="0" cy="8" rx="5" ry="4" fill="${E}"/><circle cx="-16" cy="4" r="4" fill="#FFB8D0" opacity=".7"/><circle cx="16" cy="4" r="4" fill="#FFB8D0" opacity=".7"/></g>`;
    /* krop med mave og fødder */
    o += `<ellipse cx="0" cy="16" rx="24" ry="19" fill="${c}" ${st}/><ellipse cx="0" cy="19" rx="13" ry="11" fill="${c2}"/><ellipse cx="-14" cy="32" rx="9" ry="5" fill="${c}" ${st}/><ellipse cx="14" cy="32" rx="9" ry="5" fill="${c}" ${st}/>`;
    if (k === 'drage') o += `<path d="M -20 6 L -40 -8 L -34 10 Z M 20 6 L 40 -8 L 34 10 Z" fill="#5AA84A" ${st} stroke-linejoin="round"/><path d="M 20 24 Q 38 30 34 14" stroke="${E}" stroke-width="2.5" fill="${c}"/>`;
    /* ører eller lignende bag hovedet */
    if (k === 'bjoern') o += `<circle cx="-16" cy="-30" r="8" fill="${c}" ${st}/><circle cx="16" cy="-30" r="8" fill="${c}" ${st}/><circle cx="-16" cy="-30" r="4" fill="${c2}"/><circle cx="16" cy="-30" r="4" fill="${c2}"/>`;
    if (k === 'kat') o += `<path d="M -20 -22 L -16 -42 L -4 -30 Z M 20 -22 L 16 -42 L 4 -30 Z" fill="${c}" ${st} stroke-linejoin="round"/>`;
    if (k === 'kanin') o += `<ellipse cx="-9" cy="-44" rx="6" ry="17" fill="${c}" ${st}/><ellipse cx="9" cy="-44" rx="6" ry="17" fill="${c}" ${st}/><ellipse cx="-9" cy="-44" rx="3" ry="11" fill="${c2}"/><ellipse cx="9" cy="-44" rx="3" ry="11" fill="${c2}"/>`;
    if (k === 'ugle') o += `<path d="M -20 -20 L -18 -40 L -6 -28 Z M 20 -20 L 18 -40 L 6 -28 Z" fill="${c}" ${st} stroke-linejoin="round"/>`;
    if (k === 'drage') o += `<path d="M -10 -32 l -4 -12 l 8 6 Z M 10 -32 l 4 -12 l -8 6 Z" fill="#F2E2A0" ${st}/>`;
    if (k === 'enhjoerning') o += `<path d="M -16 -30 C -26 -20 -24 -8 -20 0 C -14 -12 -10 -22 -4 -30 Z" fill="${c2}" ${st}/><path d="M -4 -34 L 0 -54 L 4 -34 Z" fill="#F2C14E" ${st}/><path d="M -14 -28 l -4 -10 l 8 4 Z M 14 -28 l 4 -10 l -8 4 Z" fill="${c}" ${st}/>`;
    /* hovedet */
    o += k === 'froe' ? `<ellipse cx="0" cy="-12" rx="25" ry="17" fill="${c}" ${st}/><circle cx="-11" cy="-28" r="9" fill="${c}" ${st}/><circle cx="11" cy="-28" r="9" fill="${c}" ${st}/><circle cx="-11" cy="-28" r="4" fill="${E}"/><circle cx="11" cy="-28" r="4" fill="${E}"/><path d="M -14 -8 Q 0 2 14 -8" stroke="${E}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="-16" cy="-10" r="4" fill="#FFB8D0" opacity=".7"/><circle cx="16" cy="-10" r="4" fill="#FFB8D0" opacity=".7"/>`
      : `<circle cx="0" cy="-14" r="22" fill="${c}" ${st}/>`;
    if (k === 'ugle') o += `<circle cx="-9" cy="-16" r="9" fill="${c2}" ${st}/><circle cx="9" cy="-16" r="9" fill="${c2}" ${st}/><circle cx="-9" cy="-16" r="4" fill="${E}"/><circle cx="9" cy="-16" r="4" fill="${E}"/><path d="M -4 -6 L 4 -6 L 0 2 Z" fill="#F2A040" ${st}/>`;
    else if (k !== 'froe') o += `<circle cx="-8" cy="-16" r="3.4" fill="${E}"/><circle cx="8" cy="-16" r="3.4" fill="${E}"/><circle cx="-7" cy="-17" r="1.1" fill="#FFF"/><circle cx="9" cy="-17" r="1.1" fill="#FFF"/>`
      + `<ellipse cx="0" cy="-6" rx="${k === 'bjoern' || k === 'drage' ? 8 : 5}" ry="${k === 'bjoern' || k === 'drage' ? 6 : 4}" fill="${k === 'bjoern' ? c2 : k === 'drage' ? '#9BE36A' : 'none'}"/><path d="M -3 -8 L 3 -8 L 0 -5 Z" fill="${k === 'kanin' || k === 'kat' ? '#FF8FB0' : E}"/><path d="M 0 -5 q -4 4 -7 1 M 0 -5 q 4 4 7 1" stroke="${E}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
      + `<circle cx="-15" cy="-8" r="4" fill="#FFB8D0" opacity=".65"/><circle cx="15" cy="-8" r="4" fill="#FFB8D0" opacity=".65"/>`;
    if (k === 'kat') o += `<path d="M -20 -8 h -10 M -20 -4 h -10 M 20 -8 h 10 M 20 -4 h 10" stroke="${E}" stroke-width="1.4"/>`;
    /* en lille syning, så de ligner tøjdyr */
    o += `<path d="M 0 2 V 30" stroke="${E}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".35"/>`;
    return o + `</g>`;
  }
  const KEY_PLUSH = 'glimmerstudiet.bamser';
  const myPlush = () => store.get(KEY_PLUSH, []) || [];
  return { show, openGame, CABS, GAMES, hiOf, E, GNOME_HEAD, PLUSH, BAMSER, plush, myPlush, KEY_PLUSH };
})();
