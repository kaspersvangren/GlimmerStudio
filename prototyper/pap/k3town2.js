/* ============ resten af byen i samme håndværk ============ */
/* en mur med huller: formen skæres præcist, og forsiden males på akvarelpapir */
function wall(parent,outer,holes,z,paint,{t=.4,s=20,cap=1400}={}){for(const sh of clip([toCCW(outer)],holes||[],'diff'))put(parent,piece(sh,{t,s,cap,paint:P=>paint(P,outer)}),0,0,z)}
/* en dør bag et hul: planker, beslag og håndtag */
function doorIn(parent,shape,z,color,{planks=.8,iron=true,knob=true,hole=null,holeGlow='#7fd6ff'}={}){
  const g=grow(shape,.25,false)[0].outer;let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;for(const[x,y]of shape){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}
  put(parent,piece(hole?{outer:g,holes:[hole]}:g,{t:.22,s:34,base:'card',paint:P=>{P.flat(color);for(let x=minx-.3;x<maxx+.3;x+=planks){P.flat(shade(hexOf(color),R(-.08,.06)),box(x,miny-1,x+planks,maxy+1),.55);P.score([[x,miny-1],[x,maxy+1]],{w:.07,ink:.35})}}}),0,0,z-.32);
  if(hole)put(parent,piece(grow(hole,.3)[0].outer,{t:.03,mat:paperMat('#e8f8ff','tissue',{glow:holeGlow,gi:1.1})}),0,0,z-.5);
  if(iron)for(const y of[mix(miny,maxy,.22),mix(miny,maxy,.62)])pieces(clip([box(minx-1,y,maxx+1,y+.38)],[shape],'inter'),{color:PAL.iron,t:.08},parent,0,0,z-.17);
  if(knob)put(parent,piece(circ(maxx-(maxx-minx)*.22,mix(miny,maxy,.42),.22,.22,16),{mat:gold(),t:.16}),0,0,z-.12)}
/* en flad væg på tværs (sidevæg): s=1 vender mod højre (+x), s=-1 mod venstre */
function sideGroup(parent,x,z,s){const g=new THREE.Group();g.rotation.y=s*Math.PI/2;put(parent,g,x,0,z);return g}
const flower=(x,y,r,col)=>{const ps=[];for(let k=0;k<5;k++){const a=k/5*TAU;ps.push(circ(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,r*.48,r*.48,12))}return clip(ps,[],'union')};
function flowerBox(parent,x,y,w,z){put(parent,piece(box(x-w/2,y-.9,x+w/2,y),{color:'#7a4e2e',kind:'balsa',t:.5}),0,0,z+.3);
  const leaves=[];for(let k=0;k<8;k++)leaves.push(leafPts(x-w/2+.3+k*(w-.6)/7,y+.25,.9,.45,R(-.6,.6)));pieces(clip(leaves,[],'union'),{color:PAL.leaf,t:.06},parent,0,0,z+.18);
  for(let k=0;k<5;k++){const fx=x-w/2+.5+k*(w-1)/4;pieces(flower(fx,y+.55+R(-.1,.15),.42,0),{color:['#e86a9a','#f2c230','#f4f0ff'][k%3],t:.06},parent,0,0,z+.24);put(parent,piece(circ(fx,y+.55,.13,.13,10),{color:'#f6d36a',t:.05}),0,0,z+.3)}}

