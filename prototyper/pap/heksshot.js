const { chromium } = require('playwright');
(async () => {
  const [, , dpr = '1', out = 'heks.png', W = '1280', H = '800'] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +dpr });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/' + (process.env.PAGE || 'testheks.html'));
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone') || /Fejl/.test(document.getElementById('msgN').textContent), null, { timeout: 300000 });
  console.log(await p.evaluate(() => document.getElementById('msgN').textContent));
  await p.waitForTimeout(1200); await p.screenshot({ path: __dirname + '/' + out, timeout: 240000 });
  if (process.env.FACES) { for (const v of [1, 2, 3]) { await p.evaluate(v => __heks.view(v), v); await p.waitForTimeout(1500); await p.screenshot({ path: __dirname + '/f' + v + '-' + out, timeout: 240000 }) } } await b.close();
})();
