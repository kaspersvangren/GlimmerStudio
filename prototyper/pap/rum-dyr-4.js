/* ============ Dyreparken, del 4: Ungestalden ============
   Fire dyreunger, der skal passes: kæles (stryg med fingeren), have mad, vaskes (gnid) og leges med.
   Hver unge har tre behov: mæt, ren og glad. De falder langsomt, også mens man er væk (ungen husker, hvornår man sidst var der).
   Når et behov bliver fyldt helt op, kommer ungen et skridt nærmere et nyt hjerte; hvert hjerte giver to stjerner, og ved ti hjerter er man bedste venner. */
ROOMS.ungestald=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),XS=[-31.5,-10.5,10.5,31.5],SC=1.12,PL=6.4,BY=PL+2.4,nu=()=>Date.now(),S=SPIL.data.unger=SPIL.data.unger||{};let vaekTimer=0;
  const B=UNGEID.map((id,i)=>{const ny=!S[id],s=S[id]=Object.assign({m:.45,r:.55,g:.35,h:0,p:0,t:nu()},S[id]||{}),timer=clamp((nu()-s.t)/3.6e6,0,72);vaekTimer=Math.max(vaekTimer,ny?0:timer);
    s.m=clamp(s.m-timer*.09,0,1);s.r=clamp(s.r-timer*.04,0,1);s.g=clamp(s.g-timer*.11,0,1);return{id,i,x:XS[i],s,D:UNGER[id],U:null,glad:0,hop:0,hopN:0,spis:0,sov:false,ro:0,fuld:{},dist:0}});
  let tool='kael',gemT=0,sidst=null,flaske,bold,svamp,busyB=null;const hjerter=[],bobl=[],zzz=[],skilt=[],tanke=[];
  /* ---- knapperne nederst ---- */
  const bar=document.getElementById('pleje'),TOOLS=[['kael','Kæl'],['mad','Mad'],['vask','Vask'],['leg','Leg'],['godbid','Godbid']],knap={};
  const visKnap=()=>{for(const[k]of TOOLS){knap[k].setAttribute('aria-pressed',String(tool===k))}const n=SPIL.data.godbid||0;knap.godbid.textContent=`Godbid (${n})`;knap.godbid.disabled=!n;if(!n&&tool==='godbid'){tool='kael';knap.kael.setAttribute('aria-pressed','true')}};
  for(const[k,navn]of TOOLS){const b=document.createElement('button');b.type='button';b.textContent=navn;b.addEventListener('click',()=>{LYD.tryk();tool=k;visKnap();ctx.say({kael:'Stryg ungen med fingeren',mad:'Tryk på den unge, der er sulten',vask:'Gnid ungen ren med fingeren',leg:'Tryk på en unge, så leger I med bolden',godbid:'Tryk på den unge, der skal have en godbid'}[k])});bar.appendChild(b);knap[k]=b}
  /* ---- små billeder: hjerte, boble, Z, flaske, bold, svamp og tegnene på skiltene ---- */
  const maerke=(px,tegn)=>{const c=cv(px,px),g=c.getContext('2d');g.translate(px/2,px/2);tegn(g,px/2);return tx(c,true)};
  const hjerteSti=(g,r)=>{g.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,x=r*16*Math.pow(Math.sin(a),3)/17,y=-r*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/17-r*.1;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath()};
  const T={hjerte:(g,r)=>{hjerteSti(g,r*.8);g.fillStyle='#ff5a8a';g.fill();g.strokeStyle='#a01848';g.lineWidth=r*.08;g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-r*.3,-r*.32,r*.16,r*.1,-.6,0,TAU);g.fill()},
    boble:(g,r)=>{const gr=g.createRadialGradient(-r*.25,-r*.3,r*.05,0,0,r*.9);gr.addColorStop(0,'rgba(255,255,255,.85)');gr.addColorStop(.5,'rgba(190,230,255,.3)');gr.addColorStop(1,'rgba(200,170,255,.6)');g.fillStyle=gr;g.beginPath();g.arc(0,0,r*.9,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=r*.06;g.stroke()},
    z:(g,r)=>{g.fillStyle='#cfe0ff';g.strokeStyle='#3a4a8a';g.lineWidth=r*.1;g.font=`900 ${r*1.5}px "Alegreya Sans",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.strokeText('Z',0,0);g.fillText('Z',0,0)},
    flaske:(g,r)=>{g.rotate(.5);g.fillStyle='#fdf8ec';g.strokeStyle='#8a7a6a';g.lineWidth=r*.07;g.beginPath();g.roundRect(-r*.36,-r*.3,r*.72,r*1.15,r*.2);g.fill();g.stroke();g.fillStyle='#ffd0e0';g.fillRect(-r*.36,r*.1,r*.72,r*.5);g.fillStyle='#ff9ab8';g.beginPath();g.roundRect(-r*.42,-r*.5,r*.84,r*.24,r*.08);g.fill();g.fillStyle='#f2c8a0';g.beginPath();g.ellipse(0,-r*.7,r*.2,r*.28,0,0,TAU);g.fill()},
    bold:(g,r)=>{g.beginPath();g.arc(0,0,r*.85,0,TAU);g.fillStyle='#ffd54a';g.fill();g.save();g.clip();g.fillStyle='#e0457a';g.beginPath();g.moveTo(0,0);g.arc(0,0,r,-.5,.6);g.closePath();g.fill();g.fillStyle='#43a3d3';g.beginPath();g.moveTo(0,0);g.arc(0,0,r,1.7,2.8);g.closePath();g.fill();g.fillStyle='#5fd070';g.beginPath();g.moveTo(0,0);g.arc(0,0,r,3.7,4.8);g.closePath();g.fill();g.restore();g.strokeStyle='#7a5a10';g.lineWidth=r*.07;g.beginPath();g.arc(0,0,r*.85,0,TAU);g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-r*.3,-r*.4,r*.2,r*.12,-.6,0,TAU);g.fill()},
    svamp:(g,r)=>{g.fillStyle='#ffe07a';g.strokeStyle='#b8862a';g.lineWidth=r*.07;g.beginPath();g.roundRect(-r*.8,-r*.5,r*1.6,r,r*.3);g.fill();g.stroke();g.fillStyle='#e8b840';for(const[x,y]of[[-.4,-.1],[.2,.15],[.45,-.2],[-.1,.25]]){g.beginPath();g.arc(x*r,y*r,r*.1,0,TAU);g.fill()}},
    godbid:(g,r)=>{g.fillStyle='#ffd54a';g.strokeStyle='#b87a10';g.lineWidth=r*.07;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*TAU,q=i%2?r*.45:r*.85;g[i?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill();g.stroke()}};
  const sprite=(map,size)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthWrite:false}));s.scale.set(size,size,1);s.visible=false;return s};
  /* ---- skiltet over hver unge: navn, hjerter og de tre behov ---- */
  const tegnSkilt=b=>{const q=skilt[b.i],g=q.c.getContext('2d'),W=320,H=208,s=b.s;g.clearRect(0,0,W,H);g.fillStyle=s.h>=10?'#f6dc8a':'#f6e7c0';g.strokeStyle=s.h>=10?'#c9a04a':'#8a5a36';g.lineWidth=6;g.beginPath();g.roundRect(4,4,W-8,H-8,18);g.fill();g.stroke();
    g.fillStyle='#4a2c18';g.textAlign='center';g.textBaseline='middle';g.font=FONT.dyr.replace('X','40px');g.fillText(b.D.navn,W/2,38);g.font='700 19px "Alegreya Sans",sans-serif';g.fillStyle='#7a5a3a';g.fillText(s.h>=10?'Din bedste ven':b.D.art,W/2,70);
    for(let i=0;i<10;i++){g.save();g.translate(34+i*28,100);hjerteSti(g,11);g.fillStyle=i<s.h?'#ff5a8a':'rgba(120,80,50,.18)';g.fill();g.restore()}
    [['m','Mæt','#f2a040'],['r','Ren','#5ab8e8'],['g','Glad','#ff6f9c']].forEach(([k,navn,col],i)=>{const y=132+i*23;g.textAlign='left';g.font='700 19px "Alegreya Sans",sans-serif';g.fillStyle='#4a2c18';g.fillText(navn,22,y+1);g.fillStyle='rgba(74,44,24,.18)';g.beginPath();g.roundRect(84,y-8,W-108,16,8);g.fill();const v=clamp(s[k],0,1);g.fillStyle=v<.3?'#e0503a':col;if(v>.02){g.beginPath();g.roundRect(84,y-8,Math.max(16,(W-108)*v),16,8);g.fill()}});
    q.t.needsUpdate=true;q.v=[s.m,s.r,s.g,s.h].join()};
  const fyld=(b,k,d)=>{const s=b.s,foer=s[k];s[k]=clamp(s[k]+d,0,1);if(foer<.8)b.fuld[k]=true;if(s[k]>=.995&&b.fuld[k]){b.fuld[k]=false;point(b)}};
  /* et skridt nærmere et hjerte: tre skridt giver et hjerte */
  const point=b=>{const s=b.s;if(s.h>=10)return;s.p++;if(s.p>=3){s.p=0;s.h++;LYD.gave();b.glad=1.6;for(let i=0;i<7;i++)hjerte(b.x+R(-5,5),BY+10+R(0,7),1.3);Rm.burst(b.x,BY+12,8,14,'rgba(255,170,200,.95)',8);
      if(s.h>=10){SPIL.giv(10);ctx.vent(`${b.D.navn} og du er bedste venner! Ti hjerter. Du får 10 stjerner.`)}else{SPIL.giv(2);ctx.say(`${b.D.navn} holder mere af dig: ${s.h} ${s.h===1?'hjerte':'hjerter'}! +2 stjerner`)}}gem(true)};
  const gem=nu_=>{if(!nu_&&gemT>0)return;gemT=4;for(const b of B)b.s.t=nu();SPIL.save()};
  const hjerte=(x,y,z=1)=>{const q=hjerter.find(h=>h.t>1)||hjerter[0];q.t=0;q.x=x;q.y=y;q.z=z;q.vx=R(-1.5,1.5)};
  const boble=(x,y)=>{const q=bobl.find(h=>h.t>1)||bobl[0];q.t=0;q.x=x+R(-1.5,1.5);q.y=y+R(-1,1);q.r=R(1.2,2.6)};
  const vaagn=b=>{if(b.sov){b.sov=false;b.U.set({oje:'aaben'});zzz[b.i].visible=false}};
  /* ---- det man kan gøre ---- */
  const mad=(b,godbid)=>{if(busyB)return;if(b.sov){ctx.say(`Ssh! ${b.D.navn} sover.`);return}if(!godbid&&b.s.m>.97){ctx.say(`${b.D.navn} er helt mæt.`);b.glad=.5;return}
    if(godbid){if(!(SPIL.data.godbid>0))return;SPIL.data.godbid--;visKnap()}busyB={b,slags:'mad',t:0,godbid};flaske.material.map=godbid?flaske.userData.god:flaske.userData.fl;flaske.visible=true;b.U.set({mund:'gab'})};
  const leg=b=>{if(busyB)return;if(b.sov){ctx.say(`Ssh! ${b.D.navn} sover.`);return}busyB={b,slags:'leg',t:0};bold.visible=true;b.hopN=3;LYD.pip()};
  const klap=b=>{if(b.sov){ctx.say(`Ssh! ${b.D.navn} sover.`);return}LYD.kys();b.glad=Math.max(b.glad,.9);hjerte(b.x+R(-3,3),BY+14);fyld(b,'g',.1);b.ro=0};
  const trykUnge=b=>()=>{if(tool==='mad')mad(b,false);else if(tool==='godbid')mad(b,true);else if(tool==='leg')leg(b);else if(tool==='vask'){if(b.sov){ctx.say(`Ssh! ${b.D.navn} sover.`);return}LYD.vask();for(let i=0;i<4;i++)boble(b.x,BY+8);fyld(b,'r',.12);b.ro=0}else klap(b)};
  const ungeVed=p=>p&&p.y>BY-1&&p.y<BY+19?B.find(b=>Math.abs(p.x-b.x)<8.5):null;
  const Rm=makeRoom(ctx,{bg:'#140e0a',fit:fitBox(88,50,0,20.5),sky:'#ffe2b8',ground:'#4a3020',amb:.55,key:{col:'#ffe6c4',i:1.9,tgt:[0,14,0]},
    /* stryg (kæl) og gnid (vask): det tæller, hvor langt fingeren har bevæget sig hen over ungen */
    drag:(ph,e,Rm)=>{if(tool!=='kael'&&tool!=='vask'){sidst=null;return}const p=Rm.planeAt(e,3);if(ph==='end'||!p){sidst=null;svamp.visible=false;return}const b=ungeVed(p);if(tool==='vask'){svamp.visible=true;svamp.position.set(p.x,p.y,7)}
      if(ph==='start'||!sidst){sidst=p;return}const d=Math.hypot(p.x-sidst.x,p.y-sidst.y);sidst=p;if(!b||b.sov||busyB&&busyB.b===b)return;b.dist+=d;b.ro=0;
      if(tool==='kael'){b.glad=Math.max(b.glad,1);if(b.dist>5){b.dist=0;fyld(b,'g',.055);hjerte(p.x,p.y+2);if(Math.random()<.35)LYD.kys()}}
      else{if(b.dist>4){b.dist=0;fyld(b,'r',.06);boble(p.x,p.y);if(Math.random()<.3)LYD.vask();if(b.s.r>=.995)Rm.burst(b.x,BY+9,8,10,'rgba(200,240,255,.95)',7)}}},
    build:Rm=>[()=>{const g=Rm.scene,W=box(-76,-2,76,64);
        /* bagvæggen: varme brædder, med et lysere panel forneden */
        P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{boards(P,null,'#9a6a40',{dir:'v',h:4.2,ink:.3});P.wash('#5a3a22',box(-77,-3,77,PL+3),{alpha:.55,edge:0,mode:'source-over'});P.wash('#2a1608',box(-77,40,77,65),{alpha:.45,edge:0,mode:'source-over'})}},-10);
        P2(g,box(-76,PL+2.6,76,PL+3.8),{color:'#6a4426',kind:'balsa',t:.8},-9.6);
        /* en lav scene af træ, som kurvene står på, så ungerne sidder fri af knapperne forneden */
        {const fr=box(-76,0,76,PL);P2(g,fr,{t:1,s:9,cap:1800,paint:P=>{boards(P,null,'#7a4e2c',{dir:'h',h:2.2,ink:.32});for(let x=-72;x<76;x+=12)P.fill(circ(x,PL-1.1,.35,.35,10),'#3a2414',.8)}},9);Rm.floor(box(-76,-10,76,9.4),{color:'#b88a4e',kind:'balsa',t:.3},PL);P2(g,box(-76,PL-.5,76,PL+.25),{color:'#9a6a3a',kind:'balsa',t:1.4},9.2)}
        for(let i=0;i<40;i++)Rm.floor(box(-76,-10+i*1.05,76,-9+i*1.05),{color:shade('#c8a060',R(-.07,.07)),kind:'balsa',t:.3},0);
        /* halm på gulvet */
        for(let i=0;i<60;i++){const x=R(-72,72),z=R(-8,8.6),a=R(-.5,.5),l=R(2,4.5);Rm.floor([[x,z],[x+l*Math.cos(a),z+l*Math.sin(a)],[x+l*Math.cos(a)-.12,z+l*Math.sin(a)+.3],[x-.12,z+.3]],{color:shade('#f0d27a',R(-.1,.1)),kind:'kraft',t:.06},PL+.34)}
        /* loftsbjælken med vimpler, og lanterner imellem båsene */
        P2(g,box(-76,44.2,76,47.4),{t:3,s:8,paint:P=>boards(P,null,'#5a3820',{dir:'h',h:1.6,ink:.3})},-9.4);
        {const cs=['#e0457a','#ffd54a','#43a3d3','#5fd070','#b9a0ff'];for(let i=0;i<30;i++){const x=-72+i*5,y=44.2-1.6*Math.sin((i%6)/6*Math.PI)-.2;P2(g,toCCW([[x-1.6,y],[x+1.6,y],[x,y-3.2]]),{color:cs[i%5],kind:'water',t:.08},-6.2+(i%2)*.05)}}
        for(const x of[-21,0,21]){for(const s of thick([[[x,44.2],[x,37.4]]],.1))P2(g,s,{color:'#2a1c12',t:.06},-7);P2(g,sm([[x-1.5,37.4],[x+1.5,37.4],[x+1.8,34.4],[x+1.2,33],[x-1.2,33],[x-1.8,34.4]],5),{t:1,mat:paperMat('#fff0c0','tissue',{glow:'#ffc060',gi:1.5})},-7.4);P2(g,box(x-1.7,37.3,x+1.7,37.9),{color:'#2a1c12',t:1.2},-7.4);Rm.glow(x,35.2,-5.6,'#ffc060',15,true);const L=new THREE.PointLight('#ffc878',50,46,2);put(g,L,x,34,4)}},
      ()=>{const g=Rm.scene;/* hver unges plads: en lille bås i væggen, en pude og en flettet kurv, som ungen sidder i */
        for(const b of B){const x=b.x,c=b.D.c,nis=arch(x,PL+3.8,17,23,22);
          P2(g,nis,{t:.3,s:12,paint:P=>{P.wash('#5a3a22',null,{edge:.3,top:'#7a5232',clouds:5});for(let i=0;i<9;i++)P.fill(starPts(x+R(-7,7),R(PL+8,PL+24),R(.35,.6),.2,R(1)),'#f6dc8a',R(.25,.55))}},-9.5);for(const s of ring(nis,.7,false))P2(g,s,{color:'#c9a04a',kind:'balsa',t:.5},-9.3);
          P2(g,circ(x,PL+3.9,8.2,1.5,26),{color:hexOf(shade(c,.1)),kind:'water',t:.4},-1.6);
          const kurv=toCCW(sm([[x-9,PL+4.2,1],[x+9,PL+4.2,1],[x+8.2,PL+1],[x+6.6,PL,1],[x-6.6,PL,1],[x-8.2,PL+1]],5));P2(g,kurv,{t:1.4,s:22,paint:P=>{P.wash('#c8965a',kurv,{top:'#e0b070',edge:.5,clouds:4});for(let y=.5;y<4.2;y+=.74)for(let k=-9;k<9;k+=1.5){const o=Math.round(y/.74)%2*.75;P.pen([[x+k+o,PL+y],[x+k+o+1.1,PL+y+.2]],'#7a5228',.16,.7)}}},6.2);
          P2(g,sm([[x-9.5,PL+4.9],[x+9.5,PL+4.9],[x+9.5,PL+3.7],[x-9.5,PL+3.7]],3),{color:'#e8bc7a',kind:'kraft',t:1.8,edge:'#8a5a28'},6.2);
          const hb=new THREE.Mesh(new THREE.PlaneGeometry(17,19),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,BY+8.5,7.4);g.add(hb);Rm.tap(hb,trykUnge(b))}},
      ()=>{const lv=Rm.live;
        for(const b of B){const U=b.U=makeUnge(b.id);U.G.scale.setScalar(SC);U.G.position.set(b.x,BY,2.4);lv.add(U.G);
          const c=cv(320,208),t=tx(c,true),m=new THREE.Mesh(new THREE.PlaneGeometry(13.6,8.84),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));m.position.set(b.x,38.6,-5.4);m.userData.noShadow=true;lv.add(m);skilt.push({c,t,v:''});tegnSkilt(b);
          const z=sprite(null,3.4);z.material.map=maerke(96,T.z);z.position.set(b.x+5.6,BY+15,8);lv.add(z);zzz.push(z);
          const tk=sprite(null,5.4);tk.position.set(b.x+6.2,BY+16.6,8);lv.add(tk);tanke.push(tk)}
        /* tankeboblen: et tegn for det, ungen mangler mest */
        {const lav=tegn=>maerke(128,(g,r)=>{g.fillStyle='#fffaf0';g.strokeStyle='#8a6a4a';g.lineWidth=5;g.beginPath();g.arc(0,-r*.1,r*.74,0,TAU);g.fill();g.stroke();g.beginPath();g.arc(-r*.62,r*.72,r*.13,0,TAU);g.fill();g.stroke();g.save();g.translate(0,-r*.1);tegn(g,r*.56);g.restore()});
          Rm.TK={m:lav(T.flaske),r:lav(T.svamp),g:lav(T.bold)}}
        const hm=maerke(96,T.hjerte),bm=maerke(96,T.boble);for(let i=0;i<18;i++){const s=sprite(hm,2);lv.add(s);hjerter.push({s,t:9})}for(let i=0;i<22;i++){const s=sprite(bm,2);lv.add(s);bobl.push({s,t:9})}
        flaske=sprite(null,6.5);flaske.userData.fl=maerke(128,T.flaske);flaske.userData.god=maerke(128,T.godbid);flaske.material.map=flaske.userData.fl;lv.add(flaske);bold=sprite(maerke(128,T.bold),4.6);lv.add(bold);svamp=sprite(maerke(128,T.svamp),5.4);lv.add(svamp);
        for(const b of B)b.U.set({snavs:b.s.r<.25?3:b.s.r<.5?2:b.s.r<.75?1:0});visKnap();
        ctx.say(vaekTimer>5?'Ungerne har savnet dig! Se på skiltene, hvad de mangler.':'Her bor ungerne. Vælg forneden, hvad du vil: kæle, give mad, vaske eller lege.')}],
    tick:(t,dt)=>{gemT-=dt;
      for(const b of B){const s=b.s,U=b.U,k=b.sov?.5:1;s.m=clamp(s.m-dt/220*k,0,1);s.g=clamp(s.g-dt/160*k,0,1);s.r=clamp(s.r-dt/420*k,0,1);for(const q of['m','r','g'])if(s[q]<.8)b.fuld[q]=true;
        b.glad=Math.max(0,b.glad-dt*1.3);b.ro+=dt;
        /* falder i søvn, når alt er godt, og man har ladet den være lidt; vågner igen, når den mangler noget */
        if(!b.sov&&s.m>.9&&s.r>.9&&s.g>.9&&b.ro>2.6&&!(busyB&&busyB.b===b)){b.sov=true;U.set({oje:'sover',mund:'smil'});zzz[b.i].visible=true;LYD.snor();if(b.fuld.sov!==false){b.fuld.sov=false;point(b)}}
        if(b.sov&&(s.m<.55||s.g<.55||s.r<.55)){vaagn(b);b.fuld.sov=true}
        if(!b.sov)U.set({oje:b.glad>.25?'glad':'aaben'});
        if(b.hopN>0){b.hop+=dt*2.6;if(b.hop>=1){b.hop=0;b.hopN--;if(b.hopN>0)LYD.pip()}}
        const hy=Math.sin(Math.min(1,b.hop)*Math.PI)*4.2;U.G.position.y=BY+hy;U.G.scale.set(SC,SC*(1-.08*Math.sin(Math.min(1,b.hop)*Math.PI*2)),SC);U.tick(t,{glad:Math.min(1,b.glad),hop:b.hop,spis:b.spis});U.set({snavs:s.r<.25?3:s.r<.5?2:s.r<.75?1:0});
        if(zzz[b.i].visible){const u=(t*.5+b.i*.3)%1;zzz[b.i].position.set(b.x+5+u*2.4,BY+14+u*5,8);zzz[b.i].material.opacity=Math.sin(u*Math.PI);const z=2+u*2.4;zzz[b.i].scale.set(z,z,1)}
        /* tankeboblen viser det behov, der er lavest, hvis det er under halvt */
        {const lav=['m','r','g'].sort((p,q)=>s[p]-s[q])[0],tk=tanke[b.i],vis=!b.sov&&s[lav]<.45&&!(busyB&&busyB.b===b);tk.visible=vis;if(vis){tk.material.map=Rm.TK[lav];const w=5.4*(1+.05*Math.sin(t*3+b.i));tk.scale.set(w,w,1)}}
        if(skilt[b.i].v!==[Math.round(s.m*40),Math.round(s.r*40),Math.round(s.g*40),s.h].join()){tegnSkilt(b);skilt[b.i].v=[Math.round(s.m*40),Math.round(s.r*40),Math.round(s.g*40),s.h].join()}}
      /* flasken og bolden */
      if(busyB){const q=busyB,b=q.b;q.t+=dt;if(q.slags==='mad'){const k=Math.min(1,q.t/.45),e=k*k*(3-2*k);flaske.position.set(b.x+3.2+(1-e)*9,BY+7.4+(1-e)*-9,8);b.spis=q.t>.45?1:0;if(q.t>.45&&Math.floor(q.t*3.2)!==Math.floor((q.t-dt)*3.2))LYD.nam();
          if(q.t>1.7){flaske.visible=false;b.spis=0;b.U.set({mund:'smil'});b.glad=1;fyld(b,'m',q.godbid?1:.5);if(q.godbid){fyld(b,'g',.3);point(b)}hjerte(b.x,BY+15);busyB=null;b.ro=0}}
        else{const u=q.t/1.25,bx=b.x-6.5+Math.sin(q.t*2.6)*1.2;bold.position.set(bx,BY+1.2+Math.abs(Math.sin(q.t*7.5))*7,8);bold.material.rotation=q.t*5;if(u>=1){bold.visible=false;b.glad=1.2;fyld(b,'g',.45);b.s.r=clamp(b.s.r-.2,0,1);b.s.m=clamp(b.s.m-.06,0,1);hjerte(b.x,BY+15);busyB=null;b.ro=0}}}
      for(const q of hjerter){q.t+=dt*.9;if(q.t>1){q.s.visible=false;continue}q.s.visible=true;q.s.position.set(q.x+q.vx*q.t+Math.sin(q.t*9)*.4,q.y+q.t*7,8.5);const z=(1.4+q.t*1.4)*q.z;q.s.scale.set(z,z,1);q.s.material.opacity=Math.min(1,q.t*8)*(1-q.t*q.t)}
      for(const q of bobl){q.t+=dt*1.1;if(q.t>1){q.s.visible=false;continue}q.s.visible=true;q.s.position.set(q.x+Math.sin(q.t*7+q.r)*.5,q.y+q.t*5,8.4);const z=q.r*(.6+q.t*.6);q.s.scale.set(z,z,1);q.s.material.opacity=q.t>.8?(1-q.t)/.2:1}
      gem(false)}});
  ctx.efter.push(()=>gem(true));
  ctx.test={B,tool:k=>{tool=k;visKnap()},tryk:i=>trykUnge(B[i])(),saet:(i,o)=>{Object.assign(B[i].s,o)},fyld:(i,k,d)=>fyld(B[i],k,d),busy:()=>!!busyB}};
