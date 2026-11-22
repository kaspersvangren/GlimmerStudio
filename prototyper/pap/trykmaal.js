const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 432 } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  console.log(JSON.stringify(await p.evaluate(() => { const T = __kort.THREE, r = new T.Raycaster(), H = __kort.HOUSEG; let dele = 0; for (const g of H) g.traverse(o => { if (o.isMesh) dele++ });
    const maal = f => { const t = performance.now(); for (let k = 0; k < 20; k++) { r.setFromCamera(new T.Vector2((k % 5) / 2.5 - 1, (k % 4) / 2 - 1), __kort.cam); f() } return +((performance.now() - t) / 20).toFixed(2) };
    const B = H.map(g => new T.Box3().setFromObject(g)), v = new T.Vector3();
    return { huse: H.length, papirdele: dele, foer_ms_pr_tryk: maal(() => r.intersectObjects(H, true)), nu_ms_pr_tryk: maal(() => { for (const x of B) r.ray.intersectBox(x, v) }) } }))); await b.close();
})();
