/* lyden: en lille server giver siden og lydmappen, som de ligger på nettet; så trykkes der rundt, og det tjekkes, at musikken skifter og filerne hentes */
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const LYDDIR = '/home/claude/glimmerstudio/lyd', hentet = [];
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = null; if (u.startsWith('/lyd/')) { f = path.join(LYDDIR, path.basename(u)); hentet.push(path.basename(u)) } else if (u.startsWith('/prototyper/pap/')) f = path.join(__dirname, path.basename(u));
    if (!f || !fs.existsSync(f)) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.mp3') ? 'audio/mpeg' : 'text/plain' }); fs.createReadStream(f).pipe(r) });
  await new Promise(ok => srv.listen(0, ok)); const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error' && !/GL Driver|supabase|ERR_/.test(m.text())) console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort()); await p.route(/supabase/, r => r.fulfill({ status: 201, body: '' }));
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto(`http://localhost:${port}/prototyper/pap/testspil.html`);
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const st = () => p.evaluate(() => { const s = LYDTEST(); return `${s.musik}${s.spiller ? ' (spiller)' : ' (venter)'} · stemning ${s.stemning}${s.stemSpiller ? ' (spiller)' : ''} · ${s.tilstand}` });
  const inde = () => p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.mouse.click(640, 700); await p.waitForTimeout(3000);
  await p.evaluate(() => __spil.enter('koncert')); await inde(); await p.waitForTimeout(3000);
  await p.evaluate(() => { const L = window.__lyd; window.__log = []; for (const k of ['klap', 'sang', 'musik', 'radio', 'fil']) { const f = L[k]; L[k] = function (...a) { window.__log.push(((performance.now() / 1000) | 0) + 's ' + k + ' ' + String(JSON.stringify(a[0])).slice(0, 40)); return f.apply(this, a) } } });
  await p.evaluate(() => [...document.querySelectorAll('#songs button')].find(x => /hiphop/i.test(x.textContent)).click());
  for (let k = 0; k < 26; k++) { await p.waitForTimeout(10000); const s = await p.evaluate(() => { const s = LYDTEST(); return (s.musik || '-') + ' ' + JSON.stringify(window.__lyd.musikTid && window.__lyd.musikTid()) }); console.log(k * 10, s) }
  console.log((await p.evaluate(() => window.__log)).join('\n'));
  console.log('hentede filer:', [...new Set(hentet)].join(', ')); await b.close(); srv.close();
})();
