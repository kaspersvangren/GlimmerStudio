'use strict';
/* ================= Glimmerstudiet — tegning af dukken (SVG i lag) ================= */
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

/* ---------- små figurer ---------- */
function star4(cx, cy, r, fill='#FFFFFF', op=1){
  return `<path d="M ${cx} ${cy-r} Q ${cx} ${cy} ${cx+r} ${cy} Q ${cx} ${cy} ${cx} ${cy+r} Q ${cx} ${cy} ${cx-r} ${cy} Q ${cx} ${cy} ${cx} ${cy-r} Z" fill="${fill}" opacity="${op}"/>`; }
function star5pts(cx, cy, R, r, rot=-90){ const p=[]; for(let i=0;i<10;i++){ const a=(rot+i*36)*Math.PI/180, rad=i%2?r:R; p.push(`${(cx+rad*Math.cos(a)).toFixed(1)},${(cy+rad*Math.sin(a)).toFixed(1)}`);} return p.join(' '); }
function heart(cx, cy, s, fill, stroke='none', sw=0, extra=''){
  return `<path transform="translate(${cx},${cy}) scale(${s})" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`; }
const mirror = s => `<g transform="translate(${W},0) scale(-1,1)">${s}</g>`;
const lines = (list, color, op=0.35, w=3) => list.map(d=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`).join('');

/* ---------- arme og positur ---------- */
const ARMS = { L:{S:[330,630],E:[286,700],H:[338,744]}, R:{S:[470,630],E:[500,700],H:[510,766]} };
function seg(a,b){ const dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy); return {dx:dx/l, dy:dy/l, l}; }
function armLen(a){ return seg(a.S,a.E).l + seg(a.E,a.H).l; }
function armAt(a, t){ const u=seg(a.S,a.E), f=seg(a.E,a.H);
  return t<=u.l ? [a.S[0]+u.dx*t, a.S[1]+u.dy*t] : [a.E[0]+f.dx*(t-u.l), a.E[1]+f.dy*(t-u.l)]; }
function armPts(a, t0, t1){ const u=seg(a.S,a.E); const p=[armAt(a,t0)]; if(t0<u.l && t1>u.l) p.push(a.E); p.push(armAt(a,t1)); return p; }
const poly = pts => 'M '+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L ');
function strokeBoth(d, fill, line, w, cap='round'){
  return `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w+5}" stroke-linecap="${cap}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`; }
function armSkin(c){ return ['L','R'].map(k=>{ const a=ARMS[k]; return strokeBoth(poly([a.S,a.E,a.H]), c.skin, c.skinLine, 27); }).join(''); }
function hands(c){
  return ['L','R'].map(k=>{ const a=ARMS[k], f=seg(a.E,a.H); const cx=a.H[0]+f.dx*6, cy=a.H[1]+f.dy*6;
    const ang=Math.atan2(f.dy,f.dx)*180/Math.PI; const side = k==='R'?1:-1;
    const px=-f.dy*side, py=f.dx*side; const tx=cx+px*11-f.dx*3, ty=cy+py*11-f.dy*3;
    return `<ellipse cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" rx="8" ry="6" transform="rotate(${ang.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5"/>`
         + `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="17" ry="14" transform="rotate(${ang.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5"/>`;
  }).join('');
}
function longSleeves(fill, line, cuff){
  return ['L','R'].map(k=>{ const a=ARMS[k], L=armLen(a), f=seg(a.E,a.H);
    const d=poly(armPts(a,0,L-34)); const m=armAt(a,L-21); const px=-f.dy, py=f.dx;
    const P=(s,t)=>`${(m[0]+px*s+f.dx*t).toFixed(1)},${(m[1]+py*s+f.dy*t).toFixed(1)}`;
    return strokeBoth(d, fill, line, 40) + `<polygon points="${P(-22,-8)} ${P(22,-8)} ${P(22,8)} ${P(-22,8)}" fill="${cuff}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/>`;
  }).join('');
}
function puffs(fillUrl, line){
  return ['L','R'].map(k=>{ const a=ARMS[k], u=seg(a.S,a.E); const cx=a.S[0]+u.dx*6, cy=a.S[1]+u.dy*6; const ang=Math.atan2(u.dy,u.dx)*180/Math.PI;
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
      return `<defs>${hairGrad(c,'tlG',300,790)}<clipPath id="tlC"><path d="${TAIL}"/></clipPath></defs>` + t + mirror(t) + crown(c); },
    over: c => scrunchie(c,212,300,28) + mirror(scrunchie(c,212,300,28)) },
  knolde: { label:'Knolde', back: c =>
      `<defs><radialGradient id="bunG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="${c.hairA}"/><stop offset="1" stop-color="${c.hairMid}"/></radialGradient></defs>`
      + bun(c,258,1) + bun(c,542,-1) + hairPiece(c,'bb',BOB,200,620,BOB_STRANDS) },
  page: { label:'Page', back: c => hairPiece(c,'bb',BOB,200,620,BOB_STRANDS,["M 152 470 C 150 530, 146 570, 140 596"]) },
  langt: { label:'Langt hår', back: c => hairPiece(c,'lg',LONG,200,860,
      ["M 186 420 C 180 560, 176 700, 180 850","M 614 420 C 620 560, 624 700, 620 850","M 230 520 C 220 640, 214 740, 210 850","M 570 520 C 580 640, 586 740, 590 850","M 200 300 C 170 380, 166 450, 168 520","M 600 300 C 630 380, 634 450, 632 520"],
      ["M 168 460 C 162 560, 162 660, 168 760"]) },
  hestehale: { label:'Hestehale', back: c => hairPiece(c,'pn',PONY,180,730,
      ["M 560 200 C 640 220, 668 330, 662 420 C 656 520, 668 600, 650 700","M 520 236 C 590 280, 628 380, 632 470"],["M 620 230 C 668 290, 676 360, 670 430"]) + crown(c),
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
  fletninger: { label:'Fletninger', back: c => {
      let one = '';
      for(let i=7;i>=0;i--){ const x = 214 + (i%2? 7:-7), y = 472 + i*40; const rot = i%2? 24:-24;
        one += `<ellipse cx="${x}" cy="${y}" rx="30" ry="25" transform="rotate(${rot} ${x} ${y})" fill="url(#flG)" stroke="${c.hairLine}" stroke-width="3"/>`
             + `<path d="M ${x-14} ${y-8} Q ${x} ${y-16} ${x+12} ${y-10}" transform="rotate(${rot} ${x} ${y})" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.35" stroke-linecap="round"/>`; }
      const ty = 472 + 8*40 - 14;
      one = `<path d="M 196 ${ty} Q 186 ${ty+40} 174 ${ty+66} Q 204 ${ty+52} 214 ${ty+70} Q 224 ${ty+52} 254 ${ty+66} Q 242 ${ty+40} 232 ${ty} Z" fill="${c.hairTip}" stroke="${c.hairLine}" stroke-width="3" stroke-linejoin="round"/>` + one
          + `<ellipse cx="214" cy="${ty+2}" rx="22" ry="11" fill="${c.tie}" stroke="${c.tieLine}" stroke-width="3"/>`;
      return `<defs>${hairGrad(c,'flG',440,780)}</defs>` + one.replace(/\n/g,'') + mirror(one) + crown(c); } },
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
const SIDE_STRANDS = ["M 198 380 C 196 440, 200 500, 206 560","M 602 380 C 604 440, 600 500, 594 560"];
const FRONT = {
  boelge: { label:'Bølger', d: FRONT_BOELGE, strands:["M 474 276 C 470 240, 450 210, 420 180","M 384 270 C 378 240, 372 210, 380 176","M 296 278 C 292 246, 304 216, 330 184","M 236 302 C 232 270, 244 236, 270 204","M 566 302 C 570 270, 558 236, 532 204","M 200 380 C 200 420, 206 450, 214 476","M 600 380 C 600 420, 594 450, 586 476"] },
  side: { label:'Sidefej', d: FRONT_SIDE, strands:["M 524 340 C 520 280, 490 220, 440 186","M 442 312 C 436 260, 410 210, 370 182","M 372 282 C 360 240, 330 206, 300 192","M 566 316 C 572 270, 560 230, 530 200", ...SIDE_STRANDS] },
  midt: { label:'Midterskilning', d: FRONT_MIDT, strands:["M 400 212 C 460 214, 530 250, 568 320","M 400 212 C 340 214, 270 250, 232 320","M 400 190 C 470 196, 550 240, 590 330","M 400 190 C 330 196, 250 240, 210 330", ...SIDE_STRANDS] },
  lige: { label:'Lige pandehår', d: FRONT_LIGE, strands:["M 280 326 L 284 230","M 340 330 L 342 200","M 400 330 L 400 196","M 460 330 L 458 200","M 520 326 L 516 230", ...SIDE_STRANDS] },
  pjusket: { label:'Pjusket', d: FRONT_PJUSKET, strands:["M 524 340 C 520 290, 500 240, 470 200","M 450 330 C 446 280, 430 230, 400 196","M 376 336 C 370 290, 350 240, 320 206","M 300 336 C 296 290, 286 250, 266 222", ...SIDE_STRANDS] },
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
  g += `<circle cx="1" cy="6" r="42" fill="url(#irisG)"/><circle cx="1" cy="6" r="42" fill="none" stroke="${c.eyeDark}" stroke-width="5"/>`;
  g += `<path d="M -27 27 C -14 45, 18 45, 31 27 C 20 38, -16 38, -27 27 Z" fill="${c.eyeLight}" opacity="0.9"/>`;
  if (c.pupil==='hjerte') g += heart(2, 10, 2.4, pc);
  else if (c.pupil==='stjerne') g += `<polygon points="${star5pts(2,7,25,11)}" fill="${pc}" stroke="${pc}" stroke-width="3" stroke-linejoin="round"/>`;
  else if (c.pupil==='glimt') g += `<ellipse cx="2" cy="4" rx="12" ry="16" fill="${pc}"/>`;
  else g += `<ellipse cx="2" cy="2" rx="17" ry="22" fill="${pc}"/>`;
  g += `<path d="M -60 -70 L 64 -70 L 64 -40 C 40 -30, -30 -30, -60 -36 Z" fill="#2A1640" opacity="0.16"/></g>`;
  if (c.liner==='ingen') g += `<path d="M -52 4 C -52 -40, -22 -60, 6 -60 C 36 -60, 54 -34, 54 2" fill="none" stroke="${L}" stroke-width="4.5" stroke-linecap="round"/>`;
  else {
    g += `<path d="M -58 10 C -60 -44, -26 -68, 6 -68 C 40 -68, 60 -40, 59 2 C 54 -30, 34 -55, 6 -55 C -18 -55, -42 -40, -47 -4 C -50 2, -54 8, -58 10 Z" fill="${L}"/>`;
    if (c.liner==='vinge') g += `<path d="M -57 4 C -61 -8, -69 -19, -80 -28 C -67 -29, -56 -30, -46 -31 Z" fill="${L}"/><path d="M -45 -36 C -49 -44, -54 -51, -60 -57 C -50 -54, -42 -51, -34 -48 Z" fill="${L}"/>`;
    else g += `<path d="M -50 -26 C -55 -32, -60 -36, -66 -40 C -57 -40, -50 -38, -44 -36 Z" fill="${L}"/><path d="M -36 -46 C -39 -52, -42 -56, -46 -61 C -38 -58, -32 -55, -28 -52 Z" fill="${L}"/>`;
  }
  g += `<path d="M -51 22 C -44 48, -16 62, 8 61" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
  g += `<path d="M -50 -86 Q -8 -110 40 -97" fill="none" stroke="${c.brow}" stroke-width="7" stroke-linecap="round"/>`;
  if (c.shadowOn && c.glitter) for (const [x,y,r] of [[-40,-58,5],[-8,-76,6],[28,-70,4.5],[48,-44,4]]) g += star4(x,y,r,'#FFFFFF',0.95);
  g += `</g><circle cx="-15" cy="-20" r="14" fill="#FFFFFF"/><circle cx="22" cy="26" r="6.5" fill="#FFFFFF"/>` + star4(-30,14,6,'#FFFFFF',0.9);
  if (c.pupil==='glimt') g += star4(16,-2,14,'#FFFFFF',0.95) + `<circle cx="-26" cy="-2" r="4" fill="#FFFFFF"/>`;
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
function headLayer(c, frontKey){
  let o = `<path d="${HEAD}" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="3"/><g clip-path="url(#headC)">`;
  o += `<path d="${(FRONT[frontKey]||FRONT.boelge).d}" transform="translate(0,14)" fill="${c.skinSh}" opacity="0.75"/>`;
  if (c.blushOn) o += `<ellipse cx="262" cy="512" rx="48" ry="27" fill="url(#blushG)"/><ellipse cx="538" cy="512" rx="48" ry="27" fill="url(#blushG)"/>`;
  o += `</g>`;
  if (c.blushOn) for (const x of [252,268,284,516,532,548]) o += `<path d="M ${x} 518 l 6 -12" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`;
  o += eye(316,440,false,c) + eye(484,440,true,c);
  o += `<path d="M 393 500 Q 400 507 407 500" fill="none" stroke="${c.skinLine}" stroke-width="3" stroke-linecap="round"/>`;
  return o + mouth(c) + faceMark(c);
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
      let o = `<defs>${grad('btG',c.botA,c.botASh)}</defs><path d="M 342 724 L 458 724 C 462 780, 456 860, 472 994 L 408 996 L 404 830 L 400 792 L 396 830 L 392 996 L 328 994 C 344 860, 338 780, 342 724 Z" fill="url(#btG)" stroke="${c.botALine}" stroke-width="3" stroke-linejoin="round"/>`;
      o += `<path d="M 346 744 C 344 820, 342 900, 336 986 M 454 744 C 456 820, 458 900, 464 986 M 352 742 Q 368 764 374 742 M 448 742 Q 432 764 426 742" fill="none" stroke="${c.botB}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"/>`;
      o += `<path d="M 330 978 L 392 980 M 408 980 L 470 978" stroke="${c.botB}" stroke-width="2.5" stroke-dasharray="6 5"/>`;
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
  stoevler: { label:'Støvler', draw: c => {
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
  rulle: { label:'Rulleskøjter', draw: c => {
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
  hoeje: { label:'Høje støvler', draw: c => {
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
  briller: { label:'Hjertebriller', layer:'face', color:'#FF5FA8', draw: (k) => {
      const lens = x => `<path transform="translate(${x},468) scale(5.4)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${k}" fill-opacity="0.45" stroke="${outline(k)}" stroke-width="1.5" stroke-linejoin="round"/>`
        + `<path d="M ${x-36} ${428} Q ${x-26} ${416} ${x-12} ${418}" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
      return lens(316) + lens(484) + `<path d="M 360 432 Q 400 418 440 432" fill="none" stroke="${outline(k)}" stroke-width="7" stroke-linecap="round"/><path d="M 262 424 L 214 410 M 538 424 L 586 410" stroke="${outline(k)}" stroke-width="6" stroke-linecap="round"/>`; } },
  halskaede: { label:'Halskæde', layer:'body', color:'#4B2A9A', draw: (k) => `<path d="M 379 586 Q 400 598 421 586" fill="none" stroke="${k}" stroke-width="7"/>` + heart(400,600,0.85,'#FF5FA8','#B32268',1.5) },
  armbaand: { label:'Armbånd', layer:'body', color:'#FF5FA8', draw: (k) => { const a=ARMS.R, f=seg(a.E,a.H); const p=[a.E[0]+(a.H[0]-a.E[0])*0.66, a.E[1]+(a.H[1]-a.E[1])*0.66]; const ang=Math.atan2(f.dy,f.dx)*180/Math.PI+90;
      return `<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-19" y="-5" width="38" height="10" rx="5" fill="${k}" stroke="${outline(k)}" stroke-width="2"/><circle cx="-8" cy="0" r="3.2" fill="#FFFFFF"/><circle cx="8" cy="0" r="3.2" fill="#FFE27A"/></g>`; } },
  taske: { label:'Taske', layer:'hand', color:'#B79BFF', draw: (k) => `<path d="M 494 806 Q 492 760 512 762 Q 532 760 530 806" fill="none" stroke="${outline(k)}" stroke-width="6" stroke-linecap="round"/>`
      + `<rect x="476" y="800" width="72" height="56" rx="14" fill="${k}" stroke="${outline(k)}" stroke-width="3"/><path d="M 476 818 Q 512 836 548 818 L 548 812 Q 548 800 534 800 L 490 800 Q 476 800 476 812 Z" fill="${shade(k)}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/>`
      + heart(512,836,1.2,'#FFE27A','#C99A12',1.2) + star4(490,846,4) },
  stav: { label:'Tryllestav', layer:'hand', color:'#FFE27A', draw: (k) => `<path d="M 506 778 L 574 668" stroke="#5B3FC0" stroke-width="9" stroke-linecap="round"/><path d="M 506 778 L 574 668" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 8"/>`
      + `<polygon points="${star5pts(580,654,30,13,-80)}" fill="${k}" stroke="${outline(k)}" stroke-width="3" stroke-linejoin="round"/>` + star4(574,646,6) + star4(620,630,8,k) + star4(612,690,5,k) + star4(548,620,5,k) },
};

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
  mk:{ shadow:'#FF62B0', glitter:true, liner:'vinge', blush:'#FF7FA6', lips:'#EE4C86', lipShape:'pust', mark:'hjerte', markColor:'#FF62B0' },
  front:'boelge', back:'rottehaler',
  hair:{ a:'#8A5BE8', b:'#FF79C6', ombre:true, tie:'#FF5FA8' },
  top:{ id:'stjerne', a:'#62E0CB', b:'#FFE27A' },
  bottom:{ id:'plisse', a:'#FF5FA8', b:'#FFFFFF' },
  shoes:{ id:'sneakers', a:'#9C7CFF', b:'#FF5FA8' },
  acc:{ sloejfe:'#FF5FA8', halskaede:'#4B2A9A', armbaand:'#FF5FA8' },
};

