/* ============ et billede af en ting, man har fået: en rund medaljon med selve tingen i ============
   Tingen bygges af de samme papirdele som den rigtige (heksen med den nye hat på, kæledyret med sløjfen, sengen fra Værelset)
   og tegnes i sit eget lille billede, som sidder på en rund skive. Bruges i Boblebutikken, og kan bruges alle steder, hvor man får noget. */
function visVare(w,ctx,Rm,o={}){const[k,v]=w,px=o.px||640,sc=new THREE.Scene(),I=new THREE.Group(),G=new THREE.Group();sc.add(I);sc.background=new THREE.Color(o.bg||'#f3e6c4');sc.environment=ctx.env;sc.environmentIntensity=.35;
  sc.add(new THREE.HemisphereLight('#fff8ee','#7a6a5c',1.15));{const d=new THREE.DirectionalLight('#fff0dc',2.1);d.position.set(-30,50,90);sc.add(d)}
  const cam=new THREE.OrthographicCamera(-1,1,1,-1,1,900),bx=new THREE.Box3(),tmp=new THREE.Box3(),glows=[];let tick=null,fra='forfra';
  const maal=root=>{I.updateMatrixWorld(true);bx.makeEmpty();root.traverse(q=>{if(q.isMesh&&!q.isSprite&&q.visible&&q.geometry){if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();tmp.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);bx.union(tmp)}});return bx};
  if(k.startsWith('rum.')){const slot=k.slice(4),R0=SPIL.RUMVALG[slot];VAER[slot](I,v,SPIL.rumc[slot]||R0.c0,{Rm:{floor:(sh,po,y,par)=>Rm.floor(sh,po,y,par||I)},glow:(x,y,z,col,size,flick)=>{const q=Rm.glow(x,y,z,col,size,flick,I);glows.push(q);return q}});maal(I);
    if(slot==='vaeg')bx.set(new THREE.Vector3(-13,22,-20),new THREE.Vector3(13,48,0));/* af væggen vises et udsnit, så mønsteret kan ses */
    if(slot==='gulv')fra='oppefra';if(slot==='lampe')sc.background.set('#2b2552');
    if(slot==='lampe'){const s=bx.getSize(new THREE.Vector3());if(s.y>s.x*1.3)bx.max.y=bx.min.y+Math.max(s.x*1.3,11)}}
  else if(k.startsWith('dyr')){const d=Object.assign({},ctx.dyr||SPIL.dyr);d[{dyr:'kind','dyrmønster':'moenster',dyrpynt:'pynt'}[k]]=v;const K=makePet(d);I.add(K.G);tick=t=>K.tick(t,{ph:0,amp:0});maal(K.G)}
  else{const F=makeFigure(Object.assign({},ctx.look,{[k]:v}));I.add(F.G);tick=t=>F.tick(t,{ph:0,amp:0});
    if(['mærke','pupil','mund'].includes(k)){maal(F.gFace);const c=bx.getCenter(new THREE.Vector3()),r=k==='pupil'?2.7:3.3;bx.set(new THREE.Vector3(c.x-r,c.y-r,-20),new THREE.Vector3(c.x+r,c.y+r,20))}
    else if(['hat','hår','pande'].includes(k)){maal(F.head);const c=bx.getCenter(new THREE.Vector3()),r=k==='hat'||k==='hår'?7.4:5.6;bx.set(new THREE.Vector3(c.x-r,c.y-r+(k==='hat'?2.6:k==='hår'?-1.2:0),-20),new THREE.Vector3(c.x+r,c.y+r+(k==='hat'?2.6:k==='hår'?-1.2:0),20))}
    else if(k==='tilbehør'&&(v==='tryllestav'||STAVE[v])){sc.background.set('#2b2552');maal(F.gHandL);const c=bx.getCenter(new THREE.Vector3()),r=Math.max(bx.max.x-bx.min.x,bx.max.y-bx.min.y)*.5+1.2;bx.set(new THREE.Vector3(c.x-r,c.y-r+1,-20),new THREE.Vector3(c.x+r,c.y+r+1,20))}
    else if(k==='støvler'){F.skirt.scale.y=.56;maal(F.G);const c=bx.getCenter(new THREE.Vector3());bx.set(new THREE.Vector3(c.x-4.6,bx.min.y-.6,-20),new THREE.Vector3(c.x+4.6,bx.min.y+8.6,20))}
    else maal(F.G)}
  const c=bx.getCenter(new THREE.Vector3()),s=bx.getSize(new THREE.Vector3());
  if(fra==='oppefra'){const h=Math.max(s.x,s.z)/2*1.16;Object.assign(cam,{left:-h,right:h,top:h,bottom:-h});cam.up.set(0,0,-1);cam.position.set(c.x,300,c.z);cam.lookAt(c.x,0,c.z)}
  else{const h=Math.max(s.x,s.y)/2*1.14;Object.assign(cam,{left:-h,right:h,top:h,bottom:-h});cam.position.set(c.x,c.y,400);cam.lookAt(c.x,c.y,0)}
  cam.updateProjectionMatrix();
  const rt=new THREE.WebGLRenderTarget(px,px,{samples:4}),skive=new THREE.Mesh(new THREE.CircleGeometry(1,56),new THREE.MeshBasicMaterial({map:rt.texture}));skive.userData.noShadow=true;G.add(skive);
  /* guldkanten: en ring af papir uden om billedet */
  {const kc=cv(256,256),g=kc.getContext('2d');g.translate(128,128);g.lineWidth=13;g.strokeStyle='#c9a04a';g.beginPath();g.arc(0,0,119,0,TAU);g.stroke();g.lineWidth=3;g.strokeStyle='#fff0b8';g.beginPath();g.arc(0,0,123,0,TAU);g.stroke();g.strokeStyle='#7a5a1c';g.beginPath();g.arc(0,0,113,0,TAU);g.stroke();
    const km=new THREE.Mesh(new THREE.PlaneGeometry(2.14,2.14),new THREE.MeshBasicMaterial({map:tx(kc,true),transparent:true,depthWrite:false}));km.position.z=.02;km.userData.noShadow=true;G.add(km)}
  const farve=new THREE.Color();
  const tegn=t=>{if(tick)tick(t);const rtFoer=renderer.getRenderTarget(),a=renderer.getClearAlpha(),ac=renderer.autoClear,tm=renderer.toneMapping;renderer.getClearColor(farve);renderer.autoClear=true;renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.setRenderTarget(rtFoer);renderer.autoClear=ac;renderer.setClearColor(farve,a);renderer.toneMapping=tm};
  const ryd=()=>{Rm.glows=Rm.glows.filter(q=>!glows.includes(q));sc.traverse(q=>{if(q.geometry&&!q.isSprite)q.geometry.dispose();for(const m of(q.material?[].concat(q.material):[]))if(m.userData&&m.userData.own){if(m.map)m.map.dispose();m.dispose()}else if(q.isSprite){if(m.map)m.map.dispose();m.dispose()}});sc.clear();rt.dispose();skive.geometry.dispose();skive.material.dispose();G.children[1].material.map.dispose();G.children[1].material.dispose();G.children[1].geometry.dispose();if(G.parent)G.parent.remove(G)};
  return{G,tegn,ryd}}
