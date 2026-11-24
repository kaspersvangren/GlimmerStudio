# Lydplan for Magiske Mig (pap)

Skrevet 24. nov. 2026 efter samtale med Kasper. Alt nyt laves til pap-designet, og den gamle musik genbruges ikke.

## Grundregler

1. **Musikken følger områder, ikke rum.** Hvert område har én sang, som bliver ved med at spille, mens man går rundt inde i området. Den starter ikke forfra, når man går ind ad en dør.
2. **Et nyt rum markeres med lyd, ikke med en ny sang.** Musikken fortsætter, men lyder lidt "indendørs" (dæmpet i diskanten og lavere), og rummet får sin egen baggrundslyd.
3. **Minispil og store begivenheder får deres egen musik.** Når man kommer ud igen, fortsætter områdets sang dér, hvor den slap.
4. **Kortet venter, før det skifter.** Går man ud på kortet og ind et nyt sted inden for cirka 12 sekunder, bliver den hidtidige sang ved med at spille. Først når man bliver på kortet, glider den over i byens sang.
5. **Bløde skift.** Når musikken skifter sang, toner den over i 1,5–2 sekunder. Når et jingle spiller, dykker musikken kort i lydstyrke.
6. **Sangene er 2–3 minutter lange og har en god løkke**, så man ikke hører den samme lille bid igen og igen. Alle sange har samme lydstyrke.
7. **Musik og effekter har hver sin lydstyrke.** Musikken er lav som standard.

## Områder og sange (7 sange i alt)

Ændret 24. nov.: Kasper vil gerne have lidt færre sange, og det er svært at få en musik-AI til at lave den samme sang i to udgaver.

| Sang | Fil | Rum |
|---|---|---|
| **Byen** | `ny-byen.mp3` | Kortet, Boblebutikken, Garderoben, Værelset. Starten (forsiden, bogen, Garderoben første gang) bruger også byens sang, men dæmpet |
| **Skolen** | `ny-skolen.mp3` | Gangen, Eliksirtimen |
| **Dyreparken** | `ny-dyreparken.mp3` | Parken, Dyrekøkkenet, Ungestalden |
| **Arkaden** | `ny-arkaden.mp3` | Hallen, Præmiebutikken |
| **Fart** | `ny-fart.mp3` | Kosteflyvning, Faldskærm |
| **Magi** | `ny-magi.mp3` | Trylletegning |
| **Leg** | `ny-leg.mp3` | BoblePop, Bank en gnom, Gribemaskinen |
| Koncertsalen | (bandets egne sange) | Gnomebandet. Før og efter sangene: publikums snak |
| Senere steder | én hver, når de bygges | Dragehulen, Øksebrønden, Den Flyvende Støvle, Klokketårnet |

Spillet er allerede sat op efter denne fordeling. Indtil en ny sang ligger der, spiller den gamle som pladsholder.

## Baggrundslyde (ingen musik, kun lyd)

Spiller sammen med områdets sang, så man kan høre, at man er et nyt sted.

| Sted | Baggrundslyd |
|---|---|
| Kortet | Vind, fugle, fjern stemning fra byen, brønden der bobler |
| Gangen i Skolen | Ekko, fodtrin langt væk, en dør der lukker |
| Eliksirtimen | Gryden der bobler, ild der knitrer |
| Dyreparken | Fugle, ænderne i dammen, en ko langt væk |
| Dyrekøkkenet | Gryder, skåle der klirrer, dyr der venter |
| Ungestalden | Halm, små dyrelyde, lampernes summen |
| Værelset | Ur der tikker, regn eller vind ved vinduet |
| Boblebutikken | Glas der klirrer, sæbebobler |
| Arkaden | Maskiner der bipper og ringer |

## Jingles (2–5 sekunder)

- Stjerner modtaget, lille og stor udgave
- Ny ting i Boblebutikken
- Et hjerte til en unge, og et hjerte der visner
- Ægget klækker
- Vundet minispil, og tabt minispil (venligt, ikke trist)
- Ny rekord
- Heksen er færdig (slutningen af starten)