/* ---- Kollegiet ---- */
BUILD.push(()=>{const X=-46,Z=-8,T=.4,H=house('kollegie',[-46,-7.6],[-46,-5.2]);const g=new THREE.Group();put(H,g,X,0,0);
  const W=box(-11,0,11,23),door=arch(0,0,4,7.6,16),wins=[[-6.5,14],[0,14],[6.5,14],[-6.5,5],[6.5,5]].map(([x,y])=>box(x-1.7,y,x+1.7,y+4.2));
  wall(g,W,[door,...wins],Z,(P,o)=>{boards(P,o,'#a796d2',{h:.95});P.wash('#5f4d86',box(-12,-1,12,1.6),{alpha:.35,edge:0})});
  wins.forEach((w,i)=>{const x=(w[0][0]+w[1][0])/2,y=w[0][1];windowParts(g,w,Z,{t:T,frame:'#f1eaf8',mull:'#f1eaf8',sill:'#f1eaf8',curtain:i===1?'#e05a8a':i===0||i===2?'#8fb3e8':null});
    for(const s of[-1,1]){const sx=x+s*2.75;put(g,piece(box(sx-.75,y,sx+.75,y+4.2),{color:'#3b5a8f',t:.12}),0,0,Z+T/2+.12);for(let k=0;k<6;k++)put(g,piece(box(sx-.6,y+.35+k*.62,sx+.6,y+.6+k*.62),{color:'#2f4a78',t:.06}),0,0,Z+T/2+.2)}
    if(y<10)flowerBox(g,x,y-.35,3.6,Z+T/2+.3)});
  doorIn(g,door,Z,'#5a2a9a',{planks:.95});
  for(const s of[-1,1])put(g,piece(box(s*11-.4,0,s*11+.4,23),{color:'#f1eaf8',kind:'water',t:.2}),0,0,Z+T/2+.1);
  put(g,piece(box(-11.6,22.4,11.6,23.4),{color:'#f1eaf8',kind:'water',t:.25}),0,0,Z+T/2+.12);
  /* lille halvtag over døren på to konsoller, og to trin */
  const zc=shingleRoof(g,[[-3.3,8.2],[3.3,8.2],[0,9.8]],{color:'#3d5a96',rowH:.55,tile:.7,z:Z+T/2+.5,dz:.08,t:.1});
  pieces(thick([[[-3.4,8.1],[0,9.9],[3.4,8.1]]],.18),{color:'#f1eaf8',t:.12},g,0,0,zc+.1);
  for(const s of[-1,1])put(g,piece([[s*2.6,8.2],[s*3.1,8.2],[s*2.6,6.6]],{color:'#f1eaf8',t:.5}),0,0,Z+T/2+.3);
  for(let i=0;i<2;i++)flatPiece(box(-2.8+i*.4,-.9,2.8-i*.4,.9),{color:'#8f86a8',kind:'water',t:.4},X,.5+i*.4,Z+1.2-i*.5,H);
  plate(g,'Kollegiet','Kollegiet',FONT.kollegie,7.6,1.9,{bg:'#2f2156',frame:'gold',size:1.25,ls:.05,y:10.5,z:Z+T/2+.4});
  /* sidevæggen mod højre */
  {const sg=sideGroup(g,11,Z,1),sw=box(0,0,9,23),w1=box(2.9,14,6.1,18),w2=box(2.9,5,6.1,9);wall(sg,sw,[w1,w2],0,(P,o)=>{boards(P,o,'#8b7bba',{h:.95});P.wash('#4a3d70',o,{alpha:.25,edge:0})});windowParts(sg,w1,0,{t:T,frame:'#e3dcef',mull:'#e3dcef',sill:'#e3dcef'});windowParts(sg,w2,0,{t:T,lit:false,frame:'#e3dcef',mull:'#e3dcef',sill:'#e3dcef'})}
  /* taget med kvist og skorsten */
  const zr=shingleRoof(g,[[-13,22.6],[13,22.6],[0,35.6]],{color:'#3d5a96',rowH:1.05,tile:1.35,z:Z-.45});
  pieces(thick([[[-13.2,22.5],[0,35.8],[13.2,22.5]]],.3),{color:'#f1eaf8',t:.16},g,0,0,zr+.12);
  {const dz=zr+.3,dw=box(-2.3,24.6,2.3,28.6),dwin=arch(0,25.2,2.4,2.9,12);wall(g,dw,[dwin],dz,(P,o)=>boards(P,o,'#a796d2',{h:.7}),{t:.3});windowParts(g,dwin,dz,{t:.3,frame:'#f1eaf8',mull:'#f1eaf8',sill:false,cross:true});
    const zz=shingleRoof(g,[[-3.1,28.3],[3.1,28.3],[0,31]],{color:'#34508f',rowH:.6,tile:.8,z:dz+.3,dz:.07,t:.1});pieces(thick([[[-3.2,28.2],[0,31.1],[3.2,28.2]]],.16),{color:'#f1eaf8',t:.1},g,0,0,zz+.1)}
  put(g,piece(box(4,26,7,38),{t:.4,s:30,paint:(P)=>brickwork(P,box(4,26,7,38),'#8a4030',{bw:1.1,bh:.5})}),0,0,Z-1.1);
  put(g,piece(box(3.6,37.5,7.4,38.5),{color:'#4a2a22',t:.6}),0,0,Z-1.1);
  chimneyAt=new THREE.Vector3(X+5.5,39,Z-1.2);
  /* vimpler langs tagskægget, hængt fra hjørne til hjørne */
  {const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push([X-11.3+22.6*t,21.6-1.6*Math.sin(t*Math.PI),Z+T/2+.75])}cord(scene,pts,.045);
    for(let i=1;i<16;i++){const[x,y,z]=pts[i];put(scene,piece([[-.62,0],[.62,0],[0,-1.4]],{color:['#7a4fb0','#e05a8a','#2f8f86','#f2c230'][i%4],t:.05}),x,y+.04,z)}}});

