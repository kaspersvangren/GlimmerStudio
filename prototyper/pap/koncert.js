/* ============ Koncertsalen indefra: et papirteater med gnome-band, fløjlstæppe og publikum ============
   Salen bages én gang. Bandet, tæppet, kulisserne og lyset ligger i det levende lag, så man kan ønske en sang. */
const scene=new THREE.Scene(),live=new THREE.Scene();scene.background=new THREE.Color('#120a14');
{let env=(typeof ctx!=='undefined')?ctx.env:null;/* i spillet lånes byens omgivelseslys */if(!env){const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);env=pm.fromEquirectangular(e).texture;pm.dispose();e.dispose()}scene.environment=env;live.environment=env;scene.environmentIntensity=live.environmentIntensity=.3;}
const key=new THREE.DirectionalLight('#ffd8b0',1.5);key.position.set(-30,80,140);key.target.position.set(0,20,0);scene.add(key,key.target);
key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-90,right:90,top:70,bottom:-20,near:40,far:320});key.shadow.bias=-.0004;key.shadow.normalBias=.05;key.shadow.radius=3;
scene.add(new THREE.HemisphereLight('#c9a8ff','#3a2018',.45));
const liveHemi=new THREE.HemisphereLight('#ffe2c0','#3a2018',.9);live.add(liveHemi);const liveKey=new THREE.DirectionalLight('#fff0dc',1.1);liveKey.position.set(-20,60,120);live.add(liveKey);
const SPOTS={},BUILD=[],HOUSE_=0;
const starPts=(x,y,r1,r2,rot=0)=>{const o=[];for(let i=0;i<10;i++){const a=Math.PI/2+rot+i/10*TAU,r=i%2?r2:r1;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}return o};
const sm=(cp,seg=8)=>outline(cp,seg,0);
const pc=(parent,shape,o,z=0)=>put(parent,piece(shape,Object.assign({edge:o.mat?undefined:hexOf(shade(hexOf(o.color||o.ed||'#5a3040'),-.45))},o)),0,0,z);
const flatP=(parent,shape,o,x,y,z)=>{const m=piece(shape,o);m.rotation.x=-Math.PI/2;return put(parent,m,x,y,z)};
const glowSprite=(col,size,add=true)=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));s.scale.set(size,size,1);return s};
const GL=[];/* glød der flakker */
const OPEN={x0:-31,x1:31,y0:6,y1:40},ZW=6.2;/* scenens åbning og murens plan */

/* ---- salens væg med tapet, panel og pilastre; scenens åbning er skåret ud ---- */
BUILD.push(()=>{const W=box(-95,-2,95,72),hole=sm([[OPEN.x0,OPEN.y0-.1,1],[OPEN.x1,OPEN.y0-.1,1],[OPEN.x1,OPEN.y1-3],[OPEN.x1-4,OPEN.y1],[0,OPEN.y1+2.4],[OPEN.x0+4,OPEN.y1],[OPEN.x0,OPEN.y1-3]],6);
  for(const sh of clip([W],[hole],'diff'))put(scene,piece(sh,{t:.6,s:8,cap:1800,paint:P=>{P.wash('#5a1a2c',W,{top:'#3a1022',edge:0,clouds:14});
      for(let y=12;y<72;y+=6)for(let x=-95+((y/6)%2?3:0);x<95;x+=6){const d=[[x,y-1.6],[x+1.1,y],[x,y+1.6],[x-1.1,y]];P.fill(d,'#7a2a3e',.55);P.fill(circ(x,y,.35,.35,8),'#c9a04a',.45)}
      P.wash('#3a2010',box(-96,-3,96,10),{alpha:.95,edge:0,mode:'source-over',clouds:6});for(let x=-94;x<95;x+=8){P.score([...box(x+.6,1.2,x+7.4,8.4),[x+.6,1.2]],{w:.12,ink:.4,dark:'#1a0c06'})}}}),0,0,ZW);
  pieces(ring(hole,1.6),{mat:gold(),t:.5},scene,0,0,ZW+.5);pieces(ring(grow(hole,1.6)[0].outer,.7),{color:'#7a1a2a',kind:'water',t:.4},scene,0,0,ZW+.45);
  pieces(ring(hole,.45),{color:'#3a1a10',t:.3},scene,0,0,ZW+.75);
  /* lyre-skjoldet over scenen */
  pc(scene,circ(0,OPEN.y1+3.4,7.2,3.4,48),{mat:gold(),t:.3},ZW+.9);pc(scene,circ(0,OPEN.y1+3.4,6.4,2.7,48),{color:'#2a0e18',t:.3},ZW+1);
  {const L=[];L.push(thick([curve([[-2.2,OPEN.y1+1.4],[-3,OPEN.y1+3.6],[-1.6,OPEN.y1+5.4]],8),curve([[2.2,OPEN.y1+1.4],[3,OPEN.y1+3.6],[1.6,OPEN.y1+5.4]],8),[[-1.8,OPEN.y1+1.6],[1.8,OPEN.y1+1.6]],[[-1.3,OPEN.y1+5],[1.3,OPEN.y1+5]]],.28));for(const x of[-.7,0,.7])L.push(thick([[[x,OPEN.y1+1.7],[x,OPEN.y1+4.9]]],.06));for(const s of L)pieces(s,{mat:gold(),t:.1},scene,0,0,ZW+1.2)}
  /* pilastre på hver side af scenen, med lamper */
  for(const s of[-1,1]){const x=s*(OPEN.x1+6);pc(scene,box(x-2.4,0,x+2.4,58),{color:'#4a2a18',kind:'balsa',t:.8},ZW+.5);pc(scene,box(x-2.9,56,x+2.9,58.6),{mat:gold(),t:1},ZW+.7);pc(scene,box(x-2.9,0,x+2.9,2.4),{mat:gold(),t:1},ZW+.7);
    for(let y=4;y<55;y+=6.5)pc(scene,box(x-1.4,y,x+1.4,y+5),{color:'#5a3420',kind:'balsa',t:.2},ZW+1);
    pc(scene,sm([[x-1.2,30],[x+1.2,30],[x+1.6,33.4],[x,35],[x-1.6,33.4]],5),{mat:gold(),t:.6},ZW+1.3);pc(scene,box(x-.9,31,x+.9,33.6),{t:.05,mat:paperMat('#fff2d0','tissue',{glow:'#ffcf7a',gi:2})},ZW+1.55);
    GL.push({p:new THREE.Vector3(x,32.4,ZW+2.2),c:'rgba(255,210,140,.9)',s:9})}
  /* scenens forkant og gulv */
  pc(scene,box(OPEN.x0-1,0,OPEN.x1+1,OPEN.y0),{t:.5,s:14,paint:P=>{P.wash('#5a3420',null,{edge:0});for(let x=OPEN.x0;x<OPEN.x1;x+=2.4)P.score([[x,0],[x,6]],{w:.1,ink:.4,dark:'#1a0c06'});P.wash('#2a1408',box(-40,-1,40,1.2),{alpha:.5,edge:0})}},8.2);
  pc(scene,box(OPEN.x0-1.2,OPEN.y0-.6,OPEN.x1+1.2,OPEN.y0+.2),{mat:gold(),t:.6},8.5);
  flatP(scene,box(OPEN.x0-1,-8.4,OPEN.x1+1,16),{t:.3,s:12,paint:P=>{P.wash('#8a5a34',null,{edge:0,top:'#a06c3e'});for(let y=-16;y<9;y+=1.6){P.score([[-40,y],[40,y]],{w:.08,ink:.35,dark:'#3a1a08'});for(let x=-40+R(0,8);x<40;x+=R(6,12))P.score([[x,y],[x,y+1.6]],{w:.06,ink:.3,dark:'#3a1a08'})}}},0,OPEN.y0,0);
  /* fodlys i messingskåle */
  for(let k=0;k<9;k++){const x=mix(OPEN.x0+3,OPEN.x1-3,k/8);pc(scene,sm([[x-1.3,OPEN.y0-.2],[x+1.3,OPEN.y0-.2],[x+1,OPEN.y0+.9],[x-1,OPEN.y0+.9]],4),{mat:gold(),t:.8},8.9);GL.push({p:new THREE.Vector3(x,OPEN.y0+1.1,9.1),c:'rgba(255,230,170,.9)',s:5})}
  {const L=new THREE.PointLight('#ffd9a0',160,60,2);put(scene,L,0,10,14)}
  /* salens gulv: tæppe */
  flatP(scene,box(-95,-80,95,-6),{color:'#4a1420',kind:'water',t:.3},0,0,0)});

