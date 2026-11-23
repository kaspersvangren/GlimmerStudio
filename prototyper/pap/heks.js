/* ============ heksen: tre udkast side om side, bygget af papir i lag ============ */
const scene=new THREE.Scene(),live=new THREE.Scene();scene.background=new THREE.Color('#14101f');
{const e=tx(makeEnv(),true);e.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromEquirectangular(e).texture;scene.environment=env;live.environment=env;scene.environmentIntensity=live.environmentIntensity=.3;pm.dispose()}
const key=new THREE.DirectionalLight('#ffe2c4',2.3);key.position.set(-25,60,120);key.target.position.set(0,16,0);scene.add(key,key.target);
key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-50,right:50,top:50,bottom:-12,near:40,far:260});key.shadow.bias=-.0004;key.shadow.normalBias=.04;key.shadow.radius=3;
scene.add(new THREE.HemisphereLight('#a9b4ff','#3a2a20',.55));
{const rim=new THREE.DirectionalLight('#9fb6ff',.9);rim.position.set(50,40,-60);scene.add(rim)}
{const l=new THREE.HemisphereLight('#a9b4ff','#3a2a20',.8);live.add(l)}
const SPOTS={};const BUILD=[];
const starPts=(x,y,r1,r2,rot=0)=>{const o=[];for(let i=0;i<10;i++){const a=Math.PI/2+rot+i/10*TAU,r=i%2?r2:r1;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}return o};
/* figurens stykker får en mørk snitkant, som en fin tuschstreg rundt om hver del */
const pc=(parent,shape,o,z=0)=>put(parent,piece(shape,Object.assign({edge:o.mat?undefined:hexOf(shade(hexOf(o.color||o.ed||'#5a4070'),-.55))},o)),0,0,z);
const flatP=(shape,o,x,y,z)=>{const m=piece(shape,o);m.rotation.x=-Math.PI/2;return put(scene,m,x,y,z)};
const sm=(cp,seg=8)=>outline(cp,seg,0);
const C={skin:'#f7d8c4',skinSh:'#e6b29a',hair:'#eab84e',hairLt:'#f8dc8c',hairDk:'#c08628',purple:'#6a3fa2',purpleLt:'#8d62c8',purpleDk:'#4e2c80',navy:'#2b3468',navyLt:'#3f4b8c',gold:'#e2b85a',brown:'#7a4a2a',brownDk:'#4e2e18',cream:'#f4ead2',lilac:'#cfb6ee',teal:'#2f8f86',pink:'#e88aa8'};

