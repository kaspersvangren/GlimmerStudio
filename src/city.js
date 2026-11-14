/* ================= Byen: hele byen på én skærm, set lidt oppefra ================= */
const CW = 1600, CH = 1000;
let CITY_OVR = { season: null, time: null };  // testtilstand kan vælge årstid og tid på dagen
const FONT_C = "Fredoka, 'Baloo 2', 'Trebuchet MS', sans-serif";
const KEY_STAR = 'glimmerstudiet.gemtstjerne';

/* ---------- årstid og tid på dagen ---------- */
function cityMood(){
  const d = new Date(), m = d.getMonth() + 1, h = d.getHours() + d.getMinutes() / 60;
  let season = (m === 12 || m <= 2) ? 'vinter' : m <= 5 ? 'foraar' : m <= 8 ? 'sommer' : 'efteraar', xmas = m === 12;
  /* skolebyen er altid i skumringen eller om natten — det er der, magien sker */
  let time = (h >= 20.5 || h < 6) ? 'nat' : 'aften';
  if (CITY_OVR.season){ xmas = CITY_OVR.season === 'jul'; season = xmas ? 'vinter' : CITY_OVR.season; }
  if (CITY_OVR.time) time = CITY_OVR.time;
  return { season, xmas, time, night: time === 'nat', dark: time === 'nat' || time === 'aften', winter: season === 'vinter' };
}
const SKY = { morgen:['#FFB8D2','#FFE7C4'], dag:['#8FD0FF','#E8F6FF'], aften:['#2E2470','#B0608E'], nat:['#141A4E','#3E3488'] };
const SHADE = { morgen:['#FF9BBE',0.12], dag:null, aften:['#4A3A9A',0.36], nat:['#28307A',0.5] };
let CM = null, LITS = [], LAMPS = [];
let SEED = 17;
const rnd = () => { SEED |= 0; SEED = SEED + 0x6D2B79F5 | 0; let t = Math.imul(SEED ^ SEED >>> 15, 1 | SEED); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const dk = (c, a = -0.18) => adj(c, a);
const lineC = c => adj(c, -0.32, 0.05);
const escT = t => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

/* ---------- små byggesten ---------- */
function win(x, y, w, h, o = {}){
  const fr = o.frame || '#FFFFFF';
  let s = `<rect x="${x-4}" y="${y-4}" width="${w+8}" height="${h+8}" rx="${o.r ?? 5}" fill="${fr}" stroke="#33204F" stroke-opacity=".3" stroke-width="2"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.max(0,(o.r ?? 5)-2)}" fill="url(#glass)"/>`;
  if (o.inner) s += o.inner;
  if (o.cur){ const c = o.cur, d = dk(c);
    s += `<path d="M ${x} ${y} L ${x+w*0.34} ${y} Q ${x+w*0.16} ${y+h*0.5} ${x+w*0.26} ${y+h} L ${x} ${y+h} Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M ${x+w} ${y} L ${x+w*0.66} ${y} Q ${x+w*0.84} ${y+h*0.5} ${x+w*0.74} ${y+h} L ${x+w} ${y+h} Z" fill="${c}" stroke="${d}" stroke-width="1.5"/>`; }
  if (o.cross !== false) s += `<path d="M ${x+w/2} ${y} V ${y+h} M ${x} ${y+h*0.45} H ${x+w}" stroke="${fr}" stroke-width="3"/>`;
  s += `<path d="M ${x+4} ${y+h*0.4} L ${x+w*0.4} ${y+4}" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  if (o.box) s += flowerbox(x-6, y+h+4, w+12, o.box);
  if (o.lit !== false) LITS.push([x, y, w, h]);
  return s;
}
function flowerbox(x, y, w, c){
  let s = '';
  if (CM.winter) s += `<path d="M ${x+3} ${y} Q ${x+w/2} ${y-12} ${x+w-3} ${y}" fill="#3E8E5A"/><path d="M ${x+2} ${y-1} Q ${x+w/2} ${y-14} ${x+w-2} ${y-1}" stroke="#FFF" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else { const cols = CM.season === 'efteraar' ? ['#FF8A3D','#E0457A','#FFC02E'] : ['#FF5FA8','#FFE27A','#FF8A3D','#B79BFF'];
    s += `<path d="M ${x+3} ${y} Q ${x+w/2} ${y-10} ${x+w-3} ${y}" fill="#6CC46A"/>`;
    for (let i = 0; i < Math.floor(w/10); i++) s += `<circle cx="${x+6+i*10}" cy="${y-6-(i%2)*3}" r="4" fill="${cols[i%cols.length]}"/>`; }
  return s + `<rect x="${x}" y="${y}" width="${w}" height="10" rx="3" fill="${c}" stroke="${lineC(c)}" stroke-width="2"/>`;
}
function door(cx, base, w, h, c, o = {}){
  const x = cx - w/2, y = base - h;
  let s = `<rect x="${x-10}" y="${base-3}" width="${w+20}" height="9" rx="3" fill="#E6DCEF" stroke="#B9AACB" stroke-width="1.5"/>`;
  s += `<path d="M ${x-5} ${base} V ${y+w/2} A ${w/2+5} ${w/2+5} 0 0 1 ${x+w+5} ${y+w/2} V ${base} Z" fill="${o.frame || '#FFFFFF'}" stroke="#33204F" stroke-opacity=".3" stroke-width="2"/>`;
  s += `<path d="M ${x} ${base} V ${y+w/2} A ${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2} V ${base} Z" fill="${c}" stroke="${lineC(c)}" stroke-width="2.5"/>`;
  s += `<path d="M ${x+7} ${y+w/2+2} A ${w/2-7} ${w/2-7} 0 0 1 ${x+w-7} ${y+w/2+2} Z" fill="url(#glass)"/><circle cx="${x+w-8}" cy="${y+h*0.6}" r="3" fill="#FFD54A" stroke="#C99A12"/>`;
  if (CM.xmas) s += `<g transform="translate(${cx},${y+h*0.45})"><circle r="11" fill="none" stroke="#2E8B57" stroke-width="6"/>${[0,1,2,3,4].map(i=>`<circle cx="${(11*Math.cos(i*1.26)).toFixed(1)}" cy="${(11*Math.sin(i*1.26)).toFixed(1)}" r="2" fill="#E0233F"/>`).join('')}</g>`;
  return s;
}
function awning(x0, x1, y, d, c){
  const n = Math.max(4, Math.round((x1-x0)/22)), sw = (x1-x0)/n;
  let s = `<path d="M ${x0} ${y} H ${x1} L ${x1+8} ${y+d} H ${x0-8} Z" fill="#FFF"/>`;
  for (let i = 0; i < n; i += 2) s += `<path d="M ${x0+i*sw} ${y} h ${sw} l ${(i+1-n/2)/n*16} ${d} h ${-sw} Z" fill="${c}"/>`;
  let sc = `M ${x0-8} ${y+d}`; for (let i = 0; i < n; i++){ const a = x0-8+i*(x1-x0+16)/n, b = a+(x1-x0+16)/n; sc += ` Q ${(a+b)/2} ${y+d+12} ${b} ${y+d}`; }
  s += `<path d="${sc} Z" fill="${c}" stroke="${lineC(c)}" stroke-width="2"/><path d="M ${x0} ${y} H ${x1} L ${x1+8} ${y+d} H ${x0-8} Z" fill="none" stroke="${lineC(c)}" stroke-width="2"/>`;
  if (CM.winter) s += `<path d="M ${x0-2} ${y-1} H ${x1+2}" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}
/* tag set oppefra: gavltag (forreste flade mørkere) eller fladt tag med kant */
function gableRoof(x, top, w, d, c){
  const ridge = top - d*0.62, back = top - d;
  let s = `<path d="M ${x-6} ${ridge} L ${x+w+6} ${ridge} L ${x+w-4} ${back} L ${x+4} ${back} Z" fill="${adj(c,0.08)}" stroke="${lineC(c)}" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<path d="M ${x-16} ${top+4} L ${x+w+16} ${top+4} L ${x+w+6} ${ridge} L ${x-6} ${ridge} Z" fill="${c}" stroke="${lineC(c)}" stroke-width="3" stroke-linejoin="round"/>`;
  for (let yy = ridge + 12; yy < top; yy += 13){ const k = (yy - ridge) / (top - ridge), x0 = x - 6 - 10*k, x1 = x + w + 6 + 10*k; let p = `M ${x0} ${yy}`; for (let xx = x0; xx < x1; xx += 14) p += ` q 7 6 14 0`; s += `<path d="${p}" fill="none" stroke="${lineC(c)}" stroke-opacity=".35" stroke-width="1.6"/>`; }
  for (let yy = back + 8; yy < ridge; yy += 11) s += `<path d="M ${x+6} ${yy} H ${x+w-6}" stroke="${lineC(c)}" stroke-opacity=".2" stroke-width="1.5"/>`;
  s += `<path d="M ${x-6} ${ridge} H ${x+w+6}" stroke="${lineC(c)}" stroke-width="4" stroke-linecap="round"/>`;
  if (CM.winter) s += `<path d="M ${x-4} ${ridge+2} L ${x+w+4} ${ridge+2} L ${x+w-4} ${back+2} L ${x+4} ${back+2} Z" fill="#FFFFFF" opacity=".92"/><path d="M ${x-8} ${ridge} H ${x+w+8}" stroke="#FFF" stroke-width="9" stroke-linecap="round"/><path d="M ${x-14} ${top+2} H ${x+w+14}" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}
function flatRoof(x, top, w, d, c){
  let s = `<rect x="${x-8}" y="${top-d}" width="${w+16}" height="${d}" rx="4" fill="${adj(c,0.1)}" stroke="${lineC(c)}" stroke-width="2.5"/><rect x="${x+4}" y="${top-d+8}" width="${w-8}" height="${d-16}" rx="3" fill="${CM.winter ? '#FFFFFF' : adj(c,0.16)}" opacity=".9"/><rect x="${x-10}" y="${top-6}" width="${w+20}" height="12" rx="4" fill="${c}" stroke="${lineC(c)}" stroke-width="2.5"/>`;
  if (CM.winter) s += `<path d="M ${x-8} ${top-d} H ${x+w+8}" stroke="#FFF" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
function tree(x, y, s = 1, alt = false){
  const k = CM.season;
  const cols = k === 'vinter' ? ['#EEF4FF','#FFFFFF','#DCE8FA','#F6FAFF'] : k === 'efteraar' ? (alt ? ['#7FCB68','#A5D86A','#5DB866','#C2D85A'] : ['#F2994A','#E8B33A','#E0613A','#F6C25B'])
    : k === 'foraar' ? ['#7FCB68','#A7E08A','#86D46F','#9BE36A'] : ['#5DB866','#7FD06F','#4AA35A','#94DB7E'];
  let o = `<ellipse cx="${x}" cy="${y}" rx="${44*s}" ry="${12*s}" fill="#33204F" opacity=".14"/><path d="M ${x-9*s} ${y} L ${x-6*s} ${y-50*s} L ${x+6*s} ${y-50*s} L ${x+9*s} ${y} Z" fill="#9C6B43" stroke="#6E4527" stroke-width="2"/>`;
  const blobs = [[0,-90,46],[-34,-70,32],[34,-68,33],[-18,-112,30],[22,-114,30],[0,-60,30]];
  o += blobs.map(([dx,dy,r],i) => `<circle cx="${x+dx*s}" cy="${y+dy*s}" r="${r*s}" fill="${cols[i%cols.length]}" stroke="${k === 'vinter' ? '#B9C8E6' : adj(cols[0],-0.25)}" stroke-width="2"/>`).join('');
  if (k === 'foraar') o += [[-20,-100],[18,-84],[-36,-72],[30,-110],[4,-66],[-6,-122]].map(([dx,dy])=>`<circle cx="${x+dx*s}" cy="${y+dy*s}" r="${6*s}" fill="#FFC1DC"/>`).join('');
  if (k === 'sommer') o += [[-20,-96],[22,-80],[-30,-66]].map(([dx,dy])=>`<circle cx="${x+dx*s}" cy="${y+dy*s}" r="${5*s}" fill="#FF5F6D"/>`).join('');
  o += `<circle cx="${x-14*s}" cy="${y-104*s}" r="${12*s}" fill="#FFF" opacity=".25"/>`;
  return o;
}
const bush = (x, y, s = 1, c = '#5DB866') => `<ellipse cx="${x}" cy="${y}" rx="${30*s}" ry="${8*s}" fill="#33204F" opacity=".12"/>` + [[-16,-10,16],[14,-10,15],[0,-20,17]].map(([dx,dy,r])=>`<circle cx="${x+dx*s}" cy="${y+dy*s}" r="${r*s}" fill="${c}" stroke="${dk(c,-0.2)}" stroke-width="1.5"/>`).join('') + (CM.winter ? `<ellipse cx="${x}" cy="${y-32*s}" rx="${20*s}" ry="${7*s}" fill="#FFF"/>` : '');
function flowers(x, y, n, w = 60){
  if (CM.winter) return '';
  const cols = CM.season === 'efteraar' ? ['#FF8A3D','#E0457A','#FFC02E','#B9650E'] : ['#FF5FA8','#FFE27A','#B79BFF','#FF8A3D','#FFFFFF','#7FD8FF'];
  let s = ''; for (let i = 0; i < n; i++){ const fx = x + rnd()*w, fy = y + rnd()*w*0.4; s += `<path d="M ${fx} ${fy} v 8" stroke="#4AA35A" stroke-width="2"/><circle cx="${fx}" cy="${fy}" r="4.5" fill="${cols[Math.floor(rnd()*cols.length)]}"/><circle cx="${fx}" cy="${fy}" r="1.6" fill="#FFF3B0"/>`; }
  return s;
}
const lamp = (x, y) => { LAMPS.push([x, y-112]); return `<ellipse cx="${x}" cy="${y}" rx="12" ry="4" fill="#33204F" opacity=".15"/><rect x="${x-3}" y="${y-110}" width="6" height="110" rx="3" fill="#4B3F6B"/><path d="M ${x-11} ${y-120} h 22 l -4 14 h -14 Z" fill="#FFF3B0" stroke="#4B3F6B" stroke-width="3" stroke-linejoin="round"/><path d="M ${x-13} ${y-120} Q ${x} ${y-134} ${x+13} ${y-120} Z" fill="#4B3F6B"/>` + (CM.xmas ? `<path d="M ${x-4} ${y-90} l 8 8 M ${x-4} ${y-70} l 8 8 M ${x-4} ${y-50} l 8 8" stroke="#E0233F" stroke-width="3"/>` : ''); };
const bench = (x, y) => `<ellipse cx="${x}" cy="${y+2}" rx="40" ry="6" fill="#33204F" opacity=".12"/><rect x="${x-36}" y="${y-30}" width="72" height="8" rx="3" fill="#B9763F"/><rect x="${x-36}" y="${y-18}" width="72" height="8" rx="3" fill="#C98A4F"/><rect x="${x-32}" y="${y-10}" width="5" height="12" fill="#4B3F6B"/><rect x="${x+27}" y="${y-10}" width="5" height="12" fill="#4B3F6B"/>` + (CM.winter ? `<rect x="${x-36}" y="${y-34}" width="72" height="5" rx="2" fill="#FFF"/>` : '');
const birdShape = (c) => `<path d="M -10 -4 L -17 -9 L -16 -1 Z" fill="${dk(c)}"/><ellipse cx="-1" cy="-6" rx="10" ry="7" fill="${c}"/><circle cx="7" cy="-12" r="5.5" fill="${c}"/><path d="M 12 -12 L 16 -10 L 12 -9 Z" fill="#FFB33A"/><circle cx="8" cy="-13" r="1.3" fill="#33204F"/>`;
const sign = (x, y, text, col = '#33204F') => { const w = text.length * 13 + 34; return `<g class="sign"><rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="17" fill="#FFF" stroke="#33204F" stroke-opacity=".2" stroke-width="2.5"/><text x="${x}" y="${y+7}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="19" fill="${col}">${text}</text></g>`; };
const soon = (x, y) => `<g transform="translate(${x},${y}) rotate(-6)"><rect x="-58" y="-14" width="116" height="28" rx="6" fill="#FFE27A" stroke="#C99A12" stroke-width="2.5"/><text x="0" y="6" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="16" fill="#33204F">Kommer snart</text></g>`;
const placeG = (id, label, isSoon, inner) => `<g class="place${isSoon?' soon':''}" data-place="${id}" tabindex="0" role="button" aria-label="${label}${isSoon?', kommer snart':''}">${inner}</g>`;
const hit = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFF" fill-opacity="0" pointer-events="all"/>`;

/* ---------- stederne ---------- */
function bFoto(){
  const x = 260, base = 380, w = 220, h = 140, top = base - h, c = '#6FA8FF';
  let s = flatRoof(x, top, w, 70, c);
  s += `<g transform="translate(${x+50},${top-44})"><rect x="-4" y="-2" width="8" height="26" fill="#6B5A8E"/><path d="M -22 -16 L 18 -30 L 22 -20 L -18 -6 Z" fill="#FFF" stroke="#4B3F6B" stroke-width="2"/><circle cx="20" cy="-25" r="5" fill="#BDE4FF" stroke="#4B3F6B" stroke-width="2"/></g>`;
  s += `<g transform="translate(${x+170},${top-40})"><path d="M -18 0 A 18 18 0 0 1 18 -6 Z" fill="#E9F2FF" stroke="#4B3F6B" stroke-width="2"/><path d="M 0 -4 L 8 -14" stroke="#4B3F6B" stroke-width="2"/><rect x="-2" y="-2" width="4" height="12" fill="#4B3F6B"/></g>`;
  s += `<g transform="translate(${x+110},${top-36})"><rect x="-12" y="-8" width="24" height="16" rx="3" fill="#B9763F"/><circle cx="0" cy="-16" r="12" fill="${CM.winter ? '#3E8E5A' : '#5DB866'}"/>${CM.winter ? '' : '<circle cx="-6" cy="-20" r="3" fill="#FF5FA8"/>'}</g>`;
  s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}" stroke="${lineC(c)}" stroke-width="3"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#plank)"/>`;
  s += `<g transform="translate(${x+110},${top+38})"><rect x="-36" y="-22" width="72" height="46" rx="10" fill="#33204F"/><rect x="-14" y="-31" width="28" height="12" rx="3" fill="#33204F"/><circle r="16" fill="#BDE4FF" stroke="#FFF" stroke-width="4"/><circle cx="-4" cy="-4" r="4" fill="#FFF" opacity=".8"/><circle cx="26" cy="-13" r="4" fill="#FFE27A"><animate attributeName="opacity" values="1;1;.15;1" dur="3.5s" repeatCount="indefinite"/></circle></g>`;
  s += win(x+20, top+80, 48, 46, { cur:'#FFFFFF' }) + door(x+170, base, 40, 64, '#2F6FE0') + soon(x+w/2, top+108);
  return placeG('foto', 'Fotostudiet', true, s + sign(x + w/2, top - 96, 'Fotostudiet'));
}
/* skolens port: en stenbygning med to tårne og en stor buet dør; selve slottet ligger oppe på bakken bagved */
function bSkole(){
  const x = 640, base = 370, w = 320, h = 170, top = base - h, cx = x + w/2, S = '#8C86B0', SL = lineC(S), R = '#5A2A78';
  let s = '';
  /* tårnene */
  for (const tx of [x - 14, x + w - 62]){
    s += `<rect x="${tx}" y="${top - 70}" width="76" height="${h + 70}" fill="${S}" stroke="${SL}" stroke-width="3"/><rect x="${tx}" y="${top - 70}" width="76" height="${h + 70}" fill="url(#brick)"/>`;
    s += `<path d="M ${tx - 10} ${top - 68} L ${tx + 38} ${top - 160} L ${tx + 86} ${top - 68} Z" fill="${R}" stroke="${lineC(R)}" stroke-width="3" stroke-linejoin="round"/><path d="M ${tx + 38} ${top - 160} V ${top - 186}" stroke="#4B3F6B" stroke-width="3"/><path d="M ${tx + 38} ${top - 186} l 22 6 l -22 6 Z" fill="#E9C46A"/>`;
    s += win(tx + 24, top - 40, 28, 40, { r:14, cross:false, cur:'#FFE9A0', frame:'#4A4266' }) + win(tx + 24, top + 40, 28, 40, { r:14, cross:false, cur:'#FFE9A0', frame:'#4A4266' });
  }
  /* midterbygningen med tinder */
  s += `<rect x="${x + 60}" y="${top}" width="${w - 120}" height="${h}" fill="${S}" stroke="${SL}" stroke-width="3"/><rect x="${x + 60}" y="${top}" width="${w - 120}" height="${h}" fill="url(#brick)"/>`;
  s += Array.from({ length: 6 }, (_, i) => `<rect x="${x + 62 + i * 34}" y="${top - 18}" width="22" height="20" fill="${S}" stroke="${SL}" stroke-width="3"/>`).join('');
  /* rundt vindue med månen og en stjerne */
  s += `<circle cx="${cx}" cy="${top + 38}" r="26" fill="#2A2350" stroke="#E9C46A" stroke-width="4"/><path d="M ${cx + 2} ${top + 22} a 16 16 0 1 0 12 26 a 13 13 0 1 1 -12 -26 Z" fill="#FFE9A0"/>` + `<polygon points="${star5pts(cx - 10, top + 30, 6, 2.6)}" fill="#FFE9A0"/>`;
  LITS.push([cx - 20, top + 18, 40, 40]);
  /* den store dør */
  s += `<path d="M ${cx - 46} ${base} V ${base - 70} Q ${cx - 46} ${base - 116} ${cx} ${base - 118} Q ${cx + 46} ${base - 116} ${cx + 46} ${base - 70} V ${base} Z" fill="#6A4430" stroke="#3A2414" stroke-width="3"/>`;
  s += `<path d="M ${cx} ${base - 118} V ${base} M ${cx - 46} ${base - 60} H ${cx + 46} M ${cx - 46} ${base - 26} H ${cx + 46}" stroke="#3A2414" stroke-width="3"/><circle cx="${cx - 9}" cy="${base - 44}" r="3.5" fill="#E9C46A"/><circle cx="${cx + 9}" cy="${base - 44}" r="3.5" fill="#E9C46A"/>`;
  s += `<path d="M ${cx - 56} ${base} V ${base - 70} Q ${cx - 56} ${base - 126} ${cx} ${base - 128} Q ${cx + 56} ${base - 126} ${cx + 56} ${base - 70} V ${base}" fill="none" stroke="${SL}" stroke-width="6"/>`;
  /* lygter og trappe */
  s += [cx - 74, cx + 74].map(lx => `<rect x="${lx - 3}" y="${base - 74}" width="6" height="20" fill="#3A2A20"/><path d="M ${lx - 10} ${base - 76} H ${lx + 10} L ${lx + 8} ${base - 54} H ${lx - 8} Z" fill="#FFE27A" stroke="#3A2A20" stroke-width="2"/>`).join('');
  LITS.push([cx - 84, base - 76, 20, 22], [cx + 64, base - 76, 20, 22]);
  s += `<path d="M ${cx - 60} ${base} H ${cx + 60} L ${cx + 70} ${base + 12} H ${cx - 70} Z" fill="#B8B2D0" stroke="${SL}" stroke-width="2"/><path d="M ${cx - 70} ${base + 12} H ${cx + 70} L ${cx + 80} ${base + 24} H ${cx - 80} Z" fill="#A49EC0" stroke="${SL}" stroke-width="2"/>`;
  /* bannere på væggen */
  s += [x + 92, x + w - 92].map(bx => `<path d="M ${bx - 16} ${top + 10} H ${bx + 16} V ${top + 76} L ${bx} ${top + 64} L ${bx - 16} ${top + 76} Z" fill="#6A1F3A" stroke="#3A1020" stroke-width="2"/><polygon points="${star5pts(bx, top + 36, 9, 4)}" fill="#E9C46A"/>`).join('');
  return placeG('skole', 'Skolen', false, s + sign(cx, top - 112, 'Skolen', '#5A2A78'));
}
function bKugler(){
  const x = 1130, base = 380, w = 240, h = 140, top = base - h, c = '#62E0CB';
  let s = flatRoof(x, top, w, 64, c);
  const gx = x + w/2, gy = top - 72;
  s += `<path d="M ${gx-30} ${top-20} h 60 l -6 -16 h -48 Z" fill="#E0233F" stroke="#9C1530" stroke-width="2"/><circle cx="${gx}" cy="${gy}" r="46" fill="#E9FFFB" fill-opacity=".9" stroke="#1F8E80" stroke-width="3"/>`;
  s += [[-22,-12,'#FF5FA8'],[0,-26,'#FFE27A'],[22,-10,'#7B5CFF'],[-12,10,'#6FA8FF'],[14,14,'#FF9A4D'],[-28,12,'#43D3BE'],[28,10,'#FF3D8F'],[2,-2,'#B79BFF'],[-4,28,'#9BE36A'],[20,28,'#FFC02E']].map(([dx,dy,cc])=>`<circle cx="${gx+dx}" cy="${gy+dy}" r="11" fill="${cc}"/><path d="M ${gx+dx-9} ${gy+dy} q 9 -3 18 0" stroke="#FFF" stroke-width="2" fill="none" opacity=".7"/>`).join('') + `<path d="M ${gx-28} ${gy-28} q 10 -12 24 -14" stroke="#FFF" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/>`;
  s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="5" fill="${c}" stroke="${lineC(c)}" stroke-width="3"/>`;
  s += `<text x="${x+w/2}" y="${top+26}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="18" fill="#1F8E80">BOBLER</text>` + awning(x+10, x+w-10, top+38, 22, '#FF5FA8');
  let balls = ''; const cols = ['#FF5FA8','#7B5CFF','#FFE27A','#43D3BE','#FF9A4D','#6FA8FF','#B79BFF'];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - (r%2); i++){ const bx = x+28+i*17+(r%2)*8, by = base-16-r*15; balls += `<circle cx="${bx}" cy="${by}" r="8.5" fill="${cols[Math.floor(rnd()*7)]}"/><path d="M ${bx-8.5} ${by} q 8.5 -3 17 0" stroke="#FFF" stroke-width="2.5" fill="none" opacity=".8"/>`; }
  s += `<rect x="${x+16}" y="${base-74}" width="112" height="70" rx="6" fill="#E9FFFB" stroke="${lineC(c)}" stroke-width="2.5"/><rect x="${x+20}" y="${base-70}" width="104" height="62" rx="4" fill="#FFF"/>${balls}`;
  LITS.push([x+20, base-70, 104, 62]);
  s += door(x+w-52, base, 42, 70, '#FFFFFF', { frame:'#43D3BE' });
  return placeG('kugler', 'Boblebutikken', false, s + sign(x + w/2, top - 140, 'Boblebutikken', '#1F8E80'));
}
function bZoo(){
  const x0 = 1190, x1 = 1580, y0 = 440, y1 = 640;
  let s = `<path d="M ${x0} ${y0} H ${x1} V ${y1} H ${x0} Z" fill="${CM.winter ? '#F4F8FF' : '#C2EBA0'}"/>`;
  s += Array.from({length:14},(_,i)=>`<rect x="${x0+i*28}" y="${y0-26}" width="8" height="30" rx="3" fill="#FFF" stroke="#B9AACB" stroke-width="1"/>`).join('') + `<rect x="${x0}" y="${y0-18}" width="${x1-x0}" height="5" fill="#FFF" stroke="#B9AACB" stroke-width="1"/>`;
  s += `<g transform="translate(1500,560)"><ellipse cx="0" cy="40" rx="34" ry="8" fill="#33204F" opacity=".12"/><rect x="-24" y="-2" width="8" height="42" fill="#FFC75A" stroke="#C98A00" stroke-width="1.5"/><rect x="14" y="-2" width="8" height="42" fill="#FFC75A" stroke="#C98A00" stroke-width="1.5"/><ellipse cx="-2" cy="-8" rx="34" ry="18" fill="#FFC75A" stroke="#C98A00" stroke-width="2"/>`
     + `<g><animateTransform attributeName="transform" type="rotate" values="0 28 -16;-6 28 -16;0 28 -16;0 28 -16" keyTimes="0;.2;.4;1" dur="7s" repeatCount="indefinite"/><path d="M 18 -18 L 24 -110 L 38 -110 L 32 -14 Z" fill="#FFC75A" stroke="#C98A00" stroke-width="2"/>${[[26,-50],[28,-80]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#C98A00" opacity=".55"/>`).join('')}<ellipse cx="40" cy="-118" rx="22" ry="13" fill="#FFC75A" stroke="#C98A00" stroke-width="2"/><path d="M 26 -128 V -142 M 36 -129 V -144" stroke="#C98A00" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="-121" r="2.5" fill="#33204F"/><ellipse cx="58" cy="-114" rx="6" ry="5" fill="#FFE2A6"/></g>`
     + `${[[-10,-10],[8,-4],[-18,-4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#C98A00" opacity=".55"/>`).join('')}<path d="M -36 -10 q -10 10 -6 22" stroke="#C98A00" stroke-width="2" fill="none"/></g>`;
  s += `<ellipse cx="1300" cy="600" rx="70" ry="24" fill="${CM.winter ? '#DDEEFF' : '#6FB8F0'}" stroke="#DCD2EC" stroke-width="6"/><path d="M 1270 596 q 6 -4 12 0 M 1310 608 q 6 -4 12 0" stroke="#FFF" stroke-width="2" fill="none"/>`;
  const peng = (x, y, d) => `<g transform="translate(${x},${y})"><g><animateTransform attributeName="transform" type="rotate" values="-5 0 0;5 0 0;-5 0 0" dur="${d}s" repeatCount="indefinite"/><ellipse cx="0" cy="-16" rx="11" ry="17" fill="#33204F"/><ellipse cx="0" cy="-12" rx="7" ry="12" fill="#FFF"/><circle cx="-3" cy="-26" r="1.8" fill="#FFF"/><circle cx="3" cy="-26" r="1.8" fill="#FFF"/><path d="M -2 -22 L 0 -18 L 2 -22 Z" fill="#FFB33A"/></g><path d="M -6 0 h 5 M 1 0 h 5" stroke="#FFB33A" stroke-width="3" stroke-linecap="round"/></g>`;
  s += peng(1240, 590, 1.1) + peng(1262, 582, 1.4) + peng(1380, 596, 0.9);
  s += tree(1390, 520, 0.8, true) + `<g transform="translate(1412,452)"><g><animateTransform attributeName="transform" type="rotate" values="-8 0 -10;8 0 -10;-8 0 -10" dur="2.4s" repeatCount="indefinite"/><path d="M -4 6 q -14 18 -2 30" stroke="#8A5A35" stroke-width="4" fill="none"/><circle cx="0" cy="0" r="11" fill="#8A5A35"/><ellipse cx="2" cy="2" rx="7" ry="6" fill="#E2B78E"/><circle cx="-11" cy="-2" r="4.5" fill="#E2B78E"/><circle cx="11" cy="-2" r="4.5" fill="#E2B78E"/><circle cx="-1" cy="0" r="1.6" fill="#33204F"/><circle cx="5" cy="0" r="1.6" fill="#33204F"/></g></g>`;
  s += `<g transform="translate(1440,630)"><rect x="-24" y="-24" width="48" height="26" rx="4" fill="#E8B33A" stroke="#9C6B00" stroke-width="2"/><path d="M -28 -24 L 0 -40 L 28 -24 Z" fill="#B9650E"/><rect x="-8" y="-16" width="16" height="18" rx="7" fill="#33204F"/><ellipse cx="22" cy="-2" rx="9" ry="7" fill="#FFF"/><ellipse cx="17" cy="-12" rx="3" ry="8" fill="#FFF"/><ellipse cx="22" cy="-12" rx="3" ry="8" fill="#FFF"/><circle cx="25" cy="-3" r="1.5" fill="#33204F"/></g>`;
  s += Array.from({length:14},(_,i)=>`<rect x="${x0+i*28}" y="${y1-26}" width="8" height="32" rx="3" fill="#FFF" stroke="#B9AACB" stroke-width="1"/>`).join('') + `<rect x="${x0}" y="${y1-18}" width="${x1-x0}" height="6" fill="#FFF" stroke="#B9AACB" stroke-width="1"/>`;
  s += `<rect x="${x0-8}" y="${y0-18}" width="12" height="${y1-y0+20}" fill="#FFF" stroke="#B9AACB" stroke-width="1"/>`;
  s += `<path d="M ${x0-30} 636 V 540 A 34 34 0 0 1 ${x0+38} 540 V 636" stroke="#2E7D3A" stroke-width="12" fill="none"/><circle cx="${x0+4}" cy="506" r="10" fill="#8A5A35"/>${[[-12,-10],[-4,-16],[4,-16],[12,-10]].map(([dx,dy])=>`<circle cx="${x0+4+dx}" cy="${506+dy}" r="4" fill="#8A5A35"/>`).join('')}`;
  s += soon(1330, 470);
  return placeG('dyr', 'Dyreparken', true, s + sign(1385, 410, 'Dyreparken'));
}
function xmasLights(x0, x1, y){
  if (!CM.xmas) return '';
  const cols = ['#FF3D3D','#FFE27A','#43D3BE','#6FA8FF','#FF8FC7']; const n = Math.round((x1-x0)/18);
  let s = `<path d="M ${x0} ${y} Q ${(x0+x1)/2} ${y+22} ${x1} ${y}" stroke="#2E3A2E" stroke-width="1.5" fill="none"/>`;
  for (let i = 1; i < n; i++){ const t = i/n, xx = x0 + (x1-x0)*t, yy = y + 22*t*(1-t)*2; s += `<circle cx="${xx.toFixed(1)}" cy="${(yy+3).toFixed(1)}" r="3.5" fill="${cols[i%5]}"><animate attributeName="opacity" values="1;.3;1" dur="${1.1+(i%3)*0.3}s" repeatCount="indefinite"/></circle>`; }
  return s;
}
function bHus(){
  const x = 110, base = 920, w = 280, h = 150, top = base - h, c = '#FFC1DC';
  let s = gableRoof(x, top, w, 112, '#FF5FA8');
  s += `<rect x="${x+200}" y="${top-96}" width="30" height="56" fill="#E0457A" stroke="#C2276B" stroke-width="2"/><rect x="${x+194}" y="${top-104}" width="42" height="12" rx="3" fill="#C2276B"/>`;
  if (CM.season !== 'sommer') s += [0,1,2].map(i=>`<circle cx="${x+215}" cy="${top-112}" r="8" fill="#FFF" opacity="0"><animate attributeName="cy" values="${top-112};${top-190}" dur="4s" begin="${i*1.33}s" repeatCount="indefinite"/><animate attributeName="r" values="7;18" dur="4s" begin="${i*1.33}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="4s" begin="${i*1.33}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x+215};${x+228};${x+208}" dur="4s" begin="${i*1.33}s" repeatCount="indefinite"/></circle>`).join('');
  // katten der sover på taget
  s += `<g data-tap="roofcat" transform="translate(${x+70},${top-80})"><g class="tapjump"><path d="M -18 0 Q -18 -14 -4 -14 Q 8 -14 14 -6 Q 22 -10 22 -2 Q 20 6 8 4 Q -6 8 -18 0 Z" fill="#8E8EAE"/><path d="M -14 -10 L -12 -20 L -6 -13 Z M -4 -14 L -2 -22 L 3 -14 Z" fill="#8E8EAE"/><path d="M -10 -8 q 2 2 4 0 M -2 -8 q 2 2 4 0" stroke="#33204F" stroke-width="1.2" fill="none"/></g><text x="10" y="-22" font-size="11" fill="#7B5CFF" font-family="${FONT_C}" font-weight="700" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>z</text><text x="18" y="-32" font-size="14" fill="#7B5CFF" font-family="${FONT_C}" font-weight="700" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="3s" begin="1s" repeatCount="indefinite"/>z</text>${hit(-26,-36,54,44)}</g>`;
  s += `<rect x="${x+120}" y="${top-62}" width="40" height="30" rx="3" fill="url(#glass)" stroke="#C2276B" stroke-width="2"/>`;
  s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}" stroke="#E0457A" stroke-width="3"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#plank)"/>`;
  s += `<circle cx="${x+w/2}" cy="${top+30}" r="18" fill="#FFF" stroke="#C2276B" stroke-width="2.5"/><path transform="translate(${x+w/2},${top+31}) scale(1.4)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="#FF3D8F"/>`;
  s += win(x+26, top+30, 58, 52, { cur:'#FFF', box:'#E0457A', inner:`<rect x="${x+26}" y="${top+30}" width="58" height="52" fill="#FFE9F3"/><image id="homeDoll" x="${x+26}" y="${top+30}" width="58" height="52" preserveAspectRatio="xMidYMax slice"/>` });
  s += win(x+w-84, top+30, 58, 52, { cur:'#FFF', box:'#E0457A' });
  s += door(x+w/2, base, 46, 76, '#B657F0');
  s += CM.season === 'efteraar' ? `<circle cx="${x+w/2-34}" cy="${base-8}" r="9" fill="#FF8A3D"/><circle cx="${x+w/2-22}" cy="${base-6}" r="7" fill="#FF9A4D"/><path d="M ${x+w/2-34} ${base-16} v -4" stroke="#4AA35A" stroke-width="2"/>` : `<rect x="${x+w/2-40}" y="${base-16}" width="16" height="14" rx="3" fill="#B9763F"/><circle cx="${x+w/2-32}" cy="${base-20}" r="8" fill="${CM.winter ? '#3E8E5A' : '#5DB866'}"/>`;
  s += bush(x+10, base+6, 0.8) + bush(x+w-6, base+6, 0.8, '#7FD06F');
  s += xmasLights(x-14, x+w+14, top+6);
  return placeG('hus', 'Mit hus', false, s + sign(x + w/2, top - 132, 'Mit hus'));
}
function bCafe(){
  const x = 1190, base = 920, w = 300, h = 160, top = base - h, c = '#FFE9B8';
  let s = gableRoof(x, top, w, 104, '#B9650E');
  s += `<g transform="translate(${x+w-60},${top-96})"><rect x="-1.5" y="0" width="3" height="40" fill="#4B3F6B"/><g><animateTransform attributeName="transform" type="rotate" values="-12 0 0;10 0 0;-12 0 0" dur="5s" repeatCount="indefinite"/><path d="M -10 0 Q -14 -10 -6 -12 Q 0 -22 8 -12 L 14 -14 L 10 -6 Q 8 2 -10 0 Z" fill="#FFC02E" stroke="#9C6B00" stroke-width="1"/></g><path d="M -14 10 h 28 M 0 4 v 12" stroke="#4B3F6B" stroke-width="1.5"/></g>`;
  s += `<g transform="translate(${x+w/2+40},${top-56})"><path d="M -30 0 h 60 l -7 32 h -46 Z" fill="#FF9A4D" stroke="#B9650E" stroke-width="2"/><path d="M -34 0 C -36 -30, 36 -30, 34 0 Z" fill="#FFC1DC" stroke="#E0457A" stroke-width="2"/><circle cy="-26" r="7" fill="#E0233F"/>${[-18,-6,6,18].map((dx,i)=>`<rect x="${dx}" y="-12" width="5" height="2" rx="1" fill="${['#FFE27A','#7FD8FF','#B79BFF','#FFF'][i]}" transform="rotate(${i*40} ${dx} -11)"/>`).join('')}</g>`;
  s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}" stroke="#C99A12" stroke-width="3"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#brick)"/>`;
  s += win(x+20, top+14, 56, 44, { cur:'#FF8FC7', box:'#B9650E' }) + win(x+w-76, top+14, 56, 44, { cur:'#FF8FC7', box:'#B9650E' });
  s += awning(x+12, x+w-12, top+72, 24, '#FF8FC7');
  s += `<rect x="${x+20}" y="${base-66}" width="130" height="58" rx="6" fill="#FFF6E2" stroke="#C99A12" stroke-width="2.5"/>` + [[x+46,'#FF5FA8'],[x+84,'#FFE27A'],[x+122,'#B79BFF']].map(([xx,cc])=>`<path d="M ${xx-10} ${base-14} h 20 l -3 -12 h -14 Z" fill="#FF9A4D"/><circle cx="${xx}" cy="${base-30}" r="10" fill="${cc}"/><circle cx="${xx}" cy="${base-41}" r="3" fill="#E0233F"/>`).join('');
  LITS.push([x+20, base-66, 130, 58]);
  s += door(x+w-58, base, 46, 76, '#B9650E');
  s += `<g data-tap="mouse" transform="translate(${x+w-14},${base})"><path d="M -10 0 V -8 A 6 6 0 0 1 2 -8 V 0 Z" fill="#33204F"/><g class="peek"><circle cx="-4" cy="-6" r="3" fill="#B9AACB"/><circle cx="-6" cy="-9" r="1.6" fill="#B9AACB"/><circle cx="-2" cy="-9" r="1.6" fill="#B9AACB"/><circle cx="-4" cy="-6" r=".8" fill="#33204F"/></g>${hit(-16,-20,26,24)}</g>`;
  s += [x-40, x+w+36].map(xx=>`<g transform="translate(${xx},${base+20})"><ellipse cx="0" cy="2" rx="22" ry="5" fill="#33204F" opacity=".12"/><rect x="-2" y="-26" width="4" height="26" fill="#6B5A8E"/><ellipse cx="0" cy="-28" rx="22" ry="7" fill="#FFF" stroke="#C99A12" stroke-width="1.5"/><path d="M -6 -34 h 8 v 6 h -8 Z" fill="#FFF" stroke="#B9AACB" stroke-width="1"/><path d="M -4 -38 q 2 -4 0 -6" stroke="#FFF" stroke-width="1.5" fill="none"/><path d="M 4 -32 L 14 -32 L 9 -38 Z" fill="#FFC1DC"/></g>`).join('');
  s += `<g transform="translate(${x+18},${base+14})" stroke="#7B5CFF" stroke-width="2.5" fill="none"><circle cx="-16" cy="0" r="11"/><circle cx="18" cy="0" r="11"/><path d="M -16 0 L -4 -16 L 12 -16 L 18 0 M -4 -16 L 2 0 L 12 -16 M 12 -16 L 10 -24 h 6 M -4 -16 v -6 h -6"/></g>`;
  s += soon(x+w/2, top+100) + xmasLights(x-14, x+w+14, top+6);
  return placeG('cafe', 'Caféen', true, s + sign(x + w/2 - 70, top - 126, 'Caféen'));
}

