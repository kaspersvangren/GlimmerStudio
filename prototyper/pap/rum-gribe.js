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
  const KN=[{id:'v',x:-12.4,r:2.4,c:'#2fb3a3'},{id:'h',x:-5,r:2.4,c:'#2fb3a3'},{id:'grib',x:8.2,r:3,c:'#e2384e'}],KY=2.4,TX=23.6,TY=2.4,TR=2.6,DX=-24.6,KAB='#d4584f',KREM='#f4e2bc',KRAFT='#d8b07a',PAN='#3a2a5e';
  let S=null,vogn,kabel,hovedG,bagarm,bagtip,armG=[],urG,kiler=[],klap,vundet=null,nede=null,puls=0;
  /* et splitben (de små messingsøm, der holder papdele sammen i et led) */
  const brad=(par,x,y,z,r=.34)=>{P2(par,circ(x,y,r,r,14),{mat:gold(),t:.16},z);P2(par,box(x-r*.62,y-.045,x+r*.62,y+.045),{color:'#6e4b17',kind:'water',t:.02},z+.1)};
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
    S.arms.forEach(a=>{const G=new THREE.Group(),pts=a.pts.map(p=>[p.x/20,-p.y/20]);for(const q of thick([pts],.62))put(G,piece(q,{color:KRAFT,kind:'kraft',t:.45,edge:'#8a5a28'}),0,0,0);brad(G,pts[0][0],pts[0][1],.3,.3);brad(G,pts[1][0],pts[1][1],.3,.22);G.position.z=2.5;Rm.live.add(G);armG.push(G)});tegnUr()}
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
    vundet=bamseStykke(ctx,p.k,1.35);vundet.position.set(DX,1.6,8.2);vundet.userData.t=0;Rm.live.add(vundet);Rm.burst(DX,2.6,9,14,'rgba(255,236,170,.95)',5);S.slut=`Du vandt en ${b.navn}! Den sidder nu på din seng i Værelset.`}
  /* ---------------- tegningen ---------------- */
  const tegnUr=()=>{const sec=S&&S.phase==='flyt'?S.sec:S&&S.phase==='klar'?LIMIT:S?S.sec:LIMIT;kiler.forEach((k,i)=>{k.visible=i===sec})};
  const tegn=()=>{for(const p of S.plushes){if(p.gone)continue;p.G.position.x=X(p.position.x);p.G.position.y=Y(p.position.y);p.G.rotation.z=-p.angle}
    const H=S.head,a=faeste(),tx=X(S.tx),ty=Y(TOP);vogn.position.x=tx;hovedG.position.set(X(H.position.x),Y(H.position.y),2.2);hovedG.rotation.z=-H.angle;
    const dx=X(a.x)-tx,dy=Y(a.y)-ty;kabel.position.set(tx,ty,2.1);kabel.scale.y=Math.max(.01,Math.hypot(dx,dy));kabel.rotation.z=Math.atan2(dy,dx)-Math.PI/2;
    S.arms.forEach((arm,i)=>{const G=armG[i];G.position.x=X(arm.position.x);G.position.y=Y(arm.position.y);G.rotation.z=-(arm.angle-arm.a0)});
    const bag=(72+30*S.close)/20;bagarm.scale.y=bag;bagtip.position.y=-.85-bag};
  const knapVed=e=>{const p=Rm.planeAt(e,8.2);if(!p)return null;for(const k of KN)if(Math.hypot(p.x-k.x,p.y-KY)<k.r+1.3)return k.id;return null};
  const OPT={bg:'#120810',fit:fitBox(88,50,0,20.5),sky:'#ffe8d0',ground:'#3a2030',amb:.6,key:{col:'#fff0dc',i:1.7,tgt:[0,20,0]},
    drag:(ph,e)=>{if(ph==='start'){nede=knapVed(e);if(nede)hold(nede,true)}else if(ph==='end'){if(nede&&nede!=='grib')hold(nede,false);nede=null}},
    build:Rm=>[()=>{const g=Rm.scene;/* tapetet bag maskinen */
        {const W=box(-80,-8,80,52);P2(g,W,{t:.3,s:8,cap:1800,paint:P=>{P.wash('#34101a',W,{edge:0,clouds:8});for(let y=-6,r=0;y<52;y+=7,r++)for(let x=-78+(r%2?3:0);x<80;x+=6)P.fill(sm([[x,y+2.6],[x+1.6,y+.4],[x,y-2.2],[x-1.6,y+.4]],5),'#4a1a26',.9)}},-14)}
        /* bagvæggen inde i kassen: lilla karton med stjerner klippet i papir og klistret på */
        {const B=box(-29.9,8,29.9,43.9);P2(g,B,{t:.3,s:10,cap:1600,paint:P=>{P.wash('#4a2e66',B,{top:'#2e1c46',edge:.5,clouds:6})}},-5)}
        for(let i=0;i<16;i++){const x=-26+(i%8)*7.4+(i>7?3.7:0)+R(-1,1),y=i>7?25+R(-2,2):35.5+R(-2,2),r=R(.7,1.1);P2(g,starPts(x,y,r,r*.45,R(-.4,.4)),{color:i%3?KREM:'#ffd86b',kind:'card',t:.08},-4.7)}
        Rm.floor(box(-29.9,-4.8,29.9,3.6),{color:'#5a3a76',kind:'card',t:.3},8.3);
        /* skinnen foroven: en træliste med splitben, og to papirslamper */
        P2(g,box(-29.3,40.7,29.3,41.9),{color:'#e8d2a6',kind:'balsa',t:.8},-2.6);for(const x of[-28.4,28.4])brad(g,x,41.3,-2.15,.3);
        /* præmieskakten: en lav kartonkant med et skilt, og en tynd væg ind mod bunken */
        P2(g,box(-29.9,8.2,-19.9,17.5),{color:'#1e1432',kind:'card',t:.1},-4.8);
        P2(g,box(-20.3,8.3,-19.6,17.6),{color:KRAFT,kind:'kraft',t:.5},3);P2(g,box(-29.9,8.3,-19.6,10.4),{color:KRAFT,kind:'kraft',t:.5,edge:'#8a5a28'},3.2);
        P2(g,box(-27,11.6,-22.6,16.4),{color:KREM,kind:'card',t:.12,edge:'#a88a5a'},-4.5);P2(g,toCCW([[-25.3,15.6],[-24.3,15.6],[-24.3,13.6],[-23.3,13.6],[-24.8,12.1],[-26.3,13.6],[-25.3,13.6]]),{color:'#e2384e',kind:'card',t:.06},-4.4);tape(g,-24.8,16.4,-4.35,1.8,.6,.08);
        for(const x of[-27,27]){P2(g,sm([[x-1.5,43.8],[x+1.5,43.8],[x+1.1,42.4],[x-1.1,42.4]],3),{t:.3,mat:paperMat('#fff0c0','tissue',{glow:'#ffc060',gi:1.4})},-2.4);Rm.glow(x,42.6,-3,'#ffd9a0',9);const L=new THREE.PointLight('#ffe0b0',50,60,2);put(g,L,x,40,0)}},
      ()=>{const g=Rm.scene;/* skabet: tyk karton, malet koralrød med stjerner sat med skabelon. Kanterne viser pappet */
        const maling=(p,dir)=>P=>{P.wash(KAB,p,{top:hexOf(shade(KAB,.08)),edge:.3,clouds:6});for(let y=-10,r=0;y<54;y+=4.2,r++)for(let x=-34+(r%2?2.1:0);x<34;x+=4.2)P.fill(starPts(x,y,.55,.24,.2),hexOf(shade(KAB,-.12)),.85)};
        for(const sx of[-1,1]){const p=box(sx>0?29.9:-33.4,6.8,sx>0?33.4:-29.9,52);P2(g,p,{t:2.6,s:10,cap:1400,paint:maling(p)},4);brad(g,sx*31.65,9,5.4);brad(g,sx*31.65,42,5.4)}
        {const p=box(-33.4,43.9,33.4,52);P2(g,p,{t:2.6,s:10,cap:1400,paint:maling(p)},4);tape(g,-30.8,44.2,5.45,2.4,.8,.5);tape(g,30.8,44.2,5.45,2.4,.8,-.5)}
        /* kontrolpanelet: en kartonplade, mørkelilla, med en kant af lys karton foroven */
        {const p=box(-33.4,-9.5,33.4,7.6);P2(g,p,{t:4,s:10,cap:1600,paint:P=>{P.wash(PAN,p,{top:hexOf(shade(PAN,.1)),edge:.3,clouds:6});for(let i=0;i<60;i++)P.fill(circ(R(-33,33),R(-9,6),R(.08,.16),R(.08,.16),6),'#5a4a86',.8)}},6)}
        P2(g,box(-33.4,6,33.4,7.8),{color:KREM,kind:'card',t:.5,edge:'#a88a5a'},8.15);for(const x of[-31.6,-16.4,1,16.4,31.6])brad(g,x,6.9,8.45,.26);
        /* lågen til præmien: et mørkt hul med en kartonkant; selve klappen sidder i det levende lag */
        {const d=box(-28.6,-1.2,-20.6,5.4);P2(g,d,{color:'#140c22',kind:'card',t:.1},8.05);for(const s of ring(d,.55,false))P2(g,s,{color:KRAFT,kind:'kraft',t:.5,edge:'#8a5a28'},8.15)}
        /* hullerne til knapperne, med en ring af lys karton */
        for(const k of KN){P2(g,circ(k.x,KY,k.r+.25,k.r+.25,40),{color:'#120a1c',kind:'card',t:.1},8.05);for(const s of ring(circ(k.x,KY,k.r+.85,k.r+.85,40),.65,false))P2(g,s,{color:KREM,kind:'card',t:.4,edge:'#a88a5a'},8.15);for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;brad(g,k.x+Math.cos(a)*(k.r+.52),KY+Math.sin(a)*(k.r+.52),8.45,.16)}}
        /* sedler på panelet, sat fast med tape */
        plate(g,'gribehold3','Hold pilene nede',FONT.pil,11,1.5,{bg:KREM,fg:'#3a2208',size:.95,x:-8.7,y:6.15,z:8.42});
        plate(g,'gribegrib2','GRIB',FONT.arkade,5,1.5,{bg:KREM,fg:'#c0283e',size:1.15,x:8.2,y:6.15,z:8.42});
        plate(g,'gribepris2','1 ★ pr. tur',FONT.pil,7,1.5,{bg:KREM,fg:'#3a2208',size:.95,x:TX,y:6.15,z:8.42});
        /* tidsskiven: en hvid papskive med 20 streger; den røde kile sidder i det levende lag */
        {const d=circ(TX,TY,TR,TR,48);P2(g,circ(TX,TY,TR+.55,TR+.55,48),{color:KREM,kind:'card',t:.4,edge:'#a88a5a'},8.15);P2(g,d,{t:.3,s:24,paint:P=>{P.wash('#fffaf0',d,{edge:.2});for(let i=0;i<20;i++){const a=Math.PI/2+i/20*TAU,r0=i%5?TR*.84:TR*.72;P.pen([[TX+Math.cos(a)*r0,TY+Math.sin(a)*r0],[TX+Math.cos(a)*TR*.95,TY+Math.sin(a)*TR*.95]],'#3a2208',i%5?.09:.16,.9)}}},8.45)}
      },
      ()=>{const lv=Rm.live;/* vognen, snoren og kloen: karton, splitben og en snor */
        vogn=new THREE.Group();vogn.position.set(X(XMIN),Y(TOP-15),2.2);lv.add(vogn);P2(vogn,box(-1.5,-.9,1.5,.9),{color:KRAFT,kind:'kraft',t:.6,edge:'#8a5a28'},0);for(const sx of[-1,1]){P2(vogn,circ(sx*.85,.9,.42,.42,14),{color:'#e2384e',kind:'card',t:.5},.1);for(const[dx,dy]of[[-.1,.1],[.1,.1],[-.1,-.1],[.1,-.1]])P2(vogn,circ(sx*.85+dx,.9+dy,.05,.05,6),{color:'#7a1a2a',kind:'water',t:.02},.4)}tape(vogn,0,-.2,.35,2.2,.5,0);
        kabel=piece(box(-.08,0,.08,1),{color:'#ead9b5',kind:'water',t:.06});lv.add(kabel);
        hovedG=new THREE.Group();lv.add(hovedG);P2(hovedG,sm([[-1.6,-1.1],[1.6,-1.1],[1.6,1.1],[-1.6,1.1]],3),{color:KRAFT,kind:'kraft',t:.6,edge:'#8a5a28'},0);tape(hovedG,0,.55,.35,3.4,.55,0);
        {const h=[];for(let i=0;i<24;i++){const q=i/24*TAU;h.push([.42*16*Math.pow(Math.sin(q),3)/17,.42*(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q))/17-.2])}P2(hovedG,toCCW(h),{color:'#e2384e',kind:'card',t:.1},.38)}
        for(const sx of[-1,1])brad(hovedG,sx*PIV/20,-.95,.4,.26);
        /* den bagerste arm (den tredje) ses bag bamserne */
        bagarm=piece(box(-.25,-1,.25,0),{color:'#b8905a',kind:'kraft',t:.3});bagarm.position.set(0,-.85,-4.4);hovedG.add(bagarm);bagtip=new THREE.Group();bagtip.position.set(0,-4.5,-4.4);hovedG.add(bagtip);P2(bagtip,toCCW([[-.25,.1],[.25,.1],[.1,-.2],[-.5,-.45],[-.6,-.2]]),{color:'#b8905a',kind:'kraft',t:.3},0);
        /* knapperne: tre lag papskiver, der trykkes ned i hullet. Pilene og stjernen er klippet i lyst papir */
        for(const k of KN){const G=new THREE.Group();G.position.set(k.x,KY,8.1);lv.add(G);k.G=G;const T=new THREE.Group();G.add(T);k.T=T;
          P2(T,circ(0,0,k.r,k.r,40),{color:hexOf(shade(k.c,-.28)),kind:'card',t:.7},.35);P2(T,circ(0,.08,k.r*.9,k.r*.9,40),{color:k.c,kind:'card',t:.6},1);P2(T,circ(-k.r*.34,k.r*.36,k.r*.2,k.r*.13,16),{color:hexOf(shade(k.c,.3)),kind:'card',t:.04},1.32);
          const sy=k.id==='grib'?starPts(0,0,k.r*.55,k.r*.24,0):(d=>[[-1.6,0],[-.15,1.35],[-.15,.55],[1.5,.55],[1.5,-.55],[-.15,-.55],[-.15,-1.35]].map(([x,y])=>[x*d*k.r/3.4,y*k.r/3.4]))(k.id==='v'?1:-1);
          P2(T,toCCW(sy.map(([x,y])=>[x,y+.06])),{color:'#fff4dc',kind:'card',t:.12,edge:hexOf(shade(k.c,-.45))},1.36)}
        /* tidsskivens røde kile: én for hvert sekund, så den bare skal vises */
        urG=new THREE.Group();urG.position.set(TX,TY,8.62);lv.add(urG);for(let n=0;n<=LIMIT;n++){const G=new THREE.Group();if(n>0){const p=[[0,0]];for(let i=0;i<=Math.max(2,n*2);i++){const a=Math.PI/2+i/Math.max(2,n*2)*TAU*n/LIMIT;p.push([Math.cos(a)*TR*.7,Math.sin(a)*TR*.7])}P2(G,toCCW(p),{color:'#e2384e',kind:'card',t:.08},0)}G.visible=false;urG.add(G);kiler.push(G)}brad(urG,0,0,.12,.42);
        /* klappen foran præmien: hængslet foroven med to splitben */
        klap=new THREE.Group();klap.position.set(DX,5.4,8.3);lv.add(klap);plate(klap,'gribeklap3','PRÆMIE',FONT.arkade,7.4,6.4,{bg:KRAFT,fg:'#7a3a1a',size:1.2,x:0,y:-6.4,z:.1});P2(klap,starPts(0,-5.3,.7,.32,0),{color:'#7a3a1a',kind:'card',t:.04},.32);for(const sx of[-1,1])brad(klap,sx*3.3,-.6,.34,.28);
        fyld();tegn();
        ctx.say(SPIL.stj<1?'Et forsøg koster 1 stjerne. Tjen stjerner i Skolen, og kom tilbage.':'Et forsøg koster 1 stjerne. Hold pilene nede for at køre kloen, og tryk på den røde knap for at gribe.')}],
    tick:(t,dt)=>{if(!S)return;const ph=S.phase;
      if(ph==='flyt'){S.tid+=dt;const sec=Math.ceil(Math.max(0,LIMIT-S.tid));if(sec!==S.sec){S.sec=sec;tegnUr()}if(S.tid>=LIMIT)grib();else if(!LYD.hold('gribe.motor',!!S.dir)&&S.dir){S.hum+=dt;if(S.hum>.16){S.hum=0;LYD.brum()}}}
      S.pt+=dt;
      if(ph==='luk'&&S.close>=1&&S.pt>1.05){S.phase='op';S.pt=0;LYD.hold('gribe.ned',true)}/* kablet ruller op igen: samme lyd som ned */
      else if(ph==='op'&&S.cable.length<=L0+.5){S.phase='hjem';S.pt=0;LYD.hold('gribe.ned',false);LYD.hold('gribe.motor',true);if(S.carried)LYD.pip()}
      else if(ph==='hjem'&&Math.abs(S.tx-XMIN)<1&&Math.abs(S.vx)<5&&S.pt>.3){S.phase='slip';S.pt=0;LYD.hold('gribe.motor',false);LYD.fil('gribe.slip',()=>LYD.plop())}
      else if(ph==='slip'&&S.pt>.4){S.phase='efter';S.pt=0}
      else if(ph==='efter'&&(S.wonP||S.pt>(S.carried?2.2:.6))&&!S.ended){S.ended=true;if(!S.wonP)tabt()}
      if(S.ended&&!S.vist){S.endT-=dt;if(S.endT<=0){S.vist=true;ctx.vent(S.slut,nulstil)}}
      if(ph==='klar'){if(S.uro>0)S.uro-=dt}
      if(ph!=='klar'||S.uro>0){S.acc+=dt;while(S.acc>=STEP){S.acc-=STEP;skridt(STEP)}}
      tegn();puls+=dt;
      for(const k of KN){const ned=nede===k.id||(k.id!=='grib'&&S.phase==='flyt'&&((k.id==='v'&&S.dir<0)||(k.id==='h'&&S.dir>0))),maal=ned?-.75:0;k.T.position.z+=(maal-k.T.position.z)*Math.min(1,dt*30);const venter=k.id==='grib'?S.phase==='flyt':S.phase==='klar'||S.phase==='flyt';k.T.scale.setScalar(ned?.96:venter&&k.id==='grib'?1+.03*Math.sin(puls*6):1)}
      urG.rotation.z=S.phase==='flyt'&&S.sec<=5?Math.sin(puls*30)*.05:0;klap.rotation.x+=((vundet?-1.25:0)-klap.rotation.x)*Math.min(1,dt*8);
      if(vundet){vundet.userData.t+=dt;const k=Math.min(1,vundet.userData.t/.4);vundet.position.y=1.6-2*(1-k)*(1-k);vundet.rotation.z=.08*Math.sin(t*2)}}},Rm=makeRoom(ctx,OPT);
  /* tastaturet, som i originalen: piletaster og mellemrum */
  const kd=e=>{if(e.key==='ArrowLeft'){hold('v',true);e.preventDefault()}else if(e.key==='ArrowRight'){hold('h',true);e.preventDefault()}else if(e.key===' '||e.key==='Enter'){if(!e.repeat)hold('grib',true);e.preventDefault()}},ku=e=>{if(e.key==='ArrowLeft')hold('v',false);else if(e.key==='ArrowRight')hold('h',false)};
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  ctx.efter.push(()=>{removeEventListener('keydown',kd);removeEventListener('keyup',ku);LYD.hold('gribe.motor',false);LYD.hold('gribe.ned',false);if(S){try{Matter.Engine.clear(S.eng)}catch(e){}}S=null;bamseRyd()});
  ctx.test={S:()=>S,hold,grib,nulstil,spol:s=>{for(let i=0;i<s*25;i++)OPT.tick(Rm.t+i*.04,.04)},sigtPaa:()=>{const p=S.plushes.filter(q=>!q.gone).sort((a,b)=>a.position.y-b.position.y)[0];return p&&p.position.x},saetGreb:g=>{S.grip=g},
    tilstand:()=>S&&{x:Math.round(S.tx),fase:S.phase,aaben:+(1-S.close).toFixed(2),greb:+S.grip.toFixed(4),baaret:S.carried,vandt:S.wonP&&S.wonP.k,len:Math.round(S.cable.length),bamser:S.plushes.filter(p=>!p.gone).length,tid:+S.tid.toFixed(1)}}};
