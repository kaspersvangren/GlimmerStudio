/* ============ byens figurer i papir: katten, byens folk, dragen, enhjørningen og trolden ============
   Samme håndværk som heksen: lag af udklippet papir i led, malet én gang, og så kun flyttet. */
const fgrp=(p,x=0,y=0,z=0)=>{const q=new THREE.Group();q.position.set(x,y,z);p.add(q);return q},fpiv=(p,x,y,z=0)=>{const o=fgrp(p,x,y,z);return{o,i:fgrp(o,-x,-y)}};
const eyeBig=(P,x,y,r,iris,dark)=>{P.fill(circ(x,y,r,r*1.08,20),'#fdfaf0',1);P.fill(circ(x,y-r*.05,r*.74,r*.84,18),iris,1);P.fill(circ(x,y-r*.05,r*.4,r*.52,14),dark||'#17121f',1);P.fill(circ(x+r*.28,y+r*.34,r*.22,r*.22,10),'#ffffff',1);P.fill(circ(x-r*.3,y-r*.4,r*.1,r*.1,8),'#ffffff',.9)};

/* ---- kæledyret: krop fra siden, hovedet vendt mod os. Ni arter deler krop; ører, hale, snude, mønster og pynt skifter ---- */
const DYR={kat:['#2d2738','#f3ecda','#6a3fa2'],hund:['#c8935a','#f6ead2','#c2452d'],kanin:['#f1ead8','#ffc8dc','#43a3d3'],'enhjørning':['#f6f1ff','#ffd86b','#ff9ad0'],'bjørn':['#8a5a34','#e8c8a0','#3e7a4a'],drage:['#5fa34a','#f2e2a8','#c2453a'],ugle:['#9c6a48','#f2e2c0','#e0a020'],'ræv':['#e07a2a','#fbf5e6','#7b4fd0'],'frø':['#5ab85a','#c8f0a0','#e0457a']};
function makePet(o={}){const kind=DYR[o.kind]?o.kind:'kat',K={G:new THREE.Group(),kind},G=K.G,STD=DYR[kind],c0=o.a||o.col||STD[0],cb=o.b||o.sock||STD[1],cc=o.c||o.band||STD[2],c1=hexOf(shade(c0,.3)),cd=hexOf(shade(c0,-.45)),
    eyeC=o.eye||{kat:'#b7e26a','frø':'#f2c230',ugle:'#f0a030',drage:'#f0a030'}[kind]||'#6ac8e8',mo=o.moenster||(kind==='kat'&&!o.a?'sokker':'ingen'),pynt=o.pynt===undefined?'halsbånd':o.pynt,fugl=kind==='ugle',MORK='#17121f';FRES=o.res||1;
  const hx=3.9,hy=10.9,HW=kind==='frø'?3.9:3.5,HH=kind==='frø'?2.6:2.95,eyY=hy+(kind==='frø'?1.5:.15),ex=kind==='frø'?1.7:1.42,er=fugl?1.12:.98;
  /* mønsteret males på krop og hoved */
  const moen=(P,x0,x1,y0,y1,n)=>{const p=()=>[R(x0,x1),R(y0,y1)];
    if(mo==='pletter')for(let i=0;i<n;i++){const[x,y]=p();P.fill(circ(x,y,R(.45,.95),R(.4,.75),10),cb,.95)}
    if(mo==='striber')for(let x=x0+.5;x<x1;x+=1.25)P.pen([[x,y1],[x+.5,y0+(y1-y0)*.35]],cd,.34,.7);
    if(mo==='prikker')for(let i=0;i<n*2.2;i++){const[x,y]=p();P.fill(circ(x,y,.2,.2,8),cb,.95)}
    if(mo==='hjerter')for(let i=0;i<n;i++){const[x,y]=p(),r=.34;for(const sx of[-1,1])P.fill(circ(x+sx*r*.55,y+r*.3,r*.62,r*.62,10),cb,.95);P.fill([[x-r*1.1,y+.12*r],[x+r*1.1,y+.12*r],[x,y-r*1.15]],cb,.95)}
    if(mo==='stjerner')for(let i=0;i<n;i++){const[x,y]=p();P.fill(starPts(x,y,R(.4,.6),.2,R(1)),'#f2c230',.95)}
    /* glimmer: glimtene ligger i et forskudt net, så de fordeler sig jævnt over pelsen og ikke klumper */
    if(mo==='glimmer'){const N=Math.round(n*2),cols=Math.max(2,Math.round(Math.sqrt(N*(x1-x0)/(y1-y0)))),rows=Math.max(1,Math.ceil(N/cols));for(let i=0;i<cols*rows;i++){const rk=Math.floor(i/cols),x=x0+((i%cols)+.5+(rk%2?.25:-.25)+R(-.12,.12))*(x1-x0)/cols,y=y0+(rk+.5+R(-.15,.15))*(y1-y0)/rows,q=(i+rk)%3?.2:.31;P.fill([[x,y+q*1.7],[x+q*.3,y+q*.3],[x+q,y],[x+q*.3,y-q*.3],[x,y-q*1.7],[x-q*.3,y-q*.3],[x-q,y],[x-q*.3,y+q*.3]],(i+rk)%2?'#f2c230':'#ffffff',.97)}}
    if(mo==='plet')P.wash(cb,circ((x0+x1)/2-1,(y0+y1)/2+.4,(x1-x0)*.3,(y1-y0)*.34,18),{alpha:.96,edge:.25,mode:'source-over'})};
  const leg=(x,z,far)=>{const p=fpiv(G,x,4.2,z),col=fugl?'#e0a020':far?hexOf(shade(c0,-.25)):c0,sh=fugl?sm([[x-.3,4.4,1],[x+.3,4.4,1],[x+.3,.5],[x+1.3,.2],[x+1.2,0,1],[x-1,0,1],[x-1.1,.2],[x-.3,.5]],3):kind==='bjørn'?sm([[x-1.05,4.8,1],[x+1.05,4.8,1],[x+1,1.1],[x+1.3,.3],[x+1.1,0,1],[x-1.05,0,1],[x-1,1.1]],4):sm([[x-.72,4.6,1],[x+.72,4.6,1],[x+.66,1.2],[x+.95,.25],[x+.8,0,1],[x-.7,0,1],[x-.66,1.2]],4);
    fp(p.i,sh,{t:.16,s:50,ed:col,paint:P=>{P.wash(col,sh,{edge:.5});if(mo==='sokker'&&!fugl)P.fill(box(x-1.2,-.2,x+1.4,1.1),far?hexOf(shade(cb,-.2)):cb,1)}},0);return p.o};
  const hopper=kind==='kanin'||kind==='frø';K.legs=fugl||hopper?[]:[leg(-2.5,-.3,true),leg(3.3,-.3,true)];
  /* halen */
  {const t=fugl?fpiv(G,.6,2.4,-.1):fpiv(G,-4.2,6.3,-.1);K.tail=t.o;const HP=(pts,col,w_,z=0)=>{for(const q of thick([curve(pts,10)],w_))fp(t.i,q,{color:col,kind:'water',t:.16,edge:hexOf(shade(col,-.4))},z)};
    if(kind==='kat'){HP([[-4.2,6.3],[-6.3,7.2],[-7.2,9.6],[-6.4,12],[-5,12.9]],c0,.62);fp(t.i,circ(-5.05,12.85,.78,.78,16),{color:cb,kind:'water',t:.18},.02)}
    if(kind==='hund')HP([[-4.2,6.6],[-5.7,8],[-5.9,9.8],[-5.2,10.8]],c0,.7);
    if(kind==='kanin')fp(t.i,circ(-5,6.7,1.35,1.3,18),{color:cb,kind:'water',t:.3,edge:hexOf(shade(cb,-.2))},0);
    if(kind==='bjørn')fp(t.i,circ(-4.9,7,.85,.8,14),{color:c0,kind:'water',t:.3,edge:cd},0);
    if(kind==='ræv'){const b=toCCW(sm([[-3.9,5.8,1],[-6.6,6],[-9.3,9.2],[-8.8,12.6,1],[-6.2,11.2],[-4.4,8.6]],6));fp(t.i,b,{t:.2,s:40,ed:c0,paint:P=>{P.wash(c0,b,{top:c1,edge:.6});P.wash(cb,circ(-8.6,11.6,1.7,1.9,14),{alpha:.97,edge:.4,mode:'source-over'})}},0)}
    if(kind==='enhjørning')[[[-4.2,6.6],[-6.4,6.2],[-7.4,3.6],[-6.8,1.4]],[[-4.2,6.4],[-5.8,5.2],[-6.2,3],[-5.4,1.2]],[[-4.2,6.8],[-7,7],[-8.4,4.6],[-8.2,2.2]]].forEach((c,i)=>HP(c,[cc,cb,hexOf(shade(cc,.25))][i],.5,i*.02));
    if(kind==='drage'){HP([[-4.2,5.6],[-6.6,5],[-8.4,6],[-9,8.2]],c0,.9);fp(t.i,toCCW([[-9.9,8],[-8.9,10.6],[-8,8.1]]),{color:cc,kind:'water',t:.2},.04);for(const[x,y]of[[-5.6,5.9],[-7,5.9],[-8.2,6.7]])fp(t.i,[[x-.4,y],[x,y+.9],[x+.4,y]],{color:cc,kind:'water',t:.12},-.04)}
    if(fugl)for(const a of[-.5,0,.5])fp(t.i,leafPts(-.3+a*.5,1.9-Math.abs(a)*.6,3,1.1,2.2+a*.5),{color:hexOf(shade(c0,-.2+a*.1)),kind:'water',t:.12,edge:cd},a*.02)}
  /* kroppen */
  {const b=fugl?circ(3.8,5.1,4.15,4.55,30).map(([x,y])=>[x+(y<5.1?(x-3.8)*.06:0),y]):kind==='bjørn'?sm([[-4.8,3.6],[-5.3,6.4],[-4.2,8.6],[-1,9.4],[2.6,9.2],[4.7,7.6],[4.9,4.8],[3.4,3],[-3.4,2.9]],8):sm([[-4.5,4.3],[-4.9,6.3],[-3.7,7.9],[-.6,8.3],[2.4,7.9],[4.1,6.6],[4.2,4.6],[2.9,3.4],[-3,3.3]],8);K.body=fgrp(G);
    fp(K.body,b,{t:.24,s:44,ed:c0,paint:P=>{P.wash(c0,b,{top:c1,edge:.6,clouds:8});if(fugl)moen(P,.6,7,1.6,8.2,7);else moen(P,-4,3.4,4,7.8,7);if(!fugl&&(mo==='ingen'||mo==='sokker'))for(let i=0;i<10;i++){const x=R(-4,3.4),y=R(4,7.6);P.pen([[x,y],[x+.5,y-.35]],c1,.06,.5)}}},0);
    if(kind==='kat'||kind==='ræv'||kind==='kanin'){const ch=sm([[2.9,7.2],[4.3,6.5],[4.2,4.7],[3.4,3.9],[2.8,5.2]],6);fp(K.body,ch,{t:.08,s:50,ed:cb,paint:P=>{P.wash(cb,ch,{edge:.4});for(let i=0;i<5;i++)P.pen([[3.1+i*.2,6.6-i*.5],[3.4+i*.2,6-i*.5]],hexOf(shade(cb,-.15)),.05,.7)}},.2)}
    if(kind==='drage'||kind==='frø'||fugl||kind==='bjørn'){const be=fugl?circ(3.8,4.1,2.7,3.1,22):circ(1,5.2,2.6,1.9,20);fp(K.body,be,{t:.06,s:40,ed:cb,paint:P=>{P.wash(cb,be,{edge:.5});if(kind==='drage')for(let x=-.8;x<3;x+=.8)P.pen([[x,3.7],[x+.2,6.7]],hexOf(shade(cb,-.25)),.07,.6);if(fugl)for(let j=0;j<3;j++)for(let i=-1.5+(j%2)*.5;i<1.8;i+=1)P.pen(curve([[3.8+i-.34,5.6-j*1.05],[3.8+i,5.2-j*1.05],[3.8+i+.34,5.6-j*1.05]],4),hexOf(shade(c0,-.15)),.1,.75)}},.18)}
    if(kind==='drage')for(const sx of[0,1]){const wg=toCCW(sm([[-1.6,7.6,1],[-3.2,10.4],[-5.6,11.6,1],[-5,9.6],[-4,8.6,1],[-3.4,9.2],[-2.6,7.4,1]],5));fp(K.body,wg,{color:sx?cc:hexOf(shade(cc,-.25)),kind:'water',t:.12,edge:hexOf(shade(cc,-.45))},sx?.22:-.3).position.x=sx?0:.9}
    if(fugl){K.wings=[-1,1].map(sx=>{const x0=3.8+sx*3.1,wg=toCCW(sm([[x0-sx*.2,7.9,1],[x0+sx*1.5,7],[x0+sx*1.7,4.2],[x0+sx*.7,2.2],[x0-sx*.5,3],[x0-sx*.9,5.4]],6)),wp=fpiv(K.body,x0,7.6,.26),wc=hexOf(shade(c0,-.28));fp(wp.i,wg,{t:.14,s:40,ed:cd,paint:P=>{P.wash(wc,wg,{edge:.5});for(let i=0;i<2;i++)P.pen(curve([[x0+sx*(.2+i*.6)-.3,5.6-i*1.3],[x0+sx*(.2+i*.6),5.2-i*1.3],[x0+sx*(.2+i*.6)+.3,5.6-i*1.3]],4),hexOf(shade(c0,.15)),.08,.7)}},0);return{o:wp.o,sx}});
      /* fødderne: orange, med tre tæer, lige under maven. Ingen ben */
      K.feet=fgrp(G,0,0,.36);for(const sx of[-1,1]){const fx=3.8+sx*1.45;fp(K.feet,circ(fx,.6,1.05,.6,14),{color:'#f08a24',kind:'water',t:.24,edge:'#a85410'},0);for(const k of[-1,0,1])fp(K.feet,circ(fx+k*.62,.34,.4,.36,10),{color:'#f08a24',kind:'water',t:.26,edge:'#a85410'},.02)}}
    /* feevinger: begge sidder på ryggen og drejer om deres rod, så ingen af dem havner ved kinden */
    if(pynt==='vinger')for(const sx of[0,1]){const a=sx?-.16:.42,bx=(sx?.8:-.4)+(fugl?1.2:0),r=([x,y,k])=>[bx+x*Math.cos(a)-(y-8)*Math.sin(a),8+x*Math.sin(a)+(y-8)*Math.cos(a),k],wg=toCCW(sm([[-.6,8,1],[-2.4,11.8],[-1,13.6],[.8,11.4],[.6,8.6,1]].map(r),6));fp(K.body,wg,{t:.06,mat:paperMat('#ffffff','tissue',{glow:cc,gi:.9})},sx?-.2:-.34)}}
  if(!fugl&&!hopper)K.legs.push(leg(-3.4,.3,false),leg(2.4,.3,false));
  /* pynt om halsen */
  const NK=(sh,po,z)=>fp(G,sh,po,z);
  if(pynt==='halsbånd'){NK(sm([[1.9,8.5],[4.6,7.6],[4.8,8.3],[2.1,9.2]],3),{color:cc,kind:'water',t:.12},.42);NK(starPts(3.5,7.75,.62,.27),{mat:gold(),t:.1},.52)}
  if(pynt==='tørklæde'){const ed=hexOf(shade(cc,-.3));NK(toCCW(sm([[1.3,8.3],[5.2,7],[5.6,8.5],[1.7,9.8]],4)),{color:cc,kind:'water',t:.14,edge:ed},.42);NK(toCCW([[4.5,7.9],[6.5,7.5],[6.9,6.3],[6.1,6.7],[5.5,6.1],[4.6,7.1]]),{color:hexOf(shade(cc,-.12)),kind:'water',t:.1,edge:ed},.4);NK(circ(4.75,7.65,.6,.55,12),{color:hexOf(shade(cc,.12)),kind:'water',t:.16,edge:ed},.46)}
  if(pynt==='sløjfe'||pynt==='butterfly'){const q=pynt==='sløjfe'?1.35:.95;for(const sx of[-1,1])NK(toCCW([[3.5,8],[3.5+sx*1.5*q,8+q*.9],[3.5+sx*1.5*q,8-q*.9]]),{color:cc,kind:'water',t:.12,edge:hexOf(shade(cc,-.3))},.52);NK(circ(3.5,8,.36*q,.4*q,12),{color:hexOf(shade(cc,-.3)),kind:'water',t:.14},.58)}
  /* hovedet */
  const h=fpiv(G,3.2,8,.5);K.head=h.o;if(kind==='bjørn')h.o.position.y-=.7;const HI=h.i,HP2=(sh,po,z)=>fp(HI,sh,po,z);
  for(const sx of[-1,1]){
    if(kind==='kat'||kind==='ræv'||kind==='enhjørning'){const q=kind==='ræv'?1.25:kind==='kat'?1:.7,e=toCCW([[hx+sx*1.1,hy+2.3],[hx+sx*(1.1+1.65*q),hy+2.3+2.4*q],[hx+sx*3.25,hy+1.3]]);HP2(e,{t:.14,s:50,ed:c0,paint:P=>{P.wash(c0,e,{edge:.5});P.fill([[hx+sx*1.75,hy+2.5],[hx+sx*(1.2+1.42*q),hy+2.4+1.6*q],[hx+sx*2.9,hy+2]],kind==='ræv'?MORK:'#e59aa8',.95)}},-.06)}
    if(kind==='hund')HP2(toCCW(sm([[hx+sx*2.2,hy+2.7,1],[hx+sx*4.3,hy+2.1],[hx+sx*4.6,hy-1.4],[hx+sx*3.5,hy-2.3],[hx+sx*2.9,hy+.4]],6)),{color:hexOf(shade(c0,-.3)),kind:'water',t:.14,edge:cd},.1);
    if(kind==='kanin'){const e=toCCW(sm([[hx+sx*.8,hy+2.3,1],[hx+sx*1.2,hy+7],[hx+sx*2.1,hy+7.6],[hx+sx*2.7,hy+6.6],[hx+sx*2.6,hy+2.1,1]],6));if(!K.ears)K.ears=fpiv(HI,hx,hy+2.2,0);fp(K.ears.i,e,{t:.14,s:50,ed:c0,paint:P=>{P.wash(c0,e,{edge:.5});P.wash(cb,toCCW(sm([[hx+sx*1.3,hy+2.8],[hx+sx*1.6,hy+6.4],[hx+sx*2.1,hy+6.4],[hx+sx*2.2,hy+2.8]],4)),{alpha:.95,edge:.4,mode:'source-over'})}},-.06)}
    if(kind==='bjørn'){HP2(circ(hx+sx*2.7,hy+2.5,1.25,1.2,18),{color:c0,kind:'water',t:.14,edge:cd},-.06);HP2(circ(hx+sx*2.7,hy+2.5,.7,.66,14),{color:cb,kind:'water',t:.05},-.02)}
    if(kind==='drage'){HP2(toCCW([[hx+sx*1.5,hy+2.4],[hx+sx*2.9,hy+4.9],[hx+sx*2.7,hy+2]]),{color:'#f3ead2',kind:'card',t:.16},-.05);HP2(toCCW([[hx+sx*3.1,hy+1.2],[hx+sx*5,hy+1.8],[hx+sx*4.4,hy+.2],[hx+sx*4.9,hy-1],[hx+sx*3.2,hy-.8]]),{color:cc,kind:'water',t:.12,edge:hexOf(shade(cc,-.4))},-.08)}
    if(fugl)HP2(toCCW([[hx+sx*1.6,hy+2.4],[hx+sx*3,hy+4.2],[hx+sx*3.1,hy+1.8]]),{color:hexOf(shade(c0,-.2)),kind:'water',t:.14,edge:cd},-.06);
    if(kind==='frø')HP2(circ(hx+sx*ex,eyY+.1,1.4,1.35,18),{color:c0,kind:'water',t:.2,edge:cd},-.04)}
  if(kind==='enhjørning'){const hn=toCCW([[hx-.5,hy+2.5],[hx+.5,hy+2.5],[hx+.12,hy+6.2]]);HP2(hn,{t:.16,s:60,ed:'#a87a20',paint:P=>{P.wash('#d9a83a',hn,{top:'#ffe9a0',edge:.4});for(let y=hy+3;y<hy+5.8;y+=.7)P.pen([[hx-.4,y],[hx+.4,y+.4]],'#a87a20',.07,.9)}},.12);[[[hx-.6,hy+2.8],[hx-2.2,hy+2.4],[hx-3.4,hy+.6],[hx-3.9,hy-1.4]],[[hx-.2,hy+2.6],[hx-1.8,hy+1.6],[hx-2.8,hy-.2]]].forEach((c,i)=>{for(const q of thick([curve(c,8)],.5))HP2(q,{color:i?cb:cc,kind:'water',t:.1,edge:hexOf(shade(i?cb:cc,-.3))},.16+i*.02)})}
  {const hs=[];for(let i=0;i<32;i++){const a=i/32*TAU;hs.push([hx+Math.cos(a)*HW*(1+.06*Math.cos(a*2)),hy+Math.sin(a)*HH*(1-.05*Math.sin(a))])}
    HP2(hs,{t:.22,s:64,cap:768,ed:c0,paint:P=>{P.wash(c0,hs,{top:c1,edge:.6});moen(P,hx-3,hx+3,hy+.8,hy+2.6,4);if(mo==='øjeplet')P.wash(cb,circ(hx-ex,eyY,1.6,1.7,16),{alpha:.97,edge:.3,mode:'source-over'});
      if(kind==='kat')P.wash(c1,circ(hx,hy-1.2,2.1,1.35,20),{alpha:.55,edge:0,mode:'source-over'});if(kind==='hund'||kind==='bjørn')P.wash(cb,circ(hx,hy-1.15,2,1.4,20),{alpha:.97,edge:.3,mode:'source-over'});
      if(kind==='ræv')for(const sx of[-1,1])P.fill(toCCW([[hx+sx*.15,hy-.7],[hx+sx*3.4,hy-.1],[hx+sx*2.4,hy-2.5],[hx+sx*.15,hy-2.9]]),cb,.97);if(fugl)for(const sx of[-1,1])P.fill(circ(hx+sx*ex,eyY,1.5,1.55,20),cb,.97);if(kind==='frø')P.wash(cb,circ(hx,hy-1.5,3,1.1,20),{alpha:.9,edge:.4,mode:'source-over'});
      for(const sx of[-1,1])eyeBig(P,hx+sx*ex,eyY,er,eyeC,MORK);
      if(kind==='kat'||kind==='ræv'||kind==='kanin'){P.fill([[hx-.3,hy-.95],[hx+.3,hy-.95],[hx,hy-1.32]],kind==='ræv'?MORK:'#e88aa0',1);P.pen(curve([[hx-.7,hy-1.75],[hx-.3,hy-1.95],[hx,hy-1.4],[hx+.3,hy-1.95],[hx+.7,hy-1.75]],8),MORK,.07,.9);for(const sx of[-1,1])for(const dy of[-.25,.2,.65])P.pen([[hx+sx*1.5,hy-1.35+dy*.4],[hx+sx*3.5,hy-1.2+dy]],kind==='kat'?'#f3ecda':'#6a5a4a',.045,.85);if(kind==='kanin')P.fill(box(hx-.34,hy-2.5,hx+.34,hy-1.92),'#ffffff',1),P.pen([[hx,hy-2.5],[hx,hy-1.92]],'#b8a8a0',.04,.9)}
      if(kind==='hund'||kind==='bjørn'){P.fill(circ(hx,hy-.75,.52,.4,12),MORK,1);P.pen(curve([[hx-.8,hy-1.6],[hx-.3,hy-1.85],[hx,hy-1.2],[hx+.3,hy-1.85],[hx+.8,hy-1.6]],8),MORK,.08,.9);if(kind==='hund')P.fill(toCCW(sm([[hx-.3,hy-1.75],[hx+.3,hy-1.75],[hx+.34,hy-2.5],[hx,hy-2.75],[hx-.34,hy-2.5]],4)),'#f08aa0',1)}
      if(kind==='enhjørning'||kind==='drage'||kind==='frø'){for(const sx of[-1,1])P.fill(circ(hx+sx*.55,hy-(kind==='frø'?.5:.95),.14,.11,8),hexOf(shade(c0,-.5)),.9);P.pen(curve([[hx-(kind==='frø'?2.4:1.3),hy-1.5],[hx,hy-(kind==='frø'?2.2:2)],[hx+(kind==='frø'?2.4:1.3),hy-1.5]],8),hexOf(shade(c0,-.6)),.1,.9);if(kind==='drage')P.fill([[hx+.7,hy-1.72],[hx+.95,hy-2.3],[hx+1.2,hy-1.62]],'#fbf6ea',1);for(const sx of[-1,1])P.wash('#ff9ab8',circ(hx+sx*2.3,hy-.9,.7,.45,10),{alpha:.5,edge:0,mode:'source-over'})}
      if(fugl)P.fill([[hx-.5,hy-.6],[hx+.5,hy-.6],[hx,hy-1.6]],'#e0a020',1);
      for(let i=0;i<3;i++)P.pen([[hx-.5+i*.5,hy+2.3],[hx-.4+i*.45,hy+2.85]],cd,.1,.7)}},0);
    K.lids=fgrp(HI);for(const sx of[-1,1]){fp(K.lids,circ(hx+sx*ex,eyY+.05,er*1.08,er*1.16,20),{color:fugl?cb:c0,kind:'water',t:.04,edge:fugl?cb:c0},.14);fps(thick([curve([[hx+sx*ex-.8,eyY-.1],[hx+sx*ex,eyY-.45],[hx+sx*ex+.8,eyY-.1]],8)],.09),{color:'#0f0c16',t:.03},K.lids,.18)}K.lids.visible=false}
  /* pynt på hovedet */
  if(pynt==='krone'){const pts=[[hx-1.5,hy+HH-.3],[hx+1.5,hy+HH-.3]];for(let i=0;i<=6;i++)pts.push([hx+1.7-3.4*i/6,hy+HH+(i%2?.7:1.9)]);HP2(toCCW(pts),{mat:gold(),t:.2},.2);HP2(circ(hx,hy+HH+.3,.3,.3,10),{t:.06,mat:paperMat('#ffffff','tissue',{glow:cc,gi:1.2})},.3)}
  if(pynt==='hat'){HP2(toCCW(sm([[hx-1.3,hy+HH-.2,1],[hx+1.3,hy+HH-.2,1],[hx+.5,hy+HH+2.2],[hx+.9,hy+HH+3.6,1],[hx-.1,hy+HH+2.6]],5)),{color:cc,kind:'water',t:.2,edge:hexOf(shade(cc,-.4))},.2);HP2(sm([[hx-2.3,hy+HH-.5],[hx+2.3,hy+HH-.5],[hx+2.1,hy+HH+.1],[hx-2.1,hy+HH+.1]],3),{color:hexOf(shade(cc,-.25)),kind:'water',t:.24},.26);HP2(box(hx-1.2,hy+HH+.1,hx+1.2,hy+HH+.5),{mat:gold(),t:.22},.28)}
  if(pynt==='blomst'){const fx=hx+2.5,fy=hy+2.2;for(let q=0;q<6;q++)HP2(circ(fx+Math.cos(q/6*TAU)*.62,fy+Math.sin(q/6*TAU)*.62,.44,.44,12),{color:q%2?hexOf(shade(cc,.3)):cc,kind:'water',t:.1},.22+q*.004);HP2(circ(fx,fy,.36,.36,12),{mat:gold(),t:.12},.28)}
  if(pynt==='stjerne')HP2(starPts(hx+2.5,hy+2.2,.95,.42,.2),{mat:gold(),t:.14},.24);
  if(pynt==='briller'){for(const sx of[-1,1])for(const q of ring(circ(hx+sx*ex,eyY,er*1.2,er*1.2,24),.16,false))HP2(q,{color:cc,kind:'water',t:.1},.24);HP2(box(hx-ex+er*1.2,eyY-.08,hx+ex-er*1.2,eyY+.08),{color:cc,kind:'water',t:.1},.24)}
  /* ---- kanin og frø: de sidder, og de hopper ----
     Kroppen (med hoved, hale og pynt) ligger i et led ved hoften, så den kan sænkes og vippes. Bagbenene har tre led (lår, skinneben, fod) og sidder foldet
     under dyret, når det sidder; forbenene er korte. Et hop er en række stillinger, som dyret glider imellem:
     sidder · sætter af (bagbenene strækkes helt ud, snuden op) · i luften · bagbenene svinges frem, forbenene rækker ned · lander på forbenene · sidder igen.
     Tallene pr. stilling: [hvor i hoppet, lår, skinneben, fod, forben, kroppens hældning, højde] (vinkler i grader) */
  const HOPPER={'frø':{hip:[-2.6,4.8],sit:1.7,L:[3.2,3.8,3.2],W:[2.3,1.3,.85],hoved:[-.4,-1.5],sh:[2.5,4.5],Lf:2.9,cyk:2.2,skridt:7,
      K:[[0,55,-170,107,0,18,0],[.1,-150,-8,-12,-50,30,3.4],[.3,-150,-8,-12,-40,14,5.6],[.46,-40,-100,60,45,-8,2.6],[.56,55,-170,107,12,4,0],[.66,55,-170,107,0,18,0],[1,55,-170,107,0,18,0]]},
    kanin:{hip:[-2.4,5.4],sit:3.2,L:[2.6,2.2,3.4],W:[2.7,1.05,.9],sh:[2.6,4.5],Lf:2.6,cyk:1.4,skridt:4.5,
      K:[[0,-35,-105,140,0,4,0],[.1,-150,-15,-10,-35,16,2.2],[.28,-150,-15,-10,20,4,3.4],[.42,10,-120,130,40,-14,1.7],[.52,-20,-110,135,15,-10,.3],[.64,-35,-105,140,0,4,0],[1,-35,-105,140,0,4,0]]}}[kind];
  let TO=null,BAG=[],FOR=[];
  if(HOPPER){const H=HOPPER,T=fpiv(G,H.hip[0],H.hip[1],0);TO=T.o;for(const c of[...G.children])if(c!==T.o)T.i.add(c);K.hopper=true;K.cyk=H.cyk;K.skridt=H.skridt;if(H.hoved){K.head.position.x+=H.hoved[0];K.head.position.y+=H.hoved[1]}
    const kaps=(L,w)=>thick([[[0,0],[L,0]]],w),far=hexOf(shade(c0,-.25));
    /* bagben: lår → skinneben → fod, hver i sit led. Det bageste ben er mørkere og ligger bag kroppen */
    BAG=[0,1].map(naer=>{const col=naer?c0:far,ed=hexOf(shade(col,-.5)),rod=fgrp(G,H.hip[0],H.sit,naer?.46:-.4),laar=fgrp(rod),knae=fgrp(laar,H.L[0],0),ankel=fgrp(knae,H.L[1],0);
      fp(laar,circ(H.L[0]*.5,0,H.L[0]*.5+H.W[0]*.34,H.W[0]*.5,18),{color:col,kind:'water',t:.18,edge:ed},.04);for(const q of kaps(H.L[1],H.W[1]))fp(knae,q,{color:col,kind:'water',t:.16,edge:ed},.02);
      for(const q of kaps(H.L[2],H.W[2]))fp(ankel,q,{color:mo==='sokker'?cb:col,kind:'water',t:.16,edge:ed},0);
      if(kind==='frø')for(const a of[-.5,0,.5])fp(ankel,toCCW([[H.L[2]-.2,-.3],[H.L[2]+1.1,Math.sin(a)*1.5-.45],[H.L[2]+1.1,Math.sin(a)*1.5+.45],[H.L[2]-.2,.3]]),{color:col,kind:'water',t:.14,edge:ed},-.02);
      return{rod,laar,knae,ankel}});
    /* forben: korte, hænger ned fra skulderen og følger kroppen */
    FOR=[0,1].map(naer=>{const col=naer?c0:far,ed=hexOf(shade(col,-.5)),p=fpiv(T.i,H.sh[0]+(naer?0:.9),H.sh[1],naer?.34:-.3),x=H.sh[0]+(naer?0:.9),y=H.sh[1];
      fp(p.i,toCCW(sm([[x-.62,y+.3,1],[x+.62,y+.3,1],[x+.56,y-H.Lf+.9],[x+(kind==='frø'?1.5:.95),y-H.Lf+.25],[x+.8,y-H.Lf,1],[x-.6,y-H.Lf,1],[x-.56,y-H.Lf+.9]],4)),{color:mo==='sokker'?cb:col,kind:'water',t:.16,edge:ed},0);return p.o})}
  /* alt i dyret ligger i en indre gruppe, så et hop kan løfte og flytte hele dyret, uden at den, der flytter dyret rundt, mærker det */
  K.I=new THREE.Group();for(const c of[...G.children])K.I.add(c);G.add(K.I);const RAD=Math.PI/180;K.bl=Math.random()*3;
  if(fugl){K.hopper=true;K.cyk=1;K.skridt=2.6}
  /* skridt: hvor langt dyret bliver flyttet pr. hop (i dyrets egne mål). Gives kun af den, der flytter dyret jævnt hele tiden (kortet): så rykker dyret frem i springet og står stille på jorden imellem.
     Alle andre steder flyttes dyret kun, mens det er i luften, og så skal der ingen forskydning være (ellers glider det baglæns efter landingen) */
  K.tick=(t,{ph=0,amp=0,skridt}={})=>{const s=Math.sin(ph);K.hr=0;
    if(HOPPER){const H=HOPPER,KK=H.K;K.a=(K.a||0)+(amp-(K.a||0))*.22;const A=K.a,c=((ph/(TAU*H.cyk))%1+1)%1;let n=0;while(n<KK.length-2&&c>=KK[n+1][0])n++;const k0=KK[n],k1=KK[n+1],u0=(c-k0[0])/(k1[0]-k0[0]),u=u0*u0*(3-2*u0),v=i=>KK[0][i]+(k0[i]+(k1[i]-k0[i])*u-KK[0][i])*A;
      const tilt=v(5)*RAD,y=H.sit+v(6),pr=Math.min(1,Math.max(0,(c-.05)/.5)),frem=pr*pr*(3-2*pr);K.luft=A>.5&&c>.06&&c<.56;
      K.I.position.x=(skridt||0)*(frem-c)*A;TO.position.set(H.hip[0],y,0);TO.rotation.z=tilt;K.hr=-tilt*.8;
      BAG.forEach(b=>{b.rod.position.x=H.hip[0];b.rod.position.y=y;b.laar.rotation.z=v(1)*RAD;b.knae.rotation.z=v(2)*RAD;b.ankel.rotation.z=v(3)*RAD});FOR.forEach(f=>{f.rotation.z=v(4)*RAD-tilt});
      if(K.ears)K.ears.o.rotation.z=(.12+.5*Math.sin(Math.min(1,Math.max(0,(c-.04)/.5))*Math.PI)*A)+.04*Math.sin(t*1.3)}
    else if(fugl){/* uglen: små hop på begge fødder. Vingerne slår ud i luften, og kroppen trykkes lidt sammen, når den lander */
      K.a=(K.a||0)+(amp-(K.a||0))*.22;const A=K.a,c=((ph/TAU)%1+1)%1,luft=c<.62,u=luft?c/.62:0,bue=Math.sin(u*Math.PI),duk=luft?0:Math.sin((c-.62)/.38*Math.PI);K.luft=A>.5&&luft;
      K.I.position.y=1.5*bue*A;K.I.scale.y=1-.1*duk*A;K.I.scale.x=1+.06*duk*A;K.I.position.x=3.8*(1-(1+.06*duk*A));for(const w of K.wings)w.o.rotation.z=w.sx*(.05+.05*Math.sin(t*1.4)+.9*bue*A);K.feet.position.y=-.5*bue*A;K.feet.rotation.z=0}
    else{K.I.position.y=0;K.I.rotation.z=0;K.I.scale.y=1;K.legs.forEach((l,i)=>{l.rotation.z=(i%3===0?-1:1)*.5*s*amp})}K.tail.rotation.z=(kind==='hund'?.3*Math.sin(t*7):.16*Math.sin(t*1.6))+.12*Math.sin(ph*2)*amp;K.head.rotation.z=.05*Math.sin(t*.85)+.04*s*amp+(K.hr||0);K.lids.visible=(t+1.3+K.bl)%3.1<.13};
  FRES=1;return K}
