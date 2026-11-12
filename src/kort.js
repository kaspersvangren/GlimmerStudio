/* ================= Det nye kort over byen (skitse til Tegnebordet) =================
   Ligger i sin egen lukkede kasse (Kort). Spillet bruger stadig det gamle kort, indtil skitsen er godkendt.

   Sådan skal stedet se ud (skrevet ned før tegningen):
   - Et finurligt, magisk lille bysamfund i skumringen, set lidt oppefra som et illustreret kort. Alt er en smule skævt,
     tykt og hyggeligt, med varmt lys i vinduerne, røg fra skorstene og små ting, man kan opdage.
   - Bagerst i midten: skolen, et stort slot på en bakke med mange tårne, spidse tage, vimpler, oplyste vinduer og svævende
     lys. Forrest ved bakkens fod: skolens port, en bred stenbygning med to porttårne, en stor buet port med jernbeslag,
     faner og fakler. Månen står ude til højre på himlen, så den aldrig gemmer sig bag porten.
   - Til højre for skolen: dyreparken, som hører til skolen. Hegn af skæve stokke, en rund stald med græstag, en fold
     med en enhjørning og et par kaniner, en lille dam, en høstak og en skæv vandrende.
   - Til venstre bagerst: en bakke med en hule. En sti snor sig derop fra byen. Foran hulen ligger en gammel, tyk drage
     med briller, nathue og et lille skæg og puster røgringe.
   - I midten: torvet med brosten og en ønskebrønd, hvor vandet bobler i lilla og små bobler stiger op. Et skilt med
     pile i alle retninger, et skævt klokketårn, bænke og lygtepæle, hvis flammer svæver lidt over glasset.
   - Til venstre: kollegiet, et højt og skævt hus i flere etager, der læner sig, med mange små vinduer, et rundt
     uglevindue, altaner med planter, tøjsnore med kapper og sokker, et kosteholder ved døren og flere skorstene.
   - Til højre: Boblebutikken med en glaskuppel fuld af farvede bobler, der stiger op af skorstenen.
   - Forrest: koncertsalen (et skævt hus med et kæmpe grammofonhorn på taget og noder, der flyver ud), caféen
     (hyggelig med markise, kager i vinduet og damp fra en tekande-skorsten) og den magiske arkade (blinkende stjerner,
     runde vinduer med en gribemaskine og en pinball, en snurrende stjerne på taget).
   - En bæk løber gennem byen under en pukkelbro, hvor en bro-trold sover med fødderne ude.
   - Små ting overalt: lysende svampe langs stierne, en postugle, en kost med indkøbsposer, der flyver over himlen,
     flagermus om slottets tårne, en kat på et tag, en snegl, et græskar eller to, ildfluer. */
