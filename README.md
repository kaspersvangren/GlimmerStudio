# Glimmer Studio

Dukkeskaber til Agnes. Kører på GitHub Pages og kan installeres som app.

- `index.html`: hele spillet (bygget fra `src/`)
- `src/draw.js`: fælles tegneværktøj og kæledyrene som SVG-lag
- `src/figur.js`: figuren i eventyrstil som dele (hår, ansigt, kjoler, kapper, hatte, fodtøj, tilbehør)
- `src/core.js`: fælles værktøjer, farver, lyde, dialoger
- `src/progress.js`: stjerner, låste ting og hvad der er frit fra start
- `src/guests.js`: tilfældige piger, drenge og dyr; egne dukker som sjældne gæster
- `src/app.js`: skaberen
- `src/balls.js`: overraskelseskugler
- `src/fashion.js`: Modehuset med dommerpanel
- `src/town.js`: titelskærm, musik og tæppet mellem skærmene
- `src/city.js`: byen — huse, årstider, tid på dagen og alt det levende (folk, dyr, biler, bussen, fugle, egern)
- `src/main.js`: Mit hus, testtilstand (5 tryk på logoet; kan også vælge byens årstid og tid) og start
- `src/style.css`, `src/body.html`: udseende og skærmens opbygning
- `sw.js`, `manifest.webmanifest`, ikoner: app/offline

Byg: `node build.js`, kopiér `dist/index.html` til roden, og ret `VERSION` i `sw.js`.

## Tjekliste: nyt tilbehør (dukke eller dyr)

Ved hvert nyt stykke tilbehør — og før hver ny version — kør:

```
node build.js && node tools/tjek.js
```

og gennemse arkene i `tools/ud/`. Alle tænkelige kombinationer skal se rigtige ud:

1. **Alle figurer**: alle seks dyr / alle pandehår, baghår, hatte, kjoler, kapper og fodtøj.
2. **Alle stillinger**: siddende og gående (dyr), stående, vinkende og med stav (dukke).
3. **Sammen med alt andet tilbehør**: hvert stykke alene og alle på én gang.
4. Se efter: ligger noget oven på noget forkert, svæver det, er det skjult, dækker det øjne eller ansigt?
5. Nyt tilbehør der sidder på hovedet, tegnes inde i hovedet (følger med når det nikker/går).
   To ting der vil sidde samme sted, skal enten udelukke hinanden (`ACC_SLOTS`) eller have en
   alternativ placering (som dyrenes `bowCrown`, når sløjfen deler hoved med kronen).
6. Tilføj det nye tilbehør i `tools/tjek.js`, hvis arket ikke allerede tager det med automatisk.
