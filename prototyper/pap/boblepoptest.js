/* BoblePop: sigte og skud med musen, klynger, fald, nye rækker, kræfter, næste bane og slut */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  let fejl = 0; p.on('pageerror', e => { fejl++; console.log('FEJL', e.message, (e.stack || '').split('\n').slice(1, 3).join(' | ')) }); p.on('console', m => { if (m.type() === 'error' && !/GL Driver/.test(m.text())) { fejl++; console.log('konsol', m.text().slice(0, 300)) } });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : r.request().url().includes('matter') ? '/../npm3/node_modules/matter-js/build/matter.min.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testspil.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone'), null, { timeout: 120000 });
  const inde = id => p.waitForFunction(id => __spil.room && __spil.room.id === id && document.getElementById('door').classList.contains('gone') && !document.getElementById('hjem').hidden, id, { timeout: 120000 });
  await p.evaluate(() => __spil.enter('arkade')); await inde('arkade'); await p.evaluate(() => __spil.enter('boblepop')); await inde('boblepop');
  const T = js => p.evaluate(js), tjek = (navn, ok, v) => { if (!ok) fejl++; console.log(ok ? 'ok  ' : 'FEJL', navn, v === undefined ? '' : JSON.stringify(v)) };
  const sk = (x, y, z = 1) => T(`(()=>{const c=__spil.room.ctx.room.cam,v=new __kort.THREE.Vector3(${x},${y},${z}).project(c),r=document.querySelector('#stage canvas').getBoundingClientRect();return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]})()`);
  await T(`document.getElementById('toast').style.display='none';__spil.room.ctx.test.spol(1.5)`);
  await p.screenshot({ path: __dirname + '/boble-intro.png' }); tjek('forklaringen hænger i snore, til man trykker', await T(`__spil.room.ctx.test.intro()`) && !(await T(`__spil.room.ctx.test.hint()`)));
  { const q = await sk(3, 20); await p.mouse.click(q[0], q[1]); } await T(`__spil.room.ctx.test.spol(1)`); tjek('et tryk tager forklaringen væk og viser hånden ved kæledyret', !(await T(`__spil.room.ctx.test.intro()`)) && await T(`__spil.room.ctx.test.hint()`)); await p.waitForTimeout(400); await p.screenshot({ path: __dirname + '/boble-haand.png' });
  let s = await T(`__spil.room.ctx.test.tilstand()`); tjek('banen er lagt op', s.fase === 'sigt' && s.bobler > 40 && s.raekker === 5, s);
  /* sigt med musen: den stiplede linje, og slip for at skyde */
  const [bedst, n0] = await T(`__spil.room.ctx.test.bedst()`); const m1 = await sk(Math.cos(bedst) * 14, 4.6 + Math.sin(bedst) * 14), m0 = await sk(3, 20);
  await p.mouse.move(m0[0], m0[1]); await p.mouse.down(); await p.mouse.move(m1[0], m1[1], { steps: 4 }); await p.waitForTimeout(900); await p.screenshot({ path: __dirname + '/boble-sigte.png' }); await p.mouse.up(); await p.waitForTimeout(200);
  s = await T(`__spil.room.ctx.test.tilstand()`); tjek('slip skyder boblen af sted', s.fase === 'flyv' || s.skud === 1, s.fase); await T(`__spil.room.ctx.test.spol(3.5)`); s = await T(`__spil.room.ctx.test.tilstand()`);
  tjek('skuddet lander' + (n0 >= 3 ? ', og en klynge på 3 eller flere springer' : ''), s.skud === 1 && (n0 >= 3 ? s.score > 0 : s.miss === 1), [n0, s.score, s.miss, s.bobler]); await p.screenshot({ path: __dirname + '/boble-skud.png' });
  /* et tryk på kæledyret bytter de to bobler */
  if (typeof s.cur !== 'number') { await T(`(()=>{const G=__spil.room.ctx.test.G();G.cur.sp=null;})()`); s = await T(`__spil.room.ctx.test.tilstand()`); }
  const foer = [s.cur, s.next], kp = await sk(-11, 3, 7); await p.mouse.click(kp[0], kp[1]); await p.waitForTimeout(300); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('hånden er væk efter et bytte', !(await T(`__spil.room.ctx.test.hint()`)));tjek('kæledyret bytter boblerne, og der skydes ikke', s.cur === foer[1] && s.next === foer[0] && s.skud === 1, [foer, s.cur, s.next]);
  /* seks skud forbi giver en ny række */
  const r0 = s.raekker; await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();G.miss=0;for(let i=0;i<40&&G.miss<G.missMax-1;i++){G.cur.t=5;G.cur.sp=null;T.skyd(1.57+(i%2?.02:-.02)*i);T.spol(1.3)}})()`); s = await T(`__spil.room.ctx.test.tilstand()`); const lamperFoer = s.miss;
  await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();G.cur.t=5;T.skyd(1.2);T.spol(2)})()`); const s2 = await T(`__spil.room.ctx.test.tilstand()`); tjek('når lamperne er brugt, kommer en ny række', lamperFoer === s.missMax - 1 && s2.miss === 0 && s2.raekker >= s.raekker + 1, [r0, s.raekker, s2.raekker, lamperFoer, s2.miss]); await p.screenshot({ path: __dirname + '/boble-raekke.png' });
  /* kræfterne */
  await T(`(()=>{const T=__spil.room.ctx.test;(()=>{const G=T.G();G.maerker.length=0;G.pw.length=0})(),T.giv('bombe')})()`); s = await T(`__spil.room.ctx.test.tilstand()`); const b0 = s.bobler; tjek('en kraft lægges i kanonen', s.cur === 'bombe', s.cur); await p.screenshot({ path: __dirname + '/boble-kraft.png' });
  await T(`__spil.room.ctx.test.skyd(1.5);__spil.room.ctx.test.spol(1.6)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('bomben sprænger alt omkring sig', s.bobler <= b0 - 6, [b0, s.bobler]);
  await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();T.spol(1.2);G.pw.length=0;if(G.cur&&G.cur.sp)G.cur.sp=null})(),__spil.room.ctx.test.giv('lyn')`); const b1 = (await T(`__spil.room.ctx.test.tilstand()`)).bobler; await T(`__spil.room.ctx.test.skyd(1.3);__spil.room.ctx.test.spol(1.6)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('lynet fjerner en række', s.bobler <= b1 - 4, [b1, s.bobler]);
  await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();T.spol(1.2);G.pw.length=0;if(G.cur&&G.cur.sp)G.cur.sp=null})(),__spil.room.ctx.test.giv('regnbue')`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('regnbuen ligger i kanonen', s.cur === 'regnbue'); await T(`__spil.room.ctx.test.skyd(1.57);__spil.room.ctx.test.spol(1.6)`);
  await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();T.spol(1.2);G.pw.length=0;if(G.cur&&G.cur.sp)G.cur.sp=null})(),__spil.room.ctx.test.giv('sigte')`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('sigte gælder i seks skud', s.sigte === 6 && typeof s.cur === 'number', [s.sigte, s.cur]);
  /* spil banen færdig med de bedste skud: næste bane kommer */
  const r = await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();let n=0,kraft=0;for(;n<400&&G.lvl===1&&G.fase!=='tabt'&&G.fase!=='vent';n++){if(G.fase!=='sigt'||G.vent>0){T.spol(.2);continue}G.miss=0;const[a,v]=T.bedst();if(v<3){const f=[...new Set(G.grid.flat().filter(Boolean).map(b=>b.t))];G.cur.t=f[n%f.length];G.cur.sp=null}kraft+=G.pw.length;T.skyd(T.bedst()[0]);T.spol(1.2)}T.spol(3);return [n,G.lvl,G.fase,G.score,kraft]})()`);
  tjek('når alle bobler er væk, kommer bane 2', r[1] === 2 && r[3] > 300, r); await p.screenshot({ path: __dirname + '/boble-bane2.png' });
  /* fyld brættet op: spillet slutter med billetter */
  const bil0 = await T(`__spil.bil`); await T(`(()=>{const T=__spil.room.ctx.test,G=T.G();for(let i=0;i<14&&G.fase!=='tabt'&&G.fase!=='vent';i++){T.nyRaekke();T.spol(.3)}T.spol(3)})()`); await p.waitForTimeout(500);
  const txt = await T(`document.getElementById('toast').textContent`), bil1 = await T(`__spil.bil`); tjek('når boblerne når snoren, er spillet slut, og der kommer billetter', /billet/.test(txt) && bil1 > bil0 && !(await T(`document.getElementById('videre').hidden`)), [txt, bil0, bil1]); await p.screenshot({ path: __dirname + '/boble-slut.png' });
  await p.waitForTimeout(700); await p.click('#videre'); await p.waitForTimeout(300); await T(`__spil.room.ctx.test.spol(1.5)`); s = await T(`__spil.room.ctx.test.tilstand()`); tjek('et nyt spil begynder', s.fase === 'sigt' && s.bane === 1 && s.score === 0, s);
  await p.click('#hjem'); await inde('arkade'); tjek('tilbage i Arkaden', true);
  console.log(fejl ? `${fejl} FEJL` : 'alt i orden'); await b.close();
})();
