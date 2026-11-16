/* ================= Start: indlæsning, tre gemte spil og bog-introen ================= */

/* ---------- indlæsning: byen bygges og bages bag et tæppe, før titelskærmen vises ----------
   Første gang en ny udgave kører, skal kortet tegnes om (det tager flere sekunder på en telefon).
   Det sker her, så man aldrig ser et kort, der hakker. Næste gang hentes det fra lageret og går hurtigt. */
/* gamle navne: "Dukke 2" hedder nu "Heks 2" */
function fixNames(){ let ch = false; figures.forEach(f => { const m = /^Dukke (\d+)$/.exec(f.name || ''); if (m){ f.name = 'Heks ' + m[1]; ch = true; } }); if (ch) saveAll(); }
async function startGame(){
  fixNames();
  const bar = el('i'), msg = el('p', { class:'ld-msg' }, 'Tryller byen frem …');
  const ld = el('div', { id:'loader', role:'status', 'aria-live':'polite' }, [
    el('div', { class:'ld-logo' }, GAME_NAME),
    el('div', { class:'ld-star', 'aria-hidden':'true', html:'<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="#FFE27A" stroke="#C98A00" stroke-width="1.2" stroke-linejoin="round"/></svg>' }),
    el('div', { class:'ld-bar' }, [ bar ]), msg ]);
  document.body.append(ld);
  const t0 = performance.now(); let shown = 0;
  try { showTown({ quiet: true }); } catch (e){ DBG.row('fejl', { besked: 'indlæsning: ' + e.message }); }
  const canBake = !window.NO_BAKE && !!window.indexedDB;
  while (canBake && performance.now() - t0 < 30000 && !(BAKE.ok && BAKE.ok === BAKE.gen)){
    const t = (performance.now() - t0) / 1000;
    shown = Math.max(shown, Math.min(.95, BAKE.prog * .85 + Math.min(.1, t / 40)));
    bar.style.width = (shown * 100).toFixed(1) + '%';
    if (t > 4) msg.textContent = 'Første gang tager det lidt længere …';
    await wait(100);
  }
  bar.style.width = '100%';
  DBG.row('indlaest', { ms: Math.round(performance.now() - t0), klar: !!(BAKE.ok && BAKE.ok === BAKE.gen) });
  await wait(350);              // lad telefonen tegne kortet færdigt én gang, mens tæppet stadig er der
  showTitle();
  ld.classList.add('out'); setTimeout(() => ld.remove(), 600);
}

/* knappen i byen, der fører tilbage til forsiden (hovedmenuen). Spillet er altid gemt, så man mister ikke noget. */
function menuBtn(){
  return el('button', { class:'iconbtn menu', type:'button', 'aria-label':'Til forsiden', title:'Til forsiden',
    html:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    on:{ click: () => { sfx.pick(); goTo(showTitle); } } });
}

/* ---------- tre gemte spil ---------- */
const SLOT_DATA = ['glimmerstudiet.dukker.v1', 'glimmerstudiet.fremskridt.v1', 'glimmerstudiet.gemtstjerne', 'glimmerstudiet.oekser', 'glimmerstudiet.arkade', 'glimmerstudiet.bamser'];
let firstDress = false;
/* den første heks: ingen tilbage-knap, men en tydelig stor "Jeg er færdig!" i stedet */
function firstDressUi(on){
  $('#backBtn').hidden = on; $('#doneBtn').hidden = !on; $('#randBtn').hidden = false;
  $('#editor').classList.toggle('first-dress', on);
  const d = $('#doneBtn'); if (d){ const t = [...d.childNodes].find(n => n.nodeType === 3); if (t) t.textContent = on ? 'Jeg er færdig!' : 'Færdig!'; }
}         /* sat, når en ny heks skal laves lige efter introen: tilbage-knappen går så ud i byen */
function slotInfo(n){
  const figs = store.get(KEY, [], n), p = store.get(KEY_PROG, null, n) || {};
  const list = Array.isArray(figs) ? figs.slice().sort((a, b) => (b.t || 0) - (a.t || 0)) : [];
  const used = list.length > 0 || !!p.intro || (+p.stars || 0) > 0;
  return { n, used, name: p.name || (list[0] && list[0].name) || '', stars: Math.max(0, +p.stars || 0), st: list[0] ? enforce(fixState(clone(list[0].st))) : null };
}
function setSlot(n){
  SLOT = n; try { localStorage.setItem(SLOT_KEY, String(n)); } catch (e){}
  const f = store.get(KEY, []); figures = Array.isArray(f) ? f : [];
  prog = loadProg(); heroAt = 'hus'; cur = null; history = []; fixNames();
  updateStarPills();
}
function clearSlot(n){ for (const k of SLOT_DATA) store.del(k, n); if (n === SLOT) setSlot(n); }