/* ---------- hele byen ---------- */
function townSvg(){
  CM = cityMood(); LITS = []; LAMPS = []; SEED = 17;
  const [sa, sb] = SKY[CM.time], W = CW, H = CH;
  const grass = CM.winter ? ['#EEF4FB','#DCE6F5','#FFFFFF'] : CM.season === 'efteraar' ? ['#B6D87E','#9CC46A','#D6E89E'] : ['#A8DC86','#8CCB6E','#C5EBA8'];
  let s = `<svg id="townSvg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Byen"><defs>
<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sa}"/><stop offset="1" stop-color="${sb}"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB8F0"/><stop offset="1" stop-color="#9FD8FF"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4F4FF"/><stop offset="1" stop-color="#A9D4F5"/></linearGradient>
<radialGradient id="pondG" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${CM.winter ? '#F2F8FF' : '#9FE0FF'}"/><stop offset="1" stop-color="${CM.winter ? '#C6DDF5' : '#5BB4E8'}"/></radialGradient>
<radialGradient id="lampG"><stop offset="0" stop-color="#FFF4B8" stop-opacity=".95"/><stop offset=".4" stop-color="#FFE48A" stop-opacity=".4"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>
<filter id="glowF" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<pattern id="grass" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="${grass[0]}"/><path d="M 8 12 l 2 -6 l 2 6 M 38 30 l 2 -6 l 2 6 M 50 8 l 1.5 -5 l 1.5 5" stroke="${grass[1]}" stroke-width="1.6" fill="none"/><circle cx="24" cy="20" r="1.5" fill="${grass[2]}"/></pattern>
<pattern id="cob" width="34" height="20" patternUnits="userSpaceOnUse"><rect width="34" height="20" fill="#EDE2F4"/><rect x="1.5" y="1.5" width="14" height="7" rx="3" fill="#E0D2EC"/><rect x="18.5" y="1.5" width="14" height="7" rx="3" fill="#E5D8EF"/><rect x="10" y="11.5" width="14" height="7" rx="3" fill="#E0D2EC"/></pattern>
<pattern id="brick" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M 0 1 H 40 M 0 11 H 40 M 10 1 V 11 M 30 11 V 21" stroke="#000" stroke-opacity=".08" stroke-width="2" fill="none"/></pattern>
<pattern id="plank" width="30" height="16" patternUnits="userSpaceOnUse"><path d="M 0 15 H 30" stroke="#000" stroke-opacity=".07" stroke-width="2"/></pattern></defs>`;
  /* himmel og horisont */
  s += `<rect x="-900" y="-700" width="${W+1800}" height="${H+700}" fill="${sa}"/><rect width="${W}" height="${H}" fill="url(#skyG)"/><rect x="-900" y="0" width="900" height="${H}" fill="url(#skyG)"/><rect x="${W}" y="0" width="900" height="${H}" fill="url(#skyG)"/>`;
  /* skolen: et slot på bakken bag byen, med tændte vinduer */
  s += `<g transform="translate(380 0)">${schoolOnHill()}</g>`;
  if (CM.night){ SEED = 3; s += Array.from({length:50},()=>`<circle cx="${(rnd()*W).toFixed(0)}" cy="${(rnd()*120).toFixed(0)}" r="${(1+rnd()*2).toFixed(1)}" fill="#FFF"><animate attributeName="opacity" values="1;.25;1" dur="${(2+rnd()*3).toFixed(1)}s" repeatCount="indefinite"/></circle>`).join('') + `<g transform="translate(1500,58)"><circle r="30" fill="#FFF6D8"/><circle cx="13" cy="-8" r="27" fill="${sa}"/></g>`; SEED = 17; }
  else { const sy = CM.time === 'dag' ? 60 : 110; s += `<circle cx="1500" cy="${sy}" r="34" fill="${CM.time === 'aften' ? '#FFC07A' : '#FFF3B0'}"/><circle cx="1500" cy="${sy}" r="52" fill="#FFF3B0" opacity=".35"/>`; }
  s += [[120,46,1,0],[480,30,1.2,1],[1060,52,.9,2],[1300,26,1,3]].map(([x,y,k,i])=>`<g opacity="${CM.night ? .2 : 1}"><animateTransform attributeName="transform" type="translate" values="0 0;${40+i*10} 0;0 0" dur="${40+i*7}s" repeatCount="indefinite"/><g transform="translate(${x},${y}) scale(${k})"><ellipse rx="54" ry="20" fill="#FFF"/><ellipse cx="30" cy="-10" rx="34" ry="22" fill="#FFF"/><ellipse cx="-28" cy="-6" rx="28" ry="17" fill="#FFF"/></g></g>`).join('');
  s += `<rect x="880" y="104" width="720" height="60" fill="url(#sea)"/>` + [0,1,2,3,4,5].map(i=>`<path d="M ${920+i*110} ${126+(i%2)*14} q 10 -5 20 0" stroke="#FFF" stroke-width="2.5" fill="none" opacity=".8"/>`).join('');
  s += `<g transform="translate(1440,118)"><path d="M -8 0 L -5 -46 L 5 -46 L 8 0 Z" fill="#FFF" stroke="#C2276B" stroke-width="1.5"/><path d="M -7 -12 H 7 M -6 -26 H 6" stroke="#E0233F" stroke-width="7"/><rect x="-7" y="-56" width="14" height="10" fill="#FFE27A" stroke="#33204F" stroke-width="1.5"/><path d="M -9 -56 L 0 -64 L 9 -56 Z" fill="#E0233F"/>${CM.dark ? `<g transform="translate(0,-51)"><path d="M 0 0 L 90 -12 L 90 12 Z" fill="#FFF3B0" opacity=".55"><animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1" dur="4s" repeatCount="indefinite"/></path></g>` : ''}</g>`;
  s += `<g><animateTransform attributeName="transform" type="translate" values="1130 132;1190 132;1130 132" dur="60s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur="3s" repeatCount="indefinite"/><path d="M -22 0 H 22 L 14 9 H -14 Z" fill="#B9763F"/><path d="M 0 -2 V -36 L 20 -6 Z" fill="#FFF" stroke="#C9C1DA" stroke-width="1"/><path d="M -2 -4 L -2 -30 L -16 -6 Z" fill="#FF8FC7"/></g></g>`;
  s += `<path d="M 0 150 C 120 90, 260 80, 420 110 C 560 136, 700 92, 900 120 L 900 170 L 0 170 Z" fill="${CM.winter ? '#F4F8FF' : '#B9E3A0'}"/><path d="M 0 160 C 200 120, 380 130, 560 140 C 700 146, 820 132, 920 150 L 920 175 L 0 175 Z" fill="${CM.winter ? '#E6EEFA' : '#A3D98A'}"/>`;
  s += `<g transform="translate(300,98)"><path d="M -10 22 L -6 -10 H 6 L 10 22 Z" fill="#FFF3E6" stroke="#B9763F" stroke-width="1.5"/><path d="M -8 -10 L 0 -20 L 8 -10 Z" fill="#B9763F"/><g transform="translate(0,-10)"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="12s" repeatCount="indefinite"/>${[0,90,180,270].map(a=>`<rect x="-2.5" y="-30" width="5" height="28" rx="1.5" transform="rotate(${a})" fill="#8A5A35"/><rect x="-6" y="-28" width="5" height="20" transform="rotate(${a})" fill="#FFF" opacity=".8"/>`).join('')}</g></g><circle cy="-10" r="3" fill="#6E4527"/></g>`;
  if (!CM.winter) s += [[220,128],[236,132],[380,124],[400,130],[392,120]].map(([x,y])=>`<g transform="translate(${x},${y})"><ellipse rx="7" ry="5" fill="#FFF"/><circle cx="6" cy="-2" r="3" fill="#33204F"/></g>`).join('');
  if (!CM.night) s += `<g><animateTransform attributeName="transform" type="translate" values="600 70;700 54;600 70" dur="50s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="5s" repeatCount="indefinite"/><path d="M -6 30 L -10 46 H 10 L 6 30" stroke="#8A5A35" stroke-width="1.5" fill="none"/><rect x="-10" y="44" width="20" height="13" rx="3" fill="#B9763F"/><circle r="34" fill="#FF5FA8"/><path d="M -34 0 A 34 34 0 0 0 34 0 Z" fill="#FFE27A" opacity=".9"/><path d="M -12 -32 Q -18 0 -8 30 M 12 -32 Q 18 0 8 30 M 0 -34 V 30" stroke="#FFF" stroke-width="5" fill="none" opacity=".7"/></g></g>`;
  /* græs og stier */
  s += `<path d="M -900 170 C -400 160, -200 172, 0 168 C 300 160, 600 172, 900 164 C 1100 160, 1400 168, 1600 162 C 1900 160, 2200 170, 2500 166 L 2500 1700 L -900 1700 Z" fill="url(#grass)"/>`;
  for (let x = 10; x < W; x += 46 + rnd()*30) s += tree(x, 186 + rnd()*10, 0.38 + rnd()*0.1, rnd() < 0.5);
  const PATHS = ['M 800 600 L 800 360', 'M 800 600 C 620 520, 500 450, 430 395', 'M 800 600 C 980 520, 1220 450, 1318 395', 'M 800 600 C 980 610, 1120 600, 1200 590', 'M 800 600 L 800 1000', 'M -900 955 L 2500 955', 'M 800 600 C 620 690, 460 720, 450 955', 'M 800 600 C 980 690, 1140 720, 1150 955'];
  const pc = CM.winter ? ['#D2DCEC','#F6F9FF'] : ['#DCC79C','#F3E6C4'];
  s += PATHS.map(d => `<path d="${d}" stroke="${pc[0]}" stroke-width="66" fill="none" stroke-linecap="round"/>`).join('') + PATHS.map(d => `<path d="${d}" stroke="${pc[1]}" stroke-width="56" fill="none" stroke-linecap="round" stroke-dasharray="40 4"/>`).join('');
  /* søen */
  s += `<ellipse cx="250" cy="520" rx="180" ry="78" fill="${CM.winter ? '#E1EAF6' : '#8DC977'}"/><ellipse cx="250" cy="520" rx="168" ry="68" fill="url(#pondG)" stroke="${CM.winter ? '#A9C6E8' : '#4E9FD6'}" stroke-width="3"/>`;
  if (!CM.winter){
    s += [[170,500],[300,548],[340,494],[205,550]].map(([x,y],i)=>`<g transform="translate(${x},${y})"><path d="M -16 0 a 16 9 0 1 0 32 0 a 16 9 0 1 0 -32 0 Z" fill="#5DB866"/><path d="M 0 0 L 16 -4 L 15 3 Z" fill="url(#pondG)"/>${i===1 && CM.season !== 'efteraar' ? '<circle cx="-4" cy="-5" r="4" fill="#FF8FC7"/><circle cx="-4" cy="-5" r="1.5" fill="#FFF3B0"/>' : ''}</g>`).join('');
    s += `<g data-tap="frog" transform="translate(170,494)"><g class="tapjump"><ellipse cx="0" cy="-6" rx="10" ry="7" fill="#7CCB5A"/><circle cx="-5" cy="-12" r="3.5" fill="#7CCB5A"/><circle cx="5" cy="-12" r="3.5" fill="#7CCB5A"/><circle cx="-5" cy="-12" r="1.6" fill="#33204F"/><circle cx="5" cy="-12" r="1.6" fill="#33204F"/><path d="M -4 -5 q 4 3 8 0" stroke="#33204F" stroke-width="1.2" fill="none"/></g>${hit(-20,-28,40,32)}</g>`;
    const duck = (k) => `<g transform="scale(${k})"><ellipse cx="0" cy="0" rx="16" ry="8" fill="#FFF" stroke="#C9C1DA" stroke-width="1"/><path d="M -14 -2 L -20 -8 L -12 -6 Z" fill="#FFF"/><circle cx="10" cy="-10" r="7" fill="#3E9A5A"/><path d="M 16 -10 L 23 -8 L 16 -6 Z" fill="#FFB33A"/><circle cx="12" cy="-12" r="1.4" fill="#33204F"/></g>`;
    const duckling = (dx) => `<g transform="translate(${dx},4)"><ellipse rx="7" ry="4.5" fill="#FFE27A"/><circle cx="5" cy="-5" r="3.8" fill="#FFE27A"/><path d="M 8 -5 L 11 -4 L 8 -3 Z" fill="#FF9A3D"/></g>`;
    s += `<g data-tap="duck"><g><animateTransform attributeName="transform" type="translate" values="300 526;180 512;300 526" dur="30s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="scale" values="1 1;1 1;-1 1;-1 1;1 1" keyTimes="0;.48;.5;.98;1" dur="30s" repeatCount="indefinite"/><g class="tapjump">${duck(1.15)}${duckling(-30)}${duckling(-48)}${duckling(-66)}</g>${hit(-80,-24,110,36)}</g></g></g>`;
    s += `<g transform="translate(330,520)"><g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.8;.84;.94;1" dur="9s" repeatCount="indefinite"/><path d="M -12 0 Q 0 -22 12 0" stroke="#5BB4E8" stroke-width="3" fill="none"/><path d="M -3 -14 q 6 -6 12 -2 l 4 -4 l 0 8 l -4 -2 q -6 4 -12 0 Z" fill="#FF9A3D"/></g></g>`;
  } else s += `<path d="M 160 520 q 30 -10 60 0 M 260 540 q 30 -8 50 2" stroke="#FFF" stroke-width="3" fill="none"/>`;
  s += `<rect x="370" y="474" width="70" height="14" fill="#B9763F" stroke="#7E4307" stroke-width="2"/>` + [380,404,428].map(x=>`<rect x="${x}" y="486" width="5" height="14" fill="#7E4307"/>`).join('');
  s += `<g transform="translate(395,500)"><g><animateTransform attributeName="transform" type="rotate" values="-2;2;-2" dur="4s" repeatCount="indefinite"/><path d="M -34 0 Q 0 16 34 0 L 28 -8 H -28 Z" fill="#E0613A" stroke="#9C3A1E" stroke-width="2"/><path d="M -24 -8 H 24" stroke="#FFF" stroke-width="2"/><path d="M -6 -8 L -20 -22" stroke="#B9763F" stroke-width="3"/></g></g>`;
  if (!CM.winter) s += [[90,470],[100,480],[112,468],[420,560],[430,552]].map(([x,y])=>`<path d="M ${x} ${y} q 2 -22 -2 -34" stroke="#4AA35A" stroke-width="3" fill="none"/><rect x="${x-3}" y="${y-36}" width="6" height="12" rx="3" fill="#8A5A35"/>`).join('');
  /* bagerste række og dyreparken */
  s += bFoto() + bSkole() + bKugler() + bZoo();
  /* torvet */
  s += `<ellipse cx="800" cy="600" rx="270" ry="120" fill="#DCCFE9"/><ellipse cx="800" cy="598" rx="262" ry="114" fill="url(#cob)"/>`;
  s += [[560,600],[1040,600]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="34" ry="16" fill="#8A5A35"/>` + (CM.winter ? `<ellipse cx="${x}" cy="${y-4}" rx="30" ry="10" fill="#FFF"/>` : flowers(x-30, y-14, 9, 60))).join('');
  s += `<g transform="translate(660,690)" stroke="#FF8FC7" stroke-width="2.5" fill="none" opacity=".85"><rect x="0" y="0" width="22" height="16"/><rect x="22" y="-8" width="22" height="16"/><rect x="22" y="8" width="22" height="16"/><rect x="44" y="0" width="22" height="16"/></g><g transform="translate(940,690)" stroke="#FFC02E" stroke-width="2.5" fill="none" opacity=".85"><circle r="9"/>${[0,45,90,135,180,225,270,315].map(a=>`<path d="M 13 0 L 19 0" transform="rotate(${a})"/>`).join('')}</g>`;
  if (CM.xmas) s += `<g transform="translate(560,600)"><rect x="-6" y="-14" width="12" height="16" fill="#8A5A35"/>${[[0,-120,30],[0,-90,42],[0,-58,54]].map(([x,y,w])=>`<path d="M ${-w} ${y+50} L 0 ${y} L ${w} ${y+50} Z" fill="#2E8B57" stroke="#1E6B42" stroke-width="2" stroke-linejoin="round"/>`).join('')}<polygon points="${star5pts(0,-124,12,5)}" fill="#FFE27A" stroke="#C99A12" stroke-width="1.5"/>${Array.from({length:12},(_,i)=>{ const t=i/12, y=-14-t*100, w=50*(1-t); return `<circle cx="${(Math.sin(i*2.3)*w*0.8).toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${['#FF3D3D','#FFE27A','#43D3BE','#6FA8FF'][i%4]}"><animate attributeName="opacity" values="1;.3;1" dur="${1+(i%3)*0.4}s" repeatCount="indefinite"/></circle>`; }).join('')}</g>`;
  // springvand
  s += `<g data-tap="fountain"><ellipse cx="800" cy="600" rx="96" ry="38" fill="#B7A6D9"/><path d="M 704 600 V 580 Q 800 548 896 580 V 600 Q 800 640 704 600 Z" fill="#CFC1EC" stroke="#8D7CB8" stroke-width="2.5"/><ellipse cx="800" cy="580" rx="86" ry="28" fill="${CM.winter ? '#E6F2FF' : '#8FD6FF'}" stroke="#8D7CB8" stroke-width="2.5"/>`;
  s += `<ellipse cx="770" cy="584" rx="6" ry="2.5" fill="#FFD54A"/><circle cx="772" cy="582" r="1.5" fill="#FFF"><animate attributeName="opacity" values="0;1;0;0" dur="2.5s" repeatCount="indefinite"/></circle>`;
  s += `<rect x="792" y="510" width="16" height="72" fill="#CFC1EC" stroke="#8D7CB8" stroke-width="2"/><ellipse cx="800" cy="510" rx="34" ry="9" fill="#CFC1EC" stroke="#8D7CB8" stroke-width="2"/>`;
  if (!CM.winter){ s += `<g id="jets" fill="none" stroke="#BDEBFF" stroke-width="4" stroke-linecap="round" opacity=".95">${[-1,1].map(d=>`<path d="M 800 500 Q ${800+d*40} 440 ${800+d*70} 576" stroke-dasharray="10 7"><animate attributeName="stroke-dashoffset" values="34;0" dur=".55s" repeatCount="indefinite"/></path><path d="M 800 506 Q ${800+d*18} 470 ${800+d*30} 508" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" values="24;0" dur=".5s" repeatCount="indefinite"/></path>`).join('')}<path d="M 800 504 V 456" stroke-dasharray="8 6"><animate attributeName="stroke-dashoffset" values="28;0" dur=".5s" repeatCount="indefinite"/></path></g>`;
    s += [-40,0,40].map((dx,i)=>`<ellipse cx="${800+dx}" cy="${582+(i===1?6:0)}" rx="12" ry="3.5" fill="none" stroke="#FFF" stroke-width="1.5"><animate attributeName="rx" values="3;16" dur="1.5s" begin="${i*0.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.5s" begin="${i*0.5}s" repeatCount="indefinite"/></ellipse>`).join(''); }
  else s += `<ellipse cx="800" cy="504" rx="30" ry="7" fill="#FFF"/>`;
  s += hit(704, 450, 192, 170) + `</g>`;
  if (!CM.winter) s += `<g data-tap="pigeons">${[[720,640,1],[744,650,-1],[880,646,-1]].map(([x,y,f],i)=>`<g transform="translate(${x},${y}) scale(${1.1*f},1.1)"><g class="pg"><g><animateTransform attributeName="transform" type="rotate" values="0;0;22;0;0" keyTimes="0;.6;.66;.72;1" dur="${2.2+i*0.6}s" repeatCount="indefinite"/>${birdShape('#A9A9C6')}</g></g></g>`).join('')}${hit(700,620,200,40)}</g>`;
  s += bench(640, 560) + bench(960, 560);
  s += lamp(560, 540) + lamp(1040, 540) + lamp(620, 700) + lamp(980, 700);
  /* isvogn med balloner */
  { const x = 1090, y = 640, w = CM.winter;
    s += `<image id="vendor" x="${x-40}" y="${y-132}" width="72" height="100" preserveAspectRatio="xMidYMax meet"/><g data-tap="vendor">${hit(x-40, y-132, 72, 70)}</g>`;
    s += `<path d="M ${x-6} ${y-40} V ${y-150}" stroke="#6B5A8E" stroke-width="3"/><path d="M ${x-56} ${y-142} Q ${x-6} ${y-196} ${x+44} ${y-142} Z" fill="${w ? '#8A5A35' : '#FF5FA8'}" stroke="${w ? '#5E3B20' : '#C2276B'}" stroke-width="2"/><path d="M ${x-30} ${y-145} Q ${x-20} ${y-180} ${x-10} ${y-148} M ${x+2} ${y-148} Q ${x+12} ${y-180} ${x+22} ${y-145}" fill="#FFF" opacity=".85"/>`;
    s += `<rect x="${x-50}" y="${y-62}" width="90" height="50" rx="9" fill="#FFF" stroke="#E0457A" stroke-width="2.5"/><rect x="${x-50}" y="${y-62}" width="90" height="13" rx="6" fill="${w ? '#8A5A35' : '#FF8FC7'}"/><text x="${x-5}" y="${y-23}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="16" fill="#E0457A">${w ? 'KAKAO' : 'IS'}</text>`;
    s += [x-34, x+24].map(xx=>`<circle cx="${xx}" cy="${y-10}" r="10" fill="#33204F"/><circle cx="${xx}" cy="${y-10}" r="3.5" fill="#FFF"/>`).join('');
    s += `<g data-tap="balloons" id="balloons">` + ['#FF3D8F','#FFE27A','#43D3BE','#7B5CFF'].map((c, i) => { const bx = x+70+(i-1.5)*16, by = y-140-(i%2)*20;
      return `<g class="balloon" data-c="${c}" data-x="${bx}" data-y="${by}"><g><animateTransform attributeName="transform" type="rotate" values="-3 ${x+36} ${y-40};3 ${x+36} ${y-40};-3 ${x+36} ${y-40}" dur="${3+i*0.5}s" repeatCount="indefinite"/><path d="M ${x+36} ${y-40} Q ${bx+4} ${(y-40+by)/2} ${bx} ${by+18}" stroke="#9C95B5" stroke-width="1.2" fill="none"/><ellipse cx="${bx}" cy="${by}" rx="13" ry="16" fill="${c}"/><ellipse cx="${bx-4}" cy="${by-5}" rx="3.5" ry="5" fill="#FFF" opacity=".5"/></g></g>`; }).join('') + `</g>`; }
  /* haven og legepladsen mellem de forreste huse */
  s += tree(520, 820, 0.95) + tree(1080, 830, 0.9, true);
  if (!CM.winter) s += `<g data-tap="nest" transform="translate(506,722)"><ellipse rx="15" ry="7" fill="#8A5A35"/><path d="M -14 -1 q 14 6 28 0" stroke="#6E4527" stroke-width="1.5" fill="none"/>${[-7,0,7].map(dx=>`<g class="chick"><circle cx="${dx}" cy="-5" r="4.5" fill="#FFE27A"/><path d="M ${dx-2} -10 L ${dx} -14 L ${dx+2} -10 Z" fill="#FF9A3D"/></g>`).join('')}${hit(-22,-26,44,34)}</g>`;
  s += `<g data-tap="squirrel" transform="translate(1094,792)"><g class="sq"><g transform="rotate(-80)"><path d="M -10 -4 C -26 -6, -28 -30, -14 -34 C -6 -36, -4 -26, -10 -20" fill="#D9823A" stroke="#A85A1E" stroke-width="1.5"/><ellipse cx="0" cy="-6" rx="9" ry="7" fill="#E8913F"/><circle cx="8" cy="-13" r="6" fill="#E8913F"/><circle cx="10" cy="-14" r="1.5" fill="#33204F"/></g></g>${hit(-34,-22,44,44)}</g>`;
  s += `<g data-tap="fairy" transform="translate(520,816)"><path d="M -6 0 V -10 A 6 6 0 0 1 6 -10 V 0 Z" fill="#B657F0" stroke="#7B2FB0" stroke-width="1.2"/><circle cx="3" cy="-5" r="1" fill="#FFD54A"/><g class="sparkle" opacity="0"><polygon points="${star5pts(0,-22,6,2.5)}" fill="#FFE27A"/><polygon points="${star5pts(12,-14,4,1.7)}" fill="#FFF"/><polygon points="${star5pts(-12,-16,4,1.7)}" fill="#FFF"/></g>${hit(-14,-24,28,28)}</g>` + (CM.winter ? '' : [[540,822],[548,826],[500,824]].map(([x,y])=>`<g transform="translate(${x},${y})"><rect x="-1.5" y="-5" width="3" height="6" fill="#FFF"/><path d="M -6 -5 Q 0 -12 6 -5 Z" fill="#E0233F"/><circle cx="-2" cy="-7" r="1" fill="#FFF"/></g>`).join(''));
  s += `<g transform="translate(620,860)"><path d="M -40 0 L -30 -90 L 30 -90 L 40 0" stroke="#FF5FA8" stroke-width="7" fill="none" stroke-linejoin="round"/><g><animateTransform attributeName="transform" type="rotate" values="-14 0 -88;14 0 -88;-14 0 -88" dur="2.6s" repeatCount="indefinite"/><path d="M -12 -88 V -34 M 12 -88 V -34" stroke="#9C95B5" stroke-width="2"/><image id="swingKid" x="-27" y="-104" width="54" height="76" preserveAspectRatio="xMidYMax meet"/><rect x="-16" y="-36" width="32" height="7" rx="3" fill="#FFC02E"/><g data-tap="swing">${hit(-24,-104,48,76)}</g></g></g>`;
  s += `<g transform="translate(700,880)"><rect x="-4" y="-62" width="6" height="62" fill="#6FA8FF"/><path d="M 0 -50 h 8 M 0 -36 h 8 M 0 -22 h 8" stroke="#6FA8FF" stroke-width="3"/><path d="M 2 -60 H 22 Q 30 -60 40 -40 L 60 -4 H 70" stroke="#FFC02E" stroke-width="10" fill="none" stroke-linecap="round"/>${CM.winter ? '<path d="M 2 -66 H 22" stroke="#FFF" stroke-width="6" stroke-linecap="round"/>' : ''}</g>`;
  s += bush(470, 900, 0.9) + `<g data-tap="hedgehog" transform="translate(442,906)"><g class="tapjump"><path d="M -14 0 Q -14 -16 0 -16 Q 14 -16 16 -2 Z" fill="#8A6A4A"/>${[-10,-5,0,5,10].map(dx=>`<path d="M ${dx} -14 l -3 -6 M ${dx+2} -12 l 2 -7" stroke="#5E4530" stroke-width="1.5"/>`).join('')}<path d="M 16 -2 q 6 0 6 -4 q -4 -4 -8 -2" fill="#E2B78E"/><circle cx="20" cy="-6" r="1.4" fill="#33204F"/></g>${hit(-18,-24,44,28)}</g>`;
  s += flowers(860, 870, 14, 90) + (CM.winter ? `<g transform="translate(900,880)"><circle cy="-10" r="14" fill="#FFF" stroke="#C6D4EA" stroke-width="1.5"/><circle cy="-30" r="10" fill="#FFF" stroke="#C6D4EA" stroke-width="1.5"/><path d="M 0 -30 l 10 2 l -10 2 Z" fill="#FF8A3D"/><circle cx="-3" cy="-33" r="1.4" fill="#33204F"/><circle cx="3" cy="-33" r="1.4" fill="#33204F"/><path d="M -8 -22 h 16" stroke="#E0233F" stroke-width="4"/></g>` : `<g transform="translate(902,880)"><circle r="4" fill="#E0233F"/><path d="M 0 -4 V 4" stroke="#33204F" stroke-width="1"/><circle cx="-1.5" cy="-1" r="0.9" fill="#33204F"/><circle cx="1.5" cy="1.5" r="0.9" fill="#33204F"/><circle cx="0" cy="-4.5" r="1.8" fill="#33204F"/></g>`);
  s += bush(980, 920, 1.1, '#4AA35A') + `<g id="hiddenStars"></g>`;
  // dragen og barnet der holder den
  if (!CM.night) s += `<g transform="translate(470,300)"><g><animateTransform attributeName="transform" type="rotate" values="-16;-6;-16" dur="3s" repeatCount="indefinite"/><path d="M 0 -30 L 22 0 L 0 34 L -22 0 Z" fill="#FF5FA8" stroke="#C2276B" stroke-width="2"/><path d="M 0 -30 V 34 M -22 0 H 22" stroke="#FFF" stroke-width="2"/><path d="M 0 34 q 10 16 -4 30 q -12 14 2 26" stroke="#9C95B5" stroke-width="1.5" fill="none"/>${[[4,50],[-4,72]].map(([x,y])=>`<path d="M ${x-5} ${y} l 5 4 l 5 -4 l -5 -4 Z" fill="#FFE27A"/>`).join('')}</g></g><path d="M 470 334 Q 440 520 448 778" stroke="#9C95B5" stroke-width="1.2" fill="none" opacity=".8"/><image id="kiteKid" x="414" y="752" width="62" height="88" preserveAspectRatio="xMidYMax meet"/><g data-tap="kitekid">${hit(418,752,54,88)}</g>`;
  /* forreste række */
  s += bHus() + bCafe();
  // hundehus, tørresnor med dukketøj, postkasse, havenisse, snegl
  { const x = 110, base = 920, w = 280;
    s += `<g data-tap="doghouse" transform="translate(${x-60},${base-10})"><path d="M -26 0 V -30 L 0 -50 L 26 -30 V 0 Z" fill="#E0613A" stroke="#9C3A1E" stroke-width="2"/>${CM.winter ? '<path d="M -28 -30 L 0 -52 L 28 -30" stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round"/>' : ''}<path d="M -10 0 V -16 A 10 10 0 0 1 10 -16 V 0 Z" fill="#33204F"/><g class="peek2" opacity="0"><circle cx="-3" cy="-8" r="1.6" fill="#FFF"/><circle cx="3" cy="-8" r="1.6" fill="#FFF"/></g><path d="M 30 2 l 12 -4 m -12 4 l 12 4 m 0 -4 h 12 m 0 0 l 6 -4 m -6 4 l 6 4" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>${hit(-28,-52,56,54)}</g>`;
    s += `<g transform="translate(${x+w+20},${base-40})"><path d="M 0 40 V -40 M 150 40 V -40" stroke="#8A5A35" stroke-width="5"/><path d="M 0 -36 Q 75 -24 150 -36" stroke="#9C95B5" stroke-width="1.5" fill="none"/><g><animateTransform attributeName="transform" type="rotate" values="-2 75 -36;2 75 -36;-2 75 -36" dur="2.2s" repeatCount="indefinite"/>`
       + `<path d="M 18 -34 h 24 l 4 8 l -6 2 v 18 h -20 v -18 l -6 -2 Z" fill="#62E0CB"/><polygon points="${star5pts(30,-18,4,1.8)}" fill="#FFE27A"/><path d="M 60 -31 h 20 l 8 26 h -36 Z" fill="#FF5FA8"/><path d="M 100 -30 h 8 v 18 h 6 v 6 h -14 Z" fill="#B79BFF"/><path d="M 118 -30 h 8 v 18 h 6 v 6 h -14 Z" fill="#B79BFF"/></g><rect x="17" y="-38" width="3" height="6" fill="#FFC02E"/><rect x="40" y="-36" width="3" height="6" fill="#FFC02E"/><rect x="66" y="-34" width="3" height="6" fill="#FFC02E"/></g>`;
    s += `<g data-tap="mailbox" transform="translate(${x+w+12},${base+18})"><rect x="-2" y="-30" width="4" height="30" fill="#6B5A8E"/><rect x="-14" y="-46" width="28" height="18" rx="5" fill="#E0233F" stroke="#9C1530" stroke-width="1.5"/><g class="letter"><rect x="2" y="-52" width="14" height="10" fill="#FFF" stroke="#B9AACB" stroke-width="1" transform="rotate(-14 9 -47)"/></g>${hit(-18,-58,36,58)}</g>`;
    s += `<g data-tap="gnome" transform="translate(${x+w/2+40},${base+10})"><g class="tapjump"><path d="M -8 0 L 0 -26 L 8 0 Z" fill="#E0233F"/><circle cy="-6" r="6" fill="#FFDCC2"/><path d="M -6 -2 Q 0 8 6 -2 Q 0 2 -6 -2 Z" fill="#FFF"/><rect x="-7" y="0" width="14" height="8" rx="3" fill="#6FA8FF"/></g>${hit(-12,-30,24,40)}</g>`;
    if (!CM.winter) s += `<g><animateTransform attributeName="transform" type="translate" values="${x+w+70} ${base+24};${x+w+110} ${base+24}" dur="90s" repeatCount="indefinite"/><path d="M -10 0 h 22 q 4 0 4 -6 l -2 -6" stroke="#C9A98A" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="0" cy="-8" r="8" fill="#E8B33A" stroke="#9C6B00" stroke-width="1.5"/><path d="M 0 -8 m -4 0 a 4 4 0 1 0 4 -4" stroke="#9C6B00" stroke-width="1.2" fill="none"/></g>`; }
  /* busstoppestedet */
  { const x = 880, y = 948;
    s += `<rect x="${x-50}" y="${y-74}" width="100" height="8" rx="3" fill="#4B3F6B"/>${CM.winter ? `<rect x="${x-50}" y="${y-79}" width="100" height="6" rx="3" fill="#FFF"/>` : ''}<rect x="${x-46}" y="${y-66}" width="4" height="66" fill="#4B3F6B"/><rect x="${x+42}" y="${y-66}" width="4" height="66" fill="#4B3F6B"/><rect x="${x-42}" y="${y-66}" width="84" height="50" fill="#CFE9FF" opacity=".5" stroke="#FFF" stroke-width="2"/><rect x="${x-34}" y="${y-22}" width="60" height="6" rx="2" fill="#FFC02E"/>`;
    s += `<rect x="${x+62}" y="${y-96}" width="5" height="96" fill="#6B5A8E"/><circle cx="${x+64}" cy="${y-104}" r="15" fill="#FFC02E" stroke="#C98A00" stroke-width="2"/><text x="${x+64}" y="${y-98}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="17" fill="#33204F">8</text>`; }
  /* fugle der kan lette */
  s += `<g id="birds">${[[180,650,'#7FB5FF'],[360,676,'#FF8FC7'],[1340,642,'#FFC02E'],[740,186,'#8ED8B8'],[1480,180,'#FF7A6B']].map(([x,y,c])=>`<g data-tap="bird" class="bird" transform="translate(${x},${y})"><g class="b-in">${birdShape(c)}</g><circle cx="0" cy="-8" r="18" fill="#FFF" fill-opacity="0" pointer-events="all"/></g>`).join('')}</g>`;
  /* aften- og natteskygge og lys */
  const sh = SHADE[CM.time];
  if (sh) s += `<rect x="-900" y="-700" width="${W+1800}" height="${H+1400}" fill="${sh[0]}" opacity="${sh[1]}" style="mix-blend-mode:multiply" pointer-events="none"/>`;
  if (CM.dark) s += `<g opacity="${CM.night ? 1 : 0.6}" pointer-events="none">` + LITS.map(([x,y,w,h],i)=>(i%5===3 ? '' : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#FFD36E" opacity=".55" filter="url(#glowF)"/>`)).join('') + LAMPS.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="70" fill="url(#lampG)"/>`).join('') + `</g>`;
  /* stemning: ildfluer og mørke kanter */
  s += townFireflies() + placeMood([], { vign: CM.night ? .7 : .55, dx: 100, dw: 1400 });
  /* figurerne (dukken, dyret, folk) */
  s += `<g id="chars"></g><g id="bubbles" pointer-events="none"></g><g id="fx" pointer-events="none">${weather()}</g>`;
  return s + `</svg>`;
}
function schoolOnHill(){
  const E = '#2A1E52', Wl = '#3E2E78', R = '#5A2A78', Y = '#FFD86B';
  const tw = (x, w, top, apex) => `<rect x="${x}" y="${top}" width="${w}" height="${172-top}" fill="${Wl}" stroke="${E}" stroke-width="2.5"/><path d="M ${x-6} ${top+1} L ${x+w/2} ${apex} L ${x+w+6} ${top+1} Z" fill="${R}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const wn = (x, y) => `<rect x="${x}" y="${y}" width="7" height="11" rx="3.5" fill="${Y}"><animate attributeName="opacity" values="1;.7;1" dur="${(2.5 + (x % 7) / 3).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
  let o = `<g opacity=".95"><path d="M -40 172 C 0 110, 120 96, 200 104 C 260 110, 300 140, 330 172 Z" fill="#3A2C70"/>`;
  o += tw(40, 26, 92, 50) + tw(150, 24, 98, 62) + `<rect x="66" y="112" width="84" height="60" fill="${Wl}" stroke="${E}" stroke-width="2.5"/>` + tw(96, 30, 70, 22);
  o += `<path d="M 111 22 V 10" stroke="${E}" stroke-width="2"/><path d="M 111 10 l 12 4 l -12 4" fill="#FF5FA8"/>`;
  o += wn(49, 110) + wn(49, 132) + wn(158, 116) + wn(78, 128) + wn(104, 90) + wn(124, 128) + wn(104, 124) + `<circle cx="111" cy="80" r="6" fill="${Y}"/>`;
  return o + `</g>`;
}
function townFireflies(){
  if (calm) return '';
  SEED = 11; let o = '';
  for (let i = 0; i < 22; i++){
    const cx = 60 + rnd() * 1480, cy = 220 + rnd() * 720, d = (5 + rnd() * 6).toFixed(1), rad = 16 + rnd() * 40;
    const pts = Array.from({ length: 4 }, (_, j) => { const a = j / 4 * Math.PI * 2; return `${(Math.cos(a) * rad * (0.6 + rnd() * 0.8)).toFixed(0)} ${(Math.sin(a) * rad * (0.4 + rnd() * 0.6)).toFixed(0)}`; });
    o += `<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)})" pointer-events="none"><g><animateMotion dur="${d}s" repeatCount="indefinite" path="M ${pts[0]} C ${pts[1]} ${pts[2]} ${pts[3]} S ${pts[1]} ${pts[0]} Z" begin="-${(rnd() * 6).toFixed(1)}s"/><circle r="14" fill="#F2FF9A" opacity=".18"/><circle r="3" fill="#FFFBD0"><animate attributeName="opacity" values="1;.2;1;.6;1" dur="${(1.4 + rnd() * 1.6).toFixed(1)}s" repeatCount="indefinite"/></circle></g></g>`;
  }
  return o;
}
function weather(){
  SEED = 5; let s = '';
  if (CM.winter) for (let i = 0; i < 45; i++){ const x = rnd()*CW, d = 8 + rnd()*7; s += `<circle cx="${x.toFixed(0)}" cy="-10" r="${(2.5 + rnd()*3).toFixed(1)}" fill="#FFF" opacity=".9"><animate attributeName="cy" values="-10;${CH+10}" dur="${d.toFixed(1)}s" begin="-${(rnd()*d).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }
  if (CM.season === 'efteraar') for (let i = 0; i < 16; i++){ const x = rnd()*CW, d = 10 + rnd()*6, c = ['#F2994A','#E0613A','#E8B33A'][i%3];
    s += `<g><animateMotion path="M ${x.toFixed(0)} 150 C ${(x+70).toFixed(0)} 400, ${(x-50).toFixed(0)} 700, ${(x+30).toFixed(0)} ${CH}" dur="${d.toFixed(1)}s" begin="-${(rnd()*d).toFixed(1)}s" repeatCount="indefinite"/><path d="M 0 -6 Q 6 0 0 6 Q -6 0 0 -6 Z" fill="${c}"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="3s" repeatCount="indefinite"/></path></g>`; }
  if (CM.season === 'foraar' && !CM.dark) for (let i = 0; i < 12; i++){ const x = rnd()*CW, d = 12 + rnd()*6;
    s += `<g><animateMotion path="M ${x.toFixed(0)} 150 C ${(x+90).toFixed(0)} 400, ${(x-30).toFixed(0)} 700, ${(x+60).toFixed(0)} ${CH}" dur="${d.toFixed(1)}s" begin="-${(rnd()*d).toFixed(1)}s" repeatCount="indefinite"/><ellipse rx="4" ry="3" fill="#FFC1DC"/></g>`; }
  if ((CM.season === 'sommer' || CM.season === 'foraar') && !CM.dark) [[560,440,'#FF8FC7'],[930,840,'#FFE27A'],[1140,700,'#7FD8FF'],[200,820,'#B79BFF']].forEach(([x,y,c],i) => {
    s += `<g><animateMotion path="M ${x} ${y} c 40 -50 90 10 40 -20 c -30 -40 -80 20 -40 20 Z" dur="${8+i}s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="scale" values="1 1;.25 1;1 1" dur=".3s" repeatCount="indefinite"/><ellipse cx="-5" cy="-2" rx="5.5" ry="7" fill="${c}"/><ellipse cx="5" cy="-2" rx="5.5" ry="7" fill="${c}"/><ellipse cx="-4" cy="5" rx="3.5" ry="4" fill="${adj(c,-0.1)}"/><ellipse cx="4" cy="5" rx="3.5" ry="4" fill="${adj(c,-0.1)}"/></g><rect x="-1" y="-6" width="2" height="13" rx="1" fill="#33204F"/></g>`; });
  if (CM.season === 'sommer' && CM.night) for (let i = 0; i < 18; i++){ const x = rnd()*CW, y = 300 + rnd()*600;
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3" fill="#FFF7A0"><animate attributeName="opacity" values="0;1;0" dur="${(2+rnd()*2).toFixed(1)}s" begin="${(rnd()*3).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }
  SEED = 17; return s;
}

/* ================= Liv: dukken, dyret og folk der går ad stierne ================= */
Object.assign(sfx, {
  bark: () => { tone(560, 0.07, 'square', 0.05, 0, 0.6); tone(500, 0.09, 'square', 0.05, 0.13, 0.55); },
  meow: () => { tone(650, 0.14, 'sine', 0.06, 0, 1.6); tone(1040, 0.28, 'sine', 0.05, 0.14, 0.55); },
  quack: () => [0, 0.16].forEach(d => tone(420, 0.1, 'sawtooth', 0.03, d, 0.7)),
  ribbit: () => [0, 0.12].forEach(d => tone(180, 0.08, 'square', 0.04, d, 1.6)),
  chirp: () => [0, 0.09, 0.18].forEach(d => tone(2300, 0.06, 'sine', 0.04, d, 1.4)),
  hello: () => [659, 880].forEach((f, i) => tone(f, 0.11, 'triangle', 0.05, i*0.11, 1.08)),
  splash: () => { tone(700, 0.25, 'sine', 0.04, 0, 0.4); tone(1200, 0.2, 'sine', 0.025, 0.05, 0.5); },
  pop: () => tone(500, 0.07, 'square', 0.04, 0, 2.2),
  squeak: () => [0, 0.08, 0.16].forEach(d => tone(1900, 0.05, 'sine', 0.035, d, 1.3)),
  roar: () => tone(220, 0.3, 'sawtooth', 0.03, 0, 0.7),
  twinkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.12, 'sine', 0.035, i*0.08, 1.05)),
});
const PET_SAY = { kat:'Mjav!', hund:'Vov vov!', kanin:'Snøf snøf!', enhjoerning:'Iiihh!', bjoern:'Brum!', drage:'Rawr!' };
const PET_SND = { kat:'meow', hund:'bark', kanin:'squeak', enhjoerning:'chirp', bjoern:'roar', drage:'roar' };
const PET_FACE = { enhjoerning: -1 };          // enhjørningen er tegnet med hovedet mod venstre
const VB_DOLL = '40 40 720 1010', VB_PET = '460 700 400 380';
const DOLL_H = 150, PET_H = 70;               // højde ved dybde-skala 1
const depthS = y => 0.6 + (y - 380) / 575 * 0.5;
/* ruter fra torvet (HUB) ud til hvert sted på kortet; figurer går altid via torvet foran brønden */
const HUB = [800, 724];
const R_HUS = [HUB, [700,722], [612,706], [560,748], [500,778], [440,792], [380,792], [334,786]];
const R_BRO = [HUB, [900,716], [962,708], [1020,766], [1064,846], [1108,874], [1172,852]];
const ROUTES = {
  hub:    [HUB],
  skole:  [HUB, [890,712], [900,640], [866,592], [812,562], [800,528]],
  hus:    R_HUS,
  kugler: [HUB, [900,716], [980,682], [1040,664], [1120,692], [1200,722], [1232,732]],
  dyr:    [HUB, [900,712], [960,640], [1010,590], [1060,550], [1100,514]],
  cafe:   [HUB, [806,746], [806,800], [790,880], [750,950], [706,984]],
  koncert:[HUB, [806,746], [802,860], [764,958], [660,994], [400,996], [190,994]],
  arkade: R_BRO.concat([[1238,878], [1290,920], [1330,980], [1432,994]]),
  bro:    R_BRO,
  drage:  R_HUS.slice(0, -1).concat([[300,798], [200,796], [160,740], [146,640], [150,520], [166,412]]),
  baenkV: [HUB, [700,620], [690,574]],
  baenkH: [HUB, [900,640], [910,574]],
};
const PLACES = [
  { id:'hus', name:'Kollegiet', open: () => showRoom() },
  { id:'skole', name:'Skolen', open: () => showSchool() },
  { id:'kugler', name:'Boblebutikken', open: () => showBalls() },
  { id:'cafe', name:'Den Flyvende Støvle', soon:true },
  { id:'dyr', name:'Dyreparken', soon:true },
  { id:'koncert', name:'Koncertsalen', soon:true },
  { id:'arkade', name:'Arkaden', soon:true },
];
let heroAt = 'hus', walking = false, SPR = null;
const LIFE = { on: false, last: 0, chars: [], bubbles: [], peds: [], nextPed: 0, id: 0, gen: 0 };
const NS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs = {}, html = ''){ const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; }
/* en tegning laves om til et almindeligt billede én gang — så hakker det ikke */
function raster(svg, w, h){
  return new Promise(res => { const img = new Image();
    img.onload = () => { try { const c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); } catch(e){ res(img.src); } };
    img.onerror = () => res(''); img.src = svgUrl(svg); });
}
/* vejen fra et sted til et andet: tilbage til hvor ruterne skilles, og så ud ad den nye (ofte via torvet) */
const routeTo = (from, to) => { const A = ROUTES[from] || ROUTES.hub, B = ROUTES[to] || ROUTES.hub; let k = 0; while (k < A.length && k < B.length && A[k] === B[k]) k++; k = Math.max(1, k); return A.slice(k - 1).reverse().concat(B.slice(k)); };
const endOf = id => { const r = ROUTES[id] || ROUTES.hub; return r[r.length - 1]; };
/* en figur: dukke eller dyr, med position, dybde og retning */
function makeChar(kind, href, o = {}){
  const isPet = kind === 'pet', h = (isPet ? PET_H : DOLL_H) * (o.k || 1), w = isPet ? h * 400/380 : h * 720/1010, foot = isPet ? 0.921 : 0.977;
  const g = sv('g', { 'data-tap': o.tap || kind, 'data-id': o.id || '' }, `<ellipse cx="0" cy="0" rx="${w*0.28}" ry="${h*0.04}" fill="#33204F" opacity=".16"/><g class="cb"><g class="cf"><image x="${-w/2}" y="${-h*foot}" width="${w}" height="${h}" href="${href}" pointer-events="none"/></g></g><rect x="${-w*0.3}" y="${-h*0.95}" width="${w*0.6}" height="${h*0.95}" fill="#FFF" fill-opacity="0" pointer-events="all"/>`);
  const c = { kind, g, img: g.querySelector('image'), cf: g.querySelector('.cf'), cb: g.querySelector('.cb'), x: o.x ?? HUB[0], y: o.y ?? HUB[1], h, face: o.face || 1, dir: 1, bob: !!o.bob, t0: Math.random() * 1000 };
  if (c.face < 0) c.cf.setAttribute('transform', 'scale(-1,1)');
  $('#chars').append(g); LIFE.chars.push(c); placeChar(c); return c;
}
function placeChar(c){ const s = depthS(c.y); c.g.setAttribute('transform', `translate(${c.x.toFixed(1)},${c.y.toFixed(1)}) scale(${s.toFixed(3)})`); }
function setDir(c, dx){ if (Math.abs(dx) < 0.5) return; const d = dx < 0 ? -1 : 1; if (d !== c.dir){ c.dir = d; c.cf.setAttribute('transform', d * c.face < 0 ? 'scale(-1,1)' : ''); } }
function sortChars(){ const L = $('#chars'); if (!L) return; const sorted = LIFE.chars.slice().sort((a, b) => a.y - b.y); sorted.forEach((c, i) => { if (L.children[i] !== c.g) L.insertBefore(c.g, L.children[i] || null); }); }
/* gå langs en rute med jævn fart; kalder done til sidst */
function walkRoute(c, pts, speed, done){
  const seg = []; let total = 0;
  for (let i = 1; i < pts.length; i++){ const l = Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); seg.push(l); total += l; }
  c.route = { pts, seg, total, d: 0, speed, done };
}
function routePos(r, d){
  let i = 0; while (i < r.seg.length - 1 && d > r.seg[i]){ d -= r.seg[i]; i++; }
  const k = r.seg[i] ? Math.min(1, d / r.seg[i]) : 1, a = r.pts[i], b = r.pts[i+1] || a;
  return [a[0] + (b[0]-a[0])*k, a[1] + (b[1]-a[1])*k, b[0]-a[0]];
}
function tickChar(c, dt, now){
  if (c.route && !c.paused){ const r = c.route;
    r.d = Math.min(r.total, r.d + r.speed * depthS(c.y) * dt); const [x, y, dx] = routePos(r, r.d); setDir(c, dx); c.x = x; c.y = y;
    if (r.d >= r.total){ c.route = null; r.done && r.done(); } }
  if (c.bob){ const moving = !!c.route && !c.paused, t = (now + c.t0) / 1000;
    c.cb.setAttribute('transform', moving ? `translate(0,${(-Math.abs(Math.sin(t * 7)) * 5).toFixed(1)}) rotate(${(Math.sin(t * 7) * 3).toFixed(1)})` : ''); }
  placeChar(c);
}
/* taleboble der følger en figur */
function bubble(text, pos, ms = 2300, special = false){
  const w = Math.max(70, text.length * 12 + 34);
  const g = sv('g', { class:'bubble' }, `<g class="pop"><g class="bb"><rect x="${-w/2}" y="-46" width="${w}" height="42" rx="21" fill="#FFF" stroke="${special?'#FFC02E':'#33204F'}" stroke-opacity="${special?1:.22}" stroke-width="${special?4:2.5}"/><text y="-19" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="21" fill="#33204F">${escT(text)}</text></g><path d="M -9 -5.5 L 0 10 L 9 -5.5 Z" fill="#FFF"/><path d="M -9 -4 L 0 10 L 9 -4" fill="none" stroke="${special?'#FFC02E':'#33204F'}" stroke-opacity="${special?1:.22}" stroke-width="${special?3:2}" stroke-linejoin="round"/></g>`);
  $('#bubbles').append(g);
  const b = { g, pos, until: performance.now() + ms };
  const bb = g.querySelector('.bb');
  b.place = () => { let [x, y] = b.pos(); const [vx0, vx1, vy0] = camView(); const bx = Math.max(vx0 + w/2 + 6, Math.min(vx1 - w/2 - 6, x)); x = Math.max(vx0 + 16, Math.min(vx1 - 16, x)); y = Math.max(vy0 + 56, y);
    g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); bb.setAttribute('transform', `translate(${Math.max(-w/2 + 24, Math.min(w/2 - 24, bx - x)).toFixed(1)},0)`); };
  b.place(); LIFE.bubbles.push(b); return b;
}
const above = c => () => [c.x, c.y - c.h * depthS(c.y) * 0.98];