/* ---- Boblebutikken ---- */
BUILD.push(()=>{const X=32,Z=3,T=.4,H=house('bobler',[37,3.3],[37,6.4]);const g=new THREE.Group();put(H,g,X,0,0);
  const W=box(-12,0,12,17),shop=box(-10,1.6,-.8,10),door=arch(5,0,4.6,8.6,16);
  wall(g,W,[shop,door],Z,(P,o)=>{boards(P,o,'#2f8f86',{dir:'v',h:1.15});P.wash('#174f4b',box(-13,-1,13,1.5),{alpha:.55,edge:0})});
  windowParts(g,shop,Z,{t:T,glow:'#ffe6b8',frame:'#174f4b',fw:.45,cross:false,sill:'#e9dcc0'});
  /* hylder med bobleglas i vinduet */
  for(const y of[4.9,7.4])put(g,piece(box(-9.9,y-.18,-.9,y),{color:'#6b4428',kind:'balsa',t:.1}),0,0,Z-T/2-.04);
  for(const[x,y,c]of[[-8.6,2.9,'#f39ac0'],[-6.5,2.9,'#7fd6ff'],[-4.4,2.9,'#f2c230'],[-2.3,2.9,'#b47aff'],[-7.6,5.75,'#7be0a0'],[-5.4,5.75,'#ff8f6a'],[-3.3,5.75,'#f39ac0'],[-8.6,8.25,'#7fd6ff'],[-6.5,8.25,'#b47aff'],[-4.4,8.25,'#f2c230'],[-2.3,8.25,'#7be0a0']]){
    put(g,piece(circ(x,y,.82,.82,24),{t:.05,mat:paperMat(c,'tissue',{glow:c,gi:.45})}),0,0,Z-T/2-.05);put(g,piece(circ(x-.28,y+.3,.2,.2,10),{color:'#ffffff',t:.04}),0,0,Z-T/2-.02)}
  doorIn(g,door,Z,'#f2e4c4',{planks:1.15,iron:false,hole:circ(5,5.6,1.05,1.05,24)});pieces(ring(circ(5,5.6,1.05,1.05,24),.22),{mat:gold(),t:.08},g,0,0,Z-T/2+.12);
  pieces(ring(door,.4,false),{color:'#174f4b',t:.16},g,0,0,Z+T/2+.08);
  /* gesims og tandsnit */
  put(g,piece(box(-12.6,16.4,12.6,17.4),{color:'#174f4b',kind:'water',t:.4}),0,0,Z+T/2+.2);for(let x=-12;x<=12;x+=1)put(g,piece(box(x-.3,15.7,x+.3,16.4),{color:'#e9dcc0',kind:'water',t:.25}),0,0,Z+T/2+.15);
  /* markise af stribet papir med bølgekant, på to jernstænger */
  {const aw=new THREE.Group();aw.rotation.x=-.62;put(g,aw,0,12.3,Z+T/2+.1);for(let x=-12.4,i=0;x<12.4;x+=2.07,i++)put(aw,piece(box(x,-4.2,x+2.07,0),{color:i%2?'#f6ead0':'#e05a8a',t:.08}),0,0,.05);
    const v=[[12.5,-4.1],[-12.5,-4.1]];for(let x=-12.5;x<=12.5+1e-6;x+=1.035){for(let k=0;k<=5;k++){const a=Math.PI+k/5*Math.PI;v.push([x+.5175+Math.cos(a)*.5175,-4.1-.55-Math.sin(a)*-.55])}}
    put(aw,piece(clip([toCCW(v)],[box(-12.5,-5,12.5,-4.05)],'inter')[0]||box(-12.5,-4.7,12.5,-4.1),{color:'#e05a8a',t:.08}),0,0,.14);
    for(const s of[-1,1])cord(g,[[s*11.5,12.1,Z+T/2+.1],[s*11.5,9.4,Z+2.8]],.08,PAL.iron)}
  plate(g,'Boblebutikken','Boblebutikken',FONT.bobler,16,2.8,{bg:'#174f4b',fg:'#fff3d6',frame:'#7fd6ff',size:1.85,ls:.05,y:12.8,z:Z+T/2+.5,extra:P=>{for(const[x,y,r]of[[-7.2,2.1,.42],[-6.6,.9,.26],[7,2,.4],[6.5,.85,.24]])P.pen(circ(x,y,r,r,16),'#9fe3ff',.07,.9,true)}});
  /* sidevæggen mod venstre */
  {const sg=sideGroup(g,-12,Z,-1),sw=box(-8,0,0,17),w1=arch(-4,6.5,3,4.4,14);wall(sg,sw,[w1],0,(P,o)=>{boards(P,o,'#257369',{dir:'v',h:1.15});P.wash('#123f3b',o,{alpha:.25,edge:0})});windowParts(sg,w1,0,{t:T,frame:'#174f4b',sill:'#e9dcc0',glow:'#ffe6b8'})}
  /* boblekuglen på taget */
  {const ped=new THREE.Mesh(new THREE.CylinderGeometry(2,2.4,3,24),paperMat('#174f4b','water'));ped.castShadow=true;put(g,ped,0,18.9,Z-.4);put(g,new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.5,24),gold()),0,20.4,Z-.4);
   const glass=new THREE.Mesh(new THREE.SphereGeometry(4.6,32,20),new THREE.MeshStandardMaterial({color:'#dff6ff',transparent:true,opacity:.28,roughness:.05,metalness:.1}));put(g,glass,0,24.6,Z-.4);
   for(const[x,y,z,c]of[[-1.5,-1.8,0,'#f39ac0'],[1.3,-2,.7,'#7fd6ff'],[0,-.4,-.6,'#f2c230'],[-.6,-2.6,1.1,'#b47aff'],[1.7,-.6,-.4,'#7be0a0'],[-1.9,-.3,.6,'#ff8f6a']]){const b=new THREE.Mesh(new THREE.SphereGeometry(1.15,18,12),paperMat(c,'card'));b.castShadow=true;put(g,b,x,24.6+y,Z-.4+z)}}
  lamp(X-5,Z+6,'#ffc070',60,20,8)});

