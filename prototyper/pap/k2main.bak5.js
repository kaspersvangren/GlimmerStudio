/* ============ heksen, katten og gåturene ============ */
const TOP=.3,SC=.36;
buildDress(0);buildHair(0);buildHat(0);
live.add(W.root);W.root.scale.setScalar(SC);W.orbLight.intensity=0;
live.add(C.root);C.root.scale.setScalar(SC);C.root.rotation.y=0;
const shadowTex=(()=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tx(c,false)})();
const blob=(w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;live.add(m);return m};
const walkers=[];
const W0={root:W.root,x:-10,z:12,tx:-10,tz:12,sp:9,face:1,ph:0,sc:SC,kind:'heks'},C0={root:C.root,x:-5,z:14,tx:-5,tz:14,sp:12,face:1,ph:0,sc:SC,kind:'kat'};
/* bygningernes grundflader: man kan ikke gå ind i dem; trykker man på en, går heksen hen til døren */
const HOUSES=[['skole',-24,24,-44,-20],['kollegie',-60,-33,-44,-2],['bobler',18,46,-20,5.5],['dyr',50,80,-30,-12],['koncert',-76,-48,24.5,44],['stoevle',-40,-12,25.5,44],['arkade',50,82,25.5,44],['drage',-96,-50,-44,-24]];
function houseAt(x,z){for(const h of HOUSES)if(x>h[1]&&x<h[2]&&z>h[3]&&z<h[4])return h;return null}
function clampWalk(x,z){x=clamp(x,-78,78);z=clamp(z,-22,36);
  const dx=x,dz=z,d=Math.hypot(dx/1.3,dz);if(d<7){const k=7/(d||1);x=dx*k;z=dz*k}
  const h=houseAt(x,z);if(h){const s=SPOTS[h[0]];return[s[0],s[1]]}return[x,z]}
/* svævende skridt (ca. 2,2 i sekundet): ét hop pr. skridtlængde, toppen af hoppet holdes lidt, og hoppene ebber ud, når figuren stopper */
const GAIT={heks:{len:4.1,h:.75},kat:{len:4.1,h:1.05},npc:{len:3.8,h:.5}};
function stepWalker(w,dt){
  const dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz),moving=d>.25,g=GAIT[w.kind];
  w.amp=(w.amp||0)+((moving?1:0)-(w.amp||0))*Math.min(1,dt*(moving?5:3));
  w.v=(w.v||0)+((moving?w.sp:0)-(w.v||0))*Math.min(1,dt*4);
  if(moving){const s=Math.min(d,Math.max(w.v,1.5)*dt);w.x+=dx/d*s;w.z+=dz/d*s;if(Math.abs(dx)>.3)w.face=dx>0?1:-1;w.ph+=s/g.len*Math.PI}
  else if(w.amp>.02){const r=w.ph%Math.PI;if(r>.05)w.ph+=Math.min(Math.PI-r,dt*2.5)}
  w.moving=moving;const bob=Math.pow(Math.abs(Math.sin(w.ph)),.6)*g.h*w.amp;
  w.root.position.set(w.x,TOP+.08+bob,w.z);w.root.scale.set(w.face*w.sc,w.sc,w.sc);w.root.rotation.z=.05*Math.cos(w.ph)*w.face*w.amp;
  w.sh.position.set(w.x,TOP+.12,w.z);const k=1-bob*.15;w.sh.scale.set(k,k,1)}

