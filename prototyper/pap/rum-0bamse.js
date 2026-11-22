/* ============ bamserne fra Gribemaskinen ============
   De tyve bamser fra det oprindelige spil, bygget i papir: siddende tøjdyr med hoved, mave og fødder, og hver sit kendetegn.
   Målene er de samme som i originalens tegning (ca. 60 høje, bunden i y = 34, y vokser nedad) og regnes om til rummets mål (20 til 1).
   En bamse er mange små stykker papir, og i maskinen ligger der en hel bunke, som fysikken flytter rundt på. Derfor tegnes hver slags bamse én gang
   til sit eget lille billede, og hver bamse i bunken er bare ét stykke med det billede på. Værelset bruger de samme billeder til de bamser, man har vundet. */
const BAMSER=[{k:'bjoern',navn:'bamsebjørn',c:'#b5743a',c2:'#e8c8a0'},{k:'kat',navn:'kattebamse',c:'#a8a4c0',c2:'#f2eeff'},{k:'kanin',navn:'kaninbamse',c:'#f7f4ff',c2:'#ffc8dc'},{k:'drage',navn:'dragebamse',c:'#7ac86a',c2:'#f2e2a0'},
  {k:'enhjoerning',navn:'enhjørningebamse',c:'#ffffff',c2:'#ff9fd0'},{k:'ugle',navn:'uglebamse',c:'#9c6a48',c2:'#f2e2c0'},{k:'froe',navn:'frøbamse',c:'#5ab85a',c2:'#c8f0a0'},{k:'spoegelse',navn:'spøgelsesbamse',c:'#f2eeff',c2:'#c8c4e8'},
  {k:'ork',navn:'orkebamse',c:'#7aaa4a',c2:'#c8d890'},{k:'kentaur',navn:'kentaurbamse',c:'#a8703a',c2:'#e8c8a0',ch:'#f2c8a0',hair:'#5a3a1a'},{k:'grif',navn:'griffenbamse',c:'#d8a84a',c2:'#f2e2b0',ch:'#f7f4ff'},{k:'trold',navn:'troldebamse',c:'#8a9a6a',c2:'#d8c8a0',hair:'#e07a2a'},
  {k:'foeniks',navn:'føniksbamse',c:'#ff7a2a',c2:'#ffd27a'},{k:'havfrue',navn:'havfruebamse',c:'#3fc7b4',c2:'#a8f0e4',ch:'#f7d2b8',hair:'#b05ae0'},{k:'pegasus',navn:'pegasusbamse',c:'#ffffff',c2:'#c8e8ff',hair:'#7ab8f0'},{k:'yeti',navn:'yetibamse',c:'#f2f6ff',c2:'#9ab8e8'},
  {k:'minotaur',navn:'minotaurbamse',c:'#8a5a3a',c2:'#d8b890'},{k:'kraken',navn:'krakenbamse',c:'#9a5ad8',c2:'#e0c0ff'},{k:'ilddrage',navn:'ilddragebamse',c:'#e0503a',c2:'#ffd27a',base:'drage',wing:'#b8302a'},{k:'isdrage',navn:'isdragebamse',c:'#7ac8f0',c2:'#e8f8ff',base:'drage',wing:'#4a98d0'}];
