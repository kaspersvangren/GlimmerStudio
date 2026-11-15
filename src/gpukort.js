/* ---------- kortets animationer på grafikchippen ----------
   SVG-animationer (SMIL) får browseren til at tegne hele kortet om på processoren i hvert billede.
   Her laves hver animeret ting om til små færdigtegnede billeder (lærreder) i HTML-lag, og bevægelsen
   gives videre som CSS-animationer af flytning, drejning, skalering og gennemsigtighed. Dem kører
   grafikchippen alene, uden at processoren skal tegne noget.
   Kun animationer der kan oversættes 1:1 flyttes. Resten bliver i SVG'en som før. */
const GPU = { on: false, layer: null, cam: null, svg: null };
const GPU_KEY = 'glimmerstudiet.gpu';
/* indtil videre kun når fejlsøgningsloggen er tændt (eller slået til direkte), så det kan prøves af uden at påvirke Agnes */
function gpuWanted(){ try { const v = localStorage.getItem(GPU_KEY); if (v === '0') return false; if (v === '1') return true; return localStorage.getItem('glimmerstudiet.debug') === '1'; } catch (e){ return false; } }
const SMIL_SEL = 'animate,animateTransform,animateMotion,set';
const smilKids = el => [...el.children].filter(c => /^(animate|animateTransform|animateMotion|set)$/.test(c.tagName));
const secs = v => { if (!v) return 0; const m = String(v).trim().match(/^(-?[\d.]+)\s*(ms|s|min)?$/); if (!m) return NaN; const n = parseFloat(m[1]); return m[2] === 'ms' ? n / 1000 : m[2] === 'min' ? n * 60 : n; };

