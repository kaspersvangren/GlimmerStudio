// Lydlaget: hver lyd i spillet har en nøgle. Findes der en egen fil i LYD_FILER, spilles den; ellers den indbyggede.
const SND = (() => {
  const pool = {}, MAXP = 4;
  let song = null, songName = null;
  const last = {};
  /* en plads kan have flere filer: der vælges en tilfældig, men aldrig den samme to gange i træk */
  function file(key){
    const v = (typeof LYD_FILER === 'object' && LYD_FILER[key]);
    if (v === false) return false;   /* false = bevidst ingen lyd */
    if (!v) return null;
    if (!Array.isArray(v)) return v;
    if (v.length < 2) return v[0] || null;
    let i; do { i = Math.floor(Math.random() * v.length); } while (i === last[key]);
    last[key] = i; return v[i];
  }
  /* lydeffekter afspilles gennem Web Audio: en <audio> er på telefoner op til et kvart sekund om at gå i gang */
  const SB = {};
  function loadSfx(src){
    if (SB[src]) return; const ac = audioCtx(); if (!ac) return;
    SB[src] = 'henter';
    fetch(src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(a => new Promise((res, rej) => ac.decodeAudioData(a, res, rej)))
      .then(b => { SB[src] = b; }).catch(() => { SB[src] = 'fejl'; });
  }
  /* lyde der kører, så længe noget står på (kloens motor, kablet der ruller ud): hold(nøgle, true/false).
     Giver false, hvis der ikke er en fil, så spillet kan bruge sin egen lyd */
  const HOLD = {};
  function hold(key, on){
    const src = file(key);
    if (!src) return src === false;
    const h = HOLD[key];
    if (!on){ if (h){ try { h.g.gain.setTargetAtTime(0, h.n.context.currentTime, 0.04); h.n.stop(h.n.context.currentTime + 0.25); } catch (e){} delete HOLD[key]; } return true; }
    if (h || !soundOn) return true;
    const b = SB[src];
    if (!b || typeof b !== 'object'){ loadSfx(src); return true; }
    try { const ac = audioCtx(), n = ac.createBufferSource(), g = ac.createGain(); n.buffer = b; n.loop = true;
      g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(1, ac.currentTime + 0.05);
      n.connect(g); g.connect(ac.destination); n.start(); HOLD[key] = { n, g }; } catch (e){}
    return true;
  }
  function preload(){ try { Object.values(LYD_FILER || {}).flat().filter(Boolean).forEach(loadSfx); } catch (e){} }
  document.addEventListener('pointerdown', preload, { once: true, capture: true });
  function play(key, fallback){
    if (!soundOn) return;
    const src = file(key);
    if (src === false) return;
    if (!src){ if (fallback) fallback(); return; }
    const b = SB[src];
    if (b && typeof b === 'object'){
      try { const ac = audioCtx(), n = ac.createBufferSource(); n.buffer = b; n.connect(ac.destination); n.start(); return; } catch (e){}
    }
    loadSfx(src);
    const list = pool[src] || (pool[src] = []);
    let a = list.find(x => x.paused || x.ended);
    if (!a && list.length < MAXP){ a = new Audio(src); a.preload = 'auto'; list.push(a); }
    if (!a) a = list[0];
    try { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => { if (fallback) fallback(); }); }
    catch (e){ if (fallback) fallback(); }
  }
  /* musik med loop-punkter spilles gennem Web Audio, så hoppet tilbage er helt uden pause */
  const BUF = {}, BAD = {};
  let node = null, gain = null, gen = 0;
  /* opts.engang: spil kun én gang og kald opts.slut, når den er færdig (koncertsalens sange) */
  function music(name, opts){
    const m = typeof LYD_MUSIK === 'object' && LYD_MUSIK[name];
    if (!m || BAD[name]) return false;
    stopSong(); songName = name;
    if (typeof m === 'string'){
      song = new Audio(m); song.loop = true; song.volume = 0.6;
      try { const p = song.play(); if (p && p.catch) p.catch(() => {}); } catch (e){}
      return true;
    }
    const my = ++gen, ac = audioCtx(); if (!ac) return false;
    getBuf(m, buf => {
      if (my !== gen) return;
      node = loopNode(ac, buf, m);
      if (opts && opts.engang){ node.loop = false; node.onended = () => { if (my === gen && opts.slut) opts.slut(); }; }
      gain = ac.createGain(); gain.gain.value = m.vol || 0.6; node.connect(gain); gain.connect(ac.destination);
      node.start(0);
    }, () => { BAD[name] = true; if (my === gen && MUSIC.track === name){ songName = null; MUSIC.track = null; playMusic(name); } });   /* filen findes ikke (fx i forhåndsvisningen): spillets egen melodi */
    return true;
  }
  function getBuf(m, ok, fail){
    if (BUF[m.src]) return ok(BUF[m.src]);
    const ac = audioCtx();
    fetch(m.src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(a => new Promise((res, rej) => ac.decodeAudioData(a, res, rej)))
      .then(b => { BUF[m.src] = b; ok(b); }).catch(() => { if (fail) fail(); });
  }
  function loopNode(ac, buf, m){
    const n = ac.createBufferSource(); n.buffer = buf; n.loop = true;
    if (m.loop){
      const sr = buf.sampleRate, s = Math.round(m.loop[0]*sr), e = Math.round(Math.min(m.loop[1], buf.duration)*sr), f = Math.round((m.xf || 0)*sr);
      /* overtoning: de sidste m.xf sekunder før slut blandes med stykket lige før start, så hoppet ikke kan høres */
      if (f && s - f >= 0 && !buf._xf){
        for (let c = 0; c < buf.numberOfChannels; c++){
          const d = buf.getChannelData(c);
          for (let i = 0; i < f; i++){ const t = i/f*Math.PI/2; d[e-f+i] = d[e-f+i]*Math.cos(t) + d[s-f+i]*Math.sin(t); }
        }
        buf._xf = 1;
      }
      n.loopStart = s/sr; n.loopEnd = e/sr;
    }
    return n;
  }
  /* stemningslyd: et ekstra lag under musikken (fx summen i arkadehallen). Følger musik-knappen */
  let amb = null, ambGain = null, ambOn = null, ambWant = null, ambGen = 0;
  /* fade: sekunder om at tone ud eller ind (koncertsalens mumlen glider langsomt) */
  let ambFade = 0;
  function ambience(name, fade){ ambWant = name || null; ambFade = fade || 0; ambRefresh(); }
  function ambRefresh(){
    const want = MUSIC.on ? ambWant : null;
    if (want === ambOn) return;
    ambGen++;
    if (amb){ const ud = ambFade || .45; try { ambGain.gain.setTargetAtTime(0, amb.context.currentTime, ud / 3); amb.stop(amb.context.currentTime + ud + .4); } catch (e){} amb = null; ambGain = null; }
    ambOn = want;
    const m = want && typeof LYD_MUSIK === 'object' && LYD_MUSIK[want], ac = m && audioCtx();
    if (!ac) return;
    const my = ambGen;
    getBuf(m, buf => {
      if (my !== ambGen) return;
      amb = loopNode(ac, buf, m); ambGain = ac.createGain();
      ambGain.gain.setValueAtTime(0, ac.currentTime); ambGain.gain.linearRampToValueAtTime(m.vol || 0.5, ac.currentTime + (ambFade || 1.2));
      amb.connect(ambGain); ambGain.connect(ac.destination); amb.start(0);
    });
  }
  function stopSong(){
    gen++;
    if (song){ try { song.pause(); } catch (e){} song = null; }
    if (node){ try { gain.gain.setTargetAtTime(0, node.context.currentTime, 0.05); node.stop(node.context.currentTime + 0.3); } catch (e){} node = null; gain = null; }
    songName = null;
  }
  function musicPlaying(){ return !!(song && !song.paused) || !!songName; }
  // alle de små standardlyde (sfx.pick, sfx.magic …) får nøglen 'sfx.<navn>'
  Object.keys(sfx).forEach(k => { const f = sfx[k]; sfx[k] = (...a) => play('sfx.' + k, () => f(...a)); });
  // en app der kommer tilbage fra baggrunden genoptager musikken
  document.addEventListener('visibilitychange', () => {
    if (song){ if (document.hidden) song.pause(); else if (MUSIC.on) song.play().catch(() => {}); }
    if ((node || amb) && AC){ try { if (document.hidden) AC.suspend(); else AC.resume(); } catch (e){} }
  });
  return { play, hold, music, ambience, ambRefresh, stopMusic: stopSong, musicPlaying, keys: () => Object.keys(LYD_FILER || {}) };
})();
