/* ================= Skolen: gangen med dørene til fagene, og eliksirtimen ================= */
const FONT_S = "Fredoka, Nunito, sans-serif";

/* ---------- gangen ---------- */
const FAG = [
  { id:'eliksir', name:'Eliksirer', x:330, col:'#3E7A4A', open: () => showPotions() },
  { id:'kost', name:'Kosteflyvning', x:650, col:'#2E4A7A', open: () => Kost.show() },
  { id:'dyrepas', name:'Dyrepasning', x:970, col:'#7A4E35' },
  { id:'faldskaerm', name:'Faldskærm', x:1290, col:'#6B3FA0', open: () => Fald.show() },
];
/* små tegn over dørene: kedel, kost, pote, faldskærm */
const FAG_ICON = {
  eliksir: '<path d="M -26 -6 Q -30 22 0 26 Q 30 22 26 -6 Z" fill="#2A2238"/><ellipse cx="0" cy="-6" rx="28" ry="7" fill="#5FE0A0"/><circle cx="-8" cy="-16" r="5" fill="#5FE0A0" opacity=".8"/><circle cx="6" cy="-24" r="3.5" fill="#5FE0A0" opacity=".6"/>',
  kost: '<path d="M -32 22 L 12 -6" stroke="#B5844A" stroke-width="6" stroke-linecap="round"/><path d="M 8 -10 C 18 -22 30 -30 40 -30 C 36 -22 38 -12 34 0 C 26 2 18 0 12 -2 Z" fill="#E9C46A" stroke="#8A6420" stroke-width="2.5" stroke-linejoin="round"/><path d="M 14 -6 L 34 -24 M 20 -2 L 36 -14" stroke="#B98A2E" stroke-width="2"/><rect x="4" y="-10" width="9" height="9" rx="2" transform="rotate(-33 8 -6)" fill="#8A2A2A"/>',
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
  let o = `<g data-hit="fag:${f.id}" class="fag-door"><g class="anim">`;
  o += `<path d="M ${x-w/2-24} ${base} V ${top+90} Q ${x-w/2-24} ${top-34} ${x} ${top-40} Q ${x+w/2+24} ${top-34} ${x+w/2+24} ${top+90} V ${base} Z" fill="#4A4266" stroke="#2A2340" stroke-width="5"/>`;
  for (let i = 0; i < 9; i++){ const a = Math.PI * (i / 8), rx = w/2 + 12, cx = x - Math.cos(a) * rx, cy = top + 90 - Math.sin(a) * (rx + 4);
    o += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="9" fill="#5A527A" stroke="#2A2340" stroke-width="2"/>`; }
  const D = `M ${x-w/2} ${base} V ${top+90} Q ${x-w/2} ${top-14} ${x} ${top-18} Q ${x+w/2} ${top-14} ${x+w/2} ${top+90} V ${base} Z`;
  /* bag dørene: lyset fra klasseværelset, som ses, når de går op */
  o += `<path d="${D}" fill="#FFD27A"/><path d="${D}" fill="url(#doorIn)"/>`;
  /* to dørfløje, der hver drejer om sit hængsel */
  const half = side => side < 0 ? `M ${x-w/2} ${base} V ${top+90} Q ${x-w/2} ${top-14} ${x} ${top-18} V ${base} Z` : `M ${x} ${base} V ${top-18} Q ${x+w/2} ${top-14} ${x+w/2} ${top+90} V ${base} Z`;
  const leaf = side => { const hx = side < 0 ? x - w/2 : x + w/2, H = half(side);
    return `<g class="leaf ${side < 0 ? 'l' : 'r'}" style="transform-origin:${hx}px 0px"><path d="${H}" fill="${f.col}" stroke="#2A1810" stroke-width="5" stroke-linejoin="round"/>`
      + clipG(H, (side < 0 ? [-70, -35] : [35, 70]).map(dx => `<path d="M ${x+dx} ${top-30} V ${base}" stroke="${fdk(f.col, .3)}" stroke-width="4"/>`).join('')
        + [top + 120, base - 120].map(y => `<rect x="${side < 0 ? x-w/2 : x}" y="${y}" width="${w/2}" height="16" fill="#2E2A38"/>` + (side < 0 ? [-90, -30] : [30, 90]).map(dx => `<circle cx="${x+dx}" cy="${y+8}" r="4" fill="#7A7290"/>`).join('')).join('')
        + (side < 0 ? `<path d="M ${x-w/2+20} ${top+40} Q ${x-w/2+20} ${top+10} ${x-w/2+50} ${top} V ${base} H ${x-w/2+20} Z" fill="#FFFFFF" opacity=".06"/>` : `<path d="M ${x+w/2-24} ${top+60} V ${base}" stroke="#000000" stroke-width="10" opacity=".08"/>`))
      + `<circle cx="${x + side * 70}" cy="${(top+base)/2+20}" r="12" fill="#E9C46A" stroke="#8A6420" stroke-width="3"/></g>`; };
  o += leaf(-1) + leaf(1);
  /* skilt over døren med fagets tegn og navn */
  o += `<g transform="translate(${x} ${top-92})"><rect x="-108" y="-34" width="216" height="68" rx="14" fill="#3A2A20" stroke="#C9A04A" stroke-width="4"/><g transform="translate(-78 2) scale(.78)">${FAG_ICON[f.id]}</g><text x="24" y="9" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="${f.name.length > 10 ? 20 : 24}" fill="#FFE9A0"${f.name.length > 10 ? ' textLength="138" lengthAdjust="spacingAndGlyphs"' : ''}>${f.name}</text></g>`;
  if (open){
    o += `<path d="M ${x-w/2} ${base} L ${x-w/2-30} ${base+60} H ${x+w/2+30} L ${x+w/2} ${base} Z" fill="#FFD27A" opacity=".18"/>`;
    /* lyset siver ud gennem sprækken mellem fløjene, hele vejen fra buen og ned */
    o += `<rect x="${x-3}" y="${top-16}" width="6" height="${base-top+16}" fill="#FFE27A" opacity=".55" class="doorglow"/>`;
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
  o += `<defs><radialGradient id="doorIn" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#FFF3C0"/><stop offset=".6" stop-color="#FFB347" stop-opacity=".6"/><stop offset="1" stop-color="#8A4A2A" stop-opacity=".9"/></radialGradient></defs>`;
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
let SCHOOL_BUSY = false;
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
    if (SCHOOL_BUSY) return; SCHOOL_BUSY = true;
    sfx.open(); g.classList.add('open'); setTimeout(() => { SCHOOL_BUSY = false; goTo(f.open); }, calm ? 0 : 650); });
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
/* 30 eliksirer, 10 på hvert niveau. Hver eliksir har sin egen faste opskrift (se makeRecipe) */
const POTIONS = [
  /* let */
  { lv:0, name:'Svæveeliksir', fx:'svaev', col:'#8FD8FF', line:'Du svæver! Hold fast i hatten!' },
  { lv:0, name:'Krympedrik', fx:'lille', col:'#FF8FC7', line:'Hov, hvor blev du af? Bare rolig, det går over.' },
  { lv:0, name:'Glimmerdrik', fx:'glimmer', col:'#FFE27A', line:'Du glimter som en stjerne!' },
  { lv:0, name:'Hikkedrik', fx:'hik', col:'#9BE36A', line:'Hik! Det er en ægte hikkedrik.' },
  { lv:0, name:'Hjertedrik', fx:'hjerter', col:'#FF6F9C', line:'Der flyver hjerter ud af ørerne på dig!' },
  { lv:0, name:'Boblebryg', fx:'bobler', col:'#9FE7FF', line:'Sæbebobler over det hele!' },
  { lv:0, name:'Hoppesaft', fx:'hop', col:'#FFB347', line:'Hop, hop, hop! Benene vil ikke holde op.' },
  { lv:0, name:'Snurredrik', fx:'snurre', col:'#C9A0FF', line:'Du snurrer rundt som en top!' },
  { lv:0, name:'Blomsterdrik', fx:'blomster', col:'#FF9FD0', line:'Der gror blomster omkring dig!' },
  { lv:0, name:'Kildedrik', fx:'latter', col:'#FFD36E', line:'Hihi! Den kilder helt ned i tæerne.' },
  /* mellem */
  { lv:1, name:'Kæmpedrik', fx:'stor', col:'#A07AFF', line:'Du er blevet kæmpestor!' },
  { lv:1, name:'Regnbuesaft', fx:'haar', col:'#FFB347', line:'Sikke en hårfarve! Den holder heldigvis kun lidt.' },
  { lv:1, name:'Pelsfarvebryg', fx:'pels', col:'#7AE0C0', line:'Se dit dyr! Det har skiftet farve!', pet: true },
  { lv:1, name:'Spejldrik', fx:'spejl', col:'#B8C6FF', line:'Alt er spejlvendt! Venstre er højre, og højre er venstre.' },
  { lv:1, name:'Snefnugdrik', fx:'sne', col:'#DDF3FF', line:'Brr! Det sner kun på dig.' },
  { lv:1, name:'Musikdrik', fx:'noder', col:'#7AD0FF', line:'Du synger, hver gang du trækker vejret!' },
  { lv:1, name:'Sommerfugledrik', fx:'sommerfugle', col:'#FFC0E8', line:'Sommerfuglene tror, du er en blomst.' },
  { lv:1, name:'Fladdrik', fx:'flad', col:'#9BE3C8', line:'Du er blevet flad som en pandekage!' },
  { lv:1, name:'Strækkedrik', fx:'lang', col:'#F2A86A', line:'Du er blevet lang som en stige!' },
  { lv:1, name:'Søvndrik', fx:'zzz', col:'#8A9BE0', line:'Gaaab ... bare et lille hvil.' },
  /* svær */
  { lv:2, name:'Usynlighedsdrik', fx:'usynlig', col:'#E8F4FF', line:'Hvor blev du af? Du er helt usynlig!' },
  { lv:2, name:'Hovedkulsdrik', fx:'hoved', col:'#FF7A5A', line:'Du står på hovedet! Pas på hatten.' },
  { lv:2, name:'Dobbeltdrik', fx:'klon', col:'#7AE0C0', line:'Nu er der tre af dig!' },
  { lv:2, name:'Lysdrik', fx:'lys', col:'#FFF2A0', line:'Du lyser op i hele kælderen!' },
  { lv:2, name:'Regnskydrik', fx:'regn', col:'#7FA8D8', line:'Du har fået din helt egen regnsky.' },
  { lv:2, name:'Dragepust', fx:'ild', col:'#FF5A2A', line:'Du puster ild som en rigtig drage!' },
  { lv:2, name:'Farveskiftedrik', fx:'farver', col:'#E07AFF', line:'Du skifter farve som en kamæleon!' },
  { lv:2, name:'Spøgelsesdrik', fx:'spoegelse', col:'#CFE8F0', line:'Buuh! Du er gennemsigtig som et spøgelse.' },
  { lv:2, name:'Svimmeldrik', fx:'stjerner', col:'#FFD54A', line:'Du ser stjerner! Hold fast i gryden.' },
  { lv:2, name:'Regnbuedrik', fx:'regnbue', col:'#FF8AD8', line:'En regnbue lige over dit hoved!' },
];
const DIFF = [
  { name:'Let', note:'Krukker og omrøring. Kan ikke gå galt.', stars:'1 ★ pr. eliksir', bonus: 1 },
  { name:'Mellem', note:'Rør den rigtige vej, timeglas og blæsebælg.', stars:'op til 4 ★ pr. eliksir', bonus: 2 },
  { name:'Svær', note:'Tavlen dækkes, og der røres på tid. Løber timeglasset ud, eller laver du 3 fejl, koger eliksiren over.', stars:'op til 5 ★ pr. eliksir', bonus: 3 },
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
const PROF_FAIL = ['Det sker for selv de bedste bryggere.', 'Øv! Den prøver vi igen en anden gang.', 'Svære eliksirer er svære. Det er derfor, de giver flest stjerner.'];
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
/* tælleren over gryden: hvor mange gange der er rørt; med en ring, der løber ud, når der røres på tid */
function stirCounter(st){
  const R = 34, C = (2 * Math.PI * R).toFixed(1);
  return `<g class="stircnt" pointer-events="none" transform="translate(${CX} ${CY - 128})"><circle r="${R + 8}" fill="#1E2B26" opacity=".72"/>`
    + (st.time ? `<circle r="${R}" fill="none" stroke="#3A4A44" stroke-width="7"/><circle class="tring" r="${R}" fill="none" stroke="#FFE27A" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="0" transform="rotate(-90)"/>` : '')
    + `<text class="stirn" y="10" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="28" fill="#FFF6D0">${Math.min((POT.p && POT.p.got) || 0, st.n)}/${st.n}</text></g>`;
}
function stirHint(d = 1){
  return `<g class="stirhint${d < 0 ? ' ccw' : ''}" pointer-events="none"><g transform="${d < 0 ? `translate(${2 * CX} 0) scale(-1 1)` : ''}"><ellipse cx="${CX}" cy="${CY+4}" rx="${CRX - 40}" ry="${CRY + 8}" fill="none" stroke="#FFF6D0" stroke-width="6" stroke-dasharray="18 14" opacity=".9"/><path d="M ${CX + CRX - 52} ${CY - 10} l 26 6 l -18 18" fill="none" stroke="#FFF6D0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
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
    o += `<g transform="translate(${cx + 40} ${cy + (ch - 8) / 2}) scale(${k.toFixed(2)})">${s.kind === 'ror' ? stirIcon() : s.kind === 'varme' ? flameIcon() : INGR[s.id].draw()}</g>`;
    const label = s.kind === 'ror' ? (s.dir ? `Rør ${s.n}` : `Rør ${s.n} ${s.n === 1 ? 'gang' : 'gange'}`) : s.kind === 'varme' ? 'Varm op' : `× ${s.n}`;
    const fs = s.kind === 'ing' ? 30 : two ? 20 : 26, my = cy + (ch - 8) / 2;
    o += `<text x="${cx + 84}" y="${my + 9}" font-family="${FONT_S}" font-weight="700" font-size="${fs}" fill="#FFF6D0">${label}</text>`;
    if (s.kind === 'ror' && s.dir) o += `<g transform="translate(${cx + 84 + label.length * fs * .56 + 18} ${my}) scale(${two ? 1 : 1.25})">${dirIcon(s.dir)}</g>`;
    if (s.kind === 'ror' && s.time) o += `<g transform="translate(${cx + 84 + label.length * fs * .56 + 50} ${my + 12}) scale(${two ? .32 : .4})">${hgIcon()}</g>`;
    if (now && s.n > 1 && s.kind === 'ing') o += `<text x="${cx + cw - 16}" y="${cy + (ch - 8) / 2 + 8}" text-anchor="end" font-family="${FONT_S}" font-weight="600" font-size="20" fill="#FFE27A">${p.got}/${s.n}</text>`;
    if (done) o += `<path d="M ${cx + cw - 46} ${cy + ch/2 - 6} l 10 10 l 20 -22" stroke="#7AE08A" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `</g>`;
  });
  /* fra niveau 3 hænger et klæde over tavlen; man kan kigge ved at trykke */
  if (POT.covered) o += `<g class="cover"><path d="M 1072 32 H 1570 V 300 Q 1520 318 1470 300 Q 1420 318 1370 300 Q 1320 318 1270 300 Q 1220 318 1170 300 Q 1120 318 1072 300 Z" fill="#6A2A4A" stroke="#3A1028" stroke-width="4"/>`
    + [1150, 1250, 1350, 1450].map(x => `<path d="M ${x} 40 Q ${x + 6} 170 ${x - 4} 296" stroke="#4A1A34" stroke-width="3" fill="none" opacity=".6"/>`).join('')
    + `<text x="1321" y="120" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="30" fill="#FFE9F3">Hvad stod der nu?</text>`
    + [0, 1, 2].map(k => { const ex = 1241 + k * 80, open = k < (POT.peeks ?? 3); return open
        ? `<g transform="translate(${ex} 178)"><path d="M -26 0 Q 0 -22 26 0 Q 0 22 -26 0 Z" fill="#FFF6FA" stroke="#3A1028" stroke-width="3"/><circle r="9" fill="#5A2A8A"/><circle r="4" fill="#1A0A20"/><circle cx="-3" cy="-3" r="2.2" fill="#FFF"/></g>`
        : `<g transform="translate(${ex} 178)" opacity=".55"><path d="M -26 0 Q 0 16 26 0" fill="none" stroke="#FFC8DE" stroke-width="4" stroke-linecap="round"/><path d="M -16 8 l -4 7 M 0 11 v 8 M 16 8 l 4 7" stroke="#FFC8DE" stroke-width="3" stroke-linecap="round"/></g>`; }).join('')
    + `<text x="1321" y="246" text-anchor="middle" font-family="${FONT_S}" font-weight="600" font-size="22" fill="#FFC8DE">${(POT.peeks ?? 3) > 0 ? `Tryk for at kigge (${POT.peeks ?? 3} kig tilbage)` : 'Ikke flere kig'}</text></g>`;
  return o;
}
/* en lille rund pil, der viser vejen: 1 er med uret, -1 mod uret */
function dirIcon(d){
  const r = 12, a1 = 2.1, P = a => [(Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1)], [x0, y0] = P(-2.3), [x1, y1] = P(a1);
  const tx = -Math.sin(a1), ty = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1), ex = +x1, ey = +y1;
  const head = `${(ex + tx * 8).toFixed(1)},${(ey + ty * 8).toFixed(1)} ${(ex + nx * 6).toFixed(1)},${(ey + ny * 6).toFixed(1)} ${(ex - nx * 6).toFixed(1)},${(ey - ny * 6).toFixed(1)}`;
  return `<g transform="scale(${d} 1)"><path d="M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}" stroke="#FFE27A" stroke-width="4" fill="none" stroke-linecap="round"/><polygon points="${head}" fill="#FFE27A"/></g>`;
}
function flameIcon(){ return `<g><path d="M 0 40 C -30 40 -36 12 -20 -8 C -18 6 -10 10 -6 4 C -12 -16 -2 -34 10 -42 C 8 -24 34 -10 30 14 C 28 32 16 40 0 40 Z" fill="#FF8A3D" stroke="#A8442A" stroke-width="4" stroke-linejoin="round"/><path d="M 0 36 C -14 36 -16 20 -6 10 C -4 18 4 18 6 12 C 14 20 14 36 0 36 Z" fill="#FFE27A"/></g>`; }
function hgIcon(){ return `<g><rect x="-24" y="-46" width="48" height="8" rx="3" fill="#C9A04A"/><rect x="-24" y="38" width="48" height="8" rx="3" fill="#C9A04A"/><path d="M -18 -38 H 18 C 18 -14 4 -6 2 0 C 4 6 18 14 18 38 H -18 C -18 14 -4 6 -2 0 C -4 -6 -18 -14 -18 -38 Z" fill="#DDEFFF" stroke="#FFF6D0" stroke-width="3"/><path d="M -12 38 C -10 26 10 26 12 38 Z M -6 -20 H 6 L 0 -8 Z" fill="#FFD36E"/></g>`; }
function mateImg(m, x, y, h, i){ return `<image class="still-doll" data-doll="mate:${i}" href="${dollUrl(m.st, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${x - h*0.2427}" y="${y - h}" width="${h*0.4854}" height="${h}"/>`; }
/* klassekammeraterne og professoren laves om til almindelige billeder: en animeret SVG-figur tegnes helt forfra
   i hvert eneste billede, og fem af dem gjorde eliksirtimen langsom */
