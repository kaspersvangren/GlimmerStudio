/* ============ spillet: fra kortet ind ad dørene og ud igen ============
   Kortet bliver liggende bagt, mens man er inde i et rum. Rummet bygges når man går ind, og ryddes helt væk når man går ud,
   så der kun er ét rum i hukommelsen ad gangen. Det tøj man vælger i Garderoben, har heksen på ude i byen. */
const DOORS={kollegie:{rum:'garderobe',navn:'Garderoben'},koncert:{rum:'koncert',navn:'Koncertsalen'}};
const HUSNAVN={broend:'Øksebrønden',skole:'Magiskolen',bobler:'Boblebutikken',dyr:'Dyreparken',drage:'Dragehulen',arkade:'Arkaden',stoevle:'Den Flyvende Støvle'};
const RUMHTML={garderobe:'<div id="panel"><div id="tabs" role="tablist" aria-label="Hvad vil du skifte?"></div><div id="opts"></div></div>',
  koncert:'<div id="songs" role="group" aria-label="Ønsk en sang"><span>Ønsk en sang</span></div>'};
const SLOTS=['hat','hår','tøj','kappe','tilbehør'];
const doorEl=document.getElementById('door'),doorT=document.getElementById('doorT'),rumEl=document.getElementById('rum'),hjemEl=document.getElementById('hjem'),toastEl=document.getElementById('toast');
let toastT=0;const toast=txt=>{toastEl.textContent=txt;toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.hidden=true},2600)};
/* alt hvad rummet selv har malet og bygget, slippes igen; det fælles papir (som byen også bruger) bliver liggende */
function disposeRoom(room,matsBefore){const keep=new Set(MATS.values()),seen=new Set(),shared=new Set();for(const k in PAPER){shared.add(PAPER[k].tex);shared.add(PAPER[k].btex)}
  for(const sc of room.scenes){sc.traverse(o=>{if(o.geometry&&!o.isSprite)o.geometry.dispose();
      for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){if(keep.has(m)||seen.has(m))continue;seen.add(m);
        for(const k of['map','bumpMap','normalMap','roughnessMap','emissiveMap','alphaMap'])if(m[k]&&m[k].dispose&&!shared.has(m[k]))m[k].dispose();m.dispose()}
      if(o.isLight&&o.shadow&&o.shadow.map){o.shadow.map.dispose();o.shadow.map=null}});
    sc.environment=null;sc.clear()}
  /* papirfarver som kun dette rum brugte, glemmes også, så listen ikke vokser for hvert besøg */
  for(const[k,m]of[...MATS])if(!matsBefore.has(k)){m.dispose();MATS.delete(k)}
  room.ST.dispose()}
function enter(d){if(SPIL.room)return;SPIL.pause=true;const t0=performance.now(),ctx={alive:true,look:{},room:null,env:scene.environment,mats:new Set(MATS.keys())};
  for(const k of SLOTS)ctx.look[k]=HEKS.L[k];
  ctx.onLook=(k,v)=>{SPIL.look[k]=v;SPIL.save()};
  ctx.ready=()=>{SPIL.roomMs=Math.round(performance.now()-t0);doorEl.classList.add('gone');hjemEl.hidden=false};
  ctx.fail=v=>{if(!v)return;doorT.textContent=v;hjemEl.hidden=false};
  ctx.msg={classList:{add(){ctx.ready()}}};ctx.msgN={set textContent(v){ctx.fail(v)}};
  SPIL.room={d,ctx};document.body.dataset.rum=d.rum;doorT.textContent=`Går ind i ${d.navn} …`;doorEl.classList.remove('gone');rumEl.innerHTML=RUMHTML[d.rum];
  setTimeout(()=>{try{ROOMS[d.rum](ctx)}catch(e){console.error(e);ctx.fail('Fejl: '+e.message)}},320)}
function leave(){const r=SPIL.room;if(!r||r.leaving)return;r.leaving=true;hjemEl.hidden=true;doorT.textContent='Går ud i byen …';doorEl.classList.remove('gone');
  setTimeout(()=>{r.ctx.alive=false;try{if(r.ctx.room)disposeRoom(r.ctx.room,r.ctx.mats)}catch(e){console.error(e)}
    rumEl.innerHTML='';delete document.body.dataset.rum;
    renderer.setRenderTarget(null);renderer.setClearColor('#0d0a12');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;
    for(const k of SLOTS)if(SPIL.look[k]!==undefined&&HEKS.L[k]!==SPIL.look[k])HEKS.set(k,SPIL.look[k]);
    SPIL.room=null;SPIL.pause=false;if(SPIL.rebake){SPIL.rebake=false;bake()}
    requestAnimationFrame(()=>requestAnimationFrame(()=>doorEl.classList.add('gone')))},320)}
hjemEl.addEventListener('click',leave);
SPIL.arrive=name=>{const d=DOORS[name];if(d)enter(d);else if(HUSNAVN[name])toast(`${HUSNAVN[name]} åbner snart`)};
SPIL.enter=n=>enter(DOORS[n]);SPIL.leave=leave;SPIL.info=()=>Object.assign({programs:renderer.info.programs.length},renderer.info.memory);SPIL.heks=()=>Object.fromEntries(SLOTS.map(k=>[k,HEKS.L[k]]));window.__spil=SPIL;
