/* ============ Faldskærm (Skolen) ============
   Som i det oprindelige spil, men i pap: man ser alt lige oppefra, og dybden er rigtig dybde.
   - Kaptajn Sky spørger, om hun er klar. Så flyver hun på kosten kæmpe højt op fra skolen, set fra siden som i kosteløbet (Kaspers ønske 12. nov.),
     med faldskærmen på ryggen, og springer af. Den del er ikke interaktiv; et tryk springer frem til springet.
   - Frit fald i 17 sekunder: hun ligger på maven med armene ude, og man trækker hende rundt med fingeren. Stjernebobler stiger op nedefra
     mod en stiplet ring, der viser, hvor de når op; en guldboble (hver sjette) er 3 værd. Tordenskyer koster en boble, skyer suser forbi.
   - Skærmen folder sig ud. Så er der et håndtag i hver side: træk det ene ned for at dreje, skub det andet op samtidig for at dreje skarpere,
     begge ned bremser, begge op giver fart. Bremser man lige før jorden, bliver landingen blød.
   - Point efter afstand til midten af målet (ringe på 2, 6, 12 og 20 m giver 5, 3, 2 og 1 stjerne), plus en stjerne pr. fire bobler
     og en for blød landing, mindst 1. Dammen giver et plask. Fra tredje spring er der vind.
   Tallene er originalens: den regner i dens skærm (1600 × 1000, y nedad) og i meter på jorden. Her bliver det til rummets mål (K pr. punkt). */
