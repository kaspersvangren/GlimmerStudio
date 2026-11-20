/* ============ figurerne på kortet ============ */
const TOP=.3,SC=.34;
buildDress(0);buildHair(0);buildHat(0);
live.add(W.root);W.root.scale.setScalar(SC);W.orbLight.intensity=0;W.glow.scale.set(9,9,1);
live.add(C.root);C.root.scale.setScalar(SC);C.root.rotation.y=0;
/* gnomen med lygte: en lille pap-figur */
const G={};
(function buildGnome(){const root=new THREE.Group();live.add(root);G.root=root;
  root.add(part([[-2.6,0],[2.6,0],[2.2,4],[1.4,7.4],[-1.4,7.4],[-2.2,4]],0,P=>{P.coat('#3f7a4a',null,{dir:1.5,bw:.35});P.coat('#6b4428',outline(rect(-3,2.6,3,3.4),1,.02),{dir:0,bw:.25})}));
  G.head=joint(root,0,7);
  G.head.add(part([[-2.2,0],[2.2,0],[2.4,2.2],[1.8,3.6],[0,4.1],[-1.8,3.6],[-2.4,2.2]],1,P=>{P.coat('#f2c7a8',null,{bw:.3});for(const s of[-1,1])P.fill(ell(s*.9,2.5,.3,.36,10,.02),'#1d1520',1);P.fill(ell(0,1.9,.55,.45,10,.04),'#e08a7a',.95)}));
  G.head.add(part([[-2.5,1.9],[-1.2,1.3],[0,1.6],[1.2,1.3],[2.5,1.9],[1.8,-1.6],[0,-3.4],[-1.8,-1.6]],1.4,P=>{P.coat('#f1ece2',null,{dir:1.57,bw:.3});P.dabs('#c9c2b4',40,{len:.8,w:.06,dir:1.57,spread:.3,alpha:.6})}));
  G.head.add(part([[-2.6,3.2,1],[2.6,3.2,1],[1.4,6],[.4,9],[-1.2,6.2]],1.8,P=>{P.coat('#c2453a',null,{dir:1.2,bw:.3})}));
  G.arm=joint(root,1.8,5.6);G.arm.add(part([[-.5,.4],[.5,.4],[.6,-3.2],[-.6,-3.2]],2,P=>P.coat('#3f7a4a',null,{bw:.3})));
  G.lamp=new THREE.Group();put(G.arm,G.lamp,0,-3.4,.8);G.lamp.add(part([[-.9,0,1],[.9,0,1],[1.1,-2.2],[0,-2.9,1],[-1.1,-2.2]],2.3,P=>{P.coat('#2a2233',null,{bw:.2});P.fill(outline(rect(-.6,-2.1,.6,-.4),1,.01),'#ffe08a',.98)}));
  G.glow=sprite([[0,'rgba(255,220,150,.95)'],[.3,'rgba(255,170,80,.4)'],[1,'rgba(255,140,40,0)']],10);put(G.lamp,G.glow,0,-1.3,1.5);
  root.scale.setScalar(.36)})();
/* bløde skygger under figurerne (de rigtige skygger er bagt ind i byen) */
const shadowTex=(()=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tx(c,false)})();
const blob=(w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;live.add(m);return m};
const walkers=[
  {root:W.root,x:-24,z:6,tx:-24,tz:6,sp:9,face:1,ph:0,sc:SC,sh:blob(4.4,2.2),kind:'heks'},
  {root:C.root,x:-19,z:8,tx:-19,tz:8,sp:11,face:1,ph:0,sc:SC,sh:blob(3,1.6),kind:'kat'},
  {root:G.root,x:14,z:6,tx:28,tz:4,sp:5,face:1,ph:0,sc:.36,sh:blob(2.6,1.3),kind:'gnom',route:[[14,6],[27,3],[20,12],[6,10]],ri:0,wait:0}];
const W0=walkers[0],C0=walkers[1];
function clampWalk(x,z){x=clamp(x,-54,54);z=clamp(z,Math.abs(x)<6?-16:-9,26);
  const dx=x,dz=z+2,d=Math.hypot(dx/1.25,dz);if(d<6.5){const k=6.5/(d||1);x=dx*k;z=-2+dz*k}return[x,z]}
