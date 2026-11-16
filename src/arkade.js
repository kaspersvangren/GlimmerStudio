/* ================= Arkaden =================
   En gammel, hyggelig spillehal: tapet, træpaneler, plankegulv, gaslamper og et skilt med lyspærer. Alt i træ og messing.
   Tre er gamle spilleautomater med skærm (Stjerneskjoldet, Hekse-invaders og Trylletegning). To er rigtige, fysiske maskiner:
   Bank en gnom er et bord med huller og en blød hammer, og Gribemaskinen er en glaskasse fuld af bamser.
   Spillene ligger i hver sin fil og melder sig i GAMES. Fælles for dem er rammen her: Stop-knap, point,
   et slutkort med rekord og "Spil igen". */
const Arkade = (() => {
  const E = '#1A1238';
  const CABS = [
    { id:'gnom',    name:'Bank en gnom',    kind:'phys' },
    { id:'skjold',  name:'Stjerneskjoldet', kind:'screen', sub:'Red skolen',    body:'#3A4AA8', trim:'#7FD8FF', glow:'#7FD8FF', screen: shieldArt },
    { id:'invader', name:'Hekse-invaders',  kind:'screen', sub:'Skyd stjerner', body:'#7A2A8A', trim:'#FF8FC7', glow:'#FF8FC7', screen: invArt },
    { id:'tryl',    name:'Trylletegning',   kind:'screen', sub:'Tegn og tryl',  body:'#2A1C78', trim:'#FFD86B', glow:'#FFD86B', screen: () => GAMES.tryl ? GAMES.tryl.skaermbillede() : '' },
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

  /* ---------- gammel stil: mørkt træ, messing og lyspærer (som Gribemaskinens panel) ---------- */
  const WD = '#2A160C';                   /* mørk kant på træ og messing */
  const brassPlate = (x, y, w, h, txt, fs = 22) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#akBrass)" stroke="${WD}" stroke-width="3"/>`
    + `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="4" fill="none" stroke="#8A6420" stroke-width="1.5" opacity=".8"/>`
    + [[x + 10, y + h / 2], [x + w - 10, y + h / 2]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="3.2" fill="#8A6420" stroke="${WD}" stroke-width="1"/><path d="M ${sx - 2} ${sy} h 4" stroke="${WD}" stroke-width="1"/>`).join('')
    + (txt ? `<text x="${x + w / 2}" y="${y + h / 2 + fs * .36}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="${fs}" fill="#3A2008" opacity=".92">${txt}</text>` : '');
  const bulbs = (pts, d0 = 0) => pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="7" fill="#FFE9A8" opacity=".35"/><circle class="ak-bulb" cx="${x}" cy="${y}" r="4.2" fill="#FFF3C0" stroke="#8A6420" stroke-width="1" style="animation-delay:${((i + d0) % 3) * .33}s"/>`).join('');
  const rivets = pts => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="url(#akBrass)" stroke="${WD}" stroke-width="1"/>`).join('');
  const knob = (x, y, c) => `<ellipse cx="${x}" cy="${y + 4}" rx="17" ry="8" fill="${WD}"/><ellipse cx="${x}" cy="${y + 1}" rx="16" ry="7" fill="url(#akBrass)" stroke="${WD}" stroke-width="1.5"/><ellipse cx="${x}" cy="${y - 2}" rx="10" ry="5" fill="${c}" stroke="${WD}" stroke-width="1.5"/><ellipse cx="${x - 3}" cy="${y - 4}" rx="4" ry="1.6" fill="#FFF" opacity=".6"/>`;

  /* ---------- en spilleautomat med skærm: et gammelt skab i mahogni med messingramme om et magisk glas ---------- */
  function cabinet(c, x, i){
    const W = 250, top = 290, base = 900, cx = x + W / 2, hi = hiOf(c.id);
    let o = `<g class="ak-cab" data-cab="${c.id}" tabindex="0" role="button" aria-label="${c.name}"><g class="anim">`;
    o += `<ellipse cx="${cx}" cy="${base + 6}" rx="${W / 2 + 20}" ry="16" fill="#000" opacity=".4"/>`;
    /* ben: drejede træben med messingsko */
    o += [x + 22, x + W - 22].map(lx => `<path d="M ${lx - 12} ${base - 40} H ${lx + 12} L ${lx + 8} ${base - 6} H ${lx - 8} Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="3"/><rect x="${lx - 11}" y="${base - 10}" width="22" height="12" rx="3" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/>`).join('');
    /* skabet og den buede top med udskæringer og en messingstjerne */
    o += `<path d="M ${x} ${base - 40} V ${top + 40} H ${x + W} V ${base - 40} Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5" stroke-linejoin="round"/>`;
    o += `<path d="M ${x - 12} ${top + 44} H ${x + W + 12} V ${top + 30} Q ${x + W - 6} ${top + 22} ${x + W - 30} ${top + 16} Q ${cx + 40} ${top - 4} ${cx} ${top - 34} Q ${cx - 40} ${top - 4} ${x + 30} ${top + 16} Q ${x + 6} ${top + 22} ${x - 12} ${top + 30} Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5" stroke-linejoin="round"/>`;
    o += `<path d="M ${x + 34} ${top + 30} Q ${cx - 30} ${top + 8} ${cx} ${top - 16} Q ${cx + 30} ${top + 8} ${x + W - 34} ${top + 30}" stroke="#C9962E" stroke-width="3" fill="none" opacity=".75"/>`;
    o += `<g transform="translate(${cx} ${top - 44})"><path d="M 0 -18 L 5 -6 L 18 -5 L 8 4 L 11 17 L 0 10 L -11 17 L -8 4 L -18 -5 L -5 -6 Z" fill="url(#akBrass)" stroke="${WD}" stroke-width="2" stroke-linejoin="round" class="ak-twinkle"/></g>`;
    o += `<path d="M ${x + W - 16} ${base - 44} V ${top + 48} H ${x + W - 4} V ${base - 44} Z" fill="#000" opacity=".25"/>`;
    /* messingskilt med navnet */
    o += brassPlate(x + 18, top + 52, W - 36, 50, c.name, c.name.length > 13 ? 21 : 24);
    /* glasset i en tyk messingramme */
    o += `<rect x="${x + 18}" y="${top + 112}" width="${W - 36}" height="176" rx="18" fill="url(#akBrass)" stroke="${WD}" stroke-width="4"/>`;
    o += `<rect x="${x + 30}" y="${top + 124}" width="${W - 60}" height="152" rx="10" fill="#0A0614" stroke="${WD}" stroke-width="3"/>`;
    o += `<g transform="translate(${x + 30} ${top + 124}) scale(${((W - 60) / 160).toFixed(3)} ${(152 / 120).toFixed(3)})"><g clip-path="url(#akScr)">${c.screen()}</g></g>`;
    o += `<rect x="${x + 30}" y="${top + 124}" width="${W - 60}" height="152" rx="10" fill="url(#akSepia)"/><rect x="${x + 30}" y="${top + 124}" width="${W - 60}" height="152" rx="10" fill="url(#akGlass)"/>`;
    o += rivets([[x + 26, top + 120], [x + W - 26, top + 120], [x + 26, top + 280], [x + W - 26, top + 280]]);
    o += `<text class="ak-blink" x="${cx}" y="${top + 268}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="14" fill="#FFE9A8" style="animation-delay:${i * .37}s">TRYK FOR AT SPILLE</text>`;
    /* hylden med et messinghåndtag og to glasknapper */
    o += `<path d="M ${x - 10} ${top + 336} L ${x + 6} ${top + 298} H ${x + W - 6} L ${x + W + 10} ${top + 336} Z" fill="url(#akWoodH)" stroke="${WD}" stroke-width="4" stroke-linejoin="round"/><path d="M ${x - 10} ${top + 336} H ${x + W + 10}" stroke="#C9962E" stroke-width="3"/>`;
    o += `<ellipse cx="${x + 62}" cy="${top + 322}" rx="20" ry="7" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/><path d="M ${x + 62} ${top + 320} L ${x + 72} ${top + 290}" stroke="#C9962E" stroke-width="7" stroke-linecap="round"/><path d="M ${x + 62} ${top + 320} L ${x + 72} ${top + 290}" stroke="${WD}" stroke-width="1.5"/><circle cx="${x + 73}" cy="${top + 286}" r="11" fill="#7A2A1A" stroke="${WD}" stroke-width="2"/><circle cx="${x + 69}" cy="${top + 282}" r="3" fill="#FFF" opacity=".5"/>`;
    o += knob(x + 140, top + 318, c.glow) + knob(x + 188, top + 318, '#E0457A');
    /* nederste fyldning med udskæring og en mønt-plade */
    o += `<rect x="${x + 22}" y="${top + 362}" width="${W - 44}" height="${base - top - 420}" rx="8" fill="none" stroke="${WD}" stroke-width="3" opacity=".7"/><rect x="${x + 30}" y="${top + 370}" width="${W - 60}" height="${base - top - 436}" rx="6" fill="none" stroke="#C9962E" stroke-width="2" opacity=".45"/>`;
    o += `<rect x="${cx - 34}" y="${top + 392}" width="68" height="84" rx="8" fill="url(#akBrass)" stroke="${WD}" stroke-width="3"/><rect x="${cx - 4}" y="${top + 404}" width="8" height="26" rx="3" fill="${WD}"/><rect x="${cx - 2}" y="${top + 408}" width="4" height="18" rx="2" fill="${c.glow}" class="ak-coin"/>`;
    o += `<text x="${cx}" y="${top + 456}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="12" fill="#3A2008">${hi ? 'REKORD' : 'GRATIS'}</text>` + (hi ? `<text x="${cx}" y="${top + 470}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="13" fill="#3A2008">${hi}</text>` : '');
    o += `<rect x="${x - 20}" y="${top - 70}" width="${W + 40}" height="${base - top + 90}" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- Bank en gnom: et gammelt træbord med ni messingkantede huller, en høj bagplade og en hammer med læderhoved ---------- */
  const GNOME_HEAD = (s = 1, mood = 'sur') => `<g transform="scale(${s})"><path d="M -22 4 C -24 -26 24 -26 22 4 Z" fill="#F2C8A0" stroke="${E}" stroke-width="2.5"/>`
    + `<path d="M -24 -14 L 0 -58 L 24 -14 Z" fill="#E0457A" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-58" r="5" fill="#FFF6D0" stroke="${E}" stroke-width="1.5"/>`
    + `<path d="M -26 -14 Q 0 -8 26 -14" stroke="#B5305A" stroke-width="5" fill="none" stroke-linecap="round"/>`
    + (mood === 'sur' ? `<path d="M -13 -7 l 8 4 M 13 -7 l -8 4" stroke="${E}" stroke-width="3" stroke-linecap="round"/><circle cx="-8" cy="-2" r="2.4" fill="${E}"/><circle cx="8" cy="-2" r="2.4" fill="${E}"/>` : `<path d="M -12 -4 l 6 6 M -6 -4 l -6 6 M 6 -4 l 6 6 M 12 -4 l -6 6" stroke="${E}" stroke-width="2.4" stroke-linecap="round"/>`)
    + `<ellipse cx="0" cy="5" rx="5" ry="4" fill="#E8A888"/><path d="M -18 6 C -14 26 14 26 18 6 C 10 12 -10 12 -18 6 Z" fill="#FFFFFF" stroke="${E}" stroke-width="2"/>`
    + (mood === 'sur' ? `<path d="M -7 11 q 7 -4 14 0" stroke="${E}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : `<ellipse cx="0" cy="12" rx="4" ry="3" fill="${E}"/>`) + `</g>`;
  /* et mekanisk tælleværk: hvide tal på sorte ruller i en messingramme */
  const drum = (x, y, txt, n, fs = 22) => { const w = fs * .78; let o = `<rect x="${x - 6}" y="${y - fs - 4}" width="${n * w + 12}" height="${fs + 16}" rx="5" fill="url(#akBrass)" stroke="${WD}" stroke-width="2.5"/>`;
    [...String(txt).padStart(n, ' ')].forEach((ch, k) => { o += `<rect x="${x + k * w + 1}" y="${y - fs + 1}" width="${w - 2}" height="${fs + 6}" rx="2" fill="#16100C"/><rect x="${x + k * w + 1}" y="${y - fs + 1}" width="${w - 2}" height="${(fs + 6) / 2}" rx="2" fill="#FFF" opacity=".08"/><text x="${x + k * w + w / 2}" y="${y + 1}" text-anchor="middle" font-family="'Courier New',monospace" font-weight="700" font-size="${fs}" fill="#F2EEDC">${ch.trim()}</text>`; });
    return o; };
  function gnomMachine(){
    const hi = hiOf('gnom');
    let o = `<g class="ak-cab" data-cab="gnom" tabindex="0" role="button" aria-label="Bank en gnom"><g class="anim">`;
    o += `<ellipse cx="240" cy="906" rx="210" ry="18" fill="#000" opacity=".4"/>`;
    /* bagpladen: en buet træplade med lyspærer, et emaljeskilt og en malet gnom */
    o += `<path d="M 104 566 V 330 Q 104 300 134 296 Q 240 250 346 296 Q 376 300 376 330 V 566 Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5"/>`;
    o += bulbs([[122, 330], [150, 300], [186, 284], [222, 276], [258, 276], [294, 284], [330, 300], [358, 330]]);
    o += `<rect x="124" y="312" width="232" height="58" rx="10" fill="#F4E6C8" stroke="${WD}" stroke-width="3"/><rect x="130" y="318" width="220" height="46" rx="7" fill="none" stroke="#7A2A1A" stroke-width="2"/>`
      + `<text x="240" y="352" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="27" fill="#7A2A1A">Bank en gnom</text>`;
    o += `<g transform="translate(240 470)">${GNOME_HEAD(1.25)}</g><g transform="translate(300 448) rotate(26)"><rect x="-5" y="-4" width="10" height="56" rx="4" fill="#8A5A3C" stroke="${E}" stroke-width="2"/><rect x="-22" y="-26" width="44" height="26" rx="8" fill="#8E3A22" stroke="${E}" stroke-width="2.5"/><path d="M -22 -13 h 44" stroke="${WD}" stroke-width="1.5" stroke-dasharray="3 3"/></g>`;
    o += hi ? drum(166, 542, String(hi).padStart(3, '0'), 3, 24) + `<text x="300" y="540" font-family="${FONT_C}" font-weight="700" font-size="14" fill="#F2D27A">REKORD</text>` : brassPlate(160, 512, 160, 38, 'GRATIS', 20);
    /* den skrå spilleplade med ni huller med messingkant */
    o += `<path d="M 60 650 L 104 566 H 376 L 420 650 Z" fill="url(#akWoodH)" stroke="${WD}" stroke-width="5" stroke-linejoin="round"/><path d="M 74 642 L 112 574 H 368 L 406 642 Z" fill="#5A3018" opacity=".55"/>`;
    const rows = [[588, 0.62], [612, 0.8], [636, 1]];
    rows.forEach(([y, k], r) => [-1, 0, 1].forEach(c => { const x = 240 + c * 92 * (0.72 + k * 0.28);
      o += `<ellipse cx="${x}" cy="${y}" rx="${31 * k}" ry="${10 * k}" fill="url(#akBrass)" stroke="${WD}" stroke-width="1.5"/><ellipse cx="${x}" cy="${y}" rx="${26 * k}" ry="${7.5 * k}" fill="#120A06"/>`;
      if ((r === 0 && c === 1) || (r === 2 && c === -1)) o += `<g transform="translate(${x} ${y - 2}) scale(${0.85 * k})"><g clip-path="url(#akHole)">${GNOME_HEAD(1)}</g></g>`; }));
    /* bordet med fyldinger og drejede ben */
    o += `<path d="M 60 650 H 420 V 860 H 60 Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5"/><path d="M 60 652 H 420" stroke="#C9962E" stroke-width="4"/>`;
    o += [[78, 670, 136, 170], [266, 670, 136, 170]].map(([px, py, pw, ph]) => `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="6" fill="none" stroke="${WD}" stroke-width="3" opacity=".6"/><rect x="${px + 8}" y="${py + 8}" width="${pw - 16}" height="${ph - 16}" rx="4" fill="none" stroke="#C9962E" stroke-width="1.5" opacity=".45"/>`).join('');
    o += brassPlate(186, 726, 108, 60, '', 14) + `<text x="240" y="752" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="14" fill="#3A2008">BANK</text><text x="240" y="772" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="14" fill="#3A2008">GNOMEN!</text>`;
    o += [80, 400].map(lx => `<path d="M ${lx - 12} 860 H ${lx + 12} L ${lx + 8} 894 H ${lx - 8} Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="3"/><rect x="${lx - 11}" y="890" width="22" height="12" rx="3" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/>`).join('');
    /* hammeren med læderhoved ligger på kanten i en snor */
    o += `<path d="M 420 700 C 452 720 448 780 424 800" stroke="#5A3A20" stroke-width="3" fill="none"/><g transform="translate(396 628) rotate(-24)"><rect x="-5" y="-4" width="10" height="70" rx="4" fill="#8A5A3C" stroke="${E}" stroke-width="2"/><rect x="-26" y="-30" width="52" height="30" rx="10" fill="#8E3A22" stroke="${E}" stroke-width="3"/><path d="M -26 -15 h 52" stroke="${WD}" stroke-width="1.5" stroke-dasharray="3 3"/><rect x="-28" y="-32" width="8" height="34" rx="3" fill="url(#akBrass)" stroke="${WD}" stroke-width="1.5"/><rect x="20" y="-32" width="8" height="34" rx="3" fill="url(#akBrass)" stroke="${WD}" stroke-width="1.5"/></g>`;
    o += `<rect x="40" y="250" width="410" height="670" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- Gribemaskinen: glaskasse i messingramme på et træskab, med lyspærer, klo i en skinne og præmieluge ---------- */
  const PLUSH = (c, s = 1, kind = 0) => `<g transform="scale(${s})"><circle cx="0" cy="0" r="22" fill="${c}" stroke="${E}" stroke-width="2.5"/>`
    + (kind === 1 ? `<path d="M -16 -14 L -10 -32 L -2 -18 M 16 -14 L 10 -32 L 2 -18" fill="${c}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/>` : `<circle cx="-16" cy="-16" r="8" fill="${c}" stroke="${E}" stroke-width="2.5"/><circle cx="16" cy="-16" r="8" fill="${c}" stroke="${E}" stroke-width="2.5"/>`)
    + `<circle cx="-7" cy="-3" r="2.8" fill="${E}"/><circle cx="7" cy="-3" r="2.8" fill="${E}"/><ellipse cx="0" cy="6" rx="6" ry="4" fill="#FFF" opacity=".7"/><circle cx="0" cy="4" r="2" fill="${E}"/></g>`;
  function clawMachine(){
    let o = `<g class="ak-cab" data-cab="gribe" tabindex="0" role="button" aria-label="Gribemaskinen"><g class="anim">`;
    o += `<ellipse cx="1300" cy="906" rx="230" ry="18" fill="#000" opacity=".4"/>`;
    /* toppen: buet træhoved med lyspærer og et messingskilt */
    o += `<path d="M 1092 306 V 256 Q 1092 232 1116 230 Q 1300 196 1484 230 Q 1508 232 1508 256 V 306 Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5"/>`;
    o += bulbs(Array.from({ length: 11 }, (_, i) => { const t = i / 10, X = 1112 + t * 376; return [X, 242 - Math.sin(t * Math.PI) * 30]; }), 1);
    o += brassPlate(1150, 254, 300, 44, 'Gribemaskinen', 27);
    /* glaskassen i messingstolper */
    o += `<rect x="1106" y="304" width="388" height="390" fill="#2A1A2A" stroke="${WD}" stroke-width="5"/><rect x="1112" y="310" width="376" height="378" fill="#3A2638"/>`;
    o += `<path d="M 1112 326 H 1488" stroke="#8A6420" stroke-width="8"/><path d="M 1112 326 H 1488" stroke="#F2D27A" stroke-width="3"/>`;
    o += `<path d="M 1300 326 V 450" stroke="#C9962E" stroke-width="2.5"/><rect x="1286" y="318" width="28" height="16" rx="4" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/>`;
    o += `<g transform="translate(1300 452)"><rect x="-14" y="-6" width="28" height="16" rx="4" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/><path d="M -10 10 C -26 26 -24 44 -12 54 M 10 10 C 26 26 24 44 12 54 M 0 10 V 50" stroke="#C9962E" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    o += `<rect x="1116" y="590" width="92" height="98" fill="#140C0A" opacity=".55"/><path d="M 1208 590 V 688" stroke="#F2E6C8" stroke-width="4" opacity=".6"/><path d="M 1116 590 H 1208" stroke="#F2E6C8" stroke-width="3" opacity=".6"/>`;
    const pl = [[1240, 672], [1286, 668], [1334, 672], [1380, 668], [1428, 672], [1466, 666], [1262, 634], [1310, 630], [1358, 632], [1404, 630], [1448, 634], [1334, 596], [1390, 598]];
    pl.forEach(([x, y], i) => { o += `<g transform="translate(${x} ${y - 6}) rotate(${(i * 37) % 40 - 20})">${plush(BAMSER[i % BAMSER.length].k, 0.78)}</g>`; });
    o += `<rect x="1112" y="310" width="376" height="378" fill="url(#akSepia)"/><path d="M 1130 310 L 1210 310 L 1130 470 Z M 1400 310 L 1440 310 L 1300 688 L 1270 688 Z" fill="#FFF" opacity=".07"/>`;
    o += [1106, 1494].map(px => `<rect x="${px - 9}" y="300" width="18" height="398" rx="4" fill="url(#akBrass)" stroke="${WD}" stroke-width="2.5"/>`).join('') + rivets([[1106, 320], [1494, 320], [1106, 680], [1494, 680]]);
    /* kontrolhylden og underskabet */
    o += `<path d="M 1086 694 H 1514 L 1504 726 H 1096 Z" fill="url(#akWoodH)" stroke="${WD}" stroke-width="4" stroke-linejoin="round"/><path d="M 1096 726 H 1504" stroke="#C9962E" stroke-width="3"/>`;
    o += knob(1260, 704, '#2E9C8A') + knob(1316, 704, '#2E9C8A') + `<circle cx="1420" cy="706" r="17" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/><circle cx="1420" cy="703" r="12" fill="#B0202E" stroke="${WD}" stroke-width="1.5"/><circle cx="1416" cy="699" r="3.5" fill="#FFF" opacity=".55"/>`;
    o += `<path d="M 1100 726 H 1500 V 860 H 1100 Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5"/>`;
    o += `<rect x="1120" y="744" width="100" height="92" rx="8" fill="url(#akBrass)" stroke="${WD}" stroke-width="3"/><rect x="1130" y="754" width="80" height="62" rx="5" fill="#140C0A"/><text x="1170" y="831" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="12" fill="#3A2008">PRÆMIE</text>`;
    o += brassPlate(1248, 752, 234, 70, '', 16) + `<text x="1365" y="782" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="17" fill="#3A2008">1 ★ PR. FORSØG</text><text x="1365" y="804" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="13" fill="#3A2008">Præmien kommer på værelset</text>`;
    o += [1124, 1476].map(lx => `<path d="M ${lx - 12} 860 H ${lx + 12} L ${lx + 8} 894 H ${lx - 8} Z" fill="url(#akWoodV)" stroke="${WD}" stroke-width="3"/><rect x="${lx - 11}" y="890" width="22" height="12" rx="3" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/>`).join('');
    o += `<rect x="1076" y="196" width="448" height="724" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- selve hallen: en gammel spillehal med tapet, træpaneler, plankegulv og gaslamper ---------- */
  function scene(){
    let o = `<svg class="scene" id="akSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet"><defs>`
      + `<linearGradient id="akBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2A0"/><stop offset=".45" stop-color="#D9A848"/><stop offset="1" stop-color="#8A6420"/></linearGradient>`
      + `<linearGradient id="akWoodV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A2E16"/><stop offset=".5" stop-color="#7A4224"/><stop offset="1" stop-color="#4A2412"/></linearGradient>`
      + `<linearGradient id="akWoodH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5030"/><stop offset="1" stop-color="#5A2E16"/></linearGradient>`
      + `<linearGradient id="akFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2010"/><stop offset="1" stop-color="#6A3C20"/></linearGradient>`
      + `<linearGradient id="akGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".22"/><stop offset=".35" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#FFF" stop-opacity=".06"/></linearGradient>`
      + `<radialGradient id="akSepia" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#5A3A1A" stop-opacity=".08"/><stop offset="1" stop-color="#2A1408" stop-opacity=".6"/></radialGradient>`
      + `<radialGradient id="akLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFD98A" stop-opacity=".5"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="akGlow"><stop offset="0" stop-color="#FFC870" stop-opacity=".45"/><stop offset="1" stop-color="#FFC870" stop-opacity="0"/></radialGradient>`
      + `<clipPath id="akScr"><rect width="160" height="120" rx="5"/></clipPath><clipPath id="akHole"><rect x="-60" y="-120" width="120" height="124"/></clipPath>`
      + `<pattern id="akDamask" width="120" height="140" patternUnits="userSpaceOnUse"><rect width="120" height="140" fill="#3E1420"/>`
      + `<g fill="#5A2230" stroke="#6E3038" stroke-width="1"><path d="M 60 14 C 74 34 92 40 92 62 C 92 82 72 88 60 104 C 48 88 28 82 28 62 C 28 40 46 34 60 14 Z"/><path d="M 60 40 C 66 50 74 54 74 62 C 74 72 66 76 60 84 C 54 76 46 72 46 62 C 46 54 54 50 60 40 Z" fill="#4A1A26"/>`
      + `<path d="M 0 84 C 8 96 18 100 18 112 C 18 124 8 128 0 140 M 120 84 C 112 96 102 100 102 112 C 102 124 112 128 120 140" fill="none"/></g><circle cx="60" cy="62" r="4" fill="#8A6420" opacity=".6"/><circle cx="0" cy="0" r="3" fill="#8A6420" opacity=".5"/><circle cx="120" cy="0" r="3" fill="#8A6420" opacity=".5"/></pattern>`
      + `</defs>`;
    /* tapet, et loftslist og træpaneler forneden */
    o += `<rect x="-1700" y="-200" width="5000" height="800" fill="url(#akDamask)"/><rect x="-1700" y="-200" width="5000" height="800" fill="#1A0A10" opacity=".35"/>`;
    o += `<rect x="-1700" y="-200" width="5000" height="226" fill="#2A140C"/><path d="M -1700 26 H 3300" stroke="#C9962E" stroke-width="4"/><path d="M -1700 34 H 3300" stroke="#5A2E16" stroke-width="8"/>`;
    o += `<rect x="-1700" y="560" width="5000" height="150" fill="url(#akWoodH)"/><path d="M -1700 560 H 3300" stroke="#C9962E" stroke-width="5"/><path d="M -1700 568 H 3300" stroke="#2A160C" stroke-width="3"/>`;
    for (let px = -1640; px < 3300; px += 170) o += `<rect x="${px}" y="584" width="140" height="106" rx="4" fill="none" stroke="#2A160C" stroke-width="3" opacity=".55"/><rect x="${px + 8}" y="592" width="124" height="90" rx="3" fill="none" stroke="#A8743E" stroke-width="1.5" opacity=".35"/>`;
    /* plankegulv i perspektiv */
    o += `<rect x="-1700" y="708" width="5000" height="600" fill="url(#akFloor)"/><path d="M -1700 708 H 3300" stroke="#2A160C" stroke-width="5"/>`;
    for (let k = -30; k <= 30; k++){ const xb = 800 + k * 150, xt = 800 + k * 60; o += `<path d="M ${xt} 708 L ${xb} 1300" stroke="#2A160C" stroke-width="2.5" opacity=".55"/>`; }
    [736, 774, 830, 910, 1020].forEach((y, r) => { for (let k = -30; k <= 30; k++){ if ((k + r) % 3) continue; const t = (y - 708) / 592, xa = 800 + k * (60 + 90 * t), xb2 = 800 + (k + 1) * (60 + 90 * t); o += `<path d="M ${xa} ${y} L ${xb2} ${y}" stroke="#2A160C" stroke-width="2" opacity=".5"/>`; } });
    /* skiltet: en træplade med messingkant, guldbogstaver og lyspærer hele vejen rundt */
    o += `<ellipse cx="800" cy="130" rx="420" ry="130" fill="url(#akGlow)"/>`;
    o += `<g class="ak-sign"><rect x="512" y="62" width="576" height="136" rx="22" fill="url(#akWoodV)" stroke="${WD}" stroke-width="6"/><rect x="530" y="80" width="540" height="100" rx="14" fill="#2A140C" stroke="url(#akBrass)" stroke-width="6"/>`
      + bulbs([...Array.from({ length: 13 }, (_, i) => [536 + i * 44, 70]), ...Array.from({ length: 13 }, (_, i) => [536 + i * 44, 190]), [520, 130], [1080, 130]])
      + `<text x="800" y="154" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="64" letter-spacing="8" fill="#1A0A04" transform="translate(0 4)">ARKADEN</text>`
      + `<text x="800" y="154" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="64" letter-spacing="8" fill="url(#akBrass)" stroke="#5A3A10" stroke-width="2">ARKADEN</text>`
      + `<path d="M 566 112 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z M 1034 112 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z" fill="url(#akBrass)" stroke="${WD}" stroke-width="1" class="ak-twinkle"/></g>`;
    /* to små plakater i guldrammer */
    const poster = (x, y, l1, l2, c) => `<rect x="${x}" y="${y}" width="150" height="190" rx="4" fill="url(#akBrass)" stroke="${WD}" stroke-width="3"/><rect x="${x + 10}" y="${y + 10}" width="130" height="170" fill="#F2E2BC"/><rect x="${x + 16}" y="${y + 16}" width="118" height="158" fill="none" stroke="${c}" stroke-width="2"/>`
      + `<path d="M ${x + 75} ${y + 40} l 8 16 l 18 2 l -13 12 l 4 18 l -17 -9 l -17 9 l 4 -18 l -13 -12 l 18 -2 Z" fill="${c}" stroke="${WD}" stroke-width="1.5"/>`
      + `<text x="${x + 75}" y="${y + 128}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="21" fill="${c}">${l1}</text><text x="${x + 75}" y="${y + 154}" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="15" fill="#5A3A20">${l2}</text>`;
    o += poster(-200, 250, 'Prøv lykken!', 'Hver dag', '#7A2A1A') + poster(1650, 250, 'Magiske spil', 'siden 1823', '#2E5A6A');
    /* gaslamper i loftet med varmt lys */
    [205, 1374].forEach((lx, i) => { const ly = 220;
      o += `<path d="M ${lx} 30 V ${ly - 46}" stroke="#2A160C" stroke-width="3"/><path d="M ${lx - 26} ${ly - 46} H ${lx + 26} L ${lx + 18} ${ly - 34} H ${lx - 18} Z" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/>`
        + `<path d="M ${lx - 18} ${ly - 34} L ${lx - 22} ${ly - 4} H ${lx + 22} L ${lx + 18} ${ly - 34} Z" fill="#FFE9A8" opacity=".85" stroke="${WD}" stroke-width="2"/><path d="M ${lx} ${ly - 24} q -6 8 0 16 q 6 -8 0 -16" fill="#FFB347"/>`
        + `<path d="M ${lx - 24} ${ly - 4} H ${lx + 24} L ${lx + 16} ${ly + 6} H ${lx - 16} Z" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/><circle cx="${lx}" cy="${ly - 18}" r="44" fill="url(#akGlow)"/>`
        + (true ? `<path d="M ${lx - 170} ${ly + 690} L ${lx - 26} ${ly + 6} L ${lx + 26} ${ly + 6} L ${lx + 170} ${ly + 690} Z" fill="url(#akLamp)" opacity=".4"/>` : ''); });
    /* fem maskiner på række: de er gjort en anelse mindre, så alle kan være der, også på en tablet */
    o += `<g transform="translate(800 906) scale(.86) translate(-800 -906)"><g transform="translate(-132 0)">${gnomMachine()}</g>` + cabinet(CABS[1], 346, 1) + cabinet(CABS[2], 646, 2) + cabinet(CABS[3], 946, 3) + `<g transform="translate(168 0)">${clawMachine()}</g></g>`;
    return o + `</svg>`;
  }

  /* ---------- hallen som skærm ---------- */
  function show(){
    if (cur && cur.game.stop) cur.game.stop(); cur = null;
    showScreen('#arkade'); playMusic('arkade'); SND.ambience('stemning.arkade'); busy = false;   /* hallens musik, med summen fra maskiner og mennesker under */
    const box = $('#arkadeBody'); box.innerHTML = ''; box.classList.remove('ak-wood');
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
    SND.play('arkade.start', () => sfx.coin()); busy = true;
    setTimeout(() => openGame(id), 260);
  }

  /* ---------- fælles ramme om et spil ---------- */
  function openGame(id){
    const game = GAMES[id], c = CABS.find(x => x.id === id);
    SND.ambience(null);
    const box = $('#arkadeBody'); box.innerHTML = '';
    /* skærmspillene sidder i et gammelt træskab: lærredet ses gennem et glas i en messingramme */
    const scr = c.kind === 'screen';
    box.classList.toggle('ak-wood', scr);
    const stage = el('div', { class:'ak-stage' + (scr ? ' scr' : ''), id:'akStage' });
    const stopBtn = el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); show(); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + 'Stop' });
    box.append(stage, ...(scr ? [el('div', { class:'ak-bezel', 'aria-hidden':'true' })] : []), ...placeUi([ stopBtn ], [ el('span', { class:'ak-pill', id:'akInfo', hidden: true }), el('span', { class:'ak-pill ak-score' }, [ el('span', { class:'lab' }, 'Point'), el('span', { id:'akScore' }, '0') ]), audioBtns() ]));
    updateAudioBtns();
    /* gribemaskinen giver en bamse, ikke point */
    if (game.noScore){ const sp = box.querySelector('.ak-score'); if (sp) sp.hidden = true; }
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
    if (o.sound !== false){ if (rec && n > 0 || o.win) SND.play('arkade.rekord', () => sfx.fanfare()); else SND.play('arkade.slut', () => sfx.magic()); }
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
    { k:'froe', name:'frøbamse', c:'#5AB85A', c2:'#C8F0A0' }, { k:'spoegelse', name:'spøgelsesbamse', c:'#F2EEFF', c2:'#C8C4E8' },
    /* fantasy-væsner */
    { k:'ork', name:'orkebamse', c:'#7AAA4A', c2:'#C8D890' }, { k:'kentaur', name:'kentaurbamse', c:'#A8703A', c2:'#E8C8A0', ch:'#F2C8A0', hair:'#5A3A1A' },
    { k:'grif', name:'griffenbamse', c:'#D8A84A', c2:'#F2E2B0', ch:'#F7F4FF' }, { k:'trold', name:'troldebamse', c:'#8A9A6A', c2:'#D8C8A0', hair:'#E07A2A' },
    { k:'foeniks', name:'føniksbamse', c:'#FF7A2A', c2:'#FFD27A' }, { k:'havfrue', name:'havfruebamse', c:'#3FC7B4', c2:'#A8F0E4', ch:'#F7D2B8', hair:'#B05AE0' },
    { k:'pegasus', name:'pegasusbamse', c:'#FFFFFF', c2:'#C8E8FF', hair:'#7AB8F0' }, { k:'yeti', name:'yetibamse', c:'#F2F6FF', c2:'#9AB8E8' },
    { k:'minotaur', name:'minotaurbamse', c:'#8A5A3A', c2:'#D8B890' }, { k:'kraken', name:'krakenbamse', c:'#9A5AD8', c2:'#E0C0FF' },
    { k:'ilddrage', name:'ilddragebamse', c:'#E0503A', c2:'#FFD27A', base:'drage', wing:'#B8302A' }, { k:'isdrage', name:'isdragebamse', c:'#7AC8F0', c2:'#E8F8FF', base:'drage', wing:'#4A98D0' } ];
  function plush(k0, s = 1){
    const b = BAMSER.find(x => x.k === k0) || BAMSER[0], k = b.base || b.k, c = b.c, c2 = b.c2, ch = b.ch || c, st = `stroke="${E}" stroke-width="2.5"`, sj = `${st} stroke-linejoin="round"`;
    let o = `<g transform="scale(${s})">`;
    if (k === 'spoegelse') return o + `<path d="M -26 34 V -6 C -26 -40 26 -40 26 -6 V 34 Q 17 26 9 34 Q 0 26 -9 34 Q -17 26 -26 34 Z" fill="${c}" ${st}/><ellipse cx="-9" cy="-6" rx="4" ry="6" fill="${E}"/><ellipse cx="9" cy="-6" rx="4" ry="6" fill="${E}"/><ellipse cx="0" cy="8" rx="5" ry="4" fill="${E}"/><circle cx="-16" cy="4" r="4" fill="#FFB8D0" opacity=".7"/><circle cx="16" cy="4" r="4" fill="#FFB8D0" opacity=".7"/></g>`;
    /* det, der sidder bag kroppen: vinger og haler */
    if (k === 'drage') o += `<path d="M -20 6 L -40 -8 L -34 10 Z M 20 6 L 40 -8 L 34 10 Z" fill="${b.wing || '#5AA84A'}" ${sj}/>`;
    if (k === 'grif') o += `<path d="M -18 4 C -44 -6 -46 18 -30 22 C -36 14 -30 8 -18 12 Z M 18 4 C 44 -6 46 18 30 22 C 36 14 30 8 18 12 Z" fill="#9A6A3A" ${sj}/>`;
    if (k === 'pegasus') o += `<path d="M -18 6 C -40 -14 -48 6 -34 16 C -40 8 -30 2 -18 12 Z M 18 6 C 40 -14 48 6 34 16 C 40 8 30 2 18 12 Z" fill="#E8F4FF" ${sj}/><path d="M -36 4 l 8 4 M -40 10 l 8 2 M 36 4 l -8 4 M 40 10 l -8 2" stroke="${E}" stroke-width="1.4"/>`;
    if (k === 'foeniks') o += `<path d="M -18 6 C -40 -10 -44 14 -28 18 Z M 18 6 C 40 -10 44 14 28 18 Z" fill="#E0402A" ${sj}/><path d="M 16 26 C 36 30 42 22 38 10 C 34 20 28 22 22 20 Z" fill="#FFD27A" ${sj}/>`;
    if (k === 'kentaur') o += `<path d="M 20 20 C 38 22 40 34 32 42 C 30 34 26 28 18 28 Z" fill="${b.hair}" ${sj}/>`;
    if (k === 'trold') o += `<path d="M 20 26 Q 36 30 32 40 Q 30 34 22 32" stroke="${E}" stroke-width="2" fill="${c}"/><circle cx="33" cy="40" r="4" fill="${b.hair}" ${st}/>`;
    /* krop med mave og fødder (havfruen har en fiskehale, kraken arme) */
    o += `<ellipse cx="0" cy="16" rx="24" ry="19" fill="${c}" ${st}/><ellipse cx="0" cy="19" rx="13" ry="11" fill="${c2}"/>`;
    if (k === 'havfrue') o += `<path d="M -6 30 C -24 34 -26 44 -20 46 C -14 40 -6 38 0 36 C 6 38 14 40 20 46 C 26 44 24 34 6 30 Z" fill="${c}" ${sj}/><path d="M -10 14 q 4 3 8 0 M 2 14 q 4 3 8 0 M -4 22 q 4 3 8 0" stroke="${E}" stroke-width="1.2" fill="none" opacity=".45"/>`;
    else if (k === 'kraken') o += `<path d="M -20 26 q -10 8 -4 14 q 4 2 6 -4 M -8 32 q -4 10 2 12 q 4 0 2 -6 M 8 32 q 4 10 -2 12 q -4 0 -2 -6 M 20 26 q 10 8 4 14 q -4 2 -6 -4" stroke="${E}" stroke-width="2.5" fill="${c}" stroke-linecap="round"/><circle cx="-8" cy="20" r="2" fill="${c}"/><circle cx="0" cy="24" r="2" fill="${c}"/><circle cx="8" cy="20" r="2" fill="${c}"/>`;
    else o += `<ellipse cx="-14" cy="32" rx="9" ry="5" fill="${c}" ${st}/><ellipse cx="14" cy="32" rx="9" ry="5" fill="${c}" ${st}/>`;
    if (k === 'drage') o += `<path d="M 20 24 Q 38 30 34 14" stroke="${E}" stroke-width="2.5" fill="${c}"/>`;
    if (k === 'yeti') o += `<path d="M -24 10 l -5 3 l 5 2 M -24 20 l -5 3 l 5 2 M 24 10 l 5 3 l -5 2 M 24 20 l 5 3 l -5 2" stroke="${E}" stroke-width="2" fill="${c}" stroke-linejoin="round"/>`;
    /* ører, horn og hår bag hovedet */
    if (k === 'bjoern') o += `<circle cx="-16" cy="-30" r="8" fill="${c}" ${st}/><circle cx="16" cy="-30" r="8" fill="${c}" ${st}/><circle cx="-16" cy="-30" r="4" fill="${c2}"/><circle cx="16" cy="-30" r="4" fill="${c2}"/>`;
    if (k === 'kat') o += `<path d="M -20 -22 L -16 -42 L -4 -30 Z M 20 -22 L 16 -42 L 4 -30 Z" fill="${c}" ${sj}/>`;
    if (k === 'kanin') o += `<ellipse cx="-9" cy="-44" rx="6" ry="17" fill="${c}" ${st}/><ellipse cx="9" cy="-44" rx="6" ry="17" fill="${c}" ${st}/><ellipse cx="-9" cy="-44" rx="3" ry="11" fill="${c2}"/><ellipse cx="9" cy="-44" rx="3" ry="11" fill="${c2}"/>`;
    if (k === 'ugle') o += `<path d="M -20 -20 L -18 -40 L -6 -28 Z M 20 -20 L 18 -40 L 6 -28 Z" fill="${c}" ${sj}/>`;
    if (k === 'drage') o += `<path d="M -10 -32 l -4 -12 l 8 6 Z M 10 -32 l 4 -12 l -8 6 Z" fill="${c2}" ${st}/>`;
    if (k === 'enhjoerning') o += `<path d="M -16 -30 C -26 -20 -24 -8 -20 0 C -14 -12 -10 -22 -4 -30 Z" fill="${c2}" ${st}/><path d="M -4 -34 L 0 -54 L 4 -34 Z" fill="#F2C14E" ${st}/><path d="M -14 -28 l -4 -10 l 8 4 Z M 14 -28 l 4 -10 l -8 4 Z" fill="${c}" ${st}/>`;
    if (k === 'ork') o += `<path d="M -19 -18 L -40 -26 L -22 -6 Z M 19 -18 L 40 -26 L 22 -6 Z" fill="${c}" ${sj}/><path d="M -22 -16 L -33 -22 M 22 -16 L 33 -22" stroke="${c2}" stroke-width="2.5"/>`;
    if (k === 'trold') o += `<path d="M -10 -34 l -6 -12 l 8 4 l 2 -12 l 6 10 l 6 -10 l 0 12 l 8 -4 l -6 12 Z" fill="${b.hair}" ${sj}/><circle cx="-22" cy="-14" r="6" fill="${c}" ${st}/><circle cx="22" cy="-14" r="6" fill="${c}" ${st}/>`;
    if (k === 'kentaur' || k === 'pegasus') o += `<path d="M -18 -26 L -16 -42 L -6 -32 Z M 18 -26 L 16 -42 L 6 -32 Z" fill="${k === 'pegasus' ? c : '#A8703A'}" ${sj}/>`;
    if (k === 'havfrue') o += `<path d="M -22 -18 C -30 0 -28 14 -20 20 C -18 8 -16 -2 -12 -12 Z M 22 -18 C 30 0 28 14 20 20 C 18 8 16 -2 12 -12 Z" fill="${b.hair}" ${sj}/>`;
    if (k === 'yeti') o += `<path d="M -14 -32 q -6 -10 -2 -16 q 2 8 8 10 Z M 14 -32 q 6 -10 2 -16 q -2 8 -8 10 Z" fill="#F2E2C0" ${sj}/>`;
    if (k === 'minotaur') o += `<path d="M -16 -28 C -30 -30 -36 -42 -30 -50 C -28 -42 -22 -38 -10 -36 Z M 16 -28 C 30 -30 36 -42 30 -50 C 28 -42 22 -38 10 -36 Z" fill="#F2E8D0" ${sj}/><ellipse cx="-22" cy="-18" rx="8" ry="4" fill="${c}" ${st} transform="rotate(-20 -22 -18)"/><ellipse cx="22" cy="-18" rx="8" ry="4" fill="${c}" ${st} transform="rotate(20 22 -18)"/>`;
    if (k === 'grif') o += `<path d="M -14 -30 l -4 -12 l 8 6 Z M 14 -30 l 4 -12 l -8 6 Z" fill="${ch}" ${st}/>`;
    if (k === 'foeniks') o += `<path d="M -8 -34 C -12 -46 -6 -50 -4 -58 C 0 -50 2 -44 0 -36 C 4 -44 8 -46 10 -52 C 12 -44 10 -38 6 -32 Z" fill="#FFB02E" ${sj}/><path d="M -3 -36 C -4 -42 -2 -46 -1 -50 C 1 -46 2 -42 1 -36 Z" fill="#FFF0A0"/>`;
    /* hovedet */
    if (k === 'froe') o += `<ellipse cx="0" cy="-12" rx="25" ry="17" fill="${c}" ${st}/><circle cx="-11" cy="-28" r="9" fill="${c}" ${st}/><circle cx="11" cy="-28" r="9" fill="${c}" ${st}/><circle cx="-11" cy="-28" r="4" fill="${E}"/><circle cx="11" cy="-28" r="4" fill="${E}"/><path d="M -14 -8 Q 0 2 14 -8" stroke="${E}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="-16" cy="-10" r="4" fill="#FFB8D0" opacity=".7"/><circle cx="16" cy="-10" r="4" fill="#FFB8D0" opacity=".7"/>`;
    else if (k === 'yeti') o += `<path d="M -22 -14 l -4 -4 l 4 -4 l -2 -6 l 6 -2 l 2 -6 l 6 2 l 4 -4 l 4 4 l 6 -2 l 2 6 l 6 2 l -2 6 l 4 4 l -4 4 l 4 4 l -4 5 l 2 5 l -6 2 l -4 5 l -6 -2 l -6 3 l -6 -3 l -6 2 l -4 -5 l -6 -2 l 2 -5 l -4 -5 Z" fill="${c}" ${sj}/><ellipse cx="0" cy="-12" rx="13" ry="11" fill="${c2}"/>`;
    else o += `<circle cx="0" cy="-14" r="22" fill="${ch}" ${st}/>`;
    if (k === 'kentaur') o += `<path d="M -22 -12 C -24 -34 -6 -40 6 -36 C 16 -34 24 -24 22 -12 C 16 -24 6 -28 -6 -26 C -14 -24 -18 -18 -22 -12 Z" fill="${b.hair}" ${sj}/>`;
    if (k === 'havfrue') o += `<path d="M -22 -12 C -24 -36 22 -40 22 -12 C 14 -26 -2 -28 -22 -12 Z" fill="${b.hair}" ${sj}/><circle cx="12" cy="-30" r="4" fill="#FF8FC7" ${st}/>`;
    if (k === 'pegasus') o += `<path d="M -8 -34 C -2 -42 10 -40 14 -32 C 8 -34 2 -32 -2 -28 Z" fill="${b.hair}" ${sj}/>`;
    if (k === 'kraken') o += `<circle cx="-12" cy="-26" r="3" fill="${c2}"/><circle cx="10" cy="-30" r="2.4" fill="${c2}"/><circle cx="14" cy="-22" r="2" fill="${c2}"/>`;
    /* ansigtet */
    if (k === 'ugle') o += `<circle cx="-9" cy="-16" r="9" fill="${c2}" ${st}/><circle cx="9" cy="-16" r="9" fill="${c2}" ${st}/><circle cx="-9" cy="-16" r="4" fill="${E}"/><circle cx="9" cy="-16" r="4" fill="${E}"/><path d="M -4 -6 L 4 -6 L 0 2 Z" fill="#F2A040" ${st}/>`;
    else if (k !== 'froe'){
      const beak = k === 'grif' || k === 'foeniks', snout = k === 'bjoern' || k === 'drage' || k === 'minotaur';
      o += `<circle cx="-8" cy="-16" r="3.4" fill="${E}"/><circle cx="8" cy="-16" r="3.4" fill="${E}"/><circle cx="-7" cy="-17" r="1.1" fill="#FFF"/><circle cx="9" cy="-17" r="1.1" fill="#FFF"/>`;
      if (k === 'ork' || k === 'trold' || k === 'minotaur') o += `<path d="M -13 -23 l 9 3 M 13 -23 l -9 3" stroke="${E}" stroke-width="2.6" stroke-linecap="round"/>`;
      if (beak) o += `<path d="M -6 -9 L 6 -9 L 0 2 Z" fill="#F2A040" ${sj}/>`;
      else if (k === 'trold') o += `<ellipse cx="0" cy="-7" rx="7" ry="6" fill="${c2}" ${st}/><path d="M -6 1 q 6 4 12 0" stroke="${E}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      else o += `<ellipse cx="0" cy="-6" rx="${snout ? 8 : 5}" ry="${snout ? 6 : 4}" fill="${k === 'bjoern' || k === 'minotaur' ? c2 : k === 'drage' ? lt(c, .25) : 'none'}"/><path d="M -3 -8 L 3 -8 L 0 -5 Z" fill="${k === 'kanin' || k === 'kat' ? '#FF8FB0' : E}"/><path d="M 0 -5 q -4 4 -7 1 M 0 -5 q 4 4 7 1" stroke="${E}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      if (k === 'ork') o += `<path d="M -7 -3 l 2 -6 l 2 6 Z M 3 -3 l 2 -6 l 2 6 Z" fill="#FFFFF0" stroke="${E}" stroke-width="1.2" stroke-linejoin="round"/>`;
      if (k === 'minotaur') o += `<circle cx="0" cy="-1" r="4" fill="none" stroke="#F2C14E" stroke-width="2"/>`;
      o += `<circle cx="-15" cy="-8" r="4" fill="#FFB8D0" opacity=".65"/><circle cx="15" cy="-8" r="4" fill="#FFB8D0" opacity=".65"/>`;
    }
    if (k === 'kat') o += `<path d="M -20 -8 h -10 M -20 -4 h -10 M 20 -8 h 10 M 20 -4 h 10" stroke="${E}" stroke-width="1.4"/>`;
    /* en lille syning, så de ligner tøjdyr */
    o += `<path d="M 0 2 V 30" stroke="${E}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".35"/>`;
    return o + `</g>`;
  }
  const KEY_PLUSH = 'glimmerstudiet.bamser';
  const myPlush = () => store.get(KEY_PLUSH, []) || [];
  return { show, openGame, CABS, GAMES, hiOf, E, GNOME_HEAD, PLUSH, BAMSER, plush, myPlush, KEY_PLUSH };
})();