/* ---- Dyreparken: lade, fold med låge, dam ---- */
BUILD.push(()=>{const X=64,Z=-22,T=.4,H=house('dyr',[58,-12.8],[58,-10.2]);const g=new THREE.Group();put(H,g,X,0,0);
  const W=[[-9,0],[9,0],[9,10],[0,16],[-9,10]],door=box(-3.6,0,3.6,7.4),loft=circ(0,11.3,1.35,1.35,32);
  wall(g,W,[door,loft],Z,(P,o)=>{boards(P,o,'#a8382e',{dir:'v',h:1.05});P.wash('#5a1a14',box(-10,-1,10,1.4),{alpha:.4,edge:0})});
  put(g,piece(grow(loft,.4)[0].outer,{t:.03,mat:paperMat('#fff0c8','tissue',{glow:'#ffcf7a',gi:1.5})}),0,0,Z-T/2-.08);pieces(ring(loft,.35),{color:'#f3ead2',t:.14},g,0,0,Z+T/2+.07);
  doorIn(g,door,Z,'#8a2a22',{planks:1.2,iron:false,knob:false});
  for(const d of[[[-3.4,.3],[3.4,7.1]],[[3.4,.3],[-3.4,7.1]]])pieces(thick([d],.32),{color:'#f3ead2',t:.1},g,0,0,Z-T/2-.02);
  pieces(ring(door,.42,false),{color:'#f3ead2',t:.14},g,0,0,Z+T/2+.07);
  for(const s of[-1,1])put(g,piece(box(s*9-.4,0,s*9+.4,10),{color:'#f3ead2',t:.14}),0,0,Z+T/2+.08);
  pieces(thick([[[-10.6,9.5],[0,16.9],[10.6,9.5]]],.75),{color:'#5a2a2a',kind:'water',t:.3},g,0,0,Z+T/2+.2);
  pieces(thick([[[-10.6,9.5],[0,16.9],[10.6,9.5]]],.22),{color:'#f3ead2',t:.1},g,0,0,Z+T/2+.38);
  /* hegnet: stolper og to lægter, med en åbning ved lågen */
  const fz=-13,rail=(x0,x1,parent,z)=>{for(const y of[1.5,3.1])put(parent,piece(box(x0,y-.28,x1,y+.28),{color:'#9a7a58',kind:'balsa',t:.2}),0,0,z)};
  for(let x=50;x<=78;x+=2.8){if(x>55.4&&x<60.6)continue;stick(scene,x,.3,4,fz,.45,'#8a6a4a')}
  rail(49.8,55.6,scene,fz+.3);rail(60.4,78.2,scene,fz+.3);
  for(const sx of[50,78]){const sg=new THREE.Group();sg.rotation.y=sx<60?Math.PI/2:-Math.PI/2;put(scene,sg,sx,0,fz);for(let k=1;k<=3;k++)stick(sg,sx<60?k*2.8:-k*2.8,.3,4,0,.45,'#8a6a4a');if(sx<60)rail(0,8.6,sg,.3);else rail(-8.6,0,sg,.3)}
  /* låge med bue og skilt */
  for(const x of[55.6,60.4])stick(scene,x,.3,9.6,fz,.6,PAL.woodDk);
  put(scene,piece(box(55,9.4,61,9.9),{color:PAL.woodDk,kind:'balsa',t:.5}),0,0,fz);
  plate(scene,'Dyreparken','Dyreparken',FONT.dyr,8.6,1.9,{bg:'#6b4a2a',fg:'#f6e7c0',frame:'#3b2213',size:1.2,ls:.03,x:58,y:9.95,z:fz+.15});
  for(const x of[56.4,59.6])cord(scene,[[x,9.4,fz+.3],[x,8.2,fz+.3]],.04);
  plate(scene,'Dyreparken:snart','Kommer snart',FONT.snart,4.6,1.1,{bg:'#f2e6c8',fg:'#3b2a1f',size:.7,x:58,y:7.1,z:fz+.3});
  plate(scene,'Fodr ikke','Fodr ikke drageungen',FONT.snart,7.4,1.3,{bg:'#f2e6c8',fg:'#3b2a1f',size:.68,x:71,y:3.4,z:fz+.55});
  /* høstak og trug */
  {const hs=new THREE.Group();put(scene,hs,76,0,-18);prop('høstak',76,-18,3);['#c9962e','#e3b84a','#f0cd6a'].forEach((c,i)=>{const k=1-i*.14;put(hs,piece(puff(0,1.6*k,3*k,1.9*k,8,.12),{color:c,t:.12}),0,0,i*.25)})}
  put(scene,piece(box(-2,0,2,1.2),{color:'#7a4e2e',kind:'balsa',t:1.2}),53.5,0,-17.5);prop('trug',53.5,-17.5,2);
  lamp(X,Z+8,'#ffcf7a',40,20,9)});

