/* ================= Titelskærm, byen, tæppet og musikken ================= */
const KEY_MUSIC = 'glimmerstudiet.musik';

/* ---------- musik: en lille melodi lavet af lyd-oscillatorer ---------- */
const MUSIC = { on: store.get(KEY_MUSIC, true), track: null, timer: null, step: 0, nextT: 0, out: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const TRACKS = {
  byen: { bpm: 100, chords: [[60,64,67,72],[57,60,64,69],[53,57,60,65],[55,59,62,67]], melody: [76,null,74,72,74,null,76,79, 72,null,71,69,71,null,72,76, 69,null,67,65,67,69,72,null, 71,null,72,74,71,null,67,null] },
  kaelder: { bpm: 88, chords: [[57,60,64,69],[53,57,60,65],[50,53,57,62],[52,56,59,64]], melody: [69,null,72,71,69,null,64,null, 65,null,69,67,65,null,60,null, 62,null,65,64,62,null,57,null, 64,null,68,null,71,null,68,null] },
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
/* fuld skærm og liggende: browseren tillader det kun lige efter et tryk, så det bedes om ved hvert skift af sted */
function goFull(){
  try {
    if (document.fullscreenElement || matchMedia('(display-mode: fullscreen)').matches) return lockLand();
    const d = document.documentElement, rq = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!rq) return;
    const pr = rq.call(d, { navigationUI: 'hide' });
    if (pr && pr.then) pr.then(lockLand, () => {});
  } catch (e) {}
}
// på telefon/tablet og i den installerede app: hvert tryk prøver fuld skærm igen (fx hvis man har swipet ud af den)
document.addEventListener('click', () => { if (matchMedia('(pointer: coarse)').matches || matchMedia('(display-mode: standalone)').matches) goFull(); }, true);
function lockLand(){ try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) {} }
async function goTo(fn){
  goFull();
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

/* ---------- titelskærm: nattehimmel, måne og skolen på bakken ---------- */
function titleScene(){
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
<linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E0A35"/><stop offset=".45" stop-color="#2A1C78"/><stop offset=".8" stop-color="#6A3AA6"/><stop offset="1" stop-color="#B456B2"/></linearGradient>
<radialGradient id="tglow"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".55"/><stop offset=".4" stop-color="#FFE9A8" stop-opacity=".18"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
<radialGradient id="tfly"><stop offset="0" stop-color="#FFF6B0" stop-opacity=".9"/><stop offset=".35" stop-color="#E8FF8A" stop-opacity=".35"/><stop offset="1" stop-color="#E8FF8A" stop-opacity="0"/></radialGradient>
<radialGradient id="twin"><stop offset="0" stop-color="#FFD86B" stop-opacity=".7"/><stop offset="1" stop-color="#FFD86B" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="1000" fill="url(#tsky)"/>`;
  /* stjerner (faste pladser, så skærmen ser ens ud hver gang) */
  let seed = 7; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 90; i++){ const x = r()*1600, y = r()*620, s = 0.8 + r()*2.2, d = (2 + r()*3).toFixed(1);
    o += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#FFF6D8"><animate attributeName="opacity" values="1;.25;1" dur="${d}s" begin="${(r()*3).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }
  [[620,120,14],[1030,80,11],[1420,300,12],[880,260,9],[1240,160,10]].forEach(([x,y,s],i) => { o += `<g opacity=".95"><path d="M ${x} ${y-s} Q ${x} ${y} ${x+s} ${y} Q ${x} ${y} ${x} ${y+s} Q ${x} ${y} ${x-s} ${y} Q ${x} ${y} ${x} ${y-s} Z" fill="#FFF6D8"><animate attributeName="opacity" values="1;.3;1" dur="${2.4+i*0.5}s" repeatCount="indefinite"/></path></g>`; });
  /* månen øverst til venstre */
  o += `<circle cx="300" cy="230" r="300" fill="url(#tglow)"/><circle cx="300" cy="230" r="96" fill="#FFF3C4"/><circle cx="270" cy="200" r="16" fill="#F2DE9A" opacity=".7"/><circle cx="330" cy="260" r="22" fill="#F2DE9A" opacity=".6"/><circle cx="318" cy="186" r="9" fill="#F2DE9A" opacity=".7"/><circle cx="262" cy="270" r="8" fill="#F2DE9A" opacity=".6"/>`;
  /* fjerne bakker */
  o += `<path d="M 0 720 C 200 640 380 660 560 700 C 760 740 980 640 1200 660 C 1380 676 1500 640 1600 650 L 1600 1000 L 0 1000 Z" fill="#3B2786"/>`;
  /* skolen: tårne med spidse tage og tændte vinduer */
  const W = '#3F2E85', WS = '#30226B', ROOF = '#7A2F9C', RS = '#5C2178', E = '#21184F';
  const tower = (x, w, top, base, apex, flag) => {
    let t = `<rect x="${x}" y="${top}" width="${w}" height="${base-top}" fill="${W}" stroke="${E}" stroke-width="4"/><rect x="${x+w*0.62}" y="${top}" width="${w*0.38}" height="${base-top}" fill="${WS}"/>`;
    t += `<path d="M ${x-14} ${top+2} L ${x+w/2} ${apex} L ${x+w+14} ${top+2} Z" fill="${ROOF}" stroke="${E}" stroke-width="4" stroke-linejoin="round"/><path d="M ${x+w/2} ${apex} L ${x+w+14} ${top+2} L ${x+w/2+8} ${top+2} Z" fill="${RS}"/>`;
    if (flag) t += `<path d="M ${x+w/2} ${apex} V ${apex-40}" stroke="${E}" stroke-width="4"/><path d="M ${x+w/2} ${apex-40} q 22 4 36 -2 q -12 10 0 20 q -16 6 -36 0 Z" fill="#FF5FA8" stroke="${E}" stroke-width="3"><animateTransform attributeName="transform" type="skewY" values="0;-6;0" dur="2.4s" additive="sum" repeatCount="indefinite"/></path>`;
    return t;
  };
  const win = (x, y, w, h, d) => `<circle cx="${x+w/2}" cy="${y+h/2}" r="${h*1.3}" fill="url(#twin)"/><path d="M ${x} ${y+h} V ${y+w/2} A ${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2} V ${y+h} Z" fill="#FFD86B" stroke="${E}" stroke-width="3"><animate attributeName="fill" values="#FFD86B;#FFE9A0;#FFC94A;#FFD86B" dur="${d}s" repeatCount="indefinite"/></path>`;
  o += `<path d="M 60 800 C 160 700 300 650 420 650 C 560 650 680 720 760 800 Z" fill="#2C1F6E"/>`;
  o += tower(190, 64, 470, 790, 360, true) + tower(560, 60, 500, 790, 400, true) + tower(640, 40, 580, 790, 510, false);
  o += `<rect x="254" y="560" width="306" height="230" fill="${W}" stroke="${E}" stroke-width="4"/><rect x="460" y="560" width="100" height="230" fill="${WS}"/>`;
  o += Array.from({length: 8}, (_, i) => `<rect x="${256 + i*38}" y="540" width="22" height="22" fill="${i > 5 ? WS : W}" stroke="${E}" stroke-width="3"/>`).join('');
  o += tower(370, 72, 360, 560, 220, false) + `<path d="M 406 220 V 180" stroke="${E}" stroke-width="4"/>` + `<g transform="translate(406 168)"><polygon points="${star5pts(0,0,20,9)}" fill="#FFE27A" stroke="#C99A12" stroke-width="2.5"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="12s" repeatCount="indefinite"/></polygon></g>`;
  o += `<circle cx="406" cy="420" r="26" fill="#FFD86B" stroke="${E}" stroke-width="3"/><path d="M 406 394 V 446 M 380 420 H 432" stroke="${E}" stroke-width="3"/><circle cx="406" cy="420" r="60" fill="url(#twin)"/>`;
  o += win(206, 520, 30, 50, 3.1) + win(206, 640, 30, 50, 4.2) + win(575, 560, 28, 46, 3.6) + win(649, 620, 22, 38, 2.8) + win(290, 610, 32, 56, 3.3) + win(350, 610, 32, 56, 4.4) + win(470, 610, 32, 56, 3.9);
  o += `<path d="M 380 790 V 712 A 26 26 0 0 1 432 712 V 790 Z" fill="#5A2E1E" stroke="${E}" stroke-width="4"/><circle cx="422" cy="752" r="4" fill="#FFD86B"/><path d="M 360 790 L 452 790 L 470 820 L 342 820 Z" fill="#4A3A8F"/>`;
  /* en sværm af ildfluer der flyver rundt om slottet */
  for (let i = 0; i < 26; i++){
    const cx = 150 + r() * 620, cy = 360 + r() * 380, d = (5 + r() * 6).toFixed(1), rad = 18 + r() * 46, k = r() < .5 ? 1 : -1;
    const pts = Array.from({ length: 5 }, (_, j) => { const a = j / 5 * Math.PI * 2 * k; return `${(Math.cos(a) * rad * (0.6 + r() * 0.8)).toFixed(0)} ${(Math.sin(a) * rad * (0.4 + r() * 0.6)).toFixed(0)}`; });
    o += `<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)})"><g><animateMotion dur="${d}s" repeatCount="indefinite" path="M ${pts[0]} C ${pts[1]} ${pts[2]} ${pts[3]} S ${pts[4]} ${pts[0]} Z" begin="-${(r() * 6).toFixed(1)}s"/>`
      + `<circle r="20" fill="url(#tfly)"/><circle r="3.6" fill="#FFFBD0"><animate attributeName="opacity" values="1;.25;1;.6;1" dur="${(1.4 + r() * 1.6).toFixed(1)}s" repeatCount="indefinite"/></circle></g></g>`;
  }
  /* forgrunden: bakken figuren står på */
  o += `<path d="M 0 830 C 260 790 520 840 800 836 C 1080 832 1340 780 1600 820 L 1600 1000 L 0 1000 Z" fill="#241A5C"/><path d="M 0 830 C 260 790 520 840 800 836 C 1080 832 1340 780 1600 820" stroke="#4E3C9C" stroke-width="5" fill="none"/>`;
  o += [[110,880],[1480,870],[1180,900],[300,930]].map(([x,y]) => `<g fill="#3A2C80">${[[-14,-26],[0,-34],[14,-24]].map(([dx,dy]) => `<ellipse cx="${x+dx}" cy="${y+dy}" rx="7" ry="16" transform="rotate(${dx*1.6} ${x+dx} ${y+dy})"/>`).join('')}</g>`).join('');
  return o + '</svg>';
}
const RING_SVG = `<svg viewBox="0 0 400 80" aria-hidden="true"><ellipse cx="200" cy="40" rx="190" ry="32" fill="#FFE9A8" opacity=".18"/><ellipse cx="200" cy="40" rx="170" ry="26" fill="none" stroke="#FFE27A" stroke-width="4" opacity=".9"/><ellipse cx="200" cy="40" rx="140" ry="19" fill="none" stroke="#FFE27A" stroke-width="2" stroke-dasharray="3 9" opacity=".8"/>${[[40,40],[360,40],[200,14],[200,66],[90,22],[310,58],[90,58],[310,22]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#FFF6D0"/>`).join('')}</svg>`;
function showTitle(){
  showScreen('#title');
  const box = $('#titleBody'); box.innerHTML = '';
  const letters = GAME_NAME.split('').map((ch, i) => `<span style="animation-delay:${0.05*i}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  const bubbles = el('div', { class:'title-bubbles', 'aria-hidden':'true' }, Array.from({ length: 9 }, (_, i) => el('span', { style:`left:${8 + i*10.5}%;--s:${[46,28,64,36,22,54,30,40,26][i]}px;animation-delay:${-i*1.7}s;animation-duration:${11 + (i%4)*2.5}s` })));
  box.append(
    el('div', { class:'title-scene', html: titleScene() }),
    bubbles,
    el('div', { class:'shoot', 'aria-hidden':'true' }),
    el('div', { class:'title-top' }, [ audioBtns() ]),
    el('h1', { class:'title-logo', id:'titleLogo', html: letters }),
    el('div', { class:'title-stage' }, [ el('div', { class:'ring', html: RING_SVG }), dollImg(heroState(), { viewBox:'40 40 720 1010', anim: !calm, idle: true, alt:'Din figur' }) ]),
    el('button', { class:'playbtn', type:'button', 'aria-label':'Spil', html:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 37 26 L 75 50 L 37 74 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/></svg>', on:{ click: () => { audioCtx(); sfx.magic(); playMusic('byen'); goFull(); goTo(showTown); } } }),
    el('p', { class:'ver' }, GAME_NAME + ' ' + VERSION),
  );
  $('#titleLogo').addEventListener('click', logoTap);
  updateAudioBtns();
}

/* byen ligger i city.js */
