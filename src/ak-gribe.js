/* ================= Gribemaskinen =================
   Man står helt tæt på den rigtige maskine: glasruden fylder skærmen, bamserne ligger i en bunke på bunden,
   kloen hænger i en wire fra en vogn i skinnen foroven, og præmieskakten er i venstre hjørne. Et forsøg koster
   1 stjerne, og man har 20 sekunder til at stille kloen, så griber den af sig selv.
   Alt er rigtig fysik (matter-js): bamserne er bløde kroppe med hoved og mave, kloen hænger i en wire og svinger,
   og de to forreste arme lukkes af en fjeder. Om man får fat, afhænger af hvor kloen lander, hvordan bamsen ligger,
   og hvor stram fjederen er i dag. Det er aldrig bestemt på forhånd. */
(() => {
  const E = '#1A1238', TOP = 96, FLOOR = 740, XMIN = 312, XMAX = 1316, LIMIT = 20, WALL_L = 212, WALL_R = 1388, CHUTE_X = 404, CHUTE_TOP = 560;
  let S = null;

  function sceneSvg(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet"><defs>`
      + `<linearGradient id="grBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1A3A"/><stop offset="1" stop-color="#4A2E58"/></linearGradient>`
      + `<pattern id="grDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="#5A3A68"/><circle cx="40" cy="38" r="2" fill="#5A3A68"/></pattern></defs>`;
    o += `<rect x="-600" y="-200" width="2800" height="1400" fill="#22163E"/>`;
    /* skabet */
    o += `<rect x="150" y="-30" width="1300" height="1060" rx="30" fill="#C0602A" stroke="${E}" stroke-width="8"/>`;
    o += `<path d="M 170 -10 V 1010 M 1430 -10 V 1010" stroke="#E08A4A" stroke-width="6" opacity=".6"/>`;
    /* glaskassen indeni */
    o += `<rect x="206" y="36" width="1188" height="712" fill="url(#grBack)" stroke="${E}" stroke-width="6"/><rect x="206" y="36" width="1188" height="712" fill="url(#grDots)"/>`;
    o += `<rect x="212" y="${FLOOR}" width="1176" height="8" fill="#2A1A3A"/>`;
    /* skinnen foroven */
    o += `<rect x="214" y="70" width="1172" height="26" rx="6" fill="#8A8AA8" stroke="${E}" stroke-width="3"/><path d="M 220 83 H 1380" stroke="#C8C4D8" stroke-width="4"/>`;
    /* præmieskakten med plexiglas */
    o += `<rect x="214" y="560" width="190" height="186" fill="#140C2A" opacity=".75"/><path d="M 404 560 V 746" stroke="#DDEFFF" stroke-width="7" opacity=".75"/><path d="M 214 560 H 404" stroke="#DDEFFF" stroke-width="5" opacity=".75"/>`;
    o += `<text x="309" y="660" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="26" fill="#FFD36E" opacity=".7">PRÆMIE</text><path d="M 309 680 v 30 m -12 -12 l 12 12 l 12 -12" stroke="#FFD36E" stroke-width="4" fill="none" opacity=".7"/>`;
    o += `<g class="gr-back"></g><g class="gr-pile"></g><g class="gr-claw"></g>`;
    /* glasset glimter */
    o += `<path d="M 240 40 L 380 40 L 240 300 Z M 1060 40 L 1140 40 L 860 744 L 790 744 Z" fill="#FFF" opacity=".06" pointer-events="none"/>`;
    /* kontrolpanelet */
    o += `<path d="M 160 770 H 1440 V 1030 H 160 Z" fill="#2A1E52" stroke="${E}" stroke-width="6"/><path d="M 170 778 H 1430" stroke="#5A4A8A" stroke-width="4"/>`;
    o += `<g class="gr-door"><rect x="220" y="800" width="180" height="170" rx="14" fill="#140C2A" stroke="${E}" stroke-width="4"/><path d="M 228 816 H 392" stroke="#3A2E5A" stroke-width="4"/><g class="gr-won"></g></g>`;
    const btn = (id, x, r, col, label) => `<g class="gr-btn" data-b="${id}" style="cursor:pointer"><ellipse cx="${x}" cy="${890 + 12}" rx="${r}" ry="${r * .55}" fill="#140C2A"/><g class="gr-cap"><ellipse cx="${x}" cy="890" rx="${r}" ry="${r * .55}" fill="${col}" stroke="${E}" stroke-width="5"/><ellipse cx="${x - r * .25}" cy="${890 - r * .18}" rx="${r * .4}" ry="${r * .16}" fill="#FFF" opacity=".35"/>${label}</g><rect x="${x - r - 20}" y="${890 - r}" width="${2 * r + 40}" height="${2 * r}" fill="#FFF" fill-opacity="0"/></g>`;
    o += btn('v', 560, 74, '#7FD8FF', `<path d="M 586 870 L 530 890 L 586 910 Z" fill="${E}"/>`);
    o += btn('h', 760, 74, '#7FD8FF', `<path d="M 734 870 L 790 890 L 734 910 Z" fill="${E}"/>`);
    o += btn('grib', 1160, 108, '#E0457A', `<text x="1160" y="902" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="40" fill="#FFF6D0" stroke="${E}" stroke-width="2" paint-order="stroke">GRIB</text>`);
    o += `<text x="660" y="990" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="22" fill="#B9AEDB">Hold pilene nede</text>`;
    return o + `</svg>`;
  }

  /* ---------------- fysikken ---------------- */
  const SC = 1.25, CAT_WALL = 1, CAT_PLUSH = 2, CAT_CLAW = 4, STEP = 1 / 120;
  const PIV = 20, ARM = [[0, 0], [22, 54], [6, 106], [-9, 110]];   // højre arm målt fra hængslet; venstre er spejlet
  const OPEN = -0.62, SHUT = 0.14;                               // armens vinkel helt åben og helt lukket
  const ANCHOR_Y = 104, L0 = 90, LMAX = 470, HW = 62, HH = 42;
  const rot = (x, y, a) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });

  function build(){
    const { Engine, Bodies, Body, Composite, Constraint } = Matter;
    const eng = Engine.create({ positionIterations: 10, velocityIterations: 8, constraintIterations: 4 });
    eng.gravity.scale = 0.0018;
    const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.6, collisionFilter: { category: CAT_WALL } });
    const walls = [wall((CHUTE_X + WALL_R) / 2, FLOOR + 30, WALL_R - CHUTE_X, 60), wall(WALL_L - 30, 300, 60, 1200), wall(WALL_R + 30, 300, 60, 1200),
      wall(CHUTE_X + 3, (CHUTE_TOP + FLOOR + 60) / 2, 10, FLOOR + 60 - CHUTE_TOP)];
    /* bamserne: et hoved og en mave, ligesom tegningen, så kloen kan få fat under hovedet */
    const kinds = Arkade.BAMSER.map(b => b.k), plushes = [];
    /* en bunke: bred nederst, højest på midten */
    [[676, 15, 470, 1350], [596, 9, 590, 1230], [516, 4, 720, 1100]].forEach(([y0, n, x0, x1]) => { for (let i = 0; i < n; i++){
      const x = x0 + i * (x1 - x0) / (n - 1) + (Math.random() - .5) * 36, y = y0 + (Math.random() - .5) * 20;
      const b = Body.create({ parts: [Bodies.circle(x, y - 14 * SC, 22 * SC), Bodies.circle(x, y + 16 * SC, 21 * SC)],
        friction: 0.9, frictionStatic: 2, restitution: 0.05, frictionAir: 0.012, collisionFilter: { category: CAT_PLUSH } });
      b.off = { x: x - b.position.x, y: y - b.position.y }; b.k = kinds[Math.floor(Math.random() * kinds.length)];
      Body.setAngle(b, (Math.random() - .5) * 0.7); plushes.push(b);
    } });
    /* kloen: et hoved i en wire og to arme på hængsler. En fjeder (senen) trækker armene sammen */
    const grp = Body.nextGroup(true), cf = { group: grp, category: CAT_CLAW, mask: CAT_WALL | CAT_PLUSH };
    const hx = XMIN, hy = ANCHOR_Y + L0 + HH / 2;
    const head = Bodies.rectangle(hx, hy, HW, HH, { density: 0.005, frictionAir: 0.012, friction: 0.5, chamfer: { radius: 6 }, collisionFilter: cf });
    const cable = Constraint.create({ pointA: { x: hx, y: ANCHOR_Y }, bodyB: head, pointB: { x: 0, y: -HH / 2 }, length: L0, stiffness: 0.9, damping: 0.05 });
    const arms = [-1, 1].map(d => {
      const px = hx + d * PIV, py = hy + HH / 2 - 2, parts = [];
      for (let i = 0; i < ARM.length - 1; i++){
        const ax = px + d * ARM[i][0], ay = py + ARM[i][1], bx = px + d * ARM[i + 1][0], by = py + ARM[i + 1][1];
        parts.push(Bodies.rectangle((ax + bx) / 2, (ay + by) / 2, Math.hypot(bx - ax, by - ay) + 10, 11, { angle: Math.atan2(by - ay, bx - ax), chamfer: { radius: 4 }, collisionFilter: cf }));
      }
      const arm = Body.create({ parts, friction: 0.35, frictionStatic: 0.6, frictionAir: 0.02, collisionFilter: cf });
      Body.setDensity(arm, 0.002);
      arm.pts = ARM.map(([x, y]) => ({ x: px + d * x - arm.position.x, y: py + y - arm.position.y }));   // til tegningen
      Body.rotate(arm, d * OPEN, { x: px, y: py });
      arm.a0 = arm.angle - d * OPEN; arm.d = d;
      const pivot = Constraint.create({ bodyA: head, pointA: { x: d * PIV, y: HH / 2 - 2 }, bodyB: arm, pointB: { x: px - arm.position.x, y: py - arm.position.y }, length: 0, stiffness: 1 });
      const e = rot(d * ARM[1][0], ARM[1][1], d * OPEN);
      const tendon = Constraint.create({ bodyA: head, pointA: { x: d * PIV + e.x, y: HH / 2 - 2 + e.y }, bodyB: arm, pointB: { x: px + e.x - arm.position.x, y: py + e.y - arm.position.y }, length: 0, stiffness: 0.03, damping: 0.1 });
      arm.tendon = tendon; arm.cons = [pivot, tendon];
      return arm;
    });
    Composite.add(eng.world, [...walls, ...plushes, head, ...arms, cable, ...arms.flatMap(a => a.cons)]);
    return { eng, plushes, head, arms, cable };
  }
  /* sætter armenes fjeder mod vinklen th (højre arm; venstre spejlet) */
  function aimArms(th){
    S.arms.forEach(a => { const e = rot(a.d * ARM[1][0], ARM[1][1], a.d * th), loc = { x: a.d * PIV + e.x, y: HH / 2 - 2 + e.y };
      a.tendon.pointA = rot(loc.x, loc.y, S.head.angle); a.tendon.angleA = S.head.angle; a.tendon.stiffness = S.grip; });
  }
  const attach = () => { const p = rot(0, -HH / 2, S.head.angle); return { x: S.head.position.x + p.x, y: S.head.position.y + p.y }; };

  function start(stage, api){
    if (prog.stars < 1){
      stage.innerHTML = sceneSvg();
      api.end(0, 'Et forsøg koster 1 stjerne. Tjen stjerner i skolen, og kom tilbage.', { title: 'Du mangler en stjerne', big: '', again: 'Prøv igen (1 ★)', sound: false });
      sfx.nope(); return;
    }
    addStars(-1); playMusic('gribe');
    stage.innerHTML = sceneSvg();
    const svg = stage.querySelector('svg'), w = build();
    /* fjederen er lidt forskellig fra gang til gang, ligesom på en rigtig maskine */
    S = Object.assign(w, { api, svg, tx: XMIN, vx: 0, dir: 0, close: 0, phase: 'flyt', grip: 0.001 + Math.random() * 0.0018, acc: 0, slack: 0,
      t0: performance.now(), last: performance.now(), raf: 0, over: false, carried: false, wonP: null });
    aimArms(OPEN);
    for (let i = 0; i < 420; i++) Matter.Engine.update(S.eng, STEP * 1000);   // bunken falder på plads, før man ser den
    S.plushes = S.plushes.filter(p => !(p.position.x < CHUTE_X && p.position.y > CHUTE_TOP));
    const pile = svg.querySelector('.gr-pile');
    pile.innerHTML = S.plushes.map((p, i) => `<g data-i="${i}">${Arkade.plush(p.k, SC)}</g>`).join('');
    S.plushes.forEach((p, i) => { p.el = pile.children[i]; });
    const hold = (b, on) => { if (!S || S.phase !== 'flyt') return; if (b === 'grib'){ if (on) grab(); return; } S.dir = on ? (b === 'v' ? -1 : 1) : 0; };
    svg.querySelectorAll('.gr-btn').forEach(g => {
      g.addEventListener('pointerdown', e => { e.preventDefault(); g.classList.add('down'); hold(g.dataset.b, true); });
      const off = () => { g.classList.remove('down'); if (g.dataset.b !== 'grib') hold(g.dataset.b, false); };
      g.addEventListener('pointerup', off); g.addEventListener('pointerleave', off); g.addEventListener('pointercancel', off);
    });
    S.kd = e => { if (!S) return; if (e.key === 'ArrowLeft'){ S.dir = -1; e.preventDefault(); } else if (e.key === 'ArrowRight'){ S.dir = 1; e.preventDefault(); } else if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); if (S.phase === 'flyt') grab(); } };
    S.ku = e => { if (S && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) S.dir = 0; };
    window.addEventListener('keydown', S.kd); window.addEventListener('keyup', S.ku);
    api.score(0); api.info(`Tid ${LIMIT}`);
    draw(); S.raf = requestAnimationFrame(tick);
  }
  function stop(){ if (S){ S.over = true; cancelAnimationFrame(S.raf); window.removeEventListener('keydown', S.kd); window.removeEventListener('keyup', S.ku); try { Matter.Engine.clear(S.eng); } catch (e){} } S = null; }

  function grab(){
    if (!S || S.phase !== 'flyt') return;
    S.phase = 'ned'; S.dir = 0; S.slack = 0; S.api.info(''); SND.play('gribe.ned', () => sfx.whoosh());
  }

  /* ét fast fysik-skridt (1/120 s) */
  function step(h){
    const ph = S.phase, c = S.cable;
    /* vognen i skinnen kører med træghed; kloen hænger efter og svinger */
    let want = 0;
    if (ph === 'flyt') want = S.dir * 380;
    else if (ph === 'hjem' || ph === 'tom') want = Math.max(-360, Math.min(360, (XMIN - S.tx) * 3));
    const acc = 1300 * h; S.vx += Math.max(-acc, Math.min(acc, want - S.vx));
    S.tx += S.vx * h; if (S.tx < XMIN){ S.tx = XMIN; S.vx = 0; } if (S.tx > XMAX){ S.tx = XMAX; S.vx = 0; }
    c.pointA.x = S.tx;
    /* wiren er et reb: den kan trække, men ikke skubbe */
    const a = attach(), dist = Math.hypot(a.x - S.tx, a.y - ANCHOR_Y);
    if (ph === 'ned'){
      c.length = Math.min(LMAX, c.length + 260 * h, dist + 24);
      /* står kloen på bunken, bliver wiren slap */
      if (dist < c.length - 6 && S.head.velocity.y < 0.25) S.slack += h; else S.slack = 0;
      if (S.slack > 0.1 || c.length >= LMAX){ c.length = Math.min(c.length, dist + 2); S.phase = 'luk'; S.pt = 0; SND.play('gribe.luk', () => tone(300, 0.12, 'square', 0.03, 0, 0.7)); }
    } else if (ph === 'op' || ph === 'tom'){
      c.length = Math.max(L0, c.length - 200 * h);
    }
    c.stiffness = dist > c.length - 0.5 ? 0.9 : 0.000001;
    /* armene */
    if (ph === 'luk'){ S.close = Math.min(1, S.close + h / 0.7); }
    if (ph === 'slip' || ph === 'efter' || ph === 'tomslip'){ S.close = Math.max(0, S.close - h / 0.3); }
    aimArms(OPEN + (SHUT - OPEN) * S.close);
    Matter.Engine.update(S.eng, h * 1000);
    /* er en bamse røget ned i skakten? */
    for (const p of S.plushes){
      if (p.gone) continue;
      if (p.position.x < CHUTE_X && p.position.y > FLOOR + 50){ p.gone = true; Matter.Composite.remove(S.eng.world, p); p.el.remove(); if (!S.wonP){ S.wonP = p; win(p); } }
      if ((ph === 'op' || ph === 'hjem') && p.position.y < 470) S.carried = true;
    }
  }
  function tick(now){
    if (!S || S.over) return;
    const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
    const ph = S.phase;
    if (ph === 'flyt'){
      const left = Math.max(0, LIMIT - (now - S.t0) / 1000), sec = Math.ceil(left);
      if (sec !== S.sec){ S.sec = sec; S.api.info(`Tid ${sec}`); }
      if (left <= 0) grab();
      if (S.dir){ S.hum = (S.hum || 0) + dt; if (S.hum > .16){ S.hum = 0; SND.play('gribe.motor', () => tone(140, 0.05, 'sawtooth', 0.012, 0, 1)); } }
    }
    S.pt = (S.pt || 0) + dt;
    if (ph === 'luk' && S.close >= 1 && S.pt > 1.05){ S.phase = 'op'; S.pt = 0; }
    else if (ph === 'op' && S.cable.length <= L0 + 0.5){ S.phase = 'hjem'; S.pt = 0; if (S.carried) SND.play('gribe.greb', () => tone(420, 0.08, 'triangle', 0.04)); }
    else if (ph === 'hjem' && Math.abs(S.tx - XMIN) < 1 && Math.abs(S.vx) < 5 && S.pt > 0.3){ S.phase = 'slip'; S.pt = 0; SND.play('gribe.slip', () => tone(500, 0.1, 'triangle', 0.04, 0, 0.6)); }
    else if (ph === 'slip' && S.pt > 0.4){ S.phase = 'efter'; S.pt = 0; }
    else if (ph === 'efter' && (S.wonP || S.pt > (S.carried ? 2.2 : 0.6)) && !S.ended){ S.ended = true; if (!S.wonP) lost(); }
    S.acc += dt;
    while (S && S.acc >= STEP){ S.acc -= STEP; step(STEP); }
    if (!S) return;
    draw();
    S.raf = requestAnimationFrame(tick);
  }
  /* ingen gevinst: fik kloen løftet noget, var det tæt på */
  function lost(){
    S.phase = 'slut';
    if (S.carried){ SND.play('gribe.glider', () => sfx.nope()); setTimeout(() => S && S.api.end(0, 'Bamsen gled ud af kloen. Så tæt på!', { title: 'Næsten!', big: '', again: 'Prøv igen (1 ★)', sound: false }), 400); }
    else { SND.play('gribe.oev', () => sfx.nope()); setTimeout(() => S && S.api.end(0, 'Kloen fik ikke ordentligt fat. Prøv at ramme midt over en bamse.', { title: 'Øv!', big: '', again: 'Prøv igen (1 ★)', sound: false }), 400); }
  }
  function win(p){
    const list = Arkade.myPlush(); list.push(p.k); store.set(Arkade.KEY_PLUSH, list);
    const b = Arkade.BAMSER.find(x => x.k === p.k), won = S.svg.querySelector('.gr-won');
    won.innerHTML = `<g transform="translate(310 900)">${Arkade.plush(p.k, 1.4)}</g>`;
    won.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 400, easing: 'ease-out' });
    SND.play('gribe.vandt', () => sfx.fanfare()); S.api.score(1); S.ended = true;
    const art = `<svg viewBox="-60 -70 120 120" xmlns="http://www.w3.org/2000/svg">${Arkade.plush(p.k, 1.3)}</svg>`;
    setTimeout(() => S && S.api.end(1, `Den sidder nu på din seng på værelset.`, { title: `Du vandt en ${b.name}!`, big: '', art, again: 'Prøv igen (1 ★)', win: true, sound: false }), 1100);
  }

  /* ---------------- tegningen ---------------- */
  const f1 = n => n.toFixed(1);
  function armPath(a){
    const pts = a.pts.map(p => { const q = rot(p.x, p.y, a.angle - a.a0); return { x: a.position.x + q.x, y: a.position.y + q.y }; });
    return `M ${f1(pts[0].x)} ${f1(pts[0].y)} ` + pts.slice(1).map(p => `L ${f1(p.x)} ${f1(p.y)}`).join(' ');
  }
  function draw(){
    for (const p of S.plushes){ if (p.gone) continue;
      p.el.setAttribute('transform', `translate(${f1(p.position.x)} ${f1(p.position.y)}) rotate(${f1(p.angle * 57.2958)}) translate(${f1(p.off.x)} ${f1(p.off.y)})`); }
    const H = S.head, a = attach(), deg = f1(H.angle * 57.2958);
    /* den bagerste arm (den tredje) ses bag bamserne */
    const back = 72 + 30 * S.close;
    S.svg.querySelector('.gr-back').innerHTML = `<g transform="translate(${f1(H.position.x)} ${f1(H.position.y)}) rotate(${deg})"><path d="M 0 ${HH / 2 - 4} C 4 ${f1(HH / 2 + back * .5)} 4 ${f1(HH / 2 + back * .8)} 0 ${f1(HH / 2 + back)} L -8 ${f1(HH / 2 + 5 + back)}" stroke="#8A84A0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    let o = `<path d="M ${f1(S.tx)} ${TOP} L ${f1(a.x)} ${f1(a.y)}" stroke="#C8C4D8" stroke-width="4"/>`
      + `<rect x="${f1(S.tx - 26)}" y="${TOP - 32}" width="52" height="34" rx="6" fill="#6A6480" stroke="${E}" stroke-width="3"/>`;
    S.arms.forEach(arm => { const d = armPath(arm);
      o += `<path d="${d}" stroke="${E}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#C8C4D8" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#F0EEF8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`; });
    o += `<g transform="translate(${f1(H.position.x)} ${f1(H.position.y)}) rotate(${deg})"><rect x="${-HW / 2}" y="${-HH / 2}" width="${HW}" height="${HH}" rx="8" fill="#8A8AA8" stroke="${E}" stroke-width="3"/><rect x="${-HW / 2 + 6}" y="${-HH / 2 + 5}" width="${HW - 12}" height="6" rx="3" fill="#B8B6CC"/><circle cx="0" cy="2" r="5" fill="#E0457A"/>`
      + [-1, 1].map(d => `<circle cx="${d * PIV}" cy="${HH / 2 - 2}" r="5.5" fill="#6A6480" stroke="${E}" stroke-width="2"/>`).join('') + `</g>`;
    S.svg.querySelector('.gr-claw').innerHTML = o;
  }
  Arkade.GAMES.gribe = { start, stop, test: {
    aimAt: () => { if (!S) return null; const p = S.plushes.filter(q => !q.gone).sort((a, b) => a.position.y - b.position.y)[0]; return p && p.position.x; },
    setGrip: g => { if (S) S.grip = g; },
    state: () => S && { x: S.tx, phase: S.phase, open: 1 - S.close, grip: S.grip, carried: S.carried, won: !!S.wonP, len: S.cable.length } } };
})();
