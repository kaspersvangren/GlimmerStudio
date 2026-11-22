/* ny udgave-knappen: siden hentes fra en lokal server, hvor udgave.txt siger, at der findes en nyere */
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs');
(async () => {
  let ny = 'pap-9.99'; const srv = http.createServer((q, r) => { const u = q.url.split('?')[0]; if (u === '/udgave.txt') { r.end(ny); return } try { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(fs.readFileSync(__dirname + '/spillet.html')) } catch (e) { r.statusCode = 404; r.end() } }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port, b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/supabase\.co/, r => r.abort()); await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto(`http://127.0.0.1:${port}/spillet.html`); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  console.log('nyere findes → knap synlig:', await p.evaluate(() => !document.getElementById('nyudg').hidden), '· blyant synlig:', await p.evaluate(() => !document.getElementById('noteknap').hidden)); await p.screenshot({ path: __dirname + '/udg.png', clip: { x: 0, y: 0, width: 700, height: 140 } });
  await p.click('#nyudg'); await p.waitForTimeout(1500); console.log('efter tryk:', p.url().replace(/^.*\//, ''));
  ny = 'pap-0.01'; await p.goto(`http://127.0.0.1:${port}/spillet.html`); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 }); console.log('ældre findes → knap skjult:', await p.evaluate(() => document.getElementById('nyudg').hidden));
  await b.close(); srv.close();
})();
