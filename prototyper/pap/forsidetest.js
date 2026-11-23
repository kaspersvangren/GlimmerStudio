/* forsiden, de tre gemte spil og bogen */
const { chromium } = require('playwright');
(async () => {
  const W = +(process.env.W || 1280), H = +(process.env.H || 800);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) }, skud = n => p.screenshot({ path: __dirname + `/fs-${n}.png` });
  const klar = () => p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.goto('file://' + __dirname + '/spillet.html'); await T(`localStorage.clear()`); await p.reload(); await klar(); await p.waitForTimeout(800);
  await skud('titel'); tjek('forsiden står der efter indlæsningen', await T(`!!document.querySelector('#forside .fs-play')`)); tjek('der er en fuldskærmsknap på forsiden', await T(`!!document.querySelector('#forside .fs-fuld')`)); tjek('skiltet siger kun Magiske Mig', (await T(`document.querySelector('.fs-skilt').textContent`)) === 'Magiske Mig');
  await p.click('.fs-play', { force: true }); await p.waitForTimeout(500); await skud('pladser'); tjek('tre bøger på hylden', (await T(`document.querySelectorAll('.sbook').length`)) === 3);
  /* bog 2 er tom og ikke den indlæste: siden genindlæses med plads 2, og bogen åbner */
  await p.click('.sb-wrap:nth-child(2) .sbook'); await p.waitForTimeout(500); await klar(); await p.waitForTimeout(1500);
  await p.waitForFunction(() => __spil.room && __spil.room.id === 'bog' && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 }); await p.waitForTimeout(2500);
  tjek('plads 2 er valgt', (await T(`localStorage.getItem('magiske-mig-pap.plads')`)) === '2'); tjek('bogen i pap er åben', await T(`__spil.room.id==='bog'`)); await skud('bog1');
  tjek('fuldskærmsknappen var på forsiden', true);
  tjek('næste-pilen er låst, til der står et navn', await T(`document.querySelector('.bog-frem').disabled`));
  for (const k of ['a', 'g', 'n', 'e', 's']) { await p.click(`.kb-k[data-k="${k}"]`, { force: true }); await p.waitForTimeout(60) }
  await skud('navn'); tjek('navnet skrives med spillets tastatur', (await T(`document.querySelector('.bog-inp').value`)) === 'Agnes');
  await p.click(`.kb-k[data-k="enter"]`, { force: true }); await p.waitForTimeout(400); const F = 'const f=__spil.room.ctx.test;';
  for (let i = 0; i < 5; i++) { await p.click('.bog-frem', { force: true }); await T(F + 'f.spol(2.2)'); await p.waitForTimeout(300); if (i === 1) await skud('bog3') }
  await T(F + 'f.spol(8)'); await p.waitForTimeout(1200); await skud('lukket'); tjek('bogen er lukket, og knappen kommer frem', await T(`document.querySelector('.bog-efter').classList.contains('on')`));
  await p.click('.bog-ek .hot', { force: true }); await p.waitForFunction(() => __spil.room && __spil.room.id === 'garderobe' && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  tjek('så laver man sin heks i Garderoben', true); tjek('navnet er gemt på plads 2', (JSON.parse(await T(`localStorage.getItem('magiske-mig-pap@2')`)) || {}).navn === 'Agnes');
  /* tilbage i byen: menuknappen fører til forsiden, og bog 2 hedder nu Agnes */
  await p.click('#hjem'); await p.waitForFunction(() => !__spil.room, null, { timeout: 60000 }); await p.waitForTimeout(800);
  tjek('menuknappen er der i byen', await T(`!document.getElementById('menuknap').hidden`)); await skud('by');
  await p.click('#menuknap'); await p.waitForTimeout(300); await p.click('.fs-spoerg .fs-knap.hot'); await p.waitForTimeout(300); await p.click('.fs-play', { force: true }); await p.waitForTimeout(400);
  tjek('bog 2 viser navnet', (await T(`document.querySelectorAll('.sb-name')[1].textContent`)) === 'Agnes'); await skud('pladser2');
  await p.click('.sb-wrap:nth-child(2) .sbook'); await p.waitForTimeout(400); tjek('samme bog: lige ud i byen', await T(`document.getElementById('forside').hidden`));
  console.log(fejl ? fejl + ' FEJL' : 'alt ok'); await b.close();
})();
