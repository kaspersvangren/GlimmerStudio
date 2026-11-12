/* ================= Kosteflyvning =================
   Hele faget ligger i sin egen lukkede kasse (Kost), så ingen navne herinde kan ramme andre filer.
   Tryk = flyv op, tyngdekraften trækker ned. Ringene giver fart; to ringe over hinanden giver et loop,
   og loopet giver et boost, der selv styrer gennem de næste fem ringe. To klassekammerater flyver
   samme bane i baggrunden, og pladsen giver guld, sølv eller bronze. */
const Kost = (() => {
  const PX = 430, TOP = 140, BOT = 860;
  const GRAV = 1900, FLAP = -620, VMAXF = 780, V0 = 430;
  const BOOST_N = 5;
  const RIDER_H = 250;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, a = {}, html) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; };
  const TEACHER = { skin:'#C68653', eyes:{ color:'#5C3A24', pupil:'rund' }, mk:{ blush:'#E07A6A', lips:'#A0526B', lipShape:'grin', mark:'fregner', markColor:'#7A4A2A' },
    front:'pjusket', back:'kort', hair:{ a:'#B5432A', b:'#E2672E', ombre:false, tie:'#2E4A7A' },
    robe:{ id:'kort', a:'#2E4A7A', b:'#E9C46A' }, cape:{ id:'kort', a:'#8A2A2A', b:'#E9C46A' }, hat:{ id:'ingen', a:'#2E4A7A', b:'#E9C46A' },
    boots:{ id:'hoeje', a:'#5C3A24', b:'#E9C46A' }, acc:{ toerklaede:'#E8E4F4', baelte:'#5C3A24' }, pet:{ kind:'ingen', a:'#FFFFFF', b:'#FFFFFF', c:'#FFFFFF', pattern:'ingen', eyes:'#3D8BFF', acc:{}, name:'' } };
  /* flyverbriller i panden (figurens koordinater) */
  const GOGGLES = `<path d="M 300 330 Q 400 300 501 330" stroke="#3A2A20" stroke-width="10" fill="none"/>`
    + [[364, 322], [437, 322]].map(([x, y]) => `<rect x="${x-30}" y="${y-22}" width="60" height="44" rx="20" fill="#3A2A20" stroke="#8A6420" stroke-width="5"/><rect x="${x-21}" y="${y-14}" width="42" height="28" rx="13" fill="#7FD8FF" opacity=".85"/><path d="M ${x-12} ${y-6} q 6 -5 14 -5" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')
    + `<path d="M 394 320 H 407" stroke="#8A6420" stroke-width="7"/>`;
  const TEACH = 'Kaptajn Sky';
  let S = null, raf = 0, keyOn = false;

  /* ---------- tegninger ---------- */
  function broomSvg(){
    return `<path d="M -150 6 L -96 -6 L -96 18 Z" fill="#E9C46A"/>`
      + `<path d="M -98 -10 C -130 -18 -170 -16 -196 -4 C -170 2 -170 14 -196 22 C -170 30 -130 28 -98 20 Z" fill="#E9C46A" stroke="#8A6420" stroke-width="3" stroke-linejoin="round"/>`
      + `<path d="M -110 -4 L -186 -6 M -110 6 L -190 8 M -110 14 L -184 18" stroke="#B98A2E" stroke-width="2.5" fill="none"/>`
      + `<rect x="-104" y="-6" width="14" height="22" rx="4" fill="#8A2A2A" stroke="#4A1414" stroke-width="2.5"/>`
      + `<rect x="-92" y="0" width="230" height="11" rx="5.5" fill="#8A5A3C" stroke="#4A2E1E" stroke-width="2.5"/><path d="M -88 2 H 132" stroke="#B5844A" stroke-width="3"/>`;
  }
  /* en rytter: figuren sidder på tværs af kosten, dyret bagpå */
  function rider(st, opts = {}){
    const g = mk('g', { class:'kf-rider' + (opts.cls ? ' ' + opts.cls : '') });
    const tilt = mk('g', { class:'kf-tilt' });
    const w = RIDER_H * 500 / 1030, hip = RIDER_H * (600 - 40) / 1030;
    let inner = '';
    if (st.pet && st.pet.kind !== 'ingen') inner += `<image href="${dollUrl(st, { viewBox: VB.pet, petOnly: true })}" x="-176" y="-92" width="84" height="93"/>`;
    inner += `<image href="${dollUrl(st, { viewBox:'150 40 500 1030', pet:false })}" x="${-w/2 + 10}" y="${-hip}" width="${w}" height="${RIDER_H}"/>`;
    inner += broomSvg();
    if (opts.trail) inner = `<g class="kf-trail">${[0, 1, 2, 3].map(i => star4(-210 - i * 34, 6 + (i % 2) * 10, 10 - i * 1.5, '#FFF6D0', .9 - i * .2)).join('')}</g>` + inner;
    tilt.innerHTML = inner; g.append(tilt);
    return g;
  }
  function ringEls(r){
    const col = r.dbl ? '#C79BFF' : '#F2C14E', dk = r.dbl ? '#6B3FA0' : '#A87A1A', rx = 40, ry = 118;
    const arc = (side) => `M ${r.x} ${r.y - ry} A ${rx} ${ry} 0 0 ${side} ${r.x} ${r.y + ry}`;
    const back = mk('g', { class:'kf-ring' }, `<ellipse cx="${r.x}" cy="${r.y}" rx="${rx + 30}" ry="${ry + 30}" fill="${col}" opacity=".12"/><path d="${arc(0)}" fill="none" stroke="${dk}" stroke-width="20" stroke-linecap="round"/><path d="${arc(0)}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"/>`);
    const front = mk('g', { class:'kf-ring' }, `<path d="${arc(1)}" fill="none" stroke="${dk}" stroke-width="20" stroke-linecap="round"/><path d="${arc(1)}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"/><path d="M ${r.x + 18} ${r.y - 80} Q ${r.x + 34} ${r.y - 20} ${r.x + 26} ${r.y + 40}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".7"/>`
      + (r.dbl === 'hi' ? `<g transform="translate(${r.x} ${r.y + 150})"><rect x="-52" y="-20" width="104" height="40" rx="20" fill="#6B3FA0" stroke="#FFFFFF" stroke-width="3"/><text x="0" y="9" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="24" fill="#FFFFFF">LOOP</text></g>` : ''));
    return [back, front];
  }
  function bubbleEl(b){
    return mk('g', { class:'kf-bub' }, `<g transform="translate(${b.x} ${b.y})"><g class="kf-bob"><circle r="44" fill="#FFFFFF" fill-opacity=".1" stroke="#BFE8FF" stroke-width="4"/><circle r="44" fill="none" stroke="#FF8FC7" stroke-width="2" opacity=".7" stroke-dasharray="30 40"/>${starP(0, 3, 24, '#FFE27A')}<path d="M -26 -14 A 30 30 0 0 1 -6 -32" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></g></g>`);
  }
  function gate(x){
    return `<g><path d="M ${x} 70 V 960" stroke="#3A2A20" stroke-width="16"/><path d="M ${x} 70 V 960" stroke="#8A5A3C" stroke-width="8"/>`
      + `<g transform="translate(${x} 70)"><path d="M 0 0 L 150 16 L 150 96 L 0 80 Z" fill="#FFFFFF" stroke="#2A2340" stroke-width="4"/>`
      + Array.from({ length: 4 }, (_, i) => Array.from({ length: 2 }, (_, j) => ((i + j) % 2 ? '' : `<path d="M ${i*37.5} ${j*40 + i*4} l 37.5 4 v 40 l -37.5 -4 Z" fill="#2A2340"/>`)).join('')).join('')
      + `</g><g transform="translate(${x} 960)"><rect x="-70" y="-36" width="140" height="44" rx="10" fill="#E0457A" stroke="#FFFFFF" stroke-width="4"/><text x="0" y="-5" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF">MÅL</text></g></g>`;
  }
  /* baggrunden i tre lag, der glider forskelligt hurtigt */
  function farTile(){
    let o = `<path d="M 0 700 L 160 520 L 300 640 L 470 470 L 640 620 L 820 500 L 1000 650 L 1180 480 L 1380 640 L 1600 520 L 1800 660 L 2000 540 L 2200 680 L 2400 500 L 2600 640 L 2800 520 L 3000 650 L 3200 700 V 1400 H 0 Z" fill="#2A2058"/>`;
    /* skolen på bjerget */
    const sx = 1180, sy = 480;
    o += `<rect x="${sx-70}" y="${sy-60}" width="140" height="70" fill="#1E1844"/><rect x="${sx-90}" y="${sy-120}" width="34" height="130" fill="#1E1844"/><rect x="${sx+56}" y="${sy-110}" width="34" height="120" fill="#1E1844"/><rect x="${sx-18}" y="${sy-150}" width="36" height="160" fill="#1E1844"/>`
      + `<path d="M ${sx-96} ${sy-118} L ${sx-73} ${sy-170} L ${sx-50} ${sy-118} Z M ${sx+50} ${sy-108} L ${sx+73} ${sy-158} L ${sx+96} ${sy-108} Z M ${sx-24} ${sy-148} L ${sx} ${sy-214} L ${sx+24} ${sy-148} Z" fill="#1E1844"/>`
      + [[sx-78, sy-90], [sx+68, sy-80], [sx-6, sy-120], [sx-40, sy-36], [sx+20, sy-36]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="16" rx="5" fill="#FFD86B" opacity=".85"/>`).join('');
    return o;
  }
  function midTile(){
    let o = `<path d="M 0 820 C 200 740 380 760 560 800 C 760 840 940 730 1140 760 C 1340 790 1480 760 1600 790 C 1800 830 2000 740 2200 770 C 2400 800 2600 730 2800 780 C 3000 820 3100 800 3200 820 V 1400 H 0 Z" fill="#3A2E6A"/>`;
    for (let i = 0; i < 26; i++){ const x = 40 + i * 123 + (i % 3) * 20, y = 800 + Math.sin(i * 1.7) * 28, s = .7 + (i % 4) * .12;
      o += `<path d="M ${x} ${y - 90*s} L ${x + 30*s} ${y} L ${x - 30*s} ${y} Z" fill="#2A2050"/>`; }
    /* små huse med lys i vinduerne */
    for (const x of [380, 1260, 2140, 2900]) o += `<rect x="${x}" y="764" width="70" height="50" fill="#2A2050"/><path d="M ${x - 8} 766 L ${x + 35} 730 L ${x + 78} 766 Z" fill="#2A2050"/><rect x="${x + 14}" y="778" width="12" height="14" fill="#FFD86B" opacity=".8"/><rect x="${x + 44}" y="778" width="12" height="14" fill="#FFD86B" opacity=".6"/>`;
    return o;
  }
  function cloudTile(){
    const cl = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})" opacity=".55"><ellipse rx="90" ry="30" fill="#6A5AA8"/><ellipse cx="40" cy="-20" rx="56" ry="34" fill="#7A6AB8"/><ellipse cx="-40" cy="-12" rx="46" ry="26" fill="#7A6AB8"/></g>`;
    return cl(200, 260, 1) + cl(900, 160, .8) + cl(1500, 330, 1.2) + cl(2300, 210, .9) + cl(2900, 380, 1);
  }
  function nearTile(){
    let o = `<rect x="0" y="985" width="3200" height="500" fill="#14102E"/>`;
    for (let i = 0; i < 34; i++){ const x = i * 96 + (i % 2) * 30, h = 70 + (i * 37) % 50;
      o += `<path d="M ${x} ${1000 - h} C ${x + 40} ${1000 - h + 24} ${x + 56} ${1000 - h/2} ${x + 60} 1000 H ${x - 60} C ${x - 56} ${1000 - h/2} ${x - 40} ${1000 - h + 24} ${x} ${1000 - h} Z" fill="#1A1438"/>`; }
    return o;
  }
  function sceneSvg(){
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" class="kf-svg"><defs>`
      + `<linearGradient id="kfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A4E"/><stop offset=".55" stop-color="#3E2E88"/><stop offset="1" stop-color="#B0608E"/></linearGradient></defs>`;
    o += `<rect x="-1700" y="-700" width="5000" height="700" fill="#141A4E"/><rect x="-1700" y="0" width="5000" height="1000" fill="url(#kfSky)"/><rect x="-1700" y="1000" width="5000" height="700" fill="#14102E"/>`;
    let seed = 5; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 70; i++) o += `<circle cx="${(-700 + r() * 3000).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(1 + r() * 2.2).toFixed(1)}" fill="#FFFFFF" opacity="${(.4 + r() * .6).toFixed(2)}"/>`;
    o += `<g transform="translate(1320 150)"><circle r="120" fill="#FFF6D8" opacity=".12"/><circle r="62" fill="#FFF6D8"/><circle cx="24" cy="-14" r="56" fill="#3A2E7A" opacity=".9"/></g>`;
    o += `<g class="kf-far">${farTile()}<g transform="translate(3200 0)">${farTile()}</g></g>`;
    o += `<g class="kf-mid">${midTile()}<g transform="translate(3200 0)">${midTile()}</g></g>`;
    o += `<g class="kf-cloud">${cloudTile()}<g transform="translate(3200 0)">${cloudTile()}</g></g>`;
    o += `<g class="kf-rivals"></g><g class="kf-world"></g><g class="kf-me"></g><g class="kf-front"></g>`;
    o += `<g class="kf-near">${nearTile()}<g transform="translate(3200 0)">${nearTile()}</g></g>`;
    o += `<g class="kf-fx"></g>`;
    o += placeMood([], { vign: .6, dx: 200, dw: 1200 });
    return o + `</svg>`;
  }

  /* ---------- banen ---------- */
  function makeCourse(){
    const rings = [], bubbles = [], dbl = new Set([6, 15, 24]);
    let x = 1500, y = 520;
    for (let i = 0; i < 32; i++){
      if (dbl.has(i)){ const lo = { x, y: 660, dbl:'lo' }, hi = { x, y: 360, dbl:'hi' }; lo.pair = hi; hi.pair = lo; rings.push(lo, hi); y = 540; x += 700; continue; }
      y = clamp(y + (Math.random() * 2 - 1) * 240, 260, 700); rings.push({ x, y }); x += 470 + Math.random() * 130;
    }
    const singles = rings.filter(r => !r.dbl);
    for (let i = 0; i + 1 < singles.length && bubbles.length < 10; i += 3){ const a = singles[i], b = singles[i + 1];
      bubbles.push({ x: (a.x + b.x) / 2, y: clamp((a.y + b.y) / 2 + (Math.random() < .5 ? -170 : 170), 200, 820) }); }
    return { rings, bubbles, end: x + 300 };
  }
  function rivalPlan(){
    /* to klassekammerater: en lidt langsom og en hurtig; farten svinger lidt undervejs */
    return [{ v: V0 * (1.07 + Math.random() * .04), ph: Math.random() * 6, lane: 300 }, { v: V0 * (1.28 + Math.random() * .04), ph: Math.random() * 6, lane: 470 }];
  }
  const rivalDist = (rv, t) => rv.v * t + 60 * Math.sin(t * .8 + rv.ph) - 60 * Math.sin(rv.ph);

  /* ---------- skærmen ---------- */
  function show(){
    showScreen('#broom'); playMusic('show');
    const hero = heroState(), taken = [];
    const mates = [0, 1].map(i => { const own = i === 0 && Math.random() < 0.3 ? ownGuest(figures.length ? figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].id : null) : null; const g = own || randomGuest(taken); taken.push(g.name); return g; });
    S = { hero, mates, course: makeCourse(), rivals: rivalPlan(), x: 0, y: 520, vy: 0, v: V0, t: 0, run: 'wait', cam: 0,
      rings: 0, ringsAll: 0, bubbles: 0, loop: null, boost: 0, flash: 0, bonk: 0, finT: 0, auto: !!(window.KOST_AUTO) };
    S.ringsAll = S.course.rings.length;
    const box = $('#broomBody'); box.innerHTML = '';
    const scene = el('div', { class:'scene-wrap', id:'kfScene', html: scopeIds(sceneSvg(), 'kf') });
    const loopBtn = el('button', { class:'kf-loop', type:'button', disabled: true, 'aria-label':'Loop', html:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M 10 34 C 2 24 8 8 24 8 C 40 8 46 24 38 34 C 32 42 20 42 16 34 C 12 26 20 18 28 22" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M 26 16 L 30 23 L 22 26" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>LOOP</span>' });
    const track = el('div', { class:'kf-track', 'aria-hidden':'true' }, [ el('div', { class:'kf-line' }), el('span', { class:'kf-flag' }, '🏁'),
      el('span', { class:'kf-dot r0', style:`background:${S.mates[0].st.robe.a}` }), el('span', { class:'kf-dot r1', style:`background:${S.mates[1].st.robe.a}` }), el('span', { class:'kf-dot me', style:`background:${hero.robe.a}` }) ]);
    const count = el('span', { class:'starpill kf-count', html: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#7FD8FF" stroke-width="2.4"/><path d="M12 6l1.8 4 4.2.4-3.2 2.8 1 4.2L12 15.2 8.2 17.4l1-4.2L6 10.4l4.2-.4z" fill="#FFC02E"/></svg><span class="n">0</span>` });
    box.append(scene, track, loopBtn, ...placeUi([ backBtn('Gangen', () => { stop(); showSchool(); }) ], [ count, starPill() ]));
    /* banen bygges én gang som elementer i verden */
    const world = scene.querySelector('.kf-world'), front = scene.querySelector('.kf-front');
    for (const r of S.course.rings){ const [b, f] = ringEls(r); r.back = b; r.front = f; world.append(b); front.append(f); }
    for (const b of S.course.bubbles){ b.el = bubbleEl(b); world.append(b.el); }
    world.append(mk('g', {}, gate(S.course.end)));
    S.me = rider(hero, { trail: true }); scene.querySelector('.kf-me').append(S.me);
    S.rv = S.mates.map((m, i) => { const g = rider(m.st, { cls:'kf-rival' }); scene.querySelector('.kf-rivals').append(g); return g; });
    scene.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; flap(); });
    loopBtn.addEventListener('click', e => { e.stopPropagation(); tryLoop(); });
    if (!keyOn){ keyOn = true; document.addEventListener('keydown', e => { if (!S || $('#broom').hidden) return; if (e.key === ' ' || e.key === 'ArrowUp'){ e.preventDefault(); flap(); } if (e.key === 'l' || e.key === 'L') tryLoop(); }); }
    draw();
    intro();
  }
  function intro(){
    const t = TEACHER, img = svgUrl(renderDoll(t, { viewBox:'200 140 400 400', pet:false }).replace(/<\/svg>$/, GOGGLES + '</svg>'));
    const card = el('div', { class:'reveal magic m-rum kf-intro' }, [
      el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
      el('div', { class:'kf-teach' }, [ el('img', { alt:'', src: img }) ]),
      el('div', { class:'reveal-info' }, [
        el('p', { class:'reveal-cat' }, TEACH),
        el('h3', { class:'reveal-name' }, 'Klar til at flyve?'),
        el('p', { class:'kf-how' }, 'Tryk på skærmen for at flyve op. Flyv gennem ringene, så går det hurtigere. Ved to ringe over hinanden: tryk på LOOP!'),
        el('div', { class:'reveal-btns row' }, [ el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); veil.remove(); countdown(); } } }, 'Klar!') ]) ]) ]);
    const veil = el('div', { class:'shop-veil kf-veil' }, [ card ]);
    $('#broomBody').append(veil);
    if (S.auto) { veil.remove(); countdown(); }
  }
  async function countdown(){
    const box = $('#broomBody'), big = el('div', { class:'kf-big' }); box.append(big);
    S.run = 'count';
    for (const n of ['3', '2', '1', 'Afsted!']){ big.textContent = n; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); tone(n.length > 1 ? 880 : 440, n.length > 1 ? 0.3 : 0.12, 'triangle', 0.07); await wait(S.auto ? 50 : 700); }
    big.remove(); S.run = 'fly'; S.t = 0; S.last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stop(){ cancelAnimationFrame(raf); raf = 0; if (S) S.run = 'stop'; }
  function flap(){ if (!S || S.run !== 'fly' || S.loop) return; if (S.boost > 0) return; S.vy = FLAP; tone(520, 0.06, 'sine', 0.035, 0, 1.6); }

  /* ---------- loop og boost ---------- */
  function nextDouble(){ return S.course.rings.find(r => r.dbl === 'lo' && !r.done && r.x > S.x - 40); }
  function loopReady(){ if (!S || S.run !== 'fly' || S.loop || S.boost > 0) return null; const r = nextDouble(); return r && r.x - S.x < 760 && r.x - S.x > -40 ? r : null; }
  function tryLoop(){
    const r = loopReady(); if (!r){ return; }
    S.loop = { lo: r, hi: r.pair, ph: 'ind', t: 0, cam: S.cam };
    sfx.magic();
  }
  function passRing(r, boosted){
    if (r.done) return; r.done = true; S.rings++;
    r.back.classList.add('ok'); r.front.classList.add('ok');
    if (!boosted) S.v = Math.min(V0 * 1.38, S.v + 55);
    tone(880 + (S.rings % 5) * 60, 0.12, 'triangle', 0.05); tone(1320, 0.1, 'triangle', 0.035, 0.06);
    spark(r.x, r.y, r.dbl ? '#C79BFF' : '#FFE27A', 7);
  }
  function spark(x, y, col, n){
    if (calm) return; const fx = $('#kfScene .kf-fx'); if (!fx) return;
    for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, d = 50 + Math.random() * 50;
      const s = mk('g', { transform:`translate(${x} ${y})` }, `<g class="kf-spark" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px">${star4(0, 0, 10 + Math.random() * 6, col)}</g>`);
      fx.append(s); setTimeout(() => s.remove(), 700); }
  }

  /* ---------- hver billedramme ---------- */
  function frame(now){
    if (!S || S.run === 'stop' || $('#broom').hidden){ raf = 0; return; }
    const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
    step(dt); draw();
    raf = requestAnimationFrame(frame);
  }
  function step(dt){
    if (S.run === 'fly' || S.run === 'done') S.t += dt;
    const x0 = S.x;
    if (S.loop){
      const L = S.loop, cy = (L.lo.y + L.hi.y) / 2, rad = (L.lo.y - L.hi.y) / 2;
      if (L.ph === 'ind'){ /* styr selv ned til den nederste ring */
        S.x += S.v * 1.15 * dt; const k = clamp(1 - (L.lo.x - S.x) / 700, 0, 1); S.y += (L.lo.y - S.y) * Math.min(1, dt * (3 + 6 * k)); S.vy = 0;
        if (S.x >= L.lo.x){ S.x = L.lo.x; S.y = L.lo.y; L.ph = 'rundt'; L.t = 0; L.cam = S.x - PX; passRing(L.lo, true); }
      } else {
        L.t += dt / 1.5; const t = Math.min(1, L.t), f = Math.PI / 2 - 2 * Math.PI * t;
        S.x = L.lo.x + rad * Math.cos(f); S.y = cy + rad * Math.sin(f); S.ang = Math.atan2(-Math.cos(f), Math.sin(f)) * 180 / Math.PI;
        if (t >= .5 && !L.hi.done) passRing(L.hi, true);
        if (t >= 1){ S.loop = null; S.x = L.lo.x; S.y = L.lo.y; S.ang = 0; S.boost = BOOST_N; S.v = V0 * 1.75; boostStart(); }
        S.cam = L.cam; return;
      }
    } else if (S.boost > 0){
      S.x += S.v * dt;
      const nr = S.course.rings.find(r => !r.done && r.x >= S.x - 5 && !r.dbl);
      if (nr){ S.y += (nr.y - S.y) * Math.min(1, dt * 6); if (x0 < nr.x && S.x >= nr.x){ passRing(nr, true); S.boost--; if (S.boost <= 0) boostEnd(); } } else { S.boost = 0; boostEnd(); }
      S.vy = 0;
      /* boostet tager også de bobler, der ligger tæt på */
    } else {
      S.x += S.v * dt;
      S.vy = Math.min(VMAXF, S.vy + GRAV * dt); S.y += S.vy * dt;
      if (S.y > BOT){ S.y = BOT; S.vy = -480; S.v = Math.max(V0 * .8, S.v - 40); tone(160, 0.12, 'sine', 0.06, 0, 0.7); }
      if (S.y < TOP){ S.y = TOP; S.vy = Math.max(0, S.vy); }
      S.v += (V0 - S.v) * Math.min(1, dt * .35);
      /* ringe vi passerer */
      for (const r of S.course.rings){
        if (r.done || r.missed || !(x0 < r.x && S.x >= r.x)) continue;
        const d = Math.abs(S.y - r.y);
        if (d < 100) passRing(r);
        else { r.missed = true; if (d < 140){ S.vy = S.y < r.y ? -260 : 260; S.v = Math.max(V0 * .8, S.v - 60); tone(200, 0.1, 'square', 0.03, 0, 0.8); S.bonk = .4; } }
      }
      if (S.auto) autopilot();
    }
    /* bobler */
    for (const b of S.course.bubbles){ if (b.got) continue; const dx = b.x - S.x, dy = b.y - (S.y - 40); if (dx * dx + dy * dy < (S.boost > 0 ? 130 * 130 : 80 * 80)){ b.got = true; S.bubbles++; b.el.classList.add('pop'); sfx.coin(); spark(b.x, b.y, '#FFE27A', 6); const n = $('#broomBody .kf-count .n'); if (n) n.textContent = S.bubbles; } }
    S.ang = S.loop ? S.ang : clamp(S.vy / 30, -16, 22) * (S.boost > 0 ? 0 : 1);
    S.cam = S.x - PX;
    if (S.bonk > 0) S.bonk -= dt;
    if (S.run === 'fly' && S.x >= S.course.end){ S.run = 'done'; S.finT = S.t; finish(); }
  }
  function boostStart(){ S.me.classList.add('boost'); tone(660, 0.4, 'sawtooth', 0.03, 0, 2); const b = $('#broomBody .kf-big') || el('div', { class:'kf-big boostmsg' }, 'BOOST!'); $('#broomBody').append(b); setTimeout(() => b.remove(), 1000); }
  function boostEnd(){ S.me.classList.remove('boost'); S.v = V0 * 1.3; }
  function autopilot(){
    const r = S.course.rings.find(q => !q.done && !q.missed && q.x > S.x);
    const lr = loopReady(); if (lr && Math.random() < 0.05) tryLoop();
    const ty = r ? r.y + 10 : 520;
    if (S.y > ty + 20 && S.vy > -120) S.vy = FLAP;
  }

  /* ---------- tegn ---------- */
  function draw(){
    const sc = $('#kfScene'); if (!sc || !S) return;
    const cam = S.cam;
    const par = (sel, k) => { const g = sc.querySelector(sel); if (g) g.setAttribute('transform', `translate(${(-((cam * k) % 3200 + 3200) % 3200 - 800).toFixed(1)} 0)`); };
    par('.kf-far', .12); par('.kf-mid', .35); par('.kf-cloud', .6); par('.kf-near', 1.25);
    sc.querySelector('.kf-world').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    sc.querySelector('.kf-front').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    sc.querySelector('.kf-fx').setAttribute('transform', `translate(${(-cam).toFixed(1)} 0)`);
    S.me.setAttribute('transform', `translate(${(S.x - cam).toFixed(1)} ${S.y.toFixed(1)})`);
    S.me.firstChild.setAttribute('transform', `rotate(${(S.ang || 0).toFixed(1)})`);
    /* klassekammeraterne i baggrunden, mindre og lidt blegere */
    S.rivals.forEach((rv, i) => {
      const d = S.run === 'fly' || S.run === 'done' ? rivalDist(rv, S.t) : 0, sx = PX + (d - S.x) * .9, sy = rv.lane + Math.sin(S.t * 1.3 + rv.ph) * 60;
      S.rv[i].setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) scale(.6)`);
      const dot = $('#broomBody .kf-dot.r' + i); if (dot) dot.style.left = (clamp(d / S.course.end, 0, 1) * 100).toFixed(1) + '%';
    });
    const me = $('#broomBody .kf-dot.me'); if (me) me.style.left = (clamp(S.x / S.course.end, 0, 1) * 100).toFixed(1) + '%';
    const lb = $('#broomBody .kf-loop'); if (lb){ const on = !!loopReady(); if (lb.disabled === on) lb.disabled = !on; lb.classList.toggle('on', on); }
  }

  /* ---------- i mål ---------- */
  async function finish(){
    const T = S.finT, rTimes = S.rivals.map(rv => { let t = 0; while (rivalDist(rv, t) < S.course.end && t < 600) t += 0.05; return t; });
    const place = 1 + rTimes.filter(t => t < T).length, medal = ['guld', 'sølv', 'bronze'][place - 1];
    const stars = (4 - place) + Math.floor(S.bubbles / 2);
    prog.flights = (prog.flights || 0) + 1; saveProg(); addStars(stars);
    await wait(S.auto ? 50 : 1200);
    stop();
    sfx.fanfare();
    const MED = { guld:['#F2C14E','#A87A1A'], 'sølv':['#D8DCE8','#8A90A8'], bronze:['#D98A4A','#8A4A1E'] }[medal];
    const medSvg = `<svg viewBox="0 0 120 150" aria-hidden="true"><path d="M 34 0 L 50 54 L 60 50 L 70 54 L 86 0 Z" fill="#E0457A"/><path d="M 50 0 L 60 50 L 70 0 Z" fill="#2E4A7A"/><circle cx="60" cy="96" r="44" fill="${MED[0]}" stroke="${MED[1]}" stroke-width="6"/><circle cx="60" cy="96" r="32" fill="none" stroke="${MED[1]}" stroke-width="3" opacity=".6"/><text x="60" y="112" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="44" fill="${MED[1]}">${place}</text><path d="M 34 72 A 34 34 0 0 1 56 60" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;
    const card = el('div', { class:'reveal magic m-rum kf-end' }, [
      el('div', { class:'mc-pattern', 'aria-hidden':'true' }),
      ...[0, 1, 2, 3].map(i => el('span', { class:'mc-corner c' + i, 'aria-hidden':'true', html: MC_CORNER })),
      el('div', { class:'kf-medal', html: medSvg }),
      el('div', { class:'reveal-info' }, [
        el('p', { class:'reveal-cat' }, `${medal[0].toUpperCase() + medal.slice(1)} · ${T.toFixed(1)} sekunder`),
        el('h3', { class:'reveal-name' }, place === 1 ? 'Du vandt løbet!' : `Du blev nummer ${place}!`),
        el('p', { class:'kf-how' }, `${S.rings} af ${S.ringsAll} ringe · ${S.bubbles} stjernebobler`),
        el('div', { class:'lesson-stars', html: STAR_SVG.repeat(Math.min(12, stars)) }),
        el('p', { class:'kf-how' }, `Du fik ${stars} ${stars === 1 ? 'stjerne' : 'stjerner'}.`),
        el('div', { class:'reveal-btns row' }, [
          el('button', { class:'btn', type:'button', on:{ click: () => { sfx.pick(); goTo(showSchool); } } }, 'Tilbage til gangen'),
          el('button', { class:'btn hot', type:'button', on:{ click: () => { sfx.pick(); goTo(show); } } }, 'Flyv igen') ]) ]) ]);
    const veil = el('div', { class:'shop-veil' }, [ card ]);
    $('#broomBody').append(veil); confetti(veil, place === 1 ? 70 : 30);
    S.result = { place, stars, time: T, rings: S.rings, bubbles: S.bubbles };
  }
  /* til Tegnebordet: et stillbillede af banen og læreren */
  function previewSvg(){
    const hero = heroState(), div = document.createElement('div'); div.innerHTML = sceneSvg();
    const q = c => div.querySelector(c), world = q('.kf-world'), front = q('.kf-front');
    for (const r of [{ x: 760, y: 470 }, { x: 1240, y: 660, dbl:'lo' }, { x: 1240, y: 360, dbl:'hi' }]){ const [b, f] = ringEls(r); world.append(b); front.append(f); }
    world.append(bubbleEl({ x: 1000, y: 300 }));
    const me = rider(hero); me.setAttribute('transform', 'translate(430 500)'); q('.kf-me').append(me);
    const m = randomGuest([]), rv = rider(m.st, { cls:'kf-rival' }); rv.setAttribute('transform', 'translate(1000 520) scale(.6)'); q('.kf-rivals').append(rv);
    for (const [c, k] of [['.kf-far', .12], ['.kf-mid', .35], ['.kf-cloud', .6], ['.kf-near', 1.25]]) q(c).setAttribute('transform', 'translate(-800 0)');
    return scopeIds(div.innerHTML, 'kp');
  }
  const teacherSvg = vb => renderDoll(TEACHER, { viewBox: vb, pet:false }).replace(/<\/svg>$/, GOGGLES + '</svg>');
  return { show, state: () => S, previewSvg, teacherSvg };
})();
