'use strict';
/* ================= Glimmer Studio — skaberen ================= */
const VERSION = 'v0.2.2';
const $ = s => document.querySelector(s);
const clone = o => JSON.parse(JSON.stringify(o));
const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};
const KEY = 'glimmerstudiet.dukker.v1', KEY_SOUND = 'glimmerstudiet.lyd';

/* ---------- farvepaletter ---------- */
const SKIN = ['#FFE6D6','#FAD4BE','#F8CDAE','#EDB98F','#E0A274','#D9A074','#C68653','#A86B42','#8E5B3C','#734429','#5A321D','#3F2214','#C9E6FF','#C8F2DE','#E1D3FF','#FFD1E6'];
const COLORS = ['#FF5FA8','#FF8FC7','#FFC1DC','#E0457A','#B79BFF','#8A5BE8','#5E3BC4','#6FA8FF','#2F6FE0','#7FD8FF','#62E0CB','#22B39E','#9BE36A','#3FA34D','#FFE27A','#FFC02E','#FF9A4D','#FF5A4A','#C2272D','#FFFFFF','#E8E4F2','#9C95B5','#4A4560','#1E1A2E'];
const HAIR = ['#1F1A2B','#3B2A20','#5C3A24','#8A5A35','#B07A45','#D8A55B','#F2D27A','#FFE9A8','#E8E4EE','#B5432A','#E2672E','#FF9ACB','#FF5FA8','#8A5BE8','#B79BFF','#4F7BFF','#7FD8FF','#3FD6C2','#62E0CB','#9BE36A','#FFE07A','#FF7A45'];
const EYES = ['#16B3B8','#3D8BFF','#7FB8E8','#3FA34D','#7BC96F','#8A5B2E','#5C3A24','#C98A2E','#E58E1C','#8A5BE8','#B79BFF','#FF5FA8','#E0457A','#7A7A8C','#2A2340'];
const SHADOW = ['#FF62B0','#FFB3D1','#B48CFF','#7FD8FF','#62E0CB','#FFC02E','#FF9A4D','#C9A27A','#9BE36A','#4F7BFF','#2A2340','#F5E6FF'];
const LIPS = ['#EE4C86','#FF8FB0','#D0246B','#C2272D','#FF5A4A','#E8957F','#C77B6A','#A0526B','#8A5BE8','#B79BFF','#62E0CB','#4A2338'];
const BLUSH = ['#FF7FA6','#FF9E86','#FFB3D1','#E0457A','#B79BFF'];
const FUR = ['#FFFFFF','#F5EEFF','#FFE9D6','#F2D9B8','#E0B98A','#C68653','#8A5A35','#5C3A24','#3B2A20','#9C95B5','#4A4560','#1E1A2E','#FFC9E2','#FF8FC7','#B79BFF','#7FD8FF','#62E0CB','#9BE36A','#FFE27A','#FF9A4D'];

const VB = { head:'150 110 500 500', hair:'40 80 720 820', eye:'226 352 190 170', lips:'348 494 104 72', face:'190 310 420 290',
  top:'240 570 320 320', bottom:'230 715 340 340', shoes:'270 900 260 180', neck:'300 560 200 140', hand:'400 620 300 300', pet:'520 750 280 310' };
const STAGE_PET_VB = '440 600 360 495';
/* zoom i spejlet pr. fane: [midte x, midte y, bredde]; højden følger spejlets form (1100/800) */
const ZOOM = { hud:[400,470,560], oejne:[400,440,380], makeup:[400,450,440], pande:[400,360,520], bag:[400,520,720], haarfarve:[400,520,720],
  overdel:[400,700,340], underdel:[400,880,380], sko:[400,935,300] };