/* ---- Dragehulen ---- */
BUILD.push(()=>{const X=-72,Z=-31,H=house('drage',[-72,-27],[-65.5,-22.4]);const g=new THREE.Group();put(H,g,X,0,0);
  const M_=outline([[-20,0,1],[20,0,1],[18,9],[13,17],[6,22.5],[-3,23.5],[-12,20.5],[-18,12.5]],8,0),mouth=outline([[-8.6,0,1],[8.6,0,1],[8.2,7.6],[5,12],[0,13.6],[-5,12],[-8.2,7.6]],8,0);
  wall(g,M_,[mouth],Z,(P,o)=>{P.wash('#6e6680',o,{top:'#8a829a',clouds:12,edge:.5});for(let i=0;i<16;i++){const y=R(1,22),x0=R(-20,10),pts=[];for(let k=0;k<6;k++)pts.push([x0+k*R(1.5,2.6),y+R(-.6,.6)]);P.score(pts,{w:.09,ink:.3})}
    P.wash('#4f7a40',puff(0,23,16,4,10,.3),{alpha:.7,edge:.3});P.wash('#2a2236',box(-21,-1,21,2),{alpha:.35,edge:0})},{t:.6,s:16});
  put(g,piece(grow(mouth,.4)[0].outer,{color:'#120d18',t:.1}),0,0,Z-.7);
  put(g,piece(puff(0,2.2,7,2.6,8,.2),{t:.03,mat:paperMat('#ffd9a0','tissue',{glow:'#ff8a2a',gi:.9})}),0,0,Z-.55);
  for(let i=0;i<9;i++)put(g,piece(puff(R(-6.5,6.5),R(.4,1.4),R(.9,1.6),R(.5,.9),6,.2),{mat:gold(),t:.18}),0,0,Z-.35+i*.02);
  /* stenblokke lagt foran omkring indgangen */
  for(const[x,y,rx,ry,c]of[[-11.5,2.2,3.4,2.4,'#7d7590'],[11.8,2.4,3.6,2.6,'#857d98'],[-15.5,6.5,3,2.6,'#6a6280'],[15.2,7,3,2.8,'#756d8a'],[-7.5,13.8,3.4,2.2,'#8a829e'],[7.8,13.2,3.2,2.3,'#7d7590']])
    put(g,piece(puff(x,y,rx,ry,7,.14),{color:c,kind:'water',t:.45}),0,0,Z+.55+R(.1,.4));
  pieces(thick([curve([[-17,13.6],[-12,21.2],[-3,24.2],[6,23.1],[13,17.6]],6)],.75),{color:'#4f7a40',t:.2},g,0,0,Z+.5);
  plate(scene,'Dragehulen','Dragehulen',FONT.drage,7.6,1.9,{bg:'#3a2a1a',fg:'#f2d9a0',frame:'#8a6a3a',size:1.45,x:-69.5,y:3.2,z:-17.2});
  stick(scene,-69.5,.3,3.2,-17.5,.4,PAL.woodDk);prop('skilt',-69.5,-17.5,.6);
  lamp(X,Z+4,'#ff9a3a',90,26,5)});

