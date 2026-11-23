/* ============ Garderoben: heksens omklædningsværelse i papir, med heks A og tøj der kan skiftes ============
   Værelset bages én gang. Heksen står i det levende lag med rigtige skygger mellem papirlagene. */
const scene=new THREE.Scene(),live=new THREE.Scene();scene.background=new THREE.Color('#120e1a');
{let env=(typeof ctx!=='undefined')?ctx.env:null;/* i spillet lånes byens omgivelseslys */if(!env){const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);env=pm.fromEquirectangular(e).texture;pm.dispose();e.dispose()}scene.environment=env;live.environment=env;scene.environmentIntensity=.3;live.environmentIntensity=.35;}
const mkKey=(sc,sh)=>{const k=new THREE.DirectionalLight('#ffe2c4',sh?2.1:1.9);k.position.set(-28,62,110);k.target.position.set(-8,16,0);sc.add(k,k.target);if(sh){k.castShadow=true;k.shadow.mapSize.set(2048,2048);Object.assign(k.shadow.camera,{left:-34,right:34,top:44,bottom:-6,near:40,far:240});k.shadow.bias=-.0006;k.shadow.normalBias=.05;k.shadow.radius=2.5}return k};
mkKey(scene,true);scene.add(new THREE.HemisphereLight('#b8a8ff','#3a2a20',.5));
mkKey(live,true);live.add(new THREE.HemisphereLight('#c8b8ff','#4a3628',.75));{const r=new THREE.DirectionalLight('#9fb6ff',.5);r.position.set(50,40,-40);live.add(r)}
const SPOTS={},BUILD=[],PAL={iron:'#2e2833',woodDk:'#5c3c28',wood:'#86593a'};
const starPts=(x,y,r1,r2,rot=0)=>{const o=[];for(let i=0;i<10;i++){const a=Math.PI/2+rot+i/10*TAU,r=i%2?r2:r1;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}return o};
const flatP=(shape,o,x,y,z)=>{const m=piece(shape,o);m.rotation.x=-Math.PI/2;return put(scene,m,x,y,z)};
const GLOW=[];const glowS=(col,size)=>{const c=cv(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(size,size,1);return s};
const FX=-5;/* her står heksen */

BUILD.push(()=>{/* væg med stjernetapet og træpanel */
  const W=box(-80,-2,80,64);put(scene,piece(W,{t:.5,s:9,cap:1800,paint:P=>{P.wash('#3a2a58',W,{top:'#2a1e44',edge:0,clouds:14});for(let y=14;y<64;y+=5)for(let x=-80+((y/5)%2?2.5:0);x<80;x+=5)P.fill(starPts(x,y,.55,.22,.3),'#c9a04a',.5);
    P.wash('#4a2e1c',box(-81,-3,81,11),{alpha:.97,edge:0,mode:'source-over',clouds:6});for(let x=-80;x<80;x+=7)P.score([...box(x+.6,1,x+6.4,9.4),[x+.6,1]],{w:.12,ink:.4,dark:'#1a0c06'})}}),0,0,-10);
  put(scene,piece(box(-80,10.4,80,11.6),{color:'#6a4426',kind:'balsa',t:.6}),0,0,-9.6);
  /* gulv af planker og et rundt tæppe under heksen */
  for(let i=-88;i<34;i++)flatP(box(-80,-.5,80,.5).map(([x,y])=>[x,y+i*1.05-9.6]),{color:shade('#7a4e2e',R(-.06,.06)),kind:'balsa',t:.3},0,0,0);
  flatP(circ(FX,-1.5,13,6.2,56),{color:'#5a2a6a',kind:'water',t:.12},0,.2,0);flatP(ring(circ(FX,-1.5,11.4,5.4,56),.5)[0],{mat:gold(),t:.04},0,.28,0);flatP(circ(FX,-1.5,7.6,3.6,48),{color:'#7a3f92',kind:'water',t:.06},0,.3,0);
  for(let k=0;k<10;k++){const a=k/10*TAU;flatP(starPts(FX+Math.cos(a)*9.6,-1.5+Math.sin(a)*4.5,.6,.25).map(([x,y])=>[x,y]),{mat:gold(),t:.03},0,.32,0)}
  /* vindue med nattehimmel og måne */
  {const wx=8,wy=22.5,sh=arch(wx,wy,11,17,24);put(scene,piece(grow(sh,1.1,false)[0].outer,{color:'#6a4426',kind:'balsa',t:.6}),0,0,-9.5);
   put(scene,piece(sh,{t:.1,s:24,base:'water',paint:P=>{P.wash('#1a2456',sh,{top:'#101638',edge:0,clouds:8});for(let i=0;i<40;i++)P.fill(circ(R(wx-5,wx+5),R(wy+1,wy+16),R(.06,.14),R(.06,.14),6),'#f6e7c0',R(.5,.95));P.wash('#3a3a6a',box(wx-6,wy-1,wx+6,wy+3.4),{alpha:.7,edge:0,mode:'source-over'})}}),0,0,-9.1);
   put(scene,piece(circ(wx+2.2,wy+11.6,1.9,1.9,32),{t:.04,mat:paperMat('#fff6d8','tissue',{glow:'#ffe9a0',gi:1.3})}),0,0,-8.95);
   fpsafe(clip([box(wx-.25,wy,wx+.25,wy+18),box(wx-6,wy+8.2,wx+6,wy+8.7)],[sh],'inter'),{color:'#6a4426',kind:'balsa',t:.3},-8.8);
   put(scene,piece(box(wx-7.4,wy-1.4,wx+7.4,wy-.3),{color:'#7a5230',kind:'balsa',t:1.6}),0,0,-8.8);
   for(const s of[-1,1]){const cu=toCCW([[wx+s*8.6,wy+18.3],[wx+s*4.8,wy+18.3],[wx+s*5.8,wy+12],[wx+s*7.2,wy+6.4],[wx+s*6.4,wy+.5],[wx+s*9,wy-.4]]);put(scene,piece(cu,{t:.15,s:20,paint:P=>{P.wash('#8a3a6a',cu,{top:'#a84a80',edge:.6,clouds:5});for(let k=0;k<3;k++)P.score([[wx+s*(5.6+k),wy+18],[wx+s*(6.8+k*.6),wy+1]],{w:.09,ink:.35,dark:'#4a1a3a'})}}),0,0,-8.4)}
   put(scene,piece(box(wx-9.8,wy+18,wx+9.8,wy+18.9),{mat:gold(),t:.5}),0,0,-8.3)}
  /* klædeskab med åben låge, kjoler på bøjler og flasker ovenpå */
  {const cx=-30,Hs=33;put(scene,piece(box(cx-10,0,cx+10,Hs),{t:.5,s:14,paint:P=>{P.wash('#6a4426',null,{edge:0,top:'#86593a'});for(let x=cx-10;x<cx+10;x+=2)P.score([[x,0],[x,Hs]],{w:.08,ink:.3,dark:'#2a1408'})}}),0,0,-9);
   put(scene,piece(box(cx-8.6,2.6,cx+8.6,Hs-2.6),{color:'#1c1018',t:.2}),0,0,-8.6);put(scene,piece(box(cx-8.6,Hs-5.6,cx+8.6,Hs-5),{color:'#c9a04a',t:.5}),0,0,-8.2);
   const dr=[['#6a3fa2',-5.8],['#3f7f78',-2],['#7a4a2c',1.8],['#cfb6ee',5.6]];for(const[c,dx]of dr){const x=cx+dx,yb=9+R(0,3.5),yt=Hs-6.6,zz=-8.1+R(0,.3),d=sm_([[x-1.5,yt],[x-.7,yt-.5],[x+.7,yt-.5],[x+1.5,yt],[x+1.7,yt-2.2],[x+1.05,yt-5.4],[x+1.5,yt-8],[x+2.7,yb+.3],[x+1.3,yb-.15],[x,yb+.1],[x-1.3,yb-.15],[x-2.7,yb+.3],[x-1.5,yt-8],[x-1.05,yt-5.4],[x-1.7,yt-2.2]],5);
     put(scene,piece(toCCW(d),{t:.25,s:26,paint:P=>{P.wash(c,toCCW(d),{top:hexOf(shade(c,.2)),edge:.6,clouds:5});P.flat(hexOf(shade(c,-.35)),box(x-1.2,yt-5.8,x+1.2,yt-5.2),.9);for(let q=-1;q<=1;q++)P.score([[x+q*.5,yt-6],[x+q*1.5,yb+.6]],{w:.07,ink:.3,dark:hexOf(shade(c,-.5))})}}),0,0,zz);pieces(thick([[[x-1.4,yt+.2],[x,yt+1.2],[x+1.4,yt+.2]],[[x,yt+1.2],[x,yt+1.9]]],.1),{mat:gold(),t:.08},scene,0,0,-7.9)}
   put(scene,piece(box(cx-8.6,2.6,cx+8.6,5.4),{color:'#3a2418',kind:'balsa',t:.4}),0,0,-8);for(const[dx,c]of[[-5,'#5a3a22'],[-.6,'#2a2030'],[4.4,'#7a2f3a']]){const x=cx+dx;put(scene,piece(sm_([[x-1.5,5.4],[x+1.5,5.4],[x+1.4,6.2],[x+.4,6.6],[x+.3,8.6],[x-.9,8.6],[x-.9,6.4]]),{color:c,kind:'kraft',t:.5}),0,0,-7.8)}
   const door=box(-9.4,0,0,Hs-.6);const dg=new THREE.Group();dg.rotation.y=1.05;put(scene,dg,cx-10,.3,-8.8);put(dg,piece(door,{t:.5,s:14,paint:P=>{P.wash('#7a5230',null,{edge:0,top:'#96693c'});P.score([...box(-8.2,2,-1.2,15),[-8.2,2]],{w:.14,ink:.4,dark:'#2a1408'});P.score([...box(-8.2,18,-1.2,Hs-2.4),[-8.2,18]],{w:.14,ink:.4,dark:'#2a1408'});P.fill(starPts(-4.7,24.5,1.5,.6),'#c9a04a',.8)}}),0,0,0);put(dg,piece(circ(-8.2,16.5,.5,.5,16),{mat:gold(),t:.5}),0,0,.4);
   put(scene,piece(box(cx-11.2,Hs-.4,cx+11.2,Hs+.8),{color:'#5c3c28',kind:'balsa',t:2.4}),0,0,-9);
   for(const[dx,c,h]of[[-7,'#5fe0b0',3.6],[-3.6,'#ff8ac0',2.6],[-.4,'#7fd6ff',4.2],[3,'#ffd23a',3],[6.4,'#b47aff',3.6]]){const x=cx+dx,sy=Hs+.6;put(scene,piece(sm_([[x-1,sy+.3],[x+1,sy+.3],[x+1.1,sy+h*.6],[x+.38,sy+h*.8],[x+.38,sy+h],[x-.38,sy+h],[x-.38,sy+h*.8],[x-1.1,sy+h*.6]]),{t:.6,mat:paperMat('#f2fff8','tissue',{glow:c,gi:1.1})}),0,0,-7.6);put(scene,piece(box(x-.45,sy+h,x+.45,sy+h+.5),{color:'#c8a070',kind:'balsa',t:.6}),0,0,-7.6);GLOW.push({p:[x,sy+h*.45,-6.6],c:c,s:5.5})}}
  for(const x of[-15.5,21,-46]){put(scene,piece(sm_([[x-1.1,28],[x+1.1,28],[x+.7,29.2],[x-.7,29.2]]),{mat:gold(),t:1.4}),0,0,-9);put(scene,piece(box(x-.35,29.2,x+.35,31.6),{color:'#f6efe0',kind:'water',t:.7}),0,0,-8.8);GLOW.push({p:[x,32.6,-8],c:'#ffd28a',s:8,f:1});const L=new THREE.PointLight('#ffc98a',60,46,2);put(scene,L,x,32,-2)}
  /* hattestativ med en ekstra hat */
  {const x=27;put(scene,piece(circ(0,0,3.4,1.1,24),{color:'#3a2418',kind:'balsa',t:1}),x,.6,-4);const st=new THREE.Mesh(new THREE.CylinderGeometry(.35,.4,26,10),paperMat('#5c3c28','balsa'));st.castShadow=true;put(scene,st,x,13.5,-4);for(const[dx,y]of[[-2.6,24],[2.6,22],[-2.2,18]])pieces(thick([[[x,y-1],[x+dx,y]]],.25),{color:'#5c3c28',kind:'balsa',t:.5},scene,0,0,-4);
   put(scene,piece(sm_([[x-4.6,26.4],[x+4.6,26.4],[x+4.4,27.2],[x+1.9,27.6],[x+.9,31.5],[x-.6,34.6],[x-2.6,35.4],[x-1.5,33.6],[x-1.6,30.6],[x-2,27.6],[x-4.4,27.2]]),{color:'#3f7f78',kind:'water',t:.5}),0,0,-3.4);put(scene,piece(box(x-1.95,27.5,x+1.95,28.5),{color:'#c9a04a',kind:'card',t:.2}),0,0,-3);
   put(scene,piece(sm_([[x+1.6,22.6],[x+3.6,22.4],[x+4.2,14],[x+3.4,9],[x+2,9.4],[x+2.4,14]]),{color:'#c2452d',kind:'water',t:.3}),0,0,-3.6)}});
const sm_=(cp,seg=6)=>outline(cp,seg,0);
function fpsafe(shapes,o,z){for(const s of shapes)put(scene,piece(s,o),0,0,z)}

/* ---- heksen og valgene ---- */
const VALG={Hat:['hat',[['heksehat','Heksehat'],['ingen','Ingen hat'],['nathat','Nattehat'],['eventyrhat','Eventyrhat'],['kort','Kort hat'],['høj','Høj hat'],['blomst','Blomsterhat'],['krone','Krone'],['baret','Baret'],['sløjfe','Sløjfe'],['hue','Hue']]],Hår:['hår',[['langt','Langt'],['skulder','Skulderlangt'],['kort','Kort'],['hestehale','Hestehale'],['rottehaler','Rottehaler'],['fletning','Sidefletning'],['fletninger','To fletninger'],['knolde','Knolde'],['topknold','Topknold'],['krøller','Krøller'],['bølger','Bølger']]],
  Pande:['pande',[['lige','Lige'],['side','Til siden'],['venstre','Til venstre'],['midt','Midterskilning'],['gardin','Gardin'],['mini','Kort'],['pjusket','Pjusket'],['bølget','Bølget'],['lang','Langt'],['tilbage','Strøget tilbage']]],
  Tøj:['tøj',[['stjernekjole','Stjernekjole'],['månekjole','Månekjole'],['blomsterkjole','Blomsterkjole'],['stribekjole','Stribet kjole'],['prikkjole','Prikket kjole'],['hjertekjole','Hjertekjole'],['knapkjole','Knapkjole'],['lagkjole','Lagkjole'],['forklædekjole','Forklædekjole'],['kortkjole','Kort kjole'],['festkjole','Festkjole'],['eventyrer','Eventyrer'],['skovløber','Skovløber'],['opdager','Opdager'],['rejsekappe','Rejsefrakke']]],Kappe:['kappe',[['lang','Lang kappe'],['ingen','Ingen kappe'],['stjerne','Stjernekappe'],['måne','Månekappe'],['takket','Takket kappe'],['blomster','Blomsterkappe'],['stribet','Stribet kappe'],['pelskant','Pelskant'],['hætte','Hættekappe'],['kort','Læderkappe']]],
  Ansigt:['mærke',[['fregner','Fregner'],['ingen','Intet mærke'],['hjerte','Hjerte'],['stjerne','Stjerne'],['måne','Måne'],['glimmer','Glimmer'],['ar','Ar'],['plaster','Plaster'],['maling','Krigsmaling'],['prik','Skønhedsplet']]],
  Øjne:['pupil',[['rund','Runde pupiller'],['glimt','Glimt i øjet'],['stjerne','Stjerner'],['hjerte','Hjerter'],['maane','Måner'],['diamant','Diamanter'],['blomst','Blomster'],['kat','Katteøjne'],['spiral','Snurrende'],['stor','Store og blanke']]],
  Mund:['mund',[['smil','Smil'],['grin','Stort grin'],['pust','Lille mund'],['tunge','Rækker tunge'],['kys','Kyssemund'],['kysstor','Store kyslæber'],['skaev','Skævt smil'],['oh','Overrasket'],['tand','Små hjørnetænder'],['kat','Kattemund'],['glad','Bredt smil']]],
  Støvler:['støvler',[['snør','Snørestøvler'],['spidse','Spidse sko'],['høje','Høje støvler'],['ballerina','Ballerinasko'],['gummi','Gummistøvler'],['pels','Pelsstøvler'],['sandaler','Sandaler'],['krul','Krøllede tæer'],['spænde','Spændesko'],['knap','Knapstøvler']]],
  Dyr:['kind',[['kat','Kat'],['hund','Hund'],['kanin','Kanin'],['enhjørning','Enhjørning'],['bjørn','Bjørn'],['drage','Drage'],['ugle','Ugle'],['ræv','Ræv'],['frø','Frø'],['næbdyr','Næbdyr']]],
  Mønster:['moenster',[['ingen','Ensfarvet'],['sokker','Sokker'],['pletter','Pletter'],['striber','Striber'],['øjeplet','Plet om øjet'],['hjerter','Hjerter'],['stjerner','Stjerner'],['prikker','Små prikker'],['plet','Stor plet'],['glimmer','Glimmer']]],
  Pynt:['pynt',[['halsbånd','Halsbånd'],['ingen','Ingen pynt'],['sløjfe','Sløjfe'],['krone','Krone'],['vinger','Feevinger'],['hat','Lille heksehat'],['blomst','Blomst ved øret'],['stjerne','Stjernespænde'],['tørklæde','Tørklæde'],['butterfly','Butterfly'],['briller','Briller']]],
  Farver:['farver',[]],
  Ekstra:['tilbehør',[['ingen','Ingenting'],['taske','Skuldertaske'],['rygsæk','Rygsæk'],['tørklæde','Tørklæde'],['briller','Runde briller'],['halskæde','Månekæde'],['perler','Perlekæde'],['lommeur','Lommeur'],['bog','Tryllebog'],['lanterne','Lanterne'],['tryllestav','Tryllestav'],...Object.keys(STAVE).map(k=>[k,STAVE[k].navn])]]};
let FIG=null,pop=0;const sparks=[];
const cam=new THREE.PerspectiveCamera(30,1,20,600),CD=150;
/* udsnittet følger det, man er ved at ændre: hele rummet, hatten, håret, ansigtet, støvlerne eller kæledyret. Kameraet bliver, hvor det er i dybden; kun udsnittet flytter sig */
let UD='hel',UDKLAR=false;const UDSNIT={hat:{x:FX,y:27.6,H:21,W:18},haar:{x:FX,y:19.2,H:21.5,W:16},ansigt:{x:FX,y:22.9,H:10.5,W:10},fod:{x:FX,y:4.4,H:11.5,W:16},dyr:{x:FX-15,y:6.6,H:16.5,W:19}},
  UDTAB={Hat:'hat','Hår':'haar',Pande:'ansigt',Ansigt:'ansigt','Øjne':'ansigt',Mund:'ansigt','Støvler':'fod',Dyr:'dyr',Farver:'dyr','Mønster':'dyr',Pynt:'dyr'};
/* panelet er bredere end før: billederne af valgene skal kunne ses */
const panelB=(w,h)=>h<=520?Math.min(.42*w,400):Math.min(.34*w,390);
const ST=makeStage({scene,live,cam,CD,fit:(c,w,h)=>{const Z=UDSNIT[UD];if(Z){const asp=w/h,wide=asp>1.25,pf=wide?(panelB(w,h)+24)/w:0,pb=wide?0:.4,HH=Math.max(Z.H/(1-pb),Z.W/(1-pf)/asp);c.fov=2*Math.atan(HH/2/CD)*180/Math.PI;c.position.set(Z.x,Z.y+1+CD*Math.sin(.1),CD*Math.cos(.1));c.lookAt(Z.x,Z.y,0);c.setViewOffset(w,h,pf*w/2,pb*h/2,w,h);return}
  const wide=w/h>1.25,asp=w/h,panel=wide?panelB(w,h)/w+24/w:0,needH=wide?47:66,needW=wide?54/(1-panel):40;const H=Math.max(needH,needW/asp);c.fov=2*Math.atan(H/2/CD)*180/Math.PI;const cx=wide?-12.5+H*asp*panel/2:FX,cy=wide?19:9;c.position.set(cx,cy+1+CD*Math.sin(.1),CD*Math.cos(.1));c.lookAt(cx,cy,0)},P_:{aoR:.45,dof:[.05,.14],haze:[2,3,0],bloom:1.1,bg:'#120e1a'}});
(async()=>{try{try{await Promise.race([Promise.all(['Alegreya SC'].map(f=>document.fonts.load(`700 40px "${f}"`).catch(()=>{}))),new Promise(r=>setTimeout(r,2500))])}catch(_){}
  for(const b of BUILD){await new Promise(r=>setTimeout(r,0));if((typeof ctx!=='undefined')&&!ctx.alive)return;b()}
  FIG=makeFigure((typeof ctx!=='undefined')&&ctx.look?Object.assign({},ctx.look):{});UI.draw();FIG.shadow=true;FIG.G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});FIG.G.position.set(FX,.35,1.5);live.add(FIG.G);setPet();
  {const c=cv(128,64),g=c.getContext('2d'),gr=g.createRadialGradient(64,32,0,64,32,64);gr.addColorStop(0,'rgba(10,6,20,.6)');gr.addColorStop(1,'rgba(10,6,20,0)');g.setTransform(1,0,0,.5,0,16);g.fillStyle=gr;g.fillRect(0,0,128,128);const m=new THREE.Mesh(new THREE.PlaneGeometry(15,6),new THREE.MeshBasicMaterial({map:tx(c,false),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(FX,.42,1.5);live.add(m)}
  for(const gl of GLOW){const s=glowS(gl.c,gl.s);s.position.set(...gl.p);live.add(s);gl.spr=s;gl.ph=R(TAU)}
  for(let i=0;i<14;i++){const s=glowS('rgba(255,236,170,.95)',1);live.add(s);s.visible=false;sparks.push({s,t:9})}
  ST.bake();UDKLAR=true;msg.classList.add('gone');let t=0,last=performance.now();
  const loop=now=>{if((typeof ctx!=='undefined')&&!ctx.alive)return;requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;t+=dt;pop=Math.max(0,pop-dt*2.2);
    const k=1+.06*Math.sin(pop*Math.PI)*pop;FIG.G.scale.set(k,2-k,1);FIG.G.position.y=.35+Math.sin(pop*Math.PI)*.9*pop;FIG.tick(t,{ph:0,amp:0});/* ved støvlerne løfter hun kjolen, ellers kan man ikke se dem */FIG.skirt.scale.y+=((UD==='fod'?.56:1)-FIG.skirt.scale.y)*Math.min(1,dt*8);petPop=Math.max(0,petPop-dt*2.4);if(PET){PET.G.position.y=.35+Math.sin(petPop*Math.PI)*2*petPop;PET.tick(t,{ph:petPop?t*14:0,amp:petPop?1:0})}
    for(const gl of GLOW){const f=gl.f?(.9+.1*Math.sin(t*9+gl.ph)*Math.sin(t*5.1)):(.9+.1*Math.sin(t*2+gl.ph));gl.spr.scale.set(gl.s*f,gl.s*f,1)}
    for(const sp of sparks){sp.t+=dt;if(sp.t>1){sp.s.visible=false;continue}sp.s.visible=true;sp.s.position.set(sp.x+sp.vx*sp.t,sp.y+sp.vy*sp.t+3*sp.t*sp.t*-1+2*sp.t,6);const z=(1-sp.t)*1.6;sp.s.scale.set(z,z,1)}
    ST.draw()};requestAnimationFrame(loop);
  window.__gard={ready:true,cam,set:(k,v)=>{choose(k,v);UI.draw()},fig:FIG}}catch(e){msgN.textContent='Fejl: '+e.message;console.error(e)}})();
/* kæledyret står ved siden af heksen og bygges på ny, når noget ved det ændres */
let PET=null;const PETL=(typeof ctx!=='undefined'&&ctx.dyr)?Object.assign({},ctx.dyr):{};
function setPet(k,v){if(k)PETL[k]=v;if(PET){live.remove(PET.G);PET.G.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m&&m.userData&&m.userData.own){if(m.map)m.map.dispose();if(m.bumpMap)m.bumpMap.dispose();m.dispose()}})}
  PET=makePet(PETL);PET.G.scale.setScalar(.85);PET.G.scale.x=-.85;PET.G.position.set(FX-15,.35,6);PET.G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});live.add(PET.G);if(k){if(typeof LYD!=='undefined')LYD.valg();petPop=1;if((typeof ctx!=='undefined')&&ctx.onDyr)ctx.onDyr(k,v)}}
