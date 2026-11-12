/* ================= Skolen: gangen med dørene til fagene, og eliksirtimen ================= */
const FONT_S = "Fredoka, Nunito, sans-serif";

/* ---------- gangen ---------- */
const FAG = [
  { id:'eliksir', name:'Eliksirer', x:330, col:'#3E7A4A', open: () => showPotions() },
  { id:'kost', name:'Kosteflyvning', x:650, col:'#2E4A7A' },
  { id:'dyrepas', name:'Dyrepasning', x:970, col:'#7A4E35' },
  { id:'faldskaerm', name:'Faldskærm', x:1290, col:'#6B3FA0' },
];
/* små tegn over dørene: kedel, kost, pote, faldskærm */
const FAG_ICON = {
  eliksir: '<path d="M -26 -6 Q -30 22 0 26 Q 30 22 26 -6 Z" fill="#2A2238"/><ellipse cx="0" cy="-6" rx="28" ry="7" fill="#5FE0A0"/><circle cx="-8" cy="-16" r="5" fill="#5FE0A0" opacity=".8"/><circle cx="6" cy="-24" r="3.5" fill="#5FE0A0" opacity=".6"/>',
  kost: '<path d="M -30 18 L 22 -14" stroke="#B5844A" stroke-width="5" stroke-linecap="round"/><path d="M 14 -10 L 34 -26 L 38 -6 Z" fill="#E9C46A" stroke="#8A6420" stroke-width="2" stroke-linejoin="round"/>',
  dyrepas: '<ellipse cx="0" cy="8" rx="13" ry="11" fill="#E9C46A"/>' + [[-14,-8],[-5,-16],[6,-16],[15,-8]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="6.5" fill="#E9C46A"/>`).join(''),
  faldskaerm: '<path d="M -30 -4 Q 0 -40 30 -4 Q 20 -10 10 -4 Q 0 -10 -10 -4 Q -20 -10 -30 -4 Z" fill="#E0457A" stroke="#8A2050" stroke-width="2"/><path d="M -28 -4 L -3 22 M 28 -4 L 3 22 M 0 -6 V 22" stroke="#E8E4F4" stroke-width="1.5"/><circle cx="0" cy="25" r="5" fill="#E9C46A"/>',
};
function stoneWall(x0, x1, y0, y1, base, seed = 1){
  let o = `<rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" fill="${base}"/>`;
  let n = seed;
  for (let y = y0, r = 0; y < y1; y += 70, r++){
    for (let x = x0 - (r % 2) * 60; x < x1; x += 120){ n = (n * 9301 + 49297) % 233280; const t = n / 233280;
      o += `<rect x="${x+3}" y="${y+3}" width="114" height="64" rx="10" fill="${t < .5 ? fdk(base, .12 + t*.2) : lt(base, (t-.5)*.12)}" opacity=".9"/>`; }
  }
  return o;
}
function torch(x, y){
  return `<circle cx="${x}" cy="${y-40}" r="110" fill="#FFB347" opacity=".14"/><path d="M ${x-12} ${y} L ${x+12} ${y} L ${x+6} ${y+50} H ${x-6} Z" fill="#5A3A28" stroke="#2A1810" stroke-width="3"/><rect x="${x-20}" y="${y+20}" width="40" height="8" rx="3" fill="#3A2A20"/>`
    + `<g class="flame"><path d="M ${x} ${y-50} C ${x+18} ${y-26} ${x+16} ${y-6} ${x} ${y} C ${x-16} ${y-6} ${x-18} ${y-26} ${x} ${y-50} Z" fill="#FFB347"/><path d="M ${x} ${y-30} C ${x+8} ${y-18} ${x+8} ${y-6} ${x} ${y-2} C ${x-8} ${y-6} ${x-8} ${y-18} ${x} ${y-30} Z" fill="#FFF3B0"/></g>`;
}
function fagDoor(f){
  const x = f.x, top = 300, base = 800, w = 230, open = !!f.open;
  let o = `<g data-hit="fag:${f.id}"><g class="anim">`;
  o += `<path d="M ${x-w/2-24} ${base} V ${top+90} Q ${x-w/2-24} ${top-34} ${x} ${top-40} Q ${x+w/2+24} ${top-34} ${x+w/2+24} ${top+90} V ${base} Z" fill="#4A4266" stroke="#2A2340" stroke-width="5"/>`;
  for (let i = 0; i < 9; i++){ const a = Math.PI * (i / 8), rx = w/2 + 12, cx = x - Math.cos(a) * rx, cy = top + 90 - Math.sin(a) * (rx + 4);
    o += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="9" fill="#5A527A" stroke="#2A2340" stroke-width="2"/>`; }
  const D = `M ${x-w/2} ${base} V ${top+90} Q ${x-w/2} ${top-14} ${x} ${top-18} Q ${x+w/2} ${top-14} ${x+w/2} ${top+90} V ${base} Z`;
  o += `<path d="${D}" fill="${f.col}" stroke="#2A1810" stroke-width="5"/>`;
  o += clipG(D, [ -70, -35, 0, 35, 70 ].map(dx => `<path d="M ${x+dx} ${top-30} V ${base}" stroke="${fdk(f.col, .3)}" stroke-width="4"/>`).join('')
    + [top + 120, base - 120].map(y => `<rect x="${x-w/2}" y="${y}" width="${w}" height="16" fill="#2E2A38"/>` + [-90, -30, 30, 90].map(dx => `<circle cx="${x+dx}" cy="${y+8}" r="4" fill="#7A7290"/>`).join('')).join('')
    + `<path d="M ${x-w/2+20} ${top+40} Q ${x-w/2+20} ${top+10} ${x-w/2+50} ${top} V ${base} H ${x-w/2+20} Z" fill="#FFFFFF" opacity=".06"/>`);
  o += `<circle cx="${x+70}" cy="${(top+base)/2+20}" r="12" fill="#E9C46A" stroke="#8A6420" stroke-width="3"/><circle cx="${x-70}" cy="${(top+base)/2+20}" r="12" fill="#E9C46A" stroke="#8A6420" stroke-width="3"/>`;
  /* skilt over døren med fagets tegn og navn */
  o += `<g transform="translate(${x} ${top-92})"><rect x="-108" y="-34" width="216" height="68" rx="14" fill="#3A2A20" stroke="#C9A04A" stroke-width="4"/><g transform="translate(-74 2) scale(.9)">${FAG_ICON[f.id]}</g><text x="18" y="9" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="${f.name.length > 10 ? 21 : 26}" fill="#FFE9A0">${f.name}</text></g>`;
  if (open){
    o += `<path d="M ${x-w/2} ${base} L ${x-w/2-30} ${base+60} H ${x+w/2+30} L ${x+w/2} ${base} Z" fill="#FFD27A" opacity=".18"/>`;
    o += `<rect x="${x-3}" y="${top+80}" width="6" height="${base-top-80}" fill="#FFE27A" opacity=".55" class="doorglow"/>`;
  } else {
    o += `<g transform="translate(${x} ${top+170}) rotate(-8)"><rect x="-86" y="-22" width="172" height="44" rx="6" fill="#E9D3A6" stroke="#6A4430" stroke-width="3"/><text x="0" y="8" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="22" fill="#3A2340">Kommer snart</text><circle cx="-76" cy="-12" r="3" fill="#6A4430"/><circle cx="76" cy="-12" r="3" fill="#6A4430"/></g>`;
  }
  return o + `</g></g>`;
}
function floatCandles(){
  if (calm) return '';
  let o = '';
  for (let i = 0; i < 9; i++){ const x = 120 + i * 172 + (i % 2) * 40, y = 60 + (i * 37) % 80;
    o += `<g class="candle" style="animation-delay:${-(i * 0.9).toFixed(1)}s;animation-duration:${(4 + i % 3).toFixed(1)}s"><circle cx="${x}" cy="${y-14}" r="36" fill="#FFE27A" opacity=".12"/><rect x="${x-7}" y="${y}" width="14" height="44" rx="3" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="2"/><path d="M ${x} ${y-16} q -7 10 0 16 q 7 -6 0 -16 Z" fill="#FFC86A"/></g>`; }
  return o;
}
function schoolScene(){
  CLIPN = 0;
  let o = `<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet">`;
  o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="#231C3A"/>`;
  o += stoneWall(-1700, 3300, 0, 820, '#4A4466', 3);
  /* hvælvinger i loftet */
  o += `<rect x="-1700" y="-700" width="5000" height="700" fill="#1A1430"/>`;
  for (let x = -1690; x < 3300; x += 320) o += `<path d="M ${x} 0 Q ${x+160} -90 ${x+320} 0" fill="none" stroke="#2E2650" stroke-width="40"/><rect x="${x-24}" y="-20" width="48" height="840" fill="#3E3858" stroke="#2A2340" stroke-width="3"/><rect x="${x-34}" y="790" width="68" height="34" fill="#353050"/>`;
  /* gulv med fliser og en lang løber */
  o += `<rect x="-1700" y="820" width="5000" height="900" fill="#2E2944"/>`;
  for (let i = 0; i < 8; i++){ const y = 820 + i * i * 6 + i * 14; o += `<path d="M -1700 ${y} H 3300" stroke="#1E1A30" stroke-width="3"/>`; }
  for (let i = -16; i <= 16; i++) o += `<path d="M ${800 + i*100} 820 L ${800 + i*260} 1700" stroke="#1E1A30" stroke-width="3"/>`;
  o += `<rect x="-1700" y="860" width="5000" height="90" fill="#6A1F3A"/><rect x="-1700" y="866" width="5000" height="6" fill="#C9A04A"/><rect x="-1700" y="938" width="5000" height="6" fill="#C9A04A"/>`;
  /* bannere, fakler og døre */
  for (const x of [170, 490, 810, 1130, 1450]) o += torch(x, 420);
  o += FAG.map(fagDoor).join('');
  o += floatCandles();
  o += placeMood([[330, 560, 300, 360], [970, 560, 300, 360]], { vign: .85, warm: .18, dx: 120, dw: 1360 });
  o += `<g class="fx" pointer-events="none"></g></svg>`;
  return scopeIds(o, 'sk');
}
function showSchool(){ showScreen('#school'); playMusic('kaelder'); renderSchool(); }
function renderSchool(){
  const box = $('#schoolBody'); box.innerHTML = '';
  box.append(el('div', { class:'scene-wrap', id:'schoolScene' }), ...placeUi([ backBtn('Byen', showTown) ], [ starPill() ]));
  const w = $('#schoolScene'); w.innerHTML = schoolScene();
  const svg = w.querySelector('svg');
  svg.addEventListener('click', e => { const g = e.target.closest('[data-hit]'); if (!g) return; const [k, v] = g.dataset.hit.split(':');
    if (k !== 'fag') return; const f = FAG.find(x => x.id === v);
    replay(g, 'jiggle');
    if (!f.open){ sfx.nope(); toast(f.name + ' kommer snart!'); return; }
    sfx.open(); goTo(f.open); });
}

/* ================= Eliksirtimen ================= */
/* ingredienserne: farven er den farve gryden får, når den kommer i */
const INGR = {
  blad:    { name:'Paddeblad', col:'#4FBF5A', draw: () => `<path d="M -4 34 C -40 20 -40 -24 0 -38 C 40 -24 40 20 4 34 Z" fill="#5DB866" stroke="#2E6B3A" stroke-width="4" stroke-linejoin="round"/><path d="M 0 40 V -30 M 0 -4 L -16 -16 M 0 10 L 16 -2 M 0 20 L -14 10" stroke="#2E6B3A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M -18 -14 Q -22 0 -14 12" stroke="#9BE38A" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  draabe:  { name:'Månedråbe', col:'#6EC8FF', draw: () => `<path d="M 0 -38 C 18 -12 30 4 30 16 C 30 32 16 40 0 40 C -16 40 -30 32 -30 16 C -30 4 -18 -12 0 -38 Z" fill="#7FD8FF" stroke="#2F6FA0" stroke-width="4"/><path d="M -14 10 Q -16 24 -6 30" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/><path d="M 10 -2 a 10 10 0 1 0 6 16 a 8 8 0 1 1 -6 -16 Z" fill="#E8F6FF"/>` },
  stjerne: { name:'Stjernestøv', col:'#FFD54A', draw: () => starP(0, 2, 30, '#FFD54A') + `<polygon points="${star5pts(0, 2, 30, 13)}" fill="none" stroke="#B98516" stroke-width="3.5" stroke-linejoin="round"/>` + star4(30, -28, 9, '#FFF3B0') + star4(-30, -24, 6, '#FFF3B0') + star4(28, 30, 5, '#FFF3B0') },
  svamp:   { name:'Fluesvamp', col:'#E8504A', draw: () => `<path d="M -10 2 Q -12 30 -16 38 H 16 Q 12 30 10 2 Z" fill="#FFF3DC" stroke="#9C7A5A" stroke-width="3.5"/><path d="M -36 6 C -36 -26 -16 -38 0 -38 C 16 -38 36 -26 36 6 Q 0 14 -36 6 Z" fill="#E8504A" stroke="#8A2A2A" stroke-width="4"/><circle cx="-16" cy="-14" r="6" fill="#FFF3DC"/><circle cx="10" cy="-24" r="5" fill="#FFF3DC"/><circle cx="20" cy="-6" r="4.5" fill="#FFF3DC"/><circle cx="-2" cy="-4" r="3.5" fill="#FFF3DC"/>` },
  fjer:    { name:'Fønixfjer', col:'#FF8A5A', draw: () => `<g transform="rotate(30)"><path d="M 0 -42 C 22 -24 20 14 2 36 C -16 14 -20 -24 0 -42 Z" fill="#FF8A5A" stroke="#A8442A" stroke-width="3.5"/><path d="M 0 -40 C 12 -20 10 12 2 36" fill="#FFC14E" opacity=".7"/><path d="M 1 -36 V 46" stroke="#A8442A" stroke-width="3" stroke-linecap="round"/><path d="M 1 -10 L 14 -18 M 1 4 L -14 -4 M 1 16 L 12 10" stroke="#A8442A" stroke-width="2" stroke-linecap="round"/></g>` },
  krystal: { name:'Troldkrystal', col:'#A07AFF', draw: () => `<path d="M -8 38 L -24 4 L -14 -30 L 0 -42 L 12 -26 L 22 6 L 8 38 Z" fill="#A07AFF" stroke="#4A2E8A" stroke-width="4" stroke-linejoin="round"/><path d="M 0 -42 L -4 38 M -14 -30 L -4 0 L 12 -26" stroke="#4A2E8A" stroke-width="2.5" fill="none"/><path d="M -16 -16 L -10 -26" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M 22 38 L 30 14 L 40 30 L 36 40 Z" fill="#C8B4FF" stroke="#4A2E8A" stroke-width="3" stroke-linejoin="round"/>` },
};
const INGR_IDS = Object.keys(INGR);
/* hylden med krukker: to søjler, tre hylder */
const JAR_POS = [[140, 340], [330, 340], [140, 540], [330, 540], [140, 740], [330, 740]];
const POTIONS = [
  { name:'Svæveeliksir', fx:'svaev', col:'#8FD8FF', line:'Du svæver! Hold fast i hatten!' },
  { name:'Krympedrik', fx:'lille', col:'#FF8FC7', line:'Hov, hvor blev du af? Bare rolig, det går over.' },
  { name:'Regnbuesaft', fx:'haar', col:'#FFB347', line:'Sikke en hårfarve! Den holder heldigvis kun lidt.' },
  { name:'Pelsfarvebryg', fx:'pels', col:'#7AE0C0', line:'Se dit dyr! Det har skiftet farve!', pet: true },
  { name:'Glimmerdrik', fx:'glimmer', col:'#FFE27A', line:'Du glimter som en stjerne!' },
  { name:'Kæmpedrik', fx:'stor', col:'#A07AFF', line:'Du er blevet kæmpestor!' },
  { name:'Hikkedrik', fx:'hik', col:'#9BE36A', line:'Hik! Det er en ægte hikkedrik.' },
];
const PROF = 'Professor Mosegrøn';
const PROF_ST = { skin:'#F1DCCB', eyes:{ color:'#3FA34D', pupil:'rund' }, mk:{ blush:'#E8A0A0', lips:'#A0526B', lipShape:'smil', mark:'ingen', markColor:'#B07A45' },
  front:'midt', back:'langt', hair:{ a:'#E8E4EE', b:'#B8B2C8', ombre:false, tie:'#3E7A4A' },
  robe:{ id:'knapper', a:'#2F5A3A', b:'#C9A04A' }, cape:{ id:'lang', a:'#1C3326', b:'#5FE0A0' }, hat:{ id:'ingen', a:'#2F5A3A', b:'#C9A04A' },
  boots:{ id:'spidse', a:'#3A2A20', b:'#C9A04A' }, acc:{ tryllestav:'#C9A04A', baelte:'#5C3A24' }, pet:{ kind:'ingen', a:'#FFFFFF', b:'#FFFFFF', c:'#FFFFFF', pattern:'ingen', eyes:'#3D8BFF', acc:{}, name:'' } };
/* elverører og arbejdsbriller i panden, tegnet oven på figuren (figurens koordinater) */
const PROF_OVER = [1, -1].map(f => { const X = x => 400.5 + f * (x - 400.5);
    return `<path d="M ${X(312)} 436 C ${X(296)} 424 ${X(270)} 392 ${X(246)} 330 C ${X(282)} 350 ${X(304)} 380 ${X(318)} 404 Z" fill="#F1DCCB" stroke="#C49A86" stroke-width="3" stroke-linejoin="round"/><path d="M ${X(306)} 416 C ${X(292)} 404 ${X(276)} 384 ${X(262)} 352" stroke="#D9AE9A" stroke-width="3" fill="none" stroke-linecap="round"/>`; }).join('')
  + `<path d="M 300 330 Q 400 300 501 330" stroke="#3A2A20" stroke-width="9" fill="none"/>`
  + [[364, 320], [437, 320]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="27" fill="#5A3A20" stroke="#8A6420" stroke-width="5"/><circle cx="${x}" cy="${y}" r="18" fill="#FFB347" opacity=".85"/><path d="M ${x-10} ${y-8} q 6 -6 14 -6" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`).join('')
  + `<path d="M 390 318 H 411" stroke="#8A6420" stroke-width="6"/>`;
const PROF_HI = ['Velkommen til eliksirtimen!', 'Goddag, goddag, mine små bryggere!', 'Sæt jer, sæt jer. Gryderne er varme!'];
const PROF_OK = ['Fint!', 'Godt!', 'Præcis!', 'Ja, sådan!', 'Flot!'];
const PROF_MISS = ['PUF! Den var vist ikke på opskriften.', 'Hov! Kig på tavlen igen.', 'Ups, det sodede lidt. Prøv igen!', 'Næsten! Se efter på tavlen.'];
const PROF_DONE = ['Fremragende brygget!', 'En perfekt eliksir!', 'Den kunne jeg ikke have lavet bedre selv.', 'Bravo!'];
const PROF_TAP = ['Mine ører? De er helt almindelige elverører.', 'Jeg har brygget eliksirer i fire hundrede år.', 'Pas på dampen, den kilder i næsen.', 'Brillerne har jeg på, når noget eksploderer. Det sker tit.'];

const POT = { lesson: null, p: null, busy: false, stir: null, mates: [], tapN: 0, saveFx: null };
const CX = 800, CY = 652, CRX = 196, CRY = 38;   /* gryden: midten af væskens overflade */

function cellarBleed(){
  let o = `<rect x="-1700" y="-700" width="5000" height="2400" fill="#141E1C"/>`;
  o += stoneWall(-1700, 3300, 0, 840, '#33403C', 7);
  o += `<rect x="-1700" y="-700" width="5000" height="700" fill="#101816"/>`;
  for (let x = -1640; x < 3300; x += 420) o += `<path d="M ${x} 0 Q ${x+210} -120 ${x+420} 0" fill="none" stroke="#1E2A27" stroke-width="46"/><rect x="${x-28}" y="-30" width="56" height="870" fill="#2A3633" stroke="#18211F" stroke-width="3"/>`;
  o += `<rect x="-1700" y="830" width="5000" height="900" fill="#25302D"/>`;
  for (let i = 0; i < 7; i++){ const y = 830 + i * i * 7 + i * 16; o += `<path d="M -1700 ${y} H 3300" stroke="#18211F" stroke-width="3"/>`; }
  for (let i = -16; i <= 16; i++) o += `<path d="M ${800 + i*110} 830 L ${800 + i*280} 1700" stroke="#18211F" stroke-width="3"/>`;
  /* tørrede urter og løg der hænger fra loftet */
  for (const [x, len, c] of [[60, 120, '#6A8A4A'], [470, 90, '#8A6A3A'], [1000, 70, '#5A7A3A'], [1600, 110, '#7A8A4A'], [-300, 100, '#6A8A4A'], [1900, 90, '#8A6A3A']])
    o += `<path d="M ${x} -10 V ${len}" stroke="#3A2A20" stroke-width="3"/>` + [0, 1, 2, 3].map(k => `<path d="M ${x} ${len - 10 + k*8} q ${-18 + k*10} 20 ${-10 + k*8} 44" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('');
  return o;
}
function ingrJar(id, i){
  const [x, y] = JAR_POS[i], ing = INGR[id], w = 120, h = 130, top = y - h;
  let o = `<g data-hit="jar:${id}" class="pjar"><g class="anim">`;
  o += `<circle cx="${x}" cy="${y - 70}" r="80" fill="${ing.col}" opacity=".12"/>`;
  o += `<path d="M ${x-w/2+8} ${top+24} Q ${x-w/2} ${top+24} ${x-w/2} ${top+40} V ${y-14} Q ${x-w/2} ${y} ${x-w/2+16} ${y} H ${x+w/2-16} Q ${x+w/2} ${y} ${x+w/2} ${y-14} V ${top+40} Q ${x+w/2} ${top+24} ${x+w/2-8} ${top+24} Z" fill="#DDF4EE" fill-opacity=".22" stroke="#9AB8B0" stroke-width="3.5"/>`;
  o += `<g transform="translate(${x} ${y - 66}) scale(.9)">${ing.draw()}</g><g transform="translate(${x - 30} ${y - 26}) scale(.42) rotate(-30)">${ing.draw()}</g><g transform="translate(${x + 32} ${y - 28}) scale(.38) rotate(24)">${ing.draw()}</g>`;
  o += `<path d="M ${x-w/2+14} ${top+46} V ${y-24}" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity=".4"/>`;
  o += `<rect x="${x-w/2+10}" y="${top+6}" width="${w-20}" height="22" rx="6" fill="#B5844A" stroke="#6A4430" stroke-width="3"/>`;
  o += `<g transform="translate(${x} ${y + 26})"><rect x="-74" y="-17" width="148" height="34" rx="8" fill="#E9D3A6" stroke="#6A4430" stroke-width="2.5"/><text x="0" y="8" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="${ing.name.length > 10 ? 18 : 21}" fill="#3A2340">${ing.name}</text></g>`;
  return o + `</g></g>`;
}
function shelfUnit(){
  const W = '#5A3A28';
  let o = `<rect x="34" y="150" width="412" height="680" rx="8" fill="#2A1C14" stroke="#1A100A" stroke-width="4"/><rect x="24" y="140" width="432" height="22" rx="6" fill="${W}" stroke="#2A1810" stroke-width="3"/>`;
  for (const y of [340, 540, 740]) o += `<rect x="30" y="${y}" width="420" height="18" rx="5" fill="${W}" stroke="#2A1810" stroke-width="3"/><rect x="30" y="${y}" width="420" height="5" fill="#7A5236"/>`;
  return o + `<rect x="30" y="150" width="16" height="700" fill="${W}"/><rect x="434" y="150" width="16" height="700" fill="${W}"/>`;
}
function cauldron(){
  let o = `<ellipse cx="${CX}" cy="960" rx="250" ry="22" fill="#000" opacity=".35"/>`;
  /* ilden under gryden */
  o += `<g class="fire">` + [-110, -40, 40, 110].map((dx, i) => `<path class="fl" style="animation-delay:${-(i*0.23).toFixed(2)}s" d="M ${CX+dx} 950 C ${CX+dx+40} 910 ${CX+dx+20} 870 ${CX+dx+4} 846 C ${CX+dx-4} 880 ${CX+dx-36} 900 ${CX+dx} 950 Z" fill="#FF8A3D"/><path class="fl" style="animation-delay:${-(i*0.31+0.1).toFixed(2)}s" d="M ${CX+dx} 950 C ${CX+dx+20} 926 ${CX+dx+12} 900 ${CX+dx+2} 886 C ${CX+dx-4} 906 ${CX+dx-18} 922 ${CX+dx} 950 Z" fill="#FFE27A"/>`).join('') + `</g>`;
  o += `<rect x="${CX-170}" y="940" width="340" height="26" rx="12" fill="#5A3A28" stroke="#2A1810" stroke-width="3" transform="rotate(-4 ${CX} 952)"/><rect x="${CX-160}" y="944" width="320" height="24" rx="12" fill="#6A4430" stroke="#2A1810" stroke-width="3" transform="rotate(5 ${CX} 956)"/>`;
  o += `<ellipse cx="${CX}" cy="900" rx="320" ry="90" fill="#FF8A3D" opacity=".12" class="fireglow"/>`;
  /* ben og krop */
  o += [-150, 0, 150].map(dx => `<path d="M ${CX+dx-16} 880 L ${CX+dx-22} 946 H ${CX+dx+22} L ${CX+dx+16} 880 Z" fill="#1E1A24" stroke="#0E0A12" stroke-width="3"/>`).join('');
  const body = `M ${CX-214} ${CY+6} C ${CX-290} ${CY+90} ${CX-260} ${CY+250} ${CX} ${CY+262} C ${CX+260} ${CY+250} ${CX+290} ${CY+90} ${CX+214} ${CY+6} Z`;
  o += `<path d="${body}" fill="#2A2632" stroke="#0E0A12" stroke-width="5"/>`;
  o += clipG(body, `<path d="M ${CX+60} ${CY} C ${CX+220} ${CY+60} ${CX+250} ${CY+200} ${CX+140} ${CY+262} H ${CX+400} V ${CY} Z" fill="#000" opacity=".3"/><path d="M ${CX-200} ${CY+60} C ${CX-236} ${CY+120} ${CX-220} ${CY+190} ${CX-170} ${CY+220}" stroke="#5A5468" stroke-width="16" fill="none" stroke-linecap="round" opacity=".7"/>`
    + `<ellipse class="potglow" cx="${CX}" cy="${CY+20}" rx="260" ry="70" fill="#5FA88A" opacity=".25"/>`);
  /* hanke */
  o += [-1, 1].map(f => `<path d="M ${CX + f*230} ${CY+40} q ${f*40} 10 ${f*36} 50" stroke="#1E1A24" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('');
  /* kanten og væsken */
  o += `<ellipse cx="${CX}" cy="${CY}" rx="${CRX+26}" ry="${CRY+14}" fill="#3A3644" stroke="#0E0A12" stroke-width="5"/>`;
  o += `<g class="liquid"><ellipse cx="${CX}" cy="${CY+4}" rx="${CRX}" ry="${CRY}" class="liq" fill="#3E6A5A"/><ellipse cx="${CX-40}" cy="${CY}" rx="${CRX*0.55}" ry="${CRY*0.42}" fill="#FFFFFF" opacity=".16"/>`
    + [[-110, 0], [-40, 10], [30, -6], [100, 6], [150, -2]].map(([dx, dy], i) => `<circle class="pbub" style="animation-delay:${-(i*0.55).toFixed(2)}s" cx="${CX+dx}" cy="${CY+dy+4}" r="${10 + (i*5)%10}" fill="#5A8A7A"/>`).join('')
    + `<ellipse class="ripple" cx="${CX}" cy="${CY+4}" rx="20" ry="5" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0"/></g>`;
  o += `<path d="M ${CX-CRX-24} ${CY+2} A ${CRX+24} ${CRY+12} 0 0 0 ${CX+CRX+24} ${CY+2}" fill="none" stroke="#56506A" stroke-width="6" opacity=".8"/>`;
  return o;
}
function steam(){
  if (calm) return '';
  return `<g class="steam">` + [-90, -20, 50, 120].map((dx, i) => `<path class="st" style="animation-delay:${-(i*0.9).toFixed(1)}s" d="M ${CX+dx} ${CY-10} q -24 -40 0 -80 q 24 -40 0 -80" stroke="#7AA89A" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('') + `</g>`;
}
/* sleven som man rører med; den står i gryden og følger fingeren rundt */
function ladle(){
  return `<g class="ladle" style="transform:translate(${CX + 120}px,${CY + 6}px)"><g transform="rotate(18)"><rect x="-8" y="-250" width="16" height="250" rx="6" fill="#8A5A3C" stroke="#4A2E1E" stroke-width="3"/><rect x="-8" y="-250" width="5" height="250" fill="#B5844A"/><ellipse cx="0" cy="-252" rx="12" ry="9" fill="#6A4430" stroke="#4A2E1E" stroke-width="3"/></g></g>`;
}
/* stavelse-ring der viser at der skal røres */
function stirHint(){
  return `<g class="stirhint" pointer-events="none"><ellipse cx="${CX}" cy="${CY+4}" rx="${CRX - 40}" ry="${CRY + 8}" fill="none" stroke="#FFF6D0" stroke-width="6" stroke-dasharray="18 14" opacity=".9"/><path d="M ${CX + CRX - 52} ${CY - 10} l 26 6 l -18 18" fill="none" stroke="#FFF6D0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
function board(){
  const x = 1066, y = 26, w = 510, h = 316;
  return `<g class="board"><path d="M ${x+60} ${y+h} L ${x+30} ${y+h+40} M ${x+w-60} ${y+h} L ${x+w-30} ${y+h+40}" stroke="#3A2A20" stroke-width="10" stroke-linecap="round"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#6A4430" stroke="#2A1810" stroke-width="5"/><rect x="${x+14}" y="${y+14}" width="${w-28}" height="${h-28}" rx="6" fill="#1E2B26"/>`
    + `<path d="M ${x+40} ${y+h-30} q 80 -10 140 0 M ${x+300} ${y+40} q 60 6 120 -4" stroke="#FFFFFF" stroke-width="3" opacity=".06" fill="none"/>`
    + `<g class="recipe"></g><rect x="${x+w-90}" y="${y+h-22}" width="40" height="10" rx="3" fill="#E8E4F4"/></g>`;
}
function stirIcon(){ return `<g><ellipse cx="0" cy="12" rx="34" ry="12" fill="#3A3644" stroke="#0E0A12" stroke-width="3"/><path d="M -24 4 A 26 9 0 1 0 22 2" fill="none" stroke="#FFF6D0" stroke-width="5" stroke-linecap="round"/><path d="M 16 -6 l 8 8 l -11 3" fill="none" stroke="#FFF6D0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M 8 6 L 22 -36" stroke="#B5844A" stroke-width="7" stroke-linecap="round"/></g>`; }
function recipeSvg(p){
  const x = 1066, y = 26, w = 510, steps = p.steps, n = steps.length, two = n > 3, rows = two ? Math.ceil(n / 2) : n;
  const top = y + 74, ch = Math.min(78, (316 - 74 - 22) / rows), cw = two ? (w - 52) / 2 : w - 52;
  let o = `<text x="${x + w/2}" y="${y + 52}" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="30" fill="#FFF6D0">${p.name}</text>`;
  o += `<text x="${x + w - 30}" y="${y + 52}" text-anchor="end" font-family="${FONT_S}" font-weight="600" font-size="18" fill="#9AB8B0">${POT.lesson.n + 1}/3</text>`;
  steps.forEach((s, i) => {
    const col = two ? (i < rows ? 0 : 1) : 0, row = two ? i % rows : i, cx = x + 26 + col * cw, cy = top + row * ch;
    const done = i < p.i, now = i === p.i;
    o += `<g class="step${done ? ' done' : ''}${now ? ' now' : ''}">`;
    if (now) o += `<rect x="${cx - 4}" y="${cy}" width="${cw}" height="${ch - 8}" rx="12" fill="#FFE27A" opacity=".16" stroke="#FFE27A" stroke-width="3"/>`;
    const k = Math.min(1, ch / 90) * 0.72;
    o += `<g transform="translate(${cx + 40} ${cy + (ch - 8) / 2}) scale(${k.toFixed(2)})">${s.kind === 'ror' ? stirIcon() : INGR[s.id].draw()}</g>`;
    const label = s.kind === 'ror' ? `Rør ${s.n} ${s.n === 1 ? 'gang' : 'gange'}` : `× ${s.n}`;
    o += `<text x="${cx + 84}" y="${cy + (ch - 8) / 2 + 9}" font-family="${FONT_S}" font-weight="700" font-size="${s.kind === 'ror' ? (two ? 20 : 26) : 30}" fill="#FFF6D0">${label}</text>`;
    if (now && s.n > 1) o += `<text x="${cx + cw - 16}" y="${cy + (ch - 8) / 2 + 8}" text-anchor="end" font-family="${FONT_S}" font-weight="600" font-size="20" fill="#FFE27A">${p.got}/${s.n}</text>`;
    if (done) o += `<path d="M ${cx + cw - 46} ${cy + ch/2 - 6} l 10 10 l 20 -22" stroke="#7AE08A" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `</g>`;
  });
  return o;
}
function mateImg(m, x, y, h){ return `<image href="${dollUrl(m.st, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${x - h*0.2427}" y="${y - h}" width="${h*0.4854}" height="${h}"/>`; }
function smallCauldron(x, y, col, i){
  return `<g class="mate-pot"><ellipse cx="${x}" cy="${y+44}" rx="60" ry="8" fill="#000" opacity=".3"/><path d="M ${x-50} ${y} C ${x-66} ${y+30} ${x-50} ${y+50} ${x} ${y+52} C ${x+50} ${y+50} ${x+66} ${y+30} ${x+50} ${y} Z" fill="#2A2632" stroke="#0E0A12" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="52" ry="11" fill="#3A3644" stroke="#0E0A12" stroke-width="3"/><ellipse cx="${x}" cy="${y+1}" rx="44" ry="8" fill="${col}"/>`
    + (calm ? '' : `<circle class="mbub" style="animation-delay:${-i*1.3}s" cx="${x-10}" cy="${y}" r="7" fill="${col}"/><circle class="mbub" style="animation-delay:${-i*1.3-0.8}s" cx="${x+14}" cy="${y}" r="5" fill="${col}"/>`) + `</g>`;
}
function potionScene(){
  CLIPN = 0;
  const hero = heroState(), hasPet = hero.pet.kind !== 'ingen', m = POT.mates;
  let o = `<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" style="--liq:#3E6A5A">`;
  o += cellarBleed();
  o += `<g data-hit="vaeg"><rect x="-1700" y="0" width="5000" height="830" fill="transparent"/></g>`;
  o += board();
  /* klassekammeraterne bagved ved deres egne små gryder */
  o += `<rect x="452" y="618" width="210" height="16" rx="5" fill="#5A3A28" stroke="#2A1810" stroke-width="3"/><rect x="470" y="630" width="12" height="190" fill="#4A2E1E"/><rect x="632" y="630" width="12" height="190" fill="#4A2E1E"/>`;
  o += `<rect x="972" y="618" width="200" height="16" rx="5" fill="#5A3A28" stroke="#2A1810" stroke-width="3"/><rect x="988" y="630" width="12" height="190" fill="#4A2E1E"/><rect x="1144" y="630" width="12" height="190" fill="#4A2E1E"/>`;
  if (m[0]) o += `<g data-hit="mate:0"><g class="anim">${mateImg(m[0], 548, 700, 360)}</g></g>`;
  if (m[1]) o += `<g data-hit="mate:1"><g class="anim">${mateImg(m[1], 1074, 700, 350)}</g></g>`;
  o += smallCauldron(560, 588, '#E07AFF', 0) + smallCauldron(1072, 588, '#FFB347', 1);
  o += shelfUnit() + INGR_IDS.map((id, i) => ingrJar(POT.order ? POT.order[i] : id, i)).join('');
  /* professoren til højre under tavlen */
  const S = 700/1030, px = 1210, py = 300;
  o += `<g data-hit="prof"><g class="anim"><image href="${dollUrl(PROF_ST, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${px}" y="${py}" width="${500*S}" height="700"/><g transform="translate(${px} ${py}) scale(${S}) translate(-150 -40)">${PROF_OVER}</g></g></g>`;
  /* figuren bag gryden */
  o += `<g class="hero"><image class="heroimg" href="${dollUrl(hero, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${CX - 160}" y="214" width="320" height="660"/></g>`;
  o += `<g data-hit="gryde">${cauldron()}</g>`;
  o += steam() + ladle() + `<g class="stirwrap"></g>`;
  if (hasPet) o += `<g data-hit="dyr"><g class="anim"><image class="petimg" href="${dollUrl(hero, { viewBox: VB.pet, petOnly: true })}" x="1010" y="780" width="171" height="189"/></g></g>`;
  o += placeMood([[CX, 820, 420, 260], [250, 500, 260, 380]], { vign: .85, warm: .2, dx: 500, dw: 700 });
  o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="#2AFF9A" opacity=".035" pointer-events="none"/>`;
  /* professorens taleboble */
  o += `<g class="say" pointer-events="none"><path d="M 470 34 Q 470 10 494 10 H 1016 Q 1040 10 1040 34 V 92 L 1092 132 L 1040 128 V 150 Q 1040 174 1016 174 H 494 Q 470 174 470 150 Z" fill="#FFF8EC" stroke="#2A3A34" stroke-width="4"/>`
    + `<foreignObject x="484" y="16" width="544" height="152"><div xmlns="http://www.w3.org/1999/xhtml" class="say-text"></div></foreignObject></g>`;
  o += `<g class="fx" pointer-events="none"></g></svg>`;
  return scopeIds(o, 'po');
}
function profSay(t){ const s = $('#potScene .say-text'); if (!s) return; s.textContent = t; const g = s.closest('.say'); g.classList.remove('popsay'); void g.getBoundingClientRect(); g.classList.add('popsay'); }

/* ---------- opskrifter: længere og sværere jo flere eliksirer man har brygget ---------- */
function potLevel(){ return Math.min(4, Math.floor((prog.potions || 0) / 3)); }
function makeRecipe(){
  const lv = potLevel(), n = 2 + Math.min(3, lv), maxN = lv >= 2 ? 3 : 2, steps = [];
  const potion = pick(POTIONS.filter(p => !p.pet || heroState().pet.kind !== 'ingen'));
  let last = null;
  for (let i = 0; i < n; i++){
    const stir = i === n - 1 || (lv >= 2 && i > 0 && steps[i-1].kind !== 'ror' && Math.random() < 0.3);
    if (stir && i > 0) steps.push({ kind:'ror', n: 1 + Math.floor(Math.random() * (lv >= 1 ? 3 : 2)) });
    else { let id; do { id = pick(INGR_IDS); } while (id === last); last = id; steps.push({ kind:'ing', id, n: 1 + Math.floor(Math.random() * maxN) }); }
  }
  return { name: potion.name, potion, steps, i: 0, got: 0, miss: 0, mix: '#3E6A5A' };
}
function showPotions(){
  showScreen('#potion'); playMusic('kaelder');
  POT.lesson = { n: 0, stars: 0 }; POT.busy = false; POT.order = null;
  const taken = [];
  POT.mates = [0, 1].map(i => { const own = i === 1 && Math.random() < 0.3 ? ownGuest(figures.length ? figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].id : null) : null; const g = own || randomGuest(taken); taken.push(g.name); return g; });
  POT.p = makeRecipe();
  renderPotions();
  profSay(`${pick(PROF_HI)} I dag brygger vi ${POT.p.name}. Se opskriften på tavlen, og tryk på krukkerne.`);
}
function renderPotions(){
  const box = $('#potionBody'); box.innerHTML = '';
  box.append(el('div', { class:'scene-wrap', id:'potScene' }), ...placeUi([ backBtn('Gangen', showSchool) ], [ starPill() ]));
  const w = $('#potScene'); w.innerHTML = potionScene();
  const svg = w.querySelector('svg');
  svg.addEventListener('click', e => { const g = e.target.closest('[data-hit]'); if (g) potTap(g.dataset.hit, g, svgPoint(svg, e)); });
  svg.addEventListener('pointerdown', stirStart);
  svg.addEventListener('pointermove', stirMove);
  svg.addEventListener('pointerup', stirEnd); svg.addEventListener('pointercancel', stirEnd);
  setLiquid(POT.p.mix);
  drawRecipe();
}
function drawRecipe(){
  const r = $('#potScene .recipe'); if (r) r.innerHTML = recipeSvg(POT.p);
  const step = POT.p.steps[POT.p.i], wrap = $('#potScene .stirwrap');
  if (wrap) wrap.innerHTML = step && step.kind === 'ror' && !POT.busy ? stirHint() : '';
  $('#potScene svg').classList.toggle('stirring', !!(step && step.kind === 'ror'));
}
function setLiquid(c){ const svg = $('#potScene svg'); if (svg) svg.style.setProperty('--liq', c); }
const potFx = () => $('#potScene .fx');

function potTap(hit, g, pt){
  const [k, v] = hit.split(':'), svg = $('#potScene svg'), p = POT.p;
  if (k === 'prof'){ sfx.pick(); replay(g, 'hop'); profSay(PROF_TAP[POT.tapN++ % PROF_TAP.length]); return; }
  if (k === 'mate'){ sfx.pick(); replay(g, 'hop'); sparkle(svg, pt.x, pt.y, 4); return; }
  if (k === 'dyr'){ sfx.pick(); replay(g, 'hop'); sparkle(svg, pt.x, pt.y - 60, 5, '#FF8FC7'); return; }
  if (k === 'gryde'){ if (POT.stirMoved){ POT.stirMoved = false; return; } const s = p.steps[p.i]; if (s && s.kind === 'ror' && !POT.busy){ profSay('Tegn cirkler i gryden med fingeren!'); replay($('#potScene .stirwrap') || g, 'jiggle'); } else blub(); return; }
  if (k !== 'jar' || POT.busy) return;
  const s = p.steps[p.i]; if (!s) return;
  replay(g, 'jiggle');
  if (s.kind === 'ror'){ sfx.nope(); profSay('Først skal der røres! Tegn cirkler i gryden med fingeren.'); return; }
  throwIn(v, g, v === s.id);
}
function blub(){ const r = $('#potScene .ripple'); if (r){ r.classList.remove('go'); void r.getBoundingClientRect(); r.classList.add('go'); } tone(220, 0.12, 'sine', 0.06, 0, 2.2); }
/* ingrediensen flyver i en bue fra krukken ned i gryden */
async function throwIn(id, jar, right){
  POT.busy = true;
  const idx = (POT.order || INGR_IDS).indexOf(id), [jx, jy] = JAR_POS[idx], fx = potFx();
  const g = svgEl('g', {}, INGR[id].draw()); fx.append(g);
  const sx = jx, sy = jy - 70, ex = CX + (Math.random() * 60 - 30), ey = CY, t0 = performance.now(), D = calm ? 1 : 620;
  sfx.whoosh();
  await new Promise(res => { const step = now => { const t = Math.min(1, (now - t0) / D), e = t;
    const x = sx + (ex - sx) * e, y = sy + (ey - sy) * e - Math.sin(Math.PI * e) * 260, k = 0.9 - 0.45 * e;
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(e * 300).toFixed(0)}) scale(${k.toFixed(2)})`);
    if (t < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
  g.remove();
  const svg = $('#potScene svg'), p = POT.p;
  if (!svg) return;
  blub(); splash(INGR[id].col);
  if (right){
    tone(660, 0.1, 'triangle', 0.06); tone(990, 0.12, 'triangle', 0.05, 0.08);
    p.mix = mixC(p.mix, INGR[id].col, 0.55); setLiquid(p.mix);
    p.got++;
    if (p.got >= p.steps[p.i].n){ p.i++; p.got = 0; profSay(pick(PROF_OK) + (p.steps[p.i] ? ' ' + nextLine(p.steps[p.i]) : '')); }
    drawRecipe();
    POT.busy = false;
    if (p.i >= p.steps.length) finishPotion();
  } else {
    p.miss++;
    await potPuff();
    profSay(pick(PROF_MISS));
    POT.busy = false;
  }
}
function nextLine(s){ return s.kind === 'ror' ? `Nu skal der røres ${s.n} ${s.n === 1 ? 'gang' : 'gange'} rundt.` : `Nu ${s.n === 1 ? 'én' : s.n} ${INGR[s.id].name.toLowerCase()}.`; }
function splash(col){
  if (calm) return; const fx = potFx();
  for (let i = 0; i < 10; i++){ const a = Math.PI + (i / 9) * Math.PI, d = 50 + Math.random() * 60;
    const s = svgEl('circle', { class:'drop', cx: CX + Math.cos(a) * 30, cy: CY, r: 7 + Math.random() * 6, fill: col, style:`--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d - 40).toFixed(0)}px` });
    fx.append(s); setTimeout(() => s.remove(), 800); }
}
/* et forkert puf: en grå røgsky, figuren ryster */
async function potPuff(){
  sfx.nope(); tone(140, 0.35, 'sawtooth', 0.05, 0, 0.5);
  const fx = potFx(), hero = $('#potScene .hero');
  const c = svgEl('g', { class:'smoke' }, [[-80, -40, 90], [40, -70, 110], [120, -20, 80], [-20, -130, 100], [-140, -110, 70]].map(([dx, dy, r]) => `<circle cx="${CX + dx}" cy="${CY + dy}" r="${r}" fill="#6A6478"/><circle cx="${CX + dx - r*0.3}" cy="${CY + dy - r*0.3}" r="${r*0.5}" fill="#8A84A0"/>`).join('')
    + `<text x="${CX}" y="${CY - 60}" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="70" fill="#FFF6D0" stroke="#2A2238" stroke-width="6" paint-order="stroke">PUF!</text>`);
  fx.append(c);
  if (hero){ hero.classList.remove('shake'); void hero.getBoundingClientRect(); hero.classList.add('shake'); }
  await wait(calm ? 300 : 1000); c.remove();
}

/* ---------- røre rundt: man tegner cirkler i gryden ---------- */
function stirStart(e){
  const p = POT.p, s = p && p.steps[p.i]; if (!s || s.kind !== 'ror' || POT.busy) return;
  const svg = e.currentTarget, q = svgPoint(svg, e), nx = (q.x - CX) / (CRX + 120), ny = (q.y - CY) / (CRY + 160);
  if (nx * nx + ny * ny > 1.6) return;
  POT.stir = { a: Math.atan2((q.y - CY) / CRY, (q.x - CX) / CRX), acc: 0, id: e.pointerId, turns: 0 };
  try { svg.setPointerCapture(e.pointerId); } catch (er) {}
  const h = $('#potScene .stirhint'); if (h) h.classList.add('fade');
}
function stirMove(e){
  const st = POT.stir; if (!st || e.pointerId !== st.id) return;
  const q = svgPoint(e.currentTarget, e), a = Math.atan2((q.y - CY) / CRY, (q.x - CX) / CRX);
  let d = a - st.a; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
  st.a = a; st.acc += d;
  const lad = $('#potScene .ladle'); if (lad) lad.style.transform = `translate(${(CX + Math.cos(a) * (CRX - 50)).toFixed(0)}px,${(CY + 6 + Math.sin(a) * (CRY - 10)).toFixed(0)}px)`;
  const p = POT.p, s = p.steps[p.i], turns = Math.floor(Math.abs(st.acc) / (2 * Math.PI));
  if (turns > st.turns){
    st.turns = turns; p.got = turns;
    tone(520 + turns * 120, 0.14, 'triangle', 0.06); sparkle($('#potScene svg'), CX + Math.cos(a) * CRX * 0.6, CY, 5, '#FFF6D0');
    p.mix = mixC(p.mix, p.potion.col, 0.3); setLiquid(p.mix);
    if (turns >= s.n){ POT.stir = null; p.i++; p.got = 0; profSay(pick(PROF_OK) + (p.steps[p.i] ? ' ' + nextLine(p.steps[p.i]) : '')); drawRecipe(); if (p.i >= p.steps.length) finishPotion(); return; }
    drawRecipe();
  }
}
function stirEnd(e){ const st = POT.stir; if (st && e.pointerId === st.id){ POT.stirMoved = Math.abs(st.acc) > 0.6; POT.stir = null; } }

/* ---------- eliksiren er færdig: et stort puf, og så sker der noget sjovt ---------- */
async function finishPotion(){
  POT.busy = true;
  const p = POT.p, svg = $('#potScene svg'), stars = Math.max(1, 3 - p.miss);
  setLiquid(p.potion.col); svg.classList.add('brewed');
  sfx.magic();
  if (!calm) for (let i = 0; i < 3; i++) setTimeout(() => sparkle(svg, CX - 120 + i * 120, CY - 40 - i * 30, 8, p.potion.col), i * 180);
  await wait(calm ? 200 : 900);
  profSay(`${pick(PROF_DONE)} ${p.name}: ${p.potion.line}`);
  await potionEffect(p.potion.fx);
  prog.potions = (prog.potions || 0) + 1; saveProg();
  addStars(stars); POT.lesson.stars += stars;
  starBurst(stars);
  await wait(calm ? 200 : 1500);
  svg.classList.remove('brewed');
  POT.lesson.n++;
  if (POT.lesson.n >= 3){ lessonDone(); return; }
  POT.p = makeRecipe();
  if (potLevel() >= 3){ POT.order = shuffle(INGR_IDS); renderPotions(); }
  setLiquid(POT.p.mix); POT.busy = false; drawRecipe();
  profSay(`Næste eliksir: ${POT.p.name}! ${nextLine(POT.p.steps[0])}`);
}
function starBurst(n){
  const fx = potFx(); if (!fx) return; sfx.coin();
  for (let i = 0; i < n; i++){ const s = svgEl('g', { class:'starfly', style:`--dx:${(i - (n-1)/2) * 110}px;animation-delay:${i * 0.15}s` }, starP(CX, CY - 120, 40, '#FFE27A') + `<polygon points="${star5pts(CX, CY - 120, 40, 17)}" fill="none" stroke="#B98516" stroke-width="4" stroke-linejoin="round"/>`);
    fx.append(s); setTimeout(() => s.remove(), 1800); }
}
async function potionEffect(fx){
  const hero = $('#potScene .hero'), img = $('#potScene .heroimg'), pimg = $('#potScene .petimg'), st = heroState();
  if (!hero) return;
  if (fx === 'haar' || fx === 'pels'){
    const s2 = clone(st), rainbow = ['#FF5FA8','#FFC02E','#62E0CB','#7B5CFF','#9BE36A','#FF8A3D'];
    if (fx === 'haar'){ s2.hair.a = pick(rainbow); s2.hair.b = pickOther(rainbow, s2.hair.a); s2.hair.ombre = true; img.setAttribute('href', dollUrl(s2, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })); }
    else if (pimg){ s2.pet.a = pick(rainbow); s2.pet.b = pickOther(rainbow, s2.pet.a); pimg.setAttribute('href', dollUrl(s2, { viewBox: VB.pet, petOnly: true })); }
    sparkle($('#potScene svg'), fx === 'haar' ? CX : 1095, fx === 'haar' ? 300 : 860, 10, '#FFF6D0');
    await wait(calm ? 300 : 3600);
    if (fx === 'haar') img.setAttribute('href', dollUrl(st, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true }));
    else if (pimg) pimg.setAttribute('href', dollUrl(st, { viewBox: VB.pet, petOnly: true }));
    return;
  }
  if (fx === 'hik'){ for (let i = 0; i < 4; i++){ hero.classList.remove('hik'); void hero.getBoundingClientRect(); hero.classList.add('hik'); tone(700 + i*40, 0.08, 'square', 0.04, 0, 1.6); await wait(calm ? 50 : 700); } hero.classList.remove('hik'); return; }
  hero.classList.add('fx-' + fx);
  if (fx === 'glimmer' && !calm) for (let i = 0; i < 6; i++) setTimeout(() => sparkle($('#potScene svg'), CX - 100 + Math.random() * 200, 260 + Math.random() * 300, 6, pick(['#FFE27A','#FFF6D0','#FF8FC7'])), i * 400);
  await wait(calm ? 300 : 3400);
  hero.classList.remove('fx-' + fx);
  await wait(calm ? 0 : 500);
}
function lessonDone(){
  const bonus = 2; addStars(bonus); POT.lesson.stars += bonus;
  sfx.fanfare();
  const card = el('div', { class:'reveal magic m-dyr lesson-card' }, [
    el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
    ...[0, 1, 2, 3].map(i => el('span', { class:'mc-corner c' + i, 'aria-hidden':'true', html: MC_CORNER })),
    el('div', { class:'reveal-info' }, [
      el('p', { class:'reveal-cat' }, 'Eliksirtimen er slut'),
      el('h3', { class:'reveal-name' }, `Du fik ${POT.lesson.stars} stjerner!`),
      el('div', { class:'lesson-stars', html: STAR_SVG.repeat(Math.min(12, POT.lesson.stars)) }),
      el('p', { class:'lesson-note' }, `Tre eliksirer brygget, plus ${bonus} ekstra for en hel time.`),
      el('div', { class:'reveal-btns row' }, [
        el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); goTo(showSchool); } } }, 'Tilbage til gangen'),
        el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); goTo(showPotions); } } }, 'En time til') ]) ]) ]);
  const veil = el('div', { class:'shop-veil' }, [ card ]);
  $('#potionBody').append(veil); confetti(veil, 50);
  profSay('Det var timen for i dag. Godt arbejde!');
}
