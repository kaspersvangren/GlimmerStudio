/* ================= Lærreds-byen: hele kortet tegnet på ét lærred =================
   Før lå hver bevægelig ting på kortet (ca. 260) som sit eget HTML-lag, og browseren lagde dem sammen i hvert
   billede, med SVG'en og nattens farvelag ovenpå. På tabletten gav det 37 billeder i sekundet. Med stykkerne på ét
   lærred blev det ca. 60, og en måling viste, at resten af vejen op til skærmens 90 lå i selve SVG'en ovenpå
   (farvelaget, dens egne små bevægelser og sammenlægningen af den). Derfor tegnes nu ALT synligt på kortet her:
   det bagte billede, stykkerne fra arket, ting man kan trykke på, tekst og billeder. Nattens farvelag er ganget ind
   i billederne ved bagningen. SVG'en ligger usynlig ovenpå og tager kun imod tryk; et hop eller et skjul på en ting
   i SVG'en spejles over på lærredet. Figurer, talebobler og den gemte stjerne ligger i deres eget lille lag øverst.
   Kan en bagning ikke få alt med (rec.lr mangler), vises SVG'en stadig oven på lærredet som i v0.34.0.
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
    const a0 = parseFloat(A.getAttribute('opacity') ?? A.style.opacity ?? ''), o0 = a0 > 0 && a0 <= 1 ? a0 : 1;   /* (grundværdien står allerede i lagenes træ) */
    mr = { A, local, hidden: cs.display === 'none', M: null, o: Math.max(0, Math.min(1, (+cs.opacity) / o0)), live: A.getAnimations().length > 0, dirty: false, o0, E0: null, P: null };
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
  /* farve ganget med nattens farvelag */
  const kcol = (c, k) => { if (!k || !c) return c; const m = String(c).match(/[\d.]+/g); if (!m || m.length < 3 || !/^rgb/.test(c)) return c;
    return `rgba(${Math.round(m[0] * k[0])},${Math.round(m[1] * k[1])},${Math.round(m[2] * k[2])},${m[3] ?? 1})`; };
  /* et billede på kortet (fx dukken i vinduet): hentes fra SVG-elementets adresse og følger med, hvis den skifter */
  function billede(s, A, spec, k){
    const o = { A, x: spec.x, y: spec.y, w: spec.w, h: spec.h, src: null, img: null, cvs: null, S: 0, k };
    const load = () => { const href = A.getAttribute('href') || A.getAttribute('xlink:href') || ''; if (href === o.src) return; o.src = href; o.img = o.cvs = null; if (!href) return;
      const im = new Image(); im.onload = () => { if (o.src === href){ o.img = im; o.cvs = null; } }; im.src = href; };
    const ob = new MutationObserver(load); ob.observe(A, { attributes: true, attributeFilter: ['href', 'xlink:href'] }); s.obs.push(ob); load(); return o;
  }
  /* billedet tegnes én gang i skærmens opløsning (og farves, hvis det ligger under nattens farvelag) */
  function billedLaerred(o, S){
    const im = o.img, iw = im.naturalWidth || o.w, ih = im.naturalHeight || o.h, f = Math.min(o.w / iw, o.h / ih), dw = iw * f, dh = ih * f;
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(o.w * S)); c.height = Math.max(1, Math.ceil(o.h * S));
    const x = c.getContext('2d', { willReadFrequently: !!o.k }); x.drawImage(im, (o.w - dw) / 2 * S, (o.h - dh) / 2 * S, dw * S, dh * S);
    if (o.k){ const id = x.getImageData(0, 0, c.width, c.height), d = id.data, k = o.k; for (let i = 0; i < d.length; i += 4){ d[i] *= k[0]; d[i + 1] *= k[1]; d[i + 2] *= k[2]; } x.putImageData(id, 0, 0); }
    o.cvs = c; o.S = S;
  }
  /* lagenes træ flades ud til en liste af tegneopgaver; hver har sin kæde af flytninger (yderst først).
     Alt før mærket for nattens farvelag (sk) er farvet; stykkerne er farvet i arket, tekst og streger farves her */
  function flatten(s, g, st){
    const out = []; let k = s.k;
    const mirs = (spec, local) => (spec.mir || []).map(i => st[i]).filter(Boolean).map(A => ({ mir: mirror(s, A, local) }));
    const walk = (spec, chain, top) => {
      if (spec.sk){ k = null; return; }
      const c1 = spec.mir ? chain.concat(mirs(spec, !top)) : chain;
      if (spec.p != null){ const pc = g.pieces[spec.p]; if (pc) out.push({ pc, chain: c1, still: !c1.length }); return; }
      if (spec.d){ const d = k ? Object.assign({}, spec.d, { stroke: kcol(spec.d.stroke, k), fill: spec.d.fill === 'none' ? 'none' : kcol(spec.d.fill, k), grad: spec.d.grad ? { c: spec.d.grad.c, stops: spec.d.grad.stops.map(([f, c]) => [f, kcol(c, k)]) } : null }) : spec.d;
        out.push({ d, chain: c1, path: new Path2D(d.path), grad: null }); return; }
      if (spec.t){ const t = spec.t; out.push({ t: Object.assign({}, t, { stroke: kcol(t.stroke, k), parts: t.parts.map(p => Object.assign({}, p, { fill: kcol(p.fill, k) })), fv: -1 }), chain: c1 }); return; }
      if (spec.im){ const A = st[spec.im.i]; if (A) out.push({ im: billede(s, A, spec.im, k), chain: c1 }); return; }
      const c2 = c1.concat(spec.w.map(w => ({ m: w.m ? w.m.slice() : null, o: w.o ?? null, a: w.a ? compile(w.a) : null })));
      for (const kid of spec.c) walk(kid, c2, false);
    };
    for (const it of g.items) walk(it, [], true);
    /* en kæde uden animation og uden spejl regnes sammen én gang */
    for (const it of out){ if (it.chain.some(w => w.a || w.mir)) continue;
      let M = [1,0,0,1,0,0], a = 1; for (const w of it.chain){ if (w.m) M = mul(M, w.m); if (w.o != null) a *= w.o; } it.fast = { M, a }; }
    return out;
  }
  /* tekst: bredden måles én gang (og igen, når en skrifttype er hentet), så teksten kan stilles efter sit ankerpunkt */
  let FONTV = 0;
  try { document.fonts.addEventListener('loadingdone', () => { FONTV++; }); } catch (e){}
  function tekst(ctx, T, a){
    const ls = T.ls ? T.ls + 'px' : '0px'; if ('letterSpacing' in ctx) ctx.letterSpacing = ls;
    if (T.fv !== FONTV){ T.fv = FONTV; T.wd = T.parts.map(p => { ctx.font = p.f; return ctx.measureText(p.s).width; }); T.tot = T.wd.reduce((x, y) => x + y, 0) + T.parts.reduce((x, p) => x + p.dx, 0); }
    let x = T.x - (T.anchor === 'middle' ? T.tot / 2 : T.anchor === 'end' ? T.tot : 0), y = T.y;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    if (T.stroke){ ctx.strokeStyle = T.stroke; ctx.lineWidth = T.sw; ctx.lineJoin = 'round'; }
    for (let i = 0; i < T.parts.length; i++){ const p = T.parts[i]; x += p.dx; y += p.dy; ctx.font = p.f;
      if (T.stroke && T.under){ ctx.globalAlpha = a; ctx.strokeText(p.s, x, y); }
      ctx.globalAlpha = a * T.fo; ctx.fillStyle = p.fill; ctx.fillText(p.s, x, y);
      if (T.stroke && !T.under){ ctx.globalAlpha = a; ctx.strokeText(p.s, x, y); }
      x += T.wd[i]; }
    if (T.ls && 'letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  async function mount(svg, gen, rec, st){
    const g = rec.gpu, host = svg.parentElement;
    const [bg, ...sheets] = await Promise.all([createImageBitmap(rec.png), ...g.sheets.map(b => createImageBitmap(b))]);
    if (gen !== BAKE.gen || !svg.isConnected){ [bg, ...sheets].forEach(b => b.close()); return null; }
    reset();
    const cv = document.createElement('canvas'); cv.className = 'gpu-cv'; cv.setAttribute('aria-hidden', 'true');
    const s = { svg, host, cv, ctx: cv.getContext('2d', { alpha: false }), bg, sheets, rec, k: rec.lr && rec.shade ? rec.shade : null, obs: [], mirs: [], mirOf: new Map(), T0: performance.now(), raf: 0, base: null, W: 0, H: 0, key: '', n: 0, ms: 0, tn: 0, tms: 0 };
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
      else if (it.t){ ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); tekst(ctx, it.t, a > 1 ? 1 : a); }
      else if (it.im){ const o = it.im; if (!o.img) continue; const S = Math.min(4, Math.hypot(M[0], M[1])); if (!o.cvs || Math.abs(o.S - S) > .01) billedLaerred(o, S);
        ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); ctx.drawImage(o.cvs, o.x, o.y, o.w, o.h); }
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
    cancelAnimationFrame(s.raf); s.mirs.forEach(m => m.ob.disconnect()); s.obs.forEach(o => o.disconnect()); s.cv.remove();
    try { s.bg.close(); s.sheets.forEach(b => b.close()); } catch (e){}
  }
  return { mount, sync, reset, get on(){ return !!S; }, get ting(){ return S ? S.list.length : 0; },
    /* (til test) spejle, der lige nu flytter eller skjuler noget */
    get spejle(){ return S ? S.mirs.filter(m => m.M || m.hidden || m.o < 1).map(m => ({ ting: m.A.dataset.tap || m.A.getAttribute('class'), M: m.M && m.M.map(v => +v.toFixed(2)), o: m.o, skjult: m.hidden })) : []; }, get antalSpejle(){ return S ? S.mirs.length : 0; }, get ms(){ return S && S.tn ? +(S.tms / S.tn).toFixed(2) : 0; } };
})();
