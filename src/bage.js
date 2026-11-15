/* ---------- kortet bages: alt det stillestående tegnes én gang som ét billede ----------
   Telefonen tegner ellers hele det synlige kort forfra, hver gang én lille ting bevæger sig.
   Tilbage som levende grafik bliver: alt der bevæger sig, alt man kan trykke på, tekst og billeder.
   Stillestående ting, der ligger oven på noget levende, tegnes også levende, men kun i netop de felter
   hvor det sker, så intet havner forkert i dybden. Går noget galt, bliver kortet bare som før. */
const BAKE = { url: null, gen: 0 };
function bakeTown(svg){
  if (BAKE.url){ URL.revokeObjectURL(BAKE.url); BAKE.url = null; }
  const gen = ++BAKE.gen;
  if (window.NO_BAKE) return;
  setTimeout(() => { try { bakeNow(svg, gen); } catch (e){ DBG.row('fejl', { besked: 'bage: ' + e.message }); } }, 60);
}
function bakeNow(svg, gen){
  if (!svg.isConnected || gen !== BAKE.gen) return;
  const T0 = performance.now(), NS = 'http://www.w3.org/2000/svg';
  let ctm = svg.getScreenCTM(); if (!ctm) return;
  let inv = ctm.inverse(); const pt = new DOMPoint();
  const map = r => { const a = new DOMPoint(r.left, r.top).matrixTransform(inv), b = new DOMPoint(r.right, r.bottom).matrixTransform(inv); return [a.x, a.y, b.x, b.y]; };
  const SKIP = 'defs,clipPath,mask,pattern,linearGradient,radialGradient,filter,symbol,marker';
  const LIVE_BOX = '[data-tap],#chars,#bubbles,#fx,#hiddenStars,#jets,.bird,.sparkle,.peek,.hstar,.tapzone,.tapjump';
  const all = [...svg.querySelectorAll('*')];
  const leaves = all.filter(e => /^(path|rect|circle|ellipse|polygon|polyline|line|use|text|image|foreignObject)$/.test(e.tagName) && !e.closest(SKIP));
  /* animeret: elementet eller en forfader har en SMIL-animation */
  const animOf = new Map();
  const isAnim = e => { if (animOf.has(e)) return animOf.get(e); let r = null;
    for (let x = e; x && x !== svg; x = x.parentElement){ if (x.querySelector(':scope > animate,:scope > animateTransform,:scope > animateMotion,:scope > set')){ r = x; break; } }
    animOf.set(e, r); return r; };
  /* hvor langt kan et animeret element nå? */
  const reach = new Map();
  const reachOf = g => { if (reach.has(g)) return reach.get(g); let dx = 0, dy = 0, extra = null;
    for (let x = g; x && x !== svg; x = x.parentElement){
      for (const a of x.querySelectorAll(':scope > animateTransform')){ const t = a.getAttribute('type'), v = (a.getAttribute('values') || [a.getAttribute('from'), a.getAttribute('to')].join(';')).split(';');
        if (t === 'translate') v.forEach(p => { const [a1, a2] = p.trim().split(/[\s,]+/).map(Number); if (isFinite(a1)) dx = Math.max(dx, Math.abs(a1)); if (isFinite(a2)) dy = Math.max(dy, Math.abs(a2)); });
        else { dx += 12; dy += 12; } }
      const m = x.querySelector(':scope > animateMotion');
      if (m && !extra){ const tmp = document.createElementNS(NS, 'path'); tmp.setAttribute('d', m.getAttribute('path') || ''); tmp.setAttribute('fill', 'none'); x.parentNode.insertBefore(tmp, x); extra = map(tmp.getBoundingClientRect()); tmp.remove(); }
    }
    const r = { dx, dy, extra }; reach.set(g, r); return r; };
  /* præcis overlap: rammer formerne de samme punkter? (et bjerg dækker ikke stjernerne over det, selvom firkanterne overlapper) */
  const mats = new Map(), paints = new Map();
  /* kameraet kan flytte sig mellem bidderne; koordinaterne hentes forfra i hver bid */
  const refresh = () => { const c = svg.getScreenCTM(); if (c){ ctm = c; inv = c.inverse(); } mats.clear(); };
  const matOf = e => { if (mats.has(e)) return mats.get(e); const c = e.getScreenCTM(), m = c ? c.inverse().multiply(ctm) : null; mats.set(e, m); return m; };
  const paintOf = e => { let p = paints.get(e); if (!p){ const cs = getComputedStyle(e); p = { f: cs.fill !== 'none', s: cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 }; paints.set(e, p); } return p; };
  const inside = (e, x, y) => { if (!(e instanceof SVGGeometryElement)) return true; const m = matOf(e); if (!m) return true; pt.x = x; pt.y = y; const q = pt.matrixTransform(m), p = paintOf(e);
    try { return (p.f && e.isPointInFill(q)) || (p.s && e.isPointInStroke(q)); } catch (er){ return true; } };
  const overlaps = (e, b, d) => {
    const ix0 = Math.max(b[0], d[0]), iy0 = Math.max(b[1], d[1]), ix1 = Math.min(b[2], d[2]), iy1 = Math.min(b[3], d[3]);
    if (ix0 >= ix1 || iy0 >= iy1) return false;
    const n = Math.max(2, Math.min(9, Math.ceil(Math.max(ix1 - ix0, iy1 - iy0) / 6)));
    for (let a = 0; a <= n; a++) for (let c = 0; c <= n; c++){ const x = ix0 + (ix1 - ix0) * a / n, y = iy0 + (iy1 - iy0) * c / n;
      if (inside(e, x, y) && (!d.el || inside(d.el, x, y))) return true; }
    return false; };
  /* sortér alle blade: levende, klippede (levende i felter) eller bagte */
  const live = new Set(), dyn = [], clipped = new Map();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  let li = 0;
  const step = () => {
    if (gen !== BAKE.gen || !svg.isConnected) return;
    refresh(); const until = performance.now() + 12;
    for (; li < leaves.length && performance.now() < until; li++){ const e = leaves[li];
    const b = map(e.getBoundingClientRect());
    const ag = isAnim(e), transparent = e.getAttribute('fill') === 'transparent' && (!e.getAttribute('stroke') || e.getAttribute('stroke') === 'none'),
      fixedLive = /^(text|image|foreignObject)$/.test(e.tagName) || e.closest(LIVE_BOX) || transparent;
    if (ag || fixedLive){
      live.add(e);
      if (transparent) continue;                                     // usynlige trykflader dækker ikke noget
      let bb;
      if (ag){ const r = reachOf(ag), w = (b[2] - b[0]) / 2, h = (b[3] - b[1]) / 2; bb = [b[0] - r.dx - 4, b[1] - r.dy - 4, b[2] + r.dx + 4, b[3] + r.dy + 4];
        if (r.extra) bb = [Math.min(bb[0], r.extra[0] - w), Math.min(bb[1], r.extra[1] - h), Math.max(bb[2], r.extra[2] + w), Math.max(bb[3], r.extra[3] + h)]; }
      else bb = [b[0] - 14, b[1] - 24, b[2] + 14, b[3] + 6];       // ting der hopper, når man trykker
      if (bb[2] > bb[0] && bb[3] > bb[1]) dyn.push(bb);
      continue;
    }
    if (b[2] - b[0] <= 0 || b[3] - b[1] <= 0) continue;
    x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
    const regs = [];
    for (const d of dyn){ if (!overlaps(e, b, d)) continue;
      const r = [Math.max(b[0], d[0]) - 1, Math.max(b[1], d[1]) - 1, Math.min(b[2], d[2]) + 1, Math.min(b[3], d[3]) + 1];
      if (!regs.some(q => q[0] <= r[0] && q[1] <= r[1] && q[2] >= r[2] && q[3] >= r[3])) regs.push(r); }
    if (regs.length){
      /* felter der overlapper hinanden, slås sammen, så de kan bruges som huller i billedet */
      for (let k = 0; k < regs.length; k++) for (let m = k + 1; m < regs.length; m++){ const A = regs[k], B = regs[m];
        if (A[0] < B[2] && A[2] > B[0] && A[1] < B[3] && A[3] > B[1]){ regs[k] = [Math.min(A[0], B[0]), Math.min(A[1], B[1]), Math.max(A[2], B[2]), Math.max(A[3], B[3])]; regs.splice(m, 1); k = -1; break; } }
      clipped.set(e, regs); regs.forEach(r => { const nb = [...r]; nb.el = e; dyn.push(nb); }); }
    }
    if (li < leaves.length){ setTimeout(step, 16); return; }
    refresh(); finish();
  };
  const finish = () => {
  const statics = leaves.filter(e => !live.has(e) && !clipped.has(e));
  if (window.BAKE_LOG) console.log('bage', leaves.length, 'levende', live.size, 'klippet', clipped.size, 'billede', statics.length, Math.round(performance.now() - T0) + 'ms');
  if (statics.length + clipped.size < 100 || !isFinite(x0)) return;
  x0 = Math.floor(Math.max(x0, -700)); y0 = Math.floor(Math.max(y0, -500)); x1 = Math.ceil(Math.min(x1, 2300)); y1 = Math.ceil(Math.min(y1, 1500));
  const W = x1 - x0, H = y1 - y0;
  let sc = Math.min(2.2, Math.max(1, ctm.a * (window.devicePixelRatio || 1)));
  while (W * H * sc * sc > 14e6) sc *= 0.9;
  /* felterne omregnes til elementets forælders koordinater (den kan være flyttet, drejet og skaleret) */
  const quads = e => { const pc = e.parentElement.getScreenCTM(); if (!pc) return null;
    const m = pc.inverse().multiply(ctm), P = (x, y) => { pt.x = x; pt.y = y; const q = pt.matrixTransform(m); return `${q.x.toFixed(2)} ${q.y.toFixed(2)}`; };
    return clipped.get(e).map(r => `M ${P(r[0], r[1])} L ${P(r[2], r[1])} L ${P(r[2], r[3])} L ${P(r[0], r[3])} Z`); };
  const opaque = e => { const cs = getComputedStyle(e); if (/url|rgba|transparent/.test(cs.fill + ' ' + cs.stroke) || +cs.fillOpacity < 1 || +cs.strokeOpacity < 1 || cs.filter !== 'none' || e.getAttribute('filter')) return false;
    for (let x = e; x && x !== svg; x = x.parentElement){ const c = getComputedStyle(x); if (+c.opacity < 1 || x.getAttribute('filter') || x.getAttribute('mask') || c.mixBlendMode !== 'normal') return false; } return true; };
  /* en klippe-gruppe isolerer sit indhold; har elementet en blandingstilstand (fx nattens farvelag), skal gruppen have den i stedet */
  const blendOf = new Map();
  const wrap = (el, attr, id, orig = el) => { const g = document.createElementNS(NS, 'g'); g.setAttribute(attr, `url(#${id})`);
    let bm = blendOf.get(orig); if (bm === undefined){ bm = getComputedStyle(orig).mixBlendMode; blendOf.set(orig, bm); }
    if (bm && bm !== 'normal'){ g.style.mixBlendMode = bm; el.style.mixBlendMode = 'normal'; }
    el.parentNode.insertBefore(g, el); g.append(el); };
  /* kopien til billedet: uden det levende. Gennemsigtige klippede ting får hul i deres felter, så de ikke tegnes dobbelt */
  const idx = new Map(); all.forEach((e, i) => idx.set(e, i));
  const cl = svg.cloneNode(true), call = [...cl.querySelectorAll('*')];
  all.forEach((e, i) => { const cs = getComputedStyle(e); if (cs.filter && cs.filter !== 'none' && !e.getAttribute('filter')) call[i].style.filter = cs.filter; });
  let cdefs = cl.querySelector('defs'); if (!cdefs){ cdefs = document.createElementNS(NS, 'defs'); cl.prepend(cdefs); }
  let n = 0; const liveClips = [];
  clipped.forEach((regs, e) => { const id = 'bk' + gen + '_' + (n++), q = quads(e); if (!q) return;
    liveClips.push([e, id, `<path d="${q.join(' ')}"/>`]);
    /* gennemsigtige ting får huller i billedet, hvor de tegnes levende (et klip med huller er langt billigere end en maske) */
    if (!opaque(e)){ cdefs.insertAdjacentHTML('beforeend', `<clipPath id="${id}h" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="M -9000 -9000 H 9000 V 9000 H -9000 Z ${q.join(' ')}"/></clipPath>`);
      wrap(call[idx.get(e)], 'clip-path', id + 'h', e); } });
  live.forEach(e => call[idx.get(e)].remove());
  cl.querySelectorAll('animate,animateTransform,animateMotion,set').forEach(a => a.remove());
  cl.setAttribute('viewBox', `${x0} ${y0} ${W} ${H}`); cl.setAttribute('width', Math.round(W * sc)); cl.setAttribute('height', Math.round(H * sc));
  cl.setAttribute('preserveAspectRatio', 'none'); cl.removeAttribute('id'); cl.removeAttribute('class'); cl.setAttribute('xmlns', NS); cl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  const src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(cl)], { type: 'image/svg+xml' }));
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(src); if (window.BAKE_LOG) console.log('bage: billede indlæst', Math.round(performance.now() - T0) + 'ms');
    if (gen !== BAKE.gen || !svg.isConnected) return;
    const cv = document.createElement('canvas'); cv.width = Math.round(W * sc); cv.height = Math.round(H * sc);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); if (window.BAKE_LOG) console.log('bage: tegnet', Math.round(performance.now() - T0) + 'ms');
    cv.toBlob(bl => { if (window.BAKE_LOG) console.log('bage: png', bl && bl.size, Math.round(performance.now() - T0) + 'ms');
      if (!bl || gen !== BAKE.gen || !svg.isConnected) return;
      BAKE.url = URL.createObjectURL(bl);
      const im = document.createElementNS(NS, 'image');
      im.setAttribute('href', BAKE.url); im.setAttribute('x', x0); im.setAttribute('y', y0); im.setAttribute('width', W); im.setAttribute('height', H);
      im.setAttribute('preserveAspectRatio', 'none'); im.setAttribute('pointer-events', 'none'); im.setAttribute('class', 'baked-bg');
      const swap = () => {
        if (gen !== BAKE.gen || !svg.isConnected) return;
        let defs = svg.querySelector('defs'); if (!defs){ defs = document.createElementNS(NS, 'defs'); svg.prepend(defs); }
        defs.insertAdjacentHTML('beforeend', liveClips.map(([e, id, poly]) => `<clipPath id="${id}" clipPathUnits="userSpaceOnUse">${poly}</clipPath>`).join(''));
        liveClips.forEach(([e, id]) => wrap(e, 'clip-path', id));
        svg.insertBefore(im, [...svg.children].find(c => c.tagName !== 'defs'));
        statics.forEach(e => e.classList.add('bk')); svg.classList.add('baked');
        DBG.row('bagt', { billede: statics.length, levende: live.size, klippet: clipped.size, px: `${cv.width}x${cv.height}`, ms: Math.round(performance.now() - T0) });
      };
      if (im.decode) im.decode().then(swap, swap); else swap();
    }, 'image/png');
  };
  img.onerror = () => { if (window.BAKE_LOG) console.log('bage: billedfejl'); URL.revokeObjectURL(src); DBG.row('fejl', { besked: 'bage: billedet kunne ikke tegnes' }); };
  img.src = src;
  };
  step();
}
