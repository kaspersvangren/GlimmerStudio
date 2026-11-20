/* ============ pladsen, brønden og skolen: bygget som en dygtig modelbygger ville ============ */
const PAL={stone:'#958bb3',stoneDk:'#6f6690',stoneLt:'#b2aac9',plum:'#6a4290',plumDk:'#4e3172',berry:'#7d3a58',wood:'#86593a',woodDk:'#5c3c28',iron:'#2e2833',
  cobble:'#b0a6b8',curb:'#cdc4d4',sand:'#e3d0a8',sandEdge:'#b79a6c',leaf:'#4f7d45',leafLt:'#6e9a52',glow:'#ffcf7a'};
/* et vandret stykke (ligger på jorden): formens y bliver verdens -z */
function flatPiece(shape,o,x,y,z,parent=scene){const m=piece(shape,o);m.rotation.x=-Math.PI/2;m.userData.flat=true;return put(parent,m,x,y,z)}
const flipZ=pts=>pts.map(p=>[p[0],-p[1]]);

/* ---- stierne: ét sammenhængende stykke sandfarvet karton med runde kryds og sving ---- */
BUILD.push(()=>{const lines=PATHS.map(cp=>flipZ(curve(cp,8)));
  for(const s of thick(lines,2.15))flatPiece(s,{color:PAL.sand,kind:'sand',t:.26,edge:PAL.sandEdge},0,.36,0)});

/* ---- pladsen: brosten i ringe, ridset i kartonet, med en hævet kantsten ---- */
BUILD.push(()=>{const E=circ(0,0,15,10,72);
  flatPiece(E,{t:.3,s:22,cap:1280,paint:P=>{P.wash(PAL.cobble,null,{grain:.25,clouds:10,edge:0});
    for(let r=1.6;r<14.4;r+=1.15){const n=Math.round(r*4.4),off=R(TAU);for(let k=0;k<n;k++){const a0=off+k/n*TAU+.012,a1=off+(k+1)/n*TAU-.012,w=wedge(0,0,r-.5,r+.5,a0,a1,3).map(p=>[p[0],p[1]*.667]);P.flat(shade(PAL.cobble,R(-.1,.06)),w,.4);P.score([...w,w[0]],{w:.07,ink:.25})}}}},0,.47,0);
  flatPiece(ring(E,.95)[0],{color:PAL.curb,kind:'water',t:.5},0,.6,0)});

