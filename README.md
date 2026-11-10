# Glimmer Studio

Dukkeskaber til Agnes. Kører på GitHub Pages og kan installeres som app.

- `index.html`: hele spillet (bygget fra `src/`)
- `src/draw.js`: tegning af dukken som SVG-lag
- `src/app.js`: skaberen, gemte dukker, lyde
- `src/style.css`, `src/body.html`: udseende og skærmens opbygning
- `sw.js`, `manifest.webmanifest`, ikoner: app/offline

Byg: `node build.js`, kopiér `dist/index.html` til roden, og ret `VERSION` i `sw.js`.
