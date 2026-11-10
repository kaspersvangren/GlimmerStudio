/* ================= Tilfældige figurer og gæster ================= */
const NAMES_G = ['Ida','Freja','Alma','Ella','Liva','Nora','Clara','Emma','Sofia','Maja','Luna','Esther','Vilma','Karla','Asta','Olivia','Lærke','Silje'];
const NAMES_B = ['Oscar','Carl','Noah','Elias','Malthe','Aksel','Theo','Lucas','Vilmer','Emil','Storm','Alfred','Otto','Bertram','Hugo','Anton','Viggo','Johan'];
const BOY = { front:['kortside','kortkrol','pjusket','side','ingen'], back:['kort','kort','kortkrol','page'], top:['stjerne','haettetroeje','striber','jakke'],
  bottom:['shorts','jeans'], shoes:['sneakers','stoevler','rulle','sandaler'], acc:['kasket','butterfly','briller','armbaand','stav'] };
const NATURAL_HAIR = HAIR.slice(0, 10);

function allowedIds(cat, pool, pref){
  const all = CAT_INFO[cat].ids();
  const ok = id => pool !== 'unlocked' || isFree(cat, id);
  let list = (pref ? pref.filter(i => all.includes(i)) : all).filter(ok);
  if (!list.length) list = all.filter(ok);
  return list;
}
function randomState({ pool='all', boy=false } = {}){
  const A = (cat, pref) => allowedIds(cat, pool, pref);
  const st = clone(DEFAULT_STATE);
  st.skin = Math.random() < 0.9 ? pick(SKIN.slice(0,12)) : pick(SKIN.slice(12));
  st.eyes = { color: pick(EYES), pupil: pick(A('pupil', boy ? ['rund','glimt'] : null)) };
  if (boy) st.mk = { shadow:null, glitter:false, liner: pick(A('liner', ['ingen'])), blush: Math.random()<0.5 ? '#FFB3B3' : null, lips: pick(['#C77B6A','#E8957F','#D99A8A']),
    lipShape: pick(A('lip', ['smil','grin'])), mark: pick(A('mark', ['ingen','ingen','fregner'])), markColor:'#A86B42' };
  else st.mk = { shadow: Math.random()<0.85 ? pick(SHADOW) : null, glitter: Math.random()<0.6, liner: pick(A('liner')), blush: Math.random()<0.85 ? pick(BLUSH) : null,
    lips: pick(LIPS), lipShape: pick(A('lip')), mark: pick(A('mark', ['ingen','ingen','hjerte','stjerne','fregner','glimmer'])), markColor: pick(COLORS) };
  st.front = pick(A('front', boy ? BOY.front : null)); st.back = pick(A('back', boy ? BOY.back : null));
  const ha = boy && Math.random() < 0.8 ? pick(NATURAL_HAIR) : pick(HAIR);
  st.hair = { a: ha, b: pickOther(HAIR, ha), ombre: Math.random() < (boy ? 0.1 : 0.5), tie: pick(COLORS) };
  const ta = pick(COLORS), ba = pickOther(COLORS, ta), sa = pick(COLORS);
  st.top = { id: pick(A('top', boy ? BOY.top : null)), a: ta, b: pickOther(COLORS, ta) };
  st.bottom = { id: pick(A('bottom', boy ? BOY.bottom : null)), a: ba, b: pickOther(COLORS, ba) };
  st.shoes = { id: pick(A('shoes', boy ? BOY.shoes : null)), a: sa, b: pickOther(COLORS, sa) };
  st.acc = {};
  for (const k of shuffle(A('acc', boy ? BOY.acc : null)).slice(0, Math.floor(Math.random() * (boy ? 3 : 4)))){ if (k==='briller' && Math.random()<0.6) continue; st.acc[k] = pick(COLORS); }
  const fa = pick(FUR);
  st.pet = { kind: pick(A('pet').filter(k => k !== 'ingen')), a: fa, b: pickOther(FUR, fa), c: pick(COLORS), pattern: pick(A('petpat')), eyes: pick(EYES), acc: {}, name: '' };
  for (const k of A('petacc')) if (Math.random() < 0.3) st.pet.acc[k] = pick(COLORS);
  return st;
}
function randomGuest(taken=[]){
  const boy = Math.random() < 0.4;
  let name; do { name = pick(boy ? NAMES_B : NAMES_G); } while (taken.includes(name));
  return { name, st: randomState({ boy }), own: false };
}
/* en af hendes egne dukker – sjældent og derfor noget særligt */
function ownGuest(excludeId){
  const others = figures.filter(f => f.id !== excludeId);
  if (!others.length) return null;
  const f = pick(others);
  return { name: f.name, st: fixState(clone(f.st)), own: true };
}
