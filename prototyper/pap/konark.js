/* bandet i alle seks sange på ét ark, og gardinet lukket */
const { chromium } = require('playwright'); const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n')[1]));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  await p.evaluate(() => __spil.enter('koncert')); await p.waitForFunction(() => __spil.room && window.__koncert && __koncert.ready && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  const f = []; for (const s of (process.argv[2] || 'hygge,rock,disko,hawaii,klassisk,country').split(',')) { await p.evaluate(s => __koncert.setStyle(s, true), s); await p.waitForTimeout(1500); const q = `${__dirname}/kon-${s}.png`; await p.screenshot({ path: q, clip: { x: 400, y: 290, width: 480, height: 270 } }); f.push(q) }
  await p.evaluate(() => __koncert.luk()); await p.waitForFunction(() => __koncert.gardin() >= 1, null, { timeout: 120000 }); await p.waitForTimeout(1500); const q = `${__dirname}/kon-gardin.png`; await p.screenshot({ path: q, clip: { x: 400, y: 290, width: 480, height: 270 } }); f.push(q);
  execSync(`python3 - <<'P'\nfrom PIL import Image\nf=${JSON.stringify(f)}\nims=[Image.open(q) for q in f]\nw,h=ims[0].size\nA=Image.new('RGB',((w+4)*2,(h+4)*4),'#000')\nfor k,i in enumerate(ims):A.paste(i,((k%2)*(w+4),(k//2)*(h+4)))\nA.save('${__dirname}/ark-band.png')\nP`); await b.close();
})();
