/* ============ Værelset på Kollegiet: heksens eget rum. Tryk på en ting, så kommer der en menu med alt det, den kan laves om til;
   skabet fører ind i Garderoben. Selve tingene ligger i rum-vaer-1..3.js, og listen over dem i spil0.js ============ */
ROOMS.vaerelse=function(ctx){
  const RV=SPIL.RUMVALG,SL=Object.keys(RV),V=SPIL.rum,C=SPIL.rumc,G={},GL={},HX=-3,HZ=4,bamser=[];let heks,kat,pop=0,hop=0,aaben=false,cur='vaeg';
  const T={Rm:null,glow:null};
  const fast=g=>{/* gulvet og skabet står fast */
    for(let i=0;i<112;i++)Rm.floor(box(-72,-10+i*1.05,72,-9+i*1.05),{color:shade('#7a4e2e',R(-.06,.06)),kind:'balsa',t:.3},0,g);
    {const cx=34,Hs=34,sk=new THREE.Group();g.add(sk);G.skab=sk;VRK.P2(sk,box(cx-7.4,0,cx+7.4,Hs),{t:6,s:14,paint:P=>{P.wash('#6a4426',null,{edge:0,top:'#86593a'})}},-9.6);
      for(const s of[-1,1]){const d=box(cx+s*3.6-3.3,1.4,cx+s*3.6+3.3,Hs-1.4);VRK.P2(sk,d,{t:.5,s:16,paint:P=>{P.wash('#7a5230',null,{edge:0,top:'#96693c'});P.score([...box(cx+s*3.6-2.5,2.6,cx+s*3.6+2.5,15),[cx+s*3.6-2.5,2.6]],{w:.14,ink:.4,dark:'#2a1408'});P.score([...box(cx+s*3.6-2.5,17.6,cx+s*3.6+2.5,Hs-2.8),[cx+s*3.6-2.5,17.6]],{w:.14,ink:.4,dark:'#2a1408'});P.fill(starPts(cx+s*3.6,25,1.5,.62),'#c9a04a',.85)}},-3.4);VRK.P2(sk,circ(cx+s*.9,16.4,.5,.5,16),{mat:gold(),t:.5},-2.8)}
      VRK.P2(sk,box(cx-.22,1.4,cx+.22,Hs-1.4),{t:.1,mat:paperMat('#fff0c0','tissue',{glow:'#ffd27a',gi:1.6})},-3.5);Rm.glow(cx,17,-2,'#ffd27a',9);
      VRK.P2(sk,box(cx-8.2,Hs-.4,cx+8.2,Hs+.9),{color:'#5c3c28',kind:'balsa',t:6.6},-9.8);VRK.P2(sk,toCCW([[cx-6.4,Hs+.9],[cx+6.4,Hs+.9],[cx,Hs+4.6]]),{color:'#6a4426',kind:'balsa',t:1},-4.4);VRK.P2(sk,starPts(cx,Hs+2.5,1,.42),{mat:gold(),t:.3},-3.3);
      /* en kjole der stikker ud på en bøjle på siden */
      const kx=cx-9.2,kj=toCCW(sm([[kx-1.3,26],[kx+1.3,26],[kx+1.5,23.6],[kx+1,20.6],[kx+2.6,12.4],[kx,11.8],[kx-2.6,12.4],[kx-1,20.6],[kx-1.5,23.6]],5));VRK.P2(sk,kj,{t:.2,s:26,paint:P=>{P.wash('#6a3fa2',kj,{top:'#8a5fc8',edge:.6});for(let i=0;i<9;i++)P.fill(starPts(kx+R(-1.6,1.6),R(13,20),.3,.13,R(1)),'#f2c230',.9)}},-8.6);for(const s of thick([[[kx-1.2,26.2],[kx,27.2],[kx+1.2,26.2]],[[kx,27.2],[kx,28]]],.1))VRK.P2(sk,s,{mat:gold(),t:.08},-8.5);VRK.P2(sk,circ(kx,28.3,.4,.4,10),{color:'#2e2833',t:.3},-9)}};
  const rebuild=slot=>{emptyGroup(G[slot]);for(const q of GL[slot]||[]){Rm.live.remove(q.s);q.s.material.map.dispose();q.s.material.dispose()}Rm.glows=Rm.glows.filter(q=>!(GL[slot]||[]).includes(q));GL[slot]=[];
    T.glow=(...a)=>{const q=Rm.glow(...a);GL[slot].push(q);return q};VAER[slot](G[slot],V[slot],C[slot],T)};
  const POS={vaeg:[0,40,-8],vindue:[-27,34,-6],seng:[-29,12,2],hylde:[13.5,30,-5],lampe:[11,39,-3],gulv:[0,2,6],ting:[21,10,8],dyreseng:[10,4,13]};
  /* kameraet står altid samme sted. Når menuen er fremme, bliver udsnittet større og skubbet til side (bredt) eller op (højt), så hele rummet stadig kan ses ved siden af */
  const CD=150,fit=(c,w,h)=>{const asp=w/h,wide=asp>1.25,pf=aaben&&wide?(Math.min(.3*w,340)+24)/w:0,pb=aaben&&!wide?.4:0,HH=Math.max(50/(1-pb),84/(1-pf)/asp);c.fov=2*Math.atan(HH/2/CD)*180/Math.PI;
    c.position.set(0,21+CD*Math.sin(.1),CD*Math.cos(.1));c.lookAt(0,20,0);if(pf||pb)c.setViewOffset(w,h,pf*w/2,pb*h/2,w,h)};
  /* menuen */
  const panel=document.getElementById('panel'),tabs=document.getElementById('tabs'),opts=document.getElementById('opts'),secs={};
  const draw=()=>{for(const s of SL){secs[s].querySelectorAll('.grid button').forEach((b,i)=>{const v=RV[s].list[i][0];b.setAttribute('aria-pressed',String(V[s]===v));b.classList.toggle('laas',!ctx.owns('rum.'+s,v))});secs[s].querySelectorAll('.sw button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===C[s])))}};
  const show=()=>{for(const s of SL)secs[s].classList.toggle('on',s===cur);tabs.querySelectorAll('button[role=tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.s===cur)))};
  const aabn=slot=>{cur=slot;show();draw();if(!aaben){aaben=true;panel.hidden=false;Rm.rebake()}},luk=()=>{if(!aaben)return;aaben=false;panel.hidden=true;Rm.rebake()};
  const vaelg=(slot,v)=>{if(!ctx.owns('rum.'+slot,v)){LYD.doer();ctx.say('Den kan du få i en boble i Boblebutikken');return}if(V[slot]===v)return;LYD.valg();V[slot]=v;SPIL.save();rebuild(slot);Rm.rebake();Rm.burst(...POS[slot]);draw()};
  const farv=(slot,c)=>{if(C[slot]===c)return;LYD.valg();C[slot]=c;SPIL.save();rebuild(slot);Rm.rebake();Rm.burst(...POS[slot]);draw()};
  {const fb=document.createElement('button');fb.type='button';fb.className='hvem';fb.textContent='Færdig';fb.addEventListener('click',()=>{LYD.tryk();luk()});tabs.appendChild(fb);
    for(const s of SL){const b=document.createElement('button');b.type='button';b.textContent=RV[s].navn;b.dataset.s=s;b.setAttribute('role','tab');b.addEventListener('click',()=>{LYD.tryk();cur=s;show()});tabs.appendChild(b);
      const sec=document.createElement('section'),gr=document.createElement('div');gr.className='grid';sec.appendChild(gr);opts.appendChild(sec);secs[s]=sec;
      for(const[v,navn]of RV[s].list){const ob=document.createElement('button');ob.type='button';ob.textContent=navn;ob.addEventListener('click',()=>vaelg(s,v));gr.appendChild(ob)}
      const lb=document.createElement('h4');lb.textContent='Farve';sec.appendChild(lb);const row=document.createElement('div');row.className='sw';row.setAttribute('role','group');row.setAttribute('aria-label','Farve');sec.appendChild(row);
      for(const c of RV[s].pal){const sb=document.createElement('button');sb.type='button';sb.style.background=c;sb.dataset.c=c;sb.setAttribute('aria-label','Farve '+c);sb.addEventListener('click',()=>farv(s,c));row.appendChild(sb)}}}
  ctx.test=(slot,v,c)=>{if(slot==='luk')return luk();if(slot==='aabn')return aabn(v);if(v)V[slot]=v;if(c)C[slot]=c;rebuild(slot);Rm.rebake()};
  const Rm=makeRoom(ctx,{fit,key:{tgt:[-2,16,0]},
    build:Rm=>[()=>{T.Rm=Rm;G.fast=new THREE.Group();Rm.scene.add(G.fast)},...SL.map(s=>()=>{G[s]=new THREE.Group();Rm.scene.add(G[s]);rebuild(s);Rm.tap(G[s],()=>{LYD.tryk();aabn(s)})}),()=>fast(G.fast),
      ()=>{Rm.tap(G.skab,()=>ctx.go('garderobe'));
        heks=makeFigure(Object.assign({},ctx.look));heks.G.position.set(HX,.35,HZ);Rm.live.add(heks.G);Rm.blob(HX,HZ,15,6);Rm.tap(heks.G,()=>{LYD.tryk();pop=1;Rm.burst(HX,22,8,8)});
        kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.6);kat.G.position.set(9.6,1.1,11.4);Rm.live.add(kat.G);Rm.tap(kat.G,()=>{LYD.op();hop=1});
        /* bamserne fra Gribemaskinen sidder på sengen: én af hver slags, man har vundet. Er der flere, end sengen kan bære, sidder resten på gulvet foran */
        [...new Set(SPIL.data.bamser||[])].forEach((k,i)=>{const s=i<7?.95:1.05,q=bamseStykke(ctx,k,s);let x,y,z;if(i<4){x=-24.4+i*2.7;y=12.1;z=-4.7}else if(i<7){x=-23+(i-4)*2.7;y=13.2;z=-4.95}else{x=-40.5+(i-7)*2.5;y=.3;z=3+((i-7)%2)*.9}
          y+=1.7*s;q.position.set(x,y,z);q.rotation.z=((i*37)%11-5)*.02;Rm.live.add(q);const hb=new THREE.Mesh(new THREE.PlaneGeometry(2.2*s,3.4*s),new THREE.MeshBasicMaterial({visible:false}));hb.position.set(0,.2,.05);q.add(hb);const b={q,y,hop:0};bamser.push(b);Rm.tap(hb,()=>{LYD.pip();b.hop=1})});
        ctx.say('Tryk på en ting for at lave den om · skabet fører ind i Garderoben')}],
    tick:t=>{pop=Math.max(0,pop-.035);hop=Math.max(0,hop-.04);const k=1+.06*Math.sin(pop*Math.PI)*pop;heks.G.scale.set(k,2-k,1);heks.G.position.y=.35+Math.sin(pop*Math.PI)*.9*pop;heks.tick(t,{ph:0,amp:0});
      kat.G.position.y=1.1+Math.sin(hop*Math.PI)*2.2*hop;kat.tick(t,{ph:hop?t*14:0,amp:hop?1:0});for(const b of bamser)if(b.hop>0){b.hop=Math.max(0,b.hop-.05);b.q.position.y=b.y+Math.abs(Math.sin(b.hop*Math.PI*2))*1.2*b.hop}}});
  ctx.efter.push(()=>{for(const b of bamser)b.q.userData.ryd();bamseRyd()})};