/* ---- ansigtet: akvarelhud, kinder og fregner, øjne med iris og lys, øjenbryn, næse og smil ---- */
function faceShape(cx,cy,w,h){const o=[];for(let i=0;i<=24;i++){const a=Math.PI+i/24*Math.PI,x=Math.cos(a),y=Math.sin(a);o.push([cx+x*w/2*(1-.12*y*y),cy+h*.04+y*h*.54*(1-.08*x*x)])}for(let i=1;i<12;i++){const a=i/12*Math.PI;o.push([cx+Math.cos(a)*w/2,cy+h*.04+Math.sin(a)*h*.46])}return toCCW(o)}
function drawFace(P,{cx,cy,w,h,eyeW,eyeH,irisC=['#9be0a6','#2f7a44'],lash=1,freck=true,smile=.18,brow=C.hairDk,lips='#c4545e'}){const g=P.g,s=P.s,X=x=>P.X(x),Y=y=>P.Y(y);
  const F=faceShape(cx,cy,w,h);P.wash(C.skin,F,{edge:.28,clouds:5,grain:.1,top:'#fbe4d4'});
  P.wash(C.skinSh,sm([[-w/2,cy+h*.5],[w/2,cy+h*.5],[w/2,cy+h*.18],[0,cy+h*.3],[-w/2,cy+h*.18]],6),{alpha:.35,edge:.6,clouds:0});
  for(const sx of[-1,1]){const bx=X(cx+sx*w*.29),by=Y(cy-h*.14),r=w*.16*s,gr=g.createRadialGradient(bx,by,0,bx,by,r);gr.addColorStop(0,'rgba(240,120,120,.5)');gr.addColorStop(1,'rgba(240,120,120,0)');g.fillStyle=gr;g.fillRect(bx-r,by-r,2*r,2*r);
    if(freck)for(let k=0;k<11;k++){g.fillStyle='rgba(190,120,90,.5)';g.beginPath();g.arc(bx+R(-.6,.6)*r,by+R(-.32,.32)*r,R(.006,.011)*w*s,0,TAU);g.fill()}}
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

/* ---- en heks i tre udgaver ---- */
function buildWitch(v){const G=new THREE.Group();
  const T=26,hh=v.hh,w=hh*.82,cx=0,cy=T-hh/2,S=T-hh-v.neck,sw=v.sw,Wy=S-v.torso,ww=v.ww,hem=v.hem,hw=v.hw;
  /* hår bagved */
  const hb=v.hairBack(w,cy,hh,S,Wy);pc(G,hb,{t:.25,s:26,paint:P=>{P.wash(C.hair,hb,{top:C.hairLt,edge:.5,clouds:8});for(let k=0;k<26;k++){const x=R(-w*.75,w*.75),y0=cy+hh*.3,y1=R(S-4,S-8);P.score(curve([[x,y0],[x+R(-.6,.6),(y0+y1)/2],[x+R(-.9,.9),y1]],6),{w:.06,ink:.35,dark:k%3?C.hairDk:'#fff2c0'})}}},-1.1);
  /* kappe bagved */
  if(v.cape)pc(G,v.cape(sw,S,hem,hw),{t:.2,s:22,paint:P=>{const o=v.cape(sw,S,hem,hw);P.wash(C.navy,o,{top:C.navyLt,edge:.6,clouds:8});for(let k=0;k<7;k++){const x=R(-hw,hw);P.score([[x*.4,S],[x,hem+1]],{w:.08,ink:.3,dark:'#141a3a'})}}},-.8);
  /* ben og støvler */
  if(v.legs)for(const sx of[-1,1]){const lg=box(sx*1.15-.62,2,sx*1.15+.62,hem+.4);pc(G,lg,{t:.15,s:40,paint:P=>{P.flat(C.cream);for(let y=2;y<hem+.4;y+=.7)P.flat(C.purpleDk,box(-9,y,9,y+.35),.85)}},-.1)}
  for(const sx of[-1,1]){const x=sx*1.15,bh=v.bootH,bt=sm([[x-.85,.12],[x-.6,-.04],[x+.6,-.04],[x+.85,.12],[x+.82,.9],[x+.72,bh,1],[x-.72,bh,1],[x-.82,.9]],6);
    pc(G,toCCW(bt),{t:.3,s:40,paint:P=>{P.wash(C.brown,toCCW(bt),{edge:.5,top:'#9a6438'});for(let y=1.1;y<bh-.2;y+=.55)P.pen([[x-.45,y],[x+.45,y+.4]],C.cream,.07,.9),P.pen([[x+.45,y],[x-.45,y+.4]],C.cream,.07,.9)}},0);
    pc(G,sm([[x-.92,-.08],[x+.92,-.08],[x+.95,.3],[x-.95,.3]],3),{color:C.brownDk,t:.34},.02);if(v.cuff)pc(G,box(x-.95,bh-.7,x+.95,bh+.25),{color:'#8a5a34',kind:'water',t:.36},.04)}
  /* skørt */
  const sk=v.skirt(ww,Wy,hw,hem);pc(G,sk,{t:.2,s:22,paint:P=>{P.wash(C.purple,sk,{top:C.purpleLt,edge:.5,clouds:10});for(let k=0;k<9;k++){const x=mix(-ww,ww,k/8);P.score([[x,Wy-.5],[x*hw/ww*1.02,hem+.8]],{w:.07,ink:.25,dark:C.purpleDk})}
    for(let k=0;k<v.stars;k++)P.fill(starPts(R(-hw*.85,hw*.85),R(hem+1,Wy-1),R(.28,.45),.13,R(1)),C.gold,.9)}},.2);
  if(v.under)pc(G,v.under(hw,hem),{color:C.lilac,kind:'water',t:.16},.1);
  pieces(thick([curve(v.hemLine(hw,hem),8)],.22),{mat:gold(),t:.08},G,0,0,.32);
  /* overdel */
  const bd=sm([[-sw,S],[sw,S],[sw*.95,S-1.2],[ww*1.02,Wy+.2,1],[ww,Wy-.4,1],[-ww,Wy-.4,1],[-ww*1.02,Wy+.2,1],[-sw*.95,S-1.2]],6);
  pc(G,bd,{t:.2,s:30,paint:P=>{P.wash(v.bodice||C.purple,bd,{top:C.purpleLt,edge:.5});if(v.lacing)for(let y=Wy+.4;y<S-1.4;y+=.55){P.fill(circ(-.32,y,.09,.09,8),C.gold,1);P.fill(circ(.32,y,.09,.09,8),C.gold,1);P.pen([[-.32,y],[.32,y+.55]],C.cream,.05,.9)}}},.3);
  /* bælte, taske og rem */
  if(v.belt){pc(G,box(-ww-.15,Wy-.45,ww+.15,Wy+.35),{color:C.brown,kind:'water',t:.12},.42);pieces(ring(box(-.5,Wy-.55,.5,Wy+.45),.16,false),{mat:gold(),t:.1},G,0,0,.48);
    pc(G,sm([[ww*.45,Wy-.4,1],[ww*.45+1.5,Wy-.4,1],[ww*.45+1.5,Wy-1.8],[ww*.45+.75,Wy-2.1],[ww*.45,Wy-1.8]],5),{color:'#8a5432',kind:'water',t:.3},.5)}
  if(v.sash){pc(G,box(-ww-.1,Wy-.4,ww+.1,Wy+.3),{color:C.lilac,kind:'water',t:.1},.42);pc(G,sm([[0,Wy],[-1.2,Wy+.7],[-1.4,Wy-.4],[0,Wy-.1],[1.4,Wy-.4],[1.2,Wy+.7]],5),{color:C.lilac,kind:'water',t:.08},.5);pc(G,sm([[-.2,Wy-.1],[-.8,Wy-2.6],[-.3,Wy-2.4],[0,Wy-.3],[.3,Wy-2.6],[.8,Wy-2.4],[.2,Wy-.1]],5),{color:'#bfa1e2',kind:'water',t:.06},.46)}
  if(v.satchel){pieces(thick([[[-sw+.5,S-.2],[ww+.8,Wy-.8]]],.28),{color:'#8a5432',kind:'water',t:.08},G,0,0,.6);
    pc(G,sm([[ww+.2,Wy-.2,1],[ww+3.2,Wy-.2,1],[ww+3.2,Wy-2.8],[ww+2.8,Wy-3.2],[ww+.6,Wy-3.2],[ww+.2,Wy-2.8]],5),{color:'#8a5432',kind:'water',t:.5},.62);pc(G,sm([[ww+.1,Wy-.1,1],[ww+3.3,Wy-.1,1],[ww+3.1,Wy-1.6],[ww+1.7,Wy-2],[ww+.3,Wy-1.6]],5),{color:'#a0643c',kind:'water',t:.1},.92);pc(G,box(ww+1.45,Wy-2.1,ww+1.95,Wy-1.55),{mat:gold(),t:.1},1)}
  /* hals */
  const nk=sm([[-w*.15,S-.3,1],[w*.15,S-.3,1],[w*.13,cy-hh*.38,1],[-w*.13,cy-hh*.38,1]],2);pc(G,nk,{t:.16,s:50,paint:P=>{P.wash(C.skin,nk,{edge:.3});P.wash(C.skinSh,box(-2,cy-hh*.5,2,cy-hh*.38),{alpha:.5,edge:0})}},.25);
  /* krave */
  v.collar(G,sw,S,w,cy,hh);
  /* arme: venstre hænger, højre holder staven */
  const arm=(pts,cuffAt,hand,flip,z)=>{pc(G,sm(pts,6),{color:C.purple,kind:'water',t:.18},z);pc(G,sm(cuffAt,4),{mat:gold(),t:.1},z+.06);const hs=sm(hand,6);pc(G,hs,{t:.12,s:60,paint:P=>{P.wash(C.skin,hs,{edge:.35})}},z+.12)};
  const sl=v.sleeve;arm([[-sw+.3,S+.1],[-sw-.7,S-.6],[-sw-1.3,Wy-1.4],[-sw-1.3-sl,Wy-2.4],[-sw+.3,Wy-2.2],[-sw+.6,S-1.4]],[[-sw-1.35-sl,Wy-2.2],[-sw+.35,Wy-2],[-sw+.3,Wy-2.6],[-sw-1.35-sl,Wy-2.75]],[[-sw-1.05,Wy-2.55],[-sw+.05,Wy-2.55],[-sw+.25,Wy-3.4],[-sw+.05,Wy-4.25],[-sw-.45,Wy-4.6],[-sw-.95,Wy-4.3],[-sw-1.3,Wy-3.5],[-sw-1.55,Wy-3.05],[-sw-1.3,Wy-2.85]],1,.55);
  const hx=sw+2.2;arm([[sw-.3,S+.1],[sw+.8,S-.6],[sw+1.4,Wy+.8],[hx+.2,Wy+1.2],[hx+.3,Wy+.1],[sw+.2,Wy+.1],[sw-.6,S-1.4]],[[hx-.3,Wy+1.35],[hx+.25,Wy+1.3],[hx+.35,Wy],[hx-.2,Wy-.05]],[[hx,Wy+1.2],[hx+1.2,Wy+1.2],[hx+1.4,Wy+.4],[hx+1.1,Wy-.2],[hx+.1,Wy-.1]],-1,.6);
  /* staven med glødende kugle */
  const stx=hx+.75,sTop=S+3.6;{const st=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,sTop,12),paperMat('#8a5a3a','balsa'));st.castShadow=true;put(G,st,stx,sTop/2,.66);
    for(let k=0;k<6;k++){const y=Wy-1.8-k*.42;pieces(thick([[[stx-.32,y],[stx+.32,y+.3]]],.07),{color:C.pink,t:.04},G,0,0,.8)}
    pieces(thick([curve([[stx,sTop],[stx-1.2,sTop+.8],[stx-.9,sTop+2.2],[stx-.2,sTop+2.9]],6),curve([[stx,sTop],[stx+1.2,sTop+.8],[stx+.9,sTop+2.2],[stx+.2,sTop+2.9]],6)],.12),{mat:gold(),t:.12},G,0,0,.66);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(1.05,32,20),new THREE.MeshStandardMaterial({color:'#c9f1ff',emissive:'#5fc6ff',emissiveIntensity:1.8,roughness:.2}));put(G,orb,stx,sTop+1.6,.66)}
  /* hoved */
  const F=faceShape(cx,cy,w,hh);pc(G,F,{t:.2,s:80,cap:1024,paint:P=>drawFace(P,{cx,cy,w,h:hh,eyeW:w*v.eye,eyeH:w*v.eye*.78,lash:v.lash,freck:true,smile:v.smile})},.4);
  /* hår foran */
  v.hairFront(G,w,cy,hh,S,Wy);
  /* hat */
  const hy=cy+hh*.36,bw=w*v.brim;const crown=sm([[-w*.48,hy+.3],[w*.48,hy+.3],[w*.36,hy+3.4],[w*.26,hy+6.2],[w*.5,hy+7.9],[w*.86,hy+8.1],[w*.98,hy+7.6],[w*.86,hy+8.7],[w*.46,hy+8.9],[.1,hy+7.2],[-w*.28,hy+3.4]],6);
  pc(G,crown,{t:.25,s:30,paint:P=>{P.wash(C.purple,crown,{top:C.purpleLt,edge:.55,clouds:8});for(const c of[[[-w*.3,hy+2.4],[0,hy+2.7],[w*.28,hy+2.3]],[[-w*.15,hy+5],[w*.1,hy+5.4]]])P.score(curve(c,6),{w:.07,ink:.3,dark:C.purpleDk})}},.5);
  pc(G,sm([[-w*.5,hy+.3],[w*.5,hy+.3],[w*.47,hy+1.3],[-w*.47,hy+1.3]],2),{color:v.band||C.navy,kind:'water',t:.08},.62);
  pc(G,starPts(w*.05,hy+.82,.55,.24),{mat:gold(),t:.08},.7);
  if(v.patch){const pt=box(-w*.32,hy+3.2,-w*.08,hy+4.4);pc(G,pt,{t:.06,s:80,paint:P=>{P.flat(C.pink);P.score([...box(-w*.3,hy+3.28,-w*.1,hy+4.32),[-w*.3,hy+3.28]],{w:.04,ink:.6,dark:'#fff'})}},.62)}
  if(v.feather){const fp=leafPts(w*.55,hy+3.2,5.2,1.2,-.5);pc(G,fp,{t:.05,s:60,paint:P=>{P.wash(C.teal,fp,{edge:.5,top:'#5fc0b4'});for(let k=0;k<12;k++){const t=k/12;P.pen([[w*.55+Math.sin(.5)*(t-.5)*5.2,hy+3.2+Math.cos(.5)*(t-.5)*5.2],[w*.55+Math.sin(.5)*(t-.5)*5.2+.5,hy+3.2+Math.cos(.5)*(t-.5)*5.2-.3]],'#1f5f5a',.04,.6)}}},.58)}
  const brim=sm([[-bw,hy+.2],[-bw*.6,hy-.25],[0,hy-.38],[bw*.6,hy-.25],[bw,hy+.2],[bw*.62,hy+.85],[0,hy+.98],[-bw*.62,hy+.85]],8);
  pc(G,brim,{t:.22,s:30,paint:P=>{P.wash(C.purpleDk,brim,{top:C.purple,edge:.5});P.pen(curve([[-bw*.9,hy+.3],[0,hy-.18],[bw*.9,hy+.3]],8),C.purpleLt,.1,.6)}},.95);
  G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return G}

