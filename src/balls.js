/* ================= Overraskelseskugler ================= */
const BALL_PRICE = 10;
const BALL_LOOKS = [['#FF5FA8','#FFC1DC','#7B5CFF'],['#7B5CFF','#C9B6FF','#43D3BE'],['#43D3BE','#C8F2EA','#FF5FA8'],['#FFC02E','#FFE9A8','#FF5FA8'],['#6FA8FF','#CFE2FF','#FFC02E']];
let ballLook = BALL_LOOKS[0], ballTaps = 0, ballBusy = false;

function ballSvg(look){
  const [a, b, c] = look;
  return `<svg viewBox="0 0 300 300" aria-hidden="true"><defs><radialGradient id="bg1" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="${b}"/><stop offset="0.55" stop-color="${a}"/><stop offset="1" stop-color="${adj(a,-0.18)}"/></radialGradient>
<clipPath id="bc"><circle cx="150" cy="150" r="128"/></clipPath></defs>
<ellipse cx="150" cy="286" rx="96" ry="10" fill="#5B3A8C" opacity="0.15"/>
<circle cx="150" cy="150" r="128" fill="url(#bg1)" stroke="${adj(a,-0.3)}" stroke-width="5"/>
<g clip-path="url(#bc)"><path d="M 0 132 Q 150 112 300 132 L 300 168 Q 150 148 0 168 Z" fill="${c}"/>${[30,80,130,180,230,280].map(x=>`<circle cx="${x}" cy="${150 - (x-150)*(x-150)/4000}" r="6" fill="#FFFFFF" opacity="0.9"/>`).join('')}
<path d="M 0 150 Q 150 130 300 150" fill="none" stroke="${adj(c,-0.3)}" stroke-width="3" opacity="0.5"/></g>
<path d="M 70 92 Q 92 56 136 44" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.55"/>
<g transform="translate(206,98) rotate(14)"><polygon points="${star5pts(0,0,30,13)}" fill="#FFE27A" stroke="#C99A12" stroke-width="3" stroke-linejoin="round"/>${star4(-6,-8,6)}</g>
${star4(96,206,10)}${star4(214,214,7)}${star4(64,150,6)}</svg>`;
}
function showBalls(){ showScreen('#balls'); playMusic('byen'); ballTaps = 0; ballBusy = false; ballLook = pick(BALL_LOOKS); renderBallIdle(); }
function ballHead(){ return el('div', { class:'screen-head' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); goTo(showTown); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + 'Byen' }), el('h2', {}, 'Overraskelseskugler'), starPill() ]); }
function renderBallIdle(){
  const box = $('#ballsBody'); box.innerHTML = '';
  const left = lockedList().length;
  let msg;
  if (!left) msg = 'Du har fundet alt! Der kommer flere ting i kuglerne senere.';
  else if (prog.stars < BALL_PRICE) msg = `En kugle koster ${BALL_PRICE} stjerner. Spil i Modehuset for at få flere.`;
  else msg = `Tryk tre gange på kuglen for at åbne den. Den koster ${BALL_PRICE} stjerner.`;
  const ball = el('button', { class:'ball', type:'button', 'aria-label':'Overraskelseskugle', html: ballSvg(ballLook), on:{ click: tapBall } });
  if (!left || prog.stars < BALL_PRICE) ball.classList.add('sleep');
  box.append(ballHead(), el('div', { class:'ball-stage' }, [ ball, el('p', { class:'ball-msg' }, msg), el('p', { class:'hint center' }, `${left} ting tilbage at finde`) ]));
}
async function tapBall(e){
  if (ballBusy) return;
  const left = lockedList();
  if (!left.length){ sfx.nope(); return; }
  if (prog.stars < BALL_PRICE){ sfx.nope(); toast(`Du mangler ${BALL_PRICE - prog.stars} stjerner`); return; }
  const ball = e.currentTarget; ballTaps++;
  ball.classList.remove('wobble'); void ball.offsetWidth; ball.classList.add('wobble'); sfx.wobble();
  if (ballTaps < 3) return;
  ballBusy = true; ballTaps = 0;
  await wait(380);
  addStars(-BALL_PRICE);
  const [cat, id] = pick(left);
  prog.unlocked.push(cat + ':' + id); prog.fresh.push(cat + ':' + id); saveProg();
  ball.classList.add('burst'); sfx.crack();
  await wait(420);
  revealItem(cat, id);
}
function showcaseState(cat){
  const base = figures.length ? fixState(clone(figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0].st)) : clone(DEFAULT_STATE);
  if ((cat === 'petpat' || cat === 'petacc') && base.pet.kind === 'ingen') base.pet.kind = 'kat';
  return base;
}
function revealItem(cat, id){
  const info = CAT_INFO[cat];
  const st = showcaseState(cat);
  info.apply(st, id);
  if (cat === 'boots') st.robe.id = 'kort';
  if (cat === 'hat' || cat === 'front') st.acc = {};
  const vb = typeof info.vb === 'function' ? info.vb(id) : info.vb;
  const hl = info.multi ? cat + ':' + id : cat;
  const img = dollImg(st, info.petOnly ? { viewBox: vb, petOnly: true, hl } : { viewBox: vb, pet: false, bg: true, hl });
  const box = $('#ballsBody'); box.innerHTML = '';
  const card = el('div', { class:'reveal' }, [
    el('span', { class:'new-badge' }, 'NY!'),
    el('div', { class:'reveal-pic' }, img),
    el('p', { class:'reveal-cat' }, info.label),
    el('h3', { class:'reveal-name' }, info.name(id)),
  ]);
  const left = lockedList().length;
  const buttons = el('div', { class:'row center' }, [
    figures.length ? el('button', { class:'btn', type:'button', on:{ click: () => tryOn(cat) } }, 'Prøv den på en dukke') : null,
    left && prog.stars >= BALL_PRICE ? el('button', { class:'btn hot', type:'button', on:{ click: () => { ballLook = pick(BALL_LOOKS); renderBallIdle(); } } }, 'Åbn en til') : el('button', { class:'btn hot', type:'button', on:{ click: renderBallIdle } }, 'Videre'),
  ]);
  box.append(ballHead(), el('div', { class:'ball-stage' }, [ card, buttons ]));
  confetti(box, 50);
  ballBusy = false;
}
function tryOn(cat){
  const f = figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))[0];
  const tabFor = { front:'pande', back:'bag', top:'overdel', bottom:'underdel', shoes:'sko', acc:'tilbehoer', pupil:'oejne', liner:'makeup', lip:'makeup', mark:'makeup' };
  const petTabFor = { pet:'dyr', petpat:'pels', petacc:'dyretilbehoer' };
  openEditor(f, { tab: tabFor[cat] || 'hud', petTab: petTabFor[cat] });
}
