/* ============ papirskiltene i arkadespillene ============
   Kasper (22. nov.): arkadespillene skal have et rigtigt pap-look. Derfor står point, tekster og beskeder ikke længere fladt oven på billedet,
   men er papir i rummet, ligesom alt andet:
   - papirTavle: en tavle af karton med splitben, hvor tallene sidder på små papbrikker, der vender, når tallet skifter.
   - papirTekster: "+10", "Dobbelt!" og lignende, klippet ud i papir med en hvid kant. De popper op, hænger et øjeblik og falder ned.
   - papirBanner: en stor besked på et kort, der hænger i to snore og svinger ned fra loftet, og op igen. */
const PAPIRTEX=new Map();
/* et billede af en tekst, som var den klippet ud: bogstaverne i farven, en hvid papirkant om dem, og alt andet gennemsigtigt */
function papirTekstTex(txt,col,font,kant='#fffaf0'){const key=txt+'|'+col+'|'+font+'|'+kant;if(PAPIRTEX.has(key)){const v=PAPIRTEX.get(key);PAPIRTEX.delete(key);PAPIRTEX.set(key,v);return v}
  const F=(font||FONT.arkade).replace('X','96px'),c0=cv(8,8).getContext('2d');c0.font=F;const tw=Math.ceil(c0.measureText(txt).width),W=Math.min(2048,tw+64),H=156,c=cv(W,H),g=c.getContext('2d');
  g.font=F;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineCap='round';g.lineWidth=24;g.strokeStyle=kant;g.strokeText(txt,W/2,H/2+6,W-40);g.fillStyle=col;g.fillText(txt,W/2,H/2+6,W-40);
  g.lineWidth=2.5;g.strokeStyle='rgba(60,30,20,.35)';g.strokeText(txt,W/2,H/2+6,W-40);
  const tex=tx(c,true),v={tex,asp:W/H};PAPIRTEX.set(key,v);if(PAPIRTEX.size>90){const[k0,v0]=PAPIRTEX.entries().next().value;v0.tex.dispose();PAPIRTEX.delete(k0)}return v}
/* et stykke papir med teksten: forsiden får lys og skygge som papir, og en mørk kopi bagved giver tykkelse */
function papirTekstMesh(txt,col,h,font,kant){const{tex,asp}=papirTekstTex(txt,col,font,kant),G=new THREE.Group(),geo=new THREE.PlaneGeometry(h*asp,h);
  const bag=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,color:'#2a1a10',transparent:true,opacity:.45,alphaTest:.3,depthWrite:false}));bag.position.set(h*.05,-h*.07,-.08);bag.userData.noShadow=true;
  const for_=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.4,roughness:.95,metalness:0}));for_.userData.noShadow=true;G.add(bag,for_);
  G.userData.ryd=()=>{geo.dispose();bag.material.dispose();for_.material.dispose()};G.userData.b=h*asp;return G}
/* de små tekster, der popper op og falder ned */
function papirTekster(par){const L=[];
  return{pop(x,y,z,txt,{col='#ffd86b',h=2.2,font,tilt}={}){const G=papirTekstMesh(txt,col,h,font);G.position.set(x,y,z);G.rotation.z=tilt??(Math.random()-.5)*.25;G.scale.setScalar(.01);par.add(G);L.push({G,t:0,vy:0,spin:(Math.random()-.5)*3,y,x});return G},
    tick(dt){for(const q of L){q.t+=dt;const t=q.t;if(t<.14)q.G.scale.setScalar(.01+1.14*t/.14);else if(t<.24)q.G.scale.setScalar(1.15-.15*(t-.14)/.1);
        if(t<.9)q.G.position.y=q.y+t*1.2;else{q.vy-=34*dt;q.G.position.y+=q.vy*dt;q.G.position.x+=q.spin*.6*dt;q.G.rotation.z+=q.spin*dt}if(t>1.7){par.remove(q.G);q.G.userData.ryd();q.dod=true}}
      for(let i=L.length-1;i>=0;i--)if(L[i].dod)L.splice(i,1)},
    ryd(){for(const q of L){par.remove(q.G);q.G.userData.ryd()}L.length=0}}}
