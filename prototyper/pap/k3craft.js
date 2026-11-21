/* ============ håndværket: papirtyper, præcise snit, lag og huller ============
   Alt nyt bygges af "stykker": et præcist udskåret stykke papir/karton med tykkelse,
   evt. med huller (vinduer), og med et fælles papirmateriale, så intet skal males pr. stykke. */
const CL=ClipperLib,CS=1000;
const toC=pts=>pts.map(p=>({X:Math.round(p[0]*CS),Y:Math.round(p[1]*CS)}));
const fromC=path=>path.map(p=>[p.X/CS,p.Y/CS]);
function treeShapes(tree){const out=[];const walk=n=>{for(const ch of n.Childs()){if(ch.IsHole())continue;out.push({outer:fromC(ch.Contour()),holes:ch.Childs().map(h=>fromC(h.Contour()))});for(const h of ch.Childs())walk(h)}};walk(tree);return out}
function clip(subj,clp,type){const c=new CL.Clipper();c.AddPaths(subj.map(toC),CL.PolyType.ptSubject,true);if(clp&&clp.length)c.AddPaths(clp.map(toC),CL.PolyType.ptClip,true);
  const tree=new CL.PolyTree();c.Execute({union:CL.ClipType.ctUnion,inter:CL.ClipType.ctIntersection,diff:CL.ClipType.ctDifference}[type],tree,CL.PolyFillType.pftNonZero,CL.PolyFillType.pftNonZero);return treeShapes(tree)}
/* tykke linjer med runde led og ender (stier), og en form gjort større/mindre */
function thick(lines,w){const co=new CL.ClipperOffset(2,CS*.02);for(const l of lines)co.AddPath(toC(l),CL.JoinType.jtRound,CL.EndType.etOpenRound);const tree=new CL.PolyTree();co.Execute(tree,w*CS);return treeShapes(tree)}
function grow(pts,d,round=true){const co=new CL.ClipperOffset(2,CS*.02);co.AddPath(toC(pts),round?CL.JoinType.jtRound:CL.JoinType.jtMiter,CL.EndType.etClosedPolygon);const tree=new CL.PolyTree();co.Execute(tree,d*CS);return treeShapes(tree)}
const ring=(pts,d,round)=>clip(grow(pts,d,round).map(s=>s.outer),[pts],'diff');

/* præcise former */
const box=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
function arch(cx,y0,w,h,n=18){const r=w/2,yc=y0+h-r,o=[[cx-r,y0],[cx+r,y0],[cx+r,yc]];for(let i=1;i<n;i++){const a=i/n*Math.PI;o.push([cx+Math.cos(a)*r,yc+Math.sin(a)*r])}o.push([cx-r,yc]);return o}
function circ(cx,cy,rx,ry=rx,n=40){const o=[];for(let i=0;i<n;i++){const a=i/n*TAU;o.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry])}return o}
function wedge(cx,cy,r0,r1,a0,a1,n=6){const o=[];for(let i=0;i<=n;i++){const a=mix(a0,a1,i/n);o.push([cx+Math.cos(a)*r1,cy+Math.sin(a)*r1])}for(let i=n;i>=0;i--){const a=mix(a0,a1,i/n);o.push([cx+Math.cos(a)*r0,cy+Math.sin(a)*r0])}return o}
const area=p=>{let A=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];A+=a[0]*b[1]-b[0]*a[1]}return A/2};
const toCCW=p=>area(p)<0?p.slice().reverse():p,toCW=p=>area(p)>0?p.slice().reverse():p;