function bygBamse(G,k0){const b=BAMSER.find(x=>x.k===k0)||BAMSER[0],k=b.base||b.k,c=b.c,c2=b.c2,ch=b.ch||c,MK='#1a1238',u=.05;let z=0;
  const lag=(sh,col,o={})=>{z+=.02;return put(G,piece(toCCW(sh.map(([x,y])=>[x*u,-y*u])),Object.assign({color:col,kind:'water',t:.05,edge:hexOf(shade(col,-.45))},o)),0,0,z)};
  const el=(cx,cy,rx,ry,col,o)=>lag(circ(cx,cy,rx,ry,Math.max(10,Math.round((rx+ry)*.7))),col,o);
  const st=(pts,w,col)=>{z+=.02;for(const q of thick([pts.map(([x,y])=>[x*u,-y*u])],w*u))put(G,piece(q,{color:col,kind:'water',t:.03}),0,0,z)};
  const spejl=(pts,col,o)=>{lag(pts,col,o);lag(pts.map(([x,y,s])=>[-x,y,s]),col,o)},sy=()=>{for(let y=9;y<30;y+=7)st([[0,y],[0,y+3]],.8,hexOf(shade(c2,-.22)))};
  if(k==='spoegelse'){lag(sm([[-26,34,1],[-26,-6],[-20,-28],[0,-36],[20,-28],[26,-6],[26,34,1],[17,27],[9,34,1],[0,27],[-9,34,1],[-17,27]],6),c,{t:.08});for(const s of[-1,1]){el(s*9,-6,4,6,MK);el(s*16,4,4,4,'#ffb8d0')}el(0,8,5,4,MK);return G}
  /* det, der sidder bag kroppen: vinger og haler */
  if(k==='drage'){spejl([[20,6],[40,-8],[34,10]],b.wing||'#5aa84a');st([[20,24],[30,27],[35,22],[34,14]],4,c)}
  if(k==='grif')spejl(sm([[18,4,1],[36,-2],[45,8],[40,18],[30,22,1],[34,14],[26,9],[18,12,1]],4),'#9a6a3a');
  if(k==='pegasus')spejl(sm([[18,6,1],[32,-8],[44,-4],[46,8],[34,16,1],[36,8],[28,4],[18,12,1]],4),'#e8f4ff');
  if(k==='foeniks'){spejl(sm([[18,6,1],[34,-6],[42,6],[28,18,1]],4),'#e0402a');lag(sm([[16,26,1],[32,29],[40,22],[38,10,1],[33,19],[22,20,1]],4),'#ffd27a')}
  if(k==='kentaur')lag(sm([[20,20,1],[34,22],[38,32],[32,42,1],[28,32],[18,28,1]],4),b.hair);
  if(k==='trold'){st([[20,26],[30,29],[33,36],[32,40]],2.4,c);el(33,40,4,4,b.hair)}
  /* krop med mave og fødder (havfruen har en fiskehale, kraken arme) */
  el(0,16,24,19,c,{t:.08});el(0,19,13,11,c2);
  if(k==='havfrue'){lag(sm([[-6,30,1],[-22,34],[-25,43],[-20,46,1],[-12,40],[0,36,1],[12,40],[20,46,1],[25,43],[22,34],[6,30,1]],4),c);for(const[x,y]of[[-6,14],[6,14],[0,22]])st([[x-4,y],[x,y+2.4],[x+4,y]],1.1,hexOf(shade(c,-.3)))}
  else if(k==='kraken'){for(const[x0,y0,x1,y1,x2,y2]of[[-20,26,-28,34,-22,41],[-8,32,-11,41,-5,44],[8,32,11,41,5,44],[20,26,28,34,22,41]])st([[x0,y0],[x1,y1],[x2,y2]],5,c);for(const[x,y]of[[-8,20],[0,24],[8,20]])el(x,y,2,2,c)}
  else for(const s of[-1,1])el(s*14,32,9,5,c);
  if(k==='yeti')for(const s of[-1,1])for(const y of[10,20])lag([[s*23,y-3],[s*29,y+1],[s*23,y+4]],c);
  /* ører, horn og hår bag hovedet */
  if(k==='bjoern')for(const s of[-1,1]){el(s*16,-30,8,8,c);el(s*16,-30,4,4,c2)}
  if(k==='kat')spejl([[20,-22],[16,-42],[4,-30]],c);
  if(k==='kanin')for(const s of[-1,1]){el(s*9,-44,6,17,c);el(s*9,-44,3,11,c2)}
  if(k==='ugle')spejl([[20,-20],[18,-40],[6,-28]],c);
  if(k==='drage')spejl([[10,-32],[14,-44],[6,-38]],c2);
  if(k==='enhjoerning'){lag(sm([[-16,-30,1],[-25,-18],[-23,-6],[-20,0,1],[-13,-14],[-4,-30,1]],4),c2);lag([[-4,-34],[0,-54],[4,-34]],'#f2c14e');spejl([[14,-28],[18,-38],[10,-34]],c)}
  if(k==='ork')spejl([[19,-18],[40,-26],[22,-6]],c);
  if(k==='trold'){lag([[-10,-34],[-16,-46],[-8,-42],[-6,-54],[0,-44],[6,-54],[6,-42],[14,-46],[8,-34]],b.hair);for(const s of[-1,1])el(s*22,-14,6,6,c)}
  if(k==='kentaur'||k==='pegasus')spejl([[18,-26],[16,-42],[6,-32]],k==='pegasus'?c:'#a8703a');
  if(k==='havfrue')spejl(sm([[22,-18,1],[29,0],[27,14],[20,20,1],[17,4],[12,-12,1]],4),b.hair);
  if(k==='yeti')spejl(sm([[14,-32,1],[19,-42],[16,-48,1],[13,-40],[6,-36,1]],3),'#f2e2c0');
  if(k==='minotaur'){spejl(sm([[16,-28,1],[30,-31],[35,-42],[30,-50,1],[27,-42],[20,-38],[10,-36,1]],4),'#f2e8d0');for(const s of[-1,1])el(s*23,-18,8,4,c)}
  if(k==='grif')spejl([[14,-30],[18,-42],[10,-36]],ch);
  if(k==='foeniks'){lag(sm([[-8,-34,1],[-11,-45],[-4,-58,1],[1,-46],[0,-36,1],[5,-45],[10,-52,1],[11,-42],[6,-32,1]],3),'#ffb02e');lag([[-3,-36],[-1,-50],[1,-36]],'#fff0a0')}
  /* hovedet */
  if(k==='froe'){el(0,-12,25,17,c,{t:.08});for(const s of[-1,1]){el(s*11,-28,9,9,c);el(s*11,-28,4,4,MK);el(s*11+1.4,-29.4,1.3,1.3,'#ffffff');el(s*16,-10,4,4,'#ffb8d0')}st([[-14,-8],[-7,-3],[0,-1.5],[7,-3],[14,-8]],2.2,MK)}
  else if(k==='yeti'){const p=[];for(let i=0;i<22;i++){const a=i/22*TAU,r=i%2?26:21;p.push([Math.cos(a)*r,-13+Math.sin(a)*r*.95])}lag(p,c,{t:.08});el(0,-12,13,11,c2)}
  else el(0,-14,22,22,ch,{t:.08});
  if(k==='kentaur')lag(sm([[-22,-12,1],[-23,-30],[-6,-39],[8,-36],[22,-26],[22,-12,1],[14,-24],[-4,-27],[-16,-21]],4),b.hair);
  if(k==='havfrue'){lag(sm([[-22,-12,1],[-22,-32],[0,-38],[22,-32],[22,-12,1],[12,-25],[-4,-27]],4),b.hair);el(12,-30,4,4,'#ff8fc7')}
  if(k==='pegasus')lag(sm([[-8,-34,1],[2,-41],[14,-32,1],[4,-33],[-2,-28,1]],3),b.hair);
  if(k==='kraken')for(const[x,y,r]of[[-12,-26,3],[10,-30,2.4],[14,-22,2]])el(x,y,r,r,c2);
  /* ansigtet */
  if(k==='ugle'){for(const s of[-1,1]){el(s*9,-16,9,9,c2);el(s*9,-16,4,4,MK);el(s*9+1.2,-17.4,1.2,1.2,'#ffffff')}lag([[-4,-6],[4,-6],[0,2]],'#f2a040')}
  else if(k!=='froe'){const naeb=k==='grif'||k==='foeniks',snude=k==='bjoern'||k==='drage'||k==='minotaur';
    for(const s of[-1,1]){el(s*8,-16,3.4,3.4,MK);el(s*8+1,-17,1.1,1.1,'#ffffff');el(s*15,-8,4,4,'#ffb8d0')}
    if(k==='ork'||k==='trold'||k==='minotaur')for(const s of[-1,1])st([[s*13,-23],[s*4,-20]],2.4,MK);
    if(naeb)lag([[-6,-9],[6,-9],[0,2]],'#f2a040');
    else if(k==='trold'){el(0,-7,7,6,c2);st([[-6,1],[0,3.4],[6,1]],1.6,MK)}
    else{if(snude)el(0,-6,8,6,k==='drage'?hexOf(shade(c,.25)):c2);lag([[-3,-8],[3,-8],[0,-5]],k==='kanin'||k==='kat'?'#ff8fb0':MK);st([[-7,-4],[-3.5,-2.6],[0,-5],[3.5,-2.6],[7,-4]],1.6,MK)}
    if(k==='ork')for(const x of[-5,5])lag([[x-2,-3],[x,-9],[x+2,-3]],'#fffff0');
    if(k==='minotaur')st(Array.from({length:15},(_,i)=>[Math.cos(i/14*TAU)*4,-1+Math.sin(i/14*TAU)*4]),1.6,'#f2c14e')}
  if(k==='kat')for(const s of[-1,1])for(const y of[-8,-4])st([[s*20,y],[s*30,y]],1.1,MK);
  sy();return G}
