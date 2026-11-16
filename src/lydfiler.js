// Egne lydfiler. Læg filen i mappen lyd/ og skriv den her, fx  'gnom.slag': 'lyd/gnom-slag.mp3'
// Flere filer på samme plads (en liste) = varianter: spillet vælger en tilfældig, aldrig den samme to gange i træk.
// Nøglerne står i Værkstedet (lyd-fanen). Alt der ikke står her, bruger spillets indbyggede lyd.
const LYD_FILER = {
  'gnom.slag': ['lyd/gnom-slag-1.mp3', 'lyd/gnom-slag-2.mp3', 'lyd/gnom-slag-3.mp3'],
  'gnom.av': ['lyd/gnom-av-1.mp3', 'lyd/gnom-av-2.mp3', 'lyd/gnom-av-3.mp3', 'lyd/gnom-av-4.mp3', 'lyd/gnom-av-5.mp3', 'lyd/gnom-av-6.mp3', 'lyd/gnom-av-7.mp3'],
};
// Musik: 'byen', 'kaelder', 'show', 'arkade', 'gnom', 'skjold', 'invader', 'gribe'
// loop: [start, slut] i sekunder. Musikken spiller fra begyndelsen og hopper så fra slut tilbage til start, uden pause.
const LYD_MUSIK = {
  byen: { src: 'lyd/byen.mp3', loop: [73.57294, 133.28662] },   // Kaspers "Moonbeam Meadow". Loop B (23 takter)
};
