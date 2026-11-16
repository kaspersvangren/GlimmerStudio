// Egne lydfiler. Læg filen i mappen lyd/ og skriv den her, fx  'gnom.slag': 'lyd/gnom-slag.mp3'
// Flere filer på samme plads (en liste) = varianter: spillet vælger en tilfældig, aldrig den samme to gange i træk.
// Nøglerne står i Værkstedet (lyd-fanen). Alt der ikke står her, bruger spillets indbyggede lyd.
const LYD_FILER = {
  'gnom.slag': ['lyd/gnom-slag-1.mp3', 'lyd/gnom-slag-2.mp3', 'lyd/gnom-slag-3.mp3'],
  'gnom.av': ['lyd/gnom-av-1.mp3', 'lyd/gnom-av-2.mp3', 'lyd/gnom-av-3.mp3', 'lyd/gnom-av-4.mp3', 'lyd/gnom-av-5.mp3', 'lyd/gnom-av-6.mp3', 'lyd/gnom-av-7.mp3'],
};
// Musik: 'byen', 'kaelder', 'show', 'kost', 'fald', 'arkade', 'gnom', 'skjold', 'invader', 'gribe'
// loop: [start, slut] i sekunder. Musikken spiller fra begyndelsen og hopper så fra slut tilbage til start, uden pause.
const LYD_MUSIK = {
  byen: { src: 'lyd/byen.mp3', loop: [73.57294, 133.61413] },   // Kaspers "Moonbeam Meadow". Loop B2, valgt af Kasper
  invader: { src: 'lyd/pixel-star-chase.mp3', loop: [26.7, 65.86335] },   // "Pixel Star Chase". Loop B, valgt af Kasper
  skjold: { src: 'lyd/orbital-ashes.mp3', loop: [71.6, 100.8465] },   // "Orbital Ashes". Loop A, valgt af Kasper
  kaelder: { src: 'lyd/wizard-crypt.mp3', loop: [65.4, 101.49313] },   // "Wizard Crypt Loop". Loop A, valgt af Kasper. Skolen og eliksirtimen
  fald: { src: 'lyd/cloud-glide.mp3', loop: [75.6, 149.44998] },   // "Cloud Glide Loop". Loop A (forslag). Faldskærm
};
