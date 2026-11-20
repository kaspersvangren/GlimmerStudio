/* ============ landskabet: jord, å, bakker, himmel, træer og småting — klippet papir i lag ============ */
const distSeg=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l,0,1);return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)};
const distLine=(p,L)=>{let d=1e9;for(let i=0;i<L.length-1;i++)d=Math.min(d,distSeg(p,L[i],L[i+1]));return d};
const PATHLINES=PATHS.map(cp=>curve(cp,8));
const nearPath=(x,z)=>Math.min(...PATHLINES.map(L=>distLine([x,z],L)));
const nearRiver=(x,z)=>Math.min(distLine([x,z],RIVER),Math.hypot((x-70)/9,(z+6)/5.5)*5.5-5.5);
/* et hus' grundflade: kun de dele der står nede ved jorden (ikke markiser, vinger og tage) */
let FOOT=null;const footprints=()=>{if(FOOT)return FOOT;scene.updateMatrixWorld(true);FOOT=[];for(const n in HOUSE){const b=new THREE.Box3(),mb=new THREE.Box3();HOUSE[n].g.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();mb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);if(mb.min.y<2.5)b.union(mb)});FOOT.push([n,b.min.x,b.max.x,b.min.z,b.max.z])}return FOOT};
const inHouse=(x,z,m=0)=>footprints().some(f=>x>f[1]-m&&x<f[2]+m&&z>f[3]-m&&z<f[4]+m);
/* foran skilte og døre holdes græsset lavt, så de kan ses */
let CLEAR=null;const clearZones=()=>{if(CLEAR)return CLEAR;CLEAR=[];scene.traverse(o=>{if(o.isMesh&&o.userData.sign){const b=new THREE.Box3().setFromObject(o);CLEAR.push([b.min.x-1,b.max.x+1,b.max.z,b.max.z+8])}});for(const n in HOUSE){const d=HOUSE[n].door;CLEAR.push([d[0]-4,d[0]+4,d[1],d[1]+7])}return CLEAR};
const freeSpot=(x,z,m=1)=>nearPath(x,z)>2.15+m&&nearRiver(x,z)>2.6+m&&!inHouse(x,z,m)&&Math.hypot(x/1.3,z)>12+m&&!clearZones().some(c=>x>c[0]&&x<c[1]&&z>c[2]&&z<c[3]);

/* ---- jorden ---- */
BUILD.push(()=>{flatPiece(box(GX0,-GZ1,GX1,-GZ0),{color:'#44703d',kind:'water',t:.6},0,0,0);
  for(const[x0,x1,z0,z1]of[[-240,-84,GZ0-6,110],[84,240,GZ0-6,110],[-86,86,36,110]])flatPiece(box(x0,-z1,x1,-z0),{color:'#3f6838',kind:'water',t:.5},0,-.06,0);
  /* enge af lidt andre grønne papirer */
  for(let i=0;i<46;i++){const x=R(-84,84),z=R(-40,36);flatPiece(puff(x,-z,R(4,11),R(2.5,6),9,.12),{color:['#4f7c44','#3d6638','#588a4b','#4a7540'][i%4],kind:'water',t:.03},0,.31+i*.0006,0)}
  /* åen og dammen: silkepapir der lyser svagt, på en mørkere bred */
  const riv=RIVER.filter(p=>p[1]<38.5).map(p=>[p[0],-p[1]]);
  for(const s of clip(thick([riv],2.6).map(s=>s.outer),[box(GX0,-38,GX1,42)],'inter'))flatPiece(s,{color:'#2c4766',kind:'water',t:.05},0,.34,0);
  flatPiece(circ(70,6,9.2,5.7,48),{color:'#2c4766',kind:'water',t:.05},0,.34,0);
  const wat=paperMat('#88b0ff','tissue',{glow:'#2f5fd0',gi:.5});
  for(const s of clip([...thick([riv],1.85).map(s=>s.outer),circ(70,6,8,4.8,48)],[box(GX0,-38,GX1,42)],'inter'))flatPiece(s,{t:.03,mat:wat},0,.38,0);
  for(const s of clip(thick([riv.map(([x,y])=>[x-.45,y])],.14).map(s=>s.outer),[box(GX0,-38,GX1,42)],'inter'))flatPiece(s,{t:.02,mat:paperMat('#e0ecff','tissue',{glow:'#9cc0ff',gi:.8})},0,.4,0);
  for(const[x,z,r]of[[66,-7,1],[73,-4.5,.8],[69,-3.5,.7],[74,-8,.9]]){const pad=clip([circ(x,-z,r,r*.8,20)],[[[x,-z],[x+r*1.4,-z+.25],[x+r*1.4,-z-.25]]],'diff')[0];flatPiece(pad,{color:'#5f9a4c',t:.03},0,.42,0)}
  for(let i=0;i<12;i++){const a=R(-.3,1.2)*Math.PI,x=70+Math.cos(a)*8.6,z=-6+Math.sin(a)*5.1*-1;const rg=new THREE.Group();put(scene,rg,x,0,z);for(let k=0;k<3;k++)put(rg,piece(leafPts(R(-.4,.4),2.2,4.2+R(1),.32,R(-.15,.15)),{color:k%2?'#4f7d40':'#6a8f45',t:.04}),0,0,k*.05);if(rnd()<.6)put(rg,piece(box(-.18,3.4,.18,4.6),{color:'#6b4428',t:.15}),R(-.3,.3),0,.2)}});