/* ---------- folk i byen ---------- */
const GREET = ['Hej!', 'Hej med dig!', 'Hejsa!', 'Flot tøj!', 'Godt hår!', 'Hej hej!'];
const SPOTS = ['skole','kugler','dyr','hus','cafe','koncert','arkade','bro','baenkV','baenkH'];
async function spawnPed(){
  const gen = LIFE.gen;
  const heroFig = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0];
  const others = figures.filter(f => !heroFig || f.id !== heroFig.id);
  let g;
  if (others.length && Math.random() < 0.25 && !LIFE.peds.some(p => p.own)){ const f = pick(others); g = { name: f.name, st: enforce(fixState(clone(f.st))), own: true }; }
  else g = randomGuest(LIFE.peds.map(p => p.name));
  const p = { id: ++LIFE.id, name: g.name, st: g.st, own: g.own };
  LIFE.peds.push(p);
  const k = 0.92, hasDog = g.own ? g.st.pet.kind !== 'ingen' : Math.random() < 0.35;
  let petSt = null;
  if (hasDog){ petSt = clone(p.st); if (!g.own && Math.random() < 0.6) petSt.pet.kind = pick(['hund','hund','kat']); p.petKind = petSt.pet.kind; }
  const [doll, pet] = await Promise.all([
    raster(renderDoll(p.st, { viewBox: VB_DOLL, pet: false }), DOLL_H * k * 0.713 * 2.4, DOLL_H * k * 2.4),
    petSt ? raster(renderDoll(petSt, { petOnly: true, petMode: 'walk', viewBox: VB_PET }), PET_H * 0.9 * 1.053 * 2.4, PET_H * 0.9 * 2.4) : null ]);
  if (!LIFE.on || gen !== LIFE.gen){ return; }
  const from = pick(['koncert','hus','cafe','arkade','kugler','dyr']), start = endOf(from);
  p.c = makeChar('doll', doll, { tap:'ped', id: p.id, x: start[0], y: start[1], k, bob: true });
  if (pet) p.dog = makeChar('pet', pet, { tap:'dog', id: p.id, x: start[0], y: start[1] + 4, k: 0.9, bob: true, face: PET_FACE[p.petKind] || 1 });
  if (p.dog) p.dog.isDog = true;
  p.at = from;
  if (p.own) setTimeout(() => { if (p.c && LIFE.on && gen === LIFE.gen){ sfx.twinkle(); bubble('Hej! Det er mig, ' + p.name + '!', above(p.c), 3200, true); } }, 1200);
  pedNext(p);
}
function pedNext(p){
  if (!LIFE.on) return;
  const to = pick(SPOTS.filter(s => s !== p.at));
  walkRoute(p.c, routeTo(p.at, to), 0.07, () => { p.at = to; p.wait = setTimeout(() => pedNext(p), 2500 + Math.random() * 5000); });
}
function tickDog(p){
  const d = p.dog; if (!d) return;
  const r = p.c.route;
  // hunden går lidt foran i snor ad samme rute
  if (r && !p.c.paused){ const [x, y, dx] = routePos(r, Math.min(r.total, r.d + 40)); setDir(d, dx); d.x = x + 8; d.y = y + 4; }
  else if (!r && Math.abs(d.x - p.c.x) < 20){ d.x = p.c.x + 34; }
  if (!d.leash){ d.leash = sv('path', { fill:'none', stroke: adj(p.st.robe.a, -0.2), 'stroke-width': 2.5, 'stroke-linecap':'round', 'pointer-events':'none' }); $('#chars').append(d.leash); }
  const s1 = depthS(p.c.y), s2 = depthS(d.y), side = d.x >= p.c.x ? 1 : -1, hx = p.c.x + side * 20 * s1, hy = p.c.y - 62 * s1, cx = d.x - side * 10 * s2, cy = d.y - 30 * s2;
  d.leash.setAttribute('d', `M ${hx.toFixed(1)} ${hy.toFixed(1)} Q ${((hx+cx)/2).toFixed(1)} ${(Math.max(hy, cy) + 14).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`);
  d.bobStop = !r || p.c.paused;
}
function greetPed(p){
  const now = performance.now(); if (!p.c || now < (p.greet || 0)) return;
  p.greet = now + 2800; sfx.hello(); p.c.paused = true;            // stopper op og vinker
  p.spr = p.spr || svgUrl(renderDoll(p.st, { viewBox: VB_DOLL, anim: !calm, greet: true, pet: false }));
  const old = p.c.img.getAttribute('href'); p.c.img.setAttribute('href', p.spr);
  setTimeout(() => { if (p.c){ p.c.img.setAttribute('href', old); p.c.paused = false; } }, 2800);
  const say = p.own ? 'Hej! Det er mig, ' + p.name + '!' : Math.random() < 0.35 ? 'Jeg hedder ' + p.name + '!' : pick(GREET);
  bubble(say, above(p.c), 2600, p.own);
}

