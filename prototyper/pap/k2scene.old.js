/* ============ hele kortet: en magisk pap-by på et bord ============
   `scene` tegnes én gang (bages) med lys og skygger. `live` er det, der bevæger sig. */
const scene=new THREE.Scene(),live=new THREE.Scene();
scene.background=new THREE.Color('#0d0a12');
{const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromEquirectangular(e).texture;scene.environment=env;live.environment=env;scene.environmentIntensity=live.environmentIntensity=.28;pm.dispose()}
const key=new THREE.DirectionalLight('#ffd9b0',2.0);key.position.set(-60,100,120);key.target.position.set(0,0,-4);scene.add(key,key.target);
key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-100,right:100,top:75,bottom:-60,near:40,far:340});key.shadow.bias=-.0005;key.shadow.normalBias=.06;key.shadow.radius=2.5;
scene.add(new THREE.HemisphereLight('#8f9cff','#3a2a18',.48));
const moonL=new THREE.DirectionalLight('#aebfff',.65);moonL.position.set(60,70,-90);scene.add(moonL);
{const k2=key.clone();k2.castShadow=false;live.add(k2,k2.target);live.add(new THREE.HemisphereLight('#8f9cff','#3a2a18',.62));live.add(moonL.clone())}
const GX0=-86,GX1=86,GZ0=-42,GZ1=38;
const BUILD=[],SPOTS={};
const lamp=(x,z,c='#ffb35c',i=80,d=24,y=10)=>{const L=new THREE.PointLight(c,i,d,2);put(scene,L,x,y,z)};
const glowSpots=[];

/* ---- bordet, jorden, stierne, åen ---- */
const PATHS=[
  [[0,0],[0,-10],[0,-20]],                       /* til skolen */
  [[0,0],[-14,-1],[-30,0],[-44,2]],              /* til kollegiet */
  [[0,0],[12,1],[24,3],[30,8]],                  /* til boblebutikken */
  [[0,0],[14,-6],[30,-9],[48,-8],[58,-6]],       /* til dyreparken */
  [[-30,0],[-30,-10],[-36,-19],[-50,-21],[-62,-22]],  /* til dragen, bag om kollegiet */
  [[0,0],[-8,10],[-18,18],[-26,24]],             /* til støvlen */
  [[-26,24],[-40,26],[-56,26]],                  /* til koncertsalen */
  [[0,0],[6,12],[9,22]],                         /* forbi klokketårnet */
  [[9,22],[22,26],[34,27],[50,26],[62,23]]];     /* over broen til arkaden */
const RIVER=[];for(let i=0;i<=30;i++){const t=i/30;RIVER.push([mix(70,26,t)+7*Math.sin(t*5.5+.4),mix(-4,40,t)])}
BUILD.push(()=>{for(const[x0,x1,z0,z1]of[[-240,-84,GZ0-6,110],[84,240,GZ0-6,110],[-86,86,36,110]]){const m=makeCard(outline(rect(x0,-z1,x1,-z0),1,.02),{t:.5,s:5,cap:1024,noBump:true,edge:M.edgeSoft,paint:P=>{P.coat('#3c6537',null,{dir:.2,bw:2.4,vary:.1});P.dabs('#2b5030',500,{len:1.6,w:.25,dir:1.57,spread:.5,alpha:.5});P.dabs('#6a9a4c',300,{len:1.4,w:.2,dir:1.57,spread:.5,alpha:.4})}});m.rotation.x=-Math.PI/2;put(scene,m,0,-.06,0)}});
BUILD.push(()=>{const m=makeCard(outline(rect(GX0,-GZ1,GX1,-GZ0),1,.05),{t:.6,s:13,cap:1600,paint:P=>{
  P.coat('#3c6537',null,{dir:.2,bw:1.1,vary:.1});
  for(let i=0;i<18;i++){const x=R(GX0,GX1),y=R(-GZ1,-GZ0);P.coat(rnd()<.5?'#47733d':'#335a31',ell(x,y,R(6,14),R(4,9),14,.2),{dir:R(TAU),bw:.9,alpha:.55,gaps:2})}
  P.dabs('#2b5030',1500,{len:.7,w:.11,dir:1.57,spread:.5,alpha:.55});P.dabs('#6a9a4c',1000,{len:.6,w:.09,dir:1.57,spread:.5,alpha:.45});
  for(let i=0;i<120;i++){const x=R(GX0,GX1),y=R(-GZ1,-GZ0);P.fill(ell(x,y,.3,.3,7,.1),['#f3ead2','#e7b9d8','#c9b6ff','#ffe28a'][i%4],.85)}
  /* åen er malet ned i jorden med lysrefleks */
  const riv=RIVER.map(p=>[p[0],-p[1]]);P.line(riv,'#1f3c70',3.6,.97);P.line(riv,'#3d6bb8',2.6,.95);P.line(riv.map(p=>[p[0]-.5,p[1]]),'#8fb8ff',.25,.7);P.line(riv.map(p=>[p[0]+.8,p[1]]),'#6a95e0',.18,.6);
  /* pondens bred */
  P.fill(ell(70,6,9,5.5,22,.08),'#1f3c70',.97);P.fill(ell(70,6,7.8,4.6,22,.08),'#3d6bb8',.95);P.line(ell(69,7,5,2.4,16,.05).slice(0,8),'#a9c9ff',.12,.6)}});
 m.rotation.x=-Math.PI/2;put(scene,m,0,0,0)});
