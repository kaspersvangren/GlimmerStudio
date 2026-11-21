const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 432 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.waitForTimeout(800); await p.screenshot({ path: __dirname + '/mob-1.png' });
  const pt = await p.evaluate(() => { const k = __kort, h = k.HOUSE.broend; const v = new k.THREE.Vector3(h.door[0], 3, h.door[1]).project(k.cam), c = document.querySelector('#stage canvas').getBoundingClientRect(); return [c.left + (v.x + 1) / 2 * c.width, c.top + (1 - v.y) / 2 * c.height] });
  await p.mouse.click(pt[0], pt[1]);
  try { await p.waitForFunction(() => !document.getElementById('toast').hidden, null, { timeout: 90000 }); console.log('besked:', await p.evaluate(() => document.getElementById('toast').textContent)); await p.screenshot({ path: __dirname + '/mob-2.png' }) } catch (e) { console.log('ingen besked') }
  await p.evaluate(() => __spil.enter('kollegie')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 }); await p.waitForTimeout(800); await p.screenshot({ path: __dirname + '/mob-3.png' });
  await p.evaluate(() => __spil.leave()); await p.waitForTimeout(150); await p.screenshot({ path: __dirname + '/mob-4.png' });
  await b.close();
})();