/* en stiplet streg, hvor stiplerne løber (fx åen): tegnes på et lærred fra koden, når den kun har almindelige farver */
/* en lineær farveovergang som streg (fx vandfaldet) kan genskabes på lærredet */
function gpuGrad(el, v){
  const m = /^url\(["']?#([^"')]+)["']?\)$/.exec(v || ''); if (!m) return null;
  const g = el.ownerSVGElement && el.ownerSVGElement.querySelector('#' + CSS.escape(m[1]));
  if (!g || g.tagName !== 'linearGradient' || g.getAttribute('gradientTransform') || g.getAttribute('href') || g.getAttribute('xlink:href') || (g.getAttribute('spreadMethod') || 'pad') !== 'pad') return null;
  const user = g.getAttribute('gradientUnits') === 'userSpaceOnUse', b = el.getBBox();
  const num = (n, d, w, o) => { const t = g.getAttribute(n); const pct = t != null && /%$/.test(t); if (user && pct) return NaN; const f = t == null ? d : pct ? parseFloat(t) / 100 : parseFloat(t); return user ? f : o + f * w; };
  const c = [num('x1', 0, b.width, b.x), num('y1', 0, b.height, b.y), num('x2', user ? NaN : 1, b.width, b.x), num('y2', 0, b.height, b.y)];
  if (c.some(isNaN)) return null;
  const stops = [...g.querySelectorAll('stop')].map(st => { const cs = getComputedStyle(st), o = st.getAttribute('offset') || '0', off = /%$/.test(o) ? parseFloat(o) / 100 : parseFloat(o);
    const col = cs.stopColor.match(/[\d.]+/g).map(Number), a = (col[3] ?? 1) * (+cs.stopOpacity);
    return [Math.max(0, Math.min(1, off || 0)), `rgba(${col[0]},${col[1]},${col[2]},${a})`]; });
  return stops.length ? { c, stops } : null;
}
function gpuDashOk(el){
  if (!/^(path|line|polyline)$/.test(el.tagName) || el.querySelector(':not(animate):not(animateTransform):not(animateMotion)')) return false;
  const cs = getComputedStyle(el), plain = v => v === 'none' || /^(rgb|#)/.test(v);
  if ((!plain(cs.stroke) && !gpuGrad(el, cs.stroke)) || cs.stroke === 'none' || !plain(cs.fill) || cs.strokeDasharray === 'none' || /%/.test(cs.strokeDasharray)) return false;
  if (el.getAttribute('marker-start') || el.getAttribute('marker-end') || el.getAttribute('marker-mid') || el.getAttribute('vector-effect')) return false;
  const a = smilKids(el).find(a => a.getAttribute('attributeName') === 'stroke-dashoffset');
  return !!a && !!dashVals(a);
}
function dashVals(a){
  const raw = (a.getAttribute('values') || [a.getAttribute('from'), a.getAttribute('to')].filter(v => v != null).join(';')).split(';').map(s => s.trim()).filter(s => s !== '');
  const vals = raw.map(Number); if (!vals.length || vals.some(isNaN)) return null;
  const disc = a.getAttribute('calcMode') === 'discrete', kt = a.getAttribute('keyTimes');
  const offs = kt ? kt.split(';').map(Number) : vals.map((_, i) => vals.length > 1 ? i / (vals.length - (disc ? 0 : 1)) : 0);
  if (offs.length !== vals.length) return null;
  return { vals, offs, disc, dur: secs(a.getAttribute('dur')), begin: secs(a.getAttribute('begin') || '0') };
}
function gpuDashSpec(el){
  const cs = getComputedStyle(el), a = smilKids(el).find(a => a.getAttribute('attributeName') === 'stroke-dashoffset');
  const pts = () => (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
  const path = el.tagName === 'path' ? el.getAttribute('d') : el.tagName === 'line' ? `M${+el.getAttribute('x1') || 0} ${+el.getAttribute('y1') || 0}L${+el.getAttribute('x2') || 0} ${+el.getAttribute('y2') || 0}`
    : (q => 'M' + q.reduce((s, v, i) => s + (i % 2 ? ',' : i ? ' L' : '') + v, ''))(pts());
  const b = el.getBBox(), sw = parseFloat(cs.strokeWidth) || 1, pad = sw + 4;
  return { d: Object.assign({ path, x: Math.floor(b.x - pad), y: Math.floor(b.y - pad), w: Math.ceil(b.width + 2 * pad), h: Math.ceil(b.height + 2 * pad),
    stroke: cs.stroke, grad: /^url/.test(cs.stroke) ? gpuGrad(el, cs.stroke) : null, so: +cs.strokeOpacity, fill: cs.fill, fo: +cs.fillOpacity, sw, cap: cs.strokeLinecap, join: cs.strokeLinejoin, miter: parseFloat(cs.strokeMiterlimit) || 4,
    dash: cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter(v => !isNaN(v)), off0: parseFloat(el.getAttribute('stroke-dashoffset')) || 0 }, dashVals(a)) };
}

/* kan dette element og alt dets indhold flyttes til grafikchippen? */
function gpuConvertible(root){
  const NO = /filter|mask|clip-path/;
  for (const a of root.querySelectorAll(SMIL_SEL)){
    const t = a.tagName, at = a.getAttribute('attributeName'), p = a.parentElement;
    if (t === 'set') return false;
    if (a.getAttribute('calcMode') || a.getAttribute('additive') === 'sum' || a.getAttribute('accumulate') === 'sum' || a.getAttribute('keySplines') || a.getAttribute('keyPoints')) return false;
    if ((a.getAttribute('repeatCount') || '') !== 'indefinite') return false;
    if (/[a-z]/i.test((a.getAttribute('begin') || '0s').replace(/m?s/g, ''))) return false;
    if (!(secs(a.getAttribute('dur')) > 0) || isNaN(secs(a.getAttribute('begin')))) return false;
    if (t === 'animateMotion'){ if (!a.getAttribute('path') || a.getAttribute('rotate')) return false; }
    else if (t === 'animateTransform'){ if (!/^(translate|rotate|scale|skewX|skewY)$/.test(a.getAttribute('type') || 'translate')) return false;
      if (p.querySelectorAll(':scope > animateTransform').length > 1) return false; }
    else if (at === 'opacity'){ }
    else if (/^(cx|cy|r)$/.test(at) && p.tagName === 'circle'){ }
    else if (/^(cx|cy|rx|ry)$/.test(at) && p.tagName === 'ellipse'){ }
    else if (at === 'stroke-dashoffset' && gpuDashOk(p)){ }
    else return false;
    /* animerede elementer og deres forfædre op til roden må ikke selv have filter, maske eller klip */
    for (let x = p; x; x = x === root ? null : x.parentElement) for (const n of x.getAttributeNames()) if (NO.test(n)) return false;
  }
  return true;
}

/* nøglebilleder for én SMIL-animation (WAAPI-format) */
function smilKeyframes(a, el){
  const t = a.tagName, at = a.getAttribute('attributeName'), type = a.getAttribute('type') || 'translate';
  const dur = secs(a.getAttribute('dur')) * 1000, delay = secs(a.getAttribute('begin')) * 1000;
  if (t === 'animateMotion'){
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', a.getAttribute('path'));
    const L = p.getTotalLength(), n = Math.max(8, Math.min(60, Math.round(L / 12))), kf = [];
    for (let i = 0; i <= n; i++){ const q = p.getPointAtLength(L * i / n); kf.push({ offset: i / n, transform: `translate(${q.x.toFixed(2)}px,${q.y.toFixed(2)}px)` }); }
    return { kf, dur, delay };
  }
  const vals = (a.getAttribute('values') || [a.getAttribute('from'), a.getAttribute('to')].join(';')).split(';').map(s => s.trim()).filter(s => s !== '');
  const kt = a.getAttribute('keyTimes'), offs = kt ? kt.split(';').map(Number) : vals.map((_, i) => vals.length > 1 ? i / (vals.length - 1) : 0);
  const num = s => s.split(/[\s,]+/).map(Number);
  let f;
  if (t === 'animateTransform'){
    if (type === 'translate') f = s => { const [x, y = 0] = num(s); return { transform: `translate(${x}px,${y}px)` }; };
    else if (type === 'rotate') f = s => { const [r, cx = 0, cy = 0] = num(s); return { transform: `translate(${cx}px,${cy}px) rotate(${r}deg) translate(${-cx}px,${-cy}px)` }; };
    else if (type === 'scale') f = s => { const [x, y = x] = num(s); return { transform: `scale(${x},${y})` }; };
    else if (type === 'skewX') f = s => ({ transform: `skewX(${num(s)[0]}deg)` });
    else f = s => ({ transform: `skewY(${num(s)[0]}deg)` });
  } else if (at === 'opacity') f = s => ({ opacity: +s });
  else {
    const base = n => parseFloat(el.getAttribute(n)) || 0, cx0 = base('cx'), cy0 = base('cy');
    if (at === 'cx') f = s => ({ transform: `translate(${+s - cx0}px,0px)` });
    else if (at === 'cy') f = s => ({ transform: `translate(0px,${+s - cy0}px)` });
    else { const r0 = base(at) || 1, k = s => +s / r0;
      f = at === 'r' ? s => ({ transform: `translate(${cx0}px,${cy0}px) scale(${k(s)}) translate(${-cx0}px,${-cy0}px)` })
        : at === 'rx' ? s => ({ transform: `translate(${cx0}px,${cy0}px) scale(${k(s)},1) translate(${-cx0}px,${-cy0}px)` })
        : s => ({ transform: `translate(${cx0}px,${cy0}px) scale(1,${k(s)}) translate(${-cx0}px,${-cy0}px)` }); }
  }
  return { kf: vals.map((v, i) => Object.assign({ offset: offs[i] }, f(v))), dur, delay };
}
const mtx = m => [m.a, m.b, m.c, m.d, m.e, m.f].map(v => +v.toFixed(5));

/* byg et træ for en rod: indpakninger (matrix, animation, gennemsigtighed) og stykker der skal tegnes */
function gpuNodeSpec(el, rootMatrix, pieces, NS){
  const wraps = [], kids = [];
  if (rootMatrix) wraps.push({ m: rootMatrix });
  const anims = smilKids(el), motion = anims.find(a => a.tagName === 'animateMotion'), at = anims.find(a => a.tagName === 'animateTransform');
  if (motion) wraps.push({ a: smilKeyframes(motion, el) });
  /* før en animation begynder, viser SVG grundværdien; derfor får animationens lag også grundværdien som fast stil */
  const baseM = el.transform && el.transform.baseVal.numberOfItems ? (c => c ? mtx(c.matrix) : null)(el.transform.baseVal.consolidate()) : null;
  if (at) wraps.push(baseM ? { a: smilKeyframes(at, el), m: baseM } : { a: smilKeyframes(at, el) });
  else if (baseM) wraps.push({ m: baseM });
  /* cx/cy flytter, r/rx/ry skalerer; flytning yderst, så skaleringen sker om det oprindelige centrum */
  anims.filter(a => /^(cx|cy)$/.test(a.getAttribute('attributeName'))).forEach(a => wraps.push({ a: smilKeyframes(a, el) }));
  anims.filter(a => /^(r|rx|ry)$/.test(a.getAttribute('attributeName'))).forEach(a => wraps.push({ a: smilKeyframes(a, el) }));
  const op = anims.find(a => a.getAttribute('attributeName') === 'opacity');
  const o = parseFloat(el.getAttribute('opacity') ?? el.style.opacity ?? '');
  if (op) wraps.push(o >= 0 && o < 1 ? { a: smilKeyframes(op, el), o } : { a: smilKeyframes(op, el) });
  else if (o >= 0 && o < 1) wraps.push({ o });
  const isLeaf = !/^(g|a|svg|switch)$/.test(el.tagName);
  if (isLeaf){ kids.push(anims.some(a => a.getAttribute('attributeName') === 'stroke-dashoffset') ? gpuDashSpec(el) : gpuPiece([el], el, pieces, true)); }
  else {
    let run = [];
    const flush = () => { if (run.length){ const p = gpuPiece(run, el, pieces, false); if (p) kids.push(p); run = []; } };
    for (const c of el.children){
      if (/^(animate|animateTransform|animateMotion|set|title|desc|defs|linearGradient|radialGradient|filter|clipPath|mask|pattern|symbol|marker)$/.test(c.tagName)) continue;
      if (smilKids(c).length || c.querySelector(SMIL_SEL)){ flush(); kids.push(gpuNodeSpec(c, null, pieces, NS)); }
      else run.push(c);
    }
    flush();
  }
  return { w: wraps, c: kids };
}
/* et stykke: elementerne tegnes i 'space'-elementets koordinater (uden dets egen transform) */
function gpuPiece(els, space, pieces, self){
  /* et blad måles som en kopi uden animationer og uden egen transform (det er grundformen, der tegnes) */
  const sm = (self ? space.parentElement : space).getScreenCTM(); if (!sm) return null;
  const loc = sm.inverse();
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity, pad = 6;
  for (const e of els){ let r;
    if (self){ const t = e.cloneNode(true); t.querySelectorAll(SMIL_SEL).forEach(a => a.remove()); smilKids(t).forEach(a => a.remove()); t.removeAttribute('transform'); t.style.visibility = 'hidden'; e.parentNode.insertBefore(t, e); r = t.getBoundingClientRect(); t.remove(); }
    else r = e.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    for (const [x, y] of [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]]){ const q = new DOMPoint(x, y).matrixTransform(loc); bx0 = Math.min(bx0, q.x); by0 = Math.min(by0, q.y); bx1 = Math.max(bx1, q.x); by1 = Math.max(by1, q.y); }
    const sw = parseFloat(getComputedStyle(e).strokeWidth) || 0; pad = Math.max(pad, sw + 2);
    if (e.querySelector && e.querySelector('[filter]') || e.getAttribute('filter')) pad = Math.max(pad, 30); }
  if (!isFinite(bx0)) return null;
  const x = Math.floor(bx0 - pad), y = Math.floor(by0 - pad), w = Math.ceil(bx1 + pad) - x, h = Math.ceil(by1 + pad) - y;
  pieces.push({ els, space, self, x, y, w, h });
  return { p: pieces.length - 1 };
}
/* stykkets SVG-kode: elementerne pakket ind i (afklædte) kopier af forfædrene, så arvede farver og streger følger med */
function gpuPieceMarkup(pc, svg){
  const chain = []; for (let x = pc.self ? pc.space.parentElement : pc.space; x && x !== svg; x = x.parentElement) chain.unshift(x);
  let open = '', close = '';
  for (const a of chain){ if (!a) continue; const g = a.cloneNode(false); ['transform', 'opacity', 'filter', 'mask', 'clip-path', 'id', 'style', 'data-tap'].forEach(n => g.removeAttribute(n));
    /* CSS-filtre fra stilarket (fx 'kommer snart'-huse er lidt afblegede) følger med */
    const cf = getComputedStyle(a).filter; if (cf && cf !== 'none' && !a.getAttribute('filter')) g.setAttribute('style', 'filter:' + cf);
    const s = new XMLSerializer().serializeToString(g).replace(/\s*xmlns="[^"]*"/, ''); const i = s.lastIndexOf('</'); open += i > 0 ? s.slice(0, i) : s.replace(/\/>$/, '>'); close = `</${g.tagName}>` + close; }
  const body = pc.els.map(e => { const c = e.cloneNode(true); c.querySelectorAll && c.querySelectorAll(SMIL_SEL).forEach(a => a.remove());
    if (pc.self){ c.removeAttribute('transform'); c.removeAttribute('opacity'); c.style && (c.style.opacity = ''); }
    return new XMLSerializer().serializeToString(c).replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, ''); }).join('');
  return open + body + close;
}
/* pak alle stykker i ét eller flere ark og tegn dem som én SVG pr. ark */
function gpuAtlas(svg, pieces, extra, sc){
  const MAXW = 4096, MAXH = 4096, sheets = [];
  let sx = 0, sy = 0, rowH = 0, sheet = { items: [], h: 0 };
  const all = pieces.concat(extra);
  all.forEach((pc, i) => { const pw = Math.ceil(pc.w * sc) + 2, ph = Math.ceil(pc.h * sc) + 2;
    if (sx + pw > MAXW){ sx = 0; sy += rowH; rowH = 0; }
    if (sy + ph > MAXH){ sheet.h = sy + rowH; sheets.push(sheet); sheet = { items: [], h: 0 }; sx = 0; sy = 0; rowH = 0; }
    pc.sheet = sheets.length; pc.ax = sx; pc.ay = sy; pc.aw = pw - 2; pc.ah = ph - 2; sheet.items.push(i);
    sx += pw; rowH = Math.max(rowH, ph); sheet.h = Math.max(sheet.h, sy + rowH); });
  sheets.push(sheet);
  /* alle definitioner (forløb, filtre, klip) følger med i hvert ark */
  const defs = [...svg.querySelectorAll('linearGradient,radialGradient,filter,clipPath,mask,pattern,symbol,marker')].filter(d => d.id && !d.parentElement.closest('linearGradient,radialGradient,filter,clipPath,mask,pattern,symbol,marker'))
    .map(d => new XMLSerializer().serializeToString(d).replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')).join('');
  return sheets.map(sh => { const W = MAXW, H = Math.max(1, sh.h);
    const body = sh.items.map(i => { const pc = all[i]; return `<svg x="${pc.ax}" y="${pc.ay}" width="${pc.aw}" height="${pc.ah}" viewBox="${pc.x} ${pc.y} ${pc.w} ${pc.h}" preserveAspectRatio="none" overflow="hidden">${pc.markup || gpuPieceMarkup(pc, svg)}</svg>`; }).join('');
    return { W, H, src: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>` }; });
}
function gpuRasterSheet(sheet){
  return new Promise((res, rej) => { const url = URL.createObjectURL(new Blob([sheet.src], { type: 'image/svg+xml' })), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); const cv = document.createElement('canvas'); cv.width = sheet.W; cv.height = sheet.H; cv.getContext('2d').drawImage(img, 0, 0);
      cv.toBlob(b => b ? res(b) : rej(new Error('ark')), 'image/png'); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('ark kunne ikke tegnes')); }; img.src = url; });
}

/* ---------- byg laget på skærmen ---------- */
async function gpuMount(svg, gen, rec, st){
  const g = rec.gpu, host = svg.parentElement;
  const sheets = await Promise.all(g.sheets.map(b => createImageBitmap(b)));
  if (gen !== BAKE.gen || !svg.isConnected) return false;
  const layer = document.createElement('div'); layer.className = 'gpu-layer';
  const cam = document.createElement('div'); cam.className = 'gpu-cam'; layer.append(cam);
  const box = (el, x, y, w, h) => { Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); return el; };
  /* baggrunden: det bagte billede */
  const bg = new Image(); bg.decoding = 'async'; bg.src = BAKE.url; bg.className = 'gpu-bg'; cam.append(box(bg, rec.x0, rec.y0, rec.W, rec.H));
  const piece = i => { const pc = g.pieces[i], cv = document.createElement('canvas'); cv.width = pc.aw; cv.height = pc.ah;
    cv.getContext('2d').drawImage(sheets[pc.sheet], pc.ax, pc.ay, pc.aw, pc.ah, 0, 0, pc.aw, pc.ah); cv.className = 'gpu-p'; cv.dataset.i = i; if (pc.blend) cv.style.mixBlendMode = pc.blend; return box(cv, pc.x, pc.y, pc.w, pc.h); };
  /* stiplede streger: et lærred i skærmens opløsning, som uret tegner om */
  const res = Math.max(1, Math.min(3, (CAM.on ? CAM.k : ((svg.getScreenCTM() || {}).a || 1)) * (window.devicePixelRatio || 1)));
  const dashCv = d => { const cv = document.createElement('canvas'); cv.width = Math.ceil(d.w * res); cv.height = Math.ceil(d.h * res); cv.className = 'gpu-p';
    DRIVE.dash.push({ cv, ctx: cv.getContext('2d'), d, path: new Path2D(d.path), res, vis: true }); return box(cv, d.x, d.y, d.w, d.h); };
  DRIVE.dash = [];
  const node = spec => { const outer = document.createElement('div'); outer.className = 'gpu-n'; let cur = outer, first = true;
    for (const w of spec.w){ const d = first ? outer : document.createElement('div'); if (!first){ d.className = 'gpu-n'; cur.append(d); } first = false;
      if (w.m) d.style.transform = `matrix(${w.m.join(',')})`;
      if (w.o != null) d.style.opacity = w.o;
      if (w.a){ try { d.animate(w.a.kf, { duration: w.a.dur, delay: w.a.delay, iterations: Infinity, easing: 'linear' }); } catch (e){} }
      cur = d; }
    for (const k of spec.c) cur.append(k.p != null ? piece(k.p) : k.d ? dashCv(k.d) : node(k));
    return outer; };
  for (const it of g.items) cam.append(it.p != null ? piece(it.p) : node(it));
  sheets.forEach(s => s.close && s.close());
  /* skjul originalerne i SVG'en og fjern deres animationer, så de ikke tikker videre */
  g.roots.forEach(i => { const r = st[i]; if (!r) return; r.querySelectorAll(SMIL_SEL).forEach(a => a.remove()); smilKids(r).forEach(a => a.remove()); r.style.visibility = 'hidden'; if (r.closest('.place')) r.style.pointerEvents = 'painted'; });
  const old = svg.querySelector('image.baked-bg'); if (old) old.remove();
  /* laget ligger under SVG'en i samme stablingskontekst, så nattens farvelag i SVG'en kan blande med det */
  host.prepend(layer); host.classList.add('gpu-host');
  GPU.layer = layer; GPU.cam = cam; GPU.svg = svg; GPU.on = true; gpuSync();
  smilDrive(svg);
  return true;
}
/* kameraet: på telefoner flyttes hele verden-laget (#world) af grafikchippen; laget her følger bare med.
   På store skærme fylder kortet skærmen, og laget får SVG'ens matrix. */
function gpuSync(){
  if (!GPU.on || !GPU.svg || !GPU.svg.isConnected) return;
  let t;
  if (CAM.on) t = `matrix(${CAM.k},0,0,${CAM.k},${-CAM_X[0] * CAM.k},${-CAM_Y[0] * CAM.k})`;
  else { const m = GPU.svg.getScreenCTM(), r = GPU.layer.getBoundingClientRect(); if (!m) return; t = `matrix(${m.a},${m.b},${m.c},${m.d},${m.e - r.left},${m.f - r.top})`; }
  if (t !== GPU.t){ GPU.t = t; GPU.cam.style.transform = t; }
}
function gpuReset(){ if (GPU.layer){ if (GPU.layer.parentElement) GPU.layer.parentElement.classList.remove('gpu-host'); GPU.layer.remove(); } GPU.on = false; GPU.layer = GPU.cam = GPU.svg = null; GPU.t = ''; }

/* ---------- de sidste SVG-animationer drives af et lille ur i koden ----------
   Det, der ikke kan flyttes til grafikchippen (det man kan trykke på, åen, tekst), bliver i SVG'en.
   SVG'ens eget animationssystem (SMIL) koster dog meget på telefonen, selv for få animationer.
   Her læses hver animation én gang, fjernes, og værdierne sættes i stedet fra koden ca. 30 gange i sekundet.
   Står noget uden for skærmen, springes det over. */
const DRIVE = { jobs: 0, dash: [] };
function driveJob(a){
  const t = a.tagName, at = a.getAttribute('attributeName'), el = a.parentElement;
  if (t === 'set' || !el) return null;
  if ((a.getAttribute('repeatCount') || '') !== 'indefinite' || a.getAttribute('accumulate') === 'sum' || a.getAttribute('keyPoints')) return null;
  const dur = secs(a.getAttribute('dur')), begin = secs(a.getAttribute('begin') || '0');
  if (!(dur > 0) || isNaN(begin)) return null;
  const mode = a.getAttribute('calcMode') || (t === 'animateMotion' ? 'paced' : 'linear');
  if (mode === 'spline') return null;
  const sum = a.getAttribute('additive') === 'sum';
  if (t === 'animateMotion'){
    if (!a.getAttribute('path') || (a.getAttribute('rotate') && a.getAttribute('rotate') !== 'auto')) return null;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', a.getAttribute('path'));
    const L = p.getTotalLength(), n = Math.max(16, Math.min(200, Math.round(L / 4))), pts = [];
    for (let i = 0; i <= n; i++){ const q = p.getPointAtLength(L * i / n); pts.push([q.x, q.y]); }
    const rot = a.getAttribute('rotate') === 'auto';
    return { el, kind: 'motion', dur, begin, val: k => { const f = k * n, i = Math.min(n - 1, Math.floor(f)), u = f - i, A = pts[i], B = pts[i + 1];
      const x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u;
      return `translate(${x.toFixed(2)} ${y.toFixed(2)})` + (rot ? ` rotate(${(Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI).toFixed(1)})` : ''); } };
  }
  const raw = (a.getAttribute('values') || [a.getAttribute('from'), a.getAttribute('to')].filter(v => v != null).join(';')).split(';').map(s => s.trim()).filter(s => s !== '');
  if (!raw.length) return null;
  const vals = raw.map(s => s.split(/[\s,]+/).map(Number));
  if (vals.some(v => v.some(isNaN))) return null;
  const kt = a.getAttribute('keyTimes'), offs = kt ? kt.split(';').map(Number) : vals.map((_, i) => vals.length > 1 ? i / (vals.length - (mode === 'discrete' ? 0 : 1)) : 0);
  if (offs.length !== vals.length) return null;
  const sample = k => { let i = 0; while (i < offs.length - 1 && k >= offs[i + 1]) i++;
    if (mode === 'discrete' || i >= vals.length - 1) return vals[i];
    const u = (k - offs[i]) / ((offs[i + 1] - offs[i]) || 1), A = vals[i], B = vals[i + 1]; return A.map((v, j) => v + ((B[j] ?? v) - v) * u); };
  const fmt = v => v.map(x => +x.toFixed(3)).join(' ');
  if (t === 'animateTransform'){ const type = a.getAttribute('type') || 'translate'; return { el, kind: 'transform', sum, dur, begin, val: k => `${type}(${fmt(sample(k))})` }; }
  const base = parseFloat(el.getAttribute(at));
  return { el, kind: 'attr', at, dur, begin, val: k => { const v = sample(k); return fmt(sum && !isNaN(base) ? v.map(x => x + base) : v); } };
}
function smilDrive(svg){
  const groups = new Map();
  for (const a of [...svg.querySelectorAll(SMIL_SEL)]){
    if (a.closest('#chars,#bubbles')) continue;
    const j = driveJob(a); if (!j) continue;
    let g = groups.get(j.el); if (!g){ g = { el: j.el, jobs: [], tbase: j.el.getAttribute('transform') || '', last: {} }; groups.set(j.el, g); }
    g.jobs.push(j); a.remove();
  }
  const list = [...groups.values()]; DRIVE.jobs = list.reduce((n, g) => n + g.jobs.length, 0);
  const dash = DRIVE.dash;
  if (!list.length && !dash.length) return;
  /* hvor ligger hver ting (med god margen til bevægelsen)? */
  const m = svg.getScreenCTM(); if (m){ const inv = m.inverse(), pt = svg.createSVGPoint();
    for (const g of list){ const r = g.el.getBoundingClientRect(); const c = [[r.left, r.top], [r.right, r.bottom]].map(([x, y]) => { pt.x = x; pt.y = y; return pt.matrixTransform(inv); });
      g.box = [c[0].x - 160, c[0].y - 160, c[1].x + 160, c[1].y + 160]; } }
  /* lærrederne tegnes kun, når de er på skærmen */
  if (dash.length && window.IntersectionObserver){ const io = new IntersectionObserver(es => es.forEach(e => { const o = dash.find(o => o.cv === e.target); if (o) o.vis = e.isIntersecting; }), { rootMargin: '80px' });
    dash.forEach(o => io.observe(o.cv)); }
  const town = document.getElementById('town'), T0 = performance.now(); let last = 0;
  const tick = now => {
    if (!svg.isConnected) return;
    if ((town && town.hidden) || now - last < 31){ requestAnimationFrame(tick); return; }
    last = now; const s = (now - T0) / 1000;
    for (const o of dash) if (o.vis || o.last == null){ const d = o.d, u = s - d.begin; let v;
      if (u < 0) v = null; else { const k = (u % d.dur) / d.dur; let i = 0; while (i < d.offs.length - 1 && k >= d.offs[i + 1]) i++;
        v = d.disc || i >= d.vals.length - 1 ? d.vals[i] : d.vals[i] + (d.vals[i + 1] - d.vals[i]) * (k - d.offs[i]) / ((d.offs[i + 1] - d.offs[i]) || 1); }
      if (v === o.last && o.last != null) continue; o.last = v; const c = o.ctx;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, o.cv.width, o.cv.height); c.setTransform(o.res, 0, 0, o.res, -d.x * o.res, -d.y * o.res);
      if (d.fill !== 'none'){ c.globalAlpha = d.fo; c.fillStyle = d.fill; c.fill(o.path); }
      c.globalAlpha = d.so; c.strokeStyle = d.grad ? (o.grad = o.grad || (gr => { const G = c.createLinearGradient(...gr.c); gr.stops.forEach(([f, col]) => G.addColorStop(f, col)); return G; })(d.grad)) : d.stroke; c.lineWidth = d.sw; c.lineCap = d.cap; c.lineJoin = d.join; c.miterLimit = d.miter;
      c.setLineDash(d.dash.length % 2 ? d.dash.concat(d.dash) : d.dash); c.lineDashOffset = v == null ? d.off0 : v; c.stroke(o.path); }
    if (!svg.animationsPaused()){ const [vx0, vx1, vy0] = camView(), vy1 = vy0 + (CAM.on ? CAM.vh : CH);
      for (const g of list){
        const b = g.box; if (b && (b[2] < vx0 || b[0] > vx1 || b[3] < vy0 || b[1] > vy1)) continue;
        let tr = null, mo = '';
        for (const j of g.jobs){ const u = s - j.begin; if (u < 0) continue; const k = (u % j.dur) / j.dur, v = j.val(k);
          if (j.kind === 'attr'){ if (g.last[j.at] !== v){ g.last[j.at] = v; g.el.setAttribute(j.at, v); } }
          else if (j.kind === 'transform') tr = j.sum ? (tr ?? g.tbase) + ' ' + v : v;
          else mo = v + ' '; }
        if (tr !== null || mo){ const v = mo + (tr ?? g.tbase); if (g.last.transform !== v){ g.last.transform = v; g.el.setAttribute('transform', v); } }
      } }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
