/* ============ tøjskift: det gamle stykke løftes af, det nye falder på plads ============ */
const CATS={
  hat:{list:HATS,holders:()=>[W.hat],build:buildHat,cache:[]},
  dress:{list:DRESSES,holders:()=>[W.cape,W.skirt,W.torso,W.upL,W.upR,W.loL,W.loR],build:buildDress,cache:[]},
  hair:{list:HAIRS,holders:()=>[W.hairBack,W.locks,W.bangs],build:buildHair,cache:[]}};
function apply(cat,v){const K=CATS[cat];
  if(!K.cache[v]){K.build(v);K.cache[v]=K.holders().map(h=>[...h.children])}
  else K.holders().forEach((h,i)=>{clear(h);K.cache[v][i].forEach(c=>h.add(c))})}
const swaps=[];
function change(cat,d){const K=CATS[cat];if(swaps.some(s=>s.cat===cat))return;sel[cat]=(sel[cat]+d+K.list.length)%K.list.length;swaps.push({cat,t0:time,done:false,dir:d});updateUI()}
function easeSwap(s){const e=time-s.t0,hs=CATS[s.cat].holders();let y=0,z=0,r=0;
  if(e<.3){const k=e/.3;y=7*k*k;z=2.2*k;r=.28*k*s.dir}
  else{if(!s.done){apply(s.cat,sel[s.cat]);s.done=true}const k=Math.min(1,(e-.3)/.42);y=8*(1-k)*(1-k);z=1.2*(1-k);r=-.18*(1-k)*s.dir;if(k>=1){const b=(e-.72)/.22;y=b<1?Math.sin(b*Math.PI)*.45:0}}
  hs.forEach(h=>{h.position.y=y;h.position.z=z;h.rotation.z=r});
  return e<.95}

/* ============ små gnister fra kuglen ============ */
const sparks=[];
const sparkCard=makeCard(outline(starPts(0,0,.7,.3).map(p=>[p[0],p[1],1]),1,.01),{t:.15,s:40,both:true,paint:P=>P.coat('#ffe27a',null,{bw:.2})});
function burst(){const o=new THREE.Vector3();W.orb.getWorldPosition(o);
  for(let i=0;i<10;i++){const m=sparkCard.clone();m.position.copy(o);scene.add(m);const a=R(TAU);sparks.push({m,vx:Math.cos(a)*R(5,11),vy:R(6,15),vz:R(-2,4),vr:R(-8,8),t:0})}}

/* ============ bevægelse: flydende, i hvert billede ============ */
let time=0,wave=-9,hop=-9,blinkW=2.2,blinkC=3.4,lookT=0,look=0,lookNext=3;
function pose(t,dt){
  /* heksen */
  W.body.rotation.z=.014*Math.sin(t*1.1);
  if(t>lookNext){lookT=[-.09,0,.08,0][Math.floor(R(4))];lookNext=t+R(3,6)}
  look+=(lookT-look)*Math.min(1,dt*5);
  W.head.rotation.z=look+.025*Math.sin(t*.8);
  for(const g of W.locks.children)g.rotation.z=(g.userData.s||1)*.05*Math.sin(t*1.5+(g.userData.s||1));
  W.cape.rotation.z=swaps.some(s=>s.cat==='dress')?W.cape.rotation.z:.008*Math.sin(t*.9);
  const w=t-wave;
  if(w<2.6){const up=Math.min(1,w/.35)*Math.min(1,(2.6-w)/.35);W.armL.rotation.z=mix(-.13,-2.55,up);W.elL.rotation.z=mix(.12,-.35+.55*Math.sin(w*13),up)}
  else{W.armL.rotation.z=-.13+.025*Math.sin(t*1.3);W.elL.rotation.z=.12}
  W.armR.rotation.z=.56;W.elR.rotation.z=.1;
  const bw=t%blinkW<.13;W.lids.forEach(l=>l.visible=bw);
  /* katten */
  C.tail.rotation.z=.22*Math.sin(t*1.6);C.head.rotation.z=.07*Math.sin(t*.85)+.04;
  const bc=t%blinkC<.13;C.lids.forEach(l=>l.visible=bc);
  const h=t-hop;C.root.position.y=h<.6?Math.sin(h/.6*Math.PI)*3.2:0;C.root.rotation.z=h<.6?.12*Math.sin(h/.6*TAU):0;
  /* kjolerne i skabet og vimplerne */
  for(const k of hangers)k.g.rotation.z=.04*Math.sin(t*.8+k.ph);
  for(const f of flags){f.g.rotation.x=.14*Math.sin(t*1.1+f.ph);f.g.rotation.z=.04*Math.sin(t*.7+f.ph)}}

