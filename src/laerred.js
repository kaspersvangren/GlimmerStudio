/* ================= Lærreds-byen (forsøg): hele byen tegnet på ét lærred =================
   Et forsøg til måling, ikke en del af spillet endnu. Det genbruger det bagte billede og arket med de
   bevægelige stykker fra lageret og afspiller de samme bevægelser med drawImage på ét <canvas>, i stedet
   for som ~260 lag, browseren selv skal lægge sammen. Figurer og talebobler er færdige billeder.
   Startes fra fejlsøgningen: hold fingeren på det røde LOG-mærke i byen i et sekund. Fire målinger køres efter hinanden,
   og resultatet sendes til loggen. Bagefter er byen tilbage som før. */
const LAERRED = (() => {
  let raf = 0, cv = null, ST = null, undo = [], running = false;
  const parseT = s => { const out = [], re = /(\w+)\(([^)]*)\)/g; let m;
    while ((m = re.exec(s))) out.push([m[1], m[2].split(/[\s,]+/).map(parseFloat)]); return out; };
  const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]];
  const toM = fl => { let M = [1,0,0,1,0,0];
    for (const [f, a] of fl){
      if (f === 'translate') M = mul(M, [1,0,0,1,a[0],a[1]||0]);
      else if (f === 'rotate'){ const r = a[0]*Math.PI/180, c = Math.cos(r), s = Math.sin(r); M = mul(M, [c,s,-s,c,0,0]); }
      else if (f === 'scale') M = mul(M, [a[0],0,0,a[1]??a[0],0,0]);
      else if (f === 'skewX') M = mul(M, [1,0,Math.tan(a[0]*Math.PI/180),1,0,0]);
      else if (f === 'skewY') M = mul(M, [1,Math.tan(a[0]*Math.PI/180),0,1,0,0]);
      else if (f === 'matrix') M = mul(M, a); }
    return M; };
  const compileAnim = a => ({ kf: a.kf.map(k => ({ off: k.offset, t: k.transform != null ? parseT(k.transform) : null, o: k.opacity })), dur: a.dur, delay: a.delay || 0 });
  /* en bevægelses værdi til tiden t (ms) */
  function sample(A, t){
    const u = t - A.delay; if (u < 0) return null;
    const k = (u % A.dur) / A.dur, kf = A.kf; let i = 0; while (i < kf.length - 1 && k >= kf[i + 1].off) i++;
    const a = kf[i], b = kf[i + 1] || a, f = b === a ? 0 : (k - a.off) / ((b.off - a.off) || 1);
    let m = null, o = null;
    if (a.t) m = toM(a.t.map(([fn, args], j) => [fn, args.map((v, n) => v + (((b.t && b.t[j] && b.t[j][1][n]) ?? v) - v) * f)]));
    if (a.o != null) o = a.o + ((b.o ?? a.o) - a.o) * f;
    return { m, o };
  }
  /* lagenes træ flades ud til en liste af tegneopgaver; hver har sin kæde af flytninger */
  function flatten(g){
    const out = [];
    const walk = (spec, chain) => {
      if (spec.p != null){ const pc = g.pieces[spec.p]; if (pc) out.push({ kind: 'p', pc, chain }); return; }
      if (spec.d){ out.push({ kind: 'd', d: spec.d, chain, path: new Path2D(spec.d.path) }); return; }
      const c2 = chain.concat(spec.w.map(w => ({ m: w.m ? w.m.slice() : null, o: w.o ?? null, a: w.a ? compileAnim(w.a) : null })));
      for (const k of spec.c) walk(k, c2);
    };
    for (const it of g.items) walk(it, []);
    return out;
  }
  const svgImg = (src, w, h) => new Promise((res, rej) => { const img = new Image();
    img.onload = () => { try { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.transferToImageBitmap()); } catch (e){ rej(e); } };
    img.onerror = () => rej(new Error('billede')); img.src = src; });

  async function start(o = {}){
    const T0 = performance.now(), dpr = o.dpr ?? (window.devicePixelRatio || 1);
    const rec = BAKE.key ? await BIDB.get(BAKE.key) : null; if (!rec || !rec.gpu) throw new Error('intet bagt kort');
    const svg = $('#townSvg'), street = $('#street'), CTM = svg.getScreenCTM();
    const [bg, ...sheets] = await Promise.all([createImageBitmap(rec.png), ...rec.gpu.sheets.map(b => createImageBitmap(b))]);
    /* det, der stadig lever i SVG'en (skilte, tekst, glød): i en rigtig løsning bages det med; her ét ekstra billede */
    const c0 = svg.cloneNode(true);
    c0.querySelectorAll('.bk,image.baked-bg,[style*="multiply"]').forEach(e => e.remove());
    c0.setAttribute('width', CW); c0.setAttribute('height', CH); c0.setAttribute('viewBox', `0 0 ${CW} ${CH}`);
    const overlay = await svgImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c0)), CW * CTM.a * dpr, CH * CTM.d * dpr);
    const list = flatten(rec.gpu);
    /* figurer: færdige billeder (heltinden, dyret, gæster) */
    const kS = CTM.a * dpr * 1.1, dW = DOLL_H * 720 / 1010 * kS, dH = DOLL_H * kS, pW = PET_H * 400 / 380 * kS, pH = PET_H * kS;
    const hero = await svgImg(SPR.walk, dW, dH), pet = SPR.pwalk ? await svgImg(SPR.pwalk, pW, pH) : null;
    const guests = await Promise.all([0, 1, 2, 3].map(() => svgImg(svgUrl(renderDoll(randomState({}), { viewBox: VB_DOLL, pet: false, walk: true })), dW, dH)));
    const bubble = text => { const w = Math.max(70, text.length * 12 + 34), c = new OffscreenCanvas(Math.ceil((w + 8) * kS), Math.ceil(64 * kS)), x = c.getContext('2d');
      x.scale(kS, kS); x.translate(w / 2 + 4, 50); x.fillStyle = '#FFF'; x.strokeStyle = 'rgba(51,32,79,.22)'; x.lineWidth = 2.5;
      x.beginPath(); x.roundRect(-w / 2, -46, w, 42, 21); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-9, -5); x.lineTo(0, 10); x.lineTo(9, -5); x.fill();
      x.fillStyle = '#33204F'; x.font = `700 21px ${FONT_C}`; x.textAlign = 'center'; x.fillText(text, 0, -19); return { bm: c.transferToImageBitmap(), w }; };
    const bubbles = [bubble('Hej med dig!'), bubble('Flot tøj!')];
    /* gående figurer på byens rigtige stier */
    const walkers = [];
    for (let i = 0; i < (o.walkers ?? 6); i++){
      const isPet = i === 1 && !!pet, bm = i === 0 ? hero : isPet ? pet : guests[i % guests.length];
      const w = { bm, h: isPet ? PET_H : DOLL_H, foot: isPet ? 0.921 : 0.977, ar: isPet ? 400 / 380 : 720 / 1010, x: 0, y: 0, dir: 1, t0: Math.random() * 1000, route: null };
      w.go = () => { if (!cv) return; const a = SPOTS[Math.floor(Math.random() * SPOTS.length)], b = SPOTS[Math.floor(Math.random() * SPOTS.length)];
        const pts = routeTo(a, b); if (pts.length < 2){ setTimeout(w.go, 10); return; }
        const seg = []; let tot = 0; for (let j = 1; j < pts.length; j++){ const l = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); seg.push(l); tot += l; }
        w.route = { pts, seg, total: tot, d: 0 }; };
      walkers.push(w);
    }
    const sh = SHADE[CM.time], W = innerWidth, H = innerHeight;
    cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext('2d', { alpha: false });
    const base = [CTM.a * dpr, 0, 0, CTM.d * dpr, CTM.e * dpr, CTM.f * dpr], setB = () => ctx.setTransform(base[0], base[1], base[2], base[3], base[4], base[5]);
    /* alt stillestående og nattens farvelag i ÉT billede, og farvelaget ganget ind i arket (som en bagning på forhånd ville gøre) */
    const g = new OffscreenCanvas(cv.width, cv.height), gx = g.getContext('2d');
    gx.fillStyle = SKY[CM.time][0]; gx.fillRect(0, 0, g.width, g.height);
    gx.setTransform(base[0], 0, 0, base[3], base[4], base[5]); gx.drawImage(bg, rec.x0, rec.y0, rec.W, rec.H);
    gx.setTransform(1, 0, 0, 1, 0, 0); gx.drawImage(overlay, CTM.e * dpr, CTM.f * dpr);
    if (sh){ gx.globalCompositeOperation = 'multiply'; gx.globalAlpha = sh[1] * .8; gx.fillStyle = sh[0]; gx.fillRect(0, 0, g.width, g.height); }
    const ground = g.transferToImageBitmap(); let drawSheets = sheets;
    if (sh){ const al = sh[1] * .8, k = [1, 3, 5].map(i => 1 - al + al * parseInt(sh[0].slice(i, i + 2), 16) / 255);
      drawSheets = sheets.map(S => { const oc = new OffscreenCanvas(S.width, S.height), ox = oc.getContext('2d', { willReadFrequently: true }); ox.drawImage(S, 0, 0);
        const id = ox.getImageData(0, 0, S.width, S.height), d = id.data; for (let i = 0; i < d.length; i += 4){ d[i] *= k[0]; d[i + 1] *= k[1]; d[i + 2] *= k[2]; }
        ox.putImageData(id, 0, 0); return oc.transferToImageBitmap(); }); }
    /* den gamle by slukkes, så kun lærredet tegnes. Med 'tryk' bliver SVG'en liggende usynlig ovenpå (til tryk) */
    const set = (e, prop, v) => { if (!e) return; const old = e.style[prop]; e.style[prop] = v; undo.push(() => { e.style[prop] = old; }); };
    LIFE.on = false;
    if (o.tryk){ const r = street.getBoundingClientRect();
      Object.assign(cv.style, { position: 'absolute', left: -r.left + 'px', top: -r.top + 'px', width: W + 'px', height: H + 'px' }); street.prepend(cv);
      set($('#world'), 'background', 'none'); set(svg, 'opacity', '0'); set($('#townLive'), 'display', 'none'); set(GPU.layer, 'display', 'none');
      svg.pauseAnimations(); undo.push(() => svg.unpauseAnimations()); }
    else { Object.assign(cv.style, { position: 'fixed', left: 0, top: 0, width: W + 'px', height: H + 'px', zIndex: 50 }); document.body.append(cv); set(street, 'display', 'none'); }
    walkers.forEach(w => w.go());
    const tPrep = performance.now() - T0, tStart = performance.now(), stats = ST = { frames: 0, drawMs: 0 }; let last = tStart;
    const frame = now => {
      const f0 = performance.now(), t = now - tStart, dt = Math.min(50, now - last); last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(ground, 0, 0);
      for (const it of list){
        let M = base, a = 1;
        for (const w of it.chain){ let m = w.m, op = w.o;
          if (w.a){ const s = sample(w.a, t); if (s){ if (s.m) m = s.m; if (s.o != null) op = s.o; } }
          if (m) M = mul(M, m); if (op != null) a *= op; }
        if (a <= 0.003) continue;
        ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); ctx.globalAlpha = a;
        if (it.kind === 'p'){ const pc = it.pc; if (pc.blend) ctx.globalCompositeOperation = pc.blend;
          ctx.drawImage(drawSheets[pc.sheet], pc.ax, pc.ay, pc.aw, pc.ah, pc.x, pc.y, pc.w, pc.h);
          if (pc.blend) ctx.globalCompositeOperation = 'source-over'; }
        else { const d = it.d, u = t / 1000 - (d.begin || 0); let v = d.off0;
          if (u >= 0 && d.vals){ const k = (u % d.dur) / d.dur; let i = 0; while (i < d.offs.length - 1 && k >= d.offs[i + 1]) i++; v = d.disc || i >= d.vals.length - 1 ? d.vals[i] : d.vals[i] + (d.vals[i + 1] - d.vals[i]) * (k - d.offs[i]) / ((d.offs[i + 1] - d.offs[i]) || 1); }
          ctx.strokeStyle = d.grad ? '#9fd' : d.stroke; ctx.globalAlpha = a * d.so; ctx.lineWidth = d.sw; ctx.lineCap = d.cap; ctx.lineJoin = d.join;
          ctx.setLineDash(d.dash.length % 2 ? d.dash.concat(d.dash) : d.dash); ctx.lineDashOffset = v; ctx.stroke(it.path); ctx.setLineDash([]); }
      }
      ctx.globalAlpha = 1;
      for (const w of walkers){ const r = w.route; if (r){ r.d = Math.min(r.total, r.d + 0.3 * Math.max(.3, depthS(w.y || 700)) * dt); const [x, y, dx] = routePos(r, r.d); if (Math.abs(dx) > .5) w.dir = dx < 0 ? -1 : 1; w.x = x; w.y = y; if (r.d >= r.total){ w.route = null; setTimeout(w.go, 400); } } }
      walkers.sort((p, q) => p.y - q.y);
      for (const w of walkers){ const s = Math.max(.3, depthS(w.y)), tt = (now + w.t0) / 1000, bob = w.route ? -Math.abs(Math.sin(tt * 7)) * 5 : 0, h = w.h * s, wd = h * w.ar;
        setB(); ctx.translate(w.x, w.y);
        ctx.globalAlpha = .16; ctx.fillStyle = '#33204F'; ctx.beginPath(); ctx.ellipse(0, 0, wd * .28, h * .04, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        ctx.translate(0, bob); if (w.route) ctx.rotate(Math.sin(tt * 7) * 3 * Math.PI / 180); if (w.dir < 0) ctx.scale(-1, 1);
        ctx.drawImage(w.bm, -wd / 2, -h * w.foot, wd, h); }
      bubbles.forEach((b, i) => { const w = walkers[i * 2]; if (!w) return; const s = depthS(w.y); setB(); ctx.translate(w.x - b.w / 2 - 4, w.y - w.h * s * 0.98 - 50); ctx.drawImage(b.bm, 0, 0, b.bm.width / kS, b.bm.height / kS); });
      stats.frames++; stats.drawMs += performance.now() - f0;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return { klar: Math.round(tPrep), ting: list.length, px: cv.width + 'x' + cv.height };
  }
  function stop(){ cancelAnimationFrame(raf); if (cv) cv.remove(); cv = null; undo.splice(0).reverse().forEach(f => f()); }

  /* ---------- målingen: fire udgaver efter hinanden, 8 sekunder hver ---------- */
  const FASER = [
    ['byen som nu', null],
    ['lærred, fuld skarphed', {}],
    ['lærred, lavere skarphed', { dpr: 1 }],
    ['lærred med usynlig by ovenpå', { tryk: true }] ];
  const maal = sek => new Promise(res => { const fr = []; let last = 0, t0 = 0;
    const q = t => { if (!t0) t0 = t; else fr.push(t - last); last = t; DBG.count('test'); if (t - t0 < sek * 1000) requestAnimationFrame(q); else res(fr); };
    requestAnimationFrame(q); });
  const stat = fr => { const f = fr.slice().sort((a, b) => a - b), n = f.length, sum = fr.reduce((a, b) => a + b, 0), q = p => +f[Math.min(n - 1, Math.floor(p * n))].toFixed(1);
    const fps1 = []; let acc = 0, k = 0; fr.forEach(d => { acc += d; k++; if (acc >= 1000){ fps1.push(Math.round(k * 1000 / acc)); acc = 0; k = 0; } });
    return { fps: +(n * 1000 / sum).toFixed(1), p50: q(.5), p95: q(.95), max: q(1), fps1 }; };
  async function test(sek = 8){
    if (running) return null;
    if ($('#town').hidden || !GPU.on || !BAKE.key){ toast('Åbn byen først'); return null; }
    running = true;
    const lab = el('div', { class: 'lr-lab' }); document.body.append(lab);
    const res = [];
    try {
      for (let i = 0; i < FASER.length; i++){ const [navn, o] = FASER[i]; lab.textContent = `Måler ${i + 1} af ${FASER.length}: ${navn} …`;
        const info = o ? await start(o) : null; await wait(1500);
        const r = { navn, ...stat(await maal(sek)) };
        if (o){ Object.assign(r, info, { js: +(ST.drawMs / Math.max(1, ST.frames)).toFixed(2) }); stop(); await wait(300); }
        res.push(r); }
    } catch (e){ res.push({ fejl: String(e && e.message || e) }); stop(); }
    lab.remove();
    DBG.row('laerredtest', { faser: res, skaerm: `${innerWidth}x${innerHeight}`, dpr: window.devicePixelRatio || 1, kamera: CAM.on, tid: CM.time }, 'town'); DBG.flush();
    showTown({ quiet: true });
    running = false;
    const panel = el('div', { class: 'lr-res' }, [ el('h2', {}, 'Målingen er sendt'),
      ...res.map(r => el('p', {}, r.fejl ? 'Fejl: ' + r.fejl : `${r.navn}: ${Math.round(r.fps)} billeder i sekundet`)),
      el('button', { class: 'btn', type: 'button', on: { click: () => panel.remove() } }, 'Luk') ]);
    document.body.append(panel);
    return res;
  }
  return { start, stop, test, get running(){ return running; } };
})();
