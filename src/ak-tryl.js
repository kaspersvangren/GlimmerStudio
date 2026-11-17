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

  function rundeplan(w){
    const tegn = ['vand', 'lod']; if (w >= 2) tegn.push('v'); if (w >= 3) tegn.push('hat'); if (w >= 5) tegn.push('ring'); if (w >= 7) tegn.push('lyn');
    const nyt = w === 1 ? ['vand', 'lod'] : w === 2 ? ['v'] : w === 3 ? ['hat'] : w === 5 ? ['ring'] : w === 7 ? ['lyn'] : [];
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
    kamera(); const q = S.C.V.k * S.C.V.dpr * S.Z;
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
    const C = S.C, cv = C.cv, w = cv.clientWidth || 800, h = cv.clientHeight || 500, [a, b] = C.visX();
    S.Z = Math.max(1, Math.min(1.3, (w / h) / 1.6)); S.top = 1000 - 1000 / S.Z;
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
          gave: null, gaveT: 0, hop: 0, dyrHop: 0, kageHop: 0, ryst: 0, msg: '', msgT: 0, harDyr,
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
    const ramt = [];
    for (const f of S.foes){ if (f.st !== 'ned') continue; for (const b of f.bal){ if (!b.pop && !b.plan && b.sym === sym && f.y + b.dy > S.top - BR * .4) ramt.push([f, b]); } }
    if (!ramt.length){ gnist(mx, my, c, 6, 160); tone(900, .05, 'triangle', .02, 0, 1.3); return; }
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
  function bid(f){
    if (S.liv <= 0 || S.fase === 'tabt') return;
    S.liv--; S.ryst = .3; S.kageHop = .35; SND.play('tryl.nam', () => sfx.nope());
    const y = GULV - 90 - S.liv * 40;
    for (let i = 0; i < 14; i++) S.parts.push({ type: 'flis', x: BORD + rnd(-50, 50), y: y + rnd(-20, 20), vx: rnd(-260, 260), vy: rnd(-380, -80), t: 0, life: rnd(.5, .9), r: rnd(5, 10), c: vaelg(['#F6D9A8', '#FF8FC7', '#FFF', '#B79BFF']), rot: rnd(0, 6), g: 700 });
    tekst(f.x, f.y - 20, 'NAM!', '#FF8FC7', 54);
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
    const x0 = S.x0, x1 = S.x1;
    S.faseT -= dt; for (const k of ['hop', 'dyrHop', 'kageHop', 'ryst', 'msgT']) if (S[k] > 0) S[k] -= dt;
    if (S.fase === 'kort'){ S.kort.t += dt; if (S.faseT <= 0){ S.fase = 'spil'; S.kort.ud = .35; } }
    if (S.kort && S.kort.ud > 0){ S.kort.ud -= dt; if (S.kort.ud <= 0) S.kort = null; }
    if (S.fase === 'spil'){
      S.spawnT -= dt;
      if (S.spawnT <= 0 && S.koe.length){ spawn(S.koe.shift()); S.spawnT = S.cfg.gab * rnd(.75, 1.25); }
      if (S.gaveT > 0){ S.gaveT -= dt; if (S.gaveT <= 0 && !S.gave){ const d = Math.random() < .5 ? 1 : -1; S.gave = { x: d > 0 ? x0 - 110 : x1 + 110, y: S.hudB + 96, d, t: 0 }; } }
      if (!S.koe.length && !S.foes.some(f => f.st !== 'flygt')){
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
    /* gnister, krummer og skyer */
    for (const p of S.parts){ const k = p.t / p.life, a = 1 - k;
      if (p.type === 'ring'){ ctx.globalAlpha = a; ctx.strokeStyle = p.c; ctx.lineWidth = 7 * a + 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + k * .9), 0, 7); ctx.stroke(); }
      else if (p.type === 'sky'){ ctx.globalAlpha = a * .85; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + k * .8), 0, 7); ctx.fill(); }
      else if (p.type === 'stjerne'){ ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = p.c; akStar(ctx, p.x, p.y, p.r * (1 - k * .5), p.rot + p.t * 6); ctx.fill(); }
      else if (p.type === 'hjerte'){ ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = p.c; hjerteform(ctx, p.x, p.y, p.r); ctx.fill(); }
      else { ctx.globalAlpha = Math.min(1, a * 1.8); ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.t * 9); ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .66); ctx.restore(); } }
    ctx.globalAlpha = 1;
    /* stregen: den man tegner nu, og dem der lige er tryllet med */
    for (const s of S.spor){ const k = s.t / .5; if (s.ok) streg(ctx, s.pts, [[s.c, 30 + k * 34, (1 - k) * .35], [s.c, 14, (1 - k) * .9], ['#FFF', 5, 1 - k]]); else { ctx.save(); ctx.translate(0, k * 34); streg(ctx, s.pts, [['#B8B0D0', 9, (1 - k) * .7]]); ctx.restore(); } }
    if (S.streg) streg(ctx, S.streg.pts, [['#FFE27A', 32, .22], ['#FFE27A', 15, .75], ['#FFF', 6, 1]]);
    for (const x of S.tekster){ const k = x.t / 1.25, s = x.t < .12 ? .5 + x.t / .12 * .6 : 1.1 - Math.min(.1, (x.t - .12) * .5); ctx.globalAlpha = k > .7 ? Math.max(0, (1 - k) / .3) : 1; skilt(ctx, x.txt, x.x, x.y, Math.round(x.size * s), x.c); }
    ctx.globalAlpha = 1;
    if (S.kort) kort(ctx);
    else if (S.msgT > 0){ ctx.globalAlpha = Math.min(1, S.msgT * 1.5); skilt(ctx, S.msg, 800, Math.max(S.hudB + 90, (S.top + 1000) / 2 - 70), 68 / Math.sqrt(Z), '#FFD86B'); ctx.globalAlpha = 1; }
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
    ctx.textAlign = 'center'; ctx.fillStyle = '#FFE9A8'; ctx.font = `700 26px ${FONT_C}`; ctx.fillText('RUNDE ' + S.runde, 0, -16);
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
    tilRunde(n){ if (!S || !S.klar) return; S.foes = []; S.koe = []; S.gave = null; S.runde = n - 1; naesteRunde(); },
    state: () => S && { klar: S.klar, t: S.t, top: S.top, hudB: S.hudB, bane: [S.baneL, S.baneR], Z: S.Z, fase: S.fase, runde: S.runde, score: S.score, liv: S.liv, forvandlet: S.forvandlet, tegn: aktive(), kort: S.kort && S.fase === 'kort' ? S.kort.nyt.filter(k => !S.kort.ok[k]) : [], gave: S.gave ? { x: S.gave.x } : null,
      foes: S.foes.map(f => ({ k: f.k, st: f.st, x: f.x, y: f.y, land: f.land, bal: f.bal.filter(b => !b.pop && !b.plan).map(b => ({ sym: b.sym, y: f.y + b.dy })) })) } };
})();
