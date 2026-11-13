/* ---------- replikker: alt det, figurerne på kortet siger ----------
   Kasper skriver dem i værktøjet "Replikker"; Claude henter dem derfra og lægger dem her.
   Lister: én tilfældig linje pr. tryk. Vittigheder: [spørgsmål, svar]. {n} i brøndens tekster bliver til et tal. */
const TXT = {
  "drage-vaagner": ["Huh? Hvem vækker mig?!", "ZzZz… hva’? Nå, det er dig!", "ZzZz… huh?! Dig der! Vil du høre en vits?!", "ZzZz… hva’? Ja ja, jeg er vågen, din lille skid!", "ZzZzmmm ja, kys mig, din dejlige frø zZz... Huh?"],
  "drage-vitser": [
    ["Hvad sagde dragen, da den så en ridder?", "Åh nej, ikke mere dåsemad!"],
    ["Hvad sagde nul til otte?", "Flot bælte!"],
    ["Hvorfor kan skeletter ikke lyve?", "Man kan se lige igennem dem!"],
    ["Hvad kalder man en hund, der kan trylle?", "En labra-kadabra-dor!"],
    ["Hvad er gult og flyver?", "En bananflue!"],
    ["Hvad er det mest musikalske i kroppen?", "Trommehinden!"],
    ["Hvad siger en snemand til en anden?", "Lugter her ikke af gulerødder?"],
    ["En blind mand gik ind i et hus.", "Og en bil og en stol og et træ."],
    ["Jeg begår aldrig fejl", "Jeg troede engang jeg begik en, men det var forkert"],
    ["Jeg glemmer tit ting...", "...men i det mindste glemmer jeg ikke tit ting."],
    ["Hvad har 5 tæer, men er ikke din fod?", "Min fod."],
    ["Hvorfor falder dykkere baglæns ned i vandet?", "Fordi hvis de faldt forlæns, ville de falde ned i båden!"],
    ["Jeg har ikke sovet i et år", "Det ville være alt for lang tid!"],
  ],
  "drage-griner": ["HAHAHAHAHA, jeg er sjov!", "HAHAHA! Den er god, hva’?", "Pisse sjov vits, skrid så.", "Grin, eller jeg rister dig!", "*fnis*", "Jeg er den sjoveste drage du kender. Faktum!"],
  trold: ["ZzZz… hvem tramper på min bro?", "Zzz… gå nu stille over broen!", "Mmm… trolde-grød…", "ZzZz... jeg hader Bukke Bruser... så meget... ZzZz", "ZzZz... Du larmer! Heldigt for dig at i dag er kødfri!"],
  krage: ["Krah! Dragen bor den vej!", "Krah krah!", "Krah! Har du set noget, der glimter?", "Mjav... øh, jeg mener, krah!", "Jeg kunne godt spise en stor, fed burger!"],
  and: ["Rap rap!", "Rap!", "Rap! Rap! Rap!", "Kykkeli...kyyy?", "Jeg hader gæs, rap!"],
  bjoern: ["Brum… zzz", "ZzZz... mmm, honning... ZzZz"],
  enhjoerning: ["Iiihh!", "Vrinsk. Vrinsk.", "Hold op med at glo på mit horn, jeg bliver genert!"],
  drageunge: ["Pip-rawr!", "Raaaa!", "Jeg er super farlig!"],
  kat: ["Mjav!", "Åben døren, så jeg kan kigge ind, men ikke gå igennem.", "Jeg hader mandage!", "Spiser du noget? Jeg elsker noget!", "Min madskål er halvtom. Ring 112!", "Jeg har ikke en ejer, jeg har personale.", "Kom her, så jeg kan ignorere dig."],
  snegl: ["Jeg skynder mig!", "Fuld fart fremad!", "De kalder mig Turbo.", "Vroooooom!"],
  broend: {
    spoerg: "Ønske? Tryk igen for at smide en stjerne i!",
    ingen: "Smid en stjerne i for at ønske!",
    opfyldt: "Tillykke! Din økse er gået i opfyldelse!",
    foerste: "Den er leveret til dit værelse.",
    flere: "En til? Er {n} økser nok?",
    udsolgt: "Nu er brønden UDSOLGT!",
    tom: "UDSOLGT! Ikke flere økser!",
  },
};