/* ============ kamera ============ */
const cam=new THREE.PerspectiveCamera(28,1,8,520),DIST=96,camT={x:0,y:20};
const peek={x:0,y:0,tx:0,ty:0,drag:false,sx:0,sy:0,moved:0};
/* ingen efterbehandling: farverne tones direkte i tegningen, og vignetten er et fast lag oven på (koster intet) */
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);
  const asp=w/h;cam.aspect=asp;
  /* hele æsken skal kunne ses: 66 cm bred og 44 cm høj, uanset skærm */
  const side=matchMedia('(orientation:landscape)').matches&&w>700?1.32:1;
  /* højden skal altid rumme hele heksen fra fødder til hattespids (ca. 46 cm), også på en meget bred telefon */
  const H=side>1?Math.max(46,58*side/asp):Math.max(46,64/asp);cam.fov=2*Math.atan(H/2/DIST)*180/Math.PI;cam.updateProjectionMatrix();camT.x=side>1?Math.min(H*asp*.13,15):0;camT.y=side>1?21:19.5-H*.1}
new ResizeObserver(resize).observe(stage);

/* ============ tryk og træk ============ */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
const cvEl=renderer.domElement;
const within=(o,root)=>{for(;o;o=o.parent)if(o===root)return true;return false};
cvEl.addEventListener('pointerdown',e=>{peek.drag=true;peek.sx=e.clientX;peek.sy=e.clientY;peek.moved=0;try{cvEl.setPointerCapture(e.pointerId)}catch(_){}});
cvEl.addEventListener('pointermove',e=>{if(!peek.drag)return;const dx=e.clientX-peek.sx,dy=e.clientY-peek.sy;peek.moved=Math.max(peek.moved,Math.hypot(dx,dy));if(peek.moved<10)return;
  const k=1.6/Math.max(320,stage.clientWidth);peek.tx=clamp(-dx*k,-.7,.7);peek.ty=clamp(dy*k,-.1,.35);hintEl.classList.add('gone')});
const rel=e=>{if(peek.drag&&peek.moved<10&&e.type==='pointerup'){const r=cvEl.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);
    const hit=ray.intersectObjects([W.root,C.root],true)[0];
    if(hit){if(hit.object===W.orb||hit.object===W.glow)burst();else if(within(hit.object,C.root)){if(time-hop>.7)hop=time}else if(time-wave>2.7)wave=time;hintEl.classList.add('gone')}}
  peek.drag=false;peek.tx=peek.ty=0};
cvEl.addEventListener('pointerup',rel);cvEl.addEventListener('pointercancel',rel);

/* ============ knapperne ============ */
const hintEl=document.getElementById('hint');
function updateUI(){for(const cat of Object.keys(CATS)){const el=document.querySelector(`[data-cat="${cat}"] .val`);if(el)el.textContent=CATS[cat].list[sel[cat]].navn;
  document.querySelectorAll(`[data-cat="${cat}"] .dot`).forEach((d,i)=>d.classList.toggle('on',i===sel[cat]))}}
document.querySelectorAll('[data-cat]').forEach(box=>{const cat=box.dataset.cat;
  box.querySelector('.prev').addEventListener('click',()=>change(cat,-1));box.querySelector('.next').addEventListener('click',()=>change(cat,1))});
const viewBtns=document.querySelectorAll('[data-view]');
function setView(v){document.body.dataset.view=v;viewBtns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v))}
viewBtns.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
addEventListener('keydown',e=>{if(e.key==='ArrowRight')change('dress',1);if(e.key==='ArrowLeft')change('dress',-1);if(e.key==='ArrowUp')change('hat',1);if(e.key==='ArrowDown')change('hair',1)});

/* fuld skærm på langs, hvor browseren tillader det (Chrome gør, Claude-appen gør ikke) */
const fsBtn=document.getElementById('fs'),fsNote=document.getElementById('fsnote');
fsBtn.addEventListener('click',async()=>{try{if(document.fullscreenElement){await document.exitFullscreen();return}
  await document.documentElement.requestFullscreen({navigationUI:'hide'});try{await screen.orientation.lock('landscape')}catch(_){}}
  catch(_){fsNote.hidden=false;setTimeout(()=>{fsNote.hidden=true},7000)}});