/* ---- ophængte kulisser (bagved) og den faste kappe med frynser foran ---- */
BUILD.push(()=>{for(const s of[-1,1])for(const[z,w,c]of[[-4,4.2,'#3a0e1c'],[-10,4.6,'#2e0a16']]){const x=s*(OPEN.x1-w/2+1);pc(scene,sm([[x-w/2,OPEN.y0],[x+w/2,OPEN.y0],[x+w/2,OPEN.y1+2],[x-w/2,OPEN.y1+2]],2),{t:.2,s:10,paint:P=>{P.wash(c,null,{edge:0});for(let k=0;k<5;k++)P.wash(shade(c,.15),box(x-w/2+k*w/5,0,x-w/2+k*w/5+w/10,50),{alpha:.5,edge:.4})}},z)}
  const v=[[OPEN.x1+1,OPEN.y1+3],[OPEN.x0-1,OPEN.y1+3]];for(let k=0;k<=7;k++){const x0=mix(OPEN.x0-1,OPEN.x1+1,k/7),x1=mix(OPEN.x0-1,OPEN.x1+1,(k+1)/7);if(k===7)break;for(let i=0;i<=8;i++){const t=i/8;v.push([mix(x0,x1,t),OPEN.y1-2.2-Math.sin(t*Math.PI)*3.2])}}
  const swag=toCCW(v);pc(scene,swag,{t:.25,s:16,paint:P=>{P.wash('#a0142a',swag,{top:'#c02838',edge:.6,clouds:6});for(let k=0;k<7;k++){const x0=mix(OPEN.x0-1,OPEN.x1+1,k/7),x1=mix(OPEN.x0-1,OPEN.x1+1,(k+1)/7);for(const d of[.3,.6,.9])P.score(curve([[x0,OPEN.y1+1-d*2],[(x0+x1)/2,OPEN.y1-1-d*3.2],[x1,OPEN.y1+1-d*2]],8),{w:.1,ink:.4,dark:'#4a0610'})}}},5.2);
  for(let k=0;k<7;k++){const x0=mix(OPEN.x0-1,OPEN.x1+1,k/7),x1=mix(OPEN.x0-1,OPEN.x1+1,(k+1)/7),f=[];for(let i=0;i<=8;i++){const t=i/8;f.push([mix(x0,x1,t),OPEN.y1-2.2-Math.sin(t*Math.PI)*3.2])}pieces(thick([f],.35),{mat:gold(),t:.15},scene,0,0,5.45);
    pc(scene,sm([[x1-.45,OPEN.y1-1.6],[x1+.45,OPEN.y1-1.6],[x1+.6,OPEN.y1-3.6],[x1,OPEN.y1-4.2],[x1-.6,OPEN.y1-3.6]],4),{mat:gold(),t:.4},5.6)}});

/* ---- logerne på siderne og lysekroner ---- */
BUILD.push(()=>{for(const s of[-1,1]){const cx=s*58;
    pc(scene,box(cx-16,20,cx+16,40),{color:'#140810',t:.3},ZW+.2);
    for(let k=0;k<6;k++){const x=cx-12+k*4.8,hd=[...circ(x,31.6,1.25,1.4,20)];const hat=k%3===0?[[x-2.2,32.6],[x+2.2,32.6],[x,36.6]]:k%3===1?box(x-1.1,32.4,x+1.1,34.8):[[x-1.6,32.4],[x+1.6,32.4],[x+1.2,33.4],[x-1.2,33.4]];pieces(clip([hd,sm([[x-2.6,26],[x+2.6,26],[x+2,29.4],[x,30.4],[x-2,29.4]],4),hat],[],'union'),{color:'#22101e',t:.1,edge:'#5a3a6a'},scene,0,0,ZW+.5)}
    const rail=sm([[cx-17,19],[cx+17,19],[cx+17.4,22],[cx+16,27.6],[cx,28.6],[cx-16,27.6],[cx-17.4,22]],6);pc(scene,rail,{t:.6,s:14,paint:P=>{P.wash('#7a1a2a',rail,{top:'#9a2436',edge:.5});for(let x=cx-15;x<cx+16;x+=3)P.fill(circ(x,23.4,.9,1.4,16),'#c9a04a',.6)}},ZW+1.4);
    pieces(thick([curve([[cx-17.4,27.8],[cx,28.9],[cx+17.4,27.8]],10)],.4),{mat:gold(),t:.3},scene,0,0,ZW+1.8);
    for(const e of[-1,1]){const dx=cx+e*15,dr=sm([[dx-e*1.5,40],[dx+e*2,40],[dx+e*2.4,29],[dx+e*.6,30.6],[dx-e*.2,36]],6);pc(scene,toCCW(dr),{color:'#a0142a',kind:'water',t:.25},ZW+1)}
    const top=toCCW([[cx-17,40.6],[cx+17,40.6],[cx+17,38],[cx+8,35.4],[cx,36.6],[cx-8,35.4],[cx-17,38]]);pc(scene,top,{color:'#8a1224',kind:'water',t:.3},ZW+1.1);pieces(thick([[[cx-17,38],[cx-8,35.4],[cx,36.6],[cx+8,35.4],[cx+17,38]]],.25),{mat:gold(),t:.12},scene,0,0,ZW+1.3)}
  /* lysekroner */
  for(const s of[-1,1]){const g=new THREE.Group();put(scene,g,s*42,56,22);cord(g,[[0,0,0],[0,20,0]],.08,'#c9a04a');
    pc(g,circ(0,-1,1.2,1.2,20),{mat:gold(),t:1.2},0);pieces(thick([curve([[-7,-1.6],[-3.6,-3.4],[0,-2.4],[3.6,-3.4],[7,-1.6]],10)],.3),{mat:gold(),t:.6},g,0,0,0);
    for(const x of[-7,-3.6,0,3.6,7]){const y=x===0?-2.4:Math.abs(x)>5?-1.6:-3.4;pc(g,box(x-.3,y,x+.3,y+1.6),{color:'#f6efe0',kind:'water',t:.6},.2);pc(g,circ(x,y,.7,.25,12),{mat:gold(),t:.8},.1);GL.push({p:new THREE.Vector3(s*42+x,56+y+2.1,22.6),c:'rgba(255,220,150,.95)',s:4.2,f:1})}
    for(let k=0;k<7;k++){const x=-6+k*2;cord(g,[[x,-2.6,.3],[x,-4.6-Math.abs(x)*.12,.3]],.04,'#e8f2ff');pc(g,sm([[x-.25,-4.8-Math.abs(x)*.12],[x+.25,-4.8-Math.abs(x)*.12],[x,-5.6-Math.abs(x)*.12]],3),{color:'#dff2ff',t:.15},.3)}
    const L=new THREE.PointLight('#ffcf8a',90,50,2);put(g,L,0,-2,2);g.traverse(m=>{if(m.isMesh)m.castShadow=false})}});