/* ---- himmel, måne, bakker, trærække ---- */
BUILD.push(()=>{for(const[x0,x1,dz]of[[-230,230,0]])put(scene,makeCard(outline(rect(x0,-10,x1,110),1,.04),{t:.4,s:9,cap:2048,noBump:true,paint:P=>{
    P.coat('#1f1744',null,{dir:.02,bw:1.2,vary:.06});
    const band=(y,a)=>{const cp=[[x0-2,-2,1],[x1+2,-2,1],[x1+2,y,1]];for(let x=x1-6;x>x0;x-=9)cp.push([x,y+R(-a,a)]);cp.push([x0-2,y,1]);return outline(cp,6,0)};
    P.coat('#34275f',band(44,2),{dir:-.02,bw:1.1,alpha:.85,gaps:2});P.coat('#5c3c7c',band(31,2),{dir:.03,bw:1.1,alpha:.8,gaps:2.2});P.coat('#93597f',band(22,1.6),{dir:.02,bw:1,alpha:.7,gaps:2.6});P.coat('#c27a6a',band(16,1),{dir:.02,bw:.9,alpha:.45,gaps:3});
    for(let i=0;i<600;i++){const x=R(x0,x1),y=R(34,108);P.fill(starPts(x,y,R(.35,.7),.16,R(1)),'#f6e7c0',R(.45,.95))}}}),0,0,GZ0-7+dz);
  for(const y of[12,34,56])tape(scene,0,y,GZ0-6.4,4.4,1.5,R(-.12,.12));
  put(scene,makeCard(ell(0,0,7,7,30,.02),{t:.3,s:24,paint:P=>{P.coat('#efe2bd',null,{dir:.6,bw:.4});for(const[x,y,r]of[[-2,1.6,1.3],[1.9,-1.4,.9],[.7,2.8,.6],[-.7,-3,.7],[3,1.6,.5]])P.fill(ell(x,y,r,r,14,.05),'#cfc09a',.85)}}),58,60,GZ0-6.2);
  pin(scene,58,60,GZ0-6.05,GZ0-6.4,.32);
  const hill=(z,base,amp,ph,col,x0=-92,x1=92)=>{const yT=x=>base+amp*Math.sin(x*.045+ph)+amp*.4*Math.sin(x*.12+ph*2);const cp=[[x0,-2,1],[x1,-2,1],[x1,yT(x1),1]];for(let x=x1-5;x>x0+2;x-=5)cp.push([x,yT(x)]);cp.push([x0,yT(x0),1]);
    put(scene,makeCard(outline(cp,5,.05),{t:.4,s:9,cap:1280,noBump:true,paint:P=>{P.coat(col,null,{dir:.1,bw:1,vary:.08});P.dabs(shade(col,-.2),700,{len:.8,w:.3,dir:1.4,spread:2,alpha:.4})}}),0,0,z)};
  for(const[a,b]of[[-230,-88],[-92,92],[88,230]]){hill(GZ0-4,20,3,.5,'#2c4c3a',a,b);hill(GZ0-1.5,13,2.6,2.2,'#365e44',a,b)}});

/* træer */
const TREES=[],PINES=[];
function makeTree(cols){const g=new THREE.Group(),h=8,k=1;
  g.add(makeCard(outline([[-.8*k,0,1],[.8*k,0,1],[.55*k,h*.6,1],[1.4*k,h,1],[.3*k,h*.75,1],[-.2*k,h,1],[-.55*k,h*.6,1]],1,.04),{t:.4,s:22,paint:P=>{P.coat('#5a3a24',null,{dir:1.55,bw:.35});P.dabs('#3a2414',16,{len:1.2,w:.06,dir:1.57,spread:.15,alpha:.6})}}));
  const blob=(cx,cy,r,col,dz)=>{const cp=[];for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*R(.82,1.12);cp.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}
    put(g,makeCard(outline(cp,6,.05),{t:.4,s:20,paint:P=>{P.coat(col,null,{dir:R(TAU),bw:.55,vary:.1});P.dabs(shade(col,-.28),r*r*5,{len:.4,w:.13,dir:R(TAU),spread:1.3,alpha:.6});P.dabs(shade(col,.3),r*r*3.5,{len:.35,w:.12,dir:R(TAU),spread:1.3,alpha:.55});for(let i=0;i<r*1.5;i++)P.fill(ell(cx+R(-r*.7,r*.7),cy+R(-r*.7,r*.7),.3,.22,6,.1),'#ffd27a',.7)}}),0,0,dz)};
  blob(2,h-.3,2.7,cols[0],-.42);blob(0,h+1.7,4,cols[1],.42);blob(-2.1,h-.4,2.9,cols[2],.84);return g}
