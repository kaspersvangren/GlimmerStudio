const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/' + (process.argv[2] || 'testspil.html'));
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const t = await p.evaluate(() => __tid); console.log(JSON.stringify({ hentet: Math.round(t.hentet), skrifter: Math.round(t.skrifter), malet: Math.round(t.malet), bagt: Math.round(t.bagt) }), 'trin', JSON.stringify(t.trin));
  if (process.argv[3]) { await p.evaluate(h => __spil.enter(h), process.argv[3]); await p.waitForFunction(() => __spil.roomMs && document.getElementById('door').classList.contains('gone') && __spil.room, null, { timeout: 120000 }); console.log('rum', await p.evaluate(() => [__spil.roomMs, JSON.stringify(window.__rumtid || '')])) }
  await b.close();
})();
