/* ============ heksen på kosten, set fra siden (Kosteflyvning og turen op i Faldskærm) ============
   Kasper (12. nov.): hun sidder overskrævs på kosten, set fra siden, med kosten mellem benene og begge hænder om skaftet.
   Kroppen er tegnet fra siden, og hovedet er hendes eget hoved fra Garderoben, drejet lidt mod os, ligesom kæledyrene.
   Det lange hår og kappen blafrer bagud i fartvinden, hatten vipper lidt bagover, og en papirmølle foran på skaftet snurrer efter farten. */
function bygRytter(look,{gear=false,moelle=true}={}){
  const L=Object.assign({},look,{stav:false}),F=makeFigure(L),G=new THREE.Group(),D=F.D,P2=(g,sh,o,z)=>put(g,piece(sh,o),0,0,z);
  for(const k of['gTorso','skirt','armL','armR','gStaff','gAcc','gCape'])if(F[k])F[k].visible=false;for(const l of F.legs)l.visible=false;
  const kj=(L.col&&L.col['tøj'])||'#6a3fa2',kjd=hexOf(shade(kj,-.3)),hud=L.skin||'#f7d8c4',st=(L.col&&L.col['støvler'])||'#5a3a28',kap=(L.col&&L.col.kappe)||kj,o=(c,t=.3)=>({color:c,kind:'card',t,edge:hexOf(shade(c,-.38))});
  const S=D.S,H=D.HIP,SY=H-1.7,B=new THREE.Group();F.G.add(B);
  /* kosten: skaft, kost af halm bagtil med et bånd, og møllen foran */
  for(const q of thick([[[-12.5,SY],[13,SY+.5]]],.42))P2(B,q,{color:'#8a5a3c',kind:'kraft',t:.5,edge:'#4a2e1e'},-.1);
  P2(B,toCCW(sm([[-12,SY+.7],[-19,SY+2.2],[-20.4,SY],[-19,SY-2.4],[-12,SY-.7]],3)),{color:'#e9c46a',kind:'card',t:.6,edge:'#8a6420'},-.3);
  for(let i=0;i<5;i++)for(const q of thick([[[-12.6,SY-.6+i*.3],[-19.4,SY-2+i*1]]],.06))P2(B,q,{color:'#b98a2e',kind:'water',t:.02},.32);
  P2(B,box(-12.9,SY-.95,-11.9,SY+.95),{color:'#8a2a2a',kind:'card',t:.7},-.05);
  const moel=new THREE.Group();moel.position.set(13.2,SY+.5,.5);moel.visible=moelle;B.add(moel);{const fc=['#e0457a','#ffd24a','#7fd8ff','#9be36a'];for(let i=0;i<4;i++){const a=i*Math.PI/2,g=new THREE.Group();g.rotation.z=a;moel.add(g);P2(g,toCCW([[0,0],[2.2,.2],[1.6,1.6]]),{color:fc[i],kind:'card',t:.06,edge:hexOf(shade(fc[i],-.35))},i*.02)}put(moel,piece(circ(0,0,.35,.35,10),{mat:gold(),t:.2}),0,0,.15)}
  /* det fjerne ben og den fjerne arm: lidt mørkere og bag skaftet */
  const ben=(z,c,dx)=>{const g=new THREE.Group();g.position.set(dx,0,z);B.add(g);for(const q of thick([[[.6,H-.7],[3.7,H-1.5],[2.5,H-5.3]]],.55))P2(g,q,o(c,.25),0);
    P2(g,toCCW(sm([[1.8,H-4.8],[3,H-4.9],[4.3,H-5.6],[4.2,H-6.3],[1.7,H-6.2]],2)),o(st,.3),.05);return g};
  const benF=ben(-.6,'#2a1e30',-.6),armF=new THREE.Group();armF.position.z=-.5;B.add(armF);for(const q of thick([[[-.2,S-.6],[2.6,S-3.4],[4.9,SY+.4]]],.5))P2(armF,q,o(kjd,.25),0);P2(armF,circ(5,SY+.45,.6,.6,12),o(hexOf(shade(hud,-.15)),.3),.05);
  /* kappen blafrer bagud fra halsen i tre led */
  const kappe=[];{let par=B,x0=-.6,y0=S+.5;for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set(x0,y0,-.4-i*.02);par.add(g);const w=2.2+i*.7,l=4.4;
      P2(g,toCCW(sm([[.4,.4],[-l,.2+i*.2],[-l-.4,-w],[.2,-w*.7]],2)),o(i%2?hexOf(shade(kap,-.08)):kap,.15),0);kappe.push(g);par=g;x0=-l+.2;y0=0}}
  /* kroppen: kjolen ned over skaftet, flagrende bagud, og overkroppen lænet lidt frem */
  const skoert=new THREE.Group();skoert.position.set(0,D.Wy,0);B.add(skoert);P2(skoert,toCCW(sm([[-2.5,0],[2,0],[2.9,H-1.6-D.Wy],[-.4,H-2.9-D.Wy,1],[-5.8,H-2.4-D.Wy],[-4,H-1.2-D.Wy]],3)),o(kj,.3),0);
  P2(B,toCCW(sm([[1.9,S+.3],[-1.8,S+.5],[-2.6,D.Wy-.2],[1.7,D.Wy-.4]],3)),o(kj,.35),.1);P2(B,box(-2.5,D.Wy-.5,1.8,D.Wy+.25),{color:'#5a3a28',kind:'kraft',t:.1},.46);
  const benN=ben(.7,'#3a2a40',0);
  const armN=new THREE.Group();armN.position.z=.8;B.add(armN);for(const q of thick([[[.6,S-.5],[3.4,S-3.8],[6.3,SY+.45]]],.55))P2(armN,q,o(kj,.3),0);P2(armN,circ(6.4,SY+.5,.62,.62,12),o(hud,.3),.06);
  if(gear){/* hjelm med flyverbriller i stedet for hatten (Kasper 12. nov.: faldskærm på ryggen og hjelm) */F.hat.visible=false;const hI=F.gHairF.parent,w=D.w,cy=D.cy,hh=D.hh,dome=[];
    for(let i=0;i<=24;i++){const a=i/24*Math.PI;dome.push([Math.cos(a)*w*.62,cy+hh*.02+Math.sin(a)*hh*.62])}dome.push([-w*.62,cy-hh*.06],[w*.62,cy-hh*.06]);
    put(hI,piece(toCCW(dome),{color:'#e2384e',kind:'card',t:.3,edge:'#8a1a2a'}),0,0,.62);put(hI,piece(toCCW(dome.map(([x,y])=>[x*.7,cy+(y-cy)*.7+hh*.12])),{color:'#f0606e',kind:'card',t:.05}),0,0,.93);
    put(hI,piece(box(-w*.62,cy+hh*.1,w*.62,cy+hh*.2),{color:'#3a2a20',kind:'card',t:.08}),0,0,.95);for(const sx of[-1,1]){put(hI,piece(circ(sx*w*.22,cy+hh*.17,w*.17,w*.15,18),{color:'#3a2a20',kind:'card',t:.1}),0,0,.99);put(hI,piece(circ(sx*w*.22,cy+hh*.17,w*.12,w*.1,16),{color:'#7fd8ff',kind:'card',t:.05}),0,0,1.06)}}
  if(gear){/* faldskærmen på ryggen og selerne */P2(B,box(-4.4,D.Wy+.2,-1.8,S-.2),{color:'#7a5a3a',kind:'kraft',t:.8,edge:'#4a321e'},-.25);for(const q of thick([[[-1.9,S-.4],[1.4,D.Wy+.4]]],.22))P2(B,q,{color:'#2a2a3a',kind:'card',t:.06},.5)}
  /* hovedet og håret: hovedet lidt frem, håret og hatten bagud */
  F.head.position.x+=.9;F.hairB.position.x+=.9;F.gNeck.position.x+=.5;
  G.add(F.G);F.G.position.set(0,-SY,0);G.traverse(q=>{if(q.isMesh)q.userData.noShadow=true});
  const R={G,F,moel,tick(t,{fart=1,vy=0,boost=0}={}){F.tick(t,{ph:0,amp:0});const f=Math.min(2.4,fart);
      F.hairB.rotation.z=.75+.07*Math.sin(t*9*f)+.08*Math.min(1,f-.5);F.hat.rotation.z=.16+.04*Math.sin(t*7*f);F.head.rotation.z=-.05+.03*Math.sin(t*1.3)+clamp(vy,-1,1)*.05;
      kappe.forEach((g,i)=>{g.rotation.z=(i?.12:-.05)+.16*Math.sin(t*(6+3*f)-i*1.1)*(.6+.4*Math.min(1.5,f))});skoert.rotation.z=.05*Math.sin(t*8*f);
      moel.rotation.z-=.06+.22*f;benN.rotation.z=.03*Math.sin(t*2);benF.rotation.z=.03*Math.sin(t*2+1)}};
  return R}
