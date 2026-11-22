/* ============ Trylletegning (Arkaden) ============
   Som i det oprindelige spil: frække væsner kommer svævende ned i tryllede balloner for at spise heksens lagkage. På hver ballon står et trylletegn.
   Man tegner tegnet med fingeren et vilkårligt sted, og så springer alle balloner med det tegn. Mister et væsen sin sidste ballon, bliver det til noget sødt, der flyver væk.
   Lander et væsen, løber det hen og tager en etage af kagen. Når kagen er væk, er spillet slut. Hver runde bliver hurtigere, og der kommer nye tegn:
   streg og pind fra start, V i runde 2, hat i 3, ring i 4, lyn i 7. Gaveballonen med hjertet flyver forbi en gang imellem: tegner man et hjerte, springer alt på én gang.
   Efter hver tredje runde bager heksen en ny etage, hvis der mangler en. Billetter: 1 + point delt med 110, højst 40.
   Tal og regler er hentet fra originalen (ak-tryl.js); målene er regnet om fra 1600 × 1000 til rummets mål (20 til 1). Bosserne fra originalen er ikke med endnu. */
const TRYL_TEGN=(()=>{const ring=Array.from({length:33},(_,i)=>{const a=-Math.PI/2+i/32*TAU;return[Math.cos(a)*.92,Math.sin(a)*.92]}),hj=Array.from({length:41},(_,i)=>{const t=i/40*TAU,x=16*Math.pow(Math.sin(t),3),y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));return[x/17,(y+2.5)/16]});
  return{vand:{navn:'Streg',c:'#ff6fa8',p:[[-1,0],[1,0]]},lod:{navn:'Pind',c:'#35c4b0',p:[[0,-1],[0,1]]},v:{navn:'V',c:'#ffb81e',p:[[-.85,-.8],[0,.85],[.85,-.8]]},hat:{navn:'Hat',c:'#9b6bff',p:[[-.85,.8],[0,-.85],[.85,.8]]},ring:{navn:'Ring',c:'#ff8a3d',p:ring},lyn:{navn:'Lyn',c:'#4aa8ff',p:[[.5,-1],[-.6,.1],[.55,-.1],[-.45,1]]},hjerte:{navn:'Hjerte',c:'#ffd86b',p:hj}}})();
/* genkendelsen (uændret fra originalen): tager den tegnede streg og de tegn, der er i spil, og svarer med tegnets navn eller null. Den er med vilje flink: børn tegner skævt, for stort, for småt og begge veje rundt */
const trylGenkend=(()=>{const N=32,dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),len=p=>{let L=0;for(let i=1;i<p.length;i++)L+=dist(p[i-1],p[i]);return L};
  function resample(p,n){const L=len(p),step=L/(n-1),out=[p[0].slice()];let acc=0;const q=p.map(a=>a.slice());for(let i=1;i<q.length;i++){const d=dist(q[i-1],q[i]);if(acc+d>=step&&d>0){const t=(step-acc)/d,nx=q[i-1][0]+t*(q[i][0]-q[i-1][0]),ny=q[i-1][1]+t*(q[i][1]-q[i-1][1]);out.push([nx,ny]);q.splice(i,0,[nx,ny]);acc=0}else acc+=d}while(out.length<n)out.push(q[q.length-1].slice());return out.slice(0,n)}
  const box=p=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[x,y]of p){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return{x0,y0,x1,y1,w:x1-x0,h:y1-y0}};
  function unit(p){const b=box(p),w=b.w||1,h=b.h||1;return p.map(([x,y])=>[((x-b.x0)/w)*2-1,((y-b.y0)/h)*2-1])}
  const path=(a,b)=>{let s=0;for(let i=0;i<N;i++)s+=dist(a[i],b[i]);return s/N},T={},add=(name,pts)=>{const u=unit(resample(pts,N));(T[name]=T[name]||[]).push(u,u.slice().reverse())};
  for(const k of[0,-.45,.45]){add('v',[[-1,-1],[k,1],[1,-1]]);add('hat',[[-1,1],[k,-1],[1,1]])}add('v',[[-1,-.3],[-.3,1],[1,-1]]);add('hat',[[-1,.3],[-.3,-1],[1,1]]);
  add('lyn',TRYL_TEGN.lyn.p);add('lyn',TRYL_TEGN.lyn.p.map(([x,y])=>[-x,y]));add('lyn',[[-1,-1],[1,-1],[-1,1],[1,1]]);add('lyn',[[1,-1],[-1,-1],[1,1],[-1,1]]);add('lyn',[[.2,-1],[-1,.15],[1,-.15],[-.2,1]]);add('lyn',[[-.2,-1],[1,.15],[-1,-.15],[.2,1]]);
  for(let s=0;s<8;s++)add('ring',Array.from({length:33},(_,i)=>{const a=s*Math.PI/4+i/32*TAU;return[Math.cos(a),Math.sin(a)]}));
  {const h=TRYL_TEGN.hjerte.p,n=h.length-1;add('hjerte',h);add('hjerte',Array.from({length:n+1},(_,i)=>h[(i+n/2)%n]))}
  return function(raw,aktive){if(!raw||raw.length<3)return null;const A=new Set(aktive),L=len(raw),b=box(raw),D=Math.max(b.w,b.h),d=Math.min(b.w,b.h);if(L<60||D<45)return null;
    const a=raw[0],z=raw[raw.length-1],ende=dist(a,z),lige=ende/L;
    if(lige>.82||(d<.26*D&&lige>.7)){const v=Math.atan2(Math.abs(z[1]-a[1]),Math.abs(z[0]-a[0]))*180/Math.PI,n=v<38?'vand':v>52?'lod':null;return n&&A.has(n)?n:null}
    if(d<.2*D)return null;const u=unit(resample(raw,N));let best=null,bd=9,second=9;
    for(const name of Object.keys(T)){if(!A.has(name))continue;let m=9;for(const t of T[name]){const s=path(u,t);if(s<m)m=s}if(m<bd){second=bd;bd=m;best=name}else if(m<second)second=m}
    if(!best)return null;const lukket=ende<.5*D;
    if(lukket&&A.has('ring')&&A.has('hjerte')&&(best==='ring'||best==='hjerte')){const bund=raw.filter(p=>p[1]>b.y0+.84*b.h),bb=box(bund);best=bb.w<.42*b.w?'hjerte':'ring';bd=Math.min(bd,.5)}
    if((best==='ring'||best==='hjerte')&&ende>.7*D)return null;if(lukket&&d>.5*D&&best!=='ring'&&best!=='hjerte')return null;
    return bd<((best==='ring'||best==='hjerte')&&lukket?.62:.48)?best:null}})();
