/* ============ Værelsets ting, del 3: tæppet, tingen i hjørnet og kæledyrets seng ============ */
{const{P2,lt,dk,heart,cloud,moonS,rot,leaf,tis,GULD}=VRK;

/* ---------- tæppet: flade lag på gulvet, formerne gives som [x,z]. Gulvet ses meget fladt, så F strækker tæppet i dybden, ellers kan man ikke se formen ---------- */
VAER.gulv=(g,v,c,T)=>{const z=3.5,l=lt(c,.14),l2=lt(c,.3),F=(sh,o,y)=>T.Rm.floor(sh.map(([px,pz])=>[px*1.06,7.5+(pz-3.5)*1.7]),o,y,g),W=q=>({color:q,kind:'water',t:.05}),
    frynser=(x,s,za,zb)=>{for(let q=za+.25;q<zb;q+=1.05)F(box(Math.min(x,x+s*1.3),q,Math.max(x,x+s*1.3),q+.5),{color:'#efe3c8',kind:'water',t:.06},.2)};
  if(v==='rund'){F(circ(0,z,16,7,56),{color:c,kind:'water',t:.12},.2);F(circ(0,z,14.2,6.2,56),{mat:gold(),t:.03},.27);F(circ(0,z,13.6,5.9,56),W(l),.3);F(circ(0,z,8.6,3.8,48),W(l2),.33);
    for(let k=0;k<10;k++){const a=k/10*TAU;F(starPts(Math.cos(a)*11.2,z+Math.sin(a)*4.9,.7,.3),{mat:gold(),t:.03},.36)}}
  if(v==='stjerne'){const st=(r1,r2)=>starPts(0,0,r1,r2).map(([x,y])=>[x,z+y*.46]);F(st(18,8.6),{color:c,kind:'water',t:.12},.2);F(st(13.6,6.4),W(l2),.28);F(circ(0,z,3.4,1.5,32),{mat:gold(),t:.04},.33)}
  if(v==='stribet'){F(box(-15,z-5.4,15,z+5.4),{color:c,kind:'water',t:.12},.2);for(let i=0;i<6;i++){const x=-13.4+i*5.2;F(box(x,z-5.4,x+1.9,z+5.4),W(i%2?l2:'#efe3c8'),.29)}frynser(-15,-1,z-5.4,z+5.4);frynser(15,1,z-5.4,z+5.4)}
  if(v==='sky'){const sh=clip([circ(-8.5,z+.4,7.2,4.4,32),circ(0,z-.9,9,5.8,36),circ(8.6,z+.6,7,4.2,32),circ(-2.5,z+2.4,8,3.6,32),circ(5,z+2.3,7,3.4,32)],[],'union')[0].outer;
    F(sh,{color:lt(c,.5),kind:'water',t:.12},.2);F(grow(sh,-1.3)[0].outer,W(lt(c,.72)),.29);for(const[x,q]of[[-7,z-.6],[1.5,z-2.6],[8,z+.4]])F(circ(x,q,2.6,.9,20),W('#ffffff'),.33)}
  if(v==='hjerte'){const h=s=>heart(0,0,s,40).map(([x,y])=>[x,z+.6-y*.5]);F(h(15.5),{color:c,kind:'water',t:.12},.2);F(h(12.4),W(l2),.29);F(h(4),{mat:gold(),t:.03},.33)}
  if(v==='persisk'){F(box(-15,z-5.6,15,z+5.6),{color:c,kind:'water',t:.12},.2);F(box(-14.1,z-5,14.1,z+5),{mat:gold(),t:.03},.27);F(box(-13.6,z-4.6,13.6,z+4.6),W(dk(c,-.3)),.3);F(box(-12.5,z-3.9,12.5,z+3.9),W(l),.33);
    F([[-7,z],[0,z-3.2],[7,z],[0,z+3.2]],{mat:gold(),t:.03},.36);F([[-5.2,z],[0,z-2.3],[5.2,z],[0,z+2.3]],W(c),.39);F([[-2.4,z],[0,z-1.1],[2.4,z],[0,z+1.1]],W(l2),.42);
    for(const sx of[-1,1])for(const sz of[-1,1])F(toCCW([[sx*12.5,z+sz*3.9],[sx*8.6,z+sz*3.9],[sx*12.5,z+sz*1.7]]),W(dk(c,-.3)),.36);frynser(-15,-1,z-5.6,z+5.6);frynser(15,1,z-5.6,z+5.6)}
  if(v==='maane'){const m=(a,b,k)=>clip([circ(-2,z,a,b,56)],[circ(-2+a*.42,z-b*.08,a*.8,b*.82,52)],'diff')[0].outer;F(m(15.5,6.8),{color:c,kind:'water',t:.12},.2);
    for(const[x,q,r]of[[-13.4,z+.4,.9],[-12.2,z-2.6,.6],[-11.6,z+3.2,.7]])F(circ(x,q,r*1.5,r*.7,14),W(l2),.29);
    for(const[x,q,r]of[[6,z-1.4,2.2],[11.6,z+1.8,1.6],[4.4,z+3,1.3]])F(starPts(0,0,r,r*.44).map(([px,py])=>[x+px,q+py*.46]),{mat:gold(),t:.04},.2)}
  if(v==='blomst'){for(let k=0;k<6;k++){const a=k/6*TAU+.5;F(circ(Math.cos(a)*8.8,z+Math.sin(a)*3.8,6.2,2.8,32),{color:k%2?c:l2,kind:'water',t:.1},.2+(k%2)*.07)}F(circ(0,z,5.4,2.4,32),{color:'#f2c230',kind:'water',t:.06},.36);F(circ(0,z,3.2,1.4,24),W('#e8a020'),.42)}
  if(v==='pels'){const fur=(k,n)=>{const p=[];for(let i=0;i<n;i++){const a=i/n*TAU,r=(i%2?1:.9)*(1+.1*Math.sin(3*a+1)+.05*Math.sin(5*a));p.push([Math.cos(a)*16.5*k*r,z+Math.sin(a)*7*k*r])}return p};
    F(fur(1,72),{color:lt(c,.62),kind:'water',t:.14},.2);F(fur(.74,56),W(lt(c,.78)),.31);F(fur(.42,40),W('#ffffff'),.35)}
  if(v==='ternet'){F(box(-14.6,z-5.6,14.6,z+5.6),{color:c,kind:'water',t:.12},.2);for(let i=0;i<8;i++)for(let j=0;j<3;j++)if((i+j)%2)F(box(-14.4+i*3.6+.1,z-5.4+j*3.6+.1,-14.4+i*3.6+3.5,z-5.4+j*3.6+3.5),W(l2),.29);frynser(-14.6,-1,z-5.6,z+5.6);frynser(14.6,1,z-5.6,z+5.6)}};

/* ---------- tingen i hjørnet ---------- */
VAER.ting=(g,v,c,T)=>{const x=21,z=6,F=(sh,o,y)=>T.Rm.floor(sh,o,y,g),B='#c9952e';
  if(v==='kedel'){for(const[a,b]of[[[x-5,.5],[x+2.4,.9]],[[x-2.2,.9],[x+5,.5]]])for(const s of thick([[a,b]],.55))P2(g,s,{color:'#6a4426',kind:'balsa',t:1},z-.6);
    for(const[dx,s]of[[-1.6,1],[0,1.3],[1.7,.9]])P2(g,toCCW(sm([[x+dx,.9,1],[x+dx+.6*s,1.8*s],[x+dx,3.2*s,1],[x+dx-.6*s,1.8*s]],5)),{t:.1,mat:tis('#ffd890',1.6,'#ff9a40')},z-.2+dx*.05);
    P2(g,circ(x,10.9,4.7,1.2,32),{t:.2,mat:tis(lt(c,.2),1.3,c)},z-.3);for(const[dx,dy,r]of[[-2.2,12.6,.75],[1.1,13.7,.5],[2.7,12.2,.42],[-.4,12.1,.36]])P2(g,circ(x+dx,dy,r,r,16),{t:.1,mat:tis(lt(c,.35),1.4,c)},z-.25);
    const pot=toCCW(sm([[x-5,10.2,1],[x+5,10.2,1],[x+5.7,6.2],[x+3.8,2.4],[x,1.7],[x-3.8,2.4],[x-5.7,6.2]],6));P2(g,pot,{t:1.4,s:26,paint:P=>{P.wash('#3a3346',pot,{top:'#5a5268',edge:.7,clouds:6});P.wash('#8a84a0',circ(x-2.6,6.6,1.6,2.6,18),{alpha:.35,edge:0,mode:'source-over'});P.fill(starPts(x+1.6,5.6,1.2,.5),GULD,.85)}},z);
    P2(g,toCCW(sm([[x-5.7,9.8],[x+5.7,9.8],[x+5.9,10.4],[x+5.7,11],[x-5.7,11],[x-5.9,10.4]],4)),{color:'#4a4258',kind:'card',t:1.8},z-.1);
    for(const d of[-1,1]){P2(g,toCCW([[x+d*2.6,2.6],[x+d*4,3.2],[x+d*4.4,.3],[x+d*3.6,.3]]),{color:'#2e2833',kind:'card',t:.8},z+.2);for(const s of ring(circ(x+d*5.9,8,1,1.1,16),.22))P2(g,s,{mat:gold(),t:.2},z+.3)}
    T.glow(x,12.4,z+1.5,c,13,true);T.glow(x,1.8,z+1,'#ff9a40',8,true)}
  if(v==='kost'){const a=[x-6,15.6],b=[x+2.2,7.2];for(const s of thick([[a,b]],.34))P2(g,s,{color:'#8a5a3c',kind:'balsa',t:.7},z);
    const br=toCCW([[x+1.3,7.7],[x+3,6.5],[x+7.6,4.6],[x+7.2,3],[x+6,2.2],[x+4.4,1.6],[x+3.4,2.4]]);P2(g,br,{t:.8,s:30,paint:P=>{P.wash('#d9a84a',br,{top:'#efc86a',edge:.7,clouds:4});for(let k=0;k<9;k++)P.pen([[x+2.2,7],[x+7.4-k*.45,4.4-k*.34]],'#8a5a1a',.07,.6)}},z-.1);
    P2(g,toCCW(rot(box(x+1.2,6.5,x+3.6,7.5),x+2.4,7,-.78)),{color:c,kind:'water',t:1},z);
    for(const[dx,dy,r]of[[3,1,.5],[5.6,.4,.36],[1,2.2,.3],[-2.4,5.4,.4],[-4.6,8,.3]])P2(g,starPts(x+dx,dy,r,r*.44,dx),{t:.06,mat:tis('#fff6d0',1.5,'#ffe9a0')},z+.2);
    F(circ(x,z+.5,6,1.5,24),{color:'#2a1a12',kind:'water',t:.02},.06);T.glow(x+4.6,2.6,z+1,'#ffe9a0',7,true)}
  if(v==='plante'){const pot=toCCW(sm([[x-3.4,5.6,1],[x+3.4,5.6,1],[x+2.6,.2],[x-2.6,.2]],4));P2(g,pot,{t:2,s:30,paint:P=>{P.wash(c,pot,{top:lt(c,.22),edge:.6,clouds:4});P.fill(starPts(x,2.8,1.1,.48),'#f6e7c0',.9);P.flat(dk(c,-.4),box(x-3.6,4.6,x+3.6,5.7),.6)}},z);
    for(const[a,l,q]of[[-.9,11,'#3f7a4a'],[-.35,14,'#4f9a5a'],[.2,15,'#3f8a52'],[.75,12,'#5aa866'],[1.2,9,'#3f7a4a']]){const tx_=x+Math.sin(a)*l,ty=5.4+Math.cos(a)*l,nx=Math.cos(a)*1.7,ny=-Math.sin(a)*1.7,lf=toCCW(sm([[x+Math.sin(a)*.6,5.6,1],[x+Math.sin(a)*l*.5+nx,5.4+Math.cos(a)*l*.5+ny],[tx_,ty,1],[x+Math.sin(a)*l*.5-nx,5.4+Math.cos(a)*l*.5-ny]],6));
      P2(g,lf,{t:.14,s:26,paint:P=>{P.wash(q,lf,{top:lt(q,.25),edge:.6});P.pen([[x+Math.sin(a)*.6,5.6],[tx_,ty]],dk(q),.08,.7)}},z-.3+a*.2)}
    P2(g,moonS(x+2.4,17.4,1.5),{t:.2,mat:tis('#fff6c0',1.4,'#ffe070')},z+.1);T.glow(x+2.6,17.4,z+1,'#ffe070',6);
    for(const[dx,h]of[[-4.6,2.2],[4.4,1.7],[5.6,2.8]]){for(const s of thick([[[x+dx,.2],[x+dx,h]]],.3))P2(g,s,{color:'#f1ead8',kind:'card',t:.3},z+1.2);P2(g,sm([[x+dx-1.1,h],[x+dx+1.1,h],[x+dx+.6,h+.9],[x+dx-.6,h+.9]],4),{t:.3,mat:tis('#d8fff0',1.2,'#6fe0b0')},z+1.3)}}
  if(v==='globus'){F(circ(x,z,3.6,1.5,28),{color:'#5c3c28',kind:'balsa',t:.6},.3);for(const s of thick([[[x,.6],[x,6]]],.5))P2(g,s,{color:'#6a4426',kind:'balsa',t:.5},z-.2);
    for(const s of ring(circ(x,11.2,5.3,5.3,40),.36,false))P2(g,s,{mat:gold(),t:.3},z-.3);
    const gl=circ(x,11.2,4.6,4.6,40);P2(g,gl,{t:.4,s:40,paint:P=>{P.wash(c,gl,{top:lt(c,.3),edge:.7,clouds:8});for(let i=0;i<22;i++)P.fill(starPts(x+R(-3.6,3.6),11.2+R(-3.6,3.6),R(.2,.42),.12,R(1)),'#fff3c0',.9);
      for(const pts of[[[x-3,13],[x-1.2,12.2],[x-.4,13.8],[x+1.4,13]],[[x+.6,9.6],[x+2.4,10.4],[x+3,8.8]],[[x-2.8,9.4],[x-1.4,8.2]]]){P.pen(pts,'#f6e7c0',.06,.7);for(const p of pts)P.fill(circ(p[0],p[1],.2,.2,8),'#fff6d0',1)}
      for(let k=-1;k<=1;k++)P.pen(curve([[x-4.5,11.2+k*2.2],[x,11.2+k*2.2-.5],[x+4.5,11.2+k*2.2]],8),'#e8f6ff',.05,.3)}},z);
    P2(g,sm([[x-6.4,10.6],[x+6.4,10.6],[x+6.2,11.6],[x-6.2,11.6]],3),{color:'#86593a',kind:'balsa',t:.4},z+.5)}
  if(v==='ur'){const W='#6a4430',bs=box(x-3.7,0,x+3.7,2.2),tr=box(x-2.9,2.2,x+2.9,11.6),hd=box(x-3.6,11.6,x+3.6,18.4);
    P2(g,bs,{t:2.4,s:26,paint:P=>P.wash(W,bs,{top:lt(W,.12),edge:.6,clouds:3})},z-1);
    P2(g,tr,{t:2,s:26,paint:P=>{P.wash(W,tr,{top:lt(W,.15),edge:.6,clouds:4});P.wash(c,box(x-2.1,3,x+2.1,10.8),{alpha:.9,edge:.5,mode:'source-over',clouds:3});P.fill(arch(x,3.8,2.6,6.2,12),'#1a1420',.9);P.score([...box(x-2.1,3,x+2.1,10.8),[x-2.1,3]],{w:.12,ink:.4,dark:'#1a0c06'})}},z-.8);
    for(const s of thick([[[x,9.4],[x+.5,5.6]]],.09))P2(g,s,{mat:gold(),t:.08},z+1.25);P2(g,circ(x+.6,5.2,.85,.85,18),{mat:gold(),t:.2},z+1.25);
    P2(g,hd,{t:2.4,s:26,paint:P=>P.wash(W,hd,{top:lt(W,.15),edge:.6,clouds:4})},z-1);
    const fc=circ(x,15,2.7,2.7,36);for(const s of ring(fc,.34))P2(g,s,{mat:gold(),t:.2},z+1.42);P2(g,fc,{t:.1,s:50,paint:P=>{P.wash('#fbf3dc',fc,{edge:.5,clouds:3});for(let k=0;k<12;k++){const a=k/12*TAU;P.pen([[x+Math.cos(a)*2.05,15+Math.sin(a)*2.05],[x+Math.cos(a)*2.45,15+Math.sin(a)*2.45]],'#3a2a1c',k%3?.06:.13,.9)}P.pen([[x,15],[x-.2,16.9]],'#2a1c14',.16,1);P.pen([[x,15],[x+1.3,14.3]],'#2a1c14',.16,1);P.fill(circ(x,15,.24,.24,10),c,1)}},z+1.4);
    P2(g,toCCW(sm([[x-4.1,18.4,1],[x+4.1,18.4,1],[x+2.4,20.2],[x,21.4],[x-2.4,20.2]],5)),{color:dk(W,-.15),kind:'balsa',t:2.6},z-1.1);P2(g,circ(x,21.8,.7,.7,16),{mat:gold(),t:.8},z-.2)}
  if(v==='kiste'){const bd=box(x-5,.3,x+5,5.4),ld=toCCW(sm([[x-5.3,5.4,1],[x+5.3,5.4,1],[x+5.3,7.4],[x+3.9,9.1],[x-3.9,9.1],[x-5.3,7.4]],6));
    P2(g,bd,{t:3,s:26,paint:P=>{boards(P,bd,c,{h:1.3,dir:'h',ink:.3})}},z-1.5);P2(g,ld,{t:3.2,s:26,paint:P=>{boards(P,ld,lt(c,.08),{h:1.2,dir:'h',ink:.3})}},z-1.6);
    for(const dx of[-3.3,3.3]){P2(g,box(x+dx-.5,.3,x+dx+.5,5.4),{mat:gold(),t:.15},z+1.5);for(const s of clip([box(x+dx-.5,5.4,x+dx+.5,9.4)],[ld],'inter'))P2(g,s,{mat:gold(),t:.15},z+1.6)}
    P2(g,box(x-5.1,5,x+5.1,5.75),{mat:gold(),t:.2},z+1.62);P2(g,toCCW(sm([[x-.9,6.2,1],[x+.9,6.2,1],[x+.9,4.4],[x,3.6],[x-.9,4.4]],4)),{mat:gold(),t:.3},z+1.8);P2(g,circ(x,4.9,.3,.3,10),{color:'#1a1420',t:.06},z+2.1);
    for(const[dx,dz]of[[-6.4,1.6],[-5.4,2.6],[6.2,2.2],[-7,2.8]])F(circ(x+dx,z+dz,.8,.42,14),{mat:gold(),t:.14},.12);P2(g,toCCW([[x+6.4,.2],[x+7.4,.2],[x+7.9,1.1],[x+6.9,1.9],[x+5.9,1.1]]),{t:.5,mat:tis('#ff9ac0',1.1,'#ff5a9a')},z+1.6);T.glow(x+6.9,1.1,z+2.4,'#ff5a9a',3.4)}
  if(v==='grammofon'){const W='#6a4430',bx=box(x-4.2,0,x+4.2,5);P2(g,bx,{t:3,s:26,paint:P=>{P.wash(W,bx,{top:lt(W,.15),edge:.6,clouds:4});P.score([...box(x-3.3,.9,x+3.3,4.1),[x-3.3,.9]],{w:.12,ink:.4,dark:'#1a0c06'});P.fill(starPts(x,2.5,1,.42),GULD,.85)}},z-1.5);
    P2(g,box(x-3.9,5,x+3.9,5.5),{color:'#2e2833',kind:'card',t:2.6},z-1.3);P2(g,circ(x-.8,5.95,3.1,.62,28),{color:'#1a1420',kind:'card',t:.1},z+.4);P2(g,circ(x-.8,5.98,1,.2,16),{color:c,kind:'water',t:.06},z+.52);
    for(const s of thick([[[x+4.2,2.6],[x+5.4,2.6],[x+5.4,3.8]]],.14))P2(g,s,{mat:gold(),t:.14},z+.6);P2(g,circ(x+5.4,4.1,.36,.36,10),{color:'#2e2833',t:.3},z+.6);
    const hn=toCCW(sm([[x+1.5,5.6,1],[x+2.7,5.6,1],[x+2.8,9.4],[x+1.4,12.6],[x-.2,17.4,1],[x-6.8,12.6,1],[x-2.4,11.2],[x+.9,9]],6));P2(g,hn,{t:.6,s:26,paint:P=>{P.wash(c,hn,{top:lt(c,.25),edge:.7,clouds:5});for(const k of[.25,.5,.75])P.pen(curve([[x+2.1,5.8],[x+1.6-k*2,10.6],[x-.2-6.6*k,17.4-4.8*k]],8),dk(c,-.3),.08,.5)}},z-.4);
    const el=a=>rot(circ(x-3.5,15,4.15*a,1.6*a,36),x-3.5,15,.63);for(const s of clip([el(1.08)],[el(.86)],'diff'))P2(g,s,{mat:gold(),t:.2},z+.25);P2(g,el(.87),{color:dk(c,-.5),kind:'water',t:.1},z+.22)}
  if(v==='teleskop'){for(const[dx,dz]of[[-3.2,0],[3.2,0],[0,-1.5]])for(const s of thick([[[x+dx,.3],[x,9.6]]],.36))P2(g,s,{color:'#6a4426',kind:'balsa',t:.4},z+dz*.3);
    const tb=toCCW([[x-5.6,8.2],[x-4.6,6.6],[x+5.4,12.8],[x+4.4,14.6]]);P2(g,tb,{t:1.6,s:36,paint:P=>{P.wash(c,tb,{top:lt(c,.25),edge:.6});for(const k of[.12,.5,.9])P.fill(toCCW([[x-5.6+10*k-.3,8.2+6.4*k],[x-4.6+10*k-.3,6.6+6.2*k],[x-4.6+10*k+.5,6.6+6.2*k+.5],[x-5.6+10*k+.5,8.2+6.4*k+.5]]),'#d9a83a',1);for(let i=0;i<6;i++)P.fill(starPts(x+R(-3.6,3.4),R(8.6,12.6),.26,.11,R(1)),'#f2c230',.9)}},z);
    P2(g,circ(x+5.2,14,1.5,1.7,20),{t:.3,mat:tis('#dff2ff',.9,'#9fd8ff')},z+.9);P2(g,circ(x,9.6,.8,.8,14),{mat:gold(),t:.6},z+.9)}
  if(v==='aeg'){F(circ(x,z,6.2,2.5,32),{color:'#5c3c28',kind:'kraft',t:.4},.2);
    const twigs=(sh,zz)=>P2(g,sh,{t:.5,s:26,paint:P=>{P.wash('#8a5e3c',sh,{top:'#a87a4e',edge:.6,clouds:4});for(let i=0;i<46;i++){const tx_=x+R(-6,6),ty=R(.2,4.2),a=R(-.5,.5);P.pen([[tx_-Math.cos(a)*1.3,ty-Math.sin(a)*1.3],[tx_+Math.cos(a)*1.3,ty+Math.sin(a)*1.3]],i%3?'#4a2e1c':'#c89a62',.09,.7)}}},zz);
    twigs(toCCW(sm([[x-5.6,.2,1],[x+5.6,.2,1],[x+6.3,3.6],[x+3.4,4.4],[x,4.6],[x-3.4,4.4],[x-6.3,3.6]],5)),z-2);
    const eg=[];for(let i=0;i<40;i++){const a=i/40*TAU,sn=Math.sin(a);eg.push([x+Math.cos(a)*3.5*(sn>0?1-.16*sn:1),7+sn*(sn>0?5.6:4.4)])}
    P2(g,eg,{t:1.2,s:30,paint:P=>{P.wash(c,eg,{top:lt(c,.35),edge:.8,clouds:5});for(const[dx,dy,r]of[[-1.4,8.6,.8],[1.2,6.2,1],[.6,10.4,.6],[-1.6,5,.55],[1.9,8.8,.45],[-.4,3.6,.5]])P.fill(circ(x+dx,dy,r,r*1.15,14),lt(c,.5),.6);P.wash('#ffffff',circ(x-1.2,10,.9,1.7,14),{alpha:.35,edge:0,mode:'source-over'})}},z-.6);
    twigs(toCCW(sm([[x-5.8,.2,1],[x+5.8,.2,1],[x+6.2,3.2],[x+3,2.5],[x,2.2],[x-3,2.5],[x-6.2,3.2]],5)),z+1.6);T.glow(x,8,z+1.4,lt(c,.3),11)}
  if(v==='ovn'){const I='#3a3346',bd=toCCW(sm([[x-4.3,1.2,1],[x+4.3,1.2,1],[x+4.3,10],[x+3.6,11,1],[x-3.6,11,1],[x-4.3,10]],4));
    P2(g,box(x+1.5,11.6,x+3.3,66),{color:'#2e2833',kind:'card',t:1.6},z-1.6);P2(g,box(x+1.2,16,x+3.6,17),{color:I,kind:'card',t:1.8},z-1.7);
    for(const d of[-1,1])P2(g,toCCW([[x+d*3,1.2],[x+d*4.2,1.2],[x+d*4.9,0],[x+d*4,0]]),{color:'#2e2833',kind:'card',t:2.2},z-1.1);
    P2(g,bd,{t:3,s:26,paint:P=>{P.wash(I,bd,{top:'#5a5268',edge:.7,clouds:5});P.wash(c,box(x-3.4,2,x+3.4,9.9),{alpha:.92,edge:.6,mode:'source-over',clouds:3});P.score([...box(x-3.4,2,x+3.4,9.9),[x-3.4,2]],{w:.14,ink:.4,dark:'#1a1420'});P.fill(arch(x,2.9,4.6,4.8,14),'#1a1420',.95);for(const dx of[-2.4,2.4])P.fill(circ(x+dx,8.9,.3,.3,8),GULD,.9)}},z-1.5);
    P2(g,arch(x,3.2,4,4.2,16),{t:.1,mat:tis('#ffd890',1.5,'#ff8a30')},z+1.52);for(const dx of[-1.2,0,1.2])P2(g,box(x+dx-.12,3.2,x+dx+.12,7.4),{color:'#1a1420',t:.12},z+1.62);
    P2(g,box(x-4.9,11,x+4.9,11.8),{color:'#4a4258',kind:'card',t:3.4},z-1.7);P2(g,circ(x+3.6,6.2,.4,.4,10),{mat:gold(),t:.4},z+1.6);T.glow(x,5.2,z+2.4,'#ff8a30',11,true)}};

/* ---------- kæledyrets seng: noget bagved, en pude på gulvet og en lav kant foran ---------- */
VAER.dyreseng=(g,v,c,T)=>{const bx=10,bz=11,zb=bz-2.3,zf=bz+2.3,F=(sh,o,y)=>T.Rm.floor(sh,o,y,g),pude=(q=c,rx=4.5,rz=1.9)=>F(circ(bx,bz,rx,rz,32),{color:q,kind:'water',t:.5},.6);
  if(v==='kurv'){F(circ(bx,bz,5.4,2.5,32),{color:'#7a5230',kind:'kraft',t:.5},.2);pude();
    const flet=(sh,zz)=>P2(g,sh,{t:.4,s:26,paint:P=>{P.wash('#9a6a3c',sh,{top:'#b8864e',edge:.6});for(let x=bx-5.6;x<bx+5.8;x+=.8)P.pen([[x,.3],[x+.4,4.4]],'#5c3c20',.06,.5);for(const y of[1.1,2.2,3.3])P.pen([[bx-6,y],[bx+6,y]],'#5c3c20',.05,.35)}},zz);
    flet(toCCW(sm([[bx-5.4,.2,1],[bx+5.4,.2,1],[bx+5.9,3.4],[bx+3,4.1],[bx,4.3],[bx-3,4.1],[bx-5.9,3.4]],5)),zb);flet(toCCW(sm([[bx-5.4,.2,1],[bx+5.4,.2,1],[bx+5.6,2.4],[bx+3,1.9],[bx,1.7],[bx-3,1.9],[bx-5.6,2.4]],5)),zf)}
  if(v==='pude'){F(circ(bx,bz,6.2,2.8,36),{color:dk(c,-.25),kind:'water',t:.3},.2);pude(lt(c,.15),5.6,2.4);
    const fr=toCCW(sm([[bx-6,.3],[bx+6,.3],[bx+6.4,1.5],[bx+5.2,2.4],[bx,2],[bx-5.2,2.4],[bx-6.4,1.5]],6));P2(g,fr,{t:.8,s:26,paint:P=>{P.wash(c,fr,{top:lt(c,.2),edge:.7,clouds:4});P.pen(curve([[bx-5.6,1.5],[bx,1.1],[bx+5.6,1.5]],8),lt(c,.45),.07,.7);P.fill(circ(bx,1.2,.36,.36,10),GULD,.95)}},zf-.4);
    for(const d of[-1,1]){P2(g,circ(bx+d*6.3,1.5,.5,.5,12),{mat:gold(),t:.5},zf);for(const k of[-.3,0,.3])for(const s of thick([[[bx+d*6.3,1.3],[bx+d*(6.5+k*.4)+k,.2]]],.07))P2(g,s,{mat:gold(),t:.06},zf+.3)}}
  if(v==='slot'){const ST='#b9a6d9',mur=(xa,xb,h,zz,n,port)=>{const w=(xb-xa)/(2*n-1),pts=[[xa,0],[xb,0]];for(let i=0;i<2*n-1;i++){const xr=xb-i*w,up=i%2===0;pts.push([xr,up?h:h-.9],[xr-w,up?h:h-.9])}const sh=toCCW(pts);
      P2(g,sh,{t:.6,s:30,paint:P=>{P.wash(ST,sh,{edge:.4,clouds:5});P.ashlar(sh,ST,{rowH:[.9,1.2],bw:[1.3,2.2],tint:.1,ink:.28});if(port)P.fill(arch((xa+xb)/2,0,2.4,1.9,10),'#2a2040',.85)}},zz)};
    mur(bx-5.2,bx+5.2,5.2,zb,5);for(const d of[-1,1]){mur(bx+d*5.6-1.5,bx+d*5.6+1.5,8.4,zb+.3,2);P2(g,toCCW([[bx+d*5.6-1.9,8.4],[bx+d*5.6+1.9,8.4],[bx+d*5.6,12.2]]),{color:c,kind:'water',t:.5},zb+.4);
      for(const s of thick([[[bx+d*5.6,12.2],[bx+d*5.6,14]]],.08))P2(g,s,{mat:gold(),t:.08},zb+.5);P2(g,toCCW([[bx+d*5.6+.1,14],[bx+d*5.6+.1,12.9],[bx+d*5.6+1.7,13.45]]),{color:'#e0457a',kind:'water',t:.08},zb+.55)}
    pude(lt(c,.2));mur(bx-5.6,bx+5.6,2.7,zf,5,true)}
  if(v==='kasse'){const K='#c99a62',pap=(sh,zz,paint)=>P2(g,sh,{t:.3,s:30,base:'kraft',paint:P=>{P.wash(K,sh,{top:lt(K,.12),edge:.6,clouds:4});paint&&paint(P)}},zz);
    pap(box(bx-5,0,bx+5,5.4),zb);pap(toCCW([[bx-5,5.4],[bx+5,5.4],[bx+6,7.8],[bx-4,7.8]]),zb-.2);for(const d of[-1,1])pap(toCCW([[bx+d*5,0],[bx+d*5,5.2],[bx+d*6.6,6.2],[bx+d*5.8,1.4]]),bz);
    pude(c,4.4,1.8);pap(box(bx-5.2,0,bx+5.2,2.8),zf,P=>{P.fill(box(bx-5.3,1.1,bx+5.3,1.8),'#e8d2a6',.8);P.fill(heart(bx+2.8,1.5,.85,18),c,.9);P.pen([[bx-4.2,2.3],[bx-3.6,.6]],'#7a5230',.08,.6);P.pen([[bx-3.4,2.3],[bx-2.8,.6]],'#7a5230',.08,.6)});
    P2(g,toCCW(sm([[bx-3.6,2.9,1],[bx+.6,2.9,1],[bx+.4,1.5],[bx-.8,1.9],[bx-2,1.3],[bx-3.2,1.8]],4)),{color:c,kind:'water',t:.2},zf+.32)}
  if(v==='hule'){const dm=arch(bx,0,13,9.6,26);P2(g,dm,{t:.8,s:26,paint:P=>{P.wash(c,dm,{top:lt(c,.22),edge:.7,clouds:5});P.fill(arch(bx,0,8.6,6.8,20),'#1a1420',.92);P.pen(arch(bx,0,9.6,7.5,20).slice(2),lt(c,.5),.12,.8);for(let k=0;k<7;k++){const a=Math.PI*(.12+.76*k/6);P.fill(starPts(bx+Math.cos(a)*5.7,2.8+Math.sin(a)*5.6,.42,.18),'#f2c230',.9)}}},zb);
    for(const d of[-1,1]){P2(g,circ(bx+d*4.4,8.8,1.6,1.6,20),{color:c,kind:'water',t:.6},zb-.3);P2(g,circ(bx+d*4.4,8.8,.8,.8,16),{color:lt(c,.4),kind:'water',t:.1},zb+.32)}
    F(circ(bx,bz,6.4,2.9,36),{color:dk(c,-.3),kind:'water',t:.2},.2);pude(lt(c,.3),4.6,1.9);P2(g,toCCW(sm([[bx-6.4,.2,1],[bx+6.4,.2,1],[bx+6.2,1.3],[bx,1],[bx-6.2,1.3]],4)),{color:dk(c,-.15),kind:'water',t:.6},zf)}
  if(v==='sofa'){const W='#6a4430',bk=toCCW(sm([[bx-5.8,0,1],[bx+5.8,0,1],[bx+5.8,5.6],[bx+4.4,7.4],[bx,7.9],[bx-4.4,7.4],[bx-5.8,5.6]],6));
    P2(g,bk,{t:1,s:26,paint:P=>{P.wash(c,bk,{top:lt(c,.22),edge:.7,clouds:5});for(const y of[3.6,5.8])for(let dx=-3.6;dx<=3.6;dx+=2.4){const xx=bx+dx+(y>5?0:1.2);if(Math.abs(xx-bx)>4.6)continue;P.fill(circ(xx,y,.3,.3,10),GULD,.9);P.score([[xx-1.2,y+1.1],[xx,y],[xx+1.2,y+1.1]],{w:.08,ink:.28,dark:dk(c,-.5)})}}},zb);
    pude(lt(c,.18),4.6,1.9);for(const d of[-1,1]){const ar=clip([box(bx+d*5.6-1.2,0,bx+d*5.6+1.2,4.2),circ(bx+d*5.6,4.2,1.5,1.3,20)],[],'union')[0].outer;P2(g,ar,{t:4.2,s:26,paint:P=>P.wash(c,ar,{top:lt(c,.2),edge:.7,clouds:3})},zb+.6)}
    const fr=box(bx-4.6,.8,bx+4.6,2.3);P2(g,fr,{t:.5,s:26,paint:P=>{P.wash(dk(c,-.12),fr,{edge:.6,clouds:3});P.pen([[bx-4.4,1.9],[bx+4.4,1.9]],lt(c,.4),.07,.6)}},zf);for(const d of[-1,1])P2(g,box(bx+d*4.2-.5,0,bx+d*4.2+.5,.8),{color:W,kind:'balsa',t:.6},zf)}
  if(v==='hundehus'){const W='#9c6b43',gv=toCCW([[bx-5.4,0],[bx+5.4,0],[bx+5.4,6.2],[bx,10.8],[bx-5.4,6.2]]);
    P2(g,gv,{t:.6,s:26,paint:P=>{boards(P,gv,W,{h:1.4,dir:'h',ink:.3});P.fill(arch(bx,0,6.6,6.8,18),'#1a1420',.94);P.pen(arch(bx,0,7.4,7.3,18).slice(2),'#5c3c20',.14,.8)}},zb);
    for(const d of[-1,1])for(const s of thick([[[bx+d*6.9,5],[bx,11.6]]],.6))P2(g,s,{color:c,kind:'water',t:1.6},zb-.2);P2(g,circ(bx,11.6,.6,.6,14),{mat:gold(),t:1.7},zb-.25);
    const bn=clip([box(bx-1.1,8,bx+1.1,8.7),circ(bx-1.2,8.05,.42,.42,10),circ(bx-1.2,8.65,.42,.42,10),circ(bx+1.2,8.05,.42,.42,10),circ(bx+1.2,8.65,.42,.42,10)],[],'union')[0].outer;P2(g,bn,{color:'#f6efdc',kind:'water',t:.12},zb+.62);
    F(circ(bx,bz,5.6,2.4,32),{color:dk(c,-.2),kind:'water',t:.2},.2);pude(lt(c,.25),4.4,1.8);const th=box(bx-5.6,0,bx+5.6,1.2);P2(g,th,{t:.5,s:26,paint:P=>boards(P,th,W,{h:.62,dir:'h',ink:.3})},zf)}
  if(v==='skypude'){const sk=(sh,zz,t=.8)=>P2(g,sh,{t,s:26,paint:P=>{P.wash('#f6f4ff',sh,{top:'#ffffff',edge:.7,clouds:4});P.wash(lt(c,.55),box(bx-8,-1,bx+8,1.2),{alpha:.55,edge:0})}},zz);
    sk(clip([circ(bx-3.9,2.6,2.6,2.4,22),circ(bx,3.4,3.2,3,26),circ(bx+3.9,2.6,2.6,2.4,22),box(bx-6,0,bx+6,2.4)],[],'union')[0].outer,zb);
    F(clip([circ(bx-3.4,bz,3.6,2,24),circ(bx+3.4,bz,3.6,2,24),circ(bx,bz-.6,4,2.2,24),circ(bx,bz+.7,4.4,2,24)],[],'union')[0].outer,{color:'#f4f1fa',kind:'water',t:.5},.3);
    sk(clip([circ(bx-3.8,1,2.3,1.5,20),circ(bx,1.1,2.8,1.8,24),circ(bx+3.8,1,2.3,1.5,20),box(bx-6,0,bx+6,1)],[],'union')[0].outer,zf,.6);
    for(const[dx,dy,r]of[[-6.6,5,.5],[6.4,6,.6],[4.6,7.4,.34]])P2(g,starPts(bx+dx,dy,r,r*.44),{t:.06,mat:tis('#fff6d0',1.3,'#ffe9a0')},zb+.1)}
  if(v==='muslingeskal'){const q=lt(c,.35),fan=[[bx,.3]];for(let i=0;i<=36;i++){const u=i/36,b=Math.PI*(.07+.86*u),r=8.2*(1+.06*Math.abs(Math.sin(u*Math.PI*9)));fan.push([bx+Math.cos(b)*r*.86,.3+Math.sin(b)*r])}
    P2(g,toCCW(fan),{t:.5,s:26,paint:P=>{P.wash(q,toCCW(fan),{top:lt(q,.35),edge:.7,clouds:4});for(let i=1;i<9;i++){const b=Math.PI*(.07+.86*i/9);P.pen([[bx,.3],[bx+Math.cos(b)*7.9*.86,.3+Math.sin(b)*7.9]],dk(q,-.28),.09,.6)}}},zb);
    F(circ(bx,bz,5.8,2.5,32),{color:dk(c,-.1),kind:'water',t:.2},.2);pude('#ffd9e8',4.6,1.9);
    const lw=[[bx-6.2,2.9],[bx-5.4,.9],[bx-2.8,.2],[bx+2.8,.2],[bx+5.4,.9],[bx+6.2,2.9]];for(let i=1;i<10;i++)lw.push([bx+6.2-12.4*i/10,2.9-(i%2?.9:0)]);const ls=toCCW(sm(lw,4));
    P2(g,ls,{t:.5,s:26,paint:P=>{P.wash(q,ls,{top:lt(q,.3),edge:.7,clouds:3});for(let i=1;i<10;i+=2)P.pen([[bx+6.2-12.4*i/10,2.2],[bx+(6.2-12.4*i/10)*.3,.4]],dk(q,-.28),.08,.5)}},zf);
    P2(g,circ(bx+4.7,1.9,.8,.8,18),{t:.4,mat:tis('#ffffff',1,'#ffe8f4')},zf+.6);T.glow(bx+4.7,1.9,zf+1.4,'#ffe8f4',4)}
  if(v==='balje'){const Z='#a8b0ba',zn=(sh,zz,paint)=>P2(g,sh,{t:.4,s:26,paint:P=>{P.wash(Z,sh,{top:lt(Z,.2),edge:.6,clouds:5});paint&&paint(P)}},zz);
    zn(toCCW([[bx-5.4,0],[bx+5.4,0],[bx+6.3,4.4],[bx-6.3,4.4]]),zb,P=>P.wash('#5a6270',box(bx-7,-1,bx+7,5),{alpha:.45,edge:0}));pude(c,4.6,1.9);
    zn(toCCW([[bx-5.3,.2],[bx+5.3,.2],[bx+6.1,3],[bx-6.1,3]]),zf,P=>{for(const y of[.9,2.3]){P.fill(box(bx-7,y,bx+7,y+.3),'#6a7280',.6);for(let x=bx-5;x<bx+5.4;x+=1.25)P.fill(circ(x,y+.15,.1,.1,6),'#e8eef4',.9)}});
    for(const d of[-1,1])for(const s of ring(circ(bx+d*6.5,2.5,.8,1,14),.2))P2(g,s,{color:'#6a7280',kind:'card',t:.2},zf-.3);
    P2(g,toCCW(sm([[bx+1,3.1,1],[bx+4.6,3.1,1],[bx+4.5,1.2],[bx+3.6,1.6],[bx+2.8,1],[bx+1.9,1.5],[bx+1.1,1.1]],4)),{color:c,kind:'water',t:.2},zf+.42);
    for(const[dx,dy,r]of[[-3.4,3.8,.6],[-2.2,4.6,.42],[-4.4,4.8,.34]])P2(g,circ(bx+dx,dy,r,r,14),{t:.06,mat:tis('#f4fbff',.7,'#cfe8ff')},zf-.6)}};
}
