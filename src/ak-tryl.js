/* ================= Trylletegning =================
   Frække væsner kommer svævende ned i tryllede balloner for at spise heksens lagkage. På hver ballon står et
   trylletegn. Man tegner tegnet med fingeren et vilkårligt sted på skærmen, og så springer alle balloner med
   det tegn. Mister et væsen sin sidste ballon, bliver det forvandlet til noget sødt, der flyver væk.
   Lander et væsen, løber det hen og tager en etage af kagen. Når kagen er væk, er spillet slut.
   Hver runde bliver lidt hurtigere, og der kommer nye tegn til: streg, pind, V, hat, ring og lyn.
   Gaveballonen med hjertet flyver forbi en gang imellem: tegner man et hjerte, forvandles alle på én gang. */

/* ---------- tegnene: en streg i en kasse fra -1 til 1 (y nedad), sådan som den står på ballonen ---------- */
const TRYL_TEGN = (() => {
  const ring = Array.from({ length: 33 }, (_, i) => { const a = -Math.PI / 2 + i / 32 * Math.PI * 2; return [Math.cos(a) * .92, Math.sin(a) * .92]; });
  const hj = Array.from({ length: 41 }, (_, i) => { const t = i / 40 * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); return [x / 17, (y + 2.5) / 16]; });
  return {
    vand:   { navn: 'Streg',  c: '#FF6FA8', c2: '#C73A74', p: [[-1, 0], [1, 0]] },
    lod:    { navn: 'Pind',   c: '#35C4B0', c2: '#1B8A7A', p: [[0, -1], [0, 1]] },
    v:      { navn: 'V',      c: '#FFB81E', c2: '#C7820A', p: [[-.85, -.8], [0, .85], [.85, -.8]] },
    hat:    { navn: 'Hat',    c: '#9B6BFF', c2: '#6A3ED0', p: [[-.85, .8], [0, -.85], [.85, .8]] },
    ring:   { navn: 'Ring',   c: '#FF8A3D', c2: '#C7561A', p: ring },
    lyn:    { navn: 'Lyn',    c: '#4AA8FF', c2: '#1F6FC7', p: [[.5, -1], [-.6, .1], [.55, -.1], [-.45, 1]] },
    hjerte: { navn: 'Hjerte', c: '#FFD86B', c2: '#C9962E', p: hj },
  };
})();

/* ---------- genkendelsen ----------
   Tager den tegnede streg (punkter i spillets mål) og de tegn, der er i spil lige nu, og svarer med navnet på
   tegnet eller null. Den er med vilje flink: børn tegner skævt, for stort, for småt og begge veje rundt.
   1. En næsten lige streg er "vand" eller "lod" efter hældningen.
   2. Alt andet lægges i en kasse fra -1 til 1 og holdes op mod skabeloner af hvert tegn, tegnet begge veje. */
const trylGenkend = (() => {
  const N = 32, dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const len = p => { let L = 0; for (let i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]); return L; };
  /* lige langt mellem punkterne, så en langsom og en hurtig hånd giver samme form */
  function resample(p, n){
    const L = len(p), step = L / (n - 1), out = [p[0].slice()]; let acc = 0;
    const q = p.map(a => a.slice());
    for (let i = 1; i < q.length; i++){
      const d = dist(q[i - 1], q[i]);
      if (acc + d >= step && d > 0){ const t = (step - acc) / d, nx = q[i - 1][0] + t * (q[i][0] - q[i - 1][0]), ny = q[i - 1][1] + t * (q[i][1] - q[i - 1][1]); out.push([nx, ny]); q.splice(i, 0, [nx, ny]); acc = 0; }
      else acc += d;
    }
    while (out.length < n) out.push(q[q.length - 1].slice());
    return out.slice(0, n);
  }
  const box = p => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of p){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; };
  /* i kasse: bredde og højde strækkes hver for sig, så et smalt og et bredt V ligner hinanden */
  function unit(p){ const b = box(p), w = b.w || 1, h = b.h || 1; return p.map(([x, y]) => [((x - b.x0) / w) * 2 - 1, ((y - b.y0) / h) * 2 - 1]); }
  const path = (a, b) => { let s = 0; for (let i = 0; i < N; i++) s += dist(a[i], b[i]); return s / N; };
  const T = {};
  const add = (name, pts) => { const u = unit(resample(pts, N)); (T[name] = T[name] || []).push(u, u.slice().reverse()); };
  /* V og hat: knækket kan sidde i midten eller lidt til en af siderne (et flueben er også et V) */
  for (const k of [0, -.45, .45]){ add('v', [[-1, -1], [k, 1], [1, -1]]); add('hat', [[-1, 1], [k, -1], [1, 1]]); }
  add('v', [[-1, -.3], [-.3, 1], [1, -1]]); add('hat', [[-1, .3], [-.3, -1], [1, 1]]);
  /* lynet, som det står på ballonen, spejlvendt og som et Z */
  add('lyn', TRYL_TEGN.lyn.p); add('lyn', TRYL_TEGN.lyn.p.map(([x, y]) => [-x, y]));
  add('lyn', [[-1, -1], [1, -1], [-1, 1], [1, 1]]); add('lyn', [[1, -1], [-1, -1], [1, 1], [-1, 1]]);
  add('lyn', [[.2, -1], [-1, .15], [1, -.15], [-.2, 1]]); add('lyn', [[-.2, -1], [1, .15], [-1, -.15], [.2, 1]]);
  /* ringen kan begynde hvor som helst */
  for (let s = 0; s < 8; s++) add('ring', Array.from({ length: 33 }, (_, i) => { const a = s * Math.PI / 4 + i / 32 * Math.PI * 2; return [Math.cos(a), Math.sin(a)]; }));
  /* hjertet begynder i kløften foroven eller i spidsen forneden */
  { const h = TRYL_TEGN.hjerte.p, n = h.length - 1; add('hjerte', h); add('hjerte', Array.from({ length: n + 1 }, (_, i) => h[(i + n / 2) % n])); }

  return function(raw, aktive){
    if (!raw || raw.length < 3) return null;
    const A = new Set(aktive), L = len(raw), b = box(raw), D = Math.max(b.w, b.h), d = Math.min(b.w, b.h);
    if (L < 60 || D < 45) return null;                                     /* en prik eller et uheld */
    const a = raw[0], z = raw[raw.length - 1], ende = dist(a, z), lige = ende / L;
    /* 1. en streg: næsten lige, eller så smal at den ikke kan være andet */
    if (lige > .82 || (d < .26 * D && lige > .7)){
      const v = Math.atan2(Math.abs(z[1] - a[1]), Math.abs(z[0] - a[0])) * 180 / Math.PI;
      const n = v < 38 ? 'vand' : v > 52 ? 'lod' : null;
      return n && A.has(n) ? n : null;
    }
    if (d < .2 * D) return null;                                            /* kruseduller på en linje */
    /* 2. skabeloner */
    const u = unit(resample(raw, N)); let best = null, bd = 9, second = 9;
    for (const name of Object.keys(T)){ if (!A.has(name)) continue; let m = 9; for (const t of T[name]){ const s = path(u, t); if (s < m) m = s; }
      if (m < bd){ second = bd; bd = m; best = name; } else if (m < second) second = m; }
    if (!best) return null;
    /* ring og hjerte ligner hinanden i kassen. Hjertet er spidst forneden, ringen er rund. */
    const lukket = ende < .5 * D;
    if (lukket && A.has('ring') && A.has('hjerte') && (best === 'ring' || best === 'hjerte')){
      const bund = raw.filter(p => p[1] > b.y0 + .84 * b.h), bb = box(bund);
      best = bb.w < .42 * b.w ? 'hjerte' : 'ring'; bd = Math.min(bd, .5);
    }
    /* en lukket form kan kun være ring eller hjerte, en åben kan ikke */
    if ((best === 'ring' || best === 'hjerte') && ende > .7 * D) return null;
    if (lukket && d > .5 * D && best !== 'ring' && best !== 'hjerte') return null;
    return bd < ((best === 'ring' || best === 'hjerte') && lukket ? .62 : .48) ? best : null;
  };
})();

