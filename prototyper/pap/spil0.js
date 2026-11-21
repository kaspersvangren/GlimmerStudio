/* ============ spillets tilstand: det tøj heksen har på; gemmes i browseren, så det er der næste gang ============ */
const SPIL={look:{},pause:false,rebake:false,room:null,arrive(){}};
try{const s=JSON.parse(localStorage.getItem('magiske-mig-pap')||'null');if(s&&s.look)for(const k of['hat','hår','tøj','kappe','tilbehør'])if(typeof s.look[k]==='string')SPIL.look[k]=s.look[k]}catch(_){}
SPIL.save=()=>{try{localStorage.setItem('magiske-mig-pap',JSON.stringify({look:SPIL.look}))}catch(_){}};
