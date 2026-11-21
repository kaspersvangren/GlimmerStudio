/* ============ spillet: fra kortet ind ad dørene og ud igen ============
   Kortet bliver liggende bagt, mens man er inde i et rum. Rummet bygges når man går ind, og ryddes helt væk når man går ud,
   så der kun er ét rum i hukommelsen ad gangen. Det tøj man vælger i Garderoben, har heksen på ude i byen. */
const RUM={vaerelse:{navn:'Værelset'},garderobe:{navn:'Garderoben',html:'<div id="panel"><div id="tabs" role="tablist" aria-label="Hvad vil du skifte?"></div><div id="opts"></div></div>'},
  koncert:{navn:'Koncertsalen',html:'<div id="songs" role="group" aria-label="Ønsk en sang"><span>Ønsk en sang</span></div>'},
  gang:{navn:'Skolen'},eliksir:{navn:'Eliksirtimen'},bobler:{navn:'Boblebutikken'},arkade:{navn:'Arkaden'},gnom:{navn:'Bank en gnom'}};
const DOORS={kollegie:'vaerelse',koncert:'koncert',skole:'gang',bobler:'bobler',arkade:'arkade'};
const HUSNAVN={broend:'Øksebrønden',skole:'Magiskolen',bobler:'Boblebutikken',dyr:'Dyreparken',drage:'Dragehulen',arkade:'Arkaden',stoevle:'Den Flyvende Støvle',klokke:'Klokketårnet'};
const SLOTS=['hat','hår','tøj','kappe','tilbehør'];
const doorEl=document.getElementById('door'),doorT=document.getElementById('doorT'),rumEl=document.getElementById('rum'),hjemEl=document.getElementById('hjem'),hjemT=document.getElementById('hjemT'),toastEl=document.getElementById('toast'),stjN=document.getElementById('stjN'),stjEl=document.getElementById('stj');
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
/* stjernerne: tjenes i timerne og spillene, bruges i Boblebutikken */
const visStj=()=>{stjN.textContent=SPIL.stj};visStj();
SPIL.giv=n=>{SPIL.stj=Math.max(0,SPIL.stj+n);SPIL.save();visStj();stjEl.classList.remove('hop');void stjEl.offsetWidth;stjEl.classList.add('hop')};
/* rummene ligger i en stak: fra Værelset kan man gå videre ind i Garderoben, og tilbage-knappen fører ét trin ud ad gangen */
const stack=[];let busy=false;
function openRoom(id){const t0=performance.now(),ctx={alive:true,look:{},room:null,env:scene.environment,mats:new Set(MATS.keys())};
  for(const k of SLOTS)ctx.look[k]=SPIL.look[k]!==undefined?SPIL.look[k]:HEKS.L[k];
  ctx.onLook=(k,v)=>{SPIL.look[k]=v;SPIL.save()};ctx.go=enter;ctx.say=toast;ctx.back=back;ctx.owns=SPIL.ejer;
  ctx.ready=()=>{SPIL.roomMs=Math.round(performance.now()-t0);busy=false;doorEl.classList.add('gone');hjemEl.hidden=false};
  ctx.fail=v=>{if(!v)return;busy=false;doorT.textContent=v;hjemEl.hidden=false};
  ctx.msg={classList:{add(){ctx.ready()}}};ctx.msgN={set textContent(v){ctx.fail(v)}};
  SPIL.room={id,ctx};document.body.dataset.rum=id;rumEl.innerHTML=RUM[id].html||'';hjemT.textContent=stack.length>1?RUM[stack[stack.length-2]].navn:'Byen';
  setTimeout(()=>{try{ROOMS[id](ctx)}catch(e){console.error(e);ctx.fail('Fejl: '+e.message)}},40)}
function closeRoom(){const r=SPIL.room;if(!r)return;r.ctx.alive=false;try{if(r.ctx.cleanup)r.ctx.cleanup();if(r.ctx.room)disposeRoom(r.ctx.room,r.ctx.mats)}catch(e){console.error(e)}rumEl.innerHTML='';SPIL.room=null}
function cover(txt,then){doorT.textContent=txt;doorEl.classList.remove('gone');hjemEl.hidden=true;toastEl.hidden=true;setTimeout(then,300)}
function toMap(){delete document.body.dataset.rum;renderer.setRenderTarget(null);renderer.setClearColor('#0d0a12');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;
  for(const k of SLOTS)if(SPIL.look[k]!==undefined&&HEKS.L[k]!==SPIL.look[k])HEKS.set(k,SPIL.look[k]);
  SPIL.pause=false;if(SPIL.rebake){SPIL.rebake=false;bake()}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{busy=false;doorEl.classList.add('gone')}))}
function enter(id){if(busy||!ROOMS[id])return;busy=true;SPIL.pause=true;stack.push(id);cover(`Går ind i ${RUM[id].navn} …`,()=>{closeRoom();openRoom(id)})}
function back(){if(busy||!SPIL.room)return;busy=true;stack.pop();const to=stack[stack.length-1];cover(to?`Går ind i ${RUM[to].navn} …`:'Går ud i byen …',()=>{closeRoom();if(to)openRoom(to);else toMap()})}
const leave=back;hjemEl.addEventListener('click',back);
SPIL.arrive=name=>{const id=DOORS[name];if(id&&ROOMS[id])enter(id);else if(HUSNAVN[name])toast(`${HUSNAVN[name]} åbner snart`)};
SPIL.enter=n=>enter(DOORS[n]||n);SPIL.stack=stack;SPIL.leave=leave;SPIL.info=()=>Object.assign({programs:renderer.info.programs.length},renderer.info.memory);SPIL.heks=()=>Object.fromEntries(SLOTS.map(k=>[k,HEKS.L[k]]));window.__spil=SPIL;