const makeCat=makePet;

/* ---- byens folk: samme dukke som heksen, i andre farver og andet tøj ---- */
const FOLK=[
  {hår:'knolde',tøj:'festkjole',hat:'ingen',kappe:'ingen',hair:['#c2553a','#e58a5a','#8a3020'],col:{kjole:'#2f7f86'},iris:['#8ac6ff','#2a5a9a'],sc:.27,sp:5},
  {hår:'kort',tøj:'rejsekappe',hat:'nathat',kappe:'ingen',skæg:'#f1ece2',hair:['#d8d2c8','#f4f0e8','#a8a098'],col:{frakke:'#7a2f3a',hat:'#7a2f3a'},freck:false,lash:0,sc:.28,sp:4},
  {hår:'kort',tøj:'opdager',hat:'ingen',kappe:'ingen',tilbehør:'rygsæk',skin:'#c68e6a',skinSh:'#a8704e',hair:['#3a2618','#5a3c28','#22140c'],iris:['#c89a5a','#6a4420'],freck:false,sc:.23,sp:5.5},
  {hår:'fletning',tøj:'skovløber',hat:'ingen',kappe:'kort',skin:'#e8b890',skinSh:'#c8946c',hair:['#4a2f1c','#6e4a2e','#2e1c10'],sc:.27,sp:4.5},
  {hår:'bølger',tøj:'stjernekjole',hat:'heksehat',kappe:'lang',hair:['#2a2030','#4a3a58','#16101c'],col:{kjole:'#3f7a4a',hat:'#2f5a38',kappe:'#5a3a22'},iris:['#e8c86a','#8a6a20'],sc:.28,sp:4.5}];
