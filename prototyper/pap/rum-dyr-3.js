/* ============ Dyreparken, del 3: Dyrekøkkenet ============
   Dyrene stiller sig ved lugen og bestiller magisk foder. Bestillingen står i en taleboble: hvilke råvarer, hvor mange, og hvordan det skal gøres færdigt
   (hakkes, røres, have glimmer på eller varmes). Man trykker på kasserne, så ryger råvarerne i skålen, trykker på tilberedningen, og giver skålen til dyret.
   En vagt varer 100 sekunder. Dyrene har en tålmodighed, der løber ud; bestillingerne bliver større, og der kommer flere dyr ad gangen, jo flere man har fodret.
   Point: 1 for hvert dyr, 2 hvis det gik hurtigt. Stjerner: et for hver to point (højst 12). Godbidder til ungerne i Ungestalden: en for hver tre dyr. */
ROOMS.dyrekoekken=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),TID=100,SX=[-27,0,27],TY=12,KX=[-37,-27,-17],KY=[TY,TY+5.8],VX=[19,29],AFF=1.3,AY=15.4;
  let on=false,over=false,left=TID,fodret=0,point=0,nextT=0,hud,ht,sk,skT,skaal={ing:[],finish:null},arb=null,lyser=[],rystSk=0;const SLOT=[null,null,null],POOL=[],plus=[];
  const niveau=()=>fodret<3?0:fodret<7?1:fodret<12?2:3,samtidig=()=>fodret<2?1:fodret<6?2:3;
  /* en bestilling: råvarer (med antal) og måske en tilberedning. Jo højere niveau, jo mere */
  const nyOrdre=()=>{const n=niveau(),antal=[2,2+Math.floor(Math.random()*2),3+Math.floor(Math.random()*2),3+Math.floor(Math.random()*3)][n],ing=[];let slags=Math.min(antal,1+Math.floor(Math.random()*(n>=2?3:2)));const valgt=[];while(valgt.length<slags){const id=FODERID[Math.floor(Math.random()*FODERID.length)];if(!valgt.includes(id))valgt.push(id)}
    for(let i=0;i<antal;i++)ing.push(valgt[i<slags?i:Math.floor(Math.random()*slags)]);ing.sort();const fin=Math.random()<[0,.4,.7,1][n]?FINISHID[Math.floor(Math.random()*FINISHID.length)]:null;return{ing,finish:fin,tid:[27,25,22,19][n]+antal*1.5}};
  const ens=(o,s)=>o&&o.finish===s.finish&&o.ing.length===s.ing.length&&o.ing.join()===s.ing.slice().sort().join();
  /* ---- tegninger ---- */
  const tegnHud=()=>{const g=hud.getContext('2d');g.clearRect(0,0,640,72);g.fillStyle='#2a1c38';g.beginPath();g.roundRect(2,2,636,68,20);g.fill();g.strokeStyle='#c9a04a';g.lineWidth=4;g.stroke();g.fillStyle='#ffe9a0';g.textAlign='center';g.textBaseline='middle';g.font=FONT.dyr.replace('X','34px');
    g.fillText(on?`Tid ${Math.ceil(left)}  ·  Fodret ${fodret}  ·  Point ${point}`:over?`Fodret ${fodret}  ·  Tryk for en ny vagt`:'Tryk for at begynde vagten',320,38,610);ht.needsUpdate=true};
  const tegnSkaal=()=>{const g=sk.getContext('2d');g.clearRect(0,0,512,112);const n=skaal.ing.length+(skaal.finish?1:0);if(n){const w=Math.min(84,480/n),x0=256-w*n/2+w/2;skaal.ing.forEach((id,i)=>{g.save();g.translate(x0+i*w,58);g.fillStyle='rgba(255,250,235,.92)';g.beginPath();g.arc(0,0,w*.47,0,TAU);g.fill();tegnFoder(g,id,w*.32);g.restore()});
      if(skaal.finish){g.save();g.translate(x0+skaal.ing.length*w,58);g.fillStyle='#3a2a58';g.beginPath();g.arc(0,0,w*.47,0,TAU);g.fill();tegnFinish(g,skaal.finish,w*.3);g.restore()}}skT.needsUpdate=true;
    /* de bestillinger, skålen passer til, lyser grønt */
    SLOT.forEach((a,i)=>{const passer=!!(a&&a.st==='venter'&&ens(a.ordre,skaal));if(lyser[i]!==passer){lyser[i]=passer;if(a)tegnBoble(a)}})};
  const tegnBoble=a=>{const g=a.bc.getContext('2d'),o=a.ordre,W=320,H=200;g.clearRect(0,0,W,H);if(!o)return void(a.bt.needsUpdate=true);const ok=lyser[a.slot];g.fillStyle='#fffaf0';g.strokeStyle=ok?'#3fae5a':'#7a5a3a';g.lineWidth=ok?10:5;g.beginPath();g.roundRect(8,8,W-16,H-46,26);g.fill();g.stroke();g.beginPath();g.moveTo(40,H-40);g.lineTo(22,H-6);g.lineTo(84,H-40);g.closePath();g.fill();g.stroke();g.fillStyle='#fffaf0';g.fillRect(36,H-52,56,14);
    const n=o.ing.length,w=Math.min(64,(W-36)/n),x0=W/2-w*n/2+w/2,y=o.finish?52:82;o.ing.forEach((id,i)=>{g.save();g.translate(x0+i*w,y);tegnFoder(g,id,w*.4);g.restore()});
    if(o.finish){g.save();g.translate(W/2-52,118);g.fillStyle='#3a2a58';g.beginPath();g.arc(0,0,30,0,TAU);g.fill();tegnFinish(g,o.finish,19);g.restore();g.fillStyle='#3a2a58';g.textAlign='left';g.textBaseline='middle';g.font='700 28px "Alegreya Sans",sans-serif';g.fillText(FINISH[o.finish].navn,W/2-14,120,W/2)}
    a.bt.needsUpdate=true};
  /* ---- spillets gang ---- */
  const begynd=()=>{on=true;over=false;left=TID;fodret=0;point=0;nextT=.4;skaal={ing:[],finish:null};tegnSkaal();tegnHud();LYD.fil('dyr.runde',()=>LYD.op())};
  const kom=nr=>{const i=[0,1,2].filter(k=>!SLOT[k]),fri=POOL.filter(a=>a.st==='hvile');if(!i.length||!fri.length)return;const slot=i[Math.floor(Math.random()*i.length)],a=typeof nr==='number'&&POOL[nr].st==='hvile'?POOL[nr]:fri[Math.floor(Math.random()*fri.length)];SLOT[slot]=a;a.slot=slot;a.st='ind';a.ordre=nyOrdre();a.tid=a.tid0=a.ordre.tid;a.fra=slot===2?1:slot===0?-1:(Math.random()<.5?-1:1);a.x=a.fra*66;a.tx=SX[slot]-6;a.K.G.visible=true;a.glad=0};
  const gaa=(a,glad)=>{a.st='ud';a.glad=glad?1:0;a.tx=(a.x>0?1:-1)*68;a.bm.visible=false;a.bar.visible=a.barB.visible=false;SLOT[a.slot]=null;lyser[a.slot]=false;nextT=Math.min(nextT,1+Math.random()*1.5)};
  const server=a=>{if(!on||!a||a.st!=='venter')return;if(!skaal.ing.length){ctx.say('Skålen er tom. Tryk på kasserne for at fylde den.');return}
    if(!ens(a.ordre,skaal)){LYD.doer();a.ryst=1;ctx.say('Det er ikke det, der står i taleboblen. Tøm skålen, og prøv igen.');return}
    const hurtig=a.tid>a.tid0*.5,p=hurtig?2:1;fodret++;point+=p;LYD.nam();setTimeout(()=>{if(ctx.alive)LYD.guld()},160);Rm.burst(SX[a.slot],31,-2,12,'rgba(255,236,170,.95)',7);const q=plus.find(z=>z.t>1)||plus[0];q.t=0;q.x=SX[a.slot];q.s.material.map=hurtig?q.to:q.en;
    skaal={ing:[],finish:null};gaa(a,true);tegnSkaal();tegnHud()};
  const iSkaal=id=>{if(!on){begynd();return}if(arb)return;if(skaal.finish){ctx.say('Skålen er gjort færdig. Giv den til et dyr, eller tøm den.');return}if(skaal.ing.length>=5){ctx.say('Skålen er fuld!');LYD.doer();return}LYD.fil('ingrediens',()=>LYD.plop());skaal.ing.push(id);rystSk=1;Rm.burst(0,TY+6,6,5,'rgba(255,255,255,.8)',4);tegnSkaal()};
  const tilbered=id=>{if(!on){begynd();return}if(arb)return;if(!skaal.ing.length){ctx.say('Kom noget i skålen først.');return}arb={id,t:0};({hak:()=>LYD.fil('hak',()=>{LYD.hak();setTimeout(()=>LYD.hak(),170);setTimeout(()=>LYD.hak(),340)}),roer:()=>{LYD.roer();setTimeout(()=>LYD.roer(),240)},glimmer:()=>LYD.ding(),varm:()=>LYD.ild()})[id]()};
  const toem=()=>{if(!on){begynd();return}if(arb||!skaal.ing.length)return;LYD.fil('dyr.toem',()=>LYD.puf());skaal={ing:[],finish:null};tegnSkaal()};
  const slut=()=>{on=false;over=true;for(const a of POOL)if(a.st==='venter'||a.st==='ind')gaa(a,false);const stj=Math.min(12,Math.floor(point/2)),god=Math.floor(fodret/3),rek=Math.max(SPIL.data.koekRek||0,fodret);SPIL.data.koekRek=rek;SPIL.data.godbid=(SPIL.data.godbid||0)+god;if(stj)SPIL.giv(stj);else SPIL.save();if(fodret>=6)LYD.fanfare();else LYD.slut();tegnHud();LOG.row('koekken',{fodret,point,stj});
    ctx.vent(`Vagten er slut! Du fodrede ${fodret} dyr og fik ${stj} ${stj===1?'stjerne':'stjerner'}${god?` og ${god} ${god===1?'godbid':'godbidder'} til ungerne i Ungestalden`:''}. Din rekord er ${rek} dyr.`)};
  const tile=(g,x,y,w,h,col,z)=>{const s=sm([[x-w/2,y,1],[x+w/2,y,1],[x+w/2,y+h],[x-w/2,y+h]],3);P2(g,s,{t:2.6,s:14,paint:P=>{boards(P,null,col,{dir:'h',h:1.5,ink:.3})}},z);return s};
  const maerkeMed=(id,navn,w=192,h=150)=>{const c=cv(w,h),g=c.getContext('2d');g.fillStyle='#fbf3dc';g.strokeStyle='#7a5a3a';g.lineWidth=4;g.beginPath();g.roundRect(4,4,w-8,h-8,16);g.fill();g.stroke();g.save();g.translate(w/2,h*.4);(FODER[id]?tegnFoder:id==='toem'?(q,_,r)=>{q.fillStyle='#6a8a5a';q.strokeStyle='#2e4a2a';q.lineWidth=r*.1;q.beginPath();q.moveTo(-r*.7,-r*.5);q.lineTo(r*.7,-r*.5);q.lineTo(r*.5,r*.9);q.lineTo(-r*.5,r*.9);q.closePath();q.fill();q.stroke();q.fillRect(-r*.85,-r*.75,r*1.7,r*.22);q.fillRect(-r*.2,-r*.95,r*.4,r*.2)}:tegnFinish)(g,id,h*.27);g.restore();g.fillStyle='#3a2414';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${Math.round(h*.17)}px "Alegreya Sans",sans-serif`;g.fillText(navn,w/2,h*.83,w-16);return tx(c,true)};
  const plan=(map,w,h,x,y,z,par)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,toneMapped:false}));m.position.set(x,y,z);m.userData.noShadow=true;par.add(m);return m};
  const Rm=makeRoom(ctx,{bg:'#0e1418',fit:fitBox(88,50,0,20.5),sky:'#dff0ff',ground:'#4a4038',amb:.6,key:{col:'#fff0d8',i:1.9,tgt:[0,16,0]},fast:true,
    miss:()=>{if(!on&&!over)begynd();else if(over&&!on)begynd()},
    build:Rm=>[()=>{const g=Rm.scene;/* udsigten gennem lugen: himmel, bakker og et par skyer */
        const H=box(-76,20,76,64);P2(g,H,{t:.3,s:8,cap:1600,paint:P=>{P.wash('#9fd8f6',H,{top:'#62b4ea',edge:0,clouds:10});for(const[x,y,w,h]of[[-40,40,20,5],[8,43,16,4],[44,38,22,5]])P.wash('#ffffff',VRK.cloud(x,y,w,h),{alpha:.9,edge:.5,mode:'source-over'});
            P.wash('#8ccf78',sm([[-77,20,1],[-77,29],[-50,33],[-22,28],[6,32],[34,27],[60,31],[77,28],[77,20,1]],8),{alpha:1,edge:.3,mode:'source-over',top:'#a8e08a'});P.wash('#6fb862',sm([[-77,20,1],[-77,25],[-36,27.5],[-4,25],[30,28],[77,24.6],[77,20,1]],8),{alpha:1,edge:.3,mode:'source-over'})}},-12);
        /* væggen under lugen, karmen og markisen */
        const V=box(-76,-2,76,23);P2(g,V,{t:.6,s:9,cap:1800,paint:P=>{P.wash('#2f8a84',V,{top:'#3aa39a',edge:0,clouds:8});for(let x=-76;x<76;x+=4)P.pen([[x,-2],[x,23]],'#1c5a56',.12,.5);for(let y=0;y<23;y+=4)P.pen([[-76,y],[76,y]],'#1c5a56',.12,.5)}},-4.4);
        P2(g,box(-76,22.4,76,24),{color:'#e8c890',kind:'balsa',t:3.2,edge:'#8a6a3a'},-4.6);for(const x of[-43.6,43.6])P2(g,box(x-1.6,23,x+1.6,50),{color:'#c89a5a',kind:'balsa',t:2.4},-4.6);
        {const m=[];for(let i=0;i<16;i++){const x0=-48+i*6;m.push(toCCW(sm([[x0,50,1],[x0+6,50,1],[x0+6,45.4],[x0+3,43.6],[x0,45.4]],4)))}m.forEach((s,i)=>P2(g,s,{color:i%2?'#f6efdc':'#e0457a',kind:'water',t:.2},-3.4+(i%2)*.04))}},
      ()=>{const g=Rm.scene;/* arbejdsbordet */
        const F=box(-76,0,76,TY);P2(g,F,{t:1,s:9,cap:1800,paint:P=>{boards(P,null,'#b07a44',{dir:'v',h:5,ink:.3});for(let x=-66;x<70;x+=22){P.score([...box(x,2,x+18,TY-2.4),[x,2]],{w:.14,ink:.45,dark:'#3a2010'});P.fill(circ(x+9,TY-5,.7,.7,12),'#e0b964',1)}}},10);
        Rm.floor(box(-76,-4.4,76,10),{t:.3,s:8,cap:1600,paint:P=>boards(P,null,'#d8b078',{dir:'v',h:3,ink:.2})},TY);Rm.floor(box(-76,9.4,76,10.4),{color:'#8a5a2c',kind:'balsa',t:.5},TY+.1);
        for(let i=0;i<40;i++)Rm.floor(box(-76,-10+i*1.05,76,-9+i*1.05),{color:shade('#8a6a50',R(-.06,.06)),kind:'balsa',t:.3},0);
        /* hylden til den bageste række kasser */
        P2(g,box(-43,KY[1]-.5,-11,KY[1]),{color:'#8a5a2c',kind:'balsa',t:5},-4);P2(g,box(13,KY[1]-.5,35,KY[1]),{color:'#8a5a2c',kind:'balsa',t:5},-4);
        /* seks kasser med råvarer */
        FODERID.forEach((id,k)=>{const x=KX[k%3],y=KY[k<3?0:1],z=k<3?4:-2.6;tile(g,x,y,8.8,5,'#a87440',z);const hb=new THREE.Mesh(new THREE.PlaneGeometry(9.6,5.6),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,y+2.6,z+3.2);g.add(hb);Rm.tap(hb,()=>iSkaal(id))});
        /* de fire tilberedninger og spanden */
        FINISHID.forEach((id,k)=>{const x=VX[k%2],y=KY[k>>1],z=k>>1?-2.6:4;tile(g,x,y,8.8,5,'#5a4a8a',z);const hb=new THREE.Mesh(new THREE.PlaneGeometry(9.6,5.6),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,y+2.6,z+3.2);g.add(hb);Rm.tap(hb,()=>tilbered(id))});
        {tile(g,38.6,TY,8,5,'#4a6a44',4);const hb=new THREE.Mesh(new THREE.PlaneGeometry(9,5.6),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(38.6,TY+2.6,7.2);g.add(hb);Rm.tap(hb,toem)}
        /* skålen */
        const sk0=toCCW(sm([[-9.4,TY+6,1],[9.4,TY+6,1],[8.4,TY+2.6],[5,TY+.4],[2.6,TY,1],[-2.6,TY,1],[-5,TY+.4],[-8.4,TY+2.6]],6));P2(g,sk0,{t:3,s:20,paint:P=>{P.wash('#f6efdc',sk0,{top:'#ffffff',edge:.5,clouds:4});for(let x=-9;x<10;x+=3)P.fill(box(x,TY+3.4,x+1.5,TY+5),'#43a3d3',.9);P.fill(box(-10,TY+5.3,10,TY+6.1),'#e0457a',.9)}},3.4);
        const hb=new THREE.Mesh(new THREE.PlaneGeometry(20,11),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(0,TY+5,8);g.add(hb);Rm.tap(hb,()=>{if(!on){begynd();return}const a=SLOT.find(q=>q&&q.st==='venter'&&ens(q.ordre,skaal));if(a)server(a);else ctx.say(skaal.ing.length?'Skålen passer ikke til nogen bestilling endnu.':'Tryk på kasserne for at fylde skålen.')})},
      ()=>{const lv=Rm.live;/* skilte på kasserne, det der ligger i skålen, og uret */
        FODERID.forEach((id,k)=>{const x=KX[k%3],y=KY[k<3?0:1],z=k<3?4:-2.6;plan(maerkeMed(id,FODER[id].navn),6.6,4.6,x,y+2.5,z+2.8,lv)});
        FINISHID.forEach((id,k)=>{const x=VX[k%2],y=KY[k>>1],z=k>>1?-2.6:4;plan(maerkeMed(id,FINISH[id].navn),6.6,4.6,x,y+2.5,z+2.8,lv)});plan(maerkeMed('toem','Tøm skålen'),6.2,4.6,38.6,TY+2.5,6.8,lv);
        sk=cv(512,112);skT=tx(sk,true);plan(skT,20,4.4,0,TY+8.6,5,lv);hud=cv(640,72);ht=tx(hud,true);plan(ht,28,3.15,0,43.6,-2,lv);
        /* værktøjet der arbejder over skålen */
        arbS={};for(const id of FINISHID){const c=cv(128,128),g=c.getContext('2d');g.translate(64,64);tegnFinish(g,id,44);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx(c,true),transparent:true,depthWrite:false}));s.scale.set(7,7,1);s.visible=false;lv.add(s);arbS[id]=s}
        for(let i=0;i<3;i++){const mk=txt=>{const c=cv(128,96),g=c.getContext('2d');g.font=FONT.dyr.replace('X','64px');g.textAlign='center';g.textBaseline='middle';g.lineWidth=8;g.strokeStyle='#4a2c10';g.strokeText(txt,64,50);g.fillStyle='#ffe07a';g.fillText(txt,64,50);return tx(c,true)},s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));s.scale.set(7,5.25,1);s.visible=false;lv.add(s);plus.push({s,t:9,x:0,en:mk('+1'),to:mk('+2')})}
        tegnSkaal();tegnHud()},
      ()=>{const lv=Rm.live;/* dyrene: en lille flok, der skiftes til at komme hen til lugen */
        [{kind:'hund'},{kind:'kanin',pynt:'sløjfe'},{kind:'bjørn',pynt:'tørklæde'},{kind:'ræv',pynt:'ingen'},{kind:'frø',pynt:'krone'},{kind:'enhjørning',pynt:'ingen'},{kind:'drage',pynt:'ingen'}].forEach((o,i)=>{const K=makePet(Object.assign({res:.8},o));K.G.scale.setScalar(AFF);K.G.position.set(-70,AY,-7.5-i*.12);K.G.visible=false;lv.add(K.G);
          const bc=cv(320,200),bt=tx(bc,true),bm=plan(bt,12.8,8,0,37.4,-3,lv);bm.visible=false;const barB=plan(null,9,.9,0,23.1,-1.25,lv);barB.material.map=null;barB.material.color.set('#3a2a20');barB.visible=false;const bar=plan(null,8.6,.56,0,23.1,-1.2,lv);bar.material.map=null;bar.visible=false;
          const hb=new THREE.Mesh(new THREE.PlaneGeometry(22,20),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(6,13,3);K.G.add(hb);const a={K,st:'hvile',x:-70,tx:-70,bc,bt,bm,bar,barB,ordre:null,ryst:0,glad:0,ph:0};Rm.tap(hb,()=>{if(!on){begynd();return}server(a)});Rm.tap(bm,()=>{if(!on){begynd();return}server(a)});POOL.push(a)});
        ctx.say('Dyrene bestiller ved lugen. Fyld skålen, som taleboblen viser, gør den færdig, og tryk på dyret.')}],
    tick:(t,dt)=>{if(on){left-=dt;if(Math.ceil(left)!==Math.ceil(left+dt)){tegnHud();if(left<6&&left>0)LYD.tryk()}nextT-=dt;if(nextT<=0&&SLOT.filter(Boolean).length<samtidig()){kom();nextT=2+Math.random()*2.5}if(left<=0)slut()}
      for(const a of POOL){if(a.st==='hvile')continue;const d=a.tx-a.x,gaar=Math.abs(d)>.3;if(gaar){const st=Math.sign(d)*Math.min(Math.abs(d),(a.st==='ud'?30:26)*dt);if(a.K.hopper){a.ph+=dt*12;if(a.K.luft)a.x+=st*1.5}else{a.x+=st;a.ph+=Math.abs(st)*.9}}
        if(a.st==='ind'&&!gaar){a.st='venter';a.bm.visible=true;a.bar.visible=a.barB.visible=true;a.bm.position.x=SX[a.slot]+8.6;a.bar.position.x=a.barB.position.x=SX[a.slot];tegnBoble(a);tegnSkaal();LYD.op()}
        if(a.st==='ud'&&!gaar){a.st='hvile';a.K.G.visible=false;a.ordre=null;continue}
        if(a.st==='venter'&&on){a.tid-=dt;const k=Math.max(0,a.tid/a.tid0);a.bar.scale.x=Math.max(.02,k);a.bar.position.x=SX[a.slot]-4.3*(1-k);a.bar.material.color.set(k>.5?'#5fd070':k>.25?'#f2c230':'#e0503a');if(a.tid<=0){LYD.oev();gaa(a,false);tegnSkaal()}}
        a.ryst=Math.max(0,a.ryst-dt*2.2);const hop=a.st==='ud'&&a.glad?Math.abs(Math.sin(t*9))*1.6:0,vej=a.vendt=gaar?Math.sign(d):(a.vendt||1);/* dyret bliver ved med at kigge den vej, det kom fra, når det står ved lugen */a.K.G.position.x=a.x+(vej<0?12:0)+Math.sin(a.ryst*26)*a.ryst*.8;a.K.G.position.y=AY+hop+(a.K.hopper?(a.K.kind==='frø'?3.4:a.K.kind==='kanin'?1.6:0):gaar?Math.abs(Math.sin(a.ph))*.5:0);a.K.G.scale.x=AFF*vej;a.K.tick(t,{ph:a.ph,amp:gaar?1:0});
        if(a.bm.visible)a.bm.position.y=37.4+Math.sin(t*2+a.slot)*.25}
      /* tilberedningen: værktøjet arbejder et øjeblik over skålen */
      if(arb){arb.t+=dt;const s=arbS[arb.id],k=arb.t/.75;s.visible=true;if(arb.id==='hak')s.position.set(-2+k*4,TY+10.5+Math.abs(Math.sin(k*Math.PI*3))*2.4,7);else if(arb.id==='roer')s.position.set(Math.cos(k*TAU*2)*3.4,TY+10.4+Math.sin(k*TAU*2)*.9,7);else if(arb.id==='glimmer'){s.position.set(Math.sin(k*9)*2,TY+12.5-k,7);if(Math.random()<.5)Rm.burst(R(-5,5),TY+8,7,2,'rgba(255,230,140,.95)',2)}else{s.position.set(0,TY+9.6+Math.sin(k*20)*.3,7);const z=7*(1+.3*Math.sin(k*14));s.scale.set(z,z,1)}
        if(k>=1){s.visible=false;s.scale.set(7,7,1);skaal.finish=arb.id;arb=null;tegnSkaal();Rm.burst(0,TY+8,7,8,'rgba(255,255,255,.9)',6)}}
      rystSk=Math.max(0,rystSk-dt*4);
      for(const q of plus){q.t+=dt*.9;if(q.t>1){q.s.visible=false;continue}q.s.visible=true;q.s.position.set(q.x,31+q.t*7,2);q.s.material.opacity=1-q.t*q.t}}});
  let arbS;
  ctx.test={begynd,state:()=>({on,over,left,fodret,point,skaal,slots:SLOT.map(a=>a&&{st:a.st,ordre:a.ordre,tid:a.tid})}),iSkaal,tilbered,toem,server:i=>server(SLOT[i]),lav:i=>{const a=SLOT[i];if(!a||a.st!=='venter')return false;skaal={ing:a.ordre.ing.slice(),finish:a.ordre.finish};tegnSkaal();return true},tid:x=>{left=x},utaal:i=>{if(SLOT[i])SLOT[i].tid=.05},kom,fodret:n=>{fodret=n}}};
