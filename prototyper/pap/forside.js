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
  let slettet=false;
  function forside(){const play=h('button',{class:'fs-play',type:'button','aria-label':'Spil',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',on:{click:()=>{lyd('valg');pladser()}}});
    /* fuld skærm-knappen skal også kunne bruges her (Kasper 23. nov.): den samme knap som i spillet, flyttet op over forsiden */
    const fs=h('button',{class:'fs-fuld kraft',type:'button','aria-label':'Fuld skærm',html:document.getElementById('fs')?document.getElementById('fs').innerHTML:'⛶',on:{click:()=>{const b=document.getElementById('fs');if(b)b.click()}}});
    const s=h('div',{class:'fs-titel','data-navn':'forside'},[fs,h('div',{class:'fs-skilt'},[h('div',{class:'fs-navn'},'Magiske Mig')]),play,h('div',{class:'fs-udg'},'Udgave '+PAPVER)]);vis(s)}
  /* ---------- hylden med tre bøger ---------- */
  const FARVE=[['#5B2E91','#3A1A63'],['#1F6E6A','#10433F'],['#8E2A3F','#5A1426']];
  const HATSVG=c=>`<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="76" rx="40" ry="10" fill="${c}" stroke="#2a1440" stroke-width="3"/><path d="M22 74 C30 52 36 34 44 22 C50 12 62 8 72 12 C64 16 60 24 60 34 C60 50 66 64 76 74 Q50 82 22 74Z" fill="${c}" stroke="#2a1440" stroke-width="3" stroke-linejoin="round"/><path d="M26 68 Q50 76 72 68 L74 74 Q50 82 24 74Z" fill="#e8c66a" stroke="#2a1440" stroke-width="2"/><path d="M42 40l3 6 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1z" fill="#ffe27a"/></svg>`;
  function pladser(){const boeger=[1,2,3].map(n=>{const s=info(n),[c1,c2]=FARVE[n-1];
      const front=s.brugt?[h('div',{class:'sb-port',html:HATSVG(s.hat)}),h('div',{class:'sb-name'},s.navn||'Uden navn'),h('div',{class:'sb-stars',html:STJ+'<span>'+s.stj+'</span>'})]
        :[h('div',{class:'sb-port sb-new',html:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 22v56M22 50h56" stroke="#F2D27A" stroke-width="9" stroke-linecap="round"/></svg>'}),h('div',{class:'sb-name'},'Nyt spil')];
      const bog=h('button',{class:'sbook'+(s.brugt?'':' empty'),type:'button',style:`--c1:${c1};--c2:${c2}`,'aria-label':s.brugt?`Spil som ${s.navn||'uden navn'}`:'Start et nyt spil',on:{click:()=>vaelg(n,s.brugt)}},[h('div',{class:'sb-cover'},front)]);
      const slet=s.brugt?h('button',{class:'sb-del',type:'button','aria-label':'Slet dette spil',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',on:{click:e=>{e.stopPropagation();lyd('valg');spoerg(`Slet ${s.navn||'dette spil'}?`,'Hele spillet bliver slettet: heksen, stjernerne og alt det, hun har samlet. Det kan ikke fortrydes.','Ja, slet',()=>{try{localStorage.removeItem(PLADSNOEGLE(n))}catch(_){}/* siden genindlæses ikke længere ved sletning (Kasper 23. nov.); er det spillet i gang, sker det først, når man vælger en bog */if(n===PLADS){slettet=true;SPIL.slettet=true}pladser()})}}}):null;
      return h('div',{class:'sb-wrap'},[bog,slet])});
    vis(h('div',{class:'fs-pladser','data-navn':'pladser'},[h('div',{class:'sb-bg'}),h('button',{class:'fs-tilbage kraft',type:'button',on:{click:()=>{lyd('valg');forside()}},html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7 1.5-1.4L10.8 12 16 6.4z"/></svg><span>Forsiden</span>'}),h('h1',{class:'sb-title'},'Hvem skal spille?'),h('div',{class:'sb-shelf'},boeger)]))}
  function spoerg(titel,tekst,ja,fn){const b=h('div',{class:'fs-spoerg'},[h('div',{class:'kraft fs-spkort'},[h('h2',{},titel),h('p',{},tekst),h('div',{class:'fs-spkn'},[h('button',{type:'button',class:'fs-knap',on:{click:()=>b.remove()}},'Nej'),h('button',{type:'button',class:'fs-knap hot',on:{click:()=>{b.remove();fn()}}},ja)])])]);rod.append(b)}
  function vaelg(n,brugt){lyd('guld');if(n!==PLADS||slettet){/* skift bog uden at genindlæse; kun hvis det fejler, genindlæses siden som før */let ok=false;try{if(SPIL.skiftPlads){SPIL.skiftPlads(n);ok=true}}catch(e){console.error(e)}if(ok){slettet=false;if(brugt)luk();else intro();return}
    try{localStorage.setItem('magiske-mig-pap.plads',String(n));sessionStorage.setItem('magiske-mig-pap.direkte',brugt?'by':'intro')}catch(_){}vis(h('div',{class:'fs-titel'},[h('div',{class:'fs-skilt'},[h('div',{class:'fs-under'},'Henter bogen …')])]));setTimeout(()=>location.reload(),250);return}
    if(brugt)luk();else intro()}

  /* bogen i starten er nu et rum i pap (rum-bog.js) */
  function intro(){luk();enter('bog')}
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
  return{start,forside,pladser,intro,luk,kb:kbKobl,kbAaben,kbLuk}})();
FORSIDE.start();
