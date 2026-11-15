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
  if (isLeaf){ kids.push(gpuPiece([el], el, pieces, true)); }
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
  const g = rec.gpu, street = svg.parentElement;
  const sheets = await Promise.all(g.sheets.map(b => createImageBitmap(b)));
  if (gen !== BAKE.gen || !svg.isConnected) return false;
  const layer = document.createElement('div'); layer.className = 'gpu-layer';
  const cam = document.createElement('div'); cam.className = 'gpu-cam'; layer.append(cam);
  const box = (el, x, y, w, h) => { Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); return el; };
  /* baggrunden: det bagte billede */
  const bg = new Image(); bg.decoding = 'async'; bg.src = BAKE.url; bg.className = 'gpu-bg'; cam.append(box(bg, rec.x0, rec.y0, rec.W, rec.H));
  const piece = i => { const pc = g.pieces[i], cv = document.createElement('canvas'); cv.width = pc.aw; cv.height = pc.ah;
    cv.getContext('2d').drawImage(sheets[pc.sheet], pc.ax, pc.ay, pc.aw, pc.ah, 0, 0, pc.aw, pc.ah); cv.className = 'gpu-p'; cv.dataset.i = i; if (pc.blend) cv.style.mixBlendMode = pc.blend; return box(cv, pc.x, pc.y, pc.w, pc.h); };
  const node = spec => { const outer = document.createElement('div'); outer.className = 'gpu-n'; let cur = outer, first = true;
    for (const w of spec.w){ const d = first ? outer : document.createElement('div'); if (!first){ d.className = 'gpu-n'; cur.append(d); } first = false;
      if (w.m) d.style.transform = `matrix(${w.m.join(',')})`;
      if (w.o != null) d.style.opacity = w.o;
      if (w.a){ try { d.animate(w.a.kf, { duration: w.a.dur, delay: w.a.delay, iterations: Infinity, easing: 'linear' }); } catch (e){} }
      cur = d; }
    for (const k of spec.c) cur.append(k.p != null ? piece(k.p) : node(k));
    return outer; };
  for (const it of g.items) cam.append(it.p != null ? piece(it.p) : node(it));
  sheets.forEach(s => s.close && s.close());
  /* skjul originalerne i SVG'en og fjern deres animationer, så de ikke tikker videre */
  g.roots.forEach(i => { const r = st[i]; if (!r) return; r.querySelectorAll(SMIL_SEL).forEach(a => a.remove()); smilKids(r).forEach(a => a.remove()); r.style.visibility = 'hidden'; if (r.closest('.place')) r.style.pointerEvents = 'painted'; });
  const old = svg.querySelector('image.baked-bg'); if (old) old.remove();
  /* laget ligger under SVG'en i samme stablingskontekst, så nattens farvelag i SVG'en kan blande med det */
  street.prepend(layer); street.classList.add('gpu-host');
  GPU.layer = layer; GPU.cam = cam; GPU.svg = svg; GPU.on = true; gpuSync();
  return true;
}
/* kameraet: samme matrix som SVG'ens, men på et HTML-lag som grafikchippen flytter */
function gpuSync(){
  if (!GPU.on || !GPU.svg || !GPU.svg.isConnected) return;
  const m = GPU.svg.getScreenCTM(), r = GPU.layer.getBoundingClientRect(); if (!m) return;
  GPU.cam.style.transform = `matrix(${m.a},${m.b},${m.c},${m.d},${m.e - r.left},${m.f - r.top})`;
}
function gpuReset(){ if (GPU.layer){ if (GPU.layer.parentElement) GPU.layer.parentElement.classList.remove('gpu-host'); GPU.layer.remove(); } GPU.on = false; GPU.layer = GPU.cam = GPU.svg = null; }
