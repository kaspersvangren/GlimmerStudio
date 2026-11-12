/* Spiller alle steder og fag igennem automatisk og melder fejl. Kør efter hver ændring:
   node build.js && node tools/spiltest.js
   Stopper med fejlkode, hvis noget går galt, så intet nyt fag kan ødelægge et andet uden at det opdages. */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SIZES = [[780, 360], [1180, 820]];
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function run(w, h){
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.route(/fonts\./, r => r.abort()); await p.goto(URL); await p.waitForTimeout(400);
  const noScroll = async (name) => { const s = await p.evaluate(() => ({ sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth })); ok(s.sh <= h + 1 && s.sw <= w + 1, `${w}x${h} ${name}: siden ruller (${s.sw}x${s.sh})`); };
  const tag = `${w}x${h}`;
  await p.evaluate(() => { newFigure(); saveAll(); prog.stars = 100; saveProg(); });
  for (const [name, fn] of [['byen', 'showTown()'], ['værelset', 'showRoom()'], ['bogen', "openRoomBook('seng')"], ['garderoben', 'showHome()'], ['butikken', 'showBalls()'], ['skolen', 'showSchool()']]){
    await p.evaluate(fn); await p.waitForTimeout(500); await noScroll(name); }
  /* boble i butikken */
  await p.evaluate(() => showBalls()); await p.waitForTimeout(400);
  await p.click('#shopScene [data-hit="krukke:dyr"]', { force: true }); await p.waitForTimeout(1500);
  for (let i = 0; i < 3; i++){ await p.click('.shop-bub', { force: true }); await p.waitForTimeout(450); }
  await p.waitForTimeout(800); ok(await p.evaluate(() => !!document.querySelector('.shop-veil .reveal.magic')), `${tag} butikken: intet gevinstkort`); await noScroll('gevinstkort');
  /* eliksirtimen: en hel time */
  await p.evaluate(() => showPotions()); await p.waitForTimeout(800); await noScroll('eliksirtimen');
  const toScreen = (x, y) => p.evaluate(([x, y]) => { const svg = $('#potScene svg'), pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; }, [x, y]);
  for (let g = 0; g < 80; g++){
    const st = await p.evaluate(() => ({ busy: POT.busy, step: POT.p.steps[POT.p.i], done: !!document.querySelector('#potionBody .shop-veil') }));
    if (st.done) break;
    if (st.busy || !st.step){ await p.waitForTimeout(300); continue; }
    if (st.step.kind === 'ing'){ await p.click(`#potScene [data-hit="jar:${st.step.id}"]`, { force: true }); await p.waitForTimeout(750); }
    else { const pts = []; for (let k = 0; k <= 24 * (st.step.n + 0.3); k++){ const a = k / 24 * Math.PI * 2; pts.push(await toScreen(800 + Math.cos(a) * 150, 656 + Math.sin(a) * 30)); }
      await p.mouse.move(...pts[0]); await p.mouse.down(); for (const q of pts){ await p.mouse.move(...q); await p.waitForTimeout(8); } await p.mouse.up(); await p.waitForTimeout(300); }
  }
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => POT.lesson.n === 3 && !!document.querySelector('#potionBody .shop-veil')), `${tag} eliksirtimen: timen blev ikke færdig`);
  await noScroll('eliksir-slutkort');
  /* kosteflyvning: en hel tur med autopilot */
  await p.evaluate(() => { window.KOST_AUTO = true; Kost.show(); }); await p.waitForTimeout(500); await noScroll('kosteflyvning');
  let res = null; for (let i = 0; i < 400 && !res; i++){ await p.waitForTimeout(250); res = await p.evaluate(() => Kost.state().result || null); }
  ok(res && res.place >= 1, `${tag} kosteflyvning: turen blev ikke færdig`);
  ok(res && res.rings > 5, `${tag} kosteflyvning: autopiloten tog for få ringe (${res && res.rings})`);
  ok(res && res.boostRings <= res.loops * 3, `${tag} kosteflyvning: boostet tog ${res && res.boostRings} ringe efter ${res && res.loops} loop (max 3 pr. loop)`);
  ok(res && res.loops >= 1, `${tag} kosteflyvning: autopiloten fik intet loop`);
  await p.waitForTimeout(1500); await noScroll('kost-slutkort');
  ok(!errs.length, `${tag} fejl på siden:\n    ` + errs.join('\n    '));
  await b.close();
  console.log(`${tag}: eliksir ok, kost ${res ? `nr. ${res.place}, ${res.rings} ringe` : 'ikke færdig'}`);
}
(async () => {
  for (const [w, h] of SIZES) await run(w, h);
  if (fails.length){ console.error('FEJL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('Alt spillet igennem uden fejl.');
})();
