/* et ark med alle pupiller og munde: åbner Garderoben i spillet og klipper ansigtet ud */
const { chromium } = require('playwright'); const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 400)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = () => p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('vaerelse')); await inde(); await p.evaluate(() => __spil.enter('garderobe')); await p.waitForFunction(() => __spil.room.id === 'garderobe' && window.__gard && __gard.ready && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __gard.set('hat', 'ingen')); await p.waitForTimeout(800);
  const pt = await p.evaluate(() => { const c = __spil.room.ctx.room.cam || null; const f = __gard.fig, v = new __kort.THREE.Vector3(); f.gFace.getWorldPosition(v); const cam = __gard.cam; return cam ? (v.project(cam), [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]) : null });
  console.log('ansigt ved', pt);
  const klip = { x: 512, y: 285, width: 140, height: 125 }, filer = [];
  for (const [k, vs] of [['pupil', ['rund', 'glimt', 'stjerne', 'hjerte', 'maane', 'diamant', 'blomst', 'kat', 'spiral', 'stor']], ['mund', ['smil', 'grin', 'pust', 'tunge', 'kys', 'kysstor', 'skaev', 'oh', 'tand', 'kat', 'glad']]]) { for (const v of vs) { await p.evaluate(([k, v]) => { __gard.set(k, v); __gard.fig.lids.scale.set(0, 0, 0) }, [k, v]); await p.waitForTimeout(1300); const f = `${__dirname}/an-${k}-${v}.png`; await p.screenshot({ path: f, clip: klip }); filer.push(f) } await p.evaluate(([k, v]) => __gard.set(k, v), [k, vs[0]]) }
  execSync(`python3 - <<'P'\nfrom PIL import Image\nf=${JSON.stringify(filer)}\nims=[Image.open(q) for q in f]\nw,h=ims[0].size\nA=Image.new('RGB',(w*7+24,h*3+8),'#000')\nfor n,i in enumerate(ims):A.paste(i,((n%7)*(w+4),(n//7)*(h+4)))\nA.save('${__dirname}/ark-ansigt.png')\nP`);
  await p.screenshot({ path: __dirname + '/an-hel.png' }); await b.close();
})();
