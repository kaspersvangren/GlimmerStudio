/* ============ Kosteflyvning (Skolen) ============
   Som i det oprindelige spil: tryk kort for at flyve op, tyngdekraften trækker ned. Ringene giver fart; misser man en, går det lidt langsommere.
   Hold fingeren nede for at lave et loop. Laves loopet lige i den nederste af to ringe over hinanden, går det op gennem den øverste,
   og så kommer et boost, der selv styrer gennem de næste fire ringe. To klassekammerater flyver samme bane i hver sin bane bagved,
   den ene god, den anden mindre god, og pladsen giver guld, sølv eller bronze. Stjerner = (4 − plads) + bobler delt med 2.
   Kasper (21. nov.): det skal give en større fornemmelse af fart end originalen. Derfor (hans ja til forslag 1–6):
   - byen er pap i mange lag i rigtig dybde: himlen står stille, bakkerne og skolen glider langsomt, tagene hurtigere, og lige foran
     os fejer lygtepæle, træer, vimpler, broer og byporten forbi
   - kameraet trækker sig lidt tilbage og ryster en anelse ved høj fart, og papirstrimler og glimmer fyger forbi
   - ringe i træk tænder fartlamperne, og en papirmølle på kosten snurrer efter farten
   - boostet er en komet med en hale af bånd og stjerner
   - klassekammeraterne er tæt på, og en stribe foroven viser, hvem der fører
   Tallene er originalens skærm (1600 × 1000, y nedad). Her er 1 punkt K enheder. */