/* et stykke papir-tegning lavet om til ét billede: byg(G) bygger tegningen, og udsnittet x0..x1, y0..y1 kommer med. Bruges til ting, der er mange af (bamser, bobler) */
function papBillede(ctx,byg,{px=256,x0=-1,x1=1,y0=-1,y1=1}={}){const sc=new THREE.Scene(),G=new THREE.Group();sc.add(G);sc.environment=ctx.env;sc.environmentIntensity=.35;sc.add(new THREE.HemisphereLight('#fff8ee','#8a7a6c',1.25));{const d=new THREE.DirectionalLight('#fff0dc',2);d.position.set(-30,50,90);sc.add(d)}
  byg(G);const cam=new THREE.OrthographicCamera(x0,x1,y1,y0,1,100);cam.position.set(0,0,50);cam.lookAt(0,0,0);cam.updateProjectionMatrix();
  const rt=new THREE.WebGLRenderTarget(px,px,{samples:4}),farve=new THREE.Color(),foer=renderer.getRenderTarget(),a=renderer.getClearAlpha(),ac=renderer.autoClear,tm=renderer.toneMapping;renderer.getClearColor(farve);renderer.autoClear=true;renderer.setClearColor('#000000',0);renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.setRenderTarget(foer);renderer.autoClear=ac;renderer.setClearColor(farve,a);renderer.toneMapping=tm;
  sc.traverse(q=>{if(q.geometry)q.geometry.dispose()});sc.clear();return rt}
