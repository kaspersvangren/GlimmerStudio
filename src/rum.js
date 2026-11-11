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
const VAEG = {
  stjerner: { label:'Stjernetapet', draw: c => { let o = ''; for (let y = 50; y < 690; y += 110) for (let x = (y/110 % 2) * 80 + 40; x < 1600; x += 160) o += starP(x, y, 10, lt(c, 0.35), .55); return o; } },
  striber: { label:'Stribet tapet', draw: c => { let o = ''; for (let x = 0; x < 1600; x += 120) o += `<rect x="${x}" y="0" width="60" height="700" fill="${lt(c, 0.12)}"/>`; return o + Array.from({length: 14}, (_, i) => `<path d="M ${i*120+90} 0 V 700" stroke="${lt(c,0.3)}" stroke-width="3" stroke-dasharray="2 14"/>`).join(''); } },
  maaner: { label:'Månetapet', draw: c => { let o = ''; for (let y = 70; y < 690; y += 130) for (let x = (y/130 % 2) * 100 + 60; x < 1600; x += 200){ o += moon(x, y, 18, lt(c, 0.45), .85) + `<circle cx="${x+70}" cy="${y+40}" r="4" fill="${lt(c,0.4)}" opacity=".6"/>`; } return o; } },
  skyer: { label:'Skytapet', draw: c => { let o = ''; const cl = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${lt(c, 0.25)}" opacity=".7"><circle cx="0" cy="0" r="30"/><circle cx="34" cy="-12" r="38"/><circle cx="74" cy="0" r="28"/><rect x="0" y="0" width="74" height="28"/></g>`;
      for (let y = 80; y < 680; y += 170) for (let x = (y/170 % 2) * 180 + 40; x < 1600; x += 360) o += cl(x, y, 1); return o; } },
  blomster: { label:'Blomstertapet', draw: c => { let o = ''; const fl = (x, y) => [0,72,144,216,288].map(a => `<ellipse cx="${x + 11*Math.cos(a*Math.PI/180)}" cy="${y + 11*Math.sin(a*Math.PI/180)}" rx="9" ry="6" transform="rotate(${a} ${x + 11*Math.cos(a*Math.PI/180)} ${y + 11*Math.sin(a*Math.PI/180)})" fill="${lt(c,0.4)}" opacity=".7"/>`).join('') + `<circle cx="${x}" cy="${y}" r="5" fill="${lt(c,0.65)}"/>`;
      for (let y = 60; y < 690; y += 120) for (let x = (y/120 % 2) * 90 + 40; x < 1600; x += 180) o += fl(x, y) + `<path d="M ${x+50} ${y+50} q 14 -10 26 0" stroke="${lt(c,0.3)}" stroke-width="3" fill="none" opacity=".6"/>`; return o; } },
};

