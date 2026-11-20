/* ============ heksen: en påklædningsdukke af pap, samlet med split-nåle ============ */
const DZ=.34,PT=.3,PS=46,INK='#3b2147',SKIN='#f6d2b8';
const WX=-1,WZ=1.2;
function part(cp,layer,paint,{seg=7,amp=.026,line='#5a2c1c',both=true,t=PT}={}){
  const o=outline(cp,seg,amp),m=makeCard(o,{t,s:PS,both,bump:1.6,paint:P=>{paint(P);const cx=(P.minx+P.maxx)/2,cy=(P.miny+P.maxy)/2,k=1-.14/Math.max(P.W,P.H);if(line)P.line([...o,o[0]].map(p=>[cx+(p[0]-cx)*k,cy+(p[1]-cy)*k]),line,.065,.45)}});
  m.position.z=layer*DZ;m.rotation.x=R(-.01,.01);m.rotation.y=R(-.015,.015);return m}
const joint=(parent,x,y,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g};
const holder=(parent)=>{const g=new THREE.Group();parent.add(g);return g};
const starPts=(x,y,r1,r2,rot=0)=>{const o=[];for(let i=0;i<10;i++){const a=Math.PI/2+rot+i/10*TAU,r=i%2?r2:r1;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}return o};
const moonPts=(x,y,r)=>{const o=[];for(let i=0;i<=12;i++){const a=-1.9+i/12*3.8;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}for(let i=12;i>=0;i--){const a=-1.6+i/12*3.2;o.push([x+.45*r+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78])}return o};

const HATS=[
  {navn:'Spids hat',c:'#5b3fa8',band:'#35226e',cone:[[-3.3,6.9,1],[3.3,6.9,1],[2.3,10.5],[1.4,13.6],[2.3,15.6],[3.4,16],[.9,16.2],[-.7,13.8],[-1.7,10.4]],brim:[[-7,6.1],[-3.5,5.2],[0,5],[3.5,5.2],[7,6.1],[3.5,7.3],[0,7.5],[-3.5,7.3]],deco:'lap'},
  {navn:'Skæv hat',c:'#2f7d5b',band:'#e0b13a',cone:[[-3.1,6.9,1],[3.1,6.9,1],[2.6,10],[1.2,13],[-.4,15.5],[-2.6,17.2],[-4.4,17.6],[-2.6,16.4],[-2.2,14.6],[-2,11]],brim:[[-6.4,6.2],[-3.2,5.3],[0,5.1],[3.2,5.3],[6.4,6.2],[3.2,7.2],[0,7.4],[-3.2,7.2]],deco:'stjerner'},
  {navn:'Bred hat',c:'#2b2233',band:'#e07a2a',cone:[[-3.2,7,1],[3.2,7,1],[2,10],[1.1,12.5],[0,13.6],[-1,12.4],[-1.9,10]],brim:[[-8.6,6],[-4,5],[0,4.8],[4,5],[8.6,6],[4,7.6],[0,7.9],[-4,7.6]],deco:'fjer'}];
const DRESSES=[
  {navn:'Stjernekjole',c:'#7b4fcf',cape:'#2c3a8e',trim:'#e0b13a',deco:'stjerner'},
  {navn:'Havkjole',c:'#2f8f86',cape:'#1d3d4a',trim:'#f2d27a',deco:'zigzag'},
  {navn:'Månekjole',c:'#8e2f5a',cape:'#2a1630',trim:'#cfd6e8',deco:'maaner'}];
const HAIRS=[
  {navn:'Langt lyst',c:'#f0b43c',stil:'lang'},
  {navn:'Rød page',c:'#c4502a',stil:'page'},
  {navn:'Sort bølget',c:'#2a1d2e',stil:'boelge',stribe:'#9b6bff'}];
const sel={hat:0,dress:0,hair:0};