let petPop=0;
function choose(k,v){if(DYRK[k]){if(PETL[k]!==v&&!(k==='kind'&&!PETL.kind&&v==='kat'))setPet(k,v);return}if(!FIG||FIG.L[k]===v)return;if(typeof LYD!=='undefined')LYD.valg();FIG.set(k,v);if((typeof ctx!=='undefined')&&ctx.onLook)ctx.onLook(k,v);pop=1;for(const sp of sparks){sp.t=R(0,.3);sp.x=FX+R(-6,6);sp.y=R(6,30);sp.vx=R(-4,4);sp.vy=R(2,8)}}
/* knapperne: alle grupper på én gang når der er højde til det, ellers faner */
/* flere farver alle steder (Kasper 23. nov.): tolv farver i lys, mellem og mørk, og en række hvide, grå og brune toner. De gamle farver er med, så det gemte stadig er valgt */
const TOEJ=['#ffd0d8','#ffd6b8','#fff0b0','#f4f9b0','#d8f5b8','#c0f0d8','#c0f0f0','#c8e4ff','#d0d4ff','#e0d0ff','#f4d0ff','#ffd0ec',
  '#e2384e','#e07a45','#f2c14e','#d8d040','#9be36a','#5fd0b0','#7fd8ff','#43a3d3','#4a6ad8','#7b4fd0','#c79bff','#e0457a',
  '#b83a3a','#a8442a','#c98a1e','#8a8a1e','#4a8a2a','#3e7a4a','#1f6f6a','#2e4a7a','#2a2a8a','#4a3a9a','#6a2a8a','#8a2a5a',
  '#ffffff','#f1ead8','#e2d4b8','#c8a878','#8a4b2e','#5a3a22','#7a2f3a','#8a7a6a','#5a5470','#3a3040','#2a2238','#111018'];
