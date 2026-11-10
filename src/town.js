/* ================= Titelskærm, byen, tæppet og musikken ================= */
const KEY_MUSIC = 'glimmerstudiet.musik';

/* ---------- musik: en lille melodi lavet af lyd-oscillatorer ---------- */
const MUSIC = { on: store.get(KEY_MUSIC, true), track: null, timer: null, step: 0, nextT: 0, out: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const TRACKS = {
  byen: { bpm: 100, chords: [[60,64,67,72],[57,60,64,69],[53,57,60,65],[55,59,62,67]], melody: [76,null,74,72,74,null,76,79, 72,null,71,69,71,null,72,76, 69,null,67,65,67,69,72,null, 71,null,72,74,71,null,67,null] },
  show: { bpm: 124, chords: [[62,65,69,74],[58,62,65,70],[60,64,67,72],[57,61,64,69]], melody: [74,74,null,77,null,76,74,72, 70,null,74,null,72,70,69,null, 72,72,null,76,null,74,72,71, 69,null,73,null,76,null,73,null] },
};
function audioCtx(){ try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch(e){} return AC; }
function mNote(freq, t, dur, type, vol){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(MUSIC.out); o.start(t); o.stop(t + dur + 0.05);
}
function musicTick(){
  if (!AC || !MUSIC.track) return;
  const tr = TRACKS[MUSIC.track], eighth = 60 / tr.bpm / 2;
  while (MUSIC.nextT < AC.currentTime + 0.15){
    const st = MUSIC.step, bar = Math.floor(st / 8) % 4, pos = st % 8, ch = tr.chords[bar], t = MUSIC.nextT;
    if (pos % 4 === 0) mNote(mtof(ch[0] - 24), t, eighth * 3.2, 'triangle', 0.09);
    mNote(mtof(ch[[0,1,2,3,2,1,2,3][pos]]), t, eighth * 0.9, 'square', 0.018);
    const m = tr.melody[st % 32]; if (m) mNote(mtof(m), t, eighth * 1.6, 'triangle', 0.05);
    MUSIC.step++; MUSIC.nextT += eighth;
  }
}
function playMusic(name){
  if (MUSIC.track === name && MUSIC.timer) return;
  stopMusic(); MUSIC.track = name;
  if (!MUSIC.on || !audioCtx()) return;
  MUSIC.out = AC.createGain(); MUSIC.out.gain.value = 0.55; MUSIC.out.connect(AC.destination);
  MUSIC.step = 0; MUSIC.nextT = AC.currentTime + 0.1;
  MUSIC.timer = setInterval(musicTick, 30);
}
function stopMusic(){ clearInterval(MUSIC.timer); MUSIC.timer = null; if (MUSIC.out){ try { MUSIC.out.gain.setTargetAtTime(0, AC.currentTime, 0.08); } catch(e){} MUSIC.out = null; } }
function setMusic(on){ MUSIC.on = on; store.set(KEY_MUSIC, on); const t = MUSIC.track; if (!on) stopMusic(); else if (t){ MUSIC.track = null; playMusic(t); } updateAudioBtns(); }
function setSound(on){ soundOn = on; store.set(KEY_SOUND, on); updateAudioBtns(); }
const NOTE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
const SPEAK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
function audioBtns(){
  return el('div', { class:'audio-btns' }, [
    el('button', { class:'iconbtn music', type:'button', 'aria-label':'Musik', html: NOTE_ICON, on:{ click: () => { audioCtx(); setMusic(!MUSIC.on); } } }),
    el('button', { class:'iconbtn sound', type:'button', 'aria-label':'Lydeffekter', html: SPEAK_ICON, on:{ click: () => { setSound(!soundOn); sfx.pick(); } } }) ]);
}
function updateAudioBtns(){
  document.querySelectorAll('.iconbtn.music').forEach(b => { b.classList.toggle('off', !MUSIC.on); b.setAttribute('aria-pressed', String(MUSIC.on)); });
  document.querySelectorAll('.iconbtn.sound').forEach(b => { b.classList.toggle('off', !soundOn); b.setAttribute('aria-pressed', String(soundOn)); });
}

/* ---------- tæppet mellem skærmene ---------- */
let curtainBusy = false;
async function goTo(fn){
  if (curtainBusy) return; curtainBusy = true;
  const c = $('#curtain');
  if (calm){ fn(); curtainBusy = false; return; }
  c.hidden = false; void c.offsetWidth; c.classList.add('closed'); sfx.whoosh();
  await wait(420); fn(); await wait(160);
  c.classList.remove('closed'); await wait(420); c.hidden = true; curtainBusy = false;
}

/* ---------- hvem står på scenen og går i byen ---------- */
function heroState(){
  if (!figures.length) return enforce(clone(DEFAULT_STATE));
  return enforce(fixState(clone(figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].st)));
}