/* ---------- dukken og hendes dyr ---------- */
function heroPetFollow(){
  const h = LIFE.hero, pet = LIFE.pet; if (!pet) return;
  const r = h.route;
  if (r){ const lag = 60; if (r.d > lag){ const [x, y, dx] = routePos(r, r.d - lag); setDir(pet, dx); pet.x = x; pet.y = y + 6; }
    else { const [x, y] = routePos(r, 0), k = r.d / lag, sx = pet.sx ?? pet.x, sy = pet.sy ?? pet.y; pet.sx = sx; pet.sy = sy; setDir(pet, x - sx); pet.x = sx + (x - sx) * k; pet.y = sy + (y + 6 - sy) * k; } }
  pet.sx = r && r.d <= 60 ? pet.sx : undefined; pet.sy = r && r.d <= 60 ? pet.sy : undefined;
}
function visit(id){
  const p = PLACES.find(x => x.id === id); if (!p || walking) return;
  if (p.soon){ sfx.nope(); toast(p.name + ' kommer snart!'); return; }
  sfx.pick(); walking = true;
  const h = LIFE.hero, pet = LIFE.pet;
  const done = () => { heroAt = id; walking = false; h.img.setAttribute('href', SPR.idle); if (pet) pet.img.setAttribute('href', SPR.sit); sfx.open(); goTo(() => p.open()); };
  if (calm || heroAt === id){ done(); return; }
  h.img.setAttribute('href', SPR.walk);
  if (pet) pet.img.setAttribute('href', SPR.pwalk);
  walkRoute(h, routeTo(heroAt, id), 0.3, done);
}