/* ---- de tre udkast ---- */
const longBack=(w,cy,h,S,Wy)=>sm([[-w*.62,cy+h*.1],[-w*.72,cy-h*.4],[-w*.8,S-2],[-w*.74,S-6.6],[-w*.35,S-7.4],[0,S-6.8],[w*.35,S-7.4],[w*.74,S-6.6],[w*.8,S-2],[w*.72,cy-h*.4],[w*.62,cy+h*.1],[w*.5,cy+h*.46],[0,cy+h*.62],[-w*.5,cy+h*.46]],8);
const bangs=(G,w,cy,h,col)=>{const b=sm([[-w*.56,cy+h*.1],[-w*.52,cy+h*.42],[0,cy+h*.6],[w*.52,cy+h*.42],[w*.56,cy+h*.1],[w*.44,cy+h*.22],[w*.3,cy+h*.12],[w*.14,cy+h*.26],[0,cy+h*.2],[-w*.18,cy+h*.28],[-w*.33,cy+h*.13],[-w*.46,cy+h*.24]],6);
  pc(G,b,{t:.14,s:40,paint:P=>{P.wash(col||C.hair,b,{top:C.hairLt,edge:.5});for(let k=0;k<10;k++){const x=R(-w*.45,w*.45);P.score(curve([[x*.3,cy+h*.55],[x*.8,cy+h*.38],[x,cy+h*.2]],5),{w:.05,ink:.35,dark:C.hairDk})}}},.68)};