function makePine(){const g=new THREE.Group();
  const tier=(y0,w,hh,col,dz)=>put(g,makeCard(outline([[-w,y0,1],[-w*.45,y0+.55,1],[0,y0-.15,1],[w*.5,y0+.5,1],[w,y0,1],[0,y0+hh,1]],1,.04),{t:.4,s:20,paint:P=>{P.coat(col,null,{dir:1.2,bw:.45,vary:.1});P.dabs(shade(col,-.25),w*hh*2,{len:.6,w:.12,dir:-1.57,spread:.5,alpha:.6})}}),0,0,dz);
  tier(1,4,6.5,'#24503f',.42);tier(4.5,3.2,5.5,'#2f6650',.84);tier(7.8,2.4,4.5,'#3b7a5f',1.26);return g}
function protos(){if(TREES.length)return;for(const c of[['#b4501f','#d0702a','#e39a3a'],['#9a3a1a','#c45a22','#e08a30'],['#b46a1f','#e09a2a','#f2c040'],['#8a2a2a','#b4402a','#d0702a'],['#a85a20','#d88a2a','#e8b040']])TREES.push(makeTree(c));PINES.push(makePine(),makePine())}
/* et træ er en kopi af en af de malede udgaver: samme maling, egen størrelse og spejlvending */
const orangeTree=(x,z,h,k=1)=>{protos();const g=TREES[Math.floor(R(TREES.length))].clone();g.scale.set(k*(rnd()<.5?-1:1),h/8,k);put(scene,g,x,0,z)};
const pineTree=(x,z,h)=>{protos();const g=PINES[Math.floor(R(PINES.length))].clone();const k=h/10;g.scale.set(k*(rnd()<.5?-1:1),k,k);put(scene,g,x,0,z)};
BUILD.push(()=>{for(let x=-170;x<=170;x+=7){if(x>-40&&x<-24)continue;if(Math.abs(x)<24)continue;orangeTree(x+R(-1.5,1.5),GZ0+3+R(0,3),R(6,9),R(.8,1.05))}
  /* skov i siderne og forrest, så landskabet fortsætter ud af billedet */
  for(let i=0;i<50;i++){const x=i%2?R(-170,-90):R(90,170),z=R(-30,80);if(rnd()<.3)pineTree(x,z,R(8,12));else orangeTree(x,z,R(7,10),R(.9,1.2))}});

/* ---- Magiskolen: se k3town.js ---- */
SPOTS.skole=[0,-19];
const flagSpots=[];

/* ---- Kollegiet ---- */
let chimneyAt;SPOTS.kollegie=[-44,3];
BUILD.push(()=>{const X=-46,Z=-8;
  put(scene,makeCard(outline(rect(-11,0,11,24),1,.03),{t:.5,s:20,paint:P=>{P.coat('#9b86c9',null,{dir:1.57,bw:.4});for(let y=1;y<24;y+=1)P.line([[-11,y],[11,y]],'#7b67a9',.05,.5);for(let x=-10.5;x<11;x+=R(2,4))P.line([[x,0],[x,24]],'#8a76b8',.04,.35);
    for(const[x,y]of[[-6.5,14],[0,14],[6.5,14],[-6.5,5],[6.5,5]])win(P,x,y,3.4,4.2,{shutter:'#3b5a8f',box:y<10,curtain:x===0?'#e05a8a':null,cross:1});
    door(P,0,0,4,7.4,'#5a2a9a');
    P.coat('#6a5a9a',outline(rect(-11.5,-1,11.5,1.2),1,.02),{dir:0,bw:.4,alpha:.7});
    P.fill(ell(8.2,21,1.4,1.4,18,.02),'#3b2a1f',.95);P.fill(ell(8.2,21,1.1,1.1,18,.02),'#ffcf5e',.95)}}),X,0,Z);
  put(scene,sign('Kollegiet',FONT.kollegie,8,2,'#2f2156','#f6e7c0',{border:'#c9a04a',size:1.3,ls:.05}),X,10.6,Z+.6);
  {const m=makeCard(outline(rect(0,0,9,24),1,.03),{t:.5,s:16,paint:P=>{P.coat('#7f6bb0',null,{dir:1.57,bw:.4});for(let y=1;y<24;y+=1)P.line([[0,y],[9,y]],'#6a589c',.05,.5);win(P,4.5,14,3,4,{shutter:'#3b5a8f'});win(P,4.5,5,3,4,{lit:false})}});m.rotation.y=Math.PI/2;put(scene,m,X+11,0,Z)}
  put(scene,makeCard(outline([[-13,23,1],[13,23,1],[0,36,1]],1,.03),{t:.5,s:20,paint:P=>{shingles(P,null,'#34508f',1,1.3);win(P,0,26,3,3.4,{arch:1})}}),X,0,Z-.6);
  put(scene,makeCard(outline(rect(4,26,7,38),1,.02),{t:.4,s:22,paint:P=>{bricks(P,null,'#7a3a2a',1.2,.6);P.fill(outline(rect(3.6,37.4,7.4,38.6),1,.01),'#4a2214',.95)}}),X,0,Z-1.2);
  chimneyAt=new THREE.Vector3(X+5.5,39,Z-1.2);
  /* vimpler mellem kollegiet og et træ */
  const fl=[];for(let i=0;i<7;i++){const t=i/6,x=mix(X-13,X-25,t),y=13-2*Math.sin(t*Math.PI);fl.push([x,y])}
  fl.forEach(([x,y],i)=>put(scene,makeCard(outline([[-1,0,1],[1,0,1],[0,-2.2,1]],1,.02),{t:.2,s:30,paint:P=>P.coat(['#5a2a9a','#e05a8a','#2f8f86'][i%3],null,{bw:.25})}),x,y,Z+2));
  dowel(scene,X-25,0,13.6,Z+2,.25)});

