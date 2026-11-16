/* ================= Bank en gnom =================
   Man står ved det fysiske bord og kigger ned på spillepladen: ni huller i tre rækker, de bageste lidt mindre.
   Sure gnomer stikker hovedet op, og man banker dem med den bløde hammer (et tryk). Guldgnomen giver 3 point.
   Kaninen må man ikke ramme: den koster 2 point. Bagpladen har et rigtigt lysdisplay med tiden.
   Spillet varer 45 sekunder og bliver hurtigere hen ad vejen. */
(() => {
  const E = '#1A1238', T = 45;
  /* hullerne: tre rækker i perspektiv (k = størrelse) */
  const ROWS = [[420, 0.72], [630, 0.86], [852, 1]];
  const HOLES = [];
  ROWS.forEach(([y, k]) => [-1, 0, 1].forEach(c => HOLES.push({ x: 800 + c * 360 * (0.62 + k * 0.38), y, k })));
  let S = null;

  function gnomeBody(kind){
    if (kind === 'kanin') return `<g class="gb">`
      + `<path d="M -26 -86 C -40 -150 -20 -170 -10 -110 Z M 26 -86 C 40 -150 20 -170 10 -110 Z" fill="#F7F4FF" stroke="${E}" stroke-width="4"/><path d="M -24 -98 C -32 -138 -22 -146 -15 -110 Z M 24 -98 C 32 -138 22 -146 15 -110 Z" fill="#FFC8DC"/>`
      + `<path d="M -54 40 C -54 -10 54 -10 54 40 Z" fill="#E8E4F4" stroke="${E}" stroke-width="4"/><circle cx="0" cy="-52" r="46" fill="#F7F4FF" stroke="${E}" stroke-width="4"/>`
      + `<circle class="eyeA" cx="-16" cy="-58" r="6" fill="${E}"/><circle class="eyeA" cx="16" cy="-58" r="6" fill="${E}"/><circle cx="-14" cy="-60" r="2" fill="#FFF"/><circle cx="18" cy="-60" r="2" fill="#FFF"/>`
      + `<path d="M -6 -40 L 6 -40 L 0 -33 Z" fill="#FF8FB0"/><path d="M 0 -33 q -8 10 -14 4 M 0 -33 q 8 10 14 4" stroke="${E}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="-30" cy="-38" r="8" fill="#FFB8D0" opacity=".6"/><circle cx="30" cy="-38" r="8" fill="#FFB8D0" opacity=".6"/></g>`;
    const hat = kind === 'guld' ? '#FFD36E' : '#E0457A', band = kind === 'guld' ? '#C99A12' : '#B5305A';
    return `<g class="gb"><path d="M -60 44 C -60 -6 60 -6 60 44 Z" fill="${kind === 'guld' ? '#5A4AA8' : '#3E7AB8'}" stroke="${E}" stroke-width="4"/>`
      + `<path d="M -48 -46 C -52 -110 52 -110 48 -46 C 46 -20 -46 -20 -48 -46 Z" fill="#F2C8A0" stroke="${E}" stroke-width="4"/>`
      + `<path d="M -54 -72 L 0 -168 L 54 -72 Z" fill="${hat}" stroke="${E}" stroke-width="4" stroke-linejoin="round"/><path d="M -58 -72 Q 0 -60 58 -72" stroke="${band}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="0" cy="-168" r="10" fill="#FFF6D0" stroke="${E}" stroke-width="3"/>`
      + (kind === 'guld' ? `<path d="M -20 -120 l 3 7 l 7 1 l -5 5 l 1 7 l -6 -3 l -6 3 l 1 -7 l -5 -5 l 7 -1 Z M 18 -100 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -2 l -4 2 l 1 -5 l -4 -3 l 5 -1 Z" fill="#FFF6D0"/>` : '')
      + `<g class="face-sur"><path d="M -30 -60 l 18 9 M 30 -60 l -18 9" stroke="${E}" stroke-width="6" stroke-linecap="round"/><circle cx="-18" cy="-46" r="5.5" fill="${E}"/><circle cx="18" cy="-46" r="5.5" fill="${E}"/></g>`
      + `<g class="face-dizzy" style="display:none"><path d="M -26 -54 l 14 14 M -12 -54 l -14 14 M 12 -54 l 14 14 M 26 -54 l -14 14" stroke="${E}" stroke-width="5" stroke-linecap="round"/></g>`
      + `<ellipse cx="0" cy="-32" rx="11" ry="9" fill="#E8A888" stroke="${E}" stroke-width="2"/>`
      + `<path d="M -42 -30 C -36 20 36 20 42 -30 C 22 -16 -22 -16 -42 -30 Z" fill="#FFFFFF" stroke="${E}" stroke-width="4"/><path class="face-sur" d="M -14 -14 q 14 -8 28 0" stroke="${E}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      + `<g class="face-dizzy" style="display:none"><ellipse cx="0" cy="-12" rx="8" ry="6" fill="${E}"/></g></g>`;
  }
  /* et hul: bagkant, gnomen (klippet, så den kommer op af hullet) og forkanten over den */
  function holeSvg(h, i){
    const rx = 112 * h.k, ry = 34 * h.k, x = h.x, y = h.y;
    return `<g class="gh" data-i="${i}"><ellipse cx="${x}" cy="${y}" rx="${rx + 14 * h.k}" ry="${ry + 9 * h.k}" fill="url(#gbr)" stroke="#2A160C" stroke-width="4"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#120A06"/>`
      + `<clipPath id="gc${i}"><path d="M ${x - rx - 40} ${y - 400} H ${x + rx + 40} V ${y} A ${rx} ${ry} 0 0 1 ${x - rx} ${y} H ${x - rx - 40} Z"/></clipPath>`
      + `<g clip-path="url(#gc${i})"><g class="gm" transform="translate(${x} ${y + 200 * h.k}) scale(${h.k})"></g></g>`
      + `<path d="M ${x - rx} ${y} A ${rx} ${ry} 0 0 0 ${x + rx} ${y}" stroke="#C9962E" stroke-width="${8 * h.k}" fill="none"/></g>`;
  }
  function boardSvg(){
    const W = '#2A160C';
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs>`
      + `<linearGradient id="gbd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A3A1E"/><stop offset="1" stop-color="#8A5030"/></linearGradient>`
      + `<linearGradient id="gbr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2A0"/><stop offset=".45" stop-color="#D9A848"/><stop offset="1" stop-color="#8A6420"/></linearGradient>`
      + `<linearGradient id="gbw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A2E16"/><stop offset=".5" stop-color="#7A4224"/><stop offset="1" stop-color="#4A2412"/></linearGradient>`
      + `<pattern id="gdam" width="120" height="140" patternUnits="userSpaceOnUse"><rect width="120" height="140" fill="#34101A"/><path d="M 60 14 C 74 34 92 40 92 62 C 92 82 72 88 60 104 C 48 88 28 82 28 62 C 28 40 46 34 60 14 Z" fill="#4A1A26"/></pattern></defs>`;
    o += `<rect x="-400" y="-200" width="2400" height="1400" fill="url(#gdam)"/>`;
    /* bagpladen: træ med messingkant, et emaljeskilt og to mekaniske tælleværk */
    o += `<path d="M 240 -40 H 1360 V 240 H 240 Z" fill="url(#gbw)" stroke="${W}" stroke-width="6"/><path d="M 252 228 H 1348" stroke="#C9962E" stroke-width="5"/>`;
    o += [[262, 16], [1338, 16], [262, 214], [1338, 214]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="url(#gbr)" stroke="${W}" stroke-width="2"/>`).join('');
    o += `<rect x="600" y="8" width="400" height="56" rx="10" fill="#F4E6C8" stroke="${W}" stroke-width="4"/><rect x="608" y="16" width="384" height="40" rx="7" fill="none" stroke="#7A2A1A" stroke-width="2"/>`;
    o += `<text x="800" y="48" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="30" fill="#7A2A1A">BANK EN GNOM</text>`;
    const counter = (x, label, cls, txt, anchor) => `<rect x="${x}" y="80" width="230" height="130" rx="12" fill="url(#gbr)" stroke="${W}" stroke-width="4"/>`
      + `<text x="${x + 115}" y="110" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="22" fill="#3A2008">${label}</text>`
      + `<rect x="${x + 22}" y="120" width="186" height="76" rx="6" fill="#16100C" stroke="${W}" stroke-width="3"/>`
      + [0, 1, 2].map(k => `<rect x="${x + 28 + k * 59}" y="126" width="56" height="64" rx="3" fill="#221812"/><rect x="${x + 28 + k * 59}" y="126" width="56" height="30" rx="3" fill="#FFF" opacity=".06"/>`).join('')
      + `<text class="${cls}" x="${x + 115 + 12}" y="180" text-anchor="middle" font-family="'Courier New',monospace" font-weight="700" font-size="58" letter-spacing="24.2" fill="#F2EEDC">${txt}</text>`;
    o += counter(330, 'TID', 'g-tid', '045') + counter(1040, 'POINT', 'g-pt', '000');
    /* spillepladen af træplanker, skrå og bredere ud mod én, med messingliste */
    o += `<path d="M 240 236 H 1360 L 1640 1040 H -40 Z" fill="url(#gbd)" stroke="${W}" stroke-width="6" stroke-linejoin="round"/>`;
    for (let k = 1; k < 8; k++){ const xt = 240 + k * 140, xb = -40 + k * 210; o += `<path d="M ${xt} 236 L ${xb} 1040" stroke="${W}" stroke-width="3" opacity=".45"/>`; }
    o += `<path d="M 240 240 H 1360" stroke="#C9962E" stroke-width="6"/>`;
    HOLES.forEach((h, i) => { o += holeSvg(h, i); });
    o += `<g class="g-fx" pointer-events="none"></g><g class="g-mallet" pointer-events="none" style="display:none"><g class="mm" style="transform-box:fill-box;transform-origin:50% 100%"><rect x="-10" y="0" width="20" height="150" rx="8" fill="#8A5A3C" stroke="${E}" stroke-width="4"/><rect x="-62" y="-60" width="124" height="66" rx="20" fill="#8E3A22" stroke="${E}" stroke-width="5"/><path d="M -62 -27 h 124" stroke="${W}" stroke-width="3" stroke-dasharray="7 7"/><rect x="-68" y="-64" width="16" height="74" rx="5" fill="url(#gbr)" stroke="${E}" stroke-width="3"/><rect x="52" y="-64" width="16" height="74" rx="5" fill="url(#gbr)" stroke="${E}" stroke-width="3"/></g></g>`;
    return o + `</svg>`;
  }

  function start(stage, api){
    stage.innerHTML = boardSvg(); playMusic('gnom');
    const svg = stage.querySelector('svg');
    /* på en bred, lav skærm (telefon) zoomes ind på hullerne, og tiden vises i en pille i stedet for på bagpladen */
    const short = stage.clientWidth / Math.max(1, stage.clientHeight) > 1.75;
    if (short){ svg.setAttribute('viewBox', '0 222 1600 778'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
    else svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    S = { api, svg, short, t0: performance.now(), last: performance.now(), score: 0, holes: HOLES.map(() => null), next: 900, over: false, raf: 0, msg: 'Bank de sure gnomer!', msgUntil: performance.now() + 2600 };
    api.score(0);
    svg.addEventListener('pointerdown', e => tap(svgPt(svg, e)));
    S.raf = requestAnimationFrame(tick);
  }
  function stop(){ if (S){ S.over = true; cancelAnimationFrame(S.raf); } S = null; }
  const svgPt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

  function spawn(el){
    const free = S.holes.map((g, i) => g ? -1 : i).filter(i => i >= 0);
    if (!free.length || S.holes.filter(Boolean).length >= 3) return;
    const i = free[Math.floor(Math.random() * free.length)], r = Math.random();
    const kind = r < 0.1 ? 'guld' : r < 0.24 && el > 6 ? 'kanin' : 'sur';
    const speed = Math.min(1, el / T);
    const up = (kind === 'guld' ? 900 : 1350) - speed * 600;
    const g = S.svg.querySelector(`.gh[data-i="${i}"] .gm`);
    g.innerHTML = gnomeBody(kind);
    S.holes[i] = { kind, born: performance.now(), up, state: 'op', g, h: HOLES[i] };
  }
  function tick(now){
    if (!S || S.over) return;
    const dt = now - S.last; S.last = now;
    const el = (now - S.t0) / 1000, left = Math.max(0, T - el);
    const tid = S.svg.querySelector('.g-tid'); if (tid) tid.textContent = String(Math.ceil(left)).padStart(3, '0');
    const msg = now < S.msgUntil ? S.msg : S.short ? `Tid ${Math.ceil(left)}` : '';
    if (msg !== S.shown){ S.shown = msg; S.api.info(msg); }
    if (left <= 0){ return finish(); }
    S.next -= dt;
    if (S.next <= 0){ spawn(el); S.next = 820 - Math.min(1, el / T) * 420 + Math.random() * 200; }
    S.holes.forEach((m, i) => {
      if (!m) return;
      const age = now - m.born, rise = 160;
      let y;
      if (m.state === 'op'){ y = age < rise ? 1 - Math.pow(1 - age / rise, 3) : 1; if (age > m.up) { m.state = 'ned'; m.t = now; } }
      else if (m.state === 'ramt'){ const a = now - m.t; y = a < 380 ? 1 : Math.max(0, 1 - (a - 380) / 160); if (y <= 0){ S.holes[i] = null; m.g.innerHTML = ''; return; } }
      else { const a = now - m.t; y = Math.max(0, 1 - a / 200); if (y <= 0){ if (m.kind === 'kanin') {} S.holes[i] = null; m.g.innerHTML = ''; return; } }
      const k = m.h.k, wob = m.state === 'ramt' ? Math.sin((now - m.t) / 30) * 6 : 0;
      m.g.setAttribute('transform', `translate(${(m.h.x + wob).toFixed(1)} ${(m.h.y - 40 * k + (1 - y) * 240 * k).toFixed(1)}) scale(${k})`);
      m.y = y;
    });
    S.raf = requestAnimationFrame(tick);
  }
  function mallet(p){
    const m = S.svg.querySelector('.g-mallet'), mm = m.querySelector('.mm');
    m.style.display = ''; m.setAttribute('transform', `translate(${p.x.toFixed(0)} ${(p.y - 20).toFixed(0)})`);
    mm.getAnimations && mm.getAnimations().forEach(a => a.cancel());
    const a = mm.animate([{ transform: 'rotate(-60deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-10deg)' }], { duration: 220, easing: 'ease-in' });
    a.onfinish = () => { m.style.display = 'none'; };
  }
  function burst(x, y, col, txt){
    const fx = S.svg.querySelector('.g-fx'), g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return `<path d="M 0 -10 l 3 7 l 7 1 l -5 5 l 1 7 l -6 -3 l -6 3 l 1 -7 l -5 -5 l 7 -1 Z" fill="${col}" transform="translate(${(Math.cos(a) * 60).toFixed(0)} ${(Math.sin(a) * 30 - 40).toFixed(0)})"/>`; }).join('')
      + (txt ? `<text y="-110" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="54" fill="${col}" stroke="${E}" stroke-width="3" paint-order="stroke">${txt}</text>` : '');
    g.setAttribute('transform', `translate(${x} ${y})`); fx.append(g);
    g.animate([{ opacity: 1, transform: `translate(${x}px,${y}px) scale(.8)` }, { opacity: 0, transform: `translate(${x}px,${y - 60}px) scale(1.2)` }], { duration: 700, easing: 'ease-out' }).onfinish = () => g.remove();
  }
  function tap(p){
    if (!S || S.over) return;
    mallet(p);
    /* find den gnom, man rammer: hovedet sidder over hullet */
    let best = -1, bd = 1e9;
    S.holes.forEach((m, i) => { if (!m || m.state !== 'op' || (m.y || 0) < 0.35) return;
      const k = m.h.k, hx = m.h.x, hy = m.h.y - 100 * k, dx = (p.x - hx) / (100 * k), dy = (p.y - hy) / (130 * k), d = dx * dx + dy * dy;
      if (d < 1 && d < bd){ bd = d; best = i; } });
    if (best < 0){ SND.play('gnom.forbi', () => tone(140, 0.08, 'sine', 0.06, 0, 0.6)); return; }
    const m = S.holes[best]; m.state = 'ramt'; m.t = performance.now();
    m.g.querySelectorAll('.face-sur').forEach(e => { e.style.display = 'none'; });
    m.g.querySelectorAll('.face-dizzy').forEach(e => { e.style.display = ''; });
    const hx = m.h.x, hy = m.h.y - 150 * m.h.k;
    if (m.kind === 'kanin'){ S.score = Math.max(0, S.score - 2); SND.play('gnom.kanin', () => sfx.nope()); burst(hx, hy, '#FF8FB0', 'Av! −2'); S.msg = 'Ikke kaninen!'; S.msgUntil = performance.now() + 1400; }
    else { const n = m.kind === 'guld' ? 3 : 1; S.score += n; SND.play('gnom.slag', () => tone(220, 0.09, 'square', 0.06, 0, 0.5)); if (m.kind !== 'guld') setTimeout(() => SND.play('gnom.av', () => tone(880, 0.06, 'triangle', 0.04, 0.05)), 70); if (m.kind === 'guld') SND.play('gnom.guld', () => sfx.twinkle()); else SND.play('gnom.av', () => tone(880, 0.06, 'triangle', 0.04, 0.05)); burst(hx, hy, m.kind === 'guld' ? '#FFE27A' : '#FFF6D0', `+${n}`); }
    S.api.score(S.score);
    const pt = S.svg.querySelector('.g-pt'); if (pt) pt.textContent = String(S.score).padStart(3, '0');
  }
  function finish(){
    if (!S || S.over) return; S.over = true;
    const n = S.score, api = S.api;
    const line = n >= 40 ? 'Gnomerne tør ikke stikke hovedet op mere!' : n >= 20 ? 'Gnomerne er godt sure nu!' : 'Gnomerne griner lidt af dig. Prøv igen!';
    setTimeout(() => api.end(n, line), 500);
  }
  /* til testen: spil hurtigt færdig */
  Arkade.GAMES.gnom = { start, stop, test: () => { if (S){ S.t0 -= T * 1000; } }, state: () => S && { score: S.score, holes: S.holes.map(m => m && { kind: m.kind, x: m.h.x, y: m.h.y - 100 * m.h.k, ok: m.state === 'op' && (m.y || 0) > .5 }) } };
})();
