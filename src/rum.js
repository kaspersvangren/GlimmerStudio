/* ================= Værelset: indretning i pladser (1600×1000, set forfra) =================
   Hver plads har nogle ting; nogle er frie fra start, resten findes i boblerne (låse-nøgle "rum:plads.ting").
   Hver plads har også én farve, man selv vælger. */
const R_INK = '#3A2340';
const rOut = (c, t = 0.42) => fdk(c, t);
const RS = (c, w = 3) => `stroke="${rOut(c)}" stroke-width="${w}" stroke-linejoin="round"`;
function rClip(d, inner){ return clipG(d, inner); }

/* ---------- væggen ---------- */
function wallBase(c){
  return `<rect x="0" y="0" width="1600" height="700" fill="${c}"/>`
    + `<defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SHC}" stop-opacity=".28"/><stop offset=".35" stop-color="${SHC}" stop-opacity="0"/><stop offset="1" stop-color="${SHC}" stop-opacity=".12"/></linearGradient></defs>`;
}
function wallTop(){ return `<rect x="0" y="0" width="1600" height="700" fill="url(#wallG)"/><rect x="0" y="0" width="1600" height="26" fill="${SHC}" opacity=".18"/>`; }
/* en tydelig halvmåne: stor cirkel minus en forskudt cirkel */
function crescent(x, y, r, fill, op = 1, rot = -20){
  const k = 0.62, dx = r * 0.55;
  return `<path transform="rotate(${rot} ${x} ${y})" d="M ${x} ${y - r} A ${r} ${r} 0 1 0 ${x} ${y + r} A ${r*k*1.25} ${r} 0 1 1 ${x} ${y - r} Z" fill="${fill}" opacity="${op}"/>`;
}
const VAEG = {
  stjerner: { label:'Stjernetapet', draw: c => { let o = ''; for (let y = 50; y < 690; y += 110) for (let x = (y/110 % 2) * 80 + 40; x < 1600; x += 160) o += starP(x, y, 10, lt(c, 0.35), .55); return o; } },
  striber: { label:'Stribet tapet', draw: c => { let o = ''; for (let x = 0; x < 1600; x += 120) o += `<rect x="${x}" y="0" width="60" height="700" fill="${lt(c, 0.12)}"/>`; return o + Array.from({length: 14}, (_, i) => `<path d="M ${i*120+90} 0 V 700" stroke="${lt(c,0.3)}" stroke-width="3" stroke-dasharray="2 14"/>`).join(''); } },
  maaner: { label:'Månetapet', draw: c => { let o = ''; for (let y = 70; y < 690; y += 130) for (let x = (y/130 % 2) * 100 + 60; x < 1600; x += 200){ o += crescent(x, y, 24, lt(c, 0.55), 1) + `<circle cx="${x+70}" cy="${y+40}" r="4" fill="${lt(c,0.4)}" opacity=".6"/>`; } return o; } },
  skyer: { label:'Skytapet', draw: c => { let o = ''; const cl = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${lt(c, 0.25)}" opacity=".7"><circle cx="0" cy="0" r="30"/><circle cx="34" cy="-12" r="38"/><circle cx="74" cy="0" r="28"/><rect x="0" y="0" width="74" height="28"/></g>`;
      for (let y = 80; y < 680; y += 170) for (let x = (y/170 % 2) * 180 + 40; x < 1600; x += 360) o += cl(x, y, 1); return o; } },
  blomster: { label:'Blomstertapet', draw: c => { let o = ''; const fl = (x, y) => [0,72,144,216,288].map(a => { const px = x + 18*Math.cos(a*Math.PI/180), py = y + 18*Math.sin(a*Math.PI/180); return `<ellipse cx="${px}" cy="${py}" rx="15" ry="10" transform="rotate(${a} ${px} ${py})" fill="${lt(c,0.4)}" opacity=".75"/>`; }).join('') + `<circle cx="${x}" cy="${y}" r="8" fill="${lt(c,0.7)}"/>`;
      for (let y = 70; y < 690; y += 150) for (let x = (y/150 % 2) * 110 + 50; x < 1600; x += 220) o += fl(x, y) + `<path d="M ${x+60} ${y+60} q 18 -14 34 0 M ${x+77} ${y+53} q 4 -12 14 -14" stroke="${lt(c,0.3)}" stroke-width="4" fill="none" opacity=".6"/>`; return o; } },
};

/* ---------- vinduet: nattehimmel med måne, rammen og gardinerne skifter ---------- */
const WIN = 'M 300 440 L 300 200 C 300 130 360 100 440 100 C 520 100 580 130 580 200 L 580 440 Z';
function nightSky(d){
  return `<path d="${d}" fill="#26306E"/>` + rClip(d, `<rect x="250" y="80" width="400" height="380" fill="url(#skyG)"/>${glowAt(505, 180, 60, '#FFF1B8')}${crescent(505, 180, 30, '#FFF1B8', 1, -20)}`
    + [[340,160],[380,250],[460,140],[540,300],[360,360],[520,390],[430,320]].map(([x,y],i) => starP(x, y, i%2 ? 5 : 7, '#FFF6D0', .9)).join('')
    + `<path d="M 300 440 C 360 380 420 400 470 370 C 520 340 560 380 580 360 L 580 440 Z" fill="#1A2150" opacity=".8"/>`)
    + `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2462"/><stop offset="1" stop-color="#5A4AA8"/></linearGradient></defs>`;
}
function windowFrame(){
  const W = '#9C6B43';
  return `<path d="${WIN}" fill="none" stroke="${W}" stroke-width="18" stroke-linejoin="round"/><path d="${WIN}" fill="none" stroke="${fdk(W,0.4)}" stroke-width="3"/>`
    + `<path d="M 440 104 V 440 M 304 280 H 576" stroke="${W}" stroke-width="10"/><rect x="280" y="436" width="320" height="22" rx="6" fill="${W}" ${RS(W)}/><rect x="280" y="436" width="320" height="7" rx="3" fill="${lt(W,0.3)}"/>`;
}
/* gardin bundet op: lige yderkant, inderkanten svinger ind til båndet og ud igen forneden */
function curtain(c, side, pattern){
  const X = x => side < 0 ? x : 900 - x;
  const d = `M ${X(236)} 80 H ${X(356)} C ${X(350)} 190 ${X(330)} 300 ${X(300)} 370 C ${X(318)} 430 ${X(338)} 500 ${X(344)} 556 H ${X(236)} Z`;
  let o = `<path d="${d}" fill="${c}" ${RS(c)}/>`;
  o += rClip(d, [0,1,2].map(i => { const a = 256 + i*30, b = 248 + i*16, e = 262 + i*26; return `<path d="M ${X(a)} 80 C ${X(a-4)} 200 ${X(b+6)} 300 ${X(b)} 372 C ${X(b+4)} 440 ${X(e)} 500 ${X(e+6)} 556" stroke="${sd(c,0.35)}" stroke-width="8" fill="none" opacity=".45"/>`; }).join('')
    + `<path d="M ${X(236)} 380 L ${X(300)} 372 L ${X(344)} 556 L ${X(236)} 556 Z" fill="${SHC}" opacity=".08"/>`
    + (pattern ? [[262,130],[312,150],[270,230],[318,250],[264,320],[262,450],[300,470],[290,530]].map(([x,y]) => starP(X(x), y, 7, lt(c,0.55), .9)).join('') : ''));
  o += `<path d="M ${X(230)} 356 Q ${X(266)} 372 ${X(306)} 362 L ${X(308)} 384 Q ${X(266)} 394 ${X(230)} 380 Z" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/><circle cx="${X(298)}" cy="${373}" r="7" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/>`;
  return o;
}
function closedCurtains(c, pattern){
  const L = 'M 244 80 H 452 C 446 220 456 400 446 540 H 238 C 250 400 240 220 244 80 Z', R = 'M 656 80 H 448 C 454 220 444 400 454 540 H 662 C 650 400 660 220 656 80 Z';
  const one = (d, x0, f) => `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, [0,1,2,3].map(i => `<path d="M ${x0 + f*i*52} 80 C ${x0 + f*(i*52+10)} 240 ${x0 + f*(i*52-8)} 400 ${x0 + f*(i*52+4)} 540" stroke="${sd(c,0.35)}" stroke-width="10" fill="none" opacity=".4"/>`).join('')
    + (pattern ? Array.from({length: 16}, (_, i) => starP(x0 + f*(18 + (i%4)*50), 110 + Math.floor(i/4)*110 + (i%2)*40, 7, lt(c,0.55), .9)).join('') : ''));
  return one(L, 262, 1) + one(R, 638, -1);
}
const VINDUE = {
  gardiner: { label:'Gardiner', curtain: 1, draw: c => nightSky(WIN) + windowFrame() + `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + curtain(c, -1) + curtain(c, 1) },
  stjernegardiner: { label:'Stjernegardiner', curtain: 2, draw: c => nightSky(WIN) + windowFrame() + `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + curtain(c, -1, true) + curtain(c, 1, true)
      + `<path d="M 236 78 L 664 78 L 664 120 Q 610 150 556 120 Q 502 150 450 120 Q 398 150 344 120 Q 290 150 236 120 Z" fill="${c}" ${RS(c)}/><path d="M 236 108 Q 290 138 344 108 Q 398 138 450 108 Q 502 138 556 108 Q 610 138 664 108" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="3 6"/>` },
  rundt: { label:'Rundt vindue', draw: c => { const d = 'M 440 120 A 150 150 0 1 1 439.9 120 Z';
      return nightSky(d) + `<circle cx="440" cy="270" r="150" fill="none" stroke="${c}" stroke-width="26"/><circle cx="440" cy="270" r="163" fill="none" stroke="${rOut(c)}" stroke-width="3"/><circle cx="440" cy="270" r="137" fill="none" stroke="${rOut(c)}" stroke-width="3"/>`
        + [0,45,90,135,180,225,270,315].map(a => `<circle cx="${440 + 150*Math.cos(a*Math.PI/180)}" cy="${270 + 150*Math.sin(a*Math.PI/180)}" r="6" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`).join('')
        + `<path d="M 440 120 V 420 M 290 270 H 590" stroke="${c}" stroke-width="8"/>`; } },
  farvet: { label:'Farvet glas', draw: c => {
      const cx = 440, cy = 290, cols = [c, '#2E3F8F', fdk(c,0.25), '#7A2E5A', lt(c,0.2), '#1F6F6A', c, '#C98A1E', fdk(c,0.15), '#2E3F8F'];
      let panes = '';
      for (let i = 0; i < 10; i++){ const a0 = (i/10)*Math.PI*2 - Math.PI/2, a1 = ((i+1)/10)*Math.PI*2 - Math.PI/2, R = 400;
        panes += `<path d="M ${cx} ${cy} L ${(cx + R*Math.cos(a0)).toFixed(1)} ${(cy + R*Math.sin(a0)).toFixed(1)} L ${(cx + R*Math.cos(a1)).toFixed(1)} ${(cy + R*Math.sin(a1)).toFixed(1)} Z" fill="${cols[i]}"/>`; }
      let lead = '';
      for (let i = 0; i < 10; i++){ const a = (i/10)*Math.PI*2 - Math.PI/2; lead += `M ${(cx + 74*Math.cos(a)).toFixed(1)} ${(cy + 74*Math.sin(a)).toFixed(1)} L ${(cx + 400*Math.cos(a)).toFixed(1)} ${(cy + 400*Math.sin(a)).toFixed(1)} `; }
      const inner = panes + `<circle cx="${cx}" cy="${cy}" r="130" fill="none" stroke="#2A1E30" stroke-width="5"/>`
        + `<circle cx="${cx}" cy="${cy}" r="74" fill="#1E2462"/>` + crescent(cx - 6, cy, 46, '#FFE9A0', 1, -25) + starP(cx + 34, cy - 30, 10, '#FFF6D0') + starP(cx + 30, cy + 34, 7, '#FFF6D0')
        + `<path d="${lead}" stroke="#2A1E30" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="74" fill="none" stroke="#2A1E30" stroke-width="7"/>`
        + [[350,160],[530,170],[330,400],[550,390]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#FFE9A0" stroke="#2A1E30" stroke-width="4"/>`).join('')
        + `<path d="M 320 150 L 360 120 M 316 200 L 380 150" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".35"/>`;
      return `<path d="${WIN}" fill="#2A1E30"/>` + rClip(WIN, inner) + windowFrame().replace(/M 440 104 V 440 M 304 280 H 576/, 'M 0 0'); } },
};

/* ---------- sengen (venstre, står på gulvet) ---------- */
function blanket(c, x1, x2, y1, y2){
  const d = `M ${x1} ${y1} Q ${(x1+x2)/2} ${y1-14} ${x2} ${y1} L ${x2+8} ${y2} Q ${(x1+x2)/2} ${y2+16} ${x1-8} ${y2} Z`;
  return `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, `<path d="M ${x1} ${y1+40} H ${x2+10}" stroke="${lt(c,0.35)}" stroke-width="10" opacity=".7"/>` + [0,1,2,3].map(i => starP(x1 + 60 + i*90, y1 + 90 + (i%2)*30, 9, lt(c,0.5), .8)).join('') + `<path d="M ${x2-40} ${y1} L ${x2+10} ${y2} L ${x2+20} ${y2} L ${x2+20} ${y1} Z" fill="${sd(c,0.35)}" opacity=".5"/>`);
}
function pillow(x, y){ return `<path d="M ${x} ${y} Q ${x+60} ${y-22} ${x+120} ${y} Q ${x+128} ${y+30} ${x+120} ${y+52} Q ${x+60} ${y+64} ${x} ${y+52} Q ${x-8} ${y+26} ${x} ${y} Z" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/><path d="M ${x+20} ${y+16} Q ${x+60} ${y+6} ${x+100} ${y+16}" stroke="#E6D6C6" stroke-width="5" fill="none"/>`; }
/* sengene ses fra siden: hovedgærde til venstre, fodende til højre, madras og dyne imellem */
function bedSide(c, o){
  const F = o.frame || '#9C6B43';
  let g = '';
  g += `<rect x="100" y="652" width="424" height="92" rx="16" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/><path d="M 112 668 H 512" stroke="#EDE2D6" stroke-width="4"/>`;
  g += `<path d="M 118 652 C 112 616 136 600 176 602 C 214 604 240 614 244 636 C 246 650 240 656 232 656 Z" fill="#FFFFFF" stroke="#C9B6A6" stroke-width="3"/><path d="M 140 622 Q 180 612 222 624" stroke="#E6D6C6" stroke-width="4" fill="none"/>`;
  const d = 'M 214 650 C 300 634 420 636 528 650 L 532 760 Q 520 784 500 772 Q 470 792 440 774 Q 410 794 380 776 Q 350 794 320 776 Q 290 794 260 776 Q 236 790 214 770 Z';
  g += `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, `<path d="M 212 690 C 320 676 430 678 534 690" stroke="${lt(c,0.3)}" stroke-width="10" fill="none" opacity=".7"/>` + [[270,724],[360,708],[450,728],[500,700]].map(([x,y]) => starP(x, y, 9, lt(c,0.5), .85)).join('') + `<path d="M 214 650 C 300 634 420 636 528 650 L 530 662 C 420 650 300 648 214 664 Z" fill="${lt(c,0.25)}" opacity=".8"/>`);
  g += `<rect x="80" y="744" width="460" height="34" rx="8" fill="${F}" ${RS(F)}/><rect x="80" y="744" width="460" height="8" rx="4" fill="${lt(F,0.3)}"/>`;
  return (o.back || '') + g + (o.head || '') + (o.foot || '') + (o.legs === false ? '' : `<rect x="84" y="776" width="24" height="84" rx="6" fill="${fdk(F,0.2)}" ${RS(F,2)}/><rect x="512" y="776" width="24" height="84" rx="6" fill="${fdk(F,0.2)}" ${RS(F,2)}/>`);
}
const SENG = {
  enkel: { label:'Træseng', draw: c => { const W = '#8A5A3C';
      const post = (x, top) => `<rect x="${x}" y="${top}" width="34" height="${860-top}" rx="8" fill="${W}" ${RS(W)}/><rect x="${x+6}" y="${top+8}" width="8" height="${840-top}" rx="4" fill="${lt(W,0.25)}"/><circle cx="${x+17}" cy="${top-12}" r="17" fill="${W}" ${RS(W)}/><circle cx="${x+11}" cy="${top-17}" r="5" fill="${lt(W,0.35)}"/>`;
      return bedSide(c, { frame: W, head: post(68, 500), foot: post(518, 640), legs: false }); } },
  himmelseng: { label:'Himmelseng', draw: c => { const W = '#6A4430';
      let back = `<rect x="68" y="250" width="28" height="610" rx="8" fill="${W}" ${RS(W)}/><rect x="524" y="250" width="28" height="610" rx="8" fill="${W}" ${RS(W)}/><rect x="58" y="236" width="504" height="22" rx="8" fill="${W}" ${RS(W)}/>`;
      back += `<path d="M 96 258 C 140 380 116 520 150 640 L 96 640 Z" fill="${c}" opacity=".85" ${RS(c,2)}/><path d="M 524 258 C 480 380 504 520 470 640 L 524 640 Z" fill="${c}" opacity=".85" ${RS(c,2)}/>`;
      const val = `<path d="M 60 254 H 560 V 284 Q 518 316 476 284 Q 434 316 392 284 Q 350 316 310 284 Q 268 316 226 284 Q 184 316 142 284 Q 100 316 60 284 Z" fill="${c}" ${RS(c)}/><path d="M 60 296 Q 100 326 142 296 Q 184 326 226 296 Q 268 326 310 296 Q 350 326 392 296 Q 434 326 476 296 Q 518 326 560 296" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="3 7"/>`;
      return bedSide(c, { frame: W, back, head: `<rect x="68" y="560" width="28" height="200" fill="${W}"/>` + val + starP(82, 230, 12, '#F2C14E'), foot: `<rect x="524" y="640" width="28" height="140" fill="${W}"/>` + starP(538, 230, 12, '#F2C14E'), legs: false }); } },
  skyseng: { label:'Skyseng', draw: c => { const S = '#FFFFFF', s2 = '#C9C2E6';
      const base = 'M 70 790 C 40 790 36 744 70 738 C 64 704 112 690 140 712 C 162 682 222 682 240 712 C 266 686 324 688 336 716 C 362 690 420 694 430 722 C 462 700 520 708 524 742 C 560 744 564 790 528 794 Z';
      const head = 'M 60 760 C 30 740 40 690 70 684 C 46 650 70 600 104 610 C 90 570 120 530 150 548 C 170 530 196 556 176 590 L 176 760 Z';
      let back = `<ellipse cx="300" cy="880" rx="230" ry="16" fill="${SHC}" opacity=".18"/><path d="${head}" fill="${S}" stroke="${s2}" stroke-width="4"/><path d="M 80 700 Q 100 680 124 690" stroke="${s2}" stroke-width="4" fill="none"/>`;
      const foot = `<path d="${base}" fill="${S}" stroke="${s2}" stroke-width="4"/><path d="M 100 770 Q 300 786 500 770" stroke="${s2}" stroke-width="5" fill="none" opacity=".7"/>` + [[110,560],[480,620],[300,600]].map(([x,y]) => starP(x, y, 10, '#FFE27A')).join('');
      return bedSide(c, { frame: '#E6E0F6', back, foot, legs: false }).replace(/<rect x="80" y="744" width="460" height="34"[^>]*\/><rect x="80" y="744"[^>]*\/>/, ''); } },
  maaneseng: { label:'Måneseng', draw: c => { const G = '#E9B949', GD = '#A87A1A';
      const moonHead = `<path d="M 150 860 C 20 820 10 560 150 452 C 96 560 110 720 220 790 L 220 860 Z" fill="${G}" stroke="${GD}" stroke-width="4"/><path d="M 120 520 C 84 600 84 700 130 790" stroke="#FFF1B8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>`
        + `<path d="M 74 640 q 8 6 16 0" stroke="${GD}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="78" cy="660" r="6" fill="#FF8FA3" opacity=".6"/>` + starP(170, 430, 12, '#FFE27A') + starP(200, 470, 7, '#FFE27A');
      const foot = `<path d="M 520 860 V 690" stroke="${G}" stroke-width="22" stroke-linecap="round"/><path d="M 520 860 V 690" stroke="${GD}" stroke-width="3" fill="none"/>` + `<g transform="translate(520 666)"><polygon points="${star5pts(0,0,30,13)}" fill="${G}" stroke="${GD}" stroke-width="4"/></g>`;
      return bedSide(c, { frame: G, head: moonHead, foot, legs: false }).replace(/<rect x="80" y="744" width="460" height="34" rx="8"[^>]*\/>/, `<path d="M 150 744 H 540 V 778 H 150 Z" fill="${G}" stroke="${GD}" stroke-width="3"/>`); } },

};