async function stillDolls(svg){
  if (typeof raster !== 'function') return;
  const m = svg.getScreenCTM(); const k = Math.min(3, Math.max(1, (m ? m.a : .5) * (window.devicePixelRatio || 1)));
  for (const im of svg.querySelectorAll('image[data-doll]')){
    const [kind, i] = im.dataset.doll.split(':'), st = kind === 'prof' ? PROF_ST : kind === 'hero' ? heroState() : (POT.mates[+i] || {}).st; if (!st) continue;
    const w = +im.getAttribute('width'), h = +im.getAttribute('height');
    const n = CLIPN, u = await raster(renderDoll(st, { viewBox:'150 40 500 1030', pet:false, anim: false, idle: true }), w * k, h * k); CLIPN = n;
    if (u && im.isConnected) im.setAttribute('href', u);
  }
}
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
  o += `<g data-hit="tavle">${board()}</g>`;
  if (potLevel() >= 1) o += hourglass();
  /* klassekammeraterne bagved ved deres egne små gryder */
  o += `<rect x="452" y="618" width="210" height="16" rx="5" fill="#5A3A28" stroke="#2A1810" stroke-width="3"/><rect x="470" y="630" width="12" height="190" fill="#4A2E1E"/><rect x="632" y="630" width="12" height="190" fill="#4A2E1E"/>`;
  o += `<rect x="972" y="618" width="200" height="16" rx="5" fill="#5A3A28" stroke="#2A1810" stroke-width="3"/><rect x="988" y="630" width="12" height="190" fill="#4A2E1E"/><rect x="1144" y="630" width="12" height="190" fill="#4A2E1E"/>`;
  if (m[0]) o += `<g data-hit="mate:0"><g class="anim">${mateImg(m[0], 548, 700, 360, 0)}</g></g>`;
  if (m[1]) o += `<g data-hit="mate:1"><g class="anim">${mateImg(m[1], 1074, 700, 350, 1)}</g></g>`;
  o += smallCauldron(560, 588, '#E07AFF', 0) + smallCauldron(1072, 588, '#FFB347', 1);
  o += shelfUnit() + INGR_IDS.map((id, i) => ingrJar(POT.order ? POT.order[i] : id, i)).join('');
  /* professoren til højre under tavlen */
  const S = 700/1030, px = 1210, py = 300;
  o += `<g data-hit="prof"><g class="anim"><image class="still-doll" data-doll="prof:0" href="${dollUrl(PROF_ST, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${px}" y="${py}" width="${500*S}" height="700"/><g transform="translate(${px} ${py}) scale(${S}) translate(-150 -40)">${PROF_OVER}</g></g></g>`;
  /* figuren bag gryden */
  o += `<g class="hero"><image class="heroimg still-doll" data-doll="hero:0" href="${dollUrl(hero, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${CX - 160}" y="214" width="320" height="660"/></g>`;
  o += `<g data-hit="gryde">${cauldron()}</g>`;
  if (potLevel() >= 2) o += heatGear();
  o += steam() + ladle() + `<g class="stirwrap"></g>`;
  if (hasPet) o += `<g data-hit="dyr"><g class="anim"><image class="petimg" href="${dollUrl(hero, { viewBox: VB.pet, petOnly: true })}" x="1010" y="780" width="171" height="189"/></g></g>`;
  o += placeMood([[CX, 820, 420, 260], [250, 500, 260, 380]], { vign: .85, warm: .2, dx: 500, dw: 700 });
  o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="#2AFF9A" opacity=".035" pointer-events="none"/>`;
  /* professorens taleboble */
  o += `<g class="say" data-hit="say"><path d="M 470 34 Q 470 10 494 10 H 1016 Q 1040 10 1040 34 V 92 L 1092 132 L 1040 128 V 150 Q 1040 174 1016 174 H 494 Q 470 174 470 150 Z" fill="#FFF8EC" stroke="#2A3A34" stroke-width="4"/>`
    + `<foreignObject x="484" y="16" width="544" height="152"><div xmlns="http://www.w3.org/1999/xhtml" class="say-text"></div></foreignObject>`
    + `<g class="say-more" hidden><circle cx="1012" cy="150" r="20" fill="#7A4FD8" stroke="#2A3A34" stroke-width="3"/><path d="M 1005 140 L 1022 150 L 1005 160 Z" fill="#FFF8EC"/></g>`
    + `<g class="say-tap"><rect x="820" y="184" width="220" height="40" rx="20" fill="#7A4FD8" stroke="#2A3A34" stroke-width="3"/><text x="930" y="211" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="22" fill="#FFF8EC">Tryk for at gå videre</text></g></g>`;
  o += `<g class="fx" pointer-events="none"></g></svg>`;
  return scopeIds(o, 'po');
}
/* professoren taler. Har hun mere at sige, viser boblen en lille pil, og man trykker på boblen for at gå videre */
/* professoren venter, til man trykker: en pil i taleboblen viser, at man skal trykke for at gå videre.
   Et tryk hvor som helst på scenen virker. */
function waitTap(){
  const m = $('#potScene .say-more'), svg = $('#potScene svg');
  if (m) m.removeAttribute('hidden'); if (svg) svg.classList.add('waittap');
  return new Promise(res => { POT.sayWait = () => { POT.sayWait = null; if (m) m.setAttribute('hidden', ''); if (svg) svg.classList.remove('waittap'); sfx.pick(); res(); }; });
}
function profSay(t, more = []){
  POT.sayQ = more.slice();
  if (t && typeof t === 'object'){ markTip(t.k); t = t.t; }
  const s = $('#potScene .say-text'); if (!s) return; s.textContent = t;
  const m = $('#potScene .say-more'); if (m) m.toggleAttribute('hidden', !POT.sayQ.length); s.style.fontSize = t.length > 112 ? '23px' : t.length > 88 ? '26px' : ''; const g = s.closest('.say'); g.classList.remove('popsay'); void g.getBoundingClientRect(); g.classList.add('popsay'); }

/* ---------- opskrifter: længere og sværere jo flere eliksirer man har brygget ---------- */
/* sværhedsgraden vælges ved timens start: let (0), mellem (1), svær (2). Scenens udstyr følger med */
function potLevel(){ return [0, 2, 4][POT.diff || 0]; }
/* en eliksirs opskrift er altid den samme: tilfældet er sået med eliksirens navn */
function seeded(str){ let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
function makeRecipe(potion){
  const d = potion.lv, R = seeded(potion.name), n = [3, 4, 5][d], maxN = [2, 3, 3][d], steps = [];
  let last = null;
  for (let i = 0; i < n; i++){
    const stir = i === n - 1 || (d >= 1 && i > 0 && steps[i-1].kind !== 'ror' && R() < 0.3);
    if (stir && i > 0) steps.push({ kind:'ror', n: 1 + Math.floor(R() * (d >= 1 ? 3 : 2)) });
    else { let id; do { id = INGR_IDS[Math.floor(R() * INGR_IDS.length)]; } while (id === last); last = id; steps.push({ kind:'ing', id, n: 1 + Math.floor(R() * maxN) }); }
  }
  /* mellem: der skal røres en bestemt vej, og gryden skal tit varmes. Svær: nogle gange skal der røres på tid */
  steps.forEach(st => { if (st.kind === 'ror'){ if (d >= 1) st.dir = R() < .5 ? 1 : -1; if (d >= 2 && R() < .5) st.time = Math.round(3 + st.n * 2.5); } });
  if (d >= 1 && R() < .7){ const at = 1 + Math.floor(R() * (steps.length - 1)); steps.splice(at, 0, { kind:'varme', n: 1 }); }
  return { name: potion.name, potion, steps, i: 0, got: 0, miss: 0, mix: '#3E6A5A' };
}
/* en ny opskrift går i gang: timeglasset vendes, gryden er lun, og fra niveau 3 dækkes tavlen efter et øjeblik */
function startRecipe(){
  const lv = potLevel(), p = POT.p, varme = p.steps.filter(st => st.kind === 'varme').length;
  POT.hg = lv >= 1 ? { t0: performance.now(), lim: (POT.diff === 2 ? 10 + p.steps.length * 5 + varme * 5 : 12 + p.steps.length * 6 + varme * 6) * 1000, out: false } : null;
  POT.heat = 30; POT.heatOk = 0; POT.timer = null; POT.covered = false; POT.peeks = 3; clearTimeout(POT.peekT); POT.peekT = 0;
  clearTimeout(POT.coverT);
  if (lv >= 3) POT.coverT = setTimeout(() => { if (POT.p === p && p.i < p.steps.length){ POT.covered = true; drawRecipe(); profSay(tipOnce('tavle', 'Nu dækker jeg tavlen! Kan du huske opskriften? Tryk på tavlen, hvis du vil kigge.') || 'Tavlen er dækket. Tryk på den for at kigge.'); } }, 8000);
}
/* professoren forklarer en ny ting første gang, den dukker op */
function tipOnce(k, text){ prog.potTips = prog.potTips || []; if (prog.potTips.includes(k)) return ''; prog.potTips.push(k); saveProg(); return text; }
function markTip(k){ prog.potTips = prog.potTips || []; if (k && !prog.potTips.includes(k)){ prog.potTips.push(k); saveProg(); } }
/* nye ting forklares, første gang de dukker op. De står i kø efter goddag og regnes først som set, når de er vist */
function startTips(){
  const lv = potLevel(), seen = prog.potTips || [], tips = [];
  if (POT.diff === 1 && !seen.includes('timeglas')) tips.push({ k: 'timeglas', t: 'Se timeglasset! Bliver du færdig, før det løber ud, får du en ekstra stjerne.' });
  if (POT.diff === 2 && !seen.includes('timeglas2')) tips.push({ k: 'timeglas2', t: 'På svær skal du være færdig, før timeglasset løber ud. Og laver du tre fejl, koger eliksiren over!' });
  if (lv >= 3 && !seen.includes('tavle0')) tips.push({ k: 'tavle0', t: 'Kig godt på tavlen, for om lidt dækker jeg den!' });
  return tips;
}
function showPotions(){
  showScreen('#potion'); playMusic('kaelder');
  POT.lesson = { n: 0, stars: 0 }; POT.busy = false; POT.order = null;
  const taken = [];
  POT.mates = [0, 1].map(i => { const own = i === 1 && Math.random() < 0.3 ? ownGuest(figures.length ? figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].id : null) : null; const g = own || randomGuest(taken); taken.push(g.name); return g; });
  POT.diff = Math.max(0, Math.min(2, prog.potDiff || 0)); POT.queue = lessonPotions(POT.diff);
  POT.p = makeRecipe(POT.queue[0]); POT.busy = true;
  renderPotions(); profSay(pick(PROF_HI));
  chooseDiff();
}
/* tre forskellige eliksirer fra niveauet; dem man ikke har brygget før, kommer først */
function lessonPotions(d){
  const br = prog.brewed || {}, pool = POTIONS.filter(p => p.lv === d && (!p.pet || heroState().pet.kind !== 'ingen'));
  return shuffle(pool.filter(p => !br[p.name])).concat(shuffle(pool.filter(p => br[p.name]))).slice(0, 3);
}
const brewedOf = d => POTIONS.filter(p => p.lv === d && (prog.brewed || {})[p.name]).length;
function chooseDiff(){
  const veil = el('div', { class:'shop-veil diff-veil' });
  const card = el('div', { class:'reveal magic m-dyr lesson-card diff-card' }, [
    el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
    ...[0, 1, 2, 3].map(i => el('span', { class:'mc-corner c' + i, 'aria-hidden':'true', html: MC_CORNER })),
    el('div', { class:'reveal-info' }, [
      el('p', { class:'reveal-cat' }, 'Eliksirtimen'),
      el('h3', { class:'reveal-name' }, 'Hvor svært skal det være?'),
      el('div', { class:'diff-list' }, DIFF.map((d, i) => el('button', { class:'diff-btn d' + i + (i === POT.diff ? ' last' : ''), type:'button', on:{ click: () => { sfx.pick(); veil.remove(); startLesson(i); } } }, [
        el('span', { class:'diff-name' }, d.name), el('span', { class:'diff-note' }, d.note),
        el('span', { class:'diff-meta' }, `${d.stars} · ${brewedOf(i)}/${POTIONS.filter(p => p.lv === i).length} i bogen`) ]))),
      el('div', { class:'reveal-btns row' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); potionBook(veil); } } }, `Eliksirbogen (${POTIONS.filter(p => (prog.brewed || {})[p.name]).length}/${POTIONS.length})`) ]) ]) ]);
  veil.append(card); $('#potionBody').append(veil);
}
function startLesson(d){
  POT.diff = d; prog.potDiff = d; saveProg();
  POT.lesson = { n: 0, stars: 0, fail: 0 }; POT.queue = lessonPotions(d);
  POT.p = makeRecipe(POT.queue[0]); POT.order = potLevel() >= 3 ? shuffle(INGR_IDS) : null; POT.busy = false;
  renderPotions(); startRecipe();
  profSay(`I dag brygger vi ${POT.p.name}. Se opskriften på tavlen, og tryk på krukkerne.`, startTips());
}
/* eliksirbogen: alle 30, dem man har brygget, står med navn og farve */
function bottleSvg(col, known){
  return `<svg viewBox="-34 -50 68 92" xmlns="http://www.w3.org/2000/svg"><path d="M -9 -40 H 9 V -26 C 24 -20 30 -8 30 6 C 30 26 16 38 0 38 C -16 38 -30 26 -30 6 C -30 -8 -24 -20 -9 -26 Z" fill="${known ? col : '#4A4266'}" stroke="#1E1830" stroke-width="3.5" stroke-linejoin="round"/>`
    + (known ? `<path d="M -26 8 C -26 24 -14 34 0 34 C 14 34 26 24 26 8 Z" fill="#FFF" opacity=".18"/><path d="M -18 -6 Q -22 6 -18 16" stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`
             : `<text y="16" text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="30" fill="#8A82AE">?</text>`)
    + `<rect x="-11" y="-48" width="22" height="11" rx="3" fill="#B5844A" stroke="#1E1830" stroke-width="3"/></svg>`;
}
function potionBook(veil){
  const card = veil.querySelector('.diff-card'); card.hidden = true;
  const br = prog.brewed || {};
  const book = el('div', { class:'reveal magic m-dyr lesson-card book-card' }, [
    el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
    el('div', { class:'reveal-info' }, [
      el('p', { class:'reveal-cat' }, 'Eliksirbogen'),
      el('h3', { class:'reveal-name' }, `${POTIONS.filter(p => br[p.name]).length} af ${POTIONS.length} eliksirer`),
      el('div', { class:'book-grid' }, DIFF.map((d, i) => el('div', { class:'book-row' }, [ el('p', { class:'book-lv' }, d.name),
        el('div', { class:'book-cells' }, POTIONS.filter(p => p.lv === i).map(p => el('div', { class:'book-cell' + (br[p.name] ? ' known' : '') }, [
          el('div', { class:'book-bottle', html: bottleSvg(p.col, !!br[p.name]) }), el('span', {}, br[p.name] ? p.name : '???') ]))) ]))),
      el('div', { class:'reveal-btns row' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); book.remove(); card.hidden = false; } } }, 'Tilbage') ]) ]) ]);
  veil.append(book);
}
function renderPotions(){
  const box = $('#potionBody'); box.innerHTML = '';
  box.append(el('div', { class:'scene-wrap', id:'potScene' }), ...placeUi([ backBtn('Gangen', showSchool) ], [ starPill() ]));
  const w = $('#potScene'); w.innerHTML = potionScene();
  const svg = w.querySelector('svg');
  stillDolls(svg);
  svg.addEventListener('click', e => { if (POT.sayWait){ POT.sayWait(); return; } const g = e.target.closest('[data-hit]'); if (g) potTap(g.dataset.hit, g, svgPoint(svg, e)); });
  svg.addEventListener('pointerdown', stirStart);
  svg.addEventListener('pointermove', stirMove);
  svg.addEventListener('pointerup', stirEnd); svg.addEventListener('pointercancel', stirEnd);
  svg.addEventListener('dragstart', e => e.preventDefault());   /* et træk med musen må ikke blive til et træk-og-slip, der afbryder omrøringen */
  setLiquid(POT.p.mix);
  drawRecipe();
  if (!POT.raf){ POT.last = performance.now(); POT.raf = requestAnimationFrame(potLoop); }
}
function drawRecipe(){
  const r = $('#potScene .recipe'); if (r) r.innerHTML = recipeSvg(POT.p);
  const step = POT.p.steps[POT.p.i], wrap = $('#potScene .stirwrap');
  /* omrøringen tegnes kun forfra, når det er et nyt trin — ellers ville tælleren springe tilbage til 0 hver gang */
  /* når tavlen er dækket, afslører gryden ikke, at der skal røres: tælleren kommer først, når man selv går i gang */
  const hidden = POT.covered && potLevel() >= 3, ror = step && step.kind === 'ror' && !POT.busy;
  const key = ror ? (hidden ? (POT.stir ? 's' : 'h') + POT.p.i : String(POT.p.i)) : '-';
  if (wrap && wrap._k !== key){ wrap._k = key; wrap.innerHTML = !ror ? '' : hidden ? (POT.stir ? stirCounter(step) : '') : stirHint(step.dir || 1) + stirCounter(step); }
  else if (wrap && ror){ const t = wrap.querySelector('.stirn'); if (t) t.textContent = `${Math.min(POT.p.got || 0, step.n)}/${step.n}`; }
  const svg = $('#potScene svg'); if (!svg) return;
  svg.classList.toggle('stirring', !!(step && step.kind === 'ror'));
  svg.classList.toggle('heating', !!(step && step.kind === 'varme') && !(POT.covered && potLevel() >= 3));
}
function setLiquid(c){ const svg = $('#potScene svg'); if (svg) svg.style.setProperty('--liq', c); }
const potFx = () => $('#potScene .fx');

function potTap(hit, g, pt){
  const [k, v] = hit.split(':'), svg = $('#potScene svg'), p = POT.p;
  if (k === 'say'){ if (POT.sayQ && POT.sayQ.length){ sfx.pick(); const [n, ...rest] = POT.sayQ; profSay(n, rest); } return; }
  if (k === 'prof'){ sfx.pick(); replay(g, 'hop'); profSay(PROF_TAP[POT.tapN++ % PROF_TAP.length]); return; }
  if (k === 'mate'){ sfx.pick(); replay(g, 'hop'); sparkle(svg, pt.x, pt.y, 4); return; }
  if (k === 'dyr'){ sfx.pick(); replay(g, 'hop'); sparkle(svg, pt.x, pt.y - 60, 5, '#FF8FC7'); return; }
  if (k === 'tavle'){
    if (POT.covered){
      /* svær: 3 kig pr. eliksir, og hvert kig koster en af ekstrastjernerne */
      if (POT.peeks <= 0){ sfx.nope(); profSay('Du har ikke flere kig til den her eliksir. Prøv at huske det!'); return; }
      sfx.pick(); POT.peeks--; p.peeked = (p.peeked || 0) + 1; POT.covered = false; drawRecipe(); clearTimeout(POT.coverT);
      POT.peekT = setTimeout(() => { POT.peekT = 0; if (POT.p === p && p.i < p.steps.length){ POT.covered = true; drawRecipe(); } }, 2600);
    }
    else if (!POT.peekT){ const st = p.steps[p.i]; if (st) profSay(nextLine(st)); }
    return;
  }
  if (k === 'blaes'){
    replay(g, 'squeeze'); sfx.whoosh();
    const st = p.steps[p.i];
    if (!st || st.kind !== 'varme' || POT.busy){ profSay('Ilden er fin lige nu. Pust til den, når opskriften siger det.'); return; }
    POT.heat = Math.min(120, POT.heat + 13);
    if (!calm) sparkle($('#potScene svg'), CX - 90 + Math.random() * 180, 900, 4, '#FFB347');
    return;
  }
  if (k === 'gryde'){ if (POT.stirMoved){ POT.stirMoved = false; return; } const s = p.steps[p.i]; if (s && s.kind === 'ror' && !POT.busy){ profSay('Tegn cirkler i gryden med fingeren!'); replay($('#potScene .stirwrap') || g, 'jiggle'); } else blub(); return; }
  if (k !== 'jar' || POT.busy) return;
  const s = p.steps[p.i]; if (!s) return;
  replay(g, 'jiggle');
  const hush = POT.covered && potLevel() >= 3;   /* dækket tavle: professoren afslører ikke, hvad der mangler */
  if (s.kind === 'ror'){ sfx.nope(); profSay(hush ? 'Hov, det står der ikke lige nu. Kig på tavlen, hvis du er i tvivl!' : 'Først skal der røres! Tegn cirkler i gryden med fingeren.'); return; }
  if (s.kind === 'varme'){ sfx.nope(); profSay(hush ? 'Hov, det står der ikke lige nu. Kig på tavlen, hvis du er i tvivl!' : 'Først skal gryden varmes! Tryk på blæsebælgen ved ilden.'); return; }
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
    if (p.got >= p.steps[p.i].n){ p.i++; p.got = 0; profSay(pick(PROF_OK) + afterOk(p.steps[p.i])); }
    drawRecipe();
    POT.busy = false;
    if (p.i >= p.steps.length) finishPotion();
  } else {
    p.miss++;
    await potPuff();
    profSay(pick(PROF_MISS) + (POT.diff === 2 && p.miss < 3 ? (p.miss === 2 ? ' Pas på, én fejl mere, så koger den over!' : ' Det var fejl nummer ét.') : ''));
    POT.busy = false;
  }
}
/* hvad professoren siger om næste trin. Når tavlen er dækket (svær), holder hun tæt — kun en tidsfrist siger hun */
function afterOk(s){
  if (!s) return '';
  if (potLevel() >= 3 && (POT.covered || POT.peekT)) return s.kind === 'ror' && s.time ? ` Skynd dig, nu er der tid på: ${s.time} sekunder!` : '';
  return ' ' + nextLine(s);
}
function nextLine(s){
  if (s.kind === 'varme') return tipOnce('varme', 'Varm gryden op! Tryk på blæsebælgen, til termometeret står i det grønne – men ikke for meget!') || 'Nu skal gryden varmes op til det grønne!';
  if (s.kind === 'ror') return `Nu skal der røres ${s.n} ${s.n === 1 ? 'gang' : 'gange'} rundt${s.dir ? (s.dir > 0 ? ' med uret' : ' mod uret') + (tipOnce('retning', 'x') ? ' – følg pilen' : '') : ''}${s.time ? `, og du har kun ${s.time} sekunder` : ''}.`;
  return `Nu ${s.n === 1 ? 'én' : s.n} ${INGR[s.id].name.toLowerCase()}.`;
}
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
/* sleven går hen, hvor fingeren er, men bliver inde i gryden, og skaftet vipper lidt med */
function ladleTo(q){
  const lad = $('#potScene .ladle'); if (!lad) return;
  const RX = CRX - 60, RY = CRY - 4; let dx = q.x - CX, dy = q.y - CY - 6;
  const k = Math.hypot(dx / RX, dy / RY); if (k > 1){ dx /= k; dy /= k; }
  lad.style.transform = `translate(${(CX + dx).toFixed(0)}px,${(CY + 6 + dy).toFixed(0)}px) rotate(${(-12 * dx / RX).toFixed(1)}deg)`;
}
function stirStart(e){
  const p = POT.p, s = p && p.steps[p.i]; if (!s || s.kind !== 'ror' || POT.busy) return;
  const svg = e.currentTarget, q = svgPoint(svg, e), nx = (q.x - CX) / (CRX + 120), ny = (q.y - CY) / (CRY + 160);
  if (nx * nx + ny * ny > 1.6) return;
  POT.stir = { a: Math.atan2((q.y - CY) / CRY, (q.x - CX) / CRX), acc: 0, id: e.pointerId, turns: 0 };
  if (s.time && !POT.timer) POT.timer = { t0: performance.now(), lim: s.time * 1000, step: s };
  try { svg.setPointerCapture(e.pointerId); } catch (er) {}
  ladleTo(q);
  const h = $('#potScene .stirhint'); if (h) h.classList.add('fade');
  if (POT.covered && potLevel() >= 3){ const w = $('#potScene .stirwrap'); if (w && !w.firstChild){ w._k = 's' + p.i; w.innerHTML = stirCounter(s); } }   /* nu må tælleren gerne komme frem */
}
function stirMove(e){
  const st = POT.stir; if (!st || e.pointerId !== st.id) return;
  const q = svgPoint(e.currentTarget, e), a = Math.atan2((q.y - CY) / CRY, (q.x - CX) / CRX);
  let d = a - st.a; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
  st.a = a; st.acc += d;
  ladleTo(q);
  const p = POT.p, s = p.steps[p.i], dir = s.dir || 0;
  if (dir && st.acc * dir < -Math.PI * 1.2){ POT.stir = null; sfx.nope(); profSay(POT.covered && potLevel() >= 3 ? 'Hov, forkert vej! Kig på tavlen, hvis du er i tvivl.' : `Hov, forkert vej! Rør ${dir > 0 ? 'med' : 'mod'} uret – følg pilen.`); if (POT.covered) drawRecipe(); return; }
  const turns = Math.floor(Math.max(0, dir ? st.acc * dir : Math.abs(st.acc)) / (2 * Math.PI));
  if (turns > st.turns){
    const cnt = $('#potScene .stirn'); if (cnt) cnt.textContent = `${Math.min(turns, s.n)}/${s.n}`;
    st.turns = turns; p.got = turns;
    tone(520 + turns * 120, 0.14, 'triangle', 0.06); sparkle($('#potScene svg'), CX + Math.cos(a) * CRX * 0.6, CY, 5, '#FFF6D0');
    p.mix = mixC(p.mix, p.potion.col, 0.3); setLiquid(p.mix);
    if (turns >= s.n){ POT.stir = null; POT.timer = null; p.i++; p.got = 0; profSay(pick(PROF_OK) + afterOk(p.steps[p.i])); drawRecipe(); if (p.i >= p.steps.length) finishPotion(); return; }
    drawRecipe();
  }
}
function stirEnd(e){ const st = POT.stir; if (st && e.pointerId === st.id){ POT.stirMoved = Math.abs(st.acc) > 0.6; POT.stir = null; } }

/* ---------- timeglas, blæsebælg og termometer ---------- */
const thermoY = h => 860 - Math.max(0, Math.min(105, h)) * 1.5;
function hourglass(){
  const x = 412, y = 140;
  return `<g class="hglass" pointer-events="none" transform="translate(${x} ${y})"><defs><clipPath id="hgT"><path d="M -18 -62 H 18 C 18 -44 4 -38 2 -34 H -2 C -4 -38 -18 -44 -18 -62 Z"/></clipPath><clipPath id="hgB"><path d="M -18 -6 H 18 C 18 -24 4 -30 2 -34 H -2 C -4 -30 -18 -24 -18 -6 Z"/></clipPath></defs>`
    + `<ellipse cx="0" cy="0" rx="28" ry="5" fill="#000" opacity=".3"/><path d="M -18 -62 H 18 C 18 -44 4 -38 2 -34 C 4 -30 18 -24 18 -6 H -18 C -18 -24 -4 -30 -2 -34 C -4 -38 -18 -44 -18 -62 Z" fill="#DDEFFF" fill-opacity=".35" stroke="#E8F4FF" stroke-width="2.5"/>`
    + `<g clip-path="url(#hgT)"><rect class="hg-top" x="-20" y="-60" width="40" height="26" fill="#F2C14E"/></g><g clip-path="url(#hgB)"><rect class="hg-bot" x="-20" y="-6" width="40" height="0" fill="#F2C14E"/></g>`
    + `<path class="hg-str" d="M 0 -34 V -8" stroke="#F2C14E" stroke-width="2"/>`
    + `<rect x="-26" y="-70" width="52" height="9" rx="3" fill="#8A5A3C" stroke="#3A2420" stroke-width="2"/><rect x="-26" y="-7" width="52" height="9" rx="3" fill="#8A5A3C" stroke="#3A2420" stroke-width="2"/><path d="M -22 -62 V -6 M 22 -62 V -6" stroke="#6E4A30" stroke-width="4"/></g>`;
}
function heatGear(){
  /* blæsebælgen ligger ved ilden og peger ind mod den; termometeret hænger på gryden */
  let o = `<g data-hit="blaes" class="bellows" transform="translate(530 916) scale(1.2)"><ellipse class="bglow" cx="-14" cy="0" rx="86" ry="52" fill="#FFE27A"/><g class="anim">`
    + `<path d="M -62 -20 L -94 -30 M -62 20 L -94 30" stroke="#6E4A30" stroke-width="8" stroke-linecap="round"/><circle cx="-96" cy="-31" r="7" fill="#8A5A3C" stroke="#3A2420" stroke-width="2"/><circle cx="-96" cy="31" r="7" fill="#8A5A3C" stroke="#3A2420" stroke-width="2"/>`
    + `<path d="M 34 -5 L -56 -20 Q -68 0 -56 20 L 34 5 Z" fill="#B5743A" stroke="#4A2E1E" stroke-width="3" stroke-linejoin="round"/><path d="M -40 -16 Q -46 0 -40 16 M -22 -13 Q -27 0 -22 13 M -4 -10 Q -8 0 -4 10" stroke="#7A4A2A" stroke-width="2" fill="none"/>`
    + `<path d="M 36 -6 L -50 -30 C -62 -34 -72 -26 -66 -16 L -56 -18 Z" fill="#8A5A3C" stroke="#3A2420" stroke-width="3" stroke-linejoin="round"/><path d="M 36 6 L -50 30 C -62 34 -72 26 -66 16 L -56 18 Z" fill="#8A5A3C" stroke="#3A2420" stroke-width="3" stroke-linejoin="round"/>`
    + `<rect x="32" y="-6" width="34" height="12" rx="3" fill="#C9A04A" stroke="#7A5A1A" stroke-width="2"/><path d="M 66 -4 L 78 -2 L 78 2 L 66 4 Z" fill="#A8842A"/><circle cx="-30" cy="-18" r="4" fill="#C9A04A"/></g>`
    + `<rect x="-110" y="-50" width="200" height="100" fill="#FFF" fill-opacity="0"/></g>`;
  o += `<g class="thermo" pointer-events="none"><rect x="600" y="694" width="30" height="176" rx="15" fill="#2A2238" stroke="#0E0A12" stroke-width="3"/><rect x="606" y="700" width="18" height="164" rx="9" fill="#EDE8F4"/>`
    + `<rect x="606" y="${thermoY(80)}" width="18" height="${thermoY(55) - thermoY(80)}" fill="#7AE08A" opacity=".75"/><rect x="606" y="702" width="18" height="${thermoY(92) - 702}" rx="8" fill="#FF8FA0" opacity=".7"/>`
    + `<rect class="thermofill" x="610" y="${thermoY(30)}" width="10" height="${860 - thermoY(30)}" rx="5" fill="#E8504A"/><circle cx="615" cy="876" r="17" fill="#E8504A" stroke="#0E0A12" stroke-width="3"/>`
    + [55, 80].map(h => `<path d="M 596 ${thermoY(h)} h 8 M 626 ${thermoY(h)} h 8" stroke="#7AE08A" stroke-width="3"/>`).join('') + `</g>`;
  return o;
}
/* løkken: timeglasset løber, varmen falder langsomt, og tiden tæller ned, når der røres på tid */
function potLoop(now){
  if ($('#potion').hidden || !$('#potScene svg')){ POT.raf = 0; return; }
  const dt = Math.min(.05, (now - POT.last) / 1000); POT.last = now;
  const svg = $('#potScene svg'), p = POT.p, st = p && p.steps[p.i];
  if (POT.hg){ const k = Math.min(1, (now - POT.hg.t0) / POT.hg.lim), t = svg.querySelector('.hg-top'), b = svg.querySelector('.hg-bot'), sr = svg.querySelector('.hg-str');
    /* sandet flyttes i små hop (hver halve enhed), ikke i hvert billede */
    const q = Math.round(k * 52) / 52;
    if (t && q !== POT.hg.q){ POT.hg.q = q; t.setAttribute('y', (-60 + q * 26).toFixed(1)); t.setAttribute('height', (26 - q * 26).toFixed(1)); b.setAttribute('y', (-6 - q * 26).toFixed(1)); b.setAttribute('height', (q * 26).toFixed(1)); sr.style.display = k < 1 ? '' : 'none'; }
    if (k >= 1 && !POT.hg.out){ POT.hg.out = true; tone(330, 0.2, 'sine', 0.04); const hg = svg.querySelector('.hglass'); if (hg) hg.classList.add('out'); } }
  if (POT.diff === 2 && p && !POT.busy && p.i < p.steps.length && ((POT.hg && POT.hg.out) || p.miss >= 3)) failPotion(p.miss >= 3 ? 'Tre fejl, og så kogte den over!' : 'Timeglasset løb ud, og eliksiren kogte over!');
  if (st && st.kind === 'varme' && !POT.busy){
    POT.heat = Math.max(0, POT.heat - 6 * dt);
    if (POT.heat > 100){ boilOver('Uha, den kogte over! Lidt mere forsigtigt med blæsebælgen.'); POT.heat = 40; }
    else if (POT.heat >= 55 && POT.heat <= 80){ POT.heatOk += dt;
      if (POT.heatOk >= 1.2){ POT.heatOk = 0; tone(660, 0.1, 'triangle', 0.06); tone(990, 0.12, 'triangle', 0.05, 0.08); p.mix = mixC(p.mix, '#FF8A3D', 0.2); setLiquid(p.mix);
        p.i++; p.got = 0; profSay(pick(PROF_OK) + afterOk(p.steps[p.i])); drawRecipe(); if (p.i >= p.steps.length) finishPotion(); } }
    else POT.heatOk = 0;
  } else if (!POT.busy) POT.heat += (32 - POT.heat) * Math.min(1, dt * .8);
  /* kun når noget faktisk ændrer sig: hver ændring får browseren til at regne hele tegningen igennem */
  const f = svg.querySelector('.thermofill'); if (f){ const y = thermoY(POT.heat).toFixed(0); if (y !== svg._thY){ svg._thY = y; f.setAttribute('y', y); f.setAttribute('height', 864 - y); } }
  const fire = (Math.round((0.75 + Math.min(110, POT.heat) / 100 * 0.7) * 20) / 20).toFixed(2);
  if (fire !== svg._fire){ svg._fire = fire; const fl = svg.querySelectorAll('.fire'); fl.forEach(e => e.style.setProperty('--fire', fire)); }
  if (POT.timer && st === POT.timer.step && !POT.busy){ const k = (now - POT.timer.t0) / POT.timer.lim, r = svg.querySelector('.tring');
    const dv = (Math.min(1, k) * 2 * Math.PI * 34).toFixed(0); if (r && dv !== r._dv){ r._dv = dv; r.setAttribute('stroke-dashoffset', dv); }
    if (k >= 1){ POT.timer = null; POT.stir = null; p.got = 0; boilOver('Tiden løb ud, og den kogte over! Prøv igen, lidt hurtigere.'); } }
  POT.raf = requestAnimationFrame(potLoop);
}
async function boilOver(msg){
  POT.busy = true; POT.p.miss++;
  await potPuff(); profSay(msg); POT.busy = false; drawRecipe();
}

/* ---------- eliksiren er færdig: et stort puf, og så sker der noget sjovt ---------- */
async function finishPotion(){
  POT.busy = true;
  const fast = !!(POT.hg && !POT.hg.out); POT.hg = null; POT.timer = null; clearTimeout(POT.coverT); clearTimeout(POT.peekT); POT.peekT = 0; POT.covered = false; drawRecipe();
  const p = POT.p, svg = $('#potScene svg'), d = POT.diff || 0, bonusFast = fast && d === 1;
  const stars = d === 0 ? 1 : d === 1 ? Math.max(1, 3 - p.miss) + (bonusFast ? 1 : 0) : Math.max(1, 5 - p.miss - (p.peeked || 0));
  setLiquid(p.potion.col); svg.classList.add('brewed');
  sfx.magic();
  if (!calm) for (let i = 0; i < 3; i++) setTimeout(() => sparkle(svg, CX - 120 + i * 120, CY - 40 - i * 30, 8, p.potion.col), i * 180);
  await wait(calm ? 200 : 900);
  const first = !(prog.brewed || {})[p.name]; prog.brewed = prog.brewed || {}; prog.brewed[p.name] = (prog.brewed[p.name] || 0) + 1;
  profSay(`${pick(PROF_DONE)} ${p.name}: ${p.potion.line}${bonusFast ? ' Og du nåede det før timeglasset: en ekstra stjerne!' : ''}${first ? ' Den er ny i din eliksirbog!' : ''}`);
  await potionEffect(p.potion.fx);
  prog.potions = (prog.potions || 0) + 1; saveProg();
  addStars(stars); POT.lesson.stars += stars;
  starBurst(stars);
  await wait(calm ? 200 : 900);
  await waitTap();
  svg.classList.remove('brewed');
  nextPotion();
}
/* næste eliksir i timen, eller timen er slut */
function nextPotion(){
  POT.lesson.n++;
  if (POT.lesson.n >= 3){ lessonDone(); return; }
  POT.p = makeRecipe(POT.queue[POT.lesson.n]);
  if (potLevel() >= 3){ POT.order = shuffle(INGR_IDS); renderPotions(); }
  startRecipe();
  setLiquid(POT.p.mix); POT.busy = false; drawRecipe();
  profSay(`Næste eliksir: ${POT.p.name}! ${nextLine(POT.p.steps[0])}`, startTips());
}
/* svær: eliksiren kogte over. Ingen stjerner for den, men timen går videre */
async function failPotion(msg){
  POT.busy = true; POT.hg = null; POT.timer = null; POT.stir = null; clearTimeout(POT.coverT); clearTimeout(POT.peekT); POT.peekT = 0; POT.covered = false; drawRecipe();
  POT.lesson.fail++;
  await potPuff(); setLiquid('#5A5048');
  profSay(`${msg} ${pick(PROF_FAIL)}`);
  await wait(calm ? 300 : 900);
  await waitTap();
  nextPotion();
}
function starBurst(n){
  const fx = potFx(); if (!fx) return; sfx.coin();
  for (let i = 0; i < n; i++){ const s = svgEl('g', { class:'starfly', style:`--dx:${(i - (n-1)/2) * 110}px;animation-delay:${i * 0.15}s` }, starP(CX, CY - 120, 40, '#FFE27A') + `<polygon points="${star5pts(CX, CY - 120, 40, 17)}" fill="none" stroke="#B98516" stroke-width="4" stroke-linejoin="round"/>`);
    fx.append(s); setTimeout(() => s.remove(), 1800); }
}
/* ---------- effekterne fra de nye eliksirer ---------- */
const HEAD = { x: CX, y: 300 };
const frnd = (a, b) => a + Math.random() * (b - a);
function fxBit(html, x, y, dx, dy, dur, delay = 0, cls = ''){
  const fx = potFx(); if (!fx || calm) return;
  const g = svgEl('g', { class: 'fxbit ' + cls, style: `--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;animation-duration:${dur}s;animation-delay:${delay.toFixed(2)}s` }, `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})">${html}</g>`);
  fx.append(g); setTimeout(() => g.remove(), (dur + delay) * 1000 + 100);
}
const SHAPE = {
  heart: (s, c) => `<path d="M 0 ${s * .9} C ${-s * 1.4} ${-s * .1} ${-s * .7} ${-s * 1.1} 0 ${-s * .35} C ${s * .7} ${-s * 1.1} ${s * 1.4} ${-s * .1} 0 ${s * .9} Z" fill="${c}" stroke="#7A2A4A" stroke-width="3" stroke-linejoin="round"/>`,
  bubble: r => `<circle r="${r}" fill="#BFF0FF" fill-opacity=".22" stroke="#E8FBFF" stroke-width="3"/><path d="M ${-r * .55} ${-r * .15} A ${r * .6} ${r * .6} 0 0 1 ${-r * .1} ${-r * .6}" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  flower: (s, c) => [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return `<circle cx="${(Math.cos(a) * s * .55).toFixed(1)}" cy="${(Math.sin(a) * s * .55).toFixed(1)}" r="${s * .42}" fill="${c}" stroke="#7A2A4A" stroke-width="2"/>`; }).join('') + `<circle r="${s * .32}" fill="#FFD54A" stroke="#9A6A10" stroke-width="2"/>`,
  note: c => `<ellipse cx="-6" cy="14" rx="11" ry="8" fill="${c}" stroke="#1E1830" stroke-width="2" transform="rotate(-20 -6 14)"/><path d="M 4 12 V -20 Q 16 -12 18 0" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  snow: s => `<path d="M 0 ${-s} V ${s} M ${-s * .87} ${-s * .5} L ${s * .87} ${s * .5} M ${-s * .87} ${s * .5} L ${s * .87} ${-s * .5}" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>`,
  fly: c => `<g class="flap"><ellipse cx="-11" cy="-5" rx="11" ry="13" fill="${c}" stroke="#3A2340" stroke-width="2"/><ellipse cx="11" cy="-5" rx="11" ry="13" fill="${c}" stroke="#3A2340" stroke-width="2"/><ellipse cx="-8" cy="11" rx="7" ry="8" fill="${c}" stroke="#3A2340" stroke-width="2"/><ellipse cx="8" cy="11" rx="7" ry="8" fill="${c}" stroke="#3A2340" stroke-width="2"/></g><rect x="-2" y="-14" width="4" height="30" rx="2" fill="#3A2340"/>`,
  z: s => `<text font-family="${FONT_S}" font-weight="700" font-size="${s}" fill="#E8E8FF" stroke="#2A2238" stroke-width="5" paint-order="stroke">Z</text>`,
  word: (t, s, c) => `<text text-anchor="middle" font-family="${FONT_S}" font-weight="700" font-size="${s}" fill="${c}" stroke="#2A2238" stroke-width="5" paint-order="stroke">${t}</text>`,
  flame: s => `<path d="M 0 ${s} C ${-s * .9} ${s} ${-s} ${s * .1} ${-s * .4} ${-s * .5} C ${-s * .3} ${-s * .1} 0 0 ${s * .1} ${-s} C ${s * .5} ${-s * .4} ${s * .9} ${s * .2} 0 ${s} Z" fill="#FF8A3D" stroke="#A8301A" stroke-width="2"/><path d="M 0 ${s * .8} C ${-s * .4} ${s * .8} ${-s * .5} ${s * .3} 0 ${-s * .1} C ${s * .4} ${s * .3} ${s * .4} ${s * .8} 0 ${s * .8} Z" fill="#FFE27A"/>`,
  drop: s => `<path d="M 0 ${-s} C ${s * .5} ${-s * .2} ${s * .7} ${s * .3} 0 ${s * .7} C ${-s * .7} ${s * .3} ${-s * .5} ${-s * .2} 0 ${-s} Z" fill="#7FC8FF" stroke="#2F6FA0" stroke-width="2"/>`,
};
async function fxClass(hero, cls, ms = 3400){ hero.classList.add('fx-' + cls); await wait(calm ? 300 : ms); hero.classList.remove('fx-' + cls); }
const FX = {
  hjerter: h => { for (let i = 0; i < 14; i++) fxBit(SHAPE.heart(frnd(16, 26), pick(['#FF6F9C', '#FF9FC0', '#E8457A'])), HEAD.x + frnd(-90, 90), HEAD.y + 60, frnd(-80, 80), frnd(-300, -220), 2.2, i * .2); return fxClass(h, 'hop1', 3400); },
  bobler: h => { for (let i = 0; i < 18; i++) fxBit(SHAPE.bubble(frnd(14, 30)), CX + frnd(-180, 180), frnd(480, 640), frnd(-40, 40), frnd(-420, -320), 2.6, i * .16); return wait(calm ? 300 : 3600); },
  hop: h => fxClass(h, 'hop', 3400),
  snurre: h => fxClass(h, 'snurre', 3200),
  blomster: h => { for (let i = 0; i < 9; i++){ const a = Math.PI + i / 8 * Math.PI; fxBit(SHAPE.flower(frnd(16, 24), pick(['#FF9FD0', '#FFD36E', '#B8A0FF', '#FF8A8A'])), HEAD.x + Math.cos(a) * 150, HEAD.y + 40 + Math.sin(a) * 120, 0, 0, 3.2, i * .12, 'pop'); } return wait(calm ? 300 : 3600); },
  latter: h => { for (let i = 0; i < 5; i++) fxBit(SHAPE.word(pick(['Hihi!', 'Haha!', 'Hihihi!']), 40, '#FFE27A'), HEAD.x + frnd(-150, 150), HEAD.y, frnd(-30, 30), -160, 1.6, i * .5); return fxClass(h, 'latter', 3300); },
  spejl: h => fxClass(h, 'spejl', 3400),
  sne: h => { for (let i = 0; i < 26; i++) fxBit(SHAPE.snow(frnd(8, 14)), CX + frnd(-220, 220), frnd(120, 200), frnd(-30, 30), frnd(380, 460), 2.4, i * .11, 'fall'); return fxClass(h, 'kold', 3400); },
  noder: h => { const mel = [523, 659, 784, 659, 880, 784, 659, 523]; mel.forEach((f, i) => { tone(f, 0.22, 'triangle', 0.05, i * 0.36); fxBit(SHAPE.note(pick(['#7AD0FF', '#FF8FC7', '#FFE27A', '#9BE36A'])), HEAD.x + frnd(-60, 60), HEAD.y + 60, frnd(-160, 160), frnd(-260, -200), 2, i * .36); }); return fxClass(h, 'vug', 3400); },
  sommerfugle: h => { for (let i = 0; i < 9; i++) fxBit(SHAPE.fly(pick(['#FFC0E8', '#FFD36E', '#9FE7FF', '#C9A0FF'])), CX + frnd(-200, 200), frnd(420, 600), frnd(-200, 200), frnd(-380, -260), 3, i * .25); return wait(calm ? 300 : 3800); },
  flad: h => fxClass(h, 'flad', 3400),
  lang: h => fxClass(h, 'lang', 3400),
  zzz: h => { for (let i = 0; i < 6; i++) fxBit(SHAPE.z(30 + i * 6), HEAD.x + 70, HEAD.y + 10, 90 + i * 10, -170, 1.8, i * .45); return fxClass(h, 'zzz', 3600); },
  usynlig: h => fxClass(h, 'usynlig', 3400),
  hoved: h => fxClass(h, 'hoved', 3400),
  klon: async h => { const cs = [-1, 1].map(s => { const c = h.cloneNode(true); c.classList.add('klon'); c.style.setProperty('--kx', s * 270 + 'px'); h.after(c); return c; }); await wait(calm ? 300 : 3500); cs.forEach(c => c.remove()); },
  lys: h => { if (!calm) for (let i = 0; i < 4; i++) setTimeout(() => sparkle($('#potScene svg'), HEAD.x + frnd(-120, 120), HEAD.y + frnd(0, 260), 6, '#FFFFFF'), i * 600); return fxClass(h, 'lys', 3400); },
  regn: h => { fxBit(`<path d="M -110 0 C -130 -40 -80 -70 -50 -50 C -40 -90 30 -95 40 -55 C 80 -80 130 -40 105 0 Z" fill="#8A9AB8" stroke="#3A4460" stroke-width="4" stroke-linejoin="round"/>`, HEAD.x, HEAD.y - 90, 0, 0, 3.4, 0, 'pop');
    for (let i = 0; i < 22; i++) fxBit(SHAPE.drop(9), HEAD.x + frnd(-95, 95), HEAD.y - 80, 0, frnd(240, 300), 0.9, .3 + i * .12, 'fall'); return fxClass(h, 'surt', 3400); },
  ild: h => { for (let i = 0; i < 16; i++) fxBit(SHAPE.flame(frnd(16, 26)), HEAD.x + 40, HEAD.y + 70, frnd(260, 380), frnd(-60, 40), .9, .4 + i * .14); return fxClass(h, 'ild', 3400); },
  farver: h => fxClass(h, 'farver', 3400),
  spoegelse: h => fxClass(h, 'spoegelse', 3400),
  stjerner: async h => { const fx = potFx(); let g = null;
    if (fx && !calm){ g = svgEl('g', { transform: `translate(${HEAD.x} ${HEAD.y - 40}) scale(1 .4)` }, `<g class="orbit">${[0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return star4(Math.cos(a) * 140, Math.sin(a) * 140, 28, '#FFE27A'); }).join('')}</g>`); fx.append(g); }
    await fxClass(h, 'svimmel', 3400); if (g) g.remove(); },
  regnbue: h => { fxBit(['#FF5A5A', '#FFA03A', '#FFE24A', '#6ED86A', '#4AA8FF', '#9A6AFF'].map((c, i) => `<path d="M ${-260 + i * 16} 0 A ${260 - i * 16} ${165 - i * 12} 0 0 1 ${260 - i * 16} 0" stroke="${c}" stroke-width="16" fill="none"/>`).join(''), HEAD.x, HEAD.y + 90, 0, 0, 3.6, 0, 'pop'); return wait(calm ? 300 : 3800); },
};
async function potionEffect(fx){
  const hero = $('#potScene .hero'), img = $('#potScene .heroimg'), pimg = $('#potScene .petimg'), st = heroState();
  if (!hero) return;
  if (FX[fx]){ await FX[fx](hero); return; }
  if (fx === 'haar' || fx === 'pels'){
    const s2 = clone(st), rainbow = ['#FF5FA8','#FFC02E','#62E0CB','#7B5CFF','#9BE36A','#FF8A3D'], was = img.getAttribute('href');
    if (fx === 'haar'){ s2.hair.a = pick(rainbow); s2.hair.b = pickOther(rainbow, s2.hair.a); s2.hair.ombre = true; img.setAttribute('href', dollUrl(s2, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })); }
    else if (pimg){ s2.pet.a = pick(rainbow); s2.pet.b = pickOther(rainbow, s2.pet.a); pimg.setAttribute('href', dollUrl(s2, { viewBox: VB.pet, petOnly: true })); }
    sparkle($('#potScene svg'), fx === 'haar' ? CX : 1095, fx === 'haar' ? 300 : 860, 10, '#FFF6D0');
    await wait(calm ? 300 : 3600);
    if (fx === 'haar') img.setAttribute('href', was);
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
  const d = POT.diff || 0, bonus = d === 2 && POT.lesson.fail ? 0 : DIFF[d].bonus; addStars(bonus); POT.lesson.stars += bonus;
  const made = 3 - POT.lesson.fail;
  sfx.fanfare();
  const card = el('div', { class:'reveal magic m-dyr lesson-card' }, [
    el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
    ...[0, 1, 2, 3].map(i => el('span', { class:'mc-corner c' + i, 'aria-hidden':'true', html: MC_CORNER })),
    el('div', { class:'reveal-info' }, [
      el('p', { class:'reveal-cat' }, 'Eliksirtimen er slut'),
      el('h3', { class:'reveal-name' }, `Du fik ${POT.lesson.stars} stjerner!`),
      el('div', { class:'lesson-stars', html: STAR_SVG.repeat(Math.min(12, POT.lesson.stars)) }),
      el('p', { class:'lesson-note' }, `${DIFF[d].name}: ${made === 3 ? 'tre eliksirer brygget' : made === 0 ? 'ingen eliksirer lykkedes' : `${made} af 3 eliksirer lykkedes`}${bonus ? `, plus ${bonus} ekstra for en hel time` : ''}.`),
      el('div', { class:'reveal-btns row' }, [
        el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); goTo(showSchool); } } }, 'Tilbage til gangen'),
        el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); goTo(showPotions); } } }, 'En time til') ]) ]) ]);
  const veil = el('div', { class:'shop-veil' }, [ card ]);
  $('#potionBody').append(veil); confetti(veil, 50);
  profSay('Det var timen for i dag. Godt arbejde!');
}
