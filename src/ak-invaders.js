/* ================= Hekse-invaders =================
   En lille heks på sin kost svæver forneden og skyder stjerner af sig selv. Man styrer hende ved at trække
   med fingeren et vilkårligt sted (eller piletasterne). Ovenover marcherer rækker af spøgelser, flagermus og
   græskar frem og tilbage og kommer langsomt nærmere. De drypper grønt slim, og tre skyer giver ly, til de er
   blæst i stykker. En ugle flyver nogle gange forbi øverst og giver bonuspoint. */
(() => {
  const BG = '#1A0E2E', WY = 880, FX0 = 170, FX1 = 1430;
  let S = null;
  const KINDS = [{ k:'spoegelse', p: 30 }, { k:'flagermus', p: 20 }, { k:'graeskar', p: 10 }];

  function start(stage, api){
    const C = akCanvas(stage, BG);
    S = { api, C, t: 0, last: performance.now(), score: 0, wave: 0, lives: 3, wx: 800, inv: 0, fireT: 0, stars: [], slime: [], parts: [], owl: null, owlT: 12,
          keys: {}, drag: null, over: false, raf: 0, sky: Array.from({ length: 70 }, () => ({ x: Math.random() * 2400 - 400, y: Math.random() * 900, r: Math.random() * 1.5 + .3, p: Math.random() * 6 })) };
    const cv = C.cv;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); S.drag = { x: C.toGame(e).x, wx: S.wx, id: e.pointerId }; });
    cv.addEventListener('pointermove', e => { if (!S || !S.drag || e.pointerId !== S.drag.id) return; const x = C.toGame(e).x; S.wx = Math.max(FX0, Math.min(FX1, S.drag.wx + (x - S.drag.x) * 1.4)); });
    const up = e => { if (S && S.drag && e.pointerId === S.drag.id) S.drag = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    S.kd = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ S.keys[e.key] = true; e.preventDefault(); } };
    S.ku = e => { S.keys[e.key] = false; };
    window.addEventListener('keydown', S.kd); window.addEventListener('keyup', S.ku);
    nextWave(); api.score(0); hearts();
    S.raf = requestAnimationFrame(tick);
  }
  function stop(){ if (S){ S.over = true; cancelAnimationFrame(S.raf); S.C.dispose(); window.removeEventListener('keydown', S.kd); window.removeEventListener('keyup', S.ku); } S = null; }
  const hearts = () => S.api.info('♥'.repeat(Math.max(0, S.lives)) || '–');

  function nextWave(){
    S.wave++;
    const rows = Math.min(5, 3 + Math.floor((S.wave - 1) / 2)), cols = 7;
    S.foes = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){
      const kind = KINDS[Math.min(2, Math.floor(r * 3 / rows))];
      S.foes.push({ ...kind, c, r, x: 0, y: 0, alive: true, ph: Math.random() * 6 });
    }
    S.gx = 800 - (cols - 1) * 65; S.gy = 150; S.dir = 1; S.total = S.foes.length;
    S.clouds = [470, 800, 1130].map(x => ({ x, puffs: Array.from({ length: 10 }, (_, i) => ({ dx: (i % 5 - 2) * 30, dy: (i < 5 ? -14 : 14), hp: 3 })) }));
    S.msg = `Bølge ${S.wave}`; S.msgT = 1.8; S.calm = 1.4;
  }
  function foePos(f){ f.x = S.gx + f.c * 130; f.y = S.gy + f.r * 86; return f; }

  function tick(now){
    if (!S || S.over) return;
    const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; S.t += dt;
    if (S.keys.ArrowLeft) S.wx = Math.max(FX0, S.wx - 620 * dt);
    if (S.keys.ArrowRight) S.wx = Math.min(FX1, S.wx + 620 * dt);
    if (S.inv > 0) S.inv -= dt;
    if (S.msgT > 0) S.msgT -= dt;
    if (S.calm > 0) S.calm -= dt;
    /* heksen skyder af sig selv */
    S.fireT -= dt;
    if (S.fireT <= 0 && S.calm <= 0){ S.fireT = 0.34; S.stars.push({ x: S.wx + 22, y: WY - 70 }); tone(1500, 0.04, 'triangle', 0.02, 0, 1.3); }
    S.stars.forEach(s => { s.y -= 980 * dt; });
    /* fjenderne marcherer */
    const alive = S.foes.filter(f => f.alive);
    if (!alive.length){ S.score += 100; S.api.score(S.score); sfx.magic(); S.stars = []; S.slime = []; nextWave(); }
    else if (S.calm <= 0){
      const sp = 50 + S.wave * 14 + (1 - alive.length / S.total) * 110;
      S.gx += S.dir * sp * dt;
      const xs = alive.map(f => S.gx + f.c * 130), lo = Math.min(...xs), hi = Math.max(...xs);
      if ((S.dir > 0 && hi > FX1) || (S.dir < 0 && lo < FX0)){ S.dir *= -1; S.gy += 34; S.gx += S.dir * 6; }
      alive.forEach(foePos);
      if (Math.max(...alive.map(f => f.y)) > WY - 120) return lose(true);
      /* slim drypper fra den nederste i en tilfældig søjle */
      S.dropT = (S.dropT || 1) - dt;
      if (S.dropT <= 0){ S.dropT = Math.max(0.35, 1.3 - S.wave * 0.12) * (0.6 + Math.random() * 0.8);
        const cols = [...new Set(alive.map(f => f.c))], c = cols[Math.floor(Math.random() * cols.length)], f = alive.filter(f => f.c === c).sort((a, b) => b.r - a.r)[0];
        S.slime.push({ x: f.x, y: f.y + 30 }); }
    }
    S.slime.forEach(s => { s.y += (280 + S.wave * 20) * dt; });
    /* uglen */
    S.owlT -= dt;
    if (S.owlT <= 0 && !S.owl){ S.owl = { x: -80, d: 1 }; if (Math.random() < .5){ S.owl.x = 1680; S.owl.d = -1; } S.owlT = 14 + Math.random() * 8; }
    if (S.owl){ S.owl.x += S.owl.d * 230 * dt; if (S.owl.x < -120 || S.owl.x > 1720) S.owl = null; }
    /* træffere */
    S.stars = S.stars.filter(s => {
      if (s.y < -30) return false;
      if (S.owl && Math.abs(s.x - S.owl.x) < 40 && Math.abs(s.y - 64) < 34){ S.score += 100; S.api.score(S.score); pop(S.owl.x, 64, '#FFE27A', 16); sfx.twinkle(); S.owl = null; return false; }
      for (const f of S.foes){ if (!f.alive) continue; if (Math.abs(s.x - f.x) < 46 && Math.abs(s.y - f.y) < 36){ f.alive = false; S.score += f.p; S.api.score(S.score); pop(f.x, f.y, f.k === 'graeskar' ? '#FF8A3D' : f.k === 'flagermus' ? '#C79BFF' : '#F2EEFF', 10); tone(520 + f.p * 10, 0.07, 'square', 0.03, 0, 1.6); return false; } }
      if (cloudHit(s.x, s.y)) return false;
      return true; });
    S.slime = S.slime.filter(s => {
      if (s.y > 980) return false;
      if (cloudHit(s.x, s.y)) return false;
      if (S.inv <= 0 && Math.abs(s.x - S.wx) < 44 && Math.abs(s.y - (WY - 30)) < 40){ lose(false); return false; }
      return true; });
    S.parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; });
    S.parts = S.parts.filter(p => p.t < 0.9);
    draw();
    if (S) S.raf = requestAnimationFrame(tick);
  }
  function cloudHit(x, y){
    for (const c of S.clouds) for (const p of c.puffs){ if (p.hp <= 0) continue; if (Math.hypot(x - (c.x + p.dx), y - (760 + p.dy)) < 26){ p.hp--; pop(x, y, '#C8C4E8', 4); return true; } }
    return false;
  }
  function pop(x, y, c, n){ for (let i = 0; i < n; i++) S.parts.push({ x, y, vx: (Math.random() - .5) * 300, vy: (Math.random() - .7) * 260, t: 0, c }); }
  function lose(all){
    if (!S) return;
    S.lives = all ? 0 : S.lives - 1; hearts(); pop(S.wx, WY - 30, '#9BE36A', 18); tone(160, 0.3, 'sawtooth', 0.04, 0, 0.6);
    if (S.lives <= 0){ S.over = true; const n = S.score, w = S.wave, api = S.api; draw(); setTimeout(() => api.end(n, `Du nåede bølge ${w}.`), 700); return; }
    S.inv = 1.6; S.slime = [];
  }

  /* ---------- tegning ---------- */
  function draw(){
    const { ctx, begin, visX } = S.C, [x0, x1] = visX();
    begin();
    const g = ctx.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, '#120A26'); g.addColorStop(1, '#3A1E5A');
    ctx.fillStyle = g; ctx.fillRect(x0 - 10, -400, x1 - x0 + 20, 1500);
    S.sky.forEach(s => { ctx.globalAlpha = .4 + .4 * Math.sin(S.t * 2 + s.p); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    /* slottet langt væk */
    ctx.fillStyle = '#24143E'; ctx.beginPath(); ctx.moveTo(x0 - 10, 960);
    [[300, 820], [360, 760], [420, 820], [700, 840], [760, 740], [800, 680], [840, 740], [900, 840], [1180, 820], [1240, 770], [1300, 820]].forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(x1 + 10, 900); ctx.lineTo(x1 + 10, 1000); ctx.lineTo(x0 - 10, 1000); ctx.fill();
    ctx.fillStyle = '#2E1E4A'; ctx.fillRect(x0 - 10, 950, x1 - x0 + 20, 60);
    /* skyerne */
    S.clouds.forEach(c => c.puffs.forEach(p => { if (p.hp <= 0) return; ctx.globalAlpha = 0.35 + p.hp * 0.2; ctx.fillStyle = '#E8E2FA'; ctx.beginPath(); ctx.arc(c.x + p.dx, 760 + p.dy, 26, 0, 7); ctx.fill(); }));
    ctx.globalAlpha = 1;
    S.foes.forEach(f => { if (f.alive) drawFoe(ctx, f); });
    if (S.owl) drawOwl(ctx, S.owl.x, 64, S.owl.d);
    S.stars.forEach(s => { ctx.fillStyle = '#FFE27A'; akStar(ctx, s.x, s.y, 13, S.t * 10); ctx.fill(); ctx.fillStyle = 'rgba(255,226,122,.3)'; ctx.fillRect(s.x - 2, s.y + 12, 4, 26); });
    S.slime.forEach(s => { ctx.fillStyle = '#7AE05A'; ctx.beginPath(); ctx.moveTo(s.x, s.y - 18); ctx.quadraticCurveTo(s.x + 12, s.y, s.x, s.y + 10); ctx.quadraticCurveTo(s.x - 12, s.y, s.x, s.y - 18); ctx.fill(); ctx.fillStyle = '#C8FFB0'; ctx.beginPath(); ctx.arc(s.x - 3, s.y - 2, 3, 0, 7); ctx.fill(); });
    S.parts.forEach(p => { ctx.globalAlpha = Math.max(0, 1 - p.t / .9); ctx.fillStyle = p.c; ctx.fillRect(p.x - 4, p.y - 4, 8, 8); });
    ctx.globalAlpha = 1;
    if (S.lives > 0 && !(S.inv > 0 && Math.floor(S.t * 10) % 2)) drawWitch(ctx, S.wx, WY);
    if (S.msgT > 0){ ctx.globalAlpha = Math.min(1, S.msgT); ctx.font = `700 64px ${FONT_C}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FF8FC7'; ctx.strokeStyle = '#140C2A'; ctx.lineWidth = 8; ctx.strokeText(S.msg, 800, 520); ctx.fillText(S.msg, 800, 520); ctx.globalAlpha = 1; }
  }
  function drawFoe(ctx, f){
    const x = f.x, y = f.y + Math.sin(S.t * 4 + f.ph) * 4;
    ctx.lineWidth = 3; ctx.strokeStyle = '#140C2A';
    if (f.k === 'spoegelse'){
      ctx.fillStyle = '#F2EEFF'; ctx.beginPath(); ctx.moveTo(x - 30, y + 26); ctx.lineTo(x - 30, y - 6); ctx.quadraticCurveTo(x - 30, y - 36, x, y - 36); ctx.quadraticCurveTo(x + 30, y - 36, x + 30, y - 6); ctx.lineTo(x + 30, y + 26);
      for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(x + 30 - i * 15 - 7.5, y + (i % 2 ? 34 : 18), x + 30 - (i + 1) * 15, y + 26);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#140C2A'; ctx.beginPath(); ctx.ellipse(x - 10, y - 8, 5, 8, 0, 0, 7); ctx.ellipse(x + 10, y - 8, 5, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + 8, 6, 4, 0, 0, 7); ctx.fill();
    } else if (f.k === 'flagermus'){
      const w = Math.sin(S.t * 14 + f.ph) * 10;
      ctx.fillStyle = '#8A5ACF'; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.quadraticCurveTo(x - 30, y - 22 - w, x - 46, y - 6 - w); ctx.quadraticCurveTo(x - 36, y + 4, x - 30, y + 12); ctx.quadraticCurveTo(x - 20, y + 2, x - 10, y + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.quadraticCurveTo(x + 30, y - 22 - w, x + 46, y - 6 - w); ctx.quadraticCurveTo(x + 36, y + 4, x + 30, y + 12); ctx.quadraticCurveTo(x + 20, y + 2, x + 10, y + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6A3AAF'; ctx.beginPath(); ctx.ellipse(x, y + 2, 16, 18, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 12, y - 10); ctx.lineTo(x - 8, y - 26); ctx.lineTo(x - 2, y - 14); ctx.moveTo(x + 12, y - 10); ctx.lineTo(x + 8, y - 26); ctx.lineTo(x + 2, y - 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFE27A'; ctx.beginPath(); ctx.arc(x - 6, y - 2, 3.5, 0, 7); ctx.arc(x + 6, y - 2, 3.5, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = '#FF8A3D'; ctx.beginPath(); ctx.ellipse(x, y + 2, 34, 28, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#C8602A'; ctx.beginPath(); ctx.ellipse(x, y + 2, 14, 27, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = '#140C2A';
      ctx.fillStyle = '#4E7A3A'; ctx.fillRect(x - 4, y - 34, 8, 12);
      ctx.fillStyle = '#FFE27A'; ctx.beginPath(); ctx.moveTo(x - 18, y - 6); ctx.lineTo(x - 8, y - 6); ctx.lineTo(x - 13, y - 14); ctx.closePath(); ctx.moveTo(x + 18, y - 6); ctx.lineTo(x + 8, y - 6); ctx.lineTo(x + 13, y - 14); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 18, y + 8); ctx.lineTo(x - 9, y + 16); ctx.lineTo(x, y + 9); ctx.lineTo(x + 9, y + 16); ctx.lineTo(x + 18, y + 8); ctx.lineTo(x, y + 20); ctx.closePath(); ctx.fill();
    }
  }
  function drawOwl(ctx, x, y, d){
    const w = Math.sin(S.t * 12) * 12;
    ctx.fillStyle = '#8A6A4A'; ctx.strokeStyle = '#140C2A'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x - 30, y - w * .4, 28, 12, -0.3, 0, 7); ctx.ellipse(x + 30, y - w * .4, 28, 12, 0.3, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, 24, 28, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF6D0'; ctx.beginPath(); ctx.arc(x - 9, y - 8, 9, 0, 7); ctx.arc(x + 9, y - 8, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#140C2A'; ctx.beginPath(); ctx.arc(x - 9 + d * 2, y - 8, 4, 0, 7); ctx.arc(x + 9 + d * 2, y - 8, 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFB347'; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 8); ctx.fill();
  }
  function drawWitch(ctx, x, y){
    const b = Math.sin(S.t * 3) * 4; y += b;
    ctx.lineWidth = 3; ctx.strokeStyle = '#140C2A';
    /* kosten */
    ctx.strokeStyle = '#8A5A3C'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 70, y + 4); ctx.lineTo(x + 80, y - 10); ctx.stroke();
    ctx.fillStyle = '#E8C86A'; ctx.strokeStyle = '#140C2A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 66, y + 4); ctx.lineTo(x - 112, y - 18); ctx.lineTo(x - 116, y + 14); ctx.lineTo(x - 108, y + 30); ctx.closePath(); ctx.fill(); ctx.stroke();
    /* kjole, ansigt, hat */
    ctx.fillStyle = '#7A2A8A'; ctx.beginPath(); ctx.moveTo(x - 26, y + 2); ctx.lineTo(x - 4, y - 52); ctx.lineTo(x + 22, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F2C8A0'; ctx.beginPath(); ctx.arc(x, y - 58, 15, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#E87A3A'; ctx.beginPath(); ctx.moveTo(x - 14, y - 62); ctx.quadraticCurveTo(x - 30, y - 40, x - 22, y - 26); ctx.lineTo(x - 12, y - 50); ctx.fill();
    ctx.fillStyle = '#5A1E6A'; ctx.beginPath(); ctx.moveTo(x - 26, y - 66); ctx.lineTo(x + 26, y - 66); ctx.lineTo(x + 4, y - 112); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFE27A'; akStar(ctx, x + 2, y - 84, 6, 0); ctx.fill();
    ctx.fillStyle = '#140C2A'; ctx.beginPath(); ctx.arc(x + 4, y - 58, 2.5, 0, 7); ctx.arc(x + 10, y - 58, 2.5, 0, 7); ctx.fill();
    /* tryllestaven peger op */
    ctx.strokeStyle = '#5A3A2A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 14, y - 32); ctx.lineTo(x + 22, y - 66); ctx.stroke();
  }
  Arkade.GAMES.invader = { start, stop, test: () => { if (S) lose(true); }, state: () => S && { wx: S.wx, score: S.score, wave: S.wave, lives: S.lives, foes: S.foes.filter(f => f.alive).length, slime: S.slime.map(s => ({ x: s.x, y: s.y })) } };
})();
