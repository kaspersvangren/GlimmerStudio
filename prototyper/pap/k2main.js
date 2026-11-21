/* ============ heksen, katten og gåturene ============ */
const TOP=.3,SC=.3;
const HEKS=makeFigure(Object.assign({res:.6},(typeof SPIL!=='undefined')?SPIL.look:null)),KAT=makeCat({res:.6});
live.add(HEKS.G);HEKS.G.scale.setScalar(SC);live.add(KAT.G);KAT.G.scale.setScalar(SC);
const shadowTex=(()=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tx(c,false)})();
const blob=(w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;live.add(m);return m};
const walkers=[];
const W0={root:HEKS.G,x:-10,z:12,tx:-10,tz:12,sp:9,face:1,ph:0,sc:SC,kind:'heks'},C0={root:KAT.G,x:-5,z:14,tx:-5,tz:14,sp:12,face:1,ph:0,sc:SC,kind:'kat'};
/* bygningernes grundflader: man kan ikke gå ind i dem; trykker man på en, går heksen hen til døren */
let HOUSES=[];
function houseAt(x,z){for(const h of HOUSES)if(x>h[1]&&x<h[2]&&z>h[3]&&z<h[4])return h;return null}
function clampWalk(x,z){x=clamp(x,-78,78);z=clamp(z,-22,36);
  const dx=x,dz=z,d=Math.hypot(dx/1.3,dz);if(d<7){const k=7/(d||1);x=dx*k;z=dz*k}
  const h=houseAt(x,z);if(h&&SPOTS[h[0]]){const s=SPOTS[h[0]];return[s[0],s[1]]}return[x,z]}
/* svævende skridt (ca. 2,2 i sekundet): ét hop pr. skridtlængde, toppen af hoppet holdes lidt, og hoppene ebber ud, når figuren stopper */
const GAIT={heks:{len:4.1,h:.4},kat:{len:4.1,h:.45},npc:{len:3.8,h:.3}};
function stepWalker(w,dt){
  const dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz),moving=d>.25,g=GAIT[w.kind];
  w.amp=(w.amp||0)+((moving?1:0)-(w.amp||0))*Math.min(1,dt*(moving?5:3));
  w.v=(w.v||0)+((moving?w.sp:0)-(w.v||0))*Math.min(1,dt*4);
  if(moving){const s=Math.min(d,Math.max(w.v,1.5)*dt);w.x+=dx/d*s;w.z+=dz/d*s;if(Math.abs(dx)>.3)w.face=dx>0?1:-1;w.ph+=s/g.len*Math.PI}
  else if(w.amp>.02){const r=w.ph%Math.PI;if(r>.05)w.ph+=Math.min(Math.PI-r,dt*2.5)}
  w.moving=moving;const bob=Math.pow(Math.abs(Math.sin(w.ph)),.6)*g.h*w.amp;
  const by=bridgeY(w.x,w.z);w.root.position.set(w.x,TOP+.08+bob+by+(w.yOff||0),w.z);w.root.scale.set(w.face*w.sc,w.sc*(w.sq||1),w.sc);w.root.rotation.z=.05*Math.cos(w.ph)*w.face*w.amp;
  w.sh.position.set(w.x,TOP+.12+by+(w.yOff||0)*.6,w.z);const k=1-bob*.15;w.sh.scale.set(k,k,1)}

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
void main(){gl_FragColor=texture2D(tColor,vUv);gl_FragDepth=texture2D(tDepth,vUv).x;}`});
const blitMat=new THREE.ShaderMaterial(blitSrc(false)),copyMat=new THREE.ShaderMaterial(blitSrc(false));
/* ============ efterbehandling, kun når byen bages: kontaktskygger, dybdeskarphed, glød, dis og farver ============ */
const POST=(()=>{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2));q.frustumCulled=false;const sc=new THREE.Scene();sc.add(q);
  const V=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,LIN=`uniform float near,far;float lin(float d){float z=d*2.-1.;return 2.*near*far/(far+near-z*(far-near));}`;
  const mk=(f,u)=>new THREE.ShaderMaterial({vertexShader:V,fragmentShader:f,uniforms:u,depthTest:false,depthWrite:false,toneMapped:false});
  const U=()=>({near:{value:cam.near},far:{value:cam.far}});
  /* kontaktskygge: sammenligner dybden med punkter parvis på hver side, så skrå flader (jorden) ikke bliver mørke */
  const aoM=mk(`uniform sampler2D tDepth;uniform vec2 px;uniform float rad,cd;${LIN}varying vec2 vUv;
