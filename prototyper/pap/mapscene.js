/* ============ kortet: en pap-by på et bord ============
   Alt, der står stille, ligger i `scene` og tegnes én gang (bages) til et billede med dybde.
   Alt, der bevæger sig, ligger i `live` og tegnes oven på hvert billede. */
Painter.prototype.text=function(str,x,y,size,color,o={}){const g=this.g;g.save();g.font=`${size*this.s}px "Patrick Hand","Comic Sans MS",sans-serif`;g.fillStyle=color;g.textAlign=o.align||'center';g.textBaseline='middle';g.globalAlpha=o.alpha??.95;g.fillText(str,this.X(x),this.Y(y));g.restore()};
const scene=new THREE.Scene(),live=new THREE.Scene();
scene.background=new THREE.Color('#0d0a12');
{const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromEquirectangular(e).texture;scene.environment=env;live.environment=env;scene.environmentIntensity=live.environmentIntensity=.3;pm.dispose()}
/* lyset: aftenlys forfra, månelys bagfra og varme lamper (lamperne er gratis, fordi de bages) */
const key=new THREE.DirectionalLight('#ffdcb8',2.1);key.position.set(-50,90,110);key.target.position.set(0,0,-4);scene.add(key,key.target);
key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-75,right:75,top:60,bottom:-50,near:40,far:300});key.shadow.bias=-.0005;key.shadow.normalBias=.06;key.shadow.radius=2.5;
scene.add(new THREE.HemisphereLight('#8f9cff','#3a2a18',.5));
const moonL=new THREE.DirectionalLight('#aebfff',.6);moonL.position.set(40,60,-80);scene.add(moonL);
{const k2=key.clone();k2.castShadow=false;live.add(k2,k2.target);live.add(new THREE.HemisphereLight('#8f9cff','#3a2a18',.62));const m2=moonL.clone();live.add(m2)}

const GX0=-64,GX1=64,GZ0=-34,GZ1=30;
const BUILD=[];   /* små byggetrin, så indlæsningen kan vise hvor langt den er */

/* bordet og bunden */
BUILD.push(()=>{const t=tx(makeMat(),true);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(50,30);const m=new THREE.Mesh(new THREE.PlaneGeometry(500,300),new THREE.MeshStandardMaterial({map:t,roughness:.6}));m.rotation.x=-Math.PI/2;m.receiveShadow=true;put(scene,m,0,-.5,0)});
/* jorden: græs med sti, plads og å malet på */
const pathPts=[[[0,-2],[0,10],[0,22],[0,33]],[[0,-2],[-14,-4],[-28,-3],[-40,0]],[[0,-2],[14,-4],[28,-3],[38,0]],[[0,-2],[-6,-10],[-14,-18],[-26,-24]],[[0,-2],[8,-12],[22,-20],[40,-26]]];
BUILD.push(()=>{const m=makeCard(outline(rect(GX0,-GZ1,GX1,-GZ0),1,.05),{t:.6,s:12,cap:1600,paint:P=>{
  P.coat('#3f6a3a',null,{dir:.2,bw:1,vary:.1});
  P.dabs('#2f5530',900,{len:.8,w:.12,dir:1.57,spread:.6,alpha:.5});P.dabs('#5f8e4a',700,{len:.7,w:.1,dir:1.57,spread:.6,alpha:.45});
  /* åen */
  const riv=[];for(let i=0;i<=24;i++){const t=i/24;riv.push([mix(30,58,t)+5*Math.sin(t*6),mix(-30,24,t)])}
  P.line(riv,'#2a4f8f',2.8,.95);P.line(riv,'#4f7fd0',1.6,.9);P.line(riv.map(p=>[p[0]-.4,p[1]]),'#9cc3ff',.25,.6);
  /* stierne og pladsen */
  for(const cp of pathPts){const c=curve(cp,8);P.line(c,'#8e7552',4.6,.95);P.line(c,'#cdb489',3.6,.95)}
  P.coat('#bfa682',ell(0,-2,15,10,32,.02),{dir:.3,bw:.5});P.coat('#8a7aa8',ell(0,-2,13,8.6,32,.02),{dir:.3,bw:.4,alpha:.8});
  for(let i=0;i<260;i++){const a=R(TAU),r=Math.sqrt(R(1)),x=Math.cos(a)*r*12.5,y=-2+Math.sin(a)*r*8.2;P.line([...ell(x,y,.7,.45,8,.1),[x+.7,y]],'#5a4f75',.06,.5)}
  for(let i=0;i<40;i++){const x=R(GX0,GX1),y=R(-GZ1,-GZ0);P.fill(ell(x,y,.35,.35,8,.1),rnd()<.5?'#f3ead2':'#e7b9d8',.8)}}});
 m.rotation.x=-Math.PI/2;put(scene,m,0,0,0)});