const W={};
(function buildWitch(){
  const root=new THREE.Group();put(scene,root,WX,0,WZ);
  const body=joint(root,0,0);
  W.root=root;W.body=body;
  W.cape=holder(body);W.skirt=holder(body);W.torso=holder(body);
  W.armL=joint(body,-2.7,17.1,0);W.armR=joint(body,2.7,17.1,0);
  W.upL=holder(W.armL);W.upR=holder(W.armR);
  W.elL=joint(W.armL,0,-3.6);W.elR=joint(W.armR,0,-3.6);
  W.loL=holder(W.elL);W.loR=holder(W.elR);
  /* støvler under kjolen */
  for(const s of[-1,1])root.add(part([[-.9,2.4],[.9,2.4],[1,.9],[1.4+s*.4,.4],[1.6+s*.6,-.1,1],[-1,-.1,1],[-1.1,.9]].map(p=>[p[0]+s*1.4,p[1]+.1,p[2]]),-1,P=>{P.coat('#2a1a22',null,{dir:0,bw:.3});P.line([[s*1.4-1,.5],[s*1.4+1.4,.5]],'#6b4a5a',.06,.6)}));
  /* halsen */
  body.add(part([[-.7,16.8,1],[.7,16.8,1],[.65,19,1],[-.65,19,1]],.3,P=>P.coat(SKIN,null,{dir:1.57,bw:.3}),{line:null}));
  /* hovedet sidder på et led ved halsen */
  W.head=joint(body,0,18.35);
  W.hairBack=holder(W.head);
  W.head.add(part([[0,-.25],[2.5,.5],[3.45,2.6],[3.5,4.6],[2.7,6.4],[0,7.2],[-2.7,6.4],[-3.5,4.6],[-3.45,2.6],[-2.5,.5]],1,P=>{
    P.coat(SKIN,null,{dir:.2,bw:.35,gaps:.5});
    /* øjne */
    for(const s of[-1,1]){const ex=s*1.42,ey=3.35;
      P.fill(ell(ex,ey,.98,1.08,18,.02),'#fbf6ea',.98);
      P.fill(ell(ex+.04,ey-.08,.74,.84,18,.02),'#3e9e5a',.98);
      P.fill(ell(ex+.04,ey-.2,.74,.42,14,.02),'#2c7a43',.5);
      P.fill(ell(ex+.04,ey-.04,.38,.44,14,.02),'#1d1520',1);
      P.fill(ell(ex+.3,ey+.32,.18,.2,10,0),'#ffffff',1);P.fill(ell(ex-.22,ey-.38,.09,.09,8,0),'#ffffff',.9);
      P.line(curve([[ex-1.1*s,ey+.3],[ex-.4*s,ey+1.08],[ex+.5*s,ey+1.08],[ex+1.15*s,ey+.55]],5),INK,.17,.95);
      P.line([[ex+1.05*s,ey+.62],[ex+1.45*s,ey+.95]],INK,.11,.9);P.line([[ex+.78*s,ey+.92],[ex+1.05*s,ey+1.35]],INK,.1,.9);
      P.line(curve([[ex-.8*s,ey+1.75],[ex,ey+2.05],[ex+.85*s,ey+1.85]],5),'#8a5a2a',.12,.85);
      P.fill(ell(s*2.35,2.05,.72,.5,14,.05),'#ef8f8a',.38);
      for(let k=0;k<4;k++)P.fill(ell(s*2.35+R(-.45,.45),2.05+R(-.25,.25),.07,.07,6,0),'#c46a54',.75)}
    P.line(curve([[-.15,2.75],[-.35,2.25],[-.05,2.05]],4),'#b07a62',.07,.8);
    P.fill([...curve([[-.95,1.5],[0,1.05],[.95,1.5]],5),...curve([[.7,1.45],[0,.62],[-.7,1.45]],5)],'#c24a64',.95);
    P.line(curve([[-1,1.52],[0,1.08],[1,1.52]],5),INK,.07,.8)}));
  /* øjenlåg til at blinke med */
  W.lids=[];for(const s of[-1,1]){const l=part(ell(s*1.42,3.4,1.12,1.2,16,.02),1.22,P=>{P.coat(SKIN,null,{bw:.3});P.line(curve([[s*1.42-1,3.2],[s*1.42,2.75],[s*1.42+1,3.2]],5),INK,.15,.95)},{line:null,t:.12});l.visible=false;W.head.add(l);W.lids.push(l)}
  W.locks=holder(W.head);W.bangs=holder(W.head);W.hat=holder(W.head);
  /* staven: en rundstok med en glaskugle der lyser */
  const staff=new THREE.Group();put(root,staff,6.45,0,1.45*DZ);
  dowel(staff,0,0,26.6,0,.3);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.14,8,16),M.brass);ring.rotation.x=Math.PI/2;put(staff,ring,0,26.6,0);
  staff.add(part([[-.35,26],[.35,26],[1.9,27.6],[2.3,29.6],[1.5,31],[.4,31.3],[1.3,30.1],[1.4,28.3],[.2,27.1]],0,P=>{P.coat('#7a4a2a',null,{dir:1.2,bw:.3});P.dabs('#4d2c18',30,{len:.6,w:.05,dir:1.2,spread:.2,alpha:.6})},{t:.3}));
  W.orbM=new THREE.MeshStandardMaterial({color:'#bff0ff',emissive:'#5ccfff',emissiveIntensity:1.3,roughness:.15,metalness:0,transparent:true,opacity:.92});
  W.orb=new THREE.Mesh(new THREE.SphereGeometry(1.45,24,16),W.orbM);put(staff,W.orb,0,28.2,0);
  const gc=cv(128,128),gg=gc.getContext('2d'),gr=gg.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(170,235,255,.85)');gr.addColorStop(.35,'rgba(90,200,255,.35)');gr.addColorStop(1,'rgba(60,150,255,0)');gg.fillStyle=gr;gg.fillRect(0,0,128,128);
  W.glow=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(gc,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));W.glow.scale.set(9,9,1);put(staff,W.glow,0,28.2,.2);
  W.orbLight=new THREE.PointLight('#7fd6ff',70,48,2);put(staff,W.orbLight,0,28.2,2.5);
  W.staff=staff;
})();

