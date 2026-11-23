# Idéer og forslag til Magiske Mig (pap)

Her står alle forslag og idéer, så de ikke bliver væk i chatten. Hvert punkt har en status:

- **Besluttet:** Kasper har sagt ja, men det er ikke lavet endnu.
- **Venter:** Kasper har ikke svaret endnu.
- **Parkeret:** Kasper vil vente med det.
- **Fravalgt:** Kasper har sagt nej.

Når noget bliver lavet, flyttes det til LISTE.md med en rettelse (R-nummer).

## Dyreparken

| Idé | Status |
|---|---|
| Ægget på gården klækker, og ud kommer næbdyret som nyt kæledyr. Det er Agnes' ønske. | **Lavet** i 0.32 (R90) |
| Dyrefrisøren: klip, børst og pynt et dyr | Venter |
| Forhindringsbanen: tegn en rute, og dyret løber den på tid | Venter |
| Dagens gave fra en unge, der er bedste ven | Venter |

## Kosteflyvning

Forslag 1–6 er lavet i 0.30 (R81).

| Forslag | Status |
|---|---|
| 7. To veje: et par steder deler banen sig. Højt oppe går den gennem skyerne med medvind og bobler, lavt nede gennem byen med flere ringe | Venter (foreslået til efter 1–6) |
| 8. Skyer i stedet for at styrte: en sky bremser hende lidt med et pust, men hun styrter aldrig | Venter (foreslået til efter 1–6) |
| Begivenhederne i baggrunden fra originalen: fyrværkeri, flagermus, stjerneskud, lanterner og en anden heks foran månen | **Lavet** i 0.32 (R91), undtagen heksen foran månen |

## Faldskærm

| Idé | Status |
|---|---|
| Hjelm på turen op. Kasper bad om "faldskærm på ryggen og hjelm" | **Lavet** i 0.32 (R92) |

## Stjerneskjoldet

Status: **Parkeret** (Kasper 22. nov.: "Den parkerer vi lige").

Forslagene til at løfte spillet:

1. Forskellige meteorer: små hurtige, store der skal rammes to gange, nogle der deler sig, og en fjollet en med ansigt, der vrider sig udenom.
2. Ting man ikke må skyde: gaver, stjerner eller en kat i faldskærm. Lander de på et tag, giver det bonus.
3. Kombinationer: en kugle fanger flere meteorer på én gang, og der kommer "Dobbelt!" og "Tredobbelt!".
4. Kræfter i faldskærm: kæmpekugle, tre kugler, langsom tid, og en, der bygger et hus op igen.
5. Hold fingeren for en større kugle, så går der lidt længere tid, før man kan skyde igen.
6. En boss hver femte bølge: en kæmpekomet med ansigt eller en drillesyg månetrold.
7. Husene lever: der er lys og folk i vinduerne, og nisser lapper husene mellem bølgerne.

Claude anbefalede 1, 2, 3, 4 og 6.

## Nye arkadespil

Kasper (22. nov.) vil have spil, der er både simple og har en vis kompleksitet, og som passer til pap-looket.

**Fysiske maskiner** er **fravalgt**. Kasper var "ikke vild med" dem og tænker mere videospil. Forslagene var:

- Flipperspil
- Skydebod med papfigurer på skinner
- Kagetårnet
- Fiskedammen
- Kuglebanen

**Videospil** (foreslået 22. nov.), status: **Venter**:

1. **Murbrækkeren** (som Breakout). En mur af papklodser, der danner et billede, fx en kat eller et slot. Man styrer en tryllestav nederst, og en kugle slår klodserne løs. Nogle klodser skal rammes flere gange. Kræfter falder ned: bred stav, flere kugler og ildkugle.
2. **Hoppetårnet** (som Doodle Jump). Heksen hopper op ad skyer, tage og grene mod månen, og man styrer til siden med fingeren. Nogle skyer forsvinder, nogle har fjedre, kosten giver et boost, og flagermus er farlige. Det er uendeligt, og man går efter sin rekord.
3. **Spøgelseslabyrinten** (som Pac-Man). Kæledyret løber rundt i en labyrint i et spøgelseshus og samler stjerner. Papirspøgelser jager det, og hvert spøgelse har sin egen personlighed. En eliksir gør spøgelserne bange.
4. **Over åen** (som Frogger eller Crossy Road). En dyreunge skal over vejen og åen, forbi vogne, træstammer og åkander i lag af pap. Man styrer med et swipe, og det svære er at ramme det rigtige øjeblik.
5. **Kæledyrsslangen** (som Snake). Kæledyret samler godbidder og får en hale af små unger efter sig, og det må ikke ramme sin egen hale. Banerne har forhindringer.

## Det gemte spil fra originalen

Status: **Venter**. Kasper 22. nov.: "haster ikke".

Planen:

- Originalen gemmer i tablettens browser under `glimmerstudiet.fremskridt.v1` og `glimmerstudiet.dukker.v1`. Der er tre pladser, og plads 2 og 3 har `@2`/`@3` bag på navnet.
- Pap-udgaven kan kun læse dem, når den ligger på samme adresse (kaspersvangren.github.io).
- Første gang den starter der, oversætter den én gang:
  - stjerner og billetter
  - det låste op
  - tøj og hår
  - kæledyr
  - værelset
  - malerier

## Udgaver og links

Status: **Lavet** i 0.31 (R88). Commit-links gives med hver udgave.

Problemet (Kasper 22. nov.): githack viser den gamle udgave i et stykke tid, selvom man skriver `?v=`, og det er svært at se, om det er den rigtige.

Forslaget:

1. Links med commit-nummer i stedet for grenen, så de altid viser præcis den udgave.
2. Udgavenummeret med lille skrift på indlæsningsskærmen og i notesvinduet.

## Lyden

Status: **Lavet** i 0.31 (R83). Mangler: at samle baggrundens dele i færre stykker, hvis det stadig hakker.

Problemet (Kasper 22. nov.): musikken i Kosteflyvning hakker og knaser som en løs forbindelse, mest hen mod slutningen.

Mistanke:

- Mange lyde spilles oven i musikken: et pust for hvert tryk, et pling for hver ring og boost. Tilsammen bliver lyden for høj og klipper.
- Banen tegner nye ting første gang, de kommer frem. Loggen viser, at antallet af figurer på grafikchippen stiger fra cirka 2.400 til 4.300 i løbet af et løb, og de fleste billeder tager 22 ms.

Forslaget:

1. En lydbegrænser på al lyd i hele spillet, så den aldrig klipper.
2. Et svagere og genbrugt pust ved tryk.
3. Alt i banen gøres klar, før løbet starter, og tingene i baggrunden samles i færre stykker, så det kører mere jævnt.

## Garderoben

Kasper (note 8264, 23. nov.): flere farver alle steder, nyt layout og design af menuen, og Heks og Dyr skal have hver deres fane.

Status: **Lavet** i 0.35 (R102), efter skitsen:

- To faner foroven som på en mappe: Heksen og Kæledyret.
- Under dem knapper med små tegninger: Hat, Hår, Pande, Ansigt, Øjne, Mund, Tøj, Kappe, Støvler og Ekstra. Kæledyret har Dyr, Farver, Mønster, Pynt og Navn.
- Valgene vises som små billeder i stedet for ord alene.
- 48 farver i stedet for 12: tolv farver i lys, mellem og mørk, plus hvide, grå og brune toner.

## Præmiebutikken

| Idé | Status |
|---|---|
| Uglens sætninger om malerierne er forslag fra Claude. Kasper retter dem, hvis han vil | **Lavet** i 0.34 (R100), venter på Kaspers rettelser |

