/* ================= Faldskærmens jord på et lærred =================
   Jorden er en stor tegning (8 × 8 km, flere tusinde figurer). Som SVG skulle telefonen tegne den hele forfra
   i hvert billede, fordi den zoomer hele tiden. Her læses tegningen én gang og laves om til en liste af figurer
   (med kasse, farver og deres egen højde over jorden), som tegnes på et lærred:
   - kun det, der er på skærmen, og som er stort nok til at kunne ses
   - ting med højde (trætoppe, tage, tårne, folk) tegnes som set fra et kamera i luften: jo tættere på kameraet,
     jo større og jo hurtigere glider de forbi. Det giver dybde.
   - de få ting, der bevæger sig (ildfluer, røg, vindposen), regnes med i hvert billede. */
const FaldJord = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const num = (e, n, d = 0) => { const v = parseFloat(e.getAttribute(n)); return isNaN(v) ? d : v; };
  const secs = v => { const m = /^(-?[\d.]+)\s*(ms|s)?$/.exec(String(v || '0').trim()); return m ? (m[2] === 'ms' ? +m[1] / 1000 : +m[1]) : 0; };

  /* figurens form i dens egne koordinater */
  function shape(e){
    const p = new Path2D(), t = e.tagName;
    if (t === 'rect'){ const x = num(e, 'x'), y = num(e, 'y'), w = num(e, 'width'), h = num(e, 'height'), rx = Math.min(num(e, 'rx', num(e, 'ry')), w / 2, h / 2);
      if (rx > 0 && p.roundRect) p.roundRect(x, y, w, h, rx); else p.rect(x, y, w, h); }
    else if (t === 'circle') p.arc(num(e, 'cx'), num(e, 'cy'), num(e, 'r'), 0, Math.PI * 2);
    else if (t === 'ellipse') p.ellipse(num(e, 'cx'), num(e, 'cy'), num(e, 'rx'), num(e, 'ry'), 0, 0, Math.PI * 2);
    else if (t === 'path') return new Path2D(e.getAttribute('d') || '');
    else if (t === 'polygon' || t === 'polyline'){ const q = (e.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      for (let i = 0; i + 1 < q.length; i += 2) i ? p.lineTo(q[i], q[i + 1]) : p.moveTo(q[i], q[i + 1]); if (t === 'polygon') p.closePath(); }
    else if (t === 'line'){ p.moveTo(num(e, 'x1'), num(e, 'y1')); p.lineTo(num(e, 'x2'), num(e, 'y2')); }
    else return null;
    return p;
  }
  /* farveovergange (kun dem jorden bruger: radiale i figurens egen kasse) */
  function gradOf(svg, v){
    const m = /url\(["']?#([^"')]+)/.exec(v || ''); if (!m) return null;
    const g = svg.querySelector('#' + CSS.escape(m[1])); if (!g) return null;
    const stops = [...g.querySelectorAll('stop')].map(s => { const cs = getComputedStyle(s), c = cs.stopColor.match(/[\d.]+/g).map(Number);
      return [parseFloat(s.getAttribute('offset')) || 0, `rgba(${c[0]},${c[1]},${c[2]},${(c[3] ?? 1) * +cs.stopOpacity})`]; });
    return { radial: g.tagName === 'radialGradient', cx: num(g, 'cx', .5), cy: num(g, 'cy', .5), r: num(g, 'r', .5), x1: num(g, 'x1', 0), y1: num(g, 'y1', 0), x2: num(g, 'x2', 1), y2: num(g, 'y2', 0), stops };
  }

  /* læs tegningen: i bidder, så skærmen ikke fryser. Kalder done(model), når den er færdig */
  function build(defs, inner, done){
    const host = document.createElementNS(NS, 'svg');
    host.setAttribute('width', '1'); host.setAttribute('height', '1');
    host.style.cssText = 'position:absolute;left:-10px;top:-10px;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none';
    host.innerHTML = `<defs>${defs}</defs><g>${inner}</g>`;
    document.body.append(host);
    const root = host.lastChild, leaves = [...root.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line')], prims = [];
    const opac = new Map(), opOf = g => { if (g === root || !g) return 1; if (opac.has(g)) return opac.get(g); const v = (+getComputedStyle(g).opacity) * opOf(g.parentElement); opac.set(g, v); return v; };
    let i = 0;
    const chunk = () => {
      const until = performance.now() + 10;
      for (; i < leaves.length && performance.now() < until; i++){
        const e = leaves[i], cs = getComputedStyle(e); if (cs.display === 'none') continue;
        const path = shape(e); if (!path) continue;
        const sockR = e.closest('.fs-sockr');
        let M = e.getCTM(); if (!M) continue;
        let P = null; if (sockR){ P = { p: DOMMatrix.fromMatrix(sockR.parentElement.getCTM()), l: DOMMatrix.fromMatrix(sockR.getCTM()).inverse().multiply(DOMMatrix.fromMatrix(M)) }; }
        const bb = e.getBBox(), cs4 = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(M));
        const sw = cs.stroke !== 'none' ? parseFloat(cs.strokeWidth) || 0 : 0, sc = Math.hypot(M.a, M.b), pad = sw * sc / 2;
        const box = [Math.min(...cs4.map(q => q.x)) - pad, Math.min(...cs4.map(q => q.y)) - pad, Math.max(...cs4.map(q => q.x)) + pad, Math.max(...cs4.map(q => q.y)) + pad];
        const zEl = e.closest('[data-z]'), an = e.querySelector('animate[attributeName="opacity"]');
        prims.push({ path, m: DOMMatrix.fromMatrix(M), box, size: Math.max(box[2] - box[0], box[3] - box[1]), bb: [bb.x, bb.y, bb.width, bb.height],
          z: zEl ? parseFloat(zEl.dataset.z) || 0 : 0, n: prims.length,
          fill: cs.fill === 'none' ? null : /^url/.test(cs.fill) ? gradOf(host, cs.fill) : cs.fill, fo: +cs.fillOpacity,
          stroke: cs.stroke === 'none' || !sw ? null : cs.stroke, so: +cs.strokeOpacity, sw, cap: cs.strokeLinecap, join: cs.strokeLinejoin,
          dash: cs.strokeDasharray === 'none' ? null : cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter(v => !isNaN(v)), doff: parseFloat(cs.strokeDashoffset) || 0,
          op: an ? opOf(e.parentElement) : +cs.opacity * opOf(e.parentElement),
          anim: an ? { vals: an.getAttribute('values').split(';').map(Number), dur: secs(an.getAttribute('dur')), begin: secs(an.getAttribute('begin')) } : null,
          smoke: !!e.closest('.fs-smoke'), sock: P });
      }
      if (i < leaves.length){ setTimeout(chunk, 0); return; }
      host.remove();
      /* først alt på jorden, så det med højde (lavest først); ellers i tegningens rækkefølge */
      prims.sort((a, b) => (a.z - b.z) || (a.n - b.n));
      done({ prims });
    };
    chunk();
  }

  /* tegn. v: { ppm, cx, cy } (jordens zoom og midtpunkt, som i spillet), map: SVG-enheder -> lærredets pixels, t: tid i sek, sock: { a, k }
     Højt oppe (i det frie fald) er der mange små ting på skærmen, men højden giver næsten ingen dybde, og billedet zoomer langsomt.
     Så tegnes jorden på et lager-lærred en gang imellem, og ellers vises lageret bare lidt mere zoomet (det klarer grafikchippen). */
  const C = { cv: null, ppm: 0, cx: 0, cy: 0, key: '', m: 0 };
  function draw(ctx, model, v, map, t, sock, haze){
    draw0(ctx, model, v, map, t, sock); if (haze > 0) hazeOn(ctx, map, haze);
  }
  /* disen over jorden (som SVG'ens: en elliptisk overgang i en kasse på 5000 × 2400 omkring billedet) */
  function hazeOn(ctx, map, a){
    ctx.setTransform(map.a * 5000, 0, 0, map.a * 2400, map.a * -1700 + map.e, map.a * -700 + map.f);
    const G = ctx.createRadialGradient(.5, .5, 0, .5, .5, .75); G.addColorStop(0, 'rgba(200,184,240,.12)'); G.addColorStop(1, 'rgba(42,34,96,.75)');
    ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = G; ctx.fillRect(0, 0, 1, 1); ctx.globalAlpha = 1;
  }
  function draw0(ctx, model, v, map, t, sock){
    const W = ctx.canvas.width, H = ctx.canvas.height, D = 720 / v.ppm;
    if (model && D > 350){
      const key = `${W}x${H}|${map.a}|${map.e}|${map.f}|${v.cx}|${v.cy}`, s = v.ppm / C.ppm;
      if (C.model !== model || C.key !== key || !(s > .955 && s <= 1.0001)){
        if (!C.cv) C.cv = document.createElement('canvas');
        /* margen: lageret tegnes lidt for tæt på og skrumper ind mod det rigtige; det skal stadig dække hele skærmen */
        const MARGIN = C.m = Math.ceil(.05 * Math.max(W, H)) + 2; C.cv.width = W + 2 * MARGIN; C.cv.height = H + 2 * MARGIN;
        C.ppm = v.ppm * 1.04; C.key = key; C.model = model;
        drawRaw(C.cv.getContext('2d', { alpha: false }), model, { ppm: C.ppm, cx: v.cx, cy: v.cy }, { a: map.a, e: map.e + MARGIN, f: map.f + MARGIN }, t, sock);
      }
      const k = v.ppm / C.ppm, px = map.a * 800 + map.e, py = map.a * 500 + map.f, MARGIN = C.m;
      ctx.fillStyle = '#2A2350'; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillRect(0, 0, W, H);
      ctx.setTransform(k, 0, 0, k, px - k * (px + MARGIN), py - k * (py + MARGIN)); ctx.globalAlpha = 1; ctx.drawImage(C.cv, 0, 0);
      return;
    }
    C.model = null;
    drawRaw(ctx, model, v, map, t, sock);
  }
  function drawRaw(ctx, model, v, map, t, sock){
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#2A2350'; ctx.fillRect(0, 0, W, H);
    if (!model) return;
    const SCX = 800, SCY = 500, FOCAL = 720, D = FOCAL / v.ppm;
    let lastZ = null, k = 0, ox = 0, oy = 0, vx0 = 0, vx1 = 0, vy0 = 0, vy1 = 0, minS = 0;
    let fs = null, ss = null, lw = -1, lc = '', lj = '', ld = '';
    for (const p of model.prims){
      if (p.z !== lastZ){ lastZ = p.z;
        /* kameraet ser lige ned: noget i højden z er tættere på og ses større */
        if (p.z >= D - 1) break;
        const ppz = FOCAL / (D - p.z);
        k = map.a * ppz; ox = map.a * (SCX - v.cx * ppz) + map.e; oy = map.a * (SCY - v.cy * ppz) + map.f;
        vx0 = -ox / k; vx1 = (W - ox) / k; vy0 = -oy / k; vy1 = (H - oy) / k; minS = .4 / k; }
      const b = p.box; if (b[2] < vx0 || b[0] > vx1 || b[3] < vy0 || b[1] > vy1 || p.size < minS) continue;
      let a = p.op;
      if (p.anim){ const u = t - p.anim.begin; if (u < 0) continue; const q = (u % p.anim.dur) / p.anim.dur * (p.anim.vals.length - 1), j = Math.floor(q), f = q - j; a *= p.anim.vals[j] + ((p.anim.vals[j + 1] ?? p.anim.vals[j]) - p.anim.vals[j]) * f; }
      if (a <= 0.004) continue;
      let m = p.m;
      if (p.sock && sock){ m = p.sock.p.rotate(sock.a).scale(sock.k, 1).multiply(p.sock.l); }
      if (p.smoke){ const s = (Math.sin(t * Math.PI / 3) + 1) / 2; a *= .5 + .5 * s; m = new DOMMatrix([1, 0, 0, 1, .6 * s, -.8 * s]).multiply(m); }
      ctx.setTransform(k * m.a, k * m.b, k * m.c, k * m.d, k * m.e + ox, k * m.f + oy);
      if (p.fill){
        ctx.globalAlpha = a * p.fo;
        if (typeof p.fill === 'string'){ if (p.fill !== fs){ ctx.fillStyle = fs = p.fill; } ctx.fill(p.path); }
        else { const g = p.fill, [bx, by, bw, bh] = p.bb; ctx.save(); ctx.clip(p.path); ctx.transform(bw, 0, 0, bh, bx, by);
          const G = g.radial ? ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.r) : ctx.createLinearGradient(g.x1, g.y1, g.x2, g.y2); g.stops.forEach(([o, c]) => G.addColorStop(Math.min(1, Math.max(0, o)), c));
          ctx.fillStyle = G; ctx.fillRect(0, 0, 1, 1); ctx.restore(); fs = null; }
      }
      if (p.stroke){
        ctx.globalAlpha = a * p.so;
        if (p.stroke !== ss) ctx.strokeStyle = ss = p.stroke;
        if (p.sw !== lw) ctx.lineWidth = lw = p.sw;
        if (p.cap !== lc) ctx.lineCap = lc = p.cap;
        if (p.join !== lj) ctx.lineJoin = lj = p.join;
        const dk = p.dash ? p.dash.join() : ''; if (dk !== ld){ ld = dk; ctx.setLineDash(p.dash || []); }
        if (p.dash) ctx.lineDashOffset = p.doff;
        ctx.stroke(p.path);
      }
    }
  }
  return { build, draw };
})();