/* tøjet: hvert stykke tegnes efter den valgte variant */
function clear(g){for(const c of[...g.children])g.remove(c)}
function buildDress(v){
  const{c,cape,trim}=DRESSES[v],deco=DRESSES[v].deco;
  [W.cape,W.skirt,W.torso,W.upL,W.upR,W.loL,W.loR].forEach(clear);
  W.cape.add(part([[-3,17.6],[3,17.6],[6.6,10],[8.4,1.6],[4,1],[0,1.3],[-4,1],[-8.4,1.6],[-6.6,10]],-3,P=>{P.coat(cape,null,{dir:1.5,bw:.45});P.dabs(shade(cape,-.3),90,{len:2.5,w:.09,dir:1.57,spread:.15,alpha:.45});P.dabs(shade(cape,.2),50,{len:2,w:.07,dir:1.57,spread:.15,alpha:.35})}));
  const hem=[];for(let i=0;i<=8;i++){const x=mix(6.6,-6.6,i/8);hem.push([x,1.5+(i%2?.35:-.05)])}
  W.skirt.add(part([[-2.6,11.4],[2.6,11.4],[4.6,6.5],[6.6,1.7],...hem.slice(1,-1),[-6.6,1.7],[-4.6,6.5]],0,P=>{
    P.coat(c,null,{dir:1.5,bw:.42});
    for(const x of[-4.2,-2,0,2.2,4.3])P.line(curve([[x*.45,11],[x*.75,6],[x,1.8]],5),shade(c,-.32),.09,.5);
    P.coat(trim,outline([[-8,1,1],[8,1,1],[8,2.6,1],[-8,2.6,1]],1,.03),{dir:0,bw:.3,gaps:.6});
    if(deco==='stjerner')for(let i=0;i<14;i++)P.fill(starPts(R(-4.5,4.5),R(3.2,10),R(.32,.5),.18,R(1)),'#f2c230',.92);
    if(deco==='zigzag'){const z=[];for(let i=0;i<=14;i++)z.push([mix(-6.4,6.4,i/14),i%2?4.4:3.4]);P.line(z,trim,.18,.9);const z2=z.map(p=>[p[0],p[1]+1.6]);P.line(z2,shade(trim,-.1),.1,.7)}
    if(deco==='maaner')for(let i=0;i<9;i++)P.fill(moonPts(R(-4,4),R(3.5,10),R(.45,.65)),trim,.9)}));
  W.torso.add(part([[-2.8,11,1],[2.8,11,1],[3.05,14.5],[2.75,17.6],[0,17.9],[-2.75,17.6],[-3.05,14.5]],.6,P=>{
    P.coat(c,null,{dir:1.5,bw:.4});
    P.coat(cape,outline([[-2.9,16.3,1],[2.9,16.3,1],[2.8,18.2,1],[-2.8,18.2,1]],1,.02),{dir:0,bw:.3});
    P.fill(ell(0,16.4,.62,.62,14,.03),trim,.97);P.fill(starPts(0,16.4,.42,.18),shade(trim,-.3),.9);
    P.coat('#6a3f22',outline([[-3.2,11,1],[3.2,11,1],[3.2,12.5,1],[-3.2,12.5,1]],1,.02),{dir:0,bw:.3});
    P.fill(outline(rect(-.7,11.05,.7,12.45),1,.01),trim,.95);P.fill(outline(rect(-.35,11.4,.35,12.1),1,.01),'#6a3f22',.95);
    for(let x=-2.4;x<=2.4;x+=.6)P.fill(ell(x,16.15,.08,.08,6,0),trim,.9)}));
  const sleeve=(g,s)=>g.add(part([[-.95,.6],[.95,.6],[1.35,-2.6],[1.55,-3.9],[-1.55,-3.9],[-1.35,-2.6]],2,P=>{P.coat(c,null,{dir:1.4,bw:.35});P.coat(trim,outline([[-2,-4.2,1],[2,-4.2,1],[2,-3.25,1],[-2,-3.25,1]],1,.02),{dir:0,bw:.25,gaps:.6});P.line(curve([[-.6*s,.3],[-.2*s,-1.6],[0,-3]],4),shade(c,-.3),.07,.5)}));
  sleeve(W.upL,-1);sleeve(W.upR,1);
  const fore=(g,fist)=>g.add(part([[-.62,.3],[.62,.3],[.68,-1.6],[.8,-2.3],[.7,-3.2],[.25,-3.75],[-.4,-3.7],[-.78,-3.1],[-.8,-2.3],[-.68,-1.6]],2.35,P=>{
    P.coat(SKIN,null,{bw:.3});P.coat(c,outline([[-1,-1.6,1],[1,-1.6,1],[1,.6,1],[-1,.6,1]],1,.02),{dir:1.5,bw:.3});P.coat(trim,outline([[-1,-1.9,1],[1,-1.9,1],[1,-1.45,1],[-1,-1.45,1]],1,.02),{dir:0,bw:.2});
    if(fist){for(const y of[-2.55,-2.95,-3.3])P.line([[-.55,y],[.45,y-.05]],'#b07a62',.06,.75)}else{P.line([[-.2,-2.7],[-.15,-3.5]],'#b07a62',.05,.7);P.line([[.15,-2.7],[.2,-3.5]],'#b07a62',.05,.7);P.line(curve([[-.75,-2.3],[-.85,-2.8],[-.6,-3.1]],4),'#b07a62',.05,.7)}}));
  fore(W.loL,false);fore(W.loR,true)}