void main(){float zc=lin(texture2D(tDepth,vUv).x);float occ=0.;
 for(int i=0;i<12;i++){float a=float(i)*2.39996+.3;float r=(.2+.8*fract(float(i)*.618+.1))*rad*cd/zc;vec2 o=vec2(cos(a),sin(a))*r*px;
  float z1=lin(texture2D(tDepth,vUv+o).x),z2=lin(texture2D(tDepth,vUv-o).x);
  float d1=(2.*zc-z2)-z1,d2=(2.*zc-z1)-z2;
  occ+=smoothstep(.03,.45,d1)*(1.-smoothstep(1.5,4.,abs(zc-z1)))+smoothstep(.03,.45,d2)*(1.-smoothstep(1.5,4.,abs(zc-z2)));}
 gl_FragColor=vec4(vec3(clamp(1.-occ/24.*1.25,0.,1.)),1.);}`,{tDepth:{value:null},px:{value:new THREE.Vector2()},rad:{value:10},cd:{value:CD},...U()});
  const brM=mk(`uniform sampler2D tC;uniform vec2 px;varying vec2 vUv;void main(){vec3 c=vec3(0.);for(int i=0;i<4;i++){vec2 o=vec2(float(i/2)-.5,float(i-2*(i/2))-.5)*px*1.5;c+=max(texture2D(tC,vUv+o).rgb-vec3(1.05),0.);}gl_FragColor=vec4(c*.25,1.);}`,{tC:{value:null},px:{value:new THREE.Vector2()}});
  const blM=mk(`uniform sampler2D tC;uniform vec2 dir;varying vec2 vUv;void main(){float w[5];w[0]=.227;w[1]=.195;w[2]=.122;w[3]=.054;w[4]=.016;vec3 c=texture2D(tC,vUv).rgb*w[0];for(int i=1;i<5;i++){c+=texture2D(tC,vUv+dir*float(i)).rgb*w[i];c+=texture2D(tC,vUv-dir*float(i)).rgb*w[i];}gl_FragColor=vec4(c,1.);}`,{tC:{value:null},dir:{value:new THREE.Vector2()}});
  const coM=mk(`uniform sampler2D tC,tD,tAO,tB1,tB2,tDof;uniform vec2 px,apx;uniform float zf,expo,seed;${LIN}varying vec2 vUv;