/* ---- publikum ved små borde med lamper (forrest i billedet) ---- */
BUILD.push(()=>{const SIL='#170c18',EDGE='#5a3a6a';
  const person=(x,z,k,kind)=>{const g=new THREE.Group();put(scene,g,x,0,z);g.scale.setScalar(k);const hd=circ(0,9.6,1.6,1.8,24),body=sm([[-3.6,0],[3.6,0],[3.2,6.4],[1.6,7.8],[0,8.1],[-1.6,7.8],[-3.2,6.4]],5);
    const hats={heks:[[-3.2,10.6],[3.2,10.6],[.6,14.8],[1.8,15.6],[-.4,14.6]],top:box(-1.3,10.6,1.3,13.8).concat([[1.3,10.6]]).slice(0,4),horn:null,bowler:circ(0,11,1.9,1.2,18),knold:circ(0,11.6,1,1,16),ører:null};
    const parts=[hd,body];if(kind==='top'){parts.push(box(-1.4,10.6,1.4,14),box(-2.4,10.5,2.4,11.1))}else if(kind==='horn'){parts.push(sm([[-1.2,10.6],[-2.6,13.4],[-.5,11]],3),sm([[1.2,10.6],[2.6,13.4],[.5,11]],3))}else if(kind==='ører'){parts.push(sm([[-1.6,10],[-2.2,12.6],[-.6,10.8]],3),sm([[1.6,10],[2.2,12.6],[.6,10.8]],3))}else if(hats[kind])parts.push(toCCW(hats[kind]));
    pieces(clip(parts.map(toCCW),[],'union'),{color:SIL,t:.2,edge:EDGE},g,0,0,0)};
  const table=(x,z,k=1)=>{const g=new THREE.Group();put(scene,g,x,0,z);g.scale.setScalar(k);const top=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.2,.3,32),paperMat('#efe2c8','card'));top.castShadow=top.receiveShadow=true;put(g,top,0,6.6,0);
    const cl=new THREE.Mesh(new THREE.CylinderGeometry(4.25,4.6,1.6,32,1,true),paperMat('#6a1424','card'));cl.material=cl.material.clone();cl.material.side=THREE.DoubleSide;put(g,cl,0,6,0);
    stick(g,0,0,6.4,0,.5,'#2a1810');pc(g,sm([[-.8,6.8],[.8,6.8],[.5,7.6],[.3,8.6],[-.3,8.6],[-.5,7.6]],4),{mat:gold(),t:.8},0);pc(g,sm([[-1.6,8.6],[1.6,8.6],[1,10.4],[-1,10.4]],3),{t:.05,mat:paperMat('#ffe6c0','tissue',{glow:'#ff9a5a',gi:1.6})},.1);
    GL.push({p:new THREE.Vector3(x,9.6*k,z+.6),c:'rgba(255,170,110,.85)',s:7*k,f:1})};
  const kinds=['heks','top','bowler','horn','knold','ører'];
  for(const[z,xs,k]of[[20,[-72,-50,-30,30,50,72],.72],[36,[-62,-38,-14,14,38,62],.86]]){for(const x of xs){table(x,z,k*.9);person(x-4.8*k,z-2,k,kinds[Math.floor(R(kinds.length))]);person(x+4.6*k,z-1.6,k*.96,kinds[Math.floor(R(kinds.length))])}}});

/* ---- scenen har dybde: trommerne står på en forhøjning bagerst, bassen på en lavere til højre, sang og guitar forrest ---- */
const MARK=[{x:-14,z:2.6,ex:-1},{x:3,z:3.6,ex:1},{x:-3,z:-7.8,ex:-1},{x:15.5,z:-4.2,ex:1}];
const RIS=[{x0:-9.4,x1:3.4,z0:-11,z1:-4.2,h:2.6},{x0:9.6,x1:21.4,z0:-8,z1:-1.4,h:1.4}];
const floorY=(x,z)=>{for(const r of RIS)if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1+.4)return r.h;return 0};
BUILD.push(()=>{for(const r of RIS){pc(scene,box(r.x0,OPEN.y0,r.x1,OPEN.y0+r.h),{t:.3,s:20,paint:P=>{P.wash('#5a1a2c',null,{edge:0,top:'#7a2238'});P.pen([[r.x0,OPEN.y0+r.h-.25],[r.x1,OPEN.y0+r.h-.25]],'#c9a04a',.12,.9);for(let x=r.x0+.8;x<r.x1;x+=1.6)P.fill(starPts(x,OPEN.y0+r.h*.45,.32,.13),'#c9a04a',.7)}},r.z1);
    flatP(scene,box(r.x0,-r.z1,r.x1,-r.z0),{color:'#6a4426',kind:'balsa',t:.2},0,OPEN.y0+r.h,0)}
  /* trommesættet står fast på forhøjningen */
  {const dk=new THREE.Group();put(scene,dk,-3,OPEN.y0+RIS[0].h,-5.6);dk.scale.setScalar(.74);pc(dk,circ(0,3,2.8,2.8,40),{color:'#efe6d8',kind:'water',t:.6},0);pc(dk,ring(circ(0,3,2.8,2.8,40),.35)[0],{color:'#b0283a',t:.65},.05);pc(dk,circ(0,3,1.1,.8,24),{color:'#d84a4a',t:.08},.35);pc(dk,box(-.25,2,.25,3),{color:'#efe3c8',t:.06},.36);
    for(const sx of[-1,1]){pc(dk,circ(sx*3.6,5.6,1.2,.6,20),{color:'#efe6d8',kind:'water',t:.5},-.2);pc(dk,circ(sx*4.6,8.6,1.7,.28,20),{mat:gold(),t:.15},-.3);stick(dk,sx*4.6,0,8.4,-.3,.12,'#8a8a96')}}
  /* sangeren holder selv mikrofonen */
});

/* ============ det levende lag: kulisser, tæppe, band og lys ============ */
/* sangene: hver har sit bagtæppe, sine farver på hatte og trøjer, sit lys og en lille ting på gnomerne */
const STY={
  hygge:{n:'Hyggelig',hats:['#e05a8a','#3b6fd1','#f2c230','#2f8f86'],tun:['#3f7a4a','#c25a2e','#7a4fb0','#b0283a'],light:'#ffe2b0',bd:'nat',acc:null},
  rock:{n:'Rock',hats:['#1a1a22','#2a1a2e','#1a1a22','#3a1218'],tun:['#2a2a32','#5a1020','#2a2a32','#1a1a22'],light:'#ff4a7a',bd:'rock',acc:['nitter']},
  disko:{n:'Disko',tun:['#f2f2ff','#ff5ab4','#5ae0ff','#ffd23a'],light:'#c87aff',bd:'disko',acc:['glimmer','briller','krave'],hats:['#3a2a20','#e8843a','#7a3ab8','#e0457a']},
  hawaii:{n:'Hawaii',hats:['#f2a03a','#3ac0a0','#ff6a5a','#f2d23a'],tun:['#ff6a5a','#3ac0a0','#f2a03a','#5aa0ff'],light:'#ffb070',bd:'solnedgang',acc:['krans','blomsterskjorte']},
  klassisk:{n:'Klassisk',hats:['#1a1a2a','#1a1a2a','#1a1a2a','#1a1a2a'],tun:['#1a1a2a','#20203a','#1a1a2a','#20203a'],light:'#bcd4ff',bd:'klassisk',acc:'butterfly'},
  country:{n:'Country',hats:['#a0642a','#7a4a22','#c08040','#8a5a2a'],tun:['#c03a2a','#3a5aa0','#c08a3a','#5a8a3a'],light:'#ffc070',bd:'lade',acc:'halstørklæde'}};
