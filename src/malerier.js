/* ================= Malerier og billedvæggene i værelset =================
   Malerierne købes for billetter i arkadens præmiebutik og hænges op på to billedvægge i værelset: én til venstre
   over sengen og én til højre for hylden. Hver væg kan have 1 stort, 2 mellem, 4 små eller 1 mellem og 2 små billeder.
   Hvert motiv er tegnet på et lærred på 200 x 200 og beskæres til rammen, så alle motiver passer i alle rammer.
   Det vigtigste i motivet ligger derfor inden for 30-170 i bredden og 35-165 i højden. */
const ME = '#2A1838';
const mst = (w = 3) => `stroke="${ME}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
function mStar(x, y, r, c){ let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.45 : r; d += (i ? 'L' : 'M') + (x + rr*Math.cos(a)).toFixed(1) + ' ' + (y + rr*Math.sin(a)).toFixed(1); } return `<path d="${d}Z" fill="${c}"/>`; }
const mHeart = (x, y, r) => `M ${x} ${y + r} C ${x - r*1.7} ${y - r*0.2} ${x - r*0.75} ${y - r*1.45} ${x} ${y - r*0.45} C ${x + r*0.75} ${y - r*1.45} ${x + r*1.7} ${y - r*0.2} ${x} ${y + r} Z`;
const mGrad = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const MALERIER = {
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
    let o = `<defs>${mGrad('mlEn', '#FFC8E4', '#D8C8FF')}</defs><rect width="200" height="200" fill="url(#mlEn)"/>` + [[30,40],[170,50],[40,160],[172,150],[150,24]].map(([x, y]) => mStar(x, y, 5, '#FFFFFF')).join('');
    o += `<path d="M 20 190 Q 30 170 50 176 Q 60 160 80 172 Q 96 162 108 178 Q 130 170 140 190 Z" fill="#FFFFFF" opacity=".9"/>`;
    /* halsen og hovedet, set fra siden og vendt mod venstre */
    o += `<path d="M 150 200 C 146 160 132 130 120 112 L 92 120 C 100 150 104 180 100 200 Z" fill="#FFFFFF" ${mst()}/>`;
    o += `<path d="M 66 108 C 60 94 70 78 92 74 C 118 70 136 84 132 108 C 128 126 108 128 96 124 C 84 132 68 128 66 108 Z" fill="#FFFFFF" ${mst()}/>`;
    o += `<ellipse cx="74" cy="112" rx="12" ry="10" fill="#FFE8F2" ${mst(2.5)}/><circle cx="70" cy="110" r="1.8" fill="${ME}"/><circle cx="78" cy="112" r="1.8" fill="${ME}"/>`;
    o += `<path d="M 94 96 q 6 5 12 0" stroke="${ME}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 94 96 l -3 -4 M 100 98 l 0 -5 M 106 96 l 3 -4" stroke="${ME}" stroke-width="2" stroke-linecap="round"/><ellipse cx="104" cy="108" rx="7" ry="4.5" fill="#FF9FC8" opacity=".8"/>`;
    o += `<path d="M 112 76 L 120 66 L 126 80 Z" fill="#FFFFFF" ${mst(2.5)}/><path d="M 94 76 L 104 34 L 108 76 Z" fill="#FFD23E" ${mst(2.5)}/><path d="M 97 66 L 106 62 M 98 56 L 105 52 M 100 46 L 105 43" stroke="#C7920A" stroke-width="2"/>`;
    const C = ['#FF6F9A', '#FFB347', '#FFE04A', '#7AD06A', '#6AB8FF', '#B79BFF'];
    C.forEach((c, i) => { o += `<path d="M ${120 + i*4} ${74 + i*7} C ${150 + i*6} ${82 + i*8} ${150 + i*4} ${130 + i*8} ${172 + i*3} ${160 + i*5}" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>`; });
    return o + `<path d="M 114 70 C 104 64 106 54 118 58" stroke="#FF6F9A" stroke-width="9" fill="none" stroke-linecap="round"/>`;
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
  kaeledyr: { label:'Portræt af dit kæledyr', draw: () => {
    let o = `<rect width="200" height="200" fill="#FFE0EE"/>` + Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 37) % 200}" cy="${(i * 53) % 200}" r="4" fill="#FFC2DE"/>`).join('');
    o += `<ellipse cx="100" cy="100" rx="70" ry="80" fill="#FFF6FA" ${mst(3)}/><ellipse cx="100" cy="100" rx="62" ry="72" fill="none" stroke="#FFC2DE" stroke-width="3" stroke-dasharray="2 6"/>`;
    let pet = '';
    try { const st = heroState(); if (st.pet && st.pet.kind !== 'ingen') pet = `<image href="${dollUrl(st, { viewBox: VB.pet, petOnly: true })}" x="40" y="34" width="120" height="133"/>`; } catch (e){}
    return o + (pet || `<path d="${mHeart(100, 104, 26)}" fill="#FF8FC7" ${mst()}/>`);
  } },
  selv: { label:'Selvportræt', draw: () => {
    let o = `<defs>${mGrad('mlSe', '#8AC8F0', '#C8E8FF')}</defs><rect width="200" height="200" fill="url(#mlSe)"/>`;
    o += `<path d="M 0 150 Q 50 120 100 140 Q 150 160 200 130 V 200 H 0 Z" fill="#7AC85A" opacity=".7"/>`;
    let me = '';
    try { me = `<image href="${dollUrl(heroState(), { viewBox: '140 110 320 330', pet: false })}" x="10" y="16" width="180" height="180"/>`; } catch (e){}
    return o + me;
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
const MALERI_IDS = Object.keys(MALERIER);

/* rammerne: lille (træ), mellem (guld) og stor (forgyldt med roser i hjørnerne og et messingskilt) */
function maleriRamme(id, x, y, w, h, k, nr){
  const m = MALERIER[id], t = k === 'l' ? 18 : k === 'm' ? 12 : 10, uid = 'ml' + nr;
  const R = k === 's' ? ['#9C6B43', '#5A3A22', '#C9962E'] : ['#E8C46A', '#8A6420', '#FFF0B8'];
  let o = `<rect x="${x + 6}" y="${y + 8}" width="${w}" height="${h}" rx="3" fill="#000" opacity=".25"/>`;
  o += `<path d="M ${x + w/2} ${y - 26} L ${x + w*.2} ${y + 4} M ${x + w/2} ${y - 26} L ${x + w*.8} ${y + 4}" stroke="#5A3A22" stroke-width="2"/><circle cx="${x + w/2}" cy="${y - 26}" r="4" fill="#C9962E" stroke="${ME}" stroke-width="1.5"/>`;
  o += `<defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R[2]}"/><stop offset=".45" stop-color="${R[0]}"/><stop offset="1" stop-color="${R[1]}"/></linearGradient></defs>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${uid}g)" stroke="${ME}" stroke-width="3"/>`;
  o += `<svg x="${x + t}" y="${y + t}" width="${w - 2*t}" height="${h - 2*t}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">${m ? m.draw() : ''}</svg>`;
  o += `<rect x="${x + t}" y="${y + t}" width="${w - 2*t}" height="${h - 2*t}" fill="none" stroke="${ME}" stroke-width="2.5"/><rect x="${x + t - 3}" y="${y + t - 3}" width="${w - 2*t + 6}" height="${h - 2*t + 6}" fill="none" stroke="${R[1]}" stroke-width="2" opacity=".7"/>`;
  if (k !== 's') o += `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="2" fill="none" stroke="${R[2]}" stroke-width="1.5" opacity=".8"/>`;
  if (k === 'l'){
    o += [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="9" fill="#F2D27A" stroke="${ME}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="#B98516"/>`).join('');
    o += [[x + w/2, y + 9], [x + w/2, y + h - 9], [x + 9, y + h/2], [x + w - 9, y + h/2]].map(([cx, cy]) => `<path d="${mHeart(cx, cy, 7)}" fill="#F2D27A" stroke="${ME}" stroke-width="1.6"/>`).join('');
    const pw = Math.min(w - 40, 130);
    o += `<rect x="${x + w/2 - pw/2}" y="${y + h + 8}" width="${pw}" height="22" rx="4" fill="url(#${uid}g)" stroke="${ME}" stroke-width="2"/><text x="${x + w/2}" y="${y + h + 24}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="13" fill="#3A2008">${m ? m.label : ''}</text>`;
  }
  return o;
}

/* billedvæggene: to felter på 230 x 310, der kun ses på væggen i siderne af værelset */
const GALLERI_FELT = { v: { x: -190, y: 172 }, h: { x: 1524, y: 172 } };
const GALLERI_OPST = {
  stor: [ { x: 20, y: 10, w: 190, h: 250, k: 'l' } ],
  '2m': [ { x: 10, y: 8, w: 210, h: 126, k: 'm' }, { x: 10, y: 158, w: 210, h: 126, k: 'm' } ],
  '4s': [ { x: 10, y: 8, w: 100, h: 126, k: 's' }, { x: 120, y: 8, w: 100, h: 126, k: 's' }, { x: 10, y: 158, w: 100, h: 126, k: 's' }, { x: 120, y: 158, w: 100, h: 126, k: 's' } ],
  m2s: [ { x: 10, y: 8, w: 210, h: 126, k: 'm' }, { x: 10, y: 158, w: 100, h: 126, k: 's' }, { x: 120, y: 158, w: 100, h: 126, k: 's' } ],
};
const GALLERI_NAVN = { stor: '1 stort', '2m': '2 mellem', '4s': '4 små', m2s: '1 mellem og 2 små' };
const maleriEjet = id => isFree('maleri', id);
function galleriState(){
  const g = (prog.room && prog.room.galleri) || {};
  const one = s => { const w = g[s] || {}, lay = GALLERI_OPST[w.lay] ? w.lay : 'stor', n = GALLERI_OPST[lay].length;
    const p = Array.from({ length: n }, (_, i) => { const id = (w.p || [])[i]; return id && MALERIER[id] && maleriEjet(id) && !isKladde('maleri', id) ? id : null; }); return { lay, p }; };
  return { v: one('v'), h: one('h') };
}
function setGalleri(gs){ const r = Object.assign({}, prog.room || {}); r.galleri = gs; prog.room = r; saveProg(); }
/* et nyt maleri hænges op på første ledige plads, så man ser det med det samme */
function haengOp(id){
  const gs = galleriState();
  if (gs.v.p.includes(id) || gs.h.p.includes(id)) return true;
  for (const s of ['v', 'h']){ const i = gs[s].p.indexOf(null); if (i >= 0){ gs[s].p[i] = id; setGalleri(gs); return true; } }
  return false;
}
let MLN = 0;
function galleriSvg(side, gs){
  const f = GALLERI_FELT[side], w = (gs || galleriState())[side], op = GALLERI_OPST[w.lay];
  let o = '';
  op.forEach((r, i) => { if (w.p[i]) o += maleriRamme(w.p[i], f.x + r.x, f.y + r.y, r.w, r.h, r.k, side + (MLN++)); });
  return o;
}
const harMalerier = () => MALERI_IDS.some(id => maleriEjet(id) && !isKladde('maleri', id));

/* ---------- ophængning: tryk på en billedvæg for at vælge opstilling og hvilke malerier der hænger hvor ---------- */
let galSide = null, galValgt = 0;
function maleriMini(id){ const m = MALERIER[id]; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${m ? m.draw() : ''}</svg>`; }
function opstIkon(lay){ return `<svg viewBox="0 0 230 310" aria-hidden="true">${GALLERI_OPST[lay].map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6" fill="currentColor" opacity=".85"/>`).join('')}</svg>`; }
function aabnGalleri(side){ galSide = side; const w = galleriState()[side]; galValgt = Math.max(0, w.p.indexOf(null)); if (galValgt < 0) galValgt = 0; tegnGalleri(); }
function lukGalleri(){ galSide = null; const b = document.querySelector('.gal-wrap'); if (b) b.remove(); drawRoomScene(); }
function tegnGalleri(){
  const host = $('#roomBody'); let wrap = host.querySelector('.gal-wrap'); if (wrap) wrap.remove();
  const gs = galleriState(), w = gs[galSide], f = GALLERI_FELT[galSide], op = GALLERI_OPST[w.lay];
  if (galValgt >= op.length) galValgt = 0;
  /* væggen i stort format: tomme rammer er stiplede, den valgte lyser */
  let pv = `<svg class="gal-pv" xmlns="http://www.w3.org/2000/svg" viewBox="${f.x - 10} ${f.y - 40} 250 ${op.some(r => r.k === 'l') ? 400 : 360}"><rect x="${f.x - 400}" y="${f.y - 400}" width="1000" height="1200" fill="${getRoom().c.vaeg}"/>`;
  op.forEach((r, i) => { const x = f.x + r.x, y = f.y + r.y;
    pv += `<g class="gal-fr" data-i="${i}">` + (w.p[i] ? maleriRamme(w.p[i], x, y, r.w, r.h, r.k, 'pv' + i) : `<rect x="${x}" y="${y}" width="${r.w}" height="${r.h}" rx="6" fill="#FFFFFF" fill-opacity=".12" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="10 8"/><path d="M ${x + r.w/2} ${y + r.h/2 - 16} v 32 M ${x + r.w/2 - 16} ${y + r.h/2} h 32" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".8"/>`)
      + (i === galValgt ? `<rect class="gal-sel" x="${x - 7}" y="${y - 7}" width="${r.w + 14}" height="${r.h + 14}" rx="10" fill="none" stroke="#FF5FA8" stroke-width="6"/>` : '') + `<rect x="${x - 8}" y="${y - 8}" width="${r.w + 16}" height="${r.h + 16}" fill="#FFF" fill-opacity="0"/></g>`; });
  pv += `</svg>`;
  const ejede = MALERI_IDS.filter(id => maleriEjet(id) && !isKladde('maleri', id));
  const hvor = id => { for (const s of ['v', 'h']){ const i = gs[s].p.indexOf(id); if (i >= 0) return [s, i]; } return null; };
  const set = (s, i, id) => { gs[s].p[i] = id; setGalleri(gs); };
  const lays = el('div', { class:'gal-lays' }, Object.keys(GALLERI_OPST).map(lay => el('button', { class:'gal-lay' + (lay === w.lay ? ' on' : ''), type:'button', 'aria-pressed': String(lay === w.lay), 'aria-label': GALLERI_NAVN[lay],
    html: opstIkon(lay) + `<span>${GALLERI_NAVN[lay]}</span>`, on:{ click: () => { if (lay === w.lay) return; sfx.pick();
      /* malerierne flyttes med over i den nye opstilling, så længe der er plads */
      const gamle = w.p.filter(Boolean), n = GALLERI_OPST[lay].length; gs[galSide] = { lay, p: Array.from({ length: n }, (_, i) => gamle[i] || null) }; setGalleri(gs); galValgt = Math.min(gamle.length, n - 1); tegnGalleri(); drawRoomScene(); } } })));
  const liste = el('div', { class:'gal-list' }, ejede.map(id => { const h = hvor(id), her = h && h[0] === galSide && h[1] === galValgt;
    return el('button', { class:'gal-mal' + (her ? ' on' : '') + (h && !her ? ' brugt' : ''), type:'button', 'aria-label': MALERIER[id].label, html: maleriMini(id) + `<span>${MALERIER[id].label}</span>`,
      on:{ click: () => { sfx.pick(); if (her){ set(galSide, galValgt, null); } else { if (h) gs[h[0]].p[h[1]] = null; set(galSide, galValgt, id); const nx = gs[galSide].p.indexOf(null); if (nx >= 0) galValgt = nx; }
        tegnGalleri(); drawRoomScene(); } } }); }));
  wrap = el('div', { class:'gal-wrap' }, [ el('div', { class:'gal-panel' }, [
    el('div', { class:'gal-top' }, [ el('h2', {}, galSide === 'v' ? 'Billedvæggen over sengen' : 'Billedvæggen ved hylden'), el('button', { class:'btn primary', type:'button', on:{ click: () => { sfx.magic(); lukGalleri(); } } }, 'Færdig') ]),
    el('div', { class:'gal-body' }, [ el('div', { class:'gal-left' }, [ el('div', { class:'gal-pvbox', html: pv }) ]),
      el('div', { class:'gal-right' }, [ el('p', { class:'gal-help' }, 'Vælg hvordan billederne skal hænge:'), lays,
        el('p', { class:'gal-help' }, ejede.length ? 'Tryk på en ramme, og vælg så et maleri. Tryk på maleriet igen for at tage det ned.' : 'Du har ingen malerier endnu. Dem kan du bytte dig til i arkadens præmiebutik.'), liste ]) ]) ]) ]);
  host.append(wrap);
  wrap.querySelector('.gal-pv').addEventListener('click', e => { const g = e.target.closest('.gal-fr'); if (!g) return; sfx.pick(); galValgt = +g.dataset.i; tegnGalleri(); });
}
