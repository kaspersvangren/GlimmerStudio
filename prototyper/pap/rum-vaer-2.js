/* ============ Værelsets ting, del 2: hylden og lampen ============ */
{const{P2,lt,dk,heart,cloud,moonS,rot,leaf,tis,GULD}=VRK;

/* ---------- hylden: et bræt på væggen med ting på ---------- */
VAER.hylde=(g,v,c,T)=>{const sx=13.5,sy=27,y0=sy+.4;
  P2(g,box(sx-8,sy-.5,sx+8,sy+.4),{color:'#6a4426',kind:'balsa',t:3.2},-9.4);for(const dx of[-6.6,6.6])P2(g,toCCW([[sx+dx-.3,sy-.5],[sx+dx+.3,sy-.5],[sx+dx+.3,sy-3.4]]),{color:'#5c3c28',kind:'balsa',t:.5},-8.6);
  const pot=(x,w,h,col='#b8603a',z=-8.6)=>P2(g,toCCW(sm([[x-w,y0+h,1],[x+w,y0+h,1],[x+w*.78,y0,1],[x-w*.78,y0,1]],3)),{color:col,kind:'water',t:1.4},z);
  if(v==='boeger'){let x=sx-7.3;for(const[q,h,w]of[[c,3.6,1.1],['#2f5a8a',2.9,.9],['#c9a04a',3.4,1.2],['#3f7a4a',2.5,.8],[dk(c,-.25),3.8,1]]){P2(g,box(x,y0,x+w,y0+h),{color:q,kind:'kraft',t:2.2},-9);P2(g,box(x+.12,y0+h-.8,x+w-.12,y0+h-.55),{mat:gold(),t:.05},-6.78);x+=w+.12}
    P2(g,toCCW([[sx-1.5,y0],[sx-.6,y0+.3],[sx-1.75,y0+3.5],[sx-2.65,y0+3.2]]),{color:'#7a2f3a',kind:'kraft',t:1.6},-8.8);
    const jar=sm([[sx+.2,y0],[sx+3,y0],[sx+3.3,y0+2.2],[sx+2.4,y0+3.2],[sx+.8,y0+3.2],[sx-.1,y0+2.2]],5);P2(g,jar,{t:1,mat:tis('#eafff6',1,'#6fe0b0')},-8.4);P2(g,box(sx+.7,y0+3.2,sx+2.5,y0+3.7),{color:'#c8a070',kind:'balsa',t:1},-8.4);T.glow(sx+1.6,y0+1.6,-7.2,'#6fe0b0',7);
    pot(sx+5.6,1.5,1.8);for(const s of thick([[[sx+5.6,y0+1.8],[sx+5.6,y0+4.2]]],.14))P2(g,s,{color:'#3f7a4a',t:.1},-8);P2(g,starPts(sx+5.6,y0+5,1.3,.55),{t:.2,mat:tis('#fff6c0',1.4,'#ffe070')},-7.9);T.glow(sx+5.6,y0+5,-7,'#ffe070',5)}
  if(v==='eliksirer'){const fl=(sh,q,lvl,cx,top)=>{P2(g,sh,{t:1,mat:tis('#eafff6',.25,q)},-8.6);for(const s of clip([sh.outer||sh],[box(cx-4,y0+.15,cx+4,y0+lvl)],'inter'))P2(g,s,{t:.3,mat:tis(q,1.1)},-7.55);P2(g,box(cx-.6,top,cx+.6,top+.7),{color:'#c8a070',kind:'balsa',t:.9},-8.5)};
    let x=sx-5.2;fl(clip([circ(x,y0+1.7,1.7,1.7,26),box(x-.5,y0+2.8,x+.5,y0+4.6)],[],'union')[0].outer,c,2.2,x,y0+4.6);T.glow(x,y0+1.6,-7,c,6);
    x=sx-1.5;fl(sm([[x-1,y0,1],[x+1,y0,1],[x+1,y0+3.4],[x+.5,y0+4.2],[x+.5,y0+5.4,1],[x-.5,y0+5.4,1],[x-.5,y0+4.2],[x-1,y0+3.4]],4),'#6fe0b0',2.6,x,y0+5.4);P2(g,box(x-.7,y0+1,x+.7,y0+2.2),{color:'#f6efdc',kind:'water',t:.06},-7.2);
    x=sx+2.3;fl(toCCW([[x-1.8,y0],[x+1.8,y0],[x+.5,y0+3.2],[x+.5,y0+4.6],[x-.5,y0+4.6],[x-.5,y0+3.2]]),'#ff8fc7',1.6,x,y0+4.6);T.glow(x,y0+1.2,-7,'#ff8fc7',5);
    x=sx+5.9;fl(clip([box(x-1.15,y0,x+1.15,y0+2.3),box(x-.45,y0+2.2,x+.45,y0+3.1)],[],'union')[0].outer,'#ffd060',1.5,x,y0+3.1)}
  if(v==='krystaller'){const kry=(x,w,h,a,q,z)=>{const p=rot([[x-w,y0],[x+w,y0],[x+w*1.12,y0+h*.74],[x,y0+h],[x-w*1.12,y0+h*.74]],x,y0,a);P2(g,toCCW(p),{t:.6,mat:tis(q,.9)},z);P2(g,toCCW(rot([[x-w*.2,y0],[x+w*.55,y0],[x+w*.6,y0+h*.72],[x,y0+h*.96]],x,y0,a)),{t:.1,mat:tis(lt(q,.45),1.2,q)},z+.62)};
    kry(sx-5.4,.7,3.4,.22,'#9fe8ff',-8.6);kry(sx-4,.8,4.6,-.1,c,-8.9);kry(sx-.6,.9,4.2,.3,lt(c,.3),-8.9);kry(sx+.6,1.15,6.2,0,c,-8.6);kry(sx+1.9,.8,3.9,-.34,'#ffc0e8',-8.3);kry(sx+5,.7,3.6,.12,'#9fe8ff',-8.6);kry(sx+6,.6,2.5,-.3,c,-8.3);
    for(const[x,w]of[[sx-4.7,2.2],[sx+.7,3],[sx+5.5,1.9]])P2(g,toCCW(sm([[x-w,y0,1],[x+w,y0,1],[x+w*.6,y0+.8],[x-w*.6,y0+.9]],4)),{color:'#5a4a6a',kind:'kraft',t:1.6},-8.2);T.glow(sx+.6,y0+3.4,-6.6,c,10)}
  if(v==='planter'){pot(sx-5,1.5,1.9,c);for(let k=0;k<7;k++){const a=.35+k/6*2.45;P2(g,leaf(sx-5,y0+1.8,3.4+(k%2)*.9,.7,a),{color:k%2?'#4f9a5a':'#3f7a4a',kind:'water',t:.1},-8.3+k*.02)}
    for(const[dx,dy]of[[-2,3.8],[.2,5],[2,3.6]]){P2(g,circ(sx-5+dx,y0+dy,.5,.5,12),{t:.2,mat:tis('#d8fff0',1.5,'#6fe0b0')},-8)}T.glow(sx-5,y0+4.4,-7,'#6fe0b0',7);
    pot(sx,1.2,1.6,'#6a4e8a');for(const s of thick([[[sx,y0+1.6],[sx,y0+4.4]]],.14))P2(g,s,{color:'#3f7a4a',t:.1},-8);P2(g,moonS(sx-.2,y0+5.2,1.3),{t:.2,mat:tis('#fff6c0',1.4,'#ffe070')},-7.9);T.glow(sx,y0+5.2,-7,'#ffe070',5);
    pot(sx+5.2,1.5,1.7);for(const[dx,l]of[[-1.4,5.2],[-.2,7.4],[1.1,4.4],[2,6.4]]){const x=sx+5.2+dx,ln=curve([[x,y0+1.6],[x+.5,y0-.6],[x-.3,y0-l*.5],[x+.3,y0-l]],6);for(const s of thick([ln],.1))P2(g,s,{color:'#3f7a4a',t:.08},-5.9);
      for(let i=6;i<ln.length;i+=5)P2(g,leaf(ln[i][0],ln[i][1],1,.36,i%2?-.4:Math.PI+.4),{color:i%3?'#5aa866':'#4f9a5a',kind:'water',t:.08},-5.8)}}
  if(v==='bamser'){const bear=(x,s,q,z,bow)=>{const m=lt(q,.45),e='#2a1c14',D=(cx,cy,r,col,zz,ry=r)=>P2(g,circ(x+cx*s,y0+cy*s,r*s,ry*s,22),{color:col,kind:'water',t:.25},z+zz);
      D(-.95,4.75,.5,q,0);D(.95,4.75,.5,q,0);D(-.95,4.75,.26,m,.26);D(.95,4.75,.26,m,.26);D(0,1.55,1.5,q,.05,1.55);D(-1.15,.5,.62,q,.34);D(1.15,.5,.62,q,.34);D(-1.15,.5,.34,m,.6);D(1.15,.5,.34,m,.6);D(-1.5,2.1,.5,q,.34);D(1.5,2.1,.5,q,.34);D(0,1.4,.82,m,.34,.9);
      D(0,3.7,1.3,q,.4);D(0,3.4,.56,m,.68,.46);D(-.5,3.95,.13,e,.7);D(.5,3.95,.13,e,.7);D(0,3.56,.17,e,.94,.12);
      if(bow){for(const d of[-1,1])P2(g,toCCW([[x,y0+2.62*s],[x+d*.9*s,y0+3.02*s],[x+d*.9*s,y0+2.22*s]]),{color:bow,kind:'water',t:.1},z+.98);P2(g,circ(x,y0+2.62*s,.2*s,.2*s,10),{color:dk(bow,-.25),kind:'water',t:.1},z+1.1)}};
    bear(sx-4.6,1.02,'#a8703c',-9,c);bear(sx+.2,1.22,c,-9,'#f2c230');bear(sx+4.9,.86,'#efe0c0',-9,'#e0457a')}
  if(v==='ure'){const gear=(x,y,r,n,z,rt=0)=>{const p=[];for(let i=0;i<n*4;i++){const a=i/(n*4)*TAU+rt,rr=(i%4<2)?r:r*.8;p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}for(const s of clip([toCCW(p)],[circ(x,y,r*.28,r*.28,14)],'diff'))P2(g,s,{mat:gold(),t:.3},z)};
    gear(sx-6,y0+1.5,1.5,9,-8.9,.1);gear(sx-4.3,y0+3.3,1.05,7,-8.5,.3);
    const kx=sx,cs=arch(kx,y0,5.4,6.2,20);P2(g,cs,{t:2,s:26,paint:P=>{P.wash('#7a5230',cs,{top:'#96693c',edge:.6,clouds:4});P.score([[kx-2.3,y0+.6],[kx+2.3,y0+.6]],{w:.12,ink:.4,dark:'#2a1408'})}},-9);
    const face=circ(kx,y0+3.4,1.95,1.95,32);for(const s of ring(face,.3))P2(g,s,{mat:gold(),t:.2},-6.95);P2(g,face,{t:.1,s:60,paint:P=>{P.wash('#fbf3dc',face,{edge:.5,clouds:3});for(let k=0;k<12;k++){const a=k/12*TAU;P.pen([[kx+Math.cos(a)*1.5,y0+3.4+Math.sin(a)*1.5],[kx+Math.cos(a)*1.78,y0+3.4+Math.sin(a)*1.78]],'#3a2a1c',k%3?.05:.1,.9)}P.pen([[kx,y0+3.4],[kx+.2,y0+4.75]],'#2a1c14',.13,1);P.pen([[kx,y0+3.4],[kx+.95,y0+2.9]],'#2a1c14',.13,1);P.fill(circ(kx,y0+3.4,.16,.16,8),c,1)}},-6.98);
    const ax=sx+5.3,af=circ(ax,y0+1.8,1.45,1.45,28);for(const d of[-1,1]){P2(g,circ(ax+d*.95,y0+3.2,.55,.55,14),{mat:gold(),t:.4},-8.7);P2(g,toCCW([[ax+d*.5,y0+.6],[ax+d*1.2,y0],[ax+d*1.5,y0+.2]]),{mat:gold(),t:.3},-8.7)}
    P2(g,grow(af,.3)[0].outer,{color:c,kind:'water',t:.9},-8.6);P2(g,af,{t:.1,s:60,paint:P=>{P.wash('#fbf3dc',af,{edge:.5,clouds:3});for(let k=0;k<12;k++){const a=k/12*TAU;P.fill(circ(ax+Math.cos(a)*1.12,y0+1.8+Math.sin(a)*1.12,.07,.07,6),'#3a2a1c',.9)}P.pen([[ax,y0+1.8],[ax-.5,y0+2.6]],'#2a1c14',.11,1);P.pen([[ax,y0+1.8],[ax+.75,y0+1.8]],'#2a1c14',.11,1)}},-7.68)}
  if(v==='kugler'){const ball=(x,r,q)=>{P2(g,toCCW([[x-r*.75,y0],[x+r*.75,y0],[x+r*.5,y0+r*.5],[x-r*.5,y0+r*.5]]),{mat:gold(),t:1.2},-8.8);P2(g,circ(x,y0+r*1.36,r,r,32),{t:.5,mat:tis(lt(q,.15),.7,q)},-8.5);
      P2(g,rot(circ(x-r*.36,y0+r*1.76,r*.3,r*.16,14),x-r*.36,y0+r*1.76,.6),{t:.05,mat:tis('#ffffff',1.2)},-7.95);P2(g,starPts(x+r*.2,y0+r*1.2,r*.3,r*.13),{t:.05,mat:tis('#ffffff',1.4)},-7.95);T.glow(x,y0+r*1.36,-7,q,r*3.4)};
    ball(sx-4.8,1.5,'#9fd8ff');ball(sx,2.1,c);ball(sx+5,1.25,'#ff9ac0')}
  if(v==='testel'){const por=(sh,paint,z=-8.7,t=1)=>P2(g,sh,{t,s:40,paint:P=>{P.wash('#fbf6ec',sh,{edge:.6,clouds:3});paint&&paint(P)}},z),tx=sx-3.4;
    for(const s of ring(circ(tx-2.9,y0+2,1.1,1.2,18),.3))P2(g,s,{color:'#f3ecdc',kind:'water',t:.5},-8.6);
    por(toCCW(sm([[tx+1.6,y0+1.2],[tx+3.2,y0+2.2],[tx+3.9,y0+3.6,1],[tx+3.3,y0+3.7,1],[tx+2.6,y0+2.8],[tx+1.6,y0+2.4]],4)),null,-8.75,.6);
    por(circ(tx,y0+1.9,2.5,1.9,32),P=>{P.fill(box(tx-3,y0+1.5,tx+3,y0+2.2),c,.8);for(let k=-2;k<=2;k++)P.fill(circ(tx+k*.95,y0+1.85,.16,.16,8),'#fff6d0',.95)});
    por(circ(tx,y0+3.75,1.3,.42,20),null,-8.5,.8);P2(g,circ(tx,y0+4.3,.34,.34,12),{color:c,kind:'water',t:.6},-8.4);
    const cup=(x,z)=>{P2(g,box(x-1.5,y0,x+1.5,y0+.28),{color:'#f3ecdc',kind:'water',t:1.6},z-.3);for(const s of ring(circ(x+1.15,y0+1.25,.52,.56,14),.2))P2(g,s,{color:'#f3ecdc',kind:'water',t:.3},z+.2);
      por(toCCW(sm([[x-1.1,y0+2.1,1],[x+1.1,y0+2.1,1],[x+.9,y0+.9],[x+.5,y0+.3,1],[x-.5,y0+.3,1],[x-.9,y0+.9]],4)),P=>{P.fill(box(x-1.3,y0+1.5,x+1.3,y0+1.85),c,.8)},z,.8)};
    cup(sx+2.3,-8.6);cup(sx+5.7,-8.3);
    for(const s of thick([curve([[sx+2.1,y0+2.5],[sx+1.8,y0+3.3],[sx+2.4,y0+4],[sx+2,y0+4.8]],6)],.09))P2(g,s,{t:.04,mat:tis('#ffffff',.5)},-8.2)}
  if(v==='muslinger'){const skal=(x,y,r,q,a,z)=>{const p=[[x,y]];for(let i=0;i<=24;i++){const u=i/24,b=Math.PI*(.1+.8*u);p.push([x+Math.cos(b)*r*(1+.07*Math.abs(Math.sin(u*Math.PI*6))),y+Math.sin(b)*r*(1+.07*Math.abs(Math.sin(u*Math.PI*6)))])}const sh=toCCW(rot(p,x,y,a));
      P2(g,sh,{t:.5,s:40,paint:P=>{P.wash(q,sh,{top:lt(q,.3),edge:.7,clouds:3});for(let i=1;i<6;i++){const b=Math.PI*(.1+.8*i/6)+a;P.pen([[x,y],[x+Math.cos(b)*r*.98,y+Math.sin(b)*r*.98]],dk(q,-.3),.07,.6)}}},z)};
    skal(sx-4.6,y0+.1,3.3,lt(c,.45),.12,-8.9);skal(sx-1.2,y0+.1,2.2,'#f6d8c8',-.2,-8.5);
    const sf=toCCW(rot(starPts(sx+2.8,y0+1.7,1.9,.8).map(p=>p),sx+2.8,y0+1.7,.3));P2(g,sf,{t:.4,s:40,paint:P=>{P.wash('#e8885a',sf,{top:'#f2a878',edge:.7,clouds:3});for(let k=0;k<5;k++){const a=Math.PI/2+.3+k/5*TAU;for(const u of[.25,.5,.75])P.fill(circ(sx+2.8+Math.cos(a)*1.7*u,y0+1.7+Math.sin(a)*1.7*u,.1,.1,6),'#fff0d8',.9)}}},-8.6);
    for(const[dx,w,h,q]of[[5,1.1,.7,'#8a94a8'],[6.6,.8,.55,c],[5.7,.7,.45,'#d8c8b0']])P2(g,circ(sx+dx,y0+h,w,h,18),{color:q,kind:'water',t:1},-8.4+dx*.05);
    P2(g,circ(sx-1,y0+.75,.5,.5,14),{t:.3,mat:tis('#fff4f8',.45,'#ffe8f4')},-7.7)}
  if(v==='pokaler'){const pok=(x,s,z)=>{P2(g,box(x-.9*s,y0,x+.9*s,y0+.5*s),{color:'#4a2e1c',kind:'balsa',t:1.2},z);P2(g,toCCW([[x-.24*s,y0+.5*s],[x+.24*s,y0+.5*s],[x+.34*s,y0+1.5*s],[x-.34*s,y0+1.5*s]]),{mat:gold(),t:.6},z+.2);
      for(const d of[-1,1])for(const sh of ring(circ(x+d*1.2*s,y0+2.9*s,.55*s,.7*s,16),.16*s))P2(g,sh,{mat:gold(),t:.2},z+.3);
      P2(g,toCCW(sm([[x-1.25*s,y0+3.8*s,1],[x+1.25*s,y0+3.8*s,1],[x+1.1*s,y0+2.4*s],[x+.4*s,y0+1.45*s,1],[x-.4*s,y0+1.45*s,1],[x-1.1*s,y0+2.4*s]],5)),{mat:gold(),t:.8},z+.2);P2(g,starPts(x,y0+2.9*s,.5*s,.21*s),{color:'#fff6d0',kind:'water',t:.06},z+1.02)};
    pok(sx-4.7,1.05,-8.9);pok(sx,1.5,-8.9);pok(sx+4.3,.85,-8.9);
    const mx=sx+6.9;for(const d of[-1,1])P2(g,toCCW([[mx+d*.9,sy-.5],[mx+d*.25,sy-.5],[mx+d*.05-.3,sy-3.1],[mx+d*.05+.3,sy-3.1]]),{color:d<0?c:lt(c,.25),kind:'water',t:.1},-6.1);P2(g,circ(mx,sy-3.7,.95,.95,22),{mat:gold(),t:.2},-6);P2(g,starPts(mx,sy-3.7,.55,.23),{color:'#fff6d0',kind:'water',t:.05},-5.78)}};

/* ---------- lampen ---------- */
VAER.lampe=(g,v,c,T)=>{const x=11,I='#2e2833',cord=y=>{for(const s of thick([[[x,62],[x,y]]],.12))P2(g,s,{color:I,t:.1},-6)},
    flame=(fx,fy,s=1,z=-5.9)=>P2(g,toCCW(sm([[fx,fy,1],[fx+.55*s,fy+.8*s],[fx,fy+2.1*s,1],[fx-.55*s,fy+.8*s]],5)),{t:.1,mat:tis('#fff6d0',1.7,c)},z);
  let lx=x,ly=37,li=90;
  if(v==='lys'){for(const[cx,cy,h]of[[x-5.2,38.4,3.4],[x,35.6,4.2],[x+5.4,39.6,3]]){const sh=box(cx-.55,cy,cx+.55,cy+h);P2(g,sh,{t:.9,s:30,paint:P=>{P.wash('#f6efdc',sh,{edge:.5,clouds:2});P.fill(sm([[cx-.6,cy+h+.1],[cx+.6,cy+h+.1],[cx+.5,cy+h-.5],[cx+.2,cy+h-1.3],[cx-.1,cy+h-.5],[cx-.45,cy+h-.9]],4),'#ffffff',.8)}},-6.4);
      for(const s of thick([[[cx,cy+h],[cx,cy+h+.4]]],.06))P2(g,s,{color:I,t:.05},-6);flame(cx,cy+h+.35,.9);T.glow(cx,cy+h+1.2,-5,c,8,true)}ly=40}
  if(v==='stjernelampe'){cord(46.4);for(const s of thick([curve([[x-6.4,43.4],[x-3.4,45.6],[x,46.4],[x+3.4,45.6],[x+6.4,43.4]],6),[[x-6.4,43.4],[x-6.4,41.6]],[[x+6.4,43.4],[x+6.4,41.6]],[[x,46.4],[x,41]]],.2))P2(g,s,{color:I,t:.3},-6.1);
    for(const[dx,cy,r]of[[-6.4,39.6,2.2],[0,37.8,3.3],[6.4,39.6,2.2]]){P2(g,starPts(x+dx,cy,r,r*.45),{t:.5,mat:tis('#fff0b0',1.5,c)},-6.2);T.glow(x+dx,cy,-5,c,r*3.6)}for(const dx of[-6.4,6.4])P2(g,circ(x+dx,43.4,.42,.42,10),{mat:gold(),t:.4},-6);ly=38}
  if(v==='maanelampe'){cord(42);for(const s of clip([circ(x,39,3.5,3.5,36)],[circ(x+1.7,39.9,3,3,32)],'diff'))P2(g,s,{t:.5,mat:tis('#f2f6ff',1.5,c)},-6.2);
    for(const[dx,dy,r]of[[2.6,37.2,.6],[3.6,40.4,.42]]){for(const s of thick([[[x+dx,dy+r],[x+dx,43.2]]],.05))P2(g,s,{color:I,t:.04},-6);P2(g,starPts(x+dx,dy,r,r*.44),{t:.2,mat:tis('#fff6d0',1.4,c)},-6.1)}for(const s of thick([[[x-1,43.2],[x+4.2,43.2]],[[x,42],[x,43.2]]],.1))P2(g,s,{color:I,t:.1},-6);T.glow(x,38.6,-5,c,13)}
  if(v==='lyskaede'){const xa=-13,xb=43,f=u=>[xa+(xb-xa)*u,44.6-4.2*Math.sin(u*Math.PI)],ln=[];for(let i=0;i<=40;i++)ln.push(f(i/40));for(const s of thick([ln],.09))P2(g,s,{color:I,t:.08},-8.9);
    const cols=[c,'#ffd870','#ff8fb0','#7fe0c0','#8ab8ff'];for(let i=0;i<10;i++){const[bx,by]=f((i+.5)/10),q=cols[i%cols.length];P2(g,box(bx-.22,by-.5,bx+.22,by),{color:I,t:.3},-8.9);P2(g,circ(bx,by-1.2,.62,.82,16),{t:.4,mat:tis(lt(q,.3),1.6,q)},-8.9);T.glow(bx,by-1.2,-8,q,5)}lx=15;ly=40;li=70}
  if(v==='olie'){cord(45);for(const s of ring(circ(x,44.2,1,1,18),.16))P2(g,s,{mat:gold(),t:.2},-6);P2(g,toCCW([[x-1.6,42.2],[x+1.6,42.2],[x+.7,43.3],[x-.7,43.3]]),{mat:gold(),t:1},-6.4);
    P2(g,toCCW(sm([[x-1.5,36.4,1],[x+1.5,36.4,1],[x+2.3,39],[x+1.2,42.2,1],[x-1.2,42.2,1],[x-2.3,39]],6)),{t:.8,mat:tis('#fdf6e4',.6,c)},-6.3);flame(x,36.9,1.25,-5.4);
    for(const d of[-1,1])for(const s of thick([curve([[x+d*2.5,36],[x+d*3.1,39.2],[x+d*1.5,42.6]],6)],.09))P2(g,s,{mat:gold(),t:.1},-5.4);
    P2(g,toCCW([[x-2.6,34.6],[x+2.6,34.6],[x+1.8,36.4],[x-1.8,36.4]]),{mat:gold(),t:1.4},-6.6);P2(g,circ(x,34.2,.6,.6,14),{mat:gold(),t:.8},-6.3);T.glow(x,38.6,-4.6,c,12,true)}
  if(v==='papir'){cord(42);const l=circ(x,38.4,3.3,3.8,32);P2(g,l,{t:.5,mat:tis(lt(c,.2),1.3,c)},-6.2);for(const dx of[-2,-1,0,1,2])for(const s of thick([curve([[x+dx*.2,42],[x+dx*1.4,38.4],[x+dx*.2,34.8]],8)],.07))P2(g,s,{color:dk(c,-.45),t:.05},-5.6);
    for(const y of[42.1,34.6])P2(g,box(x-1.1,y-.35,x+1.1,y+.35),{mat:gold(),t:.7},-6.3);for(const s of thick([[[x,34.2],[x,32.2]]],.08))P2(g,s,{color:'#c2452d',t:.06},-6);T.glow(x,38.6,-5,c,13)}
  if(v==='ildfluer'){cord(43.2);P2(g,box(x-2,42.2,x+2,43.2),{color:'#b8864e',kind:'kraft',t:1.4},-6.6);const jar=toCCW(sm([[x-2.5,34.4],[x+2.5,34.4],[x+2.9,36],[x+2.9,40.4],[x+1.9,42.2,1],[x-1.9,42.2,1],[x-2.9,40.4],[x-2.9,36]],5));P2(g,jar,{t:1,mat:tis('#eafff6',.35,c)},-6.4);
    for(const[dx,dy]of[[-1.4,36.2],[1.2,37.4],[-.4,39.2],[1.6,40.4],[-1.7,40.2],[.3,35.6]]){P2(g,circ(x+dx,dy,.26,.26,10),{t:.1,mat:tis('#fffbd0',2,c)},-5.3);T.glow(x+dx,dy,-4.8,c,3.2,true)}
    for(const[dx,dy,a]of[[-1.1,37.8,.4],[.9,38.6,2.6]])P2(g,leaf(x+dx,dy,1.1,.3,a),{color:'#4f9a5a',kind:'water',t:.05},-5.32);T.glow(x,38.2,-4.6,c,9)}
  if(v==='planet'){cord(42);const pc=circ(x,38.4,3.4,3.4,36),rg=(a,b)=>rot(circ(x,38.4,a,b,44),x,38.4,-.32),R1=clip([rg(6.2,1.7)],[rg(4.7,.95)],'diff');
    for(const s of R1)P2(g,s,{mat:gold(),t:.12},-6.6);P2(g,pc,{t:.5,mat:tis(lt(c,.25),1.2,c)},-6.3);
    for(const[y,h]of[[39.6,.5],[37.6,.7],[36.2,.3]])for(const s of clip([rot(box(x-4,y,x+4,y+h),x,38.4,-.32)],[pc],'inter'))P2(g,s,{t:.05,mat:tis(dk(c,-.18),.8,c)},-5.78);
    for(const s of clip(clip([rg(6.2,1.7)],[rot(box(x-8,30,x+8,38.4),x,38.4,-.32)],'inter').map(s=>s.outer),[rg(4.7,.95)],'diff'))P2(g,s,{mat:gold(),t:.12},-5.6);T.glow(x,38.4,-5,c,13)}
  if(v==='kuppel'){for(const s of thick([[[x,62],[x,44]]],.2))P2(g,s,{mat:gold(),t:.3},-6.2);P2(g,toCCW([[x-1.2,43],[x+1.2,43],[x+.5,44.4],[x-.5,44.4]]),{mat:gold(),t:.9},-6.5);
    const dm=[[x-3.7,36.2],[x+3.7,36.2]];for(let i=1;i<24;i++){const a=i/24*Math.PI;dm.push([x+Math.cos(a)*3.7,36.2+Math.sin(a)*6.9])}P2(g,dm,{t:.8,mat:tis('#f4fbff',.55,c)},-6.4);
    P2(g,box(x-4.3,35.4,x+4.3,36.2),{mat:gold(),t:1.6},-6.8);P2(g,box(x-.5,36.2,x+.5,37),{mat:gold(),t:.6},-5.9);flame(x,37,1.4,-5.5);P2(g,toCCW([[x-1.4,35.4],[x+1.4,35.4],[x,34]]),{mat:gold(),t:.8},-6.4);T.glow(x,38.6,-4.6,c,12,true)}
  if(v==='sky'){cord(41.6);P2(g,cloud(x,36.4,11,6),{t:.8,mat:tis('#ffffff',1.25,c)},-6.3);
    for(const[dx,l,r]of[[-3,3.2,.7],[0,4.6,.9],[3.1,2.6,.6]]){for(const s of thick([[[x+dx,36.4],[x+dx,36.4-l]]],.05))P2(g,s,{color:'#e8dcc0',t:.04},-6);P2(g,starPts(x+dx,36.4-l-r,r,r*.44),{t:.2,mat:tis('#fff6d0',1.4,c)},-6.05)}T.glow(x,38.6,-5,c,14)}
  const L=new THREE.PointLight(c,li,70,2);put(g,L,lx,ly,4)};
}
