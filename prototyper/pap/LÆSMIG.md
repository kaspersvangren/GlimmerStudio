# Pap-kortet (prototype)

Prototype af kortet i pap-stil. Ikke en del af spillet endnu.

- Byg: `python3 bygkort2.py` → `kortet.html` (og `testkort.html` til test)
- Kilder: `pap-testscene.html` (hjælpefunktioner, linje 77–236), `k2detail.js`, `k3craft.js` (papirtyper, præcise stykker, lag), `k2scene.js` (stier, lys) + `k3town.js` (skolen, pladsen, brønden) + `k3town2.js` (de andre huse) + `k3land.js` (landskab, træer, småting), `witch.js`, `k2live.js` (figurer), `k2main.js` (bagning, efterbehandling, kamera, gang)
- Kvalitetstjek: `node qa.js` (stier til døre, synlige stier og skilte, vejviserens retning, ting på stier/i åen/i huse, heksens ruter, beboernes ruter, synlige figurer)
- Nærbilleder: `node shots.js 2` · opstartstid: `node tid.js`
- Test: `node rute.js 1280 800` (kræver three og clipper-lib lokalt i `../npm3`)
