/* ================= Figuren som lag =================
   Figuren er ét billede (en SVG med sine egne små bevægelser). Så længe en eneste ting i billedet bevæger sig, maler
   browseren HELE billedet forfra i hvert billede: i figurskaberen ca. 0,8 mio. punkter, ca. 60 gange i sekundet. Det var
   det, der holdt figurskaberen (ca. 20 billeder i sekundet) og forsiden (ca. 25) nede på tabletten.
   Her bygges figuren i stedet som lag (loeft.js): de faste dele males én gang, og det, der bevæger sig (øjne, hoved, arme,
   glimt), er små lag med præcis samme bevægelse, som grafikchippen flytter. Billedet bliver liggende usynligt under lagene
   (til størrelse og som reserve). Kan figuren ikke bygges som lag, vises billedet som før. */
const DUKKELAG = (() => {
  let seq = 0;
  const live = new WeakMap();      /* img -> { host, ro } */
  const KEY = 'glimmerstudiet.dukkelag';
  const on = () => { try { return localStorage.getItem(KEY) !== '0' && !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){ return true; } };
  /* id'er gøres unikke, så to figurer på samme side ikke låner hinandens farveforløb */
  const uniq = (s, p) => s.replace(/\bid="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`).replace(/(xlink:)?href="#([^"]+)"/g, (m, x, id) => `${x || ''}href="#${p}${id}"`);
  function clear(img){ const L = live.get(img); if (!L) return; L.ro.disconnect(); L.host.remove(); img.style.visibility = ''; live.delete(img); }
  /* svg: figurens SVG-tekst med animationer; still: samme figur uden (vises i billedet under lagene) */
  const STILL = s => s.replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*\/>/g, '').replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*>[\s\S]*?<\/\1>/g, '');
  function show(img, svg, still = STILL(svg)){
    clear(img);
    if (!on() || !img.isConnected || !svg.includes('<animate')){ img.src = svgUrl(svg); return false; }
    const T0 = performance.now();
    const host = document.createElement('div'); host.className = 'dl-host'; host.setAttribute('aria-hidden', 'true');
    img.after(host);
    const box = document.createElement('div'); box.className = 'dl-box'; host.append(box);
    const pre = 'dl' + (++seq) + '_';
    const src = new DOMParser().parseFromString(uniq(svg, pre), 'image/svg+xml').documentElement;
    if (!src || src.tagName !== 'svg'){ host.remove(); img.src = svgUrl(svg); return false; }
    const sv = document.importNode(src, true); sv.classList.add('dl-src');
    host.append(sv);
    const fit = () => { const W = img.clientWidth, H = img.clientHeight; if (!W || !H) return false;
      host.style.left = img.offsetLeft + 'px'; host.style.top = img.offsetTop + 'px'; host.style.width = W + 'px'; host.style.height = H + 'px';
      sv.setAttribute('width', W); sv.setAttribute('height', H);
      const cs = getComputedStyle(img); host.style.borderRadius = cs.borderRadius; host.style.zIndex = cs.zIndex;   /* samme plads i rækkefølgen som billedet (pærerne om spejlet ligger ovenpå) */   /* spejlets ovale kant klipper som billedet */
      /* som billedet: 'contain' viser hele figuren, 'cover' fylder rammen ud; begge midt i */
      const vb = sv.viewBox.baseVal, s = (cs.objectFit === 'cover' ? Math.max : Math.min)(W / vb.width, H / vb.height);
      box.style.transform = `translate(${((W - vb.width * s) / 2 - vb.x * s).toFixed(2)}px,${((H - vb.height * s) / 2 - vb.y * s).toFixed(2)}px) scale(${s.toFixed(5)})`;
      return true; };
    img.src = svgUrl(still);
    if (!fit()){ host.remove(); img.src = svgUrl(svg); return false; }
    let t = null;
    try { t = LOEFT.tree(sv); } catch (e){ t = null; }
    if (!t){ host.remove(); img.src = svgUrl(svg); return false; }
    box.append(t.el);
    /* ting helt uden for rammen (fx stjerner i baggrundens yderkant) fjernes: de ses ikke, og browseren vil ikke lade
       grafikchippen køre en animation, der ikke ses, så den ville i stedet regne på den i hvert billede */
    const R = host.getBoundingClientRect(), moving = new Set(t.run.filter(([, a]) => a.tr).map(([d]) => d)), hc = getComputedStyle(host);
    /* rammens runde hjørner (spejlet er ovalt foroven): [vandret, lodret] radius for hvert hjørne */
    const rad = c => { const v = hc.getPropertyValue(`border-${c}-radius`).split(' '), f = (x, L) => /%$/.test(x) ? parseFloat(x) / 100 * L : parseFloat(x) || 0;
      return [f(v[0], R.width), f(v[1] ?? v[0], R.height)]; };
    const C = { tl: rad('top-left'), tr: rad('top-right'), bl: rad('bottom-left'), br: rad('bottom-right') };
    const inside = (x, y, m) => { x -= R.left; y -= R.top; const W = R.width, H = R.height;
      if (x < -m || y < -m || x > W + m || y > H + m) return false; if (m) return true;
      const k = (cx, cy, [rx, ry]) => !rx || !ry || ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
      if (x < C.tl[0] && y < C.tl[1]) return k(C.tl[0], C.tl[1], C.tl); if (x > W - C.tr[0] && y < C.tr[1]) return k(W - C.tr[0], C.tr[1], C.tr);
      if (x < C.bl[0] && y > H - C.bl[1]) return k(C.bl[0], H - C.bl[1], C.bl); if (x > W - C.br[0] && y > H - C.br[1]) return k(W - C.br[0], H - C.br[1], C.br);
      return true; };
    /* hvor meget af tingen ligger inden for rammen? 0 = intet, 1 = det hele (prøvepunkter over formen) */
    const seen = d => { let m = 0; for (let q = d; q && q !== box; q = q.parentElement) if (moving.has(q)) m = Math.max(R.width, R.height) * 0.15;   /* noget, der bevæger sig, kan komme ind i rammen */
      let n = 0, k = 0;
      for (const s of d.querySelectorAll('svg')) for (const e of s.children){ const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
        for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++){ n++; if (inside(r.left + r.width * i / 4, r.top + r.height * j / 4, m)) k++; } }
      return n ? k / n : 1; };
    for (const [d, a] of t.run){ if (!d.isConnected) continue;
      const v = seen(d);
      if (v === 0){ d.remove(); continue; }
      /* et blink, der kun delvis ses (i et rundt hjørne): browseren kan finde på at regne det på hovedtråden. Det står stille */
      if (v < 1 && !a.tr && !moving.has(d)) continue;
      try { d.animate(a.kf, Object.assign({ fill: 'none' }, a.timing)); } catch (e){} }
    img.style.visibility = 'hidden';
    const ro = new ResizeObserver(() => { if (!img.isConnected) clear(img); else fit(); });   /* (billedet er fjernet: slip lagene) */ ro.observe(img);
    live.set(img, { host, ro });
    DBG.count('dukkelagMs', Math.round(performance.now() - T0));
    return true;
  }
  /* vis billedet med det samme (som før), og byg lagene lidt efter, når der er ro: i figurskaberen kommer ændringerne
     tæt (en farveskyder sender mange i sekundet), og så skal hver ændring ikke bygge en hel figur */
  const pend = new WeakMap();
  function stop(img){ const P = pend.get(img); if (!P) return; clearTimeout(P.id); if (P.r && window.cancelIdleCallback) cancelIdleCallback(P.r); pend.delete(img); }
  function later(img, svg, wait = 400, setSrc = true){
    stop(img); clear(img);
    if (setSrc) img.src = svgUrl(svg);
    if (!on() || !svg.includes('<animate')) return;
    let tries = 0;
    const go = () => { pend.delete(img); if (!img.isConnected) return;
      if (!img.clientWidth || !img.clientHeight || !img.complete){ if (++tries < 30) arm(400); return; }   /* skærmen er ikke vist endnu */
      show(img, svg); };
    const arm = ms => { const P = { id: 0, r: 0 }; pend.set(img, P);
      P.id = setTimeout(() => { if (window.requestIdleCallback) P.r = requestIdleCallback(go, { timeout: 800 }); else go(); }, ms); };
    arm(wait);
  }
  return { show, later, clear, on };
})();
