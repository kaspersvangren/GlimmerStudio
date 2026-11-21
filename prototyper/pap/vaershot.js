/* tager et udsnit af værelset for hver slags på en plads og samler dem i ark: node vaershot.js [plads,plads] [farve] */
const { chromium } = require('playwright'); const { execSync } = require('child_process');
const KLIP = { vaeg: [0, 0, 1280, 800], vindue: [40, 20, 420, 360], seng: [10, 60, 500, 680], hylde: [680, 120, 320, 320], lampe: [400, 0, 880, 270], gulv: [300, 590, 720, 210], ting: [800, 230, 360, 540], dyreseng: [640, 470, 330, 310] };
(async () => {
  const kun = (process.argv[2] || Object.keys(KLIP).join(',')).split(','), farve = process.argv[3] || null;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) console.log('konsol', m.text().slice(0, 400)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('vaerelse'));
  await p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.evaluate(() => { document.getElementById('toast').style.display = 'none'; document.getElementById('bar').style.display = 'none' });
  const valg = await p.evaluate(() => Object.fromEntries(Object.entries(__spil.RUMVALG).map(([k, o]) => [k, o.list.map(w => w[0])])));
  for (const s of kun) { const [x, y, w, h] = KLIP[s]; const filer = [];
    for (const v of valg[s]) { let fejl = null; try { await p.evaluate(([s, v, c]) => __spil.room.ctx.test(s, v, c), [s, v, farve]) } catch (e) { fejl = e.message.split('\n')[0]; console.log('FEJL i', s, v, fejl) }
      await p.waitForTimeout(900); const f = `${__dirname}/vs-${s}-${v}.png`; await p.screenshot({ path: f, clip: { x, y, width: w, height: h } }); filer.push(f) }
    execSync(`python3 - <<'P'\nfrom PIL import Image\nf=${JSON.stringify(filer)}\nims=[Image.open(q) for q in f]\nw,h=ims[0].size\nk=min(1,480/w)\nims=[i.resize((int(w*k),int(h*k)),Image.LANCZOS) for i in ims]\nw,h=ims[0].size\nA=Image.new('RGB',(w*5+16,h*2+4),'#000')\nfor n,i in enumerate(ims):A.paste(i,((n%5)*(w+4),(n//5)*(h+4)))\nA.save('${__dirname}/ark-${s}.png')\nP`);
    await p.evaluate(([s, v]) => __spil.room.ctx.test(s, v), [s, valg[s][0]]); console.log('ark', s) }
  await b.close();
})();