let cur='hygge';
const BD={},BAND=[],SPOT=[];let curtain=null;
/* ---- bagtæpperne ---- */
function backdrop(kind){const g=new THREE.Group();put(live,g,0,0,-14);g.visible=false;const W=box(OPEN.x0-2,OPEN.y0,OPEN.x1+2,OPEN.y1+3);
  const sky=(top,bot,extra)=>pc(g,W,{t:.2,s:12,base:'water',paint:P=>{P.wash(bot,W,{top,edge:0,clouds:10});extra&&extra(P)}},0);
  if(kind==='nat'){sky('#14183a','#4a3a7a',P=>{for(let i=0;i<70;i++)P.fill(rnd()<.7?circ(R(-33,33),R(18,43),.12,.12,6):starPts(R(-33,33),R(22,43),.45,.17,R(1)),'#f6e7c0',R(.5,.9))});
    pc(g,circ(19,34,4,4,40),{color:'#f2e6c0',kind:'water',t:.15},.2);
    for(const[y,c,a,ph,z]of[[16,'#2a4a3a',3,.5,.4],[12,'#3a6a48',2.4,2,.6]]){const cp=[[OPEN.x1+2,OPEN.y0],[OPEN.x1+2,y]];for(let x=OPEN.x1;x>OPEN.x0-2;x-=2)cp.push([x,y+a*Math.sin(x*.12+ph)]);cp.push([OPEN.x0-2,y],[OPEN.x0-2,OPEN.y0]);pc(g,toCCW(cp),{color:c,kind:'water',t:.15},z)}
    for(const[x,s,c]of[[-24,1.2,'#e05a5a'],[-18,.8,'#7fd6ff'],[24,1,'#c9a0ff']]){pc(g,box(x-.4*s,OPEN.y0,x+.4*s,OPEN.y0+3*s),{color:'#efe3c8',kind:'water',t:.15},.8);const cap=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;cap.push([x+Math.cos(a)*2*s,OPEN.y0+3*s+Math.sin(a)*1.6*s])}pc(g,toCCW(cap),{color:c,t:.15},.85)}}
  if(kind==='rock'){sky('#0a0a14','#3a0a1e');for(const[x,y,k]of[[-20,30,1],[18,33,1.2],[2,38,.8]])pc(g,sm([[x-1,y+4*k],[x+2*k,y+4*k],[x+.4*k,y+1*k],[x+2.2*k,y+1*k],[x-1.6*k,y-4.4*k],[x-.2*k,y-.4*k],[x-2*k,y-.4*k]],2),{t:.05,mat:paperMat('#fff0a0','tissue',{glow:'#ffe23a',gi:2.2})},.3);
    for(let i=0;i<12;i++)pc(g,starPts(R(-30,30),R(12,42),R(.6,1.2),.3,R(1)),{t:.05,mat:paperMat('#ffd0f0','tissue',{glow:'#ff3a9a',gi:1.6})},.25)}
  if(kind==='disko'){sky('#200a3a','#6a1a7a',P=>{for(let i=0;i<120;i++)P.fill(circ(R(-33,33),R(8,43),R(.3,.7),R(.3,.7),10),['#ff5ab4','#5ae0ff','#ffd23a','#9a5aff'][i%4],.7)});
    const ball=new THREE.Mesh(new THREE.SphereGeometry(3,32,20),new THREE.MeshStandardMaterial({color:'#eef0ff',metalness:.55,roughness:.22,flatShading:true,emissive:'#5a4a8a',emissiveIntensity:.6}));put(g,ball,0,29.5,4);g.userData.ball=ball;cord(g,[[0,32.5,4],[0,46,4]],.06,'#c9a04a')}
  if(kind==='solnedgang'){sky('#ff8a5a','#ffd28a');pc(g,circ(0,15,9,9,48),{t:.1,mat:paperMat('#fff0c0','tissue',{glow:'#ffb04a',gi:1.3})},.2);pc(g,toCCW([[OPEN.x0-2,OPEN.y0],[OPEN.x1+2,OPEN.y0],[OPEN.x1+2,11],[OPEN.x0-2,11]]),{color:'#2a7aa0',kind:'water',t:.15},.4);
    for(const[x,s]of[[-22,1],[24,1.15]]){pieces(thick([curve([[x,OPEN.y0],[x+1.2*s,OPEN.y0+10*s],[x+2.4*s,OPEN.y0+17*s]],8)],.5*s),{color:'#3a2418',t:.15},g,0,0,.6);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;pc(g,leafPts(x+2.4*s+Math.cos(a)*3*s,OPEN.y0+17*s+Math.sin(a)*1.6*s,6*s,1.5*s,a+Math.PI/2),{color:'#1a3a24',t:.1},.65)}}}
  if(kind==='klassisk'){sky('#1a2a5a','#3a5a9a');for(const x of[-22,-11,11,22]){pc(g,box(x-1.6,OPEN.y0,x+1.6,36),{t:.2,s:20,paint:P=>{P.wash('#e8e2f2',null,{edge:0});for(const d of[-.9,0,.9])P.score([[x+d,OPEN.y0],[x+d,36]],{w:.08,ink:.3,dark:'#8a86a0'})}},.4);pc(g,box(x-2.3,35,x+2.3,37),{color:'#e8e2f2',kind:'water',t:.3},.5)}
    pc(g,box(OPEN.x0-2,37,OPEN.x1+2,39),{color:'#e8e2f2',kind:'water',t:.3},.5)}
  if(kind==='lade'){sky('#ff9a5a','#ffd8a0');pc(g,toCCW([[OPEN.x0-2,OPEN.y0],[OPEN.x1+2,OPEN.y0],[OPEN.x1+2,13],[OPEN.x0-2,15]]),{color:'#c8a040',kind:'water',t:.15},.3);
    pc(g,[[10,OPEN.y0+5],[26,OPEN.y0+5],[26,OPEN.y0+14],[18,OPEN.y0+19],[10,OPEN.y0+14]],{t:.2,s:20,paint:P=>{boards(P,[[10,OPEN.y0+5],[26,OPEN.y0+5],[26,OPEN.y0+14],[18,OPEN.y0+19],[10,OPEN.y0+14]],'#a8382e',{dir:'v',h:1.1})}},.4);
    for(let x=-30;x<-6;x+=3)pc(g,box(x-.3,OPEN.y0,x+.3,OPEN.y0+4),{color:'#8a6a4a',kind:'balsa',t:.2},.6);pc(g,box(-30,OPEN.y0+2.6,-6,OPEN.y0+3.2),{color:'#8a6a4a',kind:'balsa',t:.2},.7)}
  BD[kind]=g;return g}

