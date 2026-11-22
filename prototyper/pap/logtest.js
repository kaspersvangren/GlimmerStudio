/* tjekker at loggen sender, når siden ikke ligger på Claude: serverer siden fra en lokal adresse og fanger kaldet til tabellen */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); const sendt = [];
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/proeve\.test/, r => r.fulfill({ body: fs.readFileSync(__dirname + '/testspil.html'), contentType: 'text/html' }));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.route(/supabase\.co/, r => { try { sendt.push(...JSON.parse(r.request().postData())) } catch (e) { } r.fulfill({ status: 201, body: '' }) });
  await p.goto('http://proeve.test/');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('bobler')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 }); await p.waitForTimeout(7000);
  await p.click('#hjem'); await p.waitForFunction(() => !__spil.room, null, { timeout: 60000 }); await p.waitForTimeout(1000); await p.evaluate(() => LOGTEST && LOGTEST());
  await p.waitForTimeout(500); for (const r of sendt) console.log(r.version, r.kind, r.screen, JSON.stringify(r.data).slice(0, 170));
  await b.close();
})();