/* farver */
function rgbOf(c){if(c[0]==='#'){const n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}const m=c.match(/[\d.]+/g).map(Number);return m.slice(0,3)}
const rgba=(c,a)=>{const[r,g,b]=rgbOf(c);return`rgba(${r},${g},${b},${a})`};
const hexOf=c=>{const[r,g,b]=rgbOf(c);return'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('')};

/* ---- papirtyperne: sømløse fliser, tegnet én gang ---- */
function paperTile({tone=[244,240,232],mottle=7,fibers=1600,flen=[4,14],falpha=[.04,.1],noise=7,dots=0,dotR=[2,5],bumpFib=.25,gravel=0,S=512}){
  const c=cv(S,S),g=c.getContext('2d'),b=cv(S,S),h=b.getContext('2d');
  g.fillStyle=`rgb(${tone})`;g.fillRect(0,0,S,S);h.fillStyle='#808080';h.fillRect(0,0,S,S);
  const wrap=(x,y,r,f)=>{for(const ox of[-S,0,S])for(const oy of[-S,0,S]){if(x+ox+r<0||x+ox-r>S||y+oy+r<0||y+oy-r>S)continue;f(x+ox,y+oy)}};
  for(let i=0;i<60;i++){const x=R(S),y=R(S),r=R(40,140),d=rnd()<.5;wrap(x,y,r,(X,Y)=>{const gr=g.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,d?`rgba(90,70,50,${mottle/255})`:`rgba(255,255,255,${mottle/255})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(X-r,Y-r,2*r,2*r)})}
  for(let i=0;i<dots;i++){const x=R(S),y=R(S),r=R(...dotR),up=rnd()<.55;wrap(x,y,r,(X,Y)=>{const gr=h.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,up?'rgba(255,255,255,.45)':'rgba(0,0,0,.4)');gr.addColorStop(1,'rgba(128,128,128,0)');h.fillStyle=gr;h.fillRect(X-r,Y-r,2*r,2*r)})}
  for(let i=0;i<gravel;i++){const x=R(S),y=R(S),r=R(1,3.2),v=R(-50,40);wrap(x,y,r+2,(X,Y)=>{g.fillStyle=`rgba(${v<0?'70,55,40':'255,250,235'},${Math.abs(v)/160})`;g.beginPath();g.ellipse(X,Y,r,r*R(.6,1),R(3),0,TAU);g.fill();h.fillStyle='rgba(255,255,255,.5)';h.beginPath();h.ellipse(X,Y,r,r*.8,0,0,TAU);h.fill();h.fillStyle='rgba(0,0,0,.35)';h.beginPath();h.ellipse(X+r*.5,Y+r*.6,r*.8,r*.5,0,0,TAU);h.fill()})}
  g.lineCap=h.lineCap='round';
  for(let i=0;i<fibers;i++){const x=R(S),y=R(S),a=R(TAU),l=R(...flen),dx=Math.cos(a)*l,dy=Math.sin(a)*l,light=rnd()<.5;
    wrap(x,y,l,(X,Y)=>{g.strokeStyle=light?'rgba(255,255,255,1)':'rgba(110,90,70,1)';g.globalAlpha=R(...falpha);g.lineWidth=R(.5,1.2);g.beginPath();g.moveTo(X,Y);g.quadraticCurveTo(X+dx*.5+R(-2,2),Y+dy*.5+R(-2,2),X+dx,Y+dy);g.stroke();
      h.strokeStyle=light?'#fff':'#000';h.globalAlpha=bumpFib*R(.3,1);h.lineWidth=1;h.beginPath();h.moveTo(X,Y);h.lineTo(X+dx,Y+dy);h.stroke()})}
  g.globalAlpha=h.globalAlpha=1;
  const id=g.getImageData(0,0,S,S),d=id.data;for(let i=0;i<d.length;i+=4){const n=(rnd()-.5)*noise;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0);
  return{c,b}}
const PAPER={};
function makePapers(){if(PAPER.card)return;
  PAPER.card={...paperTile({tone:[246,243,236],mottle:5,fibers:1400,falpha:[.03,.08],noise:6,bumpFib:.2}),k:1/14,bs:.5};
  PAPER.water={...paperTile({tone:[248,245,238],mottle:8,fibers:900,falpha:[.03,.07],noise:6,dots:1700,dotR:[2,6],bumpFib:.15}),k:1/12,bs:1.1};
  PAPER.tissue={...paperTile({tone:[252,248,238],mottle:26,fibers:700,flen:[18,60],falpha:[.08,.2],noise:10,bumpFib:.1}),k:1/9,bs:.2};
  PAPER.sand={...paperTile({tone:[238,226,200],mottle:10,fibers:600,falpha:[.03,.07],noise:8,gravel:900,bumpFib:.15}),k:1/10,bs:.9};
  PAPER.kraft={c:KR.c,b:KR.b,k:1/12,bs:1.2};
  /* balsatræ med årer */
  {const S=256,c=cv(S,S),g=c.getContext('2d');g.fillStyle='#e8d2a6';g.fillRect(0,0,S,S);for(let i=0;i<90;i++){const y=R(S),a=R(.04,.16);g.strokeStyle=rnd()<.6?`rgba(150,105,60,${a})`:`rgba(255,240,210,${a})`;g.lineWidth=R(.6,2.4);g.beginPath();g.moveTo(0,y);for(let x=0;x<=S;x+=16)g.lineTo(x,y+Math.sin(x/S*TAU*2+i)*2);g.stroke()}
   PAPER.balsa={c,b:c,k:1/6,bs:.3}}
  /* pigmentkorn til akvarellen: hvidt med små mørke prikker */
  {const S=256,c=cv(S,S),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,S,S);for(let i=0;i<2600;i++){g.fillStyle=`rgba(60,40,70,${R(.05,.22)})`;g.beginPath();g.arc(R(S),R(S),R(.4,1.4),0,TAU);g.fill()}PAPER.gran={c}}
  for(const k in PAPER){if(k==='gran')continue;const p=PAPER[k];p.tex=tx(p.c,true);p.tex.wrapS=p.tex.wrapT=THREE.RepeatWrapping;p.btex=tx(p.b,false);p.btex.wrapS=p.btex.wrapT=THREE.RepeatWrapping}}
const MATS=new Map();
function paperMat(color,kind='card',o={}){const key=color+kind+JSON.stringify(o);if(MATS.has(key))return MATS.get(key);makePapers();const p=PAPER[kind];
  const m=new THREE.MeshStandardMaterial({color:new THREE.Color(hexOf(color)),map:p.tex,bumpMap:p.btex,bumpScale:p.bs,roughness:o.rough??.9,metalness:o.metal??0});
  if(o.glow){m.emissive=new THREE.Color(o.glow);m.emissiveMap=p.tex;m.emissiveIntensity=o.gi??1.6}
  if(o.env)m.envMapIntensity=o.env;MATS.set(key,m);return m}
/* guldfolie og den farvede kerne i kanten af et snit */
const gold=()=>paperMat('#e0b964','card',{metal:.85,rough:.33,env:3.2});
const coreOf=(c,kind)=>kind==='water'||kind==='tissue'?'#efe7d8':kind==='kraft'?'#b08a5a':hexOf(shade(hexOf(c),.1));

/* ---- geometri: en plade med tykkelse og huller; papiret ligger i verdens-målestok ---- */
function slabGeo(outer,holes,t,uv){
  outer=toCCW(outer);holes=(holes||[]).map(toCW);const loops=[outer,...holes];
  const tris=THREE.ShapeUtils.triangulateShape(outer.map(p=>new THREE.Vector2(p[0],p[1])),holes.map(h=>h.map(p=>new THREE.Vector2(p[0],p[1]))));
  const flat=[].concat(...loops),n=flat.length,pos=[],nor=[],uvs=[],fi=[],bi=[],si=[];
  for(const p of flat){pos.push(p[0],p[1],t/2);nor.push(0,0,1);uvs.push(...uv(p[0],p[1]))}
  for(const p of flat){pos.push(p[0],p[1],-t/2);nor.push(0,0,-1);uvs.push(...uv(p[0],p[1]))}
  for(let[a,b,c]of tris){const A=flat[a],B=flat[b],C=flat[c];if((B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0])<0)[b,c]=[c,b];fi.push(a,b,c);bi.push(n+a,n+c,n+b)}
  let v=2*n;for(const L of loops){let acc=0;for(let i=0;i<L.length;i++){const a=L[i],b=L[(i+1)%L.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1e-6,nx=dy/len,ny=-dx/len;
    pos.push(a[0],a[1],t/2,b[0],b[1],t/2,b[0],b[1],-t/2,a[0],a[1],-t/2);for(let k=0;k<4;k++)nor.push(nx,ny,0);uvs.push(acc/3,1,(acc+len)/3,1,(acc+len)/3,0,acc/3,0);acc+=len;si.push(v,v+3,v+2,v,v+2,v+1);v+=4}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex([...fi,...bi,...si]);g.addGroup(0,fi.length,0);g.addGroup(fi.length,bi.length,1);g.addGroup(fi.length+bi.length,si.length,2);return g}

/* maleren på rigtigt papir: akvarel-lag, ridsede fuger og en fin pen */
class Painter2 extends Painter{
  constructor(pts,s,opt={}){super(pts,s,Object.assign({},opt,{noBump:false}));makePapers();const B=PAPER[opt.base||'water'];
    const k=this.s/(B.k*B.c.width),fill=(ctx,img)=>{ctx.save();ctx.globalAlpha=1;ctx.scale(k,k);ctx.fillStyle=ctx.createPattern(img,'repeat');ctx.fillRect(0,0,this.w/k+2,this.h/k+2);ctx.restore()};
    fill(this.g,B.c);fill(this.hc,B.b)}
  clipTo(ctx,region){if(region){this.path(ctx,region);ctx.clip()}}
  /* et lag akvarel: gennemsigtig farve, mørkere kant hvor pigmentet samler sig, korn og skyer */
  wash(color,region,{alpha=.92,edge=.55,grain=.3,top=null,clouds=6,blur=.35,mode='multiply'}={}){const{w,h,s,g}=this,L=scratch(0,w,h),l=L.getContext('2d');
    l.clearRect(0,0,w,h);l.save();this.clipTo(l,region);
    if(top){const gr=l.createLinearGradient(0,this.Y(this.maxy),0,this.Y(this.miny));gr.addColorStop(0,top);gr.addColorStop(1,color);l.fillStyle=gr}else l.fillStyle=color;l.fillRect(0,0,w,h);
    for(let i=0;i<clouds;i++){const x=R(w),y=R(h),r=R(.15,.45)*Math.max(w,h),c2=shade(hexOf(color),R(-.14,.1)),gr=l.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(c2,.5));gr.addColorStop(1,rgba(c2,0));l.fillStyle=gr;l.fillRect(x-r,y-r,2*r,2*r)}
    if(grain){l.globalAlpha=grain;l.globalCompositeOperation='multiply';const p=l.createPattern(PAPER.gran.c,'repeat');l.fillStyle=p;l.fillRect(0,0,w,h);l.globalCompositeOperation='source-over';l.globalAlpha=1}
    if(region&&edge){l.globalCompositeOperation='source-atop';l.filter=`blur(${Math.max(1,blur*s*.5)}px)`;l.strokeStyle=shade(hexOf(color),-.3);l.globalAlpha=edge;l.lineWidth=blur*s;this.path(l,region);l.stroke();l.filter='none';l.globalAlpha=1;l.globalCompositeOperation='source-over'}
    l.restore();g.save();g.globalCompositeOperation=mode;g.globalAlpha=alpha;g.drawImage(L,0,0);g.restore()}
  /* en jævn, dækkende farve (farvet karton eller tryk) */
  flat(color,region,alpha=1){const g=this.g;g.save();g.globalAlpha=alpha;g.globalCompositeOperation='multiply';g.fillStyle=color;if(region){this.path(g,region);g.fill()}else g.fillRect(0,0,this.w,this.h);g.restore()}
  /* en ridset fuge: rille i relieffet og en svag mørk streg */
  score(pts,{w=.07,ink=.22,closed=false,dark='#3a2a40'}={}){const{g,hc}=this,lw=Math.max(1,w*this.s),P=pts.map(p=>[this.X(p[0]),this.Y(p[1])]);
    const tr=(ctx,dx,dy)=>{ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p[0]+dx,p[1]+dy):ctx.moveTo(p[0]+dx,p[1]+dy));if(closed)ctx.closePath();ctx.stroke()};
    hc.save();hc.lineCap=hc.lineJoin='round';hc.strokeStyle='#000';hc.globalAlpha=.55;hc.lineWidth=lw;tr(hc,0,0);hc.strokeStyle='#fff';hc.globalAlpha=.35;hc.lineWidth=lw*.6;tr(hc,lw*.6,lw*.6);hc.restore();
    g.save();g.lineCap=g.lineJoin='round';g.strokeStyle=dark;g.globalAlpha=ink;g.lineWidth=lw*.8;tr(g,0,0);g.strokeStyle='#fff';g.globalAlpha=ink*.5;g.lineWidth=lw*.5;tr(g,lw*.6,lw*.6);g.restore()}
  pen(pts,color,w=.06,alpha=.9,closed=false){const g=this.g;g.save();g.lineCap=g.lineJoin='round';g.strokeStyle=color;g.globalAlpha=alpha;g.lineWidth=Math.max(.8,w*this.s);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(this.X(p[0]),this.Y(p[1])):g.moveTo(this.X(p[0]),this.Y(p[1])));if(closed)g.closePath();g.stroke();g.restore()}
  /* kvadersten: rækker af forskellig højde, sten af forskellig bredde, hver med sin egen tone */
  ashlar(region,color,{rowH=[1.1,1.5],bw=[1.8,3.4],tint=.09,ink=.2}={}){const g=this.g;g.save();this.clipTo(g,region);this.hc.save();this.clipTo(this.hc,region);
    for(let y=this.miny,r=0;y<this.maxy;r++){const rh=R(...rowH);let x=this.minx-R(0,bw[0]);
      while(x<this.maxx){const sw=R(...bw),st=box(x+.04,y+.04,x+sw-.04,y+rh-.04);this.flat(shade(hexOf(color),R(-tint,tint*.6)),st,.35);this.score([...st,st[0]],{w:.08,ink});x+=sw}y+=rh}
    g.restore();this.hc.restore()}}

/* ---- et stykke: præcist udskåret, evt. med huller, af en bestemt papirtype ----
   shape: punkter eller {outer,holes}. paint: maler forsiden på akvarelpapir (ellers bruges det fælles papir). */
function piece(shape,{color='#ffffff',kind='card',t=.2,edge,paint,s=24,cap=1024,base,front,both=false,mat,fladt=false}={}){
  const outer=shape.outer||shape,holes=shape.holes||[];let fm,uv;
  if(paint){const P=new Painter2(outer,s,{cap,base:base||kind});paint(P);fm=new THREE.MeshStandardMaterial(fladt?{map:tx(P.c,true),roughness:.9}:{map:tx(P.c,true),bumpMap:tx(P.b,false),bumpScale:PAPER[base||kind].bs,roughness:.9});fm.userData.own=true;uv=(x,y)=>[(x-P.minx)/P.W,(y-P.miny)/P.H]}
  else{makePapers();fm=mat||paperMat(color,kind);const k=PAPER[kind].k;uv=(x,y)=>[x*k,y*k]}
  const bm=both?fm:paperMat(paint?'#f2ece0':color,paint?'water':kind),em=paperMat(edge||coreOf(paint?'#f2ece0':color,paint?'water':kind),'card');
  const m=new THREE.Mesh(slabGeo(outer,holes,t,uv),[fm,bm,em]);m.castShadow=m.receiveShadow=true;return m}
/* lægger flere stykker fra en clip-operation */
function pieces(shapes,o,parent,x=0,y=0,z=0){return shapes.map(s=>put(parent,piece(s,o),x,y,z))}
/* en firkantet balsapind */
function stick(parent,x,y0,y1,z,w=.5,color='#c9a575'){const m=new THREE.Mesh(new THREE.BoxGeometry(w,y1-y0,w),paperMat(color,'balsa'));m.castShadow=m.receiveShadow=true;return put(parent,m,x,(y0+y1)/2,z)}

/* ---- tag af tagsten: rækker af bølgekantede strimler, hver række lidt foran den over ---- */
function shingleRoof(parent,shape,{color,rowH=1.05,tile=1.3,z=0,dz=.1,t=.14,kind='card',vary=.05,backing=true}){
  let miny=1e9,maxy=-1e9,minx=1e9,maxx=-1e9;for(const[x,y]of shape){miny=Math.min(miny,y);maxy=Math.max(maxy,y);minx=Math.min(minx,x);maxx=Math.max(maxx,x)}
  if(backing)put(parent,piece(shape,{color:shade(hexOf(color),-.45),kind,t}),0,0,z-dz);
  let row=0;for(let y=maxy;y>miny-rowH;y-=rowH,row++){const top=y+rowH*.5,bot=y-rowH,ph=row%2?tile/2:0,band=[[maxx+1,top],[minx-1,top]];
    for(let x=minx-1-ph;x<maxx+1+tile;x+=tile){for(let k=0;k<=6;k++){const a=Math.PI+k/6*Math.PI;band.push([x+tile/2+Math.cos(a)*tile/2,bot+rowH*.45+Math.sin(a)*rowH*.45])}}
    const col=shade(hexOf(color),R(-vary,vary));pieces(clip([toCCW(band)],[shape],'inter'),{color:col,kind,t},parent,0,0,z+row*dz)}
  return z+row*dz}

/* ---- et vindue: hul i muren, silkepapir bag hullet der lyser, sprosser, karm og sålbænk ---- */
function windowParts(parent,shape,z,{t=.3,glow='#ffcf7a',lit=true,frame='#3a2c38',fw=.32,mull='#3a2c38',cross=true,sill='#b9b0c9',curtain=null}={}){
  let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;for(const[x,y]of shape){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}
  const cx=(minx+maxx)/2,back=z-t/2;
  put(parent,piece(grow(shape,.35)[0].outer,{t:.03,mat:lit?paperMat('#fff0c8','tissue',{glow,gi:1.7}):paperMat('#3a3350','tissue')}),0,0,back-.08);
  if(curtain)for(const s of[-1,1]){const x0=s<0?minx:maxx,cw=(maxx-minx)*.3,cp=[[x0,maxy+.2],[x0+(s<0?cw:-cw),maxy+.2],[x0+(s<0?cw*.35:-cw*.35),mix(miny,maxy,.45)],[x0+(s<0?cw*.8:-cw*.8),miny-.2],[x0,miny-.2]];
    pieces(clip([toCCW(cp)],[shape],'inter'),{color:curtain,kind:'tissue',t:.03,mat:paperMat(curtain,'tissue',lit?{glow:shade(hexOf(curtain),.2),gi:.5}:{})},parent,0,0,back-.04)}
  const mw=.14,strips=[box(cx-mw/2,miny-1,cx+mw/2,maxy+1)];if(cross)strips.push(box(minx-1,mix(miny,maxy,.52)-mw/2,maxx+1,mix(miny,maxy,.52)+mw/2));
  pieces(clip(strips,[shape],'inter'),{color:mull,t:.08},parent,0,0,back+.06);
  pieces(ring(shape,fw,false),{color:frame,t:.14},parent,0,0,z+t/2+.07);
  if(sill)put(parent,piece(box(minx-fw-.25,miny-fw-.32,maxx+fw+.25,miny-fw+.02),{color:sill,kind:'water',t:.34}),0,0,z+t/2+.17)}

/* ---- flere værktøjer: huse med dør og sted, skilte, malede mønstre, tråde og kroner ---- */
const HOUSE={},HOUSEG=[];
/* et hus er en gruppe; door = midt for døren (x,z), spot = hvor heksen stiller sig */
function house(name,door,spot){const g=new THREE.Group();g.userData.house=name;scene.add(g);HOUSE[name]={g,door,spot};HOUSEG.push(g);SPOTS[name]=spot;return g}
/* et skilt: plade, kant og bygningens egen skrift — mærket, så kvalitetstjekket kan finde det */
function plate(parent,name,text,font,w,h,{bg='#241632',fg='#f6e7c0',frame=null,goldText=false,size=h*.55,ls=0,x=0,y=0,z=0,shadow=null,stroke=null,sw=.12,extra=null,t=.2}={}){
  const g=new THREE.Group();put(parent,g,x,y,z);
  if(frame)put(g,piece(box(-w/2-.28,-.28,w/2+.28,h+.28),frame==='gold'?{mat:gold(),t:.14}:{color:frame,kind:'balsa',t:.16}),0,0,-.12);
  const m=piece(box(-w/2,0,w/2,h),{t,s:Math.min(60,1100/w),base:'card',paint:P=>{P.flat(bg);P.text(text,0,h/2+size*.04,size,fg,{font,ls,gold:goldText,shadow,stroke,sw});extra&&extra(P)}});
  m.userData.sign=name;g.add(m);return g}
/* malede mønstre på akvarelpapir */
function boards(P,region,color,{h=.9,dir='h',ink=.25}={}){P.wash(color,region,{grain:.25,clouds:8,edge:.35});const g=P.g;g.save();P.clipTo(g,region);P.hc.save();P.clipTo(P.hc,region);
  if(dir==='h')for(let y=P.miny;y<P.maxy;y+=h){P.flat(shade(hexOf(color),-.18),box(P.minx,y,P.maxx,y+h*.22),.45);P.flat(shade(hexOf(color),R(-.05,.05)),box(P.minx,y,P.maxx,y+h),.25);P.score([[P.minx,y],[P.maxx,y]],{w:.07,ink})}
  else for(let x=P.minx;x<P.maxx;x+=h){P.flat(shade(hexOf(color),R(-.07,.05)),box(x,P.miny,x+h,P.maxy),.35);P.score([[x,P.miny],[x,P.maxy]],{w:.07,ink});for(let k=0;k<2;k++){const y=R(P.miny,P.maxy);P.pen([[x+h*.3,y],[x+h*.5,y+.2]],shade(hexOf(color),-.3),.04,.35)}}
  g.restore();P.hc.restore()}
function brickwork(P,region,color,{bw=1.5,bh=.62,tint=.12,ink=.3}={}){P.wash(color,region,{grain:.3,clouds:8,edge:.35});const g=P.g;g.save();P.clipTo(g,region);P.hc.save();P.clipTo(P.hc,region);
  for(let y=P.miny,r=0;y<P.maxy;y+=bh,r++)for(let x=P.minx-(r%2?bw/2:0);x<P.maxx;x+=bw){const b=box(x+.05,y+.05,x+bw-.05,y+bh-.05);P.flat(shade(hexOf(color),R(-tint,tint*.5)),b,.4);P.score([...b,b[0]],{w:.07,ink})}
  g.restore();P.hc.restore()}
/* en tråd/snor i rummet */
function cord(parent,pts,r=.05,color='#e9e4d8'){const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(8,pts.length*8),r,5,false),paperMat(color,'card'));m.castShadow=true;parent.add(m);return m}
/* en bulet krone/sky: cirkel med buer langs kanten */
function puff(cx,cy,rx,ry,n=9,bump=.22,seed=0){const o=[];const ph=R(TAU);for(let i=0;i<n;i++){const a0=i/n*TAU+ph,a1=(i+1)/n*TAU+ph,am=(a0+a1)/2,k=1+R(-.08,.08);
  const p0=[cx+Math.cos(a0)*rx,cy+Math.sin(a0)*ry],p1=[cx+Math.cos(a1)*rx,cy+Math.sin(a1)*ry],bx=cx+Math.cos(am)*rx*(1+bump)*k,by=cy+Math.sin(am)*ry*(1+bump)*k;
  for(let j=0;j<6;j++){const t=j/6,u=1-t;o.push([u*u*p0[0]+2*u*t*bx+t*t*p1[0],u*u*p0[1]+2*u*t*by+t*t*p1[1]])}}return o}
/* et udklippet blad */
const leafPts=(x,y,l,w,a)=>{const o=[];for(let i=0;i<=8;i++){const t=i/8,yy=-l/2+t*l,xx=Math.sin(t*Math.PI)*w/2;o.push([xx,yy])}for(let i=7;i>0;i--){const t=i/8,yy=-l/2+t*l,xx=-Math.sin(t*Math.PI)*w/2;o.push([xx,yy])}return o.map(([px,py])=>[x+px*Math.cos(a)-py*Math.sin(a),y+px*Math.sin(a)+py*Math.cos(a)])};