/* ---- en gnom af papir: støvler, bukser, trøje, arme, hoved med stort skæg, næse og hat ---- */
function gnome(i,inst){const G=new THREE.Group(),SKIN='#f4c8a0';const o={G,i,inst,mats:{}};
  const mat=c=>paperMat(c,'water');
  for(const sx of[-1,1]){pc(G,sm([[sx*1-.9,0],[sx*1+.9+sx*.4,0],[sx*1+.8,1.1],[sx*1-.8,1.1]],3),{color:'#3a2418',t:.3},0);pc(G,box(sx*1-.7,1,sx*1+.7,3),{color:'#3a3a5a',kind:'water',t:.25},-.05)}
  o.tun=pc(G,sm([[-3,2.6],[3,2.6],[2.3,7.2],[-2.3,7.2]],4),{color:'#3f7a4a',kind:'water',t:.25},.1);pc(G,box(-2.7,4.1,2.7,4.7),{color:'#4a2a18',kind:'water',t:.1},.2);pc(G,box(-.45,4,.45,4.8),{mat:gold(),t:.12},.24);
  o.body=G;o.head=new THREE.Group();put(G,o.head,0,7.4,0);const H=o.head;
  pc(H,circ(0,1.6,1.9,1.9,32),{color:SKIN,kind:'water',t:.2},.2);
  const beard=sm([[-2.3,1.4],[-2.6,-.4],[-1.8,-2.6],[-.8,-3.6],[0,-4],[.8,-3.6],[1.8,-2.6],[2.6,-.4],[2.3,1.4],[1.2,.7],[0,.9],[-1.2,.7]],8);
  pc(H,beard,{t:.2,s:40,paint:P=>{P.wash('#f6f2ea',beard,{top:'#ffffff',edge:.5});for(let k=0;k<12;k++){const x=R(-2,2);P.score(curve([[x*.6,.4],[x*.9,-1.6],[x,-3.4]],5),{w:.06,ink:.3,dark:'#b8b0a8'})}}},.35);
  pc(H,sm([[-1.9,1.2],[-.2,1.6],[0,1.3],[.2,1.6],[1.9,1.2],[1.2,.5],[0,.9],[-1.2,.5]],6),{color:'#ffffff',kind:'water',t:.12},.45);
  pc(H,circ(0,1.75,.72,.62,24),{color:'#f2a08a',kind:'water',t:.2},.55);pc(H,circ(-.22,1.95,.18,.14,10),{color:'#ffffff',t:.05},.62);
  for(const sx of[-1,1]){pc(H,circ(sx*.92,2.3,.22,.28,14),{color:'#1a1238',t:.06},.45);pc(H,circ(sx*.92-.07,2.4,.08,.08,8),{color:'#ffffff',t:.04},.5);pc(H,sm([[sx*.45,2.72],[sx*1.4,2.78],[sx*1.45,2.98],[sx*.45,2.92]],3),{color:'#f2ede6',t:.06},.48)}
  o.hatG=new THREE.Group();put(H,o.hatG,0,3.25,0);o.hat=pc(o.hatG,sm([[-2.3,0],[2.3,0],[1.4,2.6],[.6,5.2],[1.6,6.4],[.2,6],[-.9,3.2]],6),{color:'#e05a8a',kind:'water',t:.25},.1);pc(o.hatG,sm([[-2.5,-.3],[2.5,-.3],[2.3,.4],[-2.3,.4]],3),{color:'#3a2418',kind:'water',t:.15},.3);
  o.armR=new THREE.Group();put(G,o.armR,2.2,6.6,.5);o.armL=new THREE.Group();put(G,o.armL,-2.2,6.6,.5);
  o.sleeveR=pc(o.armR,sm([[-.45,.3],[.45,.3],[.5,-3],[-.5,-3]],3),{color:'#3f7a4a',kind:'water',t:.2},0);pc(o.armR,circ(0,-3.3,.6,.6,16),{color:SKIN,kind:'water',t:.2},.1);
  o.sleeveL=pc(o.armL,sm([[-.45,.3],[.45,.3],[.5,-3],[-.5,-3]],3),{color:'#3f7a4a',kind:'water',t:.2},0);pc(o.armL,circ(0,-3.3,.6,.6,16),{color:SKIN,kind:'water',t:.2},.1);
  /* instrumenter */
  /* hænderne sidder på instrumenterne: armene ligger foran instrumentet, og hver arm har en hvilestilling (hv), som spillet svinger omkring */
  const foran=()=>{o.armL.position.z=o.armR.position.z=1.25},stil=(l,r,ls=1,rs=1)=>{o.hv={l,r};o.armL.rotation.z=l;o.armR.rotation.z=r;o.armL.scale.y=ls;o.armR.scale.y=rs};stil(0,0);
  if(inst==='guitar'){const gt=new THREE.Group();put(G,gt,0,4.5,.7);gt.rotation.z=1;pieces(clip([circ(0,0,1.9,1.7,28),circ(0,2.2,1.4,1.3,24)],[],'union'),{color:'#c0782e',t:.25},gt,0,0,0);pc(gt,circ(0,1,.5,.5,16),{color:'#2a1408',t:.05},.15);pc(gt,box(-.3,3,.3,7.8),{color:'#5a3420',kind:'balsa',t:.2},.05);pc(gt,box(-.5,7.6,.5,8.6),{color:'#3a2010',t:.25},.05);
    foran();stil(-2,-.72)}
  if(inst==='mic'){/* mikrofonen i højre hånd, oppe ved munden; venstre arm slår ud i takt */
    const mk=new THREE.Group();put(o.armR,mk,0,-3.3,.3);mk.scale.y=1/.45;pc(mk,box(-.2,-1.1,.2,-.3),{color:'#2a2a32',t:.3},0);const kugle=new THREE.Mesh(new THREE.SphereGeometry(.46,14,10),paperMat('#c0c4d0','card'));put(mk,kugle,0,-1.45,.1);
    foran();stil(-2.5,-2.15,1,.45)}
  if(inst==='trommer'){for(const a of[o.armL,o.armR]){const st=new THREE.Mesh(new THREE.BoxGeometry(.16,2.4,.16),paperMat('#e8d0a0','balsa'));st.rotation.z=.55*(a===o.armL?1:-1);put(a,st,(a===o.armL?.6:-.6),-4.2,.3)}
    foran();stil(-.62,.62,.8,.8)}
  if(inst==='bas'){/* kontrabassen står foran ham og læner sig ud til siden, så halsen går fri af ansigtet */
    const bg=new THREE.Group();put(G,bg,-1,0,.9);bg.rotation.z=.18;const B=sm([[0,0],[2.2,.6],[2.6,2.6],[1.6,4.2],[2.2,5.6],[1.4,7.2],[0,7.4],[-1.4,7.2],[-2.2,5.6],[-1.6,4.2],[-2.6,2.6],[-2.2,.6]],8);pc(bg,B,{t:.3,s:30,paint:P=>{P.wash('#9a4a1e',B,{top:'#c06a2a',edge:.6});for(const sx of[-1,1])P.pen(curve([[sx*.9,4],[sx*1.1,3],[sx*.8,2]],5),'#2a1408',.12,.9)}},0);pc(bg,box(-.28,7,.28,13.6),{color:'#3a2010',kind:'balsa',t:.2},.1);pc(bg,circ(0,14,.6,.6,16),{color:'#3a2010',t:.25},.1);for(const x of[-.35,-.12,.12,.35])pieces(thick([[[x,1.2],[x*.4,13.4]]],.03),{color:'#e8e0c8',t:.03},bg,0,0,.3);
    foran();stil(-2.96,-1.1,1,1.08)}
  /* små ting til hver sang */
  o.acc={};
  o.acc.briller=new THREE.Group();put(H,o.acc.briller,0,0,.7);for(const sx of[-1,1])pc(o.acc.briller,sm([[sx*.25,1.98],[sx*1.55,1.98],[sx*1.45,2.62],[sx*.35,2.62]],3),{color:'#0a0a12',t:.06},0);pc(o.acc.briller,box(-.3,2.4,.3,2.55),{color:'#0a0a12',t:.05},0);
  o.acc.krans=new THREE.Group();put(G,o.acc.krans,0,0,.3);for(let k=0;k<13;k++){const a=(-112+224*k/12)*Math.PI/180,x=2.75*Math.sin(a),y=6.5-3.7*Math.cos(a);pieces(clip([0,1,2,3,4].map(j=>circ(x+Math.cos(j*1.256)*.27,y+Math.sin(j*1.256)*.27,.26,.26,10)),[],'union'),{color:['#ff6a9a','#ffd23a','#ff8a3a'][k%3],t:.05},o.acc.krans,0,0,k*.004);pc(o.acc.krans,circ(x,y,.13,.13,8),{color:'#fff6d0',t:.03},.06+k*.004)}
  o.acc.glimmer=new THREE.Group();put(G,o.acc.glimmer,0,0,.3);for(let k=0;k<7;k++)pc(o.acc.glimmer,starPts(R(-2,2),R(3,6.8),.35,.15,R(1)),{mat:gold(),t:.04},0);
  o.acc.butterfly=new THREE.Group();put(H,o.acc.butterfly,0,-3.9,.6);pc(o.acc.butterfly,sm([[0,0],[-1,.55],[-1,-.55]],3),{color:'#0a0a12',t:.06},0);pc(o.acc.butterfly,sm([[0,0],[1,.55],[1,-.55]],3),{color:'#0a0a12',t:.06},0);
  o.acc['halstørklæde']=new THREE.Group();put(G,o.acc['halstørklæde'],0,0,.3);pc(o.acc['halstørklæde'],sm([[-2.3,7.1],[2.3,7.1],[0,2.6]],3),{color:'#c03a2a',t:.06},0);
  o.acc.nitter=new THREE.Group();put(G,o.acc.nitter,0,0,.3);for(const sx of[-1,1]){for(let k=0;k<3;k++)pc(o.acc.nitter,toCCW([[sx*(1.5+k*.55),7.05],[sx*(2+k*.55),7.05],[sx*(1.9+k*.6),8.1-k*.15]]),{color:'#c8ccd8',kind:'card',t:.08},0)}for(let x=-2.2;x<=2.21;x+=.88)pc(o.acc.nitter,circ(x,4.4,.2,.2,8),{color:'#c8ccd8',kind:'card',t:.06},0);
  o.acc.krave=new THREE.Group();put(G,o.acc.krave,0,0,.3);for(const sx of[-1,1])pc(o.acc.krave,toCCW([[sx*.2,7.25],[sx*3.1,7.5],[sx*1.9,5.3]]),{color:'#ffffff',kind:'water',t:.06},0);
  o.acc.blomsterskjorte=new THREE.Group();put(G,o.acc.blomsterskjorte,0,0,.27);for(const[x,y]of[[-1.7,6],[1.6,6.5],[-2,3.3],[1.9,3.5],[2.2,5.2],[-2.3,5]]){for(let j=0;j<5;j++)pc(o.acc.blomsterskjorte,circ(x+Math.cos(j*1.256)*.2,y+Math.sin(j*1.256)*.2,.17,.17,8),{color:'#fff6e8',t:.03},0);pc(o.acc.blomsterskjorte,circ(x,y,.1,.1,6),{color:'#ffd23a',t:.03},.02)}
  /* ---- et hoved til hver sang: nissehuen til de hyggelige, Kiss-maling og strithår til rock, afro til disko, cowboyhat til country, paryk til klassisk og stråhat til Hawaii ---- */
  o.hoved={hygge:o.hatG};const hd=k=>{const g=new THREE.Group();put(H,g,0,0,0);o.hoved[k]=g;return g},SORT='#15121c';
  {const g=hd('rock'),st=[];for(let k=0;k<22;k++){const a=-.5+k/21*(Math.PI+1),r=k%2?4.5-(k%3)*.3:2.8;st.push([Math.cos(a)*r*.95,2.1+Math.sin(a)*r])}st.push([-2.9,-1.6],[-1.6,.4],[1.6,.4],[2.9,-1.6]);pc(g,toCCW(st),{color:SORT,kind:'water',t:.12},-.12);
    pc(g,circ(0,1.6,1.9,1.9,32),{color:'#f6f4fc',kind:'water',t:.06},.29);const m=(sh,c=SORT)=>pc(g,sh,{color:c,kind:'water',t:.04},.37);
    if(i===0)m(starPts(.92,2.3,1.15,.5,.2));
    if(i===1)for(const sx of[-1,1])m(toCCW([[sx*.25,1.95],[sx*.5,2.7],[sx*1.85,3.3],[sx*1.45,2.6],[sx*1.9,2.25],[sx*1.4,1.85],[sx*.4,1.7]]));
    if(i===2){for(const sx of[-1,1]){m(circ(sx*.92,2.3,.55,.5,16));for(const q of thick([[[sx*.7,1.45],[sx*1.8,1.6]],[[sx*.7,1.3],[sx*1.8,1.1]]],.06))pc(g,q,{color:SORT,t:.04},.62)}pc(g,circ(0,1.62,.3,.24,10),{color:SORT,t:.04},.66)}
    if(i===3)for(const sx of[-1,1]){m(toCCW([[sx*.2,2.05],[sx*1.9,3.1],[sx*1.8,1.85]]),'#b8bcd0');m(toCCW([[sx*.45,2.1],[sx*1.55,2.75],[sx*1.5,2.02]]))}
    for(const sx of[-1,1])pc(g,circ(sx*.92,2.3,.3,.34,12),{color:'#ffffff',t:.04},.415);pc(g,sm([[-.5,.95],[.5,.95],[.3,.7],[-.3,.7]],3),{color:SORT,t:.04},.6)}
  {const g=hd('disko'),c=STY.disko.hats[i],bl=[circ(0,3.4,2.7,2.5,28)];for(let k=0;k<11;k++){const a=-.45+k/10*(Math.PI+.9);bl.push(circ(Math.cos(a)*2.75,3.3+Math.sin(a)*2.5,1.15,1.15,14))}const af=clip(bl,[],'union')[0].outer;
    pc(g,af,{t:.14,s:26,ed:hexOf(shade(c,-.4)),paint:P=>{P.wash(c,af,{top:hexOf(shade(c,.25)),edge:.7,clouds:6});for(let k=0;k<40;k++){const x=R(-3.6,3.6),y=R(.6,6.6);P.pen(curve([[x-.25,y],[x,y+.22],[x+.25,y]],4),hexOf(shade(c,-.35)),.07,.6)}}},-.12);
    for(const q of clip([af],[box(-5,3.1,5,9)],'inter'))pc(g,q,{t:.1,s:26,ed:hexOf(shade(c,-.4)),paint:P=>{P.wash(c,q.outer||q,{top:hexOf(shade(c,.25)),edge:.6,clouds:5});for(let k=0;k<26;k++){const x=R(-3.6,3.6),y=R(3.2,6.6);P.pen(curve([[x-.25,y],[x,y+.22],[x+.25,y]],4),hexOf(shade(c,-.35)),.07,.6)}}},.46);
    pc(g,box(-2.05,3.02,2.05,3.4),{mat:gold(),t:.06},.56);pc(g,starPts(0,3.21,.34,.15),{color:'#ff5ab4',t:.04},.62)}
  {const g=hd('country'),c=STY.country.hats[i],cd=hexOf(shade(c,-.3)),cr=sm([[-1.5,3.3],[1.5,3.3],[1.75,5.2],[.7,5.75],[0,5.25],[-.7,5.75],[-1.75,5.2]],5),br=sm([[-3.7,3.75],[-2.4,3.05],[0,2.9],[2.4,3.05],[3.7,3.75],[3.4,4.25],[1.7,3.6],[0,3.48],[-1.7,3.6],[-3.4,4.25]],6);
    pc(g,cr,{t:.2,s:30,ed:cd,paint:P=>{P.wash(c,cr,{top:hexOf(shade(c,.2)),edge:.6,clouds:4});P.pen(curve([[0,5.2],[0,4.5]],3),cd,.1,.6)}},.3);pc(g,box(-1.56,3.42,1.56,3.88),{color:cd,kind:'water',t:.06},.42);pc(g,starPts(0,3.65,.3,.13),{mat:gold(),t:.05},.48);
    pc(g,br,{t:.16,s:30,ed:cd,paint:P=>{P.wash(c,br,{top:hexOf(shade(c,.2)),edge:.6,clouds:4})}},.5);if(i===0)for(const q of thick([[[.5,.85],[2.7,.35]]],.07))pc(g,q,{color:'#e8c86a',t:.05},.64)}
  {const g=hd('klassisk'),PW='#f4f1fa',PG='#b8b2c8',top=sm([[-2.25,2.95],[-2.2,4.4],[-1.1,5.3],[0,5.5],[1.1,5.3],[2.2,4.4],[2.25,2.95],[1.2,3.25],[0,3.08],[-1.2,3.25]],6);
    pc(g,top,{t:.16,s:30,ed:PG,paint:P=>{P.wash(PW,top,{top:'#ffffff',edge:.6,clouds:3});for(let x=-1.6;x<=1.61;x+=.8)P.pen(curve([[x,3.3],[x*1.05,4.3],[x*.8,5.2]],5),PG,.07,.6)}},.46);
    for(const sx of[-1,1])[[2.35,2.55],[2.6,1.45],[2.45,.35]].forEach(([x,y],k)=>{const q=circ(sx*x,y,.78,.72,18);pc(g,q,{t:.14,s:40,ed:PG,paint:P=>{P.wash(PW,q,{top:'#ffffff',edge:.6,clouds:2});const sp=[];for(let j=0;j<=14;j++){const a=j/14*TAU*1.4,r=.55*(1-j/16);sp.push([sx*x+Math.cos(a)*r,y+Math.sin(a)*r])}P.pen(sp,PG,.07,.7)}},.52+k*.01)});
    pc(g,toCCW([[-.5,5.4],[.5,5.4],[.9,6.1],[0,5.75],[-.9,6.1]]),{color:SORT,kind:'water',t:.06},.3)}
  {const g=hd('hawaii'),c=STY.hawaii.hats[i],SG='#e8c48a',SD='#b8925a',br=sm([[-3.6,3],[3.6,3],[3.4,3.5],[-3.4,3.5]],3),cr=sm([[-1.85,3.45],[1.85,3.45],[1.65,4.9],[1,5.3],[-1,5.3],[-1.65,4.9]],5);
    pc(g,cr,{t:.2,s:30,ed:SD,paint:P=>{P.wash(SG,cr,{top:'#f6dca8',edge:.5,clouds:3});for(let y=3.7;y<5.3;y+=.32)P.pen([[-1.9,y],[1.9,y]],SD,.05,.5)}},.3);pc(g,box(-1.8,3.5,1.8,4),{color:c,kind:'water',t:.06},.42);
    pc(g,br,{t:.14,s:30,ed:SD,paint:P=>{P.wash(SG,br,{top:'#f6dca8',edge:.5,clouds:3});for(let x=-3.4;x<3.5;x+=.4)P.pen([[x,3.02],[x+.1,3.48]],SD,.05,.5)}},.5);
    for(let j=0;j<5;j++)pc(g,circ(1.25+Math.cos(j*1.256)*.36,3.85+Math.sin(j*1.256)*.36,.3,.3,10),{color:'#ff6a9a',t:.04},.56);pc(g,circ(1.25,3.85,.2,.2,8),{color:'#ffd23a',t:.04},.6)}
  for(const k in o.hoved)if(k!=='hygge')o.hoved[k].visible=false;
  for(const k in o.acc)o.acc[k].visible=false;
  G.traverse(m=>{if(m.isMesh)m.castShadow=false});return o}
