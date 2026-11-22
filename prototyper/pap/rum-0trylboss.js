/* ============ bosserne i Trylletegning ============
   Hver femte runde kommer et stort, mytisk væsen svævende ind over haven og kaster ting efter kagen: Kongetrolden, Ildfuglen, Isdragen og Kæmpeblæksprutten.
   Her er kun tegningerne i papir (ca. 20 høje, midten i 0,0). Reglerne står i rum-tryl.js.
   Hver boss har to ansigter: det almindelige, og det svimle (spiral-øjne og tungen ud), som den får, når man har tryllet alt det væk, den kastede. */
const TRYLBOSS=(()=>{const MK='#1a1238';
  const mk=G=>{let z=0;const W=(sh,col,o={})=>{z+=.06;return put(G,piece(toCCW(sh),Object.assign({color:col,kind:'water',t:.16,edge:hexOf(shade(col,-.4))},o)),0,0,z)},
    Wp=(sh,col)=>{z+=.2;const s2=toCCW(sh),m=put(G,piece(s2,{t:.3,s:20,paint:P=>P.wash(col,s2,{top:hexOf(shade(col,.2)),edge:.7,clouds:4})}),0,0,z);z+=.12;return m},
    S=(pts,w,col)=>{z+=.06;for(const q of thick([pts],w))put(G,piece(q,{color:col,kind:'water',t:.1}),0,0,z)},E=(x,y,rx,ry,col,o)=>W(circ(x,y,rx,ry,Math.max(12,Math.round((rx+ry)*5))),col,o);return{W,Wp,S,E,get z(){return z}}};
  /* øjnene (vrede bryn) og det svimle ansigt (spiraler og tunge) i hver sin gruppe, så man kan skifte imellem dem */
  const ansigt=(G,z,oj,[tx,ty,tw])=>{const nor=new THREE.Group(),svim=new THREE.Group();nor.position.z=svim.position.z=z+.1;G.add(nor,svim);svim.visible=false;const L=(par,sh,col,dz,t=.06)=>put(par,piece(toCCW(sh),{color:col,kind:'water',t}),0,0,dz);
    for(const[x,y,r]of oj){const s=Math.sign(x)||1;L(nor,circ(x,y,r,r*1.05,18),'#ffffff',0);L(nor,circ(x-s*.1,y-.08,r*.55,r*.6,14),MK,.06);L(nor,circ(x-s*.1+r*.2,y+r*.2,r*.2,r*.2,8),'#ffffff',.12,.03);for(const q of thick([[[x-s*r*1.1,y+r*.75],[x+s*r*.5,y+r*1.5]]],r*.3))L(nor,q,MK,.14);
      L(svim,circ(x,y,r*1.15,r*1.15,18),'#ffffff',0);const sp=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*4,rr=r*i/24;sp.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}for(const q of thick([sp],r*.16))L(svim,q,MK,.06)}
    L(svim,sm([[tx-tw,ty,1],[tx+tw,ty,1],[tx+tw,ty-tw*1.3],[tx,ty-tw*1.9],[tx-tw,ty-tw*1.3]],4),'#ff6f9a',.02);for(const q of thick([[[tx,ty-.15],[tx,ty-tw*1.2]]],.1))L(svim,q,'#d84a78',.08);return{nor,svim}};
  const B={
    /* Kongetrolden: grøn trold med krone og vest, på en sky, med en sæk bomber under armen */
    trold(G){const o=mk(G),{W,Wp,S,E}=o,g='#7ab84a',g2='#5a9a34',v='#8a5a9a';
      Wp(puff(0,-6.8,8.6,2.5,12,.2),'#f7f4ff');
      Wp(sm([[-9.5,-1,1],[-10.4,-3.6],[-9.4,-5.4],[-7,-5.6],[-4.6,-5],[-4.4,-2.6],[-5.2,-1,1]],5),'#b8864a');for(const[x,y]of[[-8.4,-.3],[-7,.1],[-5.9,-.4]]){E(x,y,.8,.8,'#2a2438');E(x-.25,y+.25,.2,.2,'#6a6280')}
      S([[-4.6,-1.8],[-5.6,-2.5],[-6.6,-2.1]],1.2,g);S([[4.8,-.5],[6.5,1],[7.6,2.6]],1.3,g);E(8,3.5,1.05,1.05,g);
      Wp(circ(0,-2,5.6,4.4,40),g);for(const s of[-1,1])W(sm([[s*5,0,1],[s*4.3,-3.6],[s*2,-5.9],[s*1.5,-6,1],[s*2,-.5,1]],4),v);E(0,-3,2.3,2,'#a8d878');for(const[x,y]of[[-3,-2.3],[-3.7,-3.8],[3,-2.3],[3.7,-3.8]])E(x,y,.26,.26,'#ffd23e');
      for(const s of[-1,1]){W([[s*3.6,5.4],[s*8.4,6.8],[s*4.4,2.8]],g);W([[s*4.4,5],[s*7,5.9],[s*4.8,3.6]],g2)}
      Wp(circ(0,4.2,4.7,4,40),g);W([[-2.6,7.4],[-3,9.6],[-1.5,8.6],[0,10],[1.5,8.6],[3,9.6],[2.6,7.4]],'#ffd23e');for(const x of[-1.5,0,1.5])E(x,8.1,.28,.28,'#e0304a');
      S(curve([[-2.4,2.4],[0,1.5],[2.4,2.4]],8),.28,MK);for(const s of[-1,1])W([[s*1.5,2],[s*1.1,3.1],[s*.7,1.8]],'#fffff0');E(0,3.9,1.5,1.2,g2);
      return ansigt(G,o.z,[[-1.9,5.5,.95],[1.9,5.5,.95]],[0,1.6,.7])},
    /* Ildfuglen: orange og rød, med vinger og hale af flammer */
    foenix(G){const o=mk(G),{W,Wp,S,E}=o,a='#ff7a2a',r='#e0402a',y='#ffd27a';
      for(const s of[-1,1]){Wp(sm([[s*2,1.5,1],[s*6,5],[s*9.8,4.2],[s*8.6,2],[s*10,.2],[s*7.6,-.2],[s*8,-2.4],[s*5.2,-1.8],[s*2,-3,1]],5),r);W(sm([[s*2.4,.8,1],[s*5.6,3.2],[s*7.6,2.6],[s*6.6,.8],[s*7,-.8],[s*4.6,-.9],[s*2.4,-2,1]],5),'#ff9a3a')}
      for(const[x,c,l]of[[-2.2,'#ffb02e',8.4],[2.2,'#ffb02e',8.4],[0,y,9.6]])W(sm([[x-.9,-4,1],[x+.9,-4,1],[x*1.5+.7,-(l-2)],[x*1.6,-l,1],[x*1.5-.7,-(l-2)]],4),c);
      for(const s of[-1,1])S([[s*1.5,-5.4],[s*1.7,-6.5]],.4,'#f2a040');
      Wp(circ(0,-1,4.2,5,40),a);E(0,-2,2.6,3.2,y);
      for(const[x,h,c]of[[-1.3,8.6,'#ffb02e'],[1.3,8.6,'#ffb02e'],[0,10,'#fff0a0']])W(sm([[x-.7,6.6,1],[x+.7,6.6,1],[x+.3,h-.8],[x-.2,h,1],[x-.5,h-1.2]],3),c);
      Wp(circ(0,4.6,3.4,3.4,36),a);for(const s of[-1,1])E(s*2.4,3.8,.7,.7,'#ffb8a0');W([[-1,4.2],[1,4.2],[0,2.3]],'#f2a040');
      return ansigt(G,o.z,[[-1.4,5.5,.85],[1.4,5.5,.85]],[0,2.4,.5])},
    /* Isdragen: lyseblå, med horn af is og vinger */
    isdrage(G){const o=mk(G),{W,Wp,S,E}=o,b='#7ac8f0',b2='#4a98d0',h='#e8f8ff';
      for(const s of[-1,1]){Wp(sm([[s*2.4,1,1],[s*5,6.4,1],[s*9.8,5.4],[s*8.8,3.2],[s*9.6,1],[s*7.4,1.2],[s*7.2,-1],[s*4.8,-.2],[s*2.4,-2.4,1]],4),b2);for(const[x,y]of[[7.6,3.6],[6.4,.8]])S([[s*3,1.2],[s*x,y]],.16,'#2a6aa0')}
      S(curve([[2.6,-5],[6.4,-6.6],[8.6,-4.6],[7.6,-2.6]],10),1.5,b);W([[7,-2.8],[8.4,-1.2],[8.4,-3.2]],h);
      for(const s of[-1,1])E(s*2.6,-6.5,1.5,.8,b);
      Wp(circ(0,-2,4.6,4.8,40),b);E(0,-2.8,2.8,3.2,h);for(const y of[-1.4,-2.8,-4.2])S([[-1.8,y],[1.8,y]],.12,'#b8dcf0');
      for(const s of[-1,1]){S([[s*4.2,-1.2],[s*5.6,-2.6]],1.1,b);E(s*5.8,-2.9,.75,.75,b)}
      for(const s of[-1,1]){W([[s*1.6,7],[s*3.4,10.4],[s*3,6.4]],h);W([[s*3.6,5.6],[s*5.8,6.4],[s*3.9,4.2]],b)}
      Wp(circ(0,4.4,4,3.6,38),b);E(0,3,2.4,1.7,'#a8dcf8');for(const s of[-1,1])E(s*.8,3.4,.22,.3,'#2a6aa0');
      S(curve([[-1.6,2.3],[0,1.9],[1.6,2.3]],6),.22,MK);for(const s of[-1,1])W([[s*1.2,2.2],[s*.9,1.3],[s*.6,2.1]],'#ffffff');W([[-.5,7.7],[0,8.9],[.5,7.7]],h);
      return ansigt(G,o.z,[[-1.6,5.4,.85],[1.6,5.4,.85]],[0,1.5,.55])},
    /* Kæmpeblæksprutten: lilla, med tiara og seks arme */
    kraken(G){const o=mk(G),{W,Wp,S,E}=o,p='#9a5ad8',p2='#e0c0ff';
      for(const[x0,x1,x2,y2,cx]of[[-4.4,-7.4,-9.2,-3.4,-8],[-2.8,-4.4,-5.6,-8,-4.2],[-1,-1.4,-1.8,-9,-.6],[1,1.4,1.8,-9,.6],[2.8,4.4,5.6,-8,4.2],[4.4,7.4,9.2,-3.4,8]])S(curve([[x0,-1],[x1,-5],[x2,y2],[cx,y2+1.6]],12),1.15,p);
      for(const[x,y]of[[-7.6,-4.2],[-4.8,-6.4],[-1.6,-7],[1.6,-7],[4.8,-6.4],[7.6,-4.2]])E(x,y,.28,.28,p2);
      Wp(sm([[-5.6,-1,1],[-6.2,3],[-4.4,7.4],[0,9],[4.4,7.4],[6.2,3],[5.6,-1,1],[3,-2],[0,-1.6],[-3,-2]],6),p);for(const[x,y,r]of[[-3.6,6.2,.8],[3,7,.6],[4.4,4.6,.5],[-4.6,3.4,.45]])E(x,y,r,r,p2);
      W([[1,8.4],[1.6,10.4],[2.6,9.2],[3.6,10.2],[4.2,7.8]],'#ffd23e');E(2.6,8.8,.3,.3,'#7fd8ff');
      S(curve([[-1.8,1],[0,.2],[1.8,1]],8),.26,MK);for(const s of[-1,1])E(s*3.8,2,.8,.6,'#ff9fd0');
      return ansigt(G,o.z,[[-2,3.6,1.1],[2,3.6,1.1]],[0,.2,.6])}};
  /* det, de kaster: stinkbombe, flamme, isklump og blækklat */
  const skud=(G,k)=>{const{W,Wp,S,E}=mk(G);
    if(k==='bombe'){Wp(circ(0,0,1.9,1.9,28),'#2a2438');E(-.6,.6,.45,.45,'#6a6280');W(box(-.4,1.7,.4,2.3),'#6a6280');S(curve([[0,2.3],[.5,3],[1.1,3.1]],6),.16,'#c8a868')}
    else if(k==='ild'){Wp(sm([[0,-2,1],[1.7,-1],[1.9,.6],[1,1.4],[1.3,2.6,1],[.2,2],[-.4,3,1],[-1.1,1.6],[-1.9,.6],[-1.7,-1]],5),'#ff7a2a');W(sm([[0,-1.4,1],[1,-.6],[1,.5],[.2,1.4,1],[-.9,.5],[-1,-.6]],4),'#ffd27a')}
    else if(k==='is'){const p=[];for(let i=0;i<12;i++){const a=i/12*TAU,r=i%2?1.5:2.3;p.push([Math.cos(a)*r,Math.sin(a)*r])}Wp(p,'#bfe8ff');const q=[];for(let i=0;i<6;i++){const a=i/6*TAU+.5;q.push([Math.cos(a)*1.3,Math.sin(a)*1.3])}W(q,'#ffffff')}
    else{Wp(puff(0,0,2,1.9,9,.24),'#6a3a9a');for(const[x,y,r]of[[1.7,-1.5,.5],[-1.9,-1,.4],[.4,-2.2,.35]])E(x,y,r,r,'#6a3a9a');E(-.6,.7,.45,.3,'#b07aff')}return G};
  /* skiltet med tegnet, som sidder på det, der kastes */
  const skilt=(G,sym)=>{const T=TRYL_TEGN[sym];put(G,piece(circ(0,0,1.3,1.3,22),{color:'#ffffff',kind:'water',t:.06,edge:MK}),0,0,0);for(const q of thick([T.p.map(([x,y])=>[x*.72,-y*.72])],.3))put(G,piece(q,{color:T.c,kind:'water',t:.05}),0,0,.08);return G};
  /* pynten, bossen får på, hver gang den bliver ramt: sløjfe, hjerte eller blomst */
  const pynt=(G,p)=>{const L=(sh,col,z)=>put(G,piece(toCCW(sh),{color:col,kind:'water',t:.1,edge:MK}),0,0,z);
    if(p==='sloejfe'){for(const s of[-1,1])L([[0,0],[s*1.5,.9],[s*1.5,-.9]],'#ff5fa8',0);L(circ(0,0,.45,.45,10),'#ff9fc8',.1)}
    else if(p==='hjerte'){const h=[];for(let i=0;i<24;i++){const q=i/24*TAU;h.push([.9*16*Math.pow(Math.sin(q),3)/17,.9*(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q))/17])}L(h,'#ff4f7b',0)}
    else{for(let j=0;j<5;j++)L(circ(Math.cos(j*1.256)*.55,Math.sin(j*1.256)*.55,.45,.45,10),'#ffffff',j*.01);L(circ(0,0,.4,.4,10),'#ffd23e',.1)}return G};
  return{byg:(G,k)=>B[k](G),skud,skilt,pynt}})();
