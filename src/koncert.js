/* ================= Koncertsalen: gnome-bandet på scenen =================
   Fire gnomer spiller rolig musik på en gammel teaterscene med messing, fløjl og gaslamper.
   Man kan ønske en sang: så går bandet ud i kulissen, tæppet går for, og de kommer tilbage i tøj, der passer
   til sangen (rock med ansigtsmaling, cowboyhatte, disko-afro, parykker og hawaiiskjorter).
   Scenen er lag af billeder (baggrund, band, tæppe, forgrund), så kun gnomerne bevæger sig, og det kører let på tabletten.
   Står som "kommer snart" på kortet. Med forpremiere slået til (hold fingeren på versionsnummeret på forsiden)
   kan den åbnes, så Kasper kan se den, før Agnes kan. */
const KEY_FORP = 'glimmerstudiet.forpremiere';
const Koncert = (() => {
  const E = '#1A1238', SK = '#F2C8A0', NOSE = '#EFA286';
  const st = (w = 5) => `stroke="${E}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const limb = (d, c, w) => `<path d="${d}" stroke="${E}" stroke-width="${w + 9}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  /* armene samles og tegnes bag skægget og instrumentet; kun hænderne ligger ovenpå og griber */
  let ARME = null;
  /* armen der slår strengene (eller fører buen) ligger foran instrumentet */
  const armF = (sx, sy, hx, hy, c, b = 0) => limb(`M ${sx} ${sy} Q ${(sx + hx) / 2 + b} ${(sy + hy) / 2 + 14} ${hx} ${hy}`, c, 22);
  const arm = (sx, sy, hx, hy, c, b = 0) => { const a = limb(`M ${sx} ${sy} Q ${(sx + hx) / 2 + b} ${(sy + hy) / 2 + 14} ${hx} ${hy}`, c, 22); if (ARME){ ARME.push(a); return ''; } return a; };
  const hand = (x, y, c = SK) => `<circle cx="${x}" cy="${y}" r="12.5" fill="${c}" ${st(4.5)}/>`;
  /* et punkt L ude ad en hals, der er drejet a grader mod uret fra lodret, med udgangspunkt i x,y */
  const hals0 = (x, y, a, L) => [+(x - Math.sin(a * Math.PI / 180) * L).toFixed(1), +(y - Math.cos(a * Math.PI / 180) * L).toFixed(1)];
  /* en hånd, der griber om en hals: håndfladen og fire små fingre hen over */
  const greb = (x, y, c = SK) => `<circle cx="${x}" cy="${y}" r="12.5" fill="${c}" ${st(4.5)}/>` + [-7, -2, 3, 8].map(d => `<ellipse cx="${x + d * .6 + 3}" cy="${y - 11 + Math.abs(d) * .2}" rx="3.6" ry="5.5" fill="${c}" ${st(2.5)} transform="rotate(-58 ${x} ${y})"/>`).join('');
  const mir = s => `<g transform="scale(-1 1)">${s}</g>`;
  const both = s => s + mir(s);
  const star = (x, y, r, c, w = 3, k = .45) => { let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * k : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${c}" ${w ? st(w) : ''}/>`; };
  const blomst = (x, y, r, c, m = '#FFE45F') => [0, 72, 144, 216, 288].map(a => `<ellipse cx="${x + Math.cos(a * Math.PI / 180) * r * .62}" cy="${y + Math.sin(a * Math.PI / 180) * r * .62}" rx="${r * .5}" ry="${r * .5}" fill="${c}" ${st(2.5)}/>`).join('') + `<circle cx="${x}" cy="${y}" r="${r * .32}" fill="${m}" ${st(2.5)}/>`;
  const svgDoc = (vb, s, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${defs}</defs>${s}</svg>`;

  /* ---------- sangene: én pr. stil ---------- */
  const STIL = {
    hygge:    { navn: 'Hyggeligt', sang: 'Lounge', lys: '#FFE3A0', lys2: '#FFC6E0' },
    rock:     { navn: 'Rock', sang: 'Stop Volden', lys: '#FF3D6E', lys2: '#8A5CFF' },
    country:  { navn: 'Country', sang: 'Hun kom aldrig', lys: '#FFB25A', lys2: '#FFE08A' },
    disko:    { navn: 'Disko', sang: "Gi' mig, gi' mig!", lys: '#FF5FD2', lys2: '#5FE0FF' },
    klassisk: { navn: 'Klassisk', sang: "Pomp's Popo", lys: '#FFF2C8', lys2: '#FFE0A0' },
    hawaii:   { navn: 'Hawaii', sang: 'Frøgt mig ikke!', lys: '#FF9A5A', lys2: '#FF6FA8' },
  };
  const STILE = Object.keys(STIL);

  /* ---------- bandet ---------- */
  const BAND = [
    { id: 'lut', navn: 'Pip', x: 430, y: 778, hue: '#E0457A', kj: '#4FA36B' },
    { id: 'sang', navn: 'Bobo', x: 690, y: 800, hue: '#3E7AB8', kj: '#C9643A' },
    { id: 'trommer', navn: 'Tromle', x: 950, y: 700, hue: '#F2C14E', kj: '#7A4AA8' },
    { id: 'bas', navn: 'Knold', x: 1190, y: 778, hue: '#2E9C8A', kj: '#B5305A' },
  ];
  /* tøjets farver pr. stil og gnom */
  function farver(m, g){
    const i = BAND.indexOf(m);
    if (g === 'rock') return { krop: '#2A2438', krop2: '#1A1626', ben: '#1A1626', hud: '#F6F4FC', hat: '#2A2438' };
    if (g === 'country') return { krop: ['#D8434A', '#3E7AB8', '#D8434A', '#4FA36B'][i], krop2: '#FFF6E8', ben: '#3E5A9A', hud: SK, hat: ['#B9824A', '#7A4A2A', '#E8C48A', '#8A5A3C'][i] };
    if (g === 'disko') return { krop: ['#FFD36E', '#E8E8F4', '#FF8FD0', '#5FE0E0'][i], krop2: '#FFFFFF', ben: ['#FFD36E', '#E8E8F4', '#FF8FD0', '#5FE0E0'][i], hud: SK, hat: ['#7A3AB8', '#E8843A', '#3A2A20', '#E0457A'][i] };
    if (g === 'klassisk') return { krop: '#24203A', krop2: '#FFFFFF', ben: '#24203A', hud: SK, hat: '#F7F4FF' };
    if (g === 'hawaii') return { krop: ['#FF6FA8', '#3EC0C8', '#FFB23E', '#7AD06A'][i], krop2: '#FFF6E8', ben: '#E8C48A', hud: SK, hat: '#E8C48A' };
    return { krop: m.kj, krop2: '#FFF6E8', ben: '#6A4A8A', hud: SK, hat: m.hue };
  }

  /* ---------- en gnom: fødderne i 0,0. f = billede 0 eller 1 (de skiftes i takt) ---------- */
  function gnom(m, g, f){
    const C = farver(m, g), i = BAND.indexOf(m), id = m.id;
    let o = '';
    /* instrumenter bag kroppen og bagerste arm */
    ARME = []; const pose = POSER[id](g, f); const arme = ARME.join(''); ARME = null;
    if (pose.bag) o += pose.bag;
    /* ben og sko */
    o += ben(g, C) + sko(g, C, i);
    /* krop, så armene (bag skæg og instrument) */
    o += krop(g, C, i) + arme;
    o += hals(g, C, i);
    /* hoved */
    o += hoved(g, C, i, id, f);
    /* instrument foran og arme */
    o += pose.for;
    return o;
  }
  function ben(g, C){
    if (g === 'hawaii') return both(limb('M -20 -62 V -16', C.hud, 15)) + skoerte();
    if (g === 'disko') return both(`<path d="M -32 -66 L -10 -66 L -8 -10 L -40 -10 Z" fill="${C.ben}" ${st(4.5)}/>`) + both(`<path d="M -28 -40 l 4 4 M -20 -26 l 4 4" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity=".8"/>`);
    if (g === 'klassisk') return both(limb('M -20 -62 V -40', C.ben, 16) + limb('M -20 -40 V -16', '#FFFFFF', 14));
    return both(limb('M -20 -62 V -16', C.ben, 17));
  }
  function skoerte(){
    let s = '';
    for (let k = -5; k <= 5; k++){ const x = k * 9.5; s += `<path d="M ${x - 6} -86 L ${x + 6} -86 L ${x + 4 + k * .8} -22 L ${x - 4 + k * .8} -22 Z" fill="${k % 2 ? '#9AC85A' : '#B8D86A'}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/>`; }
    return s;
  }
  function sko(g, C, i){
    if (g === 'rock') return both(`<path d="M -38 0 L -38 -10 Q -40 -64 -30 -66 L -10 -66 Q -6 -40 -6 -10 L -6 0 Z" fill="#C8C8DC" ${st(4.5)}/><path d="M -38 -12 H -6" stroke="${E}" stroke-width="4"/><path d="M -33 -50 l 8 -6 l 8 6" fill="none" ${st(3)}/>`);
    if (g === 'country') return both(`<path d="M -44 0 Q -48 -14 -36 -16 L -32 -46 Q -20 -50 -10 -46 L -10 -6 Q -10 0 -16 0 Z" fill="#8A5A3C" ${st(4.5)}/><path d="M -30 -38 q 8 6 16 0" stroke="#E8C48A" stroke-width="3" fill="none"/>` + star(-6, -6, 6, '#FFD36E', 2));
    if (g === 'disko') return both(`<path d="M -44 0 L -42 -14 L -8 -14 L -6 0 Z" fill="#FFD36E" ${st(4)}/><path d="M -42 -14 Q -42 -26 -26 -26 Q -8 -26 -8 -14 Z" fill="#E0457A" ${st(4)}/>`);
    if (g === 'klassisk') return both(`<path d="M -42 0 Q -44 -16 -28 -18 L -12 -18 Q -6 -8 -8 0 Z" fill="#1A1626" ${st(4)}/><rect x="-30" y="-15" width="10" height="7" rx="2" fill="#FFD36E" ${st(2)}/>`);
    if (g === 'hawaii') return both(`<ellipse cx="-24" cy="-6" rx="17" ry="8" fill="${C.hud}" ${st(4)}/><path d="M -38 -2 H -10" stroke="#B9824A" stroke-width="5" stroke-linecap="round"/>` + blomst(-20, -10, 6, '#FF6FA8'));
    /* hyggesko: krummede tæer */
    return both(`<path d="M -20 0 Q -40 2 -46 -8 Q -52 -22 -42 -22 Q -40 -12 -30 -18 L -10 -20 Q -6 -10 -8 0 Z" fill="#7A4A2A" ${st(4.5)}/>`);
  }
  function krop(g, C, i){
    const K = 'M -52 -60 C -64 -120 -42 -172 0 -174 C 42 -172 64 -120 52 -60 Q 0 -46 -52 -60 Z';
    let o = `<path d="${K}" fill="${C.krop}" ${st()}/>`;
    if (g === 'hygge'){
      o += `<path d="M 22 -164 C 44 -140 52 -100 46 -64 Q 54 -64 52 -66 C 60 -110 48 -150 22 -164 Z" fill="#000" opacity=".12"/>`;
      o += `<path d="M -54 -92 Q 0 -80 54 -92" stroke="${E}" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M -53 -92 Q 0 -80 53 -92" stroke="#7A4A2A" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="-11" y="-97" width="22" height="18" rx="4" fill="#F2C14E" ${st(3.5)}/>`;
      if (i === 1) o += `<rect x="18" y="-140" width="20" height="18" rx="3" fill="#E8C48A" ${st(3)}/><path d="M 22 -136 l 12 10 M 34 -136 l -12 10" stroke="${E}" stroke-width="2" opacity=".5"/>`;
      if (i === 3) o += `<circle cx="-26" cy="-130" r="9" fill="#F2C14E" ${st(3)}/>`;
    } else if (g === 'rock'){
      o += `<path d="M -16 -172 L 0 -96 L 16 -172" fill="#3A3450" ${st(4)}/>`;
      o += [[-40, -140], [-46, -110], [40, -140], [46, -110], [-30, -76], [30, -76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#E8E8F4" ${st(2)}/>`).join('');
      o += both(`<path d="M -46 -164 L -74 -186 L -60 -158 L -82 -160 L -56 -146 Z" fill="#C8C8DC" ${st(3.5)}/>`);
      o += `<path d="M -54 -92 Q 0 -80 54 -92" stroke="${E}" stroke-width="13" fill="none"/><path d="M -53 -92 Q 0 -80 53 -92" stroke="#5A5470" stroke-width="7" fill="none"/>` + star(0, -88, 10, '#E8E8F4', 2.5);
    } else if (g === 'country'){
      o = `<defs><pattern id="tern${i}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#FFF6E8"/><rect width="8" height="16" fill="${C.krop}" opacity=".55"/><rect width="16" height="8" fill="${C.krop}" opacity=".55"/></pattern></defs>` + `<path d="${K}" fill="url(#tern${i})" ${st()}/>`;
      o += both(`<path d="M -50 -64 C -60 -116 -44 -160 -14 -170 L -18 -70 Z" fill="#8A5A3C" ${st(4)}/>`);
      o += `<path d="M -54 -92 Q 0 -80 54 -92" stroke="${E}" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M -53 -92 Q 0 -80 53 -92" stroke="#5A3A20" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="-14" y="-98" width="28" height="20" rx="8" fill="#E8C48A" ${st(3.5)}/>`;
      o += star(-34, -126, 11, '#FFD36E', 2.5);
    } else if (g === 'disko'){
      o += [[-30, -140], [20, -150], [36, -110], [-38, -98], [8, -120], [-10, -78], [30, -76]].map(([x, y], k) => star(x, y, 5 + (k % 3), '#FFFFFF', 0)).join('');
      o += both(`<path d="M -6 -172 L -44 -170 L -22 -128 Z" fill="#FFFFFF" ${st(4)}/>`);
      o += `<path d="M -54 -92 Q 0 -80 54 -92" stroke="${E}" stroke-width="13" fill="none"/><path d="M -53 -92 Q 0 -80 53 -92" stroke="#FFFFFF" stroke-width="7" fill="none"/><circle cx="0" cy="-87" r="10" fill="#FFD36E" ${st(3)}/>`;
    } else if (g === 'klassisk'){
      o += `<path d="M -22 -172 L 0 -60 L 22 -172 Z" fill="#FFFFFF" ${st(4)}/>` + [-140, -118, -96].map(y => `<circle cx="0" cy="${y}" r="3.5" fill="${E}"/>`).join('');
      o += both(`<path d="M -50 -70 Q -60 -30 -46 -6 Q -40 -30 -34 -60 Z" fill="${C.krop}" ${st(4)}/>`);
      o += both(`<path d="M -20 -170 L -4 -110" stroke="${E}" stroke-width="3" opacity=".5"/>`);
    } else if (g === 'hawaii'){
      o = `<defs><pattern id="aloha${i}" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="${C.krop}"/>${blomst(12, 12, 9, '#FFF6E8', '#FFE45F').replace(/stroke-width="2.5"/g, 'stroke-width="1.5"')}<path d="M 30 30 q 8 -10 12 4 q -8 8 -12 -4 Z" fill="#3E9A5A"/></pattern></defs>` + `<path d="${K}" fill="url(#aloha${i})" ${st()}/>`;
      o += both(`<path d="M -6 -172 L -30 -164 L -16 -140 Z" fill="${C.krop}" ${st(3.5)}/>`);
    }
    return o;
  }
  function hals(g, C, i){
    if (g === 'country') return `<path d="M -30 -158 Q 0 -138 30 -158 L 14 -130 L 0 -146 L -14 -130 Z" fill="${['#3E7AB8', '#D8434A', '#3E7AB8', '#E8843A'][i]}" ${st(3.5)}/>`;
    if (g === 'klassisk') return `<path d="M 0 -150 L -22 -162 L -22 -138 Z M 0 -150 L 22 -162 L 22 -138 Z" fill="${i === 1 ? '#C8203A' : '#1A1626'}" ${st(3)}/><circle cx="0" cy="-150" r="6" fill="${i === 1 ? '#C8203A' : '#1A1626'}" ${st(3)}/>`;
    if (g === 'hawaii'){ let s = ''; for (let k = 0; k <= 8; k++){ const a = Math.PI * (k / 8), x = -Math.cos(a) * 40, y = -150 + Math.sin(a) * 26; s += blomst(x, y, 9, ['#FF6FA8', '#FFE45F', '#FF8F5A', '#FFFFFF'][(k + i) % 4], '#E0457A'); } return s; }
    return '';
  }
  function hoved(g, C, i, id, f){
    const hy = -198, sang = id === 'sang';
    let o = '';
    /* hår bag hovedet */
    if (g === 'rock') o += `<path d="M -60 -170 L -84 -196 L -62 -204 L -86 -228 L -56 -230 L -66 -258 L 0 -240 L 66 -258 L 56 -230 L 86 -228 L 62 -204 L 84 -196 L 60 -170 Z" fill="#1A1626" ${st(4)}/>`;
    if (g === 'disko') o += `<g>${[[-58, -206, 30], [58, -206, 30], [-46, -244, 32], [46, -244, 32], [0, -262, 36], [-64, -172, 22], [64, -172, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.hat}" ${st(4.5)}/>`).join('')}${[[-58, -206, 27], [58, -206, 27], [-46, -244, 29], [46, -244, 29], [0, -262, 33], [-64, -172, 19], [64, -172, 19]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.hat}"/>`).join('')}</g>`;
    if (g === 'klassisk' && !sang) o += both(`<circle cx="-50" cy="-196" r="16" fill="#F7F4FF" ${st(4)}/><circle cx="-52" cy="-166" r="15" fill="#F7F4FF" ${st(4)}/><path d="M -10 -150 Q 0 -126 14 -142" stroke="#C8203A" stroke-width="0" fill="none"/>`);
    if (g === 'klassisk' && sang) o += both(`<path d="M -44 -200 Q -60 -150 -50 -106 Q -40 -100 -36 -110 Q -44 -150 -30 -196 Z" fill="#FFD36E" ${st(4)}/><path d="M -50 -170 l 10 4 M -48 -146 l 10 4 M -46 -124 l 10 4" stroke="#C99A12" stroke-width="3"/>`);
    /* ører og ansigt */
    o += both(`<ellipse cx="-46" cy="${hy + 4}" rx="10" ry="14" fill="${C.hud}" ${st(4)}/>`);
    if (g === 'hawaii' && i % 2 === 0) o += blomst(-50, hy - 6, 11, '#FF6FA8');
    o += `<circle cx="0" cy="${hy}" r="46" fill="${C.hud}" ${st()}/>`;
    /* ansigtsmaling (rock) */
    if (g === 'rock'){
      if (i === 0) o += star(16, hy - 8, 25, E, 0, .5);
      if (i === 1) o += both(`<path d="M -4 ${hy - 2} Q -16 ${hy - 26} -46 ${hy - 22} Q -34 ${hy - 12} -44 ${hy + 2} Q -30 ${hy - 4} -26 ${hy + 8} Q -18 ${hy - 2} -4 ${hy - 2} Z" fill="${E}"/>`);
      if (i === 2) o += both(`<path d="M -30 ${hy - 24} Q -10 ${hy - 10} -24 ${hy + 8} Q -44 ${hy - 4} -30 ${hy - 24} Z" fill="${E}"/>`);
      if (i === 3) o += both(`<path d="M -16 ${hy - 30} L -9 ${hy - 16} L 4 ${hy - 10} L -9 ${hy - 4} L -16 ${hy + 10} L -23 ${hy - 4} L -40 ${hy - 10} L -23 ${hy - 16} Z" fill="#9AA0C8" ${st(3)}/>`);
    } else o += both(`<ellipse cx="-27" cy="${hy + 10}" rx="9" ry="6" fill="#FF8FB0" opacity=".55"/>`);
    /* øjne */
    if (g === 'disko'){
      o += `<path d="M -42 ${hy - 14} H 42" stroke="${E}" stroke-width="5"/>` + star(-19, hy - 12, 17, ['#FF5FD2', '#5FE0FF', '#FFD36E', '#FF8F5A'][i], 3.5, .55) + star(19, hy - 12, 17, ['#FF5FD2', '#5FE0FF', '#FFD36E', '#FF8F5A'][i], 3.5, .55);
    } else if (g === 'klassisk' && !sang || (g === 'hygge' && f === 1 && !sang)){
      o += both(`<path d="M -24 ${hy - 10} Q -16 ${hy - 18} -8 ${hy - 10}" fill="none" ${st(4.5)}/>`);
    } else {
      const ey = hy - 10;
      o += both(`<ellipse cx="-16" cy="${ey}" rx="6.5" ry="8" fill="${g === 'rock' && (i === 0 || i === 1 || i === 2) ? '#FFFFFF' : E}" ${g === 'rock' && i < 3 ? st(3) : ''}/>`);
      if (g === 'rock' && i < 3) o += both(`<circle cx="-16" cy="${ey + 1}" r="3.6" fill="${E}"/>`);
      else o += both(`<circle cx="-14" cy="${ey - 3}" r="2.4" fill="#FFF"/>`);
    }
    /* næse */
    if (g === 'rock' && i === 2) o += `<path d="M -10 ${hy + 2} L 10 ${hy + 2} L 0 ${hy + 12} Z" fill="${E}"/>` + both(`<path d="M -16 ${hy + 12} L -40 ${hy + 6} M -16 ${hy + 16} L -40 ${hy + 18}" stroke="${E}" stroke-width="2.5" stroke-linecap="round"/>`);
    else o += `<ellipse cx="0" cy="${hy + 6}" rx="13" ry="11" fill="${g === 'rock' ? '#F0D8E8' : NOSE}" ${st(4)}/><ellipse cx="-4" cy="${hy + 2}" rx="4" ry="3" fill="#FFF" opacity=".6"/>`;
    /* skæg og overskæg */
    const sk = g === 'klassisk' && sang ? '#FFE48A' : '#FFFFFF';
    o += `<path d="M -40 ${hy + 8} C -50 ${hy + 70} -18 ${hy + 96} 0 ${hy + 100} C 18 ${hy + 96} 50 ${hy + 70} 40 ${hy + 8} C 26 ${hy + 30} -26 ${hy + 30} -40 ${hy + 8} Z" fill="${sk}" ${st(4.5)}/>`;
    o += `<path d="M -16 ${hy + 50} q 4 8 0 16 M 14 ${hy + 46} q 4 8 0 16 M 0 ${hy + 70} q 3 6 0 12" stroke="#D8D2E8" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (sang){
      const open = f === 0;
      o += open ? `<ellipse cx="0" cy="${hy + 36}" rx="13" ry="15" fill="${E}"/><path d="M -7 ${hy + 44} Q 0 ${hy + 52} 7 ${hy + 44} Q 0 ${hy + 40} -7 ${hy + 44} Z" fill="#FF7A9A"/>`
        : `<ellipse cx="0" cy="${hy + 34}" rx="8" ry="8" fill="${E}"/>`;
      if (g === 'rock' && open) o += `<path d="M -8 ${hy + 44} Q -10 ${hy + 74} 0 ${hy + 76} Q 10 ${hy + 74} 8 ${hy + 44} Z" fill="#FF6F9A" ${st(3.5)}/>`;
    }
    o += both(`<path d="M 0 ${hy + 18} C -8 ${hy + 12} -22 ${hy + 12} -30 ${hy + 24} C -22 ${hy + 32} -8 ${hy + 30} 0 ${hy + 22} Z" fill="${sk}" ${st(4)}/>`);
    /* hat */
    o += hat(g, C, i, sang, hy);
    return o;
  }
  function spidshue(c, band, hy, tip = 12, h = 150){
    return `<path d="M -54 ${hy - 22} Q -30 ${hy - h * .55} ${tip} ${hy - h} Q 30 ${hy - h * .55} 54 ${hy - 22} Q 0 ${hy - 38} -54 ${hy - 22} Z" fill="${c}" ${st()}/>`
      + `<path d="M -32 ${hy - 50} Q -16 ${hy - h * .6} ${tip - 4} ${hy - h + 18}" stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".28"/>`
      + `<path d="M -56 ${hy - 22} Q 0 ${hy - 40} 56 ${hy - 22}" stroke="${E}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M -55 ${hy - 22} Q 0 ${hy - 40} 55 ${hy - 22}" stroke="${band}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  }
  function hat(g, C, i, sang, hy){
    const tip = [14, -10, 18, -14][i];
    if (g === 'hygge') return spidshue(C.hat, '#FFF6E8', hy, tip) + `<circle cx="${tip}" cy="${hy - 150}" r="9" fill="#FFF6D0" ${st(3.5)}/>`;
    if (g === 'rock') return spidshue('#2A2438', '#C8C8DC', hy, tip, 140) + `<path d="M ${tip * .3 - 10} ${hy - 110} l 14 -2 l -8 18 l 14 -2 l -22 26 l 6 -20 l -12 2 Z" fill="#FFD36E" ${st(2.5)}/>` + [-36, -12, 12, 36].map(x => `<circle cx="${x}" cy="${hy - 28}" r="3.5" fill="#FFF"/>`).join('');
    if (g === 'country'){
      return `<ellipse cx="0" cy="${hy - 30}" rx="86" ry="18" fill="${C.hat}" ${st()}/>`
        + `<path d="M -44 ${hy - 34} Q -50 ${hy - 96} -20 ${hy - 100} Q 0 ${hy - 86} 20 ${hy - 100} Q 50 ${hy - 96} 44 ${hy - 34} Q 0 ${hy - 26} -44 ${hy - 34} Z" fill="${C.hat}" ${st()}/>`
        + `<path d="M -45 ${hy - 46} Q 0 ${hy - 36} 45 ${hy - 46}" stroke="${E}" stroke-width="12" fill="none"/><path d="M -44 ${hy - 46} Q 0 ${hy - 36} 44 ${hy - 46}" stroke="#5A3A20" stroke-width="6" fill="none"/>`
        + `<path d="M -86 ${hy - 30} Q -92 ${hy - 46} -76 ${hy - 50} M 86 ${hy - 30} Q 92 ${hy - 46} 76 ${hy - 50}" stroke="${E}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    if (g === 'disko') return `<g transform="translate(0 -58) scale(.8)" transform-origin="0 ${hy}">${spidshue(['#FFD36E', '#E8E8F4', '#FF8FD0', '#5FE0E0'][i], '#FFFFFF', hy, tip * .5, 110)}</g>` + star(tip * .4, hy - 58 - 88, 9, '#FFF', 2.5);
    if (g === 'klassisk'){
      if (sang) return `<path d="M -50 ${hy - 14} Q -54 ${hy - 76} 0 ${hy - 80} Q 54 ${hy - 76} 50 ${hy - 14} Q 0 ${hy - 28} -50 ${hy - 14} Z" fill="#C8C8DC" ${st()}/><path d="M -50 ${hy - 20} Q 0 ${hy - 34} 50 ${hy - 20}" stroke="#FFD36E" stroke-width="9" fill="none"/>`
        + both(`<path d="M -46 ${hy - 50} Q -86 ${hy - 70} -84 ${hy - 120} Q -66 ${hy - 86} -40 ${hy - 70} Z" fill="#FFF6E8" ${st(4.5)}/>`);
      return [[-34, -60], [0, -68], [34, -60], [-48, -34], [48, -34]].map(([x, y]) => `<circle cx="${x}" cy="${hy + y + 20}" r="17" fill="#F7F4FF" ${st(4)}/>`).join('')
        + [[-34, -60], [0, -68], [34, -60]].map(([x, y]) => `<path d="M ${x - 7} ${hy + y + 18} q 7 -8 14 0" stroke="#D8D2E8" stroke-width="3" fill="none"/>`).join('')
        + `<path d="M -10 ${hy - 4} L -24 ${hy + 14} M 10 ${hy - 4} L 24 ${hy + 14}" stroke="#1A1626" stroke-width="0"/>`;
    }
    if (g === 'hawaii') return spidshue('#E8C48A', '#E0457A', hy, tip) + `<path d="M -40 ${hy - 60} Q ${tip / 2} ${hy - 70} 38 ${hy - 62} M -24 ${hy - 96} Q ${tip / 2} ${hy - 104} 24 ${hy - 98}" stroke="#B9824A" stroke-width="3" fill="none"/>` + blomst(30, hy - 36, 14, '#FF6FA8');
    return '';
  }

  /* ---------- instrumenterne og hvordan armene holder dem ---------- */
  function guitar(g, f){
    if (g === 'klassisk'){   /* violin under hagen på venstre skulder, buen går frem og tilbage */
      const hx = f ? -6 : 24, hy = f ? -132 : -118;
      const vio = `<g transform="translate(-48 -150) rotate(-62)"><path d="M 0 -40 C 22 -40 22 -18 12 -10 C 24 0 24 34 0 34 C -24 34 -24 0 -12 -10 C -22 -18 -22 -40 0 -40 Z" fill="#B8641E" ${st(4)}/><path d="M -8 -2 q 4 6 0 12 M 8 -2 q -4 6 0 12" stroke="${E}" stroke-width="2.5" fill="none"/><rect x="-5" y="-10" width="10" height="34" rx="3" fill="#3A2008"/><rect x="-4" y="-104" width="8" height="66" fill="#3A2008" ${st(3)}/><circle cx="0" cy="-108" r="7" fill="#8A4A1E" ${st(3)}/><path d="M -1.5 -100 V 20 M 1.5 -100 V 20" stroke="#E8E8F4" stroke-width="1"/></g>`;
      const [nx, ny] = hals0(-48, -150, 62, 84);
      const bue = `<path d="M ${hx + 22} ${hy + 8} L ${hx - 128} ${hy - 50}" stroke="${E}" stroke-width="7" stroke-linecap="round"/><path d="M ${hx + 22} ${hy + 8} L ${hx - 128} ${hy - 50}" stroke="#E8D8B8" stroke-width="3" stroke-linecap="round"/>`;
      return { bag: '', for: vio + arm(-36, -146, nx, ny, '#24203A', 18) + greb(nx, ny) + bue + armF(36, -146, hx, hy, '#24203A', 22) + hand(hx, hy) };
    }
    const sh = g === 'banjo' ? 0 : 0;
    let inst;
    if (g === 'rock') inst = `<g transform="translate(18 -96) rotate(-58)">${star(0, 0, 50, '#D8434A', 5, .55)}<circle r="10" fill="${E}"/><rect x="-6" y="-130" width="12" height="86" fill="#1A1626" ${st(3)}/><path d="M -12 -140 L 12 -140 L 8 -124 L -8 -124 Z" fill="#D8434A" ${st(3)}/><path d="M -3 -120 V 10 M 3 -120 V 10" stroke="#E8E8F4" stroke-width="1.5"/><path d="M -12 -20 l 8 -14 l -2 10 l 8 -2 l -10 16 Z" fill="#FFD36E"/></g>`;
    else if (g === 'country') inst = `<g transform="translate(18 -96) rotate(-58)"><circle r="40" fill="#F7F4FF" ${st(5)}/><circle r="40" fill="none" stroke="#B9824A" stroke-width="7"/><circle r="40" fill="none" ${st(3)}/><rect x="-6" y="-150" width="12" height="112" fill="#8A5A3C" ${st(3)}/><rect x="-10" y="-160" width="20" height="14" rx="4" fill="#5A3A20" ${st(3)}/><path d="M -3 -146 V 30 M 3 -146 V 30" stroke="#C8C8DC" stroke-width="1.5"/></g>`;
    else if (g === 'disko') inst = `<g transform="translate(18 -96) rotate(-58)"><path d="M -10 -40 C -40 -50 -46 -10 -30 6 C -46 30 -20 52 0 40 C 20 52 46 30 30 6 C 46 -10 40 -50 10 -40 Z" fill="#FF8FD0" ${st(5)}/>${[[-20, 10], [18, 22], [-8, 30], [22, -16]].map(([x, y]) => star(x, y, 5, '#FFF', 0)).join('')}<rect x="-6" y="-130" width="12" height="94" fill="#F7F4FF" ${st(3)}/><rect x="-11" y="-142" width="22" height="16" rx="4" fill="#FF8FD0" ${st(3)}/></g>`;
    else if (g === 'hawaii') inst = `<g transform="translate(14 -104) rotate(-58)"><path d="M 0 -26 C 18 -26 20 -10 12 -4 C 24 4 24 30 0 30 C -24 30 -24 4 -12 -4 C -20 -10 -18 -26 0 -26 Z" fill="#E8A040" ${st(4.5)}/><circle cx="0" cy="4" r="7" fill="${E}"/><rect x="-5" y="-84" width="10" height="60" fill="#8A5A3C" ${st(3)}/>${blomst(10, 18, 7, '#FF6FA8')}</g>`;
    else inst = `<g transform="translate(18 -96) rotate(-58)"><path d="M 0 -50 C 34 -50 40 -6 34 16 C 28 40 12 50 0 50 C -12 50 -28 40 -34 16 C -40 -6 -34 -50 0 -50 Z" fill="#D88A3A" ${st(5)}/><path d="M 20 -40 C 32 -20 32 20 18 40" stroke="#B8641E" stroke-width="6" fill="none" opacity=".6"/><circle cx="0" cy="-6" r="12" fill="${E}"/><circle cx="0" cy="-6" r="16" fill="none" stroke="#F2C14E" stroke-width="3"/><rect x="-6" y="-126" width="12" height="80" fill="#8A5A3C" ${st(3)}/><path d="M -8 -126 L -18 -146 L 8 -146 L 8 -126 Z" fill="#7A4A2A" ${st(3)}/><rect x="-12" y="22" width="24" height="7" rx="2" fill="#5A3A20"/></g>`;
    const ry = f ? -78 : -100, rx = f ? 30 : 20;
    const sleeve = farverG(g);
    /* gribehånden om halsen: et punkt på halsen, regnet ud fra instrumentets drejning */
    const [nx, ny] = g === 'hawaii' ? hals0(14, -104, 58, 64) : hals0(18, -96, 58, { rock: 104, country: 116, disko: 104 }[g] || 100);
    return { bag: '', for: inst + arm(-36, -146, nx, ny, sleeve, 14) + greb(nx, ny) + armF(36, -146, rx, ry, sleeve, 18) + hand(rx, ry) };
  }
  /* ærmernes farve: samme som kroppen (sættes pr. gnom i poseFor) */
  let SLEEVE = '#4FA36B';
  const farverG = () => SLEEVE;
  function sanger(g, f){
    const mic = `<rect x="22" y="-196" width="16" height="30" rx="7" fill="#C8C8DC" ${st(3.5)}/><path d="M 24 -186 h 12 M 24 -178 h 12" stroke="${E}" stroke-width="2"/><rect x="26" y="-168" width="8" height="26" rx="3" fill="#3A3450" ${st(3)}/>`;
    const sl = SLEEVE;
    if (g === 'klassisk'){   /* opera: armene ud til siden */
      const ly = f ? -230 : -196;
      return { bag: '', for: arm(36, -150, 40, -152, sl, 8) + mic + hand(30, -150) + arm(-36, -150, -96, ly, sl, -10) + `<circle cx="-98" cy="${ly}" r="12.5" fill="${SK}" ${st(4.5)}/>` };
    }
    const lx = f ? -84 : -70, ly = f ? -238 : -212;
    let venstre;
    if (g === 'rock') venstre = `<g transform="translate(${lx} ${ly})"><circle r="12.5" fill="${SK}" ${st(4.5)}/><path d="M -6 -8 L -9 -30 M 7 -8 L 10 -30" stroke="${E}" stroke-width="11" stroke-linecap="round"/><path d="M -6 -8 L -9 -30 M 7 -8 L 10 -30" stroke="${SK}" stroke-width="5" stroke-linecap="round"/></g>`;
    else if (g === 'disko') venstre = `<g transform="translate(${lx} ${ly})"><circle r="12.5" fill="${SK}" ${st(4.5)}/><path d="M 0 -8 L 2 -32" stroke="${E}" stroke-width="11" stroke-linecap="round"/><path d="M 0 -8 L 2 -32" stroke="${SK}" stroke-width="5" stroke-linecap="round"/></g>`;
    else if (g === 'hawaii') venstre = `<g transform="translate(${lx} ${ly})"><ellipse cx="0" cy="-26" rx="16" ry="20" fill="#E8843A" ${st(4)}/><path d="M -8 -34 l 4 4 M 6 -24 l 4 4 M -6 -16 l 4 4" stroke="#FFE45F" stroke-width="3"/><rect x="-4" y="-8" width="8" height="14" fill="#8A5A3C" ${st(3)}/>${hand(0, 4)}</g>`;
    else if (g === 'country') venstre = `<g transform="translate(${lx} ${ly})">${hand(0, 0)}<path d="M -10 -18 Q 0 -32 10 -18 Z" fill="#B9824A" opacity="0"/></g>`;
    else venstre = hand(lx, ly);
    return { bag: '', for: arm(-36, -150, lx, ly + 6, sl, -14) + venstre + arm(36, -150, 26, -150, sl, 14) + mic + hand(28, -152) };
  }
  function trommeslager(g, f){
    const sl = SLEEVE, a = f ? -138 : -112, b = f ? -110 : -140;
    const stik = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-4" y="-56" width="8" height="62" rx="4" fill="${g === 'disko' ? '#FF8FD0' : g === 'rock' ? '#E8E8F4' : '#E8C48A'}" ${st(3)}/><circle cy="-56" r="6" fill="${g === 'klassisk' ? '#F7F4FF' : '#E8C48A'}" ${st(3)}/></g>`;
    return { bag: '', for: arm(-36, -146, -70, a, sl, -18) + stik(-70, a, f ? -60 : -30) + hand(-70, a) + arm(36, -146, 70, b, sl, 18) + stik(70, b, f ? 30 : 60) + hand(70, b) };
  }
  function bassist(g, f){
    const sl = SLEEVE;
    if (g === 'rock' || g === 'disko'){   /* elbas om halsen som en guitar */
      const k = g === 'rock' ? '#1A1626' : '#C8C8DC', k2 = g === 'rock' ? '#7A3AB8' : '#FFFFFF';
      const inst = `<g transform="translate(16 -94) rotate(-58)"><path d="M -38 -30 L 0 50 L 38 -30 L 18 -30 L 0 10 L -18 -30 Z" fill="${k}" ${st(5)}/><path d="M -28 -26 L 0 34 L 28 -26" stroke="${k2}" stroke-width="4" fill="none"/><rect x="-6" y="-150" width="12" height="160" fill="#3A3450" ${st(3)}/><rect x="-11" y="-164" width="22" height="18" rx="4" fill="${k}" ${st(3)}/></g>`;
      const ry = f ? -78 : -98, [nx, ny] = hals0(16, -94, 58, 112);
      return { bag: '', for: inst + arm(-36, -146, nx, ny, sl, 14) + greb(nx, ny) + armF(36, -146, 24, ry, sl, 18) + hand(24, ry) };
    }
    /* kontrabas: står ved siden af, større end gnomen */
    const pyn = g === 'hawaii' ? blomst(-60, -170, 12, '#FF6FA8') + blomst(-36, -40, 10, '#FFE45F') : '';
    const inst = `<g><path d="M -54 -228 C -18 -228 -10 -190 -22 -166 C 10 -150 14 -60 -10 -20 C -24 0 -84 0 -98 -20 C -122 -60 -118 -150 -86 -166 C -98 -190 -90 -228 -54 -228 Z" fill="${g === 'klassisk' ? '#8A3A1E' : '#B8641E'}" ${st(5)}/>`
      + `<path d="M -66 -110 q -6 18 0 36 M -42 -110 q 6 18 0 36" stroke="${E}" stroke-width="4" fill="none"/><rect x="-74" y="-40" width="40" height="8" rx="3" fill="#3A2008"/>`
      + `<rect x="-60" y="-352" width="12" height="190" fill="#3A2008" ${st(3)}/><path d="M -54 -350 C -40 -350 -40 -374 -54 -372 C -64 -370 -60 -360 -54 -362" fill="#3A2008" ${st(3)}/>`
      + `<path d="M -56 -340 V -36 M -52 -340 V -36" stroke="#E8E8F4" stroke-width="1.4"/><path d="M -54 0 V 8" ${st(5)}/>${pyn}</g>`;
    const rx = f ? -30 : -40, ry = f ? -96 : -110;
    return { bag: '', for: inst + arm(-36, -146, -58, -236, sl, -20) + greb(-54, -236) + armF(36, -146, rx, ry, sl, 30) + hand(rx, ry) };
  }
  const POSER = { lut: guitar, sang: sanger, trommer: trommeslager, bas: bassist };
  function gnomSvg(m, g, f){
    const C = farver(m, g); SLEEVE = C.krop;
    if (g === 'hawaii') SLEEVE = C.krop; if (g === 'klassisk') SLEEVE = '#24203A';
    const vb = m.id === 'bas' ? '-200 -400 360 410' : '-150 -390 300 400';
    return svgDoc(vb, gnom(m, g, f));
  }

  /* ---------- trommesættet (står foran trommeslageren og bliver på scenen) ---------- */
  function trommer(g){
    let o = '';
    const logo = {
      hygge: `<path d="M -24 -60 Q 0 -96 24 -60 Z" fill="#E0457A" ${st(3)}/><rect x="-8" y="-60" width="16" height="22" rx="4" fill="#FFF6E8" ${st(3)}/><circle cx="-10" cy="-74" r="4" fill="#FFF"/><circle cx="8" cy="-80" r="3" fill="#FFF"/>`,
      rock: `<path d="M -12 -100 L 14 -104 L 0 -70 L 18 -72 L -16 -24 L -4 -60 L -20 -58 Z" fill="#FFD36E" ${st(3)}/>`,
      country: `<path d="M -26 -40 Q -30 -94 0 -94 Q 30 -94 26 -40 L 14 -40 Q 18 -80 0 -80 Q -18 -80 -14 -40 Z" fill="#C8C8DC" ${st(3)}/>`,
      disko: star(0, -62, 30, '#FFD36E', 3),
      hawaii: blomst(0, -62, 30, '#FF6FA8'),
    }[g];
    if (g === 'klassisk'){   /* pauker af kobber */
      for (const x of [-78, 78]) o += `<path d="M ${x - 64} -110 Q ${x - 60} -20 ${x} -16 Q ${x + 60} -20 ${x + 64} -110 Z" fill="#D88A3A" ${st(5)}/><path d="M ${x - 40} -96 Q ${x - 36} -40 ${x} -34" stroke="#FFD08A" stroke-width="7" fill="none" opacity=".6"/><ellipse cx="${x}" cy="-110" rx="66" ry="16" fill="#F4EAD8" ${st(5)}/>`
        + `<path d="M ${x - 30} -18 L ${x - 44} 0 M ${x + 30} -18 L ${x + 44} 0 M ${x} -16 V 0" ${st(6)}/>`;
      return svgDoc('-170 -210 340 220', o);
    }
    const kar = { hygge: '#D88A3A', rock: '#1A1626', country: '#8A5A3C', disko: '#E8E8F4', hawaii: '#7A4A2A' }[g], kar2 = { hygge: '#B8641E', rock: '#D8434A', country: '#5A3A20', disko: '#FF8FD0', hawaii: '#E8C48A' }[g];
    /* bækken og hi-hat på stativer */
    o += `<path d="M 112 -6 L 112 -150 M 100 0 L 112 -40 L 124 0" ${st(5)} fill="none"/><ellipse cx="112" cy="-154" rx="44" ry="9" fill="#F2C14E" ${st(4)} transform="rotate(-12 112 -154)"/>`;
    o += `<path d="M -124 -6 L -124 -124 M -136 0 L -124 -40 L -112 0" ${st(5)} fill="none"/><ellipse cx="-124" cy="-128" rx="34" ry="7" fill="#F2C14E" ${st(4)}/><ellipse cx="-124" cy="-136" rx="34" ry="7" fill="#F2C14E" ${st(4)}/>`;
    if (g === 'hawaii'){   /* en stor tikitromme og to bongotrommer */
      o += `<path d="M -50 -120 L 50 -120 L 40 0 L -40 0 Z" fill="#8A5A3C" ${st(5)}/><ellipse cx="0" cy="-120" rx="50" ry="12" fill="#F4EAD8" ${st(5)}/>`
        + `<rect x="-24" y="-96" width="48" height="74" rx="8" fill="#5A3A20" ${st(3)}/><path d="M -16 -80 h 10 M 6 -80 h 10" ${st(5)}/><path d="M -12 -50 Q 0 -40 12 -50 Q 0 -34 -12 -50 Z" fill="#FFF6E8" ${st(3)}/>`
        + [-92, 92].map(x => `<path d="M ${x - 26} -96 L ${x + 26} -96 L ${x + 18} -40 L ${x - 18} -40 Z" fill="#E8A040" ${st(4.5)}/><ellipse cx="${x}" cy="-96" rx="26" ry="7" fill="#F4EAD8" ${st(4)}/><path d="M ${x - 10} -40 V 0 M ${x + 10} -40 V 0" ${st(5)}/>`).join('')
        + blomst(-40, -10, 10, '#FF6FA8') + blomst(46, -14, 9, '#FFE45F');
      return svgDoc('-170 -210 340 220', o);
    }
    /* lilletromme og tam-tam */
    o += `<path d="M -110 -84 L -110 -10 M -122 0 L -110 -30 L -98 0" ${st(5)} fill="none"/><path d="M -146 -100 L -74 -100 L -74 -76 L -146 -76 Z" fill="${kar}" ${st(4.5)}/><ellipse cx="-110" cy="-100" rx="36" ry="9" fill="#F4EAD8" ${st(4)}/>`;
    o += `<path d="M 50 -150 L 110 -150 L 110 -116 L 50 -116 Z" fill="${kar}" ${st(4.5)}/><ellipse cx="80" cy="-150" rx="30" ry="8" fill="#F4EAD8" ${st(4)}/>`;
    /* stortrommen med bandets logo */
    o += `<circle cx="0" cy="-64" r="66" fill="${kar}" ${st(5)}/><circle cx="0" cy="-64" r="54" fill="#FFF6E8" ${st(4)}/><circle cx="0" cy="-64" r="54" fill="none" stroke="${kar2}" stroke-width="5" opacity=".6"/>`;
    o += [0, 60, 120, 180, 240, 300].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 60).toFixed(1)}" cy="${(-64 + Math.sin(a * Math.PI / 180) * 60).toFixed(1)}" r="4" fill="#E8E8F4" ${st(2)}/>`).join('');
    o += `<g transform="translate(0 0)">${logo}</g>`;
    if (g === 'disko') o += [[-40, -100], [44, -30], [-46, -22], [36, -108]].map(([x, y]) => star(x, y, 5, '#FFF', 0)).join('');
    return svgDoc('-170 -210 340 220', o);
  }

  /* ---------- baggrunden bag bandet: væggen, scenetæppet bagerst og gulvet ---------- */
  const AX = 210, AY = 150, AW = 1180;   // åbningen i den forgyldte bue
  function bag(g){
    let o = '', d = '';
    /* scenegulvet: brædder i perspektiv */
    const gulvF = { hygge: '#9A6238', rock: '#2A2438', country: '#B98A52', disko: null, klassisk: '#5A2E18', hawaii: '#E8D0A0' }[g];
    let gulv = '';
    if (g === 'disko'){
      const F = ['#FF5FD2', '#5FE0FF', '#FFE45F', '#8A5CFF', '#7AE06A'];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++){ const y0 = 640 + r * 42, y1 = y0 + 42, k0 = (y0 - 640) / 170, k1 = (y1 - 640) / 170, x = c / 12, w = 1 / 12;
        const X = (k, x) => 300 - 120 * k + (1000 + 240 * k) * x;
        gulv += `<path d="M ${X(k0, x)} ${y0} L ${X(k0, x + w)} ${y0} L ${X(k1, x + w)} ${y1} L ${X(k1, x)} ${y1} Z" fill="${F[(r * 3 + c) % 5]}" stroke="#2A1A4A" stroke-width="4" opacity=".92"/>`; }
    } else {
      gulv = `<path d="M 300 640 L 1300 640 L 1420 820 L 180 820 Z" fill="${gulvF}"/>`;
      for (let k = 1; k < 4; k++){ const y = 640 + k * 45; gulv += `<path d="M ${300 - 120 * (y - 640) / 180} ${y} H ${1300 + 120 * (y - 640) / 180}" stroke="#000" stroke-width="3" opacity=".22"/>`; }
      for (let k = 0; k <= 14; k++){ const x0 = 300 + k * 1000 / 14, x1 = 180 + k * 1240 / 14; gulv += `<path d="M ${x0} 640 L ${x1} 820" stroke="#000" stroke-width="2.5" opacity=".18"/>`; }
      if (g === 'klassisk') gulv += `<path d="M 300 640 L 1300 640 L 1420 820 L 180 820 Z" fill="url(#glans)" opacity=".5"/>`;
      if (g === 'hawaii') for (let k = 0; k < 30; k++) gulv += `<path d="M ${200 + (k * 397) % 1200} ${650 + (k * 53) % 160} l 18 0" stroke="#C8A870" stroke-width="3" stroke-linecap="round"/>`;
    }
    /* bagtæppet: et malet landskab pr. stil */
    let bt = '';
    if (g === 'hygge'){
      d += `<linearGradient id="him" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A6A"/><stop offset="1" stop-color="#5A4AA8"/></linearGradient>`;
      bt += `<rect x="0" y="0" width="1600" height="660" fill="url(#him)"/>`;
      bt += [[380, 240], [520, 190], [700, 260], [1060, 210], [1200, 280], [940, 180], [610, 330], [1280, 200]].map(([x, y], k) => star(x, y, 6 + k % 3 * 2, '#FFF6D0', 0)).join('');
      bt += `<circle cx="1120" cy="300" r="62" fill="#FFF3C0"/><circle cx="1096" cy="284" r="12" fill="#F2DE9A"/><circle cx="1140" cy="322" r="8" fill="#F2DE9A"/>`;
      bt += `<path d="M 200 560 Q 420 430 640 520 Q 860 420 1080 510 Q 1260 440 1400 520 V 660 H 200 Z" fill="#3E7A5A"/><path d="M 200 600 Q 500 520 800 590 Q 1100 520 1400 590 V 660 H 200 Z" fill="#2E6A4A"/>`;
      const svamp = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-14" y="-40" width="28" height="44" rx="10" fill="#FFF6E8" ${st(4)}/><path d="M -46 -36 Q -40 -86 0 -88 Q 40 -86 46 -36 Q 0 -26 -46 -36 Z" fill="${c}" ${st(4)}/><circle cx="-16" cy="-60" r="7" fill="#FFF"/><circle cx="14" cy="-66" r="5" fill="#FFF"/><rect x="-6" y="-24" width="12" height="16" rx="5" fill="#FFD36E" ${st(3)}/></g>`;
      bt += svamp(330, 590, 1, '#E0457A') + svamp(1270, 600, 1.15, '#E8843A') + svamp(470, 610, .7, '#8A5CFF') + svamp(1150, 620, .6, '#E0457A');
      /* lyskæde */
      bt += `<path d="M 220 200 Q 500 290 800 210 Q 1100 290 1380 200" stroke="#2A1A3A" stroke-width="3" fill="none"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(k => { const t = k / 12, x = 220 + t * 1160, y = 200 + Math.sin(t * Math.PI * 2) * -2 + (t < .5 ? Math.sin(t * 2 * Math.PI) * 60 : Math.sin((t - .5) * 2 * Math.PI) * 60); return `<circle cx="${x}" cy="${y + 8}" r="9" fill="${['#FFE45F', '#FF8FD0', '#5FE0FF', '#9BE36A'][k % 4]}"/><circle cx="${x}" cy="${y + 8}" r="20" fill="${['#FFE45F', '#FF8FD0', '#5FE0FF', '#9BE36A'][k % 4]}" opacity=".18"/>`; }).join('');
    } else if (g === 'rock'){
      d += `<radialGradient id="him" cx=".5" cy=".55" r=".7"><stop offset="0" stop-color="#4A1A5A"/><stop offset="1" stop-color="#140A20"/></radialGradient>`;
      bt += `<rect x="0" y="0" width="1600" height="660" fill="url(#him)"/>`;
      /* højttalertårne */
      for (const x of [250, 1180]) for (let r = 0; r < 3; r++) bt += `<rect x="${x}" y="${410 + r * 76}" width="170" height="72" rx="6" fill="#1A1626" stroke="#5A5470" stroke-width="4"/><circle cx="${x + 50}" cy="${446 + r * 76}" r="24" fill="#2A2438" stroke="#5A5470" stroke-width="4"/><circle cx="${x + 120}" cy="${446 + r * 76}" r="24" fill="#2A2438" stroke="#5A5470" stroke-width="4"/>`;
      /* kæmpe lyn af pærer */
      const lyn = 'M 760 170 L 920 170 L 840 330 L 960 330 L 700 600 L 790 390 L 670 390 Z';
      bt += `<path d="${lyn}" fill="#FFD36E" stroke="#C99A12" stroke-width="10" stroke-linejoin="round"/><path d="${lyn}" fill="none" stroke="#FFF6D0" stroke-width="3" stroke-dasharray="2 26" stroke-linecap="round"/>`;
      bt += `<path d="M 200 660 Q 300 560 380 640 Q 440 540 520 650 M 1080 650 Q 1160 540 1220 640 Q 1300 560 1400 660" fill="#FF6F3A" opacity=".55"/>`;
      bt += [[330, 230], [1240, 250], [560, 300], [1060, 190]].map(([x, y]) => star(x, y, 16, '#FF5FA8', 3)).join('');
    } else if (g === 'country'){
      d += `<linearGradient id="him" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8F5A"/><stop offset=".6" stop-color="#FFC86A"/><stop offset="1" stop-color="#FFE8A8"/></linearGradient>`;
      bt += `<rect x="0" y="0" width="1600" height="660" fill="url(#him)"/><circle cx="800" cy="520" r="120" fill="#FFF0B0" opacity=".85"/>`;
      bt += `<path d="M 200 520 L 330 520 L 350 440 L 470 440 L 490 520 L 900 540 L 1010 450 L 1150 450 L 1180 520 L 1400 520 V 660 H 200 Z" fill="#C8643A"/><path d="M 200 580 Q 600 540 1000 580 Q 1250 600 1400 570 V 660 H 200 Z" fill="#E8A060"/>`;
      const kaktus = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M -14 0 V -120 Q 0 -136 14 -120 V 0 Z M -14 -60 H -40 V -96 Q -32 -106 -24 -96 V -76 H -14 M 14 -50 H 40 V -86 Q 32 -96 24 -86 V -66 H 14" fill="#4FA36B" ${st(4)}/>${blomst(0, -126, 8, '#FF6FA8')}</g>`;
      bt += kaktus(300, 640, 1) + kaktus(1300, 640, .8);
      /* hegn */
      bt += `<path d="M 200 600 H 1400 M 200 630 H 1400" stroke="#7A4A2A" stroke-width="12"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => `<rect x="${220 + k * 145}" y="580" width="16" height="80" fill="#8A5A3C" ${st(3)}/>`).join('');
      /* høballer og vognhjul på gulvet */
      bt += `<g transform="translate(0 0)"></g>`;
      gulv += `<g><rect x="260" y="610" width="140" height="70" rx="12" fill="#F2C14E" ${st(5)}/><path d="M 280 630 h 100 M 280 650 h 100 M 280 668 h 100" stroke="#C99A12" stroke-width="4"/></g>`
        + `<g><circle cx="1330" cy="610" r="56" fill="none" stroke="#8A5A3C" stroke-width="12"/><circle cx="1330" cy="610" r="56" fill="none" ${st(3)}/><circle cx="1330" cy="610" r="12" fill="#8A5A3C" ${st(3)}/>${[0, 45, 90, 135].map(a => `<path d="M ${1330 - Math.cos(a * Math.PI / 180) * 52} ${610 - Math.sin(a * Math.PI / 180) * 52} L ${1330 + Math.cos(a * Math.PI / 180) * 52} ${610 + Math.sin(a * Math.PI / 180) * 52}" stroke="#8A5A3C" stroke-width="7"/>`).join('')}</g>`;
    } else if (g === 'disko'){
      d += `<radialGradient id="him" cx=".5" cy=".6" r=".8"><stop offset="0" stop-color="#7A3AB8"/><stop offset="1" stop-color="#2A0E4A"/></radialGradient>`;
      bt += `<rect x="0" y="0" width="1600" height="660" fill="url(#him)"/>`;
      const F = ['#FF5FD2', '#FF8F5A', '#FFE45F', '#7AE06A', '#5FE0FF', '#8A5CFF'];
      for (let k = 0; k < 18; k++){ const a0 = Math.PI + k * Math.PI / 18, a1 = a0 + Math.PI / 18; bt += `<path d="M 800 640 L ${800 + Math.cos(a0) * 900} ${640 + Math.sin(a0) * 900} L ${800 + Math.cos(a1) * 900} ${640 + Math.sin(a1) * 900} Z" fill="${F[k % 6]}" opacity=".32"/>`; }
      bt += `<circle cx="800" cy="640" r="190" fill="#2A0E4A" opacity=".55"/>`;
      bt += [[330, 230], [1270, 240], [470, 420], [1130, 400], [640, 210], [960, 230]].map(([x, y], k) => star(x, y, 14 + (k % 2) * 6, '#FFFFFF', 0)).join('');
    } else if (g === 'klassisk'){
      d += `<linearGradient id="him" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A1A2A"/><stop offset="1" stop-color="#8A2A3A"/></linearGradient><linearGradient id="ror" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C99A12"/><stop offset=".45" stop-color="#FFE8A0"/><stop offset="1" stop-color="#A87A10"/></linearGradient>`;
      bt += `<rect x="0" y="0" width="1600" height="660" fill="url(#him)"/>`;
      for (let k = 0; k < 15; k++) bt += `<path d="M ${210 + k * 80} 0 V 660" stroke="#000" stroke-width="20" opacity=".08"/>`;
      /* orgelpiber */
      for (let k = -8; k <= 8; k++){ const h = 330 - Math.abs(k) * 22, x = 800 + k * 42, top = 600 - h; bt += `<rect x="${x - 15}" y="${top}" width="30" height="${h}" rx="4" fill="url(#ror)" ${st(4)}/><path d="M ${x - 15} ${top + 40} Q ${x} ${top + 30} ${x + 15} ${top + 40}" fill="${E}" opacity=".8"/>`; }
      bt += `<rect x="440" y="590" width="720" height="70" rx="8" fill="#5A2E18" ${st(5)}/><path d="M 460 610 H 1140" stroke="#C99A12" stroke-width="5"/>`;
      /* nodestativer */
      gulv += [[320, 700], [1290, 700]].map(([x, y]) => `<path d="M ${x} ${y} V ${y - 110} M ${x - 24} ${y} L ${x} ${y - 30} L ${x + 24} ${y}" ${st(5)} fill="none"/><path d="M ${x - 50} ${y - 150} L ${x + 50} ${y - 150} L ${x + 44} ${y - 100} L ${x - 44} ${y - 100} Z" fill="#F7F4FF" ${st(4)}/><path d="M ${x - 36} ${y - 136} H ${x + 36} M ${x - 34} ${y - 124} H ${x + 34} M ${x - 32} ${y - 112} H ${x + 32}" stroke="${E}" stroke-width="2"/>`).join('');
      d += `<linearGradient id="glans" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE0A0" stop-opacity=".0"/><stop offset=".5" stop-color="#FFE0A0" stop-opacity=".5"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></linearGradient>`;
    } else if (g === 'hawaii'){
      d += `<linearGradient id="him" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6FA8"/><stop offset=".55" stop-color="#FF9A5A"/><stop offset="1" stop-color="#FFD36E"/></linearGradient>`;
      bt += `<rect x="0" y="0" width="1600" height="660" fill="url(#him)"/><circle cx="800" cy="500" r="110" fill="#FFE8A0"/>`;
      bt += `<path d="M 200 500 H 1400 V 660 H 200 Z" fill="#3EA8C8"/>` + [520, 545, 575].map((y, k) => `<path d="M ${200 + k * 40} ${y} q 30 -12 60 0 t 60 0 t 60 0" stroke="#BFF0FF" stroke-width="5" fill="none" opacity=".7"/><path d="M ${900 + k * 50} ${y + 6} q 30 -12 60 0 t 60 0" stroke="#BFF0FF" stroke-width="5" fill="none" opacity=".7"/>`).join('');
      bt += `<path d="M 200 590 Q 800 560 1400 590 V 660 H 200 Z" fill="#F2D49A"/>`;
      const palme = (x, y, s, r) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${r})"><path d="M -10 0 Q -20 -150 10 -300 L 26 -296 Q 0 -150 12 0 Z" fill="#B9824A" ${st(4)}/>${[-150, -110, -60, -20, 20].map(a => `<path d="M 18 -298 Q ${18 + Math.cos(a * Math.PI / 180) * 70} ${-298 + Math.sin(a * Math.PI / 180) * 70 - 30} ${18 + Math.cos(a * Math.PI / 180) * 140} ${-298 + Math.sin(a * Math.PI / 180) * 140 + 20} Q ${18 + Math.cos(a * Math.PI / 180) * 70} ${-298 + Math.sin(a * Math.PI / 180) * 70 + 10} 18 -298 Z" fill="#4FA36B" ${st(4)}/>`).join('')}<circle cx="10" cy="-290" r="10" fill="#7A4A2A" ${st(3)}/><circle cx="28" cy="-286" r="10" fill="#7A4A2A" ${st(3)}/></g>`;
      bt += palme(300, 640, 1, -6) + palme(1300, 640, .9, 8);
    }
    /* vægge i siderne af scenen (kulisserne), så bandet kan gå ud bag dem */
    o += `<rect x="0" y="0" width="1600" height="1000" fill="#1A0E1E"/>` + bt + gulv;
    return svgDoc('0 0 1600 1000', o, d);
  }

  /* ---------- forgrunden: den forgyldte bue, sidetæpperne, gaslamperne og kanten af scenen ---------- */
  function forgrund(){
    const d = `<pattern id="dam" width="110" height="130" patternUnits="userSpaceOnUse"><rect width="110" height="130" fill="#4A1424"/><path d="M 55 12 C 70 32 88 38 88 60 C 88 80 68 86 55 102 C 42 86 22 80 22 60 C 22 38 40 32 55 12 Z" fill="#5E1C30"/><circle cx="0" cy="0" r="9" fill="#5E1C30"/><circle cx="110" cy="0" r="9" fill="#5E1C30"/><circle cx="0" cy="130" r="9" fill="#5E1C30"/><circle cx="110" cy="130" r="9" fill="#5E1C30"/></pattern>`
      + `<linearGradient id="guld" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A6420"/><stop offset=".3" stop-color="#F7E2A0"/><stop offset=".55" stop-color="#D9A848"/><stop offset="1" stop-color="#7A5418"/></linearGradient>`
      + `<linearGradient id="guldv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2A0"/><stop offset=".5" stop-color="#D9A848"/><stop offset="1" stop-color="#8A6420"/></linearGradient>`
      + `<linearGradient id="fl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A0E24"/><stop offset=".25" stop-color="#C8203A"/><stop offset=".5" stop-color="#8A1028"/><stop offset=".75" stop-color="#D8304A"/><stop offset="1" stop-color="#7A0E24"/></linearGradient>`
      + `<linearGradient id="tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4224"/><stop offset="1" stop-color="#4A2412"/></linearGradient>`
      + `<radialGradient id="gas" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE8A0" stop-opacity=".9"/><stop offset="1" stop-color="#FFE8A0" stop-opacity="0"/></radialGradient>`;
    let o = '';
    /* væggen rundt om buen (hullet i midten er åbningen ind til scenen) */
    o += `<path d="M ${KLIP[0]} ${KLIP[1]} H ${KLIP[2]} V ${KLIP[3]} H ${KLIP[0]} Z M ${AX} 820 V ${AY + 120} Q ${AX} ${AY} ${AX + 160} ${AY} H ${AX + AW - 160} Q ${AX + AW} ${AY} ${AX + AW} ${AY + 120} V 820 Z" fill="url(#dam)" fill-rule="evenodd"/>`;
    /* sidetæpperne, bundet op med guldsnor */
    for (const s of [1, -1]){
      const x = s > 0 ? AX - 10 : AX + AW + 10, w = 200 * s;
      o += `<path d="M ${x} ${AY - 10} C ${x + w * .95} ${AY + 60} ${x + w * .7} ${AY + 260} ${x + w * .52} 470 C ${x + w * .7} 560 ${x + w * .55} 700 ${x + w * .4} 830 L ${x} 830 Z" fill="url(#fl)" stroke="${E}" stroke-width="5"/>`;
      o += `<path d="M ${x + w * .12} ${AY + 40} C ${x + w * .4} ${AY + 160} ${x + w * .3} 380 ${x + w * .28} 470 M ${x + w * .25} 520 C ${x + w * .3} 620 ${x + w * .22} 740 ${x + w * .18} 830" stroke="#5A0818" stroke-width="10" fill="none" opacity=".55"/>`;
      o += `<path d="M ${x} 452 Q ${x + w * .3} 480 ${x + w * .58} 462" stroke="${E}" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M ${x} 452 Q ${x + w * .3} 480 ${x + w * .58} 462" stroke="#F2C14E" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="${x + w * .58}" cy="466" r="14" fill="#F2C14E" ${st(4)}/><path d="M ${x + w * .58 - 9} 478 L ${x + w * .58 - 12} 520 M ${x + w * .58} 480 V 524 M ${x + w * .58 + 9} 478 L ${x + w * .58 + 12} 520" stroke="#F2C14E" stroke-width="5" stroke-linecap="round"/>`;
    }
    /* den forgyldte bue med nitter og et lille tandhjul i hvert hjørne */
    const bue = `M ${AX} 830 V ${AY + 120} Q ${AX} ${AY} ${AX + 160} ${AY} H ${AX + AW - 160} Q ${AX + AW} ${AY} ${AX + AW} ${AY + 120} V 830`;
    o += `<path d="${bue}" stroke="${E}" stroke-width="54" fill="none"/><path d="${bue}" stroke="url(#guld)" stroke-width="44" fill="none"/><path d="${bue}" stroke="#FFF2C0" stroke-width="4" fill="none" opacity=".6" transform="translate(-10 -6)"/>`;
    for (let k = 0; k < 9; k++) o += `<circle cx="${AX + 240 + k * 90}" cy="${AY - 2}" r="6" fill="#FFF2C0" ${st(2)}/>`;
    for (const y of [330, 480, 630, 780]) o += `<circle cx="${AX}" cy="${y}" r="6" fill="#FFF2C0" ${st(2)}/><circle cx="${AX + AW}" cy="${y}" r="6" fill="#FFF2C0" ${st(2)}/>`;
    const tandhjul = (x, y, r) => { let p = ''; for (let k = 0; k < 16; k++){ const a = k * Math.PI / 8, rr = k % 2 ? r : r * .8; p += (k ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${p}Z" fill="url(#guldv)" ${st(4)}/><circle cx="${x}" cy="${y}" r="${r * .36}" fill="#4A1424" ${st(3)}/>`; };
    o += tandhjul(AX + 30, AY + 30, 40) + tandhjul(AX + AW - 30, AY + 30, 40);
    /* gardinkappen øverst med kvaster */
    let kappe = `M ${AX - 40} 100 H ${AX + AW + 40} V 170`;
    for (let k = 0; k < 8; k++){ const x1 = AX + AW + 40 - (k + 1) * (AW + 80) / 8; kappe += ` Q ${x1 + (AW + 80) / 16} 250 ${x1} 170`; }
    o += `<path d="${kappe} Z" fill="url(#fl)" stroke="${E}" stroke-width="5"/>`;
    for (let k = 1; k < 8; k++){ const x = AX - 40 + k * (AW + 80) / 8; o += `<path d="M ${x} 170 V 196" stroke="#F2C14E" stroke-width="6"/><path d="M ${x - 8} 196 L ${x} 216 L ${x + 8} 196 Z" fill="#F2C14E" ${st(3)}/>`; }
    o += `<path d="M ${AX - 40} 108 H ${AX + AW + 40}" stroke="#F2C14E" stroke-width="8"/>`;
    /* skilt øverst: en lyre i en messingoval */
    o += `<ellipse cx="800" cy="104" rx="92" ry="56" fill="url(#guldv)" ${st(5)}/><ellipse cx="800" cy="104" rx="76" ry="42" fill="#4A1424" ${st(3)}/>`
      + `<path d="M 772 140 Q 752 100 770 72 Q 784 92 786 120 M 828 140 Q 848 100 830 72 Q 816 92 814 120 M 772 140 H 828" stroke="#F2C14E" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M 786 86 V 136 M 800 84 V 136 M 814 86 V 136" stroke="#FFF2C0" stroke-width="2.5"/>`
      + `<path d="M 718 90 l 0 -24 l 14 -4 l 0 22" stroke="#F2C14E" stroke-width="5" fill="none"/><circle cx="713" cy="92" r="7" fill="#F2C14E"/><path d="M 872 98 l 0 -26" stroke="#F2C14E" stroke-width="5"/><circle cx="867" cy="100" r="7" fill="#F2C14E"/>`;
    /* sceneforkanten: træ med messingliste og gaslamper */
    o += `<path d="M 130 820 H 1470 L 1490 872 H 110 Z" fill="url(#tr)" stroke="${E}" stroke-width="5"/><path d="M 130 824 H 1470" stroke="url(#guld)" stroke-width="10"/>`;
    for (let k = 0; k < 7; k++){ const x = 300 + k * 166; o += `<ellipse cx="${x}" cy="812" rx="60" ry="30" fill="url(#gas)"/><path d="M ${x - 28} 830 L ${x - 20} 808 H ${x + 20} L ${x + 28} 830 Z" fill="url(#guldv)" ${st(4)}/><ellipse cx="${x}" cy="806" rx="12" ry="8" fill="#FFF6C8"/>`; }
    o += `<path d="M 110 872 H 1490 V 880 H 110 Z" fill="#140A14"/>`;
    return svgDoc('0 0 1600 1000', o, d);
  }

  /* ---------- tæppet, der går for, når bandet klæder om ---------- */
  function taeppe(side){
    const w = AW / 2 + 40;
    let o = `<path d="M 0 0 H ${w} V 700 Q ${w * .75} 716 ${w * .5} 700 Q ${w * .25} 716 0 700 Z" fill="url(#fl)" stroke="${E}" stroke-width="5"/>`;
    for (let k = 1; k < 7; k++) o += `<path d="M ${k * w / 7} 0 C ${k * w / 7 + 14} 240 ${k * w / 7 - 14} 460 ${k * w / 7} 704" stroke="#5A0818" stroke-width="9" fill="none" opacity=".5"/>`;
    o += `<path d="M 0 696 Q ${w * .25} 712 ${w * .5} 696 Q ${w * .75} 712 ${w} 696" stroke="#F2C14E" stroke-width="10" fill="none"/>`;
    for (let k = 0; k < 14; k++) o += `<path d="M ${10 + k * w / 14} 704 v 20" stroke="#F2C14E" stroke-width="5" stroke-linecap="round"/>`;
    const d = `<linearGradient id="fl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A1028"/><stop offset=".3" stop-color="#C8203A"/><stop offset=".55" stop-color="#9A1830"/><stop offset=".8" stop-color="#D8304A"/><stop offset="1" stop-color="#8A1028"/></linearGradient>`;
    return svgDoc(`0 0 ${w} 730`, side > 0 ? `<g transform="translate(${w} 0) scale(-1 1)">${o}</g>` : o, d);
  }

  /* ---------- publikum: en række hoveder set bagfra ---------- */
  function publikum(){
    let o = '';
    const S = '#2A1A3A', R = '#5A3A7A';
    const hoved = [
      (x, y) => `<path d="M ${x - 40} ${y + 40} Q ${x - 44} ${y - 30} ${x} ${y - 34} Q ${x + 44} ${y - 30} ${x + 40} ${y + 40} Z" fill="${S}"/><path d="M ${x - 36} ${y - 20} L ${x + 4} ${y - 130} L ${x + 36} ${y - 20} Z" fill="${S}"/>`,   // gnom
      (x, y) => `<circle cx="${x}" cy="${y}" r="40" fill="${S}"/><ellipse cx="${x - 16}" cy="${y - 70}" rx="12" ry="40" fill="${S}"/><ellipse cx="${x + 16}" cy="${y - 70}" rx="12" ry="40" fill="${S}"/>`,   // kanin
      (x, y) => `<circle cx="${x}" cy="${y}" r="42" fill="${S}"/><path d="M ${x - 36} ${y - 20} L ${x - 30} ${y - 66} L ${x - 6} ${y - 38} Z M ${x + 36} ${y - 20} L ${x + 30} ${y - 66} L ${x + 6} ${y - 38} Z" fill="${S}"/>`,   // kat
      (x, y) => `<ellipse cx="${x}" cy="${y}" rx="46" ry="36" fill="${S}"/><circle cx="${x - 24}" cy="${y - 30}" r="16" fill="${S}"/><circle cx="${x + 24}" cy="${y - 30}" r="16" fill="${S}"/>`,   // frø
      (x, y) => `<circle cx="${x}" cy="${y}" r="44" fill="${S}"/><path d="M ${x - 30} ${y - 30} L ${x - 40} ${y - 62} L ${x - 12} ${y - 42} Z M ${x + 30} ${y - 30} L ${x + 40} ${y - 62} L ${x + 12} ${y - 42} Z" fill="${S}"/>`,   // ugle
      (x, y) => `<circle cx="${x}" cy="${y}" r="44" fill="${S}"/><path d="M ${x - 50} ${y - 34} Q ${x} ${y - 60} ${x + 50} ${y - 34} Q ${x} ${y - 24} ${x - 50} ${y - 34} Z M ${x - 30} ${y - 40} Q ${x} ${y - 100} ${x + 30} ${y - 40} Z" fill="${S}"/>`,   // heks med hat
    ];
    const pl = [[170, 0], [330, 3], [500, 1], [660, 4], [940, 5], [1100, 2], [1270, 0], [1430, 3]];
    pl.forEach(([x, k], j) => { const y = 960 + (j % 2) * 14; o += hoved[k](x, y); });
    /* svagt lys fra scenen på kanten af hovederne */
    o = `<g>${o}</g><g opacity=".5" transform="translate(0 -4)">${''}</g>`;
    o += `<path d="M 0 1000 H 1600" stroke="${R}" stroke-width="2"/>`;
    return svgDoc('0 0 1600 1000', o);
  }

  /* ---------- salen rundt om scenen: scenen sidder længere væk, og foran den sidder publikum ved små borde ---------- */
  const SAL = { s: .6, x: 320, y: 62 };   /* hvor scenen (1600 x 1000) sidder i salen, og hvor stor */
  const KLIP = [90, 30, 1510, 880];         /* den del af scenebilledet, der vises: buen med lidt væg og scenekanten */
  function salBag(){
    const d = `<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E0E22"/><stop offset="1" stop-color="#3A1A34"/></linearGradient>`
      + `<pattern id="str" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="url(#vg)"/><rect x="0" width="6" height="44" fill="#000" opacity=".12"/><circle cx="22" cy="22" r="4" fill="#5A2A4A" opacity=".5"/></pattern>`
      + `<linearGradient id="trv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A2E18"/><stop offset="1" stop-color="#2A140A"/></linearGradient>`
      + `<linearGradient id="gulv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A1420"/><stop offset="1" stop-color="#6A2232"/></linearGradient>`
      + `<linearGradient id="gld" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A6420"/><stop offset=".4" stop-color="#F7E2A0"/><stop offset="1" stop-color="#8A6420"/></linearGradient>`
      + `<radialGradient id="lg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE0A0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></radialGradient>`;
    let o = `<rect x="-200" y="-200" width="2000" height="1400" fill="url(#str)"/>`;
    /* panel af træ nederst på væggene */
    o += `<path d="M -200 470 H 1800 V 640 H -200 Z" fill="url(#trv)"/><path d="M -200 470 H 1800" stroke="url(#gld)" stroke-width="6"/>`;
    for (let k = 0; k < 12; k++) o += `<rect x="${-180 + k * 170}" y="492" width="130" height="126" rx="6" fill="none" stroke="#1A0A06" stroke-width="4" opacity=".5"/>`;
    /* søjler med gaslamper */
    for (const x of [300, 1300]){ o += `<rect x="${x - 26}" y="0" width="52" height="640" fill="#4A1A2A" stroke="#1A0A10" stroke-width="4"/><rect x="${x - 26}" y="0" width="52" height="640" fill="url(#gld)" opacity=".25"/>`
      + `<circle cx="${x}" cy="300" r="90" fill="url(#lg)"/><path d="M ${x - 14} 310 L ${x - 10} 286 H ${x + 10} L ${x + 14} 310 Z" fill="url(#gld)" stroke="${E}" stroke-width="3"/><ellipse cx="${x}" cy="282" rx="12" ry="16" fill="#FFF0C0" opacity=".9"/>`; }
    /* loger i siderne med publikum */
    for (const [x, sp] of [[150, 1], [1450, -1]]){
      o += `<path d="M ${x - 120} 230 Q ${x} 170 ${x + 120} 230 V 400 H ${x - 120} Z" fill="#1A0812"/>`;
      o += [-70, -10, 50].map((dx, i) => `<circle cx="${x + dx * sp}" cy="${330 - i % 2 * 6}" r="${20 - i * 2}" fill="#0E0610"/><path d="M ${x + dx * sp - 30} 400 Q ${x + dx * sp} ${340 - i % 2 * 6} ${x + dx * sp + 30} 400 Z" fill="#0E0610"/>`).join('');
      o += `<path d="M ${x - 130} 380 Q ${x} 420 ${x + 130} 380 L ${x + 120} 440 Q ${x} 470 ${x - 120} 440 Z" fill="#8A1830" stroke="url(#gld)" stroke-width="7"/>`;
      o += `<path d="M ${x - 132} 228 Q ${x} 160 ${x + 132} 228" stroke="url(#gld)" stroke-width="8" fill="none"/><circle cx="${x}" cy="196" r="10" fill="url(#gld)" stroke="${E}" stroke-width="2"/>`;
    }
    /* lysekroner */
    for (const x of [180, 1420]){ o += `<path d="M ${x} -10 V 40" stroke="#C99A12" stroke-width="4"/><circle cx="${x}" cy="70" r="110" fill="url(#lg)"/><path d="M ${x - 60} 70 Q ${x} 100 ${x + 60} 70" stroke="url(#gld)" stroke-width="7" fill="none"/>`
      + [-60, -30, 0, 30, 60].map(dx => `<rect x="${x + dx - 4}" y="${54 + Math.abs(dx) * .2}" width="8" height="18" fill="#FFF6E8"/><circle cx="${x + dx}" cy="${50 + Math.abs(dx) * .2}" r="5" fill="#FFE08A"/>`).join(''); }
    /* gulvet i salen */
    o += `<path d="M -200 600 H 1800 V 1200 H -200 Z" fill="url(#gulv)"/>`;
    for (let k = 0; k <= 16; k++){ const x0 = 400 + k * 50, x1 = -500 + k * 162; o += `<path d="M ${x0} 600 L ${x1} 1000" stroke="#000" stroke-width="2" opacity=".15"/>`; }
    o += `<ellipse cx="800" cy="640" rx="560" ry="70" fill="#FFB0D0" opacity=".08"/>`;
    return svgDoc('0 0 1600 1000', o, d);
  }
  /* et menneske i silhuet: krop, hoved og en hat eller frisure. stol = sidder med ryggen til os på en stol (ryglænet dækker ryggen forneden) */
  function silhuet(x, y, s, type, c = '#140A16', kant = '#5A3A7A', stol = false){
    let o = `<g transform="translate(${x} ${y}) scale(${s})">`;
    /* kroppen går langt ned, så bordet eller stolen dækker den nederste del */
    o += `<path d="M -46 40 Q -48 -6 -22 -14 Q 0 -20 22 -14 Q 48 -6 46 40 L 50 120 Q 0 132 -50 120 Z" fill="${c}"/>`;
    o += `<circle cx="0" cy="-36" r="24" fill="${c}"/>`;
    const H = {
      gnom: `<path d="M -26 -48 L 4 -118 L 26 -48 Z" fill="${c}"/>`,
      heks: `<path d="M -46 -48 Q 0 -60 46 -48 Q 0 -40 -46 -48 Z M -22 -52 L 14 -116 L 22 -52 Z" fill="${c}"/>`,
      top: `<rect x="-20" y="-104" width="40" height="50" fill="${c}"/><path d="M -32 -54 H 32" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
      /* en dame med bredskygget hat og en stor rose på */
      rose: `<ellipse cx="0" cy="-54" rx="44" ry="9" fill="${c}"/><path d="M -24 -56 Q -22 -82 0 -82 Q 22 -82 24 -56 Z" fill="${c}"/><circle cx="24" cy="-70" r="11" fill="${c}"/><circle cx="24" cy="-70" r="11" fill="none" stroke="${kant}" stroke-width="2.5" opacity=".7"/>`,
      elver: `<path d="M -22 -40 L -44 -64 L -18 -50 Z M 22 -40 L 44 -64 L 18 -50 Z" fill="${c}"/><circle cx="0" cy="-64" r="13" fill="${c}"/>`,
      dvaerg: `<path d="M -28 -42 Q -30 -76 0 -78 Q 30 -76 28 -42 Z" fill="${c}"/><path d="M -24 -60 L -40 -78 M 24 -60 L 40 -78" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`,
      fletning: `<path d="M -22 -30 Q -34 0 -26 20 M 22 -30 Q 34 0 26 20" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`,
      bowler: `<path d="M -22 -50 Q -22 -80 0 -80 Q 22 -80 22 -50 Z" fill="${c}"/><path d="M -30 -50 H 30" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
    };
    o += H[type] || '';
    /* svagt lys fra scenen langs kanten */
    o += `<path d="M -40 -6 Q -22 -14 0 -16 Q 22 -14 40 -6" stroke="${kant}" stroke-width="3" fill="none" opacity=".7"/><path d="M -20 -48 Q 0 -60 20 -48" stroke="${kant}" stroke-width="3" fill="none" opacity=".7"/>`;
    /* stolen: et buet ryglæn med tremmer foran ryggen, og benene ned til gulvet */
    if (stol) o += `<path d="M -50 54 Q 0 40 50 54 L 46 66 Q 0 54 -46 66 Z" fill="#2A1410"/><path d="M -36 62 V 120 M -12 58 V 120 M 12 58 V 120 M 36 62 V 120" stroke="#2A1410" stroke-width="8"/>`
      + `<path d="M -48 120 H 48 V 132 H -48 Z" fill="#2A1410"/><path d="M -44 132 L -48 190 M 44 132 L 48 190" stroke="#2A1410" stroke-width="8" stroke-linecap="round"/>`
      + `<path d="M -50 54 Q 0 40 50 54" stroke="${kant}" stroke-width="2.5" fill="none" opacity=".6"/>`;
    return o + '</g>';
  }
  const TYPER = ['gnom', 'heks', 'top', 'rose', 'elver', 'dvaerg', 'fletning', 'bowler'];
  /* en række borde: hvert bord med en dug helt ned, en lille lampe, to gæster bag bordet og én med ryggen til os */
  function borde(raekke){
    const R = [ { y: 660, s: .55, xs: [150, 420, 1180, 1450] }, { y: 790, s: .8, xs: [240, 600, 1000, 1360] }, { y: 960, s: 1.15, xs: [90, 520, 1080, 1510] } ][raekke];
    let o = '', n = raekke * 7;
    for (const x of R.xs){
      const s = R.s, mork = raekke === 2 ? '#0C060E' : '#140A16';
      /* gæsterne bag bordet: dugen dækker dem forneden */
      for (const dx of [-70, 70]) o += silhuet(x + dx * s, R.y - 50 * s, s, TYPER[(n++) % TYPER.length], mork);
      /* bordet med en lang dug og lampe */
      o += `<path d="M ${x - 92 * s} ${R.y} Q ${x - 96 * s} ${R.y + 70 * s} ${x - 84 * s} ${R.y + 86 * s} Q ${x} ${R.y + 98 * s} ${x + 84 * s} ${R.y + 86 * s} Q ${x + 96 * s} ${R.y + 70 * s} ${x + 92 * s} ${R.y} Z" fill="#4A2A4A"/>`
        + `<path d="M ${x - 60 * s} ${R.y + 20 * s} Q ${x - 62 * s} ${R.y + 60 * s} ${x - 56 * s} ${R.y + 90 * s} M ${x + 20 * s} ${R.y + 24 * s} Q ${x + 22 * s} ${R.y + 64 * s} ${x + 18 * s} ${R.y + 96 * s}" stroke="#2A1430" stroke-width="${4 * s}" fill="none"/>`
        + `<ellipse cx="${x}" cy="${R.y}" rx="${92 * s}" ry="${24 * s}" fill="#C8B4C8" opacity=".6"/>`;
      o += `<circle cx="${x}" cy="${R.y - 30 * s}" r="${70 * s}" fill="url(#lg)"/><rect x="${x - 6 * s}" y="${R.y - 44 * s}" width="${12 * s}" height="${30 * s}" fill="#C99A12"/><path d="M ${x - 18 * s} ${R.y - 40 * s} L ${x - 12 * s} ${R.y - 62 * s} H ${x + 12 * s} L ${x + 18 * s} ${R.y - 40 * s} Z" fill="#FF8F6A"/>`;
      /* den forreste gæst sidder på en stol med ryggen til os */
      o += silhuet(x, R.y + 30 * s, s * 1.05, TYPER[(n++) % TYPER.length], raekke === 2 ? '#0A050C' : '#120814', '#5A3A7A', true);
    }
    const d = `<radialGradient id="lg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC080" stop-opacity=".5"/><stop offset="1" stop-color="#FFC080" stop-opacity="0"/></radialGradient>`;
    return svgDoc('0 0 1600 1000', o, d);
  }

  /* ---------- lys og pynt der bevæger sig ---------- */
  function kegle(c){
    return svgDoc('0 0 200 600', `<path d="M 80 0 L 120 0 L 200 600 L 0 600 Z" fill="url(#k)"/>`, `<linearGradient id="k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`);
  }
  function diskokugle(){
    let o = `<path d="M 100 0 V 60" stroke="#C8C8DC" stroke-width="4"/><circle cx="100" cy="130" r="72" fill="#B8BCD8" ${st(5)}/>`;
    for (let r = -3; r <= 3; r++) for (let c = -3; c <= 3; c++){ const x = 100 + c * 19, y = 130 + r * 19; if (Math.hypot(x - 100, y - 130) < 64) o += `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" fill="${['#FFFFFF', '#D8DCF0', '#9AA0C8', '#E8ECFF'][(r * 3 + c + 12) % 4]}"/>`; }
    o += `<circle cx="100" cy="130" r="72" fill="none" ${st(5)}/>` + star(70, 100, 12, '#FFF', 0);
    return svgDoc('0 0 200 210', o);
  }
  function flamme(){
    return svgDoc('-60 -170 120 180', `<path d="M -40 10 L -34 -24 H 34 L 40 10 Z" fill="#3A3450" ${st(5)}/><path d="M 0 -30 C -40 -60 -30 -110 -6 -160 C 0 -120 30 -110 20 -70 C 40 -90 36 -60 30 -40 Q 20 -24 0 -30 Z" fill="#FF8F3A" ${st(4)}/><path d="M 0 -34 C -20 -54 -14 -84 0 -110 C 4 -80 20 -70 10 -46 Z" fill="#FFE45F"/>`);
  }
  function fakkel(){
    return svgDoc('-60 -230 120 240', `<path d="M -8 10 L -12 -120 H 12 L 8 10 Z" fill="#8A5A3C" ${st(4)}/><path d="M -20 -120 H 20 L 16 -150 H -16 Z" fill="#5A3A20" ${st(4)}/><path d="M 0 -150 C -34 -170 -24 -200 -4 -228 C 0 -200 24 -196 18 -170 C 30 -180 26 -160 20 -152 Q 10 -144 0 -150 Z" fill="#FF8F3A" ${st(4)}/><path d="M 0 -154 C -12 -166 -8 -184 0 -200 C 4 -184 14 -176 8 -160 Z" fill="#FFE45F"/>`);
  }
  function lysekrone(){
    let o = `<path d="M 150 0 V 70" stroke="#C99A12" stroke-width="5"/><path d="M 30 110 Q 150 170 270 110" stroke="#F2C14E" stroke-width="10" fill="none" ${''}/><path d="M 30 110 Q 150 170 270 110" stroke="${E}" stroke-width="3" fill="none"/><ellipse cx="150" cy="96" rx="40" ry="26" fill="#F2C14E" ${st(4)}/>`;
    for (const x of [30, 90, 150, 210, 270]){ const y = x === 150 ? 70 : 110 + (x === 90 || x === 210 ? 22 : 0); o += `<rect x="${x - 8}" y="${y - 40}" width="16" height="40" rx="4" fill="#FFF6E8" ${st(3)}/><path d="M ${x} ${y - 42} C ${x - 10} ${y - 56} ${x} ${y - 70} ${x} ${y - 70} C ${x + 6} ${y - 60} ${x + 10} ${y - 52} ${x} ${y - 42} Z" fill="#FFD36E"/><circle cx="${x}" cy="${y - 54}" r="22" fill="#FFE8A0" opacity=".3"/>`; }
    for (const x of [60, 120, 180, 240]) o += `<path d="M ${x} 140 l -6 14 l 6 12 l 6 -12 Z" fill="#E8F4FF" ${st(2)}/>`;
    return svgDoc('0 0 300 200', o);
  }
  function busk(){   /* en rullende busk til country */
    let o = '';
    for (let k = 0; k < 14; k++){ const a = k * 2.4, r = 30 + (k % 3) * 8; o += `<path d="M ${50 + Math.cos(a) * r} ${50 + Math.sin(a) * r} Q 50 50 ${50 + Math.cos(a + 2) * r} ${50 + Math.sin(a + 2) * r}" stroke="#A87A40" stroke-width="5" fill="none" stroke-linecap="round"/>`; }
    return svgDoc('0 0 100 100', `<circle cx="50" cy="50" r="40" fill="#C8A060" opacity=".35"/>` + o);
  }

  /* ---------- forhåndsvisning: hele scenen som ét billede (Tegnebordet) ---------- */
  function previewSvg(g){
    const img = (src, x, y, w, h) => `<image href="${svgUrl(src)}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    let o = img(bag(g), 0, 0, 1600, 1000);
    const S = STIL[g];
    o += BAND.map((m, k) => `<image href="${svgUrl(kegle(k % 2 ? S.lys2 : S.lys))}" x="${m.x - 140}" y="${AY + 40}" width="280" height="${m.y - AY - 10}" opacity=".7"/>`).join('');
    o += pynt(g).filter(p => p.k !== 'kz-flak').map(p => img(p.svg, p.x, p.y, p.w, p.h)).join('');
    for (const m of BAND){
      const big = m.id === 'bas';
      o += img(gnomSvg(m, g, 0), m.x - (big ? 200 : 150), m.y - (big ? 400 : 390), big ? 360 : 300, big ? 410 : 400);
      if (m.id === 'trommer') o += img(trommer(g), m.x - 170, m.y - 210 + 4, 340, 220);
    }
    o += pynt(g).filter(p => p.k === 'kz-flak').map(p => img(p.svg, p.x, p.y, p.w, p.h)).join('');
    o += img(forgrund(), 0, 0, 1600, 1000);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${o}</svg>`;
  }
  /* hele salen med scenen længere væk og bordene foran (Tegnebordet) */
  function previewSal(g){
    const img = (src, x, y, w, h) => `<image href="${svgUrl(src)}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    const [a, b, c, d] = KLIP, w = (c - a) * SAL.s, h = (d - b) * SAL.s;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${img(salBag(), 0, 0, 1600, 1000)}`
      + `<svg x="${SAL.x + a * SAL.s}" y="${SAL.y + b * SAL.s}" width="${w}" height="${h}" viewBox="${a} ${b} ${c - a} ${d - b}">${previewSvg(g).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`
      + [0, 1, 2].map(r => img(borde(r), 0, 0, 1600, 1000)).join('') + `</svg>`;
  }
  /* pynt pr. stil: [svg, x, y, w, h, klasse] */
  function pynt(g){
    if (g === 'rock') return [{ svg: flamme(), x: 250, y: 650, w: 120, h: 180, k: 'kz-flak' }, { svg: flamme(), x: 1230, y: 650, w: 120, h: 180, k: 'kz-flak' }];
    if (g === 'disko') return [{ svg: diskokugle(), x: 700, y: 150, w: 200, h: 210, k: 'kz-kugle' }];
    if (g === 'klassisk') return [{ svg: lysekrone(), x: 650, y: 150, w: 300, h: 200, k: 'kz-sving' }];
    if (g === 'hawaii') return [{ svg: fakkel(), x: 245, y: 590, w: 120, h: 240, k: 'kz-flak' }, { svg: fakkel(), x: 1235, y: 590, w: 120, h: 240, k: 'kz-flak' }];
    if (g === 'country') return [{ svg: busk(), x: 300, y: 540, w: 80, h: 80, k: 'kz-busk' }];
    return [];
  }

  /* ---------- skærmen ---------- */
  let stil = 'hygge', busy = false, root = null, salEl = null, scaleFn = null;
  const URL_CACHE = {};
  const url = (k, fn) => URL_CACHE[k] || (URL_CACHE[k] = svgUrl(fn()));
  function show(){
    showScreen('#koncert'); busy = false;
    const box = $('#koncertBody'); box.innerHTML = '';
    const scene = el('div', { class: 'kz-wrap' }), sal = el('div', { class: 'kz-sal' }), st = el('div', { class: 'kz-stage' });
    st.style.cssText = `left:${SAL.x}px;top:${SAL.y}px;transform:scale(${SAL.s});clip-path:inset(${KLIP[1]}px ${1600 - KLIP[2]}px ${1000 - KLIP[3]}px ${KLIP[0]}px)`;
    sal.append(pic(url('salbag', salBag), 0, 0, 1600, 1000), st, pic(url('borde0', () => borde(0)), 0, 0, 1600, 1000, 'kz-borde b0'), pic(url('borde1', () => borde(1)), 0, 0, 1600, 1000, 'kz-borde b1'), pic(url('borde2', () => borde(2)), 0, 0, 1600, 1000, 'kz-borde b2'));
    scene.append(sal); root = st; salEl = sal;
    box.append(scene, ...placeUi([ backBtn('Byen', showTown) ], [ el('button', { class: 'btn kz-oensk', type: 'button', on: { click: aabnOensker } }, [ el('span', { html: NOTE_ICON }), 'Ønsk en sang' ]), audioBtns() ]));
    byg(st);
    updateAudioBtns();
    scaleFn = () => { const r = scene.getBoundingClientRect(), s = Math.max(r.width / 1600, r.height / 1000); sal.style.transform = `translate(-50%,-50%) scale(${s})`; };
    scaleFn(); window.removeEventListener('resize', skaler); window.addEventListener('resize', skaler);
    spilSang();
  }
  function skaler(){ if (scaleFn && !$('#koncert').hidden) scaleFn(); }
  const pic = (src, x, y, w, h, cls = '') => el('img', { class: 'kz-pic ' + cls, src, alt: '', draggable: 'false', style: `left:${x}px;top:${y}px;width:${w}px;height:${h}px` });
  function byg(stage){
    stage.innerHTML = '';
    stage.append(pic(url('bag:' + stil, () => bag(stil)), 0, 0, 1600, 1000, 'kz-bag'));
    const lys = el('div', { class: 'kz-lys kz-lys-' + stil });
    BAND.forEach((m, k) => lys.append(pic(url('kegle:' + (k % 2 ? STIL[stil].lys2 : STIL[stil].lys), () => kegle(k % 2 ? STIL[stil].lys2 : STIL[stil].lys)), m.x - 140, AY + 40, 280, m.y - AY - 10, 'kz-kegle k' + k)));
    stage.append(lys);
    for (const p of pynt(stil).filter(p => p.k !== 'kz-flak')) stage.append(pic(url('p:' + stil + p.k, () => p.svg), p.x, p.y, p.w, p.h, p.k));
    for (const m of BAND){
      const big = m.id === 'bas', w = big ? 360 : 300, h = big ? 410 : 400;
      const g = el('div', { class: 'kz-g kz-' + m.id, 'data-m': m.id, style: `left:${m.x - (big ? 200 : 150)}px;top:${m.y - (big ? 400 : 390)}px;width:${w}px;height:${h}px` });
      const inner = el('div', { class: 'kz-in' });
      inner.append(pic(url(`g:${m.id}:${stil}:0`, () => gnomSvg(m, stil, 0)), 0, 0, w, h, 'f0'), pic(url(`g:${m.id}:${stil}:1`, () => gnomSvg(m, stil, 1)), 0, 0, w, h, 'f1'));
      g.append(inner);
      g.addEventListener('pointerdown', e => { e.preventDefault(); solo(m, g); });
      stage.append(g);
      if (m.id === 'trommer') stage.append(pic(url('kit:' + stil, () => trommer(stil)), m.x - 170, m.y - 206, 340, 220, 'kz-kit'));
    }
    for (const p of pynt(stil).filter(p => p.k === 'kz-flak')) stage.append(pic(url('p:' + stil + p.k + p.x, () => p.svg), p.x, p.y, p.w, p.h, p.k));
    stage.append(el('div', { class: 'kz-tv', style: `left:${AX}px;top:${AY - 30}px;width:${AW / 2 + 40}px` }, [ pic(url('tv', () => taeppe(-1)), 0, 0, AW / 2 + 40, 730) ]),
      el('div', { class: 'kz-th', style: `left:${AX + AW / 2 - 40}px;top:${AY - 30}px;width:${AW / 2 + 40}px` }, [ pic(url('th', () => taeppe(1)), 0, 0, AW / 2 + 40, 730) ]));
    stage.append(el('div', { class: 'kz-skilt', hidden: true }));
    if (stil === 'hygge') for (let k = 0; k < 9; k++) stage.append(el('div', { class: 'kz-flue', style: `left:${300 + k * 120}px;top:${280 + (k * 137) % 300}px;animation-delay:${-k * 1.3}s` }));
    stage.append(pic(url('forgrund', forgrund), 0, 0, 1600, 1000, 'kz-for'));
    stage.style.setProperty('--slag', (60 / BPM[stil]).toFixed(3) + 's');
    stage.className = 'kz-stage kz-' + stil;
    if (salEl) salEl.classList.remove('spiller');
  }
  const BPM = { hygge: 84, rock: 140, country: 118, disko: 120, klassisk: 96, hawaii: 100 };
  function solo(m, g){
    if (busy) return;
    SND.play('koncert.gnom', () => [0, 4, 7, 12].forEach((n, i) => tone(523 * Math.pow(2, n / 12), .12, 'triangle', .05, i * .07, 1)));
    const k = g.querySelector('.kz-in'); k.classList.remove('hop'); void k.offsetWidth; k.classList.add('hop');
    for (let i = 0; i < 4; i++){ const n = el('div', { class: 'kz-node', style: `left:${m.x - 20 + (i - 1.5) * 34}px;top:${m.y - 360}px;animation-delay:${i * .12}s` }, i % 2 ? '♪' : '♫'); root.append(n); setTimeout(() => n.remove(), 1800); }
  }

  /* ---------- ønskesedlen ---------- */
  function aabnOensker(){
    if (busy) return;
    sfx.open();
    /* lounge er det, bandet spiller mellem ønskesangene, så den kan ikke ønskes */
    const kort = STILE.filter(g => g !== 'hygge').map(g => {
      const b = el('button', { class: 'ak-prize kz-sangkort' + (g === stil ? ' own' : ''), type: 'button', on: { click: () => { luk(); if (g !== stil) skift(g); } } });
      SLEEVE = farver(BAND[1], g).krop;
      b.innerHTML = `<span class="pic">${svgDoc('-120 -380 240 290', gnom(BAND[1], g, 0))}</span><span class="nm">${STIL[g].sang}</span><span class="pris">${g === stil ? 'Spiller nu' : STIL[g].navn}</span>`;
      return b;
    });
    const wrap = el('div', { class: 'ak-shopwrap kz-oenskwrap', on: { click: e => { if (e.target === wrap) luk(); } } }, [
      el('div', { class: 'ak-shop-panel' }, [
        el('div', { class: 'ak-shop-top' }, [ el('p', { class: 'say' }, 'Hvilken sang vil du ønske? Så klæder gnomerne om og spiller den for dig.'),
          el('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Luk', on: { click: luk }, html: ic('<path d="M6 6l12 12M18 6L6 18"/>') }) ]),
        el('div', { class: 'ak-prizes' }, kort) ]) ]);
    function luk(){ wrap.remove(); }
    $('#koncertBody').append(wrap);
  }

  /* ---------- skiftet: ud i kulissen, tæppet for, nyt tøj, tæppet fra, ind igen ---------- */
  const vent = ms => new Promise(r => setTimeout(r, ms));
  async function skift(ny, stille){
    if (busy) return; busy = true; sangGen++; clearTimeout(sangT);
    SND.ambience('stemning.koncert', 2);   /* publikum mumler, mens bandet klæder om */
    spiller(false);
    if (ny !== 'hygge') SND.forhent('koncert.' + ny);   /* sangen pakkes ud, mens de klæder om */
    const stage = root, gen = stage, ok = () => root === gen && !$('#koncert').hidden;
    stopMusic(); MUSIC.track = null;
    SND.play('koncert.ud', () => sfx.pick());
    /* de to til venstre går ud til venstre, de to til højre ud til højre */
    BAND.forEach(m => { const g = stage.querySelector(`[data-m="${m.id}"]`); const dx = (m.x < 800 ? 0 - m.x - 180 : 1780 - m.x); g.style.setProperty('--dx', dx + 'px'); g.classList.add('gaa'); g.classList.add('ud'); });
    await vent(1500); if (!ok()) { busy = false; return; }
    SND.play('koncert.taeppe', () => tone(180, .6, 'sawtooth', .02, 0, .7));
    stage.classList.add('lukket');
    await vent(900); if (!ok()) { busy = false; return; }
    const sk = stage.querySelector('.kz-skilt'); sk.hidden = false; sk.innerHTML = `<div class="kz-skilt-in"><small>Gnomerne klæder om …</small><b>${STIL[ny].sang}</b></div>`;
    stil = ny;
    /* forbered de nye billeder, mens tæppet er for */
    await vent(1500); if (!ok()) { busy = false; return; }
    byg(stage); stage.classList.add('lukket', 'tom');
    BAND.forEach(m => { const g = stage.querySelector(`[data-m="${m.id}"]`); const dx = (m.x < 800 ? 0 - m.x - 180 : 1780 - m.x); g.style.setProperty('--dx', dx + 'px'); g.classList.add('ud'); });
    const sk2 = stage.querySelector('.kz-skilt'); sk2.hidden = false; sk2.innerHTML = sk.innerHTML;
    await vent(60);
    sk2.hidden = true; stage.classList.remove('lukket');
    SND.play('koncert.taeppe', () => tone(180, .6, 'sawtooth', .02, 0, .7));
    await vent(900); if (!ok()) { busy = false; return; }
    stage.classList.remove('tom');
    BAND.forEach(m => { const g = stage.querySelector(`[data-m="${m.id}"]`); g.classList.add('gaa'); g.classList.remove('ud'); });
    await vent(1500); if (!ok()) { busy = false; return; }
    BAND.forEach(m => stage.querySelector(`[data-m="${m.id}"]`).classList.remove('gaa'));
    if (!stille) SND.play('koncert.klap', () => sfx.fanfare());
    /* en ønskesang: mumlen toner ud, mens bandet stiller sig klar, og så går sangen i gang */
    if (stil !== 'hygge'){ SND.ambience(null, 2.5); await vent(1600); if (!ok()) { busy = false; return; } }
    spilSang();
    busy = false;
  }

  /* ---------- en sang er færdig: klapsalve, bandet bukker, går ud og kommer tilbage i det almindelige tøj ---------- */
  let sangGen = 0, sangT = 0, lounge = 0;
  /* bandet (og publikum) bevæger sig kun, mens musikken faktisk spiller */
  function spiller(on){ if (root) root.classList.toggle('spiller', !!on); if (salEl) salEl.classList.toggle('spiller', !!on); }
  function startet(g){ return () => { if (g === sangGen) spiller(true); }; }
  function spilSang(){
    const g = ++sangGen, navn = 'koncert.' + stil; clearTimeout(sangT);
    /* er musikken slået fra, spiller bandet alligevel (bare uden lyd); kører den lille synth-melodi, er den allerede i gang */
    setTimeout(() => { if (g === sangGen && (!MUSIC.on || MUSIC.timer)) spiller(true); }, 250);
    if (stil === 'hygge'){   /* lounge: fire numre på skift (aldrig det samme to gange i træk), med mumlen fra publikum under */
      SND.ambience('stemning.koncert', 2);
      let k; do { k = 1 + Math.floor(Math.random() * 4); } while (k === lounge && LYD_MUSIK['koncert.lounge2']); lounge = k;
      playMusic('koncert.lounge' + k, { engang: true, start: startet(g), slut: () => { if (g === sangGen) spilSang(); } });
      return;
    }
    SND.ambience(null, 2.5);
    playMusic(navn, { engang: true, start: startet(g), slut: () => { if (g === sangGen) sangSlut(); } });
    /* findes lydfilen ikke (fx i forhåndsvisningen), spiller den lille synth-melodi; den slutter efter et minuts tid */
    sangT = setTimeout(() => { if (g === sangGen && MUSIC.timer) sangT = setTimeout(() => { if (g === sangGen) sangSlut(); }, 42000); }, 3000);
  }
  async function sangSlut(){
    if (busy || !root || $('#koncert').hidden) return;
    busy = true; const stage = root;
    stopMusic(); MUSIC.track = null; spiller(false);
    SND.play('koncert.klap', () => sfx.fanfare());
    SND.ambience('stemning.koncert', 3);   /* efter klapsalven begynder publikum at mumle igen */
    /* hjerter og blomster flyver op fra publikum */
    for (let i = 0; i < 14; i++){ const n = el('div', { class: 'kz-kast', style: `left:${150 + Math.random() * 1300}px;top:930px;animation-delay:${(Math.random() * 1.4).toFixed(2)}s;--dx:${Math.round(Math.random() * 160 - 80)}px` }, ['♥', '✿', '★'][i % 3]);
      n.style.color = ['#FF5FA8', '#FFE45F', '#FF8FD0', '#FFFFFF'][i % 4]; n.style.top = (700 + Math.random() * 200) + 'px'; (salEl || stage).append(n); setTimeout(() => n.remove(), 3600); }
    stage.classList.add('buk');
    await vent(2600);
    stage.classList.remove('buk');
    busy = false;
    if (root !== stage || $('#koncert').hidden) return;
    skift('hygge', true);
  }

  return { show, previewSvg, previewSal, STIL, STILE, get stil(){ return stil; }, skift, gnomSvg, BAND };
})();

Object.assign(MUSIC_SYNTH, { 'koncert.lounge1': 'koncert.hygge', 'koncert.lounge2': 'koncert.hygge', 'koncert.lounge3': 'koncert.hygge', 'koncert.lounge4': 'koncert.hygge' });
/* den midlertidige musik til hver sang, indtil Kaspers egen er lagt ind (spilles af den indbyggede synth) */
Object.assign(TRACKS, {
  'koncert.hygge': { bpm: 84, chords: [[60,64,67,72],[57,60,64,69],[53,57,60,65],[55,59,62,67]], arpT: 'sine', melT: 'sine', melV: .06,
    melody: [72,null,null,74,76,null,74,null, 72,null,69,null,67,null,null,null, 65,null,69,null,72,null,71,69, 67,null,null,null,null,null,null,null] },
  'koncert.rock': { bpm: 140, chords: [[52,59,64,67],[55,62,67,71],[57,64,69,72],[50,57,62,66]], basM: [0,0,0,0,0,0,12,0], basT: 'sawtooth', arpM: [0,null,1,0,null,1,0,2], arpT: 'sawtooth', melT: 'square', melV: .035, slag: 'khshkhsh',
    melody: [76,null,76,79,null,76,74,null, 74,null,74,79,null,74,71,null, 72,null,72,76,null,72,69,null, 74,74,null,78,null,81,null,null] },
  'koncert.country': { bpm: 118, chords: [[55,59,62,67],[60,64,67,72],[62,66,69,74],[55,59,62,67]], basM: [0,null,'c',null,7,null,'c',null].map(v => v === 'c' ? null : v), arpM: [null,null,'c',null,null,null,'c',null], arpT: 'triangle', melT: 'square', melV: .03, slag: 'k.s.k.s.',
    melody: [71,72,74,null,74,null,76,74, 72,null,72,null,76,null,72,null, 74,null,78,null,81,null,78,76, 74,null,null,71,74,null,null,null] },
  'koncert.disko': { bpm: 120, chords: [[57,60,64,69],[62,65,69,74],[55,59,62,67],[60,64,67,72]], basM: [0,12,0,12,0,12,0,12], basT: 'square', arpM: [null,'c',null,'c',null,'c',null,'c'], arpT: 'triangle', melT: 'triangle', slag: 'khkhkhkh',
    melody: [81,null,79,76,null,76,74,76, null,null,74,null,72,null,69,null, 77,null,76,74,null,74,72,74, 79,null,null,76,null,74,72,null] },
  'koncert.klassisk': { bpm: 96, chords: [[55,59,62,67],[50,54,57,62],[55,59,62,67],[50,54,57,60]], basM: [0,null,null,null,7,null,null,null], arpM: [null,2,3,2,null,2,3,2], arpT: 'sine', melT: 'triangle', melV: .06,
    melody: [79,null,74,79,null,74,79,74, 79,83,86,null,null,null,null,null, 84,null,81,84,null,81,84,81, 84,78,81,null,null,null,null,null] },
  'koncert.hawaii': { bpm: 100, chords: [[60,64,67,72],[65,69,72,77],[67,71,74,79],[60,64,67,72]], basM: [0,null,null,7,null,null,0,null], arpM: [0,2,1,2,3,2,1,2], arpT: 'triangle', melT: 'sine', melV: .06, slag: '.h.h.h.h',
    melody: [76,null,77,79,null,76,null,72, 74,null,null,77,76,74,72,null, 74,null,76,77,null,79,null,81, 79,null,76,null,72,null,null,null] },
});