/* ---------- vinduet: nattehimmel med måne, rammen og gardinerne skifter ---------- */
const WIN = 'M 300 440 L 300 200 C 300 130 360 100 440 100 C 520 100 580 130 580 200 L 580 440 Z';
function nightSky(d){
  return `<path d="${d}" fill="#26306E"/>` + rClip(d, `<rect x="250" y="80" width="400" height="380" fill="url(#skyG)"/>${moon(500, 180, 30, '#FFF1B8')}`
    + [[340,160],[380,250],[460,140],[540,300],[360,360],[520,390],[430,320]].map(([x,y],i) => starP(x, y, i%2 ? 5 : 7, '#FFF6D0', .9)).join('')
    + `<path d="M 300 440 C 360 380 420 400 470 370 C 520 340 560 380 580 360 L 580 440 Z" fill="#1A2150" opacity=".8"/>`)
    + `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2462"/><stop offset="1" stop-color="#5A4AA8"/></linearGradient></defs>`;
}
function windowFrame(){
  const W = '#9C6B43';
  return `<path d="${WIN}" fill="none" stroke="${W}" stroke-width="18" stroke-linejoin="round"/><path d="${WIN}" fill="none" stroke="${fdk(W,0.4)}" stroke-width="3"/>`
    + `<path d="M 440 104 V 440 M 304 280 H 576" stroke="${W}" stroke-width="10"/><rect x="280" y="436" width="320" height="22" rx="6" fill="${W}" ${RS(W)}/><rect x="280" y="436" width="320" height="7" rx="3" fill="${lt(W,0.3)}"/>`;
}
function curtain(c, side, pattern){
  const f = side, x0 = side < 0 ? 270 : 610;
  const d = side < 0 ? 'M 250 80 L 350 80 C 340 200 330 300 360 370 C 340 380 320 390 300 400 C 290 440 296 500 300 540 L 240 540 C 250 400 240 220 250 80 Z'
                     : 'M 650 80 L 550 80 C 560 200 570 300 540 370 C 560 380 580 390 600 400 C 610 440 604 500 600 540 L 660 540 C 650 400 660 220 650 80 Z';
  let o = `<path d="${d}" fill="${c}" ${RS(c)}/>`;
  o += rClip(d, [0,1,2].map(i => `<path d="M ${x0 + f*(-10 + i*28)} 80 C ${x0 + f*(i*20)} 240 ${x0 + f*(-6 + i*24)} 380 ${x0 + f*(-14 + i*22)} 540" stroke="${sd(c,0.35)}" stroke-width="8" fill="none" opacity=".45"/>`).join('')
    + (pattern ? Array.from({length: 12}, (_, i) => starP(x0 + f*((i%3)*26 - 18), 110 + Math.floor(i/3)*110 + (i%3)*30, 7, lt(c,0.55), .9)).join('') : ''));
  const tie = side < 0 ? [302, 372] : [598, 372];
  o += `<ellipse cx="${tie[0]}" cy="${tie[1]}" rx="22" ry="9" transform="rotate(${side*-20} ${tie[0]} ${tie[1]})" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/>`;
  return o;
}
const VINDUE = {
  gardiner: { label:'Gardiner', draw: c => nightSky(WIN) + windowFrame() + `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + curtain(c, -1) + curtain(c, 1) },
  stjernegardiner: { label:'Stjernegardiner', draw: c => nightSky(WIN) + windowFrame() + `<rect x="236" y="70" width="428" height="16" rx="8" fill="#7A5236"/>` + curtain(c, -1, true) + curtain(c, 1, true)
      + `<path d="M 236 78 L 664 78 L 664 120 Q 610 150 556 120 Q 502 150 450 120 Q 398 150 344 120 Q 290 150 236 120 Z" fill="${c}" ${RS(c)}/><path d="M 236 108 Q 290 138 344 108 Q 398 138 450 108 Q 502 138 556 108 Q 610 138 664 108" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="3 6"/>` },
  rundt: { label:'Rundt vindue', draw: c => { const d = 'M 440 120 A 150 150 0 1 1 439.9 120 Z';
      return nightSky(d) + `<circle cx="440" cy="270" r="150" fill="none" stroke="${c}" stroke-width="26"/><circle cx="440" cy="270" r="163" fill="none" stroke="${rOut(c)}" stroke-width="3"/><circle cx="440" cy="270" r="137" fill="none" stroke="${rOut(c)}" stroke-width="3"/>`
        + [0,45,90,135,180,225,270,315].map(a => `<circle cx="${440 + 150*Math.cos(a*Math.PI/180)}" cy="${270 + 150*Math.sin(a*Math.PI/180)}" r="6" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`).join('')
        + `<path d="M 440 120 V 420 M 290 270 H 590" stroke="${c}" stroke-width="8"/>`; } },
  farvet: { label:'Farvet glas', draw: c => { const panes = [[c,'M 300 200 C 300 130 360 100 440 100 L 440 200 Z'],[lt(c,0.35),'M 440 100 C 520 100 580 130 580 200 L 440 200 Z'],['#43A3D3','M 300 200 H 440 V 320 H 300 Z'],['#FFC02E','M 440 200 H 580 V 320 H 440 Z'],[lt(c,0.2),'M 300 320 H 440 V 440 H 300 Z'],['#5FD0B0','M 440 320 H 580 V 440 H 440 Z']];
      return panes.map(([col, d]) => `<path d="${d}" fill="${col}" opacity=".85"/>`).join('') + moon(440, 270, 46, '#FFF1B8') + starP(370, 160, 14, '#FFF6D0') + starP(520, 380, 12, '#FFF6D0')
        + `<path d="M 300 200 H 580 M 300 320 H 580 M 440 100 V 440" stroke="#3A2340" stroke-width="6"/>` + windowFrame().replace(/M 440 104 V 440 M 304 280 H 576/, 'M 0 0'); } },
};

/* ---------- sengen (venstre, står på gulvet) ---------- */
function blanket(c, x1, x2, y1, y2){
  const d = `M ${x1} ${y1} Q ${(x1+x2)/2} ${y1-14} ${x2} ${y1} L ${x2+8} ${y2} Q ${(x1+x2)/2} ${y2+16} ${x1-8} ${y2} Z`;
  return `<path d="${d}" fill="${c}" ${RS(c)}/>` + rClip(d, `<path d="M ${x1} ${y1+40} H ${x2+10}" stroke="${lt(c,0.35)}" stroke-width="10" opacity=".7"/>` + [0,1,2,3].map(i => starP(x1 + 60 + i*90, y1 + 90 + (i%2)*30, 9, lt(c,0.5), .8)).join('') + `<path d="M ${x2-40} ${y1} L ${x2+10} ${y2} L ${x2+20} ${y2} L ${x2+20} ${y1} Z" fill="${sd(c,0.35)}" opacity=".5"/>`);
}
function pillow(x, y){ return `<path d="M ${x} ${y} Q ${x+60} ${y-22} ${x+120} ${y} Q ${x+128} ${y+30} ${x+120} ${y+52} Q ${x+60} ${y+64} ${x} ${y+52} Q ${x-8} ${y+26} ${x} ${y} Z" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/><path d="M ${x+20} ${y+16} Q ${x+60} ${y+6} ${x+100} ${y+16}" stroke="#E6D6C6" stroke-width="5" fill="none"/>`; }
const SENG = {
  enkel: { label:'Træseng', draw: c => { const W = '#9C6B43';
      return `<rect x="70" y="500" width="40" height="350" rx="10" fill="${W}" ${RS(W)}/><path d="M 80 520 Q 210 470 300 520 L 300 650 L 80 650 Z" fill="${W}" ${RS(W)}/>${moon(190, 570, 26, lt(W,0.35))}`
        + `<rect x="90" y="650" width="440" height="110" rx="12" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/>` + pillow(120, 610) + blanket(c, 200, 520, 640, 790)
        + `<rect x="70" y="760" width="480" height="40" rx="8" fill="${W}" ${RS(W)}/><rect x="80" y="796" width="26" height="60" rx="6" fill="${fdk(W,0.2)}"/><rect x="510" y="796" width="26" height="60" rx="6" fill="${fdk(W,0.2)}"/>`; } },
  himmelseng: { label:'Himmelseng', draw: c => { const W = '#7A5236';
      let o = `<rect x="70" y="250" width="22" height="600" rx="8" fill="${W}" ${RS(W)}/><rect x="528" y="250" width="22" height="600" rx="8" fill="${W}" ${RS(W)}/>`;
      o += `<path d="M 60 250 L 560 250 L 560 300 Q 495 340 435 300 Q 375 340 310 300 Q 245 340 185 300 Q 125 340 60 300 Z" fill="${c}" ${RS(c)}/><path d="M 60 288 Q 125 328 185 288 Q 245 328 310 288 Q 375 328 435 288 Q 495 328 560 288" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="3 6"/>`;
      o += `<path d="M 92 300 C 130 420 110 560 140 700 L 100 700 L 92 300 Z" fill="${lt(c,0.25)}" opacity=".75"/><path d="M 528 300 C 490 420 510 560 480 700 L 520 700 L 528 300 Z" fill="${lt(c,0.25)}" opacity=".75"/>`;
      o += `<path d="M 92 520 Q 210 480 300 520 L 300 650 L 92 650 Z" fill="${W}" ${RS(W)}/>${starP(196, 572, 18, '#F2C14E')}`;
      return o + `<rect x="92" y="650" width="436" height="110" rx="12" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/>` + pillow(120, 610) + blanket(c, 200, 520, 640, 790)
        + `<rect x="70" y="760" width="480" height="40" rx="8" fill="${W}" ${RS(W)}/>`; } },
  skyseng: { label:'Skyseng', draw: c => { const S = '#FFFFFF', s2 = '#DCD6F2';
      const cloud = 'M 90 800 C 50 800 50 740 90 730 C 80 680 140 660 170 690 C 190 640 270 640 290 690 C 320 650 400 660 410 700 C 450 670 520 690 520 740 C 560 750 560 800 520 800 Z';
      let o = `<path d="M 100 650 C 80 590 140 540 190 570 C 210 520 300 520 320 570 C 350 545 400 560 400 600 L 400 680 L 100 680 Z" fill="${S}" stroke="${s2}" stroke-width="4"/>`;
      o += pillow(130, 620) + `<path d="${cloud}" fill="${S}" stroke="${s2}" stroke-width="4"/>` + blanket(c, 200, 500, 660, 770);
      return o + [[120,560],[460,600],[300,540]].map(([x,y]) => starP(x, y, 10, '#FFE27A')).join('') + `<path d="M 100 810 Q 300 830 520 810" stroke="${s2}" stroke-width="6" fill="none" opacity=".7"/>`; } },
  maaneseng: { label:'Måneseng', draw: c => { const W = '#9C6B43';
      let o = `<path d="M 90 650 C 40 560 80 430 200 400 C 150 450 140 560 220 620 L 220 650 Z" fill="#F2C14E" stroke="#B98516" stroke-width="4"/>`;
      o += `<rect x="90" y="650" width="440" height="110" rx="12" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/>` + pillow(130, 610) + blanket(c, 200, 520, 640, 790);
      return o + `<rect x="70" y="760" width="480" height="40" rx="20" fill="${lt(c,0.15)}" ${RS(c)}/>` + [140,250,360,470].map(x => `<circle cx="${x}" cy="780" r="6" fill="#F2C14E"/>`).join('') + starP(250, 470, 12, '#FFE27A') + starP(300, 420, 8, '#FFE27A'); } },
};

/* ---------- hylden (højre væg) ---------- */
function shelfBoard(){ const W = '#9C6B43'; return `<rect x="1070" y="300" width="400" height="24" rx="6" fill="${W}" ${RS(W)}/><rect x="1070" y="300" width="400" height="8" rx="4" fill="${lt(W,0.3)}"/><path d="M 1110 324 L 1110 360 L 1140 324 M 1430 324 L 1430 360 L 1400 324" stroke="${fdk(W,0.3)}" stroke-width="8" stroke-linejoin="round" fill="none"/>`; }
const HYLDE = {
  boeger: { label:'Bøger', draw: c => { const cols = [c, '#E0457A', '#43A3D3', '#F2C14E', lt(c,0.3), '#5FD0B0', '#9C6B43']; let x = 1090, o = '';
      cols.forEach((col, i) => { const w = 26 + (i*7)%14, h = 100 + (i*13)%40; o += `<rect x="${x}" y="${300-h}" width="${w}" height="${h}" rx="4" fill="${col}" ${RS(col,2.5)}/><path d="M ${x+5} ${300-h+16} H ${x+w-5} M ${x+5} ${300-22} H ${x+w-5}" stroke="${lt(col,0.5)}" stroke-width="3"/>`; x += w + 4; });
      o += `<g transform="rotate(-18 ${x+40} 300)"><rect x="${x+20}" y="190" width="30" height="110" rx="4" fill="${c}" ${RS(c,2.5)}/></g>` + `<rect x="1330" y="270" width="110" height="30" rx="4" fill="#E0457A" ${RS('#E0457A',2.5)}/><rect x="1336" y="244" width="96" height="26" rx="4" fill="${c}" ${RS(c,2.5)}/>`;
      return shelfBoard() + o; } },
  eliksirer: { label:'Eliksirer', draw: c => { const B = (x, col, h, w) => { const neck = `M ${x-8} ${300-h} h 16 v 24 C ${x+w} ${300-h+40} ${x+w} 300 ${x} 300 C ${x-w} 300 ${x-w} ${300-h+40} ${x-8} ${300-h+24} Z`;
        return `<path d="${neck}" fill="#E8F6FF" fill-opacity=".5" stroke="${R_INK}" stroke-width="3"/>` + rClip(neck, `<rect x="${x-w}" y="${300-h*0.55}" width="${2*w}" height="${h}" fill="${col}" opacity=".85"/><circle cx="${x-6}" cy="${300-h*0.4}" r="4" fill="#FFF" opacity=".7"/>`) + `<rect x="${x-10}" y="${300-h-12}" width="20" height="14" rx="3" fill="#9C6B43" ${RS('#9C6B43',2)}/><path d="M ${x-w*0.6} ${300-h*0.7} q 3 -14 8 -18" stroke="#FFF" stroke-width="3" fill="none" opacity=".7"/>`; };
      return shelfBoard() + `<circle cx="1260" cy="230" r="120" fill="${c}" opacity=".12"/>` + B(1120, c, 110, 30) + B(1200, '#E0457A', 80, 26) + B(1270, '#5FD0B0', 130, 34) + B(1350, lt(c,0.3), 90, 28) + B(1420, '#FFC02E', 70, 22); } },
  krystaller: { label:'Krystaller', draw: c => { const K = (x, h, w, col, a) => `<g transform="rotate(${a} ${x} 300)"><path d="M ${x-w} 300 L ${x-w} ${300-h+w} L ${x} ${300-h} L ${x+w} ${300-h+w} L ${x+w} 300 Z" fill="${col}" ${RS(col,2.5)}/><path d="M ${x} ${300-h} L ${x} 300 L ${x+w} 300 L ${x+w} ${300-h+w} Z" fill="${sd(col,0.3)}" opacity=".5"/><path d="M ${x-w*0.6} ${300-h+w+6} V 290" stroke="#FFF" stroke-width="3" opacity=".6"/></g>`;
      return shelfBoard() + `<ellipse cx="1220" cy="240" rx="140" ry="80" fill="${c}" opacity=".15"/>` + K(1160, 120, 20, c, -14) + K(1200, 160, 24, lt(c,0.25), 0) + K(1240, 110, 18, c, 16) + K(1300, 80, 14, '#E0457A', -8)
        + `<rect x="1380" y="230" width="34" height="70" rx="4" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/><path d="M 1397 230 q -8 -18 0 -34 q 8 16 0 34" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/>`; } },
  planter: { label:'Små planter', draw: c => { const P = (x, col, leaves) => `<path d="M ${x-26} 260 L ${x+26} 260 L ${x+20} 300 L ${x-20} 300 Z" fill="${col}" ${RS(col,2.5)}/><rect x="${x-30}" y="252" width="60" height="12" rx="4" fill="${lt(col,0.2)}" ${RS(col,2)}/>` + leaves(x);
      const fern = x => [-40,-20,0,20,40].map(a => `<path d="M ${x} 252 Q ${x + a*0.6} 200 ${x + a*1.4} 180" stroke="#3E9A5A" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('');
      const round = x => `<circle cx="${x-14}" cy="226" r="20" fill="#5FB06A" stroke="#2E7A44" stroke-width="2.5"/><circle cx="${x+14}" cy="220" r="22" fill="#6BC078" stroke="#2E7A44" stroke-width="2.5"/><circle cx="${x}" cy="200" r="18" fill="#7CCB86" stroke="#2E7A44" stroke-width="2.5"/>`;
      const flower = x => `<path d="M ${x} 252 V 180" stroke="#3E9A5A" stroke-width="5"/>` + [0,72,144,216,288].map(a => `<ellipse cx="${x + 14*Math.cos(a*Math.PI/180)}" cy="${170 + 14*Math.sin(a*Math.PI/180)}" rx="12" ry="8" transform="rotate(${a} ${x + 14*Math.cos(a*Math.PI/180)} ${170 + 14*Math.sin(a*Math.PI/180)})" fill="${lt(c,0.3)}" stroke="${rOut(c)}" stroke-width="2"/>`).join('') + `<circle cx="${x}" cy="170" r="7" fill="#FFE27A"/>`;
      return shelfBoard() + P(1130, c, fern) + P(1240, '#E0457A', round) + P(1350, '#43A3D3', flower) + P(1430, lt(c,0.2), x => `<path d="M ${x} 252 q -14 -30 0 -50 q 14 20 0 50" fill="#5FB06A" stroke="#2E7A44" stroke-width="2.5"/>`); } },
};

