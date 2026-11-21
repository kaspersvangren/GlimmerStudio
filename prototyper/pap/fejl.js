const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 432 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  p.on('console', m => { if (m.type() === 'error') console.log('konsol', m.text().slice(0, 400)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/' + (process.argv[2] || 'testkort.html'));
  try { await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: +(process.argv[3] || 60000) }); console.log('klar', JSON.stringify(await p.evaluate(() => (window.__kort ? { paint: Math.round(__kort.paintMs) } : { side: document.title })))) } catch (e) { console.log('ikke klar:', await p.evaluate(() => document.getElementById('msgN').textContent)) }
  await b.close();
})();