function dress(o,sty){const S=STY[sty];o.hat.material[0]=paperMat(S.hats[o.i],'water');o.hat.material[1]=o.hat.material[0];const t=paperMat(S.tun[o.i],'water');o.tun.material[0]=t;o.sleeveR.material[0]=t;o.sleeveL.material[0]=t;const A=[].concat(S.acc||[]);for(const k in o.acc)o.acc[k].visible=A.includes(k);for(const k in o.hoved)o.hoved[k].visible=k===sty}

/* ---- tæppet: to halvdele af fløjl i folder, der glider sammen ---- */
function makeCurtain(){const C={halves:[],t:0,target:0};for(const s of[-1,1]){const g=new THREE.Group();put(live,g,0,0,5.5+(s>0?.06:0));
    for(let k=0;k<9;k++){const x0=k*3.6,f=[[x0,OPEN.y0-.2],[x0+3.8,OPEN.y0-.2]];for(let i=0;i<=6;i++){const t=i/6;f.push([x0+3.8-t*3.8,OPEN.y0-.2+(i%2?-.25:.15)])}const strip=toCCW([[x0,OPEN.y0-.2],[x0+3.8,OPEN.y0-.2],[x0+3.8,OPEN.y1+3],[x0,OPEN.y1+3]]);
      const m=pc(g,strip.map(([x,y])=>[s*(x+.1),y]),{t:.2,s:10,paint:P=>{const r=toCCW(strip.map(([x,y])=>[s*(x+.1),y]));P.wash(k%2?'#9a1226':'#b81a30',r,{edge:.6,clouds:4});P.wash('#5a0614',box(s>0?x0+2.8:-x0-3.9,OPEN.y0-1,s>0?x0+3.9:-x0-2.8,OPEN.y1+4),{alpha:.5,edge:.8})}},k*.05)}
    pieces(thick([[[s*.1,OPEN.y0+.2],[s*33,OPEN.y0+.2]]],.3),{mat:gold(),t:.1},g,0,0,.5);
    C.halves.push({g,s})}return C}