/* himlen bagest: skumring malet på to plader pap */
BUILD.push(()=>{for(const[x0,x1,dz]of[[-66,1,0],[-1,66,.42]]){put(scene,makeCard(outline(rect(x0,0,x1,62),1,.04),{t:.4,s:11,cap:1536,noBump:true,paint:P=>{
    P.coat('#241a4a',null,{dir:.02,bw:1,vary:.06});
    const band=(y,a)=>{const cp=[[x0-2,-2,1],[x1+2,-2,1],[x1+2,y,1]];for(let x=x1-6;x>x0;x-=9)cp.push([x,y+R(-a,a)]);cp.push([x0-2,y,1]);return outline(cp,6,0)};
    P.coat('#3d2c6a',band(36,2),{dir:-.02,bw:1,alpha:.85,gaps:2});P.coat('#6a4581',band(24,2),{dir:.03,bw:1,alpha:.8,gaps:2.2});P.coat('#a2668a',band(16,1.6),{dir:.02,bw:.9,alpha:.7,gaps:2.6});
    for(let i=0;i<60;i++){const x=R(x0,x1),y=R(30,61);P.fill(starPts(x,y,R(.25,.5),.12,R(1)),'#f6e7c0',R(.5,.95))}}}),0,0,GZ0-6+dz)}
  for(const y of[12,30,48])tape(scene,0,y,GZ0-5.4,4.4,1.5,R(-.12,.12));
  /* månen på en split-nål */
  put(scene,makeCard(ell(0,0,6,6,28,.02),{t:.3,s:26,paint:P=>{P.coat('#efe2bd',null,{dir:.6,bw:.4});for(const[x,y,r]of[[-1.8,1.4,1.1],[1.6,-1.2,.8],[.6,2.4,.5],[-.6,-2.6,.6]])P.fill(ell(x,y,r,r,14,.05),'#cfc09a',.8)}}),42,50,GZ0-5.2);
  pin(scene,42,50,GZ0-5.2+.15,GZ0-5.2-.15,.3)});

/* bakker og en række efterårstræer bag skolen */
const orangeTree=(parent,x,z,h,k=1)=>{const g=new THREE.Group();put(parent,g,x,0,z);
  g.add(makeCard(outline([[-.8*k,0,1],[.8*k,0,1],[.5*k,h,1],[-.5*k,h,1]],1,.04),{t:.4,s:22,paint:P=>P.coat('#5a3a24',null,{dir:1.55,bw:.35})}));
  const blob=(cx,cy,r,col,dz)=>{const cp=[];for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*R(.84,1.12);cp.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}
    put(g,makeCard(outline(cp,6,.05),{t:.4,s:20,paint:P=>{P.coat(col,null,{dir:R(TAU),bw:.55,vary:.1});P.dabs(shade(col,-.25),r*r*4,{len:.45,w:.13,dir:R(TAU),spread:1.2,alpha:.6});P.dabs(shade(col,.28),r*r*3,{len:.4,w:.12,dir:R(TAU),spread:1.2,alpha:.55})}}),0,0,dz)};
  blob(2*k,h-.3*k,2.6*k,'#b4501f',-.42);blob(0,h+1.6*k,3.9*k,'#d0702a',.42);blob(-2.1*k,h-.4*k,2.8*k,'#e39a3a',.84)};
const pineTree=(parent,x,z,h)=>{const g=new THREE.Group();put(parent,g,x,0,z);
  const tier=(y0,w,hh,col,dz)=>put(g,makeCard(outline([[-w,y0,1],[-w*.45,y0+.55,1],[0,y0-.15,1],[w*.5,y0+.5,1],[w,y0,1],[0,y0+hh,1]],1,.04),{t:.4,s:20,paint:P=>{P.coat(col,null,{dir:1.2,bw:.45,vary:.1});P.dabs(shade(col,-.25),w*hh*2,{len:.6,w:.12,dir:-1.57,spread:.5,alpha:.6})}}),0,0,dz);
  tier(1,4,6.5,'#24503f',.42);tier(4.5,3.2,5.5,'#2f6650',.84);tier(7.8,2.4,4.5,'#3b7a5f',1.26)};