vec3 fit(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=expo/.6;return clamp(O*fit(I*c),0.,1.);}
vec3 srgb(vec3 c){return mix(pow(c,vec3(1./2.4))*1.055-.055,c*12.92,step(c,vec3(.0031308)));}
void main(){vec3 c=texture2D(tC,vUv).rgb;float z=lin(texture2D(tD,vUv).x);
 float ao=0.;ao+=texture2D(tAO,vUv).r*.4;ao+=texture2D(tAO,vUv+vec2(apx.x,0.)).r*.15;ao+=texture2D(tAO,vUv-vec2(apx.x,0.)).r*.15;ao+=texture2D(tAO,vUv+vec2(0.,apx.y)).r*.15;ao+=texture2D(tAO,vUv-vec2(0.,apx.y)).r*.15;
 c*=mix(1.,ao,.9);
 float rel=abs(z-zf)/zf,coc=smoothstep(.11,.3,rel)*.9;vec3 b=texture2D(tDof,vUv).rgb;c=mix(c,b*mix(1.,ao,.9),coc);
 c+=texture2D(tB1,vUv).rgb*.3+texture2D(tB2,vUv).rgb*.28;
 float hz=smoothstep(zf*1.08,zf*1.45,z)*.38;c=mix(c,vec3(.075,.06,.16),hz);
 vec3 t=srgb(aces(c));
 float l=dot(t,vec3(.299,.587,.114));t=mix(vec3(l),t,1.04);t=t+(vec3(.012,-.004,.03))*(1.-l)+(vec3(.02,.008,-.02))*l;t=mix(t,t*t*(3.-2.*t),.12);
 t+=(fract(sin(dot(vUv*vec2(12.9898,78.233)+seed,vec2(1.,1.)))*43758.5453)-.5)/255.;
 gl_FragColor=vec4(t,1.);}`,{tC:{value:null},tD:{value:null},tAO:{value:null},tB1:{value:null},tB2:{value:null},tDof:{value:null},px:{value:new THREE.Vector2()},apx:{value:new THREE.Vector2()},zf:{value:CD},expo:{value:1.1},seed:{value:0},...U()});
  const RT=(w,h,hf=true)=>new THREE.WebGLRenderTarget(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)),{type:hf?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:false});
  const pass=(mat,rt)=>{q.material=mat;renderer.setRenderTarget(rt);renderer.render(sc,blitCam)};
  const blur=(src,tmp,dst,w,h,s=1.5)=>{blM.uniforms.tC.value=src.texture;blM.uniforms.dir.value.set(s/w,0);pass(blM,tmp);blM.uniforms.tC.value=tmp.texture;blM.uniforms.dir.value.set(0,s/h);pass(blM,dst)};
  let fin=null;
  function run(big,FW,FH){const tmp=[];const mkT=(w,h,hf)=>{const r=RT(w,h,hf);tmp.push(r);return r};
    /* kontaktskygge i halv opløsning */
    const aw=FW/2,ah=FH/2,ao=mkT(aw,ah,false);const wpp=2*CD*Math.tan(cam.fov*Math.PI/360)/FH;
    Object.assign(aoM.uniforms,{});aoM.uniforms.tDepth.value=big.depthTexture;aoM.uniforms.px.value.set(1/FW,1/FH);aoM.uniforms.rad.value=.75/wpp;aoM.uniforms.near.value=cam.near;aoM.uniforms.far.value=cam.far;pass(aoM,ao);
    /* glød fra lamper, vinduer og vand */
    const b1=mkT(FW/4,FH/4),b1t=mkT(FW/4,FH/4),b2=mkT(FW/8,FH/8),b2t=mkT(FW/8,FH/8);
    brM.uniforms.tC.value=big.texture;brM.uniforms.px.value.set(1/FW,1/FH);pass(brM,b1);blur(b1,b1t,b1,FW/4,FH/4,1.6);
    blM.uniforms.tC.value=b1.texture;blM.uniforms.dir.value.set(0,0);pass(blM,b2);blur(b2,b2t,b2,FW/8,FH/8,1.8);blur(b2,b2t,b2,FW/8,FH/8,2.6);
    /* sløret udgave til dybdeskarpheden */
    const d1=mkT(FW/2,FH/2),d1t=mkT(FW/2,FH/2);blM.uniforms.tC.value=big.texture;blM.uniforms.dir.value.set(.5/FW,0);pass(blM,d1t);blM.uniforms.tC.value=d1t.texture;blM.uniforms.dir.value.set(0,.5/FH);pass(blM,d1);blur(d1,d1t,d1,FW/2,FH/2,1.4);
    if(fin)fin.dispose();fin=RT(FW,FH,false);
    Object.assign(coM.uniforms,{});const u=coM.uniforms;u.tC.value=big.texture;u.tD.value=big.depthTexture;u.tAO.value=ao.texture;u.tB1.value=b1.texture;u.tB2.value=b2.texture;u.tDof.value=d1.texture;u.apx.value.set(2/FW,2/FH);u.near.value=cam.near;u.far.value=cam.far;u.seed.value=R(10);
    pass(coM,fin);renderer.setRenderTarget(null);for(const r of tmp)r.dispose();return fin}
  return{run}})();
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
  VW=d.x;VH=d.y;const mx=renderer.capabilities.maxTextureSize,z=Math.max(1,Math.min(ZOOM,mx/VW,mx/VH,Math.sqrt(9e6/(VW*VH))));FW=Math.round(VW*z);FH=Math.round(VH*z);
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
  cam.clearViewOffset();const fin=POST.run(big,FW,FH);
  blitMat.uniforms.tColor.value=fin.texture;blitMat.uniforms.tDepth.value=big.depthTexture;
  vx=fx*(FW-VW);vy=fy*(FH-VH);applyView();baked=true;bakeMs=performance.now()-t0}
function applyView(){vx=clamp(vx,0,Math.max(0,FW-VW));vy=clamp(vy,0,Math.max(0,FH-VH));const ox=Math.round(vx),oy=Math.round(vy);
  cam.setViewOffset(FW,FH,ox,oy,VW,VH);blitMat.uniforms.uOff.value.set(ox/FW,1-(oy+VH)/FH);blitMat.uniforms.uScl.value.set(VW/FW,VH/FH)}
let rebakeT=0;new ResizeObserver(()=>{if(!baked)return;if((typeof SPIL!=='undefined')&&SPIL.pause){SPIL.rebake=true;return}clearTimeout(rebakeT);rebakeT=setTimeout(bake,250)}).observe(stage);

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
  {const hh=ray.intersectObjects(HOUSEG,true);if(hh.length){let o=hh[0].object;while(o&&!o.userData.house)o=o.parent;const sp=o&&SPOTS[o.userData.house];if(sp){goTo(sp[0],sp[1]);doorWant=o.userData.house;hintEl.classList.add('gone');autoT=time+14;return}}}
  if(ray.ray.intersectPlane(ground,hitP)){goTo(hitP.x,hitP.z);doorWant=null;hintEl.classList.add('gone');autoT=time+14}});
const within=(o,root)=>{for(;o;o=o.parent)if(o===root)return true;return false};

/* ============ løkken ============ */
const _fv=new THREE.Vector3();
/* steder hvor byens folk gerne vil hen, og hvad de gør der */
const POIS=[{n:'bænk-v',at:[-9.4,-5.1],act:'sit',y:2.3,face:1,dur:[7,12]},{n:'bænk-h',at:[9.4,-5.1],act:'sit',y:2.3,face:-1,dur:[7,12]},
  {n:'brønd-v',at:[-2.8,7],act:'look',face:1},{n:'brønd-h',at:[3,7],act:'look',face:-1},{n:'ænder',at:[58.8,-2.4],act:'look',face:1,dur:[6,10]},
  {n:'træ-ø',at:[10,19.6],act:'rest',face:1,dur:[8,14]},{n:'træ-v',at:[-15.6,24.6],act:'rest',face:-1,dur:[8,14]},{n:'vejviser',at:[-30.5,-1.1],act:'look',face:1},
  {n:'vindue',at:[26.6,6.2],act:'look',face:1},{n:'enhjørning',at:[58.6,-9.8],act:'look',face:1},{n:'plakat',at:[-64.4,32.4],act:'look',face:-1},
  {n:'bro',at:[25.4,35],act:'look',face:1},{n:'arkade',at:[63.4,31.6],act:'look',face:1},{n:'kollegie',at:[-43.4,-4.6],act:'look',face:-1}];
function freePoi(n){const taken=new Set(walkers.filter(w=>w!==n&&w.poi).map(w=>w.poi.n));const ok=POIS.filter(p=>!taken.has(p.n)&&p!==n.poi);return ok[Math.floor(R(ok.length))]}
function actPose(n,p){n.yOff=p.act==='sit'?p.y:0;n.sq=p.act==='rest'?.74:1;if(p.face)n.face=p.face}const meter=document.getElementById('meter');let mN=0,mT=0,mW=0,readyAt=0,time=0,autoT=7,wakeT=-9,uniT=-9,trollT=-9;
const PRMAX=Math.min(window.devicePixelRatio||1,2);let last=performance.now(),fN=0,fT=0,drops=0,good=0,pr=renderer.getPixelRatio();
let doorWant=null;
function frame(now){
  requestAnimationFrame(frame);
  if((typeof SPIL!=='undefined')&&SPIL.pause){last=now;return}
  const raw=(now-last)/1000,dt=clamp(raw,0,.05);last=now;time+=dt;
  if(document.body.dataset.view==='nu')return;
  if(raw<.5){mN++;mT+=raw;mW=Math.max(mW,raw);if(mT>=1){meter.textContent=`${Math.round(mN/mT)} billeder/s · langsomste ${Math.round(mW*1000)} ms · skarphed ${pr.toFixed(2).replace('.',',')} · byen bagt på ${Math.round(bakeMs)} ms · klar efter ${(readyAt/1000).toFixed(1).replace('.',',')} s`;mN=0;mT=0;mW=0}}
  /* skarpheden: måles først efter opstarten (de første billeder er altid tunge), og går op igen, når der er luft */
  if(raw<.5&&!document.hidden&&performance.now()-readyAt>2500&&readyAt){fT+=raw;if(++fN>=60){const avg=fT/fN;
    if(avg>.021&&pr>1&&drops<4){pr=Math.max(1,pr-.25);drops++;good=0;renderer.setPixelRatio(pr);bake()}
    else if(avg<.0135&&pr<PRMAX&&++good>=2){pr=Math.min(PRMAX,pr+.25);good=0;renderer.setPixelRatio(pr);bake()}fN=0;fT=0}}
  if((typeof SPIL!=='undefined'))autoT=time+99;/* i spillet går heksen kun, når man beder hende om det */
  if(time>autoT){autoT=time+R(8,12);doorWant=null;if(rnd()<.6){const s=Object.values(SPOTS);goTo(...s[Math.floor(R(s.length))])}else goTo(R(-60,60),R(-14,30))}
  if(W0.q&&W0.q.length&&Math.hypot(W0.tx-W0.x,W0.tz-W0.z)<1.4)[W0.tx,W0.tz]=W0.q.shift();
  stepWalker(W0,dt);
  if(doorWant&&!W0.q.length){const sp=SPOTS[doorWant];if(Math.hypot(W0.x-sp[0],W0.z-sp[1])<.6){const d=doorWant;doorWant=null;if((typeof SPIL!=='undefined'))SPIL.arrive(d)}}
  /* katten følger heksens spor et par skridt bagud */
  {const l=trail[trail.length-1];if(Math.hypot(W0.x-l[0],W0.z-l[1])>.6){trail.push([W0.x,W0.z]);if(trail.length>60)trail.shift()}
    let acc=0,px=W0.x,pz=W0.z;for(let i=trail.length-1;i>=0&&acc<5.5;i--){acc+=Math.hypot(trail[i][0]-px,trail[i][1]-pz);px=trail[i][0];pz=trail[i][1]}
    C0.tx=px;C0.tz=pz+1.2}
  stepWalker(C0,dt);
  /* byens folk går ad stierne fra mål til mål og gør noget, når de når frem */
  for(const n of walkers){if(!n.root){n.root=n.o.root;n.sc=n.o.root.scale.x;n.sh=blob(2.8,1.4);n.face=1;n.ph=0;const p0=freePoi(n);n.poi=p0;[n.x,n.z]=p0.at;[n.tx,n.tz]=p0.at;n.q=[];n.until=time+R(2,6);n.acting=true;actPose(n,p0)}
    if(n.q.length&&Math.hypot(n.tx-n.x,n.tz-n.z)<1.2)[n.tx,n.tz]=n.q.shift();
    if(!n.acting&&!n.q.length&&Math.hypot(n.tx-n.x,n.tz-n.z)<.3){n.acting=true;n.until=time+R(...(n.poi.dur||[5,9]));actPose(n,n.poi)}
    if(n.acting&&time>n.until){n.acting=false;n.yOff=0;n.sq=1;const p=freePoi(n);n.poi=p;const r=NET.route(n.x,n.z,p.at[0],p.at[1]).map(q=>[q[0],q[1]]);[n.tx,n.tz]=r.shift();n.q=r}
    if(n.acting&&n.poi.face)n.face=n.poi.face;
    stepWalker(n,dt);n.o.tick(time+n.x,{ph:n.ph,amp:n.amp||0})}
  /* heksen og katten */
  HEKS.tick(time,{ph:W0.ph,amp:W0.amp||0});KAT.tick(time,{ph:C0.ph*2,amp:C0.amp||0});
  /* dragen: trækker vejret, sover, vågner hvis man trykker */
  {const awake=time-wakeT<3;dragon.tick(time,{awake});
    const hp=new THREE.Vector3();dragon.head.getWorldPosition(hp);
    for(const z of zzz){z.t=(z.t+dt*.28)%1;z.s.position.set(hp.x+3+z.t*5,hp.y+5+z.t*7,hp.z+1);const sz=1.2+z.t*2.2;z.s.scale.set(sz,sz,1);z.s.material.opacity=awake?0:Math.sin(z.t*Math.PI)*.95}}
  /* enhjørningen græsser og slår med halen */
  unicorn.tick(time,{jump:uniT});unicorn.root.position.y=.4+unicorn.hop;troll.tick(time,{poke:trollT});
  for(const d of ducks){const a=time*.25+d.ph;d.m.position.set(70+Math.cos(a)*5,TOP+.25+.15*Math.sin(time*3+d.ph),-6+Math.sin(a)*2.6);d.m.scale.x=Math.sin(a)>0?-1:1;d.m.scale.y=d.m.scale.z=1}
  /* lys, røg, ildfluer, flag, vand, blade og fuglen */
  for(const gl of glows){const f=gl.slow?.85+.15*Math.sin(time*gl.f):.9+.1*Math.sin(time*gl.f+gl.ph)*Math.sin(time*gl.f*.7);gl.s.scale.set(gl.base*f,gl.base*f,1)}
  for(const p of puffs){p.t+=dt;const k=(p.t%4)/4;p.s.position.set(chimneyAt.x+k*3+Math.sin(p.t*1.3)*.6,chimneyAt.y+k*12,chimneyAt.z);const sz=2+k*5;p.s.scale.set(sz,sz,1);p.s.material.opacity=Math.sin(k*Math.PI)*.8}
  for(const f of flies){f.s.position.set(f.x+Math.sin(time*f.sp+f.ph)*3,f.y+Math.sin(time*f.sp*1.7+f.ph)*1.2,f.z+Math.cos(time*f.sp*.8+f.ph)*2);f.s.material.opacity=.5+.5*Math.sin(time*3+f.ph)}
  for(const fl of flagsLive)fl.f.rotation.y=.35*Math.sin(time*2.6+fl.ph);
  /* vandfaldet: to lag vand i hver sit tempo, skum, dråber og tåge */
  for(const f of fall.layers)f.m.material.map.offset.y=(time*f.sp)%1;
  for(const f of fall.foam){const k=.8+.25*Math.sin(time*5+f.ph);f.s.scale.set(f.b*k,f.b*k,1);f.s.position.x=fallAt.x+f.dx+.15*Math.sin(time*3+f.ph)}
  for(const d of fall.drops){d.t=(d.t+dt*d.sp)%1;d.s.position.set(fallAt.x+d.dx+d.t*d.vx,fallAt.y-d.t*26,fallAt.z+.2);d.s.material.opacity=Math.sin(d.t*Math.PI)*.8}
  for(const m of fall.mist){m.t=(m.t+dt*.25)%1;const sz=3+m.t*5;m.s.scale.set(sz,sz,1);m.s.position.set(fallAt.x+m.dx,fallAt.y-25.5+m.t*2.5,fallAt.z+.5);m.s.material.opacity=Math.sin(m.t*Math.PI)*.55}
  /* den flyvende støvle svæver og slår med vingerne */
  if(BOOT){const b=BOOT.B;b.position.y=BOOT.Y0+.45*Math.sin(time*1.3);b.rotation.z=.03*Math.sin(time*.9);for(const w of BOOT.wings){const f=Math.sin(time*3.2+(w.s<0?.5:0));w.g.rotation.z=-.15+.38*f;w.g.rotation.y=w.s*.12*f}
    if(BOOT.sh){const k=1-.08*Math.sin(time*1.3);BOOT.sh.scale.set(k,k,1)}}
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
  const stepMs=[];for(let i=0;i<BUILD.length;i++){msgN.textContent=`${i+1} af ${N}`;await wait();const t1=performance.now();if(i===0){/* byens tilfældigheder starter samme sted som før figurerne blev skiftet, så intet flytter sig */rnd=rng(20261118);for(let q=0;q<499333;q++)rnd()}BUILD[i]();stepMs.push(Math.round(performance.now()-t1))}window.__steps=stepMs;
  msgN.textContent=`${N-1} af ${N}`;await wait();buildLive();W0.sh=blob(4.6,2.3);C0.sh=blob(3,1.6);
  msgN.textContent=`${N} af ${N}`;await wait();
  if(BOOT){const c=cv(128,64),g2=c.getContext('2d'),gr=g2.createRadialGradient(64,32,0,64,32,64);gr.addColorStop(0,'rgba(10,6,20,.62)');gr.addColorStop(.55,'rgba(10,6,20,.35)');gr.addColorStop(1,'rgba(10,6,20,0)');g2.setTransform(1,0,0,.5,0,16);g2.fillStyle=gr;g2.fillRect(0,0,128,128);
    BOOT.sh=new THREE.Mesh(new THREE.PlaneGeometry(21,5.5),new THREE.MeshBasicMaterial({map:tx(c,false),transparent:true,depthWrite:false}));BOOT.sh.rotation.x=-Math.PI/2;live.add(BOOT.sh);BOOT.sh.position.set(BOOT.X-.8,TOP+.12,BOOT.Z+1.6)}
  HOUSES=footprints().filter(f=>SPOTS[f[0]]).map(f=>[f[0],f[1],f[2],f[3]-10,f[4]]);
  renderer.compile(scene,cam);bake();renderer.compile(live,cam);
  window.__kort={live,POIS,bridgeY,W0,C0,NET,goTo,scene,cam,HOUSE,HOUSEG,PATHS,PATHLINES,SPOTS,RIVER,PROPS,footprints,THREE,CD,liveObj:()=>({drage:dragon.root,enhjørning:unicorn.root,trold:troll.root}),
    center:(x,y,z)=>{const v=new THREE.Vector3(x,y,z);cam.clearViewOffset();v.project(cam);vx=(v.x+1)/2*FW-VW/2;vy=(1-v.y)/2*FH-VH/2;dragT=1e9;velX=velY=0;applyView()},view:()=>({vx,vy,FW,FH,VW,VH}),walkers,bake,time:()=>time,paintMs:performance.now()-t0};
  requestAnimationFrame(t=>{last=t;frame(t);requestAnimationFrame(()=>{readyAt=performance.now();msg.classList.add('gone')})})}catch(e){msgN.textContent='Fejl: '+e.message;console.error(e)}})();
