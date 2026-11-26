/* ============ Dyreparken, del 2: gården ============
   Herfra går man ind i Dyrekøkkenet (til venstre) og Ungestalden (til højre). Midt på gården ligger et stort æg i en rede: det ruger og klækker en dag.
   Heksen går hen til det, man trykker på; dyrene på gården kan man klappe.
   Ægget (Kasper 22. nov.: næbdyret skal man få fra ægget): det bliver varmt af glade dyreunger. Hvert hjerte, ungerne i Ungestalden har på én gang,
   er varme; ved 5 og 10 hjerter kommer der revner, og ved 15 lyser det og vipper af sig selv (Kasper 23. nov.: 6 var for lidt). Så kan man trykke på det, og et næbdyr klækker.
   Næbdyret bor derefter på gården, og man kan vælge det som kæledyr i Garderoben. */
ROOMS.dyrepark=function(ctx){
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),W0={x:0,tx:0,ph:0,amp:0,face:1,want:null},STEDER=[{id:'koek',navn:'Dyrekøkkenet',x:-27,rum:'dyrekoekken'},{id:'stald',navn:'Ungestalden',x:27,rum:'ungestald'}];
  let heks,kat,aeg,vip=0,gaar=null,frys=null,klaek=null,aegGlow=null,top_=null,bund_=null,naeb=null;const KLAR=15,ejerNaeb=()=>SPIL.har.includes('dyr:næbdyr');
  const varme=()=>{const S=SPIL.data.unger||{};let n=0;for(const k in S)n+=S[k].h||0;SPIL.data.aegMax=Math.max(SPIL.data.aegMax||0,n);return SPIL.data.aegMax};const DYR_=[],hj=[],roeg=[];
  const hjerte=(x,y)=>{const q=hj.find(h=>h.t>1)||hj[0];q.t=0;q.x=x;q.y=y};
  const Rm=makeRoom(ctx,{bg:'#0e1418',fit:fitBox(90,50,0,20.5),sky:'#dff0ff',ground:'#5a7a48',amb:.7,key:{col:'#fff2d8',i:2.1,tgt:[0,14,0],box:[-64,64,56,-34]},
    build:Rm=>[()=>{const g=Rm.scene,H=box(-80,-2,80,66);/* himmel, sol, skyer og bakker */
        P2(g,H,{t:.3,s:8,cap:1800,paint:P=>{P.wash('#a8dcf8',H,{top:'#5eb0ea',edge:0,clouds:12});P.wash('#fff6c8',circ(37,40.5,5.4,5.4,30),{alpha:.95,edge:.8,mode:'source-over'});for(const[x,y,w,h]of[[-22,48,22,5.4],[18,53,18,4.4],[50,45,24,5.6],[-64,40,16,4]])P.wash('#ffffff',VRK.cloud(x,y,w,h),{alpha:.92,edge:.5,mode:'source-over'});
            P.wash('#9ad884',sm([[-81,-2,1],[-81,22],[-56,27],[-30,22],[-4,26],[24,21],[52,26],[81,22],[81,-2,1]],8),{alpha:1,edge:.3,mode:'source-over',top:'#b4e69a'})}},-14);
        const B=sm([[-80,-2,1],[-80,13],[-50,16.5],[-18,13.5],[14,16],[44,13],[80,15.5],[80,-2,1]],8);P2(g,B,{t:.4,s:8,cap:1600,paint:P=>{P.wash('#7cc468',B,{top:'#94d67c',edge:.2,clouds:10});for(let i=0;i<60;i++){const x=R(-78,78),y=R(1,12);P.pen([[x,y],[x+.3,y+1]],'#5aa04c',.1,.6)}}},-11);
        /* græs og en sti af sand på tværs af gården */
        for(let i=0;i<40;i++)Rm.floor(box(-80,-11+i*1.1,80,-9.9+i*1.1),{color:shade('#6fb85a',R(-.07,.07)),kind:'water',t:.3},0);
        Rm.floor(sm([[-80,2.4],[-40,1.6],[0,2.8],[40,1.4],[80,2.6],[80,9.6],[40,10.4],[0,9.2],[-40,10.6],[-80,9.4]],6),{color:'#f4e2b4',kind:'water',t:.1},.32);
        for(let i=0;i<34;i++){const x=R(-76,76),z=R(i%2?11:-9,i%2?26:1),c=['#ff8fc7','#ffd54a','#ffffff','#b9a0ff'][i%4];Rm.floor(circ(x,z,.8,.8,8),{color:c,kind:'water',t:.1},.4);Rm.floor(circ(x,z,.3,.3,6),{color:'#f2a030',kind:'water',t:.12},.44)}
        /* stakit bagest */
        for(let x=-78;x<80;x+=3.2)P2(g,toCCW([[x-.9,0],[x+.9,0],[x+.9,5.6],[x,6.8],[x-.9,5.6]]),{color:'#fbf6ea',kind:'balsa',t:.4,edge:'#b8a888'},-9.4);for(const y of[1.8,4.2])P2(g,box(-80,y-.35,80,y+.35),{color:'#f1ead8',kind:'balsa',t:.3},-9.6)},
      ()=>{const g=Rm.scene,x=-27;/* Dyrekøkkenet: et lille hus med luge, markise og skorsten */
        const v=box(x-13,0,x+13,17);P2(g,v,{t:1,s:12,paint:P=>{P.wash('#fbf0d8',v,{top:'#fff8e8',edge:.4,clouds:6});brickwork(P,box(x-13,0,x+13,3.4),'#c88a6a',{bw:2.2,bh:.9});P.score([...box(x-9.6,6.6,x+3.6,13.6),[x-9.6,6.6]],{w:.2,ink:.5,dark:'#5a3a1c'})}},-7);
        const tag=toCCW([[x-15.4,16.4],[x+15.4,16.4],[x+9,28.6],[x-9,28.6]]);P2(g,tag,{t:1.2,s:12,paint:P=>{P.wash('#d85a4a',tag,{top:'#e87a5a',edge:.4});for(let y=17.6;y<28.6;y+=1.5)for(let k=x-15+((Math.round(y/1.5)%2)*1.1);k<x+15.4;k+=2.2)P.pen([[k,y],[k+1.1,y-.9],[k+2.2,y]],'#8a2a20',.12,.65)}},-6.4);
        P2(g,box(x+4.6,26,x+8.2,33.4),{t:2,s:12,paint:P=>brickwork(P,null,'#b87a5a',{bw:1.4,bh:.7})},-6.8);P2(g,box(x+4,33,x+8.8,34.2),{color:'#8a5a3c',kind:'balsa',t:2.6},-6.9);
        P2(g,box(x-9.4,6.8,x+3.4,13.4),{t:.1,mat:paperMat('#ffe8b0','tissue',{glow:'#ffcf7a',gi:1.3})},-6.3);P2(g,box(x-10.4,6,x+4.4,6.9),{color:'#e8c890',kind:'balsa',t:1.8},-6.4);
        for(let i=0;i<5;i++){const x0=x-10.6+i*3;P2(g,toCCW(sm([[x0,16.2,1],[x0+3,16.2,1],[x0+3,13.6],[x0+1.5,12.6],[x0,13.6]],4)),{color:i%2?'#f6efdc':'#e0457a',kind:'water',t:.16},-5.2+(i%2)*.04)}
        P2(g,arch(x+8.4,0,5.4,11,14),{t:.3,s:16,paint:P=>{boards(P,null,'#3f8a84',{dir:'v',h:1.3,ink:.3});P.fill(circ(x+10,5,.4,.4,10),'#e0b964',1)}},-6.3);
        plate(g,'koek','Dyrekøkkenet',FONT.dyr,19,3.2,{bg:'#3a2a58',frame:'gold',size:1.75,fg:'#ffe9a0',x,y:20.4,z:-5});Rm.glow(x-3,10,-5,'#ffcf7a',13);
        /* kasser med grønt foran huset */
        for(const[dx,c]of[[-11.6,'#f0503a'],[-8,'#ffd54a']]){P2(g,box(x+dx-1.7,0,x+dx+1.7,2.6),{t:2.4,s:14,paint:P=>boards(P,null,'#a87440',{dir:'h',h:.9,ink:.3})},-4.4);for(let k=0;k<4;k++)P2(g,circ(x+dx-1+k*.7,2.9+(k%2)*.4,.62,.62,10),{color:c,kind:'water',t:.5},-4+k*.1)}},
      ()=>{const g=Rm.scene,x=27;/* Ungestalden: en rød lade med buet tag, hjertevindue og port på klem */
        const v=toCCW([[x-13,0],[x+13,0],[x+13,17],[x+8.6,25.4],[x,29.4],[x-8.6,25.4],[x-13,17]]);P2(g,v,{t:1,s:12,paint:P=>{boards(P,null,'#c2503a',{dir:'v',h:2,ink:.3});P.pen([[x-13,17],[x+13,17]],'#fbf0d8',.5,.9)}},-7);
        for(const s of ring(v,.9,false))P2(g,s,{color:'#fbf0d8',kind:'balsa',t:1.3},-7.1);
        const port=arch(x,0,10.6,13.4,18);P2(g,port,{t:.1,mat:paperMat('#fff0c0','tissue',{glow:'#ffc870',gi:1.5})},-6.3);for(const s of ring(port,.7,false))P2(g,s,{color:'#fbf0d8',kind:'balsa',t:.5},-6.2);Rm.glow(x,7,-5,'#ffc870',14);
        for(const sx of[-1,1]){const lf=clip([port],[box(sx<0?x-6:x+1.4,-1,sx<0?x-1.4:x+6,15)],'inter');for(const q of lf)P2(g,q,{t:.4,s:16,paint:P=>{boards(P,null,'#8a3a2a',{dir:'v',h:1.3,ink:.3});P.pen([[x+sx*5,1],[x+sx*1.6,12]],'#fbf0d8',.3,.8);P.pen([[x+sx*1.6,1],[x+sx*5,12]],'#fbf0d8',.3,.8)}},-5.9)}
        P2(g,circ(x,21.4,2.7,2.7,28),{color:'#fbf0d8',kind:'water',t:.3},-6.3);P2(g,VRK.heart(x,21.2,2),{t:.12,mat:paperMat('#ffd0e0','tissue',{glow:'#ff8fb0',gi:1.2})},-6.1);
        plate(g,'stald','Ungestalden',FONT.dyr,18,3.2,{bg:'#3a2a58',frame:'gold',size:1.75,fg:'#ffe9a0',x,y:15.4,z:-4.8});
        /* halmballer ved siden af porten */
        for(const[dx,y]of[[10.2,0],[13.2,0],[11.7,3.3]]){const hb=sm([[x+dx-1.8,y,1],[x+dx+1.8,y,1],[x+dx+1.8,y+3.2],[x+dx-1.8,y+3.2]],3);P2(g,hb,{t:2.6,s:16,paint:P=>{P.wash('#f0d27a',hb,{top:'#f8e298',edge:.5});for(let k=0;k<14;k++){const yy=y+R(.2,3);P.pen([[x+dx-1.7,yy],[x+dx+1.7,yy+R(-.2,.2)]],'#b89038',.07,.6)}for(const k of[-.7,.7])P.pen([[x+dx+k,y],[x+dx+k,y+3.2]],'#8a5a2a',.14,.8)}},-4.6)}},
      ()=>{const g=Rm.scene;/* træet midt på gården, og reden med ægget foran */
        P2(g,toCCW(sm([[-1.2,0,1],[4.2,0,1],[3.2,9],[4.4,17,1],[.6,17,1],[.2,9]],5)),{t:1.4,s:12,paint:P=>{P.wash('#8a5a36',null,{top:'#a06a40',edge:.5});for(let i=0;i<9;i++)P.pen([[R(0,3),R(1,16)],[R(0,3),R(1,16)]],'#5a3820',.1,.5)}},-8.6);
        for(const[cx,cy,rx,ry,c,z]of[[1.6,27,13.5,10,'#4fa84a',-8.4],[-6,22.6,7.6,6,'#5cb656',-8.1],[9.4,23,7.4,6.2,'#48a044',-8.2],[2,31.4,8.6,6.4,'#68c260',-7.9]])P2(g,puff(cx,cy,rx,ry,11,.2),{color:c,kind:'water',t:.6},z);
        for(let i=0;i<9;i++)P2(g,circ(R(-9,13),R(20,33),.8,.8,10),{color:'#e0457a',kind:'water',t:.4},-7.6);
        const rede=toCCW(sm([[-7.4,3.6,1],[7.4,3.6,1],[6.6,.9],[5,0,1],[-5,0,1],[-6.6,.9]],5));P2(g,rede,{t:1.6,s:20,paint:P=>{P.wash('#b88a4e',rede,{top:'#d0a060',edge:.5});for(let i=0;i<40;i++){const x=R(-7,6),y=R(.2,3.4);P.pen([[x,y],[x+R(.8,1.8),y+R(-.5,.5)]],i%2?'#7a5228':'#e8c880',.12,.75)}}},1.6);
        for(let i=0;i<10;i++){const x=-7.6+i*1.7;P2(g,toCCW([[x,3.2],[x+R(.5,1.3),5+R(0,.8)],[x+1.5,3.2]]),{color:shade('#f0d890',R(-.1,.06)),kind:'water',t:.1},1.2+(i%3)*.2)}
        for(const s of STEDER){const hb=new THREE.Mesh(new THREE.PlaneGeometry(31,31),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(s.x,15,-4);g.add(hb);Rm.tap(hb,()=>{if(!gaar){W0.tx=s.x+(s.id==='koek'?8.4:0);W0.want=s}})}},
      ()=>{const lv=Rm.live;/* ægget: det vipper, når man trykker */
        aeg=new THREE.Group();aeg.position.set(0,2.4,-.4);lv.add(aeg);const e=[];for(let i=0;i<36;i++){const a=i/36*TAU,c=Math.cos(a),s=Math.sin(a);e.push([c*3.9*(1-.14*Math.max(0,s)),4.9+s*(s>0?5.4:4.9)])}
        put(aeg,piece(toCCW(e),{t:.5,s:26,paint:P=>{P.wash('#fdf3dc',e,{top:'#ffffff',edge:.7,clouds:4});for(const[x,y,r,c]of[[-1.6,6.4,1,'#ff9fd0'],[1.5,3.6,.85,'#9fe7ff'],[1.2,7.8,.7,'#ffd54a'],[-1.9,2.6,.7,'#b9a0ff'],[-.2,4.9,.55,'#ff9fd0'],[2.5,5.8,.5,'#b9a0ff']])P.wash(c,circ(x,y,r,r,14),{alpha:.85,edge:.5,mode:'source-over'})}}),0,0,0);
        const hb=new THREE.Mesh(new THREE.PlaneGeometry(13,14),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(0,5,2);aeg.add(hb);Rm.tap(hb,()=>{W0.tx=-9;W0.want={aeg:1}});
        /* revner efter, hvor varmt ægget er */
        {const v=varme(),REV=[[[-2.8,6.2],[-1.6,5.4],[-.8,6.3],[.2,5.2]],[[.6,7.6],[1.4,6.7],[2.4,7.4],[3.2,6.4]],[[-3.4,4.3],[-2.2,3.6],[-1,4.5],[.4,3.5],[1.6,4.4],[3,3.7]]];
          REV.forEach((pts,i)=>{if(v>=KLAR*(i+1)/REV.length)for(const q of thick([pts],.16))put(aeg,piece(q,{color:'#6a4a3a',kind:'water',t:.02}),0,0,.52)});
          if(v>=KLAR&&!ejerNaeb())aegGlow=Rm.glow(0,7.5,-2,'rgba(255,224,140,.9)',20,true)}
        /* er næbdyret klækket, ligger æggeskallen i reden, og næbdyret går rundt på gården */
        const skaller=()=>{const nedre=clip([e],[toCCW([[-5,-1],[5,-1],[4.4,5.6],[3,4.6],[1.6,5.8],[0,4.6],[-1.6,5.8],[-3,4.6],[-4.4,5.6]])],'inter'),oevre=clip([e],[toCCW([[-5,11],[-4.4,5.6],[-3,4.6],[-1.6,5.8],[0,4.6],[1.6,5.8],[3,4.6],[4.4,5.6],[5,11]])],'inter');
          const mal=P=>{P.wash('#fdf3dc',null,{top:'#ffffff',edge:.7,clouds:4})};bund_=new THREE.Group();top_=new THREE.Group();bund_.position.set(0,2.4,-.4);top_.position.set(0,2.4,-.4);lv.add(bund_,top_);
          for(const f of nedre)put(bund_,piece(f,{t:.5,s:26,paint:mal}),0,0,0);for(const f of oevre)put(top_,piece(f,{t:.5,s:26,paint:mal}),0,0,0)};
        const nytNaeb=(x,z)=>{const K=makePet({kind:'næbdyr',res:.8,pynt:'ingen'});K.G.scale.setScalar(.62);K.G.position.set(x,.5,z);lv.add(K.G);const d={K,x,z,v:2.4,hop:0,pause:R(1,3),i:9};DYR_.push(d);naeb=d;
          const hb3=new THREE.Mesh(new THREE.PlaneGeometry(16,14),new THREE.MeshBasicMaterial({visible:false}));hb3.position.set(1,7,1);K.G.add(hb3);Rm.tap(hb3,()=>{d.hop=1;d.pause=1.4;LYD.fil('dyr.tryk',()=>LYD.pip());hjerte(d.x,8)});return d};
        Rm.aeg={skaller,nytNaeb};if(ejerNaeb()){aeg.visible=false;skaller();top_.position.set(6.4,.9,1.2);top_.rotation.z=2.6;nytNaeb(14,4)}
        /* dyrene på gården */
        [{kind:'kanin',x:-52,z:-2.6,v:5},{kind:'ræv',x:44,z:-1.2,v:-4,pynt:'tørklæde'},{kind:'bjørn',x:-8,z:3.4,v:3.2,pynt:'sløjfe'},{kind:'frø',x:16,z:11,v:-2.6,pynt:'krone'},{kind:'ugle',x:-40,z:9,v:2.2,pynt:'ingen'}].forEach((o,i)=>{const K=makePet(Object.assign({res:.8},o));K.G.scale.setScalar(.62);K.G.position.set(o.x,.5,o.z);lv.add(K.G);const d={K,x:o.x,z:o.z,v:o.v,hop:0,pause:R(1,4),i};DYR_.push(d);
          const hb2=new THREE.Mesh(new THREE.PlaneGeometry(16,18),new THREE.MeshBasicMaterial({visible:false}));hb2.position.set(1,8,1);K.G.add(hb2);Rm.tap(hb2,()=>{d.hop=1;d.pause=1.4;LYD.fil('dyr.tryk',()=>LYD.pip());hjerte(d.x,8)})});
        {const c=cv(96,96),q=c.getContext('2d');q.translate(48,48);q.fillStyle='#ff5a8a';q.strokeStyle='#a01848';q.lineWidth=4;q.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,x=34*16*Math.pow(Math.sin(a),3)/17,y=-34*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/17-4;i?q.lineTo(x,y):q.moveTo(x,y)}q.closePath();q.fill();q.stroke();const m=tx(c,true);
          for(let i=0;i<8;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:m,transparent:true,depthWrite:false}));s.visible=false;lv.add(s);hj.push({s,t:9,x:0,y:0})}}
        for(let i=0;i<4;i++){const s=glowSprite('rgba(255,255,255,.55)',4);s.material.blending=THREE.NormalBlending;lv.add(s);roeg.push({s,t:i/4})}
        heks=makeFigure(Object.assign({},ctx.look));heks.G.scale.setScalar(.8);heks.G.position.set(0,.35,6);lv.add(heks.G);W0.sh=Rm.blob(0,6,13,5,.4);W0.x=W0.tx=-12;
        kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.5);kat.G.position.set(-20,.35,8);lv.add(kat.G);
        ctx.say('Velkommen i Dyreparken! Tryk på Dyrekøkkenet eller Ungestalden.')}],
    tick:(t,dt)=>{const d=W0.tx-W0.x,mv=Math.abs(d)>.3&&!gaar;if(mv){const st=Math.sign(d)*Math.min(Math.abs(d),24*dt);W0.x+=st;W0.face=Math.sign(d);W0.ph+=Math.abs(st)/3.4*Math.PI}
      W0.amp+=((mv?1:0)-W0.amp)*Math.min(1,dt*8);heks.G.position.x=W0.x;heks.G.scale.x=.8*W0.face;heks.G.position.y=.35+Math.abs(Math.sin(W0.ph))*.5*W0.amp;heks.tick(t,{ph:W0.ph,amp:W0.amp});W0.sh.position.x=W0.x;
      const kx=W0.x-W0.face*8,kd=kx-kat.G.position.x,km=Math.abs(kd)>.6;if(km&&(!kat.hopper||kat.luft))kat.G.position.x+=Math.sign(kd)*Math.min(Math.abs(kd),26*(kat.hopper?1.7:1)*dt);kat.G.scale.x=.5*(km?Math.sign(kd):W0.face);kat.tick(t,{ph:t*13,amp:km?1:0});
      if(W0.want&&!mv&&!gaar){const s=W0.want;W0.want=null;if(s.aeg){const v=varme();if(ejerNaeb())ctx.say('Æggeskallen, som næbdyret klækkede af. Næbdyret bor nu på gården, og du kan vælge det som kæledyr i Garderoben.');else if(v>=KLAR){if(!klaek){klaek={t:0};LYD.op()}}else{vip=1;LYD.pip();ctx.vent(`Ægget ruger. Det bliver varmt af glade dyreunger: giv ungerne i Ungestalden hjerter. Lige nu har de ${v} af ${KLAR} hjerter.`)}}else if(ROOMS[s.rum]){gaar=s;ctx.go(s.rum)}}
      vip=Math.max(0,vip-dt*.8);if(aegGlow&&!klaek&&(t%3.2)<.05)vip=Math.max(vip,.6);aeg.rotation.z=Math.sin(t*1.1)*.02+Math.sin(vip*Math.PI*5)*.16*vip;aeg.position.y=2.4+Math.abs(Math.sin(vip*Math.PI*5))*.5*vip;
      /* klækningen: ægget ryster mere og mere, toppen springer af, og næbdyret kommer frem */
      if(klaek){klaek.t+=dt;const k=klaek.t;if(k<1.8){aeg.rotation.z=Math.sin(k*40)*.05*(1+k*2);aeg.position.y=2.4+Math.abs(Math.sin(k*20))*.25*k}
        else if(!klaek.aaben){klaek.aaben=true;aeg.visible=false;Rm.aeg.skaller();Rm.burst(0,9,1,18,'rgba(255,236,170,.95)',6);LYD.pop();if(aegGlow){aegGlow.s.visible=false}
          const d=Rm.aeg.nytNaeb(-3.6,1.5);d.pause=4;d.K.G.scale.setScalar(.01);klaek.d=d;SPIL.har.push('dyr:næbdyr');SPIL.save();LOG.row('naebdyr',{varme:varme()})}
        else{const u=Math.min(1,(k-1.8)/.9);top_.position.set(6.4*u,2.4+9*Math.sin(u*Math.PI)*(1-u*.5)-1.5*u,-.4+1.6*u);top_.rotation.z=2.6*u;const s=.62*Math.min(1,(k-1.8)/.4);klaek.d.K.G.scale.set(s,s,s);if(k>2.2&&!klaek.hj){klaek.hj=true;klaek.d.hop=1;for(let i=0;i<4;i++)setTimeout(()=>hjerte(R(-6,4),9+R(0,3)),i*180);LYD.fanfare()}
          if(k>3.4&&!klaek.slut){klaek.slut=true;ctx.vent('Et næbdyr! Det er klækket af ægget, og det vil gerne bo hos dig. Du kan vælge næbdyret som kæledyr i Garderoben under Dyr.')}}}
      if(frys!==null){DYR_.forEach((a,i)=>{a.K.G.position.set(-36+i*18,.5,12);a.K.G.scale.set(.62,.62,.62);a.K.tick(0,{ph:frys*TAU*(a.K.cyk||1),amp:1})})}else
      for(const a of DYR_){const K_=a.K;let gaa;
        if(K_.hopper){/* et par hop, og så en pause, hvor dyret sidder */
          if(a.pause>0){a.pause-=dt;gaa=false;if(a.pause<=0){a.ph=0;a.n=K_.kind==='frø'?1+Math.floor(R(2)):2+Math.floor(R(3))}}else{gaa=true;a.ph=(a.ph||0)+dt*11;if(K_.luft)a.x+=a.v*2.4*dt;if(a.ph>=TAU*K_.cyk*a.n)a.pause=R(1.2,3.2)}}
        else{a.pause-=dt;gaa=a.pause<0;a.ph=t*11+a.i;if(gaa){a.x+=a.v*dt;if(a.pause<-R(3,6))a.pause=R(1.5,4)}}
        if(a.x>60||a.x<-60){a.v=-a.v;a.x=clamp(a.x,-60,60)}a.hop=Math.max(0,a.hop-dt*1.6);K_.G.position.set(a.x+(a.v<0?7.4:0),.5+Math.abs(Math.sin(a.hop*Math.PI*2))*3*a.hop,a.z);K_.G.scale.x=.62*Math.sign(a.v);K_.tick(t+a.i,{ph:a.ph,amp:gaa?1:0})}
      for(const q of hj){q.t+=dt*.9;if(q.t>1){q.s.visible=false;continue}q.s.visible=true;q.s.position.set(q.x+Math.sin(q.t*8)*.5,q.y+q.t*8,13);const z=2+q.t*1.6;q.s.scale.set(z,z,1);q.s.material.opacity=1-q.t*q.t}
      for(const q of roeg){q.t=(q.t+dt*.16)%1;q.s.position.set(-20.6+Math.sin(q.t*5+t*.3)*1.2+q.t*3,34.6+q.t*11,-6.6);const z=3+q.t*5;q.s.scale.set(z,z,1);q.s.material.opacity=.55*(1-q.t)}}});
  ctx.test={hop:u=>{frys=u},varme,klaek:()=>klaek,trykAeg:()=>{W0.x=W0.tx=-9;W0.want={aeg:1}}}};