/* ============ stierne er et vejnet: heksen går ad stierne, katten følger hendes spor ============ */
const NET=(()=>{const N=[],E=[];
  const add=(x,z)=>{for(let i=0;i<N.length;i++)if(Math.hypot(N[i][0]-x,N[i][1]-z)<1.2)return i;N.push([x,z]);E.push(new Set());return N.length-1};
  const link=(a,b)=>{if(a!==b){E[a].add(b);E[b].add(a)}};
  const inPlaza=(x,z)=>Math.hypot(x/1.3,z)<8;
  /* pladsen: en ring uden om brønden */
  const ring=[];for(let k=0;k<16;k++){const a=k/16*TAU;ring.push(add(Math.cos(a)*10.4,Math.sin(a)*8))}
  ring.forEach((r,k)=>link(r,ring[(k+1)%16]));
  const nearRing=(x,z)=>ring.reduce((b,r)=>Math.hypot(N[r][0]-x,N[r][1]-z)<Math.hypot(N[b][0]-x,N[b][1]-z)?r:b,ring[0]);
  for(const cp of PATHS){let prev=-1,fromRing=false;
    for(const[x,z]of curve(cp,8)){
      if(inPlaza(x,z)){if(prev>=0)link(prev,nearRing(...N[prev]));prev=-1;fromRing=true;continue}
      const i=add(x,z);if(prev>=0)link(i,prev);else if(fromRing)link(i,nearRing(x,z));prev=i;fromRing=false}}
  const near=(x,z)=>{let b=0,bd=1e9;N.forEach((p,i)=>{const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;b=i}});return b};
  const dd=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  function route(x0,z0,x1,z1){
    if(Math.hypot(x1-x0,z1-z0)<10)return[[x1,z1]];
    const s=near(x0,z0),t=near(x1,z1),n=N.length,dist=new Float64Array(n).fill(1e9),from=new Int32Array(n).fill(-1),done=new Uint8Array(n);dist[s]=0;
    for(;;){let u=-1;for(let i=0;i<n;i++)if(!done[i]&&dist[i]<1e9&&(u<0||dist[i]<dist[u]))u=i;if(u<0||u===t)break;done[u]=1;
      for(const v of E[u]){const d=dist[u]+dd(N[u],N[v]);if(d<dist[v]){dist[v]=d;from[v]=u}}}
    if(dist[t]>=1e9)return[[x1,z1]];
    const out=[];for(let i=t;i>=0;i=from[i])out.unshift(N[i]);
    /* skær de første og sidste punkter fra, hvis de får heksen til at gå tilbage */
    const cur=[x0,z0],end=[x1,z1];
    while(out.length>1&&dd(cur,out[1])<dd(out[0],out[1]))out.shift();
    out.push(end);while(out.length>2&&dd(out[out.length-3],end)<dd(out[out.length-3],out[out.length-2]))out.splice(out.length-2,1);
    return out}
  return{N,E,route}})();
function goTo(x,z){[x,z]=clampWalk(x,z);W0.q=NET.route(W0.x,W0.z,x,z).map(p=>[p[0],p[1]]);[W0.tx,W0.tz]=W0.q.shift()}
const trail=[[C0.x,C0.z],[W0.x,W0.z]];

