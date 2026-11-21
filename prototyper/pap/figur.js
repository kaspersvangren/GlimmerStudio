/* ============ figurer af papir med led: heksen (udkast A), hendes tøj og byens folk ============
   En figur er lag af udklippet papir samlet i led: ben, krop, arme, hoved, hår og hat hver for sig,
   så hun kan gå, vippe med hovedet, svinge armen og blinke. Tøjet skiftes ét sted ad gangen. */
const sm=(cp,seg=8)=>outline(cp,seg,0);
const C={skin:'#f7d8c4',skinSh:'#e6b29a',hair:'#eab84e',hairLt:'#f8dc8c',hairDk:'#c08628',purple:'#6a3fa2',purpleLt:'#8d62c8',purpleDk:'#4e2c80',navy:'#2b3468',navyLt:'#3f4b8c',gold:'#e2b85a',brown:'#7a4a2a',brownDk:'#4e2e18',leather:'#8a5632',leatherDk:'#5e3a20',cream:'#f4ead2',lilac:'#cfb6ee',teal:'#3f7f78',tealDk:'#2a5a56',pink:'#e88aa8',red:'#c4573e'};
/* hvert stykke får en mørk snitkant i sin egen farve, som en fin streg rundt om delen */
let FRES=1;
const fp=(parent,shape,o,z=0)=>put(parent,piece(shape,Object.assign({edge:o.mat?undefined:hexOf(shade(hexOf(o.color||o.ed||'#5a4070'),-.55))},o,o.s&&FRES!==1?{s:Math.max(8,o.s*FRES),fladt:true}:null)),0,0,z);/* små figurer på kortet: lavere opløsning og intet relief, så der er halvt så mange billeder at sende til grafikkortet */
const fps=(shapes,o,parent,z=0)=>shapes.map(s=>fp(parent,s,o,z));
function wipe(g){for(let i=g.children.length-1;i>=0;i--){const c=g.children[i];c.traverse(m=>{if(m.isMesh){m.geometry.dispose();for(const mt of[].concat(m.material))if(mt.userData&&mt.userData.own){mt.map&&mt.map.dispose();mt.bumpMap&&mt.bumpMap.dispose();mt.dispose()}}});g.remove(c)}}
/* ---- ansigtet: akvarelhud, kinder og fregner, øjne med iris og lys, øjenbryn, næse og smil ---- */
function faceShape(cx,cy,w,h){const o=[];for(let i=0;i<=24;i++){const a=Math.PI+i/24*Math.PI,x=Math.cos(a),y=Math.sin(a);o.push([cx+x*w/2*(1-.12*y*y),cy+h*.04+y*h*.54*(1-.08*x*x)])}for(let i=1;i<12;i++){const a=i/12*Math.PI;o.push([cx+Math.cos(a)*w/2,cy+h*.04+Math.sin(a)*h*.46])}return toCCW(o)}
function drawFace(P,{cx,cy,w,h,eyeW,eyeH,irisC=['#9be0a6','#2f7a44'],lash=1,freck=true,smile=.18,brow=C.hairDk,lips='#c4545e',skin=C.skin,skinSh=C.skinSh,blush=1,maerke=null}){const g=P.g,s=P.s,X=x=>P.X(x),Y=y=>P.Y(y);
  const F=faceShape(cx,cy,w,h);P.wash(skin,F,{edge:.28,clouds:5,grain:.1,top:hexOf(shade(hexOf(skin),.25))});
  P.wash(skinSh,sm([[-w/2,cy+h*.5],[w/2,cy+h*.5],[w/2,cy+h*.18],[0,cy+h*.3],[-w/2,cy+h*.18]],6),{alpha:.35,edge:.6,clouds:0});
  for(const sx of[-1,1]){const bx=X(cx+sx*w*.29),by=Y(cy-h*.14),r=w*.16*s,gr=g.createRadialGradient(bx,by,0,bx,by,r);gr.addColorStop(0,'rgba(240,120,120,.5)');gr.addColorStop(1,'rgba(240,120,120,0)');g.fillStyle=gr;g.fillRect(bx-r,by-r,2*r,2*r);
    if(freck)for(let k=0;k<11;k++){g.fillStyle='rgba(190,120,90,.5)';g.beginPath();g.arc(bx+R(-.6,.6)*r,by+R(-.32,.32)*r,R(.006,.011)*w*s,0,TAU);g.fill()}}
  /* et mærke på kinden: hjerte, stjerne, måne, glimmer, ar, plaster, maling eller en skønhedsplet */
  if(maerke&&maerke!=='fregner'&&maerke!=='ingen'){const mx=cx+w*.29,my=cy-h*.17,r=w*.045;
    if(maerke==='hjerte'){for(const sx of[-1,1])P.fill(circ(mx+sx*r*.55,my+r*.3,r*.62,r*.62,10),'#e0457a',.9);P.fill([[mx-r*1.1,my+.12*r],[mx+r*1.1,my+.12*r],[mx,my-r*1.15]],'#e0457a',.9)}
    if(maerke==='stjerne'){const st=[];for(let i=0;i<10;i++){const a=Math.PI/2+i/10*TAU,q=i%2?r*.55:r*1.3;st.push([mx+Math.cos(a)*q,my+Math.sin(a)*q])}P.fill(st,'#f2c230',.95)}
    if(maerke==='måne'){P.fill(circ(mx,my,r*1.15,r*1.15,14),'#f2c230',.95);P.fill(circ(mx+r*.5,my+r*.25,r*.95,r*.95,14),skin,1)}
    if(maerke==='glimmer')for(const sx of[-1,1])for(let k=0;k<9;k++){const gx=cx+sx*w*.29+R(-.5,.5)*w*.13,gy=cy-h*.14+R(-.3,.3)*w*.1,q=r*R(.18,.34);P.fill([[gx,gy+q*1.6],[gx+q*.5,gy],[gx,gy-q*1.6],[gx-q*.5,gy]],k%2?'#f2c230':'#ffffff',.95)}
    if(maerke==='ar')P.pen([[cx-w*.34,cy-h*.1],[cx-w*.25,cy-h*.2]],'#c88a7a',r*.34,.9),P.pen([[cx-w*.325,cy-h*.17],[cx-w*.275,cy-h*.14]],'#c88a7a',r*.24,.9);
    if(maerke==='plaster'){const px=cx-w*.3,py=cy-h*.2;P.fill(toCCW([[px-r*1.7,py-r*.25],[px+r*1.4,py+r*1],[px+r*1.7,py+r*.25],[px-r*1.4,py-r*1]]),'#f6d2a8',1);P.fill(circ(px,py,r*.42,r*.42,8),'#e0a878',1)}
    if(maerke==='maling')for(const sx of[-1,1])for(const dy of[0,r*1])P.fill(box(cx+sx*w*.29-r*1.4,cy-h*.17+dy-r*.26,cx+sx*w*.29+r*1.4,cy-h*.17+dy+r*.26),dy?'#43a3d3':'#e0457a',.85);
    if(maerke==='prik')P.fill(circ(cx+w*.21,cy-h*.27,r*.34,r*.34,8),'#5a3a2a',.9)}
  const ey=cy-h*.03,ex=w*.215;const LASH='#2e1c22';
  /* skygge fra pandehår og hår i siderne */
  P.wash('#d9a08a',sm([[-w*.6,cy+h*.55],[w*.6,cy+h*.55],[w*.6,cy+h*.2],[0,cy+h*.28],[-w*.6,cy+h*.2]],6),{alpha:.28,edge:.8,clouds:0});
  for(const sx of[-1,1])P.wash('#d9a08a',sm([[sx*w*.5,cy+h*.3],[sx*w*.62,cy+h*.3],[sx*w*.62,cy-h*.4],[sx*w*.42,cy-h*.3]],5),{alpha:.25,edge:.9,clouds:0});
  for(const sx of[-1,1]){const x0=cx+sx*ex,top=[],bot=[];for(let k=0;k<=16;k++){const t=k/16,u=sx>0?t:1-t,x=x0-eyeW/2+t*eyeW;top.push([x,ey+Math.pow(Math.sin(t*Math.PI),.8)*eyeH*.6+(1-u)*eyeH*.06]);bot.push([x,ey-Math.pow(Math.sin(t*Math.PI),1.1)*eyeH*.42+u*eyeH*.04])}
    const eye=[...top,...bot.slice().reverse()];P.fill(eye,'#fdf8f2',1);
    g.save();P.path(g,eye);g.clip();const ix=X(x0-sx*eyeW*.03),iy=Y(ey+eyeH*.04),ir=eyeH*.56*s;
    const gr=g.createRadialGradient(ix,iy+ir*.25,ir*.05,ix,iy,ir);gr.addColorStop(0,irisC[0]);gr.addColorStop(.7,irisC[1]);gr.addColorStop(1,'#163a24');g.fillStyle=gr;g.beginPath();g.arc(ix,iy,ir,0,TAU);g.fill();
    g.strokeStyle='rgba(255,255,220,.35)';g.lineWidth=Math.max(1,ir*.04);for(let k=0;k<14;k++){const a=k/14*TAU;g.beginPath();g.moveTo(ix+Math.cos(a)*ir*.5,iy+Math.sin(a)*ir*.5);g.lineTo(ix+Math.cos(a)*ir*.85,iy+Math.sin(a)*ir*.85);g.stroke()}
    g.strokeStyle='rgba(20,40,30,.85)';g.lineWidth=ir*.1;g.beginPath();g.arc(ix,iy,ir*.96,0,TAU);g.stroke();
    g.fillStyle='#120f18';g.beginPath();g.arc(ix,iy,ir*.42,0,TAU);g.fill();
    g.fillStyle='rgba(40,20,40,.35)';g.fillRect(X(x0-eyeW),Y(ey+eyeH),eyeW*2*s,eyeH*.34*s);
    g.fillStyle='#fff';g.beginPath();g.ellipse(ix-ir*.34,iy-ir*.34,ir*.3,ir*.24,-.5,0,TAU);g.fill();g.globalAlpha=.85;g.beginPath();g.arc(ix+ir*.32,iy+ir*.3,ir*.12,0,TAU);g.fill();g.globalAlpha=1;g.restore();
    /* lågkant, vipper og nedre vippelinje */
    const lid=top.map(([x,y])=>[x,y+eyeH*.02]),oc=sx>0?lid.length-1:0,o=lid[oc];const flick=[o[0]+sx*eyeH*.32,o[1]+eyeH*.2];
    const L=sx>0?[...lid.slice(2),flick]:[flick,...lid.slice(0,-2)];g.save();g.lineCap=g.lineJoin='round';g.strokeStyle=LASH;g.globalAlpha=.95;
    for(let k=0;k<L.length-1;k++){const t=sx>0?k/(L.length-1):1-k/(L.length-1);g.lineWidth=eyeH*s*(.05+.11*Math.sin(Math.min(1,t*1.15)*Math.PI*.5+.2));g.beginPath();g.moveTo(X(L[k][0]),Y(L[k][1]));g.lineTo(X(L[k+1][0]),Y(L[k+1][1]));g.stroke()}g.restore();
    for(let k=0;k<2+lash;k++){const b=lid[sx>0?lid.length-2-k*2:1+k*2];P.pen([[b[0],b[1]],[b[0]+sx*eyeH*(.16+k*.02),b[1]+eyeH*(.26-k*.03)]],LASH,eyeH*.045,.9)}
    P.pen(bot.slice(4,15).map(([x,y])=>[x,y-eyeH*.03]),'#a0685a',eyeH*.04,.5);
    P.pen(top.slice(3,14).map(([x,y])=>[x,y+eyeH*.28]),'#c98a7a',eyeH*.035,.35);
    const bw=eyeW*1.1;const B=curve([[x0-sx*bw*.42,ey+eyeH*.95],[x0+sx*bw*.05,ey+eyeH*1.16],[x0+sx*bw*.55,ey+eyeH*1.0]],8);
    g.save();g.lineCap='round';g.strokeStyle=brow;for(let k=0;k<B.length-1;k++){const t=k/(B.length-1);g.lineWidth=eyeH*s*(.11-.07*t);g.globalAlpha=.85;g.beginPath();g.moveTo(X(B[k][0]),Y(B[k][1]));g.lineTo(X(B[k+1][0]),Y(B[k+1][1]));g.stroke()}g.restore()}
  /* næse: en lille skygge og et lys */
  P.pen(curve([[cx+w*.012,cy-h*.17],[cx+w*.03,cy-h*.2],[cx+w*.008,cy-h*.215]],5),'#d29a84',w*.016,.8);P.fill(circ(cx-w*.012,cy-h*.18,w*.012,w*.01,8),'#fff4ea',.6);
  /* mund: et blidt smil med løftede mundvige og en antydning af underlæbe */
  const mw=w*smile,my=cy-h*.3;P.fill(sm([[cx-mw*.32,my-h*.012],[cx+mw*.32,my-h*.012],[cx+mw*.18,my-h*.05],[cx-mw*.18,my-h*.05]],5),lips,.45);
  P.pen(curve([[cx-mw/2,my+h*.012],[cx-mw*.25,my-h*.012],[cx,my-h*.02],[cx+mw*.25,my-h*.012],[cx+mw/2,my+h*.012]],6),'#7a2e38',w*.017,.95)}


