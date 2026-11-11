/* ================= Tilfældige figurer og gæster ================= */
const NAMES_G = ['Ida','Freja','Alma','Ella','Liva','Nora','Clara','Emma','Sofia','Maja','Luna','Esther','Vilma','Karla','Asta','Olivia','Lærke','Silje'];
const NAMES_B = ['Oscar','Carl','Noah','Elias','Malthe','Aksel','Theo','Lucas','Vilmer','Emil','Storm','Alfred','Otto','Bertram','Hugo','Anton','Viggo','Johan'];
const BOY = { front:['pjusket','tilbage','side','lige'], back:['kort','kort','kort','hestehale'], robe:['knapper','stjerner','maane'], acc:['stav','tryllestav','bog','baelte','toerklaede','briller'] };
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
  st.mk = { blush: Math.random() < (boy ? 0.5 : 0.85) ? pick(BLUSH) : null, lips: boy ? pick(['#C77B6A','#B85A5A','#A0526B']) : pick(LIPS), lipShape: pick(A('lip')),
    mark: pick(A('mark', boy ? ['ingen','ingen','fregner'] : ['ingen','ingen','fregner','hjerte','stjerne','glimmer'])), markColor: Math.random() < 0.5 ? '#B07A45' : pick(COLORS) };
  st.front = pick(A('front', boy ? BOY.front : null)); st.back = pick(A('back', boy ? BOY.back : null));
  const ha = Math.random() < (boy ? 0.8 : 0.5) ? pick(NATURAL_HAIR) : pick(HAIR);
  st.hair = { a: ha, b: pickOther(HAIR, ha), ombre: Math.random() < (boy ? 0.1 : 0.4), tie: pick(COLORS) };
  const ra = pick(COLORS), ca = pickOther(COLORS, ra), ha2 = Math.random() < 0.5 ? ca : pick(COLORS);
  st.robe = { id: pick(A('robe', boy ? BOY.robe : null)), a: ra, b: pick(['#F2C14E','#FFFFFF','#FFC02E', pick(COLORS)]) };
  st.cape = { id: Math.random() < 0.25 ? 'ingen' : pick(A('cape')), a: ca, b: pickOther(COLORS, ca) };
  st.hat = { id: Math.random() < 0.3 ? 'ingen' : pick(A('hat')), a: ha2, b: pickOther(COLORS, ha2) };
  st.boots = { id: pick(A('boots')), a: pick(['#8A4B2E','#5C3A24','#3A2340','#7E5236', pick(COLORS)]), b: pick(['#F2C14E', pick(COLORS)]) };
  st.acc = {};
  for (const k of shuffle(A('acc', boy ? BOY.acc : null)).slice(0, Math.floor(Math.random() * 4))){ if (k==='briller' && Math.random()<0.6) continue; st.acc[k] = k === 'baelte' ? pick(['#8A4B2E','#5C3A24','#3A2340']) : pick(COLORS); }
  st.acc = resolveLayers(st).acc;
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