/* ---------- tryk på ting ---------- */
function tapThing(t){
  const kind = t.dataset.tap, now = performance.now();
  const jump = e => { if (typeof e === 'string') e = t.querySelector(e); if (!e) return; e.classList.remove('jump'); void e.getBoundingClientRect(); e.classList.add('jump'); };
  const say = (txt, x, y, ms = 1500) => bubble(txt, () => [x, y], ms);
  if (kind === 'ped' || kind === 'dog'){
    const p = LIFE.peds.find(o => String(o.id) === t.dataset.id); if (!p) return;
    if (kind === 'ped') return greetPed(p);
    (sfx[PET_SND[p.petKind]] || sfx.bark)(); jump(p.dog.cb); return bubble(PET_SAY[p.petKind] || 'Vov!', above(p.dog), 1500);
  }
  if (kind === 'doll'){   // hendes egen dukke: står hun ved et sted, går hun ind; ellers vinker hun
    if (walking) return;
    if (PLACES.find(p => p.id === heroAt && !p.soon)) return visit(heroAt);
    if (now < (LIFE.heroGreet || 0)) return;
    LIFE.heroGreet = now + 2900; sfx.hello();
    SPR.greet = SPR.greet || svgUrl(renderDoll(heroState(), { viewBox: VB_DOLL, anim: !calm, greet: true, pet: false }));
    LIFE.hero.img.setAttribute('href', SPR.greet); setTimeout(() => { if (!walking) LIFE.hero.img.setAttribute('href', SPR.idle); }, 2900);
    return bubble('Hej!', above(LIFE.hero), 2000);
  }
  if (kind === 'pet'){ if (walking) return; const k = heroState().pet.kind; (sfx[PET_SND[k]] || sfx.pick)(); jump(LIFE.pet.cb); return bubble(PET_SAY[k] || '!', above(LIFE.pet), 1500); }
  if (kind === 'roofcat'){ sfx.meow(); jump('.tapjump'); return say('Mjav… zzz', 180, 670); }
  if (kind === 'frog'){ sfx.ribbit(); jump('.tapjump'); return say('Kvæk!', 170, 470); }
  if (kind === 'duck'){ sfx.quack(); jump('.tapjump'); return say('Rap rap!', 250, 480); }
  if (kind === 'hedgehog'){ sfx.squeak(); jump('.tapjump'); return say('Snøf!', 450, 870); }
  if (kind === 'gnome'){ sfx.pop(); jump('.tapjump'); return say('Hihi!', 290, 890); }
  if (kind === 'squirrel'){ sfx.squeak(); jump('.sq'); return say('Nødder!', 1094, 750); }
  if (kind === 'nest'){ sfx.chirp(); t.querySelectorAll('.chick').forEach(e => jump(e)); return say('Pip pip pip!', 506, 690); }
  if (kind === 'mouse'){ sfx.squeak(); jump('.peek'); return say('Pip!', 1476, 880); }
  if (kind === 'doghouse'){ sfx.bark(); const e = t.querySelector('.peek2'); e.setAttribute('opacity', 1); setTimeout(() => e.setAttribute('opacity', 0), 1500); return say('Vov!', 50, 840); }
  if (kind === 'mailbox'){ sfx.pick(); jump('.letter'); return say('Brev til dig!', 402, 870); }
  if (kind === 'fairy'){ sfx.twinkle(); jump('.sparkle'); return; }
  if (kind === 'pigeons'){ sfx.chirp(); t.querySelectorAll('.pg').forEach(e => jump(e)); return; }
  if (kind === 'fountain'){ sfx.splash(); const j = $('#jets'); if (j){ j.classList.remove('big'); void j.getBoundingClientRect(); j.classList.add('big'); } return; }
  if (kind === 'balloons') return releaseBalloon();
  if (kind === 'vendor'){ sfx.hello(); return say(CM.winter ? 'Varm kakao i kulden!' : pick(['Lækker is i dag!', 'Jordbær er min favorit!', 'Pas på, isen smelter!']), 1086, 500, 2400); }
  if (kind === 'swing'){ sfx.hello(); return say('Wiii!', 620, 740); }
  if (kind === 'kitekid'){ sfx.hello(); return say('Se min drage!', 446, 740, 2000); }
  if (kind === 'bird') return flyBird(t);
  /* det nye kort: dragen, Øksebrønden og dyrene */
  const top = tapTop(t), sayT = (txt, ms = 1600) => bubble(txt, () => top, Math.max(ms, 1300 + [...txt].length * 75));
  if (kind === 'drage'){
    if (dragonBusy || walking) return;
    if (heroAt === 'drage' || calm) return dragonTalk(t);
    const h = LIFE.hero, pet = LIFE.pet; walking = true; sfx.pick();
    h.img.setAttribute('href', SPR.walk); if (pet) pet.img.setAttribute('href', SPR.pwalk);
    return walkRoute(h, routeTo(heroAt, 'drage'), 0.3, () => { heroAt = 'drage'; walking = false; h.img.setAttribute('href', SPR.idle); if (pet) pet.img.setAttribute('href', SPR.sit); dragonTalk(t); });
  }
  if (kind === 'broend') return wellWish(t);
  if (kind === 'trold'){ sfx.roar(); jump('.tapjump'); return sayT(pick(TXT.trold), 2200); }
  if (kind === 'krage'){ sfx.chirp(); jump('.tapjump'); return sayT(pick(TXT.krage), 2000); }
  if (kind === 'and'){ sfx.quack(); jump('.tapjump'); return sayT(pick(TXT.and)); }
  if (kind === 'bjoern'){ sfx.roar(); jump('.tapjump'); return sayT(pick(TXT.bjoern)); }
  if (kind === 'enhjoerning'){ sfx.twinkle(); jump('.tapjump'); return sayT(pick(TXT.enhjoerning)); }
  if (kind === 'drageunge'){ sfx.pop(); jump('.tapjump'); return sayT(pick(TXT.drageunge)); }
  if (kind === 'kat'){ sfx.meow(); jump('.tapjump'); return sayT(pick(TXT.kat)); }
  if (kind === 'snegl'){ sfx.squeak(); jump('.tapjump'); return sayT(pick(TXT.snegl)); }
  if (kind === 'star') return foundStar(t);
}
function tapTop(t){
  const svg = $('#townSvg'), r = t.getBoundingClientRect(), m = svg && svg.getScreenCTM();
  if (!m) return [800, 400];
  const pt = svg.createSVGPoint(); pt.x = r.left + r.width / 2; pt.y = r.top; const q = pt.matrixTransform(m.inverse());
  return [q.x, q.y - 6];
}

