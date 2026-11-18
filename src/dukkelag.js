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
  function show(img, svg, still){
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
      const vb = sv.viewBox.baseVal, s = Math.min(W / vb.width, H / vb.height);   /* som billedet: hele figuren, midt i */
      box.style.transform = `translate(${((W - vb.width * s) / 2 - vb.x * s).toFixed(2)}px,${((H - vb.height * s) / 2 - vb.y * s).toFixed(2)}px) scale(${s.toFixed(5)})`;
      return true; };
    img.src = svgUrl(still);
    if (!fit()){ host.remove(); img.src = svgUrl(svg); return false; }
    let t = null;
    try { t = LOEFT.tree(sv); } catch (e){ t = null; }
    if (!t){ host.remove(); img.src = svgUrl(svg); return false; }
    box.append(t.el);
    for (const [d, a] of t.run){ try { d.animate(a.kf, Object.assign({ fill: 'none' }, a.timing)); } catch (e){} }
    img.style.visibility = 'hidden';
    const ro = new ResizeObserver(() => fit()); ro.observe(img);
    live.set(img, { host, ro });
    DBG.count('dukkelagMs', Math.round(performance.now() - T0));
    return true;
  }
  return { show, clear, on };
})();
