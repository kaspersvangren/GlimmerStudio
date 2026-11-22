/* ============ Dyreparken, del 1: ungerne og foderet ============
   makeUnge(slags) bygger en dyreunge i papir, set forfra og siddende: stort hoved, store blanke øjne, røde kinder.
   Fire slags: dragebarnet Gnist, enhjørningeføllet Glimmer, ugleungen Uhu og næbdyrungen Næbbe (næbdyret er Agnes' ønske).
   Ungen kan se glad ud (lukkede smileøjne), sove, gabe op for mad og være snavset. */
const UNGER={drage:{navn:'Gnist',art:'Dragebarn',a:'#6fc86f',b:'#f6ecb0',c:'#f0604e',eye:'#f0a030',livret:'chili',mad:['graes','chili','baer'],saer:'altid sulten · hader bad',m:1.5,vask:.55},
  enhjoerning:{navn:'Glimmer',art:'Enhjørningeføl',a:'#fbf1ec',b:'#ffffff',c:'#ff9fd0',eye:'#8a6ad8',livret:'sky',mad:['sky','honning','orm'],saer:'bliver hurtigt snavset',r:2.2},
  ugle:{navn:'Uhu',art:'Ugleunge',a:'#b98a62',b:'#f8ead0',c:'#e8a030',eye:'#f2b632',livret:'orm',mad:['baer','graes','orm'],saer:'vil kæles langsomt',langsom:1},
  naebdyr:{navn:'Næbbe',art:'Næbdyrunge',a:'#9c6c4c',b:'#e4c8a0',c:'#4c4a5c',eye:'#6a4a30',livret:'honning',mad:['chili','honning','sky'],saer:'keder sig hurtigt · elsker vand',g:1.5,vask:1.7}},UNGEID=Object.keys(UNGER);
/* ---- ungernes ur ----
   Behovene falder i spilletid: kun mens spillet er åbent, men også når man er et andet sted end i stalden (dér går det fire gange så hurtigt, så der er noget at lave).
   Fra fuld til tom tager cirka 12 minutter et andet sted. Står et behov på nul, visner et hjerte for hver 5 minutters spil; det sidste hjerte kan ikke mistes.
   Hver unge har sit særpræg: Gnist bliver hurtigt sulten, Glimmer hurtigt snavset, Næbbe keder sig hurtigt. */
const UNGEUR={m:1/900,r:1/1500,g:1/780,STALD:4,NUL:300},ungeSkridt=h=>h<3?3:h<6?4:h<8?5:6;
function ungeTid(dt,iStald,sover){const S=SPIL.data.unger,sket=[];if(!S)return sket;for(const id of UNGEID){const s=S[id],D=UNGER[id];if(!s)continue;const k=(iStald?UNGEUR.STALD:1)*(sover&&sover[id]?.5:1);
    s.m=clamp(s.m-dt*UNGEUR.m*(D.m||1)*k,0,1);s.r=clamp(s.r-dt*UNGEUR.r*(D.r||1)*k,0,1);s.g=clamp(s.g-dt*UNGEUR.g*(D.g||1)*k,0,1);const lav=Math.min(s.m,s.r,s.g);
    if(lav<=.001){s.nul=(s.nul||0)+dt;if(s.nul>=UNGEUR.NUL){s.nul=0;if(s.h>1){s.h--;s.p=0;sket.push({id,hvad:'mistet'})}}}else s.nul=0;
    if(lav<.2&&!s.adv){s.adv=1;sket.push({id,hvad:'kalder'})}else if(lav>.5)s.adv=0}
  return sket}