/* ---- Øksebrønden ---- */
BUILD.push(()=>{const X=0,Z=0;wellAt=new THREE.Vector3(X,3.6,Z);const H=house('broend',[0,4.9],[0,7.2]);
  /* rullet karton med kvadersten */
  {const C=TAU*4.4,P=new Painter2(box(0,0,C,3.6),40,{cap:1536,base:'water'});P.wash('#a296b8',null,{grain:.3,clouds:8,edge:0});P.ashlar(null,'#a296b8',{rowH:[.8,1.05],bw:[1.3,2.3],tint:.1});P.wash('#6b5a7a',box(0,0,C,.9),{alpha:.35,edge:0});
   const mat=new THREE.MeshStandardMaterial({map:tx(P.c,true),bumpMap:tx(P.b,false),bumpScale:1.1,roughness:.9});
   const cyl=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,3.6,64,1,true),mat);cyl.castShadow=cyl.receiveShadow=true;put(H,cyl,X,2.2,Z);
   const inner=new THREE.Mesh(new THREE.CylinderGeometry(3.95,3.95,3.6,48,1,true),new THREE.MeshStandardMaterial({color:'#2e2640',roughness:.95,side:THREE.BackSide}));put(H,inner,X,2.2,Z)}
  /* dæksten i en krans */
  for(let k=0;k<16;k++){const a0=k/16*TAU+.015,a1=(k+1)/16*TAU-.015;flatPiece(wedge(0,0,3.85,4.95,a0,a1,5),{color:shade(k%2?PAL.stoneLt:'#b5acc7',R(-.04,.04)),kind:'water',t:.5},X,4.2,Z,H)}
  /* det magiske vand: silkepapir der lyser, med to lysere ringe */
  flatPiece(circ(0,0,3.95,3.95,48),{t:.03,mat:paperMat('#e6d4ff','tissue',{glow:'#9b5cff',gi:1.05})},X,3.5,Z,H);
  for(const[r,w]of[[2.6,.25],[1.3,.2]])flatPiece(ring(circ(0,0,r,r,40),w)[0],{t:.03,mat:paperMat('#f4ebff','tissue',{glow:'#c9a6ff',gi:1.3})},X,3.53,Z,H);
  /* stolper, tag af tagsten, vindespil med reb og spand */
  for(const s of[-1,1])stick(H,X+s*4.15,4.2,10.6,Z,.6,PAL.wood);
  const tri=[[-6.8,10.1],[6.8,10.1],[0,14.9]];shingleRoof(H,tri,{color:PAL.berry,rowH:.95,tile:1.15,z:Z+.4});
  for(const s of[-1,1])pieces(thick([[[s*7,10],[0,15.1]]],.32),{color:PAL.woodDk,kind:'balsa',t:.3},H,X,0,Z+1.2);
  put(H,piece(circ(0,0,.42),{mat:gold(),t:.3}),X,15.3,Z+1.2);
  {const ax=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,8.9,12),paperMat(PAL.wood,'balsa'));ax.rotation.z=Math.PI/2;ax.castShadow=true;put(H,ax,X,8.4,Z)}
  stick(H,X+4.75,7.4,8.5,Z+.3,.24,PAL.woodDk);{const hnd=new THREE.Mesh(new THREE.BoxGeometry(.9,.24,.24),paperMat(PAL.woodDk,'balsa'));put(H,hnd,X+4.95,7.4,Z+.3)}
  thread(H,X,6.5,8.3,Z);
  {const b=new THREE.Mesh(new THREE.CylinderGeometry(.85,.7,1.2,20),paperMat('#8a6040','balsa'));b.castShadow=true;put(H,b,X,5.9,Z);for(const y of[5.55,6.25]){const band=new THREE.Mesh(new THREE.CylinderGeometry(y>6?.84:.76,y>6?.84:.76,.13,20),paperMat(PAL.iron,'card'));put(H,band,X,y,Z)}}
  /* skiltet på brøndens forside */
  {const sg=piece(box(-4.6,0,4.6,1.9),{t:.18,s:46,base:'card',paint:P=>{P.flat('#5b3b26');P.flat('#7a5236',box(-4.35,.25,4.35,1.65));P.score([...box(-4.35,.25,4.35,1.65),[-4.35,.25]],{w:.06,ink:.3});P.text('Øksebrønden',0,.95,1.15,'#f3dfb0',{font:FONT.broend,ls:.04,shadow:'#2a1a10'})}});sg.userData.sign='Øksebrønden';put(H,sg,X,1.05,Z+4.55)}
  lamp(X,Z+2,'#b47aff',60,18,5);glowSpots.push([X,4.4,Z,12,'broend']);
  /* bænke af lister med jernben */
  for(const[x,z,r]of[[-9.5,-5,.3],[9.5,-5,-.3]]){prop('bænk',x,z,3);const g=new THREE.Group();put(scene,g,x,0,z);g.rotation.y=r;
    for(const y of[2.35,2.95])put(g,piece(box(-3.3,y,3.3,y+.48),{color:shade(PAL.wood,R(-.05,.05)),kind:'balsa',t:.9}),0,0,.2);
    for(const y of[3.8,4.6])put(g,piece(box(-3.3,y,3.3,y+.55),{color:shade(PAL.wood,R(-.05,.05)),kind:'balsa',t:.14}),0,0,-.45);
    for(const s of[-1,1])pieces(thick([[[s*2.7,.4],[s*2.8,2.3],[s*2.75,3.4],[s*2.9,5.1]],[[s*2.7,2.3],[s*2.1,1.5],[s*2.3,.9]]],.15),{color:PAL.iron,t:.12},g,0,0,.75)}});

