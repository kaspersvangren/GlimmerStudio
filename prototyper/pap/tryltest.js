/* Trylletegning: rigtige fingerstrøg med musen, runder, kagen og billetter */
const { chromium } = require('playwright');
(async () => {
  const [, , W = '1280', H = '800'] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, hasTouch: false });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = id => p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('arkade')); await inde('arkade'); await p.evaluate(() => __spil.enter('tryl')); await inde('tryl');
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) };
  const cx = +W / 2, cy = +H * .45, r = Math.min(+W, +H) * .14;
  const FORM = { vand: [[-1, 0], [1, 0.08]], lod: [[0.05, -1], [0, 1]], v: [[-.8, -.8], [0, .8], [.8, -.7]], hat: [[-.8, .8], [0, -.8], [.8, .7]], lyn: [[.5, -1], [-.6, .1], [.55, -.1], [-.45, 1]],
    ring: Array.from({ length: 22 }, (_, i) => [Math.cos(i / 20 * 6.283 + 1) * .9, Math.sin(i / 20 * 6.283 + 1) * .8]),
    hjerte: Array.from({ length: 41 }, (_, i) => { const t = i / 40 * 6.283; return [16 * Math.sin(t) ** 3 / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) - 2.5) / 16] }) };
  const streg = async (navn, k = 1) => { const f = FORM[navn]; await p.mouse.move(cx + f[0][0] * r * k, cy + f[0][1] * r * k); await p.mouse.down(); for (let i = 1; i < f.length; i++) await p.mouse.move(cx + f[i][0] * r * k, cy + f[i][1] * r * k, { steps: navn === 'vand' || navn === 'lod' ? 4 : navn === 'ring' || navn === 'hjerte' ? 1 : 3 }); await p.mouse.up() };
  tjek('før start', await T(`__spil.room.ctx.test.tilstand()`) === null);
  await p.mouse.click(cx, cy); await p.waitForTimeout(400);
  let s = await T(`__spil.room.ctx.test.tilstand()`); tjek('et tryk starter spillet og viser de to første tegn', s && s.fase === 'kort' && s.runde === 1, s && [s.fase, s.tegn]);
  await streg('vand'); await streg('lod'); await p.waitForTimeout(300);
  tjek('begge tegn er prøvet på kortet', await T(`(()=>{const k=__spil.room.ctx.test.S().kort;return k&&k.ok.vand&&k.ok.lod})()`));
  await p.screenshot({ path: __dirname + '/tryl-kort.png' });
  await T(`__spil.room.ctx.test.spol(5)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('væsner kommer ned', s.fase === 'spil' && s.foes.length > 0, s.foes);
  const sym = s.foes[0].bal[0]; await streg(sym); await T(`__spil.room.ctx.test.spol(.6)`); const s2 = await T(`__spil.room.ctx.test.tilstand()`);
  tjek('en streg sprænger ballonerne med det tegn', s2.score > 0 && s2.forvandlet >= 1 && !s2.foes.some(f => f.bal.includes(sym) && f.y < 44), [sym, s2.score, s2.forvandlet]);
  await p.screenshot({ path: __dirname + '/tryl-pop.png' });
  /* en kruseduller giver ingenting */
  const før = s2.score; await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + 4, cy + 3); await p.mouse.up(); tjek('et lille tryk er ikke et tegn', (await T(`__spil.room.ctx.test.tilstand()`)).score === før);
  /* alle tegn genkendes fra musen, også små og store */
  await T(`__spil.room.ctx.test.runde(7);__spil.room.ctx.test.frem();__spil.room.ctx.test.spol(.5);__spil.room.ctx.test.frys(true)`);
  for (const navn of ['vand', 'lod', 'v', 'hat', 'ring', 'lyn']) for (const k of [.5, 1.3]) { await T(`window.__sidst=null;(()=>{const S=__spil.room.ctx.test.S();S.spor.length=0})()`); await streg(navn, k); const c = await T(`(()=>{const S=__spil.room.ctx.test.S(),q=S.spor[S.spor.length-1];return q&&q.c})()`); const vil = await T(`TRYL_TEGN.${navn}.c`).catch(() => null); tjek(`genkender ${navn} i størrelse ${k}`, c && c !== '#b8b0d0', c) }
  /* gaveballonen og hjertet */
  await T(`__spil.room.ctx.test.frys(false);__spil.room.ctx.test.begynd();__spil.room.ctx.test.frem();__spil.room.ctx.test.runde(4);__spil.room.ctx.test.frem();__spil.room.ctx.test.spol(5);__spil.room.ctx.test.gave();__spil.room.ctx.test.spol(3);__spil.room.ctx.test.frys(true)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('gaveballonen flyver forbi', s.gave, s.foes.length);
  await p.screenshot({ path: __dirname + '/tryl-gave.png' });
  const sc = s.score; await streg('hjerte'); await T(`__spil.room.ctx.test.frys(false);__spil.room.ctx.test.spol(1.5)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('et hjerte sprænger alt og giver 100', s.score >= sc + 100 && !s.gave && s.foes.filter(f => f.st === 'ned' && f.y < 44).length === 0, [sc, s.score, s.foes]);
  await p.screenshot({ path: __dirname + '/tryl-hjerte.png' });
  /* bossen i runde 5: tryl alt væk, den kaster, tegn rækken, når den er svimmel, til den er besejret */
  { const r = await T(`(()=>{const T=__spil.room.ctx.test;T.begynd();T.frem();T.runde(5);const S=T.S(),navn=S.boss&&S.boss.def.navn,hp0=S.boss.hp;let svimmel=0,super_=0,n=0;for(;n<6000&&S.boss;n++){T.spol(.08);for(const k of S.skud)if(k.t>.2&&!k.plan){if(k.stor)super_++;T.tegn(k.sym)}if(S.boss&&S.boss.fase==='saarbar'){svimmel++;T.tegn(S.boss.kombo[S.boss.komboI]);T.spol(.1)}}T.spol(4);const s=T.tilstand();return [navn,hp0,svimmel>0,super_>0,s.score,s.forvandlet,s.runde,s.liv,s.fase,n]})()`);
    tjek('bossen i runde 5 kan besejres, og spillet går videre til runde 6', r[0] === 'Kongetrolden' && r[2] && r[3] && r[4] >= 100 * r[1] + 250 && r[5] === 1 && r[6] === 6 && r[7] === 3, r); await p.screenshot({ path: __dirname + '/tryl-efterboss.png' }) }
  /* en boss, man ikke gør noget ved, spiser kagen */
  { const r = await T(`(()=>{const T=__spil.room.ctx.test;T.begynd();T.frem();T.runde(10);const S=T.S();for(let i=0;i<900&&S.fase!=='vent';i++)T.spol(.2);return [S.fase,S.boss,S.skud.length,document.getElementById('toast').textContent]})()`); await p.waitForTimeout(700);
    tjek('lader man bossen være, spiser den kagen, og spillet slutter pænt', r[0] === 'vent' && r[1] === null && r[2] === 0 && /billet/.test(r[3]), r); await p.click('#videre'); await p.waitForTimeout(300); await T(`__spil.room.ctx.test.begynd();__spil.room.ctx.test.frem();__spil.room.ctx.test.runde(4);__spil.room.ctx.test.frem()`) }
  /* kagen: tre bid, så er det slut, og der kommer billetter */
  const bil0 = await T(`__spil.bil`); await T(`__spil.room.ctx.test.bid();__spil.room.ctx.test.bid()`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('to bid: én etage tilbage', s.liv === 1 && s.fase !== 'tabt', s.liv);
  await T(`(()=>{const T=__spil.room.ctx.test,S=T.S();T.runde(6);T.frem();for(let i=0;i<400&&S.fase!=='slut';i++){T.spol(.25);for(const f of S.foes)for(const b of f.bal)if(!b.pop&&!b.plan&&f.y<40)T.tegn(b.sym)}T.spol(2.5)})()`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('runde 6 spillet igennem: ny etage på kagen efter hver tredje runde', s.runde === 7 && s.liv === 2, [s.fase, s.runde, s.liv, s.score]);
  await T(`__spil.room.ctx.test.bid();__spil.room.ctx.test.bid();__spil.room.ctx.test.bid();__spil.room.ctx.test.spol(3)`); await p.waitForTimeout(500);
  const txt = await T(`document.getElementById('toast').textContent`), bil1 = await T(`__spil.bil`); tjek('slut: besked og billetter', /billet/.test(txt) && bil1 > bil0 && !(await T(`document.getElementById('videre').hidden`)), [txt, bil0, bil1]);
  await p.screenshot({ path: __dirname + '/tryl-slut.png' });
  await p.mouse.click(cx, cy); await p.waitForTimeout(900); await p.mouse.click(cx, cy + 40); await p.waitForTimeout(500); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('nyt spil efter et tryk', s && s.runde === 1 && s.score === 0 && s.liv === 3, s && [s.fase, s.runde]);
  await p.click('#hjem'); await inde('arkade'); tjek('tilbage i Arkaden', true);
  console.log(fejl ? `${fejl} FEJL` : 'alt i orden'); await b.close();
})();