const HAAR=['#fff0c0','#f2d27a','#f2b33d','#e8a050','#e58a5a','#c2553a','#a8442a','#8a4a2a','#6a3a20','#4a2f1c','#2a2030','#111018',
  '#d8d2c8','#f6f0e2','#ffd0ec','#ff8fc7','#e0457a','#c79bff','#7b4fd0','#4a6ad8','#43a3d3','#7fd8ff','#5fd0b0','#9be36a'];
const DYRK={kind:'dyr',moenster:'dyrmønster',pynt:'dyrpynt',a:1,b:1,c:1,eye:1},DYRTAB={Dyr:1,Farver:1,'Mønster':1,Pynt:1},DYRFARVER=[...new Set(['#2d2738','#f3ecda','#c8935a','#8a5a34','#e07a2a','#ffc9e2','#f6f1ff','#b79bff','#5fa34a','#5ab85a','#43a3d3','#e0457a','#ffd86b','#9c6a48','#fff8ec','#e8d4b0','#b0703a','#5a3a22','#8a8a9a','#4a4a5a','#ffb07a',...TOEJ])];
const FLERE={Tøj:[['tøj',TOEJ,'Farve'],['tøj2',[...new Set(['#f2c230','#f6e7c0','#fbf5e6','#ffd0e0','#ff8fc7','#7fd8ff','#9be36a','#c79bff','#e2384e','#2e4a7a','#2a2238','#ffffff',...TOEJ])],'Mønster og krave']],Farver:[['a',DYRFARVER,'Krop'],['b',DYRFARVER,'Anden farve'],['c',DYRFARVER,'Pynt og detaljer'],['eye',['#b7e26a','#6ac8e8','#3d8bff','#8a6ad8','#f0a030','#e0457a','#c89a5a','#3fae6a','#7fd8ff','#c79bff','#ff8fc7','#ffd86b','#e2384e','#5fd0b0','#2a2238','#8a8a9a'],'Øjne']],Ansigt:[['hud',['#fff0e6','#ffd9c2','#f6c8a8','#f0c0a0','#e8b890','#d6a077','#c68e6a','#b88060','#a8704e','#8a5a3c','#6a4028','#5a3020','#3e2418','#f7e6dc','#cfe8c4','#dccdf2','#c8e8f4','#f4d0e8'],'Hud']],Øjne:[['øjne',['#3fae6a','#9be0a6','#3d8bff','#7fd8ff','#43a3d3','#8a6ad8','#c79bff','#c89a5a','#6a4420','#e0457a','#ff8fc7','#5a6a7a','#f0a030','#ffd86b','#e2384e','#5fd0b0','#2a2a3a','#8a8a9a'],'Farve']]};
const PALET={tøj:TOEJ,hat:TOEJ,kappe:TOEJ,støvler:[...new Set([...TOEJ,'#2e2833','#e0a020','#c2452d'])],hår:HAAR};
/* ---- billeder af valgene (Kasper 23. nov.: "Genovervej layout og design af menuen") ----
   Hvert valg vises som et lille billede af den rigtige ting i pap. En lille figur nr. to med heksens udseende (eller et kæledyr) fotograferes med
   valget på sit eget lærred. Billederne laves ét ad gangen for den side, man kigger på, og laves om, når heksen eller dyret skifter farve. */
