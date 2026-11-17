/* ================= Lærreds-byen: kortets bevægelige ting tegnet på ét lærred =================
   Før lå hver bevægelig ting på kortet (ca. 260) som sit eget HTML-lag, og browseren lagde dem sammen i hvert
   billede. Det var dét, der kostede: på tabletten gav det 37 billeder i sekundet, hvor ét lærred med de samme
   billeder og de samme bevægelser gav 90 (målt 17. november 2026).
   Her tegnes det bagte billede og alle stykkerne fra arket med drawImage på ét <canvas>, som ligger under
   SVG'en præcis hvor lagene lå. Alt andet er som før: SVG'en ovenpå tager imod tryk og viser tekst, figurer
   og nattens farvelag, og et hop på en ting i SVG'en spejles over på lærredet.
   Kan slås fra med glimmerstudiet.laerred = '0' (så bruges HTML-lagene igen). */
const LAERRED_KEY = 'glimmerstudiet.laerred';
function laerredWanted(){ try { return localStorage.getItem(LAERRED_KEY) !== '0' && !!window.createImageBitmap; } catch (e){ return !!window.createImageBitmap; } }
const LAERRED = (() => {
  let S = null;
  const mul = (A, B) => [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]];
  const parseT = s => { const out = [], re = /(\w+)\(([^)]*)\)/g; let m;
    while ((m = re.exec(s))) out.push([m[1], m[2].split(/[\s,]+/).map(parseFloat)]); return out; };
  const toM = fl => { let M = [1,0,0,1,0,0];
    for (const [f, a] of fl){
      if (f === 'translate') M = mul(M, [1,0,0,1,a[0],a[1]||0]);
      else if (f === 'rotate'){ const r = a[0]*Math.PI/180, c = Math.cos(r), s = Math.sin(r); M = mul(M, [c,s,-s,c,0,0]); }
      else if (f === 'scale') M = mul(M, [a[0],0,0,a[1]??a[0],0,0]);
      else if (f === 'skewX') M = mul(M, [1,0,Math.tan(a[0]*Math.PI/180),1,0,0]);
      else if (f === 'skewY') M = mul(M, [1,Math.tan(a[0]*Math.PI/180),0,1,0,0]);
      else if (f === 'matrix') M = mul(M, a); }
    return M; };
  /* nøglebillederne (samme som HTML-lagene fik som CSS-animation): lige stykker mellem dem, uendelig gentagelse */
  const compile = a => ({ kf: a.kf.map(k => ({ off: k.offset, t: k.transform != null ? parseT(k.transform) : null, o: k.opacity })), dur: a.dur, delay: a.delay || 0 });
  function sample(A, t, out){
    const u = t - A.delay; if (u < 0) return false;
    const k = (u % A.dur) / A.dur, kf = A.kf; let i = 0; while (i < kf.length - 1 && k >= kf[i + 1].off) i++;
    const a = kf[i], b = kf[i + 1] || a, f = b === a ? 0 : (k - a.off) / ((b.off - a.off) || 1);
    out.m = a.t ? toM(a.t.map(([fn, args], j) => [fn, args.map((v, n) => v + (((b.t && b.t[j] && b.t[j][1][n]) ?? v) - v) * f)])) : null;
    out.o = a.o != null ? a.o + ((b.o ?? a.o) - a.o) * f : null;
    return true;
  }
  /* spejl: en ting i SVG'en, hvis hop (CSS-animation), skjul og gennemsigtighed skal følge med på lærredet.
     Der læses kun fra SVG'en, når tingen ændrer klasse eller stil, og mens en animation på den kører */
  function mirror(s, A, local){
    let mr = s.mirOf.get(A); if (mr) return mr;
    const cs = getComputedStyle(A);
    mr = { A, local, hidden: cs.display === 'none', M: null, o: 1, live: false, dirty: false, o0: +cs.opacity || 1, E0: null, P: null };
    mr.ob = new MutationObserver(() => { mr.dirty = true; }); mr.ob.observe(A, { attributes: true, attributeFilter: ['class', 'style'] });
    s.mirOf.set(A, mr); s.mirs.push(mr); return mr;
  }
  /* tingens egen matrix lige nu: flytningen fra stilen (eller en animation) omkring stilens drejepunkt */
  function effM(A, cs){
    const K = cs.transform && cs.transform !== 'none' ? new DOMMatrix(cs.transform) : new DOMMatrix();
    const oo = cs.transformOrigin.split(' ').map(parseFloat); let ox = oo[0] || 0, oy = oo[1] || 0;
    if (cs.transformBox === 'fill-box'){ try { const bb = A.getBBox(); ox += bb.x; oy += bb.y; } catch (e){} }
    return ox || oy ? new DOMMatrix().translate(ox, oy).multiply(K).multiply(new DOMMatrix().translate(-ox, -oy)) : K;
  }
  function mirrorTick(s){
    for (const mr of s.mirs){ if (!mr.dirty && !mr.live) continue;
      const A = mr.A; mr.dirty = false;
      if (!A.isConnected){ mr.hidden = true; mr.live = false; mr.ob.disconnect(); continue; }
      const cs = getComputedStyle(A), ans = A.getAnimations(); mr.hidden = cs.display === 'none';
      mr.live = ans.some(a => a.playState === 'running' || a.pending);
      mr.o = Math.max(0, Math.min(1, (+cs.opacity) / mr.o0));
      if (!ans.length && !mr.was){ mr.M = null; continue; }
      try {
        if (!mr.E0){ /* grundstillingen: som tingen står uden animation (dens transform-attribut) */
          const b = A.transform && A.transform.baseVal.numberOfItems ? DOMMatrix.fromMatrix(A.transform.baseVal.consolidate().matrix) : new DOMMatrix(); mr.E0i = b.inverse(); mr.E0 = b;
          const root = s.svg.getScreenCTM(), pc = A.parentElement.getScreenCTM(); mr.P = local || !root || !pc ? null : DOMMatrix.fromMatrix(root.inverse().multiply(pc)); mr.Pi = mr.P ? mr.P.inverse() : null; }
        let W = effM(A, cs).multiply(mr.E0i); if (mr.P) W = mr.P.multiply(W).multiply(mr.Pi);
        mr.M = Math.abs(W.a - 1) + Math.abs(W.b) + Math.abs(W.c) + Math.abs(W.d - 1) + Math.abs(W.e) + Math.abs(W.f) < 1e-6 ? null : [W.a, W.b, W.c, W.d, W.e, W.f];
      } catch (e){ mr.M = null; }
      mr.was = ans.length > 0;
    }
  }
  /* lagenes træ flades ud til en liste af tegneopgaver; hver har sin kæde af flytninger (yderst først) */
  function flatten(s, g, st){
    const out = [];
    const mirs = (spec, local) => (spec.mir || []).map(i => st[i]).filter(Boolean).map(A => ({ mir: mirror(s, A, local) }));
    const walk = (spec, chain, top) => {
      const c1 = spec.mir ? chain.concat(mirs(spec, !top)) : chain;
      if (spec.p != null){ const pc = g.pieces[spec.p]; if (pc) out.push({ pc, chain: c1, still: !c1.length }); return; }
      if (spec.d){ out.push({ d: spec.d, chain: c1, path: new Path2D(spec.d.path), grad: null }); return; }
      const c2 = c1.concat(spec.w.map(w => ({ m: w.m ? w.m.slice() : null, o: w.o ?? null, a: w.a ? compile(w.a) : null })));
      for (const k of spec.c) walk(k, c2, false);
    };
    for (const it of g.items) walk(it, [], true);
    /* en kæde uden animation og uden spejl regnes sammen én gang */
    for (const it of out){ if (it.chain.some(w => w.a || w.mir)) continue;
      let M = [1,0,0,1,0,0], a = 1; for (const w of it.chain){ if (w.m) M = mul(M, w.m); if (w.o != null) a *= w.o; } it.fast = { M, a }; }
    return out;
  }

  async function mount(svg, gen, rec, st){
    const g = rec.gpu, host = svg.parentElement;
    const [bg, ...sheets] = await Promise.all([createImageBitmap(rec.png), ...g.sheets.map(b => createImageBitmap(b))]);
    if (gen !== BAKE.gen || !svg.isConnected){ [bg, ...sheets].forEach(b => b.close()); return null; }
    reset();
    const cv = document.createElement('canvas'); cv.className = 'gpu-cv'; cv.setAttribute('aria-hidden', 'true');
    const s = { svg, host, cv, ctx: cv.getContext('2d', { alpha: false }), bg, sheets, rec, mirs: [], mirOf: new Map(), T0: performance.now(), raf: 0, base: null, W: 0, H: 0, key: '', n: 0, ms: 0, tn: 0, tms: 0 };
    s.list = flatten(s, g, st); S = s;
    return cv;
  }
  /* lærredets mål og kortets placering på det. Kaldes, når kameraet eller skærmen ændrer sig */
  function sync(){
    const s = S; if (!s || !s.cv.isConnected) return;
    const st = s.host.parentElement, dpr = window.devicePixelRatio || 1, W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
    const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (pw !== s.W || ph !== s.H){ s.W = s.cv.width = pw; s.H = s.cv.height = ph; s.cv.style.width = W + 'px'; s.cv.style.height = H + 'px'; s.key = ''; }
    let base, tr = '';
    if (CAM.on){ /* verden-laget flyttes af kameraet; lærredet flyttes lige så langt den anden vej, så det altid dækker skærmen */
      const tx = CAM.tx || 0, ty = CAM.ty || 0, k = CAM.k; tr = `translate(${-tx}px,${-ty}px)`;
      base = [k * dpr, 0, 0, k * dpr, (tx - CAM_X[0] * k) * dpr, (ty - CAM_Y[0] * k) * dpr]; }
    else { if (s.tr){ s.tr = ''; s.cv.style.transform = ''; }   /* (før der måles: lærredet må ikke stå forskudt fra kameraet) */
      const m = s.svg.getScreenCTM(), r = s.cv.getBoundingClientRect(); if (!m) return; base = [m.a * dpr, 0, 0, m.d * dpr, (m.e - r.left) * dpr, (m.f - r.top) * dpr]; }
    if (tr !== s.tr){ s.tr = tr; s.cv.style.transform = tr; }
    const key = base.map(v => v.toFixed(3)).join(',');
    if (key === s.key) return;
    s.key = key; s.base = base; s.sky = getComputedStyle(s.host).backgroundColor || '#000';
    /* tegn med det samme, så kort og figurer ikke er et billede ude af trit, mens kameraet flytter sig */
    draw(performance.now());
    if (!s.raf) s.raf = requestAnimationFrame(loop);
  }
  const town = () => document.getElementById('town');
  function loop(now){
    const s = S; if (!s) return;
    if (!s.svg.isConnected){ reset(); return; }
    s.raf = requestAnimationFrame(loop);
    const t = town(); if ((t && t.hidden) || document.hidden) return;
    draw(now);
  }
  /* et billede, der ikke bevæger sig og vises i sin egen størrelse, lægges præcis på skærmens pixels (ellers bliver det uskarpt) */
  function blit(ctx, img, sx, sy, sw, sh, x, y, w, h, M){
    if (!M[1] && !M[2] && Math.abs(M[0] * w - sw) < .51 && Math.abs(M[3] * h - sh) < .51){ ctx.setTransform(1, 0, 0, 1, Math.round(M[4] + x * M[0]), Math.round(M[5] + y * M[3])); ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh); }
    else { ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); }
  }
  const tmp = { m: null, o: null };
  function draw(now){
    const s = S; if (!s || !s.base) return;
    const f0 = performance.now(), ctx = s.ctx, B = s.base, t = window.LR_TID ?? (now - s.T0), rec = s.rec;   /* (LR_TID: fast tid, til sammenligning i test) */
    mirrorTick(s);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = s.sky; ctx.fillRect(0, 0, s.W, s.H);
    blit(ctx, s.bg, 0, 0, s.bg.width, s.bg.height, rec.x0, rec.y0, rec.W, rec.H, B);
    for (const it of s.list){
      let M, a;
      if (it.fast){ M = mul(B, it.fast.M); a = it.fast.a; }
      else { M = B; a = 1; let hid = false;
        for (const w of it.chain){
          if (w.mir){ const mr = w.mir; if (mr.hidden){ hid = true; break; } if (mr.M) M = mul(M, mr.M); a *= mr.o; continue; }
          let m = w.m, op = w.o;
          if (w.a && sample(w.a, t, tmp)){ if (tmp.m) m = tmp.m; if (tmp.o != null) op = tmp.o; }
          if (m) M = mul(M, m); if (op != null) a *= op; }
        if (hid) continue; }
      if (a <= 0.003) continue;
      ctx.globalAlpha = a > 1 ? 1 : a;
      if (it.pc){ const pc = it.pc; if (pc.blend) ctx.globalCompositeOperation = pc.blend;
        if (it.still && pc.fix) blit(ctx, s.sheets[pc.sheet], pc.ax, pc.ay, pc.aw, pc.ah, pc.x, pc.y, pc.w, pc.h, M);
        else { ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); ctx.drawImage(s.sheets[pc.sheet], pc.ax, pc.ay, pc.aw, pc.ah, pc.x, pc.y, pc.w, pc.h); }
        if (pc.blend) ctx.globalCompositeOperation = 'source-over'; }
      else { /* en stiplet streg, hvor stiplerne løber (åen, vandfaldet) */
        const d = it.d, u = t / 1000 - (d.begin || 0); let v = d.off0;
        if (u >= 0 && d.vals){ const k = (u % d.dur) / d.dur; let i = 0; while (i < d.offs.length - 1 && k >= d.offs[i + 1]) i++;
          v = d.disc || i >= d.vals.length - 1 ? d.vals[i] : d.vals[i] + (d.vals[i + 1] - d.vals[i]) * (k - d.offs[i]) / ((d.offs[i + 1] - d.offs[i]) || 1); }
        ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
        if (d.fill !== 'none'){ ctx.globalAlpha = a * d.fo; ctx.fillStyle = d.fill; ctx.fill(it.path); }
        if (d.grad && !it.grad){ const G = ctx.createLinearGradient(...d.grad.c); d.grad.stops.forEach(([f, col]) => G.addColorStop(f, col)); it.grad = G; }
        ctx.globalAlpha = a * d.so; ctx.strokeStyle = it.grad || d.stroke; ctx.lineWidth = d.sw; ctx.lineCap = d.cap; ctx.lineJoin = d.join; ctx.miterLimit = d.miter;
        ctx.setLineDash(d.dash.length % 2 ? d.dash.concat(d.dash) : d.dash); ctx.lineDashOffset = v; ctx.stroke(it.path); ctx.setLineDash([]); }
    }
    const dt = performance.now() - f0; s.n++; s.ms += dt; s.tn++; s.tms += dt;
    if (s.n >= 300){ DBG.count('laerredMs', Math.round(s.ms / s.n * 100) / 100); DBG.count('laerredN'); s.n = 0; s.ms = 0; }
  }
  function reset(){
    const s = S; if (!s) return; S = null;
    cancelAnimationFrame(s.raf); s.mirs.forEach(m => m.ob.disconnect()); s.cv.remove();
    try { s.bg.close(); s.sheets.forEach(b => b.close()); } catch (e){}
  }
  /* ---------- måling (fra fejlsøgningen: hold på LOG-mærket i byen) ----------
     Byens dele slås fra én ad gangen, oven i hinanden, og hver udgave måles i 6 sekunder. Så kan vi se, hvad det
     næste skridt (farvelaget, kortets egne bevægelser, SVG'en, figurerne) hver især vil give. Bagefter er alt som før */
  let running = false;
  async function test(sek = 6){
    if (running) return null;
    const svg = document.getElementById('townSvg'), live = document.getElementById('townLive');
    if (!S || !svg || town().hidden){ toast('Åbn byen først'); return null; }
    running = true;
    const undo = [], set = (e, prop, v) => { if (!e) return; const old = e.style[prop]; e.style[prop] = v; undo.push(() => { e.style[prop] = old; }); };
    const FASER = [
      ['byen som nu', () => {}],
      ['uden nattens farvelag', () => svg.querySelectorAll('[style*="multiply"]').forEach(e => set(e, 'display', 'none'))],
      ['uden kortets egne bevægelser', () => { const an = svg.getAnimations({ subtree: true }).filter(a => a.playState === 'running'); an.forEach(a => a.pause()); undo.push(() => an.forEach(a => { try { a.play(); } catch (e){} })); }],
      ['med usynligt kort ovenpå', () => set(svg, 'opacity', '0')],
      ['også uden figurer', () => set(live, 'display', 'none')] ];
    const maal = () => new Promise(res => { const fr = []; let last = 0, t0 = 0;
      const q = t => { if (!t0) t0 = t; else fr.push(t - last); last = t; DBG.count('test'); if (t - t0 < sek * 1000) requestAnimationFrame(q); else res(fr); }; requestAnimationFrame(q); });
    const stat = fr => { const f = fr.slice().sort((a, b) => a - b), n = f.length, sum = fr.reduce((a, b) => a + b, 0), q = p => +f[Math.min(n - 1, Math.floor(p * n))].toFixed(1);
      const fps1 = []; let acc = 0, k = 0; fr.forEach(d => { acc += d; k++; if (acc >= 1000){ fps1.push(Math.round(k * 1000 / acc)); acc = 0; k = 0; } });
      return { fps: +(n * 1000 / sum).toFixed(1), p50: q(.5), p95: q(.95), max: q(1), fps1 }; };
    const lab = el('div', { class: 'lr-lab' }); document.body.append(lab);
    const res = [];
    try { for (let i = 0; i < FASER.length; i++){ lab.textContent = `Måler ${i + 1} af ${FASER.length}: ${FASER[i][0]} …`; FASER[i][1](); await wait(1000);
        const n0 = S ? [S.tn, S.tms] : [0, 0], r = { navn: FASER[i][0], ...stat(await maal()) };
        if (S && S.tn > n0[0]) r.js = +((S.tms - n0[1]) / (S.tn - n0[0])).toFixed(2);
        res.push(r); } }
    catch (e){ res.push({ fejl: String(e && e.message || e) }); }
    undo.splice(0).reverse().forEach(f => f()); lab.remove(); running = false;
    DBG.row('laerredtest', { faser: res, skaerm: `${innerWidth}x${innerHeight}`, dpr: window.devicePixelRatio || 1, kamera: CAM.on, tid: CM.time, ting: S ? S.list.length : 0 }, 'town'); DBG.flush();
    const panel = el('div', { class: 'lr-res' }, [ el('h2', {}, 'Målingen er sendt'),
      ...res.map(r => el('p', {}, r.fejl ? 'Fejl: ' + r.fejl : `${r.navn}: ${Math.round(r.fps)} billeder i sekundet`)),
      el('button', { class: 'btn', type: 'button', on: { click: () => panel.remove() } }, 'Luk') ]);
    document.body.append(panel);
    return res;
  }
  return { mount, sync, reset, test, get running(){ return running; }, get on(){ return !!S; }, get ting(){ return S ? S.list.length : 0; },
    /* (til test) spejle, der lige nu flytter eller skjuler noget */
    get spejle(){ return S ? S.mirs.filter(m => m.M || m.hidden || m.o < 1).map(m => ({ ting: m.A.dataset.tap || m.A.getAttribute('class'), M: m.M && m.M.map(v => +v.toFixed(2)), o: m.o, skjult: m.hidden })) : []; }, get antalSpejle(){ return S ? S.mirs.length : 0; } };
})();