/* ============ kamera og bagning ============ */
const cam=new THREE.PerspectiveCamera(30,1,20,900);const LOOK=new THREE.Vector3(0,9,13),CD=250,PITCH=.6;
let baked=false,bakeMs=0;
/* zoom: byen bages som ét stort billede (ZOOM gange skærmen), og man ser et udsnit, som man kan trække rundt i */
const ZOOM=1.7;let big=null,FW=0,FH=0,VW=0,VH=0,vx=0,vy=0,velX=0,velY=0,dragT=-9;
const blitSrc=(off)=>({depthTest:true,depthWrite:true,depthFunc:THREE.AlwaysDepth,toneMapped:off,
  uniforms:{tColor:{value:null},tDepth:{value:null},uOff:{value:new THREE.Vector2(0,0)},uScl:{value:new THREE.Vector2(1,1)}},
  vertexShader:`uniform vec2 uOff;uniform vec2 uScl;varying vec2 vUv;void main(){vUv=uOff+uv*uScl;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform sampler2D tColor;uniform sampler2D tDepth;varying vec2 vUv;
void main(){gl_FragColor=texture2D(tColor,vUv);gl_FragDepth=texture2D(tDepth,vUv).x;
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
const blitMat=new THREE.ShaderMaterial(blitSrc(true)),copyMat=new THREE.ShaderMaterial(blitSrc(false));
const blitScene=new THREE.Scene(),copyScene=new THREE.Scene(),blitCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
for(const[sc,mat]of[[blitScene,blitMat],[copyScene,copyMat]]){const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;sc.add(q)}
renderer.setClearColor('#0d0a12');
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
/* udsnittet regnes ud til skærmen: forkanten af bordpladen nederst, flag og måne øverst, Koncertsal og Arkade med i siderne */
const FIT={front:[0,0,38],flag:[0,60,-28],moon:[58,67,-48],arkR:[82,15,28],koncL:[-76,15,27]};
function frameCam(){const w=stage.clientWidth,h=stage.clientHeight,asp=w/h;cam.aspect=asp;const v=new THREE.Vector3();let best=null;
  const place=(H,ly,lz)=>{cam.fov=2*Math.atan(H/2/CD)*180/Math.PI;cam.updateProjectionMatrix();cam.position.set(0,ly+CD*Math.sin(PITCH),lz+CD*Math.cos(PITCH));cam.lookAt(0,ly,lz);cam.updateMatrixWorld()};
  const sy=p=>(1-v.set(...p).project(cam).y)/2,sx=p=>(v.set(...p).project(cam).x+1)/2;
  for(let H=60;H<=200;H+=2){for(let ly=-20;ly<=70;ly+=1.5){place(H,ly,15);const f=sy(FIT.front),t=sy(FIT.flag),l=sx(FIT.koncL),r=sx(FIT.arkR);
      const bad=Math.max(0,f-.985)+Math.max(0,.93-f)+Math.max(0,.07-t)+Math.max(0,-.03-l)+Math.max(0,r-1.03);if(!best||bad<best.bad-1e-6||(Math.abs(bad-best.bad)<1e-6&&H<best.H))best={bad,H,ly}}
    if(best&&best.bad===0)break}
  place(best.H,best.ly,15)}
/* bages i fliser på skærmens størrelse, så den kantudglattede mellemstation aldrig bliver større end i dag */
function bake(){const t0=performance.now();const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  const fx=FW>VW?vx/(FW-VW):.5,fy=FH>VH?vy/(FH-VH):.6;
  renderer.setSize(w,h,false);cam.clearViewOffset();frameCam();const d=renderer.getDrawingBufferSize(new THREE.Vector2());
  VW=d.x;VH=d.y;const mx=renderer.capabilities.maxTextureSize,z=Math.min(ZOOM,mx/VW,mx/VH,Math.sqrt(9e6/(VW*VH)));FW=Math.round(VW*z);FH=Math.round(VH*z);
  const nx=Math.ceil(FW/VW-1e-3),ny=Math.ceil(FH/VH-1e-3),tw=Math.ceil(FW/nx),th=Math.ceil(FH/ny);
  if(big)big.dispose();
  big=new THREE.WebGLRenderTarget(FW,FH,{type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(FW,FH)});
  const tile=new THREE.WebGLRenderTarget(tw,th,{samples:4,type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(tw,th)});
  renderer.autoClear=false;renderer.shadowMap.enabled=true;
  big.viewport.set(0,0,FW,FH);renderer.setRenderTarget(big);renderer.clear();
  copyMat.uniforms.tColor.value=tile.texture;copyMat.uniforms.tDepth.value=tile.depthTexture;
  for(let ty=0;ty<ny;ty++)for(let tx=0;tx<nx;tx++){
    cam.setViewOffset(FW,FH,tx*tw,ty*th,tw,th);renderer.shadowMap.needsUpdate=true;
    renderer.setRenderTarget(tile);renderer.clear();renderer.render(scene,cam);
    big.viewport.set(tx*tw,FH-(ty+1)*th,tw,th);renderer.setRenderTarget(big);renderer.render(copyScene,blitCam)}
  big.viewport.set(0,0,FW,FH);renderer.setRenderTarget(null);tile.dispose();
  blitMat.uniforms.tColor.value=big.texture;blitMat.uniforms.tDepth.value=big.depthTexture;
  vx=fx*(FW-VW);vy=fy*(FH-VH);applyView();baked=true;bakeMs=performance.now()-t0}
function applyView(){vx=clamp(vx,0,Math.max(0,FW-VW));vy=clamp(vy,0,Math.max(0,FH-VH));const ox=Math.round(vx),oy=Math.round(vy);
  cam.setViewOffset(FW,FH,ox,oy,VW,VH);blitMat.uniforms.uOff.value.set(ox/FW,1-(oy+VH)/FH);blitMat.uniforms.uScl.value.set(VW/FW,VH/FH)}
let rebakeT=0;new ResizeObserver(()=>{if(!baked)return;clearTimeout(rebakeT);rebakeT=setTimeout(bake,250)}).observe(stage);

/* ============ tryk ============ */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),-TOP),hitP=new THREE.Vector3();
const cvEl=renderer.domElement;let down=null;const hintEl=document.getElementById('hint');
const devPx=()=>VW/(stage.clientWidth||1);
cvEl.addEventListener('pointerdown',e=>{if(down)return;down={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,lt:performance.now(),drag:false};velX=velY=0;try{cvEl.setPointerCapture(e.pointerId)}catch(_){}});
cvEl.addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;
  if(!down.drag&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>10){down.drag=true;hintEl.classList.add('gone')}
  if(down.drag){const k=devPx(),dx=(e.clientX-down.lx)*k,dy=(e.clientY-down.ly)*k,now=performance.now(),dts=Math.max(.008,(now-down.lt)/1000);
    vx-=dx;vy-=dy;velX=mix(velX,-dx/dts,.5);velY=mix(velY,-dy/dts,.5);down.lx=e.clientX;down.ly=e.clientY;down.lt=now;dragT=time}});
cvEl.addEventListener('pointercancel',e=>{if(down&&e.pointerId===down.id)down=null});
cvEl.addEventListener('pointerup',e=>{if(!down||e.pointerId!==down.id)return;const wasDrag=down.drag;down=null;
  if(wasDrag){dragT=time;return}
  const r=cvEl.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);
  const hits=ray.intersectObjects([dragon.root,unicorn.root,troll.root],true);
  if(hits.length){const o=hits[0].object;if(within(o,dragon.root))wakeT=time;else if(within(o,unicorn.root))uniT=time;else trollT=time}
  if(ray.ray.intersectPlane(ground,hitP)){goTo(hitP.x,hitP.z);hintEl.classList.add('gone');autoT=time+14}});
const within=(o,root)=>{for(;o;o=o.parent)if(o===root)return true;return false};

/* ============ løkken ============ */
const _fv=new THREE.Vector3();const meter=document.getElementById('meter');let mN=0,mT=0,mW=0,readyAt=0,time=0,autoT=7,wakeT=-9,uniT=-9,trollT=-9;
const PRMAX=Math.min(window.devicePixelRatio||1,2);let last=performance.now(),fN=0,fT=0,drops=0,good=0,pr=renderer.getPixelRatio();
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000,dt=clamp(raw,0,.05);last=now;time+=dt;
  if(document.body.dataset.view==='nu')return;
  if(raw<.5){mN++;mT+=raw;mW=Math.max(mW,raw);if(mT>=1){meter.textContent=`${Math.round(mN/mT)} billeder/s · langsomste ${Math.round(mW*1000)} ms · skarphed ${pr.toFixed(2).replace('.',',')} · byen bagt på ${Math.round(bakeMs)} ms · klar efter ${(readyAt/1000).toFixed(1).replace('.',',')} s`;mN=0;mT=0;mW=0}}
  /* skarpheden: måles først efter opstarten (de første billeder er altid tunge), og går op igen, når der er luft */
  if(raw<.5&&!document.hidden&&performance.now()-readyAt>2500&&readyAt){fT+=raw;if(++fN>=60){const avg=fT/fN;
    if(avg>.021&&pr>1&&drops<4){pr=Math.max(1,pr-.25);drops++;good=0;renderer.setPixelRatio(pr);bake()}
    else if(avg<.0135&&pr<PRMAX&&++good>=2){pr=Math.min(PRMAX,pr+.25);good=0;renderer.setPixelRatio(pr);bake()}fN=0;fT=0}}
  if(time>autoT){autoT=time+R(8,12);if(rnd()<.6){const s=Object.values(SPOTS);goTo(...s[Math.floor(R(s.length))])}else goTo(R(-60,60),R(-14,30))}
  if(W0.q&&W0.q.length&&Math.hypot(W0.tx-W0.x,W0.tz-W0.z)<1.4)[W0.tx,W0.tz]=W0.q.shift();
  stepWalker(W0,dt);
  /* katten følger heksens spor et par skridt bagud */
  {const l=trail[trail.length-1];if(Math.hypot(W0.x-l[0],W0.z-l[1])>.6){trail.push([W0.x,W0.z]);if(trail.length>60)trail.shift()}
    let acc=0,px=W0.x,pz=W0.z;for(let i=trail.length-1;i>=0&&acc<5.5;i--){acc+=Math.hypot(trail[i][0]-px,trail[i][1]-pz);px=trail[i][0];pz=trail[i][1]}
    C0.tx=px;C0.tz=pz+1.2}
  stepWalker(C0,dt);
  for(const n of walkers){if(!n.root){n.root=n.o.root;n.sc=n.o.root.scale.x;n.sh=blob(2.8,1.4);n.ri=0;[n.tx,n.tz]=n.route[0];n.face=1;n.ph=0;n.wait=0}
    if(Math.hypot(n.tx-n.x,n.tz-n.z)<.3){n.wait+=dt;if(n.wait>R(1.5,3)){n.wait=0;n.ri=(n.ri+1)%n.route.length;[n.tx,n.tz]=n.route[n.ri]}}
    stepWalker(n,dt);n.o.arm.rotation.z=n.moving?.25*Math.sin(n.ph):.05*Math.sin(time*1.4);n.o.head.rotation.z=.04*Math.sin(time*1.1+n.x)}
  /* heksen og katten */
  W.armL.rotation.z=W0.moving?-.13+.35*Math.sin(W0.ph):-.13+.025*Math.sin(time*1.3);W.elL.rotation.z=.12;W.armR.rotation.z=.56;W.elR.rotation.z=.1;
  W.head.rotation.z=.03*Math.sin(time*.8);for(const l of W.locks.children)l.rotation.z=(l.userData.s||1)*.05*Math.sin(time*1.5);
  W.lids.forEach(l=>l.visible=time%2.4<.13);C.lids.forEach(l=>l.visible=time%3.1<.13);
  C.tail.rotation.z=.25*Math.sin(time*(C0.moving?6:1.6));C.head.rotation.z=.06*Math.sin(time*.85);W.orbM.emissiveIntensity=1.15+.35*Math.sin(time*2.2);
  /* dragen: trækker vejret, sover, vågner hvis man trykker */
  {const awake=time-wakeT<3;dragon.body.scale.y=1+.025*Math.sin(time*1.3);dragon.head.position.y=11.4+.25*Math.sin(time*1.3);dragon.head.rotation.z=awake?.12*Math.sin(time*6):.04*Math.sin(time*.6);
    dragon.closed.visible=!awake;dragon.open.visible=awake;dragon.cap.rotation.z=.06*Math.sin(time*.9);dragon.tail.rotation.z=.08*Math.sin(time*.7);for(const[w,s]of dragon.wings)w.rotation.z=s*(awake?.25*Math.sin(time*10):.03*Math.sin(time*1.3));
    const hp=new THREE.Vector3();dragon.head.getWorldPosition(hp);
    for(const z of zzz){z.t=(z.t+dt*.28)%1;z.s.position.set(hp.x+3+z.t*5,hp.y+5+z.t*7,hp.z+1);const sz=1.2+z.t*2.2;z.s.scale.set(sz,sz,1);z.s.material.opacity=awake?0:Math.sin(z.t*Math.PI)*.95}}
  /* enhjørningen græsser og slår med halen */
  {const g=time-uniT<1.2;unicorn.head.rotation.z=g?.3*Math.sin((time-uniT)/1.2*Math.PI*2):(Math.sin(time*.3)>.6?-.45:.03*Math.sin(time*1.2));unicorn.tail.rotation.z=.2*Math.sin(time*2.4);unicorn.root.position.y=.4+(g?Math.abs(Math.sin((time-uniT)/1.2*Math.PI))*2:0)}
  {const t=time-trollT<1;troll.eyes.visible=!(time%3.7<.15)||t;troll.head.rotation.z=t?.15*Math.sin(time*12):.03*Math.sin(time*.8)}
  for(const d of ducks){const a=time*.25+d.ph;d.m.position.set(70+Math.cos(a)*5,TOP+.25+.15*Math.sin(time*3+d.ph),-6+Math.sin(a)*2.6);d.m.scale.x=Math.sin(a)>0?-1:1;d.m.scale.y=d.m.scale.z=1}
  /* lys, røg, ildfluer, flag, vand, blade og fuglen */
  for(const gl of glows){const f=gl.slow?.85+.15*Math.sin(time*gl.f):.9+.1*Math.sin(time*gl.f+gl.ph)*Math.sin(time*gl.f*.7);gl.s.scale.set(gl.base*f,gl.base*f,1)}
  for(const p of puffs){p.t+=dt;const k=(p.t%4)/4;p.s.position.set(chimneyAt.x+k*3+Math.sin(p.t*1.3)*.6,chimneyAt.y+k*12,chimneyAt.z);const sz=2+k*5;p.s.scale.set(sz,sz,1);p.s.material.opacity=Math.sin(k*Math.PI)*.8}
  for(const f of flies){f.s.position.set(f.x+Math.sin(time*f.sp+f.ph)*3,f.y+Math.sin(time*f.sp*1.7+f.ph)*1.2,f.z+Math.cos(time*f.sp*.8+f.ph)*2);f.s.material.opacity=.5+.5*Math.sin(time*3+f.ph)}
  for(const fl of flagsLive)fl.f.rotation.y=.35*Math.sin(time*2.6+fl.ph);
  fall.material.map.offset.y=(time*.9)%1;
  for(const g of glints){g.t=(g.t+dt*g.sp)%1;const i=g.t*(RIVER.length-1),a=RIVER[Math.floor(i)],b=RIVER[Math.min(RIVER.length-1,Math.floor(i)+1)],k=i%1;g.s.position.set(mix(a[0],b[0],k)+Math.sin(g.t*40)*.6,TOP+.3,mix(a[1],b[1],k));g.s.material.opacity=.4+.6*Math.abs(Math.sin(time*2+g.t*20))}
  for(const l of leaves){l.y-=l.vy*dt;l.x+=Math.sin(time*1.3+l.ph)*dt*2;if(l.y<TOP){l.y=R(24,34);l.x=R(-80,80);l.z=R(-20,34)}l.m.position.set(l.x,l.y,l.z);l.m.rotation.set(Math.sin(time*2+l.ph),time*1.5+l.ph,Math.sin(time*1.7+l.ph))}
  {const k=((time*.04)%1.4)-.2;bird.position.set(mix(-100,100,k),62+3*Math.sin(time*.7),GZ0+2);for(const w of bird.wings)w.g.rotation.x=w.s*(.2+.9*Math.abs(Math.sin(time*8)))}
  if(!baked)return;
  /* udsnittet: glider videre efter et træk og følger ellers stille med heksen, når hun nærmer sig kanten */
  if(!down){if(Math.abs(velX)+Math.abs(velY)>5){vx+=velX*dt;vy+=velY*dt;const f=Math.exp(-dt*4);velX*=f;velY*=f}else{velX=velY=0}
    if(time-dragT>3.5){const v=_fv.set(W0.x,TOP+4,W0.z).project(cam),sx=(v.x+1)/2,sy=(1-v.y)/2;
      const ex=sx<.3?sx-.3:sx>.7?sx-.7:0,ey=sy<.35?sy-.35:sy>.72?sy-.72:0,k=Math.min(1,dt*2.2);vx+=ex*VW*k;vy+=ey*VH*k}}
  applyView();
  renderer.autoClear=false;renderer.setRenderTarget(null);renderer.clear(true,true,false);renderer.render(blitScene,blitCam);renderer.render(live,cam)}

/* indlæsning: skrifterne hentes, alt klippes og males, byen bages */
(async()=>{try{
  const fams=['Cinzel Decorative','Fraunces','Fredoka','Rye','Limelight','MedievalSharp','Alfa Slab One','Berkshire Swash','Pirata One','Alegreya SC','Special Elite'];
  try{await Promise.race([Promise.all(fams.map(f=>document.fonts.load(`700 40px "${f}"`).catch(()=>{}))),new Promise(r=>setTimeout(r,4000))])}catch(_){}
  const wait=()=>new Promise(r=>setTimeout(r,0)),N=BUILD.length+2,t0=performance.now();
  for(let i=0;i<BUILD.length;i++){msgN.textContent=`${i+1} af ${N}`;await wait();BUILD[i]()}
  msgN.textContent=`${N-1} af ${N}`;await wait();buildLive();W0.sh=blob(4.6,2.3);C0.sh=blob(3,1.6);
  msgN.textContent=`${N} af ${N}`;await wait();
  renderer.compile(scene,cam);bake();renderer.compile(live,cam);
  window.__kort={W0,C0,NET,goTo,view:()=>({vx,vy,FW,FH,VW,VH}),walkers,bake,time:()=>time,paintMs:performance.now()-t0};
  requestAnimationFrame(t=>{last=t;frame(t);requestAnimationFrame(()=>{readyAt=performance.now();msg.classList.add('gone')})})}catch(e){msgN.textContent='Fejl: '+e.message;console.error(e)}})();