function makeUnge(kind){const D=UNGER[kind],U={G:new THREE.Group(),kind},G=U.G,{a,b,c}=D,a1=hexOf(shade(a,.22)),ad=hexOf(shade(a,-.32)),MORK='#1a1420',W=(col,o={})=>Object.assign({color:col,kind:'water',t:.16},o);
  const ugle=kind==='ugle',drage=kind==='drage',enh=kind==='enhjoerning',naeb=kind==='naebdyr',HY=9.2,RX=naeb?5.5:5.3,RY=naeb?4.25:4.5;
  /* halen, bag kroppen */
  {const t=fpiv(G,3,2,-.5);U.tail=t.o;const HP=(pts,col,w_,z=0)=>{for(const q of thick([curve(pts,10)],w_))fp(t.i,q,W(col,{edge:hexOf(shade(col,-.4))}),z)};
    if(drage){HP([[3,1.8],[5.8,1.1],[7.6,2.4],[7.5,4.4]],a,.95);fp(t.i,toCCW([[6.4,4.3],[7.6,6.8],[8.6,4.2]]),W(c),.04)}
    if(enh)[[[3,2.4],[6,2.6],[7.4,5],[6.6,7.4]],[[3,2],[6.4,1.4],[8.4,3.2],[8.2,5.6]],[[3,1.6],[5.6,.8],[7.6,1.2],[8.8,2.4]]].forEach((p,i)=>HP(p,[c,'#b9a0ff','#9fe7ff'][i],.62,i*.03));
    if(naeb){const p=toCCW(sm([[2.6,2.6],[5.8,3.9],[8.6,3.6],[9.3,2.4],[8,1.1],[5,.9]],7));fp(t.i,p,{t:.22,s:40,ed:ad,paint:P=>{P.wash(ad,p,{edge:.5});for(let i=0;i<5;i++){P.pen([[4.4+i*.9,1.2],[5.2+i*.9,3.7]],hexOf(shade(ad,-.3)),.07,.6);P.pen([[4.4+i*.9,3.7],[5.2+i*.9,1.2]],hexOf(shade(ad,-.3)),.07,.5)}}},0)}
    if(ugle)for(const k of[-1,0,1])fp(t.i,leafPts(3.6+k*.5,1.6-Math.abs(k)*.3,3,1.1,-1.9+k*.35),W(hexOf(shade(a,-.2+k*.08)),{edge:ad}),k*.02)}
  /* dragens vinger, bag kroppen: de basker, når den er glad */
  U.wings=[];if(drage)for(const sx of[-1,1]){const p=fpiv(G,sx*2.8,6.2,-.42),w=toCCW(sm([[sx*2.6,6.4,1],[sx*5.2,9.8],[sx*8.4,10.2,1],[sx*7.5,8.4],[sx*8,6.8,1],[sx*6.3,6.8],[sx*5.8,5.2,1],[sx*4.2,5.6]],5));fp(p.i,w,W(c,{edge:hexOf(shade(c,-.4))}),0);U.wings.push({o:p.o,sx})}
  /* kroppen */
  U.body=fgrp(G);const kb=circ(0,3.7,ugle?4.6:4.3,ugle?4:3.75,36);
  fp(U.body,kb,{t:.3,s:40,ed:a,paint:P=>{P.wash(a,kb,{top:a1,edge:.6,clouds:6})}},0);
  {const be=circ(0,3.1,ugle?3.1:2.9,ugle?2.9:2.6,28);fp(U.body,be,{t:.07,s:44,ed:b,paint:P=>{P.wash(b,be,{edge:.5});
      if(drage)for(let y=1.4;y<5.4;y+=.85)P.pen([[-2.2,y],[0,y-.25],[2.2,y]],hexOf(shade(b,-.25)),.08,.6);
      if(ugle)for(let j=0;j<3;j++)for(let i=-2+j%2*.5;i<2.2;i+=1)P.pen([[i-.3,4.8-j*1.1],[i,4.4-j*1.1],[i+.3,4.8-j*1.1]],hexOf(shade(a,-.1)),.09,.7)}},.2)}
  /* snavs: tre pletter, der kan vaskes af */
  U.snavs=[[-2.3,2.5,1.1],[2.5,4.9,.9],[.4,1.5,.7]].map(([x,y,r],i)=>{const m=fp(U.body,toCCW(sm([[x-r,y],[x-r*.4,y+r*.8],[x+r*.6,y+r*.6],[x+r,y-.1],[x+r*.3,y-r*.7],[x-r*.6,y-r*.6]],5)),W('#6a4a2e',{t:.05}),.34+i*.01);m.visible=false;return m});
  /* fødderne */
  const fod=ugle?c:enh?'#b9a0ff':naeb?c:hexOf(shade(a,-.12));for(const sx of[-1,1]){fp(G,circ(sx*2.3,.75,naeb?1.9:1.55,.85,18),W(fod,{t:.3,edge:hexOf(shade(fod,-.4))}),.5);if(naeb||ugle)for(const k of[-1,0,1])fp(G,circ(sx*2.3+k*.95,.35,.5,.42,10),W(fod,{t:.3,edge:hexOf(shade(fod,-.4))}),.52)}
  /* armene (eller uglens vinger): drejer om skulderen, så de kan vinke */
  U.arms=[-1,1].map(sx=>{const p=fpiv(G,sx*3.5,5.6,.3),sh=ugle?toCCW(sm([[sx*3.2,6.3,1],[sx*5.4,5.6],[sx*5.9,3],[sx*5,1.7],[sx*3.9,2.6],[sx*3.5,4.4]],6)):toCCW(sm([[sx*3.2,5.9],[sx*4.9,5.3],[sx*5.4,3.6],[sx*4.5,2.7],[sx*3.5,3.6]],6)),col=ugle?ad:a;
    fp(p.i,sh,{t:.18,s:44,ed:col,paint:P=>{P.wash(col,sh,{top:hexOf(shade(col,.15)),edge:.5});if(ugle)for(let i=0;i<3;i++)P.pen([[sx*(3.9+i*.5),5.4-i*.3],[sx*(4.3+i*.4),2.6+i*.2]],hexOf(shade(col,-.3)),.08,.6)}},0);return{o:p.o,sx}});
  /* hovedet: drejer om halsen */
  const h=fpiv(G,0,6.5,.62);U.head=h.o;const HI=h.i,HP2=(sh,po,z)=>fp(HI,sh,po,z);
  for(const sx of[-1,1]){
    if(drage){HP2(toCCW(sm([[sx*4.5,10.8,1],[sx*7.2,12.2],[sx*6.5,9.6],[sx*7.1,8.1],[sx*4.9,8.5,1]],4)),W(c,{edge:hexOf(shade(c,-.4))}),-.1);HP2(toCCW([[sx*1.5,13.2],[sx*2.3,15.4],[sx*3,12.8]]),W('#fbf0c0',{t:.24}),-.04)}
    if(enh){HP2(toCCW(sm([[sx*2.5,12.6,1],[sx*3.6,15.6,1],[sx*4.9,12.3,1]],3)),W(a,{t:.2,edge:ad}),-.1);HP2(toCCW([[sx*3.1,12.8],[sx*3.65,14.5],[sx*4.3,12.7]]),W('#ffc2dc',{t:.06}),-.02)}
    if(ugle)HP2(toCCW([[sx*2,12.9],[sx*4.9,15],[sx*5,11.4]]),W(ad,{t:.2,edge:hexOf(shade(ad,-.4))}),-.06)}
  if(drage)for(const[x,y]of[[-1.4,13.3],[0,13.75],[1.4,13.3]])HP2(toCCW([[x-.55,y-.2],[x,y+1.25],[x+.55,y-.2]]),W(c,{edge:hexOf(shade(c,-.4))}),-.05);
  const hb=circ(0,HY,RX,RY,44);HP2(hb,{t:.3,s:44,ed:a,paint:P=>{P.wash(a,hb,{top:a1,edge:.6,clouds:5});for(const sx of[-1,1])P.wash('#ff8fa8',circ(sx*3.55,HY-1.5,1.15,.8,16),{alpha:.62,edge:.9,mode:'source-over'})}},0);
  if(enh){HP2(toCCW([[-.78,13.3],[0,17.4],[.78,13.3]]),{mat:gold(),t:.3},.02);
    [[c,[[-2.6,13.5],[-.4,14.3],[1.8,13.3],[1,11.5],[-.5,12.4],[-2.2,11.6]],.34],['#b9a0ff',[[-4.2,12.6],[-2.2,13.6],[-.9,12.5],[-1.6,10.9],[-3,11.6]],.3],['#9fe7ff',[[-5.3,11.6],[-6.6,9.4],[-6,6.9],[-7,4.9],[-5.1,5.5],[-4.6,8.3],[-4.3,10.6]],-.12]].forEach(([col,p,z])=>HP2(toCCW(sm(p,6)),W(col,{t:.14,edge:hexOf(shade(col,-.35))}),z))}
  if(naeb)for(const k of[-1,0,1])HP2(leafPts(k*.7,13.9-Math.abs(k)*.3,2,.7,k*.35),W(ad,{t:.1}),.04);
  if(ugle)for(const sx of[-1,1])HP2(circ(sx*2.2,HY+.1,2.45,2.5,28),W(b,{t:.05,edge:hexOf(shade(b,-.15))}),.32);
  /* øjnene */
  const ex=naeb?2.55:2.2,ey=HY+.15,er=naeb?1.22:1.5;U.eyes=fgrp(HI,0,0,.36);U.lids=fgrp(HI,0,0,.62);U.glade=fgrp(HI,0,0,.66);U.sove=fgrp(HI,0,0,.66);
  for(const sx of[-1,1]){const x=sx*ex;fp(U.eyes,circ(x,ey,er,er*1.06,28),W('#ffffff',{t:.05,edge:'#8a7a80'}),0);fp(U.eyes,circ(x-sx*.08,ey-.05,er*.8,er*.86,24),W(D.eye,{t:.04,edge:hexOf(shade(D.eye,-.5))}),.06);fp(U.eyes,circ(x-sx*.08,ey-.05,er*.5,er*.56,20),W(MORK,{t:.03}),.1);
    fp(U.eyes,circ(x+.38,ey+.5,er*.29,er*.29,12),W('#ffffff',{t:.02}),.14);fp(U.eyes,circ(x-.36,ey-.48,er*.14,er*.14,10),W('#ffffff',{t:.02}),.14);
    fp(U.lids,circ(x,ey,er*1.05,er*1.12,24),W(ugle?b:a,{t:.04,edge:ugle?b:a}),0);
    for(const q of thick([curve([[x-er*.75,ey-.25],[x,ey+.55],[x+er*.75,ey-.25]],8)],.2))fp(U.glade,q,W(MORK,{t:.04}),0);
    for(const q of thick([curve([[x-er*.75,ey+.15],[x,ey-.5],[x+er*.75,ey+.15]],8)],.2))fp(U.sove,q,W(MORK,{t:.04}),0)}
  /* snude, næb og mund */
  U.smil=fgrp(HI,0,0,.5);U.gab=fgrp(HI,0,0,.5);const my=HY-2.3,streg=(g,pts,w_=.15,col=MORK)=>{for(const q of thick([curve(pts,8)],w_))fp(g,q,W(col,{t:.04}),.1)};
  if(drage||enh){const sn=circ(0,my-.2,2.2,1.25,24),sc=enh?'#ffd3e2':a1;HP2(sn,W(sc,{t:.1,edge:hexOf(shade(sc,-.25))}),.4);for(const sx of[-1,1])HP2(circ(sx*.75,my+.3,.2,.26,10),W(hexOf(shade(sc,-.5)),{t:.03}),.48);
    streg(U.smil,[[-1,my-.35],[0,my-.8],[1,my-.35]]);if(drage)fp(U.smil,toCCW([[.6,my-.55],[.95,my-1.2],[1.25,my-.45]]),W('#ffffff',{t:.04}),.12);
    fp(U.gab,circ(0,my-.5,.95,.75,18),W('#7a2a3a',{t:.04}),.1);fp(U.gab,circ(0,my-.8,.6,.36,14),W('#ff8fa8',{t:.03}),.14)}
  if(ugle){HP2(toCCW([[-.7,HY-.9],[.7,HY-.9],[0,HY-2.2]]),W(c,{t:.14,edge:hexOf(shade(c,-.4))}),.5);fp(U.gab,toCCW([[-.55,HY-2],[.55,HY-2],[0,HY-3]]),W(hexOf(shade(c,-.25)),{t:.1}),.02);fp(U.gab,toCCW([[-.4,HY-1.9],[.4,HY-1.9],[0,HY-2.5]]),W('#7a2a3a',{t:.03}),.1)}
  if(naeb){const nb=toCCW(sm([[-2.7,my+1],[2.7,my+1],[3.4,my],[2.6,my-1],[-2.6,my-1],[-3.4,my]],6));fp(U.gab,toCCW(sm([[-2.2,my-.4],[2.2,my-.4],[2.4,my-1.7],[-2.4,my-1.7]],5)),W(hexOf(shade(c,-.2)),{t:.1}),-.04);fp(U.gab,circ(0,my-.95,1.6,.55,16),W('#ff8fa8',{t:.03}),.02);
    HP2(nb,{t:.2,s:44,ed:c,paint:P=>{P.wash(c,nb,{top:hexOf(shade(c,.25)),edge:.5});for(const sx of[-1,1])P.fill(circ(sx*.6,my+.5,.16,.2,8),'#1a1420',.8)}},.52);streg(U.smil,[[-2.2,my-.75],[0,my-1.25],[2.2,my-.75]],.13,hexOf(shade(c,-.5)))}
  /* øjenbryn, der kun ses, når ungen er ked af det (de hænger yderst) eller sur (de hænger inderst) */
  U.bryn=[-1,1].map(sx=>{const p=fpiv(HI,sx*ex,ey+er*1.12+.5,.7);for(const q of thick([[[sx*ex-er*.7,ey+er*1.12+.5],[sx*ex+er*.7,ey+er*1.12+.5]]],.2))fp(p.i,q,W(MORK,{t:.05}),0);p.o.visible=false;return{o:p.o,sx}});
  U.gab.visible=false;U.lids.visible=U.glade.visible=U.sove.visible=false;
  /* udtrykket: øjne 'aaben' | 'glad' | 'sover', mund 'smil' | 'gab', og hvor mange snavspletter der ses */
  let oje='aaben',mund='smil';U.set=o=>{if(o.oje){oje=o.oje;U.glade.visible=oje==='glad';U.sove.visible=oje==='sover';U.eyes.visible=oje==='aaben';if(oje!=='aaben')U.lids.visible=true}if(o.mund){mund=o.mund;U.gab.visible=mund==='gab';U.smil.visible=mund==='smil'}if(o.snavs!==undefined)U.snavs.forEach((m,i)=>{m.visible=i<o.snavs});if(o.bryn!==undefined)for(const q of U.bryn){q.o.visible=!!o.bryn;q.o.rotation.z=o.bryn==='ked'?-q.sx*.38:q.sx*.38}};
  const ph=R(TAU);
  /* liv: ånder, blinker, vipper med hovedet og halen. glad (0..1) får armene til at vinke og vingerne til at baske; hop løfter den */
  U.tick=(t,{glad=0,hop=0,spis=0}={})=>{const sov=oje==='sover';const aa=Math.sin(t*(sov?1.2:2.2)+ph);U.body.scale.set(1+.012*aa,1+.03*aa,1);
    U.head.rotation.z=(sov?.16:.06*Math.sin(t*.9+ph))+.1*glad*Math.sin(t*9)+.05*spis*Math.sin(t*22);U.head.position.y=6.5+(sov?-.5:0)+.1*aa+.25*spis*Math.abs(Math.sin(t*11));
    U.tail.rotation.z=(sov?0:.12*Math.sin(t*1.7+ph))+.3*glad*Math.sin(t*13);for(const q of U.arms)q.o.rotation.z=q.sx*(.05*Math.sin(t*1.3+ph)+glad*(.9+.35*Math.sin(t*12)));for(const q of U.wings)q.o.rotation.z=q.sx*(.06*Math.sin(t*1.5)+glad*.5*Math.sin(t*16));
    if(oje==='aaben')U.lids.visible=(t+ph)%3.3<.13};
  return U}
