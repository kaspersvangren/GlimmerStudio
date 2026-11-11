/* ================= Modehuset: klæd dig ud som … ================= */
const THEMES = [
  { id:'strand', name:'Strandfest', text:'Sommer, sol og strand!', tag:'sommer', colors:['#FFE27A','#62E0CB','#FF9A4D','#7FD8FF','#FF5A4A','#FFFFFF','#FFC02E'] },
  { id:'halloween', name:'Halloween', text:'Uhyggeligt og sjovt!', tag:'uhyggelig', colors:['#FF9A4D','#1E1A2E','#5E3BC4','#4A4560','#9BE36A','#8A5BE8'] },
  { id:'bal', name:'Prinsessebal', text:'Fint, flot og eventyrligt!', tag:'prinsesse', colors:['#FF8FC7','#FFC1DC','#B79BFF','#FFFFFF','#FFE27A','#7FD8FF','#FF5FA8'] },
  { id:'sport', name:'Sportsdag', text:'Klar til at løbe og hoppe!', tag:'sport', colors:['#2F6FE0','#FF5A4A','#FFFFFF','#FFC02E','#3FA34D','#6FA8FF'] },
  { id:'vinter', name:'Vinterfest', text:'Varmt tøj til sne og frost!', tag:'vinter', colors:['#FFFFFF','#7FD8FF','#E8E4F2','#9C95B5','#6FA8FF','#C2272D'] },
  { id:'rock', name:'Rockkoncert', text:'Sejt, vildt og højt!', tag:'rock', colors:['#1E1A2E','#C2272D','#4A4560','#9C95B5','#FF5FA8','#E0457A'] },
  { id:'regnbue', name:'Regnbuedag', text:'Alle farver på én gang!', tag:'farverig', rainbow:true },
  { id:'pyjamas', name:'Pyjamasparty', text:'Blødt, hyggeligt og pastel!', tag:'hyggelig', pastel:true },
];
/* hvilke temaer hver ting passer til */
const TAGS = {
  robe:{ stjerner:['prinsesse','farverig'], maane:['uhyggelig','hyggelig'], knapper:['vinter','rock'], lag:['prinsesse','sommer'], kort:['sommer','sport'] },
  cape:{ lang:['prinsesse','vinter'], kort:['sport','sommer'], haette:['vinter','uhyggelig'], stjerner:['farverig','rock'] },
  hat:{ spids:['uhyggelig','prinsesse'], knaek:['uhyggelig','farverig'], kort:['sommer','rock'], hue:['hyggelig','vinter'] },
  boots:{ snoer:['vinter','sport'], spidse:['prinsesse','uhyggelig'], hoeje:['rock','vinter'] },
  acc:{ stav:['prinsesse','uhyggelig'], tryllestav:['prinsesse','farverig'], bog:['hyggelig','uhyggelig'], baelte:['sport','rock'], toerklaede:['vinter','hyggelig'], halskaede:['prinsesse','rock'], briller:['sommer','rock'] },
  back:{ hestehale:['sport'], fletninger:['hyggelig','sport'], kroeller:['rock'], knolde:['farverig','hyggelig'], langt:['prinsesse'], kort:['sport'], kortkrol:['sport','rock'] },
  pet:{ drage:['uhyggelig','rock'], enhjoerning:['prinsesse','farverig'], kat:['uhyggelig','hyggelig'], hund:['sport'], bjoern:['hyggelig','vinter'], kanin:['hyggelig','sommer'] },
};
const hasTag = (group, id, tag) => ((TAGS[group]||{})[id]||[]).includes(tag);
function hexHsl(h){ return rgb2hsl(...hex2rgb(h)); }
function colorDist(a, b){ const A = hex2rgb(a), B = hex2rgb(b); return Math.hypot(A[0]-B[0], A[1]-B[1], A[2]-B[2]); }
const outfitColors = st => [st.robe.a, st.cape.id !== 'ingen' ? st.cape.a : st.robe.b, st.hat.id !== 'ingen' ? st.hat.a : st.boots.a];

