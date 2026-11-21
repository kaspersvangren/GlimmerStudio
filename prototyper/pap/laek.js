/* finder hvad der bliver liggende efter et besøg i et rum: node laek.js <hus> */
const { chromium } = require('playwright');
(async () => {
  const hus = process.argv[2] || 'kollegie';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = () => p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 180000 });
  const ude = () => p.waitForFunction(() => !__spil.room && document.getElementById('door').classList.contains('gone'), null, { timeout: 60000 });
  const tur = async () => { await p.evaluate(h => __spil.enter(h), hus); await inde(); await p.waitForTimeout(1500); if (hus === 'kollegie') { for (const n of ['Skovløber', 'Nattehat', 'Bølger', 'Stjernekappe', 'Stjernekjole', 'Heksehat', 'Langt', 'Lang kappe']) await p.click(`#opts button:has-text("${n}")`); await p.waitForTimeout(1500) } else { await p.click('#songs button:nth-of-type(3)'); await p.waitForTimeout(25000) } await p.evaluate(() => __spil.leave()); await ude(); await p.waitForTimeout(1500) };
  await tur();
  await p.evaluate(() => { const T = __kort.THREE, live = new Map(); window.__lev = live; const add = T.EventDispatcher.prototype.addEventListener, dis = T.EventDispatcher.prototype.dispatchEvent;
    T.EventDispatcher.prototype.addEventListener = function (t, f) { if (t === 'dispose' && (this.isTexture || this.isBufferGeometry || this.isMaterial || this.isRenderTarget)) live.set(this, new Error().stack.split('\n').slice(2, 7).map(s => s.trim().replace(/file:.*testspil\.html/, '')).join(' < ')); return add.call(this, t, f) };
    T.EventDispatcher.prototype.dispatchEvent = function (e) { if (e.type === 'dispose') live.delete(this); return dis.call(this, e) } });
  await tur();
  const res = await p.evaluate(() => { const o = {}; for (const [x, st] of __lev) { if (x.isBufferGeometry) { x.computeBoundingBox(); const bb = x.boundingBox; (o.detaljer = o.detaljer || { n: 0, st: '' }).st += ' [' + x.attributes.position.count + ' pkt, ' + [bb.min.x, bb.max.x, bb.min.y, bb.max.y, bb.min.z, bb.max.z].map(v => v.toFixed(1)).join(' ') + ']' } const kind = x.isTexture ? 'tekstur ' + (x.isDepthTexture ? 'dybde' : x.isRenderTargetTexture ? 'mål' : (x.image && x.image.width ? x.image.width + 'x' + x.image.height : '?')) : x.isBufferGeometry ? 'geometri ' + x.type : x.isMaterial ? 'materiale ' + x.type : 'andet'; const k = kind; (o[k] = o[k] || { n: 0, st }).n++ } return o });
  for (const k in res) console.log(String(res[k].n).padStart(4), k, '\n       ', res[k].st.slice(0, 420));
  console.log(JSON.stringify(await p.evaluate(() => __spil.info())));
  await b.close();
})();
