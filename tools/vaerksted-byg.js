// Bygger Værkstedet (tools/vaerksted/index.html) ud fra kataloget og spillets egen lydkode.
// Kør: node tools/vaerksted-byg.js
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const core = R('src/core.js'), city = R('src/city.js'), town = R('src/town.js');
const between = (s, a, endRe) => { const i = s.indexOf(a); if (i < 0) throw new Error('mangler ' + a); const rest = s.slice(i); const m = rest.match(endRe); return rest.slice(0, m.index + m[0].length); };
let engine = between(core, 'let AC = null', /\nconst sfx = \{[\s\S]*?\n\};/);
engine += '\n' + between(city, 'Object.assign(sfx, {', /\n\}\);/);
engine += '\n' + between(town, 'const MUSIC = {', /\nfunction stopMusic\(\)[^\n]*/);
engine = engine.replace("let AC = null, soundOn = store.get(KEY_SOUND, true);", "let AC = null, soundOn = true;");
// fallback-lydene fra SND.play('nøgle', () => …)
const DEMO = {};
for (const f of fs.readdirSync(path.join(__dirname, '..', 'src'))) {
  if (!f.endsWith('.js')) continue; const s = R('src/' + f), re = /SND\.play\('([\w.]+)',\s*/g; let m;
  while ((m = re.exec(s))) { let i = re.lastIndex, d = 0, j = i; for (; j < s.length; j++) { const c = s[j]; if ('({['.includes(c)) d++; else if (')}]'.includes(c)) { if (d === 0) break; d--; } } DEMO[m[1]] = s.slice(i, j).trim(); }
}
const CATALOG = JSON.parse(R('tools/lydkatalog.json'));
const keys = CATALOG.flatMap(g => g.slots.map(s => s.key));
const missing = Object.keys(DEMO).filter(k => !keys.includes(k)); if (missing.length) console.warn('Ikke i kataloget:', missing.join(', '));
const VERSION = (core.match(/VERSION\s*=\s*'([^']+)'/) || [])[1];
// hvad der allerede ligger som egne filer i spillet
const lf = R('src/lydfiler.js'); const INGAME = [...lf.matchAll(/^\s*'([\w.]+)'\s*:/gm)].map(m => m[1]);
const tpl = R('tools/vaerksted.tpl.html');
const out = tpl.replace('/*CATALOG*/', JSON.stringify(CATALOG)).replace('/*DEMO*/', JSON.stringify(DEMO)).replace('/*VERSION*/', JSON.stringify(VERSION))
  .replace('/*NYT*/', R('tools/vaerksted-nyt.json').trim()).replace('/*INGAME*/', JSON.stringify(INGAME)).replace('/*ENGINE*/', () => engine);
fs.mkdirSync(path.join(__dirname, 'vaerksted'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'vaerksted', 'index.html'), out);
console.log('værksted', out.length, 'bytes,', Object.keys(DEMO).length, 'demo-lyde,', keys.length, 'pladser');
