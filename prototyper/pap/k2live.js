/* ============ det levende lag: figurer og små ting der bevæger sig ============ */
const sprite=(cols,size,add=true)=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);cols.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,64,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));s.scale.set(size,size,1);return s};
const WARM=[[0,'rgba(255,220,150,.9)'],[.3,'rgba(255,170,80,.35)'],[1,'rgba(255,140,40,0)']];
const glows=[],puffs=[],flies=[],flagsLive=[],leaves=[],glints=[],zzz=[],ducks=[];
let bird,fall,dragon,unicorn,troll;
/* en simpel pap-person: krop, hoved, hår, arm (til byens andre beboere) */
function person({skin='#f6d2b8',hair='#7be0a0',dress='#3b6fd1',trim='#f2c230',hat=null,buns=false,beard=false,lamp=false,sc=.34}){
  const root=new THREE.Group();live.add(root);const o={root};
  root.add(part([[-3,0],[3,0],[2.4,5],[1.6,9.4],[-1.6,9.4],[-2.4,5]],0,P=>{P.coat(dress,null,{dir:1.5,bw:.35});P.coat(trim,outline(rect(-3.4,0,3.4,1),1,.02),{dir:0,bw:.25});for(let i=0;i<6;i++)P.fill(starPts(R(-2,2),R(1.6,8),.35,.15),trim,.9)}));
  o.head=joint(root,0,9);
  if(buns)for(const s of[-1,1])o.head.add(part(ell(s*2.6,5.6,1.4,1.4,12,.06),-.6,P=>P.coat(hair,null,{bw:.3})));
  o.head.add(part([[-2.6,3],[-2.4,5.4],[0,6.4],[2.4,5.4],[2.6,3],[2.6,-1],[-2.6,-1]],-.4,P=>{P.coat(hair,null,{dir:1.57,bw:.3});P.dabs(shade(hair,-.25),30,{len:1,w:.06,dir:1.57,spread:.1,alpha:.6})}));
  o.head.add(part([[0,-.2],[2,.4],[2.6,2.2],[2.4,3.8],[1.4,4.8],[0,5.1],[-1.4,4.8],[-2.4,3.8],[-2.6,2.2],[-2,.4]],1,P=>{P.coat(skin,null,{bw:.3});for(const s of[-1,1]){P.fill(ell(s*.95,2.6,.42,.5,10,.02),'#fbf6ea',.98);P.fill(ell(s*.95,2.5,.28,.36,10,.02),'#3f7fe0',.98);P.fill(ell(s*.95,2.5,.13,.17,8,0),'#14122a',1);P.fill(ell(s*1.6,1.6,.4,.28,8,.05),'#ef8f8a',.4)}
    P.line(curve([[-.5,1.1],[0,.8],[.5,1.1]],4),'#7a2a3a',.08,.9);if(beard)P.fill([[-2.2,1.6],[2.2,1.6],[1.4,-1.6],[0,-3],[-1.4,-1.6]],'#f1ece2',.97)}));
  o.head.add(part([[-2.6,3.6],[-2.2,5.2],[0,6.3],[2.2,5.2],[2.6,3.6],[1.4,4.4],[0,3.9],[-1.4,4.4]],1.3,P=>P.coat(hair,null,{dir:1.3,bw:.3})));
  if(hat)o.head.add(part([[-3.6,4.8,1],[3.6,4.8,1],[1.4,7],[.6,10],[-1.4,7.2]],1.8,P=>{P.coat(hat,null,{dir:1.2,bw:.3});P.coat(trim,outline(rect(-4,4.6,4,5.6),1,.02),{dir:0,bw:.25})}));
  o.arm=joint(root,2.2,8);o.arm.add(part([[-.6,.4],[.6,.4],[.7,-3.4],[0,-4.2],[-.7,-3.4]],2,P=>{P.coat(dress,null,{bw:.3});P.coat(skin,outline(rect(-1,-4.4,1,-3),1,.02),{bw:.2})}));
  if(lamp){o.lamp=new THREE.Group();put(o.arm,o.lamp,0,-4,.8);o.lamp.add(part([[-.9,0,1],[.9,0,1],[1.1,-2.2],[0,-2.9,1],[-1.1,-2.2]],2.3,P=>{P.coat('#2a2233',null,{bw:.2});P.fill(outline(rect(-.6,-2.1,.6,-.4),1,.01),'#ffe08a',.98)}));const g=sprite(WARM,10);put(o.lamp,g,0,-1.3,1.5)}
  root.scale.setScalar(sc);return o}
