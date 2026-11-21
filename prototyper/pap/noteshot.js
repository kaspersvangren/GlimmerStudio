const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = () => p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  const gem = async n => { const d = await p.evaluate(() => { const d = __spil.note('test', 'prøve'); return d }); console.log(n, d.sted, JSON.stringify(d.rum), (d.billede || '').length, 'tegn'); if (d.billede) fs.writeFileSync(`${__dirname}/note-${n}.jpg`, Buffer.from(d.billede.split(',')[1], 'base64')) };
  await p.click('#noteknap'); await p.waitForTimeout(600); await p.screenshot({ path: __dirname + '/note-dialog-by.png' }); await gem('by'); await p.click('#noteNej');
  await p.evaluate(() => __spil.enter('vaerelse')); await inde(); await p.evaluate(() => __spil.enter('garderobe')); await p.waitForFunction(() => __spil.room.id === 'garderobe' && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 }); await p.waitForTimeout(800);
  await p.click('#noteknap'); await p.waitForTimeout(600); await p.click('#noteT button[data-t=bedre]'); await p.fill('#noteTxt', 'Håret går gennem hatten'); await p.screenshot({ path: __dirname + '/note-dialog.png' }); await gem('garderobe');
  await p.click('#noteJa'); await p.waitForTimeout(300); console.log('lukket:', await p.evaluate(() => [document.getElementById('note').hidden, document.getElementById('toast').textContent]));
  await b.close();
})();
