/* ================= Arkaden =================
   En mørk, hyggelig spillehal i byens magiske stil: neonskilt over døren, ternet gulv, lamper i loftet og en
   række gamle spilleautomater. Hver automat er et lille spil. Man trykker på en automat for at spille.
   Automaterne beskrives i CABS: navn, farver og den lille tegning på skærmen. Et spil, der ikke er lavet endnu,
   siger "Kommer snart". */
const Arkade = (() => {
  const E = '#1A1238';
  /* automaterne fra venstre mod højre; play sættes, når spillet findes */
  const CABS = [
    { id:'gnom',    name:'Bank en gnom',    sub:'Sure gnomer',   body:'#3E8A4A', trim:'#9BE36A', glow:'#9BE36A', screen: gnomArt },
    { id:'skjold',  name:'Stjerneskjoldet', sub:'Red skolen',    body:'#3A4AA8', trim:'#7FD8FF', glow:'#7FD8FF', screen: shieldArt },
    { id:'invader', name:'Hekse-invaders',  sub:'Skyd stjerner', body:'#7A2A8A', trim:'#FF8FC7', glow:'#FF8FC7', screen: invArt },
    { id:'gribe',   name:'Gribemaskinen',   sub:'Vind præmier',  body:'#A8502A', trim:'#FFD36E', glow:'#FFD36E', screen: clawArt },
  ];
  const GAMES = {};   /* spillene melder sig her: GAMES.gnom = { start(box, done) } */
  let busy = false;

  /* ---------- tegningerne på automaternes skærme (i et felt på 160 x 120) ---------- */
  function gnomArt(){
    let o = `<rect width="160" height="120" fill="#123A1E"/>`;
    [[30, 92], [80, 76], [130, 92], [55, 108], [105, 108]].forEach(([x, y], i) => {
      o += `<ellipse cx="${x}" cy="${y}" rx="18" ry="6" fill="#0A1E10"/>`;
      if (i === 1) o += `<g transform="translate(${x} ${y - 4})"><path d="M -10 0 C -10 -14 10 -14 10 0 Z" fill="#F2C8A0"/><path d="M -11 -10 L 0 -30 L 11 -10 Z" fill="#E0457A"/><path d="M -6 -6 l 4 2 M 6 -6 l -4 2" stroke="${E}" stroke-width="1.6"/><path d="M -6 -1 q 6 -3 12 0" stroke="${E}" stroke-width="1.4" fill="none"/><path d="M -9 0 Q 0 10 9 0" fill="#FFFFFF"/></g>`;
    });
    o += `<g transform="translate(112 46) rotate(-30)"><rect x="-3" y="-6" width="6" height="34" rx="2" fill="#8A5A3C"/><circle cx="0" cy="-8" r="6" fill="#FFE27A"/></g>`;
    return o;
  }
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
  function clawArt(){
    let o = `<rect width="160" height="120" fill="#2A1A10"/><path d="M 80 0 V 46" stroke="#C8C4D8" stroke-width="2"/><path d="M 72 46 h 16 M 72 46 q -6 10 0 16 M 88 46 q 6 10 0 16" stroke="#C8C4D8" stroke-width="3" fill="none"/>`;
    [[30, 100, '#FF8FC7'], [58, 104, '#7FD8FF'], [100, 102, '#9BE36A'], [128, 100, '#FFD36E'], [80, 108, '#C79BFF']].forEach(([x, y, c]) => {
      o += `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/><circle cx="${x - 8}" cy="${y - 10}" r="5" fill="${c}"/><circle cx="${x + 8}" cy="${y - 10}" r="5" fill="${c}"/><circle cx="${x - 4}" cy="${y - 2}" r="1.6" fill="${E}"/><circle cx="${x + 4}" cy="${y - 2}" r="1.6" fill="${E}"/>`; });
    return o;
  }

  /* ---------- en automat: marquee med navnet, skærm, kontrolpanel med joystick og knapper, mønthul ---------- */
  function cabinet(c, x, i){
    const W = 250, top = 290, base = 900, cx = x + W / 2;
    let o = `<g class="ak-cab" data-cab="${c.id}" tabindex="0" role="button" aria-label="${c.name}"><g class="anim">`;
    o += `<ellipse cx="${cx}" cy="${base + 6}" rx="${W / 2 + 20}" ry="16" fill="#000" opacity=".35"/>`;
    /* skabet: bredere foroven, skrå front ved kontrolpanelet */
    o += `<path d="M ${x} ${base} V ${top + 60} Q ${x} ${top} ${x + 20} ${top} H ${x + W - 20} Q ${x + W} ${top} ${x + W} ${top + 60} V ${base} Z" fill="${c.body}" stroke="${E}" stroke-width="5" stroke-linejoin="round"/>`;
    o += `<path d="M ${x + 10} ${base} V ${top + 64} Q ${x + 10} ${top + 12} ${x + 26} ${top + 12}" stroke="${c.trim}" stroke-width="3" fill="none" opacity=".55"/>`;
    /* skyggesiden til højre giver skabet dybde */
    o += `<path d="M ${x + W - 22} ${base - 3} V ${top + 58} Q ${x + W - 22} ${top + 14} ${x + W - 34} ${top + 6} Q ${x + W - 4} ${top + 10} ${x + W - 3} ${top + 60} V ${base - 3} Z" fill="#000" opacity=".22"/>`;
    /* marqueen med navnet lyser */
    o += `<rect x="${x + 16}" y="${top + 16}" width="${W - 32}" height="66" rx="10" fill="#140C2A" stroke="${c.trim}" stroke-width="3"/>`;
    o += `<text class="ak-neon" x="${cx}" y="${top + 50}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="${c.name.length > 13 ? 22 : 25}" fill="${c.glow}" style="--glow:${c.glow}">${c.name}</text>`;
    o += `<text x="${cx}" y="${top + 72}" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="14" fill="#F2EEDC" opacity=".8">${c.sub}</text>`;
    /* skærmen i en sort ramme */
    o += `<rect x="${x + 22}" y="${top + 100}" width="${W - 44}" height="168" rx="12" fill="#0A0614" stroke="${E}" stroke-width="4"/>`;
    o += `<g transform="translate(${x + 30} ${top + 108}) scale(${((W - 60) / 160).toFixed(3)} ${(152 / 120).toFixed(3)})"><g clip-path="url(#akScr)">${c.screen()}</g></g>`;
    o += `<rect x="${x + 30}" y="${top + 108}" width="${W - 60}" height="152" rx="6" fill="url(#akGlass)"/>`;
    o += `<rect x="${x + 30}" y="${top + 236}" width="${W - 60}" height="24" fill="#0A0614" opacity=".72"/>`;
    o += `<text class="ak-blink" x="${cx}" y="${top + 252}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="15" fill="#FFF6D0" style="animation-delay:${i * .37}s">TRYK FOR AT SPILLE</text>`;
    /* kontrolpanelet skråner ud mod én */
    o += `<path d="M ${x - 8} ${top + 330} L ${x + 8} ${top + 288} H ${x + W - 8} L ${x + W + 8} ${top + 330} Z" fill="#2A1E52" stroke="${E}" stroke-width="4" stroke-linejoin="round"/>`;
    o += `<path d="M ${x + 56} ${top + 312} V ${top + 294}" stroke="#1A1238" stroke-width="6" stroke-linecap="round"/><circle cx="${x + 56}" cy="${top + 292}" r="10" fill="#E0457A" stroke="${E}" stroke-width="2"/><ellipse cx="${x + 56}" cy="${top + 314}" rx="18" ry="6" fill="#140C2A"/>`;
    o += [['#FFD36E', 130], ['#7FD8FF', 166], ['#9BE36A', 202]].map(([bc, bx]) => `<ellipse cx="${x + bx}" cy="${top + 312}" rx="13" ry="7" fill="#140C2A"/><ellipse cx="${x + bx}" cy="${top + 309}" rx="11" ry="6" fill="${bc}" stroke="${E}" stroke-width="1.5"/>`).join('');
    /* forside med mønthul og en lille plakette */
    o += `<rect x="${cx - 26}" y="${top + 380}" width="52" height="70" rx="8" fill="#140C2A" stroke="${E}" stroke-width="3"/><rect x="${cx - 4}" y="${top + 392}" width="8" height="24" rx="3" fill="${c.glow}" class="ak-coin"/><text x="${cx}" y="${top + 440}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="12" fill="${c.glow}">1 ★</text>`;
    o += `<path d="M ${x + 24} ${top + 480} h ${W - 48}" stroke="${c.trim}" stroke-width="4" stroke-linecap="round" opacity=".5"/><path d="M ${x + 24} ${top + 500} h ${W - 48}" stroke="${c.trim}" stroke-width="2" stroke-linecap="round" opacity=".35"/>`;
    o += `<rect x="${x - 20}" y="${top - 20}" width="${W + 40}" height="${base - top + 40}" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g>`;
  }

  /* ---------- selve hallen ---------- */
  function scene(){
    let o = `<svg class="scene" id="akSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet"><defs>`
      + `<linearGradient id="akWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C1240"/><stop offset="1" stop-color="#2E1E5A"/></linearGradient>`
      + `<linearGradient id="akGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".22"/><stop offset=".35" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#FFF" stop-opacity=".06"/></linearGradient>`
      + `<radialGradient id="akLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".45"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="akNeonGlow"><stop offset="0" stop-color="#FF5FB0" stop-opacity=".5"/><stop offset="1" stop-color="#FF5FB0" stop-opacity="0"/></radialGradient>`
      + `<clipPath id="akScr"><rect width="160" height="120" rx="5"/></clipPath>`
      + `<pattern id="akStars" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M 20 18 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 Z" fill="#3E2E78"/><circle cx="66" cy="62" r="3" fill="#3E2E78"/><circle cx="54" cy="24" r="1.6" fill="#4C3A8A"/></pattern>`
      + `</defs>`;
    /* væggen med stjernetapet og et træpanel forneden */
    o += `<rect x="-1700" y="-200" width="5000" height="1400" fill="url(#akWall)"/><rect x="-1700" y="-200" width="5000" height="1000" fill="url(#akStars)"/>`;
    o += `<rect x="-1700" y="600" width="5000" height="70" fill="#3A2448"/><path d="M -1700 600 H 3300" stroke="#5A3A68" stroke-width="6"/>`;
    /* gulvet: ternet i perspektiv */
    o += `<rect x="-1700" y="670" width="5000" height="600" fill="#22163E"/>`;
    for (let r = 0; r < 7; r++){
      const y0 = 670 + r * r * 9 + r * 26, y1 = 670 + (r + 1) * (r + 1) * 9 + (r + 1) * 26;
      for (let c = -12; c < 13; c++){
        if ((r + c) % 2) continue;
        const xa = 800 + c * (110 + r * 22), xb = 800 + (c + 1) * (110 + r * 22), xc = 800 + (c + 1) * (110 + (r + 1) * 22), xd = 800 + c * (110 + (r + 1) * 22);
        o += `<path d="M ${xa} ${y0} L ${xb} ${y0} L ${xc} ${y1} L ${xd} ${y1} Z" fill="#33215A"/>`;
      }
    }
    /* neonskiltet over automaterne */
    o += `<ellipse cx="800" cy="130" rx="420" ry="120" fill="url(#akNeonGlow)"/>`;
    o += `<g class="ak-sign"><rect x="520" y="70" width="560" height="120" rx="26" fill="#140C2A" stroke="#FF5FB0" stroke-width="6"/><rect x="534" y="84" width="532" height="92" rx="18" fill="none" stroke="#7FD8FF" stroke-width="2" opacity=".6"/>`
      + `<text class="ak-neon" x="800" y="152" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="66" letter-spacing="8" fill="#FFB8DC" style="--glow:#FF5FB0">ARKADEN</text>`
      + `<path d="M 560 110 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z M 1040 110 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z" fill="#FFE27A" class="ak-twinkle"/></g>`;
    /* lamper i loftet */
    [[200, 230], [800, 0], [1400, 230]].forEach(([lx, ly]) => { if (ly === 0) return;
      o += `<path d="M ${lx} -20 V ${ly - 40}" stroke="#140C2A" stroke-width="3"/><path d="M ${lx - 34} ${ly - 10} Q ${lx} ${ly - 54} ${lx + 34} ${ly - 10} Z" fill="#5A3A68" stroke="${E}" stroke-width="3"/><ellipse cx="${lx}" cy="${ly - 8}" rx="16" ry="6" fill="#FFE9A8"/><path d="M ${lx - 160} ${ly + 600} L ${lx - 30} ${ly - 8} L ${lx + 30} ${ly - 8} L ${lx + 160} ${ly + 600} Z" fill="url(#akLamp)" opacity=".5"/>`; });
    /* automaterne */
    const xs = [86, 438, 912, 1264];
    CABS.forEach((c, i) => { o += cabinet(c, xs[i], i); });
    /* en lille plante og en papirkurv i midten mellem automaterne, så der er luft */
    o += `<g transform="translate(800 900)"><ellipse cx="0" cy="4" rx="120" ry="16" fill="#000" opacity=".3"/><path d="M -70 0 L -60 -70 H 60 L 70 0 Z" fill="#3A2C68" stroke="${E}" stroke-width="4" stroke-linejoin="round"/>`
      + `<text x="0" y="-26" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="18" fill="#FFE27A">HIGHSCORE</text>`
      + `<g class="ak-scores">${scoreLines()}</g></g>`;
    o += `<g transform="translate(800 700)"><path d="M -34 0 C -40 -40 -20 -80 0 -96 C 20 -80 40 -40 34 0 Z" fill="#2E6A3A" stroke="${E}" stroke-width="3"/><path d="M 0 -96 V 0 M -18 -60 L 0 -40 L 18 -64" stroke="#9BE36A" stroke-width="3" fill="none"/><path d="M -40 0 h 80 l -8 50 h -64 Z" fill="#8A5A3C" stroke="${E}" stroke-width="3"/></g>`;
    return o + `</svg>`;
  }
  /* de bedste resultater står på tavlen i midten */
  const KEY_HI = 'glimmerstudiet.arkade';
  const hiAll = () => { try { return JSON.parse(store.get(KEY_HI, '{}')) || {}; } catch(e){ return {}; } };
  function scoreLines(){
    const hi = hiAll();
    return `<text x="0" y="-4" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="14" fill="#F2EEDC">${CABS.filter(c => hi[c.id]).map(c => `${c.name.split(' ')[0]}: ${hi[c.id]}`).slice(0, 2).join(' · ') || 'Ingen endnu'}</text>`;
  }

  /* ---------- skærmen ---------- */
  function show(){
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
    const id = g.dataset.cab, c = CABS.find(x => x.id === id), game = GAMES[id];
    replay(g, 'jiggle');
    if (!game){ sfx.nope(); toast(`${c.name} kommer snart!`); return; }
    sfx.coin(); busy = true;
    game.start(id);
  }
  return { show, CABS, GAMES, hiAll, KEY_HI };
})();
