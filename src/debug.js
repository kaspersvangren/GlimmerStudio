/* Fejlsøgning: tryk 5 gange på versionsnummeret på forsiden for at slå loggen til eller fra.
   Når den er slået til, måles billeder pr. sekund, lange hak og fejl på hver skærm, og hvert 30. sekund
   sendes en kort opsummering til tabellen spil_log, hvor Claude kan læse den. Intet sendes, når den er slået fra. */
const DBG = (() => {
  const URL = 'https://kargzxpaaganyfnpyvmb.supabase.co/rest/v1/spil_log';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthcmd6eHBhYWdhbnlmbnB5dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTY2NTEsImV4cCI6MjEwMDg5MjY1MX0.V3bb0XVkHvuQEqDqhn1nRprIa2ooA4Se6AYR5J32r54';
  const STORE = 'glimmerstudiet.debug';
  let on = false, session = '', queue = [], frames = [], last = 0, raf = 0, longN = 0, longMs = 0, counts = {}, screen = '', sampleT = 0, flushT = 0, badge = null, obs = null, taps = [];
  const curScreen = () => { for (const s of SCREENS){ const e = document.querySelector(s); if (e && !e.hidden) return s.slice(1); } return '?'; };
  function row(kind, data){ if (!on) return; queue.push({ session, version: VERSION, kind, screen: curScreen(), data }); if (queue.length > 200) queue.splice(0, queue.length - 200); }
  function count(k, n = 1){ if (on) counts[k] = (counts[k] || 0) + n; }
  function sample(){
    const f = frames.slice().sort((a, b) => a - b), n = f.length;
    if (n){
      const sum = frames.reduce((a, b) => a + b, 0), q = p => +f[Math.min(n - 1, Math.floor(p * n))].toFixed(1);
      const scr = document.querySelector('#' + screen);
      row('maaling', { sek: +(sum / 1000).toFixed(1), fps: +(n * 1000 / sum).toFixed(1), p50: q(.5), p95: q(.95), max: q(1), hak50: frames.filter(x => x > 50).length, hak100: frames.filter(x => x > 100).length,
        lange: longN, langeMs: Math.round(longMs), elementer: scr ? scr.getElementsByTagName('*').length : 0, animationer: scr ? scr.querySelectorAll('animate,animateTransform,animateMotion').length : 0,
        heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null, ...counts });
    }
    frames = []; longN = 0; longMs = 0; counts = {};
  }
  function loop(t){
    if (!on) return;
    if (last) frames.push(t - last); last = t;
    const s = curScreen();
    if (s !== screen){ if (screen) sample(); row('skaerm', { fra: screen, til: s }); screen = s; sampleT = t; }
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
    badge = document.createElement('div'); badge.className = 'dbg-badge'; badge.textContent = 'LOG'; document.body.append(badge);
    last = 0; frames = []; screen = ''; flushT = performance.now(); raf = requestAnimationFrame(loop);
  }
  function stop(){ if (!on) return; sample(); row('stop', {}); flush(true); on = false; cancelAnimationFrame(raf); if (obs) obs.disconnect(); if (badge) badge.remove(); badge = null; }
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
