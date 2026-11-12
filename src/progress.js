/* ================= Stjerner, låse og hvad der findes ================= */
/* PUPILS, LIPSHAPES og MARKS ligger i figur.js */

const FREE = {
  front:['side','lige','midt'], back:['langt','kort','hestehale'], robe:['stjerner','knapper','kort'], cape:['ingen','lang','kort'], hat:['ingen','spids','hue'],
  boots:['snoer','spidse'], acc:['stav','baelte','toerklaede'], pupil:['rund','glimt'], lip:['smil','pust'],
  mark:['ingen','fregner','hjerte'], pet:['ingen','kat','hund'], petpat:['ingen','pletter'], petacc:['halsbaand'],
};
const simple = (label, obj, getK, setK, vb, fallback, extra={}) => ({ label, ids: () => Object.keys(obj), name: k => (typeof obj[k]==='string' ? obj[k] : obj[k].label), get: getK, set: setK, apply: setK, vb: () => vb, fallback, ...extra });
const CAT_INFO = {
  front: simple('Pandehår', FRONT, st=>st.front, (st,v)=>{st.front=v;}, VB.head, 'side'),
  back: simple('Baghår', BACK, st=>st.back, (st,v)=>{st.back=v;}, VB.hair, 'langt'),
  robe: simple('Kjole', ROBES, st=>st.robe.id, (st,v)=>{st.robe.id=v;}, VB.robe, 'stjerner'),
  cape: simple('Kappe', CAPES, st=>st.cape.id, (st,v)=>{st.cape.id=v;}, VB.cape, 'ingen'),
  hat: simple('Hat', HATS, st=>st.hat.id, (st,v)=>{st.hat.id=v;}, VB.hat, 'ingen'),
  boots: simple('Fodtøj', BOOTS, st=>st.boots.id, (st,v)=>{st.boots.id=v;}, VB.shoes, 'snoer'),
  pupil: simple('Pupiller', PUPILS, st=>st.eyes.pupil, (st,v)=>{st.eyes.pupil=v;}, VB.eye, 'rund'),
  lip: simple('Mund', LIPSHAPES, st=>st.mk.lipShape, (st,v)=>{st.mk.lipShape=v;}, VB.lips, 'smil'),
  mark: simple('Ansigtsmærke', MARKS, st=>st.mk.mark, (st,v)=>{st.mk.mark=v;}, VB.face, 'ingen'),
  pet: simple('Kæledyr', PET_KINDS, st=>st.pet.kind, (st,v)=>{st.pet.kind=v;}, VB.pet, 'kat', { petOnly:true }),
  petpat: simple('Dyremønster', PET_PATTERNS, st=>st.pet.pattern, (st,v)=>{st.pet.pattern=v;}, VB.pet, 'ingen', { petOnly:true }),
  acc: { label:'Tilbehør', ids: () => Object.keys(ACC), name: k => ACC[k].label, multi:true, get: st=>st.acc, apply: (st,k)=>{ st.acc[k] = st.acc[k] || ACC[k].color; }, vb: k => ACC_VB[k] || VB.full },
  petacc: { label:'Dyretilbehør', ids: () => Object.keys(PET_ACC), name: k => PET_ACC[k].label, multi:true, get: st=>st.pet.acc, apply: (st,k)=>{ st.pet.acc[k] = st.pet.acc[k] || PET_ACC[k].color; }, vb: () => VB.pet, petOnly:true },
};

function loadProg(){ const p = store.get(KEY_PROG, null); return (p && typeof p === 'object') ? { stars: Math.max(0, +p.stars || 0), unlocked: Array.isArray(p.unlocked) ? p.unlocked : [], fresh: Array.isArray(p.fresh) ? p.fresh : [], room: (p.room && typeof p.room === 'object') ? p.room : null, potions: Math.max(0, +p.potions || 0), flights: Math.max(0, +p.flights || 0) } : { stars:0, unlocked:[], fresh:[], room:null, potions:0, flights:0 }; }
let prog = loadProg();
const saveProg = () => store.set(KEY_PROG, prog);
/* nye ting pulserer i skaberen, indtil man har trykket på dem */
const isFresh = (cat, id) => prog.fresh.includes(cat + ':' + id);
function clearFresh(cat, id){ const k = cat + ':' + id; if (prog.fresh.includes(k)){ prog.fresh = prog.fresh.filter(x => x !== k); saveProg(); } }
const TAB_CATS = { oejne:['pupil'], ansigt:['lip','mark'], pande:['front'], bag:['back'], kjole:['robe'], kappe:['cape'], hat:['hat'], sko:['boots'], tilbehoer:['acc'], dyr:['pet'], pels:['petpat'], dyretilbehoer:['petacc'] };
const catsHaveFresh = cats => prog.fresh.some(k => cats.includes(k.split(':')[0]));
const isFree = (cat, id) => (FREE[cat]||[]).includes(id) || prog.unlocked.includes(cat + ':' + id);
function lockedList(){ const out = []; for (const [cat, info] of Object.entries(CAT_INFO)) for (const id of info.ids()) if (!isFree(cat, id)) out.push([cat, id]); return out; }
function unlockAll(){ prog.unlocked = []; for (const [cat, info] of Object.entries(CAT_INFO)) for (const id of info.ids()) if (!(FREE[cat]||[]).includes(id)) prog.unlocked.push(cat + ':' + id); for (const [c, id] of roomLocked()) prog.unlocked.push(c + ':' + id); saveProg(); }
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
