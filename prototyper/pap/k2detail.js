/* ============ værktøjskassen til kortet: skrift, vinduer, tegl, sten og skilte ============ */
/* tætheden på pappets maling: kortet ses på afstand, så stykkerne behøver ikke males lige så fint som i garderoben */
let DENS=.6;
{const _mk=makeCard;makeCard=(pts,o={})=>_mk(pts,Object.assign({},o,{s:(o.s||30)*DENS,cap:Math.min(o.cap||1536,1280)}))}
/* hver bygning har sin egen skrift */
const FONT={
  skole:'700 X "Cinzel Decorative",Georgia,serif',
  kollegie:'700 X "Fraunces",Georgia,serif',
  bobler:'600 X "Fredoka","Trebuchet MS",sans-serif',
  arkade:'400 X "Rye",Georgia,serif',
  koncert:'400 X "Limelight",Georgia,serif',
  broend:'400 X "MedievalSharp",Georgia,serif',
  dyr:'400 X "Alfa Slab One",Georgia,serif',
  stoevle:'400 X "Berkshire Swash",Georgia,serif',
  drage:'400 X "Pirata One",Georgia,serif',
  pil:'700 X "Alegreya SC",Georgia,serif',
  snart:'400 X "Special Elite","Courier New",monospace'};
Painter.prototype.text=function(str,x,y,size,color,o={}){const g=this.g;g.save();g.font=(o.font||FONT.pil).replace('X',`${size*this.s}px`);
  if('letterSpacing' in g&&o.ls)g.letterSpacing=`${o.ls*this.s}px`;g.textAlign=o.align||'center';g.textBaseline='middle';
  const X=this.X(x),Y=this.Y(y);
  if(o.shadow){g.globalAlpha=.55;g.fillStyle=o.shadow;g.fillText(str,X+.08*this.s,Y+.1*this.s)}
  if(o.stroke){g.globalAlpha=1;g.lineJoin='round';g.lineWidth=(o.sw||.16)*this.s;g.strokeStyle=o.stroke;g.strokeText(str,X,Y)}
  g.globalAlpha=o.alpha??.97;
  if(o.gold){const m=g.measureText(str),gr=g.createLinearGradient(0,Y-size*this.s*.5,0,Y+size*this.s*.5);gr.addColorStop(0,'#fff1b8');gr.addColorStop(.45,'#e9b949');gr.addColorStop(.55,'#b7832a');gr.addColorStop(1,'#f3d27a');g.fillStyle=gr}else g.fillStyle=color;
  g.fillText(str,X,Y);g.restore()};
const BLK='#2b1d16';
/* vindue med karm, varmt lys indenfor, sprosser, sålbænk og evt. skodder, gardiner og blomsterkasse */
function win(P,x,y,w,h,o={}){const top=o.arch?h-w/2:h;
  const frame=o.arch?outline([[x-w/2,y,1],[x+w/2,y,1],[x+w/2,y+top],[x+w*.35,y+h-w*.08],[x,y+h],[x-w*.35,y+h-w*.08],[x-w/2,y+top]],4,.01):outline(rect(x-w/2,y,x+w/2,y+h),1,.01);
  P.fill(frame,o.frame||BLK,.97);
  const i=Math.min(w,h)*.12,glass=o.arch?outline([[x-w/2+i,y+i,1],[x+w/2-i,y+i,1],[x+w/2-i,y+top],[x+w*.3,y+h-w*.1-i],[x,y+h-i],[x-w*.3,y+h-w*.1-i],[x-w/2+i,y+top]],4,.01):outline(rect(x-w/2+i,y+i,x+w/2-i,y+h-i),1,.01);
  const lit=o.lit!==false;P.fill(glass,lit?(o.glow||'#ffc455'):'#2a2440',.97);
  if(lit){const g=P.g,cx=P.X(x),cy=P.Y(y+h*.45),r=Math.max(w,h)*P.s*.6;g.save();P.path(g,glass);g.clip();const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'rgba(255,248,210,.85)');gr.addColorStop(1,'rgba(255,160,40,0)');g.fillStyle=gr;g.fillRect(cx-r,cy-r,2*r,2*r);g.restore()}
  if(o.curtain){for(const s of[-1,1])P.fill(outline([[x+s*(w/2-i),y+i,1],[x+s*(w/2-i-w*.22),y+i,1],[x+s*(w/2-i-w*.1),y+h*.55],[x+s*(w/2-i-w*.28),y+h-i*1.3],[x+s*(w/2-i),y+h-i,1]],3,.01),o.curtain,.9)}
  const mc=o.mull||'#5a3d1e';P.line([[x,y+i],[x,y+h-i]],mc,Math.max(.06,w*.06),.9);if(h>w*1.1||o.cross)P.line([[x-w/2+i,y+top*.55],[x+w/2-i,y+top*.55]],mc,Math.max(.06,w*.06),.9);
  P.fill(outline(rect(x-w/2-.2,y-.35,x+w/2+.2,y+.05),1,.01),o.sill||'#8a6a4a',.97);
  if(o.shutter)for(const s of[-1,1]){const sx=x+s*(w/2+w*.28);P.fill(outline(rect(sx-w*.25,y,sx+w*.25,y+top),1,.01),o.shutter,.95);for(let yy=y+.35;yy<y+top-.2;yy+=.45)P.line([[sx-w*.2,yy],[sx+w*.2,yy]],shade(o.shutter,-.3),.04,.7)}
  if(o.box){P.fill(outline(rect(x-w/2-.1,y-1.1,x+w/2+.1,y-.3),1,.01),'#6b4428',.97);for(let k=0;k<7;k++)P.fill(ell(x-w/2+.3+k*(w-.6)/6,y-.15+R(-.1,.2),.32,.3,8,.1),k%2?'#e05a8a':'#f2c230',.95);P.dabs('#4f8a3a',14,{x0:x-w/2,x1:x+w/2,y0:y-.4,y1:y+.1,len:.35,w:.08,dir:1.57,spread:.6,alpha:.8})}}