/* Madame Mis: passer tøjet til temaet? */
function themeScore(st, th){
  let hits = 0;
  if (hasTag('robe', st.robe.id, th.tag)) hits += 1.4;
  if (hasTag('cape', st.cape.id, th.tag)) hits += 1;
  if (hasTag('hat', st.hat.id, th.tag)) hits += 1;
  if (hasTag('boots', st.boots.id, th.tag)) hits += 0.6;
  if (hasTag('back', st.back, th.tag)) hits += 0.6;
  if (st.pet.kind !== 'ingen' && hasTag('pet', st.pet.kind, th.tag)) hits += 0.6;
  hits += Math.min(1.6, Object.keys(st.acc).filter(k => hasTag('acc', k, th.tag)).length * 0.8);
  return 2 + hits * 1.25;
}
/* Robo-Rita: passer farverne? */
function colorScore(st, th){
  if (th.rainbow){
    const cols = [st.robe.a, st.robe.b, st.cape.a, st.cape.b, st.hat.a, st.hat.b, st.boots.a, st.hair.a].concat(st.hair.ombre ? [st.hair.b] : []).concat(Object.values(st.acc));
    const buckets = new Set(cols.map(hexHsl).filter(([h,s,l]) => s > 0.3 && l > 0.2 && l < 0.92).map(([h]) => Math.floor(h*8)));
    return 1.5 + buckets.size * 1.3;
  }
  if (th.pastel){
    const cols = [st.robe.a, st.robe.b, st.cape.a, st.cape.b, st.hat.a, st.hat.b];
    return 1.5 + cols.filter(c => { const [,s,l] = hexHsl(c); return l > 0.72 && s > 0.15; }).length * 1.4;
  }
  const near = outfitColors(st).filter(c => Math.min(...th.colors.map(t => colorDist(c, t))) < 95).length;
  const hairNear = Math.min(...th.colors.map(t => colorDist(st.hair.a, t))) < 95 ? 0.8 : 0;
  return 2.5 + near * 2.2 + hairNear;
}
/* Mormor Glimmer: elsker glimmer, pynt og lyserødt */
function glitterScore(st){
  let p = 2;
  if (st.mk.mark === 'glimmer') p += 1.5;
  if (st.robe.id === 'stjerner' || st.cape.id === 'stjerner') p += 2;
  if (st.robe.id === 'lag') p += 1.5;
  if (st.eyes.pupil === 'glimt' || st.eyes.pupil === 'stjerne') p += 1;
  p += Math.min(3, Object.keys(st.acc).length * 0.9);
  if ([st.robe.a, st.cape.a, st.hat.a, st.hair.a].some(c => { const [h,s] = hexHsl(c); return s > 0.4 && (h > 0.83 || h < 0.03); })) p += 1;
  if (st.hair.ombre) p += 0.6;
  if (st.pet.acc && st.pet.acc.vinger) p += 0.6;
  return p;
}

