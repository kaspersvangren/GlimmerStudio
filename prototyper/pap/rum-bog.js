/* ============ eventyrbogen i starten, i pap (Kasper 23. nov.: bogen skal have den nye grafiske stil og kvalitet) ============
   En rigtig bog ligger opslået på et skrivebord i stearinlysets skær. Det er en pop-up-bog: på hver venstreside rejser en lille scene af pap
   sig op, når man kommer til opslaget, og lægger sig ned igen, før siden vendes. Siderne vendes rigtigt om ryggen.
   Teksten er originalens. På første side skriver man sit navn på spillets eget tastatur, og det står med blæk på siden.
   Til sidst lukkes bogen, og bogstaverne til titlen kommer flyvende og virvlende ind i en regn af stjernestøv og lander på forsiden
   (Kaspers ønske). Så laver man sin heks i Garderoben. */
ROOMS.bog=function(ctx){
  const P2=(g,sh,o,z)=>put(g,piece(sh,o),0,0,z);
  const SIDER=[
    {art:'portraet',lines:[['big','Hej med dig!'],['name','Jeg hedder'],['','og jeg vil gerne invitere dig ind i min verden.']]},
    {art:'hat',lines:[['','Min verden er ikke helt almindelig.'],['','For jeg er heller ikke helt almindelig …'],['big','Jeg er nemlig en heks!']]},
    {art:'slot',v:true,lines:[['','Jeg går i skole, ligesom dig.'],['big','Men min skole er en magisk skole!']]},
    {art:'kost',lines:[['','Vi flyver på koste, brygger eliksirer og springer i faldskærm fra skyerne.'],['','Og nogle gange hygger vi os bare.']]},
    {art:'doer',lines:[['','Kunne du tænke dig at tage med?'],['','Så følg mig …'],['big','eller skulle jeg sige …']]}];
  SIDER.forEach(q=>q.v=true);
  const PW=21,PH=28,PY=2.05,BLAEK='#3a2412';
  let Rm=null,aaben=false,ryg=null,bog,venstre,hoejre,sideV,sideH,blad=null,pop=null,popNy=null,i=0,navn=SPIL.navn||'',travl=false,lukket=false,bogst=[],stoev=[],tiden=0,fase=null;
  /* ---------- siderne: papir med tekst, tegnet på et lærred ---------- */
  const lag=new Map();
  function sideLaerred(n,s){const W=900,H=1200,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    g.fillStyle='#f4e9cf';g.fillRect(0,0,W,H);for(let k=0;k<900;k++){g.fillStyle=`rgba(${120+R(60)|0},${90+R(40)|0},${50},${R(.015,.05)})`;g.fillRect(R(W),R(H),R(1,3),R(1,3))}
    const rg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.8);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,'rgba(110,70,30,.22)');g.fillStyle=rg;g.fillRect(0,0,W,H);
    /* skyggen ind mod ryggen */const gx=s==='l'?W:0,lg=g.createLinearGradient(gx,0,s==='l'?W-140:140,0);lg.addColorStop(0,'rgba(70,40,15,.35)');lg.addColorStop(1,'rgba(70,40,15,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(150,100,40,.55)';g.lineWidth=3;g.strokeRect(46,46,W-92,H-92);g.lineWidth=1;g.strokeRect(58,58,W-116,H-116);
    g.fillStyle='rgba(90,60,30,.7)';g.font='600 34px "Alegreya",Georgia,serif';g.textAlign='center';g.fillText(String(n*2+(s==='l'?1:2)),W/2,H-80);
    if(SIDER[n].v){}else if(s==='l'){const fc=['#7b4fd0','#c2465e','#3d6fc2','#e2a93b','#2e9c8a'][n%5],wg=g.createRadialGradient(W/2,H*.42,20,W/2,H*.42,W*.48);wg.addColorStop(0,fc+'38');wg.addColorStop(1,fc+'00');g.fillStyle=wg;g.fillRect(0,0,W,H)}
    else{let y=190;g.textAlign='center';g.textBaseline='alphabetic';
      for(const[cls,txt]of SIDER[n].lines){if(cls==='name'){g.font='500 52px "Alegreya",Georgia,serif';g.fillStyle=BLAEK;g.fillText(txt,W/2,y+60);y+=90;
          const nv=navn||'';g.font='700 70px "Alegreya",Georgia,serif';g.fillStyle=nv?'#5a2a8a':'rgba(90,60,30,.35)';g.fillText(nv||'skriv dit navn',W/2,y+50);
          g.strokeStyle='rgba(90,60,30,.6)';g.lineWidth=3;g.beginPath();g.moveTo(W/2-250,y+72);g.lineTo(W/2+250,y+72);g.stroke();lag.set('navnY',y);y+=150;continue}
        const big=cls==='big';g.font=big?'700 66px "Alegreya",Georgia,serif':'500 50px "Alegreya",Georgia,serif';g.fillStyle=big?'#5a2a8a':BLAEK;
        const ord=txt.split(' '),lin=[];let cur='';for(const w of ord){const t=cur?cur+' '+w:w;if(g.measureText(t).width>W-200&&cur){lin.push(cur);cur=w}else cur=t}lin.push(cur);
        for(const l of lin){y+=big?84:68;g.fillText(l,W/2,y)}y+=big?60:44}
      /* en lille stjerne som slutvignet */g.fillStyle='#d9a53a';g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?9:22;g.lineTo(W/2+Math.cos(a)*r,Math.min(H-170,y+60)+Math.sin(a)*r)}g.fill()}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
  const sideMat=t=>new THREE.MeshStandardMaterial({map:t,roughness:.95,metalness:0});
  function sidePlan(t,x){const m=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),sideMat(t));m.rotation.x=-Math.PI/2;m.position.set(x,PY,0);m.receiveShadow=true;m.userData.noShadow=true;return m}
  function saetSide(m,t){if(m.material.map)m.material.map.dispose();m.material.map=t;m.material.needsUpdate=true}
  /* ---------- pop-up-opslagene: rigtige V-folds (Kasper 23. nov.: "motiver popper op, folder ud og folder sammen, når man bladrer") ----------
     Hvert lag er et stykke pap foldet på midten over ryggen. Den ene halvdel er limet på venstresiden, den anden på højresiden, så
     hvor meget det står op, afhænger kun af, hvor åben bogen er: halvt åben er det halvt rejst, og lukket ligger det fladt mellem siderne.
     Regnestykket: halvdelens bundkant ligger på siden i vinklen a fra ryggen, foldelinjen står i midterplanet, og de to er vinkelrette.
     Når opslaget næsten er lukket, trykkes pappet fladt, så det aldrig er tykkere end mellemrummet mellem siderne. Teksten står på pap i motivet. */
  const GZ=6.6,GS=.8,kort=(c,t=.25)=>({color:c,kind:'card',t,edge:hexOf(shade(c,-.4))}),INK='#2a1838',V3=THREE.Vector3,HY=PY+.32;
  function stilV(P,l,r){const be=Math.atan2(r[1],r[0]),ga=Math.atan2(l[1],l[0]),th=Math.max(1e-4,ga-be),m=(be+ga)/2,Y=new V3(Math.cos(m),Math.sin(m),0),X=new V3(Math.sin(m),-Math.cos(m),0),Z=new V3(0,0,1);
    const rv=new V3().addScaledVector(X,Math.sin(th/2)).addScaledVector(Y,Math.cos(th/2)),lv=new V3().addScaledVector(X,-Math.sin(th/2)).addScaledVector(Y,Math.cos(th/2)),fl=Math.max(.02,Math.min(1,th/.7));
    for(const q of P.lag){const a=q.a,ps=-Math.atan(Math.tan(a)*Math.cos(th/2)),f=new V3().addScaledVector(Y,Math.cos(ps)).addScaledVector(Z,Math.sin(ps));
      const eR=new V3().addScaledVector(Z,Math.cos(a)).addScaledVector(rv,Math.sin(a)),xL=new V3().addScaledVector(Z,Math.cos(a)).addScaledVector(lv,Math.sin(a)).negate();
      const o=new V3(0,HY,q.z0).addScaledVector(Y,(.015+q.k*.012)*fl);
      q.R.matrix.makeBasis(eR,f,new V3().crossVectors(eR,f).multiplyScalar(fl)).setPosition(o);q.L.matrix.makeBasis(xL,f,new V3().crossVectors(xL,f).multiplyScalar(fl)).setPosition(o);q.R.matrixWorldNeedsUpdate=q.L.matrixWorldNeedsUpdate=true}
    if(P.glows){const k=clamp((th/Math.PI-.6)/.4,0,1);for(const q of P.glows)q.s.material.opacity=k}}
  /* tekst og malerier på pap: et lærred delt over folden, så hver del sidder på sin halvdel */
  function flade(gL,gR,{x=0,y,w,h,z=.09,bg='#f4e6c2',linjer,tegn,alfa=false},P){const ppu=Math.min(150,2400/w),cw=Math.round(w*ppu),ch=Math.round(h*ppu),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;const meshes=[];
    const skriv=L=>{const g=cv.getContext('2d');g.clearRect(0,0,cw,ch);if(tegn)tegn(g,cw,ch,ppu);else{g.fillStyle=bg;g.fillRect(0,0,cw,ch);for(let k=0;k<cw*ch/700;k++){g.fillStyle=`rgba(120,90,50,${R(.02,.07)})`;g.fillRect(R(cw),R(ch),R(1,3),R(1,3))}}
      if(L){const tot=L.reduce((a,l)=>a+l.s*1.3,0);let yy=(h-tot)/2;g.textAlign='center';g.textBaseline='middle';
        for(const l of L){yy+=l.s*.65;let fs=l.s*ppu;g.font=`${l.w||600} ${fs}px "Alegreya",Georgia,serif`;while(g.measureText(l.t).width>cw*.92&&fs>8){fs*=.94;g.font=`${l.w||600} ${fs}px "Alegreya",Georgia,serif`}
          g.fillStyle=l.c||BLAEK;g.fillText(l.t,cw/2,yy*ppu);if(l.linje){const lw=Math.max(g.measureText(l.t).width,cw*.4);g.strokeStyle='rgba(90,60,30,.55)';g.lineWidth=ppu*.05;g.beginPath();g.moveTo(cw/2-lw/2,(yy+l.s*.55)*ppu);g.lineTo(cw/2+lw/2,(yy+l.s*.55)*ppu);g.stroke()}yy+=l.s*.65}}
      tex.needsUpdate=true};skriv(linjer);
    const del_=(g,x0,x1)=>{if(x1-x0<1e-3)return;const geo=new THREE.PlaneGeometry(x1-x0,h),uv=geo.attributes.uv,u0=(x0-(x-w/2))/w,u1=(x1-(x-w/2))/w;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)<.5?u0:u1);
      const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial(alfa?{map:tex,roughness:.92,transparent:true,alphaTest:.5}:{map:tex,roughness:.92}));m.position.set((x0+x1)/2,y,z);m.castShadow=true;g.add(m);meshes.push(m)};
    del_(gL,x-w/2,Math.min(0,x+w/2));del_(gR,Math.max(0,x-w/2),x+w/2);if(P)P.ryd.push(()=>{tex.dispose();for(const m of meshes){m.geometry.dispose();m.material.dispose()}});return{skriv,meshes}}
  /* fælles byggeklodser */
  function bygV(byg){const P={v:true,lag:[],ryd:[],G:new THREE.Group()};bog.add(P.G);const D=Math.PI/180;
    const lag=(a,z0,f)=>{const gL=new THREE.Group(),gR=new THREE.Group();for(const g of[gL,gR]){g.matrixAutoUpdate=false;P.G.add(g)}f(gL,gR);P.lag.push({L:gL,R:gR,a:a*D,z0,k:P.lag.length})};
    const del=(gL,gR,sh,o,z=0)=>{const subj=sh.outer?[toCCW(sh.outer),...(sh.holes||[]).map(toCW)]:[sh];for(const[g,cb]of[[gL,box(-99,-99,0,99)],[gR,box(0,-99,99,99)]])for(const q of clip(subj,[cb],'inter'))put(g,piece(q,o),0,0,z)};
    const pc=(g,sh,o,z=0)=>put(g,piece(sh,o),0,0,z),side=(gL,gR,x)=>x<0?gL:gR;
    byg({lag,del,pc,side,P});P.G.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});stilV(P,[-1,0],[1,0]);return P}
  const sten='#a89cc8',stenM='#8a7eaa',stenP=(sh,c=sten,cm=stenM)=>({t:.22,s:22,edge:'#5a5070',paint:P=>{P.wash(c,sh,{top:hexOf(shade(c,.12)),edge:.45,clouds:4});P.ashlar(null,cm,{rowH:[.55,.7],bw:[.8,1.3],tint:.07,ink:.28})}});
  const bue=(x,y,w,h)=>toCCW(sm([[x-w/2,y],[x+w/2,y],[x+w/2,y+h-w/2],[x+w*.3,y+h-w*.1],[x,y+h],[x-w*.3,y+h-w*.1],[x-w/2,y+h-w/2]],3));
  const lysP=()=>paperMat('#ffd87a','tissue',{glow:'#ffc860',gi:1.7}),flamme=(g,x,y,z,s=1)=>put(g,piece(toCCW(sm([[x-.22*s,y],[x+.22*s,y],[x+.1*s,y+.45*s],[x,y+.75*s],[x-.1*s,y+.45*s]],3)),{mat:paperMat('#ffe090','tissue',{glow:'#ffb040',gi:2}),t:.05}),0,0,z);
  const himmel=(gL,gR,del,pc,W=10,top=11)=>{const sky=toCCW(sm([[-W,0],[W,0],[W,top-4.2],[W-1.2,top-2.4],[W-3,top-1.6],[W-4.8,top-.6],[2,top-.2],[0,top],[-2,top-.2],[-W+4.8,top-.6],[-W+3,top-1.6],[-W+1.2,top-2.6],[-W,top-4.4]],5));
    del(gL,gR,sky,{t:.14,s:16,edge:'#0c1230',paint:P=>{P.wash('#1e2c64',sky,{top:'#0c1434',edge:.3,clouds:6});for(let k=0;k<110;k++)P.fill(circ(R(-W+.4,W-.4),R(3,top-.4),.05,.05,6),'#fff6d8',R(.4,1))}},0)};
  const stjerner=(gL,gR,pc,L,z=.18)=>{for(const[x,y,r]of L)pc(x<0?gL:gR,starPts(x,y,r,r*.42,0),{color:'#ffe08a',kind:'card',t:.04},z)};
  const baand=(gL,gR,del,pc,P,{y=1.6,w=15.2,h=3,linjer,z=.04})=>{const ba=box(-w/2,y,w/2,y+h);del(gL,gR,ba,{color:'#efe0b8',kind:'card',t:.06,edge:'#a8885a'},z);
    for(const s of[-1,1])pc(s<0?gL:gR,toCCW(s<0?[[-w/2+.2,y+.3],[-w/2-1.8,y-.1],[-w/2-1.1,y+h/2-.2],[-w/2-1.8,y+h-.3],[-w/2+.2,y+h-.6]]:[[w/2-.2,y+.3],[w/2-.2,y+h-.6],[w/2+1.8,y+h-.3],[w/2+1.1,y+h/2-.2],[w/2+1.8,y-.1]]),{color:'#d8c090',kind:'card',t:.08,edge:'#a8885a'},0);
    return flade(gL,gR,{y:y+h/2,w:w-.3,h:h-.2,z:z+.045,linjer},P)};
  const lygte=(g,pc,x,h=3.6)=>{pc(g,box(x-.08,0,x+.08,h),{color:'#2a2238',kind:'card',t:.08},0);pc(g,toCCW([[x-.5,h+.9],[x+.5,h+.9],[x,h+1.3]]),{color:'#2a2238',kind:'card',t:.1},0);put(g,piece(box(x-.4,h,x+.4,h+.9),{mat:paperMat('#ffe2a0','tissue',{glow:'#ffc860',gi:1.8}),t:.3}),0,0,0)};
  const sky=(g,pc,x,y,r,z=0,c='#f4f0fa')=>pc(g,puff(x,y,r*1.5,r*.75,9,.24),{color:c,kind:'card',t:.2,edge:'#b8b0cc'},z);
  const SPEC={
    /* 1: et maleri i guldramme af en hemmelighedsfuld heks, et bord med eliksirer, bøger og et lys, og et brev, hvor man skriver sit navn */
    portraet:({lag,del,pc,side,P})=>{
      lag(79,-2,(gL,gR)=>{const W=10,vg=toCCW(sm([[-W,0],[W,0],[W,9.4],[8.4,10.4],[4,11],[0,11.3],[-4,11],[-8.4,10.4],[-W,9.4]],4));
        del(gL,gR,vg,{t:.14,s:16,edge:'#2a1030',paint:P_=>{P_.wash('#4e2a62',vg,{top:'#3a1e4e',edge:.3,clouds:5});for(let y=3;y<11;y+=1.5)for(let x=-9.4+(Math.round(y/1.5)%2?.75:0);x<9.6;x+=1.5)P_.fill(starPts(x,y,.2,.08,0),'#c9a25a',.5);P_.flat('#3a1e2c',box(-W,0,W,2.6),.9);for(let x=-W;x<W;x+=1.3)P_.pen([[x,.1],[x,2.5]],'#24121c',.06,.6);P_.flat('#c9a25a',box(-W,2.55,W,2.75),.9)}},0);
        const ry=6.6,rx=3.2,rh=3.9;del(gL,gR,{outer:toCCW(circ(0,ry,rx+.85,rh+.85,56)),holes:[toCCW(circ(0,ry,rx-.05,rh-.05,56))]},{mat:gold(),t:.4},.16);
        for(const[x,y]of[[0,ry+rh+.9],[0,ry-rh-.9],[-(rx+.9),ry],[rx+.9,ry]])pc(side(gL,gR,x||(y>ry?-.01:.01)),circ(x,y,.35,.35,14),{mat:gold(),t:.3},.3);
        flade(gL,gR,{y:ry,w:rx*2,h:rh*2,z:.12,alfa:true,tegn:(g,cw,ch)=>{g.save();g.beginPath();g.ellipse(cw/2,ch/2,cw/2,ch/2,0,0,7);g.clip();const gr=g.createRadialGradient(cw/2,ch*.45,10,cw/2,ch/2,cw*.7);gr.addColorStop(0,'#8a62d0');gr.addColorStop(1,'#3a2462');g.fillStyle=gr;g.fillRect(0,0,cw,ch);
          for(let k=0;k<50;k++){g.fillStyle=`rgba(255,240,200,${R(.2,.7)})`;g.fillRect(R(cw),R(ch*.6),3,3)}g.fillStyle='#1e1230';g.beginPath();g.ellipse(cw/2,ch*1.02,cw*.4,ch*.3,0,0,7);g.fill();g.beginPath();g.ellipse(cw/2,ch*.56,cw*.16,ch*.13,0,0,7);g.fill();
          g.beginPath();g.ellipse(cw/2,ch*.45,cw*.36,ch*.04,0,0,7);g.fill();g.beginPath();g.moveTo(cw*.36,ch*.45);g.quadraticCurveTo(cw*.47,ch*.25,cw*.55,ch*.08);g.quadraticCurveTo(cw*.62,ch*.2,cw*.64,ch*.45);g.fill();
          g.fillStyle='#f2c14e';g.font=`700 ${ch*.2}px "Berkshire Swash",Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',cw/2,ch*.6);g.restore()}},P);
        for(const s of[-1,1]){const g=s<0?gL:gR,x=s*7;pc(g,box(x-.9,6.4,x+.9,6.7),{mat:gold(),t:.3},.1);pc(g,box(x-.12,5.2,x+.12,6.5),{mat:gold(),t:.15},.1);pc(g,box(x-.28,6.7,x+.28,8.2),{color:'#f6ecd8',kind:'card',t:.3,edge:'#d8c8a8'},.12);flamme(g,x,8.2,.2)}
        stjerner(gL,gR,pc,[[-8.2,10,.3],[8.4,10.2,.28]])});
      lag(78,2.6,(gL,gR)=>{const bp={t:.24,s:16,edge:'#3a2010',paint:P_=>{P_.wash('#7a4a2a',null,{top:'#8a5a34',edge:.4});for(let y=0;y<4;y+=.35)P_.pen([[-5,y],[5,y]],'#5a3420',.04,.4)}};
        del(gL,gR,box(-4.6,3.3,4.6,3.9),bp,.1);for(const x of[-4,4])pc(side(gL,gR,x),box(x-.3,0,x+.3,3.4),bp,0);del(gL,gR,box(-3.4,2.3,3.4,3.3),bp,.05);pc(gL,circ(-1.6,2.8,.14,.14,10),{mat:gold(),t:.1},.2);pc(gR,circ(1.6,2.8,.14,.14,10),{mat:gold(),t:.1},.2);
        /* eliksirer til venstre, bøger til højre og et lys i midten */
        for(const[x,h,c]of[[-3.6,1.6,'#5fe0b0'],[-2.7,2.2,'#ff8ac0'],[-1.8,1.4,'#7fd6ff']]){put(gL,piece(toCCW(sm([[x-.42,3.9],[x+.42,3.9],[x+.45,3.9+h*.55],[x+.15,3.9+h*.75],[x+.15,3.9+h],[x-.15,3.9+h],[x-.15,3.9+h*.75],[x-.45,3.9+h*.55]],3)),{mat:paperMat(c,'tissue',{glow:c,gi:1.2}),t:.3}),0,0,.15);pc(gL,box(x-.17,3.9+h,x+.17,4.15+h),{color:'#8a5a34',kind:'card',t:.2},.2)}
        for(const[y,w,c]of[[3.9,2.6,'#7a2f3a'],[4.35,2.3,'#2e4a7a'],[4.8,2.5,'#3e7a4a']])pc(gR,box(3.4-w/2,y,3.4+w/2,y+.45),{color:c,kind:'card',t:.4,edge:'#1a1018'},.15);pc(gR,box(2.1,5.25,4.6,5.35),{color:'#f6ecd8',kind:'card',t:.4},.15);
        del(gL,gR,box(-.5,3.9,.5,4.2),{mat:gold(),t:.3},.15);del(gL,gR,box(-.25,4.2,.25,5.8),{color:'#f6ecd8',kind:'card',t:.3,edge:'#d8c8a8'},.15);flamme(gR,0,5.8,.25)});
      lag(76,7,(gL,gR)=>{const br=toCCW(sm([[-7.4,.2],[7.4,.2],[7.8,.8],[7.4,1.2],[7.4,5.2],[7.9,5.6],[7.4,6.1],[-7.4,6.1],[-7.9,5.6],[-7.4,5.2],[-7.4,1.2],[-7.8,.8]],3));del(gL,gR,br,{color:'#efe0b8',kind:'card',t:.06,edge:'#a8885a'},.04);
        P.brev=flade(gL,gR,{y:3.15,w:14.4,h:5.4,z:.085},P);P.navnPkt={g:gR,v:new V3(4.6,2.5,.3)};P.navnLinjer=nv=>[{t:'Hej med dig!',s:.95,c:'#5a2a8a',w:700},{t:'Jeg hedder',s:.7},{t:nv||'skriv dit navn',s:1,c:nv?'#5a2a8a':'rgba(90,60,30,.4)',w:700,linje:true},{t:'og jeg vil gerne invitere dig ind i min verden.',s:.68}];P.brev.skriv(P.navnLinjer(navn));
        pc(gR,toCCW(sm([[6,.4],[7.2,.6],[7.6,1.6],[6.6,1.2]],2)),{color:'#c2465e',kind:'card',t:.1},.15);pc(gR,circ(6.7,1,.42,.42,16),{color:'#b8283e',kind:'card',t:.12,edge:'#6a1020'},.2)})},
    /* 2: et soveværelse med vindue og måne, et skilt med de første ord, en kæmpe heksehat, en tryllestav og et bånd: "Jeg er nemlig en heks!" */
    hat:({lag,del,pc,side,P})=>{
      lag(79,-2,(gL,gR)=>{const W=10,vg=toCCW(sm([[-W,0],[W,0],[W,9.8],[0,11.2],[-W,9.8]],2));
        del(gL,gR,vg,{t:.14,s:16,edge:'#1a2030',paint:P_=>{P_.wash('#2e3e6a',vg,{top:'#22305a',edge:.3,clouds:5});for(let x=-9.5;x<10;x+=1.1)P_.pen([[x,2.6],[x,11]],'#26345a',.08,.5);P_.flat('#4a2e1c',box(-W,0,W,2.6),.95);for(let x=-W;x<W;x+=1.6)P_.pen([[x,.1],[x,2.5]],'#2a1a10',.06,.7)}},0);
        const vi=bue(-6.4,3.6,3.4,5.2);pc(gL,vi,{t:.1,s:16,paint:P_=>{P_.wash('#141c48',vi,{top:'#0c1234',edge:0,clouds:4});for(let k=0;k<20;k++)P_.fill(circ(R(-7.8,-5),R(4,8.4),.05,.05,6),'#fff6d8',.9)}},.08);put(gL,piece(circ(-5.6,7.4,.7,.7,24),{mat:paperMat('#fff2c0','tissue',{glow:'#ffe48a',gi:1.5}),t:.05}),0,0,.14);
        pc(gL,{outer:toCCW(grow(vi,.35,false)[0].outer),holes:[vi]},{color:'#6a4426',kind:'card',t:.25},.12);pc(gL,box(-6.5,3.6,-6.3,8.8),{color:'#6a4426',kind:'card',t:.1},.18);pc(gL,box(-8.1,6.1,-4.7,6.3),{color:'#6a4426',kind:'card',t:.1},.18);
        for(const s of[-1,1]){const cu=toCCW(sm([[-6.4+s*2.4,9.2],[-6.4+s*1.4,9.2],[-6.4+s*1.8,6],[-6.4+s*1.2,3.2],[-6.4+s*2.6,3.2]],3));pc(gL,cu,{color:'#c2465e',kind:'card',t:.15,edge:'#7a2236'},.24)}
        /* skiltet på to snore */const sk=box(2.6,6.4,9.8,10.6);pc(gR,sk,{color:'#efe0b8',kind:'card',t:.1,edge:'#a8885a'},.14);for(const x of[3.4,9])pc(gR,box(x-.04,10.6,x+.04,11.2),{color:'#3a2a20',kind:'card',t:.03},.14);
        flade(gR,gR,{x:6.2,y:8.5,w:7,h:4,z:.2,linjer:[{t:'Min verden er ikke',s:.72},{t:'helt almindelig.',s:.72},{t:'For jeg er heller ikke',s:.72},{t:'helt almindelig …',s:.72}]},P)});
      lag(78,2.6,(gL,gR)=>{const brim=circ(0,1.6,7,1.6,40),hat=toCCW(sm([[-4,2],[4,2],[2.6,6],[1.8,9.4],[3.2,11.4],[5.2,12],[3,12.8,1],[.4,11.6],[-.6,8],[-2,4.6]].map(([x,y])=>[-x,y]),5));
        del(gL,gR,hat,{t:.3,s:18,edge:'#2e1a4a',paint:P_=>{P_.wash('#6b4fc0',hat,{top:'#8a6ad8',edge:.5,clouds:4});for(let k=0;k<12;k++)P_.fill(starPts(R(-3,3),R(4,11),R(.2,.35),.1,R(1)),'#f2d27a',.9)}},.1);del(gL,gR,brim,{color:'#5b3fa8',kind:'card',t:.3,edge:'#2e1a4a'},.3);
        del(gL,gR,toCCW(sm([[-3.9,2.2],[3.9,2.2],[3.5,3.6],[-3.5,3.6]],2)),{color:'#c2465e',kind:'card',t:.1,edge:'#7a2236'},.5);del(gL,gR,{outer:box(-1,2.1,1,3.7),holes:[box(-.5,2.5,.5,3.3)]},{mat:gold(),t:.12},.62);
        const st=new THREE.Group();st.position.set(-6,0,.4);st.rotation.z=.35;gL.add(st);pc(st,box(-.16,0,.16,7),{color:'#6a4128',kind:'card',t:.2},0);pc(st,starPts(0,7.8,1.3,.55,0),{color:'#f2c14e',kind:'card',t:.2,edge:'#a87a1a'},.1);
        for(const[x,y,r]of[[-3.6,9.8,.35],[-5,11,.3],[-6.6,10.2,.28],[-4.2,8.4,.22]])pc(gL,starPts(x,y,r,r*.4,R(1)),{color:'#fff0a0',kind:'card',t:.04},.4);
        /* en sort kat kigger frem under hatten */const k=new THREE.Group();k.position.set(5.6,0,.45);k.scale.x=-1;gR.add(k);pc(k,circ(0,1.3,1.3,1,20),{color:'#2d2738',kind:'card',t:.2},0);pc(k,circ(0,2.6,.85,.75,18),{color:'#2d2738',kind:'card',t:.2},.05);for(const s of[-1,1]){pc(k,toCCW([[s*.35,3.1],[s*.85,3.2],[s*.7,3.8]]),{color:'#2d2738',kind:'card',t:.2},.05);pc(k,circ(s*.32,2.7,.17,.2,12),{color:'#b7e26a',kind:'card',t:.05},.27)}
        pc(k,toCCW(sm([[1.1,.6],[2.2,1.4],[2.4,2.6],[2,2.8],[1.9,1.6],[1,1]],3)),{color:'#2d2738',kind:'card',t:.15},-.05)});
      lag(76,7,(gL,gR)=>{for(const[x,y,r]of[[-8,3.6,.5],[-6.6,4.6,.35],[6.8,4.4,.4],[8.2,3.4,.32],[-7.2,2.2,.3],[7.4,2,.28]])pc(side(gL,gR,x),starPts(x,y,r,r*.42,R(1)),{color:'#f2c14e',kind:'card',t:.06,edge:'#a87a1a'},.02);
        baand(gL,gR,del,pc,P,{y:1.2,w:13.6,h:2.4,linjer:[{t:'Jeg er nemlig en heks!',s:1.25,c:'#5a2a8a',w:700}]})})},
    /* 3: slottet */
    slot:({lag,del,pc,side,P})=>{const tag='#5e3a8a',vin=lysP();
      lag(79,-2,(gL,gR)=>{himmel(gL,gR,del,pc,10,11.1);put(gR,piece(circ(6,8.1,1.55,1.55,36),{mat:paperMat('#fff2c0','tissue',{glow:'#ffe48a',gi:1.5}),t:.12}),0,0,.16);put(gR,piece(circ(6.5,8.5,1.2,1.2,30),{color:'#1e2c64',kind:'card',t:.04}),0,0,.29);
        stjerner(gL,gR,pc,[[-7.4,9,.45],[-3.6,9.6,.35],[2.2,10,.4],[8.6,6.6,.3],[-1.4,8.2,.28]]);
        const bj=toCCW(sm([[-10,0],[10,0],[10,3.6],[8,5],[6.2,4],[4.4,5.6],[2.4,4.2],[.2,6.1],[-2.2,4.4],[-4.4,5.9],[-6.6,4],[-8.4,4.9],[-10,4.2]],3));del(gL,gR,bj,{color:'#3b3170',kind:'card',t:.1,edge:'#221a44'},.13);
        const bj2=toCCW(sm([[-10,0],[10,0],[10,2.2],[7,3.2],[4,2.4],[1,3.4],[-2,2.3],[-5,3.3],[-8,2.4],[-10,2.8]],3));del(gL,gR,bj2,{color:'#2b3a5a',kind:'card',t:.1,edge:'#18223a'},.2);
        {const g=new THREE.Group();g.position.set(5.2,7.4,.34);g.rotation.z=.15;gR.add(g);const s='#141a34';pc(g,box(-1.6,-.06,1.4,.06),{color:s,kind:'card',t:.03},0);pc(g,toCCW([[-1.6,.2],[-2.3,.35],[-2.3,-.35],[-1.6,-.2]]),{color:s,kind:'card',t:.03},0);pc(g,toCCW(sm([[-.5,0],[.4,0],[.2,.9],[-.3,1]],2)),{color:s,kind:'card',t:.03},0);pc(g,circ(0,1.2,.25,.25,10),{color:s,kind:'card',t:.03},0);pc(g,toCCW([[-.45,1.35],[.45,1.35],[-.1,2.1]]),{color:s,kind:'card',t:.03},0)}});
      lag(78,2.6,(gL,gR)=>{for(const s of[-1,1]){const g=s<0?gL:gR,x0=s*5.4,tr=box(x0-1.2,0,x0+1.2,6.4);pc(g,tr,stenP(tr),.05);for(let k=0;k<3;k++){const x=x0-1.2+k*.95;pc(g,box(x,6.4,x+.5,6.9),{color:sten,kind:'card',t:.2,edge:'#5a5070'},.05)}
          pc(g,toCCW([[x0-1.6,6.6],[x0+1.6,6.6],[x0,10]]),{t:.24,s:24,edge:'#2e1a4a',paint:P_=>{P_.wash(tag,null,{top:'#7a52a8',edge:.4});for(let y=7;y<9.6;y+=.45)P_.pen([[x0-2,y],[x0+2,y]],'#3e2460',.05,.6)}},.12);
          pc(g,box(x0-.04,9.9,x0+.04,11),{color:'#3a2a20',kind:'card',t:.05},.14);pc(g,toCCW([[x0+.04,10.95],[x0+1.1*s,10.7],[x0+.04,10.4]]),{color:s<0?'#e2384e':'#f2c14e',kind:'card',t:.04},.15);
          for(const y of[1.6,3.9])put(g,piece(bue(x0,y,.7,1.3),{mat:vin,t:.04}),0,0,.18);
          const mu=box(Math.min(s*2.8,s*4.2),0,Math.max(s*2.8,s*4.2),4.4);pc(g,mu,stenP(mu),0);for(let k=0;k<2;k++){const x=Math.min(s*2.8,s*4.2)+.15+k*.75;pc(g,box(x,4.4,x+.42,4.85),{color:sten,kind:'card',t:.18,edge:'#5a5070'},0)}}
        const ke=box(-2.8,0,2.8,7.1);del(gL,gR,ke,stenP(ke),.1);for(let x=-2.8;x<2.7;x+=.8)pc(side(gL,gR,x+.2),box(x,7.1,x+.45,7.7),{color:sten,kind:'card',t:.2,edge:'#5a5070'},.1);
        const ct=box(-1.4,7,1.4,9.3);del(gL,gR,ct,stenP(ct),.16);del(gL,gR,toCCW([[-1.9,9.3],[1.9,9.3],[0,12]]),{t:.24,s:24,edge:'#2e1a4a',paint:P_=>{P_.wash(tag,null,{top:'#7a52a8',edge:.4});for(let y=9.7;y<11.6;y+=.45)P_.pen([[-2,y],[2,y]],'#3e2460',.05,.6)}},.2);
        pc(gR,box(0,12,.06,12.9),{color:'#3a2a20',kind:'card',t:.05},.22);pc(gR,toCCW([[.06,12.85],[1.2,12.55],[.06,12.25]]),{color:'#7fd8ff',kind:'card',t:.04},.23);
        for(const[x,y]of[[-1.7,4.4],[1.7,4.4],[-1.7,2.4],[1.7,2.4],[0,5.6]])del(gL,gR,bue(x,y,.75,1.35),{mat:vin,t:.04},.24);del(gL,gR,bue(0,7.6,.7,1.2),{mat:vin,t:.04},.24);
        const port=bue(0,0,2.1,2.9);del(gL,gR,port,{t:.06,s:24,paint:P_=>{P_.wash('#6a4228',port,{top:'#7a5232',edge:.4});for(let x=-.7;x<.8;x+=.35)P_.pen([[x,0],[x,2.6]],'#3e2414',.05,.7)}},.26);
        for(const s of[-1,1]){const g=s<0?gL:gR;pc(g,toCCW([[s*1.75,6.6],[s*2.45,6.6],[s*2.45,4.9],[s*2.1,5.3],[s*1.75,4.9]]),{color:'#7b4fd0',kind:'card',t:.04,edge:'#3e2460'},.3);pc(g,starPts(s*2.1,5.95,.22,.09,0),{color:'#f2c14e',kind:'card',t:.02},.34)}});
      lag(76,7,(gL,gR)=>{const hk=toCCW(sm([[-9,0],[9,0],[9,1.3],[8.2,1.8],[7,1.4],[5.8,1.9],[4.4,1.4],[3,1.9],[1.6,1.4],[0,1.9],[-1.6,1.4],[-3,1.9],[-4.4,1.4],[-5.8,1.9],[-7,1.4],[-8.2,1.8],[-9,1.3]],4));
        del(gL,gR,hk,{t:.2,s:20,edge:'#1e3a1e',paint:P_=>{P_.wash('#3e7a44',hk,{top:'#5a9a52',edge:.5,clouds:5});for(let k=0;k<70;k++)P_.fill(circ(R(-9,9),R(0,1.8),.15,.12,6),R(1)<.5?'#2e5a32':'#6aa860',R(.4,.8))}},.1);
        lygte(gL,pc,-8.4);lygte(gR,pc,8.4);baand(gL,gR,del,pc,P,{y:1.6,w:15.2,h:3,linjer:[{t:'Jeg går i skole, ligesom dig.',s:.85},{t:'Men min skole er en magisk skole!',s:.92,c:'#5a2a8a',w:700}]})})},
    /* 4: nattehimmel med måne, en heks på kost, der trækker et banner, en heks i faldskærm, en boblende gryde og skyer */
    kost:({lag,del,pc,side,P})=>{
      lag(79,-2,(gL,gR)=>{himmel(gL,gR,del,pc,10,11.2);put(gL,piece(circ(-7,5.2,1.7,1.7,36),{mat:paperMat('#fff2c0','tissue',{glow:'#ffe48a',gi:1.5}),t:.12}),0,0,.16);for(const[x,y,r]of[[-6.6,5.7,.3],[-7.6,4.6,.22]])pc(gL,circ(x,y,r,r,12),{color:'#e8d494',kind:'card',t:.03},.3);
        stjerner(gL,gR,pc,[[-2.4,6.6,.35],[2.6,6.2,.3],[8.6,6.6,.3],[-9,8,.28]]);
        /* banneret, som heksen på kosten trækker */const bn=toCCW(sm([[-7.6,7.6],[5.4,7.6],[5.6,10.6],[-7.6,10.6],[-8.4,9.1]],2));del(gL,gR,bn,{color:'#efe0b8',kind:'card',t:.08,edge:'#a8885a'},.2);
        flade(gL,gR,{x:-1.1,y:9.1,w:12.6,h:2.8,z:.27,linjer:[{t:'Vi flyver på koste, brygger eliksirer',s:.78},{t:'og springer i faldskærm fra skyerne.',s:.78}]},P);
        for(const y of[7.8,10.4])pc(gR,box(5.5,y-.03,7,y+.03),{color:'#3a2a20',kind:'card',t:.02},.22);
        {const g=new THREE.Group();g.position.set(8,9.2,.3);g.rotation.z=.12;gR.add(g);const s='#141a34';pc(g,box(-1.2,-.07,1.6,.07),{color:'#6a4128',kind:'card',t:.05},0);pc(g,toCCW([[-1.2,.25],[-2,.45],[-2,-.45],[-1.2,-.25]]),{color:'#e9c46a',kind:'card',t:.05},0);
          pc(g,toCCW(sm([[-.5,0],[.4,0],[.2,.9],[-.3,1]],2)),{color:'#6a3fa2',kind:'card',t:.05},.05);pc(g,circ(0,1.25,.3,.3,12),{color:'#f7d8c4',kind:'card',t:.05},.06);pc(g,toCCW([[-.55,1.45],[.55,1.45],[-.15,2.3]]),{color:'#3a2a5a',kind:'card',t:.05},.07);pc(g,toCCW(sm([[-.3,1.1],[-1.4,.8],[-1.2,1.3]],2)),{color:'#f2b33d',kind:'card',t:.04},.04)}});
      lag(78,2.6,(gL,gR)=>{/* gryden */const gr=toCCW(sm([[-2.6,.6],[2.6,.6],[3.2,2],[2.8,3.6],[-2.8,3.6],[-3.2,2]],5));del(gL,gR,gr,{t:.3,s:18,edge:'#0a0a12',paint:P_=>{P_.wash('#2a2a3a',gr,{top:'#3a3a4e',edge:.5});P_.pen([[-2.4,1.6],[-1.6,1.2]],'#8a8aa0',.1,.5)}},.1);
        del(gL,gR,circ(0,3.6,2.9,.45,28),{mat:paperMat('#7fe8a0','tissue',{glow:'#5fe0a0',gi:1.4}),t:.08},.4);for(const s of[-1,1])pc(side(gL,gR,s),box(s*2.2-.2,0,s*2.2+.2,.8),{color:'#2a2a3a',kind:'card',t:.2},.05);
        for(const[x,y,r]of[[-1.2,4.4,.45],[.6,5,.35],[-.2,6,.28],[1.4,4.3,.3],[.3,6.8,.2]])put(side(gL,gR,x),piece(circ(x,y,r,r,16),{mat:paperMat('#b8ffd0','tissue',{glow:'#7fe8a0',gi:1.2}),t:.06}),0,0,.55);
        for(let k=0;k<6;k++){const x=-2.4+k*.95;pc(side(gL,gR,x),toCCW(sm([[x-.3,0],[x+.3,0],[x+.15,.8],[x,1.2],[x-.15,.8]],2)),{mat:paperMat('#ffb050','tissue',{glow:'#ff8a30',gi:1.8}),t:.05},.3)}
        /* heksen i faldskærm til venstre */{const g=new THREE.Group();g.position.set(5.8,1.6,.2);gR.add(g);const ca=toCCW(sm([[-2.4,3],[2.4,3],[2,4.3],[0,4.9],[-2,4.3]],4));pc(g,ca,{t:.15,s:20,paint:P_=>{P_.wash('#e2384e',ca,{edge:.4});for(let x=-1.6;x<2;x+=1.6)P_.fill(box(x-.4,2.9,x+.4,5),'#fff3e0',.95)}},0);
          for(const x of[-2.2,-.8,.8,2.2])pc(g,box(Math.min(x,x*.08)-.02,1.2,Math.max(x,x*.08)+.02,3),{color:'#e8e4f0',kind:'card',t:.02},-.05);pc(g,toCCW(sm([[-.45,0],[.45,0],[.3,1.2],[-.3,1.2]],2)),{color:'#6a3fa2',kind:'card',t:.06},.05);pc(g,circ(0,1.55,.36,.36,14),{color:'#e2384e',kind:'card',t:.06},.06)}
        /* en ugle på højre side */{const g=new THREE.Group();g.position.set(-6,4.4,.2);gL.add(g);pc(g,circ(0,0,.9,1.1,18),{color:'#8a5a34',kind:'card',t:.2,edge:'#4a2a18'},0);for(const s of[-1,1]){pc(g,circ(s*.36,.35,.3,.3,12),{color:'#f6ecd8',kind:'card',t:.04},.22);pc(g,circ(s*.36,.35,.14,.14,10),{color:'#1a1010',kind:'card',t:.04},.27);pc(g,toCCW([[s*.3,.9],[s*.8,.95],[s*.7,1.4]]),{color:'#8a5a34',kind:'card',t:.1},0)}pc(g,box(-1.4,-1.2,1.4,-1),{color:'#5a3a24',kind:'card',t:.1},.1)}});
      lag(76,7,(gL,gR)=>{for(const[x,y,r]of[[-6.4,1.3,1.4],[-2.6,.9,1.2],[2.4,1,1.3],[6.6,1.4,1.4],[0,.6,1]])sky(side(gL,gR,x),pc,x,y,r,0);
        baand(gL,gR,del,pc,P,{y:1,w:13,h:2.2,z:.24,linjer:[{t:'Og nogle gange hygger vi os bare.',s:.95,c:'#5a2a8a',w:700}]})})},
    /* 5: en stenmur med en buet dør på klem, varmt lys og trappetrin, et skilt over døren og lygter forrest */
    doer:({lag,del,pc,side,P})=>{
      lag(79,-2,(gL,gR)=>{himmel(gL,gR,del,pc,10,11.2);stjerner(gL,gR,pc,[[-7,10,.4],[-2,10.8,.3],[3.4,10.6,.35],[8,9.8,.3]]);
        const mur=toCCW(sm([[-10,0],[10,0],[10,7.6],[9,8.2],[7.6,7.7],[6.2,8.3],[4.8,7.8],[-4.8,7.8],[-6.2,8.3],[-7.6,7.7],[-9,8.2],[-10,7.6]],2));del(gL,gR,mur,stenP(mur,'#8a84a0','#6a6488'),.12);
        for(const[x,y]of[[-8,6.4],[-5.6,3.6],[7.4,5.8],[5,2.6]])pc(side(gL,gR,x),puff(x,y,.9,.6,7,.25),{color:'#3e7a44',kind:'card',t:.06,edge:'#1e3a1e'},.3);
        const sk=box(-5.2,8.6,5.2,10.6);del(gL,gR,sk,{color:'#efe0b8',kind:'card',t:.08,edge:'#a8885a'},.2);flade(gL,gR,{y:9.6,w:10.2,h:1.8,z:.27,linjer:[{t:'Kunne du tænke dig at tage med?',s:.85,c:'#5a2a8a',w:700}]},P);
        for(const x of[-4.4,4.4])pc(side(gL,gR,x),box(x-.04,7.8,x+.04,8.6),{color:'#3a2a20',kind:'card',t:.03},.2)});
      lag(78,2.6,(gL,gR)=>{const fr=toCCW([[-4,0],[4,0],[4,5.6],[3,7.4],[0,8.3],[-3,7.4],[-4,5.6]]),hul=toCCW([[-2.4,.6],[2.4,.6],[2.4,5.2],[1.6,6.4],[0,6.9],[-1.6,6.4],[-2.4,5.2]]);
        del(gL,gR,{outer:fr,holes:[hul]},stenP(fr,'#9a94b0','#7a7490'),.1);del(gL,gR,hul,{mat:paperMat('#ffe6a8','tissue',{glow:'#ffd070',gi:3}),t:.05},-.05);P.glows=[Rm.glow(-1.1,3.4,.4,'rgba(255,214,130,.9)',8,false,gL),Rm.glow(1.1,3.4,.4,'rgba(255,214,130,.9)',8,false,gR),Rm.glow(0,1,1.2,'rgba(255,200,110,.7)',7,false,gR)];
        const d=new THREE.Group();d.position.set(2.4,.6,.15);d.rotation.y=.8;gR.add(d);const dd=toCCW([[0,0],[-4.8,0],[-4.8,4.6],[-4,5.8],[-2.4,6.3],[-.8,5.8],[0,4.6]]);pc(d,dd,{t:.2,s:20,edge:'#3e2414',paint:P_=>{P_.wash('#7a4a2a',dd,{top:'#8a5a34',edge:.4});for(let x=-4.4;x<0;x+=.8)P_.pen([[x,.1],[x,6]],'#4a2a18',.06,.7)}},0);pc(d,circ(-4.1,2.8,.28,.28,12),{mat:gold(),t:.15},.15);for(const y of[1.2,4.6])pc(d,box(-4.6,y,-.2,y+.3),{color:'#2a2238',kind:'card',t:.04},.12);
        for(const[w,y]of[[5.6,0],[4.6,.3]])del(gL,gR,box(-w/2,y,w/2,y+.3),{color:'#8a84a0',kind:'card',t:.3,edge:'#4a4456'},.2);
        for(const s of[-1,1]){const g=s<0?gL:gR,x=s*5;pc(g,box(x-.08,4,x+.08,5.4),{color:'#2a2238',kind:'card',t:.08},.1);put(g,piece(box(x-.45,5.4,x+.45,6.5),{mat:paperMat('#ffe2a0','tissue',{glow:'#ffc860',gi:1.8}),t:.3}),0,0,.1)}
        pc(gL,circ(-.8,3.8,.12,.12,8),{color:'#fff6d0',kind:'card',t:.02},-.02)});
      lag(76,7,(gL,gR)=>{const hk=toCCW(sm([[-9,0],[9,0],[9,1.1],[7.4,1.6],[5.8,1.1],[4.2,1.5],[-4.2,1.5],[-5.8,1.1],[-7.4,1.6],[-9,1.1]],4));del(gL,gR,hk,{color:'#3e7a44',kind:'card',t:.2,edge:'#1e3a1e'},.1);
        for(const[x,c]of[[-7.6,'#e0457a'],[-5.2,'#ffd23a'],[5.4,'#c79bff'],[7.8,'#7fd8ff']])pc(side(gL,gR,x),circ(x,1.7,.35,.35,10),{color:c,kind:'card',t:.06},.2);lygte(gL,pc,-8.6,3.2);lygte(gR,pc,8.6,3.2);
        baand(gL,gR,del,pc,P,{y:1.8,w:13.8,h:2.4,z:.24,linjer:[{t:'Så følg mig …',s:.8},{t:'eller skulle jeg sige …',s:.9,c:'#5a2a8a',w:700}]})})}};
  function bygPop(art){const P=bygV(SPEC[art]);if(art==='portraet'&&P.brev){for(const m of P.brev.meshes)Rm.tap(m,()=>{if(aaben&&i===0&&!travl&&!lukket)skriv()})}return P}
  /* ---------- bogen ---------- */
  function bygBog(){bog=new THREE.Group();Rm.live.add(bog);
    const lae='#4a2a62',laeK='#2a1440';venstre=new THREE.Group();hoejre=new THREE.Group();bog.add(venstre,hoejre);
    const halv=(g,s)=>{const x0=s<0?-PW-1.6:0,x1=s<0?0:PW+1.6;const cov=Rm.floor(box(x0,-PH/2-1.2,x1,PH/2+1.2),{color:lae,kind:'card',t:.8,edge:laeK},0,g);cov.castShadow=true;
      for(const[cx,cz]of[[x0,-PH/2-1.2],[x1,-PH/2-1.2],[x0,PH/2+1.2],[x1,PH/2+1.2]].filter(([x])=>Math.abs(x)>1)){const m=Rm.floor(toCCW([[cx,cz],[cx-Math.sign(cx)*2.6,cz],[cx,cz-Math.sign(cz)*2.6]]),{mat:gold(),t:.15},.81,g)}
      const blk=Rm.floor(box(s<0?-PW-.2:.2,-PH/2,s<0?-.2:PW+.2,PH/2),{color:'#e8dcc0',kind:'card',t:1.2,edge:'#b8a888'},.82,g);
      for(let k=1;k<6;k++)Rm.floor(box(s<0?-PW-.25:.2,-PH/2-.02+k*.001,s<0?-.2:PW+.25,PH/2+.02),{color:'#d8ccb0',kind:'water',t:.01},.82+k*.2,g)};
    halv(venstre,-1);halv(hoejre,1);
    /* forsiden på undersiden af venstre bogbind: læder med en guldramme, som kommer op, når bogen lukkes */
    {const c=document.createElement('canvas');c.width=900;c.height=1200;const g=c.getContext('2d');g.fillStyle='#4a2a62';g.fillRect(0,0,900,1200);for(let k=0;k<2200;k++){g.fillStyle=`rgba(${R(1)<.5?20:90},${R(1)<.5?10:50},${R(1)<.5?40:110},${R(.05,.12)})`;g.fillRect(R(900),R(1200),R(2,6),R(2,6))}
      g.strokeStyle='#e2b24a';g.lineWidth=10;g.strokeRect(70,70,760,1060);g.lineWidth=3;g.strokeRect(100,100,700,1000);
      for(const[x,y]of[[100,100],[800,100],[100,1100],[800,1100]]){g.fillStyle='#e2b24a';g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?12:30;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.fill()}
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(PW+1.4,PH+2.2),new THREE.MeshStandardMaterial({map:t,roughness:.6,metalness:.05}));m.rotation.x=Math.PI/2;m.position.set(-(PW+1.6)/2,-.43,0);m.userData.noShadow=true;venstre.add(m)}
    sideV=sidePlan(sideLaerred(0,'l'),-PW/2-.4);sideH=sidePlan(sideLaerred(0,'r'),PW/2+.4);sideV.position.y=PY+.3;sideH.position.y=PY+.3;venstre.add(sideV);hoejre.add(sideH);
    /* ryggen */Rm.floor(box(-1.6,-PH/2-1.2,1.6,PH/2+1.2),{color:'#3a1e52',kind:'card',t:1.6,edge:laeK},0,bog);
    /* bogryggen, som rejser sig, når bogen lukkes (Kasper 23. nov.: "den har ingen ryg, når den er lukket"), med guldbånd */
    ryg=new THREE.Group();ryg.position.set(0,-.4,0);bog.add(ryg);Rm.floor(box(-5.5,-PH/2-1.2,.1,PH/2+1.2),{color:'#3e2058',kind:'card',t:.7,edge:laeK,both:true},0,ryg);
    for(const z of[-PH/2+1.2,-PH/2+3,PH/2-3,PH/2-1.2])Rm.floor(box(-5.5,z-.22,.1,z+.22),{mat:gold(),t:.1,both:true},-.38,ryg);
    /* guldhjørner også på forsiden, så de ses, når bogen er lukket */
    for(const[cx,cz]of[[-PW-1.6,-PH/2-1.2],[-PW-1.6,PH/2+1.2]])Rm.floor(toCCW([[cx,cz],[cx+2.6,cz],[cx,cz-Math.sign(cz)*2.6]]),{mat:gold(),t:.1,both:true},-.5,venstre);
    }
  /* ---------- styring: pile, navn og knapper (papknapper i hjørnerne, som resten af spillet) ---------- */
  const DOM=[];const knap=(cls,html,fn)=>{const b=document.createElement('button');b.type='button';b.className='kraft bog-k '+cls;b.innerHTML=html;b.addEventListener('click',fn);document.body.appendChild(b);DOM.push(b);return b};
  const pil=d=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const pen=knap('bog-pen',pil('M4 20l1.2-4.6L16.6 4a1.6 1.6 0 0 1 2.3 0l1.1 1.1a1.6 1.6 0 0 1 0 2.3L8.6 18.8z'),()=>skriv());pen.setAttribute('aria-label','Ret navnet');pen.hidden=true;
  const frem=knap('bog-frem',pil('M9 5l7 7-7 7'),()=>vend(1)),tilb=knap('bog-tilb',pil('M15 5l-7 7 7 7'),()=>vend(-1));frem.setAttribute('aria-label','Næste side');tilb.setAttribute('aria-label','Forrige side');
  const efter=document.createElement('div');efter.className='bog-efter';efter.hidden=true;efter.innerHTML='<p>Men hov … hvordan ser jeg egentlig ud? Det må du bestemme!</p>';document.body.appendChild(efter);DOM.push(efter);
  {const a=document.createElement('button');a.type='button';a.className='fs-knap hot';a.textContent='Lav min heks';a.addEventListener('click',slut);const b=document.createElement('button');b.type='button';b.className='fs-knap';b.textContent='Læs igen';b.addEventListener('click',igen);const r=document.createElement('div');r.className='bog-ek';r.append(a,b);efter.appendChild(r)}
  const inp=document.createElement('input');inp.className='bog-inp';inp.maxLength=14;inp.setAttribute('inputmode','none');inp.setAttribute('autocomplete','off');inp.value=navn;document.body.appendChild(inp);DOM.push(inp);
  if(typeof FORSIDE!=='undefined'&&FORSIDE.kb)FORSIDE.kb(inp);
  inp.addEventListener('input',()=>{navn=inp.value.replace(/\s+/g,' ').replace(/^\s/,'');if(pop&&pop.brev)pop.brev.skriv(pop.navnLinjer(navn));pile()});
  function skriv(){try{inp.focus({preventScroll:true})}catch(_){}if(typeof FORSIDE!=='undefined'&&FORSIDE.kbAaben)FORSIDE.kbAaben(inp)}
  const ok=()=>navn.trim().length>0;
  function pile(){tilb.hidden=i===0||lukket||!aaben;frem.hidden=lukket;frem.disabled=(aaben&&i===0&&!ok())||travl;frem.setAttribute('aria-label',aaben?'Næste side':'Åbn bogen')}
  const pyt=()=>{navn=navn.trim();navn=navn.charAt(0).toLocaleUpperCase('da')+navn.slice(1);inp.value=navn;if(pop&&pop.brev)pop.brev.skriv(pop.navnLinjer(navn))};
  /* ---------- at vende en side ---------- */
  const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,fjern=p=>{if(!p)return;p.G.parent&&p.G.parent.remove(p.G);if(p.ryd)for(const f of p.ryd)f();emptyGroup(p.G)};
  function vend(d){if(travl||lukket)return;if(!aaben){aabn();return}if(d>0&&i===0&&!ok()){skriv();return}if(d<0&&i===0)return;if(typeof FORSIDE!=='undefined'&&FORSIDE.kbLuk)FORSIDE.kbLuk();pyt();
    if(d>0&&i===SIDER.length-1){luk();return}travl=true;pile();LYD.pust();const ny=i+d;
    /* bladet drejer om ryggen. Frem: den nye pop-up sidder på bladets bagside og folder sig op, mens bladet lægger sig. Tilbage: den gamle sidder på bladet og folder sig ned */
    if(d>0){blad=bygBlad(sideLaerred(i,'r'),sideLaerred(ny,'l'),1);saetSide(sideH,sideLaerred(ny,'r'));popNy=bygPop(SIDER[ny].art,blad);if(!popNy.v){popNy.G.position.set(PW/2+.4,-.05,GZ);popNy.G.rotation.z=Math.PI}}
    else{blad=bygBlad(sideLaerred(i,'l'),sideLaerred(ny,'r'),-1);saetSide(sideV,sideLaerred(ny,'l'));if(!pop.v){blad.add(pop.G);pop.G.position.set(-PW/2-.4,.05,GZ)}popNy=bygPop(SIDER[ny].art,venstre)}
    LYD.fil('bog.pop',()=>LYD.plop(),.4);fase={t:0,d,ny,trin:'vend'}}
  function bygBlad(fraT,tilT,d){/* bladet: forside = siden, der vendes, bagside = den nye side på den anden side; det drejer om ryggen */
    const g=new THREE.Group();g.position.set(0,PY+.35,0);bog.add(g);const f=sidePlan(fraT,(d>0?1:-1)*(PW/2+.4));f.position.y=0;g.add(f);const b=sidePlan(tilT,(d>0?1:-1)*(PW/2+.4));b.position.y=-.02;b.rotation.order='ZYX';b.rotation.set(-Math.PI/2,0,Math.PI);g.add(b);f.castShadow=b.castShadow=true;f.userData.noShadow=b.userData.noShadow=false;return g}
  function tickFase(dt){if(!fase)return;fase.t+=dt;const F=fase;
    if(F.trin==='aabn'){const u=Math.min(1,F.t/1.4),e=ease(u);vPlace(-(1-e)*Math.PI,1-e);bog.position.x=(1-e)*F.x0;pop.op=clamp((e-.2)/.8,0,1);if(pop.v)stilV(pop,[-Math.cos((1-e)*Math.PI),Math.sin((1-e)*Math.PI)],[1,0]);
      if(u>=1){vPlace(0,0);bog.position.x=0;fase=null;travl=false;aaben=true;pile();if(!ok())setTimeout(()=>{if(ctx.alive&&i===0&&!travl)skriv()},300)}}
    else if(F.trin==='vend'){const u=Math.min(1,F.t/1.9),e=ease(u);blad.rotation.z=F.d*e*Math.PI;blad.position.y=PY+.35;pop.op=1-clamp(e/.85,0,1);popNy.op=clamp((e-.15)/.85,0,1);
      {const c=Math.cos(e*Math.PI),s_=Math.sin(e*Math.PI),bd=F.d>0?[c,s_]:[-c,s_];if(pop.v)stilV(pop,F.d>0?[-1,0]:bd,F.d>0?bd:[1,0]);if(popNy.v)stilV(popNy,F.d>0?bd:[-1,0],F.d>0?[1,0]:bd)}
      if(u>=1){if(F.d>0){saetSide(sideV,sideLaerred(F.ny,'l'));if(!popNy.v){venstre.add(popNy.G);popNy.G.position.set(-PW/2-.4,PY+.4,GZ);popNy.G.rotation.z=0}}else saetSide(sideH,sideLaerred(F.ny,'r'));if(popNy.v)stilV(popNy,[-1,0],[1,0]);
        fjern(pop);pop=popNy;popNy=null;pop.op=1;bog.remove(blad);blad.traverse(q=>{if(q.isMesh){q.geometry.dispose();q.material.map&&q.material.map.dispose();q.material.dispose()}});blad=null;
        i=F.ny;fase=null;travl=false;pile();if(i===0&&!ok())skriv()}}}
  function tickPop(p){if(!p||p.v)return;const n=p.L.length;p.L.forEach((g,k)=>{const u=clamp(p.op*(1+.12*n)-k*.12,0,1),s=1.70158,e=u<1?1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2):1;g.rotation.x=-Math.PI/2*(1-e)})}
  /* ---------- åbningen, lukningen og titlen ---------- */
  const TITEL=['Magiske','Mig'],LUKY=4.72,BX=-13;
  /* venstre bogbind drejer om sidens kant ved ryggen (samme hængsel som pop-up'erne), lidt løftet, når den er lukket */
  function vPlace(rot,k){const hy=PY+.3;venstre.rotation.z=rot;venstre.position.set(Math.sin(rot)*hy,hy-Math.cos(rot)*hy+.02*k,0);if(ryg)ryg.rotation.z=-k*Math.PI/2}
  /* tryk på den lukkede bog åbner den. Trykket fjernes igen, når den er åben, ellers tog det trykket fra brevet efter "Læs igen" (Kasper 23. nov.) */
  function bogTap(){Rm.untap(bog);Rm.tap(bog,()=>{if(!aaben&&!lukket)aabn()})}
  function lukketStart(x0){vPlace(-Math.PI,1);if(Rm.taps)bogTap();bog.position.x=x0;aaben=false;if(pop){pop.op=0;if(pop.v)stilV(pop,[1,1e-3],[1,0])}}
  function aabn(){if(travl||aaben||lukket)return;Rm.untap(bog);travl=true;pile();LYD.pust();LYD.fil('bog.pop',()=>LYD.plop(),.4);fase={t:0,trin:'aabn',x0:bog.position.x}}
  function luk(){travl=true;lukket=true;pile();fase={t:0,trin:'lukvend'};LYD.pust()}
  function tickLuk(dt){if(!fase||!lukket)return false;const F=fase;F.t+=dt;
    if(F.trin==='lukvend'){const u=Math.min(1,F.t/1.3),e=ease(u);vPlace(-e*Math.PI,e);bog.position.x=e*(BX-(PW/2+.8));if(pop){pop.op=1-clamp(e/.8,0,1);if(pop.v)stilV(pop,[-Math.cos(e*Math.PI),Math.sin(e*Math.PI)],[1,0])}
      if(u>=1){fjern(pop);pop=null;LYD.dunk();F.trin='titel';F.t=0;startTitel()}}
    else if(F.trin==='titel'){if(tickTitel(dt)){F.trin='glans';F.t=0;LYD.guld();const top=LUKY+.95;F.glow=[Rm.glow(BX,top+1.5,-3.2,'rgba(255,224,140,.9)',22),Rm.glow(BX,top+1.5,4.6,'rgba(255,224,140,.9)',22)];for(const g of F.glow){g.s.material.depthTest=false;g.s.renderOrder=5}for(const q of bogst)Rm.burst(q.m.position.x,q.m.position.y,q.m.position.z,3,'rgba(255,236,170,.95)',1.6)}}
    else if(F.trin==='glans'){if(F.glow)for(const g of F.glow)g.s.material.opacity=Math.max(0,1-F.t/1.4);if(F.t>1.2&&!F.vist){F.vist=true;efter.hidden=false;requestAnimationFrame(()=>efter.classList.add('on'))}}
    return true}
  /* bogstaverne: hvert sit stykke guldpapir, der kommer i en spiral udefra, drejer rundt og lander med et lille hop i stjernestøv */
  function startTitel(){const top=LUKY+.95,lin=TITEL.map((w,li)=>{const hgt=li?6.6:5.2,ms=[...w].map(ch=>{const m=papirTekstMesh(ch,'#f2c14e',hgt,FONT.stoevle,'#5a2a8a');m.rotation.x=-Math.PI/2;return m});
        const bw=ms.reduce((a,m)=>a+m.userData.b*.58,0);let x=-bw/2;return ms.map(m=>{const w=m.userData.b*.58,mx=x+w/2;x+=w;return{m,mx,mz:li?4.6:-3.2}})}).flat();
    lin.forEach((q,k)=>{const a=R(TAU),r=R(40,60);q.start=new THREE.Vector3(Math.cos(a)*r,R(18,32),Math.sin(a)*r*.6-10);q.slut=new THREE.Vector3(q.mx+BX,top,q.mz);q.t=-k*.14;q.spin=R(3,6)*(R(1)<.5?-1:1);q.a0=R(TAU);
      q.m.position.copy(q.start);q.m.visible=false;Rm.live.add(q.m);bogst.push(q)});
    for(let k=0;k<140;k++){const m=put(Rm.live,piece(starPts(0,0,.5,.2,0),{mat:paperMat(['#fff6d0','#ffd86b','#ff9fc8','#c79bff'][k%4],'tissue',{glow:'#fff0b0',gi:1.6}),t:.03}),0,0,0);m.visible=false;m.userData.noShadow=true;stoev.push({m,t:9,v:new THREE.Vector3()})}}
  function stoevUd(p,n=2){for(let k=0;k<n;k++){const s=stoev.find(q=>q.t>=q.liv||!q.m.visible);if(!s)return;s.t=0;s.liv=R(.6,1.2);s.m.visible=true;s.m.position.copy(p).add(new THREE.Vector3(R(-1,1),R(-.5,.5),R(-1,1)));s.v.set(R(-2,2),R(-6,-2),R(-2,2));s.m.rotation.set(-Math.PI/2,0,R(TAU))}}
  function tickTitel(dt){let faerdig=true;for(const q of bogst){q.t+=dt;if(q.t<0){faerdig=false;continue}q.m.visible=true;const u=Math.min(1,q.t/1.6),e=1-Math.pow(1-u,3),sw=(1-e)*14,a=q.a0+e*Math.PI*3;
      const p=q.start.clone().lerp(q.slut,e);p.x+=Math.cos(a)*sw;p.z+=Math.sin(a)*sw*.7;p.y+=Math.sin(u*Math.PI)*6*(1-u);if(u>=1){const b=Math.max(0,1-(q.t-1.6)/.35);p.y+=Math.sin(b*Math.PI)*.8*b}
      q.m.position.copy(p);q.m.rotation.set(-Math.PI/2,0,u<1?(1-e)*q.spin*TAU*.4:0);const sk=.6+.4*e;q.m.scale.setScalar(sk);
      if(u<1){faerdig=false;stoevUd(p,2)}else if(!q.landet){q.landet=true;Rm.burst(p.x,p.y,p.z,8,'rgba(255,230,150,.95)',2.2);LYD.fil('bog.pling',()=>LYD.ding(),.25,R(1.1,1.4))}
      if(q.t<2)faerdig=false}
    for(const s of stoev){if(!s.m.visible)continue;s.t+=dt;if(s.t>=s.liv){s.m.visible=false;continue}s.m.position.addScaledVector(s.v,dt);s.m.scale.setScalar(1-s.t/s.liv);s.m.rotation.z+=dt*4}
    return faerdig}
  function igen(){efter.classList.remove('on');efter.hidden=true;for(const q of bogst){Rm.live.remove(q.m);q.m.userData.ryd&&q.m.userData.ryd()}bogst=[];
    lukket=false;fase=null;i=0;saetSide(sideV,sideLaerred(0,'l'));saetSide(sideH,sideLaerred(0,'r'));pop=bygPop(SIDER[0].art);lukketStart(bog.position.x);travl=false;aabn()}
  function slut(){LYD.valg&&LYD.valg();pyt();SPIL.navn=navn;SPIL.data.intro=true;SPIL.data.nyHeks=true;SPIL.save();LOG.row('intro',{navn:navn.length});enter('garderobe',{skift:true})}
  /* blyanten følger navnet på brevet, så man kan se, at man kan rette det (Kasper 23. nov.) */
  const pv=new THREE.Vector3();function blyant(){const vis=!!(pop&&pop.navnPkt&&aaben&&i===0&&!travl&&!lukket&&ok());pen.hidden=!vis;if(!vis)return;pop.navnPkt.g.updateWorldMatrix(true,false);pv.copy(pop.navnPkt.v).applyMatrix4(pop.navnPkt.g.matrixWorld).project(Rm.cam);
    const r=renderer.domElement.getBoundingClientRect();pen.style.left=(r.left+(pv.x+1)/2*r.width)+'px';pen.style.top=(r.top+(1-pv.y)/2*r.height)+'px'}
  /* ligger navnelinjen bag spillets tastatur, skubbes hele billedet op, så man kan se, hvad man skriver */
  let skubbet=0;const nv=new THREE.Vector3();
  function skub(dt){const kb=document.querySelector('.kb'),cv=renderer.domElement;let maal=0;
    if(kb&&!kb.hidden&&kb.classList.contains('on')&&i===0&&aaben&&!lukket){const kt=innerHeight-kb.offsetHeight,r=cv.getBoundingClientRect();if(!pop||!pop.brev)return;pop.brev.meshes[0].updateWorldMatrix(true,false);pop.brev.meshes[0].getWorldPosition(nv);nv.y-=1.2;nv.project(Rm.cam);
      const y=r.top+(1-nv.y)/2*r.height+skubbet;maal=Math.max(0,y+24-kt)}
    skubbet+=(maal-skubbet)*Math.min(1,dt*8);if(Math.abs(skubbet)<.5&&maal===0)skubbet=0;cv.style.transform=skubbet?`translateY(${-skubbet}px)`:''}
  /* ---------- rummet: skrivebordet i stearinlysets skær ---------- */
  const OPT={bg:'#1a1220',fit:(c,w,h)=>{const asp=w/h,HH=Math.max(34,62/asp),D=78;c.fov=2*Math.atan(HH/2/D)*180/Math.PI;c.position.set(0,D*Math.sin(.64),D*Math.cos(.64)+4);c.lookAt(0,4.5,0)},
    sky:'#ffe8c0',ground:'#3a2418',amb:.7,key:{col:'#ffd9a0',i:1.6,pos:[-40,60,10],tgt:[0,0,0],box:[-50,50,50,-50]},P_:{dof:[0,0],haze:[0,0,0]},
    build:R_=>[()=>{Rm=R_;const S=Rm.scene;
        /* bordpladen: brede brædder */const B=box(-90,-60,90,60);Rm.floor(B,{t:.6,s:4,paint:P=>{P.wash('#7a4a2a',B,{top:'#8a5a34',edge:.5,clouds:6});for(let y=-60;y<60;y+=7)P.pen([[-90,y],[90,y]],'#4a2a18',.18,.6);for(let k=0;k<60;k++){const x=R(-90,90),y=R(-60,60);P.pen([[x,y],[x+R(6,16),y+R(-.3,.3)]],'#5a3420',.06,.4)}}},0,S);
        /* stearinlys på en messingholder bag bogen til venstre */const L=new THREE.Group();L.position.set(-36,0,-18);S.add(L);P2(L,circ(0,0,3.2,3.2,24),{mat:gold(),t:.5},0);L.children[L.children.length-1].rotation.x=-Math.PI/2;
        const lys=new THREE.Group();lys.position.set(-36,.5,-18);S.add(lys);P2(lys,box(-1.1,0,1.1,9),{color:'#f6ecd8',kind:'card',t:2.2,edge:'#d8c8a8'},-1.1);P2(lys,toCCW(sm([[-.5,9.2],[.5,9.2],[.2,11],[0,11.6],[-.2,11]],3)),{mat:paperMat('#ffe090','tissue',{glow:'#ffb040',gi:2}),t:.1},0);
        Rm.glow(-36,11,-18,'rgba(255,190,90,.85)',26,true);Rm.glow(-36,10.5,-18,'rgba(255,240,200,.9)',5,true);
        /* blækhus og fjerpen til højre */const bh=new THREE.Group();bh.position.set(36,0,-16);S.add(bh);P2(bh,box(-2.2,0,2.2,3.4),{color:'#2a2a3a',kind:'card',t:4,edge:'#10101a'},-2);P2(bh,box(-1,3.4,1,4.4),{color:'#3a3a4a',kind:'card',t:2,edge:'#10101a'},-1);
        const fj=new THREE.Group();fj.position.set(35,4,-16);fj.rotation.z=-.5;S.add(fj);P2(fj,toCCW(sm([[0,0],[1.4,4],[1.6,10],[.6,13],[-.6,9],[-.8,4]],4)),{color:'#f4f0f8',kind:'card',t:.1,edge:'#b8b0c8'},0);
        /* tørrede blomster og et par løse stjerner på bordet */for(const[x,z,c]of[[30,14,'#c79bff'],[33,17,'#ff9fc8'],[-31,15,'#ffd86b']])Rm.floor(starPts(x,-z,1.3,.55,R(TAU)),{color:c,kind:'card',t:.08},.62,S)},
      ()=>{bygBog();pop=bygPop(SIDER[0].art);lukketStart(-(PW/2+.8));pile();document.fonts&&document.fonts.ready.then(()=>{if(!ctx.alive)return;saetSide(sideV,sideLaerred(i,'l'));saetSide(sideH,sideLaerred(i,'r'))});
        /* bogen ligger lukket, til man trykker på den (Kasper 23. nov.) */bogTap();setTimeout(()=>{if(ctx.alive&&!aaben&&!travl)ctx.say('Tryk på bogen for at åbne den')},1600)}],
    tick:(t,dt)=>{tiden+=dt;skub(dt);blyant();tickPop(pop);tickPop(popNy);if(!tickLuk(dt))tickFase(dt)}};
  makeRoom(ctx,OPT);
  ctx.efter.push(()=>{renderer.domElement.style.transform='';for(const d of DOM)d.remove();if(typeof FORSIDE!=='undefined'&&FORSIDE.kbLuk)FORSIDE.kbLuk();for(const q of bogst)q.m.userData.ryd&&q.m.userData.ryd()});
  ctx.test={aabn,aaben:()=>aaben,side:()=>i,navn:v=>{inp.value=v;inp.dispatchEvent(new Event('input'))},vend,lukket:()=>lukket,fase:()=>fase&&fase.trin,efter:()=>!efter.hidden,spol:sek=>{for(let k=0;k<sek*25;k++)OPT.tick(0,.04)},bogst:()=>bogst.map(q=>[q.m.visible,q.m.position.toArray().map(v=>+v.toFixed(1)),+q.t.toFixed(2)])}};
