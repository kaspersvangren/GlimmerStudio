/* ================= Faldskærm =================
   Hele faget ligger i sin egen lukkede kasse (Fald), ligesom kosteflyvningen, så ingen navne herinde kan ramme andre filer.

   Sådan ser det ud i virkeligheden (skrevet ned før tegningen):
   - Man har faldskærmen på ryggen som en firkantet pakke med seler over skuldrene og om benene, og hjelm med briller.
   - I frit fald ligger man på maven: armene ude til siderne med albuerne bøjet op, benene spredt og let bøjet.
     Set ovenfra ser man hjelmen, ryggen med pakken, arme og ben. Luften kommer nedefra, så håret blafrer op og ud.
   - Skyer kommer nedefra og suser forbi én. Jorden er et lille kort langt nede, som langsomt vokser.
   - Skærmen er en aflang vinge af stofceller (7 her), åben i forkanten, hvor luften fylder den. Set ovenfra ligger den
     på tværs af flyveretningen. Springeren hænger i linerne under den; ovenfra ser man mest skærmen og hendes fødder bagved.
   - Skærmen flyver altid fremad. To styreliner: træk venstre = drej til venstre, træk højre = drej til højre,
     træk begge = brems (langsommere frem og lidt langsommere ned). Bremser man lige før jorden, bliver landingen blød.
   - Præcisionsspring: et rundt mål på jorden med ringe og en lille plet i midten; point efter afstand til midten.
   - Skærmens skygge ligger på jorden et stykke væk og løber sammen med springeren, når hun lander.

   Forløbet: et kort med læreren → hun flyver kæmpe højt op fra skolen på kortet (set fra siden, ikke interaktivt)
   → hun springer af kosten → frit fald ovenfra med stjernebobler → skærmen folder sig ud → styr ned i målet. */