/* ---------- dragen: vågner, fortæller en plat vittighed og falder i søvn igen ---------- */
let dragonBusy = false, dragonDeck = [];
function dragonTalk(t){
  if (dragonBusy) return; dragonBusy = true;
  if (!dragonDeck.length) dragonDeck = TXT['drage-vitser'].map((_, i) => i).sort(() => Math.random() - .5);
  const [q, a] = TXT['drage-vitser'][dragonDeck.pop()], pos = () => [232, 128], gen = LIFE.gen;
  const wake = on => { t.querySelectorAll('.k-wake').forEach(e => { e.style.display = on ? '' : 'none'; }); t.querySelectorAll('.k-sleep').forEach(e => { e.style.display = on ? 'none' : ''; }); };
  wake(true); sfx.roar();
  /* hver boble står længe nok til at kunne læses: længere replikker står længere */
  const dur = (t, min) => Math.max(min, 1300 + [...t].length * 75);
  const w = pick(TXT['drage-vaagner']), l = pick(TXT['drage-griner']);
  const steps = [[w, dur(w, 1900), false], [q, dur(q, 3200), false], [a, dur(a, 3000), true], [l, dur(l, 1900), false]];
  let at = 0;
  steps.forEach(([txt, ms, sp], i) => { setTimeout(() => { if (gen !== LIFE.gen) return; if (i === 2) sfx.twinkle(); bubble(txt, pos, ms - 100, sp); }, at); at += ms; });
  setTimeout(() => { wake(false); dragonBusy = false; }, at);
}

