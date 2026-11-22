const { chromium } = require('playwright');
(async () => {
  const [, , stil = 'hygge', ud = 'kon'] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 4 }); p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('koncert')); await p.waitForFunction(() => __spil.room && window.__koncert && __koncert.ready && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(s => __koncert.setStyle(s, true), stil); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${__dirname}/${ud}-${stil}.png`, clip: { x: 380, y: 250, width: 520, height: 320 } }); for (const [n, x] of [['a', 440], ['b', 600]]) await p.screenshot({ path: `${__dirname}/${ud}-${stil}-${n}.png`, clip: { x, y: 380, width: 260, height: 160 } }); await b.close();
})();
