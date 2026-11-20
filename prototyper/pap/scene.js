/* ============ garderoben: en skoæske indrettet som heksens garderobe ============ */
const scene=new THREE.Scene();scene.background=new THREE.Color('#0d0a12');
{const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(e).texture;scene.environmentIntensity=.35;pm.dispose()}
/* lyset: en varm lampe forfra, svagt blåt fyld, og så dem der bor i scenen (kuglen, lyset, pærerne) */
const key=new THREE.DirectionalLight('#ffe6c4',2.3);key.position.set(-30,70,90);key.target.position.set(0,14,-4);scene.add(key,key.target);
key.castShadow=true;key.shadow.mapSize.set(FINE?4096:2048,FINE?4096:2048);Object.assign(key.shadow.camera,{left:-45,right:45,top:50,bottom:-10,near:30,far:220});key.shadow.bias=-.0006;key.shadow.normalBias=.05;key.shadow.radius=FINE?3:2;
scene.add(new THREE.HemisphereLight('#8e9cff','#3a2414',.42));
const rim=new THREE.DirectionalLight('#b9c6ff',.35);rim.position.set(50,30,10);scene.add(rim);

/* bordet uden for æsken */
{const t=tx(makeMat(),true);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(44,26);const m=new THREE.Mesh(new THREE.PlaneGeometry(440,260),new THREE.MeshStandardMaterial({map:t,roughness:.6}));m.rotation.x=-Math.PI/2;m.position.y=-.45;m.receiveShadow=true;put(scene,m,0,-.45,10)}

const BX0=-33,BX1=33,BZ0=-15,BZ1=13,BH=46;
/* tapetet: dyb indigo med striber og guldstjerner sat med skabelon */
function wallpaper(P,x0,x1,dark){
  P.coat(dark?'#2b2056':'#35296a',null,{dir:1.57,bw:.8,vary:.07,gaps:.6});
  for(let x=x0+2;x<x1;x+=4.5)P.coat('#43357f',outline(rect(x,-1,x+1.6,BH+1),1,.03),{dir:1.57,bw:.5,alpha:.55,gaps:1.4});
  for(let y=4;y<BH;y+=5.5)for(let x=x0+((y/5.5|0)%2?3.5:1.2);x<x1;x+=4.5){const cp=[];for(let i=0;i<10;i++){const a=Math.PI/2+i/10*TAU,r=i%2?.32:.78;cp.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}P.fill(cp,'#d9a843',.62)}
  /* lyset falder af mod loftet */
  const g=P.g,gr=g.createLinearGradient(0,0,0,P.h*.6);gr.addColorStop(0,'rgba(10,6,22,.55)');gr.addColorStop(1,'rgba(10,6,22,0)');g.fillStyle=gr;g.fillRect(0,0,P.w,P.h)}
put(scene,makeCard(outline(rect(BX0,0,1,BH),1,.05),{t:.4,s:16,cap:1536,noBump:true,paint:P=>wallpaper(P,BX0,1)}),0,0,BZ0);
put(scene,makeCard(outline(rect(-1,0,BX1,BH),1,.05),{t:.4,s:16,cap:1536,noBump:true,paint:P=>wallpaper(P,-1,BX1)}),0,0,BZ0+.42);
for(const y of[8,22,36])tape(scene,0,y,BZ0+.64,4.4,1.5,R(-.12,.12));
/* sidevæggene: man ser bølgepappet i kanten forrest */
for(const s of[-1,1]){const z0=s<0?-BZ1:BZ0,z1=s<0?-BZ0:BZ1,m=makeCard(outline(rect(z0,0,z1,BH),1,.05),{t:.5,s:12,cap:1024,noBump:true,paint:P=>wallpaper(P,z0,z1,true)});m.rotation.y=-s*Math.PI/2;put(scene,m,s*BX1,0,0)}
/* gulvet: brædder malet med pensel */
{const m=makeCard(outline(rect(BX0,BZ0,BX1,BZ1),1,.04),{t:.5,s:14,cap:1536,paint:P=>{P.coat('#6a4128',null,{dir:0,bw:.7,vary:.1});
  for(let z=BZ0+3.2;z<BZ1;z+=3.2){P.line([[BX0,z+R(-.1,.1)],[BX1,z+R(-.1,.1)]],'#3b2213',.12,.7);P.line([[BX0,z-.25],[BX1,z-.25]],'#8a5a39',.06,.4)}
  for(let i=0;i<30;i++){const x=R(BX0,BX1),z=BZ0+3.2*Math.floor(R(0,9));P.line([[x,z],[x,z+3.2]],'#3b2213',.08,.6)}}});
 m.rotation.x=-Math.PI/2;put(scene,m,0,-.25,0)}