/* ---- Koncertsalen ---- */
BUILD.push(()=>{const X=-62,Z=27,T=.4,H=house('koncert',[-62,27.3],[-62,30.6]);const g=new THREE.Group();put(H,g,X,0,0);
  const W=[[-12,0],[12,0],[12,11],[0,16],[-12,11]],door=arch(0,0,10,8.6,24);
  wall(g,W,[door],Z,(P,o)=>{brickwork(P,o,'#8e2f2c');P.wash('#3a0d0d',box(-13,-1,13,1.4),{alpha:.4,edge:0})});
  put(g,piece(box(-5.6,0,5.6,9),{color:'#1a0c10',t:.1}),0,0,Z-.9);
  put(g,piece(puff(0,.4,4.6,1.6,8,.15),{t:.03,mat:paperMat('#ffe3b0','tissue',{glow:'#ffb04a',gi:.9})}),0,0,Z-.8);
  for(const s of[-1,1]){put(g,piece([[s*5.3,0],[s*1.6,0],[s*2.7,3.2],[s*2.1,6.4],[s*3,8.2],[s*5.3,8.2]],{color:'#b01a2a',t:.08}),0,0,Z-.45);
    for(let k=1;k<4;k++)put(g,piece(box(s*(5.2-k*.9)-.08,.2,s*(5.2-k*.9)+.08,8),{color:'#7a0e1a',t:.04}),0,0,Z-.38);cord(g,[[s*3.6,4.5,Z-.3],[s*5,4.9,Z-.3]],.09,'#e0b964')}
  {const v=[[5.3,8.7],[-5.3,8.7]];for(let x=-5.3;x<=5.3+1e-6;x+=1.06)for(let k=0;k<=5;k++){const a=Math.PI+k/5*Math.PI;v.push([x+.53+Math.cos(a)*.53,7.9+Math.sin(a)*.5])}put(g,piece(clip([toCCW(v)],[door],'inter')[0]||box(-5,7.8,5,8.6),{color:'#b01a2a',t:.06}),0,0,Z-.3)}
  pieces(ring(door,.55,false),{color:'#f2e6c8',kind:'water',t:.2},g,0,0,Z+T/2+.1);
  for(const x of[-11,-8.2,8.2,11]){put(g,piece(box(x-.9,0,x+.9,10.4),{t:.26,s:30,paint:P=>{P.wash('#f2e6c8',null,{edge:0,grain:.2});for(const dx of[-.45,0,.45])P.score([[x+dx,.8],[x+dx,9.6]],{w:.07,ink:.2})}}),0,0,Z+T/2+.15);
    put(g,piece(box(x-1.15,10.2,x+1.15,10.9),{color:'#f2e6c8',kind:'water',t:.34}),0,0,Z+T/2+.2);put(g,piece(box(x-1.15,0,x+1.15,.7),{color:'#e2d4b0',kind:'water',t:.34}),0,0,Z+T/2+.2)}
  put(g,piece(box(-12.4,10.8,12.4,11.6),{color:'#f2e6c8',kind:'water',t:.3}),0,0,Z+T/2+.24);
  pieces(thick([[[-12.4,11.4],[0,16.4],[12.4,11.4]]],.4),{color:'#f2e6c8',kind:'water',t:.26},g,0,0,Z+T/2+.2);
  /* skiltet med pærer */
  plate(g,'Koncertsal','KONCERTSAL',FONT.koncert,13.6,2.3,{bg:'#1d1214',fg:'#ffd27a',frame:'gold',size:1.6,ls:.16,y:11.75,z:Z+T/2+.6});
  for(let x=-6.6;x<=6.61;x+=1.32)for(const y of[11.45,14.35])put(g,piece(circ(x,y,.17,.17,10),{t:.05,mat:paperMat('#fff6d8','tissue',{glow:'#ffd27a',gi:2})}),0,0,Z+T/2+.85);
  /* plakat på staffeli */
  {const eg=new THREE.Group();put(scene,eg,-78,0,30.5);prop('staffeli',-78,30.5,1.6);for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(.25,6.4,.25),paperMat(PAL.woodDk,'balsa'));l.rotation.z=s*.12;put(eg,l,s*1.4,3,0)}
   plate(eg,'Plakat','',FONT.snart,3.6,4.4,{bg:'#f2e6c8',y:2.2,z:.2,extra:P=>{P.text('I AFTEN',0,3.7,.62,'#3b2a1f',{font:FONT.koncert,ls:.05});P.pen([[-1.4,3.2],[1.4,3.2]],'#3b2a1f',.04,.6);P.text('De Falske',0,2.5,.6,'#7a1a2a',{font:FONT.snart});P.text('Toner',0,1.7,.6,'#7a1a2a',{font:FONT.snart});P.fill(circ(-.5,.8,.2,.15,10),'#2a2a6a',.9);P.pen([[-.32,.8],[-.32,1.3],[.4,1.45],[.4,.95]],'#2a2a6a',.06,.9);P.fill(circ(.22,.95,.2,.15,10),'#2a2a6a',.9)}})}
  /* caféborde med duge, kopper og stole */
  for(const[x,z]of[[-67.6,34.6],[-73.4,35]]){prop('cafébord',x,z,2.2);const tg=new THREE.Group();put(scene,tg,x,0,z);
    stick(tg,0,.3,3.2,0,.3,PAL.iron);put(tg,piece(box(-1,.3,1,.5),{color:PAL.iron,t:1.4}),0,0,0);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,.2,28),paperMat('#f2e6c8','card'));top.castShadow=top.receiveShadow=true;put(tg,top,0,3.3,0);
    const cloth=new THREE.Mesh(new THREE.CylinderGeometry(1.95,2.15,.7,28,1,true),paperMat('#c8344a','card'));cloth.material=cloth.material.clone();cloth.material.side=THREE.DoubleSide;put(tg,cloth,0,3.05,0);
    for(const[cx,cz,c]of[[.6,.4,'#f6ead0'],[-.7,-.2,'#7fd6ff']]){const cup=new THREE.Mesh(new THREE.CylinderGeometry(.32,.26,.5,14),paperMat(c,'card'));cup.castShadow=true;put(tg,cup,cx,3.65,cz)}
    for(const s of[-1,1]){const ch=new THREE.Group();put(tg,ch,s*2.7,0,0);stick(ch,0,.3,4.4,-.2,.2,PAL.woodDk);put(ch,piece(box(-.8,2.2,.8,2.45),{color:'#8a5a3a',kind:'balsa',t:1.4}),0,0,0);put(ch,piece(box(-.8,3.2,.8,4.4),{color:'#8a5a3a',kind:'balsa',t:.12}),0,0,-.55);stick(ch,-.6,.3,2.2,.5,.16,PAL.woodDk);stick(ch,.6,.3,2.2,.5,.16,PAL.woodDk)}}
  lamp(X,Z+5,'#ffb35c',70,20,6)});

