/* gangen på billeder: otte faser af et skridt for nogle sæt tøj, uden og med stav */
const { chromium } = require('playwright'); const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('vaerelse')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('garderobe')); await p.waitForFunction(() => __spil.room.id === 'garderobe' && window.__gard && __gard.ready && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => { for (const id of ['bar', 'toast', 'fs']) document.getElementById(id).style.display = 'none'; __gard.fig.set('hat', 'ingen'); __gard.fig.set('kappe', 'ingen') });
  const f = [];
  for (const [toej, stav] of [['eventyrer', true], ['opdager', false], ['kortkjole', false], ['stjernekjole', true]]) { await p.evaluate(([t, s]) => { __gard.fig.set('tøj', t); __gard.fig.set('stav', s) }, [toej, stav]);
    for (let k = 0; k < 8; k++) { await p.evaluate(k => { __gard.fig.prøv = k / 8 * Math.PI * 2; __gard.fig.lids.scale.set(0, 0, 0) }, k); await p.waitForTimeout(160); const q = `${__dirname}/gang-${toej}-${k}.png`; await p.screenshot({ path: q, clip: { x: 470, y: 250, width: 230, height: 520 } }); f.push(q) } }
  execSync(`python3 - <<'P'\nfrom PIL import Image\nf=${JSON.stringify(f)}\nims=[Image.open(q) for q in f]\nw,h=ims[0].size\nA=Image.new('RGB',((w+3)*8,(h+3)*4),'#000')\nfor k,i in enumerate(ims):A.paste(i,((k%8)*(w+3),(k//8)*(h+3)))\nA=A.resize((A.width*3//4,A.height*3//4),Image.LANCZOS)\nA.save('${__dirname}/ark-gang.png')\nP`); f.forEach(q => require('fs').unlinkSync(q)); await b.close();
})();
