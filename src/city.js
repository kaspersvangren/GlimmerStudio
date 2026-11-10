/* ================= Byen: hovedmenuen — en lang gade med liv, årstider og tid på dagen ================= */
const CW = 3200, CH = 1080, G = 740;          // verdenens bredde/højde og husenes fod (bagkanten af fortovet)
const FEET_HERO = G + 100, FEET_PET = G + 114, FEET_PED = G + 44, PED_S = 0.78;
const ROAD_TOP = G + 150, LANE_FAR = G + 250, LANE_NEAR = G + 318;
let CITY_OVR = { season: null, time: null };  // testtilstand kan vælge årstid og tid på dagen

/* ---------- årstid og tid på dagen ---------- */
function cityMood(){
  const d = new Date(), m = d.getMonth() + 1, h = d.getHours() + d.getMinutes() / 60;
  let season = (m === 12 || m <= 2) ? 'vinter' : m <= 5 ? 'foraar' : m <= 8 ? 'sommer' : 'efteraar', xmas = m === 12;
  let time = (h >= 20.5 || h < 6) ? 'nat' : h < 8.5 ? 'morgen' : h < 17 ? 'dag' : 'aften';
  if (CITY_OVR.season){ xmas = CITY_OVR.season === 'jul'; season = xmas ? 'vinter' : CITY_OVR.season; }
  if (CITY_OVR.time) time = CITY_OVR.time;
  return { season, xmas, time, night: time === 'nat', dark: time === 'nat' || time === 'aften' };
}
const SKY = { morgen:['#FFB8D2','#FFE7C4'], dag:['#8FD0FF','#E4F5FF'], aften:['#7A5BD0','#FFAE86'], nat:['#141A4E','#3E3488'] };
const SHADE = { morgen:['#FF9BBE',0.14], dag:null, aften:['#B0548C',0.26], nat:['#28307A',0.5] };
const HILLS = { morgen:['#F4D2E6','#E3C6EE'], dag:['#CDEFD9','#A9E2BE'], aften:['#C7A6E0','#B48CD4'], nat:['#3A3880','#2E2C6E'] };

/* ---------- små tegnehjælpere ---------- */
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FONT_C = "Fredoka, 'Baloo 2', sans-serif";
let LITS = [], LAMPS = [], PERCH = [], XMAS = [], BLD = [], CM = null;   // BLD: kasser der skjuler lys i baghusene
const sign = (x, y, w, text, fill='#FFFFFF', col='#33204F', size=28) => `<g class="sign"><rect x="${x - w/2}" y="${y - 25}" width="${w}" height="50" rx="25" fill="${fill}" stroke="#33204F" stroke-opacity=".18" stroke-width="3"/><text x="${x}" y="${y + 10}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="${size}" fill="${col}">${text}</text></g>`;
const soonSign = (x, y) => `<g transform="translate(${x},${y}) rotate(-7)"><rect x="-96" y="-25" width="192" height="50" rx="10" fill="#FFE27A" stroke="#C99A12" stroke-width="4"/><path d="M -96 -25 L -72 -25 L -96 -1 Z M 96 25 L 72 25 L 96 1 Z" fill="#33204F" opacity=".8"/><text x="0" y="9" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="25" fill="#33204F">Kommer snart</text></g>`;
const scaffold = (x0, x1, y0, y1) => { let s = `<g stroke="#B98A4E" stroke-width="7" stroke-linecap="round" opacity=".9">`; for (let i = 0; i <= 3; i++){ const x = x0 + (x1-x0)*i/3; s += `<path d="M ${x} ${y0} L ${x} ${y1}"/>`; } for (let y = y0 + 40; y < y1; y += 110) s += `<path d="M ${x0-10} ${y} L ${x1+10} ${y}"/><rect x="${x0-6}" y="${y-8}" width="${x1-x0+12}" height="10" fill="#D9B27A" stroke="none" opacity=".8"/>`; s += `<path d="M ${x0} ${y0+40} L ${x1} ${y0+150} M ${x1} ${y0+150} L ${x0} ${y0+260}" stroke-width="5"/></g>`; return s; };
const heartP = (x, y, s, fill, stroke='none') => `<path transform="translate(${x},${y}) scale(${s})" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${fill}" stroke="${stroke}" stroke-width="${stroke==='none'?0:1.5}"/>`;