const BOOK_COL = [['#5B2E91', '#3A1A63'], ['#1F6E6A', '#10433F'], ['#8E2A3F', '#5A1426']];
function showSlots(){
  showScreen('#slots'); playMusic('byen');
  const box = $('#slotsBody'); box.innerHTML = '';
  const books = [1, 2, 3].map(n => {
    const s = slotInfo(n), [c1, c2] = BOOK_COL[n - 1];
    const face = s.used
      ? [ el('div', { class:'sb-port' }, [ dollImg(s.st || enforce(clone(DEFAULT_STATE)), { viewBox: '205 150 390 390', pet: false, alt: '' }) ]),
          el('div', { class:'sb-name' }, s.name || 'Uden navn'),
          el('div', { class:'sb-stars', html: STAR_SVG + '<span>' + s.stars + '</span>' }) ]
      : [ el('div', { class:'sb-port sb-new', html: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 22v56M22 50h56" stroke="#F2D27A" stroke-width="9" stroke-linecap="round"/></svg>' }),
          el('div', { class:'sb-name' }, 'Nyt spil') ];
    const book = el('button', { class:'sbook' + (s.used ? '' : ' empty'), type:'button', style:`--c1:${c1};--c2:${c2}`, 'aria-label': s.used ? `Spil som ${s.name || 'uden navn'}` : 'Start et nyt spil',
      on:{ click: () => pickSlot(n, s.used) } }, [ el('div', { class:'sb-cover' }, face) ]);
    const del = s.used ? el('button', { class:'sb-del', type:'button', 'aria-label':'Slet dette spil', html: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
      on:{ click: e => { e.stopPropagation(); sfx.pick(); showModal('Slet ' + (s.name || 'dette spil') + '?', 'Hele spillet bliver slettet: heksen, stjernerne og alt det, hun har samlet. Det kan ikke fortrydes.', [
        { label:'Nej' }, { label:'Ja, slet', hot:true, fn: () => { clearSlot(n); sfx.undo(); showSlots(); } } ]); } } }) : null;
    return el('div', { class:'sb-wrap' }, [ book, del ]);
  });
  box.append(
    el('div', { class:'sb-bg', 'aria-hidden':'true' }),
    el('div', { class:'place-ui tl' }, [ backBtn('Forsiden', showTitle) ]),
    el('h1', { class:'sb-title' }, 'Hvem skal spille?'),
    el('div', { class:'sb-shelf' }, books));
}
function pickSlot(n, used){
  sfx.magic(); setSlot(n);
  if (used) goTo(showTown); else goTo(showIntro);
}

/* ---------- introen: en illustreret eventyrbog ----------
   Tekst: Kaspers oplæg, skrevet til at kunne læses af en 8-årig. {navn} er det navn, man skriver på første side. */
const INTRO_PAGES = [
  { art:'portraet', lines:[ ['big', 'Hej med dig!'], ['name', 'Jeg hedder'], ['', 'og jeg vil gerne invitere dig ind i min verden.'] ] },
  { art:'hat', lines:[ ['', 'Min verden er ikke helt almindelig.'], ['', 'For jeg er heller ikke helt almindelig …'], ['big glow', 'Jeg er nemlig en heks!'] ] },
  { art:'slot', lines:[ ['', 'Jeg går i skole, ligesom dig.'], ['big', 'Men min skole er en magisk skole!'] ] },
  { art:'kost', lines:[ ['', 'Vi flyver på koste, brygger eliksirer og springer i faldskærm fra skyerne.'], ['', 'Og nogle gange hygger vi os bare.'] ] },
  { art:'doer', lines:[ ['', 'Kunne du tænke dig at tage med?'], ['', 'Så følg mig …'], ['big', 'eller skulle jeg sige …'] ] },
];
const INTRO_END = { text: 'Men hov … hvordan ser jeg egentlig ud? Det må du bestemme!', btn: 'Lav min heks' };

/* tegningerne på venstresiderne: blæk og vandfarve på gammelt papir */
function introArt(kind){
  const INK = '#4A3020', W = (id, c, o = .55) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset=".7" stop-color="${c}" stop-opacity="${o * .45}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const star = (x, y, r, c = '#E2A93B') => `<path d="M ${x} ${y - r} L ${x + r * .28} ${y - r * .28} L ${x + r} ${y} L ${x + r * .28} ${y + r * .28} L ${x} ${y + r} L ${x - r * .28} ${y + r * .28} L ${x - r} ${y} L ${x - r * .28} ${y - r * .28} Z" fill="${c}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const dots = [[60, 70, 7], [330, 90, 9], [300, 360, 6], [80, 330, 8], [350, 230, 5], [50, 200, 5]].map(([x, y, r]) => star(x, y, r)).join('');
  let d = `<defs>${W('wP', '#7B4FD0')}${W('wB', '#3D6FC2')}${W('wG', '#F2C14E', .7)}${W('wR', '#C2465E')}${W('wT', '#2E9C8A')}</defs>`;
  if (kind === 'portraet'){
    d += `<ellipse cx="200" cy="215" rx="150" ry="160" fill="url(#wG)"/>`
      + `<ellipse cx="200" cy="215" rx="112" ry="140" fill="#F7EBD0" stroke="#B88A2E" stroke-width="10"/><ellipse cx="200" cy="215" rx="112" ry="140" fill="none" stroke="${INK}" stroke-width="2"/><ellipse cx="200" cy="215" rx="98" ry="126" fill="url(#wP)" stroke="${INK}" stroke-width="1.5"/>`
      + `<path d="M 116 330 C 124 280 160 262 200 262 C 240 262 276 280 284 330 Z" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/><circle cx="200" cy="222" r="42" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/>`
      + `<path d="M 134 196 Q 200 176 266 196 Q 200 206 134 196 Z" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/><path d="M 160 192 C 172 150 190 116 236 90 C 222 120 226 156 240 190 Z" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/>`
      + `<text x="200" y="244" text-anchor="middle" font-family="Uncial Antiqua, serif" font-size="62" fill="#F2C14E" stroke="${INK}" stroke-width="1.5">?</text>`
      + [[200, 68], [92, 215], [308, 215], [200, 362]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#E2A93B" stroke="${INK}" stroke-width="1.5"/>`).join('') + dots;
  } else if (kind === 'hat'){
    d += `<ellipse cx="200" cy="250" rx="170" ry="130" fill="url(#wP)"/><ellipse cx="290" cy="120" rx="90" ry="70" fill="url(#wG)"/>`
      + `<ellipse cx="190" cy="318" rx="150" ry="34" fill="#5B3FA8" stroke="${INK}" stroke-width="2.5"/><path d="M 72 316 Q 190 346 308 316" fill="none" stroke="#8B6FD8" stroke-width="5" opacity=".6"/>`
      + `<path d="M 112 314 C 130 240 150 170 176 118 C 194 82 226 64 262 70 C 238 84 224 108 224 140 C 226 200 248 262 270 312 Q 190 330 112 314 Z" fill="#6B4FC0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`
      + `<path d="M 122 286 Q 196 304 266 286 L 272 306 Q 194 324 116 306 Z" fill="#C2465E" stroke="${INK}" stroke-width="2"/><rect x="176" y="284" width="34" height="28" rx="4" fill="#F2C14E" stroke="${INK}" stroke-width="2"/><rect x="185" y="292" width="16" height="12" fill="#C2465E" stroke="${INK}" stroke-width="1.5"/>`
      + star(170, 200, 12, '#F2D27A') + star(206, 150, 9, '#F2D27A') + star(150, 250, 8, '#F2D27A')
      + `<path d="M 300 330 L 360 206" stroke="#6A4128" stroke-width="10" stroke-linecap="round"/><path d="M 300 330 L 360 206" stroke="${INK}" stroke-width="2" fill="none"/>` + star(364, 196, 20, '#F2C14E')
      + `<path d="M 340 170 q -20 -30 -60 -36 M 384 178 q 10 -36 -4 -70 M 352 160 q -6 -24 -2 -44" stroke="#E2A93B" stroke-width="3" fill="none" stroke-dasharray="4 8" stroke-linecap="round"/>` + dots;
  } else if (kind === 'slot'){
    d += `<ellipse cx="200" cy="170" rx="190" ry="150" fill="url(#wB)"/><circle cx="300" cy="96" r="40" fill="#F7E7B0" stroke="${INK}" stroke-width="2"/><circle cx="318" cy="84" r="36" fill="#E9D9F2"/>`
      + `<path d="M 0 360 C 80 290 160 284 230 300 C 300 316 360 300 400 280 V 440 H 0 Z" fill="#5E8F5A" stroke="${INK}" stroke-width="2.5"/><path d="M 0 400 C 120 360 260 370 400 340 V 440 H 0 Z" fill="#46703F" opacity=".7"/>`
      + `<rect x="120" y="190" width="160" height="112" fill="#8A7FB0" stroke="${INK}" stroke-width="2.5"/>`
      + [[96, 150, 40, 156], [264, 140, 44, 166], [176, 120, 48, 76]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9A8FC0" stroke="${INK}" stroke-width="2.5"/><path d="M ${x - 8} ${y} L ${x + w / 2} ${y - w * 1.3} L ${x + w + 8} ${y} Z" fill="#5B3FA8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
      + `<path d="M 180 302 V 262 a 20 20 0 0 1 40 0 V 302 Z" fill="#5A3A24" stroke="${INK}" stroke-width="2"/>`
      + [[106, 180], [106, 230], [274, 176], [274, 226], [190, 150], [140, 230], [250, 230]].map(([x, y]) => `<rect x="${x}" y="${y}" width="18" height="24" rx="9" fill="#FFD86B" stroke="${INK}" stroke-width="1.5"/>`).join('')
      + `<path d="M 200 44 V 20 L 226 28 L 200 36" fill="#C2465E" stroke="${INK}" stroke-width="1.5"/>` + dots;
  } else if (kind === 'kost'){
    d += `<circle cx="210" cy="160" r="120" fill="url(#wG)"/><circle cx="210" cy="160" r="86" fill="#F7E7B0" stroke="${INK}" stroke-width="2"/>`
      + `<g transform="rotate(-12 200 170)">`
      + `<path d="M 186 96 C 160 92 140 100 118 96 C 136 108 146 112 160 114 C 146 120 136 126 124 126 C 150 130 170 120 186 110 Z" fill="#E2A93B" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`
      + `<path d="M 70 176 L 300 176" stroke="#8A5A35" stroke-width="9" stroke-linecap="round"/><path d="M 70 176 L 300 176" stroke="${INK}" stroke-width="1.5"/>`
      + `<path d="M 74 166 C 50 160 30 152 8 160 C 24 172 24 180 8 192 C 30 200 50 192 74 186 Z" fill="#E2A93B" stroke="${INK}" stroke-width="2"/><path d="M 74 170 L 20 166 M 74 176 L 14 176 M 74 182 L 20 188" stroke="${INK}" stroke-width="1.2"/>`
      + `<path d="M 212 192 L 236 226" stroke="#3A2A5A" stroke-width="12" stroke-linecap="round"/><path d="M 228 222 L 252 224 Q 256 232 246 234 L 226 232 Z" fill="#6A4128" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
      + `<path d="M 188 110 C 170 128 160 160 154 196 Q 186 206 222 198 C 222 168 216 132 204 110 Z" fill="#6B4FC0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M 202 122 C 220 138 236 156 248 170" stroke="#6B4FC0" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="250" cy="174" r="8" fill="#F2D2B8" stroke="${INK}" stroke-width="1.8"/>`
      + `<circle cx="200" cy="92" r="20" fill="#F2D2B8" stroke="${INK}" stroke-width="2"/><circle cx="210" cy="90" r="2.6" fill="${INK}"/><path d="M 206 101 Q 212 105 217 100" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="204" cy="98" r="4" fill="#FF9AA8" opacity=".6"/>`
      + `<path d="M 178 78 C 168 60 156 40 132 30 C 160 34 184 50 206 74 Z" fill="#5B3FA8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="196" cy="77" rx="32" ry="7" transform="rotate(-8 196 77)" fill="#5B3FA8" stroke="${INK}" stroke-width="2"/><path d="M 180 74 Q 194 70 208 70" stroke="#C2465E" stroke-width="4" fill="none"/>`
      + `</g>`
      + `<ellipse cx="300" cy="352" rx="64" ry="18" fill="#3A2A2A" stroke="${INK}" stroke-width="2"/><path d="M 240 316 Q 236 382 300 384 Q 364 382 360 316 Z" fill="#3A2A2A" stroke="${INK}" stroke-width="2.5"/><ellipse cx="300" cy="316" rx="62" ry="16" fill="#62E0A0" stroke="${INK}" stroke-width="2"/>`
      + [[280, 290, 10], [312, 270, 7], [296, 246, 5], [330, 296, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#B8F5D0" stroke="${INK}" stroke-width="1.5"/>`).join('')
      + `<path d="M 250 392 Q 270 410 300 404 Q 330 410 350 392" stroke="#E2672E" stroke-width="6" fill="none" stroke-linecap="round"/>` + dots;
  } else if (kind === 'doer'){
    d += `<ellipse cx="200" cy="230" rx="180" ry="170" fill="url(#wT)"/><ellipse cx="200" cy="250" rx="120" ry="130" fill="url(#wG)"/>`
      + `<path d="M 110 360 V 170 a 90 90 0 0 1 180 0 V 360 Z" fill="#FFF0B8" stroke="${INK}" stroke-width="3"/>`
      + `<path d="M 110 360 V 170 a 90 90 0 0 1 64 -86 L 150 110 Q 140 140 140 180 V 380 Z" fill="#7A4A2A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="152" cy="250" r="6" fill="#F2C14E" stroke="${INK}" stroke-width="1.5"/>`
      + `<path d="M 160 360 L 240 360 L 330 440 L 70 440 Z" fill="#F7E2A0" opacity=".8"/><path d="M 110 360 H 290" stroke="${INK}" stroke-width="2.5"/>`
      + [[200, 220], [232, 180], [176, 160], [244, 270], [210, 300]].map(([x, y], i) => star(x, y, 8 + (i % 2) * 4, '#FFFFFF')).join('') + dots;
  }
  return `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${d}</svg>`;
}
function introCover(){
  const G = '#E8C66A', INK = '#2A1440';
  const corner = `<path d="M 0 0 H 70 Q 40 10 30 30 Q 10 40 0 70 Z" fill="${G}" stroke="${INK}" stroke-width="1.5"/><circle cx="26" cy="26" r="8" fill="#C2465E" stroke="${INK}" stroke-width="1.5"/>`;
  return `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="22" y="22" width="356" height="396" rx="10" fill="none" stroke="${G}" stroke-width="5"/><rect x="34" y="34" width="332" height="372" rx="6" fill="none" stroke="${G}" stroke-width="1.5" stroke-dasharray="2 6"/>
  <g transform="translate(22 22)">${corner}</g><g transform="translate(378 22) scale(-1 1)">${corner}</g><g transform="translate(22 418) scale(1 -1)">${corner}</g><g transform="translate(378 418) scale(-1 -1)">${corner}</g>
  <path d="M 200 70 L 214 106 L 252 108 L 222 132 L 232 170 L 200 148 L 168 170 L 178 132 L 148 108 L 186 106 Z" fill="${G}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <defs><linearGradient id="icT" x1="0" y1="0" x2="0" y2="1"><stop offset=".1" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFE27A"/><stop offset="1" stop-color="#F2A93B"/></linearGradient></defs>
  <g font-family="Fredoka, 'Baloo 2', sans-serif" font-weight="700" text-anchor="middle" letter-spacing="1">
  <text x="200" y="256" font-size="70" fill="#1A0A30" stroke="#1A0A30" stroke-width="14" stroke-linejoin="round" transform="translate(0 5)">Magiske</text><text x="200" y="256" font-size="70" fill="url(#icT)" stroke="#2A1440" stroke-width="10" stroke-linejoin="round" paint-order="stroke">Magiske</text>
  <text x="200" y="334" font-size="78" fill="#1A0A30" stroke="#1A0A30" stroke-width="14" stroke-linejoin="round" transform="translate(0 5)">Mig</text><text x="200" y="334" font-size="78" fill="url(#icT)" stroke="#2A1440" stroke-width="10" stroke-linejoin="round" paint-order="stroke">Mig</text></g>
  <path d="M 110 362 Q 200 392 290 362" stroke="${G}" stroke-width="3" fill="none"/><circle cx="200" cy="378" r="6" fill="${G}"/></svg>`;
}
function introPage(i, side, name){
  if (side === 'l') return el('div', { class:'pg-art', html: introArt(INTRO_PAGES[i].art) });
  const box = el('div', { class:'pg-text' });
  for (const [cls, txt] of INTRO_PAGES[i].lines){
    if (cls === 'name'){
      const inp = el('input', { class:'pg-name', maxlength:'14', autocomplete:'off', autocapitalize:'words', spellcheck:'false', placeholder:'skriv dit navn', 'aria-label':'Dit navn', value: name || '' });
      box.append(el('p', { class:'pg-line' }, [ txt + ' ', inp ]));
    } else box.append(el('p', { class:'pg-line ' + cls }, txt));
  }
  box.append(el('div', { class:'pg-num' }, String(i + 1)));
  return box;
}
function showIntro(){
  showScreen('#intro'); playMusic('byen');
  const box = $('#introBody'); box.innerHTML = '';
  let i = 0, name = '', busy = false;
  const L = el('div', { class:'pg l' }), R = el('div', { class:'pg r' });
  const arrow = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  /* man blader kun med pilene — et tryk på siden eller Enter gør ikke noget, så man når at læse det hele */
  const next = el('button', { class:'pg-next', type:'button', 'aria-label':'Næste side', html: arrow('M9 5l7 7-7 7') });
  const prev = el('button', { class:'pg-prev', type:'button', 'aria-label':'Forrige side', html: arrow('M15 5l-7 7 7 7') });
  const book = el('div', { class:'ibook' }, [ el('div', { class:'ib-leather' }), L, R, el('div', { class:'ib-spine' }), prev, next ]);
  const after = el('div', { class:'ib-after' }, [ el('p', {}, INTRO_END.text),
    el('div', { class:'ib-btns' }, [ el('button', { class:'btn hot ib-go', type:'button', on:{ click: () => finish() } }, INTRO_END.btn),
      el('button', { class:'btn ib-again', type:'button', on:{ click: () => reopen() } }, 'Læs igen') ]) ]);
  box.append(el('div', { class:'ib-table', 'aria-hidden':'true' }), el('div', { class:'ib-candle', 'aria-hidden':'true' }), book, after);
  const nameOk = () => name.trim().length > 0;
  const arrows = () => { prev.classList.toggle('gone', i === 0); next.disabled = !!R.querySelector('.pg-name') && !nameOk(); };
  const fade = on => book.classList.toggle('turning', on);
  const wireName = () => { arrows(); const inp = R.querySelector('.pg-name'); if (!inp) return;
    inp.addEventListener('input', () => { name = inp.value.replace(/\s+/g, ' ').replace(/^\s/, ''); arrows(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); kbClose(); } });
    kbAttach(inp);
    if (!nameOk()) setTimeout(() => { if (inp.isConnected && !busy) kbOpen(inp); }, calm ? 0 : 700); };
  const fill = () => { L.replaceChildren(introPage(i, 'l')); R.replaceChildren(introPage(i, 'r', name)); wireName(); };
  const tidy = () => { name = name.trim(); name = name.charAt(0).toLocaleUpperCase('da') + name.slice(1); };
  fill();
  async function turn(){
    if (busy || !nameOk()) return; busy = true; kbClose(); sfx.whoosh(); tidy();
    if (i === INTRO_PAGES.length - 1){ fade(true); await closeBook(); busy = false; return; }
    /* et blad vendes frem: forsiden er den højre side nu, bagsiden er den næste venstre side */
    const leaf = el('div', { class:'ib-leaf' }, [ el('div', { class:'lf front' }, [ introPage(i, 'r', name) ]), el('div', { class:'lf back' }, [ introPage(i + 1, 'l') ]) ]);
    fade(true); i++; R.replaceChildren(introPage(i, 'r', name)); book.append(leaf);
    if (!calm){ void leaf.offsetWidth; leaf.classList.add('turn'); await wait(900); }
    L.replaceChildren(introPage(i, 'l')); leaf.remove(); wireName(); fade(false); busy = false;
  }
  async function back(){
    if (busy || i === 0) return; busy = true; kbClose(); sfx.whoosh(); tidy();
    /* et blad vendes tilbage: forsiden er den venstre side nu, bagsiden er den forrige højre side */
    const leaf = el('div', { class:'ib-leaf left' }, [ el('div', { class:'lf front' }, [ introPage(i, 'l') ]), el('div', { class:'lf back page' }, [ introPage(i - 1, 'r', name) ]) ]);
    fade(true); i--; L.replaceChildren(introPage(i, 'l')); book.append(leaf);
    if (!calm){ void leaf.offsetWidth; leaf.classList.add('turn'); await wait(900); }
    R.replaceChildren(introPage(i, 'r', name)); leaf.remove(); wireName(); fade(false); busy = false;
  }
  async function closeBook(){
    /* bogen lukkes: venstre side folder over, og forsiden kommer frem */
    const leaf = el('div', { class:'ib-leaf left closer' }, [ el('div', { class:'lf front' }, [ introPage(i, 'l') ]), el('div', { class:'lf back cover', html: introCover() }) ]);
    L.style.visibility = 'hidden'; book.append(leaf);
    if (!calm){ void leaf.offsetWidth; leaf.classList.add('turn'); await wait(1000); }
    book.classList.add('closed'); sfx.magic();
    prog.name = name; prog.intro = true; saveProg();
    await wait(calm ? 0 : 1300); after.classList.add('on');
  }
  /* "Læs igen": bogen åbnes på første side, hvor man også kan rette navnet */
  async function reopen(){
    if (busy) return; busy = true; sfx.whoosh();
    after.classList.remove('on'); book.classList.remove('closed');
    const c = book.querySelector('.ib-leaf.closer'); if (c) c.remove();
    L.style.visibility = ''; i = 0; fill(); await wait(calm ? 0 : 900); fade(false); busy = false;
  }
  function finish(){
    sfx.pick(); tidy(); prog.name = name; saveProg();
    goTo(() => { firstDress = true; const f = newFigure(); f.name = name; saveAll(); $('#nameInput').value = name; firstDressUi(true); });
  }
  next.addEventListener('click', turn);
  prev.addEventListener('click', back);
}

/* ---------- spillets eget tastatur: runde skrivemaskine-taster i messing på en træplade ----------
   Kun bogstaver, skift, bindestreg, mellemrum, slet og Enter. Systemets tastatur bliver væk (inputmode="none"),
   men et rigtigt tastatur på en computer virker stadig. */
const KB_ROWS = [ ['q','w','e','r','t','y','u','i','o','p','å'], ['a','s','d','f','g','h','j','k','l','æ','ø'], ['shift','z','x','c','v','b','n','m','-','del'], ['space','enter'] ];
const KB = { el: null, inp: null, shift: true, lift: null };
function kbBuild(){
  const lab = { shift: '⇧', del: '⌫', space: 'mellemrum', enter: 'Enter ↵' };
  KB.el = el('div', { id:'kb', class:'kb', role:'group', 'aria-label':'Tastatur', hidden: true },
    KB_ROWS.map(r => el('div', { class:'kb-row' }, r.map(k => el('button', { class:'kb-k k-' + (lab[k] ? k : 'ch'), type:'button', 'data-k': k, 'aria-label': k === 'space' ? 'Mellemrum' : k === 'del' ? 'Slet' : k === 'shift' ? 'Store bogstaver' : k },
      el('span', {}, lab[k] || k))))));
  document.body.append(KB.el);
  KB.el.addEventListener('pointerdown', e => { const b = e.target.closest('.kb-k'); e.preventDefault(); if (!b) return; b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 120); kbPress(b.dataset.k); });
  document.addEventListener('pointerdown', e => { if (KB.el.hidden || e.target.closest('#kb') || e.target === KB.inp) return; kbClose(); }, true);
}
function kbDraw(){ if (!KB.el) return; KB.el.classList.toggle('up', KB.shift); KB.el.querySelectorAll('.k-ch span').forEach(sp => { const k = sp.parentNode.dataset.k; sp.textContent = KB.shift ? k.toLocaleUpperCase('da') : k; }); }
function kbPress(k){
  const inp = KB.inp; if (!inp) return; sfx.pick();
  if (k === 'enter'){ kbClose(); return; }
  if (k === 'shift'){ KB.shift = !KB.shift; kbDraw(); return; }
  let v = inp.value; const max = +inp.getAttribute('maxlength') || 20;
  if (k === 'del') v = v.slice(0, -1);
  else if (v.length < max){ const ch = k === 'space' ? ' ' : KB.shift ? k.toLocaleUpperCase('da') : k; if (!(ch === ' ' && (!v || v.endsWith(' ')))) v += ch; }
  inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true }));
  KB.shift = !v || v.endsWith(' ') || v.endsWith('-'); kbDraw();
}
function kbOpen(inp){
  if (!KB.el) kbBuild();
  KB.inp = inp; KB.shift = !inp.value || /[\s-]$/.test(inp.value); kbDraw();
  KB.el.hidden = false; requestAnimationFrame(() => KB.el.classList.add('on'));
  try { inp.focus({ preventScroll: true }); } catch (e){}
  /* ligger feltet bag tastaturet, skubbes skærmen op, så man kan se, hvad man skriver */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const scr = inp.closest('.screen'); if (!scr) return;
    const kt = window.innerHeight - KB.el.offsetHeight, ib = inp.getBoundingClientRect().bottom + 12;   /* tastaturet glider stadig op, så dets endelige top regnes ud */
    if (ib > kt){ KB.lift = scr; scr.style.transition = 'transform .3s ease'; scr.style.transform = `translateY(${-(ib - kt)}px)`; }
  }));
}
function kbClose(){
  if (!KB.el || KB.el.hidden) return;
  KB.el.classList.remove('on'); setTimeout(() => { if (!KB.el.classList.contains('on')) KB.el.hidden = true; }, 250);
  if (KB.inp){ KB.inp.blur(); KB.inp.dispatchEvent(new Event('change', { bubbles: true })); }
  if (KB.lift){ KB.lift.style.transform = ''; KB.lift = null; }
  KB.inp = null;
}
function kbAttach(inp){
  inp.setAttribute('inputmode', 'none'); inp.setAttribute('autocomplete', 'off');
  if (inp._kb) return; inp._kb = true;
  inp.addEventListener('pointerdown', () => { if (!inp.readOnly) setTimeout(() => kbOpen(inp), 0); });
  inp.addEventListener('focus', () => { if (!inp.readOnly && (!KB.el || KB.el.hidden)) kbOpen(inp); });
}
