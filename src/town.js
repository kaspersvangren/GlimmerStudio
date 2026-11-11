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
    el('div', { class:'title-stage' }, [ el('div', { class:'spot', 'aria-hidden':'true' }), dollImg(heroState(), { viewBox:'40 40 720 1010', anim: !calm, idle: true, alt:'Din figur' }), el('div', { class:'disc', 'aria-hidden':'true' }) ]),
    el('button', { class:'playbtn', type:'button', 'aria-label':'Spil', html:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 37 26 L 75 50 L 37 74 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/></svg>', on:{ click: () => { audioCtx(); sfx.magic(); playMusic('byen'); goTo(showTown); } } }),
    el('p', { class:'ver' }, 'Glimmer Studio ' + VERSION),
  );
  $('#titleLogo').addEventListener('click', logoTap);
  updateAudioBtns();
}

/* byen ligger i city.js */
