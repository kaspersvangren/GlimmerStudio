/* ---- Den Flyvende Støvle: en rigtig snørestøvle set fra siden ----
   Bredt skaft, høj rund tå, snøring skråt op ad vristen, tunge der stikker op, polstret krave med strop,
   hælkappe, tåkappe med dobbelt syning og tyk sål med rand, hæl og riller. Tåen peger mod venstre (spejlet). */
function makeBoot(){const B=new THREE.Group(),U=new THREE.Group();U.scale.x=-1;B.add(U);const LEA='#9c5c30',LEAD='#7c4422',LEAL='#b87840',TH='#f0d6a4';
  const O=outline([[-9.3,0,1],[10.2,0,1],[11.3,1.2],[11.6,2.9],[11,4.5],[9.6,5.6],[8,6],[6.4,6.5],[4.6,7.9],[3.2,9.8],[2.5,12],[2.3,13.6],[3.3,15.3],[2.6,16.4,1],[1.2,16.2],[.2,14.9],[-3.5,15.4],[-7.2,16.1],[-8.6,15.9,1],[-8.9,13],[-8.6,8],[-9.1,4.5],[-9.5,2]],8,0);
  const door=arch(-5,.2,2.7,4.7,14),win1=arch(-3.6,9,2.6,3.1,14),port=circ(6.6,2.9,.95,.95,24);
  const stitch=(P,pts,o={})=>{for(let k=0;k<pts.length-1;k+=2)P.score([pts[k],pts[k+1]],{w:.055,ink:.6,dark:TH,...o})};
  for(const sh of clip([O],[door,win1,port],'diff'))put(U,piece(sh,{t:.5,s:26,edge:'#4a2812',paint:P=>{P.wash(LEA,O,{top:LEAL,clouds:14,edge:.7});
      /* folder ved anklen og hen over vristen */
      for(const c of[[[-.5,7.2],[1.6,8.2],[3.4,8]],[[-1.4,8.6],[1,9.8],[2.9,10]],[[4.2,6.4],[5.4,7.1]],[[-8.2,7.6],[-6.6,7.2],[-5.4,7.8]],[[-8,10.6],[-6.4,10.2]],[[-2,12.6],[0,13.2],[1.6,13]]])P.score(curve(c,6),{w:.1,ink:.42,dark:'#4a2410'});
      /* sidesøm fra hæl til snøring */
      stitch(P,curve([[-9,5.8],[-5.5,6.6],[-1,6.3],[2.6,7.4],[4.6,7.2]],14));
      P.wash('#5a2c12',box(-12,-1,13,1.1),{alpha:.3,edge:0})}}),0,0,0);
  /* tåkappe med dobbelt syning */
  const toe=toCCW([[7,0],[10.2,0],[11.3,1.2],[11.6,2.9],[11,4.5],[9.6,5.6],[8.2,5.95],[7.3,4.6],[6.9,2.4]]);for(const sh of clip([toe],[port],'diff'))put(U,piece(sh,{t:.14,s:40,edge:'#4a2812',paint:P=>{P.wash(LEAD,toe,{top:LEA,edge:.6,clouds:6});for(const d of[.35,.75])stitch(P,curve([[7+d,.2],[6.9+d,2.4],[7.3+d,4.5],[8.1+d,5.7]],12))}}),0,0,.33);
  /* hælkappe */
  const heel=toCCW([[-9.3,0],[-6.6,0],[-6.8,3],[-7.8,5.6],[-8.9,6.2],[-9.1,4.5],[-9.5,2]]);put(U,piece(heel,{t:.14,s:40,edge:'#4a2812',paint:P=>{P.wash(LEAD,heel,{edge:.6});stitch(P,curve([[-6.95,.3],[-7.1,3],[-8,5.3],[-8.8,5.85]],10))}}),0,0,.33);
  /* tungen, lysere, stikker op over kraven */
  put(U,piece(toCCW([[6.2,6.3],[4.5,7.7],[3.1,9.7],[2.4,12],[2.25,13.6],[3.3,15.3],[2.6,16.4],[1.2,16.2],[.5,14.6],[.9,11.6],[1.9,9],[3.6,7],[5.4,5.9]]),{color:'#c88c54',kind:'water',t:.12,edge:'#6a3c1c'}),0,0,.3);
  /* snørekanten med messingringe, og snørebånd på kryds hen over tungen */
  const fr=curve([[5.9,5.75],[4.2,7.1],[2.75,9.2],[2,11.6],[1.75,13.7]],10),inn=curve([[4.7,4.85],[3,6.4],[1.5,8.6],[.7,11.2],[.45,13.9]],10);
  put(U,piece(toCCW([...fr,...inn.slice().reverse()]),{t:.14,s:40,edge:'#4a2812',paint:P=>{const r=toCCW([...fr,...inn.slice().reverse()]);P.wash(LEAD,r,{edge:.5});stitch(P,inn.map(([x,y])=>[x+.22,y+.12]))}}),0,0,.4);
  const eyes=[];for(let k=0;k<7;k++){const t=(k+.5)/7,i=t*(fr.length-1),a=Math.floor(i),f=i-a,p=[mix(fr[a][0],fr[Math.min(fr.length-1,a+1)][0],f),mix(fr[a][1],fr[Math.min(fr.length-1,a+1)][1],f)],q=[mix(inn[a][0],inn[Math.min(inn.length-1,a+1)][0],f),mix(inn[a][1],inn[Math.min(inn.length-1,a+1)][1],f)];
    const e=[mix(p[0],q[0],.5),mix(p[1],q[1],.5)],out=[p[0]+(p[0]-q[0])*.55,p[1]+(p[1]-q[1])*.55];eyes.push({e,out});put(U,piece(circ(e[0],e[1],.3,.3,14),{mat:gold(),t:.08}),0,0,.5);put(U,piece(circ(e[0],e[1],.12,.12,8),{color:'#2a1408',t:.06}),0,0,.56)}
  for(let k=0;k<6;k++){pieces(thick([[eyes[k].e,eyes[k+1].out]],.11),{color:'#f2e2c0',t:.05,edge:'#b89868'},U,0,0,.6);pieces(thick([[eyes[k].out,eyes[k+1].e]],.11),{color:'#e6d4ae',t:.05,edge:'#b89868'},U,0,0,.56)}
  /* sløjfe øverst med to løkker og to løse ender */
  {const t=eyes[6].out;for(const c of[[t,[t[0]+1.9,t[1]+.5],[t[0]+2.3,t[1]-.7],[t[0]+.2,t[1]-.25]],[t,[t[0]+.6,t[1]+1.5],[t[0]-.7,t[1]+1.5],[t[0]-.15,t[1]+.1]],[t,[t[0]+1.5,t[1]-1.6],[t[0]+1.2,t[1]-3.4]],[t,[t[0]+.5,t[1]-1.8],[t[0]+1.1,t[1]-4.2]]])pieces(thick([curve(c,8)],.1),{color:'#f2e2c0',t:.05,edge:'#b89868'},U,0,0,.64);put(U,piece(circ(t[0],t[1],.22,.2,10),{color:'#e6d4ae',t:.08}),0,0,.68)}
  /* polstret krave og strop bagtil */
  pieces(thick([curve([[.6,14.5],[-3.5,14.9],[-7.2,15.55],[-8.5,15.4]],10)],.45),{color:'#8a4c26',kind:'water',t:.2,edge:'#4a2812'},U,0,0,.36);
  pieces(ring(circ(-8.9,16.1,.75,1,16),.26),{color:LEAL,kind:'water',t:.12,edge:'#4a2812'},U,0,0,.1);
  /* sål: rand med syning, mellemsål, slidsål med hæl og riller, og let tåløft */
  put(U,piece(toCCW([[-9.75,.12],[10.5,.12],[11.6,.5],[11.75,-.1],[10.7,-.5],[-9.75,-.5]]),{t:.75,s:40,edge:'#8a6a40',paint:P=>{P.flat('#d8b888');for(let x=-9.4;x<11;x+=.5)P.pen([[x,-.18],[x+.25,-.18]],'#7a5830',.05,.8)}}),0,0,.05);
  put(U,piece(toCCW([[-9.8,-.5],[10.7,-.5],[11.75,-.1],[11.8,-.7],[10.6,-1.25],[-9.8,-1.25]]),{color:'#3a2418',kind:'water',t:.85,edge:'#1a0c06'}),0,0,.05);
  put(U,piece(box(-9.8,-2.35,-4.9,-1.2),{color:'#2a1810',kind:'water',t:.85,edge:'#120804'}),0,0,.05);
  put(U,piece(toCCW([[-2.6,-1.2],[10.6,-1.2],[11.5,-.95],[10.9,-1.85],[-2.2,-1.95]]),{color:'#2a1810',kind:'water',t:.85,edge:'#120804'}),0,0,.05);
  for(let x=-9.5;x<-5.2;x+=1.05)put(U,piece(box(x,-2.75,x+.62,-2.3),{color:'#1c100a',t:.8}),0,0,.05);for(let x=-1.9;x<10.2;x+=1.05)put(U,piece(box(x,-2.35,x+.62,-1.9),{color:'#1c100a',t:.8}),0,0,.05);
  /* dør, vinduer og en lille skorsten op gennem kraven */
  windowParts(U,win1,0,{t:.5,frame:'#4a2a14',mull:'#4a2a14',sill:'#4a2a14'});doorIn(U,door,0,'#5e2c18',{planks:.62,iron:false});pieces(ring(door,.3,false),{color:'#4a2a14',t:.14},U,0,0,.3);
  put(U,piece(grow(port,.3)[0].outer,{t:.03,mat:paperMat('#fff0c8','tissue',{glow:'#ffcf7a',gi:1.5})}),0,0,-.33);pieces(ring(port,.28),{mat:gold(),t:.12},U,0,0,.5);pieces(clip([box(6.52,1.9,6.68,3.9),box(5.6,2.82,7.6,2.98)],[port],'inter'),{color:'#4a2a14',t:.06},U,0,0,-.2);
  stick(U,-5.6,15.2,18.4,-.5,.8,'#3b2a1f');put(U,piece(box(-6.3,18.2,-4.9,18.75),{color:'#2a1d14',t:1.1}),0,0,-.5);
  /* vinger ved anklen */
  const wings=[];for(const s of[-1,1]){const wg=new THREE.Group();put(U,wg,-8.3+(s<0?.7:0),9.6+(s<0?.5:0),s*.85);
    for(let k=0;k<5;k++){const l=8.2-k*1.3;put(wg,piece(toCCW([[0,-.6],[-l*.35,l*.25+1.2-k*.3],[-l,l*.62+1.6-k*.5],[-l*.86,l*.42+.8-k*.3],[-l*.62,l*.2-k*.25],[-l*.3,.1-k*.15],[0,.5]].map(([a,b])=>[a,b+k*.5])),{color:['#fbf8ff','#efe9fb','#e2d9f4','#d4c8ec','#c6b8e4'][k],t:.05,both:true,edge:'#9a8cc0'}),0,0,s*k*.06)}wings.push({g:wg,s})}
  /* skilte (ikke spejlede) og en lille stige ned fra døren */
  plate(B,'Støvlen','Den Flyvende Støvle',FONT.stoevle,7.2,1.3,{bg:'#2a1d14',fg:'#f6e7c0',frame:'gold',size:.82,x:4.3,y:5.65,z:.6});
  plate(B,'Støvlen:snart','Kommer snart',FONT.snart,2.5,.72,{bg:'#f2e6c8',fg:'#3b2a1f',size:.34,x:5,y:2.5,z:.14,t:.06});put(B,new THREE.Mesh(DOME,M.brass),5,3.1,.22).scale.setScalar(.12);
  const lad=new THREE.Group();put(B,lad,5,.2,.95);for(const e of[-.75,.75])cord(lad,[[e,0,0],[e,-2,.4],[e,-4.1,.8]],.06,'#c8a070');for(let k=1;k<=4;k++){const r=new THREE.Mesh(new THREE.BoxGeometry(1.7,.16,.3),paperMat('#8a5a3a','balsa'));put(lad,r,0,-k*.98,k*.18)}
  B.traverse(o=>{if(o.isMesh)o.castShadow=false});return{B,wings,doorX:5,lad}}