/* tæppet heksen står på */
{const m=makeCard(ell(0,0,11,6.2,28,.02),{t:.25,s:22,paint:P=>{P.coat('#7a2f4f',null,{dir:.3,bw:.5});P.coat('#a8466a',ell(0,0,8.6,4.8,28,.02),{dir:-.2,bw:.45,gaps:.6});P.coat('#d9a843',ell(0,0,6.6,3.6,28,.02),{dir:.1,bw:.4,gaps:1.2,alpha:.8});P.coat('#5b2440',ell(0,0,5.6,3,28,.02),{dir:.2,bw:.4});
  for(let i=0;i<40;i++){const a=i/40*TAU;P.line([[Math.cos(a)*10.4,Math.sin(a)*5.8],[Math.cos(a)*11.4,Math.sin(a)*6.5]],'#e9d6b0',.09,.8)}}});
 m.rotation.x=-Math.PI/2;put(scene,m,-1,.05,1)}

/* ---- det store spejl: guldramme med pærer, glas malet med lys der glider over ---- */
const MX=-1,MZ=-11.5,MW=11.5,MB=0.8,MT=31;
function archPts(w,y0,top,n=18){const o=[[-w,y0,1],[w,y0,1]],r=w,cy=top-r;for(let i=0;i<=n;i++){const a=i/n*Math.PI;o.push([Math.cos(a)*r,cy+Math.sin(a)*r])}return o}
{const glass=makeCard(outline(archPts(MW-1.2,MB,MT-1.2),1,.02),{t:.3,s:16,paint:P=>{P.coat('#3e4a86',null,{dir:1.2,bw:.7,vary:.08});P.coat('#5e6fb0',outline([[-14,4,1],[-4,4,1],[10,32,1],[0,32,1]],1,.03),{dir:1.1,bw:.4,alpha:.5,gaps:1.6});P.coat('#8a9bd6',outline([[-6,4,1],[-3.6,4,1],[10.4,32,1],[8,32,1]],1,.03),{dir:1.1,bw:.3,alpha:.45,gaps:1.8});
  const g=P.g,gr=g.createRadialGradient(P.w/2,P.h*.35,0,P.w/2,P.h*.35,P.h*.7);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(12,8,30,.5)');g.fillStyle=gr;g.fillRect(0,0,P.w,P.h)}});
 glass.material[0].roughness=.35;glass.material[0].metalness=.25;put(scene,glass,MX,0,MZ);
 /* rammen er ét U-formet stykke pap: ydre bue frem, indre bue tilbage */
 const n=22,out=[],inn=[],ro=MW,ri=MW-1.6,cy=MT-MW;
 out.push([-ro,0,1]);for(let i=n;i>=0;i--){const a=i/n*Math.PI;out.push([Math.cos(a)*ro,cy+Math.sin(a)*ro])}out.push([ro,0,1],[ri,0,1]);
 for(let i=0;i<=n;i++){const a=i/n*Math.PI;inn.push([Math.cos(a)*ri,cy+Math.sin(a)*ri])}inn.push([-ri,0,1]);
 const fr=makeCard(outline([...out,...inn],1,.02),{t:.5,s:22,paint:P=>{P.coat('#b8862e',null,{dir:.7,bw:.35,vary:.12});P.dabs('#f2d27a',260,{len:.5,w:.12,dir:.7,spread:.4,alpha:.6});P.dabs('#7a5418',200,{len:.4,w:.1,dir:.7,spread:.4,alpha:.5});
   const mid=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI;mid.push([Math.cos(a)*(ri+.8),cy+Math.sin(a)*(ri+.8)])}P.line([[-(ri+.8),0],...mid,[ri+.8,0]],'#6b4a12',.08,.6)}});
 fr.material[0].metalness=.55;fr.material[0].roughness=.45;put(scene,fr,MX,0,MZ+.42);
 /* pærerne: små glødende perler på split-nåle */
 const bulbM=new THREE.MeshStandardMaterial({color:'#fff1c2',emissive:'#ffd27a',emissiveIntensity:1.6,roughness:.4});
 const BG=new THREE.SphereGeometry(.42,12,8);
 for(let i=0;i<=12;i++){const a=i/12*Math.PI,x=Math.cos(a)*(ri+.8),y=cy+Math.sin(a)*(ri+.8);const b=new THREE.Mesh(BG,bulbM);put(scene,b,MX+x,y,MZ+.9)}
 for(const s of[-1,1])for(const y of[4,9,14]){const b=new THREE.Mesh(BG,bulbM);put(scene,b,MX+s*(ri+.8),y,MZ+.9)}
 const ml=new THREE.PointLight('#ffcf86',55,40,2);put(scene,ml,MX,MT-2,MZ+5)}

/* ---- klædeskabet til venstre med åben låge og kjoler på bøjler ---- */
const hangers=[];
{const X0=-30.5,X1=-18,Z=-12.4,H=30;
 put(scene,makeCard(outline(rect(X0,0,X1,H),1,.03),{t:.4,s:16,paint:P=>{P.coat('#1c1226',null,{dir:1.57,bw:.6,vary:.06});P.coat('#2a1c36',outline(rect(X0,0,X1,H*.5),1,.03),{dir:1.57,bw:.6,alpha:.6,gaps:1.4})}}),0,0,Z);
 const wood='#5a3a24',paintWood=P=>{P.coat(wood,null,{dir:1.57,bw:.4,vary:.12});P.dabs('#3a2414',60,{len:1.2,w:.06,dir:1.57,spread:.08,alpha:.55});P.dabs('#7d5636',40,{len:1,w:.05,dir:1.57,spread:.08,alpha:.4})};
 put(scene,makeCard(outline(rect(X0-.6,0,X0+1,H+.6),1,.03),{t:.5,s:22,paint:paintWood}),0,0,Z+3);
 put(scene,makeCard(outline(rect(X1-1,0,X1+.6,H+.6),1,.03),{t:.5,s:22,paint:paintWood}),0,0,Z+3);
 put(scene,makeCard(outline([[X0-1.6,H-1,1],[X1+1.6,H-1,1],[X1+1.6,H+1.2,1],[(X0+X1)/2+3,H+1.6],[(X0+X1)/2,H+3.2],[(X0+X1)/2-3,H+1.6],[X0-1.6,H+1.2,1]],5,.03),{t:.5,s:22,paint:P=>{paintWood(P);P.fill(ell((X0+X1)/2,H+1.4,.9,.9,14,.04),'#d9a843',.9)}}),0,0,Z+3.1);
 put(scene,makeCard(outline(rect(X0-.6,0,X1+.6,3.6),1,.03),{t:.5,s:22,paint:P=>{paintWood(P);for(const x of[X0+3,X1-3])P.fill(ell(x,1.8,.45,.45,10,.04),'#d9a843',.95)}}),0,0,Z+3.15);
 /* sidevæg på skabet, så det bliver en kasse */
 {const m=makeCard(outline(rect(0,0,3.1,H),1,.03),{t:.4,s:18,paint:paintWood});m.rotation.y=-Math.PI/2;put(scene,m,X1+.55,0,Z)}
 /* lågen står åben ud mod os */
 const door=new THREE.Group();put(scene,door,X0-.4,0,Z+3.3);door.rotation.y=-1.95;
 put(door,makeCard(outline(rect(0,0,12,H),1,.03),{t:.5,s:18,both:true,paint:P=>{paintWood(P);P.coat('#4a2e1c',outline(rect(1.5,3,10.5,H-3),1,.03),{dir:1.57,bw:.4,alpha:.8});P.line([...outline(rect(1.5,3,10.5,H-3),1,0),[1.5,3]],'#2e1b0e',.1,.7);P.fill(ell(10.8,H/2,.4,.4,10,.04),'#d9a843',.95)}}),0,0,0);
 /* stangen og kjolerne */
 const rail=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,X1-X0,10),M.brass);rail.rotation.z=Math.PI/2;put(scene,rail,(X0+X1)/2,H-4,Z+1.6);
 const cols=[['#c2453a','#f2c230'],['#2f8f86','#e9e4d8'],['#d47ab0','#fff1c2'],['#3b6fd1','#f2c230']];
 cols.forEach(([c,c2],i)=>{const g=new THREE.Group();put(scene,g,X0+2.3+i*2.9,H-4,Z+1.2-i*.25);
   put(g,makeCard(outline([[-.1,0,1],[.1,0,1],[1.6,-1.4,1],[-1.6,-1.4,1]],1,.01),{t:.2,s:30,paint:P=>P.coat('#c9a04a',null,{bw:.2})}),0,0,0);
   put(g,makeCard(outline([[-1.1,-1.3],[1.1,-1.3],[1.6,-5],[3,-14],[0,-14.6],[-3,-14],[-1.6,-5]],5,.04),{t:.3,s:22,both:true,paint:P=>{P.coat(c,null,{dir:1.5,bw:.4});P.dabs(shade(c,-.25),40,{len:1.6,w:.08,dir:1.57,spread:.12,alpha:.5});P.coat(c2,outline(rect(-4,-14.8,4,-13.6),1,.03),{dir:0,bw:.3,gaps:.5})}}),0,0,.2);
   hangers.push({g,ph:R(TAU)})})}