/* ---------- titelskærm ---------- */
function showTitle(){
  showScreen('#title');
  const box = $('#titleBody'); box.innerHTML = '';
  const letters = 'Glimmer Studio'.split('').map((ch, i) => `<span style="animation-delay:${0.05*i}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  box.append(
    el('div', { class:'title-top' }, [ audioBtns() ]),
    el('h1', { class:'title-logo', id:'titleLogo', html: letters }),
    el('div', { class:'title-stage' }, [ el('div', { class:'spot', 'aria-hidden':'true' }), dollImg(heroState(), { viewBox:'40 60 720 1010', anim: !calm, idle: true, alt:'Din dukke' }), el('div', { class:'disc', 'aria-hidden':'true' }) ]),
    el('button', { class:'playbtn', type:'button', 'aria-label':'Spil', html:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 38 26 L 76 50 L 38 74 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/></svg>', on:{ click: () => { audioCtx(); sfx.magic(); playMusic('byen'); goTo(showTown); } } }),
    el('p', { class:'ver' }, 'Glimmer Studio ' + VERSION),
  );
  $('#titleLogo').addEventListener('click', logoTap);
  updateAudioBtns();
}

/* ---------- byen ---------- */
const PLACES = [
  { id:'hus', name:'Mit hus', x:180, open: () => showHome() },
  { id:'mode', name:'Modehuset', x:500, open: () => startFashion() },
  { id:'kugler', name:'Kuglebutikken', x:810, open: () => showBalls() },
  { id:'cafe', name:'Caféen', x:1110, soon:true },
  { id:'dyr', name:'Dyreparken', x:1400, soon:true },
  { id:'foto', name:'Fotostudiet', x:1690, soon:true },
];
let walkerX = 180, petX = 280, walking = false, SPR = null;
const sign = (x, y, w, text, fill='#FFFFFF', col='#33204F', size=26) => `<g><rect x="${x - w/2}" y="${y - 22}" width="${w}" height="44" rx="22" fill="${fill}" stroke="#33204F" stroke-opacity=".15" stroke-width="3"/><text x="${x}" y="${y + 9}" text-anchor="middle" font-family="Fredoka, 'Baloo 2', sans-serif" font-weight="700" font-size="${size}" fill="${col}">${text}</text></g>`;
const soonSign = (x, y) => `<g transform="translate(${x},${y}) rotate(-8)"><rect x="-92" y="-24" width="184" height="48" rx="10" fill="#FFE27A" stroke="#C99A12" stroke-width="4"/><path d="M -92 -24 L -70 -24 L -92 -2 Z M 92 24 L 70 24 L 92 2 Z" fill="#33204F" opacity=".8"/><text x="0" y="9" text-anchor="middle" font-family="Fredoka, 'Baloo 2', sans-serif" font-weight="700" font-size="24" fill="#33204F">Kommer snart</text></g>`;
const scaffold = (x0, x1, y0, y1) => { let s = `<g stroke="#B98A4E" stroke-width="7" stroke-linecap="round" opacity=".85">`; for (let x = x0; x <= x1; x += (x1-x0)/3) s += `<path d="M ${x} ${y0} L ${x} ${y1}"/>`; for (let y = y0 + 40; y < y1; y += 90) s += `<path d="M ${x0-10} ${y} L ${x1+10} ${y}"/>`; s += `<path d="M ${x0} ${y0+40} L ${x1} ${y0+130} M ${x1} ${y0+130} L ${x0} ${y0+220}" stroke-width="5"/></g>`; return s; };
function townSvg(){
  const G = 590; // fortovets kant
  let s = `<svg id="townSvg" viewBox="0 0 1880 760" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Byen">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDE4FF"/><stop offset="1" stop-color="#FFE3F1"/></linearGradient>
<linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFC6E6"/><stop offset="1" stop-color="#B7AED3"/></linearGradient></defs>
<rect width="1880" height="760" fill="url(#sky)"/>
<circle cx="1660" cy="110" r="58" fill="#FFF3B0"/><circle cx="1660" cy="110" r="80" fill="#FFF3B0" opacity=".35"/>
${[[160,120,1],[620,80,1.3],[1100,140,.9],[1450,70,1.1]].map(([x,y,k])=>`<g transform="translate(${x},${y}) scale(${k})" opacity=".95"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#FFFFFF"/><ellipse cx="40" cy="-14" rx="44" ry="30" fill="#FFFFFF"/><ellipse cx="-36" cy="-8" rx="36" ry="24" fill="#FFFFFF"/><animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;40 0;0 0" dur="${18+x/100}s" repeatCount="indefinite"/></g>`).join('')}
<path d="M 0 ${G-60} C 200 ${G-130}, 420 ${G-90}, 640 ${G-120} C 900 ${G-160}, 1100 ${G-80}, 1380 ${G-130} C 1600 ${G-170}, 1760 ${G-110}, 1880 ${G-120} L 1880 ${G} L 0 ${G} Z" fill="#C8F2DE"/>
<rect y="${G}" width="1880" height="56" fill="#F6EAFF"/><path d="M 0 ${G} L 1880 ${G}" stroke="#E3CFF2" stroke-width="4"/>
${Array.from({length:24},(_,i)=>`<path d="M ${i*80} ${G} L ${i*80} ${G+56}" stroke="#E9DAF7" stroke-width="3"/>`).join('')}
<rect y="${G+56}" width="1880" height="${760-G-56}" fill="url(#road)"/>${Array.from({length:16},(_,i)=>`<rect x="${i*120+20}" y="${G+108}" width="64" height="10" rx="5" fill="#FFFFFF" opacity=".75"/>`).join('')}`;
  // Mit hus
  s += `<g class="place" data-place="hus" tabindex="0" role="button" aria-label="Mit hus"><rect x="60" y="${G-260}" width="240" height="260" rx="10" fill="#FFC1DC" stroke="#E0457A" stroke-width="5"/>
<path d="M 40 ${G-250} L 180 ${G-380} L 320 ${G-250} Z" fill="#FF5FA8" stroke="#C2276B" stroke-width="5" stroke-linejoin="round"/><rect x="246" y="${G-370}" width="34" height="70" fill="#E0457A" stroke="#C2276B" stroke-width="4"/>
<path transform="translate(180,${G-300}) scale(2.6)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="#FFFFFF" stroke="#E0457A" stroke-width="1.5"/>
<rect x="90" y="${G-210}" width="62" height="62" rx="12" fill="#BDE4FF" stroke="#E0457A" stroke-width="5"/><rect x="208" y="${G-210}" width="62" height="62" rx="12" fill="#BDE4FF" stroke="#E0457A" stroke-width="5"/>
<path d="M 145 ${G} L 145 ${G-100} Q 180 ${G-140} 215 ${G-100} L 215 ${G} Z" fill="#B657F0" stroke="#7B2FB0" stroke-width="5"/><circle cx="202" cy="${G-50}" r="6" fill="#FFE27A"/>
${[70,100,260,290].map(x=>`<circle cx="${x}" cy="${G-12}" r="14" fill="#9BE36A"/><circle cx="${x}" cy="${G-22}" r="8" fill="#FF8FC7"/>`).join('')}
${sign(180, G-420, 170, 'Mit hus')}</g>`;
  // Modehuset
  s += `<g class="place" data-place="mode" tabindex="0" role="button" aria-label="Modehuset"><rect x="360" y="${G-420}" width="280" height="420" rx="14" fill="#8A5BE8" stroke="#5B34B8" stroke-width="5"/>
<path d="M 360 ${G-370} Q 500 ${G-500} 640 ${G-370}" fill="#B79BFF" stroke="#5B34B8" stroke-width="5"/>
${Array.from({length:11},(_,i)=>{ const t=i/10, x=360+280*t, y=(G-370)-130*4*t*(1-t)*0.98; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="8" fill="#FFF3B0"><animate attributeName="opacity" values="1;.3;1" dur="1.2s" begin="${(i%3)*0.4}s" repeatCount="indefinite"/></circle>`; }).join('')}
<g transform="translate(500,${G-470})"><polygon points="${star5pts(0,0,30,13)}" fill="#FFE27A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite"/></polygon></g>
<rect x="390" y="${G-330}" width="220" height="56" rx="12" fill="#FF3D8F" stroke="#B32268" stroke-width="4"/><text x="500" y="${G-292}" text-anchor="middle" font-family="Fredoka, 'Baloo 2', sans-serif" font-weight="700" font-size="34" fill="#FFFFFF">MODE</text>
${[0,1].map(r=>[0,1,2].map(c=>`<rect x="${392+c*76}" y="${G-250+r*80}" width="56" height="56" rx="10" fill="#FFD9EA" stroke="#5B34B8" stroke-width="4"/>`).join('')).join('')}
<path d="M 455 ${G} L 455 ${G-80} L 545 ${G-80} L 545 ${G} Z" fill="#33204F"/><path d="M 470 ${G} L 440 ${G+56} L 560 ${G+56} L 530 ${G} Z" fill="#E0233F"/>
${sign(500, G-530, 210, 'Modehuset', '#FFFFFF', '#B32268')}</g>`;
  // Kuglebutikken
  s += `<g class="place" data-place="kugler" tabindex="0" role="button" aria-label="Kuglebutikken"><rect x="680" y="${G-250}" width="260" height="250" rx="12" fill="#62E0CB" stroke="#1F8E80" stroke-width="5"/>
<path d="M 670 ${G-250} L 950 ${G-250} L 930 ${G-200} L 690 ${G-200} Z" fill="#FFFFFF" stroke="#1F8E80" stroke-width="4"/>${[0,1,2,3,4,5].map(i=>`<path d="M ${700+i*40} ${G-250} L ${714+i*40} ${G-200} L ${730+i*40} ${G-200} L ${716+i*40} ${G-250} Z" fill="#FF5FA8"/>`).join('')}
<circle cx="810" cy="${G-350}" r="86" fill="#E9FFFB" fill-opacity=".85" stroke="#1F8E80" stroke-width="5"/>
${[[-40,-20,'#FF5FA8'],[0,-44,'#FFE27A'],[38,-18,'#7B5CFF'],[-20,18,'#6FA8FF'],[24,24,'#FF9A4D'],[-54,22,'#43D3BE'],[52,16,'#FF3D8F'],[4,-4,'#B79BFF'],[-8,50,'#9BE36A'],[34,52,'#FFC02E']].map(([dx,dy,c])=>`<circle cx="${810+dx}" cy="${G-350+dy}" r="21" fill="${c}" stroke="#33204F" stroke-opacity=".2" stroke-width="2"/>`).join('')}
<path d="M 760 ${G-270} L 860 ${G-270} L 850 ${G-250} L 770 ${G-250} Z" fill="#E0233F" stroke="#9C1530" stroke-width="4"/>
<rect x="710" y="${G-180}" width="100" height="100" rx="14" fill="#E9FFFB" stroke="#1F8E80" stroke-width="5"/>${[[740,-150,'#FF5FA8'],[775,-130,'#7B5CFF'],[748,-112,'#FFE27A']].map(([x,y,c])=>`<circle cx="${x}" cy="${G+y}" r="14" fill="${c}"/>`).join('')}
<path d="M 840 ${G} L 840 ${G-150} L 910 ${G-150} L 910 ${G} Z" fill="#FFFFFF" stroke="#1F8E80" stroke-width="5"/><circle cx="895" cy="${G-75}" r="6" fill="#FF5FA8"/>
${sign(810, G-470, 250, 'Kuglebutikken', '#FFFFFF', '#1F8E80', 24)}</g>`;
  // Caféen (kommer snart)
  s += `<g class="place soon" data-place="cafe" tabindex="0" role="button" aria-label="Caféen, kommer snart"><rect x="990" y="${G-290}" width="240" height="290" rx="12" fill="#FFE27A" stroke="#C99A12" stroke-width="5"/>
<path d="M 980 ${G-200} L 1240 ${G-200} L 1220 ${G-150} L 1000 ${G-150} Z" fill="#FFFFFF" stroke="#C99A12" stroke-width="4"/>${[0,1,2,3,4,5].map(i=>`<path d="M ${1010+i*36} ${G-200} L ${1022+i*36} ${G-150} L ${1036+i*36} ${G-150} L ${1024+i*36} ${G-200} Z" fill="#FF8FC7"/>`).join('')}
<g transform="translate(1110,${G-330})"><path d="M -40 0 L 40 0 L 30 46 L -30 46 Z" fill="#FF9A4D" stroke="#B9650E" stroke-width="4"/><path d="M -46 0 C -50 -40, 50 -40, 46 0 Z" fill="#FFC1DC" stroke="#E0457A" stroke-width="4"/><circle cx="0" cy="-38" r="10" fill="#E0233F"/></g>
<rect x="1020" y="${G-130}" width="80" height="80" rx="12" fill="#BDE4FF" stroke="#C99A12" stroke-width="5"/><path d="M 1140 ${G} L 1140 ${G-120} L 1200 ${G-120} L 1200 ${G} Z" fill="#B9650E"/>
${scaffold(1000, 1220, G-300, G)}${soonSign(1110, G-150)}${sign(1110, G-420, 160, 'Caféen')}</g>`;
  // Dyreparken (kommer snart)
  s += `<g class="place soon" data-place="dyr" tabindex="0" role="button" aria-label="Dyreparken, kommer snart">
${[1280,1520].map(x=>`<circle cx="${x}" cy="${G-170}" r="70" fill="#3FA34D"/><circle cx="${x+30}" cy="${G-210}" r="50" fill="#5FC46A"/><rect x="${x-12}" y="${G-110}" width="24" height="110" fill="#8A5A35"/>`).join('')}
<path d="M 1300 ${G} L 1300 ${G-200} Q 1400 ${G-300} 1500 ${G-200} L 1500 ${G}" fill="none" stroke="#2E7D3A" stroke-width="18" stroke-linecap="round"/>
${Array.from({length:9},(_,i)=>`<rect x="${1262+i*30}" y="${G-80}" width="14" height="80" rx="6" fill="#FFFFFF" stroke="#9C95B5" stroke-width="2"/>`).join('')}
<g transform="translate(1400,${G-250})"><circle cx="0" cy="8" r="18" fill="#8A5A35"/>${[[-20,-14],[-7,-22],[7,-22],[20,-14]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#8A5A35"/>`).join('')}</g>
${soonSign(1400, G-130)}${sign(1400, G-350, 190, 'Dyreparken')}</g>`;
  // Fotostudiet (kommer snart)
  s += `<g class="place soon" data-place="foto" tabindex="0" role="button" aria-label="Fotostudiet, kommer snart"><rect x="1570" y="${G-310}" width="240" height="310" rx="12" fill="#6FA8FF" stroke="#2F6FE0" stroke-width="5"/>
<g transform="translate(1690,${G-230})"><rect x="-56" y="-34" width="112" height="76" rx="14" fill="#33204F"/><rect x="-24" y="-48" width="48" height="20" rx="6" fill="#33204F"/><circle cx="0" cy="4" r="26" fill="#BDE4FF" stroke="#FFFFFF" stroke-width="6"/><circle cx="36" cy="-20" r="6" fill="#FFE27A"/></g>
<rect x="1600" y="${G-150}" width="70" height="70" rx="12" fill="#E9F2FF" stroke="#2F6FE0" stroke-width="5"/><path d="M 1720 ${G} L 1720 ${G-130} L 1780 ${G-130} L 1780 ${G} Z" fill="#2F6FE0"/>
${scaffold(1580, 1800, G-320, G)}${soonSign(1690, G-120)}${sign(1690, G-350, 200, 'Fotostudiet')}</g>`;
  s += `<g id="petWalker" transform="translate(${petX},0)" pointer-events="none"><g id="petFlip"><image id="petImg" x="-90" y="${G-82}" width="180" height="202" preserveAspectRatio="xMidYMax meet"/></g></g>`;
  s += `<g id="walker" transform="translate(${walkerX},0)" pointer-events="none"><g id="walkerFlip"><image id="walkerImg" x="-120" y="${G-230}" width="240" height="320" preserveAspectRatio="xMidYMax meet"/></g></g></svg>`;
  return s;
}
function showTown(){
  showScreen('#town'); playMusic('byen');
  const box = $('#townBody'); box.innerHTML = '';
  box.append(el('div', { class:'town-head' }, [ el('h1', { class:'logo small', id:'townLogo' }, 'Glimmer Studio'), el('div', { class:'head-right' }, [ starPill(), audioBtns() ]) ]),
    el('div', { class:'street', id:'street', html: townSvg() }));
  const hero = heroState(), hasPet = hero.pet.kind !== 'ingen';
  SPR = { idle: svgUrl(renderDoll(hero, { viewBox:'40 60 720 1010', anim: !calm, idle: true, pet: false })),
          walk: svgUrl(renderDoll(hero, { viewBox:'40 60 720 1010', anim: !calm, walk: true, pet: false })),
          sit: hasPet ? svgUrl(renderDoll(hero, { petOnly: true, viewBox:'500 720 320 360', anim: !calm })) : '',
          pwalk: hasPet ? svgUrl(renderDoll(hero, { petOnly: true, petMode: 'walk', viewBox:'500 720 320 360', anim: !calm })) : '' };
  $('#walkerImg').setAttribute('href', SPR.idle);
  if (hasPet) $('#petImg').setAttribute('href', SPR.sit); else $('#petWalker').remove();
  petX = walkerX + 100; $('#petWalker') && $('#petWalker').setAttribute('transform', `translate(${petX},0)`);
  $('#townLogo').addEventListener('click', logoTap);
  const svg = $('#townSvg');
  svg.addEventListener('click', e => { const g = e.target.closest('.place'); if (g) visit(g.dataset.place); });
  svg.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.place')){ e.preventDefault(); visit(e.target.closest('.place').dataset.place); } });
  updateAudioBtns();
  const street = $('#street'); requestAnimationFrame(() => { const sc = street.scrollWidth / 1880; street.scrollLeft = Math.max(0, walkerX * sc - street.clientWidth / 2); });
}
function visit(id){
  const p = PLACES.find(x => x.id === id); if (!p || walking) return;
  if (p.soon){ sfx.nope(); toast(p.name + ' kommer snart!'); return; }
  sfx.pick(); walking = true;
  const from = walkerX, to = p.x, dist = Math.abs(to - from), dir = to >= from ? 1 : -1;
  const speed = 0.42, dur = calm ? 0 : Math.max(300, dist / speed), t0 = performance.now();
  const pet = $('#petWalker');
  if (dist > 4){ $('#walkerImg').setAttribute('href', SPR.walk); $('#walkerFlip').setAttribute('transform', dir < 0 ? 'scale(-1,1)' : ''); }
  if (pet && dist > 4){ $('#petImg').setAttribute('href', SPR.pwalk); $('#petFlip').setAttribute('transform', dir < 0 ? 'scale(-1,1)' : ''); }
  let last = t0;
  const step = now => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2;
    walkerX = from + (to - from) * e;
    $('#walker') && $('#walker').setAttribute('transform', `translate(${walkerX.toFixed(1)},0)`);
    if (pet){ const target = walkerX - dir * 95, dt = Math.min(50, now - last); petX += (target - petX) * Math.min(1, dt / 160); pet.setAttribute('transform', `translate(${petX.toFixed(1)},0)`); }
    last = now;
    if (k < 1 || (pet && Math.abs(petX - (walkerX - dir*95)) > 3 && now - t0 < dur + 600)) requestAnimationFrame(step);
    else { walking = false; sfx.open(); goTo(() => { p.open(); }); }
  };
  requestAnimationFrame(step);
}