const Kort = (() => {
  /* ---------- fælles småting ---------- */
  const E = '#2A1E52';                       // mørk streg
  const lit = (x, y, w, h) => { LITS.push([x, y, w, h]); };
  const glowWin = (x, y, w, h, o = {}) => {
    /* et oplyst vindue med sprosser og karm; buet top hvis o.arch */
    const fr = o.frame || '#3A2E5A', g = o.glow || '#FFD36E', r = o.arch ? w / 2 : 3;
    let s = o.arch ? `<path d="M ${x - 4} ${y + h + 4} V ${y + w / 2} A ${w / 2 + 4} ${w / 2 + 4} 0 0 1 ${x + w + 4} ${y + w / 2} V ${y + h + 4} Z" fill="${fr}"/>`
      + `<path d="M ${x} ${y + h} V ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V ${y + h} Z" fill="${g}"/>`
      : `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="${r + 2}" fill="${fr}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${g}"/>`;
    s += `<rect x="${x}" y="${y + h * .55}" width="${w}" height="${h * .45}" fill="#E8902A" opacity=".35"/>`;
    if (o.cross !== false) s += `<path d="M ${x + w / 2} ${y + (o.arch ? 2 : 0)} V ${y + h} M ${x} ${y + h * .5} H ${x + w}" stroke="${fr}" stroke-width="${Math.max(2, w / 14)}"/>`;
    if (o.shape) s += o.shape;
    if (o.sill !== false) s += `<rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="6" rx="2" fill="${o.sillC || '#5A4A7A'}"/>`;
    lit(x, y, w, h);
    return s;
  };
  const chimney = (x, y, w, h, c, smoke = true, col = '#E8E2FA') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${E}" stroke-width="2.5"/><rect x="${x - 4}" y="${y - 8}" width="${w + 8}" height="10" rx="2" fill="${dk(c, -0.15)}" stroke="${E}" stroke-width="2.5"/>`
    + (smoke && !calm ? [0, 1, 2].map(i => `<circle cx="${x + w / 2}" cy="${y - 14}" r="6" fill="${col}" opacity="0"><animate attributeName="cy" values="${y - 14};${y - 110}" dur="5s" begin="${i * 1.66}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x + w / 2};${x + w / 2 + 30}" dur="5s" begin="${i * 1.66}s" repeatCount="indefinite"/><animate attributeName="r" values="6;20" dur="5s" begin="${i * 1.66}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.75;0" dur="5s" begin="${i * 1.66}s" repeatCount="indefinite"/></circle>`).join('') : '');
  /* lysende svampe i en lille klynge */
  const shrooms = (x, y, n = 3, k = 1, c = '#7FD8FF') => { let s = `<ellipse cx="${x}" cy="${y}" rx="${26 * k}" ry="${10 * k}" fill="${c}" opacity=".18"/>`;
    for (let i = 0; i < n; i++){ const dx = (i - (n - 1) / 2) * 13 * k + (i % 2) * 3, hgt = (12 + (i * 7) % 9) * k, r = (6 + (i * 5) % 4) * k;
      s += `<path d="M ${x + dx - 2 * k} ${y} V ${y - hgt} H ${x + dx + 2 * k} V ${y} Z" fill="#EDE6FF"/><path d="M ${x + dx - r} ${y - hgt} A ${r} ${r * .8} 0 0 1 ${x + dx + r} ${y - hgt} Z" fill="${c}" stroke="${dk(c, -0.35)}" stroke-width="1.5"/><circle cx="${x + dx - r * .35}" cy="${y - hgt - r * .35}" r="${r * .2}" fill="#FFFFFF" opacity=".9"/>`; }
    return s; };
  /* et magisk træ: snoet stamme, mørke kroner og små lanterner i grenene */
  const magicTree = (x, y, k = 1, lanterns = true) => {
    const c = CM.winter ? ['#E6EEFA', '#F6FAFF'] : CM.season === 'efteraar' ? ['#C0602E', '#E08A3A'] : ['#3E6E4E', '#4E8A5A'];
    let s = `<ellipse cx="${x}" cy="${y}" rx="${40 * k}" ry="${11 * k}" fill="#1A1238" opacity=".22"/>`;
    s += `<path d="M ${x - 10 * k} ${y} C ${x - 6 * k} ${y - 30 * k} ${x - 16 * k} ${y - 50 * k} ${x - 4 * k} ${y - 70 * k} L ${x + 6 * k} ${y - 70 * k} C ${x + 2 * k} ${y - 50 * k} ${x + 14 * k} ${y - 30 * k} ${x + 10 * k} ${y} Z" fill="#6E4A3A" stroke="#3A2420" stroke-width="2"/>`;
    s += [[0, -100, 42], [-30, -84, 30], [30, -82, 31], [-14, -124, 28], [18, -126, 27]].map(([dx, dy, r], i) => `<circle cx="${x + dx * k}" cy="${y + dy * k}" r="${r * k}" fill="${c[i % 2]}" stroke="${dk(c[0], -0.3)}" stroke-width="2"/>`).join('');
    s += `<circle cx="${x - 12 * k}" cy="${y - 116 * k}" r="${11 * k}" fill="#FFFFFF" opacity=".12"/>`;
    if (lanterns) s += [[-26, -78], [22, -96], [-4, -112]].map(([dx, dy], i) => `<path d="M ${x + dx * k} ${y + (dy - 10) * k} V ${y + dy * k}" stroke="#2A1E52" stroke-width="1.2"/><circle cx="${x + dx * k}" cy="${y + (dy + 5) * k}" r="${10 * k}" fill="#FFD36E" opacity=".25"/><rect x="${x + (dx - 4) * k}" y="${y + dy * k}" width="${8 * k}" height="${10 * k}" rx="${2 * k}" fill="${['#FFD36E', '#FF8FC7', '#7FD8FF'][i]}" stroke="#2A1E52" stroke-width="1"/>`).join('');
    return s; };
  /* en lygtepæl, hvor flammen svæver lidt over glasset */
  const magicLamp = (x, y, c = '#FFD36E') => { LAMPS.push([x, y - 116]);
    return `<ellipse cx="${x}" cy="${y}" rx="12" ry="4" fill="#1A1238" opacity=".2"/><path d="M ${x - 3} ${y} V ${y - 92} Q ${x - 3} ${y - 104} ${x + 8} ${y - 108}" stroke="#2E2448" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M ${x - 8} ${y - 6} h 10" stroke="#2E2448" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M ${x - 7} ${y - 104} h 22 l -3 16 h -16 Z" fill="#3E3460" stroke="#2E2448" stroke-width="2"/><path d="M ${x - 4} ${y - 102} h 16 l -2 12 h -12 Z" fill="${c}" opacity=".5"/>`
      + `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="2.6s" repeatCount="indefinite"/><path d="M ${x + 4} ${y - 128} q 7 8 0 14 q -7 -6 0 -14 Z" fill="${c}"/><circle cx="${x + 4}" cy="${y - 120}" r="12" fill="${c}" opacity=".25"/></g>`; };
  const bench2 = (x, y) => `<ellipse cx="${x}" cy="${y + 2}" rx="38" ry="5" fill="#1A1238" opacity=".2"/><path d="M ${x - 34} ${y - 30} Q ${x} ${y - 38} ${x + 34} ${y - 30} V ${y - 22} Q ${x} ${y - 30} ${x - 34} ${y - 22} Z" fill="#8A5A3C" stroke="#4A2E1E" stroke-width="2"/><rect x="${x - 36}" y="${y - 16}" width="72" height="7" rx="3" fill="#9C6A48" stroke="#4A2E1E" stroke-width="2"/><path d="M ${x - 30} ${y - 10} q -4 6 -2 12 M ${x + 30} ${y - 10} q 4 6 2 12" stroke="#2E2448" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const pumpkin = (x, y, k = 1) => CM.season !== 'efteraar' ? '' : `<ellipse cx="${x}" cy="${y}" rx="${16 * k}" ry="${4 * k}" fill="#1A1238" opacity=".2"/><ellipse cx="${x - 6 * k}" cy="${y - 10 * k}" rx="${9 * k}" ry="${11 * k}" fill="#E07A2A"/><ellipse cx="${x + 6 * k}" cy="${y - 10 * k}" rx="${9 * k}" ry="${11 * k}" fill="#E07A2A"/><ellipse cx="${x}" cy="${y - 10 * k}" rx="${9 * k}" ry="${12 * k}" fill="#F08A3A" stroke="#A04A1A" stroke-width="1.5"/><path d="M ${x} ${y - 22 * k} q 2 -6 6 -6" stroke="#4A7A3A" stroke-width="${3 * k}" fill="none"/>`
    + (CM.dark ? `<path d="M ${x - 5 * k} ${y - 13 * k} l 2 -3 l 2 3 Z M ${x + 1 * k} ${y - 13 * k} l 2 -3 l 2 3 Z M ${x - 5 * k} ${y - 7 * k} q 5 4 10 0" fill="#FFE27A" stroke="#FFE27A" stroke-width="1"/>` : '');
  const signPost = (x, y, arrows) => { let s = `<ellipse cx="${x}" cy="${y}" rx="18" ry="5" fill="#1A1238" opacity=".2"/><path d="M ${x - 4} ${y} L ${x - 3} ${y - 150} L ${x + 3} ${y - 150} L ${x + 4} ${y} Z" fill="#7A5038" stroke="#3A2420" stroke-width="2"/><circle cx="${x}" cy="${y - 154}" r="7" fill="#F2C14E" stroke="#8A6420" stroke-width="2"/>`;
    arrows.forEach(([t, d, rot, col], i) => { const yy = y - 140 + i * 22, w = t.length * 9 + 26;
      s += `<g transform="rotate(${rot} ${x} ${yy})"><path d="${d > 0 ? `M ${x} ${yy - 9} H ${x + w} L ${x + w + 10} ${yy} L ${x + w} ${yy + 9} H ${x} Z` : `M ${x} ${yy - 9} H ${x - w} L ${x - w - 10} ${yy} L ${x - w} ${yy + 9} H ${x} Z`}" fill="${col}" stroke="#3A2420" stroke-width="2"/><text x="${x + d * (w / 2 + 2)}" y="${yy + 5}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="13" fill="#3A2420">${t}</text></g>`; });
    return s; };

  /* ---------- himlen ---------- */
  function sky(){
    const [sa, sb] = SKY[CM.time];
    let s = `<rect x="-900" y="-700" width="3400" height="1700" fill="${sa}"/><rect x="-900" y="0" width="3400" height="320" fill="url(#kSky)"/>`;
    SEED = 3; s += Array.from({ length: CM.night ? 90 : 50 }, () => `<circle cx="${(-200 + rnd() * 2000).toFixed(0)}" cy="${(rnd() * 190).toFixed(0)}" r="${(.8 + rnd() * 1.8).toFixed(1)}" fill="#FFFFFF" opacity="${(.3 + rnd() * .6).toFixed(2)}">${rnd() < .4 && !calm ? `<animate attributeName="opacity" values="1;.2;1" dur="${(2 + rnd() * 3).toFixed(1)}s" repeatCount="indefinite"/>` : ''}</circle>`).join('');
    /* månen ude til højre, med kratere og et lille skær */
    s += `<g transform="translate(1440 78)"><circle r="96" fill="#FFF6D8" opacity=".08"/><circle r="64" fill="#FFF6D8" opacity=".14"/><circle r="44" fill="#FFF3C8"/><circle cx="-12" cy="-10" r="8" fill="#EADBA8"/><circle cx="14" cy="8" r="6" fill="#EADBA8"/><circle cx="-4" cy="18" r="4" fill="#EADBA8"/><circle cx="18" cy="-16" r="3.5" fill="#EADBA8"/></g>`;
    /* en lille svævende ø med et træ og et vandfald, der drysser ned i ingenting */
    s += `<g transform="translate(1180 96)"><g>${calm ? '' : '<animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur="7s" repeatCount="indefinite"/>'}`
      + `<path d="M -60 0 Q -40 44 -6 60 Q 4 66 10 56 Q 40 40 58 0 Z" fill="#5A4A6E" stroke="${E}" stroke-width="2"/><path d="M -60 0 Q 0 -10 58 0 Q 0 10 -60 0 Z" fill="#5E8A5A" stroke="${E}" stroke-width="2"/>`
      + `<path d="M 26 4 V 70" stroke="#9FD8FF" stroke-width="5" opacity=".7" stroke-dasharray="6 5">${calm ? '' : '<animate attributeName="stroke-dashoffset" values="11;0" dur=".5s" repeatCount="indefinite"/>'}</path>`
      + `<path d="M -22 -2 V -26" stroke="#5A3A28" stroke-width="4"/><circle cx="-22" cy="-34" r="14" fill="#4E8A5A" stroke="${E}" stroke-width="2"/><circle cx="-28" cy="-38" r="3" fill="#FF8FC7"/>`
      + `<path d="M 0 -2 V -16 L 8 -22 L 16 -16 V -2 Z" fill="#E8D8F0" stroke="${E}" stroke-width="1.5"/><path d="M -2 -15 L 8 -24 L 18 -15" fill="#B5432A" stroke="${E}" stroke-width="1.5"/><rect x="6" y="-12" width="5" height="6" fill="#FFD36E"/></g></g>`;
    /* skyer, der driver langsomt */
    s += [[160, 60, 1, 0], [640, 40, 1.3, 1], [980, 150, .9, 2]].map(([x, y, k, i]) => `<g opacity="${CM.night ? .35 : .55}"><animateTransform attributeName="transform" type="translate" values="0 0;${50 + i * 14} 0;0 0" dur="${50 + i * 9}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(${k})"><ellipse rx="60" ry="16" fill="#8A7AB8"/><ellipse cx="-24" cy="-10" rx="30" ry="16" fill="#9A8AC8"/><ellipse cx="18" cy="-14" rx="34" ry="18" fill="#9A8AC8"/></g></g>`).join('');
    /* fjerne bjerge */
    s += `<path d="M -900 230 L -300 150 L -120 196 L 60 120 L 220 180 L 420 132 L 600 190 L 820 150 L 1000 196 L 1180 140 L 1360 186 L 1560 130 L 1800 180 L 2500 160 L 2500 260 L -900 260 Z" fill="#3A2E6A" opacity=".85"/>`;
    s += `<path d="M -900 240 L -200 200 L 100 228 L 380 196 L 700 230 L 1000 210 L 1300 232 L 1600 204 L 2500 220 L 2500 270 L -900 270 Z" fill="#43367A"/>`;
    return s;
  }

  /* ---------- dragens bakke og hule ---------- */
  function dragonHill(){
    const g = CM.winter ? '#DDE6F4' : '#4E6E50', g2 = CM.winter ? '#EEF3FB' : '#5E8A5A';
    let s = `<g transform="translate(-90 -6)">`;
    s += `<path d="M -900 330 C -500 250 -200 200 60 156 C 200 136 330 170 420 230 C 500 280 560 330 640 400 L -900 400 Z" fill="${g}"/><path d="M -900 330 C -500 250 -200 200 60 156 C 200 136 330 170 420 230 C 500 280 560 330 640 400" stroke="${E}" stroke-width="2.5" fill="none"/>`;
    s += `<path d="M -900 350 C -400 300 -100 250 120 220 C 260 206 380 250 470 300 C 520 330 570 360 620 400 L -900 400 Z" fill="${g2}"/><rect x="-900" y="372" width="1540" height="40" fill="url(#kGrass)" opacity=".0"/>`;
    /* klipper og hulen */
    s += `<path d="M 110 262 C 100 220 130 180 180 176 C 230 172 268 200 272 246 C 274 266 266 278 258 284 L 120 284 Z" fill="#6E6488" stroke="${E}" stroke-width="2.5"/>`;
    s += `<path d="M 138 284 C 136 246 156 220 186 218 C 216 216 238 240 238 284 Z" fill="#1A1238"/><path d="M 150 284 C 150 254 166 236 186 234 C 206 232 222 252 222 284 Z" fill="#2E1E3A"/>`;
    s += `<circle cx="186" cy="262" r="40" fill="#FF8A3D" opacity=".12"/>`;
    s += [[118, 250], [262, 236], [150, 196], [236, 196]].map(([x, y]) => `<path d="M ${x - 10} ${y + 6} L ${x - 4} ${y - 8} L ${x + 8} ${y - 6} L ${x + 12} ${y + 6} Z" fill="#8A80A8" stroke="${E}" stroke-width="1.5"/>`).join('');
    /* dragen: gammel og tyk, ligger på maven foran hulen med briller og nathue, puster røgringe */
    const D = '#6E9A5A', DL = '#8ABA6A', DB = '#E8D48A';
    s += `<g class="k-dragon" transform="translate(196 300)">`;
    s += `<ellipse cx="0" cy="8" rx="96" ry="14" fill="#1A1238" opacity=".3"/>`;
    s += `<path d="M -70 0 C -110 6 -140 -4 -150 -24 C -146 -30 -138 -26 -132 -18 C -120 -8 -100 -10 -84 -16 Z" fill="${D}" stroke="#2E4A2A" stroke-width="2.5"/><path d="M -150 -24 l -8 -10 l 12 2 Z" fill="#B5432A"/>`;
    s += `<path d="M -84 4 C -96 -50 -40 -70 10 -64 C 60 -58 84 -30 80 4 Z" fill="${D}" stroke="#2E4A2A" stroke-width="2.5"/>`;
    s += `<path d="M -62 4 C -60 -26 -20 -36 14 -34 C 44 -32 62 -16 62 4 Z" fill="${DB}" stroke="#A8944A" stroke-width="2"/>` + [-40, -20, 0, 20, 40].map(x => `<path d="M ${x} 2 q 0 -16 4 -28" stroke="#C8B46A" stroke-width="2" fill="none"/>`).join('');
    s += [-60, -30, 0, 30].map((x, i) => `<path d="M ${x - 6} ${-60 - (i % 2) * 4} l 8 -14 l 8 14 Z" fill="#B5432A" stroke="#6A2A1A" stroke-width="1.5"/>`).join('');
    /* en lille, foldet flagermusvinge med knogler og bølget kant (for lille til at flyve med i hans alder) */
    s += `<path d="M -28 -56 L -2 -116 Q 6 -96 20 -100 Q 22 -82 38 -86 Q 38 -70 54 -70 L 30 -58 Z" fill="${DL}" stroke="#2E4A2A" stroke-width="2.5" stroke-linejoin="round"/><path d="M -24 -58 L -2 -112 M -18 -58 L 20 -98 M -10 -58 L 38 -84 M -2 -58 L 52 -70" stroke="#2E4A2A" stroke-width="2" opacity=".55"/><circle cx="-2" cy="-116" r="3" fill="#B5432A"/>`;
    s += [[-70, 2], [44, 2]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="9" fill="${D}" stroke="#2E4A2A" stroke-width="2.5"/><path d="M ${x - 10} ${y + 4} l -3 5 M ${x - 2} ${y + 6} l -1 5 M ${x + 6} ${y + 5} l 1 5" stroke="#F2EEDC" stroke-width="2.5" stroke-linecap="round"/>`).join('');
    s += `<g transform="translate(80 -30)"><path d="M -20 10 C -24 -20 0 -40 30 -38 C 64 -36 80 -16 76 6 C 72 24 46 30 20 28 C 0 26 -16 24 -20 10 Z" fill="${D}" stroke="#2E4A2A" stroke-width="2.5"/>`
      + `<path d="M 40 22 C 56 26 74 20 78 6" stroke="#2E4A2A" stroke-width="2" fill="none"/><path d="M 30 26 q 6 14 -4 22 q 2 -10 -4 -18" fill="#E8E2D0" stroke="#A89A80" stroke-width="1.5"/>`
      + `<ellipse cx="68" cy="-4" rx="3" ry="2" fill="#2E4A2A"/><ellipse cx="74" cy="-2" rx="3" ry="2" fill="#2E4A2A"/>`
      + `<path d="M 14 -12 q 10 -6 18 0" stroke="#2E4A2A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 42 -14 q 10 -6 18 0" stroke="#2E4A2A" stroke-width="3" fill="none" stroke-linecap="round"/>`
      + `<circle cx="23" cy="-11" r="11" fill="#BFE8FF" fill-opacity=".35" stroke="#C9A04A" stroke-width="2.5"/><circle cx="51" cy="-13" r="11" fill="#BFE8FF" fill-opacity=".35" stroke="#C9A04A" stroke-width="2.5"/><path d="M 34 -12 h 6" stroke="#C9A04A" stroke-width="2.5"/>`
      + `<path d="M 8 -30 C 4 -60 30 -76 52 -62 C 60 -78 80 -70 86 -84 C 92 -60 74 -44 58 -40 C 40 -36 20 -32 8 -30 Z" fill="#6B3FA0" stroke="${E}" stroke-width="2"/><path d="M 6 -30 Q 32 -40 62 -38" stroke="#E8E2FA" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="88" cy="-86" r="6" fill="#E8E2FA"/>`
      + `<path d="M -4 -30 l -8 -12 M 6 -36 l -2 -14" stroke="#B5432A" stroke-width="5" stroke-linecap="round"/></g>`;
    if (!calm) s += [0, 1, 2].map(i => `<ellipse cx="160" cy="-34" rx="5" ry="4" fill="none" stroke="#E8E2FA" stroke-width="2.5" opacity="0"><animate attributeName="cx" values="160;210" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/><animate attributeName="cy" values="-34;-110" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/><animate attributeName="rx" values="5;18" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/><animate attributeName="ry" values="4;12" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.85;0" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/></ellipse>`).join('');
    s += `<text x="150" y="-90" font-family="${FONT_C}" font-weight="700" font-size="18" fill="#E8E2FA" opacity=".85">Z<tspan dx="2" dy="-8" font-size="14">z</tspan></text>`;
    s += `</g>`;
    /* bunke guldmønter og en gammel kiste ved hulen */
    s += `<g transform="translate(396 308)">${[[0, 0], [8, -4], [16, 0], [4, -8], [12, -10], [-6, -4]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#F2C14E" stroke="#8A6420" stroke-width="1"/>`).join('')}<rect x="20" y="-16" width="26" height="18" rx="3" fill="#8A5A3C" stroke="#3A2420" stroke-width="2"/><path d="M 20 -10 H 46" stroke="#C9A04A" stroke-width="2.5"/></g>`;
    s += `</g>`;
    return s;
  }
  /* stien op til dragen, med trædesten, lysende svampe og et skilt */
  function dragonPath(){
    const P = 'M 640 620 C 560 600 520 560 470 520 C 420 480 360 470 300 430 C 250 396 210 350 180 314';
    let s = `<path d="${P}" stroke="#8A7A5E" stroke-width="30" fill="none" stroke-linecap="round"/><path d="${P}" stroke="#B8A47E" stroke-width="22" fill="none" stroke-linecap="round" stroke-dasharray="22 10"/>`;
    s += shrooms(498, 528, 3, .9) + shrooms(360, 462, 2, .8, '#C79BFF') + shrooms(236, 376, 3, .7) + shrooms(560, 590, 2, .8, '#FF8FC7');
    s += signPost(430, 512, [['Til dragen', -1, -6, '#E8D8B0'], ['Pas på!', -1, 4, '#F2C14E']]);
    s += `<g transform="translate(424 362)"><circle r="4" fill="#1A1238"/>${calm ? '' : '<animateTransform attributeName="transform" type="translate" values="424 362;430 356;424 362" dur="3s" repeatCount="indefinite"/>'}</g>`;
    /* en krage på skiltet */
    s += `<g transform="translate(424 366)"><ellipse cx="0" cy="0" rx="9" ry="6" fill="#2A2238"/><circle cx="8" cy="-6" r="5" fill="#2A2238"/><path d="M 12 -6 l 6 1 l -6 2 Z" fill="#F2C14E"/><circle cx="9" cy="-7" r="1.2" fill="#FFE27A"/><path d="M -8 0 l -8 3 l 7 2 Z" fill="#2A2238"/></g>`;
    return s;
  }

  /* ---------- skolen: slottet på bakken og porten forrest ---------- */
  function school(){
    const Wl = '#5A4E86', WlD = '#463C70', R = '#5A2A78', RL = '#7A4A98', Y = '#FFD86B';
    let s = `<path d="M 470 400 C 520 300 640 250 800 246 C 960 250 1080 300 1130 400 Z" fill="${CM.winter ? '#DDE6F4' : '#4A6A4E'}" stroke="${E}" stroke-width="2.5"/>`;
    s += `<path d="M 520 400 C 580 330 680 296 800 294 C 920 296 1020 330 1080 400 Z" fill="${CM.winter ? '#EEF3FB' : '#55785A'}"/>`;
    /* tårne bagest: højde, bredde, tagspids */
    const tower = (x, w, top, apex, flag) => { let t = `<rect x="${x}" y="${top}" width="${w}" height="${330 - top}" fill="${Wl}" stroke="${E}" stroke-width="2.5"/><rect x="${x}" y="${top}" width="${w}" height="${330 - top}" fill="url(#kStone)"/>`;
      t += `<path d="M ${x - 8} ${top + 2} L ${x + w / 2} ${apex} L ${x + w + 8} ${top + 2} Z" fill="${R}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><path d="M ${x + w / 2} ${apex} L ${x + w / 2 - 4} ${top + 2}" stroke="${RL}" stroke-width="3"/>`;
      t += `<path d="M ${x - 8} ${top + 2} Q ${x + w / 2} ${top + 10} ${x + w + 8} ${top + 2}" stroke="${E}" stroke-width="2" fill="none"/>`;
      if (CM.winter) t += `<path d="M ${x - 6} ${top} L ${x + w / 2} ${apex + 4} L ${x + w + 6} ${top}" stroke="#FFF" stroke-width="4" fill="none" opacity=".8"/>`;
      if (flag) t += `<path d="M ${x + w / 2} ${apex} V ${apex - 26}" stroke="${E}" stroke-width="2.5"/><path d="M ${x + w / 2} ${apex - 26} q 12 2 22 -2 q -6 8 0 14 q -10 4 -22 2 Z" fill="${flag}" stroke="${E}" stroke-width="1.5">${calm ? '' : `<animateTransform attributeName="transform" type="skewY" values="0;6;0" dur="2.4s" repeatCount="indefinite"/>`}</path>`;
      for (let yy = top + 26; yy < 316; yy += 34) t += `<path d="M ${x + w / 2 - 6} ${yy + 14} V ${yy + 4} a 6 6 0 0 1 12 0 V ${yy + 14} Z" fill="${(yy / 34 | 0) % 3 === 1 ? '#3A2E5A' : Y}">${calm ? '' : `<animate attributeName="opacity" values="1;.75;1" dur="${(2 + (x % 5) * .5).toFixed(1)}s" repeatCount="indefinite"/>`}</path>`;
      return t; };
    s += tower(600, 48, 196, 120, '#E0457A') + tower(940, 50, 190, 112, '#7FD8FF') + tower(700, 44, 166, 92) + tower(852, 46, 170, 100, '#F2C14E');
    /* hovedbygningen med en stor rosette og to rækker spidsbuede vinduer */
    s += `<rect x="650" y="230" width="300" height="100" fill="${WlD}" stroke="${E}" stroke-width="2.5"/><rect x="650" y="230" width="300" height="100" fill="url(#kStone)"/>`;
    s += `<path d="M 640 232 L 670 196 H 930 L 960 232 Z" fill="${R}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += [670, 700, 730, 860, 890, 920].map(x => `<path d="M ${x} 290 V 270 a 8 8 0 0 1 16 0 V 290 Z" fill="${Y}"/><path d="M ${x + 8} 262 V 290 M ${x} 278 H ${x + 16}" stroke="${WlD}" stroke-width="2"/>`).join('');
    s += `<circle cx="800" cy="262" r="26" fill="#3A2E5A" stroke="${E}" stroke-width="2.5"/><circle cx="800" cy="262" r="20" fill="url(#kRose)"/>` + Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M 800 262 L ${(800 + Math.cos(a) * 20).toFixed(1)} ${(262 + Math.sin(a) * 20).toFixed(1)}" stroke="#3A2E5A" stroke-width="2"/>`; }).join('');
    lit(780, 242, 40, 40);
    /* det høje midtertårn med et ur, der går lidt skævt */
    s += tower(776, 48, 120, 30, '#C79BFF');
    s += `<circle cx="800" cy="146" r="15" fill="#F2EEDC" stroke="${E}" stroke-width="2.5"/><path d="M 800 146 L 800 136 M 800 146 L 808 150" stroke="${E}" stroke-width="2.5" stroke-linecap="round">${calm ? '' : '<animateTransform attributeName="transform" type="rotate" values="0 800 146;360 800 146" dur="60s" repeatCount="indefinite"/>'}</path>`;
    /* flagermus om tårnene */
    if (!calm) s += [[620, 150, 9, 0], [900, 120, 11, 1], [760, 90, 13, 2]].map(([x, y, d, i]) => `<g><animateMotion dur="${d}s" repeatCount="indefinite" path="M ${x} ${y} c 40 -30 90 -10 70 20 c -20 30 -90 30 -70 -20"/><path d="M -9 0 q 4 -6 9 0 q 5 -6 9 0 q -4 2 -9 4 q -5 -2 -9 -4 Z" fill="#1A1238"><animateTransform attributeName="transform" type="scale" values="1 1;1 .3;1 1" dur=".35s" repeatCount="indefinite"/></path></g>`).join('');
    /* svævende lys over slottet */
    if (!calm) s += [[690, 200], [760, 214], [840, 206], [910, 196], [640, 226], [970, 220]].map(([x, y], i) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur="${3 + i * .4}s" repeatCount="indefinite"/><rect x="${x - 2.5}" y="${y}" width="5" height="12" rx="1.5" fill="#F2EEDC"/><path d="M ${x} ${y - 7} q 3 4 0 7 q -3 -3 0 -7 Z" fill="#FFD36E"/><circle cx="${x}" cy="${y - 4}" r="7" fill="#FFD36E" opacity=".25"/></g>`).join('');
    /* porten forrest: bred stenbygning med to porttårne, kæmpe buet port, faner og fakler */
    const gx = 800, gb = 470, gw = 300, gt = 360, S = '#7A72A0', SL = '#4A4270';
    s += `<path d="M ${gx - 40} 330 C ${gx - 30} 360 ${gx - 20} 380 ${gx - 24} ${gt}" stroke="#8A7A5E" stroke-width="0"/>`;
    for (const tx of [gx - gw / 2 - 26, gx + gw / 2 - 52]){
      s += `<rect x="${tx}" y="${gt - 70}" width="78" height="${gb - gt + 70}" fill="${S}" stroke="${E}" stroke-width="3"/><rect x="${tx}" y="${gt - 70}" width="78" height="${gb - gt + 70}" fill="url(#kStone)"/>`;
      s += Array.from({ length: 5 }, (_, i) => `<rect x="${tx + i * 16 - 2}" y="${gt - 84}" width="12" height="16" fill="${S}" stroke="${E}" stroke-width="2.5"/>`).join('');
      s += `<path d="M ${tx + 30} ${gt - 22} V ${gt - 38} a 9 9 0 0 1 18 0 V ${gt - 22} Z" fill="${Y}" stroke="${E}" stroke-width="2"/>` + `<path d="M ${tx + 39} ${gt - 47} V ${gt - 22}" stroke="${E}" stroke-width="2"/>`;
      lit(tx + 30, gt - 47, 18, 25);
      /* fanen med skolens stjerne */
      s += `<path d="M ${tx + 14} ${gt - 4} H ${tx + 64} V ${gt + 60} L ${tx + 39} ${gt + 48} L ${tx + 14} ${gt + 60} Z" fill="#6B3FA0" stroke="${E}" stroke-width="2"/><path d="M ${tx + 14} ${gt + 2} H ${tx + 64}" stroke="#F2C14E" stroke-width="3"/>` + `<polygon points="${star5pts(tx + 39, gt + 24, 12, 5)}" fill="#F2C14E"/>`;
    }
    s += `<rect x="${gx - gw / 2 + 50}" y="${gt}" width="${gw - 100}" height="${gb - gt}" fill="${S}" stroke="${E}" stroke-width="3"/><rect x="${gx - gw / 2 + 50}" y="${gt}" width="${gw - 100}" height="${gb - gt}" fill="url(#kStone)"/>`;
    s += Array.from({ length: 7 }, (_, i) => `<rect x="${gx - gw / 2 + 52 + i * 28}" y="${gt - 14}" width="16" height="16" fill="${S}" stroke="${E}" stroke-width="2.5"/>`).join('');
    /* buen og porten */
    s += `<path d="M ${gx - 62} ${gb} V ${gt + 50} A 62 62 0 0 1 ${gx + 62} ${gt + 50} V ${gb} Z" fill="#3A3054" stroke="${E}" stroke-width="3"/>`;
    s += Array.from({ length: 9 }, (_, i) => { const a = Math.PI * i / 8, x = gx - Math.cos(a) * 68, y = gt + 50 - Math.sin(a) * 68; return `<rect x="${(x - 7).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="14" height="12" rx="2" fill="#8A82AE" stroke="${E}" stroke-width="1.5" transform="rotate(${(a * 180 / Math.PI - 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('');
    s += `<path d="M ${gx - 52} ${gb} V ${gt + 54} A 52 52 0 0 1 ${gx + 52} ${gt + 54} V ${gb} Z" fill="#6E3E2A" stroke="${E}" stroke-width="2.5"/>`;
    s += [-36, -18, 18, 36].map(dx => `<path d="M ${gx + dx} ${gt + 20} V ${gb}" stroke="#4E2A1A" stroke-width="2.5"/>`).join('') + `<path d="M ${gx} ${gt + 2} V ${gb}" stroke="#2A1810" stroke-width="3"/>`;
    s += [gt + 70, gb - 26].map(y => `<rect x="${gx - 52}" y="${y}" width="104" height="10" fill="#2E2A38"/>` + [-40, -22, 22, 40].map(dx => `<circle cx="${gx + dx}" cy="${y + 5}" r="3" fill="#8A82AE"/>`).join('')).join('');
    s += [-1, 1].map(d => `<circle cx="${gx + d * 14}" cy="${gt + 112}" r="8" fill="none" stroke="#C9A04A" stroke-width="3"/><circle cx="${gx + d * 14}" cy="${gt + 104}" r="4" fill="#C9A04A"/>`).join('');
    /* lys der siver ud under porten og et skilt over buen */
    s += `<path d="M ${gx - 52} ${gb} L ${gx - 64} ${gb + 22} H ${gx + 64} L ${gx + 52} ${gb} Z" fill="#FFD36E" opacity=".25"/>`;
    s += `<g transform="translate(${gx} ${gt - 34})"><rect x="-90" y="-20" width="180" height="40" rx="10" fill="#3A2A20" stroke="#C9A04A" stroke-width="3"/><text x="0" y="8" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="22" fill="#FFE9A0">Magiskolen</text></g>`;
    /* fakler ved porten */
    s += [gx - 82, gx + 82].map(x => `<rect x="${x - 3}" y="${gt + 50}" width="6" height="26" fill="#3A2420"/><path d="M ${x - 7} ${gt + 50} h 14 l -2 -8 h -10 Z" fill="#5A4A3A"/><g>${calm ? '' : `<animateTransform attributeName="transform" type="scale" values="1 1;1.1 .92;1 1" dur=".6s" repeatCount="indefinite" additive="sum"/>`}<path d="M ${x} ${gt + 22} q 10 12 0 22 q -10 -10 0 -22 Z" fill="#FF8A3D"/><path d="M ${x} ${gt + 30} q 5 6 0 12 q -5 -6 0 -12 Z" fill="#FFE27A"/></g><circle cx="${x}" cy="${gt + 36}" r="22" fill="#FF8A3D" opacity=".2"/>`).join('');
    /* trapper op til porten */
    s += [0, 1, 2].map(i => `<rect x="${gx - 72 - i * 10}" y="${gb + i * 8}" width="${144 + i * 20}" height="9" rx="2" fill="#8A82AE" stroke="${E}" stroke-width="2"/>`).join('');
    /* en ugle på muren */
    s += `<g transform="translate(${gx + 104} ${gt - 16})"><ellipse rx="10" ry="13" fill="#8A6A4A" stroke="#3A2420" stroke-width="1.5"/><circle cx="-4" cy="-4" r="4" fill="#FFE9A0"/><circle cx="4" cy="-4" r="4" fill="#FFE9A0"/><circle cx="-4" cy="-4" r="2" fill="#1A1238"/><circle cx="4" cy="-4" r="2" fill="#1A1238"/><path d="M -1 0 l 1 3 l 1 -3 Z" fill="#F2C14E"/><path d="M -8 -12 l 2 -5 l 3 4 M 8 -12 l -2 -5 l -3 4" fill="#8A6A4A" stroke="#3A2420" stroke-width="1"/></g>`;
    return placeG('skole', 'Skolen', false, s + hit(gx - gw / 2 - 30, 100, gw + 60, gb - 90));
  }

  /* ---------- dyreparken ved siden af skolen ---------- */
  function zoo(){
    const fence = (x0, y0, x1, y1, n) => { let f = `<path d="M ${x0} ${y0 - 14} L ${x1} ${y1 - 14} M ${x0} ${y0 - 26} L ${x1} ${y1 - 26}" stroke="#8A5A3C" stroke-width="4"/>`;
      for (let i = 0; i <= n; i++){ const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, h = 34 + (i % 3) * 3, tilt = ((i * 7) % 5 - 2) * 2;
        f += `<path d="M ${x - 3} ${y} L ${x - 3 + tilt} ${y - h} L ${x + 3 + tilt} ${y - h - 3} L ${x + 3} ${y} Z" fill="#9C6A48" stroke="#4A2E1E" stroke-width="1.5"/>`; } return f; };
    const g = CM.winter ? '#EEF3FB' : '#6E9A5E';
    let s = `<path d="M 1060 470 C 1080 380 1180 330 1320 324 C 1440 320 1560 340 1640 380 L 1640 500 L 1060 500 Z" fill="${g}" stroke="${E}" stroke-width="2.5"/>`;
    /* den runde stald med græstag og en stor dør */
    const sx = 1300, sb = 420;
    s += `<ellipse cx="${sx}" cy="${sb}" rx="78" ry="14" fill="#1A1238" opacity=".2"/><rect x="${sx - 66}" y="${sb - 74}" width="132" height="74" fill="#B5432A" stroke="${E}" stroke-width="2.5"/>`;
    s += [-44, -22, 0, 22, 44].map(dx => `<path d="M ${sx + dx} ${sb - 74} V ${sb}" stroke="#8A2A1A" stroke-width="2"/>`).join('');
    s += `<path d="M ${sx - 84} ${sb - 70} C ${sx - 80} ${sb - 150} ${sx + 80} ${sb - 150} ${sx + 84} ${sb - 70} Z" fill="${CM.winter ? '#FFFFFF' : '#C9A85A'}" stroke="${E}" stroke-width="2.5"/>` + [-50, -20, 10, 40].map(dx => `<path d="M ${sx + dx} ${sb - 132} q -6 30 -2 62" stroke="#A8884A" stroke-width="2" fill="none"/>`).join('');
    s += `<path d="M ${sx} ${sb - 150} V ${sb - 172}" stroke="${E}" stroke-width="2.5"/><g transform="translate(${sx} ${sb - 176})"><g>${calm ? '' : '<animateTransform attributeName="transform" type="rotate" values="-20;20;-20" dur="6s" repeatCount="indefinite"/>'}<path d="M -14 0 h 28 M 8 -6 l 8 6 l -8 6" stroke="#F2C14E" stroke-width="3" fill="none"/><path d="M -14 -6 q -8 6 0 12" fill="#F2C14E"/></g></g>`;
    s += `<path d="M ${sx - 26} ${sb} V ${sb - 40} a 26 26 0 0 1 52 0 V ${sb} Z" fill="#6E3E2A" stroke="${E}" stroke-width="2.5"/><path d="M ${sx - 26} ${sb - 40} L ${sx + 26} ${sb} M ${sx + 26} ${sb - 40} L ${sx - 26} ${sb}" stroke="#4E2A1A" stroke-width="3"/>`;
    s += `<circle cx="${sx}" cy="${sb - 96}" r="13" fill="#3A2E5A" stroke="${E}" stroke-width="2"/><circle cx="${sx}" cy="${sb - 96}" r="9" fill="#FFD36E"/>`; lit(sx - 9, sb - 105, 18, 18);
    /* en hest-agtig enhjørning i folden og kaniner */
    s += `<g transform="translate(1180 452)"><ellipse cx="0" cy="6" rx="40" ry="7" fill="#1A1238" opacity=".2"/><path d="M -26 0 V -24 M -16 2 V -22 M 18 2 V -22 M 26 0 V -24" stroke="#F2EEFF" stroke-width="7" stroke-linecap="round"/>`
      + `<ellipse cx="0" cy="-34" rx="32" ry="17" fill="#F7F4FF" stroke="#8A80B8" stroke-width="2"/><path d="M 24 -40 C 32 -56 36 -70 46 -74 C 56 -76 62 -66 58 -58 C 54 -50 44 -50 38 -42 Z" fill="#F7F4FF" stroke="#8A80B8" stroke-width="2"/>`
      + `<path d="M 50 -76 L 60 -100 L 56 -74 Z" fill="#F2C14E" stroke="#A87A1A" stroke-width="1.5"/><circle cx="52" cy="-64" r="2" fill="#1A1238"/>`
      + `<path d="M 26 -48 C 20 -60 30 -76 44 -78 C 34 -70 34 -56 36 -46" fill="#C79BFF" stroke="#8A5AC0" stroke-width="1.5"/><path d="M -30 -38 C -46 -40 -50 -22 -42 -12 C -46 -26 -38 -32 -30 -32" fill="#FF8FC7" stroke="#C0508A" stroke-width="1.5"/></g>`;
    s += [[1112, 470, '#E8E4F4'], [1132, 476, '#C9A27A'], [1450, 470, '#FFFFFF']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="10" ry="7" fill="${c}" stroke="#8A80A8" stroke-width="1.2"/><circle cx="7" cy="-5" r="5" fill="${c}" stroke="#8A80A8" stroke-width="1.2"/><ellipse cx="6" cy="-14" rx="2" ry="6" fill="${c}" stroke="#8A80A8" stroke-width="1"/><ellipse cx="10" cy="-13" rx="2" ry="6" fill="${c}" stroke="#8A80A8" stroke-width="1"/><circle cx="9" cy="-6" r="1" fill="#1A1238"/></g>`).join('');
    /* en dam med en skæv vandrende, en høstak og et æg med en lille drageunge, der kigger op */
    s += `<ellipse cx="1470" cy="440" rx="52" ry="16" fill="#3E7EB8" stroke="${E}" stroke-width="2"/><ellipse cx="1462" cy="436" rx="36" ry="9" fill="#7FC8F0" opacity=".5"/>`;
    s += `<path d="M 1390 438 l 60 4 l 8 -20 l -60 -4 Z" fill="#9C6A48" stroke="#4A2E1E" stroke-width="2"/><path d="M 1396 430 l 50 3" stroke="#BFE8FF" stroke-width="3"/>`;
    s += `<g transform="translate(1530 416)"><path d="M -26 10 C -30 -20 -12 -34 0 -34 C 12 -34 30 -20 26 10 Z" fill="#E8C86A" stroke="#A8884A" stroke-width="2"/>${[-14, -4, 6, 16].map(dx => `<path d="M ${dx} -24 q 2 14 -2 30" stroke="#C8A84A" stroke-width="1.5" fill="none"/>`).join('')}</g>`;
    s += `<g transform="translate(1236 476)"><ellipse cx="0" cy="2" rx="20" ry="5" fill="#C9A85A"/><path d="M -12 0 C -14 -24 14 -24 12 0 Z" fill="#E8DEF8" stroke="#8A80A8" stroke-width="1.5"/><path d="M -12 -8 l 5 -4 l 4 4 l 5 -5 l 4 4 l 4 -3" stroke="#8A80A8" stroke-width="1.5" fill="none"/><g>${calm ? '' : '<animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0;0 0" keyTimes="0;.2;.4;1" dur="4s" repeatCount="indefinite"/>'}<circle cx="0" cy="-16" r="7" fill="#7AC86A" stroke="#3A6A2A" stroke-width="1.5"/><circle cx="-2" cy="-17" r="1.5" fill="#1A1238"/><circle cx="3" cy="-17" r="1.5" fill="#1A1238"/></g></g>`;
    s += fence(1080, 494, 1420, 488, 14) + fence(1430, 488, 1600, 474, 6);
    s += `<g transform="translate(1470 346)">${placeSign('Dyreparken', '#4E7A3A')}</g>`;
    return placeG('dyr', 'Dyreparken', true, s + soon(1336, 400) + hit(1070, 320, 520, 180));
  }
  /* et træskilt på pæl */
  const placeSign = (t, col = '#3A2420') => { const w = t.length * 12 + 36; return `<path d="M -3 0 V 50 M 3 0 V 50" stroke="#5A3A28" stroke-width="5"/><rect x="${-w / 2}" y="-20" width="${w}" height="34" rx="8" fill="#E8D8B0" stroke="#5A3A28" stroke-width="3"/><text x="0" y="5" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="18" fill="${col}">${t}</text>`; };

  /* ---------- jorden, stier og bækken ---------- */
  function ground(){
    let s = `<path d="M -900 268 C -400 260 0 272 400 266 C 800 260 1200 270 1600 264 C 2000 258 2300 266 2500 264 L 2500 1700 L -900 1700 Z" fill="url(#kGrass)"/>`;
    SEED = 9; for (let x = -60; x < 1660; x += 40 + rnd() * 26) s += magicTree(x, 278 + rnd() * 10, .34 + rnd() * .1, false);
    return s;
  }
  const PATHS = ['M 800 640 L 800 480', 'M 800 640 C 700 650 560 660 470 690', 'M 800 640 C 920 640 1080 650 1180 660', 'M 800 640 C 760 740 700 820 640 880', 'M 800 640 C 820 760 900 840 1000 860 C 1100 880 1180 880 1260 880', 'M 800 640 C 640 720 420 800 260 860', 'M -900 990 L 2500 990', 'M 1180 660 C 1240 620 1300 560 1310 500'];
  function paths(){
    const pc = CM.winter ? ['#C2CCE0', '#E6EDF8'] : ['#9A8A6A', '#C8B48A'];
    return PATHS.map(d => `<path d="${d}" stroke="${pc[0]}" stroke-width="60" fill="none" stroke-linecap="round"/>`).join('') + PATHS.map(d => `<path d="${d}" stroke="${pc[1]}" stroke-width="50" fill="none" stroke-linecap="round" stroke-dasharray="34 5"/>`).join('');
  }
  const BROOK = 'M 1640 560 C 1520 600 1400 640 1320 700 C 1240 760 1160 790 1080 840 C 1020 880 980 940 960 1100';
  function brook(){
    const w = CM.winter;
    let s = `<path d="${BROOK}" stroke="${w ? '#C8D6EC' : '#4A7A5A'}" stroke-width="62" fill="none" stroke-linecap="round"/><path d="${BROOK}" stroke="${w ? '#E6F0FF' : '#3E78B0'}" stroke-width="46" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${BROOK}" stroke="#8EC4EE" stroke-width="3" fill="none" stroke-dasharray="18 26" opacity=".7">${calm || w ? '' : '<animate attributeName="stroke-dashoffset" values="44;0" dur="1.6s" repeatCount="indefinite"/>'}</path>`;
    s += [[1500, 600], [1380, 668], [1220, 770], [1060, 860]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6" fill="#7A7090" stroke="${E}" stroke-width="1.5"/>`).join('');
    return s;
  }
  /* pukkelbroen over bækken, med en sovende bro-trold nedenunder */
  function bridge(){
    const x = 1110, y = 850;
    let s = `<g transform="translate(${x} ${y}) rotate(-28)">`;
    /* trolden: store fødder og en mave, der stikker frem under buen, og en snorkelyd */
    s += `<g transform="translate(0 30)"><ellipse cx="0" cy="0" rx="34" ry="18" fill="#7A8A5A" stroke="#3A4A2A" stroke-width="2"/><ellipse cx="-30" cy="12" rx="16" ry="9" fill="#8A9A6A" stroke="#3A4A2A" stroke-width="2"/><ellipse cx="30" cy="12" rx="16" ry="9" fill="#8A9A6A" stroke="#3A4A2A" stroke-width="2"/>${[-38, -32, -26, 22, 28, 34].map(dx => `<circle cx="${dx}" cy="${6}" r="3" fill="#9AAA7A" stroke="#3A4A2A" stroke-width="1"/>`).join('')}</g>`;
    s += `<path d="M -70 20 Q 0 -40 70 20 L 70 34 Q 0 -20 -70 34 Z" fill="#8A82AE" stroke="${E}" stroke-width="2.5"/>`;
    s += Array.from({ length: 7 }, (_, i) => { const t = i / 6, xx = -70 + 140 * t, yy = 20 - 60 * t * (1 - t) * 2 + 2; return `<path d="M ${xx.toFixed(0)} ${(yy - 2).toFixed(0)} v 12" stroke="${E}" stroke-width="1.5" opacity=".5"/>`; }).join('');
    s += `<path d="M -74 18 Q 0 -44 74 18" stroke="#6A628E" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += `</g>`;
    s += `<text x="${x + 46}" y="${y + 18}" font-family="${FONT_C}" font-weight="700" font-size="16" fill="#E8E2FA" opacity=".85">Zzz${calm ? '' : `<animate attributeName="opacity" values=".2;.9;.2" dur="3s" repeatCount="indefinite"/>`}</text>`;
    return s;
  }

  /* ---------- torvet med ønskebrønden ---------- */
  function plaza(){
    let s = `<ellipse cx="800" cy="640" rx="250" ry="100" fill="#8A7A9A"/><ellipse cx="800" cy="638" rx="242" ry="94" fill="url(#kCob)"/>`;
    /* ønskebrønden: stenkant, tag på to stolper, en spand, og lilla vand der bobler */
    s += `<g transform="translate(800 640)"><ellipse cx="0" cy="8" rx="76" ry="22" fill="#1A1238" opacity=".25"/>`;
    s += `<path d="M -62 -4 V -34 Q 0 -54 62 -34 V -4 Q 0 18 -62 -4 Z" fill="#8A82AE" stroke="${E}" stroke-width="2.5"/>` + [-48, -24, 0, 24, 48].map((dx, i) => `<path d="M ${dx - 10} ${-22 + Math.abs(dx) / 8} h 20" stroke="${E}" stroke-width="1.5" opacity=".5"/>`).join('');
    s += `<ellipse cx="0" cy="-34" rx="62" ry="18" fill="#6A628E" stroke="${E}" stroke-width="2.5"/><ellipse cx="0" cy="-33" rx="50" ry="12" fill="url(#kWell)"/>`;
    if (!calm) s += [[-20, 0], [8, .7], [26, 1.4], [-6, 2.1]].map(([dx, b]) => `<circle cx="${dx}" cy="-34" r="6" fill="#E8C8FF" fill-opacity=".3" stroke="#F2E6FF" stroke-width="1.5" opacity="0"><animate attributeName="cy" values="-34;-150" dur="3s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="3s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="r" values="3;9" dur="3s" begin="${b}s" repeatCount="indefinite"/></circle>`).join('');
    s += `<path d="M -54 -36 V -110 M 54 -36 V -110" stroke="#6E4A3A" stroke-width="7"/><path d="M -72 -100 L 0 -138 L 72 -100 Z" fill="#7A3A6A" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><path d="M -60 -104 L 0 -130 L 60 -104" stroke="#9A5A8A" stroke-width="3" fill="none"/>`;
    s += `<path d="M -50 -84 H 50" stroke="#5A3A28" stroke-width="5"/><path d="M 12 -84 V -66" stroke="#B8A47E" stroke-width="1.5"/><path d="M 4 -66 h 16 l -2 14 h -12 Z" fill="#8A5A3C" stroke="#3A2420" stroke-width="1.5"/><path d="M 50 -84 l 10 -6 l 4 8" stroke="#3A2420" stroke-width="2.5" fill="none"/>`;
    s += `</g>`;
    /* mønter i brønden glimter, og et lille skilt: "Ønsk dig noget" */
    s += `<g transform="translate(870 676)"><path d="M 0 0 V 22" stroke="#5A3A28" stroke-width="3"/><rect x="-32" y="-14" width="64" height="18" rx="4" fill="#E8D8B0" stroke="#5A3A28" stroke-width="2"/><text x="0" y="0" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="10" fill="#3A2420">Ønsk dig noget</text></g>`;
    /* skiltet med pile i alle retninger */
    s += signPost(632, 668, [['Kollegiet', -1, -4, '#E8D8B0'], ['Skolen', 1, -10, '#C79BFF'], ['Dragen', -1, 6, '#9BE36A'], ['Månen', 1, -26, '#F2C14E'], ['Bobler', 1, 4, '#7FD8FF'], ['Arkaden', 1, 10, '#FF8FC7']]);
    /* det skæve klokketårn */
    s += `<g transform="translate(944 590) rotate(4)"><rect x="-18" y="-130" width="36" height="130" fill="#7A72A0" stroke="${E}" stroke-width="2.5"/><rect x="-18" y="-130" width="36" height="130" fill="url(#kStone)"/><path d="M -26 -128 L 0 -176 L 26 -128 Z" fill="#5A2A78" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-104" r="15" fill="#F2EEDC" stroke="${E}" stroke-width="2.5"/>`
      + Array.from({ length: 12 }, (_, i) => `<circle cx="${(Math.cos(i * Math.PI / 6) * 11).toFixed(1)}" cy="${(-104 + Math.sin(i * Math.PI / 6) * 11).toFixed(1)}" r="1" fill="${E}"/>`).join('')
      + `<path d="M 0 -104 V -114" stroke="${E}" stroke-width="2.5" stroke-linecap="round">${calm ? '' : '<animateTransform attributeName="transform" type="rotate" values="0 0 -104;360 0 -104" dur="40s" repeatCount="indefinite"/>'}</path><path d="M 0 -104 L 7 -100" stroke="${E}" stroke-width="2.5" stroke-linecap="round"/>`
      + `<path d="M -8 -62 V -76 a 8 8 0 0 1 16 0 V -62 Z" fill="#FFD36E"/><path d="M -6 -20 V 0 H 6 V -20 a 6 6 0 0 0 -12 0 Z" fill="#3A2E5A"/><path d="M 0 -176 V -190" stroke="${E}" stroke-width="2"/><circle cx="0" cy="-192" r="3" fill="#F2C14E"/></g>`;
    s += bench2(626, 744) + bench2(960, 690) + magicLamp(560, 610) + magicLamp(1040, 620, '#C79BFF') + magicLamp(700, 740, '#7FD8FF') + magicLamp(920, 760);
    /* duer, der er blevet lilla af brøndens vand */
    s += [[740, 700, 1], [760, 708, -1], [852, 712, 1]].map(([x, y, f]) => `<g transform="translate(${x} ${y}) scale(${f} 1)"><ellipse cx="0" cy="-6" rx="9" ry="6" fill="#9A8AC8"/><circle cx="7" cy="-11" r="4.5" fill="#B5A8E0"/><path d="M 11 -11 l 4 1 l -4 1 Z" fill="#F2C14E"/><circle cx="8" cy="-12" r="1" fill="#1A1238"/></g>`).join('');
    return s;
  }

  /* ---------- kollegiet: højt, skævt og fuldt af vinduer ---------- */
  function dorm(){
    const x = 200, base = 760, c = '#B8A0C8', cL = '#5A4A6E', R = '#3E5A8A';
    /* bygningen er tre "kasser" oven på hinanden, der hver læner lidt mere */
    let s = `<ellipse cx="${x + 140}" cy="${base + 4}" rx="170" ry="16" fill="#1A1238" opacity=".22"/>`;
    const floor = (y, h, w, dx, skew) => `<path d="M ${x + dx} ${y + h} L ${x + dx + skew} ${y} L ${x + dx + w + skew} ${y} L ${x + dx + w} ${y + h} Z" fill="${c}" stroke="${cL}" stroke-width="3" stroke-linejoin="round"/><path d="M ${x + dx} ${y + h} L ${x + dx + skew} ${y} L ${x + dx + w + skew} ${y} L ${x + dx + w} ${y + h} Z" fill="url(#kPlank)"/>`;
    s += floor(base - 130, 130, 280, 0, 0) + floor(base - 240, 110, 250, 14, 8) + floor(base - 340, 100, 220, 30, 18);
    /* tårnet på siden med det runde uglevindue */
    s += `<rect x="${x + 236}" y="${base - 300}" width="70" height="300" fill="#A890B8" stroke="${cL}" stroke-width="3"/><rect x="${x + 236}" y="${base - 300}" width="70" height="300" fill="url(#kPlank)"/>`;
    s += `<path d="M ${x + 226} ${base - 298} L ${x + 271} ${base - 400} L ${x + 316} ${base - 298} Z" fill="${R}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><path d="M ${x + 271} ${base - 400} q 14 -10 6 -24" stroke="${E}" stroke-width="2.5" fill="none"/><circle cx="${x + 277}" cy="${base - 426}" r="5" fill="#F2C14E"/>`;
    s += `<circle cx="${x + 271}" cy="${base - 250}" r="20" fill="#3A2E5A" stroke="${E}" stroke-width="2.5"/><circle cx="${x + 271}" cy="${base - 250}" r="15" fill="#FFD36E"/><g transform="translate(${x + 271} ${base - 246})"><ellipse rx="8" ry="10" fill="#8A6A4A"/><circle cx="-3" cy="-3" r="3" fill="#FFF3C8"/><circle cx="3" cy="-3" r="3" fill="#FFF3C8"/><circle cx="-3" cy="-3" r="1.5" fill="#1A1238"/><circle cx="3" cy="-3" r="1.5" fill="#1A1238"/><path d="M -1 1 l 1 2 l 1 -2" fill="#F2C14E"/></g>`; lit(x + 256, base - 265, 30, 30);
    s += glowWin(x + 254, base - 190, 34, 46, { arch: true }) + glowWin(x + 254, base - 104, 34, 46, { arch: true, glow: '#3A2E5A' });
    /* skæve tage på etagerne */
    s += `<path d="M ${x + 20} ${base - 338} L ${x + 150} ${base - 470} L ${x + 290} ${base - 338} Z" fill="${R}" stroke="${E}" stroke-width="3" stroke-linejoin="round"/>`;
    for (let yy = base - 450; yy < base - 340; yy += 14){ const k = (yy - (base - 470)) / 130; s += `<path d="M ${x + 150 - 130 * k} ${yy} H ${x + 150 + 140 * k}" stroke="#2E4A70" stroke-width="2" opacity=".5"/>`; }
    if (CM.winter) s += `<path d="M ${x + 24} ${base - 340} L ${x + 150} ${base - 466} L ${x + 286} ${base - 340}" stroke="#FFF" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += chimney(x + 60, base - 430, 22, 60, '#8A5A5A') + chimney(x + 200, base - 420, 18, 50, '#8A5A5A');
    s += `<path d="M ${x + 116} ${base - 392} h 44 v 34 h -44 Z" fill="${R}" stroke="${E}" stroke-width="2"/><path d="M ${x + 110} ${base - 392} L ${x + 138} ${base - 418} L ${x + 166} ${base - 392} Z" fill="${R}" stroke="${E}" stroke-width="2"/>` + glowWin(x + 126, base - 386, 24, 22, { sill: false });
    /* vinduer: tre etager med hver deres vinduer, nogle tændte, nogle mørke, et med gardiner */
    const W3 = [[x + 50, base - 316, 1], [x + 110, base - 318, 0], [x + 170, base - 318, 1], [x + 34, base - 214, 1], [x + 94, base - 214, 1], [x + 154, base - 214, 0], [x + 208, base - 216, 1]];
    s += W3.map(([wx, wy, on]) => glowWin(wx, wy, 34, 40, { glow: on ? '#FFD36E' : '#3A2E5A' })).join('');
    s += `<path d="M ${x + 94} ${base - 214} h 12 q -6 20 -2 40 h -10 Z M ${x + 128} ${base - 214} h -12 q 6 20 2 40 h 10 Z" fill="#FF8FC7" stroke="#C0508A" stroke-width="1.5"/>`;
    /* altan med blomsterkrukker og en kat */
    s += `<rect x="${x + 40}" y="${base - 166}" width="110" height="8" fill="#6E4A3A" stroke="${E}" stroke-width="2"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M ${x + 46 + i * 14} ${base - 158} V ${base - 140}" stroke="#6E4A3A" stroke-width="3"/>`).join('') + `<path d="M ${x + 40} ${base - 140} H ${x + 150}" stroke="#6E4A3A" stroke-width="4"/>`;
    s += [[x + 60, '#E0457A'], [x + 90, '#9BE36A']].map(([px, fc]) => `<path d="M ${px - 8} ${base - 166} h 16 l -2 -12 h -12 Z" fill="#B5652A" stroke="${E}" stroke-width="1.5"/><circle cx="${px - 4}" cy="${base - 184}" r="6" fill="${fc}"/><circle cx="${px + 5}" cy="${base - 182}" r="5" fill="${fc}"/>`).join('');
    s += `<g transform="translate(${x + 130} ${base - 168})"><path d="M -12 0 Q -12 -14 0 -14 Q 10 -14 12 -4 Q 18 -2 16 4 Q 6 6 -12 0 Z" fill="#2A2238"/><path d="M -10 -10 l 0 -9 l 6 6 M 2 -13 l 3 -8 l 3 8" fill="#2A2238"/><circle cx="-4" cy="-8" r="1.6" fill="#9BE36A"/><circle cx="3" cy="-8" r="1.6" fill="#9BE36A"/><path d="M 12 -2 q 14 4 12 -14" stroke="#2A2238" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    /* stueetagen: vinduer, døren med trappe og en kosteholder */
    s += glowWin(x + 22, base - 104, 50, 50) + glowWin(x + 186, base - 104, 40, 50);
    s += `<path d="M ${x + 100} ${base} V ${base - 76} a 30 30 0 0 1 60 0 V ${base} Z" fill="#3E5A8A" stroke="${E}" stroke-width="2.5"/><path d="M ${x + 130} ${base - 104} V ${base}" stroke="${E}" stroke-width="2"/><circle cx="${x + 122}" cy="${base - 40}" r="3.5" fill="#F2C14E"/><circle cx="${x + 138}" cy="${base - 40}" r="3.5" fill="#F2C14E"/>`;
    s += `<path d="M ${x + 116} ${base - 84} a 14 14 0 0 1 28 0 Z" fill="#FFD36E"/>`; lit(x + 116, base - 98, 28, 14);
    s += [0, 1].map(i => `<rect x="${x + 92 - i * 8}" y="${base + i * 6}" width="${76 + i * 16}" height="7" rx="2" fill="#8A82AE" stroke="${E}" stroke-width="1.5"/>`).join('');
    s += `<g transform="translate(${x + 186} ${base})"><path d="M 0 0 V -40 M 30 0 V -40 M -4 -34 H 34" stroke="#5A3A28" stroke-width="4"/>${[6, 15, 24].map((dx, i) => `<g transform="rotate(${-8 + i * 8} ${dx} -34)"><path d="M ${dx} -34 V -76" stroke="#8A5A3C" stroke-width="3"/><path d="M ${dx - 5} -76 L ${dx} -92 L ${dx + 5} -76 Z" fill="#E9C46A" stroke="#8A6420" stroke-width="1"/></g>`).join('')}</g>`;
    /* tøjsnoren fra tårnet til en pæl, med kapper, sokker og en stribet hat */
    const lx0 = x - 120, ly0 = base - 150, lx1 = x + 2, ly1 = base - 140;
    s += `<path d="M ${lx0} ${base} V ${ly0 - 6}" stroke="#5A3A28" stroke-width="5"/><path d="M ${lx0} ${ly0} Q ${(lx0 + lx1) / 2} ${ly0 + 22} ${lx1} ${ly1}" stroke="#E8E2FA" stroke-width="1.5" fill="none"/>`;
    s += `<g>${calm ? '' : `<animateTransform attributeName="transform" type="rotate" values="-2 ${(lx0 + lx1) / 2} ${ly0};2 ${(lx0 + lx1) / 2} ${ly0};-2 ${(lx0 + lx1) / 2} ${ly0}" dur="2.6s" repeatCount="indefinite"/>`}`
      + `<path d="M ${lx0 + 12} ${ly0 + 6} h 30 l 6 40 h -42 Z" fill="#6B3FA0" stroke="${E}" stroke-width="1.5"/><polygon points="${star5pts(lx0 + 27, ly0 + 24, 6, 2.5)}" fill="#F2C14E"/>`
      + `<path d="M ${lx0 + 54} ${ly0 + 14} h 10 v 18 h 8 v 6 h -18 Z" fill="#E0457A" stroke="${E}" stroke-width="1"/><path d="M ${lx0 + 54} ${ly0 + 20} h 10 M ${lx0 + 54} ${ly0 + 26} h 10" stroke="#FFF" stroke-width="2"/>`
      + `<path d="M ${lx0 + 76} ${ly0 + 18} L ${lx0 + 86} ${ly0 + 56} L ${lx0 + 96} ${ly0 + 18} Z" fill="#3E7A4A" stroke="${E}" stroke-width="1.5"/><path d="M ${lx0 + 80} ${ly0 + 30} h 12 M ${lx0 + 82} ${ly0 + 40} h 8" stroke="#F2C14E" stroke-width="2"/></g>`;
    s += `<rect x="${x + 82}" y="${base - 132}" width="96" height="22" rx="6" fill="#3E5A8A" stroke="${E}" stroke-width="2"/><text x="${x + 130}" y="${base - 116}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="14" fill="#FFE9A0" letter-spacing="1">KOLLEGIET</text>`;
    s += pumpkin(x + 20, base + 6, .9) + pumpkin(x + 50, base + 10, .7);
    return placeG('hus', 'Kollegiet', false, s + hit(x - 10, base - 480, 330, 490));
  }

  /* ---------- Boblebutikken ---------- */
  function bubbleShop(){
    const x = 1190, base = 720, w = 250, h = 150, top = base - h, c = '#4AA8A0', cL = '#1F5E5A';
    let s = `<ellipse cx="${x + w / 2}" cy="${base + 4}" rx="150" ry="14" fill="#1A1238" opacity=".22"/>`;
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="6" fill="${c}" stroke="${cL}" stroke-width="3"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#kPlank)"/>`;
    s += `<path d="M ${x - 12} ${top + 6} H ${x + w + 12} L ${x + w} ${top - 14} H ${x} Z" fill="#2E6E6A" stroke="${cL}" stroke-width="3"/>`;
    /* glaskuplen fyldt med farvede bobler, og bobler der stiger op */
    const gx = x + 80, gy = top - 56;
    s += `<rect x="${gx - 40}" y="${top - 26}" width="80" height="14" rx="4" fill="#B5432A" stroke="${E}" stroke-width="2"/><circle cx="${gx}" cy="${gy}" r="50" fill="#E9FFFB" fill-opacity=".35" stroke="#BFF0E8" stroke-width="3"/>`;
    SEED = 21; s += Array.from({ length: 14 }, () => { const a = rnd() * Math.PI * 2, d = rnd() * 34, bx = gx + Math.cos(a) * d, by = gy + 10 + Math.sin(a) * d * .8, cc = pick(['#FF5FA8', '#FFE27A', '#7B5CFF', '#43D3BE', '#FF9A4D', '#6FA8FF', '#B79BFF']); return `<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="10" fill="${cc}" opacity=".9"/><path d="M ${(bx - 6).toFixed(0)} ${(by - 3).toFixed(0)} q 5 -4 10 -2" stroke="#FFF" stroke-width="2" fill="none" opacity=".7"/>`; }).join('');
    s += `<path d="M ${gx - 30} ${gy - 34} Q ${gx - 10} ${gy - 48} ${gx + 12} ${gy - 46}" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`;
    s += chimney(x + 190, top - 60, 24, 46, '#2E6E6A', false);
    if (!calm) s += [0, 1, 2, 3].map(i => { const cc = ['#FF8FC7', '#7FD8FF', '#FFE27A', '#C79BFF'][i]; return `<circle cx="${x + 202}" cy="${top - 70}" r="7" fill="${cc}" fill-opacity=".35" stroke="${cc}" stroke-width="2" opacity="0"><animate attributeName="cy" values="${top - 70};${top - 210}" dur="5s" begin="${i * 1.25}s" repeatCount="indefinite"/><animate attributeName="cx" values="${x + 202};${x + 202 + (i % 2 ? 30 : -24)}" dur="5s" begin="${i * 1.25}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="5s" begin="${i * 1.25}s" repeatCount="indefinite"/></circle>`; }).join('');
    /* skilt, markise, et stort udstillingsvindue med bobler og en rund dør */
    s += `<text x="${x + w / 2}" y="${top + 28}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="19" fill="#E9FFFB" letter-spacing="1.5">BOBLEBUTIKKEN</text>`;
    s += awning(x + 12, x + w - 12, top + 40, 20, '#E0457A');
    s += glowWin(x + 22, base - 80, 120, 66, { cross: false, glow: '#FFF3D0', shape: [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const bx = x + 38 + (i % 4) * 28, by = base - 54 + Math.floor(i / 4) * 24, cc = ['#FF5FA8', '#7B5CFF', '#FFE27A', '#43D3BE'][i % 4]; return `<circle cx="${bx}" cy="${by}" r="10" fill="${cc}"/><path d="M ${bx - 6} ${by - 3} q 5 -4 10 -2" stroke="#FFF" stroke-width="2" fill="none"/>`; }).join('') });
    s += `<path d="M ${x + 170} ${base} V ${base - 52} a 26 26 0 0 1 52 0 V ${base} Z" fill="#E9FFFB" stroke="${cL}" stroke-width="2.5"/><circle cx="${x + 196}" cy="${base - 56}" r="14" fill="#FFD36E" stroke="${cL}" stroke-width="2"/><circle cx="${x + 212}" cy="${base - 26}" r="3" fill="#F2C14E"/>`; lit(x + 182, base - 70, 28, 28);
    return placeG('kugler', 'Boblebutikken', false, s + hit(x - 10, top - 120, w + 20, h + 124));
  }

  /* ---------- forreste række: koncertsalen, caféen og arkaden ---------- */
  function concert(){
    const x = 40, base = 980, w = 300, h = 150, top = base - h, c = '#8A3A4A', cL = '#4A1A2A';
    let s = `<ellipse cx="${x + w / 2}" cy="${base + 4}" rx="180" ry="14" fill="#1A1238" opacity=".22"/>`;
    /* et kæmpe grammofonhorn på taget, med noder der flyver ud */
    /* grammofonhornet står på taget og peger op mod venstre */
    s += `<g transform="translate(${x + 96} ${top - 6}) scale(-1 1)"><rect x="-12" y="-4" width="24" height="16" rx="3" fill="#6A3A1A" stroke="#3A1A0A" stroke-width="2"/><path d="M -4 -2 Q -2 -40 8 -74 L 62 -84 Q 24 -40 4 -2 Z" fill="#F2C14E" stroke="#8A6420" stroke-width="2.5" stroke-linejoin="round"/><path d="M 2 -6 Q 8 -40 30 -78" stroke="#FFE9A0" stroke-width="3" fill="none" opacity=".6"/><ellipse cx="35" cy="-79" rx="28" ry="10" fill="#C99A2A" stroke="#8A6420" stroke-width="2.5" transform="rotate(-10 35 -79)"/><ellipse cx="35" cy="-79" rx="18" ry="5" fill="#5A3A1A" transform="rotate(-10 35 -79)"/></g>`;
    if (!calm) s += [0, 1, 2, 3].map(i => `<g opacity="0"><animate attributeName="opacity" values="0;1;0" dur="4s" begin="${i}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="${x + 60} ${top - 90};${x + 10 - (i % 2) * 30} ${top - 190}" dur="4s" begin="${i}s" repeatCount="indefinite"/><path d="M 0 0 V -16 l 10 -3 V -3" stroke="#FFE9A0" stroke-width="2.5" fill="none"/><ellipse cx="-3" cy="0" rx="4" ry="3" fill="#FFE9A0"/><ellipse cx="7" cy="-3" rx="4" ry="3" fill="#FFE9A0"/></g>`).join('');
    /* bygningen er skæv, med søjler, en scene-dør med rødt tæppe og plakater */
    s += `<path d="M ${x} ${base} L ${x + 8} ${top} L ${x + w + 4} ${top + 8} L ${x + w} ${base} Z" fill="${c}" stroke="${cL}" stroke-width="3" stroke-linejoin="round"/><path d="M ${x} ${base} L ${x + 8} ${top} L ${x + w + 4} ${top + 8} L ${x + w} ${base} Z" fill="url(#kBrick)"/>`;
    s += `<path d="M ${x - 14} ${top + 4} L ${x + 150} ${top - 54} L ${x + w + 18} ${top + 12} Z" fill="#3A2E5A" stroke="${E}" stroke-width="3" stroke-linejoin="round"/>`;
    if (CM.winter) s += `<path d="M ${x - 10} ${top + 2} L ${x + 150} ${top - 50} L ${x + w + 14} ${top + 10}" stroke="#FFF" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    s += [x + 30, x + w - 40].map(px => `<rect x="${px}" y="${top + 14}" width="14" height="${h - 14}" fill="#E8D8C8" stroke="${cL}" stroke-width="2"/><rect x="${px - 3}" y="${top + 10}" width="20" height="8" fill="#E8D8C8" stroke="${cL}" stroke-width="2"/>`).join('');
    s += `<path d="M ${x + 100} ${base} V ${base - 80} a 50 40 0 0 1 100 0 V ${base} Z" fill="#3A1A2A" stroke="${cL}" stroke-width="3"/><path d="M ${x + 100} ${base - 80} q 25 30 0 80 M ${x + 200} ${base - 80} q -25 30 0 80" fill="#C0303A" stroke="#6A1A2A" stroke-width="2"/><path d="M ${x + 120} ${base - 40} a 30 26 0 0 1 60 0 Z" fill="#FFD36E" opacity=".8"/>`;
    lit(x + 120, base - 66, 60, 26);
    s += `<path d="M ${x + 108} ${base} L ${x + 96} ${base + 26} H ${x + 204} L ${x + 192} ${base} Z" fill="#C0303A"/>`;
    s += `<g transform="translate(${x + 64} ${top + 50}) rotate(-6)"><rect x="-22" y="-28" width="44" height="58" fill="#F2E6C8" stroke="${cL}" stroke-width="1.5"/><text x="0" y="-12" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="8" fill="#6A1A2A">I AFTEN</text><text x="0" y="0" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="7" fill="#3A2420">De Falske</text><text x="0" y="10" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="7" fill="#3A2420">Toner</text><circle cx="0" cy="20" r="5" fill="#6B3FA0"/></g>`;
    s += `<g transform="translate(${x + 236} ${top + 46}) rotate(5)"><rect x="-20" y="-26" width="40" height="52" fill="#C9E8F2" stroke="${cL}" stroke-width="1.5"/><path d="M -10 -10 V 6 l 12 -4 V -14 Z" fill="#3A2E5A"/><ellipse cx="-12" cy="6" rx="4" ry="3" fill="#3A2E5A"/><ellipse cx="0" cy="2" rx="4" ry="3" fill="#3A2E5A"/></g>`;
    s += `<rect x="${x + 86}" y="${top + 18}" width="${w - 172 + 40}" height="26" rx="6" fill="#3A1A2A" stroke="#F2C14E" stroke-width="2"/><text x="${x + w / 2 + 6}" y="${top + 37}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="15" fill="#FFE9A0" letter-spacing="1">KONCERTSAL</text>`;
    return placeG('koncert', 'Koncertsalen', true, s + soon(x + w / 2, top + 100) + hit(x - 10, top - 120, w + 20, h + 130));
  }
  function cafe(){
    const x = 500, base = 970, w = 270, h = 140, top = base - h, c = '#E8C89A', cL = '#8A5A2A';
    let s = `<ellipse cx="${x + w / 2}" cy="${base + 4}" rx="160" ry="14" fill="#1A1238" opacity=".22"/>`;
    s += gableRoof(x, top, w, 96, '#8A4A2A');
    /* skorstenen er en tekande, der damper */
    s += `<g transform="translate(${x + w - 70} ${top - 70})"><ellipse cx="0" cy="0" rx="24" ry="18" fill="#E8E2FA" stroke="${E}" stroke-width="2.5"/><path d="M 22 -4 q 16 -4 18 -18" stroke="#E8E2FA" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M -22 -6 q -12 4 -10 18 q 6 -6 10 -8" fill="none" stroke="#E8E2FA" stroke-width="5"/><ellipse cx="0" cy="-17" rx="10" ry="4" fill="#C79BFF" stroke="${E}" stroke-width="2"/><circle cx="0" cy="-22" r="3" fill="#C79BFF"/>${[-10, 0, 10].map(dx => `<circle cx="${dx}" cy="4" r="2.5" fill="#FF8FC7"/>`).join('')}</g>`;
    if (!calm) s += [0, 1, 2].map(i => `<path d="M ${x + w - 30} ${top - 92} q -6 -10 0 -18 q 6 -8 0 -16" stroke="#F2EEFF" stroke-width="4" fill="none" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;.7;0" dur="3s" begin="${i}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;6 -40" dur="3s" begin="${i}s" repeatCount="indefinite"/></path>`).join('');
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}" stroke="${cL}" stroke-width="3"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#kBrick)"/>`;
    s += glowWin(x + 22, top + 14, 46, 36) + glowWin(x + w - 68, top + 14, 46, 36);
    s += awning(x + 10, x + w - 10, top + 62, 22, '#B5432A');
    s += glowWin(x + 20, base - 64, 130, 56, { cross: false, glow: '#FFF3D0', shape: [[x + 46, '#FF5FA8'], [x + 84, '#FFE27A'], [x + 122, '#C79BFF']].map(([xx, cc]) => `<path d="M ${xx - 12} ${base - 14} h 24 l -3 -12 h -18 Z" fill="#B5652A"/><path d="M ${xx - 12} ${base - 26} q 12 -16 24 0 Z" fill="${cc}"/><circle cx="${xx}" cy="${base - 34}" r="3.5" fill="#E0233F"/>`).join('') });
    s += door(x + w - 56, base, 44, 74, '#6E3E2A', { frame: '#E8D8C8' });
    /* bord og stole udenfor, med kopper og en kage */
    s += `<g transform="translate(${x + w + 40} ${base + 10})"><ellipse cx="0" cy="2" rx="26" ry="6" fill="#1A1238" opacity=".2"/><path d="M 0 0 V -28" stroke="#2E2448" stroke-width="4"/><ellipse cx="0" cy="-30" rx="26" ry="8" fill="#F2EEDC" stroke="${cL}" stroke-width="2"/><path d="M -12 -36 h 10 v 6 h -10 Z" fill="#FFFFFF" stroke="#8A80A8" stroke-width="1"/><path d="M 4 -34 q 6 -10 12 0 Z" fill="#FF8FC7"/><path d="M -8 -40 q 2 -6 0 -10" stroke="#F2EEFF" stroke-width="2" fill="none"/></g>`;
    s += `<rect x="${x + 86}" y="${top + 16}" width="98" height="30" rx="8" fill="#6A3A1A" stroke="#3A2010" stroke-width="2"/><text x="${x + w / 2}" y="${top + 38}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="19" fill="#FFE9A0" letter-spacing="1">CAFÉEN</text>`;
    return placeG('cafe', 'Caféen', true, s + soon(x + w / 2, top + 98) + hit(x - 10, top - 140, w + 90, h + 150));
  }
  function arcade(){
    const x = 1250, base = 980, w = 300, h = 160, top = base - h, c = '#3E2E6A', cL = '#1A1238';
    let s = `<ellipse cx="${x + w / 2}" cy="${base + 4}" rx="180" ry="14" fill="#1A1238" opacity=".22"/>`;
    s += `<path d="M ${x} ${top} Q ${x + w / 2} ${top - 70} ${x + w} ${top} Z" fill="#6B3FA0" stroke="${E}" stroke-width="3"/>`;
    /* en snurrende stjerne på taget */
    s += `<path d="M ${x + w / 2} ${top - 54} V ${top - 90}" stroke="${E}" stroke-width="3"/><g transform="translate(${x + w / 2} ${top - 104})"><g>${calm ? '' : '<animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite"/>'}<polygon points="${star5pts(0, 0, 22, 9)}" fill="#F2C14E" stroke="#8A6420" stroke-width="2"/></g><circle r="30" fill="#F2C14E" opacity=".2"/></g>`;
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}" stroke="${cL}" stroke-width="3"/><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#kBrick)"/>`;
    /* skiltet med blinkende stjerner rundt om */
    s += `<rect x="${x + 50}" y="${top + 10}" width="${w - 100}" height="38" rx="19" fill="#1A1238" stroke="#FF8FC7" stroke-width="3"/><text x="${x + w / 2}" y="${top + 37}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="24" fill="#FFE27A" letter-spacing="3">ARKADEN</text>`;
    s += Array.from({ length: 12 }, (_, i) => { const t = i / 12 * Math.PI * 2, px = x + w / 2 + Math.cos(t) * (w / 2 - 40), py = top + 29 + Math.sin(t) * 24; return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${['#FF8FC7', '#7FD8FF', '#FFE27A'][i % 3]}">${calm ? '' : `<animate attributeName="opacity" values="1;.2;1" dur="1.2s" begin="${(i * .1).toFixed(1)}s" repeatCount="indefinite"/>`}</circle>`; }).join('');
    /* runde vinduer: en gribemaskine og en pinball */
    const port = (cx, cy, inner) => `<circle cx="${cx}" cy="${cy}" r="40" fill="#1A1238" stroke="#F2C14E" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="34" fill="#2A2050"/>${inner}<path d="M ${cx - 22} ${cy - 18} q 10 -10 24 -10" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".35"/>`;
    s += port(x + 70, top + 100, `<rect x="${x + 46}" y="${top + 74}" width="48" height="54" rx="4" fill="#E0457A" stroke="#6A1A3A" stroke-width="2"/><rect x="${x + 52}" y="${top + 80}" width="36" height="30" fill="#BFE8FF" opacity=".6"/><path d="M ${x + 70} ${top + 80} V ${top + 94} M ${x + 64} ${top + 94} l 6 6 l 6 -6" stroke="#2A2050" stroke-width="2" fill="none"/>${['#FFE27A', '#7FD8FF', '#9BE36A'].map((cc, i) => `<circle cx="${x + 58 + i * 12}" cy="${top + 106}" r="5" fill="${cc}"/>`).join('')}`);
    s += port(x + w - 70, top + 100, `<path d="M ${x + w - 94} ${top + 128} L ${x + w - 86} ${top + 76} H ${x + w - 54} L ${x + w - 46} ${top + 128} Z" fill="#43D3BE" stroke="#1A6A5A" stroke-width="2"/><circle cx="${x + w - 70}" cy="${top + 92}" r="5" fill="#FF8FC7"/><circle cx="${x + w - 78}" cy="${top + 106}" r="4" fill="#FFE27A"/><circle cx="${x + w - 64}" cy="${top + 110}" r="3.5" fill="#FFFFFF"/>`);
    lit(x + 36, top + 66, 68, 68); lit(x + w - 104, top + 66, 68, 68);
    s += `<path d="M ${x + w / 2 - 34} ${base} V ${base - 64} a 34 34 0 0 1 68 0 V ${base} Z" fill="#FFD36E" stroke="#F2C14E" stroke-width="3"/><path d="M ${x + w / 2 - 34} ${base} L ${x + w / 2 - 44} ${base + 22} H ${x + w / 2 + 44} L ${x + w / 2 + 34} ${base} Z" fill="#FFD36E" opacity=".3"/>`; lit(x + w / 2 - 34, base - 98, 68, 98);
    s += `<g transform="translate(${x + w / 2} ${base - 56})"><rect x="-14" y="-18" width="28" height="36" rx="4" fill="#E0457A"/><rect x="-10" y="-14" width="20" height="14" fill="#7FD8FF"/><circle cx="-4" cy="8" r="3" fill="#F2C14E"/><circle cx="5" cy="8" r="3" fill="#43D3BE"/></g>`;
    return placeG('arkade', 'Arkaden', true, s + soon(x + w / 2, base - 44) + hit(x - 10, top - 170, w + 20, h + 180));
  }

  /* ---------- småting overalt og liv i luften ---------- */
  function details(){
    let s = '';
    s += magicTree(54, 610, .8) + magicTree(1080, 560, .7) + magicTree(470, 880, .9) + magicTree(1580, 760, .95) + magicTree(40, 760, .7, false);
    s += shrooms(560, 720, 3, .9) + shrooms(1000, 730, 2, .8, '#C79BFF') + shrooms(380, 780, 3, .8, '#FF8FC7') + shrooms(1150, 620, 3, .8) + shrooms(860, 900, 2, .9, '#9BE36A');
    s += pumpkin(1160, 960, 1) + pumpkin(800, 900, .8) + pumpkin(1120, 712, .8);
    /* en snegl med et lysende hus */
    s += `<g transform="translate(910 846)"><path d="M -12 0 h 22 q 4 0 4 -6 l -2 -6" stroke="#C9A98A" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="0" cy="-8" r="8" fill="#C79BFF" stroke="#6B3FA0" stroke-width="1.5"/><path d="M 0 -8 m -4 0 a 4 4 0 1 1 4 4" stroke="#6B3FA0" stroke-width="1.2" fill="none"/></g>`;
    /* en postugle med et brev, og en kost med indkøbsposer, der flyver over himlen */
    if (!calm){
      s += `<g><animateMotion dur="26s" repeatCount="indefinite" path="M -100 120 C 300 60 700 160 1100 80 S 1600 120 1800 60"/><g transform="scale(.9)"><path d="M -14 0 q 14 -16 28 0" fill="#8A6A4A"><animateTransform attributeName="transform" type="scale" values="1 1;1 -.6;1 1" dur=".5s" repeatCount="indefinite"/></path><ellipse cx="0" cy="2" rx="8" ry="7" fill="#8A6A4A"/><circle cx="6" cy="-2" r="5" fill="#8A6A4A"/><circle cx="8" cy="-3" r="1.5" fill="#FFE9A0"/><rect x="-4" y="8" width="12" height="8" fill="#F2EEDC" stroke="#8A80A8" stroke-width="1"/></g></g>`;
      s += `<g><animateMotion dur="34s" begin="-12s" repeatCount="indefinite" path="M 1800 180 C 1300 120 900 200 500 140 S -100 170 -300 120"/><g transform="scale(-1 1)"><path d="M -40 0 H 20" stroke="#8A5A3C" stroke-width="3"/><path d="M -40 -4 L -58 -8 L -58 8 L -40 4 Z" fill="#E9C46A"/><path d="M -6 0 v 8 h 12 v -8 Z" fill="#E0457A" stroke="${E}" stroke-width="1"/><path d="M 8 0 v 10 h 10 v -10 Z" fill="#7FD8FF" stroke="${E}" stroke-width="1"/><path d="M -6 0 q 6 -6 12 0 M 8 0 q 5 -6 10 0" stroke="${E}" stroke-width="1" fill="none"/><circle cx="12" cy="-2" r="3" fill="#FF5A5A"/></g></g>`;
    }
    return s;
  }

  /* ---------- hele kortet ---------- */
  function svg(){
    CM = cityMood(); LITS = []; LAMPS = []; SEED = 17;
    const [sa, sb] = SKY[CM.time];
    const grass = CM.winter ? ['#DDE6F4', '#C8D4E8', '#F2F6FF'] : CM.season === 'efteraar' ? ['#6E8A4A', '#5E7A3E', '#8AA05A'] : ['#5E8A50', '#4E7A44', '#7AA060'];
    let s = `<svg id="kortSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Byen"><defs>`
      + `<linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sa}"/><stop offset="1" stop-color="${sb}"/></linearGradient>`
      + `<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4F4FF"/><stop offset="1" stop-color="#A9D4F5"/></linearGradient>`
      + `<radialGradient id="lampG"><stop offset="0" stop-color="#FFF4B8" stop-opacity=".95"/><stop offset=".4" stop-color="#FFE48A" stop-opacity=".4"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="kWell" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#E8B8FF"/><stop offset="1" stop-color="#6B3FA0"/></radialGradient>`
      + `<radialGradient id="kRose" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".5" stop-color="#FF8FC7"/><stop offset="1" stop-color="#6B3FA0"/></radialGradient>`
      + `<filter id="glowF" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>`
      + `<pattern id="kGrass" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="${grass[0]}"/><path d="M 8 12 l 2 -6 l 2 6 M 38 30 l 2 -6 l 2 6 M 50 8 l 1.5 -5 l 1.5 5" stroke="${grass[1]}" stroke-width="1.6" fill="none"/><circle cx="24" cy="20" r="1.5" fill="${grass[2]}"/></pattern>`
      + `<pattern id="kCob" width="34" height="20" patternUnits="userSpaceOnUse"><rect width="34" height="20" fill="#A898B8"/><rect x="1.5" y="1.5" width="14" height="7" rx="3" fill="#9888AA"/><rect x="18.5" y="1.5" width="14" height="7" rx="3" fill="#A090B0"/><rect x="10" y="11.5" width="14" height="7" rx="3" fill="#9888AA"/></pattern>`
      + `<pattern id="kStone" width="36" height="22" patternUnits="userSpaceOnUse"><path d="M 0 1 H 36 M 0 12 H 36 M 12 1 V 12 M 28 12 V 23" stroke="#000" stroke-opacity=".14" stroke-width="2" fill="none"/></pattern>`
      + `<pattern id="kBrick" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M 0 1 H 40 M 0 11 H 40 M 10 1 V 11 M 30 11 V 21" stroke="#000" stroke-opacity=".1" stroke-width="2" fill="none"/></pattern>`
      + `<pattern id="kPlank" width="30" height="16" patternUnits="userSpaceOnUse"><path d="M 0 15 H 30" stroke="#000" stroke-opacity=".09" stroke-width="2"/></pattern></defs>`;
    s += sky() + ground() + dragonHill() + school() + zoo() + paths() + brook() + dragonPath() + plaza() + dorm() + bubbleShop() + details() + concert() + cafe() + bridge() + arcade();
    /* skumringens skygge, lys fra vinduer og lygter, ildfluer og mørke kanter */
    const sh = SHADE[CM.time];
    if (sh) s += `<rect x="-900" y="-700" width="3400" height="2400" fill="${sh[0]}" opacity="${sh[1] * .8}" style="mix-blend-mode:multiply" pointer-events="none"/>`;
    if (CM.dark) s += `<g opacity="${CM.night ? 1 : .7}" pointer-events="none">` + LITS.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#FFD36E" opacity=".5" filter="url(#glowF)"/>`).join('') + LAMPS.map(([x, y]) => `<circle cx="${x + 4}" cy="${y - 6}" r="70" fill="url(#lampG)"/>`).join('') + `</g>`;
    s += townFireflies() + placeMood([], { vign: CM.night ? .65 : .5, dx: 100, dw: 1400 });
    return s + `</svg>`;
  }
  return { svg };
})();