/* ---------- dommerne ---------- */
function judgeSvg(id){
  if (id === 'mis') return `<svg viewBox="0 0 160 160" aria-hidden="true">
<path d="M 30 70 L 34 18 L 66 44 Z M 130 70 L 126 18 L 94 44 Z" fill="#FFFFFF" stroke="#B9A6D6" stroke-width="4" stroke-linejoin="round"/><path d="M 38 56 L 40 30 L 58 46 Z M 122 56 L 120 30 L 102 46 Z" fill="#FFB3D1"/>
<ellipse cx="80" cy="88" rx="58" ry="52" fill="#FFFFFF" stroke="#B9A6D6" stroke-width="4"/>
<path d="M 46 82 Q 58 74 68 82" fill="none" stroke="#1B1330" stroke-width="4" stroke-linecap="round"/><ellipse cx="102" cy="84" rx="9" ry="11" fill="#1B1330"/><circle cx="99" cy="80" r="3" fill="#FFFFFF"/>
<circle cx="102" cy="84" r="17" fill="#CDEBFF" fill-opacity="0.35" stroke="#D9A521" stroke-width="4"/><path d="M 116 94 Q 128 118 120 140" fill="none" stroke="#D9A521" stroke-width="2.5"/>
<path d="M 74 104 Q 80 100 86 104 Q 83 109 80 110 Q 77 109 74 104 Z" fill="#FF8FB0"/><path d="M 70 116 Q 75 121 80 114 Q 85 121 90 116" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round"/>
<path d="M 56 108 L 24 104 M 56 114 L 26 120 M 104 108 L 136 104 M 104 114 L 134 120" stroke="#B9A6D6" stroke-width="2.5" stroke-linecap="round"/>
<g transform="translate(80,142)"><path d="M 0 0 C -12 -12, -26 -10, -24 0 C -26 10, -12 12, 0 0 Z M 0 0 C 12 -12, 26 -10, 24 0 C 26 10, 12 12, 0 0 Z" fill="#7B5CFF" stroke="#4B34A8" stroke-width="2.5"/><circle r="6" fill="#7B5CFF" stroke="#4B34A8" stroke-width="2.5"/></g></svg>`;
  if (id === 'robo') return `<svg viewBox="0 0 160 160" aria-hidden="true">
<path d="M 80 30 L 80 14" stroke="#8B82A8" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="12" r="8" fill="#FF3D8F" stroke="#B32268" stroke-width="3"/>
<rect x="26" y="30" width="108" height="100" rx="26" fill="#DDE3F2" stroke="#8B82A8" stroke-width="4"/><rect x="38" y="48" width="84" height="46" rx="14" fill="#2A2340"/>
<rect x="50" y="60" width="20" height="22" rx="6" fill="#43D3BE"/><rect x="90" y="60" width="20" height="22" rx="6" fill="#43D3BE"/><rect x="54" y="63" width="6" height="6" rx="2" fill="#FFFFFF"/><rect x="94" y="63" width="6" height="6" rx="2" fill="#FFFFFF"/>
<rect x="56" y="104" width="48" height="12" rx="4" fill="#2A2340"/><path d="M 64 104 L 64 116 M 72 104 L 72 116 M 80 104 L 80 116 M 88 104 L 88 116 M 96 104 L 96 116" stroke="#43D3BE" stroke-width="2"/>
<circle cx="20" cy="80" r="10" fill="#C9C3E0" stroke="#8B82A8" stroke-width="3"/><circle cx="140" cy="80" r="10" fill="#C9C3E0" stroke="#8B82A8" stroke-width="3"/>
<circle cx="40" cy="40" r="3" fill="#8B82A8"/><circle cx="120" cy="40" r="3" fill="#8B82A8"/><circle cx="40" cy="120" r="3" fill="#8B82A8"/><circle cx="120" cy="120" r="3" fill="#8B82A8"/>
<ellipse cx="44" cy="104" rx="8" ry="5" fill="#FF7FA6" opacity="0.6"/><ellipse cx="116" cy="104" rx="8" ry="5" fill="#FF7FA6" opacity="0.6"/></svg>`;
  return `<svg viewBox="0 0 160 160" aria-hidden="true">
<circle cx="80" cy="26" r="20" fill="#E8E4EE" stroke="#9C95B5" stroke-width="3.5"/><path d="M 68 22 Q 80 14 92 22" fill="none" stroke="#9C95B5" stroke-width="2.5"/>
<path d="M 24 96 C 18 46, 52 32, 80 32 C 108 32, 142 46, 136 96 Z" fill="#E8E4EE" stroke="#9C95B5" stroke-width="3.5"/>
<ellipse cx="80" cy="94" rx="50" ry="48" fill="#FAD4BE" stroke="#D9A08A" stroke-width="3.5"/>
<path d="M 32 66 C 44 50, 62 46, 80 50 C 98 46, 116 50, 128 66 C 112 58, 96 58, 80 62 C 64 58, 48 58, 32 66 Z" fill="#E8E4EE" stroke="#9C95B5" stroke-width="3"/>
<circle cx="60" cy="90" r="14" fill="#FFFFFF" fill-opacity="0.5" stroke="#B5432A" stroke-width="3.5"/><circle cx="100" cy="90" r="14" fill="#FFFFFF" fill-opacity="0.5" stroke="#B5432A" stroke-width="3.5"/><path d="M 74 90 L 86 90" stroke="#B5432A" stroke-width="3"/>
<ellipse cx="60" cy="91" rx="5" ry="6" fill="#1B1330"/><ellipse cx="100" cy="91" rx="5" ry="6" fill="#1B1330"/><circle cx="58" cy="88" r="2" fill="#FFFFFF"/><circle cx="98" cy="88" r="2" fill="#FFFFFF"/>
<ellipse cx="46" cy="112" rx="10" ry="6" fill="#FF7FA6" opacity="0.55"/><ellipse cx="114" cy="112" rx="10" ry="6" fill="#FF7FA6" opacity="0.55"/>
<path d="M 66 116 Q 80 128 94 116" fill="none" stroke="#C2272D" stroke-width="4" stroke-linecap="round"/>
<path d="M 48 140 Q 80 156 112 140" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-dasharray="0.1 9" stroke-linecap="round"/>
${star4(132,40,9,'#FFE27A')}${star4(24,46,6,'#FFE27A')}</svg>`;
}
const JUDGES = [
  { id:'mis', name:'Madame Mis', role:'Passer det til temaet?', fn: (st, th) => themeScore(st, th),
    lines:{ lav:['Hvor er temaet, skat?','Mjav … det her er et helt andet tema.','Jeg forstår det ikke, men det er modigt.'],
            mid:['Mjav, det er næsten rigtigt.','Godt forsøg! Lidt mere tema, tak.','Pænt. Jeg vil gerne se mere.'],
            hoj:['Purrr-fekt! Præcis temaet!','Mjav! Det er jo SÅ meget temaet!','Jeg taber min monokel!'] } },
  { id:'robo', name:'Robo-Rita', role:'Passer farverne?', fn: (st, th) => colorScore(st, th),
    lines:{ lav:['FEJL 404: farver passer ikke.','BIP. Mine øjne gør ondt.','Beregner … beregner … nej.'],
            mid:['BIP BOP. Farverne er okay.','Farvetjek: 62 % godkendt.','Beregner … ikke dårligt.'],
            hoj:['BIP BIP! Farverne passer 100 %!','Farve-alarm! Det er perfekt!','Jeg gemmer det her i min hukommelse!'] } },
  { id:'mormor', name:'Mormor Glimmer', role:'Elsker glimmer og pynt', fn: st => glitterScore(st),
    lines:{ lav:['Hvor er glimmeret dog henne?','Lidt mere pynt, min skat!','Jeg har glimmer i tasken, hvis du mangler.'],
            mid:['Åh, det glimter lidt. Dejligt!','Fint, fint! Mere glimmer næste gang.','Det minder mig om min ungdom!'],
            hoj:['Åh, se alt det glimmer! Jeg besvimer!','Det er det smukkeste, jeg har set!','BRAVO! Jeg giver dig en karamel!'] } },
];
const tier = s => s <= 4 ? 'lav' : s <= 7 ? 'mid' : 'hoj';
function judgeAll(st, th){
  return JUDGES.map(j => {
    let s = Math.round(j.fn(st, th) + (Math.random()*2 - 1));
    if (j.id === 'mormor' && Math.random() < 0.08) s = 10;
    s = clamp(s, 1, 10);
    return { s, line: pick(j.lines[tier(s)]) };
  });
}