function stageViewBox(){
  if (mode === 'dyr') return cur.st.pet.kind !== 'ingen' ? STAGE_PET_VB : undefined;
  const z = ZOOM[tab]; if (!z) return undefined;
  const w = z[2], h = w * 1100 / 800;
  const x = Math.max(0, Math.min(800 - w, z[0] - w/2)), y = Math.max(0, Math.min(1100 - h + 120, z[1] - h/2));
  return `${x.toFixed(1)} ${y.toFixed(1)} ${w} ${h.toFixed(1)}`;
}
function zoomAnim(){ const m = $('#mirror'); m.classList.remove('zoom'); void m.offsetWidth; m.classList.add('zoom'); }
const ACC_VB = { sloejfe:VB.head, tiara:VB.head, katteoerer:VB.head, spaender:VB.head, briller:'200 340 400 220', halskaede:VB.neck, armbaand:VB.hand, taske:VB.hand, stav:VB.hand };

/* ---------- ikoner til fanerne ---------- */
const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const DOLL_TABS = [
  ['hud','Hud', ic('<circle cx="12" cy="12" r="8"/><path d="M9 14.5c1.6 1.4 4.4 1.4 6 0"/><circle cx="9.5" cy="10.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="10.5" r=".6" fill="currentColor"/>')],
  ['oejne','Øjne', ic('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')],
  ['makeup','Make-up', ic('<path d="M9 21h6v-8H9z"/><path d="M10 13V7l4-3v9"/>')],
  ['pande','Pandehår', ic('<path d="M4 15C4 8 7.5 4 12 4s8 4 8 11"/><path d="M4.5 12l3-3 2.5 3 2-4 2 4 2.5-3 3 3"/>')],
  ['bag','Baghår', ic('<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M9 21v-6M15 21v-6"/>')],
  ['haarfarve','Hårfarve', ic('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>')],
  ['overdel','Overdel', ic('<path d="M8 4L3 7l2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-2 2.5-4 2.5S9 6 8 4z"/>')],
  ['underdel','Underdel', ic('<path d="M8 4h8l4 15H4z"/><path d="M8 7h8"/>')],
  ['sko','Sko', ic('<path d="M3 18v-6l5-1 3 3h4l6 2v2z"/><path d="M3 18h18"/>')],
  ['tilbehoer','Tilbehør', ic('<path d="M12 12L4 7v10zM12 12l8-5v10z"/><circle cx="12" cy="12" r="2"/>')],
];
const PET_TABS = [
  ['dyr','Dyr', ic('<circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><path d="M12 12c-3 0-6 4-6 6.5S8 21 12 19.5 18 21 18 18.5 15 12 12 12z"/>')],
  ['pels','Pels', ic('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>')],
  ['dyreoejne','Øjne', ic('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')],
  ['dyretilbehoer','Tilbehør', ic('<path d="M12 12L4 7v10zM12 12l8-5v10z"/><circle cx="12" cy="12" r="2"/>')],
];

/* ---------- lyd ---------- */
let AC = null, soundOn = store.get(KEY_SOUND, true);
function tone(f, dur=0.09, type='sine', vol=0.07, delay=0){
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f*1.45, t+dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.012); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+0.03);
  } catch(e){}
}
const sfx = {
  pick: () => tone(820, 0.07, 'triangle', 0.06),
  color: () => tone(1040, 0.05, 'sine', 0.045),
  magic: () => [523,659,784,1047,1319].forEach((f,i)=>tone(f,0.13,'triangle',0.06,i*0.06)),
  undo: () => tone(520, 0.09, 'sine', 0.05),
  open: () => [660,880].forEach((f,i)=>tone(f,0.08,'triangle',0.05,i*0.07)),
};

/* ---------- data ---------- */
let figures = store.get(KEY, []);
if (!Array.isArray(figures)) figures = [];
let cur = null, tab = 'hud', petTab = 'dyr', mode = 'dukke', activeAcc = null, activePetAcc = null, history = [], liveHist = false;
const saveAll = () => store.set(KEY, figures);
let saveTimer = null;
function saveSoon(){ clearTimeout(saveTimer); saveTimer = setTimeout(()=>{ if (cur){ cur.t = Date.now(); } saveAll(); }, 300); }
function fixState(st){ const d = clone(DEFAULT_STATE); const s = Object.assign(d, st||{}); for (const k of ['eyes','mk','hair','top','bottom','shoes','pet']) s[k] = Object.assign(clone(DEFAULT_STATE[k]), (st||{})[k]||{}); if (!s.acc || typeof s.acc!=='object') s.acc = {}; if (!s.pet.acc || typeof s.pet.acc!=='object') s.pet.acc = {}; return s; }