function buildHair(v){
  const{c,stil,stribe}=HAIRS[v];[W.hairBack,W.locks,W.bangs].forEach(clear);
  const strands=(P,n,len,dir=-1.57)=>{P.dabs(shade(c,-.28),n,{len,w:.07,dir,spread:.12,alpha:.6});P.dabs(shade(c,.3),n*.6,{len:len*.8,w:.06,dir,spread:.12,alpha:.5})};
  const paint=P=>{P.coat(c,null,{dir:1.57,bw:.35});strands(P,90,2.4);if(stribe)P.coat(stribe,outline([[1,8,1],[2.2,8,1],[3.4,-9,1],[2.2,-9,1]],1,.03),{dir:1.57,bw:.25,alpha:.75,gaps:1})};
  if(stil==='lang'||stil==='boelge'){
    const wv=stil==='boelge';
    const back=[[-4.1,4],[-3.6,6.6],[-1.6,7.9],[0,8.1],[1.6,7.9],[3.6,6.6],[4.1,4],[4.4,-2],[4.6,-8.5]];
    if(wv)back.push([5.2,-10],[4.2,-11.2],[4.6,-12.4],[2.6,-12.2],[1.4,-13],[0,-12.2],[-1.4,-13],[-2.6,-12.2],[-4.6,-12.4],[-4.2,-11.2],[-5.2,-10]);
    else back.push([3.8,-11],[1.8,-11.6],[-1.8,-11.6],[-3.8,-11]);
    back.push([-4.6,-8.5],[-4.4,-2]);
    W.hairBack.add(part(back,-2,paint));
    for(const s of[-1,1]){const lock=[[2.6,5.4],[3.9,4.8],[4.3,1],[4.4,-3],[4,-7],[3.2,-7.6],[2.8,-4],[2.9,0],[2.5,3.4]].map(p=>[p[0]*s,p[1]]);
      if(wv)lock.splice(5,0,[4.8,-8.4].map((q,i)=>i?q:q*s));
      const g=joint(W.locks,s*3.3,5.2);g.userData.s=s;g.add(part(lock.map(p=>[p[0]-s*3.3,p[1]-5.2]),1.6,paint))}
    W.bangs.add(part([[-3.75,4.6],[-3.5,6.4],[-2,7.7],[0,8],[2,7.7],[3.5,6.4],[3.75,4.6],[3.1,5.0],[2.6,4.4],[1.8,5.1],[1.0,4.5],[.2,5.3],[-.6,4.6],[-1.5,5.2],[-2.3,4.5],[-3.1,5.1]],1.5,P=>{P.coat(c,null,{dir:1.3,bw:.3});strands(P,40,1.2,-1.4)}))}
  else{
    W.hairBack.add(part([[-4.3,3.5],[-3.8,6.6],[-1.6,8],[0,8.2],[1.6,8],[3.8,6.6],[4.3,3.5],[4.5,.4],[3.6,-.6],[2,0],[-2,0],[-3.6,-.6],[-4.5,.4]],-2,paint));
    for(const s of[-1,1])W.hairBack.add(part(ell(s*3.7,7.4,1.8,1.7,14,.06),-1.6,P=>{P.coat(c,null,{dir:.6,bw:.3});strands(P,30,.9,.6)}));
    for(const s of[-1,1]){const g=joint(W.locks,s*3.6,3);g.userData.s=s;g.add(part([[-.5,0],[.5,0],[.7,-2.6],[0,-3.2],[-.7,-2.6]].map(p=>[p[0],p[1]]),1.6,paint))}
    W.bangs.add(part([[-3.8,5.2,1],[-3.5,6.6],[-2,7.8],[0,8.05],[2,7.8],[3.5,6.6],[3.8,5.2,1],[1.3,5,1],[-1.3,5,1]],1.5,P=>{P.coat(c,null,{dir:1.3,bw:.3});strands(P,40,1.1,-1.57)}))}}
