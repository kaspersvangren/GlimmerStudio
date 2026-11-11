/* Billeder til gennemgangssiden ("Tegnebordet").
   Brug:  node build.js && node tools/gennemgang.js      (kræver Playwright)
   Laver tools/gennemgang/items.json og tools/gennemgang/img/<id>-t.jpg (som på tabletten) og <id>-z.jpg (tæt på).
   Hver ting har en version (v). Når en ting rettes, hæves dens v her, så siden viser den som "rettet – se igen".
   Nye ting tilføjes i ITEMS nedenfor. */
const path = require('path'), fs = require('fs'), { chromium } = require('playwright');
const OUT = path.join(__dirname, 'gennemgang'), IMG = path.join(OUT, 'img');
fs.mkdirSync(IMG, { recursive: true });
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');

/* versioner: hæv tallet for en ting, når den er rettet efter en fejlmelding */
const V = { 'acc-bog': 6,
  /* v0.9.2: rettet efter første gennemgang */
  'acc-briller': 2, 'hat-hue': 2, 'hat-knaek': 2, 'hat-kort': 2, 'hat-spids': 2, 'maerke-fregner': 2, 'maerke-glimmer': 2, 'maerke-hjerte': 2, 'maerke-stjerne': 2,
  'sko-hoeje': 2, 'sko-snoer': 2,
  /* v0.9.3: rettet efter anden gennemgang — håret foran er nu én form, så alle frisurer er tegnet om */
  'pande-side': 3, 'pande-lige': 3, 'pande-midt': 3, 'pande-pjusket': 3, 'pande-tilbage': 3,
  'bag-langt': 2, 'bag-kort': 2, 'bag-hestehale': 3, 'bag-fletninger': 2, 'bag-knolde': 2, 'bag-kroeller': 3,
  'kappe-haette': 3, 'acc-halskaede': 3, 'acc-tryllestav': 3, 'pose-vink': 4, 'pose-ro': 4 };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  await p.route(/fonts\./, r => r.abort());
  await p.goto(PAGE); await p.waitForTimeout(300);
  /* tingene defineres i siden, hvor katalogerne findes */
  const items = await p.evaluate(() => {
    const zoomVB = tab => { const z = ZOOM[tab]; const w = z[2], h = w * 1100 / 800; const x = clamp(z[0] - w/2, 0, 800 - w), y = clamp(z[1] - h/2, 0, 1100 - h + 120); return `${x.toFixed(1)} ${y.toFixed(1)} ${w} ${h.toFixed(1)}`; };
    const FULL = '0 0 800 1100';
    const out = [];
    const add = (id, cat, title, patch, tab, zvb, opts = {}) => out.push({ id, cat, title, patch, vbT: tab ? zoomVB(tab) : FULL, vbZ: zvb, opts });
    const lab = o => k => typeof o[k] === 'string' ? o[k] : o[k].label;
    for (const k of Object.keys(FRONT)) add('pande-' + k, 'Pandehår', lab(FRONT)(k), { front: k, hat: { id: 'ingen' } }, 'pande', '230 230 340 260');
    for (const k of Object.keys(BACK)) add('bag-' + k, 'Baghår', lab(BACK)(k), { back: k, hat: { id: 'ingen' } }, 'bag', '160 120 480 680');
    for (const k of Object.keys(HATS)) add('hat-' + k, 'Hatte', lab(HATS)(k), { hat: { id: k } }, 'hat', '150 20 500 360');
    for (const k of Object.keys(ROBES)) add('kjole-' + k, 'Kjoler', lab(ROBES)(k), { robe: { id: k }, cape: { id: 'ingen' } }, 'kjole', '200 470 400 560');
    for (const k of Object.keys(CAPES)) add('kappe-' + k, 'Kapper', lab(CAPES)(k), k === 'haette' ? { cape: { id: k }, hat: { id: 'ingen' } } : { cape: { id: k } }, 'kappe', '140 220 520 820');
    for (const k of Object.keys(BOOTS)) add('sko-' + k, 'Fodtøj', lab(BOOTS)(k), { boots: { id: k }, robe: { id: 'kort' } }, 'sko', '270 880 260 180');
    for (const k of Object.keys(ACC)) add('acc-' + k, 'Tilbehør', ACC[k].label, { acc: { [k]: ACC[k].color } }, null, ACC_VB[k] || FULL);
    for (const k of Object.keys(PUPILS)) add('pupil-' + k, 'Øjne', 'Pupiller: ' + PUPILS[k], { eyes: { pupil: k } }, 'oejne', '330 360 140 80');
    for (const k of Object.keys(LIPSHAPES)) add('mund-' + k, 'Ansigt', 'Mund: ' + LIPSHAPES[k], { mk: { lipShape: k } }, 'ansigt', '350 420 100 70');
    for (const k of Object.keys(MARKS)) add('maerke-' + k, 'Ansigt', 'Mærke: ' + MARKS[k], { mk: { mark: k, markColor: '#E0457A' } }, 'ansigt', '300 370 200 140');
    add('pose-ro', 'Stillinger', 'Hænderne i ro', { acc: {} }, null, '250 680 300 160');
    add('pose-vink', 'Stillinger', 'Vinker', { acc: {} }, null, '150 220 300 300', { wave: true });
    return out;
  });
  for (const it of items) it.v = V[it.id] || 1;
  /* hver ting tegnes to gange: som på tabletten (skaberens spejl) og tæt på */
  for (const it of items){
    for (const [suf, vb, w] of [['t', it.vbT, 560], ['z', it.vbZ, 640]]){
      const h = await p.evaluate(({ it, vb, w }) => {
        const st = enforce ? JSON.parse(JSON.stringify(DEFAULT_STATE)) : null;
        for (const [k, v] of Object.entries(it.patch)) st[k] = (v && typeof v === 'object' && !Array.isArray(v) && k !== 'acc') ? Object.assign({}, st[k], v) : v;
        const [, , vw, vh] = vb.split(' ').map(Number), hh = Math.round(w * vh / vw);
        document.body.innerHTML = `<div id="shot" style="width:${w}px;height:${hh}px;background:linear-gradient(#FFF3F8,#EBDDFF)"><img style="width:100%;height:100%;display:block" src="${svgUrl(renderDoll(st, Object.assign({ viewBox: vb, pet: false, anim: !!it.opts.wave }, it.opts)))}"></div>`;
        document.body.style.margin = 0; return hh;
      }, { it, vb, w });
      await p.waitForTimeout(it.opts.wave ? 500 : 80);
      await p.locator('#shot').screenshot({ path: path.join(IMG, `${it.id}-${suf}.jpg`), type: 'jpeg', quality: 82 });
    }
  }
  fs.writeFileSync(path.join(OUT, 'items.json'), JSON.stringify({ made: new Date().toISOString(), version: await p.evaluate(() => VERSION), items: items.map(({ id, cat, title, v }) => ({ id, cat, title, v })) }, null, 1));
  console.log('ting:', items.length);
  await b.close();
})();