/* ---------- lampen (hænger fra loftet / svæver) ---------- */
const glowAt = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r*0.6}" fill="${c}" opacity=".18"/>`;
const LAMPE = {
  lys: { label:'Svævende lys', draw: c => [[790,180,70],[890,130,90],[990,200,60]].map(([x,y,h]) => glowAt(x, y-8, 60, '#FFE27A')
      + `<rect x="${x-14}" y="${y}" width="28" height="${h}" rx="5" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="3"/><path d="M ${x-14} ${y+8} q 7 6 14 0 q 7 -6 14 0" stroke="#E6D6C6" stroke-width="3" fill="none"/><path d="M ${x} ${y} q -12 -18 0 -40 q 12 22 0 40" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/><path d="M ${x} ${y-4} q -5 -10 0 -20 q 5 10 0 20" fill="#FFF6D0"/>`
      + `<ellipse cx="${x}" cy="${y+h+4}" rx="22" ry="7" fill="${c}" ${RS(c,2)}/>`).join('') },
  stjernelampe: { label:'Stjernelampe', draw: c => `<path d="M 890 0 V 120" stroke="#5A3A2A" stroke-width="4"/>` + glowAt(890, 190, 120, lt(c,0.4)) + starP(890, 190, 70, c) + `<polygon points="${star5pts(890,190,70,30)}" fill="none" ${RS(c,4)}/>` + starP(890, 190, 36, lt(c,0.55)) },
  maanelampe: { label:'Månelampe', draw: c => `<path d="M 890 0 V 110" stroke="#5A3A2A" stroke-width="4"/>` + glowAt(890, 190, 120, lt(c,0.4)) + moon(890, 190, 70, c) + `<path d="M 890 120 A 70 70 0 1 0 890 260" stroke="${rOut(c)}" stroke-width="4" fill="none"/>` + starP(940, 150, 12, lt(c,0.5)) + starP(950, 230, 8, lt(c,0.5)) },
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
  sky: { label:'Skytæppe', draw: c => { const d = 'M 540 940 C 480 940 480 880 540 870 C 540 830 620 820 650 850 C 680 810 780 810 800 845 C 840 815 930 820 940 860 C 990 840 1080 850 1080 890 C 1130 900 1130 950 1080 950 Z';
      return `<path d="${d}" fill="${lt(c,0.45)}" stroke="${lt(c,0.1)}" stroke-width="5"/><path d="M 600 920 Q 800 900 1040 925" stroke="${lt(c,0.2)}" stroke-width="6" fill="none" opacity=".6"/>`; } },
};

