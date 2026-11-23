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
    {art:'slot',lines:[['','Jeg går i skole, ligesom dig.'],['big','Men min skole er en magisk skole!']]},
    {art:'kost',lines:[['','Vi flyver på koste, brygger eliksirer og springer i faldskærm fra skyerne.'],['','Og nogle gange hygger vi os bare.']]},
    {art:'doer',lines:[['','Kunne du tænke dig at tage med?'],['','Så følg mig …'],['big','eller skulle jeg sige …']]}];
  const PW=21,PH=28,PY=2.05,BLAEK='#3a2412';
  let Rm=null,aaben=false,bog,venstre,hoejre,sideV,sideH,blad=null,pop=null,popNy=null,i=0,navn=SPIL.navn||'',travl=false,lukket=false,bogst=[],stoev=[],tiden=0,fase=null;
  /* ---------- siderne: papir med tekst, tegnet på et lærred ---------- */
  const lag=new Map();
  function sideLaerred(n,s){const W=900,H=1200,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    g.fillStyle='#f4e9cf';g.fillRect(0,0,W,H);for(let k=0;k<900;k++){g.fillStyle=`rgba(${120+R(60)|0},${90+R(40)|0},${50},${R(.015,.05)})`;g.fillRect(R(W),R(H),R(1,3),R(1,3))}
    const rg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.8);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,'rgba(110,70,30,.22)');g.fillStyle=rg;g.fillRect(0,0,W,H);
    /* skyggen ind mod ryggen */const gx=s==='l'?W:0,lg=g.createLinearGradient(gx,0,s==='l'?W-140:140,0);lg.addColorStop(0,'rgba(70,40,15,.35)');lg.addColorStop(1,'rgba(70,40,15,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(150,100,40,.55)';g.lineWidth=3;g.strokeRect(46,46,W-92,H-92);g.lineWidth=1;g.strokeRect(58,58,W-116,H-116);
    g.fillStyle='rgba(90,60,30,.7)';g.font='600 34px "Alegreya",Georgia,serif';g.textAlign='center';g.fillText(String(n*2+(s==='l'?1:2)),W/2,H-80);
    if(s==='l'){const fc=['#7b4fd0','#c2465e','#3d6fc2','#e2a93b','#2e9c8a'][n%5],wg=g.createRadialGradient(W/2,H*.42,20,W/2,H*.42,W*.48);wg.addColorStop(0,fc+'38');wg.addColorStop(1,fc+'00');g.fillStyle=wg;g.fillRect(0,0,W,H)}
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
  /* ---------- pop-up-scenerne: lag af pap, der står op fra venstresiden ---------- */
  /* en rigtig pop-up (Kasper 23. nov.): lagene folder sig op og ned i takt med, at siderne åbnes og lukkes, og foldet ned ligger alt inden for siden.
     Lagene er hængslet forneden og lægger sig bagud med billedet opad; de forreste lag ligger øverst */
  const GZ=6.6,GS=.8;
  function popLag(par,zb,byg){const g=new THREE.Group();g.position.set(0,par.children.length*.07,zb);par.add(g);byg(g);g.rotation.x=-Math.PI/2;g.userData.z=zb;return g}
  const kort=(c,t=.25)=>({color:c,kind:'card',t,edge:hexOf(shade(c,-.4))}),INK='#2a1838';
  function bygPop(art,par=venstre){const G=new THREE.Group();G.position.set(-PW/2-.4,PY+.4,GZ);G.scale.setScalar(GS);par.add(G);const L=[];
    if(art==='portraet'){L.push(popLag(G,-6,g=>{put(g,piece({outer:toCCW(circ(0,8,6.2,7.6,40)),holes:[toCCW(circ(0,8,5,6.4,40))]},{mat:gold(),t:.5}),0,0,.3);P2(g,circ(0,8,5.05,6.45,40),kort('#6b4fc0',.2),0);
        P2(g,toCCW(sm([[-3.4,2.2],[3.4,2.2],[2.4,4.4],[1.2,5.2],[-1.2,5.2],[-2.4,4.4]],3)),kort('#3a2a5a',.1),.22);P2(g,circ(0,6.9,1.7,1.9,22),kort('#3a2a5a',.1),.23);P2(g,toCCW([[-3,8.1],[3,8.1],[0,8.9]]),kort('#3a2a5a',.1),.24);P2(g,toCCW(sm([[-1.6,8.4],[1.6,8.4],[.5,12.2],[-.2,12.8],[-.1,11.5]],3)),kort('#3a2a5a',.1),.25);
        const q=papirTekstMesh('?','#f2c14e',3.2,FONT.stoevle,'#3a2a5a');q.position.set(0,7.1,.5);g.add(q)}));
      L.push(popLag(G,3,g=>{for(const[x,h,s]of[[-7,3.2,1],[-4,4.6,.8],[4,4.2,.9],[7,3,1.1]]){P2(g,box(x-.08,0,x+.08,h),kort('#8a6a3a',.05),0);P2(g,starPts(x,h,1.1*s,.45*s,0),kort('#f2c14e',.15),.1)}}))}
    if(art==='hat'){L.push(popLag(G,-4,g=>{P2(g,circ(0,1.6,7.2,1.7,32),kort('#5b3fa8',.3),0);P2(g,toCCW(sm([[-4.2,2],[4.2,2],[2.6,6],[1.8,9.6],[3.2,12],[5.4,12.6],[3,13.4,1],[.4,12],[-.6,8],[-2,4.6]],5)),kort('#6b4fc0',.35),.1);
        P2(g,toCCW(sm([[-4,2.2],[4,2.2],[3.6,3.6],[-3.6,3.6]],2)),kort('#c2465e',.1),.46);put(g,piece({outer:box(-1,2.1,1,3.7),holes:[box(-.5,2.5,.5,3.3)]},{mat:gold(),t:.12}),0,0,.58);
        for(const[x,y,r]of[[-1.4,6.4,.8],[.8,8.6,.6],[-.6,10.6,.5]])P2(g,starPts(x,y,r,r*.42,0),kort('#f2d27a',.05),.48)}));
      L.push(popLag(G,4,g=>{const st=new THREE.Group();st.position.set(6,0,0);st.rotation.z=.3;g.add(st);P2(st,box(-.18,0,.18,6.4),kort('#6a4128',.2),0);P2(st,starPts(0,7.2,1.4,.6,0),kort('#f2c14e',.2),.1);
        for(const[x,y]of[[-6,3],[-3,5],[2,4.6]])P2(g,starPts(x,y,.6,.26,0),kort('#f2d27a',.05),0)}))}
    if(art==='slot'){L.push(popLag(G,-9,g=>{P2(g,circ(5,11,2.6,2.6,28),{mat:paperMat('#fff0b8','tissue',{glow:'#ffe08a',gi:1.3}),t:.2},0);P2(g,circ(5.9,11.6,2.2,2.2,24),kort('#e9d9f2',.05),.21);for(const[x,y]of[[-5,12],[-2,9.5],[1,13]])P2(g,starPts(x,y,.5,.22,0),kort('#f2d27a',.05),0)}));
      L.push(popLag(G,-5,g=>{const st='#9a8fc0';P2(g,box(-5.5,0,5.5,6),kort(st,.3),0);for(const[x,w,h]of[[-6,2.4,8],[6,2.4,8.4],[0,2.8,10]]){P2(g,box(x-w/2,0,x+w/2,h),kort(st,.35),.1);P2(g,toCCW([[x-w/2-.5,h],[x+w/2+.5,h],[x,h+w*1.3]]),kort('#6a3a88',.3),.2)}
        P2(g,toCCW(sm([[-1,0],[1,0],[1,2],[0,2.8],[-1,2]],3)),kort('#5a3a24',.1),.5);for(const[x,y]of[[-6,4.6],[6,5],[0,7],[-3,3.4],[3,3.4]])P2(g,toCCW(sm([[x-.4,y-.6],[x+.4,y-.6],[x+.4,y+.3],[x,y+.6],[x-.4,y+.3]],2)),kort('#ffd86b',.05),.5)}));
      L.push(popLag(G,0,g=>{P2(g,toCCW(sm([[-9.5,0],[9.5,0],[9.5,2],[5,3.2],[0,2.2],[-5,3.4],[-9.5,2.4]],4)),kort('#5e8f5a',.3),0)}));
      L.push(popLag(G,5,g=>{for(const x of[-6,6.5]){P2(g,box(x-.2,0,x+.2,1.6),kort('#5a3a24',.1),0);P2(g,puff(x,2.8,1.5,1.6,8,.2),kort('#3a6a40',.3),.1)}}))}
    if(art==='kost'){L.push(popLag(G,-8,g=>{P2(g,circ(0,9,5,5,40),{mat:paperMat('#fff0b8','tissue',{glow:'#ffe08a',gi:1.3}),t:.25},0);P2(g,circ(1.6,10.2,.9,.8,14),kort('#e8d494',.04),.26);P2(g,circ(-1.8,7.6,.6,.5,12),kort('#e8d494',.04),.26);for(const[x,y]of[[-7,12],[7,13],[-6,6],[6.5,7]])P2(g,starPts(x,y,.6,.26,0),kort('#f2d27a',.05),0)}));
      L.push(popLag(G,-3,g=>{const r=new THREE.Group();r.position.set(0,8,0);r.rotation.z=.12;g.add(r);for(const q of thick([[[-5,0],[4.6,.2]]],.18))P2(r,q,kort(INK,.1),0);P2(r,toCCW(sm([[-4.6,.5],[-7,1.2],[-7.4,0],[-7,-1.2],[-4.6,-.5]],2)),kort(INK,.1),0);
        P2(r,toCCW(sm([[-1.6,.2],[1.4,.2],[.8,2.8],[-1,3.2]],2)),kort(INK,.1),.05);P2(r,circ(.1,4,.8,.8,14),kort(INK,.1),.06);P2(r,toCCW([[-1.4,4.4],[1.6,4.4],[-.8,7]]),kort(INK,.1),.07);P2(r,toCCW(sm([[-1.6,.6],[-4,2.6],[-4.4,1.4],[-2.4,.2]],2)),kort(INK,.1),.04);P2(g,box(-.06,0,.06,8),kort('#8a6a3a',.05),-.1)}));
      L.push(popLag(G,3,g=>{for(const[x,y,r]of[[-5.5,2.4,2.4],[5,2,2]])P2(g,puff(x,y,r*1.4,r*.8,9,.2),kort('#fbf6ee',.3),0)}))}
    if(art==='doer'){L.push(popLag(G,-5,g=>{const fr=toCCW([[-5,0],[5,0],[5,8],[3.6,10.6],[0,11.6],[-3.6,10.6],[-5,8]]),hul=toCCW([[-3,0],[3,0],[3,7.4],[2,9],[0,9.6],[-2,9],[-3,7.4]]);
        put(g,piece({outer:fr,holes:[hul]},{t:.5,s:30,paint:P=>{P.wash('#9a94b0',fr,{top:'#b0aac4',edge:.4});P.ashlar(null,'#8a84a0',{rowH:[1.2,1.5],bw:[1.6,2.2],tint:.06,ink:.25})}}),0,0,.2);
        put(g,piece(hul,{mat:paperMat('#ffd890','tissue',{glow:'#ffc860',gi:1.6}),t:.05}),0,0,-.2);
        const d=new THREE.Group();d.position.set(-3,0,.1);d.rotation.y=-.75;g.add(d);P2(d,toCCW([[0,0],[6,0],[6,7.4],[5,9],[3,9.6],[1,9],[0,7.4]]),kort('#7a4a2a',.25),0);for(const x of[1.5,3,4.5])P2(d,box(x-.05,.3,x+.05,8.4),kort('#5a3420',.02),.26);P2(d,circ(5,4.4,.35,.35,10),{mat:gold(),t:.1},.3);
        for(const[x,y]of[[-6.5,11],[6.6,10],[0,13.2]])P2(g,starPts(x,y,.7,.3,0),kort('#f2d27a',.05),0)}));
      L.push(popLag(G,1,g=>{P2(g,box(-4,0,4,.8),kort('#8a84a0',.3),0);P2(g,box(-3.2,.8,3.2,1.5),kort('#9a94b0',.3),.1);const l=new THREE.Group();l.position.set(6,0,0);g.add(l);P2(l,box(-.1,0,.1,4),kort('#2a2238',.1),0);put(l,piece(box(-.6,4,.6,5.4),{mat:paperMat('#ffe2a0','tissue',{glow:'#ffc860',gi:1.8}),t:.4}),0,0,0)}))}
    G.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});return{G,L,op:0}}
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
    /* et usynligt felt over navnelinjen: tryk for at skrive */const nh=new THREE.Mesh(new THREE.PlaneGeometry(PW*.8,5),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));nh.rotation.x=-Math.PI/2;nh.position.set(PW/2,PY+.6,-PH/2+PH*(450/1200));hoejre.add(nh);Rm.tap(nh,()=>{if(i===0&&!travl&&!lukket)skriv()})}
  /* ---------- styring: pile, navn og knapper (papknapper i hjørnerne, som resten af spillet) ---------- */
  const DOM=[];const knap=(cls,html,fn)=>{const b=document.createElement('button');b.type='button';b.className='kraft bog-k '+cls;b.innerHTML=html;b.addEventListener('click',fn);document.body.appendChild(b);DOM.push(b);return b};
  const pil=d=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const frem=knap('bog-frem',pil('M9 5l7 7-7 7'),()=>vend(1)),tilb=knap('bog-tilb',pil('M15 5l-7 7 7 7'),()=>vend(-1));frem.setAttribute('aria-label','Næste side');tilb.setAttribute('aria-label','Forrige side');
  const efter=document.createElement('div');efter.className='bog-efter';efter.hidden=true;efter.innerHTML='<p>Men hov … hvordan ser jeg egentlig ud? Det må du bestemme!</p>';document.body.appendChild(efter);DOM.push(efter);
  {const a=document.createElement('button');a.type='button';a.className='fs-knap hot';a.textContent='Lav min heks';a.addEventListener('click',slut);const b=document.createElement('button');b.type='button';b.className='fs-knap';b.textContent='Læs igen';b.addEventListener('click',igen);const r=document.createElement('div');r.className='bog-ek';r.append(a,b);efter.appendChild(r)}
  const inp=document.createElement('input');inp.className='bog-inp';inp.maxLength=14;inp.setAttribute('inputmode','none');inp.setAttribute('autocomplete','off');inp.value=navn;document.body.appendChild(inp);DOM.push(inp);
  if(typeof FORSIDE!=='undefined'&&FORSIDE.kb)FORSIDE.kb(inp);
  inp.addEventListener('input',()=>{navn=inp.value.replace(/\s+/g,' ').replace(/^\s/,'');saetSide(sideH,sideLaerred(i,'r'));pile()});
  function skriv(){try{inp.focus({preventScroll:true})}catch(_){}if(typeof FORSIDE!=='undefined'&&FORSIDE.kbAaben)FORSIDE.kbAaben(inp)}
  const ok=()=>navn.trim().length>0;
  function pile(){tilb.hidden=i===0||lukket||!aaben;frem.hidden=lukket;frem.disabled=(aaben&&i===0&&!ok())||travl;frem.setAttribute('aria-label',aaben?'Næste side':'Åbn bogen')}
  const pyt=()=>{navn=navn.trim();navn=navn.charAt(0).toLocaleUpperCase('da')+navn.slice(1);inp.value=navn};
  /* ---------- at vende en side ---------- */
  const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,fjern=p=>{if(!p)return;p.G.parent&&p.G.parent.remove(p.G);emptyGroup(p.G)};
  function vend(d){if(travl||lukket)return;if(!aaben){aabn();return}if(d>0&&i===0&&!ok()){skriv();return}if(d<0&&i===0)return;if(typeof FORSIDE!=='undefined'&&FORSIDE.kbLuk)FORSIDE.kbLuk();pyt();
    if(d>0&&i===SIDER.length-1){luk();return}travl=true;pile();LYD.pust();const ny=i+d;
    /* bladet drejer om ryggen. Frem: den nye pop-up sidder på bladets bagside og folder sig op, mens bladet lægger sig. Tilbage: den gamle sidder på bladet og folder sig ned */
    if(d>0){blad=bygBlad(sideLaerred(i,'r'),sideLaerred(ny,'l'),1);saetSide(sideH,sideLaerred(ny,'r'));popNy=bygPop(SIDER[ny].art,blad);popNy.G.position.set(PW/2+.4,-.05,GZ);popNy.G.rotation.z=Math.PI}
    else{blad=bygBlad(sideLaerred(i,'l'),sideLaerred(ny,'r'),-1);saetSide(sideV,sideLaerred(ny,'l'));blad.add(pop.G);pop.G.position.set(-PW/2-.4,.05,GZ);popNy=bygPop(SIDER[ny].art,venstre)}
    LYD.fil('bog.pop',()=>LYD.plop(),.4);fase={t:0,d,ny,trin:'vend'}}
  function bygBlad(fraT,tilT,d){/* bladet: forside = siden, der vendes, bagside = den nye side på den anden side; det drejer om ryggen */
    const g=new THREE.Group();g.position.set(0,PY+.35,0);bog.add(g);const f=sidePlan(fraT,(d>0?1:-1)*(PW/2+.4));f.position.y=0;g.add(f);const b=sidePlan(tilT,(d>0?1:-1)*(PW/2+.4));b.position.y=-.02;b.rotation.order='ZYX';b.rotation.set(-Math.PI/2,0,Math.PI);g.add(b);return g}
  function tickFase(dt){if(!fase)return;fase.t+=dt;const F=fase;
    if(F.trin==='aabn'){const u=Math.min(1,F.t/1.4),e=ease(u);venstre.rotation.z=-(1-e)*Math.PI;venstre.position.y=(1-e)*LUKY+Math.sin(u*Math.PI)*1.5;bog.position.x=(1-e)*F.x0;pop.op=clamp((e-.2)/.8,0,1);
      if(u>=1){venstre.rotation.z=0;venstre.position.y=0;bog.position.x=0;fase=null;travl=false;aaben=true;pile();if(!ok())setTimeout(()=>{if(ctx.alive&&i===0&&!travl)skriv()},300)}}
    else if(F.trin==='vend'){const u=Math.min(1,F.t/1.15),e=ease(u);blad.rotation.z=F.d*e*Math.PI;blad.position.y=PY+.35+Math.sin(u*Math.PI)*.6;pop.op=1-clamp(e/.85,0,1);popNy.op=clamp((e-.15)/.85,0,1);
      if(u>=1){if(F.d>0){saetSide(sideV,sideLaerred(F.ny,'l'));venstre.add(popNy.G);popNy.G.position.set(-PW/2-.4,PY+.4,GZ);popNy.G.rotation.z=0}else saetSide(sideH,sideLaerred(F.ny,'r'));
        fjern(pop);pop=popNy;popNy=null;pop.op=1;bog.remove(blad);blad.traverse(q=>{if(q.isMesh){q.geometry.dispose();q.material.map&&q.material.map.dispose();q.material.dispose()}});blad=null;
        i=F.ny;fase=null;travl=false;pile();if(i===0&&!ok())skriv()}}}
  function tickPop(p){if(!p)return;const n=p.L.length;p.L.forEach((g,k)=>{const u=clamp(p.op*(1+.12*n)-k*.12,0,1),s=1.70158,e=u<1?1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2):1;g.rotation.x=-Math.PI/2*(1-e)})}
  /* ---------- åbningen, lukningen og titlen ---------- */
  const TITEL=['Magiske','Mig'],LUKY=4.72,BX=-13;
  function lukketStart(x0){venstre.rotation.z=-Math.PI;venstre.position.y=LUKY;bog.position.x=x0;aaben=false;if(pop)pop.op=0}
  function aabn(){if(travl||aaben||lukket)return;travl=true;pile();LYD.pust();LYD.fil('bog.pop',()=>LYD.plop(),.4);fase={t:0,trin:'aabn',x0:bog.position.x}}
  function luk(){travl=true;lukket=true;pile();fase={t:0,trin:'lukvend'};LYD.pust()}
  function tickLuk(dt){if(!fase||!lukket)return false;const F=fase;F.t+=dt;
    if(F.trin==='lukvend'){const u=Math.min(1,F.t/1.3),e=ease(u);venstre.rotation.z=-e*Math.PI;venstre.position.y=Math.sin(u*Math.PI)*1.5+e*LUKY;bog.position.x=e*(BX-(PW/2+.8));if(pop)pop.op=1-clamp(e/.8,0,1);
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
  function slut(){LYD.valg&&LYD.valg();pyt();SPIL.navn=navn;SPIL.data.intro=true;SPIL.save();LOG.row('intro',{navn:navn.length});enter('garderobe',{skift:true})}
  /* ligger navnelinjen bag spillets tastatur, skubbes hele billedet op, så man kan se, hvad man skriver */
  let skubbet=0;const nv=new THREE.Vector3();
  function skub(dt){const kb=document.querySelector('.kb'),cv=renderer.domElement;let maal=0;
    if(kb&&!kb.hidden&&kb.classList.contains('on')&&i===0&&aaben&&!lukket){const kt=innerHeight-kb.offsetHeight,r=cv.getBoundingClientRect();hoejre.updateWorldMatrix(true,false);nv.set(PW/2,PY,-PH/2+PH*(470/1200)).applyMatrix4(hoejre.matrixWorld).project(Rm.cam);
      const y=r.top+(1-nv.y)/2*r.height+skubbet;maal=Math.max(0,y+24-kt)}
    skubbet+=(maal-skubbet)*Math.min(1,dt*8);if(Math.abs(skubbet)<.5&&maal===0)skubbet=0;cv.style.transform=skubbet?`translateY(${-skubbet}px)`:''}
  /* ---------- rummet: skrivebordet i stearinlysets skær ---------- */
  const OPT={bg:'#1a1220',fit:(c,w,h)=>{const asp=w/h,HH=Math.max(34,62/asp),D=78;c.fov=2*Math.atan(HH/2/D)*180/Math.PI;c.position.set(0,D*Math.sin(.84),D*Math.cos(.84)+4);c.lookAt(0,4,0)},
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
        /* bogen ligger lukket, til man trykker på den (Kasper 23. nov.) */Rm.tap(bog,()=>{if(!aaben&&!lukket)aabn()});setTimeout(()=>{if(ctx.alive&&!aaben&&!travl)ctx.say('Tryk på bogen for at åbne den')},1600)}],
    tick:(t,dt)=>{tiden+=dt;skub(dt);tickPop(pop);tickPop(popNy);if(!tickLuk(dt))tickFase(dt)}};
  makeRoom(ctx,OPT);
  ctx.efter.push(()=>{renderer.domElement.style.transform='';for(const d of DOM)d.remove();if(typeof FORSIDE!=='undefined'&&FORSIDE.kbLuk)FORSIDE.kbLuk();for(const q of bogst)q.m.userData.ryd&&q.m.userData.ryd()});
  ctx.test={aabn,aaben:()=>aaben,side:()=>i,navn:v=>{inp.value=v;inp.dispatchEvent(new Event('input'))},vend,lukket:()=>lukket,fase:()=>fase&&fase.trin,efter:()=>!efter.hidden,spol:sek=>{for(let k=0;k<sek*25;k++)OPT.tick(0,.04)},bogst:()=>bogst.map(q=>[q.m.visible,q.m.position.toArray().map(v=>+v.toFixed(1)),+q.t.toFixed(2)])}};