/* ---------- små DOM-hjælpere ---------- */
function el(tag, attrs={}, kids=[]){
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)){ if (k==='on') for (const [ev,fn] of Object.entries(v)) e.addEventListener(ev, fn); else if (k==='html') e.innerHTML = v; else if (v!==undefined && v!==null) e.setAttribute(k, v); }
  for (const kid of [].concat(kids)) if (kid!==null && kid!==undefined) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}
const pic = (st, vb) => el('img', { src: svgUrl(renderDoll(st, mode === 'dyr' ? { viewBox: vb, petOnly: true } : { viewBox: vb, pet: false })), alt:'' });

/* ---------- ændringer og fortryd ---------- */
function pushHistory(){ history.push(JSON.stringify(cur.st)); if (history.length > 60) history.shift(); updateUndo(); }
function change(fn, sound='pick'){ pushHistory(); fn(cur.st); sfx[sound] && sfx[sound](); saveSoon(); renderStage(); renderPanel(); }
function updateUndo(){ $('#undoBtn').disabled = history.length === 0; }

/* ---------- sektioner ---------- */
function section(title, kids){ return el('div', { class:'sec' }, [ el('h3', {}, title), ...kids ]); }
function optionsSec(title, items, getVal, apply, vb){
  const grid = el('div', { class:'tiles' });
  for (const [id, label] of items){
    const pv = clone(cur.st); apply(pv, id);
    grid.append(el('button', { class:'tile', type:'button', 'aria-pressed': String(getVal()===id), on:{ click: () => { if (getVal()!==id) change(st => apply(st, id)); } } }, [ pic(pv, vb), el('span', {}, label) ]));
  }
  return section(title, [grid]);
}
function colorsSec(title, palette, getVal, setVal, allowNone=false){
  const row = el('div', { class:'swatches' });
  const v = getVal();
  if (allowNone) row.append(el('button', { class:'sw none', type:'button', 'aria-label':'Ingen', 'aria-pressed': String(!v), on:{ click: () => { if (v) change(st => setVal(st, null), 'color'); } } }));
  for (const c of palette) row.append(el('button', { class:'sw', type:'button', style:`--c:${c}`, 'aria-label': c, 'aria-pressed': String(v && v.toLowerCase()===c.toLowerCase()), on:{ click: () => change(st => setVal(st, c), 'color') } }));
  const custom = !v || palette.some(c=>c.toLowerCase()===v.toLowerCase()) ? null : v;
  const inp = el('input', { type:'color', value: v || '#FF5FA8', 'aria-label':'Vælg selv en farve',
    on:{ input: e => { if (!liveHist){ pushHistory(); liveHist = true; } setVal(cur.st, e.target.value); e.target.parentNode.style.setProperty('--c', e.target.value); renderStage(); saveSoon(); },
         change: () => { liveHist = false; renderPanel(); } } });
  row.append(el('label', { class:'sw rainbow', style:`--c:${custom || 'transparent'}`, title:'Vælg selv en farve', 'aria-pressed': String(!!custom) }, [ inp, custom ? el('span') : null ]));
  return section(title, [row]);
}
function toggleSec(label, getVal, setVal){
  const on = !!getVal();
  return el('button', { class:'toggle', type:'button', 'aria-pressed': String(on), on:{ click: () => change(st => setVal(st, !on)) } }, [ el('span', { class:'knob' }), label ]);
}