/* ---- foderet i Dyrekøkkenet: seks magiske råvarer, tegnet som små papirmærker. Samme tegning i kasserne, på bestillingerne og i skålen ---- */
const FODER={baer:{navn:'Stjernebær',col:'#ffd54a'},graes:{navn:'Månegræs',col:'#6fd0a8'},orm:{navn:'Regnbueorm',col:'#ff8fc7'},chili:{navn:'Ildchili',col:'#f0503a'},sky:{navn:'Skyfnug',col:'#e6f0ff'},honning:{navn:'Honningdug',col:'#f2b040'}},FODERID=Object.keys(FODER);
/* tegner en råvare midt i (0,0) med radius cirka r */
function tegnFoder(g,id,r){g.save();g.lineJoin='round';g.lineCap='round';const kant=(col,w=.09)=>{g.strokeStyle=col;g.lineWidth=r*w;g.stroke()};
  if(id==='baer'){g.fillStyle='#ffd54a';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*TAU,q=i%2?r*.56:r;g[i?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill();kant('#b87a10');g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-r*.22,-r*.28,r*.2,r*.12,-.6,0,TAU);g.fill();g.strokeStyle='#4f9a4a';g.lineWidth=r*.12;g.beginPath();g.moveTo(0,-r*.9);g.quadraticCurveTo(r*.1,-r*1.2,r*.4,-r*1.25);g.stroke()}
  if(id==='graes'){for(const[a,l]of[[-.55,1],[0,1.25],[.55,.95]]){g.save();g.rotate(a);g.fillStyle=a?'#59c098':'#7fe0b8';g.beginPath();g.moveTo(-r*.2,r*.8);g.quadraticCurveTo(-r*.42,-r*.2*l,0,-r*l);g.quadraticCurveTo(r*.42,-r*.2*l,r*.2,r*.8);g.closePath();g.fill();kant('#2c7a5c',.07);g.restore()}g.fillStyle='#fff6c0';g.beginPath();g.arc(r*.5,-r*.75,r*.2,0,TAU);g.fill()}
  if(id==='orm'){const cs=['#ff5a6a','#ffa030','#ffe04a','#5fd070','#4aa8ff','#a070ff'];g.lineWidth=r*.5;cs.forEach((col,i)=>{const u0=i/6,u1=(i+1)/6,p=u=>[(-1+2*u)*r*.9,Math.sin(u*TAU*1.2)*r*.45];g.strokeStyle=col;g.beginPath();g.moveTo(...p(u0));for(let k=1;k<=4;k++)g.lineTo(...p(u0+(u1-u0)*k/4));g.stroke()});g.fillStyle='#1a1420';g.beginPath();g.arc(r*.86,Math.sin(TAU*1.2)*r*.45-r*.08,r*.09,0,TAU);g.fill()}
  if(id==='chili'){g.fillStyle='#f0503a';g.beginPath();g.moveTo(-r*.5,-r*.55);g.bezierCurveTo(r*.5,-r*.9,r*1.05,-r*.1,r*.75,r*.9);g.bezierCurveTo(r*.2,r*.3,-r*.5,r*.25,-r*.5,-r*.55);g.fill();kant('#8a1c14');g.fillStyle='#4f9a4a';g.beginPath();g.ellipse(-r*.45,-r*.62,r*.3,r*.2,-.4,0,TAU);g.fill();g.fillStyle='#ffd070';g.beginPath();g.moveTo(r*.55,r*.95);g.quadraticCurveTo(r*.95,r*.6,r*.7,r*.35);g.quadraticCurveTo(r*.45,r*.7,r*.55,r*.95);g.fill()}
  if(id==='sky'){const sti=()=>{g.beginPath();g.moveTo(-r*.8,r*.62);g.arc(-r*.5,r*.2,r*.44,Math.PI*.6,Math.PI*1.4);g.arc(-r*.05,-r*.25,r*.58,Math.PI*1.05,Math.PI*1.9);g.arc(r*.52,r*.14,r*.48,Math.PI*1.5,Math.PI*.42);g.closePath()};sti();g.fillStyle='#bfe0ff';g.fill();g.strokeStyle='#4a78c8';g.lineWidth=r*.12;g.stroke();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(-r*.15,-r*.3,r*.3,r*.16,-.3,0,TAU);g.fill()}
  if(id==='honning'){g.fillStyle='#f2b040';g.beginPath();g.moveTo(0,-r);g.bezierCurveTo(r*.35,-r*.3,r*.8,r*.1,r*.8,r*.4);g.arc(0,r*.4,r*.8,0,Math.PI);g.bezierCurveTo(-r*.8,r*.1,-r*.35,-r*.3,0,-r);g.fill();kant('#9a5a10');g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-r*.3,r*.3,r*.16,r*.28,.3,0,TAU);g.fill()}
  g.restore()}