/* ---- himlen: akvarel i bånd, trykte stjerner, guldstjerner og en måne i tråd, skyer i lag ---- */
BUILD.push(()=>{const x0=-230,x1=230,Z=GZ0-7;
  put(scene,piece(box(x0,-10,x1,110),{t:.4,s:9,cap:2048,base:'water',paint:P=>{P.wash('#1a1440',null,{top:'#120e30',edge:0,clouds:16,grain:.2});
    const band=(y,a)=>{const cp=[[x1+2,-12],[x1+2,y]];for(let x=x1-6;x>x0;x-=9)cp.push([x,y+R(-a,a)]);cp.push([x0-2,y],[x0-2,-12]);return toCCW(cp)};
    const o={edge:.5,clouds:10,mode:'source-over',grain:.15};P.wash('#33265e',band(46,2.5),{...o,alpha:.8});P.wash('#5a3a7a',band(32,2),{...o,alpha:.78});P.wash('#8e567c',band(23,1.6),{...o,alpha:.72});P.wash('#c27a6a',band(16.5,1),{...o,alpha:.5});
    for(let i=0;i<520;i++){const x=R(x0,x1),y=R(36,108);if(rnd()<.7)P.fill(circ(x,y,R(.08,.18),R(.08,.18),6),'#f6e7c0',R(.5,.95));else P.fill(starPts(x,y,R(.35,.62),.15,R(1)),'#f6e7c0',R(.55,.95))}}}),0,0,Z);
  /* månen: akvarelpapir på en guldring, hængt i en tråd */
  {const mg=new THREE.Group();put(scene,mg,58,60,Z+.8);put(mg,piece(circ(0,0,7.4,7.4,64),{mat:gold(),t:.18}),0,0,0);
   put(mg,piece(circ(0,0,7,7,64),{t:.2,s:40,base:'water',paint:P=>{P.wash('#efe3c0',null,{top:'#f8efd6',edge:.5,clouds:8});for(const[x,y,r]of[[-2,1.6,1.3],[1.9,-1.4,.9],[.7,2.8,.6],[-.7,-3,.7],[3,1.6,.5],[-3.4,-1.2,.45]])P.wash('#cbb88e',circ(x,y,r,r,24),{alpha:.7,edge:.8,clouds:0})}}),0,0,.2);
   cord(mg,[[0,7.4,.05],[0,52,.05]],.05)}
  for(const[x,y,r]of[[-70,62,2.2],[-40,74,1.6],[-12,66,1.4],[22,80,1.8],[88,72,1.5],[-95,48,1.3],[110,54,1.9],[-130,70,1.7],[40,58,1.1]]){const sg=new THREE.Group();put(scene,sg,x,y,Z+1.4);put(sg,piece(starPts(0,0,r,r*.42),{mat:gold(),t:.15}),0,0,0);cord(sg,[[0,r,0],[0,110-y,0]],.035)}
  for(const[x,y,w]of[[-52,52,14],[30,64,11],[-110,60,12],[100,44,13]]){const cg=new THREE.Group();put(scene,cg,x,y,Z+1);
    const back=clip([puff(-w*.25,0,w*.35,w*.2,7,.25),puff(w*.15,w*.08,w*.32,w*.22,7,.25),puff(w*.45,-w*.02,w*.22,w*.15,6,.25)],[],'union'),front=clip([puff(-w*.1,-w*.06,w*.3,w*.14,7,.25),puff(w*.3,-w*.08,w*.2,w*.11,6,.25)],[],'union');
    pieces(back,{color:'#9a88c4',kind:'water',t:.12},cg,0,0,0);pieces(front,{color:'#c4b6e2',kind:'water',t:.12},cg,0,0,.25);cord(cg,[[0,w*.15,0],[0,110-y,0]],.035)}});

