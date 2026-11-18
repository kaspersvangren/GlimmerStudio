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
/* små trommer af støj og en faldende tone (bruges kun af melodier med 'slag') */
let NOISE = null;
function mDrum(k, t){
  if (!k || k === '.') return;
  if (k === 'k'){ const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g); g.connect(MUSIC.out); o.start(t); o.stop(t + 0.2); return; }
  if (!NOISE){ NOISE = AC.createBuffer(1, AC.sampleRate * 0.3, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const n = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), dur = k === 's' ? 0.12 : 0.035;
  n.buffer = NOISE; f.type = k === 's' ? 'bandpass' : 'highpass'; f.frequency.value = k === 's' ? 1800 : 7000;
  g.gain.setValueAtTime(k === 's' ? 0.07 : 0.025, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f); f.connect(g); g.connect(MUSIC.out); n.start(t); n.stop(t + dur + 0.02);
}
function musicTick(){
  if (!AC || !MUSIC.track) return;
  const tr = TRACKS[MUSIC.track] || TRACKS[MUSIC_SYNTH[MUSIC.track]] || TRACKS.byen, eighth = 60 / tr.bpm / 2;
  /* er telefonen kommet bagud (travl skærm), springer melodien frem i stedet for at spille de forsinkede toner i klump */
  if (MUSIC.nextT < AC.currentTime - 0.05){ const miss = Math.ceil((AC.currentTime - MUSIC.nextT) / eighth); MUSIC.step += miss; MUSIC.nextT += miss * eighth; DBG.count('musikBagud'); }
  while (MUSIC.nextT < AC.currentTime + 0.6){
    const st = MUSIC.step, bar = Math.floor(st / 8) % 4, pos = st % 8, ch = tr.chords[bar], t = MUSIC.nextT;
    /* valgfrit pr. melodi: basM (bastoner pr. ottendedel, i halvtoner over grundtonen), arpM (akkordtone pr. ottendedel, 'c' = hele akkorden),
       bølgeformer basT/arpT/melT, og slag (trommer: k = stortromme, s = lilletromme, h = hi-hat) */
    const bm = tr.basM ? tr.basM[pos] : (pos % 4 === 0 ? 0 : null);
    if (bm != null) mNote(mtof(ch[0] - 24 + bm), t, eighth * (tr.basM ? 1.6 : 3.2), tr.basT || 'triangle', 0.09);
    const am = (tr.arpM || [0,1,2,3,2,1,2,3])[pos];
    if (am === 'c') ch.slice(1).forEach(n => mNote(mtof(n), t, eighth * 0.8, tr.arpT || 'square', 0.012));
    else if (am != null) mNote(mtof(ch[am]), t, eighth * 0.9, tr.arpT || 'square', 0.018);
    const m = tr.melody[st % 32]; if (m) mNote(mtof(m), t, eighth * 1.6, tr.melT || 'triangle', tr.melV || 0.05);
    if (tr.slag) mDrum(tr.slag[pos], t);
    MUSIC.step++; MUSIC.nextT += eighth;
  }
}
const MUSIC_SYNTH = { arkade: 'byen', gribe: 'byen', gnom: 'show', skjold: 'show', invader: 'show', kost: 'show', fald: 'show', tryl: 'show' };
function playMusic(name, opts){
  if (MUSIC.track === name && (MUSIC.timer || SND.musicPlaying())) return;
  if (opts && opts.over && MUSIC.on){   /* overtoning: lydfilen, der spiller, får lov at fortsætte, til den nye er klar */
    clearInterval(MUSIC.timer); MUSIC.timer = null;
    if (MUSIC.out){ try { MUSIC.out.gain.setTargetAtTime(0, AC.currentTime, opts.over / 3); } catch (e){} MUSIC.out = null; }
  } else stopMusic();
  MUSIC.track = name;
  if (!MUSIC.on) return;
  if (SND.music(name, opts)) return;            // egen musikfil (lyd/…) vinder over den indbyggede
  if (!audioCtx()) return;
  MUSIC.out = AC.createGain(); MUSIC.out.gain.value = 0.55; MUSIC.out.connect(AC.destination);
  MUSIC.step = 0; MUSIC.nextT = AC.currentTime + 0.1;
  MUSIC.timer = setInterval(musicTick, 120); musicTick();
  if (opts && opts.start) opts.start();
}
function stopMusic(){ SND.stopMusic(); clearInterval(MUSIC.timer); MUSIC.timer = null; if (MUSIC.out){ try { MUSIC.out.gain.setTargetAtTime(0, AC.currentTime, 0.08); } catch(e){} MUSIC.out = null; } }
function setMusic(on){ MUSIC.on = on; store.set(KEY_MUSIC, on); const t = MUSIC.track; if (!on) stopMusic(); else if (t){ MUSIC.track = null; playMusic(t); } SND.ambRefresh(); updateAudioBtns(); }
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

