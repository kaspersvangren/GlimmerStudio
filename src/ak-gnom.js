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
    return `<g class="gh" data-i="${i}"><ellipse cx="${x}" cy="${y}" rx="${rx + 12 * h.k}" ry="${ry + 8 * h.k}" fill="#2A5A34" stroke="${E}" stroke-width="4"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#081A0E"/>`
      + `<clipPath id="gc${i}"><path d="M ${x - rx - 40} ${y - 400} H ${x + rx + 40} V ${y} A ${rx} ${ry} 0 0 1 ${x - rx} ${y} H ${x - rx - 40} Z"/></clipPath>`
      + `<g clip-path="url(#gc${i})"><g class="gm" transform="translate(${x} ${y + 200 * h.k}) scale(${h.k})"></g></g>`
      + `<path d="M ${x - rx} ${y} A ${rx} ${ry} 0 0 0 ${x + rx} ${y}" stroke="#3A7A44" stroke-width="${8 * h.k}" fill="none"/></g>`;
  }
  function boardSvg(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs>`
      + `<linearGradient id="gbd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E6A3A"/><stop offset="1" stop-color="#3E8A4A"/></linearGradient></defs>`;
    o += `<rect x="-400" y="-200" width="2400" height="1400" fill="#22163E"/>`;
    /* bagpladen med lysdisplays */
    o += `<path d="M 240 -40 H 1360 V 240 H 240 Z" fill="#2E6A3A" stroke="${E}" stroke-width="6"/><path d="M 260 -20 H 1340" stroke="#9BE36A" stroke-width="3" opacity=".5"/>`;
    o += `<rect x="560" y="74" width="480" height="120" rx="14" fill="#140C2A" stroke="${E}" stroke-width="5"/>`;
    o += `<text x="610" y="118" font-family="${FONT_C}" font-weight="700" font-size="22" fill="#9BE36A">TID</text><text class="g-tid" x="610" y="178" font-family="'Courier New',monospace" font-weight="700" font-size="58" fill="#FF5A5A" style="filter:drop-shadow(0 0 6px #FF3A3A)">45</text>`;
    o += `<text x="990" y="118" text-anchor="end" font-family="${FONT_C}" font-weight="700" font-size="22" fill="#9BE36A">POINT</text><text class="g-pt" x="990" y="178" text-anchor="end" font-family="'Courier New',monospace" font-weight="700" font-size="58" fill="#FF5A5A" style="filter:drop-shadow(0 0 6px #FF3A3A)">000</text>`;
    o += `<text x="800" y="52" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="34" fill="#9BE36A" style="filter:drop-shadow(0 0 8px #9BE36A)">BANK EN GNOM</text>`;
    /* spillepladen: skrå, bredere ud mod én */
    o += `<path d="M 240 236 H 1360 L 1640 1040 H -40 Z" fill="url(#gbd)" stroke="${E}" stroke-width="6" stroke-linejoin="round"/>`;
    o += `<path d="M 268 256 H 1332 L 1588 1000 H 12 Z" fill="none" stroke="#9BE36A" stroke-width="3" opacity=".35"/>`;
    HOLES.forEach((h, i) => { o += holeSvg(h, i); });
    o += `<g class="g-fx" pointer-events="none"></g><g class="g-mallet" pointer-events="none" style="display:none"><g class="mm" style="transform-box:fill-box;transform-origin:50% 100%"><rect x="-10" y="0" width="20" height="150" rx="8" fill="#8A5A3C" stroke="${E}" stroke-width="4"/><rect x="-62" y="-60" width="124" height="66" rx="24" fill="#E0457A" stroke="${E}" stroke-width="5"/><path d="M -46 -38 h 92" stroke="#FF8FB0" stroke-width="7" stroke-linecap="round"/></g></g>`;
    return o + `</svg>`;
  }

  function start(stage, api){
    stage.innerHTML = boardSvg();
    const svg = stage.querySelector('svg');
    /* på en bred, lav skærm (telefon) zoomes ind på hullerne, og tiden vises i en pille i stedet for på bagpladen */
    const short = stage.clientWidth / Math.max(1, stage.clientHeight) > 1.75;
    if (short){ svg.setAttribute('viewBox', '0 170 1600 830'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
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
    const tid = S.svg.querySelector('.g-tid'); if (tid) tid.textContent = String(Math.ceil(left)).padStart(2, '0');
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
    if (best < 0){ tone(140, 0.08, 'sine', 0.06, 0, 0.6); return; }
    const m = S.holes[best]; m.state = 'ramt'; m.t = performance.now();
    m.g.querySelectorAll('.face-sur').forEach(e => { e.style.display = 'none'; });
    m.g.querySelectorAll('.face-dizzy').forEach(e => { e.style.display = ''; });
    const hx = m.h.x, hy = m.h.y - 150 * m.h.k;
    if (m.kind === 'kanin'){ S.score = Math.max(0, S.score - 2); sfx.nope(); burst(hx, hy, '#FF8FB0', 'Av! −2'); S.msg = 'Ikke kaninen!'; S.msgUntil = performance.now() + 1400; }
    else { const n = m.kind === 'guld' ? 3 : 1; S.score += n; tone(220, 0.09, 'square', 0.06, 0, 0.5); if (m.kind === 'guld') sfx.twinkle(); else tone(880, 0.06, 'triangle', 0.04, 0.05); burst(hx, hy, m.kind === 'guld' ? '#FFE27A' : '#FFF6D0', `+${n}`); }
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
