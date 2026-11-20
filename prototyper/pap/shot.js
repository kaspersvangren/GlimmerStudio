const { chromium } = require('playwright');
(async () => {
  const [, , ud, vw = '1280', vh = '800', act = ''] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +vw, height: +vh }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text().slice(0, 300)); });
  await p.route(/fonts\./, r => r.abort()); await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + '/../npm3/node_modules/three/build/three.module.min.js', contentType: 'application/javascript' }));
  const t0 = Date.now();
  await p.goto('file://' + __dirname + '/test.html');
  p.on('requestfailed', r => console.log('fejlet', r.url().slice(0,90), r.failure() && r.failure().errorText)); for (let i = 0; i < 80; i++){ if (await p.evaluate(() => document.getElementById('msg').classList.contains('gone'))) break; if (i % 10 === 0) console.log('status', await p.evaluate(() => document.getElementById('msgN').textContent)); await p.waitForTimeout(3000); }
  console.log('klar efter', Date.now() - t0, 'ms');
  await p.waitForTimeout(1500);
  if (act){ await p.evaluate(a => { eval(a); }, act); await p.waitForTimeout(500); await p.waitForFunction(() => __pap.busy() === 0, null, { timeout: 120000 }); await p.waitForTimeout(800); }
  await p.screenshot({ path: ud });
  await b.close();
})();