BUILD.push(()=>{
  const hill=(z,base,amp,ph,col)=>{const yT=x=>base+amp*Math.sin(x*.05+ph)+amp*.4*Math.sin(x*.13+ph*2);const cp=[[-66,0,1],[66,0,1],[66,yT(66),1]];for(let x=61;x>-64;x-=5)cp.push([x,yT(x)]);cp.push([-66,yT(-66),1]);
    put(scene,makeCard(outline(cp,5,.05),{t:.4,s:11,cap:1536,noBump:true,paint:P=>{P.coat(col,null,{dir:.1,bw:.9,vary:.08});P.dabs(shade(col,-.2),600,{len:.8,w:.3,dir:1.4,spread:2,alpha:.4})}}),0,0,z)};
  hill(GZ0-3,17,3,.5,'#2e4f3c');hill(GZ0-.5,11,2.4,2.2,'#3a6247')});
BUILD.push(()=>{for(let x=-60;x<=60;x+=7.5){if(Math.abs(x)<22)continue;orangeTree(scene,x+R(-1.5,1.5),GZ0+2+R(0,2),R(6,9),R(.8,1.05))}});

/* ---- Magiskolen: borg af pap med tårne, ur og port ---- */
const flagSpots=[];
BUILD.push(()=>{const Z=-22,stone='#5d5288';
  const wall=(x0,x1,y1,z,extra)=>put(scene,makeCard(outline(rect(x0,0,x1,y1),1,.03),{t:.5,s:20,paint:P=>{P.coat(stone,null,{dir:0,bw:.5,vary:.1});
      for(let y=1.6;y<y1;y+=1.8)for(let x=x0+((y/1.8|0)%2?1.2:0);x<x1;x+=2.4)P.line([[x,y],[x+2.2,y]],'#3c3466',.06,.5);
      for(let y=1.6;y<y1;y+=1.8)for(let x=x0+((y/1.8|0)%2?1.2:0);x<x1;x+=2.4)P.line([[x,y],[x,y+1.8]],'#3c3466',.05,.4);
      extra&&extra(P)}}),0,0,z);
  const win=(P,x,y,w=1.6,h=2.6)=>{const a=outline([[x-w/2,y,1],[x+w/2,y,1],[x+w/2,y+h*.7],[x,y+h],[x-w/2,y+h*.7]],4,.02);P.fill(a,'#2b1d33',.95);P.fill(outline([[x-w/2+.25,y+.2,1],[x+w/2-.25,y+.2,1],[x+w/2-.25,y+h*.66],[x,y+h-.3],[x-w/2+.25,y+h*.66]],4,.02),'#ffcf5e',.95);P.line([[x,y+.2],[x,y+h-.35]],'#6b4a12',.08,.7)};
  const roof=(x,y,w,h,col,z)=>{put(scene,makeCard(outline([[x-w/2-.6,y,1],[x+w/2+.6,y,1],[x+.3,y+h*.55],[x+1.2,y+h,1],[x-.4,y+h*.6]],5,.03),{t:.4,s:20,paint:P=>{P.coat(col,null,{dir:1.2,bw:.4});for(let yy=y+1;yy<y+h*.8;yy+=1.2)P.line([[x-w/2,yy],[x+w/2,yy]].map(p=>[mix(x,p[0],1-(yy-y)/h),p[1]]),shade(col,-.3),.07,.5)}}),0,0,z);flagSpots.push([x+1.2,y+h,z])};
  wall(-17,17,22,Z,P=>{for(const x of[-12,-7,7,12])win(P,x,12);for(const x of[-12,12])win(P,x,4.5);
    P.fill(outline([[-5,0,1],[5,0,1],[5,7],[0,11],[-5,7]],6,.02),'#2b1a12',.95);P.coat('#7a4a2a',outline([[-4.2,0,1],[4.2,0,1],[4.2,6.6],[0,10.2],[-4.2,6.6]],6,.02),{dir:1.57,bw:.3});P.line([[0,0],[0,10]],'#3b2213',.12,.8);
    for(const s of[-1,1]){P.fill(outline(rect(s*8.3-1.4,13,s*8.3+1.4,19),1,.02),'#5a2a9a',.95);P.fill(starPts(s*8.3,16.6,.9,.38),'#f2c230',.95)}
    for(let x=-16;x<17;x+=3)P.fill(outline(rect(x,21.2,x+1.6,22.6),1,.01),stone,1)});
  for(const s of[-1,1]){wall(s*16-4,s*16+4,30,Z+.6,P=>{win(P,s*16,20);win(P,s*16,11)});roof(s*16,30,8,11,'#5a2a9a',Z+.7)}
  wall(-4,4,38,Z-.6,P=>{P.fill(ell(0,30,2.6,2.6,24,.01),'#efe3c8',.98);P.line([...ell(0,30,2.6,2.6,24,0),[2.6,30]],'#3b2147',.12,.9);P.line([[0,30],[0,32]],'#3b2147',.14,.9);P.line([[0,30],[1.3,29.3]],'#3b2147',.12,.9);win(P,0,20);win(P,0,12)});
  roof(0,38,8,13,'#4b2390',Z-.5);
  /* skilt over porten */
  put(scene,makeCard(outline(rect(-7,0,7,2.6),1,.02),{t:.3,s:40,paint:P=>{P.coat('#2a1d12',null,{bw:.3});P.text('Magiskolen',0,1.3,2,'#f6e7c0')}}),0,22.6,Z+.9);
  dowel(scene,-5,20,23,Z+.6,.15);dowel(scene,5,20,23,Z+.6,.15)});

