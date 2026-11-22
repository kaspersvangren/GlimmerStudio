/* ============ forsiden, de tre gemte spil og bogen i starten (som i originalen) ============
   Efter indlæsningen kommer forsiden: spillets navn på et papskilt over byen og en rund play-knap.
   Så kommer hylden med tre bøger, én pr. gemt spil. En tom bog starter et nyt spil med eventyrbogen, hvor man skriver sit navn og
   blader med pilene; til sidst lukkes bogen, og forsiden "Magiske Mig" kommer frem. Så laver man sin heks i Garderoben.
   Skifter man til en anden bog end den, der er indlæst, genindlæses siden med den nye plads (det er den sikre vej, fordi byen og heksen
   bygges ud fra det gemte, når siden starter). Teksterne og tegningerne i bogen er originalens. */
const FORSIDE=(()=>{
  const h=(tag,a={},kids=[])=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(a)){if(k==='on')for(const[ev,f]of Object.entries(v))e.addEventListener(ev,f);else if(k==='html')e.innerHTML=v;else if(k==='class')e.className=v;else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v)}for(const c of[].concat(kids))if(c!=null)e.append(c);return e};
  const vent=ms=>new Promise(r=>setTimeout(r,ms)),stille=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lyd=n=>{try{if(typeof LYD!=='undefined'&&LYD[n])LYD[n]()}catch(_){}};
  const STJ='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.8 6 6.6.8-4.9 4.5 1.3 6.5L12 17.2l-5.8 3.2 1.3-6.5L2.6 9.4l6.6-.8z" fill="#FFE27A" stroke="#A8740A" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  let rod=null;
  const vis=skaerm=>{if(!rod){rod=h('div',{id:'forside'});document.body.append(rod)}rod.hidden=false;rod.replaceChildren(skaerm);if(typeof LOG!=='undefined'&&LOG.skaerm)LOG.skaerm(skaerm.dataset.navn||'forside')};
  const luk=()=>{if(rod){rod.hidden=true;rod.replaceChildren()}kbLuk();if(typeof LOG!=='undefined'&&LOG.skaerm)LOG.skaerm('by')};
  const info=n=>{let s=null;try{s=JSON.parse(localStorage.getItem(PLADSNOEGLE(n))||'null')}catch(_){}const brugt=!!(s&&(s.navn||s.stj>0||(s.data&&s.data.intro)||(s.har&&s.har.length>3)));return{n,brugt,navn:(s&&s.navn)||'',stj:(s&&s.stj)||0,hat:(s&&s.farver&&(s.farver.hat||s.farver['tøj']))||'#6a3fa2'}};
  /* ---------- forsiden ---------- */
  function forside(){const play=h('button',{class:'fs-play',type:'button','aria-label':'Spil',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',on:{click:()=>{lyd('valg');pladser()}}});
    const s=h('div',{class:'fs-titel','data-navn':'forside'},[h('div',{class:'fs-skilt'},[h('div',{class:'fs-navn'},'Magiske Mig'),h('div',{class:'fs-under'},'en magisk skole')]),play,h('div',{class:'fs-udg'},'Udgave '+PAPVER)]);vis(s)}
  /* ---------- hylden med tre bøger ---------- */
  const FARVE=[['#5B2E91','#3A1A63'],['#1F6E6A','#10433F'],['#8E2A3F','#5A1426']];
  const HATSVG=c=>`<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="76" rx="40" ry="10" fill="${c}" stroke="#2a1440" stroke-width="3"/><path d="M22 74 C30 52 36 34 44 22 C50 12 62 8 72 12 C64 16 60 24 60 34 C60 50 66 64 76 74 Q50 82 22 74Z" fill="${c}" stroke="#2a1440" stroke-width="3" stroke-linejoin="round"/><path d="M26 68 Q50 76 72 68 L74 74 Q50 82 24 74Z" fill="#e8c66a" stroke="#2a1440" stroke-width="2"/><path d="M42 40l3 6 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1z" fill="#ffe27a"/></svg>`;
  function pladser(){const boeger=[1,2,3].map(n=>{const s=info(n),[c1,c2]=FARVE[n-1];
      const front=s.brugt?[h('div',{class:'sb-port',html:HATSVG(s.hat)}),h('div',{class:'sb-name'},s.navn||'Uden navn'),h('div',{class:'sb-stars',html:STJ+'<span>'+s.stj+'</span>'})]
        :[h('div',{class:'sb-port sb-new',html:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 22v56M22 50h56" stroke="#F2D27A" stroke-width="9" stroke-linecap="round"/></svg>'}),h('div',{class:'sb-name'},'Nyt spil')];
      const bog=h('button',{class:'sbook'+(s.brugt?'':' empty'),type:'button',style:`--c1:${c1};--c2:${c2}`,'aria-label':s.brugt?`Spil som ${s.navn||'uden navn'}`:'Start et nyt spil',on:{click:()=>vaelg(n,s.brugt)}},[h('div',{class:'sb-cover'},front)]);
      const slet=s.brugt?h('button',{class:'sb-del',type:'button','aria-label':'Slet dette spil',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',on:{click:e=>{e.stopPropagation();lyd('valg');spoerg(`Slet ${s.navn||'dette spil'}?`,'Hele spillet bliver slettet: heksen, stjernerne og alt det, hun har samlet. Det kan ikke fortrydes.','Ja, slet',()=>{try{localStorage.removeItem(PLADSNOEGLE(n))}catch(_){}if(n===PLADS){sessionStorage.setItem('magiske-mig-pap.direkte','pladser');location.reload()}else pladser()})}}}):null;
      return h('div',{class:'sb-wrap'},[bog,slet])});
    vis(h('div',{class:'fs-pladser','data-navn':'pladser'},[h('div',{class:'sb-bg'}),h('button',{class:'fs-tilbage kraft',type:'button',on:{click:()=>{lyd('valg');forside()}},html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7 1.5-1.4L10.8 12 16 6.4z"/></svg><span>Forsiden</span>'}),h('h1',{class:'sb-title'},'Hvem skal spille?'),h('div',{class:'sb-shelf'},boeger)]))}
  function spoerg(titel,tekst,ja,fn){const b=h('div',{class:'fs-spoerg'},[h('div',{class:'kraft fs-spkort'},[h('h2',{},titel),h('p',{},tekst),h('div',{class:'fs-spkn'},[h('button',{type:'button',class:'fs-knap',on:{click:()=>b.remove()}},'Nej'),h('button',{type:'button',class:'fs-knap hot',on:{click:()=>{b.remove();fn()}}},ja)])])]);rod.append(b)}
  function vaelg(n,brugt){lyd('guld');if(n!==PLADS){try{localStorage.setItem('magiske-mig-pap.plads',String(n));sessionStorage.setItem('magiske-mig-pap.direkte',brugt?'by':'intro')}catch(_){}vis(h('div',{class:'fs-titel'},[h('div',{class:'fs-skilt'},[h('div',{class:'fs-under'},'Henter bogen …')])]));setTimeout(()=>location.reload(),250);return}
    if(brugt)luk();else intro()}

const INTRO_PAGES = [
  { art:'portraet', lines:[ ['big', 'Hej med dig!'], ['name', 'Jeg hedder'], ['', 'og jeg vil gerne invitere dig ind i min verden.'] ] },
  { art:'hat', lines:[ ['', 'Min verden er ikke helt almindelig.'], ['', 'For jeg er heller ikke helt almindelig …'], ['big glow', 'Jeg er nemlig en heks!'] ] },
  { art:'slot', lines:[ ['', 'Jeg går i skole, ligesom dig.'], ['big', 'Men min skole er en magisk skole!'] ] },
  { art:'kost', lines:[ ['', 'Vi flyver på koste, brygger eliksirer og springer i faldskærm fra skyerne.'], ['', 'Og nogle gange hygger vi os bare.'] ] },
  { art:'doer', lines:[ ['', 'Kunne du tænke dig at tage med?'], ['', 'Så følg mig …'], ['big', 'eller skulle jeg sige …'] ] },
];
const INTRO_END = { text: 'Men hov … hvordan ser jeg egentlig ud? Det må du bestemme!', btn: 'Lav min heks' };

/* tegningerne på venstresiderne: blæk og vandfarve på gammelt papir */
function introArt(kind){
  const INK = '#4A3020', W = (id, c, o = .55) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset=".7" stop-color="${c}" stop-opacity="${o * .45}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const star = (x, y, r, c = '#E2A93B') => `<path d="M ${x} ${y - r} L ${x + r * .28} ${y - r * .28} L ${x + r} ${y} L ${x + r * .28} ${y + r * .28} L ${x} ${y + r} L ${x - r * .28} ${y + r * .28} L ${x - r} ${y} L ${x - r * .28} ${y - r * .28} Z" fill="${c}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const dots = [[60, 70, 7], [330, 90, 9], [300, 360, 6], [80, 330, 8], [350, 230, 5], [50, 200, 5]].map(([x, y, r]) => star(x, y, r)).join('');
  let d = `<defs>${W('wP', '#7B4FD0')}${W('wB', '#3D6FC2')}${W('wG', '#F2C14E', .7)}${W('wR', '#C2465E')}${W('wT', '#2E9C8A')}</defs>`;
  if (kind === 'portraet'){
    d += `<ellipse cx="200" cy="215" rx="150" ry="160" fill="url(#wG)"/>`
      + `<ellipse cx="200" cy="215" rx="112" ry="140" fill="#F7EBD0" stroke="#B88A2E" stroke-width="10"/><ellipse cx="200" cy="215" rx="112" ry="140" fill="none" stroke="${INK}" stroke-width="2"/><ellipse cx="200" cy="215" rx="98" ry="126" fill="url(#wP)" stroke="${INK}" stroke-width="1.5"/>`
      + `<path d="M 116 330 C 124 280 160 262 200 262 C 240 262 276 280 284 330 Z" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/><circle cx="200" cy="222" r="42" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/>`
      + `<path d="M 134 196 Q 200 176 266 196 Q 200 206 134 196 Z" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/><path d="M 160 192 C 172 150 190 116 236 90 C 222 120 226 156 240 190 Z" fill="#3A2A5A" stroke="${INK}" stroke-width="2"/>`
      + `<text x="200" y="244" text-anchor="middle" font-family="Uncial Antiqua, serif" font-size="62" fill="#F2C14E" stroke="${INK}" stroke-width="1.5">?</text>`
      + [[200, 68], [92, 215], [308, 215], [200, 362]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#E2A93B" stroke="${INK}" stroke-width="1.5"/>`).join('') + dots;
  } else if (kind === 'hat'){
    d += `<ellipse cx="200" cy="250" rx="170" ry="130" fill="url(#wP)"/><ellipse cx="290" cy="120" rx="90" ry="70" fill="url(#wG)"/>`
      + `<ellipse cx="190" cy="318" rx="150" ry="34" fill="#5B3FA8" stroke="${INK}" stroke-width="2.5"/><path d="M 72 316 Q 190 346 308 316" fill="none" stroke="#8B6FD8" stroke-width="5" opacity=".6"/>`
      + `<path d="M 112 314 C 130 240 150 170 176 118 C 194 82 226 64 262 70 C 238 84 224 108 224 140 C 226 200 248 262 270 312 Q 190 330 112 314 Z" fill="#6B4FC0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`
      + `<path d="M 122 286 Q 196 304 266 286 L 272 306 Q 194 324 116 306 Z" fill="#C2465E" stroke="${INK}" stroke-width="2"/><rect x="176" y="284" width="34" height="28" rx="4" fill="#F2C14E" stroke="${INK}" stroke-width="2"/><rect x="185" y="292" width="16" height="12" fill="#C2465E" stroke="${INK}" stroke-width="1.5"/>`
      + star(170, 200, 12, '#F2D27A') + star(206, 150, 9, '#F2D27A') + star(150, 250, 8, '#F2D27A')
      + `<path d="M 300 330 L 360 206" stroke="#6A4128" stroke-width="10" stroke-linecap="round"/><path d="M 300 330 L 360 206" stroke="${INK}" stroke-width="2" fill="none"/>` + star(364, 196, 20, '#F2C14E')
      + `<path d="M 340 170 q -20 -30 -60 -36 M 384 178 q 10 -36 -4 -70 M 352 160 q -6 -24 -2 -44" stroke="#E2A93B" stroke-width="3" fill="none" stroke-dasharray="4 8" stroke-linecap="round"/>` + dots;
  } else if (kind === 'slot'){
    d += `<ellipse cx="200" cy="170" rx="190" ry="150" fill="url(#wB)"/><circle cx="300" cy="96" r="40" fill="#F7E7B0" stroke="${INK}" stroke-width="2"/><circle cx="318" cy="84" r="36" fill="#E9D9F2"/>`
      + `<path d="M 0 360 C 80 290 160 284 230 300 C 300 316 360 300 400 280 V 440 H 0 Z" fill="#5E8F5A" stroke="${INK}" stroke-width="2.5"/><path d="M 0 400 C 120 360 260 370 400 340 V 440 H 0 Z" fill="#46703F" opacity=".7"/>`
      + `<rect x="120" y="190" width="160" height="112" fill="#8A7FB0" stroke="${INK}" stroke-width="2.5"/>`
      + [[96, 150, 40, 156], [264, 140, 44, 166], [176, 120, 48, 76]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9A8FC0" stroke="${INK}" stroke-width="2.5"/><path d="M ${x - 8} ${y} L ${x + w / 2} ${y - w * 1.3} L ${x + w + 8} ${y} Z" fill="#5B3FA8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
      + `<path d="M 180 302 V 262 a 20 20 0 0 1 40 0 V 302 Z" fill="#5A3A24" stroke="${INK}" stroke-width="2"/>`
      + [[106, 180], [106, 230], [274, 176], [274, 226], [190, 150], [140, 230], [250, 230]].map(([x, y]) => `<rect x="${x}" y="${y}" width="18" height="24" rx="9" fill="#FFD86B" stroke="${INK}" stroke-width="1.5"/>`).join('')
      + `<path d="M 200 44 V 20 L 226 28 L 200 36" fill="#C2465E" stroke="${INK}" stroke-width="1.5"/>` + dots;
  } else if (kind === 'kost'){
    d += `<circle cx="210" cy="160" r="120" fill="url(#wG)"/><circle cx="210" cy="160" r="86" fill="#F7E7B0" stroke="${INK}" stroke-width="2"/>`
      + `<g transform="rotate(-12 200 170)">`
      + `<path d="M 186 96 C 160 92 140 100 118 96 C 136 108 146 112 160 114 C 146 120 136 126 124 126 C 150 130 170 120 186 110 Z" fill="#E2A93B" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`
      + `<path d="M 70 176 L 300 176" stroke="#8A5A35" stroke-width="9" stroke-linecap="round"/><path d="M 70 176 L 300 176" stroke="${INK}" stroke-width="1.5"/>`
      + `<path d="M 74 166 C 50 160 30 152 8 160 C 24 172 24 180 8 192 C 30 200 50 192 74 186 Z" fill="#E2A93B" stroke="${INK}" stroke-width="2"/><path d="M 74 170 L 20 166 M 74 176 L 14 176 M 74 182 L 20 188" stroke="${INK}" stroke-width="1.2"/>`
      + `<path d="M 212 192 L 236 226" stroke="#3A2A5A" stroke-width="12" stroke-linecap="round"/><path d="M 228 222 L 252 224 Q 256 232 246 234 L 226 232 Z" fill="#6A4128" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
      + `<path d="M 188 110 C 170 128 160 160 154 196 Q 186 206 222 198 C 222 168 216 132 204 110 Z" fill="#6B4FC0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M 202 122 C 220 138 236 156 248 170" stroke="#6B4FC0" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="250" cy="174" r="8" fill="#F2D2B8" stroke="${INK}" stroke-width="1.8"/>`
      + `<circle cx="200" cy="92" r="20" fill="#F2D2B8" stroke="${INK}" stroke-width="2"/><circle cx="210" cy="90" r="2.6" fill="${INK}"/><path d="M 206 101 Q 212 105 217 100" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="204" cy="98" r="4" fill="#FF9AA8" opacity=".6"/>`
      + `<path d="M 178 78 C 168 60 156 40 132 30 C 160 34 184 50 206 74 Z" fill="#5B3FA8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="196" cy="77" rx="32" ry="7" transform="rotate(-8 196 77)" fill="#5B3FA8" stroke="${INK}" stroke-width="2"/><path d="M 180 74 Q 194 70 208 70" stroke="#C2465E" stroke-width="4" fill="none"/>`
      + `</g>`
      + `<ellipse cx="300" cy="352" rx="64" ry="18" fill="#3A2A2A" stroke="${INK}" stroke-width="2"/><path d="M 240 316 Q 236 382 300 384 Q 364 382 360 316 Z" fill="#3A2A2A" stroke="${INK}" stroke-width="2.5"/><ellipse cx="300" cy="316" rx="62" ry="16" fill="#62E0A0" stroke="${INK}" stroke-width="2"/>`
      + [[280, 290, 10], [312, 270, 7], [296, 246, 5], [330, 296, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#B8F5D0" stroke="${INK}" stroke-width="1.5"/>`).join('')
      + `<path d="M 250 392 Q 270 410 300 404 Q 330 410 350 392" stroke="#E2672E" stroke-width="6" fill="none" stroke-linecap="round"/>` + dots;
  } else if (kind === 'doer'){
    d += `<ellipse cx="200" cy="230" rx="180" ry="170" fill="url(#wT)"/><ellipse cx="200" cy="250" rx="120" ry="130" fill="url(#wG)"/>`
      + `<path d="M 110 360 V 170 a 90 90 0 0 1 180 0 V 360 Z" fill="#FFF0B8" stroke="${INK}" stroke-width="3"/>`
      + `<path d="M 110 360 V 170 a 90 90 0 0 1 64 -86 L 150 110 Q 140 140 140 180 V 380 Z" fill="#7A4A2A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="152" cy="250" r="6" fill="#F2C14E" stroke="${INK}" stroke-width="1.5"/>`
      + `<path d="M 160 360 L 240 360 L 330 440 L 70 440 Z" fill="#F7E2A0" opacity=".8"/><path d="M 110 360 H 290" stroke="${INK}" stroke-width="2.5"/>`
      + [[200, 220], [232, 180], [176, 160], [244, 270], [210, 300]].map(([x, y], i) => star(x, y, 8 + (i % 2) * 4, '#FFFFFF')).join('') + dots;
  }
  return `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${d}</svg>`;
}
function introCover(){
  const G = '#E8C66A', INK = '#2A1440';
  const corner = `<path d="M 0 0 H 70 Q 40 10 30 30 Q 10 40 0 70 Z" fill="${G}" stroke="${INK}" stroke-width="1.5"/><circle cx="26" cy="26" r="8" fill="#C2465E" stroke="${INK}" stroke-width="1.5"/>`;
  return `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="22" y="22" width="356" height="396" rx="10" fill="none" stroke="${G}" stroke-width="5"/><rect x="34" y="34" width="332" height="372" rx="6" fill="none" stroke="${G}" stroke-width="1.5" stroke-dasharray="2 6"/>
  <g transform="translate(22 22)">${corner}</g><g transform="translate(378 22) scale(-1 1)">${corner}</g><g transform="translate(22 418) scale(1 -1)">${corner}</g><g transform="translate(378 418) scale(-1 -1)">${corner}</g>
  <path d="M 200 70 L 214 106 L 252 108 L 222 132 L 232 170 L 200 148 L 168 170 L 178 132 L 148 108 L 186 106 Z" fill="${G}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <defs><linearGradient id="icT" x1="0" y1="0" x2="0" y2="1"><stop offset=".1" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFE27A"/><stop offset="1" stop-color="#F2A93B"/></linearGradient></defs>
  <g font-family="Fredoka, 'Baloo 2', sans-serif" font-weight="700" text-anchor="middle" letter-spacing="1">
  <text x="200" y="256" font-size="70" fill="#1A0A30" stroke="#1A0A30" stroke-width="14" stroke-linejoin="round" transform="translate(0 5)">Magiske</text><text x="200" y="256" font-size="70" fill="url(#icT)" stroke="#2A1440" stroke-width="10" stroke-linejoin="round" paint-order="stroke">Magiske</text>
  <text x="200" y="334" font-size="78" fill="#1A0A30" stroke="#1A0A30" stroke-width="14" stroke-linejoin="round" transform="translate(0 5)">Mig</text><text x="200" y="334" font-size="78" fill="url(#icT)" stroke="#2A1440" stroke-width="10" stroke-linejoin="round" paint-order="stroke">Mig</text></g>
  <path d="M 110 362 Q 200 392 290 362" stroke="${G}" stroke-width="3" fill="none"/><circle cx="200" cy="378" r="6" fill="${G}"/></svg>`;
}

  /* ---------- bogen ---------- */
  function side(i,s,navn){if(s==='l')return h('div',{class:'pg-art',html:introArt(INTRO_PAGES[i].art)});const box=h('div',{class:'pg-text'});
    for(const[cls,txt]of INTRO_PAGES[i].lines){if(cls==='name'){const inp=h('input',{class:'pg-name',maxlength:'14',autocomplete:'off',spellcheck:'false',placeholder:'skriv dit navn','aria-label':'Dit navn',inputmode:'none'});inp.value=navn||'';box.append(h('p',{class:'pg-line'},[txt+' ',inp]))}else box.append(h('p',{class:'pg-line '+cls},txt))}
    box.append(h('div',{class:'pg-num'},String(i+1)));return box}
  function intro(){let i=0,navn=SPIL.navn||'',busy=false;const L=h('div',{class:'pg l'}),R=h('div',{class:'pg r'});
    const pil=d=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    /* man blader kun med pilene, så man når at læse det hele (Kasper 16. nov.) */
    const frem=h('button',{class:'pg-next',type:'button','aria-label':'Næste side',html:pil('M9 5l7 7-7 7')}),tilb=h('button',{class:'pg-prev',type:'button','aria-label':'Forrige side',html:pil('M15 5l-7 7 7 7')});
    const bog=h('div',{class:'ibook'},[h('div',{class:'ib-leather'}),L,R,h('div',{class:'ib-spine'}),tilb,frem]);
    const efter=h('div',{class:'ib-after'},[h('p',{},INTRO_END.text),h('div',{class:'ib-btns'},[h('button',{class:'fs-knap hot ib-go',type:'button',on:{click:()=>slut()}},INTRO_END.btn),h('button',{class:'fs-knap ib-again',type:'button',on:{click:()=>igen()}},'Læs igen')])]);
    vis(h('div',{class:'fs-intro','data-navn':'intro'},[h('div',{class:'ib-table'}),h('div',{class:'ib-candle'}),bog,efter]));
    const ok=()=>navn.trim().length>0,pile=()=>{tilb.classList.toggle('gone',i===0);frem.disabled=!!R.querySelector('.pg-name')&&!ok()},fade=on=>bog.classList.toggle('turning',on);
    const navnFelt=()=>{pile();const inp=R.querySelector('.pg-name');if(!inp)return;inp.addEventListener('input',()=>{navn=inp.value.replace(/\s+/g,' ').replace(/^\s/,'');pile()});kbKobl(inp);if(!ok())setTimeout(()=>{if(inp.isConnected&&!busy)kbAaben(inp)},stille?0:700)};
    const fyld=()=>{L.replaceChildren(side(i,'l'));R.replaceChildren(side(i,'r',navn));navnFelt()};
    const pyt=()=>{navn=navn.trim();navn=navn.charAt(0).toLocaleUpperCase('da')+navn.slice(1)};fyld();
    async function vend(){if(busy||!ok())return;busy=true;kbLuk();lyd('pust');pyt();if(i===INTRO_PAGES.length-1){fade(true);await lukBog();busy=false;return}
      const blad=h('div',{class:'ib-leaf'},[h('div',{class:'lf front'},[side(i,'r',navn)]),h('div',{class:'lf back'},[side(i+1,'l')])]);fade(true);i++;R.replaceChildren(side(i,'r',navn));bog.append(blad);
      if(!stille){void blad.offsetWidth;blad.classList.add('turn');await vent(900)}L.replaceChildren(side(i,'l'));blad.remove();navnFelt();fade(false);busy=false}
    async function tilbage(){if(busy||i===0)return;busy=true;kbLuk();lyd('pust');pyt();
      const blad=h('div',{class:'ib-leaf left'},[h('div',{class:'lf front'},[side(i,'l')]),h('div',{class:'lf back page'},[side(i-1,'r',navn)])]);fade(true);i--;L.replaceChildren(side(i,'l'));bog.append(blad);
      if(!stille){void blad.offsetWidth;blad.classList.add('turn');await vent(900)}R.replaceChildren(side(i,'r',navn));blad.remove();navnFelt();fade(false);busy=false}
    async function lukBog(){const blad=h('div',{class:'ib-leaf left closer'},[h('div',{class:'lf front'},[side(i,'l')]),h('div',{class:'lf back cover',html:introCover()})]);L.style.visibility='hidden';bog.append(blad);
      if(!stille){void blad.offsetWidth;blad.classList.add('turn');await vent(1000)}bog.classList.add('closed');lyd('guld');SPIL.navn=navn;SPIL.data.intro=true;SPIL.save();await vent(stille?0:1300);efter.classList.add('on')}
    async function igen(){if(busy)return;busy=true;lyd('pust');efter.classList.remove('on');bog.classList.remove('closed');const c=bog.querySelector('.ib-leaf.closer');if(c)c.remove();L.style.visibility='';i=0;fyld();await vent(stille?0:900);fade(false);busy=false}
    function slut(){lyd('valg');pyt();SPIL.navn=navn;SPIL.data.intro=true;SPIL.save();if(typeof LOG!=='undefined')LOG.row('intro',{navn:navn.length});luk();enter('garderobe')}
    frem.addEventListener('click',vend);tilb.addEventListener('click',tilbage)}
  /* ---------- spillets eget tastatur: runde skrivemaskine-taster i messing på en træplade (Kasper 16. nov.) ---------- */
  const KB_ROWS=[['q','w','e','r','t','y','u','i','o','p','å'],['a','s','d','f','g','h','j','k','l','æ','ø'],['shift','z','x','c','v','b','n','m','-','del'],['space','enter']],KB={el:null,inp:null,shift:true};
  function kbByg(){const lab={shift:'⇧',del:'⌫',space:'mellemrum',enter:'Enter ↵'};
    KB.el=h('div',{class:'kb',role:'group','aria-label':'Tastatur',hidden:true},KB_ROWS.map(r=>h('div',{class:'kb-row'},r.map(k=>h('button',{class:'kb-k k-'+(lab[k]?k:'ch'),type:'button','data-k':k,'aria-label':k==='space'?'Mellemrum':k==='del'?'Slet':k==='shift'?'Store bogstaver':k},[h('span',{},lab[k]||k)])))));
    document.body.append(KB.el);
    KB.el.addEventListener('pointerdown',e=>{const b=e.target.closest('.kb-k');e.preventDefault();if(!b)return;b.classList.add('down');setTimeout(()=>b.classList.remove('down'),120);kbTast(b.dataset.k)});
    document.addEventListener('pointerdown',e=>{if(KB.el.hidden||e.target.closest('.kb')||e.target===KB.inp)return;kbLuk()},true)}
  function kbTegn(){if(!KB.el)return;KB.el.classList.toggle('up',KB.shift);KB.el.querySelectorAll('.k-ch span').forEach(sp=>{const k=sp.parentNode.dataset.k;sp.textContent=KB.shift?k.toLocaleUpperCase('da'):k})}
  function kbTast(k){const inp=KB.inp;if(!inp)return;lyd('valg');if(k==='enter'){kbLuk();return}if(k==='shift'){KB.shift=!KB.shift;kbTegn();return}
    let v=inp.value;const max=+inp.getAttribute('maxlength')||20;if(k==='del')v=v.slice(0,-1);else if(v.length<max){const ch=k==='space'?' ':KB.shift?k.toLocaleUpperCase('da'):k;if(!(ch===' '&&(!v||v.endsWith(' '))))v+=ch}
    inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}));KB.shift=!v||v.endsWith(' ')||v.endsWith('-');kbTegn()}
  function kbAaben(inp){if(!KB.el)kbByg();KB.inp=inp;KB.shift=!inp.value||/[\s-]$/.test(inp.value);kbTegn();KB.el.hidden=false;requestAnimationFrame(()=>KB.el.classList.add('on'));try{inp.focus({preventScroll:true})}catch(_){}
    /* ligger feltet bag tastaturet, skubbes bogen op, så man kan se, hvad man skriver */
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const kt=innerHeight-KB.el.offsetHeight,ib=inp.getBoundingClientRect().bottom+12;if(ib>kt&&rod){rod.style.transition='transform .3s ease';rod.style.transform=`translateY(${-(ib-kt)}px)`}}))}
  function kbLuk(){if(!KB.el||KB.el.hidden)return;KB.el.classList.remove('on');setTimeout(()=>{if(!KB.el.classList.contains('on'))KB.el.hidden=true},250);if(KB.inp)KB.inp.blur();if(rod)rod.style.transform='';KB.inp=null}
  function kbKobl(inp){if(inp._kb)return;inp._kb=true;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();kbLuk()}});inp.addEventListener('pointerdown',()=>setTimeout(()=>kbAaben(inp),0));inp.addEventListener('focus',()=>{if(!KB.el||KB.el.hidden)kbAaben(inp)})}
  /* ---------- knappen til forsiden, i byen ---------- */
  function menuKnap(){const bar=document.getElementById('bar'),hjem=document.getElementById('hjem');if(!bar||document.getElementById('menuknap'))return;
    const k=h('button',{id:'menuknap',class:'kraft',type:'button','aria-label':'Til forsiden',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16M4 12h16M4 17.5h16" fill="none" stroke-width="2.6" stroke-linecap="round"/></svg>',on:{click:()=>{lyd('valg');spoergUde()}}});bar.insertBefore(k,bar.firstChild);
    const tjek=()=>{k.hidden=!hjem.hidden||!!(rod&&!rod.hidden)||!!SPIL.room;requestAnimationFrame(tjek)};tjek()}
  function spoergUde(){if(!rod){rod=h('div',{id:'forside'});document.body.append(rod)}rod.hidden=false;rod.replaceChildren();spoerg('Til forsiden?','Dit spil er gemt.','Ja, til forsiden',forside);rod.querySelector('.fs-knap').addEventListener('click',()=>luk())}
  /* ---------- start ---------- */
  function start(){menuKnap();if(window.SPRING_FORSIDE)return;let d=null;try{d=sessionStorage.getItem('magiske-mig-pap.direkte');sessionStorage.removeItem('magiske-mig-pap.direkte')}catch(_){}
    if(d==='by')return;if(d==='intro'){intro();return}if(d==='pladser'){pladser();return}forside()}
  return{start,forside,pladser,intro,luk}})();
FORSIDE.start();