/* ---- Øksebrønden, pladsen og vejviseren: se k3town.js ---- */
let wellAt;SPOTS.broend=[0,6];

/* ---- Boblebutikken ---- */
SPOTS.bobler=[30,10];
BUILD.push(()=>{const X=32,Z=3;
  put(scene,makeCard(outline(rect(-12,0,12,17),1,.03),{t:.5,s:20,paint:P=>{P.coat('#2f8f86',null,{dir:1.57,bw:.4});for(let x=-11.4;x<12;x+=1.2)P.line([[x,0],[x,17]],'#237068',.05,.5);
    P.fill(outline(rect(-10,1.6,-.8,10),1,.02),BLK,.97);P.fill(outline(rect(-9.5,2,-1.3,9.6),1,.02),'#ffe6b0',.95);
    {const g=P.g,cx=P.X(-5.4),cy=P.Y(6),r=5*P.s;const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'rgba(255,250,220,.8)');gr.addColorStop(1,'rgba(255,200,120,0)');g.save();P.path(g,outline(rect(-9.5,2,-1.3,9.6),1,0));g.clip();g.fillStyle=gr;g.fillRect(cx-r,cy-r,2*r,2*r);g.restore()}
    for(const[x,y,c]of[[-8.2,3.4,'#f39ac0'],[-6.2,3.4,'#7fd6ff'],[-4.2,3.4,'#f2c230'],[-2.3,3.4,'#b47aff'],[-7.2,5.6,'#7be0a0'],[-5.2,5.6,'#ff8f6a'],[-3.2,5.6,'#f39ac0'],[-8.2,7.8,'#7fd6ff'],[-6.2,7.8,'#b47aff'],[-4.2,7.8,'#f2c230'],[-2.3,7.8,'#7be0a0']]){P.fill(ell(x,y,.86,.86,16,.02),c,.95);P.fill(ell(x-.3,y+.3,.22,.22,8,0),'#fff',.85)}
    P.line([[-10,5],[-.8,5]],'#3b2a1f',.12,.9);P.line([[-10,7.2],[-.8,7.2]],'#3b2a1f',.12,.9);
    door(P,5,0,4.6,8.4,'#f6e7c0',{noIron:1});P.fill(ell(5,5.6,1.2,1.2,16,.02),'#7fd6ff',.9);
    P.fill(outline(rect(-12.5,-1,12.5,1.1),1,.02),'#1f5f5a',.95)}}),X,0,Z);
  {const m=makeCard(outline(rect(0,0,8,17),1,.03),{t:.5,s:16,paint:P=>{P.coat('#257369',null,{dir:1.57,bw:.4});win(P,4,8,3,4,{arch:1})}});m.rotation.y=-Math.PI/2;put(scene,m,X-12,0,Z)}
  {const aw=makeCard(outline(rect(-12.6,0,12.6,4.4),1,.02),{t:.3,s:22,both:true,paint:P=>{for(let x=-12.6,i=0;x<12.6;x+=2.1,i++)P.coat(i%2?'#f6e7c0':'#e05a8a',outline(rect(x,-1,x+2.1,6),1,.01),{dir:1.57,bw:.25});const sc=[];for(let x=-12.6;x<=12.6;x+=1.05)sc.push([x,(Math.round((x+12.6)/1.05)%2)?.35:-.15]);P.line(sc,'#7a2a4a',.08,.7)}});aw.rotation.x=.55;put(scene,aw,X,10.8,Z+2.4)}
  put(scene,sign('Boblebutikken',FONT.bobler,17,3.2,'#174f4b','#fff3d6',{border:'#7fd6ff',size:2.1,ls:.05,extra:P=>{for(const[x,y,r]of[[-7.6,2.4,.5],[-7,1,.3],[7.4,2.2,.45],[6.8,.9,.28]])P.line([...ell(x,y,r,r,12,0),[x+r,y]],'#9fe3ff',.08,.85)}}),X,13.2,Z+.6);
  put(scene,makeCard(outline(rect(-2.2,17,2.2,20.2),1,.02),{t:.4,s:22,paint:P=>P.coat('#1f5f5a',null,{bw:.3})}),X,0,Z-.4);
  const glass=new THREE.Mesh(new THREE.SphereGeometry(4.6,32,20),new THREE.MeshStandardMaterial({color:'#dff6ff',transparent:true,opacity:.3,roughness:.05,metalness:.1}));put(scene,glass,X,24.6,Z-.4);
  for(const[x,y,z,c]of[[-1.5,-1.8,0,'#f39ac0'],[1.3,-2,.7,'#7fd6ff'],[0,-.4,-.6,'#f2c230'],[-.6,-2.6,1.1,'#b47aff'],[1.7,-.6,-.4,'#7be0a0'],[-1.9,-.3,.6,'#ff8f6a']]){const b=new THREE.Mesh(new THREE.SphereGeometry(1.15,16,10),new THREE.MeshStandardMaterial({color:c,roughness:.3}));b.castShadow=true;put(scene,b,X+x,24.6+y,Z-.4+z)}
  lamp(X-5,Z+6,'#ffc070',60,20,8)});