function makeFolk(i){const L=FOLK[i],F=makeFigure(Object.assign({stav:false,tilbehør:'ingen',res:.5},L));F.G.scale.setScalar(L.sc);return{root:F.G,tick:F.tick,F,sp:L.sp}}

/* ---- drageungen: sidder og sover med nathue; vågner og basker med vingerne, når man trykker ---- */
function makeDragon(o={}){const D={root:new THREE.Group()},G=D.root,GR='#5fa34a',GL='#8cc66a',GD='#3f7a34',BE='#f2e2a8',RED='#c2453a',HORN='#f3ead2';FRES=o.res||1;
  {const t=fpiv(G,4,2.2,-.4);D.tail=t.o;const tl=sm([[2,.5],[8.6,.2],[12.4,1.4],[13.8,4.2],[12.8,7.2],[11.3,7.5],[11.6,4.7],[10.2,3.1],[6.6,3.3],[2,3.7]],8);
    for(let i=0;i<3;i++){const x=6.9+i*1.25;fp(t.i,[[x,3.25-i*.05],[x+.5,4.5],[x+1,3.2-i*.05]],{color:RED,kind:'water',t:.12},-.06)}
    fp(t.i,tl,{t:.22,s:30,ed:GD,paint:P=>{P.wash(GR,tl,{top:GL,edge:.6,clouds:6});for(let i=0;i<8;i++){const x=R(6,12.6),y=R(.8,3);P.pen(curve([[x-.3,y],[x,y+.25],[x+.3,y]],4),GD,.06,.4)}}},0);
    fp(t.i,toCCW([[12,7.1],[10.5,9.6],[12.1,8.8],[13.8,9.8],[13.1,6.9]]),{color:RED,kind:'water',t:.2},.04)}
  D.wings=[];for(const s of[-1,1]){const w=fpiv(G,s*3,11.3,-.3),wp=toCCW(sm([[s*3,11.8],[s*5.6,15.2],[s*8.6,17.2],[s*11.4,17.4,1],[s*11.2,15],[s*10.2,12.4,1],[s*9,13.6],[s*7.6,11,1],[s*6.4,12.4],[s*4.6,9.8,1],[s*3.6,10.6]],6));
    fp(w.i,wp,{t:.14,s:30,ed:'#5a7a28',paint:P=>{P.wash('#a3c94a',wp,{top:'#cbe670',edge:.6});for(const e of[[s*11.1,17.2],[s*10.1,12.7],[s*7.6,11.3],[s*4.7,10.1]])P.score([[s*3.2,11.4],e],{w:.1,ink:.45,dark:'#3a5a18'})}},0);D.wings.push([w.o,s])}
  D.body=fgrp(G);const b=sm([[-5.5,.3],[5.5,.3],[6.9,3.8],[6,8.4],[3.6,12.2],[-3.6,12.2],[-6,8.4],[-6.9,3.8]],8);
  fp(D.body,b,{t:.3,s:30,cap:1024,ed:GD,paint:P=>{P.wash(GR,b,{top:GL,edge:.7,clouds:10});for(let i=0;i<30;i++){const x=R(-6.2,6.2),y=R(.8,11);P.pen(curve([[x-.3,y],[x,y+.25],[x+.3,y]],4),GD,.06,.35)}}},0);
  {const bel=circ(0,5.2,3.9,4.8,32);fp(D.body,bel,{t:.1,s:36,ed:'#d8c480',paint:P=>{P.wash(BE,bel,{edge:.5,top:'#fff6d0'});for(let y=1.6;y<9.6;y+=1.2)P.score(curve([[-3.7,y],[0,y-.45],[3.7,y]],6),{w:.08,ink:.35,dark:'#b89a50'})}},.32)}
  for(const s of[-1,1]){const f=toCCW(sm([[s*2.4,-.1],[s*6.9,-.1],[s*7.3,1],[s*5.9,2.3],[s*3.3,2.2],[s*2.2,1]],6));fp(D.body,f,{t:.3,s:40,ed:GD,paint:P=>{P.wash(hexOf(shade(GR,-.12)),f,{edge:.5});for(const k of[-1,0,1])P.fill(circ(s*4.8+k*1.15,.28,.34,.3,8),'#f6efdc',1)}},.5);
    const a=toCCW(sm([[s*5.5,9.8],[s*6.7,8],[s*5.5,5.3],[s*3.5,4.9],[s*3,6],[s*4.3,6.8],[s*4.5,9.2]],6));fp(D.body,a,{t:.2,s:40,ed:GD,paint:P=>{P.wash(GR,a,{top:GL,edge:.5});for(const k of[0,1,2])P.fill(circ(s*(3.15+k*.12),5.15+k*.42,.2,.17,6),'#f6efdc',1)}},.6)}
  const h=fpiv(G,0,11.4,.8),HI=h.i;D.head=h.o;
  for(const s of[-1,1]){fp(HI,toCCW([[s*2.6,17.6],[s*4.9,20.2],[s*3.9,16.8]]),{color:HORN,kind:'card',t:.2},-.05);const e=toCCW([[s*4.6,15.6],[s*7.2,16.8],[s*6.5,14.6],[s*7.4,13.1],[s*4.8,13.2]]);fp(HI,e,{t:.14,s:40,ed:'#5a7a28',paint:P=>{P.wash('#a3c94a',e,{edge:.5});P.wash('#e0705a',toCCW([[s*4.9,15],[s*6.6,16],[s*6.1,14.4],[s*6.6,13.5],[s*5,13.7]]),{alpha:.5,edge:.3,mode:'source-over'})}},-.08)}
  {const hs=sm([[-3.4,10.9],[3.4,10.9],[5.3,12],[5.9,14],[5.1,16.5],[3,18.3],[0,18.8],[-3,18.3],[-5.1,16.5],[-5.9,14],[-5.3,12]],8);
    fp(HI,hs,{t:.26,s:44,cap:1024,ed:GD,paint:P=>{P.wash(GR,hs,{top:GL,edge:.65,clouds:8});P.wash('#9ad47a',circ(0,13,3.9,1.9,24),{alpha:.8,edge:0,mode:'source-over'});
      for(const s of[-1,1]){P.fill(circ(s*1.3,13.5,.34,.24,10),'#24482a',.9);P.wash('#ffb4a4',circ(s*4,13.9,1,.65,14),{alpha:.7,edge:0,mode:'source-over'});for(const[dx,dy]of[[0,0],[.5,.3],[-.4,.35]])P.fill(circ(s*3.6+dx,16.9+dy,.1,.1,6),GD,.5)}
      P.pen(curve([[-2,12.3],[-.8,11.85],[0,12.05],[.8,11.85],[2,12.3]],8),'#24482a',.11,.9);P.fill([[1.1,11.98],[1.45,11.3],[1.8,12.1]],'#fbf6ea',1)}},0)}
  D.closed=fgrp(HI);D.open=fgrp(HI);for(const s of[-1,1]){fps(thick([curve([[s*2.2-.95,15.5],[s*2.2,14.9],[s*2.2+.95,15.5]],8)],.2),{color:'#1d2a1d',t:.04},D.closed,.3);for(const k of[-1,0,1])fps(thick([[[s*2.2+k*.6,15.02+Math.abs(k)*.14],[s*2.2+k*.85,14.6+Math.abs(k)*.16]]],.09),{color:'#1d2a1d',t:.03},D.closed,.3);
    const ec=circ(s*2.2,15.2,1.12,1.2,24);fp(D.open,ec,{t:.06,s:70,ed:'#fdfaf0',paint:P=>eyeBig(P,s*2.2,15.2,1.08,'#f0a030')},.3)}D.open.visible=false;
  {const c=fpiv(HI,0,17.4,.36);D.cap=c.o;const cp=sm([[-4.3,17.2,1],[4.3,17.2,1],[2.6,19.6],[.4,22],[-2.6,23.8],[-5.6,24.2],[-3.6,22.4],[-3.2,19.8]],6);
    fp(c.i,cp,{t:.2,s:36,ed:'#3a2878',paint:P=>{P.wash('#5a3fa8',cp,{top:'#7a5fc8',edge:.6,clouds:6});for(let i=0;i<7;i++)P.fill(starPts(R(-2.8,2),R(18.6,21.6),R(.3,.48),.16,R(1)),'#f2c230',.95);P.score(curve([[-2.4,20.6],[-.4,20.9],[1.4,20.2]],6),{w:.08,ink:.3,dark:'#2a1a58'})}},0);
    fp(c.i,sm([[-4.7,16.9],[4.7,16.9],[4.6,18],[0,18.35],[-4.6,18]],5),{color:'#f6e7c0',kind:'water',t:.22},.1);fp(c.i,circ(-5.7,24.2,1.05,1.05,20),{color:'#f6e7c0',kind:'water',t:.3},.1)}
  D.tick=(t,{awake=false}={})=>{const br=Math.sin(t*1.3);D.body.scale.y=1+.025*br;D.head.position.y=11.4+.25*br;D.head.rotation.z=awake?.12*Math.sin(t*6):.04*Math.sin(t*.6);D.closed.visible=!awake;D.open.visible=awake;D.cap.rotation.z=.06*Math.sin(t*.9);D.tail.rotation.z=.08*Math.sin(t*.7);for(const[w,s]of D.wings)w.rotation.z=s*(awake?.25*Math.sin(t*10):.03*br)};
  FRES=1;return D}

