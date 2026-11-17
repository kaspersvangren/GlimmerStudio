/* ---------- kortet bages: alt det stillestående tegnes én gang som ét billede ----------
   Telefonen tegner ellers hele det synlige kort forfra, hver gang én lille ting bevæger sig.
   Tilbage som levende grafik bliver: alt der bevæger sig, alt man kan trykke på, tekst og billeder.
   Stillestående ting, der ligger oven på noget levende, tegnes også levende, men kun i netop de felter
   hvor det sker, så intet havner forkert i dybden. Går noget galt, bliver kortet bare som før.
   Billedet gemmes i telefonen (IndexedDB) under et fingeraftryk af kortet, så det kun skal bages én gang
   for hver udgave af kortet (tid på dagen, vejr, årstid ...). Næste gang lægges det bare på. */
const BAKE = { url: null, gen: 0, src: '', ok: 0, prog: 0 };  /* ok: den udgave af byen, der er helt færdig (til indlæsningsskærmen) */
const BAKE_SKIP = 'defs,clipPath,mask,pattern,linearGradient,radialGradient,filter,symbol,marker';
const BAKE_VOLATILE = '#chars,#bubbles,#hiddenStars,.tapzone';
const bakeLeaves = svg => [...svg.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line,use,text,image,foreignObject')].filter(e => !e.closest(BAKE_SKIP));
/* de blade, der altid er de samme for samme kort (ikke figurer, bobler, skjulte stjerner, trykflader, tekst og billeder) */
const bakeStable = svg => bakeLeaves(svg).filter(e => !/^(text|image|foreignObject)$/.test(e.tagName) && !e.closest(BAKE_VOLATILE));
/* alle elementer (ikke kun blade), til at finde de animerede rødder igen */
const bakeStableAll = svg => [...svg.querySelectorAll('*')].filter(e => e.tagName !== 'image' && !e.closest(BAKE_SKIP) && !e.closest(BAKE_VOLATILE));
const BIDB = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => { const q = indexedDB.open('glimmer-bage', 1); q.onupgradeneeded = () => q.result.createObjectStore('kort'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }));
  const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction('kort', mode), q = fn(t.objectStore('kort')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
  return { get: k => tx('readonly', st => st.get(k)).catch(() => null), put: (k, v) => tx('readwrite', st => st.put(v, k)).catch(() => {}),
    keys: () => tx('readonly', st => st.getAllKeys()).catch(() => []), del: k => tx('readwrite', st => st.delete(k)).catch(() => {}) };
})();
/* PNG-pakning i en arbejdstråd. canvas.toBlob pakker kun, når hovedtråden har ledig tid, og venter ellers i flere
   sekunder (målt: 1,5-7 s for et billede, der tager 0,2 s at pakke), fordi byen tegner hele tiden imens.
   I en arbejdstråd sker det med det samme og på en anden kerne. Kan tråden ikke startes, bruges toBlob som før */
