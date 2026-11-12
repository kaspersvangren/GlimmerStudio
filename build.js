const fs=require('fs');
const NAME=(fs.readFileSync('src/core.js','utf8').match(/const GAME_NAME = '([^']+)'/)||[])[1]||'Magiske Mig';
const css=fs.readFileSync('src/style.css','utf8'), body=fs.readFileSync('src/body.html','utf8');
const draw=fs.readFileSync('src/draw.js','utf8')+'\n'+fs.readFileSync('src/figur.js','utf8').replace(/^'use strict';/,''), app=['core','progress','guests','app','balls','rum','garderobe','fashion','skole','kost','town','city','main'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
const fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;800&display=swap">';
/* sikkerhedsnet: alle filer deler ét navnerum, så to filer må aldrig bruge samme navn øverst i filen */
{ const files=['draw','figur','core','progress','guests','app','balls','rum','garderobe','fashion','skole','kost','town','city','main'], seen={}, dup=[];
  for (const f of files){ if (!fs.existsSync('src/'+f+'.js')) continue; const src=fs.readFileSync('src/'+f+'.js','utf8');
    for (const m of src.matchAll(/^(?:async\s+)?(?:function\s*\*?\s*([A-Za-z_$][\w$]*)|(?:const|let|var|class)\s+([^=;(]+?)\s*(?:=|;|\{))/gm)){
      const names = m[1] ? [m[1]] : m[2].split(',').map(x => x.trim()).filter(x => /^[A-Za-z_$][\w$]*$/.test(x));
      for (const n of names){ if (seen[n] && seen[n] !== f) dup.push(n+' ('+seen[n]+'.js og '+f+'.js)'); else if (seen[n] === f && /^(?:async\s+)?function/.test(m[0])) dup.push(n+' (to gange i '+f+'.js)'); seen[n] = f; } } }
  if (dup.length){ console.error('STOP: samme navn bruges flere steder:\n  ' + dup.join('\n  ')); process.exit(1); } }
const scripts=`<script>\n${draw}\n</script>\n<script>\n${app}\n</script>`;
const sw=`<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}</script>`;
fs.mkdirSync('dist',{recursive:true}); /* dist/index.html kopieres til roden ved udgivelse */
fs.writeFileSync('dist/index.html',`<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${NAME}</title>
<meta name="theme-color" content="#1C1634">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box;height:100%}
[hidden]{display:none!important}
${css}
</style>
</head>
<body>
${body}
${scripts}
${sw}
</body>
</html>
`);
fs.writeFileSync('dist/artifact.html',`<title>${NAME}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${css}
</style>
${body}
${scripts}
`);
console.log('built', fs.statSync('dist/index.html').size);