const papBilledeMat=rt=>new THREE.MeshBasicMaterial({map:rt.texture,transparent:true,alphaTest:.35,premultipliedAlpha:true,toneMapped:false});
/* billedet af en bamse: 5,8 × 5,8 i rummets mål, med bamsens midte (0, 0) lidt under billedets midte. Gemmes, så hver slags kun tegnes én gang */
const BAMSEBILLEDER=new Map(),BAMSEMAAL={b:5.8,dy:.3};
function bamseBillede(ctx,k){if(BAMSEBILLEDER.has(k))return BAMSEBILLEDER.get(k);const h=BAMSEMAAL.b/2,rt=papBillede(ctx,G=>bygBamse(G,k),{x0:-h,x1:h,y0:-h+BAMSEMAAL.dy,y1:h+BAMSEMAAL.dy});BAMSEBILLEDER.set(k,rt);return rt}
const bamseRyd=()=>{for(const rt of BAMSEBILLEDER.values())rt.dispose();BAMSEBILLEDER.clear()};
/* ét stykke med bamsens billede på. s er størrelsen (1 = som tegnet, ca. 3 høj) */
function bamseStykke(ctx,k,s=1){const rt=bamseBillede(ctx,k),m=new THREE.Mesh(new THREE.PlaneGeometry(BAMSEMAAL.b*s,BAMSEMAAL.b*s),papBilledeMat(rt));m.position.y=BAMSEMAAL.dy*s;m.userData.noShadow=true;const G=new THREE.Group();G.add(m);G.userData.ryd=()=>{m.geometry.dispose();m.material.dispose()};return G}
