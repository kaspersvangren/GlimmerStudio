/* Boblebutikken: køber bobler med bestemte ting i og tager et billede af hver medaljon: node bobshot.js "hat:krone,dyr:drage,rum.seng:slot,..." */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const liste = (process.argv[2] || 'hat:krone').split(',').map(s => s.split(':'));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 400)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('bobler')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  let n = 0;
  for (const [k, v] of liste) {
    await p.evaluate(([k, v]) => { const T = __spil.room.ctx.test; __spil.stj = 99; const w = __spil.VARER.find(q => q[0] === k && q[1] === v); if (!w) throw new Error('findes ikke: ' + k + ':' + v); __spil.har = __spil.har.filter(x => x !== k + ':' + v); T.koeb(k.startsWith('rum.') ? 2 : k.startsWith('dyr') ? 1 : 0); T.vare(w); T.spring() }, [k, v]);
    await p.waitForFunction(() => __spil.room.ctx.test.st() === 'vent', null, { timeout: 60000 });
    if (n === 0) { await p.evaluate(() => __spil.room.ctx.test.tryk()); await p.waitForTimeout(700); await p.screenshot({ path: __dirname + '/bob-tryk.png' }); await p.evaluate(() => __spil.room.ctx.test.tryk()) } else await p.evaluate(() => { __spil.room.ctx.test.tryk(); __spil.room.ctx.test.tryk() });
    await p.evaluate(() => { __spil.room.ctx.test.tryk(); __spil.room.ctx.test.spring() }); await p.waitForTimeout(2600);
    await p.screenshot({ path: __dirname + `/bob-${n}.png`, clip: n === 0 ? undefined : { x: 440, y: 120, width: 460, height: 460 } }); n++;
    await p.mouse.click(640, 400); await p.waitForFunction(() => !__spil.room.ctx.test.st(), null, { timeout: 60000 });
  }
  console.log('billeder', n, 'ting i alt', await p.evaluate(() => __spil.har.length)); await b.close();
})();
