/* Fejlsøgning: tryk 5 gange på versionsnummeret på forsiden for at slå loggen til eller fra.
   Når den er slået til, måles billeder pr. sekund, lange hak og fejl på hver skærm, og hvert 30. sekund
   sendes en kort opsummering til tabellen spil_log, hvor Claude kan læse den. Intet sendes, når den er slået fra.
   Hver måling dækker 5 sekunder og har også tallet for hvert enkelt sekund (fps1), de længste billeder (vaerste)
   og, for billeder over 50 ms, hvad tiden gik med (laf: kode, tegning, og den funktion der brugte mest). */
const DBG = (() => {
  const URL = 'https://kargzxpaaganyfnpyvmb.supabase.co/rest/v1/spil_log';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthcmd6eHBhYWdhbnlmbnB5dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTY2NTEsImV4cCI6MjEwMDg5MjY1MX0.V3bb0XVkHvuQEqDqhn1nRprIa2ooA4Se6AYR5J32r54';
  const STORE = 'glimmerstudiet.debug';
  let on = false, session = '', queue = [], frames = [], last = 0, raf = 0, longN = 0, longMs = 0, counts = {}, screen = '', sampleT = 0, flushT = 0, badge = null, obs = null, laf = null, L = null, taps = [];
  const lafNul = () => { L = { n: 0, ms: 0, blok: 0, kode: 0, tegn: 0, stil: 0, top: {} }; }; lafNul();
  const curScreen = () => { for (const s of SCREENS){ const e = document.querySelector(s); if (e && !e.hidden) return s.slice(1); } return '?'; };
  function row(kind, data, scr){ if (!on) return; queue.push({ session, version: VERSION, kind, screen: scr || curScreen(), data }); if (queue.length > 200) queue.splice(0, queue.length - 200); }
  function count(k, n = 1){ if (on) counts[k] = (counts[k] || 0) + n; }
  function sample(){
    const f = frames.slice().sort((a, b) => a - b), n = f.length;
    if (n){
      const sum = frames.reduce((a, b) => a + b, 0), q = p => +f[Math.min(n - 1, Math.floor(p * n))].toFixed(1);
      const scr = document.querySelector('#' + screen);
      const fps1 = []; let acc = 0, k = 0; frames.forEach(d => { acc += d; k++; if (acc >= 1000){ fps1.push(Math.round(k * 1000 / acc)); acc = 0; k = 0; } });
      let lf; if (L.n){ const top = Object.entries(L.top).sort((a, b) => b[1] - a[1])[0];
        lf = { n: L.n, ms: Math.round(L.ms), blok: Math.round(L.blok), kode: Math.round(L.kode), tegn: Math.round(L.tegn), stil: Math.round(L.stil), top: top ? top[0] + ' ' + Math.round(top[1]) : null }; }
      row('maaling', { sek: +(sum / 1000).toFixed(1), fps: +(n * 1000 / sum).toFixed(1), p50: q(.5), p95: q(.95), max: q(1), hak50: frames.filter(x => x > 50).length, hak100: frames.filter(x => x > 100).length, fps1, vaerste: f.slice(-5).reverse().map(Math.round), laf: lf,
        lange: longN, langeMs: Math.round(longMs), elementer: scr ? scr.getElementsByTagName('*').length : 0, animationer: scr ? scr.querySelectorAll('animate,animateTransform,animateMotion').length : 0,
        heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null, bagt: !!document.querySelector('#townSvg.baked'), gpu: typeof GPU !== 'undefined' && GPU.on, ...counts }, screen);
    }
    frames = []; longN = 0; longMs = 0; counts = {}; lafNul();
  }
  function loop(t){
    if (!on) return;
    if (last) frames.push(t - last); last = t;
    const s = curScreen();
    if (s !== screen){ if (screen) sample(); row('skaerm', { fra: screen, til: s }); screen = s; sampleT = t; if (badge) badge.classList.toggle('tryk', s === 'town'); }
    if (t - sampleT > 5000){ sample(); sampleT = t; }
    if (t - flushT > 30000){ flush(); flushT = t; }
    if (badge && frames.length && frames.length % 15 === 0){ const k = frames.slice(-30), avg = k.reduce((a, b) => a + b, 0) / k.length; badge.textContent = `LOG ${Math.round(1000 / avg)} fps`; }
    raf = requestAnimationFrame(loop);
  }
  function flush(keep){
    if (!queue.length) return;
    const body = JSON.stringify(queue); queue = [];
    try { fetch(URL, { method: 'POST', keepalive: !!keep && body.length < 60000, headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body }).catch(() => {}); } catch (e){}
  }
  function start(){
    if (on) return; on = true; session = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    row('start', { ua: navigator.userAgent, skaerm: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, kerner: navigator.hardwareConcurrency || null, hukommelseGB: navigator.deviceMemory || null,
      app: matchMedia('(display-mode: standalone)').matches, net: navigator.connection ? navigator.connection.effectiveType : null });
    try { obs = new PerformanceObserver(l => l.getEntries().forEach(e => { longN++; longMs += e.duration; })); obs.observe({ type: 'longtask', buffered: false }); } catch (e){ obs = null; }
    /* billeder over 50 ms: hvor meget var kode, hvor meget var tegning (stil og opsætning), og hvilken funktion fyldte mest */
    try { laf = new PerformanceObserver(l => l.getEntries().forEach(e => { const end = e.startTime + e.duration; L.n++; L.ms += e.duration; L.blok += e.blockingDuration || 0;
        if (e.renderStart) L.tegn += end - e.renderStart; if (e.styleAndLayoutStart) L.stil += end - e.styleAndLayoutStart;
        (e.scripts || []).forEach(sc => { L.kode += sc.duration; const k = String(sc.sourceFunctionName || sc.invoker || '?').slice(0, 40); L.top[k] = (L.top[k] || 0) + sc.duration; }); }));
      laf.observe({ type: 'long-animation-frame', buffered: false }); } catch (e){ laf = null; }
    badge = document.createElement('div'); badge.className = 'dbg-badge'; badge.textContent = 'LOG'; document.body.append(badge);
    /* i byen: hold på mærket for at måle, hvad hver del af byen koster (laerred.js) */
    /* (et langt tryk, så man ikke rammer det ved et uheld, når man vil ind i Koncertsalen lige ved siden af) */
    let hold = 0; const slip = () => { clearTimeout(hold); hold = 0; };
    badge.addEventListener('pointerdown', () => { slip(); hold = setTimeout(() => { hold = 0; if (screen !== 'town' || LAERRED.running) return;
      showModal('Mål byen?', 'Jeg slår byens dele fra én ad gangen og måler. Det tager under et minut, og bagefter er alt som før.', [ { label: 'Nej' }, { label: 'Ja, mål', hot: true, fn: () => LAERRED.test() } ]); }, 800); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => badge.addEventListener(ev, slip)); badge.addEventListener('contextmenu', e => e.preventDefault());
    last = 0; frames = []; screen = ''; flushT = performance.now(); raf = requestAnimationFrame(loop);
  }
  function stop(){ if (!on) return; sample(); row('stop', {}); flush(true); on = false; cancelAnimationFrame(raf); if (obs) obs.disconnect(); if (laf) laf.disconnect(); if (badge) badge.remove(); badge = null; }
  function tap(){
    const now = Date.now(); taps = taps.filter(t => now - t < 2500); taps.push(now);
    if (taps.length < 5) return; taps = [];
    const v = !on; try { localStorage.setItem(STORE, v ? '1' : ''); } catch (e){}
    v ? start() : stop(); sfx.magic();
  }
  window.addEventListener('error', e => row('fejl', { besked: String(e.message).slice(0, 300), fil: String(e.filename || '').split('/').pop(), linje: e.lineno, kol: e.colno }));
  window.addEventListener('unhandledrejection', e => row('fejl', { besked: String(e.reason && (e.reason.stack || e.reason.message) || e.reason).slice(0, 400) }));
  document.addEventListener('visibilitychange', () => { if (!on) return; if (document.hidden){ sample(); row('skjult', {}); flush(true); } else { row('synlig', {}); last = 0; } });
  try { if (localStorage.getItem(STORE) === '1') setTimeout(start, 500); } catch (e){}
  return { tap, count, row, get on(){ return on; }, flush };
})();