/* tallene på brikkerne: ét billede pr. ciffer, delt af alle tavler */
const PAPIRCIFRE=[];function papirCiffer(d){if(!PAPIRCIFRE.length)for(let i=0;i<=10;i++){const c=cv(96,128),g=c.getContext('2d');if(i<10){g.font=FONT.arkade.replace('X','100px');g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a1e10';g.fillText(String(i),48,70)}PAPIRCIFRE.push(tx(c,true))}return PAPIRCIFRE[d<0?10:d]}
/* tavlen: felter side om side, hvert med en lille overskrift og en række brikker */
function papirTavle(par,felter,{x=0,y=0,z=0,s=1,farve='#d8b07a',kant='#8a5a28'}={}){const G=new THREE.Group();G.position.set(x,y,z);G.scale.setScalar(s);par.add(G);
  const BW=1.6,BH=2.2,GAP=.14,PAD=.6,felt=[];let cx=PAD;const lag=[];
  for(const f of felter){const lt=papirTekstTex(f.navn,'#5a2a14',FONT.pil,'rgba(0,0,0,0)'),lh=2,lw=lh*lt.asp*.7,w=Math.max(lw,f.cifre*(BW+GAP)-GAP);lag.push({f,x0:cx,w,lt,lh,lw});cx+=w+PAD*1.6}
  const W=cx-PAD*1.6+PAD,H=BH+lag[0].lh*.62+PAD*1.6,x0=-W/2;
  put(G,piece(box(x0,-H/2,x0+W,H/2),{color:farve,kind:'kraft',t:.5,edge:kant}),0,0,0);
  for(const[bx,by]of[[x0+.45,H/2-.45],[x0+W-.45,H/2-.45],[x0+.45,-H/2+.45],[x0+W-.45,-H/2+.45]]){put(G,piece(circ(bx,by,.24,.24,12),{mat:gold(),t:.12}),0,0,.3);put(G,piece(box(bx-.15,by-.03,bx+.15,by+.03),{color:'#6e4b17',kind:'water',t:.02}),0,0,.38)}
  for(const l of lag){const fx=x0+l.x0,mid=fx+l.w/2,lm=new THREE.Mesh(new THREE.PlaneGeometry(l.lh*l.lt.asp,l.lh),new THREE.MeshStandardMaterial({map:l.lt.tex,transparent:true,alphaTest:.3,roughness:1}));lm.position.set(mid,H/2-PAD*.3-l.lh/2,.3);lm.userData.noShadow=true;G.add(lm);
    const by=-H/2+PAD*.7+BH/2,bx0=mid-(l.f.cifre*(BW+GAP)-GAP)/2+BW/2,br=[];
    for(let i=0;i<l.f.cifre;i++){const B=new THREE.Group();B.position.set(bx0+i*(BW+GAP),by,.3);G.add(B);put(B,piece(box(-BW/2,-BH/2,BW/2,BH/2),{color:'#fbf2dc',kind:'card',t:.22,edge:'#a88a5a'}),0,0,0);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(BW*.92,BH*.92),new THREE.MeshStandardMaterial({map:papirCiffer(-1),transparent:true,roughness:1}));m.position.z=.14;m.userData.noShadow=true;B.add(m);put(B,piece(box(-BW/2,-.02,BW/2,.02),{color:'#c8b898',kind:'water',t:.02}),0,0,.16);br.push({B,m,d:-1,ny:-1,t:1})}
    felt.push({br,v:null,cifre:l.f.cifre})}
  const vend=(b,d)=>{if(b.ny===d&&b.t<1)return;if(b.d===d&&b.t>=1)return;b.ny=d;b.t=0};
  return{G,saet(i,v){const f=felt[i];if(!f||f.v===v)return;f.v=v;const s=String(Math.max(0,Math.floor(v))).slice(-f.cifre).padStart(f.cifre,' ');[...s].forEach((ch,k)=>vend(f.br[k],ch===' '?-1:+ch))},
    tick(dt){for(const f of felt)for(const b of f.br){if(b.t>=1)continue;const t0=b.t;b.t=Math.min(1,b.t+dt/.22);if(t0<.5&&b.t>=.5){b.d=b.ny;b.m.material.map=papirCiffer(b.d);b.m.material.needsUpdate=true}b.B.scale.y=Math.max(.05,Math.abs(Math.cos(b.t*Math.PI)))}}}}
/* beskeden, der hænger i to snore: et lyst kort med en tekst og evt. en mindre linje under */
function papirBanner(par,{y=28,z=9,w=36,farve='#fbf2dc',kant='#a88a5a'}={}){const G=new THREE.Group();G.position.set(0,70,z);par.add(G);G.visible=false;let H=6;const ryd=[];
  const kort=new THREE.Group();G.add(kort);let state={vis:false,t:0,sek:0,y,sw:0};
  const byg=(txt,txt2,col)=>{for(const f of ryd)f();ryd.length=0;kort.clear();const h1=txt2?3.4:3.8,t1=papirTekstMesh(txt,col||'#c0283e',h1,FONT.arkade,'rgba(0,0,0,0)'),b1=Math.min(w-3,t1.userData.b);
      let b2=0,t2=null;if(txt2){t2=papirTekstMesh(txt2,'#3a2208',2.4,FONT.pil,'rgba(0,0,0,0)');b2=Math.min(w-3,t2.userData.b)}const W=Math.max(14,Math.max(b1,b2)+4);H=txt2?7.6:5.6;
      put(kort,piece(box(-W/2,-H/2,W/2,H/2),{color:farve,kind:'card',t:.4,edge:kant}),0,0,0);
      t1.scale.setScalar(b1/t1.userData.b);t1.position.set(0,txt2?1.25:0,.3);kort.add(t1);ryd.push(t1.userData.ryd);if(t2){t2.scale.setScalar(b2/t2.userData.b);t2.position.set(0,-1.95,.3);kort.add(t2);ryd.push(t2.userData.ryd)}
      for(const sx of[-1,1]){put(kort,piece(circ(sx*(W/2-1.2),H/2-.8,.3,.3,12),{mat:gold(),t:.12}),0,0,.3);for(const q of thick([[[sx*(W/2-1.2),H/2-.8],[sx*(W/2-1.6),40]]],.09))put(kort,piece(q,{color:'#ead9b5',kind:'water',t:.04}),0,0,-.1)}};
  return{G,vis(txt,{sek=1.6,txt2='',col,y:yy}={}){byg(txt,txt2,col);state={vis:true,t:0,sek,y:yy??y,sw:.22};G.visible=true;G.position.y=Math.max(G.position.y,yy??y+30)},skjul(){state.vis=false;state.sek=0},
    get synlig(){return G.visible&&state.vis},
    tick(dt){if(!G.visible)return;state.t+=dt;if(state.vis&&state.sek>0&&state.t>state.sek)state.vis=false;const maal=state.vis?state.y:state.y+40;G.position.y+=(maal-G.position.y)*Math.min(1,dt*(state.vis?7:4));
      state.sw*=Math.pow(.25,dt);G.rotation.z=Math.sin(state.t*5.2)*state.sw;if(!state.vis&&G.position.y>state.y+34)G.visible=false},
    fjern(){for(const f of ryd)f();par.remove(G)}}}
