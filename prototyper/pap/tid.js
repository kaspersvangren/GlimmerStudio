const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 432 }, deviceScaleFactor: 1 });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/' + (process.argv[2] || 'testkort.html'));
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 300000 });
  console.log(JSON.stringify(await p.evaluate(() => ({ steps: window.__steps, paint: Math.round(__kort.paintMs), sum: (window.__steps || []).reduce((a, b) => a + b, 0) }))));
  await b.close();
})();