/* ---------- fanernes indhold ---------- */
const entries = obj => Object.entries(obj).map(([k,v]) => [k, v.label]);
const TAB_CONTENT = {
  hud: () => [ colorsSec('Hudfarve', SKIN, () => cur.st.skin, (st,v) => st.skin = v) ],
  oejne: () => [
    optionsSec('Pupiller', [['rund','Runde'],['hjerte','Hjerter'],['stjerne','Stjerner'],['glimt','Glimt']], () => cur.st.eyes.pupil, (st,v) => st.eyes.pupil = v, VB.eye),
    colorsSec('Øjenfarve', EYES, () => cur.st.eyes.color, (st,v) => st.eyes.color = v) ],
  makeup: () => [
    colorsSec('Øjenskygge', SHADOW, () => cur.st.mk.shadow, (st,v) => st.mk.shadow = v, true),
    cur.st.mk.shadow ? toggleSec('Glimmer på øjenskyggen', () => cur.st.mk.glitter, (st,v) => st.mk.glitter = v) : null,
    optionsSec('Eyeliner', [['ingen','Ingen'],['bloed','Blød'],['vinge','Vinge']], () => cur.st.mk.liner, (st,v) => st.mk.liner = v, VB.eye),
    colorsSec('Rouge', BLUSH, () => cur.st.mk.blush, (st,v) => st.mk.blush = v, true),
    optionsSec('Mund', [['pust','Kyssemund'],['smil','Smil'],['grin','Stort grin']], () => cur.st.mk.lipShape, (st,v) => st.mk.lipShape = v, VB.lips),
    colorsSec('Læbefarve', LIPS, () => cur.st.mk.lips, (st,v) => st.mk.lips = v),
    optionsSec('Ansigtsmærke', [['ingen','Intet'],['hjerte','Hjerte'],['stjerne','Stjerne'],['fregner','Fregner'],['glimmer','Glimmer']], () => cur.st.mk.mark, (st,v) => st.mk.mark = v, VB.face),
    cur.st.mk.mark !== 'ingen' ? colorsSec('Farve på mærket', COLORS, () => cur.st.mk.markColor, (st,v) => st.mk.markColor = v) : null ],
  pande: () => [ optionsSec('Pandehår', entries(FRONT), () => cur.st.front, (st,v) => st.front = v, VB.head) ],
  bag: () => [ optionsSec('Baghår', entries(BACK), () => cur.st.back, (st,v) => st.back = v, VB.hair) ],
  haarfarve: () => [
    colorsSec('Hårfarve', HAIR, () => cur.st.hair.a, (st,v) => st.hair.a = v),
    toggleSec('To farver (farvede spidser)', () => cur.st.hair.ombre, (st,v) => st.hair.ombre = v),
    cur.st.hair.ombre ? colorsSec('Farve i spidserne', HAIR, () => cur.st.hair.b, (st,v) => st.hair.b = v) : null,
    ['rottehaler','hestehale','fletninger'].includes(cur.st.back) ? colorsSec('Hårelastikker', COLORS, () => cur.st.hair.tie, (st,v) => st.hair.tie = v) : null ],
  overdel: () => [
    optionsSec('Overdel', entries(TOPS), () => cur.st.top.id, (st,v) => st.top.id = v, VB.top),
    colorsSec('Farve', COLORS, () => cur.st.top.a, (st,v) => st.top.a = v),
    colorsSec('Detaljer', COLORS, () => cur.st.top.b, (st,v) => st.top.b = v) ],
  underdel: () => [
    optionsSec('Underdel', entries(BOTTOMS), () => cur.st.bottom.id, (st,v) => st.bottom.id = v, VB.bottom),
    colorsSec('Farve', COLORS, () => cur.st.bottom.a, (st,v) => st.bottom.a = v),
    colorsSec('Mønster og detaljer', COLORS, () => cur.st.bottom.b, (st,v) => st.bottom.b = v) ],
  sko: () => [
    optionsSec('Sko', entries(SHOES), () => cur.st.shoes.id, (st,v) => st.shoes.id = v, VB.shoes),
    colorsSec('Farve', COLORS, () => cur.st.shoes.a, (st,v) => st.shoes.a = v),
    colorsSec('Detaljer', COLORS, () => cur.st.shoes.b, (st,v) => st.shoes.b = v) ],
  tilbehoer: () => {
    const grid = el('div', { class:'tiles' });
    for (const [id, a] of Object.entries(ACC)){
      const on = !!cur.st.acc[id];
      const pv = clone(cur.st); pv.acc[id] = cur.st.acc[id] || a.color;
      grid.append(el('button', { class:'tile' + (on && activeAcc===id ? ' active' : ''), type:'button', 'aria-pressed': String(on),
        on:{ click: () => change(st => { if (on && activeAcc===id){ delete st.acc[id]; activeAcc = null; } else { if (!on) st.acc[id] = a.color; activeAcc = id; } }) } },
        [ pic(pv, ACC_VB[id]), el('span', {}, a.label) ]));
    }
    const out = [ section('Tilbehør', [ el('p', { class:'hint' }, 'Tryk for at tage på. Tryk igen for at tage af.'), grid ]) ];
    if (activeAcc && cur.st.acc[activeAcc]) out.push(colorsSec('Farve på ' + ACC[activeAcc].label.toLowerCase(), COLORS, () => cur.st.acc[activeAcc], (st,v) => st.acc[activeAcc] = v));
    return out;
  },
  /* ----- kæledyr ----- */
  dyr: () => {
    const inp = el('input', { id:'petName', class:'text', maxlength:'16', placeholder:'Skriv et navn', value: cur.st.pet.name || '', autocomplete:'off',
      on:{ input: e => { cur.st.pet.name = e.target.value.trim(); saveSoon(); } } });
    return [ optionsSec('Hvilket dyr?', entries(PET_KINDS), () => cur.st.pet.kind, (st,v) => st.pet.kind = v, VB.pet),
      cur.st.pet.kind !== 'ingen' ? section('Kæledyrets navn', [inp]) : null ];
  },
  pels: () => noPet() || [
    colorsSec('Pels', FUR, () => cur.st.pet.a, (st,v) => st.pet.a = v),
    optionsSec('Mønster', Object.entries(PET_PATTERNS), () => cur.st.pet.pattern, (st,v) => st.pet.pattern = v, VB.pet),
    colorsSec('Mave og mønster', FUR, () => cur.st.pet.b, (st,v) => st.pet.b = v),
    cur.st.pet.kind === 'enhjoerning' ? colorsSec('Manke og hale', COLORS, () => cur.st.pet.c, (st,v) => st.pet.c = v) : null,
    cur.st.pet.kind === 'drage' ? colorsSec('Vinger, horn og pigge', COLORS, () => cur.st.pet.c, (st,v) => st.pet.c = v) : null ],
  dyreoejne: () => noPet() || [ colorsSec('Øjenfarve', EYES, () => cur.st.pet.eyes, (st,v) => st.pet.eyes = v) ],
  dyretilbehoer: () => noPet() || (() => {
    const grid = el('div', { class:'tiles' });
    for (const [id, a] of Object.entries(PET_ACC)){
      const on = !!cur.st.pet.acc[id];
      const pv = clone(cur.st); pv.pet.acc[id] = cur.st.pet.acc[id] || a.color;
      grid.append(el('button', { class:'tile' + (on && activePetAcc===id ? ' active' : ''), type:'button', 'aria-pressed': String(on),
        on:{ click: () => change(st => { if (on && activePetAcc===id){ delete st.pet.acc[id]; activePetAcc = null; } else { if (!on) st.pet.acc[id] = a.color; activePetAcc = id; } }) } },
        [ pic(pv, VB.pet), el('span', {}, a.label) ]));
    }
    const out = [ section('Tilbehør', [ el('p', { class:'hint' }, 'Tryk for at tage på. Tryk igen for at tage af.'), grid ]) ];
    if (activePetAcc && cur.st.pet.acc[activePetAcc]) out.push(colorsSec('Farve på ' + PET_ACC[activePetAcc].label.toLowerCase(), COLORS, () => cur.st.pet.acc[activePetAcc], (st,v) => st.pet.acc[activePetAcc] = v));
    return out;
  })(),
};
function noPet(){
  if (cur.st.pet.kind !== 'ingen') return null;
  return [ section('Intet kæledyr', [ el('p', { class:'hint' }, 'Vælg et dyr først.'), el('button', { class:'btn hot', type:'button', on:{ click: () => { petTab = 'dyr'; renderTabs(); renderPanel(true); } } }, 'Vælg dyr') ]) ];
}

