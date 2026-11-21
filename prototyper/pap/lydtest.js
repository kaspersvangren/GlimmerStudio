/* lyden: en lille server giver siden og lydmappen, som de ligger på nettet; så trykkes der rundt, og det tjekkes, at musikken skifter og filerne hentes */
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
(async () => {
  const LYDDIR = '/home/claude/glimmerstudio/lyd', hentet = [];
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = null; if (u.startsWith('/lyd/')) { f = path.join(LYDDIR, path.basename(u)); hentet.push(path.basename(u)) } else if (u.startsWith('/prototyper/pap/')) f = path.join(__dirname, path.basename(u));
    if (!f || !fs.existsSync(f)) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.mp3') ? 'audio/mpeg' : 'text/plain' }); fs.createReadStream(f).pipe(r) });
  await new Promise(ok => srv.listen(0, ok)); const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error' && !/GL Driver|supabase|ERR_/.test(m.text())) console.log('konsol', m.text().slice(0, 300)) });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort()); await p.route(/supabase/, r => r.fulfill({ status: 201, body: '' }));
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto(`http://localhost:${port}/prototyper/pap/testspil.html`);
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const st = () => p.evaluate(() => { const s = LYDTEST(); return `${s.musik}${s.spiller ? ' (spiller)' : ' (venter)'} · stemning ${s.stemning}${s.stemSpiller ? ' (spiller)' : ''} · ${s.tilstand}` });
  const inde = () => p.waitForFunction(() => __spil.room && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, null, { timeout: 120000 });
  await p.mouse.click(640, 700); await p.waitForTimeout(5000); console.log('kortet:', await st());
  for (const rum of ['arkade', 'gnom', 'eliksir', 'koncert']) { if (await p.evaluate(() => !!__spil.room)) { await p.evaluate(() => __spil.leave()); await p.waitForFunction(() => !__spil.room && document.getElementById('door').classList.contains('gone'), null, { timeout: 60000 }) }
    await p.evaluate(r => __spil.enter(r), rum); await inde(); await p.waitForTimeout(6000); console.log(rum + ':', await st()) }
  await p.evaluate(() => [...document.querySelectorAll('#songs button')].find(x => /rock/i.test(x.textContent)).click()); await p.waitForFunction(() => /koncert\.rock/.test(LYDTEST().musik || ''), null, { timeout: 180000 }).catch(() => console.log('rock kom ikke i gang')); await p.waitForTimeout(4000); console.log('ønske rock:', await st());
  console.log('hentede filer:', [...new Set(hentet)].join(', ')); await b.close(); srv.close();
})();