ROOMS.tryl=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),TG=TRYL_TEGN,U=20,TOP=45.5,BR=2.7,HX=-11.4,DX=11.1,rnd=(a,b)=>a+Math.random()*(b-a),vaelg=a=>a[Math.floor(Math.random()*a.length)];
  /* hvert slags væsen: fart, antal balloner, hvilken runde det kommer i, hvor meget det svajer, hvor tit det kommer, og hvor højt det er (fra grebet om snorene til fødderne) */
  const SLAGS={gnom:{fart:1,bal:1,fra:1,svaj:.5,tit:5,H:6.3},spoeg:{fart:.86,bal:2,fra:2,svaj:1.3,tit:3,H:6.4},froe:{fart:1.3,bal:1,fra:3,svaj:3.7,tit:3,H:5.8},gris:{fart:.7,bal:3,fra:4,svaj:.4,tit:2,H:6.2},drage:{fart:.58,bal:4,fra:7,svaj:.8,tit:1.3,H:7}};
  const BPOS={1:[[0,5.9]],2:[[-2.55,5.5],[2.55,5.5]],3:[[-4.2,4.9],[0,7.5],[4.2,4.9]],4:[[-5.2,4.3],[-1.9,7.5],[1.9,7.5],[5.2,4.3]]},SOEDT=['sommerfugl1','sommerfugl2','cupcake','and','hjertevinge'];
  const rundeplan=w=>{const tegn=['vand','lod'];if(w>=2)tegn.push('v');if(w>=3)tegn.push('hat');if(w>=4)tegn.push('ring');if(w>=7)tegn.push('lyn');const nyt=w===1?['vand','lod']:w===2?['v']:w===3?['hat']:w===4?['ring']:w===7?['lyn']:[];
    return{tegn,nyt,antal:Math.min(5+w*2,26),gab:Math.max(.5,2.85-w*.165),fart:Math.min(50+w*6,200)/U}};
  let frys=false,S=null,lag,lg,heks,kat,kage=[],gaveG,hud,ht,skjul,W_=1,H_=1;const TPL={},BAL={},v3=new THREE.Vector3();
  const tegnHud=()=>{const g=hud.getContext('2d');g.clearRect(0,0,640,72);g.fillStyle='#1a1238';g.beginPath();g.roundRect(2,2,636,68,20);g.fill();g.strokeStyle='#ffd86b';g.lineWidth=4;g.stroke();g.fillStyle='#ffe9a0';g.textAlign='center';g.textBaseline='middle';g.font=FONT.arkade.replace('X','34px');
    g.fillText(S&&S.fase!=='vent'?`Runde ${S.runde}  ·  Point ${S.score}`:'Tryk for at begynde',320,38,610);ht.needsUpdate=true};
  /* fra rummets mål til skærmens punkter (til stregen, teksterne og kortet, som tegnes på et lag oven på rummet) */
  const tilSkaerm=(x,y,z=10)=>{v3.set(x,y,z).project(Rm.cam);return[(v3.x+1)/2*W_,(1-v3.y)/2*H_]};
  const gnist=(x,y,c,n,v)=>Rm.burst(x,y,12,Math.min(14,n),c,v/U*.5);
  const tekst=(x,y,txt,c,size)=>{if(txt)S.tekster.push({x:clamp(x,-34,34),y:Math.min(TOP-6,y),txt,c,size,t:0})};
  const aktive=()=>S.cfg?S.cfg.tegn.concat(S.gave?['hjerte']:[]):[];
  /* ---------- runderne ---------- */
  const begynd=()=>{for(const f of S?S.foes:[])Rm.live.remove(f.G);for(const d of S?S.dyr:[])Rm.live.remove(d.G);for(const b of S?S.frie:[])Rm.live.remove(b.G);
    S={t:0,score:0,runde:0,liv:3,forvandlet:0,cfg:null,foes:[],frie:[],dyr:[],tekster:[],spor:[],streg:null,koe:[],tving:[],spawnT:0,fase:'spil',faseT:0,kort:null,gave:null,gaveT:-1,hop:0,dyrHop:0,kageHop:0,ryst:0,msg:'',msgT:0};gaveG.visible=false;visKage();naesteRunde();tegnHud()};
  const naesteRunde=()=>{S.runde++;const w=S.runde,cfg=S.cfg=rundeplan(w),kan=Object.keys(SLAGS).filter(k=>SLAGS[k].fra<=w),sum=kan.reduce((a,k)=>a+SLAGS[k].tit,0);
    S.koe=Array.from({length:cfg.antal},()=>{let r=Math.random()*sum;for(const k of kan){r-=SLAGS[k].tit;if(r<=0)return k}return'gnom'});if(w===1)S.koe.fill('gnom');
    const ny=kan.find(k=>SLAGS[k].fra===w&&k!=='gnom');if(ny){S.koe[Math.min(2,S.koe.length-1)]=ny;S.koe[0]='gnom'}
    S.tving=cfg.nyt.slice();if(w===1)S.tving=['vand','lod','vand','lod'];S.spawnT=.6;S.gaveT=w>=3&&Math.random()<.65?rnd(4,cfg.antal*cfg.gab*.8):-1;
    if(cfg.nyt.length){S.fase='kort';S.faseT=w===1?14:9;S.kort={nyt:cfg.nyt,ok:{},t:0,ud:0}}else{S.fase='spil';S.kort=null;S.msg=`Runde ${w}`;S.msgT=1.6}
    if(w>1)LYD.nyt();tegnHud()};
  const ballon=(sym,dx,dy)=>{const G=BAL[sym].clone(true);for(const q of thick([[[0,-BR-.5],[-dx,-dy]]],.07))P2(G,q,{color:'#f6f0e2',t:.03},-.2);return G};
  const spawn=k=>{const def=SLAGS[k],n=def.bal,m=BR+.4+(n-1)*2.2+def.svaj,lo=-38+m,hi=Math.max(lo+.5,38-m);let x=0;for(let i=0;i<12;i++){x=rnd(lo,hi);if(!S.foes.some(f=>f.st==='ned'&&f.y>TOP-19&&Math.abs(f.x-x)<6.5+(n+f.bal.length)*1.7))break}
    const pulje=S.cfg.tegn.slice().sort(()=>Math.random()-.5),syms=Array.from({length:n},(_,i)=>pulje[i%pulje.length]);if(S.tving.length)syms[0]=S.tving.shift();
    const land=def.H,y=TOP+3,v=S.cfg.fart*def.fart*rnd(.93,1.08)*(y-land)/45,G=new THREE.Group(),krop=TPL[k].clone(true);G.add(krop);
    const f={k,x,x0:x,y,v,st:'ned',t:0,ups:0,ph:rnd(0,6),sf:rnd(.7,1.2),sa:def.svaj,side:1,land,G,krop,bal:BPOS[n].map(([dx,dy],i)=>{const b={sym:syms[i],dx,dy,ph:rnd(0,6),pop:false,plan:0,G:ballon(syms[i],dx,dy)};b.G.position.set(dx,dy,-.3+i*.02);G.add(b.G);return b})};
    G.position.set(x,y,6+S.foes.length%5*.3);Rm.live.add(G);S.foes.push(f)};
  /* ---------- når en streg er tegnet færdig ---------- */
  const tegnet=(pts,skaerm)=>{if(pts.length<3)return;const sym=trylGenkend(pts,aktive());let mx=0,my=0;for(const p of pts){mx+=p[0];my+=p[1]}mx=mx/pts.length/U;my=-my/pts.length/U;
    if(!sym){S.spor.push({pts:skaerm,t:0,c:'#b8b0d0'});LYD.fuser();return}
    const c=TG[sym].c;S.spor.push({pts:skaerm,t:0,c});
    if(S.fase==='kort'&&S.kort.nyt.includes(sym)&&!S.kort.ok[sym]){S.kort.ok[sym]=true;S.hop=.4;LYD.ding();gnist(mx,my,c,14,260);if(S.kort.nyt.every(k=>S.kort.ok[k]))S.faseT=Math.min(S.faseT,.9);return}
    if(sym==='hjerte'&&S.gave){hjertebrag();return}
    const ramt=[];for(const f of S.foes){if(f.st!=='ned')continue;for(const b of f.bal)if(!b.pop&&!b.plan&&b.sym===sym&&f.y+b.dy<TOP+BR*.4)ramt.push([f,b])}
    if(!ramt.length){gnist(mx,my,c,6,160);LYD.tryk();return}
    ramt.sort((a,b)=>Math.hypot(a[0].x+a[1].dx-mx,a[0].y+a[1].dy-my)-Math.hypot(b[0].x+b[1].dx-mx,b[0].y+b[1].dy-my));ramt.forEach(([f,b],i)=>{b.plan=S.t+.05+i*.075});
    const n=ramt.length,p=5*n*(n+1);S.score+=p;S.hop=.42;gnist(mx,my,c,10,240);tekst(mx,my+1.5,n>=4?'Kæmpe trylleri!':n===3?'Tredobbelt!':n===2?'Dobbelt!':'',c,46);tekst(mx,my-(n>1?.8:-.5),'+'+p,'#fff6d0',n>1?40:34);tegnHud()};
  const hjertebrag=()=>{const g=S.gave;S.gave=null;gaveG.visible=false;S.score+=100;S.hop=.5;S.dyrHop=.5;LYD.gave();Rm.burst(g.x,g.y,12,16,'rgba(255,120,170,.95)',12);Rm.burst(g.x,g.y,12,14,'rgba(255,216,107,.95)',10);
    let i=0;for(const f of S.foes){if(f.st!=='ned'||f.y>TOP+2)continue;for(const b of f.bal)if(!b.pop&&!b.plan){b.plan=S.t+.15+i*.05;i++}}tekst(g.x,g.y-3.5,'Hjertetrylleri!','#ff8fc7',56);tekst(g.x,g.y-6.1,'+100','#fff6d0',40);tegnHud()};
  const pop=(f,b)=>{b.pop=true;b.G.visible=false;const x=f.x+b.dx,y=f.y+b.dy;LYD.pop();Rm.burst(x,y,12,9,TG[b.sym].c,8);Rm.burst(x,y,12,5,'rgba(255,246,208,.95)',6);f.ups=.5;f.y-=.25;if(f.bal.every(q=>q.pop))forvandl(f)};
  const forvandl=f=>{f.st='vaek';Rm.live.remove(f.G);const x=f.x,y=f.y-SLAGS[f.k].H*.5;LYD.ding();S.forvandlet++;S.dyrHop=.4;S.score+=5*SLAGS[f.k].bal;Rm.burst(x,y,12,12,'rgba(255,255,255,.95)',9);gnist(x,y,vaelg(['#ff8fc7','#ffe27a','#7fd8ff','#c79bff']),12,300);
    const G=TPL[vaelg(SOEDT)].clone(true);G.position.set(x,y,8);Rm.live.add(G);S.dyr.push({G,x,y,t:0,vx:rnd(-3.5,3.5),vy:rnd(5.5,7.5),ph:rnd(0,6)});tegnHud()};
  /* et væsen er landet: det slipper ballonerne og løber hen til kagen */
  const lande=f=>{for(const b of f.bal)if(!b.pop){f.G.remove(b.G);b.G.position.set(f.x+b.dx,f.y+b.dy,5);Rm.live.add(b.G);S.frie.push({G:b.G,x:f.x+b.dx,y:f.y+b.dy,vy:11,t:0,ph:b.ph})}f.bal=[];f.st='loeb';f.t=0;f.side=f.x<0?-1:1;LYD.dunk();Rm.burst(f.x,.6,8,5,'rgba(205,232,208,.9)',4)};
  const bid=(f,txt)=>{if(S.liv<=0||S.fase==='tabt')return;S.liv--;S.ryst=.3;S.kageHop=.35;LYD.nam();Rm.burst(0,7+S.liv*2,10,14,'rgba(246,217,168,.95)',8);Rm.burst(0,7+S.liv*2,10,8,'rgba(255,143,199,.95)',7);tekst(f.x,f.y+1,txt||'NAM!','#ff8fc7',54);visKage();
    if(S.liv<=0){S.fase='tabt';S.faseT=2.1;S.streg=null;S.gave=null;gaveG.visible=false;S.msg='Kagen er spist!';S.msgT=9}};
  const visKage=()=>kage.forEach((k,i)=>{k.visible=!S||i<S.liv});
  const slut=()=>{const n=S.score,w=S.runde,m=S.forvandlet,bil=Math.min(40,1+Math.floor(n/110)),rek=Math.max(SPIL.data.trylRek||0,n);SPIL.data.trylRek=rek;SPIL.givBil(bil);if(n>=300)LYD.fanfare();else LYD.slut();LOG.row('tryl',{point:n,runde:w,forvandlet:m,billetter:bil});S.fase='vent';for(const q of[...S.foes,...S.dyr,...S.frie])Rm.live.remove(q.G);S.foes=[];S.dyr=[];S.frie=[];tegnHud();
    ctx.vent(`Du nåede runde ${w}, forvandlede ${m} ${m===1?'væsen':'væsner'} og fik ${n} point. Det giver ${bil} ${bil===1?'billet':'billetter'}! Din rekord er ${rek} point.`)};
  /* ---------- tegninger i papir ---------- */
  const W=(g,sh,col,z,o={})=>P2(g,toCCW(sh),Object.assign({color:col,kind:'water',t:.16,edge:hexOf(shade(col,-.4))},o),z),MORK='#1a1420',streg=(g,pts,col,w,z)=>{for(const q of thick([pts],w))P2(g,q,{color:col,kind:'water',t:.06},z)};
  const oeje=(g,x,y,r,z)=>{W(g,circ(x,y,r,r*1.08,16),'#ffffff',z,{t:.05});W(g,circ(x,y-.04,r*.55,r*.6,12),MORK,z+.05,{t:.04});W(g,circ(x+r*.2,y+r*.25,r*.2,r*.2,8),'#ffffff',z+.09,{t:.02})},bryn=(g,x,y,sx,z)=>streg(g,[[x-sx*.5,y+.28],[x+sx*.45,y-.05]],MORK,.13,z);
  const arme=(g,col,x0,y0,z)=>{for(const sx of[-1,1])streg(g,[[sx*x0,y0],[sx*.5,0]],col,.5,z)};
  const byg={
    gnom(g){arme(g,'#3d6ab8',1.5,-2.9,-.05);W(g,sm([[-1.6,-3.1,1],[1.6,-3.1,1],[1.8,-5.3],[-1.8,-5.3]],4),'#3d6ab8',0,{t:.3});for(const sx of[-1,1])W(g,circ(sx*.85,-5.75,.85,.55,12),'#6a3f22',.1,{t:.3});W(g,box(-1.75,-4.5,1.75,-4.15),'#2a1c12',.12,{t:.32});W(g,circ(0,-2.5,1.35,1.25,20),'#f2c8a0',.2,{t:.3});
      W(g,sm([[-1.35,-2.6],[1.35,-2.6],[1.1,-4.1],[0,-4.9],[-1.1,-4.1]],5),'#f6f0e2',.3,{t:.2});W(g,circ(0,-2.75,.34,.3,10),'#e8a080',.42,{t:.14});for(const sx of[-1,1]){oeje(g,sx*.55,-2.2,.3,.36);bryn(g,sx*.55,-1.75,sx,.44)}W(g,[[-1.7,-1.9],[1.7,-1.9],[.25,.9]],'#d8402a',.34,{t:.3})},
    spoeg(g){const k=sm([[-2.2,-1.9],[-1.6,-.6],[0,-.1],[1.6,-.6],[2.2,-1.9],[2.3,-5.2],[1.5,-6.3],[.8,-5.4],[0,-6.4],[-.8,-5.4],[-1.5,-6.3],[-2.3,-5.2]],6);arme(g,'#eef0ff',2,-2.2,-.05);P2(g,k,{t:.3,s:26,paint:P=>{P.wash('#f4f4ff',k,{top:'#ffffff',edge:.7,clouds:3})}},0);for(const sx of[-1,1]){W(g,circ(sx*.75,-2.2,.42,.6,12),MORK,.2,{t:.05});W(g,circ(sx*.85,-2,.14,.16,8),'#ffffff',.26,{t:.02});bryn(g,sx*.75,-1.35,sx,.3)}W(g,circ(0,-3.3,.42,.55,12),MORK,.2,{t:.05});W(g,circ(0,-3.5,.26,.2,10),'#ff8fa8',.26,{t:.03});for(const sx of[-1,1])W(g,circ(sx*1.5,-3,.4,.26,10),'#ffc2d6',.2,{t:.03})},
    froe(g){arme(g,'#4fa84a',1.6,-2.4,-.05);for(const sx of[-1,1]){streg(g,[[sx*1,-4.4],[sx*1.5,-5.3]],'#4fa84a',.5,-.02);W(g,circ(sx*1.7,-5.55,.85,.4,10),'#3f8a3c',.05,{t:.2})}W(g,circ(0,-3.4,2,1.7,22),'#6cc866',0,{t:.3});W(g,circ(0,-3.7,1.3,1.1,18),'#e8f4b8',.2,{t:.08});W(g,circ(0,-1.6,2.1,1.4,24),'#6cc866',.3,{t:.3});
      for(const sx of[-1,1]){W(g,circ(sx*1.15,-.6,.8,.8,16),'#6cc866',.28,{t:.3});oeje(g,sx*1.15,-.6,.55,.6);bryn(g,sx*1.15,.18,sx,.7)}streg(g,curve([[-1.3,-1.9],[0,-2.5],[1.3,-1.9]],8),'#2e6a2c',.14,.62);W(g,circ(0,-2.5,.35,.22,8),'#ff8fa8',.62,{t:.03})},
    gris(g){arme(g,'#ffa8c0',1.7,-2.6,-.05);for(const sx of[-1,1])W(g,sm([[sx*.5,-5.3],[sx*1.4,-5.3],[sx*1.3,-6.2],[sx*.6,-6.2]],3),'#f08aa8',-.02,{t:.3});streg(g,curve([[2.1,-4],[2.9,-3.6],[2.7,-4.6],[3.3,-4.3]],8),'#f08aa8',.2,-.04);W(g,circ(0,-3.7,2.4,2.3,26),'#ffa8c0',0,{t:.34});
      for(const sx of[-1,1])W(g,[[sx*.9,-1.9],[sx*2.1,-1.3],[sx*1.9,-2.7]],'#f08aa8',.1,{t:.24});W(g,circ(0,-3.9,1,.75,16),'#f08aa8',.3,{t:.2});for(const sx of[-1,1]){W(g,circ(sx*.35,-3.9,.16,.24,8),'#a84a68',.4,{t:.04});oeje(g,sx*.9,-2.7,.34,.3);bryn(g,sx*.9,-2.2,sx,.4)}streg(g,curve([[-.7,-4.9],[0,-5.2],[.7,-4.9]],6),'#a84a68',.12,.3)},
    drage(g){for(const sx of[-1,1])W(g,sm([[sx*1.4,-2.2,1],[sx*3.6,-.6],[sx*5,-1.6,1],[sx*4.2,-2.4],[sx*4.6,-3.6,1],[sx*3.2,-3.4],[sx*2.6,-4.4,1],[sx*1.6,-3.6]],4),'#e85a4a',-.1,{t:.14});arme(g,'#9a6ad8',1.6,-2.8,-.05);streg(g,curve([[1.4,-5.6],[3.2,-6.4],[4,-5.4]],8),'#9a6ad8',.7,-.06);W(g,[[3.6,-5.2],[4.8,-4.6],[4.4,-6]],'#e85a4a',-.04,{t:.14});
      W(g,circ(0,-4.4,2.2,2.5,24),'#9a6ad8',0,{t:.34});W(g,circ(0,-4.7,1.4,1.7,18),'#ffe9a0',.2,{t:.08});for(const sx of[-1,1])W(g,circ(sx*.9,-6.7,.75,.5,12),'#7a4ab8',.1,{t:.3});W(g,circ(0,-1.9,1.9,1.5,22),'#9a6ad8',.3,{t:.32});for(const sx of[-1,1]){W(g,[[sx*.8,-.8],[sx*1.5,.5],[sx*1.6,-1]],'#fbf0c0',.26,{t:.2});oeje(g,sx*.75,-1.6,.38,.6);bryn(g,sx*.75,-1.05,sx,.7)}
      W(g,circ(0,-2.5,1.1,.7,14),'#b48ae8',.5,{t:.14});for(const sx of[-1,1])W(g,circ(sx*.4,-2.4,.13,.18,8),'#4a2a78',.6,{t:.03});W(g,[[.5,-2.9],[.75,-3.4],[1,-2.85]],'#ffffff',.6,{t:.04})},
    sommerfugl1(g){byg.fugl(g,'#ff8fc7','#ffd86b')},sommerfugl2(g){byg.fugl(g,'#7fd8ff','#c79bff')},
    fugl(g,a,b){for(const sx of[-1,1]){W(g,sm([[sx*.15,.1],[sx*.8,1.7],[sx*2.2,1.5],[sx*2,.2],[sx*.6,-.1]],5),a,0,{t:.1});W(g,sm([[sx*.15,-.1],[sx*1.6,-.3],[sx*1.5,-1.4],[sx*.5,-1.3]],5),b,.02,{t:.1});W(g,circ(sx*1.4,.9,.3,.3,8),'#ffffff',.1,{t:.03})}W(g,circ(0,0,.24,1.1,10),'#3a2a4a',.12,{t:.14})},
    cupcake(g){W(g,[[-1.3,0],[1.3,0],[1,-1.8],[-1,-1.8]],'#ffd86b',0,{t:.3});for(const x of[-.6,0,.6])streg(g,[[x*1.15,-.1],[x,-1.7]],'#c9962e',.08,.2);W(g,sm([[-1.6,0],[-1.5,.9],[-.7,1.2],[-.6,1.9],[0,2.2],[.6,1.9],[.7,1.2],[1.5,.9],[1.6,0]],5),'#ff9fd0',.1,{t:.34});W(g,circ(0,2.4,.45,.45,10),'#e0344a',.2,{t:.3});for(const sx of[-1,1])oeje(g,sx*.5,.7,.22,.5);streg(g,curve([[-.3,.25],[0,.1],[.3,.25]],5),MORK,.08,.5)},
    and(g){W(g,sm([[-1.9,.2],[-1.2,-1.1],[1,-1.2],[1.9,-.2],[1.4,.8],[-.2,.9]],5),'#ffe04a',0,{t:.34});W(g,[[-1.9,.2],[-2.9,.9],[-1.6,.9]],'#ffe04a',-.02,{t:.2});W(g,circ(1.2,1.5,1.1,1.05,18),'#ffe04a',.1,{t:.34});W(g,sm([[2,1.6],[3.1,1.4],[2.1,1]],3),'#ff8a3d',.2,{t:.2});oeje(g,1.5,1.8,.26,.5);W(g,sm([[-.9,.1],[.5,.2],[.3,-.6],[-.7,-.5]],4),'#f2c230',.4,{t:.08})},
    hjertevinge(g){for(const sx of[-1,1])W(g,sm([[sx*.6,.3,1],[sx*1.6,1.6],[sx*3,1.4],[sx*2.4,.6],[sx*2.8,.1],[sx*1.9,-.2],[sx*.7,-.3,1]],5),'#ffffff',0,{t:.1});const hj=[];for(let i=0;i<30;i++){const q=i/30*TAU;hj.push([1.25*16*Math.pow(Math.sin(q),3)/17,1.25*(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q))/17+.15])}W(g,hj,'#ff5a8a',.1,{t:.3});for(const sx of[-1,1])oeje(g,sx*.4,.3,.2,.45)}};
  /* en ballon med sit tegn: farven hører til tegnet */
  const bygBallon=(g,sym)=>{const c=TG[sym].c,b=sm([[0,-BR-.1],[BR*.62,-BR*.62],[BR,0],[BR*.72,BR*.72],[0,BR],[-BR*.72,BR*.72],[-BR,0],[-BR*.62,-BR*.62]],8);P2(g,b,{t:.3,s:26,paint:P=>{P.wash(c,b,{top:hexOf(shade(c,.25)),edge:.7,clouds:3});P.wash('#ffffff',circ(-BR*.4,BR*.42,BR*.22,BR*.34,12),{alpha:.5,edge:.9,mode:'source-over'})}},0);W(g,[[-.4,-BR-.5],[.4,-BR-.5],[0,-BR+.1]],hexOf(shade(c,-.25)),.02,{t:.2});
    const pts=TG[sym].p.map(([x,y])=>[x*BR*.56,-y*BR*.56]);for(const q of thick([pts],.42))P2(g,q,{color:'#ffffff',kind:'water',t:.08,edge:hexOf(shade(c,-.5))},.32)};
  const OPT={bg:'#0a0620',fit:fitBox(88,50,0,20.5),sky:'#b8a8ff',ground:'#1c3a2a',amb:.62,key:{col:'#e8e0ff',i:1.7,tgt:[0,16,0],box:[-64,64,56,-34]},
    /* al tegning med fingeren er trylletegn; et tryk uden for et spil starter det */
    drag:(ph,e)=>{if(!S||S.fase==='vent'||S.fase==='tabt'){if(ph==='start'&&(!S||S.fase==='vent'))begynd();return}const p=Rm.planeAt(e,10);if(!p)return;const r=lag.getBoundingClientRect(),sk=[e.clientX-r.left,e.clientY-r.top],gp=[p.x*U,-p.y*U];
      if(ph==='start'){S.streg={pts:[gp],sk:[sk]};return}if(!S.streg)return;const a=S.streg.pts,l=a[a.length-1];if(Math.hypot(gp[0]-l[0],gp[1]-l[1])>5&&a.length<600){a.push(gp);S.streg.sk.push(sk)}
      if(ph==='end'){const st=S.streg;S.streg=null;tegnet(st.pts,st.sk)}},
    build:Rm=>[()=>{const g=Rm.scene,H=box(-80,-2,80,66);/* nattehimlen over haven, med måne, stjerner og hække */
        P2(g,H,{t:.3,s:8,cap:1800,paint:P=>{P.wash('#1a1250',H,{top:'#0c0830',edge:0,clouds:12});P.wash('#fff6c8',circ(30,38,4.6,4.6,30),{alpha:.95,edge:.8,mode:'source-over'});P.wash('#0c0830',circ(31.8,39,3.9,3.9,28),{alpha:.85,edge:.7,mode:'source-over'});for(let i=0;i<110;i++)P.fill(starPts(R(-80,80),R(8,64),R(.14,.4),.14,R(1)),i%4?'#f6f0e2':'#ffd86b',R(.3,.85))}},-14);
        {const p=[[-80,-2,1]];for(let x=-80;x<=80;x+=4)p.push([x,9.6+1.1*Math.sin(x*.55)+R(-.3,.3)]);p.push([80,-2,1]);P2(g,sm(p,5),{color:'#143a28',kind:'water',t:.5},-12)}
        /* buske foran hækken, med små blomster i */
        for(const[x,y,rx,ry,c]of[[-47,5,9,7.5,'#1d5236'],[-30,3.6,7,5.6,'#236040'],[-13,2.8,6,4.4,'#1d5236'],[12,3,6.5,4.6,'#236040'],[30,3.8,7.5,6,'#1d5236'],[47,5.2,9,7.8,'#236040']]){P2(g,puff(x,y,rx,ry,11,.2),{color:c,kind:'water',t:.6},-10.8+R(.4));for(let i=0;i<5;i++)P2(g,circ(x+R(-rx*.6,rx*.6),y+R(-ry*.3,ry*.55),.38,.38,8),{color:['#ff8fc7','#ffd54a','#ffffff'][i%3],kind:'water',t:.1},-10.1)}
        /* vimpler mellem lanternerne: det er jo en fest */
        {const vimpel=(a,b,sag)=>{const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push([a[0]+(b[0]-a[0])*t,a[1]-sag*Math.sin(t*Math.PI)])}for(const q of thick([pts],.1))P2(g,q,{color:'#f6f0e2',t:.05},-8.3);for(let i=1;i<16;i+=2){const[x,y]=pts[i],[x2,y2]=pts[i+1];P2(g,[[x-.1,y],[x2+.1,y2],[(x+x2)/2,(y+y2)/2-1.5]],{color:['#ff8fc7','#ffd86b','#7fd8ff','#b79bff'][(i>>1)%4],kind:'water',t:.08},-8.25)}};vimpel([-38,13.2],[-22,13.2],1.6);vimpel([-22,13.2],[22,13.2],3.2);vimpel([22,13.2],[38,13.2],1.6)}
        for(let i=0;i<40;i++){const o={color:shade('#2f6a44',R(-.07,.07)),kind:'water',t:.3};for(const x of[-66,0])Rm.floor(box(x,-11+i*1.1,x+66,-9.9+i*1.1),o,0)}
        for(let i=0;i<30;i++){const x=R(-76,76),z=R(-8,24),c=['#ff8fc7','#ffd54a','#ffffff','#b9a0ff'][i%4];Rm.floor(circ(x,z,.7,.7,8),{color:c,kind:'water',t:.1},.4)}
        /* lanterner i haven */
        for(const x of[-38,-22,22,38]){for(const s of thick([[[x,0],[x,11]]],.3))P2(g,s,{color:'#2a1c12',t:.5},-8);P2(g,sm([[x-1.3,11],[x+1.3,11],[x+1.6,13.6],[x,14.6],[x-1.6,13.6]],4),{t:1,mat:paperMat('#fff0c0','tissue',{glow:'#ffc060',gi:1.5})},-8.2);Rm.glow(x,12.6,-6.4,'#ffc060',13,true);const L=new THREE.PointLight('#ffc878',40,40,2);put(g,L,x,12,4)}},
      ()=>{const g=Rm.scene;/* bordet med dug, hvor kagen står */
        for(const sx of[-1,1])P2(g,box(sx*4.4-.4,0,sx*4.4+.4,4.6),{color:'#6a3f22',kind:'balsa',t:.8},3.6);P2(g,box(-6,4.4,6,5),{color:'#8a5432',kind:'balsa',t:5},1.6);
        {const d=sm([[-6.3,5.1,1],[6.3,5.1,1],[6.3,3.4],[5,2.8],[3.8,3.4],[2.5,2.8],[1.3,3.4],[0,2.8],[-1.3,3.4],[-2.5,2.8],[-3.8,3.4],[-5,2.8],[-6.3,3.4]],4);P2(g,d,{t:.2,s:20,paint:P=>{P.wash('#fbf3f8',d,{edge:.4});for(let x=-6;x<6.4;x+=1.2)P.pen([[x,5.1],[x,3]],'#ffb3d9',.3,.6)}},6.8)}
        P2(g,circ(0,5.5,4.4,.5,24),{color:'#e8e4f4',kind:'water',t:4},2.6)},
      ()=>{const lv=Rm.live;/* kagen: tre etager, der forsvinder én ad gangen */
        [[3.6,2,'#f6d9a8','#ff8fc7'],[2.7,1.8,'#f6d9a8','#b79bff'],[1.8,1.6,'#f6d9a8','#ffffff']].forEach(([r,h,c,gl],i)=>{const G=new THREE.Group(),y0=5.9+[0,2,3.8][i];P2(G,sm([[-r,y0,1],[r,y0,1],[r,y0+h],[-r,y0+h]],3),{color:c,kind:'water',t:2.4},0);
          const top=[[-r-.1,y0+h+.2,1],[r+.1,y0+h+.2,1],[r+.1,y0+h-.5]];for(let x=r;x>=-r;x-=r/3)top.push([x-r/6,y0+h-.9-(Math.round(x/r*3)%2?.3:0)],[x-r/3,y0+h-.5]);P2(G,sm(top,4),{color:gl,kind:'water',t:2.5,edge:hexOf(shade(gl,-.25))},.06);
          if(i===2){P2(G,circ(0,y0+h+.75,.6,.6,12),{color:'#e0344a',kind:'water',t:1.2},.1);Rm.glow(0,y0+h+.8,5,'#ffd86b',6,true,G)}G.position.z=3.4;lv.add(G);kage.push(G)});
        /* skabelonerne: ét af hvert væsen og én ballon pr. tegn. De ligger skjult, og hvert væsen i spillet er en kopi */
        skjul=new THREE.Group();skjul.visible=false;lv.add(skjul);for(const k of[...Object.keys(SLAGS),...SOEDT]){const G=new THREE.Group();byg[k](G);skjul.add(G);TPL[k]=G}for(const sym of Object.keys(TG)){const G=new THREE.Group();bygBallon(G,sym);skjul.add(G);BAL[sym]=G}
        gaveG=new THREE.Group();{const b=BAL.hjerte.clone(true);b.scale.setScalar(1.25);gaveG.add(b);for(const q of thick([[[0,-3.8],[0,-6]]],.07))P2(gaveG,q,{color:'#f6f0e2',t:.03},-.1);P2(gaveG,box(-1.3,-8.2,1.3,-6),{color:'#e0457a',kind:'water',t:1.2},0);P2(gaveG,box(-.3,-8.2,.3,-6),{color:'#ffd86b',kind:'water',t:1.3},.02);P2(gaveG,box(-1.3,-7.3,1.3,-6.8),{color:'#ffd86b',kind:'water',t:1.3},.02)}gaveG.visible=false;lv.add(gaveG);
        heks=makeFigure(Object.assign({},ctx.look));heks.G.scale.setScalar(.62);heks.G.position.set(HX,.35,5);lv.add(heks.G);Rm.blob(HX,5,10,4);kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.42);kat.G.position.set(DX+3,.6,6);kat.G.scale.x=-.42;lv.add(kat.G);
        hud=cv(640,72);ht=tx(hud,true);{const m=new THREE.Mesh(new THREE.PlaneGeometry(26,2.92),new THREE.MeshBasicMaterial({map:ht,transparent:true,toneMapped:false}));m.position.set(23,43.2,12);m.userData.noShadow=true;lv.add(m)}tegnHud();
        lag=document.getElementById('tegnlag');lg=lag.getContext('2d');
        ctx.say('Tegn tegnet på ballonen med fingeren, et vilkårligt sted. Tryk for at begynde.')}],
    tick:(t,dt)=>{heks.tick(t,{ph:0,amp:0});kat.tick(t+1,{ph:0,amp:0});
      /* laget oven på rummet følger skærmens størrelse */
      {const r=lag.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);W_=r.width;H_=r.height;if(lag.width!==Math.round(W_*d)||lag.height!==Math.round(H_*d)){lag.width=Math.round(W_*d);lag.height=Math.round(H_*d)}lg.setTransform(d,0,0,d,0,0);lg.clearRect(0,0,W_,H_)}
      if(!S||S.fase==='vent')return;if(frys)dt=0;S.t+=dt;S.faseT-=dt;for(const k of['hop','dyrHop','kageHop','ryst','msgT'])if(S[k]>0)S[k]-=dt;
      heks.G.position.y=.35+Math.max(0,Math.sin(S.hop/.42*Math.PI))*1.2;kat.G.position.y=.6+Math.max(0,Math.sin(S.dyrHop/.5*Math.PI))*1.4;kage.forEach((k,i)=>{k.position.x=S.ryst>0?Math.sin(t*60)*.25:0;k.position.y=S.kageHop>0?Math.sin(S.kageHop/.35*Math.PI)*.5:0});
      if(S.fase==='kort'){S.kort.t+=dt;if(S.faseT<=0){S.fase='spil';S.kort.ud=.35}}if(S.kort&&S.kort.ud>0){S.kort.ud-=dt;if(S.kort.ud<=0)S.kort=null}
      if(S.fase==='spil'){S.spawnT-=dt;if(S.spawnT<=0&&S.koe.length){spawn(S.koe.shift());S.spawnT=S.cfg.gab*rnd(.75,1.25)}
        if(S.gaveT>0){S.gaveT-=dt;if(S.gaveT<=0&&!S.gave){const d=Math.random()<.5?1:-1;S.gave={x:d>0?-50:50,y:39,d,t:0};gaveG.visible=true}}
        if(!S.koe.length&&!S.foes.some(f=>f.st!=='flygt')){S.fase='slut';S.faseT=1.7;S.score+=50;S.msg='Runde klaret!';S.msgT=1.5;tekst(0,26,'+50','#fff6d0',44);
          if(S.runde%3===0&&S.liv<3){S.liv++;S.kageHop=.5;S.msg='En ny etage på kagen!';visKage();Rm.burst(0,12,10,16,'rgba(255,226,122,.95)',10);LYD.nyt()}tegnHud()}}
      else if(S.fase==='slut'){if(S.faseT<=0)naesteRunde()}else if(S.fase==='tabt'){if(S.faseT<=0){slut();return}}
      if(S.gave){const g=S.gave;g.t+=dt;g.x+=g.d*6.75*dt;g.y=39+Math.sin(g.t*1.4)*1.1;gaveG.position.set(g.x,g.y,7);gaveG.rotation.z=.06*Math.sin(g.t*2);if((g.d>0&&g.x>52)||(g.d<0&&g.x<-52)){S.gave=null;gaveG.visible=false}}
      for(const f of S.foes){f.t+=dt;if(f.ups>0)f.ups-=dt;
        if(f.st==='ned'){f.y-=f.v*(f.t<.55?3.4:1)*dt;f.x=clamp(f.x0+Math.sin(f.t*f.sf+f.ph)*f.sa,-40,40);for(const b of f.bal)if(b.plan&&!b.pop&&S.t>=b.plan)pop(f,b);if(f.st==='ned'&&f.y<=f.land){f.y=f.land;lande(f)}
          f.krop.rotation.z=.08*Math.sin(f.t*2.2+f.ph)+(f.ups>0?.25*Math.sin(f.ups*30):0);for(const b of f.bal)if(!b.pop){b.G.rotation.z=.07*Math.sin(f.t*1.8+b.ph);const z=b.plan?1+.25*Math.sin((S.t-b.plan+.3)*30):1;b.G.scale.setScalar(z)}}
        else if(f.st==='loeb'){const d=f.side*6.4-f.x;f.x+=Math.sign(d)*Math.min(Math.abs(d),23.5*dt);f.krop.rotation.z=.15*Math.sin(f.t*18);f.y=f.land+Math.abs(Math.sin(f.t*14))*.6;if(S.fase==='tabt'||S.liv<=0){f.st='jubel';f.t=0}else if(Math.abs(d)<.15){f.st='spis';f.t=0;bid(f)}}
        else if(f.st==='spis'){f.krop.rotation.z=.2*Math.sin(f.t*26);if(f.t>.8&&S.fase!=='tabt'){f.st='flygt';f.t=0}}
        else if(f.st==='flygt'){f.x+=f.side*28*dt;f.y=f.land+Math.abs(Math.sin(f.t*14))*.8;if(f.x<-52||f.x>52){f.st='vaek';Rm.live.remove(f.G)}}
        else if(f.st==='jubel'){f.y=f.land+Math.abs(Math.sin(f.t*9))*1.6}
        f.G.position.x=f.x;f.G.position.y=f.y}
      S.foes=S.foes.filter(f=>f.st!=='vaek');
      for(const b of S.frie){b.t+=dt;b.vy+=8*dt;b.y+=b.vy*dt;b.x+=Math.sin(b.t*3+b.ph)*2*dt;b.G.position.set(b.x,b.y,5);if(b.y>TOP+8)Rm.live.remove(b.G)}S.frie=S.frie.filter(b=>b.y<=TOP+8);
      for(const d of S.dyr){d.t+=dt;d.x+=(d.vx+Math.sin(d.t*2.6+d.ph)*4.5)*dt;d.y+=d.vy*dt;d.vy+=2*dt;d.G.position.set(d.x,d.y,8);d.G.rotation.z=.2*Math.sin(d.t*5+d.ph);const z=Math.min(1,d.t*4);d.G.scale.set(z*(1+.12*Math.sin(d.t*16)),z,1);if(d.y>TOP+6)Rm.live.remove(d.G)}S.dyr=S.dyr.filter(d=>d.y<=TOP+6);
      /* ---- laget oven på: stregen, teksterne, beskeden og kortet med nye tegn ---- */
      const g=lg,linje=(pts,c,w,a)=>{if(pts.length<2)return;g.globalAlpha=a;g.lineCap=g.lineJoin='round';g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=w+6;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke();g.globalAlpha=1};
      for(const s of S.spor){s.t+=dt;linje(s.pts,s.c,10,Math.max(0,1-s.t/.5))}S.spor=S.spor.filter(s=>s.t<.5);if(S.streg)linje(S.streg.sk,'#ffe27a',10,1);
      const fs=W_/1280;g.textAlign='center';g.textBaseline='middle';
      for(const q of S.tekster){q.t+=dt;q.y+=2.3*dt;const[x,y]=tilSkaerm(q.x,q.y);g.globalAlpha=Math.max(0,1-q.t/1.25);g.font=FONT.arkade.replace('X',Math.round(q.size*fs*.8)+'px');g.lineWidth=6*fs;g.strokeStyle='#1a1238';g.strokeText(q.txt,x,y);g.fillStyle=q.c;g.fillText(q.txt,x,y)}g.globalAlpha=1;S.tekster=S.tekster.filter(q=>q.t<1.25);
      if(S.msgT>0&&S.msg&&!S.kort){const[x,y]=tilSkaerm(0,31);g.globalAlpha=Math.min(1,S.msgT*3);g.font=FONT.arkade.replace('X',Math.round(64*fs)+'px');g.lineWidth=9*fs;g.strokeStyle='#1a1238';g.strokeText(S.msg,x,y);g.fillStyle='#ffe9a0';g.fillText(S.msg,x,y);g.globalAlpha=1}
      if(S.kort){const K=S.kort,n=K.nyt.length,[cx,cy]=tilSkaerm(0,27),bw=(n*230+120)*fs,bh=330*fs,a=K.ud>0?K.ud/.35:Math.min(1,K.t*4);g.globalAlpha=a;g.fillStyle='rgba(26,18,56,.94)';g.strokeStyle='#ffd86b';g.lineWidth=5*fs;g.beginPath();g.roundRect(cx-bw/2,cy-bh/2,bw,bh,26*fs);g.fill();g.stroke();
        g.fillStyle='#ffe9a0';g.font=FONT.arkade.replace('X',Math.round(40*fs)+'px');g.fillText(n>1?'Nye trylletegn':'Nyt trylletegn',cx,cy-bh/2+44*fs);g.font=`700 ${Math.round(24*fs)}px "Alegreya Sans",sans-serif`;g.fillStyle='#f6f0e2';g.fillText('Prøv at tegne '+(n>1?'dem':'det')+' med fingeren',cx,cy+bh/2-34*fs);
        K.nyt.forEach((sym,i)=>{const x=cx+(i-(n-1)/2)*230*fs,y=cy+4*fs,r=74*fs,c=TG[sym].c;g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.lineWidth=4*fs;g.strokeStyle='#ffffff';g.stroke();g.lineWidth=13*fs;g.lineCap=g.lineJoin='round';g.strokeStyle='#ffffff';g.beginPath();TG[sym].p.forEach(([px,py],j)=>j?g.lineTo(x+px*r*.56,y+py*r*.56):g.moveTo(x+px*r*.56,y+py*r*.56));g.stroke();
          g.font=`700 ${Math.round(26*fs)}px "Alegreya Sans",sans-serif`;g.fillStyle='#ffe9a0';g.fillText(TG[sym].navn,x,y+r+24*fs);if(K.ok[sym]){g.strokeStyle='#5fd070';g.lineWidth=12*fs;g.beginPath();g.moveTo(x+r*.3,y-r*.9);g.lineTo(x+r*.62,y-r*.6);g.lineTo(x+r*1.1,y-r*1.2);g.stroke()}});g.globalAlpha=1}}},Rm=makeRoom(ctx,OPT);
  ctx.efter.push(()=>{if(lag){const g=lag.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,lag.width,lag.height)}});
  ctx.test={begynd,frys:v=>{frys=v},spol:s=>{for(let i=0;i<s*25;i++)OPT.tick(Rm.t+i*.04,.04)},S:()=>S,tegn:sym=>{/* tegner tegnet som en streg midt på skærmen, som en finger ville */const p=TG[sym].p.map(([x,y])=>[x*140,y*140-400]);const ud=[];for(let i=1;i<p.length;i++)for(let k=0;k<8;k++)ud.push([p[i-1][0]+(p[i][0]-p[i-1][0])*k/8,p[i-1][1]+(p[i][1]-p[i-1][1])*k/8]);ud.push(p[p.length-1]);tegnet(ud,ud.map(([x,y])=>tilSkaerm(x/U,-y/U)));return trylGenkend(ud,Object.keys(TG))},
    runde:w=>{S.runde=w-1;for(const f of S.foes)Rm.live.remove(f.G);S.foes=[];S.koe=[];naesteRunde()},frem:()=>{if(S.kort){S.faseT=0}},bid:()=>bid({x:0,y:10}),gave:()=>{S.gaveT=.01},tilstand:()=>S&&{fase:S.fase,runde:S.runde,score:S.score,liv:S.liv,foes:S.foes.map(f=>({k:f.k,st:f.st,y:+f.y.toFixed(1),bal:f.bal.filter(b=>!b.pop).map(b=>b.sym)})),tegn:S.cfg&&S.cfg.tegn,gave:!!S.gave,forvandlet:S.forvandlet}}};