/* ---------- hylden (højre væg) ---------- */
function shelfBoard(){ const W = '#9C6B43'; return `<rect x="1070" y="300" width="400" height="24" rx="6" fill="${W}" ${RS(W)}/><rect x="1070" y="300" width="400" height="8" rx="4" fill="${lt(W,0.3)}"/><path d="M 1110 324 L 1110 360 L 1140 324 M 1430 324 L 1430 360 L 1400 324" stroke="${fdk(W,0.3)}" stroke-width="8" stroke-linejoin="round" fill="none"/>`; }
const HYLDE = {
  boeger: { label:'Bøger', draw: c => { const cols = [c, '#7A2E3A', '#2E4A7A', '#C98A1E', fdk(c,0.25), '#2F6F5A', '#6A4430']; let x = 1086, o = '';
      cols.forEach((col, i) => { const w = 26 + (i*7)%14, h = 100 + (i*13)%40, top = 300 - h;
        o += `<path d="M ${x} 300 V ${top+5} Q ${x} ${top} ${x+5} ${top} H ${x+w-5} Q ${x+w} ${top} ${x+w} ${top+5} V 300 Z" fill="${col}" ${RS(col,2.5)}/>`;
        o += `<path d="M ${x+3} ${top+14} H ${x+w-3} M ${x+3} ${top+19} H ${x+w-3} M ${x+3} 282 H ${x+w-3} M ${x+3} 287 H ${x+w-3}" stroke="#E9C46A" stroke-width="2"/>`;
        o += i % 3 === 0 ? starP(x + w/2, top + h*0.45, 6, '#E9C46A') : i % 3 === 1 ? crescent(x + w/2, top + h*0.45, 7, '#E9C46A', 1, 0) : `<rect x="${x+6}" y="${top + h*0.32}" width="${w-12}" height="${h*0.22}" rx="2" fill="${lt(col,0.35)}"/>`;
        o += `<path d="M ${x+w-5} ${top+4} V 296" stroke="${SHC}" stroke-width="3" opacity=".25"/>`; x += w + 3; });
      o += `<g transform="rotate(-16 ${x+34} 300)"><rect x="${x+12}" y="186" width="30" height="114" rx="4" fill="${c}" ${RS(c,2.5)}/><path d="M ${x+15} 200 H ${x+39} M ${x+15} 284 H ${x+39}" stroke="#E9C46A" stroke-width="2"/></g>`;
      o += `<rect x="1338" y="272" width="112" height="28" rx="4" fill="#7A2E3A" ${RS('#7A2E3A',2.5)}/><rect x="1344" y="248" width="100" height="24" rx="4" fill="#2E4A7A" ${RS('#2E4A7A',2.5)}/><path d="M 1340 278 H 1448 M 1346 254 H 1442" stroke="#FFF6E0" stroke-width="3" stroke-dasharray="4 2" opacity=".7"/>`;
      o += `<rect x="1378" y="214" width="26" height="34" rx="3" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="2.5"/><path d="M 1384 214 q 0 10 -2 14 M 1398 214 q 2 7 0 18" stroke="#FFF3DC" stroke-width="5" stroke-linecap="round"/><path d="M 1391 214 q -7 -14 0 -26 q 7 12 0 26" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/>${glowAt(1391, 200, 36, '#FFE27A')}`;
      o += `<g transform="translate(1426 214)"><path d="M -12 0 H 12 L 2 16 L 12 32 H -12 L -2 16 Z" fill="#E8F6FF" fill-opacity=".6" stroke="#6A4430" stroke-width="2.5"/><path d="M -7 26 L 7 26 L 4 31 H -4 Z M -3 14 L 3 14 L 0 18 Z" fill="#E9C46A"/><rect x="-15" y="-4" width="30" height="5" rx="2" fill="#6A4430"/><rect x="-15" y="31" width="30" height="5" rx="2" fill="#6A4430"/></g>`;
      return shelfBoard() + o; } },
  eliksirer: { label:'Eliksirer', draw: c => { const B = (x, col, h, w) => { const neck = `M ${x-8} ${300-h} h 16 v 24 C ${x+w} ${300-h+40} ${x+w} 300 ${x} 300 C ${x-w} 300 ${x-w} ${300-h+40} ${x-8} ${300-h+24} Z`;
        return `<path d="${neck}" fill="#E8F6FF" fill-opacity=".5" stroke="${R_INK}" stroke-width="3"/>` + rClip(neck, `<rect x="${x-w}" y="${300-h*0.55}" width="${2*w}" height="${h}" fill="${col}" opacity=".85"/><circle cx="${x-6}" cy="${300-h*0.4}" r="4" fill="#FFF" opacity=".7"/>`) + `<rect x="${x-10}" y="${300-h-12}" width="20" height="14" rx="3" fill="#9C6B43" ${RS('#9C6B43',2)}/><path d="M ${x-w*0.6} ${300-h*0.7} q 3 -14 8 -18" stroke="#FFF" stroke-width="3" fill="none" opacity=".7"/>`; };
      return shelfBoard() + `<circle cx="1260" cy="230" r="120" fill="${c}" opacity=".12"/>` + B(1120, c, 110, 30) + B(1200, '#E0457A', 80, 26) + B(1270, '#5FD0B0', 130, 34) + B(1350, lt(c,0.3), 90, 28) + B(1420, '#FFC02E', 70, 22); } },
  krystaller: { label:'Krystaller', draw: c => {
      const bx = 1220, by = 286;
      const K = (a, h, w, col) => { const r = a*Math.PI/180, tx = bx + Math.sin(r)*h, ty = by - Math.cos(r)*h, px = Math.cos(r)*w, py = Math.sin(r)*w, mx = bx + Math.sin(r)*(h-w*1.4), my = by - Math.cos(r)*(h-w*1.4);
        return `<path d="M ${bx-px} ${by-py} L ${mx-px} ${my-py} L ${tx} ${ty} L ${mx+px} ${my+py} L ${bx+px} ${by+py} Z" fill="${col}" ${RS(col,2.5)}/><path d="M ${bx} ${by} L ${tx} ${ty} L ${mx+px} ${my+py} L ${bx+px} ${by+py} Z" fill="${sd(col,0.3)}" opacity=".45"/><path d="M ${bx - px*0.5 + Math.sin(r)*20} ${by - py*0.5 - Math.cos(r)*20} L ${mx - px*0.5} ${my - py*0.5}" stroke="#FFFFFF" stroke-width="3" opacity=".6" stroke-linecap="round"/>`; };
      let o = shelfBoard() + `<ellipse cx="${bx}" cy="200" rx="150" ry="100" fill="${c}" opacity=".14"/>`;
      o += K(-48, 90, 14, lt(c,0.2)) + K(44, 100, 15, lt(c,0.15)) + K(-22, 140, 20, c) + K(22, 126, 18, c) + K(0, 170, 24, lt(c,0.3));
      o += `<path d="M 1150 300 C 1146 276 1170 262 1196 270 C 1210 256 1240 258 1250 272 C 1276 264 1296 280 1290 300 Z" fill="#5A4E6A" stroke="#3A3046" stroke-width="3"/><path d="M 1170 290 q 10 -8 20 -2 M 1240 288 q 12 -6 22 2" stroke="#7A6E8A" stroke-width="3" fill="none"/>`;
      return o + `<rect x="1380" y="230" width="34" height="70" rx="4" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="3"/><path d="M 1397 230 q -8 -18 0 -34 q 8 16 0 34" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/>` + glowAt(1397, 212, 34, '#FFE27A'); } },
  planter: { label:'Magiske planter', draw: c => {
      const pot = (x, col) => `<path d="M ${x-26} 262 L ${x+26} 262 L ${x+20} 300 L ${x-20} 300 Z" fill="${col}" ${RS(col,2.5)}/><rect x="${x-30}" y="254" width="60" height="12" rx="4" fill="${lt(col,0.15)}" ${RS(col,2)}/>`;
      /* selvlysende svampe */
      const svampe = x => [[-14,214,20],[12,226,16],[0,196,14]].map(([dx,y,r]) => `<rect x="${x+dx-4}" y="${y}" width="8" height="${254-y}" rx="3" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="2"/>` + glowAt(x+dx, y, r*1.8, lt(c,0.4)) + `<path d="M ${x+dx-r} ${y+2} Q ${x+dx-r} ${y-r} ${x+dx} ${y-r} Q ${x+dx+r} ${y-r} ${x+dx+r} ${y+2} Z" fill="${c}" ${RS(c,2.5)}/>` + `<circle cx="${x+dx-r*0.4}" cy="${y-r*0.45}" r="${r*0.18}" fill="${lt(c,0.75)}"/><circle cx="${x+dx+r*0.35}" cy="${y-r*0.3}" r="${r*0.14}" fill="${lt(c,0.75)}"/>`).join('');
      /* stjerneblomst der lyser */
      const stjerne = x => `<path d="M ${x} 254 C ${x-6} 220 ${x+6} 196 ${x} 170" stroke="#3E7A4A" stroke-width="5" fill="none"/><path d="M ${x} 230 q -22 -6 -26 -24 q 18 2 26 24 M ${x} 214 q 20 -4 24 -22 q -18 4 -24 22" fill="#4F9A5A" stroke="#2E5A3A" stroke-width="2"/>` + glowAt(x, 160, 34, '#FFE27A') + starP(x, 160, 20, '#FFE27A') + starP(x, 160, 9, '#FFFFFF');
      /* lille snapper med et sødt ansigt */
      const snapper = x => `<path d="M ${x} 254 C ${x+4} 230 ${x-4} 214 ${x} 200" stroke="#3E7A4A" stroke-width="6" fill="none"/>`
        + `<path d="M ${x-30} 196 C ${x-30} 166 ${x+30} 166 ${x+30} 196 Z" fill="#5FB06A" stroke="#2E5A3A" stroke-width="3"/><path d="M ${x-30} 200 C ${x-30} 222 ${x+30} 222 ${x+30} 200 Z" fill="#5FB06A" stroke="#2E5A3A" stroke-width="3"/>`
        + `<path d="M ${x-26} 196 H ${x+26} V 202 H ${x-26} Z" fill="#E0457A"/>` + [-20,-10,0,10,20].map(dx => `<path d="M ${x+dx-4} 196 L ${x+dx} 203 L ${x+dx+4} 196 Z" fill="#FFFFFF" stroke="#2E5A3A" stroke-width="1"/>`).join('')
        + `<circle cx="${x-10}" cy="182" r="4" fill="#2A1E30"/><circle cx="${x+10}" cy="182" r="4" fill="#2A1E30"/><circle cx="${x-11}" cy="181" r="1.4" fill="#FFF"/><circle cx="${x+9}" cy="181" r="1.4" fill="#FFF"/>`;
      /* måneblade */
      const maaneblad = x => `<path d="M ${x} 254 V 196" stroke="#3E7A4A" stroke-width="4"/>` + [[-16,226,-50],[16,214,40],[-12,196,-30],[10,186,20]].map(([dx,y,rot]) => glowAt(x+dx, y, 16, '#CFE6FF') + crescent(x+dx, y, 13, '#DDF0FF', 1, rot)).join('');
      return shelfBoard() + pot(1130, '#6A4E8A') + svampe(1130) + pot(1240, '#7A4A3A') + stjerne(1240) + pot(1340, '#3E5A6A') + snapper(1340) + pot(1430, '#5A4A6A') + maaneblad(1430); } },

};

/* ---------- lampen (hænger fra loftet / svæver) ---------- */
const glowAt = (x, y, r, c) => { const id = 'gl' + (CLIPN++); return `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".45" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><circle class="glow" cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`; };
const LAMPE = {
  lys: { label:'Svævende lys', draw: c => [[790,180,70,3.4],[890,130,90,4.1],[990,200,60,3.7]].map(([x,y,h,d]) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -9;0 0" dur="${d}s" repeatCount="indefinite"/>` + glowAt(x, y-8, 60, '#FFE27A')
      + `<rect x="${x-14}" y="${y}" width="28" height="${h}" rx="5" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="3"/><path d="M ${x-14} ${y+8} q 7 6 14 0 q 7 -6 14 0 M ${x-8} ${y+6} v 16" stroke="#E6D6C6" stroke-width="3" fill="none"/>`
      + `<path d="M ${x} ${y} q -12 -18 0 -40 q 12 22 0 40" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/><path d="M ${x} ${y-4} q -5 -10 0 -20 q 5 10 0 20" fill="#FFF6D0"><animate attributeName="opacity" values="1;.45;1;.8;1" dur="${(d/3).toFixed(2)}s" repeatCount="indefinite"/></path>`
      + `<ellipse cx="${x}" cy="${y+h+4}" rx="22" ry="7" fill="${c}" ${RS(c,2)}/></g>`).join('') },
  stjernelampe: { label:'Stjernelysekrone', draw: c => { const I = '#3A3046', x = 890, y = 200;
      let o = `<path d="M ${x} 0 V 60 M ${x} 60 L ${x-110} ${y} M ${x} 60 L ${x+110} ${y} M ${x} 60 L ${x} ${y-24}" stroke="${I}" stroke-width="4"/>` + glowAt(x, y - 20, 170, '#FFE27A');
      o += `<ellipse cx="${x}" cy="${y}" rx="124" ry="30" fill="none" stroke="${I}" stroke-width="10"/><ellipse cx="${x}" cy="${y}" rx="124" ry="30" fill="none" stroke="#6A5E7A" stroke-width="3"/>`;
      o += [[-1,0.4],[1,0.4],[-0.55,-0.85],[0.55,-0.85],[0,1]].map(([u,v]) => { const cx = x + u*124*Math.sqrt(1 - Math.min(1, v*v)*0) * (Math.abs(u) === 1 ? 0.98 : 1), cy = y + v*30;
        return `<rect x="${cx-9}" y="${cy-44}" width="18" height="44" rx="4" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="2.5"/><path d="M ${cx} ${cy-44} q -8 -14 0 -28 q 8 14 0 28" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/><ellipse cx="${cx}" cy="${cy}" rx="14" ry="5" fill="${I}"/>`; }).join('');
      o += [[-80,270,16],[-30,300,12],[0,330,22],[40,296,13],[86,268,15]].map(([dx,yy,r]) => `<path d="M ${x+dx} ${y + 20} V ${yy - r}" stroke="#C9B6A6" stroke-width="1.5"/>` + glowAt(x+dx, yy, r*1.8, lt(c,0.4)) + `<g transform="translate(${x+dx} ${yy})"><polygon points="${star5pts(0,0,r,r*0.45)}" fill="${c}" ${RS(c,2)}/></g>`).join('');
      return o; } },
  maanelampe: { label:'Månelampe', draw: c => { const x = 890, y = 210, M = mixC('#FFF1B8', c, 0.18);
      let o = `<ellipse cx="${x+10}" cy="0" rx="26" ry="9" fill="#5A3A28" stroke="#3A2618" stroke-width="3"/><circle cx="${x+10}" cy="10" r="6" fill="none" stroke="#3A3046" stroke-width="4"/>` + Array.from({ length: 7 }, (_, i) => `<ellipse cx="${x+10}" cy="${22 + i*11}" rx="${i % 2 ? 3 : 5}" ry="7" fill="none" stroke="#3A3046" stroke-width="3"/>`).join('') + glowAt(x, y, 150, lt(c,0.5));
      o += `<path d="M ${x+10} 96 C ${x-90} 100 ${x-120} 260 ${x+4} 316 C ${x-50} 270 ${x-46} 150 ${x+10} 96 Z" fill="${M}" stroke="${fdk(M,0.35)}" stroke-width="4"/>`;
      o += `<path d="M ${x-36} 170 q -14 50 6 96" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/>`;
      o += `<path d="M ${x-44} 196 q 8 8 16 0" stroke="${fdk(M,0.5)}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="${x-50}" cy="214" r="7" fill="#FF8FA3" opacity=".55"/><path d="M ${x-40} 232 q 6 6 12 0" stroke="${fdk(M,0.5)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      o += `<path d="M ${x+4} 316 V 352" stroke="#C9B6A6" stroke-width="1.5"/><g transform="translate(${x+4} 362)"><polygon points="${star5pts(0,0,14,6)}" fill="${c}" ${RS(c,2)}/></g>` + starP(x + 50, 150, 9, lt(c,0.6)) + starP(x + 60, 250, 6, lt(c,0.6));
      return o; } },
  lyskaede: { label:'Lyskæde', draw: c => { const cols = [c, '#FFC02E', '#E0457A', '#5FD0B0', '#43A3D3']; let o = `<path d="M 0 40 Q 200 140 400 50 Q 600 150 800 50 Q 1000 150 1200 50 Q 1400 150 1600 40" stroke="#3A5A3A" stroke-width="4" fill="none"/>`;
      for (let i = 0; i < 32; i++){ const t = i / 31, x = t * 1600, seg = Math.floor(t * 8), lt0 = t*8 - seg, y = 45 + Math.sin(lt0 * Math.PI) * 48; const col = cols[i % cols.length]; o += glowAt(x, y + 16, 22, col) + `<ellipse cx="${x}" cy="${y+16}" rx="9" ry="13" fill="${col}" ${RS(col,2)}/><rect x="${x-5}" y="${y}" width="10" height="7" fill="#3A5A3A"/>`; }
      return o; } },
};

/* ---------- tæppet (midt på gulvet) ---------- */
const GULV = {
  rund: { label:'Rundt tæppe', draw: c => `<ellipse cx="820" cy="900" rx="330" ry="76" fill="${c}" ${RS(c)}/><ellipse cx="820" cy="900" rx="290" ry="58" fill="none" stroke="${lt(c,0.4)}" stroke-width="8"/><ellipse cx="820" cy="900" rx="250" ry="44" fill="none" stroke="#F2C14E" stroke-width="3" stroke-dasharray="4 10"/>` },
  stjerne: { label:'Stjernetæppe', draw: c => { const p = []; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i % 2 ? 130 : 330; p.push(`${(820 + r*Math.cos(a)).toFixed(1)},${(900 + r*Math.sin(a)*0.25).toFixed(1)}`); }
      return `<polygon points="${p.join(' ')}" fill="${c}" ${RS(c)}/><ellipse cx="820" cy="900" rx="90" ry="22" fill="${lt(c,0.4)}"/>`; } },
  stribet: { label:'Stribet tæppe', draw: c => { const d = 'M 520 850 L 1120 850 L 1150 960 L 490 960 Z';
      return `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, [0,1,2,3,4].map(i => `<rect x="480" y="${860 + i*22}" width="700" height="10" fill="${i%2 ? '#F2C14E' : lt(c,0.4)}"/>`).join(''))
        + Array.from({length: 14}, (_, i) => `<path d="M ${495 + i*50} 960 v 14 M ${520 + i*45} 850 v -10" stroke="${lt(c,0.3)}" stroke-width="4"/>`).join(''); } },
  sky: { label:'Skytæppe', draw: c => { const d = 'M 560 940 C 470 940 470 860 560 856 C 560 800 660 790 690 830 C 720 780 830 780 850 826 C 890 786 990 792 1000 838 C 1060 810 1150 836 1140 880 C 1200 890 1190 950 1110 950 Z';
      const T = 'translate(820 900) scale(1 0.42) translate(-820 -900)';
      return `<g transform="translate(0 12)"><path transform="${T}" d="${d}" fill="${sd(c,0.25)}" stroke="${fdk(c,0.2)}" stroke-width="6"/></g><path transform="${T}" d="${d}" fill="${lt(c,0.45)}" stroke="${lt(c,0.1)}" stroke-width="6"/>`
        + `<path transform="${T}" d="M 620 900 Q 820 860 1060 896 M 700 850 Q 760 830 820 846" stroke="${lt(c,0.25)}" stroke-width="10" fill="none" opacity=".7"/>`; } },

};