/* ---- lyskegler ned over hver gnom ---- */
function cone(col){const c=cv(64,256),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,255,255,.0)');gr.addColorStop(.15,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,.12)');g.fillStyle=gr;g.beginPath();g.moveTo(26,0);g.lineTo(38,0);g.lineTo(64,256);g.lineTo(0,256);g.closePath();g.fill();
  const m=new THREE.Mesh(new THREE.PlaneGeometry(9,30),new THREE.MeshBasicMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:col,opacity:.35}));return m}

/* ---- kamera og bagning ---- */
const cam=new THREE.PerspectiveCamera(30,1,20,800),CD=190;
const ST=makeStage({scene,live,cam,CD,fit:(c,w,h)=>{const asp=w/h,needW=128,needH=62;const H=Math.max(needH,needW/asp);c.fov=2*Math.atan(H/2/CD)*180/Math.PI;c.position.set(0,23+CD*Math.sin(.21),CD*Math.cos(.21)+10);c.lookAt(0,22,10)},P_:{aoR:.6,dof:[.12,.3],haze:[1.5,2,.0],hazeC:[.06,.03,.05],bloom:1.1,bg:'#120a14'}});

(async()=>{try{const fams=['Alegreya SC'];try{await Promise.race([Promise.all(fams.map(f=>document.fonts.load(`700 40px "${f}"`).catch(()=>{}))),new Promise(r=>setTimeout(r,3000))])}catch(_){}
  for(const b of BUILD){await new Promise(r=>setTimeout(r,0));if((typeof ctx!=='undefined')&&!ctx.alive)return;b()}
  for(const k of['nat','rock','disko','solnedgang','klassisk','lade'])backdrop(k);
  const shTex=(()=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(10,4,10,.6)');gr.addColorStop(1,'rgba(10,4,10,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tx(c,false)})();
  const insts=['guitar','mic','trommer','bas'];insts.forEach((ins,i)=>{const o=gnome(i,ins),m=MARK[i];o.x=m.x;o.z=m.z;o.q=[];o.sc=.86;o.dir=1;put(live,o.G,m.x,OPEN.y0+.15+floorY(m.x,m.z),m.z);o.G.scale.setScalar(o.sc);BAND.push(o);const sp=cone('#ffe2b0');put(live,sp,m.x,OPEN.y0+15+floorY(m.x,m.z),m.z-1.5);SPOT.push(sp);
    o.sh=new THREE.Mesh(new THREE.PlaneGeometry(5,2.2),new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false}));o.sh.rotation.x=-Math.PI/2;live.add(o.sh)});
  for(const b of[0,1])for(const s of[-1,1]){/* lyskæder over scenen */}
  {const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push([mix(OPEN.x0+3,OPEN.x1-3,t),OPEN.y1-5-2.6*Math.sin(t*Math.PI),-8])}cord(live,pts,.05,'#3a2a20');for(let i=1;i<24;i+=2){const[x,y,z]=pts[i];const s=glowSprite(['rgba(255,120,160,.95)','rgba(120,220,255,.95)','rgba(255,220,120,.95)','rgba(160,255,140,.95)'][(i>>1)%4],2.2);s.position.set(x,y-.6,z+.2);live.add(s);GL.push({spr:s,blink:R(TAU)})}}
  curtain=makeCurtain();
  for(const gl of GL){if(gl.spr)continue;const s=glowSprite(gl.c,gl.s);s.position.copy(gl.p);live.add(s);gl.spr=s;gl.base=gl.s;gl.ph=R(TAU)}
  setStyle('hygge',true);
  ST.bake();msg.classList.add('gone');
  let t=0,last=performance.now();
  const loop=now=>{if((typeof ctx!=='undefined')&&!ctx.alive)return;requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;const beat=t*1.7*TAU/2;
    for(const o of BAND){const walking=o.q.length>0;
      if(walking){const[tx_,tz_]=o.q[0],dx=tx_-o.x,dz=tz_-o.z,d=Math.hypot(dx,dz),st=Math.min(d,13*dt);if(d<.05)o.q.shift();else{o.x+=dx/d*st;o.z+=dz/d*st;if(Math.abs(dx)>.2)o.dir=dx>0?1:-1;o.wp=(o.wp||0)+st}}
      else o.dir+=(1-o.dir)*Math.min(1,dt*8);
      const hop=walking?Math.abs(Math.sin((o.wp||0)*.55))*1.1:Math.abs(Math.sin(beat+o.i*.4))*.35;o.fy=(o.fy===undefined?floorY(o.x,o.z):o.fy+(floorY(o.x,o.z)-o.fy)*Math.min(1,dt*10));
      o.G.position.set(o.x,OPEN.y0+.15+o.fy+hop,o.z);o.G.scale.set(o.sc*(o.dir<0?-1:1),o.sc,o.sc);o.G.rotation.z=walking?.06*Math.sin((o.wp||0)*.55)*o.dir:0;
      o.sh.position.set(o.x,OPEN.y0+.22+o.fy,o.z+.3);o.sh.material.opacity=1-hop*.25;
      o.head.rotation.z=.08*Math.sin(beat*.5+o.i);o.hatG.rotation.z=.06*Math.sin(beat*.5+o.i+1);
      if(!walking){const hv=o.hv;if(o.inst==='guitar'){o.armR.rotation.z=hv.r+.16*Math.sin(beat*2);o.armL.rotation.z=hv.l+.03*Math.sin(beat)}if(o.inst==='mic')o.armL.rotation.z=hv.l+.3*Math.sin(beat*.5);if(o.inst==='trommer'){o.armL.rotation.z=hv.l-.32*Math.max(0,Math.sin(beat*2));o.armR.rotation.z=hv.r+.32*Math.max(0,Math.sin(beat*2+Math.PI))}if(o.inst==='bas'){o.armR.rotation.z=hv.r+.1*Math.sin(beat*2);o.armL.rotation.z=hv.l+.03*Math.sin(beat*.5)}}
      const m=MARK[o.i],on=Math.hypot(o.x-m.x,o.z-m.z)<1.5?1:0,sp=SPOT[o.i];sp.userData.a=(sp.userData.a??1)+(on-(sp.userData.a??1))*Math.min(1,dt*4);sp.material.opacity=.35*sp.userData.a}
    for(const gl of GL){if(gl.blink!==undefined){const k=.6+.4*Math.sin(t*2+gl.blink);gl.spr.scale.set(2.2*k,2.2*k,1)}else{const k=gl.f?(.92+.08*Math.sin(t*9+gl.ph)*Math.sin(t*5.3)):(.95+.05*Math.sin(t*3+gl.ph));gl.spr.scale.set(gl.base*k,gl.base*k,1)}}
    SPOT.forEach((sp,i)=>{sp.rotation.z=.08*Math.sin(t*.7+i*1.3)});
    if(BD.disko&&BD.disko.visible)BD.disko.userData.ball.rotation.y+=dt*.8;
    /* tæppet */
    /* de to halvdele går helt sammen og overlapper lidt på midten, så der ikke står en sprække */
    const c=curtain;c.t+=(c.target-c.t)*Math.min(1,dt*2.6);if(Math.abs(c.target-c.t)<.012)c.t=c.target;for(const h of c.halves){h.g.position.x=h.s*mix(28,-1.4,c.t);h.g.scale.x=mix(.18,1,c.t)}
    ST.draw()};requestAnimationFrame(loop);
  window.__koncert={ready:true,luk:()=>{curtain.target=1},gardin:()=>curtain.t,setStyle,bakeMs:ST.bakeMs}}catch(e){msgN.textContent='Fejl: '+e.message;console.error(e)}})();