function buildHat(v){
  const{c,band,cone,brim,deco}=HATS[v];clear(W.hat);
  W.hat.add(part(cone,1.8,P=>{P.coat(c,null,{dir:1.2,bw:.4});P.dabs(shade(c,-.3),40,{len:1.4,w:.07,dir:1.3,spread:.3,alpha:.5});P.dabs(shade(c,.25),30,{len:1.2,w:.06,dir:1.3,spread:.3,alpha:.4});
    P.coat(band,outline([[-4,6.6,1],[4,6.6,1],[4,8.3,1],[-4,8.3,1]],1,.02),{dir:0,bw:.3});
    if(deco==='lap'){P.fill(outline([[-1.5,10.1,1],[.2,9.7,1],[.6,11.4,1],[-1.1,11.8,1]],1,.02),'#e98fb0',.95);for(const[a,b]of[[[-1.4,10.3],[.3,9.9]],[[-1,11.6],[.5,11.2]]])P.line([a,b],'#a94a74',.05,.8)}
    if(deco==='stjerner')for(const[x,y,r]of[[-.6,10.5,.55],[.8,12.2,.4],[-1.2,14,.35]])P.fill(starPts(x,y,r,r*.42),'#f2c230',.95)}));
  W.hat.add(part(brim,2.2,P=>{P.coat(c,null,{dir:0,bw:.35});P.line(curve([[-6,6.2],[0,7.1],[6,6.2]],6),shade(c,.3),.08,.6)}));
  if(v===0)W.hat.add(part(outline(rect(-.75,6.75,.75,8.2),1,.01).map(p=>[p[0]+1.2,p[1]]),2.0,P=>{P.coat('#e0b13a',null,{bw:.2});P.fill(outline(rect(.85,7.15,1.55,7.8),1,.01),c,.95)},{line:'#7a5418'}));
  if(deco==='fjer')W.hat.add(part([[2.2,7.8],[3.4,9.6],[4.6,12.4],[4.4,14.6],[3.6,12.6],[2.6,10]],1.7,P=>{P.coat('#e9e4d8',null,{dir:1.1,bw:.25});P.line(curve([[2.4,8],[3.6,10.8],[4.3,14]],5),'#2f8f86',.08,.9);P.dabs('#2f8f86',30,{len:.6,w:.05,dir:.4,spread:.3,alpha:.5})}))}
