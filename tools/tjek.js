/* Kontaktark over alle kombinationer af tilbehør — kør ved HVER ny version og hvert nyt stykke tilbehør.
   Brug:  node build.js && node tools/tjek.js [mappe]      (kræver Playwright)
   Laver PNG-ark i mappen (standard tools/ud/), som gennemses ét for ét:
   - dyr_<mønster>.png : alle dyr × siddende/gående × hvert dyre-tilbehør alene + alle på én gang
   - figur_hoved.png      : alle pandehår × alle hatte (og briller)
   - figur_haar_hat.png   : alle baghår × alle hatte
   - figur_haar_kappe.png : alle baghår × alle kapper
   - figur_kjole_kappe.png: alle kjoler × alle kapper
   - figur_kjole_fod.png  : alle kjoler × alt fodtøj
   - figur_tilbehoer.png  : hvert tilbehør alene og i store kombinationer × alle baghår
   - figur_vink.png       : vinkende arm × kjoler, kapper, hatte og hånd-tilbehør (i browseren, med animation)
   Se efter: noget der ligger oven på noget forkert, svæver, er skjult, eller dækker øjne/ansigt. */
const path = require('path'), fs = require('fs'), { chromium } = require('playwright');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ud')); fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.route(/fonts\./, r => r.abort());
  await p.goto(PAGE); await p.waitForTimeout(300);
  const sheet = async (file, fn, arg) => { await p.evaluate(fn, arg); await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, file), fullPage: true }); console.log('→', file); };
  const grid = `(cols, cell, rows) => { let h = '<div style="display:grid;grid-template-columns:120px repeat('+cols.length+','+cell+'px);gap:2px;background:#fff;font:13px sans-serif"><div></div>' + cols.map(c=>'<b>'+c+'</b>').join('');
    for (const [lab, svgs] of rows){ h += '<b>'+lab+'</b>' + svgs.map(s=>'<img style="width:'+cell+'px;height:'+cell+'px;background:#f3eef8" src="data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)+'">').join(''); }
    document.body.innerHTML = h + '</div>'; document.body.style.margin = 0; }`;
  await p.evaluate(`window.GRID = ${grid}`);
  for (const pat of Object.keys(await p.evaluate(() => PET_PATTERNS)))
    await sheet(`dyr_${pat}.png`, pat => {
      const acc = Object.keys(PET_ACC), sets = [['intet', {}], ...acc.map(k => [k, { [k]: PET_ACC[k].color }]), ['alle', Object.fromEntries(acc.map(k => [k, PET_ACC[k].color]))]];
      const rows = [];
      for (const kind of Object.keys(PET_KINDS).filter(k => k !== 'ingen')) for (const mode of ['sidder', 'går']) rows.push([kind + ' ' + mode, sets.map(([, a]) => {
        const st = JSON.parse(JSON.stringify(DEFAULT_STATE)); st.pet.kind = kind; st.pet.acc = a; st.pet.pattern = pat;
        return renderDoll(st, { petOnly: true, petMode: mode === 'går' ? 'walk' : undefined, viewBox: '470 720 380 360', anim: false }); })]);
      GRID(sets.map(s => s[0]), 170, rows); }, pat);
  const F = (fn) => `(() => { const ks = o => Object.keys(o); const base = JSON.parse(JSON.stringify(DEFAULT_STATE)); base.pet.kind = 'ingen'; const S = (f) => { const st = JSON.parse(JSON.stringify(base)); f(st); return st; }; (${fn})(base, S); })()`;
  const ks = o => Object.keys(o);
  await sheet('figur_hoved.png', F((base, S) => { const cols = [...ks(HATS), 'briller']; GRID(cols, 150, ks(FRONT).map(f => [f, cols.map(h => renderDoll(S(st => { st.front = f; st.acc = {}; if (h === 'briller'){ st.hat.id = 'spids'; st.acc = { briller: ACC.briller.color }; } else st.hat.id = h; }), { viewBox: '170 20 460 480', pet: false }))])); }));
  await sheet('figur_haar_hat.png', F((base, S) => GRID(ks(HATS), 150, ks(BACK).map(bk => [bk, ks(HATS).map(h => renderDoll(S(st => { st.back = bk; st.hat.id = h; st.acc = {}; }), { viewBox: '130 20 540 760', pet: false }))]))));
  await sheet('figur_haar_kappe.png', F((base, S) => GRID(ks(CAPES), 150, ks(BACK).map(bk => [bk, ks(CAPES).map(k => renderDoll(S(st => { st.back = bk; st.cape.id = k; st.hat.id = 'ingen'; }), { viewBox: '120 30 560 1050', pet: false }))]))));
  await sheet('figur_kjole_kappe.png', F((base, S) => GRID(ks(CAPES), 150, ks(ROBES).map(r => [r, ks(CAPES).map(k => renderDoll(S(st => { st.robe.id = r; st.cape.id = k; }), { viewBox: '120 30 560 1050', pet: false }))]))));
  await sheet('figur_kjole_fod.png', F((base, S) => GRID(ks(BOOTS), 150, ks(ROBES).map(r => [r, ks(BOOTS).map(bt => renderDoll(S(st => { st.robe.id = r; st.boots.id = bt; st.cape.id = 'ingen'; }), { viewBox: '200 600 400 460', pet: false }))]))));
  await sheet('figur_tilbehoer.png', F((base, S) => {
    const sets = [['intet', {}], ...ks(ACC).map(k => [k, { [k]: ACC[k].color }]),
      ['stav+bog+bælte+tørklæde+briller', { stav:'#5FD0FF', bog:'#7B4FD0', baelte:'#8A4B2E', toerklaede:'#E0457A', briller:'#B98516' }],
      ['tryllestav+bog+kæde+bælte', { tryllestav:'#FFC02E', bog:'#2F8F86', halskaede:'#F2C14E', baelte:'#3A2340' }]];
    GRID(ks(BACK), 150, sets.map(([lab, a]) => [lab, ks(BACK).map(bk => renderDoll(S(st => { st.back = bk; st.acc = a; }), { viewBox: '120 30 560 1050', pet: false }))])); }));
  await sheet('figur_vink.png', F((base, S) => {
    const rows = [...ks(ROBES).map(r => [r, st => { st.robe.id = r; }]), ...ks(CAPES).map(k => ['kappe ' + k, st => { st.cape.id = k; }]), ...ks(HATS).map(h => ['hat ' + h, st => { st.hat.id = h; }])];
    const cols = [['stav', { stav:'#5FD0FF' }], ['tryllestav', { tryllestav:'#FFC02E' }], ['tom hånd', {}], ['tørklæde', { toerklaede:'#E0457A' }]];
    GRID(cols.map(c => c[0]), 130, rows.map(([lab, f]) => [lab, cols.map(([, a]) => renderDoll(S(st => { f(st); st.acc = a; }), { viewBox: '60 30 680 1050', pet: false, anim: true, wave: true }))])); }));
  await b.close();
})();