function buildDragon(){const D={},GREEN='#5fa34a',BELLY='#f2e2a8';
  const root=new THREE.Group();live.add(root);D.root=root;put(root,new THREE.Group(),0,0,0);
  D.tail=joint(root,4,2);D.tail.add(part([[0,1],[4,0],[8,1.4],[10,4],[9,6.4],[7.4,5],[7.8,3],[5,2.4],[0,3]],-1,P=>{P.coat(GREEN,null,{dir:.3,bw:.4});for(let x=1;x<9;x+=1.6)P.fill([[x,2.8],[x+.6,4],[x+1.2,2.8]],'#c2453a',.9)}));
  for(const s of[-1,1]){const w=joint(root,s*3,11);w.add(part([[0,0],[s*3,2],[s*7,5],[s*8,1.6],[s*6.4,-.4],[s*5,1],[s*3.4,-1]],-1.6,P=>{P.coat('#a3c94a',null,{dir:.6,bw:.4});P.coat('#e05a5a',outline([[0,0],[s*3,1.6],[s*6.6,3.6],[s*6,.4]],4,.03),{bw:.3,alpha:.7})}));(D.wings||(D.wings=[])).push([w,s])}
  D.body=joint(root,0,0);D.body.add(part([[-6,0],[6,0],[6.8,4],[5.4,9],[3,12],[-3,12],[-5.4,9],[-6.8,4]],0,P=>{P.coat(GREEN,null,{dir:1.4,bw:.45});P.coat(BELLY,ell(0,5,3.6,5,18,.05),{dir:0,bw:.4,gaps:.6});for(let y=1.4;y<10;y+=1.4)P.line(curve([[-3,y],[0,y-.4],[3,y]],4),'#c9b680',.08,.7);
    for(const s of[-1,1]){P.fill(ell(s*4.4,1,2.2,1.2,12,.05),shade(GREEN,-.15),.97);for(const k of[-.8,0,.8])P.fill(ell(s*4.4+k,.1,.28,.22,6,0),'#f3ead2',.95)}}));
  D.head=joint(root,0,11.4);
  D.head.add(part([[-4.4,0],[4.4,0],[5,3],[4,6],[0,7],[-4,6],[-5,3]],1,P=>{P.coat(GREEN,null,{dir:.2,bw:.4});P.coat('#86c46a',ell(0,1.8,3.4,1.9,16,.05),{bw:.3,gaps:.6});for(const s of[-1,1]){P.fill(ell(s*1.4,1.6,.35,.25,8,0),'#2a4a2a',.9);P.fill(ell(s*3.4,2.6,.9,.6,10,.05),'#ef8f8a',.45)}
    P.line(curve([[-1.6,.8],[0,.4],[1.6,.8]],4),'#2a4a2a',.1,.9);for(const s of[-1,1])P.fill([[s*4,5.4],[s*5.2,8],[s*3,6.2]],'#f3ead2',.95)}));
  D.closed=part([[-3.6,3.6],[3.6,3.6],[3.6,5],[-3.6,5]],1.3,P=>{for(const s of[-1,1])P.line(curve([[s*2.6,4.4],[s*1.8,3.9],[s*1,4.4]],4),'#1d2a1d',.16,.95)},{line:null,t:.05});D.closed.material.forEach(m=>{m.transparent=true;m.opacity=1});
  /* sovehuen er ikke tegnet på øjnene: vi skifter mellem lukkede og åbne øjne */
  D.open=part([[-3.6,3.4],[3.6,3.4],[3.6,5.4],[-3.6,5.4]],1.3,P=>{for(const s of[-1,1]){P.fill(ell(s*1.8,4.4,.85,.9,14,.02),'#fbf6ea',.98);P.fill(ell(s*1.8,4.3,.45,.6,10,.02),'#c2453a',.98);P.fill(ell(s*1.8,4.3,.18,.4,8,0),'#14122a',1)}},{line:null,t:.05});
  [D.closed,D.open].forEach(p=>{p.material.forEach(m=>{m.transparent=true});D.head.add(p)});D.open.visible=false;
  D.cap=joint(D.head,0,6);D.cap.add(part([[-4.4,0,1],[4.4,0,1],[2,3],[-1,6],[-5,7.6],[-3,4.4],[-3.2,2]],2,P=>{P.coat('#5a3fa8',null,{dir:1,bw:.3});for(let i=0;i<5;i++)P.fill(starPts(R(-2.5,1.5),R(1,4),.4,.17),'#f2c230',.9);P.coat('#f6e7c0',outline(rect(-4.8,-.2,4.8,1.2),1,.02),{dir:0,bw:.25})}));
  D.pom=part(ell(-5,7.6,1,1,10,.1),2.1,P=>P.coat('#f6e7c0',null,{bw:.3}));D.cap.add(D.pom);
  root.scale.setScalar(.75);return D}
