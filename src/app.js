/* ================= Skaberen ================= */
const STAGE_PET_VB = '440 600 360 495';
/* zoom i spejlet pr. fane: [midte x, midte y, bredde]; højden følger spejlets form (1100/800) */
const ZOOM = { hud:[400,560,560], oejne:[400,420,300], ansigt:[400,440,360], pande:[400,330,440], bag:[400,500,640], haarfarve:[400,500,640],
  kjole:[400,720,520], kappe:[400,720,620], hat:[400,250,500], sko:[400,960,320] };

const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const DOLL_TABS = [
  ['hud','Hud', ic('<circle cx="12" cy="12" r="8"/><path d="M9 14.5c1.6 1.4 4.4 1.4 6 0"/><circle cx="9.5" cy="10.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="10.5" r=".6" fill="currentColor"/>')],
  ['oejne','Øjne', ic('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')],
  ['ansigt','Ansigt', ic('<circle cx="12" cy="12" r="9"/><path d="M8 14.5c2 2 6 2 8 0"/><circle cx="7.5" cy="12" r="1.2" fill="currentColor"/><circle cx="16.5" cy="12" r="1.2" fill="currentColor"/>')],
  ['pande','Pandehår', ic('<path d="M4 15C4 8 7.5 4 12 4s8 4 8 11"/><path d="M4.5 12l3-3 2.5 3 2-4 2 4 2.5-3 3 3"/>')],
  ['bag','Baghår', ic('<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M9 21v-6M15 21v-6"/>')],
  ['haarfarve','Hårfarve', ic('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>')],
  ['hat','Hat', ic('<path d="M3 19h18"/><path d="M7 19l3-9c1-4 3-6 7-7-2 3-2 6-1 9l2 7"/>')],
  ['kjole','Kjole', ic('<path d="M9 3h6l-1 5 5 13H5l5-13z"/><path d="M10 8h4"/>')],
  ['kappe','Kappe', ic('<path d="M8 3h8l4 18H4z"/><path d="M8 3c0 3 1.5 5 4 5s4-2 4-5"/>')],
  ['sko','Fodtøj', ic('<path d="M7 3h5v11l7 3v3H5V14z"/><path d="M7 8h5"/>')],
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
function fixState(st){ const d = clone(DEFAULT_STATE); const s = Object.assign(d, st||{}); for (const k of ['eyes','mk','hair','robe','cape','hat','boots','pet']) s[k] = Object.assign(clone(DEFAULT_STATE[k]), (st||{})[k]||{}); if (!s.acc || typeof s.acc!=='object') s.acc = {}; if (!s.pet.acc || typeof s.pet.acc!=='object') s.pet.acc = {}; return s; }

const pic = (st, vb) => dollImg(st, mode === 'dyr' ? { viewBox: vb, petOnly: true } : { viewBox: vb, pet: false });

/* ---------- ændringer og fortryd ---------- */
function pushHistory(){ history.push(JSON.stringify(cur.st)); if (history.length > 60) history.shift(); updateUndo(); }
function change(fn, sound='pick'){ pushHistory(); fn(cur.st); sfx[sound] && sfx[sound](); saveSoon(); renderStage(); renderPanel(); }
function updateUndo(){ $('#undoBtn').disabled = history.length === 0; }
function lockedTap(){ sfx.nope(); toast('Den findes i overraskelseskuglerne'); }

/* ---------- sektioner ---------- */
function section(title, kids){ return el('div', { class:'sec' }, [ el('h3', {}, title), ...kids ]); }
function lockBadge(){ return el('span', { class:'lock', html: LOCK_SVG }); }
const newTag = () => el('span', { class:'newtag' }, 'NY');
function optionsSec(title, items, getVal, apply, vb, cat){
  const grid = el('div', { class:'tiles' });
  for (const [id, label] of items){
    const locked = cat && !isFree(cat, id), fresh = cat && !locked && isFresh(cat, id);
    if (fresh) grid.classList.add('has-fresh');
    const pv = clone(cur.st); apply(pv, id);
    grid.append(el('button', { class:'tile' + (locked ? ' locked' : '') + (fresh ? ' fresh' : ''), type:'button', 'aria-pressed': String(getVal()===id), 'aria-label': locked ? label + ' (låst)' : fresh ? label + ' (ny)' : label,
      on:{ click: () => { if (locked) return lockedTap(); if (fresh){ clearFresh(cat, id); renderTabs(); renderModes(); }
        if (getVal()!==id) change(st => apply(st, id)); else if (fresh) renderPanel(); } } },
      [ pic(pv, vb), el('span', {}, label), locked ? lockBadge() : null, fresh ? newTag() : null ]));
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
    const locked = !isFree(cat, id), fresh = !locked && isFresh(cat, id);
    if (fresh) grid.classList.add('has-fresh');
    const on = !!holder(cur.st)[id];
    const pv = clone(cur.st); holder(pv)[id] = holder(cur.st)[id] || a.color;
    grid.append(el('button', { class:'tile' + (on && getActive()===id ? ' active' : '') + (locked ? ' locked' : '') + (fresh ? ' fresh' : ''), type:'button', 'aria-pressed': String(on), 'aria-label': locked ? a.label + ' (låst)' : fresh ? a.label + ' (ny)' : a.label,
      on:{ click: () => { if (locked) return lockedTap(); if (fresh){ clearFresh(cat, id); renderTabs(); renderModes(); }
        change(st => { const h = holder(st); if (on && getActive()===id){ delete h[id]; setActive(null); } else { if (!on){ h[id] = a.color;
          if (cat === 'acc'){ const off = accConflicts(id).filter(x => h[x]); off.forEach(x => delete h[x]); if (off.length) toast(`${a.label} tog ${off.map(x => ACC[x].label.toLowerCase()).join(' og ')} af`); } }
          setActive(id); } }); } } },
      [ pic(pv, vbOf(id)), el('span', {}, a.label), locked ? lockBadge() : null, fresh ? newTag() : null ]));
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
    colorsSec('Øjenfarve', EYES, () => cur.st.eyes.color, (st,v) => st.eyes.color = v),
    optionsSec('Pupiller', entries(PUPILS), () => cur.st.eyes.pupil, (st,v) => st.eyes.pupil = v, VB.eye, 'pupil') ],
  ansigt: () => [
    optionsSec('Mund', entries(LIPSHAPES), () => cur.st.mk.lipShape, (st,v) => st.mk.lipShape = v, VB.lips, 'lip'),
    colorsSec('Læbefarve', LIPS, () => cur.st.mk.lips, (st,v) => st.mk.lips = v),
    colorsSec('Røde kinder', BLUSH, () => cur.st.mk.blush, (st,v) => st.mk.blush = v, true),
    optionsSec('Ansigtsmærke', entries(MARKS), () => cur.st.mk.mark, (st,v) => st.mk.mark = v, VB.face, 'mark'),
    cur.st.mk.mark !== 'ingen' ? colorsSec('Farve på mærket', COLORS.concat(['#B07A45','#8A5A35']), () => cur.st.mk.markColor, (st,v) => st.mk.markColor = v) : null ],
  pande: () => [ optionsSec('Pandehår', entries(FRONT), () => cur.st.front, (st,v) => st.front = v, VB.head, 'front') ],
  bag: () => [ optionsSec('Baghår', entries(BACK), () => cur.st.back, (st,v) => st.back = v, VB.hair, 'back') ],
  haarfarve: () => [
    colorsSec('Hårfarve', HAIR, () => cur.st.hair.a, (st,v) => st.hair.a = v),
    toggleSec('To farver (farvede spidser)', () => cur.st.hair.ombre, (st,v) => st.hair.ombre = v),
    cur.st.hair.ombre ? colorsSec('Farve i spidserne', HAIR, () => cur.st.hair.b, (st,v) => st.hair.b = v) : null,
    ['hestehale','fletninger'].includes(cur.st.back) ? colorsSec('Hårelastikker', COLORS, () => cur.st.hair.tie, (st,v) => st.hair.tie = v) : null ],
  hat: () => [
    optionsSec('Hat', entries(HATS), () => cur.st.hat.id, (st,v) => st.hat.id = v, VB.hat, 'hat'),
    cur.st.hat.id !== 'ingen' ? colorsSec('Farve', COLORS, () => cur.st.hat.a, (st,v) => st.hat.a = v) : null,
    cur.st.hat.id !== 'ingen' ? colorsSec('Bånd og pynt', COLORS, () => cur.st.hat.b, (st,v) => st.hat.b = v) : null ],
  kjole: () => [
    optionsSec('Kjole', entries(ROBES), () => cur.st.robe.id, (st,v) => st.robe.id = v, VB.robe, 'robe'),
    colorsSec('Farve', COLORS, () => cur.st.robe.a, (st,v) => st.robe.a = v),
    colorsSec('Kanter og mønster', COLORS, () => cur.st.robe.b, (st,v) => st.robe.b = v) ],
  kappe: () => [
    optionsSec('Kappe', entries(CAPES), () => cur.st.cape.id, (st,v) => st.cape.id = v, VB.cape, 'cape'),
    cur.st.cape.id !== 'ingen' ? colorsSec('Farve', COLORS, () => cur.st.cape.a, (st,v) => st.cape.a = v) : null,
    cur.st.cape.id !== 'ingen' ? colorsSec('Foer', COLORS, () => cur.st.cape.b, (st,v) => st.cape.b = v) : null ],
  sko: () => [
    optionsSec('Fodtøj', entries(BOOTS), () => cur.st.boots.id, (st,v) => st.boots.id = v, VB.shoes, 'boots'),
    colorsSec('Farve', COLORS, () => cur.st.boots.a, (st,v) => st.boots.a = v),
    colorsSec('Detaljer', COLORS, () => cur.st.boots.b, (st,v) => st.boots.b = v) ],
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
function renderStage(){ $('#stageImg').src = svgUrl(renderDoll(cur.st, { bg:true, bg1:'#3E3270', bg2:'#1E1838', anim: !calm, viewBox: stageViewBox() })); }
function renderModes(){
  document.querySelectorAll('.mode').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    b.classList.toggle('has-fresh', catsHaveFresh(b.dataset.mode === 'dyr' ? ['pet','petpat','petacc'] : ['front','back','robe','cape','hat','boots','acc','pupil','lip','mark'])); });
  $('#tabs').classList.toggle('pet', mode === 'dyr');
}
function setMode(m){ if (m === mode) return; mode = m; sfx.pick(); renderModes(); renderStage(); zoomAnim(); renderTabs(); renderPanel(true); }
function renderTabs(){
  const nav = $('#tabs'); nav.innerHTML = '';
  const list = mode === 'dyr' ? PET_TABS : DOLL_TABS, now = mode === 'dyr' ? petTab : tab;
  for (const [id, label, icon] of list)
    nav.append(el('button', { class:'tab' + (TAB_CATS[id] && catsHaveFresh(TAB_CATS[id]) ? ' has-fresh' : ''), type:'button', role:'tab', 'aria-selected': String(id===now), html: icon + `<span>${label}</span>`,
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
  if (opts.tab && TAB_CONTENT[opts.tab]) tab = opts.tab; if (opts.petTab && TAB_CONTENT[opts.petTab]){ petTab = opts.petTab; mode = 'dyr'; }
  gameDress = opts.game || null;
  const g = !!gameDress;
  $('#editor').classList.toggle('in-game', g);
  $('#gameTheme').hidden = !g; $('#doneBtn').hidden = !g; $('#randBtn').hidden = g;
  $('#gameTheme').textContent = g ? 'Tema: ' + gameDress.theme.name : '';
  $('#backLabel').textContent = g ? 'Afbryd' : 'Garderoben';
  $('#nameInput').readOnly = g;
  renderModes(); showScreen('#editor'); playMusic('byen');
  $('#nameInput').value = cur.name; updateUndo(); renderStage(); renderTabs(); renderPanel(true); placeBulbs(); sfx.open();
}
function newFigure(){
  let n = figures.length + 1; while (figures.some(f => f.name === 'Dukke ' + n)) n++;
  const f = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name: 'Dukke ' + n, st: clone(DEFAULT_STATE), t: Date.now() };
  figures.unshift(f); saveAll(); tab = 'hud'; openEditor(f);
  return f;
}
