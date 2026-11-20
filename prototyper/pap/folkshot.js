/* stiller heksen og byens folk op et sted og tager et billede: node folkshot.js <dpr> <ud.png> <x> <z> [gå] */
const { chromium } = require('playwright');
(async () => {
  const [, , dpr = '2', out = 'folk.png', X = '0', Z = '6', walk = ''] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: +dpr });
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testkort.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.addStyleTag({ content: '#hint,#meter,#views,#fs,button{display:none!important}' });
  await p.evaluate(([x, z, walk]) => { const k = __kort; k.center(x, 4, z); const put = (w, px, pz) => { w.x = px; w.z = pz; w.tx = walk ? px + 30 : px; w.tz = pz; w.q = []; w.acting = !walk; w.until = 1e9; w.yOff = 0; w.sq = 1 }; put(k.W0, x - 12, z + 1); k.walkers.forEach((w, i) => put(w, x - 4 + i * 5.5, z + (i % 2 ? 2.5 : 0))) }, [+X, +Z, walk]);
  await p.waitForTimeout(walk ? 2500 : 4000); await p.evaluate(([x, z]) => __kort.center(x, 4, z), [+X, +Z]); await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/' + out, timeout: 240000 });
  await b.close();
})();