/* ---------- Øksebrønden: en stjerne i brønden giver en økse, der dukker op på værelset ---------- */
const KEY_AXE = 'glimmerstudiet.oekser', AXE_MAX = 12;
const axeCount = () => Math.max(0, Math.min(AXE_MAX, +store.get(KEY_AXE, 0) || 0));
let wellAsk = 0, wellBusy = false;
function wellWish(t){
  if (wellBusy) return;
  const n = axeCount(), now = performance.now(), pos = () => [800, 500];
  if (n >= AXE_MAX){ sfx.nope(); return bubble(TXT.broend.tom, pos, 2200); }
  if (prog.stars < 1){ sfx.nope(); return bubble(TXT.broend.ingen, pos, 2400); }
  if (now > wellAsk){ wellAsk = now + 4000; sfx.pick(); return bubble(TXT.broend.spoerg, pos, 3200); }
  wellAsk = 0; wellBusy = true;
  addStars(-1); sfx.coin();
  const fx = $('#fx'), st = sv('g', { 'pointer-events':'none' }, `<polygon points="${star5pts(0,0,13,5.5)}" fill="#FFE27A" stroke="#C99A12" stroke-width="2"/>`);
  fx.append(st); const t0 = performance.now();
  const fall = now2 => { const k = Math.min(1, (now2 - t0) / 700), y = 470 + k * 150, sc = 1 - k * .6;
    st.setAttribute('transform', `translate(800,${y.toFixed(1)}) scale(${sc.toFixed(2)}) rotate(${(k * 300).toFixed(0)})`);
    if (k < 1) requestAnimationFrame(fall); else { st.remove(); sfx.splash(); setTimeout(axeUp, 400); } };
  requestAnimationFrame(fall);
  const axeUp = () => {
    const ax = sv('g', { 'pointer-events':'none' }, axeSvg(1.4)); fx.append(ax); const t1 = performance.now(); sfx.twinkle();
    const rise = now3 => { const k = Math.min(1, (now3 - t1) / 1100), e = 1 - Math.pow(1 - k, 3);
      ax.setAttribute('transform', `translate(800,${(616 - e * 190).toFixed(1)}) rotate(${(e * 360).toFixed(0)})`); ax.setAttribute('opacity', k < .85 ? 1 : (1 - (k - .85) / .15).toFixed(2));
      if (k < 1) requestAnimationFrame(rise); else ax.remove(); };
    requestAnimationFrame(rise);
    const m = n + 1; store.set(KEY_AXE, m);
    bubble(TXT.broend.opfyldt, pos, 3000, true);
    setTimeout(() => {
      if (m === 1) bubble(TXT.broend.foerste, pos, 2600);
      else if (m >= AXE_MAX){ bubble(TXT.broend.udsolgt, pos, 2800, true); t.insertAdjacentHTML('beforeend', wellSoldSign()); }
      else bubble(TXT.broend.flere.replace('{n}', m), pos, 2400);
      wellBusy = false;
    }, 3100);
  };
}
const wellSoldSign = () => `<g transform="translate(0 -18) rotate(-6)"><rect x="-44" y="-12" width="88" height="24" rx="4" fill="#E0457A" stroke="#7A1A3A" stroke-width="2"/><text x="0" y="6" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="15" fill="#FFFFFF" letter-spacing="1">UDSOLGT</text></g>`;
/* en økse: skaft af træ og et blankt hoved; tegnet med skaftets midte i 0,0 */
const axeSvg = (k = 1) => `<g transform="scale(${k})"><path d="M 0 30 V -30" stroke="#8A5A3C" stroke-width="5" stroke-linecap="round"/><path d="M 0 30 V -30" stroke="#B5743A" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M 1 -30 C 12 -34 20 -28 22 -18 C 22 -10 18 -6 14 -6 C 10 -12 6 -16 1 -16 Z" fill="#C8C4D8" stroke="#3A3450" stroke-width="2" stroke-linejoin="round"/><path d="M 16 -26 C 20 -20 20 -14 17 -9" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".8"/><rect x="-3" y="-34" width="6" height="22" rx="2" fill="#6A6480" stroke="#3A3450" stroke-width="1.5"/></g>`;