/* ---- Dyreparken: lade, fold med hegn, dam med ænder ---- */
SPOTS.dyr=[56,-6];
BUILD.push(()=>{const X=64,Z=-22;
  put(scene,makeCard(outline([[-9,0,1],[9,0,1],[9,10,1],[0,16,1],[-9,10,1]],1,.03),{t:.5,s:20,paint:P=>{P.coat('#a3352c',null,{dir:1.57,bw:.4});for(let x=-8.5;x<9;x+=1.1)P.line([[x,0],[x,15]],'#7a241e',.05,.55);
    P.fill(ell(0,11.4,1.6,1.6,18,.02),'#f3ead2',.97);P.fill(ell(0,11.4,1.2,1.2,18,.02),'#ffcf5e',.95);
    P.fill(outline(rect(-4,0,4,7.5),1,.02),'#f3ead2',.97);P.coat('#7a3a2a',outline(rect(-3.5,0,3.5,7),1,.02),{dir:1.57,bw:.3});P.line([[-3.5,0],[3.5,7]],'#f3ead2',.25,.95);P.line([[3.5,0],[-3.5,7]],'#f3ead2',.25,.95)}}),X,0,Z);
  put(scene,makeCard(outline([[-10.4,9.4,1],[0,16.6,1],[10.4,9.4,1],[10.4,10.8,1],[0,18,1],[-10.4,10.8,1]],1,.02),{t:.4,s:22,paint:P=>P.coat('#e8dcc0',null,{bw:.3})}),X,0,Z+.4);
  put(scene,sign('Dyreparken',FONT.dyr,11,2.4,'#6b4a2a','#f6e7c0',{border:'#3b2213',size:1.5,ls:.03}),X-15,9,Z+12);dowel(scene,X-18.5,.4,9.2,Z+12,.25);dowel(scene,X-11.5,.4,9.2,Z+12,.25);
  put(scene,sign('Kommer snart',FONT.snart,8.4,1.8,'#f2e6c8','#3b2a1f',{size:1.05}),X-15,6.4,Z+12.5);
  /* hegn */
  for(let x=X-12;x<=X+14;x+=2.6){put(scene,makeCard(outline(rect(-.3,0,.3,4),1,.01),{t:.4,s:24,paint:P=>P.coat('#8a6a4a',null,{bw:.2})}),x,0,Z+9)}
  for(const y of[1.6,3.2])put(scene,makeCard(outline(rect(X-12.3,y-.3,X+14.3,y+.3),1,.01),{t:.3,s:16,paint:P=>P.coat('#9a7a58',null,{dir:0,bw:.3})}),0,0,Z+9.3);
  /* høstak og trug */
  put(scene,makeCard(outline([[-3,0],[3,0],[2.6,2.6],[0,3.8],[-2.6,2.6]],5,.04),{t:.4,s:24,paint:P=>{P.coat('#e3b84a',null,{dir:1.2,bw:.3});P.dabs('#b88a2a',60,{len:.8,w:.05,dir:1.3,spread:.6,alpha:.7})}}),X+13,0,Z+3);
  put(scene,sign('Fodr ikke drageungen',FONT.snart,9,1.6,'#f2e6c8','#3b2a1f',{size:.85}),X+8,3.4,Z+9.7)});

/* ---- dragehulen oppe på bakken til venstre ---- */
SPOTS.drage=[-62,-20];
BUILD.push(()=>{const X=-72,Z=-31;
  put(scene,makeCard(outline([[-20,0],[20,0],[18,10],[13,18],[6,23],[-3,24],[-12,21],[-18,13]],6,.06),{t:.6,s:16,paint:P=>{stones(P,null,'#6a6478',140,1.8);P.fill(outline([[-10,0],[10,0],[9.4,8],[6,13.6],[0,15.6],[-6,13.6],[-9.4,8]],8,.04),'#120d18',.98);
    {const g=P.g,cx=P.X(0),cy=P.Y(4),r=10*P.s;const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'rgba(255,160,60,.35)');gr.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gr;g.fillRect(cx-r,cy-r,2*r,2*r)}
    for(let i=0;i<30;i++)P.fill(ell(R(-8,8),R(.4,2.5),.55,.35,8,.1),rnd()<.5?'#f2c230':'#e0a020',.95)}}),X,0,Z);
  put(scene,sign('Dragehulen',FONT.drage,9,2.2,'#3a2a1a','#f2d9a0',{border:'#8a6a3a',size:1.6}),X+14,5.2,Z+8);dowel(scene,X+14,.4,5.6,Z+7.8,.25);
  lamp(X,Z+4,'#ff9a3a',90,26,5)});