function buildUnicorn(){const U={},WHITE='#f5f0ff';const root=new THREE.Group();live.add(root);U.root=root;
  U.tail=joint(root,-4.6,7.6);U.tail.add(part([[0,0],[-2,-1],[-3,-4],[-2.6,-7],[-1.6,-4.6],[-.6,-2]],-1,P=>{P.coat('#c9a0ff',null,{dir:1.2,bw:.3});P.coat('#ff9ad0',outline([[-3.4,-8,1],[-1,-8,1],[-1,-4,1],[-3.4,-4,1]],1,.02),{bw:.25,alpha:.8})}));
  for(const[x,l]of[[-3.4,-.6],[2.8,-.6],[-2.2,.6],[4,.6]])root.add(part([[-.55,0],[.55,0],[.6,5.4],[-.6,5.4]].map(p=>[p[0]+x,p[1],p[2]]),l,P=>{P.coat(WHITE,null,{bw:.3});P.coat('#c9a04a',outline(rect(x-.8,-.2,x+.8,.7),1,.01),{bw:.2})}));
  root.add(part([[-5,5],[4.6,5],[5.6,7.4],[4.4,9.6],[-4.4,9.6],[-5.6,7.6]],0,P=>{P.coat(WHITE,null,{dir:0,bw:.35});P.dabs('#d8d0f0',30,{len:.6,w:.08,dir:0,spread:.4,alpha:.6})}));
  U.head=joint(root,4,9);
  U.head.add(part([[-1.2,-.4],[1,-.4],[2.4,2.6],[4.4,3],[4.8,4.4],[3.4,5.4],[1.4,5.6],[-.4,4.4]],1,P=>{P.coat(WHITE,null,{bw:.3});P.fill(ell(2.2,4.2,.32,.4,10,.02),'#1d1520',1);P.fill(ell(2.32,4.36,.1,.1,6,0),'#fff',1);P.fill(ell(4.2,3.4,.18,.12,6,0),'#9a8ab0',.9);P.fill(ell(2.8,3.2,.5,.3,8,.05),'#ff9ad0',.45)}));
  U.head.add(part([[1.4,5.4,1],[2.4,5.4,1],[2.6,9.4,1]],1.4,P=>{P.coat('#f2c230',null,{bw:.2});for(const y of[6.4,7.4,8.4])P.line([[1.6,y],[2.4,y+.4]],'#b7832a',.06,.8)}));
  U.head.add(part([[-1,-.4],[-1.6,1.6],[-1.4,4],[-.2,5.8],[1.4,6],[.4,4.4],[.2,2.2],[.6,0]],1.2,P=>{P.coat('#c9a0ff',null,{dir:1.4,bw:.3});P.coat('#ff9ad0',outline([[-2,2,1],[1,2,1],[1,4,1],[-2,4,1]],1,.02),{bw:.25,alpha:.8});P.coat('#9fd8ff',outline([[-2,0,1],[1,0,1],[1,2,1],[-2,2,1]],1,.02),{bw:.25,alpha:.7})}));
  root.scale.setScalar(.42);return U}
function buildTroll(){const T={};const root=new THREE.Group();live.add(root);T.root=root;const G='#6b8a4a';
  root.add(part([[-4,0],[4,0],[4.6,4],[3.4,8],[-3.4,8],[-4.6,4]],0,P=>{P.coat('#7a5a3a',null,{dir:1.5,bw:.35});P.coat(G,outline(rect(-5,6,5,9),1,.02),{bw:.3});P.line([[-4,3],[4,3.4]],'#4a3420',.15,.8)}));
  T.head=joint(root,0,7.6);T.head.add(part([[-3.4,0],[3.4,0],[3.8,2.6],[5.4,4],[3.6,4.4],[2.6,6],[0,6.6],[-2.6,6],[-3.6,4.4],[-5.4,4],[-3.8,2.6]],1,P=>{P.coat(G,null,{bw:.3});P.fill(ell(0,2,1.2,1,10,.05),shade(G,-.15),.97);P.fill([[-1.6,.8],[-1.2,0],[-.8,.8]],'#f3ead2',.95);P.fill([[.8,.8],[1.2,0],[1.6,.8]],'#f3ead2',.95)}));
  T.eyes=part([[-2.6,3],[2.6,3],[2.6,4.6],[-2.6,4.6]],1.25,P=>{for(const s of[-1,1]){P.fill(ell(s*1.3,3.8,.6,.6,10,.02),'#fbf6ea',.98);P.fill(ell(s*1.3,3.7,.28,.32,8,0),'#14122a',1)}},{line:null,t:.05});T.head.add(T.eyes);
  root.scale.setScalar(.48);return T}

