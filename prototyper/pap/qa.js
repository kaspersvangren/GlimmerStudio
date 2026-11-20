/* kvalitetstjek af kortet: stier, døre, skilte, ting på stierne, ruter og figurer */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('FEJL', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('konsol', m.text().slice(0, 300)); });
  await p.route(/fonts\.googleapis/, r => r.fulfill({ path: __dirname + '/fonts-local.css', contentType: 'text/css' })); await p.route(/fonts\.gstatic/, r => r.abort());
  await p.route(/cdn\.jsdelivr\.net/, r => r.fulfill({ path: __dirname + (r.request().url().includes('clipper') ? '/../npm3/node_modules/clipper-lib/clipper.js' : '/../npm3/node_modules/three/build/three.module.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + __dirname + '/testkort.html');
  await p.waitForFunction(() => document.getElementById('msg').classList.contains('gone') || /Fejl/.test(document.getElementById('msgN').textContent), null, { timeout: 300000 });
  const rep = await p.evaluate(() => {
    const K = __kort, T = K.THREE, out = [], ok = [];
    const bad = (k, m) => out.push(k + ': ' + m), good = (k, m) => ok.push(k + ': ' + m);
    K.scene.updateMatrixWorld(true); const cam = K.cam; cam.clearViewOffset(); cam.updateMatrixWorld();
    const camPos = new T.Vector3(); cam.getWorldPosition(camPos);
    const rc = new T.Raycaster(); K.live.updateMatrixWorld(true); const all = [...K.scene.children, ...K.HOUSEG.filter(g => g.parent === K.live)];
    const owner = o => { for (let q = o; q; q = q.parent) { if (q.userData.house) return 'hus:' + q.userData.house; if (q.userData.sign) return 'skilt:' + q.userData.sign } return o.userData.flat ? 'jord' : 'ting' };
    const firstHit = (pt) => { const d = pt.clone().sub(camPos), L = d.length(); rc.set(camPos, d.normalize()); rc.far = L + .3; const h = rc.intersectObjects(all, true).filter(x => x.object.visible && !(x.object.material && x.object.material.transparent && x.object.material.opacity < .5)); return h.length ? { obj: h[0].object, dist: h[0].distance, L } : null };
    const onScreen = (pt) => { const v = pt.clone().project(cam); return Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 };
    const distSeg = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz) };
    const distLine = (p, L) => { let d = 1e9; for (let i = 0; i < L.length - 1; i++)d = Math.min(d, distSeg(p, L[i], L[i + 1])); return d };
    const nearPath = (x, z) => Math.min(...K.PATHLINES.map(L => distLine([x, z], L)));
    const FP = K.footprints();
    const inFoot = (x, z, m = 0) => FP.find(f => x > f[1] - m && x < f[2] + m && z > f[3] - m && z < f[4] + m);
    /* 1. hver dør: der er et sted foran, og en sti ender lige der */
    for (const n in K.HOUSE) { const H = K.HOUSE[n]; if (!H.spot) continue; const [dx, dz] = H.door, [sx, sz] = H.spot;
      const ends = K.PATHLINES.map(L => L[L.length - 1]); const e = ends.reduce((a, q) => Math.hypot(q[0] - sx, q[1] - sz) < Math.hypot(a[0] - sx, a[1] - sz) ? q : a);
      const dEnd = Math.hypot(e[0] - dx, e[1] - dz), dSpot = Math.hypot(sx - dx, sz - dz);
      if (n !== 'drage' && n !== 'broend' && (dEnd > 3.6 || e[1] < dz)) bad('sti til dør', `${n}: nærmeste stiende ${e.map(v => v.toFixed(1))} er ${dEnd.toFixed(1)} fra døren ${H.door}`); else good('sti til dør', `${n} ${dEnd.toFixed(1)}`);
      if (n !== 'drage' && (dSpot > 4.2 || sz < dz)) bad('sted', `${n}: heksens sted ${H.spot} ligger ${dSpot.toFixed(1)} fra døren / bag den`);
      /* døren skal kunne ses */
      const dp = new T.Vector3(dx, 2, dz + .4); const h = firstHit(dp); if (h && h.dist < h.L - 1.2) { const w = owner(h.obj); if (w !== 'hus:' + n) bad('dør skjult', `${n}: dækket af ${w} (${h.obj.geometry.type})`) } }
    /* 2. stierne må ikke forsvinde bag huse */
    K.PATHLINES.forEach((L, i) => { let n = 0, hid = 0; const who = {};
      for (let j = 0; j < L.length - 1; j++) { const a = L[j], c = L[j + 1], len = Math.hypot(c[0] - a[0], c[1] - a[1]); for (let t = 0; t < len; t += 1) { const x = a[0] + (c[0] - a[0]) * t / len, z = a[1] + (c[1] - a[1]) * t / len; if (Math.hypot(x / 15, z / 10) < 1.12) continue; const pt = new T.Vector3(x, .55, z); n++; const h = firstHit(pt); if (h && h.dist < h.L - 1) { const w = owner(h.obj); if (w.startsWith('hus:') || w.startsWith('skilt:')) { hid++; who[w] = (who[w] || 0) + 1 } } } }
      if (hid / n > .04) bad('sti skjult', `sti ${i} (${K.PATHS[i][0]}→${K.PATHS[i][K.PATHS[i].length - 1]}): ${Math.round(hid / n * 100)}% skjult af ${JSON.stringify(who)}`); else good('sti synlig', `sti ${i} ${Math.round(hid / n * 100)}%`) });
    /* 3. skilte: hele fladen skal kunne ses */
    const signs = []; K.scene.traverse(o => { if (o.isMesh && o.userData.sign) signs.push(o) }); K.live.traverse(o => { if (o.isMesh && o.userData.sign) signs.push(o) });
    signs.forEach(o => { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox; let n = 0, vis = 0; const who = {};
      for (const fx of [.1, .5, .9]) for (const fy of [.15, .5, .85]) { const pt = new T.Vector3(bb.min.x + (bb.max.x - bb.min.x) * fx, bb.min.y + (bb.max.y - bb.min.y) * fy, bb.max.z + .01).applyMatrix4(o.matrixWorld); n++; const h = firstHit(pt); if (!h || h.obj === o || h.dist > h.L - 1) vis++; else { const w = owner(h.obj); who[w] = (who[w] || 0) + 1 } }
      if (vis < n) bad('skilt dækket', `${o.userData.sign}: ${n - vis}/${n} punkter dækket af ${JSON.stringify(who)}`); else good('skilt', o.userData.sign) });
    /* 4. vejviseren peger samme vej som stien */
    const post = [-22, -8]; const dest = { Kollegiet: 'kollegie', Skolen: 'skole', Dragen: 'drage', Bobler: 'bobler', Koncertsalen: 'koncert', Arkaden: 'arkade' };
    K.scene.traverse(o => { if (!o.userData.sign || !String(o.userData.sign).startsWith('pil:')) return; const name = o.userData.sign.slice(4), sp = K.SPOTS[dest[name]]; const wp = new T.Vector3(); o.parent.getWorldPosition(wp);
      const r = [post, ...K.NET.route(post[0], post[1], sp[0], sp[1])]; let acc = 0, q = r[r.length - 1]; for (let i = 1; i < r.length; i++) { acc += Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]); if (acc > 16) { q = r[i]; break } } const want = Math.sign(sp[0] - post[0]);
      if (want !== o.userData.dir) bad('vejviser', `${name} peger ${o.userData.dir > 0 ? 'højre' : 'venstre'}, men vejen går ${want > 0 ? 'højre' : 'venstre'}`); else good('vejviser', name) });
    /* 5. ting må ikke stå på stierne, i åen eller inde i huse */
    for (const pr of K.PROPS) { if (pr.k === 'bro') continue; const d = nearPath(pr.x, pr.z); if (d < 2.15 + pr.r * .5) bad('ting på sti', `${pr.k} ved (${pr.x.toFixed(1)},${pr.z.toFixed(1)}) er ${d.toFixed(1)} fra stiens midte`);
      const dr = distLine([pr.x, pr.z], K.RIVER); if (dr < 2.4 + pr.r * .5) bad('ting i åen', `${pr.k} ved (${pr.x.toFixed(1)},${pr.z.toFixed(1)})`);
      const f = inFoot(pr.x, pr.z, .3); if (f && !(f[0] === 'broend')) bad('ting i hus', `${pr.k} ved (${pr.x.toFixed(1)},${pr.z.toFixed(1)}) står i ${f[0]}`) }
    /* 6. stierne krydser kun åen ved broen */
    K.PATHLINES.forEach((L, i) => { for (const q of L) { const d = distLine(q, K.RIVER); if (d < 2.2 && !(Math.abs(q[0] - 25.4) < 6.5 && Math.abs(q[1] - 34.4) < 3)) { bad('sti i åen', `sti ${i} ved (${q[0].toFixed(1)},${q[1].toFixed(1)})`); break } } });
    /* 7. heksens ruter: fra pladsen til hver dør, uden at gå gennem huse */
    for (const n in K.SPOTS) { const sp = K.SPOTS[n]; if (!sp) continue; const r = [[0, 9], ...K.NET.route(0, 9, sp[0], sp[1])]; let thru = null;
      for (let i = 0; i < r.length - 1 && !thru; i++) { const a = r[i], c = r[i + 1], len = Math.hypot(c[0] - a[0], c[1] - a[1]); for (let t = 0; t <= len; t += .4) { const x = a[0] + (c[0] - a[0]) * t / (len || 1), z = a[1] + (c[1] - a[1]) * t / (len || 1); const f = inFoot(x, z, -.2); if (f) { thru = `${f[0]} ved (${x.toFixed(1)},${z.toFixed(1)})`; break } } }
      const last = r[r.length - 2], leg = Math.hypot(last[0] - sp[0], last[1] - sp[1]);
      if (thru) bad('rute gennem hus', `til ${n}: ${thru}`); else if (leg > 4.5) bad('rute', `til ${n}: sidste stykke uden sti er ${leg.toFixed(1)}`); else good('rute', n) }
    /* 8. byens folk */
    /* byens folk: deres mål ligger tæt ved en sti, ikke i åen eller i huse, og vejen derhen går ad stierne */
    for (const p of K.POIS) { const [x, z] = p.at, d = nearPath(x, z), inPlaza = Math.hypot(x / 15.9, z / 10.9) < 1; if (d > 4.6 && !inPlaza) bad('beboer-mål langt fra sti', `${p.n} er ${d.toFixed(1)} fra nærmeste sti`);
      if (distLine([x, z], K.RIVER) < 2.2 && p.n !== 'bro') bad('beboer-mål i åen', p.n); const f = inFoot(x, z, .2); if (f && f[0] !== 'broend') bad('beboer-mål i hus', `${p.n} i ${f[0]}`);
      const r = [[0, 9], ...K.NET.route(0, 9, x, z)]; let off = 0; for (let i = 0; i < r.length - 1; i++) { const a = r[i], c = r[i + 1], len = Math.hypot(c[0] - a[0], c[1] - a[1]); for (let t = 0; t <= len; t += .5) { const px = a[0] + (c[0] - a[0]) * t / (len || 1), pz = a[1] + (c[1] - a[1]) * t / (len || 1); if (nearPath(px, pz) > 2.4 && Math.hypot(px / 15.9, pz / 10.9) > 1) off += .5 } }
      if (off > 5) bad('beboer uden for sti', `vejen til ${p.n} går ${off.toFixed(1)} uden for stierne`); else good('beboer-mål', p.n) }
    /* 9. dragen, enhjørningen og trolden kan ses */
    const LO = K.liveObj(); for (const n in LO) { const o = LO[n]; const bb = new T.Box3().setFromObject(o); const c = bb.getCenter(new T.Vector3()); let vis = 0, m = 0; for (const fx of [.25, .5, .75]) for (const fy of [.3, .6, .9]) { const pt = new T.Vector3(bb.min.x + (bb.max.x - bb.min.x) * fx, bb.min.y + (bb.max.y - bb.min.y) * fy, bb.max.z); m++; const h = firstHit(pt); if (!h || h.dist > h.L - 1) vis++ }
      if (vis < m * .7) bad('figur skjult', `${n}: kun ${vis}/${m} punkter synlige`); else good('figur', `${n} ${vis}/${m}`) }
    return { out, ok };
  });
  console.log('PROBLEMER (' + rep.out.length + '):'); for (const l of rep.out) console.log('  - ' + l);
  console.log('OK (' + rep.ok.length + '): ' + rep.ok.join(' | '));
  await b.close();
})();
