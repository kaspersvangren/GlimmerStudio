/* Kosteflyvning: kortet, nedtælling, flyv, ringe, loop/boost, klassekammerater og mål */
const { chromium } = require('playwright');
(async () => {
  const W = +(process.env.W || 1280), H = +(process.env.H || 800);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = id => p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 120000 });
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) };
  const pr0 = await T(`__renderer.getPixelRatio()`); tjek('kortet starter i fuld skarphed', pr0 === 2, pr0);
  await T(`localStorage.setItem('magiske-mig-pap.kval',JSON.stringify({kost:3,gang:2}))`); await p.reload(); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await T(`__spil.enter('gang')`); await inde('gang'); let v = await T(`[__renderer.getPixelRatio()]`); tjek('gangen husker trin 2', Math.abs(v[0] - 1.6) < .02, v);
  await T(`__spil.enter('kost')`); await inde('kost'); v = await T(`[__renderer.getPixelRatio(),__renderer.shadowMap.autoUpdate]`); tjek('kosten husker trin 3 (lav opløsning, ingen levende skygger)', Math.abs(v[0] - 1.3) < .02 && !v[1], v);
  await p.waitForTimeout(6000); v = await T(`JSON.parse(localStorage.getItem('magiske-mig-pap.kval'))`); console.log('gemt', JSON.stringify(v));
  for (let i = 0; i < 4 && await T('!!__spil.room'); i++) { await p.click('#hjem', { force: true }); await p.waitForTimeout(4000) } await p.waitForTimeout(500);
  v = await T(`[__renderer.getPixelRatio(),__renderer.shadowMap.autoUpdate]`); tjek('tilbage på kortet: fuld skarphed og skygger igen', v[0] === 2 && v[1], v);
  /* frisk rum: målingen skal kunne træde ned af sig selv i swiftshader, som er langsom */
  await T(`localStorage.removeItem('magiske-mig-pap.kval')`); await p.reload(); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await T(`__spil.enter('gang')`); await inde('gang'); v = await T(`new Promise(r=>{const a=[];let l=performance.now();const f=n=>{a.push(n-l);l=n;if(a.length<60)requestAnimationFrame(f);else r(a.sort((x,y)=>x-y)[30])};requestAnimationFrame(f)})`); console.log('median ms', v); await p.waitForTimeout(12000); v = await T(`[__renderer.getPixelRatio(),localStorage.getItem('magiske-mig-pap.kval')]`); console.log('efter 12 s i gangen', JSON.stringify(v));
  console.log(fejl ? fejl + ' FEJL' : 'alt ok'); await b.close();
})();
