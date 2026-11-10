'use strict';
/* ================= Glimmer Studio — tegning af dukken (SVG i lag) ================= */
const W = 800, H = 1100;

/* ---------- farver ---------- */
function hex2rgb(h){ h=String(h).replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16)||0; return [n>>16&255,n>>8&255,n&255]; }
function rgb2hex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function rgb2hsl(r,g,b){ r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0,s=0; const l=(mx+mn)/2;
  if(mx!==mn){ const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h= mx===r?(g-b)/d+(g<b?6:0): mx===g?(b-r)/d+2:(r-g)/d+4; h/=6; } return [h,s,l]; }
function hsl2rgb(h,s,l){ if(s===0) return [l*255,l*255,l*255]; const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q;
  const f=t=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
  return [f(h+1/3)*255,f(h)*255,f(h-1/3)*255]; }
function adj(hex, dl, ds=0){ const [h,s,l]=rgb2hsl(...hex2rgb(hex)); return rgb2hex(...hsl2rgb(h, Math.max(0,Math.min(1,s+ds)), Math.max(0,Math.min(1,l+dl)))); }
const shade = c => adj(c,-0.12);
const outline = c => adj(c,-0.32,0.05);

/* ---------- animation (kun i spejlet) ---------- */
let ANIM = false;
const easeKeys = n => ({ kt: Array.from({length:n},(_,i)=>(i/(n-1)).toFixed(3)).join(';'), ks: Array(n-1).fill('0.45 0 0.55 1').join(';') });
function spin(s, cx, cy, vals, dur, begin=0){
  if (!ANIM) return s; const e = easeKeys(vals.length);
  return `<g><animateTransform attributeName="transform" type="rotate" values="${vals.map(v=>`${v} ${cx} ${cy}`).join(';')}" keyTimes="${e.kt}" calcMode="spline" keySplines="${e.ks}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${s}</g>`;
}
function squash(s, cx, cy, vals, dur, begin=0){
  if (!ANIM) return s; const e = easeKeys(vals.length);
  return `<g transform="translate(${cx},${cy})"><g><animateTransform attributeName="transform" type="scale" values="${vals.join(';')}" keyTimes="${e.kt}" calcMode="spline" keySplines="${e.ks}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><g transform="translate(${-cx},${-cy})">${s}</g></g></g>`;
}
function blinkLid(content, period, begin=0){
  if (!ANIM) return '';
  return `<g opacity="0"><animate attributeName="opacity" values="0;1;0" keyTimes="0;0.94;0.975" calcMode="discrete" dur="${period}s" begin="${begin}s" repeatCount="indefinite"/>${content}</g>`;
}

