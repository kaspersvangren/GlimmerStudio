/* hoppet: dyrene på gården stilles på række og fryses i seks trin af et hop: node hopshot.js → hop-ark.png */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('dyrepark')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => { document.getElementById('toast').style.display = 'none'; __spil.room.ctx.test.hop(.05) }); await p.waitForTimeout(12000);
  const us = [0, .08, .14, .24, .34, .44, .5, .56, .62, .8]; for (let i = 0; i < us.length; i++) { await p.evaluate(u => __spil.room.ctx.test.hop(u), us[i]); await p.waitForTimeout(1500); await p.screenshot({ path: `${__dirname}/hop-${i}.png`, clip: { x: 0, y: 440, width: 1280, height: 320 } }) }
  await b.close(); console.log('ok');
})();