/* ---- vejviseren: firkantet stolpe og pile af farvet karton med trykt skrift ---- */
BUILD.push(()=>{const X=-22,Z=-8;prop('vejviser',X,Z,.6);stick(scene,X,.4,8.4,Z,.7,PAL.woodDk);put(scene,piece([[-.55,8.4],[.55,8.4],[0,9.6]],{color:PAL.plumDk,t:.7}),X,0,Z);
  [['Kollegiet',7.3,-1,'#6e5236',-.05],['Skolen',6.9,1,'#5a3a78',.04],['Dragen',5.6,-1,'#4f6a40',.07],['Bobler',5.2,1,'#2f6278',.03],['Koncertsalen',3.9,-1,'#8a4030',.04],['Arkaden',3.5,1,'#7a3058',-.05]].forEach(([t,y,dir,c,rot])=>{const w=t.length*.8+1.8;
    const pts=dir>0?[[0,-.85],[w,-.85],[w+1.15,0],[w,.85],[0,.85]]:[[0,-.85],[-w,-.85],[-w-1.15,0],[-w,.85],[0,.85]];
    const m=piece(pts,{t:.16,s:46,base:'card',both:true,paint:P=>{P.flat(c);const inset=pts.map(([x,yy])=>[x===0?dir*.25:x-dir*.25*(Math.abs(x)>w?1.6:1),yy*.74]);P.score([...inset,inset[0]],{w:.05,ink:.3,dark:'#1a1018'});P.text(t,dir*(w/2+.2),0,1.3,'#f6ead0',{font:FONT.pil,ls:.03})}});
    m.rotation.z=rot;m.userData.sign='pil:'+t;m.userData.dir=dir;put(scene,m,X,y,Z+(dir>0?.45:-.45));pin(scene,X+dir*.9,y,Z+(dir>0?.55:-.55),Z,.14)})});

/* ---- lygtepælene: sort stolpe, lygte med silkepapir og guldtop ---- */
function newLamp(x,z){prop('lygte',x,z,.6);stick(scene,x,.4,10.2,z,.42,PAL.iron);put(scene,piece(box(-.55,.3,.55,1.1),{color:PAL.iron,t:.7}),x,0,z);
  const head=[[-1,0],[1,0],[1.25,1.7],[-1.25,1.7]],win_=box(-.62,.32,.62,1.42);
  put(scene,piece({outer:head,holes:[win_]},{color:PAL.iron,t:.3}),x,10.1,z+.2);
  put(scene,piece(box(-.8,.15,.8,1.6),{t:.03,mat:paperMat('#fff0c8','tissue',{glow:PAL.glow,gi:1.8})}),x,10.1,z+.02);
  put(scene,piece([[-1.45,1.6],[1.45,1.6],[0,2.7]],{mat:gold(),t:.25}),x,10.1,z+.2);
  lamp(x,z+1.2,'#ffb35c',80,24,11);lampSpots.push(new THREE.Vector3(x,11.1,z+.6))}

