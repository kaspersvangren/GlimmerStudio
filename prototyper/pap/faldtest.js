/* Faldskærm: kortet, turen op, frit fald med bobler, skærmen, styring og landing */
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
  const inde = id => p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('gang')); await inde('gang'); await p.evaluate(() => __spil.enter('fald')); await inde('fald');
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) }, F = 'const f=__spil.room.ctx.test;';
  const til = () => T(F + 'f.tilstand()'), spol = s => T(F + `f.spol(${s})`), skud = n => p.screenshot({ path: __dirname + `/fald-${n}.png` });
  await p.waitForTimeout(800); await skud('kort'); let s = await til(); tjek('Kaptajn Sky venter på et tryk', s.fase === 'kort', s);
  await p.mouse.click(W / 2, H / 2); await spol(.04); s = await til(); tjek('et tryk sender hende af sted på kosten', s.fase === 'intro', s.fase);
  await spol(.9); await p.waitForTimeout(300); await skud('intro');
  await spol(1.6); s = await til(); tjek('hun springer af og falder frit', s.fase === 'free', s);
  await spol(2.6); await p.waitForTimeout(200); await skud('frit1');
  /* træk med musen: hun flytter sig samme vej */
  const x0 = await T(F + 'f.S().hx'); await p.mouse.move(W / 2, H / 2); await p.mouse.down(); await p.mouse.move(W / 2 + 200, H / 2, { steps: 5 }); await p.mouse.up(); await spol(.6);
  const x1 = await T(F + 'f.S().hx'); tjek('træk flytter hende til højre', x1 > x0 + 100, [x0, x1]);
  await T(F + 'f.auto(true)'); await spol(1.2); await p.waitForTimeout(200); await skud('frit2'); await spol(2.5); s = await til(); tjek('hun samler stjernebobler', s.bobler > 0, s);
  await T(F + 'f.auto(false)');
  for (let i = 0; i < 20 && (await til()).fase === 'free'; i++) await spol(1);
  s = await til(); tjek('skærmen folder sig ud', s.fase === 'open' || s.fase === 'canopy', s.fase); await spol(.5); await skud('aaben');
  for (let i = 0; i < 10 && (await til()).fase !== 'canopy'; i++) await spol(.5);
  await spol(.5); await p.waitForTimeout(300); await skud('skaerm1');
  /* venstre håndtag trukket ned: hun drejer til venstre */
  const th0 = (await til()).th; await p.mouse.move(W * .1, H * .5); await p.mouse.down(); await p.mouse.move(W * .1, H * .5 + H * .25, { steps: 4 }); await spol(1); await skud('skaerm-traek'); const th1 = (await til()).th; await p.mouse.up();
  tjek('venstre håndtag ned drejer til venstre', th1 < th0 - 20, [th0, th1]);
  await T(F + 'f.auto(true)'); for (let i = 0; i < 40 && (await til()).fase === 'canopy'; i++) { await spol(1); if (i === 3) await skud('skaerm2') }
  s = await til(); tjek('hun lander', s.fase === 'landed' && s.res, s.res); await spol(1.4); await p.waitForTimeout(300); await skud('landet');
  tjek('autopiloten lander tæt på midten', s.res && s.res.d < 20, s.res && s.res.d);
  await p.waitForTimeout(800); const vent = await T(`document.getElementById('toast').textContent`); tjek('resultatet står og venter', /stjerne/.test(vent), vent);
  console.log(fejl ? fejl + ' FEJL' : 'alt ok'); await b.close();
})();
