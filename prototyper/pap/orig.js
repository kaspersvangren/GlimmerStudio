const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto('file:///home/claude/glimmerstudio/dist/index.html'); await p.waitForTimeout(3000);
  const svg = await p.evaluate(() => { try { return renderDoll(heroState(), { viewBox: '40 40 720 1010' }) } catch (e) { return 'ERR ' + e.message } });
  if (!svg.startsWith('ERR')) { await p.setContent('<body style="margin:0;background:#2a2040">' + svg.replace('<svg', '<svg width="720" height="1010"') + '</body>'); await p.setViewportSize({ width: 720, height: 1010 }); await p.waitForTimeout(500) }
  else console.log(svg);
  await p.screenshot({ path: __dirname + '/orig.png' }); await b.close();
})();
