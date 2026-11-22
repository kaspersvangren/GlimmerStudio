const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +(process.argv[2]||1280), height: +(process.argv[3]||800) }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testkoncert.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone') || /Fejl/.test(document.getElementById('msgN').textContent), null, { timeout: 300000 });
  await p.waitForTimeout(1500); await p.screenshot({ path: __dirname + '/konc.png', timeout: 240000 });
  for (const k of (process.argv[4] || '').split(',').filter(Boolean)) { await p.click(`#songs button:has-text("${k}")`); await p.waitForTimeout(2500); await p.screenshot({ path: __dirname + `/konc-ud-${k}.png`, timeout: 240000 }); await p.waitForTimeout(22000); await p.screenshot({ path: __dirname + `/konc-${k}.png`, timeout: 240000 }) }
  await b.close();
})();
