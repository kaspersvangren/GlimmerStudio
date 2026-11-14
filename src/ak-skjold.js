/* ================= Stjerneskjoldet =================
   Meteorer falder ned over byen om natten. Skolen står i midten med fire små huse omkring sig.
   Man trykker på himlen, og fra tryllestaven i skolens tårn flyver en trylleformular derop og springer ud
   i en stor, glitrende kugle. Meteorer, der flyver ind i kuglen, forsvinder. Hver bølge bliver lidt hurtigere.
   Spillet slutter, når alle bygninger er ramt. */
(() => {
  const SKY = '#0E1638', GROUND = 920, WAND = { x: 800, y: 584 };
  let S = null;
  const BUILD = () => [
    { kind:'hus', x: 260, w: 120, alive: true }, { kind:'hus', x: 470, w: 120, alive: true },
    { kind:'skole', x: 800, w: 260, alive: true, hp: 3 },
    { kind:'hus', x: 1130, w: 120, alive: true }, { kind:'hus', x: 1340, w: 120, alive: true } ];

  function start(stage, api){
    const C = akCanvas(stage, SKY);
    S = { api, C, t: 0, last: performance.now(), score: 0, wave: 0, left: 0, spawnT: 0, meteors: [], bolts: [], booms: [], parts: [], builds: BUILD(),
          stars: Array.from({ length: 90 }, () => ({ x: Math.random() * 2400 - 400, y: Math.random() * 760, r: Math.random() * 1.6 + .4, p: Math.random() * 6 })), over: false, pause: 0, raf: 0 };
    C.cv.addEventListener('pointerdown', e => { e.preventDefault(); shoot(C.toGame(e)); });
    nextWave(); api.score(0);
    S.raf = requestAnimationFrame(tick);
  }
  function stop(){ if (S){ S.over = true; cancelAnimationFrame(S.raf); S.C.dispose(); } S = null; }

  function nextWave(){
    S.wave++; S.left = 5 + S.wave * 3; S.spawnT = 1.2; S.pause = 1.6;
    S.msg = `Bølge ${S.wave}`; S.msgT = 1.8; S.api.info(`Bølge ${S.wave}`);
  }
  function spawnMeteor(){
    const alive = S.builds.filter(b => b.alive); if (!alive.length) return;
    const [x0, x1] = S.C.visX(), tgt = Math.random() < 0.8 ? alive[Math.floor(Math.random() * alive.length)] : { x: 200 + Math.random() * 1200 };
    const sx = Math.max(x0 + 40, Math.min(x1 - 40, tgt.x + (Math.random() - .5) * 900)), sy = -30;
    const tx = tgt.x + (Math.random() - .5) * (tgt.w || 100) * .6, ty = GROUND - 10;
    const d = Math.hypot(tx - sx, ty - sy), sp = 70 + S.wave * 14 + Math.random() * 30;
    S.meteors.push({ x: sx, y: sy, sx, sy, vx: (tx - sx) / d * sp, vy: (ty - sy) / d * sp, r: 13 + Math.random() * 6, split: S.wave >= 3 && Math.random() < 0.25, rot: Math.random() * 6 });
  }
  function shoot(p){
    if (!S || S.over || S.bolts.length >= 3) return;
    if (p.y > GROUND - 140) p.y = GROUND - 140;
    const d = Math.hypot(p.x - WAND.x, p.y - WAND.y) || 1;
    S.bolts.push({ x: WAND.x, y: WAND.y, tx: p.x, ty: p.y, vx: (p.x - WAND.x) / d * 1500, vy: (p.y - WAND.y) / d * 1500 });
    tone(1200, 0.1, 'triangle', 0.04, 0, 1.8);
  }
  function boom(x, y, R, col){ S.booms.push({ x, y, R, t: 0, col }); }
  function hitBuilding(m){
    const b = S.builds.find(b => b.alive && Math.abs(m.x - b.x) < b.w / 2 + 10);
    boom(m.x, GROUND - 20, 70, '#FF8A3D'); tone(110, 0.3, 'sawtooth', 0.04, 0, 0.5);
    if (!b) return;
    if (b.kind === 'skole' && --b.hp > 0){ for (let i = 0; i < 14; i++) S.parts.push({ x: m.x, y: GROUND - 60, vx: (Math.random() - .5) * 300, vy: -Math.random() * 300, t: 0, c: '#7FD8FF' }); return; }
    b.alive = false;
    for (let i = 0; i < 24; i++) S.parts.push({ x: b.x + (Math.random() - .5) * b.w, y: GROUND - 40, vx: (Math.random() - .5) * 320, vy: -Math.random() * 420, t: 0, c: Math.random() < .5 ? '#FF8A3D' : '#FFD36E' });
    if (!S.builds.some(b => b.alive)) setTimeout(finish, 900);
  }
  function tick(now){
    if (!S || S.over) return;
    const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; S.t += dt;
    if (S.pause > 0) S.pause -= dt;
    else if (S.left > 0){ S.spawnT -= dt; if (S.spawnT <= 0){ spawnMeteor(); S.left--; S.spawnT = Math.max(0.45, 1.5 - S.wave * 0.12) * (0.6 + Math.random() * 0.8); } }
    else if (!S.meteors.length && !S.booms.length && S.builds.some(b => b.alive)){
      const bonus = S.builds.filter(b => b.alive).length * 25; S.score += bonus; S.api.score(S.score);
      S.msg = `Bølge ${S.wave} klaret! +${bonus}`; S.msgT = 2; sfx.magic(); nextWave(); S.pause = 2.2;
    }
    if (S.msgT > 0){ S.msgT -= dt; if (S.msgT <= 0) S.api.info(`Bølge ${S.wave}`); }
    /* formularer flyver, til de når målet, og springer så ud */
    S.bolts = S.bolts.filter(b => { b.x += b.vx * dt; b.y += b.vy * dt;
      if ((b.tx - b.x) * b.vx + (b.ty - b.y) * b.vy <= 0){ boom(b.tx, b.ty, 95, '#7FD8FF'); sfx.twinkle(); return false; } return true; });
    S.booms.forEach(b => { b.t += dt; });
    S.booms = S.booms.filter(b => b.t < 0.9);
    /* meteorer falder; rammer de en kugle, forsvinder de */
    const keep = [];
    for (const m of S.meteors){
      m.x += m.vx * dt; m.y += m.vy * dt; m.rot += dt * 2;
      const hit = S.booms.find(b => b.col !== '#FF8A3D' && Math.hypot(m.x - b.x, m.y - b.y) < radiusOf(b) + m.r);
      if (hit){ S.score += 10; S.api.score(S.score); boom(m.x, m.y, 55, '#FFB8F0'); tone(660, 0.08, 'triangle', 0.05); tone(990, 0.1, 'triangle', 0.04, 0.06);
        for (let i = 0; i < 10; i++) S.parts.push({ x: m.x, y: m.y, vx: (Math.random() - .5) * 260, vy: (Math.random() - .5) * 260, t: 0, c: '#FFE27A' }); continue; }
      if (m.split && m.y > 330){ m.split = false; [-1, 1].forEach(s => { const a = Math.atan2(m.vy, m.vx) + s * 0.35, sp = Math.hypot(m.vx, m.vy); keep.push({ ...m, r: m.r * .75, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, split: false }); }); continue; }
      if (m.y >= GROUND - 14){ hitBuilding(m); continue; }
      keep.push(m);
    }
    S.meteors = keep;
    S.parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; });
    S.parts = S.parts.filter(p => p.t < 1.1);
    draw();
    S.raf = requestAnimationFrame(tick);
  }
  const radiusOf = b => b.R * (b.t < 0.3 ? b.t / 0.3 : b.t < 0.55 ? 1 : Math.max(0, 1 - (b.t - 0.55) / 0.35));

  function draw(){
    const { ctx, begin, visX } = S.C, [x0, x1] = visX();
    begin();
    const g = ctx.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#0B1030'); g.addColorStop(1, '#2A2A6A');
    ctx.fillStyle = g; ctx.fillRect(x0 - 10, -400, x1 - x0 + 20, GROUND + 400);
    S.stars.forEach(s => { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(S.t * 2 + s.p); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    const mg = ctx.createRadialGradient(1380, 140, 30, 1380, 140, 120); mg.addColorStop(0, 'rgba(255,243,192,.35)'); mg.addColorStop(1, 'rgba(255,243,192,0)'); ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(1380, 140, 120, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFF3C0'; ctx.beginPath(); ctx.arc(1380, 140, 46, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(200,190,150,.35)'; [[1366, 128, 9], [1396, 150, 7], [1372, 160, 5]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
    /* bakker og jorden */
    ctx.fillStyle = '#1E2A5A'; ctx.beginPath(); ctx.moveTo(x0 - 10, GROUND); for (let x = x0 - 10; x <= x1 + 10; x += 40) ctx.lineTo(x, GROUND - 60 - Math.sin(x / 140) * 30); ctx.lineTo(x1 + 10, GROUND); ctx.fill();
    ctx.fillStyle = '#2E5A3A'; ctx.fillRect(x0 - 10, GROUND, x1 - x0 + 20, 200);
    ctx.fillStyle = '#3E7A44'; ctx.fillRect(x0 - 10, GROUND, x1 - x0 + 20, 10);
    S.builds.forEach(b => drawBuild(ctx, b));
    /* meteorer med ildhale */
    S.meteors.forEach(m => {
      const a = Math.atan2(m.vy, m.vx), tl = 90;
      const tg = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(a) * tl, m.y - Math.sin(a) * tl); tg.addColorStop(0, 'rgba(255,170,60,.9)'); tg.addColorStop(1, 'rgba(255,90,40,0)');
      ctx.strokeStyle = tg; ctx.lineWidth = m.r * 1.3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - Math.cos(a) * tl, m.y - Math.sin(a) * tl); ctx.stroke();
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rot); ctx.fillStyle = '#8A5A4A'; ctx.strokeStyle = '#3A2420'; ctx.lineWidth = 3;
      ctx.beginPath(); for (let i = 0; i < 7; i++){ const aa = i / 7 * 6.283, rr = m.r * (0.8 + ((i * 7) % 3) * 0.12); ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6A4438'; ctx.beginPath(); ctx.arc(-m.r * .25, -m.r * .2, m.r * .25, 0, 7); ctx.fill(); ctx.restore();
    });
    /* formularer: en lysende stjerne med glimtende hale */
    S.bolts.forEach(b => { ctx.strokeStyle = 'rgba(127,216,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(WAND.x, WAND.y); ctx.lineTo(b.x, b.y); ctx.setLineDash([6, 10]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#E9FFFF'; akStar(ctx, b.x, b.y, 14, S.t * 8); ctx.fill(); ctx.strokeStyle = '#7FD8FF'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.tx, b.ty, 10, 0, 7); ctx.stroke(); });
    /* kuglerne */
    S.booms.forEach(b => { const r = radiusOf(b); if (r <= 0) return;
      const rg = ctx.createRadialGradient(b.x, b.y, r * .1, b.x, b.y, r);
      if (b.col === '#FF8A3D'){ rg.addColorStop(0, 'rgba(255,230,150,.9)'); rg.addColorStop(1, 'rgba(255,120,40,0)'); }
      else { rg.addColorStop(0, 'rgba(255,255,255,.85)'); rg.addColorStop(.5, b.col === '#7FD8FF' ? 'rgba(127,216,255,.55)' : 'rgba(255,184,240,.55)'); rg.addColorStop(1, 'rgba(199,155,255,0)'); }
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 7); ctx.fill();
      if (b.col !== '#FF8A3D'){ ctx.fillStyle = '#FFF6D0'; for (let i = 0; i < 6; i++){ const a = i / 6 * 6.283 + b.t * 3; akStar(ctx, b.x + Math.cos(a) * r * .8, b.y + Math.sin(a) * r * .8, 7, a); ctx.fill(); } } });
    S.parts.forEach(p => { ctx.globalAlpha = Math.max(0, 1 - p.t / 1.1); ctx.fillStyle = p.c; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); });
    ctx.globalAlpha = 1;
    if (S.msgT > 0){ ctx.globalAlpha = Math.min(1, S.msgT); ctx.font = `700 64px ${FONT_C}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE27A'; ctx.strokeStyle = '#140C2A'; ctx.lineWidth = 8; ctx.strokeText(S.msg, 800, 420); ctx.fillText(S.msg, 800, 420); ctx.globalAlpha = 1; }
  }
  function drawBuild(ctx, b){
    const y = GROUND;
    if (!b.alive){ ctx.fillStyle = '#3A2E48'; ctx.beginPath(); ctx.moveTo(b.x - b.w / 2, y); for (let i = 0; i <= 6; i++) ctx.lineTo(b.x - b.w / 2 + i * b.w / 6, y - 14 - (i % 2) * 14); ctx.lineTo(b.x + b.w / 2, y); ctx.fill(); return; }
    ctx.lineWidth = 4; ctx.strokeStyle = '#140C2A';
    if (b.kind === 'hus'){
      ctx.fillStyle = '#C8B8E8'; ctx.fillRect(b.x - 48, y - 80, 96, 80); ctx.strokeRect(b.x - 48, y - 80, 96, 80);
      ctx.fillStyle = '#7A3A5A'; ctx.beginPath(); ctx.moveTo(b.x - 60, y - 78); ctx.lineTo(b.x, y - 132); ctx.lineTo(b.x + 60, y - 78); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFD36E'; ctx.fillRect(b.x - 34, y - 62, 22, 22); ctx.fillRect(b.x + 12, y - 62, 22, 22); ctx.fillStyle = '#5A3A2A'; ctx.fillRect(b.x - 10, y - 40, 20, 40);
      return;
    }
    /* skolen: tre tårne; det midterste har tryllestaven på toppen. Den lilla glans er skjoldet, der tager to slag */
    if (b.hp > 1){ ctx.fillStyle = `rgba(127,216,255,${0.08 + b.hp * 0.04})`; ctx.beginPath(); ctx.ellipse(b.x, y - 40, 170, 200, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = 'rgba(127,216,255,.5)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#140C2A'; ctx.lineWidth = 4; }
    ctx.fillStyle = '#5A4AA8';
    [[-90, 70, 150], [90, 70, 150], [0, 80, 210]].forEach(([dx, w, h]) => { ctx.fillRect(b.x + dx - w / 2, y - h, w, h); ctx.strokeRect(b.x + dx - w / 2, y - h, w, h);
      ctx.fillStyle = '#3A2C78'; ctx.beginPath(); ctx.moveTo(b.x + dx - w / 2 - 8, y - h); ctx.lineTo(b.x + dx, y - h - 60); ctx.lineTo(b.x + dx + w / 2 + 8, y - h); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#5A4AA8'; });
    ctx.fillStyle = '#4A3A98'; ctx.fillRect(b.x - 130, y - 100, 260, 100); ctx.strokeRect(b.x - 130, y - 100, 260, 100);
    ctx.fillStyle = '#FFD36E'; [[-100, -130], [-70, -130], [70, -130], [100, -130], [-14, -180], [6, -180]].forEach(([dx, dy]) => ctx.fillRect(b.x + dx - 7, y + dy, 14, 20));
    ctx.fillStyle = '#5A3A2A'; ctx.beginPath(); ctx.moveTo(b.x - 24, y); ctx.lineTo(b.x - 24, y - 50); ctx.quadraticCurveTo(b.x, y - 76, b.x + 24, y - 50); ctx.lineTo(b.x + 24, y); ctx.fill();
    /* tryllestaven */
    ctx.strokeStyle = '#8A5A3C'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(WAND.x, y - 268); ctx.lineTo(WAND.x, WAND.y + 8); ctx.stroke();
    ctx.fillStyle = '#FFE27A'; akStar(ctx, WAND.x, WAND.y, 14 + Math.sin(S.t * 6) * 2, S.t); ctx.fill();
  }
  function finish(){
    if (!S || S.over) return; S.over = true;
    const n = S.score, w = S.wave, api = S.api;
    setTimeout(() => api.end(n, `Du holdt meteorerne væk i ${w} ${w === 1 ? 'bølge' : 'bølger'}.`), 300);
  }
  Arkade.GAMES.skjold = { start, stop, test: () => { if (S) S.builds.forEach(b => { b.alive = false; }), setTimeout(finish, 50); }, state: () => S && { meteors: S.meteors.map(m => ({ x: m.x, y: m.y, vx: m.vx, vy: m.vy })), score: S.score, wave: S.wave, alive: S.builds.filter(b => b.alive).length } };
})();
