/* ================= Kosteflyvning =================
   Hele faget ligger i sin egen lukkede kasse (Kost), så ingen navne herinde kan ramme andre filer.
   Tryk = flyv op, tyngdekraften trækker ned. Ringene giver fart; to ringe over hinanden giver et loop,
   og loopet giver et boost, der selv styrer gennem de næste fem ringe. To klassekammerater flyver
   samme bane i baggrunden, og pladsen giver guld, sølv eller bronze. */
const Kost = (() => {
  const PX = 430, TOP = 140, BOT = 860;
  const GRAV = 1900, FLAP = -620, VMAXF = 780, V0 = 490;
  const BOOST_N = 3, LOOP_R = 150, LOOP_T = .95, HOLD_MS = 260, BOOST_V = 2.3;
  /* klassekammeraterne har hver sin bane bagved, med de samme ringe i mindre størrelse og i deres egen farve */
  /* banerne står i lige store trin bagud: samme forskydning fra din bane til den midterste som fra den midterste til den bagerste */
  /* lige stor luft mellem ringenes kanter: forskydningen er luften plus de to ringes halve bredder */
  const STEP_K = .27, GAP = 46, HALF = 52, SLOPE = .78;
  const K = [1, 1 - STEP_K, 1 - 2 * STEP_K], DX1 = -(GAP + HALF * (K[0] + K[1])), DX2 = DX1 - (GAP + HALF * (K[1] + K[2]));
  const LANES = [{ n: 2, k: K[2], dx: DX2, dy: DX2 * SLOPE, op: .62 }, { n: 1, k: K[1], dx: DX1, dy: DX1 * SLOPE, op: .8 }];
  const laneY = (L, y) => 480 + (y - 480) * L.k + L.dy;
  const RIDER_H = 250;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, a = {}, html) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; };
  const TEACHER = { skin:'#C68653', eyes:{ color:'#5C3A24', pupil:'rund' }, mk:{ blush:'#E07A6A', lips:'#A0526B', lipShape:'grin', mark:'fregner', markColor:'#7A4A2A' },
    front:'pjusket', back:'kort', hair:{ a:'#B5432A', b:'#E2672E', ombre:false, tie:'#2E4A7A' },
    robe:{ id:'kort', a:'#2E4A7A', b:'#E9C46A' }, cape:{ id:'kort', a:'#8A2A2A', b:'#E9C46A' }, hat:{ id:'ingen', a:'#2E4A7A', b:'#E9C46A' },
    boots:{ id:'hoeje', a:'#5C3A24', b:'#E9C46A' }, acc:{ toerklaede:'#E8E4F4', baelte:'#5C3A24' }, pet:{ kind:'ingen', a:'#FFFFFF', b:'#FFFFFF', c:'#FFFFFF', pattern:'ingen', eyes:'#3D8BFF', acc:{}, name:'' } };
  /* flyverbriller i panden (figurens koordinater) */
  const GOGGLES = `<path d="M 300 330 Q 400 300 501 330" stroke="#3A2A20" stroke-width="10" fill="none"/>`
    + [[364, 322], [437, 322]].map(([x, y]) => `<rect x="${x-30}" y="${y-22}" width="60" height="44" rx="20" fill="#3A2A20" stroke="#8A6420" stroke-width="5"/><rect x="${x-21}" y="${y-14}" width="42" height="28" rx="13" fill="#7FD8FF" opacity=".85"/><path d="M ${x-12} ${y-6} q 6 -5 14 -5" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')
    + `<path d="M 394 320 H 407" stroke="#8A6420" stroke-width="7"/>`;
  const TEACH = 'Kaptajn Sky';
  let S = null, raf = 0, keyOn = false;

  /* ---------- tegninger ---------- */
  function broomSvg(){
    return `<path d="M -150 6 L -96 -6 L -96 18 Z" fill="#E9C46A"/>`
      + `<path d="M -98 -10 C -130 -18 -170 -16 -196 -4 C -170 2 -170 14 -196 22 C -170 30 -130 28 -98 20 Z" fill="#E9C46A" stroke="#8A6420" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M -110 -4 L -186 -6 M -110 6 L -190 8 M -110 14 L -184 18" stroke="#B98A2E" stroke-width="2.5" fill="none"/>`
      + `<rect x="-104" y="-6" width="14" height="22" rx="4" fill="#8A2A2A" stroke="#4A1414" stroke-width="2.5"/>`
      + `<rect x="-92" y="-5" width="320" height="11" rx="5.5" fill="#8A5A3C" stroke="#4A2E1E" stroke-width="2.5"/><path d="M -88 -3 H 222" stroke="#B5844A" stroke-width="3"/><circle cx="230" cy="0.5" r="8" fill="#6A4430" stroke="#4A2E1E" stroke-width="2.5"/>`;
  }
  /* ---------- figuren på kosten, set fra siden ----------
     Sådan ser det ud i virkeligheden: man sidder overskrævs med kosten mellem benene, lårene langs skaftet,
     underbenene hænger ned, overkroppen læner lidt frem, og begge hænder holder om skaftet foran sig.
     Børsten er bagerst. Fartvinden blæser hår, kappe og hattespids bagud. Hovedet er drejet lidt mod os.
     Tegnes ud fra figurens egne farver og valg (hår, hat, kjole, kappe, støvler), vendt mod højre. */
  const SH = c => fdk(c, .42);
  /* gear: faldskærmsudspring — hjelm i stedet for hat og en faldskærmspakke på ryggen (ingen kappe) */
  function riderArt(st, opts = {}){
    const gear = !!opts.gear;
    const sk = st.skin, skS = SH(sk), h = st.hair, hA = h.a, hB = h.ombre ? h.b : h.a, hS = SH(hA), r = st.robe, cp = st.cape, hat = st.hat, bt = st.boots;
    const shortRobe = r.id === 'kort';
    const id = 'r' + Math.random().toString(36).slice(2, 7);
    let o = `<defs><linearGradient id="${id}h" x1="1" y1="0" x2="0" y2="0"><stop offset=".3" stop-color="${hA}"/><stop offset="1" stop-color="${hB}"/></linearGradient></defs>`;
    /* kappen hænger fra skuldrene ned over ryggen og blafrer bagud; håret ligger udenpå kappen.
       Begge tegnes efter overkroppen, så kappen sidder fast ved halsen og ikke ser ud til at stikke ud af ryggen. */
    let capeS = '';
    if (cp.id !== 'ingen' && !gear){
      const long = cp.id !== 'kort';
      const hem = long ? 'Q -30 -30 -60 -42 Q -76 -32 -98 -46 Q -118 -40 -142 -54 Q -162 -50 -196 -74' : 'Q -24 -44 -50 -58 Q -66 -50 -84 -66 Q -100 -64 -128 -90';
      const top = long ? 'C -150 -104 -90 -126 -40 -128' : 'C -96 -114 -70 -128 -40 -128';
      capeS = `<g class="kfr-cape"><path d="M 6 -128 C 20 -124 34 -120 42 -112 C 28 -96 14 -66 6 -34 ${hem} ${top} C -20 -130 -4 -130 6 -128 Z" fill="${cp.a}" stroke="${SH(cp.a)}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M 6 -34 ${hem}" stroke="${cp.b}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>`
        + `<path d="M 20 -112 Q -20 -90 -${long ? 120 : 80} -${long ? 70 : 84} M 12 -76 Q -30 -60 -${long ? 90 : 60} -${long ? 52 : 66}" stroke="${SH(cp.a)}" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`
        + (cp.id === 'stjerner' ? starP(-60, -82, 9, cp.b, .9) + starP(-120, -70, 7, cp.b, .9) : '') + `</g>`;
    }
    /* langt hår blæser bagud i lokker, der vokser ud fra baghovedet (rødderne gemmer sig under håret på hovedet) */
    const back = st.back;
    let hairS = '';
    const lock = (d, hl) => `<path d="${d}" fill="url(#${id}h)" stroke="${hS}" stroke-width="3" stroke-linejoin="round"/><path d="${hl}" stroke="${lt(hA, .35)}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
    if (back === 'langt' || back === 'kroeller'){
      hairS = `<g class="kfr-hair">`
        + lock('M 6 -158 C -16 -140 -38 -116 -58 -98 C -70 -88 -84 -82 -98 -84 C -84 -70 -62 -72 -48 -82 C -28 -98 -10 -120 8 -134 Z', 'M -4 -140 C -20 -122 -36 -106 -56 -92')
        + lock('M 4 -200 C -26 -212 -66 -198 -98 -180 C -116 -170 -136 -168 -150 -172 C -134 -158 -112 -154 -92 -158 C -60 -164 -30 -168 -2 -166 Z', 'M -10 -196 C -40 -198 -70 -186 -100 -172')
        + lock('M 2 -186 C -30 -178 -66 -152 -96 -130 C -112 -118 -130 -112 -148 -114 C -130 -98 -106 -96 -86 -106 C -56 -120 -28 -140 -2 -148 Z', 'M -12 -174 C -40 -160 -70 -138 -100 -120')
        + (back === 'kroeller' ? [[-150, -172], [-148, -114], [-98, -84]].map(([x, y]) => `<path d="M ${x + 6} ${y} q -14 -2 -12 10 q 2 10 12 4" fill="none" stroke="${hS}" stroke-width="3" stroke-linecap="round"/>`).join('') : '')
        + `</g>`;
    }
    if (back === 'hestehale') hairS = `<g class="kfr-hair"><path d="M 0 -214 C -30 -226 -70 -214 -96 -190 C -120 -176 -140 -176 -156 -168 C -136 -160 -124 -150 -132 -136 C -108 -146 -88 -150 -70 -170 C -50 -184 -24 -190 -2 -194 Z" fill="url(#${id}h)" stroke="${hS}" stroke-width="3" stroke-linejoin="round"/><path d="M -20 -204 C -50 -200 -80 -186 -112 -164" stroke="${lt(hA, .35)}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="-4" cy="-206" r="8" fill="${h.tie}" stroke="${SH(h.tie)}" stroke-width="2"/></g>`;
    if (back === 'fletninger') hairS = `<g class="kfr-hair">${[[-150, 0], [-130, 22]].map(([ex, dy]) => { let d = ''; for (let i = 0; i < 6; i++){ const x = -6 + (ex + 6) * i / 6, y = -176 + dy + i * 6; d += `<ellipse cx="${x.toFixed(0)}" cy="${y}" rx="14" ry="9" fill="${i > 3 ? hB : hA}" stroke="${hS}" stroke-width="2.5"/>`; } return d + `<circle cx="${ex + 10}" cy="${-176 + dy + 34}" r="6" fill="${h.tie}"/>`; }).join('')}</g>`;
    /* det bageste ben: underbenet hænger ned fra knæet på den anden side af kosten */
    const leg = (kx, ky, ax, ay, col, boot, bs, band) => `<path d="M ${kx} ${ky} L ${ax} ${ay}" stroke="${col}" stroke-width="16" stroke-linecap="round"/>${shortRobe ? `<path d="M ${(kx + ax) / 2 - 8} ${(ky + ay) / 2} H ${(kx + ax) / 2 + 8} M ${(kx + ax) / 2 - 8} ${(ky + ay) / 2 + 10} H ${(kx + ax) / 2 + 8}" stroke="${r.b}" stroke-width="5"/>` : ''}`
      + `<path d="M ${ax - 16} ${ay - 6} Q ${ax - 20} ${ay + 18} ${ax - 2} ${ay + 20} H ${ax + 30} Q ${ax + 42} ${ay + 18} ${ax + 34} ${ay + 6} L ${ax + 12} ${ay - 8} Z" fill="${boot}" stroke="${bs}" stroke-width="3" stroke-linejoin="round"/>${band ? `<path d="M ${ax - 14} ${ay - 6} H ${ax + 12}" stroke="${bt.b}" stroke-width="5" stroke-linecap="round"/>` : ''}`;
    o += `<g class="kfr-leg2">${leg(64, 20, 52, 74, shortRobe ? fdk(sk, .1) : SH(r.a), fdk(bt.a, .3), SH(bt.a), false)}</g>`;
    if (!opts.noBroom) o += broomSvg();
    /* det forreste ben: låret ligger langs skaftet under skørtet, underbenet hænger ned */
    o += `<g class="kfr-leg">${leg(86, 20, 76, 78, shortRobe ? sk : lt(r.a, .1), bt.a, SH(bt.a), true)}</g>`;
    /* skørtet: sædet bag kosten, skødet og knæet foran, falder ned over skaftet */
    const hemD = `M -56 22 Q -40 32 -22 26 Q -2 36 18 28 Q 38 38 58 30 Q 76 36 96 22`;
    o += `<path d="M -22 -36 C -40 -20 -54 0 -56 22 Q -40 32 -22 26 Q -2 36 18 28 Q 38 38 58 30 Q 76 36 96 22 C 104 10 100 -4 86 -10 C 70 -16 56 -22 44 -32 Z" fill="${r.a}" stroke="${SH(r.a)}" stroke-width="3" stroke-linejoin="round"/>`;
    o += `<path d="M -8 -22 Q -24 0 -34 24 M 30 -18 Q 40 4 40 30 M 60 -14 Q 80 -2 86 16" stroke="${SH(r.a)}" stroke-width="3" fill="none" opacity=".35"/>`;
    o += `<path d="${hemD}" stroke="${r.b}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    if (r.id === 'stjerner') o += starP(-24, 4, 7, r.b, .9) + starP(56, 6, 6, r.b, .9);
    if (r.id === 'maane') o += moon(-20, 4, 7, r.b, .9) + moon(58, 6, 6, r.b, .9);
    /* bagerste arm og hånd */
    o += `<path d="M 40 -106 C 80 -86 120 -50 150 -14 L 160 -2 L 146 6 L 134 -6 C 108 -40 74 -70 34 -86 Z" fill="${fdk(r.a, .2)}" stroke="${SH(r.a)}" stroke-width="2.5" stroke-linejoin="round"/>`;
    o += `<path d="M 150 -12 C 160 -16 172 -12 172 0 C 172 10 162 14 152 10 C 146 6 146 -6 150 -12 Z" fill="${fdk(sk, .12)}" stroke="${skS}" stroke-width="2.5"/>`;
    /* overkroppen læner frem */
    o += `<path d="M -22 -28 C -26 -66 -14 -102 4 -120 L 46 -114 C 54 -90 52 -54 42 -26 Z" fill="${r.a}" stroke="${SH(r.a)}" stroke-width="3" stroke-linejoin="round"/>`;
    o += `<path d="M -22 -40 Q 10 -30 42 -38" stroke="${st.acc && st.acc.baelte ? st.acc.baelte : r.b}" stroke-width="${st.acc && st.acc.baelte ? 9 : 5}" fill="none"/>`;
    if (r.id === 'knapper') o += [-96, -78, -60].map(y => `<circle cx="${42 + (y + 96) * -.08}" cy="${y}" r="3.5" fill="${r.b}"/>`).join('');
    o += capeS;
    /* faldskærmspakken sidder på ryggen med seler over skulderen */
    if (gear) o += `<path d="M 6 -130 L -26 -126 Q -42 -124 -44 -108 L -52 -56 Q -54 -40 -38 -38 L -14 -34 Q -4 -34 -4 -44 L 6 -118 Z" fill="#3A3550" stroke="#1E1A30" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M -26 -126 Q -42 -124 -44 -108 L -46 -96 L 4 -100 L 6 -118 L 6 -130 Z" fill="#E0457A" stroke="#1E1A30" stroke-width="2.5" stroke-linejoin="round"/><path d="M -40 -70 L -2 -66" stroke="#1E1A30" stroke-width="2" opacity=".5"/>`
      + `<circle cx="-30" cy="-40" r="7" fill="#F2C14E" stroke="#8A6420" stroke-width="2"/>`
      + `<path d="M 4 -122 C 22 -112 34 -94 38 -72 M -6 -40 C 10 -30 26 -24 44 -24" stroke="#2A2238" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="30" y="-80" width="12" height="9" rx="2" fill="#B8B4C8" stroke="#2A2238" stroke-width="2"/>`;
    /* halsen og kraven */
    o += `<path d="M 16 -136 L 18 -112 L 36 -112 L 36 -138 Z" fill="${sk}" stroke="${skS}" stroke-width="2.5"/>`;
    o += `<path d="M 0 -120 Q 26 -102 50 -116 L 46 -124 Q 26 -112 6 -128 Z" fill="${cp.id !== 'ingen' ? cp.a : lt(r.a, .5)}" stroke="${SH(cp.id !== 'ingen' ? cp.a : r.a)}" stroke-width="2.5"/>`;
    if (st.acc && st.acc.toerklaede) o += `<path d="M 8 -126 Q 28 -110 48 -124 L 50 -112 Q 28 -98 6 -114 Z" fill="${st.acc.toerklaede}" stroke="${SH(st.acc.toerklaede)}" stroke-width="2.5"/><path class="kfr-scarf" d="M 10 -118 C -20 -116 -50 -124 -76 -112 L -70 -100 C -46 -110 -20 -104 12 -108 Z" fill="${st.acc.toerklaede}" stroke="${SH(st.acc.toerklaede)}" stroke-width="2.5"/>`;
    /* forreste arm: ærmet går frem til hånden på skaftet */
    o += `<path d="M 22 -112 C 52 -100 84 -66 108 -28 L 120 -10 Q 106 0 92 -6 C 72 -36 46 -64 8 -84 Z" fill="${r.a}" stroke="${SH(r.a)}" stroke-width="3" stroke-linejoin="round"/>`;
    o += `<path d="M 104 -32 L 122 -12 Q 108 0 92 -8 Z" fill="${r.b}" stroke="${SH(r.a)}" stroke-width="2.5" stroke-linejoin="round"/>`;
    o += `<path d="M 112 -14 C 122 -20 136 -16 138 -4 C 140 8 128 12 118 10 C 108 8 104 -6 112 -14 Z" fill="${sk}" stroke="${skS}" stroke-width="2.5"/><path d="M 120 -6 Q 126 0 122 8 M 128 -8 Q 134 -2 130 8" stroke="${skS}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    o += hairS;
    /* hovedet: lidt drejet mod os */
    const cx = 38, cy = -176;
    const hairBack = back === 'kort' || back === 'fletninger' || back === 'knolde' ? `M ${cx + 34} ${cy - 30} C ${cx + 20} ${cy - 56} ${cx - 30} ${cy - 60} ${cx - 46} ${cy - 22} C ${cx - 56} ${cy + 4} ${cx - 50} ${cy + 34} ${cx - 34} ${cy + 46} C ${cx - 20} ${cy + 40} ${cx - 10} ${cy + 20} ${cx - 6} ${cy} Z`
      : `M ${cx + 34} ${cy - 30} C ${cx + 20} ${cy - 58} ${cx - 34} ${cy - 62} ${cx - 50} ${cy - 22} C ${cx - 62} ${cy + 12} ${cx - 54} ${cy + 50} ${cx - 40} ${cy + 66} C ${cx - 24} ${cy + 50} ${cx - 12} ${cy + 24} ${cx - 6} ${cy} Z`;
    o += `<path d="${hairBack}" fill="url(#${id}h)" stroke="${hS}" stroke-width="3" stroke-linejoin="round"/>`;
    if (back === 'knolde' && !gear) o += `<circle cx="${cx - 34}" cy="${cy - 46}" r="20" fill="${hA}" stroke="${hS}" stroke-width="3"/><circle cx="${cx - 30}" cy="${cy - 52}" r="6" fill="${lt(hA, .3)}"/>`;
    o += `<path d="M ${cx - 30} ${cy - 10} C ${cx - 32} ${cy - 44} ${cx - 4} ${cy - 50} ${cx + 18} ${cy - 46} C ${cx + 42} ${cy - 42} ${cx + 52} ${cy - 18} ${cx + 50} ${cy + 4} C ${cx + 50} ${cy + 22} ${cx + 44} ${cy + 36} ${cx + 30} ${cy + 42} C ${cx + 14} ${cy + 48} ${cx - 8} ${cy + 44} ${cx - 20} ${cy + 32} C ${cx - 30} ${cy + 20} ${cx - 30} ${cy + 6} ${cx - 30} ${cy - 10} Z" fill="${sk}" stroke="${skS}" stroke-width="3"/>`;
    o += `<ellipse cx="${cx - 22}" cy="${cy + 2}" rx="7" ry="10" fill="${sk}" stroke="${skS}" stroke-width="2.5"/>`;
    if (st.mk.blush) o += `<ellipse cx="${cx + 2}" cy="${cy + 18}" rx="11" ry="6" fill="${st.mk.blush}" opacity=".45"/><ellipse cx="${cx + 42}" cy="${cy + 18}" rx="7" ry="5" fill="${st.mk.blush}" opacity=".4"/>`;
    if (st.mk.mark === 'fregner') o += [[-2, 10], [6, 14], [-6, 16], [36, 12], [42, 15]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="1.6" fill="${st.mk.markColor || '#B07A45'}"/>`).join('');
    const eye = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k} 1)"><ellipse rx="9" ry="12" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/><ellipse cx="1.5" cy="1" rx="7" ry="9.5" fill="${st.eyes.color}"/><ellipse cx="2" cy="2" rx="3.6" ry="5" fill="${INK}"/><circle cx="-1.5" cy="-3.5" r="2.8" fill="#FFFFFF"/><circle cx="4" cy="5" r="1.3" fill="#FFFFFF"/><path d="M -10 -7 Q 0 -15 10 -9" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M -9 -8 l -5 -1" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/></g>`;
    o += eye(cx + 14, cy - 2, 1) + eye(cx + 40, cy - 3, .72);
    o += `<path d="M ${cx + 50} ${cy + 4} Q ${cx + 56} ${cy + 10} ${cx + 50} ${cy + 14}" stroke="${skS}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    o += `<path d="M ${cx + 22} ${cy + 26} Q ${cx + 32} ${cy + 34} ${cx + 42} ${cy + 25}" stroke="${st.mk.lips || '#C2465E'}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    /* pandehår */
    const fr = st.front;
    const fringe = fr === 'lige' ? `M ${cx - 30} ${cy - 8} C ${cx - 34} ${cy - 50} ${cx + 10} ${cy - 62} ${cx + 40} ${cy - 44} C ${cx + 52} ${cy - 36} ${cx + 56} ${cy - 24} ${cx + 54} ${cy - 18} L ${cx + 36} ${cy - 22} L ${cx + 22} ${cy - 18} L ${cx + 8} ${cy - 22} L ${cx - 6} ${cy - 18} L ${cx - 18} ${cy - 16} Z`
      : fr === 'pjusket' ? `M ${cx - 30} ${cy - 8} C ${cx - 34} ${cy - 50} ${cx + 10} ${cy - 62} ${cx + 40} ${cy - 44} C ${cx + 54} ${cy - 34} ${cx + 58} ${cy - 22} ${cx + 56} ${cy - 12} L ${cx + 42} ${cy - 24} L ${cx + 34} ${cy - 10} L ${cx + 22} ${cy - 26} L ${cx + 8} ${cy - 14} L ${cx - 2} ${cy - 30} L ${cx - 16} ${cy - 14} Z`
      : fr === 'tilbage' ? `M ${cx - 30} ${cy - 8} C ${cx - 34} ${cy - 50} ${cx + 10} ${cy - 64} ${cx + 40} ${cy - 46} C ${cx + 48} ${cy - 40} ${cx + 50} ${cy - 34} ${cx + 48} ${cy - 30} C ${cx + 20} ${cy - 42} ${cx - 6} ${cy - 36} ${cx - 18} ${cy - 14} Z`
      : fr === 'midt' ? `M ${cx - 30} ${cy - 8} C ${cx - 34} ${cy - 50} ${cx + 10} ${cy - 62} ${cx + 40} ${cy - 44} C ${cx + 52} ${cy - 34} ${cx + 56} ${cy - 18} ${cx + 52} ${cy - 4} C ${cx + 44} ${cy - 26} ${cx + 30} ${cy - 36} ${cx + 18} ${cy - 40} C ${cx + 6} ${cy - 32} ${cx - 8} ${cy - 26} ${cx - 18} ${cy - 10} Z`
      : `M ${cx - 30} ${cy - 8} C ${cx - 34} ${cy - 50} ${cx + 10} ${cy - 62} ${cx + 40} ${cy - 44} C ${cx + 54} ${cy - 34} ${cx + 58} ${cy - 20} ${cx + 54} ${cy - 6} C ${cx + 40} ${cy - 30} ${cx + 18} ${cy - 30} ${cx - 4} ${cy - 22} C ${cx - 10} ${cy - 18} ${cx - 16} ${cy - 14} ${cx - 18} ${cy - 10} Z`;
    o += `<path d="${fringe}" fill="${hA}" stroke="${hS}" stroke-width="3" stroke-linejoin="round"/><path d="M ${cx - 6} ${cy - 46} Q ${cx + 14} ${cy - 54} ${cx + 30} ${cy - 46}" stroke="${lt(hA, .45)}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
    /* hatten: spidsen blæser bagud */
    const ha = hat.a, hb = hat.b, hs = SH(ha), hx = cx + 6, hy = cy - 44 + (hat.id === 'kort' ? 18 : hat.id === 'hue' ? 12 : 0);
    if (gear){
      /* hjelmen: en rund skal over issen og baghovedet i hattens farve, med en stribe, hageremme og briller skubbet op */
      o += `<path d="M ${cx - 40} ${cy + 14} C ${cx - 50} ${cy - 34} ${cx - 16} ${cy - 66} ${cx + 18} ${cy - 62} C ${cx + 46} ${cy - 58} ${cx + 60} ${cy - 36} ${cx + 58} ${cy - 16} Q ${cx + 30} ${cy - 30} ${cx + 4} ${cy - 22} Q ${cx - 18} ${cy - 14} ${cx - 22} ${cy + 18} Z" fill="${ha}" stroke="${hs}" stroke-width="3" stroke-linejoin="round"/>`
        + `<path d="M ${cx - 30} ${cy - 30} C ${cx - 14} ${cy - 56} ${cx + 20} ${cy - 60} ${cx + 44} ${cy - 44}" stroke="${hb}" stroke-width="8" fill="none" stroke-linecap="round"/>`
        + `<path d="M ${cx - 16} ${cy - 50} Q ${cx} ${cy - 60} ${cx + 16} ${cy - 58}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>`
        + `<path d="M ${cx - 20} ${cy + 14} Q ${cx - 4} ${cy + 44} ${cx + 26} ${cy + 44}" stroke="#2A2238" stroke-width="3.5" fill="none"/>`
        + `<g transform="rotate(-14 ${cx + 30} ${cy - 40})"><rect x="${cx + 12}" y="${cy - 50}" width="40" height="20" rx="9" fill="#2A2238"/><rect x="${cx + 16}" y="${cy - 46}" width="32" height="12" rx="6" fill="#7FD8FF" opacity=".9"/><path d="M ${cx + 22} ${cy - 42} h 8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/></g>`;
    } else if (hat.id === 'spids' || hat.id === 'knaek'){
      const tip = hat.id === 'knaek' ? `C ${hx - 14} ${hy - 50} ${hx - 34} ${hy - 76} ${hx - 60} ${hy - 80} L ${hx - 92} ${hy - 62} L ${hx - 58} ${hy - 96} C ${hx - 30} ${hy - 90} ${hx - 2} ${hy - 62} ${hx + 26} ${hy - 8}` : `C ${hx - 18} ${hy - 50} ${hx - 50} ${hy - 90} ${hx - 104} ${hy - 96} C ${hx - 52} ${hy - 76} ${hx - 4} ${hy - 50} ${hx + 26} ${hy - 8}`;
      o += `<g class="kfr-hat"><path d="M ${hx - 30} ${hy - 4} ${tip} Z" fill="${ha}" stroke="${hs}" stroke-width="3" stroke-linejoin="round"/><path d="M ${hx - 28} ${hy - 10} Q ${hx} ${hy - 22} ${hx + 26} ${hy - 12} L ${hx + 24} ${hy - 2} Q ${hx} ${hy - 12} ${hx - 28} ${hy} Z" fill="${hb}" stroke="${hs}" stroke-width="2"/></g>`;
      o += `<ellipse cx="${hx}" cy="${hy + 2}" rx="68" ry="15" transform="rotate(-8 ${hx} ${hy + 2})" fill="${ha}" stroke="${hs}" stroke-width="3"/><path d="M ${hx - 56} ${hy + 4} Q ${hx} ${hy + 14} ${hx + 60} ${hy - 6}" stroke="${lt(ha, .3)}" stroke-width="3" fill="none" opacity=".6"/>`;
    } else if (hat.id === 'kort'){
      o += `<path d="M ${hx - 34} ${hy + 2} C ${hx - 36} ${hy - 40} ${hx - 10} ${hy - 50} ${hx + 10} ${hy - 48} C ${hx + 30} ${hy - 46} ${hx + 36} ${hy - 30} ${hx + 32} ${hy} Z" fill="${ha}" stroke="${hs}" stroke-width="3"/><path d="M ${hx - 34} ${hy - 8} Q ${hx} ${hy - 16} ${hx + 32} ${hy - 10} L ${hx + 32} ${hy} Q ${hx} ${hy - 6} ${hx - 34} ${hy + 2} Z" fill="${hb}"/>`
        + `<ellipse cx="${hx}" cy="${hy + 4}" rx="82" ry="16" transform="rotate(-8 ${hx} ${hy + 4})" fill="${ha}" stroke="${hs}" stroke-width="3"/>`;
    } else if (hat.id === 'hue'){
      o += `<g class="kfr-hat"><path d="M ${hx - 34} ${hy + 6} C ${hx - 40} ${hy - 40} ${hx - 10} ${hy - 50} ${hx + 20} ${hy - 40} C ${hx - 20} ${hy - 50} ${hx - 70} ${hy - 30} ${hx - 96} ${hy + 6} C ${hx - 60} ${hy - 10} ${hx - 40} ${hy} ${hx - 34} ${hy + 6} Z M ${hx - 34} ${hy + 6} C ${hx - 10} ${hy - 10} ${hx + 30} ${hy - 6} ${hx + 44} ${hy} C ${hx + 40} ${hy - 30} ${hx + 30} ${hy - 40} ${hx + 20} ${hy - 40}" fill="${ha}" stroke="${hs}" stroke-width="3" stroke-linejoin="round"/><circle cx="${hx - 98}" cy="${hy + 10}" r="11" fill="${hb}" stroke="${SH(hb)}" stroke-width="2.5"/></g><path d="M ${hx - 36} ${hy + 4} Q ${hx} ${hy - 12} ${hx + 46} ${hy} L ${hx + 46} ${hy + 10} Q ${hx} ${hy - 2} ${hx - 36} ${hy + 14} Z" fill="${hb}" stroke="${SH(hb)}" stroke-width="2.5"/>`;
    }
    return o;
  }
  /* en rytter: figuren sidder overskrævs på kosten (dyret er ikke med — det sad for langt ude på børsten) */
  function rider(st, opts = {}){
    const g = mk('g', { class:'kf-rider' + (opts.cls ? ' ' + opts.cls : '') });
    const tilt = mk('g', { class:'kf-tilt' });
    let inner = `<g transform="translate(0 22) scale(.38)">${riderArt(st, opts)}</g>`;
    if (opts.trail) inner = `<g class="kf-trail">${[0, 1, 2, 3].map(i => star4(-150 - i * 30, 30 + (i % 2) * 10, 10 - i * 1.5, '#FFF6D0', .9 - i * .2)).join('')}</g>` + inner;
    tilt.innerHTML = inner; g.append(tilt);
    return g;
  }
  function ringEls(r, k = 1, Y = y => y, tint){
    const col = tint ? (r.dbl ? lt(tint, .35) : tint) : r.dbl ? '#C79BFF' : '#F2C14E', dk = tint ? fdk(tint, .35) : r.dbl ? '#6B3FA0' : '#A87A1A', rx = 40 * k, ry = 118 * k, y = Y(r.y);
    const arc = (side) => `M ${r.x} ${y - ry} A ${rx} ${ry} 0 0 ${side} ${r.x} ${y + ry}`;
    const back = mk('g', { class:'kf-ring' }, `<ellipse cx="${r.x}" cy="${y}" rx="${rx + 30 * k}" ry="${ry + 30 * k}" fill="${col}" opacity=".12"/><path d="${arc(0)}" fill="none" stroke="${dk}" stroke-width="${20 * k}" stroke-linecap="round"/><path d="${arc(0)}" fill="none" stroke="${col}" stroke-width="${12 * k}" stroke-linecap="round"/>`);
    const front = mk('g', { class:'kf-ring' }, `<path d="${arc(1)}" fill="none" stroke="${dk}" stroke-width="${20 * k}" stroke-linecap="round"/><path d="${arc(1)}" fill="none" stroke="${col}" stroke-width="${12 * k}" stroke-linecap="round"/><path d="M ${r.x + 18 * k} ${y - 80 * k} Q ${r.x + 34 * k} ${y - 20 * k} ${r.x + 26 * k} ${y + 40 * k}" fill="none" stroke="#FFFFFF" stroke-width="${4 * k}" stroke-linecap="round" opacity=".7"/>`
      + (r.dbl === 'hi' && k === 1 ? `<g transform="translate(${r.x} ${y + 150})"><rect x="-52" y="-20" width="104" height="40" rx="20" fill="#6B3FA0" stroke="#FFFFFF" stroke-width="3"/><text x="0" y="9" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="24" fill="#FFFFFF">LOOP</text></g>` : ''));
    return [back, front];
  }
  function bubbleEl(b){
    return mk('g', { class:'kf-bub' }, `<g transform="translate(${b.x} ${b.y})"><g class="kf-bob"><circle r="44" fill="#FFFFFF" fill-opacity=".1" stroke="#BFE8FF" stroke-width="4"/><circle r="44" fill="none" stroke="#FF8FC7" stroke-width="2" opacity=".7" stroke-dasharray="30 40"/>${starP(0, 3, 24, '#FFE27A')}<path d="M -26 -14 A 30 30 0 0 1 -6 -32" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></g></g>`);
  }
  /* målstregen svæver: et ternet bånd, der hænger i en klase balloner og vipper blidt op og ned */
  function floatGate(x, top, bot, k, label){
    const w = 26 * k, n = Math.max(6, Math.round((bot - top) / (26 * k)));
    let o = '';
    /* balloner med snore */
    const B = [[-34, -96, '#E0457A'], [0, -122, '#F2C14E'], [34, -96, '#7FD8FF'], [-14, -70, '#C79BFF'], [18, -66, '#5FE0A0']];
    o += B.map(([bx, by]) => `<path d="M ${x} ${top} Q ${x + bx * k * .4} ${top + by * k * .5} ${x + bx * k} ${top + (by + 26) * k}" stroke="#E8E4F4" stroke-width="${1.6 * k + .6}" fill="none" opacity=".8"/>`).join('');
    o += B.map(([bx, by, c]) => `<ellipse cx="${x + bx * k}" cy="${top + by * k}" rx="${22 * k}" ry="${27 * k}" fill="${c}" stroke="${fdk(c, .35)}" stroke-width="${2.5 * k}"/><path d="M ${x + (bx - 6) * k} ${top + (by + 26) * k} l ${6 * k} ${-5 * k} l ${6 * k} ${5 * k} Z" fill="${fdk(c, .2)}"/><ellipse cx="${x + (bx - 8) * k}" cy="${top + (by - 10) * k}" rx="${5 * k}" ry="${8 * k}" fill="#FFFFFF" opacity=".55"/>`).join('');
    /* det ternede bånd */
    o += `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${bot - top}" fill="#FFFFFF" stroke="#2A2340" stroke-width="${3 * k}"/>`;
    const h = (bot - top) / n;
    for (let i = 0; i < n; i++) o += `<rect x="${x - w / 2 + (i % 2 ? w / 2 : 0)}" y="${top + i * h}" width="${w / 2}" height="${h}" fill="#2A2340"/>`;
    if (label) o += `<g transform="translate(${x} ${bot + 26 * k}) scale(${k})"><rect x="-62" y="-22" width="124" height="44" rx="12" fill="#E0457A" stroke="#FFFFFF" stroke-width="4"/><text x="0" y="10" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF">MÅL</text></g>`;
    return `<g class="kf-bobfin">${o}</g>`;
  }
  const laneGate = (x, L) => floatGate(x, laneY(L, 150), laneY(L, 790), L.k, false);
  const gate = x => floatGate(x, 150, 820, 1, true);
  /* baggrunden i lag, der glider forskelligt hurtigt; hvert lag har flere forskellige stykker efter hinanden */
  const TW = 3200;
  const rng = seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  /* alle stykker begynder og slutter i samme højde, så der ikke er kanter mellem dem */
  const mtn = (pts, fill) => `<path d="M 0 700 ${pts.filter(([x]) => x > 0 && x < TW).map(([x, y]) => `L ${x} ${y}`).join(' ')} L ${TW} 700 V 1400 H 0 Z" fill="${fill}"/>`;
  const win = (x, y, w = 10, h = 14) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#FFD86B" opacity=".85"/>`;
  function castle(sx, sy, c){
    return `<rect x="${sx-70}" y="${sy-60}" width="140" height="70" fill="${c}"/><rect x="${sx-90}" y="${sy-120}" width="34" height="130" fill="${c}"/><rect x="${sx+56}" y="${sy-110}" width="34" height="120" fill="${c}"/><rect x="${sx-18}" y="${sy-150}" width="36" height="160" fill="${c}"/>`
      + `<path d="M ${sx-96} ${sy-118} L ${sx-73} ${sy-170} L ${sx-50} ${sy-118} Z M ${sx+50} ${sy-108} L ${sx+73} ${sy-158} L ${sx+96} ${sy-108} Z M ${sx-24} ${sy-148} L ${sx} ${sy-214} L ${sx+24} ${sy-148} Z" fill="${c}"/>`
      + [[sx-78, sy-90], [sx+68, sy-80], [sx-6, sy-120], [sx-40, sy-36], [sx+20, sy-36]].map(([x, y]) => win(x, y)).join('');
  }
  const FAR = [
    () => mtn([[160,520],[300,640],[470,470],[640,620],[820,500],[1000,650],[1180,480],[1380,640],[1600,520],[1800,660],[2000,540],[2200,680],[2400,500],[2600,640],[2800,520],[3000,650],[3200,700]], '#2A2058') + castle(1180, 480, '#1E1844'),
    /* høje fjelde med sne på toppene */
    () => { const P = [[200,600],[420,360],[640,560],[900,300],[1160,580],[1400,420],[1640,640],[1900,330],[2160,560],[2420,400],[2700,620],[2950,380],[3200,700]];
      return mtn(P, '#2A2058') + P.filter(([, y]) => y < 450).map(([x, y]) => `<path d="M ${x - 50} ${y + 60} L ${x} ${y} L ${x + 50} ${y + 60} L ${x + 26} ${y + 48} L ${x + 8} ${y + 64} L ${x - 14} ${y + 46} Z" fill="#B8AEE0" opacity=".55"/>`).join(''); },
    /* havet med et fyrtårn på en klippe */
    () => mtn([[300,640],[700,620],[1100,660],[1500,640],[1700,560],[1820,520],[1940,600],[2300,640],[2800,620],[3200,650]], '#2A2058')
      + `<rect x="250" y="644" width="${TW - 500}" height="70" rx="35" fill="#3A3A8A" opacity=".5"/>` + [300, 900, 1500, 2400, 2900].map(x => `<path d="M ${x} 660 q 20 -6 40 0" stroke="#8A8AD8" stroke-width="3" fill="none" opacity=".5"/>`).join('')
      + `<path d="M 1800 520 L 1806 380 H 1834 L 1840 520 Z" fill="#1E1844"/><rect x="1802" y="360" width="36" height="22" fill="#FFE27A"/><path d="M 1798 360 L 1820 336 L 1842 360 Z" fill="#1E1844"/><path class="kf-beam" d="M 1820 371 L 2300 330 L 2300 412 Z" fill="#FFE27A" opacity=".12"/>`,
  ];
  const MID = [
    () => { let o = `<path d="M 0 815 C 200 740 380 760 560 800 C 760 840 940 730 1140 760 C 1340 790 1480 760 1600 790 C 1800 830 2000 740 2200 770 C 2400 800 2600 730 2800 780 C 3000 820 3100 810 3200 815 V 1400 H 0 Z" fill="#3A2E6A"/>`;
      for (let i = 0; i < 26; i++){ const x = 40 + i * 123 + (i % 3) * 20, y = 800 + Math.sin(i * 1.7) * 28, k = .7 + (i % 4) * .12; o += `<path d="M ${x} ${y - 90*k} L ${x + 30*k} ${y} L ${x - 30*k} ${y} Z" fill="#2A2050"/>`; }
      for (const x of [380, 1260, 2140, 2900]) o += `<rect x="${x}" y="764" width="70" height="50" fill="#2A2050"/><path d="M ${x - 8} 766 L ${x + 35} 730 L ${x + 78} 766 Z" fill="#2A2050"/>` + win(x + 14, 778, 12) + win(x + 44, 778, 12);
      return o; },
    /* en tæt skov og en vindmølle */
    () => { const R = rng(11); let o = `<path d="M 0 815 C 400 770 800 790 1200 780 C 1600 770 2000 800 2400 780 C 2800 770 3000 800 3200 815 V 1400 H 0 Z" fill="#3A2E6A"/>`;
      for (let x = 0; x < TW; x += 46){ const h = 70 + R() * 70; o += `<path d="M ${x} ${790 - h} L ${x + 26} ${800} L ${x - 26} ${800} Z" fill="${R() < .5 ? '#2A2050' : '#30245A'}"/>`; }
      o += `<path d="M 1580 800 L 1596 660 H 1624 L 1640 800 Z" fill="#2A2050"/>` + win(1604, 700, 12) + `<g transform="translate(1610 664)"><g class="kf-mill">${[0, 90, 180, 270].map(a => `<path d="M 0 0 L -10 -110 L 10 -110 Z" transform="rotate(${a})" fill="#30245A"/>`).join('')}</g><circle r="8" fill="#2A2050"/></g>`;
      return o; },
    /* en sø med en bro og månens spejlbillede */
    () => { let o = `<path d="M 0 815 C 300 780 500 790 700 800 L 700 830 H 2300 L 2300 800 C 2600 780 2900 800 3200 815 V 1400 H 0 Z" fill="#3A2E6A"/>`;
      o += `<rect x="700" y="790" width="1600" height="60" fill="#4A4AA8" opacity=".55"/>` + [900, 1300, 1700, 2100].map(x => `<path d="M ${x} 812 q 30 -8 60 0" stroke="#A8A8F0" stroke-width="3" fill="none" opacity=".5"/>`).join('');
      o += `<path d="M 1300 790 Q 1500 700 1700 790" fill="none" stroke="#2A2050" stroke-width="14"/>` + [1340, 1400, 1460, 1540, 1600, 1660].map(x => `<path d="M ${x} ${790 - Math.sin((x - 1300) / 400 * Math.PI) * 88} V 790" stroke="#2A2050" stroke-width="5"/>`).join('');
      for (const x of [200, 420, 2450, 2700, 2980]) o += `<path d="M ${x} 720 L ${x + 34} 800 L ${x - 34} 800 Z" fill="#2A2050"/>`;
      return o; },
    /* en landsby med kirketårn og mange tændte vinduer */
    () => { const R = rng(23); let o = `<path d="M 0 815 C 400 790 800 800 1200 790 C 1600 780 2000 800 2400 790 C 2800 780 3000 805 3200 815 V 1400 H 0 Z" fill="#3A2E6A"/>`;
      for (let x = 60; x < TW; x += 120 + R() * 80){ const w = 60 + R() * 40, h = 40 + R() * 30, y = 800 - h;
        o += `<rect x="${x}" y="${y}" width="${w}" height="${h + 10}" fill="#2A2050"/><path d="M ${x - 8} ${y + 2} L ${x + w / 2} ${y - 30} L ${x + w + 8} ${y + 2} Z" fill="#2A2050"/>` + (R() < .8 ? win(x + 10, y + 12, 10, 13) : '') + (R() < .6 ? win(x + w - 22, y + 12, 10, 13) : ''); }
      o += `<rect x="1500" y="640" width="50" height="170" fill="#2A2050"/><path d="M 1490 642 L 1525 560 L 1560 642 Z" fill="#2A2050"/><circle cx="1525" cy="670" r="12" fill="#FFE27A" opacity=".85"/>`;
      return o; },
  ];
  function cloudTile(){
    const cl = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})" opacity=".55"><ellipse rx="90" ry="30" fill="#6A5AA8"/><ellipse cx="40" cy="-20" rx="56" ry="34" fill="#7A6AB8"/><ellipse cx="-40" cy="-12" rx="46" ry="26" fill="#7A6AB8"/></g>`;
    return cl(200, 260, 1) + cl(900, 160, .8) + cl(1500, 330, 1.2) + cl(2300, 210, .9) + cl(2900, 380, 1);
  }
  const NEAR = [
    () => { let o = `<rect x="0" y="985" width="${TW}" height="500" fill="#14102E"/>`;
      for (let i = 0; i < 34; i++){ const x = i * 96 + (i % 2) * 30, h = 70 + (i * 37) % 50; o += `<path d="M ${x} ${1000 - h} C ${x + 40} ${1000 - h + 24} ${x + 56} ${1000 - h/2} ${x + 60} 1000 H ${x - 60} C ${x - 56} ${1000 - h/2} ${x - 40} ${1000 - h + 24} ${x} ${1000 - h} Z" fill="#1A1438"/>`; }
      return o; },
    /* grantoppe */
    () => { const R = rng(5); let o = `<rect x="0" y="980" width="${TW}" height="500" fill="#14102E"/>`;
      for (let x = 0; x < TW; x += 70){ const h = 90 + R() * 60; o += `<path d="M ${x} ${1000 - h} L ${x + 22} ${1000 - h * .6} L ${x + 12} ${1000 - h * .6} L ${x + 36} ${1000 - h * .25} L ${x + 18} ${1000 - h * .25} L ${x + 44} 1000 H ${x - 44} L ${x - 18} ${1000 - h * .25} L ${x - 36} ${1000 - h * .25} L ${x - 12} ${1000 - h * .6} L ${x - 22} ${1000 - h * .6} Z" fill="#1A1438"/>`; }
      return o; },
    /* tage og skorstene med lys i et enkelt vindue */
    () => { const R = rng(9); let o = `<rect x="0" y="980" width="${TW}" height="500" fill="#14102E"/>`;
      for (let x = 0; x < TW; x += 220 + R() * 80){ const w = 160 + R() * 60, h = 60 + R() * 40;
        o += `<path d="M ${x} 1000 V ${1000 - h * .4} L ${x + w / 2} ${1000 - h} L ${x + w} ${1000 - h * .4} V 1000 Z" fill="#1A1438"/><rect x="${x + w * .7}" y="${1000 - h * .95}" width="16" height="${h * .4}" fill="#1A1438"/>` + (R() < .4 ? win(x + w / 2 - 8, 1000 - h * .55, 16, 18) : ''); }
      return o; },
  ];
  /* hvert lag: stykkerne efter hinanden og det første igen til sidst, så det kan køre i ring */
  const layer = (arr, cls) => `<g class="${cls}">${arr.map((f, i) => `<g transform="translate(${i * TW} 0)">${f()}</g>`).join('')}<g transform="translate(${arr.length * TW} 0)">${arr[0]()}</g></g>`;
  function sceneSvg(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" class="kf-svg"><defs>`
      + `<linearGradient id="kfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A4E"/><stop offset=".55" stop-color="#3E2E88"/><stop offset="1" stop-color="#B0608E"/></linearGradient></defs>`;
    o += `<rect x="-1700" y="-700" width="5000" height="700" fill="#141A4E"/><rect x="-1700" y="0" width="5000" height="1000" fill="url(#kfSky)"/><rect x="-1700" y="1000" width="5000" height="700" fill="#14102E"/>`;
    const r = rng(5);
    for (let i = 0; i < 70; i++) o += `<circle cx="${(-700 + r() * 3000).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(1 + r() * 2.2).toFixed(1)}" fill="#FFFFFF" opacity="${(.4 + r() * .6).toFixed(2)}"/>`;
    o += `<g transform="translate(1320 150)"><circle r="120" fill="#FFF6D8" opacity=".12"/><circle r="62" fill="#FFF6D8"/><circle cx="24" cy="-14" r="56" fill="#3A2E7A" opacity=".9"/></g>`;
    o += `<g class="kf-ev"></g>`;
    o += layer(FAR, 'kf-far') + layer(MID, 'kf-mid');
    o += `<g class="kf-cloud">${cloudTile()}<g transform="translate(${TW} 0)">${cloudTile()}</g></g>`;
    o += `<g class="kf-ev2"></g>`;
    o += `<g class="kf-lanes">${LANES.map((L, i) => `<g class="kf-lane" style="opacity:${L.op}"><g class="kf-trackB l${i}"></g><g class="kf-rivals l${i}"></g><g class="kf-trackF l${i}"></g></g>`).join('')}</g><g class="kf-world"></g><g class="kf-me"></g><g class="kf-front"></g>`;
    o += layer(NEAR, 'kf-near');
    o += `<g class="kf-fx"></g>`;
    o += placeMood([], { vign: .6, dx: 200, dw: 1200 });
    return o + `</svg>`;
  }

  /* ---------- små ting der sker i baggrunden en gang imellem ---------- */
  const EVENTS = ['fyrvaerkeri', 'fyrvaerkeri', 'flagermus', 'stjerneskud', 'lanterne', 'heks'];
  function spawnEvent(kind){
    const sc = $('#kfScene'); if (!sc || calm) return;
    const g = sc.querySelector(kind === 'fyrvaerkeri' || kind === 'lanterne' ? '.kf-ev2' : '.kf-ev'); if (!g) return;
    const x = 300 + Math.random() * 1100, add = (html, ms) => { const e = mk('g', {}, html); g.append(e); setTimeout(() => e.remove(), ms); return e; };
    if (kind === 'fyrvaerkeri'){
      /* en lille skikkelse på jorden fyrer en raket af, som springer ud i en stjerneregn */
      const top = 180 + Math.random() * 220, col = pick(['#FF5FA8', '#FFE27A', '#7FD8FF', '#9BE36A', '#C79BFF', '#FF8A3D']);
      add(`<g transform="translate(${x} 900)"><circle cx="0" cy="-34" r="7" fill="#1A1438"/><path d="M -8 0 L -6 -26 H 6 L 8 0 Z M 4 -24 L 16 -38" stroke="#1A1438" stroke-width="5" fill="#1A1438"/></g>`, 3200);
      add(`<g class="kf-rocket" style="--h:${top - 880}px"><circle cx="${x + 16}" cy="880" r="4" fill="#FFF6D0"/><path d="M ${x + 16} 884 v 26" stroke="#FFC86A" stroke-width="3" opacity=".7"/></g>`, 900);
      setTimeout(() => { if (!g.isConnected) return; for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, d = 70 + Math.random() * 40;
        add(`<g transform="translate(${x + 16} ${top})"><g class="kf-burst" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px"><circle r="4.5" fill="${i % 3 ? col : '#FFFFFF'}"/></g></g>`, 1500); }
        tone(180, 0.25, 'sine', 0.03, 0, 0.6); }, 850);
    } else if (kind === 'flagermus'){
      const y = 140 + Math.random() * 200;
      add(`<g class="kf-fly" style="--dur:7s">${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${1750 + i * 50 + (i % 2) * 20} ${y + (i % 3) * 26})"><g class="kf-flap" style="animation-delay:${i * .07}s"><path d="M 0 0 Q -10 -12 -24 -6 Q -18 -2 -16 4 Q -8 0 0 4 Q 8 0 16 4 Q 18 -2 24 -6 Q 10 -12 0 0 Z" fill="#14102E"/></g></g>`).join('')}</g>`, 7200);
    } else if (kind === 'stjerneskud'){
      const y = 60 + Math.random() * 160, x0 = 400 + Math.random() * 1000;
      add(`<g class="kf-shoot"><path d="M ${x0} ${y} l -180 60" stroke="#FFF6D0" stroke-width="3" stroke-linecap="round"/><circle cx="${x0}" cy="${y}" r="4" fill="#FFFFFF"/></g>`, 1300);
    } else if (kind === 'lanterne'){
      add(`<g class="kf-lantern" style="--x:${(Math.random() * 120 - 60).toFixed(0)}px"><rect x="${x - 10}" y="880" width="20" height="26" rx="5" fill="#FFB347"/><circle cx="${x}" cy="893" r="22" fill="#FFB347" opacity=".25"/></g>`, 9000);
    } else if (kind === 'heks'){
      /* en anden heks langt væk, som en lille skygge foran månen */
      add(`<g class="kf-fly" style="--dur:9s"><g transform="translate(1800 ${130 + Math.random() * 60}) scale(.5)"><path d="M -60 0 H 60 M -60 0 l -20 -8 v 16 Z" stroke="#14102E" stroke-width="5" fill="#14102E"/><path d="M -6 0 L 0 -40 L 12 -40 L 14 0 Z M -2 -40 L 30 -70 L 18 -38 Z M 0 -44 a 10 10 0 1 0 1 0" fill="#14102E"/></g></g>`, 9200);
    }
  }

  /* ---------- banen ---------- */
  function makeCourse(){
    const rings = [], bubbles = [], dbl = new Set([6, 15, 24, 33, 42]);
    let x = 1500, y = 520;
    for (let i = 0; i < 50; i++){
      if (dbl.has(i)){ const lo = { x, y: 660, dbl:'lo' }, hi = { x, y: 360, dbl:'hi' }; lo.pair = hi; hi.pair = lo; rings.push(lo, hi); y = 540; x += 700; continue; }
      y = clamp(y + (Math.random() * 2 - 1) * 240, 260, 700); rings.push({ x, y }); x += 470 + Math.random() * 130;
    }
    const singles = rings.filter(r => !r.dbl);
    for (let i = 0; i + 1 < singles.length && bubbles.length < 16; i += 3){ const a = singles[i], b = singles[i + 1];
      bubbles.push({ x: (a.x + b.x) / 2, y: clamp((a.y + b.y) / 2 + (Math.random() < .5 ? -170 : 170), 200, 820) }); }
    return { rings, bubbles, end: x + 300 };
  }
  /* to klassekammerater med hver sin dygtighed: den ene rammer det meste og looper tit, den anden misser mere.
     Hvert løb trækkes nye tal, så det aldrig går helt ens. */
  function makeRivals(mates){
    const good = Math.random() < .5 ? 0 : 1;
    return mates.map((m, i) => { const g = i === good, j = () => Math.random() * .08;
      return { st: m.st, lane: LANES[i], li: i, x: 0, y: 520, vy: 0, v: V0, ang: 0, loop: null, boost: 0, plan: null, seen: new Set(), finT: 0, els: new Map(),
        off: g ? 120 : -160, hit: g ? .74 + j() : .5 + j(), tryLoop: g ? .6 + j() : .35 + j(), aim: g ? .72 + j() : .45 + j(), wob: Math.random() * 6 }; });
  }

  /* ---------- skærmen ---------- */
  function show(){
    showScreen('#broom'); playMusic('show');
    const hero = heroState(), taken = [];
    const mates = [0, 1].map(i => { const own = i === 0 && Math.random() < 0.3 ? ownGuest(figures.length ? figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].id : null) : null; const g = own || randomGuest(taken); taken.push(g.name); return g; });
    S = { hero, mates, course: makeCourse(), x: 0, y: 520, vy: 0, v: V0, ang: 0, t: 0, run: 'wait', cam: -PX, evT: 3, seen: new Set(), me: true,
      rings: 0, ringsAll: 0, bubbles: 0, loop: null, boost: 0, flash: 0, bonk: 0, finT: 0, auto: !!(window.KOST_AUTO) };
    S.rivals = makeRivals(mates);
    S.ringsAll = S.course.rings.length;
    const box = $('#broomBody'); box.innerHTML = '';
    const scene = el('div', { class:'scene-wrap', id:'kfScene', html: scopeIds(sceneSvg(), 'kf') });
    const track = el('div', { class:'kf-track', 'aria-hidden':'true' }, [ el('div', { class:'kf-line' }), el('span', { class:'kf-flag' }, '🏁'),
      el('span', { class:'kf-dot r0', style:`background:${S.mates[0].st.robe.a}` }), el('span', { class:'kf-dot r1', style:`background:${S.mates[1].st.robe.a}` }), el('span', { class:'kf-dot me', style:`background:${hero.robe.a}` }) ]);
    const count = el('span', { class:'starpill kf-count', html: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#7FD8FF" stroke-width="2.4"/><path d="M12 6l1.8 4 4.2.4-3.2 2.8 1 4.2L12 15.2 8.2 17.4l1-4.2L6 10.4l4.2-.4z" fill="#FFC02E"/></svg><span class="n">0</span>` });
    box.append(scene, track, ...placeUi([ backBtn('Gangen', () => { stop(); showSchool(); }) ], [ count, starPill() ]));
    /* banen bygges én gang som elementer i verden */
    const world = scene.querySelector('.kf-world'), front = scene.querySelector('.kf-front');
    for (const r of S.course.rings){ const [b, f] = ringEls(r); r.back = b; r.front = f; world.append(b); front.append(f); }
    for (const b of S.course.bubbles){ b.el = bubbleEl(b); world.append(b.el); }
    S.rivals.forEach(rv => { const tb = scene.querySelector('.kf-trackB.l' + rv.li), tf = scene.querySelector('.kf-trackF.l' + rv.li), col = lt(rv.st.robe.a, .25);
      for (const r of S.course.rings){ const [b, f] = ringEls({ x: r.x + rv.lane.dx, y: r.y, dbl: r.dbl }, rv.lane.k, y => laneY(rv.lane, y), col); tb.append(b); tf.append(f); rv.els.set(r, [b, f]); } });
    world.append(mk('g', {}, gate(S.course.end)));
    world.append(mk('g', {}, floatGate(130, 150, 820, 1, false)));
    LANES.forEach((L, i) => scene.querySelector('.kf-trackB.l' + i).append(mk('g', {}, laneGate(130 + L.dx, L))));
    /* målstregen går skråt gennem alle tre baner, så man kan se, hvem der krydser først */
    const E = S.course.end, lanesG = scene.querySelector('.kf-lanes'), far = LANES[0];
    lanesG.prepend(mk('g', { class:'kf-finish kf-bobfin' }, `<path d="M ${E} 820 L ${E + far.dx} ${laneY(far, 790)}" stroke="#FFFFFF" stroke-width="16" opacity=".8"/><path d="M ${E} 820 L ${E + far.dx} ${laneY(far, 790)}" stroke="#2A2340" stroke-width="16" stroke-dasharray="16 16" opacity=".8"/>`));
    LANES.forEach((L, i) => scene.querySelector('.kf-trackB.l' + i).append(mk('g', {}, laneGate(E + L.dx, L))));
    S.el = rider(hero, { trail: true }); scene.querySelector('.kf-me').append(S.el);
    S.rivals.forEach(rv => { rv.el = rider(rv.st, { cls:'kf-rival', trail: true }); scene.querySelector('.kf-rivals.l' + rv.li).append(rv.el); });
    /* kort tryk = flyv op, hold fingeren nede = loop */
    let holdT = 0;
    const release = () => { clearTimeout(holdT); holdT = 0; const h = $('#broomBody .kf-hold'); if (h) h.classList.remove('on'); };
    scene.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; flap(); release();
      const h = $('#broomBody .kf-hold'); if (h && S.run === 'fly'){ h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }
      holdT = setTimeout(() => { holdT = 0; tryLoop(); release(); }, HOLD_MS); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) scene.addEventListener(ev, release);
    box.append(el('div', { class:'kf-hold', 'aria-hidden':'true' }));
    if (!keyOn){ keyOn = true; document.addEventListener('keydown', e => { if (!S || $('#broom').hidden) return; if (e.key === ' ' || e.key === 'ArrowUp'){ e.preventDefault(); flap(); } if (e.key === 'l' || e.key === 'L') tryLoop(); }); }
    draw();
    intro();
  }
  function intro(){
    const t = TEACHER, img = svgUrl(renderDoll(t, { viewBox:'200 140 400 400', pet:false }).replace(/<\/svg>$/, GOGGLES + '</svg>'));
    const card = el('div', { class:'reveal magic m-rum kf-intro' }, [
      el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
      el('div', { class:'kf-teach' }, [ el('img', { alt:'', src: img }) ]),
      el('div', { class:'reveal-info' }, [
        el('p', { class:'reveal-cat' }, TEACH),
        el('h3', { class:'reveal-name' }, 'Klar til at flyve?'),
        el('p', { class:'kf-how' }, 'Tryk kort for at flyve op. Hold fingeren nede for at lave et loop. Laver du loopet lige i den nederste af to ringe, flyver du gennem begge og får et boost!'),
        el('div', { class:'reveal-btns row' }, [ el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); veil.remove(); countdown(); } } }, 'Klar!') ]) ]) ]);
    const veil = el('div', { class:'shop-veil kf-veil' }, [ card ]);
    $('#broomBody').append(veil);
    if (S.auto) { veil.remove(); countdown(); }
  }
  async function countdown(){
    const box = $('#broomBody'), big = el('div', { class:'kf-big' }); box.append(big);
    S.run = 'count';
    for (const n of ['3', '2', '1', 'Afsted!']){ big.textContent = n; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); tone(n.length > 1 ? 880 : 440, n.length > 1 ? 0.3 : 0.12, 'triangle', 0.07); await wait(S.auto ? 50 : 700); }
    big.remove(); S.run = 'fly'; S.t = 0; S.last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stop(){ cancelAnimationFrame(raf); raf = 0; if (S) S.run = 'stop'; }
  function flap(){ if (!S || S.run !== 'fly' || S.loop || S.boost > 0) return; S.vy = FLAP; tone(520, 0.06, 'sine', 0.035, 0, 1.6); }

  /* ---------- loop og boost ----------
     Man kan altid loope. Starter loopet lige i den nederste af to ringe over hinanden, går det op gennem
     den øverste og ned igen, og så kommer et boost, der selv styrer gennem de næste tre ringe (fem ringe i alt).
     Det er tilgivende: er man nogenlunde ud for den nederste ring, bliver man trukket ind i den. */
  /* det par, man er ud for: også hvis man lige er fløjet gennem den nederste ring, før loopet nåede at starte */
  const pairAt = f => S.course.rings.find(r => r.dbl === 'lo' && !f.seen.has(r.pair) && r.x - f.x < 180 && r.x - f.x > -230 && Math.abs(r.y - f.y) < 170);
  const nearDouble = () => S.course.rings.some(r => r.dbl === 'lo' && !S.seen.has(r) && r.x - S.x < 650 && r.x - S.x > -60);
  function startLoop(f){
    if (f.loop || f.boost > 0) return false;
    const hit = pairAt(f) || null;
    /* rammer man tæt nok på, bliver man trukket ind i den nederste ring, før loopet begynder */
    f.loop = hit ? { x0: hit.x, y0: hit.y, sx: f.x, sy: f.y, pre: 0, t: 0, cam: hit.x - PX, hit, px: hit.x - 0.01 } : { x0: f.x, y0: f.y, t: 0, cam: f.x - PX, hit: null, px: f.x - 0.01 };
    return true;
  }
  function tryLoop(){ if (!S || S.run !== 'fly') return; if (startLoop(S)){ S.vy = 0; S.loop.hit ? sfx.magic() : tone(500, 0.3, 'sine', 0.04, 0, 1.8); } }
  function passRing(f, r){
    if (f.seen.has(r)) return; f.seen.add(r); f.passN = (f.passN || 0) + 1;
    if (f.boost <= 0) f.v = Math.min(V0 * 1.38, f.v + 55);
    if (f !== S){ const e = f.els && f.els.get(r); if (e) e.forEach(x => x.classList.add('ok')); return; }
    S.rings++; r.back.classList.add('ok'); r.front.classList.add('ok');
    tone(880 + (S.rings % 5) * 60, 0.12, 'triangle', 0.05); tone(1320, 0.1, 'triangle', 0.035, 0.06);
    spark(r.x, r.y, r.dbl ? '#C79BFF' : '#FFE27A', 7);
  }
  function missRing(f, r, d){
    f.seen.add(r);
    if (d < 140){ f.v = Math.max(V0 * .8, f.v - 60); if (f === S){ S.vy = S.y < r.y ? -260 : 260; tone(200, 0.1, 'square', 0.03, 0, 0.8); } }
  }
  function spark(x, y, col, n){
    if (calm) return; const fx = $('#kfScene .kf-fx'); if (!fx) return;
    for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, d = 50 + Math.random() * 50;
      const s = mk('g', { transform:`translate(${x} ${y})` }, `<g class="kf-spark" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px">${star4(0, 0, 10 + Math.random() * 6, col)}</g>`);
      fx.append(s); setTimeout(() => s.remove(), 700); }
  }

  /* ---------- hver billedramme ---------- */
  function frame(now){
    if (!S || S.run === 'stop' || $('#broom').hidden){ raf = 0; return; }
    const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
    step(dt); draw();
    raf = requestAnimationFrame(frame);
  }
  /* fælles for figuren og klassekammeraterne: loop, boost og ringene man flyver igennem */
  function moveLoop(f, dt){
    const L = f.loop;
    if (L.pre !== undefined && L.pre < 1){ L.pre = Math.min(1, L.pre + dt / .22); const e = L.pre * (2 - L.pre); f.x = L.sx + (L.x0 - L.sx) * e; f.y = L.sy + (L.y0 - L.sy) * e; f.ang = 0; if (f === S) S.cam = f.x - PX; return; }
    L.t += dt / LOOP_T; const t = Math.min(1, L.t), a = Math.PI / 2 - 2 * Math.PI * t, cy = L.y0 - LOOP_R;
    f.x = L.x0 + LOOP_R * Math.cos(a); f.y = cy + LOOP_R * Math.sin(a); f.ang = Math.atan2(-Math.cos(a), Math.sin(a)) * 180 / Math.PI;
    /* ringe tæller, hvis loopet faktisk går igennem dem, uanset om man blev trukket ind eller ej */
    for (const r of S.course.rings){ if (f.seen.has(r) || Math.abs(r.x - L.x0) > LOOP_R + 5) continue;
      if ((L.px - r.x) * (f.x - r.x) <= 0 && L.px !== f.x && Math.abs(f.y - r.y) < 100){ passRing(f, r); (L.got = L.got || new Set()).add(r); } }
    L.px = f.x;
    if (t >= 1){ f.loop = null; f.x = L.x0; f.y = L.y0; f.ang = 0; f.vy = 0;
      /* boost: loopet gik gennem den øverste ring, og den nederste er taget (i loopet eller lige før) */
      const pair = L.got && [...L.got].find(r => r.dbl === 'hi' && f.seen.has(r.pair));
      if (pair){ f.loopN = (f.loopN || 0) + 1; f.boost = BOOST_N; f.v = V0 * BOOST_V; if (f === S) boostStart(); } }
  }
  function moveBoost(f, dt){
    const x0 = f.x; f.x += f.v * dt;
    /* næste ring findes ud fra hvor man var før dette skridt, ellers kan en ring blive sprunget over uden at tælle */
    const nr = S.course.rings.find(r => !f.seen.has(r) && r.x > x0 && !r.dbl);
    if (!nr){ f.boost = 0; if (f === S) boostEnd(); return; }
    f.y += (nr.y - f.y) * Math.min(1, dt * 6); f.vy = 0; f.ang = 0;
    if (x0 < nr.x && f.x >= nr.x){ passRing(f, nr); f.boost--; f.bN = (f.bN || 0) + 1; if (f.boost <= 0){ f.v = V0 * 1.5; if (f === S) boostEnd(); } }
  }
  function crossRings(f, x0){
    for (const r of S.course.rings){
      if (f.seen.has(r) || !(x0 < r.x && f.x >= r.x)) continue;
      const d = Math.abs(f.y - r.y);
      if (d < 100) passRing(f, r);
      else if (!r.dbl) missRing(f, r, d);
      /* en dobbeltring, man ikke ramte, lades urørt, så et loop lige efter stadig kan tage den */
    }
  }
  function step(dt){
    if (S.run === 'fly' || S.run === 'done') S.t += dt;
    if (S.run === 'fly' && S.t > S.evT){ spawnEvent(pick(EVENTS)); S.evT = S.t + 4 + Math.random() * 5; }
    for (const rv of S.rivals) if (S.run === 'fly' || S.run === 'done') rivalStep(rv, dt);
    if (S.loop){ moveLoop(S, dt); if (S.loop){ if (S.loop.pre === undefined || S.loop.pre >= 1) S.cam = S.loop.cam; } else S.cam = S.x - PX; return; }
    const x0 = S.x;
    if (S.boost > 0) moveBoost(S, dt);
    else {
      S.x += S.v * dt;
      S.vy = Math.min(VMAXF, S.vy + GRAV * dt); S.y += S.vy * dt;
      if (S.y > BOT){ S.y = BOT; S.vy = -480; S.v = Math.max(V0 * .8, S.v - 40); tone(160, 0.12, 'sine', 0.06, 0, 0.7); }
      if (S.y < TOP){ S.y = TOP; S.vy = Math.max(0, S.vy); }
      S.v += (V0 - S.v) * Math.min(1, dt * .35);
      crossRings(S, x0);
      if (S.auto) autopilot();
      S.ang = clamp(S.vy / 30, -16, 22);
    }
    /* bobler */
    for (const b of S.course.bubbles){ if (b.got) continue; const dx = b.x - S.x, dy = b.y - S.y; if (dx * dx + dy * dy < (S.boost > 0 ? 130 * 130 : 85 * 85)){ b.got = true; S.bubbles++; b.el.classList.add('pop'); sfx.coin(); spark(b.x, b.y, '#FFE27A', 6); const n = $('#broomBody .kf-count .n'); if (n) n.textContent = S.bubbles; } }
    S.cam = S.x - PX;
    if (S.run === 'fly' && S.x >= S.course.end){ S.run = 'done'; S.finT = S.t; finish(); }
  }
  /* klassekammeraterne: de bestemmer sig for hver ring, om de rammer, og ved dobbeltringe om de prøver et loop */
  function rivalStep(rv, dt){
    if (rv.loop){ moveLoop(rv, dt); return; }
    if (rv.boost > 0){ moveBoost(rv, dt); if (!rv.finT && rv.x >= S.course.end) rv.finT = S.t; return; }
    const x0 = rv.x;
    const band = 1 + clamp((S.x + rv.off - rv.x) / 2500, -.22, .22);   /* gummibånd: de bliver i nærheden, men dygtighed tæller stadig */
    rv.x += rv.v * band * dt; rv.v += (V0 - rv.v) * Math.min(1, dt * .35);
    const r = S.course.rings.find(q => !rv.seen.has(q) && q.x > rv.x - 5 && (!q.dbl || q.dbl === 'lo'));
    if (r && (!rv.plan || rv.plan.r !== r)){
      const off = () => (Math.random() < .5 ? -1 : 1) * (130 + Math.random() * 70);
      if (r.dbl){ const lp = Math.random() < rv.tryLoop, aimOk = Math.random() < rv.aim;
        rv.plan = lp ? { r, loop: true, y: r.y + (aimOk ? (Math.random() * 40 - 20) : off() * .8) } : { r, y: Math.random() < rv.hit ? (Math.random() < .5 ? r.y : r.pair.y) + (Math.random() * 40 - 20) : (r.y + r.pair.y) / 2 + (Math.random() * 30 - 15) };
      } else rv.plan = { r, y: Math.random() < rv.hit ? r.y + (Math.random() * 50 - 25) : r.y + off() };
    }
    const ty = rv.plan ? rv.plan.y : 480, k = Math.min(1, dt * 2.6);
    const ny = rv.y + (ty - rv.y) * k + Math.sin(S.t * 2 + rv.wob) * 0.6; rv.ang = clamp((ny - rv.y) / dt / 30, -16, 22); rv.y = clamp(ny, TOP, BOT);
    if (rv.plan && rv.plan.loop && rv.x >= rv.plan.r.x - 20){ rv.plan.loop = false; startLoop(rv); return; }
    crossRings(rv, x0);
    if (!rv.finT && rv.x >= S.course.end) rv.finT = S.t;
  }
  function boostStart(){ S.el.classList.add('boost'); tone(660, 0.4, 'sawtooth', 0.03, 0, 2); const b = el('div', { class:'kf-big boostmsg' }, 'BOOST!'); $('#broomBody').append(b); setTimeout(() => b.remove(), 1000); }
  function boostEnd(){ S.el.classList.remove('boost'); }
  function autopilot(){
    const r = S.course.rings.find(q => !S.seen.has(q) && q.x > S.x - 10 && q.dbl !== 'hi');
    if (r && r.dbl === 'lo' && Math.abs(r.x - S.x) < 50 && Math.abs(r.y - S.y) < 80 && Math.random() < .7){ tryLoop(); return; }
    const ty = r ? r.y + 10 : 520;
    if (S.y > ty + 20 && S.vy > -120) S.vy = FLAP;
  }

  /* ---------- tegn ---------- */
  function draw(){
    const sc = $('#kfScene'); if (!sc || !S) return;
    const cam = S.cam;
    const par = (sel, k) => { const g = sc.querySelector(sel); if (g) g.setAttribute('transform', `translate(${(-((cam * k) % 3200 + 3200) % 3200 - 800).toFixed(1)} 0)`); };
    const parN = (sel, k, n) => { const g = sc.querySelector(sel); if (g) g.setAttribute('transform', `translate(${(-((cam * k) % (n * TW) + n * TW) % (n * TW) - 800).toFixed(1)} 0)`); };
    parN('.kf-far', .12, FAR.length); parN('.kf-mid', .35, MID.length); par('.kf-cloud', .6); parN('.kf-near', 1.25, NEAR.length);
    sc.querySelector('.kf-world').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    sc.querySelector('.kf-front').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    sc.querySelector('.kf-fx').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    sc.querySelector('.kf-lanes').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    S.el.setAttribute('transform', `translate(${(S.x - cam).toFixed(1)} ${S.y.toFixed(1)})`);
    S.el.firstChild.setAttribute('transform', `rotate(${(S.ang || 0).toFixed(1)})`);
    /* klassekammeraterne på deres egen bane i baggrunden, i halv størrelse */
    S.rivals.forEach((rv, i) => {
      rv.el.setAttribute('transform', `translate(${(rv.x + rv.lane.dx).toFixed(1)} ${laneY(rv.lane, rv.y).toFixed(1)}) scale(${rv.lane.k})`);
      rv.el.firstChild.setAttribute('transform', `rotate(${(rv.ang || 0).toFixed(1)})`);
      rv.el.classList.toggle('boost', rv.boost > 0);
      const dot = $('#broomBody .kf-dot.r' + i); if (dot) dot.style.left = (clamp(rv.x / S.course.end, 0, 1) * 100).toFixed(1) + '%';
    });
    const me = $('#broomBody .kf-dot.me'); if (me) me.style.left = (clamp(S.x / S.course.end, 0, 1) * 100).toFixed(1) + '%';
    
  }

  /* ---------- i mål ---------- */
  async function finish(){
    const T = S.finT, rTimes = S.rivals.map(rv => rv.finT || T + Math.max(0.1, (S.course.end - rv.x) / V0));
    const place = 1 + rTimes.filter(t => t < T).length, medal = ['guld', 'sølv', 'bronze'][place - 1];
    const stars = (4 - place) + Math.floor(S.bubbles / 2);
    prog.flights = (prog.flights || 0) + 1; saveProg(); addStars(stars);
    await wait(S.auto ? 50 : 1200);
    stop();
    sfx.fanfare();
    const MED = { guld:['#F2C14E','#A87A1A'], 'sølv':['#D8DCE8','#8A90A8'], bronze:['#D98A4A','#8A4A1E'] }[medal];
    const medSvg = `<svg viewBox="0 0 120 150" aria-hidden="true"><path d="M 34 0 L 50 54 L 60 50 L 70 54 L 86 0 Z" fill="#E0457A"/><path d="M 50 0 L 60 50 L 70 0 Z" fill="#2E4A7A"/><circle cx="60" cy="96" r="44" fill="${MED[0]}" stroke="${MED[1]}" stroke-width="6"/><circle cx="60" cy="96" r="32" fill="none" stroke="${MED[1]}" stroke-width="3" opacity=".6"/><text x="60" y="112" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="44" fill="${MED[1]}">${place}</text><path d="M 34 72 A 34 34 0 0 1 56 60" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;
    const card = el('div', { class:'reveal magic m-rum kf-end' }, [
      el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
      ...[0, 1, 2, 3].map(i => el('span', { class:'mc-corner c' + i, 'aria-hidden':'true', html: MC_CORNER })),
      el('div', { class:'kf-medal', html: medSvg }),
      el('div', { class:'reveal-info' }, [
        el('p', { class:'reveal-cat' }, `${medal[0].toUpperCase() + medal.slice(1)} · ${T.toFixed(1)} sekunder`),
        el('h3', { class:'reveal-name' }, place === 1 ? 'Du vandt løbet!' : `Du blev nummer ${place}!`),
        el('p', { class:'kf-how' }, `${S.rings} af ${S.ringsAll} ringe · ${S.bubbles} stjernebobler`),
        el('div', { class:'lesson-stars', html: STAR_SVG.repeat(Math.min(12, stars)) }),
        el('p', { class:'kf-how' }, `Du fik ${stars} ${stars === 1 ? 'stjerne' : 'stjerner'}.`),
        el('div', { class:'reveal-btns row' }, [
          el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); goTo(showSchool); } } }, 'Tilbage til gangen'),
          el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); goTo(show); } } }, 'Flyv igen') ]) ]) ]);
    const veil = el('div', { class:'shop-veil' }, [ card ]);
    $('#broomBody').append(veil); confetti(veil, place === 1 ? 70 : 30);
    S.result = { place, stars, time: T, rings: S.rings, bubbles: S.bubbles, loops: S.loopN || 0, boostRings: S.bN || 0, rivals: S.rivals.map((rv, i) => ({ t: +rTimes[i].toFixed(1), rings: rv.passN || 0, loops: rv.loopN || 0, hit: +rv.hit.toFixed(2) })) };
  }
  /* til Tegnebordet: et stillbillede af banen og læreren */
  function previewSvg(){
    const hero = heroState(), div = document.createElement('div'); div.innerHTML = sceneSvg();
    const q = c => div.querySelector(c), world = q('.kf-world'), front = q('.kf-front');
    for (const r of [{ x: 760, y: 470 }, { x: 1240, y: 660, dbl:'lo' }, { x: 1240, y: 360, dbl:'hi' }]){ const [b, f] = ringEls(r); world.append(b); front.append(f); }
    world.append(bubbleEl({ x: 1000, y: 300 }));
    const me = rider(hero); me.setAttribute('transform', 'translate(430 560)'); q('.kf-me').append(me);
    LANES.forEach((L, i) => { const m = randomGuest([]), col = lt(m.st.robe.a, .25);
      for (const r of [{ x: 760, y: 470 }, { x: 1240, y: 660, dbl:'lo' }, { x: 1240, y: 360, dbl:'hi' }, { x: 1700, y: 400 }]){ const [b, f] = ringEls({ x: r.x + L.dx, y: r.y, dbl: r.dbl }, L.k, y => laneY(L, y), col); q('.kf-trackB.l' + i).append(b); q('.kf-trackF.l' + i).append(f); }
      const rv = rider(m.st, { cls:'kf-rival' }); rv.setAttribute('transform', `translate(${(i ? 1240 : 760) + L.dx} ${laneY(L, i ? 660 : 470)}) scale(${L.k})`); q('.kf-rivals.l' + i).append(rv); });
    for (const [c, k] of [['.kf-far', .12], ['.kf-mid', .35], ['.kf-cloud', .6], ['.kf-near', 1.25]]) q(c).setAttribute('transform', 'translate(-800 0)');
    return scopeIds(div.innerHTML, 'kp');
  }
  const teacherSvg = vb => renderDoll(TEACHER, { viewBox: vb, pet:false }).replace(/<\/svg>$/, GOGGLES + '</svg>');
  return { show, state: () => S, previewSvg, teacherSvg, riderSvg: (st, o) => riderArt(st, o), broomSvg, teacherUrl: () => svgUrl(renderDoll(TEACHER, { viewBox:'200 140 400 400', pet:false }).replace(/<\/svg>$/, GOGGLES + '</svg>')), TEACH, test: { step, tryLoop, layers: () => ({ far: layer(FAR, 'a'), mid: layer(MID, 'b'), near: layer(NEAR, 'c'), n: [FAR.length, MID.length, NEAR.length] }) } };
})();
