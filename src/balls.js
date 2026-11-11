/* ================= Boblebutikken: alt nyt kommer i magiske sæbebobler ================= */
const BUB_PRICE = 10;
const PET_CATS = ['pet', 'petpat', 'petacc'];
const BUBBLES = [
  { id:'toej', label:'Tøj og hår', cols:['#FF5FA8','#FFE27A','#7FD8FF'], left: () => lockedList().filter(([c]) => !PET_CATS.includes(c)) },
  { id:'dyr', label:'Kæledyr', cols:['#43D3BE','#FFE27A','#B79BFF'], left: () => lockedList().filter(([c]) => PET_CATS.includes(c)) },
  { id:'rum', label:'Værelset', cols:['#8A5BE8','#FFC02E','#FF8FC7'], left: () => roomLocked() },
];
let bubPick = null, bubTaps = 0, bubBusy = false, BUBN = 0;

/* små tegninger inde i boblen */
const BUB_ICON = {
  toej: '<g transform="rotate(-16 150 110)"><path d="M 150 64 L 186 136 Q 150 146 114 136 Z" fill="#7B4FD0" stroke="#4A2E8A" stroke-width="5" stroke-linejoin="round"/><ellipse cx="150" cy="138" rx="48" ry="11" fill="#7B4FD0" stroke="#4A2E8A" stroke-width="5"/><path d="M 136 112 L 164 112" stroke="#FFE27A" stroke-width="6"/></g>'
    + '<g transform="rotate(13 112 196)"><path d="M 76 176 L 100 160 H 124 L 148 176 L 140 192 L 130 188 V 232 H 94 V 188 L 84 192 Z" fill="#43A3D3" stroke="#1F5F8A" stroke-width="5" stroke-linejoin="round"/><path d="M 102 160 Q 112 172 122 160" fill="none" stroke="#1F5F8A" stroke-width="4"/><path d="M 96 210 H 128" stroke="#FFFFFF" stroke-width="4" opacity=".7"/></g>'
    + '<g transform="rotate(-9 200 200) translate(0 -6)"><path d="M 186 160 H 214 L 220 182 L 236 232 Q 200 242 164 232 L 180 182 Z" fill="#FF8FC7" stroke="#B32268" stroke-width="5" stroke-linejoin="round"/><path d="M 192 160 Q 200 170 208 160" fill="none" stroke="#B32268" stroke-width="4"/><path d="M 174 210 Q 200 218 226 210" stroke="#FFE27A" stroke-width="5" fill="none"/></g>',
  dyr: '<ellipse cx="150" cy="178" rx="40" ry="32" fill="#FFB547" stroke="#B9741A" stroke-width="5"/>' + [[106,132,15],[132,108,15],[168,108,15],[194,132,15]].map(([x,y,r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.25}" fill="#FFB547" stroke="#B9741A" stroke-width="5"/>`).join(''),
  rum: '<rect x="88" y="104" width="20" height="96" rx="6" fill="#9C6B43" stroke="#6A4528" stroke-width="4"/><rect x="104" y="160" width="110" height="34" rx="8" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="4"/><path d="M 108 138 Q 128 126 148 138 Q 150 150 148 160 L 108 160 Z" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="4"/><path d="M 140 156 Q 180 146 214 156 L 218 194 L 140 194 Z" fill="#8A5BE8" stroke="#5E3BC4" stroke-width="4"/><rect x="88" y="194" width="134" height="14" rx="5" fill="#9C6B43" stroke="#6A4528" stroke-width="4"/><rect x="92" y="206" width="16" height="18" rx="4" fill="#9C6B43" stroke="#6A4528" stroke-width="4"/><rect x="202" y="206" width="16" height="18" rx="4" fill="#9C6B43" stroke="#6A4528" stroke-width="4"/><path d="M 196 92 A 18 18 0 1 0 214 120 A 14 14 0 1 1 196 92 Z" fill="#FFE27A" stroke="#C99A12" stroke-width="3"/>',
};
/* en sæbeboble: næsten gennemsigtig, regnbuekant, lys fra venstre */
function bubbleSvg(kind, small){
  const b = BUBBLES.find(x => x.id === kind) || BUBBLES[0], [a, c2, c3] = b.cols, n = 'bb' + (BUBN++);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" aria-hidden="true"><defs>
<radialGradient id="${n}f" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#FFFFFF" stop-opacity=".06"/><stop offset=".82" stop-color="${a}" stop-opacity=".2"/><stop offset=".95" stop-color="${c3}" stop-opacity=".45"/><stop offset="1" stop-color="${a}" stop-opacity=".7"/></radialGradient>
<linearGradient id="${n}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".35" stop-color="${c2}"/><stop offset=".65" stop-color="${c3}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
${small ? '' : '<ellipse cx="150" cy="290" rx="70" ry="7" fill="#1A0F3A" opacity=".18"/>'}
<circle cx="150" cy="150" r="130" fill="url(#${n}f)"/>
<g opacity=".92">${BUB_ICON[kind] || ''}</g>
<circle cx="150" cy="150" r="130" fill="none" stroke="url(#${n}r)" stroke-width="${small ? 9 : 6}" opacity=".85"/>
<path d="M 52 112 A 104 104 0 0 1 120 38" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" opacity=".8"/>
<circle cx="56" cy="138" r="7" fill="#FFFFFF" opacity=".8"/>
<path d="M 208 236 A 104 104 0 0 0 250 186" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".45"/>
${small ? '' : star4(250, 60, 12) + star4(46, 236, 9) + star4(270, 222, 7)}</svg>`;
}
const bubbleIcon = kind => bubbleSvg(kind, true);

/* ================= butikken som sted: nissen bag disken, krukker med bobler ================= */
const NISSE = { skin:'#F6D2B8', eyes:{ color:'#6A4A2E', pupil:'rund' }, mk:{ blush:'#FF8FA3', lips:'#C2465E', lipShape:'smil', mark:'ingen', markColor:'#B07A45' },
  front:'tilbage', back:'kort', hair:{ a:'#F4F2F8', b:'#D8D2E6', ombre:false, tie:'#E0457A' },
  robe:{ id:'knapper', a:'#4F8A5A', b:'#F2C14E' }, cape:{ id:'ingen', a:'#2E3F8F', b:'#B79BFF' }, hat:{ id:'spids', a:'#D8343A', b:'#F2C14E' },
  boots:{ id:'snoer', a:'#8A4B2E', b:'#F2C14E' }, acc:{}, pet:{ kind:'ingen', a:'#FFC9E2', b:'#FFFFFF', c:'#B79BFF', pattern:'ingen', eyes:'#3D8BFF', acc:{}, name:'' } };
const JARS = [{ id:'toej', x:200 }, { id:'dyr', x:440 }, { id:'rum', x:680 }];
const NISSE_CHAT = ['Tryk tre gange på en boble, så springer den. Det er hele hemmeligheden!', 'Jeg har puttet bobler i krukker i over tre hundrede år.', 'Hver boble har noget nyt indeni. Man ved aldrig hvad!', 'Stjerner får du i Modehuset. Kom igen, når du har nogle!', 'Mit skæg? Det er helt ægte. Træk ikke i det!'];
const NISSE_WOW = ['Sikke et fund!', 'Uh, den er da fin!', 'Den kan jeg godt lide!', 'Hvor heldigt!'];
let nisseLine = '', chatN = 0;
/* nissens skæg, store næse og overskæg, tegnet oven på figuren (figurens koordinater) */
/* nissen gøres gammel oven på figuren (figurens koordinater): pjusket hår i siderne, tunge øjenlåg,
   poser under øjnene, rynker, stor næse, briller, buskede bryn og langt skæg */
const NISSE_EYE = [[355, 397], [446, 397]];
const NISSE_BEARD = [1, -1].map(f => { const X = x => 400.5 + f * (x - 400.5);
    return `<path d="M ${X(326)} 322 L ${X(290)} 326 L ${X(300)} 342 L ${X(266)} 352 L ${X(290)} 368 L ${X(258)} 386 L ${X(286)} 398 L ${X(262)} 420 L ${X(292)} 428 L ${X(274)} 456 L ${X(304)} 452 L ${X(298)} 478 L ${X(326)} 462 Z" fill="#F4F2F8" stroke="#C9C2DA" stroke-width="3" stroke-linejoin="round"/>`; }).join('')
  + NISSE_EYE.map(([x, y]) => `<path d="M ${x-31} ${y+2} C ${x-30} ${y-36} ${x+30} ${y-36} ${x+31} ${y+2} C ${x+12} ${y-6} ${x-12} ${y-6} ${x-31} ${y+2} Z" fill="#F2CBB0"/><path d="M ${x-28} ${y+1} C ${x-12} ${y-6} ${x+12} ${y-6} ${x+28} ${y+1}" stroke="#A8745E" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
      + `<path d="M ${x-20} ${y+26} Q ${x} ${y+34} ${x+20} ${y+26} M ${x-14} ${y+34} Q ${x} ${y+40} ${x+14} ${y+34}" stroke="#C99A86" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join('')
  + `<path d="M 312 418 C 296 480 318 586 400 640 C 482 586 504 480 488 418 C 472 452 440 470 400 470 C 360 470 328 452 312 418 Z" fill="#FBFAFF" stroke="#C9C2DA" stroke-width="4"/>`
  + `<path d="M 340 500 q 14 16 4 34 M 400 520 q 12 18 0 40 M 456 500 q -14 16 -4 34 M 370 560 q 10 14 2 28 M 430 560 q -10 14 -2 28 M 400 590 q 8 14 0 30" stroke="#DCD6EA" stroke-width="4" fill="none" stroke-linecap="round"/>`
  + `<path d="M 400 446 C 380 430 344 432 330 458 C 348 470 382 470 400 454 C 418 470 452 470 470 458 C 456 432 420 430 400 446 Z" fill="#FFFFFF" stroke="#C9C2DA" stroke-width="3.5"/>`
  + `<ellipse cx="400" cy="426" rx="25" ry="21" fill="#EE9A84" stroke="#C06A56" stroke-width="3"/><ellipse cx="392" cy="418" rx="7" ry="5" fill="#FFFFFF" opacity=".7"/>`
  /* briller */
  + NISSE_EYE.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="31" fill="#E8F6FF" fill-opacity=".12" stroke="#B9862A" stroke-width="5.5"/><path d="M ${x-18} ${y-16} q 8 -8 18 -10" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`).join('')
  + `<path d="M 386 392 Q 400.5 382 415 392" stroke="#B9862A" stroke-width="5" fill="none"/><path d="M 324 392 L 304 386 M 477 392 L 497 386" stroke="#B9862A" stroke-width="5" stroke-linecap="round"/>`
  /* rynker: i panden, ved næsen og på kinderne */
  + `<path d="M 380 356 q 10 -5 20 0 q 10 5 20 0 M 384 364 q 8 -4 16 0 q 8 4 16 0" stroke="#C99A86" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
  + [1, -1].map(f => { const X = x => 400.5 + f * (x - 400.5);
      return `<path d="M ${X(374)} 420 Q ${X(366)} 436 ${X(372)} 450" stroke="#C99A86" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M ${X(318)} 432 Q ${X(324)} 442 ${X(334)} 446" stroke="#C99A86" stroke-width="3" fill="none" stroke-linecap="round"/>`
        + `<path d="M ${X(310)} 348 Q ${X(312)} 326 ${X(336)} 330 Q ${X(350)} 316 ${X(368)} 328 Q ${X(388)} 324 ${X(392)} 342 L ${X(400)} 350 Q ${X(372)} 354 ${X(350)} 350 Q ${X(328)} 362 ${X(304)} 356 Z" fill="#FBFAFF" stroke="#C9C2DA" stroke-width="3"/>`; }).join('');