/* ---------- markering af en ny ting: pulserende kant, resten dæmpet ---------- */
const HLW = (on, s) => on && s ? '<!--HL-->' + s + '<!--/HL-->' : s;
function hlCompose(content, settle=4.6){
  if (!content.includes('<!--HL-->')) return content;
  const parts = content.split(/<!--HL-->|<!--\/HL-->/);
  const paint = (x, col) => x.replace(/(fill|stroke)="(?!none)[^"]*"/g, `$1="${col}"`).replace(/ id="([^"]+)"/g, ' id="m_$1"').replace(/url\(#([^)]+)\)/g, 'url(#m_$1)');
  const maskBody = parts.map((x, i) => paint(x, i % 2 ? '#FFFFFF' : '#000000')).join('');
  const clean = parts.join('');
  return `<defs><mask id="hlM" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1600" height="1900">${maskBody}</mask>`
    + `<filter id="hlGlow" x="-40%" y="-40%" width="180%" height="180%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"><animate attributeName="radius" values="3;10;3" dur="1.3s" repeatCount="indefinite"/></feMorphology>`
    + `<feFlood flood-color="#FF3D8F">${settle ? `<animate attributeName="flood-opacity" from="1" to="0" begin="${settle}s" dur="0.9s" fill="freeze"/>` : ''}</feFlood><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="2.5" result="ob"/><feMerge><feMergeNode in="ob"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    + `<filter id="hlDim"><feColorMatrix type="saturate" values="0.3">${settle ? `<animate attributeName="values" from="0.3" to="1" begin="${settle}s" dur="1s" fill="freeze"/>` : ''}</feColorMatrix></filter></defs>`
    + `<g opacity="0.4" filter="url(#hlDim)">${settle ? `<animate attributeName="opacity" from="0.4" to="1" begin="${settle}s" dur="1s" fill="freeze"/>` : ''}${clean}</g><g filter="url(#hlGlow)"><g mask="url(#hlM)">${clean}</g></g>`;
}

/* ---------- dukken i ro: kigger til siden og vinker en gang imellem ---------- */
let IDLE = null;
function makeIdle(canWave){
  const T = +(15 + Math.random()*7).toFixed(2), ev = [];
  const free = (a, b) => ev.every(e => b < e.a - 0.6 || a > e.b + 0.6);
  if (canWave){ for (let i=0;i<20;i++){ const a = 2 + Math.random()*(T-6); if (free(a, a+2.6)){ ev.push({ kind:'wave', a, b:a+2.6 }); break; } } }
  for (let n=0;n<2;n++) for (let i=0;i<30;i++){ const a = 1 + Math.random()*(T-3.5), b = a + 1.6 + Math.random()*0.8; if (free(a, b)){ ev.push({ kind:'look', a, b, d: Math.random()<0.5 ? -1 : 1 }); break; } }
  ev.sort((x,y) => x.a - y.a);
  return { T, ev };
}
function trackPoints(kind, valFn){
  const pts = [[0,0]];
  for (const e of IDLE.ev.filter(e => e.kind === kind)){ const v = valFn(e); pts.push([e.a,0],[e.a+0.25,v],[e.b-0.25,v],[e.b,0]); }
  pts.push([IDLE.T,0]);
  return pts;
}
function lookAnim(sign){
  if (!IDLE || !ANIM) return '';
  const pts = trackPoints('look', e => e.d * 10 * sign);
  return `<animateTransform attributeName="transform" type="translate" values="${pts.map(p=>p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p=>(p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>`;
}
function headTurn(s){
  if (!IDLE || !ANIM) return s;
  const pts = trackPoints('look', e => e.d * 6);
  return `<g><animateTransform attributeName="transform" type="translate" values="${pts.map(p=>p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p=>(p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>${s}</g>`;
}
/* vis en gruppe kun i bestemte tidsrum */
function showDuring(s, wins){
  if (!IDLE || !ANIM) return s;
  const T = IDLE.T, inWin = t => wins.some(([a,b]) => t >= a && t < b);
  const cuts = [0, ...wins.flat().filter(t => t > 0 && t < T)].sort((a,b)=>a-b);
  const vals = cuts.map(t => inWin(t + 0.001) ? 1 : 0);
  return `<g opacity="${vals[0]}"><animate attributeName="opacity" calcMode="discrete" values="${vals.join(';')}" keyTimes="${cuts.map(t=>(t/T).toFixed(4)).join(';')}" dur="${T}s" repeatCount="indefinite"/>${s}</g>`;
}

/* ---------- små figurer ---------- */
function star4(cx, cy, r, fill='#FFFFFF', op=1){
  return `<path d="M ${cx} ${cy-r} Q ${cx} ${cy} ${cx+r} ${cy} Q ${cx} ${cy} ${cx} ${cy+r} Q ${cx} ${cy} ${cx-r} ${cy} Q ${cx} ${cy} ${cx} ${cy-r} Z" fill="${fill}" opacity="${op}"/>`; }
function star5pts(cx, cy, R, r, rot=-90){ const p=[]; for(let i=0;i<10;i++){ const a=(rot+i*36)*Math.PI/180, rad=i%2?r:R; p.push(`${(cx+rad*Math.cos(a)).toFixed(1)},${(cy+rad*Math.sin(a)).toFixed(1)}`);} return p.join(' '); }
function heart(cx, cy, s, fill, stroke='none', sw=0, extra=''){
  return `<path transform="translate(${cx},${cy}) scale(${s})" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`; }
const mirror = s => `<g transform="translate(${W},0) scale(-1,1)">${s}</g>`;
const lines = (list, color, op=0.35, w=3) => list.map(d=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`).join('');

/* ---------- arme og positur ---------- */
const ARM_R_DOWN = {S:[470,630],E:[500,700],H:[510,766]}, ARM_R_UP = {S:[470,630],E:[524,688],H:[546,626]}, ARM_R_MID = {S:[470,630],E:[516,694],H:[552,690]};
const ARMS = { L:{S:[330,630],E:[286,700],H:[338,744]}, R:ARM_R_DOWN };
let ARM_ONLY = null;
const SIDES = () => ARM_ONLY || ['L','R'];
function seg(a,b){ const dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy); return {dx:dx/l, dy:dy/l, l}; }
function armLen(a){ return seg(a.S,a.E).l + seg(a.E,a.H).l; }
function armAt(a, t){ const u=seg(a.S,a.E), f=seg(a.E,a.H);
  return t<=u.l ? [a.S[0]+u.dx*t, a.S[1]+u.dy*t] : [a.E[0]+f.dx*(t-u.l), a.E[1]+f.dy*(t-u.l)]; }
function armPts(a, t0, t1){ const u=seg(a.S,a.E); const p=[armAt(a,t0)]; if(t0<u.l && t1>u.l) p.push(a.E); p.push(armAt(a,t1)); return p; }
const poly = pts => 'M '+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L ');
function strokeBoth(d, fill, line, w, cap='round'){
  return `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w+5}" stroke-linecap="${cap}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`; }
function armSkin(c){ return SIDES().map(k=>{ const a=ARMS[k]; return strokeBoth(poly([a.S,a.E,a.H]), c.skin, c.skinLine, 27); }).join(''); }
function hands(c){
  return SIDES().map(k=>{ const a=ARMS[k], f=seg(a.E,a.H); const cx=a.H[0]+f.dx*6, cy=a.H[1]+f.dy*6;
    const ang=Math.atan2(f.dy,f.dx)*180/Math.PI; const side = k==='R'?1:-1;
    const px=-f.dy*side, py=f.dx*side; const tx=cx+px*11-f.dx*3, ty=cy+py*11-f.dy*3;
    return `<ellipse cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" rx="8" ry="6" transform="rotate(${ang.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5"/>`
         + `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="17" ry="14" transform="rotate(${ang.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5"/>`;
  }).join('');
}
function longSleeves(fill, line, cuff){
  return SIDES().map(k=>{ const a=ARMS[k], L=armLen(a), f=seg(a.E,a.H);
    const d=poly(armPts(a,0,L-34)); const m=armAt(a,L-21); const px=-f.dy, py=f.dx;
    const P=(s,t)=>`${(m[0]+px*s+f.dx*t).toFixed(1)},${(m[1]+py*s+f.dy*t).toFixed(1)}`;
    return strokeBoth(d, fill, line, 40) + `<polygon points="${P(-22,-8)} ${P(22,-8)} ${P(22,8)} ${P(-22,8)}" fill="${cuff}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/>`;
  }).join('');
}
function puffs(fillUrl, line){
  return SIDES().map(k=>{ const a=ARMS[k], u=seg(a.S,a.E); const cx=a.S[0]+u.dx*6, cy=a.S[1]+u.dy*6; const ang=Math.atan2(u.dy,u.dx)*180/Math.PI;
    return `<g transform="rotate(${ang.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="34" ry="30" fill="${fillUrl}" stroke="${line}" stroke-width="3"/>`
         + `<path d="M ${(cx-6).toFixed(1)} ${(cy-22).toFixed(1)} Q ${(cx+12).toFixed(1)} ${(cy-20).toFixed(1)} ${(cx+22).toFixed(1)} ${(cy-6).toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.5"/></g>`;
  }).join('');
}
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

/* ================= HÅR ================= */
const CROWN = "M 400 158 C 540 158, 624 268, 620 400 C 619 436, 606 462, 586 478 L 214 478 C 194 462, 181 436, 180 400 C 176 268, 260 158, 400 158 Z";
const crown = c => `<path d="${CROWN}" fill="${c.hairMid}" stroke="${c.hairLine}" stroke-width="3"/>`;
const hairGrad = (c,id,y1,y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}"><stop offset="0" stop-color="${c.hairMid}"/><stop offset="0.45" stop-color="${c.hairA}"/><stop offset="1" stop-color="${c.hairTip}"/></linearGradient>`;
function hairPiece(c, id, d, y1, y2, strands=[], shine=[]){
  return `<defs>${hairGrad(c,id+'G',y1,y2)}<clipPath id="${id}C"><path d="${d}"/></clipPath></defs>`
    + `<path d="${d}" fill="url(#${id}G)" stroke="${c.hairLine}" stroke-width="3" stroke-linejoin="round"/>`
    + `<g clip-path="url(#${id}C)">${lines(strands,c.hairLine)}${lines(shine,'#FFFFFF',0.28,10)}</g>`;
}
const TAIL = "M 236 280 C 150 262, 66 344, 76 468 C 82 556, 56 622, 94 704 C 116 752, 158 792, 206 794 C 182 762, 190 724, 206 692 C 232 632, 222 562, 232 502 C 240 442, 250 402, 264 360 Z";
const BOB = "M 400 158 C 545 158, 630 262, 628 400 C 627 480, 642 548, 668 604 Q 640 626, 598 612 C 560 600, 520 560, 400 560 C 280 560, 240 600, 202 612 Q 160 626, 132 604 C 158 548, 173 480, 172 400 C 170 262, 255 158, 400 158 Z";
const LONG = "M 400 158 C 548 158, 634 262, 632 400 C 632 540, 652 700, 646 858 Q 610 874, 572 856 C 560 780, 520 680, 470 620 L 330 620 C 280 680, 240 780, 228 856 Q 190 874, 154 858 C 148 700, 168 540, 168 400 C 166 262, 252 158, 400 158 Z";
const PONY = "M 486 200 C 590 140, 700 230, 690 380 C 682 500, 708 600, 650 730 C 656 640, 624 560, 610 480 C 598 400, 572 300, 500 262 Z";

function scrunchie(c, x, y, rot, rx=20, ry=30){
  return `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c.tie}" stroke="${c.tieLine}" stroke-width="3"/>`
   + `<path d="M ${x-10} ${y-16} Q ${x+2} ${y} ${x-6} ${y+18}" fill="none" stroke="${c.tieLine}" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/>`
   + `<path d="M ${x+4} ${y-20} Q ${x+16} ${y-2} ${x+8} ${y+16}" fill="none" stroke="${c.tieLine}" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/></g>`;
}
function bun(c, bx, flip){
  return `<g transform="translate(${bx},196) scale(${flip},1)"><circle r="64" fill="url(#bunG)" stroke="${c.hairLine}" stroke-width="3"/>`
   + `<path d="M -38 -24 C -20 -52, 26 -50, 40 -16 C 50 12, 26 40, -2 40" fill="none" stroke="${c.hairLine}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>`
   + `<path d="M -22 -10 C -8 -28, 20 -24, 24 -2 C 26 14, 10 22, -4 18" fill="none" stroke="${c.hairLine}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>`
   + `<path d="M -46 -10 C -40 -36, -18 -50, 6 -52" fill="none" stroke="#FFFFFF" stroke-width="9" opacity="0.45" stroke-linecap="round"/></g>`;
}
const BOB_STRANDS = ["M 176 420 C 172 500, 160 560, 140 604","M 624 420 C 628 500, 640 560, 660 604","M 200 470 C 200 530, 196 570, 186 600","M 600 470 C 600 530, 604 570, 614 600"];

const BACK = {
  rottehaler: { label:'Rottehaler', back: c => {
      const t = `<path d="${TAIL}" fill="url(#tlG)" stroke="${c.hairLine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<g clip-path="url(#tlC)">${lines(["M 170 320 C 110 400, 118 520, 128 600 C 136 670, 150 730, 190 780","M 214 330 C 170 420, 176 540, 176 620 C 176 680, 172 720, 186 760"],c.hairLine,0.32)}${lines(["M 128 360 C 92 440, 104 540, 100 610"],'#FFFFFF',0.28,10)}</g>`;
      const ts = spin(t, 236, 300, [0,2.4,0,-1.8,0], 3.2);
      return `<defs>${hairGrad(c,'tlG',300,790)}<clipPath id="tlC"><path d="${TAIL}"/></clipPath></defs>` + ts + mirror(ts) + crown(c); },
    over: c => scrunchie(c,212,300,28) + mirror(scrunchie(c,212,300,28)) },
  knolde: { label:'Knolde', back: c =>
      `<defs><radialGradient id="bunG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="${c.hairA}"/><stop offset="1" stop-color="${c.hairMid}"/></radialGradient></defs>`
      + bun(c,258,1) + bun(c,542,-1) + hairPiece(c,'bb',BOB,200,620,BOB_STRANDS) },
  page: { label:'Page', back: c => hairPiece(c,'bb',BOB,200,620,BOB_STRANDS,["M 152 470 C 150 530, 146 570, 140 596"]) },
  langt: { label:'Langt hår', back: c => hairPiece(c,'lg',LONG,200,860,
      ["M 186 420 C 180 560, 176 700, 180 850","M 614 420 C 620 560, 624 700, 620 850","M 230 520 C 220 640, 214 740, 210 850","M 570 520 C 580 640, 586 740, 590 850","M 200 300 C 170 380, 166 450, 168 520","M 600 300 C 630 380, 634 450, 632 520"],
      ["M 168 460 C 162 560, 162 660, 168 760"]) },
  hestehale: { label:'Hestehale', back: c => spin(hairPiece(c,'pn',PONY,180,730,
      ["M 560 200 C 640 220, 668 330, 662 420 C 656 520, 668 600, 650 700","M 520 236 C 590 280, 628 380, 632 470"],["M 620 230 C 668 290, 676 360, 670 430"]), 510, 220, [0,-3,0,2.5,0], 2.8) + crown(c),
    over: c => scrunchie(c,566,200,-50,16,26) },
  kroeller: { label:'Krøller', back: c => {
      const pts=[]; for(let a=122; a<=418; a+=14.8){ const r=a*Math.PI/180; pts.push([400+238*Math.cos(r), 396+236*Math.sin(r)]); }
      let o = `<defs><linearGradient id="krG" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="680"><stop offset="0" stop-color="${c.hairA}"/><stop offset="0.6" stop-color="${c.hairMid}"/><stop offset="1" stop-color="${c.hairTip}"/></linearGradient><clipPath id="krC"><rect x="0" y="0" width="800" height="590"/></clipPath></defs>`;
      o += pts.map(([x,y])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="61" fill="${c.hairLine}"/>`).join('');
      o += pts.map(([x,y])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="58" fill="url(#krG)"/>`).join('');
      o += `<ellipse cx="400" cy="396" rx="238" ry="236" fill="url(#krG)" clip-path="url(#krC)"/>`;
      o += pts.map(([x,y],i)=>`<path d="M ${(x-20).toFixed(1)} ${(y+6).toFixed(1)} C ${(x-22).toFixed(1)} ${(y-22).toFixed(1)}, ${(x+22).toFixed(1)} ${(y-24).toFixed(1)}, ${(x+18).toFixed(1)} ${(y+2).toFixed(1)} C ${(x+14).toFixed(1)} ${(y+18).toFixed(1)}, ${(x-6).toFixed(1)} ${(y+14).toFixed(1)}, ${(x-4).toFixed(1)} ${(y).toFixed(1)}" fill="none" stroke="${c.hairLine}" stroke-width="3" opacity="0.35" stroke-linecap="round"/>`
        + (i%3===0?`<path d="M ${(x-30).toFixed(1)} ${(y-12).toFixed(1)} Q ${(x-20).toFixed(1)} ${(y-36).toFixed(1)} ${(x+4).toFixed(1)} ${(y-40).toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-width="7" opacity="0.3" stroke-linecap="round"/>`:'')).join('');
      return o; } },
  kort: { label:'Kort hår', back: c => crown(c) },
  kortkrol: { label:'Korte krøller', back: c => {
      const pts=[]; for(let a=160; a<=380; a+=13.75){ const r=a*Math.PI/180; pts.push([400+214*Math.cos(r), 336+186*Math.sin(r)]); }
      let o = `<defs><linearGradient id="kkG" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="480"><stop offset="0" stop-color="${c.hairA}"/><stop offset="1" stop-color="${c.hairMid}"/></linearGradient><clipPath id="kkC"><rect x="0" y="0" width="800" height="470"/></clipPath></defs>`;
      o += pts.map(([x,y])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="47" fill="${c.hairLine}"/>`).join('');
      o += pts.map(([x,y])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="44" fill="url(#kkG)"/>`).join('');
      o += `<ellipse cx="400" cy="336" rx="214" ry="186" fill="url(#kkG)" clip-path="url(#kkC)"/>`;
      o += pts.map(([x,y])=>`<path d="M ${(x-14).toFixed(1)} ${(y+4).toFixed(1)} C ${(x-16).toFixed(1)} ${(y-16).toFixed(1)}, ${(x+16).toFixed(1)} ${(y-18).toFixed(1)}, ${(x+13).toFixed(1)} ${(y+1).toFixed(1)}" fill="none" stroke="${c.hairLine}" stroke-width="3" opacity="0.35" stroke-linecap="round"/>`).join('');
      return o; } },
  fletninger: { label:'Fletninger', back: c => {
      let one = '';
      for(let i=7;i>=0;i--){ const x = 214 + (i%2? 7:-7), y = 472 + i*40; const rot = i%2? 24:-24;
        one += `<ellipse cx="${x}" cy="${y}" rx="30" ry="25" transform="rotate(${rot} ${x} ${y})" fill="url(#flG)" stroke="${c.hairLine}" stroke-width="3"/>`
             + `<path d="M ${x-14} ${y-8} Q ${x} ${y-16} ${x+12} ${y-10}" transform="rotate(${rot} ${x} ${y})" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.35" stroke-linecap="round"/>`; }
      const ty = 472 + 8*40 - 14;
      one = `<path d="M 196 ${ty} Q 186 ${ty+40} 174 ${ty+66} Q 204 ${ty+52} 214 ${ty+70} Q 224 ${ty+52} 254 ${ty+66} Q 242 ${ty+40} 232 ${ty} Z" fill="${c.hairTip}" stroke="${c.hairLine}" stroke-width="3" stroke-linejoin="round"/>` + one
          + `<ellipse cx="214" cy="${ty+2}" rx="22" ry="11" fill="${c.tie}" stroke="${c.tieLine}" stroke-width="3"/>`;
      const os = spin(one, 214, 460, [0,2.2,0,-2,0], 3.4);
      return `<defs>${hairGrad(c,'flG',440,780)}</defs>` + os + mirror(os) + crown(c); } },
};

const FRONT_BOELGE = "M 214 482 C 196 444, 184 404, 186 352 C 186 240, 280 162, 400 162 C 520 162, 614 240, 614 352 C 616 404, 604 444, 586 482 C 584 420, 578 356, 566 302 C 552 318, 530 326, 508 322 C 492 312, 480 296, 474 276 C 466 298, 444 318, 418 318 C 402 308, 390 290, 384 270 C 376 296, 350 320, 322 322 C 310 312, 300 296, 296 278 C 290 300, 272 324, 246 326 C 240 318, 237 310, 236 302 C 226 356, 218 420, 214 482 Z";
const FRONT_SIDE = "M 194 572 C 176 500, 172 420, 178 350 C 186 240, 284 160, 400 160 C 516 160, 614 240, 622 350 C 628 420, 624 500, 606 572 C 596 520, 588 450, 582 400 C 578 370, 576 345, 572 318 C 564 330, 548 340, 524 340 C 510 326, 498 312, 490 296 C 476 308, 460 314, 442 312 C 432 298, 426 284, 422 270 C 406 278, 390 284, 372 282 C 364 270, 356 258, 352 244 C 300 250, 252 290, 236 340 C 226 380, 222 430, 222 480 C 222 512, 214 544, 194 572 Z";
const FRONT_MIDT = "M 194 572 C 176 500, 172 420, 178 350 C 186 240, 284 160, 400 160 C 516 160, 614 240, 622 350 C 628 420, 624 500, 606 572 C 596 520, 590 450, 584 400 C 574 320, 500 232, 400 212 C 300 232, 226 320, 216 400 C 210 450, 204 520, 194 572 Z";
const FRONT_LIGE = "M 194 572 C 176 500, 172 420, 178 350 C 186 240, 284 160, 400 160 C 516 160, 614 240, 622 350 C 628 420, 624 500, 606 572 C 596 520, 588 450, 582 400 C 578 370, 576 345, 572 320 C 500 334, 300 334, 228 320 C 224 345, 222 370, 218 400 C 212 450, 204 520, 194 572 Z";
const FRONT_INGEN = "M 186 380 C 182 250, 284 160, 400 160 C 516 160, 618 250, 614 380 C 600 300, 520 232, 400 228 C 280 232, 200 300, 186 380 Z";
function frontPjusket(){
  let d = "M 194 572 C 176 500, 172 420, 178 350 C 186 240, 284 160, 400 160 C 516 160, 614 240, 622 350 C 628 420, 624 500, 606 572 C 596 520, 588 450, 582 400 C 578 370, 576 345, 572 312 ";
  const x0=572, x1=228, n=7, step=(x0-x1)/n, tips=[352,334,356,340,354,332,348]; let x=x0;
  for(let i=0;i<n;i++){ const tx=x-step*0.55, nx=x-step, ty=tips[i];
    d += `Q ${(x-step*0.18).toFixed(1)} ${ty-20} ${tx.toFixed(1)} ${ty} Q ${(tx-step*0.08).toFixed(1)} ${ty-34} ${nx.toFixed(1)} ${i===n-1?312:294} `; x=nx; }
  return d + "C 224 350, 222 400, 218 430 C 212 470, 204 520, 194 572 Z";
}
const FRONT_PJUSKET = frontPjusket();
const FRONT_KORTSIDE = "M 194 392 C 182 256, 282 158, 400 158 C 518 158, 618 256, 606 392 C 600 352, 592 326, 580 302 C 548 324, 494 326, 446 308 C 404 292, 364 268, 334 248 C 300 266, 252 296, 220 336 C 208 352, 200 370, 194 392 Z";
function frontKortkrol(){
  let d = "M 194 400 C 182 258, 280 158, 400 158 C 520 158, 618 258, 606 400 C 600 362, 592 330, 580 300 ";
  const n = 8, x0 = 580, x1 = 220, w = (x0-x1)/n; let x = x0;
  for (let i=0;i<n;i++){ x -= w; d += `A ${(w/2+2).toFixed(1)} 24 0 0 1 ${x.toFixed(1)} 300 `; }
  return d + "C 212 330, 202 362, 194 400 Z";
}
const FRONT_KORTKROL = frontKortkrol();
const SIDE_STRANDS = ["M 198 380 C 196 440, 200 500, 206 560","M 602 380 C 604 440, 600 500, 594 560"];
const FRONT = {
  boelge: { label:'Bølger', d: FRONT_BOELGE, strands:["M 474 276 C 470 240, 450 210, 420 180","M 384 270 C 378 240, 372 210, 380 176","M 296 278 C 292 246, 304 216, 330 184","M 236 302 C 232 270, 244 236, 270 204","M 566 302 C 570 270, 558 236, 532 204","M 200 380 C 200 420, 206 450, 214 476","M 600 380 C 600 420, 594 450, 586 476"] },
  side: { label:'Sidefej', d: FRONT_SIDE, strands:["M 524 340 C 520 280, 490 220, 440 186","M 442 312 C 436 260, 410 210, 370 182","M 372 282 C 360 240, 330 206, 300 192","M 566 316 C 572 270, 560 230, 530 200", ...SIDE_STRANDS] },
  midt: { label:'Midterskilning', d: FRONT_MIDT, strands:["M 400 212 C 460 214, 530 250, 568 320","M 400 212 C 340 214, 270 250, 232 320","M 400 190 C 470 196, 550 240, 590 330","M 400 190 C 330 196, 250 240, 210 330", ...SIDE_STRANDS] },
  lige: { label:'Lige pandehår', d: FRONT_LIGE, strands:["M 280 326 L 284 230","M 340 330 L 342 200","M 400 330 L 400 196","M 460 330 L 458 200","M 520 326 L 516 230", ...SIDE_STRANDS] },
  pjusket: { label:'Pjusket', d: FRONT_PJUSKET, strands:["M 524 340 C 520 290, 500 240, 470 200","M 450 330 C 446 280, 430 230, 400 196","M 376 336 C 370 290, 350 240, 320 206","M 300 336 C 296 290, 286 250, 266 222", ...SIDE_STRANDS] },
  kortside: { label:'Kort sideskilning', d: FRONT_KORTSIDE, strands:["M 446 308 C 440 260, 420 214, 386 186","M 520 320 C 520 270, 504 226, 476 196","M 580 302 C 584 262, 570 228, 546 206","M 334 248 C 320 220, 300 204, 280 196"] },
  kortkrol: { label:'Krøllet pandehår', d: FRONT_KORTKROL, strands:["M 286 300 C 280 270, 290 230, 310 210","M 376 300 C 374 266, 380 230, 396 204","M 466 300 C 468 266, 462 232, 446 206","M 552 300 C 560 270, 552 236, 532 214"] },
  ingen: { label:'Strøget tilbage', d: FRONT_INGEN, strands:["M 400 228 C 400 210, 400 190, 400 166","M 320 238 C 314 214, 300 196, 290 182","M 480 238 C 486 214, 500 196, 510 182"] },
};
function frontLayer(c, key){
  const f = FRONT[key] || FRONT.boelge;
  return `<defs><clipPath id="frC"><path d="${f.d}"/></clipPath></defs>`
   + `<path d="${f.d}" fill="url(#fringeG)" stroke="${c.hairLine}" stroke-width="3" stroke-linejoin="round"/>`
   + `<g clip-path="url(#frC)"><path d="M 214 300 C 250 236, 320 204, 400 204 C 480 204, 550 236, 586 300 C 560 262, 490 236, 400 236 C 310 236, 240 262, 214 300 Z" fill="${c.hairHi}" opacity="0.6"/>${lines(f.strands,c.hairLine)}</g>`
   + star4(300,222,9) + star4(470,214,7) + star4(540,250,6);
}

/* ================= ANSIGT ================= */
const HEAD = "M 400 190 C 525 190, 602 285, 602 398 C 602 512, 505 586, 400 586 C 295 586, 198 512, 198 398 C 198 285, 275 190, 400 190 Z";
const EYE = "M -52 6 C -52 -40, -22 -60, 6 -60 C 36 -60, 54 -34, 54 4 C 54 40, 30 58, 2 58 C -28 58, -52 40, -52 6 Z";
function eye(cx, cy, flip, c){
  const s = flip?-1:1, id = flip?'R':'L', L='#1B1330', pc='#14122B';
  let g = `<g transform="translate(${cx},${cy})"><g transform="scale(${s},1)">`;
  if (c.shadowOn) g += `<path d="M -60 -14 C -68 -54, -34 -88, 8 -88 C 44 -88, 62 -58, 62 -14 C 50 -46, 30 -62, 6 -62 C -22 -62, -46 -44, -60 -14 Z" fill="url(#shadowG)"/>`;
  g += `<clipPath id="ec${id}"><path d="${EYE}"/></clipPath><path d="${EYE}" fill="#FFFFFF"/><g clip-path="url(#ec${id})">`;
  g += `<g>${lookAnim(s)}<circle cx="1" cy="6" r="42" fill="url(#irisG)"/><circle cx="1" cy="6" r="42" fill="none" stroke="${c.eyeDark}" stroke-width="5"/>`;
  g += `<path d="M -27 27 C -14 45, 18 45, 31 27 C 20 38, -16 38, -27 27 Z" fill="${c.eyeLight}" opacity="0.9"/>`;
  if (c.pupil==='hjerte') g += heart(2, 10, 2.4, pc);
  else if (c.pupil==='stjerne') g += `<polygon points="${star5pts(2,7,25,11)}" fill="${pc}" stroke="${pc}" stroke-width="3" stroke-linejoin="round"/>`;
  else if (c.pupil==='glimt') g += `<ellipse cx="2" cy="4" rx="12" ry="16" fill="${pc}"/>`;
  else g += `<ellipse cx="2" cy="2" rx="17" ry="22" fill="${pc}"/>`;
  g += `</g><path d="M -60 -70 L 64 -70 L 64 -40 C 40 -30, -30 -30, -60 -36 Z" fill="#2A1640" opacity="0.16"/></g>`;
  if (c.liner==='ingen') g += `<path d="M -52 4 C -52 -40, -22 -60, 6 -60 C 36 -60, 54 -34, 54 2" fill="none" stroke="${L}" stroke-width="4.5" stroke-linecap="round"/>`;
  else {
    g += `<path d="M -58 10 C -60 -44, -26 -68, 6 -68 C 40 -68, 60 -40, 59 2 C 54 -30, 34 -55, 6 -55 C -18 -55, -42 -40, -47 -4 C -50 2, -54 8, -58 10 Z" fill="${L}"/>`;
    if (c.liner==='vinge') g += `<path d="M -57 4 C -61 -8, -69 -19, -80 -28 C -67 -29, -56 -30, -46 -31 Z" fill="${L}"/><path d="M -45 -36 C -49 -44, -54 -51, -60 -57 C -50 -54, -42 -51, -34 -48 Z" fill="${L}"/>`;
    else g += `<path d="M -50 -26 C -55 -32, -60 -36, -66 -40 C -57 -40, -50 -38, -44 -36 Z" fill="${L}"/><path d="M -36 -46 C -39 -52, -42 -56, -46 -61 C -38 -58, -32 -55, -28 -52 Z" fill="${L}"/>`;
  }
  g += `<path d="M -51 22 C -44 48, -16 62, 8 61" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
  g += `<path d="M -50 -86 Q -8 -110 40 -97" fill="none" stroke="${c.brow}" stroke-width="7" stroke-linecap="round"/>`;
  if (c.shadowOn && c.glitter) for (const [x,y,r] of [[-40,-58,5],[-8,-76,6],[28,-70,4.5],[48,-44,4]]) g += star4(x,y,r,'#FFFFFF',0.95);
  g += `</g><g>${lookAnim(1)}<circle cx="-15" cy="-20" r="14" fill="#FFFFFF"/><circle cx="22" cy="26" r="6.5" fill="#FFFFFF"/>` + star4(-30,14,6,'#FFFFFF',0.9);
  if (c.pupil==='glimt') g += star4(16,-2,14,'#FFFFFF',0.95) + `<circle cx="-26" cy="-2" r="4" fill="#FFFFFF"/>`;
  g += `</g>`;
  g += blinkLid(`<g transform="scale(${s},1)"><path d="${EYE}" transform="scale(1.14)" fill="${c.skin}"/><path d="M -58 6 Q 0 34 60 4" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`
    + (c.liner==='vinge' ? `<path d="M -56 8 Q -70 2 -80 -10" fill="none" stroke="${L}" stroke-width="4.5" stroke-linecap="round"/>` : '') + `</g>`, 4.4, 0.6);
  return g + `</g>`;
}
function mouth(c){
  if (c.lipShape==='smil') return `<path d="M 377 527 Q 400 552 423 527 Q 400 541 377 527 Z" fill="${c.lips}" stroke="${c.lipsDark}" stroke-width="2.5" stroke-linejoin="round"/><path d="M 373 524 Q 375 529 379 529 M 427 524 Q 425 529 421 529" fill="none" stroke="${c.lipsDark}" stroke-width="2.5" stroke-linecap="round"/>`;
  if (c.lipShape==='grin') return `<path d="M 376 523 Q 400 528 424 523 Q 421 556 400 557 Q 379 556 376 523 Z" fill="#7A1F3D" stroke="${c.lips}" stroke-width="4" stroke-linejoin="round"/><path d="M 380 526 Q 400 530 420 526 L 418 535 Q 400 538 382 535 Z" fill="#FFFFFF"/><path d="M 388 549 Q 400 540 412 549 Q 400 556 388 549 Z" fill="#FF8FB0"/>`;
  return `<path d="M 380 531 C 386 524, 395 523, 400 528 C 405 523, 414 524, 420 531 C 412 534, 406 535, 400 535 C 394 535, 388 534, 380 531 Z" fill="${c.lipsDark}"/>`
    + `<path d="M 381 532 C 390 536, 410 536, 419 532 C 415 547, 385 547, 381 532 Z" fill="url(#lipG)"/><ellipse cx="405" cy="540" rx="6" ry="2.5" fill="#FFFFFF" opacity="0.7"/>`
    + `<path d="M 374 526 Q 376 531 381 532 M 426 526 Q 424 531 419 532" fill="none" stroke="${c.lipsDark}" stroke-width="2.5" stroke-linecap="round"/>`;
}
function faceMark(c){
  const m = c.markColor;
  switch (c.mark){
    case 'hjerte': return heart(560,486,1.1,m);
    case 'stjerne': return `<polygon points="${star5pts(560,486,12,5.5)}" fill="${m}" stroke="${m}" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'fregner': return [[330,498],[346,505],[362,497],[438,497],[454,505],[470,498],[338,512],[462,512]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.2" fill="${m}" opacity="0.7"/>`).join('');
    case 'glimmer': return star4(568,470,9,m) + star4(550,494,5,m) + star4(586,494,4,m) + star4(234,474,6,m);
    default: return '';
  }
}
function headLayer(c, frontKey, hl){
  let o = `<path d="${HEAD}" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="3"/><g clip-path="url(#headC)">`;
  o += `<path d="${(FRONT[frontKey]||FRONT.boelge).d}" transform="translate(0,14)" fill="${c.skinSh}" opacity="0.75"/>`;
  if (c.blushOn) o += `<ellipse cx="262" cy="512" rx="48" ry="27" fill="url(#blushG)"/><ellipse cx="538" cy="512" rx="48" ry="27" fill="url(#blushG)"/>`;
  o += `</g>`;
  if (c.blushOn) for (const x of [252,268,284,516,532,548]) o += `<path d="M ${x} 518 l 6 -12" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`;
  o += HLW(hl==='pupil' || hl==='liner', eye(316,440,false,c) + eye(484,440,true,c));
  o += `<path d="M 393 500 Q 400 507 407 500" fill="none" stroke="${c.skinLine}" stroke-width="3" stroke-linecap="round"/>`;
  return o + HLW(hl==='lip', mouth(c)) + HLW(hl==='mark', faceMark(c));
}

/* ================= TØJ (kropskoordinater, flyttes 22 ned) ================= */
const TORSO = "M 372 596 Q 400 614 428 596 C 448 600, 470 606, 476 626 C 478 640, 466 660, 462 680 C 460 700, 458 720, 458 738 L 342 738 C 342 720, 340 700, 338 680 C 334 660, 322 640, 324 626 C 330 606, 352 600, 372 596 Z";
const TEE = "M 370 598 Q 400 622 430 598 L 462 606 C 474 650, 462 696, 458 738 L 342 738 C 338 696, 326 650, 338 606 Z";
function scallops(x0, x1, y, n, depth){ let d=''; const st=(x1-x0)/n; for(let i=0;i<n;i++){ const a=x0+st*i, b=a+st; d += ` Q ${(a+st/2).toFixed(1)} ${y+depth} ${b.toFixed(1)} ${y}`; } return d; }

const TOPS = {
  stjerne: { label:'T-shirt med stjerne', tucked:true, body: c =>
      `<defs>${grad('tpG',c.topA,c.topASh)}</defs>`
      + `<path d="${TEE}" fill="url(#tpG)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`
      + `<polygon points="${star5pts(400,668,30,13)}" fill="${c.topB}" stroke="${c.topBLine}" stroke-width="3" stroke-linejoin="round"/>` + star4(392,660,6)
      + `<path d="M 370 598 Q 400 622 430 598 L 436 606 Q 400 634 364 606 Z" fill="#FFFFFF" stroke="${c.topALine}" stroke-width="2.5" stroke-linejoin="round"/>`,
    sleeves: c => puffs('url(#tpG)', c.topALine) },
  haettetroeje: { label:'Hættetrøje', back: c => `<path d="M 340 604 C 340 570, 460 570, 460 604 C 460 630, 340 630, 340 604 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="3"/>`,
    body: c => {
      let o = `<defs>${grad('tpG',c.topA,c.topASh)}</defs><path d="M 368 598 Q 400 620 432 598 L 470 610 C 486 660, 484 730, 486 784 Q 400 800 314 784 C 316 730, 314 660, 330 610 Z" fill="url(#tpG)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`;
      o += `<path d="M 316 770 Q 400 786 484 770 L 486 790 Q 400 806 314 790 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`;
      for (let x=326; x<480; x+=12) o += `<path d="M ${x} ${(776+(x-400)**2/3000).toFixed(0)} l 0 14" stroke="${c.topALine}" stroke-width="1.8" opacity="0.4"/>`;
      o += `<path d="M 350 722 L 450 722 L 466 768 Q 400 778 334 768 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`;
      o += heart(400,670,2.6,c.topB,c.topBLine,1.2) + star4(388,650,6) + star4(432,640,7,'#FFE27A') + star4(366,692,5,'#FFE27A');
      o += `<path d="M 362 598 Q 400 632 438 598 Q 440 612 432 618 Q 400 640 368 618 Q 360 612 362 598 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`;
      for (const [x1,x2] of [[386,382],[414,418]]) o += `<path d="M ${x1} 628 Q ${x1-2} 652 ${x2} 676" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/><rect x="${x2-3.5}" y="672" width="7" height="12" rx="3" fill="${c.topB}" stroke="${c.topBLine}" stroke-width="1.5"/>`;
      return o; },
    sleeves: c => longSleeves(c.topA, c.topALine, c.topASh) },
  stropper: { label:'Top med stropper', tucked:true, body: c =>
      `<defs>${grad('tpG',c.topA,c.topASh)}</defs>`
      + strokeBoth("M 352 646 L 362 604", c.topA, c.topALine, 6) + strokeBoth("M 448 646 L 438 604", c.topA, c.topALine, 6)
      + `<path d="M 344 640 C 370 630, 386 646, 400 652 C 414 646, 430 630, 456 640 C 462 670, 458 704, 458 738 L 342 738 C 342 704, 338 670, 344 640 Z" fill="url(#tpG)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M 346 646 C 370 637, 386 652, 400 658 C 414 652, 430 637, 454 646" fill="none" stroke="${c.topB}" stroke-width="4" stroke-dasharray="1 7" stroke-linecap="round"/>`
      + `<g transform="translate(400,660)"><path d="M 0 0 C -12 -14, -26 -12, -24 0 C -26 12, -12 14, 0 0 Z M 0 0 C 12 -14, 26 -12, 24 0 C 26 12, 12 14, 0 0 Z" fill="${c.topB}" stroke="${c.topBLine}" stroke-width="2.5" stroke-linejoin="round"/><circle r="6" fill="${c.topB}" stroke="${c.topBLine}" stroke-width="2.5"/></g>`
      + star4(372,700,5) + star4(430,712,4) + star4(410,690,3.5) },
  striber: { label:'Stribet trøje', body: c =>
      `<defs><pattern id="stripeP" patternUnits="userSpaceOnUse" width="20" height="28"><rect width="20" height="28" fill="${c.topA}"/><rect y="14" width="20" height="14" fill="${c.topB}"/></pattern></defs>`
      + `<path d="M 370 598 Q 400 622 430 598 L 462 606 C 474 650, 466 710, 468 754 Q 400 766 332 754 C 334 710, 326 650, 338 606 Z" fill="url(#stripeP)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M 334 744 Q 400 756 466 744 L 468 758 Q 400 770 332 758 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M 368 598 Q 400 624 432 598 L 438 606 Q 400 636 362 606 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="2.5" stroke-linejoin="round"/>`,
    sleeves: c => longSleeves('url(#stripeP)', c.topALine, c.topASh) },
  jakke: { label:'Jakke', body: c => {
      let o = `<defs>${grad('tpG',c.topA,c.topASh)}</defs><path d="${TEE}" fill="${c.topB}" stroke="${c.topBLine}" stroke-width="3" stroke-linejoin="round"/>` + heart(400,684,1.3,c.topA);
      const panel = `<path d="M 372 597 L 338 606 C 326 650, 334 710, 334 754 L 386 758 L 382 682 Z" fill="url(#tpG)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 372 598 L 352 628 L 366 640 L 382 682 Z" fill="${c.topASh}" stroke="${c.topALine}" stroke-width="2.5" stroke-linejoin="round"/>`
        + `<path d="M 344 724 L 370 722" stroke="${c.topALine}" stroke-width="3" stroke-linecap="round"/>`;
      o += panel + mirror(panel);
      for (const y of [700,728]) o += `<circle cx="372" cy="${y}" r="4.5" fill="#FFE27A" stroke="#C99A12" stroke-width="1.5"/>`;
      return o; },
    sleeves: c => longSleeves(c.topA, c.topALine, c.topASh) },
  glimmer: { label:'Glimmertop', body: c => {
      let o = `<defs>${grad('tpG',c.topA,c.topASh)}<pattern id="seqP" patternUnits="userSpaceOnUse" width="14" height="12"><circle cx="3.5" cy="3" r="3" fill="${c.topB}" opacity="0.9"/><circle cx="10.5" cy="9" r="3" fill="#FFFFFF" opacity="0.7"/></pattern></defs>`;
      o += strokeBoth("M 360 618 L 380 600", c.topA, c.topALine, 6) + strokeBoth("M 440 618 L 420 600", c.topA, c.topALine, 6);
      const top = "M 350 614 C 376 606, 424 606, 450 614 C 460 650, 456 700, 458 730 L 342 730 C 344 700, 340 650, 350 614 Z";
      o += `<path d="${top}" fill="url(#tpG)"/><path d="${top}" fill="url(#seqP)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`;
      o += `<path d="M 342 724 L 458 724 L 476 768 ${scallops(476,324,768,7,14).trim()} Z" fill="url(#tpG)" stroke="${c.topALine}" stroke-width="3" stroke-linejoin="round"/>`;
      o += `<path d="M 346 726 L 454 726" stroke="${c.topALine}" stroke-width="3"/>`;
      return o + star4(380,640,6) + star4(428,668,7) + star4(366,700,4) + star4(446,752,5); } },
};

const BOTTOMS = {
  plisse: { label:'Plisseret nederdel', main: c => {
      let o = `<defs>${grad('btG',c.botA,c.botASh)}</defs><path d="M 344 726 L 456 726 C 482 770, 504 812, 512 838 Q 400 868 288 838 C 296 812, 318 770, 344 726 Z" fill="url(#btG)" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>`;
      for (const [x1,x2] of [[368,334],[390,374],[410,426],[432,466]]) o += `<path d="M ${x1} 742 L ${x2} 838" stroke="${c.botALine}" stroke-width="2.5" opacity="0.45" stroke-linecap="round"/>`;
      o += `<path d="M 293 826 Q 400 856 507 826 L 512 838 Q 400 868 288 838 Z" fill="${c.botB}" opacity="0.7"/>`;
      for (const [x,y] of [[320,800],[360,812],[444,806],[480,794],[402,790],[338,770],[462,768]]) o += star4(x,y,5);
      return o; },
    waist: c => `<rect x="341" y="722" width="118" height="18" rx="8" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="3"/>` + heart(400,733,0.9,'#FFE27A','#D9A521',1.2) },
  tyl: { label:'Tylskørt', main: c => {
      let o = `<defs>${grad('btG',c.botA,c.botASh)}</defs>`;
      for (const [y,op,w] of [[862,0.5,138],[842,0.75,124],[818,1,108]]) o += `<path d="M 346 728 L 454 728 L ${400+w} ${y} ${scallops(400+w,400-w,y,9,14).trim()} Z" fill="url(#btG)" opacity="${op}" stroke="${c.botALine}" stroke-width="2.5" stroke-linejoin="round"/>`;
      for (const [x,y,r] of [[330,800,6],[372,780,4],[430,796,6],[470,812,4],[300,840,5],[500,846,5],[404,830,4],[350,850,4],[452,860,4]]) o += star4(x,y,r, c.botB);
      return o; },
    waist: c => `<rect x="341" y="722" width="118" height="16" rx="8" fill="${c.botB}" stroke="${c.botBLine}" stroke-width="3"/>` },
  shorts: { label:'Shorts', main: c =>
      `<defs>${grad('btG',c.botA,c.botASh)}</defs><path d="M 342 724 L 458 724 L 468 800 L 408 808 L 400 772 L 392 808 L 332 800 Z" fill="url(#btG)" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M 334 788 L 392 796 L 392 808 L 332 800 Z M 466 788 L 408 796 L 408 808 L 468 800 Z" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="2.5" stroke-linejoin="round"/>`
      + `<path d="M 400 742 L 400 772" stroke="${c.botALine}" stroke-width="2.5" opacity="0.6"/><path d="M 350 744 Q 366 760 372 744 M 450 744 Q 434 760 428 744" fill="none" stroke="${c.botALine}" stroke-width="2.5" opacity="0.6"/>`,
    waist: c => `<rect x="341" y="722" width="118" height="16" rx="6" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="3"/><circle cx="400" cy="730" r="6" fill="${c.botB}" stroke="${c.botBLine}" stroke-width="2"/>` },
  leggings: { label:'Leggings', under: c => {
      let o=''; for (const [x1,x2] of [[368,366],[432,434]]){ o += strokeBoth(`M ${x1} 790 L ${x2} 952`, c.botA, c.botALine, 35);
        for (const [dx,y] of [[-8,822],[7,846],[-6,874],[8,900],[-5,926]]) o += star4(x1+dx,y,4.5,c.botB,0.95); }
      return o; },
    main: c => `<path d="M 342 724 L 458 724 C 462 760, 458 790, 454 812 L 412 814 L 400 786 L 388 814 L 346 812 C 342 790, 338 760, 342 724 Z" fill="${c.botA}" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>` + star4(372,770,4.5,c.botB) + star4(428,780,4.5,c.botB),
    waist: c => `<rect x="341" y="722" width="118" height="14" rx="6" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="3"/>` },
  jeans: { label:'Vide bukser', main: c => {
      if (c.tuck){ const t = c.tuck + 16;
        let o = `<defs>${grad('btG',c.botA,c.botASh)}</defs><path d="M 342 724 L 458 724 C 460 780, 456 860, 452 ${t} L 408 ${t} L 404 830 L 400 792 L 396 830 L 392 ${t} L 348 ${t} C 344 860, 340 780, 342 724 Z" fill="url(#btG)" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>`;
        o += `<path d="M 347 744 C 346 820, 348 ${t-60}, 350 ${t} M 453 744 C 454 820, 452 ${t-60}, 450 ${t} M 352 742 Q 368 764 374 742 M 448 742 Q 432 764 426 742" fill="none" stroke="${c.botB}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"/>`;
        return o; }
      let o = `<defs>${grad('btG',c.botA,c.botASh)}</defs><path d="M 342 724 L 458 724 C 462 780, 456 860, 468 956 L 408 958 L 404 830 L 400 792 L 396 830 L 392 958 L 332 956 C 344 860, 338 780, 342 724 Z" fill="url(#btG)" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>`;
      o += `<path d="M 346 744 C 344 820, 342 890, 338 948 M 454 744 C 456 820, 458 890, 462 948 M 352 742 Q 368 764 374 742 M 448 742 Q 432 764 426 742" fill="none" stroke="${c.botB}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"/>`;
      o += `<path d="M 334 942 L 392 944 M 408 944 L 466 942" stroke="${c.botB}" stroke-width="2.5" stroke-dasharray="6 5"/>`;
      return o; },
    waist: c => `<rect x="341" y="722" width="118" height="16" rx="6" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="3"/><circle cx="400" cy="730" r="5.5" fill="#FFE27A" stroke="#C99A12" stroke-width="2"/>` + [356,378,422,444].map(x=>`<rect x="${x-3}" y="718" width="6" height="22" rx="2" fill="${c.botA}" stroke="${c.botALine}" stroke-width="2"/>`).join('') },
  prikker: { label:'Prikket nederdel', main: c =>
      `<defs><pattern id="dotP" patternUnits="userSpaceOnUse" width="26" height="26"><rect width="26" height="26" fill="${c.botA}"/><circle cx="7" cy="7" r="4.5" fill="${c.botB}"/><circle cx="20" cy="20" r="4.5" fill="${c.botB}"/></pattern></defs>`
      + `<path d="M 344 726 L 456 726 C 476 760, 494 790, 500 812 Q 400 836 300 812 C 306 790, 324 760, 344 726 Z" fill="url(#dotP)" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M 304 802 Q 400 826 496 802 L 500 812 Q 400 836 300 812 Z" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="2.5" stroke-linejoin="round"/>`,
    waist: c => `<rect x="341" y="722" width="118" height="16" rx="8" fill="${c.botASh}" stroke="${c.botALine}" stroke-width="3"/><g transform="translate(424,730)"><path d="M 0 0 C -10 -12, -22 -10, -20 0 C -22 10, -10 12, 0 0 Z M 0 0 C 10 -12, 22 -10, 20 0 C 22 10, 10 12, 0 0 Z" fill="${c.botB}" stroke="${c.botBLine}" stroke-width="2" stroke-linejoin="round"/><circle r="5" fill="${c.botB}" stroke="${c.botBLine}" stroke-width="2"/></g>` },
};

const SHOES = {
  sneakers: { label:'Sneakers', draw: c => {
      let socks=''; for (const x of [366,434]) socks += `<rect x="${x-19.5}" y="905" width="39" height="62" rx="6" fill="#FFFFFF" stroke="#C9BEEA" stroke-width="2.5"/><rect x="${x-19.5}" y="914" width="39" height="8" fill="${c.shoeA}"/><rect x="${x-19.5}" y="928" width="39" height="8" fill="${c.shoeB}"/>`;
      const s = `<g><path d="M 340 950 L 392 950 L 394 1000 Q 394 1014 380 1014 L 326 1014 Q 304 1014 306 992 Q 310 972 338 966 Z" fill="${c.shoeA}" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 306 996 L 394 996 L 394 1004 Q 394 1018 380 1018 L 324 1018 Q 304 1018 306 996 Z" fill="#FFFFFF" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 312 986 Q 322 972 340 970" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.8"/><path d="M 350 962 L 384 962 M 350 974 L 384 974" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>` + heart(373,987,0.9,c.shoeB) + `</g>`;
      return socks + s + mirror(s); } },
  stoevler: { label:'Støvler', boot: 906, draw: c => {
      const s = `<g><path d="M 344 906 L 390 906 Q 396 906 396 912 L 396 986 L 316 986 Q 308 986 310 976 Q 314 958 342 950 Z" fill="url(#shG)" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 342 906 L 398 906 L 398 922 L 342 922 Z" fill="#FFFFFF" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 306 984 L 398 984 L 398 1006 Q 398 1018 386 1018 L 318 1018 Q 304 1018 304 1006 Z" fill="#FFFFFF" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/><path d="M 310 1000 L 396 1000" stroke="${c.shoeALine}" stroke-width="2" opacity="0.35"/>`
        + `<path d="M 360 936 L 382 930 M 360 950 L 382 944 M 360 964 L 382 958" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/><path d="M 318 972 Q 326 958 344 954" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.6"/>` + heart(334,974,0.8,c.shoeB,c.shoeBLine,1.2) + `</g>`;
      return `<defs>${grad('shG',c.shoeA,c.shoeASh)}</defs>` + s + mirror(s); } },
  ballerina: { label:'Lakskor', draw: c => {
      const s = `<g><path d="M 346 936 L 388 936 L 390 990 L 344 990 Z" fill="#FFFFFF" stroke="#C9BEEA" stroke-width="2.5"/><path d="M 340 938 ${scallops(340,394,938,5,-8).trim()}" fill="#FFFFFF" stroke="#C9BEEA" stroke-width="2.5"/>`
        + `<path d="M 322 990 Q 316 1016 336 1017 L 386 1017 Q 397 1017 396 1004 L 396 976 Q 380 986 360 984 Q 336 982 322 990 Z" fill="url(#shG)" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + strokeBoth("M 352 980 L 396 970", c.shoeA, c.shoeALine, 7) + `<circle cx="384" cy="973" r="4" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="1.5"/>`
        + `<path d="M 328 1000 Q 336 990 350 990" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`
        + `<g transform="translate(330,996) rotate(-10)"><path d="M 0 0 C -7 -9, -15 -7, -14 0 C -15 7, -7 9, 0 0 Z M 0 0 C 7 -9, 15 -7, 14 0 C 15 7, 7 9, 0 0 Z" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="1.8"/><circle r="3.5" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="1.8"/></g></g>`;
      return `<defs>${grad('shG',c.shoeA,c.shoeASh)}</defs>` + s + mirror(s); } },
  rulle: { label:'Rulleskøjter', boot: 926, draw: c => {
      const s = `<g><path d="M 342 926 L 394 926 L 396 1004 L 312 1004 Q 304 1004 306 994 Q 310 974 340 966 Z" fill="url(#shG)" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 340 922 L 398 922 L 398 936 L 340 936 Z" fill="#FFFFFF" stroke="${c.shoeALine}" stroke-width="3"/>`
        + `<path d="M 356 948 L 386 942 M 356 962 L 386 956 M 356 976 L 386 970" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>`
        + `<rect x="306" y="1002" width="92" height="12" rx="5" fill="#E2DCF2" stroke="#8B82A8" stroke-width="2.5"/><path d="M 300 1004 Q 296 1016 306 1018 L 312 1010 Z" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="2"/>`
        + [324,380].map(x=>`<circle cx="${x}" cy="1026" r="13" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="3"/><circle cx="${x}" cy="1026" r="5" fill="#FFFFFF"/>`).join('')
        + star4(326,980,5) + `</g>`;
      return `<defs>${grad('shG',c.shoeA,c.shoeASh)}</defs>` + s + mirror(s); } },
  sandaler: { label:'Sandaler', draw: c => {
      const s = `<g><path d="M 334 952 L 392 952 L 394 1008 Q 394 1014 386 1014 L 322 1014 Q 308 1014 310 1002 Q 314 986 334 978 Z" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5" stroke-linejoin="round"/>`
        + `<path d="M 304 1010 L 398 1010 L 398 1018 Q 398 1024 390 1024 L 312 1024 Q 302 1024 304 1010 Z" fill="${c.shoeASh}" stroke="${c.shoeALine}" stroke-width="2.5" stroke-linejoin="round"/>`
        + strokeBoth("M 318 994 Q 352 980 394 990", c.shoeA, c.shoeALine, 8) + strokeBoth("M 346 966 L 394 962", c.shoeA, c.shoeALine, 7)
        + [[0,-7],[6.6,-2.2],[4,5.6],[-4,5.6],[-6.6,-2.2]].map(([dx,dy])=>`<circle cx="${352+dx}" cy="${987+dy}" r="5" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="1.5"/>`).join('') + `<circle cx="352" cy="987" r="3.5" fill="#FFE27A"/></g>`;
      return s + mirror(s); } },
  hoeje: { label:'Høje støvler', boot: 856, draw: c => {
      const s = `<g><path d="M 346 864 L 388 864 L 392 990 L 396 1004 Q 396 1018 382 1018 L 320 1018 Q 306 1018 308 1004 Q 312 986 344 976 Z" fill="url(#shG)" stroke="${c.shoeALine}" stroke-width="3" stroke-linejoin="round"/>`
        + `<rect x="340" y="852" width="54" height="24" rx="10" fill="${c.shoeB}" stroke="${c.shoeBLine}" stroke-width="3"/>`
        + `<path d="M 306 1006 L 396 1006 L 396 1010 Q 396 1020 384 1020 L 318 1020 Q 306 1020 306 1006 Z" fill="${c.shoeALine}"/>`
        + `<path d="M 356 890 L 356 960" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.45"/>` + star4(372,940,6,c.shoeB) + `</g>`;
      return `<defs>${grad('shG',c.shoeA,c.shoeASh)}</defs>` + s + mirror(s); } },
};

/* ================= TILBEHØR ================= */
const ACC = {
  sloejfe: { label:'Sløjfe', layer:'head', color:'#FF5FA8', draw: (k) => `<g transform="translate(508,196) rotate(18)">`
      + `<path d="M 0 0 C -30 -34, -62 -30, -58 0 C -62 30, -30 34, 0 0 Z" fill="${k}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/><path d="M 0 0 C 30 -34, 62 -30, 58 0 C 62 30, 30 34, 0 0 Z" fill="${k}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M -44 -12 Q -30 -6 -18 -2 M 44 -12 Q 30 -6 18 -2" fill="none" stroke="${outline(k)}" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/><path d="M -46 -14 Q -36 -22 -24 -20" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.6" stroke-linecap="round"/>`
      + `<rect x="-13" y="-16" width="26" height="32" rx="10" fill="${shade(k)}" stroke="${outline(k)}" stroke-width="3"/></g>` },
  tiara: { label:'Tiara', layer:'head', color:'#FF5FA8', draw: (k) => `<g transform="translate(400,160)"><path d="M -68 16 L -60 -6 L -38 6 L -20 -14 L 0 -40 L 20 -14 L 38 6 L 60 -6 L 68 16 Q 0 2 -68 16 Z" fill="#FFD54A" stroke="#C99A12" stroke-width="3" stroke-linejoin="round"/>`
      + `<circle cx="0" cy="-6" r="9" fill="${k}" stroke="${outline(k)}" stroke-width="2"/><circle cx="-38" cy="8" r="5" fill="${k}" stroke="${outline(k)}" stroke-width="1.5"/><circle cx="38" cy="8" r="5" fill="${k}" stroke="${outline(k)}" stroke-width="1.5"/>`
      + `<circle cx="-60" cy="-6" r="4" fill="#FFFFFF"/><circle cx="60" cy="-6" r="4" fill="#FFFFFF"/><circle cx="0" cy="-40" r="4" fill="#FFFFFF"/>` + star4(-3,-9,3.5) + star4(-30,-30,7) + star4(34,-34,5) + `</g>` },
  katteoerer: { label:'Katteører', layer:'head', color:'#2A2340', draw: (k) => {
      const ear = `<path d="M 256 232 L 270 122 L 346 182 Z" fill="${k}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/><path d="M 272 212 L 280 150 L 324 186 Z" fill="#FFB3D1" stroke-linejoin="round"/>`;
      return ear + mirror(ear) + `<path d="M 220 300 C 236 206, 320 168, 400 168 C 480 168, 564 206, 580 300" fill="none" stroke="${outline(k)}" stroke-width="16" stroke-linecap="round"/><path d="M 220 300 C 236 206, 320 168, 400 168 C 480 168, 564 206, 580 300" fill="none" stroke="${k}" stroke-width="11" stroke-linecap="round"/>`; } },
  spaender: { label:'Stjernespænder', layer:'head', color:'#FFE27A', draw: (k) => [[254,286,-20],[298,248,10]].map(([x,y,r])=>`<polygon points="${star5pts(x,y,19,8.5,-90+r)}" fill="${k}" stroke="${outline(k)}" stroke-width="2.5" stroke-linejoin="round"/>` + star4(x-4,y-4,4)).join('') },
  kasket: { label:'Kasket', layer:'head', color:'#2F6FE0', draw: (k) => `<path d="M 204 286 C 200 170, 290 124, 400 124 C 510 124, 600 170, 596 286 C 520 262, 280 262, 204 286 Z" fill="${k}" stroke="${outline(k)}" stroke-width="3.5" stroke-linejoin="round"/>`
      + `<path d="M 400 128 L 400 266 M 300 146 C 280 190, 272 230, 274 270 M 500 146 C 520 190, 528 230, 526 270" fill="none" stroke="${outline(k)}" stroke-width="2.5" opacity="0.45"/>`
      + `<path d="M 186 288 C 260 252, 540 252, 614 288 C 600 312, 520 318, 400 314 C 280 318, 200 312, 186 288 Z" fill="${shade(k)}" stroke="${outline(k)}" stroke-width="3.5" stroke-linejoin="round"/>`
      + `<path d="M 300 150 Q 340 136 380 134" fill="none" stroke="#FFFFFF" stroke-width="8" opacity="0.4" stroke-linecap="round"/><circle cx="400" cy="126" r="11" fill="${shade(k)}" stroke="${outline(k)}" stroke-width="3"/>` + star4(470,206,12,'#FFFFFF',0.9) },
  butterfly: { label:'Butterfly', layer:'body', color:'#C2272D', draw: (k) => `<g transform="translate(400,612)"><path d="M 0 0 L -30 -14 Q -36 0 -30 14 Z M 0 0 L 30 -14 Q 36 0 30 14 Z" fill="${k}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/><rect x="-8" y="-9" width="16" height="18" rx="5" fill="${shade(k)}" stroke="${outline(k)}" stroke-width="3"/><path d="M -24 -6 L -12 -2 M 24 -6 L 12 -2" stroke="#FFFFFF" stroke-width="3" opacity="0.5" stroke-linecap="round"/></g>` },
  briller: { label:'Hjertebriller', layer:'face', color:'#FF5FA8', draw: (k) => {
      const lens = x => `<path transform="translate(${x},468) scale(5.4)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${k}" fill-opacity="0.45" stroke="${outline(k)}" stroke-width="1.5" stroke-linejoin="round"/>`
        + `<path d="M ${x-36} ${428} Q ${x-26} ${416} ${x-12} ${418}" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
      return lens(316) + lens(484) + `<path d="M 360 432 Q 400 418 440 432" fill="none" stroke="${outline(k)}" stroke-width="7" stroke-linecap="round"/><path d="M 262 424 L 214 410 M 538 424 L 586 410" stroke="${outline(k)}" stroke-width="6" stroke-linecap="round"/>`; } },
  halskaede: { label:'Halskæde', layer:'body', color:'#4B2A9A', draw: (k) => `<path d="M 379 586 Q 400 598 421 586" fill="none" stroke="${k}" stroke-width="7"/>` + heart(400,600,0.85,'#FF5FA8','#B32268',1.5) },
  armbaand: { label:'Armbånd', layer:'body', color:'#FF5FA8', draw: (k) => { const a=ARMS.R, f=seg(a.E,a.H); const p=[a.E[0]+(a.H[0]-a.E[0])*0.86, a.E[1]+(a.H[1]-a.E[1])*0.86]; const ang=Math.atan2(f.dy,f.dx)*180/Math.PI+90;
      return `<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-19" y="-5" width="38" height="10" rx="5" fill="${k}" stroke="${outline(k)}" stroke-width="2"/><circle cx="-8" cy="0" r="3.2" fill="#FFFFFF"/><circle cx="8" cy="0" r="3.2" fill="#FFE27A"/></g>`; } },
  taske: { label:'Taske', layer:'hand', color:'#B79BFF', draw: (k) => (ARMS.R!==ARM_R_DOWN ? `<g transform="translate(${ARMS.R.E[0]-514},${ARMS.R.E[1]-764})">` : `<g>`) + `<path d="M 494 806 Q 492 760 512 762 Q 532 760 530 806" fill="none" stroke="${outline(k)}" stroke-width="6" stroke-linecap="round"/>`
      + `<rect x="476" y="800" width="72" height="56" rx="14" fill="${k}" stroke="${outline(k)}" stroke-width="3"/><path d="M 476 818 Q 512 836 548 818 L 548 812 Q 548 800 534 800 L 490 800 Q 476 800 476 812 Z" fill="${shade(k)}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/>`
      + heart(512,836,1.2,'#FFE27A','#C99A12',1.2) + star4(490,846,4) + `</g>` },
  stav: { label:'Tryllestav', layer:'hand', color:'#FFE27A', draw: (k) => { const a=ARMS.R, f=seg(a.E,a.H); const hx=a.H[0]+f.dx*6, hy=a.H[1]+f.dy*6;
      const dx=0.26, dy=-0.966, x0=hx-dx*30, y0=hy-dy*30, x1=hx+dx*96, y1=hy+dy*96, sx=x1+dx*16, sy=y1+dy*16;
      return spin(`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#5B3FC0" stroke-width="10" stroke-linecap="round"/><path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 8"/>`
      + `<polygon points="${star5pts(sx,sy,30,13,-80)}" fill="${k}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/>` + star4(sx-6,sy-8,6) + star4(sx+40,sy-14,8,k) + star4(sx+34,sy+30,5,k) + star4(sx-34,sy-24,5,k), hx.toFixed(1), hy.toFixed(1), [0,-7,0,5,0], 2.2); } },
};

/* ================= KÆLEDYR (egne koordinater: 0,0 = midt under dyret) ================= */
const PET_X = 660, PET_Y = 1050, PET_S = 0.85;
const PET_KINDS = {
  ingen: { label:'Intet dyr' },
  kat: { label:'Kat' }, hund: { label:'Hund' }, kanin: { label:'Kanin' },
  enhjoerning: { label:'Enhjørning' }, bjoern: { label:'Bjørn' }, drage: { label:'Drage' },
};
const PET_PATTERNS = { ingen:'Ensfarvet', pletter:'Pletter', striber:'Striber', sokker:'Sokker', oejeplet:'Plet om øjet' };
const PET_ACC = {
  halsbaand: { label:'Halsbånd', color:'#FF5FA8' }, sloejfe: { label:'Sløjfe', color:'#B79BFF' },
  krone: { label:'Krone', color:'#FF5FA8' }, vinger: { label:'Feevinger', color:'#7FD8FF' },
};
const ellPath = (cx,cy,rx,ry) => `M ${cx-rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx+rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx-rx} ${cy} Z`;

function petHelpers(P){
  const sw = 3.5;
  const H = {
    ell: (x,y,rx,ry,fill,rot=0,line=P.L) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot?` transform="rotate(${rot} ${x} ${y})"`:''} fill="${fill}" stroke="${line}" stroke-width="${sw}"/>`,
    path: (d, fill, line=P.L, w=sw) => `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`,
    thick: (d, fill, line, w) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w+7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
    mirror: (s, cx=0) => s + `<g transform="translate(${2*cx},0) scale(-1,1)">${s}</g>`,
    clip: (id, d) => `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>`,
    pat: (clipId, spots=[], stripes=[], patch=null) => {
      let s = '';
      if (P.pat==='pletter') s += spots.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.B}"/>`).join('');
      if (P.pat==='striber') s += stripes.map(d=>`<path d="${d}" fill="none" stroke="${P.B}" stroke-width="11" stroke-linecap="round"/>`).join('');
      if (P.pat==='oejeplet' && patch) s += `<ellipse cx="${patch[0]}" cy="${patch[1]}" rx="${patch[2]}" ry="${patch[3]}" fill="${P.B}"/>`;
      return s ? HLW(P.hl==='petpat', `<g clip-path="url(#${clipId})">${s}</g>`) : '';
    },
    sock: P.pat==='sokker',
    eye: (x,y,s=1,slit=false,flick=-1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse rx="21" ry="25" fill="#FFFFFF" stroke="#1B1330" stroke-width="3"/><ellipse cy="3" rx="17" ry="21" fill="url(#petIris)"/>`
      + (slit ? `<ellipse cy="3" rx="5" ry="16" fill="#14122B"/>` : `<ellipse cy="4" rx="9" ry="12" fill="#14122B"/>`)
      + `<circle cx="-7" cy="-8" r="7" fill="#FFFFFF"/><circle cx="7" cy="14" r="3" fill="#FFFFFF"/>`
      + `<path d="M ${flick*20} -12 Q ${flick*26} -19 ${flick*31} -21" fill="none" stroke="#1B1330" stroke-width="3.2" stroke-linecap="round"/>`
      + blinkLid(`<ellipse rx="25" ry="29" fill="${P.A}"/><path d="M -23 2 Q 0 18 23 2" fill="none" stroke="#1B1330" stroke-width="3.6" stroke-linecap="round"/>`, 3.7, 1.8) + `</g>`,
    blush: (x,y) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="#FF7FA6" opacity="0.5"/>`,
    collar: (x,y,hw,rot=0) => { const h = P.acc.halsbaand; if (!h) return '';
      return HLW(P.hl==='petacc:halsbaand', `<g transform="rotate(${rot} ${x} ${y})"><path d="M ${x-hw} ${y} Q ${x} ${y+18} ${x+hw} ${y}" fill="none" stroke="${outline(h)}" stroke-width="15" stroke-linecap="round"/><path d="M ${x-hw} ${y} Q ${x} ${y+18} ${x+hw} ${y}" fill="none" stroke="${h}" stroke-width="10" stroke-linecap="round"/>`
        + `<circle cx="${x}" cy="${y+18}" r="9" fill="#FFD54A" stroke="#C99A12" stroke-width="2.5"/><path d="M ${x-5} ${y+19} L ${x+5} ${y+19}" stroke="#C99A12" stroke-width="2"/></g>`); },
  };
  return H;
}
const NOSE_DARK = '#2E1F3A';

const PET_SPECIES = {
  /* ---------- KAT: slank, sidder højt, halen snoet om poterne ---------- */
  kat: { anchors:{ crown:[0,-258], bow:[46,-244,20], wings:[0,-100] }, shadow:66, head:(P,H) => {
    let o = '';
    o += H.mirror(H.path("M -72 -212 L -62 -298 L -18 -254 Z", P.A) + `<path d="M -62 -226 L -57 -282 L -32 -254 Z" fill="#FFB3D1"/>`);
    const head = "M 0 -264 C 44 -264, 72 -244, 76 -210 C 92 -194, 90 -164, 72 -152 C 54 -138, 30 -134, 0 -134 C -30 -134, -54 -138, -72 -152 C -90 -164, -92 -194, -76 -210 C -72 -244, -44 -264, 0 -264 Z";
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[46,-236,14],[-58,-176,9]], ["M -16 -266 L -12 -234","M 0 -268 L 0 -230","M 16 -266 L 12 -234","M -94 -186 L -70 -180","M 94 -186 L 70 -180"], [-32,-200,32,30]);
    o += `<ellipse cx="-11" cy="-166" rx="14" ry="11" fill="${P.B}"/><ellipse cx="11" cy="-166" rx="14" ry="11" fill="${P.B}"/>`;
    o += H.eye(-32,-202,0.95,true,-1) + H.eye(32,-202,0.95,true,1) + H.blush(-54,-172) + H.blush(54,-172);
    o += `<path d="M -7 -178 Q 0 -182 7 -178 Q 4 -171 0 -170 Q -4 -171 -7 -178 Z" fill="#FF8FB0" stroke="#D9577F" stroke-width="2" stroke-linejoin="round"/><path d="M -11 -163 Q -5 -157 0 -166 Q 5 -157 11 -163" fill="none" stroke="#3A2440" stroke-width="2.8" stroke-linecap="round"/>`;
    o += `<path d="M -26 -170 L -78 -180 M -26 -164 L -76 -158 M 26 -170 L 78 -180 M 26 -164 L 76 -158" stroke="${P.L}" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>`;
    return o; },
    draw:(P,H) => {
    let o = H.ell(-34,-34,26,32,'url(#petFur)') + H.ell(34,-34,26,32,'url(#petFur)');
    const body = "M -40 -8 C -58 -50, -50 -124, -24 -154 L 24 -154 C 50 -124, 58 -50, 40 -8 Q 0 2 -40 -8 Z";
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-30,-112,10],[28,-62,12],[-24,-38,8]], ["M -60 -124 Q -36 -114 -24 -128","M -62 -94 Q -38 -84 -28 -96","M 60 -124 Q 36 -114 24 -128","M 62 -94 Q 38 -84 28 -96"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-88" rx="22" ry="54" fill="${P.B}"/></g>`;
    o += spin(H.thick("M 32 -24 C 92 -28, 96 10, 42 4 C 14 1, -18 5, -46 0", P.A, P.L, 17) + (P.pat==='striber' || H.sock ? `<circle cx="-46" cy="0" r="8.5" fill="${P.B}"/>` : ''), 32, -24, [0,-2.5,0,2,0], 2.6);
    for (const x of [-13,13]){
      o += H.path(`M ${x-11} -100 L ${x-11} -14 Q ${x-11} -2 ${x} -2 Q ${x+11} -2 ${x+11} -14 L ${x+11} -100`, 'url(#petFur)');
      if (H.sock) o += H.path(`M ${x-11} -32 L ${x-11} -14 Q ${x-11} -2 ${x} -2 Q ${x+11} -2 ${x+11} -14 L ${x+11} -32 Z`, P.B);
      o += `<path d="M ${x-4} -12 l 0 8 M ${x+4} -12 l 0 8" stroke="${P.L}" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>`;
    }
    o += H.collar(0,-150,28);
    o += PET_SPECIES.kat.head(P,H);
    return o; } },

  /* ---------- HUND: buttet, stor snude, hængeører, tunge ude ---------- */
  hund: { anchors:{ crown:[0,-266], bow:[54,-246,20], wings:[0,-92] }, shadow:86, head:(P,H) => {
    let o = '';
    const head = ellPath(0,-202,78,68);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[44,-240,15],[-52,-226,9]], ["M -18 -270 L -14 -240","M 0 -272 L 0 -236","M 18 -270 L 14 -240"], [-30,-212,34,30]);
    o += H.eye(-30,-212,0.92,false,-1) + H.eye(30,-212,0.92,false,1);
    o += `<ellipse cx="-30" cy="-246" rx="8" ry="4" fill="${P.ASh}"/><ellipse cx="30" cy="-246" rx="8" ry="4" fill="${P.ASh}"/>`;
    o += H.ell(0,-166,42,30,P.B) + H.blush(-58,-182) + H.blush(58,-182);
    o += `<path d="M -9 -152 Q -11 -128 0 -126 Q 11 -128 9 -152 Z" fill="#FF7FA6" stroke="#D9577F" stroke-width="2" stroke-linejoin="round"/><path d="M 0 -150 L 0 -134" stroke="#D9577F" stroke-width="2" stroke-linecap="round"/>`;
    o += `<path d="M 0 -172 L 0 -160 M -18 -156 Q -9 -147 0 -160 Q 9 -147 18 -156" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<ellipse cx="0" cy="-180" rx="15" ry="10" fill="${NOSE_DARK}"/><ellipse cx="-4" cy="-183" rx="5" ry="2.6" fill="#FFFFFF" opacity="0.8"/>`;
    o += H.mirror(H.path("M -46 -258 C -100 -268, -120 -196, -106 -140 C -100 -120, -78 -120, -72 -142 C -66 -184, -60 -224, -28 -252 Z", P.pat==='oejeplet'?P.B:P.ASh));
    return o; },
    draw:(P,H) => {
    let o = spin(H.thick("M 56 -56 C 96 -72, 108 -106, 94 -128", P.A, P.L, 20) + `<circle cx="94" cy="-128" r="9.5" fill="${P.B}"/>`, 56, -56, [0,16,0,-10,0], 0.7);
    o += H.ell(-60,-28,32,28,'url(#petFur)') + H.ell(60,-28,32,28,'url(#petFur)');
    o += H.ell(-74,-9,26,12, H.sock?P.B:P.A) + H.ell(74,-9,26,12, H.sock?P.B:P.A);
    const body = "M -66 -8 C -88 -62, -64 -132, 0 -134 C 64 -132, 88 -62, 66 -8 Q 0 6 -66 -8 Z";
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-44,-96,14],[40,-110,10],[50,-50,13]], ["M -86 -110 Q -60 -100 -48 -114","M -88 -76 Q -62 -66 -50 -80","M 86 -110 Q 60 -100 48 -114","M 88 -76 Q 62 -66 50 -80"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-60" rx="38" ry="48" fill="${P.B}"/></g>`;
    for (const x of [-20,20]){
      o += H.path(`M ${x-14} -104 L ${x-14} -14 Q ${x-14} 0 ${x} 0 Q ${x+14} 0 ${x+14} -14 L ${x+14} -104`, 'url(#petFur)');
      if (H.sock) o += H.path(`M ${x-14} -34 L ${x-14} -14 Q ${x-14} 0 ${x} 0 Q ${x+14} 0 ${x+14} -14 L ${x+14} -34 Z`, P.B);
      o += `<path d="M ${x-5} -12 l 0 9 M ${x+5} -12 l 0 9" stroke="${P.L}" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>`;
    }
    o += H.collar(0,-130,44);
    o += PET_SPECIES.hund.head(P,H);
    return o; } },

  /* ---------- KANIN: pæreform, store bagfødder, poter oppe ---------- */
  kanin: { anchors:{ crown:[0,-236], bow:[34,-236,30], wings:[0,-74] }, shadow:78, head:(P,H) => {
    let o = '';
    o += `<g transform="rotate(-8 -26 -232)">${H.ell(-26,-294,20,64,'url(#petFur)')}<ellipse cx="-26" cy="-290" rx="10" ry="48" fill="#FFB3D1"/></g>`;
    o += spin(`<g transform="rotate(24 26 -232)">${H.ell(26,-294,20,64,'url(#petFur)')}<ellipse cx="26" cy="-290" rx="10" ry="48" fill="#FFB3D1"/></g>`, 26, -232, [0,0,-10,0,0], 3.1);
    const head = ellPath(0,-180,70,64);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[40,-218,13],[-48,-206,8]], ["M -16 -244 L -12 -216","M 0 -246 L 0 -212","M 16 -244 L 12 -216"], [-28,-188,30,28]);
    o += H.eye(-28,-188,0.88,false,-1) + H.eye(28,-188,0.88,false,1) + H.blush(-50,-160) + H.blush(50,-160);
    o += `<ellipse cx="-13" cy="-152" rx="15" ry="12" fill="${P.B}"/><ellipse cx="13" cy="-152" rx="15" ry="12" fill="${P.B}"/>`;
    o += `<rect x="-6" y="-150" width="12" height="10" rx="2" fill="#FFFFFF" stroke="#3A2440" stroke-width="1.8"/><path d="M 0 -150 L 0 -141" stroke="#3A2440" stroke-width="1.4"/>`;
    o += `<path d="M -7 -165 Q 0 -169 7 -165 Q 4 -159 0 -158 Q -4 -159 -7 -165 Z" fill="#FF8FB0" stroke="#D9577F" stroke-width="2" stroke-linejoin="round"/><path d="M -11 -151 Q -5 -146 0 -154 Q 5 -146 11 -151" fill="none" stroke="#3A2440" stroke-width="2.6" stroke-linecap="round"/>`;
    return o; },
    draw:(P,H) => {
    let o = `<circle cx="60" cy="-28" r="21" fill="${P.B}" stroke="${P.L}" stroke-width="3.5"/>`;
    const body = "M -54 -8 C -82 -42, -66 -116, 0 -120 C 66 -116, 82 -42, 54 -8 Q 0 4 -54 -8 Z";
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-40,-84,12],[42,-96,9],[-46,-36,9]], ["M -76 -90 Q -52 -82 -42 -96","M -78 -60 Q -54 -52 -44 -66","M 76 -90 Q 52 -82 42 -96","M 78 -60 Q 54 -52 44 -66"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-54" rx="34" ry="42" fill="${P.B}"/></g>`;
    for (const s of [-1,1]){ const x = 42*s;
      o += H.ell(x,-10,36,14, H.sock?P.B:'url(#petFur)');
      o += `<ellipse cx="${x+10*s}" cy="-9" rx="11" ry="6" fill="#FFB3D1"/>` + [0,1,2].map(i=>`<circle cx="${x+(22+i*0)*s}" cy="${-15+i*6}" r="3" fill="#FFB3D1"/>`).join('');
    }
    o += H.ell(-16,-64,12,16, H.sock?P.B:'url(#petFur)') + H.ell(16,-64,12,16, H.sock?P.B:'url(#petFur)');
    o += H.collar(0,-116,36);
    o += PET_SPECIES.kanin.head(P,H);
    return o; } },

  /* ---------- ENHJØRNING: buttet pony på korte ben, stort hoved ---------- */
  enhjoerning: { anchors:{ crown:[-34,-262,0], bow:[16,-232,25], wings:[44,-136], wingsSide:true }, shadow:92, head:(P,H) => {
    let o = '';
    o += H.path("M -94 -222 L -90 -280 L -64 -246 Z", P.A) + `<path d="M -89 -232 L -87 -266 L -71 -246 Z" fill="${P.B}"/>`;
    o += H.path("M 24 -222 L 20 -280 L -4 -246 Z", P.A) + `<path d="M 19 -232 L 17 -266 L 3 -246 Z" fill="${P.B}"/>`;
    const head = ellPath(-34,-198,68,60);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[0,-234,10],[-86,-194,8]], ["M -50 -258 L -48 -234","M -18 -258 L -20 -234"], [-58,-206,30,28]);
    o += H.eye(-58,-206,0.9,false,-1) + H.eye(-10,-206,0.9,false,1) + H.blush(-86,-176) + H.blush(18,-176);
    o += H.ell(-34,-164,38,26,P.B);
    o += `<ellipse cx="-46" cy="-167" rx="4.5" ry="5.5" fill="${outline(P.B)}"/><ellipse cx="-22" cy="-167" rx="4.5" ry="5.5" fill="${outline(P.B)}"/><path d="M -46 -153 Q -34 -146 -22 -153" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round"/>`;
    const lock = [[-62,-250,15],[-6,-250,15],[-48,-262,13],[-20,-264,13]];
    o += lock.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+3}" fill="${P.CL}"/>`).join('') + lock.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.C}"/>`).join('');
    o += `<path d="M -47 -258 L -34 -322 L -21 -258 Z" fill="#FFE27A" stroke="#C99A12" stroke-width="3" stroke-linejoin="round"/><path d="M -44 -272 L -25 -278 M -41 -290 L -28 -294 M -38 -306 L -31 -308" stroke="#C99A12" stroke-width="2.5" stroke-linecap="round"/>`;
    return o; },
    draw:(P,H) => {
    const HOOF = P.C, HOOFL = P.CL;
    const legRaw = (x, fill) => H.path(`M ${x-14} -70 L ${x-14} -14 L ${x+14} -14 L ${x+14} -70`, fill) + (H.sock ? H.path(`M ${x-14} -34 L ${x-14} -14 L ${x+14} -14 L ${x+14} -34 Z`, P.B) : '')
      + `<path d="M ${x-16} -18 L ${x+16} -18 L ${x+16} -5 Q ${x+16} 0 ${x+10} 0 L ${x-10} 0 Q ${x-16} 0 ${x-16} -5 Z" fill="${HOOF}" stroke="${HOOFL}" stroke-width="3" stroke-linejoin="round"/>`;
    const leg = (x, fill) => P.walk ? spin(legRaw(x, fill), x, -70, (x === -42 || x === 74) ? [16,-16,16] : [-16,16,-16], 0.6) : legRaw(x, fill);
    let o = spin(H.path("M 80 -114 C 134 -126, 148 -70, 124 -34 C 118 -56, 106 -66, 92 -70 C 102 -86, 96 -102, 78 -98 Z", P.C, P.CL) + `<path d="M 96 -112 C 120 -106, 130 -84, 126 -58" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.5" stroke-linecap="round"/>`, 80, -108, [0,7,0,-4,0], 2.4);
    o += leg(-18, P.ASh) + leg(74, P.ASh);
    o += H.path("M -66 -96 C -70 -138, -60 -168, -44 -186 L 0 -178 C -6 -156, 2 -128, 20 -100 Z", 'url(#petFur)');
    const body = ellPath(16,-94,74,54);
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[46,-112,13],[-6,-82,10],[72,-84,9]], ["M 6 -146 Q 12 -118 4 -96","M 36 -148 Q 42 -120 34 -98","M 66 -142 Q 72 -114 64 -94"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="14" cy="-48" rx="56" ry="22" fill="${P.B}"/></g>`;
    o += leg(-42, 'url(#petFur)') + leg(52, 'url(#petFur)');
    const mane = [[8,-232,20],[16,-208,19],[20,-184,18],[20,-160,16],[16,-138,14]];
    o += mane.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+3}" fill="${P.CL}"/>`).join('') + mane.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.C}"/>`).join('');
    o += mane.map(([x,y,r])=>`<path d="M ${x-r*0.5} ${y-r*0.2} Q ${x} ${y-r*0.7} ${x+r*0.5} ${y-r*0.3}" fill="none" stroke="#FFFFFF" stroke-width="3.5" opacity="0.45" stroke-linecap="round"/>`).join('');
    o += H.collar(-30,-144,28,-6);
    o += PET_SPECIES.enhjoerning.head(P,H);
    return o; } },

  /* ---------- BJØRN: rund bamse, benene strakt frem ---------- */
  bjoern: { anchors:{ crown:[0,-256], bow:[52,-238,20], wings:[0,-96] }, shadow:88, head:(P,H) => {
    let o = '';
    o += H.mirror(`<circle cx="-56" cy="-244" r="24" fill="${P.A}" stroke="${P.L}" stroke-width="3.5"/><circle cx="-56" cy="-244" r="12" fill="${P.B}"/>`);
    const head = ellPath(0,-190,74,66);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[46,-224,13],[-54,-210,9]], ["M -16 -256 L -12 -228","M 0 -258 L 0 -224","M 16 -256 L 12 -228"], [-30,-198,32,30]);
    o += H.eye(-30,-198,0.85,false,-1) + H.eye(30,-198,0.85,false,1) + H.blush(-54,-170) + H.blush(54,-170);
    o += H.ell(0,-164,30,22,P.B);
    o += `<path d="M -11 -176 Q 0 -182 11 -176 Q 8 -166 0 -164 Q -8 -166 -11 -176 Z" fill="${NOSE_DARK}"/><path d="M 0 -164 L 0 -158 M -10 -153 Q -5 -149 0 -158 Q 5 -149 10 -153" fill="none" stroke="#3A2440" stroke-width="2.8" stroke-linecap="round"/>`;
    return o; },
    draw:(P,H) => {
    const body = ellPath(0,-86,70,64);
    let o = H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-44,-112,12],[46,-60,10],[30,-128,8]], ["M -72 -110 Q -48 -100 -40 -114","M -74 -80 Q -50 -70 -42 -84","M 72 -110 Q 48 -100 40 -114","M 74 -80 Q 50 -70 42 -84"]);
    o += `<g clip-path="url(#pbC)"><circle cx="0" cy="-80" r="40" fill="${P.B}"/><circle cx="0" cy="-80" r="33" fill="none" stroke="${outline(P.B)}" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.6"/></g>`;
    o += H.ell(-64,-96,18,32,'url(#petFur)',24) + H.ell(64,-96,18,32,'url(#petFur)',-24);
    if (H.sock) o += H.ell(-72,-74,12,10,P.B,24) + H.ell(72,-74,12,10,P.B,-24);
    for (const s of [-1,1]){ const x = 46*s;
      o += H.ell(x,-26,30,26,'url(#petFur)');
      o += H.ell(x+4*s,-24,18,20, P.B) + [[-11,-40],[0,-45],[11,-40]].map(([dx,dy])=>`<circle cx="${x+4*s+dx}" cy="${dy}" r="5" fill="${P.B}" stroke="${outline(P.B)}" stroke-width="2"/>`).join('');
    }
    o += H.collar(0,-130,44);
    o += PET_SPECIES.bjoern.head(P,H);
    return o; } },

  /* ---------- DRAGE: buttet babydrage, stort hoved, små vinger, hjertehale ---------- */
  drage: { anchors:{ crown:[0,-262], bow:[52,-240,20], wings:[0,-104] }, shadow:80, head:(P,H) => {
    let o = '';
    o += H.mirror(H.path("M -30 -250 C -34 -274, -46 -286, -58 -286 C -54 -274, -52 -262, -52 -244 Z", P.C, P.CL));
    const head = ellPath(0,-198,74,64);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[46,-230,11],[-52,-214,8]], ["M -14 -260 L -10 -234","M 14 -260 L 10 -234"], [-30,-206,30,28]);
    o += [[-16,-258,0.7],[0,-263,0.9],[16,-258,0.7]].map(([x,y,s])=>`<path d="M ${x-9*s} ${y+6} Q ${x} ${y-18*s} ${x+9*s} ${y+6} Z" fill="${P.C}" stroke="${P.CL}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
    o += H.path(head, 'none');
    o += H.eye(-30,-206,0.95,false,-1) + H.eye(30,-206,0.95,false,1) + H.blush(-56,-176) + H.blush(56,-176);
    o += H.ell(0,-162,36,22,P.B);
    o += `<ellipse cx="-11" cy="-168" rx="4" ry="3.2" fill="${outline(P.B)}"/><ellipse cx="11" cy="-168" rx="4" ry="3.2" fill="${outline(P.B)}"/><path d="M -14 -155 Q 0 -146 14 -155" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round"/><path d="M 5 -152 L 8 -145 L 11 -153 Z" fill="#FFFFFF" stroke="#3A2440" stroke-width="1.5" stroke-linejoin="round"/>`;
    return o; },
    draw:(P,H) => {
    const wing = `<g transform="translate(-44,-118) scale(0.62)"><path d="M 0 0 C -48 -76, -104 -80, -124 -40 C -106 -40, -96 -24, -98 -8 C -84 -18, -70 -14, -62 0 C -52 -12, -36 -10, -26 6 Z" fill="${P.C}" stroke="${P.CL}" stroke-width="5" stroke-linejoin="round"/><path d="M -20 -6 L -104 -40 M -20 -2 L -76 -18" stroke="${P.CL}" stroke-width="4" opacity="0.5"/></g>`;
    let o = H.mirror(spin(wing, -44, -118, [0,-14,0], 1.1));
    o += spin(H.thick("M 48 -36 C 92 -28, 112 -50, 110 -82", P.A, P.L, 26)
      + `<path transform="translate(110,-96) rotate(10) scale(1.7)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${P.C}" stroke="${P.CL}" stroke-width="2" stroke-linejoin="round"/>`
      + H.path("M 76 -38 L 84 -54 L 92 -36 Z", P.C, P.CL, 2.5) + H.path("M 98 -48 L 112 -58 L 110 -42 Z", P.C, P.CL, 2.5), 48, -36, [0,6,0,-4,0], 2.2);
    o += H.ell(-44,-30,28,28,'url(#petFur)') + H.ell(44,-30,28,28,'url(#petFur)');
    const body = ellPath(0,-82,66,62);
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-44,-110,10],[46,-62,11],[-46,-50,8]], ["M -72 -76 Q -50 -66 -40 -80","M -72 -52 Q -50 -42 -40 -56","M -66 -30 Q -48 -22 -40 -34","M 72 -76 Q 50 -66 40 -80","M 72 -52 Q 50 -42 40 -56","M 66 -30 Q 48 -22 40 -34"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-74" rx="40" ry="48" fill="${P.B}"/>` + [-112,-94,-76,-58,-40].map(y=>`<path d="M -36 ${y} Q 0 ${y+9} 36 ${y}" fill="none" stroke="${outline(P.B)}" stroke-width="2.5" opacity="0.45"/>`).join('') + `</g>`;
    for (const s of [-1,1]){ o += H.ell(36*s,-10,28,13, H.sock?P.B:P.A); o += [0,1,2].map(i=>`<path d="M ${36*s+(-14+i*14)} -4 l -4 6 l 8 0 Z" fill="#FFFFFF" stroke="${P.L}" stroke-width="1.5" stroke-linejoin="round"/>`).join(''); }
    o += H.mirror(H.ell(-52,-112,15,20,'url(#petFur)',-35) + `<path d="M -66 -128 l -5 -7 M -61 -132 l -1 -8 M -55 -131 l 2 -7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`);
    o += H.collar(0,-140,40);
    o += PET_SPECIES.drage.head(P,H);
    return o; } },
};

