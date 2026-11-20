/* ============ byens figurer i papir: katten, byens folk, dragen, enhjørningen og trolden ============
   Samme håndværk som heksen: lag af udklippet papir i led, malet én gang, og så kun flyttet. */
const fgrp=(p,x=0,y=0,z=0)=>{const q=new THREE.Group();q.position.set(x,y,z);p.add(q);return q},fpiv=(p,x,y,z=0)=>{const o=fgrp(p,x,y,z);return{o,i:fgrp(o,-x,-y)}};
const eyeBig=(P,x,y,r,iris,dark)=>{P.fill(circ(x,y,r,r*1.08,20),'#fdfaf0',1);P.fill(circ(x,y-r*.05,r*.74,r*.84,18),iris,1);P.fill(circ(x,y-r*.05,r*.4,r*.52,14),dark||'#17121f',1);P.fill(circ(x+r*.28,y+r*.34,r*.22,r*.22,10),'#ffffff',1);P.fill(circ(x-r*.3,y-r*.4,r*.1,r*.1,8),'#ffffff',.9)};

/* ---- katten: krop fra siden, hovedet vendt mod os ---- */
function makeCat(o={}){const K={G:new THREE.Group()},G=K.G,c0=o.col||'#2d2738',c1=hexOf(shade(c0,.3)),cd=hexOf(shade(c0,-.45)),sock=o.sock||'#f3ecda';FRES=o.res||1;
  const leg=(x,z,far)=>{const p=fpiv(G,x,4.2,z),col=far?hexOf(shade(c0,-.25)):c0,sh=sm([[x-.72,4.6,1],[x+.72,4.6,1],[x+.66,1.2],[x+.95,.25],[x+.8,0,1],[x-.7,0,1],[x-.66,1.2]],4);
    fp(p.i,sh,{t:.16,s:50,ed:col,paint:P=>{P.wash(col,sh,{edge:.5});P.fill(box(x-1.2,-.2,x+1.4,1.1),far?hexOf(shade(sock,-.2)):sock,1)}},0);return p.o};
  K.legs=[leg(-2.5,-.3,true),leg(3.3,-.3,true)];
  /* halen */
  {const t=fpiv(G,-4.2,6.3,-.1);K.tail=t.o;const cv_=curve([[-4.2,6.3],[-6.3,7.2],[-7.2,9.6],[-6.4,12],[-5,12.9]],10);for(const s of thick([cv_],.62))fp(t.i,s,{color:c0,kind:'water',t:.16,edge:cd},0);fp(t.i,circ(-5.05,12.85,.78,.78,16),{color:sock,kind:'water',t:.18},.02)}
  /* kroppen */
  {const b=sm([[-4.5,4.3],[-4.9,6.3],[-3.7,7.9],[-.6,8.3],[2.4,7.9],[4.1,6.6],[4.2,4.6],[2.9,3.4],[-3,3.3]],8);K.body=fgrp(G);fp(K.body,b,{t:.24,s:44,ed:c0,paint:P=>{P.wash(c0,b,{top:c1,edge:.6,clouds:8});for(let i=0;i<10;i++){const x=R(-4,3.4),y=R(4,7.6);P.pen([[x,y],[x+.5,y-.35]],c1,.06,.5)}}},0);
    const ch=sm([[2.9,7.2],[4.3,6.5],[4.2,4.7],[3.4,3.9],[2.8,5.2]],6);fp(K.body,ch,{t:.08,s:50,ed:sock,paint:P=>{P.wash(sock,ch,{edge:.4});for(let i=0;i<5;i++)P.pen([[3.1+i*.2,6.6-i*.5],[3.4+i*.2,6-i*.5]],'#cfc6b0',.05,.7)}},.2)}
  K.legs.push(leg(-3.4,.3,false),leg(2.4,.3,false));
  /* halsbånd og hoved */
  const h=fpiv(G,3.2,8,.5);K.head=h.o;const hx=3.9,hy=10.9,HW=3.5,HH=2.95;
  fp(G,sm([[1.9,8.5],[4.6,7.6],[4.8,8.3],[2.1,9.2]],3),{color:o.band||'#6a3fa2',kind:'water',t:.12},.42);fp(G,starPts(3.5,7.75,.62,.27),{mat:gold(),t:.1},.52);
  {const hs=[];for(let i=0;i<32;i++){const a=i/32*TAU;hs.push([hx+Math.cos(a)*HW*(1+.06*Math.cos(a*2)),hy+Math.sin(a)*HH*(1-.05*Math.sin(a))])}
    for(const sx of[-1,1]){const e=toCCW([[hx+sx*1.1,hy+2.3],[hx+sx*2.75,hy+4.7],[hx+sx*3.25,hy+1.3]]);fp(h.i,e,{t:.14,s:50,ed:c0,paint:P=>{P.wash(c0,e,{edge:.5});P.fill([[hx+sx*1.75,hy+2.5],[hx+sx*2.62,hy+4],[hx+sx*2.9,hy+2]],'#e59aa8',.95)}},-.06)}
    fp(h.i,hs,{t:.22,s:64,cap:768,ed:c0,paint:P=>{P.wash(c0,hs,{top:c1,edge:.6});P.wash(c1,circ(hx,hy-1.2,2.1,1.35,20),{alpha:.55,edge:0,mode:'source-over'});
      for(const sx of[-1,1])eyeBig(P,hx+sx*1.42,hy+.15,.98,o.eye||'#b7e26a','#17121f');
      P.fill([[hx-.3,hy-.95],[hx+.3,hy-.95],[hx,hy-1.32]],'#e88aa0',1);P.pen(curve([[hx-.7,hy-1.75],[hx-.3,hy-1.95],[hx,hy-1.4],[hx+.3,hy-1.95],[hx+.7,hy-1.75]],8),'#17121f',.07,.9);
      for(const sx of[-1,1])for(const dy of[-.25,.2,.65])P.pen([[hx+sx*1.5,hy-1.35+dy*.4],[hx+sx*3.5,hy-1.2+dy]],'#f3ecda',.045,.85);
      for(let i=0;i<3;i++)P.pen([[hx-.5+i*.5,hy+2.3],[hx-.4+i*.45,hy+2.85]],cd,.1,.7)}},0);
    K.lids=fgrp(h.i);for(const sx of[-1,1]){fp(K.lids,circ(hx+sx*1.42,hy+.2,1.06,1.14,20),{color:c0,kind:'water',t:.04,edge:c0},.14);fps(thick([curve([[hx+sx*1.42-.8,hy+.05],[hx+sx*1.42,hy-.3],[hx+sx*1.42+.8,hy+.05]],8)],.09),{color:'#0f0c16',t:.03},K.lids,.18)}K.lids.visible=false}
  K.tick=(t,{ph=0,amp=0}={})=>{const s=Math.sin(ph);K.legs[0].rotation.z=-.5*s*amp;K.legs[1].rotation.z=.5*s*amp;K.legs[2].rotation.z=.5*s*amp;K.legs[3].rotation.z=-.5*s*amp;
    K.tail.rotation.z=.16*Math.sin(t*1.6)+.12*Math.sin(ph*2)*amp;K.head.rotation.z=.05*Math.sin(t*.85)+.04*s*amp;K.lids.visible=(t+1.3)%3.1<.13};
  FRES=1;return K}

