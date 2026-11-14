// Lydlaget: hver lyd i spillet har en nøgle. Findes der en egen fil i LYD_FILER, spilles den; ellers den indbyggede.
const SND = (() => {
  const pool = {}, MAXP = 4;
  let song = null, songName = null;
  function file(key){ return (typeof LYD_FILER === 'object' && LYD_FILER[key]) || null; }
  function play(key, fallback){
    if (!soundOn) return;
    const src = file(key);
    if (!src){ if (fallback) fallback(); return; }
    const list = pool[key] || (pool[key] = []);
    let a = list.find(x => x.paused || x.ended);
    if (!a && list.length < MAXP){ a = new Audio(src); a.preload = 'auto'; list.push(a); }
    if (!a) a = list[0];
    try { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => { if (fallback) fallback(); }); }
    catch (e){ if (fallback) fallback(); }
  }
  function music(name){
    const src = typeof LYD_MUSIK === 'object' && LYD_MUSIK[name];
    if (!src) return false;
    stopSong();
    song = new Audio(src); song.loop = true; song.volume = 0.6; songName = name;
    try { const p = song.play(); if (p && p.catch) p.catch(() => {}); } catch (e){}
    return true;
  }
  function stopSong(){ if (song){ try { song.pause(); } catch (e){} song = null; songName = null; } }
  function musicPlaying(){ return !!(song && !song.paused); }
  // alle de små standardlyde (sfx.pick, sfx.magic …) får nøglen 'sfx.<navn>'
  Object.keys(sfx).forEach(k => { const f = sfx[k]; sfx[k] = (...a) => play('sfx.' + k, () => f(...a)); });
  // en app der kommer tilbage fra baggrunden genoptager musikken
  document.addEventListener('visibilitychange', () => { if (!song) return; if (document.hidden) song.pause(); else if (MUSIC.on) song.play().catch(() => {}); });
  return { play, music, stopMusic: stopSong, musicPlaying, keys: () => Object.keys(LYD_FILER || {}) };
})();
