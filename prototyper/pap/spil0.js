/* ============ spillets tilstand: tøjet heksen har på, værelsets indretning, stjerner og hvad man har fået; gemmes i browseren ============ */
const SPIL={look:{},rum:{},stj:0,har:[],pause:false,rebake:false,room:null,arrive(){}};
try{const s=JSON.parse(localStorage.getItem('magiske-mig-pap')||'null');if(s){if(s.look)for(const k of['hat','hår','tøj','kappe','tilbehør'])if(typeof s.look[k]==='string')SPIL.look[k]=s.look[k];
  if(s.rum)for(const k in s.rum)if(Number.isInteger(s.rum[k]))SPIL.rum[k]=s.rum[k];if(Number.isFinite(s.stj))SPIL.stj=Math.max(0,Math.floor(s.stj));if(Array.isArray(s.har))SPIL.har=s.har.filter(x=>typeof x==='string').slice(0,200);if(Number.isInteger(s.eliksir))SPIL.eliksir=s.eliksir}}catch(_){}
SPIL.save=()=>{try{localStorage.setItem('magiske-mig-pap',JSON.stringify({look:SPIL.look,rum:SPIL.rum,stj:SPIL.stj,har:SPIL.har,eliksir:SPIL.eliksir||0}))}catch(_){}};
/* det man kan få i Boblebutikken; resten har heksen fra starten */
SPIL.VARER=[['hat','nathat','Nattehatten'],['hat','eventyrhat','Eventyrhatten'],['hår','fletning','Fletningen'],['hår','bølger','Bølgerne'],['tøj','festkjole','Festkjolen'],['tøj','skovløber','Skovløber-tøjet'],['tøj','opdager','Opdager-tøjet'],['tøj','rejsekappe','Rejsefrakken'],['kappe','stjerne','Stjernekappen'],['kappe','kort','Læderkappen'],['tilbehør','rygsæk','Rygsækken'],['tilbehør','tørklæde','Tørklædet']];
SPIL.ejer=(k,v)=>!SPIL.VARER.some(w=>w[0]===k&&w[1]===v)||SPIL.har.includes(k+':'+v);
for(const k in SPIL.look)if(!SPIL.ejer(k,SPIL.look[k]))SPIL.har.push(k+':'+SPIL.look[k]);/* det hun allerede har på, er hendes */
