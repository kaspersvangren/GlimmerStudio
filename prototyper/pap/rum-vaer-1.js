/* ============ Værelsets ting, del 1: fælles værktøj, væggen, vinduet og sengen ============
   Hver ting bygges af VAER.<plads>(g, variant, farve, T): g er gruppen den skal ligge i, T giver rummet og lysskær. */
const VAER={};
const VRK={
  P2:(g,shape,o,z)=>put(g,piece(shape,o),0,0,z),
  lt:(c,k=.2)=>hexOf(shade(hexOf(c),k)),dk:(c,k=-.3)=>hexOf(shade(hexOf(c),k)),
  heart:(x,y,s,n=30)=>{const o=[];for(let i=0;i<n;i++){const t=i/n*TAU;o.push([x+s*16*Math.pow(Math.sin(t),3)/17,y+s*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17])}return toCCW(o)},
  /* en sky med flad bund: bredde w og højde h, bunden ligger i y */
  cloud:(x,y,w,h)=>clip([circ(x-w*.27,y+h*.36,w*.23,h*.36,20),circ(x,y+h*.5,w*.28,h*.5,24),circ(x+w*.27,y+h*.34,w*.23,h*.34,20),box(x-w*.44,y,x+w*.44,y+h*.36)],[],'union')[0].outer,
  moonS:(x,y,r,k=.5)=>clip([circ(x,y,r,r,44)],[circ(x+r*k,y+r*.22,r*.86,r*.86,40)],'diff')[0].outer,
  rot:(pts,cx,cy,a)=>{const c=Math.cos(a),s=Math.sin(a);return pts.map(([x,y])=>[cx+(x-cx)*c-(y-cy)*s,cy+(x-cx)*s+(y-cy)*c])},
  leaf:(x,y,l,w,a)=>{const c=Math.cos(a),s=Math.sin(a),o=[];for(let i=0;i<=8;i++){const u=i/8;o.push([u*l,Math.sin(u*Math.PI)*w])}for(let i=7;i>0;i--){const u=i/8;o.push([u*l,-Math.sin(u*Math.PI)*w])}return toCCW(o.map(([px,py])=>[x+px*c-py*s,y+px*s+py*c]))},
  tis:(col,gi=1,glow=col)=>paperMat(col,'tissue',{glow,gi}),
  /* en vimpelsnor */
  bunt:(g,c,y,x0,x1,n=7,z=-9.2)=>{const{P2,lt}=VRK,f=u=>[x0+(x1-x0)*u,y-2.2*Math.sin(u*Math.PI)],line=[];for(let i=0;i<=16;i++)line.push(f(i/16));
    for(const s of thick([line],.1))P2(g,s,{color:'#e8dcc0',t:.06},z);
    for(let i=0;i<n;i++){const[x,yy]=f((i+.5)/n),w=(x1-x0)/n*.42;P2(g,toCCW([[x-w,yy+.1],[x+w,yy+.1],[x,yy-2.6]]),{color:i%2?lt(c,.4):c,kind:'water',t:.08},z+.08)}},
  /* frynser i enden af et tæppe: små strimler på gulvet */
  GULD:'#c9a04a'};
{const{P2,lt,dk,heart,cloud,moonS,rot,leaf,tis,bunt,GULD}=VRK;

/* ---------- væggen ---------- */
VAER.vaeg=(g,v,c)=>{const W=box(-72,-2,72,62),c2=dk(c,-.28),l=lt(c,.22);
  P2(g,W,{t:.5,s:9,cap:1800,paint:P=>{
    if(v==='panel'){boards(P,W,'#8a5e3c',{h:5.2,dir:'v',ink:.3});P.wash(c,W,{alpha:.3,edge:0,clouds:8})}
    else if(v==='mursten'){P.wash('#9a94a6',W,{edge:0,clouds:14});P.ashlar(W,'#9a94a6',{rowH:[3.4,4.4],bw:[6,11],tint:.12,ink:.32});P.wash(c,W,{alpha:.5,edge:0,clouds:10})}
    else P.wash(c,W,{top:c2,edge:0,clouds:14});
    const grid=(dx,dy,f)=>{let r=0;for(let y=14;y<62;y+=dy,r++)for(let x=-72+(r%2?dx/2:0);x<72;x+=dx)f(x,y,r)};
    if(v==='stjerner')grid(5,5,(x,y)=>P.fill(starPts(x,y,.55,.22,.3),GULD,.5));
    if(v==='striber'){for(let x=-72;x<72;x+=6)P.fill(box(x,11,x+2.6,62),l,.3);for(let y=15;y<62;y+=6)for(let x=-69.7;x<72;x+=6)P.fill(circ(x+1,y,.28,.28,8),'#e8d9a0',.6)}
    if(v==='maaner')grid(7,7,(x,y)=>{P.fill(circ(x,y,1,1,16),'#e8c86a',.6);P.fill(circ(x+.5,y+.25,.86,.86,16),c,1)});
    if(v==='skyer')grid(13,8,(x,y)=>{for(const[dx,dy,r]of[[-1.5,0,1.3],[0,.5,1.7],[1.6,0,1.2],[0,-.3,1.5]])P.fill(circ(x+dx,y+dy,r,r*.72,14),'#f1ecff',.3)});
    if(v==='blomster')grid(8,7,(x,y,r)=>{const pc=r%2?'#ff9ac8':'#ffd0e4';for(let k=0;k<5;k++){const a=k/5*TAU+.3;P.fill(circ(x+Math.cos(a)*.72,y+Math.sin(a)*.72,.5,.5,10),pc,.6)}P.fill(circ(x,y,.36,.36,10),'#f2c230',.85)});
    if(v==='prikker')grid(4.4,4.4,(x,y)=>P.fill(circ(x,y,.5,.5,12),l,.55));
    if(v==='hjerter')grid(7,6.4,(x,y,r)=>P.fill(heart(x,y,1.15,20),r%2?'#ff8fb0':'#e86a8a',.6));
    if(v==='rombe'){for(let y=12;y<66;y+=8)for(let x=-72;x<74;x+=6){P.fill([[x,y-4],[x+3,y],[x,y+4],[x-3,y]],l,.34);P.fill(circ(x+3,y,.3,.3,8),GULD,.7);P.fill(circ(x,y+4,.3,.3,8),GULD,.7)}}
    /* brystpanelet forneden */
    P.wash('#4a2e1c',box(-73,-3,73,11),{alpha:.97,edge:0,mode:'source-over',clouds:6});for(let x=-72;x<72;x+=7)P.score([...box(x+.6,1,x+6.4,9.4),[x+.6,1]],{w:.12,ink:.4,dark:'#1a0c06'})}},-10);
  P2(g,box(-72,10.4,72,11.6),{color:'#6a4426',kind:'balsa',t:.6},-9.6);
  /* loftsbjælken, og væggen videre op i mørket: ses kun på en høj skærm */
  P2(g,box(-72,61.5,72,140),{color:dk(c2,-.25),kind:'water',t:.4},-10.1);P2(g,box(-72,60.2,72,63.6),{color:'#4a2e1c',kind:'balsa',t:1.4},-9.9)};

/* ---------- vinduet ---------- */
const WX=-27,WY=25;
const win=(g,sh,o={})=>{const fr=o.fr||'#6a4426';P2(g,grow(sh,1.1,false)[0].outer,{color:fr,kind:'balsa',t:.6},-9.5);
  if(!o.glas){P2(g,sh,{t:.1,s:24,base:'water',paint:P=>{P.wash('#1a2456',sh,{top:'#101638',edge:0,clouds:8});for(let i=0;i<60;i++)P.fill(circ(R(WX-9,WX+9),R(WY+1,WY+19),R(.06,.14),R(.06,.14),6),'#f6e7c0',R(.5,.95));P.wash('#3a3a6a',box(WX-10,WY-1,WX+10,WY+3.4),{alpha:.7,edge:0,mode:'source-over'})}},-9.1);
    P2(g,circ(WX+2.2,WY+11,1.9,1.9,32),{t:.04,mat:tis('#fff6d8',1.3,'#ffe9a0')},-8.95)}
  for(const s of clip(o.bars||[box(WX-.25,WY-2,WX+.25,WY+21),box(WX-10,WY+7.8,WX+10,WY+8.3)],[sh],'inter'))P2(g,s,{color:fr,kind:'balsa',t:.3},-8.8);
  if(o.sill!==false)P2(g,box(WX-7.4,WY-1.4,WX+7.4,WY-.3),{color:'#7a5230',kind:'balsa',t:1.6},-8.8)};
const curt=(g,c,o={})=>{const c1=lt(c,.2),cd=dk(c,-.4);
  for(const s of[-1,1]){const cu=toCCW([[WX+s*8.8,WY+17.3],[WX+s*4.6,WY+17.3],[WX+s*5.8,WY+11.4],[WX+s*7.4,WY+6.4],[WX+s*6.2,WY-.8],[WX+s*9.4,WY-1.6]]);
    P2(g,cu,{t:.15,s:20,paint:P=>{P.wash(c,cu,{top:c1,edge:.6,clouds:5});for(let k=0;k<3;k++)P.score([[WX+s*(5.4+k),WY+17],[WX+s*(6.8+k*.6),WY]],{w:.09,ink:.35,dark:cd});if(o.stars)for(let i=0;i<8;i++)P.fill(starPts(WX+s*R(5.6,8.4),R(WY+1,WY+16),.4,.17,R(1)),'#fff6d0',.85)}},-8.4);
    P2(g,box(WX+s*7.2-.9,WY+6,WX+s*7.2+.9,WY+6.6),{mat:gold(),t:.2},-8.2)}
  P2(g,box(WX-10,WY+17,WX+10,WY+17.9),{mat:gold(),t:.5},-8.3)};
VAER.vindue=(g,v,c)=>{const A=arch(WX,WY,11,16,24),RECT=box(WX-5.6,WY,WX+5.6,WY+16.4);
  if(v==='gardiner'){win(g,A);curt(g,c)}
  if(v==='stjernegardiner'){win(g,A);curt(g,c,{stars:1})}
  if(v==='rundt'){const sh=circ(WX,WY+8.5,7.6,7.6,48);win(g,sh,{sill:false,bars:[box(WX-.25,WY,WX+.25,WY+17),box(WX-8,WY+8.25,WX+8,WY+8.75)]});
    for(let k=0;k<8;k++){const a=k/8*TAU+.39;P2(g,circ(WX+Math.cos(a)*8.15,WY+8.5+Math.sin(a)*8.15,.42,.42,10),{mat:gold(),t:.3},-9)}
    bunt(g,c,WY+20.6,WX-11,WX+11)}
  if(v==='farvet'){win(g,A,{glas:1,bars:[]});const cols=[c,'#e8b840','#3fa8a0','#e0608a','#5a7ae0','#8ad070'],cx=WX,cy=WY+6.5,n=10;
    for(let k=0;k<n;k++){const a0=k/n*TAU+.16,a1=(k+1)/n*TAU+.16,q=cols[k%cols.length],w=[[cx,cy],[cx+Math.cos(a0)*30,cy+Math.sin(a0)*30],[cx+Math.cos(a1)*30,cy+Math.sin(a1)*30]];
      for(const s of clip([w],[A],'inter'))P2(g,s,{t:.1,mat:tis(q,.6)},-9.1);
      for(const s of clip(thick([[[cx,cy],[cx+Math.cos(a0)*30,cy+Math.sin(a0)*30]]],.2).map(s=>s.outer),[A],'inter'))P2(g,s,{color:'#2e2833',t:.12},-8.95)}
    for(const s of ring(circ(cx,cy,2.3,2.3,28),.32))P2(g,s,{color:'#2e2833',t:.14},-8.9);
    P2(g,circ(cx,cy,2.3,2.3,28),{t:.1,mat:tis('#fff0b0',1.1,'#ffe070')},-8.92);P2(g,starPts(cx,cy,1.5,.64),{color:'#e8a020',kind:'water',t:.06},-8.8)}
  if(v==='blonder'){win(g,A);const L=lt(c,.72);
    for(const s of[-1,1]){const pts=[[WX+s*.5,WY+17.3,1],[WX+s*9,WY+17.3,1]];for(let i=0;i<=8;i++)pts.push([WX+s*(9-8.5*i/8),WY+7+(i%2?1.2:0)]);const sh=toCCW(sm(pts,4));
      P2(g,sh,{t:.12,s:22,paint:P=>{P.wash(L,sh,{edge:.5,clouds:4});for(let y=WY+8.6;y<WY+17;y+=1.3)for(let x=.9+((y*10|0)%2?.65:0);x<9;x+=1.3)P.fill(circ(WX+s*x,y,.2,.2,8),c,.5);
        for(let i=0;i<8;i++)P.pen(curve([[WX+s*(9-8.5*i/8),WY+8.4],[WX+s*(9-8.5*(i+.5)/8),WY+9.3],[WX+s*(9-8.5*(i+1)/8),WY+8.4]],5),c,.1,.6)}},-8.4)}
    P2(g,box(WX-10,WY+17,WX+10,WY+17.9),{mat:gold(),t:.5},-8.3)}
  if(v==='rullegardin'){win(g,RECT,{bars:[box(WX-.25,WY-2,WX+.25,WY+21),box(WX-10,WY+5.4,WX+10,WY+5.9)]});
    const pts=[[WX-6.3,WY+17.2,1],[WX+6.3,WY+17.2,1],[WX+6.3,WY+10,1]];for(let i=1;i<10;i++)pts.push([WX+6.3-12.6*i/10,WY+10-(i%2?1:0)]);pts.push([WX-6.3,WY+10,1]);const sh=toCCW(sm(pts,4));
    P2(g,sh,{t:.15,s:22,paint:P=>{P.wash(c,sh,{top:lt(c,.2),edge:.5,clouds:5});for(let x=WX-5;x<WX+6;x+=2.5)P.fill(box(x,WY+10.6,x+1,WY+17.2),lt(c,.3),.4);P.pen([[WX-6.3,WY+10.9],[WX+6.3,WY+10.9]],dk(c,-.35),.12,.7)}},-8.5);
    P2(g,box(WX-7.2,WY+16.9,WX+7.2,WY+18),{mat:gold(),t:.9},-8.6);for(const s of thick([[[WX+3.2,WY+9.4],[WX+3.2,WY+6.8]]],.07))P2(g,s,{color:'#e8dcc0',t:.06},-8.3);for(const s of ring(circ(WX+3.2,WY+6.2,.55,.55,16),.18))P2(g,s,{mat:gold(),t:.12},-8.3)}
  if(v==='skodder'){win(g,RECT);
    for(const s of[-1,1]){const xa=WX+s*6.9,xb=WX+s*11.9,sh=box(Math.min(xa,xb),WY-.6,Math.max(xa,xb),WY+17.2),mx=(xa+xb)/2;
      P2(g,sh,{t:.5,s:22,paint:P=>{P.wash(c,sh,{top:lt(c,.15),edge:.5,clouds:4});for(const[y0,y1]of[[WY+.4,WY+7.4],[WY+9.2,WY+16.2]]){P.score([...box(mx-1.9,y0,mx+1.9,y1),[mx-1.9,y0]],{w:.12,ink:.4,dark:dk(c,-.5)});for(let y=y0+.8;y<y1-.3;y+=.9)P.score([[mx-1.7,y],[mx+1.7,y]],{w:.08,ink:.3,dark:dk(c,-.5)})}P.fill(heart(mx,WY+8.3,.7,16),dk(c,-.55),.9)}},-9.2);
      for(const y of[WY+2.6,WY+14])P2(g,box(WX+s*6.3-.5,y-.25,WX+s*6.3+.5,y+.25),{mat:gold(),t:.2},-8.6)}}
  if(v==='blomsterkasse'){win(g,A);curt(g,c);const kb=box(WX-7.8,WY-4,WX+7.8,WY-1);
    P2(g,kb,{t:1.6,s:22,paint:P=>{boards(P,kb,'#8a5e3c',{h:1,dir:'h',ink:.3});P.fill(heart(WX,WY-2.5,.8,16),'#f6e7c0',.8)}},-8.2);
    [[-6,'#ff8fb0'],[-3.6,'#ffd060'],[-1.2,lt(c,.35)],[1.3,'#ff8fb0'],[3.7,'#ffffff'],[6,'#ffd060']].forEach(([dx,q],i)=>{const x=WX+dx,y=WY+.9+(i%2)*.9;
      for(const s of thick([[[x,WY-1],[x,y]]],.12))P2(g,s,{color:'#3f7a4a',t:.08},-7.4);P2(g,leaf(x,WY-.8,1.5,.45,i%2?.5:2.6),{color:'#4f9a5a',kind:'water',t:.08},-7.3);
      for(let k=0;k<5;k++){const a=k/5*TAU+i;P2(g,circ(x+Math.cos(a)*.62,y+Math.sin(a)*.62,.5,.5,10),{color:q,kind:'water',t:.06},-7.2+k*.012)}P2(g,circ(x,y,.36,.36,10),{color:'#e8a020',kind:'water',t:.06},-7.1)})}
  if(v==='spids'){const go=[[WX-6,WY],[WX+6,WY]];for(let i=0;i<=10;i++){const a=i/10*Math.PI/3;go.push([WX-6+12*Math.cos(a),WY+8+12*Math.sin(a)])}for(let i=9;i>=0;i--){const a=i/10*Math.PI/3;go.push([WX+6-12*Math.cos(a),WY+8+12*Math.sin(a)])}
    win(g,go,{bars:[box(WX-.25,WY-2,WX+.25,WY+21),box(WX-10,WY+7.8,WX+10,WY+8.3),...thick([curve([[WX-6,WY+8],[WX-3,WY+12.6],[WX,WY+8.2]],8),curve([[WX+6,WY+8],[WX+3,WY+12.6],[WX,WY+8.2]],8)],.2).map(s=>s.outer)]});
    bunt(g,c,WY+23.4,WX-12,WX+12)}
  if(v==='stjerne'){const sh=starPts(WX,WY+9,9.6,4.6);win(g,sh,{sill:false,fr:'#7a5230',bars:[box(WX-.25,WY-2,WX+.25,WY+21),box(WX-10,WY+8.75,WX+10,WY+9.25)]});
    for(const[dx,dy,r]of[[-10.5,16,1.3],[10,17.5,1],[-9.6,1.2,.9],[10.6,3,1.2],[0,21,.8]])P2(g,starPts(WX+dx,WY+dy,r,r*.44,dx*.1),{color:dx*dy>0?c:lt(c,.4),kind:'water',t:.1},-9.3)}};

/* ---------- sengen: hovedgærde og fodende vender mod os, sengen går på langs imellem dem ---------- */
const QUILT={
  patch:(P,xa,xb,ql,qd)=>{for(let i=0;i<4;i++)for(let j=0;j<2;j++){const px=xa+1+i*3.4,py=4.4+j*3.5;P.fill(box(px,py,px+3,py+3.1),(i+j)%2?ql:qd,.55);P.pen([[px,py],[px+3,py],[px+3,py+3.1],[px,py+3.1],[px,py]],'#f6e7c0',.06,.6)}},
  stars:(P,xa,xb)=>{for(let i=0;i<26;i++)P.fill(starPts(R(xa+1,xb-1),R(4.4,11.4),R(.35,.65),.2,R(1)),'#f2c230',.9)},
  stripes:(P,xa,xb,ql)=>{for(let x=xa+.6;x<xb;x+=2.6)P.fill(box(x,2,x+1.2,13),ql,.55)},
  clouds:(P,xa,xb)=>{for(let i=0;i<7;i++){const x=xa+1.6+i*1.9,y=i%2?9.6:5.6;for(const[dx,dy,r]of[[-.7,0,.6],[0,.25,.8],[.75,0,.55]])P.fill(circ(x+dx,y+dy,r,r*.8,12),'#ffffff',.75)}},
  flowers:(P,xa,xb)=>{for(let i=0;i<8;i++){const x=xa+1.4+i*1.65,y=i%2?9.4:5.4,pc=i%3?'#ffd0e4':'#fff3b0';for(let k=0;k<5;k++){const a=k/5*TAU+i;P.fill(circ(x+Math.cos(a)*.55,y+Math.sin(a)*.55,.4,.4,10),pc,.85)}P.fill(circ(x,y,.3,.3,10),'#f2a020',.9)}},
  waves:(P,xa,xb,ql)=>{for(let y=4.6;y<12;y+=1.9){const w=[];for(let x=xa;x<=xb+.5;x+=.9)w.push([x,y+.38*Math.sin((x-xa)*1.5+y)]);P.pen(w,ql,.16,.75)}},
  hearts:(P,xa,xb)=>{for(let i=0;i<8;i++)P.fill(heart(xa+1.4+i*1.65,i%2?9.4:5.6,.75,16),i%3?'#ffd0e4':'#ff8fb0',.85)},
  plain:(P,xa,xb,ql)=>{P.fill(box(xa-1,9.6,xb+1,10.6),ql,.6);P.fill(box(xa-1,5,xb+1,5.6),ql,.45)}};
const bed=(g,c,o)=>{const x0=-41,x1=-12,wood=o.wood||'#86593a',wl=lt(wood,.18),wd=dk(wood,-.35),ql=lt(c,.25),qd=dk(c,-.3);
  if(o.hb)o.hb(x0,wood,wl,wd);else{const hb=toCCW(sm([[x0,0,1],[x0+8.4,0,1],[x0+8.4,16.4],[x0+7,20.2],[x0+4.2,21.8],[x0+1.4,20.2],[x0,16.4]],6));
    P2(g,hb,{t:1,s:22,paint:P=>{P.wash(wood,hb,{top:wl,edge:.6,clouds:4});P.score(sm([[x0+1.2,6],[x0+7.2,6],[x0+7.2,16],[x0+4.2,19.8],[x0+1.2,16],[x0+1.2,6]],5),{w:.14,ink:.4,dark:wd});o.hbp&&o.hbp(P,x0+4.2,14)}},-7.4)}
  for(const x of[x0+8.6,x1-7.4])P2(g,box(x,0,x+1.2,6.4),{color:wd,kind:'balsa',t:1},-6.8);
  P2(g,box(x0+7,5.6,x1-4,7.4),{color:wood,kind:'balsa',t:1.4},-6.9);
  const ma=box(x0+7.4,7.2,x1-4.4,10.8);P2(g,ma,{t:1.2,s:20,paint:P=>{P.wash('#f3ecdc',ma,{edge:.5});for(let x=x0+8;x<x1-5;x+=1.6)P.pen([[x,7.3],[x,10.7]],'#d8c8e8',.1,.5)}},-6.5);
  const pil=circ(x0+13.4,12.5,4.4,2,28);P2(g,pil,{t:.8,s:30,paint:P=>{P.wash(o.pil||'#fbf6ec',pil,{edge:.6,clouds:4});P.wash('#cdbfe8',box(x0+9,10.4,x0+18,11.6),{alpha:.6,edge:0})}},-5.6);
  const qs=[];for(let i=0;i<=7;i++)qs.push([x0+16+(x1-3-x0-16)*i/7,12+(i%2?.55:0)]);qs.push([x1-2.6,10]);for(let i=0;i<=9;i++)qs.push([x1-2.6-(x1-2.6-x0-15.6)*i/9,2.8+(i%2?1:0)]);qs.push([x0+15.6,10]);
  const qt=toCCW(sm(qs,4));P2(g,qt,{t:.4,s:22,paint:P=>{P.wash(c,qt,{top:ql,edge:.6,clouds:6});QUILT[o.q||'patch'](P,x0+16,x1-3,ql,qd)}},-5.2);
  if(o.fb)o.fb(x1,wood,wl,wd);else{const fb=toCCW(sm([[x1-6.4,0,1],[x1,0,1],[x1,10.4],[x1-1.2,13],[x1-3.2,14.2],[x1-5.2,13],[x1-6.4,10.4]],6));
    P2(g,fb,{t:1,s:22,paint:P=>{P.wash(wood,fb,{top:wl,edge:.6,clouds:4});P.score(sm([[x1-5.4,4],[x1-1,4],[x1-1,10.2],[x1-3.2,12.6],[x1-5.4,10.2],[x1-5.4,4]],5),{w:.14,ink:.4,dark:wd});o.fbp&&o.fbp(P,x1-3.2,8)}},-4.6)}
  o.more&&o.more(x0,x1,wood,wl,wd)};
VAER.seng=(g,v,c)=>{const S='#c9a04a';
  if(v==='enkel')bed(g,c,{hbp:(P,x,y)=>P.fill(starPts(x,y,1.7,.72),S,.9)});
  if(v==='himmelseng')bed(g,c,{wood:'#4a2e1c',q:'stripes',hbp:(P,x,y)=>P.fill(starPts(x,y,1.7,.72),S,.9),more:(x0,x1,wood)=>{for(const x of[x0+.4,x1-1.6])P2(g,box(x,0,x+1.2,36),{color:wood,kind:'balsa',t:1},-4.2);
    const va=[[x0-.4,36.4],[x1+.4,36.4]];for(let i=0;i<=12;i++)va.push([x1+.4-(x1-x0+.8)*i/12,i%2?30.6:32.8]);const vs=toCCW(sm(va,4));
    P2(g,vs,{t:.3,s:22,paint:P=>{P.wash(c,vs,{top:lt(c,.22),edge:.6,clouds:5});for(let i=0;i<13;i++)P.fill(starPts(x0+1.4+i*2.5,34.4,.45,.19),'#f2c230',.9)}},-3.8);
    for(const x of[x0+1,x1-1])P2(g,circ(x,37.4,1,1,16),{mat:gold(),t:1},-4.2)}});
  if(v==='skyseng'){const sky=(sh,z)=>P2(g,sh,{t:1,s:22,paint:P=>{P.wash('#f6f4ff',sh,{top:'#ffffff',edge:.7,clouds:5});P.wash('#c9c2e6',box(-60,-1,0,3.4),{alpha:.5,edge:0})}},z);
    bed(g,c,{wood:'#d8d2ea',q:'clouds',hb:x0=>sky(clip([circ(x0+4.2,17,4.7,4.7,28),circ(x0+1.5,13.6,3.3,3.3,24),circ(x0+7,13.6,3.3,3.3,24),box(x0-.6,0,x0+9,13.4)],[],'union')[0].outer,-7.4),
      fb:x1=>sky(clip([circ(x1-3.2,10.4,3.5,3.5,26),circ(x1-5.5,8,2.5,2.5,22),circ(x1-.9,8,2.5,2.5,22),box(x1-6.8,0,x1+.4,8)],[],'union')[0].outer,-4.6)})}
  if(v==='maaneseng')bed(g,c,{wood:'#5a4a7a',q:'stars',fbp:(P,x,y)=>P.fill(starPts(x,y,1.5,.64),'#e9b949',.95),hb:(x0,wood)=>{P2(g,box(x0+1.4,0,x0+8.4,8),{color:wood,kind:'balsa',t:.8},-7.8);
    const m=moonS(x0+6.2,13.4,8);P2(g,m,{t:1,s:22,paint:P=>{P.wash('#e9b949',m,{top:'#f6dc8a',edge:.7,clouds:5});for(const[dx,dy,r]of[[-4.4,2,1],[-5,-2.4,.7],[-2.6,-5.4,.8],[-2.2,5.6,.6]])P.fill(circ(x0+6.2+dx,13.4+dy,r,r,14),'#a87a1a',.3)}},-7.2)}});
  if(v==='jern'){const I='#3a3346',iron=(xa,xb,h,z)=>{const m=(xa+xb)/2,top=curve([[xa,h-3],[m,h+.8],[xb,h-3]],10),L=[[[xa,0],[xa,h-3]],[[xb,0],[xb,h-3]],top,[[xa,h*.42],[xb,h*.42]]];for(const k of[.25,.5,.75]){const x=xa+(xb-xa)*k;L.push([[x,h*.42],[x,h-3+3.8*Math.sin(k*Math.PI)*.9]])}
      for(const s of thick(L,.36))P2(g,s,{color:I,t:.6},z);for(const x of[xa,xb])P2(g,circ(x,h-2.5,.8,.8,16),{mat:gold(),t:.8},z-.1);P2(g,heart(m,h*.42+ (h-3-h*.42)*.55,1.1,18),{mat:gold(),t:.2},z+.3)};
    bed(g,c,{wood:'#3a3346',q:'stripes',hb:x0=>iron(x0+.5,x0+8,22,-7.4),fb:x1=>iron(x1-6,x1-.4,14,-4.6)})}
  if(v==='polstret'){const pol=(pts,z,cx,ys)=>{const sh=toCCW(sm(pts,6));P2(g,sh,{t:1.2,s:22,paint:P=>{P.wash(lt(c,.12),sh,{top:lt(c,.3),edge:.7,clouds:5});for(const y of ys)for(const dx of[-2,0,2]){P.score([[cx+dx-1,y-1.6],[cx+dx,y],[cx+dx+1,y-1.6]],{w:.1,ink:.3,dark:dk(c,-.4)});P.score([[cx+dx-1,y+1.6],[cx+dx,y],[cx+dx+1,y+1.6]],{w:.1,ink:.3,dark:dk(c,-.4)});P.fill(circ(cx+dx,y,.34,.34,10),'#e8c86a',.95)}}},z)};
    bed(g,c,{wood:'#6a4430',q:'plain',hb:x0=>pol([[x0-.4,0,1],[x0+8.8,0,1],[x0+8.8,18.6],[x0+7.2,21.2],[x0+1.2,21.2],[x0-.4,18.6]],-7.4,x0+4.2,[8,12,16]),fb:x1=>pol([[x1-6.6,0,1],[x1+.2,0,1],[x1+.2,11.4],[x1-1,13.4],[x1-5.4,13.4],[x1-6.6,11.4]],-4.6,x1-3.2,[5.4,9.4])})}
  if(v==='baad'){const W='#8a5a3c',plank=(pts,z)=>{const sh=toCCW(sm(pts,6));P2(g,sh,{t:1,s:22,paint:P=>{boards(P,sh,W,{h:2.2,dir:'h',ink:.3})}},z)};
    bed(g,c,{wood:W,q:'waves',hb:x0=>plank([[x0,0,1],[x0+8.4,0,1],[x0+8.4,13],[x0+6,17.6],[x0-1.2,21.6,1],[x0-.4,12]],-7.4),
      fb:x1=>{plank([[x1-6.4,0,1],[x1,0,1],[x1+.9,8.6],[x1+2.6,15.4,1],[x1-3,12],[x1-6.4,9.4]],-4.6);for(const s of ring(circ(x1-3,6.2,1.5,1.5,22),.4))P2(g,s,{mat:gold(),t:.2},-3.5);P2(g,circ(x1-3,6.2,1.5,1.5,22),{color:'#9fd8ee',kind:'water',t:.1},-3.55)},
      more:x0=>{const mx=x0+11;P2(g,box(mx-.35,0,mx+.35,37),{color:'#6a4426',kind:'balsa',t:.7},-8.6);
        const sl=toCCW([[mx+.7,34.6],[mx+.7,19.6],[mx+12.4,19.6]]);P2(g,sl,{t:.2,s:20,paint:P=>{P.wash('#f6efdc',sl,{edge:.6,clouds:5});P.fill(box(mx,24,mx+14,26.4),c,.75);P.fill(box(mx,29,mx+14,30.4),c,.6)}},-8.4);
        P2(g,toCCW([[mx+.4,38.6],[mx+.4,36.2],[mx+4.4,37.4]]),{color:c,kind:'water',t:.12},-8.5)}})}
  if(v==='blomst')bed(g,c,{wood:'#6a4e8a',q:'flowers',fbp:(P,x,y)=>{for(let k=0;k<5;k++){const a=k/5*TAU+.3;P.fill(circ(x+Math.cos(a)*1.25,y+Math.sin(a)*1.25,.9,.9,12),'#ffb3d9',.9)}P.fill(circ(x,y,.7,.7,12),'#f2c230',.95)},
    hb:(x0,wood,wl)=>{const st=toCCW(sm([[x0+1,0,1],[x0+7.4,0,1],[x0+7.4,10.4],[x0+4.2,12.4],[x0+1,10.4]],6));P2(g,st,{t:1,s:22,paint:P=>P.wash(wood,st,{top:wl,edge:.6,clouds:4})},-7.6);
      for(const[a,l]of[[2.5,5.4],[.64,5.4]])P2(g,leaf(x0+4.2,7.4,l,1.5,a),{color:'#4f9a5a',kind:'water',t:.3},-7.2);
      for(let k=0;k<6;k++){const a=k/6*TAU+.52;P2(g,circ(x0+4.2+Math.cos(a)*3.5,17.6+Math.sin(a)*3.5,2.9,2.9,22),{color:k%2?'#ff8fc7':'#ffb3d9',kind:'water',t:.4},-7+(k%2)*.12)}
      P2(g,circ(x0+4.2,17.6,2.5,2.5,24),{color:'#f2c230',kind:'water',t:.5},-6.7)}});
  if(v==='slot'){const ST='#b9a6d9',mur=(xa,xb,h,z,n)=>{const w=(xb-xa)/(2*n-1),pts=[[xa,0],[xb,0]];for(let i=0;i<2*n-1;i++){const xr=xb-i*w,up=i%2===0;pts.push([xr,up?h:h-1.5],[xr-w,up?h:h-1.5])}const sh=toCCW(pts);
      P2(g,sh,{t:1,s:22,paint:P=>{P.wash(ST,sh,{edge:.4,clouds:6});P.ashlar(sh,ST,{rowH:[1.5,2],bw:[2.2,3.6],tint:.1,ink:.28});const m=(xa+xb)/2;P.fill(arch(m,h*.34,1.5,h*.3,10),'#2a2040',.85)}},z)};
    bed(g,c,{wood:'#8a7aa8',q:'patch',hb:x0=>{mur(x0-.2,x0+8.6,18.6,-7.4,3);P2(g,toCCW([[x0+.4,18.6],[x0+8,18.6],[x0+4.2,27]]),{color:c,kind:'water',t:.5},-7.9);
        for(const s of thick([[[x0+4.2,27],[x0+4.2,31]]],.12))P2(g,s,{mat:gold(),t:.1},-7.8);P2(g,toCCW([[x0+4.3,31],[x0+4.3,28.8],[x0+7.6,29.9]]),{color:'#e0457a',kind:'water',t:.1},-7.7)},
      fb:x1=>mur(x1-6.6,x1+.2,12,-4.6,3)})}
  if(v==='stjerne')bed(g,c,{wood:'#efe6d6',q:'stars',pil:'#fff3c8',hb:(x0,wood,wl,wd)=>{const st=toCCW(sm([[x0,0,1],[x0+8.4,0,1],[x0+8.4,12.4],[x0+4.2,14.4],[x0,12.4]],6));P2(g,st,{t:1,s:22,paint:P=>P.wash(wood,st,{top:wl,edge:.6,clouds:4})},-7.6);
      const sp=starPts(x0+4.2,16.4,7,3.1);P2(g,sp,{t:.8,s:22,paint:P=>{P.wash('#f2c230',sp,{top:'#ffe27a',edge:.7,clouds:4});P.score([...starPts(x0+4.2,16.4,4.6,2),starPts(x0+4.2,16.4,4.6,2)[0]],{w:.12,ink:.3,dark:'#a87a1a'})}},-7.1)},
    fbp:(P,x,y)=>P.fill(starPts(x,y,1.7,.72),'#f2c230',.95)})};
}
