/* ================= Skaberen ================= */
const STAGE_PET_VB = '440 600 360 495';
/* zoom i spejlet pr. fane: [midte x, midte y, bredde]; højden følger spejlets form (1100/800) */
const ZOOM = { hud:[400,470,560], oejne:[400,440,380], makeup:[400,450,440], pande:[400,360,520], bag:[400,520,720], haarfarve:[400,520,720],
  overdel:[400,700,340], underdel:[400,880,380], sko:[400,935,300] };

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

/* ---------- data ---------- */
let figures = store.get(KEY, []);
if (!Array.isArray(figures)) figures = [];
let cur = null, tab = 'hud', petTab = 'dyr', mode = 'dukke', activeAcc = null, activePetAcc = null, history = [], liveHist = false;
let gameDress = null;   /* sat når Modehuset bruger skaberen: { theme, onDone, onCancel } */
const saveAll = () => store.set(KEY, figures);
let saveTimer = null;
function saveSoon(){ if (!cur || cur.temp) return; clearTimeout(saveTimer); saveTimer = setTimeout(()=>{ if (cur && !cur.temp){ cur.t = Date.now(); } saveAll(); }, 300); }
function fixState(st){ const d = clone(DEFAULT_STATE); const s = Object.assign(d, st||{}); for (const k of ['eyes','mk','hair','top','bottom','shoes','pet']) s[k] = Object.assign(clone(DEFAULT_STATE[k]), (st||{})[k]||{}); if (!s.acc || typeof s.acc!=='object') s.acc = {}; if (!s.pet.acc || typeof s.pet.acc!=='object') s.pet.acc = {}; return s; }

const pic = (st, vb) => dollImg(st, mode === 'dyr' ? { viewBox: vb, petOnly: true } : { viewBox: vb, pet: false });

/* ---------- ændringer og fortryd ---------- */
function pushHistory(){ history.push(JSON.stringify(cur.st)); if (history.length > 60) history.shift(); updateUndo(); }
function change(fn, sound='pick'){ pushHistory(); fn(cur.st); sfx[sound] && sfx[sound](); saveSoon(); renderStage(); renderPanel(); }
function updateUndo(){ $('#undoBtn').disabled = history.length === 0; }
function lockedTap(){ sfx.nope(); toast('Den findes i overraskelseskuglerne'); }

