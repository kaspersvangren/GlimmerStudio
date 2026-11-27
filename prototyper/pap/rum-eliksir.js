/* ============ Eliksirtimen: læs opskriften på tavlen, tryk på krukkerne, rør i gryden, og pust til ilden ============
   Hvor langt kan du komme? Femten eliksirer i træk, sværere og sværere, og flere og flere stjerner for hver.
   To fejl i samme eliksir (Kasper 23. nov.: det skal være sværere), eller et tomt timeglas, så koger gryden over, og man begynder forfra.
   Nr. 1-3: tre trin. Nr. 4-6: fire trin, røreretning, varme og timeglas. Nr. 7-9: fem trin. Nr. 10-12: seks trin, og kridtet falmer fra oven (to kig). Nr. 13-15: syv trin, hurtigere, ét kig. Timeglasset bliver kortere for hver eliksir. Fra nr. 4 er ild på det forkerte tidspunkt også en fejl. */
ROOMS.eliksir=function(ctx){
  const INGR={blad:{navn:'Paddeblad',col:'#4fbf5a'},draabe:{navn:'Månedråbe',col:'#6ec8ff'},stjerne:{navn:'Stjernestøv',col:'#ffd54a'},svamp:{navn:'Fluesvamp',col:'#e8504a'},fjer:{navn:'Fønixfjer',col:'#ff8a5a'},krystal:{navn:'Troldkrystal',col:'#a07aff'}},IDS=Object.keys(INGR);
  const POTIONS=[{name:'Glimmerdrik',fx:'glimmer',col:'#ffe27a',line:'Du glimter som en stjerne!'},{name:'Hikkedrik',fx:'hop',col:'#9be36a',line:'Hik! Det er en ægte hikkedrik.'},{name:'Boblebryg',fx:'bobler',col:'#9fe7ff',line:'Sæbebobler over det hele!'},
    {name:'Svæveeliksir',fx:'svaev',col:'#8fd8ff',line:'Du svæver! Hold fast i hatten!'},{name:'Hjertedrik',fx:'hjerter',col:'#ff6f9c',line:'Der flyver hjerter ud af ørerne på dig!'},{name:'Krympedrik',fx:'lille',col:'#ff8fc7',line:'Hov, hvor blev du af? Bare rolig, det går over.'},
    {name:'Snurredrik',fx:'snurre',col:'#c9a0ff',line:'Du snurrer rundt som en top!'},{name:'Blomsterdrik',fx:'blomster',col:'#ff9fd0',line:'Der gror blomster omkring dig!'},{name:'Kildedrik',fx:'kilde',col:'#ffd36e',line:'Hihi! Den kilder helt ned i tæerne.'},
    {name:'Kæmpedrik',fx:'stor',col:'#a07aff',line:'Du er blevet kæmpestor!'},{name:'Regnbuesaft',fx:'regnbue',col:'#ffb347',line:'Sikke en farve! Den holder heldigvis kun lidt.'},{name:'Hoppesaft',fx:'hop',col:'#ffb347',line:'Hop, hop, hop! Benene vil ikke holde op.'},
    {name:'Skydrik',fx:'svaev',col:'#dfe8ff',line:'Du er let som en sky.'},{name:'Musedrik',fx:'lille',col:'#c8b8a0',line:'Pip! Du er ikke større end en mus.'},{name:'Mesterbryg',fx:'glimmer',col:'#ffd54a',line:'Den sværeste af dem alle. Du er mesterbrygger!'}],ANTAL=POTIONS.length;
  /* sværhedsgraden for eliksir nr. n: antal trin, hvor mange af hver, om der røres med og mod uret og varmes, sekunder på timeglasset, hvornår kridtet falmer, og antal kig */
  const NIV=n=>n<=3?{trin:3,maxN:2}:n<=6?{trin:4,maxN:3,svaer:1,tid:[85,78,70][n-4]}:n<=9?{trin:5,maxN:3,svaer:1,tid:[64,58,52][n-7]}:n<=12?{trin:6,maxN:3,svaer:1,tid:[54,49,44][n-10],falm:[6,3],kig:2}:{trin:7,maxN:3,svaer:1,tid:[46,42,38][n-13],falm:[4,2.1],kig:1},stjFor=n=>Math.ceil(n/2);
  const MISS=['PUF! Den var vist ikke på opskriften.','Hov! Kig på tavlen igen.','Ups, det sodede lidt. Prøv igen!','Næsten! Se efter på tavlen.'];
  const seeded=str=>{let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296}};
  /* opskriften er sået med eliksirens navn og nummeret på forsøget, så den er ny for hvert forsøg, men den samme, hvis siden hentes igen */
  const makeRecipe=(p,n,frø)=>{const N=NIV(n),Rr=seeded(p.name+'/'+frø),steps=[];let last=null;
    for(let i=0;i<N.trin;i++){const stir=i===N.trin-1||(N.svaer&&i>0&&i<N.trin-2&&steps[i-1].kind!=='ror'&&Rr()<.3);if(stir&&i>0)steps.push({kind:'ror',n:1+Math.floor(Rr()*(N.svaer?3:2))});else{let id;do{id=IDS[Math.floor(Rr()*IDS.length)]}while(id===last);last=id;steps.push({kind:'ing',id,n:1+Math.floor(Rr()*N.maxN)})}}
    steps.forEach(st=>{if(st.kind==='ror'&&N.svaer)st.dir=Rr()<.5?1:-1});if(N.svaer){const at=1+Math.floor(Rr()*(steps.length-2));steps.splice(at,1,{kind:'varme',n:1});if(steps[at-1].kind==='ing'&&steps[at+1]&&steps[at+1].kind==='ing'&&steps[at-1].id===steps[at+1].id){/* samme ingrediens på begge sider af ilden er forvirrende */steps[at+1].id=IDS[(IDS.indexOf(steps[at+1].id)+1)%IDS.length]}}
    return{name:p.name,potion:p,nr:n,N,steps,i:0,got:0,fejl:0,kig:N.kig||0,t:null,vis:0}};
  /* ingrediensernes tegn: de samme former på krukkerne og på tavlen */
  const st5=[];for(let i=0;i<10;i++){const a=Math.PI/2+i/10*TAU,r=i%2?.45:1;st5.push([Math.cos(a)*r,Math.sin(a)*r])}
  const okt=(x,y,r)=>{const o=[];for(let i=0;i<8;i++)o.push([x+Math.cos(i/8*TAU)*r,y+Math.sin(i/8*TAU)*r]);return o};
  const IK={blad:[['#4fbf5a',[[0,-1],[.55,-.4],[.7,.2],[.4,.75],[0,1],[-.4,.75],[-.7,.2],[-.55,-.4]]],['#2f8a3c',[[-.06,-.9],[.06,-.9],[.06,.8],[-.06,.8]]]],
    draabe:[['#6ec8ff',[[0,1],[.35,.35],[.68,-.25],[.5,-.75],[0,-1],[-.5,-.75],[-.68,-.25],[-.35,.35]]],['#e6f7ff',okt(-.2,-.35,.17)]],stjerne:[['#ffd54a',st5]],
    svamp:[['#f6efdc',[[-.3,-1],[.3,-1],[.25,0],[-.25,0]]],['#e8504a',[[-1,-.1],[-.85,.45],[-.4,.9],[0,1],[.4,.9],[.85,.45],[1,-.1]]],['#f6efdc',okt(-.42,.42,.17)],['#f6efdc',okt(.34,.56,.14)],['#f6efdc',okt(.1,.16,.12)]],
    fjer:[['#ff8a5a',[[-.75,-1],[-.2,-.6],[.5,.1],[.8,.9],[.2,.7],[-.4,.1],[-.7,-.5]]],['#b8502a',[[-.88,-1.08],[-.76,-1.12],[.6,.74],[.52,.8]]]],
    krystal:[['#a07aff',[[0,1],[.6,.35],[.42,-1],[-.42,-1],[-.6,.35]]],['#cdb8ff',[[0,1],[.6,.35],[0,.1]]]]};
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),CX=6,LY=15,JX=[-38.5,-28.5],JY=[6.6,17.6,28.6];
  let heks,prof,kat,pot=null,run={n:1,stj:0},tavleT=0,kog=0,busy=false,stirA=null,stirAcc=0,ladA=-.7,fire=0,fx=null,bc,bt,liq,ladle,flames=[],fly=[],bub=[];const mix=new THREE.Color('#3e6a5a'),tgt=new THREE.Color('#3e6a5a');
  const step=()=>pot&&pot.steps[pot.i];
  /* tavlen tegnes med kridt hver gang noget ændrer sig */
  function drawBoard(){const g=bc.getContext('2d'),W=896,H=640,N=pot.N;g.globalAlpha=1;g.fillStyle='#22352d';g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,255,255,.035)';g.lineWidth=26;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-20,60+i*90);g.lineTo(W+20,20+i*95);g.stroke()}
    g.fillStyle='#f6f0dc';g.textAlign='center';g.textBaseline='middle';g.font='700 54px "Alegreya SC","Alegreya Sans",sans-serif';g.fillText(pot.name,W/2,58,W-380);g.fillRect(190,98,W-380,3);
    g.font='700 34px "Alegreya Sans",sans-serif';g.textAlign='left';g.fillStyle='#ffe9a0';g.fillText(`Nr. ${pot.nr} af ${ANTAL}`,40,56);g.textAlign='right';g.fillText(`★ +${stjFor(pot.nr)}`,W-40,56);
    const n=pot.steps.length,rh=Math.min(112,444/n),fs=Math.round(Math.min(50,rh*.6)),tk=pot.t===null?0:pot.t,kigger=pot.vis>0;
    pot.steps.forEach((s,i)=>{const y=112+rh*(i+.5),done=i<pot.i,cur=i===pot.i&&!busy;
      /* kridtet falmer fra oven: linje i begynder at falme efter falm[0] + i · falm[1] sekunder, medmindre man lige har kigget */
      let syn=1;if(N.falm&&!done&&!kigger&&!busy)syn=Math.max(0,Math.min(1,1-(tk-N.falm[0]-i*N.falm[1])/1.2));
      if(cur){g.globalAlpha=1;g.strokeStyle='#ffe9a0';g.lineWidth=5;g.beginPath();g.roundRect(54,y-rh/2+5,W-108,rh-10,16);g.stroke()}
      g.globalAlpha=done?.42:syn;const ix=140,r=rh*.3;
      if(syn<.02&&!done){g.globalAlpha=.16;g.fillStyle='#f6f0dc';g.beginPath();g.roundRect(120,y-fs*.3,W-360,fs*.6,fs*.3);g.fill();g.globalAlpha=syn}
      if(s.kind==='ing'){for(const[c,pts]of IK[s.id]){g.fillStyle=c;g.beginPath();pts.forEach(([px,py],k)=>k?g.lineTo(ix+px*r,y-py*r):g.moveTo(ix+px*r,y-py*r));g.closePath();g.fill()}
        g.fillStyle='#f6f0dc';g.textAlign='left';g.font=`700 ${fs}px "Alegreya Sans",sans-serif`;g.fillText(INGR[s.id].navn,214,y+2);
        const cr=Math.min(19,rh*.2);for(let k=0;k<s.n;k++){const dx=W-150-(s.n-1-k)*cr*3;g.beginPath();g.arc(dx,y,cr,0,TAU);g.strokeStyle='#f6f0dc';g.lineWidth=4;g.stroke();if(done||(i===pot.i&&k<pot.got)){const a=g.globalAlpha;g.globalAlpha=done?.42:1;g.fillStyle=INGR[s.id].col;g.beginPath();g.arc(dx,y,cr*.74,0,TAU);g.fill();g.globalAlpha=a}}}
      else if(s.kind==='ror'){/* de to rørepile er hinandens spejlbilleder: samme bue, pilen peger den vej, der skal røres */
        const d=s.dir||1,R0=r*.8;g.save();g.translate(ix,y);g.scale(d,1);g.strokeStyle='#f6f0dc';g.lineWidth=Math.max(4,rh*.06);g.lineCap='round';g.beginPath();g.arc(0,0,R0,-Math.PI*.95,Math.PI*.5);g.stroke();const ex=0,ey=R0;g.fillStyle='#f6f0dc';g.beginPath();g.moveTo(ex-R0*.62,ey);g.lineTo(ex+R0*.12,ey-R0*.5);g.lineTo(ex+R0*.12,ey+R0*.5);g.closePath();g.fill();g.restore();
        g.textAlign='left';g.font=`700 ${fs}px "Alegreya Sans",sans-serif`;g.fillStyle='#f6f0dc';g.fillText(`Rør ${s.n} ${s.n===1?'gang':'gange'}${s.dir?(s.dir>0?' med uret':' mod uret'):''}`,214,y+2);
        g.textAlign='right';g.fillStyle='#ffe9a0';const a=g.globalAlpha;if(i===pot.i)g.globalAlpha=1;g.fillText(`${done?s.n:(i===pot.i?pot.got:0)} / ${s.n}`,W-96,y+2);g.globalAlpha=a}
      else{g.fillStyle='#ff9a40';g.beginPath();g.moveTo(ix,y-r);g.quadraticCurveTo(ix+r,y,ix+r*.5,y+r*.8);g.quadraticCurveTo(ix,y+r*1.1,ix-r*.5,y+r*.8);g.quadraticCurveTo(ix-r,y,ix,y-r);g.fill();g.fillStyle='#f6f0dc';g.textAlign='left';g.font=`700 ${fs}px "Alegreya Sans",sans-serif`;g.fillText('Varm gryden: tryk på ilden',214,y+2)}
      if(done){g.globalAlpha=1;g.strokeStyle='#9be36a';g.lineWidth=8;g.lineCap='round';g.beginPath();g.moveTo(66,y-2);g.lineTo(82,y+14);g.lineTo(110,y-18);g.stroke()}});
    /* nederst på tavlen: fejlene (to, så koger gryden over), timeglasset og antal kig */
    g.globalAlpha=1;const fy=H-40;
    if(busy){g.fillStyle='#ffe9a0';g.textAlign='center';g.font='700 44px "Alegreya SC","Alegreya Sans",sans-serif';g.fillText(`Færdig!  +${stjFor(pot.nr)} ${stjFor(pot.nr)===1?'stjerne':'stjerner'}`,W/2,fy)}
    else{g.font='700 30px "Alegreya Sans",sans-serif';g.textAlign='left';g.fillStyle='#f6f0dc';g.fillText('Fejl',40,fy+1);for(let k=0;k<2;k++){const x=124+k*44;g.strokeStyle='#f6f0dc';g.lineWidth=3;g.beginPath();g.arc(x,fy,15,0,TAU);g.stroke();if(k<pot.fejl){g.strokeStyle='#ff6a5a';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(x-9,fy-9);g.lineTo(x+9,fy+9);g.moveTo(x+9,fy-9);g.lineTo(x-9,fy+9);g.stroke()}}
      if(N.tid){const x0=268,x1=N.falm?W-250:W-48,k=Math.max(0,1-tk/N.tid);g.strokeStyle='#f6f0dc';g.lineWidth=3;g.beginPath();g.roundRect(x0,fy-13,x1-x0,26,13);g.stroke();g.fillStyle=k<.25?'#ff6a5a':'#e8c878';if(k>0){g.beginPath();g.roundRect(x0+4,fy-9,Math.max(8,(x1-x0-8)*k),18,9);g.fill()}}
      if(N.falm){g.textAlign='right';g.fillStyle='#f6f0dc';g.fillText('Kig',W-140,fy+1);for(let k=0;k<N.kig;k++){const x=W-104+k*52,paa=k<pot.kig;g.globalAlpha=paa?1:.25;g.strokeStyle='#f6f0dc';g.lineWidth=3;g.beginPath();g.ellipse(x,fy,20,12,0,0,TAU);g.stroke();g.fillStyle='#9fe7ff';g.beginPath();g.arc(x,fy,7,0,TAU);g.fill();g.globalAlpha=1}}}
    bt.needsUpdate=true}
  const NYT={4:'Nu skal der røres den rigtige vej, og gryden skal varmes. Og sandet løber i timeglasset! Pust kun til ilden, når opskriften siger det.',7:'Fem trin nu, og sandet løber hurtigere.',10:'Nu falmer kridtet fra oven. Tryk på tavlen, hvis du vil kigge igen: du har to kig.',13:'De sidste tre! Kridtet falmer hurtigt, og du har kun ét kig.'};
  const start=()=>{SPIL.data.elRun=(SPIL.data.elRun||0)+(run.n===1?1:0);pot=makeRecipe(POTIONS[(run.n-1)%ANTAL],run.n,SPIL.data.elRun);busy=false;kog=0;tgt.set('#3e6a5a');stirAcc=0;drawBoard();
    ctx.say(run.n===1?`Hvor langt kan du komme? Vi begynder med ${pot.name}. To fejl, så koger gryden over!`:NYT[run.n]||`Nr. ${run.n}: ${pot.name}.`)};
  /* uret (og kridtet) går i gang ved det første tryk, eller efter seks sekunder */
  const igang=()=>{if(pot&&pot.t===null&&!busy)pot.t=0};
  const fejl=txt=>{igang();pot.fejl++;LYD.fil('eliksir.fejl',()=>LYD.puf());Rm.burst(CX,19,8,8,'rgba(90,90,100,.9)',4);drawBoard();if(pot.fejl>=2)kogOver('To fejl');else ctx.say(txt+(pot.fejl===1?' Pas på: én fejl mere, så koger den over!':''))};
  const kogOver=hvorfor=>{busy=true;kog=1;LYD.fil2('eliksir.koger','fuser');tgt.set('#5a5f4a');Rm.burst(CX,20,8,16,'rgba(120,130,110,.95)',10);const naaet=run.n-1,rek=Math.max(SPIL.data.elRek||0,naaet);SPIL.data.elRek=rek;SPIL.save();LOG.row('eliksir',{slut:hvorfor,naaet,stj:run.stj});
    ctx.vent(`${hvorfor==='To fejl'?'To fejl: gryden kogte over!':'Sandet løb ud, og gryden kogte over!'} Du klarede ${naaet} ${naaet===1?'eliksir':'eliksirer'} og fik ${run.stj} ${run.stj===1?'stjerne':'stjerner'}. Din rekord er ${rek}.`,()=>{run={n:1,stj:0};start()})};
  const kigPaa=()=>{if(!pot||busy||!pot.N.falm)return;igang();if(pot.vis>0)return;if(pot.kig<=0){ctx.say('Du har ikke flere kig i denne eliksir.');return}pot.kig--;pot.vis=3.2;LYD.valg();drawBoard()};
  const tip=()=>{const s=step();if(!s)return;if(s.kind==='ror')ctx.say('Nu skal der røres! Tegn cirkler rundt om gryden med fingeren.');else if(s.kind==='varme')ctx.say('Gryden skal varmes: tryk på ilden.')};
  let venter=false;/* et trin kan kun afsluttes én gang, også selv om fingeren bliver ved med at røre */
  const naeste=ms=>{if(venter)return;venter=true;setTimeout(advance,ms)};
  const advance=()=>{venter=false;if(!ctx.alive||busy)return;pot.i++;pot.got=0;stirAcc=0;if(pot.i>=pot.steps.length)finish();else{drawBoard();if(pot.nr<=4)tip()}};
  /* ---- effekterne: hver eliksir gør det, professoren siger. Hjerter, bobler og blomster er små papirmærker, der flyver, stiger eller gror; regnbuen farver heksen ---- */
  const HX=-13.5,maerke=tegn=>{const c=cv(96,96),g=c.getContext('2d');g.translate(48,48);tegn(g);return tx(c,true)},TEGN={
    hjerter:g=>{g.fillStyle='#ff5a8a';g.strokeStyle='#a01848';g.lineWidth=4;g.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,x=34*16*Math.pow(Math.sin(a),3)/17,y=-34*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/17-4;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-13,-14,7,4.5,-.6,0,TAU);g.fill()},
    bobler:g=>{const gr=g.createRadialGradient(-10,-12,2,0,0,40);gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(.5,'rgba(170,225,255,.22)');gr.addColorStop(1,'rgba(190,150,255,.5)');g.fillStyle=gr;g.beginPath();g.arc(0,0,40,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=3;g.stroke();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(-15,-17,9,5,-.7,0,TAU);g.fill()},
    blomster:g=>{g.strokeStyle='#3f8a4a';g.lineWidth=6;g.beginPath();g.moveTo(0,44);g.lineTo(0,2);g.stroke();g.fillStyle='#4f9a5a';g.beginPath();g.ellipse(11,26,11,5,-.5,0,TAU);g.fill();for(let k=0;k<6;k++){const a=k/6*TAU;g.fillStyle=k%2?'#ff8fc7':'#ffb3d9';g.beginPath();g.arc(Math.cos(a)*16,-14+Math.sin(a)*16,12,0,TAU);g.fill()}g.fillStyle='#f2c230';g.beginPath();g.arc(0,-14,10,0,TAU);g.fill()}};
  const FXM=[],farvet=[];
  const fxStart=kind=>{fx={kind,t:0,ud:null};if(TEGN[kind]){const map=maerke(TEGN[kind]);for(let i=0;i<14;i++){let q=FXM[i];if(!q){const sp=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));Rm.live.add(sp);q=FXM[i]={s:sp}}if(q.s.material.map&&q.s.material.map!==map&&i===0)q.s.material.map.dispose();q.s.material.map=map;q.s.material.needsUpdate=true;q.s.material.opacity=0;q.s.visible=true;
        q.d=i*.22;q.a=i/14*TAU;q.sx=i%2?1:-1;q.r=.6+((i*37)%10)/10*.8;q.px=HX+((i*53)%29-14);q.py=1+((i*31)%7);q.bx=HX+(i%2?1:-1)*(3+((i*17)%13)*.55);q.bz=6.5+((i*29)%10)*.55}}
    if(kind==='regnbue')heks.G.traverse(m=>{if(m.isMesh&&!m.isSprite){const o=m.material,n=Array.isArray(o)?o.map(x=>x.clone()):o.clone();for(const x of[].concat(n))x.vertexColors=false;farvet.push({m,o,n});m.material=n}})};
  const fxSlut=()=>{fx=null;for(const q of FXM)q.s.visible=false;for(const f of farvet){f.m.material=f.o;for(const x of[].concat(f.n))x.dispose()}farvet.length=0;if(heks){heks.G.rotation.z=0}};
  const fxTegn=(dt,k,y)=>{const t=fx.t,kind=fx.kind;
    if(kind==='regnbue'){const c=new THREE.Color();farvet.forEach((f,i)=>{c.setHSL((t*.45+i*.013)%1,.85,.5+.25*(1-k));c.lerp(new THREE.Color('#ffffff'),1-k);for(const x of[].concat(f.n))x.color.copy(c)})}
    if(kind==='kilde')heks.G.rotation.z=.11*Math.sin(t*19)*k;
    if(!TEGN[kind])return;
    FXM.forEach(q=>{const u=((t-q.d)%1.9+1.9)%1.9/1.9,paa=t>q.d&&fx.ud===null,S=q.s;
      if(kind==='hjerter'){/* ud af ørerne: skiftevis fra venstre og højre side af hovedet */S.position.set(HX+q.sx*(1.9+u*7.5),19.6+y+u*5.5+Math.sin(u*9+q.a)*.6,9);const z=(1.9+u*2.8)*q.r;S.scale.set(z,z,1);S.material.opacity=paa?Math.min(1,u*8)*(1-u*u):0}
      if(kind==='bobler'){S.position.set(q.px+Math.sin(t*2+q.a)*1.2,q.py+u*26,10+(q.a%2));const z=2+q.r*2.6;S.scale.set(z,z,1);S.material.opacity=paa?Math.min(1,u*6)*(u>.86?(1-u)/.14:1)*.95:0}
      if(kind==='blomster'){const g=Math.min(1,Math.max(0,(t-q.d*.6)/.5)),ud=fx.ud===null?1:Math.max(0,1-(t-fx.ud)/.4),z=3.4*q.r*g*ud*(1+.06*Math.sin(t*6+q.a));S.position.set(q.bx,.3+z/2,q.bz);S.scale.set(z,z,1);S.material.opacity=g>0?1:0}})};
  /* færdig: stjerner, og virkningen varer ved, til man trykker videre */
  const finish=()=>{LYD.fanfare();busy=true;const stj=stjFor(pot.nr),sidste=pot.nr>=ANTAL;SPIL.eliksir=(SPIL.eliksir||0)+1;run.stj+=stj+(sidste?10:0);SPIL.data.elRek=Math.max(SPIL.data.elRek||0,pot.nr);SPIL.giv(stj+(sidste?10:0));tgt.set(pot.potion.col);Rm.burst(CX,22,8,14,'rgba(255,240,180,.95)',9);drawBoard();fxStart(pot.potion.fx);
    if(sidste)LOG.row('eliksir',{slut:'alle',naaet:ANTAL,stj:run.stj});
    ctx.vent(sidste?`${pot.name}! Du har brygget alle ${ANTAL} eliksirer i træk og får 10 stjerner ekstra. I alt ${run.stj} stjerner!`:`${pot.name}! ${pot.potion.line}`,()=>{if(fx)fx.ud=fx.t;setTimeout(()=>{if(!ctx.alive)return;fxSlut();if(sidste)run={n:1,stj:0};else run.n++;start()},450)})};
  const jarTap=id=>()=>{if(busy||!pot||venter)return;const s=step();igang();if(s.kind==='ing'&&s.id===id&&pot.got<s.n){/* whoosh, når den kastes, og plask først, når den rammer gryden (Kasper 27. nov.) */LYD.fil('eliksir.woosh');setTimeout(()=>LYD.fil('ingrediens',()=>LYD.plop()),540);pot.got++;const j=IDS.indexOf(id);const q=fly.find(f=>f.t>1)||fly[0];q.t=0;q.x0=JX[j%2];q.y0=JY[j>>1]+5;q.s.material.color.set(INGR[id].col);
        tgt.lerp(new THREE.Color(INGR[id].col),.55);drawBoard();if(pot.got>=s.n)naeste(620)}
      else if(s.kind==='ror'){if(pot.nr>3)fejl('Hov! Der skulle røres.');else ctx.say('Først skal der røres! Tegn cirkler rundt om gryden med fingeren.')}else if(s.kind==='varme'){if(pot.nr>3)fejl('Hov! Gryden skulle varmes.');else ctx.say('Først skal gryden varmes: tryk på ilden.')}else fejl(MISS[Math.floor(Math.random()*MISS.length)])};
  const Rm=makeRoom(ctx,{bg:'#0d1012',fit:fitBox(88,50,-2,20.5),sky:'#a8c8b8',ground:'#30382e',amb:.45,key:{col:'#ffe0b8',i:1.7,tgt:[0,16,0]},
    drag:(ph,e,Rm)=>{const s=step();if(!s||s.kind!=='ror'||busy||venter)return;igang();const p=Rm.planeAt(e,6);if(!p)return;const a=Math.atan2((p.y-LY)*2.2,p.x-CX);if(ph==='start'||stirA===null){stirA=a;return}if(ph==='end'){stirA=null;return}
      let d=a-stirA;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;stirA=a;ladA=a;stirAcc=s.dir?Math.max(0,stirAcc-d*s.dir):stirAcc+d;const turns=Math.floor(Math.abs(stirAcc)/TAU);
      if(turns>pot.got){LYD.roer();pot.got=Math.min(s.n,turns);drawBoard();Rm.burst(CX,LY+2,8,5,'rgba(255,255,255,.8)',5);if(pot.got>=s.n){stirA=null;naeste(500)}}},
    build:Rm=>[()=>{const g=Rm.scene,W=box(-76,-2,76,64);
        P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{P.wash('#4a5650',W,{top:'#2e3a38',edge:0,clouds:16});P.ashlar(W,'#56625c',{rowH:[3.4,4.4],bw:[5.5,9],tint:.07,ink:.24})}},-10);
        for(let i=0;i<40;i++)Rm.floor(box(-76,-10+i*1.05,76,-9+i*1.05),{color:shade('#5a4632',R(-.06,.06)),kind:'balsa',t:.3},0);
        /* tørrede urter under loftet */
        for(const[x,c]of[[-16,'#6a8a4a'],[24,'#8a7a3a'],[32,'#5a8a5a'],[38,'#9a6a4a']]){for(const s of thick([[[x,64],[x,43]]],.1))P2(g,s,{color:'#c8b890',t:.06},-8);for(let k=-2;k<=2;k++)P2(g,leafPts(x+k*.8,39.6-Math.abs(k)*.5,6,1.5,Math.PI+k*.16),{color:shade(c,R(-.08,.08)),kind:'water',t:.1},-7.8+k*.04)}},
      ()=>{const g=Rm.scene;/* hylden med seks krukker */
        P2(g,box(-44.5,0,-22.5,41),{t:.6,s:12,paint:P=>boards(P,null,'#4a2e1c',{dir:'v',h:2.4,ink:.3})},-9.6);for(const x of[-44.5,-23.7])P2(g,box(x,0,x+1.2,41.6),{color:'#6a4426',kind:'balsa',t:4.4},-9.6);for(const y of[...JY,40.4])P2(g,box(-44.5,y-1,-22.5,y),{color:'#7a5230',kind:'balsa',t:4.6},-9.6);
        IDS.forEach((id,j)=>{const x=JX[j%2],y=JY[j>>1],c=INGR[id].col,jar=sm([[x-3.1,y],[x+3.1,y],[x+3.4,y+5.6],[x+2,y+7.2],[x-2,y+7.2],[x-3.4,y+5.6]],5),jg=new THREE.Group();g.add(jg);
          P2(jg,jar,{t:1.6,mat:paperMat('#f2fbff','tissue',{glow:c,gi:.35})},-6.6);for(const q of clip([jar],[box(x-4,y,x+4,y+3.3)],'inter'))P2(jg,q,{color:c,kind:'water',t:.2},-4.9);
          P2(jg,box(x-2.3,y+7.2,x+2.3,y+8.2),{color:'#c8a070',kind:'balsa',t:1.8},-6.7);P2(jg,circ(x,y+3.9,2.3,2.3,24),{color:'#f6efdc',kind:'card',t:.1},-4.7);
          for(const[col,pts]of IK[id])P2(jg,toCCW(pts.map(([px,py])=>[x+px*1.6,y+3.9+py*1.6])),{color:col,kind:'water',t:.06},-4.55);
          const hb=new THREE.Mesh(new THREE.PlaneGeometry(9,10),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,y+4.4,-4.4);jg.add(hb);Rm.tap(hb,jarTap(id))})},
      ()=>{const g=Rm.scene;/* gryden over ilden, og tavlen */
        for(const[a,b]of[[CX-7,CX+6],[CX-5,CX+8]])P2(g,toCCW([[a,.2],[b,.2],[b,1.7],[a,1.7]]),{color:'#5c3c28',kind:'balsa',t:2},5);for(const dx of[-7.5,7.5])P2(g,box(CX+dx-.7,0,CX+dx+.7,5.6),{color:'#1c1a22',t:1},5.6);
        const bd=sm([[CX-9.4,13.6,1],[CX+9.4,13.6,1],[CX+10.9,9.6],[CX+8,5.2],[CX,3.8],[CX-8,5.2],[CX-10.9,9.6]],8);P2(g,bd,{t:1.6,s:26,paint:P=>{P.wash('#2a2630',bd,{top:'#3c3846',edge:.6,clouds:6});P.wash('#5a5668',circ(CX-5.4,10.6,1.6,3,14),{alpha:.5,edge:.6,mode:'source-over'})}},5.6);
        for(const s of[-1,1])for(const q of ring(circ(CX+s*11,11.4,1.5,1.9,20),.4,false))P2(g,q,{color:'#3a3644',t:.5},5.4);
        P2(g,sm([[CX-10.6,13.1],[CX+10.6,13.1],[CX+10.6,14.9],[CX-10.6,14.9]],3),{color:'#3a3644',kind:'water',t:2},6.6);
        Rm.glow(CX,3.4,8.4,'#ff9a40',16,true);const L=new THREE.PointLight('#ff9a50',60,40,2);put(g,L,CX,4,12);
        const hb=new THREE.Mesh(new THREE.PlaneGeometry(18,6),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(CX,2.6,9.6);g.add(hb);Rm.tap(hb,()=>{if(busy||!pot||venter)return;const s=step();igang();if(s.kind==='varme'){LYD.ild();fire=1;Rm.burst(CX,5,9,8,'rgba(255,170,80,.95)',6);pot.got=1;drawBoard();naeste(650)}else if(pot.nr>3)fejl('Hov! Ilden skulle ikke have mere lige nu.');else ctx.say('Ilden er fin lige nu. Pust til den, når opskriften siger det.')});
        P2(g,box(CX-15.6,24.2,CX+15.6,46.4),{color:'#6a4426',kind:'balsa',t:.8},-9.4);P2(g,box(CX-15.6,23.4,CX+15.6,24.4),{color:'#86593a',kind:'balsa',t:2},-9.2);P2(g,box(CX-11,24.4,CX-8,25),{color:'#f6f0dc',kind:'card',t:.6},-8.4)},
      ()=>{const lv=Rm.live;bc=cv(896,640);bt=tx(bc,true);const bm=new THREE.Mesh(new THREE.PlaneGeometry(29.2,20.8),new THREE.MeshBasicMaterial({map:bt,toneMapped:false}));bm.position.set(CX,35.4,-8.5);bm.userData.noShadow=true;lv.add(bm);Rm.tap(bm,kigPaa);
        liq=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshStandardMaterial({color:mix,emissive:mix,emissiveIntensity:.55,roughness:.5}));liq.scale.set(9.5,1.5,1);liq.position.set(CX,LY,6.3);liq.userData.noShadow=true;lv.add(liq);
        ladle=new THREE.Group();lv.add(ladle);for(const s of thick([[[0,-.6],[2.2,12.4]]],.42))put(ladle,piece(s,{color:'#b5844a',kind:'balsa',t:.4}),0,0,0);put(ladle,piece(circ(2.3,12.6,.8,.8,12),{color:'#8a5a2a',kind:'balsa',t:.5}),0,0,0);
        for(const dx of[-4.4,0,4.2]){const f=piece(toCCW(sm([[-1.5,0,1],[1.5,0,1],[1.7,2.2],[.5,3.6],[0,5.4,1],[-.8,3.4],[-1.8,2]],6)),{t:.3,mat:paperMat('#fff0c0','tissue',{glow:'#ff9a30',gi:1.9})});f.position.set(CX+dx,1.4,8.2+Math.abs(dx)*.05);f.userData.noShadow=true;lv.add(f);flames.push({m:f,ph:R(TAU),k:dx?0.8:1})}
        for(let i=0;i<3;i++){const s=glowSprite('rgba(255,255,255,.95)',3.4);s.visible=false;lv.add(s);fly.push({s,t:9,x0:0,y0:0})}
        for(let i=0;i<7;i++){const s=glowSprite('rgba(255,255,255,.8)',1.2);lv.add(s);bub.push({s,t:R(0,1),x:R(-7,7),v:R(.5,1.1)})}
        heks=makeFigure(Object.assign({},ctx.look));heks.G.scale.setScalar(.8);heks.G.position.set(-13.5,.35,4);lv.add(heks.G);Rm.blob(-13.5,4,13,5);Rm.tap(heks.G,tip);kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.5);kat.G.position.set(-22.5,.9,10.5);lv.add(kat.G);Rm.blob(-21,10.5,8,3.4);
        prof=makeFigure({tøj:'opdager',hat:'eventyrhat',hår:'kort',kappe:'ingen',tilbehør:'ingen',stav:false,skæg:'#ece6da',hair:['#d8d2c8','#f4f0e8','#a8a098'],lash:0,freck:false,iris:['#9be0a6','#2f7a44'],col:{bukser:'#5a6a4a'}});prof.G.scale.set(-.8,.8,.8);prof.G.position.set(31,.35,4);lv.add(prof.G);Rm.blob(31,4,13,5);Rm.tap(prof.G,()=>ctx.say(['Jeg har brygget eliksirer i fire hundrede år.','Pas på dampen, den kilder i næsen.','Se godt på tavlen, så går det fint.'][Math.floor(Math.random()*3)]));
        start()}],
    tick:(t,dt)=>{if(pot&&!busy){if(pot.t===null){pot.vent=(pot.vent||0)+dt;if(pot.vent>6&&(pot.N.tid||pot.N.falm))pot.t=0}else{pot.t+=dt;if(pot.vis>0)pot.vis-=dt;if(pot.N.tid&&pot.t>=pot.N.tid)kogOver('Tiden');else if((pot.N.tid||pot.N.falm)&&(tavleT+=dt)>.2){tavleT=0;drawBoard()}}}kog=Math.max(0,kog-dt*.25);
      mix.lerp(tgt,Math.min(1,dt*3));liq.material.color.copy(mix);liq.material.emissive.copy(mix);liq.material.emissiveIntensity=busy?1.1:.55;fire=Math.max(0,fire-dt*.6);
      for(const f of flames){const k=f.k*(1+.14*Math.sin(t*11+f.ph)+.08*Math.sin(t*17+f.ph*2))*(1+fire*.9);f.m.scale.set(1+fire*.3,k,1)}
      if(stirA===null)ladA+=dt*.25;ladle.position.set(CX+Math.cos(ladA)*5.6-2.2*.0,LY+.4+Math.sin(ladA)*.9,6.5);ladle.rotation.z=-Math.cos(ladA)*.32-.1;
      for(const q of fly){q.t+=dt*1.7;if(q.t>1){q.s.visible=false;continue}q.s.visible=true;const k=q.t;q.s.position.set(q.x0+(CX-q.x0)*k,q.y0+(LY-q.y0)*k+Math.sin(k*Math.PI)*9,8);if(k>.92)Rm.burst(CX,LY+1.5,8,4,'rgba(255,255,255,.8)',4)}
      for(const b of bub){b.t+=dt*b.v;if(b.t>1){b.t=0;b.x=R(-7.5,7.5)}b.s.position.set(CX+b.x*(1+kog*.5),LY+.3+b.t*(busy?7+kog*9:3.2),6.8);const z=(1-b.t)*(busy?1.9+kog*1.6:1.2);b.s.scale.set(z,z,1);b.s.material.color.copy(mix).lerp(new THREE.Color('#ffffff'),.45)}
      let y=.35,sc=.8,ry=0;if(fx){fx.t+=dt;const k=Math.min(1,fx.t/.7)*(fx.ud===null?1:Math.max(0,1-(fx.t-fx.ud)/.4));if(fx.kind==='svaev')y+=(9+Math.sin(fx.t*2.1)*.9)*k;else if(fx.kind==='lille')sc*=1-.62*k;else if(fx.kind==='stor')sc*=1+.4*k;else if(fx.kind==='snurre')ry=fx.t*9*k;else if(fx.kind==='hop')y+=Math.abs(Math.sin(fx.t*7))*4.5*k;else if(fx.kind==='kilde')y+=Math.abs(Math.sin(fx.t*15))*.8*k;fxTegn(dt,k,y-.35);if(fx.kind==='glimmer'&&fx.ud===null&&Math.floor(fx.t*5)!==Math.floor((fx.t-dt)*5))Rm.burst(-13.5,14+y,8,4,'rgba(255,236,170,.95)',7)}
      heks.G.position.y=y;heks.G.scale.setScalar(sc);heks.G.rotation.y=ry;heks.tick(t,{ph:0,amp:0});prof.tick(t+2,{ph:0,amp:0});kat.tick(t+1,{ph:0,amp:0})}});
  ctx.test={fx:k=>{fxSlut();fxStart(k)},run:()=>run,nr:n=>{run.n=n;start()},kig:kigPaa,tid:x=>{pot.t=x;drawBoard()},fejl:()=>fejl('Prøve'),løs:()=>{const s=step();if(!s)return;if(s.kind==='ing'){for(let i=pot.got;i<s.n;i++)jarTap(s.id)()}else{pot.got=s.n;drawBoard();naeste(0)}},jar:id=>jarTap(id)(),stir:()=>{const s=step();if(s&&s.kind==='ror'){pot.got=s.n;drawBoard();advance()}},heat:()=>{const s=step();if(s&&s.kind==='varme'){fire=1;advance()}},step:()=>step(),pot:()=>pot}};
