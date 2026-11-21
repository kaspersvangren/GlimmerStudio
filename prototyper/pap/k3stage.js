/* ============ en scene der bages én gang (lys, skygger, kontaktskygger, dybde, glød) med et levende lag ovenpå ============ */
function makeStage({cam,CD,fit,P_={},scene:bagt=scene,live:levende=live}){/* scenerne gives med, så flere rum kan leve i samme spil */P_=Object.assign({aoR:.75,dof:[.11,.3],haze:[1.08,1.45,.38],hazeC:[.075,.06,.16],bloom:1,bg:'#0d0a12'},P_);
  const blitSrc=()=>({depthTest:true,depthWrite:true,depthFunc:THREE.AlwaysDepth,toneMapped:false,
    uniforms:{tColor:{value:null},tDepth:{value:null},uOff:{value:new THREE.Vector2(0,0)},uScl:{value:new THREE.Vector2(1,1)}},
    vertexShader:`uniform vec2 uOff;uniform vec2 uScl;varying vec2 vUv;void main(){vUv=uOff+uv*uScl;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`uniform sampler2D tColor;uniform sampler2D tDepth;varying vec2 vUv;
void main(){gl_FragColor=texture2D(tColor,vUv);gl_FragDepth=texture2D(tDepth,vUv).x;}`});
  const blitMat=new THREE.ShaderMaterial(blitSrc()),copyMat=new THREE.ShaderMaterial(blitSrc());
  const blitCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
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
  const coM=mk(`uniform sampler2D tC,tD,tAO,tB1,tB2,tDof;uniform vec2 px,apx;uniform float zf,expo,seed,dofA,dofB,hz0,hz1,hzS,bloomK;uniform vec3 hzC;${LIN}varying vec2 vUv;
vec3 fit(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=expo/.6;return clamp(O*fit(I*c),0.,1.);}
vec3 srgb(vec3 c){return mix(pow(c,vec3(1./2.4))*1.055-.055,c*12.92,step(c,vec3(.0031308)));}
void main(){vec3 c=texture2D(tC,vUv).rgb;float z=lin(texture2D(tD,vUv).x);
 float ao=0.;ao+=texture2D(tAO,vUv).r*.4;ao+=texture2D(tAO,vUv+vec2(apx.x,0.)).r*.15;ao+=texture2D(tAO,vUv-vec2(apx.x,0.)).r*.15;ao+=texture2D(tAO,vUv+vec2(0.,apx.y)).r*.15;ao+=texture2D(tAO,vUv-vec2(0.,apx.y)).r*.15;
 c*=mix(1.,ao,.9);
 float rel=abs(z-zf)/zf,coc=smoothstep(dofA,dofB,rel)*.9;vec3 b=texture2D(tDof,vUv).rgb;c=mix(c,b*mix(1.,ao,.9),coc);
 c+=(texture2D(tB1,vUv).rgb*.3+texture2D(tB2,vUv).rgb*.28)*bloomK;
 float hz=smoothstep(zf*hz0,zf*hz1,z)*hzS;c=mix(c,hzC,hz);
 vec3 t=srgb(aces(c));
 float l=dot(t,vec3(.299,.587,.114));t=mix(vec3(l),t,1.04);t=t+(vec3(.012,-.004,.03))*(1.-l)+(vec3(.02,.008,-.02))*l;t=mix(t,t*t*(3.-2.*t),.12);
 t+=(fract(sin(dot(vUv*vec2(12.9898,78.233)+seed,vec2(1.,1.)))*43758.5453)-.5)/255.;
 gl_FragColor=vec4(t,1.);}`,{tC:{value:null},tD:{value:null},tAO:{value:null},tB1:{value:null},tB2:{value:null},tDof:{value:null},px:{value:new THREE.Vector2()},apx:{value:new THREE.Vector2()},zf:{value:CD},expo:{value:1.1},seed:{value:0},dofA:{value:.11},dofB:{value:.3},hz0:{value:1.08},hz1:{value:1.45},hzS:{value:.38},bloomK:{value:1},hzC:{value:new THREE.Vector3(.075,.06,.16)},...U()});
  const RT=(w,h,hf=true)=>new THREE.WebGLRenderTarget(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)),{type:hf?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:false});
  const pass=(mat,rt)=>{q.material=mat;renderer.setRenderTarget(rt);renderer.render(sc,blitCam)};
  const blur=(src,tmp,dst,w,h,s=1.5)=>{blM.uniforms.tC.value=src.texture;blM.uniforms.dir.value.set(s/w,0);pass(blM,tmp);blM.uniforms.tC.value=tmp.texture;blM.uniforms.dir.value.set(0,s/h);pass(blM,dst)};
  let fin=null;
  function run(big,FW,FH){const tmp=[];const mkT=(w,h,hf)=>{const r=RT(w,h,hf);tmp.push(r);return r};
    /* kontaktskygge i halv opløsning */
    const aw=FW/2,ah=FH/2,ao=mkT(aw,ah,false);const wpp=2*CD*Math.tan(cam.fov*Math.PI/360)/FH;
    Object.assign(aoM.uniforms,{});aoM.uniforms.tDepth.value=big.depthTexture;aoM.uniforms.px.value.set(1/FW,1/FH);aoM.uniforms.rad.value=P_.aoR/wpp;aoM.uniforms.near.value=cam.near;aoM.uniforms.far.value=cam.far;pass(aoM,ao);
    /* glød fra lamper, vinduer og vand */
    const b1=mkT(FW/4,FH/4),b1t=mkT(FW/4,FH/4),b2=mkT(FW/8,FH/8),b2t=mkT(FW/8,FH/8);
    brM.uniforms.tC.value=big.texture;brM.uniforms.px.value.set(1/FW,1/FH);pass(brM,b1);blur(b1,b1t,b1,FW/4,FH/4,1.6);
    blM.uniforms.tC.value=b1.texture;blM.uniforms.dir.value.set(0,0);pass(blM,b2);blur(b2,b2t,b2,FW/8,FH/8,1.8);blur(b2,b2t,b2,FW/8,FH/8,2.6);
    /* sløret udgave til dybdeskarpheden */
    const d1=mkT(FW/2,FH/2),d1t=mkT(FW/2,FH/2);blM.uniforms.tC.value=big.texture;blM.uniforms.dir.value.set(.5/FW,0);pass(blM,d1t);blM.uniforms.tC.value=d1t.texture;blM.uniforms.dir.value.set(0,.5/FH);pass(blM,d1);blur(d1,d1t,d1,FW/2,FH/2,1.4);
    if(fin)fin.dispose();fin=RT(FW,FH,false);
    Object.assign(coM.uniforms,{});const u=coM.uniforms;u.tC.value=big.texture;u.tD.value=big.depthTexture;u.tAO.value=ao.texture;u.tB1.value=b1.texture;u.tB2.value=b2.texture;u.tDof.value=d1.texture;u.apx.value.set(2/FW,2/FH);u.near.value=cam.near;u.far.value=cam.far;u.seed.value=R(10);u.zf.value=CD;u.dofA.value=P_.dof[0];u.dofB.value=P_.dof[1];u.hz0.value=P_.haze[0];u.hz1.value=P_.haze[1];u.hzS.value=P_.haze[2];u.bloomK.value=P_.bloom;u.hzC.value.set(...P_.hazeC);
    pass(coM,fin);renderer.setRenderTarget(null);for(const r of tmp)r.dispose();return fin}
  return{run,dispose(){q.geometry.dispose();if(fin)fin.dispose();fin=null;for(const m of[aoM,brM,blM,coM])m.dispose()}}})();
  const blitScene=new THREE.Scene(),copyScene=new THREE.Scene();
  for(const[sc,mat]of[[blitScene,blitMat],[copyScene,copyMat]]){const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;sc.add(q)}
  renderer.setClearColor(P_.bg);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  let big=null,baked=false;const S={bakeMs:0};
  S.bake=function(){const t0=performance.now();const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);cam.clearViewOffset();cam.aspect=w/h;fit(cam,w,h);cam.updateProjectionMatrix();cam.updateMatrixWorld();const d=renderer.getDrawingBufferSize(new THREE.Vector2());
    const FW=d.x,FH=d.y;if(big)big.dispose();
    big=new THREE.WebGLRenderTarget(FW,FH,{type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(FW,FH)});
    const tile=new THREE.WebGLRenderTarget(FW,FH,{samples:4,type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(FW,FH)});
    renderer.autoClear=false;renderer.shadowMap.enabled=true;renderer.shadowMap.needsUpdate=true;
    renderer.setRenderTarget(tile);renderer.clear();renderer.render(bagt,cam);
    copyMat.uniforms.tColor.value=tile.texture;copyMat.uniforms.tDepth.value=tile.depthTexture;
    renderer.setRenderTarget(big);renderer.clear();renderer.render(copyScene,blitCam);renderer.setRenderTarget(null);tile.dispose();
    const fin=POST.run(big,FW,FH);blitMat.uniforms.tColor.value=fin.texture;blitMat.uniforms.tDepth.value=big.depthTexture;baked=true;S.bakeMs=performance.now()-t0};
  S.draw=function(){if(!baked)return;renderer.autoClear=false;renderer.setRenderTarget(null);renderer.clear(true,true,false);renderer.render(blitScene,blitCam);renderer.render(levende,cam)};
  let rt=0;const ro=new ResizeObserver(()=>{if(!baked)return;clearTimeout(rt);rt=setTimeout(S.bake,250)});ro.observe(stage);
  /* når rummet forlades: slip billederne igen, så næste rum har pladsen */
  S.dispose=function(){ro.disconnect();clearTimeout(rt);baked=false;if(big){big.depthTexture.dispose();big.dispose();big=null}POST.dispose();blitMat.dispose();copyMat.dispose();for(const sc of[blitScene,copyScene])sc.children[0].geometry.dispose()};
  return S}