/* ---------- tegning af skærmen ---------- */
function renderStage(){ $('#stageImg').src = svgUrl(renderDoll(cur.st, { bg:true, viewBox: stageViewBox() })); }
function renderModes(){
  document.querySelectorAll('.mode').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  $('#tabs').classList.toggle('pet', mode === 'dyr');
}
function setMode(m){ if (m === mode) return; mode = m; sfx.pick(); renderModes(); renderStage(); zoomAnim(); renderTabs(); renderPanel(true); }
function renderTabs(){
  const nav = $('#tabs'); nav.innerHTML = '';
  const list = mode === 'dyr' ? PET_TABS : DOLL_TABS, now = mode === 'dyr' ? petTab : tab;
  for (const [id, label, icon] of list)
    nav.append(el('button', { class:'tab', type:'button', role:'tab', 'aria-selected': String(id===now), html: icon + `<span>${label}</span>`,
      on:{ click: () => { if (now!==id){ if (mode === 'dyr') petTab = id; else tab = id; sfx.pick(); renderStage(); zoomAnim(); renderTabs(); renderPanel(true); } } } }));
}
function renderPanel(resetScroll=false){
  const body = $('#panelBody'); const keep = resetScroll ? 0 : body.scrollTop;
  body.innerHTML = '';
  for (const node of TAB_CONTENT[mode === 'dyr' ? petTab : tab]()) if (node) body.append(node);
  body.scrollTop = keep;
}
function placeBulbs(){
  const m = $('#mirror'); m.querySelectorAll('.bulb').forEach(b=>b.remove());
  const pts = [];
  for (let a = 200; a <= 340; a += 20){ const r = a*Math.PI/180; pts.push([50 + 50*Math.cos(r), 34 + 34*Math.sin(r)]); }
  for (let y = 44; y <= 92; y += 12){ pts.push([0, y]); pts.push([100, y]); }
  for (const [x,y] of pts){ const b = el('span', { class:'bulb', 'aria-hidden':'true' }); b.style.left = `calc(${x}% )`; b.style.top = `${y}%`; b.style.animationDelay = `${((x+y)%7)*0.3}s`; m.append(b); }
}