function renderDoll(st, opts={}){
  const c = derive(st);
  const vb = opts.viewBox || `0 0 ${W} ${H}`;
  const back = BACK[st.back] || BACK.rottehaler, top = TOPS[st.top.id] || TOPS.stjerne, bot = BOTTOMS[st.bottom.id] || BOTTOMS.plisse, shoe = SHOES[st.shoes.id] || SHOES.sneakers;
  const acc = layer => Object.keys(st.acc||{}).filter(k=>ACC[k] && ACC[k].layer===layer).map(k=>ACC[k].draw(st.acc[k])).join('');
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${opts.size?` width="${opts.size[0]}" height="${opts.size[1]}"`:''}>`];
  o.push(`<defs>${grad('bgG', opts.bg1||'#FFF3F8', opts.bg2||'#EBDDFF')}
<radialGradient id="blushG"><stop offset="0" stop-color="${c.blush}" stop-opacity="0.75"/><stop offset="1" stop-color="${c.blush}" stop-opacity="0"/></radialGradient>
<linearGradient id="irisG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.eyeDark}"/><stop offset="0.55" stop-color="${c.eyeMid}"/><stop offset="1" stop-color="${c.eyeLight}"/></linearGradient>
<linearGradient id="shadowG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.shadow}" stop-opacity="0.95"/><stop offset="1" stop-color="${c.shadow}" stop-opacity="0.25"/></linearGradient>
<linearGradient id="fringeG" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="560"><stop offset="0" stop-color="${c.hairA}"/><stop offset="1" stop-color="${c.hairMid}"/></linearGradient>
${grad('lipG', c.lips, c.lipsDark)}<clipPath id="headC"><path d="${HEAD}"/></clipPath></defs>`);
  if (opts.bg){
    o.push(`<rect x="-400" y="-400" width="1600" height="1900" fill="url(#bgG)"/>`);
    for (const [x,y,r,op] of [[110,150,16,.9],[690,120,22,.9],[720,520,12,.8],[80,620,14,.8],[650,900,18,.8],[140,930,12,.8],[610,240,8,.7]]) o.push(star4(x,y,r,'#FFFFFF',op));
    o.push(`<ellipse cx="400" cy="1046" rx="170" ry="20" fill="#5B3A8C" opacity="0.14"/>`);
  }
  o.push(back.back(c));
  o.push(`<g transform="translate(0,22)">`);
  if (top.back) o.push(top.back(c));
  for (const [x1,x2] of [[368,366],[432,434]]) o.push(strokeBoth(`M ${x1} 815 L ${x2} 962`, c.skin, c.skinLine, 35));
  if (bot.under) o.push(bot.under(c));
  o.push(shoe.draw(c));
  o.push(`<path d="${TORSO}" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5" stroke-linejoin="round"/>`);
  o.push(`<path d="M 378 548 L 378 606 Q 400 622 422 606 L 422 548 Z" fill="${c.skin}" stroke="${c.skinLine}" stroke-width="2.5"/><path d="M 379 552 L 421 552 L 421 578 Q 400 590 379 578 Z" fill="${c.skinSh}" opacity="0.8"/>`);
  o.push(bot.main(c));
  if (!top.tucked) o.push(bot.waist(c));
  o.push(top.body(c));
  if (top.tucked) o.push(bot.waist(c));
  o.push(armSkin(c));
  if (top.sleeves) o.push(top.sleeves(c));
  o.push(acc('hand'));
  o.push(hands(c));
  o.push(acc('body'));
  o.push(`</g>`);
  o.push(headLayer(c, st.front));
  o.push(frontLayer(c, st.front));
  if (back.over) o.push(back.over(c));
  o.push(acc('face'));
  o.push(acc('head'));
  o.push(`</svg>`);
  return o.join('');
}

if (typeof module !== 'undefined') module.exports = { renderDoll, DEFAULT_STATE, BACK, FRONT, TOPS, BOTTOMS, SHOES, ACC, adj };