## Hvordan lyden laves

Hver sang laves som mp3 med et løkkepunkt (start og slut på den del, der gentages). Spillet kan allerede afspille løkker, tone over og dykke musikken. Det nye er:

- **Områdeplanen:** Hvert rum hører til et område i stedet for at have sin egen sang.
- **Indendørs-lyden:** Et filter gør musikken dæmpet, når man er inde i et rum.
- **Baggrundslydene:** Et lag mere, der spiller sammen med musikken.
- **Pausen på kortet:** De cirka 12 sekunder, før kortet skifter sang.
- **At fortsætte, hvor den slap:** Spillet husker, hvor langt hver sang var nået.

Rækkefølge, når vi går i gang:

1. Områdeplanen, indendørs-lyden, pausen på kortet og at fortsætte, hvor den slap. Det kan bygges med de nuværende sange som pladsholdere.
2. De nye sange, et område ad gangen, startende med Byen og Starten.
3. Baggrundslydene.
4. Jingles.

## Til Kasper: når du laver sangene

Kasper laver selv musikken (sagt 24. nov.). Det her gør det nemt at sætte den ind:

- **Uden sang.** Kun instrumenter, så musikken ikke konkurrerer med teksterne i spillet. Undtagelsen er Koncertsalen.
- **Længde 2–3 minutter.** Gerne med en del i midten, der kan gentages, uden at slutningen fader ud. Hvis den fader ud, klipper jeg den af og laver løkken selv.
- **Leveres som mp3 eller wav**, med et navn efter området, fx `byen.mp3` og `skolen.mp3`.
- **Jeg ordner resten:** finder løkkepunktet, gør alle lige høje og sætter dem ind.
- **Jingles:** 2–5 sekunder. Gerne flere bud på hvert, så vælger vi.

### Stilen

Magisk fantasy-filmmusik (Kasper 24. nov.: "noget i stil med Harry Potter-musik"): Et orkester med celeste, harpe, strygere, horn, træblæsere og kor uden ord. Gerne vals eller mol, der vender til dur, med én melodi, man kan nynne. Navne på kendte værker og komponister skal ikke med i prompten, for mange musik-AI'er afviser dem.

### Bud på hver sang

Baggrundsmusik skal kunne lade sig ignorere (Kasper 24. nov.: "der er meget gang i den"): ét instrument med en enkel melodi, et stille tæppe under og ingen store udbrud. Ordene `background music`, `calm` og `gentle` i stil-feltet holder den nede, og `no drums, no crescendo` hjælper, hvis den vokser. Undgå vals, celeste, spilledåse og pizzicato sammen, for så bliver det ballet. Brev.ai bygger på Suno: brug custom, slå "instrumental" fra og skriv `[Instrumental]` øverst i tekstfeltet, og hold stil-feltet under cirka 120 tegn.

| Fil | Stil (til stil-feltet) |
|---|---|
| `ny-byen.mp3` | gentle magical fantasy background music, soft flute melody, harp arpeggios, warm string pad, calm, 90 BPM |
| `ny-skolen.mp3` | calm mysterious fantasy background music, soft clarinet melody, plucked guitar, harp, faint choir pad, 80 BPM |
| `ny-dyreparken.mp3` | gentle cheerful fantasy background music, oboe melody, acoustic guitar, harp, birdsong-like flute, 95 BPM |
| `ny-arkaden.mp3` | playful magical fantasy background music, bell melody, soft marimba, harp, light strings, 105 BPM |
| `ny-fart.mp3` | uplifting magical flying music, flute and strings melody, light drums, wind, adventurous but not loud, 130 BPM |
| `ny-magi.mp3` | sparkling magical fantasy music, bells and harp, soft choir, curious and playful, 110 BPM |
| `ny-leg.mp3` | bouncy playful fantasy game music, clarinet melody, marimba, light percussion, cheerful, 120 BPM |
