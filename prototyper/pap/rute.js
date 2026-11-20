const { chromium } = require('playwright');
(async () => {
  const [, , vw = '1280', vh = '800'] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +vw, height: +vh }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error') console.log(m.type(), m.text().slice(0, 300)); });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort()); await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testkort.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone') || /Fejl/.test(document.getElementById('msgN').textContent), null, { timeout: 300000 });
  { const m = await p.evaluate(() => document.getElementById('msgN').textContent); if (/Fejl/.test(m)) { console.log('STOP', m); await b.close(); return; } }
  console.log('view', JSON.stringify(await p.evaluate(() => __kort.view())));
  for (const [x, z] of [[-62, -20], [60, 20], [-56, 22], [56, -6], [0, -19]]) {
    const r = await p.evaluate(([x, z]) => { const k = __kort; k.W0.x = 30; k.W0.z = 10; return k.NET.route(30, 10, x, z).map(q => q.map(v => Math.round(v))) }, [x, z]);
    console.log('fra boble til', x, z, ':', JSON.stringify(r));
  }
  await p.screenshot({ path: __dirname + `/zoom-${vw}.png` });
  // simulate a drag left
  const c = await p.$('canvas'); const bb = await c.boundingBox();
  await p.mouse.move(bb.width * .6, bb.height * .5); await p.mouse.down(); for (let i = 1; i <= 10; i++) await p.mouse.move(bb.width * .6 + i * 30, bb.height * .5 - i * 10); await p.mouse.up();
  await p.waitForTimeout(1200);
  console.log('efter træk', JSON.stringify(await p.evaluate(() => __kort.view())), await p.evaluate(() => document.body.dataset.view + ' ' + [...document.querySelectorAll('#views button')].map(b => b.getAttribute('aria-pressed')).join(',')));
  await p.screenshot({ path: __dirname + `/zoom-${vw}-traek.png` });
  await b.close();
})();