function stepWalker(w,dt,t){
  const dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz),moving=d>.25;
  if(moving){const s=Math.min(d,w.sp*dt);w.x+=dx/d*s;w.z+=dz/d*s;if(Math.abs(dx)>.3)w.face=dx>0?1:-1;w.ph+=s/(w.kind==='kat'?2.2:3)*TAU}
  w.moving=moving;
  const bob=moving?Math.abs(Math.sin(w.ph))*(w.kind==='kat'?1.1:.7):0;
  w.root.position.set(w.x,TOP+bob,w.z);w.root.scale.set(w.face*w.sc,w.sc,w.sc);w.root.rotation.z=moving?.06*Math.sin(w.ph)*w.face:0;
  w.sh.position.set(w.x,TOP+.06,w.z);const k=1-bob*.15;w.sh.scale.set(k,k,1)}

/* ============ kamera og bagning ============ */
const cam=new THREE.PerspectiveCamera(30,1,20,800);const LOOK=new THREE.Vector3(0,12,-3),CD=170,PITCH=.5;
let rt=null,baked=false,bakeMs=0;
const blitMat=new THREE.ShaderMaterial({depthTest:true,depthWrite:true,depthFunc:THREE.AlwaysDepth,toneMapped:true,
  uniforms:{tColor:{value:null},tDepth:{value:null}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform sampler2D tColor;uniform sampler2D tDepth;varying vec2 vUv;
void main(){gl_FragColor=texture2D(tColor,vUv);gl_FragDepth=texture2D(tDepth,vUv).x;
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
const blitScene=new THREE.Scene(),blitCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blitMat);q.frustumCulled=false;blitScene.add(q)}
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
function frameCam(){const w=stage.clientWidth,h=stage.clientHeight,asp=w/h;cam.aspect=asp;
  const Wd=asp>1.2?112:128,H=Math.max(Wd/asp,asp>1.2?60:0);cam.fov=2*Math.atan(H/2/CD)*180/Math.PI;cam.updateProjectionMatrix();
  cam.position.set(LOOK.x,LOOK.y+CD*Math.sin(PITCH),LOOK.z+CD*Math.cos(PITCH));cam.lookAt(LOOK)}
/* byen tegnes én gang i skærmens størrelse og gemmes med sin dybde, så figurerne kan gå bag ting */
function bake(){const t0=performance.now();const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);frameCam();const d=renderer.getDrawingBufferSize(new THREE.Vector2());
  if(rt)rt.dispose();rt=new THREE.WebGLRenderTarget(d.x,d.y,{samples:4,type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(d.x,d.y)});
  renderer.shadowMap.enabled=true;renderer.shadowMap.needsUpdate=true;
  renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,cam);renderer.setRenderTarget(null);
  blitMat.uniforms.tColor.value=rt.texture;blitMat.uniforms.tDepth.value=rt.depthTexture;baked=true;bakeMs=performance.now()-t0}
let rebakeT=0;new ResizeObserver(()=>{if(!baked)return;clearTimeout(rebakeT);rebakeT=setTimeout(bake,250)}).observe(stage);

/* ============ tryk: heksen går derhen, katten følger efter ============ */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),-TOP),hitP=new THREE.Vector3();
const cvEl=renderer.domElement;let down=null;
cvEl.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
cvEl.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>12)return;down=null;
  const r=cvEl.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);
  if(ray.ray.intersectPlane(ground,hitP)){[W0.tx,W0.tz]=clampWalk(hitP.x,hitP.z);hintEl.classList.add('gone');autoT=time+12}});
const hintEl=document.getElementById('hint');

