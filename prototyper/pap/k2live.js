/* ============ det levende lag: figurer og små ting der bevæger sig ============ */
const sprite=(cols,size,add=true)=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);cols.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,64,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));s.scale.set(size,size,1);return s};
const WARM=[[0,'rgba(255,220,150,.9)'],[.3,'rgba(255,170,80,.35)'],[1,'rgba(255,140,40,0)']];
const glows=[],puffs=[],flies=[],flagsLive=[],leaves=[],glints=[],zzz=[],ducks=[];
let bird,fall,dragon,unicorn,troll;
/* en simpel pap-person: krop, hoved, hår, arm (til byens andre beboere) */
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
  dragon=makeDragon({res:.6});live.add(dragon.root);dragon.root.scale.setScalar(.75);dragon.root.position.set(-72,.4,-27);
  for(let i=0;i<3;i++){const c=cv(64,64),g=c.getContext('2d');g.font='700 52px "Pirata One",Georgia,serif';g.fillStyle='#f6e7c0';g.textAlign='center';g.textBaseline='middle';g.fillText('Z',32,34);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false}));live.add(s);zzz.push({s,t:i/3})}
  /* enhjørningen i folden og ænderne i dammen */
  unicorn=makeUnicorn({res:.6});live.add(unicorn.root);unicorn.root.scale.setScalar(.55);unicorn.root.position.set(66,.4,-16);
  for(let i=0;i<2;i++){const d=makeCard(outline([[-1.4,0],[1,0],[1.6,.8],[1.2,1.8],[1.8,2.4],[1.6,3],[.8,2.8],[.4,1.6],[-1.4,1.2]],5,.02),{t:.15,s:44,both:true,paint:P=>{P.coat(i?'#f6e7c0':'#e9e4d8',null,{bw:.2});P.fill(ell(1.2,2.6,.14,.14,6,0),'#14122a',1);P.fill([[1.7,2.6],[2.4,2.4],[1.7,2.2]],'#f2a030',.97)}});live.add(d);ducks.push({m:d,ph:i*Math.PI})}
  /* trolden ved broen */
  troll=makeTroll({res:.6});live.add(troll.root);troll.root.scale.setScalar(.52);troll.root.position.set(20,.4,31.4);
  /* byens beboere */
  for(let i=0;i<FOLK.length;i++){const o=makeFolk(i);live.add(o.root);walkers.push({o,sp:o.sp,kind:'npc'})}}