/* ---- byens folk: samme dukke som heksen, i andre farver og andet tøj ---- */
const FOLK=[
  {hår:'knolde',tøj:'festkjole',hat:'ingen',kappe:'ingen',hair:['#c2553a','#e58a5a','#8a3020'],col:{kjole:'#2f7f86'},iris:['#8ac6ff','#2a5a9a'],sc:.27,sp:5},
  {hår:'kort',tøj:'rejsekappe',hat:'nathat',kappe:'ingen',skæg:'#f1ece2',hair:['#d8d2c8','#f4f0e8','#a8a098'],col:{frakke:'#7a2f3a',hat:'#7a2f3a'},freck:false,lash:0,sc:.28,sp:4},
  {hår:'kort',tøj:'opdager',hat:'ingen',kappe:'ingen',tilbehør:'rygsæk',skin:'#c68e6a',skinSh:'#a8704e',hair:['#3a2618','#5a3c28','#22140c'],iris:['#c89a5a','#6a4420'],freck:false,sc:.23,sp:5.5},
  {hår:'fletning',tøj:'skovløber',hat:'ingen',kappe:'kort',skin:'#e8b890',skinSh:'#c8946c',hair:['#4a2f1c','#6e4a2e','#2e1c10'],sc:.27,sp:4.5},
  {hår:'bølger',tøj:'stjernekjole',hat:'heksehat',kappe:'lang',hair:['#2a2030','#4a3a58','#16101c'],col:{kjole:'#3f7a4a',hat:'#2f5a38',kappe:'#5a3a22'},iris:['#e8c86a','#8a6a20'],sc:.28,sp:4.5}];
function makeFolk(i){const L=FOLK[i],F=makeFigure(Object.assign({stav:false,tilbehør:'ingen',res:.5},L));F.G.scale.setScalar(L.sc);return{root:F.G,tick:F.tick,F,sp:L.sp}}