/* forpremiere: hold fingeren på versionsnummeret i 2 sekunder, så kan steder, der ikke er færdige endnu åbnes (sæt forp:true på stedet i PLACES) */
let forpT = 0;
function forpTryk(){ clearTimeout(forpT); forpT = setTimeout(() => { const on = !store.get(KEY_FORP, false); store.set(KEY_FORP, on); sfx.twinkle(); toast(on ? 'Forpremiere slået til: steder, der ikke er færdige, kan åbnes' : 'Forpremiere slået fra'); }, 2000); }
function forpSlip(){ clearTimeout(forpT); }

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
/* ---------- forsidens scene ----------
   Før var hele scenen én SVG med 36 SVG-animationer og 116 blinkende stjerner. Så skulle browseren male hele scenen
   forfra i hvert eneste billede (forsiden kørte med ca. 20 billeder i sekundet på tabletten og 34 på telefonen).
   Nu er den delt i lag: himlen og resten af scenen er stillestående billeder, der males én gang, og alt det, der
   bevæger sig (stjernerne i små klynger, ildfluerne, vinduernes flimren, flagene og stjernen på tårnet), er små
   HTML-lag oven på, som grafikchippen selv flytter og toner. Udseendet er det samme. */
const TS_SVG = (vb, w, h, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" ${extra} aria-hidden="true">${body}</svg>`;
function titleScene(){
  const SL = 'viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice"';
  const defs = `<defs>
<linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E0A35"/><stop offset=".45" stop-color="#2A1C78"/><stop offset=".8" stop-color="#6A3AA6"/><stop offset="1" stop-color="#B456B2"/></linearGradient>
<radialGradient id="tglow"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".55"/><stop offset=".4" stop-color="#FFE9A8" stop-opacity=".18"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
<radialGradient id="twin"><stop offset="0" stop-color="#FFD86B" stop-opacity=".7"/><stop offset="1" stop-color="#FFD86B" stop-opacity="0"/></radialGradient></defs>`;
  const fx = [];      /* små lag: [x, y, w, h, svg-indhold, animationer] i scenens koordinater */
  /* stjerner (faste pladser, så skærmen ser ens ud hver gang). De samles i klynger efter, hvor de står på himlen,
     og hver klynge blinker for sig (ét lag pr. klynge i stedet for 90 animationer i SVG'en) */
  let seed = 7; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const cells = new Map();
  for (let i = 0; i < 90; i++){ const x = r()*1600, y = r()*620, s = 0.8 + r()*2.2, d = 2 + r()*3, beg = r()*3;
    const k = Math.floor(x / 200) + ':' + Math.floor(y / 155); let c = cells.get(k); if (!c){ c = { st: [], d, beg }; cells.set(k, c); } c.st.push([x, y, s]); }
  for (const c of cells.values()){ const pad = 4, x0 = Math.floor(Math.min(...c.st.map(q => q[0] - q[2])) - pad), y0 = Math.floor(Math.min(...c.st.map(q => q[1] - q[2])) - pad),
      x1 = Math.ceil(Math.max(...c.st.map(q => q[0] + q[2])) + pad), y1 = Math.ceil(Math.max(...c.st.map(q => q[1] + q[2])) + pad);
    fx.push({ lag: 'bag', x: x0, y: y0, w: x1 - x0, h: y1 - y0, body: c.st.map(([x, y, s]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#FFF6D8"/>`).join(''),
      anim: [[[{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }], { duration: c.d * 1000, delay: c.beg * 1000, iterations: Infinity }]] }); }
  [[620,120,14],[1030,80,11],[1420,300,12],[880,260,9],[1240,160,10]].forEach(([x,y,s],i) => {
    fx.push({ lag: 'bag', x: x - s - 2, y: y - s - 2, w: 2 * s + 4, h: 2 * s + 4, op: .95, body: `<path d="M ${x} ${y-s} Q ${x} ${y} ${x+s} ${y} Q ${x} ${y} ${x} ${y+s} Q ${x} ${y} ${x-s} ${y} Q ${x} ${y} ${x} ${y-s} Z" fill="#FFF6D8"/>`,
      anim: [[[{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: (2.4 + i * 0.5) * 1000, iterations: Infinity }]] }); });
  let o = '';
  /* månen øverst til venstre */
  o += `<circle cx="300" cy="230" r="300" fill="url(#tglow)"/><circle cx="300" cy="230" r="96" fill="#FFF3C4"/><circle cx="270" cy="200" r="16" fill="#F2DE9A" opacity=".7"/><circle cx="330" cy="260" r="22" fill="#F2DE9A" opacity=".6"/><circle cx="318" cy="186" r="9" fill="#F2DE9A" opacity=".7"/><circle cx="262" cy="270" r="8" fill="#F2DE9A" opacity=".6"/>`;
  /* fjerne bakker */
  o += `<path d="M 0 720 C 200 640 380 660 560 700 C 760 740 980 640 1200 660 C 1380 676 1500 640 1600 650 L 1600 1000 L 0 1000 Z" fill="#3B2786"/>`;
  /* skolen: tårne med spidse tage og tændte vinduer */
  const W = '#3F2E85', WS = '#30226B', ROOF = '#7A2F9C', RS = '#5C2178', E = '#21184F';
  const tower = (x, w, top, base, apex, flag) => {
    let t = `<rect x="${x}" y="${top}" width="${w}" height="${base-top}" fill="${W}" stroke="${E}" stroke-width="4"/><rect x="${x+w*0.62}" y="${top}" width="${w*0.38}" height="${base-top}" fill="${WS}"/>`;
    t += `<path d="M ${x-14} ${top+2} L ${x+w/2} ${apex} L ${x+w+14} ${top+2} Z" fill="${ROOF}" stroke="${E}" stroke-width="4" stroke-linejoin="round"/><path d="M ${x+w/2} ${apex} L ${x+w+14} ${top+2} L ${x+w/2+8} ${top+2} Z" fill="${RS}"/>`;
    if (flag){ t += `<path d="M ${x+w/2} ${apex} V ${apex-40}" stroke="${E}" stroke-width="4"/>`;
      /* flaget vifter: SVG'ens skævning sker om scenens hjørne (0,0); det gør lagets også */
      const fx0 = x + w/2 - 4, fy0 = apex - 52, fw = 46, fh = 42;
      fx.push({ lag: 'for', x: fx0, y: fy0, w: fw, h: fh, origin: [-fx0, -fy0], body: `<path d="M ${x+w/2} ${apex-40} q 22 4 36 -2 q -12 10 0 20 q -16 6 -36 0 Z" fill="#FF5FA8" stroke="${E}" stroke-width="3"/>`,
        anim: [[[{ transform: 'skewY(0deg)' }, { transform: 'skewY(-6deg)' }, { transform: 'skewY(0deg)' }], { duration: 2400, iterations: Infinity }]] }); }
    return t;
  };
  /* vinduer: lyset flimrer (lysere, så mørkere). To små lag pr. vindue tones ind og ud over det faste vindue */
  const win = (x, y, w, h, d) => { const P = `M ${x} ${y+h} V ${y+w/2} A ${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2} V ${y+h} Z`, bx = x - 3, by = y - 3, bw = w + 6, bh = h + 6;
    [['#FFE9A0', [0, 1, 0, 0]], ['#FFC94A', [0, 0, 1, 0]]].forEach(([c, v]) => fx.push({ lag: 'for', x: bx, y: by, w: bw, h: bh, body: `<path d="${P}" fill="${c}" stroke="${E}" stroke-width="3"/>`,
      anim: [[v.map((op, i) => ({ offset: i / 3, opacity: op })), { duration: d * 1000, iterations: Infinity }]] }));
    return `<circle cx="${x+w/2}" cy="${y+h/2}" r="${h*1.3}" fill="url(#twin)"/><path d="${P}" fill="#FFD86B" stroke="${E}" stroke-width="3"/>`; };
  o += `<path d="M 60 800 C 160 700 300 650 420 650 C 560 650 680 720 760 800 Z" fill="#2C1F6E"/>`;
  o += tower(190, 64, 470, 790, 360, true) + tower(560, 60, 500, 790, 400, true) + tower(640, 40, 580, 790, 510, false);
  o += `<rect x="254" y="560" width="306" height="230" fill="${W}" stroke="${E}" stroke-width="4"/><rect x="460" y="560" width="100" height="230" fill="${WS}"/>`;
  o += Array.from({length: 8}, (_, i) => `<rect x="${256 + i*38}" y="540" width="22" height="22" fill="${i > 5 ? WS : W}" stroke="${E}" stroke-width="3"/>`).join('');
  o += tower(370, 72, 360, 560, 220, false) + `<path d="M 406 220 V 180" stroke="${E}" stroke-width="4"/>`;
  /* stjernen på tårnet drejer rundt */
  fx.push({ lag: 'for', x: 384, y: 146, w: 44, h: 44, origin: [22, 22], body: `<polygon points="${star5pts(406,168,20,9)}" fill="#FFE27A" stroke="#C99A12" stroke-width="2.5"/>`,
    anim: [[[{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 12000, iterations: Infinity }]] });
  o += `<circle cx="406" cy="420" r="26" fill="#FFD86B" stroke="${E}" stroke-width="3"/><path d="M 406 394 V 446 M 380 420 H 432" stroke="${E}" stroke-width="3"/><circle cx="406" cy="420" r="60" fill="url(#twin)"/>`;
  o += win(206, 520, 30, 50, 3.1) + win(206, 640, 30, 50, 4.2) + win(575, 560, 28, 46, 3.6) + win(649, 620, 22, 38, 2.8) + win(290, 610, 32, 56, 3.3) + win(350, 610, 32, 56, 4.4) + win(470, 610, 32, 56, 3.9);
  o += `<path d="M 380 790 V 712 A 26 26 0 0 1 432 712 V 790 Z" fill="#5A2E1E" stroke="${E}" stroke-width="4"/><circle cx="422" cy="752" r="4" fill="#FFD86B"/><path d="M 360 790 L 452 790 L 470 820 L 342 820 Z" fill="#4A3A8F"/>`;
  /* en sværm af ildfluer der flyver rundt om slottet: hver sit lille lag, der følger sin bane og blinker */
  const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  for (let i = 0; i < 26; i++){
    const cx = 150 + r() * 620, cy = 360 + r() * 380, d = 5 + r() * 6, rad = 18 + r() * 46, k = r() < .5 ? 1 : -1;
    const pts = Array.from({ length: 5 }, (_, j) => { const a = j / 5 * Math.PI * 2 * k; return `${(Math.cos(a) * rad * (0.6 + r() * 0.8)).toFixed(0)} ${(Math.sin(a) * rad * (0.4 + r() * 0.6)).toFixed(0)}`; });
    const beg = r() * 6, blink = 1.4 + r() * 1.6;
    tmp.setAttribute('d', `M ${pts[0]} C ${pts[1]} ${pts[2]} ${pts[3]} S ${pts[4]} ${pts[0]} Z`);
    const L = tmp.getTotalLength(), N = 40, kf = [];
    for (let j = 0; j <= N; j++){ const q = tmp.getPointAtLength(L * j / N); kf.push({ offset: j / N, transform: `translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px)` }); }
    fx.push({ lag: 'for', x: Math.round(cx) - 20, y: Math.round(cy) - 20, w: 40, h: 40,
      body: `<defs><radialGradient id="tfly${i}"><stop offset="0" stop-color="#FFF6B0" stop-opacity=".9"/><stop offset=".35" stop-color="#E8FF8A" stop-opacity=".35"/><stop offset="1" stop-color="#E8FF8A" stop-opacity="0"/></radialGradient></defs><circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="20" fill="url(#tfly${i})"/><circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="3.6" fill="#FFFBD0"/>`,
      /* bevægelsen og blinket kører samtidig på samme lag (glødens kerne blinkede før alene; nu blinker hele ildfluen lidt svagere) */
      anim: [[kf, { duration: d * 1000, delay: -beg * 1000, iterations: Infinity }], [[{ opacity: 1 }, { opacity: .45 }, { opacity: 1 }, { opacity: .7 }, { opacity: 1 }], { duration: blink * 1000, iterations: Infinity }]] });
  }
  /* forgrunden: bakken figuren står på */
  o += `<path d="M 0 830 C 260 790 520 840 800 836 C 1080 832 1340 780 1600 820 L 1600 1000 L 0 1000 Z" fill="#241A5C"/><path d="M 0 830 C 260 790 520 840 800 836 C 1080 832 1340 780 1600 820" stroke="#4E3C9C" stroke-width="5" fill="none"/>`;
  o += [[110,880],[1480,870],[1180,900],[300,930]].map(([x,y]) => `<g fill="#3A2C80">${[[-14,-26],[0,-34],[14,-24]].map(([dx,dy]) => `<ellipse cx="${x+dx}" cy="${y+dy}" rx="7" ry="16" transform="rotate(${dx*1.6} ${x+dx} ${y+dy})"/>`).join('')}</g>`).join('');
  /* lagene: himmel, stjerner, scenen (fast billede), og det der bevæger sig foran */
  const lag = which => `<div class="ts-fx" data-lag="${which}">` + fx.filter(f => f.lag === which).map((f, i) =>
    `<div class="ts-l" data-i="${fx.indexOf(f)}" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px${f.op ? ';opacity:' + f.op : ''}${f.origin ? `;transform-origin:${f.origin[0]}px ${f.origin[1]}px` : ''}">${TS_SVG(`${f.x} ${f.y} ${f.w} ${f.h}`, f.w, f.h, f.body)}</div>`).join('') + '</div>';
  titleScene.fx = fx;
  return `<svg class="ts-bg" xmlns="http://www.w3.org/2000/svg" ${SL} aria-hidden="true">${defs}<rect width="1600" height="1000" fill="url(#tsky)"/></svg>`
    + lag('bag')
    + `<svg class="ts-bg" xmlns="http://www.w3.org/2000/svg" ${SL} aria-hidden="true">${defs}${o}</svg>`
    + lag('for');
}
/* lagene placeres som SVG'ens 'slice' (fylder skærmen, bunden flugter), og animationerne startes */
function titleFxFit(sc){
  const W = sc.clientWidth, H = sc.clientHeight; if (!W || !H) return;
  const s = Math.max(W / 1600, H / 1000), x = (W - 1600 * s) / 2, y = H - 1000 * s;
  sc.querySelectorAll('.ts-fx').forEach(d => { d.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(5)})`; });
}
function titleFx(scene){
  titleFxFit(scene);
  if (!titleFx.wired){ titleFx.wired = true; window.addEventListener('resize', () => { const sc = document.querySelector('#title .title-scene'); if (sc && !$('#title').hidden) titleFxFit(sc); }); }
  const fx = titleScene.fx || [];
  scene.querySelectorAll('.ts-l').forEach(el => { const f = fx[+el.dataset.i]; if (!f) return; f.anim.forEach(([kf, t]) => { try { el.animate(kf, Object.assign({ easing: 'linear' }, t)); } catch (e){} }); });
}
const RING_SVG = `<svg viewBox="0 0 400 80" aria-hidden="true"><ellipse cx="200" cy="40" rx="190" ry="32" fill="#FFE9A8" opacity=".18"/><ellipse cx="200" cy="40" rx="170" ry="26" fill="none" stroke="#FFE27A" stroke-width="4" opacity=".9"/><ellipse cx="200" cy="40" rx="140" ry="19" fill="none" stroke="#FFE27A" stroke-width="2" stroke-dasharray="3 9" opacity=".8"/>${[[40,40],[360,40],[200,14],[200,66],[90,22],[310,58],[90,58],[310,22]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#FFF6D0"/>`).join('')}</svg>`;
let playing = 0;
function startPlay(){ const now = Date.now(); if (now - playing < 1500) return; playing = now; audioCtx(); sfx.magic(); playMusic('byen'); goFull(); goTo(showSlots); }
function showTitle(){
  showScreen('#title');
  /* byens musik spiller allerede på forsiden. Telefonen må først spille lyd efter et tryk, så det første tryk starter den */
  playMusic('byen');
  const kick = () => { audioCtx(); if (!SND.musicPlaying()) playMusic('byen'); };
  $('#title').addEventListener('pointerdown', kick, { once: true });
  const box = $('#titleBody'); box.innerHTML = '';
  /* hvert bogstav: det ydre lag hopper, det indre har farverne og skyggen (så tegnes skyggen kun én gang og flyttes bare) */
  const letters = GAME_NAME.split('').map((ch, i) => `<span style="animation-delay:${0.05*i}s"><span>${ch === ' ' ? '&nbsp;' : ch}</span></span>`).join('');
  const bubbles = el('div', { class:'title-bubbles', 'aria-hidden':'true' }, Array.from({ length: 9 }, (_, i) => el('span', { style:`left:${8 + i*10.5}%;--s:${[46,28,64,36,22,54,30,40,26][i]}px;animation-delay:${-i*1.7}s;animation-duration:${11 + (i%4)*2.5}s` })));
  box.append(
    el('div', { class:'title-scene', html: titleScene() }),
    bubbles,
    el('div', { class:'shoot', 'aria-hidden':'true' }),
    el('div', { class:'title-top' }, [ audioBtns() ]),
    el('h1', { class:'title-logo', id:'titleLogo', html: letters }),
    el('div', { class:'title-stage' }, [ el('div', { class:'ring', html: RING_SVG }), dollImg(heroState(), { viewBox:'40 40 720 1010', anim: !calm, idle: true, alt:'Din figur' }) ]),
    el('button', { class:'playbtn', type:'button', 'aria-label':'Spil', html:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 37 26 L 75 50 L 37 74 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/></svg>', on:{
      /* knappen griber fingeren, så trykket tæller, selvom skærmen hopper (fx når telefonens bjælker dukker op) */
      pointerdown: e => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) {} },
      pointerup: () => startPlay(), click: () => startPlay() } }),
    el('p', { class:'ver', on:{ click: () => DBG.tap(), pointerdown: forpTryk, pointerup: forpSlip, pointerleave: forpSlip, pointercancel: forpSlip } }, GAME_NAME + ' ' + VERSION),
  );
  $('#titleLogo').addEventListener('click', logoTap);
  titleFx(box.querySelector('.title-scene'));
  updateAudioBtns();
}

/* byen ligger i city.js */
