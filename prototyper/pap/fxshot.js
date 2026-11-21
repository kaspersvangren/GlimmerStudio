const { chromium } = require('playwright'); const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n')[1]));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  await p.evaluate(() => __spil.enter('gang')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('eliksir')); await p.waitForFunction(() => __spil.room.id === 'eliksir' && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 }); await p.waitForTimeout(800);
  const f = []; for (const k of ['hjerter', 'bobler', 'blomster', 'regnbue', 'kilde']) { await p.evaluate(k => __spil.room.ctx.test.fx(k), k); await p.waitForTimeout(8000); const q = `${__dirname}/fx-${k}.png`; await p.screenshot({ path: q, clip: { x: 150, y: 150, width: 420, height: 600 } }); f.push(q) }
  await p.waitForTimeout(3000); await p.evaluate(() => __spil.room.ctx.test.fx('glimmer')); await p.waitForTimeout(1500); const q = `${__dirname}/fx-efter.png`; await p.screenshot({ path: q, clip: { x: 150, y: 150, width: 420, height: 600 } }); f.push(q);
  execSync(`python3 - <<'P'\nfrom PIL import Image\nf=${JSON.stringify(f)}\nims=[Image.open(q) for q in f]\nw,h=ims[0].size\nA=Image.new('RGB',((w+4)*len(ims),h),'#000')\nfor k,i in enumerate(ims):A.paste(i,(k*(w+4),0))\nA.save('${__dirname}/ark-fx.png')\nP`); await b.close();
})();