/* ---- ønsk en sang: tæppet går for, bandet skifter tøj, og tæppet går fra igen ---- */
let busy=false;
function setStyle(k,now){const S=STY[k];cur=k;for(const n in BD)BD[n].visible=n===S.bd;for(const o of BAND)dress(o,k);SPOT.forEach(sp=>sp.material.color.set(S.light));liveHemi.color.set(S.light);
  if(curtain&&now){curtain.t=0;curtain.target=0}}
/* tøjet skiftes først, når tæppet er helt for, så ingen ser det ske */
const until=f=>new Promise(r=>{const c=()=>(f()||((typeof ctx!=='undefined')&&!ctx.alive))?r():setTimeout(c,50);c()});
/* bandet går ud i kulissen, tæppet går for, og de kommer gående ind igen i det nye tøj */
const OFF=42;
function walkOut(){for(const o of BAND){const m=MARK[o.i],r=RIS.find(r=>m.x>r.x0&&m.x<r.x1&&m.z>r.z0&&m.z<r.z1+.4);o.q=[];if(r)o.q.push([m.ex<0?r.x0-1.6:r.x1+1.6,m.z]);o.q.push([m.ex*OFF,m.z])}}
function walkIn(){for(const o of BAND){const m=MARK[o.i],r=RIS.find(r=>m.x>r.x0&&m.x<r.x1&&m.z>r.z0&&m.z<r.z1+.4);o.q=[];if(r)o.q.push([m.ex<0?r.x0-1.6:r.x1+1.6,m.z]);o.q.push([m.x,m.z])}}
const idle=()=>BAND.every(o=>!o.q.length);
/* musikken: lounge i baggrunden. En ønsket sang (Kaspers egne) spilles én gang, så klapper publikum, og loungen kommer tilbage */
  const L_=typeof LYD!=='undefined'?LYD:null,lounge=()=>{if(L_&&((typeof ctx==='undefined')||ctx.alive))L_.musik('koncert.lounge'+(1+Math.floor(Math.random()*4)))};if(L_)setTimeout(lounge,600);
  async function wish(k){if(busy||k===cur)return;busy=true;if(L_){L_.musik(null);L_.fil('koncert.ud')}walkOut();await until(idle);if(L_)L_.taeppe();curtain.target=1;await until(()=>curtain.t>=1);setStyle(k);await new Promise(r=>setTimeout(r,450));if(L_)L_.taeppe();curtain.target=0;await until(()=>curtain.t<.12);walkIn();await until(idle);busy=false;
    if(L_&&((typeof ctx==='undefined')||ctx.alive)){if(k==='hygge'||!L_.sang('koncert.'+k,fejl=>{if((typeof ctx!=='undefined')&&!ctx.alive)return;if(!fejl)L_.klap();setTimeout(lounge,fejl?0:4800)}))lounge()}}
{const box_=document.getElementById('songs');for(const k in STY){const b=document.createElement('button');b.type='button';b.textContent=STY[k].n;b.addEventListener('click',()=>{wish(k);box_.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))});if(k==='hygge')b.setAttribute('aria-pressed','true');box_.appendChild(b)}}