/* ---- bakkerne: tre rækker silhuetter med små træer langs kammen ---- */
BUILD.push(()=>{const hill=(z,base,amp,ph,col,trees)=>{const yT=x=>base+amp*Math.sin(x*.045+ph)+amp*.4*Math.sin(x*.12+ph*2);const cp=[[230,-2],[230,yT(230)]];
    for(let x=226;x>-228;x-=2.5){const y=yT(x);if(trees&&rnd()<.16){const h=R(2.2,4.2),w=h*.42;cp.push([x+w,y],[x+w*.55,y+h*.45],[x+w*.8,y+h*.42],[x,y+h],[x-w*.8,y+h*.42],[x-w*.55,y+h*.45],[x-w,y]);x-=w}else cp.push([x,y])}
    cp.push([-230,yT(-230)],[-230,-2]);put(scene,piece(toCCW(cp),{color:col,kind:'water',t:.35}),0,0,z)};
  hill(GZ0-5.6,25,4,1.4,'#3a4664',true);hill(GZ0-4,20,3,.5,'#2a4636',true);hill(GZ0-1.5,13,2.6,2.2,'#33573f',false)});

/* ---- træer: stamme og en krone af tre lag bulet papir; grantræer i takkede etager ---- */
const TREES=[],PINES=[];
function makeTree(cols){const g=new THREE.Group();
  put(g,piece(outline([[-.75,0,1],[.75,0,1],[.5,4.4],[1.5,6.9],[1.05,7.2],[.25,5.6],[0,7.8],[-.5,7.7],[-.35,5.2],[-1.2,6.6],[-1.55,6.3],[-.55,4.2]],5,0),{color:'#5e3d26',kind:'card',t:.3}),0,0,0);
  put(g,piece(puff(0,9.4,4.7,3.8,9,.24),{color:cols[0],t:.2}),0,0,-.35);
  put(g,piece(puff(-.5,9.8,3.9,3.2,8,.26),{color:cols[1],t:.2}),0,0,.05);
  pieces(clip([puff(1.3,8.8,2.6,2.1,7,.28),puff(-1.9,10.6,2.2,1.8,7,.28)],[],'union'),{color:cols[2],t:.2},g,0,0,.4);
  for(let i=0;i<7;i++){const a=R(TAU);put(g,piece(leafPts(Math.cos(a)*4.2,9.4+Math.sin(a)*3.3,1,.55,a+1.57),{color:cols[2],t:.06}),0,0,.5)}
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g}
function makePine(){const g=new THREE.Group();put(g,piece(box(-.4,0,.4,2),{color:'#4a3020',t:.3}),0,0,0);
  const tier=(y0,w,hh,col,dz)=>{const cp=[[w,y0],[0,y0+hh],[-w,y0]];for(let k=1;k<6;k++){const x=-w+k*w/3;cp.push([x-w/6,y0+.45],[x,y0+.05])}put(g,piece(toCCW(cp.slice(0,3).concat(cp.slice(3).filter(p=>p[0]<w))),{color:col,t:.2}),0,0,dz)};
  tier(1.2,4,6.5,'#24503f',.3);tier(4.6,3.2,5.4,'#2f6650',.6);tier(7.8,2.4,4.4,'#3b7a5f',.9);return g}
