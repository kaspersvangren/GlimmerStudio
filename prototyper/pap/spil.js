/* ============ spillet: fra kortet ind ad dørene og ud igen ============
   Kortet bliver liggende bagt, mens man er inde i et rum. Rummet bygges når man går ind, og ryddes helt væk når man går ud,
   så der kun er ét rum i hukommelsen ad gangen. Det tøj man vælger i Garderoben, har heksen på ude i byen. */
const RUM={vaerelse:{navn:'Værelset',html:'<div id="panel" hidden><div id="tabs" role="tablist" aria-label="Hvad vil du lave om?"></div><div id="opts"></div></div>'},garderobe:{navn:'Garderoben',html:'<div id="panel"><div id="tabs" role="tablist" aria-label="Hvad vil du skifte?"></div><div id="opts"></div></div>'},
  koncert:{navn:'Koncertsalen',html:'<div id="songs" role="group" aria-label="Ønsk en sang"><span>Ønsk en sang</span></div>'},
  gang:{navn:'Skolen'},eliksir:{navn:'Eliksirtimen'},bobler:{navn:'Boblebutikken'},arkade:{navn:'Arkaden'},gnom:{navn:'Bank en gnom'}};
const DOORS={kollegie:'vaerelse',koncert:'koncert',skole:'gang',bobler:'bobler',arkade:'arkade'};
const HUSNAVN={broend:'Øksebrønden',skole:'Magiskolen',bobler:'Boblebutikken',dyr:'Dyreparken',drage:'Dragehulen',arkade:'Arkaden',stoevle:'Den Flyvende Støvle',klokke:'Klokketårnet'};
const SLOTS=['hat','hår','pande','mærke','pupil','mund','tøj','kappe','støvler','tilbehør'];
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
SPIL.giv=n=>{if(n>0)LYD.ding();LOG.row('stjerner',{n,ialt:Math.max(0,SPIL.stj+n),ting:SPIL.har.length});SPIL.stj=Math.max(0,SPIL.stj+n);SPIL.save();visStj();stjEl.classList.remove('hop');void stjEl.offsetWidth;stjEl.classList.add('hop')};
/* rummene ligger i en stak: fra Værelset kan man gå videre ind i Garderoben, og tilbage-knappen fører ét trin ud ad gangen */
const stack=[],paaHeks=Object.assign({},SPIL.farver);let busy=false,dyrNyt=false;
function openRoom(id){const t0=performance.now(),ctx={alive:true,look:{},room:null,env:scene.environment,mats:new Set(MATS.keys())};
  for(const k of SLOTS)ctx.look[k]=HEKS.L[k];Object.assign(ctx.look,SPIL.lookFuld());
  ctx.onLook=(k,v)=>{SPIL.look[k]=v;SPIL.save()};ctx.onCol=(k,v)=>{SPIL.farver[k]=v;SPIL.save()};ctx.dyr=Object.assign({},SPIL.dyr);ctx.onDyr=(k,v)=>{SPIL.dyr[k]=v;SPIL.save();dyrNyt=true};ctx.go=enter;ctx.say=toast;ctx.back=back;ctx.owns=SPIL.ejer;
  ctx.ready=()=>{SPIL.roomMs=Math.round(performance.now()-t0);LOG.skaerm(id);LOG.row('rum',Object.assign({id,ms:SPIL.roomMs},window.__rumtid||{}),id);LOG.flush();busy=false;doorEl.classList.add('gone');hjemEl.hidden=false};
  ctx.fail=v=>{if(!v)return;LOG.row('fejl',{besked:String(v).slice(0,300),rum:id});LOG.flush();busy=false;doorT.textContent=v;hjemEl.hidden=false};
  ctx.msg={classList:{add(){ctx.ready()}}};ctx.msgN={set textContent(v){ctx.fail(v)}};
  SPIL.room={id,ctx};document.body.dataset.rum=id;rumEl.innerHTML=RUM[id].html||'';hjemT.textContent=stack.length>1?RUM[stack[stack.length-2]].navn:'Byen';
  setTimeout(()=>{try{ROOMS[id](ctx)}catch(e){console.error(e);ctx.fail('Fejl: '+e.message)}},40)}
function closeRoom(){const r=SPIL.room;if(!r)return;r.ctx.alive=false;try{if(r.ctx.cleanup)r.ctx.cleanup();if(r.ctx.room)disposeRoom(r.ctx.room,r.ctx.mats)}catch(e){console.error(e)}rumEl.innerHTML='';SPIL.room=null}
function cover(txt,then){doorT.textContent=txt;doorEl.classList.remove('gone');hjemEl.hidden=true;toastEl.hidden=true;setTimeout(then,300)}
function toMap(){LOG.skaerm('by');delete document.body.dataset.rum;renderer.setRenderTarget(null);renderer.setClearColor('#0d0a12');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;
  for(const k of SLOTS)if(SPIL.look[k]!==undefined&&HEKS.L[k]!==SPIL.look[k])HEKS.set(k,SPIL.look[k]);
  for(const k in SPIL.farver)if(paaHeks[k]!==SPIL.farver[k]){paaHeks[k]=SPIL.farver[k];HEKS.setCol(k,SPIL.farver[k])}
  if(dyrNyt){dyrNyt=false;SPIL.nyKat()}
  SPIL.pause=false;if(SPIL.rebake){SPIL.rebake=false;bake()}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{busy=false;doorEl.classList.add('gone')}))}