/* ---- enhjørningen: står i folden, græsser og slår med halen ---- */
function makeUnicorn(o={}){const U={root:new THREE.Group()},G=U.root,WH='#f6f1ff',SH='#d6ccf0',MANE=['#c9a0ff','#ff9ad0','#9fd8ff','#ffe08a'],GOLD='#d9a83a';FRES=o.res||1;
  const leg=(x,z,far)=>{const col=far?'#ddd4f2':WH,sh=sm([[x-.85,6.8,1],[x+.9,6.8,1],[x+.62,3.8],[x+.52,1.2],[x+.78,.9],[x+.85,0,1],[x-.75,0,1],[x-.58,1],[x-.5,3.6]],5);fp(G,sh,{t:.18,s:44,ed:SH,paint:P=>{P.wash(col,sh,{edge:.5});P.fill(box(x-1,-.2,x+1.1,.95),far?'#b88a2a':GOLD,1);P.pen([[x-.6,.98],[x+.8,.98]],'#fff6d0',.07,.8)}},z)};
  leg(-3.1,-.3,true);leg(3.6,-.3,true);
  {const t=fpiv(G,-5,9.2,-.1);U.tail=t.o;const st=[[[-5,9.2],[-7.2,8.6],[-8.2,5.8],[-7.4,2.6]],[[-5,9],[-6.6,7.6],[-7,4.8],[-6,2]],[[-5,9.3],[-7.8,9.2],[-9.2,6.6],[-8.8,3.6]],[[-5,8.8],[-6,6.8],[-5.9,4.2],[-5.2,2.6]]];st.forEach((c,i)=>{for(const s of thick([curve(c,10)],.5))fp(t.i,s,{color:MANE[i%4],kind:'water',t:.1,edge:hexOf(shade(MANE[i%4],-.3))},i*.02)})}
  {const b=sm([[-5.5,7.2],[-5.7,9.3],[-4.4,10.6],[-1,10.8],[2.4,10.5],[4.4,11.5],[5.7,10],[5.7,7.4],[4.5,5.8],[1,5.1],[-2.6,5.3],[-4.7,5.9]],8);U.body=fgrp(G);fp(U.body,b,{t:.26,s:40,ed:SH,paint:P=>{P.wash(WH,b,{edge:.7,clouds:8});P.wash(SH,box(-6,5,6,6.6),{alpha:.6,edge:0});for(let i=0;i<5;i++)P.fill(starPts(R(-4.4,-1.6),R(7,9.4),R(.25,.4),.13,R(1)),'#e6c8ff',.9)}},0)}
  leg(-4,.3,false);leg(2.7,.3,false);
  const h=fpiv(G,3.9,9.6,.4),HI=h.i;U.head=h.o;
  {const nk=sm([[2.6,8.2],[5.6,8.6],[6.4,11.4],[7.6,14],[5.6,15.2],[3.6,12.6]],6);fp(HI,nk,{t:.22,s:40,ed:SH,paint:P=>P.wash(WH,nk,{edge:.6})},0);
    const hd=sm([[4.9,13.2],[5.3,15.6],[6.8,16.8],[8.4,16.4],[9.8,14.6],[11.2,13.4],[11.3,12.2],[10.2,11.6],[8.4,12.2],[6.4,12.2]],8);
    fp(HI,toCCW([[5.6,16],[5.9,18.2],[7,16.6]]),{color:WH,kind:'water',t:.14,edge:SH},-.04);
    fp(HI,hd,{t:.24,s:60,cap:768,ed:SH,paint:P=>{P.wash(WH,hd,{edge:.6});P.wash('#ffc8dc',circ(10.5,12.5,1.1,.9,14),{alpha:.6,edge:0,mode:'source-over'});eyeBig(P,7.9,14.6,.72,'#8a6ad8');for(const k of[0,1,2])P.pen([[7.3-k*.22,15.25+k*.08],[7-k*.3,15.65+k*.02]],'#2a1c3a',.06,.9);P.fill(circ(10.7,12.6,.14,.1,6),'#8a7aa0',.9);P.pen(curve([[9.6,11.95],[10.3,11.8],[10.9,12]],5),'#8a7aa0',.07,.8);P.wash('#ff9ad0',circ(8.9,13.3,.6,.4,10),{alpha:.45,edge:0,mode:'source-over'})}},.06);
    const hn=[[7.1,16.6],[8.1,16.3],[9.3,20.8]];fp(HI,toCCW(hn),{t:.18,s:60,ed:'#a87a20',paint:P=>{P.wash(GOLD,toCCW(hn),{top:'#ffe9a0',edge:.4});for(let y=17;y<20.4;y+=.75)P.pen([[7.2+(y-16.6)*.5,y],[8.4+(y-16.6)*.2,y+.45]],'#a87a20',.07,.9)}},.12);
    [[[5.4,16.4],[4,15.2],[3.4,12.8],[2.2,11.2]],[[5.8,16],[4.8,14],[4.2,11.8],[3,10.2]],[[6.2,15.6],[5.4,13.4],[5,11],[4,9.6]],[[6.5,16.6],[7.3,15.9],[7.2,14.9]]].forEach((c,i)=>{for(const s of thick([curve(c,10)],i===3?.38:.56))fp(HI,s,{color:MANE[i%4],kind:'water',t:.1,edge:hexOf(shade(MANE[i%4],-.3))},.14+i*.02)})}
  U.tick=(t,{jump=-9}={})=>{const g=t-jump<1.2;U.head.rotation.z=g?.3*Math.sin((t-jump)/1.2*TAU):(Math.sin(t*.3)>.6?-.5:.03*Math.sin(t*1.2));U.tail.rotation.z=.2*Math.sin(t*2.4);U.hop=g?Math.abs(Math.sin((t-jump)/1.2*Math.PI))*2:0};
  FRES=1;return U}