/* ---- Kollegiet til venstre ---- */
let chimneyAt;
BUILD.push(()=>{const X=-40,Z=-7;
  put(scene,makeCard(outline(rect(-10,0,10,22),1,.03),{t:.5,s:20,paint:P=>{P.coat('#9b86c9',null,{dir:1.57,bw:.4});for(let y=1;y<22;y+=1.2)P.line([[-10,y],[10,y]],'#7b67a9',.05,.45);
    for(const[x,y]of[[-6,13],[0,13],[6,13],[-6,5],[6,5]]){P.fill(outline(rect(x-1.9,y,x+1.9,y+4),1,.02),'#3b2a1f',.95);P.fill(outline(rect(x-1.5,y+.3,x+1.5,y+3.7),1,.02),'#ffcf5e',.95);P.line([[x,y+.3],[x,y+3.7]],'#6b4a12',.09,.8);P.line([[x-1.5,y+2],[x+1.5,y+2]],'#6b4a12',.09,.8)}
    P.fill(outline([[-2,0,1],[2,0,1],[2,5.5],[0,7.2],[-2,5.5]],5,.02),'#3b2a1f',.95);P.coat('#5a2a9a',outline([[-1.6,0,1],[1.6,0,1],[1.6,5.3],[0,6.8],[-1.6,5.3]],5,.02),{dir:1.57,bw:.3});
    P.fill(outline(rect(-4,9.6,4,11.4),1,.02),'#2a1d12',.95);P.text('Kollegiet',0,10.5,1.5,'#f6e7c0')}}),X,0,Z);
  {const m=makeCard(outline(rect(0,0,8,22),1,.03),{t:.5,s:16,paint:P=>{P.coat('#7f6bb0',null,{dir:1.57,bw:.4});P.fill(outline(rect(2.4,13,5.6,17),1,.02),'#ffcf5e',.9)}});m.rotation.y=Math.PI/2;put(scene,m,X+10,0,Z)}
  put(scene,makeCard(outline([[-12,21,1],[12,21,1],[0,33,1]],1,.03),{t:.5,s:20,paint:P=>{P.coat('#34508f',null,{dir:0,bw:.4});for(let y=22;y<32;y+=1.4)P.line([[-12+(y-21),y],[12-(y-21),y]],'#22386a',.07,.6);P.fill(ell(0,26,1.6,1.6,16,.02),'#ffcf5e',.95);P.line([...ell(0,26,1.6,1.6,16,0),[1.6,26]],'#3b2a1f',.1,.8)}}),X,0,Z-.6);
  put(scene,makeCard(outline(rect(4,24,6.6,34),1,.02),{t:.4,s:22,paint:P=>{P.coat('#6a3a2a',null,{dir:1.57,bw:.3});for(let y=25;y<34;y+=1.2)P.line([[4,y],[6.6,y]],'#4a2214',.06,.5)}}),X,0,Z-1.2);
  chimneyAt=new THREE.Vector3(X+5.3,34.5,Z-1.2)});

