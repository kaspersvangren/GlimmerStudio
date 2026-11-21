/* hele turen gennem rummene: fejl, tilbage-knappen og et rigtigt tryk på en dør i gangen */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const i = id => p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 120000 });
  const ude = () => p.waitForFunction(() => !__spil.room && document.getElementById('door').classList.contains('gone'), null, { timeout: 60000 });
  const klik = async (x, y, z) => { const pt = await p.evaluate(([x, y, z]) => { const c = __spil.room.ctx.room.cam, v = new __kort.THREE.Vector3(x, y, z).project(c), r = document.querySelector('#stage canvas').getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height] }, [x, y, z]); await p.mouse.click(pt[0], pt[1]) };
  const info = async n => console.log(n, JSON.stringify(await p.evaluate(() => __spil.info())), 'knap:', await p.evaluate(() => document.getElementById('hjemT').textContent));
  await info('start');
  await p.evaluate(() => __spil.enter('kollegie')); await i('vaerelse'); await info('værelset');
  await klik(-29, 8, -5); await p.waitForTimeout(1200); const fane = () => p.evaluate(() => [document.getElementById('panel').hidden, (document.querySelector('#tabs [aria-selected=true]') || {}).textContent]); console.log('trykket på sengen: menu skjult/fane', JSON.stringify(await fane()));
  await p.click('#opts section.on .grid button:nth-child(2)'); await p.waitForTimeout(600); console.log('låst himmelseng:', await p.evaluate(() => [__spil.rum.seng, document.getElementById('toast').textContent]));
  await p.evaluate(() => { __spil.har.push('rum.seng:himmelseng'); __spil.room.ctx.test('aabn', 'seng') }); await p.click('#opts section.on .grid button:nth-child(2)'); await p.waitForTimeout(1500); await p.click('#opts section.on .sw button:nth-child(8)'); await p.waitForTimeout(1500);
  console.log('efter køb:', await p.evaluate(() => [__spil.rum.seng, __spil.rumc.seng, JSON.parse(localStorage.getItem('magiske-mig-pap')).rum.seng])); await p.screenshot({ path: __dirname + '/tur-seng.png' });
  await klik(21, 6, 8); await p.waitForTimeout(600); console.log('trykket på kedlen:', JSON.stringify(await fane())); await p.click('#tabs button.hvem'); await p.waitForTimeout(1200); console.log('færdig:', JSON.stringify(await fane())); await p.screenshot({ path: __dirname + '/tur-seng2.png' });
  await klik(34, 14, -3); await i('garderobe'); await info('garderoben'); console.log('låste valg:', await p.evaluate(() => document.querySelectorAll('#opts button.laas').length));
  await p.click('#hjem'); await i('vaerelse'); await info('værelset igen'); await p.click('#hjem'); await ude(); await info('byen');
  await p.evaluate(() => __spil.enter('skole')); await i('gang'); await klik(-33, 10, -8); await i('eliksir'); await info('eliksir');
  for (let n = 0; n < 2; n++) { for (let k = 0; k < 10; k++) { const s = await p.evaluate(() => { const c = __spil.room.ctx.test, s = c.step(); return s && c.pot().i < c.pot().steps.length ? { kind: s.kind, id: s.id, n: s.n, got: c.pot().got } : null }); if (!s) break; if (s.kind === 'ing') { const j = ['blad', 'draabe', 'stjerne', 'svamp', 'fjer', 'krystal'].indexOf(s.id); for (let q = s.got; q < s.n; q++) { await klik([-38.5, -28.5][j % 2], [6.6, 17.6, 28.6][j >> 1] + 4.4, -4.4); await p.waitForTimeout(250) } await p.waitForTimeout(1200) } else { await p.evaluate(() => { const c = __spil.room.ctx.test; c.stir(); c.heat() }); await p.waitForTimeout(600) } } await p.waitForTimeout(6500) }
  console.log('stjerner efter to eliksirer:', await p.evaluate(() => __spil.stj), 'brygget:', await p.evaluate(() => __spil.eliksir));
  await p.click('#hjem'); await i('gang'); await p.click('#hjem'); await ude();
  await p.evaluate(() => __spil.enter('bobler')); await i('bobler'); await klik(16, 20, 3.6); await p.waitForFunction(() => __spil.room.ctx.test.st() === 'vent', null, { timeout: 60000 }); await klik(2, 27, 12); await p.waitForTimeout(800);
  console.log('efter boblen: stjerner', await p.evaluate(() => __spil.stj), 'har', await p.evaluate(() => JSON.stringify(__spil.har)), '· besked:', await p.evaluate(() => document.getElementById('toast').textContent));
  await p.screenshot({ path: __dirname + '/tur-boble.png' }); await p.click('#hjem'); await ude(); await p.waitForTimeout(1000); await info('slut'); await p.screenshot({ path: __dirname + '/tur-slut.png' });
  await p.evaluate(() => __spil.enter('arkade')); await i('arkade'); await klik(-34, 14, -2); await i('gnom'); await klik(0, 40, -9); await p.waitForTimeout(6000); await p.evaluate(() => __spil.room.ctx.test.hitAll()); console.log('gnom:', JSON.stringify(await p.evaluate(() => __spil.room.ctx.test.state())));
  await klik(17, 22, -2); await p.click('#hjem'); await i('arkade'); await klik(17, 22, -2); await p.waitForTimeout(9000); console.log('lukket maskine:', await p.evaluate(() => document.getElementById('toast').textContent)); await p.click('#hjem'); await ude(); await info('helt slut');
  console.log('fejl i alt:', fejl); await b.close();
})();