/* ---- trolden ved broen: stor næse, store ører og mos i håret ---- */
function makeTroll(o={}){const T={root:new THREE.Group()},G=T.root,GR='#7a9a52',GL='#9cbc6c',GD='#4e6a34',TUN='#7a5a3a';FRES=o.res||1;
  {const b=sm([[-4.6,0],[4.6,0],[5.2,4],[4,8.4],[-4,8.4],[-5.2,4]],6);fp(G,b,{t:.28,s:36,ed:'#4a3420',paint:P=>{P.wash(TUN,b,{top:'#94704a',edge:.65,clouds:8});for(let x=-4;x<4.4;x+=1.3)P.score([[x,.4],[x*.8,8]],{w:.07,ink:.3,dark:'#3a2814'});P.fill(box(-2.2,2.4,-.2,4.2),'#a8644a',.95);for(const[a,b_]of[[[-2.2,2.4],[-2.5,2.1]],[[-.2,4.2],[.1,4.5]],[[-2.2,4.2],[-2.5,4.5]],[[-.2,2.4],[.1,2.1]]])P.pen([a,b_],'#f0d6a4',.06,.9)}},0);
    fp(G,box(-5.3,3.2,5.3,4.3),{color:'#4a3420',kind:'water',t:.14},.3);fps(ring(box(-.7,3,.7,4.5),.2,false),{mat:gold(),t:.1},G,.4);
    for(const s of[-1,1]){const a=toCCW(sm([[s*4.3,8],[s*6.2,6.6],[s*6.6,3.2],[s*5.8,1.9],[s*4.6,2.2],[s*4.8,5.4]],6));fp(G,a,{t:.2,s:40,ed:GD,paint:P=>{P.wash(GR,a,{top:GL,edge:.5});P.fill(box(s>0?4.3:-6.9,6.6,s>0?6.9:-4.3,8.4),TUN,.96)}},.5);
      const f=toCCW(sm([[s*1,-.1],[s*4.6,-.1],[s*4.9,.9],[s*3.4,1.6],[s*1.2,1.4]],5));fp(G,f,{color:hexOf(shade(GR,-.15)),kind:'water',t:.3,edge:GD},.4)}}
  const h=fpiv(G,0,8,.7),HI=h.i;T.head=h.o;
  for(const s of[-1,1]){const e=toCCW(sm([[s*3.6,11.6],[s*5.6,13.2],[s*7.6,12.9],[s*6.4,11],[s*3.8,9.8]],5));fp(HI,e,{t:.16,s:44,ed:GD,paint:P=>{P.wash(GR,e,{edge:.5});P.wash('#d8907a',toCCW([[s*4.2,11.4],[s*5.6,12.5],[s*6.8,12.3],[s*5.9,11.2],[s*4.3,10.5]]),{alpha:.6,edge:.3,mode:'source-over'})}},-.06)}
  {const hs=sm([[-3.5,7.9],[3.5,7.9],[4.3,10.2],[4,12.8],[2.4,14.6],[0,15.1],[-2.4,14.6],[-4,12.8],[-4.3,10.2]],8);
    fp(HI,hs,{t:.26,s:50,cap:1024,ed:GD,paint:P=>{P.wash(GR,hs,{top:GL,edge:.65,clouds:8});for(const s of[-1,1]){P.wash('#f0a890',circ(s*2.9,10.3,.9,.6,12),{alpha:.55,edge:0,mode:'source-over'});P.pen(curve([[s*.9,13],[s*1.9,13.5],[s*3,13.1]],6),GD,.2,.9);for(const[dx,dy]of[[0,0],[.45,.25],[-.35,.3]])P.fill(circ(s*2.7+dx,12.2+dy-1.2,.09,.09,6),GD,.45)}
      P.pen(curve([[-2.3,9.3],[-1,8.7],[0,8.6],[1,8.7],[2.3,9.3]],8),'#2e4420',.12,.9);for(const s of[-1,1])P.fill([[s*1.3,8.95],[s*1.65,10],[s*2,9.15]],'#fbf6ea',1)}},0);
    const n=circ(0,10.4,1.25,1.5,24);fp(HI,n,{t:.3,s:60,ed:GD,paint:P=>{P.wash(hexOf(shade(GR,-.08)),n,{top:GL,edge:.6});P.fill(circ(.45,10.9,.28,.36,10),'#c8e09a',.6)}},.3);
    T.eyes=fgrp(HI);for(const s of[-1,1]){const ec=circ(s*1.9,12.1,.82,.86,20);fp(T.eyes,ec,{t:.06,s:70,ed:'#fdfaf0',paint:P=>eyeBig(P,s*1.9,12.1,.8,'#e8b83a')},.3)}
    const hr=[[-3.6,13.4]];for(let i=0;i<=8;i++)hr.push([-3.4+i*.85,i%2?16.6+R(-.3,.5):15.2]);hr.push([3.6,13.4],[2.2,14.7],[0,15.2],[-2.2,14.7]);fp(HI,toCCW(hr),{t:.16,s:44,ed:'#2e4a1c',paint:P=>{P.wash('#4a7a2c',toCCW(hr),{top:'#6a9a3c',edge:.5});for(let i=0;i<8;i++){const x=R(-3,3);P.pen([[x,14.6],[x+R(-.3,.3),16.2]],'#2e4a1c',.06,.6)}}},.34);
    fp(HI,circ(-2.2,15.3,.5,.5,12),{color:'#e86a8a',kind:'water',t:.1},.4);fp(HI,circ(-2.2,15.3,.18,.18,8),{color:'#ffd23a',kind:'card',t:.04},.46)}
  T.tick=(t,{poke=-9}={})=>{const p=t-poke<1;T.eyes.visible=!(t%3.7<.15)||p;T.head.rotation.z=p?.15*Math.sin(t*12):.03*Math.sin(t*.8)};
  FRES=1;return T}