/* ---- den svævende ø med vandfald, hængt op i tråde ---- */
let fallAt;
BUILD.push(()=>{const X=26,Y=46,Z=GZ0-4.6;const g=new THREE.Group();put(scene,g,X,Y,Z);
  put(g,makeCard(outline([[-8,0],[8,0],[6.5,-3],[3,-6],[0,-9],[-3,-6],[-6.5,-3]],6,.04),{t:.5,s:20,paint:P=>{stones(P,null,'#7a6a5a',40,1.2);P.coat('#4f8a3a',outline(rect(-9,-1.2,9,.6),1,.04),{dir:0,bw:.3})}}),0,0,0);
  orangeTreeAt(g,-3,0,.4,4,.6);
  put(g,makeCard(outline([[1.4,0,1],[5.4,0,1],[5.4,3.4,1],[3.4,5.4,1],[1.4,3.4,1]],1,.02),{t:.3,s:30,paint:P=>{P.coat('#f2e6c8',null,{bw:.2});P.fill(outline([[1.2,3.2,1],[3.4,5.6,1],[5.6,3.2,1]],1,.01),'#c2453a',.95);P.fill(outline(rect(2.8,0,4,1.8),1,.01),'#5a3a24',.95)}}),0,0,.3);
  for(const s of[-1,1])thread(scene,X+s*6,Y,Y+40,Z-.2);
  fallAt=new THREE.Vector3(X+5.5,Y-1,Z+.4)});
function orangeTreeAt(parent,x,y,z,h,k){const g=new THREE.Group();put(parent,g,x,y,z);
  g.add(makeCard(outline([[-.6*k,0,1],[.6*k,0,1],[.4*k,h,1],[-.4*k,h,1]],1,.03),{t:.3,s:24,paint:P=>P.coat('#5a3a24',null,{dir:1.55,bw:.3})}));
  put(g,makeCard(ell(0,h+1.5*k,3*k,2.8*k,12,.1),{t:.3,s:24,paint:P=>{P.coat('#3f8a4a',null,{bw:.4});P.dabs('#2f6a3a',30,{len:.4,w:.12,dir:1,spread:2,alpha:.6})}}),0,0,.3)}

/* ---- forreste række: Koncertsalen, Den Flyvende Støvle, klokketårnet, broen med trolden, Arkaden ---- */
SPOTS.koncert=[-56,22];
BUILD.push(()=>{const X=-62,Z=27;
  put(scene,makeCard(outline([[-12,0,1],[12,0,1],[12,11,1],[0,16,1],[-12,11,1]],1,.03),{t:.5,s:20,paint:P=>{bricks(P,null,'#8a2a2a',1.6,.7);
    for(const s of[-1,1]){P.fill(outline(rect(s*8.6-1.2,0,s*8.6+1.2,11),1,.01),'#f2e6c8',.97);P.line([[s*8.6-.8,0],[s*8.6-.8,11]],'#c9b896',.08,.7);P.line([[s*8.6+.8,0],[s*8.6+.8,11]],'#c9b896',.08,.7)}
    P.fill(outline([[-5,0,1],[5,0,1],[5,6],[0,8.6],[-5,6]],5,.01),'#2a0a0a',.97);
    for(const s of[-1,1])P.coat('#b01a2a',outline([[s*5,0,1],[s*1.4,0,1],[s*2.6,4],[s*1.8,7.6],[s*5,6.2]],4,.02),{dir:1.57,bw:.3});
    P.fill(ell(0,1.8,3.2,1.6,16,.05),'#ffd27a',.6);
    P.fill(outline(rect(-11,6.4,-6.6,11),1,.01),'#f2e6c8',.95);P.text('I AFTEN',-8.8,10.2,.62,'#3b2a1f',{font:FONT.koncert});P.text('De Falske',-8.8,9,.55,'#3b2a1f',{font:FONT.snart});P.text('Toner',-8.8,8.1,.55,'#3b2a1f',{font:FONT.snart});P.fill(ell(-8.8,7,.35,.35,10,0),'#2a2a6a',.9)}}),X,0,Z);
  put(scene,sign('KONCERTSAL',FONT.koncert,15,2.6,'#1d1214','#ffd27a',{size:1.75,ls:.18,border:'#e9b949',extra:P=>{for(let x=-7;x<=7;x+=1.4)for(const y of[.25,2.35])P.fill(ell(x,y,.16,.16,8,0),'#fff1b8',.95)}}),X,11.4,Z+.6);
  lamp(X,Z+5,'#ffb35c',70,20,6);
  /* caféborde */
  for(const[x,z]of[[-40,32],[-34,34]]){dowel(scene,x,.4,3.4,z,.2);const top=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.25,20),new THREE.MeshStandardMaterial({color:'#f2e6c8',roughness:.6}));top.castShadow=true;put(scene,top,x,3.5,z);
    const cup=new THREE.Mesh(new THREE.CylinderGeometry(.3,.25,.5,12),new THREE.MeshStandardMaterial({color:'#e05a8a'}));put(scene,cup,x+.5,3.9,z)}});
