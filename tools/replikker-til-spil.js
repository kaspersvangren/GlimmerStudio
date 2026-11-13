/* Lægger replikkerne fra værktøjet "Replikker" ind i spillet.
   Brug: hent samlingen "tekster" som JSON-filer (én pr. nøgle) til en mappe, og kør
   node tools/replikker-til-spil.js <mappe>   →   skriver src/tekster.js */
const fs = require('fs'), path = require('path');
const dir = process.argv[2]; if (!dir) { console.error('Angiv mappen med tekster/*.json'); process.exit(1); }
const src = fs.readFileSync('src/tekster.js', 'utf8'), head = src.slice(0, src.indexOf('const TXT'));
const old = new Function(src.replace('const TXT', 'return TXT').replace(/;\s*$/, ''))();
const TXT = {};
for (const k of Object.keys(old)) {
  const f = path.join(dir, k + '.json'); let d = null;
  if (fs.existsSync(f)) { const j = JSON.parse(fs.readFileSync(f, 'utf8')); d = j.data || j; }
  const clean = a => a.map(t => String(t).trim()).filter(Boolean);
  if (k === 'drage-vitser') TXT[k] = d && d.jokes ? d.jokes.map(([q, a]) => [String(q || '').trim(), String(a || '').trim()]).filter(([q, a]) => q && a) : old[k];
  else if (k === 'broend') TXT[k] = Object.fromEntries(Object.keys(old[k]).map(f2 => [f2, (d && d.fields && String(d.fields[f2] || '').trim()) || old[k][f2]]));
  else TXT[k] = d && d.lines && clean(d.lines).length ? clean(d.lines) : old[k];
}
const q = s => JSON.stringify(s);
let out = head + 'const TXT = {\n';
for (const [k, v] of Object.entries(TXT)) {
  const key = /^[a-z]+$/.test(k) ? k : q(k);
  if (Array.isArray(v) && Array.isArray(v[0])) out += `  ${key}: [\n${v.map(([a, b]) => `    [${q(a)}, ${q(b)}],`).join('\n')}\n  ],\n`;
  else if (Array.isArray(v)) out += `  ${key}: [${v.map(q).join(', ')}],\n`;
  else out += `  ${key}: {\n${Object.entries(v).map(([a, b]) => `    ${a}: ${q(b)},`).join('\n')}\n  },\n`;
}
fs.writeFileSync('src/tekster.js', out + '};\n');
console.log('src/tekster.js skrevet:', Object.entries(TXT).map(([k, v]) => `${k} ${Array.isArray(v) ? v.length : Object.keys(v).length}`).join(', '));
