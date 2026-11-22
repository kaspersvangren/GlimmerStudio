/* ============ Gribemaskinen (Arkaden) ============
   Som i det oprindelige spil: man står helt tæt på maskinen. Bamserne ligger i en bunke på bunden, kloen hænger i en wire fra en vogn i skinnen foroven,
   og præmieskakten er i venstre hjørne. Et forsøg koster 1 stjerne, og man har 20 sekunder til at stille kloen, så griber den af sig selv.
   Alt er rigtig fysik (matter-js, samme tal som originalen): bamserne er bløde kroppe med hoved og mave, kloen hænger i en wire og svinger,
   og de to forreste arme lukkes af en fjeder. Om man får fat, afhænger af hvor kloen lander, hvordan bamsen ligger, og hvor stram fjederen er i dag.
   Det er aldrig bestemt på forhånd. Fysikken regner i originalens mål (1600 × 1000, y nedad); tegningen regner om til rummets mål (20 til 1).
   Bunken bliver liggende mellem forsøgene, så længe man står ved maskinen. Vundne bamser gemmes (SPIL.data.bamser) og sidder på sengen i Værelset. */
ROOMS.gribe=function(ctx){
  if(typeof Matter==='undefined'){ctx.fail('Gribemaskinen kunne ikke hente sin mekanik. Prøv igen om lidt.');return}
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),X=x=>(x-800)/20,Y=y=>45.5-y/20,BR='#c9973e',BRd='#6e4b17',BRl='#f2d58a';
  const TOP=96,FLOOR=740,XMIN=312,XMAX=1316,LIMIT=20,WALL_L=212,WALL_R=1388,CHUTE_X=404,CHUTE_TOP=560,SC=1.25,CAT_WALL=1,CAT_PLUSH=2,CAT_CLAW=4,STEP=1/120;
  const PIV=20,ARM=[[0,0],[22,54],[6,106],[-9,110]],OPEN=-.62,SHUT=.14,ANCHOR_Y=104,L0=90,LMAX=470,HW=62,HH=42;/* højre arm målt fra hængslet; venstre er spejlet */
  const rot=(x,y,a)=>({x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)});
  const KN=[{id:'v',x:-12,r:3.5,glas:'#3fc7b4'},{id:'h',x:-2,r:3.5,glas:'#3fc7b4'},{id:'grib',x:19,r:5,glas:'#e0305a'}],KY=1.7;
  let S=null,vogn,kabel,hovedG,bagarm,bagtip,armG=[],ur,urT,vundet=null,nede=null,puls=0;
  /* ---------------- fysikken ---------------- */
  function byg(){const{Engine,Bodies,Body,Composite,Constraint}=Matter,eng=Engine.create({positionIterations:10,velocityIterations:8,constraintIterations:4});eng.gravity.scale=.0018;
    const wall=(x,y,w,h)=>Bodies.rectangle(x,y,w,h,{isStatic:true,friction:.6,collisionFilter:{category:CAT_WALL}});
    const walls=[wall((CHUTE_X+WALL_R)/2,FLOOR+30,WALL_R-CHUTE_X,60),wall(WALL_L-30,300,60,1200),wall(WALL_R+30,300,60,1200),wall(CHUTE_X+3,(CHUTE_TOP+FLOOR+60)/2,10,FLOOR+60-CHUTE_TOP)];
    /* bamserne: et hoved og en mave, så kloen kan få fat under hovedet. Dem, man ikke har endnu, ligger der dobbelt så mange af */
    const mine=new Set(SPIL.data.bamser||[]),kinds=BAMSER.flatMap(b=>mine.has(b.k)?[b.k]:[b.k,b.k]),plushes=[];
    /* en bunke: bred nederst, højest på midten */
    [[676,15,470,1350],[596,9,590,1230],[516,4,720,1100]].forEach(([y0,n,x0,x1])=>{for(let i=0;i<n;i++){const x=x0+i*(x1-x0)/(n-1)+(Math.random()-.5)*36,y=y0+(Math.random()-.5)*20;
      const b=Body.create({parts:[Bodies.circle(x,y-14*SC,22*SC,{},16),Bodies.circle(x,y+16*SC,21*SC,{},16)],friction:.9,frictionStatic:2,restitution:.05,frictionAir:.012,collisionFilter:{category:CAT_PLUSH}});
      b.off={x:x-b.position.x,y:y-b.position.y};b.k=kinds[Math.floor(Math.random()*kinds.length)];Body.setAngle(b,(Math.random()-.5)*.7);plushes.push(b)}});
    /* kloen: et hoved i en wire og to arme på hængsler. En fjeder (senen) trækker armene sammen */
    const grp=Body.nextGroup(true),cf={group:grp,category:CAT_CLAW,mask:CAT_WALL|CAT_PLUSH},hx=XMIN,hy=ANCHOR_Y+L0+HH/2;
    const head=Bodies.rectangle(hx,hy,HW,HH,{density:.005,frictionAir:.012,friction:.5,chamfer:{radius:6},collisionFilter:cf});
    const cable=Constraint.create({pointA:{x:hx,y:ANCHOR_Y},bodyB:head,pointB:{x:0,y:-HH/2},length:L0,stiffness:.9,damping:.05});
    const arms=[-1,1].map(d=>{const px=hx+d*PIV,py=hy+HH/2-2,parts=[];
      for(let i=0;i<ARM.length-1;i++){const ax=px+d*ARM[i][0],ay=py+ARM[i][1],bx=px+d*ARM[i+1][0],by=py+ARM[i+1][1];parts.push(Bodies.rectangle((ax+bx)/2,(ay+by)/2,Math.hypot(bx-ax,by-ay)+10,11,{angle:Math.atan2(by-ay,bx-ax),chamfer:{radius:4},collisionFilter:cf}))}
      const arm=Body.create({parts,friction:.35,frictionStatic:.6,frictionAir:.02,collisionFilter:cf});Body.setDensity(arm,.002);
      arm.pts=ARM.map(([x,y])=>({x:px+d*x-arm.position.x,y:py+y-arm.position.y}));Body.rotate(arm,d*OPEN,{x:px,y:py});arm.a0=arm.angle-d*OPEN;arm.d=d;
      const pivot=Constraint.create({bodyA:head,pointA:{x:d*PIV,y:HH/2-2},bodyB:arm,pointB:{x:px-arm.position.x,y:py-arm.position.y},length:0,stiffness:1}),e=rot(d*ARM[1][0],ARM[1][1],d*OPEN);
      const tendon=Constraint.create({bodyA:head,pointA:{x:d*PIV+e.x,y:HH/2-2+e.y},bodyB:arm,pointB:{x:px+e.x-arm.position.x,y:py+e.y-arm.position.y},length:0,stiffness:.03,damping:.1});arm.tendon=tendon;arm.cons=[pivot,tendon];return arm});
    Composite.add(eng.world,[...walls,...plushes,head,...arms,cable,...arms.flatMap(a=>a.cons)]);return{eng,plushes,head,arms,cable}}
  /* sætter armenes fjeder mod vinklen th (højre arm; venstre spejlet) */
  const sigt=th=>{S.arms.forEach(a=>{const e=rot(a.d*ARM[1][0],ARM[1][1],a.d*th),loc={x:a.d*PIV+e.x,y:HH/2-2+e.y};a.tendon.pointA=rot(loc.x,loc.y,S.head.angle);a.tendon.angleA=S.head.angle;a.tendon.stiffness=S.grip})};
  const faeste=()=>{const p=rot(0,-HH/2,S.head.angle);return{x:S.head.position.x+p.x,y:S.head.position.y+p.y}};
  const greb=()=>.001+Math.random()*.0018;/* fjederen er lidt forskellig fra gang til gang, ligesom på en rigtig maskine */
  /* en ny bunke og en ny klo. Bruges når man kommer ind, og når bunken er ved at være tom */
  function fyld(){if(S){for(const p of S.plushes)if(p.G){Rm.live.remove(p.G);p.G.userData.ryd()}for(const a of armG){Rm.live.remove(a);a.traverse(q=>{if(q.geometry)q.geometry.dispose()})}armG=[];try{Matter.Engine.clear(S.eng)}catch(e){}}
    S=Object.assign(byg(),{tx:XMIN,vx:0,dir:0,close:0,phase:'klar',grip:greb(),acc:0,slack:0,tid:0,sec:LIMIT,pt:0,hum:0,uro:0,carried:false,wonP:null,ended:false,vist:false,endT:0});sigt(OPEN);
    for(let i=0;i<420;i++)Matter.Engine.update(S.eng,STEP*1000);/* bunken falder på plads, før man ser den */
    S.plushes=S.plushes.filter(p=>!(p.position.x<CHUTE_X&&p.position.y>CHUTE_TOP));
    S.plushes.forEach((p,i)=>{p.G=new THREE.Group();const q=bamseStykke(ctx,p.k,SC);q.position.set(p.off.x/20,-p.off.y/20,0);p.G.add(q);p.G.userData.ryd=q.userData.ryd;p.G.position.z=-1.6+i*3.2/S.plushes.length;Rm.live.add(p.G)});
    S.arms.forEach(a=>{const G=new THREE.Group(),pts=a.pts.map(p=>[p.x/20,-p.y/20]);for(const q of thick([pts],.55))put(G,piece(q,{color:'#c8c4d8',kind:'water',t:.3,edge:'#3a3458'}),0,0,0);G.position.z=2.5;Rm.live.add(G);armG.push(G)});tegnUr()}
  const betal=()=>{if(SPIL.stj<1){ctx.say('Et forsøg koster 1 stjerne. Tjen stjerner i Skolen, og kom tilbage.');LYD.oev();return false}SPIL.giv(-1);S.phase='flyt';S.tid=0;S.sec=LIMIT;S.pt=0;if(vundet){Rm.live.remove(vundet);vundet.userData.ryd();vundet=null}tegnUr();return true};
  const grib=()=>{if(!S||S.phase!=='flyt')return;S.phase='ned';S.dir=0;S.slack=0;LYD.hold('gribe.motor',false);if(!LYD.hold('gribe.ned',true))LYD.pust();tegnUr()};
  const hold=(b,on)=>{if(!S)return;if(on&&S.phase==='klar'){if(!betal()||b==='grib')return}if(S.phase!=='flyt')return;if(b==='grib'){if(on)grib();return}S.dir=on?(b==='v'?-1:1):0};
  /* ét fast fysik-skridt (1/120 s) */
  function skridt(h){const ph=S.phase,c=S.cable;
    /* vognen i skinnen kører med træghed; kloen hænger efter og svinger */
    let want=0;if(ph==='flyt')want=S.dir*380;else if(ph==='hjem'||ph==='klar')want=Math.max(-360,Math.min(360,(XMIN-S.tx)*3));
    const acc=1300*h;S.vx+=Math.max(-acc,Math.min(acc,want-S.vx));S.tx+=S.vx*h;if(S.tx<XMIN){S.tx=XMIN;S.vx=0}if(S.tx>XMAX){S.tx=XMAX;S.vx=0}c.pointA.x=S.tx;
    /* wiren er et reb: den kan trække, men ikke skubbe */
    const a=faeste(),dist=Math.hypot(a.x-S.tx,a.y-ANCHOR_Y);
    if(ph==='ned'){c.length=Math.min(LMAX,c.length+260*h,dist+24);/* står kloen på bunken, bliver wiren slap */
      if(dist<c.length-6&&S.head.velocity.y<.25)S.slack+=h;else S.slack=0;
      if(S.slack>.1||c.length>=LMAX){c.length=Math.min(c.length,dist+2);S.phase='luk';S.pt=0;LYD.hold('gribe.ned',false);LYD.klo()}}
    else if(ph==='op')c.length=Math.max(L0,c.length-200*h);
    c.stiffness=dist>c.length-.5?.9:.000001;
    if(ph==='luk')S.close=Math.min(1,S.close+h/.7);if(ph==='slip'||ph==='efter'||ph==='klar')S.close=Math.max(0,S.close-h/.3);
    sigt(OPEN+(SHUT-OPEN)*S.close);Matter.Engine.update(S.eng,h*1000);
    /* er en bamse røget ned i skakten? */
    for(const p of S.plushes){if(p.gone)continue;if(p.position.x<CHUTE_X&&p.position.y>FLOOR+50){p.gone=true;Matter.Composite.remove(S.eng.world,p);Rm.live.remove(p.G);p.G.userData.ryd();if(!S.wonP){S.wonP=p;vandt(p)}}
      if((ph==='op'||ph==='hjem')&&p.position.y<470)S.carried=true}}
  const nulstil=()=>{if(!S)return;if(S.plushes.filter(p=>!p.gone).length<12)fyld();else Object.assign(S,{phase:'klar',ended:false,vist:false,carried:false,wonP:null,tid:0,sec:LIMIT,grip:greb(),uro:2.5,dir:0,endT:0});tegnUr()};
  function tabt(){LYD.oev();LOG.row('gribe',{vandt:null,baaret:S.carried});S.endT=.4;S.slut=S.carried?'Næsten! Bamsen gled ud af kloen. Så tæt på!':'Øv! Kloen fik ikke ordentligt fat. Prøv at ramme midt over en bamse.'}
  function vandt(p){const b=BAMSER.find(x=>x.k===p.k);(SPIL.data.bamser=SPIL.data.bamser||[]).push(p.k);SPIL.save();LOG.row('gribe',{vandt:p.k,antal:SPIL.data.bamser.length});LYD.fanfare();S.ended=true;S.endT=1.1;
    vundet=bamseStykke(ctx,p.k,1.35);vundet.position.set(-24.6,.2,8.4);vundet.userData.t=0;Rm.live.add(vundet);Rm.burst(-24.6,1.4,9,14,'rgba(255,236,170,.95)',5);S.slut=`Du vandt en ${b.navn}! Den sidder nu på din seng i Værelset.`}
  /* ---------------- tegningen ---------------- */
  const tegnUr=()=>{const g=ur.getContext('2d'),f=S&&S.phase==='flyt'?Math.max(0,1-S.tid/LIMIT):S&&S.phase==='klar'?1:0;g.clearRect(0,0,160,160);g.fillStyle='#160e2c';g.beginPath();g.arc(80,80,78,0,TAU);g.fill();g.strokeStyle='#3a2e5a';g.lineWidth=10;g.beginPath();g.arc(80,80,64,0,TAU);g.stroke();
    if(f>0){g.strokeStyle=f<.26?'#ff6a5a':'#ffd86b';g.beginPath();g.arc(80,80,64,-Math.PI/2,-Math.PI/2+TAU*f);g.stroke()}g.fillStyle='#ffe9a0';g.textAlign='center';g.textBaseline='middle';g.font=FONT.arkade.replace('X','62px');g.fillText(S&&S.phase==='flyt'?String(S.sec):S&&S.phase==='klar'?'20':'',80,86);urT.needsUpdate=true};
  const tegn=()=>{for(const p of S.plushes){if(p.gone)continue;p.G.position.x=X(p.position.x);p.G.position.y=Y(p.position.y);p.G.rotation.z=-p.angle}
    const H=S.head,a=faeste(),tx=X(S.tx),ty=Y(TOP);vogn.position.x=tx;hovedG.position.set(X(H.position.x),Y(H.position.y),2.2);hovedG.rotation.z=-H.angle;
    const dx=X(a.x)-tx,dy=Y(a.y)-ty;kabel.position.set(tx,ty,2.1);kabel.scale.y=Math.max(.01,Math.hypot(dx,dy));kabel.rotation.z=Math.atan2(dy,dx)-Math.PI/2;
    S.arms.forEach((arm,i)=>{const G=armG[i];G.position.x=X(arm.position.x);G.position.y=Y(arm.position.y);G.rotation.z=-(arm.angle-arm.a0)});
    const bag=(72+30*S.close)/20;bagarm.scale.y=bag;bagtip.position.y=-.85-bag};
  const knapVed=e=>{const p=Rm.planeAt(e,8.2);if(!p)return null;for(const k of KN){const rx=k.r+1,ry=k.r*.55+1.4;if(((p.x-k.x)/rx)**2+((p.y-KY)/ry)**2<1)return k.id}return null};
  const OPT={bg:'#120810',fit:fitBox(88,50,0,20.5),sky:'#ffe8d0',ground:'#3a2030',amb:.6,key:{col:'#fff0dc',i:1.7,tgt:[0,20,0]},
    drag:(ph,e)=>{if(ph==='start'){nede=knapVed(e);if(nede)hold(nede,true)}else if(ph==='end'){if(nede&&nede!=='grib')hold(nede,false);nede=null}},
    build:Rm=>[()=>{const g=Rm.scene;/* tapetet bag maskinen */
        {const W=box(-80,-8,80,52);P2(g,W,{t:.3,s:8,cap:1800,paint:P=>{P.wash('#34101a',W,{edge:0,clouds:8});for(let y=-6,r=0;y<52;y+=7,r++)for(let x=-78+(r%2?3:0);x<80;x+=6)P.fill(sm([[x,y+2.6],[x+1.6,y+.4],[x,y-2.2],[x-1.6,y+.4]],5),'#4a1a26',.9)}},-14)}
        /* bagvæggen og bunden i glaskassen */
        {const B=box(-29.9,8,29.9,43.9);P2(g,B,{t:.3,s:10,cap:1600,paint:P=>{P.wash('#4a2e58',B,{top:'#2a1a3a',edge:.5,clouds:6});for(let i=0;i<110;i++){const r=R(.1,.2);P.fill(circ(R(-29,29),R(9,43),r,r,8),'#5a3a68',.9)}}},-5)}
        Rm.floor(box(-29.9,-4.8,29.9,3.6),{color:'#2a1a3a',kind:'water',t:.3},8.3);
        /* skinnen foroven */
        P2(g,box(-29.3,40.7,29.3,42),{color:'#8a8aa8',kind:'water',t:.8,edge:'#3a3458'},-2.6);P2(g,box(-29,41.25,29,41.45),{color:'#c8c4d8',kind:'water',t:.1},-2.1);
        /* præmieskakten */
        P2(g,box(-29.9,8.2,-19.9,17.5),{color:'#140c2a',kind:'water',t:.1},-4.8);plate(g,'gribepraemie','PRÆMIE',FONT.arkade,7.4,1.8,{bg:'#140c2a',fg:'#ffd36e',size:1.25,x:-24.8,y:13.4,z:-4.6});P2(g,toCCW([[-25.6,11.6],[-24,11.6],[-24.8,10.2]]),{color:'#ffd36e',kind:'water',t:.05},-4.6);
        for(const x of[-27,27]){Rm.glow(x,42.6,-3,'#ffd9a0',9);const L=new THREE.PointLight('#ffe0b0',50,60,2);put(g,L,x,40,0)}},
      ()=>{const g=Rm.scene;/* skabet: mahogni med messinglister, foran glasset */
        for(const sx of[-1,1]){const p=box(sx>0?29.9:-33,6.8,sx>0?33:-29.9,52);P2(g,p,{t:2.4,s:10,cap:1400,paint:P=>boards(P,null,'#6a3a20',{dir:'v',h:1.6,ink:.25})},4);P2(g,box(sx*31.45-.16,6.8,sx*31.45+.16,52),{mat:gold(),t:.3},5.3)}
        {const p=box(-33,43.9,33,52);P2(g,p,{t:2.4,s:10,cap:1400,paint:P=>boards(P,null,'#6a3a20',{dir:'h',h:1.6,ink:.25})},4);P2(g,box(-29.9,43.7,29.9,44.1),{mat:gold(),t:.3},5.3)}
        /* kontrolpanelet: et gammelt panel i mahogni og messing */
        {const p=box(-33,-9,33,7);P2(g,p,{t:4,s:10,cap:1600,paint:P=>{boards(P,null,'#7a3a22',{dir:'h',h:1.6,ink:.3});P.wash('#2e110a',box(-34,-9,34,-3),{alpha:.35,edge:0,mode:'source-over'})}},6)}
        P2(g,box(-33,6,33,7),{mat:gold(),t:.4},8.1);for(let x=-31.5;x<33;x+=3.5)P2(g,circ(x,6.5,.2,.2,8),{color:BRl,kind:'water',t:.2},8.3);
        /* tandhjul som pynt */
        for(const[cx,cy,r,n,a0]of[[6.5,2.5,1.7,10,.2],[9.25,.25,1.1,8,.5],[30,-4,1.3,9,0]]){const tp=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU+a0,rr=i%2?r:r*1.18;tp.push([cx+Math.cos(a-.09)*rr,cy+Math.sin(a-.09)*rr],[cx+Math.cos(a+.09)*rr,cy+Math.sin(a+.09)*rr])}P2(g,toCCW(tp),{mat:gold(),t:.3},8.1);P2(g,circ(cx,cy,r*.45,r*.45,14),{color:'#3a1a0c',kind:'water',t:.34},8.12);P2(g,circ(cx,cy,r*.16,r*.16,8),{color:BRl,kind:'water',t:.38},8.14)}
        /* lågen, hvor den vundne bamse kommer ud */
        {const d=box(-29,-3.2,-20.2,5.2);P2(g,d,{color:'#140c2a',kind:'water',t:.1},8.05);for(const s of ring(d,.4,false))P2(g,s,{mat:gold(),t:.4},8.1);P2(g,box(-28.4,4.2,-20.8,4.4),{color:'#3a2e5a',kind:'water',t:.05},8.12)}
        /* knapperne: en messingring om et hul; kuplen af farvet glas ligger i det levende lag, så den kan trykkes ned */
        for(const k of KN){P2(g,circ(k.x,KY-.8,k.r+.8,(k.r+.8)*.55,30),{color:'#1a0804',kind:'water',t:.05},8.05);P2(g,circ(k.x,KY-.4,k.r+.7,(k.r+.7)*.55,30),{mat:gold(),t:.3},8.1);for(let i=0;i<8;i++){const a=i/8*TAU;P2(g,circ(k.x+Math.cos(a)*(k.r+.35),KY-.4+Math.sin(a)*(k.r+.35)*.55,.15,.15,8),{color:BRl,kind:'water',t:.34},8.12)}P2(g,circ(k.x,KY-.5,k.r,k.r*.55,28),{color:'#120604',kind:'water',t:.36},8.12)}
        plate(g,'gribehold','Hold pilene nede',FONT.pil,13,1.9,{bg:'#d8b060',fg:'#3a2208',frame:'gold',size:1.15,x:-7,y:-2.45,z:8.3});
        /* uret: en messingring; tallet står i det levende lag */
        for(const s of ring(circ(28.3,KY,2.7,2.7,30),.5,false))P2(g,s,{mat:gold(),t:.4},8.1)},
      ()=>{const lv=Rm.live;/* vognen, wiren og kloen */
        vogn=new THREE.Group();vogn.position.set(X(XMIN),Y(TOP-15),2.2);lv.add(vogn);P2(vogn,box(-1.3,-.85,1.3,.85),{color:'#6a6480',kind:'water',t:.5,edge:'#2a2440'},0);for(const sx of[-1,1])P2(vogn,circ(sx*.8,.75,.3,.3,10),{color:'#c8c4d8',kind:'water',t:.56},0);
        kabel=piece(box(-.1,0,.1,1),{color:'#c8c4d8',kind:'water',t:.05});lv.add(kabel);
        hovedG=new THREE.Group();lv.add(hovedG);P2(hovedG,sm([[-1.55,-1.05],[1.55,-1.05],[1.55,1.05],[-1.55,1.05]],3),{color:'#8a8aa8',kind:'water',t:.5,edge:'#2a2440'},0);P2(hovedG,box(-1.25,.5,1.25,.8),{color:'#b8b6cc',kind:'water',t:.1},.3);
        put(hovedG,piece(circ(0,-.1,.26,.26,10),{t:.1,mat:paperMat('#ffffff','tissue',{glow:'#e0457a',gi:1.6})}),0,0,.32);for(const sx of[-1,1])P2(hovedG,circ(sx*PIV/20,-.95,.28,.28,10),{color:'#6a6480',kind:'water',t:.1},.34);
        /* den bagerste arm (den tredje) ses bag bamserne */
        bagarm=piece(box(-.22,-1,.22,0),{color:'#8a84a0',kind:'water',t:.2});bagarm.position.set(0,-.85,-4.4);hovedG.add(bagarm);bagtip=new THREE.Group();bagtip.position.set(0,-4.5,-4.4);hovedG.add(bagtip);P2(bagtip,toCCW([[-.22,.1],[.22,.1],[.1,-.2],[-.5,-.45],[-.6,-.2]]),{color:'#8a84a0',kind:'water',t:.2},0);
        /* glasset: genskin, og præmieskaktens plexiglas */
        {const c=cv(1188,712),q=c.getContext('2d');q.fillStyle='rgba(255,255,255,.07)';for(const pts of[[[34,4],[174,4],[34,264]],[[854,4],[934,4],[654,708],[584,708]]]){q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.fill()}
          q.strokeStyle='rgba(221,239,255,.75)';q.lineCap='round';q.lineWidth=7;q.beginPath();q.moveTo(198,524);q.lineTo(198,710);q.stroke();q.lineWidth=5;q.beginPath();q.moveTo(8,524);q.lineTo(198,524);q.stroke();q.fillStyle='rgba(180,220,255,.08)';q.fillRect(8,524,190,188);
          const m=new THREE.Mesh(new THREE.PlaneGeometry(59.4,35.6),new THREE.MeshBasicMaterial({map:tx(c,true),transparent:true,depthWrite:false,toneMapped:false}));m.position.set(0,Y(36+356),3.4);m.userData.noShadow=true;lv.add(m)}
        /* kuplerne på knapperne */
        for(const k of KN){const G=new THREE.Group();G.position.set(k.x,KY,8.3);lv.add(G);k.G=G;P2(G,circ(0,-.35,k.r-.2,(k.r-.2)*.55,28),{color:BRd,kind:'water',t:.1},0);k.lys=paperMat(k.glas,'water',{glow:k.glas,gi:.5}).clone();put(G,piece(circ(0,0,k.r-.3,(k.r-.3)*.55,28),{t:.12,mat:k.lys}),0,0,.1);
          P2(G,circ(-k.r*.3,k.r*.2,k.r*.28,k.r*.1,12),{color:'#ffffff',kind:'water',t:.02},.2);
          if(k.id==='grib')P2(G,starPts(0,-.05,1.5,.68,0).map(([x,y])=>[x,y*.6]),{color:'#ffe9a8',kind:'water',t:.03},.22);else{const d=k.id==='v'?1:-1;P2(G,toCCW([[d*1.1,.55],[-d*1.3,0],[d*1.1,-.55]]),{color:'#06302c',kind:'water',t:.03},.22)}}
        /* uret */
        ur=cv(160,160);urT=tx(ur,true);{const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,4.6),new THREE.MeshBasicMaterial({map:urT,transparent:true,toneMapped:false}));m.position.set(28.3,KY,8.2);m.userData.noShadow=true;lv.add(m)}
        fyld();tegn();
        ctx.say(SPIL.stj<1?'Et forsøg koster 1 stjerne. Tjen stjerner i Skolen, og kom tilbage.':'Et forsøg koster 1 stjerne. Hold pilene nede for at køre kloen, og tryk på den røde knap for at gribe.')}],
    tick:(t,dt)=>{if(!S)return;const ph=S.phase;
      if(ph==='flyt'){S.tid+=dt;const sec=Math.ceil(Math.max(0,LIMIT-S.tid));if(sec!==S.sec){S.sec=sec;tegnUr()}if(S.tid>=LIMIT)grib();else if(!LYD.hold('gribe.motor',!!S.dir)&&S.dir){S.hum+=dt;if(S.hum>.16){S.hum=0;LYD.brum()}}}
      S.pt+=dt;
      if(ph==='luk'&&S.close>=1&&S.pt>1.05){S.phase='op';S.pt=0;LYD.hold('gribe.ned',true)}/* kablet ruller op igen: samme lyd som ned */
      else if(ph==='op'&&S.cable.length<=L0+.5){S.phase='hjem';S.pt=0;LYD.hold('gribe.ned',false);LYD.hold('gribe.motor',true);if(S.carried)LYD.pip()}
      else if(ph==='hjem'&&Math.abs(S.tx-XMIN)<1&&Math.abs(S.vx)<5&&S.pt>.3){S.phase='slip';S.pt=0;LYD.hold('gribe.motor',false);LYD.plop()}
      else if(ph==='slip'&&S.pt>.4){S.phase='efter';S.pt=0}
      else if(ph==='efter'&&(S.wonP||S.pt>(S.carried?2.2:.6))&&!S.ended){S.ended=true;if(!S.wonP)tabt()}
      if(S.ended&&!S.vist){S.endT-=dt;if(S.endT<=0){S.vist=true;ctx.vent(S.slut,nulstil)}}
      if(ph==='klar'){if(S.uro>0)S.uro-=dt}
      if(ph!=='klar'||S.uro>0){S.acc+=dt;while(S.acc>=STEP){S.acc-=STEP;skridt(STEP)}}
      tegn();puls+=dt;
      for(const k of KN){const ned=nede===k.id||(k.id!=='grib'&&S.phase==='flyt'&&((k.id==='v'&&S.dir<0)||(k.id==='h'&&S.dir>0)));k.G.position.y+=((ned?KY-.3:KY)-k.G.position.y)*Math.min(1,dt*30);k.lys.emissiveIntensity=k.id==='grib'?(S.phase==='flyt'?.7+.35*Math.sin(puls*6):S.phase==='klar'?.5+.2*Math.sin(puls*2.4):.15):(S.phase==='flyt'||S.phase==='klar'?ned?.9:.45:.12)}
      if(vundet){vundet.userData.t+=dt;const k=Math.min(1,vundet.userData.t/.4);vundet.position.y=.2-2*(1-k)*(1-k);vundet.rotation.z=.08*Math.sin(t*2)}}},Rm=makeRoom(ctx,OPT);
  /* tastaturet, som i originalen: piletaster og mellemrum */
  const kd=e=>{if(e.key==='ArrowLeft'){hold('v',true);e.preventDefault()}else if(e.key==='ArrowRight'){hold('h',true);e.preventDefault()}else if(e.key===' '||e.key==='Enter'){if(!e.repeat)hold('grib',true);e.preventDefault()}},ku=e=>{if(e.key==='ArrowLeft')hold('v',false);else if(e.key==='ArrowRight')hold('h',false)};
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  ctx.efter.push(()=>{removeEventListener('keydown',kd);removeEventListener('keyup',ku);LYD.hold('gribe.motor',false);LYD.hold('gribe.ned',false);if(S){try{Matter.Engine.clear(S.eng)}catch(e){}}S=null;bamseRyd()});
  ctx.test={S:()=>S,hold,grib,nulstil,spol:s=>{for(let i=0;i<s*25;i++)OPT.tick(Rm.t+i*.04,.04)},sigtPaa:()=>{const p=S.plushes.filter(q=>!q.gone).sort((a,b)=>a.position.y-b.position.y)[0];return p&&p.position.x},saetGreb:g=>{S.grip=g},
    tilstand:()=>S&&{x:Math.round(S.tx),fase:S.phase,aaben:+(1-S.close).toFixed(2),greb:+S.grip.toFixed(4),baaret:S.carried,vandt:S.wonP&&S.wonP.k,len:Math.round(S.cable.length),bamser:S.plushes.filter(p=>!p.gone).length,tid:+S.tid.toFixed(1)}}};