/* de fire måder at gøre foderet færdigt på */
const FINISH={hak:{navn:'Hak',col:'#c8ccd8'},roer:{navn:'Rør',col:'#b5844a'},glimmer:{navn:'Drys glimmer',col:'#ffd86b'},varm:{navn:'Varm',col:'#ff9a40'}},FINISHID=Object.keys(FINISH);
function tegnFinish(g,id,r){g.save();g.lineJoin='round';g.lineCap='round';
  if(id==='hak'){g.rotate(-.5);g.fillStyle='#d8dce8';g.beginPath();g.moveTo(-r*.2,-r);g.lineTo(r*.35,-r*.9);g.lineTo(r*.35,r*.25);g.lineTo(-r*.2,r*.25);g.closePath();g.fill();g.strokeStyle='#5a6070';g.lineWidth=r*.08;g.stroke();g.fillStyle='#7a4a2a';g.fillRect(-r*.12,r*.25,r*.36,r*.75)}
  if(id==='roer'){g.strokeStyle='#b5844a';g.lineWidth=r*.2;g.beginPath();g.moveTo(r*.7,-r*.9);g.lineTo(-r*.2,r*.3);g.stroke();g.fillStyle='#b5844a';g.beginPath();g.ellipse(-r*.4,r*.55,r*.42,r*.3,-.9,0,TAU);g.fill();g.strokeStyle='#f6f0dc';g.lineWidth=r*.1;g.beginPath();g.arc(r*.1,r*.1,r*.85,Math.PI*.15,Math.PI*.75);g.stroke()}
  if(id==='glimmer'){g.fillStyle='#ffd86b';for(const[x,y,q]of[[0,-r*.15,.7],[-r*.6,r*.5,.38],[r*.62,r*.45,.45],[r*.5,-r*.7,.3]]){g.beginPath();for(let i=0;i<8;i++){const a2=i/8*TAU,z=i%2?r*q*.35:r*q;g[i?'lineTo':'moveTo'](x+Math.cos(a2)*z,y+Math.sin(a2)*z)}g.closePath();g.fill()}}
  if(id==='varm'){g.fillStyle='#ff9a40';g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r,0,r*.5,r*.8);g.quadraticCurveTo(0,r*1.1,-r*.5,r*.8);g.quadraticCurveTo(-r,0,0,-r);g.fill();g.fillStyle='#ffe07a';g.beginPath();g.moveTo(0,-r*.2);g.quadraticCurveTo(r*.45,r*.3,r*.2,r*.75);g.quadraticCurveTo(0,r*.9,-r*.2,r*.75);g.quadraticCurveTo(-r*.45,r*.3,0,-r*.2);g.fill()}
  g.restore()}
/* et lille mærke (billede) af en råvare eller en tilberedning, til at sætte på papir i rummene */
const foderMaerke=(id,px=128,bag=null)=>{const c=cv(px,px),g=c.getContext('2d');g.translate(px/2,px/2);if(bag){g.fillStyle=bag;g.beginPath();g.arc(0,0,px*.48,0,TAU);g.fill()}(FODER[id]?tegnFoder:tegnFinish)(g,id,px*.34);return tx(c,true)};
