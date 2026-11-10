# Glimmer Studio

Dukkeskaber til Agnes. Kører på GitHub Pages og kan installeres som app.

- `index.html`: hele spillet (bygget fra `src/`)
- `src/draw.js`: tegning af dukken som SVG-lag
- `src/core.js`: fælles værktøjer, farver, lyde, dialoger
- `src/progress.js`: stjerner, låste ting og hvad der er frit fra start
- `src/guests.js`: tilfældige piger, drenge og dyr; egne dukker som sjældne gæster
- `src/app.js`: skaberen
- `src/balls.js`: overraskelseskugler
- `src/fashion.js`: Modehuset med dommerpanel
- `src/main.js`: forside, testtilstand (5 tryk på logoet) og start
- `src/style.css`, `src/body.html`: udseende og skærmens opbygning
- `sw.js`, `manifest.webmanifest`, ikoner: app/offline

Byg: `node build.js`, kopiér `dist/index.html` til roden, og ret `VERSION` i `sw.js`.
