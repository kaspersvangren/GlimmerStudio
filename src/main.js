/* ================= Forside og start ================= */
/* ---------- testtilstand: tryk 5 gange på logoet ---------- */
let logoTaps = 0, logoTimer = null;
function openTest(){
  const info = () => `Stjerner: ${prog.stars} · låste ting: ${lockedList().length} · dukker: ${figures.length}`;
  const refresh = () => { $('#modalText').textContent = info(); updateStarPills(); if (!$('#home').hidden) renderHome(); };
  showModal('Testtilstand', info(), [
    { label:'+50 stjerner', keep:true, fn: () => { addStars(50); refresh(); } },
    { label:'Lås alt op', keep:true, fn: () => { unlockAll(); refresh(); } },
    { label:'Lås igen', keep:true, fn: () => { prog.unlocked = []; prog.fresh = []; saveProg(); refresh(); } },
    { label:'Nulstil alt', keep:true, fn: () => showModal('Nulstil alt?', 'Stjerner, låste ting og alle dukker slettes. Spillet starter forfra.', [
        { label:'Nej' }, { label:'Ja, nulstil', hot:true, fn: () => { store.del(KEY); store.del(KEY_PROG); figures = []; prog = loadProg(); showTitle(); toast('Spillet er nulstillet'); } } ]) },
    { label:'Byen: ' + ({ foraar:'forår', sommer:'sommer', efteraar:'efterår', vinter:'vinter', jul:'jul' }[CITY_OVR.season] || 'årstid efter kalenderen'), keep:true, fn: () => { const L = [null,'foraar','sommer','efteraar','vinter','jul']; CITY_OVR.season = L[(L.indexOf(CITY_OVR.season) + 1) % L.length]; if (!$('#town').hidden) showTown(); openTest(); } },
    { label:'Byen: ' + ({ morgen:'morgen', dag:'dag', aften:'aften', nat:'nat' }[CITY_OVR.time] || 'tid efter uret'), keep:true, fn: () => { const L = [null,'morgen','dag','aften','nat']; CITY_OVR.time = L[(L.indexOf(CITY_OVR.time) + 1) % L.length]; if (!$('#town').hidden) showTown(); openTest(); } },
    { label:'Luk', hot:true },
  ]);
}

/* ---------- knapper ---------- */
function logoTap(){ logoTaps++; clearTimeout(logoTimer); logoTimer = setTimeout(() => { logoTaps = 0; }, 2500); if (logoTaps >= 5){ logoTaps = 0; openTest(); } }
$('#backBtn').onclick = () => {
  sfx.undo();
  if (gameDress){ gameDress = null; $('#editor').classList.remove('in-game'); showScreen('#game'); renderTheme(); return; }
  saveAll(); goTo(showHome);
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
showTitle();