/* ---- skammel med lys og bøger til højre ---- */
let candleLight,flame;
{const X=21,Z=-3;
 const paintStool=P=>{P.coat('#7b4a2c',null,{dir:0,bw:.4,vary:.12});P.dabs('#4d2c18',50,{len:1.4,w:.06,dir:0,spread:.1,alpha:.5})};
 put(scene,makeCard(outline([[-5.5,9,1],[5.5,9,1],[5.8,10.3],[0,10.6],[-5.8,10.3]],4,.03),{t:.5,s:22,paint:paintStool}),X,0,Z+2.2);
 for(const s of[-1,1]){const m=makeCard(outline([[-.7,0,1],[.7,0,1],[.5,9.2,1],[-.5,9.2,1]],1,.02),{t:.5,s:22,paint:paintStool});m.rotation.z=s*-.08;put(scene,m,X+s*4.2,0,Z+2)}
 {const s=makeCard(outline(rect(-5.6,-2.6,5.6,2.6),1,.03),{t:.5,s:20,paint:paintStool});s.rotation.x=-Math.PI/2;put(scene,s,X,10.3,Z)}
 /* bøger */
 const book=(w,h,d,col,y,rot)=>{const mats=[new THREE.MeshStandardMaterial({color:'#efe3c8',roughness:.9}),new THREE.MeshStandardMaterial({color:'#efe3c8',roughness:.9}),new THREE.MeshStandardMaterial({color:col,roughness:.7}),new THREE.MeshStandardMaterial({color:col,roughness:.7}),new THREE.MeshStandardMaterial({color:col,roughness:.7}),new THREE.MeshStandardMaterial({color:'#efe3c8',roughness:.9})];
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);m.castShadow=m.receiveShadow=true;m.rotation.y=rot;return put(scene,m,X+2,10.6+y+h/2,Z-.3)};
 book(5.4,1.1,3.8,'#5b2a55',0,.15);book(4.6,.9,3.2,'#2f6f5a',1.1,-.2);
 /* stearinlyset */
 const wax=new THREE.Mesh(new THREE.CylinderGeometry(.75,.8,4.2,16),new THREE.MeshStandardMaterial({color:'#f1e6cf',roughness:.55}));wax.castShadow=true;put(scene,wax,X-2.4,10.6+2.1,Z+.6);
 const fc=cv(64,128),fg=fc.getContext('2d'),gr=fg.createRadialGradient(32,84,2,32,74,46);gr.addColorStop(0,'rgba(255,250,220,1)');gr.addColorStop(.3,'rgba(255,190,80,.95)');gr.addColorStop(.6,'rgba(255,120,30,.35)');gr.addColorStop(1,'rgba(255,90,0,0)');
 fg.fillStyle=gr;fg.beginPath();fg.moveTo(32,6);fg.bezierCurveTo(52,50,58,90,32,120);fg.bezierCurveTo(6,90,12,50,32,6);fg.fill();
 flame=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.2),new THREE.MeshBasicMaterial({map:tx(fc,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));put(scene,flame,X-2.4,10.6+4.2+1,Z+.6);
 candleLight=new THREE.PointLight('#ffae55',40,35,2);put(scene,candleLight,X-2.4,10.6+6,Z+1.5)}

/* ---- vimpler i tråd under loftet ---- */
const flags=[];
{const n=13,y0=41.5;
 for(let i=0;i<n;i++){const t=i/(n-1),x=mix(-30,30,t),y=y0-4*Math.sin(t*Math.PI);const col=['#d9a843','#a8466a','#2f8f86','#7b4fcf'][i%4];
   const g=new THREE.Group();put(scene,g,x,y,-8);
   put(g,makeCard(outline([[-1.6,0,1],[1.6,0,1],[0,-3.6,1]],1,.02),{t:.25,s:28,both:true,paint:P=>{P.coat(col,null,{dir:1.2,bw:.3});const cp=[];for(let k=0;k<10;k++){const a=Math.PI/2+k/10*TAU,r=k%2?.25:.6;cp.push([Math.cos(a)*r,-1.3+Math.sin(a)*r])}P.fill(cp,'#f6e7c0',.85)}}),0,0,0);
   flags.push({g,ph:R(TAU)})}
 const pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push(new THREE.Vector3(mix(-31,31,t),y0-4*Math.sin(t*Math.PI),-8))}
 const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.04,4),M.thread);scene.add(tube)}