/* tagsten i rækker med buede kanter */
function shingles(P,region,col,rowH=.9,tile=1.1){P.coat(col,region,{dir:0,bw:.4});const{minx,maxx,miny,maxy}=P;const g=P.g;g.save();if(region){P.path(g,region);g.clip()}
  for(let y=miny,r=0;y<maxy;y+=rowH,r++){for(let x=minx+(r%2?tile/2:0);x<maxx;x+=tile){const arc=[];for(let k=0;k<=6;k++){const a=Math.PI+k/6*Math.PI;arc.push([x+tile/2+Math.cos(a)*tile/2,y+rowH*.95+Math.sin(a)*rowH*.55])}P.line(arc,shade(col,-.35),.06,.75);if(rnd()<.18)P.fill(outline(rect(x+.1,y+.1,x+tile-.1,y+rowH*.8),1,.01),shade(col,R(-.12,.12)),.5)}}
  g.restore()}
/* mursten og natursten */
function bricks(P,region,col,bw=1.6,bh=.7){P.coat(col,region,{dir:0,bw:.5});const{minx,maxx,miny,maxy}=P;const g=P.g;g.save();if(region){P.path(g,region);g.clip()}
  for(let y=miny,r=0;y<maxy;y+=bh,r++){P.line([[minx,y],[maxx,y]],shade(col,-.3),.05,.55);for(let x=minx+(r%2?bw/2:0);x<maxx;x+=bw){P.line([[x,y],[x,y+bh]],shade(col,-.3),.045,.5);if(rnd()<.25)P.fill(outline(rect(x+.06,y+.06,x+bw-.06,y+bh-.06),1,.005),shade(col,R(-.15,.12)),.45)}}
  g.restore()}
function stones(P,region,col,n=60,size=1.4){P.coat(shade(col,-.25),region,{dir:0,bw:.5});const{minx,maxx,miny,maxy}=P;const g=P.g;g.save();if(region){P.path(g,region);g.clip()}
  for(let i=0;i<n;i++){const x=R(minx,maxx),y=R(miny,maxy),r=size*R(.6,1.1),e=ell(x,y,r,r*R(.6,.85),9,.12);P.fill(e,shade(col,R(-.12,.15)),.97);P.line([...e,e[0]],shade(col,-.45),.05,.6);P.line(e.slice(1,4),shade(col,.35),.05,.5)}g.restore()}
/* dør med planker, bue, beslag og håndtag */
function door(P,x,y,w,h,col,o={}){const top=h-w/2,sh=outline([[x-w/2,y,1],[x+w/2,y,1],[x+w/2,y+top],[x+w*.35,y+h-w*.08],[x,y+h],[x-w*.35,y+h-w*.08],[x-w/2,y+top]],4,.01);
  P.fill(sh,BLK,.97);const ins=outline([[x-w/2+.25,y,1],[x+w/2-.25,y,1],[x+w/2-.25,y+top],[x+w*.32,y+h-w*.1-.25],[x,y+h-.25],[x-w*.32,y+h-w*.1-.25],[x-w/2+.25,y+top]],4,.01);
  P.coat(col,ins,{dir:1.57,bw:.25});for(let xx=x-w/2+w/4;xx<x+w/2-.2;xx+=w/4)P.line([[xx,y],[xx,y+h-.4]],shade(col,-.35),.06,.8);
  if(!o.noIron)for(const yy of[y+h*.25,y+h*.6])P.line([[x-w/2+.3,yy],[x+w/2-.3,yy]],'#3a3a44',.12,.85);
  P.fill(ell(x+w*.3,y+h*.42,.18,.18,8,.05),'#e9b949',.97)}
/* efeu der klatrer op ad en mur */
function ivy(P,pts){P.line(curve(pts,6),'#3d5a2a',.1,.85);for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]];for(let k=0;k<6;k++){const t=k/6,x=mix(a[0],b[0],t)+R(-.6,.6),y=mix(a[1],b[1],t)+R(-.4,.4);P.fill(ell(x,y,.32,.26,7,.15),rnd()<.5?'#4f7a35':'#6b9a3f',.95)}}}
/* et skilt: plade med kant og bygningens egen skrift */
function sign(text,font,w,h,bg,fg,o={}){return makeCard(outline(o.shape||rect(-w/2,0,w/2,h),o.shape?6:1,.015),{t:.35,s:46,paint:P=>{
  P.coat(bg,null,{dir:0,bw:.3,vary:.06,gaps:.4});
  if(o.border)P.line([...outline(rect(-w/2+.25,.25,w/2-.25,h-.25),1,0),[-w/2+.25,.25]],o.border,.09,.9);
  P.text(text,0,h/2+(o.dy||0),o.size||h*.55,fg,{font,ls:o.ls,gold:o.gold,stroke:o.stroke,sw:o.sw,shadow:o.shadow});
  o.extra&&o.extra(P)}})}
