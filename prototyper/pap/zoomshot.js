const { chromium } = require('playwright'); const { execSync } = require('child_process');
(async () => {
  const [, , W = '1280', H = '800'] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } }); p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html'); await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('vaerelse')); await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('garderobe')); await p.waitForFunction(() => __spil.room.id === 'garderobe' && window.__gard && __gard.ready && document.getElementById('door').classList.contains('gone'), null, { timeout: 120000 });
  const f = []; const tryk = async n => { await p.evaluate(n => { [...document.querySelectorAll('#tabs button')].find(b => b.textContent === n).click() }, n); await p.waitForTimeout(1500); const q = `${__dirname}/zoom-${n}.png`; await p.screenshot({ path: q }); f.push(q) };
  for (const n of ['Tøj', 'Hat', 'Hår', 'Ansigt', 'Støvler', 'Kæledyret']) await tryk(n);
  execSync(`python3 - <<'P'\nfrom PIL import Image\nf=${JSON.stringify(f)}\nims=[Image.open(q) for q in f]\nw,h=ims[0].size\nk=640/w if w>h else 330/w\nims=[i.resize((int(w*k),int(h*k)),Image.LANCZOS) for i in ims]\nw,h=ims[0].size\nn=3 if w>h else 6\nA=Image.new('RGB',(w*n+4*n,(h+4)*((len(ims)+n-1)//n)),'#000')\nfor k2,i in enumerate(ims):A.paste(i,((k2%n)*(w+4),(k2//n)*(h+4)))\nA.save('${__dirname}/ark-zoom-${W}.png')\nP`);
  await b.close();
})();