/* ---- Den Flyvende Støvle ---- */
BUILD.push(()=>{const X=-26,Z=28,T=.4,H=house('stoevle',[-21.4,28.3],[-21.4,31.2]);const g=new THREE.Group();put(H,g,X,0,0);
  const boot=outline([[-11,0,1],[9,0,1],[10.2,1.4],[9.2,3.4],[3,4.2],[1.6,6],[1.4,15],[2.2,16.4,1],[-6.6,16.4,1],[-6,14.6],[-6.4,6],[-9,4.2],[-11.4,2]],8,0);
  const win1=arch(-2.4,8.6,3.2,3.8,14),door=arch(4.6,1.4,2.8,4.6,14);
  wall(g,boot,[win1,door],Z,(P,o)=>{P.wash('#86522e',o,{top:'#9a6438',clouds:12,edge:.6});P.wash('#4a2a14',box(-12,-1,12,1.6),{alpha:.35,edge:0});
    const st=[];for(const p of grow(o,-.55)[0]?.outer||[])st.push(p);for(let i=0;i<st.length;i+=2)if(st[i+1])P.score([st[i],st[i+1]],{w:.06,ink:.45,dark:'#f2dcb0'})},{t:.5});
  put(g,piece(clip([boot],[box(-13,-1,13,1.3)],'inter')[0].outer,{color:'#3b2a1f',kind:'water',t:.7}),0,0,Z+.1);
  windowParts(g,win1,Z,{t:.5,frame:'#3b2a1f',mull:'#3b2a1f',sill:'#3b2a1f'});doorIn(g,door,Z,'#5a2a1a',{planks:.7,iron:false});
  for(let y=7,i=0;y<15;y+=1.6,i++){for(const x of[-5.4,.6])put(g,piece(circ(x,y,.3,.3,14),{mat:gold(),t:.08}),0,0,Z+.32);pieces(thick([[[-5.4,y],[.6,y+1.4]]],.13),{color:'#f2e6c8',t:.06},g,0,0,Z+.4)}
  for(const s of[-1,1]){const wg=new THREE.Group();wg.rotation.y=s*.5;put(g,wg,-6,8,Z+(s>0?.6:-.6));
    for(let k=0;k<4;k++){const l=7.4-k*1.4;put(wg,piece([[0,0],[-l*.4,l*.18+1.4-k*.2],[-l,l*.45+1.6-k*.35],[-l*.72,l*.3-k*.2],[-l*.45,l*.12-k*.1],[0,-.4]].map(([a,b])=>[a,b+k*.55]),{color:['#f6f2ff','#e6def8','#d6cbef','#c7b9e6'][k],t:.06,both:true}),0,0,k*.05*s)}}
  stick(g,-3,16.2,18.2,Z-.4,.9,'#3b2a1f');put(g,piece(box(-3.8,17.9,-2.2,18.5),{color:'#2a1d14',t:1.2}),0,0,Z-.4);
  plate(g,'Støvlen','Den Flyvende Støvle',FONT.stoevle,9.6,1.8,{bg:'#2a1d14',fg:'#f6e7c0',frame:'gold',size:1.05,x:-4.2,y:1.75,z:Z+.75});
  plate(g,'Støvlen:snart','Kommer snart',FONT.snart,2.7,.85,{bg:'#f2e6c8',fg:'#3b2a1f',size:.5,x:4.6,y:3.9,z:Z+.12,t:.06});put(g,new THREE.Mesh(DOME,M.brass),4.6,4.55,Z+.2).scale.setScalar(.14)});

/* ---- Klokketårnet ---- */
BUILD.push(()=>{const X=12,Z=31,T=.4;const g=new THREE.Group();put(scene,g,X,0,0);g.userData.house='klokketårn';HOUSEG.push(g);HOUSE['klokketårn']={g,door:[12,31.3],spot:null};
  const W=[[-2.6,0],[2.6,0],[2.2,14],[-2.2,14]],door=arch(0,0,1.9,3.6,12),w1=arch(0,5.6,1.5,2.4,12);
  wall(g,W,[door,w1],Z,(P,o)=>{P.wash('#958bb3',o,{top:'#b2aac9',edge:.4});P.ashlar(o,'#958bb3',{rowH:[.8,1.1],bw:[1.2,2.2],tint:.14,ink:.3})},{t:.4,s:30});
  doorIn(g,door,Z,'#6b4428',{planks:.6,iron:false});windowParts(g,w1,Z,{t:T,sill:'#b2aac9',cross:false});
  put(g,piece(circ(0,10.9,1.85,1.85,40),{color:PAL.plumDk,t:.18}),0,0,Z+.32);
  put(g,piece(circ(0,10.9,1.55,1.55,40),{t:.14,s:80,base:'water',paint:P=>{P.wash('#f3ead6',null,{edge:0,grain:.12});for(let k=0;k<12;k++){const a=k/12*TAU;P.pen([[Math.cos(a)*1.2,10.9+Math.sin(a)*1.2],[Math.cos(a)*1.42,10.9+Math.sin(a)*1.42]],'#3b2147',.06,.9)}}}),0,0,Z+.5);
  put(g,piece([[-.07,0],[.07,0],[0,1.15]],{mat:gold(),t:.05}),0,10.9,Z+.62);{const h=piece([[-.07,0],[.07,0],[0,.85]],{mat:gold(),t:.05});h.rotation.z=-1.9;put(g,h,0,10.9,Z+.66)}
  const zr=shingleRoof(g,[[-3.4,13.6],[3.4,13.6],[.4,20.2]],{color:'#5d3a78',rowH:.75,tile:.95,z:Z+.3,dz:.08});put(g,piece(box(-3.5,13.4,3.5,13.9),{mat:gold(),t:.14}),0,0,zr+.1);
  flagSpots.push([X+.4,20.2,Z+.4]);lamp(X,Z+3,'#ffb35c',50,16,8)});