const Fald = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, a = {}, html) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; };
  const rng = seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const SCX = 800, SCY = 500;
  /* frit fald */
  const FREE_T = 16, TA = 2.2, ALT0 = 3000, ALT1 = 1000;
  const BX0 = 170, BX1 = 1430, BY0 = 170, BY1 = 830;
  /* skærmen: højden i meter i spillet, og hvor stor jorden ser ud (kameraet følger lige over skærmen) */
  const H0 = 160, FOCAL = 720, CAM_UP = 30;
  const ppmAt = h => FOCAL / (CAM_UP + Math.max(0, h));
  const CAN_W = 130, CAN_C = 50;
  const RINGS = [2, 6, 12, 20], RING_STARS = [5, 3, 2, 1];
  const POND = { x: -64, y: 60, rx: 22, ry: 15 };
  const OPEN_T = 1.5;
  let S = null, raf = 0, keyOn = false;

  /* ---------- tegninger ---------- */
  const treeTop = (x, y, r, c) => `<circle cx="${(x + r * .3).toFixed(1)}" cy="${(y + r * .35).toFixed(1)}" r="${r.toFixed(1)}" fill="#0E1A12" opacity=".28"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${c}" stroke="${fdk(c, .35)}" stroke-width="${(r * .12).toFixed(2)}"/><circle cx="${(x - r * .3).toFixed(1)}" cy="${(y - r * .3).toFixed(1)}" r="${(r * .45).toFixed(1)}" fill="${lt(c, .18)}" opacity=".6"/>`;
  /* et lille menneske set ovenfra: skuldre og hoved (i meter) */
  /* (lidt større end i virkeligheden, så de kan ses fra luften) */
  const personTop = (x, y, body, hair, a = 0) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a}) scale(2.4)"><ellipse cx=".15" cy=".2" rx=".42" ry=".26" fill="#0E1A12" opacity=".3"/><ellipse rx=".4" ry=".24" fill="${body}" stroke="${fdk(body, .4)}" stroke-width=".05"/><circle r=".2" fill="${hair}" stroke="${fdk(hair, .4)}" stroke-width=".04"/></g>`;
  /* jorden ovenfra, i meter, med målet i (0, 0) */
  function groundSvg(){
    const r = rng(7); let o = `<rect x="-4200" y="-4200" width="8400" height="8400" fill="#47703F"/>`;
    const FC = ['#557F48', '#628C50', '#7C9A55', '#93A05C', '#4C7543', '#6E9452', '#A39A5E', '#5A8A58'];
    for (let i = 0; i < 200; i++){ const a = r() * Math.PI * 2, d = 290 + r() * 2900, x = Math.cos(a) * d, y = Math.sin(a) * d, w = 90 + r() * 170, h = 60 + r() * 150, rot = (r() * 40 - 20).toFixed(0);
      o += `<rect x="${(x - w / 2).toFixed(0)}" y="${(y - h / 2).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${FC[i % FC.length]}" transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})" stroke="#38582F" stroke-width="4"/>`;
      if (i % 4 !== 3){ let d = ''; const n = Math.floor(h / 14); for (let k = 1; k < n; k++) d += `M ${(x - w / 2 + 6).toFixed(0)} ${(y - h / 2 + k * 14).toFixed(0)} H ${(x + w / 2 - 6).toFixed(0)} `;
        o += `<path d="${d}" stroke="${fdk(FC[i % FC.length], .14)}" stroke-width="3" transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})" opacity=".55"/>`; } }
    /* skove */
    for (let i = 0; i < 46; i++){ const a = r() * Math.PI * 2, d = 330 + r() * 2600, cx = Math.cos(a) * d, cy = Math.sin(a) * d;
      for (let k = 0; k < 9; k++) o += treeTop(cx + (r() - .5) * 120, cy + (r() - .5) * 90, 14 + r() * 14, r() < .5 ? '#2C5534' : '#33603A'); }
    /* floden */
    const RIV = 'M -4200 640 C -2400 420 -1200 520 -560 300 S 300 360 900 120 S 2400 -520 4200 -380';
    o += `<path d="${RIV}" stroke="#2E5A7E" stroke-width="54" fill="none"/><path d="${RIV}" stroke="#4E86B8" stroke-width="40" fill="none"/><path d="${RIV}" stroke="#8EC4EE" stroke-width="4" fill="none" stroke-dasharray="40 60" opacity=".5"/>`;
    /* veje */
    const ROADS = ['M 230 -190 Q 160 -90 70 -50', 'M 170 -248 Q -200 -330 -560 -420', 'M -560 -420 Q -1400 -700 -3200 -800', 'M -560 -420 Q -620 200 -900 900 L -1600 2600', 'M 310 -248 Q 900 -300 1500 -200 L 3600 200'];
    o += ROADS.map(d => `<path d="${d}" stroke="#8E7E5E" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#C9B88A" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('');
    /* byen med tage i mange farver og gadelys */
    const ROOF = ['#B5432A', '#7A4E9A', '#3E5A8A', '#A86A3A', '#8A2A4A', '#5A6A8A'];
    for (let i = 0; i < 90; i++){ const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 190, x = -600 + Math.cos(a) * d * 1.3, y = -430 + Math.sin(a) * d, w = 12 + r() * 10, h = 9 + r() * 6, c = ROOF[i % ROOF.length], rot = (r() * 30 - 15).toFixed(0);
      o += `<g transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})"><rect x="${(x - w / 2 + 2).toFixed(1)}" y="${(y - h / 2 + 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#0E1A12" opacity=".3"/><rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${c}"/><rect x="${(x - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(h / 2).toFixed(1)}" fill="${fdk(c, .2)}"/></g>`;
      if (i % 4 === 0) o += `<circle cx="${(x + 10).toFixed(0)}" cy="${(y + 8).toFixed(0)}" r="3" fill="#FFE08A" opacity=".85"/><circle cx="${(x + 10).toFixed(0)}" cy="${(y + 8).toFixed(0)}" r="9" fill="#FFE08A" opacity=".15"/>`; }
    /* skolen ovenfra: mure om en gård, et tårn i hvert hjørne med spidst tag, og hovedbygningen */
    { const x = 170, y = -310, w = 140, h = 110, S2 = '#8C86B0';
      o += `<rect x="${x + 5}" y="${y + 6}" width="${w}" height="${h}" fill="#0E1A12" opacity=".3"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S2}" stroke="#4B4570" stroke-width="3"/><rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" fill="#6A7A58"/>`;
      o += `<rect x="${x + 44}" y="${y + 22}" width="52" height="40" fill="#5A2A78"/><path d="M ${x + 44} ${y + 42} H ${x + 96}" stroke="#3A1A50" stroke-width="3"/><path d="M ${x + 44} ${y + 22} L ${x + 70} ${y + 42} L ${x + 96} ${y + 22} M ${x + 44} ${y + 62} L ${x + 70} ${y + 42} L ${x + 96} ${y + 62}" stroke="#7A4A98" stroke-width="2" fill="none"/>`;
      for (const [tx, ty] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) o += `<circle cx="${tx + 4}" cy="${ty + 5}" r="17" fill="#0E1A12" opacity=".3"/><circle cx="${tx}" cy="${ty}" r="17" fill="#5A2A78" stroke="#3A1A50" stroke-width="3"/>` + [0, 1, 2, 3, 4, 5].map(k => `<path d="M ${tx} ${ty} L ${(tx + Math.cos(k * Math.PI / 3) * 17).toFixed(1)} ${(ty + Math.sin(k * Math.PI / 3) * 17).toFixed(1)}" stroke="#7A4A98" stroke-width="1.5"/>`).join('') + `<circle cx="${tx}" cy="${ty}" r="3" fill="#F2C14E"/>`;
      o += [[x + 30, y + 80], [x + 110, y + 82]].map(([lx, ly]) => `<circle cx="${lx}" cy="${ly}" r="10" fill="#FFE08A" opacity=".2"/><circle cx="${lx}" cy="${ly}" r="3" fill="#FFE08A"/>`).join(''); }
    /* engen omkring målet, en dam og træer */
    o += `<ellipse cx="0" cy="0" rx="110" ry="96" fill="#5E8F52"/><ellipse cx="0" cy="0" rx="92" ry="80" fill="#68995A"/>`;
    for (let i = 0; i < 160; i++){ const a = r() * Math.PI * 2, d = 24 + r() * 66; o += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d * .87).toFixed(1)}" r="${(.22 + r() * .22).toFixed(2)}" fill="${pick(['#FFE27A', '#FFFFFF', '#FF8FC7', '#C79BFF'])}" opacity=".85"/>`; }
    o += `<ellipse cx="${POND.x}" cy="${POND.y}" rx="${POND.rx + 2}" ry="${POND.ry + 2}" fill="#4E7A3E"/><ellipse cx="${POND.x}" cy="${POND.y}" rx="${POND.rx}" ry="${POND.ry}" fill="url(#pond)" stroke="#2E5A7E" stroke-width="1"/>`
      + [[-72, 54], [-58, 66], [-50, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#5DB866"/>`).join('');
    for (let i = 0; i < 26; i++){ const a = i / 26 * Math.PI * 2 + r() * .2, d = 84 + r() * 30; if (Math.abs(a - 2.4) < .35) continue; o += treeTop(Math.cos(a) * d, Math.sin(a) * d * .9, 4 + r() * 3.5, r() < .5 ? '#2F5A36' : '#3A6A40'); }
    /* målet: ringe og en guldstjerne i midten */
    const RC = ['#F2C14E', '#E0457A', '#FFF3E0', '#E0457A'];
    o += `<circle r="${RINGS[3] + 1.2}" fill="#FFF3E0" opacity=".9"/>` + [3, 2, 1, 0].map(i => `<circle r="${RINGS[i]}" fill="${RC[i]}" stroke="#2A2340" stroke-width=".25"/>`).join('');
    o += `<polygon points="${star5pts(0, .1, 1.5, .65)}" fill="#FFF6D0" stroke="#A87A1A" stroke-width=".15"/>`;
    /* tilskuere og læreren ved kanten af målet */
    const KIDS = [['#2E4A7A', '#B5432A'], ['#6B3FA0', '#F2C14E'], ['#3E7A4A', '#3A2A20'], ['#A0526B', '#E8E4F4'], ['#5A3A28', '#F2A04E'], ['#2E6A7A', '#2A2238']];
    KIDS.forEach(([b, h], i) => { const a = -2.2 + i * .34; o += personTop(Math.cos(a) * 27, Math.sin(a) * 27, b, h, a * 57 + 90); });
    o += personTop(27, 8, '#8A2A2A', '#B5432A', 100);
    /* vindposen */
    o += `<g class="fs-sock" transform="translate(30 -8)"><circle r=".35" fill="#2A2340"/><g class="fs-sockr"><path d="M 0 -.5 L 4 -.3 L 4 .3 L 0 .5 Z" fill="#FF8A3D" stroke="#A8442A" stroke-width=".12"/><path d="M 1.3 -.45 V .45 M 2.6 -.38 V .38" stroke="#FFFFFF" stroke-width=".35"/></g></g>`;
    return o;
  }
  /* figuren i frit fald, set ovenfra: maven nedad, arme og ben ude */
  function heroTop(st){
    const sk = st.skin, skS = fdk(sk, .42), suit = st.robe.a, sd = fdk(suit, .42), trim = st.robe.b, ha = st.hat.a, hb = st.hat.b, hs = fdk(ha, .42), hA = st.hair.a, hS = fdk(hA, .42), bt = st.boots;
    const limb = (d, w) => `<path d="${d}" stroke="${sd}" stroke-width="${w + 6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${suit}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    let o = `<g class="fs-legs">`;
    for (const f of [-1, 1]){
      o += limb(`M ${f * 18} 30 Q ${f * 40} 58 ${f * 54} 90 Q ${f * 58} 110 ${f * 48} 128`, 26);
      o += `<path d="M ${f * 46} 118 Q ${f * 64} 124 ${f * 60} 148 Q ${f * 50} 160 ${f * 36} 150 Q ${f * 30} 132 ${f * 46} 118 Z" fill="${bt.a}" stroke="${fdk(bt.a, .42)}" stroke-width="3"/><path d="M ${f * 40} 142 Q ${f * 48} 150 ${f * 56} 144" stroke="${fdk(bt.a, .3)}" stroke-width="4" fill="none"/>`;
    }
    o += `</g><g class="fs-arms">`;
    for (const f of [-1, 1]){
      o += limb(`M ${f * 30} -44 Q ${f * 62} -42 ${f * 86} -34 Q ${f * 96} -58 ${f * 90} -84`, 22);
      o += `<path d="M ${f * 80} -80 L ${f * 100} -82" stroke="${trim}" stroke-width="6" stroke-linecap="round"/>`;
      /* hånden fladt ud mod luften: håndflade og fire fingre samlet, tommelfingeren lidt ud */
      o += `<path d="M ${f * 82} -86 Q ${f * 80} -104 ${f * 88} -112 Q ${f * 96} -114 ${f * 100} -106 Q ${f * 102} -94 ${f * 98} -86 Z" fill="${sk}" stroke="${skS}" stroke-width="2.5" stroke-linejoin="round"/><path d="M ${f * 82} -92 Q ${f * 74} -96 ${f * 74} -102" stroke="${skS}" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M ${f * 82} -92 Q ${f * 75} -96 ${f * 75} -101" stroke="${sk}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    }
    o += `</g>`;
    o += `<path d="M -36 -56 Q 0 -70 36 -56 Q 44 -10 32 36 Q 0 48 -32 36 Q -44 -10 -36 -56 Z" fill="${suit}" stroke="${sd}" stroke-width="3"/>`;
    o += `<path d="M -36 24 Q 0 36 36 24" stroke="${trim}" stroke-width="6" fill="none" opacity=".85"/>`;
    /* pakken på ryggen, med seler og det gule håndtag */
    o += `<rect x="-31" y="-54" width="62" height="78" rx="13" fill="#3A3550" stroke="#1E1A30" stroke-width="3"/>`;
    o += `<path d="M -31 -41 Q -31 -54 -18 -54 H 18 Q 31 -54 31 -41 V -28 H -31 Z" fill="#E0457A" stroke="#1E1A30" stroke-width="2.5"/>`;
    o += `<path d="M -22 -6 H 22 M -22 8 H 22" stroke="#1E1A30" stroke-width="2" opacity=".5"/><circle cx="20" cy="16" r="6" fill="#F2C14E" stroke="#8A6420" stroke-width="2"/>`;
    o += `<path d="M -28 -56 Q -36 -60 -40 -50 M 28 -56 Q 36 -60 40 -50 M -30 22 Q -24 34 -16 34 M 30 22 Q 24 34 16 34" stroke="#2A2238" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    /* håret blafrer ud under hjelmen */
    if (st.back !== 'kort') o += `<g class="fs-hairf">` + [[-1, 0], [1, 0], [-1, 1], [1, 1]].map(([f, k]) => `<path d="M ${f * 10} -70 Q ${f * (42 + k * 14)} ${-80 + k * 22} ${f * (62 + k * 18)} ${-62 + k * 30} Q ${f * (44 + k * 10)} ${-60 + k * 18} ${f * 14} -60 Z" fill="${hA}" stroke="${hS}" stroke-width="2.5" stroke-linejoin="round"/>`).join('') + `</g>`;
    o += `<ellipse cx="0" cy="-62" rx="14" ry="9" fill="${sk}" stroke="${skS}" stroke-width="2.5"/>`;
    /* hjelmen set ovenfra og lidt bagfra */
    o += `<circle cx="0" cy="-92" r="30" fill="${ha}" stroke="${hs}" stroke-width="3"/><path d="M 0 -121 V -63" stroke="${hb}" stroke-width="9"/>`;
    o += `<path d="M -29 -98 Q 0 -86 29 -98" stroke="#2A2238" stroke-width="5" fill="none"/><path d="M -14 -112 Q 0 -119 14 -112" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>`;
    return o;
  }
  /* skærmen ovenfra, fronten opad: syv celler, åbninger i forkanten, hendes støvler stikker ud bagved */
  function canopyTop(st, shadow){
    const n = 7, W = CAN_W, C = CAN_C, cw = 2 * W / n;
    const A = '#E0457A', B = '#F2C14E', M = st.robe.a, D = '#7FD8FF', cols = [A, B, M, D, M, B, A];
    const cell = i => { const x0 = -W + i * cw, x1 = x0 + cw, mx = (x0 + x1) / 2, e = Math.abs(i - 3) / 3, k = 1 - e * e * .14, yF = -C * k, yB = C * k;
      return { x0, x1, mx, yF, yB, d: `M ${x0.toFixed(1)} ${(yF + 4).toFixed(1)} Q ${mx.toFixed(1)} ${(yF - 10).toFixed(1)} ${x1.toFixed(1)} ${(yF + 4).toFixed(1)} L ${x1.toFixed(1)} ${yB.toFixed(1)} Q ${mx.toFixed(1)} ${(yB - 6).toFixed(1)} ${x0.toFixed(1)} ${yB.toFixed(1)} Z` }; };
    if (shadow) return Array.from({ length: n }, (_, i) => `<path d="${cell(i).d}" fill="#0A1208"/>`).join('');
    let o = `<g class="fs-under">` + [-1, 1].map(f => `<path d="M ${f * 9} ${C - 6} V ${C + 26}" stroke="${fdk(st.robe.a, .25)}" stroke-width="12" stroke-linecap="round"/><ellipse cx="${f * 10}" cy="${C + 34}" rx="8" ry="10" fill="${st.boots.a}" stroke="${fdk(st.boots.a, .42)}" stroke-width="2.5"/>`).join('') + `</g>`;
    o += `<path d="M ${-W + cw * .5} ${C - 8} L -10 ${C + 6} M ${W - cw * .5} ${C - 8} L 10 ${C + 6}" stroke="#F2EEFF" stroke-width="2" opacity=".85"/>`;
    for (let i = 0; i < n; i++){ const c = cell(i), col = cols[i];
      o += `<path d="${c.d}" fill="${col}" stroke="${fdk(col, .45)}" stroke-width="2.5" stroke-linejoin="round"/>`;
      o += `<path d="M ${c.mx.toFixed(1)} ${(c.yF + 2).toFixed(1)} V ${(c.yB - 5).toFixed(1)}" stroke="${fdk(col, .25)}" stroke-width="1.5" opacity=".55"/>`;
      o += `<ellipse cx="${c.mx.toFixed(1)}" cy="${(c.yF + 1).toFixed(1)}" rx="${(cw * .3).toFixed(1)}" ry="3.5" fill="${fdk(col, .55)}" opacity=".75"/>`;
      o += `<path d="M ${(c.x0 + 4).toFixed(1)} ${(c.yF + 11).toFixed(1)} Q ${c.mx.toFixed(1)} ${(c.yF + 3).toFixed(1)} ${(c.x1 - 4).toFixed(1)} ${(c.yF + 11).toFixed(1)}" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".35"/>`;
      if (i === 3) o += starP(c.mx, 0, 11, '#FFFFFF', .7);
    }
    /* bagkanten trækkes ned, når man trækker i styrelinen */
    o += `<path class="fs-flap l" d="M ${-W} ${C * .84} L ${-W + cw * 2.5} ${C * .97} L ${-W + cw * 2.5} ${C * .97 + 12} L ${-W} ${C * .84 + 10} Z" fill="#1E1A30"/>`;
    o += `<path class="fs-flap r" d="M ${W} ${C * .84} L ${W - cw * 2.5} ${C * .97} L ${W - cw * 2.5} ${C * .97 + 12} L ${W} ${C * .84 + 10} Z" fill="#1E1A30"/>`;
    return o;
  }
  /* skærmen ligger sammenfaldet på jorden foran hende, og hun står ved siden af */
  function landedTop(st){
    const cols = ['#E0457A', '#F2C14E', st.robe.a, '#7FD8FF', st.robe.a, '#F2C14E', '#E0457A'];
    /* stoffet falder sammen i bløde folder foran hende */
    let o = `<g transform="scale(1.5)"><g transform="translate(0 -62)">` + cols.map((c, i) => { const x = -66 + i * 22, y = Math.sin(i * 1.7) * 6;
      return `<path d="M ${x - 20} ${y + 4} Q ${x - 14} ${y - 22} ${x} ${y - 20} Q ${x + 16} ${y - 24} ${x + 20} ${y - 2} Q ${x + 18} ${y + 20} ${x} ${y + 18} Q ${x - 18} ${y + 22} ${x - 20} ${y + 4} Z" fill="${c}" stroke="${fdk(c, .45)}" stroke-width="2.5" stroke-linejoin="round"/><path d="M ${x - 10} ${y - 8} Q ${x} ${y - 14} ${x + 10} ${y - 6}" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity=".35"/>`; }).join('') + `</g>`;
    o += `<path d="M -50 -48 L -8 -10 M 50 -48 L 8 -10 M -20 -46 L -4 -12 M 20 -46 L 4 -12" stroke="#F2EEFF" stroke-width="1.5" opacity=".8"/>`;
    o += `<ellipse cx="6" cy="8" rx="34" ry="22" fill="#0E1A12" opacity=".3"/><ellipse cx="0" cy="0" rx="32" ry="20" fill="${st.robe.a}" stroke="${fdk(st.robe.a, .42)}" stroke-width="3"/><rect x="-14" y="2" width="28" height="20" rx="6" fill="#3A3550" stroke="#1E1A30" stroke-width="2"/>`;
    /* armene i vejret: hun jubler */
    o += [-1, 1].map(f => `<path d="M ${f * 28} -2 Q ${f * 44} -16 ${f * 40} -34" stroke="${fdk(st.robe.a, .42)}" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M ${f * 28} -2 Q ${f * 44} -16 ${f * 40} -34" stroke="${st.robe.a}" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="${f * 40}" cy="-38" r="8" fill="${st.skin}" stroke="${fdk(st.skin, .42)}" stroke-width="2.5"/>`).join('');
    o += `<circle cx="0" cy="-4" r="17" fill="${st.hat.a}" stroke="${fdk(st.hat.a, .42)}" stroke-width="3"/><path d="M 0 -21 V 13" stroke="${st.hat.b}" stroke-width="6"/><path d="M -8 -14 Q 0 -18 8 -14" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
    return o + `</g>`;
  }
  const bubbleArt = gold => `<circle r="60" fill="#FFFFFF" fill-opacity=".1" stroke="${gold ? '#FFE27A' : '#BFE8FF'}" stroke-width="5"/><circle r="60" fill="none" stroke="#FF8FC7" stroke-width="2.5" opacity=".7" stroke-dasharray="40 50"/>${starP(0, 4, gold ? 36 : 30, gold ? '#FFC02E' : '#FFE27A')}<path d="M -30 -32 Q -16 -46 2 -46" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`;
  const cloudArt = (k, seed) => { const r = rng(seed); let o = ''; for (let i = 0; i < 7; i++){ const a = r() * Math.PI * 2, d = r() * 220 * k; o += `<ellipse cx="${(Math.cos(a) * d).toFixed(0)}" cy="${(Math.sin(a) * d * .7).toFixed(0)}" rx="${(150 + r() * 130) * k}" ry="${(100 + r() * 80) * k}" fill="${i % 2 ? '#E8E2FA' : '#D6CCF2'}"/>`; } return o; };

  /* ---------- skærmen ---------- */
  function sceneSvg(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" class="fs-svg"><defs>`
      + `<radialGradient id="pond" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#7FC8F0"/><stop offset="1" stop-color="#3E7EB8"/></radialGradient>`
      + `<radialGradient id="haze" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#C8B8F0" stop-opacity=".12"/><stop offset="1" stop-color="#2A2260" stop-opacity=".75"/></radialGradient></defs>`;
    o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="#2A2350"/>`;
    o += `<g class="fs-ground">${groundSvg()}</g>`;
    o += `<g class="fs-gtop"><g class="fs-shadow" opacity=".3"></g></g>`;
    o += `<rect class="fs-haze" x="-1700" y="-700" width="5000" height="2400" fill="url(#haze)"/>`;
    o += `<g class="fs-below"></g><g class="fs-hero"></g><g class="fs-can"></g><g class="fs-above"></g><path class="fs-motes" d="" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".55" fill="none"/>`;
    o += `<g class="fs-pin"></g><g class="fs-fx"></g>`;
    o += placeMood([], { vign: .55, dx: 200, dw: 1200 });
    return o + `</svg>`;
  }
  /* indledningen: kortet over byen, og en lang himmel over det */
  function introSvg(){
    const cm = cityMood(), top = (SKY[cm.time] || SKY.aften)[0];
    /* byens egen skygge og vignet stopper ved himlens kant og ville give en streg, så de tages ud; hele billedet får sin egen vignet */
    const town = townSvg().replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>\s*$/, '</g>').replace(/<rect[^>]*mix-blend-mode:multiply[^>]*\/>/, '').replace(/<rect x="-1700" y="-700" width="5000" height="2400" fill="url\(#pm\d+v\)"\/>/, '');
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" class="fs-svg"><defs><linearGradient id="isky" gradientUnits="userSpaceOnUse" x1="0" y1="-700" x2="0" y2="-5200"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="#1E1A50"/><stop offset="1" stop-color="#0A0C26"/></linearGradient></defs>`;
    o += `<rect x="-1700" y="-700" width="5000" height="2400" fill="#0A0C26"/><g class="fs-icam">`;
    o += `<rect x="-3000" y="-5200" width="7600" height="5300" fill="url(#isky)"/>`;
    const r = rng(3);
    for (let i = 0; i < 140; i++) o += `<circle cx="${(-1400 + r() * 4400).toFixed(0)}" cy="${(-5000 + r() * 3200).toFixed(0)}" r="${(1.2 + r() * 2.4).toFixed(1)}" fill="#FFFFFF" opacity="${(.35 + r() * .6).toFixed(2)}"/>`;
    o += `<g transform="translate(1250 -3900)"><circle r="150" fill="#FFF6D8" opacity=".1"/><circle r="74" fill="#FFF6D8"/><circle cx="28" cy="-16" r="66" fill="#1A1A50" opacity=".9"/></g>`;
    o += town;
    /* skylaget, hun flyver op igennem */
    for (const [x, y, k, s] of [[-300, -1250, 1.3, 1], [500, -1350, 1.6, 2], [1300, -1220, 1.4, 3], [2100, -1330, 1.5, 4], [200, -2300, .9, 5], [1500, -2600, 1, 6]]) o += `<g transform="translate(${x} ${y})" opacity=".85">${cloudArt(k, s).replace(/#E8E2FA/g, '#6A5AA8').replace(/#D6CCF2/g, '#5A4A98')}</g>`;
    o += `<g class="fs-ibroom"></g><g class="fs-irider"></g>`;
    o += `</g>` + placeMood([], { vign: .5, dx: 200, dw: 1200 }) + `</svg>`;
    return o;
  }

  function show(){
    showScreen('#fald'); playMusic('show');
    stop();
    const hero = heroState(), wind = (prog.jumps || 0) >= 2 ? 1.2 + Math.random() * 1.6 : 0, wa = Math.random() * Math.PI * 2;
    const a0 = Math.random() * Math.PI * 2, d0 = 105 + Math.random() * 30;
    S = { hero, run: 'card', t: 0, auto: !!window.FALD_AUTO, bubbles: 0, bubN: 0, gold: 0,
      hx: SCX, hy: SCY + 40, tx: SCX, ty: SCY + 40, tilt: 0, objs: [], motes: [], spawn: [],
      x: Math.cos(a0) * d0, y: Math.sin(a0) * d0, th: Math.atan2(-Math.cos(a0), Math.sin(a0)) * 180 / Math.PI + (Math.random() < .5 ? 1 : -1) * (70 + Math.random() * 50),
      h: H0, v: 9, sink: 3.8, turnV: 0, wind: { x: Math.cos(wa) * wind, y: Math.sin(wa) * wind, s: wind, a: wa }, ctl: { L: false, R: false, F: false }, keys: {}, ptrs: new Map(), soft: false };
    makeSpawns();
    const box = $('#faldBody'); box.innerHTML = '';
    const scene = el('div', { class:'scene-wrap', id:'fsScene' });
    const count = el('span', { class:'starpill kf-count fs-count', html: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#7FD8FF" stroke-width="2.4"/><path d="M12 6l1.8 4 4.2.4-3.2 2.8 1 4.2L12 15.2 8.2 17.4l1-4.2L6 10.4l4.2-.4z" fill="#FFC02E"/></svg><span class="n">0</span>` });
    const alt = el('div', { class:'fs-alt', 'aria-hidden':'true' }, [ el('div', { class:'fs-alt-bar' }, [ el('span', { class:'fs-alt-dot' }) ]), el('span', { class:'fs-alt-n' }, '0 m') ]);
    const pad = (k, label, icon) => el('div', { class:'fs-pad ' + k, 'aria-hidden':'true' }, [ el('span', { class:'fs-pad-ic', html: icon }), el('span', { class:'fs-pad-t' }, label) ]);
    const TOG = '<svg viewBox="0 0 60 60"><path d="M 30 4 V 22" stroke="#F2EEFF" stroke-width="4"/><path d="M 14 26 Q 30 16 46 26 Q 50 46 30 54 Q 10 46 14 26 Z" fill="#E0457A" stroke="#FFFFFF" stroke-width="4"/><path d="M 22 32 Q 30 28 38 32" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
    const FAST = '<svg viewBox="0 0 60 60"><path d="M 16 40 L 30 24 L 44 40" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M 16 28 L 30 12 L 44 28" stroke="#FFE27A" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const pads = el('div', { class:'fs-pads', hidden: true }, [ pad('l', 'Venstre', TOG), pad('f', 'Fart', FAST), pad('r', 'Højre', TOG), el('p', { class:'fs-both' }, 'Begge sider = brems') ]);
    const windEl = el('div', { class:'fs-wind', hidden: true, 'aria-hidden':'true', html: `<svg viewBox="0 0 40 40"><g class="fs-warr"><path d="M 6 20 H 30 M 22 12 L 32 20 L 22 28" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg><span>Vind</span>` });
    box.append(scene, alt, pads, windEl, ...placeUi([ backBtn('Gangen', () => { stop(); showSchool(); }) ], [ count, starPill() ]));
    bindInput(scene);
    card();
  }
  function card(){
    if (S.auto){ introStart(); return; }
    const card = el('div', { class:'reveal magic m-rum kf-intro' }, [
      el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
      el('div', { class:'kf-teach' }, [ el('img', { alt:'', src: Kost.teacherUrl() }) ]),
      el('div', { class:'reveal-info' }, [
        el('p', { class:'reveal-cat' }, Kost.TEACH),
        el('h3', { class:'reveal-name' }, 'Klar til at springe?'),
        el('p', { class:'kf-how' }, 'I det frie fald styrer du med fingeren og samler stjernebobler. Når skærmen er ude: venstre og højre side drejer, begge sider bremser, og midten giver fart. Land midt i målet!'),
        el('div', { class:'reveal-btns row' }, [ el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); veil.remove(); introStart(); } } }, 'Klar!') ]) ]) ]);
    const veil = el('div', { class:'shop-veil kf-veil' }, [ card ]);
    $('#faldBody').append(veil);
    /* bag kortet: kortet over byen */
    $('#fsScene').innerHTML = scopeIds(introSvg(), 'fi');
    drawIntro(0);
  }

  /* ---------- indledningen: op fra skolen, højt over skyerne, og så springer hun ---------- */
  const T_UP = 5, T_HOVER = .8, T_JUMP = 1.3;
  function introStart(){
    if (!$('#fsScene .fs-icam')) $('#fsScene').innerHTML = scopeIds(introSvg(), 'fi');
    const rid = $('#fsScene .fs-irider');
    rid.innerHTML = `<g class="fs-itilt"><g transform="scale(.4)">${Kost.riderSvg(S.hero, { gear: true })}</g></g>`;
    S.run = 'intro'; S.t = calm ? T_UP + T_HOVER : 0;
    const skip = el('div', { class:'fs-skip' }, 'Tryk for at springe');
    $('#faldBody').append(skip);
    sfx.whoosh();
    loop();
  }
  const ease = u => u * u * (3 - 2 * u);
  function riderAt(t){ const u = clamp(t / T_UP, 0, 1); return { x: 800 + 300 * Math.sin(u * Math.PI / 2), y: 330 - 3800 * Math.pow(u, 1.7), u }; }
  function drawIntro(t){
    const sc = $('#fsScene'); if (!sc) return;
    const p = riderAt(Math.min(t, T_UP)), cam = sc.querySelector('.fs-icam'), rid = sc.querySelector('.fs-irider');
    const fy = Math.min(500, p.y + 40), fx = 800 + (p.x - 800) * .7, z = 1 + .35 * ease(p.u);
    cam.setAttribute('transform', `translate(${SCX} ${SCY}) scale(${z.toFixed(3)}) translate(${(-fx).toFixed(1)} ${(-fy).toFixed(1)})`);
    let x = p.x, y = p.y, rot = -16 * Math.sin(p.u * Math.PI) - 4 * (1 - p.u);
    if (t > T_UP){ const h = t - T_UP; y += Math.sin(h * 4) * 6; rot = 0; }
    if (t > T_UP + T_HOVER){
      /* springet: kosten flyver selv hjem, hun tipper forover og falder */
      const j = (t - T_UP - T_HOVER) / T_JUMP, br = sc.querySelector('.fs-ibroom');
      if (!br.firstChild){ rid.querySelector('.fs-itilt').innerHTML = `<g transform="scale(.4)">${Kost.riderSvg(S.hero, { gear: true, noBroom: true })}</g>`; br.innerHTML = `<g transform="scale(.4)">${Kost.broomSvg()}</g>`; tone(700, 0.2, 'triangle', 0.05, 0, .5); }
      br.setAttribute('transform', `translate(${(x + 40 + j * 900).toFixed(1)} ${(y + 6 - j * 260).toFixed(1)}) rotate(-12)`);
      x += j * 80; y += 900 * j * j; rot = 95 * ease(Math.min(1, j * 1.6));
    }
    rid.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    rid.firstChild && rid.firstChild.setAttribute('transform', `rotate(${rot.toFixed(1)})`);
    setAlt(Math.round(ALT0 * Math.pow(p.u, 1.7) / 50) * 50, Math.pow(p.u, 1.7));
  }
  function setAlt(m, f){ const n = $('#faldBody .fs-alt-n'), d = $('#faldBody .fs-alt-dot'); if (n) n.textContent = `${m} m`; if (d) d.style.top = ((1 - clamp(f, 0, 1)) * 100).toFixed(1) + '%'; }
  function skipIntro(){ if (S && S.run === 'intro' && S.t < T_UP + T_HOVER) S.t = T_UP + T_HOVER; }

  /* ---------- frit fald ---------- */
  function makeSpawns(){
    let px = SCX, py = SCY, n = 0;
    for (let t = 1.2; t < FREE_T - TA - .2; t += .78){
      px = clamp(px + (Math.random() * 2 - 1) * 420, BX0 + 60, BX1 - 60); py = clamp(py + (Math.random() * 2 - 1) * 300, BY0 + 60, BY1 - 60);
      S.spawn.push({ t, kind:'bub', x: px, y: py, gold: ++n % 7 === 0 });
    }
    for (let t = .4; t < FREE_T - TA; t += 1.3 + Math.random() * .6) S.spawn.push({ t, kind:'cloud', x: 200 + Math.random() * 1200, y: 150 + Math.random() * 700, k: .7 + Math.random() * .6, seed: 1 + Math.floor(Math.random() * 50) });
    S.spawn.sort((a, b) => a.t - b.t);
    S.bubN = S.spawn.filter(s => s.kind === 'bub').length;
    for (let i = 0; i < 26; i++) S.motes.push({ x: Math.random() * 1600, y: Math.random() * 1000, z: Math.random() });
  }
  function freeStart(){
    const sc = $('#fsScene'); sc.innerHTML = scopeIds(sceneSvg(), 'fs');
    sc.querySelector('.fs-hero').innerHTML = `<g class="fs-htilt"><g transform="scale(.8)">${heroTop(S.hero)}</g></g>`;
    $('#faldBody .fs-skip') && $('#faldBody .fs-skip').remove();
    flash();
    S.run = 'free'; S.t = 0;
    big('Saml stjernerne!');
  }
  const proj = (o, z) => { const s = 1 / (1 + 5 * z); return { s, x: SCX + (o.x - SCX) * s, y: SCY + (o.y - SCY) * s }; };
  function stepFree(dt){
    S.t += dt;
    /* nye ting dukker op langt nede */
    while (S.spawn.length && S.spawn[0].t <= S.t){ const o = S.spawn.shift(); o.z = 1; o.el = mk('g', { class: 'fs-obj ' + o.kind }, o.kind === 'bub' ? bubbleArt(o.gold) : cloudArt(o.k, o.seed)); $('#fsScene .fs-below').append(o.el); S.objs.push(o); }
    if (S.auto){ const nb = S.objs.filter(o => o.kind === 'bub' && o.z > 0 && !o.got).sort((a, b) => a.z - b.z)[0]; if (nb){ S.tx = nb.x; S.ty = nb.y; } }
    /* hun glider mod fingeren */
    if (S.keys.ArrowLeft) S.tx -= 900 * dt; if (S.keys.ArrowRight) S.tx += 900 * dt; if (S.keys.ArrowUp) S.ty -= 900 * dt; if (S.keys.ArrowDown) S.ty += 900 * dt;
    S.tx = clamp(S.tx, BX0, BX1); S.ty = clamp(S.ty, BY0, BY1);
    let vx = (S.tx - S.hx) * 5, vy = (S.ty - S.hy) * 5; const sp = Math.hypot(vx, vy); if (sp > 1300){ vx *= 1300 / sp; vy *= 1300 / sp; }
    S.hx += vx * dt; S.hy += vy * dt; S.tilt += (clamp(vx / 45, -22, 22) - S.tilt) * Math.min(1, dt * 6);
    for (const o of S.objs){
      const z0 = o.z; o.z -= dt / TA;
      if (z0 > 0 && o.z <= 0){
        $('#fsScene .fs-above').append(o.el);
        if (o.kind === 'bub' && Math.hypot(o.x - S.hx, o.y - S.hy) < 125){ o.got = true; S.bubbles += o.gold ? 3 : 1; sfx.coin(); if (o.gold) sfx.magic(); spark(o.x, o.y, o.gold ? '#FFC02E' : '#FFE27A'); const n = $('#faldBody .fs-count .n'); if (n) n.textContent = S.bubbles; o.el.remove(); o.dead = true; }
        if (o.kind === 'cloud' && Math.hypot(o.x - S.hx, o.y - S.hy) < 330 * o.k) puff();
      }
      if (o.z < -.16){ o.el.remove(); o.dead = true; }
    }
    S.objs = S.objs.filter(o => !o.dead);
    for (const m of S.motes){ m.z -= dt / .55; if (m.z < -.12){ m.z = 1; m.x = Math.random() * 1600; m.y = Math.random() * 1000; } }
    if (S.t >= FREE_T){ S.run = 'open'; S.t = 0; openStart(); }
  }
  function drawFree(){
    const sc = $('#fsScene'); if (!sc) return;
    const f = clamp(S.t / FREE_T, 0, 1);
    groundAt(.45 + f * 1.1, S.x, S.y);
    sc.querySelector('.fs-haze').setAttribute('opacity', (.75 - f * .4).toFixed(2));
    sc.querySelector('.fs-hero').setAttribute('transform', `translate(${S.hx.toFixed(1)} ${S.hy.toFixed(1)})`);
    sc.querySelector('.fs-htilt').setAttribute('transform', `rotate(${S.tilt.toFixed(1)})`);
    for (const o of S.objs){ const p = proj(o, o.z), op = o.z > .8 ? (1 - o.z) / .2 : o.z < 0 ? Math.max(0, 1 + o.z / .16) * (o.kind === 'cloud' ? .55 : 1) : 1;
      o.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.s.toFixed(3)})`); o.el.setAttribute('opacity', (op * (o.kind === 'cloud' ? .9 : 1)).toFixed(2)); }
    let d = ''; for (const m of S.motes){ if (m.z > 1 || m.z < -.1) continue; const a = proj(m, m.z), b = proj(m, m.z + .06); d += `M ${a.x.toFixed(0)} ${a.y.toFixed(0)} L ${b.x.toFixed(0)} ${b.y.toFixed(0)} `; }
    sc.querySelector('.fs-motes').setAttribute('d', d);
    setAlt(Math.round((ALT0 - (ALT0 - ALT1) * f) / 50) * 50, 1 - f * (1 - ALT1 / ALT0));
  }
  /* den del af tegningen, der faktisk kan ses på skærmen (den er bredere end 1600 på en telefon) */
  function visBox(sc){ const svg = sc.querySelector('svg'), r = sc.getBoundingClientRect(), m = svg && svg.getScreenCTM(); if (!m) return { x0: 0, x1: 1600, y0: 0, y1: 1000 };
    return { x0: (r.left - m.e) / m.a, x1: (r.right - m.e) / m.a, y0: (r.top - m.f) / m.d, y1: (r.bottom - m.f) / m.d }; }
  function groundAt(ppm, cx, cy){ const g = $('#fsScene .fs-ground'); if (g) g.setAttribute('transform', `translate(${SCX} ${SCY}) scale(${ppm.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`); S.ppm = ppm; }

  /* ---------- skærmen folder sig ud ---------- */
  function openStart(){
    const sc = $('#fsScene');
    sc.querySelector('.fs-can').innerHTML = `<g class="fs-cscale"><g class="fs-crot">${canopyTop(S.hero)}</g></g>`;
    sc.querySelector('.fs-shadow').innerHTML = canopyTop(S.hero, true);
    for (const o of S.objs) o.el.remove(); S.objs = [];
    sc.querySelector('.fs-motes').setAttribute('d', '');
    tone(300, 0.3, 'sine', 0.06, 0, .5); setTimeout(() => tone(120, 0.35, 'triangle', 0.08, 0, .7), 400);
    S.ox = S.hx; S.oy = S.hy; S.op0 = S.ppm;
  }
  function stepOpen(dt){
    S.t += dt;
    if (S.t >= OPEN_T){ S.run = 'canopy'; S.t = 0; $('#faldBody .fs-pads').hidden = false; if (S.wind.s) $('#faldBody .fs-wind').hidden = false; big('Styr mod målet!'); }
  }
  function drawOpen(){
    const sc = $('#fsScene'); if (!sc) return;
    const u = clamp(S.t / OPEN_T, 0, 1), e = ease(u), back = 1 + Math.sin(u * Math.PI) * .12;
    groundAt(S.op0 + (ppmAt(H0) - S.op0) * e, S.x, S.y);
    sc.querySelector('.fs-haze').setAttribute('opacity', (.35 * (1 - e)).toFixed(2));
    const hx = S.ox + (SCX - S.ox) * e, hy = S.oy + (SCY - S.oy) * e;
    sc.querySelector('.fs-hero').setAttribute('transform', `translate(${hx.toFixed(1)} ${(hy + 40 * e).toFixed(1)}) scale(${(1 - .5 * e).toFixed(3)})`);
    sc.querySelector('.fs-hero').setAttribute('opacity', (1 - clamp((u - .45) / .3, 0, 1)).toFixed(2));
    const sx = .12 + .88 * ease(clamp(u * 1.3 - .15, 0, 1)), sy = .2 + .8 * ease(clamp(u * 1.5 - .1, 0, 1));
    sc.querySelector('.fs-can').setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)})`);
    sc.querySelector('.fs-cscale').setAttribute('transform', `scale(${(sx * back).toFixed(3)} ${(sy * back).toFixed(3)})`);
    sc.querySelector('.fs-crot').setAttribute('transform', `rotate(${(S.th * e).toFixed(1)})`);
    sc.querySelector('.fs-can').setAttribute('opacity', clamp(u * 3, 0, 1).toFixed(2));
    drawShadow(e);
  }
  function drawShadow(k = 1){
    const sh = $('#fsScene .fs-shadow'); if (!sh) return;
    const p = S.ppm, ox = .35 * S.h * p, oy = .5 * S.h * p, s = p / 24;
    sh.setAttribute('transform', `translate(${(SCX + ox).toFixed(1)} ${(SCY + oy).toFixed(1)}) rotate(${S.th.toFixed(1)}) scale(${s.toFixed(3)})`);
    sh.setAttribute('opacity', (.3 * k).toFixed(2));
  }

  /* ---------- under skærmen ---------- */
  function ctl(){
    const k = S.keys, z = [...S.ptrs.values()];
    S.ctl.L = z.includes('L') || !!k.ArrowLeft || !!k.ArrowDown;
    S.ctl.R = z.includes('R') || !!k.ArrowRight || !!k.ArrowDown;
    S.ctl.F = z.includes('F') || !!k.ArrowUp;
    if (S.auto) autopilot();
  }
  function autopilot(){
    const d = Math.hypot(S.x, S.y), want = Math.atan2(-S.x, S.y) * 180 / Math.PI, glide = S.h * (9 / 3.8);
    let diff = ((want - S.th) % 360 + 540) % 360 - 180;
    /* for højt oppe: cirkel; ellers sigt mod målet; brems til sidst */
    const L = diff < -8, R = diff > 8;
    S.ctl = glide > d + 45 ? { L: false, R: true, F: false } : { L, R, F: false };
    if (S.h < 5) S.ctl = { L: true, R: true, F: false };
  }
  function stepCanopy(dt){
    S.t += dt; ctl();
    const { L, R, F } = S.ctl, brake = L && R;
    let vt = 9, st = 3.8;
    if (brake){ vt = 4.2; st = 2.6; } else if (F){ vt = 14; st = 6.2; }
    const turn = brake ? 0 : L ? -1 : R ? 1 : 0;
    if (turn) st += 1.3;
    S.turnV += (turn * 80 - S.turnV) * Math.min(1, dt * 4);
    S.th += S.turnV * dt;
    S.v += (vt - S.v) * Math.min(1, dt * 1.8); S.sink += (st - S.sink) * Math.min(1, dt * 1.8);
    const rad = S.th * Math.PI / 180;
    S.x += (Math.sin(rad) * S.v + S.wind.x) * dt; S.y += (-Math.cos(rad) * S.v + S.wind.y) * dt; S.h -= S.sink * dt;
    if (S.h < 6) S.soft = brake;
    if (S.h <= 0){ S.h = 0; land(); }
  }
  function drawCanopy(){
    const sc = $('#fsScene'); if (!sc) return;
    groundAt(ppmAt(S.h), S.x, S.y);
    sc.querySelector('.fs-can').setAttribute('transform', `translate(${SCX} ${SCY})`);
    sc.querySelector('.fs-cscale').setAttribute('transform', `scale(${(1 - Math.abs(S.turnV) / 80 * .05).toFixed(3)} 1)`);
    sc.querySelector('.fs-crot').setAttribute('transform', `rotate(${S.th.toFixed(1)})`);
    sc.querySelector('.fs-crot').classList.toggle('pl', S.ctl.L); sc.querySelector('.fs-crot').classList.toggle('pr', S.ctl.R);
    drawShadow();
    for (const [k, on] of [['l', S.ctl.L], ['r', S.ctl.R], ['f', S.ctl.F && !(S.ctl.L && S.ctl.R)]]){ const p = $('#faldBody .fs-pad.' + k); if (p) p.classList.toggle('on', on); }
    const b = $('#faldBody .fs-both'); if (b) b.classList.toggle('on', S.ctl.L && S.ctl.R);
    setAlt(Math.round(ALT1 * S.h / H0 / 10) * 10, ALT1 / ALT0 * S.h / H0);
    /* en pil i kanten, når målet er uden for skærmen */
    const tx = SCX - S.x * S.ppm, ty = SCY - S.y * S.ppm, pin = sc.querySelector('.fs-pin'), V = visBox(sc), m = 70, off = tx < V.x0 + 20 || tx > V.x1 - 20 || ty < V.y0 + 20 || ty > V.y1 - 20;
    if (off){ const a = Math.atan2(ty - SCY, tx - SCX), ex = clamp(tx, V.x0 + m, V.x1 - m), ey = clamp(ty, V.y0 + m + 30, V.y1 - m - 60);
      pin.innerHTML = `<g transform="translate(${ex.toFixed(0)} ${ey.toFixed(0)}) rotate(${(a * 180 / Math.PI).toFixed(0)})"><circle r="34" fill="#2A2340" opacity=".7"/><path d="M -14 -14 L 16 0 L -14 14 Z" fill="#FFE27A"/></g>`; }
    else pin.innerHTML = '';
    const w = $('#faldBody .fs-warr'); if (w && S.wind.s) w.setAttribute('transform', `rotate(${(S.wind.a * 180 / Math.PI).toFixed(0)} 20 20)`);
    const sock = sc.querySelector('.fs-sockr'); if (sock) sock.setAttribute('transform', `rotate(${(S.wind.s ? S.wind.a * 180 / Math.PI : 100).toFixed(0)}) scale(${S.wind.s ? 1 : .55} 1)`);
  }

  /* ---------- landingen ---------- */
  function land(){
    S.run = 'landed'; S.t = 0;
    const d = Math.hypot(S.x, S.y), pond = ((S.x - POND.x) / POND.rx) ** 2 + ((S.y - POND.y) / POND.ry) ** 2 < 1;
    const zi = pond ? -1 : RINGS.findIndex(r => d <= r), landS = zi >= 0 ? RING_STARS[zi] : 0, bubS = Math.floor(S.bubbles / 4), softS = S.soft && !pond ? 1 : 0;
    const stars = Math.max(1, landS + bubS + softS);
    const msg = pond ? 'Plask! Lige i dammen.' : zi === 0 ? 'Lige i plet!' : zi === 1 ? 'Super tæt på!' : zi === 2 ? 'Flot landing!' : zi === 3 ? 'Inde på målet!' : 'Uden for målet';
    S.result = { d: +d.toFixed(1), zone: zi, pond, stars, landS, bubbles: S.bubbles, bubN: S.bubN, soft: !!softS, wind: +S.wind.s.toFixed(1), x: S.x, y: S.y, msg };
    prog.jumps = (prog.jumps || 0) + 1; saveProg(); addStars(stars);
    $('#faldBody .fs-pads').hidden = true; $('#faldBody .fs-wind').hidden = true;
    const sc = $('#fsScene');
    sc.querySelector('.fs-can').innerHTML = `<g class="fs-landed" transform="rotate(${S.th.toFixed(1)})">${landedTop(S.hero)}</g>`;
    sc.querySelector('.fs-shadow').innerHTML = ''; sc.querySelector('.fs-pin').innerHTML = '';
    if (pond){ for (let i = 0; i < 3; i++) spark(SCX + (i - 1) * 60, SCY, '#BFE8FF'); tone(200, 0.3, 'sine', 0.07, 0, .4); }
    else { tone(160, 0.12, 'sine', 0.07, 0, .7); if (zi === 0) sfx.magic(); }
    big(msg);
    S.l0 = { ppm: S.ppm, x: S.x, y: S.y };
    setTimeout(endCard, S.auto ? 60 : 2200);
  }
  function drawLanded(){
    const u = ease(clamp(S.t / 1.2, 0, 1)), L = S.l0, ppm = L.ppm + (Math.min(L.ppm, 15) - L.ppm) * u;
    const k = Math.hypot(L.x, L.y) < 30 ? .5 : 0, cx = L.x * (1 - u * k), cy = L.y * (1 - u * k);
    groundAt(ppm, cx, cy);
    $('#fsScene .fs-can').setAttribute('transform', `translate(${(SCX + (L.x - cx) * ppm).toFixed(1)} ${(SCY + (L.y - cy) * ppm).toFixed(1)}) scale(${Math.sqrt(ppm / L.ppm).toFixed(3)})`);
  }
  function endCard(){
    if (!S || !S.result || !$('#fsScene')) return;
    const r = S.result;
    sfx.fanfare();
    const K = 48 / 22, px = clamp(r.x * K, -56, 56), py = clamp(r.y * K, -56, 56);
    const tgt = `<svg viewBox="-60 -60 120 120" aria-hidden="true"><circle r="${23 * K}" fill="#FFF3E0"/>${[3, 2, 1, 0].map(i => `<circle r="${RINGS[i] * K}" fill="${['#F2C14E', '#E0457A', '#FFF3E0', '#E0457A'][i]}" stroke="#2A2340" stroke-width=".6"/>`).join('')}<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})"><path d="M 0 0 V -22" stroke="#2A2340" stroke-width="2.5"/><path d="M 0 -22 L 14 -17 L 0 -12 Z" fill="#7FD8FF" stroke="#2A2340" stroke-width="1.5"/><circle r="3.5" fill="#2A2340"/></g></svg>`;
    const card = el('div', { class:'reveal magic m-rum kf-end' }, [
      el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
      ...[0, 1, 2, 3].map(i => el('span', { class:'mc-corner c' + i, 'aria-hidden':'true', html: MC_CORNER })),
      el('div', { class:'kf-medal fs-target', html: tgt }),
      el('div', { class:'reveal-info' }, [
        el('p', { class:'reveal-cat' }, r.pond ? 'I dammen' : `${String(r.d).replace('.', ',')} m fra midten`),
        el('h3', { class:'reveal-name' }, r.msg),
        el('p', { class:'kf-how' }, `${r.bubbles} stjernebobler${r.soft ? ' · blød landing' : ''}`),
        el('div', { class:'lesson-stars', html: STAR_SVG.repeat(Math.min(12, r.stars)) }),
        el('p', { class:'kf-how' }, `Du fik ${r.stars} ${r.stars === 1 ? 'stjerne' : 'stjerner'}.`),
        el('div', { class:'reveal-btns row' }, [
          el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); stop(); goTo(showSchool); } } }, 'Tilbage til gangen'),
          el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); goTo(show); } } }, 'Spring igen') ]) ]) ]);
    const veil = el('div', { class:'shop-veil' }, [ card ]);
    $('#faldBody').append(veil); confetti(veil, r.zone === 0 ? 70 : r.zone >= 0 ? 30 : 10);
    r.done = true;
  }

  /* ---------- styring ---------- */
  function bindInput(scene){
    const zone = e => { const b = scene.getBoundingClientRect(), f = (e.clientX - b.left) / b.width; return f < .38 ? 'L' : f > .62 ? 'R' : 'F'; };
    const aim = e => { const svg = scene.querySelector('svg'); if (!svg) return; const p = svgPoint(svg, e); S.tx = p.x; S.ty = p.y; };
    scene.addEventListener('pointerdown', e => {
      if (!S || e.target.closest('button')) return;
      if (S.run === 'intro'){ skipIntro(); return; }
      try { scene.setPointerCapture(e.pointerId); } catch (er) {}
      if (S.run === 'free') aim(e);
      S.ptrs.set(e.pointerId, zone(e));
    });
    scene.addEventListener('pointermove', e => { if (!S) return; if (S.run === 'free' && (S.ptrs.has(e.pointerId) || e.pointerType === 'mouse')) aim(e); if (S.ptrs.has(e.pointerId)) S.ptrs.set(e.pointerId, zone(e)); });
    for (const ev of ['pointerup', 'pointercancel']) scene.addEventListener(ev, e => { if (S) S.ptrs.delete(e.pointerId); });
    if (!keyOn){ keyOn = true;
      document.addEventListener('keydown', e => { if (!S || $('#fald').hidden) return; if (e.key.startsWith('Arrow')){ e.preventDefault(); S.keys[e.key] = true; } if (e.key === ' ') skipIntro(); });
      document.addEventListener('keyup', e => { if (S) S.keys[e.key] = false; }); }
  }

  /* ---------- løkken ---------- */
  function loop(){ cancelAnimationFrame(raf); S.last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop(){ cancelAnimationFrame(raf); raf = 0; if (S) S.run = S.run === 'landed' ? 'landed' : 'stop'; }
  function frame(now){
    if (!S || S.run === 'stop' || $('#fald').hidden){ raf = 0; return; }
    const dt = Math.min(.05, (now - S.last) / 1000); S.last = now;
    const n = window.FALD_WARP || (S.auto ? 8 : 1);
    for (let i = 0; i < n; i++) step(dt);
    if (S.run === 'intro') drawIntro(S.t); else if (S.run === 'free') drawFree(); else if (S.run === 'open') drawOpen(); else if (S.run === 'canopy') drawCanopy(); else if (S.run === 'landed') drawLanded();
    if (S.run !== 'landed' || S.t < 1.3) raf = requestAnimationFrame(frame); else raf = 0;
  }
  function step(dt){
    if (S.run === 'intro'){ S.t += dt; if (S.t >= T_UP + T_HOVER + T_JUMP) freeStart(); }
    else if (S.run === 'free') stepFree(dt);
    else if (S.run === 'open') stepOpen(dt);
    else if (S.run === 'canopy') stepCanopy(dt);
    else if (S.run === 'landed') S.t += dt;
  }

  /* ---------- små effekter ---------- */
  function big(t){ const b = el('div', { class:'kf-big fs-big' }, t); $('#faldBody').append(b); b.classList.add('pop'); setTimeout(() => b.remove(), S && S.auto ? 50 : 1500); }
  function flash(){ const f = el('div', { class:'fs-flash', 'aria-hidden':'true' }); $('#faldBody').append(f); sfx.whoosh(); setTimeout(() => f.remove(), 900); }
  function puff(){ const f = el('div', { class:'fs-flash puff', 'aria-hidden':'true' }); $('#faldBody').append(f); tone(260, 0.2, 'sine', 0.03, 0, 1.4); setTimeout(() => f.remove(), 700); }
  function spark(x, y, col){ const fx = $('#fsScene .fs-fx'); if (!fx || calm) return; for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2, e = mk('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})` }, `<g class="kf-burst" style="--dx:${(Math.cos(a) * 80).toFixed(0)}px;--dy:${(Math.sin(a) * 80).toFixed(0)}px">${star4(0, 0, 12, col)}</g>`); fx.append(e); setTimeout(() => e.remove(), 1400); } }

  /* ---------- til Tegnebordet ---------- */
  function previewSvg(kind, vb){
    const hero = heroState();
    if (kind === 'rytter') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || '-280 -340 560 480'}">${Kost.riderSvg(hero, { gear: true })}</svg>`;
    if (kind === 'kort'){
      S = S || { hero }; const div = document.createElement('div'); div.innerHTML = scopeIds(introSvg(), 'fp');
      const q = c => div.querySelector(c), p = riderAt(T_UP * .3);
      q('.fs-irider').innerHTML = `<g transform="translate(${p.x.toFixed(0)} ${p.y.toFixed(0)}) rotate(-14) scale(.3)">${Kost.riderSvg(hero, { gear: true })}</g>`;
      q('.fs-icam').setAttribute('transform', `translate(800 500) scale(1.05) translate(-860 ${(-Math.min(500, p.y + 40)).toFixed(0)})`);
      return div.innerHTML;
    }
    const div = document.createElement('div'); div.innerHTML = scopeIds(sceneSvg(), 'fp');
    const q = c => div.querySelector(c);
    if (kind === 'frit'){
      q('.fs-ground').setAttribute('transform', 'translate(800 500) scale(.8) translate(-60 -90)');
      q('.fs-haze').setAttribute('opacity', '.7');
      q('.fs-hero').innerHTML = `<g transform="translate(760 520) rotate(-8) scale(.8)">${heroTop(hero)}</g>`;
      for (const [x, y, z, g] of [[1100, 300, .5, 0], [400, 700, .2, 1], [1240, 760, .8, 0]]) q('.fs-below').append(mk('g', { transform: `translate(${SCX + (x - SCX) / (1 + 5 * z)} ${SCY + (y - SCY) / (1 + 5 * z)}) scale(${1 / (1 + 5 * z)})` }, bubbleArt(g)));
      q('.fs-below').prepend(mk('g', { transform: 'translate(500 260) scale(.3)', opacity: '.9' }, cloudArt(1, 4)));
      q('.fs-above').append(mk('g', { transform: 'translate(1300 140) scale(1.6)', opacity: '.45' }, cloudArt(1, 9)));
    } else {
      const h = kind === 'lav' ? 12 : 90, ppm = ppmAt(h), x = kind === 'lav' ? 6 : 50, y = kind === 'lav' ? 8 : 40;
      q('.fs-ground').setAttribute('transform', `translate(800 500) scale(${ppm.toFixed(3)}) translate(${-x} ${-y})`);
      q('.fs-haze').setAttribute('opacity', '0');
      q('.fs-shadow').innerHTML = canopyTop(hero, true); q('.fs-shadow').setAttribute('transform', `translate(${800 + .35 * h * ppm} ${500 + .5 * h * ppm}) rotate(-30) scale(${ppm / 24})`);
      q('.fs-can').innerHTML = `<g transform="translate(800 500) rotate(-30)">${canopyTop(hero)}</g>`;
    }
    return div.innerHTML;
  }

  return { show, state: () => S, previewSvg, stop, test: { step, heroTop, canopyTop } };
})();
