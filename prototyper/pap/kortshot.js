/* udsnit af kortet: node kortshot.js navn:x,y,z[:W,H] ... → kort-<navn>.png (kameraet centreres på punktet) */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 1280), height: +(process.env.VH || 800) }, deviceScaleFactor: +(process.env.DPR || 1.5) }); p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  await p.evaluate(() => { for (const id of ['bar', 'fs', 'hint', 'meter', 'toast']) { const e = document.getElementById(id); if (e) e.style.display = 'none' } });
  for (const a of process.argv.slice(2)) { const [n, xyz, wh = '560,400'] = a.split(':'), [x, y, z] = xyz.split(',').map(Number), [w, h] = wh.split(',').map(Number);
    await p.evaluate(([x, y, z]) => __kort.center(x, y, z), [x, y, z]); await p.waitForTimeout(2500); await p.screenshot({ path: `${__dirname}/kort-${n}.png`, clip: { x: Math.max(0, (+(process.env.VW || 1280)) / 2 - w / 2), y: Math.max(0, (+(process.env.VH || 800)) / 2 - h / 2), width: w, height: h } }) }
  await b.close();
})();