/* ---- broen over åen og trolden ---- */
BUILD.push(()=>{const X=25.4,Z=34.9;const g=new THREE.Group();put(scene,g,X,0,Z);prop('bro',X,Z,0);
  for(const s of[-1,1]){const zz=s*2.55,outer=[[-6.8,0],[6.8,0],[6.8,1.7],[3,2.2],[-3,2.2],[-6.8,1.7]],holes=[arch(-3.6,0,2,1.3,10),arch(0,0,2.4,1.5,10),arch(3.6,0,2,1.3,10)];
    for(const sh of clip([toCCW(outer)],holes.map(h=>h.map(([x,y])=>[x,y-.01])),'diff'))put(g,piece(sh,{t:.45,s:34,paint:P=>{P.wash('#958bb3',outer,{top:'#b2aac9',edge:.4});P.ashlar(outer,'#958bb3',{rowH:[.55,.75],bw:[.9,1.6],tint:.14,ink:.3})}}),0,0,zz);
    put(g,piece(box(-7,2.1,7,2.55),{color:'#b2aac9',kind:'water',t:.6}),0,0,zz);for(let x=-6.4;x<=6.41;x+=1.6)stick(g,x,2.5,4,zz,.22,PAL.woodDk);put(g,piece(box(-6.7,3.75,6.7,4.1),{color:'#8a5a3a',kind:'balsa',t:.2}),0,0,zz)}});

/* ---- Arkaden ---- */
BUILD.push(()=>{const X=66,Z=28,T=.4,H=house('arkade',[66,28.3],[66,31.2]);const g=new THREE.Group();put(H,g,X,0,0);
  const W=[[-13,0],[13,0],[13,12],[10,14.6],[-10,14.6],[-13,12]],door=arch(0,0,4.4,8.4,16),rw=[circ(-7.4,5.2,2.4,2.4,40),circ(7.4,5.2,2.4,2.4,40)];
  wall(g,W,[door,...rw],Z,(P,o)=>{boards(P,o,'#3f2a6e',{dir:'v',h:1.2});for(let i=0;i<26;i++){const x=R(-12,12),y=R(1,13.5);P.fill(starPts(x,y,.32,.13,R(1)),'#e9c46a',.55)}P.wash('#1a1030',box(-14,-1,14,1.4),{alpha:.45,edge:0})});
  rw.forEach((w,i)=>{const c=i?'#7be0a0':'#ff8ac0';put(g,piece(grow(w,.3)[0].outer,{t:.03,mat:paperMat('#fff','tissue',{glow:c,gi:1.4})}),0,0,Z-T/2-.08);
    const cx=i?7.4:-7.4;put(g,piece([[cx-1.1,2.8],[cx+1.1,2.8],[cx+1.1,5.6],[cx+.9,6.4],[cx,6.8],[cx-.9,6.4],[cx-1.1,5.6]],{color:'#1a1030',t:.04}),0,0,Z-T/2-.04);put(g,piece(circ(cx,5.6,.6,.6,16),{t:.03,mat:paperMat('#fff','tissue',{glow:i?'#f2c230':'#7fd6ff',gi:1.2})}),0,0,Z-T/2-.02);
    pieces(ring(w,.5),{mat:gold(),t:.14},g,0,0,Z+T/2+.08);for(let k=0;k<12;k++){const a=k/12*TAU;put(g,piece(circ(cx+Math.cos(a)*2.65,5.2+Math.sin(a)*2.65,.12,.12,8),{color:'#7a5418',t:.06}),0,0,Z+T/2+.2)}});
  doorIn(g,door,Z,'#e0b54a',{planks:1.1,iron:false,hole:box(-.9,3.8,.9,6)});pieces(ring(door,.4,false),{color:'#24123e',t:.16},g,0,0,Z+T/2+.08);
  for(let x=-12;x<=12;x+=1.5)put(g,piece(circ(x,13.3,.22,.22,10),{t:.05,mat:paperMat('#fff6d8','tissue',{glow:'#fff1b8',gi:1.8})}),0,0,Z+T/2+.12);
  plate(g,'Arkaden','ARKADEN',FONT.arkade,14.4,3,{bg:'#24123e',fg:'#f2c230',frame:'#e05a8a',size:2.05,ls:.22,stroke:'#5a2a00',sw:.12,y:14.9,z:Z+.75});
  for(let x=-6.6;x<=6.61;x+=1.1)for(const y of[15.2,17.6])put(g,piece(circ(x,y,.14,.14,8),{t:.04,mat:paperMat('#fff6d8','tissue',{glow:'#fff1b8',gi:1.8})}),0,0,Z+.98);
  stick(g,0,17.9,21,Z+.2,.3,PAL.woodDk);put(g,piece(starPts(0,22,2,.85),{mat:gold(),t:.3}),0,0,Z+.3);
  lamp(X,Z+5,'#ff7ad0',60,20,8)});