/* ---------- en ting på gulvet (højre) ---------- */
const TING = {
  kedel: { label:'Heksekedel', draw: c => { const K = '#3A3346';
      let o = `<path d="M 1330 900 L 1316 940 M 1480 900 L 1494 940 M 1405 910 L 1405 950" stroke="${K}" stroke-width="12" stroke-linecap="round"/>`;
      o += `<path d="M 1300 780 C 1290 880 1340 920 1405 920 C 1470 920 1520 880 1510 780 Z" fill="${K}" stroke="#1E1A26" stroke-width="4"/><path d="M 1330 800 C 1326 860 1350 890 1380 900" stroke="#6A6280" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>`;
      o += `<ellipse cx="1405" cy="780" rx="112" ry="26" fill="${c}" stroke="#1E1A26" stroke-width="4"/><ellipse cx="1405" cy="776" rx="90" ry="16" fill="${lt(c,0.35)}"/>`;
      o += `<rect x="1290" y="770" width="230" height="16" rx="8" fill="#4A4258" stroke="#1E1A26" stroke-width="3"/>`;
      return o + [[1370,740,16],[1430,720,11],[1400,690,8],[1450,760,7]].map(([x,y,r],i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${lt(c,0.4)}" stroke="${c}" stroke-width="2" opacity=".85"/><circle cx="${x-r*0.35}" cy="${y-r*0.35}" r="${r*0.25}" fill="#FFF"/>`).join(''); } },
  kost: { label:'Svævende kost', draw: c => { const W = '#7A4E35';
      let o = `<ellipse cx="1420" cy="930" rx="120" ry="14" fill="${SHC}" opacity=".22"><animate attributeName="rx" values="120;100;120" dur="3.2s" repeatCount="indefinite"/></ellipse>`;
      o += `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -18;0 0" dur="3.2s" repeatCount="indefinite"/><g transform="rotate(-8 1420 740)">`;
      o += `<path d="M 1280 742 L 1468 742" stroke="${W}" stroke-width="16" stroke-linecap="round"/><path d="M 1286 738 L 1462 738" stroke="${lt(W,0.3)}" stroke-width="4" stroke-linecap="round"/><path d="M 1290 742 q -10 -10 -4 -22" stroke="${W}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      o += `<path d="M 1460 726 C 1500 712 1550 700 1580 690 C 1574 730 1574 756 1580 794 C 1550 784 1500 772 1460 758 Z" fill="#D9A84A" stroke="#8A6420" stroke-width="3"/>` + [706, 722, 740, 758, 776].map(y => `<path d="M 1468 ${742 + (y-742)*0.3} Q 1520 ${742 + (y-742)*0.7} 1578 ${y}" stroke="#B8862E" stroke-width="2.5" fill="none"/>`).join('');
      o += `<path d="M 1452 724 Q 1466 742 1452 760 L 1470 762 Q 1482 742 1470 722 Z" fill="${c}" ${RS(c,2)}/></g></g>`;
      return o + [[1340,820,9],[1400,850,7],[1470,830,10],[1520,860,6]].map(([x,y,r],i) => `<g opacity=".9"><animate attributeName="opacity" values="0;1;0" dur="${2 + i*0.4}s" begin="${i*0.5}s" repeatCount="indefinite"/>${star4(x, y, r, '#FFE9A0')}</g>`).join(''); } },
  plante: { label:'Måneplante', draw: c => { let o = `<path d="M 1350 820 L 1470 820 L 1455 940 L 1365 940 Z" fill="#6A4E8A" ${RS('#6A4E8A')}/><rect x="1340" y="806" width="140" height="24" rx="8" fill="#7A5E9A" ${RS('#6A4E8A')}/>` + starP(1410, 880, 12, '#E9C46A');
      const tips = [[-70,-190],[-22,-250],[34,-226],[80,-170],[-84,-120],[92,-104]];
      o += tips.map(([dx,dy]) => `<path d="M 1410 810 Q ${1410+dx*0.3} ${810+dy*0.55} ${1410+dx} ${810+dy}" stroke="#3E7A4A" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M ${1410+dx*0.55} ${810+dy*0.6} q ${dx>0?24:-24} -10 ${dx>0?30:-30} -34 q ${dx>0?-20:20} 4 ${dx>0?-30:30} 34" fill="#4F9A5A" stroke="#2E5A3A" stroke-width="2.5"/>`).join('');
      return o + tips.slice(0,4).map(([dx,dy],i) => glowAt(1410+dx, 810+dy-14, 40, c) + crescent(1410+dx, 810+dy-14, 24, mixC('#FFF1B8', c, 0.2), 1, [-30,-15,15,30][i]) ).join(''); } },
  globus: { label:'Stjerneglobus', draw: c => {
      /* gulvglobus som en rigtig: den vandrette træring sidder ved ækvator, messingringen (meridianen) står lodret i billedplanet
         og går gennem træringen i hver side, hvor den sidder i et beslag; forneden hviler den på en midterstang ned til foden */
      const W = '#5A3A26', WL = '#7A5236', B = '#C9952E', BD = '#8A6420', P = mixC('#D9B77A', c, 0.25), gx = 1415, gy = 690, r = 88, ry = 22, baseY = 922;
      const H = r + 18;   /* træringens halve bredde = meridianens radius, så de mødes i siderne */
      const leg = (x, top, bot, w, col) => `<path d="M ${x-w} ${top} Q ${x-w*1.7} ${(top+bot)/2 - 30} ${x-w*1.1} ${(top+bot)/2} Q ${x-w*2} ${(top+bot)/2 + 30} ${x-w} ${bot} L ${x+w} ${bot} Q ${x+w*2} ${(top+bot)/2 + 30} ${x+w*1.1} ${(top+bot)/2} Q ${x+w*1.7} ${(top+bot)/2 - 30} ${x+w} ${top} Z" fill="${col}" stroke="${W}" stroke-width="3"/><ellipse cx="${x}" cy="${(top+bot)/2}" rx="${w*1.9}" ry="5" fill="${W}"/>`;
      let o = `<ellipse cx="${gx}" cy="${baseY + 22}" rx="140" ry="16" fill="${SHC}" opacity=".22"/>`;
      o += `<path d="M ${gx-120} ${baseY} A 120 ${ry} 0 0 0 ${gx+120} ${baseY} V ${baseY+12} A 120 ${ry} 0 0 1 ${gx-120} ${baseY+12} Z" fill="${W}"/>`;
      o += `<ellipse cx="${gx}" cy="${baseY}" rx="120" ry="${ry}" fill="${WL}" stroke="${W}" stroke-width="3"/><ellipse cx="${gx}" cy="${baseY}" rx="96" ry="${ry*0.78}" fill="none" stroke="${W}" stroke-width="2" opacity=".5"/>`;
      /* midterstangen fra fod op til meridianens bund, og bageste ben */
      o += leg(gx, gy + H + 6, baseY - 4, 9, WL);
      /* bageste halvdel af træringen */
      o += `<path d="M ${gx-H} ${gy} A ${H} ${ry} 0 0 1 ${gx+H} ${gy}" fill="none" stroke="${fdk(WL,0.2)}" stroke-width="16"/>`;
      /* globussen */
      o += `<circle cx="${gx}" cy="${gy}" r="${r}" fill="${P}" stroke="#6A4A2A" stroke-width="4"/>` + rClip(`M ${gx} ${gy-r} A ${r} ${r} 0 1 1 ${gx-0.1} ${gy-r} Z`,
        `<ellipse cx="${gx}" cy="${gy}" rx="${r*0.45}" ry="${r}" fill="none" stroke="#8A6A3A" stroke-width="2" opacity=".6"/><path d="M ${gx-r} ${gy-40} H ${gx+r} M ${gx-r} ${gy+40} H ${gx+r}" stroke="#8A6A3A" stroke-width="2" opacity=".5"/>`
        + `<path d="M 1362 642 L 1392 660 L 1420 632 L 1450 652 M 1380 712 L 1414 732 L 1446 708 L 1468 736" stroke="#5A3A1A" stroke-width="2.5" fill="none"/>` + [[1362,642],[1392,660],[1420,632],[1450,652],[1380,712],[1414,732],[1446,708],[1468,736]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#3A2410"/>`).join('')
        + `<path d="M ${gx+40} ${gy-r} A ${r} ${r} 0 0 1 ${gx+40} ${gy+r} L ${gx+r+10} ${gy+r} L ${gx+r+10} ${gy-r} Z" fill="${SHC}" opacity=".25"/><path d="M 1354 642 Q 1342 672 1348 702" stroke="#FFF6E0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5"/>`);
      /* aksen: små tappe fra globussen ud til meridianen foroven og forneden */
      o += `<path d="M ${gx} ${gy-r} V ${gy-H} M ${gx} ${gy+r} V ${gy+H}" stroke="${BD}" stroke-width="5"/>`;
      /* meridianen: en hel messingring */
      o += `<circle cx="${gx}" cy="${gy}" r="${H}" fill="none" stroke="${BD}" stroke-width="12"/><circle cx="${gx}" cy="${gy}" r="${H}" fill="none" stroke="${B}" stroke-width="8"/>`;
      o += `<path d="M ${gx-H*0.7} ${gy-H*0.7} A ${H} ${H} 0 0 1 ${gx-H*0.2} ${gy-H*0.98}" stroke="#F2D27A" stroke-width="3" fill="none" opacity=".85"/>`;
      o += `<circle cx="${gx}" cy="${gy-H-6}" r="7" fill="${B}" stroke="${BD}" stroke-width="2"/><circle cx="${gx}" cy="${gy+H+4}" r="7" fill="${B}" stroke="${BD}" stroke-width="2"/>`;
      /* forreste ben og forreste halvdel af træringen */
      o += leg(gx - 74, gy + 16, baseY + 8, 8, WL) + leg(gx + 74, gy + 16, baseY + 8, 8, WL);
      o += `<path d="M ${gx-H} ${gy} A ${H} ${ry} 0 0 0 ${gx+H} ${gy}" fill="none" stroke="${WL}" stroke-width="16"/><path d="M ${gx-H} ${gy} A ${H} ${ry} 0 0 0 ${gx+H} ${gy}" fill="none" stroke="#E9D4A8" stroke-width="4" stroke-dasharray="2 10"/>`;
      /* beslagene i hver side, hvor meridianen går gennem træringen */
      o += [-1, 1].map(k => `<rect x="${gx + k*H - 11}" y="${gy - 13}" width="22" height="26" rx="5" fill="${B}" stroke="${BD}" stroke-width="2.5"/><circle cx="${gx + k*H}" cy="${gy}" r="4" fill="${BD}"/>`).join('');
      return o; } },
};

/* ---------- dyrets seng (foran til højre for figuren) ---------- */
function kurvFront(){
  const K = '#B88A4E', body = 'M 1078 868 A 112 28 0 0 0 1302 868 C 1300 920 1260 948 1190 948 C 1120 948 1080 920 1078 868 Z';
  return `<path d="${body}" fill="${K}" ${RS(K)}/>` + rClip(body, Array.from({ length: 12 }, (_, i) => `<path d="M ${1086 + i*19} 870 Q ${1084 + i*19 + (i-6)*2} 912 ${1090 + i*18 + (i-6)*3} 950" stroke="${fdk(K,0.22)}" stroke-width="3" fill="none" opacity=".6"/>`).join('')
    + [0,1,2].map(i => `<path d="M 1078 ${886 + i*20} Q 1190 ${922 + i*16} 1302 ${886 + i*20}" stroke="${fdk(K,0.22)}" stroke-width="3" fill="none" opacity=".5"/>`).join(''))
    + `<path d="M 1078 868 A 112 28 0 0 0 1302 868" fill="none" stroke="${lt(K,0.15)}" stroke-width="14" stroke-linecap="round"/><path d="M 1078 868 A 112 28 0 0 0 1302 868" fill="none" stroke="${fdk(K,0.3)}" stroke-width="2.5" stroke-dasharray="6 6"/>`;
}
const DYRESENG = {
  kurv: { label:'Kurv', front: c => kurvFront(), draw: c => { const K = '#B88A4E';
      let o = `<ellipse cx="1190" cy="868" rx="112" ry="28" fill="${fdk(K,0.35)}"/><path d="M 1078 868 A 112 28 0 0 1 1302 868" fill="none" stroke="${K}" stroke-width="14"/>`;
      o += `<ellipse cx="1190" cy="874" rx="96" ry="20" fill="${c}" ${RS(c)}/><ellipse cx="1186" cy="870" rx="70" ry="12" fill="${lt(c,0.3)}"/>`;
      return o + kurvFront(); } },
  pude: { label:'Stor pude', draw: c => `<ellipse cx="1170" cy="912" rx="130" ry="40" fill="${sd(c,0.3)}" ${RS(c)}/><path d="M 1040 890 C 1040 850 1300 850 1300 890 L 1300 912 C 1300 950 1040 950 1040 912 Z" fill="${c}" ${RS(c)}/><ellipse cx="1170" cy="880" rx="118" ry="30" fill="${lt(c,0.25)}"/><ellipse cx="1170" cy="880" rx="82" ry="18" fill="${lt(c,0.4)}"/>`
      + [[1060,912],[1280,912],[1170,946]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`).join('') + starP(1170, 880, 14, lt(c,0.7)) },
  slot: { label:'Lille slot', draw: c => { const S = lt(c,0.18), R = '#E0457A';
      const tower = (x) => `<path d="M ${x-28} 950 V 770 Q ${x-28} 756 ${x-14} 756 H ${x+14} Q ${x+28} 756 ${x+28} 770 V 950 Z" fill="${c}" ${RS(c)}/><path d="M ${x-38} 762 Q ${x} 676 ${x+38} 762 Z" fill="${R}" ${RS(R)}/><circle cx="${x}" cy="690" r="6" fill="#F2C14E" stroke="#B98516" stroke-width="2"/><path d="M ${x-8} 800 q 8 -14 16 0 v 16 h -16 Z" fill="#3A2340"/>`;
      let o = `<path d="M 1106 950 V 810 Q 1106 792 1124 792 H 1256 Q 1274 792 1274 810 V 950 Z" fill="${S}" ${RS(c)}/>`;
      o += [1124,1160,1196,1232].map(x => `<rect x="${x}" y="772" width="24" height="26" rx="8" fill="${S}" ${RS(c,2.5)}/>`).join('');
      o += tower(1096) + tower(1284);
      o += `<path d="M 1132 950 V 870 Q 1132 818 1190 818 Q 1248 818 1248 870 V 950 Z" fill="#3A2340" ${RS(c)}/><path d="M 1141 950 V 872 Q 1141 828 1190 828 Q 1239 828 1239 872 V 950" fill="none" stroke="${lt(c,0.35)}" stroke-width="5"/><ellipse cx="1190" cy="940" rx="50" ry="10" fill="${c}" opacity=".9"/>`;
      o += `<path d="M 1096 690 V 664 l 22 8 l -22 8" fill="${R}" stroke="#8A1A4A" stroke-width="2"/><path d="M 1284 690 V 664 l 22 8 l -22 8" fill="${R}" stroke="#8A1A4A" stroke-width="2"/>`;
      return o + `<g transform="translate(1190 790)"><polygon points="${star5pts(0,0,13,6)}" fill="#F2C14E" stroke="#B98516" stroke-width="2"/></g>`; } },

};

const ROOM_SLOTS = [
  { id:'vaeg', label:'Væggen', cat: VAEG, hot:[110, 130] },
  { id:'vindue', label:'Vinduet', cat: VINDUE, hot:[440, 470] },
  { id:'seng', label:'Sengen', cat: SENG, hot:[300, 720] },
  { id:'hylde', label:'Hylden', cat: HYLDE, hot:[1270, 340] },
  { id:'lampe', label:'Lampen', cat: LAMPE, hot:[890, 300] },
  { id:'gulv', label:'Tæppet', cat: GULV, hot:[560, 930] },
  { id:'ting', label:'Hjørnet', cat: TING, hot:[1410, 640] },
  { id:'dyreseng', label:'Dyrets seng', cat: DYRESENG, hot:[1160, 950] },
];
const ROOM_FREE = { vaeg:['stjerner','striber'], vindue:['gardiner'], seng:['enkel'], hylde:['boeger'], lampe:['lys'], gulv:['rund'], ting:['kedel'], dyreseng:['kurv'] };
const ROOM_DEFAULT = { vaeg:'stjerner', vindue:'gardiner', seng:'enkel', hylde:'boeger', lampe:'lys', gulv:'rund', ting:'kedel', dyreseng:'kurv',
  c:{ vaeg:'#35306A', vindue:'#E0457A', seng:'#7B4FD0', hylde:'#7B4FD0', lampe:'#FFC02E', gulv:'#7A2E4A', ting:'#5FD0B0', dyreseng:'#E07A45' } };
/* udsnit til små billeder af én ting */
const ROOM_VB = { vaeg:'0 0 1600 700', vindue:'200 50 500 520', seng:'30 220 560 660', hylde:'1050 50 440 340', lampe:'680 0 440 380', gulv:'460 780 720 220', ting:'1240 440 360 530', dyreseng:'1000 640 340 330' };
const ROOM_WALL_COLORS = ['#35306A','#24305E','#4E2E6A','#1F4F56','#6A2E4E','#2E5A44','#7A5E36','#3E3448','#4A4590','#2F6F78'];

function roomFloor(){
  const F = '#B98A5E';
  let o = `<rect x="0" y="700" width="1600" height="300" fill="${F}"/>`;
  for (let i = 0; i < 9; i++){ const y = 700 + i*i*4 + i*8; o += `<path d="M 0 ${y} H 1600" stroke="${fdk(F,0.15)}" stroke-width="2" opacity=".5"/>`; }
  for (let i = -8; i <= 8; i++) o += `<path d="M ${800 + i*90} 700 L ${800 + i*230} 1000" stroke="${fdk(F,0.15)}" stroke-width="2" opacity=".35"/>`;
  o += `<rect x="0" y="690" width="1600" height="22" fill="#7A5236"/><rect x="0" y="690" width="1600" height="6" fill="#9C6B43"/>`;
  return o + `<rect x="0" y="712" width="1600" height="60" fill="${SHC}" opacity=".12"/>`;
}
function roomItem(slot, room){
  const s = ROOM_SLOTS.find(x => x.id === slot), id = room[slot], it = s.cat[id] || s.cat[ROOM_DEFAULT[slot]];
  return it.draw(room.c[slot] || ROOM_DEFAULT.c[slot]);
}
function roomSvg(room, opts = {}){
  CLIPN = 0;
  const vb = opts.viewBox || '0 0 1600 1000';
  if (opts.only){
    const wall = '';
    const inner = opts.only === 'vaeg' ? wallBase(room.c.vaeg) + roomItem('vaeg', room) + wallTop() : roomItem(opts.only, room);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${wall}${inner}</svg>`;
  }
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">`;
  o += wallBase(room.c.vaeg) + roomItem('vaeg', room) + wallTop() + roomFloor();
  o += roomItem('vindue', room) + roomItem('hylde', room) + roomItem('gulv', room) + roomItem('seng', room) + roomItem('ting', room) + `<g transform="translate(${BED_DX} 0)">${roomItem('dyreseng', room)}</g>` + roomItem('lampe', room);
  return o + `<rect x="0" y="0" width="1600" height="1000" fill="${SHC}" opacity=".06"/></svg>`;
}

/* ---------- låse for værelset ---------- */
const roomKey = (slot, id) => 'rum:' + slot + '.' + id;
/* værelsets kladder (nye ting, der venter på godkendelse) er ikke med i spillet */
const roomIds = s => Object.keys(s.cat).filter(id => !isKladde('rum', s.id + '.' + id));
const roomFree = (slot, id) => (ROOM_FREE[slot] || []).includes(id) || prog.unlocked.includes(roomKey(slot, id));
function roomLocked(){ const out = []; for (const s of ROOM_SLOTS) for (const id of roomIds(s)) if (!roomFree(s.id, id)) out.push(['rum', s.id + '.' + id]); return out; }
function getRoom(){
  const r = Object.assign({}, ROOM_DEFAULT, prog.room || {}); r.c = Object.assign({}, ROOM_DEFAULT.c, (prog.room || {}).c || {});
  for (const s of ROOM_SLOTS) if (!s.cat[r[s.id]] || !roomFree(s.id, r[s.id])) r[s.id] = ROOM_DEFAULT[s.id];
  return r;
}
function setRoom(r){ prog.room = r; saveProg(); }

/* ================= Værelset som sted: hele skærmen, ting man kan trykke på, og indretningsbogen ================= */
/* hvor dyret står: ved siden af figuren, eller i sin seng (fødder i rumkoordinater) */
const BED_DX = -80;
const PET_SPOT = { x: 590, y: 962 };
const PET_BED = { kurv: { x: 1110, y: 888 }, pude: { x: 1110, y: 885 }, slot: { x: 1110, y: 942 } };
/* ================= Nye ting til værelset (v0.25.40) — samme pladser og mål som ovenfor ================= */
Object.assign(VAEG, {
  prikker: { label:'Prikket tapet', draw: c => { let o = ''; for (let y = 40; y < 700; y += 70) for (let x = (y/70 % 2) * 45 + 20; x < 1600; x += 90) o += `<circle cx="${x}" cy="${y}" r="9" fill="${lt(c,0.3)}" opacity=".6"/>`; return o; } },
  hjerter: { label:'Hjertetapet', draw: c => { let o = ''; for (let y = 60; y < 690; y += 120) for (let x = (y/120 % 2) * 90 + 50; x < 1600; x += 180) o += heart(x, y, 2.2, lt(c,0.38), 'none', 0, 'opacity=".6"'); return o; } },
  rombe: { label:'Harlekintapet', draw: c => { let o = '';
      for (let y = 0; y < 760; y += 120) for (let x = (y/120 % 2) * 60; x < 1660; x += 120) o += `<path d="M ${x} ${y-60} L ${x+60} ${y} L ${x} ${y+60} L ${x-60} ${y} Z" fill="${(x/60 + y/120) % 2 ? lt(c,0.12) : c}"/>`;
      for (let x = -700; x < 1700; x += 60) o += `<path d="M ${x} 0 L ${x+700} 700 M ${x+700} 0 L ${x} 700" stroke="${lt(c,0.35)}" stroke-width="2" stroke-dasharray="3 9" opacity=".7"/>`;
      return o; } },
  panel: { label:'Træpanel', draw: c => { const W = '#7A5236', WD = fdk(W,0.25); let o = '';
      for (let y = 40; y < 380; y += 100) for (let x = (y/100 % 2) * 70 + 30; x < 1600; x += 140) o += `<path d="M ${x} ${y} q 10 -14 20 0 q -10 14 -20 0 Z M ${x+10} ${y-18} v 36" stroke="${lt(c,0.3)}" stroke-width="3" fill="none" opacity=".45"/>`;
      o += `<rect x="0" y="420" width="1600" height="280" fill="${W}"/><rect x="0" y="406" width="1600" height="20" rx="4" fill="${lt(W,0.15)}" stroke="${WD}" stroke-width="3"/>`;
      for (let x = 20; x < 1600; x += 160) o += `<rect x="${x}" y="450" width="130" height="220" rx="6" fill="${fdk(W,0.08)}" stroke="${WD}" stroke-width="4"/><rect x="${x+12}" y="462" width="106" height="196" rx="4" fill="none" stroke="${lt(W,0.2)}" stroke-width="2"/>`;
      return o; } },
  mursten: { label:'Stenmur', draw: c => { let o = '';
      for (let r = 0; r < 10; r++){ const y = r * 70, off = r % 2 ? 70 : 0;
        for (let x = -off; x < 1600; x += 140){ const k = Math.abs((x / 140 | 0) * 7 + r * 13) % 7;
          o += `<rect x="${x + 4}" y="${y + 4}" width="132" height="62" rx="10" fill="${k === 0 ? lt(c,0.1) : k === 1 ? fdk(c,0.08) : c}" stroke="${fdk(c,0.3)}" stroke-width="4"/>`; } }
      return o; } },
});

Object.assign(VINDUE, {
  blonder: { label:'Blondegardiner', curtain: 1, draw: c => { const L = lt(c,0.75);
      const one = side => { let o = curtain(L, side); const X = x => side < 0 ? x : 900 - x;
        o += [[262,120],[300,160],[270,210],[312,250],[266,300],[264,440],[300,480],[288,520]].map(([x,y]) => `<circle cx="${X(x)}" cy="${y}" r="9" fill="none" stroke="${lt(c,0.35)}" stroke-width="2.5"/><circle cx="${X(x)}" cy="${y}" r="3" fill="${lt(c,0.35)}"/>`).join('');
        return o; };
      return nightSky(WIN) + windowFrame() + `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + one(-1) + one(1)
        + `<path d="M 236 78 L 664 78 L 664 104 ${Array.from({ length: 12 }, (_, i) => `Q ${664 - i*35.7 - 18} 126 ${664 - (i+1)*35.7} 104`).join(' ')} Z" fill="${L}" stroke="${lt(c,0.35)}" stroke-width="2.5"/>`; } },
  rullegardin: { label:'Rullegardin', draw: c => nightSky(WIN) + windowFrame()
      + `<path d="M 300 104 H 580 V 250 Q 440 262 300 250 Z" fill="${c}" ${RS(c)}/>` + rClip('M 300 104 H 580 V 250 Q 440 262 300 250 Z', [130, 170, 210].map(y => `<path d="M 300 ${y} H 580" stroke="${lt(c,0.3)}" stroke-width="5" opacity=".6"/>`).join('') + starP(440, 180, 18, lt(c,0.6)))
      + `<rect x="288" y="86" width="304" height="26" rx="13" fill="#7A5236" ${RS('#7A5236')}/><path d="M 440 256 V 300" stroke="#C9B6A6" stroke-width="3"/><circle cx="440" cy="310" r="11" fill="none" stroke="#F2C14E" stroke-width="5"/>` },
  skodder: { label:'Skodder', draw: c => { const sh = side => { const X = x => side < 0 ? x : 880 - x, d = `M ${X(206)} 110 H ${X(294)} V 446 H ${X(206)} Z`;
        return `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, [150, 200, 250, 300, 350, 400].map(y => `<path d="M ${X(210)} ${y} H ${X(290)}" stroke="${fdk(c,0.25)}" stroke-width="7"/><path d="M ${X(210)} ${y-4} H ${X(290)}" stroke="${lt(c,0.25)}" stroke-width="2"/>`).join(''))
          + crescent(X(250), 132, 12, '#26306E', 1, side < 0 ? -20 : 200) + [176, 400].map(y => `<rect x="${side < 0 ? 284 : 576}" y="${y}" width="20" height="10" rx="3" fill="#3A3046"/>`).join(''); };
      return nightSky(WIN) + windowFrame() + sh(-1) + sh(1); } },
  blomsterkasse: { label:'Vindue med blomsterkasse', curtain: 1, draw: c => { const box = '#7A5236';
      let o = nightSky(WIN) + windowFrame() + `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + curtain(c, -1) + curtain(c, 1);
      o += [[310,430],[350,418],[390,432],[440,414],[490,430],[530,420],[570,432]].map(([x,y], i) => `<path d="M ${x} 468 Q ${x + (i%2?6:-6)} 446 ${x} ${y}" stroke="#3E7A4A" stroke-width="5" fill="none"/>` + `<g transform="translate(${x} ${y})">${[0,1,2,3,4].map(k => { const a = k*1.2566; return `<circle cx="${(Math.cos(a)*9).toFixed(1)}" cy="${(Math.sin(a)*9).toFixed(1)}" r="8" fill="${['#FF8FC7','#FFE27A',c,'#B79BFF'][i%4]}"/>`; }).join('')}<circle r="5" fill="#FFF6D0"/></g>`).join('');
      o += `<path d="M 286 458 H 594 L 584 506 H 296 Z" fill="${box}" ${RS(box)}/><path d="M 300 476 H 580" stroke="${lt(box,0.25)}" stroke-width="4"/>` + [330, 440, 550].map(x => starP(x, 492, 7, '#F2C14E')).join('');
      return o; } },
  spids: { label:'Spidsbuet vindue', draw: c => { const d = 'M 330 440 V 230 Q 330 140 440 90 Q 550 140 550 230 V 440 Z';
      let o = nightSky(d) + rClip(d, Array.from({ length: 14 }, (_, i) => `<path d="M ${200 + i*40} 60 L ${200 + i*40 + 400} 460 M ${200 + i*40} 460 L ${200 + i*40 + 400} 60" stroke="#2A1E30" stroke-width="3" opacity=".7"/>`).join(''));
      o += `<path d="${d}" fill="none" stroke="${c}" stroke-width="20" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${rOut(c)}" stroke-width="3"/>`;
      o += `<rect x="310" y="436" width="260" height="22" rx="6" fill="${c}" ${RS(c)}/>` + `<g transform="translate(440 96)"><polygon points="${star5pts(0,0,16,7)}" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/></g>`;
      return o; } },
  stjerne: { label:'Stjernevindue', draw: c => { const p = []; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i % 2 ? 80 : 180; p.push(`${(440 + r*Math.cos(a)).toFixed(1)} ${(285 + r*Math.sin(a)).toFixed(1)}`); }
      const d = 'M ' + p.join(' L ') + ' Z';
      return nightSky(d) + `<path d="${d}" fill="none" stroke="${c}" stroke-width="22" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${rOut(c)}" stroke-width="3" stroke-linejoin="round"/>`
        + `<circle cx="440" cy="285" r="24" fill="${c}" ${RS(c)}/><circle cx="440" cy="285" r="10" fill="#F2C14E"/>`; } },
});

Object.assign(SENG, {
  jern: { label:'Jernseng', draw: c => { const I = '#3A3346', G = '#C9952E';
      /* set fra siden: en jernstang i hver ende med snirkler og messingknop, som de andre senges stolper */
      const end = (x, top, big) => `<path d="M ${x} 862 V ${top}" stroke="${I}" stroke-width="14" stroke-linecap="round"/><path d="M ${x-3} 858 V ${top+6}" stroke="#6A6280" stroke-width="3" opacity=".6"/>`
        + (big ? [top + 70, top + 150].map(y => `<path d="M ${x} ${y} c 22 -6 26 18 10 22 c -12 3 -14 -10 -4 -12 M ${x} ${y} c -22 -6 -26 18 -10 22 c 12 3 14 -10 4 -12" stroke="${I}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('') : `<path d="M ${x} ${top+40} c 18 -4 20 14 8 18 c -9 2 -10 -8 -3 -9" stroke="${I}" stroke-width="5" fill="none" stroke-linecap="round"/>`)
        + `<circle cx="${x}" cy="${top-8}" r="13" fill="${G}" stroke="#8A6420" stroke-width="3"/><circle cx="${x-4}" cy="${top-12}" r="4" fill="#F2D27A"/>`;
      return bedSide(c, { frame: I, head: end(84, 500, true), foot: end(536, 640, false), legs: false }); } },
  polstret: { label:'Polstret seng', draw: c => { const W = '#6A4430', P = lt(c,0.15);
      /* set fra siden er gærdet en tyk, polstret plade med afrundet top og en træramme */
      const end = (x, top, w) => `<path d="M ${x} 862 V ${top + w/2} Q ${x} ${top} ${x + w/2} ${top} Q ${x + w} ${top} ${x + w} ${top + w/2} V 862 Z" fill="${W}" ${RS(W)}/>`
        + `<path d="M ${x+7} 780 V ${top + w/2} Q ${x+7} ${top+8} ${x + w/2} ${top+8} Q ${x + w - 7} ${top+8} ${x + w - 7} ${top + w/2} V 780 Z" fill="${P}" stroke="${fdk(c,0.25)}" stroke-width="2.5"/>`
        + Array.from({ length: Math.floor((780 - top - w/2) / 46) }, (_, i) => `<circle cx="${x + w/2}" cy="${top + w/2 + 18 + i*46}" r="4.5" fill="${fdk(c,0.3)}"/>`).join('')
        + `<path d="M ${x+12} ${top + w/2 + 10} V 770" stroke="${lt(c,0.45)}" stroke-width="4" opacity=".6" stroke-linecap="round"/>`;
      return bedSide(c, { frame: W, head: end(62, 480, 50), foot: end(506, 630, 40), legs: false }); } },
  baad: { label:'Bådseng', draw: c => { const W = '#8A5A3C';
      const front = `<path d="M 50 700 C 60 800 140 860 300 860 C 460 860 560 800 570 690 L 560 770 C 520 830 420 880 300 880 C 180 880 80 830 60 770 Z" fill="${W}" ${RS(W)}/>` + [800, 830].map(y => `<path d="M 80 ${y-30} Q 300 ${y+20} 540 ${y-30}" stroke="${fdk(W,0.25)}" stroke-width="4" fill="none"/>`).join('')
        + [150, 300, 450].map(x => `<circle cx="${x}" cy="830" r="12" fill="#CFE6F2" stroke="#C9952E" stroke-width="5"/>`).join('');
      const back = `<path d="M 300 640 V 380" stroke="${W}" stroke-width="10"/><path d="M 306 400 Q 420 470 330 600 Z" fill="${lt(c,0.5)}" stroke="${rOut(c)}" stroke-width="3"/><path d="M 300 380 l 30 10 l -30 10" fill="#E0457A"/>`;
      return bedSide(c, { frame: W, back, foot: front, legs: false }).replace(/<rect x="80" y="744" width="460" height="34"[^>]*\/><rect x="80" y="744"[^>]*\/>/, ''); } },
  blomst: { label:'Blomsterseng', draw: c => { const W = '#6A4E8A', P = ['#FF8FC7','#FFB3D9','#FF8FC7','#FFB3D9','#FF8FC7'];
      const flower = (x, y, r) => [0,1,2,3,4].map(i => { const a = -Math.PI/2 + i*2*Math.PI/5; return `<ellipse cx="${(x + Math.cos(a)*r*0.9).toFixed(1)}" cy="${(y + Math.sin(a)*r*0.9).toFixed(1)}" rx="${r*0.62}" ry="${r*0.45}" transform="rotate(${(a*180/Math.PI+90).toFixed(0)} ${(x + Math.cos(a)*r*0.9).toFixed(1)} ${(y + Math.sin(a)*r*0.9).toFixed(1)})" fill="${P[i]}" stroke="#C2465E" stroke-width="3"/>`; }).join('') + `<circle cx="${x}" cy="${y}" r="${r*0.45}" fill="#FFE27A" stroke="#C99A12" stroke-width="3"/>`;
      const head = `<path d="M 110 860 V 620" stroke="#3E7A4A" stroke-width="16"/><path d="M 110 700 q -40 -10 -50 -50 q 40 10 50 50" fill="#5FB06A" stroke="#2E5A3A" stroke-width="3"/>` + flower(110, 560, 76);
      const foot = `<path d="M 520 860 V 700" stroke="#3E7A4A" stroke-width="12"/>` + flower(520, 660, 44);
      return bedSide(c, { frame: W, head, foot, legs: false }); } },
  slot: { label:'Slotsseng', draw: c => { const S = '#B9A6D9', R = c;
      const tower = (x, top, w) => `<rect x="${x-w/2}" y="${top}" width="${w}" height="${860-top}" fill="${S}" ${RS(S)}/>` + [0,1,2].map(i => `<rect x="${x-w/2 + i*w/3 + 2}" y="${top-14}" width="${w/3-6}" height="16" fill="${S}" ${RS(S,2)}/>`).join('')
        + `<path d="M ${x-w/2-8} ${top-12} L ${x} ${top-90} L ${x+w/2+8} ${top-12} Z" fill="${R}" ${RS(R)}/><path d="M ${x-8} ${top+40} Q ${x} ${top+28} ${x+8} ${top+40} V ${top+64} H ${x-8} Z" fill="#3A2340"/>`;
      return bedSide(c, { frame: S, head: tower(110, 520, 90), foot: tower(520, 650, 60), legs: false }); } },
  stjerne: { label:'Stjerneseng', draw: c => { const G = '#E9B949', GD = '#A87A1A';
      const head = `<path d="M 110 860 V 640" stroke="${G}" stroke-width="24"/><g transform="translate(110 560)"><polygon points="${star5pts(0,0,110,46)}" fill="${G}" stroke="${GD}" stroke-width="5"/><polygon points="${star5pts(0,0,60,26)}" fill="#FFE7A0"/></g>`;
      const foot = `<path d="M 520 860 V 700" stroke="${G}" stroke-width="18"/><g transform="translate(520 666)"><polygon points="${star5pts(0,0,46,20)}" fill="${G}" stroke="${GD}" stroke-width="4"/></g>`;
      return bedSide(c, { frame: G, head, foot, legs: false }); } },
});

Object.assign(HYLDE, {
  bamser: { label:'Bamser', draw: c => { const bear = (x, s, col) => `<g transform="translate(${x} 300) scale(${s})"><circle cx="-26" cy="-96" r="14" fill="${col}" ${RS(col,2.5)}/><circle cx="26" cy="-96" r="14" fill="${col}" ${RS(col,2.5)}/><ellipse cx="0" cy="-30" rx="40" ry="32" fill="${col}" ${RS(col,2.5)}/><circle cx="0" cy="-78" r="32" fill="${col}" ${RS(col,2.5)}/><ellipse cx="0" cy="-68" rx="14" ry="10" fill="${lt(col,0.45)}"/><circle cx="-11" cy="-84" r="4" fill="#2A1E30"/><circle cx="11" cy="-84" r="4" fill="#2A1E30"/><path d="M -4 -72 h 8 l -4 5 Z" fill="#2A1E30"/><ellipse cx="-28" cy="-6" rx="13" ry="9" fill="${col}" ${RS(col,2)}/><ellipse cx="28" cy="-6" rx="13" ry="9" fill="${col}" ${RS(col,2)}/><path d="M -14 -46 Q 0 -38 14 -46" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
      return shelfBoard() + bear(1140, 1, '#B07A4E') + bear(1250, 1.25, '#E8C9A0') + bear(1360, 0.95, lt(c,0.35)) + bear(1440, 0.7, '#8A6A9A'); } },
  ure: { label:'Ure og tandhjul', draw: c => { const B = '#C9952E', BD = '#8A6420';
      const gear = (x, y, r, col) => { let d = ''; for (let i = 0; i < 16; i++){ const a = i*Math.PI/8, rr = i % 2 ? r : r*0.8; d += `${i ? 'L' : 'M'} ${(x + rr*Math.cos(a)).toFixed(1)} ${(y + rr*Math.sin(a)).toFixed(1)} `; } return `<path d="${d}Z" fill="${col}" stroke="${BD}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r*0.3}" fill="${fdk(col,0.3)}"/>`; };
      let o = shelfBoard() + gear(1110, 262, 34, B) + gear(1160, 236, 22, lt(B,0.2));
      o += `<rect x="1196" y="170" width="96" height="130" rx="10" fill="#6A4430" ${RS('#6A4430')}/><circle cx="1244" cy="226" r="38" fill="#FFF8EC" stroke="${B}" stroke-width="6"/>` + [0,1,2,3,4,5,6,7,8,9,10,11].map(i => { const a = i*Math.PI/6; return `<circle cx="${(1244 + Math.sin(a)*30).toFixed(1)}" cy="${(226 - Math.cos(a)*30).toFixed(1)}" r="${i % 3 ? 1.5 : 3}" fill="${R_INK}"/>`; }).join('') + `<path d="M 1244 226 V 202 M 1244 226 L 1262 234" stroke="${R_INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M 1226 278 q 18 12 36 0" stroke="${B}" stroke-width="5" fill="none"/>`;
      o += `<g transform="translate(1350 300)"><rect x="-30" y="-12" width="60" height="12" rx="3" fill="#6A4430"/><rect x="-30" y="-130" width="60" height="12" rx="3" fill="#6A4430"/><path d="M -22 -118 Q -22 -70 0 -64 Q 22 -70 22 -118 Z M -22 -12 Q -22 -58 0 -64 Q 22 -58 22 -12 Z" fill="#E8F6FF" fill-opacity=".55" stroke="${R_INK}" stroke-width="3"/><path d="M -14 -12 Q 0 -40 14 -12 Z M -2 -64 V -40" fill="${c}" stroke="${c}" stroke-width="3"/><path d="M -12 -112 Q 0 -98 12 -112 Z" fill="${c}"/>${[-24, 24].map(x => `<rect x="${x-3}" y="-118" width="6" height="106" fill="#6A4430"/>`).join('')}</g>`;
      return o + gear(1430, 258, 30, lt(c,0.2)); } },
  kugler: { label:'Krystalkugler', draw: c => { const ball = (x, r, col) => `<path d="M ${x-r*0.7} 300 L ${x-r*0.5} ${300-r*0.45} H ${x+r*0.5} L ${x+r*0.7} 300 Z" fill="#6A4430" ${RS('#6A4430',2.5)}/>` + glowAt(x, 300 - r*1.3, r*2, col) + `<circle cx="${x}" cy="${300 - r*1.35}" r="${r}" fill="${lt(col,0.35)}" fill-opacity=".8" stroke="${fdk(col,0.3)}" stroke-width="3"/><ellipse cx="${x - r*0.35}" cy="${300 - r*1.7}" rx="${r*0.28}" ry="${r*0.18}" fill="#FFFFFF" opacity=".85"/>` + starP(x + r*0.2, 300 - r*1.2, r*0.25, '#FFFFFF', .8);
      return shelfBoard() + ball(1130, 42, c) + ball(1250, 56, '#7FD8FF') + ball(1360, 38, '#FF8FC7') + ball(1440, 26, '#B79BFF'); } },
  testel: { label:'Testel', draw: c => { const P = '#FFF8F0', Ps = '#C9B6C6';
      const cup = x => `<path d="M ${x-26} 262 H ${x+26} Q ${x+24} 298 ${x} 298 Q ${x-24} 298 ${x-26} 262 Z" fill="${P}" stroke="${Ps}" stroke-width="3"/><path d="M ${x+24} 270 q 14 2 10 14 q -4 8 -14 6" stroke="${Ps}" stroke-width="4" fill="none"/>` + heart(x, 282, 0.9, c) + `<ellipse cx="${x}" cy="300" rx="36" ry="6" fill="${P}" stroke="${Ps}" stroke-width="2.5"/>`;
      /* tuden er en del af kanden: samme porcelæn og samme kant, tyk ved kanden og smal ved spidsen */
      const spout = 'M 1312 262 C 1330 252 1338 230 1350 206 C 1354 198 1364 196 1368 202 C 1360 212 1352 240 1336 276 C 1330 286 1318 288 1310 284 Z';
      return shelfBoard() + `<path d="${spout}" fill="${P}" stroke="${Ps}" stroke-width="3" stroke-linejoin="round"/><path d="M 1340 230 Q 1346 216 1354 206" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>`
        + `<path d="M 1190 300 C 1150 300 1150 210 1200 200 L 1280 200 C 1330 210 1330 300 1290 300 Z" fill="${P}" stroke="${Ps}" stroke-width="3"/><path d="M 1180 230 q -30 10 -24 40 q 10 10 30 0" stroke="${Ps}" stroke-width="7" fill="none"/><path d="M 1210 200 Q 1240 176 1270 200 Z" fill="${c}" ${RS(c,2.5)}/><circle cx="1240" cy="186" r="8" fill="${c}" ${RS(c,2)}/>`
        + `<g opacity=".6">${[0,1,2].map(i => `<path d="M ${1362 + i*8} 182 q -8 -14 0 -28" stroke="#FFFFFF" stroke-width="4" fill="none"/>`).join('')}</g>` + starP(1240, 250, 14, c, .9) + cup(1120) + cup(1420); } },
  muslinger: { label:'Muslinger og sten', draw: c => { const shell = (x, s, col) => `<g transform="translate(${x} 300) scale(${s})"><path d="M -40 0 Q -48 -52 0 -64 Q 48 -52 40 0 Z" fill="${col}" ${RS(col,2.5)}/>${[-28,-14,0,14,28].map(dx => `<path d="M 0 -4 L ${dx} -60" stroke="${fdk(col,0.25)}" stroke-width="2.5"/>`).join('')}<path d="M -14 0 h 28 v 8 h -28 Z" fill="${col}" ${RS(col,2)}/></g>`;
      return shelfBoard() + shell(1130, 1.1, '#FFC8D8') + `<ellipse cx="1220" cy="286" rx="34" ry="16" fill="#8A8AA0" ${RS('#8A8AA0',2.5)}/><ellipse cx="1260" cy="290" rx="22" ry="11" fill="#B0A68A" ${RS('#B0A68A',2.5)}/>` + shell(1330, 1.4, lt(c,0.4)) + `<path d="M 1420 300 C 1400 270 1420 230 1440 236 C 1470 244 1460 290 1440 300 Z" fill="#F2E6D0" ${RS('#F2E6D0',2.5)}/><path d="M 1428 270 q 12 -10 22 0" stroke="#C9B6A6" stroke-width="3" fill="none"/>` + `<circle cx="1222" cy="282" r="5" fill="#FFFFFF" opacity=".6"/>`; } },
  pokaler: { label:'Pokaler', draw: c => { const G = '#E9B949', GD = '#A87A1A';
      const cup = (x, s, col, dark) => `<g transform="translate(${x} 300) scale(${s})"><rect x="-26" y="-14" width="52" height="14" rx="3" fill="#6A4430"/><path d="M -6 -14 V -40 H 6 V -14 Z" fill="${col}" stroke="${dark}" stroke-width="2.5"/><path d="M -34 -110 H 34 Q 34 -50 0 -42 Q -34 -50 -34 -110 Z" fill="${col}" stroke="${dark}" stroke-width="3"/><path d="M -34 -100 q -24 4 -18 28 q 6 12 22 8 M 34 -100 q 24 4 18 28 q -6 12 -22 8" stroke="${col}" stroke-width="6" fill="none"/><path d="M -20 -100 q -4 30 10 46" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>${starP(0, -78, 12, dark)}</g>`;
      return shelfBoard() + cup(1140, 0.8, '#C0C4CC', '#7A808A') + cup(1260, 1.1, G, GD) + cup(1380, 0.85, '#C98A5A', '#8A5A30') + `<rect x="1430" y="250" width="36" height="50" rx="4" fill="${c}" ${RS(c,2.5)}/><circle cx="1448" cy="270" r="9" fill="${G}" stroke="${GD}" stroke-width="2"/>`; } },
});

Object.assign(LAMPE, {
  olie: { label:'Olielampe', draw: c => { const x = 890, B = '#C9952E', BD = '#8A6420';
      let o = `<path d="M ${x} 0 V 120" stroke="#3A3046" stroke-width="4"/>` + Array.from({ length: 6 }, (_, i) => `<ellipse cx="${x}" cy="${20 + i*18}" rx="5" ry="9" fill="none" stroke="#3A3046" stroke-width="3"/>`).join('');
      o += glowAt(x, 220, 150, '#FFE27A') + `<path d="M ${x-40} 160 L ${x-20} 120 H ${x+20} L ${x+40} 160 Z" fill="${B}" stroke="${BD}" stroke-width="3"/><circle cx="${x}" cy="118" r="8" fill="${B}" stroke="${BD}" stroke-width="2"/>`;
      o += `<path d="M ${x-36} 160 H ${x+36} V 270 H ${x-36} Z" fill="#FFF3C8" fill-opacity=".75" stroke="${BD}" stroke-width="3"/><path d="M ${x} 160 V 270 M ${x-36} 215 H ${x+36}" stroke="${BD}" stroke-width="3" opacity=".7"/><path d="M ${x} 250 q -14 -20 0 -44 q 14 24 0 44" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/>`;
      return o + `<path d="M ${x-44} 270 H ${x+44} L ${x+30} 296 H ${x-30} Z" fill="${c}" ${RS(c)}/><circle cx="${x}" cy="304" r="8" fill="${B}" stroke="${BD}" stroke-width="2"/>`; } },
  papir: { label:'Papirlanterne', draw: c => { const x = 890, y = 200, E = `M ${x-100} ${y} A 100 96 0 1 0 ${x+100} ${y} A 100 96 0 1 0 ${x-100} ${y} Z`;
      let o = `<path d="M ${x} 0 V 100" stroke="#3A3046" stroke-width="3"/>` + glowAt(x, y, 160, lt(c,0.4));
      o += `<rect x="${x-34}" y="96" width="68" height="14" rx="4" fill="#3A3046"/><path d="${E}" fill="${lt(c,0.35)}" ${RS(c)}/>` + rClip(E, [-70,-36,0,36,70].map(dx => `<path d="M ${x+dx} 104 Q ${x+dx*1.3} ${y} ${x+dx} 296" stroke="${c}" stroke-width="3" fill="none" opacity=".7"/>`).join('') + `<ellipse cx="${x}" cy="${y}" rx="60" ry="56" fill="#FFF6D0" opacity=".35"/>`);
      o += `<path d="${E}" fill="none" ${RS(c)}/><rect x="${x-34}" y="290" width="68" height="14" rx="4" fill="#3A3046"/><path d="M ${x} 304 V 360" stroke="${c}" stroke-width="4"/><path d="M ${x-10} 340 L ${x} 380 L ${x+10} 340 Z" fill="${c}"/>`;
      return o + starP(x, y, 22, '#FFF6D0', .8); } },
  ildfluer: { label:'Ildfluer i glas', draw: c => { const x = 890;
      let o = `<path d="M ${x} 0 V 110" stroke="#3A3046" stroke-width="3"/><path d="M ${x-40} 132 Q ${x} 92 ${x+40} 132" stroke="#8A6420" stroke-width="4" fill="none"/>` + glowAt(x, 220, 140, '#D8FF8A');
      o += `<rect x="${x-46}" y="128" width="92" height="22" rx="6" fill="#8A6420" stroke="#5A4010" stroke-width="3"/><path d="M ${x-56} 150 H ${x+56} Q ${x+64} 150 ${x+64} 162 V 300 Q ${x+64} 320 ${x+44} 320 H ${x-44} Q ${x-64} 320 ${x-64} 300 V 162 Q ${x-64} 150 ${x-56} 150 Z" fill="#E8F6FF" fill-opacity=".35" stroke="#5A6A7A" stroke-width="3"/>`;
      o += [[-30,190,0],[20,210,0.6],[-10,250,1.2],[34,270,1.8],[-36,290,0.9],[6,176,1.5]].map(([dx,y,b]) => `<g><animate attributeName="opacity" values="1;.25;1" dur="1.8s" begin="${b}s" repeatCount="indefinite"/>${glowAt(x+dx, y, 16, '#E8FF9A')}<circle cx="${x+dx}" cy="${y}" r="4" fill="#F2FFB0"/></g>`).join('');
      return o + `<path d="M ${x-48} 176 V 290" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".45"/><path d="M ${x-20} 128 h 40" stroke="${c}" stroke-width="10"/>`; } },
  planet: { label:'Planetlampe', draw: c => { const x = 890, y = 210;
      let o = `<path d="M ${x} 0 V 130" stroke="#3A3046" stroke-width="3"/>` + glowAt(x, y, 160, lt(c,0.3));
      o += `<path d="M ${x-140} ${y+10} A 140 34 0 0 1 ${x+140} ${y+10}" fill="none" stroke="${lt(c,0.5)}" stroke-width="14" opacity=".9"/>`;
      o += `<circle cx="${x}" cy="${y}" r="80" fill="${c}" ${RS(c)}/>` + rClip(`M ${x} ${y-80} A 80 80 0 1 1 ${x-0.1} ${y-80} Z`, `<path d="M ${x-90} ${y-30} Q ${x} ${y-14} ${x+90} ${y-30} M ${x-90} ${y+24} Q ${x} ${y+40} ${x+90} ${y+24}" stroke="${lt(c,0.3)}" stroke-width="12" fill="none"/><circle cx="${x+30}" cy="${y+30}" r="70" fill="${SHC}" opacity=".18"/>`);
      o += `<path d="M ${x-140} ${y+10} A 140 34 0 0 0 ${x+140} ${y+10}" fill="none" stroke="${lt(c,0.5)}" stroke-width="14"/><path d="M ${x-140} ${y+10} A 140 34 0 0 0 ${x+140} ${y+10}" fill="none" stroke="${rOut(c)}" stroke-width="2"/>`;
      return o + starP(x - 120, y - 70, 9, '#FFF6D0') + starP(x + 130, y - 40, 7, '#FFF6D0') + `<circle cx="${x-30}" cy="${y-40}" r="12" fill="#FFFFFF" opacity=".5"/>`; } },
  kuppel: { label:'Gaslampe med glaskuppel', draw: c => { const x = 890, B = '#C9952E', BD = '#8A6420';
      let o = `<path d="M ${x} 0 V 130" stroke="${BD}" stroke-width="8"/><path d="M ${x} 0 V 130" stroke="${B}" stroke-width="4"/>` + glowAt(x, 220, 170, '#FFE9A0');
      /* pæren sidder inde under kuppelen og ses gennem glasset */
      o += `<rect x="${x-20}" y="124" width="40" height="20" rx="5" fill="${B}" stroke="${BD}" stroke-width="3"/><path d="M ${x} 144 V 200" stroke="${BD}" stroke-width="5"/><rect x="${x-9}" y="196" width="18" height="12" rx="2" fill="${B}" stroke="${BD}" stroke-width="2"/>`;
      o += glowAt(x, 226, 60, '#FFF6D0') + `<ellipse cx="${x}" cy="228" rx="15" ry="19" fill="#FFF6D0" stroke="#F2C14E" stroke-width="2"/><path d="M ${x-5} 230 q 5 -10 10 0" stroke="#E0A030" stroke-width="2" fill="none"/>`;
      o += `<path d="M ${x-110} 270 C ${x-110} 180 ${x-50} 140 ${x} 140 C ${x+50} 140 ${x+110} 180 ${x+110} 270 Z" fill="${lt(c,0.5)}" fill-opacity=".45" ${RS(c)}/>`;
      o += `<path d="M ${x-80} 250 C ${x-80} 200 ${x-50} 170 ${x-20} 160" stroke="#FFFFFF" stroke-width="8" fill="none" opacity=".5" stroke-linecap="round"/><path d="M ${x-114} 270 H ${x+114}" stroke="${B}" stroke-width="10" stroke-linecap="round"/>`;
      return o + [-90,-45,0,45,90].map(dx => `<path d="M ${x+dx} 276 V 296" stroke="${B}" stroke-width="3"/><circle cx="${x+dx}" cy="300" r="5" fill="${c}"/>`).join(''); } },
  sky: { label:'Skylampe', draw: c => { const x = 890, y = 180, W = '#FFFFFF';
      let o = `<path d="M ${x-60} 0 V 140 M ${x+60} 0 V 140" stroke="#3A3046" stroke-width="3"/>` + glowAt(x, y, 160, '#FFFFFF');
      o += `<path d="M ${x-140} ${y+40} C ${x-180} ${y+40} ${x-180} ${y-20} ${x-130} ${y-20} C ${x-130} ${y-70} ${x-60} ${y-80} ${x-40} ${y-40} C ${x-20} ${y-90} ${x+70} ${y-90} ${x+70} ${y-30} C ${x+130} ${y-50} ${x+170} ${y} ${x+140} ${y+40} Z" fill="${W}" stroke="#C9C2E6" stroke-width="5"/>`;
      o += `<path d="M ${x-120} ${y+20} Q ${x} ${y+40} ${x+120} ${y+20}" stroke="#E6E0F6" stroke-width="8" fill="none"/>`;
      o += [[-100,0.3],[-40,1.1],[20,0.6],[80,1.6],[-70,2],[50,0.1]].map(([dx,b], i) => `<path d="M ${x+dx} ${y+42} V ${y+100 + (i%3)*30}" stroke="#C9C2E6" stroke-width="1.5"/><g><animate attributeName="opacity" values="1;.35;1" dur="2.4s" begin="${b}s" repeatCount="indefinite"/>${i % 2 ? starP(x+dx, y+110 + (i%3)*30, 10, c) : `<path d="M ${x+dx} ${y+96 + (i%3)*30} q -8 12 0 18 q 8 -6 0 -18" fill="${lt(c,0.4)}"/>`}</g>`).join('');
      return o; } },
});

const RUG_T = 'translate(820 900) scale(1 0.28) translate(-820 -900)';
Object.assign(GULV, {
  hjerte: { label:'Hjertetæppe', draw: c => `<g transform="${RUG_T}"><path transform="translate(820 900) scale(28) translate(0 -1)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${c}" stroke="${rOut(c)}" stroke-width=".12"/><path transform="translate(820 900) scale(21) translate(0 -1)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="none" stroke="${lt(c,0.4)}" stroke-width=".25"/></g>` },
  persisk: { label:'Persisk tæppe', draw: c => { const d = 'M 540 850 L 1100 850 L 1140 958 L 500 958 Z', G = '#E9B949';
      let o = `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, `<path d="M 560 862 L 1080 862 L 1112 946 L 528 946 Z" fill="none" stroke="${G}" stroke-width="10"/><path d="M 580 872 L 1064 872 L 1090 936 L 552 936 Z" fill="none" stroke="${lt(c,0.35)}" stroke-width="4" stroke-dasharray="10 6"/>`
        + `<path d="M 820 870 L 900 904 L 820 938 L 740 904 Z" fill="${G}" opacity=".85"/><path d="M 820 884 L 860 904 L 820 924 L 780 904 Z" fill="${fdk(c,0.2)}"/>` + [[650,904],[990,904]].map(([x,y]) => `<path d="M ${x} ${y-18} L ${x+30} ${y} L ${x} ${y+18} L ${x-30} ${y} Z" fill="${lt(c,0.35)}"/>`).join(''));
      return o + Array.from({ length: 22 }, (_, i) => `<path d="M ${500 + i*30.5} 958 v 14" stroke="#FFF6E0" stroke-width="4"/>`).join('') + Array.from({ length: 19 }, (_, i) => `<path d="M ${542 + i*31} 850 v -10" stroke="#FFF6E0" stroke-width="4"/>`).join(''); } },
  maane: { label:'Månetæppe', draw: c => { const d = 'M 820 590 A 310 310 0 1 0 820 1210 A 130 310 0 1 1 820 590 Z';
      return `<g transform="${RUG_T}"><g transform="rotate(-35 820 900)"><path d="${d}" fill="${c}" stroke="${rOut(c)}" stroke-width="12"/><path d="M 700 680 A 250 250 0 0 0 700 1120" stroke="${lt(c,0.4)}" stroke-width="14" fill="none"/></g></g>` + starP(930, 880, 16, lt(c,0.5)) + starP(990, 905, 10, lt(c,0.5)); } },
  blomst: { label:'Blomstertæppe', draw: c => `<g transform="${RUG_T}">${[0,1,2,3,4,5].map(i => { const a = i*Math.PI/3, x = 820 + Math.cos(a)*190, y = 900 + Math.sin(a)*190; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="150" fill="${c}" stroke="${rOut(c)}" stroke-width="10"/>`; }).join('')}<circle cx="820" cy="900" r="170" fill="${lt(c,0.4)}" stroke="${rOut(c)}" stroke-width="10"/><circle cx="820" cy="900" r="90" fill="#FFE27A"/></g>` },
  pels: { label:'Pelstæppe', draw: c => { const F = lt(c,0.6); let o = `<g transform="${RUG_T}">`;
      for (let i = 0; i < 40; i++){ const a = i * Math.PI / 20, r = 300 + (i % 2 ? 26 : 0); o += `<circle cx="${(820 + Math.cos(a)*r).toFixed(0)}" cy="${(900 + Math.sin(a)*r).toFixed(0)}" r="44" fill="${F}"/>`; }
      o += `<circle cx="820" cy="900" r="310" fill="${F}"/>` + Array.from({ length: 30 }, (_, i) => { const a = i*2.4, r = 40 + (i*37)%240; return `<path d="M ${(820 + Math.cos(a)*r).toFixed(0)} ${(900 + Math.sin(a)*r).toFixed(0)} q 14 -30 30 0" stroke="${lt(c,0.35)}" stroke-width="10" fill="none"/>`; }).join('');
      return o + `</g>`; } },
  ternet: { label:'Ternet tæppe', draw: c => { const d = 'M 540 850 L 1100 850 L 1140 958 L 500 958 Z';
      let cells = ''; for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) if ((r + k) % 2){ const y0 = 850 + r*27, y1 = y0 + 27, t0 = (y0-850)/108, t1 = (y1-850)/108, L0 = 540 - 40*t0, R0 = 1100 + 40*t0, L1 = 540 - 40*t1, R1 = 1100 + 40*t1, w0 = (R0-L0)/12, w1 = (R1-L1)/12;
        cells += `<path d="M ${L0 + k*w0} ${y0} H ${L0 + (k+1)*w0} L ${L1 + (k+1)*w1} ${y1} H ${L1 + k*w1} Z" fill="${lt(c,0.45)}"/>`; }
      return `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, cells) + `<path d="${d}" fill="none" stroke="${rOut(c)}" stroke-width="3"/>`; } },
});

Object.assign(TING, {
  ur: { label:'Bedstefarsur', draw: c => { const W = '#6A4430', B = '#C9952E';
      let o = `<ellipse cx="1410" cy="940" rx="80" ry="10" fill="${SHC}" opacity=".22"/><path d="M 1360 940 V 640 Q 1360 560 1410 540 Q 1460 560 1460 640 V 940 Z" fill="${W}" ${RS(W)}/>`;
      o += `<circle cx="1410" cy="620" r="40" fill="#FFF8EC" stroke="${B}" stroke-width="6"/>` + [0,1,2,3,4,5,6,7,8,9,10,11].map(i => { const a = i*Math.PI/6; return `<circle cx="${(1410 + Math.sin(a)*32).toFixed(1)}" cy="${(620 - Math.cos(a)*32).toFixed(1)}" r="${i % 3 ? 1.6 : 3.2}" fill="${R_INK}"/>`; }).join('') + `<path d="M 1410 620 V 594 M 1410 620 L 1428 632" stroke="${R_INK}" stroke-width="4" stroke-linecap="round"/>`;
      o += `<rect x="1380" y="680" width="60" height="200" rx="8" fill="#2A1E30"/><g><animateTransform attributeName="transform" type="rotate" values="-10 1410 690;10 1410 690;-10 1410 690" dur="2s" repeatCount="indefinite"/><path d="M 1410 690 V 830" stroke="${B}" stroke-width="4"/><circle cx="1410" cy="838" r="18" fill="${B}" stroke="#8A6420" stroke-width="3"/></g>`;
      return o + `<rect x="1350" y="900" width="120" height="40" rx="6" fill="${fdk(W,0.15)}" ${RS(W)}/><circle cx="1410" cy="560" r="10" fill="${c}" ${RS(c,2)}/>`; } },
  kiste: { label:'Skattekiste', draw: c => { const W = '#7A4E35', B = '#C9952E';
      let o = `<ellipse cx="1410" cy="940" rx="120" ry="12" fill="${SHC}" opacity=".22"/>` + glowAt(1410, 790, 120, '#FFE27A');
      o += `<path d="M 1310 800 L 1300 700 Q 1410 650 1520 700 L 1510 800 Z" fill="${fdk(W,0.15)}" ${RS(W)}/><path d="M 1320 790 L 1312 712 Q 1410 670 1508 712 L 1500 790 Z" fill="#2A1E30"/>`;
      o += [[1350,790],[1390,770],[1430,780],[1470,790],[1410,800]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#F2C14E" stroke="#A87A1A" stroke-width="3"/>`).join('') + `<path d="M 1380 760 L 1400 740 L 1420 760 L 1400 780 Z" fill="${c}" ${RS(c,2)}/>`;
      o += `<rect x="1300" y="800" width="220" height="130" rx="8" fill="${W}" ${RS(W)}/>` + [1320, 1490].map(x => `<rect x="${x}" y="800" width="16" height="130" fill="${B}" opacity=".85"/>`).join('') + `<rect x="1396" y="820" width="28" height="34" rx="5" fill="${B}" stroke="#8A6420" stroke-width="3"/><circle cx="1410" cy="834" r="5" fill="#2A1E30"/>`;
      return o + [[1340,700],[1480,690],[1410,660]].map(([x,y]) => star4(x, y, 10, '#FFF6D0')).join(''); } },
  grammofon: { label:'Grammofon', draw: c => { const W = '#6A4430', B = '#C9952E', BD = '#8A6420';
      let o = `<ellipse cx="1420" cy="940" rx="110" ry="12" fill="${SHC}" opacity=".22"/><path d="M 1340 940 L 1350 870 H 1490 L 1500 940 Z" fill="${W}" ${RS(W)}/><rect x="1330" y="826" width="180" height="50" rx="6" fill="${fdk(W,0.1)}" ${RS(W)}/><path d="M 1338 846 h 30" stroke="${B}" stroke-width="5" stroke-linecap="round"/>`;
      o += `<ellipse cx="1404" cy="822" rx="62" ry="11" fill="#2A1E30"/><ellipse cx="1404" cy="820" rx="16" ry="3" fill="${c}"/>`;
      /* tonearmen: stolpe bagerst, armen ud over pladen og tonehovedet med nålen nede på pladen */
      o += `<rect x="1482" y="790" width="14" height="36" rx="4" fill="${B}" stroke="${BD}" stroke-width="2.5"/><path d="M 1489 796 Q 1470 784 1440 800" stroke="${B}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      o += `<circle cx="1434" cy="806" r="15" fill="${B}" stroke="${BD}" stroke-width="3"/><circle cx="1434" cy="806" r="8" fill="#FFF6E0" stroke="${BD}" stroke-width="2"/><path d="M 1430 820 L 1426 824" stroke="${BD}" stroke-width="3" stroke-linecap="round"/>`;
      /* tragten sidder på armen bagved og vender opad og frem */
      const horn = 'M 1484 790 C 1488 740 1476 700 1452 672 C 1430 646 1376 622 1338 618 L 1404 548 C 1422 590 1452 640 1478 672 C 1500 704 1500 750 1494 790 Z';
      o += `<path d="${horn}" fill="${c}" ${RS(c)}/><path d="M 1490 780 C 1494 740 1484 700 1462 676" stroke="${lt(c,0.35)}" stroke-width="4" fill="none" opacity=".7"/>`;
      o += `<ellipse cx="1371" cy="583" rx="58" ry="20" transform="rotate(-47 1371 583)" fill="${lt(c,0.2)}" ${RS(c)}/><ellipse cx="1373" cy="586" rx="40" ry="11" transform="rotate(-47 1373 586)" fill="${fdk(c,0.4)}"/>`;
      return o + [[1300,560],[1330,500]].map(([x,y], i) => `<g><animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="${i}s" repeatCount="indefinite"/><path d="M ${x} ${y} v -30 l 16 -6 v 24" stroke="#FFF6D0" stroke-width="4" fill="none"/><circle cx="${x-5}" cy="${y}" r="6" fill="#FFF6D0"/><circle cx="${x+11}" cy="${y-6}" r="6" fill="#FFF6D0"/></g>`).join(''); } },
  teleskop: { label:'Teleskop', draw: c => { const W = '#6A4430', B = '#C9952E', BD = '#8A6420';
      let o = `<ellipse cx="1420" cy="944" rx="110" ry="10" fill="${SHC}" opacity=".22"/><path d="M 1420 760 L 1340 940 M 1420 760 L 1500 940 M 1420 760 L 1420 944" stroke="${W}" stroke-width="12" stroke-linecap="round"/>`;
      /* kikkerten peger op mod vinduet (til venstre): okularet nederst til højre, den store linse øverst til venstre */
      o += `<g transform="rotate(34 1420 750)"><rect x="1430" y="736" width="34" height="28" rx="6" fill="${B}" stroke="${BD}" stroke-width="3"/><rect x="1350" y="730" width="96" height="40" rx="10" fill="${c}" ${RS(c)}/><rect x="1282" y="722" width="76" height="56" rx="10" fill="${c}" ${RS(c)}/><rect x="1350" y="728" width="12" height="44" fill="${B}"/><rect x="1264" y="716" width="24" height="68" rx="8" fill="${B}" stroke="${BD}" stroke-width="3"/>`
        + `<ellipse cx="1265" cy="750" rx="11" ry="31" fill="#9FD4F2" stroke="${BD}" stroke-width="3"/><ellipse cx="1263" cy="740" rx="4" ry="11" fill="#FFFFFF" opacity=".8"/><path d="M 1296 730 H 1350" stroke="${lt(c,0.35)}" stroke-width="4" opacity=".7"/></g>`;
      return o + `<circle cx="1420" cy="760" r="12" fill="${B}" stroke="${BD}" stroke-width="3"/>` + starP(1300, 560, 12, '#FFF6D0') + starP(1340, 520, 7, '#FFF6D0'); } },
  aeg: { label:'Drageæg i rede', draw: c => { let o = `<ellipse cx="1410" cy="940" rx="130" ry="14" fill="${SHC}" opacity=".22"/>` + glowAt(1410, 780, 130, lt(c,0.3));
      o += `<path d="M 1300 900 C 1290 860 1330 840 1410 846 C 1490 840 1530 860 1520 900 C 1500 940 1320 940 1300 900 Z" fill="#9C7A4A" stroke="#6A4E2A" stroke-width="4"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M ${1300 + i*16} ${870 + (i%3)*14} q 20 -10 40 4" stroke="#6A4E2A" stroke-width="3" fill="none"/>`).join('');
      o += `<path d="M 1410 690 C 1360 690 1340 780 1350 830 C 1360 870 1460 870 1470 830 C 1480 780 1460 690 1410 690 Z" fill="${c}" ${RS(c)}/>` + [[1390,740],[1430,770],[1395,810],[1440,825],[1420,720]].map(([x,y]) => `<path d="M ${x-10} ${y} q 10 -12 20 0 q -10 6 -20 0" fill="${lt(c,0.4)}"/>`).join('');
      return o + `<path d="M 1372 740 q -6 30 4 60" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5"/><path d="M 1430 700 l -8 20 l 12 10 l -6 18" stroke="${fdk(c,0.4)}" stroke-width="3" fill="none"/>`; } },
  ovn: { label:'Lille brændeovn', draw: c => { const I = '#3A3346';
      /* røret går op, knækker og forsvinder ud til højre */
      let o = `<ellipse cx="1410" cy="944" rx="110" ry="12" fill="${SHC}" opacity=".22"/><path d="M 1410 712 V 600 Q 1410 560 1450 560 H 1640" stroke="${I}" stroke-width="28" fill="none" stroke-linejoin="round"/><path d="M 1402 712 V 600 Q 1402 552 1450 552 H 1640" stroke="#5A5268" stroke-width="5" fill="none" opacity=".7"/>`
        + `<rect x="1394" y="640" width="32" height="12" rx="3" fill="#2A2436"/><rect x="1500" y="544" width="12" height="32" rx="3" fill="#2A2436"/>` + glowAt(1410, 850, 130, '#FFB04A');
      o += `<path d="M 1330 940 V 760 Q 1330 720 1370 720 H 1450 Q 1490 720 1490 760 V 940 Z" fill="${c}" ${RS(c)}/><rect x="1316" y="706" width="188" height="24" rx="8" fill="${fdk(c,0.2)}" ${RS(c)}/>`;
      o += `<path d="M 1360 900 V 820 Q 1360 784 1410 784 Q 1460 784 1460 820 V 900 Z" fill="#2A1E30" stroke="#C9952E" stroke-width="5"/><path d="M 1380 896 q -6 -40 20 -70 q 4 30 14 34 q 6 -20 18 -30 q 10 40 -6 66 Z" fill="#FFC02E" stroke="#E07A1F" stroke-width="3"><animate attributeName="opacity" values="1;.75;1" dur="0.8s" repeatCount="indefinite"/></path>`;
      return o + [1370, 1450].map(x => `<rect x="${x-10}" y="930" width="20" height="14" rx="3" fill="${I}"/>`).join('') + `<path d="M 1360 812 H 1460" stroke="#C9952E" stroke-width="3"/>`; } },
});

Object.assign(DYRESENG, Object.fromEntries(Object.entries({
  kasse: { label:'Papkasse', front: c => `<path d="M 1100 870 H 1280 V 950 H 1100 Z" fill="#C99A62" ${RS('#C99A62')}/><path d="M 1110 896 H 1270" stroke="#A87A42" stroke-width="3" stroke-dasharray="10 8"/>` + heart(1190, 928, 1.6, c),
    draw: c => `<path d="M 1100 870 L 1080 830 H 1300 L 1280 870 Z" fill="#B88A52" ${RS('#C99A62')}/><path d="M 1100 870 H 1280 V 950 H 1100 Z" fill="#C99A62" ${RS('#C99A62')}/><path d="M 1100 870 L 1060 800 L 1090 790 L 1120 840 Z M 1280 870 L 1320 800 L 1290 790 L 1260 840 Z" fill="#D9AA72" ${RS('#C99A62')}/><ellipse cx="1190" cy="868" rx="80" ry="10" fill="${c}"/>` + heart(1190, 928, 1.6, c) },
  hule: { label:'Hule', draw: c => `<path d="M 1060 950 C 1060 790 1120 740 1190 740 C 1260 740 1320 790 1320 950 Z" fill="${c}" ${RS(c)}/>` + rClip('M 1060 950 C 1060 790 1120 740 1190 740 C 1260 740 1320 790 1320 950 Z', [790, 830, 870, 910].map(y => `<path d="M 1050 ${y} Q 1190 ${y+20} 1330 ${y}" stroke="${lt(c,0.25)}" stroke-width="6" fill="none"/>`).join(''))
      + `<path d="M 1130 950 C 1130 870 1160 840 1190 840 C 1220 840 1250 870 1250 950 Z" fill="${fdk(c,0.45)}"/><ellipse cx="1190" cy="948" rx="70" ry="10" fill="${lt(c,0.3)}"/>` + starP(1190, 776, 12, '#FFE27A') },
  sofa: { label:'Lille sofa', draw: c => { const W = '#6A4430';
      return `<path d="M 1070 900 V 830 Q 1070 790 1110 790 H 1270 Q 1310 790 1310 830 V 900 Z" fill="${c}" ${RS(c)}/>` + [[1130,830],[1190,830],[1250,830]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${fdk(c,0.3)}"/>`).join('')
        + `<rect x="1060" y="870" width="260" height="56" rx="16" fill="${lt(c,0.12)}" ${RS(c)}/><rect x="1046" y="840" width="40" height="90" rx="18" fill="${c}" ${RS(c)}/><rect x="1294" y="840" width="40" height="90" rx="18" fill="${c}" ${RS(c)}/>`
        + [1070, 1306].map(x => `<path d="M ${x} 926 l -4 24 M ${x+4} 926" stroke="${W}" stroke-width="10" stroke-linecap="round"/>`).join('') + `<ellipse cx="1190" cy="872" rx="80" ry="10" fill="${lt(c,0.3)}"/>`; } },
  hundehus: { label:'Hundehus', draw: c => { const W = '#9C6B43';
      let o = `<path d="M 1090 950 V 830 L 1190 750 L 1290 830 V 950 Z" fill="${W}" ${RS(W)}/>` + [860, 890, 920].map(y => `<path d="M 1092 ${y} H 1288" stroke="${fdk(W,0.2)}" stroke-width="3"/>`).join('');
      o += `<path d="M 1070 840 L 1190 736 L 1310 840" stroke="${c}" stroke-width="26" fill="none" stroke-linejoin="round"/><path d="M 1070 840 L 1190 736 L 1310 840" stroke="${rOut(c)}" stroke-width="3" fill="none"/>`;
      return o + `<path d="M 1150 950 V 880 Q 1150 850 1190 850 Q 1230 850 1230 880 V 950 Z" fill="#2A1E30"/><rect x="1160" y="806" width="60" height="20" rx="4" fill="#FFF6E0" stroke="#C9B6A6" stroke-width="2"/>` + heart(1190, 818, 0.8, c); } },
  skypude: { label:'Skypude', draw: c => `<path d="M 1080 920 C 1040 920 1040 870 1080 866 C 1076 830 1130 820 1150 846 C 1170 816 1220 816 1236 846 C 1260 822 1310 834 1302 870 C 1340 874 1338 922 1300 924 Z" fill="${lt(c,0.6)}" stroke="${lt(c,0.2)}" stroke-width="5"/><path d="M 1090 900 Q 1190 914 1290 900" stroke="${lt(c,0.35)}" stroke-width="6" fill="none"/>` + [[1100,820],[1290,840],[1200,800]].map(([x,y]) => starP(x, y, 9, '#FFE27A')).join('') },
  muslingeskal: { label:'Muslingeskal', draw: c => { const S = lt(c,0.35), SD = fdk(S,0.2), H = [1190, 912];
      /* en åben musling: overskallen rejser sig fra hængslet bagerst, underskallen er en skål med puden i */
      const top = `M ${H[0]-14} ${H[1]} C 1060 900 1050 780 1110 740 C 1150 714 1230 714 1270 740 C 1330 780 1320 900 ${H[0]+14} ${H[1]} Z`;
      let o = `<path d="${top}" fill="${S}" ${RS(c)}/>` + rClip(top, [-120,-80,-40,0,40,80,120].map(dx => `<path d="M ${H[0]} ${H[1]+10} L ${H[0] + dx*1.1} 700" stroke="${SD}" stroke-width="4"/>`).join(''));
      const bowl = 'M 1050 896 Q 1190 870 1330 896 Q 1320 960 1190 966 Q 1060 960 1050 896 Z';
      o += `<path d="${bowl}" fill="${S}" ${RS(c)}/>` + rClip(bowl, [-100,-60,-20,20,60,100].map(dx => `<path d="M ${1190 + dx} 880 Q ${1190 + dx*1.05} 930 ${1190 + dx*0.8} 970" stroke="${SD}" stroke-width="3" fill="none"/>`).join(''));
      o += `<ellipse cx="1190" cy="898" rx="118" ry="16" fill="${c}" ${RS(c,2.5)}/><ellipse cx="1180" cy="894" rx="80" ry="8" fill="${lt(c,0.3)}"/>`;
      return o + `<circle cx="1272" cy="892" r="13" fill="#FFF8F2" stroke="#C9B6C6" stroke-width="2"/><circle cx="1268" cy="888" r="4" fill="#FFFFFF"/>`; } },
  balje: { label:'Zinkbalje', front: c => `<path d="M 1086 860 L 1100 950 H 1280 L 1294 860 Z" fill="#A8B0BA" stroke="#6A7280" stroke-width="3"/>` + [880, 920].map(y => `<path d="M ${1088 + (y-860)*0.15} ${y} H ${1292 - (y-860)*0.15}" stroke="#6A7280" stroke-width="4"/>`).join(''),
    draw: c => `<ellipse cx="1190" cy="860" rx="108" ry="22" fill="#6A7280"/><path d="M 1086 860 L 1100 950 H 1280 L 1294 860 Z" fill="#A8B0BA" stroke="#6A7280" stroke-width="3"/>` + [880, 920].map(y => `<path d="M ${1088 + (y-860)*0.15} ${y} H ${1292 - (y-860)*0.15}" stroke="#6A7280" stroke-width="4"/>`).join('')
      + `<path d="M 1100 860 Q 1190 830 1280 860 Q 1190 880 1100 860 Z" fill="${c}" ${RS(c)}/><path d="M 1086 858 q -20 0 -20 14 M 1294 858 q 20 0 20 14" stroke="#6A7280" stroke-width="6" fill="none"/>` },
}).map(([k, v]) => { const k8 = k === 'hundehus' ? 0.98 : 0.8, sc = f => c => `<g transform="translate(1190 950) scale(${k8}) translate(-1190 -950)">${f(c)}</g>`;
  /* de nye senge er tegnet lidt for store: skaleres ned omkring bunden, så de passer til kurven */
  return [k, Object.assign({}, v, { draw: sc(v.draw) }, v.front ? { front: sc(v.front) } : {})]; })));

Object.assign(PET_BED, {
  kasse: { x: 1110, y: 910 }, hule: { x: 1110, y: 946 }, sofa: { x: 1110, y: 894 }, hundehus: { x: 1110, y: 958 },
  skypude: { x: 1110, y: 902 }, muslingeskal: { x: 1110, y: 916 }, balje: { x: 1110, y: 888 },
});

const BOOK_SIDE = { vaeg:'r', vindue:'r', seng:'r', gulv:'r', hylde:'l', lampe:'l', ting:'l', dyreseng:'l' };
let roomBook = null, roomLight = true, roomCurtain = false, petInBed = false;

/* id'er i en inline-svg skal være unikke i hele siden */
function scopeIds(svg, p){ return svg.replace(/id="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`).replace(/href="#([^"]+)"/g, `href="#${p}$1"`); }
const SVGNS = 'http://www.w3.org/2000/svg';
/* en figur som billede inde i en scene — renderDoll nulstiller klip-tælleren, så den gemmes og sættes tilbage */
function dollUrl(st, opts){ const n = CLIPN; const u = svgUrl(renderDoll(st, opts)); CLIPN = n; return u; }
function svgEl(tag, attrs = {}, html){ const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; }

/* loft og væg fortsætter ud over kanten, så skærmen altid er fyldt */
function roomBleed(room){
  const W = '#5A3A28';
  let o = `<rect x="-900" y="-700" width="3400" height="2400" fill="${fdk(room.c.vaeg, 0.2)}"/>`;
  o += `<g>${wallBase(room.c.vaeg)}${roomItem('vaeg', room)}</g>`;
  for (const dx of [-1600, 1600]) o += `<g transform="translate(${dx} 0)">${wallBase(room.c.vaeg)}${roomItem('vaeg', room)}</g>`;
  o += `<rect x="-1700" y="0" width="5000" height="700" fill="url(#wallG)"/>`;
  o += `<rect x="-1700" y="-700" width="5000" height="700" fill="${W}"/>` + Array.from({ length: 22 }, (_, i) => `<rect x="${-1700 + i*240}" y="-700" width="60" height="700" fill="${fdk(W,0.25)}"/>`).join('');
  o += `<rect x="-1700" y="-22" width="5000" height="30" fill="#7A5236"/><rect x="-1700" y="4" width="5000" height="6" fill="${SHC}" opacity=".25"/>`;
  const F = '#7E5A42';
  o += `<rect x="-1700" y="700" width="5000" height="1000" fill="${F}"/>`;
  for (let i = 0; i < 14; i++){ const y = 700 + i*i*4 + i*8; o += `<path d="M -1700 ${y} H 3300" stroke="${fdk(F,0.15)}" stroke-width="2" opacity=".5"/>`; }
  for (let i = -14; i <= 14; i++) o += `<path d="M ${800 + i*90} 700 L ${800 + i*330} 1500" stroke="${fdk(F,0.15)}" stroke-width="2" opacity=".35"/>`;
  o += `<rect x="-1700" y="690" width="5000" height="22" fill="#7A5236"/><rect x="-1700" y="690" width="5000" height="6" fill="#9C6B43"/><rect x="-1700" y="712" width="5000" height="60" fill="${SHC}" opacity=".12"/>`;
  return o;
}
/* det rodede skrivebord mod væggen, med indretningsbogen øverst på bunken */
function desk(fresh){
  const W = '#6A4430', WL = '#8A5A3C', B = '#6B3FA0';
  let o = `<ellipse cx="690" cy="874" rx="150" ry="12" fill="${SHC}" opacity=".2"/>`;
  o += `<rect x="574" y="732" width="22" height="140" rx="5" fill="${W}" ${RS(W,2.5)}/><rect x="784" y="732" width="22" height="140" rx="5" fill="${W}" ${RS(W,2.5)}/><rect x="600" y="736" width="180" height="46" rx="5" fill="${WL}" ${RS(W,2.5)}/><circle cx="690" cy="759" r="5" fill="#E9C46A" stroke="#8A6420" stroke-width="2"/>`;
  o += `<rect x="558" y="716" width="264" height="20" rx="6" fill="${WL}" ${RS(W)}/><rect x="558" y="716" width="264" height="6" rx="3" fill="${lt(WL,0.3)}"/>`;
  /* papirer og en rulle der hænger ud over kanten */
  o += `<path d="M 720 714 L 790 706 L 794 716 L 724 724 Z" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="2"/><path d="M 744 714 L 780 710 M 742 719 L 770 716" stroke="#B9A48C" stroke-width="2"/>`;
  o += `<path d="M 770 716 C 790 716 800 730 798 760 C 796 784 786 790 776 784 C 786 774 786 744 770 732 Z" fill="#F4E4C4" stroke="#C9A97C" stroke-width="2.5"/><path d="M 784 740 q 4 14 0 30" stroke="#B9A48C" stroke-width="2" fill="none"/>`;
  /* blæk og fjerpen */
  o += `<path d="M 730 716 C 726 700 734 692 742 692 C 750 692 758 700 754 716 Z" fill="#2A2A3A" stroke="#14141E" stroke-width="2.5"/><rect x="734" y="686" width="16" height="8" rx="2" fill="#3A3A4A"/><path d="M 744 690 C 756 650 776 620 802 604 C 790 632 772 660 748 692" fill="#FFFFFF" stroke="#C9B6A6" stroke-width="2.5"/><path d="M 748 688 L 790 620" stroke="#C9B6A6" stroke-width="1.5"/>`;
  /* et lys der er brændt ned */
  o += `<rect x="694" y="686" width="20" height="30" rx="3" fill="#FFF3DC" stroke="#C9B6A6" stroke-width="2.5"/><path d="M 696 690 q -2 8 0 12 M 710 688 q 3 6 1 14" stroke="#FFF3DC" stroke-width="5" stroke-linecap="round"/><path d="M 704 686 q -7 -12 0 -24 q 7 12 0 24" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"><animate attributeName="opacity" values="1;.7;1" dur="1.1s" repeatCount="indefinite"/></path>` + glowAt(704, 672, 50, '#FFE27A');
  /* bunken med bøger, og bogen ovenpå */
  o += `<rect x="572" y="694" width="96" height="22" rx="3" fill="#7A2E3A" ${RS('#7A2E3A',2.5)}/><path d="M 576 700 H 664" stroke="#FFF3DC" stroke-width="3" stroke-dasharray="4 2" opacity=".6"/>`;
  o += `<rect x="580" y="676" width="84" height="18" rx="3" fill="#2E4A7A" ${RS('#2E4A7A',2.5)}/><path d="M 584 681 H 660" stroke="#FFF3DC" stroke-width="3" stroke-dasharray="4 2" opacity=".6"/>`;
  o += `<g class="bookglow"><ellipse cx="622" cy="650" rx="86" ry="44" fill="#FFE27A" opacity=".3"/></g>`;
  o += `<g class="book"><path d="M 578 674 L 582 646 L 662 646 L 666 674 Z" fill="#FFF6E0" stroke="#C9B6A6" stroke-width="2.5"/><path d="M 586 652 H 658 M 585 660 H 659 M 584 668 H 660" stroke="#E6D6C6" stroke-width="2"/>`;
  o += `<path d="M 572 642 L 668 642 L 672 650 L 576 650 Z" fill="${B}" ${RS(B)}/><path d="M 572 674 L 672 674 L 672 682 L 572 682 Z" fill="${B}" ${RS(B)}/><path d="M 572 642 L 572 682 L 580 682 L 580 650 Z" fill="${fdk(B,0.2)}"/>`;
  o += `<path d="M 606 644 L 620 636 L 634 644 Z" fill="#F2C14E"/>` + starP(622, 662, 8, '#F2C14E') + `<path d="M 646 674 L 646 700 L 652 694 L 658 700 L 658 674 Z" fill="#E0457A"/></g>`;
  o += [[596,616],[652,606],[624,592]].map(([x,y],i) => `<g class="tw" style="animation-delay:${i*0.5}s">${star4(x, y, 7, '#FFF6D0')}</g>`).join('');
  if (fresh) o += `<g><rect x="648" y="580" width="46" height="26" rx="13" fill="#FF3D8F" stroke="#FFFFFF" stroke-width="3"/><text x="671" y="599" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">NY</text></g>`;
  return o;
}
/* en træstol trukket lidt ud fra skrivebordet, set forfra */
function deskChair(){
  const W = '#7A4E35', D = '#5A3A26';
  let o = `<ellipse cx="1190" cy="770" rx="70" ry="9" fill="${SHC}" opacity=".2"/>`;
  o += `<rect x="1136" y="560" width="14" height="210" rx="5" fill="${W}" stroke="${D}" stroke-width="3"/><rect x="1230" y="560" width="14" height="210" rx="5" fill="${W}" stroke="${D}" stroke-width="3"/>`;
  o += `<path d="M 1130 572 Q 1190 536 1250 572 L 1250 600 Q 1190 574 1130 600 Z" fill="${W}" stroke="${D}" stroke-width="3"/>` + `<g transform="translate(1190 600)"><polygon points="${star5pts(0,0,13,6)}" fill="#E9C46A" stroke="#8A6420" stroke-width="2"/></g>`;
  o += `<rect x="1150" y="618" width="80" height="8" rx="3" fill="${W}" stroke="${D}" stroke-width="2"/>`;
  o += `<path d="M 1122 676 H 1258 L 1262 692 H 1118 Z" fill="${W}" stroke="${D}" stroke-width="3"/><rect x="1118" y="692" width="144" height="10" rx="3" fill="${D}"/><path d="M 1130 680 H 1250" stroke="#9C6B43" stroke-width="3"/>`;
  o += `<rect x="1126" y="700" width="12" height="74" rx="4" fill="${W}" stroke="${D}" stroke-width="2.5"/><rect x="1242" y="700" width="12" height="74" rx="4" fill="${W}" stroke="${D}" stroke-width="2.5"/><path d="M 1132 742 H 1248" stroke="${W}" stroke-width="6"/>`;
  return o;
}
/* stemning for et sted: mørke kanter, varme lyspletter og støv der svæver i lyset */
function placeMood(pools = [], opts = {}){
  const id = 'pm' + (CLIPN++);
  let o = `<defs><radialGradient id="${id}v" cx=".5" cy=".46" r=".72"><stop offset=".45" stop-color="#120A28" stop-opacity="0"/><stop offset="1" stop-color="#120A28" stop-opacity="${opts.vign || .78}"/></radialGradient>`
    + `<radialGradient id="${id}w" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC86A" stop-opacity="${opts.warm || .24}"/><stop offset="1" stop-color="#FFC86A" stop-opacity="0"/></radialGradient></defs>`;
  for (const [x, y, rx, ry] of pools) o += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}w)"/>`;
  if (opts.moon) o += opts.moon;
  o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="url(#${id}v)"/>`;
  if (!calm) for (let i = 0; i < 14; i++){ const x = (opts.dx || 380) + (i * 97) % (opts.dw || 900), y = 220 + (i * 61) % 560;
    /* støvet svæver med CSS (SVG'ens egne animationer får browseren til at regne hele scenen igennem i hvert billede) */
    o += `<circle class="mote" cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="#FFF3D0" style="--mx:${i % 2 ? 18 : -14}px;--dur:${5 + i % 4}s;--del:${(i * 0.7).toFixed(1)}s"/>`; }
  return `<g pointer-events="none">${o}</g>`;
}
function roomMood(lit, moonlit){ return placeMood(lit ? [[860, 360, 620, 460]] : [], { moon: moonlit ? `<path d="M 300 440 L 580 440 L 820 1000 L 180 1000 Z" fill="#BFD6FF" opacity=".07"/>` : '' }); }
/* spindelvæv i et hjørne, med en lille edderkop der dingler */
function cobweb(x, y, f){
  let o = '';
  for (let k = 0; k < 6; k++){ const a = k / 5 * Math.PI / 2; o += `M ${x} ${y} L ${x + f*Math.cos(a)*170} ${y + Math.sin(a)*170} `; }
  let arcs = '';
  for (const r of [50, 95, 140]){ let pts = []; for (let k = 0; k < 6; k++){ const a = k / 5 * Math.PI / 2; pts.push([x + f*Math.cos(a)*r, y + Math.sin(a)*r]); }
    arcs += `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((p, i) => `Q ${(pts[i][0] + p[0])/2 - f*6} ${(pts[i][1] + p[1])/2 - 6} ${p[0]} ${p[1]}`).join(' ') + ' '; }
  const sx = x + f*60, sy = y + 190;
  return `<g opacity=".55"><path d="${o}${arcs}" stroke="#E8E4F4" stroke-width="2" fill="none"/></g>`
    + `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 26;0 0" dur="4s" repeatCount="indefinite"/><path d="M ${sx} ${y+60} V ${sy-12}" stroke="#E8E4F4" stroke-width="1.5" opacity=".7"/><ellipse cx="${sx}" cy="${sy}" rx="11" ry="12" fill="#2A2238"/>`
    + [-1, 1].map(g => [0,1,2].map(k => `<path d="M ${sx + g*8} ${sy - 4 + k*5} q ${g*10} -6 ${g*16} ${2 + k*4}" stroke="#2A2238" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join('')).join('')
    + `<circle cx="${sx-4}" cy="${sy-2}" r="3" fill="#FFFFFF"/><circle cx="${sx+4}" cy="${sy-2}" r="3" fill="#FFFFFF"/><circle cx="${sx-4}" cy="${sy-1.5}" r="1.4" fill="#2A2238"/><circle cx="${sx+4}" cy="${sy-1.5}" r="1.4" fill="#2A2238"/></g>`;
}
/* økserne: de første står lænet op ad væggen bag kedlen, resten ligger i en voksende bunke oven på dem */
const AXE_SPOTS = [[1420,770,-5],[1460,772,6],[1380,772,-8],[1500,770,9],[1340,774,-4],[1540,774,-10],[1400,744,78],[1474,742,-74],[1440,726,22],[1512,722,-32],[1372,720,64],[1468,702,42]];
function axePile(n){
  let o = `<g data-hit="oekser"><ellipse cx="1440" cy="780" rx="${50 + n * 7}" ry="14" fill="#1A1238" opacity=".2"/>`;
  AXE_SPOTS.slice(0, n).forEach(([x, y, r], i) => { o += `<g transform="translate(${x} ${y - 52}) rotate(${r}) scale(1.9)">${axeSvg(1, i)}</g>`; });
  return o + `<rect x="1310" y="600" width="260" height="190" fill="#FFF" fill-opacity="0"/></g>`;
}
const BED_PLUSH = [[300, 642], [356, 646], [412, 642], [468, 646], [276, 690], [334, 694], [392, 690], [450, 694], [508, 690], [250, 646], [500, 640], [222, 692]];
function plushOnBed(list){
  const show = list.slice(-BED_PLUSH.length).reverse();
  let o = `<g data-hit="bamser">`;
  /* de bageste tegnes først */
  const items = show.map((k, i) => ({ k, p: BED_PLUSH[i] })).sort((a, b) => a.p[1] - b.p[1]);
  items.forEach(({ k, p }, i) => { o += `<g transform="translate(${p[0]} ${p[1] - 26}) rotate(${(i * 23) % 24 - 12})">${Arkade.plush(k, 0.9)}</g>`; });
  return o + `</g>`;
}
function roomScene(room){
  CLIPN = 0;
  const hero = heroState(), hasPet = hero.pet.kind !== 'ingen';
  const fresh = ROOM_SLOTS.some(s => Object.keys(s.cat).some(id => prog.fresh.includes(roomKey(s.id, id))));
  const win = VINDUE[room.vindue] || {};
  const bed = PET_BED[room.dyreseng] || PET_BED.kurv;
  const at = petInBed && hasPet ? bed : PET_SPOT;
  let o = `<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet">`;
  o += roomBleed(room);
  o += `<g data-hit="vaeg"><rect x="-1700" y="0" width="5000" height="690" fill="transparent"/></g><g data-hit="gulv-bg"><rect x="-1700" y="712" width="5000" height="900" fill="transparent"/></g>`;
  o += `<g data-hit="vindue">${roomItem('vindue', room)}${win.curtain && roomCurtain ? `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + closedCurtains(room.c.vindue, win.curtain === 2) : ''}</g>`;
  o += `<g data-hit="hylde"><g class="anim">${roomItem('hylde', room)}</g></g>`;
  o += `<g data-hit="gulv">${roomItem('gulv', room)}</g>`;
  /* økserne fra Øksebrønden hober sig op i hjørnet bag kedlen */
  if (axeCount()) o += axePile(axeCount());
  o += `<g data-hit="seng"><g class="anim">${roomItem('seng', room)}</g></g>`;
  /* bamserne fra gribemaskinen sidder på sengen, to rækker, de nyeste forrest */
  if (typeof Arkade !== 'undefined' && Arkade.myPlush().length) o += plushOnBed(Arkade.myPlush());
  o += `<g data-hit="bog"><g transform="translate(960 716) scale(1.15) translate(-556 -872)">${desk(fresh)}</g>${deskChair()}</g>`;
  o += `<g data-hit="ting"><g class="anim">${roomItem('ting', room)}</g></g>`;
  o += `<g data-hit="dyreseng"><g transform="translate(${BED_DX} 0)">${roomItem('dyreseng', room)}</g></g>`;
  /* figuren og dyret er billeder i scenen */
  o += `<g data-hit="figur"><g class="anim"><image href="${dollUrl(hero, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="650" y="266" width="340" height="700"/></g></g>`;
  if (hasPet) o += `<g data-hit="dyr" class="petg" style="transform:translate(${at.x - PET_SPOT.x}px,${at.y - PET_SPOT.y}px)"><g class="anim"><image href="${dollUrl(hero, { viewBox: VB.pet, petOnly: true })}" x="${PET_SPOT.x - 95}" y="${PET_SPOT.y - 203}" width="190" height="210"/></g></g>`;
  const bedF = (DYRESENG[room.dyreseng] || {}).front;
  if (hasPet && bedF) o += `<g class="bedfront${petInBed ? ' on' : ''}" pointer-events="none"><g transform="translate(${BED_DX} 0)">${bedF(room.c.dyreseng)}</g></g>`;
  o += `<g data-hit="lampe"><g class="anim">${roomItem('lampe', room)}</g></g>`;
  if (!roomLight){
    o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="#0B0A2E" opacity=".58" pointer-events="none"/>`;
    if (!(win.curtain && roomCurtain)) o += `<path d="M 300 440 L 580 440 L 860 1000 L 160 1000 Z" fill="#CFE0FF" opacity=".12" pointer-events="none"/>`;
  }
  o += roomMood(roomLight, !(win.curtain && roomCurtain));
  o += `<g class="fx" pointer-events="none"></g></svg>`;
  return scopeIds(o, 'rm');
}

function showRoom(){ showScreen('#room'); playMusic('byen'); roomBook = null; petInBed = false; renderRoom(); }
function placeUi(left, right){ return [ el('div', { class:'place-ui tl' }, left), el('div', { class:'place-ui tr' }, right) ]; }
function backBtn(label, fn){ return el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); goTo(fn); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + label }); }
function renderRoom(){
  const box = $('#roomBody'); box.innerHTML = '';
  box.append(el('div', { class:'scene-wrap', id:'roomScene' }),
    ...placeUi([ backBtn('Byen', showTown) ], [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); goTo(showHome); } }, html: ic('<path d="M10 6a2 2 0 1 1 2 2v1.5"/><path d="M12 9.5 3.5 16a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8z"/>') + 'Garderoben' }), starPill() ]));
  drawRoomScene();
  if (roomBook) box.append(roomBookEl());
}
function drawRoomScene(){
  const w = $('#roomScene'); w.innerHTML = roomScene(getRoom());
  const svg = w.querySelector('svg');
  svg.addEventListener('click', e => { const g = e.target.closest('[data-hit]'); if (g) roomTap(g.dataset.hit, g, svgPoint(svg, e)); });
}
function svgPoint(svg, e){ const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 800, y: 500 }; }
function replay(g, cls){ const a = g.querySelector('.anim') || g; a.classList.remove(cls); void a.getBoundingClientRect(); a.classList.add(cls); }
function sparkle(svg, x, y, n = 6, col = '#FFF6D0'){
  const fx = svg.querySelector('.fx'); if (!fx || calm) return;
  for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, d = 40 + Math.random() * 40;
    const s = svgEl('g', { class:'spark', style:`--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d).toFixed(0)}px` }, star4(x, y, 9 + Math.random()*6, col));
    fx.append(s); setTimeout(() => s.remove(), 900); }
}
function puff(svg, x, y, col){
  const fx = svg.querySelector('.fx'); if (!fx) return;
  for (let i = 0; i < 7; i++){ const c = svgEl('circle', { class:'puff', cx: x + (i%3 - 1) * 26, cy: y, r: 18 + (i%3)*8, fill: i%2 ? col : lt(col, 0.4), style:`animation-delay:${i*0.08}s;--dx:${(i%3-1)*30}px` });
    fx.append(c); setTimeout(() => c.remove(), 1700); }
}
function shootingStar(svg){
  const fx = svg.querySelector('.fx'); if (!fx) return;
  const g = svgEl('g', {}, rClip(WIN, `<g class="shooting"><path d="M 560 130 L 640 100" stroke="#FFF6D0" stroke-width="4" stroke-linecap="round" opacity=".8"/>${star4(560, 130, 9, '#FFFFFF')}</g>`).replace(/id="(k\d+)"/, 'id="rmshoot"').replace(/url\(#k\d+\)/, 'url(#rmshoot)'));
  fx.append(g); setTimeout(() => g.remove(), 1500);
}
/* små hjerter stiger op, når dyret har det rart */
function hearts(svg, x, y){
  const fx = svg.querySelector('.fx'); if (!fx) return;
  [0,1,2].forEach(i => { const hx = x + (i - 1) * 30, hy = y - i * 12, r = 10 + i * 2;
    const h = svgEl('path', { class:'zzz', d:`M ${hx} ${hy + r} C ${hx - r*2} ${hy - r*0.2} ${hx - r} ${hy - r*1.6} ${hx} ${hy - r*0.5} C ${hx + r} ${hy - r*1.6} ${hx + r*2} ${hy - r*0.2} ${hx} ${hy + r} Z`, fill:'#FF5FA8', stroke:'#FFFFFF', 'stroke-width':'2', style:`animation-delay:${i*0.3}s` });
    fx.append(h); setTimeout(() => h.remove(), 2600); });
}
function roomTap(hit, g, p){
  const svg = $('#roomScene svg'), room = getRoom();
  switch (hit){
    case 'bog': sfx.open(); openRoomBook(); return;
    case 'bamser': { const n = Arkade.myPlush().length; sfx.squeak(); replay(g, 'jiggle'); toast(n === 1 ? 'Din bamse fra gribemaskinen!' : `${n} bamser fra gribemaskinen!`); return; }
    case 'oekser': { const n = axeCount(); sfx.pick(); replay(g, 'jiggle'); toast(n >= AXE_MAX ? `${n} økser! Øksebrønden er udsolgt.` : n === 1 ? 'En økse fra Øksebrønden!' : `${n} økser fra Øksebrønden!`); return; }
    case 'lampe': sfx.pick(); roomLight = !roomLight; drawRoomScene(); return;
    case 'vindue': {
      const win = VINDUE[room.vindue] || {};
      if (win.curtain){ sfx.whoosh(); roomCurtain = !roomCurtain; drawRoomScene(); if (!roomCurtain) setTimeout(() => shootingStar($('#roomScene svg')), 400); }
      else { sfx.magic(); shootingStar(svg); }
      return; }
    case 'seng': sfx.wobble(); replay(g, 'boing'); sparkle(svg, p.x, p.y, 5); return;
    case 'hylde': sfx.pick(); replay(g, 'jiggle'); sparkle(svg, p.x, p.y, 6, '#FFE27A'); return;
    case 'ting':
      if (room.ting === 'kedel'){ sfx.wobble(); replay(g, 'jiggle'); puff(svg, 1405, 740, room.c.ting); }
      else { sfx.pick(); replay(g, 'wiggle'); sparkle(svg, p.x, p.y, 6, '#FFE27A'); }
      return;
    case 'dyreseng': case 'dyr': {
      const pg = svg.querySelector('.petg'); if (!pg){ sparkle(svg, p.x, p.y); return; }
      if (hit === 'dyr' && !petInBed){ sfx.pick(); replay(pg, 'hop'); hearts(svg, p.x, p.y - 60); return; }
      petInBed = !petInBed; sfx.whoosh();
      const bed = PET_BED[room.dyreseng] || PET_BED.kurv, at = petInBed ? bed : PET_SPOT;
      pg.style.transform = `translate(${at.x - PET_SPOT.x}px,${at.y - PET_SPOT.y}px)`;
      const bf = svg.querySelector('.bedfront'); if (bf) bf.classList.toggle('on', petInBed);
      if (petInBed) setTimeout(() => hearts(svg, bed.x, bed.y - 200), 900);
      return; }
    case 'figur': sfx.magic(); replay(g, 'hop'); sparkle(svg, p.x, p.y - 60, 7); return;
    default: sfx.pick(); sparkle(svg, p.x, p.y, 5);
  }
}

/* ---------- indretningsbogen ---------- */
function openRoomBook(slot){ roomBook = slot || roomBook || 'vaeg'; const old = $('#roomBody .rbook'); if (old) old.remove(); $('#roomBody').append(roomBookEl()); }
function closeRoomBook(){ sfx.undo(); roomBook = null; const b = $('#roomBody .rbook'); if (b){ b.classList.add('closing'); setTimeout(() => { b.remove(); drawRoomScene(); }, 260); } }
/* et tæt udsnit om én ting (uden lysskær), så den fylder sin plads i bogen; regnes ud én gang pr. ting */
const THUMB_VB = {};
function thumbVB(slot, room){
  if (slot === 'vaeg') return '0 0 1600 700';
  const k = slot + ':' + room[slot];
  if (THUMB_VB[k]) return THUMB_VB[k];
  let vb = ROOM_VB[slot];
  try {
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-9999px;top:0;width:1600px;height:1000px;visibility:hidden';
    host.innerHTML = roomSvg(room, { only: slot, viewBox: '0 0 1600 1000' });
    document.body.append(host);
    const g = host.querySelector('svg'); g.style.width = '1600px'; g.style.height = '1000px';
    g.querySelectorAll('.glow, animate, animateTransform, animateMotion').forEach(e => e.remove());
    const bb = g.getBBox(); host.remove();
    if (bb.width > 0 && bb.height > 0){
      let x = bb.x, y = bb.y, w = bb.width, h = bb.height;
      if (w < h * 0.9){ const nw = h * 0.9; x -= (nw - w) / 2; w = nw; }
      if (w > h * 1.8){ const nh = w / 1.8; y -= (nh - h) / 2; h = nh; }
      const pad = Math.max(w, h) * 0.06;
      vb = `${(x - pad).toFixed(0)} ${(y - pad).toFixed(0)} ${(w + 2*pad).toFixed(0)} ${(h + 2*pad).toFixed(0)}`;
    }
  } catch (e) {}
  return THUMB_VB[k] = vb;
}
/* en ting i bogen: svæver lidt over siden med en skygge under sig, ingen kasse */
function floatThing(src, label, cls, i, swatch){
  return el('button', { class:'rb-thing ' + cls, type:'button', 'aria-label': label, style:`--d:${(-i * 0.37).toFixed(2)}s` }, [
    el('span', { class:'rb-fl' }, [ src.startsWith('<') ? el('span', { class:'lockbub', html: src }) : el('img', { alt:'', src, class: swatch ? 'swatch' : '' }) ]),
    el('span', { class:'rb-sh', 'aria-hidden':'true' }),
    el('span', { class:'nm' }, label) ]);
}
const ROOM_COLORS = ['#7B4FD0','#4A3A9A','#2E4A7A','#43A3D3','#1F6F6A','#5FD0B0','#3E7A4A','#C98A1E','#FFC02E','#E07A45','#7A2E3A','#E0457A','#FF8FC7','#F4F2F8'];
function roomBookEl(){
  const room = getRoom(), slot = roomBook, s = ROOM_SLOTS.find(x => x.id === slot);
  const tabs = el('div', { class:'rb-tabs' }, ROOM_SLOTS.map((t, i) => {
    const fresh = Object.keys(t.cat).some(id => prog.fresh.includes(roomKey(t.id, id)));
    const b = floatThing(svgUrl(roomSvg(room, { only: t.id, viewBox: thumbVB(t.id, room) })), t.label, (t.id === slot ? 'sel' : '') + (fresh ? ' fresh' : ''), i, t.id === 'vaeg');
    b.addEventListener('click', () => { sfx.pick(); openRoomBook(t.id); });
    return b;
  }));
  const ids = roomIds(s);
  const items = el('div', { class:'rb-items', style:`--cols:${ids.length <= 3 ? ids.length : ids.length === 4 ? 2 : ids.length <= 6 ? 3 : 4}` });
  ids.forEach((id, i) => {
    const free = roomFree(slot, id), fresh = prog.fresh.includes(roomKey(slot, id));
    const prev = Object.assign({}, room, { [slot]: id });
    const b = floatThing(free ? svgUrl(roomSvg(prev, { only: slot, viewBox: thumbVB(slot, prev) })) : bubbleIcon('rum'), free ? s.cat[id].label : 'I en boble',
      (room[slot] === id ? 'sel' : '') + (free ? '' : ' locked') + (fresh ? ' fresh' : ''), i, slot === 'vaeg');
    b.addEventListener('click', () => {
      if (!free){ sfx.nope(); toast('Den kan du finde i Boblebutikken'); return; }
      sfx.magic(); if (fresh){ prog.fresh = prog.fresh.filter(k => k !== roomKey(slot, id)); saveProg(); }
      const r = getRoom(); r[slot] = id; setRoom(r); drawRoomScene(); openRoomBook(slot);
    });
    items.append(b);
  });
  const cols = slot === 'vaeg' ? ROOM_WALL_COLORS : ROOM_COLORS;
  const colors = el('div', { class:'room-colors' }, cols.map(col => el('button', { class:'dot' + (room.c[slot] === col ? ' sel' : ''), type:'button', 'aria-label':'Farve', style:`background:${col}`,
    on:{ click: () => { sfx.color(); const r = getRoom(); r.c[slot] = col; setRoom(r); drawRoomScene(); openRoomBook(slot); } } })));
  return el('div', { class:'rbook ' + (BOOK_SIDE[slot] === 'l' ? 'left' : 'right') }, [
    el('div', { class:'rb-cover' }, [
      el('div', { class:'rb-page pl' }, [ el('h3', {}, 'Indretning'), tabs ]),
      el('div', { class:'rb-page pr' }, [ el('h3', {}, s.label), items, colors ]),
    ]),
    el('button', { class:'rb-close', type:'button', 'aria-label':'Luk bogen', on:{ click: closeRoomBook }, html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' }),
  ]);
}