/* ---------- tilfældig dukke ---------- */
const pick = a => a[Math.floor(Math.random()*a.length)];
const pickOther = (a, not) => { let v; do { v = pick(a); } while (v===not && a.length>1); return v; };
function randomState(){
  const st = clone(DEFAULT_STATE);
  st.skin = Math.random() < 0.88 ? pick(SKIN.slice(0,12)) : pick(SKIN.slice(12));
  st.eyes = { color: pick(EYES), pupil: pick(['rund','rund','hjerte','stjerne','glimt']) };
  st.mk = { shadow: Math.random()<0.85 ? pick(SHADOW) : null, glitter: Math.random()<0.6, liner: pick(['ingen','bloed','vinge','vinge']),
    blush: Math.random()<0.85 ? pick(BLUSH) : null, lips: pick(LIPS), lipShape: pick(['pust','smil','grin']), mark: pick(['ingen','ingen','hjerte','stjerne','fregner','glimmer']), markColor: pick(COLORS) };
  st.front = pick(Object.keys(FRONT)); st.back = pick(Object.keys(BACK));
  const ha = pick(HAIR); st.hair = { a: ha, b: pickOther(HAIR, ha), ombre: Math.random()<0.5, tie: pick(COLORS) };
  const ta = pick(COLORS), ba = pickOther(COLORS, ta), sa = pick(COLORS);
  st.top = { id: pick(Object.keys(TOPS)), a: ta, b: pickOther(COLORS, ta) };
  st.bottom = { id: pick(Object.keys(BOTTOMS)), a: ba, b: pickOther(COLORS, ba) };
  st.shoes = { id: pick(Object.keys(SHOES)), a: sa, b: pickOther(COLORS, sa) };
  st.acc = {}; const keys = Object.keys(ACC).sort(()=>Math.random()-0.5).slice(0, Math.floor(Math.random()*4));
  for (const k of keys){ if (k==='briller' && Math.random()<0.6) continue; st.acc[k] = pick(COLORS); }
  const fa = pick(FUR);
  st.pet = { kind: pick(Object.keys(PET_KINDS).filter(k => k !== 'ingen')), a: fa, b: pickOther(FUR, fa), c: pick(COLORS), pattern: pick(Object.keys(PET_PATTERNS)), eyes: pick(EYES), acc: {}, name: (cur && cur.st.pet && cur.st.pet.name) || '' };
  for (const k of Object.keys(PET_ACC)) if (Math.random() < 0.3) st.pet.acc[k] = pick(COLORS);
  return st;
}