function protos(){if(TREES.length)return;for(const c of[['#a8481c','#c9682a','#e0963a'],['#8f3518','#bd5522','#de8630'],['#a8621c','#d8922a','#eebc42'],['#842828','#ad3e2a','#cc6c2a'],['#9c561e','#cf842a','#e4aa40']])TREES.push(makeTree(c));PINES.push(makePine(),makePine())}
const orangeTree=(x,z,h,k=1)=>{protos();const g=TREES[Math.floor(R(TREES.length))].clone();g.scale.set(k*(rnd()<.5?-1:1),h/8,k);put(scene,g,x,0,z);if(Math.abs(x)<90&&z<38)prop('træ',x,z,1.2*k)};
const pineTree=(x,z,h)=>{protos();const g=PINES[Math.floor(R(PINES.length))].clone();const k=h/10;g.scale.set(k*(rnd()<.5?-1:1),k,k);put(scene,g,x,0,z);if(Math.abs(x)<90&&z<38)prop('gran',x,z,.8*k)};
BUILD.push(()=>{for(let x=-170;x<=170;x+=7){if(x>-40&&x<-24)continue;if(Math.abs(x)<24)continue;orangeTree(x+R(-1.5,1.5),GZ0+3+R(0,3),R(6,9),R(.8,1.05))}
  for(let i=0;i<50;i++){const x=i%2?R(-170,-90):R(90,170),z=R(-30,80);if(rnd()<.3)pineTree(x,z,R(8,12));else orangeTree(x,z,R(7,10),R(.9,1.2))}
  for(const[x,z,h,k]of[[-80,-14,9,1.1],[-78,10,8,1],[-84,36,7,.9],[80,-16,9,1.1],[80,8,8,1],[-30,-18,8,.9],[27,-27,8,.9],[-40,20,6,.8],[56,-30,8,.9],[-82,-28,9,1],[82,30,7,.9],[-6,-30,7,.8],[19,17,6,.8]])orangeTree(x,z,h,k);
  for(const[x,z,h]of[[-84,0,10],[84,-4,10],[-62,8,8],[76,18,8],[-50,-30,9]])pineTree(x,z,h)});

/* ---- den svævende ø med hus og vandfald, hængt op i tråde ---- */
BUILD.push(()=>{const X=26,Y=46,Z=GZ0-4.6;const g=new THREE.Group();put(scene,g,X,Y,Z);
  put(g,piece(outline([[-8,0],[8,0],[6.5,-3],[3,-6],[0,-9],[-3,-6],[-6.5,-3]],6,0),{color:'#6e6078',kind:'water',t:.4}),0,0,0);
  for(const[x,y,rx,ry,c]of[[-4.5,-2,2.4,1.6,'#857796'],[2.6,-3.2,2.2,1.5,'#7a6c8c'],[-1,-6,1.8,1.4,'#8e80a0'],[5.2,-1.2,1.8,1.1,'#7a6c8c']])put(g,piece(puff(x,y,rx,ry,6,.15),{color:c,kind:'water',t:.25}),0,0,.3);
  pieces(thick([curve([[-8.2,.1],[-4,.4],[0,.2],[4,.5],[8.2,.1]],5)],.65),{color:'#4f8a3a',t:.2},g,0,0,.45);
  {const hw=box(1.4,0,5.4,3.4),hw1=box(2.6,1.2,3.6,2.4);wall(g,hw,[hw1],.5,(P,o)=>boards(P,o,'#f2e6c8',{h:.6}),{t:.25,s:40});windowParts(g,hw1,.5,{t:.25,fw:.18,sill:false,cross:true,frame:'#3b2a1f',mull:'#3b2a1f'});
   shingleRoof(g,[[1,3.2],[5.8,3.2],[3.4,5.6]],{color:'#a8382e',rowH:.55,tile:.7,z:.7,dz:.07,t:.1})}
  {const tr=TREES.length?TREES[0].clone():null;if(tr){tr.scale.set(.42,.42,.42);put(g,tr,-3.4,.2,.4)}}
  for(const s of[-1,1])cord(scene,[[X+s*6,Y,Z-.2],[X+s*6,Y+42,Z-.2]],.04);
  fallAt=new THREE.Vector3(X+5.5,Y-1,Z+.4)});

