/* ============ Værelset på Kollegiet: heksens eget rum. Tryk på en ting, så skifter den; skabet fører ind i Garderoben ============ */
ROOMS.vaerelse=function(ctx){
  const V=Object.assign({tapet:0,gardin:0,seng:0,lampe:0,taeppe:0,ting:0},SPIL.rum),G={},HX=-3,HZ=4;let heks,kat,pop=0,hop=0,lampGlow=null;
  const P2=(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),dk=(c,k=-.3)=>hexOf(shade(c,k));
  const B={
    tapet(g,v){const c=[['#3a2a58','#2a1e44'],['#2c5560','#1f3f48'],['#5a2f52','#3f1f3c']][v],W=box(-72,-2,72,62);
      P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{P.wash(c[0],W,{top:c[1],edge:0,clouds:14});
        if(v===0)for(let y=14;y<62;y+=5)for(let x=-72+((y/5)%2?2.5:0);x<72;x+=5)P.fill(starPts(x,y,.55,.22,.3),'#c9a04a',.5);
        if(v===1){for(let x=-72;x<72;x+=6)P.fill(box(x,11,x+2.6,62),'#6fb0a8',.22);for(let y=15;y<62;y+=6)for(let x=-69.7;x<72;x+=6)P.fill(circ(x+1,y,.28,.28,8),'#e8d9a0',.6)}
        if(v===2)for(let y=15;y<62;y+=7)for(let x=-72+((y/7)%2?3.5:0);x<72;x+=7){P.fill(circ(x,y,1,1,16),'#e8c86a',.6);P.fill(circ(x+.5,y+.25,.86,.86,16),c[0],1)}
        P.wash('#4a2e1c',box(-73,-3,73,11),{alpha:.97,edge:0,mode:'source-over',clouds:6});for(let x=-72;x<72;x+=7)P.score([...box(x+.6,1,x+6.4,9.4),[x+.6,1]],{w:.12,ink:.4,dark:'#1a0c06'})}},-10);
      P2(g,box(-72,10.4,72,11.6),{color:'#6a4426',kind:'balsa',t:.6},-9.6)},
    gardin(g,v){const c=[['#8a3a6a','#a84a80','#4a1a3a'],['#3f7f78','#5aa096','#1f4a44'],['#c9a04a','#e8c670','#7a5a1a']][v],wx=-27,wy=25,sh=arch(wx,wy,11,16,24);
      P2(g,grow(sh,1.1,false)[0].outer,{color:'#6a4426',kind:'balsa',t:.6},-9.5);
      P2(g,sh,{t:.1,s:24,base:'water',paint:P=>{P.wash('#1a2456',sh,{top:'#101638',edge:0,clouds:8});for(let i=0;i<40;i++)P.fill(circ(R(wx-5,wx+5),R(wy+1,wy+15),R(.06,.14),R(.06,.14),6),'#f6e7c0',R(.5,.95));P.wash('#3a3a6a',box(wx-6,wy-1,wx+6,wy+3.4),{alpha:.7,edge:0,mode:'source-over'})}},-9.1);
      P2(g,circ(wx+2.2,wy+11,1.9,1.9,32),{t:.04,mat:paperMat('#fff6d8','tissue',{glow:'#ffe9a0',gi:1.3})},-8.95);
      for(const s of clip([box(wx-.25,wy,wx+.25,wy+17),box(wx-6,wy+7.8,wx+6,wy+8.3)],[sh],'inter'))P2(g,s,{color:'#6a4426',kind:'balsa',t:.3},-8.8);
      P2(g,box(wx-7.4,wy-1.4,wx+7.4,wy-.3),{color:'#7a5230',kind:'balsa',t:1.6},-8.8);
      for(const s of[-1,1]){const cu=toCCW([[wx+s*8.8,wy+17.3],[wx+s*4.6,wy+17.3],[wx+s*5.8,wy+11.4],[wx+s*7.4,wy+6.4],[wx+s*6.2,wy-.8],[wx+s*9.4,wy-1.6]]);
        P2(g,cu,{t:.15,s:20,paint:P=>{P.wash(c[0],cu,{top:c[1],edge:.6,clouds:5});for(let k=0;k<3;k++)P.score([[wx+s*(5.4+k),wy+17],[wx+s*(6.8+k*.6),wy]],{w:.09,ink:.35,dark:c[2]});if(v===2)for(let i=0;i<7;i++)P.fill(starPts(wx+s*R(5.6,8.4),R(wy+1,wy+16),.36,.15,R(1)),'#fff6d0',.8)}},-8.4);
        P2(g,box(wx+s*7.2-.9,wy+6,wx+s*7.2+.9,wy+6.6),{mat:gold(),t:.2},-8.2)}
      P2(g,box(wx-10,wy+17,wx+10,wy+17.9),{mat:gold(),t:.5},-8.3)},
    seng(g,v){const x0=-41,x1=-12,wood=['#86593a','#4a2e1c','#efe6d6'][v],wl=hexOf(shade(wood,.18)),wd=dk(wood,-.35),q=['#6a3fa2','#2f7f86','#243070'][v],ql=hexOf(shade(q,.25)),qd=dk(q);
      /* hovedgærde og fodende vender mod os, sengen går på langs imellem dem */
      const hb=toCCW(sm([[x0,0,1],[x0+8.4,0,1],[x0+8.4,16.4],[x0+7,20.2],[x0+4.2,21.8],[x0+1.4,20.2],[x0,16.4]],6));
      P2(g,hb,{t:1,s:22,paint:P=>{P.wash(wood,hb,{top:wl,edge:.6,clouds:4});P.score(sm([[x0+1.2,6],[x0+7.2,6],[x0+7.2,16],[x0+4.2,19.8],[x0+1.2,16],[x0+1.2,6]],5),{w:.14,ink:.4,dark:wd});if(v===2)P.fill(circ(x0+4.2,14,1.7,1.7,20),'#c9a04a',.9),P.fill(circ(x0+4.9,14.4,1.4,1.4,20),wood,1);else P.fill(starPts(x0+4.2,14,1.7,.72),'#c9a04a',.9)}},-7.4);
      for(const x of[x0+8.6,x1-7.4])P2(g,box(x,0,x+1.2,6.4),{color:wd,kind:'balsa',t:1},-6.8);
      P2(g,box(x0+7,5.6,x1-4,7.4),{color:wood,kind:'balsa',t:1.4},-6.9);
      const ma=box(x0+7.4,7.2,x1-4.4,10.8);P2(g,ma,{t:1.2,s:20,paint:P=>{P.wash('#f3ecdc',ma,{edge:.5});for(let x=x0+8;x<x1-5;x+=1.6)P.pen([[x,7.3],[x,10.7]],'#d8c8e8',.1,.5)}},-6.5);
      const pil=circ(x0+13.4,12.5,4.4,2,28);P2(g,pil,{t:.8,s:30,paint:P=>{P.wash('#fbf6ec',pil,{edge:.6,clouds:4});P.wash('#cdbfe8',box(x0+9,10.4,x0+18,11.6),{alpha:.6,edge:0})}},-5.6);
      const qs=[];for(let i=0;i<=7;i++)qs.push([x0+16+(x1-3-x0-16)*i/7,12+(i%2?.55:0)]);qs.push([x1-2.6,10]);for(let i=0;i<=9;i++)qs.push([x1-2.6-(x1-2.6-x0-15.6)*i/9,2.8+(i%2?1:0)]);qs.push([x0+15.6,10]);
      const qt=toCCW(sm(qs,4));P2(g,qt,{t:.4,s:22,paint:P=>{P.wash(q,qt,{top:ql,edge:.6,clouds:6});
        if(v===2)for(let i=0;i<26;i++)P.fill(starPts(R(x0+17,x1-4),R(4.4,11.4),R(.35,.65),.2,R(1)),'#f2c230',.9);
        else for(let i=0;i<4;i++)for(let j=0;j<2;j++){const px=x0+17+i*3.4,py=4.4+j*3.5;P.fill(box(px,py,px+3,py+3.1),(i+j)%2?ql:qd,.55);P.pen([[px,py],[px+3,py],[px+3,py+3.1],[px,py+3.1],[px,py]],'#f6e7c0',.06,.6)}}},-5.2);
      const fb=toCCW(sm([[x1-6.4,0,1],[x1,0,1],[x1,10.4],[x1-1.2,13],[x1-3.2,14.2],[x1-5.2,13],[x1-6.4,10.4]],6));
      P2(g,fb,{t:1,s:22,paint:P=>{P.wash(wood,fb,{top:wl,edge:.6,clouds:4});P.score(sm([[x1-5.4,4],[x1-1,4],[x1-1,10.2],[x1-3.2,12.6],[x1-5.4,10.2],[x1-5.4,4]],5),{w:.14,ink:.4,dark:wd})}},-4.6);
      if(v===1){for(const x of[x0+.4,x1-1.6])P2(g,box(x,0,x+1.2,36),{color:wood,kind:'balsa',t:1},-4.2);
        const va=[[x0-.4,36.4],[x1+.4,36.4]];for(let i=0;i<=12;i++)va.push([x1+.4-(x1-x0+.8)*i/12,i%2?30.6:32.8]);const vs=toCCW(sm(va,4));P2(g,vs,{t:.3,s:22,paint:P=>{P.wash('#2f7f86',vs,{top:'#49a0a6',edge:.6,clouds:5});for(let i=0;i<13;i++)P.fill(starPts(x0+1.4+i*2.5,34.4,.45,.19),'#f2c230',.9)}},-3.8);
        for(const x of[x0+1,x1-1])P2(g,circ(x,37.4,1,1,16),{mat:gold(),t:1},-4.2)}
      if(v===2){const sp=starPts(x0+19,13.2,2.4,1.05,.2);P2(g,sp,{color:'#f2c230',kind:'water',t:.8},-5)}},
    lampe(g,v){const x=11,col=['#ffd870','#cfe0ff','#ffb070'][v];for(const s of thick([[[x,62],[x,42]]],.12))P2(g,s,{color:'#2e2833',t:.1},-6);
      if(v===0)P2(g,starPts(x,38.6,3.8,1.7),{t:.5,mat:paperMat('#fff0b0','tissue',{glow:col,gi:1.5})},-6.2);
      if(v===1)for(const s of clip([circ(x,39,3.5,3.5,36)],[circ(x+1.7,39.9,3,3,32)],'diff'))P2(g,s,{t:.5,mat:paperMat('#f2f6ff','tissue',{glow:col,gi:1.5})},-6.2);
      if(v===2){const l=circ(x,38.4,3.3,3.8,32);P2(g,l,{t:.5,mat:paperMat('#ffd0a0','tissue',{glow:col,gi:1.3})},-6.2);for(const dx of[-2,-1,0,1,2])for(const s of thick([curve([[x+dx*.2,42],[x+dx*1.4,38.4],[x+dx*.2,34.8]],8)],.07))P2(g,s,{color:'#a8552a',t:.05},-5.8);for(const y of[42.1,34.6])P2(g,box(x-1.1,y-.35,x+1.1,y+.35),{mat:gold(),t:.7},-6.3)}
      const L=new THREE.PointLight(col,90,70,2);put(g,L,x,37,4);if(lampGlow){live.remove(lampGlow.s);Rm.glows=Rm.glows.filter(q=>q!==lampGlow)}lampGlow=Rm.glow(x,38.6,-5,col,13)},
    taeppe(g,v){const z=3.5;
      if(v===0){Rm.floor(circ(0,z,16,7,56),{color:'#5a2a6a',kind:'water',t:.12},.2,g);Rm.floor(ring(circ(0,z,14.2,6.2,56),.5)[0].outer?circ(0,z,14.2,6.2,56):circ(0,z,14.2,6.2,56),{mat:gold(),t:.03},.27,g);Rm.floor(circ(0,z,13.6,5.9,56),{color:'#6a3478',kind:'water',t:.04},.3,g);Rm.floor(circ(0,z,8.6,3.8,48),{color:'#7a3f92',kind:'water',t:.04},.33,g);for(let k=0;k<10;k++){const a=k/10*TAU;Rm.floor(starPts(Math.cos(a)*11.2,z+Math.sin(a)*4.9,.7,.3),{mat:gold(),t:.03},.36,g)}}
      if(v===1){const cs=['#e86a8a','#f2a65a','#f2d45a','#7fc98a','#6ab0e0','#9a7fd0'];cs.forEach((c,i)=>{const k=1-i/6.6;Rm.floor(circ(0,z,17*k,7.4*k,56),{color:c,kind:'water',t:.06},.2+i*.035,g)})}
      if(v===2){Rm.floor(starPts(0,0,18,8.6).map(([x,y])=>[x,z+y*.46]),{color:'#2f7f86',kind:'water',t:.12},.2,g);Rm.floor(starPts(0,0,13.6,6.4).map(([x,y])=>[x,z+y*.46]),{color:'#49a0a6',kind:'water',t:.05},.28,g);Rm.floor(circ(0,z,3.4,1.5,32),{mat:gold(),t:.04},.33,g)}},
    ting(g,v){const x=21,z=6;
      if(v===0){Rm.floor(circ(x,z,3.6,1.5,28),{color:'#5c3c28',kind:'balsa',t:.6},.3,g);for(const s of thick([[[x,.6],[x,6]]],.5))P2(g,s,{color:'#6a4426',kind:'balsa',t:.5},z-.2);
        for(const s of ring(circ(x,11.2,5.3,5.3,40),.36,false))P2(g,s.outer?s:s,{mat:gold(),t:.3},z-.3);
        const gl=circ(x,11.2,4.6,4.6,40);P2(g,gl,{t:.4,s:40,paint:P=>{P.wash('#3f8fb0',gl,{top:'#7fc6dc',edge:.7,clouds:8});for(const[cx,cy,rx,ry]of[[x-1.6,12.6,2,1.5],[x+1.9,10.2,1.6,2.2],[x-1,8.6,1.4,.9],[x+2.2,13.6,1,.7]])P.wash('#6aa85a',circ(cx,cy,rx,ry,14),{alpha:.95,edge:.5,mode:'source-over',clouds:3});for(let k=-1;k<=1;k++)P.pen(curve([[x-4.5,11.2+k*2.2],[x,11.2+k*2.2-.5],[x+4.5,11.2+k*2.2]],8),'#e8f6ff',.05,.35)}},z);
        P2(g,sm([[x-6.4,10.6],[x+6.4,10.6],[x+6.2,11.6],[x-6.2,11.6]],3),{color:'#86593a',kind:'balsa',t:.4},z+.5)}
      if(v===1){for(const[dx,dz]of[[-3.2,0],[3.2,0],[0,-1.5]])for(const s of thick([[[x+dx,.3],[x,9.6]]],.36))P2(g,s,{color:'#6a4426',kind:'balsa',t:.4},z+dz*.3);
        const tb=toCCW([[x-5.6,8.2],[x-4.6,6.6],[x+5.4,12.8],[x+4.4,14.6]]);P2(g,tb,{t:1.6,s:36,paint:P=>{P.wash('#243070',tb,{top:'#3a4a98',edge:.6});for(const k of[.12,.5,.9])P.fill(toCCW([[x-5.6+10*k-.3,8.2+6.4*k],[x-4.6+10*k-.3,6.6+6.2*k],[x-4.6+10*k+.5,6.6+6.2*k+.5],[x-5.6+10*k+.5,8.2+6.4*k+.5]]),'#d9a83a',1);for(let i=0;i<6;i++)P.fill(starPts(x+R(-3.6,3.4),R(8.6,12.6),.26,.11,R(1)),'#f2c230',.9)}},z);
        P2(g,circ(x+5.2,14,1.5,1.7,20),{t:.3,mat:paperMat('#dff2ff','tissue',{glow:'#9fd8ff',gi:.9})},z+.9);P2(g,circ(x,9.6,.8,.8,14),{mat:gold(),t:.6},z+.9)}
      if(v===2){const pot=toCCW(sm([[x-3.4,5.6,1],[x+3.4,5.6,1],[x+2.6,.2],[x-2.6,.2]],4));P2(g,pot,{t:2,s:30,paint:P=>{P.wash('#b8603a',pot,{top:'#d88050',edge:.6,clouds:4});P.fill(starPts(x,2.8,1.1,.48),'#f6e7c0',.9);P.flat('#7a3a20',box(x-3.6,4.6,x+3.6,5.7),.6)}},z);
        for(const[a,l,c]of[[-.9,11,'#3f7a4a'],[-.35,14,'#4f9a5a'],[.2,15,'#3f8a52'],[.75,12,'#5aa866'],[1.2,9,'#3f7a4a']]){const tx_=x+Math.sin(a)*l,ty=5.4+Math.cos(a)*l,nx=Math.cos(a)*1.7,ny=-Math.sin(a)*1.7,lf=toCCW(sm([[x+Math.sin(a)*.6,5.6,1],[x+Math.sin(a)*l*.5+nx,5.4+Math.cos(a)*l*.5+ny],[tx_,ty,1],[x+Math.sin(a)*l*.5-nx,5.4+Math.cos(a)*l*.5-ny]],6));
          P2(g,lf,{t:.14,s:26,paint:P=>{P.wash(c,lf,{top:hexOf(shade(c,.25)),edge:.6});P.pen([[x+Math.sin(a)*.6,5.6],[tx_,ty]],dk(c),.08,.7)}},z-.3+a*.2)}
        for(const[dx,h]of[[-4.6,2.2],[4.4,1.7],[5.6,2.8]]){for(const s of thick([[[x+dx,.2],[x+dx,h]]],.3))P2(g,s,{color:'#f1ead8',kind:'card',t:.3},z+1.2);P2(g,sm([[x+dx-1.1,h],[x+dx+1.1,h],[x+dx+.6,h+.9],[x+dx-.6,h+.9]],4),{t:.3,mat:paperMat('#d8fff0','tissue',{glow:'#6fe0b0',gi:1.2})},z+1.3)}}}};
  const fast=g=>{/* gulv, reol, skab og kattens kurv står fast */
    for(let i=0;i<40;i++)Rm.floor(box(-72,-10+i*1.05,72,-9+i*1.05),{color:shade('#7a4e2e',R(-.06,.06)),kind:'balsa',t:.3},0,g);
    {const sx=13.5,sy=27;P2(g,box(sx-8,sy-.5,sx+8,sy+.4),{color:'#6a4426',kind:'balsa',t:3.2},-9.4);for(const dx of[-6.6,6.6])P2(g,toCCW([[sx+dx-.3,sy-.5],[sx+dx+.3,sy-.5],[sx+dx+.3,sy-3.4]]),{color:'#5c3c28',kind:'balsa',t:.5},-8.6);
      [['#7a2f3a',2.9],['#2f5a8a',3.5],['#c9a04a',2.5],['#3f7a4a',3.2]].forEach(([c,h],i)=>P2(g,box(sx-7.2+i*1.25,sy+.4,sx-6.2+i*1.25,sy+.4+h),{color:c,kind:'kraft',t:2.2},-9));
      const jar=sm([[sx-.6,sy+.4],[sx+2.2,sy+.4],[sx+2.5,sy+2.6],[sx+1.6,sy+3.6],[sx,sy+3.6],[sx-.9,sy+2.6]],5);P2(g,jar,{t:1,mat:paperMat('#eafff6','tissue',{glow:'#6fe0b0',gi:1})},-8.4);P2(g,box(sx-.1,sy+3.6,sx+1.7,sy+4.1),{color:'#c8a070',kind:'balsa',t:1},-8.4);Rm.glow(sx+.8,sy+2,-7.2,'#6fe0b0',7);
      const pt=toCCW(sm([[sx+4,sy+.4,1],[sx+6.8,sy+.4,1],[sx+6.4,sy+2.2],[sx+4.4,sy+2.2]],3));P2(g,pt,{color:'#b8603a',kind:'water',t:1.4},-8.6);for(const s of thick([[[sx+5.4,sy+2.2],[sx+5.4,sy+4.6]]],.14))P2(g,s,{color:'#3f7a4a',t:.1},-8);P2(g,starPts(sx+5.4,sy+5.4,1.3,.55),{t:.2,mat:paperMat('#fff6c0','tissue',{glow:'#ffe070',gi:1.4})},-7.9);Rm.glow(sx+5.4,sy+5.4,-7,'#ffe070',5)}
    {const cx=34,Hs=34,sk=new THREE.Group();g.add(sk);G.skab=sk;P2(sk,box(cx-7.4,0,cx+7.4,Hs),{t:6,s:14,paint:P=>{P.wash('#6a4426',null,{edge:0,top:'#86593a'})}},-9.6);
      for(const s of[-1,1]){const d=box(cx+s*3.6-3.3,1.4,cx+s*3.6+3.3,Hs-1.4);P2(sk,d,{t:.5,s:16,paint:P=>{P.wash('#7a5230',null,{edge:0,top:'#96693c'});P.score([...box(cx+s*3.6-2.5,2.6,cx+s*3.6+2.5,15),[cx+s*3.6-2.5,2.6]],{w:.14,ink:.4,dark:'#2a1408'});P.score([...box(cx+s*3.6-2.5,17.6,cx+s*3.6+2.5,Hs-2.8),[cx+s*3.6-2.5,17.6]],{w:.14,ink:.4,dark:'#2a1408'});P.fill(starPts(cx+s*3.6,25,1.5,.62),'#c9a04a',.85)}},-3.4);P2(sk,circ(cx+s*.9,16.4,.5,.5,16),{mat:gold(),t:.5},-2.8)}
      P2(sk,box(cx-.22,1.4,cx+.22,Hs-1.4),{t:.1,mat:paperMat('#fff0c0','tissue',{glow:'#ffd27a',gi:1.6})},-3.5);Rm.glow(cx,17,-2,'#ffd27a',9);
      P2(sk,box(cx-8.2,Hs-.4,cx+8.2,Hs+.9),{color:'#5c3c28',kind:'balsa',t:6.6},-9.8);P2(sk,toCCW([[cx-6.4,Hs+.9],[cx+6.4,Hs+.9],[cx,Hs+4.6]]),{color:'#6a4426',kind:'balsa',t:1},-4.4);P2(sk,starPts(cx,Hs+2.5,1,.42),{mat:gold(),t:.3},-3.3);
      /* en kjole der stikker ud på en bøjle på siden */
      const kx=cx-9.2,kj=toCCW(sm([[kx-1.3,26],[kx+1.3,26],[kx+1.5,23.6],[kx+1,20.6],[kx+2.6,12.4],[kx,11.8],[kx-2.6,12.4],[kx-1,20.6],[kx-1.5,23.6]],5));P2(sk,kj,{t:.2,s:26,paint:P=>{P.wash('#6a3fa2',kj,{top:'#8a5fc8',edge:.6});for(let i=0;i<9;i++)P.fill(starPts(kx+R(-1.6,1.6),R(13,20),.3,.13,R(1)),'#f2c230',.9)}},-8.6);for(const s of thick([[[kx-1.2,26.2],[kx,27.2],[kx+1.2,26.2]],[[kx,27.2],[kx,28]]],.1))P2(sk,s,{mat:gold(),t:.08},-8.5);P2(sk,circ(kx,28.3,.4,.4,10),{color:'#2e2833',t:.3},-9)}
    {const bx=10,bz=11;Rm.floor(circ(bx,bz,5.4,2.5,32),{color:'#7a5230',kind:'kraft',t:.5},.2,g);Rm.floor(circ(bx,bz,4.5,1.9,32),{color:'#e88aa8',kind:'water',t:.5},.6,g);
      const rim=toCCW(sm([[bx-5.4,.2,1],[bx+5.4,.2,1],[bx+5.6,2.4],[bx+3,1.9],[bx,1.7],[bx-3,1.9],[bx-5.6,2.4]],5));P2(g,rim,{t:.4,s:26,paint:P=>{P.wash('#9a6a3c',rim,{top:'#b8864e',edge:.6});for(let x=bx-5.2;x<bx+5.4;x+=.8)P.pen([[x,.3],[x+.4,2.2]],'#5c3c20',.06,.5)}},bz+2.3)}};
  const rebuild=slot=>{emptyGroup(G[slot]);B[slot](G[slot],V[slot])};
  const POS={tapet:[0,40,-8],gardin:[-27,34,-6],seng:[-29,12,2],lampe:[11,39,-3],taeppe:[0,2,6],ting:[21,10,8]};
  const skift=slot=>()=>{LYD.valg();V[slot]=(V[slot]+1)%3;SPIL.rum[slot]=V[slot];SPIL.save();rebuild(slot);Rm.rebake();Rm.burst(...POS[slot])};
  ctx.test=slot=>skift(slot)();
  const Rm=makeRoom(ctx,{fit:fitBox(84,50,0,20),key:{tgt:[-2,16,0]},
    build:Rm=>[()=>{G.fast=new THREE.Group();Rm.scene.add(G.fast)},...['tapet','gardin','seng','lampe','taeppe','ting'].map(s=>()=>{G[s]=new THREE.Group();Rm.scene.add(G[s]);B[s](G[s],V[s]%3);Rm.tap(G[s],skift(s))}),()=>fast(G.fast),
      ()=>{Rm.tap(G.skab,()=>ctx.go('garderobe'));
        heks=makeFigure(Object.assign({},ctx.look));heks.G.position.set(HX,.35,HZ);Rm.live.add(heks.G);Rm.blob(HX,HZ,15,6);Rm.tap(heks.G,()=>{LYD.tryk();pop=1;Rm.burst(HX,22,8,8)});
        kat=makeCat(ctx.dyr);kat.G.scale.setScalar(.6);kat.G.position.set(9.6,1.1,11.4);Rm.live.add(kat.G);Rm.tap(kat.G,()=>{LYD.op();hop=1});
        ctx.say('Tryk på tingene for at skifte dem · skabet fører ind i Garderoben')}],
    tick:t=>{pop=Math.max(0,pop-.035);hop=Math.max(0,hop-.04);const k=1+.06*Math.sin(pop*Math.PI)*pop;heks.G.scale.set(k,2-k,1);heks.G.position.y=.35+Math.sin(pop*Math.PI)*.9*pop;heks.tick(t,{ph:0,amp:0});
      kat.G.position.y=1.1+Math.sin(hop*Math.PI)*2.2*hop;kat.tick(t,{ph:hop?t*14:0,amp:hop?1:0})}})};
