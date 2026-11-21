# Magiske Mig i pap: listen over fejl og ønsker

Én liste for alt, der skal rettes eller laves. Claude holder den ved lige.

- **Type:** virker ikke · skal virke bedre · ser forkert ud · ønske
- **Status:** åben · rettet (Claude har rettet og selv set det på billeder) · set (Kasper har set det på en rigtig skærm)
- **Fra:** Kasper · Agnes · note (notesknappen i spillet) · ark (billedark hvor alt sættes sammen med alt) · gennemgang (Claudes egen gennemgang)

Noter fra notesknappen ligger i `spil_log` med `kind = 'note'`; de føres ind her med deres dato.

## Åbne

| Nr. | Sted | Type | Hvad | Fra |
|---|---|---|---|---|
| 1 | Kæledyret | ønske | Et næbdyr som kæledyr | Agnes |
| 3 | Boblebutikken | ser forkert ud | Heksen står helt ude ved venstre kant, så hatten rører kanten af skærmen | gennemgang |
| 4 | Eliksirtimen, Boblebutikken, Koncertsalen | skal virke bedre | Kæledyret er ikke med derinde; i Koncertsalen er heksen heller ikke med | gennemgang |
| 5 | Heksen | ser forkert ud | Kappen med hætte: frisuren Knolde ligger foran hætten i stedet for under den | ark |
| 6 | Heksen | ser forkert ud | Festkjolen og den korte kjole: kanten på det vide ærme stikker ud som en tynd streg ved venstre hånd | ark |
| 7 | Værelset | skal virke bedre | Tæppernes form (hjerte, stjerne, måne) er svær at se, fordi gulvet ses meget fladt | gennemgang |
| 8 | Værelset | skal virke bedre | Hvert valg bager rummet om. Hvor lang tid det tager på tabletten, er ikke målt | gennemgang |
| 9 | Kortet | skal virke bedre | Opstarten: bagningen af byen er ikke gjort hurtigere. Mangler tal fra tabletten på statistik-linket | Kasper |
| 10 | Kortet | ser forkert ud | Udviklerlinjen nederst (billeder pr. sekund osv.) skal væk, før Agnes får spillet | gennemgang |
| 11 | Telefon på langs | ser forkert ud | Knapperne øverst dækker stadig lidt af rummene på en lav skærm (Skolens skilte, Arkadens skilt), selv om de er gjort mindre | gennemgang |
| 12 | Heksen | skal virke bedre | Lange kjoler skjuler støvlerne alle andre steder end på Støvler-fanen i Garderoben | ark |
| 13 | Arkaden | ser forkert ud | Skiltet "Bank en gnom" er meget mørkere end de fire andre maskiners skilte | gennemgang |

### Mangler stadig fra originalen

| Nr. | Hvad |
|---|---|
| M1 | En farve nummer to på tøjet |
| M2 | De ni præmiestave og præmiebutikken i Arkaden |
| M3 | Navn til kæledyret |
| M4 | De fire andre arkademaskiner (Stjerneskjoldet, Hekse-invaders, Trylletegning, Gribemaskinen) |
| M5 | Kosteflyvning og Faldskærm |
| M6 | Dyrepasning og Dyreparken |
| M7 | Startsiden med gemte spil, og bogen i starten |
| M8 | Sværere eliksirer og valg af sværhedsgrad |
| M9 | Dragen med vittighederne, Øksebrønden, Støvlen og Klokketårnet (husene er på kortet, men lukkede) |
| M10 | Malerier på væggene i Værelset |

## Rettet, men ikke set af Kasper endnu

