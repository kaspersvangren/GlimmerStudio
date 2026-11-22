/* åbner et rum direkte og tager billeder: node rumshot.js <rum> <W> <H> <dpr> [js der køres mellem billederne; adskilt med ;;] */
const { chromium } = require('playwright');
(async () => {
  const [, , rum = 'vaerelse', W = '1280', H = '800', dpr = '1', acts = ''] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +dpr });
  p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 400)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = () => p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  if (process.env.FOER) await p.evaluate(process.env.FOER);
  for (const r of rum.split('>')) { await p.evaluate(h => __spil.enter(h), r); try { await inde() } catch (e) { console.log('kom ikke ind:', await p.evaluate(() => document.getElementById('doorT').textContent)); await b.close(); return } }
  console.log('inde på', await p.evaluate(() => [__spil.roomMs, JSON.stringify(window.__rumtid)]));
  await p.waitForTimeout(1200); await p.screenshot({ path: __dirname + `/rum-${rum.replace(/>/g, '-')}.png`, timeout: 240000 });
  let i = 0; for (const a of acts.split(';;').filter(Boolean)) { try { const r = await p.evaluate(a); if (r !== undefined && r !== null) console.log("svar", String(r).slice(0, 1500)) } catch (e) { console.log('handling fejlede', e.message.slice(0, 200)) } await p.waitForTimeout(2500); await p.screenshot({ path: __dirname + `/rum-${rum.replace(/>/g, '-')}-${++i}.png`, timeout: 240000 }) }
  await b.close();
})();