/* ============ løkken ============ */
const meter=document.getElementById('meter');let mN=0,mT=0,mW=0,readyAt=0;
const PRMAX=Math.min(window.devicePixelRatio||1,2);let last=performance.now(),fN=0,fT=0,good=0,pr=renderer.getPixelRatio();
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000,dt=clamp(raw,0,.05);last=now;time+=dt;
  if(document.body.dataset.view==='nu')return;
  /* måleren: billeder i sekundet, langsomste billede og skarphed, opdateret hvert sekund */
  if(raw<.5){mN++;mT+=raw;mW=Math.max(mW,raw);if(mT>=1){meter.textContent=`${Math.round(mN/mT)} billeder/s · langsomste ${Math.round(mW*1000)} ms · skarphed ${pr.toFixed(2).replace('.',',')} · klar efter ${(readyAt/1000).toFixed(1).replace('.',',')} s`;mN=0;mT=0;mW=0}}
  /* skarpheden følger telefonen: ned, hvis den ikke kan holde ca. 50 billeder i sekundet, op igen, når der er luft */
  if(raw<.5&&!document.hidden){fT+=raw;if(++fN>=60){const avg=fT/fN;if(avg>.021&&pr>1){pr=Math.max(1,pr-.25);good=0;renderer.setPixelRatio(pr);resize()}else if(avg<.0135&&pr<PRMAX&&++good>=3){pr=Math.min(PRMAX,pr+.25);good=0;renderer.setPixelRatio(pr);resize()}fN=0;fT=0}}
  pose(time,dt);for(let i=swaps.length-1;i>=0;i--)if(!easeSwap(swaps[i])){CATS[swaps[i].cat].holders().forEach(h=>{h.position.set(0,0,0);h.rotation.z=0});swaps.splice(i,1)}
  /* lys og flammer flakker hele tiden, ikke i stop-motion */
  const fl=.5+.5*Math.sin(time*11.3)*Math.sin(time*7.1+1);candleLight.intensity=30+16*fl;flame.scale.set(1+.08*Math.sin(time*17),1+.16*fl,1);
  W.orbM.emissiveIntensity=1.15+.35*Math.sin(time*2.2);W.orbLight.intensity=60+22*Math.sin(time*2.2);const gs=8.4+.9*Math.sin(time*2.2);W.glow.scale.set(gs,gs,1);
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.t+=dt;s.vy-=26*dt;s.m.position.x+=s.vx*dt;s.m.position.y+=s.vy*dt;s.m.position.z+=s.vz*dt;s.m.rotation.z+=s.vr*dt;s.m.scale.setScalar(Math.max(.01,1-s.t/1.3));if(s.t>1.3){scene.remove(s.m);sparks.splice(i,1)}}
  peek.x+=(peek.tx-peek.x)*Math.min(1,dt*(peek.drag?14:4));peek.y+=(peek.ty-peek.y)*Math.min(1,dt*(peek.drag?14:4));
  const yaw=.06+peek.x,pit=.12+peek.y;
  cam.position.set(camT.x+DIST*Math.sin(yaw)*Math.cos(pit),camT.y+DIST*Math.sin(pit),WZ+DIST*Math.cos(yaw)*Math.cos(pit));cam.lookAt(camT.x,camT.y,WZ);
  renderer.render(scene,cam)}

/* alt tøj klippes og males, før scenen vises: hellere lidt længere ventetid end hak bagefter */
(async()=>{
  const jobs=[];for(const cat of Object.keys(CATS))for(let v=CATS[cat].list.length-1;v>=0;v--)jobs.push([cat,v]);
  const wait=()=>new Promise(r=>setTimeout(r,0));
  for(let i=0;i<jobs.length;i++){msgN.textContent=`${i+1} af ${jobs.length}`;await wait();apply(...jobs[i])}
  resize();updateUI();renderer.compile(scene,cam);
  window.__pap={W,C,sel,change,setView,time:()=>time,busy:()=>swaps.length};
  requestAnimationFrame(t=>{last=t;frame(t);requestAnimationFrame(()=>{readyAt=performance.now();msg.classList.add('gone')})})})();
