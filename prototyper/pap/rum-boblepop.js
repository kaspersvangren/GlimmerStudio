/* ============ BoblePop (Arkaden) ============
   Kaspers ønske (22. nov.): en bubble shooter i stedet for Hekse-invaders, med 3 eller flere i en klynge, og kræfter, der falder ned.
   Bobler i seks farver hænger i et net under loftet. Man sigter med fingeren (en stiplet linje viser vejen, også via væggen) og slipper for at skyde.
   Rammer boblen en klynge, så der er 3 eller flere af samme farve, springer de. Bobler, der ikke længere hænger fast i loftet, falder ned og giver ekstra.
   Skyder man forbi nogle gange i træk, kommer der en ny række ned fra loftet. Når en boble når den stiplede snor forneden, er spillet slut.
   I nogle bobler sidder en kraft. Når boblen springer eller falder, falder kraften ned i kanonen:
     bombe (sprænger alt omkring sig), regnbue (passer til alle farver), lyn (fjerner en hel række) og sigte (viser hele vejen i seks skud).
   Kæledyret sidder med den næste boble; trykker man på det, bytter de to bobler plads. Er alle bobler væk, kommer næste bane med flere rækker og farver.
   Billetter: 1 + point delt med 250, højst 40. */
ROOMS.boblepop=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),R0=1.55,D=R0*2,RH=R0*Math.sqrt(3),COLS=11,TOPY=39,MAXR=11,X0=-(COLS-1)*R0,WL=-COLS*R0,WR=COLS*R0,KX=0,KY=4.6,NX=-8.2,NY=2.9,LINEY=TOPY-R0-(MAXR-1)*RH-R0-.4,V=75,XL=WL-.4,XR=WR+.4,YB=5.4,YT=TOPY+1.4,ZF=4,ZB=-5.5,KZ=5.6;
  const FARVER=['#ff6fa8','#4aa8ff','#ffc21e','#5fc86a','#a070ff','#ff8a3d'],KRAFT={bombe:'Bombe',regnbue:'Regnbue',lyn:'Lyn',sigte:'Sigte'},KFARVE={bombe:'#ff7a3a',regnbue:'#ff8fc7',lyn:'#ffd86b',sigte:'#3fc7b4'};
  const rnd=(a,b)=>a+Math.random()*(b-a),vaelg=a=>a[Math.floor(Math.random()*a.length)],v3=new THREE.Vector3();
  let G=null,tv,pt,ban,prikker=[],PRIK={},maalRing=null,sigteTag=null,sigteN=-1,msgPrev=0,msgSidst='',heks,kat,kanon,sigt=Math.PI/2,sigter=false,hopH=0,hopK=0,lamper=[],hylde=[],geo,geoK,intro=false,byttet=false,hint=null;const TEX={},TPLB={};
  /* ---------- billederne: hver slags boble tegnes én gang i papir og bruges som ét stykke ---------- */
  const hjerte=(s,dy=0)=>{const h=[];for(let i=0;i<26;i++){const q=i/26*TAU;h.push([s*16*Math.pow(Math.sin(q),3)/17,s*(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q))/17+dy])}return h};
  const maane=()=>{const p=[];for(let i=0;i<=16;i++){const a=(60+i*15)*Math.PI/180;p.push([Math.cos(a)*.82,Math.sin(a)*.82])}for(let i=16;i>=0;i--){const a=(80+i*12.5)*Math.PI/180;p.push([.36+Math.cos(a)*.7,Math.sin(a)*.7])}return p};
  const lyn=s=>[[.15*s,.75*s],[-.42*s,-.06*s],[-.02*s,-.06*s],[-.16*s,-.75*s],[.42*s,.1*s],[.02*s,.1*s]];
  const tegnKraft=(g,k,s,z)=>{const L=(sh,col,dz=0)=>put(g,piece(toCCW(sh),{color:col,kind:'water',t:.05,edge:'#1a1238'}),0,0,z+dz),st=(pts,w,col,dz=0)=>{for(const q of thick([pts],w))put(g,piece(q,{color:col,kind:'water',t:.04}),0,0,z+dz)};
    if(k==='bombe'){L(circ(-.05*s,-.12*s,.55*s,.55*s,18),'#2a2438');L(circ(-.22*s,.06*s,.14*s,.14*s,8),'#6a6280',.04);st([[.2*s,.36*s],[.42*s,.62*s]],.12*s,'#c8a868',.02);L(starPts(.5*s,.7*s,.26*s,.11*s),'#ffd86b',.06)}
    else if(k==='regnbue'){['#e8324a','#ffc21e','#4aa8ff'].forEach((c,i)=>{const r=(.72-i*.2)*s,p=[];for(let j=0;j<=12;j++){const a=Math.PI-j/12*Math.PI;p.push([Math.cos(a)*r,Math.sin(a)*r-.3*s])}st(p,.17*s,c,i*.01)})}
    else if(k==='lyn')L(lyn(s),'#ffd21e');
    else{for(const q of ring(circ(0,0,.62*s,.62*s,20),.12*s,false))put(g,piece(q,{color:'#0f8f80',kind:'water',t:.04}),0,0,z);st([[-.85*s,0],[.85*s,0]],.1*s,'#0f8f80',.02);st([[0,-.85*s],[0,.85*s]],.1*s,'#0f8f80',.02);L(circ(0,0,.16*s,.16*s,8),'#e8324a',.04)}};
  const skive=(g,c)=>{put(g,piece(circ(0,0,1.48,1.48,36),{color:c,kind:'card',t:.55,edge:hexOf(shade(c,-.3))}),0,0,0)};
  const byg={
    farve:(g,i)=>{const c=FARVER[i],lys=hexOf(shade(c,.45)),L=sh=>put(g,piece(toCCW(sh),{color:lys,kind:'card',t:.12,edge:hexOf(shade(c,-.35))}),0,0,.35);skive(g,c);
      if(i===0)L(hjerte(.74,.05));else if(i===1)L(sm([[0,.86,1],[.6,-.1],[.46,-.6],[0,-.8],[-.46,-.6],[-.6,-.1]],5));else if(i===2)L(starPts(0,0,.9,.4));else if(i===3){for(const a of[90,210,330])L(circ(Math.cos(a*Math.PI/180)*.42,Math.sin(a*Math.PI/180)*.42+.05,.4,.4,14))}else if(i===4)L(maane());else L([[0,.9],[.66,0],[0,-.9],[-.66,0]])},
    bombe:g=>{skive(g,'#4a4266');tegnKraft(g,'bombe',1.25,.34)},
    regnbue:g=>{skive(g,'#e8324a');['#ff8a3d','#ffc21e','#5fc86a','#4aa8ff','#a070ff'].forEach((c,i)=>put(g,piece(circ(0,0,1.22-i*.22,1.22-i*.22,30),{color:c,kind:'card',t:.08}),0,0,.32+i*.05))},
    lyn:g=>{skive(g,'#fff1b8');tegnKraft(g,'lyn',1.5,.34)},
    maerke:(g,k)=>{put(g,piece(circ(0,0,.95,.95,24),{color:'#fffaf0',kind:'water',t:.06,edge:'#1a1238'}),0,0,0);for(const q of ring(circ(0,0,.95,.95,24),.14,false))put(g,piece(q,{color:KFARVE[k],kind:'water',t:.05}),0,0,.06);tegnKraft(g,k,.82,.12)}};
  const billede=(key,f,h)=>{if(!TEX[key]){const rt=papBillede(ctx,f,{px:192,x0:-h,x1:h,y0:-h,y1:h});TEX[key]={rt,mat:papBilledeMat(rt)}}return TEX[key].mat};
  const matFor=b=>b.sp&&b.sp!=='sigte'?billede('sp'+b.sp,g=>byg[b.sp](g),1.75):billede('f'+b.t,g=>byg.farve(g,b.t),1.75),matMaerke=k=>billede('m'+k,g=>byg.maerke(g,k),1.1);
  const form=(key,f)=>{if(!TPLB[key]){const g=new THREE.Group();f(g);TPLB[key]=g}return TPLB[key].clone(true)};
  const formFor=b=>b.sp&&b.sp!=='sigte'?form('sp'+b.sp,g=>byg[b.sp](g)):form('f'+b.t,g=>byg.farve(g,b.t));
  const nyM=b=>{const m=new THREE.Group();m.add(formFor(b));if(b.pw){const q=form('m'+b.pw,g=>byg.maerke(g,b.pw));q.scale.setScalar(.85);q.position.set(.85,-.85,.45);m.add(q)}Rm.live.add(m);b.m=m;return b};
  const skift=b=>{b.m.remove(b.m.children[0]);b.m.add(formFor(b))};
  /* ---------- nettet: lige rækker har 11 pladser, ulige har 10 og står en halv boble forskudt. G.off skifter, når en ny række kommer ind foroven ---------- */
  const par=r=>(r+G.off)&1,ncol=r=>par(r)?COLS-1:COLS,cx=(r,c)=>X0+c*D+(par(r)?R0:0),cy=r=>TOPY-R0-r*RH,celle=(r,c)=>r>=0&&r<G.grid.length&&c>=0&&c<ncol(r)?G.grid[r][c]:null,ok=(r,c)=>r>=0&&c>=0&&c<ncol(r);
  const naboer=(r,c)=>{const p=par(r),o=[[r,c-1],[r,c+1]];for(const dr of[-1,1])o.push(p?[r+dr,c]:[r+dr,c-1],p?[r+dr,c+1]:[r+dr,c]);return o.filter(([a,b])=>ok(a,b))};
  const alle=()=>{const o=[];G.grid.forEach(rk=>rk.forEach(b=>{if(b)o.push(b)}));return o},paaBraet=()=>[...new Set(alle().map(b=>b.t))];
  const nyBoble=(farver,kraft)=>({t:vaelg(farver),pw:kraft&&Math.random()<.075?vaelg(['bombe','bombe','regnbue','regnbue','lyn','sigte']):null});
  const saet=(b,r,c,straks)=>{while(G.grid.length<=r)G.grid.push(Array(ncol(G.grid.length)).fill(null));G.grid[r][c]=b;b.r=r;b.c=c;b.tx=cx(r,c);b.ty=cy(r);if(straks)b.m.position.set(b.tx,b.ty,1)};
  const baneFarver=l=>FARVER.map((_,i)=>i).slice(0,l<3?4:l<5?5:6);
  const nyBane=l=>{for(const b of alle())Rm.live.remove(b.m);for(const b of[G.cur,G.next])if(b)Rm.live.remove(b.m);G.grid=[];G.off=0;G.lvl=l;G.miss=0;G.missMax=Math.max(3,6-Math.floor((l-1)/2));const farver=baneFarver(l),n=Math.min(4+l,8);
    for(let r=0;r<n;r++)for(let c=0;c<ncol(r);c++){const b=nyBoble(farver,true);if(c>0&&Math.random()<.42)b.t=G.grid[r][c-1].t;nyM(b);saet(b,r,c);b.m.position.set(b.tx,b.ty+38+r*1.5,1)}
    G.cur=lad();G.next=lad();G.fase='sigt';G.vent=.9;visKoe();tegnHud();visLamper()};
  /* den næste boble: kun farver, der er på brættet, så banen altid kan ryddes */
  const lad=()=>{const f=G.grid.length?paaBraet():baneFarver(G.lvl);return nyM({t:vaelg(f.length?f:baneFarver(G.lvl)),pw:null,sp:null})};
  const visKoe=()=>{if(G.cur){G.cur.m.position.set(KX,KY,KZ+1.1);G.cur.m.scale.setScalar(1)}if(G.next){G.next.m.position.set(NX,NY+1.7,6.4);G.next.m.scale.setScalar(.86)}hylde.forEach((h,i)=>{h.visible=i<G.pw.length;if(h.visible)h.material=matMaerke(G.pw[i])})};
  /* en kraft fra hylden lægges i kanonen, hvis der ligger en almindelig boble i den */
  const brugKraft=()=>{if(!G.pw.length||G.cur.sp)return;const k=G.pw.shift();if(k==='sigte'){G.sigte=6;tekst(KX,KY+5,'Sigte i 6 skud!',KFARVE.sigte,40);brugKraft();visKoe();return}G.cur.sp=k;skift(G.cur);visKoe()};
  const byt=()=>{if(G.fase!=='sigt'||G.cur.sp){LYD.doer();return}byttet=true;const a=G.cur;G.cur=G.next;G.next=a;hopK=1;LYD.plop();visKoe()};
  /* ---------- skuddet: vejen regnes ud på forhånd (den samme vej bruges til den stiplede linje) ---------- */
  const vej=(a,langt)=>{let x=KX+Math.cos(a)*2.4,y=KY+Math.sin(a)*2.4,dx=Math.cos(a),dy=Math.sin(a),hop=0;const pts=[[x,y]],ds=.35;
    for(let i=0;i<900;i++){x+=dx*ds;y+=dy*ds;if(x<WL+R0){x=2*(WL+R0)-x;dx=-dx;hop++;pts.push([WL+R0,y])}else if(x>WR-R0){x=2*(WR-R0)-x;dx=-dx;hop++;pts.push([WR-R0,y])}
      if(y>=TOPY-R0){y=TOPY-R0;break}const r0=Math.round((TOPY-R0-y)/RH);let ramt=false;for(let r=r0-1;r<=r0+1&&!ramt;r++){if(r<0||r>=G.grid.length)continue;for(const b of G.grid[r])if(b&&Math.hypot(b.tx-x,b.ty-y)<D*.86){ramt=true;break}}if(ramt)break;
      if(!langt&&hop>=1&&pts.length>1&&Math.hypot(x-pts[pts.length-1][0],y-pts[pts.length-1][1])>7)break}pts.push([x,y]);return pts};
  /* den nærmeste tomme plads, der hænger fast i noget */
  const plads=(x,y)=>{const r0=Math.round((TOPY-R0-y)/RH);let best=null,bd=1e9;for(let r=Math.max(0,r0-2);r<=r0+2;r++)for(let c=0;c<ncol(r);c++){if(celle(r,c))continue;if(r>0&&!naboer(r,c).some(([a,b])=>celle(a,b)))continue;const d=Math.hypot(cx(r,c)-x,cy(r)-y);if(d<bd){bd=d;best=[r,c]}}return best};
  const skyd=a=>{if(!G||G.fase!=='sigt'||G.vent>0)return false;const pts=vej(a,true);G.fase='flyv';G.skud={pts,i:0,d:0,b:G.cur,tot:0};G.cur=null;if(G.sigte>0)G.sigte--;hopH=1;LYD.plop();kanon.rotation.z=a-Math.PI/2;return true};
  const klynge=(r,c,t)=>{const set=new Set([r+','+c]),koe=[[r,c]];while(koe.length){const[a,b]=koe.pop();for(const[x,y]of naboer(a,b)){const q=celle(x,y);if(q&&q.t===t&&!set.has(x+','+y)){set.add(x+','+y);koe.push([x,y])}}}return[...set].map(k=>k.split(',').map(Number))};
  const fjern=(b,hvordan,i=0)=>{if(G.grid[b.r]&&G.grid[b.r][b.c]===b)G.grid[b.r][b.c]=null;if(hvordan==='pop'){b.pop=.03+i*.045}else{b.fald={vx:rnd(-3,3),vy:rnd(2,7),t:-i*.02}}G.doede.push(b);if(b.pw){G.maerker.push({k:b.pw,x:b.tx,y:b.ty,t:-(hvordan==='pop'?b.pop:.25),x0:b.tx,y0:b.ty,m:null})}};
  /* dem, der ikke længere hænger fast i loftet, falder */
  const loese=()=>{const set=new Set(),koe=[];(G.grid[0]||[]).forEach((b,c)=>{if(b){set.add('0,'+c);koe.push([0,c])}});while(koe.length){const[a,b]=koe.pop();for(const[x,y]of naboer(a,b))if(celle(x,y)&&!set.has(x+','+y)){set.add(x+','+y);koe.push([x,y])}}return alle().filter(b=>!set.has(b.r+','+b.c))};
  const trim=()=>{while(G.grid.length&&G.grid[G.grid.length-1].every(b=>!b))G.grid.pop()};
  const land=()=>{const s=G.skud,b=s.b,[x,y]=s.pts[s.pts.length-1],pl=plads(x,y);G.skud=null;if(!pl){Rm.live.remove(b.m);G.cur=lad();G.fase='sigt';visKoe();return}const[r,c]=pl;let sprang=0,faldt=0;
    if(b.sp==='bombe'||b.sp==='lyn'){const px=cx(r,c),py=cy(r),rk=(n=>n(r)>=n(r-1)?r:r-1)(q=>alle().filter(b=>b.r===q).length),ofre=alle().filter(q=>b.sp==='bombe'?Math.hypot(q.tx-px,q.ty-py)<D*2.7:q.r===rk);ofre.sort((a,q)=>Math.hypot(a.tx-px,a.ty-py)-Math.hypot(q.tx-px,q.ty-py)).forEach((q,i)=>fjern(q,'pop',i*.4));sprang=ofre.length;Rm.live.remove(b.m);
      Rm.burst(px,py,4,16,'rgba(255,236,170,.95)',b.sp==='bombe'?6:14);if(b.sp==='bombe')LYD.ild();else LYD.hak();G.ryst=.3;tekst(px,py+2,b.sp==='bombe'?'BUM!':'ZAP!',KFARVE[b.sp],54)}
    else{if(b.sp==='regnbue'){/* regnbuen tager den farve, der giver den største klynge */let bedst=null,bn=0;for(const t of new Set(naboer(r,c).map(([a,q])=>celle(a,q)).filter(Boolean).map(q=>q.t))){saet(b,r,c);b.t=t;const n=klynge(r,c,t).length;G.grid[r][c]=null;if(n>bn){bn=n;bedst=t}}b.t=bedst==null?vaelg(paaBraet().length?paaBraet():[0]):bedst;b.sp=null;skift(b)}
      saet(b,r,c,true);b.dunk=.18;const kl=klynge(r,c,b.t);if(kl.length>=3){kl.map(([a,q])=>celle(a,q)).sort((a,q)=>Math.hypot(a.tx-b.tx,a.ty-b.ty)-Math.hypot(q.tx-b.tx,q.ty-b.ty)).forEach((q,i)=>fjern(q,'pop',i));sprang=kl.length}}
    if(sprang){const ls=loese();ls.forEach((q,i)=>fjern(q,'fald',i));faldt=ls.length;const p=10*sprang+(sprang>3?(sprang-3)*10:0)+20*faldt;G.score+=p;hopH=1;tekst(cx(r,c),cy(r)+1.5,'+'+p,'#fff6d0',faldt?46:36);if(faldt>=3)tekst(cx(r,c),cy(r)+4,faldt>=8?'Kæmpe fald!':faldt>=5?'Flot fald!':'Fald!','#ffe27a',50);if(faldt)LYD.fil('bobler.falder',()=>LYD.opBip())}
    else{G.miss++;LYD.dunk();if(G.miss>=G.missMax){G.miss=0;G.nyRk=.35}}
    trim();visLamper();tegnHud();
    if(alle().some(q=>q.r>=MAXR)){tabt();return}
    if(!alle().length){G.fase='klaret';G.vent=1.6;const bonus=100*G.lvl;G.score+=bonus;G.msg='Banen er ryddet!';G.msg2='+'+bonus;G.msgT=1.8;LYD.fanfare();hopH=1;hopK=1;tegnHud();return}
    G.cur=G.next;G.next=lad();G.fase='sigt';G.vent=.12;brugKraft();visKoe()};
  /* en ny række kommer ind foroven; resten rykker en række ned */
  const nyRaekke=()=>{const farver=baneFarver(G.lvl);G.off^=1;G.grid.unshift(Array(ncol(0)).fill(null));G.grid.forEach((rk,r)=>rk.forEach((b,c)=>{if(b)saet(b,r,c)}));for(let c=0;c<ncol(0);c++){const b=nyM(nyBoble(farver,true));if(c>0&&Math.random()<.35){b.t=G.grid[0][c-1].t;skift(b)}saet(b,0,c);b.m.position.set(b.tx,b.ty+RH,1)}
    LYD.doer();G.ryst=.2;tekst(0,TOPY-4,'Ny række!','#ff9f8a',44);if(alle().some(q=>q.r>=MAXR))tabt()};
  const tabt=()=>{G.fase='tabt';G.vent=1.5;G.msg='Boblerne nåede snoren!';G.msg2='';G.msgT=9;LYD.oev();for(const b of alle())b.graa=true};
  const slut=()=>{const n=G.score,l=G.lvl,bil=Math.min(40,1+Math.floor(n/250)),rek=Math.max(SPIL.data.bobleRek||0,n);SPIL.data.bobleRek=rek;SPIL.givBil(bil);if(n>=1500)LYD.fanfare();else LYD.slut();LOG.row('boblepop',{point:n,bane:l,skud:G.skudN,billetter:bil});G.fase='vent';G.msgT=0;
    ctx.vent(`Du nåede bane ${l} og fik ${n} point. Det giver ${bil} ${bil===1?'billet':'billetter'}! Din rekord er ${rek} point.`,nytSpil)};
  const nytSpil=()=>{if(G){for(const b of[...alle(),...G.doede])Rm.live.remove(b.m);for(const q of G.maerker)if(q.m)Rm.live.remove(q.m);if(G.cur)Rm.live.remove(G.cur.m);if(G.next)Rm.live.remove(G.next.m);if(G.skud)Rm.live.remove(G.skud.b.m)}
    G={grid:[],off:0,lvl:1,score:0,skudN:0,miss:0,missMax:6,cur:null,next:null,pw:[],sigte:0,fase:'sigt',vent:0,skud:null,doede:[],maerker:[],tekster:[],msg:'',msg2:'',msgT:0,ryst:0,nyRk:0};nyBane(1)};
  const tekst=(x,y,txt,c,size)=>{if(pt)pt.pop(clamp(x,-34,34),Math.min(41,y),6,txt,{col:c==='#fff6d0'?'#ffb020':c,h:size/10})};
  const tegnHud=()=>{if(tv){tv.saet(0,G?G.lvl:1);tv.saet(1,G?G.score:0)}};
  const visLamper=()=>lamper.forEach((l,i)=>{l.m.visible=i<G.missMax;l.lm.emissiveIntensity=i<G.missMax-G.miss?1.6:.05});
  const vinkel=e=>{const p=Rm.planeAt(e,1);if(!p)return null;return{p,a:clamp(Math.atan2(Math.max(.2,p.y-KY),p.x-KX),.16,Math.PI-.16)}};
  const OPT={bg:'#f4e8d8',fit:fitBox(88,50,0,20.5),sky:'#fff4e6',ground:'#c8a878',amb:.85,key:{col:'#fff6e6',i:1.8,tgt:[0,18,0]},
    drag:(ph,e)=>{if(!G||G.fase==='vent')return;if(intro){if(ph==='start'){intro=false;ban.skjul();LYD.plop()}return}const q=vinkel(e);if(!q)return;
      if(ph==='start'){/* et tryk på kæledyret eller den næste boble bytter de to */if(Math.abs(q.p.x-(NX-2.5))<4.9&&q.p.y<NY+4.2&&q.p.y>-2){byt();sigter=false;return}sigter=q.p.y>KY-3;if(sigter)sigt=q.a}
      else if(sigter){sigt=q.a;if(ph==='end'){sigter=false;if(q.p.y>KY+1.2||Math.abs(q.p.x-KX)>4)skyd(sigt)}}},
    build:Rm=>[()=>{const g=Rm.scene;/* væggen: lyst tapet med striber og små hjerter og prikker */
        {const W=box(-80,-8,80,58);P2(g,W,{t:.3,s:8,cap:1800,paint:P=>{P.wash('#fff1e2',W,{top:'#ffe8da',edge:0,clouds:6});for(let x=-80;x<80;x+=5)P.fill(box(x,-8,x+2.2,58),'#ffdfe2',.6);for(let i=0;i<110;i++){const x=R(-78,78),y=R(-4,56);P.fill(i%2?circ(x,y,.35,.35,8):starPts(x,y,.6,.26,R(1)),i%3?'#f7b8c8':'#a8dcef',.8)}}},-14)}
        /* gulvet: lyse brædder af pap */
        for(let i=0;i<40;i++){const o={color:shade('#e8c896',R(-.05,.05)),kind:'kraft',t:.3};for(const x of[-66,0])Rm.floor(box(x,-10+i*1.05,x+66,-9+i*1.05),o,0)}
        /* papkassen: sidevægge, loft og bund inde i kassen, så man kan se, at den er dyb */
        const vaeg=(c1,c2)=>P=>{P.wash(c1,null,{top:c2,edge:.4,clouds:5});for(let i=0;i<26;i++)P.fill(circ(R(-30,60),R(0,50),.3,.3,8),'#ffffff',.5)};
        {const V=new THREE.Group();V.position.set(XL,0,0);V.rotation.y=Math.PI/2;g.add(V);P2(V,box(-ZF,YB,-ZB,YT),{t:.4,s:10,paint:vaeg('#ffc2cc','#ffd8de')},0)}
        {const V=new THREE.Group();V.position.set(XR,0,0);V.rotation.y=-Math.PI/2;g.add(V);P2(V,box(ZB,YB,ZF,YT),{t:.4,s:10,paint:vaeg('#ffc2cc','#ffd8de')},0)}
        {const V=new THREE.Group();V.position.set(0,YT,0);V.rotation.x=Math.PI/2;g.add(V);P2(V,box(XL,-ZF,XR,-ZB),{t:.4,s:10,paint:vaeg('#9fd8ef','#bfe6f4')},0)}
        Rm.floor(box(XL,ZB,XR,ZF),{color:'#c8eac0',kind:'card',t:.3},YB);
        /* forsiden: koralrød karton med prikker sat med skabelon, og en åbning til feltet */
        {const yd={outer:box(XL-3.2,0,XR+3.2,YT+4.6),holes:[box(XL,YB,XR,YT)]};P2(g,yd,{t:1.4,s:9,cap:1600,paint:P=>{P.wash('#f27a8a',yd.outer,{top:'#f68a98',edge:.3,clouds:6});for(let y=-1,r=0;y<50;y+=2.4,r++)for(let x=XL-4+(r%2?1.2:0);x<XR+4;x+=2.4)P.fill(circ(x,y,.32,.32,8),'#ffd0d6',.9)}},ZF)}
        /* en kappe foroven med buede kanter, og splitben og tape */
        {const n=11,bw=(XR-XL+1.2)/n,k=[[XL-.6,YT+1.4],[XR+.6,YT+1.4]];for(let i=0;i<n;i++){const x1=XR+.6-i*bw,x0=x1-bw;for(let j=0;j<=10;j++){const a=j/10*Math.PI;k.push([x1-(1-Math.cos(a))/2*bw,YT-.4-Math.sin(a)*1.3])}}P2(g,toCCW(k),{color:'#8fe0c8',kind:'card',t:.4,edge:'#4aa88a'},ZF+.75)}
        for(const[x,y]of[[XL-1.6,1.2],[XR+1.6,1.2],[XL-1.6,YT+3.4],[XR+1.6,YT+3.4],[XL-1.6,22],[XR+1.6,22]])put(g,piece(circ(x,y,.34,.34,12),{mat:gold(),t:.16}),0,0,ZF+.8);
        tape(g,XL-1.6,YT+3.6,ZF+.9,2.6,.8,.5);tape(g,XR+1.6,YT+3.6,ZF+.9,2.6,.8,-.5);
        /* snoren: en snor med vimpler. Når en boble når den, er spillet slut */
        {const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push([XL+(XR-XL)*t,LINEY+.6-Math.sin(t*Math.PI)*.8])}for(const q of thick([pts],.1))P2(g,q,{color:'#ead9b5',kind:'water',t:.04},2.4);
          for(let i=1;i<24;i+=2){const[x,y]=pts[i],[x2,y2]=pts[i+1];P2(g,toCCW([[x-.05,y],[x2+.05,y2],[(x+x2)/2,(y+y2)/2-1.1]]),{color:i%4===1?'#e2384e':'#fffaf0',kind:'card',t:.06},2.45)}}
        /* kanonens vogn, fadet med den næste boble, og hylden til kræfterne */
        P2(g,sm([[KX-3.4,.2,1],[KX+3.4,.2,1],[KX+2.6,2.6],[KX-2.6,2.6]],3),{color:'#d8b07a',kind:'kraft',t:2.4,edge:'#8a5a28'},KZ-.6);for(const sx of[-1,1]){P2(g,circ(KX+sx*2.6,1.2,1.25,1.25,22),{color:'#e2384e',kind:'card',t:.5},KZ+.8);put(g,piece(circ(KX+sx*2.6,1.2,.36,.36,12),{mat:gold(),t:.2}),0,0,KZ+1.1)}
        P2(g,box(NX-.3,.2,NX+.3,NY-.4),{color:'#b8905a',kind:'kraft',t:.6},6);P2(g,sm([[NX-2,NY+.2,1],[NX+2,NY+.2,1],[NX+1.3,NY-.5],[NX-1.3,NY-.5]],3),{color:'#8fe0c8',kind:'card',t:1.2,edge:'#4aa88a'},6);
        P2(g,box(5.6,1.2,14.6,1.7),{color:'#d8b07a',kind:'kraft',t:1.6,edge:'#8a5a28'},5);for(const x of[6.4,13.8])P2(g,box(x-.2,.2,x+.2,1.2),{color:'#b8905a',kind:'kraft',t:.8},5)},
      ()=>{const g=Rm.scene;/* tavlen til højre: hvad kræfterne gør */
        const T=box(22.6,10.4,43.4,39.4);P2(g,T,{t:.6,s:12,cap:1600,paint:P=>{P.wash('#fbf2dc',T,{top:'#fff8ea',edge:.4,clouds:6})}},-9);for(const s of ring(T,.7,false))P2(g,s,{color:'#d8b07a',kind:'kraft',t:.7,edge:'#8a5a28'},-8.9);for(const[x,y]of[[23.4,38.6],[42.6,38.6],[23.4,11.2],[42.6,11.2]])put(g,piece(circ(x,y,.3,.3,12),{mat:gold(),t:.14}),0,0,-8.4);
        plate(g,'boblepopnavn2','BoblePop',FONT.arkade,15,3.2,{bg:'#f27a8a',size:2,fg:'#fffaf0',x:33,y:34.4,z:-8.4});plate(g,'boblepop32','3 ens i en klynge springer',FONT.pil,18,1.7,{bg:'#fbf2dc',fg:'#5a2a14',size:1.05,x:33,y:32.4,z:-8.5});
        [['bombe','Bombe: sprænger alt omkring'],['regnbue','Regnbue: passer til alle'],['lyn','Lyn: fjerner en hel række'],['sigte','Sigte: viser hele vejen']].forEach(([k,txt],i)=>{const y=28.6-i*4.3,q=new THREE.Group();byg.maerke(q,k);q.scale.setScalar(1.5);q.position.set(25.6,y,-8.3);g.add(q);plate(g,'boblepopk2'+i,txt,FONT.pil,15.4,1.7,{bg:'#fbf2dc',fg:'#5a2a14',size:1,x:35.2,y,z:-8.5})});
        plate(g,'boblepopbyt2','Tryk på kæledyret for at bytte boble',FONT.pil,19,1.6,{bg:'#fbf2dc',fg:'#c0283e',size:.95,x:33,y:12.4,z:-8.5});
        for(const x of[-32,46]){for(const s of thick([[[x,56],[x,44.6]]],.1))P2(g,s,{color:'#2a1c12',t:.06},-7);P2(g,sm([[x-1.6,44.6],[x+1.6,44.6],[x+2.2,42.8],[x-2.2,42.8]],4),{t:1,mat:paperMat('#fff0c0','tissue',{glow:'#ffc060',gi:1.5})},-7.4);Rm.glow(x,43,-5.6,'#ffc060',15);const L=new THREE.PointLight('#ffd090',70,60,2);put(g,L,x,38,8)}},
      ()=>{const lv=Rm.live;geo=new THREE.PlaneGeometry(3.5,3.5);geoK=new THREE.PlaneGeometry(1.5,1.5);
        {const B=box(XL,YB,XR,YT);put(lv,piece(B,{t:.3,s:10,cap:1400,paint:P=>{P.wash('#9fd6f2',B,{top:'#d8f0fb',edge:0,clouds:4});P.wash('#fff6d8',circ(XR-5,YT-5,3.2,3.2,28),{alpha:.95,edge:.6,mode:'source-over'})}}),0,0,ZB);
          for(const[x,y,rx,ry,z]of[[-11,34,6,2.2,.4],[9,27,7,2.4,.6],[-6,17,5.5,2,.5],[12,13,4.6,1.8,.4],[-14,24,3.6,1.4,.3]])put(lv,piece(puff(x,y,rx,ry,9,.22),{color:'#ffffff',kind:'card',t:.3,edge:'#c8e4f0'}),0,0,ZB+z);
          for(const[x0,x1,h,c,z]of[[XL,4,10.5,'#a8dc9a',.9],[-6,XR,9.2,'#8fd27a',1.2]]){const p=[[x0,YB,1]];for(let x=x0;x<=x1;x+=2.5)p.push([x,h+1.2*Math.sin(x*.5)]);p.push([x1,YB,1]);put(lv,piece(toCCW(sm(p,4)),{color:c,kind:'card',t:.3,edge:hexOf(shade(c,-.25))}),0,0,ZB+z)}}
        /* kanonen: et messingrør, der drejer efter fingeren */
        kanon=new THREE.Group();kanon.position.set(KX,KY,KZ);lv.add(kanon);{P2(kanon,box(-1.15,-1.2,1.15,3.2),{color:'#d8b07a',kind:'kraft',t:1.2,edge:'#8a5a28'},0);P2(kanon,box(-1.3,2.9,1.3,3.6),{color:'#b8905a',kind:'kraft',t:1.4,edge:'#6a4a20'},.02);for(const y of[.3,2.1])tape(kanon,0,y,.7,2.6,.55,0);P2(kanon,circ(0,0,1.75,1.75,26),{color:'#e2384e',kind:'card',t:1.3},-.04);put(kanon,piece(circ(0,0,.36,.36,14),{mat:gold(),t:.2}),0,0,.72)}
        /* lamperne i loftet: så mange skud forbi, før der kommer en ny række */
        for(let i=0;i<6;i++){const lm=paperMat('#fff0c0','tissue',{glow:'#ffc060',gi:1.6}).clone(),m=put(lv,piece(circ((i-2.5)*2.6,YT+2.4,.62,.62,14),{t:.2,mat:lm}),0,0,ZF+.8);lamper.push({m,lm})}
        for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2.3),matMaerke('bombe'));m.position.set(7.4+i*2.7,2.9,5.9);m.userData.noShadow=true;m.visible=false;lv.add(m);hylde.push(m)}
        heks=makeFigure(Object.assign({},ctx.look));heks.G.scale.setScalar(.62);heks.G.position.set(-31,.35,6);lv.add(heks.G);Rm.blob(-31,6,10,4);kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.44);kat.G.position.set(NX-4.6,.5,7);lv.add(kat.G);
        tv=papirTavle(lv,[{navn:'Bane',cifre:2},{navn:'Point',cifre:5}],{x:32,y:41.6,z:-7.6,s:1.05});pt=papirTekster(lv);ban=papirBanner(lv,{y:25,z:9,w:40});
        /* sigtelinjen: små papirprikker i boblens farve, og en ring, hvor den lander, når man har sigte */
        for(const[k,c]of[...FARVER.map((c,i)=>[i,c]),['hvid','#fffaf0']])PRIK[k]=piece(circ(0,0,.36,.36,12),{color:c,kind:'card',t:.1,edge:'#ffffff'});
        for(let i=0;i<140;i++){const m=PRIK.hvid.clone();m.visible=false;m.userData.noShadow=true;lv.add(m);prikker.push(m)}
        maalRing=new THREE.Group();for(const q of ring(circ(0,0,R0,R0,36),.2,false))put(maalRing,piece(q,{color:'#fffaf0',kind:'card',t:.06}),0,0,0);maalRing.visible=false;lv.add(maalRing);
        /* hjælpen til at bytte: en papirhånd, der prikker på kæledyret, og en pil mellem de to bobler. Den bliver, til man har byttet én gang */
        {hint=new THREE.Group();lv.add(hint);const hand=new THREE.Group();hint.add(hand);hand.position.set(NX-4.4,6.3,7.6);hand.scale.setScalar(.95);hint.userData.hand=hand;
          const form=clip([box(-.42,.45,.42,3.3),circ(0,.45,.42,.42,14),box(-1.55,3,1.55,4.9),circ(0,4.6,1.55,1.05,22),circ(.92,2.95,.5,.56,12),circ(1.52,3.2,.44,.5,12),circ(-1.62,3.9,.48,.95,14)],null,'union');
          for(const f of form)P2(hand,f,{color:'#fff3e4',kind:'card',t:.3,edge:'#7a4a2a'},0);P2(hand,box(-1.85,5.3,1.85,6.5),{color:'#7a3fa2',kind:'card',t:.34,edge:'#4a2068'},-.02);P2(hand,box(-.22,.75,.22,1.25),{color:'#ffc4b0',kind:'water',t:.02},.2);
          const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push([NX+.5+(KX-NX-1)*t,KY+2.1+Math.sin(t*Math.PI)*2.8])}const pil=new THREE.Group();hint.add(pil);hint.userData.pil=pil;
          for(const q of thick([pts.slice(2,19)],.22))P2(pil,q,{color:'#fffaf0',kind:'card',t:.06,edge:'#e2384e'},7.2);
          for(const[a,b]of[[pts[0],pts[3]],[pts[20],pts[17]]]){const dx=a[0]-b[0],dy=a[1]-b[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;P2(pil,toCCW([[a[0],a[1]],[b[0]-uy*.6,b[1]+ux*.6],[b[0]+uy*.6,b[1]-ux*.6]]),{color:'#e2384e',kind:'card',t:.08},7.25)}
          hint.traverse(o=>{if(o.isMesh)o.userData.noShadow=true});hint.visible=false}
        nytSpil();intro=true;
        ban.vis('Sigt, og slip for at skyde',{txt2:'3 ens i en klynge springer. Tryk for at begynde',sek:0,col:'#7a3fa2',y:23})}],
    tick:(t,dt)=>{heks.tick(t,{ph:0,amp:0});kat.tick(t+1,{ph:0,amp:0});hopH=Math.max(0,hopH-dt*2.4);hopK=Math.max(0,hopK-dt*2.4);heks.G.position.y=.35+Math.sin(hopH*Math.PI)*1.1*hopH;kat.G.position.y=.5+Math.sin(hopK*Math.PI)*1.3*hopK;
      tv.tick(dt);pt.tick(dt);ban.tick(dt);
      if(hint){hint.visible=!intro&&!byttet&&!!G&&G.fase==='sigt'&&!(G.cur&&G.cur.sp);if(hint.visible){const k=(t*1.6)%1,d=k<.25?Math.sin(k/.25*Math.PI):0;hint.userData.hand.position.y=6.3-d*.9;hint.userData.hand.rotation.z=-.12+d*.08;hint.userData.pil.position.y=Math.sin(t*3)*.12}}
      if(!G)return;if(G.vent>0)G.vent-=dt;if(G.ryst>0)G.ryst-=dt;if(G.msgT>0)G.msgT-=dt;const rx=G.ryst>0?Math.sin(t*70)*.18:0;
      if(G.fase==='tabt'&&G.vent<=0){slut();return}if(G.fase==='klaret'&&G.vent<=0){G.pw=G.pw.slice(0,3);nyBane(G.lvl+1)}
      if(G.nyRk>0){G.nyRk-=dt;if(G.nyRk<=0&&G.fase!=='tabt')nyRaekke()}
      /* skuddet flyver langs sin vej */
      if(G.skud){const s=G.skud;let rest=V*dt;while(rest>0&&s.i<s.pts.length-1){const a=s.pts[s.i],b=s.pts[s.i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(s.d+rest>=L){s.tot+=L-s.d;rest-=L-s.d;s.i++;s.d=0}else{s.d+=rest;s.tot+=rest;rest=0}}
        const a=s.pts[Math.min(s.i,s.pts.length-1)],b=s.pts[Math.min(s.i+1,s.pts.length-1)],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,k=s.d/L;s.b.m.position.set(a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,1.2+(KZ-.8)*Math.max(0,1-s.tot/6));if(s.i>=s.pts.length-1){G.skudN++;land()}}
      /* boblerne glider på plads */
      for(const b of alle()){const m=b.m;m.position.x+=(b.tx+rx-m.position.x)*Math.min(1,dt*16);m.position.y+=(b.ty-m.position.y)*Math.min(1,dt*(G.fase==='sigt'&&G.vent<=0?16:9));if(b.dunk>0){b.dunk-=dt;m.scale.setScalar(1+Math.sin(b.dunk/.18*Math.PI)*.14)}else m.scale.setScalar(1);if(b.graa)m.rotation.z=Math.sin(t*20+b.c)*.06}
      /* dem, der springer eller falder */
      for(const b of G.doede){if(b.pop!=null){b.pop-=dt;if(b.pop<=0){const k=-b.pop/.14;if(!b.puf){b.puf=true;LYD.fil('boble.pop',()=>LYD.pop(),.7,rnd(.9,1.25));Rm.burst(b.tx,b.ty,2,5,'rgba(255,246,208,.95)',1.6);hopK=Math.max(hopK,.6)}b.m.scale.setScalar(Math.max(0,k<.45?1+k*.9:1.4*(1-(k-.45)/.55)));if(k>=1)b.vaek=true}}
        else{const f=b.fald;f.t+=dt;if(f.t>0){f.vy-=42*dt;b.m.position.x+=f.vx*dt;b.m.position.y+=f.vy*dt;b.m.position.z=4;b.m.rotation.z+=f.vx*.3*dt;if(b.m.position.y<-6)b.vaek=true}}if(b.vaek)Rm.live.remove(b.m)}
      G.doede=G.doede.filter(b=>!b.vaek);
      /* kræfterne falder ned til kanonen */
      for(const q of G.maerker){q.t+=dt;if(q.t<0)continue;if(!q.m){q.m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),matMaerke(q.k));q.m.userData.noShadow=true;Rm.live.add(q.m)}const k=Math.min(1,q.t/.85),e=k*k;q.m.position.set(q.x0+(KX+4-q.x0)*k,q.y0+(KY-.5-q.y0)*e+Math.sin(k*Math.PI)*3,7);q.m.rotation.z=Math.sin(q.t*9)*.3;q.m.scale.setScalar(1+.25*Math.sin(k*Math.PI));
        if(k>=1){q.vaek=true;Rm.live.remove(q.m);LYD.ding();Rm.burst(KX+4,KY,7,8,'rgba(255,236,170,.95)',2.4);if(G.pw.length>=3){G.score+=50;tekst(KX+6,KY+3,'+50','#fff6d0',36);tegnHud()}else{G.pw.push(q.k);tekst(KX+7,KY+4.4,KRAFT[q.k]+'!',KFARVE[q.k],44)}if(G.fase==='sigt'&&G.cur)brugKraft();visKoe()}}
      G.maerker=G.maerker.filter(q=>!q.vaek);
      /* kanonen følger sigtet */
      if(G.fase==='sigt')kanon.rotation.z+=((sigt-Math.PI/2)-kanon.rotation.z)*Math.min(1,dt*18);if(G.cur){G.cur.m.rotation.z=Math.sin(t*3)*.05}if(G.next){G.next.m.position.y=NY+1.7+Math.sin(t*2.2)*.12+Math.sin(hopK*Math.PI)*.6*hopK}
      /* ---- papirdelene: prikkerne i sigtelinjen, beskeden i snore, og mærket med sigte ---- */
      {let n=0;maalRing.visible=false;if(G.fase==='sigt'&&G.vent<=0&&sigter&&G.cur){const pts=vej(sigt,G.sigte>0),mat=(G.cur.sp?PRIK.hvid:PRIK[G.cur.t]).material;let rest=0;
          for(let i=0;i<pts.length-1&&n<prikker.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);let d=rest;while(d<L&&n<prikker.length){const m=prikker[n++];m.visible=true;m.material=mat;m.position.set(a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L,1.6);d+=1.5}rest=d-L}
          if(G.sigte>0){const e=pts[pts.length-1],pl=plads(e[0],e[1]);if(pl){maalRing.visible=true;maalRing.position.set(cx(pl[0],pl[1]),cy(pl[0]),1.7)}}}
        for(let i=n;i<prikker.length;i++)prikker[i].visible=false}
      if(G.msgT>0&&G.msg&&(G.msgT>msgPrev+.01||G.msg+G.msg2!==msgSidst)){msgSidst=G.msg+G.msg2;ban.vis(G.msg,{txt2:G.msg2,sek:Math.min(G.msgT,4),col:'#7a3fa2'})}msgPrev=G.msgT;
      {const n=G.fase!=='vent'?G.sigte:0;if(n!==sigteN){sigteN=n;if(sigteTag){Rm.live.remove(sigteTag);sigteTag.userData.ryd();sigteTag=null}if(n>0){sigteTag=papirTekstMesh(`Sigte: ${n} skud`,'#0f8f80',2,FONT.pil);sigteTag.position.set(KX,KY-3.7,6);Rm.live.add(sigteTag)}}}
}},Rm=makeRoom(ctx,OPT);
  ctx.efter.push(()=>{for(const k in TPLB)TPLB[k].traverse(q=>{if(q.geometry)q.geometry.dispose()});pt&&pt.ryd();ban&&ban.fjern();if(sigteTag)sigteTag.userData.ryd();for(const k in TEX){TEX[k].rt.dispose();TEX[k].mat.dispose()}if(geo){geo.dispose();geoK.dispose()}});
  ctx.test={intro:()=>intro,hint:()=>!!(hint&&hint.visible),G:()=>G,skyd:a=>{sigt=a;return skyd(a)},byt,spol:s=>{for(let i=0;i<s*25;i++)OPT.tick(Rm.t+i*.04,.04)},vej,plads,nyRaekke,giv:k=>{G.pw.push(k);brugKraft();visKoe()},
    /* den bedste vinkel: den, der får flest til at springe eller falde */
    bedst:()=>{let ba=Math.PI/2,bn=-1;for(let a=.2;a<Math.PI-.2;a+=.02){const p=vej(a,true),e=p[p.length-1],pl=plads(e[0],e[1]);if(!pl)continue;const[r,c]=pl;if(celle(r,c))continue;while(G.grid.length<=r)G.grid.push(Array(ncol(G.grid.length)).fill(null));const tmp={t:G.cur.t,r,c};G.grid[r][c]=tmp;const n=klynge(r,c,G.cur.t).length;G.grid[r][c]=null;trim();const v=n>=3?n:n*.1-r*.01;if(v>bn){bn=v;ba=a}}return[ba,bn]},
    tilstand:()=>G&&{fase:G.fase,bane:G.lvl,score:G.score,miss:G.miss,missMax:G.missMax,bobler:alle().length,raekker:G.grid.length,cur:G.cur&&(G.cur.sp||G.cur.t),next:G.next&&G.next.t,pw:G.pw.slice(),sigte:G.sigte,skud:G.skudN}}};