/* ---- Boblebutikken til højre ---- */
BUILD.push(()=>{const X=38,Z=-6;
  put(scene,makeCard(outline(rect(-11,0,11,16),1,.03),{t:.5,s:20,paint:P=>{P.coat('#2f8f86',null,{dir:1.57,bw:.4});for(let x=-10;x<11;x+=1.4)P.line([[x,0],[x,16]],'#237068',.05,.45);
    P.fill(outline(rect(-8.5,2,-1,9.5),1,.02),'#3b2a1f',.95);P.fill(outline(rect(-8,2.4,-1.5,9),1,.02),'#ffe6b0',.95);
    for(const[x,y,c]of[[-6.6,4,'#f39ac0'],[-4.7,4,'#7fd6ff'],[-2.9,4,'#f2c230'],[-5.7,6.5,'#b47aff'],[-3.8,6.5,'#7be0a0'],[-6.6,8.2,'#ff8f6a'],[-2.9,8,'#f39ac0']])P.fill(ell(x,y,.82,.82,16,.02),c,.95);
    P.fill(outline([[2,0,1],[7,0,1],[7,7],[4.5,9],[2,7]],5,.02),'#3b2a1f',.95);P.coat('#f6e7c0',outline([[2.4,0,1],[6.6,0,1],[6.6,6.8],[4.5,8.6],[2.4,6.8]],5,.02),{dir:1.57,bw:.3});P.fill(ell(4.5,5.6,1.1,1.1,14,.02),'#7fd6ff',.9);
    P.fill(outline(rect(-9,12.4,9,15),1,.02),'#1f5f5a',.95);P.text('Boblebutikken',0,13.7,1.7,'#f6e7c0')}}),X,0,Z);
  {const m=makeCard(outline(rect(0,0,7,16),1,.03),{t:.5,s:16,paint:P=>P.coat('#257369',null,{dir:1.57,bw:.4})});m.rotation.y=-Math.PI/2;put(scene,m,X-11,0,Z)}
  {const aw=makeCard(outline(rect(-11.6,0,11.6,4),1,.02),{t:.3,s:22,both:true,paint:P=>{for(let x=-11.6,i=0;x<11.6;x+=2.32,i++)P.coat(i%2?'#f6e7c0':'#e05a8a',outline(rect(x,-1,x+2.32,5),1,.01),{dir:1.57,bw:.25});const sc=[];for(let x=-11.6;x<=11.6;x+=1.16)sc.push([x,(Math.round((x+11.6)/1.16)%2)?.3:-.2]);P.line(sc,'#7a2a4a',.08,.6)}});aw.rotation.x=.55;put(scene,aw,X,10.4,Z+2.2)}
  put(scene,makeCard(outline(rect(-2,16,2,19),1,.02),{t:.4,s:22,paint:P=>P.coat('#1f5f5a',null,{bw:.3})}),X,0,Z-.4);
  const glass=new THREE.Mesh(new THREE.SphereGeometry(4.2,28,18),new THREE.MeshStandardMaterial({color:'#dff6ff',transparent:true,opacity:.32,roughness:.05,metalness:.1}));put(scene,glass,X,23,Z-.4);
  for(const[x,y,z,c]of[[-1.4,-1.6,0,'#f39ac0'],[1.2,-1.8,.6,'#7fd6ff'],[0,-.4,-.6,'#f2c230'],[-.6,-2.4,1,'#b47aff'],[1.6,-.6,-.4,'#7be0a0']]){const b=new THREE.Mesh(new THREE.SphereGeometry(1.1,16,10),new THREE.MeshStandardMaterial({color:c,roughness:.3}));b.castShadow=true;put(scene,b,X+x,23+y,Z-.4+z)}});