/* skuldre og albuer: split-nåle, der bliver siddende når tøjet skiftes */
for(const a of[W.armL,W.armR])pin(a,0,0,2*DZ+PT/2+.02,.6*DZ-PT/2,.17);
for(const e of[W.elL,W.elR])pin(e,0,0,2.35*DZ+PT/2+.02,2*DZ-PT/2,.14);
/* split-nåle i hoved og hals */
pin(W.body,0,18.35,1*DZ+PT/2+.02,.3*DZ-PT/2,.15);

/* ============ katten ============ */
const C={};
(function buildCat(){
  const PINK='#f39ac0',LIGHT='#fde0ea',DEEP='#d9709e';
  const root=new THREE.Group();put(scene,root,10.6,0,3.6);root.rotation.y=-.18;C.root=root;
  C.tail=joint(root,1.8,1.2);
  C.tail.add(part([[0,.4],[2.6,.5],[4.2,2],[4.3,4.4],[3.6,5.8],[2.9,5.3],[3.3,3.8],[3,2.2],[1.8,1.4],[0,-.4]],-1,P=>{P.coat(PINK,null,{dir:.9,bw:.3});P.coat(DEEP,outline([[3,4.2,1],[5,4.2,1],[5,6.2,1],[3,6.2,1]],1,.02),{dir:1,bw:.25,gaps:.6})}));
  root.add(part([[-2.3,0],[2.3,0],[2.7,2],[2.1,4.6],[1.2,6],[-1.2,6],[-2.1,4.6],[-2.7,2]],0,P=>{P.coat(PINK,null,{dir:1.4,bw:.35});P.coat(LIGHT,ell(0,2.6,1.3,2.2,16,.05),{dir:1.5,bw:.3,gaps:.6});
    for(const s of[-1,1]){P.fill(ell(s*1,.6,.8,.55,12,.05),LIGHT,.95);P.line([[s*1-.25,.3],[s*1-.25,.75]],DEEP,.05,.7);P.line([[s*1+.25,.3],[s*1+.25,.75]],DEEP,.05,.7)}}));
  C.head=joint(root,0,5.6);
  C.head.add(part([[-3,1.6],[-2.7,3.8],[-3.1,6.6,1],[-1.6,5],[0,5.3],[1.6,5],[3.1,6.6,1],[2.7,3.8],[3,1.6],[2.2,.3],[0,-.1],[-2.2,.3]],1,P=>{
    P.coat(PINK,null,{dir:.3,bw:.32});
    for(const s of[-1,1]){P.fill([[s*2.75,6],[s*2.4,4.1],[s*1.7,4.8]],'#f7c4d8',.95);
      P.fill(ell(s*1.25,2.8,.82,.95,16,.02),'#fbf6ea',.98);P.fill(ell(s*1.25,2.72,.62,.75,16,.02),'#3f7fe0',.98);P.fill(ell(s*1.25,2.7,.3,.42,12,.02),'#14122a',1);P.fill(ell(s*1.25+.22,3.05,.15,.17,8,0),'#fff',1);
      P.line(curve([[s*.45,3.5],[s*1.2,3.85],[s*2.05,3.45]],4),'#5b2d44',.1,.9);
      for(const dy of[-.15,.25])P.line([[s*1.7,1.4+dy],[s*3.4,1.6+dy*2]],'#5b2d44',.04,.7)}
    P.fill([[-.32,1.75],[.32,1.75],[0,1.35]],'#c2416e',.98);
    P.line(curve([[-.6,1.05],[-.3,.85],[0,1.2],[.3,.85],[.6,1.05]],4),'#5b2d44',.06,.85)}));
  C.lids=[];for(const s of[-1,1]){const l=part(ell(s*1.25,2.8,.95,1.05,14,.02),1.22,P=>{P.coat(PINK,null,{bw:.3});P.line(curve([[s*1.25-.85,2.6],[s*1.25,2.25],[s*1.25+.85,2.6]],4),'#5b2d44',.1,.95)},{line:null,t:.12});l.visible=false;C.head.add(l);C.lids.push(l)}
  root.add(part(outline([[-1.9,5.2,1],[1.9,5.2,1],[1.8,5.9,1],[-1.8,5.9,1]],1,.01),.6,P=>{P.coat('#7b4fcf',null,{bw:.2});P.fill(ell(0,5.3,.38,.38,10,0),'#e0b13a',.95)},{line:null}));
  pin(root,0,5.6,DZ+PT/2+.02,-PT/2,.13);pin(root,1.8,1.2,PT/2,-DZ-PT/2,.12)})();
