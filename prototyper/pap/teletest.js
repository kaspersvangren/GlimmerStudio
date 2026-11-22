/* hvirvelvinden i byen: dobbelttryk på jorden og på et hus */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +(process.env.W||1280), height: +(process.env.H||800) } });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) };
  await T(`document.getElementById('toast')&&(document.getElementById('toast').style.display='none')`);
  await p.waitForTimeout(1500);
  const sk = (x, z) => T(`(()=>{const K=__kort,v=new K.THREE.Vector3(${x},.3,${z}).project(K.cam),r=document.querySelector('canvas').getBoundingClientRect();return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]})()`);
  const pos = () => T(`[__kort.W0.x,__kort.W0.z]`);
  const p0 = await pos(); console.log('heksen står', p0);
  /* et enkelt tryk: hun går */
  let q = await sk(p0[0] + 4, p0[1] + 1); await p.mouse.click(q[0], q[1]); await p.waitForTimeout(500); tjek('et tryk får hende til at gå, ingen hvirvel', !(await T(`__kort.tele()`)));
  await p.waitForTimeout(1500);
  /* dobbelttryk et stykke væk */
  const m = [p0[0] + 26, p0[1] - 4]; q = await sk(...m);
  await p.mouse.click(q[0], q[1]); await p.waitForTimeout(120); await p.mouse.click(q[0], q[1]); await p.waitForTimeout(350);
  tjek('dobbelttryk starter hvirvelvinden', !!(await T(`__kort.tele()`))); await p.screenshot({ path: __dirname + '/tele-1.png' });
  await p.waitForTimeout(600); await p.screenshot({ path: __dirname + '/tele-2.png' });
  await p.waitForTimeout(500); await p.screenshot({ path: __dirname + '/tele-3.png' });
  await p.waitForFunction(() => !__kort.tele(), null, { timeout: 60000 }).catch(() => 0); const p1 = await pos(); tjek('hun står, hvor man trykkede', Math.hypot(p1[0] - m[0], p1[1] - m[1]) < 3, p1);
  tjek('hvirvlen er væk', !(await T(`__kort.tele()`)));
  await p.screenshot({ path: __dirname + '/tele-4.png' });
  /* dobbelttryk på et hus: hun lander lidt fra døren og går resten */
  const hus = process.env.HUS || 'skole'; const sp = await T(`__kort.SPOTS['${hus}']`);
  await T(`window.__ind=[];const a=__spil.arrive;__spil.arrive=n=>{window.__ind.push(n)}`);
  await T(`__kort.teleTil(0,0,'${hus}')`); await p.waitForTimeout(1000);
  const lp = await T(`[__kort.tele()&&__kort.tele().tx,__kort.tele()&&__kort.tele().tz]`); const dl = Math.hypot(lp[0] - sp[0], lp[1] - sp[1]); tjek('ved et hus lander hun et par skridt fra døren', dl > 3 && dl < 8, [lp, sp, dl]);
  await p.waitForTimeout(800); await p.screenshot({ path: __dirname + '/tele-5.png' });
  await p.waitForFunction(() => window.__ind.length, null, { timeout: 60000 }).catch(() => 0); tjek('og går selv ind', (await T(`window.__ind`)).includes(hus), await T(`window.__ind`));
  console.log(fejl ? fejl + ' FEJL' : 'alt ok'); await b.close();
})();