/* ---- Øksebrønden midt på pladsen ---- */
let wellAt;
BUILD.push(()=>{const X=0,Z=-2;wellAt=new THREE.Vector3(X,3.4,Z);
  const stoneTex=cv(256,64),sg=stoneTex.getContext('2d');sg.fillStyle='#7d7398';sg.fillRect(0,0,256,64);for(let y=0;y<64;y+=16)for(let x=(y/16)%2?16:0;x<256;x+=32){sg.strokeStyle='#4e4670';sg.lineWidth=2;sg.strokeRect(x+1,y+1,30,14)}
  const st=tx(stoneTex,true);st.wrapS=THREE.RepeatWrapping;st.repeat.set(3,1);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.4,3.2,28,1,true),new THREE.MeshStandardMaterial({map:st,roughness:.9,side:THREE.DoubleSide}));ring.castShadow=ring.receiveShadow=true;put(scene,ring,X,1.6,Z);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(4.25,.35,8,28),new THREE.MeshStandardMaterial({color:'#9a90b8',roughness:.8}));rim.rotation.x=Math.PI/2;rim.castShadow=true;put(scene,rim,X,3.2,Z);
  const water=new THREE.Mesh(new THREE.CircleGeometry(4,28),new THREE.MeshStandardMaterial({color:'#7a3fd0',emissive:'#9b5cff',emissiveIntensity:1.2,roughness:.2}));water.rotation.x=-Math.PI/2;put(scene,water,X,2.8,Z);
  for(const s of[-1,1])dowel(scene,X+s*4,0,9.5,Z,.3);
  put(scene,makeCard(outline([[-6,9,1],[6,9,1],[0,13.2,1]],1,.03),{t:.4,s:24,paint:P=>{P.coat('#6a2a5a',null,{dir:0,bw:.3});for(let y=9.8;y<13;y+=.9)P.line([[-6+(y-9)*1.4,y],[6-(y-9)*1.4,y]],'#4a1a3e',.07,.6)}}),X,0,Z+.3);
  put(scene,makeCard(outline(rect(-5.6,0,5.6,2.2),1,.02),{t:.3,s:40,paint:P=>{P.coat('#2a1d12',null,{bw:.3});P.text('Øksebrønden',0,1.1,1.5,'#f6e7c0')}}),X,6.2,Z+.4)});

/* ---- vejviser, lygtepæle, bænk, græskar og svampe ---- */
const lampSpots=[];
BUILD.push(()=>{
  const X=-12,Z=6;dowel(scene,X,0,11,Z,.3);
  [['Skolen',9.4,-1,'#7b4fcf'],['Kollegiet',7.4,1,'#d0702a'],['Bobler',5.4,-1,'#2f8f86']].forEach(([t,y,dir,c])=>{const w=t.length*.9+2;
    const pts=dir>0?[[0,-.8,1],[w,-.8,1],[w+1.2,0,1],[w,.8,1],[0,.8,1]]:[[0,-.8,1],[-w,-.8,1],[-w-1.2,0,1],[-w,.8,1],[0,.8,1]];
    put(scene,makeCard(outline(pts,1,.02),{t:.3,s:36,both:true,paint:P=>{P.coat(c,null,{dir:0,bw:.3});P.text(t,dir*(w/2+.2),0,1.3,'#f6e7c0')}}),X,y,Z+.4)});
  for(const[x,z]of[[-18,-1],[18,-1],[-7,16],[10,14]]){dowel(scene,x,0,10,z,.22);const head=makeCard(outline([[-1.1,0,1],[1.1,0,1],[1.4,1.6],[0,2.6,1],[-1.4,1.6]],3,.02),{t:.3,s:30,paint:P=>{P.coat('#2a2233',null,{bw:.3});P.fill(outline(rect(-.7,.3,.7,1.6),1,.01),'#ffe08a',.98)}});put(scene,head,x,10,z+.2);
    const L=new THREE.PointLight('#ffb35c',90,26,2);put(scene,L,x,11,z+1.2);lampSpots.push(new THREE.Vector3(x,11.1,z+.6))}
  {const b=makeCard(outline([[-4,0,1],[4,0,1],[4,3.6,1],[-4,3.6,1]],1,.02),{t:.4,s:24,paint:P=>{P.coat('#6b4428',null,{dir:0,bw:.3});for(const y of[1.2,2.4])P.line([[-4,y],[4,y]],'#3b2213',.08,.7)}});put(scene,b,10,0,4)}
  for(const[x,z,k]of[[-26,10,1],[-22,14,.7],[25,12,1.1],[-50,14,.9],[52,10,.8],[18,22,.7]]){put(scene,makeCard(outline([[-1.6*k,0],[1.6*k,0],[2*k,1.4*k],[1.2*k,2.4*k],[0,2.6*k],[-1.2*k,2.4*k],[-2*k,1.4*k]],5,.04),{t:.4,s:30,paint:P=>{P.coat('#e07a2a',null,{dir:1.57,bw:.3});for(const x of[-.8,0,.8])P.line(curve([[x*k,0],[x*1.3*k,1.3*k],[x*k,2.5*k]],4),'#a84e1c',.08,.7);P.fill(outline(rect(-.25*k,2.4*k,.25*k,3.2*k),1,.01),'#4a6a2a',.95)}}),x,0,z)}
  for(const[x,z]of[[-32,18],[-30,20],[30,20],[46,-14],[-46,-16]]){put(scene,makeCard(outline([[-.3,0,1],[.3,0,1],[.3,1,1],[1.2,1.2],[0,2.2],[-1.2,1.2],[-.3,1,1]],4,.02),{t:.3,s:34,paint:P=>{P.coat('#7fd6ff',null,{bw:.25});P.fill(outline(rect(-.3,0,.3,1),1,.01),'#efe3c8',.95);P.fill(ell(-.4,1.5,.2,.2,8,0),'#fff',.9);P.fill(ell(.4,1.4,.15,.15,8,0),'#fff',.9)}}),x,0,z)}});