const lock=(G,pts,z)=>{const L=sm(pts,6);pc(G,L,{t:.12,s:40,paint:P=>{P.wash(C.hair,L,{top:C.hairLt,edge:.5});for(let k=0;k<4;k++){const o=k*.25-.4;P.score(pts.slice(0,Math.ceil(pts.length/2)).map(([x,y])=>[x+o,y]),{w:.05,ink:.35,dark:C.hairDk})}}},z)};
const navyCollar=(G,sw,S,w,cy,h)=>{const c=sm([[-sw-.4,S+.25],[sw+.4,S+.25],[sw*.95,S-1.5],[sw*.4,S-2.2],[0,S-2.4],[-sw*.4,S-2.2],[-sw*.95,S-1.5]],6);pc(G,c,{t:.16,s:30,paint:P=>{P.wash(C.navy,c,{top:C.navyLt,edge:.5});const e=grow(c,-.25)[0].outer;for(let k=0;k<e.length;k+=3)P.fill(circ(e[k][0],e[k][1],.08,.08,6),C.gold,1)}},.5);pc(G,starPts(0,S-1.25,.7,.3),{mat:gold(),t:.1},.6)};
const VARIANTS=[
 {name:'A · Yndig',hh:7.1,neck:1,sw:3,torso:4.3,ww:2.05,hem:.9,hw:5.6,eye:.27,lash:1,smile:.17,brim:1.28,stars:16,belt:1,patch:1,bootH:2.6,sleeve:.7,
  hairBack:longBack,cape:(sw,S,hem,hw)=>sm([[-sw-.2,S],[sw+.2,S],[hw+1.4,hem+.3],[0,hem-.2],[-hw-1.4,hem+.3]],6),
  skirt:(ww,Wy,hw,hem)=>sm([[-ww,Wy+.2,1],[ww,Wy+.2,1],[hw*.8,hem+3],[hw,hem],[hw*.5,hem-.25],[0,hem-.1],[-hw*.5,hem-.25],[-hw,hem],[-hw*.8,hem+3]],6),
  hemLine:(hw,hem)=>[[-hw,hem+.05],[-hw*.5,hem-.2],[0,hem-.05],[hw*.5,hem-.2],[hw,hem+.05]],collar:navyCollar,
  hairFront:(G,w,cy,h,S,Wy)=>{bangs(G,w,cy,h);for(const sx of[-1,1])lock(G,[[sx*w*.54,cy+h*.22],[sx*w*.62,cy-h*.2],[sx*w*.6,S-.6],[sx*w*.66,S-2.6],[sx*w*.52,S-4.2],[sx*w*.44,S-2.8],[sx*w*.48,S-.8],[sx*w*.42,cy-h*.3],[sx*w*.44,cy+h*.12]],.66)}},
 {name:'B · Eventyrer',hh:6.2,neck:1.1,sw:3.1,torso:4.7,ww:2.15,hem:8,hw:4.2,eye:.24,lash:1,smile:.2,brim:1.25,stars:6,belt:1,patch:1,feather:1,satchel:1,legs:1,cuff:1,bootH:5.2,sleeve:.2,band:'#7a4a2a',
  hairBack:(w,cy,h,S,Wy)=>sm([[-w*.6,cy+h*.1],[-w*.68,cy-h*.4],[-w*.62,S-.8],[0,S-1.2],[w*.62,S-.8],[w*.68,cy-h*.4],[w*.6,cy+h*.1],[w*.5,cy+h*.46],[0,cy+h*.62],[-w*.5,cy+h*.46]],8),
  cape:(sw,S,hem,hw)=>sm([[-sw-.3,S],[sw+.3,S],[sw+1.6,S-6],[0,S-6.6],[-sw-1.6,S-6]],6),
  skirt:(ww,Wy,hw,hem)=>sm([[-ww,Wy+.2,1],[ww,Wy+.2,1],[hw,hem],[hw*.4,hem-.3],[-hw*.4,hem-.3],[-hw,hem]],6),
  hemLine:(hw,hem)=>[[-hw,hem],[0,hem-.3],[hw,hem]],
  collar:(G,sw,S,w,cy,h)=>{const sc=sm([[-sw*.7,S+.3],[sw*.7,S+.3],[sw*.75,S-.6],[0,S-1.1],[-sw*.75,S-.6]],6);pc(G,sc,{color:'#c4573e',kind:'water',t:.14},.52);pc(G,sm([[sw*.3,S-.6],[sw*.75,S-.7],[sw*.9,S-3.2],[sw*.55,S-3.4],[sw*.35,S-1.5]],5),{color:'#b24a34',kind:'water',t:.08},.55)},
  hairFront:(G,w,cy,h,S,Wy)=>{bangs(G,w,cy,h);for(let k=0;k<10;k++){const y=S+.4-k*.85,x=-w*.55+Math.sin(k*.45)*.2,sz=.95-k*.03;pc(G,leafPts(x+(k%2?.22:-.22)*sz,y,1.35*sz,.95*sz,(k%2?-1:1)*.75),{color:k%2?C.hair:'#f0c862',kind:'water',t:.06},.64+k*.004)}pc(G,sm([[-w*.55-.6,S-8.1],[-w*.55+.6,S-8.1],[-w*.55+.3,S-9.4],[-w*.55-.3,S-9.4]],4),{color:C.hair,kind:'water',t:.08},.66);pc(G,sm([[-w*.55-.55,S-7.7],[-w*.55+.55,S-7.7],[-w*.55+.9,S-8.4],[-w*.55-.9,S-8.4]],4),{color:C.teal,kind:'water',t:.1},.7)}},
 {name:'C · Elegant',hh:5.6,neck:1.5,sw:2.8,torso:5.2,ww:1.7,hem:1.1,hw:6.1,eye:.22,lash:2,smile:.15,brim:1.4,stars:10,sash:1,lacing:1,bootH:2.2,sleeve:1.3,bodice:'#5a3290',
  hairBack:(w,cy,h,S,Wy)=>{const o=[[-w*.62,cy+h*.1],[-w*.72,cy-h*.4]];for(let k=0;k<6;k++)o.push([-w*.8-(k%2?.5:0),S-1-k*1.5]);o.push([-w*.3,S-9.6],[0,S-9],[w*.3,S-9.6]);for(let k=5;k>=0;k--)o.push([w*.8+(k%2?.5:0),S-1-k*1.5]);o.push([w*.72,cy-h*.4],[w*.62,cy+h*.1],[w*.5,cy+h*.46],[0,cy+h*.62],[-w*.5,cy+h*.46]);return sm(o,8)},
  cape:(sw,S,hem,hw)=>sm([[-sw-.2,S],[sw+.2,S],[hw+2,hem+.2],[0,hem-.4],[-hw-2,hem+.2]],6),
  skirt:(ww,Wy,hw,hem)=>sm([[-ww,Wy+.2,1],[ww,Wy+.2,1],[hw*.7,hem+4],[hw,hem+.6],[hw*.45,hem+1.2],[0,hem+2.4],[-hw*.45,hem+1.2],[-hw,hem+.6],[-hw*.7,hem+4]],6),
  under:(hw,hem)=>{const o=[[-hw*.85,hem+3],[hw*.85,hem+3]];for(let k=0;k<=10;k++){const x=hw*.95-k*hw*.19;o.push([x,hem+(k%2?-.35:.05)])}return toCCW(o)},
  hemLine:(hw,hem)=>[[-hw,hem+.6],[-hw*.45,hem+1.2],[0,hem+2.4],[hw*.45,hem+1.2],[hw,hem+.6]],
  collar:(G,sw,S,w,cy,h)=>{pc(G,sm([[-w*.24,S-.2],[w*.24,S-.2],[w*.3,S+1.2],[-w*.3,S+1.2]],3),{color:C.navy,kind:'water',t:.08},.18);const cp=sm([[-sw-.6,S+.2],[sw+.6,S+.2],[sw+1.1,S-2.8],[sw*.4,S-3.4],[0,S-3.6],[-sw*.4,S-3.4],[-sw-1.1,S-2.8]],6);pc(G,cp,{t:.16,s:30,paint:P=>{P.wash(C.navy,cp,{top:C.navyLt,edge:.5});P.pen(grow(cp,-.2)[0].outer.concat([grow(cp,-.2)[0].outer[0]]),C.gold,.07,.9)}},.5);pc(G,ring(cp,.18)[0],{color:C.lilac,kind:'water',t:.08},.46);for(const sx of[-1,1])pc(G,circ(sx*.9,S-.8,.32,.32,16),{mat:gold(),t:.1},.62);pieces(thick([curve([[-.9,S-.8],[0,S-1.4],[.9,S-.8]],6)],.06),{mat:gold(),t:.06},G,0,0,.64)},
  hairFront:(G,w,cy,h,S,Wy)=>{const b=sm([[-w*.56,cy+h*.05],[-w*.5,cy+h*.44],[0,cy+h*.6],[w*.52,cy+h*.42],[w*.56,cy+h*.12],[w*.2,cy+h*.3],[-w*.25,cy+h*.18]],6);pc(G,b,{t:.14,s:40,paint:P=>{P.wash(C.hair,b,{top:C.hairLt,edge:.5});for(let k=0;k<8;k++){const x=R(-w*.4,w*.4);P.score(curve([[x-.5,cy+h*.55],[x,cy+h*.35],[x+.6,cy+h*.2]],5),{w:.05,ink:.35,dark:C.hairDk})}}},.68);
   const wl=[];for(let k=0;k<7;k++)wl.push([w*.66+(k%2?.4:0),cy+h*.2-k*1.2]);wl.push([w*.5,cy+h*.2-7.6]);for(let k=6;k>=0;k--)wl.push([w*.46+(k%2?.3:-.02)+(k===0?.06:0),cy+h*.2-k*1.2]);lock(G,wl,.66);
   pc(G,sm([[w*.45,cy+h*.42],[w*.9,cy+h*.75],[w*1.05,cy+h*.35],[w*.6,cy+h*.3]],4),{color:C.lilac,kind:'water',t:.08},-.85)}}];

