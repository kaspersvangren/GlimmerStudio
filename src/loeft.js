/* ================= Løft: scenernes små animationer ud af den store SVG =================
   Mange skærme (Boblebutikken, værelset, skolen, kælderen, kosteløbet, arkaden ...) er én stor SVG, hvor små ting
   svæver, blinker og flimrer: støvfnug, bobler, lys, flammer. En animation inde i en SVG får browseren til at regne stil
   og opsætning igennem og male om i hvert eneste billede, på processoren. Det er det, der gør skærmene tunge på tabletten.
   Her flyttes hver sådan ting ud i sit eget lille HTML-lag lige oven på SVG'en, med præcis samme bevægelse. Så klarer
   grafikchippen det alene, og SVG'en står stille.
   Originalen bliver i SVG'en, usynlig (gennemsigtig), så tryk virker som før. Ændrer koden noget ved en løftet ting
   (en klasse, en stil, dens indhold), lægges den straks tilbage i SVG'en, så der aldrig vises noget forkert.
   Ting, der ligger under noget andet i tegningen, løftes ikke (de ville ellers komme til at ligge ovenpå). */
const LOEFT = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const STIL = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset',
    'stroke-miterlimit', 'paint-order', 'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'filter', 'clip-rule', 'mix-blend-mode'];
  const SKIP = /^(defs|clipPath|mask|pattern|symbol|marker|linearGradient|radialGradient|filter|title|desc|style|script|metadata)$/;
  const SMIL = 'animate,animateTransform,animateMotion,set';
  const OK_PROP = new Set(['offset', 'computedOffset', 'easing', 'composite', 'transform', 'opacity']);
  /* et svagt lag ovenpå (et varmt skær, et lysskær, en svag glans) må gerne ende under en løftet ting: forskellen er
     højst et par procent farve på en lille ting, der bevæger sig. Dækker noget mere end dette, bliver tingen i SVG'en */
  const LF_SOFT = 0.3;
  const lifts = new Map();          /* svg -> { ov, roots: [{ el, layer, undo, obs }] } */
  let busy = false;
  const mtx = m => `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(v => +v.toFixed(5)).join(',')})`;
  const isId = m => Math.abs(m.a - 1) + Math.abs(m.b) + Math.abs(m.c) + Math.abs(m.d - 1) + Math.abs(m.e) + Math.abs(m.f) < 1e-6;

  /* et elements egne animationer (CSS og SMIL), som de kan genskabes på et HTML-lag; null = kan ikke løftes */
  function ownAnims(el){
    const out = [];
    for (const a of el.getAnimations()){
      if (!a.effect || a.effect.target !== el) continue;
      const t = a.effect.getTiming(); if (t.iterations !== Infinity) return null;      /* engangs-animationer (hop, pop) bliver i SVG'en */
      const kf = a.effect.getKeyframes();
      /* en farve, der skifter frem og tilbage (fx pærerne om arkadens skilte): originalen bliver stående i sin grundfarve,
         og en kopi i den anden farve tones ind og ud ovenpå. For ensfarvede former giver det præcis samme farver */
      if (kf.length && kf.every(k => Object.keys(k).every(p => p === 'fill' || p === 'offset' || p === 'computedOffset' || p === 'easing' || p === 'composite'))){
        const k0 = kf.find(k => (k.computedOffset ?? k.offset) === 0 && k.fill !== undefined), base = k0 ? k0.fill : null;
        const cols = [...new Set(kf.filter(k => k.fill !== undefined && k.fill !== base).map(k => k.fill))];
        if (cols.length !== 1 || el.children.length || !(el instanceof SVGGeometryElement)) return null;
        const X = cols[0], ease = getComputedStyle(el).animationTimingFunction || 'linear';
        const ok = kf.map(k => ({ offset: k.computedOffset ?? k.offset, easing: k.easing && k.easing !== 'linear' ? k.easing : ease, opacity: k.fill === X ? 1 : 0 }));
        if (ok[0].offset > 0) ok.unshift({ offset: 0, easing: ease, opacity: 0 }); if (ok[ok.length - 1].offset < 1) ok.push({ offset: 1, opacity: 0 });
        out.push({ css: true, fill: X, kf: ok, timing: { duration: t.duration, delay: t.delay, iterations: Infinity, direction: t.direction, easing: t.easing }, cur: a.currentTime || 0, rate: a.playbackRate, anim: a, tr: false, op: true });
        continue; }
      if (kf.some(k => Object.keys(k).some(p => !OK_PROP.has(p)))) return null;
      out.push({ css: true, kf: kf.map(k => { const o = { offset: k.offset, easing: k.easing }; if (k.transform !== undefined) o.transform = k.transform; if (k.opacity !== undefined) o.opacity = k.opacity; return o; }),
        timing: { duration: t.duration, delay: t.delay, iterations: Infinity, direction: t.direction, easing: t.easing, fill: t.fill }, cur: a.currentTime || 0, rate: a.playbackRate, anim: a,
        tr: kf.some(k => k.transform !== undefined), op: kf.some(k => k.opacity !== undefined) });
    }
    const sm = [...el.children].filter(c => /^(animate|animateTransform|animateMotion|set)$/.test(c.tagName));
    if (sm.length){
      if (!gpuConvertible(el) || [...el.children].some(c => c.tagName === 'animate' && /^(cx|cy|r|rx|ry)$/.test(c.getAttribute('attributeName')) )) return null;
      if (out.length) return null;     /* både CSS og SMIL på samme element: lad være */
      const svg = el.ownerSVGElement, now = (svg && svg.getCurrentTime ? svg.getCurrentTime() : 0) * 1000;
      for (const a of sm){ const k = smilKeyframes(a, el), kind = a.tagName === 'animateMotion' ? 'motion' : a.tagName === 'animateTransform' ? 'tr' : 'op';
        if (kind === 'tr' && a.getAttribute('additive') === 'sum') return null;
        out.push({ smil: a, kind, kf: k.kf, timing: { duration: k.dur, delay: k.delay, iterations: Infinity, easing: 'linear' }, cur: now, tr: kind !== 'op', op: kind === 'op' }); }
    }
    return out;
  }
  const hasAnimInside = el => el.querySelector(SMIL) || el.getAnimations({ subtree: true }).some(a => a.effect && a.effect.target !== el && a.effect.getTiming().iterations === Infinity);

  /* en klon, der tegner det samme uden for sin SVG: beregnede farver og streger skrives direkte på, klasser og id'er fjernes */
  function cloneStatic(src, own){
    const c = src.cloneNode(true), A = [src, ...src.querySelectorAll('*')], B = [c, ...c.querySelectorAll('*')];
    for (let i = 0; i < A.length; i++){ const a = A[i], b = B[i]; if (!(a instanceof Element)) continue;
      if (/^(animate|animateTransform|animateMotion|set)$/.test(a.tagName)){ b.remove(); continue; }
      if (SKIP.test(a.tagName) && a !== src){ continue; }
      const cs = getComputedStyle(a); let st = '';
      for (const p of STIL){ const v = cs.getPropertyValue(p); if (v) st += `${p}:${v};`; }
      if (a !== src || own){ st += `opacity:${cs.opacity};`; if (cs.transform !== 'none' && !a.getAttribute('transform')) st += `transform:${cs.transform};transform-box:${cs.transformBox};transform-origin:${cs.transformOrigin};`; }
      if (cs.display === 'none') st += 'display:none;'; if (cs.visibility === 'hidden') st += 'visibility:hidden;';
      b.setAttribute('style', st); b.removeAttribute('class'); b.removeAttribute('id'); b.removeAttribute('data-hit'); b.removeAttribute('data-tap'); }
    return c;
  }
  /* kasse om elementerne i 'space'-elementets koordinater (med lidt luft til streger og filtre) */
  function boxOf(els, space){
    const sm = space.getScreenCTM(); if (!sm) return null; const inv = sm.inverse();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, pad = 4;
    for (const e of els){ const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
      for (const [x, y] of [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]]){ const q = new DOMPoint(x, y).matrixTransform(inv); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      const cs = getComputedStyle(e); pad = Math.max(pad, (parseFloat(cs.strokeWidth) || 0) + 3); if (cs.filter !== 'none' || e.querySelector('[filter]')) pad = Math.max(pad, 30); }
    if (!isFinite(x0)) return null;
    return [Math.floor(x0 - pad), Math.floor(y0 - pad), Math.ceil(x1 + pad) - Math.floor(x0 - pad), Math.ceil(y1 + pad) - Math.floor(y0 - pad)];
  }
  function piece(els, space, self){
    /* et blad tegnes uden sin egen flytning (den ligger på laget); ellers tegnes elementerne i rummets koordinater */
    const b = self ? (() => { const t = els[0], tr = t.getAttribute('transform'); if (tr) t.removeAttribute('transform'); const r = boxOf([t], t); if (tr) t.setAttribute('transform', tr); return r; })() : boxOf(els, space);
    if (!b) return null;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', b.join(' ')); svg.setAttribute('width', b[2]); svg.setAttribute('height', b[3]);
    svg.setAttribute('style', `position:absolute;left:${b[0]}px;top:${b[1]}px;overflow:visible`);
    for (const e of els){ const c = cloneStatic(e, !self); if (self){ c.removeAttribute('transform'); c.removeAttribute('opacity'); c.style.opacity = ''; c.style.transform = 'none'; } svg.append(c); }
    return svg;
  }
  /* et lag for et element: en div pr. koordinatsystem, med animationerne lagt på */
  function node(el, parentSpace, info){
    const outer = document.createElement('div'); outer.className = 'lf-n';
    const L = parentSpace.getScreenCTM().inverse().multiply(el.getScreenCTM());   /* elementets egen flytning (uden animation) */
    const an = info.anims.get(el) || [];
    let cur = outer;
    const wrap = () => { const d = document.createElement('div'); d.className = 'lf-n'; cur.append(d); cur = d; return d; };
    /* bevægelse langs en bane ligger uden om elementets egen flytning */
    const mo = an.find(a => a.kind === 'motion'); if (mo) info.run.push([cur, mo]), wrap();
    const tr = an.filter(a => a.tr && a.kind !== 'motion');
    if (tr.length){ if (!isId(L)) cur.style.transform = mtx(L);
      const cs = getComputedStyle(el); let ox = 0, oy = 0;
      if (tr[0].css){ const oo = cs.transformOrigin.split(' ').map(parseFloat); ox = oo[0] || 0; oy = oo[1] || 0; if (cs.transformBox === 'fill-box'){ const bb = el.getBBox(); ox += bb.x; oy += bb.y; } }
      cur.style.transformOrigin = `${ox}px ${oy}px`;
      tr.forEach(a => info.run.push([cur, a])); wrap(); }
    else if (!isId(L)) { cur.style.transform = mtx(L); wrap(); }
    const op = an.filter(a => a.op && !a.tr && a.kind !== 'motion');   /* (en animation med både flytning og gennemsigtighed ligger allerede på laget ovenfor) */
    if (op.length){ if (op.some(a => a.fill)) cur.style.opacity = 0; else if (op.some(a => a.smil && a.timing.delay > 0)) cur.style.opacity = +getComputedStyle(el).opacity;   /* før en sen start står grundværdien (fx et lukket øjenlåg: usynligt) */
      op.forEach(a => info.run.push([cur, a])); wrap(); }
    else { const o = +getComputedStyle(el).opacity; if (o < 1){ cur.style.opacity = o; wrap(); } }   /* elementets faste gennemsigtighed */
    /* indholdet */
    const leaf = !el.children.length || !/^(g|a|svg|switch)$/.test(el.tagName);
    if (leaf){ const p = piece([el], el, true); if (p){ const f = an.find(a => a.fill); if (f) p.firstChild.style.fill = f.fill; cur.append(p); } return outer; }
    let run = [];
    const flush = () => { if (run.length){ const p = piece(run, el, false); if (p) cur.append(p); run = []; } };
    for (const c of el.children){
      if (/^(animate|animateTransform|animateMotion|set)$/.test(c.tagName) || SKIP.test(c.tagName)) continue;
      if (info.anims.has(c) || info.inner.has(c)){ flush(); cur.append(node(c, el, info)); }
      else run.push(c);
    }
    flush();
    return outer;
  }

  /* hvor på skærmen ligger SVG'ens koordinater? Regnes ud fra viewBox og preserveAspectRatio (ikke fra skærmen, så det passer,
     selvom skærmen selv er ved at glide ind) */
  function place(svg, ov){
    const cb = ov.offsetParent; if (!cb) return false;
    const R = svg.getBoundingClientRect(), C = cb.getBoundingClientRect(), k = cb.offsetWidth ? C.width / cb.offsetWidth : 1;
    const W = svg.clientWidth || R.width / k, H = svg.clientHeight || R.height / k; if (!W || !H) return false;
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : { x: 0, y: 0, width: W, height: H };
    const par = (svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet').trim().split(/\s+/);
    let sx = W / vb.width, sy = H / vb.height, tx = 0, ty = 0;
    if (par[0] !== 'none'){ const s = par[1] === 'slice' ? Math.max(sx, sy) : Math.min(sx, sy); sx = sy = s;
      const ax = par[0].slice(1, 4), ay = par[0].slice(5, 8);
      tx = ax === 'Min' ? 0 : ax === 'Max' ? W - vb.width * s : (W - vb.width * s) / 2;
      ty = ay === 'Min' ? 0 : ay === 'Max' ? H - vb.height * s : (H - vb.height * s) / 2; }
    const left = (R.left - C.left) / k - cb.clientLeft + cb.scrollLeft, top = (R.top - C.top) / k - cb.clientTop + cb.scrollTop;
    ov.style.transform = `translate(${(left + tx - vb.x * sx).toFixed(2)}px,${(top + ty - vb.y * sy).toFixed(2)}px) scale(${sx.toFixed(5)},${sy.toFixed(5)})`;
    return true;
  }

  /* gennemsigtig nok til at noget under den må lægges ovenpå? (fx de mørke kanter, der er helt klare midt på) */
  const opCache = new WeakMap();
  const opOf = e => { if (!e || e.tagName === 'svg') return 1; let v = opCache.get(e); if (v === undefined){ v = +getComputedStyle(e).opacity * opOf(e.parentElement); opCache.set(e, v); } return v; };
  function alphaAt(e, x, y){
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return 0;
    const op = opOf(e);
    const st = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 && +cs.strokeOpacity > 0;
    const m = /^url\("?#([^")]+)"?\)$/.exec(cs.fill);
    if (!m || st) return cs.fill === 'none' && !st ? 0 : op;
    const g = document.getElementById(m[1]); if (!g || g.tagName !== 'radialGradient' || g.getAttribute('gradientTransform') || g.getAttribute('gradientUnits') === 'userSpaceOnUse') return op;
    const bb = e.getBBox(), u = (x - bb.x) / bb.width, w = (y - bb.y) / bb.height, num = (n, d) => { const v = g.getAttribute(n); return v == null ? d : /%$/.test(v) ? parseFloat(v) / 100 : +v; };
    const d = Math.hypot(u - num('cx', .5), w - num('cy', .5)) / num('r', .5);
    const off = s => { const v = s.getAttribute('offset') || '0'; return Math.max(0, Math.min(1, /%$/.test(v) ? parseFloat(v) / 100 : +v)); };
    const stops = [...g.querySelectorAll('stop')].map(s => [off(s), +getComputedStyle(s).stopOpacity]);
    if (!stops.length) return op;
    let a = stops[0][1]; for (let i = 0; i < stops.length; i++){ if (d >= stops[i][0]) a = stops[i][1]; if (i + 1 < stops.length && d >= stops[i][0] && d < stops[i + 1][0]){ const f = (d - stops[i][0]) / ((stops[i + 1][0] - stops[i][0]) || 1); a = stops[i][1] + (stops[i + 1][1] - stops[i][1]) * f; break; } }
    return a * op * +cs.fillOpacity;
  }

  /* ligger hele kassen B (SVG'ens koordinater) inden for p's klip? */
  function clipFree(p, B){
    const m = /url\("?#([^")]+)"?\)/.exec(p.getAttribute('clip-path') || getComputedStyle(p).clipPath); if (!m) return false;
    const cp = document.getElementById(m[1]); if (!cp || cp.tagName !== 'clipPath' || cp.getAttribute('clipPathUnits') === 'objectBoundingBox' || cp.getAttribute('transform')) return false;
    const kids = [...cp.children].filter(c => c instanceof SVGGeometryElement); if (!kids.length || kids.some(c => c.getAttribute('transform'))) return false;
    const svg = p.ownerSVGElement, pm = p.getScreenCTM(), sm = svg && svg.getScreenCTM(); if (!pm || !sm) return false;
    const toP = pm.inverse().multiply(sm), pts = [];
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) if (i === 0 || i === 4 || j === 0 || j === 4) pts.push(new DOMPoint(B[0] + (B[2] - B[0]) * i / 4, B[1] + (B[3] - B[1]) * j / 4).matrixTransform(toP));
    return pts.every(q => kids.some(c => { try { return c.isPointInFill(q); } catch (e){ return false; } }));
  }
  /* arbejdet deles i små bidder (højst ~6 ms ad gangen, når telefonen har tid), så skærmen aldrig hakker, mens det sker.
     Før blev det hele gjort på én gang og gav et hak på op til ½ sekund på telefonen, når arkaden åbnede */
  async function liftSvg(svg){
    if (lifts.has(svg) || !svg.isConnected || svg.closest('[hidden]') || svg.ownerSVGElement) return;
    const rec = { ov: null, roots: [], building: true }; lifts.set(svg, rec);
    let sl = performance.now();
    const alive = () => svg.isConnected && !svg.closest('[hidden]') && lifts.get(svg) === rec;
    let fase = 'start';
    const pause = async (f) => { const d = performance.now() - sl; if (d >= (LOEFT.slice || 0)) LOEFT.sliceFase = fase; if (f) fase = f; if (d < 6) return alive(); LOEFT.slice = Math.max(LOEFT.slice || 0, d);
      await new Promise(r => window.requestIdleCallback ? requestIdleCallback(r, { timeout: 400 }) : setTimeout(r, 30)); sl = performance.now(); return alive(); };
    const stop = () => { if (lifts.get(svg) === rec){ rec.building = false; if (!rec.roots.length){ if (rec.ov) rec.ov.remove(); if (rec.obs) rec.obs.disconnect(); lifts.delete(svg); } } };
    const all = [...svg.querySelectorAll('*')];
    /* kandidater: animerede elementer (fundet på én gang) */
    const anims = new Map();
    const cand = new Set(); svg.getAnimations({ subtree: true }).forEach(a => { if (a.effect && a.effect.target) cand.add(a.effect.target); });
    svg.querySelectorAll(SMIL).forEach(a => { if (a.parentElement) cand.add(a.parentElement); });
    let ci = 0; for (const e of cand){ if (e === svg || e.closest('defs,clipPath,mask,pattern,symbol,marker')) continue; anims.set(e, ownAnims(e)); if (++ci % 25 === 0 && !await pause('kand')) return stop(); }
    if (!anims.size) return stop();
    if (!await pause('rødder')) return stop();
    let roots = [...anims.keys()].filter(e => { for (let p = e.parentElement; p && p !== svg; p = p.parentElement) if (anims.has(p)) return false; return true; });
    /* mål i SVG'ens koordinater, og hvor langt hver rod kan nå, mens den bevæger sig */
    const pos = new Map(); all.forEach((e, i) => pos.set(e, i));
    const sInv = svg.getScreenCTM(); if (!sInv) return stop(); const inv = sInv.inverse();
    const boxU = e => { const r = e.getBoundingClientRect(), a = new DOMPoint(r.left, r.top).matrixTransform(inv), b = new DOMPoint(r.right, r.bottom).matrixTransform(inv); return [Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.x, b.x), Math.max(a.y, b.y)]; };
    const leaves = all.filter(e => (!e.children.length || e.tagName === 'text') && !SKIP.test(e.tagName) && !/^(animate|animateTransform|animateMotion|set|stop|tspan)$/.test(e.tagName) && !e.closest('defs,clipPath,mask,pattern,symbol,marker'));
    const reach = r => { const b = boxU(r); let dx = 0, dy = 0;
      for (const e of [r, ...r.querySelectorAll('*')]){ const a = anims.get(e); if (!a) continue;
        for (const x of a) for (const k of x.kf){ if (!k.transform) continue; try { const m = new DOMMatrix(k.transform.replace(/(\d)\s*px/g, '$1')); dx = Math.max(dx, Math.abs(m.e) + 30 * (Math.abs(m.a - 1) + Math.abs(m.c))); dy = Math.max(dy, Math.abs(m.f) + 30 * (Math.abs(m.d - 1) + Math.abs(m.b))); } catch (er){ dx += 20; dy += 20; } }
        if (a.some(x => x.kind === 'motion')){ dx += 200; dy += 200; } }
      return [b[0] - dx - 2, b[1] - dy - 2, b[2] + dx + 2, b[3] + dy + 2]; };
    const why = window.LF_LOG ? (r, t) => console.log('LF ' + r.tagName + '.' + (r.getAttribute('class') || '') + ' ' + t) : () => {};
    /* en rod kan løftes, når alle animationer i den kan genskabes, og ingen forfader har filter, maske eller (et klip, den rører) */
    roots = roots.filter(r => {
      if ([r, ...r.querySelectorAll('*')].some(e => anims.has(e) && !anims.get(e))){ why(r, 'kan ikke genskabes'); return false; }
      if (r.tagName === 'svg' || r.querySelector('foreignObject')){ why(r, 'svg/foreignObject'); return false; }
      for (let p = r.parentElement; p && p !== svg; p = p.parentElement){ const cs = getComputedStyle(p);
        if ((p.getAttribute('clip-path') || cs.clipPath !== 'none') && !cs.filter.match(/url|blur/) && cs.mask === 'none' && !p.getAttribute('mask') && !p.getAttribute('filter') && cs.mixBlendMode === 'normal' && clipFree(p, reach(r))) continue;
        if (cs.filter !== 'none' || cs.mask !== 'none' || cs.clipPath !== 'none' || cs.mixBlendMode !== 'normal' || p.getAttribute('clip-path') || p.getAttribute('mask') || p.getAttribute('filter')){ why(r, 'forfader med filter/klip: ' + p.tagName + '.' + (p.getAttribute('class') || '')); return false; } }
      return true; });
    if (!roots.length) return stop();
    if (!await pause('kasser')) return stop();
    /* bladenes kasser måles én gang */
    const LB = [];
    for (let i = 0; i < leaves.length; i++){ const e = leaves[i]; LB.push([e, pos.get(e), boxU(e)]); if (i % 150 === 149 && !await pause()) return stop(); }
    /* hvem ligger senere i tegningen og dækker? Bagfra, så en rod, der bliver liggende, tæller som noget der dækker */
    const lifted = new Set(), inLifted = new Set(), sorted = roots.slice().sort((a, b) => pos.get(b) - pos.get(a));
    for (const r of sorted){
      if (!await pause('dække')) return stop();
      const B = reach(r), last = (() => { const d = r.querySelectorAll('*'); return pos.get(d.length ? d[d.length - 1] : r); })();
      let hit = false;
      for (const [e, pe, b] of LB){ if (pe <= last || b[0] >= B[2] || b[2] <= B[0] || b[1] >= B[3] || b[3] <= B[1] || inLifted.has(e)) continue;
        /* overlap: prøv ni punkter i fællesområdet; er den (næsten) usynlig dér, dækker den ikke */
        const ix0 = Math.max(b[0], B[0]), iy0 = Math.max(b[1], B[1]), ix1 = Math.min(b[2], B[2]), iy1 = Math.min(b[3], B[3]);
        const pts = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push([ix0 + (ix1 - ix0) * (i + .5) / 3, iy0 + (iy1 - iy0) * (j + .5) / 3]);
        const m = e.getScreenCTM(), sv = svg.getScreenCTM(), loc = m && sv ? m.inverse().multiply(sv) : null;
        if (pts.some(([x, y]) => { const q = loc ? new DOMPoint(x, y).matrixTransform(loc) : { x, y }; return alphaAt(e, q.x, q.y) > LF_SOFT; })){ hit = true; why(r, 'dækket af ' + e.tagName + '.' + (e.getAttribute('class') || '')); break; } }
      if (!hit){ lifted.add(r); inLifted.add(r); r.querySelectorAll('*').forEach(e => inLifted.add(e)); }
    }
    if (!lifted.size) return stop();
    if (!await pause()) return stop();
    /* laget oven på SVG'en */
    const info = { anims, run: [], inner: new Set() };
    for (const r of lifted) for (const e of [r, ...r.querySelectorAll('*')]) if (anims.has(e)) for (let p = e.parentElement; p && p !== r.parentElement; p = p.parentElement) info.inner.add(p);
    const ov = document.createElement('div'); ov.className = 'lf-ov'; ov.setAttribute('aria-hidden', 'true');
    const zi = getComputedStyle(svg).zIndex; if (zi !== 'auto') ov.style.zIndex = zi;
    svg.after(ov); rec.ov = ov;
    if (!place(svg, ov)) return stop();
    /* ændrer koden noget ved en løftet ting, lægges den tilbage i SVG'en */
    const obs = new MutationObserver(recs => { if (busy) return; const hitR = new Set();
      for (const m of recs){ for (const x of rec.roots) if (x.el.contains(m.target) || m.target.contains(x.el)) hitR.add(x); }
      hitR.forEach(x => drop(svg, x)); });
    rec.obs = obs; const watch = new Set();
    rec.ro = new ResizeObserver(() => { if (!svg.isConnected) return forget(svg); place(svg, ov); }); rec.ro.observe(svg);
    /* én ting ad gangen: stop originalen, byg laget, start bevægelsen i samme fase, og skjul originalen */
    for (const r of [...lifted].sort((a, b) => pos.get(a) - pos.get(b))){
      if (!await pause('byg')) return stop();
      if (!r.isConnected) continue;
      busy = true;
      const undo = [], saved = [], phase = new Map();
      for (const e of [r, ...r.querySelectorAll('*')]){ const a = anims.get(e); if (!a) continue;
        /* fasen læses lige nu (der kan være gået et øjeblik, siden animationerne blev fundet) */
        for (const x of a){ if (x.anim) x.cur = x.anim.currentTime || 0; else if (x.smil) x.cur = (svg.getCurrentTime ? svg.getCurrentTime() : 0) * 1000; }
        const old = e.style.animation; e.style.animation = 'none'; undo.push(() => { e.style.animation = old; });
        a.filter(x => x.smil).forEach(x => { const n = x.smil, p = n.parentElement, nx = n.nextSibling; n.remove(); saved.push(() => p.insertBefore(n, nx)); }); }
      info.run = [];
      let op = 1; for (let p = r.parentElement; p && p !== svg; p = p.parentElement) op *= +getComputedStyle(p).opacity;
      const layer = node(r, r.parentElement, info); layer.classList.add('lf-l'); if (op < 1) layer.style.opacity = op;
      const P = svg.getScreenCTM().inverse().multiply(r.parentElement.getScreenCTM()); const base = document.createElement('div'); base.className = 'lf-n'; if (!isId(P)) base.style.transform = mtx(P); base.append(layer);
      ov.append(base);
      for (const [d, a] of info.run){ try { const x = d.animate(a.kf, Object.assign({ fill: 'none' }, a.timing)); x.currentTime = a.cur; if (a.rate) x.playbackRate = a.rate; } catch (e){} }
      const oldOp = r.style.getPropertyValue('opacity'), oldPri = r.style.getPropertyPriority('opacity'), keep = (anims.get(r) || []).some(a => a.fill);
      if (!keep) r.style.setProperty('opacity', '0', 'important');   /* (en farveskifter bliver synlig i sin grundfarve under kopien) */
      undo.push(() => { r.style.removeProperty('opacity'); if (oldOp) r.style.setProperty('opacity', oldOp, oldPri); saved.forEach(f => f()); });
      rec.roots.push({ el: r, layer: base, undo });
      obs.observe(r, { attributes: true, childList: true, subtree: true, characterData: true });
      for (let p = r.parentElement; p && p !== svg.parentElement; p = p.parentElement) if (!watch.has(p)){ watch.add(p); obs.observe(p, { attributes: true, attributeFilter: ['class', 'style', 'transform', 'opacity', 'visibility', 'display'] }); }
      obs.takeRecords(); busy = false;
    }
    rec.building = false; LOEFT.slice = Math.max(LOEFT.slice || 0, performance.now() - sl);
    DBG.count('loeftet', rec.roots.length); if (LOEFT.slice > 30) DBG.count('loeftBid', Math.round(LOEFT.slice));
  }
  /* en løftet ting lægges tilbage. Bagefter prøves hele SVG'en igen (med de nye farver og størrelser), men ikke hvis den
     bliver ved med at ændre sig (så er den en del af et spil, og så får den lov at være) */
  const drops = new WeakMap();
  function drop(svg, x){
    const rec = lifts.get(svg); if (!rec) return; busy = true;
    x.layer.remove(); x.undo.forEach(f => f()); rec.roots = rec.roots.filter(y => y !== x);
    if (rec.obs) rec.obs.takeRecords(); busy = false;
    const n = (drops.get(svg) || 0) + 1; drops.set(svg, n);
    if (n <= 6){ clearTimeout(rec.again); rec.again = setTimeout(() => { if (!svg.isConnected || svg.closest('[hidden]')) return; forget(svg); liftSvg(svg).catch(() => {}); }, 1200); }
  }
  function forget(svg){ const rec = lifts.get(svg); if (!rec) return; clearTimeout(rec.again);
    busy = true; rec.roots.forEach(x => { x.layer.remove(); x.undo.forEach(f => f()); }); rec.roots = [];
    if (rec.obs){ rec.obs.takeRecords(); rec.obs.disconnect(); } if (rec.ro) rec.ro.disconnect(); if (rec.ov) rec.ov.remove(); lifts.delete(svg); busy = false; }
  /* en skærm: ryd op efter SVG'er, der er væk, og løft de nye */
  function scan(root){
    const T0 = performance.now();
    for (const svg of [...lifts.keys()]) if (!svg.isConnected) forget(svg);
    if (!root || !LOEFT_ON()) return;
    if (!LOEFT_SKAERME.includes('#' + root.id) || root.hidden) return;
    root.querySelectorAll('svg').forEach(s => { if (!s.ownerSVGElement && !s.closest('.lf-ov') && !s.closest('#town')) liftSvg(s).catch(e => { DBG.row('fejl', { besked: 'løft: ' + e.message }); forget(s); }); });
    const ms = Math.round(performance.now() - T0); LOEFT.ms = ms; if (ms > 20) DBG.count('loeftMs', ms);
  }
  let pend = 0;
  /* når skærmen er færdig med at glide ind og telefonen har tid (ellers giver opmålingen et hak midt i skiftet) */
  const later = root => { clearTimeout(pend); pend = setTimeout(() => { const go = () => scan(root); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 1500 }); else go(); }, 700); };
  /* ---------- figuren ----------
     Figuren er en SVG med sine egne SMIL-animationer (blink, vejrtrækning, kig, vink, hop, glimt). Her laves en hel figur
     om til lag: alt i rækkefølge, faste dele som billeder og de bevægelige som lag med samme bevægelse. Det kræver, at
     hver animation kan genskabes; ellers bruges billedet som før (null) */
  const secs = v => { v = String(v || '0').trim(); return /ms$/.test(v) ? parseFloat(v) / 1000 : parseFloat(v) || 0; };
  function smilAnim(a){
    const t = a.tagName, at = a.getAttribute('attributeName'), type = a.getAttribute('type') || 'translate';
    if (t === 'set' || t === 'animateMotion') return null;
    /* 'læg til' på et element uden egen flytning er det samme som en almindelig animation */
    const sum = a.getAttribute('additive') === 'sum' && !(t === 'animateTransform' && !a.parentElement.getAttribute('transform'));
    if ((a.getAttribute('repeatCount') || '') !== 'indefinite' || sum || a.getAttribute('accumulate') === 'sum' || a.getAttribute('keyPoints')) return null;
    if (/[a-z]/i.test((a.getAttribute('begin') || '0s').replace(/m?s/g, ''))) return null;
    if (t === 'animateTransform' && !/^(translate|rotate|scale)$/.test(type)) return null;
    if (t === 'animate' && at !== 'opacity') return null;
    if (a.parentElement.querySelectorAll(':scope > animateTransform').length > 1 && t === 'animateTransform') return null;
    const dur = secs(a.getAttribute('dur')) * 1000, delay = secs(a.getAttribute('begin')) * 1000; if (!(dur > 0)) return null;
    const vals = (a.getAttribute('values') || [a.getAttribute('from'), a.getAttribute('to')].join(';')).split(';').map(x => x.trim()).filter(x => x !== '');
    const kt = a.getAttribute('keyTimes'), offs = kt ? kt.split(';').map(Number) : vals.map((_, i) => vals.length > 1 ? i / (vals.length - 1) : 0);
    if (offs.length !== vals.length) return null;
    const mode = a.getAttribute('calcMode') || (t === 'animateMotion' ? 'paced' : 'linear');
    const ks = (a.getAttribute('keySplines') || '').split(';').map(x => x.trim()).filter(Boolean);
    const num = x => x.split(/[\s,]+/).map(Number);
    let f;
    if (t === 'animateTransform'){
      if (type === 'translate') f = x => { const [p, q = 0] = num(x); return { transform: `translate(${p}px,${q}px)` }; };
      else if (type === 'rotate') f = x => { const [r, cx = 0, cy = 0] = num(x); return { transform: `translate(${cx}px,${cy}px) rotate(${r}deg) translate(${-cx}px,${-cy}px)` }; };
      else f = x => { const [p, q = p] = num(x); return { transform: `scale(${p},${q})` }; };
    } else f = x => ({ opacity: +x });
    const kf = vals.map((v, i) => { const k = Object.assign({ offset: offs[i] }, f(v));
      if (mode === 'discrete') k.easing = 'steps(1, jump-end)';
      else if (mode === 'spline' && ks[i]) k.easing = `cubic-bezier(${ks[i].split(/[\s,]+/).join(',')})`;
      else if (mode === 'paced') return null;
      return k; });
    if (kf.some(k => !k)) return null;
    /* SMIL holder den sidste værdi til tidens udløb; det skal stå som et sidste nøglebillede */
    if (kf[kf.length - 1].offset < 1) kf.push(Object.assign({}, kf[kf.length - 1], { offset: 1, easing: 'linear' }));
    if (kf[0].offset > 0) kf.unshift(Object.assign({}, kf[0], { offset: 0 }));
    const kind = t === 'animateTransform' ? 'tr' : 'op';
    return { smil: a, kind, kf, timing: { duration: dur, delay, iterations: Infinity, easing: 'linear' }, cur: 0, tr: kind === 'tr', op: kind === 'op' };
  }
  /* en hel SVG som et træ af lag (i tegnerækkefølge). Returnerer null, hvis noget ikke kan genskabes */
  function tree(svg){
    const anims = new Map();
    for (const a of svg.querySelectorAll(SMIL)){
      if (a.closest('defs,clipPath,mask,pattern,symbol,marker,filter,linearGradient,radialGradient')) return null;
      const x = smilAnim(a); if (!x) return null;
      const e = a.parentElement; if (!anims.has(e)) anims.set(e, []); anims.get(e).push(x); }
    for (const e of anims.keys()) for (let p = e; p && p !== svg; p = p.parentElement){ if (p.getAttribute('filter') || p.getAttribute('mask') || p.getAttribute('clip-path')) return null; }
    const info = { anims, run: [], inner: new Set() };
    for (const e of anims.keys()) for (let p = e.parentElement; p && p !== svg; p = p.parentElement) info.inner.add(p);
    /* animationerne stoppes i kilden, så den kan måles i hvilestilling */
    for (const a of [...svg.querySelectorAll(SMIL)]) a.remove();
    const top = document.createElement('div'); top.className = 'lf-n';
    let run = [];
    const flush = () => { if (run.length){ const p = piece(run, svg, false); if (p) top.append(p); run = []; } };
    for (const c of svg.children){
      if (SKIP.test(c.tagName)) continue;
      if (anims.has(c) || info.inner.has(c)){ flush(); top.append(node(c, svg, info)); } else run.push(c);
    }
    flush();
    return { el: top, run: info.run };
  }
  return { scan, later, lifts, tree, place, count: () => [...lifts.values()].reduce((n, r) => n + r.roots.length, 0) };
})();
/* kun de rolige skærme. I spillene (kosten, faldskærmen) flytter koden selv rundt på scenen hele tiden */
const LOEFT_SKAERME = ['#home', '#room', '#balls', '#school', '#potion', '#arkade'];
function LOEFT_ON(){ try { return localStorage.getItem('glimmerstudiet.loeft') !== '0' && !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){ return true; } }
