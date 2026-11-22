/* ============ Boblebutikken: alt nyt kommer i magiske sæbebobler. En boble koster stjerner, og i den ligger noget nyt til Garderoben ============ */
ROOMS.bobler=function(ctx){
  const PRIS=10,P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),JARX=[4,16,28],BX=2,BY=26,KR=SPIL.KRUKKER;let nisse,heks,kat,st=null,nhop=0,dim,bob,vis=null,straal;
  /* som i det oprindelige spil: en boble koster 10 stjerner, man vælger selv krukken (tøj og hår, kæledyr eller værelset), og boblen skal have tre tryk, før den springer */
  const koeb=i=>()=>{if(st)return;const m=SPIL.mangler(i);if(!m.length){ctx.say(`Krukken med ${KR[i].navn.toLowerCase()} er tom: du har fået det hele. Prøv en af de andre!`);nhop=1;return}
    if(SPIL.stj<PRIS){ctx.say(`En boble koster ${PRIS} stjerner, og du har ${SPIL.stj}. Stjerner tjener du i Eliksirtimen og i Dyreparken.`);nhop=1;return}
    LYD.pust();SPIL.giv(-PRIS);st={f:'op',t:0,x0:JARX[i],n:0,slag:0,vare:m[Math.floor(Math.random()*m.length)]};bob.visible=true;nhop=1;ctx.say('Nissen puster en boble op …')};
  const tryk=()=>{if(!st||st.f!=='vent')return;st.n++;st.slag=1;if(st.n>=3){pop();return}LYD.bobletryk(st.n);Rm.burst(BX,BY,13,5,'rgba(255,255,255,.9)',9);ctx.say(st.n===1?'To gange til …':'Én gang til!')};
  const Rm=makeRoom(ctx,{bg:'#0f1416',fit:fitBox(88,50,0,20.5),sky:'#c8e8e0',ground:'#3a3040',amb:.5,key:{col:'#fff0d8',i:1.9,tgt:[0,16,0]},
    miss:()=>tryk(),
    build:Rm=>[()=>{const g=Rm.scene,W=box(-76,-2,76,64);
        P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{P.wash('#2f6f68',W,{top:'#245650',edge:0,clouds:14});for(let x=-76;x<76;x+=7)P.fill(box(x,11,x+3.2,64),'#f6e7c0',.16);for(let y=16;y<64;y+=7)for(let x=-72.4;x<76;x+=7)P.fill(circ(x,y,.5,.5,10),'#ff9ad0',.55);
          P.wash('#5a2f4a',box(-77,-3,77,11),{alpha:.97,edge:0,mode:'source-over',clouds:6});for(let x=-76;x<76;x+=7)P.score([...box(x+.6,1,x+6.4,9.4),[x+.6,1]],{w:.12,ink:.4,dark:'#2a1020'})}},-10);
        P2(g,box(-76,10.4,76,11.6),{color:'#c9a04a',kind:'balsa',t:.6},-9.6);
        for(let i=0;i<40;i++)Rm.floor(box(-76,-10+i*1.05,76,-9+i*1.05),{color:shade('#7a4e3a',R(-.06,.06)),kind:'balsa',t:.3},0);
        /* hylder med små krukker, hver med en lysende boble */
        for(const sy of[27,37]){P2(g,box(-40,sy-.6,-8,sy+.3),{color:'#86593a',kind:'balsa',t:3},-9.4);P2(g,box(14,sy-.6,40,sy+.3),{color:'#86593a',kind:'balsa',t:3},-9.4);
          for(const x of[-37,-32,-27,-22,-17,-12,18,23,28,33,38]){const c=['#ff9ad0','#9fe7ff','#ffe27a','#b8f0a0','#c9a0ff','#ffb347'][Math.floor(R(6))],h=R(3.6,5),j=sm([[x-1.5,sy+.3],[x+1.5,sy+.3],[x+1.7,sy+h*.7],[x+.8,sy+h],[x-.8,sy+h],[x-1.7,sy+h*.7]],4);
            P2(g,j,{t:1,mat:paperMat('#f2fbff','tissue',{glow:c,gi:.55})},-8.6);P2(g,box(x-1,sy+h,x+1,sy+h+.5),{color:'#c8a070',kind:'balsa',t:1},-8.6);P2(g,circ(x,sy+h*.42,.8,.8,14),{t:.05,mat:paperMat('#ffffff','tissue',{glow:c,gi:1.5})},-7.5)}}
        for(const[x,y,c]of[[-24,31,'#ff9ad0'],[28,31,'#9fe7ff'],[-27,41,'#ffe27a'],[26,41,'#c9a0ff']])Rm.glow(x,y,-6,c,13)},
      ()=>{const g=Rm.scene;/* disken med tre store krukker og et prisskilt */
        const fr=box(-27,0,36,13.4);P2(g,fr,{t:1,s:14,paint:P=>{P.wash('#f6e7c0',fr,{edge:.4,clouds:5});for(let x=-27;x<36;x+=4.5)P.fill(box(x,0,x+2.25,13.4),'#e86a9a',.85);P.flat('#5a2f4a',box(-27,0,36,1.4),.8);P.fill(box(-27,11.6,36,12.2),'#c9a04a',1)}},3.4);
        P2(g,box(-28.4,13.2,37.4,14.8),{color:'#86593a',kind:'balsa',t:7},-2.4);
        JARX.forEach((x,i)=>{const jg=new THREE.Group();g.add(jg);const j=sm([[x-3.9,14.8],[x+3.9,14.8],[x+4.3,22.4],[x+2.4,25.2],[x-2.4,25.2],[x-4.3,22.4]],6),c=['#ff9ad0','#9fe7ff','#ffe27a'][i];
          P2(jg,j,{t:2,mat:paperMat('#f4fcff','tissue',{glow:c,gi:.3})},1);P2(jg,box(x-2.9,25.2,x+2.9,26.4),{color:'#c8a070',kind:'balsa',t:2.4},.9);P2(jg,circ(x,19.4,2.5,2.5,28),{t:.06,mat:paperMat('#ffffff','tissue',{glow:c,gi:1.5})},3.2);for(const q of ring(circ(x,19.4,2.5,2.5,28),.22,false))P2(jg,q,{mat:gold(),t:.08},3.25);
          /* et lille billede på krukken af det, der er i: en hat (tøj og hår), en pote (kæledyr) og en seng (værelset) */
          {const y=19.4,I=(sh,col)=>P2(jg,toCCW(sh),{color:col,kind:'water',t:.07},4.7);
            if(i===0){I([[x-1.1,y-.7],[x+1.1,y-.7],[x+.35,y+.55],[x+.8,y+1.65],[x-.3,y+1]],'#6a3fa2');I(circ(x,y-.85,1.95,.42,20),'#58328a');I(box(x-.92,y-.6,x+.92,y-.28),'#e0b040')}
            if(i===1){I(circ(x,y-.55,1.05,.85,18),'#8a5a34');for(const[dx,dy]of[[-1.1,.4],[-.4,1.05],[.4,1.05],[1.1,.4]])I(circ(x+dx,y+dy,.4,.5,12),'#8a5a34')}
            if(i===2){I(box(x-1.8,y-1.1,x-1.4,y+1.2),'#8a5a34');I(box(x+1.5,y-1.1,x+1.85,y+.3),'#8a5a34');I(box(x-1.4,y-.7,x+1.5,y-.05),'#6a3fa2');I(circ(x-.75,y+.25,.6,.32,12),'#ffffff');I(box(x-.1,y-.1,x+1.5,y+.25),'#e0457a')}}Rm.glow(x,19.4,4.4,c,9);
          const hb=new THREE.Mesh(new THREE.PlaneGeometry(10,13),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(x,20.4,3.6);jg.add(hb);Rm.tap(hb,koeb(i))});
        plate(g,'pris',`${PRIS} stjerner for en boble`,FONT.bobler,19,2.8,{bg:'#5a2f4a',frame:'gold',size:1.45,x:-14.6,y:7.2,z:4.1});KR.forEach((k,i)=>plate(g,'krukke'+i,k.navn,FONT.bobler,10.6,2.4,{bg:'#f6e7c0',fg:'#5a2f4a',frame:'gold',size:1.25,x:JARX[i],y:8.6,z:4.1}));
        /* klokken på disken */
        P2(g,sm([[-22.6,14.8],[-18.6,14.8],[-19,16.8],[-20.6,17.8],[-22.2,16.8]],5),{mat:gold(),t:1.6},1.4);P2(g,circ(-20.6,18.1,.45,.45,10),{mat:gold(),t:.6},2)},
      ()=>{const lv=Rm.live;nisse=makeFigure({tøj:'rejsekappe',hat:'nathat',hår:'kort',kappe:'ingen',tilbehør:'tørklæde',stav:false,skæg:'#f1ece2',hair:['#d8d2c8','#f4f0e8','#a8a098'],lash:0,freck:false,col:{hat:'#b83a3a',frakke:'#3f7a4a'}});nisse.G.scale.setScalar(.72);nisse.G.position.set(-9,6.6,-3);lv.add(nisse.G);Rm.tap(nisse.G,()=>{nhop=1;ctx.say(SPIL.stj>=PRIS?'Vælg en krukke, så puster jeg en boble op til dig.':`En boble koster ${PRIS} stjerner. Kom igen, når du har tjent nogle flere!`)});
        heks=makeFigure(Object.assign({},ctx.look));heks.G.scale.setScalar(.8);heks.G.position.set(-31.5,.35,9);lv.add(heks.G);Rm.blob(-31.5,9,13,5);kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.5);kat.G.position.set(-23.5,.9,12.5);lv.add(kat.G);Rm.blob(-22,12.5,8,3.4);
        dim=new THREE.Mesh(new THREE.PlaneGeometry(260,160),new THREE.MeshBasicMaterial({color:'#080612',transparent:true,opacity:0,depthWrite:false}));dim.position.set(0,20,11);dim.userData.noShadow=true;lv.add(dim);
        /* sæbeboblen: næsten gennemsigtig, med regnbuekant og et lysglimt */
        bob=new THREE.Group();bob.visible=false;lv.add(bob);{const c=cv(256,256),q=c.getContext('2d'),gr=q.createRadialGradient(128,128,60,128,128,126);gr.addColorStop(0,'rgba(200,235,255,.10)');gr.addColorStop(.72,'rgba(190,230,255,.22)');gr.addColorStop(.86,'rgba(255,170,220,.55)');gr.addColorStop(.93,'rgba(160,230,255,.75)');gr.addColorStop(.98,'rgba(255,240,170,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=gr;q.beginPath();q.arc(128,128,127,0,TAU);q.fill();
          q.fillStyle='rgba(255,255,255,.85)';q.beginPath();q.ellipse(84,76,26,14,-.7,0,TAU);q.fill();q.fillStyle='rgba(255,255,255,.6)';q.beginPath();q.arc(170,186,7,0,TAU);q.fill();
          const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:tx(c,true),transparent:true,depthWrite:false}));m.userData.noShadow=true;bob.add(m);const hb=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({visible:false}));bob.add(hb);Rm.tap(hb,tryk)}
        /* strålerne bag det, der var i boblen */
        {const c=cv(256,256),q=c.getContext('2d');q.translate(128,128);{const g0=q.createRadialGradient(0,0,40,0,0,126);g0.addColorStop(0,'rgba(255,236,170,.5)');g0.addColorStop(1,'rgba(255,236,170,0)');q.fillStyle=g0;q.beginPath();q.arc(0,0,126,0,TAU);q.fill()}for(let i=0;i<18;i++){q.rotate(TAU/18);const gr=q.createLinearGradient(0,0,0,-126);gr.addColorStop(0,'rgba(255,236,170,.55)');gr.addColorStop(1,'rgba(255,236,170,0)');q.fillStyle=gr;q.beginPath();q.moveTo(-6,0);q.lineTo(6,0);q.lineTo(13,-126);q.lineTo(-13,-126);q.fill()}straal=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:tx(c,true),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));straal.visible=false;straal.userData.noShadow=true;straal.position.set(BX,BY,12.4);lv.add(straal)}
        ctx.say(`Velkommen! En boble koster ${PRIS} stjerner. Vælg en krukke.`)}],
    tick:(t,dt)=>{nhop=Math.max(0,nhop-dt*2.2);nisse.G.position.y=6.6+Math.sin(nhop*Math.PI)*1.6*nhop;nisse.tick(t,{ph:0,amp:0});heks.tick(t+1,{ph:0,amp:0});kat.tick(t+2,{ph:0,amp:0});
      if(st){st.t+=dt;if(st.f==='op'){const k=Math.min(1,st.t/1.7),e=k*k*(3-2*k);bob.position.set(st.x0+(BX-st.x0)*e+Math.sin(t*3)*.6*(1-e),20+(BY-20)*e+Math.sin(k*Math.PI)*4,12);const s=1.6+e*9;bob.scale.set(s,s,1);dim.material.opacity=.55*e;if(k>=1){st.f='vent';st.t=0;ctx.say('Tryk på boblen!')}}
        else if(st.f==='vent'){st.slag=Math.max(0,st.slag-dt*2.4);const w=1+.03*Math.sin(t*3.1)+.16*Math.sin(st.slag*Math.PI*3)*st.slag,z=10.6+st.n*1.5;bob.scale.set(z*w,z/w,1);bob.position.set(BX+Math.sin(t*23)*.25*st.n*st.slag,BY+Math.sin(t*1.4)*.8,12)}
        else if(st.f==='vis'){const k=Math.min(1,st.t/.55),e=1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2),z=10.4*Math.max(.02,e);vis.G.scale.set(z,z,1);vis.G.rotation.z=.05*Math.sin(t*1.3);vis.tegn(t);straal.scale.set(z*2.1,z*2.1,1);straal.rotation.z=t*.25;straal.material.opacity=.8*k}
        else if(st.f==='ud'){dim.material.opacity=Math.max(0,.6-st.t*1.6);const z=10.4*Math.max(0,1-st.t*3);vis.G.scale.set(z,z,1);straal.scale.set(z*2.1,z*2.1,1);if(st.t>.4){vis.ryd();vis=null;straal.visible=false;st=null;dim.material.opacity=0}}}}});
  /* boblen springer: det, der var i, vises som et billede, og bliver stående, til man trykker videre */
  function pop(){LYD.pop();setTimeout(()=>{if(ctx.alive)LYD.fanfare()},180);const w=st.vare;bob.visible=false;st.f='vis';st.t=0;dim.material.opacity=.6;Rm.burst(BX,BY,13,14,'rgba(255,255,255,.95)',11);Rm.burst(BX,BY,13,10,'rgba(255,170,220,.95)',8);SPIL.har.push(w[0]+':'+w[1]);SPIL.save();nhop=1;
    vis=visVare(w,ctx,Rm);vis.G.position.set(BX,BY,13);vis.G.scale.set(.01,.01,1);Rm.live.add(vis.G);straal.visible=true;vis.tegn(Rm.t);
    const hvor=w[0].startsWith('rum.')?'Kig i Værelset.':w[0].startsWith('dyr')?'Kig i Garderoben, under Kæledyret.':'Kig i Garderoben.';
    ctx.vent(`Du fik ${w[2]}! ${hvor}`,()=>{if(st&&st.f==='vis'){st.f='ud';st.t=0}})}
  ctx.test={koeb:i=>koeb(i)(),tryk,spring:()=>{if(st&&st.f==='op')st.t=1.7;if(st&&st.f==='vis')st.t=.5},pop:()=>{if(st&&st.f==='vent')pop()},st:()=>st&&st.f,vare:w=>{if(st)st.vare=w}};
  ctx.efter.push(()=>{if(vis)vis.ryd()})};
