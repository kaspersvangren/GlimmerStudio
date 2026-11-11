/* ================= Garderoben: et omklædningsrum med klædeskab, spejl og portrætter af figurerne ================= */
let wardPage = 0;
const WARD_PER = 5;   /* portrætter pr. side; første ramme er altid "Ny figur" */
const FRAME_BG = ['#FFE3F0','#E6E0FF','#DDF3FF','#E2FAEF','#FFF3D6','#FFE6DC'];
const FRAMES = [[690,240],[860,240],[1030,240],[690,505],[860,505],[1030,505]];

function wardBleed(){
  const WALL = '#E7B7D2', W2 = '#F1CCE0', PAN = '#FFF1E6', F = '#C9956A', B = '#7A4E6A';
  let o = `<rect x="-1700" y="-700" width="5000" height="2400" fill="${WALL}"/>`;
  for (let x = -1700; x < 3300; x += 100) o += `<rect x="${x}" y="0" width="44" height="680" fill="${W2}"/>`;
  for (let x = -1678; x < 3300; x += 100) for (let y = 40; y < 660; y += 80) o += `<circle cx="${x + 50}" cy="${y + (x/100 % 2 ? 40 : 0)}" r="5" fill="#FFFFFF" opacity=".55"/>`;
  o += `<rect x="-1700" y="-700" width="5000" height="700" fill="${B}"/>` + Array.from({ length: 22 }, (_, i) => `<rect x="${-1700 + i*240}" y="-700" width="60" height="700" fill="${fdk(B,0.25)}"/>`).join('');
  o += `<rect x="-1700" y="-24" width="5000" height="34" fill="#F7E2EC"/><rect x="-1700" y="4" width="5000" height="6" fill="${B}" opacity=".35"/>`;
  o += `<rect x="-1700" y="0" width="5000" height="680" fill="url(#wallG)"/>`;
  o += `<defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SHC}" stop-opacity=".18"/><stop offset=".35" stop-color="${SHC}" stop-opacity="0"/><stop offset="1" stop-color="${SHC}" stop-opacity=".08"/></linearGradient></defs>`;
  o += `<rect x="-1700" y="660" width="5000" height="100" fill="${PAN}"/><rect x="-1700" y="660" width="5000" height="10" fill="#E6CDBE"/>` + Array.from({ length: 34 }, (_, i) => `<rect x="${-1680 + i*150}" y="682" width="126" height="60" rx="6" fill="none" stroke="#E6CDBE" stroke-width="4"/>`).join('');
  o += `<rect x="-1700" y="760" width="5000" height="1000" fill="${F}"/>`;
  for (let i = 0; i < 14; i++){ const y = 760 + i*i*4 + i*8; o += `<path d="M -1700 ${y} H 3300" stroke="${fdk(F,0.15)}" stroke-width="2" opacity=".5"/>`; }
  for (let i = -14; i <= 14; i++) o += `<path d="M ${800 + i*90} 760 L ${800 + i*330} 1500" stroke="${fdk(F,0.15)}" stroke-width="2" opacity=".3"/>`;
  o += `<rect x="-1700" y="752" width="5000" height="16" fill="#9C6B43"/>`;
  return o;
}
/* klædeskabet med åbne låger og tøj på bøjler */
function wardrobe(){
  const W = '#9A6440', WD = fdk(W, 0.2), IN = '#4A2E40';
  let o = `<ellipse cx="290" cy="905" rx="250" ry="22" fill="${SHC}" opacity=".18"/>`;
  o += `<path d="M 100 900 V 230 Q 290 120 480 230 V 900 Z" fill="${W}" ${RS(W,4)}/><path d="M 440 236 Q 462 214 480 230 V 900 H 440 Z" fill="${WD}" opacity=".5"/>`;
  o += `<g transform="translate(290 168)"><polygon points="${star5pts(0,0,26,11)}" fill="#F2C14E" stroke="#B98516" stroke-width="3"/></g>`;
  o += `<rect x="130" y="250" width="320" height="500" rx="10" fill="${IN}"/><rect x="130" y="250" width="320" height="40" fill="#2E1C2A" opacity=".5"/>`;
  o += `<rect x="140" y="282" width="300" height="9" rx="4" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`;
  const cols = ['#7B4FD0','#E0457A','#43A3D3','#5FD0B0','#FFC02E'];
  cols.forEach((c, i) => {
    const x = 175 + i * 58;
    let g = `<path d="M ${x} 286 q 0 -12 8 -12" stroke="#C9B6A6" stroke-width="3" fill="none"/><path d="M ${x-26} 312 L ${x} 296 L ${x+26} 312" stroke="#C9B6A6" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    const d = `M ${x-20} 304 L ${x+20} 304 L ${x+28} 340 L ${x+40} ${500 + (i%2)*30} Q ${x} ${514 + (i%2)*30} ${x-40} ${500 + (i%2)*30} L ${x-28} 340 Z`;
    g += `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, `<rect x="${x+8}" y="300" width="40" height="260" fill="${sd(c,0.3)}" opacity=".5"/>` + starP(x - 6, 400, 7, lt(c,0.55)) + starP(x + 10, 450, 6, lt(c,0.55)));
    g += `<path d="M ${x-12} 304 Q ${x} 318 ${x+12} 304" stroke="${rOut(c)}" stroke-width="3" fill="${lt(c,0.3)}"/>`;
    o += `<g class="swing" style="animation-delay:${i*0.06}s">${g}</g>`;
  });
  o += `<rect x="130" y="640" width="320" height="16" fill="${W}" ${RS(W,3)}/>`;
  [[180,'#7A4A2A'],[290,'#E0457A'],[395,'#5A3A6A']].forEach(([x, c]) => { o += [-14, 14].map(dx => `<path d="M ${x+dx-12} 640 V 600 Q ${x+dx-12} 590 ${x+dx} 590 Q ${x+dx+10} 590 ${x+dx+10} 600 V 626 Q ${x+dx+24} 628 ${x+dx+24} 640 Z" fill="${c}" ${RS(c,2.5)}/>`).join(''); });
  o += `<rect x="130" y="750" width="320" height="130" fill="${W}"/>` + [770, 826].map(y => `<rect x="146" y="${y}" width="288" height="46" rx="6" fill="${lt(W,0.1)}" ${RS(W,3)}/><circle cx="290" cy="${y+23}" r="7" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`).join('');
  /* lågerne står åbne ud mod siderne */
  o += `<path d="M 130 252 L 36 290 L 36 720 L 130 748 Z" fill="${lt(W,0.08)}" ${RS(W,4)}/><path d="M 56 320 L 112 300 L 112 700 L 56 690 Z" fill="none" stroke="${WD}" stroke-width="4"/><circle cx="50" cy="500" r="8" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`;
  o += `<path d="M 450 252 L 544 290 L 544 720 L 450 748 Z" fill="${lt(W,0.08)}" ${RS(W,4)}/><path d="M 468 300 L 524 320 L 524 690 L 468 700 Z" fill="#CFE6F2" stroke="${WD}" stroke-width="4"/><path d="M 480 340 L 500 330 M 480 380 L 512 362" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".8"/><circle cx="530" cy="500" r="8" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`;
  return o;
}
/* det store spejl med den nyeste figur */
function wardMirror(hero){
  const G = '#E9B949', GD = '#A87A1A';
  let o = `<ellipse cx="1340" cy="905" rx="150" ry="18" fill="${SHC}" opacity=".18"/><path d="M 1250 900 L 1300 640 M 1430 900 L 1380 640" stroke="${GD}" stroke-width="14" stroke-linecap="round"/><path d="M 1250 900 L 1300 640 M 1430 900 L 1380 640" stroke="${G}" stroke-width="8" stroke-linecap="round"/>`;
  o += `<ellipse cx="1340" cy="400" rx="150" ry="252" fill="${G}" stroke="${GD}" stroke-width="5"/><ellipse cx="1340" cy="400" rx="128" ry="230" fill="#DDEFFA"/>`;
  o += `<defs><linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4FBFF"/><stop offset="1" stop-color="#BFDDF0"/></linearGradient></defs>`;
  o += clipG('M 1340 170 A 128 230 0 1 1 1339.9 170 Z', `<rect x="1200" y="160" width="280" height="480" fill="url(#glassG)"/><g transform="translate(2680 0) scale(-1 1)"><g class="anim"><image href="${dollUrl(hero, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="1210" y="200" width="260" height="535"/></g></g>`
    + `<path d="M 1240 230 L 1300 190 M 1236 300 L 1330 220" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity=".6"/>`);
  o += [[1340,148],[1190,400],[1490,400],[1340,652]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${G}" stroke="${GD}" stroke-width="3"/>`).join('');
  o += `<g transform="translate(1340 130)"><polygon points="${star5pts(0,0,24,10)}" fill="#FFE27A" stroke="${GD}" stroke-width="3"/></g>`;
  return o;
}
/* et portræt i guldramme med navneskilt */
function portrait(i, f, cx, cy){
  const fw = 150, fh = 190, x = cx - fw/2, y = cy - fh/2, G = '#E9B949', GD = '#A87A1A';
  let o = `<g data-hit="${f ? 'fig:' + i : 'ny'}"><g class="anim">`;
  o += `<rect x="${x+6}" y="${y+10}" width="${fw}" height="${fh}" rx="14" fill="${SHC}" opacity=".18"/><rect x="${x}" y="${y}" width="${fw}" height="${fh}" rx="14" fill="${G}" stroke="${GD}" stroke-width="4"/>`;
  o += `<rect x="${x+12}" y="${y+12}" width="${fw-24}" height="${fh-24}" rx="8" fill="${f ? FRAME_BG[i % FRAME_BG.length] : '#FFF6FB'}" stroke="${GD}" stroke-width="2.5"/>`;
  if (f){
    const st = enforce(fixState(clone(f.st)));
    o += clipG(`M ${x+12} ${y+20} Q ${x+12} ${y+12} ${x+20} ${y+12} H ${x+fw-20} Q ${x+fw-12} ${y+12} ${x+fw-12} ${y+20} V ${y+fh-20} Q ${x+fw-12} ${y+fh-12} ${x+fw-20} ${y+fh-12} H ${x+20} Q ${x+12} ${y+fh-12} ${x+12} ${y+fh-20} Z`,
      `<image href="${dollUrl(st, { viewBox:'160 60 480 620', pet:false })}" x="${x+12}" y="${y+12}" width="${fw-24}" height="${fh-24}" preserveAspectRatio="xMidYMin slice"/>`);
  } else {
    o += `<path d="M ${cx} ${cy-34} V ${cy+26} M ${cx-30} ${cy-4} H ${cx+30}" stroke="#FF3D8F" stroke-width="12" stroke-linecap="round"/>` + star4(cx + 40, cy - 50, 10, '#FFC02E') + star4(cx - 42, cy + 40, 8, '#B79BFF');
  }
  o += [[x+6,y+6],[x+fw-6,y+6],[x+6,y+fh-6],[x+fw-6,y+fh-6]].map(([a,b]) => `<circle cx="${a}" cy="${b}" r="8" fill="#FFE27A" stroke="${GD}" stroke-width="2"/>`).join('');
  const name = f ? f.name : 'Ny figur', pw = Math.min(170, 30 + name.length * 11);
  o += `<rect x="${cx - pw/2}" y="${y+fh+8}" width="${pw}" height="32" rx="10" fill="#C99A3E" stroke="${GD}" stroke-width="3"/><text x="${cx}" y="${y+fh+30}" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="18" fill="#3A2340">${escT(name)}</text>`;
  o += `</g></g>`;
  if (f) o += `<g data-hit="del:${i}"><circle cx="${x+fw-4}" cy="${y+4}" r="17" fill="#FFFFFF" stroke="#E0457A" stroke-width="3"/><path d="M ${x+fw-11} ${y-3} l 14 14 M ${x+fw+3} ${y-3} l -14 14" stroke="#E0457A" stroke-width="4" stroke-linecap="round"/></g>`;
  return o;
}
function wardList(){ return figures.slice().sort((a,b)=>(b.t||0)-(a.t||0)); }
function wardScene(){
  CLIPN = 0;
  const list = wardList(), pages = Math.max(1, Math.ceil(list.length / WARD_PER));
  wardPage = Math.min(wardPage, pages - 1);
  const shown = list.slice(wardPage * WARD_PER, wardPage * WARD_PER + WARD_PER);
  let o = `<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet">`;
  o += wardBleed() + `<ellipse cx="860" cy="880" rx="300" ry="62" fill="#B79BFF" stroke="#8A6AE0" stroke-width="4"/><ellipse cx="860" cy="880" rx="250" ry="44" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="4 12"/>`;
  o += `<g data-hit="skab">${wardrobe()}</g>`;
  o += `<g data-hit="spejl">${wardMirror(heroState())}</g>`;
  o += portrait(-1, null, FRAMES[0][0], FRAMES[0][1]);
  shown.forEach((f, k) => { const idx = list.indexOf(f); o += portrait(idx, f, FRAMES[k+1][0], FRAMES[k+1][1]); });
  if (pages > 1){
    const arrow = (dir, cx) => `<g data-hit="pil:${dir}"><circle cx="${cx}" cy="372" r="30" fill="#FFFFFF" stroke="#7B5CFF" stroke-width="4"/><path d="M ${cx - dir*8} 356 L ${cx + dir*8} 372 L ${cx - dir*8} 388" stroke="#7B5CFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    if (wardPage > 0) o += arrow(-1, 600);
    if (wardPage < pages - 1) o += arrow(1, 1120);
    o += `<text x="860" y="672" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="18" fill="#7A4E6A">${wardPage + 1} / ${pages}</text>`;
  }
  o += `<g class="fx" pointer-events="none"></g></svg>`;
  return scopeIds(o, 'wd');
}
function showHome(){ cur = null; gameDress = null; showScreen('#home'); playMusic('byen'); renderHome(); }
function renderHome(){
  const box = $('#homeBody'); box.innerHTML = '';
  box.append(el('div', { class:'scene-wrap', id:'wardScene' }), ...placeUi([ backBtn('Værelset', showRoom) ], [ starPill() ]));
  const w = $('#wardScene'); w.innerHTML = wardScene();
  const svg = w.querySelector('svg');
  svg.addEventListener('click', e => { const g = e.target.closest('[data-hit]'); if (g) wardTap(g.dataset.hit, g, svgPoint(svg, e)); });
}
function wardTap(hit, g, p){
  const svg = $('#wardScene svg'), list = wardList();
  const [k, v] = hit.split(':');
  if (k === 'ny'){ sfx.magic(); replay(g, 'hop'); setTimeout(newFigure, 250); return; }
  if (k === 'fig'){ sfx.open(); replay(g, 'hop'); const f = list[+v]; setTimeout(() => openEditor(f), 250); return; }
  if (k === 'del'){ sfx.pick(); askDelete(list[+v]); return; }
  if (k === 'pil'){ sfx.pick(); wardPage += +v; renderHome(); return; }
  if (k === 'skab'){ sfx.whoosh(); svg.querySelectorAll('.swing').forEach(s => replay(s, 'swingit')); sparkle(svg, p.x, p.y, 6); return; }
  if (k === 'spejl'){ sfx.magic(); replay(g, 'hop'); sparkle(svg, 1340, 300, 8); return; }
}
function askDelete(f){
  showModal('Slet figuren?', `${f.name} forsvinder for altid.`, [
    { label:'Nej, behold den' },
    { label:'Ja, slet', hot:true, fn: () => { figures = figures.filter(x => x !== f); saveAll(); renderHome(); } } ]);
}