/* ============ løkken ============ */
const meter=document.getElementById('meter');let mN=0,mT=0,mW=0,readyAt=0,time=0,autoT=6;
const PRMIN=1;let last=performance.now(),fN=0,fT=0,drops=0,pr=renderer.getPixelRatio();
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000,dt=clamp(raw,0,.05);last=now;time+=dt;
  if(raw<.5){mN++;mT+=raw;mW=Math.max(mW,raw);if(mT>=1){meter.textContent=`${Math.round(mN/mT)} billeder/s · langsomste ${Math.round(mW*1000)} ms · skarphed ${pr.toFixed(2).replace('.',',')} · byen bagt på ${Math.round(bakeMs)} ms · klar efter ${(readyAt/1000).toFixed(1).replace('.',',')} s`;mN=0;mT=0;mW=0}}
  /* kan den ikke følge med, går skarpheden ned (og byen bages igen i den nye størrelse) */
  if(raw<.5&&!document.hidden&&drops<4){fT+=raw;if(++fN>=60){if(fT/fN>.021&&pr>PRMIN){pr=Math.max(PRMIN,pr-.25);drops++;renderer.setPixelRatio(pr);bake()}fN=0;fT=0}}
  /* heksen går selv en tur, hvis ingen trykker */
  if(time>autoT){autoT=time+R(5,9);[W0.tx,W0.tz]=clampWalk(R(-40,40),R(-6,22))}
  {const off=W0.face>0?-5:5;[C0.tx,C0.tz]=clampWalk(W0.x+off,W0.z+2.2)}
  const g=walkers[2];if(Math.hypot(g.tx-g.x,g.tz-g.z)<.3){g.wait+=dt;if(g.wait>2){g.wait=0;g.ri=(g.ri+1)%g.route.length;[g.tx,g.tz]=g.route[g.ri]}}
  for(const w of walkers)stepWalker(w,dt,time);
  /* dukkernes små bevægelser */
  W.armL.rotation.z=W0.moving?-.13+.35*Math.sin(W0.ph):-.13+.025*Math.sin(time*1.3);W.elL.rotation.z=.12;W.armR.rotation.z=.56;W.elR.rotation.z=.1;
  W.head.rotation.z=.03*Math.sin(time*.8);for(const l of W.locks.children)l.rotation.z=(l.userData.s||1)*.05*Math.sin(time*1.5);
  W.lids.forEach(l=>l.visible=time%2.4<.13);C.lids.forEach(l=>l.visible=time%3.1<.13);
  C.tail.rotation.z=.25*Math.sin(time*(C0.moving?6:1.6));C.head.rotation.z=.06*Math.sin(time*.85);
  G.arm.rotation.z=.15*Math.sin(time*2.2)+(walkers[2].moving?.2*Math.sin(walkers[2].ph):0);G.head.rotation.z=.04*Math.sin(time*1.1);
  W.orbM.emissiveIntensity=1.15+.35*Math.sin(time*2.2);
  /* lys, røg, ildfluer, flag og fuglen */
  for(const gl of glows){const f=gl.slow?.85+.15*Math.sin(time*gl.f):.9+.1*Math.sin(time*gl.f+gl.ph)*Math.sin(time*gl.f*.7);gl.s.scale.set(gl.base*f,gl.base*f,1)}
  for(const p of puffs){p.t+=dt;const k=(p.t%4)/4;p.s.position.set(chimneyAt.x+k*3+Math.sin(p.t*1.3)*.6,chimneyAt.y+k*12,chimneyAt.z);const sz=2+k*5;p.s.scale.set(sz,sz,1);p.s.material.opacity=Math.sin(k*Math.PI)*.8}
  for(const f of flies){f.s.position.set(f.x+Math.sin(time*f.sp+f.ph)*3,f.y+Math.sin(time*f.sp*1.7+f.ph)*1.2,f.z+Math.cos(time*f.sp*.8+f.ph)*2);f.s.material.opacity=.5+.5*Math.sin(time*3+f.ph)}
  for(const fl of flagsLive)fl.f.rotation.y=.35*Math.sin(time*2.6+fl.ph);
  {const k=((time*.045)%1.4)-.2;bird.position.set(mix(-75,75,k),44+3*Math.sin(time*.7),GZ0+2);for(const w of bird.wings)w.g.rotation.x=w.s*(.2+.9*Math.abs(Math.sin(time*8)))}
  if(!baked)return;
  renderer.autoClear=false;renderer.setRenderTarget(null);renderer.clear(true,true,false);renderer.render(blitScene,blitCam);renderer.render(live,cam)}

/* indlæsning: alt klippes, males og bages, før byen vises */
(async()=>{
  try{await Promise.race([document.fonts.load('40px "Patrick Hand"'),new Promise(r=>setTimeout(r,2500))])}catch(_){}
  const wait=()=>new Promise(r=>setTimeout(r,0));
  for(let i=0;i<BUILD.length;i++){msgN.textContent=`${i+1} af ${BUILD.length+2}`;await wait();BUILD[i]()}
  msgN.textContent=`${BUILD.length+1} af ${BUILD.length+2}`;await wait();buildLive();
  msgN.textContent=`${BUILD.length+2} af ${BUILD.length+2}`;await wait();
  renderer.compile(scene,cam);bake();renderer.compile(live,cam);
  window.__kort={walkers,bake,time:()=>time};
  requestAnimationFrame(t=>{last=t;frame(t);requestAnimationFrame(()=>{readyAt=performance.now();msg.classList.add('gone')})})})();
