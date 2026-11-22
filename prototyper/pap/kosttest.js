/* Kosteflyvning: kortet, nedtælling, flyv, ringe, loop/boost, klassekammerater og mål */
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
  await p.evaluate(() => __spil.enter('gang')); await inde('gang'); await p.evaluate(() => __spil.enter('kost')); await inde('kost');
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) }, F = 'const f=__spil.room.ctx.test;';
  const til = () => T(F + 'f.tilstand()'), spol = s => T(F + `f.spol(${s})`), skud = n => p.screenshot({ path: __dirname + `/kost-${n}.png` });
  await p.waitForTimeout(800); await skud('kort'); let s = await til(); tjek('Kaptajn Sky venter på et tryk', s.fase === 'kort', s.fase);
  await p.mouse.click(W / 2, H / 2); await spol(.3); s = await til(); tjek('nedtælling', s.fase === 'count', s.fase); await skud('count');
  await spol(2.8); s = await til(); tjek('afsted', s.fase === 'fly', s.fase);
  const y0 = s.y; await p.mouse.click(W / 2, H / 2); await spol(.12); s = await til(); tjek('et tryk løfter hende', s.y < y0, [y0, s.y]);
  await T(F + 'f.auto(true)'); await spol(3); await p.waitForTimeout(200); await skud('flyv1'); s = await til(); tjek('ringene tæller', s.ringe > 0, s);
  /* loop i en dobbeltring giver boost */
  let saaBoost = false; for (let i = 0; i < 60 && !saaBoost; i++) { await spol(.5); s = await til(); if (s.boost > 0) { saaBoost = true; await p.waitForTimeout(150); await skud('boost') } }
  tjek('loop gennem dobbeltringen giver boost', saaBoost, s);
  await spol(2); await skud('flyv2');
  for (let i = 0; i < 80 && (await til()).fase === 'fly'; i++) { await spol(1); if (i === 10) await skud('flyv3') }
  s = await til(); tjek('målet nås, og der gives plads og stjerner', s.res && s.res.place >= 1 && s.res.stars >= 1, s.res);
  await spol(1.5); await p.waitForTimeout(500); await skud('slut'); const vent = await T(`document.getElementById('toast').textContent`); tjek('resultatet står og venter', /stjerne/.test(vent), vent);
  console.log(fejl ? fejl + ' FEJL' : 'alt ok'); await b.close();
})();