/* ---------- spillets gang ---------- */
let F = null;
function gameHead(title){ return el('div', { class:'screen-head' }, [ el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); F = null; goTo(showTown); } }, html: ic('<path d="M15 5l-7 7 7 7"/>') + 'Byen' }), el('h2', {}, title), starPill() ]); }
function startFashion(){ showScreen('#game'); playMusic('byen'); F = null; renderPickDoll(); }
function renderPickDoll(){
  const box = $('#gameBody'); box.innerHTML = '';
  box.append(gameHead('Modehuset'));
  const grid = el('div', { class:'fig-grid' });
  if (!figures.length){
    box.append(el('div', { class:'center-col' }, [ el('p', { class:'lead' }, 'Du skal have en dukke for at gå på catwalken.'), el('button', { class:'btn hot', type:'button', on:{ click: newFigure } }, 'Lav din første dukke') ]));
    return;
  }
  for (const f of figures.slice().sort((a,b)=>(b.t||0)-(a.t||0))){
    const st = enforce(fixState(clone(f.st)));
    grid.append(el('div', { class:'card' }, [ el('button', { class:'open', type:'button', on:{ click: () => { sfx.pick(); F = { doll: f, theme: pick(THEMES) }; renderTheme(); } } },
      [ dollImg(st, { bg:true, viewBox:'100 90 600 640' }), el('span', { class:'nm' }, f.name) ]) ]));
  }
  box.append(el('p', { class:'lead' }, 'Hvem skal gå på catwalken?'), grid);
}
function judgesRow(extra){
  return el('div', { class:'judges' }, JUDGES.map((j, i) => el('div', { class:'judge', 'data-j': j.id }, [ el('div', { class:'jface', html: judgeSvg(j.id) }), el('b', {}, j.name), el('small', {}, j.role), extra ? extra(i) : null ])));
}
function renderTheme(){
  const box = $('#gameBody'); box.innerHTML = '';
  sfx.magic();
  box.append(gameHead('Modehuset'), el('div', { class:'theme-card' }, [
    el('p', { class:'eyebrow' }, 'Dagens tema'),
    el('h2', { class:'theme-name' }, F.theme.name),
    el('p', { class:'lead' }, F.theme.text),
    judgesRow(),
    el('div', { class:'row center' }, [
      el('button', { class:'btn', type:'button', on:{ click: () => { F.theme = pickOther(THEMES, F.theme); renderTheme(); } } }, 'Andet tema'),
      el('button', { class:'btn hot big', type:'button', on:{ click: dressUp } }, 'Klæd på!') ]),
  ]));
}
function dressUp(){
  const temp = { temp:true, id: F.doll.id, name: F.doll.name, st: clone(F.doll.st) };
  openEditor(temp, { tab:'kjole', game: { theme: F.theme } });
}
/* kaldes fra skaberen */
function finishDress(){
  F.player = { name: cur.name, st: clone(cur.st), me: true };
  showScreen('#game'); runShow();
}
function rivalFor(th, taken){
  let best = null;
  const tries = Math.random() < 0.6 ? 3 : 1;
  for (let i=0;i<tries;i++){ const g = randomGuest(taken); const sc = themeScore(g.st, th) + colorScore(g.st, th); if (!best || sc > best.sc) best = { g, sc }; }
  return best.g;
}
async function runShow(){
  const th = F.theme;
  const special = Math.random() < 0.25 ? ownGuest(F.doll.id) : null;
  const taken = [F.player.name].concat(special ? [special.name] : []);
  const rivals = [];
  if (special) rivals.push(special);
  while (rivals.length < 2){ const r = rivalFor(th, taken); taken.push(r.name); rivals.push(r); }
  F.special = !!special;
  F.all = shuffle(rivals).concat([F.player]);
  playMusic('show');
  for (const c of F.all){ c.scores = judgeAll(c.st, th); c.total = c.scores.reduce((a, b) => a + b.s, 0); }
  const box = $('#gameBody');
  for (let i=0;i<F.all.length;i++){
    const c = F.all[i];
    box.innerHTML = '';
    const tag = c.me ? 'Din tur: ' + c.name : c.own ? 'Særlig gæst: ' + c.name + '!' : c.name;
    const runway = el('div', { class:'runway' + (c.own ? ' special' : '') }, [ el('div', { class:'walker' }, dollImg(c.st, { viewBox: VB.full, anim: !calm })), el('div', { class:'nametag' }, tag) ]);
    const row = judgesRow(j => el('div', { class:'paddle', 'aria-hidden':'true' }, [ el('span', {}, '') ]));
    const bubble = el('p', { class:'bubble', hidden: true });
    const next = el('button', { class:'btn hot big', type:'button', hidden: true }, i < F.all.length - 1 ? 'Næste' : 'Se resultatet');
    box.append(gameHead('Modehuset · ' + th.name), el('div', { class:'show' }, [ runway, el('div', { class:'panel-side' }, [ row, bubble, next ]) ]));
    sfx.whoosh();
    if (c.own){ sfx.fanfare(); confetti(runway, 30); }
    await wait(c.own ? 1600 : 1000);
    const paddles = row.querySelectorAll('.paddle');
    for (let j=0;j<JUDGES.length;j++){
      const p = paddles[j], sc = c.scores[j];
      p.querySelector('span').textContent = sc.s; p.classList.add('up', 't-' + tier(sc.s)); sfx.paddle(sc.s);
      bubble.hidden = false; bubble.innerHTML = ''; bubble.append(el('b', {}, JUDGES[j].name + ': '), sc.line);
      await wait(1400);
    }
    bubble.innerHTML = ''; bubble.append(el('b', {}, 'I alt: '), `${c.total} point`);
    next.hidden = false; next.focus();
    await new Promise(r => { next.onclick = () => { sfx.pick(); r(); }; });
  }
  renderResults();
}
function renderResults(){
  const box = $('#gameBody'); box.innerHTML = ''; playMusic('byen');
  const order = F.all.slice().sort((a, b) => b.total - a.total || (b.me ? 1 : 0) - (a.me ? 1 : 0));
  const place = order.indexOf(F.player) + 1;
  const base = [15, 10, 6][place - 1];
  const earned = base * (F.special ? 2 : 1);
  addStars(earned);
  const podiumOrder = [order[1], order[0], order[2]];
  const podium = el('div', { class:'podium' }, podiumOrder.map((c, k) => {
    const pl = [2,1,3][k];
    return el('div', { class:'step s' + pl + (c.me ? ' me' : '') }, [
      el('div', { class:'pdoll' + (c.me && pl === 1 ? ' jump' : '') }, dollImg(c.st, { viewBox: VB.full, anim: !calm })),
      el('div', { class:'block' }, [ el('span', { class:'medal' }, String(pl)), el('b', {}, c.me ? c.name + ' (dig)' : c.name), el('small', {}, `${c.total} point`) ]) ]);
  }));
  const msg = place === 1 ? 'Du vandt!' : place === 2 ? 'Flot! Du blev nummer 2.' : 'Nummer 3. Næste gang!';
  box.append(gameHead('Resultatet'), el('div', { class:'results' }, [
    el('h2', { class:'theme-name' }, msg),
    podium,
    el('p', { class:'earned', html: `${STAR_SVG}<span>+${earned} stjerner${F.special ? ' (dobbelt, fordi der var en særlig gæst)' : ''}</span>` }),
    el('div', { class:'row center' }, [
      el('button', { class:'btn', type:'button', on:{ click: () => { F.doll.st = clone(F.player.st); F.doll.t = Date.now(); saveAll(); toast('Looket er gemt på ' + F.doll.name); } } }, 'Gem looket på dukken'),
      el('button', { class:'btn', type:'button', on:{ click: () => goTo(showBalls) } }, 'Til kuglerne'),
      el('button', { class:'btn hot big', type:'button', on:{ click: () => { F = { doll: F.doll, theme: pickOther(THEMES, F.theme) }; renderTheme(); } } }, 'Spil igen'),
    ]),
  ]));
  if (place === 1){ sfx.fanfare(); confetti(box, 70); } else sfx.coin();
}
