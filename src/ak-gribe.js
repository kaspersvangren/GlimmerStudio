/* ================= Gribemaskinen =================
   Man står helt tæt på den rigtige maskine: glasruden fylder skærmen, bamserne ligger i en bunke på bunden,
   kloen hænger i en skinne foroven, og præmieskakten er i venstre hjørne. Nedenunder er kontrolpanelet med to
   pileknapper og en stor rød GRIB-knap. Et forsøg koster 1 stjerne. Kloen kan gribe ved siden af, og en bamse
   kan glide ud af kloen på vej hen til skakten. Lander bamsen i skakten, kommer den ud af lugen og flytter ind
   på værelset. Man har 20 sekunder til at stille kloen, så griber den af sig selv. */
(() => {
  const E = '#1A1238', TOP = 96, FLOOR = 740, CHUTE = 312, XMIN = 312, XMAX = 1316, LIMIT = 20;
  let S = null;

  function pileLayout(){
    const P = [], kinds = Arkade.BAMSER.map(b => b.k);
    const rows = [[606, 470, 1330, 6], [652, 450, 1350, 9], [700, 452, 1350, 12]];
    rows.forEach(([y, x0, x1, n]) => { for (let i = 0; i < n; i++){ const x = x0 + (x1 - x0) * i / (n - 1) + (Math.random() - .5) * 26;
      P.push({ k: kinds[Math.floor(Math.random() * kinds.length)], x, y: y + (Math.random() - .5) * 10, rot: (Math.random() - .5) * 36, s: 1.25 }); } });
    return P;
  }
  const plushTop = p => p.y - 40 * p.s;

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
    o += `<g class="gr-pile"></g><g class="gr-claw"></g>`;
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
  /* kloen set forfra: tre arme med en krog i spidsen. open = 1 er helt åben, 0 er lukket */
  function clawSvg(x, y, open, sway){
    const a = 3 + open * 30;
    const arm = d => `<path d="M ${d * 12} -2 C ${d * 30} 18 ${d * 32} 44 ${d * 14} 64 L ${d * 4} 68" stroke="#C8C4D8" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M ${d * 12} -2 C ${d * 30} 18 ${d * 32} 44 ${d * 14} 64 L ${d * 4} 68" stroke="#6A6480" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<path d="M ${x} ${TOP} L ${x + sway * 0.4} ${y - 18}" stroke="#C8C4D8" stroke-width="4"/>`
      + `<rect x="${x - 26}" y="${TOP - 32}" width="52" height="34" rx="6" fill="#6A6480" stroke="${E}" stroke-width="3"/>`
      + `<g transform="translate(${(x + sway * 0.4).toFixed(1)} ${y.toFixed(1)}) rotate(${(-sway * 0.25).toFixed(1)})">`
      + arm(0)
      + [-1, 1].map(d => `<g transform="rotate(${(-d * a).toFixed(1)})">${arm(d)}</g>`).join('')
      + `<rect x="-22" y="-24" width="44" height="28" rx="6" fill="#8A8AA8" stroke="${E}" stroke-width="3"/><circle cx="0" cy="-10" r="4" fill="#E0457A"/></g>`;
  }

  function start(stage, api){
    if (prog.stars < 1){
      stage.innerHTML = sceneSvg();
      api.end(0, 'Et forsøg koster 1 stjerne. Tjen stjerner i skolen, og kom tilbage.', { title: 'Du mangler en stjerne', big: '', again: 'Prøv igen (1 ★)', sound: false });
      sfx.nope(); return;
    }
    addStars(-1); playMusic('gribe');
    stage.innerHTML = sceneSvg();
    const svg = stage.querySelector('svg');
    /* grebet er forskelligt fra gang til gang, ligesom på en rigtig maskine */
    S = { api, svg, x: XMIN, y: 200, open: 1, phase: 'flyt', dir: 0, vx: 0, ax: 0, pile: pileLayout(), held: null, grip: 0.35 + Math.random() * 0.65,
          th: 0, w: 0, t0: performance.now(), last: performance.now(), raf: 0, over: false };
    drawPile();
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
    S.raf = requestAnimationFrame(tick);
  }
  function stop(){ if (S){ S.over = true; cancelAnimationFrame(S.raf); window.removeEventListener('keydown', S.kd); window.removeEventListener('keyup', S.ku); } S = null; }

  function drawPile(){
    const g = S.svg.querySelector('.gr-pile');
    g.innerHTML = S.pile.filter(p => p !== S.held && !p.gone && !p.falling).sort((a, b) => a.y - b.y).map(p => `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)})">${Arkade.plush(p.k, p.s)}</g>`).join('');
  }
  function grab(){
    if (!S || S.phase !== 'flyt') return;
    S.phase = 'ned'; S.dir = 0; S.vx = 0; SND.play('gribe.ned', () => sfx.whoosh()); S.api.info('');
    const under = S.pile.filter(p => !p.gone && Math.abs(p.x - S.x) < 60);
    S.target = under.length ? Math.min(...under.map(plushTop)) - 4 : FLOOR - 72;
  }
  /* kloen bevæger sig med lidt træghed; en bamse i kloen svinger som et pendul */
  function moveClaw(want, dt){
    const v0 = S.vx; S.vx += (want - S.vx) * Math.min(1, dt * 7);
    S.ax = (S.vx - v0) / Math.max(dt, 1e-3);
    S.x = Math.max(XMIN, Math.min(XMAX, S.x + S.vx * dt));
    if ((S.x <= XMIN && S.vx < 0) || (S.x >= XMAX && S.vx > 0)){ S.ax += -S.vx * 8; S.vx = 0; }
  }
  function swing(dt){
    const L = 90, g = 1800;
    const acc = -(g / L) * Math.sin(S.th) - (S.ax / L) * Math.cos(S.th) - 2.2 * S.w;
    S.w += acc * dt; S.th += S.w * dt;
    S.th = Math.max(-1.1, Math.min(1.1, S.th));
  }
  function tick(now){
    if (!S || S.over) return;
    const dt = Math.min(0.033, (now - S.last) / 1000); S.last = now;
    if (S.phase === 'flyt'){
      const left = Math.max(0, LIMIT - (now - S.t0) / 1000);
      const sec = Math.ceil(left); if (sec !== S.sec){ S.sec = sec; S.api.info(`Tid ${sec}`); }
      if (left <= 0) grab();
      moveClaw(S.dir * 380, dt);
      if (S.dir){ S.hum = (S.hum || 0) + dt; if (S.hum > .16){ S.hum = 0; SND.play('gribe.motor', () => tone(140, 0.05, 'sawtooth', 0.012, 0, 1)); } }
    } else if (S.phase === 'ned'){
      S.y += 300 * dt; S.open = Math.min(1, S.open + dt * 3);
      if (S.y >= S.target){ S.y = S.target; S.phase = 'luk'; S.pt = now; SND.play('gribe.luk', () => tone(300, 0.12, 'square', 0.03, 0, 0.7)); }
    } else if (S.phase === 'luk'){
      S.open = Math.max(0, 1 - (now - S.pt) / 420);
      if (S.open <= 0){
        /* griber kloen noget? det afhænger af, hvor tæt den er på midten af bamsen, og hvor stærkt grebet er i dag */
        const cand = S.pile.filter(p => !p.gone && Math.abs(p.x - S.x) < 54 && plushTop(p) <= S.target + 50).sort((a, b) => Math.abs(a.x - S.x) - Math.abs(b.x - S.x))[0];
        if (cand){
          const d = Math.abs(cand.x - S.x), chance = Math.max(0, Math.min(1, 1.1 - d / 42)) * (0.45 + 0.55 * S.grip);
          if (Math.random() < chance){ S.held = cand; S.th = (cand.x - S.x) / 90; S.w = 0; SND.play('gribe.greb', () => tone(420, 0.08, 'triangle', 0.04)); }
          else { /* kloen skubber bamsen lidt til siden */ cand.x += Math.sign(cand.x - S.x || 1) * (8 + Math.random() * 10); cand.rot += (Math.random() - .5) * 30; }
        }
        S.phase = 'op'; drawPile();
      }
    } else if (S.phase === 'op'){
      S.y -= 240 * dt; S.ax = 0;
      if (S.y <= 200){ S.y = 200; S.phase = S.held ? 'hjem' : 'tom'; S.ax = 1400; /* et lille ryk, når kloen stopper i toppen */ }
    } else if (S.phase === 'hjem'){
      moveClaw(-320, dt);
      if (S.x <= XMIN + 1){ S.x = XMIN; S.phase = 'slip'; S.pt = now; }
    } else if (S.phase === 'tom'){
      S.open = Math.min(1, S.open + dt * 2.5); moveClaw(-320, dt);
      if (S.open >= 1 && S.x <= XMIN + 1){ S.phase = 'slut'; SND.play('gribe.oev', () => sfx.nope()); setTimeout(() => S && S.api.end(0, 'Kloen greb ved siden af. Prøv at stille den lige over en bamse.', { title: 'Øv!', big: '', again: 'Prøv igen (1 ★)', sound: false }), 500); }
    } else if (S.phase === 'slip'){
      S.open = Math.min(1, (now - S.pt) / 260);
      if (S.open >= 0.6 && S.held) drop(true);
    }
    /* en bamse i kloen svinger og kan glide ud, især hvis grebet er svagt eller den svinger meget */
    if (S.held){
      swing(dt);
      if (S.phase === 'op' || S.phase === 'hjem'){
        const hazard = (1 - S.grip) * 0.32 + Math.abs(S.th) * 0.9 + Math.abs(S.w) * 0.05;
        if (Math.random() < hazard * dt) drop(false);
      }
    }
    /* en bamse, der falder, hopper en gang, når den lander */
    if (S.fall){ const f = S.fall; f.vy += 1800 * dt; f.p.x += f.vx * dt; f.p.y += f.vy * dt; f.p.rot += f.spin * dt;
      if (f.p.y >= f.floor){
        if (!f.bounced && !f.won){ f.bounced = true; f.p.y = f.floor; f.vy = -f.vy * 0.32; f.vx *= 0.5; f.spin *= -0.5; SND.play('gribe.bump', () => tone(180, 0.08, 'sine', 0.05)); }
        else { f.p.y = f.floor; f.p.falling = false; const won = f.won; S.fall = null; drawPile();
          if (won) win(f.p); else { S.phase = 'slut'; setTimeout(() => S && S.api.end(0, 'Bamsen gled ud af kloen. Så tæt på!', { title: 'Næsten!', big: '', again: 'Prøv igen (1 ★)', sound: false }), 800); } } } }
    draw();
    if (S) S.raf = requestAnimationFrame(tick);
  }
  function drop(won){
    const p = S.held; S.held = null;
    const hx = S.x + Math.sin(S.th) * 58, hy = S.y + Math.cos(S.th) * 58;
    p.x = hx; p.y = hy; p.falling = true;
    const vx = S.vx + S.w * 58 * Math.cos(S.th) * 0.6;
    if (won){ p.gone = true; S.fall = { p, vx: vx * 0.3, vy: 0, spin: 60, floor: 790, won: true }; S.phase = 'falder'; SND.play('gribe.slip', () => tone(500, 0.1, 'triangle', 0.04, 0, 0.6)); }
    else {
      /* lander den over skakten, er det en gevinst alligevel */
      const overChute = hx < 404;
      if (overChute){ p.gone = true; S.fall = { p, vx: 0, vy: 0, spin: 80, floor: 790, won: true }; S.phase = 'falder'; return; }
      S.fall = { p, vx, vy: 0, spin: 140 * Math.sign(vx || 1), floor: 690 - Math.random() * 40, won: false }; S.phase = 'falder'; SND.play('gribe.glider', () => sfx.nope());
    }
  }
  function win(p){
    const list = Arkade.myPlush(); list.push(p.k); store.set(Arkade.KEY_PLUSH, list);
    const b = Arkade.BAMSER.find(x => x.k === p.k), won = S.svg.querySelector('.gr-won');
    won.innerHTML = `<g transform="translate(310 900)">${Arkade.plush(p.k, 1.4)}</g>`;
    won.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 400, easing: 'ease-out' });
    SND.play('gribe.vandt', () => sfx.fanfare()); S.phase = 'slut'; S.api.score(1);
    const art = `<svg viewBox="-60 -70 120 120" xmlns="http://www.w3.org/2000/svg">${Arkade.plush(p.k, 1.3)}</svg>`;
    setTimeout(() => S && S.api.end(1, `Den sidder nu på din seng på værelset.`, { title: `Du vandt en ${b.name}!`, big: '', art, again: 'Prøv igen (1 ★)', win: true, sound: false }), 1100);
  }
  function draw(){
    const c = S.svg.querySelector('.gr-claw'), sway = S.held ? Math.sin(S.th) * 30 : 0;
    let o = clawSvg(S.x, S.y, S.open, sway);
    if (S.held){ const hx = S.x + Math.sin(S.th) * 58, hy = S.y + Math.cos(S.th) * 58;
      o += `<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${(S.held.rot * .3 - S.th * 57).toFixed(0)})">${Arkade.plush(S.held.k, S.held.s)}</g>`; }
    if (S.fall && S.fall.p.y < 770) o += `<g transform="translate(${S.fall.p.x.toFixed(1)} ${S.fall.p.y.toFixed(1)}) rotate(${S.fall.p.rot.toFixed(0)})">${Arkade.plush(S.fall.p.k, S.fall.p.s)}</g>`;
    c.innerHTML = o;
  }
  Arkade.GAMES.gribe = { start, stop, test: { aimAt: () => { if (!S) return null; const p = S.pile.filter(q => !q.gone).sort((a, b) => plushTop(a) - plushTop(b))[0]; return p && p.x; }, state: () => S && { x: S.x, phase: S.phase, open: S.open, grip: S.grip } } };
})();