SPOTS.stoevle=[-24,22];
BUILD.push(()=>{const X=-26,Z=28;
  put(scene,makeCard(outline([[-11,0],[9,0],[10,1.4],[9,3.4],[3,4.2],[1.6,6],[1.4,15],[2.2,16.4,1],[-6.6,16.4,1],[-6,14.6],[-6.4,6],[-9,4.2],[-11.4,2]],6,.04),{t:.5,s:20,paint:P=>{P.coat('#7a4a2a',null,{dir:.1,bw:.4});
    P.coat('#3b2a1f',outline([[-11.6,-.2,1],[10.2,-.2,1],[10.2,1.2,1],[-11.6,1.6,1]],1,.02),{dir:0,bw:.3});
    for(let y=7;y<15;y+=1.6){P.fill(ell(-5.4,y,.3,.3,8,0),'#e9b949',.95);P.fill(ell(.6,y,.3,.3,8,0),'#e9b949',.95);P.line([[-5.4,y],[.6,y+1.4]],'#f2e6c8',.12,.9)}
    win(P,-2.4,9,3.4,3.6,{arch:1});door(P,4.6,1.2,3.4,5,'#5a2a1a');
    P.dabs('#5a3218',80,{len:1,w:.06,dir:.2,spread:.3,alpha:.5})}}),X,0,Z);
  /* vinger */
  for(const s of[-1,1]){const w=makeCard(outline([[0,0,1],[-3,1],[-6,3],[-7.4,6],[-5,5],[-4.6,7],[-2.6,5],[-1.6,6.4],[0,3]],5,.03),{t:.25,s:24,both:true,paint:P=>{P.coat('#e8e4f4',null,{dir:.8,bw:.3});for(const y of[2,3.6,5])P.line([[-.5,y*.6],[-6+y*.4,y]],'#b8b0d0',.06,.7)}});w.rotation.y=s*.5;put(scene,w,X-6,8,Z+(s>0?.6:-.6))}
  put(scene,sign('Den Flyvende Støvle',FONT.stoevle,12,2.4,'#2a1d14','#f6e7c0',{size:1.25,border:'#c9a04a'}),X-3,2.4,Z+1);
  put(scene,sign('Kommer snart',FONT.snart,8,1.7,'#f2e6c8','#3b2a1f',{size:1}),X+12,4.4,Z-2.6);dowel(scene,X+12,.4,4.8,Z-2.8,.2);
  const pipe=makeCard(outline(rect(-1,16,1,20),1,.02),{t:.4,s:24,paint:P=>P.coat('#3b2a1f',null,{bw:.2})});put(scene,pipe,X-3,0,Z-.4)});
BUILD.push(()=>{const X=12,Z=31;
  put(scene,makeCard(outline([[-2.6,0,1],[2.6,0,1],[2.2,14,1],[-2.2,14,1]],1,.02),{t:.5,s:22,paint:P=>{bricks(P,null,'#5a5085',1.4,.7);P.fill(ell(0,11,1.7,1.7,20,.01),'#f3ead2',.98);P.line([[0,11],[0,12.3]],'#3b2147',.12,.95);P.line([[0,11],[.9,10.6]],'#3b2147',.1,.95);door(P,0,0,2,3.6,'#5a3a24');win(P,0,6,1.6,2.4,{arch:1})}}),X,0,Z);
  put(scene,makeCard(outline([[-3.4,13.6,1],[3.4,13.6,1],[.4,20,1]],1,.02),{t:.4,s:22,paint:P=>shingles(P,null,'#4b2390',.7,.9)}),X,0,Z+.3);
  lamp(X,Z+3,'#ffb35c',50,16,8)});
/* broen over åen og trolden */
BUILD.push(()=>{const X=32.5,Z=27;
  const b=makeCard(outline([[-7,0,1],[-5,1.6],[-2,2.8],[2,2.8],[5,1.6],[7,0,1],[6,0,1],[3,1.5],[0,1.9],[-3,1.5],[-6,0,1]],5,.02),{t:.6,s:22,both:true,paint:P=>{P.coat('#6a6090',null,{dir:0,bw:.3});for(let x=-6;x<7;x+=1.2)P.line([[x,0],[x,3]],'#4e4670',.05,.6)}});b.rotation.y=.12;put(scene,b,X,0,Z);
  for(const s of[-1,1]){const r=makeCard(outline([[-5,3.6,1],[-2,4.3],[2,4.3],[5,3.6,1],[5,4.2,1],[2,4.9],[-2,4.9],[-5,4.2,1]],4,.01),{t:.25,s:20,both:true,paint:P=>P.coat('#8a6a4a',null,{dir:0,bw:.2})});r.rotation.y=.12;put(scene,r,X+s*.2,0,Z+s*1.6)}});