const FIG=[];
BUILD.push(()=>{/* bagtæppe og scene */
  {const bd=put(scene,piece(box(-70,-4,70,60),{t:.3,s:10,cap:1600,base:'water',paint:P=>{P.wash('#241a3e',null,{top:'#120e26',edge:0,clouds:12});for(const x of[-28,0,28]){const g=P.g,cx=P.X(x),cy=P.Y(16),r=16*P.s,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'rgba(120,90,170,.55)');gr.addColorStop(1,'rgba(120,90,170,0)');g.fillStyle=gr;g.fillRect(cx-r,cy-r,2*r,2*r)}
    for(let i=0;i<160;i++)P.fill(rnd()<.7?circ(R(-70,70),R(10,60),R(.08,.16),R(.08,.16),6):starPts(R(-70,70),R(14,60),R(.3,.5),.13,R(1)),'#f6e7c0',R(.5,.9))}}),0,0,-14);bd.receiveShadow=false}
  for(let i=0;i<14;i++)flatP(box(-60,-.5,60,.5).map(([x,y])=>[x,y+i*1.05-7]),{color:shade('#8a5a3a',R(-.06,.06)),kind:'balsa',t:.3},0,0,0);
  VARIANTS.forEach((v,i)=>{const g=buildWitch(v);put(scene,g,(i-1)*28,.15,0);FIG.push(g);plate(scene,'n'+i,v.name,FONT.pil,10,1.6,{bg:'#2a1d14',fg:'#f6e7c0',frame:'gold',size:.95,x:(i-1)*28,y:-.2,z:5.6})});
  for(const x of[-14,14]){const L=new THREE.PointLight('#ffc98a',40,40,2);put(scene,L,x,30,14)}});

