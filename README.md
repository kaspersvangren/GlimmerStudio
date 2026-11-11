# Glimmerskolen

En magisk skole til Agnes: klæd figuren på, find ting i boblerne og indret dit værelse. Kører på GitHub Pages og kan installeres som app.
Spillets navn står ét sted: `GAME_NAME` i `src/core.js` (og `name` i `manifest.webmanifest`).

- `index.html`: hele spillet (bygget fra `src/`)
- `src/draw.js`: fælles tegneværktøj og kæledyrene som SVG-lag
- `src/figur.js`: figuren i eventyrstil som dele (hår, ansigt, kjoler, kapper, hatte, fodtøj, tilbehør)
- `src/core.js`: fælles værktøjer, farver, lyde, dialoger
- `src/progress.js`: stjerner, låste ting og hvad der er frit fra start
- `src/guests.js`: tilfældige piger, drenge og dyr; egne dukker som sjældne gæster
- `src/app.js`: skaberen
- `src/balls.js`: Boblebutikken — nissen bag disken taler i en taleboble; tryk på en krukke (Tøj og hår, Kæledyr, Værelset), han puster en boble, tryk tre gange, og den springer med en ny ting
- `src/rum.js`: Mit værelse — et sted man er i: lampen tænder/slukker, gardinerne trækkes for, kedlen puffer, dyret hopper i sin seng; indretningsbogen på natbordet har otte pladser (væg, vindue, seng, hylde, lampe, tæppe, hjørnet, dyrets seng), hver med ting og egen farve. Låse hedder `rum:<plads>.<ting>`
- `src/fashion.js`: Modehuset med dommerpanel
- `src/town.js`: startskærm (nattehimmel, måne, skolen på bakken, bobler), musik og tæppet mellem skærmene
- `src/city.js`: byen — huse, årstider, tid på dagen og alt det levende (folk, dyr, biler, bussen, fugle, egern)
- `src/garderobe.js`: Garderoben — klædeskab, spejl med den nyeste figur og portrætter af alle figurerne
- `src/main.js`: testtilstand (5 tryk på logoet; kan også vælge byens årstid og tid) og start
- `src/style.css`, `src/body.html`: udseende og skærmens opbygning
- `sw.js`, `manifest.webmanifest`, ikoner: app/offline

Steder (værelset, garderoben, butikken) er én stor SVG på 1600×1000, der fylder hele skærmen; loft, væg og gulv fortsætter ud over kanten, og alt man kan trykke på ligger inden for 1600×1000. Knapperne ligger ovenpå i hjørnerne. Byen er altid i skumringen eller om natten, og påklædningen er et prøverum ved et magisk spejl. Alle personer er menneskelignende (mennesker, elvere, dværge, nisser).

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

## Tegnebordet (gennemgang af tegninger)
Kasper gennemgår tegningerne på artifact-siden "Tegnebordet" (claude.ai/artifact/5ttk23aff8VN37S7Lzfyy3): godkend, marker fejl med ringe, skriv en note og læg referencer ind. Svarene ligger i sidens database (samlingen `reviews`, ét dokument pr. ting).
Arbejdsgang for Claude:
1. Før en ny ting eller stilling tegnes: skriv kort ned hvordan den ser ud i virkeligheden (fx "bogens ryg er den lange side"), find referencer hvis i tvivl, og tjek tegningen mod dem i tablet-størrelse og tæt på, før den sendes.
2. Læs `reviews` (status `bad`, noter, ringe, referencer), ret, hæv tingens version i `V` i tools/gennemgang.js.
3. `node build.js && node tools/gennemgang.js`, og udgiv tools/tegnebordet.html med filerne i tools/gennemgang/ til samme adresse. Rettede ting står så som "Rettet – se igen".