/* ====== spillet og grafikken ====== */
(() => {
  const E = Arkade.E, TG = TRYL_TEGN;
  /* ---------- tegnehjælpere til figurerne (SVG, som resten af spillet) ---------- */
  const st = (w = 5) => `stroke="${E}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const limb = (d, c, w) => `<path d="${d}" fill="none" stroke="${E}" stroke-width="${w + 9}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const both = s => s + `<g transform="scale(-1 1)">${s}</g>`;
  const eye = (x, y, r, ups) => ups ? `<circle cx="${x}" cy="${y}" r="${r * 1.6}" fill="#FFF" ${st(3.5)}/><circle cx="${x}" cy="${y + 1}" r="${r * .5}" fill="${E}"/>`
    : `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.25}" fill="${E}"/><circle cx="${x + r * .3}" cy="${y - r * .45}" r="${r * .36}" fill="#FFF"/>`;
  const blush = (x, y, r = 7) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="#FF8FB0" opacity=".7"/>`;
  /* armene: i luften holder de om ballonsnoren over hovedet. På jorden (JORD 1 og 2) svinger de, som når man løber:
     den ene arm fremme og oppe, den anden nede, og så skifter de */
  let JORD = 0, HND = [];
  function arm(d, c, w){
    if (!JORD) return both(limb(d, c, w));
    const [sx, sy] = d.match(/-?[\d.]+/g).slice(0, 2).map(Number), op = [sx - 32, sy + 12], ned = [sx - 8, sy + 46];
    const L = JORD === 1 ? op : ned, Rr = JORD === 1 ? [-ned[0], ned[1]] : [-op[0], op[1]];
    HND = [L, Rr];
    const a = (x0, y0, [x, y], u) => limb(`M ${x0} ${y0} Q ${(x0 + x) / 2 + u * 10} ${(y0 + y) / 2 - 6} ${x} ${y}`, c, w);
    return a(sx, sy, L, -1) + a(-sx, sy, Rr, 1);
  }
  const hands = c => JORD ? HND.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9.5" fill="${c}" ${st(4)}/>`).join('') : both(`<circle cx="-8" cy="-91" r="9.5" fill="${c}" ${st(4)}/>`);
  const star5 = (x, y, r, c, w = 3) => { let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${c}" ${w ? st(w) : ''}/>`; };

  /* ---------- væsnerne: tegnet i en kasse på 220, hængende i hænderne (grebet er i 0,-92) ---------- */
  function gnom(ups){
    const J = '#2E9C8A', SK = '#F2C8A0';
    let o = both(limb('M -13 56 V 82', '#3A3F8A', 12)) + both(`<path d="M -29 96 Q -31 80 -14 80 Q -3 80 -4 96 Z" fill="#7A4A2A" ${st(4)}/>`);
    o += arm('M -27 14 C -46 -18 -32 -60 -9 -88', J, 12);
    o += `<path d="M -31 6 Q -38 60 -26 66 H 26 Q 38 60 31 6 Q 0 -8 -31 6 Z" fill="${J}" ${st()}/><path d="M 14 2 Q 30 20 24 63 H 27 Q 37 58 30 8 Z" fill="#1F7A6A" opacity=".75"/>`;
    o += `<path d="M -32 47 H 32" stroke="${E}" stroke-width="14"/><path d="M -31 47 H 31" stroke="#6A4020" stroke-width="8"/><rect x="-8" y="39" width="16" height="16" rx="3.5" fill="#F2C14E" ${st(3.5)}/>`;
    o += `<circle cx="0" cy="-16" r="29" fill="${SK}" ${st()}/>` + both(blush(-20, -9, 6));
    o += `<path d="M -28 -10 C -32 28 -12 46 0 48 C 12 46 32 28 28 -10 C 16 4 -16 4 -28 -10 Z" fill="#FFFFFF" ${st(4.5)}/><path d="M -12 30 q 4 6 0 12 M 10 28 q 4 6 0 12" stroke="#D8D2E8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    o += ups ? `<ellipse cx="0" cy="13" rx="7" ry="9" fill="${E}"/>` : `<path d="M -11 7 Q 0 24 11 7 Z" fill="${E}"/><path d="M -5 14 Q 0 21 5 14 Q 0 11 -5 14 Z" fill="#FF7A9A"/>`;
    o += `<ellipse cx="0" cy="-5" rx="8.5" ry="7" fill="#EFA286" ${st(3.5)}/>`;
    o += eye(-12, -20, 4.2, ups) + eye(12, -20, 4.2, ups) + (ups ? '' : `<path d="M -21 -31 l 11 4 M 21 -31 l -11 4" ${st(3.5)} fill="none"/>`);
    o += `<g transform="translate(0 ${ups ? -7 : 0})"><path d="M -33 -30 Q -12 -70 1 -82 Q 14 -70 33 -30 Q 0 -44 -33 -30 Z" fill="#E0457A" ${st()}/><path d="M -20 -42 Q -8 -62 0 -72" stroke="#FF9FC0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`
      + `<path d="M -34 -29 Q 0 -44 34 -29" stroke="${E}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M -33 -29 Q 0 -44 33 -29" stroke="#B5305A" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    return o + hands(SK);
  }
  function spoeg(ups){
    const W = '#F7F4FF', SH = '#DAD2F2';
    let o = arm('M -34 -4 C -48 -36 -30 -66 -9 -88', W, 13);
    o += `<path d="M -45 74 C -52 20 -48 -54 0 -56 C 48 -54 52 20 45 74 Q 34 58 22.5 74 Q 11 58 0 74 Q -11 58 -22.5 74 Q -34 58 -45 74 Z" fill="${W}" ${st()}/>`;
    o += `<path d="M 22 -47 C 44 -34 46 20 42 62 Q 37 57 31 63 C 34 20 36 -28 22 -47 Z" fill="${SH}"/>` + both(blush(-28, 3, 8));
    o += eye(-15, -16, 6.5, ups) + eye(15, -16, 6.5, ups);
    o += ups ? `<ellipse cx="0" cy="13" rx="8" ry="11" fill="${E}"/>` : `<path d="M -13 6 Q 0 28 13 6 Z" fill="${E}" ${st(3)}/><path d="M -6 15 Q 0 32 6 15 Q 0 11 -6 15 Z" fill="#FF7A9A"/>`;
    o += `<g transform="translate(23 -50) rotate(20)"><path d="M 0 0 L -21 -12 V 12 Z M 0 0 L 21 -12 V 12 Z" fill="#FF6FA8" ${st(4)}/><circle r="6.5" fill="#FF9FC8" ${st(3.5)}/></g>`;
    return o + hands(W);
  }
  function froe(ups){
    const G = '#6CCB5A', G2 = '#4AA83E', B = '#D8F5B0';
    let o = both(limb('M -16 44 C -32 58 -34 74 -26 88', G, 9)) + both(`<path d="M -27 85 L -46 97 Q -34 103 -28 96 Q -22 104 -9 98 Z" fill="#F2A040" ${st(3.5)}/>`);
    o += arm('M -22 6 C -44 -22 -30 -62 -9 -88', G, 9);
    o += `<ellipse cx="0" cy="22" rx="27" ry="27" fill="${G}" ${st()}/><ellipse cx="0" cy="22" rx="16" ry="17" fill="${B}"/>`;
    o += `<path d="M -30 28 Q -58 40 -50 56 Q -40 50 -34 60 Q -24 52 -16 62 Q -8 54 0 64 Q 8 54 16 62 Q 24 52 34 60 Q 40 50 50 56 Q 58 40 30 28 Q 0 38 -30 28 Z" fill="#FF8FC7" ${st(4.5)}/>`;
    o += `<path d="M -28 31 Q -44 38 -40 47 Q -30 42 -24 50 Q -14 44 -8 52 Q 0 46 8 52 Q 14 44 24 50 Q 30 42 40 47 Q 44 38 28 31 Q 0 40 -28 31 Z" fill="#FFC8E4"/>`;
    o += `<path d="M -30 28 Q 0 38 30 28" stroke="${E}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M -29 28 Q 0 38 29 28" stroke="#E0457A" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    o += both(`<circle cx="-22" cy="-44" r="16" fill="${G}" ${st()}/>`) + `<ellipse cx="0" cy="-20" rx="42" ry="28" fill="${G}" ${st()}/>` + both(`<circle cx="-22" cy="-43" r="13.5" fill="${G}"/>`);
    o += both(`<circle cx="-22" cy="-45" r="${ups ? 12.5 : 10.5}" fill="#FFF" ${st(3.5)}/><circle cx="${ups ? -22 : -19.5}" cy="${ups ? -45 : -43.5}" r="${ups ? 3.5 : 5.5}" fill="${E}"/>`);
    o += both(blush(-31, -12, 7)) + both(`<circle cx="-5" cy="-27" r="1.8" fill="${G2}"/>`);
    o += ups ? `<ellipse cx="0" cy="-9" rx="9" ry="10" fill="${E}"/>` : `<path d="M -26 -16 Q 0 8 26 -16" ${st(4.5)} fill="none"/><path d="M -6 -5 Q -8 13 0 14 Q 8 13 6 -5 Z" fill="#FF7A9A" ${st(3)}/>`;
    o += `<path d="M -11 -47 L -13 -62 L -6 -55 L 0 -66 L 6 -55 L 13 -62 L 11 -47 Z" fill="#FFD86B" ${st(3.5)}/>`;
    return o + hands(G);
  }
  function gris(ups){
    const P = '#FFB4C8', P2 = '#FF8FB0', PJ = '#8FC4FF', PJ2 = '#5E9BE8', body = 'M 0 -12 C 50 -12 50 72 0 72 C -50 72 -50 -12 0 -12 Z';
    let o = both(limb('M -19 62 V 84', PJ, 16)) + both(`<ellipse cx="-19" cy="93" rx="13" ry="8" fill="${P2}" ${st(4)}/>`);
    o += arm('M -34 6 C -54 -24 -34 -62 -9 -88', PJ, 14);
    o += `<clipPath id="gb"><path d="${body}"/></clipPath><path d="${body}" fill="${PJ}"/><g clip-path="url(#gb)">${[-30, -10, 10, 30].map(x => `<rect x="${x - 4}" y="-20" width="8" height="100" fill="${PJ2}" opacity=".55"/>`).join('')}<path d="M 18 -12 C 60 0 50 72 0 72 C 30 60 36 10 18 -12 Z" fill="#3A6AC8" opacity=".22"/></g><path d="${body}" fill="none" ${st()}/>`;
    o += [12, 31, 50].map(y => `<circle cx="0" cy="${y}" r="4" fill="#FFF" ${st(2.5)}/>`).join('');
    o += both(`<path d="M -30 -42 L -37 -66 L -12 -55 Z" fill="${P}" ${st()}/><path d="M -29 -47 L -32 -59 L -20 -53 Z" fill="${P2}"/>`);
    o += `<circle cx="0" cy="-28" r="33" fill="${P}" ${st()}/>` + both(blush(-25, -16, 7));
    o += `<ellipse cx="0" cy="-17" rx="15" ry="11" fill="${P2}" ${st(4)}/>` + both(`<ellipse cx="-5.5" cy="-17" rx="2.6" ry="4" fill="${E}"/>`);
    o += eye(-14, -35, 4.4, ups) + eye(14, -35, 4.4, ups) + (ups ? `<ellipse cx="0" cy="0" rx="6" ry="5" fill="${E}"/>` : `<path d="M -9 -3 Q 0 7 9 -3" ${st(3.5)} fill="none"/>`);
    o += `<path d="M -28 -46 Q -14 -78 12 -74 Q 40 -70 52 -44 Q 34 -58 26 -50 Q 0 -62 -28 -46 Z" fill="${PJ2}" ${st()}/><circle cx="54" cy="-40" r="9" fill="#FFF" ${st(4)}/>`;
    o += `<path d="M -29 -46 Q 0 -62 27 -49" stroke="${E}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M -28 -46 Q 0 -62 26 -49" stroke="#FFF" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    return o + hands(P);
  }
  /* en lille drage med serviet om halsen: kommer sent og har mange balloner */
  function drage(ups){
    const D = '#B58AF0', D2 = '#8A5AD0', B = '#F2E2FF';
    let o = both(`<path d="M -24 4 L -62 -22 L -56 0 L -68 6 L -52 14 L -58 26 L -26 22 Z" fill="${D2}" ${st(4.5)}/>`);
    o += `<path d="M 20 52 C 50 56 62 76 48 90 C 46 78 36 70 18 68 Z" fill="${D}" ${st(4.5)}/><path d="M 48 90 l 10 -6 l -2 12 Z" fill="#FFD86B" ${st(3)}/>`;
    o += both(limb('M -16 58 V 82', D, 14)) + both(`<path d="M -32 96 Q -32 82 -16 82 Q -4 82 -4 96 Z" fill="${D2}" ${st(4)}/>`);
    o += arm('M -26 8 C -46 -22 -32 -62 -9 -88', D, 12);
    o += `<ellipse cx="0" cy="30" rx="33" ry="36" fill="${D}" ${st()}/><ellipse cx="0" cy="36" rx="19" ry="25" fill="${B}"/><path d="M -15 26 H 15 M -17 38 H 17 M -14 50 H 14" stroke="#D8C2F2" stroke-width="3" stroke-linecap="round"/>`;
    o += both(`<path d="M -22 -50 L -30 -74 L -10 -58 Z" fill="#FFD86B" ${st(4)}/>`);
    o += `<path d="M -34 -22 C -36 -64 36 -64 34 -22 C 34 -2 20 6 0 6 C -20 6 -34 -2 -34 -22 Z" fill="${D}" ${st()}/>` + both(blush(-26, -10, 7));
    o += `<ellipse cx="0" cy="-12" rx="17" ry="12" fill="${B}"/>` + both(`<circle cx="-6" cy="-16" r="2.4" fill="${E}"/>`);
    o += eye(-15, -34, 5, ups) + eye(15, -34, 5, ups);
    o += ups ? `<ellipse cx="0" cy="-5" rx="6" ry="6" fill="${E}"/>` : `<path d="M -10 -7 Q 0 4 10 -7" ${st(3.5)} fill="none"/><path d="M 7 -5 l 3 7 l 3 -8 Z" fill="#FFF" ${st(2)}/>`;
    o += `<path d="M -24 2 Q 0 14 24 2 L 14 30 Q 0 22 -14 30 Z" fill="#FFF" ${st(4)}/><path d="M -6 14 l 6 -4 l 6 4 l -6 8 Z" fill="#FF6FA8"/>`;
    return o + hands(D);
  }

  /* ---------- det, de bliver forvandlet til (kasse på 120) ---------- */
  function sommerfugl(a, b){
    return both(`<path d="M -3 -4 C -30 -52 -64 -30 -46 -4 C -36 6 -14 4 -3 2 Z" fill="${a}" ${st(4)}/><path d="M -3 4 C -40 6 -46 42 -24 40 C -10 38 -4 20 -2 10 Z" fill="${b}" ${st(4)}/><circle cx="-36" cy="-19" r="6" fill="#FFF" opacity=".85"/><circle cx="-22" cy="26" r="4" fill="#FFF" opacity=".85"/>`)
      + `<path d="M -2 -14 Q -9 -32 -16 -35 M 2 -14 Q 9 -32 16 -35" ${st(3)} fill="none"/><circle cx="-16" cy="-35" r="3" fill="${E}"/><circle cx="16" cy="-35" r="3" fill="${E}"/><ellipse cx="0" cy="5" rx="6.5" ry="20" fill="#5A3A8A" ${st(3.5)}/><circle cx="-2.5" cy="-8" r="1.6" fill="#FFF"/><circle cx="2.5" cy="-8" r="1.6" fill="#FFF"/>`;
  }
  const vinger = y => both(`<path d="M -22 ${y} C -46 ${y - 26} -64 ${y - 4} -46 ${y + 6} C -56 ${y + 12} -46 ${y + 22} -28 ${y + 14} Z" fill="#FFF" ${st(4)}/><path d="M -44 ${y + 1} q 8 2 14 -2" stroke="#C8C4E8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  function cupcake(){
    let o = vinger(8) + `<path d="M -24 8 L -17 44 H 17 L 24 8 Z" fill="#FFD86B" ${st(4.5)}/><path d="M -12 12 L -9 42 M 0 12 V 42 M 12 12 L 9 42" stroke="#E0A82A" stroke-width="3"/>`;
    o += `<path d="M -30 12 C -42 -6 -24 -16 -19 -20 C -18 -40 18 -40 19 -20 C 24 -16 42 -6 30 12 C 14 20 -14 20 -30 12 Z" fill="#FF8FC7" ${st(4.5)}/><path d="M -22 2 Q 0 12 22 0 M -14 -14 Q 0 -6 14 -15" stroke="#E0569A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    o += `<path d="M 0 -38 q 4 -10 12 -12" ${st(3)} fill="none"/><circle cx="0" cy="-36" r="8.5" fill="#E8324A" ${st(3.5)}/><circle cx="-3" cy="-39" r="2.4" fill="#FFF" opacity=".8"/>`;
    o += [[-16, -4, '#FFF'], [10, -8, '#7FD8FF'], [18, 6, '#FFF6A0'], [-6, 8, '#9BE36A']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="7" height="3.4" rx="1.7" fill="${c}" transform="rotate(${x * 4} ${x} ${y})"/>`).join('');
    return o + `<circle cx="-7" cy="26" r="2.6" fill="${E}"/><circle cx="7" cy="26" r="2.6" fill="${E}"/><path d="M -5 32 Q 0 37 5 32" ${st(2.6)} fill="none"/>`;
  }
  function and(){
    let o = `<path d="M -36 12 C -42 38 30 46 40 14 C 42 2 30 0 24 8 C 10 -6 -24 -6 -36 12 Z" fill="#FFD23E" ${st(4.5)}/><path d="M -8 16 Q 10 6 24 18 Q 10 32 -8 16 Z" fill="#F2B21E" ${st(3.5)}/>`;
    o += `<circle cx="-16" cy="-14" r="21" fill="#FFD23E" ${st(4.5)}/><path d="M -34 -16 L -54 -11 L -34 -4 Z" fill="#FF8A3D" ${st(4)}/><circle cx="-22" cy="-19" r="4" fill="${E}"/><circle cx="-21" cy="-21" r="1.4" fill="#FFF"/>` + blush(-12, -8, 5);
    o += `<path d="M -26 -32 L -10 -58 L 2 -30 Z" fill="#FF6FA8" ${st(4)}/><path d="M -19 -42 L -3 -40 M -22 -36 L 0 -34" stroke="#FFF" stroke-width="2.5"/><circle cx="-10" cy="-58" r="5.5" fill="#FFF6A0" ${st(3)}/>`;
    return o;
  }
  function hjertevinge(){
    let o = vinger(-6) + `<path d="M 0 40 C -52 4 -34 -36 0 -12 C 34 -36 52 4 0 40 Z" fill="#FF5C8A" ${st(4.5)}/><path d="M -22 -10 q -8 6 -4 16" stroke="#FFC2D6" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    return o + `<circle cx="-9" cy="4" r="2.8" fill="${E}"/><circle cx="9" cy="4" r="2.8" fill="${E}"/><path d="M -6 11 Q 0 18 6 11" ${st(2.8)} fill="none"/>` + blush(-17, 10, 5) + blush(17, 10, 5);
  }
  /* gaven, der hænger under hjerteballonen (kasse 120, grebet i 0,-50) */
  function gave(){
    let o = `<path d="M 0 -50 V -24" stroke="#F2EEDC" stroke-width="2.5"/><rect x="-34" y="-10" width="68" height="56" rx="6" fill="#FF6FA8" ${st(4.5)}/><rect x="-40" y="-22" width="80" height="20" rx="6" fill="#FF8FC7" ${st(4.5)}/>`;
    o += `<rect x="-8" y="-22" width="16" height="68" fill="#FFF6A0" ${st(3.5)}/><path d="M 0 -22 C -30 -50 -40 -22 0 -22 C 40 -22 30 -50 0 -22 Z" fill="#FFF6A0" ${st(4)}/>`;
    return o + star5(-21, 22, 7, '#FFF', 0) + star5(22, 16, 5, '#FFF', 0);
  }

  /* ---------- lagkagen: n etager tilbage (0 til 3). Kasse fra -170,-330 til 170,10, foden står i 0,0 ---------- */
  function kage(n){
    const br = `<linearGradient id="kb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2A0"/><stop offset=".5" stop-color="#D9A848"/><stop offset="1" stop-color="#8A6420"/></linearGradient>`;
    const tier = (yb, hw, h, fc, fl) => { const yt = yb - h, k = Math.round(hw / 14), w = 2 * hw / k;
      let o = `<path d="M ${-hw} ${yb} V ${yt + 10} Q ${-hw} ${yt} ${-hw + 10} ${yt} H ${hw - 10} Q ${hw} ${yt} ${hw} ${yt + 10} V ${yb} Z" fill="#F6D9A8" ${st(4.5)}/>`;
      o += `<path d="M ${-hw + 3} ${yb - h * .3} H ${hw - 3}" stroke="#FFF8E6" stroke-width="7"/><path d="M ${-hw + 3} ${yb - h * .3 + 6} H ${hw - 3}" stroke="#E0567A" stroke-width="3.5"/>`;
      let d = `M ${hw} ${yt + 14} V ${yt + 10} Q ${hw} ${yt} ${hw - 10} ${yt} H ${-hw + 10} Q ${-hw} ${yt} ${-hw} ${yt + 10} V ${yt + 14}`;
      for (let i = 0; i < k; i++){ const x0 = -hw + i * w, dep = yt + 22 + ((i * 5 + (hw | 0)) % 3) * 8; d += ` Q ${x0} ${dep} ${x0 + w / 2} ${dep} Q ${x0 + w} ${dep} ${x0 + w} ${yt + 14}`; }
      return o + `<path d="${d} Z" fill="${fc}" ${st(4.5)}/><path d="M ${-hw + 14} ${yt + 7} H ${hw * .2}" stroke="${fl}" stroke-width="4" stroke-linecap="round"/>`; };
    const baer = (x, y) => `<path d="M ${x} ${y + 12} C ${x - 16} ${y + 2} ${x - 12} ${y - 12} ${x} ${y - 9} C ${x + 12} ${y - 12} ${x + 16} ${y + 2} ${x} ${y + 12} Z" fill="#E8324A" ${st(3.5)}/><path d="M ${x - 7} ${y - 10} L ${x} ${y - 6} L ${x + 7} ${y - 10} L ${x} ${y - 14} Z" fill="#5AB85A" ${st(2.5)}/><circle cx="${x - 4}" cy="${y - 1}" r="1.2" fill="#FFE27A"/><circle cx="${x + 4}" cy="${y + 2}" r="1.2" fill="#FFE27A"/>`;
    const krumme = (x, y, r = 5) => `<path d="M ${x - r} ${y} q ${r * .2} ${-r * 1.4} ${r} ${-r} q ${r * 1.2} ${r * .2} ${r} ${r} Z" fill="#F6D9A8" ${st(2.5)}/>`;
    /* et bid: en halvrund luns af kanten, med krummer */
    const bid = (x, y, r) => `<path d="M ${x - r} ${y} A ${r} ${r * .9} 0 0 0 ${x + r} ${y} Z" fill="#F6D9A8" ${st(4)}/><path d="M ${x - r * .6} ${y + r * .3} h ${r * 1.2}" stroke="#E0567A" stroke-width="3" stroke-linecap="round"/>` + krumme(x - r - 12, y - 2) + krumme(x + r + 6, y - 2, 4);
    let o = `<defs>${br}</defs><ellipse cx="0" cy="-3" rx="56" ry="9" fill="url(#kb)" ${st(4)}/><path d="M -12 -6 C -8 -16 -8 -22 -16 -30 H 16 C 8 -22 8 -16 12 -6 Z" fill="url(#kb)" ${st(4)}/>`;
    o += `<path d="M -150 -36 Q -150 -26 -120 -26 H 120 Q 150 -26 150 -36 Q 150 -44 120 -44 H -120 Q -150 -44 -150 -36 Z" fill="#FFFFFF" ${st(4.5)}/><path d="M -138 -34 H 138" stroke="#E0D8F0" stroke-width="3" stroke-linecap="round"/>`;
    const Y = -44;
    if (n >= 1){ o += tier(Y, 114, 70, '#FF8FC7', '#FFC8E4'); o += [-84, -42, 0, 42, 84].map((x, i) => i % 2 ? `<path d="M ${x} ${Y - 22} c -9 -7 -6 -14 0 -9 c 6 -5 9 2 0 9 Z" fill="#FFF"/>` : star5(x, Y - 27, 7, '#FFF6A0', 0)).join(''); }
    if (n >= 2){ o += tier(Y - 70, 84, 62, '#FFFFFF', '#F0EAFA'); o += [-62, -31, 0, 31, 62].map(x => baer(x, Y - 70 - 62 - 6)).join(''); }
    if (n >= 3){ o += [-24, 0, 24].map((x, i) => `<rect x="${x - 4.5}" y="${Y - 220}" width="9" height="36" rx="2" fill="${['#7FD8FF', '#FFF6A0', '#9BE36A'][i]}" ${st(3)}/><path d="M ${x - 4.5} ${Y - 208} l 9 -5 M ${x - 4.5} ${Y - 198} l 9 -5" stroke="#FFF" stroke-width="2.2" opacity=".8"/><path d="M ${x} ${Y - 222} v -6" ${st(2.5)}/>`).join('') + tier(Y - 132, 54, 56, '#B79BFF', '#DCCBFF');
      o += [-34, 34].map(x => star5(x, Y - 150, 6, '#FFF6A0', 0)).join(''); }
    /* hvor der er taget en etage, ligger der et bid og krummer */
    if (n === 2) o += bid(-20, Y - 132, 22) + krumme(40, Y - 134, 6) + krumme(62, Y - 133, 4);
    if (n === 1) o += bid(24, Y - 70, 26) + krumme(-50, Y - 72, 6) + krumme(-76, Y - 71, 4) + krumme(78, Y - 71, 5);
    if (n === 0) o += krumme(-70, -44, 7) + krumme(-30, -45, 5) + krumme(20, -44, 8) + krumme(64, -45, 5) + krumme(96, -44, 4) + baer(-4, -56);
    return o;
  }

  /* ---------- baggrunden: skolens have om natten. Tegnes én gang som billede (fra -400 til 2000 i bredden) ---------- */
  function baggrund(){
    let seed = 11; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let o = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0C0830"/><stop offset=".42" stop-color="#261A70"/><stop offset=".74" stop-color="#5E349C"/><stop offset=".9" stop-color="#A850A8"/></linearGradient>`
      + `<radialGradient id="mg"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".5"/><stop offset=".45" stop-color="#FFE9A8" stop-opacity=".14"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="lg"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7A56"/><stop offset="1" stop-color="#184A3C"/></linearGradient>`
      + `<linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2A0"/><stop offset=".5" stop-color="#D9A848"/><stop offset="1" stop-color="#8A6420"/></linearGradient></defs>`;
    o += `<rect x="-400" y="0" width="2400" height="1000" fill="url(#sky)"/>`;
    for (let i = 0; i < 150; i++){ const x = -400 + r() * 2400, y = r() * 640, s = .8 + r() * 2.2; o += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#FFF6D8" opacity="${(.35 + r() * .6).toFixed(2)}"/>`; }
    /* månen med et søvnigt ansigt */
    o += `<circle cx="440" cy="370" r="270" fill="url(#mg)"/><circle cx="440" cy="370" r="92" fill="#FFF1C2"/><circle cx="440" cy="370" r="92" fill="none" stroke="#FFE08A" stroke-width="4" opacity=".7"/>`
      + `<circle cx="398" cy="336" r="13" fill="#F2DC98" opacity=".7"/><circle cx="482" cy="422" r="9" fill="#F2DC98" opacity=".7"/><circle cx="492" cy="328" r="6" fill="#F2DC98" opacity=".7"/>`
      + `<path d="M 404 368 q 11 9 22 0 M 456 368 q 11 9 22 0" stroke="#B89A4A" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 422 396 q 19 15 38 0" stroke="#B89A4A" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="400" cy="390" rx="10" ry="6" fill="#FFB8A0" opacity=".55"/><ellipse cx="482" cy="390" rx="10" ry="6" fill="#FFB8A0" opacity=".55"/>`;
    /* skyer */
    const sky = (x, y, s, a) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${a}"><path d="M -90 20 C -120 20 -120 -16 -86 -16 C -84 -46 -34 -52 -22 -26 C -4 -50 44 -40 42 -10 C 84 -18 100 20 66 20 Z" fill="#B8A0F0"/></g>`;
    o += sky(-180, 420, 1.5, .16) + sky(620, 150, 1.2, .14) + sky(1180, 330, 1.7, .15) + sky(1760, 180, 1.3, .13) + sky(1500, 520, 1.1, .1);
    /* bakker bagest */
    o += `<path d="M -400 760 C -200 660 0 700 200 740 C 420 690 600 720 800 750 C 1000 700 1160 640 1320 640 C 1500 640 1700 720 2000 690 V 1000 H -400 Z" fill="#3A2478"/>`;
    /* skolen på bakken til højre: tårne med lys i vinduerne */
    const taarn = (x, yb, w, h, tag) => `<rect x="${x - w / 2}" y="${yb - h}" width="${w}" height="${h + 40}" fill="#231556"/><path d="M ${x - w / 2 - 8} ${yb - h} L ${x} ${yb - h - tag} L ${x + w / 2 + 8} ${yb - h} Z" fill="#1A0F44"/><rect x="${x + w / 2 - 7}" y="${yb - h}" width="7" height="${h + 40}" fill="#1E1248" opacity=".7"/>`;
    const vindue = (x, y, w = 12, h = 20) => `<path d="M ${x - w / 2} ${y + h} V ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${y + w / 2} V ${y + h} Z" fill="#FFD86B"/><circle cx="${x}" cy="${y + h / 2}" r="${w * 1.6}" fill="#FFD86B" opacity=".12"/>`;
    o += `<g transform="translate(-170 0)">${taarn(1230, 660, 50, 120, 60)}${taarn(1410, 660, 46, 96, 54)}<rect x="1236" y="590" width="176" height="110" fill="#231556"/>`
      + `<path d="M 1236 590 h 16 v -12 h 16 v 12 h 16 v -12 h 16 v 12 h 16 v -12 h 16 v 12 h 16 v -12 h 16 v 12 h 16 v -12 h 16 v 12 h 16 Z" fill="#231556"/>`
      + taarn(1322, 620, 62, 170, 84) + `<path d="M 1322 366 v -34" stroke="#221450" stroke-width="3"/><path d="M 1322 332 l 30 9 l -30 9 Z" fill="#E0457A"/>`
      + vindue(1322, 480, 16, 26) + vindue(1322, 548) + vindue(1230, 568) + vindue(1410, 590) + vindue(1272, 628) + vindue(1368, 628) + vindue(1322, 640, 14, 30) + `</g>`;
    o += `<path d="M -400 800 C -100 730 240 790 520 800 C 800 760 1040 720 1320 700 C 1560 690 1800 760 2000 740 V 1000 H -400 Z" fill="#2C1C62"/>`;
    /* et stort træ til venstre med en ugle på en gren */
    o += `<path d="M -230 900 C -220 760 -236 640 -250 560 L -196 560 C -190 660 -170 770 -150 900 Z" fill="#1A1040"/><path d="M -214 640 C -160 610 -110 618 -64 596" stroke="#1A1040" stroke-width="16" fill="none" stroke-linecap="round"/>`
      + [[-250, 500, 130], [-140, 470, 110], [-330, 440, 120], [-210, 390, 120], [-90, 540, 80], [-360, 560, 90]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#1E1448"/>`).join('')
      + [[-250, 460, 60], [-150, 440, 46], [-300, 400, 50]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#281A58" opacity=".8"/>`).join('')
      + `<g transform="translate(-100 578)"><ellipse cx="0" cy="0" rx="17" ry="22" fill="#3A2868"/><path d="M -15 -14 L -12 -28 L -3 -18 M 15 -14 L 12 -28 L 3 -18" fill="#3A2868"/><circle cx="-7" cy="-7" r="6" fill="#FFE27A"/><circle cx="7" cy="-7" r="6" fill="#FFE27A"/><circle cx="-7" cy="-7" r="2.6" fill="#1A1040"/><circle cx="7" cy="-7" r="2.6" fill="#1A1040"/><path d="M -3 0 L 3 0 L 0 6 Z" fill="#FFB347"/></g>`;
    /* træer til højre */
    o += `<path d="M 1810 900 C 1816 780 1808 700 1800 640 L 1846 640 C 1850 720 1862 800 1876 900 Z" fill="#1A1040"/>` + [[1820, 560, 120], [1920, 600, 110], [1730, 610, 80], [1870, 480, 90]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#1E1448"/>`).join('') + `<circle cx="1830" cy="530" r="56" fill="#281A58" opacity=".8"/>`;
    /* hækken med roser, og plænen */
    let hk = `M -400 880`; for (let x = -400; x < 2000; x += 80) hk += ` Q ${x + 40} ${822 + (x / 80 % 3 + 3) % 3 * 8} ${x + 80} 866`;
    o += `<path d="${hk} V 1000 H -400 Z" fill="#1C4A3A"/>`;
    for (let i = 0; i < 60; i++){ const x = -400 + r() * 2400, y = 850 + r() * 26, c = ['#FF8FC7', '#FFC2E0', '#FFF6A0', '#FF6FA8'][i % 4]; o += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3.5 + r() * 2.5).toFixed(1)}" fill="${c}" opacity=".85"/>`; }
    o += `<path d="M -400 884 Q 800 862 2000 884 V 1000 H -400 Z" fill="url(#lawn)"/><path d="M -400 884 Q 800 862 2000 884" stroke="#3E9A6A" stroke-width="5" fill="none"/>`;
    for (let i = 0; i < 46; i++){ const x = -400 + r() * 2400, y = 900 + r() * 90; if (Math.abs(x - 800) < 230 && y < 975) continue;
      o += i % 5 === 0 ? `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M -4 0 V -10 H 4 V 0 Z" fill="#F2EEDC"/><path d="M -13 -10 Q 0 -30 13 -10 Z" fill="#E0457A"/><circle cx="-4" cy="-16" r="2.2" fill="#FFF"/><circle cx="5" cy="-14" r="1.8" fill="#FFF"/></g>`
        : i % 2 ? `<path d="M ${x.toFixed(0)} ${y.toFixed(0)} q -3 -12 -8 -14 M ${x.toFixed(0)} ${y.toFixed(0)} q 0 -14 2 -18 M ${x.toFixed(0)} ${y.toFixed(0)} q 4 -10 9 -12" stroke="#3E9A6A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
        : `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5" rx="3" ry="5" fill="#FFF" transform="rotate(${a})"/>`).join('')}<circle r="2.6" fill="#FFD86B"/></g>`; }
    /* to gaslygter i jern og messing, med en lyskæde imellem */
    const lygte = x => `<circle cx="${x}" cy="566" r="130" fill="url(#lg)"/><path d="M ${x - 26} 950 Q ${x} 934 ${x + 26} 950 Z" fill="#14102E"/><rect x="${x - 6}" y="610" width="12" height="336" fill="#14102E"/><rect x="${x - 3}" y="610" width="3" height="336" fill="#3A3460" opacity=".7"/><path d="M ${x - 12} 760 h 24 M ${x - 10} 640 h 20" stroke="url(#br)" stroke-width="6"/>`
      + `<path d="M ${x - 26} 610 H ${x + 26} L ${x + 20} 598 H ${x - 20} Z" fill="url(#br)" stroke="#2A160C" stroke-width="2.5"/><path d="M ${x - 20} 598 L ${x - 26} 546 H ${x + 26} L ${x + 20} 598 Z" fill="#FFE9A8" stroke="#2A160C" stroke-width="2.5"/><path d="M ${x} 588 q -9 -14 0 -30 q 9 16 0 30" fill="#FFB347"/><path d="M ${x - 30} 546 H ${x + 30} L ${x + 14} 522 H ${x - 14} Z" fill="url(#br)" stroke="#2A160C" stroke-width="2.5"/><circle cx="${x}" cy="514" r="7" fill="url(#br)" stroke="#2A160C" stroke-width="2.5"/>`;
    const LX = [170, 1430];
    o += `<path d="M ${LX[0]} 530 Q 800 668 ${LX[1]} 530" stroke="#14102E" stroke-width="3" fill="none"/>`;
    for (let i = 1; i < 16; i++){ const t = i / 16, x = LX[0] + (LX[1] - LX[0]) * t, y = 530 + 4 * t * (1 - t) * 69, c = ['#FF8FC7', '#FFE27A', '#7FD8FF', '#9BE36A', '#C79BFF'][i % 5]; o += `<circle cx="${x.toFixed(0)}" cy="${(y + 9).toFixed(0)}" r="13" fill="${c}" opacity=".16"/><path d="M ${x.toFixed(0)} ${y.toFixed(0)} v 4" stroke="#14102E" stroke-width="3"/><ellipse cx="${x.toFixed(0)}" cy="${(y + 10).toFixed(0)}" rx="5" ry="6.5" fill="${c}"/>`; }
    o += lygte(LX[0]) + lygte(LX[1]);
    /* det runde havebord med blondedug */
    o += `<ellipse cx="800" cy="974" rx="210" ry="20" fill="#0E2A22" opacity=".45"/>`
      + [-1, 1].map(s => `<path d="M ${800 + s * 60} 900 C ${800 + s * 64} 940 ${800 + s * 96} 946 ${800 + s * 108} 972 M ${800 + s * 84} 944 q ${s * 16} -16 ${s * 26} 0 q ${s * -6} 10 ${s * -14} 4" stroke="#14102E" stroke-width="8" fill="none" stroke-linecap="round"/>`).join('') + `<path d="M 800 900 V 972" stroke="#14102E" stroke-width="10" stroke-linecap="round"/>`;
    let dug = `M 620 890`; for (let i = 0; i < 12; i++){ const x = 620 + i * 30; dug += ` Q ${x + 2} ${930 + (i % 2) * 6} ${x + 15} ${930 + (i % 2) * 6} Q ${x + 28} ${930 + (i % 2) * 6} ${x + 30} 904`; }
    o += `<path d="${dug} L 980 890 Z" fill="#F7F4FF" stroke="${E}" stroke-width="4" stroke-linejoin="round"/>` + Array.from({ length: 12 }, (_, i) => `<circle cx="${635 + i * 30}" cy="${916 + (i % 2) * 6}" r="3.2" fill="#D8D0EE"/>`).join('')
      + `<ellipse cx="800" cy="890" rx="182" ry="19" fill="#FFFFFF" stroke="${E}" stroke-width="4"/><ellipse cx="800" cy="889" rx="150" ry="13" fill="none" stroke="#E0D8F0" stroke-width="3" stroke-dasharray="4 9"/>`;
    return o;
  }

  /* skærmen på automaten ude i hallen (160 x 120) */
  function skaermbillede(){
    const bal = (x, y, k, r = 15) => { const t = TG[k], p = t.p.map(([a, b]) => `${(x + a * r * .5).toFixed(1)} ${(y + b * r * .5).toFixed(1)}`).join(' L ');
      return `<path d="M ${x} ${y + r} v 16" stroke="#F2EEDC" stroke-width=".8"/><ellipse cx="${x}" cy="${y}" rx="${r * .9}" ry="${r}" fill="${t.c}" stroke="${E}" stroke-width="1.6"/><ellipse cx="${x - r * .35}" cy="${y - r * .4}" rx="${r * .2}" ry="${r * .3}" fill="#FFF" opacity=".5"/><path d="M ${p}" stroke="${E}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${p}" stroke="#FFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
    let o = `<rect width="160" height="120" fill="#1A1250"/><rect y="70" width="160" height="50" fill="#3A2478"/><rect y="104" width="160" height="16" fill="#1C4A3A"/>` + [[14, 12], [50, 30], [150, 10], [96, 6], [128, 56], [20, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#FFF"/>`).join('');
    o += bal(32, 21, 'vand', 13) + `<g transform="translate(32 71) scale(.24)">${gnom(false)}</g>` + bal(80, 15, 'v', 13) + `<g transform="translate(80 65) scale(.24)">${spoeg(false)}</g>` + bal(128, 23, 'ring', 13) + `<g transform="translate(128 73) scale(.24)">${froe(false)}</g>`;
    o += star5(56, 52, 4, '#FFE27A', 0) + star5(104, 46, 3.2, '#FFE27A', 0) + star5(150, 60, 3, '#FFE27A', 0);
    return o;
  }

  /* ================= bosserne (hver 5. runde) =================
     Store, mytiske væsner, der svæver i luften og kaster ting efter kagen. Tegnet i en kasse på 400 med midten i 0,0.
     ups = svimmel (spiral-øjne og tungen ud), når de er sårbare. */
  const spiral = (x, y, r) => { let d = ''; for (let i = 0; i <= 24; i++){ const a = i / 24 * Math.PI * 4, rr = r * i / 24; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<circle cx="${x}" cy="${y}" r="${r * 1.15}" fill="#FFF" ${st(4)}/><path d="${d}" stroke="${E}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`; };
  const tunge = (x, y, w = 14) => `<path d="M ${x - w} ${y} Q ${x - w} ${y + w * 1.8} ${x} ${y + w * 1.8} Q ${x + w} ${y + w * 1.8} ${x + w} ${y} Z" fill="#FF6F9A" ${st(3.5)}/><path d="M ${x} ${y + 3} V ${y + w * 1.2}" stroke="#D84A78" stroke-width="2.5" stroke-linecap="round"/>`;
  const sky = (y, w) => `<path d="M ${-w} ${y + 20} C ${-w - 40} ${y + 20} ${-w - 40} ${y - 30} ${-w + 10} ${y - 26} C ${-w + 10} ${y - 70} ${-w * .3} ${y - 72} ${-w * .2} ${y - 40} C ${-w * .1} ${y - 86} ${w * .5} ${y - 80} ${w * .4} ${y - 36} C ${w * .6} ${y - 70} ${w + 30} ${y - 50} ${w} ${y - 14} C ${w + 44} ${y - 10} ${w + 40} ${y + 24} ${w} ${y + 20} Z" fill="#F7F4FF" ${st()}/><path d="M ${-w + 20} ${y + 6} Q 0 ${y + 16} ${w - 20} ${y + 6}" stroke="#D8D0EE" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  function bTrold(ups){
    const G = '#7AB84A', G2 = '#5A9A34', V = '#8A5A9A';
    let o = sky(120, 150);
    /* sækken med bomber i venstre hånd */
    o += `<path d="M -190 20 C -210 70 -190 110 -140 110 C -96 110 -84 66 -104 22 Z" fill="#B8864A" ${st()}/><path d="M -176 24 Q -150 4 -112 22" stroke="${E}" stroke-width="6" fill="none"/>` + [[-168, 8], [-140, 0], [-118, 10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#2A2438" ${st(3)}/><circle cx="${x - 5}" cy="${y - 5}" r="4" fill="#6A6280"/>`).join('');
    o += `<path d="M -96 40 C -110 50 -124 50 -132 40" stroke="${E}" stroke-width="32" stroke-linecap="round" fill="none"/><path d="M -96 40 C -110 50 -124 50 -132 40" stroke="${G}" stroke-width="22" stroke-linecap="round" fill="none"/>`;
    /* kroppen, vesten og den løftede arm */
    o += `<path d="M 96 10 C 130 -20 150 -40 160 -66" stroke="${E}" stroke-width="34" stroke-linecap="round" fill="none"/><path d="M 96 10 C 130 -20 150 -40 160 -66" stroke="${G}" stroke-width="24" stroke-linecap="round" fill="none"/><circle cx="162" cy="-76" r="20" fill="${G}" ${st()}/>`;
    o += `<ellipse cx="0" cy="40" rx="112" ry="88" fill="${G}" ${st()}/><path d="M -100 0 C -80 90 -40 116 -30 120 L -40 10 Z M 100 0 C 80 90 40 116 30 120 L 40 10 Z" fill="${V}" ${st(4)}/><ellipse cx="0" cy="60" rx="46" ry="40" fill="#A8D878"/>`;
    o += [[-60, 46], [-74, 76], [60, 46], [74, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#FFD23E" ${st(2)}/>`).join('');
    /* hovedet med store ører, kæmpenæse og hugtænder */
    o += both(`<path d="M -96 -80 C -150 -110 -160 -50 -104 -46 Z" fill="${G}" ${st()}/><path d="M -104 -74 C -134 -90 -138 -60 -108 -56 Z" fill="#FF9FB0"/>`);
    o += `<ellipse cx="0" cy="-70" rx="100" ry="84" fill="${G}" ${st()}/><path d="M -70 -120 Q 0 -150 70 -120" stroke="${G2}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`;
    o += ups ? spiral(-40, -96, 18) + spiral(40, -96, 18) : `<ellipse cx="-40" cy="-96" rx="14" ry="16" fill="#FFF" ${st(3.5)}/><ellipse cx="40" cy="-96" rx="14" ry="16" fill="#FFF" ${st(3.5)}/><circle cx="-36" cy="-92" r="7" fill="${E}"/><circle cx="44" cy="-92" r="7" fill="${E}"/><path d="M -62 -124 L -24 -112 M 62 -124 L 24 -112" stroke="${E}" stroke-width="8" stroke-linecap="round"/>`;
    o += `<path d="M -80 -38 Q 0 30 80 -38 Q 0 -6 -80 -38 Z" fill="#5A1E2A" ${st()}/>` + (ups ? tunge(14, -20, 16) : '') + `<path d="M -50 -30 L -44 -58 L -34 -26 Z M 50 -30 L 44 -58 L 34 -26 Z" fill="#FFF6E0" ${st(3)}/>`;
    o += `<ellipse cx="0" cy="-64" rx="30" ry="26" fill="#9AD06A" ${st()}/><ellipse cx="-10" cy="-72" rx="8" ry="5" fill="#C8F0A0" opacity=".8"/>` + both(blush(-70, -60, 12));
    /* håret og kronen */
    o += `<path d="M -70 -136 C -90 -170 -50 -170 -48 -150 C -40 -186 0 -176 -6 -150 C 10 -186 54 -176 40 -146 C 70 -170 90 -150 66 -132" fill="#E8742A" ${st()}/>`;
    o += `<path d="M -54 -150 L -60 -206 L -30 -176 L 0 -216 L 30 -176 L 60 -206 L 54 -150 Z" fill="#F2C14E" ${st()}/><path d="M -54 -150 H 54" stroke="${E}" stroke-width="5"/>` + [[-58, -206, '#FF5C8A'], [0, -216, '#4AA8FF'], [58, -206, '#7AD06A']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" ${st(3)}/>`).join('') + `<circle cx="0" cy="-166" r="10" fill="#FF5C8A" ${st(3)}/>`;
    return o;
  }
  function bFoenix(ups){
    const R = '#F2552A', O = '#FF9A2A', Y = '#FFD23E';
    const flamme = (d, c) => `<path d="${d}" fill="${c}" ${st(4)}/>`;
    let o = '';
    /* vingerne af flammer */
    o += both(flamme('M -40 -10 C -110 -90 -170 -110 -196 -60 C -170 -64 -160 -50 -180 -30 C -150 -36 -150 -16 -166 4 C -136 -2 -130 16 -140 34 C -110 20 -80 30 -50 30 Z', R) + flamme('M -46 0 C -100 -60 -140 -70 -160 -44 C -140 -44 -136 -30 -146 -16 C -124 -18 -120 0 -126 14 C -100 8 -76 20 -50 20 Z', O) + flamme('M -50 6 C -86 -30 -110 -34 -122 -20 C -104 -16 -100 -4 -102 6 C -84 4 -70 14 -54 14 Z', Y));
    /* halen af lange flammer, der krøller */
    o += flamme('M -20 60 C -40 120 -70 160 -40 196 C -40 160 -20 140 0 120 C 20 140 40 160 40 196 C 70 160 40 120 20 60 Z', R) + flamme('M -10 70 C -20 110 -30 140 -14 160 C -10 140 0 124 0 110 C 0 124 10 140 14 160 C 30 140 20 110 10 70 Z', Y);
    /* kroppen og hovedet */
    o += `<ellipse cx="0" cy="30" rx="56" ry="66" fill="${O}" ${st()}/><ellipse cx="0" cy="44" rx="32" ry="40" fill="${Y}"/>`;
    o += flamme('M -30 -90 C -40 -140 -20 -170 -6 -190 C -2 -160 6 -150 10 -176 C 20 -150 30 -130 22 -104 C 40 -130 50 -120 40 -90 Z', R) + flamme('M -16 -96 C -20 -130 -8 -150 0 -164 C 4 -140 10 -134 14 -150 C 20 -130 22 -116 14 -100 Z', Y);
    o += `<circle cx="0" cy="-60" r="50" fill="${O}" ${st()}/>` + both(blush(-30, -46, 9));
    o += ups ? spiral(-20, -70, 13) + spiral(20, -70, 13) : `<ellipse cx="-20" cy="-70" rx="10" ry="13" fill="${E}"/><ellipse cx="20" cy="-70" rx="10" ry="13" fill="${E}"/><circle cx="-16" cy="-75" r="4" fill="#FFF"/><circle cx="24" cy="-75" r="4" fill="#FFF"/><path d="M -36 -90 L -10 -84 M 36 -90 L 10 -84" stroke="${E}" stroke-width="6" stroke-linecap="round"/>`;
    o += `<path d="M -16 -46 Q 0 -38 16 -46 L 0 -14 Z" fill="${Y}" ${st(3.5)}/><path d="M -16 -46 Q 0 -52 16 -46" stroke="${E}" stroke-width="3" fill="none"/>` + (ups ? tunge(0, -30, 9) : '');
    /* kløerne, der holder en ildkugle klar */
    o += `<circle cx="0" cy="110" r="20" fill="${Y}" ${st(3)}/><circle cx="0" cy="110" r="11" fill="#FFF6C0"/>` + both(`<path d="M -14 92 L -22 120 M -6 92 L -8 124" stroke="${E}" stroke-width="5" stroke-linecap="round"/>`);
    return o;
  }
  function bIsdrage(ups){
    const B = '#8AD0F2', B2 = '#5AA8D8', H = '#E8F8FF';
    let o = '';
    o += both(`<path d="M -50 -20 L -180 -110 L -166 -60 L -200 -40 L -160 -20 L -176 10 L -130 0 L -136 34 L -70 24 Z" fill="${B2}" ${st()}/><path d="M -60 -10 L -170 -96 M -60 0 L -186 -40 M -66 10 L -160 4" stroke="${H}" stroke-width="3" opacity=".6"/>`);
    o += `<path d="M 30 80 C 90 100 140 140 120 190 C 110 160 90 140 40 130 Z" fill="${B}" ${st()}/><path d="M 120 190 L 134 166 L 146 196 Z" fill="${H}" ${st(3)}/>`;
    o += `<ellipse cx="0" cy="50" rx="70" ry="76" fill="${B}" ${st()}/><ellipse cx="0" cy="64" rx="40" ry="50" fill="${H}"/>` + [30, 54, 78, 102].map(y => `<path d="M -30 ${y} H 30" stroke="#BFE4F6" stroke-width="4" stroke-linecap="round"/>`).join('');
    o += both(`<path d="M -40 112 Q -50 140 -30 146 Q -18 140 -22 112" fill="${B}" ${st()}/>`);
    /* hovedet med ishorn og en lang snude */
    o += both(`<path d="M -40 -110 L -66 -180 L -50 -170 L -58 -206 L -26 -126 Z" fill="${H}" ${st(4)}/>`);
    o += `<path d="M -70 -70 C -70 -140 70 -140 70 -70 C 70 -30 50 -6 0 -6 C -50 -6 -70 -30 -70 -70 Z" fill="${B}" ${st()}/>`;
    o += `<ellipse cx="0" cy="-34" rx="44" ry="28" fill="${H}" ${st(4)}/><circle cx="-14" cy="-40" r="4" fill="${E}"/><circle cx="14" cy="-40" r="4" fill="${E}"/>`;
    o += ups ? spiral(-32, -84, 15) + spiral(32, -84, 15) + tunge(0, -20, 10) : `<ellipse cx="-32" cy="-84" rx="13" ry="15" fill="#FFF" ${st(3.5)}/><ellipse cx="32" cy="-84" rx="13" ry="15" fill="#FFF" ${st(3.5)}/><circle cx="-29" cy="-82" r="7" fill="#2A5A9A"/><circle cx="35" cy="-82" r="7" fill="#2A5A9A"/><circle cx="-27" cy="-85" r="2.6" fill="#FFF"/><circle cx="37" cy="-85" r="2.6" fill="#FFF"/><path d="M -50 -108 L -16 -98 M 50 -108 L 16 -98" stroke="${E}" stroke-width="6" stroke-linecap="round"/><path d="M -20 -20 Q 0 -10 20 -20" stroke="${E}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    o += both(blush(-52, -54, 10));
    /* rimfrost-pigge ned ad ryggen og frostånde */
    o += [[-10, -130], [10, -132], [0, -140]].map(([x, y]) => `<path d="M ${x - 8} ${y + 12} L ${x} ${y - 10} L ${x + 8} ${y + 12} Z" fill="${H}" ${st(3)}/>`).join('');
    return o;
  }
  function bKraken(ups){
    const P = '#B07AE0', P2 = '#8A52C0', L = '#E8D2FF';
    let o = '';
    /* otte arme, der krøller */
    const arm = (x, s, len, k) => `<path d="M ${x} 30 C ${x + s * 30} ${60 + len * .3} ${x + s * 70} ${80 + len * .5} ${x + s * 40} ${110 + len * .6} C ${x + s * 20} ${130 + len * .6} ${x + s * 54} ${150 + len * .6} ${x + s * 70} ${136 + len * .6}" stroke="${E}" stroke-width="${30 - k}" stroke-linecap="round" fill="none"/><path d="M ${x} 30 C ${x + s * 30} ${60 + len * .3} ${x + s * 70} ${80 + len * .5} ${x + s * 40} ${110 + len * .6} C ${x + s * 20} ${130 + len * .6} ${x + s * 54} ${150 + len * .6} ${x + s * 70} ${136 + len * .6}" stroke="${P}" stroke-width="${21 - k}" stroke-linecap="round" fill="none"/>`;
    o += arm(-90, -1, 40, 2) + arm(90, 1, 40, 2) + arm(-60, -1, 80, 0) + arm(60, 1, 80, 0) + arm(-30, 1, 100, 0) + arm(30, -1, 100, 0) + arm(-110, -1, -20, 4) + arm(110, 1, -20, 4);
    /* hovedet: en stor kuppel med pletter, en tiara og en perlekæde */
    o += `<path d="M -120 40 C -140 -120 140 -120 120 40 C 90 70 -90 70 -120 40 Z" fill="${P}" ${st()}/>` + [[-60, -60, 14], [50, -76, 10], [80, -20, 12], [-90, -10, 9], [10, -100, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P2}" opacity=".6"/>`).join('');
    o += `<path d="M -90 40 Q 0 74 90 40" stroke="#FFF" stroke-width="12" stroke-dasharray="0.1 18" stroke-linecap="round" fill="none"/>`;
    o += ups ? spiral(-44, -10, 20) + spiral(44, -10, 20) + `<ellipse cx="0" cy="26" rx="16" ry="12" fill="#5A1E3A" ${st(3)}/>` + tunge(0, 30, 10) : `<ellipse cx="-44" cy="-10" rx="22" ry="24" fill="#FFF" ${st(4)}/><ellipse cx="44" cy="-10" rx="22" ry="24" fill="#FFF" ${st(4)}/><circle cx="-38" cy="-6" r="11" fill="${E}"/><circle cx="50" cy="-6" r="11" fill="${E}"/><circle cx="-34" cy="-11" r="4" fill="#FFF"/><circle cx="54" cy="-11" r="4" fill="#FFF"/><path d="M -70 -42 L -26 -34 M 70 -42 L 26 -34" stroke="${E}" stroke-width="7" stroke-linecap="round"/><path d="M -16 26 Q 0 18 16 26 Q 0 40 -16 26 Z" fill="#E8324A" ${st(3)}/>`;
    o += both(blush(-80, 20, 12));
    o += `<path d="M -50 -108 L -40 -140 L -20 -118 L 0 -150 L 20 -118 L 40 -140 L 50 -108 Q 0 -96 -50 -108 Z" fill="#F2C14E" ${st(4)}/><circle cx="0" cy="-128" r="8" fill="#FF8FC7" ${st(2.5)}/>`;
    return o;
  }
  /* det, bosserne bliver til, når de er besejret (kasse 160) */
  function sTrold(){ return `<ellipse cx="0" cy="20" rx="40" ry="36" fill="#9AD06A" ${st(4)}/><ellipse cx="0" cy="26" rx="20" ry="18" fill="#C8F0A0"/>` + both(`<circle cx="-30" cy="-34" r="12" fill="#9AD06A" ${st(4)}/><circle cx="-30" cy="-34" r="6" fill="#FF9FB0"/>`) + `<circle cx="0" cy="-18" r="34" fill="#9AD06A" ${st(4)}/><circle cx="-11" cy="-22" r="4" fill="${E}"/><circle cx="11" cy="-22" r="4" fill="${E}"/><ellipse cx="0" cy="-10" rx="8" ry="6" fill="#7AB84A" ${st(2.5)}/><path d="M -8 0 Q 0 6 8 0" ${st(3)} fill="none"/>` + both(blush(-20, -8, 5)) + `<path d="${'M 0 40 C -22 24 -14 6 0 18 C 14 6 22 24 0 40 Z'}" fill="#FF5C8A" ${st(3)}/>`; }
  function sFoenix(){ return `<ellipse cx="0" cy="10" rx="40" ry="38" fill="#FFE27A" ${st(4)}/>` + both(`<path d="M -36 6 C -56 0 -60 20 -40 26" fill="#FFD23E" ${st(3.5)}/>`) + `<path d="M -6 -30 Q 0 -46 6 -30 Q 12 -40 14 -28" fill="none" ${st(3)}/><circle cx="-13" cy="0" r="4.5" fill="${E}"/><circle cx="13" cy="0" r="4.5" fill="${E}"/><path d="M -8 10 L 0 20 L 8 10 Z" fill="#FF9A2A" ${st(2.5)}/>` + both(blush(-24, 12, 5)) + both(`<path d="M -12 46 l -4 10 m 4 -10 l 0 10 m 0 -10 l 4 10" stroke="#FF9A2A" stroke-width="3.5" stroke-linecap="round"/>`); }
  function sIsdrage(){ return both(`<path d="M -26 0 L -60 -20 L -50 6 Z" fill="#BFE4F6" ${st(3.5)}/>`) + `<ellipse cx="0" cy="18" rx="34" ry="36" fill="#8AD0F2" ${st(4)}/><circle cx="0" cy="-20" r="30" fill="#8AD0F2" ${st(4)}/><circle cx="-10" cy="-24" r="4.5" fill="${E}"/><circle cx="10" cy="-24" r="4.5" fill="${E}"/><path d="M -8 -10 Q 0 -4 8 -10" ${st(3)} fill="none"/>` + both(blush(-20, -12, 5)) + `<path d="M -30 2 Q 0 16 30 2 L 34 14 Q 0 30 -34 14 Z" fill="#FF6F9A" ${st(3)}/><path d="M 22 10 L 30 40 L 40 36 L 34 12" fill="#FF6F9A" ${st(3)}/>`; }
  function sKraken(){ let o = ''; for (let i = 0; i < 6; i++){ const x = -30 + i * 12; o += `<path d="M ${x} 20 q ${i % 2 ? 6 : -6} 16 0 30 q ${i % 2 ? -8 : 8} 6 ${i % 2 ? -4 : 4} 12" stroke="${E}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M ${x} 20 q ${i % 2 ? 6 : -6} 16 0 30 q ${i % 2 ? -8 : 8} 6 ${i % 2 ? -4 : 4} 12" stroke="#E8A8FF" stroke-width="6" stroke-linecap="round" fill="none"/>`; }
    return o + `<path d="M -40 24 C -50 -50 50 -50 40 24 Q 0 34 -40 24 Z" fill="#E8A8FF" ${st(4)}/><circle cx="-14" cy="0" r="5" fill="${E}"/><circle cx="14" cy="0" r="5" fill="${E}"/><path d="M -6 12 Q 0 17 6 12" ${st(2.6)} fill="none"/>` + both(blush(-26, 10, 5)) + `<path d="M 0 -28 L -16 -40 V -16 Z M 0 -28 L 16 -40 V -16 Z" fill="#FF5C8A" ${st(3)}/><circle cx="0" cy="-28" r="5" fill="#FF8FC7" ${st(2)}/>`; }
  /* kasteskyts (kasse 120). Tegnet uden tegnet; tegnet sættes på i spillet */
  function kBombe(){ return `<circle cx="0" cy="6" r="34" fill="#3A3448" ${st()}/><path d="M -20 -10 A 26 26 0 0 1 4 -24" stroke="#7A7290" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-10" y="-38" width="20" height="14" rx="3" fill="#6A6280" ${st(3.5)}/><path d="M 0 -38 Q 6 -52 18 -54" stroke="#B8864A" stroke-width="5" fill="none" stroke-linecap="round"/>`; }
  function kIld(){ return `<path d="M -30 0 C -30 -24 -6 -34 10 -30 C 30 -40 56 -30 60 -20 C 46 -18 44 -12 58 -4 C 44 0 46 8 60 14 C 40 22 30 32 10 30 C -8 34 -30 24 -30 0 Z" fill="#F2552A" ${st(4)}/><circle cx="0" cy="0" r="26" fill="#FF9A2A"/><circle cx="-4" cy="0" r="17" fill="#FFD23E"/>`; }
  function kIs(){ let d = ''; for (let i = 0; i < 12; i++){ const a = i * Math.PI / 6 - Math.PI / 2, r = i % 2 ? 22 : 46; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); }
    return `<path d="${d}Z" fill="#BFE8FF" ${st(4)}/>` + [0, 60, 120].map(a => `<path d="M 0 -40 V 40" stroke="#FFFFFF" stroke-width="3" transform="rotate(${a})" opacity=".8"/>`).join('') + `<circle r="22" fill="#5AA8D8" ${st(3)}/>`; }
  function kBlaek(){ return `<path d="M -32 -6 C -40 -34 -6 -40 6 -30 C 26 -42 46 -20 34 -2 C 46 12 30 34 12 28 C 4 42 -22 40 -24 24 C -42 24 -46 4 -32 -6 Z" fill="#6A3A9A" ${st(4)}/><circle cx="-36" cy="-28" r="6" fill="#6A3A9A" ${st(2.5)}/><circle cx="40" cy="26" r="5" fill="#6A3A9A" ${st(2.5)}/><ellipse cx="-14" cy="-18" rx="7" ry="4" fill="#B07AE0" opacity=".8"/>`; }

  const KASSE = 220, GREB = -92;                                     /* væsnernes kasse og hvor hænderne er */
  const ART = { gnom, spoeg, froe, gris, drage };
  const svgW = (vb, inner) => { const [, , w, h] = vb.split(' ').map(Number); return { vb, w, h, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>` }; };
  /* alle billeder spillet bruger, som SVG. Bruges også af værktøjerne til at se grafikken igennem */
  function billeder(){
    const B = {};
    for (const k of Object.keys(ART)){ B[k] = svgW(`-110 -112 ${KASSE} ${KASSE}`, ART[k](false)); B[k + '!'] = svgW(`-110 -112 ${KASSE} ${KASSE}`, ART[k](true));
      for (const j of [1, 2]){ JORD = j; B[k + '_' + j] = svgW(`-110 -112 ${KASSE} ${KASSE}`, ART[k](false)); } JORD = 0; }
    B.sommerfugl1 = svgW('-70 -60 140 120', sommerfugl('#FF8FC7', '#C79BFF')); B.sommerfugl2 = svgW('-70 -60 140 120', sommerfugl('#7FD8FF', '#FFE27A'));
    B.cupcake = svgW('-70 -60 140 120', cupcake()); B.and = svgW('-70 -70 140 130', and()); B.hjertevinge = svgW('-70 -60 140 120', hjertevinge());
    B.gave = svgW('-60 -60 120 120', gave());
    for (const [k, f] of Object.entries({ trold: bTrold, foenix: bFoenix, isdrage: bIsdrage, kraken: bKraken })){ B['boss_' + k] = svgW('-210 -230 420 440', f(false)); B['boss_' + k + '!'] = svgW('-210 -230 420 440', f(true)); }
    for (const [k, f] of Object.entries({ trold: sTrold, foenix: sFoenix, isdrage: sIsdrage, kraken: sKraken })) B['sod_' + k] = svgW('-80 -80 160 160', f());
    for (const [k, f] of Object.entries({ bombe: kBombe, ild: kIld, is: kIs, blaek: kBlaek })) B['skud_' + k] = svgW('-64 -64 128 128', f());
    for (let n = 0; n <= 3; n++) B['kage' + n] = svgW('-170 -330 340 340', kage(n));
    B.bg = svgW('-400 0 2400 1000', baggrund());
    return B;
  }

  /* ====== selve spillet ====== */
  const BG = '#0C0830', GULV = 958, BORD = 800, BR = 54, HEKS_X = BORD - 228, DYR_X = BORD + 222;
  /* hvert slags væsen: størrelse, fart, antal balloner, hvilken runde det kommer i, hvor meget det svajer, og hvor tit det kommer */
  const SLAGS = {
    gnom:  { sk: .66, fart: 1,    bal: 1, fra: 1, svaj: 10, tit: 5 },
    spoeg: { sk: .70, fart: .86,  bal: 2, fra: 2, svaj: 26, tit: 3 },
    froe:  { sk: .66, fart: 1.3,  bal: 1, fra: 3, svaj: 74, tit: 3 },
    gris:  { sk: .80, fart: .7,   bal: 3, fra: 4, svaj: 8,  tit: 2 },
    drage: { sk: .86, fart: .58,  bal: 4, fra: 7, svaj: 16, tit: 1.3 },
  };
  const BPOS = { 1: [[0, -118]], 2: [[-51, -110], [51, -110]], 3: [[-84, -98], [0, -150], [84, -98]], 4: [[-104, -86], [-38, -150], [38, -150], [104, -86]] };
  const DYR = ['sommerfugl1', 'sommerfugl2', 'cupcake', 'and', 'hjertevinge'];
  /* hvor stort hvert billede tegnes (spillets mål pr. mål i billedet) og hvilket punkt i billedet, der er dets fod */
  const MAAL = { bg: [1, 0, 0], heks: [.31, 400, 1052], kaeledyr: [.5, 660, 1050], gave: [.86, 0, -50], kage0: [.7, 0, 0], kage1: [.7, 0, 0], kage2: [.7, 0, 0], kage3: [.7, 0, 0] };
  for (const k of Object.keys(SLAGS)){ MAAL[k] = MAAL[k + '!'] = MAAL[k + '_1'] = MAAL[k + '_2'] = [SLAGS[k].sk, 0, GREB]; }
  for (const k of DYR) MAAL[k] = [.62, 0, 0];
  for (const k of ['trold', 'foenix', 'isdrage', 'kraken']){ MAAL['boss_' + k] = MAAL['boss_' + k + '!'] = [1, 0, 0]; MAAL['sod_' + k] = [.9, 0, 0]; }
  for (const k of ['bombe', 'ild', 'is', 'blaek']) MAAL['skud_' + k] = [.95, 0, 0];

  /* ---------- bosserne: hver 5. runde kommer en af dem, i denne rækkefølge, og så forfra, hver gang lidt sværere ----------
     skud: hvad den kaster. bane: hvordan det flyver (bue, ret eller zigzag). hp: hvor mange gange den skal rammes.
     kombo: hvor mange tegn, man skal tegne i træk, når den er svimmel. hand: hvor kastet starter, set fra midten af bossen. */
  const BOSSER = [
    { k:'trold', navn:'Kongetrolden', skud:'bombe', bane:'bue', hp:3, kombo:3, antal:1, hand:[-150, 10], sod:'en lille bamsetrold',
      snak:['Hø hø hø!', 'Den kage er MIN!', 'Stinkbombe på vej!', 'Hø hø, fang!'], av:['Av, min krone!', 'Hov hov hov!', 'Det kilder!'], grin:'Hø hø! For langsom!' },
    { k:'foenix', navn:'Ildfuglen', skud:'ild', bane:'ret', hp:3, kombo:3, antal:1, hand:[0, 110], sod:'en lille kylling',
      snak:['Kra-kraaa!', 'Varm kage, mums!', 'Ild og flammer!', 'Fjer-flammer!'], av:['Mine fjer!', 'Kraaa-av!', 'Puha, det svider!'], grin:'Kra-kra! Jeg vandt næsten!' },
    { k:'isdrage', navn:'Isdragen', skud:'is', bane:'zigzag', hp:4, kombo:3, antal:1, hand:[0, 0], sod:'en lille babydrage',
      snak:['Brrr! Is-kage!', 'Frys, kage!', 'Hihi, glat!', 'Snefnug-stjerner!'], av:['Atjuu!', 'Det er for varmt!', 'Mine horn!'], grin:'Brrr-ha-ha!' },
    { k:'kraken', navn:'Kæmpeblæksprutten', skud:'blaek', bane:'bue', hp:4, kombo:4, antal:2, hand:[0, 120], sod:'en lille blæksprutte',
      snak:['Blæk-blæk!', 'Otte arme til kagen!', 'Splat!', 'Blob-blob-blob!'], av:['Mine arme!', 'Blubb!', 'Av, min tiara!'], grin:'Blæk-hæ-hæ!' },
  ];
  /* bølger: hver boss har sit eget mønster, hvor den kaster flere på én gang (eller lige efter hinanden)
     n: hvor mange. spred: hvor langt fra hinanden de lander. forsink: sekunder mellem hvert. fra: hvor de sendes fra (set fra bossens midte) */
  const MOENSTER = {
    trold:   { n: 3, spred: 150, forsink: .12, navn: 'Bombe-regn!' },
    foenix:  { n: 4, spred: 90, forsink: .32, fra: [[-210, 60], [-70, 90], [70, 90], [210, 60]], navn: 'Ildregn!' },
    isdrage: { n: 3, spred: 130, forsink: 0, modfase: true, navn: 'Isstorm!' },
    kraken:  { n: 4, spred: 110, forsink: .22, fra: [[-150, 110], [-50, 140], [50, 140], [150, 110]], navn: 'Blæksprøjt!' },
  };
  /* superangrebet: bossen lader op, og så kommer en kæmpekugle med flere tegn, der skal tegnes i rækkefølge */
  const SUPER = { trold: 'KÆMPEBOMBE!', foenix: 'FLAMMEKUGLE!', isdrage: 'ISKÆMPE!', kraken: 'BLÆKBOBLE!' };
  const SKUDFARVE = { bombe: '#FF7A3A', ild: '#FFB23E', is: '#7FD8FF', blaek: '#B07AFF' };
  const LAD = 1.7;
  const PYNT = ['sloejfe', 'hjerte', 'blomst', 'hjerte', 'sloejfe'];
  /* hvor pynten sætter sig på hver boss, når den bliver ramt */
  const PYNT_AT = { trold: [[-60, -150], [-70, -60], [70, -60], [0, 60], [60, 20]], foenix: [[0, -150], [-34, -40], [34, -40], [0, 40], [-60, 0]],
    isdrage: [[0, -150], [-52, -52], [52, -52], [0, 60], [-40, 20]], kraken: [[60, -110], [-80, 20], [80, 20], [0, -70], [-60, -80]] };

  function rundeplan(w){
    const tegn = ['vand', 'lod']; if (w >= 2) tegn.push('v'); if (w >= 3) tegn.push('hat'); if (w >= 4) tegn.push('ring'); if (w >= 7) tegn.push('lyn');
    const nyt = w === 1 ? ['vand', 'lod'] : w === 2 ? ['v'] : w === 3 ? ['hat'] : w === 4 ? ['ring'] : w === 7 ? ['lyn'] : [];
    /* afprøvet med robotter: en nybegynder (godt 2 sekunder pr. tegn) når runde 4-5, en øvet (1 sekund) runde 14-16. Det bliver ved med at blive sværere */
    return { tegn, nyt, antal: Math.min(5 + w * 2, 26), gab: Math.max(.5, 2.85 - w * .165), fart: Math.min(50 + w * 6, 200) };
  }

  /* ---------- billederne: hentes som SVG og tegnes én gang over på små lærreder i skærmens opløsning ---------- */
  const IMG = {}, SPR = {}, BAL = {};
  function hent(name, b){
    return new Promise(res => { const im = new Image(); im.onload = () => { IMG[name] = { im, vb: b.vb.split(' ').map(Number) }; res(); }; im.onerror = () => res();
      im.src = svgUrl(b.svg.replace('<svg ', `<svg width="${b.w * 2}" height="${b.h * 2}" `)); });
  }
  function raster(){
    if (!S) return;
    kamera(); const q = S.C.V.k * S.C.V.dpr * S.Zn;
    for (const [name, I] of Object.entries(IMG)){
      const [sk] = MAAL[name] || [1], [x0, y0, w, h] = I.vb, c = document.createElement('canvas');
      const f = Math.min(1, 4096 / (w * sk * q), 4096 / (h * sk * q));
      c.width = Math.max(1, Math.round(w * sk * q * f)); c.height = Math.max(1, Math.round(h * sk * q * f));
      try { c.getContext('2d').drawImage(I.im, 0, 0, c.width, c.height); } catch (e){ continue; }
      SPR[name] = { c, x0, y0, w, h, sk, ax: (MAAL[name] || [])[1] || 0, ay: (MAAL[name] || [])[2] || 0 };
    }
    /* ballonerne tegnes direkte, én for hvert tegn */
    const D = (BR + 16) * 2;
    for (const sym of Object.keys(TG)){ const c = document.createElement('canvas'); c.width = c.height = Math.round(D * q * 1.3); const x = c.getContext('2d'); x.scale(c.width / D, c.width / D); x.translate(D / 2, D / 2); ballon(x, sym, BR); BAL[sym] = c; }
    S.balD = D;
  }
  /* tegn et billede, så dets fod (ax, ay) står i x, y */
  function put(ctx, name, x, y, o){
    const p = SPR[name]; if (!p) return;
    const k = p.sk * ((o && o.s) || 1), ay = o && o.ay != null ? o.ay : p.ay;
    if (!o || (!o.r && !o.sx && !o.sy && o.a == null)){ ctx.drawImage(p.c, x + (p.x0 - p.ax) * k, y + (p.y0 - ay) * k, p.w * k, p.h * k); return; }
    ctx.save(); ctx.translate(x, y); if (o.r) ctx.rotate(o.r); if (o.sx || o.sy) ctx.scale(o.sx || 1, o.sy || 1); if (o.a != null) ctx.globalAlpha = o.a;
    ctx.drawImage(p.c, (p.x0 - p.ax) * k, (p.y0 - ay) * k, p.w * k, p.h * k); ctx.restore();
  }
  function glyf(ctx, sym, x, y, s, w, col = '#FFF', kant = E, del = 1){
    const p = TG[sym].p; ctx.lineCap = ctx.lineJoin = 'round';
    /* del < 1: kun den første del af stregen (til vejledningen, hvor tegnet bliver tegnet for øjnene af en) */
    let tot = 0; for (let i = 1; i < p.length; i++) tot += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    let left = tot * del, end = null; ctx.beginPath(); ctx.moveTo(x + p[0][0] * s, y + p[0][1] * s);
    for (let i = 1; i < p.length && left > 0; i++){ const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]), t = Math.min(1, left / d);
      end = [x + (p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t) * s, y + (p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t) * s]; ctx.lineTo(end[0], end[1]); left -= d; }
    if (kant){ ctx.strokeStyle = kant; ctx.lineWidth = w + 8; ctx.stroke(); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    return end;
  }
  function ballon(ctx, sym, r){
    const t = TG[sym], rx = r * .88;
    ctx.lineJoin = 'round'; ctx.strokeStyle = E; ctx.lineWidth = 4.5;
    ctx.fillStyle = t.c2; ctx.beginPath(); ctx.moveTo(-8, r + 10); ctx.lineTo(0, r - 4); ctx.lineTo(8, r + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    const g = ctx.createRadialGradient(-rx * .35, -r * .4, r * .08, 0, 0, r * 1.05); g.addColorStop(0, lt(t.c, .5)); g.addColorStop(.5, t.c); g.addColorStop(1, t.c2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, r, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-rx * .5, -r * .46, rx * .13, r * .24, .55, 0, 7); ctx.fill();
    if (sym === 'hjerte'){ const p = t.p, s = r * .52; ctx.beginPath(); p.forEach(([a, b], i) => i ? ctx.lineTo(a * s, b * s + 2) : ctx.moveTo(a * s, b * s + 2)); ctx.closePath();
      ctx.lineWidth = 9; ctx.strokeStyle = E; ctx.stroke(); ctx.fillStyle = '#FF4F7B'; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-s * .42, -s * .3, s * .14, s * .22, .6, 0, 7); ctx.fill(); }
    else glyf(ctx, sym, 0, 2, r * (sym === 'ring' ? .44 : .46), 8);
  }

  let S = null;
  /* kameraet: på en bred, lav skærm (en telefon) zoomes der ind mod bunden, så balloner og væsner bliver store nok.
     Her måles også, hvor knapperne i de øverste hjørner sidder, så væsnerne kommer ned imellem dem. */
  function kamera(){
    const cv = S.C.cv, w = cv.clientWidth || 800, h = cv.clientHeight || 500;
    S.Zn = Math.max(1, Math.min(1.3, (w / h) / 1.6)); if (S.Z == null || !S.boss) S.Z = S.boss ? 1 + (S.Zn - 1) * .45 : S.Zn;
    kameraFra();
  }
  /* ved en boss zoomes der ud (Z mod 1), så der er plads til den foroven. Her regnes alt det ud, der afhænger af zoomet */
  function kameraFra(){
    const C = S.C, cv = C.cv, [a, b] = C.visX();
    S.top = 1000 - 1000 / S.Z;
    S.x0 = 800 + (a - 800) / S.Z; S.x1 = 800 + (b - 800) / S.Z;
    const r = cv.getBoundingClientRect(), gx = px => 800 + ((px - r.left - C.V.ox) / C.V.k - 800) / S.Z, gy = py => 1000 + ((py - r.top - C.V.oy) / C.V.k - 1000) / S.Z;
    const tl = document.querySelector('#arkadeBody .place-ui.tl'), tr = document.querySelector('#arkadeBody .place-ui.tr');
    const rl = tl && tl.getBoundingClientRect(), rr = tr && tr.getBoundingClientRect();
    S.baneL = rl && rl.width ? Math.max(S.x0, gx(rl.right)) : S.x0; S.baneR = rr && rr.width ? Math.min(S.x1, gx(rr.left)) : S.x1;
    S.hudB = Math.max(S.top, rl && rl.height ? gy(rl.bottom) : S.top + 90);
    if (S.baneR - S.baneL < 700){ S.baneL = S.x0; S.baneR = S.x1; }
  }
  const pkt = e => { const p = S.C.toGame(e); return { x: 800 + (p.x - 800) / S.Z, y: 1000 + (p.y - 1000) / S.Z }; };
  const rnd = (a, b) => a + Math.random() * (b - a), vaelg = a => a[Math.floor(Math.random() * a.length)];

  function start(stage, api){
    const C = akCanvas(stage, BG); playMusic('tryl');
    const hero = heroState(), harDyr = !!(hero.pet && hero.pet.kind !== 'ingen');
    S = { api, C, t: 0, last: performance.now(), raf: 0, over: false, klar: false, score: 0, runde: 0, liv: 3, forvandlet: 0, cfg: null,
          foes: [], frie: [], dyr: [], parts: [], tekster: [], spor: [], streg: null, koe: [], tving: [], spawnT: 0, fase: 'hent', faseT: 0, kort: null,
          gave: null, gaveT: 0, hop: 0, blitz: 0, superSet: false, dyrHop: 0, kageHop: 0, ryst: 0, msg: '', msgT: 0, harDyr, boss: null, skud: [], bossNr: 0, Z: null, msg2: '',
          blink: Array.from({ length: 26 }, () => ({ x: rnd(-380, 1980), y: rnd(20, 560), p: rnd(0, 6), r: rnd(1.6, 3.2) })),
          ild: Array.from({ length: 9 }, () => ({ x: rnd(-300, 1900), y: rnd(700, 930), p: rnd(0, 6) })) };
    const me = S, cv = C.cv;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); if (S !== me || !S.klar || S.fase === 'tabt' || S.streg) return; try { cv.setPointerCapture(e.pointerId); } catch (x){} const p = pkt(e); S.streg = { id: e.pointerId, pts: [[p.x, p.y]] }; });
    cv.addEventListener('pointermove', e => { if (S !== me || !S.streg || e.pointerId !== S.streg.id) return; const p = pkt(e), a = S.streg.pts, l = a[a.length - 1];
      if (Math.hypot(p.x - l[0], p.y - l[1]) > 5 && a.length < 600){ a.push([p.x, p.y]); if (a.length % 3 === 0) gnist(p.x, p.y, '#FFE27A', 1, 60); } });
    const op = e => { if (S !== me || !S.streg || e.pointerId !== S.streg.id) return; const pts = S.streg.pts; S.streg = null; if (e.type === 'pointerup') tegnet(pts); };
    cv.addEventListener('pointerup', op); cv.addEventListener('pointercancel', op);
    S.onResize = () => { clearTimeout(S.rz); S.rz = setTimeout(() => { if (S === me) raster(); }, 200); }; window.addEventListener('resize', S.onResize);
    api.score(0); kamera();
    /* billederne: væsner, kage og have er de samme hver gang; heksen og kæledyret er spillerens egne */
    const B = billeder(), jobs = Object.keys(B).filter(k => !IMG[k]).map(k => hent(k, B[k]));
    const n = CLIPN; delete IMG.heks; delete IMG.kaeledyr; delete SPR.heks; delete SPR.kaeledyr;
    try { jobs.push(hent('heks', { vb: '150 40 500 1030', w: 500, h: 1030, svg: renderDoll(hero, { viewBox: '150 40 500 1030', pet: false }) }));
      if (harDyr) jobs.push(hent('kaeledyr', { vb: VB.pet, w: 280, h: 310, svg: renderDoll(hero, { viewBox: VB.pet, petOnly: true }) })); } catch (e){}
    CLIPN = n;
    Promise.all(jobs).then(() => { if (S !== me) return; raster(); S.klar = true; S.last = performance.now(); naesteRunde(); });
    S.raf = requestAnimationFrame(tick);
  }
  function stop(){ if (S){ S.over = true; cancelAnimationFrame(S.raf); clearTimeout(S.rz); window.removeEventListener('resize', S.onResize); S.C.dispose(); } S = null; }

  /* ---------- runderne ---------- */
  function naesteRunde(){
    S.runde++; const w = S.runde, cfg = S.cfg = rundeplan(w);
    if (w % 5 === 0) return bossStart(w);
    /* hvem kommer i denne runde: flest gnomer, og de store sjældnere. Et nyt slags væsen kommer altid med i sin første runde */
    const kan = Object.keys(SLAGS).filter(k => SLAGS[k].fra <= w), sum = kan.reduce((a, k) => a + SLAGS[k].tit, 0);
    S.koe = Array.from({ length: cfg.antal }, () => { let r = Math.random() * sum; for (const k of kan){ r -= SLAGS[k].tit; if (r <= 0) return k; } return 'gnom'; });
    if (w === 1) S.koe.fill('gnom');
    const ny = kan.find(k => SLAGS[k].fra === w && k !== 'gnom'); if (ny){ S.koe[Math.min(2, S.koe.length - 1)] = ny; S.koe[0] = 'gnom'; }
    S.tving = cfg.nyt.slice(); if (w === 1) S.tving = ['vand', 'lod', 'vand', 'lod'];
    S.spawnT = .6;
    /* gaveballonen med hjertet kommer forbi i nogle af runderne */
    S.gaveT = w >= 3 && Math.random() < .65 ? rnd(4, cfg.antal * cfg.gab * .8) : -1;
    if (cfg.nyt.length){ S.fase = 'kort'; S.faseT = w === 1 ? 14 : 9; S.kort = { nyt: cfg.nyt, ok: {}, t: 0, ud: 0 }; }
    else { S.fase = 'spil'; S.kort = null; S.msg = `Runde ${w}`; S.msgT = 1.6; }
    if (w > 1) SND.play('tryl.runde', () => sfx.magic());
  }
  const aktive = () => S.cfg ? S.cfg.tegn.concat(S.gave ? ['hjerte'] : []) : [];

  /* ---------- boss-runden ---------- */
  function bossStart(w){
    const nr = ++S.bossNr, def = BOSSER[(nr - 1) % BOSSER.length], cyk = Math.floor((nr - 1) / BOSSER.length);
    S.koe = []; S.tving = []; S.kort = null; S.spawnT = 99;
    S.gaveT = Math.random() < .6 ? rnd(10, 22) : -1;
    S.boss = { def, nr, x: 800, y: -300, t: 0, fase: 'ind', faseT: 2.4, hp: def.hp + cyk, hpMax: def.hp + cyk, komboN: Math.min(5, def.kombo + cyk),
      flyv: Math.max(2.2, 4.6 - .3 * (nr - 1)), gab: Math.max(.8, 2.1 - .2 * (nr - 1)), plan: [], kastI: 0, kastT: 1.2, lad: 0,
      kombo: [], komboI: 0, saarT: 0, ramtT: 0, pynt: [], snak: null, snakT: 0, besejrT: 0, glimt: 0 };
    S.boss.plan = lavPlan(S.boss);
    S.fase = 'spil'; S.msg = `BOSS: ${def.navn}!`; S.msg2 = `Tegn tegnene på det, den kaster, før det rammer kagen`; S.msgT = 3.2;
    SND.play('tryl.boss', () => { tone(110, .5, 'sawtooth', .05, 0, .6); tone(165, .5, 'sawtooth', .04, .15, .6); });
  }
  function bossSig(txt){ if (S.boss){ S.boss.snak = txt; S.boss.snakT = 2.2; } }
  /* en angrebsrunde: enkeltskud og bølger på skift, og til sidst et superangreb. Senere bosser kaster flere bølger */
  function lavPlan(B){
    const n = 4 + Math.min(3, B.nr), p = [];
    for (let i = 0; i < n - 1; i++) p.push(B.nr >= 5 ? (i % 3 === 2 ? 'enkelt' : 'boelge') : (i % 2 ? 'boelge' : 'enkelt'));
    p.push('super');
    return p;
  }
  function nytTegn(){ const brugt = new Set(S.skud.map(k => k.sym)), pulje = S.cfg.tegn.filter(t => !brugt.has(t)); return vaelg(pulje.length ? pulje : S.cfg.tegn); }
  function bossKast(m){
    const B = S.boss, d = B.def, M = MOENSTER[d.k], boelge = m === 'boelge';
    const n = boelge ? M.n + (B.nr > 8 ? 1 : 0) : d.antal + (B.nr > 8 ? 1 : 0);
    for (let i = 0; i < n; i++){
      const fra = boelge && M.fra ? M.fra[i % M.fra.length] : d.hand, x0 = B.x + fra[0], y0 = B.y + fra[1];
      const tx = BORD + (n > 1 ? (i - (n - 1) / 2) * (boelge ? M.spred : 120) : rnd(-70, 70)), ty = 760;
      const forsink = boelge ? i * M.forsink : i * .5;
      /* tegnene: forskellige på skud, der flyver samtidig, når det kan lade sig gøre */
      S.skud.push({ k: d.skud, bane: d.bane, sym: nytTegn(), x0, y0, tx, ty, x: x0, y: y0, T: B.flyv * (d.bane === 'ret' ? .9 : 1) * rnd(.95, 1.08) * (boelge ? 1.12 : 1), t: -forsink, plan: 0, rot: rnd(0, 6),
        ph: boelge && M.modfase ? i * Math.PI : rnd(0, 6) });
    }
    B.glimt = .3;
    SND.play('tryl.kast', () => tone(420, .14, 'triangle', .04, 0, .5));
    if (boelge){ bossSig(M.navn); tekst(B.x, B.y + 150, M.navn, SKUDFARVE[d.skud], 40); }
    else if (Math.random() < .35) bossSig(vaelg(d.snak));
  }
  /* superangrebet: først lader bossen op (lys, gnister der suges ind), så sendes kæmpekuglen af sted */
  function superStart(){
    const B = S.boss; B.lad = LAD;
    bossSig(SUPER[B.def.k]);
    if (!S.superSet){ S.superSet = true; S.msg = 'SUPERANGREB!'; S.msg2 = 'Tegn alle tegnene på kæmpekuglen, i rækkefølge'; S.msgT = 2.6; }
    SND.play('tryl.lad', () => [0, 1, 2, 3, 4, 5].forEach(i => tone(220 * Math.pow(1.19, i), .2, 'sawtooth', .025, i * .22, 1.05)));
  }
  function superKast(){
    const B = S.boss, d = B.def, n = Math.min(5, 3 + Math.floor((B.nr - 1) / 2));
    const p = S.cfg.tegn.slice(), syms = [];
    for (let i = 0; i < n; i++){ let t; do { t = vaelg(p); } while (p.length > 1 && i > 0 && t === syms[i - 1]); syms.push(t); }
    const x0 = B.x + d.hand[0], y0 = B.y + d.hand[1];
    S.skud.push({ k: d.skud, bane: 'stor', stor: true, syms, idx: 0, sym: syms[0], x0, y0, tx: BORD, ty: 740, x: x0, y: y0, T: B.flyv * 1.9, t: 0, plan: 0, rot: rnd(0, 6), ph: rnd(0, 6), krymp: 0 });
    B.glimt = .5; S.ryst = .35; S.blitz = .3;
    SND.play('tryl.super', () => { tone(90, .6, 'sawtooth', .06, 0, .5); tone(140, .5, 'square', .03, .05, .6); });
    for (let i = 0; i < 18; i++){ const a = i / 18 * 6.28; S.parts.push({ type: 'ring', x: x0, y: y0, t: 0, life: .5, r: 120, c: SKUDFARVE[d.skud] }); S.parts.push({ type: 'stjerne', x: x0, y: y0, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, t: 0, life: .6, r: rnd(8, 14), c: vaelg(['#FFF', '#FFE27A', SKUDFARVE[d.skud]]), rot: 0, g: 0 }); }
  }
  /* et tegn rammer kæmpekuglen: den skubbes lidt tilbage og bliver mindre; sidste tegn sprænger den */
  function superRamt(k){
    k.idx++; k.krymp = .25; k.t = Math.max(0, k.t - k.T * .1);
    const c = SKUDFARVE[k.k];
    S.parts.push({ type: 'ring', x: k.x, y: k.y, t: 0, life: .35, r: 110, c: '#FFF' }); gnist(k.x, k.y, c, 14, 380);
    if (k.idx >= k.syms.length){
      k.plan = S.t + .05; k.t0 = S.t; k.superPuf = true;
      S.score += 60; S.api.score(S.score); tekst(k.x, k.y - 40, 'SUPER!', '#FFE27A', 60); tekst(k.x, k.y + 14, '+60', '#FFF6D0', 40);
      S.blitz = .2; S.hop = .5;
    } else { k.sym = k.syms[k.idx]; S.score += 10; S.api.score(S.score); tekst(k.x, k.y - 120, '+10', '#FFF6D0', 34); SND.play('tryl.pop', () => sfx.pop()); }
  }
  function bossSaarbar(){
    const B = S.boss; B.fase = 'saarbar'; B.komboI = 0;
    const p = S.cfg.tegn.slice(); B.kombo = Array.from({ length: B.komboN }, (_, i) => { let t; do { t = vaelg(p); } while (p.length > 1 && i > 0 && t === B.kombo[i - 1]); B.kombo[i] = t; return t; });
    B.saarT = B.saarMax = 3 + 2.1 * B.komboN;
    S.msg = 'Den er svimmel!'; S.msg2 = 'Tegn tegnene over den, i rækkefølge'; S.msgT = 2.2;
    SND.play('tryl.svimmel', () => [660, 520, 400].forEach((f, i) => tone(f, .14, 'sine', .04, i * .12, .9)));
  }
  function bossRamt(){
    const B = S.boss; B.hp--; B.ramtT = 1.1; B.fase = 'ramt'; B.pynt.push(PYNT[B.pynt.length % PYNT.length]);
    S.score += 100; S.api.score(S.score); S.hop = .5; S.dyrHop = .5; S.ryst = .25;
    SND.play('tryl.ramt', () => sfx.fanfare());
    gnist(B.x, B.y - 60, '#FFE27A', 24, 420); for (let i = 0; i < 14; i++) S.parts.push({ type: 'hjerte', x: B.x, y: B.y - 60, vx: rnd(-420, 420), vy: rnd(-380, 200), t: 0, life: rnd(.7, 1.3), r: rnd(8, 15), c: vaelg(['#FF4F7B', '#FF8FC7', '#FFD86B']), g: 260 });
    tekst(B.x, B.y - 20, '+100', '#FFF6D0', 46); bossSig(vaelg(B.def.av));
  }
  function bossBesejret(){
    const B = S.boss; B.fase = 'besejret'; B.besejrT = 1.6; B.lad = 0;
    const p = 200 + 50 * B.nr; S.score += p; S.api.score(S.score); S.forvandlet++;
    SND.play('tryl.besejret', () => sfx.fanfare());
    for (let i = 0; i < 16; i++){ const a = i / 16 * 6.28; S.parts.push({ type: 'sky', x: B.x + Math.cos(a) * 80, y: B.y + Math.sin(a) * 80, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, t: 0, life: .9, r: rnd(40, 60), c: '#FFF' }); }
    gnist(B.x, B.y, '#FF8FC7', 30, 520); gnist(B.x, B.y, '#FFE27A', 24, 460);
    S.msg = `${B.def.navn} blev til ${B.def.sod}!`; S.msg2 = ''; S.msgT = 2.8; tekst(B.x, B.y + 40, '+' + p, '#FFF6D0', 56);
    for (const k of S.skud) if (!k.plan){ k.plan = S.t + rnd(.1, .4); k.t0 = S.t; }
  }
  /* et kasteskud er ramt af det rigtige tegn: det bliver til noget sødt */
  function skudPuf(k){
    const c = { bombe: ['#FF8FC7', '#FFE27A', '#7FD8FF', '#9BE36A'], ild: ['#FF8FC7', '#FFC2DE', '#FFF'], is: ['#FFFFFF', '#BFE8FF', '#7FD8FF'], blaek: ['#E8D2FF', '#FFFFFF', '#C79BFF'] }[k.k];
    if (k.stor){ SND.play('tryl.superpuf', () => sfx.fanfare()); for (let i = 0; i < 3; i++) S.parts.push({ type: 'ring', x: k.x, y: k.y, t: 0, life: .5 + i * .12, r: 120 + i * 50, c: i ? c[i % c.length] : '#FFF' });
      for (let i = 0; i < 30; i++){ const a = rnd(0, 6.28), v = rnd(200, 620); S.parts.push({ type: vaelg(['hjerte', 'stjerne', 'flis']), x: k.x, y: k.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0, life: rnd(.7, 1.2), r: rnd(9, 16), c: vaelg(c.concat(['#FF8FC7', '#FFE27A'])), rot: rnd(0, 6), g: 320 }); }
      return; }
    SND.play('tryl.pop', () => sfx.pop());
    S.parts.push({ type: 'ring', x: k.x, y: k.y, t: 0, life: .3, r: 50, c: '#FFF' });
    for (let i = 0; i < 14; i++){ const a = rnd(0, 6.28), v = rnd(120, 360); S.parts.push({ type: k.k === 'ild' ? 'hjerte' : k.k === 'is' ? 'stjerne' : k.k === 'blaek' ? 'sky' : 'flis', x: k.x, y: k.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: 0, life: rnd(.5, .9), r: k.k === 'blaek' ? rnd(6, 12) : rnd(6, 11), c: vaelg(c), rot: rnd(0, 6), g: 300 }); }
  }
  function skudPos(k){
    const p = Math.min(1, k.t / k.T), lx = k.x0 + (k.tx - k.x0) * p, ly = k.y0 + (k.ty - k.y0) * p;
    if (k.bane === 'bue') return [lx, ly - 220 * 4 * p * (1 - p)];
    if (k.bane === 'stor') return [lx + Math.sin(k.t * 1.6 + k.ph) * 60 * (1 - p), ly - 90 * 4 * p * (1 - p)];
    if (k.bane === 'zigzag') return [lx + Math.sin(p * Math.PI * 4 + k.ph) * 150 * (1 - p), ly];
    return [lx + Math.sin(p * Math.PI * 3 + k.ph) * 40, ly];
  }
  function bossFrem(dt){
    const B = S.boss; B.t += dt; if (B.snakT > 0) B.snakT -= dt; if (B.glimt > 0) B.glimt -= dt;
    const hoverY = Math.max(S.hudB + 230, S.top + 300), span = Math.max(80, (S.baneR - S.baneL) / 2 - 240);
    if (B.fase === 'ind'){ B.faseT -= dt; const k = Math.min(1, 1 - B.faseT / 2.4), e = 1 - Math.pow(1 - k, 3); B.y = -300 + (hoverY + 300) * e; B.x = 800; if (B.faseT <= 0){ B.fase = 'angreb'; bossSig(B.def.snak[1]); } return; }
    if (B.fase === 'besejret'){ B.besejrT -= dt; if (B.besejrT <= 0){ S.dyr.push({ k: 'sod_' + B.def.k, x: B.x, y: B.y, t: 0, vx: rnd(-40, 40), vy: -170, ph: 0 }); S.boss = null; } return; }
    /* den svæver frem og tilbage. Er den svimmel, står den stille og vugger */
    const fart = B.fase === 'saarbar' || B.lad > 0 ? 0 : 1; B.vt = (B.vt || 0) + dt * fart;
    B.x = 800 + Math.sin(B.vt * .45) * span; B.y = hoverY + Math.sin(B.t * 1.3) * 14;
    if (B.fase === 'angreb'){
      if (B.lad > 0){
        B.lad -= dt;
        /* gnister suges ind mod hånden, mens den lader op */
        if (Math.random() < dt * 40){ const a = rnd(0, 6.28), r = rnd(180, 300), hx = B.x + B.def.hand[0], hy = B.y + B.def.hand[1];
          S.parts.push({ type: 'stjerne', x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r, vx: -Math.cos(a) * r * 2.2, vy: -Math.sin(a) * r * 2.2, t: 0, life: .42, r: rnd(6, 11), c: vaelg(['#FFF', '#FFE27A', SKUDFARVE[B.def.skud]]), rot: 0, g: 0 }); }
        if (B.lad <= 0){ B.lad = 0; superKast(); B.kastT = B.gab; }
      } else {
        B.kastT -= dt;
        if (B.kastI < B.plan.length && B.kastT <= 0){ const m = B.plan[B.kastI++]; if (m === 'super') superStart(); else { bossKast(m); B.kastT = B.gab * (m === 'boelge' ? 1.7 : 1) * rnd(.85, 1.15); } }
        if (B.kastI >= B.plan.length && !S.skud.length){ bossSaarbar(); }
      }
    } else if (B.fase === 'saarbar'){
      B.saarT -= dt;
      if (B.saarT <= 0){ B.fase = 'angreb'; B.plan = lavPlan(B); B.kastI = 0; B.kastT = 1; bossSig(B.def.grin); SND.play('tryl.grin', () => [300, 360, 300].forEach((f, i) => tone(f, .1, 'square', .03, i * .1, 1))); }
    } else if (B.fase === 'ramt'){
      B.ramtT -= dt;
      if (B.ramtT <= 0){ if (B.hp <= 0) bossBesejret(); else { B.fase = 'angreb'; B.plan = lavPlan(B); B.kastI = 0; B.kastT = 1.2; B.gab = Math.max(.75, B.gab * .9); } }
    }
  }

  function spawn(k){
    const def = SLAGS[k], n = def.bal, m = BR + 8 + (n - 1) * 44 + def.svaj, lo = S.baneL + m, hi = Math.max(S.baneL + m + 10, S.baneR - m);
    let x = 800; for (let i = 0; i < 12; i++){ x = rnd(lo, hi); if (!S.foes.some(f => f.st === 'ned' && f.y < S.top + 380 && Math.abs(f.x - x) < 130 + (n + f.bal.length) * 34)) break; }
    /* tegnene på ballonerne: forskellige, når der er nok at vælge imellem. Et nyt tegn kommer på de første balloner i runden */
    const pulje = S.cfg.tegn.slice().sort(() => Math.random() - .5), syms = Array.from({ length: n }, (_, i) => pulje[i % pulje.length]);
    if (S.tving.length) syms[0] = S.tving.shift();
    /* farten passes til, så turen ned tager lige lang tid på en telefon (hvor der er zoomet ind) som på en tablet */
    const land = GULV - (96 - GREB) * def.sk, y = S.top - 60, v = S.cfg.fart * def.fart * rnd(.93, 1.08) * (land - y) / 900;
    S.foes.push({ k, x, x0: x, y, v, st: 'ned', t: 0, ups: 0, ph: rnd(0, 6), sf: rnd(.7, 1.2), sa: def.svaj, side: 1, lo: S.x0 + 70, hi: S.x1 - 70, land,
      bal: BPOS[n].map(([dx, dy], i) => ({ sym: syms[i], dx, dy, ph: rnd(0, 6), pop: false, plan: 0 })) });
  }

  /* ---------- når en streg er tegnet færdig ---------- */
  function midte(pts){ let x = 0, y = 0; for (const p of pts){ x += p[0]; y += p[1]; } return [x / pts.length, y / pts.length]; }
  function tegnet(pts){
    if (pts.length < 3) return;
    const sym = trylGenkend(pts, aktive()), [mx, my] = midte(pts);
    if (!sym){ S.spor.push({ pts, t: 0, ok: false, c: '#B8B0D0' }); SND.play('tryl.fuser', () => tone(180, .12, 'sine', .035, 0, .6)); for (let i = 0; i < 5; i++) S.parts.push({ type: 'sky', x: mx + rnd(-40, 40), y: my + rnd(-30, 30), vx: rnd(-30, 30), vy: rnd(10, 60), t: 0, life: .6, r: rnd(10, 18), c: '#B8B0D0' }); return; }
    const c = TG[sym].c; S.spor.push({ pts, t: 0, ok: true, c });
    /* i vejledningen øver man tegnet */
    if (S.fase === 'kort' && S.kort.nyt.includes(sym) && !S.kort.ok[sym]){ S.kort.ok[sym] = true; S.hop = .4; SND.play('tryl.puf', () => sfx.twinkle()); gnist(mx, my, c, 14, 260);
      if (S.kort.nyt.every(k => S.kort.ok[k])) S.faseT = Math.min(S.faseT, .9); return; }
    if (sym === 'hjerte' && S.gave){ hjertebrag(); return; }
    /* bossen: er den svimmel, og er det næste tegn i rækken, rykker man et skridt frem */
    let bossOk = false;
    if (S.boss && S.boss.fase === 'saarbar' && S.boss.kombo[S.boss.komboI] === sym){
      const B = S.boss; B.komboI++; bossOk = true; S.hop = .4; gnist(B.x, B.y - 120, c, 12, 280); SND.play('tryl.puf', () => sfx.twinkle());
      if (B.komboI >= B.kombo.length) bossRamt();
    }
    const store = S.skud.filter(k => k.stor && !k.plan && k.t >= 0 && k.sym === sym);
    store.forEach(superRamt);
    const skud = S.skud.filter(k => !k.stor && !k.plan && k.t >= 0 && k.sym === sym);
    skud.forEach((k, i) => { k.plan = S.t + .04 + i * .06; k.t0 = S.t; });
    if (skud.length){ const q = 10 * skud.length; S.score += q; S.api.score(S.score); tekst(mx, my - 10, '+' + q, '#FFF6D0', 34); }
    const ramt = [];
    for (const f of S.foes){ if (f.st !== 'ned') continue; for (const b of f.bal){ if (!b.pop && !b.plan && b.sym === sym && f.y + b.dy > S.top - BR * .4) ramt.push([f, b]); } }
    if (!ramt.length){ if (!bossOk && !skud.length && !store.length){ gnist(mx, my, c, 6, 160); tone(900, .05, 'triangle', .02, 0, 1.3); } else gnist(mx, my, c, 10, 240); return; }
    ramt.sort((a, b) => Math.hypot(a[0].x + a[1].dx - mx, a[0].y + a[1].dy - my) - Math.hypot(b[0].x + b[1].dx - mx, b[0].y + b[1].dy - my));
    ramt.forEach(([f, b], i) => { b.plan = S.t + .05 + i * .075; b.t0 = S.t; });
    const n = ramt.length, p = 5 * n * (n + 1); S.score += p; S.api.score(S.score); S.hop = .42;
    gnist(mx, my, c, 10, 240);
    tekst(mx, my - 30, n >= 4 ? 'Kæmpe trylleri!' : n === 3 ? 'Tredobbelt!' : n === 2 ? 'Dobbelt!' : '', c, 46);
    tekst(mx, my + (n > 1 ? 16 : -10), '+' + p, '#FFF6D0', n > 1 ? 40 : 34);
  }
  function hjertebrag(){
    const g = S.gave; S.gave = null; S.score += 100; S.api.score(S.score); S.hop = .5; S.dyrHop = .5;
    SND.play('tryl.gave', () => sfx.fanfare());
    for (let i = 0; i < 26; i++) S.parts.push({ type: 'hjerte', x: g.x, y: g.y, vx: rnd(-520, 520), vy: rnd(-460, 300), t: 0, life: rnd(.8, 1.5), r: rnd(9, 18), c: vaelg(['#FF4F7B', '#FF8FC7', '#FFD86B']), g: 240 });
    gnist(g.x, g.y, '#FFD86B', 20, 420);
    let i = 0; for (const f of S.foes){ if (f.st !== 'ned' || f.y < S.top - 40) continue; for (const b of f.bal){ if (!b.pop && !b.plan){ b.plan = S.t + .15 + i * .05; b.t0 = S.t; i++; } } }
    for (const k of S.skud) if (!k.plan){ k.plan = S.t + .15 + i * .05; k.t0 = S.t; i++; }
    tekst(g.x, g.y + 70, 'Hjertetrylleri!', '#FF8FC7', 56); tekst(g.x, g.y + 122, '+100', '#FFF6D0', 40);
  }
  function pop(f, b){
    b.pop = true; const x = f.x + b.dx, y = f.y + b.dy, c = TG[b.sym].c;
    SND.play('tryl.pop', () => sfx.pop());
    S.parts.push({ type: 'ring', x, y, t: 0, life: .3, r: BR, c: '#FFF' });
    for (let i = 0; i < 9; i++){ const a = i / 9 * 6.28 + rnd(-.3, .3), v = rnd(180, 380); S.parts.push({ type: 'flis', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rnd(.4, .7), r: rnd(7, 12), c, rot: rnd(0, 6), g: 500 }); }
    gnist(x, y, '#FFF6D0', 5, 220);
    f.ups = .5; f.y += 5;
    if (f.bal.every(q => q.pop)) forvandl(f);
  }
  function forvandl(f){
    f.st = 'vaek'; const sk = SLAGS[f.k].sk, x = f.x, y = f.y + 92 * sk;
    SND.play('tryl.puf', () => sfx.twinkle()); S.forvandlet++; S.dyrHop = .4;
    S.score += 5 * SLAGS[f.k].bal; S.api.score(S.score);
    for (let i = 0; i < 8; i++){ const a = i / 8 * 6.28; S.parts.push({ type: 'sky', x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 26, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90 - 20, t: 0, life: .55, r: rnd(22, 34), c: '#FFF' }); }
    gnist(x, y, vaelg(['#FF8FC7', '#FFE27A', '#7FD8FF', '#C79BFF']), 12, 300);
    S.dyr.push({ k: vaelg(DYR), x, y, t: 0, vx: rnd(-70, 70), vy: rnd(-150, -110), ph: rnd(0, 6) });
  }
  /* et væsen er landet: det slipper ballonerne og løber hen til kagen */
  function lande(f){
    for (const b of f.bal) if (!b.pop) S.frie.push({ sym: b.sym, x: f.x + b.dx, y: f.y + b.dy, vy: -220, t: 0, ph: b.ph });
    f.bal = []; f.st = 'loeb'; f.t = 0; f.side = f.x < BORD ? -1 : 1;
    SND.play('tryl.lande', () => tone(140, .08, 'sine', .05, 0, .6));
    for (let i = 0; i < 4; i++) S.parts.push({ type: 'sky', x: f.x + rnd(-20, 20), y: GULV, vx: rnd(-60, 60), vy: rnd(-40, -10), t: 0, life: .4, r: rnd(8, 14), c: '#CDE8D0' });
  }
  function bid(f, txt){
    if (S.liv <= 0 || S.fase === 'tabt') return;
    S.liv--; S.ryst = .3; S.kageHop = .35; SND.play('tryl.nam', () => sfx.nope());
    const y = GULV - 90 - S.liv * 40;
    for (let i = 0; i < 14; i++) S.parts.push({ type: 'flis', x: BORD + rnd(-50, 50), y: y + rnd(-20, 20), vx: rnd(-260, 260), vy: rnd(-380, -80), t: 0, life: rnd(.5, .9), r: rnd(5, 10), c: vaelg(['#F6D9A8', '#FF8FC7', '#FFF', '#B79BFF']), rot: rnd(0, 6), g: 700 });
    tekst(f.x, f.y - 20, txt || 'NAM!', '#FF8FC7', 54);
    if (S.liv <= 0){ S.fase = 'tabt'; S.faseT = 2.1; S.streg = null; S.gave = null; S.msg = 'Kagen er spist!'; S.msgT = 9; }
  }
  function gnist(x, y, c, n, v){ for (let i = 0; i < n; i++){ const a = rnd(0, 6.28), s = rnd(v * .3, v); S.parts.push({ type: 'stjerne', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: rnd(.35, .75), r: rnd(5, 11), c, rot: rnd(0, 6), g: 120 }); } }
  function tekst(x, y, txt, c, size){ if (!txt) return; S.tekster.push({ x: Math.max(S.x0 + 170, Math.min(S.x1 - 170, x)), y: Math.max(S.hudB + 60, y), txt, c, size, t: 0 }); }

  /* ---------- et billede frem ---------- */
  function tick(now){
    if (!S || S.over) return;
    const dt = Math.min(.05, (now - S.last) / 1000) * (window.TRYL_FART || 1); S.last = now; S.t += dt;
    if (S.klar) frem(dt);
    if (!S || S.over) return;
    tegn();
    S.raf = requestAnimationFrame(tick);
  }
  function frem(dt){
    const zt = S.boss ? 1 + (S.Zn - 1) * .45 : S.Zn; if (Math.abs(S.Z - zt) > .002){ S.Z += (zt - S.Z) * Math.min(1, dt * 2.5); if (Math.abs(S.Z - zt) <= .002) S.Z = zt; kameraFra(); }
    const x0 = S.x0, x1 = S.x1;
    if (S.boss && S.fase !== 'tabt') bossFrem(dt);
    if (S.blitz > 0) S.blitz -= dt;
    for (const k of S.skud){ k.t += dt; if (k.krymp > 0) k.krymp -= dt;
      if (k.t < 0){ k.x = k.x0; k.y = k.y0; continue; }
      if (k.stor && !k.plan && Math.random() < dt * 30) S.parts.push({ type: 'stjerne', x: k.x + rnd(-50, 50), y: k.y + rnd(-50, 50), vx: rnd(-40, 40), vy: rnd(-90, -20), t: 0, life: .5, r: rnd(5, 10), c: vaelg(['#FFF', '#FFE27A', SKUDFARVE[k.k]]), rot: 0, g: 0 });
      const [x, y] = skudPos(k); k.x = x; k.y = y;
      if (k.plan && S.t >= k.plan){ k.dod = true; skudPuf(k); }
      else if (k.t >= k.T && !k.dod){ k.dod = true; S.ryst = .3; for (let i = 0; i < 10; i++) S.parts.push({ type: k.k === 'blaek' ? 'sky' : 'flis', x: k.x, y: k.y, vx: rnd(-240, 240), vy: rnd(-300, -60), t: 0, life: .7, r: rnd(6, 12), c: k.k === 'blaek' ? '#6A3A9A' : k.k === 'is' ? '#BFE8FF' : '#F2552A', rot: 0, g: 600 }); bid({ x: k.x, y: k.y - 40 }, (k.stor ? 'KÆMPE-' : '') + (k.k === 'bombe' ? 'BOM!' : k.k === 'is' ? 'FRYS!' : k.k === 'ild' ? 'AV, VARMT!' : 'SPLAT!')); if (k.stor) S.ryst = .6; } }
    S.skud = S.skud.filter(k => !k.dod);
    S.faseT -= dt; for (const k of ['hop', 'dyrHop', 'kageHop', 'ryst', 'msgT']) if (S[k] > 0) S[k] -= dt;
    if (S.fase === 'kort'){ S.kort.t += dt; if (S.faseT <= 0){ S.fase = 'spil'; S.kort.ud = .35; } }
    if (S.kort && S.kort.ud > 0){ S.kort.ud -= dt; if (S.kort.ud <= 0) S.kort = null; }
    if (S.fase === 'spil'){
      S.spawnT -= dt;
      if (S.spawnT <= 0 && S.koe.length){ spawn(S.koe.shift()); S.spawnT = S.cfg.gab * rnd(.75, 1.25); }
      if (S.gaveT > 0){ S.gaveT -= dt; if (S.gaveT <= 0 && !S.gave){ const d = Math.random() < .5 ? 1 : -1; S.gave = { x: d > 0 ? x0 - 110 : x1 + 110, y: S.hudB + 96, d, t: 0 }; } }
      if (!S.koe.length && !S.foes.some(f => f.st !== 'flygt') && !S.boss && !S.skud.length){
        S.fase = 'slut'; S.faseT = 1.7; S.score += 50; S.api.score(S.score); S.msg = 'Runde klaret!'; S.msgT = 1.5; tekst(800, (S.top + 1000) / 2 + 40, '+50', '#FFF6D0', 44);
        /* efter hver tredje runde bager heksen en ny etage, hvis der mangler en */
        if (S.runde % 3 === 0 && S.liv < 3){ S.liv++; S.kageHop = .5; S.msg = 'En ny etage på kagen!'; gnist(BORD, GULV - 190, '#FFE27A', 22, 380); SND.play('tryl.nyt', () => sfx.magic()); }
      }
    } else if (S.fase === 'slut'){ if (S.faseT <= 0) naesteRunde(); }
    else if (S.fase === 'tabt'){ if (S.faseT <= 0){ S.over = true; const api = S.api, n = S.score, w = S.runde, m = S.forvandlet; tegn(); api.end(n, `Du nåede runde ${w} og forvandlede ${m} ${m === 1 ? 'væsen' : 'væsner'}.`); return; } }
    if (S.gave){ const g = S.gave; g.t += dt; g.x += g.d * 135 * dt; g.y = S.hudB + 96 + Math.sin(g.t * 1.4) * 22; if ((g.d > 0 && g.x > x1 + 130) || (g.d < 0 && g.x < x0 - 130)) S.gave = null; }
    for (const f of S.foes){
      f.t += dt; if (f.ups > 0) f.ups -= dt;
      if (f.st === 'ned'){
        f.y += f.v * (f.t < .55 ? 3.4 : 1) * dt; f.x = Math.max(f.lo, Math.min(f.hi, f.x0 + Math.sin(f.t * f.sf + f.ph) * f.sa));
        for (const b of f.bal) if (b.plan && !b.pop && S.t >= b.plan) pop(f, b);
        if (f.st === 'ned' && f.y >= f.land){ f.y = f.land; lande(f); }
      } else if (f.st === 'loeb'){
        const maal = BORD + f.side * 128, d = maal - f.x; f.x += Math.sign(d) * Math.min(Math.abs(d), 470 * dt);
        if (S.fase === 'tabt' || S.liv <= 0){ f.st = 'jubel'; f.t = 0; }
        else if (Math.abs(d) < 3){ f.st = 'spis'; f.t = 0; bid(f); }
      } else if (f.st === 'spis'){ if (f.t > .8 && S.fase !== 'tabt'){ f.st = 'flygt'; f.t = 0; } }
      else if (f.st === 'flygt'){ f.x += f.side * 560 * dt; if (f.x < x0 - 150 || f.x > x1 + 150) f.st = 'vaek'; }
    }
    S.foes = S.foes.filter(f => f.st !== 'vaek');
    for (const b of S.frie){ b.t += dt; b.vy -= 160 * dt; b.y += b.vy * dt; b.x += Math.sin(b.t * 3 + b.ph) * 40 * dt; }
    S.frie = S.frie.filter(b => b.y > S.top - 160);
    for (const d of S.dyr){ d.t += dt; d.x += (d.vx + Math.sin(d.t * 2.6 + d.ph) * 90) * dt; d.y += d.vy * dt; d.vy -= 40 * dt; }
    S.dyr = S.dyr.filter(d => d.y > S.top - 120);
    for (const p of S.parts){ p.t += dt; if (p.vx != null){ p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; p.vx *= 1 - 1.6 * dt; } }
    S.parts = S.parts.filter(p => p.t < p.life); if (S.parts.length > 420) S.parts.splice(0, S.parts.length - 420);
    for (const s of S.spor) s.t += dt; S.spor = S.spor.filter(s => s.t < .5);
    for (const t of S.tekster){ t.t += dt; t.y -= 46 * dt; } S.tekster = S.tekster.filter(t => t.t < 1.25);
  }

  /* ---------- tegning ---------- */
  function streg(ctx, pts, lag){
    if (pts.length < 2) return;
    ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    for (const [c, w, a] of lag){ ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  function bal(ctx, sym, x, y, s = 1){ const c = BAL[sym]; if (!c) return; const D = S.balD * s; ctx.drawImage(c, x - D / 2, y - D / 2, D, D); }
  function hjerteform(ctx, x, y, r){ ctx.beginPath(); ctx.moveTo(x, y + r); ctx.bezierCurveTo(x - r * 1.7, y - r * .2, x - r * .7, y - r * 1.4, x, y - r * .45); ctx.bezierCurveTo(x + r * .7, y - r * 1.4, x + r * 1.7, y - r * .2, x, y + r); }
  function skilt(ctx, txt, x, y, size, c){ ctx.font = `700 ${size}px ${FONT_C}`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = E; ctx.lineWidth = Math.max(7, size * .2); ctx.strokeText(txt, x, y); ctx.fillStyle = c; ctx.fillText(txt, x, y); }

  function tegn(){
    const { ctx, begin } = S.C, x0 = S.x0, x1 = S.x1, t = S.t, Z = S.Z || 1;
    begin();
    if (!S.klar){ skilt(ctx, 'Tryller …', 800, 500, 46, '#FFE27A'); return; }
    ctx.translate(800, 1000); ctx.scale(Z, Z); ctx.translate(-800, -1000);
    if (S.ryst > 0) ctx.translate(rnd(-1, 1) * S.ryst * 26, rnd(-1, 1) * S.ryst * 20);
    put(ctx, 'bg', 0, 0);
    ctx.fillStyle = '#184A3C'; ctx.fillRect(-420, 998, 2440, 420);                    /* på høje skærme fortsætter plænen nedad */
    /* stjerner der blinker, lygter der ånder og ildfluer */
    ctx.fillStyle = '#FFF6D8';
    for (const b of S.blink){ const a = .5 + .5 * Math.sin(t * 2.2 + b.p); ctx.globalAlpha = a; akStar(ctx, b.x, b.y, b.r * (1.6 + a * 1.6), 0); ctx.fill(); }
    for (const lx of [170, 1430]){ const a = .16 + .07 * Math.sin(t * 5 + lx) + .04 * Math.sin(t * 13 + lx); const g = ctx.createRadialGradient(lx, 566, 0, lx, 566, 170); g.addColorStop(0, `rgba(255,217,138,${a})`); g.addColorStop(1, 'rgba(255,217,138,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(lx - 170, 396, 340, 340); }
    ctx.fillStyle = '#F4FF9A';
    for (const f of S.ild){ const x = f.x + Math.sin(t * .5 + f.p) * 70, y = f.y + Math.cos(t * .7 + f.p * 2) * 28, a = .4 + .4 * Math.sin(t * 3 + f.p); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill(); ctx.globalAlpha = a * .22; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    /* gaveballonen */
    if (S.gave){ const g = S.gave, r = BR * 1.2, gl = .5 + .5 * Math.sin(t * 5);
      const gg = ctx.createRadialGradient(g.x, g.y, r * .5, g.x, g.y, r * 2.1); gg.addColorStop(0, `rgba(255,216,107,${.3 + gl * .2})`); gg.addColorStop(1, 'rgba(255,216,107,0)'); ctx.fillStyle = gg; ctx.fillRect(g.x - r * 2.2, g.y - r * 2.2, r * 4.4, r * 4.4);
      bal(ctx, 'hjerte', g.x, g.y, 1.2); put(ctx, 'gave', g.x, g.y + r + 6, { r: Math.sin(t * 2.4) * .1 });
      skilt(ctx, 'Tegn et hjerte!', Math.max(x0 + 170, Math.min(x1 - 170, g.x)), g.y + r + 132, 30, '#FFD86B'); }
    /* det, væsnerne blev til, og balloner der er sluppet fri */
    for (const d of S.dyr){ const ind = Math.min(1, d.t / .25), fl = d.k.startsWith('sommerfugl') ? .3 + .7 * Math.abs(Math.sin(d.t * 13)) : 1;
      put(ctx, d.k, d.x, d.y, { s: .4 + .6 * ind, r: Math.sin(d.t * 5 + d.ph) * .18, sx: fl, sy: 1, a: Math.min(1, Math.max(0, (d.y - S.top + 110) / 170)) }); }
    for (const b of S.frie){ ctx.strokeStyle = 'rgba(242,238,220,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(b.x, b.y + BR + 8); ctx.quadraticCurveTo(b.x + Math.sin(b.t * 6) * 10, b.y + BR + 40, b.x, b.y + BR + 66); ctx.stroke(); bal(ctx, b.sym, b.x, b.y); }
    if (S.boss) tegnBoss(ctx);
    /* væsnerne i luften, de øverste først */
    const ned = S.foes.filter(f => f.st === 'ned').sort((a, b) => a.y - b.y);
    for (const f of ned){
      const sw = Math.sin(t * 1.7 + f.ph) * .06 + (f.ups > 0 ? Math.sin(f.ups * 38) * .16 * (f.ups / .5) : 0);
      const pos = f.bal.map(b => b.pop ? null : [f.x + b.dx + Math.sin(t * 1.3 + b.ph) * 5, f.y + b.dy + Math.cos(t * 1.1 + b.ph) * 4]);
      ctx.strokeStyle = 'rgba(242,238,220,.9)'; ctx.lineWidth = 2.5;
      for (const p of pos){ if (!p) continue; ctx.beginPath(); ctx.moveTo(p[0], p[1] + BR + 8); ctx.quadraticCurveTo(p[0], f.y - 16, f.x, f.y - 6); ctx.stroke(); }
      f.bal.forEach((b, i) => { if (pos[i]) bal(ctx, b.sym, pos[i][0], pos[i][1], b.plan ? 1 + .22 * Math.min(1, (t - b.t0) / Math.max(.01, b.plan - b.t0)) : 1); });
      put(ctx, f.k + (f.ups > 0 ? '!' : ''), f.x, f.y, { r: sw });
    }
    /* kagen med levende lys */
    const kh = S.kageHop > 0 ? Math.sin(Math.min(1, S.kageHop / .35) * Math.PI) : 0;
    put(ctx, 'kage' + Math.max(0, Math.min(3, S.liv)), BORD, 890, { sx: 1 + kh * .07, sy: 1 - kh * .09 });
    if (S.liv === 3) for (const dx of [-16.8, 0, 16.8]){ const fx = BORD + dx, fy = 890 - 271 * .7, fl = 1 + .2 * Math.sin(t * 17 + dx) + .1 * Math.sin(t * 29 + dx * 2);
      ctx.fillStyle = 'rgba(255,200,90,.2)'; ctx.beginPath(); ctx.arc(fx, fy - 8, 18, 0, 7); ctx.fill();
      ctx.fillStyle = '#FFB347'; ctx.strokeStyle = E; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy - 18 * fl); ctx.quadraticCurveTo(fx + 8, fy - 5, fx, fy); ctx.quadraticCurveTo(fx - 8, fy - 5, fx, fy - 18 * fl); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFF6A0'; ctx.beginPath(); ctx.arc(fx, fy - 5, 2.6, 0, 7); ctx.fill(); }
    haveskilt(ctx);
    /* heksen og kæledyret (spillerens egne) */
    const hh = S.hop > 0 ? Math.sin((1 - S.hop / .42) * Math.PI) : 0, dh = S.dyrHop > 0 ? Math.sin((1 - S.dyrHop / .4) * Math.PI) : 0;
    ctx.fillStyle = 'rgba(8,30,24,.4)'; ctx.beginPath(); ctx.ellipse(HEKS_X, GULV + 8, 64 - hh * 14, 11, 0, 0, 7); ctx.fill();
    put(ctx, 'heks', HEKS_X, GULV + 8 - hh * 36, { r: Math.sin(t * 1.6) * .012 + hh * .05, sy: 1 + Math.sin(t * 2.2) * .008 });
    if (S.harDyr){ ctx.beginPath(); ctx.ellipse(DYR_X, GULV + 8, 46 - dh * 10, 9, 0, 0, 7); ctx.fill(); put(ctx, 'kaeledyr', DYR_X, GULV + 10 - dh * 30, { sy: 1 + Math.sin(t * 2.6) * .012, r: dh * -.06 }); }
    /* dem, der er landet */
    for (const f of S.foes){ if (f.st === 'ned') continue; const sk = SLAGS[f.k].sk; let y = f.y + (96 - GREB) * sk, r = 0, sy = 1, bil = f.k + (Math.sin(f.t * 13) > 0 ? '_1' : '_2');
      if (f.st === 'loeb' || f.st === 'flygt'){ y -= Math.abs(Math.sin(f.t * 13)) * 16; r = Math.sin(f.t * 13) * .12; }
      else if (f.st === 'spis'){ sy = 1 + Math.sin(f.t * 22) * .06; r = Math.sin(f.t * 9) * .05; bil = f.k + (Math.sin(f.t * 11) > 0 ? '_1' : '_2'); }
      else if (f.st === 'jubel'){ y -= Math.abs(Math.sin(f.t * 8 + f.ph)) * 26; bil = f.k; }   /* jubel: armene i vejret */
      ctx.fillStyle = 'rgba(8,30,24,.35)'; ctx.beginPath(); ctx.ellipse(f.x, GULV + 4, 40 * sk / .66, 8, 0, 0, 7); ctx.fill();
      put(ctx, bil, f.x, y, { r, sy, ay: 96 }); }
    /* det, bossen kaster, med tegnet på */
    for (const k of S.skud){ if (k.t < 0) continue; if (k.stor){ tegnStor(ctx, k); continue; }
      const p = Math.min(1, k.t / k.T), sp = k.plan ? 1 + .3 * Math.min(1, (t - k.t0) / Math.max(.01, k.plan - k.t0)) : 1;
      let r = 0; if (k.k === 'bombe') r = k.t * 2.2 + k.rot; else if (k.k === 'is') r = k.t * 7; else if (k.k === 'ild'){ const [nx, ny] = skudPos({ ...k, t: k.t + .02 }); r = Math.atan2(ny - k.y, nx - k.x) + Math.PI; }
      if (p > .7){ ctx.fillStyle = `rgba(255,80,80,${(p - .7) * 1.2 * (.5 + .5 * Math.sin(t * 20))})`; ctx.beginPath(); ctx.arc(k.x, k.y, 72, 0, 7); ctx.fill(); }
      put(ctx, 'skud_' + k.k, k.x, k.y, { r, s: 1.25 * sp * (k.k === 'blaek' ? 1 + Math.sin(k.t * 9) * .06 : 1) });
      if (k.k === 'bombe'){ const fx = k.x + Math.cos(r - Math.PI / 2 + .5) * 66, fy = k.y + Math.sin(r - Math.PI / 2 + .5) * 66; ctx.fillStyle = '#FFE27A'; akStar(ctx, fx, fy, 9 + Math.sin(t * 30) * 3, t * 10); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.strokeStyle = E; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(k.x, k.y, 36 * sp, 0, 7); ctx.fill(); ctx.stroke();
      glyf(ctx, k.sym, k.x, k.y + (k.sym === 'hjerte' ? 2 : 0), 20 * sp, 7, TG[k.sym].c, E); }
    /* gnister, krummer og skyer */
    for (const p of S.parts){ const k = p.t / p.life, a = 1 - k;
      if (p.type === 'ring'){ ctx.globalAlpha = a; ctx.strokeStyle = p.c; ctx.lineWidth = 7 * a + 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + k * .9), 0, 7); ctx.stroke(); }
      else if (p.type === 'sky'){ ctx.globalAlpha = a * .85; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + k * .8), 0, 7); ctx.fill(); }
      else if (p.type === 'stjerne'){ ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = p.c; akStar(ctx, p.x, p.y, p.r * (1 - k * .5), p.rot + p.t * 6); ctx.fill(); }
      else if (p.type === 'hjerte'){ ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = p.c; hjerteform(ctx, p.x, p.y, p.r); ctx.fill(); }
      else { ctx.globalAlpha = Math.min(1, a * 1.8); ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.t * 9); ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .66); ctx.restore(); } }
    ctx.globalAlpha = 1;
    if (S.blitz > 0){ ctx.globalAlpha = Math.min(.55, S.blitz * 2); ctx.fillStyle = '#FFF6E0'; ctx.fillRect(S.x0 - 50, S.top - 50, S.x1 - S.x0 + 100, 1100 - S.top); ctx.globalAlpha = 1; }
    /* stregen: den man tegner nu, og dem der lige er tryllet med */
    for (const s of S.spor){ const k = s.t / .5; if (s.ok) streg(ctx, s.pts, [[s.c, 30 + k * 34, (1 - k) * .35], [s.c, 14, (1 - k) * .9], ['#FFF', 5, 1 - k]]); else { ctx.save(); ctx.translate(0, k * 34); streg(ctx, s.pts, [['#B8B0D0', 9, (1 - k) * .7]]); ctx.restore(); } }
    if (S.streg) streg(ctx, S.streg.pts, [['#FFE27A', 32, .22], ['#FFE27A', 15, .75], ['#FFF', 6, 1]]);
    for (const x of S.tekster){ const k = x.t / 1.25, s = x.t < .12 ? .5 + x.t / .12 * .6 : 1.1 - Math.min(.1, (x.t - .12) * .5); ctx.globalAlpha = k > .7 ? Math.max(0, (1 - k) / .3) : 1; skilt(ctx, x.txt, x.x, x.y, Math.round(x.size * s), x.c); }
    ctx.globalAlpha = 1;
    if (S.kort) kort(ctx);
    else if (S.msgT > 0){ const my = S.boss ? Math.max(S.hudB + 80, 600) : Math.max(S.hudB + 90, (S.top + 1000) / 2 - 70); ctx.globalAlpha = Math.min(1, S.msgT * 1.5); skilt(ctx, S.msg, 800, my, 68 / Math.sqrt(Z), '#FFD86B');
      if (S.msg2) skilt(ctx, S.msg2, 800, my + 56, 32 / Math.sqrt(Z), '#FFF6D0'); ctx.globalAlpha = 1; }
  }
  /* kæmpekuglen: glorie, stjerner der kredser, kuglen selv og rækken af tegn ovenover (det næste lyser, de klarede bliver grønne) */
  function tegnStor(ctx, k){
    const t = S.t, p = Math.min(1, k.t / k.T), c = SKUDFARVE[k.k], n = k.syms.length, sk = (1 - .1 * k.idx) * (1 + Math.max(0, k.krymp) * .6), puf = k.plan ? 1 + .5 * Math.min(1, (t - k.t0) / Math.max(.01, k.plan - k.t0)) : 1;
    const R = 140 * sk * puf;
    /* roterende lysstråler bag kuglen */
    ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(t * .9); ctx.globalAlpha = .38 + .12 * Math.sin(t * 7);
    for (let i = 0; i < 12; i++){ ctx.fillStyle = i % 2 ? c : '#FFF6D0'; ctx.beginPath(); ctx.moveTo(0, 0); const a = i * Math.PI / 6; ctx.lineTo(Math.cos(a - .12) * R * 1.75, Math.sin(a - .12) * R * 1.75); ctx.lineTo(Math.cos(a + .12) * R * 1.75, Math.sin(a + .12) * R * 1.75); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    const g = ctx.createRadialGradient(k.x, k.y, R * .2, k.x, k.y, R * 1.3); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.35, c); g.addColorStop(.7, c + '99'); g.addColorStop(1, c + '00');
    ctx.globalAlpha = .75 + .2 * Math.sin(t * 10); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(k.x, k.y, R * 1.3, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    if (p > .65){ ctx.fillStyle = `rgba(255,60,60,${(p - .65) * 1.4 * (.5 + .5 * Math.sin(t * 22))})`; ctx.beginPath(); ctx.arc(k.x, k.y, R * 1.05, 0, 7); ctx.fill(); }
    for (let i = 0; i < 7; i++){ const a = t * 2.4 + i * 6.28 / 7; ctx.fillStyle = i % 2 ? '#FFE27A' : '#FFF'; ctx.strokeStyle = E; ctx.lineWidth = 2.5; akStar(ctx, k.x + Math.cos(a) * R * .95, k.y + Math.sin(a) * R * .95 * .8, 11, t * 5 + i); ctx.fill(); ctx.stroke(); }
    put(ctx, 'skud_' + k.k, k.x, k.y, { r: k.k === 'is' ? t * 3 : k.k === 'bombe' ? t * 1.2 + k.rot : Math.sin(t * 3) * .2, s: 3.2 * sk * puf });
    if (k.plan) return;
    /* det tegn, der skal tegnes nu, stort midt på kuglen */
    const rr = 58 * sk + Math.sin(t * 8) * 3;
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = E; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(k.x, k.y, rr, 0, 7); ctx.fill(); ctx.stroke();
    glyf(ctx, k.sym, k.x, k.y + (k.sym === 'hjerte' ? 3 : 0), rr * .58, 9, TG[k.sym].c, E);
    /* rækken over kuglen */
    const gap = 62, y = k.y - R - 40, x0 = k.x - (n - 1) / 2 * gap, bw = n * gap + 20;
    ctx.fillStyle = 'rgba(20,10,50,.62)'; akRound(ctx, k.x - bw / 2, y - 34, bw, 68, 22); ctx.fill();
    k.syms.forEach((sym, i) => { const x = x0 + i * gap, ok = i < k.idx, nu = i === k.idx, r = nu ? 26 + Math.sin(t * 8) * 2 : 22;
      if (nu){ ctx.fillStyle = 'rgba(255,226,122,.4)'; ctx.beginPath(); ctx.arc(x, y, r + 9, 0, 7); ctx.fill(); }
      ctx.fillStyle = ok ? '#3FA86A' : TG[sym].c; ctx.strokeStyle = E; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
      if (ok){ ctx.strokeStyle = '#FFF'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x - 2, y + 7); ctx.lineTo(x + 10, y - 8); ctx.stroke(); }
      else glyf(ctx, sym, x, y + (sym === 'hjerte' ? 1 : 0), r * .5, 5, '#FFF', E); });
  }
  /* bossen: selve figuren, pynten den har fået, svimmel-stjerner, snakkeboble, navneskilt med hjerter og rækken af tegn, når den er svimmel */
  function tegnBoss(ctx){
    const B = S.boss, t = S.t, k = B.def.k, svim = B.fase === 'saarbar' || B.fase === 'ramt';
    if (B.fase === 'besejret'){ const q = B.besejrT / 1.6; put(ctx, 'boss_' + k + '!', B.x, B.y, { s: .2 + .8 * q, r: (1 - q) * 9, a: q }); return; }
    const ryst = B.fase === 'ramt' ? Math.sin(B.ramtT * 40) * 10 * B.ramtT : 0, vug = svim ? Math.sin(t * 2.4) * .08 : Math.sin(t * 1.1) * .03;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(B.x, GULV + 6, 150, 14, 0, 0, 7); ctx.fill();
    /* opladning til superangrebet: bossen ryster, en glorie vokser, og kuglen bliver større i hånden */
    const lq = B.lad > 0 ? 1 - B.lad / LAD : 0, lryst = lq ? Math.sin(t * 60) * 5 * lq : 0;
    if (lq){ const c = SKUDFARVE[B.def.skud], g = ctx.createRadialGradient(B.x, B.y, 40, B.x, B.y, 280); g.addColorStop(0, c + 'AA'); g.addColorStop(1, c + '00');
      ctx.globalAlpha = .4 + .4 * lq * (.6 + .4 * Math.sin(t * 18)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(B.x, B.y, 280, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      for (let i = 0; i < 3; i++){ const q = ((t * 1.8 + i / 3) % 1); ctx.globalAlpha = q * .8; ctx.strokeStyle = c; ctx.lineWidth = 8 * q; ctx.beginPath(); ctx.arc(B.x + B.def.hand[0], B.y + B.def.hand[1], 220 * (1 - q) + 20, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; }
    put(ctx, 'boss_' + k + (svim ? '!' : ''), B.x + ryst + lryst, B.y, { r: vug, sy: B.glimt > 0 ? 1 + B.glimt * .15 : 1 });
    if (lq){ const hx = B.x + B.def.hand[0] + lryst, hy = B.y + B.def.hand[1]; put(ctx, 'skud_' + B.def.skud, hx, hy, { r: t * 4, s: .6 + 2 * lq });
      for (let i = 0; i < 5; i++){ const a = t * 6 + i * 1.256; ctx.fillStyle = '#FFF'; akStar(ctx, hx + Math.cos(a) * (60 + 60 * lq), hy + Math.sin(a) * (60 + 60 * lq), 8 + 6 * lq, t * 8); ctx.fill(); } }
    if (B.fase === 'ramt' && B.ramtT > .8){ ctx.globalAlpha = (B.ramtT - .8) * 2.5; ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(B.x, B.y, 200, 210, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    /* pynt: for hver gang den er ramt, får den en sløjfe, et hjerte eller en blomst på */
    B.pynt.forEach((p, i) => { const [dx, dy] = PYNT_AT[k][i % PYNT_AT[k].length], x = B.x + ryst + dx * Math.cos(vug) - dy * Math.sin(vug), y = B.y + dx * Math.sin(vug) + dy * Math.cos(vug);
      ctx.save(); ctx.translate(x, y); ctx.rotate(vug - .2); ctx.strokeStyle = E; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
      if (p === 'sloejfe'){ ctx.fillStyle = '#FF5FA8'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -18); ctx.lineTo(-30, 18); ctx.closePath(); ctx.moveTo(0, 0); ctx.lineTo(30, -18); ctx.lineTo(30, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FF9FC8'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.stroke(); }
      else if (p === 'hjerte'){ ctx.fillStyle = '#FF4F7B'; hjerteform(ctx, 0, 0, 13); ctx.fill(); ctx.stroke(); }
      else { ctx.fillStyle = '#FFF'; for (let j = 0; j < 5; j++){ ctx.beginPath(); ctx.ellipse(Math.cos(j * 1.256) * 11, Math.sin(j * 1.256) * 11, 9, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#FFD23E'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); ctx.stroke(); }
      ctx.restore(); });
    if (svim){ for (let i = 0; i < 4; i++){ const a = t * 3 + i * Math.PI / 2; ctx.fillStyle = '#FFE27A'; ctx.strokeStyle = E; ctx.lineWidth = 2.5; akStar(ctx, B.x + Math.cos(a) * 110, B.y - 150 + Math.sin(a) * 26, 14, t * 4); ctx.fill(); ctx.stroke(); } }
    /* navneskilt med hjerter */
    const ny = B.y - 250, w = 300;
    ctx.save(); ctx.translate(B.x, ny);
    const g = ctx.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#F7E2A0'); g.addColorStop(.5, '#D9A848'); g.addColorStop(1, '#8A6420');
    ctx.fillStyle = g; ctx.strokeStyle = '#2A160C'; ctx.lineWidth = 4; akRound(ctx, -w / 2, -28, w, 58, 14); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#3A2008'; ctx.font = `700 22px ${FONT_C}`; ctx.fillText(B.def.navn.toUpperCase(), 0, -5);
    for (let i = 0; i < B.hpMax; i++){ const x = (i - (B.hpMax - 1) / 2) * 30; ctx.fillStyle = i < B.hp ? '#E8324A' : 'rgba(58,32,8,.25)'; ctx.strokeStyle = '#2A160C'; ctx.lineWidth = 2; hjerteform(ctx, x, 16, 9); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    /* snakkeboble */
    if (B.snakT > 0 && B.snak){ ctx.font = `700 26px ${FONT_C}`; const tw = ctx.measureText(B.snak).width + 36, bx = Math.max(S.x0 + tw / 2 + 10, Math.min(S.x1 - tw / 2 - 10, B.x + 180)), by = B.y - 150;
      ctx.globalAlpha = Math.min(1, B.snakT * 3); ctx.fillStyle = '#FFF'; ctx.strokeStyle = E; ctx.lineWidth = 4; akRound(ctx, bx - tw / 2, by - 30, tw, 52, 22); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - tw / 2 + 20, by + 18); ctx.lineTo(bx - tw / 2 - 6, by + 44); ctx.lineTo(bx - tw / 2 + 44, by + 20); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FFF'; ctx.fillRect(bx - tw / 2 + 18, by + 12, 30, 8);
      ctx.fillStyle = '#33204F'; ctx.textAlign = 'center'; ctx.fillText(B.snak, bx, by + 5); ctx.globalAlpha = 1; }
    /* rækken af tegn, når den er svimmel: dem man har tegnet bliver grønne, det næste lyser, og en bjælke viser tiden */
    if (B.fase === 'saarbar'){
      const n = B.kombo.length, gap = 96, y = B.y + 200, x0 = B.x - (n - 1) / 2 * gap;
      const bw = n * gap + 30; ctx.fillStyle = 'rgba(20,10,50,.6)'; akRound(ctx, B.x - bw / 2, y - 56, bw, 132, 24); ctx.fill();
      B.kombo.forEach((sym, i) => { const x = x0 + i * gap, ok = i < B.komboI, nu = i === B.komboI, r = nu ? 40 + Math.sin(t * 8) * 3 : 34;
        if (nu){ ctx.fillStyle = 'rgba(255,226,122,.35)'; ctx.beginPath(); ctx.arc(x, y, r + 14, 0, 7); ctx.fill(); }
        ctx.fillStyle = ok ? '#3FA86A' : TG[sym].c; ctx.strokeStyle = E; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
        if (ok){ ctx.strokeStyle = '#FFF'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x - 4, y + 11); ctx.lineTo(x + 15, y - 12); ctx.stroke(); }
        else glyf(ctx, sym, x, y + (sym === 'hjerte' ? 2 : 0), r * .48, 7, '#FFF', E); });
      const q = Math.max(0, B.saarT / B.saarMax); ctx.fillStyle = 'rgba(255,255,255,.25)'; akRound(ctx, B.x - bw / 2 + 20, y + 50, bw - 40, 12, 6); ctx.fill();
      ctx.fillStyle = q > .3 ? '#FFE27A' : '#FF6F6F'; akRound(ctx, B.x - bw / 2 + 20, y + 50, (bw - 40) * q, 12, 6); ctx.fill();
    }
  }
  /* træskiltet i haven viser runden og pointene (knapperne foroven skal ikke dække for ballonerne) */
  function haveskilt(ctx){
    const x = DYR_X + 200, y = GULV - 152;
    ctx.strokeStyle = E; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(8,30,24,.35)'; ctx.beginPath(); ctx.ellipse(x, GULV + 6, 34, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5A3A20'; akRound(ctx, x - 9, y + 30, 18, GULV - y - 26, 5); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.035);
    const g = ctx.createLinearGradient(0, -54, 0, 54); g.addColorStop(0, '#A06A3C'); g.addColorStop(1, '#6A4020');
    ctx.fillStyle = g; akRound(ctx, -108, -54, 216, 108, 12); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(42,22,12,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-98, -36); ctx.lineTo(60, -38); ctx.moveTo(-40, 44); ctx.lineTo(98, 42); ctx.moveTo(-98, 4); ctx.lineTo(-30, 3); ctx.stroke();
    ctx.fillStyle = '#D9A848'; ctx.strokeStyle = '#2A160C'; ctx.lineWidth = 1.5; for (const sx of [-94, 94]){ ctx.beginPath(); ctx.arc(sx, -40, 4.5, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.textAlign = 'center'; ctx.fillStyle = '#FFE9A8'; ctx.font = `700 26px ${FONT_C}`; ctx.fillText(S.boss ? 'BOSS-RUNDE' : 'RUNDE ' + S.runde, 0, -16);
    ctx.fillStyle = '#FFF6D0'; ctx.font = `700 38px ${FONT_C}`; ctx.fillText(S.score + ' point', 0, 30);
    ctx.restore();
  }
  /* vejledningen: et messingskilt, hvor det nye tegn bliver tegnet, og man selv prøver det */
  function kort(ctx){
    const K = S.kort, n = K.nyt.length, a = K.ud > 0 ? K.ud / .35 : Math.min(1, K.t / .3), W = n > 1 ? 780 : 580, H = 336, x = 800 - W / 2, y = 300, alle = K.nyt.every(k => K.ok[k]);
    /* skiltet fylder det samme på skærmen, uanset hvor meget der er zoomet ind, og ligger lige under knapperne */
    const u = Math.min(1, 1.12 / S.Z) * (.9 + .1 * a), yt = Math.max(S.hudB + 10, (S.top + 830) / 2 - H * u / 2);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(800, yt + H * u / 2); ctx.scale(u, u); ctx.translate(-800, -(y + H / 2));
    ctx.fillStyle = 'rgba(10,6,30,.45)'; akRound(ctx, x + 6, y + 12, W, H, 30); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + H); g.addColorStop(0, '#F7E2A0'); g.addColorStop(.5, '#D9A848'); g.addColorStop(1, '#8A6420');
    ctx.fillStyle = g; ctx.strokeStyle = '#2A160C'; ctx.lineWidth = 5; akRound(ctx, x, y, W, H, 30); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FBF1DA'; ctx.lineWidth = 3; akRound(ctx, x + 15, y + 15, W - 30, H - 30, 19); ctx.fill(); ctx.stroke();
    for (const [sx, sy] of [[x + 15, y + 15], [x + W - 15, y + 15], [x + 15, y + H - 15], [x + W - 15, y + H - 15]]){ ctx.fillStyle = '#C9962E'; ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.textAlign = 'center'; ctx.fillStyle = '#7A2A1A'; ctx.font = `700 46px ${FONT_C}`; ctx.fillText(S.runde === 1 ? 'Tegn tegnet på ballonen' : 'Nyt trylletegn!', 800, y + 76);
    K.nyt.forEach((sym, i) => { const cx = 800 + (i - (n - 1) / 2) * 370, cy = y + 180, ok = K.ok[sym];
      bal(ctx, sym, cx - 92, cy - 4, 1.12);
      ctx.strokeStyle = '#B08A4A'; ctx.lineWidth = 6; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 8, cy); ctx.moveTo(cx - 3, cy - 11); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx - 3, cy + 11); ctx.stroke();
      glyf(ctx, sym, cx + 92, cy, 48, 10, '#E6D8B8', null, 1);
      const end = glyf(ctx, sym, cx + 92, cy, 48, 11, ok ? '#3FA86A' : TG[sym].c2, null, ok ? 1 : Math.min(1, ((K.t * .75 + i * .4) % 1.5) / 1));
      if (ok){ ctx.fillStyle = '#3FA86A'; ctx.strokeStyle = E; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx + 152, cy - 52, 21, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#FFF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + 142, cy - 52); ctx.lineTo(cx + 149, cy - 44); ctx.lineTo(cx + 163, cy - 60); ctx.stroke(); }
      else if (end){ ctx.fillStyle = '#FFE27A'; ctx.strokeStyle = E; ctx.lineWidth = 3; akStar(ctx, end[0], end[1], 18, K.t * 4); ctx.fill(); ctx.stroke(); } });
    ctx.fillStyle = '#5A3A20'; ctx.font = `600 28px ${FONT_C}`; ctx.textAlign = 'center';
    ctx.fillText(alle ? 'Flot! Nu kommer de …' : S.runde === 1 ? 'Prøv selv: tegn dem med fingeren, hvor du vil' : 'Prøv selv: tegn det med fingeren', 800, y + H - 38);
    ctx.restore();
  }

  Arkade.GAMES.tryl = { start, stop, noScore: true, billeder, skaermbillede, genkend: trylGenkend,
    /* til afprøvning: afslut spillet, og se hvad der er på skærmen */
    test(){ const go = () => { if (!S) return; if (!S.klar) return setTimeout(go, 100); S.kort = null; S.liv = 1; S.fase = 'spil'; bid({ x: BORD, y: 700 }); S.faseT = .4; }; go(); },
    /* tryl et tegn uden at tegne det (går gennem genkendelsen som en rigtig streg) */
    kast(sym){ if (!S || !S.klar || !TG[sym]) return; const P = TG[sym].p, pts = []; for (let i = 1; i < P.length; i++) for (let k = 0; k < 6; k++) pts.push([800 + (P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k / 6) * 90, 620 + (P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k / 6) * 90]); pts.push([800 + P[P.length - 1][0] * 90, 620 + P[P.length - 1][1] * 90]); tegnet(pts); },
    tilRunde(n){ if (!S || !S.klar) return; S.foes = []; S.koe = []; S.gave = null; S.runde = n - 1; S.bossNr = Math.floor((n - 1) / 5); naesteRunde(); },
    state: () => S && { bossNr: S.bossNr, boss: S.boss ? { k: S.boss.def.k, fase: S.boss.fase, hp: S.boss.hp, lad: S.boss.lad, next: S.boss.fase === 'saarbar' ? S.boss.kombo[S.boss.komboI] : null } : null,
      skud: S.skud.filter(k => !k.plan && k.t >= 0).map(k => ({ sym: k.sym, rest: k.T - k.t, stor: !!k.stor })), klar: S.klar, t: S.t, top: S.top, hudB: S.hudB, bane: [S.baneL, S.baneR], Z: S.Z, fase: S.fase, runde: S.runde, score: S.score, liv: S.liv, forvandlet: S.forvandlet, tegn: aktive(), kort: S.kort && S.fase === 'kort' ? S.kort.nyt.filter(k => !S.kort.ok[k]) : [], gave: S.gave ? { x: S.gave.x } : null,
      foes: S.foes.map(f => ({ k: f.k, st: f.st, x: f.x, y: f.y, land: f.land, bal: f.bal.filter(b => !b.pop && !b.plan).map(b => ({ sym: b.sym, y: f.y + b.dy })) })) } };
})();