/* ---------- sektioner ---------- */
function section(title, kids){ return el('div', { class:'sec' }, [ el('h3', {}, title), ...kids ]); }
function lockBadge(){ return el('span', { class:'lock', html: LOCK_SVG }); }
function optionsSec(title, items, getVal, apply, vb, cat){
  const grid = el('div', { class:'tiles' });
  for (const [id, label] of items){
    const locked = cat && !isFree(cat, id);
    const pv = clone(cur.st); apply(pv, id);
    grid.append(el('button', { class:'tile' + (locked ? ' locked' : ''), type:'button', 'aria-pressed': String(getVal()===id), 'aria-label': locked ? label + ' (låst)' : label,
      on:{ click: () => { if (locked) return lockedTap(); if (getVal()!==id) change(st => apply(st, id)); } } },
      [ pic(pv, vb), el('span', {}, label), locked ? lockBadge() : null ]));
  }
  return section(title, [grid]);
}
function colorsSec(title, palette, getVal, setVal, allowNone=false){
  const row = el('div', { class:'swatches' });
  const v = getVal();
  if (allowNone) row.append(el('button', { class:'sw none', type:'button', 'aria-label':'Ingen', 'aria-pressed': String(!v), on:{ click: () => { if (v) change(st => setVal(st, null), 'color'); } } }));
  for (const c of palette) row.append(el('button', { class:'sw', type:'button', style:`--c:${c}`, 'aria-label': c, 'aria-pressed': String(!!v && v.toLowerCase()===c.toLowerCase()), on:{ click: () => change(st => setVal(st, c), 'color') } }));
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
function multiSec(title, cat, defs, holder, getActive, setActive, vbOf){
  const grid = el('div', { class:'tiles' });
  for (const [id, a] of Object.entries(defs)){
    const locked = !isFree(cat, id);
    const on = !!holder(cur.st)[id];
    const pv = clone(cur.st); holder(pv)[id] = holder(cur.st)[id] || a.color;
    grid.append(el('button', { class:'tile' + (on && getActive()===id ? ' active' : '') + (locked ? ' locked' : ''), type:'button', 'aria-pressed': String(on), 'aria-label': locked ? a.label + ' (låst)' : a.label,
      on:{ click: () => { if (locked) return lockedTap(); change(st => { const h = holder(st); if (on && getActive()===id){ delete h[id]; setActive(null); } else { if (!on) h[id] = a.color; setActive(id); } }); } } },
      [ pic(pv, vbOf(id)), el('span', {}, a.label), locked ? lockBadge() : null ]));
  }
  const out = [ section(title, [ el('p', { class:'hint' }, 'Tryk for at tage på. Tryk igen for at tage af.'), grid ]) ];
  const act = getActive();
  if (act && holder(cur.st)[act]) out.push(colorsSec('Farve på ' + defs[act].label.toLowerCase(), COLORS, () => holder(cur.st)[act], (st,v) => { holder(st)[act] = v; }));
  return out;
}

/* ---------- fanernes indhold ---------- */
const entries = obj => Object.entries(obj).map(([k,v]) => [k, typeof v === 'string' ? v : v.label]);
const TAB_CONTENT = {
  hud: () => [ colorsSec('Hudfarve', SKIN, () => cur.st.skin, (st,v) => st.skin = v) ],
  oejne: () => [
    optionsSec('Pupiller', entries(PUPILS), () => cur.st.eyes.pupil, (st,v) => st.eyes.pupil = v, VB.eye, 'pupil'),
    colorsSec('Øjenfarve', EYES, () => cur.st.eyes.color, (st,v) => st.eyes.color = v) ],
  makeup: () => [
    colorsSec('Øjenskygge', SHADOW, () => cur.st.mk.shadow, (st,v) => st.mk.shadow = v, true),
    cur.st.mk.shadow ? toggleSec('Glimmer på øjenskyggen', () => cur.st.mk.glitter, (st,v) => st.mk.glitter = v) : null,
    optionsSec('Eyeliner', entries(LINERS), () => cur.st.mk.liner, (st,v) => st.mk.liner = v, VB.eye, 'liner'),
    colorsSec('Rouge', BLUSH, () => cur.st.mk.blush, (st,v) => st.mk.blush = v, true),
    optionsSec('Mund', entries(LIPSHAPES), () => cur.st.mk.lipShape, (st,v) => st.mk.lipShape = v, VB.lips, 'lip'),
    colorsSec('Læbefarve', LIPS, () => cur.st.mk.lips, (st,v) => st.mk.lips = v),
    optionsSec('Ansigtsmærke', entries(MARKS), () => cur.st.mk.mark, (st,v) => st.mk.mark = v, VB.face, 'mark'),
    cur.st.mk.mark !== 'ingen' ? colorsSec('Farve på mærket', COLORS, () => cur.st.mk.markColor, (st,v) => st.mk.markColor = v) : null ],
  pande: () => [ optionsSec('Pandehår', entries(FRONT), () => cur.st.front, (st,v) => st.front = v, VB.head, 'front') ],
  bag: () => [ optionsSec('Baghår', entries(BACK), () => cur.st.back, (st,v) => st.back = v, VB.hair, 'back') ],
  haarfarve: () => [
    colorsSec('Hårfarve', HAIR, () => cur.st.hair.a, (st,v) => st.hair.a = v),
    toggleSec('To farver (farvede spidser)', () => cur.st.hair.ombre, (st,v) => st.hair.ombre = v),
    cur.st.hair.ombre ? colorsSec('Farve i spidserne', HAIR, () => cur.st.hair.b, (st,v) => st.hair.b = v) : null,
    ['rottehaler','hestehale','fletninger'].includes(cur.st.back) ? colorsSec('Hårelastikker', COLORS, () => cur.st.hair.tie, (st,v) => st.hair.tie = v) : null ],
  overdel: () => [
    optionsSec('Overdel', entries(TOPS), () => cur.st.top.id, (st,v) => st.top.id = v, VB.top, 'top'),
    colorsSec('Farve', COLORS, () => cur.st.top.a, (st,v) => st.top.a = v),
    colorsSec('Detaljer', COLORS, () => cur.st.top.b, (st,v) => st.top.b = v) ],
  underdel: () => [
    optionsSec('Underdel', entries(BOTTOMS), () => cur.st.bottom.id, (st,v) => st.bottom.id = v, VB.bottom, 'bottom'),
    colorsSec('Farve', COLORS, () => cur.st.bottom.a, (st,v) => st.bottom.a = v),
    colorsSec('Mønster og detaljer', COLORS, () => cur.st.bottom.b, (st,v) => st.bottom.b = v) ],
  sko: () => [
    optionsSec('Sko', entries(SHOES), () => cur.st.shoes.id, (st,v) => st.shoes.id = v, VB.shoes, 'shoes'),
    colorsSec('Farve', COLORS, () => cur.st.shoes.a, (st,v) => st.shoes.a = v),
    colorsSec('Detaljer', COLORS, () => cur.st.shoes.b, (st,v) => st.shoes.b = v) ],
  tilbehoer: () => multiSec('Tilbehør', 'acc', ACC, st => st.acc, () => activeAcc, v => { activeAcc = v; }, id => ACC_VB[id] || VB.full),
  /* ----- kæledyr ----- */
  dyr: () => {
    const inp = el('input', { id:'petName', class:'text', maxlength:'16', placeholder:'Skriv et navn', value: cur.st.pet.name || '', autocomplete:'off',
      on:{ input: e => { cur.st.pet.name = e.target.value.trim(); saveSoon(); } } });
    return [ optionsSec('Hvilket dyr?', entries(PET_KINDS), () => cur.st.pet.kind, (st,v) => st.pet.kind = v, VB.pet, 'pet'),
      cur.st.pet.kind !== 'ingen' ? section('Kæledyrets navn', [inp]) : null ];
  },
  pels: () => noPet() || [
    colorsSec('Pels', FUR, () => cur.st.pet.a, (st,v) => st.pet.a = v),
    optionsSec('Mønster', entries(PET_PATTERNS), () => cur.st.pet.pattern, (st,v) => st.pet.pattern = v, VB.pet, 'petpat'),
    colorsSec('Mave og mønster', FUR, () => cur.st.pet.b, (st,v) => st.pet.b = v),
    cur.st.pet.kind === 'enhjoerning' ? colorsSec('Manke og hale', COLORS, () => cur.st.pet.c, (st,v) => st.pet.c = v) : null,
    cur.st.pet.kind === 'drage' ? colorsSec('Vinger, horn og pigge', COLORS, () => cur.st.pet.c, (st,v) => st.pet.c = v) : null ],
  dyreoejne: () => noPet() || [ colorsSec('Øjenfarve', EYES, () => cur.st.pet.eyes, (st,v) => st.pet.eyes = v) ],
  dyretilbehoer: () => noPet() || multiSec('Tilbehør', 'petacc', PET_ACC, st => st.pet.acc, () => activePetAcc, v => { activePetAcc = v; }, () => VB.pet),
};
function noPet(){
  if (cur.st.pet.kind !== 'ingen') return null;
  return [ section('Intet kæledyr', [ el('p', { class:'hint' }, 'Vælg et dyr først.'), el('button', { class:'btn hot', type:'button', on:{ click: () => { petTab = 'dyr'; renderTabs(); renderPanel(true); } } }, 'Vælg dyr') ]) ];
}

/* ---------- tegning af skærmen ---------- */
const calm = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } })();
function stageViewBox(){
  if (mode === 'dyr') return cur.st.pet.kind !== 'ingen' ? STAGE_PET_VB : undefined;
  const z = ZOOM[tab]; if (!z) return undefined;
  const w = z[2], h = w * 1100 / 800;
  const x = clamp(z[0] - w/2, 0, 800 - w), y = clamp(z[1] - h/2, 0, 1100 - h + 120);
  return `${x.toFixed(1)} ${y.toFixed(1)} ${w} ${h.toFixed(1)}`;
}
function zoomAnim(){ const m = $('#mirror'); m.classList.remove('zoom'); void m.offsetWidth; m.classList.add('zoom'); }
function renderStage(){ $('#stageImg').src = svgUrl(renderDoll(cur.st, { bg:true, anim: !calm, viewBox: stageViewBox() })); }
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
  for (const node of [].concat(TAB_CONTENT[mode === 'dyr' ? petTab : tab]())) if (node) body.append(node);
  body.scrollTop = keep;
}
function placeBulbs(){
  const m = $('#mirror'); m.querySelectorAll('.bulb').forEach(b=>b.remove());
  const pts = [];
  for (let a = 200; a <= 340; a += 20){ const r = a*Math.PI/180; pts.push([50 + 50*Math.cos(r), 34 + 34*Math.sin(r)]); }
  for (let y = 44; y <= 92; y += 12){ pts.push([0, y]); pts.push([100, y]); }
  for (const [x,y] of pts){ const b = el('span', { class:'bulb', 'aria-hidden':'true' }); b.style.left = `${x}%`; b.style.top = `${y}%`; b.style.animationDelay = `${((x+y)%7)*0.3}s`; m.append(b); }
}

