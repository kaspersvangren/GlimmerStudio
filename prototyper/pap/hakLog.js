/* viser hvilke rækker spillet ville sende til loggen: siden hentes fra en lokal server, og det, der skulle til Supabase, fanges */
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs');
(async () => {
  const srv = http.createServer((q, r) => { const u = q.url.split('?')[0]; if (u === '/udgave.txt') { r.end('pap-0.01'); return } r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(fs.readFileSync(__dirname + '/spillet.html')) }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] }), p = await b.newPage({ viewport: { width: 960, height: 432 } }), rows = [];
  await p.route(/supabase\.co/, r => { try { rows.push(...JSON.parse(r.request().postData())) } catch (e) { } r.fulfill({ status: 201, body: '' }) }); await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto(`http://127.0.0.1:${srv.address().port}/spillet.html`); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  await p.mouse.click(600, 300); await p.waitForTimeout(1500); await p.setViewportSize({ width: 900, height: 420 }); await p.waitForTimeout(6000); await p.evaluate(() => LOGTEST()); await p.waitForTimeout(800);
  const antal = {}; for (const r of rows) antal[r.kind] = (antal[r.kind] || 0) + 1; console.log(JSON.stringify(antal)); for (const r of rows.filter(r => r.kind === 'bag' || r.kind === 'hak').slice(0, 8)) console.log(r.kind, JSON.stringify(r.data));
  await b.close(); srv.close();
})();
