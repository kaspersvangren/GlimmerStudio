/* Gribemaskinen: betaling, et forsøg uden gevinst, og forsøg med stram fjeder til der er gevinst */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = id => p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('arkade')); await inde('arkade'); await p.evaluate(() => __spil.enter('gribe')); await inde('gribe');
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) };
  /* uden stjerner sker der ingenting */
  await T(`__spil.room.ctx.test.hold('h',true);__spil.room.ctx.test.hold('h',false)`); let s = await T(`__spil.room.ctx.test.tilstand()`); tjek('uden stjerner starter maskinen ikke', s.fase === 'klar', await T(`document.getElementById('toast').textContent`));
  await T(`__spil.giv(30)`); const st0 = await T(`__spil.stj`);
  /* et rigtigt tryk på højre pil med musen */
  const pt = await T(`(()=>{const c=__spil.room.ctx.room.cam,v=new __kort.THREE.Vector3(-2,1,8.2).project(c),r=document.querySelector('#stage canvas').getBoundingClientRect();return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]})()`);
  await p.mouse.move(pt[0], pt[1]); await p.mouse.down(); await p.waitForTimeout(300); s = await T(`__spil.room.ctx.test.tilstand()`); const st1 = await T(`__spil.stj`); tjek('et tryk på pilen koster 1 stjerne og starter', s.fase === 'flyt' && st1 === st0 - 1, [s.fase, st0, st1]);
  await T(`__spil.room.ctx.test.spol(1)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('kloen kører, mens pilen holdes nede', s.x > 400, s.x); await p.mouse.up(); await T(`__spil.room.ctx.test.spol(1)`); const x1 = (await T(`__spil.room.ctx.test.tilstand()`)).x; await T(`__spil.room.ctx.test.spol(.5)`); tjek('og står stille, når man slipper', Math.abs((await T(`__spil.room.ctx.test.tilstand()`)).x - x1) < 2, x1);
  /* tiden løber ud: kloen griber selv */
  await T(`__spil.room.ctx.test.spol(19)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('efter 20 sekunder griber den af sig selv', s.fase !== 'flyt' && s.fase !== 'klar', s.fase);
  await T(`__spil.room.ctx.test.spol(14)`); await p.waitForTimeout(400); let txt = await T(`document.getElementById('toast').textContent`); tjek('forsøget slutter med en besked', /Øv|Næsten|vandt/.test(txt) && !(await T(`document.getElementById('videre').hidden`)), txt);
  await p.screenshot({ path: __dirname + '/gribe-slut.png' }); await p.waitForTimeout(700); await p.click('#videre'); await p.waitForTimeout(300); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('klar til et nyt forsøg', s.fase === 'klar', s);
  /* med stram fjeder og godt sigte skal man kunne vinde */
  let vandt = null, n = 0, baaret = 0;
  for (; n < 14 && !vandt; n++) {
    const r = await T(`(()=>{const T=__spil.room.ctx.test;T.spol(2.6);T.hold('h',true);T.saetGreb(.02);const x=T.sigtPaa();for(let i=0;i<600&&T.S().tx<x-55;i++)T.spol(.04);T.hold('h',false);T.spol(1.2);T.grib();for(let i=0;i<400&&!T.S().vist;i++)T.spol(.1);return T.tilstand()})()`);
    if (r.baaret) baaret++; vandt = r.vandt; await p.waitForTimeout(700); if (n === 0) await p.screenshot({ path: __dirname + '/gribe-forsoeg.png' }); if (!vandt) { await p.click('#videre'); await p.waitForTimeout(200) }
  }
  txt = await T(`document.getElementById('toast').textContent`); const data = await T(`JSON.stringify(__spil.data.bamser||[])`);
  tjek('en bamse kan vindes', !!vandt && /Du vandt/.test(txt) && data.includes(vandt), [n, baaret, vandt, txt, data]); await p.screenshot({ path: __dirname + '/gribe-vandt.png' });
  await p.click('#videre'); await p.waitForTimeout(300); tjek('gemt i spillet', JSON.parse(await T(`localStorage.getItem('magiske-mig-pap')`)).data.bamser.includes(vandt));
  await p.click('#hjem'); await inde('arkade'); tjek('tilbage i Arkaden', true);
  console.log(fejl ? `${fejl} FEJL` : 'alt i orden'); await b.close();
})();
