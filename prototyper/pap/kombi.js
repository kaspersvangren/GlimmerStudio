/* billedark hvor alt bliver sat sammen med alt: node kombi.js <navn> <rækkenøgle> <kolonnenøgle> <x,y,w,h> [fast=nøgle:værdi,nøgle:værdi] [skala]
   Nøglerne er dem fra Garderoben (hat, hår, pande, tøj, kappe, støvler, tilbehør) eller kæledyrets (kind, moenster, pynt). */
const { chromium } = require('playwright'); const { execSync } = require('child_process'); const fs = require('fs');
const src = fs.readFileSync(__dirname + '/garderobe2.js', 'utf8'), i0 = src.indexOf('const VALG={'), VALG = Function('return ' + src.slice(i0 + 11, src.indexOf('};', i0) + 1))();
const LISTE = {}; for (const n in VALG) LISTE[VALG[n][0]] = VALG[n][1].map(w => w[0]);
(async () => {
  const [, , navn, rk, kk, klip, fast = '', skala = '1'] = process.argv, [x, y, w, h] = klip.split(',').map(Number), dyr = k => ['kind', 'moenster', 'pynt'].includes(k);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('vaerelse')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('garderobe')); await p.waitForFunction(() => __spil.room.id === 'garderobe' && window.__gard && __gard.ready && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => { for (const id of ['bar', 'toast', 'fs']) { const e = document.getElementById(id); if (e) e.style.display = 'none' } });
  const saet = async (k, v) => { await p.evaluate(([k, v, d]) => { if (d) __gard.set(k, v); else { __gard.fig.set(k, v); __gard.fig.G.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } }) } }, [k, v, dyr(k)]) };
  for (const f of fast.split(',').filter(Boolean)) { const [k, v] = f.split(':'); await saet(k, v) }
  const dir = `${__dirname}/kombi-${navn}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir); const R = LISTE[rk], K = LISTE[kk]; let fejl = 0;
  for (let r = 0; r < R.length; r++) { try { await saet(rk, R[r]) } catch (e) { fejl++; console.log('FEJL', rk, R[r], e.message.split('\n')[0]) }
    for (let c = 0; c < K.length; c++) { try { await saet(kk, K[c]) } catch (e) { fejl++; console.log('FEJL', rk, R[r], kk, K[c], e.message.split('\n')[0]) }
      await p.evaluate(() => __gard.fig.lids.scale.set(0, 0, 0)); await p.waitForTimeout(dyr(rk) || dyr(kk) ? 1250 : 220); await p.screenshot({ path: `${dir}/${r}-${c}.png`, clip: { x, y, width: w, height: h } }) } }
  await b.close();
  fs.writeFileSync(dir + '/m.json', JSON.stringify({ R, K, w, h, skala: +skala, navn }));
  execSync(`python3 ${__dirname}/kombiark.py ${dir}`, { stdio: 'inherit' }); console.log('færdig', navn, R.length + '×' + K.length, 'fejl:', fejl);
})();
