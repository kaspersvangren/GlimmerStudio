/* ================= Stjerner, låse og hvad der findes ================= */
const PUPILS = { rund:'Runde', hjerte:'Hjerter', stjerne:'Stjerner', glimt:'Glimt' };
const LINERS = { ingen:'Ingen', bloed:'Blød', vinge:'Vinge' };
const LIPSHAPES = { pust:'Kyssemund', smil:'Smil', grin:'Stort grin' };
const MARKS = { ingen:'Intet', hjerte:'Hjerte', stjerne:'Stjerne', fregner:'Fregner', glimmer:'Glimmer' };

const FREE = {
  front:['boelge','lige','kortside'], back:['rottehaler','page','kort'], top:['stjerne','haettetroeje','striber'], bottom:['plisse','shorts','jeans'],
  shoes:['sneakers','ballerina','stoevler'], acc:['sloejfe','halskaede','kasket'], pupil:['rund','glimt'], liner:['ingen','bloed'], lip:['pust','smil'],
  mark:['ingen','hjerte','fregner'], pet:['ingen','kat','hund'], petpat:['ingen','pletter'], petacc:['halsbaand'],
};
const simple = (label, obj, getK, setK, vb, fallback, extra={}) => ({ label, ids: () => Object.keys(obj), name: k => (typeof obj[k]==='string' ? obj[k] : obj[k].label), get: getK, set: setK, apply: setK, vb: () => vb, fallback, ...extra });
const CAT_INFO = {
  front: simple('Pandehår', FRONT, st=>st.front, (st,v)=>{st.front=v;}, VB.head, 'boelge'),
  back: simple('Baghår', BACK, st=>st.back, (st,v)=>{st.back=v;}, VB.hair, 'rottehaler'),
  top: simple('Overdel', TOPS, st=>st.top.id, (st,v)=>{st.top.id=v;}, VB.top, 'stjerne'),
  bottom: simple('Underdel', BOTTOMS, st=>st.bottom.id, (st,v)=>{st.bottom.id=v;}, VB.bottom, 'plisse'),
  shoes: simple('Sko', SHOES, st=>st.shoes.id, (st,v)=>{st.shoes.id=v;}, VB.shoes, 'sneakers'),
  pupil: simple('Pupiller', PUPILS, st=>st.eyes.pupil, (st,v)=>{st.eyes.pupil=v;}, VB.eye, 'rund'),
  liner: simple('Eyeliner', LINERS, st=>st.mk.liner, (st,v)=>{st.mk.liner=v;}, VB.eye, 'bloed'),
  lip: simple('Mund', LIPSHAPES, st=>st.mk.lipShape, (st,v)=>{st.mk.lipShape=v;}, VB.lips, 'pust'),
  mark: simple('Ansigtsmærke', MARKS, st=>st.mk.mark, (st,v)=>{st.mk.mark=v;}, VB.face, 'ingen'),
  pet: simple('Kæledyr', PET_KINDS, st=>st.pet.kind, (st,v)=>{st.pet.kind=v;}, VB.pet, 'kat', { petOnly:true }),
  petpat: simple('Dyremønster', PET_PATTERNS, st=>st.pet.pattern, (st,v)=>{st.pet.pattern=v;}, VB.pet, 'ingen', { petOnly:true }),
  acc: { label:'Tilbehør', ids: () => Object.keys(ACC), name: k => ACC[k].label, multi:true, get: st=>st.acc, apply: (st,k)=>{ st.acc[k] = st.acc[k] || ACC[k].color; }, vb: k => ACC_VB[k] || VB.full },
  petacc: { label:'Dyretilbehør', ids: () => Object.keys(PET_ACC), name: k => PET_ACC[k].label, multi:true, get: st=>st.pet.acc, apply: (st,k)=>{ st.pet.acc[k] = st.pet.acc[k] || PET_ACC[k].color; }, vb: () => VB.pet, petOnly:true },
};

function loadProg(){ const p = store.get(KEY_PROG, null); return (p && typeof p === 'object') ? { stars: Math.max(0, +p.stars || 0), unlocked: Array.isArray(p.unlocked) ? p.unlocked : [] } : { stars:0, unlocked:[] }; }
let prog = loadProg();
const saveProg = () => store.set(KEY_PROG, prog);
const isFree = (cat, id) => (FREE[cat]||[]).includes(id) || prog.unlocked.includes(cat + ':' + id);
function lockedList(){ const out = []; for (const [cat, info] of Object.entries(CAT_INFO)) for (const id of info.ids()) if (!isFree(cat, id)) out.push([cat, id]); return out; }
function unlockAll(){ prog.unlocked = []; for (const [cat, info] of Object.entries(CAT_INFO)) for (const id of info.ids()) if (!(FREE[cat]||[]).includes(id)) prog.unlocked.push(cat + ':' + id); saveProg(); }
function enforce(st){
  for (const [cat, info] of Object.entries(CAT_INFO)){
    if (info.multi){ const o = info.get(st) || {}; for (const k of Object.keys(o)) if (!isFree(cat, k)) delete o[k]; }
    else if (!isFree(cat, info.get(st))) info.set(st, info.fallback);
  }
  return st;
}
function addStars(n){ prog.stars = Math.max(0, prog.stars + n); saveProg(); updateStarPills(); }
function updateStarPills(){ document.querySelectorAll('.starpill .n').forEach(e => { e.textContent = prog.stars; }); }
const starPill = () => el('span', { class:'starpill', title:'Dine stjerner', html: STAR_SVG + `<span class="n">${prog.stars}</span>` });
