/* ============ fælles for rummene i spillet: scene, lys, kamera, tryk og træk, og løkken der holder rummet i live ============ */
const glowSprite=(col,size)=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(size,size,1);return s};
/* kameraet stilles, så et felt på W×H enheder omkring (cx,cy) altid er med; panel er pladsen til en menu i højre side */
const fitBox=(W,H,cx,cy,{panel=false,tilt=.1,CD=150}={})=>(c,w,h)=>{const asp=w/h,pf=panel&&asp>1.25?(Math.min(.3*w,340)+24)/w:0,HH=Math.max(H,W/(1-pf)/asp);c.fov=2*Math.atan(HH/2/CD)*180/Math.PI;const x=cx+HH*asp*pf/2;c.position.set(x,cy+1+CD*Math.sin(tilt),CD*Math.cos(tilt));c.lookAt(x,cy,0)};
/* fjerner alt i en gruppe og slipper det, den selv har malet */
const emptyGroup=g=>{g.traverse(q=>{if(q===g)return;if(q.geometry&&!q.isSprite)q.geometry.dispose();for(const m of(q.material?(Array.isArray(q.material)?q.material:[q.material]):[]))if(m.userData&&m.userData.own){if(m.map)m.map.dispose();if(m.bumpMap)m.bumpMap.dispose();m.dispose()}});g.clear()};
function makeRoom(ctx,o){
  const scene=new THREE.Scene(),live=new THREE.Scene(),bg=o.bg||'#120e1a';scene.background=new THREE.Color(bg);
  scene.environment=live.environment=ctx.env;scene.environmentIntensity=.3;live.environmentIntensity=.35;
  const K=Object.assign({pos:[-28,62,110],tgt:[-4,16,0],box:[-56,56,52,-10],col:'#ffe2c4',i:2},o.key);
  let lysL=null;for(const sc of[scene,live]){const k=new THREE.DirectionalLight(K.col,K.i);if(sc===live)lysL=k;k.position.set(...K.pos);k.target.position.set(...K.tgt);sc.add(k,k.target);k.castShadow=true;k.shadow.mapSize.set(2048,2048);Object.assign(k.shadow.camera,{left:K.box[0],right:K.box[1],top:K.box[2],bottom:K.box[3],near:40,far:280});k.shadow.bias=-.0006;k.shadow.normalBias=.05;k.shadow.radius=2.5}
  scene.add(new THREE.HemisphereLight(o.sky||'#b8a8ff',o.ground||'#3a2a20',o.amb||.5));live.add(new THREE.HemisphereLight(o.sky||'#c8b8ff',o.ground||'#4a3628',(o.amb||.5)+.25));{const r=new THREE.DirectionalLight('#9fb6ff',.5);r.position.set(50,40,-40);live.add(r)}
  const CD=150,cam=new THREE.PerspectiveCamera(30,1,20,600);
  const ST=makeStage({scene,live,cam,CD,fit:o.fit,P_:Object.assign({aoR:.45,dof:[.05,.14],haze:[2,3,0],bloom:1.1,bg},o.P_)});
  const Rm={ctx,scene,live,cam,ST,t:0,glows:[],taps:[],ready:false};ctx.room={scenes:[scene,live],ST,cam};
  /* lysskær der blafrer lidt */
  Rm.glow=(x,y,z,col,size,flick=false,parent=live)=>{const s=glowSprite(col,size);s.position.set(x,y,z);parent.add(s);const g={s,size,flick,ph:R(TAU)};Rm.glows.push(g);return g};
  /* noget der ligger fladt på gulvet: formen gives som [x,z] */
  Rm.floor=(shape,po,y=0,parent=scene)=>{const m=piece(toCCW(shape.map(([x,z])=>[x,-z])),po);m.rotation.x=-Math.PI/2;return put(parent,m,0,y,0)};
  Rm.blob=(x,z,w,d,a=.55)=>{const c=cv(128,64),g=c.getContext('2d'),gr=g.createRadialGradient(64,32,0,64,32,64);gr.addColorStop(0,`rgba(10,6,20,${a})`);gr.addColorStop(1,'rgba(10,6,20,0)');g.setTransform(1,0,0,.5,0,16);g.fillStyle=gr;g.fillRect(0,0,128,128);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:tx(c,false),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.45,z);m.userData.noShadow=true;live.add(m);return m};
  /* et drys af gnister, når noget skifter */
  const sp=[];Rm.burst=(x,y,z,n=12,col='rgba(255,236,170,.95)',r=5)=>{while(sp.length<n){const s=glowSprite(col,1);s.visible=false;live.add(s);sp.push({s,t:9})}for(let i=0;i<n;i++){const q=sp[i];q.t=R(0,.2);q.x=x+R(-r,r);q.y=y+R(-r*.7,r*.7);q.z=z;q.vx=R(-5,5);q.vy=R(2,9)}};
  Rm.tap=(obj,fn)=>{Rm.taps.push({obj,fn});return obj};Rm.untap=obj=>{Rm.taps=Rm.taps.filter(t=>t.obj!==obj)};
  Rm.shadows=root=>root.traverse(q=>{if(!q.isMesh)return;const s=!q.userData.noShadow;q.castShadow=s;q.receiveShadow=s});/* noShadow slår nu også skyggen fra, som piece() selv sætter (Kosteflyvning havde 2.461 ting, der kastede skygge hvert billede) */
  Rm.rebake=()=>{if(Rm.ready)ST.bake()};
  /* kvaliteten: se KVAL i spil0.js */
  const PR0=renderer.getPixelRatio(),rid=ctx.id||'rum';let niv=typeof KVAL!=='undefined'?Math.min(3,KVAL.niveau(rid)):0,skN=0,skHver=1;
  const anvend=n=>{const pr=PR0*[1,1,.8,.65][n];skHver=[1,2,3,0][n];const sz=n?1024:2048;if(lysL){lysL.castShadow=n<3;if(lysL.shadow.mapSize.x!==sz){lysL.shadow.mapSize.set(sz,sz);if(lysL.shadow.map){lysL.shadow.map.dispose();lysL.shadow.map=null}}}
    renderer.shadowMap.autoUpdate=skHver===1;const skift=Math.abs(renderer.getPixelRatio()-pr)>.01;if(skift)renderer.setPixelRatio(pr);return skift};
  ST.foerLive=()=>{if(skHver>1)renderer.shadowMap.needsUpdate=(++skN%skHver)===0};
  anvend(niv);Rm.niveau=()=>niv;
  ctx.efter.push(()=>{renderer.shadowMap.autoUpdate=true;if(Math.abs(renderer.getPixelRatio()-PR0)>.01)renderer.setPixelRatio(PR0)});
  const maal=[];let maalFra=0;
  const maalTik=(raw,now)=>{if(niv>=3||document.hidden)return;if(now<maalFra)return;maal.push(Math.min(raw,.5));if(maal.length<90&&!(maal.length>=12&&Math.min(...maal)>.1))return;
    const s=maal.slice().sort((a,b)=>a-b),med=s[s.length>>1];maal.length=0;if(med>1/36){niv++;if(typeof KVAL!=='undefined')KVAL.saet(rid,niv);if(typeof LOG!=='undefined')LOG.row('kvalitet',{rum:rid,niveau:niv,ms:Math.round(med*1000)});if(anvend(niv))ST.bake();maalFra=now+1500}};
  /* tryk og træk */
  const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),el=renderer.domElement;ray.camera=cam;let down=null;
  const setRay=e=>{const r=el.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));ray.setFromCamera(ndc,cam)};
  Rm.planeAt=(e,z=0)=>{setRay(e);const p=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-z),p)?p:null};
  Rm.groundAt=(e,y=0)=>{setRay(e);const p=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),p)?p:null};
  /* skjulte ting kan ikke trykkes på: den usynlige sæbeboble i Boblebutikken lå efter første køb foran tøjkrukken og tog trykkene (Kasper 23. nov.: tøj kunne ikke købes) */
  const synlig=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
  const pick=e=>{setRay(e);let best=null;for(const t of Rm.taps){const h=ray.intersectObject(t.obj,true).find(q=>!q.object.isSprite&&synlig(q.object));if(h&&(!best||h.distance<best.h.distance))best={t,h}}return best};
  const onDown=e=>{if(!ctx.alive||!Rm.ready||down)return;if(o.fast){const b=pick(e);if(b)b.t.fn(b.h,e);else if(o.miss)o.miss(e,Rm);return}/* hurtige spil reagerer, i det øjeblik fingeren rører */
    down={x:e.clientX,y:e.clientY,drag:false,id:e.pointerId};if(o.drag)o.drag('start',e,Rm)};
  const onMove=e=>{if(!down||e.pointerId!==down.id)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)down.drag=true;if(o.drag)o.drag('move',e,Rm)};
  const onUp=e=>{if(!down||e.pointerId!==down.id)return;const d=down;down=null;if(o.drag)o.drag('end',e,Rm);if(!d.drag&&ctx.alive){const b=pick(e);if(b)b.t.fn(b.h,e);else if(o.miss)o.miss(e,Rm)}};
  el.addEventListener('pointerdown',onDown);addEventListener('pointermove',onMove);addEventListener('pointerup',onUp);addEventListener('pointercancel',onUp);
  ctx.cleanup=()=>{el.removeEventListener('pointerdown',onDown);removeEventListener('pointermove',onMove);removeEventListener('pointerup',onUp);removeEventListener('pointercancel',onUp)};
  (async()=>{try{await SKRIFTER;const t0=performance.now();for(const s of(o.build(Rm)||[])){await new Promise(r=>setTimeout(r,0));if(!ctx.alive)return;s()}
    /* hvert stykke papir i det levende lag tegnes i én omgang i stedet for tre, når siderne er samme slags papir */if(!ctx.helFarve&&!window.__udenEnFarve)enFarve(live);Rm.shadows(live);const t1=performance.now();ST.bake();Rm.ready=true;window.__rumRm=Rm;window.__rumtid={malet:Math.round(t1-t0),bagt:Math.round(performance.now()-t1)};ctx.ready();let last=performance.now();maalFra=last+1500;
    const loop=now=>{if(!ctx.alive)return;requestAnimationFrame(loop);const raw=(now-last)/1000,dt=Math.max(0,Math.min(.05,raw));last=now;maalTik(raw,now);Rm.t+=dt;
      for(const g of Rm.glows){const f=g.flick?(.9+.1*Math.sin(Rm.t*9+g.ph)*Math.sin(Rm.t*5.1+g.ph)):(.93+.07*Math.sin(Rm.t*2+g.ph));g.s.scale.set(g.size*f,g.size*f,1)}
      for(const q of sp){q.t+=dt;if(q.t>1){q.s.visible=false;continue}q.s.visible=q.t>0;q.s.position.set(q.x+q.vx*q.t,q.y+q.vy*q.t-5*q.t*q.t,q.z);const zz=(1-q.t)*1.8;q.s.scale.set(zz,zz,1)}
      if(o.tick)o.tick(Rm.t,dt,Rm);ST.draw()};requestAnimationFrame(loop)}catch(e){console.error(e);ctx.fail('Fejl: '+e.message,e)}})();
  return Rm}
