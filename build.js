const fs=require('fs');
const css=fs.readFileSync('src/style.css','utf8'), body=fs.readFileSync('src/body.html','utf8');
const draw=fs.readFileSync('src/draw.js','utf8'), app=['core','progress','guests','app','balls','fashion','town','main'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
const fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;800&display=swap">';
const scripts=`<script>\n${draw}\n</script>\n<script>\n${app}\n</script>`;
const sw=`<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}</script>`;
fs.mkdirSync('dist',{recursive:true}); /* dist/index.html kopieres til roden ved udgivelse */
fs.writeFileSync('dist/index.html',`<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Glimmer Studio</title>
<meta name="theme-color" content="#FFD9EA">
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
fs.writeFileSync('dist/artifact.html',`<title>Glimmer Studio</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${css}
</style>
${body}
${scripts}
`);
console.log('built', fs.statSync('dist/index.html').size);