function shopBleed(){
  const WL = '#163C40', WD = '#5A3A28';
  let o = `<rect x="-1700" y="-700" width="5000" height="2400" fill="${WL}"/>`;
  for (let x = -1700; x < 3300; x += 80) for (let y = 0; y < 560; y += 80) o += `<path d="M ${x+40} ${y} L ${x+80} ${y+40} L ${x+40} ${y+80} L ${x} ${y+40} Z" fill="none" stroke="#1F5157" stroke-width="3"/>`;
  for (let x = -1660; x < 3300; x += 160) for (let y = 40; y < 560; y += 160) o += starP(x, y, 6, '#C9A04A', .35);
  o += `<rect x="-1700" y="-700" width="5000" height="700" fill="#5A3A28"/>` + Array.from({ length: 22 }, (_, i) => `<rect x="${-1700 + i*240}" y="-700" width="70" height="700" fill="#3E2618"/>`).join('');
  o += `<rect x="-1700" y="-30" width="5000" height="40" fill="${WD}"/><rect x="-1700" y="2" width="5000" height="8" fill="#3E2618" opacity=".5"/>`;
  return o;
}
/* hylder med små krukker på væggen */
function shopShelves(){
  const W = '#9C6B43', cols = ['#FF8FC7','#7FD8FF','#FFE27A','#B79BFF','#5FD0B0','#FF9F6B'];
  let o = '', n = 0;
  for (const [x0, x1] of [[40, 560], [1290, 1580]]) for (const y of [190, 330]){
    o += `<rect x="${x0}" y="${y}" width="${x1-x0}" height="16" rx="5" fill="${W}" ${RS(W)}/><path d="M ${x0+30} ${y+16} l 0 26 l 26 -26 M ${x1-30} ${y+16} l 0 26 l -26 -26" stroke="${fdk(W,0.3)}" stroke-width="7" fill="none" stroke-linejoin="round"/>`;
    for (let x = x0 + 34; x < x1 - 30; x += 62){
      const c = cols[n++ % cols.length], h = 58 + (n*13)%26, w = 40;
      o += `<g class="jarsmall" data-hit="hylde" style="animation-delay:${(n%7)*0.4}s"><circle cx="${x}" cy="${y - h*0.45}" r="${h*0.55}" fill="${c}" opacity=".18"/><rect x="${x-w/2}" y="${y-h}" width="${w}" height="${h}" rx="10" fill="#EAF7FF" fill-opacity=".45" stroke="#5A4A6A" stroke-width="2.5"/>`
        + `<circle cx="${x}" cy="${y - h*0.42}" r="${w*0.32}" fill="${c}" opacity=".85"/><circle cx="${x-5}" cy="${y - h*0.42 - 5}" r="3.5" fill="#FFFFFF"/><rect x="${x-w/2-3}" y="${y-h-10}" width="${w+6}" height="12" rx="4" fill="#C99A5B" stroke="#7A5236" stroke-width="2"/></g>`;
    }
  }
  return o;
}
function lantern(x, y){
  return `<path d="M ${x} -30 V ${y-40}" stroke="#3E2618" stroke-width="4"/><circle cx="${x}" cy="${y}" r="70" fill="#FFE27A" opacity=".18"/><path d="M ${x-26} ${y-40} H ${x+26} L ${x+32} ${y+30} H ${x-32} Z" fill="#FFE9A0" stroke="#3E2618" stroke-width="4"/><path d="M ${x} ${y-40} V ${y+30} M ${x-29} ${y-5} H ${x+29}" stroke="#3E2618" stroke-width="3"/><path d="M ${x-34} ${y+30} H ${x+34} L ${x+20} ${y+46} H ${x-20} Z" fill="#3E2618"/><path d="M ${x-20} ${y-40} L ${x} ${y-62} L ${x+20} ${y-40} Z" fill="#3E2618"/>`;
}
/* en stor krukke på disken med en boble indeni */
function bigJar(j){
  const b = BUBBLES.find(x => x.id === j.id), n = b.left().length, x = j.x, top = 322, bot = 528, w = 92;
  let o = `<g data-hit="krukke:${j.id}"><g class="anim">`;
  o += `<ellipse cx="${x}" cy="${bot}" rx="${w+6}" ry="12" fill="${SHC}" opacity=".25"/>`;
  if (n) o += `<circle cx="${x}" cy="${top + 120}" r="120" fill="${b.cols[0]}" opacity=".16"/>`;
  o += `<path d="M ${x-w+10} ${top+40} Q ${x-w} ${top+40} ${x-w} ${top+60} V ${bot-20} Q ${x-w} ${bot} ${x-w+20} ${bot} H ${x+w-20} Q ${x+w} ${bot} ${x+w} ${bot-20} V ${top+60} Q ${x+w} ${top+40} ${x+w-10} ${top+40} Z" fill="#E8F6FF" fill-opacity=".35" stroke="#4A3A6A" stroke-width="4"/>`;
  if (n) o += `<g class="jarbub"><svg x="${x-64}" y="${top+58}" width="128" height="128" viewBox="0 0 300 300">${bubbleSvg(j.id, true).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg></g>`;
  else o += `<text x="${x}" y="${top+150}" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="26" fill="#4A3A6A" opacity=".55">tom</text>`;
  o += `<path d="M ${x-w+14} ${top+70} V ${bot-30}" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity=".55"/>`;
  o += `<rect x="${x-w+14}" y="${top-6}" width="${2*w-28}" height="18" rx="6" fill="#B5844A" stroke="#7A5236" stroke-width="3"/><rect x="${x-w+2}" y="${top+8}" width="${2*w-4}" height="40" rx="10" fill="#FFF6E0" stroke="#7A5236" stroke-width="3.5"/>`;
  o += `<text x="${x}" y="${top+36}" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="${b.label.length > 8 ? 22 : 25}" fill="#3A2340">${b.label}</text>`;
  return o + `</g></g>`;
}
function shopScene(){
  CLIPN = 0;
  const S = 760/1030, nx = 876, ny = 81;
  let o = `<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet">`;
  o += shopBleed() + `<g data-hit="hylde-bg"><rect x="-1700" y="0" width="5000" height="520" fill="transparent"/></g>` + shopShelves() + lantern(1225, 120);
  o += `<g><path d="M 600 -30 V 40 M 960 -30 V 40" stroke="#3E2618" stroke-width="4"/><rect x="560" y="36" width="440" height="84" rx="16" fill="#9C6B43" stroke="#5A3A28" stroke-width="5"/><rect x="574" y="48" width="412" height="60" rx="10" fill="none" stroke="#F2C14E" stroke-width="3"/><text x="780" y="92" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="38" fill="#FFE9A0">Boblebutikken</text></g>`;
  /* nissen */
  /* nissen er gammel og kroget: han hælder lidt frem, og ryggen buer op bag skuldrene */
  o += `<g data-hit="nisse"><g class="anim"><g transform="rotate(-4 1060 560) translate(0 30)">`
    + `<path d="M 930 560 C 930 470 970 440 1010 436 C 1030 434 1090 434 1110 436 C 1150 440 1190 470 1190 560 Z" fill="#3F7A4A" stroke="#2E5A3A" stroke-width="4"/><path d="M 960 470 C 980 452 1000 446 1020 446 M 1100 446 C 1120 446 1140 452 1160 470" stroke="#5A9A62" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`
    + `<image href="${dollUrl(NISSE, { viewBox:'150 40 500 1030', pet:false, anim: !calm, idle: true })}" x="${nx}" y="${ny}" width="369" height="760"/>`
    + `<g transform="translate(${nx} ${ny}) scale(${S}) translate(-150 -40)">${NISSE_BEARD}</g></g></g></g>`;
  /* disken */
  const C = '#7A4E35', F = '#4A3022';
  o += `<rect x="-1700" y="880" width="5000" height="900" fill="${F}"/>` + Array.from({ length: 30 }, (_, i) => `<path d="M ${-1700 + i*170} 880 V 1800" stroke="${fdk(F,0.2)}" stroke-width="3"/>`).join('');
  o += `<rect x="-1700" y="540" width="5000" height="350" fill="${C}"/><rect x="-1700" y="850" width="5000" height="40" fill="${fdk(C,0.2)}"/>`;
  /* vitrinerne i disken: bobler der svæver rundt */
  const bc = ['#FF8FC7','#7FD8FF','#FFE27A','#B79BFF','#5FD0B0','#FF9F6B'];
  for (const [x0, x1] of [[-700, -40], [40, 520], [580, 1020], [1080, 1560], [1640, 2300]]){
    const d = `M ${x0} 600 H ${x1} V 826 H ${x0} Z`;
    o += `<path d="${d}" fill="#163F45" stroke="#7A5236" stroke-width="8"/>` + clipG(d, `<rect x="${x0}" y="600" width="${x1-x0}" height="226" fill="#1E5A5E"/>`
      + Array.from({ length: 7 }, (_, i) => { const bx = x0 + 40 + ((i * 67 + x0) % (x1 - x0 - 80) + (x1 - x0 - 80)) % (x1 - x0 - 80), by = 650 + (i * 37) % 150, r = 16 + (i * 7) % 18, c = bc[(i + Math.abs(x0)) % bc.length];
        return `<g class="vbub" style="animation-delay:${-(i*0.7).toFixed(1)}s;animation-duration:${(3 + i%3).toFixed(1)}s"><circle cx="${bx}" cy="${by}" r="${r}" fill="${c}" opacity=".4" stroke="${lt(c,0.3)}" stroke-width="3"/><circle cx="${bx - r*0.35}" cy="${by - r*0.35}" r="${r*0.22}" fill="#FFFFFF" opacity=".8"/></g>`; }).join('')
      + `<path d="M ${x0+20} 600 L ${x0+80} 600 L ${x0+20} 680 Z" fill="#FFFFFF" opacity=".12"/>`);
  }
  o += `<rect x="-1700" y="514" width="5000" height="34" rx="8" fill="#9C6B43" stroke="#5A3A28" stroke-width="4"/><rect x="-1700" y="514" width="5000" height="8" fill="#B88A5A"/>`;
  o += JARS.map(bigJar).join('');
  /* klokke og prisskilt */
  o += `<g data-hit="klokke"><g class="anim"><ellipse cx="1240" cy="512" rx="40" ry="8" fill="#7A5236"/><path d="M 1206 508 C 1206 470 1222 446 1240 446 C 1258 446 1274 470 1274 508 Z" fill="#F2C14E" stroke="#A87A1A" stroke-width="4"/><circle cx="1240" cy="440" r="8" fill="#F2C14E" stroke="#A87A1A" stroke-width="3"/><path d="M 1222 470 q 6 -14 14 -18" stroke="#FFF6D0" stroke-width="5" fill="none" stroke-linecap="round"/></g></g>`;
  o += `<g><path d="M 1400 512 L 1430 360 M 1530 512 L 1500 360" stroke="#7A5236" stroke-width="8" stroke-linecap="round"/><rect x="1380" y="350" width="170" height="120" rx="10" fill="#3A4A44" stroke="#9C6B43" stroke-width="8"/><text x="1465" y="400" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="24" fill="#FFFFFF">1 boble</text><text x="1452" y="440" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="26" fill="#FFE27A">${BUB_PRICE}</text>${starP(1490, 431, 13, '#FFE27A')}</g>`;
  o += cobweb(-10, 0, 1) + cobweb(1610, 0, -1);
  o += placeMood([[1225, 160, 420, 320], [1100, 360, 360, 300], [430, 640, 520, 220]], { vign: .8, dx: 200, dw: 1200 });
  /* nissens taleboble */
  o += `<g class="say" pointer-events="none"><path d="M 600 160 Q 600 132 628 132 H 952 Q 980 132 980 160 V 262 Q 980 290 952 290 H 940 L 990 336 L 896 290 H 628 Q 600 290 600 262 Z" fill="#FFFFFF" stroke="#4A3A6A" stroke-width="4"/>`
    + `<foreignObject x="612" y="136" width="356" height="150"><div xmlns="http://www.w3.org/1999/xhtml" class="say-text"></div></foreignObject></g>`;
  o += `<g class="fx" pointer-events="none"></g></svg>`;
  return scopeIds(o, 'sh');
}
function say(text){ nisseLine = text; const t = $('#shopScene .say-text'); if (!t) return; t.textContent = text; const g = t.closest('.say'); if (g){ g.classList.remove('popsay'); void g.getBoundingClientRect(); g.classList.add('popsay'); } }
function greetLine(){ return prog.stars >= BUB_PRICE ? 'Goddag, goddag! Velkommen i Boblebutikken. Vælg en krukke, så puster jeg en boble til dig.' : `Goddag! En boble koster ${BUB_PRICE} stjerner, og du har ${prog.stars}. Spil i Modehuset, så ses vi!`; }

