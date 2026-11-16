// Lydlaget: hver lyd i spillet har en nøgle. Findes der en egen fil i LYD_FILER, spilles den; ellers den indbyggede.
const SND = (() => {
  const pool = {}, MAXP = 4;
  let song = null, songName = null;
  const last = {};
  /* en plads kan have flere filer: der vælges en tilfældig, men aldrig den samme to gange i træk */
  function file(key){
    const v = (typeof LYD_FILER === 'object' && LYD_FILER[key]) || null;
    if (!Array.isArray(v)) return v;
    if (v.length < 2) return v[0] || null;
    let i; do { i = Math.floor(Math.random() * v.length); } while (i === last[key]);
    last[key] = i; return v[i];
  }
  function play(key, fallback){
    if (!soundOn) return;
    const src = file(key);
    if (!src){ if (fallback) fallback(); return; }
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
  function music(name){
    const m = typeof LYD_MUSIK === 'object' && LYD_MUSIK[name];
    if (!m || BAD[name]) return false;
    stopSong(); songName = name;
    if (typeof m === 'string'){
      song = new Audio(m); song.loop = true; song.volume = 0.6;
      try { const p = song.play(); if (p && p.catch) p.catch(() => {}); } catch (e){}
      return true;
    }
    const my = ++gen, ac = audioCtx(); if (!ac) return false;
    const go = buf => {
      if (my !== gen) return;
      node = ac.createBufferSource(); node.buffer = buf; node.loop = true;
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
        node.loopStart = s/sr; node.loopEnd = e/sr;
      }
      gain = ac.createGain(); gain.gain.value = m.vol || 0.6; node.connect(gain); gain.connect(ac.destination);
      node.start(0);
    };
    if (BUF[m.src]) go(BUF[m.src]);
    else fetch(m.src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(a => new Promise((res, rej) => ac.decodeAudioData(a, res, rej)))
      .then(b => { BUF[m.src] = b; go(b); })
      .catch(() => { BAD[name] = true; if (my === gen && MUSIC.track === name){ songName = null; MUSIC.track = null; playMusic(name); } });   /* filen findes ikke (fx i forhåndsvisningen): spillets egen melodi */
    return true;
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
    if (node && AC){ try { if (document.hidden) AC.suspend(); else AC.resume(); } catch (e){} }
  });
  return { play, music, stopMusic: stopSong, musicPlaying, keys: () => Object.keys(LYD_FILER || {}) };
})();