const BILLED=(()=>{const N=150;let r=null,sc=null,fig=null,kø=[],tid=0;const cam=new THREE.PerspectiveCamera(10,1,1,900);
  /* hvor billedet tages for hver side: midten (y), højden og x, og hvad der tages af (ingen hat, så man kan se håret og panden) */
  const ZONE={Hat:[29,17,0,{stav:false}],'Hår':[18.5,27,0,{hat:'ingen',stav:false}],Pande:[24.4,8.5,0,{hat:'ingen',stav:false}],Ansigt:[22.3,8.6,0,{hat:'ingen',stav:false}],'Øjne':[22.4,4.4,0,{hat:'ingen',stav:false}],Mund:[20.6,4.4,0,{hat:'ingen',stav:false}],
    'Tøj':[12,21,0,{stav:false}],Kappe:[14.5,31,0,{stav:false}],'Støvler':[2.4,7,0,{stav:false}],Ekstra:[17,30,1]};
  function init(){if(r)return true;try{const gc=document.createElement('canvas');gc.width=gc.height=N;r=new THREE.WebGLRenderer({canvas:gc,alpha:true,antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(N,N,false);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
      sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#fff6e8','#6a5a7a',1.6));const d=new THREE.DirectionalLight('#ffffff',1.9);d.position.set(-10,20,30);sc.add(d);return true}catch(e){console.warn('billeder',e);r=null;return false}}
  const ryd=g=>g.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m&&m.userData&&m.userData.own){if(m.map)m.map.dispose();if(m.bumpMap)m.bumpMap.dispose();m.dispose()}});
  const FARVE=L=>JSON.stringify([L.col,L.skin,L.hair,L.iris]);
  function stil(L){if(!fig||FARVE(fig.L)!==FARVE(L)){if(fig){sc.remove(fig.G);ryd(fig.G)}fig=makeFigure(Object.assign({},L,{col:Object.assign({},L.col),res:.5}));fig.tick(2.2,{ph:0,amp:0});sc.add(fig.G);return}
    for(const k of['hat','hår','pande','tøj','kappe','mærke','pupil','mund','støvler','tilbehør','stav'])if(fig.L[k]!==L[k])fig.set(k,L[k])}
  function tegn(cv){const g=cv.getContext('2d');g.clearRect(0,0,N,N);g.drawImage(r.domElement,0,0,N,N,0,0,cv.width,cv.height)}
  function skyd(side,L,cv){stil(L);const[y,h,x]=ZONE[side];cam.fov=2*Math.atan(h/2/300)*180/Math.PI;cam.position.set(x,y,300);cam.lookAt(x,y,0);cam.updateProjectionMatrix();r.render(sc,cam);tegn(cv)}
  function skydDyr(P,cv){const p=makePet(P);sc.add(p.G);if(fig)fig.G.visible=false;const b=new THREE.Box3().setFromObject(p.G),c=b.getCenter(new THREE.Vector3()),z=b.getSize(new THREE.Vector3()),h=Math.max(z.x,z.y)*1.12;
    cam.fov=2*Math.atan(h/2/300)*180/Math.PI;cam.position.set(c.x,c.y,300);cam.lookAt(c.x,c.y,0);cam.updateProjectionMatrix();r.render(sc,cam);tegn(cv);sc.remove(p.G);ryd(p.G);if(fig)fig.G.visible=true}
  function næste(){tid=0;const j=kø.shift();if(!j)return;try{if(j.cv.isConnected&&init()){j.fn();j.cv.dataset.h=j.h;j.cv.parentNode.classList.add('har')}}catch(e){console.warn('billede',e)}if(kø.length)tid=setTimeout(næste,30)}
  return{N,ZONE,bestil(jobs){kø=jobs.filter(j=>j.cv.dataset.h!==j.h);clearTimeout(tid);if(kø.length)tid=setTimeout(næste,60)},skyd,skydDyr,
    ryd(){clearTimeout(tid);kø=[];if(fig){ryd(fig.G);fig=null}if(r){r.dispose();r.forceContextLoss();r=null}}}})();
if(typeof ctx!=='undefined'&&ctx.efter)ctx.efter.push(()=>BILLED.ryd());
/* ---- panelet: to faner som på en mappe (Heksen og Kæledyret), knapper med små tegninger, valgene som billeder og mange flere farver ---- */
const IKON={Hat:'M3 18h18M8 18l3-13 3 5 2 8','Hår':'M6 20c0-9 2-15 6-15s6 6 6 15M9 10c1 2 4 2 6 0',Pande:'M5 12c2-5 12-5 14 0M7 12h10',Ansigt:'M12 4a7 8 0 1 0 .1 0M9 11h.1M15 11h.1M9 15c2 2 4 2 6 0','Øjne':'M3 12c3-5 15-5 18 0-3 5-15 5-18 0zM12 10a2 2 0 1 0 .1 0',Mund:'M5 11c4 5 10 5 14 0-4 1-10 1-14 0z',
  'Tøj':'M9 3l-5 4 2 3 2-1v12h8V9l2 1 2-3-5-4c-1 2-5 2-6 0z',Kappe:'M8 4h8l3 16H5zM8 4l4 4 4-4','Støvler':'M8 3h5v11l6 3v3H8z',Ekstra:'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z',
  Dyr:'M7 8a2 2 0 1 0 .1 0M17 8a2 2 0 1 0 .1 0M6 18c0-5 3-7 6-7s6 2 6 7z',Farver:'M12 3c5 0 9 3.5 9 8 0 3-2 4-4 4h-2c-1 0-2 1-1.4 2.2.8 1.6-.2 2.8-1.6 2.8C7 20 3 16 3 11.5S7 3 12 3zM8 10h.1M12 7h.1M16 10h.1','Mønster':'M4 4h16v16H4zM4 12h16M12 4v16',Pynt:'M12 5c-2-3-7-2-7 2 0 4 7 9 7 9s7-5 7-9c0-4-5-5-7-2z'};
const ikon=(d,w=2)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SIDER={heks:['Hat','Hår','Pande','Ansigt','Øjne','Mund','Tøj','Kappe','Støvler','Ekstra'],dyr:['Dyr','Farver','Mønster','Pynt']};
const UI={draw(){}};{const tabs=document.getElementById('tabs'),opts=document.getElementById('opts');let curTab='Tøj',hvem='heks';const secs={},fliser={},rækker=[];
  const laast=(key,v)=>(typeof ctx!=='undefined')&&ctx.owns&&!ctx.owns(typeof DYRK[key]==='string'?DYRK[key]:key,v);const valgt=(key)=>DYRK[key]?(PETL[key]||{kind:'kat',moenster:PETL.kind&&PETL.kind!=='kat'||PETL.a?'ingen':'sokker',pynt:'halsbånd'}[key]):(FIG?FIG.L[key]:LOOK0[key]);
  const farveNu=k=>{if(DYRK[k])return PETL[k];if(!FIG)return null;const L=FIG.L;return k==='hår'?L.hair&&L.hair[0]:k==='hud'?L.skin:k==='øjne'?null:(L.col||{})[k]};
  /* billederne til den side, man kigger på */
  const billeder=()=>{const n=curTab,F=fliser[n];if(!F||!F.length||!FIG)return;const[key]=VALG[n];
    if(DYRK[key]){const P=Object.assign({},PETL);delete P[key];const h=JSON.stringify(P);BILLED.bestil(F.map(({cv,v})=>({cv,h:h+v,fn:()=>BILLED.skydDyr(Object.assign({},PETL,{[key]:v,navn:''}),cv)})));return}
    if(!BILLED.ZONE[n])return;const over=BILLED.ZONE[n][3]||{},L0=Object.assign({},FIG.L,over);delete L0[key];const h=JSON.stringify(L0);
    BILLED.bestil(F.map(({cv,v})=>({cv,h:h+v,fn:()=>BILLED.skyd(n,Object.assign({},FIG.L,over,{[key]:v}),cv)})))};
  UI.draw=()=>{for(const n in VALG){const[key,list]=VALG[n];(fliser[n]||[]).forEach(({b},i)=>{b.setAttribute('aria-pressed',String(valgt(key)===list[i][0]));b.classList.toggle('laas',laast(key,list[i][0]))})}
    for(const{k,row}of rækker){const c=farveNu(k);row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(!!c&&x.dataset.c===String(c).toLowerCase())))}billeder()};
  const show=()=>{const u=UDTAB[curTab]||'hel';if(u!==UD){UD=u;if(UDKLAR)ST.bake()}for(const n in secs)secs[n].classList.toggle('on',n===curTab);
    tabs.querySelectorAll('.kat button').forEach(x=>{x.setAttribute('aria-selected',String(x.dataset.n===curTab));x.hidden=!SIDER[hvem].includes(x.dataset.n)});tabs.querySelectorAll('button.hvem').forEach(x=>{x.setAttribute('aria-pressed',String(x.dataset.hvem===hvem))});
    opts.scrollTop=0;billeder()};
  const fan=document.createElement('div');fan.className='faner';const kat=document.createElement('div');kat.className='kat';kat.setAttribute('role','tablist');tabs.append(fan,kat);
  const IK={heks:'M3 19h18M7 19l4-15 3 6 3 9',dyr:'M7 8a2 2 0 1 0 .1 0M12 5.5a2 2 0 1 0 .1 0M17 8a2 2 0 1 0 .1 0M12 11c-3.5 0-6 3.5-6 6 0 2 2 2.5 3 2s2-.8 3-.8 2 .3 3 .8 3 0 3-2c0-2.5-2.5-6-6-6z'};
  for(const[id,navn,tab]of[['heks','Heksen','Tøj'],['dyr','Kæledyret','Dyr']]){const hb=document.createElement('button');hb.type='button';hb.className='hvem';hb.dataset.hvem=id;hb.innerHTML=ikon(IK[id],2.4)+'<span></span>';hb.lastChild.textContent=navn;hb.addEventListener('click',()=>{if(hvem===id)return;if(typeof LYD!=='undefined')LYD.valg();hvem=id;curTab=tab;show()});fan.appendChild(hb)}
  for(const n of[...SIDER.heks,...SIDER.dyr]){const[key,list]=VALG[n],b=document.createElement('button');b.type='button';b.dataset.n=n;b.innerHTML=ikon(IKON[n])+'<span></span>';b.lastChild.textContent=n;b.setAttribute('role','tab');b.addEventListener('click',()=>{curTab=n;show()});kat.appendChild(b);
    const sec=document.createElement('section'),h=document.createElement('h3'),gr=document.createElement('div');h.textContent=n;gr.className='grid';sec.append(h,gr);opts.appendChild(sec);secs[n]=sec;fliser[n]=[];
    /* kæledyrets navn (originalens M3): et felt øverst under Dyr, skrevet på spillets eget tastatur */
    if(n==='Dyr'&&typeof SPIL!=='undefined'){const lb=document.createElement('label');lb.className='dyrnavn';lb.textContent='Navn ';const inp=document.createElement('input');inp.maxLength=12;inp.placeholder='giv dit dyr et navn';inp.value=(SPIL.dyr&&SPIL.dyr.navn)||'';inp.setAttribute('inputmode','none');inp.setAttribute('autocomplete','off');
      inp.addEventListener('input',()=>{const v=inp.value.replace(/\s+/g,' ').replace(/^\s/,'');SPIL.dyr.navn=v.charAt(0).toLocaleUpperCase('da')+v.slice(1);SPIL.save()});lb.appendChild(inp);sec.insertBefore(lb,gr);if(typeof FORSIDE!=='undefined'&&FORSIDE.kb)FORSIDE.kb(inp)}
    for(const[v,navn]of list){const ob=document.createElement('button');ob.type='button';ob.className='flise';const cv=document.createElement('canvas');cv.width=cv.height=BILLED.N;const sp=document.createElement('span');sp.textContent=navn;ob.append(cv,sp);ob.setAttribute('aria-label',navn);
      ob.addEventListener('click',()=>{if(laast(key,v)){ctx.say(v==='næbdyr'?'Næbdyret klækker af ægget i Dyreparken. Giv dyreungerne i Ungestalden hjerter, så ægget bliver varmt.':typeof STAVE!=='undefined'&&STAVE[v]?'Den kan du bytte dig til for billetter i Præmiebutikken i Arkaden':'Den kan du få i en boble i Boblebutikken');return}choose(key,v);UI.draw()});gr.appendChild(ob);fliser[n].push({b:ob,cv,v})}
    for(const[fk,farver,navn]of(FLERE[n]||(PALET[key]?[[key,PALET[key],'']]:[]))){const key=fk;const lb=document.createElement('h4');lb.textContent=navn||'Farve';sec.appendChild(lb);const row=document.createElement('div');row.className='sw';row.setAttribute('role','group');row.setAttribute('aria-label',navn||'Farve');sec.appendChild(row);rækker.push({k:key,row});
      for(const c of farver){const sb=document.createElement('button');sb.type='button';sb.style.background=c;sb.dataset.c=c.toLowerCase();sb.setAttribute('aria-label','Farve '+c);sb.setAttribute('aria-pressed','false');sb.addEventListener('click',()=>{if(!FIG)return;if(DYRK[key]){setPet(key,c);UI.draw();return}if(typeof LYD!=='undefined')LYD.valg();FIG.setCol(key,c);FIG.G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});pop=1;if((typeof ctx!=='undefined')&&ctx.onCol)ctx.onCol(key,c);UI.draw();if(key==='øjne')row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===sb)))});row.appendChild(sb)}}}
  show();UI.draw()}
