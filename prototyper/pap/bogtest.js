/* Eventyrbogen: navn, vend sider, luk bogen, titlen flyver ind */
const { chromium } = require('playwright');
(async () => {
  const W = +(process.env.W || 1280), H = +(process.env.H || 800);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => { __spil.navn = ""; __spil.enter('bog') });
  await p.waitForFunction(() => __spil.room && __spil.room.id === 'bog' && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) }, F = 'const f=__spil.room.ctx.test;';
  const skud = n => p.screenshot({ path: __dirname + `/bog-${n}.png` }), vent = ms => p.waitForTimeout(ms);
  const roligt = async () => { for (let k = 0; k < 80; k++) { if (!(await T(F + 'f.fase()'))) return; await vent(250) } };
  await vent(2500); await skud('0-lukket'); tjek('bogen ligger lukket', !(await T(F + 'f.aaben()')));
  await p.click('.bog-frem', { force: true }); await T(F + 'f.spol(.6)'); await vent(300); await skud('0b-aabner'); await T(F + 'f.spol(1.2)'); await vent(1500);
  tjek('bogen er åbnet', await T(F + 'f.aaben()')); await skud('1-start');
  tjek('tastaturet kommer frem til navnet', await T("!document.querySelector('.kb').hidden"));
  tjek('pilen er låst uden navn', await T("document.querySelector('.bog-frem').disabled"));
  for (const k of ['a', 'g', 'n', 'e', 's']) await p.click(`.kb-k[data-k="${k}"]`, { force: true });
  await vent(400); await skud('2-navn');
  await p.click('.kb-k[data-k="enter"]', { force: true }); await vent(600);
  tjek('navnet står i feltet', await T("document.querySelector('.bog-inp').value"), await T("document.querySelector('.bog-inp').value"));
  await p.click('.bog-frem', { force: true }); await T(F + 'f.spol(.45)'); await vent(300); await skud('3-vend'); await T(F + 'f.spol(.3)'); await vent(300); await skud('3b-vend'); await T(F + 'f.spol(2.2)'); await vent(600); await skud('4-side2');
  tjek('side 2', (await T(F + 'f.side()')) === 1);
  for (let k = 0; k < 3; k++) { await p.click('.bog-frem', { force: true }); await vent(300); await T(F + 'f.spol(2.2)'); await vent(500); await skud('5-side' + (k + 3)) }
  await p.click('.bog-tilb', { force: true }); await vent(300); await T(F + 'f.spol(2.2)'); await vent(500); tjek('tilbage virker', (await T(F + 'f.side()')) === 3);
  await p.click('.bog-frem', { force: true }); await vent(300); await T(F + 'f.spol(2.2)'); await vent(400);
  await p.click('.bog-frem', { force: true }); await vent(1100); await skud('6-lukker');
  await T(F + 'f.spol(1.3)'); await vent(500); await skud('6b-lukket'); await T(F + 'f.spol(.9)'); await vent(400); await skud('7-titel'); console.log(JSON.stringify(await T(F + 'f.bogst()'))); await T(F + 'f.spol(1.2)'); await vent(400); await skud('8-titel2'); await T(F + 'f.spol(3)');
  await p.waitForFunction(() => __spil.room.ctx.test.efter(), null, { timeout: 150000 }); await vent(900); await skud('9-slut');
  tjek('knapperne er der', await T("document.querySelector('.bog-efter').classList.contains('on')"));
  await p.click('.bog-ek .hot', { force: true });
  await p.waitForFunction(() => __spil.room && __spil.room.id === 'garderobe', null, { timeout: 60000 });
  tjek('navnet er gemt og vi er i Garderoben', await T("__spil.navn==='Agnes'&&__spil.data.intro===true"), await T("__spil.navn"));
  tjek('bogens knapper er ryddet', await T("!document.querySelector('.bog-k')&&!document.querySelector('.bog-efter')"));
  console.log(fejl ? `${fejl} fejl` : 'alt ok'); await b.close(); process.exit(fejl ? 1 : 0)
})();
