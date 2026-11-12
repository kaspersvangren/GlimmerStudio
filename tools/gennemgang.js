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
  /* v0.9.4: tredje gennemgang — striberne i sidehåret løber ud i spidser */
  'pande-side': 4, 'pande-lige': 4, 'pande-midt': 4, 'pande-pjusket': 4, 'pande-tilbage': 4, 'bag-langt': 3, 'bag-kort': 3, 'bag-hestehale': 4,
  'bag-fletninger': 3, 'bag-knolde': 3, 'bag-kroeller': 4, 'hat-hue': 3, 'acc-halskaede': 4, 'acc-tryllestav': 4, 'pose-vink': 5,
  /* v0.9.5: fjerde gennemgang */
  'bag-knolde': 4, 'hat-hue': 4, 'pose-vink': 6,
  /* v0.9.6: vink fjernet; tryllestav i stavens greb */
  'acc-tryllestav': 5, 'acc-halskaede': 5, 'bag-knolde': 5, 'hat-hue': 5,
  /* v0.12.0: mere dunkelt; værelsets ting rettet efter gennemgangen */
  'rum-seng-enkel': 2, 'rum-seng-himmelseng': 2, 'rum-seng-skyseng': 2, 'rum-seng-maaneseng': 2, 'rum-vindue-gardiner': 2, 'rum-vindue-stjernegardiner': 2, 'rum-vindue-farvet': 2, 'rum-vaeg-blomster': 2, 'rum-vaeg-maaner': 2, 'rum-hylde-boeger': 2, 'rum-hylde-krystaller': 2, 'rum-hylde-planter': 2, 'rum-lampe-lys': 2, 'rum-lampe-maanelampe': 2, 'rum-lampe-stjernelampe': 2, 'rum-ting-globus': 2, 'rum-ting-kost': 2, 'rum-ting-plante': 2, 'rum-dyreseng-kurv': 2, 'rum-dyreseng-slot': 2, 'rum-gulv-sky': 2, 'boble-toej': 2, 'boble-rum': 2, 'nisse': 2, 'sted-butik': 2, 'sted-garderobe': 2, 'sted-vaerelse': 2, 'start-scene': 2,
  /* v0.12.1: anden runde — ildfluer, gammel nisse, skrivebord mod væggen */
  'boble-rum': 3, 'boble-toej': 4, 'nisse': 5, 'rum-dyreseng-slot': 4, 'rum-lampe-maanelampe': 3, 'rum-ting-globus': 7, 'sted-vaerelse': 5, 'start-scene': 3, 'sted-butik': 3,
  'kappe-haette': 3, 'pose-ro': 4,
  /* v0.14.0: skolen erstatter Modehuset */
  'sted-by': 2,
  /* v0.15.0: kosteflyvning */
  'sted-skole': 2, 'sted-kost': 3, 'kost-rytter': 2 };

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
    /* værelset: hele rummet med tingen (som på tabletten) og tingen tæt på */
    for (const s of ROOM_SLOTS) for (const k of Object.keys(s.cat))
      out.push({ id: 'rum-' + s.id + '-' + k, cat: 'Værelset', title: s.label + ': ' + s.cat[k].label, kind: 'rum', slot: s.id, item: k, vbT: '0 0 1600 1000', vbZ: ROOM_VB[s.id] });
    for (const b of BUBBLES) out.push({ id: 'boble-' + b.id, cat: 'Boblebutikken', title: 'Boble: ' + b.label, kind: 'boble', bub: b.id, vbT: '0 0 300 300', vbZ: '0 0 300 300' });
    /* stederne som hele skærme */
    out.push({ id: 'sted-vaerelse', cat: 'Steder', title: 'Værelset med skrivebord og bog', kind: 'sted', fn: 'room', vbT: '0 0 1600 1000', vbZ: '940 470 360 360' });
    out.push({ id: 'sted-garderobe', cat: 'Steder', title: 'Garderoben', kind: 'sted', fn: 'ward', vbT: '0 0 1600 1000', vbZ: '20 120 560 800' });
    out.push({ id: 'sted-butik', cat: 'Steder', title: 'Boblebutikken', kind: 'sted', fn: 'shop', vbT: '0 0 1600 1000', vbZ: '40 280 860 580' });
    out.push({ id: 'sted-by', cat: 'Steder', title: 'Byen i skumringen', kind: 'sted', fn: 'town', vbT: '0 0 1600 1000', vbZ: '300 0 700 420' });
    out.push({ id: 'nisse', cat: 'Steder', title: 'Nissen bag disken', kind: 'sted', fn: 'shop', vbT: '0 0 1600 1000', vbZ: '880 60 380 480' });
    out.push({ id: 'sted-skole', cat: 'Skolen', title: 'Skolegangen med dørene til fagene', kind: 'sted', fn: 'school', vbT: '0 0 1600 1000', vbZ: '180 80 460 760' });
    out.push({ id: 'sted-eliksir', cat: 'Skolen', title: 'Eliksirtimen', kind: 'sted', fn: 'potion', vbT: '0 0 1600 1000', vbZ: '440 180 760 800' });
    out.push({ id: 'professor', cat: 'Skolen', title: 'Professor Mosegrøn (elver, eliksirlærer)', kind: 'sted', fn: 'potion', vbT: '1060 0 540 1000', vbZ: '1250 340 300 300' });
    out.push({ id: 'ingredienser', cat: 'Skolen', title: 'Ingredienserne på hylden', kind: 'sted', fn: 'potion', vbT: '0 120 480 760', vbZ: '30 180 440 400' });
    out.push({ id: 'sted-kost', cat: 'Skolen', title: 'Kosteflyvning: banen', kind: 'sted', fn: 'kost', vbT: '0 0 1600 1000', vbZ: '180 280 640 440' });
    out.push({ id: 'kost-rytter', cat: 'Skolen', title: 'Figuren på kosten, set fra siden', kind: 'sted', fn: 'rider', vbT: '-280 -340 560 480', vbZ: '-40 -260 240 240' });
    out.push({ id: 'kaptajn-sky', cat: 'Skolen', title: 'Kaptajn Sky (flyvelærer)', kind: 'sted', fn: 'sky', vbT: '150 40 500 1030', vbZ: '200 140 400 400' });
    out.push({ id: 'skole-i-byen', cat: 'Skolen', title: 'Skolens port i byen', kind: 'sted', fn: 'town', vbT: '500 0 600 420', vbZ: '600 20 400 360' });
    out.push({ id: 'start-scene', cat: 'Startskærm', title: 'Nattehimmel og skolen', kind: 'start', vbT: '0 0 1600 1000', vbZ: '120 120 640 720' });
    return out;
  });
  for (const it of items) it.v = V[it.id] || 1;
  /* hver ting tegnes to gange: som på tabletten (skaberens spejl) og tæt på */
  for (const it of items){
    for (const [suf, vb, w] of [['t', it.vbT, 560], ['z', it.vbZ, 640]]){
      const h = await p.evaluate(({ it, vb, w }) => {
        const [, , vw, vh] = vb.split(' ').map(Number), hh = Math.round(w * vh / vw);
        let svg, bg = 'linear-gradient(#FFF3F8,#EBDDFF)';
        if (it.kind === 'rum'){ const r = Object.assign({}, ROOM_DEFAULT, { [it.slot]: it.item }); r.c = Object.assign({}, ROOM_DEFAULT.c); svg = roomSvg(r, { viewBox: vb }); }
        else if (it.kind === 'boble'){ svg = bubbleSvg(it.bub); bg = 'linear-gradient(#1E1660,#3E2A92 70%,#6A3AA6)'; }
        else if (it.kind === 'sted'){
          if (!figures.length){ const f = { id:'t', name:'Agnes', st: JSON.parse(JSON.stringify(DEFAULT_STATE)), t: 1 }; figures.push(f); }
          svg = (it.fn === 'room' ? roomScene(getRoom()) : it.fn === 'ward' ? wardScene() : it.fn === 'town' ? (CITY_OVR.time = 'aften', townSvg()) : it.fn === 'school' ? schoolScene() : it.fn === 'kost' ? Kost.previewSvg() : it.fn === 'sky' ? Kost.teacherSvg(vb) : it.fn === 'rider' ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${Kost.riderSvg(JSON.parse(JSON.stringify(DEFAULT_STATE)))}</svg>` : it.fn === 'potion' ? (POT.lesson = { n: 0, stars: 0 }, POT.mates = [randomGuest([]), randomGuest(['x'])], POT.p = makeRecipe(), POT.p.steps = [{ kind:'ing', id:'blad', n:2 }, { kind:'ing', id:'stjerne', n:1 }, { kind:'ror', n:3 }], potionScene().replace('<g class="recipe"></g>', '<g class="recipe">' + recipeSvg(POT.p) + '</g>').replace('<div xmlns="http://www.w3.org/1999/xhtml" class="say-text"></div>', '<div xmlns="http://www.w3.org/1999/xhtml" style="font:600 30px sans-serif;color:#3A2340;text-align:center;padding-top:40px">I dag brygger vi Svæveeliksir!</div>').replace('style="--liq:#3E6A5A"', '')) : shopScene()).replace('viewBox="0 0 1600 1000"', `viewBox="${vb}"`).replace('class="scene" ', '').replace('id="townSvg" ', '');
          if (it.fn === 'shop') svg = svg.replace('<div xmlns="http://www.w3.org/1999/xhtml" class="say-text"></div>', '<div xmlns="http://www.w3.org/1999/xhtml" style="font:600 25px sans-serif;color:#3A2340;text-align:center;padding-top:30px">Goddag, goddag! Velkommen i Boblebutikken.</div>');
        }
        else if (it.kind === 'start'){ svg = titleScene().replace('viewBox="0 0 1600 1000"', `viewBox="${vb}"`).replace('xMidYMax slice', 'xMidYMid meet'); }
        else {
          const st = JSON.parse(JSON.stringify(DEFAULT_STATE));
          for (const [k, v] of Object.entries(it.patch)) st[k] = (v && typeof v === 'object' && !Array.isArray(v) && k !== 'acc') ? Object.assign({}, st[k], v) : v;
          svg = renderDoll(st, Object.assign({ viewBox: vb, pet: false, anim: !!it.opts.wave }, it.opts));
        }
        document.body.innerHTML = `<div id="shot" style="width:${w}px;height:${hh}px;background:${bg}"><img style="width:100%;height:100%;display:block" src="${svgUrl(svg)}"></div>`;
        document.body.style.margin = 0; return hh;
      }, { it, vb, w });
      await p.waitForTimeout(it.opts && it.opts.wave ? 500 : 80);
      await p.locator('#shot').screenshot({ path: path.join(IMG, `${it.id}-${suf}.jpg`), type: 'jpeg', quality: 82 });
    }
  }
  fs.writeFileSync(path.join(OUT, 'items.json'), JSON.stringify({ made: new Date().toISOString(), version: await p.evaluate(() => VERSION), items: items.map(({ id, cat, title, v }) => ({ id, cat, title, v })) }, null, 1));
  console.log('ting:', items.length);
  await b.close();
})();
