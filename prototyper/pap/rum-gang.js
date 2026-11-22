/* ============ Skolen: gangen med dørene til fagene. Heksen går hen til den dør man trykker på ============ */
ROOMS.gang=function(ctx){
  const FAG=[{id:'eliksir',navn:'Eliksir',x:-33,col:'#2f6a4a',rum:'eliksir'},{id:'kost',navn:'Kosteflyvning',x:-11,col:'#2e4a7a',rum:'kost'},{id:'dyr',navn:'Dyrepasning',x:11,col:'#8a5a2a',rum:'dyrepark'},{id:'fald',navn:'Faldskærm',x:33,col:'#6b3fa0',rum:'fald'}];
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),DW=13,DH=24,W0={x:0,tx:0,ph:0,amp:0,face:1,want:null};let heks,kat,opening=null;
  /* fagenes tegn, klippet i papir */
  const tegn=(g,id,x,y,z)=>{
    if(id==='eliksir'){P2(g,sm([[x-2.2,y+.9],[x+2.2,y+.9],[x+2.5,y-.6],[x+1.6,y-2],[x-1.6,y-2],[x-2.5,y-.6]],5),{color:'#2a2630',kind:'water',t:.2},z);P2(g,box(x-2.6,y+.8,x+2.6,y+1.3),{color:'#3a3644',kind:'water',t:.26},z);P2(g,circ(x,y+1.25,1.9,.5,16),{t:.1,mat:paperMat('#d8fff0','tissue',{glow:'#6fe0b0',gi:1.1})},z+.1);for(const[dx,dy,r]of[[-.6,2.3,.42],[.7,3,.3],[.1,3.8,.22]])P2(g,circ(x+dx,y+dy,r,r,12),{t:.06,mat:paperMat('#d8fff0','tissue',{glow:'#6fe0b0',gi:1.1})},z)}
    if(id==='kost'){for(const s of thick([[[x-2.8,y-1.8],[x+1,y+1.2]]],.26))P2(g,s,{color:'#b5844a',kind:'balsa',t:.2},z);P2(g,toCCW(sm([[x+.6,y+.6,1],[x+1.6,y+2.6],[x+3.4,y+3.2],[x+3,y+1.2],[x+1.8,y-.2,1]],5)),{color:'#e9c46a',kind:'kraft',t:.2},z+.05);P2(g,toCCW([[x+.4,y+.9],[x+1.5,y-.3],[x+1.9,y+.1],[x+.8,y+1.3]]),{color:'#8a3a2e',kind:'water',t:.24},z+.1)}
    if(id==='dyr'){P2(g,circ(x,y-.5,1.6,1.3,20),{color:'#f6e7c0',kind:'water',t:.2},z);for(const[dx,dy]of[[-1.9,1],[-.7,2],[.7,2],[1.9,1]])P2(g,circ(x+dx,y+dy,.62,.75,14),{color:'#f6e7c0',kind:'water',t:.2},z)}
    if(id==='fald'){const k=[[x-3,y+.6]];for(let i=0;i<=12;i++){const a=Math.PI-i/12*Math.PI;k.push([x+Math.cos(a)*3,y+.6+Math.sin(a)*2.8])}for(let i=0;i<3;i++)k.push([x+3-(i+.5)*2,y+1.2],[x+3-(i+1)*2,y+.6]);P2(g,toCCW(k),{color:'#e0457a',kind:'water',t:.2},z);for(const dx of[-2.8,0,2.8])for(const s of thick([[[x+dx,y+.6],[x,y-2.2]]],.07))P2(g,s,{color:'#f1ead8',t:.05},z);P2(g,box(x-.5,y-3,x+.5,y-2.1),{color:'#c9a04a',kind:'kraft',t:.3},z)}};
  const Rm=makeRoom(ctx,{bg:'#0e0b14',fit:fitBox(90,50,0,20.5),sky:'#a8a0d8',ground:'#3a3040',amb:.42,key:{col:'#ffd9b0',i:1.5,tgt:[0,16,0]},
    build:Rm=>[()=>{const g=Rm.scene,W=box(-76,-2,76,64);
        P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{P.wash('#5f5a70',W,{top:'#3f3a52',edge:0,clouds:16});P.ashlar(W,'#6a6480',{rowH:[3.4,4.4],bw:[5.5,9],tint:.07,ink:.24})}},-10);
        /* gulv: stenfliser og en lang løber */
        for(let i=0;i<13;i++)for(let j=0;j<5;j++)Rm.floor(box(-78+i*12+(j%2?6:0),-10+j*8.2,-66.3+i*12+(j%2?6:0),-2.1+j*8.2),{color:shade('#56506a',R(-.07,.07)),kind:'gran',t:.3},0);
        Rm.floor(box(-78,1,78,9.6),{color:'#7a2634',kind:'water',t:.1},.32);for(const z of[1.5,9.1])Rm.floor(box(-78,z-.28,78,z+.28),{mat:gold(),t:.03},.4)},
      ()=>{const g=Rm.scene;/* piller med fakler, og hvælv imellem */
        for(const x of[-44,-22,0,22,44]){P2(g,box(x-2.2,0,x+2.2,50),{t:1.6,s:14,paint:P=>{P.wash('#77718c',null,{edge:.4,top:'#5a5470',clouds:5});P.ashlar(null,'#7c7692',{rowH:[2.6,3.4],bw:[5,6],tint:.05,ink:.2})}},-9);P2(g,box(x-3,0,x+3,2.4),{color:'#4a4458',kind:'gran',t:2.4},-9);P2(g,box(x-3,46.6,x+3,49),{color:'#4a4458',kind:'gran',t:2.4},-9);
          P2(g,toCCW([[x-1,24.6],[x+1,24.6],[x+.5,21],[x-.5,21]]),{color:'#2e2833',t:.8},-7);P2(g,box(x-1.3,24.4,x+1.3,25.2),{mat:gold(),t:1},-7);
          const fl=toCCW(sm([[x-1.1,25.2,1],[x+1.1,25.2,1],[x+1.2,27],[x+.3,28.4],[x,30.2,1],[x-.6,28.2],[x-1.3,26.8]],6));P2(g,fl,{t:.3,mat:paperMat('#fff0c0','tissue',{glow:'#ffb040',gi:1.8})},-6.4);Rm.glow(x,27.4,-5.4,'#ffb040',12,true);const L=new THREE.PointLight('#ffb468',70,46,2);put(g,L,x,28,0)}
        for(let i=0;i<4;i++){const a=-44+i*22,b=a+22,v=[[a+2,64],[b-2,64],[b-2,47]];for(let k=1;k<12;k++){const t=k/12*Math.PI;v.push([(a+b)/2+Math.cos(t)*(9),47+Math.sin(t)*7.6])}v.push([a+2,47]);
          const mid=clip([box(a+2,47,b-2,64)],[toCCW(v.slice(2).concat([[a+2,47]]))],'diff');for(const s of mid)P2(g,s,{color:'#4a4460',kind:'gran',t:1.2},-8.6)}},
      ()=>{const g=Rm.scene;/* dørene: stenkarm, lys bag fløjene og skilt med fagets tegn */
        for(const f of FAG){const sh=arch(f.x,0,DW,DH,24);P2(g,grow(sh,1.5,false)[0].outer,{t:.9,s:14,paint:P=>{P.wash('#8a84a0',null,{edge:.4,top:'#a49ebb',clouds:4});P.ashlar(null,'#948eab',{rowH:[2.4,2.8],bw:[2.6,3.2],tint:.05,ink:.22})}},-9.4);
          P2(g,sh,{t:.1,mat:paperMat('#fff2c8','tissue',{glow:f.rum?'#ffd890':'#6a5a80',gi:f.rum?1.5:.5})},-9.2);
          const sg=new THREE.Group();put(g,sg,f.x,DH+3.6,-8.2);P2(sg,circ(0,5.6,4.6,4.6,36),{color:f.col,kind:'water',t:.3},0);for(const s of ring(circ(0,5.6,4.6,4.6,36),.4,false))P2(sg,s,{mat:gold(),t:.36},0);tegn(sg,f.id,0,5.6,.4);
          plate(sg,'fag',f.navn,FONT.skole,f.navn.length*1.25+3,2.6,{bg:f.col,frame:'gold',size:1.5,y:-2.2,z:.3});
          /* fløjene står i det levende lag, så de kan gå op */
          f.leaves=[-1,1].map(s=>{const pv=new THREE.Group();pv.position.set(f.x+s*DW/2,0,-8.6);Rm.live.add(pv);const lf=clip([sh.map(([x,y])=>[x-f.x-s*DW/2,y])],[box(s<0?0:-DW/2,-1,s<0?DW/2:0,DH+1)],'inter');
            if(f.rum){pv.rotation.y=s*.16;if(s<0)Rm.glow(f.x,DH*.5,-7,'#ffd890',16)}
            for(const q of lf){const m=piece(q,{t:.4,s:16,paint:P=>{boards(P,null,'#6a4426',{dir:'v',h:1.6,ink:.3});for(const y of[4,DH-8])P.flat('#2e2028',box(-DW,y,DW,y+.9),.7);P.fill(circ(-s*(DW/2-1.3),DH*.42,.5,.5,12),'#c9a04a',1)}});pv.add(m)}return{pv,s}});
          const hitbox=new THREE.Mesh(new THREE.PlaneGeometry(DW+3,DH+12),new THREE.MeshBasicMaterial({visible:false}));hitbox.position.set(f.x,(DH+12)/2,-8);g.add(hitbox);Rm.tap(hitbox,()=>{if(!opening){W0.tx=f.x;W0.want=f}})}},
      ()=>{heks=makeFigure(Object.assign({},ctx.look));heks.G.scale.setScalar(.8);heks.G.position.set(0,.35,5.4);Rm.live.add(heks.G);W0.sh=Rm.blob(0,5.4,13,5);
        kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.5);kat.G.position.set(-8,.35,7.5);Rm.live.add(kat.G);ctx.say('Tryk på en dør, så går heksen derhen')}],
    tick:(t,dt)=>{const d=W0.tx-W0.x,mv=Math.abs(d)>.3&&!opening;if(mv){const st=Math.sign(d)*Math.min(Math.abs(d),24*dt);W0.x+=st;W0.face=Math.sign(d);W0.ph+=Math.abs(st)/3.4*Math.PI}
      W0.amp+=((mv?1:0)-W0.amp)*Math.min(1,dt*8);heks.G.position.x=W0.x;heks.G.scale.x=.8*W0.face;heks.G.position.y=.35+Math.abs(Math.sin(W0.ph))*.5*W0.amp;heks.tick(t,{ph:W0.ph,amp:W0.amp});W0.sh.position.x=W0.x;
      const kx=W0.x-W0.face*8,kd=kx-kat.G.position.x,km=Math.abs(kd)>.6;if(km&&(!kat.hopper||kat.luft))kat.G.position.x+=Math.sign(kd)*Math.min(Math.abs(kd),26*(kat.hopper?1.7:1)*dt);kat.G.scale.x=.5*(km?Math.sign(kd):W0.face);kat.tick(t,{ph:t*13,amp:km?1:0});
      if(W0.want&&!mv&&!opening){const f=W0.want;W0.want=null;if(f.rum&&ROOMS[f.rum]){opening={f,t:0}}else ctx.say(`${f.navn} åbner snart`)}
      if(opening){opening.t+=dt;const k=Math.min(1,opening.t/.7),e=k*k*(3-2*k);for(const l of opening.f.leaves)l.pv.rotation.y=l.s*e*1.25;if(opening.t>.95&&!opening.done){opening.done=true;ctx.go(opening.f.rum)}}}})};