function buildLive(){
  /* lys der flakker og gløder */
  for(const p of lampSpots){const s=sprite(WARM,7);s.position.copy(p);live.add(s);glows.push({s,base:7,ph:R(TAU),f:R(5,9)})}
  for(const[x,y,z,sz,k]of glowSpots){const s=sprite(k==='broend'?[[0,'rgba(200,150,255,.8)'],[.35,'rgba(150,90,255,.35)'],[1,'rgba(120,60,255,0)']]:[[0,'rgba(255,200,120,.95)'],[.3,'rgba(255,120,40,.45)'],[1,'rgba(255,80,0,0)']],sz);s.position.set(x,y,z);live.add(s);glows.push({s,base:sz,ph:R(TAU),f:k==='broend'?1.6:R(8,12),slow:k==='broend'})}
  for(let i=0;i<26;i++){const s=sprite([[0,'rgba(230,255,170,1)'],[.3,'rgba(190,255,120,.5)'],[1,'rgba(150,255,80,0)']],1.6);live.add(s);flies.push({s,x:R(-75,75),y:R(1.5,10),z:R(-22,34),ph:R(TAU),sp:R(.3,.8)})}
  for(let i=0;i<8;i++){const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(200,190,215,.55)');gr.addColorStop(1,'rgba(200,190,215,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false}));live.add(s);puffs.push({s,t:i/8*4})}
  for(const[x,y,z]of flagSpots){const g=new THREE.Group();put(live,g,x,y,z);dowel(g,0,0,4,0,.12);
    const f=makeCard(outline([[0,0,1],[3.4,.6,1],[3.2,1.6],[3.6,2.4,1],[0,2.4,1]],3,.02),{t:.15,s:30,both:true,paint:P=>P.coat(['#e05a8a','#f2c230','#7fd6ff'][flagsLive.length%3],null,{dir:0,bw:.3})});put(g,f,0,1.5,0);flagsLive.push({f,ph:R(TAU)})}
  /* vandfaldet: et bredt, blødt lag bagerst og et smallere med lyse striber foran, skum ved kanten, dråber og tåge forneden */
  {const strip=(n,a0,a1,wmin,wmax,bright)=>{const c=cv(64,256),g=c.getContext('2d');if(!bright){const gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(140,190,255,0)');gr.addColorStop(.25,'rgba(150,200,255,.45)');gr.addColorStop(.75,'rgba(150,200,255,.45)');gr.addColorStop(1,'rgba(140,190,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,256)}
      for(let i=0;i<n;i++){const x=R(6,58),w=R(wmin,wmax),h=R(30,90),y=R(256);g.fillStyle=`rgba(${bright?'235,248,255':'190,225,255'},${R(a0,a1)})`;for(const oy of[-256,0])g.fillRect(x,y+oy,w,h)}
      const t=tx(c,true);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,2);return t};
    fall={layers:[],foam:[],drops:[],mist:[]};
    for(const[w,t,sp,dz,op]of[[3.4,strip(30,.15,.4,3,9,false),.45,0,.85],[2.4,strip(46,.35,.9,1.5,4,true),1.15,.15,1]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,26),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:op,color:'#e2f0ff'}));m.position.set(fallAt.x,fallAt.y-13,fallAt.z+dz);live.add(m);fall.layers.push({m,sp})}
    for(let i=0;i<5;i++){const s=sprite([[0,'rgba(255,255,255,.95)'],[.5,'rgba(235,245,255,.5)'],[1,'rgba(220,240,255,0)']],1.6,false);s.position.set(fallAt.x,fallAt.y+.1,fallAt.z+.3);live.add(s);fall.foam.push({s,dx:(i-2)*.55,b:R(1.2,1.8),ph:R(TAU)})}
    for(let i=0;i<22;i++){const s=sprite([[0,'rgba(240,250,255,1)'],[1,'rgba(220,240,255,0)']],R(.35,.6),false);live.add(s);fall.drops.push({s,t:R(1),sp:R(.25,.45),dx:R(-1.8,1.8),vx:R(-1.5,1.5)})}
    for(let i=0;i<4;i++){const s=sprite([[0,'rgba(240,248,255,.7)'],[1,'rgba(220,240,255,0)']],4,false);live.add(s);fall.mist.push({s,t:i/4,dx:R(-1.5,1.5)})}}
  /* glimt på åen */
  for(let i=0;i<10;i++){const s=sprite([[0,'rgba(220,240,255,.9)'],[1,'rgba(200,230,255,0)']],1.2);live.add(s);glints.push({s,t:R(1),sp:R(.03,.06)})}
  /* blade der falder */
  for(let i=0;i<14;i++){const m=makeCard(outline([[0,-.6,1],[.5,0],[0,.7,1],[-.5,0]],3,.01),{t:.08,s:40,both:true,paint:P=>P.coat(['#d0702a','#e39a3a','#b4501f'][i%3],null,{bw:.2})});live.add(m);leaves.push({m,x:R(-80,80),y:R(0,30),z:R(-20,34),vy:R(1.5,3),ph:R(TAU)})}
  /* fuglen */
  bird=new THREE.Group();live.add(bird);bird.add(makeCard(outline([[-1.6,0],[0,.6],[1.8,.3],[2.4,.8,1],[2,-.2],[0,-.5]],4,.02),{t:.15,s:40,both:true,paint:P=>{P.coat('#2a2233',null,{bw:.2});P.fill(ell(1.6,.4,.15,.15,6,0),'#fff',.9)}}));
  bird.wings=[];for(const s of[1,-1]){const w=makeCard(outline([[0,0,1],[-.6,3.2],[-1.8,2.6],[-1.2,0,1]],4,.02),{t:.12,s:40,both:true,paint:P=>P.coat('#3a3046',null,{bw:.2})});const g=new THREE.Group();g.add(w);g.position.set(.3,.3,s*.2);bird.add(g);bird.wings.push({g,s})}
  /* dragen sover i hulen */
  dragon=buildDragon();dragon.root.position.set(-72,.4,-27);
  for(let i=0;i<3;i++){const c=cv(64,64),g=c.getContext('2d');g.font='700 52px "Pirata One",Georgia,serif';g.fillStyle='#f6e7c0';g.textAlign='center';g.textBaseline='middle';g.fillText('Z',32,34);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false}));live.add(s);zzz.push({s,t:i/3})}
  /* enhjørningen i folden og ænderne i dammen */
  unicorn=buildUnicorn();unicorn.root.position.set(66,.4,-16);
  for(let i=0;i<2;i++){const d=makeCard(outline([[-1.4,0],[1,0],[1.6,.8],[1.2,1.8],[1.8,2.4],[1.6,3],[.8,2.8],[.4,1.6],[-1.4,1.2]],5,.02),{t:.15,s:44,both:true,paint:P=>{P.coat(i?'#f6e7c0':'#e9e4d8',null,{bw:.2});P.fill(ell(1.2,2.6,.14,.14,6,0),'#14122a',1);P.fill([[1.7,2.6],[2.4,2.4],[1.7,2.2]],'#f2a030',.97)}});live.add(d);ducks.push({m:d,ph:i*Math.PI})}
  /* trolden ved broen */
  troll=buildTroll();troll.root.position.set(20,.4,31.4);
  /* byens beboere */
  walkers.push({o:person({hair:'#7be0a0',dress:'#3b6fd1',hat:'#2a2a6a',buns:true}),x:6,z:8,route:[[6,8],[20,9],[14,16],[-4,15]],sp:5,kind:'npc'});
  walkers.push({o:person({hair:'#f1ece2',dress:'#3f7a4a',hat:'#c2453a',beard:true,lamp:true,trim:'#6b4428',sc:.3}),x:30,z:14,route:[[30,14],[42,12],[50,6],[36,20]],sp:4,kind:'npc'});
  walkers.push({o:person({hair:'#5a3a24',dress:'#c2453a',trim:'#f6e7c0',sc:.32}),x:-30,z:12,route:[[-36,2],[-48,4],[-56,1],[-44,-2]],sp:4.5,kind:'npc'})}