/* ---- Magiskolen ---- */
BUILD.push(()=>{const Z=-27,T=.4;const H=house('skole',[0,-25.2],[0,-21.6]);
  /* murstykke med vinduer som huller, malet som akvarel med kvadersten */
  const wallPiece=(outer,holes,z,o={})=>{for(const sh of clip([toCCW(outer)],holes,'diff'))put(H,piece(sh,{t:T,s:20,cap:1400,paint:P=>{P.wash(PAL.stone,outer,{top:PAL.stoneLt,grain:.3,clouds:10,edge:.4});P.ashlar(outer,PAL.stone,{rowH:[1.05,1.45],bw:[1.9,3.6],tint:.15,ink:.32});
    P.wash('#5f557a',box(-60,-1,60,2.6),{alpha:.35,edge:0});o.extra&&o.extra(P)}}),0,0,z)};
  const merlons=(x0,x1,y,h=1.8,w=1.8,gap=1.2)=>{const o=[[x1,y]];const n=Math.max(1,Math.round((x1-x0+gap)/(w+gap))),step=(x1-x0)/n;for(let i=n-1;i>=0;i--){const a=x0+i*step,b=a+step;o.push([b-gap/2*(i<n-1?1:0),y],[b-gap/2*(i<n-1?1:0),y+h],[a+gap/2*(i>0?1:0),y+h],[a+gap/2*(i>0?1:0),y])}return o};
  const bands=(x0,x1,ys,z,cut=[])=>{for(const y of ys)pieces(clip([box(x0-.25,y,x1+.25,y+.55)],cut,'diff'),{color:PAL.stoneLt,kind:'water',t:.22},H,0,0,z)};
  const quoins=(x,y0,y1,z,s)=>{for(let y=y0,i=0;y<y1-.3;y+=1.35,i++){const w=i%2?1.1:1.7,x0=s<0?x:x-w,x1=s<0?x+w:x;put(H,piece(box(x0,y+.05,x1,Math.min(y1,y+1.3)),{color:shade(PAL.stoneLt,R(-.05,.03)),kind:'water',t:.2}),0,0,z)}};
  const W=(x,y,w,h)=>arch(x,y,w,h,16);
  /* hovedbygningen */
  {const outer=dedupe([[-18,0],[18,0],...merlons(-18,18,23)]);
    const door=arch(0,0,7,10.5,24),wins=[W(-13,13,2.4,4.4),W(-7.5,13,2.4,4.4),W(7.5,13,2.4,4.4),W(13,13,2.4,4.4),W(-13,4.5,2.4,4.4),W(13,4.5,2.4,4.4)];
    wallPiece(outer,[door,...wins],Z);
    for(const w of wins)windowParts(H,w,Z,{t:T,curtain:w[0][1]>10?'#8a3a6a':null,sill:PAL.stoneLt});
    /* porten: dør af planker bag hullet, buesten rundt om */
    put(H,piece(arch(0,0,7.6,10.9,24),{t:.25,s:30,base:'card',paint:P=>{P.flat('#8a5a38');for(let x=-3.8;x<3.8;x+=.95){P.flat(shade('#8a5a38',R(-.08,.06)),box(x,0,x+.95,11),.6);P.score([[x,0],[x,11]],{w:.07,ink:.35})}}}),0,0,Z-T/2-.15);
    for(const y of[2.4,7])put(H,piece(box(-3.7,y,3.7,y+.45),{color:PAL.iron,t:.1}),0,0,Z-T/2+.02);
    put(H,piece(ring(circ(1.9,5,.5,.5,20),.12)[0],{mat:gold(),t:.12}),0,0,Z-T/2+.05);
    for(let k=0;k<11;k++){const a0=k/11*Math.PI+.012,a1=(k+1)/11*Math.PI-.012,key=k===5;put(H,piece(wedge(0,7,3.5,key?5.2:4.75,a0,a1,4),{color:shade(key?PAL.stoneLt:'#b8afcb',R(-.04,.04)),kind:'water',t:.28}),0,0,Z+T/2+.14)}
    for(const s of[-1,1])for(let y=0,i=0;y<7;y+=1.4,i++){const w=i%2?.9:1.3;put(H,piece(box(s>0?3.5:-3.5-w,y+.05,s>0?3.5+w:-3.5,y+1.35),{color:shade('#b8afcb',R(-.04,.04)),kind:'water',t:.24}),0,0,Z+T/2+.12)}
    pieces(clip([box(-18.3,0,18.3,1.5)],[grow(door,.1)[0].outer],'diff'),{color:PAL.stoneDk,kind:'water',t:.3},H,0,0,Z+T/2+.15);
    bands(-18,18,[11.1,21.7],Z+T/2+.11,[grow(arch(0,0,7,10.5,24),1.4)[0].outer,...wins.map(w=>grow(w,.45)[0].outer)]);
    /* faner med guldstjerne */
    for(const s of[-1,1]){const x=s*10.25;const g=new THREE.Group();put(H,g,x,0,Z+T/2+.5);
      {const rod=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2.7,10),paperMat(PAL.woodDk,'balsa'));rod.rotation.z=Math.PI/2;put(g,rod,0,20.5,.1)}
      put(g,piece([[-1.05,20.4],[1.05,20.4],[1.05,13.8],[0,14.7],[-1.05,13.8]],{color:'#5a2f6e',t:.1}),0,0,0);
      put(g,piece([[-1.05,20.4],[1.05,20.4],[1.05,19.9],[-1.05,19.9]],{mat:gold(),t:.08}),0,0,.08);
      put(g,piece(starPts(0,17.2,.78,.33),{mat:gold(),t:.1}),0,0,.1);
      for(const e of[-1.2,1.2])put(g,new THREE.Mesh(DOME,M.brass),e,20.5,.1).scale.setScalar(.2)}}
  /* sidetårnene */
  for(const s of[-1,1]){const x=s*18,z=Z+.8,outer=[[x-4.5,0],[x+4.5,0],[x+4.5,31],[x-4.5,31]];
    const wins=[W(x,22,2.2,4.4),W(x,12.2,2.2,4.4),W(x,3,2.2,3.8)];
    wallPiece(outer,wins,z);wins.forEach((w,i)=>windowParts(H,w,z,{t:T,lit:i<2,curtain:i===1?'#8a3a6a':null,sill:PAL.stoneLt}));
    quoins(x-4.5,0,31,z+T/2+.1,-1);quoins(x+4.5,0,31,z+T/2+.1,1);bands(x-4.5,x+4.5,[10.6,20.6],z+T/2+.11,wins.map(w=>grow(w,.45)[0].outer));
    /* konsoller under taget */
    put(H,piece(box(x-5.2,29.6,x+5.2,31.2),{color:PAL.stoneLt,kind:'water',t:.3}),0,0,z+T/2+.15);
    for(let k=0;k<6;k++){const cx=x-4.4+k*1.76;put(H,piece([[cx-.45,29.6],[cx+.45,29.6],[cx+.25,28.6],[cx-.25,28.6]],{color:'#b8afcb',kind:'water',t:.26}),0,0,z+T/2+.13)}
    /* heksehatte-tag med bøjet spids */
    const roofS=toCCW([[x-5.8,31.1],[x+5.8,31.1],[x+3.2,35.5],[x+1.6,40.5],[x+1.2,42.4],[x+2.9,44.6],[x+.4,43.2],[x-1.2,40],[x-3,35.6]]);
    const zr=shingleRoof(H,roofS,{color:s<0?PAL.plum:'#5d3a78',rowH:1.05,tile:1.35,z:z+.35});
    put(H,piece(box(x-5.9,30.9,x+5.9,31.6),{mat:gold(),t:.18}),0,0,zr+.12);
    flagSpots.push([x+2.9,44.6,z+.4])}
  /* midtertårnet med uret */
  {const z=Z-.8,outer=[[-4.5,0],[4.5,0],[4.5,42],[-4.5,42]],w1=W(0,28.5,2.4,3.6);
    wallPiece(outer,[w1],z);windowParts(H,w1,z,{t:T,sill:PAL.stoneLt});quoins(-4.5,22,42,z+T/2+.1,-1);quoins(4.5,22,42,z+T/2+.1,1);
    put(H,piece(circ(0,35,3.15,3.15,48),{color:PAL.plumDk,t:.2}),0,0,z+T/2+.12);
    put(H,piece(circ(0,35,2.75,2.75,48),{t:.16,s:60,base:'water',paint:P=>{P.wash('#f3ead6',null,{edge:0,grain:.15});for(let k=0;k<12;k++){const a=k/12*TAU;P.pen([[Math.cos(a)*2.15,35+Math.sin(a)*2.15],[Math.cos(a)*2.5,35+Math.sin(a)*2.5]],'#3b2147',k%3?.07:.16,.95)}P.pen(circ(0,35,2.6,2.6,48),'#c9a04a',.05,.8,true)}}),0,0,z+T/2+.32);
    put(H,piece([[-.12,0],[.12,0],[.06,1.9],[0,2.2],[-.06,1.9]],{mat:gold(),t:.06}),0,35,z+T/2+.45);
    {const h=piece([[-.1,0],[.1,0],[.05,1.35],[0,1.55],[-.05,1.35]],{mat:gold(),t:.06});h.rotation.z=-2.1;put(H,h,0,35,z+T/2+.5)}
    put(H,piece(circ(0,0,.2),{mat:gold(),t:.1}),0,35,z+T/2+.55);
    put(H,piece(box(-5.2,40.6,5.2,42.2),{color:PAL.stoneLt,kind:'water',t:.3}),0,0,z+T/2+.15);
    const roofC=toCCW([[-6.2,42.1],[6.2,42.1],[3.2,47],[1.4,52.5],[1.4,54.4],[3.4,56.4],[.4,55.4],[-1.4,52],[-3.3,47]]);
    const zr=shingleRoof(H,roofC,{color:PAL.plumDk,rowH:1.05,tile:1.35,z:z+.35});
    put(H,piece(box(-6.3,41.9,6.3,42.6),{mat:gold(),t:.18}),0,0,zr+.12);flagSpots.push([3.4,56.4,z+.4])}
  /* skiltet over porten: plade med guldkant og guldskrift */
  {const z=Z+.9;put(H,piece(box(-7.6,0,7.6,3.1),{mat:gold(),t:.16}),0,24.4,z);
    {const sg=piece(box(-7.3,.3,7.3,2.8),{t:.2,s:50,base:'card',paint:P=>{P.flat('#241632');P.text('Magiskolen',0,1.55,1.7,'#f6e7c0',{font:FONT.skole,ls:.1,gold:1})}});sg.userData.sign='Magiskolen';put(H,sg,0,24.4,z+.16)}
    for(const s of[-1,1])put(H,piece([[s*6.6,23.4],[s*7.2,23.4],[s*7.2,24.6],[s*6.6,24.6]],{color:PAL.iron,t:.3}),0,0,z-.1)}
  /* fakler ved porten */
  for(const s of[-1,1]){const x=s*6.4,z=Z+T/2+.6;put(H,piece([[-.35,0],[.35,0],[.35,.5],[0,.8],[-.35,.5]],{color:PAL.iron,t:.4}),x,7.8,z-.3);stick(H,x,8,10.9,z,.32,PAL.woodDk);
    put(H,piece([[-.5,0],[.5,0],[.62,.7],[-.62,.7]],{color:PAL.iron,t:.5}),x,10.8,z);glowSpots.push([x,11.8,z+.4,6,'fakkel']);lamp(x,Z+3,'#ff9a3a',70,22,12)}
  /* trappe */
  for(let i=0;i<3;i++)flatPiece(box(-5.6+i*.9,-1.05,5.6-i*.9,1.05),{color:shade('#9a91b2',i*.05),kind:'water',t:.55},0,.62+i*.55,Z+2.6-i*.7,H);
  /* uglen på muren */
  {const g=new THREE.Group();put(H,g,12.4,24.8,Z+.9);
    put(g,piece([[-1,0],[1,0],[1.25,1.5],[1,2.6],[.65,3.3],[.2,2.9],[-.2,2.9],[-.65,3.3],[-1,2.6],[-1.25,1.5]],{color:'#7a5536',t:.18}),0,0,0);
    put(g,piece(circ(0,1.1,.75,.95,24),{t:.12,s:80,base:'card',paint:P=>{P.flat('#d9c09a');for(let y=.5;y<1.9;y+=.32)for(let x=-.6;x<.7;x+=.3)P.pen(arch(x+(y*3%2?.15:0),y,.24,.18,6).slice(2),'#8a6a4a',.035,.7)}}),0,0,.14);
    for(const sx of[-1,1]){put(g,piece(circ(sx*.46,2.15,.42,.42,24),{mat:gold(),t:.08}),0,0,.16);put(g,piece(circ(sx*.46,2.15,.19,.21,16),{color:'#151018',t:.06}),0,0,.24)}
    put(g,piece([[-.14,1.8],[.14,1.8],[0,1.45]],{color:'#e0a030',t:.08}),0,0,.24);
    for(const sx of[-1,1])put(g,piece([[sx*1.02,.4],[sx*1.3,1.6],[sx*.95,2.3],[sx*.8,1]],{color:'#5f4129',t:.08}),0,0,.12)}
  /* efeu af udklippede blade op ad tårnene */
  const ivyC=(x,y,n=5)=>{const leaves=[];for(let i=0;i<n;i++){const lx=x+R(-.9,.9),ly=y+R(-.7,.7),a=R(TAU);leaves.push(circ(lx,ly,.55,.36,10).map(([px,py])=>[lx+(px-lx)*Math.cos(a)-(py-ly)*Math.sin(a),ly+(px-lx)*Math.sin(a)+(py-ly)*Math.cos(a)]))}return clip(leaves,[],'union')};
  for(const s of[-1,1])for(const[dx,y]of[[-3.6,1.2],[-3.2,3.2],[-3.8,5.1],[-3.1,7],[-3.6,9],[-2.9,10.8]]){pieces(ivyC(s*(18-dx),y),{color:shade(rnd()<.5?PAL.leaf:PAL.leafLt,R(-.05,.05)),t:.08},H,0,0,Z+.8+T/2+.35)}});