function flyBird(t){
  if (t.classList.contains('away')) return;
  sfx.chirp(); t.classList.add('away');
  setTimeout(() => { t.classList.remove('away'); t.classList.add('back'); setTimeout(() => t.classList.remove('back'), 1600); }, 9000 + Math.random() * 8000);
}
function releaseBalloon(){
  const b = [...document.querySelectorAll('#balloons .balloon')].find(e => e.style.display !== 'none'); if (!b){ sfx.nope(); return; }
  sfx.pop(); b.style.display = 'none';
  const c = b.dataset.c, x = +b.dataset.x, y = +b.dataset.y;
  const fl = sv('g', { 'pointer-events':'none' }, `<ellipse rx="13" ry="16" fill="${c}"/><ellipse cx="-4" cy="-5" rx="3.5" ry="5" fill="#FFF" opacity=".5"/><path d="M 0 16 q 6 14 -3 28" stroke="#9C95B5" stroke-width="1.2" fill="none"/>`);
  $('#fx').append(fl); const t0 = performance.now();
  const up = now => { const k = (now - t0) / 1000, yy = y - k * 70; fl.setAttribute('transform', `translate(${(x + Math.sin(k * 1.6) * 18).toFixed(1)},${yy.toFixed(1)})`); if (yy > -60 && fl.isConnected) requestAnimationFrame(up); else fl.remove(); };
  requestAnimationFrame(up);
  setTimeout(() => { b.style.display = ''; }, 20000);
}
/* den gemte stjerne: et nyt skjulested hver dag, og den giver en stjerne når man finder den */
const STAR_SPOTS = [[92,560],[1012,560],[1530,600],[620,470],[1060,962],[470,700],[1500,770]];
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; };
function placeHiddenStar(){
  if (store.get(KEY_STAR, '') === todayKey()) return;
  const d = new Date(), [x, y] = STAR_SPOTS[(d.getDate() + d.getMonth() * 3) % STAR_SPOTS.length];
  $('#hiddenStars').innerHTML = `<g data-tap="star" data-x="${x}" data-y="${y}" transform="translate(${x},${y})"><g class="hstar"><circle r="12" fill="#FFF3B0" opacity=".35"><animate attributeName="opacity" values=".1;.6;.1" dur="2s" repeatCount="indefinite"/></circle><polygon points="${star5pts(0,0,8,3.5)}" fill="#FFE27A" stroke="#C99A12" stroke-width="1.5"/></g><circle r="20" fill="#FFF" fill-opacity="0" pointer-events="all"/></g>`;
}
function foundStar(t){
  if (t.dataset.found) return; t.dataset.found = '1';
  store.set(KEY_STAR, todayKey()); sfx.coin(); addStars(1); updateStarPills();
  t.querySelector('.hstar').classList.add('found'); setTimeout(() => t.remove(), 900);
  const x = +t.dataset.x, y = +t.dataset.y;
  bubble('Du fandt dagens gemte stjerne!', () => [x, y - 16], 2800, true);
}

/* ---------- løkken ---------- */
function lifeTick(now){
  if (!LIFE.on || $('#town').hidden){ LIFE.on = false; LIFE.peds.forEach(p => clearTimeout(p.wait)); return; }
  const dt = Math.min(50, now - LIFE.last); LIFE.last = now;
  for (const c of LIFE.chars) if (c !== LIFE.pet && !c.isDog) tickChar(c, dt, now);
  heroPetFollow(); if (LIFE.pet) placeChar(LIFE.pet);
  for (const p of LIFE.peds) if (p.dog){ tickDog(p); const d = p.dog; if (d.bob){ const t = (now + d.t0) / 1000; d.cb.setAttribute('transform', d.bobStop ? '' : `translate(0,${(-Math.abs(Math.sin(t * 9)) * 3).toFixed(1)})`); } placeChar(d); }
  camFollow(now, dt);
  sortChars();
  for (const b of LIFE.bubbles.slice()){ if (now > b.until){ b.g.remove(); LIFE.bubbles.splice(LIFE.bubbles.indexOf(b), 1); } else b.place(); }
  const want = CM.night ? 1 : 3;
  if (!calm && LIFE.peds.length < want && now > LIFE.nextPed){ LIFE.nextPed = now + 4000 + Math.random() * 6000; spawnPed(); }
  requestAnimationFrame(lifeTick);
}

/* ================= Kameraet =================
   På små skærme (telefoner) er kortet zoomet ind, så tingene er til at se og ramme. Man trækker kortet med fingeren,
   og når Agnes går, glider kortet med hende. På store skærme ses hele kortet som før. */
const CAM = { on: false, cx: 800, cy: 560, vw: CW, vh: CH, drag: null, moved: false, userAt: 0 };
const CAM_PX = 0.62, CAM_X = [-160, 1760], CAM_Y = [-120, CH];   /* lidt himmel over kortet, så bobler ikke havner under logoet */
function camFit(){
  const st = $('#street'), svg = $('#townSvg'); if (!st || !svg) return;
  const W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
  const vh = Math.min(CH, H / CAM_PX);
  CAM.on = !window.NO_CAM && vh < CH * .95;
  if (!CAM.on){ CAM.vw = CW; CAM.vh = CH; svg.setAttribute('viewBox', `0 0 ${CW} ${CH}`); return; }
  CAM.vh = vh; CAM.vw = Math.min(CAM_X[1] - CAM_X[0], vh * W / H);
  camApply();
}
function camApply(){
  const hw = CAM.vw / 2, hh = CAM.vh / 2, svg = $('#townSvg'); if (!svg) return;
  CAM.cx = Math.max(CAM_X[0] + hw, Math.min(CAM_X[1] - hw, CAM.cx));
  CAM.cy = Math.max(CAM_Y[0] + hh, Math.min(CAM_Y[1] - hh, CAM.cy));
  svg.setAttribute('viewBox', `${(CAM.cx - hw).toFixed(1)} ${(CAM.cy - hh).toFixed(1)} ${CAM.vw.toFixed(1)} ${CAM.vh.toFixed(1)}`);
}
const camView = () => CAM.on ? [CAM.cx - CAM.vw / 2, CAM.cx + CAM.vw / 2, CAM.cy - CAM.vh / 2] : [0, CW, 0];
function camFollow(now, dt){
  if (!CAM.on || CAM.drag || !walking || now - CAM.userAt < 1800 || !LIFE.hero) return;
  const k = Math.min(1, dt * 0.004), tx = LIFE.hero.x, ty = LIFE.hero.y - (LIFE.hero.y < 600 ? 150 : 80);
  CAM.cx += (tx - CAM.cx) * k; CAM.cy += (ty - CAM.cy) * k; camApply();
}
function camWire(st){
  st.addEventListener('pointerdown', e => { if (!CAM.on) return; CAM.drag = { x: e.clientX, y: e.clientY, cx: CAM.cx, cy: CAM.cy, id: e.pointerId }; CAM.moved = false; });
  st.addEventListener('pointermove', e => { const d = CAM.drag; if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!CAM.moved && Math.hypot(dx, dy) < 9) return;
    CAM.moved = true; const k = CAM.vh / st.clientHeight;
    CAM.cx = d.cx - dx * k; CAM.cy = d.cy - dy * k; CAM.userAt = performance.now(); camApply(); });
  const end = e => { if (CAM.drag && e.pointerId === CAM.drag.id) CAM.drag = null; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  /* et træk er ikke et tryk: klikket bagefter går ikke videre til huse og dyr */
  st.addEventListener('click', e => { if (CAM.moved){ e.stopPropagation(); e.preventDefault(); CAM.moved = false; } }, true);
}
window.addEventListener('resize', () => { if ($('#town') && !$('#town').hidden) camFit(); });

/* små dyr og ting får et usynligt, større trykfelt, så de er til at ramme med en finger */
function growTaps(svg){
  svg.querySelectorAll('[data-tap]').forEach(t => {
    if (t.dataset.tap === 'star' || t.querySelector(':scope > .tapzone')) return;
    let bb; try { bb = t.getBBox(); } catch(e){ return; }
    const sm = svg.getScreenCTM(), tm = t.getScreenCTM(), m = sm && tm ? sm.inverse().multiply(tm) : null;
    const sc = m ? Math.hypot(m.a, m.b) : 1, min = 70 / (sc || 1);   /* mindst 70 kortenheder bredt og højt */
    const w = Math.max(bb.width, min), h = Math.max(bb.height, min);
    const r = sv('rect', { class: 'tapzone', x: (bb.x + bb.width / 2 - w / 2).toFixed(1), y: (bb.y + bb.height / 2 - h / 2).toFixed(1), width: w.toFixed(1), height: h.toFixed(1), fill: '#FFF', 'fill-opacity': 0 });
    t.insertBefore(r, t.firstChild);
  });
}

/* ================= Skærmen ================= */
function showTown(){
  showScreen('#town'); playMusic('byen');
  LIFE.peds.forEach(p => clearTimeout(p.wait));
  Object.assign(LIFE, { chars: [], bubbles: [], peds: [], nextPed: performance.now() + 1500, gen: LIFE.gen + 1 });
  walking = false;
  const box = $('#townBody'); box.innerHTML = '';
  box.append(el('div', { class:'map', id:'street', html: Kort.svg({ game: true }) }),
    el('div', { class:'place-ui tl' }, [ el('h1', { class:'town-logo', id:'townLogo' }, GAME_NAME) ]), el('div', { class:'place-ui tr' }, [ starPill(), audioBtns() ]));
  $('#street').style.background = SKY[CM.time][0];
  const hero = heroState(), hasPet = hero.pet.kind !== 'ingen';
  SPR = { idle: svgUrl(renderDoll(hero, { viewBox: VB_DOLL, anim: !calm, idle: true, pet: false })),
          walk: svgUrl(renderDoll(hero, { viewBox: VB_DOLL, anim: !calm, walk: true, pet: false })),
          sit: hasPet ? svgUrl(renderDoll(hero, { petOnly: true, viewBox: VB_PET, anim: !calm })) : '',
          pwalk: hasPet ? svgUrl(renderDoll(hero, { petOnly: true, petMode: 'walk', viewBox: VB_PET, anim: !calm })) : '' };
  const [hx, hy] = endOf(heroAt);
  CAM.cx = hx; CAM.cy = hy - 80; CAM.drag = null; CAM.moved = false; CAM.userAt = 0;
  LIFE.hero = makeChar('doll', SPR.idle, { x: hx, y: hy });
  LIFE.pet = hasPet ? makeChar('pet', SPR.sit, { x: hx + 50, y: hy + 6, face: PET_FACE[hero.pet.kind] || 1 }) : null;
  if (LIFE.pet) LIFE.pet.dir = 1;
  sortChars();
  // en af hendes andre dukker kigger ud ad vinduet i Mit hus
  const sorted = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0));
  if (!$('#homeDoll')){} else if (sorted[1]) $('#homeDoll').setAttribute('href', svgUrl(renderDoll(enforce(fixState(clone(sorted[1].st))), { viewBox:'170 60 460 520', anim: !calm, idle: true, pet: false })));
  else $('#homeDoll').remove();
  placeHiddenStar();
  $('#townLogo').addEventListener('click', logoTap);
  const svg = $('#townSvg');
  camWire($('#street')); camFit(); growTaps(svg);
  svg.addEventListener('click', e => { const t = e.target.closest('[data-tap]'); if (t){ tapThing(t); return; } const g = e.target.closest('.place'); if (g) visit(g.dataset.place); });
  svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.place')){ e.preventDefault(); visit(e.target.closest('.place').dataset.place); } });
  updateAudioBtns();
  if (!LIFE.on){ LIFE.on = true; LIFE.last = performance.now(); requestAnimationFrame(lifeTick); }
  // udstillingsdukker, isælgeren og børnene laves som billeder bagefter, så byen vises med det samme
  const fill = async (id, st, vb, w, h) => { if (!$('#' + id)) return; const u = await raster(renderDoll(st, { viewBox: vb, pet: false }), w, h); const e = $('#' + id); if (e && u) e.setAttribute('href', u); };
  fill('vendor', randomState({}), VB_DOLL, 144, 200);
  fill('swingKid', randomState({}), VB_DOLL, 108, 152);
  fill('kiteKid', randomState({}), VB_DOLL, 124, 176);
}
