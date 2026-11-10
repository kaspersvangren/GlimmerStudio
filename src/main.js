/* ================= Forside og start ================= */
function showHome(){
  cur = null; gameDress = null; showScreen('#home'); renderHome();
}
function renderHome(){
  $('#homeStars').innerHTML = ''; $('#homeStars').append(starPill());
  const left = lockedList().length;
  $('#ballInfo').textContent = left ? `${left} ting at finde · ${BALL_PRICE} stjerner pr. kugle` : 'Du har fundet alt!';
  const g = $('#figGrid'); g.innerHTML = '';
  g.append(el('div', { class:'card new' }, [ el('button', { class:'open', type:'button', on:{ click: newFigure } }, [ el('span', { class:'plus', 'aria-hidden':'true' }, '+'), 'Ny dukke' ]) ]));
  for (const f of figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))){
    const st = enforce(fixState(clone(f.st)));
    g.append(el('div', { class:'card' }, [
      el('button', { class:'open', type:'button', on:{ click: () => openEditor(f) } }, [ dollImg(st, { bg:true, viewBox:'100 90 600 640' }), el('span', { class:'nm' }, f.name), st.pet.kind !== 'ingen' && st.pet.name ? el('span', { class:'pet-nm' }, 'og ' + st.pet.name) : null ]),
      el('button', { class:'del', type:'button', 'aria-label': 'Slet ' + f.name, html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>', on:{ click: () => askDelete(f) } }),
    ]));
  }
}
function askDelete(f){
  showModal('Slet dukken?', `${f.name} forsvinder for altid.`, [
    { label:'Nej, behold den' },
    { label:'Ja, slet', hot:true, fn: () => { figures = figures.filter(x => x !== f); saveAll(); renderHome(); } } ]);
}

/* ---------- testtilstand: tryk 5 gange på logoet ---------- */
let logoTaps = 0, logoTimer = null;
function openTest(){
  const info = () => `Stjerner: ${prog.stars} · låste ting: ${lockedList().length} · dukker: ${figures.length}`;
  const refresh = () => { $('#modalText').textContent = info(); renderHome(); };
  showModal('Testtilstand', info(), [
    { label:'+50 stjerner', keep:true, fn: () => { addStars(50); refresh(); } },
    { label:'Lås alt op', keep:true, fn: () => { unlockAll(); refresh(); } },
    { label:'Lås igen', keep:true, fn: () => { prog.unlocked = []; prog.fresh = []; saveProg(); refresh(); } },
    { label:'Nulstil alt', keep:true, fn: () => showModal('Nulstil alt?', 'Stjerner, låste ting og alle dukker slettes. Spillet starter forfra.', [
        { label:'Nej' }, { label:'Ja, nulstil', hot:true, fn: () => { store.del(KEY); store.del(KEY_PROG); figures = []; prog = loadProg(); renderHome(); toast('Spillet er nulstillet'); } } ]) },
    { label:'Luk', hot:true },
  ]);
}

/* ---------- knapper ---------- */
function updateSoundBtn(){ $('#soundBtn').textContent = soundOn ? 'Lyd: til' : 'Lyd: fra'; }
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set(KEY_SOUND, soundOn); updateSoundBtn(); sfx.pick(); };
$('#logo').addEventListener('click', () => { logoTaps++; clearTimeout(logoTimer); logoTimer = setTimeout(() => { logoTaps = 0; }, 2500); if (logoTaps >= 5){ logoTaps = 0; openTest(); } });
$('#playFashion').onclick = () => { sfx.open(); startFashion(); };
$('#playBalls').onclick = () => { sfx.open(); showBalls(); };
$('#backBtn').onclick = () => {
  sfx.undo();
  if (gameDress){ gameDress = null; $('#editor').classList.remove('in-game'); showScreen('#game'); renderTheme(); return; }
  saveAll(); showHome();
};
$('#doneBtn').onclick = () => { sfx.magic(); gameDress = null; $('#editor').classList.remove('in-game'); finishDress(); };
$('#undoBtn').onclick = () => { if (!history.length) return; cur.st = fixState(JSON.parse(history.pop())); sfx.undo(); updateUndo(); saveSoon(); renderStage(); renderPanel(); };
$('#randBtn').onclick = () => {
  pushHistory(); const nm = cur.st.pet.name;
  cur.st = randomState({ pool:'unlocked', boy: Math.random() < 0.2 }); cur.st.pet.name = nm;
  activeAcc = null; activePetAcc = null; sfx.magic(); saveSoon(); renderStage(); renderPanel();
  const m = $('#mirror'); m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop');
};
$('#nameInput').addEventListener('input', e => { if (cur.temp) return; cur.name = e.target.value.trim() || 'Uden navn'; saveSoon(); });
document.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') hideModal(); });
$('#ver').textContent = 'Glimmer Studio ' + VERSION;
updateSoundBtn(); showHome();