ROOMS.kost=function(ctx){
  const K=.055,CD=150,P2=(g,sh,o,z)=>put(g,piece(sh,o),0,0,z);
  const PX=430,TOP=140,BOT=860,GRAV=1900,FLAP=-620,VMAXF=780,V0=490,BOOST_N=4,LOOP_R=150,LOOP_T=.95,HOLD_MS=260,BOOST_V=2.3;
  const LANES=[{z:-30,dy:7.5,k:.46},{z:-15,dy:3.8,k:.73}].map(L=>Object.assign(L,{kk:L.k*(150-L.z)/150,dd:L.dy*(150-L.z)/150}));
  const X=x=>x*K,Y=y=>(500-y)*K;
  let S=null,Rm=null,rod,hud,himmel,fjern,midt,naer,baneG,lanG=[],mig=null,tv,ptW,ptH,ban,lamper=[],stribe,prikker=[],kom=[],komT=0,baseFov=30,zoom=0,ryst=0;
  const tekster=[];
  /* ---------- banen ---------- */
  function makeCourse(){const rings=[],bubbles=[],dbl=new Set([6,15,24,33,42]);let x=1500,y=520;
    for(let i=0;i<50;i++){if(dbl.has(i)){const lo={x,y:660,dbl:'lo'},hi={x,y:360,dbl:'hi'};lo.pair=hi;hi.pair=lo;rings.push(lo,hi);y=540;x+=700;continue}
      y=clamp(y+(Math.random()*2-1)*240,260,700);rings.push({x,y});x+=470+Math.random()*130}
    const singles=rings.filter(r=>!r.dbl);for(let i=0;i+1<singles.length&&bubbles.length<16;i+=3){const a=singles[i],b=singles[i+1];bubbles.push({x:(a.x+b.x)/2,y:clamp((a.y+b.y)/2+(Math.random()<.5?-170:170),200,820)})}
    return{rings,bubbles,end:x+300}}
  function makeRivals(){const good=Math.random()<.5?0:1;return[0,1].map(i=>{const g=i===good,j=()=>Math.random()*.08;
    return{lane:LANES[i],li:i,x:0,y:520,vy:0,v:V0,ang:0,loop:null,boost:0,plan:null,seen:new Set(),finT:0,off:g?-40:-240,hit:g?.74+j():.5+j(),tryLoop:g?.6+j():.35+j(),aim:g?.72+j():.45+j(),wob:Math.random()*6}})}
  /* ---------- en ring: to halve, den bageste bag hende og den forreste foran, så hun flyver igennem ---------- */
  function bygRing(par,x,y,z,k,c,dbl){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(k);par.add(g);const rx=2.3,ry=6.5,e=hexOf(shade(c,-.4));
    const half=(s)=>{const p=[];for(let i=0;i<=24;i++){const a=-Math.PI/2+i/24*Math.PI;p.push([s*Math.cos(a)*rx,Math.sin(a)*ry])}return p};
    const bag=new THREE.Group(),for_=new THREE.Group();g.add(bag,for_);bag.position.z=-.9;for_.position.z=.9;
    for(const q of thick([half(-1)],.5))P2(bag,q,{color:hexOf(shade(c,-.18)),kind:'card',t:.3,edge:e},0);for(const q of thick([half(1)],.5))P2(for_,q,{color:c,kind:'card',t:.3,edge:e},0);
    P2(for_,starPts(0,ry+.2,1.1,.5,Math.PI/2),{color:dbl?'#fff0ff':'#fff6d0',kind:'card',t:.15,edge:e},.2);
    g.userData={puls:0};samlStatisk(g,{celle:1e6});return g}
  function bygBoble(par,x,y){const G=new THREE.Group();G.position.set(x,y,0);par.add(G);P2(G,circ(0,0,1.9,1.9,24),{color:'#bfe8ff',kind:'card',t:.25,edge:'#4a8ab8'},0);P2(G,circ(0,0,1.45,1.45,22),{color:'#eaf8ff',kind:'card',t:.04},.26);
    P2(G,starPts(0,0,1,.45,Math.PI/2),{color:'#ffc02e',kind:'card',t:.12,edge:'#a87a1a'},.3);P2(G,circ(-.75,.75,.28,.2,8),{color:'#ffffff',kind:'card',t:.03},.43);samlStatisk(G,{celle:1e6});return G}
  /* ---------- kulisserne ---------- */
  /* hvor et lag skal stå, for at glide med en bestemt brøkdel af banens fart (dybden gør resten) */
  const lagX=(camX,p,z)=>camX*(1-p*(CD-z)/CD);
  function bygHimmel(G){const B=box(-420,-200,420,260);P2(G,B,{t:.4,s:2,cap:2048,paint:P=>{P.wash('#2a2458',B,{top:'#161236',edge:0,clouds:4});P.wash('#8a5a8e',box(-420,-200,420,-40),{alpha:.55,edge:.9,clouds:3})}},0);
    put(G,piece(circ(110,120,16,16,40),{mat:paperMat('#fff4d0','tissue',{glow:'#ffe8a0',gi:1.2}),t:.4}),0,0,.5);P2(G,circ(104,126,4,3,14),{color:'#efe0b8',kind:'card',t:.05},.95);P2(G,circ(118,112,2.6,2.2,12),{color:'#efe0b8',kind:'card',t:.05},.95);
    const sm_=paperMat('#fffbe6','tissue',{glow:'#fff4c0',gi:1.4});for(let i=0;i<120;i++){const x=R(-400,400),y=R(-10,240),r=R(.6,1.6);put(G,piece(starPts(x,y,r,r*.42,R(TAU)),{mat:sm_,t:.05}),0,0,.3)}
    for(const[x,y,rx,ry]of[[-200,70,40,9],[-40,150,55,10],[160,40,46,8],[300,140,50,10]])P2(G,puff(x,y,rx,ry,10,.2),{color:'#4a3e78',kind:'card',t:.3,edge:'#2a2250'},.6)}
  function bygFjern(G,L){/* bakker og skolen langt væk, i mørkt blåt */
    for(let x=-300;x<L;x+=70+R(0,40)){const h=R(30,60),c=R(1)<.5?'#3a3468':'#2e2a58';P2(G,puff(x,-60,R(50,80),h,9,.12),{color:c,kind:'card',t:.4,edge:'#1e1a40'},R(0,4))}
    const slot=(x,y,s)=>{const g=new THREE.Group();g.position.set(x,y,6);g.scale.setScalar(s);G.add(g);const c='#2a2450',w=paperMat('#ffd890','tissue',{glow:'#ffc860',gi:1.6});
      P2(g,box(-24,0,24,22),{color:c,kind:'card',t:1},0);for(const tx of[-24,-8,8,24]){P2(g,box(tx-4,0,tx+4,32),{color:c,kind:'card',t:1.2},.2);P2(g,toCCW([[tx-5.5,32],[tx+5.5,32],[tx,44]]),{color:'#3a2a68',kind:'card',t:1},.3)}
      for(const[wx,wy]of[[-14,12],[0,14],[14,12],[-8,26],[8,26]])put(g,piece(box(wx-1.4,wy-2,wx+1.4,wy+2),{mat:w,t:.3}),0,0,1.1)};
    slot(70,-48,.8);slot(L*.62,-50,.7)}
  function bygMidt(G,L){/* byens tage og huse med lys i vinduerne, træer og lygter */
    const TAG=['#8a3a4a','#4a4a8a','#6a4a7a','#3a5a6a','#7a4a3a'],MUR=['#d8c0a0','#c8b8c8','#b8a890','#d0b8b8'],win=paperMat('#ffd890','tissue',{glow:'#ffc060',gi:1.6});
    let x=-160;while(x<L){const w=R(12,20),h=R(14,26),c=TAG[Math.floor(R(TAG.length))],m=MUR[Math.floor(R(MUR.length))],g=new THREE.Group();g.position.set(x,-62,R(-3,3));G.add(g);
      P2(g,box(-w/2,0,w/2,h),{color:hexOf(shade(m,-.35)),kind:'card',t:.8,edge:'#3a2a30'},0);P2(g,toCCW([[-w/2-1.2,h],[w/2+1.2,h],[w*.15,h+R(7,12)],[-w*.2,h+R(7,12)]]),{color:c,kind:'card',t:.9,edge:hexOf(shade(c,-.4))},.2);
      if(R(1)<.6)P2(g,box(w*.2,h+2,w*.2+2,h+9),{color:'#4a3a40',kind:'card',t:.8},-.1);
      for(let wy=4;wy<h-3;wy+=6)for(let wx=-w/2+3;wx<w/2-2;wx+=5)if(R(1)<.55)put(g,piece(box(wx,wy,wx+2,wy+3),{mat:win,t:.2}),0,0,.85);
      if(R(1)<.25){const t=new THREE.Group();t.position.set(w/2+5,-62,4);G.add(t);P2(t,box(-.8,0,.8,14),{color:'#4a3428',kind:'kraft',t:.8},0);P2(t,puff(0,18,7,7,9,.2),{color:'#2e4a3a',kind:'card',t:1,edge:'#1a2a22'},.3)}
      x+=w+R(1,6)}}
  /* lige foran os: lygtepæle, træer fra oven, vimpelsnore, tagrygge, to broer og byporten */
  function bygNaer(G,L){const lys=paperMat('#ffe2a0','tissue',{glow:'#ffc860',gi:1.8});let x=40;
    const lygte=x=>{const g=new THREE.Group();g.position.set(x,-30,0);G.add(g);P2(g,box(-.45,0,.45,24),{color:'#2a2238',kind:'card',t:.6},0);P2(g,toCCW(sm([[-1.6,24],[1.6,24],[1.2,27.5],[-1.2,27.5]],2)),{color:'#2a2238',kind:'card',t:.8},.1);put(g,piece(box(-1.1,24.3,1.1,27),{mat:lys,t:.5}),0,0,.3);Rm.glow(x,-4.5,1,'#ffc86a',9,true,G)};
    const trae=x=>{const g=new THREE.Group();g.position.set(x,26,0);G.add(g);P2(g,box(-1.2,-2,1.2,14),{color:'#3a2a20',kind:'kraft',t:.8},0);P2(g,puff(0,-3,9,6,10,.25),{color:'#1e3a2a',kind:'card',t:.8,edge:'#10201a'},.2);P2(g,puff(3,-5,6,4,8,.25),{color:'#2a4a34',kind:'card',t:.6},.6)};
    const vimpel=x=>{const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push([x+t*30,21-Math.sin(t*Math.PI)*4])}for(const q of thick([pts],.12))P2(G,q,{color:'#e8d8b8',kind:'water',t:.04},0);
      for(let i=0;i<16;i+=2){const[a,b]=[pts[i],pts[i+1]];P2(G,toCCW([[a[0],a[1]],[b[0],b[1]],[(a[0]+b[0])/2,(a[1]+b[1])/2-2.2]]),{color:['#e0457a','#ffd24a','#7fd8ff','#9be36a'][i/2%4],kind:'card',t:.05},.05)}};
    const tag=x=>{const g=new THREE.Group();g.position.set(x,-24,-2);G.add(g);const w=R(16,26),c=['#5a2a3a','#2a3458','#4a2a48'][Math.floor(R(3))];P2(g,toCCW([[-w/2,-10],[w/2,-10],[w/2-3,1],[-w/2+3,1]]),{color:c,kind:'card',t:1,edge:'#1a1020'},0);
      if(R(1)<.7){P2(g,box(w/4-1.4,0,w/4+1.4,6),{color:'#3a2a30',kind:'card',t:.9},.1);P2(g,box(w/4-1.9,6,w/4+1.9,7),{color:'#2a1e24',kind:'card',t:.9},.15)}};
    const bro=x=>{/* en stenbro over banen: dækket foroven og to piller forneden, så man flyver under den */const g=new THREE.Group();g.position.set(x,0,-6);G.add(g);const c='#6a6488',hole=[];for(let i=0;i<=20;i++){const a=Math.PI-i/20*Math.PI;hole.push([Math.cos(a)*13,-6+Math.sin(a)*21])}
      P2(g,{outer:box(-17,-30,17,23),holes:[toCCW([[-13,-30],...hole,[13,-30]])]},{t:2,s:6,paint:P=>{P.wash(c,box(-17,-30,17,23),{top:'#8a84a8',edge:.4,clouds:4});P.ashlar(null,'#7a7498',{rowH:[2.4,3],bw:[3,4.2],tint:.06,ink:.25})}},0);
      for(const s of[-1,1])put(g,piece(box(s*15-1,23,s*15+1,26),{mat:lys,t:.6}),0,0,1);Rm.glow(x-15,25,-4,'#ffc86a',8,true,G);Rm.glow(x+15,25,-4,'#ffc86a',8,true,G)};
    const port=x=>{/* byporten: to tårne med spidse tage og en bue over banen */const g=new THREE.Group();g.position.set(x,0,-4);G.add(g);const c='#8a5a4a';
      for(const s of[-1,1]){P2(g,box(s*14-5,-32,s*14+5,30),{color:c,kind:'card',t:2,edge:'#4a2a22'},0);P2(g,toCCW([[s*14-6.5,30],[s*14+6.5,30],[s*14,42]]),{color:'#3a2a58',kind:'card',t:2},.2);put(g,piece(box(s*14-1.4,14,s*14+1.4,19),{mat:lys,t:.4}),0,0,2.1)}
      const top=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI;top.push([Math.cos(a)*-9,20+Math.sin(a)*4])}P2(g,{outer:box(-9,18,9,30),holes:[]},{color:'#7a4a3a',kind:'card',t:1.6,edge:'#4a2a22'},.1);
      P2(g,toCCW([[-9,18],...top.map(([a,b])=>[-a,b]).reverse(),[9,18]].reverse()),{color:'#2a1a20',kind:'card',t:.1},1.75)};
    const BRO=new Set([Math.round(L*.28),Math.round(L*.66)]),PORT=Math.round(L*.47);
    for(x=30;x<L;x+=R(16,26)){const k=R(1);if(k<.3)lygte(x);else if(k<.5)trae(x);else if(k<.68)vimpel(x);else tag(x);if(R(1)<.5)tag(x+R(4,10))}
    for(const b of BRO)bro(b);port(PORT)}
  /* glimmer og papirstrimler, der hænger i luften i mange dybder og suser forbi */
  function bygGlimmer(G,L){const cols=['#fff6d0','#ffd24a','#ff8fc7','#7fd8ff','#c79bff'];for(let i=0;i<L/4;i++){const z=R(4,70),st=R(1)<.5,m=piece(st?starPts(0,0,.45,.2,R(TAU)):box(-.08,-.7,.08,.7),{mat:paperMat(cols[i%5],'tissue',{glow:cols[i%5],gi:.9}),t:.03});m.position.set(R(-20,L),R(-30,30)*(CD-z)/CD,z);m.rotation.z=R(TAU);G.add(m)}}
  /* ---------- et nyt løb ---------- */
  function nyt(){if(S)ryd();const look=i=>{const H=[['#3a2a20','#5a4030','#2a1a10'],['#b5432a','#d8603a','#8a2a1a'],['#f2c14e','#f8dc8c','#c08628'],['#e8e4f4','#ffffff','#b8b0c8'],['#2a2238','#4a3a58','#1a1428']],c=['#2e4a7a','#3e7a4a','#a0526b','#2e6a7a','#7a2e5a','#c06a2a'];
      return Object.assign({},ctx.look,{hair:H[Math.floor(R(H.length))],col:{'tøj':c[Math.floor(R(c.length))],hat:c[Math.floor(R(c.length))]},hår:['langt','knolde','topknold'][Math.floor(R(3))]})};
    S={course:makeCourse(),x:0,y:520,vy:0,v:V0,ang:0,t:0,run:'kort',cam:-PX,evT:8,seen:new Set(),rings:0,ringsAll:0,bubbles:0,loop:null,boost:0,finT:0,streak:0,auto:!!window.KOST_AUTO,holdT:0};
    S.rivals=makeRivals();S.ringsAll=S.course.rings.length;
    baneG=new THREE.Group();rod.add(baneG);for(const r of S.course.rings)r.g=bygRing(baneG,X(r.x),Y(r.y),0,1,r.dbl?'#c79bff':'#ffd24a',!!r.dbl);
    for(const b of S.course.bubbles)b.g=bygBoble(baneG,X(b.x),Y(b.y));
    /* klassekammeraternes baner bagved: de samme ringe i deres egen farve, mindre og lidt højere oppe */
    S.rivals.forEach(rv=>{const g=new THREE.Group();rod.add(g);lanG.push(g);rv.look=look(rv.li);const c=hexOf(shade(rv.look.col['tøj'],.25));rv.els=new Map();for(const r of S.course.rings)rv.els.set(r,bygRing(g,X(r.x),Y(r.y)*rv.lane.kk+rv.lane.dd,rv.lane.z,rv.lane.kk,c,!!r.dbl));
      rv.R=bygRytter(rv.look);samlStiv(rv.R.G,[rv.R,rv.R.F]);rv.R.G.scale.setScalar(.34*rv.lane.kk);rod.add(rv.R.G)});
    /* start- og målport */
    bygPort(baneG,X(130),'Start');bygPort(baneG,X(S.course.end),'Mål',true);
    if(!mig){mig=bygRytter(ctx.look);samlStiv(mig.G,[mig,mig.F]);mig.G.scale.setScalar(.34);rod.add(mig.G)}
    /* intet her kaster skygger (det koster en ekstra tegning af alt) */rod.traverse(q=>{if(q.isMesh){q.userData.noShadow=true;q.castShadow=q.receiveShadow=false}});
    tv.saet(0,0);tv.saet(1,0);tv.saet(2,3);for(const l of lamper)l.lm.emissiveIntensity=.05;
    ban.vis('Klar til at flyve?',{portraet:'sky',txt2:'Tryk for at flyve op. Hold fingeren nede for et loop. Tryk for at begynde',sek:0,col:'#2e4a7a',y:6});
    S.rivals.forEach((rv,i)=>{prikker[i+1].material.color.set(rv.look.col['tøj'])});tegn()}
  function ryd(){rod.remove(baneG);emptyGroup(baneG);for(const g of lanG){rod.remove(g);emptyGroup(g)}lanG=[];for(const rv of S.rivals)rod.remove(rv.R.G);for(const q of kom)q.m.visible=false}
  function bygPort(par,x,txt,maal){/* en port af balloner og et skilt, og ved målet en ternet snor gennem alle tre baner */const g=new THREE.Group();g.position.set(x,0,0);par.add(g);
    for(const s of[-1,1]){const y=s*21.5;P2(g,box(-.5,Math.min(y,s*30),.5,Math.max(y,s*30)),{color:'#e8d8b8',kind:'kraft',t:.5},-.5)}
    const B=[[-1.9,-4.2,'#e0457a'],[0,-5.6,'#f2c14e'],[1.9,-4.2,'#7fd8ff'],[-.8,-2.8,'#c79bff'],[.9,-2.7,'#5fe0a0']];for(const s of[-1,1])for(const[bx,by,c]of B)P2(g,circ(bx,s*(21.5+Math.abs(by)),1.4,1.7,16),{color:c,kind:'card',t:.6,edge:hexOf(shade(c,-.35))},.2);
    const t=papirTekstMesh(txt,maal?'#c0283e':'#2e4a7a',3,FONT.arkade);t.position.set(0,24.5,1);g.add(t);tekster.push(t);
    if(maal){for(let i=0;i<22;i++){const y=-21+i*2;P2(g,box(-.9,y,.9,y+2),{color:i%2?'#ffffff':'#2a2340',kind:'card',t:.1},.3)}for(const L of LANES)for(let i=0;i<14;i++){const y=(-21+i*3)*L.kk+L.dd;P2(g,box(-.9,y,.9,y+1.5),{color:i%2?'#ffffff':'#2a2340',kind:'card',t:.1},L.z+.3)}}}
  /* ---------- flyvningen ---------- */
  function begynd(){if(!S||S.run!=='kort')return;ban.skjul();S.run='count';S.ct=0;S.cn=-1}
  function flap(){if(!S||S.run!=='fly'||S.loop||S.boost>0)return;S.vy=FLAP;LYD.fil('kost.flap',()=>LYD.sus(),.55,R(.95,1.1))}
  const pairAt=f=>S.course.rings.find(r=>r.dbl==='lo'&&!f.seen.has(r.pair)&&r.x-f.x<180&&r.x-f.x>-230&&Math.abs(r.y-f.y)<170);
  function startLoop(f){if(f.loop||f.boost>0)return false;const hit=pairAt(f)||null;
    f.loop=hit?{x0:hit.x,y0:hit.y,sx:f.x,sy:f.y,t:0,cam:hit.x-PX,hit,px:f.x}:{x0:f.x,y0:f.y,sx:f.x,sy:f.y,t:0,cam:f.x-PX,hit:null,px:f.x-.01};
    if(hit&&!f.seen.has(hit)){passRing(f,hit);(f.loop.got=new Set()).add(hit)}return true}
  function tryLoop(){if(!S||S.run!=='fly')return;if(startLoop(S)){S.vy=0;if(S.loop.hit)LYD.guld();else LYD.op();ptW.pop(X(S.x)+2,Y(S.y)+7,3,'Loop!',{col:'#c79bff',h:2.8})}}
  function passRing(f,r){if(f.seen.has(r))return;f.seen.add(r);f.passN=(f.passN||0)+1;if(f.boost<=0)f.v=Math.min(V0*1.38,f.v+55);
    if(f!==S){const el=f.els&&f.els.get(r);if(el)el.userData.puls=1;return}
    S.rings++;S.streak++;r.g.userData.puls=1;LYD.fil('kost.ring',()=>LYD.ding(),.7,1+Math.min(S.streak,8)*.04);Rm.burst(X(r.x),Y(r.y),1.5,8,r.dbl?'rgba(220,190,255,.95)':'rgba(255,236,170,.95)',3);tv.saet(0,S.rings);
    if(S.streak>=3&&S.streak%3===0)ptW.pop(X(r.x)+3,Y(r.y)+8,3,S.streak+' i træk!',{col:'#ffb020',h:2.6})}
  function missRing(f,r,d){f.seen.add(r);if(d<140){f.v=Math.max(V0*.8,f.v-60);if(f===S){S.vy=S.y<r.y?-260:260;LYD.dunk()}}if(f===S)S.streak=0}
  function moveLoop(f,dt){const L=f.loop;L.t+=dt/LOOP_T;const t=Math.min(1,L.t),a=Math.PI/2-2*Math.PI*t,c=Math.cos(a),sn=Math.sin(a),u=Math.min(1,t/.38),b=u*u*(3-2*u);
    f.x=(L.sx+(L.x0-L.sx)*b)+LOOP_R*c;f.y=(L.sy+(L.y0-L.sy)*b)-LOOP_R+LOOP_R*sn;f.ang=Math.atan2(-c,sn)*180/Math.PI;
    for(const r of S.course.rings){if(f.seen.has(r)||Math.abs(r.x-L.x0)>LOOP_R+5)continue;if((L.px-r.x)*(f.x-r.x)<=0&&L.px!==f.x&&Math.abs(f.y-r.y)<100){passRing(f,r);(L.got=L.got||new Set()).add(r)}}
    L.px=f.x;
    if(t>=1){f.loop=null;f.x=L.x0;f.y=L.y0;f.ang=0;f.vy=0;const pair=L.got&&[...L.got].find(r=>r.dbl==='hi'&&f.seen.has(r.pair));
      if(pair){f.loopN=(f.loopN||0)+1;f.boost=BOOST_N;f.v=V0*BOOST_V;if(f===S){LYD.op();ptW.pop(X(S.x)+6,Y(S.y)+6,3,'BOOST!',{col:'#ff4fa0',h:4.4});ryst=.5}}}}
  function moveBoost(f,dt){const x0=f.x;f.x+=f.v*dt;const nr=S.course.rings.find(r=>!f.seen.has(r)&&r.x>x0&&!r.dbl);if(!nr){f.boost=0;return}
    f.y+=(nr.y-f.y)*Math.min(1,dt*6);f.vy=0;f.ang=0;if(x0<nr.x&&f.x>=nr.x){passRing(f,nr);f.boost--;f.bN=(f.bN||0)+1;if(f.boost<=0)f.v=V0*1.5}}
  function crossRings(f,x0){for(const r of S.course.rings){if(f.seen.has(r)||!(x0<r.x&&f.x>=r.x))continue;const d=Math.abs(f.y-r.y);if(d<100)passRing(f,r);else if(!r.dbl)missRing(f,r,d)}}
  function step(dt){if(S.run==='count'){S.ct+=dt;const n=Math.floor(S.ct/.7);if(n!==S.cn&&n<4){S.cn=n;const t=['3','2','1','Afsted!'][n];ptH.pop(0,4,8,t,{col:n<3?'#ffd24a':'#ff4fa0',h:n<3?9:7,tilt:0});n<3?LYD.fil('kost.tael',()=>LYD.pip()):LYD.fil('kost.start',()=>LYD.op())}if(S.ct>=2.8){S.run='fly';S.t=0}return}
    if(S.run==='fly'||S.run==='done')S.t+=dt;
    for(const rv of S.rivals)if(S.run==='fly'||S.run==='done')rivalStep(rv,dt);
    if(S.run!=='fly'&&S.run!=='done')return;
    /* efter målstregen: kameraet bliver stående, og hun flyver roligt ud af billedet til højre (Kasper 23. nov.) */
    if(S.run==='done'){S.loop=null;S.boost=0;S.x+=S.v*dt;S.vy+=(-90-S.vy)*Math.min(1,dt*3);S.y=clamp(S.y+S.vy*dt,TOP,BOT);S.ang=clamp(S.vy/30,-16,22);return}
    if(S.loop){moveLoop(S,dt);if(S.loop)S.cam+=(S.loop.cam-S.cam)*Math.min(1,dt*7);else S.cam=S.x-PX;return}
    const x0=S.x;
    if(S.boost>0)moveBoost(S,dt);
    else{const lead=Math.max(...S.rivals.map(rv=>rv.x))-S.x,tail=lead>250?Math.min(.12,(lead-250)/2500):0;S.x+=S.v*(1+tail)*dt;
      /* en rolig start: tyngdekraften tager først fat efter lidt over et sekund (note 8026: kaos i starten) */S.vy=Math.min(VMAXF,S.vy+GRAV*Math.min(1,S.t/1.3)*dt);S.y+=S.vy*dt;if(S.y>BOT){S.y=BOT;S.vy=-480;S.v=Math.max(V0*.8,S.v-40);if(S.t>(S.dunkT||0)){S.dunkT=S.t+1;LYD.dunk()}}if(S.y<TOP){S.y=TOP;S.vy=Math.max(0,S.vy)}
      S.v+=(V0-S.v)*Math.min(1,dt*.35);crossRings(S,x0);if(S.auto)autopilot();S.ang=clamp(S.vy/30,-16,22)}
    for(const b of S.course.bubbles){if(b.got)continue;const dx=b.x-S.x,dy=b.y-S.y;if(dx*dx+dy*dy<(S.boost>0?130*130:85*85)){b.got=true;S.bubbles++;b.g.visible=false;LYD.fil('boble.saml',()=>LYD.plop(),.6);Rm.burst(X(b.x),Y(b.y),1,8,'rgba(255,236,170,.95)',2.5);ptW.pop(X(b.x),Y(b.y)+3,3,'+1',{col:'#ffd86b',h:2.6});tv.saet(1,S.bubbles)}}
    S.cam=S.x-PX;
    if(S.run==='fly'&&S.x>=S.course.end){S.run='done';S.finT=S.t;finish()}}
  function rivalStep(rv,dt){if(rv.loop){moveLoop(rv,dt);return}if(rv.boost>0){moveBoost(rv,dt);if(!rv.finT&&rv.x>=S.course.end)rv.finT=S.t;return}
    const x0=rv.x,band=1+clamp((S.x+rv.off-rv.x)/2500,-.15,.15);rv.x+=rv.v*band*dt;rv.v+=(V0-rv.v)*Math.min(1,dt*.35);
    const r=S.course.rings.find(q=>!rv.seen.has(q)&&q.x>rv.x-5&&(!q.dbl||q.dbl==='lo'));
    if(r&&(!rv.plan||rv.plan.r!==r)){const off=()=>(Math.random()<.5?-1:1)*(130+Math.random()*70);
      if(r.dbl){const lp=Math.random()<rv.tryLoop,aimOk=Math.random()<rv.aim;rv.plan=lp?{r,loop:true,y:r.y+(aimOk?(Math.random()*40-20):off()*.8)}:{r,y:Math.random()<rv.hit?(Math.random()<.5?r.y:r.pair.y)+(Math.random()*40-20):(r.y+r.pair.y)/2+(Math.random()*30-15)}}
      else rv.plan={r,y:Math.random()<rv.hit?r.y+(Math.random()*50-25):r.y+off()}}
    const ty=rv.plan?rv.plan.y:480,k=Math.min(1,dt*2.6),ny=rv.y+(ty-rv.y)*k+Math.sin(S.t*2+rv.wob)*.6;rv.ang=clamp((ny-rv.y)/dt/30,-16,22);rv.y=clamp(ny,TOP,BOT);
    if(rv.plan&&rv.plan.loop&&rv.x>=rv.plan.r.x-20){rv.plan.loop=false;startLoop(rv);return}crossRings(rv,x0);if(!rv.finT&&rv.x>=S.course.end)rv.finT=S.t}
  function autopilot(){const r=S.course.rings.find(q=>!S.seen.has(q)&&q.x>S.x-10&&q.dbl!=='hi');if(r&&r.dbl==='lo'&&Math.abs(r.x-S.x)<50&&Math.abs(r.y-S.y)<80&&Math.random()<.7){tryLoop();return}
    const ty=r?r.y+10:520;if(S.y>ty+20&&S.vy>-120)S.vy=FLAP}
  function finish(){const T=S.finT,rTimes=S.rivals.map(rv=>rv.finT||T+Math.max(.1,(S.course.end-rv.x)/V0)),place=1+rTimes.filter(t=>t<T).length,medal=['guld','sølv','bronze'][place-1],stars=(4-place)+Math.floor(S.bubbles/2);
    SPIL.data.kost=(SPIL.data.kost||0)+1;SPIL.giv(stars);LOG.row('kost',{plads:place,tid:+T.toFixed(1),ringe:S.rings,af:S.ringsAll,bobler:S.bubbles,loops:S.loopN||0,stars});
    S.result={place,medal,stars,time:T,rings:S.rings,bubbles:S.bubbles,loops:S.loopN||0,rivals:rTimes.map(t=>+t.toFixed(1))};tv.saet(2,place);
    setTimeout(()=>{if(!S||!ctx.alive)return;LYD.fanfare();ban.vis(place===1?'Du vandt løbet!':`Du blev nummer ${place}!`,{txt2:`${medal[0].toUpperCase()+medal.slice(1)} på ${T.toFixed(1).replace('.',',')} sekunder`,sek:0,col:place===1?'#c0283e':'#2e4a7a',y:8});
      ctx.vent(`${place===1?'Du vandt løbet!':`Du blev nummer ${place}!`} Du fløj gennem ${S.rings} af ${S.ringsAll} ringe og samlede ${S.bubbles} ${S.bubbles===1?'stjerneboble':'stjernebobler'}. Du fik ${stars} ${stars===1?'stjerne':'stjerner'}! Tryk for at flyve igen.`,()=>{ban.skjul();nyt()},{portraet:'sky'})},S.auto?60:1200)}
  /* ---------- tegn ---------- */
  function tegn(){const camX=X(S.cam+800);Rm.cam.position.x=camX+(ryst>0?Math.sin(Rm.t*60)*ryst*.5:0);Rm.cam.position.y=ryst>0?Math.cos(Rm.t*53)*ryst*.4:0;
    hud.position.x=camX;himmel.position.x=camX;fjern.position.x=lagX(camX,.12,fjern.position.z);midt.position.x=lagX(camX,.42,midt.position.z);
    /* fart: kameraet trækker sig lidt tilbage, når det går stærkt, og mere under boost */
    const fart=S.boost>0?BOOST_V:S.v/V0,maal=clamp((fart-1)/.38,0,1)*.1+(S.boost>0?.12:0);zoom+=(maal-zoom)*.06;Rm.cam.fov=baseFov*(1+zoom);Rm.cam.updateProjectionMatrix();
    mig.G.position.set(X(S.x),Y(S.y),.3);mig.G.rotation.z=-S.ang*Math.PI/180;mig.tick(Rm.t,{fart:fart*(S.run==='kort'||S.run==='count'?.4:1),vy:S.vy/600});
    for(const rv of S.rivals){const n=Math.abs(rv.x-S.x)<260&&S.t>4&&S.run==='fly'?1:0;rv.near=(rv.near||0)+(n-(rv.near||0))*.05;const z=rv.lane.z*(1-.35*rv.near);rv.R.G.position.set(X(rv.x),Y(rv.y)*rv.lane.kk+rv.lane.dd,z+.3);rv.R.G.rotation.z=-rv.ang*Math.PI/180;rv.R.tick(Rm.t+rv.wob,{fart:rv.boost>0?BOOST_V:rv.v/V0})}
    for(const r of S.course.rings){const u=r.g.userData;if(u.puls>0){u.puls=Math.max(0,u.puls-.05);r.g.scale.setScalar(1+.25*Math.sin(u.puls*Math.PI))}}
    for(const rv of S.rivals)for(const[r,g]of rv.els){const u=g.userData;if(u.puls>0){u.puls=Math.max(0,u.puls-.05);g.scale.setScalar(rv.lane.kk*(1+.25*Math.sin(u.puls*Math.PI)))}}
    for(const b of S.course.bubbles)if(!b.got)b.g.rotation.z=Math.sin(Rm.t*2+b.x)*.15;
    /* fartlamperne: én for hver to ringe i træk, højst fire */const nl=Math.min(4,Math.floor(S.streak/2)+(S.boost>0?4:0));lamper.forEach((l,i)=>{l.lm.emissiveIntensity=i<nl?1.8:.05});
    if(S.run==='fly')tv.saet(2,1+S.rivals.filter(rv=>rv.x>S.x).length);/* stribe med hvem der fører */const E=S.course.end;[S.x,...S.rivals.map(rv=>rv.x)].forEach((x,i)=>{prikker[i].position.x=-15+30*clamp(x/E,0,1)})}
  /* kometen: bånd og stjerner bag hende, når det går stærkt */
  function komet(dt){const fart=S.boost>0?BOOST_V:S.v/V0;komT-=dt;if(S.run==='fly'&&(fart>1.15||S.boost>0)&&komT<=0){komT=S.boost>0?.025:.07;const q=kom.find(q=>!q.m.visible);if(q){q.m.visible=true;q.t=0;q.life=S.boost>0?.8:.45;q.m.position.set(X(S.x)-3.5+R(-.5,.5),Y(S.y)-.4+R(-.8,.8),R(-.3,.3));q.m.rotation.z=R(TAU);q.s=S.boost>0?R(1,1.6):R(.5,.9)}}
    for(const q of kom){if(!q.m.visible)continue;q.t+=dt;const k=q.t/q.life;if(k>=1){q.m.visible=false;continue}q.m.scale.setScalar(q.s*(1-k));q.m.rotation.z+=dt*3}}
  /* ---------- begivenhederne i baggrunden, som i originalen: fyrværkeri, flagermus, stjerneskud og lanterner ----------
     De sker i et lag mellem bakkerne og tagene (eller på himlen), der følger med kameraet, så de altid kan ses. */
  let evG=null;const EV=[];
  function bygEv(){evG=new THREE.Group();evG.position.z=-160;rod.add(evG);
    const sort='#14102e';
    for(let i=0;i<5;i++){const g=new THREE.Group();g.visible=false;evG.add(g);P2(g,circ(0,0,1.2,.9,12),{color:sort,kind:'card',t:.2},0);const vg=[];for(const sx of[-1,1]){const v=new THREE.Group();g.add(v);P2(v,toCCW([[0,0],[sx*1.4,1.2],[sx*3.6,1.1],[sx*3.2,0],[sx*2.6,-.5],[sx*2,.1],[sx*1.2,-.5]].map(([x,y])=>[x,y])),{color:sort,kind:'card',t:.1},0);vg.push(v)}EV.push({k:'bat',g,vg,t:9})}
    for(let i=0;i<2;i++){const g=new THREE.Group();g.visible=false;evG.add(g);put(g,piece(box(-.12,-7,.12,0),{mat:paperMat('#fff6d0','tissue',{glow:'#fff0b0',gi:1.6}),t:.05}),0,0,0);put(g,piece(starPts(0,0,1.4,.6,0),{mat:paperMat('#ffffff','tissue',{glow:'#fff6d0',gi:2}),t:.05}),0,0,.05);EV.push({k:'skud',g,t:9})}
    for(let i=0;i<4;i++){const g=new THREE.Group();g.visible=false;evG.add(g);const c=['#ffb347','#ff8fc7','#ffe27a'][i%3];put(g,piece(box(-1.2,-1.6,1.2,1.6),{mat:paperMat(c,'tissue',{glow:c,gi:1.4}),t:1}),0,0,0);P2(g,box(-1.3,1.5,1.3,1.9),{color:'#5a3a28',kind:'kraft',t:.3},.6);EV.push({k:'lanterne',g,t:9})}
    for(let i=0;i<3;i++){const g=new THREE.Group();g.visible=false;evG.add(g);const raket=put(g,piece(circ(0,0,.5,.5,10),{mat:paperMat('#fff6d0','tissue',{glow:'#ffd890',gi:2}),t:.1}),0,0,0);const gn=[];for(let j=0;j<16;j++){const m=put(g,piece(starPts(0,0,.9,.38,0),{mat:paperMat('#ffffff','tissue',{glow:'#ffffff',gi:1.6}),t:.05}),0,0,.1);m.visible=false;gn.push(m)}EV.push({k:'fyr',g,raket,gn,t:9})}
    evG.traverse(q=>{if(q.isMesh)q.userData.noShadow=true})}
  function startEv(){const k=['fyr','fyr','bat','skud','lanterne'][Math.floor(R(5))],hh=Math.tan(baseFov*Math.PI/360)*(CD+160),hw=hh*Rm.cam.aspect;
    if(k==='bat'){const y=R(hh*.25,hh*.7);EV.filter(e=>e.k==='bat').forEach((e,i)=>{e.t=-i*.15;e.dur=7;e.x0=hw+10+i*4;e.x1=-hw-20;e.y=y+(i%3)*3;e.g.visible=true})}
    else{const q=EV.find(q=>q.k===k&&!q.g.visible);if(!q)return;q.t=0;q.g.visible=true;q.x=R(-hw*.7,hw*.7);
      if(k==='skud'){q.dur=1.2;q.y=R(hh*.5,hh*.9)}if(k==='lanterne'){q.dur=9;q.y=-hh}if(k==='fyr'){q.dur=2.6;q.top=R(hh*.2,hh*.6);q.y=-hh;const c=['#ff5fa8','#ffe27a','#7fd8ff','#9be36a','#c79bff','#ff8a3d'][Math.floor(R(6))];q.gn.forEach((m,i)=>{m.material=paperMat(i%3?c:'#ffffff','tissue',{glow:i%3?c:'#ffffff',gi:1.6});m.visible=false});q.raket.visible=true;q.knald=false;/* hylet, mens raketten stiger (Kasper 26. nov.) */if(S.run==='fly')LYD.fil('kost.fyr.op',null,.5,R(.95,1.08))}}}
  function tickEv(dt){if(!evG)return;const camX=X(S.cam+800);evG.position.x=camX;const hh=Math.tan(baseFov*Math.PI/360)*(CD+160);
    if(S.run==='fly'&&S.t>S.evT){startEv();S.evT=S.t+4+Math.random()*5}
    for(const e of EV){if(!e.g.visible)continue;e.t+=dt;if(e.t<0)continue;const u=e.t/(e.dur||1);if(u>=1){e.g.visible=false;continue}
      if(e.k==='bat'){e.g.position.set(mix(e.x0,e.x1,u),e.y+Math.sin(e.t*6)*1.5,0);const f=Math.sin(e.t*22);e.vg.forEach((v,i)=>{v.scale.y=.3+.7*Math.abs(f);v.rotation.z=(i?-1:1)*.2*f})}
      if(e.k==='skud'){e.g.position.set(e.x-u*60,e.y-u*20,0);e.g.rotation.z=1.25;e.g.scale.setScalar(Math.sin(u*Math.PI))}
      if(e.k==='lanterne'){e.g.position.set(e.x+Math.sin(e.t*.8)*4,mix(-hh,hh*1.1,u),0);e.g.rotation.z=Math.sin(e.t*1.3)*.12}
      if(e.k==='fyr'){if(u<.35){e.raket.position.set(0,0,0);e.g.position.set(e.x,mix(-hh,e.top,u/.35),0)}else{if(!e.knald){e.knald=true;e.raket.visible=false;e.gn.forEach(m=>m.visible=true);if(S.run==='fly')LYD.fil('kost.fyr',()=>LYD.puf(),1,R(.92,1.08))}
        const k=(u-.35)/.65;e.gn.forEach((m,i)=>{const a=i/16*TAU,d=4+14*Math.sqrt(k);m.position.set(Math.cos(a)*d,Math.sin(a)*d-8*k*k,.1);m.scale.setScalar(1.2*(1-k))})}}}}
  /* ---------- styring ---------- */
  const el=renderer.domElement;let holdT=0;
  const pd=e=>{if(!S||!ctx.alive||!Rm||!Rm.ready)return;if(S.run==='kort'){begynd();return}flap();clearTimeout(holdT);holdT=setTimeout(()=>{holdT=0;tryLoop()},HOLD_MS)};
  const pu=()=>{clearTimeout(holdT);holdT=0};
  const kd=e=>{if(!S)return;if(e.key===' '||e.key==='ArrowUp'){e.preventDefault();if(S.run==='kort')begynd();else flap()}if(e.key==='l'||e.key==='L'||e.key==='ArrowRight')tryLoop()};
  el.addEventListener('pointerdown',pd);addEventListener('pointerup',pu);addEventListener('pointercancel',pu);addEventListener('keydown',kd);
  /* hele banen lægges over på grafikchippen, før løbet starter: ellers sker det lidt ad gangen, efterhånden som tingene kommer frem, og det giver hak (Kasper 22. nov.) */
  function forvarm(Rm){const slaaet=[];Rm.live.traverse(q=>{if(q.isMesh&&q.frustumCulled){q.frustumCulled=false;slaaet.push(q)}});try{renderer.compile(Rm.live,Rm.cam);const rt=new THREE.WebGLRenderTarget(64,64);renderer.setRenderTarget(rt);renderer.render(Rm.live,Rm.cam);renderer.setRenderTarget(null);rt.dispose()}catch(e){}for(const q of slaaet)q.frustumCulled=true}
  /* ---------- rummet ---------- */
  const OPT={bg:'#1c1838',fit:(c,w,h)=>{const asp=w/h,HH=Math.max(50,88/asp);baseFov=2*Math.atan(HH/2/CD)*180/Math.PI;c.fov=baseFov;c.position.set(c.position.x||0,0,CD);c.lookAt(c.position.x||0,0,0)},
    sky:'#c8c0ff',ground:'#3a3048',amb:1.1,key:{col:'#d8d8ff',i:1.3,pos:[-60,90,200],tgt:[0,0,-60],box:[-80,80,60,-60]},P_:{dof:[0,0],haze:[0,0,0]},
    build:R_=>[()=>{Rm=R_;rod=new THREE.Group();Rm.live.add(rod);himmel=new THREE.Group();himmel.position.z=-420;rod.add(himmel);bygHimmel(himmel);samlStatisk(himmel,{celle:1e6});
        fjern=new THREE.Group();fjern.position.set(0,0,-250);rod.add(fjern);bygFjern(fjern,900);samlStatisk(fjern,{celle:260})},
      ()=>{midt=new THREE.Group();midt.position.set(0,0,-110);rod.add(midt);bygMidt(midt,1450);samlStatisk(midt,{celle:220})},
      ()=>{naer=new THREE.Group();naer.position.set(0,0,40);rod.add(naer);bygNaer(naer,1720);samlStatisk(naer,{celle:120});const glim=new THREE.Group();rod.add(glim);bygGlimmer(glim,1720);samlStatisk(glim,{celle:160})},
      ()=>{/* tavlen og skiltene hænger helt fremme, foran lygtepæle og vimpler */hud=new THREE.Group();hud.position.z=60;hud.scale.setScalar(.6);rod.add(hud);tv=papirTavle(hud,[{navn:'Ringe',cifre:2},{navn:'Bobler',cifre:2},{navn:'Plads',cifre:1}],{x:30,y:20,z:20,s:.75});
        ptW=papirTekster(rod);ptH=papirTekster(hud);ban=papirBanner(hud,{y:6,z:22,w:46});
        /* fartlamperne og stribe med prikker foroven */
        for(let i=0;i<4;i++){const lm=paperMat('#ffe090','tissue',{glow:'#ffb040',gi:1.6}).clone(),m=put(hud,piece(circ(0,0,.75,.75,14),{t:.3,mat:lm}),0,0,20);lamper.push({m,lm})}
        stribe=new THREE.Group();hud.add(stribe);P2(stribe,box(-16,-.35,16,.35),{color:'#e8d8b8',kind:'kraft',t:.2},0);for(let i=0;i<12;i++)P2(stribe,box(15.2,-1+i%2*.5+(i>5?0:0),16,-.5+i%2*.5),{color:i%2?'#ffffff':'#2a2340',kind:'card',t:.1},.25);
        for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(.75,18),new THREE.MeshBasicMaterial({color:i?'#ffffff':((ctx.look.col&&ctx.look.col['tøj'])||'#6a3fa2')}));m.position.z=.3+i*.01;stribe.add(m);prikker.push(m);
          const kant=new THREE.Mesh(new THREE.RingGeometry(.75,1,18),new THREE.MeshBasicMaterial({color:'#fffaf0'}));m.add(kant)}
        {const cols=['#ff8fc7','#ffd24a','#7fd8ff','#fff6d0'];for(let i=0;i<40;i++){const m=piece(i%3?starPts(0,0,.7,.3,0):box(-.15,-.9,.15,.9),{mat:paperMat(cols[i%4],'tissue',{glow:cols[i%4],gi:1.3}),t:.05});m.visible=false;rod.add(m);kom.push({m,t:0,life:.5,s:1})}}
        samlStiv(hud,[{l:lamper.map(l=>l.m),p:prikker}]);bygEv();rod.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});nyt();forvarm(Rm)}],
    tick:(t,dt)=>{if(!S)return;const hh=Math.tan(baseFov*Math.PI/360)*CD,hw=hh*Rm.cam.aspect,sz=(CD-20)/CD;
      tv.G.position.set((hw-13)*sz,(hh-4.5)*sz,20);lamper.forEach((l,i)=>l.m.position.set((hw-21+i*2.2)*sz,(hh-9.2)*sz,20));stribe.position.set(0,(hh-3)*sz,20);
      const n=window.KOST_WARP||(S.auto?4:1);for(let i=0;i<n;i++)step(dt);ryst=Math.max(0,ryst-dt);if(S.boost>0)ryst=Math.max(ryst,.12);
      tegn();komet(dt);tickEv(dt);tv.tick(dt);ptW.tick(dt);ptH.tick(dt);ban.tick(dt)}};
  Rm=makeRoom(ctx,OPT);
  ctx.efter.push(()=>{el.removeEventListener('pointerdown',pd);removeEventListener('pointerup',pu);removeEventListener('pointercancel',pu);removeEventListener('keydown',kd);clearTimeout(holdT);
    ptW&&ptW.ryd();ptH&&ptH.ryd();ban&&ban.fjern();for(const t of tekster)t.userData.ryd&&t.userData.ryd();S=null});
  ctx.test={ev:()=>{startEv();startEv();startEv();startEv()},ban:()=>ban,hud:()=>hud,S:()=>S,begynd,flap,tryLoop,auto:v=>{if(S)S.auto=v},spol:s=>{for(let i=0;i<s*25;i++)OPT.tick(Rm.t+i*.04,.04)},
    tilstand:()=>S&&{fase:S.run,t:+S.t.toFixed(1),x:Math.round(S.x),y:Math.round(S.y),v:Math.round(S.v),ringe:S.rings,af:S.ringsAll,bobler:S.bubbles,boost:S.boost,loop:!!S.loop,res:S.result||null,riv:S.rivals.map(r=>Math.round(r.x))}}};
