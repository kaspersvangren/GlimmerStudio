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
  await T(`window.__ikkeGenindlaest=1`);
  await p.click('.fs-play', { force: true }); await p.waitForTimeout(500); await skud('pladser'); tjek('tre bøger på hylden', (await T(`document.querySelectorAll('.sbook').length`)) === 3);
  /* bog 2 er tom og ikke den indlæste: siden genindlæses med plads 2, og bogen åbner */
  await p.click('.sb-wrap:nth-child(2) .sbook'); await p.waitForTimeout(500); await klar(); await p.waitForTimeout(1500);
  await p.waitForFunction(() => __spil.room && __spil.room.id === 'bog' && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 }); await p.waitForTimeout(2500);
  tjek('bogen blev skiftet uden at genindlæse siden (musikken spiller videre)', await T(`window.__ikkeGenindlaest===1`));
  tjek('plads 2 er valgt', (await T(`localStorage.getItem('magiske-mig-pap.plads')`)) === '2'); tjek('bogen i pap er åben', await T(`__spil.room.id==='bog'`)); await skud('bog1');
  tjek('fuldskærmsknappen var på forsiden', true);
  tjek('bogen ligger lukket', !(await T(`__spil.room.ctx.test.aaben()`))); await p.click('.bog-frem', { force: true }); await T(`__spil.room.ctx.test.spol(2)`); await p.waitForTimeout(1200);
  await T(`(()=>{window.__l=[];for(const n of ['tast','tastTung','tryk','doer']){const o=__lyd[n];__lyd[n]=function(){__l.push(n);return o.apply(this,arguments)}}})()`);
  await p.focus('.bog-inp'); await p.keyboard.type('Ag'); await p.keyboard.press('Space'); await p.keyboard.press('Backspace'); await p.keyboard.type('nes');
  const l=await T(`__l`); tjek('rigtigt keyboard giver tastelyde', JSON.stringify(l)===JSON.stringify(['tast','tast','tastTung','tastTung','tast','tast','tast']), l);
  tjek('navnet blev skrevet', (await T(`document.querySelector('.bog-inp').value`))==='Agnes');
  tjek('LYD.harFil virker', await T(`__lyd.harFil('kort.tele')&&__lyd.harFil('dyr.tryk.ugle')&&__lyd.harFil('dyr.tryk.naebdyr')&&!__lyd.harFil('dyr.tryk.kanin')`));
  console.log('fejl i alt:', fejl); await b.close();
})();