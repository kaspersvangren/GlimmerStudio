const { chromium } = require('playwright');
(async () => {
  const [, , dpr = '2', which = ''] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: +dpr });
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testkort.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone') || /Fejl/.test(document.getElementById('msgN').textContent), null, { timeout: 300000 });
  await p.addStyleTag({ content: '#hint,#meter,#views,#fs,button{display:none!important}' });
  const views = { skole: [0, 22, -26], plads: [0, 4, 2], kollegie: [-44, 14, -8], bobler: [34, 10, 3], dyr: [64, 6, -16], drage: [-68, 10, -26], koncert: [-58, 8, 28], stoevle: [-24, 8, 29], bro: [22, 5, 32], arkade: [62, 9, 29], himmel: [0, 50, -45] };
  for (const [n, c] of Object.entries(views)) { if (which && !which.split(',').includes(n)) continue; await p.evaluate(c => __kort.center(...c), c); await p.waitForTimeout(700); await p.screenshot({ path: __dirname + `/qa-${n}.png`, timeout: 240000 }); console.log('billede', n) }
  await b.close();
})();
