/* ================= Boblebutikken: alt nyt kommer i magiske sæbebobler ================= */
const BUB_PRICE = 10;
const PET_CATS = ['pet', 'petpat', 'petacc'];
const BUBBLES = [
  { id:'toej', label:'Tøj og hår', cols:['#FF5FA8','#FFE27A','#7FD8FF'], left: () => lockedList().filter(([c]) => !PET_CATS.includes(c)) },
  { id:'dyr', label:'Kæledyr', cols:['#43D3BE','#FFE27A','#B79BFF'], left: () => lockedList().filter(([c]) => PET_CATS.includes(c)) },
  { id:'rum', label:'Værelset', cols:['#8A5BE8','#FFC02E','#FF8FC7'], left: () => roomLocked() },
];
let bubPick = null, bubTaps = 0, bubBusy = false, BUBN = 0;

/* små tegninger inde i boblen */
const BUB_ICON = {
  toej: '<path d="M 128 96 L 172 96 L 180 118 C 192 160 206 196 214 214 C 186 226 114 226 86 214 C 94 196 108 160 120 118 Z" fill="#FF8FC7" stroke="#B32268" stroke-width="5" stroke-linejoin="round"/><path d="M 132 96 Q 150 112 168 96" fill="none" stroke="#B32268" stroke-width="5"/><path d="M 110 168 Q 150 178 190 168" stroke="#FFE27A" stroke-width="7" fill="none"/>',
  dyr: '<ellipse cx="150" cy="178" rx="40" ry="32" fill="#FFB547" stroke="#B9741A" stroke-width="5"/>' + [[106,132,15],[132,108,15],[168,108,15],[194,132,15]].map(([x,y,r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.25}" fill="#FFB547" stroke="#B9741A" stroke-width="5"/>`).join(''),
  rum: '<rect x="88" y="104" width="20" height="112" rx="6" fill="#9C6B43" stroke="#6A4528" stroke-width="4"/><rect x="104" y="160" width="110" height="34" rx="8" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="4"/><path d="M 108 138 Q 128 126 148 138 Q 150 150 148 160 L 108 160 Z" fill="#FFF8F0" stroke="#C9B6A6" stroke-width="4"/><path d="M 140 156 Q 180 146 214 156 L 218 194 L 140 194 Z" fill="#8A5BE8" stroke="#5E3BC4" stroke-width="4"/><rect x="88" y="194" width="134" height="14" rx="5" fill="#9C6B43" stroke="#6A4528" stroke-width="4"/><path d="M 196 92 A 18 18 0 1 0 214 120 A 14 14 0 1 1 196 92 Z" fill="#FFE27A" stroke="#C99A12" stroke-width="3"/>',
};
/* en sæbeboble: næsten gennemsigtig, regnbuekant, lys fra venstre */
function bubbleSvg(kind, small){
  const b = BUBBLES.find(x => x.id === kind) || BUBBLES[0], [a, c2, c3] = b.cols, n = 'bb' + (BUBN++);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" aria-hidden="true"><defs>
<radialGradient id="${n}f" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#FFFFFF" stop-opacity=".06"/><stop offset=".82" stop-color="${a}" stop-opacity=".2"/><stop offset=".95" stop-color="${c3}" stop-opacity=".45"/><stop offset="1" stop-color="${a}" stop-opacity=".7"/></radialGradient>
<linearGradient id="${n}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".35" stop-color="${c2}"/><stop offset=".65" stop-color="${c3}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
${small ? '' : '<ellipse cx="150" cy="290" rx="70" ry="7" fill="#1A0F3A" opacity=".18"/>'}
<circle cx="150" cy="150" r="130" fill="url(#${n}f)"/>
<g opacity=".92">${BUB_ICON[kind] || ''}</g>
<circle cx="150" cy="150" r="130" fill="none" stroke="url(#${n}r)" stroke-width="${small ? 9 : 6}" opacity=".85"/>
<path d="M 52 112 A 104 104 0 0 1 120 38" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" opacity=".8"/>
<circle cx="56" cy="138" r="7" fill="#FFFFFF" opacity=".8"/>
<path d="M 208 236 A 104 104 0 0 0 250 186" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".45"/>
${small ? '' : star4(250, 60, 12) + star4(46, 236, 9) + star4(270, 222, 7)}</svg>`;
}
const bubbleIcon = kind => bubbleSvg(kind, true);

function showBalls(){ showScreen('#balls'); playMusic('byen'); bubPick = null; bubTaps = 0; bubBusy = false; renderBubbles(); }
function ballHead(){ return el('div', { class:'screen-head' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); goTo(showTown); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + 'Byen' }), el('h2', {}, 'Boblebutikken'), starPill() ]); }
function bubStage(kids){ return el('div', { class:'bub-stage' }, [ el('div', { class:'bub-sky', 'aria-hidden':'true' }), ...kids ]); }

/* trin 1: vælg hvilken slags boble */
function renderBubbles(){
  const box = $('#ballsBody'); box.innerHTML = '';
  if (bubPick) return renderOneBubble();
  const row = el('div', { class:'bub-row' });
  BUBBLES.forEach((b, i) => {
    const n = b.left().length;
    const btn = el('button', { class:'bub' + (n ? '' : ' empty'), type:'button', 'aria-label': b.label, style:`animation-delay:${-i*0.9}s`, html: bubbleSvg(b.id),
      on:{ click: () => { if (!n){ sfx.nope(); toast('Du har fundet alt i ' + b.label.toLowerCase()); return; } sfx.pick(); bubPick = b.id; bubTaps = 0; renderBubbles(); } } });
    row.append(el('div', { class:'bub-col' }, [ btn, el('p', { class:'bub-name' }, b.label), el('p', { class:'bub-left' }, n ? `${n} ting at finde` : 'Alt fundet!') ]));
  });
  const msg = prog.stars < BUB_PRICE ? `En boble koster ${BUB_PRICE} stjerner. Spil i Modehuset for at få flere.` : `Hvad skal der være i boblen? En boble koster ${BUB_PRICE} stjerner.`;
  box.append(ballHead(), bubStage([ el('p', { class:'bub-msg' }, msg), row ]));
}
/* trin 2: én stor boble, tryk tre gange */
function renderOneBubble(){
  const box = $('#ballsBody'); box.innerHTML = '';
  const b = BUBBLES.find(x => x.id === bubPick), n = b.left().length, poor = prog.stars < BUB_PRICE;
  const big = el('button', { class:'bub big' + (poor ? ' empty' : ''), type:'button', 'aria-label': b.label, html: bubbleSvg(b.id), on:{ click: tapBubble } });
  const msg = poor ? `Du mangler ${BUB_PRICE - prog.stars} stjerner til en boble.` : `Tryk tre gange på boblen for at puste den op. Den koster ${BUB_PRICE} stjerner.`;
  box.append(ballHead(), bubStage([ el('p', { class:'bub-msg' }, msg), el('div', { class:'bub-one' }, [ big, el('div', { class:'bub-drops', 'aria-hidden':'true' }) ]),
    el('div', { class:'row center' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); bubPick = null; renderBubbles(); } } }, 'Vælg en anden boble'), el('span', { class:'hint' }, `${n} ting i ${b.label.toLowerCase()}`) ]) ]));
}
async function tapBubble(e){
  if (bubBusy) return;
  const b = BUBBLES.find(x => x.id === bubPick), left = b.left();
  if (!left.length){ sfx.nope(); return; }
  if (prog.stars < BUB_PRICE){ sfx.nope(); toast(`Du mangler ${BUB_PRICE - prog.stars} stjerner`); return; }
  const bub = e.currentTarget; bubTaps++;
  bub.style.setProperty('--grow', 1 + bubTaps * 0.08);
  bub.classList.remove('wobble'); void bub.offsetWidth; bub.classList.add('wobble'); sfx.wobble();
  if (bubTaps < 3) return;
  bubBusy = true; bubTaps = 0;
  await wait(380);
  addStars(-BUB_PRICE);
  const [cat, id] = pick(left);
  prog.unlocked.push(cat + ':' + id); prog.fresh.push(cat + ':' + id); saveProg();
  popDrops(bub.parentNode.querySelector('.bub-drops'), b.cols);
  bub.classList.add('pop'); sfx.crack();
  await wait(460);
  revealItem(cat, id);
}
/* små dråber flyver ud, når boblen springer */
function popDrops(host, cols){
  if (!host || calm) return;
  for (let i = 0; i < 16; i++){
    const a = i / 16 * Math.PI * 2, d = 140 + Math.random() * 90;
    host.append(el('span', { style:`--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d).toFixed(0)}px;background:${cols[i % 3]};width:${10 + (i%3)*5}px;height:${10 + (i%3)*5}px` }));
  }
}
function showcaseState(cat){
  const base = figures.length ? fixState(clone(figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].st)) : clone(DEFAULT_STATE);
  if ((cat === 'petpat' || cat === 'petacc') && base.pet.kind === 'ingen') base.pet.kind = 'kat';
  return base;
}
function revealItem(cat, id){
  let img, catLabel, name, tryBtn;
  if (cat === 'rum'){
    const [slot, item] = id.split('.'), s = ROOM_SLOTS.find(x => x.id === slot);
    const room = Object.assign(getRoom(), { [slot]: item });
    img = el('img', { alt:'', src: svgUrl(roomSvg(room, { only: slot, viewBox: ROOM_VB[slot] })) });
    catLabel = 'Værelset · ' + s.label; name = s.cat[item].label;
    tryBtn = el('button', { class:'btn', type:'button', on:{ click: () => goTo(() => { showRoom(); roomSlot = slot; renderRoom(); }) } }, 'Se det i værelset');
  } else {
    const info = CAT_INFO[cat];
    const st = showcaseState(cat);
    info.apply(st, id);
    if (cat === 'boots') st.robe.id = 'kort';
    if (cat === 'hat' || cat === 'front') st.acc = {};
    const vb = typeof info.vb === 'function' ? info.vb(id) : info.vb;
    const hl = info.multi ? cat + ':' + id : cat;
    img = dollImg(st, info.petOnly ? { viewBox: vb, petOnly: true, hl } : { viewBox: vb, pet: false, bg: true, hl });
    catLabel = info.label; name = info.name(id);
    tryBtn = figures.length ? el('button', { class:'btn', type:'button', on:{ click: () => tryOn(cat) } }, 'Prøv den på') : null;
  }
  const box = $('#ballsBody'); box.innerHTML = '';
  const card = el('div', { class:'reveal' }, [
    el('span', { class:'new-badge' }, 'NY!'),
    el('div', { class:'reveal-pic' }, img),
    el('p', { class:'reveal-cat' }, catLabel),
    el('h3', { class:'reveal-name' }, name),
  ]);
  const b = BUBBLES.find(x => x.id === bubPick), more = b && b.left().length && prog.stars >= BUB_PRICE;
  const buttons = el('div', { class:'row center' }, [ tryBtn,
    more ? el('button', { class:'btn hot', type:'button', on:{ click: () => { renderBubbles(); } } }, 'En boble til') : el('button', { class:'btn hot', type:'button', on:{ click: () => { bubPick = null; renderBubbles(); } } }, 'Videre') ]);
  box.append(ballHead(), bubStage([ card, buttons ]));
  confetti(box, 50);
  bubBusy = false;
}
function tryOn(cat){
  const f = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0];
  const tabFor = { front:'pande', back:'bag', robe:'kjole', cape:'kappe', hat:'hat', boots:'sko', acc:'tilbehoer', pupil:'oejne', lip:'ansigt', mark:'ansigt' };
  const petTabFor = { pet:'dyr', petpat:'pels', petacc:'dyretilbehoer' };
  openEditor(f, { tab: tabFor[cat] || 'oejne', petTab: petTabFor[cat] });
}
