const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.goto('file:///home/claude/glimmerstudio/dist/index.html'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => { try { Koncert.show(); return 'ok ' + JSON.stringify(Object.keys(Koncert.STILE || {})) } catch (e) { return 'ERR ' + e.message } }));
  await p.waitForTimeout(4000); await p.screenshot({ path: __dirname + '/konc-nu.png' }); await b.close();
})();
