/* et billede af kortet og hvert rum på ét skærmmål: node gennemgang.js <W> <H> [dpr] → gg-<W>-<sted>.png */
const { chromium } = require('playwright');
(async () => {
  const [, , W = '1280', H = '800', dpr = '1', mobil = ''] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +dpr, isMobile: !!mobil, hasTouch: !!mobil }); let fejl = 0;
  p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); console.log('vindue', await p.evaluate(() => [innerWidth, innerHeight, devicePixelRatio])); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 180000 });
  const shot = async n => { await p.waitForTimeout(3200); await p.screenshot({ path: `${__dirname}/gg-${W}-${n}.png`, timeout: 240000 }) };
  const ind = async id => { await p.evaluate(h => __spil.enter(h), id); await p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 180000 }) };
  const ud = async () => { while (await p.evaluate(() => !!__spil.room)) { await p.click('#hjem'); await p.waitForTimeout(1500); await p.waitForFunction(() => document.getElementById('door').classList.contains('gone'), null, { timeout: 60000 }) } };
  await shot('by');
  for (const sti of [['vaerelse'], ['vaerelse', 'garderobe'], ['koncert'], ['gang'], ['gang', 'eliksir'], ['bobler'], ['arkade'], ['arkade', 'gnom'], ['dyrepark'], ['dyrepark', 'dyrekoekken'], ['dyrepark', 'ungestald']]) { for (const id of sti) await ind(id); await shot(sti[sti.length - 1]); await ud() }
  await shot('by-efter'); console.log('gennemgang', W + 'x' + H, 'fejl:', fejl); await b.close();
})();