function showBalls(){ showScreen('#balls'); playMusic('byen'); bubPick = null; bubTaps = 0; bubBusy = false; renderShop(greetLine()); }
function renderShop(line){
  const box = $('#ballsBody'); box.innerHTML = '';
  box.append(el('div', { class:'scene-wrap', id:'shopScene' }), ...placeUi([ backBtn('Byen', showTown) ], [ starPill() ]));
  const w = $('#shopScene'); w.innerHTML = shopScene();
  const svg = w.querySelector('svg');
  svg.addEventListener('click', e => { const g = e.target.closest('[data-hit]'); if (g) shopTap(g.dataset.hit, g, svgPoint(svg, e)); });
  say(line || nisseLine || greetLine());
}
function shopTap(hit, g, p){
  if (bubBusy) return;
  const svg = $('#shopScene svg'), [k, v] = hit.split(':');
  if (k === 'nisse'){ sfx.pick(); replay(g, 'hop'); say(NISSE_CHAT[chatN++ % NISSE_CHAT.length]); return; }
  if (k === 'klokke'){ sfx.coin(); replay(g, 'wiggle'); say('Ja ja, jeg kommer! Jeg står lige her.'); return; }
  if (k === 'hylde'){ sfx.pick(); replay(g, 'wiggle'); sparkle(svg, p.x, p.y, 5, '#FFE27A'); return; }
  if (k === 'krukke'){
    const b = BUBBLES.find(x => x.id === v), left = b.left();
    replay(g, 'jiggle');
    if (!left.length){ sfx.nope(); say(`Krukken med ${b.label.toLowerCase()} er tom. Du har fundet det hele!`); return; }
    if (prog.stars < BUB_PRICE){ sfx.nope(); say(`Du mangler ${BUB_PRICE - prog.stars} stjerner. Kom tilbage, når du har spillet lidt i Modehuset.`); return; }
    sfx.magic(); bubPick = v; blowBubble(g, b);
    return;
  }
  sfx.pick(); sparkle(svg, p.x, p.y, 4);
}
/* nissen puster en boble op af krukken; den svæver frem til dig */
function blowBubble(jar, b){
  bubBusy = true; bubTaps = 0;
  say(`${b.label}! Det bliver ${BUB_PRICE} stjerner. Nu puster jeg…`);
  const box = $('#ballsBody'), r = jar.getBoundingClientRect(), br = box.getBoundingClientRect();
  const size = Math.min(br.height * 0.42, 340);
  const bub = el('button', { class:'bub shop-bub', type:'button', 'aria-label':'Boblen', html: bubbleSvg(b.id), style:`left:${r.left - br.left + r.width/2 - 30}px;top:${r.top - br.top + r.height*0.4 - 30}px;width:60px` });
  const drops = el('div', { class:'bub-drops shop-drops', 'aria-hidden':'true' });
  box.append(bub, drops);
  requestAnimationFrame(() => requestAnimationFrame(() => { bub.style.left = (br.width * 0.4 - size/2) + 'px'; bub.style.top = (br.height * 0.6 - size/2) + 'px'; bub.style.width = size + 'px'; }));
  setTimeout(() => { bubBusy = false; say('Tryk tre gange på boblen!'); }, 1100);
  bub.addEventListener('click', () => tapShopBubble(bub, drops, b));
}
async function tapShopBubble(bub, drops, b){
  if (bubBusy) return;
  bubTaps++;
  bub.style.setProperty('--grow', 1 + bubTaps * 0.08);
  bub.classList.remove('wobble'); void bub.offsetWidth; bub.classList.add('wobble'); sfx.wobble();
  if (bubTaps === 2) say('Én gang til!');
  if (bubTaps < 3) return;
  bubBusy = true; bubTaps = 0;
  const left = b.left();
  if (!left.length || prog.stars < BUB_PRICE){ bub.remove(); bubBusy = false; renderShop(greetLine()); return; }
  await wait(380);
  addStars(-BUB_PRICE);
  const [cat, id] = pick(left);
  prog.unlocked.push(cat + ':' + id); prog.fresh.push(cat + ':' + id); saveProg();
  const r = bub.getBoundingClientRect(), br = $('#ballsBody').getBoundingClientRect();
  drops.style.left = (r.left - br.left + r.width/2) + 'px'; drops.style.top = (r.top - br.top + r.height/2) + 'px';
  popDrops(drops, b.cols);
  bub.classList.add('pop'); sfx.crack();
  await wait(460);
  bub.remove(); setTimeout(() => drops.remove(), 700);
  revealItem(cat, id);
}
function popDrops(host, cols){
  if (!host || calm) return;
  for (let i = 0; i < 16; i++){
    const a = i / 16 * Math.PI * 2, d = 140 + Math.random() * 90;
    host.append(el('span', { style:`--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d).toFixed(0)}px;background:${cols[i % 3]};width:${10 + (i%3)*5}px;height:${10 + (i%3)*5}px` }));
  }
}
function showcaseState(cat){
  const base = figures.length ? fixState(clone(figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].st)) : clone(DEFAULT_STATE);
  if ((cat === 'petpat' || cat === 'petacc') && base.pet.kind === 'ingen') base.pet.kind = 'kat';
  return base;
}
function showcaseState(cat){
  const base = figures.length ? fixState(clone(figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].st)) : clone(DEFAULT_STATE);
  if ((cat === 'petpat' || cat === 'petacc') && base.pet.kind === 'ingen') base.pet.kind = 'kat';
  return base;
}
function revealItem(cat, id){
  let img, catLabel, name, tryBtn;
  if (cat === 'rum'){
    const [slot, item] = id.split('.'), s = ROOM_SLOTS.find(x => x.id === slot);
    const room = Object.assign(getRoom(), { [slot]: item });
    img = el('img', { alt:'', src: svgUrl(roomSvg(room, { only: slot, viewBox: ROOM_VB[slot] })) });
    catLabel = 'Værelset · ' + s.label; name = s.cat[item].label;
    tryBtn = el('button', { class:'btn', type:'button', on:{ click: () => goTo(() => { showRoom(); openRoomBook(slot); }) } }, 'Se det i værelset');
  } else {
    const info = CAT_INFO[cat];
    const st = showcaseState(cat);
    info.apply(st, id);
    if (cat === 'boots') st.robe.id = 'kort';
    if (cat === 'hat' || cat === 'front') st.acc = {};
    const vb = typeof info.vb === 'function' ? info.vb(id) : info.vb;
    const hl = info.multi ? cat + ':' + id : cat;
    img = dollImg(st, info.petOnly ? { viewBox: vb, petOnly: true, hl } : { viewBox: vb, pet: false, bg: true, hl });
    catLabel = info.label; name = info.name(id);
    tryBtn = figures.length ? el('button', { class:'btn', type:'button', on:{ click: () => tryOn(cat) } }, 'Prøv den på') : null;
  }
  const close = () => { sfx.pick(); veil.remove(); bubPick = null; renderShop(pick(NISSE_WOW) + (prog.stars >= BUB_PRICE ? ' Skal det være en til?' : ' Kom snart igen!')); };
  const card = el('div', { class:'reveal' }, [
    el('span', { class:'new-badge' }, 'NY!'),
    el('div', { class:'reveal-pic' }, img),
    el('p', { class:'reveal-cat' }, catLabel),
    el('h3', { class:'reveal-name' }, name),
    el('div', { class:'row center' }, [ tryBtn, el('button', { class:'btn hot', type:'button', on:{ click: close } }, 'Tilbage til disken') ]),
  ]);
  const veil = el('div', { class:'shop-veil' }, [ card ]);
  $('#ballsBody').append(veil);
  say(pick(NISSE_WOW));
  confetti(veil, 50);
  bubBusy = false;
}
function tryOn(cat){
  const f = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0];
  const tabFor = { front:'pande', back:'bag', robe:'kjole', cape:'kappe', hat:'hat', boots:'sko', acc:'tilbehoer', pupil:'oejne', lip:'ansigt', mark:'ansigt' };
  const petTabFor = { pet:'dyr', petpat:'pels', petacc:'dyretilbehoer' };
  openEditor(f, { tab: tabFor[cat] || 'oejne', petTab: petTabFor[cat] });
}
