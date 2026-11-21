const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 432 } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  console.log(JSON.stringify(await p.evaluate(() => { const N = __kort.NET.N.length; const t = performance.now(); for (let k = 0; k < 20; k++) __kort.NET.route(-10, 12, 60 - k * 6, 30 - k * 2); const rute = +((performance.now() - t) / 20).toFixed(2);
    const t2 = performance.now(); for (let k = 0; k < 20; k++) __kort.goTo(60 - k * 6, 30 - k * 2); return { knuder: N, rute_ms: rute, goTo_ms: +((performance.now() - t2) / 20).toFixed(2), walkers: __kort.walkers ? __kort.walkers.length : null } })));
  await b.close();
})();