/* ---- figuren ---- */
const HATTE={kort:'#2f7f86','høj':'#3a2a58',blomst:'#e8c878',krone:'#d9a83a',baret:'#b83a3a','sløjfe':'#e0457a',hue:'#3e7a4a'};
const KAPPER={lang:{},stjerne:{motiv:'stjerner',std:'#1c2250',kant:'#cfb6ee'},'måne':{motiv:'måner',std:'#2a2a5a'},takket:{takket:1,std:'#5a2f6a'},blomster:{motiv:'blomster',std:'#3e6a4a'},stribet:{motiv:'striber',std:'#7a2f3a'},pelskant:{pels:1,std:'#8a2f3a'},'hætte':{haette:1,std:'#2f5a4a'}};
/* kjolerne deler snit; hver har sit mønster og sin egen farve fra start */
const KJOLER={stjernekjole:{motiv:'stjerner'},'månekjole':{motiv:'måner',std:'#2e4a7a',krave:'#5a3fa8'},blomsterkjole:{motiv:'blomster',std:'#3e7a4a',krave:'#7a2f6a',sloejfe:1},stribekjole:{motiv:'striber',std:'#b83a3a',krave:'#2a2a3a'},prikkjole:{motiv:'prikker',std:'#e0457a',krave:'#7a2f6a',sloejfe:1},hjertekjole:{motiv:'hjerter',std:'#b83a6a',krave:'#5a1f3a'},knapkjole:{motiv:'knapper',std:'#4a3a9a'},lagkjole:{motiv:'ingen',lag:1,std:'#1f6f6a',krave:'#143f3c'},'forklædekjole':{motiv:'ingen',forkl:1,std:'#43a3d3',krave:'#2e4a7a'},kortkjole:{motiv:'stjerner',kort:1,std:'#e07a45',krave:'#7a2f3a'}};
const LOOK0={mærke:'fregner',pande:'lige',støvler:'snør',hat:'heksehat',hår:'langt',tøj:'stjernekjole',kappe:'lang',tilbehør:'ingen',stav:true,skin:C.skin,skinSh:C.skinSh,hair:[C.hair,C.hairLt,C.hairDk],iris:['#9be0a6','#2f7a44'],freck:true,hh:7.1,eye:.27,lash:1,smile:.17,skæg:null,col:{}};
function makeFigure(look={}){
  const L=Object.assign({},LOOK0,look),F={L,G:new THREE.Group()},G=F.G;
  const T=26,hh=L.hh,w=hh*.82,cy=T-hh/2,S=T-hh-1,sw=3,Wy=S-4.3,ww=2.05,HIP=Wy-1.7,PY=S+.4;F.D={T,hh,w,cy,S,sw,Wy,ww,HIP};
  const g=(parent,x=0,y=0,z=0)=>{const q=new THREE.Group();q.position.set(x,y,z);parent.add(q);return q},piv=(parent,x,y)=>{const o=g(parent,x,y);return{o,i:g(o,-x,-y)}};
  let[H0,H1,H2]=L.hair;
  F.gCape=g(G);const hb=piv(G,0,PY);F.hairB=hb.o;const LG=[piv(G,-1.15,HIP),piv(G,1.15,HIP)];F.legs=LG.map(l=>l.o);F.gTorso=g(G);const sk=piv(G,0,Wy);F.skirt=sk.o;F.gNeck=g(G);
  const aL=piv(G,-sw+.25,S-.4),aR=piv(G,sw-.25,S-.4);F.armL=aL.o;F.armR=aR.o;F.gStaff=g(G);const hd=piv(G,0,PY);F.head=hd.o;const hIn=hd.i;F.gFace=g(hIn);F.gHairF=g(hIn);const ht=piv(hIn,0,cy+hh*.36);F.hat=ht.o;F.gAcc=g(G);
  const hairPaint=(shape,n=10,z0=0)=>P=>{P.wash(H0,shape,{top:H1,edge:.5,clouds:6});let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[x,y]of shape){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}for(let k=0;k<n;k++){const x=R(x0,x1);P.score(curve([[x,y1],[x+R(-.5,.5),(y0+y1)/2],[x+R(-.8,.8),y0]],6),{w:.055,ink:.35,dark:k%3?H2:'#fff6d0'})}};

  /* hoved: hals, ansigt og øjenlåg til blink */
  function buildHead(){const nk=sm([[-w*.15,S-.3,1],[w*.15,S-.3,1],[w*.13,cy-hh*.38,1],[-w*.13,cy-hh*.38,1]],2);fp(F.gNeck,nk,{t:.16,s:50,ed:L.skinSh,paint:P=>{P.wash(L.skin,nk,{edge:.3});P.wash(L.skinSh,box(-2,cy-hh*.5,2,cy-hh*.36),{alpha:.5,edge:0})}},.25);
    const FS=faceShape(0,cy,w,hh),eyeW=w*L.eye,eyeH=eyeW*.78,ey=cy-hh*.03,ex=w*.215;
    fp(F.gFace,FS,{t:.2,s:80,cap:1024,ed:L.skinSh,paint:P=>drawFace(P,{cx:0,cy,w,h:hh,eyeW,eyeH,lash:L.lash,freck:L.freck&&(!L.mærke||L.mærke==='fregner'),maerke:L.mærke,smile:L.smile,irisC:L.iris,brow:H2,skin:L.skin,skinSh:L.skinSh})},.4);
    F.lids=g(F.gFace);for(const sx of[-1,1]){fp(F.lids,circ(sx*ex,ey+eyeH*.1,eyeW*.58,eyeH*.66,20),{color:hexOf(shade(L.skin,-.1)),kind:'water',t:.04,edge:hexOf(shade(L.skin,-.1))},.52);fps(thick([curve([[sx*ex-eyeW*.5,ey+eyeH*.02],[sx*ex,ey-eyeH*.2],[sx*ex+eyeW*.5,ey+eyeH*.02]],8)],eyeH*.07),{color:'#2e1c22',t:.03},F.lids,.56)}F.lids.visible=false;
    if(L.skæg){const b=sm([[-w*.42,cy-hh*.12],[-w*.5,cy-hh*.4],[-w*.3,cy-hh*.75],[0,cy-hh*.95],[w*.3,cy-hh*.75],[w*.5,cy-hh*.4],[w*.42,cy-hh*.12],[w*.2,cy-hh*.2],[0,cy-hh*.16],[-w*.2,cy-hh*.2]],8);fp(F.gFace,b,{t:.14,s:40,ed:'#b8b0a8',paint:P=>{P.wash(L.skæg,b,{top:'#ffffff',edge:.5});for(let k=0;k<12;k++){const x=R(-w*.4,w*.4);P.score(curve([[x*.7,cy-hh*.2],[x,cy-hh*.8]],4),{w:.05,ink:.3,dark:'#a8a098'})}}},.6);fp(F.gFace,sm([[-w*.3,cy-hh*.2],[0,cy-hh*.15],[w*.3,cy-hh*.2],[w*.12,cy-hh*.28],[0,cy-hh*.24],[-w*.12,cy-hh*.28]],5),{color:'#ffffff',kind:'water',t:.08},.66)}}

  /* hår: bagved hovedet og foran */
  function buildHair(){wipe(hb.i);wipe(F.gHairF);const k=L.hår,dress=(KJOLER[L.tøj]&&!KJOLER[L.tøj].kort)||L.tøj==='festkjole'||L.tøj==='skovløber',cut=dress?0:1.7;
    /* pandehåret: ti slags. Kanten forneden tegnes fra højre mod venstre; resten følger hovedets top */
    const bangs=()=>{const p=L.pande||'lige',zz=(n,amp,base)=>{const o=[];for(let i=0;i<=n;i++)o.push([w*.5-w*i/n,cy+hh*(base+(i%2?amp:0))]);return o};let low,yl=cy+hh*.1,yr=cy+hh*.1,spejl=false;
      if(p==='mini')low=zz(10,.05,.3);else if(p==='lang')low=zz(6,.04,.02);else if(p==='pjusket')low=[...Array(9)].map((_,i)=>[w*.5-w*i/8,cy+hh*(.05+((i*7)%5)*.055)]);
      else if(p==='bølget')low=[...Array(13)].map((_,i)=>[w*.5-w*i/12,cy+hh*(.17+.07*Math.sin(i*1.6))]);
      else if(p==='midt')low=[[w*.5,cy+hh*.16],[w*.24,cy+hh*.3],[0,cy+hh*.5],[-w*.24,cy+hh*.3],[-w*.5,cy+hh*.16]];
      else if(p==='gardin'){yl=yr=cy-hh*.12;low=[[w*.47,cy-hh*.04],[w*.3,cy+hh*.24],[0,cy+hh*.47],[-w*.3,cy+hh*.24],[-w*.47,cy-hh*.04]]}
      else if(p==='tilbage')low=[[w*.5,cy+hh*.3],[w*.25,cy+hh*.42],[0,cy+hh*.45],[-w*.25,cy+hh*.42],[-w*.5,cy+hh*.3]];
      else if(p==='side'||p==='venstre'){yl=cy+hh*.05;yr=cy+hh*.12;low=[[w*.2,cy+hh*.3],[-w*.25,cy+hh*.18]];spejl=p==='venstre'}
      else low=[[w*.44,cy+hh*.22],[w*.3,cy+hh*.12],[w*.14,cy+hh*.26],[0,cy+hh*.2],[-w*.18,cy+hh*.28],[-w*.33,cy+hh*.13],[-w*.46,cy+hh*.24]];
      let b=sm([[-w*.56,yl],[-w*.52,cy+hh*.42],[0,cy+hh*.6],[w*.52,cy+hh*.42],[w*.56,yr],...low],6);if(spejl)b=toCCW(b.map(([x,y])=>[-x,y]));fp(F.gHairF,b,{t:.14,s:40,ed:H2,paint:hairPaint(b,9)},.68)};
    const kasket=()=>sm([[-w*.6,cy+hh*.1],[-w*.66,cy-hh*.34],[-w*.52,cy-hh*.5],[w*.52,cy-hh*.5],[w*.66,cy-hh*.34],[w*.6,cy+hh*.1],[w*.5,cy+hh*.46],[0,cy+hh*.62],[-w*.5,cy+hh*.46]],8),
      hale=(pts,z=-.02)=>{const q=toCCW(sm(pts,6));fp(hb.i,q,{t:.2,s:30,ed:H2,paint:hairPaint(q,8)},z)},baand=(x,y,c=C.teal)=>fp(F.gHairF,circ(x,y,.62,.5,14),{color:c,kind:'water',t:.14},.7),
      flet=(x,y0,n=9)=>{for(let i=0;i<n;i++){const y=y0-i*.85,sz=.95-i*.03;fp(F.gHairF,leafPts(x+(i%2?.22:-.22)*sz,y,1.35*sz,.95*sz,(i%2?-1:1)*.75),{color:i%2?H0:H1,kind:'water',t:.06,edge:H2},.64+i*.004)}fp(F.gHairF,sm([[x-.55,y0-n*.85+.5],[x+.55,y0-n*.85+.5],[x+.3,y0-n*.85-.9],[x-.3,y0-n*.85-.9]],4),{color:H0,kind:'water',t:.08,edge:H2},.66);fp(F.gHairF,sm([[x-.55,y0-n*.85+.9],[x+.55,y0-n*.85+.9],[x+.9,y0-n*.85+.2],[x-.9,y0-n*.85+.2]],4),{color:C.teal,kind:'water',t:.1},.7)};
    const lock=(pts,z=.66)=>{const Lk=sm(pts,6);fp(F.gHairF,Lk,{t:.12,s:40,ed:H2,paint:hairPaint(Lk,4)},z)};
    let back;
    if(k==='langt'){back=sm([[-w*.62,cy+hh*.1],[-w*.72,cy-hh*.4],[-w*.8,S-2],[-w*.74,S-6.6+cut],[-w*.35,S-7.4+cut],[0,S-6.8+cut],[w*.35,S-7.4+cut],[w*.74,S-6.6+cut],[w*.8,S-2],[w*.72,cy-hh*.4],[w*.62,cy+hh*.1],[w*.5,cy+hh*.46],[0,cy+hh*.62],[-w*.5,cy+hh*.46]],8);bangs();for(const sx of[-1,1])lock([[sx*w*.54,cy+hh*.22],[sx*w*.62,cy-hh*.2],[sx*w*.6,S-.6],[sx*w*.66,S-2.6],[sx*w*.52,S-4.2],[sx*w*.44,S-2.8],[sx*w*.48,S-.8],[sx*w*.42,cy-hh*.3],[sx*w*.44,cy+hh*.12]])}
    else if(k==='fletning'){back=sm([[-w*.6,cy+hh*.1],[-w*.68,cy-hh*.4],[-w*.62,S-.8],[0,S-1.2],[w*.62,S-.8],[w*.68,cy-hh*.4],[w*.6,cy+hh*.1],[w*.5,cy+hh*.46],[0,cy+hh*.62],[-w*.5,cy+hh*.46]],8);bangs();
      for(let i=0;i<10;i++){const y=S+.4-i*.85,x=-w*.55+Math.sin(i*.45)*.2,sz=.95-i*.03;fp(F.gHairF,leafPts(x+(i%2?.22:-.22)*sz,y,1.35*sz,.95*sz,(i%2?-1:1)*.75),{color:i%2?H0:H1,kind:'water',t:.06,edge:H2},.64+i*.004)}
      fp(F.gHairF,sm([[-w*.55-.6,S-8.1],[-w*.55+.6,S-8.1],[-w*.55+.3,S-9.4],[-w*.55-.3,S-9.4]],4),{color:H0,kind:'water',t:.08,edge:H2},.66);fp(F.gHairF,sm([[-w*.55-.55,S-7.7],[-w*.55+.55,S-7.7],[-w*.55+.9,S-8.4],[-w*.55-.9,S-8.4]],4),{color:C.teal,kind:'water',t:.1},.7)}
    else if(k==='bølger'){const o=[[-w*.62,cy+hh*.1],[-w*.72,cy-hh*.4]];const n=dress?6:4;for(let i=0;i<n;i++)o.push([-w*.8-(i%2?.5:0),S-1-i*1.5]);o.push([-w*.3,S-.6-n*1.5],[0,S-n*1.5],[w*.3,S-.6-n*1.5]);for(let i=n-1;i>=0;i--)o.push([w*.8+(i%2?.5:0),S-1-i*1.5]);o.push([w*.72,cy-hh*.4],[w*.62,cy+hh*.1],[w*.5,cy+hh*.46],[0,cy+hh*.62],[-w*.5,cy+hh*.46]);back=sm(o,8);bangs();
      const wl=[];for(let i=0;i<7;i++)wl.push([w*.66+(i%2?.4:0),cy+hh*.2-i*1.2]);wl.push([w*.5,cy+hh*.2-7.6]);for(let i=6;i>=0;i--)wl.push([w*.46+(i%2?.3:-.02)+(i===0?.06:0),cy+hh*.2-i*1.2]);lock(wl);
      fp(hb.i,sm([[w*.45,cy+hh*.42],[w*.9,cy+hh*.75],[w*1.05,cy+hh*.35],[w*.6,cy+hh*.3]],4),{color:C.lilac,kind:'water',t:.08},.25)}
    else if(k==='knolde'){back=sm([[-w*.6,cy+hh*.1],[-w*.64,cy-hh*.3],[-w*.5,cy-hh*.44],[w*.5,cy-hh*.44],[w*.64,cy-hh*.3],[w*.6,cy+hh*.1],[w*.5,cy+hh*.46],[0,cy+hh*.62],[-w*.5,cy+hh*.46]],8);bangs();for(const sx of[-1,1])fp(hb.i,circ(sx*w*.62,cy+hh*.52,hh*.2,hh*.2,24),{color:H0,kind:'water',t:.2,edge:H2},.1)}
    else if(k==='skulder'){back=sm([[-w*.62,cy+hh*.1],[-w*.72,cy-hh*.4],[-w*.84,S+.6],[-w*.6,S-1.9],[-w*.25,S-1.4],[0,S-1.7],[w*.25,S-1.4],[w*.6,S-1.9],[w*.84,S+.6],[w*.72,cy-hh*.4],[w*.62,cy+hh*.1],[w*.5,cy+hh*.46],[0,cy+hh*.62],[-w*.5,cy+hh*.46]],8);bangs();for(const sx of[-1,1])lock([[sx*w*.54,cy+hh*.22],[sx*w*.62,cy-hh*.2],[sx*w*.66,S+.9],[sx*w*.5,S-.4],[sx*w*.44,cy-hh*.3]])}
    else if(k==='hestehale'){back=kasket();bangs();hale([[w*.42,cy+hh*.5],[w*.95,cy+hh*.46],[w*1.14,cy-hh*.1],[w*1.06,S-2.6],[w*.86,S-5.6],[w*.7,S-3],[w*.8,cy-hh*.3],[w*.62,cy+hh*.16]]);baand(w*.6,cy+hh*.44)}
    else if(k==='rottehaler'){back=kasket();bangs();for(const sx of[-1,1]){hale([[sx*w*.5,cy+hh*.12],[sx*w*.98,cy+hh*.1],[sx*w*1.12,cy-hh*.5],[sx*w*.98,S-2.4],[sx*w*.8,S-4.2],[sx*w*.7,cy-hh*.6],[sx*w*.6,cy-hh*.1]]);baand(sx*w*.66,cy-hh*.02,C.pink)}}
    else if(k==='fletninger'){back=kasket();bangs();for(const sx of[-1,1])flet(sx*w*.58,S+.6,8)}
    else if(k==='topknold'){back=kasket();bangs();fp(hb.i,circ(0,cy+hh*.74,hh*.26,hh*.24,28),{t:.2,s:40,ed:H2,paint:hairPaint(circ(0,cy+hh*.74,hh*.26,hh*.24,28),6)},-.02);baand(0,cy+hh*.56,C.pink)}
    else if(k==='krøller'){const o=[],n=40;for(let i=0;i<n;i++){const a=i/n*TAU,bump=1+.07*Math.sin(a*11),ex=w*.98*bump,ymid=(cy+hh*.3+S-2.2)/2,ey=(cy+hh*.75-(S-2.2))/2*bump;o.push([Math.cos(a)*ex,ymid+Math.sin(a)*ey])}back=toCCW(o);bangs();
      for(const sx of[-1,1])for(let i=0;i<5;i++)fp(F.gHairF,circ(sx*w*(.6+(i%2?.06:0)),cy+hh*.1-i*1.25,.72,.72,14),{color:i%2?H0:H1,kind:'water',t:.08,edge:H2},.64+i*.004)}
    else{back=kasket();bangs()}
    fp(hb.i,back,{t:.25,s:26,ed:H2,paint:hairPaint(back,24)},0)}

  /* hat */
  function buildHat(){wipe(ht.i);const k=L.hat;if(k==='ingen')return;const hy=cy+hh*.36,bw=w*1.28,P_=(sh,o,z)=>fp(ht.i,sh,o,z);
    const brimS=(c0,c1,z=.95)=>{const b=sm([[-bw,hy+.2],[-bw*.6,hy-.25],[0,hy-.38],[bw*.6,hy-.25],[bw,hy+.2],[bw*.62,hy+.85],[0,hy+.98],[-bw*.62,hy+.85]],8);P_(b,{t:.22,s:30,ed:c0,paint:P=>{P.wash(c0,b,{top:c1,edge:.5});P.pen(curve([[-bw*.9,hy+.3],[0,hy-.18],[bw*.9,hy+.3]],8),hexOf(shade(hexOf(c1),.2)),.1,.5)}},z)};
    if(k==='heksehat'||k==='nathat'){const nat=k==='nathat',hc=L.col.hat,c0=hc||(nat?C.navy:C.purple),c1=hc?hexOf(shade(hc,.22)):(nat?C.navyLt:C.purpleLt),c2=hc?hexOf(shade(hc,-.3)):(nat?'#1a2148':C.purpleDk);
      const crown=sm([[-w*.48,hy+.3],[w*.48,hy+.3],[w*.36,hy+3.4],[w*.26,hy+6.2],[w*.5,hy+7.9],[w*.86,hy+8.1],[w*.98,hy+7.6],[w*.86,hy+8.7],[w*.46,hy+8.9],[.1,hy+7.2],[-w*.28,hy+3.4]],6);
      P_(crown,{t:.25,s:30,ed:c0,paint:P=>{P.wash(c0,crown,{top:c1,edge:.55,clouds:8});for(const c of[[[-w*.3,hy+2.4],[0,hy+2.7],[w*.28,hy+2.3]],[[-w*.15,hy+5],[w*.1,hy+5.4]]])P.score(curve(c,6),{w:.07,ink:.3,dark:c2});if(nat)for(let i=0;i<9;i++)P.fill(starPts(R(-w*.3,w*.3),hy+R(1.6,6.4),R(.22,.4),.12,R(1)),C.gold,.9)}},.5);
      P_(sm([[-w*.5,hy+.3],[w*.5,hy+.3],[w*.47,hy+1.3],[-w*.47,hy+1.3]],2),nat?{mat:gold(),t:.08}:{color:C.navy,kind:'water',t:.08},.62);
      if(nat){cord(ht.i,[[w*.97,hy+7.7,.6],[w*1.02,hy+6.2,.6]],.03,'#e9e4d8');const mp=[];for(let i=0;i<=10;i++){const a=-1.9+i/10*3.8;mp.push([w*1.02+Math.cos(a)*.55,hy+5.6+Math.sin(a)*.55])}for(let i=10;i>=0;i--){const a=-1.6+i/10*3.2;mp.push([w*1.02+.25+Math.cos(a)*.43,hy+5.6+Math.sin(a)*.43])}P_(toCCW(mp),{mat:gold(),t:.08},.6)}
      else{P_(starPts(w*.05,hy+.82,.55,.24),{mat:gold(),t:.08},.7);const pt=box(-w*.32,hy+3.2,-w*.08,hy+4.4);P_(pt,{t:.06,s:80,ed:C.pink,paint:P=>{P.flat(C.pink);P.score([...box(-w*.3,hy+3.28,-w*.1,hy+4.32),[-w*.3,hy+3.28]],{w:.04,ink:.6,dark:'#fff'})}},.62)}
      brimS(c2,c0)}
    if(HATTE[k]!==undefined){/* de øvrige hatte: kort og høj spids hat, blomsterhat, krone, baret, sløjfe og hue */
      const c0=L.col.hat||HATTE[k],c1=hexOf(shade(c0,.22)),c2=hexOf(shade(c0,-.3)),baand=g=>P_(sm([[-w*.5,hy+.3],[w*.5,hy+.3],[w*.47,hy+1.3],[-w*.47,hy+1.3]],2),g,.62);
      if(k==='kort'||k==='høj'){const H=k==='høj'?11.6:5,crown=sm([[-w*.48,hy+.3],[w*.48,hy+.3],[w*.3,hy+H*.5],[w*.12,hy+H*.86],[w*.02,hy+H,1],[-w*.14,hy+H*.82],[-w*.32,hy+H*.48]],6);
        P_(crown,{t:.25,s:30,ed:c0,paint:P=>{P.wash(c0,crown,{top:c1,edge:.55,clouds:8});if(k==='høj'){for(let y=hy+2.6;y<hy+H-1.4;y+=2.3)P.score(curve([[-w*.4,y],[0,y+.25],[w*.4,y]],6),{w:.1,ink:.35,dark:c2});for(let i=0;i<7;i++)P.fill(starPts(R(-w*.24,w*.24),hy+R(1.8,H-3),R(.2,.34),.12,R(1)),C.gold,.9)}else P.score(curve([[-w*.3,hy+2.4],[0,hy+2.7],[w*.28,hy+2.3]],6),{w:.07,ink:.3,dark:c2})}},.5);
        baand({mat:gold(),t:.08});if(k==='høj')fps(ring(box(-.5,hy+.36,.5,hy+1.24),.14,false),{color:c2,t:.1},ht.i,.7);brimS(c2,c0)}
      if(k==='blomst'){const crown=sm([[-w*.5,hy+.3],[w*.5,hy+.3],[w*.5,hy+2.3],[w*.3,hy+3.5],[-w*.3,hy+3.5],[-w*.5,hy+2.3]],6);
        P_(crown,{t:.25,s:30,ed:c0,paint:P=>{P.wash(c0,crown,{top:c1,edge:.55,clouds:4});for(let y=hy+.9;y<hy+3.4;y+=.5)P.pen(curve([[-w*.5,y],[0,y+.14],[w*.5,y]],6),c2,.05,.5)}},.5);baand({color:'#e0457a',kind:'water',t:.08});
        const fx=w*.34,fy=hy+1.5;for(const q of[0,1,2,3,4,5])P_(circ(fx+Math.cos(q/6*TAU)*.62,fy+Math.sin(q/6*TAU)*.62,.44,.44,12),{color:q%2?'#ffd6ea':'#ff9ad0',kind:'water',t:.1},.72+q*.004);P_(circ(fx,fy,.36,.36,12),{mat:gold(),t:.12},.78);P_(toCCW([[fx-.5,fy-.5],[fx-1.5,fy-.9],[fx-.9,fy-.1]]),{color:'#4f9a5a',kind:'water',t:.08},.7);brimS(c2,c0)}
      if(k==='krone'){const pts=[[-w*.5,hy+.5],[w*.5,hy+.5]];for(let i=0;i<=8;i++)pts.push([w*.56-w*1.12*i/8,hy+(i%2?2.4:4.4)]);P_(toCCW(pts),{mat:gold(),t:.3},.62);P_(box(-w*.5,hy+.5,w*.5,hy+1.2),{color:'#a87a20',kind:'water',t:.34},.64);
        [[0,'#e0457a'],[-w*.28,'#43a3d3'],[w*.28,'#5fd0b0']].forEach(([x,c])=>P_(circ(x,hy+1.9,.34,.4,12),{t:.1,mat:paperMat('#ffffff','tissue',{glow:c,gi:1.2})},.7));for(let i=0;i<=8;i+=2)P_(circ(w*.56-w*1.12*i/8,hy+4.5,.26,.26,10),{mat:gold(),t:.3},.66)}
      if(k==='baret'){const b=sm([[-w*.62,hy+1.1],[-w*.3,hy+.3],[w*.42,hy+.4],[w*.78,hy+1.5],[w*.6,hy+3],[0,hy+3.6],[-w*.5,hy+2.9]],8);P_(b,{t:.3,s:30,ed:c0,paint:P=>{P.wash(c0,b,{top:c1,edge:.6,clouds:6});P.pen(curve([[-w*.5,hy+1.2],[0,hy+.7],[w*.6,hy+1.3]],8),c2,.12,.6)}},.6);P_(box(-.12,hy+3.5,.12,hy+4.2),{color:c2,t:.2},.6)}
      if(k==='sløjfe'){for(const sx of[-1,1]){const lp=toCCW(sm([[0,hy+2.2,1],[sx*w*.62,hy+3.9],[sx*w*.72,hy+2.4],[sx*w*.62,hy+.9]],5));P_(lp,{t:.2,s:30,ed:c0,paint:P=>{P.wash(c0,lp,{top:c1,edge:.5});P.pen([[sx*.2,hy+2.2],[sx*w*.5,hy+2.7]],c2,.08,.6)}},.6)}P_(circ(0,hy+2.2,.58,.64,14),{color:c2,kind:'water',t:.26},.66)}
      if(k==='hue'){const b=sm([[-w*.55,hy+.2],[w*.55,hy+.2],[w*.5,hy+2.7],[w*.24,hy+4.3],[0,hy+4.6],[-w*.24,hy+4.3],[-w*.5,hy+2.7]],8);P_(b,{t:.3,s:30,ed:c0,paint:P=>{P.wash(c0,b,{top:c1,edge:.55,clouds:6});for(let x=-w*.45;x<w*.5;x+=.5)P.pen([[x,hy+1.4],[x*.6,hy+4.3]],c2,.06,.45)}},.6);
        P_(sm([[-w*.58,hy-.1],[w*.58,hy-.1],[w*.57,hy+1.4],[-w*.57,hy+1.4]],3),{color:c1,kind:'water',t:.34},.66);P_(circ(0,hy+5.2,1,1,16),{color:'#f6f0e2',kind:'water',t:.4},.6)}}
    if(k==='eventyrhat'){const c0='#7a4e2c',c1='#9a6a3e',crown=sm([[-w*.5,hy+.3],[w*.5,hy+.3],[w*.44,hy+2.6],[w*.2,hy+4.6],[-w*.1,hy+5.6],[-w*.62,hy+5.9],[-w*.86,hy+5.2],[-w*.5,hy+4.9],[-w*.44,hy+2.8]],6);
      P_(crown,{t:.25,s:30,ed:c0,paint:P=>{P.wash(c0,crown,{top:c1,edge:.55,clouds:8});for(const c of[[[-w*.3,hy+2.2],[0,hy+2.5],[w*.3,hy+2.1]],[[-w*.3,hy+4],[0,hy+4.3]]])P.score(curve(c,6),{w:.07,ink:.35,dark:'#3a2010'});const st=curve([[-w*.4,hy+1.7],[0,hy+1.9],[w*.4,hy+1.7]],10);for(let i=0;i<st.length-1;i+=2)P.score([st[i],st[i+1]],{w:.05,ink:.6,dark:'#f0d6a4'})}},.5);
      P_(sm([[-w*.51,hy+.3],[w*.51,hy+.3],[w*.48,hy+1.25],[-w*.48,hy+1.25]],2),{color:'#3a2414',kind:'water',t:.08},.62);fps(ring(box(-w*.3,hy+.42,-w*.08,hy+1.14),.12,false),{mat:gold(),t:.08},ht.i,.7);
      /* flyverbriller på hattebåndet */
      for(const sx of[-1,1]){const cxg=w*.22+sx*.62;fp(ht.i,circ(cxg,hy+1.5,.58,.58,24),{mat:gold(),t:.14},.72);fp(ht.i,circ(cxg,hy+1.5,.4,.4,20),{t:.04,mat:paperMat('#dff4ff','tissue',{glow:'#7fd6ff',gi:.5})},.8)}fp(ht.i,box(w*.22-.12,hy+1.42,w*.22+.12,hy+1.58),{mat:gold(),t:.1},.72);
      const fpz=leafPts(-w*.62,hy+3.4,5,1.15,.55);P_(fpz,{t:.05,s:60,ed:C.tealDk,paint:P=>{P.wash(C.teal,fpz,{edge:.5,top:'#6fc4b8'});for(let i=0;i<12;i++){const t=i/12-.5;P.pen([[-w*.62-Math.sin(.55)*t*5,hy+3.4+Math.cos(.55)*t*5],[-w*.62-Math.sin(.55)*t*5-.5,hy+3.4+Math.cos(.55)*t*5-.3]],'#1f5f5a',.04,.6)}}},.44);
      brimS('#5e3a20',c0)}}

  /* ---- tøj: ben og støvler, krop, skørt/skøder og ærmer ---- */
  const HEM=.9,HW=5.6,hx=sw+2.2;
  /* støvlerne: ti slags. 'snør' er tøjets egne snørestøvler; de andre har samme form over hele garderoben */
  const STV={spidse:{toe:'spids',lace:false},'høje':{h:5.8,cuff:1},ballerina:{h:1.15,lace:false,bow:1},gummi:{h:4.3,lace:false,gloss:1,col:'#e0a020'},pels:{h:3.8,lace:false,fur:1,col:'#8a6240'},sandaler:{h:1.5,lace:false,sandal:1},krul:{toe:'krul',lace:false,col:'#7a2f6a'},'spænde':{lace:false,buckle:1,col:'#2e2833'},knap:{lace:false,buttons:1,col:'#7a2f3a'}};
  let bootH=2.6;
  const boots=(bh,col,{cuff=null,lace=true,z=0}={})=>{const st=STV[L.støvler]||{};bh=st.h||bh;col=L.col.støvler||st.col||col;if(st.lace===false)lace=false;if(st.cuff)cuff=cuff||hexOf(shade(hexOf(col),.25));else if(STV[L.støvler])cuff=null;bootH=bh;
    LG.forEach((lg,i)=>{const sx=i?1:-1,x=sx*1.15,bt=sm([[x-.95,.12],[x-.7,-.04],[x+.7,-.04],[x+.95,.12],[x+.92,.9],[x+.84,bh,1],[x-.84,bh,1],[x-.92,.9]],6),cd=hexOf(shade(hexOf(col),-.4));
    if(st.toe==='spids')fp(lg.i,toCCW([[x+sx*.5,-.04],[x+sx*2.1,.05],[x+sx*.7,.95]]),{color:col,kind:'water',t:.3,edge:cd},z-.01);
    if(st.toe==='krul'){for(const q of thick([curve([[x+sx*.6,.3],[x+sx*1.7,.2],[x+sx*2.2,1],[x+sx*1.6,1.5]],8)],.34))fp(lg.i,q,{color:col,kind:'water',t:.3,edge:cd},z-.01);fp(lg.i,circ(x+sx*1.5,1.55,.3,.3,10),{mat:gold(),t:.34},z+.02)}
    fp(lg.i,toCCW(bt),{t:.3,s:40,ed:col,paint:P=>{if(st.sandal){P.wash(L.skin,toCCW(bt),{edge:.4});for(const y of[.35,.95])P.fill(box(x-1.2,y,x+1.2,y+.24),col,1);P.fill(box(x-.14,.35,x+.14,bh),col,1)}else{P.wash(col,toCCW(bt),{edge:.5,top:hexOf(shade(hexOf(col),.18))});
        if(lace)for(let y=1.1;y<bh-.2;y+=.55){P.pen([[x-.45,y],[x+.45,y+.4]],C.cream,.07,.9);P.pen([[x+.45,y],[x-.45,y+.4]],C.cream,.07,.9)}
        if(st.gloss)P.pen([[x-sx*.5,.7],[x-sx*.5,bh-.5]],'#fff6d0',.16,.5);if(st.buckle){P.fill(box(x-.5,bh*.42,x+.5,bh*.42+.62),'#d9a83a',1);P.fill(box(x-.26,bh*.42+.16,x+.26,bh*.42+.46),col,1)}
        if(st.buttons)for(let y=.8;y<bh-.2;y+=.6)P.fill(circ(x+sx*.5,y,.14,.14,8),'#d9a83a',1);if(st.bow)P.fill(circ(x,.75,.2,.2,8),'#ff9ad0',1)}}},z);
    fp(lg.i,sm([[x-1.02,-.08],[x+1.02,-.08],[x+1.05,.3],[x-1.05,.3]],3),{color:st.sandal?col:C.brownDk,t:.34},z+.02);
    if(st.fur){const f=[];for(let k=0;k<=6;k++)f.push([x-1.15+k*.383,bh+.35+(k%2?.28:0)]);f.push([x+1.15,bh-.55],[x-1.15,bh-.55]);fp(lg.i,toCCW(sm(f,3)),{color:'#f6f0e2',kind:'water',t:.4},z+.05)}
    else if(cuff)fp(lg.i,box(x-1.05,bh-.75,x+1.05,bh+.25),{color:cuff,kind:'water',t:.36},z+.04)})};
  const legs=(col,y0,{stripes=null,wd=.68}={})=>{y0=Math.min(y0,bootH-.3);if(STV[L.støvler]&&STV[L.støvler].sandal&&col===C.cream&&!stripes)col=L.skin;/* bare ben i sandaler, men kun hvor der ellers var strømper */LG.forEach((lg,i)=>{const x=(i?1:-1)*1.15,sh=box(x-wd,y0,x+wd,HIP+.5);if(stripes)fp(lg.i,sh,{t:.15,s:40,ed:stripes,paint:P=>{P.flat(col);for(let y=y0;y<HIP+.5;y+=.7)P.flat(stripes,box(-9,y,9,y+.35),.85)}},-.1);else fp(lg.i,sh,{color:col,kind:'water',t:.18},-.1)})};
  const hand=(grp,pts,z)=>{const hs=sm(pts,6);fp(grp,hs,{t:.12,s:60,ed:L.skinSh,paint:P=>P.wash(L.skin,hs,{edge:.35})},z)};
  /* ærmer: venstre hænger, højre holder staven (eller hænger, hvis der ingen stav er) */
  function arms(col,{sl=.7,cuff='gold',bracer=false}={}){const sleeve=(grp,pts,z)=>fp(grp,sm(pts,6),{color:col,kind:'water',t:.18},z);
    const hang=(grp,m,z)=>{const X=x=>m*x;const sp=[[X(-sw+.3),S+.1],[X(-sw-.7),S-.6],[X(-sw-1.3),Wy-1.4],[X(-sw-1.3-sl),Wy-2.4],[X(-sw+.3),Wy-2.2],[X(-sw+.6),S-1.4]];sleeve(grp,toCCW(sp),z);
      if(bracer){const b=toCCW([[X(-sw-1.35),Wy+.3],[X(-sw+.5),Wy+.5],[X(-sw+.36),Wy-2.5],[X(-sw-1.42),Wy-2.7]]);fp(grp,b,{t:.1,s:60,ed:C.leatherDk,paint:P=>{P.wash(C.leather,b,{edge:.5});for(const y of[Wy-.3,Wy-1.6]){P.pen([[X(-sw-1.3),y],[X(-sw+.4),y+.15]],C.leatherDk,.16,.9);P.fill(circ(X(-sw-.4),y+.08,.13,.13,8),C.gold,1)}}},z+.06)}
      else fp(grp,toCCW([[X(-sw-1.35-sl),Wy-2.2],[X(-sw+.35),Wy-2],[X(-sw+.3),Wy-2.6],[X(-sw-1.35-sl),Wy-2.75]]),cuff==='gold'?{mat:gold(),t:.1}:{color:cuff,kind:'water',t:.1},z+.06);
      hand(grp,[[X(-sw-1.05),Wy-2.55],[X(-sw+.05),Wy-2.55],[X(-sw+.25),Wy-3.4],[X(-sw+.05),Wy-4.25],[X(-sw-.45),Wy-4.6],[X(-sw-.95),Wy-4.3],[X(-sw-1.3),Wy-3.5],[X(-sw-1.55),Wy-3.05],[X(-sw-1.3),Wy-2.85]].map(p=>p),z+.12)};
    wipe(aL.i);wipe(aR.i);hang(aL.i,1,.55);
    if(!L.stav){hang(aR.i,-1,.55);return}
    sleeve(aR.i,[[sw-.3,S+.1],[sw+.8,S-.6],[sw+1.4,Wy+.8],[hx+.2,Wy+1.2],[hx+.3,Wy+.1],[sw+.2,Wy+.1],[sw-.6,S-1.4]],.6);
    if(bracer){const b=toCCW([[sw+1.25,Wy+1.3],[hx+.25,Wy+1.38],[hx+.36,Wy-.02],[sw+1.15,Wy-.08]]);fp(aR.i,b,{t:.1,s:60,ed:C.leatherDk,paint:P=>{P.wash(C.leather,b,{edge:.5});P.pen([[sw+1.9,Wy+1.3],[sw+1.85,Wy]],C.leatherDk,.16,.9);P.fill(circ(sw+1.88,Wy+.65,.13,.13,8),C.gold,1)}},.66)}
    else fp(aR.i,sm([[hx-.3,Wy+1.35],[hx+.25,Wy+1.3],[hx+.35,Wy],[hx-.2,Wy-.05]],4),cuff==='gold'?{mat:gold(),t:.1}:{color:cuff,kind:'water',t:.1},.66);
    hand(aR.i,[[hx,Wy+1.2],[hx+1.2,Wy+1.2],[hx+1.4,Wy+.4],[hx+1.1,Wy-.2],[hx+.1,Wy-.1]],.74)}
  const bodiceS=()=>sm([[-sw,S],[sw,S],[sw*.95,S-1.2],[ww*1.02,Wy+.2,1],[ww,Wy-.4,1],[-ww,Wy-.4,1],[-ww*1.02,Wy+.2,1],[-sw*.95,S-1.2]],6);
  const belt=(h=.8,col=C.brown,buck=.5)=>{fp(F.gTorso,box(-ww-.18,Wy-.45,ww+.18,Wy-.45+h),{color:col,kind:'water',t:.12},.42);fps(ring(box(-buck,Wy-.58,buck,Wy-.32+h),.17,false),{mat:gold(),t:.1},F.gTorso,.48)};
  const pouch=(x,wd=1.5,col='#8a5432')=>{fp(F.gTorso,sm([[x,Wy-.4,1],[x+wd,Wy-.4,1],[x+wd,Wy-1.8],[x+wd/2,Wy-2.15],[x,Wy-1.8]],5),{color:col,kind:'water',t:.3},.5);fp(F.gTorso,sm([[x-.05,Wy-.35,1],[x+wd+.05,Wy-.35,1],[x+wd,Wy-1.05],[x+wd/2,Wy-1.3],[x,Wy-1.05]],4),{color:hexOf(shade(col,.15)),kind:'water',t:.08},.66);fp(F.gTorso,circ(x+wd/2,Wy-1.12,.13,.13,8),{mat:gold(),t:.08},.72)};
  const crotch=col=>fp(F.gTorso,sm([[-ww-.25,Wy+.1,1],[ww+.25,Wy+.1,1],[ww+.55,HIP-.4],[.15,HIP-.9],[0,HIP-1.5],[-.15,HIP-.9],[-ww-.55,HIP-.4]],5),{color:col,kind:'water',t:.18},.12);
  function buildOutfit(){for(const lg of LG)wipe(lg.i);wipe(F.gTorso);wipe(sk.i);const k=L.tøj,T_=F.gTorso,SK=sk.i;const KC=L.col.tøj||L.col.kjole||(KJOLER[k]&&KJOLER[k].std),KJ=KC||C.purple,KJL=KC?hexOf(shade(KJ,.22)):C.purpleLt,KJD=KC?hexOf(shade(KJ,-.3)):C.purpleDk,KJB=KC?hexOf(shade(KJ,-.15)):'#5a3290';
    if(KJOLER[k]){const kv=KJOLER[k],He=kv.kort?7.2:HEM,Hw=kv.kort?4.9:HW,kr=kv.krave||C.navy,krL=hexOf(shade(kr,.2));boots(2.6,C.brown);legs(C.cream,2.2,kv.kort?{stripes:KJD}:{});
      const sks=sm([[-ww,Wy+.2,1],[ww,Wy+.2,1],[Hw*.8,He+3],[Hw,He],[Hw*.5,He-.25],[0,He-.1],[-Hw*.5,He-.25],[-Hw,He],[-Hw*.8,He+3]],6);
      /* kjolens mønster: det samme snit, men stjerner, måner, blomster, striber, prikker eller hjerter */
      const moenster=P=>{const n=kv.kort?9:16,pkt=()=>[R(-Hw*.82,Hw*.82),R(He+1,Wy-1)];
        if(kv.motiv==='stjerner')for(let i=0;i<n;i++)P.fill(starPts(...pkt(),R(.28,.45),.13,R(1)),C.gold,.9);
        if(kv.motiv==='måner')for(let i=0;i<n*.8;i++){const[x,y]=pkt(),r=R(.34,.5);P.fill(circ(x,y,r,r,14),'#f6e7c0',.95);P.fill(circ(x+r*.45,y+r*.25,r*.82,r*.82,14),KJ,1)}
        if(kv.motiv==='blomster')for(let i=0;i<n*.8;i++){const[x,y]=pkt(),r=R(.2,.3),c=['#ffd6ea','#fff6d0','#ffb0d0'][i%3];for(let q=0;q<5;q++)P.fill(circ(x+Math.cos(q/5*TAU)*r*1.15,y+Math.sin(q/5*TAU)*r*1.15,r,r,8),c,.95);P.fill(circ(x,y,r*.7,r*.7,8),'#f2c230',1)}
        if(kv.motiv==='striber')for(let i=0;i<9;i++){const a=mix(-ww,ww,(i+.25)/9),b=mix(-ww,ww,(i+.75)/9);if(i%2===0)P.fill(toCCW([[a,Wy-.2],[b,Wy-.2],[b*Hw/ww*1.02,He+.3],[a*Hw/ww*1.02,He+.3]]),KJL,.75)}
        if(kv.motiv==='prikker')for(let i=0;i<n*1.6;i++){const[x,y]=pkt(),r=R(.18,.3);P.fill(circ(x,y,r,r,10),'#fbf5e6',.92)}
        if(kv.motiv==='hjerter')for(let i=0;i<n*.8;i++){const[x,y]=pkt(),r=R(.22,.32);for(const sx of[-1,1])P.fill(circ(x+sx*r*.55,y+r*.3,r*.62,r*.62,10),'#ffd0e0',.95);P.fill([[x-r*1.1,y+.12*r],[x+r*1.1,y+.12*r],[x,y-r*1.15]],'#ffd0e0',.95)}
        if(kv.motiv==='knapper')for(let y=He+1.2;y<Wy-.6;y+=1.25)P.fill(circ(0,y,.2,.2,10),C.gold,1)};
      fp(SK,sks,{t:.2,s:22,ed:KJ,paint:P=>{P.wash(KJ,sks,{top:KJL,edge:.5,clouds:10});for(let i=0;i<9;i++){const x=mix(-ww,ww,i/8);P.score([[x,Wy-.5],[x*Hw/ww*1.02,He+.8]],{w:.07,ink:.25,dark:KJD})}moenster(P);
        if(kv.lag)for(const y of[He+3.2,He+6.2]){const e=curve([[-Hw,y],[-Hw*.5,y-.3],[0,y-.1],[Hw*.5,y-.3],[Hw,y]],8);P.pen(e,KJD,.22,.7);P.pen(e.map(([x,q])=>[x,q+.3]),KJL,.14,.8)}}},.2);
      fps(thick([curve([[-Hw,He+.05],[-Hw*.5,He-.2],[0,He-.05],[Hw*.5,He-.2],[Hw,He+.05]],8)],.22),{mat:gold(),t:.08},SK,.32);
      if(kv.forkl){/* et forklæde med lomme over kjolen */const fb=He+2.2,fo=[[-ww*.9,Wy-.4],[ww*.9,Wy-.4],[ww*1.5,fb+.4]];for(let i=0;i<=6;i++)fo.push([ww*1.5-ww*3*i/6,fb+(i%2?.5:0)]);fo.push([-ww*1.5,fb+.4]);const fs=toCCW(sm(fo,4));
        fp(SK,fs,{t:.1,s:30,ed:'#d8ccb0',paint:P=>{P.wash('#fbf5e6',fs,{edge:.5,clouds:4});P.pen([[-1.2,Wy-3.4],[1.2,Wy-3.4],[1.2,Wy-5.6],[-1.2,Wy-5.6],[-1.2,Wy-3.4]],'#c8b890',.08,.9);P.fill(starPts(0,Wy-4.5,.6,.26),KJ,.9)}},.34)}
      const bd=bodiceS();fp(T_,bd,{t:.2,s:30,ed:KJ,paint:P=>{P.wash(KJ,bd,{top:KJL,edge:.5});if(kv.motiv==='knapper')for(let y=Wy+.7;y<S-2.4;y+=.9)P.fill(circ(0,y,.17,.17,10),C.gold,1);if(kv.forkl)P.fill(box(-ww*.62,Wy,ww*.62,S-2.6),'#fbf5e6',1)}},.3);belt();if(!kv.forkl)pouch(ww*.45);
      const c=sm([[-sw-.4,S+.25],[sw+.4,S+.25],[sw*.95,S-1.5],[sw*.4,S-2.2],[0,S-2.4],[-sw*.4,S-2.2],[-sw*.95,S-1.5]],6);fp(T_,c,{t:.16,s:30,ed:kr,paint:P=>{P.wash(kr,c,{top:krL,edge:.5});const e=grow(c,-.25)[0].outer;for(let i=0;i<e.length;i+=3)P.fill(circ(e[i][0],e[i][1],.08,.08,6),C.gold,1)}},.5);
      if(kv.sloejfe){for(const sx of[-1,1])fp(T_,toCCW([[0,S-1.3],[sx*1.5,S-.5],[sx*1.5,S-2.1]]),{color:'#e0457a',kind:'water',t:.12},.6);fp(T_,circ(0,S-1.3,.34,.34,12),{color:'#b83a6a',kind:'water',t:.14},.64)}else fp(T_,starPts(0,S-1.25,.7,.3),{mat:gold(),t:.1},.6);
      arms(KJ,{sl:.7})}
    if(k==='eventyrer'){const TR='#6e4c30',TU=L.col.tøj||L.col.tunika||C.teal,TUD=hexOf(shade(hexOf(TU),-.3));boots(5.2,C.leather,{cuff:'#a06c3e'});legs(TR,4.6,{wd:1.04});
      /* bukser: skridt og lår, med knælapper */
      crotch(TR);
      LG.forEach((lg,i)=>{const x=(i?1:-1)*1.15;fp(lg.i,sm([[x-.62,8],[x+.62,8],[x+.68,6.6],[x-.68,6.6]],3),{color:'#8a6240',kind:'water',t:.06},-.02)});
      /* hørskjorte med snøre i halsen */
      const bd=bodiceS();fp(T_,bd,{t:.2,s:30,ed:'#c8b890',paint:P=>{P.wash(C.cream,bd,{edge:.5});for(let y=S-2.6;y<S-.6;y+=.5)P.pen([[-.3,y],[.3,y+.45]],'#8a6a40',.05,.9)}},.3);
      /* tunika-vest i to forstykker og korte skøder, med syet guldkant */
      for(const sx of[-1,1]){const v=toCCW([[sx*sw*.97,S-.05],[sx*.75,S-.9],[sx*.5,Wy-.3],[sx*(ww+.05),Wy-.3],[sx*ww*1.04,Wy+.2],[sx*sw*.96,S-1.2]]);fp(T_,v,{t:.14,s:40,ed:TUD,paint:P=>{P.wash(TU,v,{top:hexOf(shade(hexOf(TU),.2)),edge:.5});const e=curve([[sx*.82,S-1],[sx*.6,Wy-.2]],8);for(let i=0;i<e.length-1;i+=2)P.score([e[i],e[i+1]],{w:.05,ink:.7,dark:C.gold})}},.36);
        const fl=toCCW([[sx*.25,Wy+.1],[sx*(ww+.3),Wy+.1],[sx*(ww+1.5),HIP-1.9],[sx*(ww+.2),HIP-2.5],[sx*.5,HIP-2.2]]);fp(SK,fl,{t:.14,s:40,ed:TUD,paint:P=>{P.wash(TU,fl,{top:hexOf(shade(hexOf(TU),.15)),edge:.5});const e=curve([[sx*(ww+1.4),HIP-2],[sx*(ww+.2),HIP-2.4],[sx*.55,HIP-2.1],[sx*.3,Wy]],10);for(let i=0;i<e.length-1;i+=2)P.score([e[i],e[i+1]],{w:.05,ink:.7,dark:C.gold})}},.22)}
      /* læderremme på kryds med en messingring, bredt bælte, tasker og en lille flaske */
      for(const sx of[-1,1])fps(thick([[[sx*sw*.78,S-.1],[-sx*(ww+.05),Wy+.5]]],.3),{color:C.leather,kind:'water',t:.08,edge:C.leatherDk},T_,.44+(sx>0?.02:0));
      const my=(S-.1+Wy+.5)/2;fps(ring(circ(0,my,.55,.55,20),.2),{mat:gold(),t:.12},T_,.5);for(const[sx,t]of[[-1,.25],[1,.25],[-1,.78],[1,.78]])fp(T_,circ(mix(sx*sw*.78,-sx*(ww+.05),t),mix(S-.1,Wy+.5,t),.11,.11,8),{mat:gold(),t:.06},.5);
      belt(1,C.leatherDk,.6);pouch(-ww-.2,1.5,'#8a5432');pouch(ww*.3,1.3,'#7a4a2a');
      {const bx=-.55;fp(T_,sm([[bx-.38,Wy-.5],[bx+.38,Wy-.5],[bx+.42,Wy-1.5],[bx,Wy-1.85],[bx-.42,Wy-1.5]],4),{t:.2,mat:paperMat('#d8fff0','tissue',{glow:'#5fe0b0',gi:1.1})},.56);fp(T_,box(bx-.2,Wy-.5,bx+.2,Wy-.2),{color:'#c8a070',kind:'balsa',t:.22},.58)}
      arms(C.cream,{sl:.1,bracer:true})}
    if(k==='skovløber'){const TU=L.col.tøj||L.col.tunika||'#5d7d3c',TUD=hexOf(shade(TU,-.3)),TUL=hexOf(shade(TU,.2)),TR='#5a4632';boots(4.8,'#6a4426',{cuff:'#8a6240'});legs(TR,4.2,{wd:1.02});crotch(TR);
      /* lang tunika med takket søm, snøre i halsen og syet kant */
      const hemY=HIP-3.4,o=[[-ww,Wy+.2],[ww,Wy+.2],[ww+1.7,hemY+.7]];for(let i=0;i<=8;i++){const x=(ww+1.7)*(1-i/4);o.push([x,hemY+(i%2?.75:0)])}
      const tk=toCCW(o);fp(SK,tk,{t:.16,s:36,ed:TUD,paint:P=>{P.wash(TU,tk,{top:TUL,edge:.5,clouds:6});for(let i=0;i<8;i++){const a=[(ww+1.7)*(1-i/4),hemY+(i%2?.75:0)+.35],b=[(ww+1.7)*(1-(i+1)/4),hemY+((i+1)%2?.75:0)+.35];P.score([a,[(a[0]+b[0])/2,(a[1]+b[1])/2]],{w:.05,ink:.7,dark:C.gold})}P.score([[0,Wy],[0,hemY+.9]],{w:.06,ink:.3,dark:TUD})}},.22);
      const bd=bodiceS();fp(T_,bd,{t:.2,s:30,ed:TUD,paint:P=>{P.wash(TU,bd,{top:TUL,edge:.5});P.fill([[-.95,S+.1],[.95,S+.1],[0,S-2.3]],C.cream,1);for(let y=S-1.9;y<S-.3;y+=.45){const hw=(y-(S-2.3))*.36;P.pen([[-hw,y],[hw,y+.3]],'#6a4a2a',.05,.9)}P.pen([[-.95,S+.1],[0,S-2.3],[.95,S+.1]],C.gold,.07,.9)}},.3);
      /* en læderskulder, en rem på skrå, bredt bælte med stor spænde og bæltetasker */
      {const pa=sm([[-sw-.75,S+.45],[-sw*.3,S+.5],[-sw*.25,S-.5],[-sw*.6,S-1.25],[-sw-.95,S-1]],6);fp(T_,toCCW(pa),{t:.16,s:50,ed:C.leatherDk,paint:P=>{P.wash(C.leather,toCCW(pa),{top:'#a87244',edge:.5});P.pen([[-sw-.7,S-.35],[-sw*.3,S-.05]],C.leatherDk,.07,.8);for(const x of[-sw-.45,-sw*.62])P.fill(circ(x,S-.75,.1,.1,8),C.gold,1)}},.62)}
      fps(thick([[[-sw*.72,S-.3],[ww+.1,Wy+.5]]],.32),{color:C.leather,kind:'water',t:.08,edge:C.leatherDk},T_,.44);fp(T_,box(-.42,(S+Wy)/2-.28,.42,(S+Wy)/2+.42),{mat:gold(),t:.1},.5);
      belt(1.05,C.leatherDk,.68);pouch(-ww-.3,1.6,'#8a5432');pouch(ww*.35,1.25,'#6a4426');
      {const hx_=ww+.2;fps(thick([[[hx_,Wy-.4],[hx_+.2,Wy-3.2]]],.2),{color:'#d9d2c0',kind:'card',t:.1},T_,.4);fp(T_,sm([[hx_-.2,Wy-.3],[hx_+.3,Wy-.3],[hx_+.32,Wy-1.1],[hx_-.18,Wy-1.1]],3),{color:C.leatherDk,kind:'water',t:.14},.46)}
      arms(TU,{sl:.1,bracer:true})}
    if(k==='opdager'){const TR=L.col.tøj||L.col.bukser||'#b3935a',TRD=hexOf(shade(TR,-.3));boots(3.2,C.brownDk,{cuff:null});legs(C.cream,2.8,{stripes:'#c2452d',wd:.66});crotch(TR);
      /* knæbukser over stribede strømper */
      LG.forEach((lg,i)=>{const x=(i?1:-1)*1.15,kn=sm([[x-.98,HIP+.5,1],[x+.98,HIP+.5,1],[x+1.02,7.4],[x+.84,6.5],[x-.84,6.5],[x-1.02,7.4]],4);fp(lg.i,kn,{t:.16,s:40,ed:TRD,paint:P=>{P.wash(TR,kn,{top:hexOf(shade(TR,.15)),edge:.5})}},-.04);fp(lg.i,box(x-.9,6.35,x+.9,6.85),{color:TRD,kind:'water',t:.2},-.02);fp(lg.i,circ(x+(i?.6:-.6),6.6,.13,.13,8),{mat:gold(),t:.06},.12)});
      /* skjorte med knapper og krave, seler med messingspænder, og et lille halstørklæde */
      const bd=bodiceS();fp(T_,bd,{t:.2,s:30,ed:'#c8b890',paint:P=>{P.wash('#f3ead6',bd,{edge:.5});P.pen([[0,S],[0,Wy-.3]],'#c8b890',.05,.9);for(let y=Wy+.6;y<S-1.6;y+=.8)P.fill(circ(0,y,.1,.1,8),'#8a6a40',1)}},.3);
      for(const sx of[-1,1]){fps(thick([[[sx*sw*.62,S+.05],[sx*ww*.72,Wy+.35]]],.3),{color:'#8a3a2e',kind:'water',t:.08,edge:'#5a2018'},T_,.4);fp(T_,box(sx*ww*.72-.26,Wy+.25,sx*ww*.72+.26,Wy+.85),{mat:gold(),t:.08},.46);
        fp(T_,toCCW([[sx*.1,S+.3],[sx*sw*.55,S+.35],[sx*sw*.5,S-.75],[sx*.5,S-1.35]]),{color:'#fbf5e6',kind:'card',t:.1,edge:'#c8b890'},.5)}
      fp(T_,sm([[-.85,S-.5],[.85,S-.5],[.2,S-1.9],[0,S-2.05],[-.2,S-1.9]],4),{color:C.teal,kind:'water',t:.1},.56);fp(T_,circ(0,S-.62,.24,.24,12),{color:hexOf(shade(hexOf(C.teal),-.25)),kind:'water',t:.1},.6);
      belt(.75,C.brown,.5);pouch(-ww-.25,1.45,'#8a5432');
      /* kompas i en kæde ved bæltet */
      {const kx=ww*.55,ky=Wy-1.35;fps(thick([[[kx-.5,Wy-.4],[kx-.1,ky+.3]]],.05),{mat:gold(),t:.04},T_,.5);fp(T_,circ(kx,ky,.52,.52,20),{mat:gold(),t:.12},.52);fp(T_,circ(kx,ky,.38,.38,20),{color:'#f6efe0',kind:'card',t:.04},.6);fp(T_,[[kx,ky+.32],[kx+.09,ky],[kx,ky-.32],[kx-.09,ky]],{color:'#c2452d',kind:'card',t:.03},.63)}
      arms('#f3ead6',{sl:.15,cuff:'#e0d4b8'})}
    if(k==='rejsekappe'){const CO=L.col.tøj||L.col.frakke||'#4a3460',COL=hexOf(shade(CO,.18)),COD=hexOf(shade(CO,-.35)),TR='#46506e';boots(3.6,C.brownDk,{cuff:null});legs(TR,3.2,{wd:1});
      crotch(TR);
      const bd=bodiceS();fp(T_,bd,{t:.2,s:30,ed:'#c8b890',paint:P=>{P.flat(C.cream,bd);for(let x=-3;x<3;x+=.6)P.flat(C.teal,box(x,Wy-1,x+.22,S+1),.8)}},.3);belt(.7,C.brown,.45);
      for(const sx of[-1,1]){const up=toCCW([[sx*(sw+.1),S+.1],[sx*sw*.32,S-.1],[sx*.95,S-2.3],[sx*1.15,Wy-.2],[sx*(ww+.55),Wy-.2],[sx*sw*1.0,S-1.2]]);fp(T_,up,{t:.16,s:40,ed:COD,paint:P=>{P.wash(CO,up,{top:COL,edge:.5})}},.46);
        fp(T_,toCCW([[sx*sw*.34,S-.05],[sx*1.0,S-2.2],[sx*1.9,S-1.5],[sx*sw*.75,S+.05]]),{color:COL,kind:'water',t:.08,edge:COD},.52);
        const lo=toCCW([[sx*1.1,Wy],[sx*(ww+.6),Wy],[sx*(HW-.2),3.4],[sx*(HW-1.6),3],[sx*1.7,3.5]]);fp(SK,lo,{t:.16,s:30,ed:COD,paint:P=>{P.wash(CO,lo,{top:COL,edge:.5,clouds:6});P.score([[sx*(ww+.2),Wy-.6],[sx*(HW-1),3.6]],{w:.07,ink:.3,dark:COD});P.score([...box(sx>0?2.4:-4,Wy-4.6,sx>0?4:-2.4,Wy-3.4),[sx>0?2.4:-4,Wy-4.6]],{w:.06,ink:.35,dark:COD})}},.24);
        if(sx>0)for(let y=Wy-1.2;y>4.4;y-=1.7)fp(SK,circ(1.55+ (Wy-y)*.035,y,.2,.2,12),{mat:gold(),t:.1},.3)}
      arms(CO,{sl:.5,cuff:COL})}
    if(k==='festkjole'){boots(2.2,KJD,{lace:false});legs(C.cream,1.8);const hw=6.1,hem=1.1;
      {const o=[[-hw*.85,hem+3],[hw*.85,hem+3]];for(let i=0;i<=10;i++){const x=hw*.95-i*hw*.19;o.push([x,hem+(i%2?-.35:.05)])}fp(SK,toCCW(o),{color:C.lilac,kind:'water',t:.16},.1)}
      const sks=sm([[-ww,Wy+.2,1],[ww,Wy+.2,1],[hw*.7,hem+4],[hw,hem+.6],[hw*.45,hem+1.2],[0,hem+2.4],[-hw*.45,hem+1.2],[-hw,hem+.6],[-hw*.7,hem+4]],6);
      fp(SK,sks,{t:.2,s:22,ed:KJ,paint:P=>{P.wash(KJ,sks,{top:KJL,edge:.5,clouds:10});for(let i=0;i<9;i++){const x=mix(-ww,ww,i/8);P.score([[x,Wy-.5],[x*hw/ww,hem+2]],{w:.07,ink:.25,dark:KJD})}for(let i=0;i<10;i++)P.fill(starPts(R(-hw*.8,hw*.8),R(hem+3,Wy-1),R(.28,.45),.13,R(1)),C.gold,.9)}},.2);
      fps(thick([curve([[-hw,hem+.6],[-hw*.45,hem+1.2],[0,hem+2.4],[hw*.45,hem+1.2],[hw,hem+.6]],8)],.22),{mat:gold(),t:.08},SK,.32);
      const bd=bodiceS();fp(T_,bd,{t:.2,s:30,ed:KJB,paint:P=>{P.wash(KJB,bd,{top:KJ,edge:.5});for(let y=Wy+.4;y<S-1.4;y+=.55){P.fill(circ(-.32,y,.09,.09,8),C.gold,1);P.fill(circ(.32,y,.09,.09,8),C.gold,1);P.pen([[-.32,y],[.32,y+.55]],C.cream,.05,.9)}}},.3);
      fp(T_,box(-ww-.1,Wy-.4,ww+.1,Wy+.3),{color:C.lilac,kind:'water',t:.1},.42);fp(T_,sm([[0,Wy],[-1.2,Wy+.7],[-1.4,Wy-.4],[0,Wy-.1],[1.4,Wy-.4],[1.2,Wy+.7]],5),{color:C.lilac,kind:'water',t:.08},.5);fp(SK,sm([[-.2,Wy-.1],[-.8,Wy-2.6],[-.3,Wy-2.4],[0,Wy-.3],[.3,Wy-2.6],[.8,Wy-2.4],[.2,Wy-.1]],5),{color:'#bfa1e2',kind:'water',t:.06},.34);
      const cp=sm([[-sw-.5,S+.2],[sw+.5,S+.2],[sw+.9,S-1.6],[sw*.4,S-2.3],[0,S-2.5],[-sw*.4,S-2.3],[-sw-.9,S-1.6]],6);fp(T_,cp,{t:.14,s:30,ed:C.lilac,paint:P=>{P.wash(C.lilac,cp,{edge:.4});P.pen([...grow(cp,-.2)[0].outer,grow(cp,-.2)[0].outer[0]],C.gold,.07,.9)}},.5);for(const sx of[-1,1])fp(T_,circ(sx*.9,S-.8,.3,.3,16),{mat:gold(),t:.1},.6);
      arms(KJ,{sl:1.3,cuff:C.lilac})}}
  /* kappe */
  function buildCape(){wipe(F.gCape);const k=L.kappe;if(k==='ingen')return;
    if(KAPPER[k]){const kv=KAPPER[k],c0=L.col.kappe||kv.std||C.navy,c1=hexOf(shade(c0,.2)),c2=hexOf(shade(c0,-.35)),bund=[];
      if(kv.takket)for(let i=0;i<=10;i++)bund.push([HW+1.4-(2*HW+2.8)*i/10,HEM+(i%2?1.5:-.1)]);else bund.push([HW+1.4,HEM+.3],[0,HEM-.2],[-HW-1.4,HEM+.3]);
      const o=kv.takket?toCCW([[-sw-.2,S],[sw+.2,S],...bund]):sm([[-sw-.2,S],[sw+.2,S],...bund],6),pkt=()=>[R(-HW-1,HW+1),R(HEM+.8,S-2)];
      if(kv.kant)fp(F.gCape,grow(o,.3)[0].outer,{color:kv.kant,kind:'water',t:.1},-.92);
      if(kv.haette){const hd=circ(0,cy+.2,w*.5+1.5,hh*.5+1.5,36);fp(F.gCape,hd,{t:.2,s:22,ed:c0,paint:P=>{P.wash(c0,hd,{top:c1,edge:.7,clouds:6})}},-.86)}
      fp(F.gCape,o,{t:.2,s:22,ed:c0,paint:P=>{P.wash(c0,o,{top:c1,edge:.6,clouds:8});for(let i=0;i<7;i++){const x=R(-HW,HW);P.score([[x*.4,S],[x,HEM+1]],{w:.08,ink:.3,dark:c2})}
        if(kv.motiv==='stjerner')for(let i=0;i<40;i++)P.fill(starPts(...pkt(),R(.2,.42),.12,R(1)),C.gold,.9);
        if(kv.motiv==='måner')for(let i=0;i<26;i++){const[x,y]=pkt(),r=R(.34,.52);P.fill(circ(x,y,r,r,14),'#f6e7c0',.95);P.fill(circ(x+r*.45,y+r*.25,r*.82,r*.82,14),c0,1)}
        if(kv.motiv==='blomster')for(let i=0;i<24;i++){const[x,y]=pkt(),r=R(.22,.32),c=['#ffd6ea','#fff6d0','#ffb0d0'][i%3];for(let q=0;q<5;q++)P.fill(circ(x+Math.cos(q/5*TAU)*r*1.15,y+Math.sin(q/5*TAU)*r*1.15,r,r,8),c,.95);P.fill(circ(x,y,r*.7,r*.7,8),'#f2c230',1)}
        if(kv.motiv==='striber')for(let i=0;i<10;i+=2){const a=(i/10*2-1)*(sw+.2),b=((i+1)/10*2-1)*(sw+.2),k2=(HW+1.4)/(sw+.2);P.fill(toCCW([[a,S],[b,S],[b*k2,HEM],[a*k2,HEM]]),c1,.8)}}},-.8);
      if(kv.pels){const fu=[];for(let i=0;i<=14;i++)fu.push([-HW-1.5+(2*HW+3)*i/14,HEM+1.5+(i%2?.4:0)-Math.abs(i-7)*.0]);fu.push([HW+1.5,HEM-.1],[0,HEM-.5],[-HW-1.5,HEM-.1]);fp(F.gCape,toCCW(sm(fu,3)),{color:'#f6f0e2',kind:'water',t:.26},-.74);
        const kr=[];for(let i=0;i<=8;i++)kr.push([-sw-1+(2*sw+2)*i/8,S+.5+(i%2?.35:0)]);kr.push([sw+1.2,S-1.1],[0,S-1.7],[-sw-1.2,S-1.1]);fp(F.gCape,toCCW(sm(kr,3)),{color:'#f6f0e2',kind:'water',t:.2},1.3)}}
    if(k==='kort'){const b=sm([[-sw-1,S+.3],[sw+1,S+.3],[sw+2.6,S-5.2],[sw+1.2,S-6.2],[0,S-5.6],[-sw-1.2,S-6.2],[-sw-2.6,S-5.2]],6);fp(F.gCape,b,{t:.2,s:26,ed:C.leatherDk,paint:P=>{P.wash(C.leather,b,{top:'#a87244',edge:.6,clouds:6});const e=grow(b,-.3)[0].outer;for(let i=0;i<e.length-1;i+=2)P.score([e[i],e[i+1]],{w:.05,ink:.6,dark:'#f0d6a4'})}},-.8);
      for(const sx of[-1,1])fp(F.gCape,toCCW([[sx*.5,S+.1],[sx*(sw+.9),S+.35],[sx*(sw+1.1),S-.9],[sx*sw*.6,S-1.2],[sx*.9,S-.5]]),{color:'#a87244',kind:'water',t:.12,edge:C.leatherDk},1.34);
      fp(F.gCape,circ(0,S-.15,.38,.38,20),{mat:gold(),t:.12},1.42)}}
  /* tilbehør */
  function buildAcc(){wipe(F.gAcc);const k=L.tilbehør;
    if(k==='taske'){fps(thick([[[-sw+.5,S-.2],[ww+.8,Wy-.8]]],.28),{color:'#8a5432',kind:'water',t:.08},F.gAcc,.62);fp(F.gAcc,sm([[ww+.2,Wy-.2,1],[ww+3.2,Wy-.2,1],[ww+3.2,Wy-2.8],[ww+2.8,Wy-3.2],[ww+.6,Wy-3.2],[ww+.2,Wy-2.8]],5),{color:'#8a5432',kind:'water',t:.5},.78);fp(F.gAcc,sm([[ww+.1,Wy-.1,1],[ww+3.3,Wy-.1,1],[ww+3.1,Wy-1.6],[ww+1.7,Wy-2],[ww+.3,Wy-1.6]],5),{color:'#a0643c',kind:'water',t:.1},1.06);fp(F.gAcc,box(ww+1.45,Wy-2.1,ww+1.95,Wy-1.55),{mat:gold(),t:.1},1.14)}
    if(k==='rygsæk'){/* sovepose på tværs bag ryggen, og bæreremme over skuldrene */
      const by=Wy-1.3,bw=sw+2.5,rl=sm([[-bw,by+1.05],[bw,by+1.05],[bw+.25,by],[bw,by-1.05],[-bw,by-1.05],[-bw-.25,by]],5);fp(F.gAcc,rl,{t:.5,s:40,ed:'#3f6f68',paint:P=>{P.wash(C.teal,rl,{top:hexOf(shade(hexOf(C.teal),.2)),edge:.5});for(const x of[-bw+1.1,bw-1.1])P.flat(C.leatherDk,box(x-.2,by-1.2,x+.2,by+1.2),.9)}},-.62);
      for(const sx of[-1,1]){fp(F.gAcc,circ(sx*(bw+.05),by,.5,1,16),{color:'#e6dcc0',kind:'card',t:.06,edge:'#3f6f68'},-.34);fps(thick([[[sx*sw*.78,S+.1],[sx*(ww+.25),Wy+.3]]],.34),{color:C.leather,kind:'water',t:.08,edge:C.leatherDk},F.gAcc,.6);fp(F.gAcc,box(sx*(ww+.5)-.3,Wy+1.1,sx*(ww+.5)+.3,Wy+1.6),{mat:gold(),t:.08},.66)}
      fps(thick([[[-ww*1.1,S-2.1],[ww*1.1,S-2.1]]],.22),{color:C.leather,kind:'water',t:.08,edge:C.leatherDk},F.gAcc,.62);fp(F.gAcc,box(-.3,S-2.4,.3,S-1.8),{mat:gold(),t:.08},.68)}
    if(k==='tørklæde'){fp(F.gAcc,sm([[-sw*.7,S+.35],[sw*.7,S+.35],[sw*.78,S-.6],[0,S-1.15],[-sw*.78,S-.6]],6),{color:C.red,kind:'water',t:.14},1.36);fp(F.gAcc,sm([[sw*.3,S-.6],[sw*.75,S-.7],[sw*.95,S-3.4],[sw*.55,S-3.6],[sw*.35,S-1.5]],5),{color:'#b24a34',kind:'water',t:.08},1.4);for(const y of[S-3.1,S-2.7])fps(thick([[[sw*.5,y],[sw*.92,y+.05]]],.06),{color:C.cream,t:.04},F.gAcc,1.46)}}
  /* staven med glødende kugle */
  function buildStaff(){wipe(F.gStaff);F.orb=null;if(!L.stav)return;const stx=hx+.75,sTop=S+3.6;const st=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,sTop,12),paperMat('#8a5a3a','balsa'));put(F.gStaff,st,stx,sTop/2,.68);
    for(let i=0;i<6;i++){const y=Wy-1.8-i*.42;fps(thick([[[stx-.32,y],[stx+.32,y+.3]]],.07),{color:C.pink,t:.04},F.gStaff,.82)}
    fps(thick([curve([[stx,sTop],[stx-1.2,sTop+.8],[stx-.9,sTop+2.2],[stx-.2,sTop+2.9]],6),curve([[stx,sTop],[stx+1.2,sTop+.8],[stx+.9,sTop+2.2],[stx+.2,sTop+2.9]],6)],.12),{mat:gold(),t:.12},F.gStaff,.68);
    F.orb=new THREE.Mesh(new THREE.SphereGeometry(1.05,24,16),new THREE.MeshStandardMaterial({color:'#c9f1ff',emissive:'#5fc6ff',emissiveIntensity:1.8,roughness:.2}));put(F.gStaff,F.orb,stx,sTop+1.6,.68)}
  const shade_=()=>G.traverse(o=>{if(o.isMesh){o.castShadow=!!F.shadow;o.receiveShadow=!!F.shadow}});
  /* farver: tøjets, hattens og kappens hovedfarve, og hårets */
  F.setCol=(k,v)=>{FRES=L.res||1;if(k==='hud'){L.skin=v;L.skinSh=hexOf(shade(v,-.16));F.build();return}if(k==='øjne'){L.iris=[hexOf(shade(v,.35)),hexOf(shade(v,-.2))];buildHead();buildHair();buildHat();shade_();FRES=1;return}if(k==='hår'){L.hair=[v,hexOf(shade(v,.25)),hexOf(shade(v,-.35))];[H0,H1,H2]=L.hair;buildHead();buildHair();buildHat()}else{L.col=Object.assign({},L.col,{[k]:v});if(k==='tøj'||k==='støvler')buildOutfit();else if(k==='hat')buildHat();else if(k==='kappe')buildCape()}shade_();FRES=1};
  F.set=(k,v)=>{FRES=L.res||1;L[k]=v;if(k==='hat')buildHat();else if(k==='hår'||k==='pande')buildHair();else if(k==='mærke'){buildHead();buildHair();buildHat()}else if(k==='tøj'||k==='støvler'){buildOutfit();buildHair()}else if(k==='kappe')buildCape();else if(k==='tilbehør')buildAcc();else if(k==='stav'){buildOutfit();buildStaff()}shade_();FRES=1};
  F.build=()=>{FRES=L.res||1;buildHead();buildHair();buildHat();buildOutfit();buildCape();buildAcc();buildStaff();shade_();FRES=1;return F};
  /* bevægelse: gang (ph er skridtets fase, amp 0..1), åndedræt, hårets sving og blink */
  F.tick=(t,{ph=0,amp=0}={})=>{const s=Math.sin(ph);F.legs[0].rotation.z=.32*s*amp;F.legs[1].rotation.z=-.32*s*amp;F.skirt.rotation.z=.045*s*amp+.012*Math.sin(t*1.2);
    F.armL.rotation.z=-.04+.3*s*amp+.02*Math.sin(t*1.3);if(!L.stav)F.armR.rotation.z=.04-.3*s*amp-.02*Math.sin(t*1.3);F.gStaff.position.y=.35*Math.abs(Math.sin(ph))*amp;F.armR.position.y=S-.4+(L.stav?.2*Math.abs(Math.sin(ph))*amp:0);
    F.head.rotation.z=.03*Math.sin(t*.8)+.035*s*amp;F.hairB.rotation.z=.035*Math.sin(t*.8-.6)+.05*Math.sin(ph-.5)*amp;F.hat.rotation.z=.03*Math.sin(t*.9+1);F.gCape.rotation.z=.02*Math.sin(t*.7)+.03*s*amp;
    if(F.lids)F.lids.visible=(t%3.4)<.12;if(F.orb)F.orb.material.emissiveIntensity=1.6+.35*Math.sin(t*2.2)};
  return F.build()}
