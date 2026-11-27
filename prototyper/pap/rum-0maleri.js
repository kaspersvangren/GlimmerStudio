/* ============ malerierne fra Præmiebutikken ============
   Elleve malerier fra det oprindelige spil, med de samme priser. Ni af dem er tegnet præcis som i originalen (de samme SVG-tegninger),
   og et maleri er jo netop et fladt billede, så de sidder på et lærred i en ramme af træ eller guld. To af dem er lavet i papir i stedet:
   Portræt af dit kæledyr og Selvportræt viser papirfigurerne fra spillet. Mesterværket står indpakket i butikken, til man har købt det.
   Tegningerne er 200 × 200, og det vigtigste ligger inden for 30-170 i bredden og 35-165 i højden, så de kan beskæres til alle rammer. */
const ME = '#2A1838';
const mst = (w = 3) => `stroke="${ME}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
function mStar(x, y, r, c){ let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.45 : r; d += (i ? 'L' : 'M') + (x + rr*Math.cos(a)).toFixed(1) + ' ' + (y + rr*Math.sin(a)).toFixed(1); } return `<path d="${d}Z" fill="${c}"/>`; }
const mHeart = (x, y, r) => `M ${x} ${y + r} C ${x - r*1.7} ${y - r*0.2} ${x - r*0.75} ${y - r*1.45} ${x} ${y - r*0.45} C ${x + r*0.75} ${y - r*1.45} ${x + r*1.7} ${y - r*0.2} ${x} ${y + r} Z`;
const mGrad = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const MALERIER_SVG = {
  maane: { label:'Månen over skolen', draw: () => {
    let o = `<defs>${mGrad('mlMa', '#120C40', '#5A3498')}</defs><rect width="200" height="200" fill="url(#mlMa)"/>`;
    o += [[30,24],[110,40],[170,30],[150,90],[30,100],[96,20],[140,56],[20,130],[180,120]].map(([x, y], i) => mStar(x, y, i % 3 ? 3 : 5, '#FFF6D0')).join('');
    o += `<circle cx="62" cy="58" r="34" fill="#FFE9A0" opacity=".25"/><circle cx="62" cy="58" r="24" fill="#FFF1C2" ${mst(2.5)}/><path d="M 52 56 q 4 4 8 0 M 66 56 q 4 4 8 0 M 56 66 q 7 6 14 0" stroke="#B89A4A" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    o += `<path d="M 0 150 C 40 120 70 136 100 140 C 130 132 160 118 200 140 V 200 H 0 Z" fill="#2E1E6A"/>`;
    o += `<g fill="#1E124A"><rect x="72" y="104" width="22" height="50"/><path d="M 68 104 L 83 78 L 98 104 Z"/><rect x="104" y="96" width="26" height="60"/><path d="M 100 96 L 117 64 L 134 96 Z"/><rect x="88" y="120" width="30" height="40"/><path d="M 117 64 V 54 L 128 58 L 117 62" fill="#E0457A"/></g>`;
    o += [[83,118],[117,110],[117,132],[103,140],[128,140]].map(([x, y]) => `<rect x="${x - 3}" y="${y}" width="6" height="9" rx="3" fill="#FFD86B"/>`).join('');
    return o + `<path d="M 0 170 C 50 156 120 172 200 160 V 200 H 0 Z" fill="#1A1048"/>`;
  } },
  blomster: { label:'Blomster i vase', draw: () => {
    let o = `<rect width="200" height="200" fill="#F7E2C4"/><rect width="200" height="200" fill="#E8C49A" opacity=".35"/><rect y="152" width="200" height="48" fill="#A8703A"/><path d="M 0 152 H 200" stroke="${ME}" stroke-width="3"/>`;
    const blom = (x, y, r, c, n = 6) => { let s = ''; for (let i = 0; i < n; i++){ const a = i * 360 / n; s += `<ellipse cx="${x}" cy="${y - r*.62}" rx="${r*.42}" ry="${r*.62}" transform="rotate(${a} ${x} ${y})" fill="${c}" ${mst(2)}/>`; } return s + `<circle cx="${x}" cy="${y}" r="${r*.34}" fill="#FFD23E" ${mst(2)}/>`; };
    o += [[100,128,72,52],[100,128,124,66],[100,128,100,44],[100,128,78,82],[100,128,128,96],[100,128,62,104]].map(([a, b, c, d]) => `<path d="M ${a} ${b} Q ${(a + c)/2} ${(b + d)/2 + 10} ${c} ${d}" stroke="#3E8A3A" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
    o += `<path d="M 86 100 q -18 -6 -24 6 q 14 6 24 -6 Z M 114 104 q 18 -8 26 4 q -14 8 -26 -4 Z" fill="#6CCB5A" ${mst(2)}/>`;
    o += blom(72, 52, 20, '#FF8FC7') + blom(124, 66, 18, '#B79BFF') + blom(100, 44, 22, '#FFFFFF', 8) + blom(78, 82, 16, '#FF6F6F') + blom(128, 96, 15, '#FFB347') + blom(62, 104, 13, '#7FD8FF');
    o += `<path d="M 82 118 Q 76 136 84 156 H 116 Q 124 136 118 118 Z" fill="#4A8AE0" ${mst(3)}/><path d="M 86 124 Q 82 138 88 152" stroke="#9AC8FF" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="80" y="113" width="40" height="9" rx="3" fill="#3A6AC8" ${mst(2.5)}/>`;
    return o + `<circle cx="140" cy="148" r="4" fill="#FF8FC7" ${mst(1.5)}/><ellipse cx="58" cy="150" rx="6" ry="3" fill="#B79BFF" ${mst(1.5)}/>`;
  } },
  hav: { label:'Skib på havet', draw: () => {
    let o = `<defs>${mGrad('mlHs', '#FF9A6A', '#FFD6A0')}${mGrad('mlHh', '#3A8AD8', '#1E4A9A')}</defs><rect width="200" height="112" fill="url(#mlHs)"/>`;
    o += `<circle cx="138" cy="112" r="28" fill="#FFE27A"/><circle cx="138" cy="112" r="40" fill="#FFE27A" opacity=".25"/>`;
    o += `<path d="M 30 50 q 6 -6 12 0 q 6 -6 12 0 M 150 40 q 5 -5 10 0 q 5 -5 10 0" stroke="${ME}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    o += `<rect y="110" width="200" height="90" fill="url(#mlHh)"/><path d="M 108 120 H 168 M 116 132 H 160 M 124 144 H 152" stroke="#FFE27A" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    for (let y = 126; y < 200; y += 18) o += `<path d="M ${-10 + (y % 36)} ${y} q 10 -6 20 0 q 10 6 20 0 q 10 -6 20 0 q 10 6 20 0 q 10 -6 20 0 q 10 6 20 0 q 10 -6 20 0 q 10 6 20 0 q 10 -6 20 0 q 10 6 20 0 q 10 -6 20 0" stroke="#9AD0FF" stroke-width="2.5" fill="none" opacity=".6"/>`;
    o += `<path d="M 60 126 L 130 126 L 120 142 L 70 142 Z" fill="#C8463A" ${mst(3)}/><path d="M 72 132 H 118" stroke="#FFE27A" stroke-width="3"/><path d="M 96 126 V 56" ${mst(3)}/>`;
    o += `<path d="M 98 60 Q 128 84 98 120 Z" fill="#FFFFFF" ${mst(2.5)}/><path d="M 94 66 Q 72 92 94 120 Z" fill="#F2EEDC" ${mst(2.5)}/><path d="M 96 56 L 110 50 L 96 46" fill="#FF6FA8" ${mst(2)}/>`;
    return o;
  } },
  svampe: { label:'Svampehuse', draw: () => {
    let o = `<defs>${mGrad('mlSv', '#9AD8FF', '#E0F4FF')}</defs><rect width="200" height="200" fill="url(#mlSv)"/><circle cx="160" cy="36" r="16" fill="#FFE27A"/>`;
    o += `<path d="M 0 130 C 50 112 140 120 200 112 V 200 H 0 Z" fill="#7AC85A"/><path d="M 0 150 C 60 140 150 152 200 140 V 200 H 0 Z" fill="#5AB84A"/>`;
    const hus = (x, yb, w, h, cap) => `<rect x="${x - w/2}" y="${yb - h}" width="${w}" height="${h}" rx="6" fill="#FFF6E0" ${mst()}/><path d="M ${x - w*.95} ${yb - h + 6} Q ${x - w*.9} ${yb - h - w*.9} ${x} ${yb - h - w*.95} Q ${x + w*.9} ${yb - h - w*.9} ${x + w*.95} ${yb - h + 6} Z" fill="${cap}" ${mst()}/>`
      + [[-.5, -.3, .16], [.3, -.55, .13], [.55, -.1, .1], [-.1, -.7, .1]].map(([dx, dy, r]) => `<circle cx="${x + dx*w}" cy="${yb - h + dy*w}" r="${r*w}" fill="#FFFFFF"/>`).join('')
      + `<path d="M ${x - w*.16} ${yb} V ${yb - h*.48} Q ${x} ${yb - h*.62} ${x + w*.16} ${yb - h*.48} V ${yb} Z" fill="#9C6B43" ${mst(2.5)}/><circle cx="${x + w*.3}" cy="${yb - h*.62}" r="${w*.1}" fill="#FFD86B" ${mst(2)}/>`;
    o += hus(126, 158, 48, 52, '#E0403A') + hus(66, 150, 34, 36, '#FF8FC7');
    o += `<path d="M 104 200 Q 116 176 126 158" stroke="#E8D2A0" stroke-width="10" fill="none"/>`;
    return o + [[30,170,'#FFF'],[170,176,'#FFE27A'],[44,186,'#FF8FC7'],[156,190,'#FFF']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}" ${mst(1.5)}/>`).join('');
  } },
  enhjoerning: { label:'Enhjørning', draw: () => {
  const HEAD='M 118 58 C 104 57 88 64 74 72 C 60 80 44 86 34 95 C 25 104 28 120 42 122 C 52 124 62 120 74 123 C 88 141 116 143 124 126 C 132 108 130 74 118 58 Z';
  let o=`<defs>${mGrad('mlEn','#FFC8E4','#D8C8FF')}<clipPath id="mlEnK"><path d="${HEAD}"/></clipPath></defs><rect width="200" height="200" fill="url(#mlEn)"/>`+[[30,40],[170,50],[40,160],[172,150],[150,24]].map(([x,y])=>mStar(x,y,5,'#FFFFFF')).join('');
  o+=`<path d="M 20 190 Q 30 170 50 176 Q 60 160 80 172 Q 96 162 108 178 Q 130 170 140 190 Z" fill="#FFFFFF" opacity=".9"/>`;
  /* et rigtigt hesthoved i profil mod venstre, lidt selvfedt: næsen i vejret, halvlukket øje, løftet bryn og skævt smil (Kasper 27. nov.) */
  o+=`<g transform="translate(10 2) rotate(-20 110 110)">`;
  // hals
  o+=`<path d="M 108 118 C 106 150 100 186 96 230 L 178 230 C 170 180 156 120 126 64 Z" fill="#FFFFFF" ${mst()}/>`;
  // manke: tykke lokker ned ad halsen
  const C=['#FF6F9A','#FFB347','#FFE04A','#7AD06A','#6AB8FF','#B79BFF'];
  const L=[[122,58],[134,78],[142,100],[150,122],[156,146],[162,170]];
  for(let i=L.length-1;i>=0;i--){const [x,y]=L[i];
    o+=`<path d="M ${x-6} ${y} C ${x+22} ${y-8} ${x+40} ${y+12} ${x+34} ${y+34} C ${x+32} ${y+44} ${x+20} ${y+46} ${x+18} ${y+38} C ${x+28} ${y+36} ${x+28} ${y+24} ${x+18} ${y+20} C ${x+12} ${y+30} ${x+4} ${y+30} ${x-4} ${y+26} Z" fill="${C[i]}" ${mst(2.5)}/>`;}
  // øre
  o+=`<path d="M 106 64 L 112 36 L 124 60 Z" fill="#FFFFFF" ${mst(2.5)}/><path d="M 110 58 L 113 45 L 119 58 Z" fill="#FFB8D8"/>`;
  // hoved
  o+=`<path d="${HEAD}" fill="#FFFFFF" ${mst()}/>`;
  o+=`<g clip-path="url(#mlEnK)"><path d="M 56 78 C 46 94 48 112 60 128 L 10 140 L 10 70 Z" fill="#FFC2DA"/></g><path d="M 56 80 C 48 95 49 111 59 124" stroke="${ME}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  o+=`<path d="${HEAD}" fill="none" ${mst()}/>`;
  o+=`<path d="M 35 101 q 2 -4 7 -2" stroke="${ME}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  // skævt smil
  o+=`<path d="M 38 118 Q 47 121 55 116 q 3 -2 2 -6" stroke="${ME}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  // halvlukket øje + løftet bryn
  o+=`<path d="M 86 86 A 8 7 0 0 0 102 86 Z" fill="#8A6AD8" ${mst(2)}/><circle cx="97" cy="88" r="1.6" fill="#FFFFFF"/>`;
  o+=`<path d="M 84 86 Q 94 81 104 86" stroke="${ME}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M 85 85 l -6 -3 M 87 83 l -4 -5 M 90 82 l -2 -5" stroke="${ME}" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<path d="M 85 74 Q 95 66 105 71" stroke="${ME}" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="106" cy="104" rx="8" ry="5" fill="#FF9FC8" opacity=".75"/>`;
  // horn
  o+=`<path d="M 92 66 L 80 20 L 106 62 Z" fill="#FFD23E" ${mst(2.5)}/><path d="M 89 54 L 101 50 M 86 42 L 95 39 M 83 31 L 89 29" stroke="#C7920A" stroke-width="2.2" stroke-linecap="round"/>`+mStar(80,17,8,'#FFFFFF')+mStar(80,17,4,'#FFE04A');
  // pandelok
  o+=`<path d="M 106 64 C 100 52 112 46 122 54 C 116 56 114 62 118 68 C 112 64 108 66 106 64 Z" fill="#FF6F9A" ${mst(2.5)}/>`;
  return o+`</g>`;
  } },
  drage: { label:'Lille drage', draw: () => {
    let o = `<defs>${mGrad('mlDr', '#FFE9B0', '#FFC08A')}</defs><rect width="200" height="200" fill="url(#mlDr)"/><path d="M 0 166 H 200 V 200 H 0 Z" fill="#B8803A"/><path d="M 0 166 H 200" stroke="${ME}" stroke-width="3"/>`;
    o += [-1, 1].map(s => `<path d="M ${100 + s*20} 106 L ${100 + s*66} 72 L ${100 + s*58} 96 L ${100 + s*72} 104 L ${100 + s*52} 114 L ${100 + s*58} 130 L ${100 + s*24} 126 Z" fill="#4AA83E" ${mst()}/>`).join('');
    o += `<path d="M 124 150 C 160 150 170 170 150 182 C 150 172 140 164 120 164 Z" fill="#6CCB5A" ${mst()}/><ellipse cx="100" cy="140" rx="34" ry="32" fill="#6CCB5A" ${mst()}/><ellipse cx="100" cy="146" rx="20" ry="22" fill="#D8F5B0"/>`;
    o += `<path d="M 72 168 Q 72 156 86 156 Q 94 156 94 168 Z M 106 168 Q 106 156 114 156 Q 128 156 128 168 Z" fill="#4AA83E" ${mst(2.5)}/>`;
    o += `<path d="M 84 76 L 80 52 L 94 68 Z M 116 76 L 120 52 L 106 68 Z" fill="#FFD23E" ${mst(2.5)}/><ellipse cx="100" cy="96" rx="34" ry="28" fill="#6CCB5A" ${mst()}/>`;
    o += `<ellipse cx="100" cy="108" rx="17" ry="11" fill="#D8F5B0"/><circle cx="94" cy="105" r="2" fill="${ME}"/><circle cx="106" cy="105" r="2" fill="${ME}"/>`;
    o += `<circle cx="86" cy="90" r="6" fill="${ME}"/><circle cx="114" cy="90" r="6" fill="${ME}"/><circle cx="88" cy="88" r="2" fill="#FFF"/><circle cx="116" cy="88" r="2" fill="#FFF"/><ellipse cx="76" cy="102" rx="6" ry="4" fill="#FF8FB0" opacity=".7"/><ellipse cx="124" cy="102" rx="6" ry="4" fill="#FF8FB0" opacity=".7"/>`;
    /* en lille røgsky formet som et hjerte */
    o += `<path d="${mHeart(150, 60, 14)}" fill="#FFFFFF" opacity=".85" ${mst(2)}/><circle cx="128" cy="80" r="5" fill="#FFFFFF" opacity=".8"/><circle cx="138" cy="72" r="3.5" fill="#FFFFFF" opacity=".8"/>`;
    /* en cupcake i poterne */
    return o + `<path d="M 88 140 L 92 156 H 108 L 112 140 Z" fill="#FFD86B" ${mst(2)}/><path d="M 86 142 Q 86 128 100 128 Q 114 128 114 142 Z" fill="#FF8FC7" ${mst(2)}/><circle cx="100" cy="125" r="4" fill="#E8324A" ${mst(1.5)}/>`;
  } },
  kunst: { label:'Moderne kunst', draw: () => {
    let o = `<rect width="200" height="200" fill="#FFFDF4"/>`;
    o += `<path d="M 30 60 L 90 40 L 70 110 Z" fill="#4A8AE0" ${mst(2.5)}/><circle cx="130" cy="70" r="28" fill="#E8324A" ${mst(2.5)}/><rect x="96" y="112" width="70" height="40" fill="#FFD23E" ${mst(2.5)} transform="rotate(-8 130 132)"/>`;
    o += `<path d="M 26 150 C 50 120 60 180 84 150 S 120 130 130 170" stroke="#2E9C8A" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M 150 30 L 176 56 M 176 30 L 150 56" stroke="${ME}" stroke-width="6" stroke-linecap="round"/>`;
    o += `<path d="M 40 30 Q 44 46 40 60 M 120 110 Q 118 124 122 136 M 160 150 Q 162 164 158 176" stroke="${ME}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="42" cy="62" r="3" fill="${ME}"/><circle cx="122" cy="138" r="3" fill="${ME}"/>`;
    o += [[60,90,'#FF8FC7',9],[150,110,'#7AD06A',7],[90,170,'#B79BFF',10],[170,180,'#FFB347',6],[20,100,'#E8324A',5]].map(([x, y, c, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x + r}" cy="${y - r}" r="${r*.4}" fill="${c}"/><circle cx="${x - r*1.2}" cy="${y + r*.5}" r="${r*.3}" fill="${c}"/>`).join('');
    /* en lille smiley, der gemmer sig i den røde cirkel */
    return o + `<circle cx="124" cy="66" r="2.6" fill="${ME}"/><circle cx="136" cy="66" r="2.6" fill="${ME}"/><path d="M 122 76 q 8 7 16 0" stroke="${ME}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  } },
  gnoma: { label:'Mona Gnoma', draw: () => {
    let o = `<defs>${mGrad('mlGn', '#8AA070', '#C8B87A')}</defs><rect width="200" height="200" fill="url(#mlGn)"/>`;
    o += `<path d="M 0 90 C 30 70 50 96 70 80 L 70 200 H 0 Z M 200 100 C 170 80 150 104 130 90 L 130 200 H 200 Z" fill="#6A7A50" opacity=".7"/><path d="M 0 120 C 20 110 40 130 60 116 M 200 128 C 180 118 160 134 140 124" stroke="#5A8AA0" stroke-width="4" fill="none" opacity=".6"/>`;
    o += `<path d="M 36 200 C 40 150 60 126 100 124 C 140 126 160 150 164 200 Z" fill="#3A2A1E" ${mst()}/><path d="M 100 126 L 90 200 M 100 126 L 112 200" stroke="#2A1E14" stroke-width="2" opacity=".6"/>`;
    o += `<path d="M 68 176 Q 100 166 130 176 Q 120 190 100 188 Q 80 190 68 176 Z" fill="#F2C8A0" ${mst(2.5)}/><path d="M 88 176 v 8 M 98 174 v 10 M 108 176 v 8" stroke="#D8A880" stroke-width="2"/>`;
    o += `<circle cx="100" cy="88" r="30" fill="#F2C8A0" ${mst()}/>`;
    o += `<path d="M 72 92 C 70 130 88 152 100 156 C 112 152 130 130 128 92 C 118 106 82 106 72 92 Z" fill="#F7F4FF" ${mst(2.5)}/><path d="M 88 120 q 3 8 0 14 M 110 118 q 3 8 0 14" stroke="#D8D2E8" stroke-width="2" fill="none"/>`;
    o += `<ellipse cx="100" cy="96" rx="8" ry="6.5" fill="#EFA286" ${mst(2)}/><path d="M 92 108 Q 100 112 108 107" stroke="${ME}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    o += `<path d="M 86 82 q 5 -3 9 0 M 105 82 q 5 -3 9 0" stroke="${ME}" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="91" cy="86" r="2.4" fill="${ME}"/><circle cx="110" cy="86" r="2.4" fill="${ME}"/>`;
    return o + `<path d="M 68 78 Q 84 28 104 10 Q 110 40 132 78 Q 100 66 68 78 Z" fill="#C8302A" ${mst()}/><path d="M 66 78 Q 100 64 134 78" stroke="${ME}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M 67 78 Q 100 64 133 78" stroke="#8A1E1A" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } },
  /* mesterværket: Agnes' far, som en lille gemt joke. Varmt lampelys bag ham, sort t-shirt, rødt hår og skæg og runde briller */
  far: { label:'Mesterværket', draw: () => {
    const SK = '#F4C9A8', SKD = '#D99C7A', H = '#C9692A', HL = '#E8944A', HD = '#9A4A1E';
    let o = `<defs><radialGradient id="mlFa" cx=".55" cy=".35" r=".8"><stop offset="0" stop-color="#FFF8D8"/><stop offset=".5" stop-color="#F7E2A0"/><stop offset="1" stop-color="#C8A060"/></radialGradient></defs><rect width="200" height="200" fill="url(#mlFa)"/>`;
    o += `<path d="M 160 0 C 172 60 182 120 200 200 V 0 Z" fill="#FFFFFF" opacity=".55"/>`;
    /* sort t-shirt og hals */
    o += `<path d="M 6 200 C 10 168 34 150 70 144 L 130 144 C 166 150 190 168 194 200 Z" fill="#1E1E2A" ${mst()}/><path d="M 80 146 Q 100 170 120 146" fill="${SK}" ${mst(2.5)}/>`;
    o += `<path d="M 82 120 L 82 148 Q 100 160 118 148 L 118 120 Z" fill="${SK}" ${mst(2.5)}/>`;
    /* ørerne og hovedet */
    o += `<ellipse cx="58" cy="94" rx="8" ry="13" fill="${SK}" ${mst(2.5)}/><ellipse cx="142" cy="94" rx="8" ry="13" fill="${SK}" ${mst(2.5)}/>`;
    o += `<path d="M 60 80 C 60 40 140 40 140 80 L 140 104 C 140 126 122 138 100 138 C 78 138 60 126 60 104 Z" fill="${SK}" ${mst()}/>`;
    /* skægget: fuldt og rødt, lysere i kanten */
    o += `<path d="M 61 96 C 60 130 80 154 100 156 C 120 154 140 130 139 96 C 134 108 128 114 122 116 C 114 110 86 110 78 116 C 72 114 66 108 61 96 Z" fill="${H}" ${mst(2.5)}/>`;
    o += `<path d="M 70 118 q 4 14 12 22 M 128 118 q -4 14 -12 22 M 100 140 v 10" stroke="${HD}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M 66 108 q 2 14 8 20" stroke="${HL}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    /* munden: et lille, skævt smil i skægget */
    o += `<path d="M 86 124 Q 99 132 114 122" stroke="#8A3A2A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 84 118 Q 100 112 116 118" stroke="${HD}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
    /* næsen og de smilende øjne bag de runde briller */
    o += `<path d="M 100 96 Q 96 108 100 110 Q 104 112 106 108" stroke="${SKD}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    o += `<path d="M 74 92 q 7 -5 14 0 M 112 92 q 7 -5 14 0" stroke="${ME}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M 72 78 q 9 -5 18 -1 M 110 77 q 9 -4 18 1" stroke="${H}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    o += [80, 120].map(x => `<circle cx="${x}" cy="90" r="15" fill="#FFFFFF" fill-opacity=".18" stroke="#3A2418" stroke-width="5"/><circle cx="${x}" cy="90" r="15" fill="none" stroke="#7A4A2A" stroke-width="1.8" stroke-dasharray="4 5"/><path d="M ${x - 8} ${82} l 5 -3" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`).join('');
    o += `<path d="M 95 90 Q 100 86 105 90" stroke="#3A2418" stroke-width="4" fill="none"/><path d="M 65 88 L 58 86 M 135 88 L 142 86" stroke="#3A2418" stroke-width="4" stroke-linecap="round"/>`;
    /* håret: kort i siderne og strøget op i en lille pjusket top */
    o += `<path d="M 60 84 C 56 60 64 42 82 34 C 84 22 104 16 116 24 C 132 22 146 40 140 62 C 140 70 138 78 140 84 C 134 70 128 60 120 58 C 106 62 88 58 76 56 C 68 62 64 72 60 84 Z" fill="${H}" ${mst()}/>`;
    o += `<path d="M 84 34 C 90 24 102 22 108 28 M 104 26 C 112 20 126 24 128 34 M 74 48 C 84 42 98 42 106 46" stroke="${HL}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 116 24 C 122 14 130 14 134 20 C 128 20 124 24 122 30" fill="${H}" ${mst(2.5)}/>`;
    return o;
  } },
};

const MALERIER=[['blomster','Blomster i vase',40],['maane','Månen over skolen',40],['hav','Skib på havet',50],['svampe','Svampehuse',50],['enhjoerning','Enhjørning',60],['drage','Lille drage',60],
  ['kunst','Moderne kunst',70],['kaeledyr','Portræt af dit kæledyr',80],['selv','Selvportræt',80],['gnoma','Mona Gnoma',90],['far','Mesterværket',200]],MALERI_HEMMELIG=['far'];
const maleriEjet=id=>SPIL.har.includes('maleri:'+id);
/* et lærred af en SVG-tegning: tegnes på et lærred, når billedet er hentet (det tager et øjeblik første gang) */
const MALTEX=new Map();
function maleriTex(id){if(MALTEX.has(id))return MALTEX.get(id);const c=cv(320,320),t=tx(c,true);MALTEX.set(id,t);
  let svg='';if(MALERIER_SVG[id])svg=MALERIER_SVG[id].draw();else if(id==='kaeledyr')svg=`<rect width="200" height="200" fill="#FFE0EE"/>`+Array.from({length:30},(_,i)=>`<circle cx="${(i*37)%200}" cy="${(i*53)%200}" r="4" fill="#FFC2DE"/>`).join('')+`<ellipse cx="100" cy="100" rx="70" ry="80" fill="#FFF6FA" ${mst(3)}/><ellipse cx="100" cy="100" rx="62" ry="72" fill="none" stroke="#FFC2DE" stroke-width="3" stroke-dasharray="2 6"/>`;
  else if(id==='selv')svg=`<defs>${mGrad('mlSe','#8AC8F0','#C8E8FF')}</defs><rect width="200" height="200" fill="url(#mlSe)"/><path d="M 0 150 Q 50 120 100 140 Q 150 160 200 130 V 200 H 0 Z" fill="#7AC85A" opacity=".7"/>`;
  const img=new Image();img.onload=()=>{const g=c.getContext('2d');g.drawImage(img,0,0,320,320);t.needsUpdate=true};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="320" height="320">${svg}</svg>`);return t}
/* en papirfigur som billede, beskåret til det, man vil se (top: hvor stor en del fra oven) */
const MALFIG=new Map();
function papFigurBillede(ctx,key,byg,top=1){if(MALFIG.has(key))return MALFIG.get(key);const sc=new THREE.Scene(),G=new THREE.Group();sc.add(G);sc.environment=ctx.env;sc.environmentIntensity=.35;sc.add(new THREE.HemisphereLight('#fff8ee','#8a7a6c',1.25));{const d=new THREE.DirectionalLight('#fff0dc',2);d.position.set(-30,50,90);sc.add(d)}
  byg(G);G.updateMatrixWorld(true);const b=new THREE.Box3(),tmp=new THREE.Box3();G.traverse(q=>{if(q.isMesh&&!q.isSprite&&q.visible&&q.geometry&&q.material&&q.material.visible!==false){if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();tmp.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);b.union(tmp)}});
  const y1=b.max.y,y0=y1-(b.max.y-b.min.y)*top,cx=(b.min.x+b.max.x)/2,cy=(y0+y1)/2,h=Math.max(b.max.x-b.min.x,y1-y0)/2*1.04,cam=new THREE.OrthographicCamera(cx-h,cx+h,cy+h,cy-h,1,900);cam.position.set(0,0,400);cam.lookAt(0,0,0);cam.updateProjectionMatrix();
  const rt=new THREE.WebGLRenderTarget(512,512,{samples:4}),farve=new THREE.Color(),foer=renderer.getRenderTarget(),a=renderer.getClearAlpha(),ac=renderer.autoClear;renderer.getClearColor(farve);renderer.autoClear=true;renderer.setClearColor('#000000',0);renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.setRenderTarget(foer);renderer.autoClear=ac;renderer.setClearColor(farve,a);
  sc.traverse(q=>{if(q.geometry&&!q.isSprite)q.geometry.dispose()});sc.clear();MALFIG.set(key,rt);return rt}
/* lærredets hjørner: billedet beskæres, så det passer i rammen uden at blive strakt */
function maleriPlan(w,h){const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,a=w/h;let x0=0,x1=1,y0=0,y1=1;if(a<1){const k=a*.65+.35*a;const bw=Math.min(1,a);x0=(1-bw)/2;x1=x0+bw}else if(a>1){const bh=1/a;y0=(1-bh)/2;y1=y0+bh}
  for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)?x1:x0,uv.getY(i)?y1:y0)}return g}
/* hele maleriet i en gruppe: ramme, lærred og evt. papirfiguren. ramme: 'trae' eller 'guld'. Midten af lærredet er (0,0) */
function bygMaleri(ctx,G,id,w,h,ramme='trae'){const fw=ramme==='guld'?.75:.6,yd=[];
  const lm=new THREE.Mesh(maleriPlan(w,h),new THREE.MeshStandardMaterial({map:maleriTex(id),roughness:1,metalness:0}));lm.position.z=.05;lm.userData.noShadow=true;G.add(lm);yd.push(lm);
  if(id==='kaeledyr'||id==='selv'){const kd=id==='kaeledyr',d=kd?Object.assign({},ctx.dyr||SPIL.dyr):Object.assign({},ctx.look||SPIL.look),key=id+JSON.stringify(d),
      rt=papFigurBillede(ctx,key,q=>{if(kd){const K=makePet(d);q.add(K.G);K.tick(1,{ph:0,amp:0});if(K.lids)K.lids.visible=false}else{const F=makeFigure(d);q.add(F.G);F.tick(1,{ph:0,amp:0});if(F.lids)F.lids.visible=false}/* tid 1, ikke 0: ved 0 blinker figuren, så portrættet fik lukkede øjne (Kasper 27. nov.) */},kd?1:.52),s=Math.min(w,h)*(kd?.82:.98);
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:rt.texture,transparent:true,alphaTest:.35,premultipliedAlpha:true,toneMapped:false}));fm.position.set(0,kd?-h*.02:-h*.5+s/2,.12);fm.userData.noShadow=true;G.add(fm);yd.push(fm)}
  if(ramme==='guld'){for(const q of ring(box(-w/2,-h/2,w/2,h/2),fw,false))put(G,piece(q,{mat:gold(),t:.5}),0,0,.15);for(const q of ring(box(-w/2-fw*.35,-h/2-fw*.35,w/2+fw*.35,h/2+fw*.35),.18,false))put(G,piece(q,{color:'#8a5a1c',kind:'water',t:.1}),0,0,.42)}
  else for(const q of ring(box(-w/2,-h/2,w/2,h/2),fw,false))put(G,piece(q,{color:'#b8864a',kind:'balsa',t:.45,edge:'#6a4220'}),0,0,.15);
  put(G,piece(box(-w/2-fw,-h/2-fw,w/2+fw,h/2+fw),{color:'#3a2418',kind:'water',t:.05}),0,0,-.05);
  G.userData.ryd=()=>{for(const m of yd){m.geometry.dispose();m.material.dispose()}};return G}
/* den indpakkede pakke: brunt papir, snor over kryds, en sløjfe og et mærke med et spørgsmålstegn */
function bygPakke(G,w,h){put(G,piece(box(-w/2,-h/2,w/2,h/2),{color:'#c89a5a',kind:'kraft',t:.6,edge:'#7a5228'}),0,0,0);for(const q of thick([[[-w/2,0],[w/2,0]],[[0,-h/2],[0,h/2]]],.32))put(G,piece(q,{color:'#e2384e',kind:'card',t:.06}),0,0,.35);
  for(const sx of[-1,1])put(G,piece(toCCW(sm([[0,0,1],[sx*1.6,1],[sx*1.8,-.2],[sx*1.1,-.6]],4)),{color:'#e2384e',kind:'card',t:.1,edge:'#8a1a2a'}),0,0,.45);put(G,piece(circ(0,0,.42,.42,12),{color:'#c0283e',kind:'card',t:.12}),0,0,.55);
  const tag=new THREE.Group();tag.position.set(w*.22,-h*.22,.6);tag.rotation.z=-.25;G.add(tag);put(tag,piece(toCCW([[-1,-1.2],[1,-1.2],[1,.7],[0,1.3],[-1,.7]]),{color:'#fbf2dc',kind:'card',t:.08,edge:'#a88a5a'}),0,0,0);const q=papirTekstMesh('?','#c0283e',2,FONT.arkade,'rgba(0,0,0,0)');q.position.set(0,-.2,.1);tag.add(q);return G}
/* pladserne på væggene i Værelset: to små til venstre for vinduet, et stort i guldramme over heksen, og to små ved hylden */
const VAEGPLADSER=[{x:-40.4,y:34.4,w:5.4,h:5.6,r:'trae'},{x:-40.4,y:27.2,w:5.4,h:5.6,r:'trae'},{x:-10.6,y:39.4,w:8.4,h:6.6,r:'guld'},{x:23.3,y:40.2,w:4.6,h:5.2,r:'trae'},{x:23.3,y:32.8,w:4.6,h:5.2,r:'trae'}];