/* træer foran og i siderne */
BUILD.push(()=>{for(const[x,z,h,k]of[[-58,-14,9,1.1],[-56,8,8,1],[-50,22,7,.9],[56,-16,9,1.1],[58,4,8,1],[-30,-18,8,.9],[22,-18,8,.9],[-20,24,6,.8],[48,22,7,.9]])orangeTree(scene,x,z,h,k);
  for(const[x,z,h]of[[-62,-2,10],[62,-4,10],[-44,24,8],[60,18,8]])pineTree(scene,x,z,h)});

/* ============ det levende lag ============ */
const sprite=(cols,size)=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);cols.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,64,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(size,size,1);return s};
const glows=[],puffs=[],flies=[],flagsLive=[];
let bird;
function buildLive(){
  for(const p of lampSpots){const s=sprite([[0,'rgba(255,220,150,.9)'],[.3,'rgba(255,170,80,.35)'],[1,'rgba(255,140,40,0)']],7);s.position.copy(p);live.add(s);glows.push({s,base:7,ph:R(TAU),f:R(5,9)})}
  {const s=sprite([[0,'rgba(200,150,255,.8)'],[.35,'rgba(150,90,255,.35)'],[1,'rgba(120,60,255,0)']],12);s.position.copy(wellAt);live.add(s);glows.push({s,base:12,ph:0,f:1.6,slow:true})}
  for(let i=0;i<16;i++){const s=sprite([[0,'rgba(230,255,170,1)'],[.3,'rgba(190,255,120,.5)'],[1,'rgba(150,255,80,0)']],1.6);live.add(s);flies.push({s,x:R(-55,55),y:R(1.5,9),z:R(-16,26),ph:R(TAU),sp:R(.3,.8)})}
  for(let i=0;i<7;i++){const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(200,190,215,.55)');gr.addColorStop(1,'rgba(200,190,215,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false}));live.add(s);puffs.push({s,t:i/7*4})}
  for(const[x,y,z]of flagSpots){const g=new THREE.Group();put(live,g,x,y,z);dowel(g,0,0,4,0,.12);
    const f=makeCard(outline([[0,0,1],[3.4,.6,1],[3.2,1.6],[3.6,2.4,1],[0,2.4,1]],3,.02),{t:.15,s:30,both:true,paint:P=>{P.coat(['#e05a8a','#f2c230','#7fd6ff'][flagsLive.length%3],null,{dir:0,bw:.3})}});put(g,f,0,1.5,0);flagsLive.push({f,ph:R(TAU)})}
  /* en fugl der flyver over himlen */
  bird=new THREE.Group();live.add(bird);const body=makeCard(outline([[-1.6,0],[0,.6],[1.8,.3],[2.4,.8,1],[2,-.2],[0,-.5]],4,.02),{t:.15,s:40,both:true,paint:P=>{P.coat('#2a2233',null,{bw:.2});P.fill(ell(1.6,.4,.15,.15,6,0),'#fff',.9)}});bird.add(body);
  bird.wings=[];for(const s of[1,-1]){const w=makeCard(outline([[0,0,1],[-.6,3.2],[-1.8,2.6],[-1.2,0,1]],4,.02),{t:.12,s:40,both:true,paint:P=>P.coat('#3a3046',null,{bw:.2})});const g=new THREE.Group();g.add(w);g.position.set(.3,.3,s*.2);bird.add(g);bird.wings.push({g,s})}}