/* vindue: x,y = øverste venstre hjørne af glasset */
function cWin(x, y, w, h, o = {}){
  const fr = o.frame || '#FFFFFF', line = o.line || '#33204F', r = o.r ?? 8;
  let s = `<rect x="${x-6}" y="${y-6}" width="${w+12}" height="${h+12}" rx="${r+2}" fill="${fr}" stroke="${line}" stroke-opacity=".28" stroke-width="3"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.max(0, r-3)}" fill="url(#glassG)"/>`;
  if (o.inner) s += o.inner;
  if (o.curtain){ const c = o.curtain, d = shade(c);
    s += `<path d="M ${x} ${y} L ${x+w*0.34} ${y} Q ${x+w*0.16} ${y+h*0.48} ${x+w*0.27} ${y+h} L ${x} ${y+h} Z" fill="${c}" stroke="${d}" stroke-width="2"/>`
       + `<path d="M ${x+w} ${y} L ${x+w*0.66} ${y} Q ${x+w*0.84} ${y+h*0.48} ${x+w*0.73} ${y+h} L ${x+w} ${y+h} Z" fill="${c}" stroke="${d}" stroke-width="2"/>`
       + `<path d="M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+9} Q ${x+w/2} ${y+18} ${x} ${y+9} Z" fill="${d}"/>`; }
  if (o.cross !== false) s += `<path d="M ${x+w/2} ${y} L ${x+w/2} ${y+h} M ${x} ${y+h*0.45} L ${x+w} ${y+h*0.45}" stroke="${fr}" stroke-width="5"/>`;
  s += `<path d="M ${x+8} ${y+h*0.35} L ${x+w*0.35} ${y+8}" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
  if (o.box) s += flowerBox(x - 10, y + h + 6, w + 20, o.box);
  if (o.lit !== false) LITS.push([x, y, w, h, o.r ?? 8]);
  return s;
}
function flowerBox(x, y, w, col){
  const c = typeof col === 'string' ? col : '#B9763F';
  let s = '';
  if (CM.season === 'vinter') s += `<path d="M ${x+4} ${y} Q ${x+w/2} ${y-22} ${x+w-4} ${y}" fill="#3E8E5A"/><path d="M ${x+2} ${y-2} Q ${x+w/2} ${y-26} ${x+w-2} ${y-2}" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>`;
  else { const cols = CM.season === 'efteraar' ? ['#F28C38','#E0457A','#FFC02E'] : ['#FF5FA8','#FFE27A','#B79BFF','#FF8FC7'];
    s += `<path d="M ${x+4} ${y} Q ${x+w/2} ${y-16} ${x+w-4} ${y}" fill="#5FC46A"/>`;
    for (let i = 0; i < Math.floor(w/18); i++){ const fx = x + 12 + i*18, fy = y - 12 - (i%2)*6; s += `<circle cx="${fx}" cy="${fy}" r="7" fill="${cols[i%cols.length]}"/><circle cx="${fx}" cy="${fy}" r="2.5" fill="#FFF3B0"/>`; } }
  return s + `<rect x="${x}" y="${y}" width="${w}" height="20" rx="5" fill="${c}" stroke="${adj(c,-0.25)}" stroke-width="3"/>`;
}
function cDoor(cx, w, h, col, o = {}){
  const x = cx - w/2, y = G - h, line = adj(col, -0.28);
  let s = `<rect x="${x-14}" y="${G-4}" width="${w+28}" height="14" rx="4" fill="#D9CDE6" stroke="#A99BC0" stroke-width="2"/>`;
  s += `<path d="M ${x-8} ${G} L ${x-8} ${y+w/2} A ${w/2+8} ${w/2+8} 0 0 1 ${x+w+8} ${y+w/2} L ${x+w+8} ${G} Z" fill="${o.frame || '#FFFFFF'}" stroke="#33204F" stroke-opacity=".25" stroke-width="3"/>`;
  s += `<path d="M ${x} ${G} L ${x} ${y+w/2} A ${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2} L ${x+w} ${G} Z" fill="${col}" stroke="${line}" stroke-width="4"/>`;
  s += `<rect x="${x+10}" y="${y+h*0.48}" width="${w/2-15}" height="${h*0.38}" rx="5" fill="none" stroke="${line}" stroke-width="3" opacity=".5"/><rect x="${cx+5}" y="${y+h*0.48}" width="${w/2-15}" height="${h*0.38}" rx="5" fill="none" stroke="${line}" stroke-width="3" opacity=".5"/>`;
  if (o.glass !== false) s += `<path d="M ${x+12} ${y+w/2+4} A ${w/2-12} ${w/2-12} 0 0 1 ${x+w-12} ${y+w/2+4} Z" fill="url(#glassG)"/>`;
  s += `<circle cx="${x+w-14}" cy="${y+h*0.58}" r="5.5" fill="#FFD54A" stroke="#C99A12" stroke-width="2"/>`;
  if (CM.xmas) s += `<g transform="translate(${cx},${y+h*0.3})"><circle r="22" fill="none" stroke="#2E8B57" stroke-width="11"/>${[0,1,2,3,4,5].map(i=>`<circle cx="${(22*Math.cos(i*1.05)).toFixed(1)}" cy="${(22*Math.sin(i*1.05)).toFixed(1)}" r="3.5" fill="#E0233F"/>`).join('')}<path d="M -8 18 L 0 26 L 8 18" fill="#E0233F"/></g>`;
  return s;
}
function awning(x0, x1, y, depth, c1, c2 = '#FFFFFF'){
  const n = Math.max(4, Math.round((x1 - x0) / 34)), sw = (x1 - x0) / n;
  let s = `<path d="M ${x0} ${y} L ${x1} ${y} L ${x1+16} ${y+depth} L ${x0-16} ${y+depth} Z" fill="${c2}"/>`;
  for (let i = 0; i < n; i += 2){ const a = x0 + i*sw, b = a + sw, k = (v, t) => v + (v < (x0+x1)/2 ? -1 : 1) * 16 * t * Math.abs(v - (x0+x1)/2) / ((x1-x0)/2);
    s += `<path d="M ${a} ${y} L ${b} ${y} L ${k(b,1).toFixed(1)} ${y+depth} L ${k(a,1).toFixed(1)} ${y+depth} Z" fill="${c1}"/>`; }
  let sc = `M ${x0-16} ${y+depth}`; for (let i = 0; i < n; i++){ const a = x0 - 16 + i*(x1-x0+32)/n, b = a + (x1-x0+32)/n; sc += ` Q ${((a+b)/2).toFixed(1)} ${y+depth+22} ${b.toFixed(1)} ${y+depth}`; }
  s += `<path d="${sc} Z" fill="${c1}" stroke="${adj(c1,-0.25)}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M ${x0} ${y} L ${x1} ${y} L ${x1+16} ${y+depth} L ${x0-16} ${y+depth} Z" fill="none" stroke="${adj(c1,-0.25)}" stroke-width="3" stroke-linejoin="round"/>`;
  if (CM.season === 'vinter') s += `<path d="M ${x0-4} ${y-3} L ${x1+4} ${y-3}" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>`;
  return s;
}
const snowLine = d => CM.season === 'vinter' ? `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#DDEBFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,7)" opacity=".8"/>` : '';
function xmasString(x0, x1, y, sag = 26){ if (CM.xmas) XMAS.push([x0, x1, y, sag]); return `<path d="M ${x0} ${y} Q ${(x0+x1)/2} ${y+sag*2} ${x1} ${y}" fill="none" stroke="#2E3A2E" stroke-width="2.5" opacity="${CM.xmas?0.7:0}"/>`; }

/* træ på fortovet (årstiden bestemmer kronen) */
function cTree(x, big = 1, id = ''){
  const base = G + 22, top = G - 170*big, cy = G - 270*big, r = 118*big;
  let s = `<g${id?` id="${id}"`:''}><ellipse cx="${x}" cy="${base+2}" rx="${46*big}" ry="10" fill="#5B3A8C" opacity=".12"/><path d="M ${x-16*big} ${base} L ${x-11*big} ${top} L ${x+11*big} ${top} L ${x+16*big} ${base} Z" fill="#9C6B43" stroke="#6E4527" stroke-width="3"/>`;
  s += `<path d="M ${x} ${top+20} L ${x-50*big} ${cy-10} M ${x} ${top+40} L ${x+60*big} ${cy+4}" stroke="#8A5A35" stroke-width="${11*big}" stroke-linecap="round"/>`;
  const blobs = [[0,0,1],[-70,30,.7],[72,26,.72],[-40,-56,.72],[48,-58,.7],[0,-80,.6]];
  if (CM.season === 'vinter'){
    s += `<g stroke="#8A5A35" stroke-linecap="round" fill="none">${[[-80,-60],[80,-70],[-30,-110],[40,-120],[-100,10],[100,0]].map(([dx,dy])=>`<path d="M ${x} ${top+10} Q ${x+dx*0.5*big} ${cy+dy*0.4*big} ${x+dx*big} ${cy+dy*big}" stroke-width="${8*big}"/>`).join('')}</g>`;
    s += [[-80,-60],[80,-70],[-30,-110],[40,-120],[-100,10],[100,0]].map(([dx,dy])=>`<ellipse cx="${x+dx*big}" cy="${cy+dy*big-4}" rx="${16*big}" ry="${6*big}" fill="#FFFFFF"/>`).join('');
  } else {
    const [c1, c2] = CM.season === 'efteraar' ? ['#F28C38','#E8B33A'] : CM.season === 'foraar' ? ['#7CD36A','#A7EA86'] : ['#45B05A','#6FD06B'];
    s += blobs.map(([dx,dy,k],i)=>`<circle cx="${x+dx*big}" cy="${cy+dy*big}" r="${r*k}" fill="${i%2?c2:c1}" stroke="${adj(c1,-0.18)}" stroke-width="3"/>`).join('');
    s += `<circle cx="${x-30*big}" cy="${cy-40*big}" r="${30*big}" fill="#FFFFFF" opacity=".18"/>`;
    if (CM.season === 'foraar') s += Array.from({length:16},(_,i)=>`<circle cx="${(x+Math.cos(i*2.4)*r*0.9*((i%3+2)/4)).toFixed(1)}" cy="${(cy-20+Math.sin(i*2.4)*r*0.7*((i%3+2)/4)).toFixed(1)}" r="${7*big}" fill="#FFC1DC"/>`).join('');
    if (CM.season === 'efteraar') s += Array.from({length:12},(_,i)=>`<circle cx="${(x+Math.cos(i*2.1)*r*0.8).toFixed(1)}" cy="${(cy+Math.sin(i*2.1)*r*0.6).toFixed(1)}" r="${9*big}" fill="#E0452E" opacity=".75"/>`).join('');
    if (CM.season === 'sommer') s += Array.from({length:7},(_,i)=>`<circle cx="${(x+Math.cos(i*2.6)*r*0.75).toFixed(1)}" cy="${(cy+Math.sin(i*2.6)*r*0.55).toFixed(1)}" r="${8*big}" fill="#FF5F6D"/>`).join('');
  }
  PERCH.push([x + 40*big, cy - r*0.86, 'tree']); BLD.push([x - r*1.25, x + r*1.25, cy - r*0.8]);
  return s + `</g>`;
}
function cLamp(x){
  LAMPS.push([x, G - 262]);
  return `<g><rect x="${x-14}" y="${G+10}" width="28" height="12" rx="4" fill="#4B3F6B"/><rect x="${x-6}" y="${G-250}" width="12" height="262" rx="5" fill="#4B3F6B"/>`
    + `<path d="M ${x} ${G-250} Q ${x} ${G-276} ${x+22} ${G-276}" fill="none" stroke="#4B3F6B" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="M ${x-20} ${G-262} L ${x+20} ${G-262} L ${x+14} ${G-238} L ${x-14} ${G-238} Z" fill="#FFF3B0" stroke="#4B3F6B" stroke-width="5" stroke-linejoin="round"/><path d="M ${x-24} ${G-262} Q ${x} ${G-286} ${x+24} ${G-262} Z" fill="#4B3F6B"/>`
    + (CM.xmas ? `<path d="M ${x-10} ${G-200} L ${x+10} ${G-180} M ${x-10} ${G-170} L ${x+10} ${G-150} M ${x-10} ${G-140} L ${x+10} ${G-120}" stroke="#E0233F" stroke-width="6"/>` : '') + `</g>`;
}

/* ---------- bygningerne (hver med et "sted" man kan gå hen til) ---------- */
const PLACES = [
  { id:'hus', name:'Mit hus', x:230, open: () => showHome() },
  { id:'mode', name:'Modehuset', x:820, open: () => startFashion() },
  { id:'kugler', name:'Kuglebutikken', x:1295, open: () => showBalls() },
  { id:'cafe', name:'Caféen', x:2080, soon:true },
  { id:'dyr', name:'Dyreparken', x:2655, soon:true },
  { id:'foto', name:'Fotostudiet', x:3010, soon:true },
];
const placeG = (id, label, soon, inner) => `<g class="place${soon?' soon':''}" data-place="${id}" tabindex="0" role="button" aria-label="${label}${soon?', kommer snart':''}">${inner}</g>`;

function bHome(){
  const x0 = 80, x1 = 380, top = G - 300, cx = 230;
  BLD.push([54, 406, G-330], [140, 320, G-470]);
  let s = `<rect x="${x0}" y="${top}" width="${x1-x0}" height="300" fill="#FFC1DC" stroke="#E0457A" stroke-width="5"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="300" fill="url(#siding)"/>`;
  s += `<rect x="${x0-6}" y="${G-150}" width="${x1-x0+12}" height="10" rx="4" fill="#FFFFFF" opacity=".8"/>`;
  // skorsten med røg
  s += `<rect x="310" y="${G-470}" width="40" height="110" fill="#E0457A" stroke="#C2276B" stroke-width="4"/><rect x="302" y="${G-480}" width="56" height="18" rx="4" fill="#C2276B"/>`;
  if (CM.season !== 'sommer') s += [0,1,2].map(i=>`<circle cx="330" cy="${G-490}" r="14" fill="#FFFFFF" opacity="0"><animate attributeName="cy" values="${G-490};${G-600}" dur="4.5s" begin="${i*1.5}s" repeatCount="indefinite"/><animate attributeName="cx" values="330;350;318" dur="4.5s" begin="${i*1.5}s" repeatCount="indefinite"/><animate attributeName="r" values="12;30" dur="4.5s" begin="${i*1.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.75;0" dur="4.5s" begin="${i*1.5}s" repeatCount="indefinite"/></circle>`).join('');
  // tag med tegl
  const roof = `M ${x0-26} ${top+6} L ${cx} ${G-500} L ${x1+26} ${top+6} Z`;
  s += `<path d="${roof}" fill="#FF5FA8" stroke="#C2276B" stroke-width="5" stroke-linejoin="round"/><path d="${roof}" fill="url(#tiles)"/>` + snowLine(`M ${x0-22} ${top+2} L ${cx} ${G-496} L ${x1+22} ${top+2}`);
  s += `<circle cx="${cx}" cy="${G-400}" r="34" fill="#FFFFFF" stroke="#C2276B" stroke-width="5"/>${heartP(cx, G-398, 2.6, '#FF3D8F')}`;
  PERCH.push([cx, G-506, 'roof'], [x0+20, top-2, 'roof']);
  // vinduer: oppe et med en af hendes andre dukker
  s += cWin(105, G-275, 90, 100, { curtain:'#FFFFFF', box:'#E0457A', inner:`<rect x="105" y="${G-275}" width="90" height="100" fill="#FFE9F3"/><image id="homeDoll" x="105" y="${G-275}" width="90" height="100" preserveAspectRatio="xMidYMax slice"/>` });
  s += cWin(265, G-275, 90, 100, { curtain:'#FFFFFF', box:'#E0457A' });
  s += cWin(100, G-120, 70, 80, { curtain:'#B79BFF', box:'#B657F0' }) + cWin(290, G-120, 70, 80, { curtain:'#B79BFF', box:'#B657F0' });
  s += cDoor(cx, 76, 130, '#B657F0');
  s += `<g transform="translate(${cx+58},${G-96})"><rect x="-8" y="-14" width="16" height="22" rx="4" fill="#FFF3B0" stroke="#4B3F6B" stroke-width="3"/></g>`; LAMPS.push([cx+58, G-100, 'small']);
  s += [[x0+6,1],[x1-6,1]].map(([x])=>`<circle cx="${x}" cy="${G-14}" r="20" fill="#5FC46A"/><circle cx="${x+14}" cy="${G-22}" r="14" fill="#7CD36A"/>${CM.season==='vinter'?`<ellipse cx="${x+4}" cy="${G-32}" rx="20" ry="7" fill="#FFFFFF"/>`:`<circle cx="${x-6}" cy="${G-26}" r="6" fill="#FF8FC7"/><circle cx="${x+12}" cy="${G-32}" r="6" fill="#FFE27A"/>`}`).join('');
  // postkasse
  s += `<g transform="translate(${x1+22},${G+20})"><rect x="-4" y="-50" width="8" height="52" fill="#6B5A8E"/><rect x="-20" y="-78" width="40" height="30" rx="8" fill="#E0233F" stroke="#9C1530" stroke-width="3"/><rect x="-12" y="-68" width="24" height="5" rx="2" fill="#9C1530"/></g>`;
  s += xmasString(x0, x1, top + 4, 14);
  return placeG('hus', 'Mit hus', false, s + sign(cx, G-560, 180, 'Mit hus'));
}
function bNeighbour(){
  const x0 = 410, x1 = 600, top = G - 460;
  BLD.push([x0-12, x1+12, top-24]);
  let s = `<rect x="${x0}" y="${top}" width="${x1-x0}" height="460" fill="#F6D58E" stroke="#C99A12" stroke-width="5"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="460" fill="url(#brick)"/>`;
  s += `<rect x="${x0-12}" y="${top-24}" width="${x1-x0+24}" height="28" rx="6" fill="#E8B33A" stroke="#C99A12" stroke-width="4"/>` + snowLine(`M ${x0-8} ${top-26} L ${x1+8} ${top-26}`);
  PERCH.push([x0+30, top-26, 'roof'], [x1-36, top-26, 'roof']);
  // øverst: katten i vinduet
  s += cWin(x0+30, top+40, 56, 76, { curtain:'#7FB5FF', inner:`<g id="winCat" data-tap="cat" transform="translate(${x0+58},${top+116})"><path d="M 14 -4 C 34 -6, 40 -30, 30 -44" fill="none" stroke="#6E6E8E" stroke-width="7" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="0 14 -4;14 14 -4;0 14 -4;-8 14 -4;0 14 -4" dur="2.6s" repeatCount="indefinite"/></path><ellipse cx="0" cy="-16" rx="16" ry="18" fill="#8E8EAE"/><circle cx="0" cy="-40" r="15" fill="#8E8EAE"/><path d="M -13 -48 L -11 -64 L -2 -53 Z M 13 -48 L 11 -64 L 2 -53 Z" fill="#8E8EAE"/><circle cx="-5" cy="-42" r="3" fill="#33204F"/><circle cx="5" cy="-42" r="3" fill="#33204F"/><path d="M -3 -35 Q 0 -32 3 -35" fill="none" stroke="#33204F" stroke-width="1.6"/></g>` });
  s += cWin(x1-86, top+40, 56, 76, { curtain:'#7FB5FF' });
  s += cWin(x0+30, top+170, 56, 76, { box:'#B9763F', curtain:'#FFFFFF' }) + cWin(x1-86, top+170, 56, 76, { box:'#B9763F', curtain:'#FFFFFF' });
  s += cWin(x0+28, G-170, 60, 80, { curtain:'#FFB3D1' });
  s += cDoor(x1-58, 62, 120, '#2F9E8F');
  s += xmasString(x0, x1, top + 150, 12);
  return `<g>${s}</g>`;
}
function bFashion(manIds){
  const x0 = 640, x1 = 1000, cx = 820, top = G - 520;
  BLD.push([x0, x1, top+20], [x0+60, x1-60, top-40]);
  let s = `<rect x="${x0}" y="${top}" width="${x1-x0}" height="520" rx="10" fill="#8A5BE8" stroke="#5B34B8" stroke-width="5"/>`;
  s += [x0+14, x1-34].map(x=>`<rect x="${x}" y="${top+60}" width="20" height="${520-60}" fill="#9D74F0"/>`).join('');
  s += `<path d="M ${x0} ${top+40} Q ${cx} ${top-130} ${x1} ${top+40} Z" fill="#B79BFF" stroke="#5B34B8" stroke-width="5"/>` + snowLine(`M ${x0+8} ${top+30} Q ${cx} ${top-122} ${x1-8} ${top+30}`);
  s += Array.from({length:13},(_,i)=>{ const t=i/12, x=x0+(x1-x0)*t, y=(top+40)-170*4*t*(1-t)*0.98*0.5*1.95; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="8" fill="#FFF3B0"><animate attributeName="opacity" values="1;.3;1" dur="1.2s" begin="${(i%3)*0.4}s" repeatCount="indefinite"/></circle>`; }).join('');
  s += `<g transform="translate(${cx},${top-130})"><polygon points="${star5pts(0,0,34,15)}" fill="#FFE27A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite"/></polygon></g>`;
  PERCH.push([x0+60, top+2, 'roof'], [x1-60, top+2, 'roof']);
  s += `<rect x="${cx-130}" y="${top+52}" width="260" height="62" rx="14" fill="#FF3D8F" stroke="#B32268" stroke-width="4"/><text x="${cx}" y="${top+97}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="40" fill="#FFFFFF" letter-spacing="4">MODE</text>`;
  for (const r of [0,1]) for (const c of [0,1,2]) s += cWin(x0+58+c*100, top+140+r*110, 64, 74, { curtain:'#FF8FC7', frame:'#FFE3F1', r:30, cross:false });
  // udstillingsvinduer med dukker i tilfældigt tøj
  const disp = (wx, ids) => { let d = `<rect x="${wx-8}" y="${G-232}" width="146" height="216" rx="12" fill="#FFE3F1" stroke="#5B34B8" stroke-width="5"/><rect x="${wx}" y="${G-224}" width="130" height="200" rx="8" fill="#FFF6FB"/>`;
    d += `<path d="M ${wx} ${G-224} L ${wx+130} ${G-224} L ${wx+100} ${G-24} L ${wx+30} ${G-24} Z" fill="#FFFFFF" opacity=".5"/><rect x="${wx}" y="${G-44}" width="130" height="20" fill="#E8C9F2"/>`;
    ids.forEach((id, i) => { d += `<image id="${id}" x="${wx-6+i*62}" y="${G-222}" width="80" height="196" preserveAspectRatio="xMidYMax meet"/>`; });
    d += `<path d="M ${wx+6} ${G-150} L ${wx+50} ${G-218}" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity=".55"/>`;
    LITS.push([wx, G-224, 130, 200, 8, 'shop']); return d; };
  s += disp(x0+22, manIds.slice(0,2)) + disp(x1-152, manIds.slice(2,4));
  s += awning(cx-62, cx+62, G-262, 40, '#FF3D8F');
  s += `<rect x="${cx-50}" y="${G-210}" width="100" height="210" fill="#33204F"/><rect x="${cx-42}" y="${G-200}" width="84" height="200" fill="#4A2F73"/><path d="M ${cx} ${G-200} L ${cx} ${G}" stroke="#33204F" stroke-width="4"/><circle cx="${cx-10}" cy="${G-100}" r="4" fill="#FFD54A"/><circle cx="${cx+10}" cy="${G-100}" r="4" fill="#FFD54A"/>`;
  s += `<path d="M ${cx-44} ${G} L ${cx-62} ${G+138} L ${cx+62} ${G+138} L ${cx+44} ${G} Z" fill="#E0233F"/><path d="M ${cx-44} ${G} L ${cx-62} ${G+138} M ${cx+44} ${G} L ${cx+62} ${G+138}" stroke="#FFD54A" stroke-width="4"/>`;
  s += [cx-86, cx+86].map(x=>`<rect x="${x-5}" y="${G+30}" width="10" height="66" fill="#FFD54A" stroke="#C99A12" stroke-width="2"/><circle cx="${x}" cy="${G+28}" r="9" fill="#FFD54A" stroke="#C99A12" stroke-width="2"/>`).join('');
  s += xmasString(x0+10, x1-10, top+128, 18);
  return placeG('mode', 'Modehuset', false, s + sign(cx, top-196, 220, 'Modehuset', '#FFFFFF', '#B32268'));
}
function bBalls(){
  const x0 = 1050, x1 = 1350, cx = 1200, top = G - 340;
  BLD.push([x0-10, x1+10, top-20], [cx-92, cx+92, top-232]);
  let s = `<rect x="${x0}" y="${top}" width="${x1-x0}" height="340" rx="10" fill="#62E0CB" stroke="#1F8E80" stroke-width="5"/>`;
  s += `<rect x="${x0-10}" y="${top-20}" width="${x1-x0+20}" height="26" rx="6" fill="#43D3BE" stroke="#1F8E80" stroke-width="4"/>` + snowLine(`M ${x0-6} ${top-22} L ${cx-90} ${top-22} M ${cx+90} ${top-22} L ${x1+6} ${top-22}`);
  PERCH.push([x0+30, top-22, 'roof'], [x1-30, top-22, 'roof']);
  // kuglemaskinen på taget
  s += `<path d="M ${cx-66} ${top-20} L ${cx+66} ${top-20} L ${cx+52} ${top-52} L ${cx-52} ${top-52} Z" fill="#E0233F" stroke="#9C1530" stroke-width="4"/>`;
  s += `<circle cx="${cx}" cy="${top-140}" r="92" fill="#E9FFFB" fill-opacity=".9" stroke="#1F8E80" stroke-width="5"/>`;
  s += [[-44,-24,'#FF5FA8'],[0,-50,'#FFE27A'],[42,-20,'#7B5CFF'],[-22,20,'#6FA8FF'],[26,26,'#FF9A4D'],[-58,24,'#43D3BE'],[56,18,'#FF3D8F'],[4,-4,'#B79BFF'],[-8,54,'#9BE36A'],[38,56,'#FFC02E'],[-40,58,'#FF8FC7']].map(([dx,dy,c])=>`<circle cx="${cx+dx}" cy="${top-140+dy}" r="22" fill="${c}" stroke="#33204F" stroke-opacity=".2" stroke-width="2"/><path d="M ${cx+dx-18} ${top-140+dy} Q ${cx+dx} ${top-146+dy} ${cx+dx+18} ${top-140+dy}" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".7"/>`).join('');
  s += `<path d="M ${cx-56} ${top-200} Q ${cx-40} ${top-224} ${cx-14} ${top-226}" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" fill="none" opacity=".75"/>`;
  s += cWin(x0+40, top+30, 70, 60, { r:30, cross:false, frame:'#E9FFFB', curtain:'#FFE27A' }) + cWin(x1-110, top+30, 70, 60, { r:30, cross:false, frame:'#E9FFFB', curtain:'#FFE27A' });
  s += awning(x0+10, x1-10, top+120, 46, '#FF5FA8');
  // vindue fuldt af overraskelseskugler
  const bx = x0+24, bw = 160;
  let balls = ''; const R = rng(7); const cols = ['#FF5FA8','#7B5CFF','#FFE27A','#43D3BE','#FF9A4D','#6FA8FF','#B79BFF','#FF3D8F'];
  for (let row = 0; row < 4; row++) for (let i = 0; i < 5 - (row%2); i++){ const x = bx + 20 + i*32 + (row%2)*16, y = G - 34 - row*30, c = cols[Math.floor(R()*cols.length)];
    balls += `<circle cx="${x}" cy="${y}" r="17" fill="${c}" stroke="#33204F" stroke-opacity=".25" stroke-width="2"/><path d="M ${x-17} ${y-1} Q ${x} ${y-6} ${x+17} ${y-1} L ${x+17} ${y+5} Q ${x} ${y} ${x-17} ${y+5} Z" fill="#FFFFFF" opacity=".8"/>`; }
  s += `<rect x="${bx-8}" y="${G-192}" width="${bw+16}" height="180" rx="12" fill="#E9FFFB" stroke="#1F8E80" stroke-width="5"/><rect x="${bx}" y="${G-184}" width="${bw}" height="164" rx="8" fill="#FFFFFF"/>${balls}<path d="M ${bx+10} ${G-110} L ${bx+60} ${G-176}" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity=".6"/>`;
  s += `<text x="${bx+bw/2}" y="${G-150}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="24" fill="#E0457A">10 ★</text>`;
  LITS.push([bx, G-184, bw, 164, 8, 'shop']);
  s += cDoor(x1-60, 74, 150, '#FFFFFF', { frame:'#43D3BE' });
  s += xmasString(x0, x1, top+112, 14);
  return placeG('kugler', 'Kuglebutikken', false, s + sign(cx, top-266, 250, 'Kuglebutikken', '#FFFFFF', '#1F8E80', 26));
}
function bSquare(){
  // torvet: hæk, springvand, bænk, isvogn (vognen er levende og tegnes separat)
  const x0 = 1470, x1 = 1900, fx = 1690;
  let s = `<rect x="${x0}" y="${G-56}" width="${x1-x0}" height="60" rx="26" fill="${CM.season==='vinter'?'#5E9C74':'#4FA866'}"/><rect x="${x0}" y="${G-56}" width="${x1-x0}" height="60" rx="26" fill="url(#hedge)"/>` + snowLine(`M ${x0+20} ${G-56} L ${x1-20} ${G-56}`);
  s += `<path d="M ${x0} ${G} L ${x1} ${G} L ${x1} ${G+120} L ${x0} ${G+120} Z" fill="url(#cobble)" opacity=".9"/>`;
  if (CM.xmas){
    s += `<g id="xmasTree" transform="translate(1560,${G+30})"><rect x="-12" y="-40" width="24" height="44" fill="#8A5A35"/>${[[0,-300,70],[0,-220,100],[0,-140,128]].map(([x,y,w])=>`<path d="M ${-w} ${y+100} L 0 ${y} L ${w} ${y+100} Z" fill="#2E8B57" stroke="#1E6B42" stroke-width="4" stroke-linejoin="round"/>`).join('')}<polygon points="${star5pts(0,-306,26,11)}" fill="#FFE27A" stroke="#C99A12" stroke-width="3"/></g>`;
    XMAS.push(['tree', 1560, G+30]);
  } else s += `<g transform="translate(1560,${G+40})"><rect x="-70" y="-46" width="140" height="12" rx="5" fill="#B9763F"/><rect x="-70" y="-74" width="140" height="10" rx="5" fill="#B9763F"/><rect x="-62" y="-34" width="8" height="34" fill="#6B5A8E"/><rect x="54" y="-34" width="8" height="34" fill="#6B5A8E"/></g>`;
  // springvand
  s += `<g id="fountain" data-tap="fountain"><ellipse cx="${fx}" cy="${G+52}" rx="130" ry="30" fill="#B7A6D9"/><path d="M ${fx-130} ${G+52} L ${fx-130} ${G+20} Q ${fx} ${G-10} ${fx+130} ${G+20} L ${fx+130} ${G+52} Z" fill="#CFC1EC" stroke="#8D7CB8" stroke-width="4"/>`;
  s += `<ellipse cx="${fx}" cy="${G+20}" rx="118" ry="22" fill="${CM.season==='vinter'?'#E6F2FF':'#7FD2FF'}" stroke="#8D7CB8" stroke-width="4"/>`;
  s += `<rect x="${fx-14}" y="${G-80}" width="28" height="100" fill="#CFC1EC" stroke="#8D7CB8" stroke-width="4"/><ellipse cx="${fx}" cy="${G-80}" rx="56" ry="14" fill="#CFC1EC" stroke="#8D7CB8" stroke-width="4"/>`;
  if (CM.season !== 'vinter'){
    s += `<g id="jets" fill="none" stroke="#9FE0FF" stroke-width="6" stroke-linecap="round" opacity=".9">` + [-1,1].map(d=>`<path d="M ${fx} ${G-96} Q ${fx+d*60} ${G-200} ${fx+d*100} ${G+10}" stroke-dasharray="16 12"><animate attributeName="stroke-dashoffset" values="56;0" dur=".6s" repeatCount="indefinite"/></path><path d="M ${fx} ${G-90} Q ${fx+d*30} ${G-160} ${fx+d*50} ${G-80}" stroke-dasharray="10 10"><animate attributeName="stroke-dashoffset" values="40;0" dur=".5s" repeatCount="indefinite"/></path>`).join('') + `<path d="M ${fx} ${G-90} L ${fx} ${G-170}" stroke-dasharray="12 10"><animate attributeName="stroke-dashoffset" values="44;0" dur=".5s" repeatCount="indefinite"/></path></g>`;
    s += [-60,0,60].map((dx,i)=>`<ellipse cx="${fx+dx}" cy="${G+20}" rx="12" ry="4" fill="none" stroke="#FFFFFF" stroke-width="2"><animate attributeName="rx" values="4;22" dur="1.4s" begin="${i*0.45}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.4s" begin="${i*0.45}s" repeatCount="indefinite"/></ellipse>`).join('');
  } else s += `<ellipse cx="${fx}" cy="${G-86}" rx="50" ry="10" fill="#FFFFFF"/><path d="M ${fx-110} ${G+16} Q ${fx} ${G+4} ${fx+110} ${G+16}" stroke="#FFFFFF" stroke-width="6" fill="none"/>`;
  s += `</g>`;
  return s;
}
function bCafe(){
  const x0 = 1930, x1 = 2230, cx = 2080, top = G - 400;
  BLD.push([x0-20, x1+20, top], [x0+30, x1-30, top-60]);
  let s = `<rect x="${x0}" y="${top}" width="${x1-x0}" height="400" rx="10" fill="#FFE9B8" stroke="#C99A12" stroke-width="5"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="400" fill="url(#brick)" opacity=".7"/>`;
  const roof = `M ${x0-20} ${top+4} L ${x0+30} ${top-60} L ${x1-30} ${top-60} L ${x1+20} ${top+4} Z`;
  s += `<path d="${roof}" fill="#B9650E" stroke="#7E4307" stroke-width="5" stroke-linejoin="round"/><path d="${roof}" fill="url(#tiles)"/>` + snowLine(`M ${x0-16} ${top} L ${x0+30} ${top-62} L ${x1-30} ${top-62} L ${x1+16} ${top}`);
  PERCH.push([x0+60, top-62, 'roof'], [x1-70, top-62, 'roof']);
  s += `<g transform="translate(${cx},${top-110})"><path d="M -44 0 L 44 0 L 34 50 L -34 50 Z" fill="#FF9A4D" stroke="#B9650E" stroke-width="4"/><path d="M -50 0 C -54 -44, 54 -44, 50 0 Z" fill="#FFC1DC" stroke="#E0457A" stroke-width="4"/><circle cx="0" cy="-40" r="11" fill="#E0233F"/></g>`;
  s += cWin(x0+40, top+50, 80, 90, { curtain:'#FF8FC7', box:'#B9650E' }) + cWin(x1-120, top+50, 80, 90, { curtain:'#FF8FC7', box:'#B9650E' });
  s += awning(x0+10, x1-10, G-210, 44, '#FF8FC7');
  s += `<rect x="${x0+24}" y="${G-150}" width="150" height="130" rx="10" fill="#FFF6E2" stroke="#C99A12" stroke-width="5"/>` + [[x0+60,G-50,'#FF5FA8'],[x0+100,G-50,'#FFE27A'],[x0+140,G-50,'#B79BFF']].map(([x,y,c])=>`<path d="M ${x-16} ${y} L ${x+16} ${y} L ${x+12} ${y-20} L ${x-12} ${y-20} Z" fill="#FF9A4D"/><circle cx="${x}" cy="${y-26}" r="15" fill="${c}"/>`).join('');
  LITS.push([x0+24, G-150, 150, 130, 10, 'shop']);
  s += `<path d="M ${x1-90} ${G} L ${x1-90} ${G-140} L ${x1-24} ${G-140} L ${x1-24} ${G} Z" fill="#B9650E" stroke="#7E4307" stroke-width="4"/>`;
  s += [x0+20, x1-10].map(x=>`<g transform="translate(${x},${G+34})"><rect x="-3" y="-34" width="6" height="34" fill="#6B5A8E"/><ellipse cx="0" cy="-36" rx="26" ry="6" fill="#FFFFFF" stroke="#C99A12" stroke-width="2"/></g>`).join('');
  s += scaffold(x0+10, x1-10, top-40, G) + soonSign(cx, G-120) + xmasString(x0, x1, G-214, 16);
  return placeG('cafe', 'Caféen', true, s + sign(cx, top-196, 170, 'Caféen'));
}
function bBusStop(){
  const x = 2350;
  let s = `<g id="busStop"><rect x="${x-90}" y="${G-200}" width="180" height="14" rx="6" fill="#4B3F6B"/>${snowLine(`M ${x-88} ${G-204} L ${x+88} ${G-204}`)}`;
  s += `<rect x="${x-84}" y="${G-186}" width="10" height="196" fill="#4B3F6B"/><rect x="${x+74}" y="${G-186}" width="10" height="196" fill="#4B3F6B"/>`;
  s += `<rect x="${x-74}" y="${G-186}" width="148" height="150" fill="#CFE9FF" opacity=".5" stroke="#FFFFFF" stroke-width="3"/><rect x="${x+16}" y="${G-170}" width="46" height="66" rx="4" fill="#FFFFFF" stroke="#6FA8FF" stroke-width="3"/><path d="M ${x+22} ${G-156} L ${x+56} ${G-156} M ${x+22} ${G-144} L ${x+50} ${G-144} M ${x+22} ${G-132} L ${x+54} ${G-132} M ${x+22} ${G-120} L ${x+46} ${G-120}" stroke="#9C95B5" stroke-width="3"/>`;
  s += `<rect x="${x-64}" y="${G-60}" width="100" height="12" rx="5" fill="#FFC02E"/><rect x="${x-58}" y="${G-48}" width="8" height="50" fill="#4B3F6B"/><rect x="${x+22}" y="${G-48}" width="8" height="50" fill="#4B3F6B"/>`;
  s += `<rect x="${x+108}" y="${G-250}" width="10" height="268" fill="#6B5A8E"/><circle cx="${x+113}" cy="${G-262}" r="32" fill="#FFC02E" stroke="#C98A00" stroke-width="4"/><text x="${x+113}" y="${G-251}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="30" fill="#33204F">8</text>`;
  s += `<rect x="${x+86}" y="${G-222}" width="54" height="22" rx="5" fill="#33204F"/><text x="${x+113}" y="${G-205}" text-anchor="middle" font-family="${FONT_C}" font-weight="600" font-size="15" fill="#FFE27A">BUS</text></g>`;
  PERCH.push([x-40, G-206, 'roof'], [x+50, G-206, 'roof']);
  return s;
}
function bZoo(){
  const x0 = 2490, x1 = 2830, cx = 2655;
  let s = cTree(x0+40, 0.9) + cTree(x1-40, 0.95);
  s += `<g id="giraffe"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -14;0 0;0 0" keyTimes="0;.15;.3;1" dur="6s" repeatCount="indefinite"/>`
     + `<path d="M ${cx+70} ${G-60} L ${cx+66} ${G-330} L ${cx+92} ${G-330} L ${cx+96} ${G-60} Z" fill="#FFC75A" stroke="#C98A00" stroke-width="4"/>`
     + [[cx+76,G-120],[cx+84,G-180],[cx+74,G-240],[cx+86,G-290]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#C98A00" opacity=".6"/>`).join('')
     + `<ellipse cx="${cx+96}" cy="${G-350}" rx="40" ry="26" fill="#FFC75A" stroke="#C98A00" stroke-width="4"/><path d="M ${cx+70} ${G-372} L ${cx+66} ${G-398} M ${cx+90} ${G-374} L ${cx+90} ${G-400}" stroke="#C98A00" stroke-width="6" stroke-linecap="round"/><circle cx="${cx+66}" cy="${G-400}" r="7" fill="#9C6B00"/><circle cx="${cx+90}" cy="${G-402}" r="7" fill="#9C6B00"/>`
     + `<circle cx="${cx+92}" cy="${G-356}" r="5" fill="#33204F"/><circle cx="${cx+93}" cy="${G-358}" r="1.8" fill="#FFFFFF"/><ellipse cx="${cx+128}" cy="${G-342}" rx="12" ry="10" fill="#FFE2A6"/></g></g>`;
  s += `<path d="M ${x0+30} ${G} L ${x0+30} ${G-220} Q ${cx} ${G-340} ${x1-30} ${G-220} L ${x1-30} ${G}" fill="none" stroke="#2E7D3A" stroke-width="22" stroke-linecap="round"/>` + snowLine(`M ${x0+40} ${G-226} Q ${cx} ${G-350} ${x1-40} ${G-226}`);
  s += Array.from({length:11},(_,i)=>`<rect x="${x0+14+i*30}" y="${G-90}" width="16" height="92" rx="7" fill="#FFFFFF" stroke="#9C95B5" stroke-width="2"/>`).join('') + `<rect x="${x0+10}" y="${G-74}" width="${x1-x0-20}" height="10" fill="#FFFFFF" stroke="#9C95B5" stroke-width="2"/>`;
  s += `<g transform="translate(${cx},${G-300})"><circle cx="0" cy="8" r="20" fill="#8A5A35"/>${[[-22,-15],[-8,-24],[8,-24],[22,-15]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#8A5A35"/>`).join('')}</g>`;
  s += soonSign(cx, G-150);
  return placeG('dyr', 'Dyreparken', true, s + sign(cx, G-420, 200, 'Dyreparken'));
}
function bPhoto(){
  const x0 = 2860, x1 = 3160, cx = 3010, top = G - 380;
  BLD.push([x0-10, x1+10, top-22]);
  let s = `<rect x="${x0}" y="${top}" width="${x1-x0}" height="380" rx="10" fill="#6FA8FF" stroke="#2F6FE0" stroke-width="5"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="380" fill="url(#siding)"/>`;
  s += `<rect x="${x0-10}" y="${top-22}" width="${x1-x0+20}" height="26" rx="6" fill="#4C8BF0" stroke="#2F6FE0" stroke-width="4"/>` + snowLine(`M ${x0-6} ${top-24} L ${x1+6} ${top-24}`);
  PERCH.push([x0+40, top-24, 'roof'], [x1-40, top-24, 'roof']);
  s += `<g transform="translate(${cx},${top+100})"><rect x="-70" y="-44" width="140" height="96" rx="16" fill="#33204F"/><rect x="-30" y="-62" width="60" height="24" rx="6" fill="#33204F"/><circle cx="0" cy="4" r="34" fill="#BDE4FF" stroke="#FFFFFF" stroke-width="7"/><circle cx="-8" cy="-4" r="9" fill="#FFFFFF" opacity=".7"/><circle cx="46" cy="-26" r="8" fill="#FFE27A"><animate attributeName="opacity" values="1;1;.2;1" dur="3s" repeatCount="indefinite"/></circle></g>`;
  s += cWin(x0+30, G-170, 80, 90, { curtain:'#FFFFFF' }) + `<path d="M ${x1-100} ${G} L ${x1-100} ${G-140} L ${x1-34} ${G-140} L ${x1-34} ${G} Z" fill="#2F6FE0" stroke="#1F4FB0" stroke-width="4"/>`;
  s += scaffold(x0+10, x1-10, top-30, G) + soonSign(cx, G-110);
  return placeG('foto', 'Fotostudiet', true, s + sign(cx, top-70, 210, 'Fotostudiet'));
}

/* ---------- baggrunden: bakker og huse længere væk (bevæger sig langsommere = dybde) ---------- */
function farLayer(){
  const [h1, h2] = HILLS[CM.time]; const R = rng(42);
  let s = `<path d="M 0 ${G-150} C 300 ${G-260}, 700 ${G-200}, 1000 ${G-250} C 1400 ${G-320}, 1800 ${G-200}, 2200 ${G-260} C 2600 ${G-320}, 2900 ${G-220}, ${CW} ${G-250} L ${CW} ${G} L 0 ${G} Z" fill="${h1}"/>`;
  if (CM.season === 'vinter') s += `<path d="M 0 ${G-150} C 300 ${G-260}, 700 ${G-200}, 1000 ${G-250} C 1400 ${G-320}, 1800 ${G-200}, 2200 ${G-260} C 2600 ${G-320}, 2900 ${G-220}, ${CW} ${G-250}" fill="none" stroke="#FFFFFF" stroke-width="18" opacity=".8"/>`;
  // mølle på bakken
  const mx = 1250, my = G - 296;
  s += `<g opacity=".85"><path d="M ${mx-22} ${my+70} L ${mx-14} ${my} L ${mx+14} ${my} L ${mx+22} ${my+70} Z" fill="${adj(h1,-0.12)}"/><g transform="translate(${mx},${my+4})"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="14s" repeatCount="indefinite"/>${[0,90,180,270].map(a=>`<rect x="-5" y="-62" width="10" height="58" rx="3" transform="rotate(${a})" fill="${adj(h1,-0.2)}"/>`).join('')}</g><circle r="6" fill="${adj(h1,-0.25)}"/></g></g>`;
  // kirke
  s += `<g opacity=".8" fill="${adj(h1,-0.1)}"><rect x="2320" y="${G-330}" width="40" height="110"/><path d="M 2310 ${G-330} L 2340 ${G-390} L 2370 ${G-330} Z"/><rect x="2290" y="${G-260}" width="120" height="60"/></g>`;
  for (let x = 40; x < CW; x += 120 + R()*140){ if (Math.abs(x - mx) < 80 || Math.abs(x - 2330) < 120) continue;
    const y = G - 200 - R()*60, w = 34 + R()*26, h = 26 + R()*20, c = adj(h1, -0.06 - R()*0.08);
    s += `<g opacity=".85"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><path d="M ${x-5} ${y} L ${x+w/2} ${y-h*0.7} L ${x+w+5} ${y} Z" fill="${adj(c,-0.08)}"/></g>`;
    if (R() < 0.5) s += `<circle cx="${x+w+20}" cy="${y+h-14}" r="${14+R()*8}" fill="${adj(h2,-0.05)}" opacity=".9"/>`; }
  s += `<path d="M 0 ${G-90} C 400 ${G-170}, 800 ${G-110}, 1300 ${G-150} C 1800 ${G-190}, 2300 ${G-110}, ${CW} ${G-160} L ${CW} ${G} L 0 ${G} Z" fill="${h2}"/>`;
  return s;
}
const MID_COLS = ['#F5C6D9','#CFC2F2','#BFE6DD','#F9DDB0','#C9DDF7','#F2C9B8'];
function midLayer(lights){
  const R = rng(99); let s = '', l = '';
  for (let x = -40; x < CW; ){ const w = 130 + R()*90, h = 250 + R()*170, c = MID_COLS[Math.floor(R()*MID_COLS.length)], top = G - h;
    const col = CM.time === 'nat' ? adj(c, -0.25, -0.2) : CM.time === 'aften' ? adj(c, -0.1) : c;
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${col}" stroke="${adj(col,-0.15)}" stroke-width="3"/>`;
    const roofT = R(); if (roofT < 0.5) s += `<path d="M ${x-8} ${top} L ${x+w/2} ${top-60} L ${x+w+8} ${top} Z" fill="${adj(col,-0.15)}"/>` + snowLine(`M ${x-4} ${top-2} L ${x+w/2} ${top-58} L ${x+w+4} ${top-2}`);
    else s += `<rect x="${x-6}" y="${top-14}" width="${w+12}" height="16" fill="${adj(col,-0.15)}"/>` + snowLine(`M ${x-2} ${top-16} L ${x+w+2} ${top-16}`);
    for (let r = 0; r < Math.floor((h-40)/90); r++) for (let k = 0; k < Math.floor((w-20)/55); k++){ const wx = x + 22 + k*55, wy = top + 30 + r*90;
      s += `<rect x="${wx}" y="${wy}" width="30" height="40" rx="4" fill="${adj(col,0.12)}" stroke="${adj(col,-0.15)}" stroke-width="2"/>`;
      if (lights && R() < 0.6) l += `<rect class="ml" x="${wx}" y="${wy}" width="30" height="40" rx="4" fill="#FFD772" opacity="${CM.night ? 0.75 : 0.45}"/>`; }
    x += w + 6 + R()*20; }
  return [s, l];
}

/* ---------- lys, sne, blade, stjerner ---------- */
function lightsLayer(){
  if (!CM.dark) return '';
  const op = CM.night ? 1 : 0.6;
  let s = `<g opacity="${op}">`;
  for (const [x, y, w, h, r, kind] of LITS){ if (kind !== 'shop' && (x * 7 + y) % 10 > 7) continue;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.max(0,(r||8)-3)}" fill="#FFD36E" opacity="${kind==='shop'?0.42:0.5}" filter="url(#glowF)"/>`; }
  for (const [x, y, k] of LAMPS){ const R = k === 'small' ? 50 : 120; s += `<circle cx="${x}" cy="${y}" r="${R}" fill="url(#lampG)"/>`; if (k !== 'small') s += `<path d="M ${x-14} ${y+22} L ${x-90} ${G+120} L ${x+90} ${G+120} L ${x+14} ${y+22} Z" fill="url(#beamG)" opacity=".55"/>`; }
  return s + `</g>`;
}
function xmasLayer(){
  if (!CM.xmas) return '';
  const cols = ['#FF3D3D','#FFE27A','#43D3BE','#6FA8FF','#FF8FC7'];
  let s = '<g>';
  XMAS.forEach((it, j) => {
    if (it[0] === 'tree'){ const [, tx, ty] = it;
      for (let i = 0; i < 18; i++){ const t = i/18, y = ty - 40 - t*250, w = 120*(1-t)*0.95, x = tx + Math.sin(i*2.3)*w*0.8;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${cols[i%5]}"><animate attributeName="opacity" values="1;.35;1" dur="${1+(i%4)*0.3}s" repeatCount="indefinite"/></circle>`; }
      return; }
    const [x0, x1, y, sag] = it, n = Math.round((x1 - x0) / 26);
    for (let i = 1; i < n; i++){ const t = i/n, x = x0 + (x1-x0)*t, yy = y + 4*sag*t*(1-t)*1.0;
      s += `<circle cx="${x.toFixed(1)}" cy="${(yy+5).toFixed(1)}" r="5.5" fill="${cols[(i+j)%5]}"><animate attributeName="opacity" values="1;.3;1" dur="${1.2+((i+j)%3)*0.35}s" repeatCount="indefinite"/></circle>`; } });
  return s + '</g>';
}
function weatherLayer(){
  const R = rng(5); let s = '';
  if (CM.season === 'vinter') for (let i = 0; i < 70; i++){ const x = R()*CW, d = 7 + R()*7, r = 3 + R()*4;
    s += `<circle cx="${x.toFixed(0)}" cy="-10" r="${r.toFixed(1)}" fill="#FFFFFF" opacity=".9"><animate attributeName="cy" values="-10;${CH+10}" dur="${d.toFixed(1)}s" begin="-${(R()*d).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x.toFixed(0)};${(x+30).toFixed(0)};${(x-20).toFixed(0)};${x.toFixed(0)}" dur="${(d*0.7).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }
  if (CM.season === 'efteraar') for (let i = 0; i < 26; i++){ const x = R()*CW, d = 8 + R()*6, c = ['#F28C38','#E0452E','#E8B33A'][i%3];
    s += `<g><animateMotion path="M ${x.toFixed(0)} -20 C ${(x+80).toFixed(0)} 300, ${(x-60).toFixed(0)} 600, ${(x+40).toFixed(0)} ${CH-20}" dur="${d.toFixed(1)}s" begin="-${(R()*d).toFixed(1)}s" repeatCount="indefinite"/><path d="M 0 -9 Q 9 0 0 9 Q -9 0 0 -9 Z" fill="${c}"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="${(2+R()*2).toFixed(1)}s" repeatCount="indefinite"/></path></g>`; }
  if (CM.season === 'foraar' && !CM.dark) for (let i = 0; i < 20; i++){ const x = R()*CW, d = 10 + R()*6;
    s += `<g><animateMotion path="M ${x.toFixed(0)} -20 C ${(x+120).toFixed(0)} 300, ${(x-40).toFixed(0)} 600, ${(x+90).toFixed(0)} ${CH-20}" dur="${d.toFixed(1)}s" begin="-${(R()*d).toFixed(1)}s" repeatCount="indefinite"/><ellipse rx="6" ry="4" fill="#FFC1DC"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="3s" repeatCount="indefinite"/></ellipse></g>`; }
  if ((CM.season === 'sommer' || CM.season === 'foraar') && !CM.dark){ // sommerfugle ved blomsterne
    [[60,G-60],[420,G+10],[1530,G-40],[1880,G-30],[2560,G-60],[2900,G+10]].forEach(([x,y],i) => { const c = ['#FF8FC7','#FFE27A','#B79BFF','#7FD8FF'][i%4];
      s += `<g><animateMotion path="M ${x} ${y} C ${x+80} ${y-90}, ${x+160} ${y+30}, ${x+60} ${y-40} C ${x-20} ${y-100}, ${x-80} ${y+20}, ${x} ${y} Z" dur="${9+i}s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="scale" values="1 1;0.25 1;1 1" dur=".28s" repeatCount="indefinite"/><ellipse cx="-8" cy="-4" rx="9" ry="12" fill="${c}"/><ellipse cx="8" cy="-4" rx="9" ry="12" fill="${c}"/><ellipse cx="-6" cy="8" rx="6" ry="7" fill="${adj(c,-0.1)}"/><ellipse cx="6" cy="8" rx="6" ry="7" fill="${adj(c,-0.1)}"/></g><rect x="-2" y="-10" width="4" height="22" rx="2" fill="#33204F"/></g>`; }); }
  if (CM.season === 'sommer' && CM.night) for (let i = 0; i < 24; i++){ const x = R()*CW, y = G - 60 - R()*240;
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4" fill="#FFF7A0"><animate attributeName="opacity" values="0;1;0" dur="${(2+R()*2).toFixed(1)}s" begin="${(R()*3).toFixed(1)}s" repeatCount="indefinite"/><animateMotion path="M 0 0 q 20 -30 40 0 t 40 0" dur="${(6+R()*4).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }
  return s;
}
function skyLayer(){
  const [a, b] = SKY[CM.time]; const R = rng(3);
  let s = `<rect width="${CW}" height="${CH}" fill="url(#skyG)"/>`;
  if (CM.night){
    s += Array.from({length:70},()=>{ const x=R()*CW, y=R()*(G-320); return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.5+R()*2.5).toFixed(1)}" fill="#FFFFFF"><animate attributeName="opacity" values="1;.25;1" dur="${(2+R()*3).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }).join('');
    s += `<g transform="translate(2500,130)"><circle r="60" fill="#FFF6D8"/><circle cx="26" cy="-14" r="54" fill="${a}"/><circle r="110" fill="#FFF6D8" opacity=".1"/></g>`;
  } else {
    const sun = CM.time === 'dag' ? [2700, 120] : CM.time === 'aften' ? [2900, G-320] : [400, G-330];
    s += `<circle cx="${sun[0]}" cy="${sun[1]}" r="66" fill="${CM.time==='aften'?'#FFC07A':'#FFF3B0'}"/><circle cx="${sun[0]}" cy="${sun[1]}" r="100" fill="#FFF3B0" opacity=".3"/>`;
  }
  const cl = CM.night ? 0.18 : 0.95;
  s += [[160,120,1],[620,70,1.3],[1100,150,.9],[1500,80,1.1],[1950,130,1.2],[2400,60,1],[2850,160,.9]].map(([x,y,k],i)=>`<g opacity="${cl}"><g transform="translate(${x},${y}) scale(${k})"><ellipse cx="0" cy="0" rx="74" ry="30" fill="#FFFFFF"/><ellipse cx="40" cy="-14" rx="46" ry="32" fill="#FFFFFF"/><ellipse cx="-38" cy="-8" rx="38" ry="25" fill="#FFFFFF"/></g><animateTransform attributeName="transform" type="translate" values="0 0;${60+i*8} 0;0 0" dur="${30+i*5}s" repeatCount="indefinite"/></g>`).join('');
  return s;
}

/* ---------- hele byen ---------- */
function townSvg(){
  CM = cityMood(); LITS = []; LAMPS = []; PERCH = []; XMAS = []; BLD = [];
  const [skyA, skyB] = SKY[CM.time];
  const defs = `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyA}"/><stop offset=".75" stop-color="${skyB}"/></linearGradient>
<linearGradient id="roadG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8AED6"/><stop offset="1" stop-color="#A39ACB"/></linearGradient>
<linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4F4FF"/><stop offset="1" stop-color="#A9D4F5"/></linearGradient>
<radialGradient id="lampG"><stop offset="0" stop-color="#FFF4B8" stop-opacity=".95"/><stop offset=".35" stop-color="#FFE48A" stop-opacity=".45"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>
<linearGradient id="headG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF4B8" stop-opacity=".7"/><stop offset="1" stop-color="#FFF4B8" stop-opacity="0"/></linearGradient>
<linearGradient id="beamG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".7"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></linearGradient>
<filter id="glowF" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
<pattern id="tiles" width="30" height="20" patternUnits="userSpaceOnUse"><path d="M 0 20 Q 7.5 8 15 20 Q 22.5 8 30 20" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="3"/></pattern>
<pattern id="brick" width="64" height="32" patternUnits="userSpaceOnUse"><path d="M 0 1 H 64 M 0 17 H 64 M 16 1 V 17 M 48 17 V 33" stroke="#000" stroke-opacity=".07" stroke-width="2.5" fill="none"/></pattern>
<pattern id="siding" width="40" height="26" patternUnits="userSpaceOnUse"><path d="M 0 25 H 40" stroke="#000" stroke-opacity=".06" stroke-width="3"/></pattern>
<pattern id="hedge" width="40" height="30" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="9" fill="#FFFFFF" opacity=".08"/><circle cx="30" cy="22" r="8" fill="#000" opacity=".06"/></pattern>
<pattern id="cobble" width="44" height="26" patternUnits="userSpaceOnUse"><rect width="44" height="26" fill="#E6DAF2"/><rect x="2" y="2" width="18" height="10" rx="4" fill="#D8CAEA"/><rect x="24" y="2" width="18" height="10" rx="4" fill="#DDD0EE"/><rect x="13" y="15" width="18" height="10" rx="4" fill="#D8CAEA"/></pattern>
<pattern id="pave" width="90" height="46" patternUnits="userSpaceOnUse"><rect width="90" height="46" fill="#F3E8FC"/><path d="M 0 0.5 H 90 M 0.5 0 V 46" stroke="#E2D0F0" stroke-width="3"/></pattern></defs>`;
  const manIds = ['man0','man1','man2','man3'];
  const [mid, midL] = midLayer(CM.dark);
  let s = `<svg id="townSvg" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Byen">${defs}`;
  s += `<g id="skyL">${skyLayer()}</g>`;
  s += `<g id="parFar">${farLayer()}</g><g id="parMid">${mid}</g>`;
  s += `<g id="birdsSky"></g>`;
  // fortov, vej og forkant
  s += `<rect y="${G}" width="${CW}" height="150" fill="url(#pave)"/><rect y="${G}" width="${CW}" height="6" fill="#E2CFF2"/><rect y="${G+138}" width="${CW}" height="14" fill="#D6C6EA"/>`;
  if (CM.season === 'vinter') s += `<rect y="${G+132}" width="${CW}" height="10" fill="#FFFFFF" opacity=".9"/>`;
  s += `<rect y="${ROAD_TOP}" width="${CW}" height="${CH-ROAD_TOP}" fill="url(#roadG)"/>` + Array.from({length:Math.ceil(CW/150)},(_,i)=>`<rect x="${i*150+30}" y="${G+258}" width="80" height="10" rx="5" fill="#FFFFFF" opacity=".75"/>`).join('');
  s += `<g>${[[1640,1],[1680,1],[1720,1],[1760,1]].map(([x])=>'').join('')}</g>`;
  s += `<rect y="${G+322}" width="${CW}" height="10" fill="#D6C6EA"/><rect y="${G+332}" width="${CW}" height="${CH-G-332}" fill="${CM.season==='vinter'?'#F4F8FF':'#8FD68A'}"/>`;
  s += `<g id="bldL">` + cTree(30, 0.85) + bHome() + bNeighbour() + bFashion(manIds) + cLamp(1022) + bBalls() + cTree(1410, 1, 'sqTree') + cLamp(1458) + bSquare() + cLamp(1912) + bCafe() + bBusStop() + bZoo() + bPhoto() + cLamp(3185) + `</g>`;
  // skygge-farve for tiden på dagen (gør alt det faste mørkere om aftenen og natten)
  const sh = SHADE[CM.time];
  if (sh) s += `<rect id="shadeL" width="${CW}" height="${CH}" fill="${sh[0]}" opacity="${sh[1]}" style="mix-blend-mode:multiply" pointer-events="none"/>`;
  s += `<g id="parMidL" pointer-events="none">${midL}</g><g pointer-events="none">${lightsLayer()}${xmasLayer()}</g>`;
  // levende ting: bag dukken (fodgængere, dyr på fortovet), dukken + dyret, foran (biler)
  s += `<g id="lifeBack"></g>`;
  s += `<g id="walker" transform="translate(${walkerX},0)" data-tap="hero"><g id="walkerFlip"><image id="walkerImg" x="-120" y="${FEET_HERO-312}" width="240" height="320" preserveAspectRatio="xMidYMax meet"/></g></g>`;
  s += `<g id="petWalker" transform="translate(${petX},0)" data-tap="pet"><g id="petFlip"><image id="petImg" x="-112.5" y="${FEET_PET-197}" width="225" height="213.75" preserveAspectRatio="xMidYMax meet"/></g></g>`;
  s += `<g id="lifeRoad"></g><g id="lifeFront"></g>`;
  s += `<g id="weatherL" pointer-events="none">${weatherLayer()}</g><g id="bubbles" pointer-events="none"></g>`;
  return s + `</svg>`;
}

/* ================= Liv i byen ================= */
Object.assign(sfx, {
  bark: () => { tone(560, 0.07, 'square', 0.05, 0, 0.6); tone(500, 0.09, 'square', 0.05, 0.13, 0.55); },
  meow: () => { tone(650, 0.14, 'sine', 0.06, 0, 1.6); tone(1040, 0.28, 'sine', 0.05, 0.14, 0.55); },
  honk: () => { [0, 0.22].forEach(d => { tone(392, 0.16, 'square', 0.035, d, 1); tone(466, 0.16, 'square', 0.03, d, 1); }); },
  chirp: () => [0, 0.09, 0.18].forEach(d => tone(2300, 0.06, 'sine', 0.04, d, 1.4)),
  hello: () => [659, 880].forEach((f, i) => tone(f, 0.11, 'triangle', 0.05, i*0.11, 1.08)),
  bell: () => [0, 0.2].forEach(d => tone(1760, 0.22, 'sine', 0.045, d, 1)),
  splash: () => { tone(700, 0.25, 'sine', 0.04, 0, 0.4); tone(1200, 0.2, 'sine', 0.025, 0.05, 0.5); },
  pop: () => tone(500, 0.07, 'square', 0.04, 0, 2.2),
  squeak: () => [0, 0.08, 0.16].forEach(d => tone(1900, 0.05, 'sine', 0.035, d, 1.3)),
  roar: () => tone(220, 0.3, 'sawtooth', 0.03, 0, 0.7),
});
const NS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs = {}, html = ''){ const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; }
const escT = t => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const hitRect = (w, top, bottom) => `<rect x="${-w/2}" y="${top}" width="${w}" height="${bottom-top}" fill="#FFFFFF" fill-opacity="0" pointer-events="all"/>`;
const LIFE = { on: false, last: 0, peds: [], cars: [], birds: [], bubbles: [], extras: [], nextPed: 0, nextCar: 0, nextBus: 0, id: 0 };
const VB_DOLL = '40 60 720 1010';

function viewRange(){
  const st = $('#street'), svg = $('#townSvg'); if (!st || !svg) return [0, CW, 1];
  const sc = svg.getBoundingClientRect().width / CW || 1;
  return [st.scrollLeft / sc, (st.scrollLeft + st.clientWidth) / sc, sc];
}
function parallax(){
  const [l] = viewRange();
  $('#parFar') && $('#parFar').setAttribute('transform', `translate(${(l*0.55).toFixed(1)},0)`);
  const m = `translate(${(l*0.3).toFixed(1)},0)`;
  $('#parMid') && $('#parMid').setAttribute('transform', m); $('#parMidL') && $('#parMidL').setAttribute('transform', m);
  /* lys i baghusene må ikke skinne igennem husene foran */
  const off = l * 0.3;
  for (const r of (LIFE.ml || [])){ const x = r.x + off, hid = BLD.some(([a, b, t]) => x + 30 > a && x < b && r.y + 40 > t); if (hid !== r.hid){ r.hid = hid; r.e.style.display = hid ? 'none' : ''; } }
}
/* taleboble, evt. der følger med en figur */
function bubble(text, pos, ms = 2300, special = false){
  const w = Math.max(80, text.length * 14.5 + 40);
  const g = sv('g', { class:'bubble' }, `<g class="pop"><rect x="${-w/2}" y="-54" width="${w}" height="50" rx="25" fill="#FFFFFF" stroke="${special?'#FFC02E':'#33204F'}" stroke-opacity="${special?1:.22}" stroke-width="${special?5:3}"/><path d="M -11 -6 L 0 12 L 11 -6 Z" fill="#FFFFFF"/><path d="M -11 -5 L 0 12 L 11 -5" fill="none" stroke="${special?'#FFC02E':'#33204F'}" stroke-opacity="${special?1:.22}" stroke-width="3"/><text y="-21" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="27" fill="#33204F">${escT(text)}</text></g>`);
  $('#bubbles').append(g);
  const b = { g, pos, until: performance.now() + ms };
  const place = () => { let [x, y] = b.pos(); const [l, r] = viewRange(); x = Math.max(l + w/2 + 8, Math.min(r - w/2 - 8, x)); g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); };
  b.place = place; place(); LIFE.bubbles.push(b);
  return b;
}

/* ---------- fodgængere, hundeluftere og børn på løbehjul ---------- */
const GREET = ['Hej!', 'Hej med dig!', 'Hejsa!', 'Flot tøj!', 'Godt hår!', 'Hej hej!'];
const PET_SAY = { kat:'Mjav!', hund:'Vov vov!', kanin:'Snøf snøf!', enhjoerning:'Iiihh!', bjoern:'Brum!', drage:'Rawr!' };
const PET_SND = { kat:'meow', hund:'bark', kanin:'squeak', enhjoerning:'chirp', bjoern:'roar', drage:'roar' };
const scooterSvg = c => `<g><path d="M -46 -8 L 40 -8" stroke="${c}" stroke-width="10" stroke-linecap="round"/><path d="M 40 -8 L 52 -112 M 38 -112 L 66 -112" stroke="#6B5A8E" stroke-width="7" stroke-linecap="round"/>${[-40, 46].map(x => `<g transform="translate(${x},4)"><circle r="12" fill="#33204F"/><circle r="5" fill="#FFFFFF"/></g>`).join('')}</g>`;
function spawnPed(where){
  const [l, r] = viewRange();
  const heroFig = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0];
  const others = figures.filter(f => !heroFig || f.id !== heroFig.id);
  let g;
  if (others.length && Math.random() < 0.2 && !LIFE.peds.some(p => p.own)){ const f = pick(others); g = { name: f.name, st: fixState(clone(f.st)), own: true }; }
  else g = randomGuest(LIFE.peds.map(p => p.name));
  const kind = !g.own && Math.random() < 0.15 ? 'scooter' : 'walk';
  const hasDog = kind === 'walk' && (g.own ? g.st.pet.kind !== 'ingen' : Math.random() < 0.4) && !calm;
  const dir = where === 'left' ? 1 : where === 'right' ? -1 : (Math.random() < 0.5 ? 1 : -1);
  const s = kind === 'scooter' ? 0.6 : PED_S;
  const x = where === 'left' ? l - 200 : where === 'right' ? r + 200 : l + 120 + Math.random() * Math.max(10, r - l - 240);
  const p = { id: ++LIFE.id, name: g.name, st: g.st, own: g.own, kind, s, dir, x, v: kind === 'scooter' ? 0.2 : 0.055 + Math.random()*0.02, pauseUntil: 0, nextPause: performance.now() + 4000 + Math.random()*8000, greeting: 0, dog: null };
  p.spr = { walk: svgUrl(renderDoll(p.st, { viewBox: VB_DOLL, anim: !calm, walk: kind === 'walk', idle: kind !== 'walk', pet: false })), idle: kind === 'walk' ? svgUrl(renderDoll(p.st, { viewBox: VB_DOLL, anim: !calm, idle: true, pet: false })) : null };
  const feet = FEET_PED + (kind === 'scooter' ? -14 : 0);
  p.g = sv('g', { 'data-tap':'ped', 'data-id': p.id, transform:`translate(${x},0)` },
    `<g class="pf">${kind === 'scooter' ? `<g transform="translate(0,${FEET_PED})">${scooterSvg(pick(['#FF5FA8','#43D3BE','#FFC02E','#7B5CFF']))}</g>` : ''}<image x="${-120*s}" y="${feet - 312*s}" width="${240*s}" height="${320*s}" href="${p.spr.walk}" pointer-events="none"/></g>`
    + hitRect(110*s, feet - 300*s, feet) + (g.own ? `<g transform="translate(0,${feet - 330*s})"><polygon points="${star5pts(0,0,18,8)}" fill="#FFE27A" stroke="#C99A12" stroke-width="3"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="3s" repeatCount="indefinite"/></polygon></g>` : ''));
  p.img = p.g.querySelector('image'); p.flip = p.g.querySelector('.pf');
  if (hasDog){
    const pet = clone(g.own ? g.st.pet : g.st.pet); if (!g.own && Math.random() < 0.6) pet.kind = pick(['hund','hund','kat']);
    const ps = s, quad = !!QUAD[pet.kind];
    const st2 = clone(g.st); st2.pet = pet;
    const d = { kind: pet.kind, quad, s: ps, x: x + dir * 92 * s, walk: svgUrl(renderDoll(st2, { petOnly: true, petMode: 'walk', viewBox: PET_TOWN_VB, anim: !calm })), sit: svgUrl(renderDoll(st2, { petOnly: true, viewBox: PET_TOWN_VB, anim: !calm })) };
    const fd = FEET_PED + 12;
    d.g = sv('g', { 'data-tap':'dog', 'data-id': p.id }, `<g class="pf"><image x="${-112.5*ps}" y="${fd - 197*ps}" width="${225*ps}" height="${213.75*ps}" href="${d.walk}" pointer-events="none"/></g>` + hitRect(90*ps, fd - 120*ps, fd));
    d.img = d.g.querySelector('image'); d.flip = d.g.querySelector('.pf'); d.feet = fd;
    d.leash = sv('path', { fill:'none', stroke: adj(g.st.top.a, -0.2), 'stroke-width': 3.5, 'stroke-linecap':'round', 'pointer-events':'none' });
    p.dog = d;
  }
  const layer = $('#lifeBack');
  if (p.dog){ layer.append(p.dog.leash); }
  layer.append(p.g); if (p.dog) layer.append(p.dog.g);
  setPedDir(p);
  LIFE.peds.push(p);
  if (p.own) setTimeout(() => { if (p.g.isConnected){ sfx.magic(); bubble('Hej! Det er mig, ' + p.name + '!', () => [p.x, FEET_PED - 330*p.s - 30], 3200, true); } }, 1600);
  return p;
}
function setPedDir(p){ const t = p.dir < 0 ? 'scale(-1,1)' : ''; p.flip.setAttribute('transform', t); if (p.dog) p.dog.flip.setAttribute('transform', t); }
function pedState(p, moving){
  if (p.kind !== 'walk') return;
  const want = moving ? p.spr.walk : p.spr.idle;
  if (p.img.getAttribute('href') !== want && !p.greeting) p.img.setAttribute('href', want);
  if (p.dog){ const dw = moving ? p.dog.walk : p.dog.sit; if (p.dog.img.getAttribute('href') !== dw) p.dog.img.setAttribute('href', dw); }
}
function tickPeds(dt, now){
  const [l, r] = viewRange();
  for (const p of LIFE.peds.slice()){
    const paused = now < p.pauseUntil || now < p.greeting;
    if (!paused && now > p.nextPause && p.kind === 'walk' && p.x > l + 100 && p.x < r - 100){ p.pauseUntil = now + 1800 + Math.random()*2500; p.nextPause = now + 9000 + Math.random()*9000; }
    const moving = !(now < p.pauseUntil || now < p.greeting) && !calm;
    pedState(p, moving);
    if (moving) p.x += p.dir * p.v * dt;
    p.g.setAttribute('transform', `translate(${p.x.toFixed(1)},0)`);
    if (p.dog){ const d = p.dog, target = p.x + p.dir * 92 * p.s; d.x += (target - d.x) * Math.min(1, dt / 120);
      d.g.setAttribute('transform', `translate(${d.x.toFixed(1)},0)`);
      const hx = p.x + p.dir * 27 * (p.s / 0.78), hy = FEET_PED - 64 * (p.s / 0.78);
      const cx = d.x + (d.quad && moving ? p.dir * 28 * d.s / 0.78 : 0), cy = d.feet - (d.quad && moving ? 29 : 50) * d.s / 0.78;
      d.leash.setAttribute('d', `M ${hx.toFixed(1)} ${hy.toFixed(1)} Q ${((hx+cx)/2).toFixed(1)} ${(Math.max(hy, cy) + 22).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`); }
    if (p.x < -260 || p.x > CW + 260 || (p.dir > 0 && p.x > r + 320) || (p.dir < 0 && p.x < l - 320)){
      p.g.remove(); if (p.dog){ p.dog.g.remove(); p.dog.leash.remove(); } LIFE.peds.splice(LIFE.peds.indexOf(p), 1); }
  }
  const want = CM.night ? 2 : Math.max(2, Math.min(5, Math.round((r - l) / 520)));
  if (!calm && LIFE.peds.length < want && now > LIFE.nextPed){ LIFE.nextPed = now + 1500 + Math.random()*3500; spawnPed(Math.random() < 0.5 ? 'left' : 'right'); }
}
function greetPed(p){
  const now = performance.now(); if (now < p.greeting) return;
  p.greeting = now + 2900; sfx.hello();
  if (p.kind === 'walk'){
    p.spr.greet = p.spr.greet || svgUrl(renderDoll(p.st, { viewBox: VB_DOLL, anim: !calm, greet: true, pet: false }));
    p.img.setAttribute('href', p.spr.greet); setTimeout(() => { p.greeting = 0; pedState(p, true); }, 2900);
  } else sfx.bell();
  const say = p.own ? 'Hej! Det er mig, ' + p.name + '!' : Math.random() < 0.35 ? 'Hej, jeg hedder ' + p.name + '!' : pick(GREET);
  bubble(say, () => [p.x, FEET_PED - 330*p.s - (p.own ? 30 : 0)], 2600, p.own);
}

/* ---------- biler og bussen ---------- */
const CAR_COLS = ['#FF5FA8','#43D3BE','#FFC02E','#7B5CFF','#6FA8FF','#FF9A4D','#E0233F','#9BE36A','#FFFFFF'];
const wheel = (x, r = 19) => `<g transform="translate(${x},${-r})"><circle r="${r}" fill="#33204F"/><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur=".45s" repeatCount="indefinite"/><circle r="${r*0.5}" fill="#D8D2E8"/><path d="M ${-r*0.5} 0 L ${r*0.5} 0 M 0 ${-r*0.5} L 0 ${r*0.5}" stroke="#8E86A8" stroke-width="3"/></g></g>`;
function carSvg(type, c){
  const d = adj(c, -0.28), hair = pick(HAIR), skin = pick(SKIN.slice(0, 12));
  const head = (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="${skin}"/><path d="M ${x-16} ${y-2} Q ${x} ${y-24} ${x+16} ${y-2} Q ${x+8} ${y-10} ${x-16} ${y-2} Z" fill="${hair}"/><circle cx="${x+6}" cy="${y-1}" r="2.4" fill="#33204F"/>`;
  const lights = CM.dark ? `<path d="M 100 -40 L 330 -70 L 330 10 Z" fill="url(#headG)"/>` : '';
  if (type === 'bus'){
    let s = lights.replace('100 -40', '214 -50');
    s += `<rect x="-210" y="-150" width="424" height="126" rx="26" fill="#FFC02E" stroke="#C98A00" stroke-width="5"/><rect x="-210" y="-60" width="424" height="18" fill="#FF8A2E"/>`;
    for (let i = 0; i < 6; i++){ const wx = -190 + i*58; if (i === 3) continue; s += `<rect x="${wx}" y="-134" width="46" height="46" rx="8" fill="url(#glassG)"/>`; if (i % 2 === 0) s += head(wx + 23, -98); }
    s += `<g class="busdoor"><rect x="-16" y="-136" width="26" height="110" fill="#B9DDF5" stroke="#C98A00" stroke-width="3"/><rect x="12" y="-136" width="26" height="110" fill="#B9DDF5" stroke="#C98A00" stroke-width="3"/></g>`;
    s += `<rect x="160" y="-134" width="42" height="70" rx="8" fill="url(#glassG)"/>${head(176, -96)}<rect x="-200" y="-168" width="110" height="22" rx="6" fill="#33204F"/><text x="-145" y="-151" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="17" fill="#FFE27A">8 Byen</text>`;
    s += `<circle cx="206" cy="-44" r="7" fill="#FFF3B0"/><rect x="-212" y="-50" width="8" height="14" rx="3" fill="#E0233F"/>` + wheel(-140, 24) + wheel(140, 24);
    return s;
  }
  if (type === 'van'){
    return lights + `<path d="M -100 -24 L -100 -126 Q -100 -134 -90 -134 L 50 -134 Q 70 -134 82 -110 L 100 -70 Q 106 -60 106 -40 L 106 -24 Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/><path d="M 48 -122 L 70 -122 L 92 -76 L 48 -76 Z" fill="url(#glassG)"/>${head(64,-92)}<rect x="-86" y="-116" width="110" height="40" rx="8" fill="url(#glassG)" opacity=".9"/><circle cx="102" cy="-48" r="6" fill="#FFF3B0"/><rect x="-104" y="-56" width="7" height="14" rx="3" fill="#E0233F"/>` + wheel(-58) + wheel(64);
  }
  if (type === 'mini'){
    return lights.replace('100 -40', '70 -36') + `<path d="M -72 -22 Q -80 -60 -50 -66 Q -30 -104 10 -104 Q 50 -104 62 -66 Q 82 -60 76 -22 Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/><path d="M -34 -70 Q -20 -96 6 -96 L 6 -70 Z M 14 -96 Q 42 -96 52 -70 L 14 -70 Z" fill="url(#glassG)"/>${head(30,-78)}<circle cx="70" cy="-40" r="6" fill="#FFF3B0"/>` + wheel(-42, 17) + wheel(46, 17);
  }
  return lights + `<path d="M -96 -24 Q -102 -52 -72 -56 L -50 -58 Q -28 -98 12 -98 L 42 -98 Q 66 -98 80 -58 L 92 -54 Q 106 -50 104 -24 Z" fill="${c}" stroke="${d}" stroke-width="4" stroke-linejoin="round"/><path d="M -40 -62 Q -24 -90 6 -90 L 6 -62 Z M 14 -90 L 38 -90 Q 58 -90 68 -62 L 14 -62 Z" fill="url(#glassG)"/>${head(40,-72)}<rect x="-14" y="-50" width="16" height="5" rx="2" fill="${d}"/><circle cx="98" cy="-40" r="6" fill="#FFF3B0"/><rect x="-100" y="-46" width="7" height="13" rx="3" fill="#E0233F"/>` + wheel(-54) + wheel(58);
}
const CAR_LEN = { bil:210, van:210, mini:160, bus:430 };
function spawnCar(type){
  const [l, r] = viewRange();
  const far = type === 'bus' ? true : Math.random() < 0.5, dir = far ? 1 : -1;
  const x = far ? l - 300 : r + 300, len = CAR_LEN[type];
  if (LIFE.cars.some(c => c.far === far && Math.abs(c.x - x) < (c.len + len) / 2 + 120)) return null;
  const vmax = type === 'bus' ? 0.2 : 0.22 + Math.random()*0.12;
  const c = { type, far, dir, x, len, v: vmax, vmax, stopped: 0, served: type !== 'bus' };
  c.g = sv('g', { 'data-tap':'car', transform:`translate(${x},${far ? LANE_FAR : LANE_NEAR})` }, `<g${dir < 0 ? ' transform="scale(-1,1)"' : ''}>${carSvg(type, pick(CAR_COLS))}</g>`);
  (far ? $('#lifeRoad') : $('#lifeFront')).append(c.g);
  c.door = c.g.querySelector('.busdoor');
  LIFE.cars.push(c); return c;
}
const BUS_STOP_X = 2346;
function tickCars(dt, now){
  const [l, r] = viewRange();
  for (const c of LIFE.cars.slice()){
    let target = c.vmax;
    const ahead = LIFE.cars.filter(o => o !== c && o.far === c.far && (o.x - c.x) * c.dir > 0).sort((a, b) => (a.x - c.x) * c.dir - (b.x - c.x) * c.dir)[0];
    if (ahead){ const gap = (ahead.x - c.x) * c.dir - (ahead.len + c.len) / 2; if (gap < 160) target = Math.min(target, ahead.v * (gap < 60 ? 0 : 1)); }
    if (c.type === 'bus' && !c.served){
      const dist = (BUS_STOP_X - c.x) * c.dir;
      if (dist > 0) target = Math.min(target, Math.sqrt(2 * 0.00012 * dist));
      if (dist <= 1.5 && !c.stopped){ c.stopped = now + 4800; c.v = 0; target = 0; c.door && c.door.classList.add('open');
        if (Math.random() < 0.7 && !CM.night) setTimeout(() => { if (LIFE.on){ const p = spawnPed('mid'); p.x = BUS_STOP_X + 20; p.dir = Math.random() < 0.5 ? 1 : -1; setPedDir(p); } }, 1400); }
      if (c.stopped){ target = 0; if (now > c.stopped - 900) c.door && c.door.classList.remove('open'); if (now > c.stopped){ c.served = true; } }
    }
    c.v += Math.max(-0.0008 * dt, Math.min(0.0003 * dt, target - c.v));
    if (c.v < 0) c.v = 0;
    c.x += c.dir * c.v * dt;
    c.g.setAttribute('transform', `translate(${c.x.toFixed(1)},${c.far ? LANE_FAR : LANE_NEAR})`);
    if ((c.dir > 0 && c.x > r + 400) || (c.dir < 0 && c.x < l - 400) || c.x < -500 || c.x > CW + 500){ c.g.remove(); LIFE.cars.splice(LIFE.cars.indexOf(c), 1); }
  }
  if (calm) return;
  if (now > LIFE.nextBus && !LIFE.cars.some(c => c.type === 'bus')){ if (spawnCar('bus')) LIFE.nextBus = now + 28000 + Math.random()*22000; }
  const cars = LIFE.cars.filter(c => c.type !== 'bus').length;
  if (now > LIFE.nextCar && cars < (CM.night ? 1 : 3)){ LIFE.nextCar = now + 2500 + Math.random()*5000; spawnCar(pick(['bil','bil','mini','van'])); }
}

/* ---------- fugle på tagene og duer ved springvandet ---------- */
function birdSvg(c, pigeon){
  const k = pigeon ? 1.25 : 1;
  return `<g transform="scale(${k})"><g class="perched"><g><animateTransform attributeName="transform" type="rotate" values="0 0 0;0 0 0;24 0 0;0 0 0;0 0 0" keyTimes="0;.6;.66;.72;1" dur="${(2.5 + Math.random()*2).toFixed(1)}s" repeatCount="indefinite"/>`
    + `<path d="M -16 -8 L -26 -16 L -24 -4 Z" fill="${adj(c,-0.2)}"/><ellipse cx="-2" cy="-10" rx="15" ry="11" fill="${c}"/><ellipse cx="-4" cy="-10" rx="9" ry="6" fill="${adj(c,-0.15)}"/><circle cx="10" cy="-20" r="8.5" fill="${c}"/><path d="M 17 -21 L 24 -18 L 17 -16 Z" fill="#FFB33A"/><circle cx="12" cy="-22" r="2" fill="#33204F"/></g>`
    + `<path d="M -4 0 L -4 4 M 2 0 L 2 4" stroke="#FF9A4D" stroke-width="2.5" stroke-linecap="round"/></g>`
    + `<g class="flying" style="display:none"><path d="M -16 -4 L -26 -10 L -24 2 Z" fill="${adj(c,-0.2)}"/><ellipse cx="-2" cy="-4" rx="15" ry="9" fill="${c}"/><circle cx="12" cy="-10" r="8" fill="${c}"/><path d="M 19 -11 L 26 -8 L 19 -6 Z" fill="#FFB33A"/><circle cx="14" cy="-12" r="2" fill="#33204F"/>`
    + `<g><animateTransform attributeName="transform" type="scale" values="1 1;1 -0.6;1 1" dur=".22s" repeatCount="indefinite"/><path d="M -8 -8 Q 0 -34 12 -8 Z" fill="${adj(c,-0.12)}"/></g></g></g>`;
}
function setupBirds(){
  const layer = $('#lifeBack'), R = rng(11);
  const roofs = PERCH.filter(p => p[1] < G - 100);
  const picks = roofs.filter(() => R() < 0.55).slice(0, 9);
  const ground = CM.season === 'vinter' ? [] : [[1600, G+56],[1636, G+76],[1776, G+66],[1812, G+48]];
  for (const [x, y] of picks) addBird(layer, x, y, pick(['#7FB5FF','#FF8FC7','#FFC02E','#B79BFF','#FF7A6B','#8ED8B8']), false);
  for (const [x, y] of ground) addBird(layer, x, y, '#A9A9C6', true);
}
function addBird(layer, x, y, c, pigeon){
  const b = { hx: x, hy: y, x, y, c, pigeon, state: 'perch', vx: 0, vy: 0, t: 0, dir: Math.random() < 0.5 ? 1 : -1 };
  b.g = sv('g', { 'data-tap':'bird', transform:`translate(${x},${y})` }, `<g class="bf"${b.dir < 0 ? ' transform="scale(-1,1)"' : ''}>${birdSvg(c, pigeon)}</g><circle cx="0" cy="-12" r="26" fill="#FFF" fill-opacity="0" pointer-events="all"/>`);
  b.per = b.g.querySelector('.perched'); b.fly = b.g.querySelector('.flying'); b.bf = b.g.querySelector('.bf');
  layer.append(b.g); LIFE.birds.push(b);
}
function scareBird(b){
  if (b.state !== 'perch') return;
  b.state = 'away'; b.dir = Math.random() < 0.5 ? 1 : -1; b.vx = b.dir * (0.25 + Math.random()*0.15); b.vy = -0.22 - Math.random()*0.1;
  b.per.style.display = 'none'; b.fly.style.display = ''; b.bf.setAttribute('transform', `${b.dir < 0 ? 'scale(-1,1) ' : ''}rotate(-18)`);
  b.t = performance.now() + 9000 + Math.random()*12000;
}
function tickBirds(dt, now){
  for (const b of LIFE.birds){
    if (b.state === 'away'){ b.x += b.vx * dt; b.y += b.vy * dt; b.vy -= 0.00002 * dt;
      if (now > b.t){ b.state = 'back'; b.x = b.hx - b.dir * 700; b.y = Math.max(-80, b.hy - 520); b.dir = b.x < b.hx ? 1 : -1; b.bf.setAttribute('transform', b.dir < 0 ? 'scale(-1,1)' : ''); b.t0 = now; b.sx = b.x; b.sy = b.y; } }
    else if (b.state === 'back'){ const k = Math.min(1, (now - b.t0) / 3500), e = 1 - Math.pow(1 - k, 2);
      b.x = b.sx + (b.hx - b.sx) * e; b.y = b.sy + (b.hy - b.sy) * e - Math.sin(k * Math.PI) * 60;
      if (k >= 1){ b.state = 'perch'; b.per.style.display = ''; b.fly.style.display = 'none'; } }
    else if (b.pigeon && Math.abs(walkerX - b.x) < 150 && walking) scareBird(b);
    b.g.setAttribute('transform', `translate(${b.x.toFixed(1)},${b.y.toFixed(1)})`);
  }
}

/* ---------- egernet i træet ---------- */
function setupSquirrel(){
  const tx = 1410;
  const q = { tx, state: 'ground', t: performance.now() + 4000, x: tx + 70, y: G + 30, rot: 0, k: 0 };
  q.g = sv('g', { 'data-tap':'squirrel' }, `<g class="sq"><path d="M -14 -8 C -40 -10, -44 -46, -22 -52 C -10 -55, -6 -40, -14 -32" fill="#D9823A" stroke="#A85A1E" stroke-width="3"/><ellipse cx="0" cy="-10" rx="14" ry="11" fill="#E8913F" stroke="#A85A1E" stroke-width="3"/><circle cx="12" cy="-22" r="9" fill="#E8913F" stroke="#A85A1E" stroke-width="3"/><path d="M 8 -30 L 9 -38 L 14 -31 Z" fill="#E8913F" stroke="#A85A1E" stroke-width="2"/><circle cx="15" cy="-23" r="2.2" fill="#33204F"/><circle cx="20" cy="-20" r="1.8" fill="#33204F"/><ellipse cx="18" cy="-12" rx="4" ry="3" fill="#B9763F"/></g><circle cx="0" cy="-20" r="34" fill="#FFF" fill-opacity="0" pointer-events="all"/>`);
  $('#lifeBack').append(q.g); LIFE.extras.push(q); LIFE.squirrel = q;
  q.tick = (dt, now) => {
    const top = G - 190, base = G + 20;
    if (q.state === 'ground' && now > q.t){ q.state = 'toTree'; }
    if (q.state === 'toTree'){ q.x -= 0.12 * dt; q.rot = 0; q.flip = -1; if (q.x <= tx + 18){ q.x = tx + 18; q.state = 'up'; } }
    if (q.state === 'up'){ q.y -= (q.fast ? 0.35 : 0.16) * dt; q.rot = -90; q.flip = 1; if (q.y <= top){ q.state = 'hidden'; q.t = now + 3500 + Math.random()*4000; q.fast = false; } }
    if (q.state === 'hidden' && now > q.t){ q.state = 'down'; }
    if (q.state === 'down'){ q.y += 0.14 * dt; q.rot = 90; q.flip = 1; if (q.y >= base){ q.y = base; q.state = 'out'; } }
    if (q.state === 'out'){ q.x += 0.12 * dt; q.rot = 0; q.flip = 1; if (q.x >= tx + 70){ q.state = 'ground'; q.t = now + 5000 + Math.random()*7000; } }
    q.g.style.display = q.state === 'hidden' ? 'none' : '';
    q.g.setAttribute('transform', `translate(${q.x.toFixed(1)},${q.y.toFixed(1)}) rotate(${q.rot}) scale(${q.flip || 1},1)`);
  };
}

/* ---------- isvognen med balloner ---------- */
function setupCart(){
  const x = 1840, y = G + 26, winter = CM.season === 'vinter';
  const v = randomGuest(); const s = 0.62;
  const vend = svgUrl(renderDoll(v.st, { viewBox: VB_DOLL, anim: !calm, idle: true, pet: false }));
  const umb = winter ? ['#8A5A35','#FFFFFF'] : ['#FF5FA8','#FFFFFF'];
  let h = `<image x="${-120*s-46}" y="${y - 312*s - 12}" width="${240*s}" height="${320*s}" href="${vend}" pointer-events="none"/>`;
  h += `<g data-tap="vendor">${hitRect(70, y - 200, y - 60).replace('x="-35"', 'x="-81"')}</g>`;
  h += `<path d="M -10 ${y-70} L -10 ${y-230}" stroke="#6B5A8E" stroke-width="6"/><path d="M -90 ${y-220} Q -10 ${y-300} 70 ${y-220} Z" fill="${umb[0]}" stroke="${adj(umb[0],-0.25)}" stroke-width="4"/>` + [-60,-30,0,30].map((dx,i)=>`<path d="M ${dx-10} ${y-224+Math.abs(dx+10)*0.1} Q ${dx+5} ${y-268} ${dx+20} ${y-226}" fill="${umb[1]}" opacity="${i%2?0:0.8}"/>`).join('');
  h += `<rect x="-80" y="${y-110}" width="140" height="80" rx="14" fill="#FFFFFF" stroke="#E0457A" stroke-width="4"/><rect x="-80" y="${y-110}" width="140" height="22" rx="10" fill="${winter ? '#8A5A35' : '#FF8FC7'}"/>`;
  h += `<text x="-10" y="${y-50}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="24" fill="#E0457A">${winter ? 'KAKAO' : 'IS'}</text>`;
  h += [-56, 36].map(dx => `<circle cx="${dx}" cy="${y-24}" r="16" fill="#33204F"/><circle cx="${dx}" cy="${y-24}" r="6" fill="#FFFFFF"/>`).join('');
  h += winter ? `<g transform="translate(-48,${y-126})"><rect x="-10" y="-14" width="20" height="18" rx="4" fill="#FFFFFF" stroke="#8A5A35" stroke-width="3"/><path d="M -4 -20 q 4 -8 0 -14 M 4 -20 q 4 -8 0 -14" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".8"/></g>` : `<g transform="translate(-48,${y-118})"><path d="M -10 0 L 0 26 L 10 0 Z" fill="#E8B33A"/><circle cx="0" cy="-6" r="12" fill="#FFC1DC"/><circle cx="0" cy="-18" r="10" fill="#9FE0FF"/></g>`;
  const g = sv('g', { transform:`translate(${x},0)` }, h);
  // balloner
  const bal = sv('g', { 'data-tap':'balloon' }); g.append(bal);
  const cols = ['#FF3D8F','#FFE27A','#43D3BE','#7B5CFF','#FF9A4D'];
  const B = { list: [], g: bal, x, y };
  cols.forEach((c, i) => { const bx = 60 + (i - 2) * 22, by = y - 210 - (i % 2) * 34;
    const e = sv('g', { class:'balloon' }, `<g><animateTransform attributeName="transform" type="rotate" values="-4 ${60} ${y-60};4 ${60} ${y-60};-4 ${60} ${y-60}" dur="${(3 + i*0.4).toFixed(1)}s" repeatCount="indefinite"/><path d="M 60 ${y-60} Q ${(60+bx)/2+8} ${(y-60+by)/2} ${bx} ${by+30}" stroke="#9C95B5" stroke-width="2" fill="none"/><ellipse cx="${bx}" cy="${by}" rx="22" ry="27" fill="${c}"/><path d="M ${bx-3} ${by+26} L ${bx+3} ${by+26} L ${bx} ${by+32} Z" fill="${c}"/><ellipse cx="${bx-8}" cy="${by-9}" rx="6" ry="9" fill="#FFFFFF" opacity=".5"/></g>`);
    bal.append(e); B.list.push({ e, c, bx, by, gone: 0 }); });
  $('#lifeBack').append(g); LIFE.cart = B;
  LIFE.vendor = { say: winter ? 'Varm kakao i kulden!' : pick(['Lækker is i dag!', 'Jordbær er min favorit!', 'Pas på, isen smelter!']), x: x - 46, y: y - 312*s - 20 };
}
function releaseBalloon(){
  const B = LIFE.cart; if (!B) return;
  const b = B.list.find(o => !o.gone); if (!b){ sfx.nope(); return; }
  b.gone = performance.now(); sfx.pop();
  const fl = sv('g', { 'pointer-events':'none' }, `<ellipse cx="0" cy="0" rx="22" ry="27" fill="${b.c}"/><ellipse cx="-8" cy="-9" rx="6" ry="9" fill="#FFFFFF" opacity=".5"/><path d="M 0 27 Q 8 50 -4 80" stroke="#9C95B5" stroke-width="2" fill="none"/>`);
  $('#weatherL').append(fl); b.e.style.display = 'none';
  const f = { g: fl, x: B.x + b.bx, y: b.by, t0: performance.now() };
  LIFE.extras.push({ tick: (dt, now) => { f.y -= 0.09 * dt; const w = Math.sin((now - f.t0) / 600) * 30; fl.setAttribute('transform', `translate(${(f.x + w).toFixed(1)},${f.y.toFixed(1)})`); if (f.y < -120){ fl.remove(); f.dead = true; } }, dead: () => f.dead });
  setTimeout(() => { b.gone = 0; if (b.e.isConnected){ b.e.style.display = ''; } }, 20000);
}

/* ---------- tryk på ting ---------- */
function tapThing(t){
  const kind = t.dataset.tap, now = performance.now();
  if (kind === 'ped' || kind === 'dog'){
    const p = LIFE.peds.find(o => String(o.id) === t.dataset.id); if (!p) return;
    if (kind === 'ped') return greetPed(p);
    const k = p.dog.kind; (sfx[PET_SND[k]] || sfx.bark)(); p.pauseUntil = Math.max(p.pauseUntil, now + 1600);
    return bubble(PET_SAY[k] || 'Vov!', () => [p.dog.x, p.dog.feet - 150 * p.dog.s], 1600);
  }
  if (kind === 'car'){ sfx.honk(); const c = LIFE.cars.find(o => o.g === t); if (c) bubble(c.type === 'bus' ? 'Dyt dyt! Bus 8!' : 'Dyt!', () => [c.x, (c.far ? LANE_FAR : LANE_NEAR) - (c.type === 'bus' ? 180 : 120)], 1500); return; }
  if (kind === 'bird'){ const b = LIFE.birds.find(o => o.g === t); if (b && b.state === 'perch'){ sfx.chirp(); scareBird(b); } return; }
  if (kind === 'squirrel'){ const q = LIFE.squirrel; sfx.squeak(); if (q.state === 'ground' || q.state === 'out'){ q.state = 'toTree'; } q.fast = true; return; }
  if (kind === 'cat'){ sfx.meow(); bubble('Mjav!', () => [468, G - 470], 1500); return; }
  if (kind === 'fountain'){ sfx.splash(); const j = $('#jets'); if (j){ j.classList.remove('big'); void j.getBoundingClientRect(); j.classList.add('big'); } return; }
  if (kind === 'balloon') return releaseBalloon();
  if (kind === 'vendor'){ sfx.hello(); const v = LIFE.vendor; bubble(v.say, () => [v.x, v.y], 2400); return; }
  if (kind === 'hero'){
    if (walking) return;
    const at = PLACES.find(p => Math.abs(p.x - walkerX) < 60);
    if (at) return visit(at.id);
    if (now < (LIFE.heroGreet || 0)) return;
    LIFE.heroGreet = now + 2900; sfx.hello();
    SPR.greet = SPR.greet || svgUrl(renderDoll(heroState(), { viewBox: VB_DOLL, anim: !calm, greet: true, pet: false }));
    $('#walkerImg').setAttribute('href', SPR.greet); setTimeout(() => { if (!walking) $('#walkerImg').setAttribute('href', SPR.idle); }, 2900);
    const hf = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0];
    bubble(hf && hf.name ? 'Hej! Jeg er ' + hf.name + '!' : 'Hej!', () => [walkerX, FEET_HERO - 330], 2400);
    return;
  }
  if (kind === 'pet'){
    if (walking) return; const k = heroState().pet.kind; (sfx[PET_SND[k]] || sfx.pick)();
    const pf = $('#petFlip'); pf.classList.remove('hop'); void pf.getBoundingClientRect(); pf.classList.add('hop');
    bubble(PET_SAY[k] || '!', () => [petX, FEET_PET - 230], 1500);
  }
}

/* ---------- løkken der holder byen i live ---------- */
function lifeTick(now){
  if (!LIFE.on || $('#town').hidden){ LIFE.on = false; return; }
  const dt = Math.min(50, now - LIFE.last); LIFE.last = now;
  tickPeds(dt, now); tickCars(dt, now); tickBirds(dt, now);
  for (const e of LIFE.extras.slice()){ e.tick(dt, now); if (typeof e.dead === 'function' && e.dead()) LIFE.extras.splice(LIFE.extras.indexOf(e), 1); }
  for (const b of LIFE.bubbles.slice()){ if (now > b.until){ b.g.remove(); LIFE.bubbles.splice(LIFE.bubbles.indexOf(b), 1); } else b.place(); }
  requestAnimationFrame(lifeTick);
}
function lifeStart(){
  Object.assign(LIFE, { peds: [], cars: [], birds: [], bubbles: [], extras: [], cart: null, squirrel: null, nextPed: 0, nextCar: performance.now() + 800, nextBus: performance.now() + 6000 + Math.random()*8000 });
  setupCart(); setupBirds(); setupSquirrel();
  const [l, r] = viewRange(); const n = CM.night ? 1 : Math.max(2, Math.min(4, Math.round((r - l) / 600)));
  for (let i = 0; i < n; i++) spawnPed('mid');
  if (!calm){ spawnCar(pick(['bil','mini','van'])); }
  if (!LIFE.on){ LIFE.on = true; LIFE.last = performance.now(); requestAnimationFrame(lifeTick); }
}

/* ================= Skærmen ================= */
let walkerX = PLACES[0].x, petX = PLACES[0].x + 125, walking = false, SPR = null;
const PET_GAP = 125, PET_TOWN_VB = '460 700 400 380';
function showTown(){
  showScreen('#town'); playMusic('byen');
  const box = $('#townBody'); box.innerHTML = '';
  box.append(el('div', { class:'town-head' }, [ el('h1', { class:'logo small', id:'townLogo' }, 'Glimmer Studio'), el('div', { class:'head-right' }, [ starPill(), audioBtns() ]) ]),
    el('div', { class:'street', id:'street', html: townSvg() }));
  $('#street').style.background = SKY[CM.time][0];
  const hero = heroState(), hasPet = hero.pet.kind !== 'ingen';
  SPR = { idle: svgUrl(renderDoll(hero, { viewBox: VB_DOLL, anim: !calm, idle: true, pet: false })),
          walk: svgUrl(renderDoll(hero, { viewBox: VB_DOLL, anim: !calm, walk: true, pet: false })),
          sit: hasPet ? svgUrl(renderDoll(hero, { petOnly: true, viewBox: PET_TOWN_VB, anim: !calm })) : '',
          pwalk: hasPet ? svgUrl(renderDoll(hero, { petOnly: true, petMode: 'walk', viewBox: PET_TOWN_VB, anim: !calm })) : '' };
  $('#walkerImg').setAttribute('href', SPR.idle);
  $('#walker').insertAdjacentHTML('beforeend', hitRect(120, FEET_HERO - 300, FEET_HERO));
  if (hasPet){ $('#petImg').setAttribute('href', SPR.sit); $('#petWalker').insertAdjacentHTML('beforeend', hitRect(110, FEET_PET - 150, FEET_PET)); } else $('#petWalker').remove();
  petX = walkerX + PET_GAP; $('#petWalker') && $('#petWalker').setAttribute('transform', `translate(${petX},0)`);
  // en af hendes andre dukker kigger ud af vinduet i Mit hus
  const sorted = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0));
  if (sorted[1]) $('#homeDoll').setAttribute('href', svgUrl(renderDoll(enforce(fixState(clone(sorted[1].st))), { viewBox:'170 150 460 520', anim: !calm, idle: true, pet: false })));
  else $('#homeDoll').remove();
  // udstillingsdukker i Modehuset: tilfældigt tøj, også ting man endnu ikke har vundet
  ['man0','man1','man2','man3'].forEach(id => { const st = randomState({ boy: Math.random() < 0.25 }); $('#'+id).setAttribute('href', svgUrl(renderDoll(st, { viewBox:'150 60 500 1010', pet: false }))); });
  $('#townLogo').addEventListener('click', logoTap);
  const svg = $('#townSvg');
  svg.addEventListener('click', e => { const t = e.target.closest('[data-tap]'); if (t){ tapThing(t); return; } const g = e.target.closest('.place'); if (g) visit(g.dataset.place); });
  svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.place')){ e.preventDefault(); visit(e.target.closest('.place').dataset.place); } });
  updateAudioBtns();
  const street = $('#street');
  LIFE.ml = [...document.querySelectorAll('#parMidL .ml')].map(e => ({ e, x: +e.getAttribute('x'), y: +e.getAttribute('y'), hid: false }));
  street.addEventListener('scroll', parallax, { passive: true });
  requestAnimationFrame(() => { const [, , sc] = viewRange(); street.scrollLeft = Math.max(0, walkerX * sc - street.clientWidth / 2); parallax(); lifeStart(); });
}
function followCam(){
  const street = $('#street'); if (!street) return;
  const [l, r, sc] = viewRange(), w = r - l;
  if (walkerX < l + w * 0.3) street.scrollLeft = Math.max(0, (walkerX - w * 0.3) * sc);
  else if (walkerX > r - w * 0.3) street.scrollLeft = (walkerX - w * 0.7) * sc;
}
function visit(id){
  const p = PLACES.find(x => x.id === id); if (!p || walking) return;
  if (p.soon){ sfx.nope(); toast(p.name + ' kommer snart!'); return; }
  sfx.pick(); walking = true;
  const from = walkerX, to = p.x, dist = Math.abs(to - from), dir = to >= from ? 1 : -1;
  const dur = calm ? 0 : Math.max(300, Math.min(4200, dist / 0.5)), ta = Math.min(450, dur / 3), vmax = dur ? dist / (dur - ta) : 0;
  const posAt = t => t <= 0 ? 0 : t < ta ? 0.5 * vmax * t * t / ta : t < dur - ta ? 0.5 * vmax * ta + vmax * (t - ta) : t < dur ? dist - 0.5 * vmax * (dur - t) * (dur - t) / ta : dist;
  const PET_VMAX = Math.max(0.75, vmax * 1.25);
  const t0 = performance.now(), pet = $('#petWalker');
  if (dist > 4){ $('#walkerImg').setAttribute('href', SPR.walk); $('#walkerFlip').setAttribute('transform', dir < 0 ? 'scale(-1,1)' : ''); }
  /* dyret bliver siddende, til dukken er gået forbi (eller hvis hun går væk fra det, rejser det sig med det samme) */
  let petMoving = false, petGoal = null, petDone = !pet;
  const startPet = goal => { petMoving = true; petGoal = goal;
    $('#petImg').setAttribute('href', SPR.pwalk); $('#petFlip').setAttribute('transform', goal(walkerX) < petX ? 'scale(-1,1)' : ''); };
  let last = t0;
  const step = now => {
    const t = now - t0, k = dur ? Math.min(1, t / dur) : 1;
    walkerX = from + dir * posAt(Math.min(t, dur));
    $('#walker') && $('#walker').setAttribute('transform', `translate(${walkerX.toFixed(1)},0)`);
    const dt = Math.min(50, now - last); last = now;
    if (pet && !petDone){
      const behind = x => x - dir * PET_GAP, rel = (petX - walkerX) * dir;
      if (!petMoving){
        if (calm){ petX = behind(walkerX); petDone = true; }
        else if (dist > 4 && rel < -PET_GAP * 0.9) startPet(behind);
        else if (k >= 1){
          if (Math.abs(petX - walkerX) < PET_GAP * 0.8) startPet(x => x + dir * PET_GAP);
          else petDone = true;
        }
      }
      if (petMoving){
        const diff = petGoal(walkerX) - petX, mv = Math.sign(diff) * Math.min(Math.abs(diff), PET_VMAX * dt, Math.abs(diff) * dt / 140 + 0.05 * dt);
        petX += mv;
        if (Math.abs(mv) > 0.01) $('#petFlip').setAttribute('transform', mv < 0 ? 'scale(-1,1)' : '');
        if (k >= 1 && Math.abs(diff) < 3) petDone = true;
      }
      pet.setAttribute('transform', `translate(${petX.toFixed(1)},0)`);
    }
    if (!calm) followCam();
    if (k < 1 || (!petDone && t < dur + 2500)) requestAnimationFrame(step);
    else {
      if (pet && petMoving) $('#petImg').setAttribute('href', SPR.sit);
      walking = false; sfx.open(); goTo(() => { p.open(); });
    }
  };
  requestAnimationFrame(step);
}