/* ---------- en ting på gulvet (højre) ---------- */
const TING = {
  kedel: { label:'Heksekedel', draw: c => { const K = '#3A3346';
      let o = `<path d="M 1330 900 L 1316 940 M 1480 900 L 1494 940 M 1405 910 L 1405 950" stroke="${K}" stroke-width="12" stroke-linecap="round"/>`;
      o += `<path d="M 1300 780 C 1290 880 1340 920 1405 920 C 1470 920 1520 880 1510 780 Z" fill="${K}" stroke="#1E1A26" stroke-width="4"/><path d="M 1330 800 C 1326 860 1350 890 1380 900" stroke="#6A6280" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>`;
      o += `<ellipse cx="1405" cy="780" rx="112" ry="26" fill="${c}" stroke="#1E1A26" stroke-width="4"/><ellipse cx="1405" cy="776" rx="90" ry="16" fill="${lt(c,0.35)}"/>`;
      o += `<rect x="1290" y="770" width="230" height="16" rx="8" fill="#4A4258" stroke="#1E1A26" stroke-width="3"/>`;
      return o + [[1370,740,16],[1430,720,11],[1400,690,8],[1450,760,7]].map(([x,y,r],i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${lt(c,0.4)}" stroke="${c}" stroke-width="2" opacity=".85"/><circle cx="${x-r*0.35}" cy="${y-r*0.35}" r="${r*0.25}" fill="#FFF"/>`).join(''); } },
  kost: { label:'Heksekost', draw: c => { const W = '#9C6B43';
      return `<path d="M 1420 460 L 1360 880" stroke="${W}" stroke-width="16" stroke-linecap="round"/><path d="M 1418 470 L 1360 870" stroke="${lt(W,0.3)}" stroke-width="4" stroke-linecap="round"/>`
        + `<path d="M 1356 840 C 1310 880 1300 930 1306 950 L 1420 950 C 1420 920 1400 870 1372 846 Z" fill="#E8B84A" stroke="#A67A1F" stroke-width="3"/>` + [1320,1340,1360,1380,1400].map(x => `<path d="M ${x} 950 Q ${x+(1365-x)*0.3} 900 1365 852" stroke="#C9952E" stroke-width="2.5" fill="none"/>`).join('')
        + `<path d="M 1352 846 Q 1366 860 1380 850 L 1376 864 Q 1364 872 1350 862 Z" fill="${c}" ${RS(c,2)}/>` + starP(1406, 560, 12, '#FFE27A'); } },
  plante: { label:'Måneplante', draw: c => { let o = `<path d="M 1350 820 L 1470 820 L 1455 940 L 1365 940 Z" fill="#C9744A" ${RS('#C9744A')}/><rect x="1340" y="806" width="140" height="24" rx="8" fill="#D9845A" ${RS('#C9744A')}/>`;
      o += [[-60,-260],[-20,-320],[30,-300],[70,-230],[-80,-180],[90,-150]].map(([dx,dy]) => `<path d="M 1410 810 Q ${1410+dx*0.4} ${810+dy*0.5} ${1410+dx} ${810+dy}" stroke="#3E9A5A" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M ${1410+dx*0.6} ${810+dy*0.6} q ${dx>0?24:-24} -10 ${dx>0?30:-30} -34 q ${dx>0?-20:20} 4 ${dx>0?-30:30} 34" fill="#5FB06A" stroke="#2E7A44" stroke-width="2.5"/>`).join('');
      return o + [[-60,-260],[-20,-320],[30,-300],[70,-230]].map(([dx,dy]) => glowAt(1410+dx, 810+dy, 26, c) + moon(1410+dx, 810+dy, 14, lt(c,0.3))).join(''); } },
  globus: { label:'Stjerneglobus', draw: c => { const W = '#9C6B43';
      return `<path d="M 1360 950 L 1460 950 L 1440 930 L 1380 930 Z" fill="${W}" ${RS(W)}/><path d="M 1410 930 V 860" stroke="${W}" stroke-width="12"/>`
        + `<path d="M 1300 760 A 110 110 0 0 0 1520 760" stroke="#F2C14E" stroke-width="8" fill="none"/>` + `<circle cx="1410" cy="760" r="96" fill="${c}" ${RS(c,4)}/>`
        + rClip('M 1410 664 A 96 96 0 1 1 1409.9 664 Z', `<ellipse cx="1410" cy="760" rx="40" ry="96" fill="none" stroke="${lt(c,0.3)}" stroke-width="3"/><path d="M 1314 760 H 1506 M 1320 720 H 1500 M 1320 800 H 1500" stroke="${lt(c,0.3)}" stroke-width="3"/>`
          + [[1370,720],[1440,700],[1460,790],[1390,800],[1420,750]].map(([x,y],i) => starP(x, y, i%2 ? 8 : 11, '#FFE27A')).join('') + `<path d="M 1370 700 L 1440 700 L 1460 790" stroke="#FFE27A" stroke-width="2" fill="none" opacity=".7"/><path d="M 1440 670 A 96 96 0 0 1 1500 800 L 1520 800 L 1520 660 Z" fill="${SHC}" opacity=".25"/>`); } },
};

/* ---------- dyrets seng (foran til højre for figuren) ---------- */
const DYRESENG = {
  kurv: { label:'Kurv', draw: c => { const K = '#C99A5B';
      let o = `<path d="M 1080 870 C 1080 950 1300 950 1300 870 Z" fill="${K}" ${RS(K)}/>`;
      o += rClip('M 1080 870 C 1080 950 1300 950 1300 870 Z', Array.from({length: 12}, (_, i) => `<path d="M ${1080 + i*20} 860 q 10 40 0 90" stroke="${fdk(K,0.2)}" stroke-width="3" fill="none" opacity=".6"/>`).join('') + `<path d="M 1080 900 H 1300 M 1080 925 H 1300" stroke="${fdk(K,0.2)}" stroke-width="3" opacity=".5"/>`);
      return o + `<ellipse cx="1190" cy="870" rx="110" ry="26" fill="${c}" ${RS(c)}/><ellipse cx="1190" cy="866" rx="90" ry="16" fill="${lt(c,0.3)}"/><ellipse cx="1190" cy="870" rx="114" ry="14" fill="none" stroke="${K}" stroke-width="12"/>`; } },
  pude: { label:'Stor pude', draw: c => `<ellipse cx="1170" cy="912" rx="130" ry="40" fill="${sd(c,0.3)}" ${RS(c)}/><path d="M 1040 890 C 1040 850 1300 850 1300 890 L 1300 912 C 1300 950 1040 950 1040 912 Z" fill="${c}" ${RS(c)}/><ellipse cx="1170" cy="880" rx="118" ry="30" fill="${lt(c,0.25)}"/><ellipse cx="1170" cy="880" rx="82" ry="18" fill="${lt(c,0.4)}"/>`
      + [[1060,912],[1280,912],[1170,946]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`).join('') + starP(1170, 880, 14, lt(c,0.7)) },
  slot: { label:'Lille slot', draw: c => { const S = lt(c,0.15);
      let o = `<rect x="1090" y="790" width="200" height="150" fill="${S}" ${RS(c)}/><path d="M 1090 790 v -24 h 24 v 12 h 24 v -12 h 24 v 12 h 24 v -12 h 24 v 12 h 24 v -12 h 24 v 12 h 32 v 12" fill="${S}" ${RS(c)}/>`;
      o += `<rect x="1070" y="740" width="50" height="200" fill="${c}" ${RS(c)}/><path d="M 1062 744 L 1095 690 L 1128 744 Z" fill="#E0457A" ${RS('#E0457A')}/><rect x="1260" y="740" width="50" height="200" fill="${c}" ${RS(c)}/><path d="M 1252 744 L 1285 690 L 1318 744 Z" fill="#E0457A" ${RS('#E0457A')}/>`;
      o += `<path d="M 1150 940 V 870 Q 1190 830 1230 870 V 940 Z" fill="#3A2340"/><ellipse cx="1190" cy="930" rx="36" ry="10" fill="${c}"/>`;
      return o + `<path d="M 1095 690 V 670 l 18 6 l -18 6" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>` + starP(1190, 812, 10, '#F2C14E'); } },
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
  c:{ vaeg:'#4A4590', vindue:'#E0457A', seng:'#7B4FD0', hylde:'#7B4FD0', lampe:'#FFC02E', gulv:'#43A3D3', ting:'#5FD0B0', dyreseng:'#E07A45' } };
/* udsnit til små billeder af én ting */
const ROOM_VB = { vaeg:'0 0 1600 700', vindue:'200 50 500 520', seng:'30 220 560 660', hylde:'1050 50 440 340', lampe:'680 0 440 380', gulv:'460 780 720 220', ting:'1260 440 300 530', dyreseng:'990 650 350 320' };
const ROOM_WALL_COLORS = ['#4A4590','#2E3F8F','#6B3F8F','#2F6F78','#8F3F6B','#3F7A5A','#B88A4A','#5A4A6A'];

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

/* ================= Værelset som skærm ================= */
let roomSlot = null;
function showRoom(){ showScreen('#room'); playMusic('byen'); roomSlot = null; renderRoom(); }
function roomHead(){
  return el('div', { class:'screen-head' }, [
    el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); goTo(showTown); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + 'Byen' }),
    el('h2', {}, 'Mit værelse'),
    el('div', { class:'row' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); goTo(showHome); } }, html: ic('<path d="M10 6a2 2 0 1 1 2 2v1.5"/><path d="M12 9.5 3.5 16a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8z"/>') + 'Garderoben' }), starPill() ]) ]);
}
function renderRoom(){
  const box = $('#roomBody'); box.innerHTML = '';
  const room = getRoom();
  const stage = el('div', { class:'room-stage' });
  stage.append(el('img', { class:'room-bg', alt:'', src: svgUrl(roomSvg(room)) }));
  stage.append(el('div', { class:'room-fig' }, dollImg(heroState(), { viewBox:'110 20 700 1060', anim: !calm, idle: true, alt:'Din figur' })));
  for (const s of ROOM_SLOTS){
    const fresh = Object.keys(s.cat).some(id => prog.fresh.includes(roomKey(s.id, id)));
    const b = el('button', { class:'room-hot' + (roomSlot === s.id ? ' on' : '') + (fresh ? ' fresh' : ''), type:'button', 'aria-label': s.label, style:`left:${s.hot[0]/16}%;top:${s.hot[1]/10}%`, html: STAR_SVG,
      on:{ click: () => { sfx.pick(); roomSlot = roomSlot === s.id ? null : s.id; renderRoom(); } } });
    stage.append(b);
  }
  const wrap = el('div', { class:'room-wrap' }, [ stage ]);
  if (roomSlot) wrap.append(roomPanel(room, roomSlot));
  else wrap.append(el('p', { class:'hint center room-hint' }, 'Tryk på en stjerne for at indrette.'));
  box.append(roomHead(), wrap);
}
function roomPanel(room, slot){
  const s = ROOM_SLOTS.find(x => x.id === slot);
  const items = el('div', { class:'room-items' });
  for (const id of Object.keys(s.cat)){
    const free = roomFree(slot, id), fresh = prog.fresh.includes(roomKey(slot, id));
    const prev = Object.assign({}, room, { [slot]: id });
    const b = el('button', { class:'room-item' + (room[slot] === id ? ' sel' : '') + (free ? '' : ' locked') + (fresh ? ' fresh' : ''), type:'button', 'aria-label': s.cat[id].label },
      [ free ? el('img', { alt:'', src: svgUrl(roomSvg(prev, { only: slot, viewBox: ROOM_VB[slot] })) }) : el('span', { class:'lockbub', html: bubbleIcon('rum') }), el('span', { class:'nm' }, free ? s.cat[id].label : 'Findes i en boble') ]);
    b.addEventListener('click', () => {
      if (!free){ sfx.nope(); toast('Den kan du finde i Boblebutikken'); return; }
      sfx.pick(); if (fresh){ prog.fresh = prog.fresh.filter(k => k !== roomKey(slot, id)); saveProg(); }
      const r = getRoom(); r[slot] = id; setRoom(r); renderRoom();
    });
    items.append(b);
  }
  const cols = slot === 'vaeg' ? ROOM_WALL_COLORS : COLORS;
  const colors = el('div', { class:'room-colors' }, cols.map(col => el('button', { class:'dot' + (room.c[slot] === col ? ' sel' : ''), type:'button', 'aria-label':'Farve', style:`background:${col}`, on:{ click: () => { sfx.pick(); const r = getRoom(); r.c[slot] = col; setRoom(r); renderRoom(); } } })));
  return el('div', { class:'room-panel' }, [ el('div', { class:'room-panel-head' }, [ el('h3', {}, s.label), el('button', { class:'btn small', type:'button', on:{ click: () => { roomSlot = null; renderRoom(); } } }, 'Færdig') ]), items, colors ]);
}
