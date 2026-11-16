/* Prøvetryk af værelsets ting: hele værelset med tingen, beskåret til tingens udsnit.
   Brug: node build.js && node tools/rumproeve.js ud.png plads id1,id2,...  [bredde] */
const path = require('path'), { chromium } = require('playwright');
const [out, slot, ids, W] = [process.argv[2], process.argv[3], process.argv[4].split(','), +(process.argv[5] || 300)];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } }); await p.route(/fonts\./, r => r.abort());
  p.on('pageerror', e => console.log('FEJL', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../dist/index.html')); await p.waitForTimeout(300);
  await p.evaluate(({ slot, ids, W, VBX }) => { const process = { env: { VB: VBX } };
    const cells = ids.map(id => { const r = Object.assign({}, ROOM_DEFAULT, { [slot]: id }); r.c = Object.assign({}, ROOM_DEFAULT.c); const vb = process.env.VB || ROOM_VB[slot], [, , vw, vh] = vb.split(' ').map(Number);
      return `<div style="display:inline-block;margin:4px;text-align:center;font:600 13px sans-serif;vertical-align:top"><img style="width:${W}px;height:${Math.round(W*vh/vw)}px;display:block" src="data:image/svg+xml;utf8,${encodeURIComponent(roomSvg(r, { viewBox: vb }))}">${id}</div>`; });
    document.body.innerHTML = `<div id="s" style="display:inline-block;background:#fff;padding:6px;max-width:1580px">${cells.join('')}</div>`; document.body.style.margin = 0;
  }, { slot, ids, W, VBX: process.env.VB || '' });
  await p.waitForTimeout(300); await p.locator('#s').screenshot({ path: out }); await b.close(); })();