ROOMS.fald=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),K=88/1600,CD=150;
  const SCX=800,SCY=500,FREE_T=17,TA=2.6,ALT0=3000,ALT1=1000,BX0=170,BX1=1430,BY0=170,BY1=830,H0=160,FOCAL=720,CAM_UP=30,OPEN_T=1.5;
  const RINGS=[2,6,12,20],RING_STARS=[5,3,2,1],POND={x:-64,y:60,rx:22,ry:15},ZG=-430,ZS=400;
  const ppmAt=h=>FOCAL/(CAM_UP+Math.max(0,h)),ease=u=>u*u*(3-2*u);
  /* fra originalens skærm til rummet, og hvor stort noget i en vis dybde skal være for at se ud som i originalen */
  const WX=x=>(x-SCX)*K,WY=y=>-(y-SCY)*K,dyb=z=>(CD-z)/CD;
  const srng=seed=>()=>(seed=(seed*9301+49297)%233280)/233280;
  const L=Object.assign({},ctx.look),hair=(L.hair&&L.hair[0])||'#eab84e',kjole=(L.col&&L.col['tøj'])||'#6a3fa2',kappe=(L.col&&L.col.kappe)||null,hud=L.skin||'#f7d8c4',stoevle=(L.col&&L.col['støvler'])||'#5a3a28';
  let S=null,Rm=null,rod,jord,heltG,helt,skaerm,kost,skygge,dis,puffPlan,hoved,tv,pt,ban,haand={},pil,vindPil,vindsok,landet=null,tal=[],ringe=[];
  const tmpl={};
  /* ---------- figuren i frit fald, set oppefra: maven nedad, armene ude med albuerne bøjet op, benene spredt ---------- */
  function bygHelt(){const G=new THREE.Group(),o=(c,t=.2)=>({color:c,kind:'card',t,edge:hexOf(shade(c,-.35))}),dk=hexOf(shade(kjole,-.3));
    const ben=[];for(const s of[-1,1]){const g=new THREE.Group();G.add(g);g.position.set(s*.9,-2.9,0);
      for(const q of thick([[[0,0],[s*1.7,-2.3],[s*1.5,-4.2]]],.48))P2(g,q,o('#3a2a40'),0);P2(g,toCCW(sm([[s*1.05,-3.7],[s*2.1,-3.9],[s*2,-5.3],[s*1.1,-5.2]],2)),o(stoevle,.3),.05);ben.push(g)}
    {const k=[[-1.9,-1.2],[1.9,-1.2],[2.6,-4],[1.3,-3.6,1],[0,-4.3],[-1.3,-3.6,1],[-2.6,-4]];P2(G,toCCW(sm(k,3)),o(kjole,.25),.1)}
    P2(G,toCCW(sm([[-2,2],[2,2],[1.7,-1.6],[-1.7,-1.6]],3)),o(kjole,.3),.2);
    const arme=[];for(const s of[-1,1]){const g=new THREE.Group();G.add(g);g.position.set(s*1.7,1.4,0);
      for(const q of thick([[[0,0],[s*2.5,-.3],[s*3,2.1]]],.5))P2(g,q,o(kjole),.25);P2(g,circ(s*3.05,2.4,.55,.55,14),o(hud,.25),.3);arme.push(g)}
    if(kappe){const k=[[-1.8,1.9],[1.8,1.9],[2.3,-1.4],[0,-2],[-2.3,-1.4]];P2(G,toCCW(sm(k,3)),o(kappe,.18),.35)}
    /* pakken med skærmen på ryggen, og selerne over skuldrene */
    P2(G,box(-1.35,-1.4,1.35,1.5),{color:'#7a5a3a',kind:'kraft',t:.7,edge:'#4a321e'},.45);P2(G,box(-1.05,1.1,1.05,1.3),{color:'#a8805a',kind:'kraft',t:.06},1.16);
    for(const s of[-1,1])P2(G,box(s*1.6-.18,-1.6,s*1.6+.18,1.9),{color:'#2a2a3a',kind:'card',t:.1},.5);P2(G,box(-1.8,-1.25,1.8,-.95),{color:'#2a2a3a',kind:'card',t:.1},1.2);
    /* håret blafrer op og ud under hjelmen */
    const haar=[];for(let i=0;i<7;i++){const a=-2.3+i*.32+(i>3?1.4:0),g=new THREE.Group();g.position.set(Math.cos(a)*1.05,3.3+Math.sin(a)*1.05,0);g.rotation.z=a+Math.PI/2;G.add(g);
      P2(g,toCCW(sm([[-.28,0],[.28,0],[.4,1.4],[-.1,2.1],[-.35,1.2]],2)),o(i%2?hair:hexOf(shade(hair,-.15)),.12),.55);haar.push(g)}
    P2(G,circ(0,3.3,1.45,1.45,26),o('#e2384e',.5),.7);P2(G,circ(0,3.45,1.05,.95,22),{color:'#f0606e',kind:'card',t:.04},1.21);
    for(const q of thick([[[-1.42,3.1],[-.6,2.15],[.6,2.15],[1.42,3.1]]],.22))P2(G,q,o('#3a2a20',.06),1.22);
    G.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});G.userData={ben,arme,haar};return G}
  /* ---------- kosten, set oppefra ---------- */
  function bygKost(){const G=new THREE.Group();for(const q of thick([[[-9,0],[8,0]]],.32))P2(G,q,{color:'#8a5a3c',kind:'kraft',t:.4,edge:'#4a2e1e'},0);
    P2(G,toCCW(sm([[-8.6,-.5],[-13.2,-1.9],[-14,0],[-13.2,1.9],[-8.6,.5]],3)),{color:'#e9c46a',kind:'card',t:.5,edge:'#8a6420'},-.1);P2(G,box(-9,-.7,-8.2,.7),{color:'#8a2a2a',kind:'card',t:.6},.1);
    G.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});return G}
  /* ---------- skærmen oppefra: en aflang vinge af syv celler, forkanten (+y) åben, og hendes støvler stikker frem bagved ---------- */
  function bygSkaerm(){const G=new THREE.Group(),n=7,W=24,C=8.4,cw=W/n,cols=[kjole,'#fff3e0'];const celler=[];
    for(let i=0;i<n;i++){const x0=-W/2+i*cw,xm=x0+cw/2,bag=-.05*xm*xm/4,c=new THREE.Group();G.add(c);c.position.set(xm,bag,0);
      P2(c,toCCW(sm([[-cw/2-.08,-C/2,1],[cw/2+.08,-C/2,1],[cw/2+.08,C/2-.6],[cw/2-.4,C/2],[-cw/2+.4,C/2],[-cw/2-.08,C/2-.6]],3)),{color:cols[i%2],kind:'card',t:.3,edge:hexOf(shade(cols[i%2],-.35))},0);
      P2(c,toCCW(sm([[-cw/2+.5,C/2-.25],[cw/2-.5,C/2-.25],[cw/2-.7,C/2-1.1],[-cw/2+.7,C/2-1.1]],2)),{color:hexOf(shade(cols[i%2],-.45)),kind:'card',t:.05},.31);
      P2(c,box(-.06,-C/2+.3,.06,C/2-1.2),{color:hexOf(shade(cols[i%2],-.2)),kind:'water',t:.02},.31);celler.push(c)}
    const fod=new THREE.Group();G.add(fod);for(const s of[-1,1])P2(fod,toCCW(sm([[s*.3,-C/2-.2],[s*1.2,-C/2-.2],[s*1.1,-C/2-1.9],[s*.4,-C/2-1.8]],2)),{color:stoevle,kind:'card',t:.3,edge:'#2a1a10'},-.6);
    for(const s of[-1,1])for(const q of thick([[[s*W/2*.92,-C/2+.5],[s*.8,-C/2-1]]],.05))P2(fod,q,{color:'#fffaf0',kind:'water',t:.02},-.3);
    G.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});G.userData={celler,fod};return G}
  /* ---------- jorden: hele landet malet på ét stykke pap, engen ved målet på et andet, og det nære i rigtige lag ---------- */
  function bygJord(J){let r=srng(7);const Y=y=>-y,rot=(pts,x,y,a)=>pts.map(([px,py])=>[x+(px-x)*Math.cos(a)-(py-y)*Math.sin(a),y+(px-x)*Math.sin(a)+(py-y)*Math.cos(a)]);
    const FC=['#6f9a58','#7fab62','#98b468','#b4ba6e','#678f52','#8ab060','#c2b470','#73a46c'];
    const T=box(-4200,-4200,4200,4200);
    const land=(P,r)=>{
      const fields=[],free=(x,y,rr)=>fields.every(f=>Math.hypot(f.x-x,f.y-y)>(f.rr+rr)*.78)&&Math.hypot(x+600,y-430)>330+rr*.6&&Math.hypot(x-240,y-255)>150+rr*.6&&Math.hypot(x,y)>140+rr*.5;
      for(let i=0,tries=0;i<200&&tries<4000;tries++){const a=r()*TAU,d=(i<40?175+r()*420:290+r()*2900),x=Math.cos(a)*d,y=Math.sin(a)*d,w=90+r()*170,h=60+r()*150,ro=(r()*40-20)*Math.PI/180,rr=Math.hypot(w,h)/2;
        if(!free(x,y,rr))continue;fields.push({x,y,rr});i++;const c=FC[i%FC.length],rc=rot(box(x-w/2,y-h/2,x+w/2,y+h/2),x,y,ro);P.fill(rot(box(x-w/2-4,y-h/2-4,x+w/2+4,y+h/2+4),x,y,ro),'#4a6e3c',.9);P.fill(rc,c,.95);
        if(i%4!==3)for(let k=1;k<Math.floor(h/16);k++)P.pen(rot([[x-w/2+6,y-h/2+k*16],[x+w/2-6,y-h/2+k*16]],x,y,ro),hexOf(shade(c,-.14)),3,.5)}
      for(let i=0;i<46;i++){const a=r()*TAU,d=330+r()*2600,cx=Math.cos(a)*d,cy=Math.sin(a)*d;for(let k=0;k<9;k++){const x=cx+(r()-.5)*120,y=cy+(r()-.5)*90,rr=14+r()*14;P.fill(circ(x+rr*.3,y-rr*.35,rr,rr,12),'#20381c',.35);P.fill(circ(x,y,rr,rr,12),r()<.5?'#2f5a36':'#3a6a40',.95)}}
      const riv=curve([[-4200,-640],[-2400,-420],[-1200,-520],[-560,-300],[300,-360],[900,-120],[2400,520],[4200,380]],12);P.pen(riv,'#2e5a7e',54,.95);P.pen(riv,'#5a94c4',40,.95);
      for(const d of[[[230,190],[160,90],[70,50]],[[170,248],[-200,330],[-560,420]],[[-560,420],[-1400,700],[-3200,800]],[[-560,420],[-620,-200],[-900,-900],[-1600,-2600]],[[310,248],[900,300],[1500,200],[3600,-200]]]){const c=curve(d,10);P.pen(c,'#8e7e5e',10,.95);P.pen(c,'#d8c79a',7,.95)}
      const ROOF=['#c0503a','#8a5aaa','#4a6a9a','#b87a4a','#9a3a5a','#6a7a9a'],hus=[];
      for(let i=0,tries=0;i<90&&tries<900;tries++){const a=r()*TAU,d=Math.sqrt(r())*190,x=-600+Math.cos(a)*d*1.3,y=430+Math.sin(a)*d,w=12+r()*10,h=9+r()*6,ro=(r()*30-15)*Math.PI/180;
        if(hus.some(q=>Math.hypot(q.x-x,q.y-y)<(q.rr+Math.hypot(w,h)/2)*.8))continue;hus.push({x,y,rr:Math.hypot(w,h)/2});i++;const c=ROOF[i%ROOF.length];
        P.fill(rot(box(x-w/2+2,y-h/2-2,x+w/2+2,y+h/2-2),x,y,ro),'#1e2a18',.35);P.fill(rot(box(x-w/2,y-h/2,x+w/2,y),x,y,ro),hexOf(shade(c,-.18)),1);P.fill(rot(box(x-w/2,y,x+w/2,y+h/2),x,y,ro),c,1)}
      {const x=170,y=310,w=140,h=110;P.fill(box(x+5,-y-h-6+2*y,x+w+5,-y-6+2*y),'#1e2a18',.3);P.fill(box(x,y-h,x+w,y),'#9a94bc',1);P.fill(box(x+14,y-h+14,x+w-14,y-14),'#7a8a64',1);P.fill(box(x+44,y-62,x+96,y-22),'#6a3a88',1);
        for(const[tx,ty]of[[x,y],[x+w,y],[x,y-h],[x+w,y-h]]){P.fill(circ(tx+4,ty-5,17,17,16),'#1e2a18',.3);P.fill(circ(tx,ty,17,17,16),'#6a3a88',1)}}};
    P2(J,T,{t:.5,s:1,cap:2048,paint:P=>{P.flat('#62904f',T);land(P,srng(7))}},0);
    /* det samme land en gang til, fint malet, i området omkring målet, hvor man kommer tæt på */
    {const N=box(-640,-640,640,640);P2(J,N,{t:.2,s:4,cap:2048,paint:P=>{P.flat('#62904f',N);land(P,srng(7))}},.3)}
    /* engen om målet */
    const E=circ(0,0,124,108,48);P2(J,E,{t:.3,s:16,cap:2048,paint:P=>{P.wash('#74a462',E,{top:'#80ae6a',edge:.4,clouds:6});P.fill(circ(0,0,92,80,40),'#7fb06c',.8);
      for(let i=0;i<420;i++){const a=r()*TAU,d=24+r()*90;P.fill(circ(Math.cos(a)*d,Math.sin(a)*d*.87,.35+r()*.3,.35+r()*.3,6),['#ffe27a','#ffffff','#ff8fc7','#c79bff'][i%4],.9)}
      const sti=curve([[-150,-120],[-90,-60],[-40,-30],[-25,-16]],12);P.pen(sti,'#c9b88a',3.2,.95);for(let i=0;i<14;i++){const p=sti[Math.floor(i/14*sti.length)];P.fill(circ(p[0]+R(-1,1),p[1]+R(-1,1),.5,.4,6),'#a89870',.7)}}},.6);
    /* dammen med åkander og en robåd */
    P2(J,circ(POND.x,Y(POND.y),POND.rx+2,POND.ry+2,36),{color:'#5a8a48',kind:'card',t:.3},.9);P2(J,circ(POND.x,Y(POND.y),POND.rx,POND.ry,36),{color:'#4e86b8',kind:'water',t:.2,edge:'#2e5a7e'},1.2);
    for(const[x,y]of[[-72,54],[-58,66],[-50,56]]){P2(J,circ(x,Y(y),1.6,1.6,12),{color:'#5db866',kind:'card',t:.06},1.45);P2(J,circ(x+.4,Y(y)+.3,.5,.5,8),{color:'#ff8fc7',kind:'card',t:.06},1.55)}
    {const b=new THREE.Group();b.position.set(POND.x+7,Y(POND.y-3),1.5);b.rotation.z=-.5;J.add(b);P2(b,toCCW(sm([[-2.6,0],[0,1.4],[2.6,0],[0,-1.4]],3)),{color:'#8a5a3c',kind:'kraft',t:.6,edge:'#4a2e1e'},0)}
    /* træer i en ring om engen: runde kroner i to lag, der står op fra jorden */
    for(let i=0;i<26;i++){const a=i/26*TAU+r()*.2,d=84+r()*30;if(Math.abs(a-2.4)<.35)continue;const x=Math.cos(a)*d,y=Y(Math.sin(a)*d*.9),rr=4+r()*3.5,c=r()<.5?'#3a6a40':'#467a4a';
      P2(J,circ(x+rr*.35,y-rr*.4,rr,rr,16),{color:'#1e3a1c',kind:'water',t:.02},.65);P2(J,puff(x,y,rr,rr,8,.18),{color:c,kind:'card',t:.4,edge:hexOf(shade(c,-.35))},rr*.7);P2(J,puff(x-rr*.2,y+rr*.2,rr*.6,rr*.6,7,.18),{color:hexOf(shade(c,.15)),kind:'card',t:.3},rr*.95)}
    /* målet: ringe og en guldstjerne i midten, og flag i en ring om det */
    /* ringene ligger side om side som rigtige ringe med hul i, i samme højde, så de ikke ligger oven i hinanden og flimrer på afstand (Kasper 23. nov.: "Målet blinker") */
    const RC=['#f2c14e','#e0457a','#fff3e0','#e0457a'],ann=(r0,r1)=>r0>0?{outer:toCCW(circ(0,0,r1,r1,60)),holes:[toCCW(circ(0,0,r0,r0,60))]}:circ(0,0,r1,r1,60);
    P2(J,ann(RINGS[3],RINGS[3]+1.2),{color:'#fff3e0',kind:'card',t:.2},.9);[0,1,2,3].forEach(i=>P2(J,ann(i?RINGS[i-1]:0,RINGS[i]),{color:RC[i],kind:'card',t:.2,edge:'#2a2340'},.9));P2(J,starPts(0,0,1.5,.65,Math.PI/2),{color:'#fff6d0',kind:'card',t:.2,edge:'#a87a1a'},1.6);
    for(let i=0;i<28;i++){const a=i/28*TAU,c=['#e0457a','#f2c14e','#7fd8ff','#9be36a','#c79bff'][i%5];P2(J,toCCW([[Math.cos(a-.08)*23.5,Math.sin(a-.08)*23.5],[Math.cos(a)*24.8,Math.sin(a)*24.8],[Math.cos(a+.08)*23.5,Math.sin(a+.08)*23.5]]),{color:c,kind:'card',t:.04},1.6)}
    {const pts=[];for(let i=0;i<=60;i++){const a=i/60*TAU;pts.push([Math.cos(a)*23.5,Math.sin(a)*23.5])}for(const q of thick([pts],.12))P2(J,q,{color:'#f2eeff',kind:'water',t:.04},1.8)}
    for(let i=0;i<6;i++){const a=i*Math.PI/3;P2(J,circ(Math.cos(a)*23.5,Math.sin(a)*23.5,.32,.32,8),{color:'#5a3a28',kind:'kraft',t:1.4},.6)}
    /* skuret med koste, tæppet med kurven, nissehuset med røg og svampene i en ring */
    {const g=new THREE.Group();g.position.set(38,34,.8);g.rotation.z=.21;J.add(g);P2(g,box(-4.6,-3.4,4.4,3),{color:'#8a4a2a',kind:'kraft',t:2.4,edge:'#4a2a1a'},0);P2(g,box(-4.6,-.15,4.4,.15),{color:'#5a2e1a',kind:'kraft',t:.1},2.45);
      for(let i=0;i<3;i++){const y=-4.6-i*1.1;for(const q of thick([[[-3,y],[2.6,y]]],.11))P2(g,q,{color:'#8a5a3c',kind:'kraft',t:.15},.2);P2(g,toCCW([[2.4,y-.4],[4.4,y-.55],[4.4,y+.55],[2.4,y+.4]]),{color:'#e9c46a',kind:'card',t:.2},.2)}}
    {const g=new THREE.Group();g.position.set(-36,-32,.75);g.rotation.z=-.31;g.scale.setScalar(2.3);J.add(g);P2(g,box(-3,-2.2,3,2.2),{color:'#ffffff',kind:'card',t:.06},0);for(let i=0;i<6;i++)P2(g,box(-3+(i%3)*2,-2.2+Math.floor(i/3)*2.2,-2+(i%3)*2,-1.1+Math.floor(i/3)*2.2),{color:'#e0457a',kind:'card',t:.02},.07);
      P2(g,box(1.2,-.2,2.8,1),{color:'#b9763f',kind:'kraft',t:.9,edge:'#7e4307'},.1);P2(g,circ(-1.6,-.8,.35,.35,8),{color:'#ff5a5a',kind:'card',t:.3},.1);P2(g,circ(-.8,-1.2,.3,.3,8),{color:'#9be36a',kind:'card',t:.3},.1)}
    {const g=new THREE.Group();g.position.set(-58,-6,.75);J.add(g);P2(g,circ(0,0,3.2,3.2,20),{color:'#b5432a',kind:'card',t:2.6,edge:'#6a2a1a'},0);for(let i=0;i<8;i++)P2(g,circ(Math.cos(i*.8)*2,Math.sin(i*.8)*2,.8,.8,10),{color:'#6a9a4a',kind:'card',t:.3},2.6);
      P2(g,box(1.4,1.6,2.4,2.6),{color:'#6a6488',kind:'card',t:3.4},0);const rg=new THREE.Group();g.add(rg);g.userData.rog=rg;for(let i=0;i<3;i++)P2(rg,circ(2+i*.9,3.4+i*1.1,.5+i*.25,.5+i*.25,10),{color:'#f2eefa',kind:'card',t:.1},4+i);tal.push(rg)}
    for(let i=0;i<11;i++){const a=i/11*TAU,x=42+Math.cos(a)*5.4,y=-40+Math.sin(a)*5.4;P2(J,circ(x,y,.5,.5,10),{color:i%3?'#e0457a':'#7fd8ff',kind:'card',t:.5,edge:'#5a1a3a'},.8)}
    for(let i=0;i<8;i++){const a=i/8*TAU,x=-48+Math.cos(a)*7,y=44+Math.sin(a)*7;P2(J,circ(x,y,1.2,.9,10),{color:'#9a94b0',kind:'card',t:1.2,edge:'#5a5470'},.7)}
    /* tilskuerne og Kaptajn Sky ved kanten af målet: nogle vinker, nogle har hat på */
    const KIDS=[['#2e4a7a','#b5432a',0,1],['#6b3fa0','#f2c14e',1,0],['#3e7a4a','#3a2a20',0,0],['#a0526b','#e8e4f4',1,1],['#5a3a28','#f2a04e',0,0],['#2e6a7a','#2a2238',1,0],['#7a2e5a','#c68653',0,1],['#4a4a9a','#ffe27a',1,0],['#3e5a3a','#8a4a2a',0,0]];
    KIDS.forEach(([b,h,wave,hat],i)=>{const a=-2.5+i*.3,d=29+(i%2)*2.5;J.add(oppefra(Math.cos(a)*d,Y(Math.sin(a)*d),b,h,-(a+Math.PI/2),{wave,hat}))});
    J.add(oppefra(26,Y(9),'#2e4a7a','#b5432a',-(110*Math.PI/180),{cape:'#8a2a2a',wave:1}));
    /* vindposen */
    {const g=new THREE.Group();g.position.set(30,8,.8);J.add(g);P2(g,circ(0,0,.35,.35,8),{color:'#2a2340',kind:'kraft',t:3},0);const rr=new THREE.Group();rr.position.z=3;g.add(rr);
      P2(rr,toCCW([[0,-.5],[4,-.3],[4,.3],[0,.5]]),{color:'#ff8a3d',kind:'card',t:.3,edge:'#a8442a'},0);for(const x of[1.3,2.6])P2(rr,box(x-.17,-.45,x+.17,.45),{color:'#ffffff',kind:'card',t:.02},.31);vindsok=rr}
    J.traverse(q=>{if(q.isMesh)q.userData.noShadow=true})}
  /* et menneske set oppefra, lidt større end i virkeligheden, så det kan ses fra luften: skuldre, hoved med hår, måske hat og vinkende arme */
  function oppefra(x,y,body,hairC,a=0,o={}){const g=new THREE.Group(),k=new THREE.Group();g.position.set(x,y,.7);g.rotation.z=a;g.add(k);k.scale.setScalar(5.2);const bd=hexOf(shade(body,-.4));
    P2(k,circ(.12,-.16,.46,.3,14),{color:'#1e2a18',kind:'water',t:.01},0);
    if(o.cape)P2(k,toCCW(sm([[-.36,0],[-.42,.5],[0,.64],[.42,.5],[.36,0]],2)),{color:o.cape,kind:'card',t:.04},.2);
    if(o.wave){for(const s of[-1,1]){for(const q of thick([[[s*.34,-.02],[s*.62,-.06],[s*.66,-.3]]],.075))P2(k,q,{color:body,kind:'card',t:.04},.32);P2(k,circ(s*.67,-.34,.1,.1,8),{color:'#f1c9a6',kind:'card',t:.05},.36)}g.userData.vinker=true;tal.push(g)}
    P2(k,circ(0,0,.4,.24,16),{color:body,kind:'card',t:.06,edge:bd},.25);P2(k,circ(0,.02,.19,.19,12),{color:hairC,kind:'card',t:.06},.33);
    if(o.hat){P2(k,circ(0,.02,.3,.3,14),{color:body,kind:'card',t:.05,edge:bd},.4);P2(k,toCCW([[-.15,.02],[0,.17],[.15,.02],[0,-.13]]),{color:hexOf(shade(body,.15)),kind:'card',t:.05},.46)}
    return g}
  /* ---------- tingene i det frie fald ---------- */
  function bygTmpl(){
    const boble=gold=>{const G=new THREE.Group(),c=gold?'#ffd24a':'#bfe8ff',e=gold?'#b8861a':'#4a8ab8';P2(G,circ(0,0,4.2,4.2,32),{color:c,kind:'card',t:.4,edge:e},0);P2(G,circ(0,0,3.3,3.3,28),{color:gold?'#fff0b0':'#eaf8ff',kind:'card',t:.06},.42);
      P2(G,starPts(0,0,2.2,1,Math.PI/2),{color:gold?'#e8a020':'#ffc02e',kind:'card',t:.2,edge:'#a87a1a'},.5);P2(G,circ(-1.7,1.7,.6,.45,10),{color:'#ffffff',kind:'card',t:.04},.72);return G};
    tmpl.bub=boble(false);tmpl.guld=boble(true);
    {const G=new THREE.Group();P2(G,puff(0,0,9,6,9,.25),{color:'#6a6486',kind:'card',t:.6,edge:'#3a3456'},0);P2(G,puff(-2,1.5,6,4,8,.25),{color:'#827ca0',kind:'card',t:.4},.6);
      P2(G,toCCW([[-.6,2],[1.6,2],[.3,-.2],[1.8,-.2],[-1.4,-4.2],[-.3,-1],[-1.8,-1]]),{color:'#ffe27a',kind:'card',t:.2,edge:'#c08a20'},1.1);tmpl.storm=G}
    {const G=new THREE.Group();P2(G,puff(0,0,14,8,10,.22),{color:'#ffffff',kind:'card',t:.5,edge:'#c8dcec'},0);P2(G,puff(4,2,8,5,8,.22),{color:'#f4f8ff',kind:'card',t:.4},.5);tmpl.sky=G}
    {const pts=[];for(let i=0;i<=40;i++){const a=i/40*TAU;pts.push([Math.cos(a)*3.6,Math.sin(a)*3.6])}const G=new THREE.Group();for(let i=0;i<20;i++)for(const q of thick([pts.slice(i*2,i*2+2)],.16))P2(G,q,{color:'#fffaf0',kind:'card',t:.04},0);tmpl.ring=G}
    for(const k in tmpl)tmpl[k].traverse(q=>{if(q.isMesh)q.userData.noShadow=true})}
  const ny=(k,par)=>{const g=tmpl[k].clone();par.add(g);return g};
  /* ---------- et nyt spring ---------- */
  function nyt(){ryd();const jumps=SPIL.data.fald||0,w=jumps>=2?1.2+Math.random()*1.6:0,wa=Math.random()*TAU,a0=Math.random()*TAU,d0=105+Math.random()*30;
    S={run:'kort',t:0,auto:!!window.FALD_AUTO,bubbles:0,bubN:0,hx:SCX,hy:SCY+40,tx:SCX,ty:SCY+40,tilt:0,objs:[],motes:[],spawn:[],
      x:Math.cos(a0)*d0,y:Math.sin(a0)*d0,th:Math.atan2(-Math.cos(a0),Math.sin(a0))*180/Math.PI+(Math.random()<.5?1:-1)*(70+Math.random()*50),
      h:H0,v:9,sink:3.8,turnV:0,wind:{x:Math.cos(wa)*w,y:Math.sin(wa)*w,s:w,a:wa},ctl:{pl:0,pr:0,L:false,R:false},keys:{},ptrs:new Map(),soft:false,ppm:.45,haze:.75,ryst:0,puf:0};
    makeSpawns();S.floaters=Array.from({length:16},(_,i)=>({x:(Math.random()-.5)*280,y:(Math.random()-.5)*240,a:20+Math.random()*110,c:['#ffb347','#ff8fc7','#ffe27a','#7fd8ff'][i%4]}));
    for(const f of S.floaters){const g=new THREE.Group();P2(g,box(-.45,-.55,.45,.55),{mat:paperMat(f.c,'tissue',{glow:f.c,gi:1.2}),t:.9},0);P2(g,box(-.5,.5,.5,.7),{color:'#5a3a28',kind:'kraft',t:.2},.9);g.visible=false;rod.add(g);f.m=g}
    heltG.visible=false;heltG.position.set(0,0,0);heltG.scale.setScalar(1);skaerm.visible=false;if(side)side.visible=false;skygge.visible=false;if(landet){jord.remove(landet);landet=null}
    tv.saet(0,ALT0);tv.saet(1,0);vindPil.visible=false;haandVis(false);
    ban.vis('Klar til at springe?',{portraet:'sky',txt2:'Træk med fingeren, og saml stjernebobler. Tryk for at begynde',sek:0,col:'#2e4a7a',y:6})}
  function ryd(){if(!S)return;for(const o of S.objs)rod.remove(o.el),o.ring&&rod.remove(o.ring);for(const m of S.motes)rod.remove(m.m);for(const f of S.floaters||[])rod.remove(f.m)}
  function makeSpawns(){let px=SCX,py=SCY,n=0;
    for(let t=1.4;t<FREE_T-TA-.2;t+=.95){px=clamp(px+(Math.random()*2-1)*380,BX0+70,BX1-70);py=clamp(py+(Math.random()*2-1)*280,BY0+70,BY1-70);S.spawn.push({t,kind:'bub',x:px,y:py,gold:++n%6===0,ox:(Math.random()*2-1)*300,oy:(Math.random()*2-1)*200})}
    const bubs=S.spawn.filter(o=>o.kind==='bub');
    for(let t=4.2;t<FREE_T-TA-.6;t+=3.4+Math.random()*1.6){let best=null;for(let k=0;k<30;k++){const x=BX0+120+Math.random()*(BX1-BX0-240),y=BY0+100+Math.random()*(BY1-BY0-200),dmin=Math.min(...bubs.filter(b=>Math.abs(b.t-t)<1.4).map(b=>Math.hypot(b.x-x,b.y-y)),1e9);if(!best||dmin>best.d)best={x,y,d:dmin}}
      S.spawn.push({t,kind:'storm',x:best.x,y:best.y,ox:(Math.random()*2-1)*120,oy:(Math.random()*2-1)*80})}
    for(let t=2.2;t<FREE_T-TA;t+=2.6+Math.random()*1.2)S.spawn.push({t,kind:'cloud',x:200+Math.random()*1200,y:150+Math.random()*700,k:.6+Math.random()*.5});
    S.spawn.sort((a,b)=>a.t-b.t);S.bubN=S.spawn.filter(s=>s.kind==='bub').length;
    /* fartstriber: lange, tynde papirstrimler, der peger lige op mod os og suser forbi */
    for(let i=0;i<30;i++){const m=new THREE.Mesh(tmpl.strib,tmpl.stribM);m.userData.noShadow=true;m.visible=false;rod.add(m);S.motes.push({m,x:R(-60,60),y:R(-34,34),z:Math.random()})}}
  /* ---------- turen op, set fra siden: fra skolen, op gennem skyerne, og så springer hun ---------- */
  const T_UP=5,T_HOVER=.8,T_JUMP=1.3,T_IN=T_UP+T_HOVER+T_JUMP;let side=null,sideL=null,rytter=null;
  function bygSide(){side=new THREE.Group();side.position.z=30;rod.add(side);side.visible=false;const H=new THREE.Group(),Sk=new THREE.Group(),J=new THREE.Group();side.add(H,Sk,J);sideL={H,Sk,J};
    {const B=box(-110,-40,110,170);P2(H,B,{t:.3,s:3,cap:2048,paint:P=>{P.flat('#b4e2f8',B);for(let y=8;y<170;y+=6)P.flat('#3a78d0',box(-110,y,110,170),.075)}},-6)}
    put(H,piece(circ(30,16,4.5,4.5,30),{mat:paperMat('#fff4c0','tissue',{glow:'#ffe890',gi:1.1}),t:.3}),0,0,-5.5);
    for(let i=0;i<46;i++){const x=R(-60,60),y=i<6?R(4,22):R(14,300),rx=R(4,10);P2(Sk,puff(x,y,rx,rx*.45,9,.22),{color:'#ffffff',kind:'card',t:.4,edge:'#c8dcec'},R(-3,3))}
    P2(J,toCCW(sm([[-110,-40],[110,-40],[110,-15],[60,-13],[20,-15.5],[-30,-12.8],[-80,-14.5],[-110,-13.5]],4)),{color:'#7fb06c',kind:'card',t:.6,edge:'#4a7a42'},-2);
    for(let x=-80;x<80;x+=R(5,8)){if(Math.abs(x+20)<10)continue;const c=['#c0503a','#4a6a9a','#8a5aaa','#b87a4a'][Math.floor(R(4))],w=R(3.2,4.6),h=R(2.4,3.6),g=new THREE.Group();g.position.set(x,-15.6+R(-.4,.4),-1);J.add(g);
      P2(g,box(-w/2,0,w/2,h),{color:'#e8d8c0',kind:'card',t:.3,edge:'#8a7a6a'},0);P2(g,toCCW([[-w/2-.4,h],[w/2+.4,h],[0,h+w*.55]]),{color:c,kind:'card',t:.3,edge:hexOf(shade(c,-.4))},.1);P2(g,box(-.4,.6,.4,1.6),{color:'#ffe08a',kind:'card',t:.05},.32)}
    {const g=new THREE.Group();g.position.set(-20,-15,0);g.scale.setScalar(.55);J.add(g);const st='#cfc8e0';P2(g,box(-12,0,12,13),{color:st,kind:'card',t:.6,edge:'#6a6488'},0);
      for(const tx of[-12,-4,4,12]){P2(g,box(tx-2.4,0,tx+2.4,19),{color:st,kind:'card',t:.7,edge:'#6a6488'},.1);P2(g,toCCW([[tx-3.2,19],[tx+3.2,19],[tx,26]]),{color:'#6a3a88',kind:'card',t:.6,edge:'#3a1a50'},.2)}
      P2(g,toCCW(sm([[-2.6,0],[2.6,0],[2.6,5],[0,7.4],[-2.6,5]],3)),{color:'#5a3a28',kind:'kraft',t:.1},.7);for(const[wx,wy]of[[-8,8],[8,8],[-4,15],[4,15]])P2(g,box(wx-1,wy-1.4,wx+1,wy+1.4),{color:'#ffe08a',kind:'card',t:.05},.75)}
    for(let i=0;i<16;i++){const x=R(-80,80);if(Math.abs(x+20)<9)continue;P2(J,puff(x,-14+R(-.5,1),R(1.2,2),R(1.2,2),8,.2),{color:R(1)<.5?'#3a6a40':'#4a7a4a',kind:'card',t:.4,edge:'#264a2a'},.5)}
    rytter=bygRytter(ctx.look,{gear:true});rytter.G.scale.setScalar(.24);side.add(rytter.G);side.traverse(q=>{if(q.isMesh)q.userData.noShadow=true})}
  function begynd(){if(!S||S.run!=='kort')return;ban.skjul();S.run='intro';S.t=0;side.visible=true;heltG.visible=false;LYD.pust()}
  function stepIntro(dt){S.t+=dt;if(S.t>=T_IN){side.visible=false;S.puf=1;freeStart()}}
  function drawIntro(){const t=S.t,u=Math.min(1,t/T_UP),rise=240*Math.pow(u,2),k=ease(Math.min(1,t/2.2));
    sideL.J.position.y=-rise;sideL.Sk.position.y=-rise*1.18;sideL.H.position.y=-rise*.35;
    let x=mix(-20,-2,k),y=mix(-5,2,k)+Math.sin(t*3)*.4,a=.3*(1-Math.max(0,(t-T_UP)/T_HOVER));
    /* hun springer af kosten (Kasper 23. nov.): sætter af, hopper op og frem, og først i faldet vender hun hovedet nedad. Kosten flyver videre for sig selv */
    const t0=T_UP+T_HOVER,sk=rytter.G.scale.x,K=rytter.kost;let kb=null;
    if(t>t0-.35&&t<=t0){const c=Math.sin((t-t0+.35)/.35*Math.PI);y-=.5*c}
    if(t>t0){const j=Math.min(1,(t-t0)/T_JUMP),x0=x,y0=y;x+=9*j;if(j<.3)y=y0+4.5*Math.sin(j/.3*Math.PI/2);else y=y0+4.5-62*(j-.3)*(j-.3);a=j<.3?.15*Math.sin(j/.3*Math.PI):-1.5*ease((j-.3)/.7);
      kb={x:x0+16*j,y:y0+2.5*j-1.2*j*j}}
    rytter.G.position.set(x,y,2);rytter.G.rotation.z=a;
    if(kb){/* kosten i heksens eget koordinatsystem, så den bliver i luften, hvor den var */const ox=kb.x-x,oy=kb.y-y,c=Math.cos(-a),s_=Math.sin(-a);const SY=rytter.SY;K.position.set((ox*c-oy*s_)/sk+SY*s_,(ox*s_+oy*c)/sk-SY*c+SY,0);K.rotation.z=-a}else{K.position.set(0,0,0);K.rotation.z=0}rytter.tick(Rm.t,{fart:1.3});tv.saet(0,Math.round(ALT0*Math.min(1,u)/50)*50);groundAt(.45,S.x,S.y)}
  function freeStart(){S.run='free';S.t=0;heltG.visible=true;heltG.position.set(WX(S.hx),WY(S.hy),0);heltG.rotation.z=0;heltG.scale.setScalar(1);S.firstBub=true;LYD.pust();pt.pop(0,10,8,'Hop!',{col:'#ffb020',h:5});
    ban.vis('Flyv hen over boblerne!',{portraet:'sky',sek:2.4,col:'#7a3fa2',y:16})}
  /* ---------- frit fald ---------- */
  function stepFree(dt){S.t+=dt;
    while(S.spawn.length&&S.spawn[0].t<=S.t){const o=S.spawn.shift();o.z=1;o.el=ny(o.kind==='bub'?(o.gold?'guld':'bub'):o.kind==='storm'?'storm':'sky',rod);if(o.kind==='cloud')o.el.scale.setScalar(o.k*1.6);
      if(o.kind==='bub'&&S.firstBub){o.ring=ny('ring',rod);o.ring.position.set(WX(o.x),WY(o.y),.2);o.first=true;S.firstBub=false;pil.visible=true}S.objs.push(o)}
    if(S.auto){const nb=S.objs.filter(o=>o.kind==='bub'&&o.z>0&&!o.got).sort((a,b)=>a.z-b.z)[0];if(nb){S.tx=nb.x;S.ty=nb.y}
      const st=S.objs.find(o=>o.kind==='storm'&&o.z>0&&o.z<.35&&Math.hypot(o.x-S.tx,o.y-S.ty)<260);if(st){const a=Math.atan2(S.ty-st.y,S.tx-st.x);S.tx=st.x+Math.cos(a)*300;S.ty=st.y+Math.sin(a)*300}}
    const kx=(S.keys.ArrowRight?1:0)-(S.keys.ArrowLeft?1:0),ky=(S.keys.ArrowDown?1:0)-(S.keys.ArrowUp?1:0);if(kx||ky){const l=Math.hypot(kx,ky),sp=820*dt/l;S.tx=S.hx+kx*sp*6;S.ty=S.hy+ky*sp*6}
    S.tx=clamp(S.tx,BX0,BX1);S.ty=clamp(S.ty,BY0,BY1);
    let vx=(S.tx-S.hx)*7,vy=(S.ty-S.hy)*7;const sp=Math.hypot(vx,vy);if(sp>1300){vx*=1300/sp;vy*=1300/sp}S.hx+=vx*dt;S.hy+=vy*dt;S.tilt+=(clamp(vx/45,-22,22)-S.tilt)*Math.min(1,dt*6);
    for(const o of S.objs){const z0=o.z;o.z-=dt/TA;
      if(z0>0&&o.z<=0){if(o.ring){rod.remove(o.ring);o.ring=null}if(o.first)pil.visible=false;
        if(o.kind==='bub'&&Math.hypot(o.x-S.hx,o.y-S.hy)<130){o.got=true;const v=o.gold?3:1;S.bubbles+=v;LYD.plop();if(o.gold)LYD.guld();Rm.burst(WX(o.x),WY(o.y),2,10,o.gold?'rgba(255,200,60,.95)':'rgba(255,236,170,.95)',3);pt.pop(WX(o.x),WY(o.y)+3,6,'+'+v,{col:o.gold?'#ffb020':'#ffd86b',h:3.4});tv.saet(1,S.bubbles);rod.remove(o.el);o.dead=true}
        if(o.kind==='cloud'&&Math.hypot(o.x-S.hx,o.y-S.hy)<300*o.k){S.puf=1;LYD.puf()}
        if(o.kind==='storm'&&Math.hypot(o.x-S.hx,o.y-S.hy)<170)zap(o)}
      if(o.z<-.16){rod.remove(o.el);if(o.ring)rod.remove(o.ring);o.dead=true}}
    S.objs=S.objs.filter(o=>!o.dead);
    for(const m of S.motes){m.z-=dt/.55;if(m.z<-.12){m.z=1;m.x=R(-60,60);m.y=R(-34,34)}}
    if(S.t>=FREE_T){S.run='open';S.t=0;openStart()}}
  function zap(o){S.ryst=.45;LYD.dunk();S.tilt+=S.hx>o.x?30:-30;if(S.bubbles>0){S.bubbles--;tv.saet(1,S.bubbles);pt.pop(WX(S.hx),WY(S.hy)+4,6,'Av! −1',{col:'#e2384e',h:3.4})}else pt.pop(WX(S.hx),WY(S.hy)+4,6,'Puha!',{col:'#7a3fa2',h:3.4})}
  function drawFree(){const f=clamp(S.t/FREE_T,0,1);groundAt(.45+f*1.1,S.x,S.y);S.haze=.75-f*.4;
    heltG.position.set(WX(S.hx),WY(S.hy),0);heltG.rotation.z=-S.tilt*Math.PI/180;
    for(const o of S.objs){const zw=-ZS*o.z,k=1-Math.max(0,o.z),dz=Math.pow(Math.max(0,o.z),1.5);
      o.el.position.set(WX(o.x+(o.ox||0)*dz),WY(o.y+(o.oy||0)*dz),zw);o.el.rotation.z=o.kind==='bub'?Math.sin(Rm.t*2+o.x)*.15:0;
      if(o.kind==='bub'&&!o.ring&&o.z>0&&o.z<.5&&!o.got){o.ring=ny('ring',rod);o.ring.position.set(WX(o.x),WY(o.y),.2)}
      if(o.ring){o.ring.rotation.z=Rm.t*.8;const s=o.z<.3?1+.08*Math.sin(Rm.t*14):1;o.ring.scale.setScalar(s*(o.gold?1.1:1))}
      if(o.kind==='storm'&&o.z<.4&&o.z>0)o.el.rotation.z=Math.sin(Rm.t*30)*.05}
    if(pil.visible){const o=S.objs.find(q=>q.first);if(o)pil.position.set(WX(o.x),WY(o.y)+5.5+Math.sin(Rm.t*6)*.6,.4)}
    for(const m of S.motes){const vis=m.z<=1&&m.z>-.1;m.m.visible=vis;if(vis)m.m.position.set(m.x,m.y,-ZS*m.z)}
    tv.saet(0,Math.round((ALT0-(ALT0-ALT1)*f)/50)*50)}
  /* ---------- skærmen folder sig ud ---------- */
  function openStart(){for(const o of S.objs){rod.remove(o.el);if(o.ring)rod.remove(o.ring)}S.objs=[];for(const m of S.motes)m.m.visible=false;pil.visible=false;LYD.puf();setTimeout(()=>{if(S&&ctx.alive)LYD.op()},400);S.ox=S.hx;S.oy=S.hy;S.op0=S.ppm;skaerm.visible=true}
  function stepOpen(dt){S.t+=dt;if(S.t>=OPEN_T){S.run='canopy';S.t=0;haandVis(true);if(S.wind.s)vindPil.visible=true;skygge.visible=true;
    ban.vis('Styr mod målet!',{portraet:'sky',txt2:'Træk et håndtag ned for at dreje. Begge ned bremser',sek:4,col:'#7a3fa2',y:16})}}
  function drawOpen(){const u=clamp(S.t/OPEN_T,0,1),e=ease(u),back=1+Math.sin(u*Math.PI)*.12;groundAt(S.op0+(ppmAt(H0)-S.op0)*e,S.x,S.y);S.haze=.35*(1-e);
    const hx=WX(S.ox)*(1-e),hy=WY(S.oy)*(1-e);heltG.position.set(hx,hy-2*e,0);heltG.scale.setScalar(1-.5*e);heltG.visible=u<.75;heltG.rotation.z*=.9;
    const sx=.12+.88*ease(clamp(u*1.3-.15,0,1)),sy=.2+.8*ease(clamp(u*1.5-.1,0,1));skaerm.position.set(hx,hy,2+6*(1-e));skaerm.scale.set(sx*back,sy*back,1);skaerm.rotation.set(0,0,-S.th*e*Math.PI/180);
    drawFloaters()}
  /* ---------- under skærmen ---------- */
  function ctl(){const k=S.keys;let pl=0,pr=0;for(const p of S.ptrs.values()){if(p.side==='L')pl=p.v;else pr=p.v}
    if(k.ArrowLeft)pl=Math.max(pl,1);if(k.ArrowRight)pr=Math.max(pr,1);if(k.ArrowDown){pl=Math.max(pl,1);pr=Math.max(pr,1)}if(k.ArrowUp){if(!k.ArrowLeft)pl=Math.min(pl,-1);if(!k.ArrowRight)pr=Math.min(pr,-1)}
    S.ctl={pl,pr};if(S.auto)autopilot();S.ctl.L=S.ctl.pl>.3;S.ctl.R=S.ctl.pr>.3}
  function autopilot(){const d=Math.hypot(S.x,S.y),want=Math.atan2(-S.x,S.y)*180/Math.PI,glide=S.h*(9/3.8);let diff=((want-S.th)%360+540)%360-180;
    S.ctl=glide>d+45?{pl:0,pr:1}:{pl:diff<-8?1:0,pr:diff>8?1:0};if(S.h<5)S.ctl={pl:1,pr:1}}
  function stepCanopy(dt){S.t+=dt;ctl();const{pl,pr}=S.ctl,brake=Math.max(0,Math.min(pl,pr)),fast=Math.max(0,Math.min(-pl,-pr)),turn=clamp(pr-pl,-2,2),at=Math.abs(turn);
    const vt=9-4.8*brake+5*fast,st=3.8-1.2*brake+2.4*fast+1.3*Math.min(1,at)+.5*Math.max(0,at-1),rate=Math.sign(turn)*(80*Math.min(1,at)+45*Math.max(0,at-1));
    S.turnV+=(rate-S.turnV)*Math.min(1,dt*4);S.th+=S.turnV*dt;S.v+=(vt-S.v)*Math.min(1,dt*1.8);S.sink+=(st-S.sink)*Math.min(1,dt*1.8);
    const rad=S.th*Math.PI/180;S.x+=(Math.sin(rad)*S.v+S.wind.x)*dt;S.y+=(-Math.cos(rad)*S.v+S.wind.y)*dt;S.h-=S.sink*dt;
    for(const f of S.floaters){f.a+=.5*dt;f.x+=Math.sin(S.t*.7+f.a)*.3*dt+S.wind.x*dt;f.y+=S.wind.y*dt}
    if(S.h<6)S.soft=brake>.6;if(S.h<=0){S.h=0;land()}}
  function drawCanopy(){groundAt(ppmAt(S.h),S.x,S.y);skaerm.position.set(0,0,2);skaerm.scale.set(1-Math.abs(S.turnV)/80*.05,1,1);skaerm.rotation.set(0,(S.ctl.pr-S.ctl.pl)*.12,-S.th*Math.PI/180);
    const c=skaerm.userData.celler;c.forEach((q,i)=>{const s=i<3?S.ctl.pl:i>3?S.ctl.pr:0;q.scale.y=1-Math.max(0,s)*.08*(Math.abs(i-3)/3)});
    drawShadow();drawFloaters();tv.saet(0,Math.round(ALT1*S.h/H0/10)*10);
    for(const[k,v]of[['L',S.ctl.pl],['R',S.ctl.pr]]){const h=haand[k];if(h)h.grip.position.y+=(-v*5.5-h.grip.position.y)*.4}
    /* en pil i kanten, når målet er uden for skærmen */
    const u=S.uz,tx=-S.x*u,ty=S.y*u,hh=Math.tan(Rm.cam.fov*Math.PI/360)*CD,hw=hh*Rm.cam.aspect,off=Math.abs(tx)>hw-3||Math.abs(ty)>hh-3;mpil.visible=off;
    if(off){const a=Math.atan2(ty,tx);mpil.position.set(clamp(tx,-hw+9,hw-9),clamp(ty,-hh+8,hh-10),3);mpil.rotation.z=a}
    if(vindPil.visible)vindPil.rotation.z=-S.wind.a;vindsok.rotation.z=S.wind.s?-S.wind.a:-1.75;vindsok.scale.x=S.wind.s?1:.55}
  function drawFloaters(){for(const f of S.floaters||[]){const dh=S.h-f.a;if(dh<3||S.run==='free'){f.m.visible=false;continue}const p=FOCAL/(CAM_UP+dh)*K;f.m.visible=true;f.m.position.set((f.x-S.x)*p,-(f.y-S.y)*p,-20+Math.min(15,dh*.1));f.m.scale.setScalar(p*dyb(-20+Math.min(15,dh*.1)))}}
  function drawShadow(){/* skyggen af skærmen ligger på jorden et stykke væk og løber sammen med hende, når hun lander */
    skygge.position.set(S.x+.35*S.h,-(S.y+.5*S.h),1.8);skygge.rotation.z=-S.th*Math.PI/180;skygge.scale.setScalar(1/(24*K))}
  /* ---------- landingen ---------- */
  function land(){S.run='landed';S.t=0;const d=Math.hypot(S.x,S.y),pond=((S.x-POND.x)/POND.rx)**2+((S.y-POND.y)/POND.ry)**2<1;
    const zi=pond?-1:RINGS.findIndex(r=>d<=r),landS=zi>=0?RING_STARS[zi]:0,bubS=Math.floor(S.bubbles/4),softS=S.soft&&!pond?1:0,stars=Math.max(1,landS+bubS+softS);
    const msg=pond?'Plask! Lige i dammen.':zi===0?'Lige i plet!':zi===1?'Super tæt på!':zi===2?'Flot landing!':zi===3?'Inde på målet!':'Uden for målet';
    S.result={d:+d.toFixed(1),zone:zi,pond,stars,landS,bubbles:S.bubbles,bubN:S.bubN,soft:!!softS,wind:+S.wind.s.toFixed(1),x:S.x,y:S.y,msg};
    SPIL.data.fald=(SPIL.data.fald||0)+1;SPIL.data.faldBedst=Math.min(SPIL.data.faldBedst??1e9,pond?1e9:d);SPIL.giv(stars);LOG.row('fald',{d:S.result.d,zone:zi,stars,bobler:S.bubbles,blod:!!softS,vind:S.result.wind});
    haandVis(false);vindPil.visible=false;mpil.visible=false;skygge.visible=false;skaerm.visible=false;for(const f of S.floaters)f.m.visible=false;
    /* hun står på jorden, og skærmen ligger sammenfaldet bag hende */
    landet=new THREE.Group();landet.position.set(S.x,-S.y,1.7);landet.rotation.z=-S.th*Math.PI/180;jord.add(landet);
    /* skærmen er faldet sammen og ligger bredt ud bag hende som et stykke stof med folder, med snorene hen til hende (Kasper 23. nov.: "hun ser ret underlig ud") */
    {const n=7,A=[0,-2.4],kant=[];for(let i=0;i<=n;i++){const a=(-.95+1.9*i/n),r=R(9.5,11.5);kant.push([Math.sin(a)*r*1.15,A[1]-Math.cos(a)*r*.72])}
      /* ét stykke stof: kanten bølger, og de lyse baner og folderne er malet på */
      const ud=toCCW(sm([[-2.6,-1.2],...kant.map(([x,y],i)=>[x+R(-.4,.4),y+(i%2?R(.6,1.2):0)]),[2.6,-1.2],[0,-.4]],5));
      P2(landet,ud,{t:.14,s:16,paint:P=>{P.wash(kjole,ud,{top:hexOf(shade(kjole,.15)),edge:.5,clouds:4});for(let i=0;i<n;i+=2){const p0=kant[i],p1=kant[i+1];P.fill(toCCW([[A[0]+(p0[0]-A[0])*.15,A[1]+(p0[1]-A[1])*.15],[p0[0]*1.2,p0[1]*1.2],[p1[0]*1.2,p1[1]*1.2],[A[0]+(p1[0]-A[0])*.15,A[1]+(p1[1]-A[1])*.15]]),'#fff3e0',.92)}
        for(let k=0;k<9;k++){const a=R(-.9,.9),r0=R(2,4),r1=R(6,10);P.pen([[Math.sin(a)*r0,A[1]-Math.cos(a)*r0*.7],[Math.sin(a+R(-.1,.1))*r1*1.1,A[1]-Math.cos(a)*r1*.7]],hexOf(shade(kjole,-.45)),.12,.35)}P.pen([...ud,ud[0]],hexOf(shade(kjole,-.5)),.22,.9)}},-.3);{const sk=put(landet,piece(ud,{color:'#1a2a10',kind:'water',t:.02}),.5,-.6,-.42);sk.material=sk.material.map?sk.material:sk.material;sk.traverse(o=>{if(o.material){const m=(Array.isArray(o.material)?o.material:[o.material]).map(q=>{q=q.clone();q.transparent=true;q.opacity=.28;return q});o.material=Array.isArray(o.material)?m:m[0]}})}
      for(const k of kant)for(const q of thick([[[0,-.6],[k[0]*.3,A[1]+(k[1]-A[1])*.2]]],.05))P2(landet,q,{color:'#e8e4f0',kind:'water',t:.02},-.1)}
    landet.add(oppefra(0,0,kjole,hair,0,{wave:1,cape:kappe}));if(pond){Rm.burst(0,0,2,14,'rgba(190,232,255,.95)',6);LYD.boelge()}else{LYD.dunk();if(zi===0)LYD.guld()}
    S.l0={ppm:S.ppm,x:S.x,y:S.y};pt.pop(0,8,8,msg,{col:pond?'#2e6aa8':'#e2384e',h:4.2,tilt:0});
    setTimeout(()=>{if(!S||!S.result||!ctx.alive)return;LYD.fanfare();const r=S.result;
      ctx.vent(`${r.msg} ${r.pond?'Du landede i dammen.':`Du landede ${String(r.d).replace('.',',')} m fra midten.`} ${r.bubbles} ${r.bubbles===1?'stjerneboble':'stjernebobler'}${r.soft?' og en blød landing':''}. Du fik ${r.stars} ${r.stars===1?'stjerne':'stjerner'}! Tryk for at springe igen.`,nyt,{portraet:'sky'})},S.auto?60:2200)}
  function drawLanded(){const u=ease(clamp(S.t/1.2,0,1)),L0=S.l0,ppm=L0.ppm+(Math.min(L0.ppm,15)-L0.ppm)*u,k=Math.hypot(L0.x,L0.y)<30?.5:0;groundAt(ppm,L0.x*(1-u*k),L0.y*(1-u*k))}
  /* ---------- jorden og disen ---------- */
  function groundAt(ppm,cx,cy){S.ppm=ppm;const u=ppm*K*dyb(ZG);S.uz=ppm*K;jord.scale.setScalar(u);jord.position.set(-cx*u,cy*u,ZG)}
  /* ---------- håndtagene ---------- */
  function haandVis(v){for(const k of['L','R'])if(haand[k])haand[k].G.visible=v}
  function placerUI(){const hh=Math.tan(Rm.cam.fov*Math.PI/360)*CD,hw=hh*Rm.cam.aspect;if(haand.L){haand.L.G.position.set(-hw+5,-hh+15,4);haand.R.G.position.set(hw-5,-hh+15,4)}
    tv.G.position.set(hw-15,hh-5.5,4);vindPil.position.set(hw-15,hh-14,4)}
  function bygHaand(side){const G=new THREE.Group();rod.add(G);P2(G,sm([[-1.3,-8.5],[1.3,-8.5],[1.3,8.5],[-1.3,8.5]],1),{color:'#d8b07a',kind:'kraft',t:.4,edge:'#8a5a28'},0);P2(G,box(-.35,-7.4,.35,7.4),{color:'#5a3a20',kind:'water',t:.02},.42);
    P2(G,box(-1.6,-.12,1.6,.12),{color:'#fffaf0',kind:'water',t:.02},.43);
    const grip=new THREE.Group();G.add(grip);for(const q of thick([[[0,0],[0,9]]],.1))P2(grip,q,{color:'#f2eeff',kind:'water',t:.02},.5);P2(grip,toCCW(sm([[-1.8,.6],[0,1.6],[1.8,.6],[1.2,-2.4],[0,-3.4],[-1.2,-2.4]],3)),{color:'#e0457a',kind:'card',t:.6,edge:'#ffffff'},.6);
    P2(grip,toCCW(sm([[-.9,.1],[0,.6],[.9,.1],[.5,-1.8],[0,-2.4],[-.5,-1.8]],2)),{color:'#7a1a3a',kind:'card',t:.05},1.22);
    const t=papirTekstMesh(side==='L'?'Venstre':'Højre','#3a2208',2,FONT.pil);t.position.set(0,-10.4,.5);G.add(t);tekster.push(t);
    G.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});G.visible=false;haand[side]={G,grip}}
  const tekster=[];let mpil;
  /* ---------- styring: fingeren i det frie fald, et håndtag i hver side under skærmen ---------- */
  const el=renderer.domElement,last=new Map();
  const sideAf=e=>{const b=el.getBoundingClientRect();return(e.clientX-b.left)/b.width<.5?'L':'R'};
  const iVerden=e=>{const p=Rm&&Rm.planeAt(e,0);return p&&{x:p.x/K+SCX,y:-p.y/K+SCY}};
  const pd=e=>{if(!S||!ctx.alive||!Rm||!Rm.ready)return;if(S.run==='kort'){begynd();return}if(S.run==='intro'){S.t=Math.max(S.t,T_UP);return}
    try{el.setPointerCapture(e.pointerId)}catch(_){}if(S.run==='free'){S.tx=S.hx;S.ty=S.hy;last.set(e.pointerId,iVerden(e))}S.ptrs.set(e.pointerId,{side:sideAf(e),y0:e.clientY,v:0})};
  const pm=e=>{if(!S||!S.ptrs.has(e.pointerId))return;if(S.run==='free'){const p=iVerden(e),q=last.get(e.pointerId);last.set(e.pointerId,p);if(p&&q){S.tx+=(p.x-q.x)*1.5;S.ty+=(p.y-q.y)*1.5}}
    else{const p=S.ptrs.get(e.pointerId),b=el.getBoundingClientRect();p.v=clamp((e.clientY-p.y0)/(b.height*.2),-1,1)}};
  const pu=e=>{last.delete(e.pointerId);if(S)S.ptrs.delete(e.pointerId)};
  const kd=e=>{if(!S)return;if(e.key.startsWith('Arrow')){e.preventDefault();S.keys[e.key]=true}if(e.key===' '||e.key==='Enter'){if(S.run==='kort')begynd();else if(S.run==='intro')S.t=Math.max(S.t,T_UP)}},ku=e=>{if(S)S.keys[e.key]=false};
  el.addEventListener('pointerdown',pd);addEventListener('pointermove',pm);addEventListener('pointerup',pu);addEventListener('pointercancel',pu);addEventListener('keydown',kd);addEventListener('keyup',ku);
  /* ---------- rummet ---------- */
  const OPT={bg:'#bfe0f0',fit:(c,w,h)=>{const asp=w/h,HH=Math.max(50,88/asp);c.fov=2*Math.atan(HH/2/CD)*180/Math.PI;c.position.set(0,0,CD);c.lookAt(0,0,0)},sky:'#ffffff',ground:'#8a9a70',amb:1.05,
    key:{col:'#fff4e0',i:1.5,pos:[-60,80,200],tgt:[0,0,-100],box:[-80,80,60,-60]},P_:{dof:[0,0],haze:[0,0,0]},
    build:R_=>[()=>{Rm=R_;rod=new THREE.Group();Rm.live.add(rod);jord=new THREE.Group();rod.add(jord);bygJord(jord);
        skygge=new THREE.Group();{const sk=bygSkaerm();sk.userData.fod.visible=false;sk.traverse(q=>{if(q.isMesh){q.material=new THREE.MeshBasicMaterial({color:'#10200c',transparent:true,opacity:.28,depthWrite:false});q.userData.noShadow=true}});skygge.add(sk)}jord.add(skygge);skygge.visible=false},
      ()=>{bygTmpl();tmpl.strib=new THREE.BoxGeometry(.18,.18,9);tmpl.stribM=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.55});
        dis=new THREE.Mesh(new THREE.PlaneGeometry(2000,1400),new THREE.MeshBasicMaterial({color:'#e6f2fa',transparent:true,opacity:.6,depthWrite:false}));dis.position.z=ZG+25;dis.userData.noShadow=true;rod.add(dis);
        puffPlan=new THREE.Mesh(new THREE.PlaneGeometry(200,140),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,depthTest:false}));puffPlan.position.z=100;puffPlan.renderOrder=9;rod.add(puffPlan);
        heltG=new THREE.Group();rod.add(heltG);helt=bygHelt();heltG.add(helt);skaerm=bygSkaerm();rod.add(skaerm);bygSide();
        pil=new THREE.Group();P2(pil,toCCW([[-.7,0],[.7,0],[.7,2.6],[1.8,2.6],[0,4.6],[-1.8,2.6],[-.7,2.6]].map(([x,y])=>[x,-y])),{color:'#ffe27a',kind:'card',t:.2,edge:'#a87a1a'},0);pil.visible=false;rod.add(pil);
        mpil=new THREE.Group();P2(mpil,circ(0,0,3.2,3.2,24),{color:'#2a2340',kind:'card',t:.3},0);P2(mpil,toCCW([[-1.4,-1.4],[1.7,0],[-1.4,1.4]]),{color:'#ffe27a',kind:'card',t:.1},.32);mpil.visible=false;rod.add(mpil);
        vindPil=new THREE.Group();{const kort=new THREE.Group();vindPil.add(kort);P2(kort,circ(0,0,3,3,24),{color:'#fbf2dc',kind:'card',t:.3,edge:'#a88a5a'},0)}{const a=new THREE.Group();vindPil.add(a);for(const q of thick([[[-1.8,0],[1.4,0]]],.3))P2(a,q,{color:'#2e6aa8',kind:'card',t:.1},.32);P2(a,toCCW([[.9,-1],[2.2,0],[.9,1]]),{color:'#2e6aa8',kind:'card',t:.1},.32)}vindPil.visible=false;rod.add(vindPil);
        {const t=papirTekstMesh('Vind','#3a2208',1.6,FONT.pil);t.position.set(0,-4.2,.3);t.userData.fast=true;tekster.push(t);vindPil.add(t)}
        bygHaand('L');bygHaand('R');
        tv=papirTavle(rod,[{navn:'Højde',cifre:4},{navn:'Bobler',cifre:2}],{x:30,y:20,z:4,s:.9});pt=papirTekster(rod);ban=papirBanner(rod,{y:6,z:12,w:44});
        rod.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});nyt();groundAt(.45,S.x,S.y)}],
    tick:(t,dt)=>{if(!S)return;placerUI();tv.tick(dt);pt.tick(dt);ban.tick(dt);
      const n=window.FALD_WARP||(S.auto?6:1);for(let i=0;i<n;i++)step(dt);
      if(S.run==='intro')drawIntro();else if(S.run==='free')drawFree();else if(S.run==='open')drawOpen();else if(S.run==='canopy')drawCanopy();else if(S.run==='landed')drawLanded();else if(S.run==='kort'){groundAt(.45,S.x,S.y);heltG.visible=false}
      /* disen over jorden, et pust af sky, og rystelsen ved en tordensky */
      dis.material.opacity=S.run==='free'||S.run==='intro'||S.run==='kort'?S.haze*.55:S.run==='open'?S.haze*.7:0;dis.visible=dis.material.opacity>.01;
      S.puf=Math.max(0,S.puf-dt*1.6);puffPlan.material.opacity=S.puf*.7;puffPlan.visible=S.puf>0;
      S.ryst=Math.max(0,S.ryst-dt);rod.position.x=S.ryst>0?Math.sin(t*70)*S.ryst*1.2:0;
      /* hun ligger i luften: armene og benene vipper lidt, håret blafrer */
      const u=helt.userData;u.haar.forEach((g,i)=>{g.scale.y=.85+.25*Math.sin(t*17+i*1.7)});u.arme.forEach((g,i)=>{g.rotation.z=(i?-1:1)*.06*Math.sin(t*5+i)});u.ben.forEach((g,i)=>{g.rotation.z=(i?-1:1)*.05*Math.sin(t*4.4+i)});
      if(skaerm.visible)skaerm.userData.fod.position.y=Math.sin(t*2.2)*.15;
      for(const g of tal){if(g.userData.vinker)g.children[0].rotation.z=.12*Math.sin(t*6+g.position.x);else{g.position.y=(t*.8)%1.2;}}}};
  function step(dt){if(S.run==='intro')stepIntro(dt);else if(S.run==='free')stepFree(dt);else if(S.run==='open')stepOpen(dt);else if(S.run==='canopy')stepCanopy(dt);else if(S.run==='landed')S.t+=dt}
  makeRoom(ctx,OPT);
  ctx.efter.push(()=>{el.removeEventListener('pointerdown',pd);removeEventListener('pointermove',pm);removeEventListener('pointerup',pu);removeEventListener('pointercancel',pu);removeEventListener('keydown',kd);removeEventListener('keyup',ku);
    pt&&pt.ryd();ban&&ban.fjern();for(const t of tekster)t.userData.ryd&&t.userData.ryd();if(tmpl.strib){tmpl.strib.dispose();tmpl.stribM.dispose()}S=null});
  ctx.test={S:()=>S,begynd,spol:s=>{for(let i=0;i<s*25;i++)OPT.tick(Rm.t+i*.04,.04)},auto:v=>{if(S)S.auto=v},
    tilstand:()=>S&&{fase:S.run,t:+S.t.toFixed(2),bobler:S.bubbles,ialt:S.bubN,h:+S.h.toFixed(1),x:+S.x.toFixed(1),y:+S.y.toFixed(1),th:Math.round(S.th),vind:+S.wind.s.toFixed(1),res:S.result||null}}};
