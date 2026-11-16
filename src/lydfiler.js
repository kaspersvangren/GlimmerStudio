// Egne lydfiler. Læg filen i mappen lyd/ og skriv den her, fx  'gnom.slag': 'lyd/gnom-slag.mp3'
// Flere filer på samme plads (en liste) = varianter: spillet vælger en tilfældig, aldrig den samme to gange i træk.
// Nøglerne står i Værkstedet (lyd-fanen). Alt der ikke står her, bruger spillets indbyggede lyd.
const LYD_FILER = {
  'gnom.slag': ['lyd/gnom-slag-1.mp3', 'lyd/gnom-slag-2.mp3', 'lyd/gnom-slag-3.mp3'],
  'gnom.av': ['lyd/gnom-av-1.mp3', 'lyd/gnom-av-2.mp3', 'lyd/gnom-av-3.mp3', 'lyd/gnom-av-4.mp3', 'lyd/gnom-av-5.mp3', 'lyd/gnom-av-6.mp3', 'lyd/gnom-av-7.mp3'],
  'gnom.forbi': ['lyd/gnom-forbi-1.mp3', 'lyd/gnom-forbi-2.mp3', 'lyd/gnom-forbi-3.mp3', 'lyd/gnom-forbi-4.mp3', 'lyd/gnom-forbi-5.mp3', 'lyd/gnom-forbi-6.mp3', 'lyd/gnom-forbi-7.mp3', 'lyd/gnom-forbi-8.mp3'],
  'invader.skud': ['lyd/invader-skud-1.mp3', 'lyd/invader-skud-2.mp3', 'lyd/invader-skud-3.mp3', 'lyd/invader-skud-4.mp3', 'lyd/invader-skud-5.mp3', 'lyd/invader-skud-6.mp3'],
  'invader.ramt': 'lyd/invader-ramt.mp3',
  'invader.au': 'lyd/invader-au.mp3',
  'invader.ugle': 'lyd/invader-ugle.mp3',
  'invader.boelge': 'lyd/invader-boelge.mp3',
  'skjold.skud': 'lyd/skjold-skud.mp3',
  'skjold.kugle': 'lyd/skjold-kugle.mp3',
  'skjold.meteor': 'lyd/skjold-meteor.mp3',
  'skjold.skjold': 'lyd/skjold-skjold.mp3',
  'skjold.ramt': 'lyd/skjold-ramt.mp3',
  'skjold.boelge': 'lyd/invader-boelge.mp3',
};
// Musik: 'byen', 'kaelder', 'show', 'kost', 'fald', 'arkade', 'gnom', 'skjold', 'invader', 'gribe'
// loop: [start, slut] i sekunder. Musikken spiller fra begyndelsen og hopper så fra slut tilbage til start, uden pause.
const LYD_MUSIK = {
  byen: { src: 'lyd/byen.mp3', loop: [73.57294, 133.61413] },   // Kaspers "Moonbeam Meadow". Loop B2, valgt af Kasper
  invader: { src: 'lyd/pixel-star-chase.mp3', loop: [26.7, 65.86335] },   // "Pixel Star Chase". Loop B, valgt af Kasper
  skjold: { src: 'lyd/orbital-ashes.mp3', loop: [71.6, 100.8465] },   // "Orbital Ashes". Loop A, valgt af Kasper
  kaelder: { src: 'lyd/wizard-crypt.mp3', loop: [65.4, 101.49313] },   // "Wizard Crypt Loop". Loop A, valgt af Kasper. Skolen og eliksirtimen
  kost: { src: 'lyd/broomstick-dash.mp3', loop: [13.56734, 40.2358], xf: 0.01 },   // "Broomstick Dash". Loop D, valgt af Kasper (takt 24 → takt 8). Kosteflyvning
  arkade: { src: 'lyd/arcade-drift.mp3', loop: [36.624, 132.6604], xf: 0.5 },   // "Arcade Drift Loop". Loop A (forslag). Arkadehallen
  gnom: { src: 'lyd/mole-pop.mp3', loop: [11.28151, 65.60459], xf: 0.01 },   // "Mole Pop Loop". Loop A (forslag). Bank en gnom
  gribe: { src: 'lyd/moonbyte-drift.mp3', loop: [34.70464, 109.78056], xf: 0.01 },   // "Moonbyte Drift". Loop A (forslag). Gribemaskinen
  'stemning.arkade': { src: 'lyd/arkade-stemning.mp3', loop: [3, 153], xf: 3, vol: 0.5 },   // "casino ambiance" (freesound): summen i arkadehallen, under hallens musik. 3 s overtoning
  fald: { src: 'lyd/cloud-glide.mp3', loop: [64, 138.03796], xf: 1 },   // "Cloud Glide Loop". Loop E, valgt af Kasper, 1 s overtoning. Faldskærm
};
