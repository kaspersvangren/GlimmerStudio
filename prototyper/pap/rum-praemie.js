/* ============ Præmiebutikken i Arkaden ============
   En gammel mekanisk ugle i messing passer butikken. På væggen hænger de ni tryllestave, man kun kan få her: de byttes for billetter fra spillene
   og ligger aldrig i en boble. Priserne er de samme som i det oprindelige spil (30 til 100 billetter).
   Man trykker på en stav, uglen siger navnet, og trykker man på den igen, bytter man. Staven vises som en medaljon og ligger derefter i Garderoben under Ekstra.
   To skilte foroven skifter tavlen mellem tryllestavene og de elleve malerier (40 til 200 billetter, som i originalen). Et maleri hænger sig selv op
   på en ledig plads på væggen i Værelset. Mesterværket står indpakket, til man har købt det. */
ROOMS.praemie=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),PR=SPIL.PRAEMIER,SX=i=>-36.4+i*7.5,OX=34,BR='#c9973e',BRd='#8a6420',BRl='#f2d58a';
  let valgt=-1,valgT=0,ugle,gear,hoved,laag=[],hopU=0,dim,vis=null,straal,visT=-1,blinkT=2,side='stave',SG,MG,faner={};const stave=[],maerker=[],mal=[];
  /* alt, hvad butikken har: først de ni stave, så de elleve malerier */
  const ITEMS=[...PR,...MALERIER.map(m=>['maleri',m[0],m[1],m[2]])],NS=PR.length,MX=j=>j<6?-35.6+j*12.4:-29.4+(j-6)*12.4,MY=j=>j<6?35.2:23.4;
  const ejer=w=>SPIL.har.includes(w[0]+':'+w[1]);
  /* et nyt maleri hænger sig selv op på den første ledige plads i Værelset */
  const haengOp=id=>{const v=SPIL.data.vaeg=(SPIL.data.vaeg||[]).concat(Array(VAEGPLADSER.length).fill(null)).slice(0,VAEGPLADSER.length);const i=v.indexOf(null);if(i<0)return false;v[i]=id;return true};
  const bygMal=j=>{const m=MALERIER[j],G=mal[j].G;for(const q of[...G.children])if(q!==mal[j].hb){G.remove(q);if(q.userData.ryd)q.userData.ryd()}const P=new THREE.Group();G.add(P);
    if(MALERI_HEMMELIG.includes(m[0])&&!maleriEjet(m[0]))bygPakke(P,8,7);else bygMaleri(ctx,P,m[0],7.6,6.6,j===10?'guld':'trae')};
  const visSide=s=>{side=s;SG.visible=s==='stave';MG.visible=s==='mal';faner.stave[0].visible=s==='stave';faner.stave[1].visible=s!=='stave';faner.mal[0].visible=s==='mal';faner.mal[1].visible=s!=='mal';valgt=-1;alle()};
  const tegnMaerke=i=>{const w=ITEMS[i],q=maerker[i],g=q.c.getContext('2d'),din=ejer(w),paa=i===valgt;g.clearRect(0,0,192,96);g.fillStyle=din?'#dff2d0':paa?'#fff0b0':'#fbf3dc';g.strokeStyle=din?'#3f8a4a':paa?'#e0a020':'#7a5a3a';g.lineWidth=paa?8:5;g.beginPath();g.roundRect(6,6,180,84,18);g.fill();g.stroke();g.textBaseline='middle';
    if(din){g.fillStyle='#2e6a38';g.textAlign='center';g.font=FONT.arkade.replace('X','40px');g.fillText(w[0]==='maleri'?'Dit':'Din',96,50)}
    else{g.save();g.translate(52,48);g.fillStyle='#e2507a';g.strokeStyle='#7a1c3a';g.lineWidth=3;g.beginPath();g.moveTo(-26,-16);g.lineTo(26,-16);g.lineTo(26,-5);g.arc(26,0,5,-Math.PI/2,Math.PI/2,true);g.lineTo(26,16);g.lineTo(-26,16);g.lineTo(-26,5);g.arc(-26,0,5,Math.PI/2,-Math.PI/2,true);g.closePath();g.fill();g.stroke();g.restore();g.fillStyle=SPIL.bil>=w[3]?'#3a2414':'#a08a78';g.textAlign='left';g.font=FONT.arkade.replace('X','44px');g.fillText(String(w[3]),90,50)}
    q.t.needsUpdate=true};
  const alle=()=>{for(let i=0;i<ITEMS.length;i++)tegnMaerke(i)};
  /* uglen fortæller lidt om hvert maleri (Kasper 23. nov.). Forslag fra Claude, som Kasper kan rette */
  const MAL_ORD={blomster:'Malet en solskinsdag. Man kan næsten dufte dem.',maane:'Malet en stille nat. Hvem mon er vågen så sent på skolen?',hav:'Skibet sejler mod et land, som ingen har fundet endnu.',
    svampe:'Små huse i skovbunden. Bor der mon nogen i dem?',enhjoerning:'Enhjørninger er meget sjældne. Jeg har kun set én, og det var på det her billede.',drage:'Dragen øver sig i at puste røg. Se godt efter, hvad den har lavet.',
    kunst:'Jeg forstår det ikke helt, men det er meget kunstnerisk. Der gemmer sig noget i den røde cirkel.',kaeledyr:'Dit eget kæledyr, med noget lækkert i poterne.',selv:'Et portræt af dig, præcis som du ser ud i dag.',
    gnoma:'Et meget berømt maleri. Hun smiler, men ingen ved hvorfor.'};
  const ord=w=>w[0]==='maleri'&&MAL_ORD[w[1]]?MAL_ORD[w[1]]+' ':'';
  const sig=txt=>{hopU=1;LYD.fil('ugle',()=>{LYD.pip();setTimeout(()=>LYD.pip(),160)},.8);ctx.say('Hu-hu! '+txt)};
  const tryk=i=>()=>{if(vis)return;if((i<NS)!==(side==='stave'))return;const w=ITEMS[i],navn=w[2],pris=w[3],erMal=w[0]==='maleri';
    if(ejer(w)){valgt=-1;alle();sig(erMal?`${navn} er allerede dit. Det hænger i dit værelse; tryk på et billede derhjemme for at skifte.`:`${navn} er allerede din. Den ligger i Garderoben under Ekstra.`);return}
    if(SPIL.bil<pris){valgt=-1;alle();sig(`${navn}. ${ord(w)}${erMal?"Det":"Den"} koster ${pris} billetter. Du mangler ${pris-SPIL.bil}. Billetter får du i spillene herinde.`);return}
    if(valgt!==i){valgt=i;valgT=8;alle();sig(MALERI_HEMMELIG.includes(w[1])?'Det er en hemmelig pakke. Ingen ved, hvad der er i den. Tryk på den igen, hvis du vil bytte.':`${navn}. ${ord(w)}Tryk på ${erMal?'det':'den'} igen, hvis du vil bytte.`);return}
    /* byttet */
    valgt=-1;SPIL.givBil(-pris);SPIL.har.push(w[0]+':'+w[1]);const hang=erMal?haengOp(w[1]):true;SPIL.save();LOG.row('praemie',{ting:w[1],pris});LYD.fanfare();hopU=1;alle();if(erMal){bygMal(i-NS);mal[i-NS].hop=1}else stave[i].hop=1;
    vis=visVare(w,ctx,Rm);vis.G.position.set(-4,24,13);vis.G.scale.set(.01,.01,1);Rm.live.add(vis.G);straal.visible=true;visT=0;dim.material.opacity=.6;Rm.burst(-4,24,13,16,'rgba(255,236,170,.95)',11);vis.tegn(Rm.t);
    ctx.vent(erMal?(hang?`Hu-hu! ${navn} er dit. Det hænger nu på væggen i dit værelse.`:`Hu-hu! ${navn} er dit. Væggene derhjemme er fulde, så tryk på et billede i dit værelse for at skifte det ud.`):`Hu-hu! ${navn} er din. Den ligger i Garderoben under Ekstra.`,()=>{if(vis){vis.ryd();vis=null}straal.visible=false;dim.material.opacity=0;visT=-1})};
  const Rm=makeRoom(ctx,{bg:'#0c0816',fit:fitBox(88,50,0,20.5),sky:'#ffe0b0',ground:'#3a2030',amb:.5,key:{col:'#ffe6c4',i:1.8,tgt:[0,16,0]},
    build:Rm=>[()=>{const g=Rm.scene,W=box(-76,-2,76,64);
        /* væggen: mahognipaneler med messinglister */
        P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{boards(P,null,'#5a2418',{dir:'v',h:6,ink:.3});P.wash('#2a0e0a',box(-77,44,77,65),{alpha:.6,edge:0,mode:'source-over'})}},-10);
        for(const y of[12.6,45])P2(g,box(-76,y,76,y+.7),{mat:gold(),t:.5},-9.6);
        /* tavlen med de ni stave: mørkt fløjl i en messingramme */
        {const tv=box(-41.4,15.6,30.4,43.2);P2(g,tv,{t:.4,s:12,cap:1600,paint:P=>{P.wash('#2a1638',tv,{top:'#3a2050',edge:.5,clouds:8});for(let i=0;i<60;i++)P.fill(starPts(R(-40,29),R(17,42),R(.14,.3),.1,R(1)),'#f6dc8a',R(.2,.5))}},-9.4);for(const s of ring(tv,.8,false))P2(g,s,{mat:gold(),t:.6},-9.3);
}
        plate(g,'praemier','Præmier',FONT.arkade,13,3.4,{bg:'#160e2c',frame:'gold',size:2,fg:'#ffd86b',x:OX+2,y:40.6,z:-9});Rm.glow(OX+2,40.6,-7,'#ffd86b',16);
        for(const x of[-30,-5,20]){for(const s of thick([[[x,50],[x,46.4]]],.1))P2(g,s,{color:'#2a1c12',t:.06},-7);P2(g,sm([[x-1.6,46.4],[x+1.6,46.4],[x+2.2,44.6],[x-2.2,44.6]],4),{t:1,mat:paperMat('#fff0c0','tissue',{glow:'#ffc060',gi:1.5})},-7.4);Rm.glow(x,44.8,-5.6,'#ffc060',15);const L=new THREE.PointLight('#ffd090',60,50,2);put(g,L,x,40,6)}},
      ()=>{const g=Rm.scene;/* disken, med billetrulle og klokke, og uglens messingstander */
        const F=box(-76,0,76,11);P2(g,F,{t:1,s:9,cap:1800,paint:P=>{boards(P,null,'#6a2f1c',{dir:'v',h:7,ink:.3});for(let x=-70;x<74;x+=14){P.score([...box(x,1.6,x+11.6,9.4),[x,1.6]],{w:.14,ink:.45,dark:'#2e110a'})}}},9);Rm.floor(box(-76,-10,76,9.6),{t:.3,s:8,cap:1600,paint:P=>boards(P,null,'#8a4a2c',{dir:'v',h:4,ink:.2})},11);P2(g,box(-76,10.6,76,11.5),{mat:gold(),t:1.2},9.4);
        for(let i=0;i<40;i++)Rm.floor(box(-76,-10+i*1.05,76,-9+i*1.05),{color:shade('#4a2a3a',R(-.06,.06)),kind:'balsa',t:.3},0);
        {const x=14;P2(g,circ(x,13.6,2.3,2.3,24),{color:'#e2507a',kind:'water',t:1.6},4);P2(g,circ(x,13.6,.8,.8,14),{color:'#fbf3dc',kind:'water',t:1.7},4);for(const s of[[x+2.2,12.3],[x+5,11.7],[x+7.4,11.6]])P2(g,toCCW([[s[0],s[1]-.4],[s[0]+2.4,s[1]-.5],[s[0]+2.4,s[1]+.6],[s[0],s[1]+.7]]),{color:'#e2507a',kind:'water',t:.08,edge:'#7a1c3a'},4.6)}
        {const x=-36;P2(g,sm([[x-2,11.4,1],[x+2,11.4,1],[x+1.7,13.4],[x,14.6],[x-1.7,13.4]],5),{mat:gold(),t:1.6},4);P2(g,circ(x,14.9,.45,.45,10),{mat:gold(),t:1},4.4)}
        P2(g,toCCW([[OX-3,11.4],[OX+3,11.4],[OX+1.2,13],[OX-1.2,13]]),{mat:gold(),t:2.4},3);P2(g,box(OX-4,12.8,OX+4,13.6),{mat:gold(),t:2.6},3);
        {const hb=new THREE.Mesh(new THREE.PlaneGeometry(13,22),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(OX,24,8);g.add(hb);Rm.tap(hb,()=>{if(!vis)sig(`Tryk to gange på det, du gerne vil bytte dig til. Du har ${SPIL.bil} ${SPIL.bil===1?'billet':'billetter'}.`)})}},
      ()=>{const lv=Rm.live;/* stavene og prismærkerne */
        SG=new THREE.Group();MG=new THREE.Group();lv.add(SG,MG);MG.visible=false;
        const maerke=(par,x,y,z)=>{const c=cv(192,96),t=tx(c,true),m=new THREE.Mesh(new THREE.PlaneGeometry(6.4,3.2),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));m.position.set(x,y,z);m.userData.noShadow=true;par.add(m);maerker.push({c,t})};
        for(let i=0;i<PR.length;i++){const x=SX(i);P2(SG,arch(x,21.2,6.4,19,14),{color:'#3a2452',kind:'water',t:.1},-9.2);for(const yy of[24.4,29])for(const sx of[-1,1])P2(SG,toCCW(sm([[x+sx*.2,yy],[x+sx*1,yy+.15],[x+sx*1.1,yy-.5],[x+sx*.2,yy-.45]],3)),{mat:gold(),t:.5},-8.6);
          const hb=new THREE.Mesh(new THREE.PlaneGeometry(7.3,27),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,29.6,-5);SG.add(hb);Rm.tap(hb,tryk(i));
          const G=new THREE.Group();G.position.set(x,22.6,-8);G.scale.setScalar(1.75);SG.add(G);tegnStav(G,PR[i][1],[0,0],[0,5.4],0);stave.push({G,x,hop:0});maerke(SG,x,18.4,-7.4)}
        /* malerierne: seks øverst og fem nederst, hvert med sit prismærke */
        MALERIER.forEach((m,j)=>{const G=new THREE.Group();G.position.set(MX(j),MY(j),-8.4);MG.add(G);const hb=new THREE.Mesh(new THREE.PlaneGeometry(10,11),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(0,-1.5,3);G.add(hb);Rm.tap(hb,tryk(NS+j));mal.push({G,hb,hop:0});bygMal(j);maerke(MG,MX(j),MY(j)-5.6,-7.4)});
        /* skiltene, der skifter tavlen: det valgte er lyst */
        for(const[k,navn,x]of[['stave','Tryllestave',3.4],['mal','Malerier',17.6]]){faner[k]=[plate(lv,'fane1'+k,navn,FONT.arkade,12.4,2.7,{bg:'#fbf2dc',fg:'#7a1c3a',size:1.45,x,y:40.2,z:-6.6}),plate(lv,'fane0'+k,navn,FONT.arkade,12.4,2.7,{bg:'#3a2452',fg:'#f2d58a',size:1.45,x,y:40.2,z:-6.6})];
          for(const sx of[-1,1])for(const q of thick([[[x+sx*5.2,42.9],[x+sx*5,50]]],.09))P2(lv,q,{color:'#ead9b5',kind:'water',t:.04},-6.8);
          const hb=new THREE.Mesh(new THREE.PlaneGeometry(13,4),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,41.6,-4);lv.add(hb);Rm.tap(hb,()=>{if(vis)return;if(side!==k){LYD.valg?LYD.valg():LYD.pip();visSide(k);sig(k==='mal'?'Her er malerierne. De hænger sig selv op i dit værelse.':'Her er tryllestavene.')}})}
        visSide('stave');
        /* uglen: messing, med et tandhjul på maven, glasøjne og monokel */
        ugle=new THREE.Group();ugle.position.set(OX,13.6,3.4);lv.add(ugle);const U=(par,sh,o,z)=>put(par,piece(toCCW(sh),o),0,0,z),ms=(col)=>({color:col,kind:'water',t:.3,edge:'#3a2408'});
        for(const sx of[-1,1])U(ugle,sm([[sx*3.6,7.6,1],[sx*5.6,6],[sx*5.9,2.6],[sx*4.6,.8],[sx*3.4,2.4]],5),ms('#b88a38'),-.2);
        {const kb=circ(0,5,4.5,5.2,30);put(ugle,piece(kb,{t:.5,s:30,paint:P=>{P.wash(BR,kb,{top:BRl,edge:.6,clouds:5});for(let i=0;i<10;i++){const a=i/10*TAU;P.fill(circ(Math.cos(a)*3.7,5+Math.sin(a)*4.4,.16,.16,8),BRd,.9)}}}),0,0,0)}
        for(const sx of[-1,1]){U(ugle,[[sx*.8,.4],[sx*2.6,.4],[sx*2.6,-.3],[sx*.6,-.3]],{mat:gold(),t:.5},.3)}
        gear=new THREE.Group();gear.position.set(0,3.9,.4);ugle.add(gear);{const tp=[];for(let i=0;i<20;i++){const a=i/20*TAU,r=i%2?1.95:1.5;tp.push([Math.cos(a-.08)*r,Math.sin(a-.08)*r],[Math.cos(a+.08)*r,Math.sin(a+.08)*r])}U(gear,tp,ms('#b88a38'),0);U(gear,circ(0,0,.9,.9,16),{mat:gold(),t:.34},.04);for(const a of[0,2.1,4.2])U(gear,[[Math.cos(a)*.3,Math.sin(a)*.3],[Math.cos(a+.3)*1.3,Math.sin(a+.3)*1.3],[Math.cos(a-.3)*1.3,Math.sin(a-.3)*1.3]],{color:BRd,kind:'water',t:.36},.06)}
        hoved=new THREE.Group();hoved.position.set(0,9,.5);ugle.add(hoved);for(const sx of[-1,1])U(hoved,[[sx*2.4,2.6],[sx*4.4,5.6],[sx*1.2,3.6]],ms(BR),-.1);
        {const hb=circ(0,2.4,4.7,3.7,30);put(hoved,piece(hb,{t:.5,s:30,paint:P=>{P.wash(BR,hb,{top:BRl,edge:.6,clouds:4});P.pen(curve([[-3.8,3.4],[0,5],[3.8,3.4]],8),BRd,.1,.7)}}),0,0,0)}
        for(const sx of[-1,1]){const x=sx*1.95;U(hoved,circ(x,2.5,1.75,1.75,22),{color:'#3a2408',kind:'water',t:.2},.5);put(hoved,piece(circ(x,2.5,1.3,1.3,20),{t:.1,mat:paperMat('#ffd27a','tissue',{glow:'#ffb347',gi:1.5})}),0,0,.72);U(hoved,circ(x,2.5,.5,.5,12),{color:'#1a1008',kind:'water',t:.06},.84);U(hoved,circ(x+.3,2.9,.18,.18,8),{color:'#ffffff',kind:'water',t:.03},.9);
          const l=put(hoved,piece(circ(x,2.5,1.4,1.4,18),{color:BR,kind:'water',t:.08}),0,0,.94);l.visible=false;laag.push(l)}
        U(hoved,[[-.6,1.5],[.6,1.5],[0,.2]],{color:BRd,kind:'water',t:.3},.8);for(const s of ring(circ(1.95,2.5,1.85,1.85,22),.2,false))put(hoved,piece(s,{mat:gold(),t:.2}),0,0,1);for(const s of thick([curve([[3.7,2],[4.6,.2],[4,-1.6]],6)],.07))put(hoved,piece(s,{mat:gold(),t:.06}),0,0,1);
        /* medaljonen, når man har byttet */
        dim=new THREE.Mesh(new THREE.PlaneGeometry(200,120),new THREE.MeshBasicMaterial({color:'#0c0612',transparent:true,opacity:0,depthWrite:false}));dim.position.set(0,20,11.6);lv.add(dim);
        {const c=cv(256,256),q=c.getContext('2d');q.translate(128,128);const g0=q.createRadialGradient(0,0,40,0,0,126);g0.addColorStop(0,'rgba(255,236,170,.5)');g0.addColorStop(1,'rgba(255,236,170,0)');q.fillStyle=g0;q.beginPath();q.arc(0,0,126,0,TAU);q.fill();for(let i=0;i<18;i++){q.rotate(TAU/18);const gr=q.createLinearGradient(0,0,0,-126);gr.addColorStop(0,'rgba(255,236,170,.55)');gr.addColorStop(1,'rgba(255,236,170,0)');q.fillStyle=gr;q.beginPath();q.moveTo(-6,0);q.lineTo(6,0);q.lineTo(13,-126);q.lineTo(-13,-126);q.fill()}
          straal=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));straal.visible=false;straal.userData.noShadow=true;straal.position.set(-4,24,12.4);lv.add(straal)}
        sig(`Velkommen i Præmiebutikken. Her er tryllestave og malerier til dit værelse; tryk på skiltene foroven for at skifte. Du har ${SPIL.bil} ${SPIL.bil===1?'billet':'billetter'}. Tryk to gange på det, du gerne vil bytte dig til.`)}],
    tick:(t,dt)=>{if(valgt>=0){valgT-=dt;if(valgT<=0){valgt=-1;alle()}}
      mal.forEach((s,j)=>{const i=NS+j;s.hop=Math.max(0,s.hop-dt*1.4);s.G.rotation.z=(i===valgt?.08*Math.sin(t*9):0)+.2*Math.sin(s.hop*Math.PI*4)*s.hop;s.G.position.y=MY(j)+(i===valgt?.4:0)+Math.abs(Math.sin(s.hop*Math.PI*3))*1.2*s.hop});
      stave.forEach((s,i)=>{s.hop=Math.max(0,s.hop-dt*1.4);s.G.rotation.z=(i===valgt?.12*Math.sin(t*9):.02*Math.sin(t*1.1+i))+.3*Math.sin(s.hop*Math.PI*4)*s.hop;s.G.position.y=22.6+(i===valgt?.5+.3*Math.sin(t*6):0)+Math.abs(Math.sin(s.hop*Math.PI*3))*1.4*s.hop});
      hopU=Math.max(0,hopU-dt*1.8);ugle.position.y=13.6+Math.abs(Math.sin(hopU*Math.PI*2))*1.1*hopU;gear.rotation.z=t*.8+hopU*6;hoved.rotation.z=.07*Math.sin(t*.9)+.18*Math.sin(hopU*Math.PI*3)*hopU;blinkT-=dt;if(blinkT<-.14)blinkT=R(1.8,4.5);for(const l of laag)l.visible=blinkT<0;
      if(vis&&visT>=0){visT+=dt;const k=Math.min(1,visT/.55),e=1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2),z=10.4*Math.max(.02,e);vis.G.scale.set(z,z,1);vis.G.rotation.z=.05*Math.sin(t*1.3);vis.tegn(t);straal.scale.set(z*2.1,z*2.1,1);straal.rotation.z=t*.25;straal.material.opacity=.8*k}}});
  ctx.efter.push(()=>{if(vis)vis.ryd();for(const m of mal)m.G.traverse(q=>{if(q.userData.ryd)q.userData.ryd()})});
  ctx.test={tryk:i=>tryk(i)(),valgt:()=>valgt,vis:()=>!!vis,side:s=>visSide(s),NS}};
