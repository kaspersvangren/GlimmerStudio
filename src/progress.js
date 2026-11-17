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

/* kladder (nye ting, der ikke er godkendt endnu) er ikke med i spillet */
for (const [cat, info] of Object.entries(CAT_INFO)){ const all = info.ids; info.ids = () => all().filter(id => !isKladde(cat, id)); }

function loadProg(){ const p = store.get(KEY_PROG, null); return (p && typeof p === 'object') ? { stars: Math.max(0, +p.stars || 0), unlocked: Array.isArray(p.unlocked) ? p.unlocked : [], fresh: Array.isArray(p.fresh) ? p.fresh : [], room: (p.room && typeof p.room === 'object') ? p.room : null, potions: Math.max(0, +p.potions || 0), flights: Math.max(0, +p.flights || 0), jumps: Math.max(0, +p.jumps || 0), name: typeof p.name === 'string' ? p.name : '', intro: !!p.intro, billetter: Math.max(0, +p.billetter || 0) } : { stars:0, unlocked:[], fresh:[], room:null, potions:0, flights:0, jumps:0, name:'', intro:false, billetter:0 }; }
let prog = loadProg();
const saveProg = () => store.set(KEY_PROG, prog);
/* nye ting pulserer i skaberen, indtil man har trykket på dem */
const isFresh = (cat, id) => prog.fresh.includes(cat + ':' + id);
function clearFresh(cat, id){ const k = cat + ':' + id; if (prog.fresh.includes(k)){ prog.fresh = prog.fresh.filter(x => x !== k); saveProg(); } }
const TAB_CATS = { oejne:['pupil'], ansigt:['lip','mark'], pande:['front'], bag:['back'], kjole:['robe'], kappe:['cape'], hat:['hat'], sko:['boots'], tilbehoer:['acc'], dyr:['pet'], pels:['petpat'], dyretilbehoer:['petacc'] };
const catsHaveFresh = cats => prog.fresh.some(k => cats.includes(k.split(':')[0]));
const isFree = (cat, id) => (FREE[cat]||[]).includes(id) || prog.unlocked.includes(cat + ':' + id);
/* præmier fra arkadens præmiebutik: de kommer aldrig i boblerne, men købes for billetter */
const PRAEMIER = [
  { cat:'acc', id:'hjertetryllestav', pris:30 }, { cat:'acc', id:'regnbuestav', pris:30 }, { cat:'acc', id:'blomsterstav', pris:50 },
  { cat:'acc', id:'sommerfuglestav', pris:50 }, { cat:'acc', id:'slikstav', pris:60 }, { cat:'acc', id:'stjernestav', pris:70 },
  { cat:'acc', id:'maanestav', pris:80 }, { cat:'acc', id:'krystalstav', pris:90 }, { cat:'acc', id:'vingestav', pris:100 },
];
const isPraemie = (cat, id) => PRAEMIER.some(p => p.cat === cat && p.id === id);
const praemierNu = () => PRAEMIER.filter(p => !isKladde(p.cat, p.id));
function lockedList(){ const out = []; for (const [cat, info] of Object.entries(CAT_INFO)) for (const id of info.ids()) if (!isFree(cat, id) && !isPraemie(cat, id)) out.push([cat, id]); return out; }
function unlockAll(){ prog.unlocked = []; for (const [cat, info] of Object.entries(CAT_INFO)) for (const id of info.ids()) if (!(FREE[cat]||[]).includes(id)) prog.unlocked.push(cat + ':' + id); for (const [c, id] of roomLocked()) prog.unlocked.push(c + ':' + id); saveProg(); }
function enforce(st){
  for (const [cat, info] of Object.entries(CAT_INFO)){
    if (info.multi){ const o = info.get(st) || {}; for (const k of Object.keys(o)) if (!isFree(cat, k)) delete o[k]; }
    else if (!isFree(cat, info.get(st))) info.set(st, info.fallback);
  }
  return st;
}
/* billetter vindes i arkaden og vises kun dér */
const TICKET_SVG = '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 5.5Q3 4 4.5 4H27.5Q29 4 29 5.5V9.2A2.8 2.8 0 0 0 29 14.8V18.5Q29 20 27.5 20H4.5Q3 20 3 18.5V14.8A2.8 2.8 0 0 0 3 9.2Z" fill="#FF8FC7" stroke="#B0306A" stroke-width="1.6" stroke-linejoin="round"/><path d="M21.5 5.5V18.5" stroke="#B0306A" stroke-width="1.2" stroke-dasharray="1.6 1.8"/><path d="M12 7.6l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z" fill="#FFF6D0" stroke="#B0306A" stroke-width=".9" stroke-linejoin="round"/></svg>';
function addBilletter(n){ prog.billetter = Math.max(0, (prog.billetter || 0) + n); saveProg(); document.querySelectorAll('.billetpill .n').forEach(e => { e.textContent = prog.billetter; }); }
const billetPill = () => el('span', { class:'starpill billetpill', title:'Dine billetter', html: TICKET_SVG + `<span class="n">${prog.billetter || 0}</span>` });
function addStars(n){ prog.stars = Math.max(0, prog.stars + n); saveProg(); updateStarPills(); }
function updateStarPills(){ document.querySelectorAll('.starpill .n').forEach(e => { e.textContent = prog.stars; }); }
const starPill = () => el('span', { class:'starpill', title:'Dine stjerner', html: STAR_SVG + `<span class="n">${prog.stars}</span>` });