SPOTS.arkade=[60,20];
BUILD.push(()=>{const X=66,Z=28;
  put(scene,makeCard(outline([[-13,0,1],[13,0,1],[13,12,1],[10,14.6,1],[-10,14.6,1],[-13,12,1]],1,.03),{t:.5,s:20,paint:P=>{P.coat('#3a2766',null,{dir:1.57,bw:.4});for(let x=-12.4;x<13;x+=1.3)P.line([[x,0],[x,14]],'#2c1d50',.05,.5);
    for(const[x,c1,c2]of[[-7.4,'#e05a8a','#7fd6ff'],[7.4,'#7be0a0','#f2c230']]){P.fill(ell(x,5,3,3,30,.01),'#c9a04a',.98);P.fill(ell(x,5,2.5,2.5,30,.01),'#2a1d14',.98);P.fill(ell(x,5,2.2,2.2,30,.01),c1,.9);P.fill(outline(rect(x-1,3.4,x+1,6.4),1,.01),c2,.9);
      for(let k=0;k<12;k++){const a=k/12*TAU;P.line([[x+Math.cos(a)*2.55,5+Math.sin(a)*2.55],[x+Math.cos(a)*2.95,5+Math.sin(a)*2.95]],'#7a5418',.08,.8)}}
    door(P,0,0,4.4,8.4,'#e9b949',{noIron:1});P.fill(outline(rect(-1.2,3.4,1.2,6.4),1,.01),'#2a1d14',.9);P.fill(outline(rect(-.9,3.8,.9,6),1,.01),'#7fd6ff',.9);
    for(let x=-12;x<=12;x+=2)P.fill(ell(x,13.4,.3,.3,8,0),'#fff1b8',.95)}}),X,0,Z);
  put(scene,sign('ARKADEN',FONT.arkade,15,3.2,'#24123e','#f2c230',{size:2.2,ls:.22,border:'#e05a8a',stroke:'#5a2a00',sw:.12,extra:P=>{for(let x=-7;x<=7;x+=1)for(const y of[.25,2.95])P.fill(ell(x,y,.15,.15,8,0),'#fff1b8',.95)}}),X,14.8,Z+.7);
  const star=makeCard(outline(starPts(0,0,2,.85).map(p=>[p[0],p[1],1]),1,.01),{t:.3,s:30,both:true,paint:P=>P.coat('#f2c230',null,{bw:.2})});put(scene,star,X,22,Z+.2);dowel(scene,X,14.6,20.6,Z,.18);
  lamp(X,Z+5,'#ff7ad0',60,20,8)});

/* ---- lygtepæle, svampe, græskar, buske og flere træer ---- */
const lampSpots=[];
BUILD.push(()=>{for(const[x,z]of[[-12,-6],[12,-6],[-8,11],[10,12],[-30,6],[26,8],[-44,18],[44,16],[-20,30],[36,32]])newLamp(x,z);
  for(const[x,z,k]of[[-24,12,1],[-36,14,.7],[22,14,1],[-52,10,.9],[54,4,.8],[16,32,.7],[-6,34,.8],[48,34,.9],[-70,4,1]])put(scene,makeCard(outline([[-1.6*k,0],[1.6*k,0],[2*k,1.4*k],[1.2*k,2.4*k],[0,2.6*k],[-1.2*k,2.4*k],[-2*k,1.4*k]],5,.04),{t:.4,s:30,paint:P=>{P.coat('#e07a2a',null,{dir:1.57,bw:.3});for(const x of[-.8,0,.8])P.line(curve([[x*k,0],[x*1.3*k,1.3*k],[x*k,2.5*k]],4),'#a84e1c',.08,.7);P.fill(outline(rect(-.25*k,2.4*k,.25*k,3.2*k),1,.01),'#4a6a2a',.95)}}),x,0,z);
  for(const[x,z]of[[-34,22],[-32,24],[30,20],[50,-6],[-56,-6],[-60,14],[20,-14],[-20,-14],[0,32],[70,8]]){put(scene,makeCard(outline([[-.3,0,1],[.3,0,1],[.3,1,1],[1.2,1.2],[0,2.2],[-1.2,1.2],[-.3,1,1]],4,.02),{t:.3,s:34,paint:P=>{P.coat(['#7fd6ff','#c9a0ff','#ff9ad0'][Math.floor(R(3))],null,{bw:.25});P.fill(outline(rect(-.3,0,.3,1),1,.01),'#efe3c8',.95);P.fill(ell(-.4,1.5,.2,.2,8,0),'#fff',.9);P.fill(ell(.4,1.4,.15,.15,8,0),'#fff',.9)}}),x,0,z)}});
BUILD.push(()=>{for(const[x,z,h,k]of[[-80,-14,9,1.1],[-78,10,8,1],[-84,36,7,.9],[80,-16,9,1.1],[80,8,8,1],[-30,-18,8,.9],[24,-26,8,.9],[-12,20,6,.8],[56,-30,8,.9],[-82,-28,9,1],[82,30,7,.9],[-6,-30,7,.8],[20,18,6,.8]])orangeTree(x,z,h,k);
  for(const[x,z,h]of[[-84,0,10],[84,-4,10],[-62,6,8],[76,18,8],[-50,-30,9]])pineTree(x,z,h)});