const PNGW = (() => {
  let w = null, n = 0, dead = false; const venter = new Map();
  /* nattens farvelag ganges ind i billedet (hele billedet, eller kun de nævnte felter): hver farve skaleres med sit tal.
     Det giver præcis det samme som at lægge farvelaget ovenpå med 'multiply', også hvor billedet er gennemsigtigt */
  const skyg = function(ctx, o, W, H){ for (const [x, y, w, h] of (o.rects || [[0, 0, W, H]])){ if (!(w > 0 && h > 0)) continue;
    const id = ctx.getImageData(x, y, w, h), d = id.data, k = o.k; for (let i = 0; i < d.length; i += 4){ d[i] *= k[0]; d[i + 1] *= k[1]; d[i + 2] *= k[2]; } ctx.putImageData(id, x, y); } };
  const kode = "const skyg = " + skyg.toString() + "; self.onmessage = async e => { const { id, bm, sk } = e.data; try { const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d', { willReadFrequently: !!sk }); x.drawImage(bm, 0, 0); bm.close(); if (sk) skyg(x, sk, c.width, c.height); self.postMessage({ id, b: await c.convertToBlob({ type: 'image/png' }) }); } catch (er){ self.postMessage({ id, fejl: String(er) }); } };";
  const doed = () => { dead = true; if (w){ try { w.terminate(); } catch (e){} } w = null; venter.forEach(p => p[1](new Error('arbejdstråd'))); venter.clear(); };
  const hent = () => { if (w || dead) return w;
    try { w = new Worker(URL.createObjectURL(new Blob([kode], { type: 'text/javascript' })));
      w.onmessage = e => { const p = venter.get(e.data.id); if (!p) return; venter.delete(e.data.id); if (e.data.b) p[0](e.data.b); else p[1](new Error(e.data.fejl)); };
      w.onerror = doed; } catch (e){ dead = true; w = null; }
    return w; };
  const gammel = (cv, sk) => new Promise((res, rej) => { let c = cv;
    if (sk){ c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(cv, 0, 0); skyg(x, sk, c.width, c.height); }
    c.toBlob(b => b ? res(b) : rej(new Error('png')), 'image/png'); });
  /* sk: { k: [r, g, b], rects? } hvis nattens farvelag skal ganges ind */
  async function encode(cv, sk){
    const wk = window.createImageBitmap && window.OffscreenCanvas ? hent() : null; if (!wk) return gammel(cv, sk);
    try { const bm = await createImageBitmap(cv);
      return await new Promise((res, rej) => { const id = ++n; venter.set(id, [res, rej]); wk.postMessage({ id, bm, sk: sk || null }, [bm]);
        setTimeout(() => { if (venter.has(id)){ venter.delete(id); rej(new Error('tid')); } }, 20000); }); }
    catch (e){ return gammel(cv, sk); }
  }
  return { encode, get traad(){ return !!w && !dead; } };
})();
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + '.' + s.length.toString(36); };
/* usynlig: fylder og streger ingenting (trykflader) */
function bakeInvisible(e){
  if (e.classList.contains('tapzone')) return true;
  const cs = getComputedStyle(e), clear = c => !c || c === 'none' || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);
  const f = clear(cs.fill) || +cs.fillOpacity === 0, st = clear(cs.stroke) || +cs.strokeOpacity === 0 || parseFloat(cs.strokeWidth) === 0;
  return (f && st) || e.getAttribute('opacity') === '0';
}
function bakeScale(svg){ const c = svg.getScreenCTM(); return c ? Math.round(Math.min(2, Math.max(1, c.a * (window.devicePixelRatio || 1))) * 1000) / 1000 : 0; }
function bakeTown(svg){
  gpuReset();
  if (BAKE.url){ URL.revokeObjectURL(BAKE.url); BAKE.url = null; }
  const gen = ++BAKE.gen;
  if (window.NO_BAKE || !window.indexedDB) return;
  setTimeout(async () => {
    try {
      if (gen !== BAKE.gen || !svg.isConnected) return;
      const sc = bakeScale(svg); if (!sc) return;
      const places = [...svg.querySelectorAll('.place')].map(g => g.getAttribute('class')).join('|');
      /* løbenumre i id'er skifter fra gang til gang uden at kortet ændrer sig, så de tælles ikke med */
      const gpu = gpuWanted();
      const key = `${VERSION}|${sc}|${gpu ? (laerredWanted() ? 'lr' : 'gpu') : 'svg'}|${hashStr(BAKE.src.replace(/\b(id="|url\(#|href="#)[a-z]+\d+/gi, '$1#') + places)}`;
      BAKE.key = key;
      const rec = await BIDB.get(key);
      if (gen !== BAKE.gen || !svg.isConnected) return;
      if (rec && rec.n === bakeStable(svg).length && (!gpu || rec.gpu)){ bakeApply(svg, gen, rec, true); return; }
      bakeNow(svg, gen, key, sc, gpu);
    } catch (e){ DBG.row('fejl', { besked: 'bage: ' + e.message }); }
  }, 60);
}
/* læg et færdigt billede på kortet: skjul de bagte dele og klip de levende kopier */
function bakeApply(svg, gen, rec, cached){
  const NS = 'http://www.w3.org/2000/svg', st = bakeStable(svg), stAll = rec.gpu ? bakeStableAll(svg) : null;
  if (st.length !== rec.n || (rec.gpu && stAll.length !== rec.gpu.nAll)) return;
  BAKE.url = URL.createObjectURL(rec.png);
  const im = document.createElementNS(NS, 'image');
  im.setAttribute('href', BAKE.url); im.setAttribute('x', rec.x0); im.setAttribute('y', rec.y0); im.setAttribute('width', rec.W); im.setAttribute('height', rec.H);
  im.setAttribute('preserveAspectRatio', 'none'); im.setAttribute('pointer-events', 'none'); im.setAttribute('class', 'baked-bg');
  const swap = () => {
    if (gen !== BAKE.gen || !svg.isConnected) return;
    let defs = svg.querySelector('defs'); if (!defs){ defs = document.createElementNS(NS, 'defs'); svg.prepend(defs); }
    defs.insertAdjacentHTML('beforeend', rec.clips.map(([i, id, d]) => `<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}"/></clipPath>`).join(''));
    rec.clips.forEach(([i, id]) => bakeWrap(st[i], 'clip-path', id));
    svg.insertBefore(im, [...svg.children].find(c => c.tagName !== 'defs'));
    rec.statics.forEach(i => st[i].classList.add('bk')); svg.classList.add('baked');
    const tM = performance.now();
    if (rec.gpu) gpuMount(svg, gen, rec, stAll).then(ok => DBG.row('gpu', { ok, laerred: !!GPU.cv, fuld: !!GPU.full, ms: Math.round(performance.now() - tM), lag: rec.gpu.items.length, roedder: rec.gpu.roots.length, stykker: rec.gpu.pieces.length, ark: rec.gpu.sheets.length, drevet: DRIVE.jobs, smilTilbage: svg.querySelectorAll(SMIL_SEL).length }))
      .catch(e => DBG.row('fejl', { besked: 'gpu: ' + e.message })).finally(() => { BAKE.ok = gen; });
    else BAKE.ok = gen;
    DBG.row('bagt', { fraLager: cached, billede: rec.statics.length, klippet: rec.clips.length, px: rec.px, ms: rec.ms, faser: cached ? undefined : rec.faser });
  };
  if (im.decode) im.decode().then(swap, swap); else swap();
}
/* en klippe-gruppe isolerer sit indhold; har elementet en blandingstilstand (fx nattens farvelag), skal gruppen have den i stedet */
function bakeWrap(el, attr, id, orig = el){
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute(attr, `url(#${id})`);
  const bm = getComputedStyle(orig).mixBlendMode;
  if (bm && bm !== 'normal'){ g.style.mixBlendMode = bm; el.style.mixBlendMode = 'normal'; }
  el.parentNode.insertBefore(g, el); g.append(el);
}
function bakeNow(svg, gen, key, sc, gpuOn){
  /* lr: lærreds-byen fuldt ud. Alt synligt på kortet kommer på lærredet (billedet, bevægelige ting, ting man kan trykke på,
     tekst, billeder og nattens farvelag), og SVG'en ligger usynlig ovenpå og tager kun imod tryk. Kan en bagning ikke
     få alt med, bages der om på den gamle måde (BAKE.noLr), hvor SVG'en stadig vises oven på lærredet */
  const lr = gpuOn && laerredWanted() && !BAKE.noLr, HARD_LR = '#chars,#bubbles,#hiddenStars,#jets,.bird,.sparkle,.peek,.hstar';
  const lrBad = []; let shade = null;
  if (!svg.isConnected || gen !== BAKE.gen) return;
  const T0 = performance.now(), NS = 'http://www.w3.org/2000/svg';
  /* hvor tiden går (til loggen): sortering (heraf rent arbejde), kopien, billedets indlæsning, tegning og pakning, og arket */
  const F = { bidder: 0, arbejde: 0 }; let fT = T0; const lap = k => { const n = performance.now(); F[k] = Math.round(n - fT); fT = n; };
  let ctm = svg.getScreenCTM(); if (!ctm) return;
  let inv = ctm.inverse(); const pt = new DOMPoint();
  const map = r => { const a = new DOMPoint(r.left, r.top).matrixTransform(inv), b = new DOMPoint(r.right, r.bottom).matrixTransform(inv); return [a.x, a.y, b.x, b.y]; };
  /* skærmens pixelgitter i kortets enheder: felter og billedets kanter lægges præcis på pixelkanter.
     Så kan et hul i billedet og den levende kopi (eller lappen) mødes uden en lys kant imellem */
  const dpr = window.devicePixelRatio || 1;
  /* med kameraet: gitteret regnes fra verdenens hjørne (laget flyttes kun hele skærmpixels) */
  const gpx = CAM.on && gpuOn ? CAM.k * dpr : 0, ep = f => f === Math.floor ? 1e-4 : -1e-4;
  const gx = (u, f) => gpx ? CAM_X[0] + f((u - CAM_X[0]) * gpx + ep(f)) / gpx : (f((ctm.a * u + ctm.e) * dpr + ep(f)) / dpr - ctm.e) / ctm.a;
  const gy = (u, f) => gpx ? CAM_Y[0] + f((u - CAM_Y[0]) * gpx + ep(f)) / gpx : (f((ctm.d * u + ctm.f) * dpr + ep(f)) / dpr - ctm.f) / ctm.d;
  /* på grafikchippen kan vejret (#fx) flyttes med; ellers forbliver det levende */
  const LIVE_BOX = '[data-tap],#chars,#bubbles,#hiddenStars,#jets,.bird,.sparkle,.peek,.hstar,.tapzone,.tapjump' + (gpuOn ? '' : ',#fx');
  /* det, koden selv flytter rundt på, kan aldrig på grafikchippen. Ting man kan trykke på, kan: deres hop og skjul spejles over på laget */
  const HARD_LIVE = '#chars,#bubbles,#hiddenStars,#jets,.bird,.sparkle,.peek,.hstar,.tapzone' + (gpuOn ? '' : ',#fx');
  const mirrorable = e => gpuOn && !e.closest(HARD_LIVE);
  const all = [...svg.querySelectorAll('*')], leaves = bakeLeaves(svg);
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
  /* rødder til grafikchippen: øverste animerede element, som kan oversættes, ikke er levende og ikke ligger under noget levende */
  const gpuRoots = new Map(), gpuLeaves = new Set();
  const tapRootOk = T => {
    if (T.querySelector(HARD_LIVE.replace(',.tapzone', '')) || !gpuConvertible(T)) return false;
    /* tekst (skilte) bliver i SVG'en ovenpå; det går kun, når teksten kommer efter alt det, der bevæger sig */
    const an = [...T.querySelectorAll(SMIL_SEL)], lastA = an[an.length - 1];
    if ([...T.querySelectorAll('text,image,foreignObject')].some(t => !(lastA.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING))) return false;
    for (let x = T.parentElement; x && x !== svg; x = x.parentElement) if (x.getAttribute('filter') || x.getAttribute('mask') || x.getAttribute('clip-path') || getComputedStyle(x).mixBlendMode !== 'normal') return false;
    /* noget levende før den, som den overlapper, ville ellers havne ovenpå */
    const b = map(T.getBoundingClientRect());
    return !dyn.some(d => d.t === 'l' && !d.mov && b[0] < d[2] && b[2] > d[0] && b[1] < d[3] && b[3] > d[1] && overlaps(T, b, d)); };
  const gpuRootOf = ag => {
    let r = ag; for (let x = ag.parentElement; x && x !== svg; x = x.parentElement) if (smilKids(x).length) r = x;
    if (gpuRoots.has(r)) return gpuRoots.get(r);
    /* en ting man kan trykke på (fx brønden, ænderne) flyttes helst hel, med sine stillestående dele; dens hop spejles */
    const T = gpuOn ? r.closest('[data-tap]') : null;
    if (T && mirrorable(T) && !gpuRoots.has(T)){ const t = tapRootOk(T); gpuRoots.set(T, t ? T : null); }
    if (T && gpuRoots.get(T) === T){ gpuRoots.set(r, T); return T; }
    let ok = (!r.closest(LIVE_BOX) || mirrorable(r)) && !r.querySelector(LIVE_BOX) && gpuConvertible(r);
    for (let x = r.parentElement; ok && x && x !== svg; x = x.parentElement) if (x.getAttribute('filter') || x.getAttribute('mask') || x.getAttribute('clip-path') || getComputedStyle(x).mixBlendMode !== 'normal') ok = false;
    if (ok){ const b = map(r.getBoundingClientRect()), q = reachOf(r), bb = [b[0] - q.dx - 4, b[1] - q.dy - 4, b[2] + q.dx + 4, b[3] + q.dy + 4];
      if (q.extra){ bb[0] = Math.min(bb[0], q.extra[0] - 40); bb[1] = Math.min(bb[1], q.extra[1] - 40); bb[2] = Math.max(bb[2], q.extra[2] + 40); bb[3] = Math.max(bb[3], q.extra[3] + 40); }
      /* noget levende (fx en figur eller et skilt) under den, ville havne ovenpå; så bliver den i SVG'en */
      /* levende ting der selv bevæger sig (fx ildfluer), tæller ikke: de rører kun kortvarigt og ses næppe i forkert rækkefølge */
      /* står roden stille (blinker, vipper), sammenlignes de præcise former; bevæger den sig, bruges hele dens område */
      const still = !q.dx && !q.dy && !q.extra, rl = r instanceof SVGGeometryElement ? [r] : [...r.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line')];
      const rbox = Object.assign([...bb], { el: null });
      /* ting der flytter sig rundt, kan kun kortvarigt havne forkert, så dem flytter vi altid */
      const hit = still && dyn.find(d => d.t === 'l' && !d.mov && bb[0] < d[2] && bb[2] > d[0] && bb[1] < d[3] && bb[3] > d[1] && (() => {
        const ix0 = Math.max(bb[0], d[0]), iy0 = Math.max(bb[1], d[1]), ix1 = Math.min(bb[2], d[2]), iy1 = Math.min(bb[3], d[3]); if (ix0 >= ix1 || iy0 >= iy1) return false;
        const n = Math.max(2, Math.min(9, Math.ceil(Math.max(ix1 - ix0, iy1 - iy0) / 5)));
        for (let a = 0; a <= n; a++) for (let c = 0; c <= n; c++){ const x = ix0 + (ix1 - ix0) * a / n, y = iy0 + (iy1 - iy0) * c / n;
          if ((!d.el || inside(d.el, x, y)) && (!still || rl.some(l => inside(l, x, y)))) return true; }
        return false; })());
      if (hit){ ok = false; if (window.BAKE_LOG){ const o = hit.src || 'ukendt'; (BAKE.hits = BAKE.hits || {})[o] = (BAKE.hits[o] || 0) + 1; (BAKE.ex = BAKE.ex || []).push([o, hit.map(Math.round).join(','), bb.map(Math.round).join(','), still, r.outerHTML.slice(0, 90)]); } } }
    if (window.BAKE_LOG && !ok){ const why = r.closest(LIVE_BOX) ? 'levende' : r.querySelector(LIVE_BOX) ? 'indeholder levende' : !gpuConvertible(r) ? 'kan ikke oversættes' : (() => { for (let x = r.parentElement; x && x !== svg; x = x.parentElement){ if (x.getAttribute('filter')) return 'forfader filter'; if (x.getAttribute('mask')) return 'forfader maske'; if (x.getAttribute('clip-path')) return 'forfader klip ' + (x.getAttribute('clip-path')); if (getComputedStyle(x).mixBlendMode !== 'normal') return 'forfader blend'; } return 'overlap'; })(); (BAKE.why = BAKE.why || {})[why] = (BAKE.why[why] || 0) + 1; }
    const v = ok ? r : null; gpuRoots.set(r, v); return v; };
  /* lærreds-byen: roden for et blad er den yderste forfader, der er animeret eller kan trykkes på (eller bladet selv, hvis det er et støvfnug) */
  const lrRootOf = new Map();
  const lrRoot = e => { let c = null; for (let x = e; x && x !== svg; x = x.parentElement) if (smilKids(x).length || x.matches('[data-tap],.mote')) c = x;
    if (!c) return null; if (lrRootOf.has(c)) return lrRootOf.get(c);
    let ok = !c.closest(HARD_LR) && !c.querySelector(HARD_LR) && gpuConvertible(c) && !c.querySelector('foreignObject');
    for (let x = c.parentElement; ok && x && x !== svg; x = x.parentElement) if (x.getAttribute('filter') || x.getAttribute('mask') || x.getAttribute('clip-path') || getComputedStyle(x).mixBlendMode !== 'normal') ok = false;
    const v = ok ? c : null; lrRootOf.set(c, v); if (v) gpuRoots.set(c, c); return v; };
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
    refresh(); const c0 = performance.now(), until = c0 + (window.BAKE_CHUNK || 12); F.bidder++;
    for (; li < leaves.length && performance.now() < until; li++){ const e = leaves[li];
    const b = map(e.getBoundingClientRect());
    const ag = isAnim(e), transparent = !ag && bakeInvisible(e);
    if (lr){
      const blend = getComputedStyle(e).mixBlendMode;
      if (blend !== 'normal'){ /* nattens farvelag: ganges ind i lærredets billeder; her huskes kun, hvor i rækkefølgen det ligger */
        const cs = getComputedStyle(e), col = (cs.fill.match(/[\d.]+/g) || []).map(Number); let al = (+cs.opacity) * (+cs.fillOpacity) * (col[3] ?? 1);
        for (let x = e.parentElement; x && x !== svg; x = x.parentElement) al *= +getComputedStyle(x).opacity;
        if (blend !== 'multiply' || shade || col.length < 3 || e.tagName !== 'rect'){ lrBad.push('farvelag ' + blend); live.add(e); continue; }
        shade = { el: e, k: col.slice(0, 3).map(c => +(1 - al + al * c / 255).toFixed(5)) }; gpuLeaves.add(e);
        const bb = [...b]; bb.t = 'g'; dyn.push(bb); continue; }
      const ti = /^(text|image)$/.test(e.tagName); let R = lrRoot(e);
      if (!R && ti && !e.closest(HARD_LR)){ R = e; gpuRoots.set(e, e); }
      if (R){ gpuLeaves.add(e); if (transparent) continue;
        const q = ag ? reachOf(ag) : { dx: 0, dy: 0 }, w = (b[2] - b[0]) / 2, h = (b[3] - b[1]) / 2, mo = e.classList.contains('mote') ? 60 : 4; let bb = [b[0] - q.dx - mo, b[1] - q.dy - mo, b[2] + q.dx + mo, b[3] + q.dy + mo];
        if (q.extra) bb = [Math.min(bb[0], q.extra[0] - w), Math.min(bb[1], q.extra[1] - h), Math.max(bb[2], q.extra[2] + w), Math.max(bb[3], q.extra[3] + h)];
        if (bb[2] > bb[0] && bb[3] > bb[1]){ bb.t = 'g'; dyn.push(bb); }
        continue; }
      if (ag || transparent || e.closest(HARD_LR) || e.tagName === 'foreignObject'){
        live.add(e); if (transparent) continue;
        if (!e.closest(HARD_LR)) lrBad.push(e.tagName + '.' + (e.getAttribute('class') || '') + ' i ' + (((e.closest('[data-tap]') || {}).dataset || {}).tap || (e.closest('[id]') || {}).id || '?'));
        const bb = [...b]; bb.el = e; if (bb[2] > bb[0] && bb[3] > bb[1]){ bb.t = 'l'; if (ag) bb.mov = true; dyn.push(bb); }
        continue; }
    } else {
    /* blad i en ting man kan trykke på, som flyttes hel til grafikchippen? */
    const T = gpuOn ? e.closest('[data-tap]') : null, a0 = T && mirrorable(T) ? T.querySelector(SMIL_SEL) : null, tapR = a0 && !/^(text|image|foreignObject)$/.test(e.tagName) && gpuRootOf(a0.parentElement) === T ? T : null;
    const fixedLive = !tapR && (/^(text|image|foreignObject)$/.test(e.tagName) || (e.closest(LIVE_BOX) && !(ag && mirrorable(e))) || transparent
        /* på grafikchippen: farvelag med blandingstilstand (natten) forbliver hele i SVG'en og blander med lagene under sig */
        || (gpuOn && getComputedStyle(e).mixBlendMode !== 'normal'));
    const gr = tapR || (ag && gpuOn && !fixedLive ? gpuRootOf(ag) : null);
    if (gr){
      gpuLeaves.add(e);
      const q = ag ? reachOf(ag) : { dx: 0, dy: 0 }, w = (b[2] - b[0]) / 2, h = (b[3] - b[1]) / 2; let bb = [b[0] - q.dx - 4, b[1] - q.dy - 4, b[2] + q.dx + 4, b[3] + q.dy + 4];
      if (q.extra) bb = [Math.min(bb[0], q.extra[0] - w), Math.min(bb[1], q.extra[1] - h), Math.max(bb[2], q.extra[2] + w), Math.max(bb[3], q.extra[3] + h)];
      if (bb[2] > bb[0] && bb[3] > bb[1]){ bb.t = 'g'; dyn.push(bb); }
      continue;
    }
    if (ag || fixedLive){
      live.add(e);
      if (transparent) continue;                                     // usynlige trykflader dækker ikke noget
      let bb;
      if (ag){ const r = reachOf(ag), w = (b[2] - b[0]) / 2, h = (b[3] - b[1]) / 2; bb = [b[0] - r.dx - 4, b[1] - r.dy - 4, b[2] + r.dx + 4, b[3] + r.dy + 4];
        if (r.extra) bb = [Math.min(bb[0], r.extra[0] - w), Math.min(bb[1], r.extra[1] - h), Math.max(bb[2], r.extra[2] + w), Math.max(bb[3], r.extra[3] + h)]; }
      else if (!gpuOn && e.closest('[data-tap],.tapjump')) bb = [b[0] - 14, b[1] - 24, b[2] + 14, b[3] + 6];       // ting der hopper, når man trykker
      else { bb = [...b]; bb.el = e; }                                  // tekst, figurer o.l.: præcis form (et kort hop ses næppe)
      if (bb[2] > bb[0] && bb[3] > bb[1]){ bb.t = 'l'; if (ag) bb.mov = true; if (window.BAKE_LOG){ const L = e.closest(LIVE_BOX); bb.src = (ag ? 'anim ' : 'fast ') + (L ? (L.id || L.dataset.tap || L.getAttribute('class')) : e.tagName); } dyn.push(bb); }
      continue;
    }
    }
    if (b[2] - b[0] <= 0 || b[3] - b[1] <= 0) continue;
    x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
    /* felter: hvor den ligger oven på noget levende (l) eller noget på grafikchippen (g) */
    const R = { l: [], g: [] };
    for (const d of dyn){ if (!overlaps(e, b, d)) continue;
      const r = [gx(Math.max(b[0], d[0]) - 1, Math.floor), gy(Math.max(b[1], d[1]) - 1, Math.floor), gx(Math.min(b[2], d[2]) + 1, Math.ceil), gy(Math.min(b[3], d[3]) + 1, Math.ceil)], regs = R[d.t || 'l'];
      if (!regs.some(q => q[0] <= r[0] && q[1] <= r[1] && q[2] >= r[2] && q[3] >= r[3])) regs.push(r); }
    if (R.l.length || R.g.length){
      /* felter der overlapper hinanden, slås sammen, så de kan bruges som huller i billedet */
      for (const t of ['l', 'g']){ const regs = R[t];
        for (let k = 0; k < regs.length; k++) for (let m = k + 1; m < regs.length; m++){ const A = regs[k], B = regs[m];
          if (A[0] < B[2] && A[2] > B[0] && A[1] < B[3] && A[3] > B[1]){ regs[k] = [Math.min(A[0], B[0]), Math.min(A[1], B[1]), Math.max(A[2], B[2]), Math.max(A[3], B[3])]; regs.splice(m, 1); k = -1; break; } }
        regs.forEach(r => { const nb = [...r]; nb.el = e; nb.t = t; if (t === 'l' && !dyn.some(d => d.t === 'l' && !d.mov && r[0] < d[2] && r[2] > d[0] && r[1] < d[3] && r[3] > d[1])) nb.mov = true; if (window.BAKE_LOG) nb.src = 'lap(' + e.tagName + ')<' + (dyn.find(d => d.t === t && r[0] < d[2] && r[2] > d[0] && r[1] < d[3] && r[3] > d[1]) || {}).src; dyn.push(nb); }); }
      clipped.set(e, R); }
    }
    BAKE.prog = li / leaves.length; F.arbejde += performance.now() - c0;
    if (li < leaves.length){ setTimeout(step, window.BAKE_GAP ?? 16); return; }
    refresh(); finish();
  };
  const finish = () => {
  F.arbejde = Math.round(F.arbejde); lap('sorter');
  const statics = leaves.filter(e => !live.has(e) && !gpuLeaves.has(e) && !clipped.has(e));
  if (window.BAKE_LOG) console.log('bage', leaves.length, 'levende', live.size, 'klippet', clipped.size, 'billede', statics.length, Math.round(performance.now() - T0) + 'ms');
  if (lr && lrBad.length){ DBG.row('fejl', { besked: 'lærred: kan ikke alt med, bager på den gamle måde', ting: [...new Set(lrBad)].slice(0, 12), antal: lrBad.length }); if (window.BAKE_LOG) console.log('lr: ikke alt med', lrBad);
    BAKE.noLr = true; bakeNow(svg, gen, key, sc, gpuOn); return; }
  if (statics.length + clipped.size < 100 || !isFinite(x0)) return;
  /* kun det, man kan komme til at se: kameraets område og det der er på skærmen nu */
  const vis = map(svg.getBoundingClientRect());
  x0 = gx(Math.max(x0, Math.min(-160, vis[0])), Math.floor); y0 = gy(Math.max(y0, Math.min(-120, vis[1])), Math.floor);
  x1 = gx(Math.min(x1, Math.max(1760, vis[2])), Math.ceil); y1 = gy(Math.min(y1, Math.max(1000, vis[3])), Math.ceil);
  const W = x1 - x0, H = y1 - y0;
  /* helst præcis skærmens opløsning (én billedpixel pr. skærmpixel) */
  const exact = gpx || ctm.a * dpr; let px = exact >= 1 && exact <= 2.2 ? exact : sc; while (W * H * px * px > 8e6) px *= 0.92;
  /* felterne omregnes til elementets forælders koordinater (den kan være flyttet, drejet og skaleret) */
  const quads = (e, regs) => { const pc = e.parentElement.getScreenCTM(); if (!pc || !regs.length) return null;
    const m = pc.inverse().multiply(ctm), P = (x, y) => { pt.x = x; pt.y = y; const q = pt.matrixTransform(m); return `${q.x.toFixed(2)} ${q.y.toFixed(2)}`; };
    return regs.map(r => `M ${P(r[0], r[1])} L ${P(r[2], r[1])} L ${P(r[2], r[3])} L ${P(r[0], r[3])} Z`); };
  const opaque = e => { const cs = getComputedStyle(e); if (/url|rgba|transparent/.test(cs.fill + ' ' + cs.stroke) || +cs.fillOpacity < 1 || +cs.strokeOpacity < 1 || cs.filter !== 'none' || e.getAttribute('filter')) return false;
    for (let x = e; x && x !== svg; x = x.parentElement){ const c = getComputedStyle(x); if (+c.opacity < 1 || x.getAttribute('filter') || x.getAttribute('mask') || c.mixBlendMode !== 'normal') return false; } return true; };
  /* gennemsigtige ting oven på grafikchippen giver synlige kanter, hvis de deles mellem billedet og en lap.
     Ligger intet efter dem oven på dem (fx skyggen i kortets kanter), bliver de hele i SVG'en i stedet */
  { const pos = new Map(); leaves.forEach((e, i) => pos.set(e, i)); const boxes = new Map(), boxOf = e => { let b = boxes.get(e); if (!b){ b = map(e.getBoundingClientRect()); boxes.set(e, b); } return b; };
    const vis0 = map(svg.getBoundingClientRect());
    [...clipped].filter(([e, R]) => R.g.length && !opaque(e)).forEach(([e]) => { const b = boxOf(e), i0 = pos.get(e);
      const c = [Math.max(b[0], vis0[0]), Math.max(b[1], vis0[1]), Math.min(b[2], vis0[2]), Math.min(b[3], vis0[3])];
      /* et lag over hele kortet (skyggen i kanterne) må gerne ligge over senere ting på grafikchippen; det ses ikke */
      const big = (c[2] - c[0]) * (c[3] - c[1]) > 0.5 * (vis0[2] - vis0[0]) * (vis0[3] - vis0[1]);
      for (let i = i0 + 1; i < leaves.length; i++){ const f = leaves[i]; if (live.has(f) || (big && gpuLeaves.has(f))) continue; const d = boxOf(f);
        if (d[0] < c[2] && d[2] > c[0] && d[1] < c[3] && d[3] > c[1]){ if (window.BAKE_LOG) (BAKE.blk = BAKE.blk || []).push(e.tagName + (e.getAttribute('fill') || '').slice(0, 12) + ' <- ' + f.tagName + '.' + (f.getAttribute('class') || '') + ' ' + (f.parentElement.getAttribute('class') || f.parentElement.id || '') + (gpuLeaves.has(f) ? ' GPU' : clipped.has(f) ? ' klip' : ' fast')); return; } }
      clipped.delete(e); if (lr){ gpuRoots.set(e, e); gpuLeaves.add(e); } else live.add(e); if (window.BAKE_LOG) (BAKE.toLive = BAKE.toLive || []).push(e.tagName + ' ' + b.map(Math.round).join(',')); }); }
  if (window.BAKE_LOG) BAKE.seam = [...clipped].filter(([e, R]) => R.g.length && !opaque(e)).map(([e, R]) => { const cs = getComputedStyle(e); let o = 1; for (let x = e; x && x !== svg; x = x.parentElement) o *= +getComputedStyle(x).opacity; return [e.tagName, e.parentElement.getAttribute('class') || e.parentElement.id || '', cs.fill.slice(0, 22), +cs.fillOpacity, o.toFixed(2), R.g.map(r => r.map(Math.round).join(',')).join(' ; ')]; });
  /* en klippe-gruppe isolerer sit indhold; har elementet en blandingstilstand (fx nattens farvelag), skal gruppen have den i stedet */
  /* grafikchippen: træer for de animerede rødder og 'lapper' af stillestående ting, der ligger oven på dem */
  let gpuSpec = null;
  if (gpuOn){ GPU.lrBake = lr; try { gpuSpec = gpuPlan(); } catch (er){ DBG.row('fejl', { besked: 'gpu-plan: ' + er.message }); gpuSpec = null; } }
  function gpuPlan(){
    const roots = [...new Set([...gpuRoots.values()].filter(Boolean))], rootSet = new Set(roots), pieces = [], extra = [], items = [];
    const toMap = el => mtx(ctm.inverse().multiply(el.getScreenCTM()));
    let group = [];
    const flushGroup = () => { if (!group.length) return;
      /* klynger af felter, så lapperne ikke bliver unødigt store */
      const regs = []; group.forEach(e => clipped.get(e).g.forEach(r => regs.push({ r: [...r], e })));
      const cl = []; regs.forEach(x => { let c = cl.find(c => c.some(y => x.r[0] < y.r[2] + 2 && x.r[2] > y.r[0] - 2 && x.r[1] < y.r[3] + 2 && x.r[3] > y.r[1] - 2)); if (c) c.push(x); else cl.push([x]); });
      for (let k = 0; k < cl.length; k++) for (let m = k + 1; m < cl.length; m++) if (cl[k].some(x => cl[m].some(y => x.r[0] < y.r[2] + 2 && x.r[2] > y.r[0] - 2 && x.r[1] < y.r[3] + 2 && x.r[3] > y.r[1] - 2))){ cl[k] = cl[k].concat(cl[m]); cl.splice(m, 1); m = k; }
      cl.forEach(c => {
        /* lappen skæres til det område, billedet dækker (kameraets område); udenfor kan intet ses.
           Skyggen i kortets kanter gav ellers én lap på 2163x2176, som fyldte over 80 % af arket */
        const bx0 = Math.max(x0, Math.min(...c.map(x => x.r[0]))), by0 = Math.max(y0, Math.min(...c.map(x => x.r[1]))), bx1 = Math.min(x1, Math.max(...c.map(x => x.r[2]))), by1 = Math.min(y1, Math.max(...c.map(x => x.r[3])));
        if (bx1 <= bx0 || by1 <= by0) return;
        const byEl = new Map(); c.forEach(x => { if (!byEl.has(x.e)) byEl.set(x.e, []); byEl.get(x.e).push(x.r); });
        /* en ting med blandingstilstand (nattens farvelag) får sin egen lap, så kun den blander med lagene under sig */
        let markup = '', blend = null, k = 0;
        const emit = () => { if (!markup) return; extra.push({ markup, x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0, blend }); items.push({ p: -extra.length }); markup = ''; blend = null; };
        group.filter(e => byEl.has(e)).forEach(e => { const q = quads(e, byEl.get(e)); if (!q) return; const id = 'gp' + gen + '_' + extra.length + '_' + (k++);
          const bm = getComputedStyle(e).mixBlendMode, b2 = bm !== 'normal' ? bm : null; if (b2 !== blend){ emit(); blend = b2; }
          const chain = []; for (let x = e.parentElement; x && x !== svg; x = x.parentElement) chain.unshift(x);
          let open = '', close = ''; chain.forEach(a => { const g = a.cloneNode(false); ['transform', 'opacity', 'filter', 'mask', 'clip-path', 'id', 'style', 'data-tap'].forEach(nm => { if (!(lr && nm === 'opacity')) g.removeAttribute(nm); });   /* (lærreds-byen: forfædrenes gennemsigtighed skal med i lappen, fx vinduernes lys om aftenen) */
            const cf = getComputedStyle(a).filter; if (cf && cf !== 'none' && !a.getAttribute('filter')) g.setAttribute('style', 'filter:' + cf);
            const s0 = new XMLSerializer().serializeToString(g).replace(/\s*xmlns="[^"]*"/, ''), i = s0.lastIndexOf('</'); open += i > 0 ? s0.slice(0, i) : s0.replace(/\/>$/, '>'); close = `</${g.tagName}>` + close; });
          const c2 = e.cloneNode(true); c2.style && (c2.style.mixBlendMode = '');
          markup += `<g transform="matrix(${toMap(e.parentElement).join(' ')})"><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${q.join(' ')}"/></clipPath>${open}<g clip-path="url(#${id})">${new XMLSerializer().serializeToString(c2).replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')}</g>${close}</g>`; });
        emit();
      });
      group = []; };
    /* en stillestående rod, der kun er ét stykke (fx de mørke kanter, der dækker langt mere end kortet), skæres til billedets område.
       Er den en blød farveovergang uden kanter, gemmes den i kvart opløsning; det kan ikke ses, og den fylder 16 gange mindre */
    const cropStill = spec => { if (spec.c.length !== 1 || spec.c[0].p == null || spec.w.some(w => w.a)) return;
      let M = [1, 0, 0, 1, 0, 0]; for (const w of spec.w) if (w.m){ const A = M, B = w.m; M = [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]]; }
      if (Math.abs(M[1]) > 1e-6 || Math.abs(M[2]) > 1e-6 || !M[0] || !M[3]) return;
      const pc = pieces[spec.c[0].p], ax = [(x0 - M[4]) / M[0], (x1 - M[4]) / M[0]], ay = [(y0 - M[5]) / M[3], (y1 - M[5]) / M[3]];
      const nx0 = Math.max(pc.x, Math.floor(Math.min(ax[0], ax[1]))), ny0 = Math.max(pc.y, Math.floor(Math.min(ay[0], ay[1]))), nx1 = Math.min(pc.x + pc.w, Math.ceil(Math.max(ax[0], ax[1]))), ny1 = Math.min(pc.y + pc.h, Math.ceil(Math.max(ay[0], ay[1])));
      if (nx1 > nx0 && ny1 > ny0){ pc.x = nx0; pc.y = ny0; pc.w = nx1 - nx0; pc.h = ny1 - ny0; } else { pc.w = pc.h = 1; }
      const e = pc.els[0], cs = pc.self && pc.els.length === 1 && /^(rect|ellipse|circle)$/.test(e.tagName) ? getComputedStyle(e) : null;
      if (cs && /^url\(/.test(cs.fill) && cs.stroke === 'none' && !e.getAttribute('filter') && cs.filter === 'none' && pc.w * pc.h * M[0] * M[3] * px * px > 4e5) pc.q = .25; };
    const walk = el => { for (const c of el.children){
      if (shade && c === shade.el){ flushGroup(); items.push({ sk: 1 }); continue; }
      if (rootSet.has(c)){ flushGroup(); const op = []; let o = 1; for (let x = c.parentElement; x && x !== svg; x = x.parentElement){ const v = parseFloat(x.getAttribute('opacity')); if (v >= 0 && v < 1) o *= v; }
        const spec = gpuNodeSpec(c, toMap(c.parentElement), pieces, NS); if (o < 1) spec.w.unshift({ o }); cropStill(spec);
        const mir = []; for (let x = c.parentElement; x && x !== svg; x = x.parentElement) if (x.matches(LIVE_BOX) || x.matches(GPU_MIRROR)) mir.unshift(x);
        if (c.matches(GPU_MIRROR)) mir.push(c);
        if (mir.length) spec.mirEl = mir;
        items.push(spec); continue; }
      if (clipped.has(c) && clipped.get(c).g.length){ group.push(c); continue; }
      if (c.children.length && !/^(defs|clipPath|mask|pattern|linearGradient|radialGradient|filter|symbol|marker)$/.test(c.tagName)) walk(c); } };
    walk(svg); flushGroup();
    return { roots, pieces, extra, items };
  }
  async function gpuFinish(gs){
    /* bladenes markup skal laves, mens SVG'en er urørt; derefter tegnes arkene */
    gs.pieces.forEach(pc => { pc.markup = gpuPieceMarkup(pc, svg); }); lap('stykker');
    /* store stykker uden noget synligt findes først på en lille prøvetegning; så tegnes arket kun én gang og kun med det, der bruges */
    const all = gs.pieces.concat(gs.extra); F.tomme = await gpuMarkEmpty(svg, all, px); lap('proeve');
    if (gen !== BAKE.gen) throw new Error('afbrudt');
    const sheets = gpuAtlas(svg, gs.pieces, gs.extra, px), blobs = []; lap('ark');
    const cvs = []; for (const sh of sheets){ cvs.push(await gpuRasterSheet(sh)); if (gen !== BAKE.gen) throw new Error('afbrudt'); }
    /* nattens farvelag ganges ind i de stykker, der ligger før det i rækkefølgen (dem efter, fx lys i vinduer, skal ikke farves) */
    let felter = null;
    if (lr && shade){ felter = []; let on = true; const mark = it => { if (it.sk){ on = false; return; } if (it.p != null){ const pc = all[it.p < 0 ? gs.pieces.length + (-it.p - 1) : it.p]; if (on && pc && !pc.empty) felter.push([pc.sheet, pc.ax, pc.ay, pc.aw, pc.ah]); return; } if (it.c) it.c.forEach(mark); }; gs.items.forEach(mark); }
    lap('arkTegn'); for (let i = 0; i < cvs.length; i++) blobs.push(await PNGW.encode(cvs[i], felter ? { k: shade.k, rects: felter.filter(r => r[0] === i).map(r => r.slice(1)) } : null));
    if (gen !== BAKE.gen) throw new Error('afbrudt');
    lap('arkPng'); F.arkPx = sheets.map(sh => sh.W + 'x' + sh.H).join(',');
    const sAll = bakeStableAll(svg), aidx = new Map(); sAll.forEach((e, k) => aidx.set(e, k));
    const fixP = it => { if (it.d || it.t || it.im || it.sk) return; if (it.p != null){ it.p = it.p < 0 ? gs.pieces.length + (-it.p - 1) : it.p; return; } it.c.forEach(fixP); };
    gs.items.forEach(fixP);
    const fixM = it => { if (it.mirEl){ it.mir = it.mirEl.map(e => aidx.get(e)); delete it.mirEl; if (it.mir.some(v => v == null)) delete it.mir; } if (it.im && it.im.el){ it.im.i = aidx.get(it.im.el); delete it.im.el; } if (it.c) it.c.forEach(fixM); };
    gs.items.forEach(fixM);
    return { nAll: sAll.length, sheets: blobs, roots: gs.roots.map(r => aidx.get(r)),
      pieces: all.map((pc, i) => pc.empty ? null : ({ sheet: pc.sheet, ax: pc.ax, ay: pc.ay, aw: pc.aw, ah: pc.ah, x: pc.x, y: pc.y, w: pc.w, h: pc.h, blend: pc.blend || null, fix: i >= gs.pieces.length })), px, items: gs.items };
  }
  /* kopien til billedet: uden det levende. Gennemsigtige klippede ting får hul i deres felter, så de ikke tegnes dobbelt */
  const idx = new Map(); all.forEach((e, i) => idx.set(e, i));
  const cl = svg.cloneNode(true), call = [...cl.querySelectorAll('*')];
  all.forEach((e, i) => { const cs = getComputedStyle(e); if (cs.filter && cs.filter !== 'none' && !e.getAttribute('filter')) call[i].style.filter = cs.filter; });
  let cdefs = cl.querySelector('defs'); if (!cdefs){ cdefs = document.createElementNS(NS, 'defs'); cl.prepend(cdefs); }
  let n = 0; const liveClips = [];
  /* huller i billedet må ikke overlappe (så ophæver de hinanden), så levende og grafikchip-felter slås sammen først */
  const mergeRegs = regs => { regs = regs.map(r => [...r]);
    for (let k = 0; k < regs.length; k++) for (let m = k + 1; m < regs.length; m++){ const A = regs[k], B = regs[m];
      if (A[0] < B[2] && A[2] > B[0] && A[1] < B[3] && A[3] > B[1]){ regs[k] = [Math.min(A[0], B[0]), Math.min(A[1], B[1]), Math.max(A[2], B[2]), Math.max(A[3], B[3])]; regs.splice(m, 1); k = -1; break; } }
    return regs; };
  clipped.forEach((R, e) => { const id = 'bk' + gen + '_' + (n++), ql = quads(e, R.l), q = quads(e, mergeRegs(R.l.concat(R.g))); if (!q) return;
    if (ql) liveClips.push([e, id, ql.join(' ')]); else statics.push(e);       // kun under grafikchippen: billedet + lappen dækker den
    /* gennemsigtige ting får huller i billedet, hvor de tegnes levende (et klip med huller er langt billigere end en maske) */
    if (!opaque(e)){ cdefs.insertAdjacentHTML('beforeend', `<clipPath id="${id}h" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="M -9000 -9000 H 9000 V 9000 H -9000 Z ${q.join(' ')}"/></clipPath>`);
      bakeWrap(call[idx.get(e)], 'clip-path', id + 'h', e); } });
  live.forEach(e => call[idx.get(e)].remove()); gpuLeaves.forEach(e => call[idx.get(e)].remove());
  cl.querySelectorAll('animate,animateTransform,animateMotion,set').forEach(a => a.remove());
  cl.setAttribute('viewBox', `${x0} ${y0} ${W} ${H}`); cl.setAttribute('width', Math.round(W * px)); cl.setAttribute('height', Math.round(H * px));
  cl.setAttribute('preserveAspectRatio', 'none'); cl.removeAttribute('id'); cl.removeAttribute('class'); cl.setAttribute('xmlns', NS); cl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  const src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(cl)], { type: 'image/svg+xml' }));
  const img = new Image(); lap('kopi');
  img.onload = async () => {
    lap('billede'); URL.revokeObjectURL(src);
    if (gen !== BAKE.gen || !svg.isConnected) return;
    const cv = document.createElement('canvas'); cv.width = Math.round(W * px); cv.height = Math.round(H * px);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); lap('tegn');
    /* billedet pakkes som PNG i en arbejdstråd, mens arket til grafikchippen laves her */
    const tP = performance.now(), pngP = PNGW.encode(cv, lr && shade ? { k: shade.k } : null).then(b => { F.png = Math.round(performance.now() - tP); return b; }, () => null);
    const stable = bakeStable(svg), sidx = new Map(); stable.forEach((e, k) => sidx.set(e, k));
    if (statics.some(e => !sidx.has(e)) || liveClips.some(c => !sidx.has(c[0]))) return;
    let gpu = null;
    if (gpuOn && gpuSpec){ const gs = gpuSpec; gpuSpec = null;
      try { gpu = await gpuFinish(gs); } catch (er){ DBG.row('fejl', { besked: 'gpu-ark: ' + er.message }); gpu = null; } }
    const bl = await pngP;
    if (!bl || gen !== BAKE.gen || !svg.isConnected) return;
    const rec = { n: stable.length, x0, y0, W, H, png: bl, px: `${cv.width}x${cv.height}`, ms: Math.round(performance.now() - T0), ts: Date.now(), faser: F,
      statics: statics.map(e => sidx.get(e)), clips: liveClips.map(([e, id, d]) => [sidx.get(e), id, d]) };
    if (gpuOn) rec.gpu = gpu;
    if (lr && gpu){ rec.lr = 1; rec.shade = shade ? shade.k : null; }
    if (window.BAKE_LOG) console.log('bage: færdig', rec.ms + 'ms', JSON.stringify(F));
    bakeApply(svg, gen, rec, false);
    /* gem til næste gang; hold højst 16 udgaver */
    BIDB.put(key, rec).then(() => BIDB.keys()).then(ks => { if (ks.length > 16) ks.filter(k => !String(k).startsWith(VERSION + '|')).concat(ks).slice(0, ks.length - 16).forEach(k => BIDB.del(k)); });
  };
  img.onerror = () => { if (window.BAKE_LOG) console.log('bage: billedfejl'); URL.revokeObjectURL(src); DBG.row('fejl', { besked: 'bage: billedet kunne ikke tegnes' }); };
  img.src = src;
  };
  step();
}
