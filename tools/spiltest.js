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
  /* kosteflyvning: loop ved dobbeltringe — de situationer en spiller faktisk kommer i */
  const loopCase = (dx, dy) => p.evaluate(([dx, dy]) => {
    window.KOST_AUTO = false; Kost.show(); document.querySelectorAll('#broomBody .kf-veil').forEach(v => v.remove());
    const S = Kost.state(), lo = S.course.rings.find(r => r.dbl === 'lo');
    S.run = 'fly'; S.x = lo.x + dx; S.y = lo.y + dy; S.vy = 0;
    Kost.test.tryLoop();
    for (let i = 0; i < 200 && (S.loop || S.boost > 0 || i < 10); i++){ if (!S.loop) S.vy = 0; Kost.test.step(1 / 60); }
    return { boost: (S.loopN || 0) > 0, hi: S.seen.has(lo.pair), lo: S.seen.has(lo) };
  }, [dx, dy]);
  for (const [name, dx, dy, want] of [['lige i ringen', 0, 0, true], ['lidt før ringen', -120, 40, true], ['lige efter at have fløjet gennem den nederste', 150, -30, true], ['lidt for lavt', -60, 140, true], ['langt fra ringene', -700, 0, false], ['alt for højt', 0, -260, false]]){
    const r = await loopCase(dx, dy); ok(r.boost === want, `${tag} loop ${name}: boost=${r.boost}, ville have ${want} (nederste ${r.lo}, øverste ${r.hi})`); }
  /* og hvis man selv flyver gennem den nederste ring og først derefter holder fingeren nede */
  { const r = await p.evaluate(() => { window.KOST_AUTO = false; Kost.show(); document.querySelectorAll('#broomBody .kf-veil').forEach(v => v.remove());
      const S = Kost.state(), lo = S.course.rings.find(r => r.dbl === 'lo'); S.run = 'fly'; S.x = lo.x - 200; S.y = lo.y; S.vy = 0;
      let t = 0; while (S.x < lo.x + 1 && t < 3){ S.vy = 0; Kost.test.step(1 / 60); t += 1 / 60; }
      for (let i = 0; i < 15; i++){ S.vy = 0; Kost.test.step(1 / 60); }  /* holdetiden går */
      Kost.test.tryLoop(); for (let i = 0; i < 200 && (S.loop || i < 10); i++) Kost.test.step(1 / 60);
      return { boost: (S.loopN || 0) > 0, lo: S.seen.has(lo), hi: S.seen.has(lo.pair) }; });
    ok(r.boost, `${tag} loop efter at have fløjet gennem den nederste ring: intet boost (nederste ${r.lo}, øverste ${r.hi})`); }
  /* kosteflyvning: en hel tur med autopilot */
  await p.evaluate(() => { window.KOST_AUTO = true; Kost.show(); }); await p.waitForTimeout(500); await noScroll('kosteflyvning');
  let res = null; for (let i = 0; i < 400 && !res; i++){ await p.waitForTimeout(250); res = await p.evaluate(() => Kost.state().result || null); }
  ok(res && res.place >= 1, `${tag} kosteflyvning: turen blev ikke færdig`);
  ok(res && res.rings > 5, `${tag} kosteflyvning: autopiloten tog for få ringe (${res && res.rings})`);
  ok(res && res.boostRings <= res.loops * 3, `${tag} kosteflyvning: boostet tog ${res && res.boostRings} ringe efter ${res && res.loops} loop (max 3 pr. loop)`);
  ok(res && res.loops >= 1, `${tag} kosteflyvning: autopiloten fik intet loop`);
  await p.waitForTimeout(1500); await noScroll('kost-slutkort');
  /* faldskærm: et helt spring med autopilot, fra kortet til landingen */
  await p.evaluate(() => { window.FALD_AUTO = true; FAG.find(f => f.id === 'faldskaerm').open(); }); await p.waitForTimeout(400); await noScroll('faldskærm');
  ok(await p.evaluate(() => !$('#fald').hidden), `${tag} faldskærm: døren i gangen åbnede ikke faget`);
  let fr = null; for (let i = 0; i < 300 && !(fr && fr.done); i++){ await p.waitForTimeout(200); fr = await p.evaluate(() => Fald.state().result || null); }
  ok(fr && fr.done, `${tag} faldskærm: springet blev ikke færdigt`);
  ok(fr && fr.bubbles > 0, `${tag} faldskærm: autopiloten fik ingen stjernebobler`);
  ok(fr && fr.d < 40, `${tag} faldskærm: autopiloten landede ${fr && fr.d} m fra målet`);
  await noScroll('fald-slutkort');
  await p.evaluate(() => { window.FALD_AUTO = false; Fald.stop(); });
  ok(!errs.length, `${tag} fejl på siden:\n    ` + errs.join('\n    '));
  await b.close();
  console.log(`${tag}: eliksir ok, kost ${res ? `nr. ${res.place}, ${res.rings} ringe` : 'ikke færdig'}, faldskærm ${fr && fr.done ? `${fr.d} m fra midten, ${fr.bubbles} bobler` : 'ikke færdig'}`);
}
/* startknappen skal virke, selvom den hopper under fingeren (det sker, når telefonens bjælker dukker op) */
async function playJump(){
  const { devices } = require('playwright');
  const b = await chromium.launch(), ctx = await b.newContext({ ...devices['Pixel 7 landscape'] }), p = await ctx.newPage();
  await p.route(/fonts\./, r => r.abort()); await p.goto(URL); await p.waitForTimeout(600);
  const cdp = await ctx.newCDPSession(p), bb = await p.locator('.playbtn').boundingBox(), x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await p.evaluate(() => { $('.playbtn').style.left = '10px'; }); await p.waitForTimeout(80);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1200);
  const scr = await p.evaluate(() => SCREENS.find(s => !$(s).hidden));
  ok(scr === '#town', `startknappen virkede ikke, da den hoppede under fingeren (endte på ${scr})`);
  await b.close();
}
(async () => {
  await playJump();
  for (const [w, h] of SIZES) await run(w, h);
  if (fails.length){ console.error('FEJL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('Alt spillet igennem uden fejl.');
})();