const bob = (s, dy, dur, begin=0) => ANIM ? `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${s}</g>` : s;
const QUAD = {
  kat:    { rx:64, ry:27, cy:-70, w:14, tail:'kat',   hs:0.72, hx:58, hy:-104, step:0.5 },
  hund:   { rx:68, ry:34, cy:-72, w:18, tail:'hund',  hs:0.74, hx:62, hy:-110, step:0.42 },
  bjoern: { rx:72, ry:42, cy:-74, w:24, tail:'bjoern',hs:0.72, hx:58, hy:-118, step:0.62 },
};
function quadWalk(kind, P, H, an, hl){
  const q = QUAD[kind], hipY = q.cy + q.ry*0.35, sw = 20;
  const legPath = (x, fill) => H.path(`M ${x-q.w/2} ${hipY} L ${x-q.w/2} -9 Q ${x-q.w/2} 0 ${x} 0 Q ${x+q.w/2} 0 ${x+q.w/2} -9 L ${x+q.w/2} ${hipY}`, fill)
    + (H.sock ? H.path(`M ${x-q.w/2} -22 L ${x-q.w/2} -9 Q ${x-q.w/2} 0 ${x} 0 Q ${x+q.w/2} 0 ${x+q.w/2} -9 L ${x+q.w/2} -22 Z`, P.B) : '');
  const leg = (x, fill, phase) => spin(legPath(x, fill), x, hipY, phase ? [sw,-sw,sw] : [-sw,sw,-sw], q.step*2);
  let o = '';
  // halen bagved
  if (q.tail === 'kat') o += spin(H.thick(`M ${-q.rx+8} ${q.cy-8} C ${-q.rx-40} ${q.cy-20}, ${-q.rx-48} ${q.cy-70}, ${-q.rx-22} ${q.cy-96}`, P.A, P.L, 15), -q.rx+8, q.cy-8, [0,12,0,-8,0], 1.6);
  if (q.tail === 'hund') o += spin(H.thick(`M ${-q.rx+8} ${q.cy-12} C ${-q.rx-24} ${q.cy-30}, ${-q.rx-30} ${q.cy-56}, ${-q.rx-20} ${q.cy-72}`, P.A, P.L, 18) + `<circle cx="${-q.rx-20}" cy="${q.cy-72}" r="8.5" fill="${P.B}"/>`, -q.rx+8, q.cy-12, [0,22,0,-14,0], 0.5);
  if (q.tail === 'bjoern') o += `<circle cx="${-q.rx+4}" cy="${q.cy-14}" r="13" fill="${P.A}" stroke="${P.L}" stroke-width="3.5"/>`;
  // ben i den fjerne side
  o += leg(-q.rx*0.42, P.ASh, false) + leg(q.rx*0.5, P.ASh, true);
  // feevinger på ryggen
  if (P.acc.vinger){ const v = P.acc.vinger, f = (bx,by,ang,rx,ry) => { const r=ang*Math.PI/180, cx=bx+Math.cos(r)*rx*0.92, cy=by+Math.sin(r)*rx*0.92; return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${ang} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${v}" fill-opacity="0.55" stroke="${outline(v)}" stroke-width="3"/>`; };
    o += HLW(hl==='petacc:vinger', spin(f(-6, q.cy-q.ry+4, -110, 50, 24) + f(-6, q.cy-q.ry+8, -150, 38, 18), -6, q.cy-q.ry, [0,-14,0], 0.5)); }
  // kroppen
  const body = ellPath(0, q.cy, q.rx, q.ry);
  o += H.clip('pwC', body) + H.path(body, 'url(#petFur)');
  o += H.pat('pwC', [[-24,q.cy-10,10],[14,q.cy-16,8],[36,q.cy+4,7]], [`M -30 ${q.cy-q.ry-4} Q -24 ${q.cy} -30 ${q.cy+q.ry}`,`M -4 ${q.cy-q.ry-4} Q 2 ${q.cy} -4 ${q.cy+q.ry}`,`M 22 ${q.cy-q.ry-4} Q 28 ${q.cy} 22 ${q.cy+q.ry}`]);
  o += `<g clip-path="url(#pwC)"><ellipse cx="6" cy="${q.cy+q.ry*0.7}" rx="${q.rx*0.7}" ry="${q.ry*0.45}" fill="${P.B}"/></g>`;
  // ben i den nære side
  o += leg(-q.rx*0.56, 'url(#petFur)', true) + leg(q.rx*0.36, 'url(#petFur)', false);
  // halsbånd
  if (P.acc.halsbaand){ const h = P.acc.halsbaand; o += HLW(hl==='petacc:halsbaand', `<path d="M ${q.hx-36} ${q.hy+56} Q ${q.hx-10} ${q.hy+74} ${q.hx+14} ${q.hy+56}" fill="none" stroke="${outline(h)}" stroke-width="13" stroke-linecap="round"/><path d="M ${q.hx-36} ${q.hy+56} Q ${q.hx-10} ${q.hy+74} ${q.hx+14} ${q.hy+56}" fill="none" stroke="${h}" stroke-width="8" stroke-linecap="round"/><circle cx="${q.hx-10}" cy="${q.hy+72}" r="7" fill="#FFD54A" stroke="#C99A12" stroke-width="2"/>`); }
  // hovedet (samme hoved som når dyret sidder) med pynt
  let head = PET_SPECIES[kind].head(P, H);
  if (P.acc.sloejfe){ const b = P.acc.sloejfe, [x,y,r] = an.bow; head += HLW(hl==='petacc:sloejfe', `<g transform="translate(${x},${y}) rotate(${r}) scale(0.6)"><path d="M 0 0 C -30 -34, -62 -30, -58 0 C -62 30, -30 34, 0 0 Z M 0 0 C 30 -34, 62 -30, 58 0 C 62 30, 30 34, 0 0 Z" fill="${b}" stroke="${outline(b)}" stroke-width="4" stroke-linejoin="round"/><rect x="-13" y="-16" width="26" height="32" rx="10" fill="${shade(b)}" stroke="${outline(b)}" stroke-width="4"/></g>`); }
  if (P.acc.krone){ const g = P.acc.krone, [x,y,r=-8] = an.crown; head += HLW(hl==='petacc:krone', `<g transform="translate(${x},${y}) rotate(${r}) scale(0.7)"><path d="M -44 14 L -48 -26 L -24 -6 L 0 -38 L 24 -6 L 48 -26 L 44 14 Z" fill="#FFD54A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="0" r="8" fill="${g}" stroke="${outline(g)}" stroke-width="2.5"/></g>`); }
  o += bob(`<g transform="translate(${q.hx},${q.hy}) scale(${q.hs}) translate(0,196)">${head}</g>`, -5, q.step, 0.1);
  return bob(o, -4, q.step);
}

function petDraw(p, hl, mode){
  if (!p || !PET_SPECIES[p.kind]) return '';
  const P = { A:p.a, ASh:shade(p.a), L:outline(p.a), B:p.b, C:p.c, CL:outline(p.c), pat:p.pattern, acc:p.acc||{}, hl, walk: mode === 'walk' };
  const sp = PET_SPECIES[p.kind], H = petHelpers(P), an = sp.anchors;
  let o = `<g transform="translate(${PET_X},${PET_Y}) scale(${PET_S})">`;
  o += `<defs><linearGradient id="petIris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${adj(p.eyes,-0.25)}"/><stop offset="0.6" stop-color="${p.eyes}"/><stop offset="1" stop-color="${adj(p.eyes,0.28)}"/></linearGradient>`
    + `<linearGradient id="petFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.A}"/><stop offset="1" stop-color="${P.ASh}"/></linearGradient></defs>`;
  o += `<ellipse cx="${p.kind==='enhjoerning'?18:0}" cy="2" rx="${sp.shadow}" ry="11" fill="#5B3A8C" opacity="0.14"/>`;
  const body0 = o.length;
  if (P.walk && QUAD[p.kind]){
    o += quadWalk(p.kind, P, H, an, hl);
    if (hl === 'pet' || (hl === 'petpat' && !o.includes('<!--HL-->'))) o = o.slice(0, body0) + HLW(true, o.slice(body0));
    return o + `</g>`;
  }
  /* feevinger: hver vinge udgår fra et fast punkt på ryggen og peger ud */
  const fairy = (bx, by, ang, rx, ry, v, op=0.55) => { const r = ang*Math.PI/180, cx = bx + Math.cos(r)*rx*0.92, cy = by + Math.sin(r)*rx*0.92;
    return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${ang} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${v}" fill-opacity="${op}" stroke="${outline(v)}" stroke-width="3"/>`
      + `<path d="M ${bx} ${by} L ${(bx+Math.cos(r)*rx*1.5).toFixed(1)} ${(by+Math.sin(r)*rx*1.5).toFixed(1)}" stroke="${outline(v)}" stroke-width="2" opacity="0.35"/>`
      + star4(+(cx+Math.cos(r)*rx*0.35).toFixed(1), +(cy+Math.sin(r)*rx*0.35-6).toFixed(1), 6); };
  let nearWing = '';
  if (P.acc.vinger){ const v = P.acc.vinger, [wx,wy] = an.wings;
    if (an.wingsSide){
      o += HLW(hl==='petacc:vinger', `<g opacity="0.6">${spin(fairy(wx-12,wy-2,-74,50,24,v) + fairy(wx-12,wy+2,-32,36,18,v), wx-12, wy, [0,10,0], 0.9)}</g>`);
      nearWing = spin(fairy(wx,wy,-58,56,27,v) + fairy(wx,wy+4,-16,40,19,v), wx, wy, [0,-12,0], 0.9) + `<circle cx="${wx}" cy="${wy+2}" r="6" fill="${outline(v)}"/>`;
    } else {
      const w = fairy(wx,wy-6,202,74,34,v) + fairy(wx,wy+10,152,52,24,v);
      o += HLW(hl==='petacc:vinger', H.mirror(spin(w, wx, wy, [0,-9,0], 0.9), wx));
    } }
  o += sp.draw(P, H);
  o += HLW(hl==='petacc:vinger', nearWing);
  if (P.acc.sloejfe){ const b = P.acc.sloejfe, [x,y,r] = an.bow;
    o += HLW(hl==='petacc:sloejfe', `<g transform="translate(${x},${y}) rotate(${r}) scale(0.6)"><path d="M 0 0 C -30 -34, -62 -30, -58 0 C -62 30, -30 34, 0 0 Z M 0 0 C 30 -34, 62 -30, 58 0 C 62 30, 30 34, 0 0 Z" fill="${b}" stroke="${outline(b)}" stroke-width="4" stroke-linejoin="round"/><rect x="-13" y="-16" width="26" height="32" rx="10" fill="${shade(b)}" stroke="${outline(b)}" stroke-width="4"/></g>`); }
  if (P.acc.krone){ const g = P.acc.krone, [x,y,r=-8] = an.crown;
    o += HLW(hl==='petacc:krone', `<g transform="translate(${x},${y}) rotate(${r}) scale(0.7)"><path d="M -44 14 L -48 -26 L -24 -6 L 0 -38 L 24 -6 L 48 -26 L 44 14 Z" fill="#FFD54A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="0" r="8" fill="${g}" stroke="${outline(g)}" stroke-width="2.5"/><circle cx="-48" cy="-26" r="5" fill="#FFFFFF"/><circle cx="48" cy="-26" r="5" fill="#FFFFFF"/><circle cx="0" cy="-38" r="5" fill="#FFFFFF"/></g>`); }
  if ((hl === 'pet' || (hl === 'petpat' && !o.includes('<!--HL-->'))) ) o = o.slice(0, body0) + HLW(true, o.slice(body0));
  if (P.walk && p.kind === 'kanin') o = o.slice(0, body0) + (ANIM ? `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -46;0 0;0 0" keyTimes="0;0.35;0.7;1" calcMode="spline" keySplines="0.2 0.8 0.4 1;0.6 0 0.8 0.2;0 0 1 1" dur="0.7s" repeatCount="indefinite"/>${o.slice(body0)}</g>` : o.slice(body0));
  else if (P.walk && p.kind === 'drage') o = o.slice(0, body0) + bob(spin(o.slice(body0), 0, 0, [-7,7,-7], 0.8), -6, 0.4);
  else if (P.walk) o = o.slice(0, body0) + bob(o.slice(body0), -3, 0.3);
  else o = o.slice(0, body0) + squash(o.slice(body0), 0, 0, ['1 1','1.012 1.02','1 1'], 2.8, 0.4);
  return o + `</g>`;
}

/* ================= LAGREGLER =================
   Pladser: kun én ting ad gangen på samme plads. Skjult: ting, der ikke kan ses under en anden.
   Nye ting skal have en plads her, hvis de deler plads med noget. */
const ACC_SLOTS = [ ['kasket','tiara','katteoerer'], ['halskaede','butterfly'], ['katteoerer','sloejfe'], ['kasket','sloejfe'], ['kasket','spaender'] ];
const ACC_HIDDEN_BY = { spaender:['kasket'], sloejfe:['kasket'] };
function accConflicts(k){ const out = new Set(); for (const slot of ACC_SLOTS) if (slot.includes(k)) slot.forEach(x => { if (x !== k) out.add(x); }); return [...out]; }
/* rydder op, så tegningen aldrig viser to ting oven i hinanden */
function resolveLayers(st){
  const keys = Object.keys(st.acc || {});
  if (!keys.length) return st;
  const acc = {};
  for (const k of keys){ if (accConflicts(k).some(x => acc[x])) continue; acc[k] = st.acc[k]; }
  for (const [k, by] of Object.entries(ACC_HIDDEN_BY)) if (acc[k] && by.some(x => acc[x])) delete acc[k];
  return Object.assign({}, st, { acc });
}

/* ================= SAMLING ================= */
function derive(st){
  const c = {};
  c.skin = st.skin; c.skinSh = adj(st.skin,-0.08,-0.2); c.skinLine = adj(st.skin,-0.25,-0.35);
  const ha = st.hair.a, hb = st.hair.ombre ? st.hair.b : st.hair.a;
  c.hairA = ha; c.hairMid = adj(ha,-0.07); c.hairTip = hb; c.hairHi = adj(ha,0.17); c.hairLine = adj(ha,-0.3,0.05);
  c.tie = st.hair.tie; c.tieLine = outline(st.hair.tie); c.brow = c.hairLine;
  c.eyeMid = st.eyes.color; c.eyeDark = adj(st.eyes.color,-0.24); c.eyeLight = adj(st.eyes.color,0.3); c.pupil = st.eyes.pupil;
  const m = st.mk; c.shadowOn = !!m.shadow; c.shadow = m.shadow || '#FFFFFF'; c.glitter = m.glitter; c.liner = m.liner;
  c.blushOn = !!m.blush; c.blush = m.blush || '#FFFFFF'; c.lips = m.lips; c.lipsDark = adj(m.lips,-0.16); c.lipShape = m.lipShape;
  c.mark = m.mark; c.markColor = m.markColor;
  c.topA = st.top.a; c.topASh = shade(st.top.a); c.topALine = outline(st.top.a); c.topB = st.top.b; c.topBLine = outline(st.top.b);
  c.botA = st.bottom.a; c.botASh = shade(st.bottom.a); c.botALine = outline(st.bottom.a); c.botB = st.bottom.b; c.botBLine = outline(st.bottom.b);
  c.shoeA = st.shoes.a; c.shoeASh = shade(st.shoes.a); c.shoeALine = outline(st.shoes.a); c.shoeB = st.shoes.b; c.shoeBLine = outline(st.shoes.b);
  return c;
}

const DEFAULT_STATE = {
  skin:'#F8CDAE',
  eyes:{ color:'#16B3B8', pupil:'rund' },
  mk:{ shadow:'#FF62B0', glitter:true, liner:'bloed', blush:'#FF7FA6', lips:'#EE4C86', lipShape:'pust', mark:'hjerte', markColor:'#FF62B0' },
  front:'boelge', back:'rottehaler',
  hair:{ a:'#8A5BE8', b:'#FF79C6', ombre:true, tie:'#FF5FA8' },
  top:{ id:'stjerne', a:'#62E0CB', b:'#FFE27A' },
  bottom:{ id:'plisse', a:'#FF5FA8', b:'#FFFFFF' },
  shoes:{ id:'sneakers', a:'#9C7CFF', b:'#FF5FA8' },
  acc:{ sloejfe:'#FF5FA8', halskaede:'#4B2A9A' },
  pet:{ kind:'kat', a:'#FFC9E2', b:'#FFFFFF', c:'#B79BFF', pattern:'ingen', eyes:'#3D8BFF', acc:{ halsbaand:'#7B5CFF' }, name:'' },
};

function renderDoll(st, opts={}){
  st = resolveLayers(st);
  const c = derive(st);
  if (st.bottom.id === 'jeans' && (SHOES[st.shoes.id]||{}).boot) c.tuck = SHOES[st.shoes.id].boot;
  const vb = opts.viewBox || `0 0 ${W} ${H}`;
  const back = BACK[st.back] || BACK.rottehaler, top = TOPS[st.top.id] || TOPS.stjerne, bot = BOTTOMS[st.bottom.id] || BOTTOMS.plisse, shoe = SHOES[st.shoes.id] || SHOES.sneakers;
  const hl = opts.hl || '';
  const acc = (layer, pred=()=>true) => Object.keys(st.acc||{}).filter(k=>ACC[k] && ACC[k].layer===layer && pred(k)).map(k=>HLW(hl==='acc:'+k, ACC[k].draw(st.acc[k]))).join('');
  ANIM = !!opts.anim;
  IDLE = opts.idle && ANIM ? makeIdle(!(st.acc && st.acc.stav)) : null;
  const wave = !!opts.wave && ANIM;
  ARMS.R = (st.acc && st.acc.stav) || wave ? ARM_R_UP : ARM_R_DOWN;
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${opts.size?` width="${opts.size[0]}" height="${opts.size[1]}"`:''}>`];
  o.push(`<defs>${grad('bgG', opts.bg1||'#FFF3F8', opts.bg2||'#EBDDFF')}
<radialGradient id="blushG"><stop offset="0" stop-color="${c.blush}" stop-opacity="0.75"/><stop offset="1" stop-color="${c.blush}" stop-opacity="0"/></radialGradient>
<linearGradient id="irisG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.eyeDark}"/><stop offset="0.55" stop-color="${c.eyeMid}"/><stop offset="1" stop-color="${c.eyeLight}"/></linearGradient>
<linearGradient id="shadowG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.shadow}" stop-opacity="0.95"/><stop offset="1" stop-color="${c.shadow}" stop-opacity="0.25"/></linearGradient>
<linearGradient id="fringeG" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="560"><stop offset="0" stop-color="${c.hairA}"/><stop offset="1" stop-color="${c.hairMid}"/></linearGradient>
${grad('lipG', c.lips, c.lipsDark)}<clipPath id="headC"><path d="${HEAD}"/></clipPath></defs>`);
  if (opts.petOnly){ o.push(hlCompose(petDraw(st.pet, hl, opts.petMode))); o.push(`</svg>`); return o.join(''); }
  if (opts.bg){
    o.push(`<rect x="-400" y="-400" width="1600" height="1900" fill="url(#bgG)"/>`);
    [[110,150,16,.9],[690,120,22,.9],[720,520,12,.8],[80,620,14,.8],[650,900,18,.8],[140,930,12,.8],[610,240,8,.7]].forEach(([x,y,r,op],i) => o.push(ANIM ? `<g>${star4(x,y,r,'#FFFFFF',op)}<animate attributeName="opacity" values="1;0.25;1" dur="${2.4+i*0.37}s" repeatCount="indefinite"/></g>` : star4(x,y,r,'#FFFFFF',op)));
    o.push(`<ellipse cx="400" cy="1046" rx="170" ry="20" fill="#5B3A8C" opacity="0.14"/>`);
  }
  const doll = [];
  const HEAD_SWAY = [0,1.4,0,-1.4,0];
  doll.push(spin(headTurn(HLW(hl==='back', back.back(c))), 400, 590, HEAD_SWAY, 7));
  doll.push(`<g transform="translate(0,22)">`);
  if (top.back) doll.push(HLW(hl==='top', top.back(c)));
  for (const [x1,x2] of [[368,366],[432,434]]) doll.push(strokeBoth(`M ${x1} 815 L ${x2} 962`, c.skin, c.skinLine, 35));
  if (bot.under) doll.push(HLW(hl==='bottom', bot.under(c)));
  doll.push(HLW(hl==='shoes', shoe.draw(c)));
  doll.push(`<path d="${TORSO}" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5" stroke-linejoin="round"/>`);
  doll.push(`<path d="M 378 548 L 378 606 Q 400 622 422 606 L 422 548 Z" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5"/><path d="M 379 552 L 421 552 L 421 578 Q 400 590 379 578 Z" fill="${c.skinSh}" opacity="0.8"/>`);
  doll.push(HLW(hl==='bottom', bot.main(c)));
  if (c.tuck) doll.push(HLW(hl==='shoes', shoe.draw(c)));
  if (!top.tucked) doll.push(HLW(hl==='bottom', bot.waist(c)));
  doll.push(HLW(hl==='top', top.body(c)));
  if (top.tucked) doll.push(HLW(hl==='bottom', bot.waist(c)));
  const waveEv = IDLE && IDLE.ev.find(e => e.kind === 'wave');
  if (waveEv){
    ARM_ONLY = ['L']; doll.push(armSkin(c) + (top.sleeves ? top.sleeves(c) : '') + hands(c));
    ARM_ONLY = ['R'];
    const armWith = pose => { ARMS.R = pose; return armSkin(c) + (top.sleeves ? top.sleeves(c) : '') + acc('hand') + hands(c) + acc('body', k => k === 'armbaand'); };
    const dn = armWith(ARM_R_DOWN), md = armWith(ARM_R_MID), up = spin(armWith(ARM_R_UP), 470, 630, [0,-22,0,14,0], 0.9);
    ARMS.R = ARM_R_DOWN; ARM_ONLY = null;
    const m = 0.16;
    doll.push(showDuring(dn, [[0, waveEv.a], [waveEv.b, IDLE.T]]));
    doll.push(showDuring(md, [[waveEv.a, waveEv.a+m], [waveEv.b-m, waveEv.b]]));
    doll.push(showDuring(up, [[waveEv.a+m, waveEv.b-m]]));
    doll.push(acc('body', k => k !== 'armbaand'));
  } else if (wave){
    ARM_ONLY = ['L']; doll.push(armSkin(c) + (top.sleeves ? top.sleeves(c) : '') + hands(c));
    ARM_ONLY = ['R']; const rArm = armSkin(c) + (top.sleeves ? top.sleeves(c) : '') + acc('hand') + hands(c) + acc('body', k => k === 'armbaand');
    ARM_ONLY = null; doll.push(spin(rArm, 470, 630, [0,-22,0,14,0], 1.1));
    doll.push(acc('body', k => k !== 'armbaand'));
  } else {
    doll.push(armSkin(c));
    if (top.sleeves) doll.push(HLW(hl==='top', top.sleeves(c)));
    doll.push(acc('hand'));
    doll.push(hands(c));
    doll.push(acc('body'));
  }
  doll.push(`</g>`);
  doll.push(spin(headTurn(headLayer(c, st.front, hl) + HLW(hl==='front', frontLayer(c, st.front)) + (back.over ? HLW(hl==='back', back.over(c)) : '') + acc('face') + acc('head')), 400, 590, HEAD_SWAY, 7));
  let content = squash(doll.join(''), 400, 1046, ['1 1','1.006 1.012','1 1'], 3.6);
  if (opts.walk && ANIM) content = bob(spin(content, 400, 1046, [-3,3,-3], 0.64), -12, 0.32);
  if (opts.pet !== false) content += petDraw(st.pet, hl);
  o.push(hl ? hlCompose(content) : content);
  o.push(`</svg>`);
  return o.join('');
}

if (typeof module !== 'undefined') module.exports = { resolveLayers, accConflicts, renderDoll, DEFAULT_STATE, BACK, FRONT, TOPS, BOTTOMS, SHOES, ACC, PET_KINDS, PET_PATTERNS, PET_ACC, adj };