/* ---- lygtepæle, svampe og græskar ---- */
function mushroom(x,z,k,col){prop('svamp',x,z,1.2*k);const g=new THREE.Group();put(scene,g,x,0,z);g.scale.setScalar(k);
  put(g,piece(outline([[-.32,0,1],[.32,0,1],[.28,1.3],[.4,1.5,1],[-.4,1.5,1],[-.28,1.3]],4,0),{color:'#efe3c8',kind:'water',t:.3}),0,0,0);
  const cap=[[1.35,1.25]];for(let i=0;i<=16;i++){const a=i/16*Math.PI;cap.push([Math.cos(a)*1.35,1.25+Math.sin(a)*1.1])}cap.push([-1.35,1.25]);put(g,piece(toCCW(cap),{color:col,t:.25}),0,0,.08);
  for(const[dx,dy,r]of[[-.55,1.75,.2],[.45,1.6,.16],[0,2.1,.14],[.85,1.95,.12]])put(g,piece(circ(dx,dy,r,r,12),{color:'#fff9ee',t:.05}),0,0,.24)}
function pumpkin(x,z,k){prop('græskar',x,z,2*k);const g=new THREE.Group();put(scene,g,x,0,z);g.scale.setScalar(k);
  for(const[dx,rx,c,dz]of[[-1,1.25,'#c25a1e',0],[1,1.25,'#c25a1e',0],[0,1.25,'#e47a2a',.12]])put(g,piece(circ(dx*.8,1.35,rx,1.3,28),{color:c,t:.25}),0,0,dz);
  put(g,piece(box(-.18,2.5,.18,3.3),{color:'#4a6a2a',t:.2}),0,0,.2);put(g,piece(leafPts(.7,2.85,1,.5,-.9),{color:'#5f8a3a',t:.05}),0,0,.24)}
BUILD.push(()=>{for(const[x,z]of[[-12,-6],[12,-6],[-4,13],[10,12],[-30,6],[27,11],[-44,18],[44,16],[-6,30],[38,30]])newLamp(x,z);
  for(const[x,z,k]of[[-36,21,.9],[-33.5,23.5,.7],[31,21,.8],[46,-4,.8],[-56,10,.9],[-58,14,.7],[20,-14,.8],[-20,-14,.9],[0,31,.8],[70,10,.8]])mushroom(x,z,k,['#7fd6ff','#c9a0ff','#ff9ad0'][Math.floor(R(3))]);
  for(const[x,z,k]of[[-31,17,1],[-36,13,.7],[22,14,1],[-52,10,.9],[54,4,.8],[17,29.5,.7],[-6,34.5,.8],[50,29.5,.9],[-70,4,1]])pumpkin(x,z,k)});

/* ---- græstotter og blomster spredt, uden for stier, å og huse ---- */
BUILD.push(()=>{const TUFT=[],FLOW=[];
  for(let i=0;i<6;i++){const bl=[];const n=5+Math.floor(R(3));for(let k=0;k<n;k++){const x=R(-.8,.8),h=R(.9,1.8),a=R(-.35,.35);bl.push([[x-.13,0],[x+.13,0],[x+Math.sin(a)*h,Math.cos(a)*h]])}
    const m=piece(clip(bl,[],'union')[0]||bl[0],{color:['#5f8f4a','#4f7d40','#72a052'][i%3],t:.05});TUFT.push(m)}
  for(let i=0;i<4;i++){const fg=new THREE.Group();put(fg,piece(box(-.05,0,.05,1.3),{color:'#4f7d40',t:.05}),0,0,0);pieces(flower(0,1.45,.42,0),{color:['#e86a9a','#f2c230','#f4f0ff','#b89aff'][i],t:.05},fg,0,0,.03);put(fg,piece(circ(0,1.45,.13,.13,10),{color:'#f6d36a',t:.04}),0,0,.07);FLOW.push(fg)}
  let n=0;for(let i=0;i<900&&n<170;i++){const x=R(-84,84),z=R(-40,37);if(!freeSpot(x,z,.6))continue;const m=TUFT[n%TUFT.length].clone();m.scale.setScalar(R(.8,1.3));put(scene,m,x,.3,z);n++}
  n=0;for(let i=0;i<900&&n<70;i++){const x=R(-84,84),z=R(-40,37);if(!freeSpot(x,z,.6))continue;const m=FLOW[n%FLOW.length].clone();m.scale.setScalar(R(.8,1.15));put(scene,m,x,.3,z);n++}});