/* ---- kamera, bagning og et lille levende lag (glimt omkring kuglerne) ---- */
const cam=new THREE.PerspectiveCamera(30,1,20,600),CD=150;
let VIEW=0;const VIEWS=[{W:92,H:41,y:15.5,x:0},{W:20,H:15,y:24.5,x:-28},{W:20,H:15,y:24.5,x:0},{W:20,H:15,y:24.5,x:28}];
const ST=makeStage({cam,CD,fit:(c,w,h)=>{const V=VIEWS[VIEW],asp=w/h;const H=Math.max(V.H,V.W/asp);c.fov=2*Math.atan(H/2/CD)*180/Math.PI;c.position.set(V.x,V.y+1+CD*Math.sin(.12),CD*Math.cos(.12));c.lookAt(V.x,V.y,0)},P_:{aoR:.35,dof:[.06,.16],haze:[1.1,1.4,.25],hazeC:[.06,.05,.12],bloom:1.2,bg:'#120e1c'}});
const sparks=[];
(async()=>{try{const fams=['Alegreya SC'];try{await Promise.race([Promise.all(fams.map(f=>document.fonts.load(`700 40px "${f}"`).catch(()=>{}))),new Promise(r=>setTimeout(r,3000))])}catch(_){}
  for(const b of BUILD){await new Promise(r=>setTimeout(r,0));b()}
  scene.updateMatrixWorld(true);
  for(const g of FIG){let orb=null;g.traverse(o=>{if(o.geometry&&o.geometry.type==='SphereGeometry')orb=o});if(!orb)continue;const p=new THREE.Vector3();orb.getWorldPosition(p);
    const c=cv(64,64),x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(190,240,255,.9)');gr.addColorStop(1,'rgba(120,200,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);const t=tx(c,true);
    for(let i=0;i<7;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));live.add(s);sparks.push({s,p,ph:R(TAU),r:R(1.6,3),sp:R(.5,1.1)})}
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.copy(p);halo.scale.set(6,6,1);live.add(halo)}
  ST.bake();msg.classList.add('gone');let t=0,last=performance.now();
  const loop=now=>{requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;t+=dt;for(const k of sparks){const a=t*k.sp+k.ph;k.s.position.set(k.p.x+Math.cos(a)*k.r,k.p.y+Math.sin(a*1.3)*k.r*.7,k.p.z+1);const z=.35+.25*Math.sin(a*3);k.s.scale.set(z,z,1)}ST.draw()};requestAnimationFrame(loop);
  const vb=document.getElementById('vbtn');if(vb)vb.addEventListener('click',()=>{VIEW=(VIEW+1)%4;vb.textContent=['Tæt på A','Tæt på B','Tæt på C','Alle tre'][VIEW];ST.bake();for(const k of sparks)k.s.visible=true});
  window.__heks={ready:true,bakeMs:ST.bakeMs,view:v=>{VIEW=v;ST.bake()}}}catch(e){msgN.textContent='Fejl: '+e.message;console.error(e)}})();
