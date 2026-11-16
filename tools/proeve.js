/* Hurtige prøvetryk af figuren med bestemte ting på (til at tegne nye ting).
   Brug: node build.js && node tools/proeve.js ud.png '[{"t":"Navn","p":{"robe":{"id":"x"}},"vb":"200 470 400 560"}, ...]' [bredde]
   Uden vb vises hele figuren. Flere farver: "p" kan sætte a/b. */
const path = require('path'), { chromium } = require('playwright');
const [out, json, W] = [process.argv[2], process.argv[3], +(process.argv[4] || 300)];
const list = JSON.parse(json);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.route(/fonts\./, r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../dist/index.html')); await p.waitForTimeout(300);
  await p.evaluate(({ list, W }) => {
    const cells = list.map(it => {
      const st = JSON.parse(JSON.stringify(DEFAULT_STATE));
      for (const [k, v] of Object.entries(it.p || {})) st[k] = (v && typeof v === 'object' && !Array.isArray(v) && k !== 'acc') ? Object.assign({}, st[k], v) : v;
      const vb = it.vb || '0 0 800 1100', [, , vw, vh] = vb.split(' ').map(Number);
      return `<div style="display:inline-block;margin:4px;text-align:center;font:600 14px sans-serif;vertical-align:top"><div style="width:${W}px;height:${Math.round(W*vh/vw)}px;background:linear-gradient(#FFF3F8,#EBDDFF)">${renderDoll(st, it.po ? { viewBox: vb, petOnly: true } : { viewBox: vb, pet: false })}</div>${it.t || ''}</div>`;
    });
    document.body.innerHTML = `<div id="sheet" style="display:inline-block;background:#fff;padding:6px;max-width:1580px">${cells.join('')}</div>`; document.body.style.margin = 0;
    document.querySelectorAll('#sheet svg').forEach(s => { s.style.width = '100%'; s.style.height = '100%'; });
  }, { list, W });
  await p.waitForTimeout(150);
  await p.locator('#sheet').screenshot({ path: out });
  await b.close();
})();