function enter(id){if(busy||!ROOMS[id])return;LYD.doer();busy=true;SPIL.pause=true;stack.push(id);cover(`Går ind i ${RUM[id].navn} …`,()=>{closeRoom();openRoom(id)})}
function back(){if(busy||!SPIL.room)return;LYD.doer();busy=true;stack.pop();const to=stack[stack.length-1];cover(to?`Går ind i ${RUM[to].navn} …`:'Går ud i byen …',()=>{closeRoom();if(to)openRoom(to);else toMap()})}
const leave=back;hjemEl.addEventListener('click',back);
/* lyden kan slås fra og til */
/* notesknappen: til den der tester. Den tager et lille billede af skærmen, i det øjeblik man trykker, og gemmer det sammen med typen, teksten og hvor man står,
   samme sted som statistikken. Inde på Claude-siden kan der ikke gemmes, så dér er knappen væk. */
{const kn=document.getElementById('noteknap'),bx=document.getElementById('note'),fm=document.getElementById('noteF'),tx_=document.getElementById('noteTxt'),inf=document.getElementById('noteI'),tb=[...document.querySelectorAll('#noteT button')];let type='ser-forkert-ud',billede=null,sted=null;
  const kan=LOG.on||location.protocol==='file:';kn.hidden=!kan;
  const vis=()=>tb.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===type))),luk=()=>{bx.hidden=true;billede=null};
  const tag=()=>{try{const c=renderer.domElement,k=Math.min(1,560/c.width),o=document.createElement('canvas');o.width=Math.round(c.width*k);o.height=Math.round(c.height*k);o.getContext('2d').drawImage(c,0,0,o.width,o.height);return o.toDataURL('image/jpeg',.6)}catch(e){return null}};
  SPIL.note=(t,tekst)=>{const d={type:t,tekst:String(tekst||'').slice(0,600),sted,rum:stack.slice(),skaerm:`${innerWidth}x${innerHeight}`,look:SPIL.look,farver:SPIL.farver,dyr:SPIL.dyr,indretning:SPIL.rum,indretningFarver:SPIL.rumc,stjerner:SPIL.stj,har:SPIL.har.length,billede};LOG.row('note',d,stack.length?stack[stack.length-1]:'by');LOG.flush();return d};
  kn.addEventListener('click',()=>{sted=stack.length?stack[stack.length-1]:'by';const pn=document.getElementById('panel'),menu=document.querySelector('#tabs [aria-selected=true]');if(pn&&!pn.hidden&&menu)sted+=' · '+menu.textContent;
    /* billedet tages lige efter spillets næste tegning, før menuen her lægger sig over */
    requestAnimationFrame(()=>{billede=tag();inf.textContent=`Gemmer også: hvor du står (${sted}), hvad heksen har på, og et lille billede af skærmen, som den så ud lige nu.`;tx_.value='';vis();bx.hidden=false})});
  tb.forEach(b=>b.addEventListener('click',()=>{type=b.dataset.t;vis()}));document.getElementById('noteNej').addEventListener('click',luk);bx.addEventListener('pointerdown',e=>{if(e.target===bx)luk()});
  fm.addEventListener('submit',e=>{e.preventDefault();SPIL.note(type,tx_.value);luk();toast(LOG.on?'Noten er gemt':'Noten kan ikke gemmes her')})}
{const lb=document.getElementById('lydknap'),vis=()=>{lb.setAttribute('aria-pressed',String(LYD.til));lb.setAttribute('aria-label',LYD.til?'Slå lyden fra':'Slå lyden til')};vis();lb.addEventListener('click',()=>{LYD.skift();vis()})}
SPIL.arrive=name=>{const id=DOORS[name];if(id&&ROOMS[id])enter(id);else if(HUSNAVN[name])toast(`${HUSNAVN[name]} åbner snart`)};
SPIL.enter=n=>enter(DOORS[n]||n);window.LOGTEST=()=>LOG.nu();SPIL.stack=stack;SPIL.leave=leave;SPIL.info=()=>Object.assign({programs:renderer.info.programs.length},renderer.info.memory);SPIL.heks=()=>Object.fromEntries(SLOTS.map(k=>[k,HEKS.L[k]]));window.__spil=SPIL;