/* ---------- åbne og lukke skaberen ---------- */
function openEditor(f, opts={}){
  cur = f; cur.st = enforce(fixState(cur.st)); history = []; activeAcc = null; activePetAcc = null; mode = 'dukke';
  if (opts.tab) tab = opts.tab; if (opts.petTab){ petTab = opts.petTab; mode = 'dyr'; }
  gameDress = opts.game || null;
  const g = !!gameDress;
  $('#editor').classList.toggle('in-game', g);
  $('#gameTheme').hidden = !g; $('#doneBtn').hidden = !g; $('#randBtn').hidden = g;
  $('#gameTheme').textContent = g ? 'Tema: ' + gameDress.theme.name : '';
  $('#backLabel').textContent = g ? 'Afbryd' : 'Mine dukker';
  $('#nameInput').readOnly = g;
  renderModes(); showScreen('#editor');
  $('#nameInput').value = cur.name; updateUndo(); renderStage(); renderTabs(); renderPanel(true); placeBulbs(); sfx.open();
}
function newFigure(){
  let n = figures.length + 1; while (figures.some(f => f.name === 'Dukke ' + n)) n++;
  const f = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name: 'Dukke ' + n, st: clone(DEFAULT_STATE), t: Date.now() };
  figures.unshift(f); saveAll(); tab = 'hud'; openEditor(f);
  return f;
}