| Nr. | Sted | Type | Hvad | Fra | Rettet i |
|---|---|---|---|---|---|
| R1 | Garderoben | skal virke bedre | Udsnittet zoomer nu ind på det, man er ved at ændre: hat, hår, ansigt, støvler eller kæledyr | Kasper | pap-0.16 |
| R2 | Heksen | ser forkert ud | Håret gik op gennem hatten på alle hatte. Hatten ligger nu foran pandehåret | Kasper | pap-0.16 |
| R3 | Heksen | ser forkert ud | Baretten flimrede sammen med håret | ark | pap-0.16 |
| R4 | Heksen | ser forkert ud | Frisuren Bølger havde et løst lilla stykke ved øret. Det er nu en lille sløjfe | ark | pap-0.16 |
| R5 | Heksen | ser forkert ud | Topknolden stak op gennem hattene. Den er nu skjult under en hat (krone og sløjfe lader den sidde) | ark | pap-0.16 |
| R6 | Heksen | ser forkert ud | Knoldene sad oven på hatteskyggen. Under en hat med skygge sidder de nu nede ved ørerne | ark | pap-0.16 |
| R7 | Heksen | ser forkert ud | Kronens ædelsten var gemt inde i kronen og kunne ikke ses | ark | pap-0.16 |
| R8 | Kæledyret | ser forkert ud | Feevingerne: den ene vinge sad ved kinden. Begge sidder nu på ryggen | ark | pap-0.16 |
| R9 | Garderoben | virker ikke | Støvlerne kunne ikke ses under en lang kjole. På Støvler-fanen løfter hun nu kjolen | gennemgang | pap-0.16 |
| R10 | Kæledyret | ønske | Hund og striber er fri fra start, som i originalen | Kasper | pap-0.16 |
| R11 | Bank en gnom | ser forkert ud | Skiltet og den venstre stjerne lå under knapperne øverst. De er rykket ned | gennemgang | pap-0.16 |
| R12 | Bank en gnom | ser forkert ud | Gnomernes hatte kunne ses under græsset på en høj skærm | gennemgang | pap-0.16 |
| R13 | Statistik-linket | virker ikke | Siden fortalte ikke telefonen sin bredde, så den blev vist som en 980 punkter bred computerside: alt var småt, og tallene fra telefonen var målt på den forkerte størrelse | gennemgang | pap-0.16 |
| R14 | Værelset og Garderoben | ser forkert ud | Gulvet sluttede i en sort kant på en høj skærm og i de nye udsnit | gennemgang | pap-0.13 og pap-0.16 |
| R15 | Heksen | virker ikke | Hver gang ansigtet blev ændret, blev et nyt ansigt lagt oven på det gamle, så hukommelsen voksede | gennemgang | pap-0.15 |
| R16 | Boblebutikken | skal virke bedre | Teksten sagde, at stjerner kun tjenes i eliksirtimen. Den nævner nu også Arkaden | gennemgang | pap-0.16 |
| R17 | Telefon på langs | skal virke bedre | Knapperne øverst er gjort mindre på lave skærme | gennemgang | pap-0.16 |

## Set og lukket

| Nr. | Sted | Type | Hvad | Fra |
|---|---|---|---|---|
| 2 | Alle rum undtagen Værelset og Garderoben | ser forkert ud | På en telefon på højkant fylder rummet kun et bånd midt på skærmen. Lukket uden rettelse: Kasper har afgjort (21. nov. 2026), at spillet skal spilles på tablet, og at det bare skal virke på telefonen | gennemgang |

## Fast tjek før noget lægges op

1. `node spiltur.js`: turen gennem hele spillet med rigtige tryk skal ende med "fejl i alt: 0".
2. Når noget på heksen eller kæledyret er ændret: de billedark, der rører ved det, køres igen (`./kombi.sh` eller fx `./kombi.sh hat-haar dyr-pynt`), og hele arket ses igennem, ikke kun den nye ting. Arkene: hat-haar, hat-pande, kappe-toej, haar-kappe, toej-stoevler, tilb-toej, hat-tilb, dyr-pynt, dyr-moenster.
3. Når et rum er ændret: `node gennemgang.js 1280 800` (tablet), `node gennemgang.js 915 412 2 mobil` (telefon på langs) og `node gennemgang.js 980 1857` (højkant); alle billederne ses igennem.
4. Når Værelset er ændret: `node vaershot.js <plads>` for de pladser, der er rørt.
5. Det, der findes, skrives ind her, også når det bliver rettet med det samme.