/* ---------- skærmskift ---------- */
function showHome(){
  cur = null; $('#editor').hidden = true; $('#home').hidden = false; renderHome();
}
function openFigure(f){
  cur = f; cur.st = fixState(cur.st); history = []; activeAcc = null; activePetAcc = null; mode = 'dukke'; renderModes();
  $('#home').hidden = true; $('#editor').hidden = false;
  $('#nameInput').value = cur.name; updateUndo(); renderStage(); renderTabs(); renderPanel(true); placeBulbs(); sfx.open();
}
function newFigure(){
  let n = figures.length + 1; while (figures.some(f => f.name === 'Dukke ' + n)) n++;
  const f = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name: 'Dukke ' + n, st: clone(DEFAULT_STATE), t: Date.now() };
  figures.unshift(f); saveAll(); tab = 'hud'; openFigure(f);
}
function renderHome(){
  const g = $('#figGrid'); g.innerHTML = '';
  g.append(el('div', { class:'card new' }, [ el('button', { class:'open', type:'button', on:{ click: newFigure } }, [ el('span', { class:'plus', 'aria-hidden':'true' }, '+'), 'Ny dukke' ]) ]));
  for (const f of figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))){
    const st = fixState(f.st);
    g.append(el('div', { class:'card' }, [
      el('button', { class:'open', type:'button', on:{ click: () => openFigure(f) } }, [ el('img', { src: svgUrl(renderDoll(st, { bg:true, viewBox:'100 90 600 640' })), alt:'' }), el('span', { class:'nm' }, f.name), st.pet.kind !== 'ingen' && st.pet.name ? el('span', { class:'pet-nm' }, 'og ' + st.pet.name) : null ]),
      el('button', { class:'del', type:'button', 'aria-label': 'Slet ' + f.name, html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>', on:{ click: () => askDelete(f) } }),
    ]));
  }
}
function askDelete(f){
  $('#modalText').textContent = `${f.name} forsvinder for altid.`;
  $('#modal').hidden = false; $('#modalNo').focus();
  $('#modalNo').onclick = () => { $('#modal').hidden = true; };
  $('#modalYes').onclick = () => { figures = figures.filter(x => x !== f); saveAll(); $('#modal').hidden = true; renderHome(); };
}

/* ---------- start ---------- */
function updateSoundBtn(){ $('#soundBtn').textContent = soundOn ? 'Lyd: til' : 'Lyd: fra'; }
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set(KEY_SOUND, soundOn); updateSoundBtn(); sfx.pick(); };
$('#backBtn').onclick = () => { saveAll(); sfx.undo(); showHome(); };
$('#undoBtn').onclick = () => { if (!history.length) return; cur.st = fixState(JSON.parse(history.pop())); sfx.undo(); updateUndo(); saveSoon(); renderStage(); renderPanel(); };
$('#randBtn').onclick = () => { pushHistory(); cur.st = randomState(); activeAcc = null; activePetAcc = null; sfx.magic(); saveSoon(); renderStage(); renderPanel(); const m = $('#mirror'); m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); };
$('#nameInput').addEventListener('input', e => { cur.name = e.target.value.trim() || 'Uden navn'; saveSoon(); });
document.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#ver').textContent = 'Glimmer Studio ' + VERSION;
updateSoundBtn(); showHome();
