/* Kontaktark over alle kombinationer af tilbehør — kør ved HVER ny version og hvert nyt stykke tilbehør.
   Brug:  node build.js && node tools/tjek.js [mappe]      (kræver Playwright)
   Laver PNG-ark i mappen (standard tools/ud/), som gennemses ét for ét:
   - dyr_<mønster>.png : alle dyr × siddende/gående × hvert dyre-tilbehør alene + alle på én gang
   - dukke_hoved.png   : alle pandehår × alt hovedpynt
   - dukke_haar_top.png: alle frisurer × alle overdele
   - dukke_bund_sko.png: alle underdele × alle sko
   - dukke_top_hand.png: alle overdele × hals/hånd-tilbehør
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
  const doll = (cols, rowsSpec, vb) => ({ cols, rowsSpec, vb });
  await sheet('dukke_hoved.png', () => {
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE)); base.acc = {}; base.pet.kind = 'ingen';
    const head = ['intet', ...['tiara','katteoerer','spaender','sloejfe','kasket','briller'].filter(k => ACC[k])];
    GRID(head, 150, Object.keys(FRONT).map(f => [f, head.map(a => { const st = JSON.parse(JSON.stringify(base)); st.front = f; st.back = 'kort'; st.acc = a === 'intet' ? {} : { [a]: ACC[a].color }; return renderDoll(st, { viewBox: '130 90 540 540', anim: false }); })])); });
  await sheet('dukke_haar_top.png', () => {
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE)); base.acc = { halskaede: '#4B2A9A' }; base.pet.kind = 'ingen';
    GRID(Object.keys(TOPS), 150, Object.keys(BACK).map(bk => [bk, Object.keys(TOPS).map(t => { const st = JSON.parse(JSON.stringify(base)); st.back = bk; st.top = { id: t, a: '#62E0CB', b: '#FFE27A' }; return renderDoll(st, { viewBox: '40 80 720 900', anim: false }); })])); });
  await sheet('dukke_bund_sko.png', () => {
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE)); base.acc = {}; base.pet.kind = 'ingen';
    GRID(Object.keys(SHOES), 150, Object.keys(BOTTOMS).map(bt => [bt, Object.keys(SHOES).map(sh => { const st = JSON.parse(JSON.stringify(base)); st.bottom = { id: bt, a: '#2F6FE0', b: '#FFC02E' }; st.shoes = { id: sh, a: '#FF5FA8', b: '#FFE27A' }; return renderDoll(st, { viewBox: '230 700 340 380', anim: false }); })])); });
  await sheet('dukke_top_hand.png', () => {
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE)); base.pet.kind = 'ingen';
    const ex = [['halskæde',{halskaede:'#4B2A9A'}],['butterfly',{butterfly:'#C2272D'}],['taske',{taske:'#B79BFF'}],['stav',{stav:'#FFE27A'}],['armbånd+taske',{armbaand:'#FF5FA8',taske:'#B79BFF'}]];
    GRID(ex.map(e => e[0]), 150, Object.keys(TOPS).map(t => [t, ex.map(([, a]) => { const st = JSON.parse(JSON.stringify(base)); st.top = { id: t, a: '#62E0CB', b: '#FFE27A' }; st.acc = a; return renderDoll(st, { viewBox: '220 520 420 420', anim: false }); })])); });
  await b.close();
})();
