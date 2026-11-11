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
const glowAt = (x, y, r, c) => { const id = 'gl' + (CLIPN++); return `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".45" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`; };
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
      let o = `<path d="M ${x+10} 0 V 96" stroke="#3A3046" stroke-width="4" stroke-dasharray="7 4"/>` + glowAt(x, y, 150, lt(c,0.5));
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
  globus: { label:'Stjerneglobus', draw: c => { const W = '#5A3A26', WL = '#7A5236', B = '#C9952E', P = mixC('#D9B77A', c, 0.25), gx = 1415, gy = 700, r = 92;
      const leg = (x, w) => `<path d="M ${x-w} 748 Q ${x-w*1.5} 790 ${x-w} 820 Q ${x-w*1.8} 850 ${x-w*0.9} 900 L ${x+w*0.9} 900 Q ${x+w*1.8} 850 ${x+w} 820 Q ${x+w*1.5} 790 ${x+w} 748 Z" fill="${WL}" stroke="${W}" stroke-width="3"/><ellipse cx="${x}" cy="820" rx="${w*1.6}" ry="6" fill="${W}"/>`;
      let o = `<ellipse cx="${gx}" cy="936" rx="130" ry="14" fill="${SHC}" opacity=".22"/>`;
      o += leg(gx, 7) + `<path d="M 1320 912 L 1510 912 L 1500 932 L 1330 932 Z" fill="${WL}" stroke="${W}" stroke-width="3"/><circle cx="${gx}" cy="906" r="14" fill="${WL}" stroke="${W}" stroke-width="3"/>`;
      o += `<ellipse cx="${gx}" cy="${gy+46}" rx="128" ry="26" fill="${W}"/>`;
      o += `<circle cx="${gx}" cy="${gy}" r="${r}" fill="${P}" stroke="#6A4A2A" stroke-width="4"/>` + rClip(`M ${gx} ${gy-r} A ${r} ${r} 0 1 1 ${gx-0.1} ${gy-r} Z`,
        `<ellipse cx="${gx}" cy="${gy}" rx="${r*0.45}" ry="${r}" fill="none" stroke="#8A6A3A" stroke-width="2" opacity=".6"/><path d="M ${gx-r} ${gy} H ${gx+r} M ${gx-r} ${gy-40} H ${gx+r} M ${gx-r} ${gy+40} H ${gx+r}" stroke="#8A6A3A" stroke-width="2" opacity=".5"/>`
        + `<path d="M 1360 650 L 1392 668 L 1420 640 L 1450 660 M 1380 720 L 1414 740 L 1446 716 L 1470 744" stroke="#5A3A1A" stroke-width="2.5" fill="none"/>` + [[1360,650],[1392,668],[1420,640],[1450,660],[1380,720],[1414,740],[1446,716],[1470,744]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#3A2410"/>`).join('')
        + crescent(1370, 760, 12, '#5A3A1A', .8, 20) + `<path d="M ${gx+40} ${gy-r} A ${r} ${r} 0 0 1 ${gx+40} ${gy+r} L ${gx+r+10} ${gy+r} L ${gx+r+10} ${gy-r} Z" fill="${SHC}" opacity=".25"/><path d="M 1352 650 Q 1340 680 1346 710" stroke="#FFF6E0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5"/>`);
      o += `<path d="M ${gx-r-10} ${gy} A ${r+10} ${r+10} 0 0 1 ${gx} ${gy-r-10}" stroke="${B}" stroke-width="9" fill="none"/><path d="M ${gx} ${gy-r-10} A ${r+10} ${r+10} 0 0 1 ${gx+r+10} ${gy}" stroke="${B}" stroke-width="9" fill="none"/><circle cx="${gx}" cy="${gy-r-14}" r="7" fill="${B}" stroke="#8A6420" stroke-width="2"/>`;
      o += `<path d="M ${gx-128} ${gy+46} A 128 26 0 0 0 ${gx+128} ${gy+46}" fill="none" stroke="${WL}" stroke-width="18"/><path d="M ${gx-128} ${gy+46} A 128 26 0 0 0 ${gx+128} ${gy+46}" fill="none" stroke="#E9D4A8" stroke-width="4" stroke-dasharray="2 10"/>`;
      o += leg(gx - 104, 9) + leg(gx + 104, 9);
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
      let o = `<path d="M 1086 950 V 810 Q 1086 792 1104 792 H 1276 Q 1294 792 1294 810 V 950 Z" fill="${S}" ${RS(c)}/>`;
      o += [1100,1140,1180,1220,1260].map(x => `<rect x="${x}" y="772" width="24" height="26" rx="8" fill="${S}" ${RS(c,2.5)}/>`).join('');
      o += tower(1076) + tower(1304);
      o += `<path d="M 1124 950 V 868 Q 1124 812 1190 812 Q 1256 812 1256 868 V 950 Z" fill="#3A2340" ${RS(c)}/><path d="M 1134 950 V 870 Q 1134 822 1190 822 Q 1246 822 1246 870 V 950" fill="none" stroke="${lt(c,0.35)}" stroke-width="5"/><ellipse cx="1190" cy="940" rx="56" ry="10" fill="${c}" opacity=".9"/>`;
      o += `<path d="M 1076 690 V 664 l 22 8 l -22 8" fill="${R}" stroke="#8A1A4A" stroke-width="2"/><path d="M 1304 690 V 664 l 22 8 l -22 8" fill="${R}" stroke="#8A1A4A" stroke-width="2"/>`;
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
const ROOM_VB = { vaeg:'0 0 1600 700', vindue:'200 50 500 520', seng:'30 220 560 660', hylde:'1050 50 440 340', lampe:'680 0 440 380', gulv:'460 780 720 220', ting:'1240 440 360 530', dyreseng:'990 650 350 320' };
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
    const wall = opts.only === 'vaeg' ? '' : `<rect x="0" y="0" width="1600" height="1000" fill="${ROOM_DEFAULT.c.vaeg}" opacity=".18"/>`;
    const inner = opts.only === 'vaeg' ? wallBase(room.c.vaeg) + roomItem('vaeg', room) + wallTop() : roomItem(opts.only, room);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${wall}${inner}</svg>`;
  }
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">`;
  o += wallBase(room.c.vaeg) + roomItem('vaeg', room) + wallTop() + roomFloor();
  o += roomItem('vindue', room) + roomItem('hylde', room) + roomItem('gulv', room) + roomItem('seng', room) + roomItem('ting', room) + `<g transform="translate(-30 0)">${roomItem('dyreseng', room)}</g>` + roomItem('lampe', room);
  return o + `<rect x="0" y="0" width="1600" height="1000" fill="${SHC}" opacity=".06"/></svg>`;
}

/* ---------- låse for værelset ---------- */
const roomKey = (slot, id) => 'rum:' + slot + '.' + id;
const roomFree = (slot, id) => (ROOM_FREE[slot] || []).includes(id) || prog.unlocked.includes(roomKey(slot, id));
function roomLocked(){ const out = []; for (const s of ROOM_SLOTS) for (const id of Object.keys(s.cat)) if (!roomFree(s.id, id)) out.push(['rum', s.id + '.' + id]); return out; }
function getRoom(){
  const r = Object.assign({}, ROOM_DEFAULT, prog.room || {}); r.c = Object.assign({}, ROOM_DEFAULT.c, (prog.room || {}).c || {});
  for (const s of ROOM_SLOTS) if (!s.cat[r[s.id]] || !roomFree(s.id, r[s.id])) r[s.id] = ROOM_DEFAULT[s.id];
  return r;
}
function setRoom(r){ prog.room = r; saveProg(); }

/* ================= Værelset som sted: hele skærmen, ting man kan trykke på, og indretningsbogen ================= */
/* hvor dyret står: ved siden af figuren, eller i sin seng (fødder i rumkoordinater) */
const PET_SPOT = { x: 1000, y: 952 };
const PET_BED = { kurv: { x: 1160, y: 888 }, pude: { x: 1160, y: 885 }, slot: { x: 1160, y: 942 } };
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
/* stemning for et sted: mørke kanter, varme lyspletter og støv der svæver i lyset */
function placeMood(pools = [], opts = {}){
  const id = 'pm' + (CLIPN++);
  let o = `<defs><radialGradient id="${id}v" cx=".5" cy=".46" r=".72"><stop offset=".45" stop-color="#120A28" stop-opacity="0"/><stop offset="1" stop-color="#120A28" stop-opacity="${opts.vign || .78}"/></radialGradient>`
    + `<radialGradient id="${id}w" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC86A" stop-opacity="${opts.warm || .24}"/><stop offset="1" stop-color="#FFC86A" stop-opacity="0"/></radialGradient></defs>`;
  for (const [x, y, rx, ry] of pools) o += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}w)"/>`;
  if (opts.moon) o += opts.moon;
  o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="url(#${id}v)"/>`;
  if (!calm) for (let i = 0; i < 14; i++){ const x = (opts.dx || 380) + (i * 97) % (opts.dw || 900), y = 220 + (i * 61) % 560;
    o += `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="#FFF3D0" opacity="0"><animate attributeName="opacity" values="0;.7;0" dur="${5 + i % 4}s" begin="${(i * 0.7).toFixed(1)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;${(i%2 ? 18 : -14)} -40" dur="${5 + i % 4}s" begin="${(i * 0.7).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }
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
  o += `<g data-hit="seng"><g class="anim">${roomItem('seng', room)}</g></g>`;
  o += `<g data-hit="bog"><g transform="translate(468 0)">${desk(fresh)}</g></g>`;
  o += `<g data-hit="ting"><g class="anim">${roomItem('ting', room)}</g></g>`;
  o += `<g data-hit="dyreseng"><g transform="translate(-30 0)">${roomItem('dyreseng', room)}</g></g>`;
  /* figuren og dyret er billeder i scenen */
  o += `<g data-hit="figur"><g class="anim"><image href="${dollUrl(hero, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="650" y="266" width="340" height="700"/></g></g>`;
  if (hasPet) o += `<g data-hit="dyr" class="petg" style="transform:translate(${at.x - PET_SPOT.x}px,${at.y - PET_SPOT.y}px)"><g class="anim"><image href="${dollUrl(hero, { viewBox: VB.pet, petOnly: true })}" x="${PET_SPOT.x - 95}" y="${PET_SPOT.y - 203}" width="190" height="210"/></g></g>`;
  const bedF = (DYRESENG[room.dyreseng] || {}).front;
  if (hasPet && bedF) o += `<g class="bedfront${petInBed ? ' on' : ''}" pointer-events="none"><g transform="translate(-30 0)">${bedF(room.c.dyreseng)}</g></g>`;
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
function roomBookEl(){
  const room = getRoom(), slot = roomBook, s = ROOM_SLOTS.find(x => x.id === slot);
  const tabs = el('div', { class:'rb-tabs' }, ROOM_SLOTS.map(t => {
    const fresh = Object.keys(t.cat).some(id => prog.fresh.includes(roomKey(t.id, id)));
    return el('button', { class:'rb-tab' + (t.id === slot ? ' sel' : '') + (fresh ? ' fresh' : ''), type:'button', on:{ click: () => { sfx.pick(); openRoomBook(t.id); } } },
      [ el('img', { alt:'', src: svgUrl(roomSvg(room, { only: t.id, viewBox: ROOM_VB[t.id] })) }), el('span', {}, t.label) ]);
  }));
  const items = el('div', { class:'room-items' });
  for (const id of Object.keys(s.cat)){
    const free = roomFree(slot, id), fresh = prog.fresh.includes(roomKey(slot, id));
    const prev = Object.assign({}, room, { [slot]: id });
    const b = el('button', { class:'room-item' + (room[slot] === id ? ' sel' : '') + (free ? '' : ' locked') + (fresh ? ' fresh' : ''), type:'button', 'aria-label': s.cat[id].label },
      [ free ? el('img', { alt:'', src: svgUrl(roomSvg(prev, { only: slot, viewBox: ROOM_VB[slot] })) }) : el('span', { class:'lockbub', html: bubbleIcon('rum') }), el('span', { class:'nm' }, free ? s.cat[id].label : 'Findes i en boble') ]);
    b.addEventListener('click', () => {
      if (!free){ sfx.nope(); toast('Den kan du finde i Boblebutikken'); return; }
      sfx.magic(); if (fresh){ prog.fresh = prog.fresh.filter(k => k !== roomKey(slot, id)); saveProg(); }
      const r = getRoom(); r[slot] = id; setRoom(r); drawRoomScene(); openRoomBook(slot);
    });
    items.append(b);
  }
  const cols = slot === 'vaeg' ? ROOM_WALL_COLORS : COLORS;
  const colors = el('div', { class:'room-colors' }, cols.map(col => el('button', { class:'dot' + (room.c[slot] === col ? ' sel' : ''), type:'button', 'aria-label':'Farve', style:`background:${col}`,
    on:{ click: () => { sfx.color(); const r = getRoom(); r.c[slot] = col; setRoom(r); drawRoomScene(); openRoomBook(slot); } } })));
  const book = el('div', { class:'rbook ' + (BOOK_SIDE[slot] === 'l' ? 'left' : 'right') }, [
    el('div', { class:'rb-cover' }, [
      el('div', { class:'rb-page pl' }, [ el('h3', {}, 'Indretning'), tabs ]),
      el('div', { class:'rb-page pr' }, [ el('h3', {}, s.label), items, el('p', { class:'rb-sub' }, 'Farve'), colors ]),
    ]),
    el('button', { class:'rb-close', type:'button', 'aria-label':'Luk bogen', on:{ click: closeRoomBook }, html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' }),
  ]);
  return book;
}
