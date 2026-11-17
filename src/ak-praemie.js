/* ================= Præmiebutikken i arkaden =================
   En luge i væggen oppe til højre i hallen, med en gammel mekanisk ugle i messing bag disken.
   Her byttes billetterne fra spillene til ting, man ikke kan få andre steder (de kommer aldrig i boblerne).
   Præmierne står i PRAEMIER i progress.js; ting, der ikke er godkendt på Tegnebordet endnu, vises ikke. */
Arkade.praemie = (() => {
  const E = Arkade.E, WD = '#2A160C';

  /* uglen: messing med tandhjul på maven, store glasøjne og en monokel. (0,0) er midt på maven */
  function ugle(blink){
    const B = 'url(#akBrass)', D = '#8A6420';
    let o = `<path d="M -46 40 C -54 -10 -40 -44 0 -46 C 40 -44 54 -10 46 40 Z" fill="${B}" stroke="${WD}" stroke-width="3.5"/>`;
    o += [-1, 1].map(s => `<path d="M ${s*44} -14 C ${s*58} 6 ${s*54} 30 ${s*40} 42 C ${s*34} 20 ${s*34} 0 ${s*44} -14 Z" fill="#B88A38" stroke="${WD}" stroke-width="3"/><path d="M ${s*46} 0 q ${s*4} 12 ${s*-2} 26 M ${s*42} 6 q ${s*3} 10 ${s*-2} 20" stroke="${D}" stroke-width="2" fill="none"/>`).join('');
    /* tandhjul på maven, der drejer langsomt */
    let g = ''; for (let i = 0; i < 10; i++){ const a = i * 36; g += `<rect x="-3.5" y="-21" width="7" height="8" rx="1.5" fill="#B88A38" stroke="${WD}" stroke-width="1.5" transform="rotate(${a})"/>`; }
    o += `<g transform="translate(0 14)"><g class="ak-gear">${g}<circle r="15" fill="#B88A38" stroke="${WD}" stroke-width="2"/><circle r="5" fill="${B}" stroke="${WD}" stroke-width="1.5"/>${[0, 120, 240].map(a => `<rect x="-1.5" y="-13" width="3" height="7" fill="${D}" transform="rotate(${a})"/>`).join('')}</g></g>`;
    o += [-1, 1].map(s => `<path d="M ${s*10} 40 v 8 m ${s*-6} 0 h ${s*12}" stroke="${D}" stroke-width="4" stroke-linecap="round" fill="none"/>`).join('');
    /* hovedet med øretoppe */
    o += `<g transform="translate(0 -52)">`;
    o += [-1, 1].map(s => `<path d="M ${s*30} -20 L ${s*44} -48 L ${s*16} -30 Z" fill="${B}" stroke="${WD}" stroke-width="3" stroke-linejoin="round"/>`).join('');
    o += `<ellipse cx="0" cy="0" rx="46" ry="36" fill="${B}" stroke="${WD}" stroke-width="3.5"/><path d="M -38 -8 Q 0 -26 38 -8" stroke="${D}" stroke-width="2" fill="none" opacity=".7"/>`;
    for (const s of [-1, 1]){
      const x = s * 19;
      o += `<circle cx="${x}" cy="2" r="17" fill="#3A2408" stroke="${WD}" stroke-width="3"/><circle cx="${x}" cy="2" r="12" fill="#FFB347"/><circle cx="${x}" cy="2" r="12" fill="url(#akOwlEye)"/>`;
      o += blink ? `<rect x="${x - 14}" y="-11" width="28" height="0" fill="#B88A38"><animate attributeName="height" values="0;0;26;0;0" keyTimes="0;.9;.94;.98;1" dur="5.2s" repeatCount="indefinite"/></rect>` : '';
      o += `<circle cx="${x + 1}" cy="3" r="5" fill="#2A1408"/><circle cx="${x - 3}" cy="-2" r="2.6" fill="#FFF"/>`;
    }
    /* monoklen på højre øje, med kæde */
    o += `<circle cx="19" cy="2" r="19" fill="none" stroke="#F7E2A0" stroke-width="3"/><circle cx="19" cy="2" r="19" fill="none" stroke="${WD}" stroke-width="1"/><path d="M 34 14 q 10 22 -4 40" stroke="#F7E2A0" stroke-width="1.8" fill="none" stroke-dasharray="3 2"/>`;
    o += `<path d="M -6 16 L 0 28 L 6 16 Z" fill="#FFB347" stroke="${WD}" stroke-width="2" stroke-linejoin="round"/>`;
    o += `</g>`;
    /* en lyserød butterfly */
    o += `<path d="M 0 -14 L -16 -24 V -4 Z M 0 -14 L 16 -24 V -4 Z" fill="#FF6FA8" stroke="${WD}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="0" cy="-14" r="4.5" fill="#FF9FC8" stroke="${WD}" stroke-width="2"/>`;
    return o;
  }
  const defs = `<radialGradient id="akOwlEye" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF6C0" stop-opacity=".9"/><stop offset=".5" stop-color="#FFB347" stop-opacity="0"/><stop offset="1" stop-color="#8A3A08" stop-opacity=".5"/></radialGradient>`;

  /* ---------- lugen i hallen (i hallens mål: 1110-1318 i bredden, 70-336 i højden) ---------- */
  function luge(){
    const x0 = 1110, x1 = 1318, cx = 1214, top = 100, bund = 334, r = (x1 - x0) / 2;
    /* gjort lidt mindre omkring toppen, så den ikke rører gribemaskinen */
    let o = `<defs>${defs}</defs><g transform="translate(${cx} 62) scale(.88) translate(${-cx} -62)"><g class="ak-cab ak-shop" data-shop="1" tabindex="0" role="button" aria-label="Præmiebutikken"><g class="anim">`;
    o += `<ellipse cx="${cx}" cy="230" rx="170" ry="150" fill="url(#akGlow)" opacity=".7"/>`;
    /* rammen: en buet træluge med messingkant */
    const arch = (a, b, t) => `M ${a} ${bund} V ${t + (b - a) / 2} A ${(b - a) / 2} ${(b - a) / 2} 0 0 1 ${b} ${t + (b - a) / 2} V ${bund} Z`;
    o += `<path d="${arch(x0 - 8, x1 + 8, top - 8)}" fill="url(#akWoodV)" stroke="${WD}" stroke-width="5"/>`;
    o += `<path d="${arch(x0 + 10, x1 - 10, top + 10)}" fill="#2A1408" stroke="url(#akBrass)" stroke-width="6"/>`;
    /* hylder bagved med præmier */
    o += `<clipPath id="akShopIn"><path d="${arch(x0 + 13, x1 - 13, top + 13)}"/></clipPath><g clip-path="url(#akShopIn)">`;
    o += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bund - top}" fill="#3A1E0C"/><rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bund - top}" fill="url(#akGlow)" opacity=".6"/>`;
    for (const y of [168, 228]) o += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="8" fill="#7A4224" stroke="${WD}" stroke-width="1.5"/>`;
    /* øverste hylde: et lille maleri, en slikkepind og en stjerne */
    o += `<rect x="${x0 + 26}" y="${top + 34}" width="40" height="34" rx="2" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/><rect x="${x0 + 31}" y="${top + 39}" width="30" height="24" fill="#4A8AC8"/><path d="M ${x0 + 31} ${top + 58} l 9 -9 l 7 6 l 6 -5 l 8 8 v 3 h -30 Z" fill="#3E9A6A"/><circle cx="${x0 + 54}" cy="${top + 45}" r="3.5" fill="#FFE27A"/>`;
    o += `<path d="M ${cx + 2} 166 V 128" stroke="#FFF" stroke-width="4"/><circle cx="${cx + 2}" cy="${top + 20}" r="14" fill="#FFF" stroke="${WD}" stroke-width="2"/><path d="M ${cx + 2} ${top + 20} m -3 0 a 3 3 0 1 1 6 0 a 6 6 0 1 1 -12 0 a 9 9 0 1 1 18 0" stroke="#FF4F7B" stroke-width="3" fill="none"/>`;
    o += `<path d="M ${x1 - 46} 166 L ${x1 - 46} 136" stroke="#9C6B43" stroke-width="4"/><path d="M ${x1 - 46} 116 l 4.5 9 l 10 1 l -7.5 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7.5 -7 l 10 -1 Z" fill="#FFD23E" stroke="${WD}" stroke-width="1.8" stroke-linejoin="round"/>`;
    /* midterste hylde: en krystal og en lille gave */
    o += `<path d="M ${x0 + 34} 226 V 202 L ${x0 + 42} 190 L ${x0 + 50} 202 V 226 Z" fill="#B79BFF" stroke="${WD}" stroke-width="2"/><rect x="${x1 - 60}" y="206" width="30" height="22" rx="2" fill="#43D3BE" stroke="${WD}" stroke-width="2"/><rect x="${x1 - 48}" y="206" width="6" height="22" fill="#FFE27A"/>`;
    o += `</g>`;
    /* uglen bag disken */
    o += `<g transform="translate(${cx} 276) scale(.86)">${ugle(true)}</g>`;
    /* disken med en billetrulle og en ringeklokke */
    o += `<rect x="${x0 - 16}" y="${bund - 22}" width="${x1 - x0 + 32}" height="26" rx="4" fill="url(#akWoodH)" stroke="${WD}" stroke-width="4"/><path d="M ${x0 - 12} ${bund - 18} H ${x1 + 12}" stroke="#C9962E" stroke-width="3"/>`;
    o += `<path d="M ${x0 + 14} ${bund - 22} c 0 10 -2 18 -6 28 l 18 3 c 4 -10 6 -18 6 -31 Z" fill="#FF8FC7" stroke="#B0306A" stroke-width="2"/><path d="M ${x0 + 10} ${bund - 6} l 14 2 M ${x0 + 8} ${bund + 2} l 14 2" stroke="#B0306A" stroke-width="1.4" stroke-dasharray="2 2"/>`;
    o += `<ellipse cx="${x0 + 22}" cy="${bund - 30}" rx="16" ry="9" fill="#FF8FC7" stroke="#B0306A" stroke-width="2.2"/><ellipse cx="${x0 + 22}" cy="${bund - 30}" rx="5" ry="3" fill="#B0306A"/>`;
    o += `<path d="M ${x1 - 36} ${bund - 22} q 0 -24 14 -24 q 14 0 14 24 Z" fill="url(#akBrass)" stroke="${WD}" stroke-width="2.5"/><circle cx="${x1 - 22}" cy="${bund - 49}" r="4" fill="url(#akBrass)" stroke="${WD}" stroke-width="2"/><rect x="${x1 - 40}" y="${bund - 25}" width="36" height="5" rx="2" fill="#8A6420" stroke="${WD}" stroke-width="1.5"/>`;
    /* skilt og lyspærer rundt om buen */
    const pts = []; for (let i = 0; i <= 10; i++){ const a = Math.PI + i / 10 * Math.PI; pts.push([cx + Math.cos(a) * (r + 2), top + r - 8 + Math.sin(a) * (r + 2)]); }
    o += pts.map(([x, y], i) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="7" fill="#FFE9A8" opacity=".35"/><circle class="ak-bulb" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4.2" fill="#FFF3C0" stroke="#8A6420" stroke-width="1" style="animation-delay:${(i % 4) * .25}s"/>`).join('');
    o += `<rect x="${cx - 84}" y="${top - 30}" width="168" height="40" rx="6" fill="url(#akBrass)" stroke="${WD}" stroke-width="3"/><rect x="${cx - 79}" y="${top - 25}" width="158" height="30" rx="4" fill="none" stroke="#8A6420" stroke-width="1.5" opacity=".8"/>`;
    o += `<text x="${cx}" y="${top - 2}" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="22" letter-spacing="2" fill="#3A2008">PRÆMIER</text>`;
    o += `<rect x="${x0 - 20}" y="${top - 40}" width="${x1 - x0 + 40}" height="${bund - top + 70}" fill="#FFF" fill-opacity="0"/>`;
    return o + `</g></g></g>`;
  }

  /* ---------- butikken ---------- */
  const SIG = { hej: 'Hu-hu! Velkommen ved præmiedisken. Hvad vil du bytte dine billetter til?', tom: 'Hu-hu! Jeg pakker de første præmier ud lige nu. Saml billetter imens, så er du klar!',
    fattig: 'Hu-hu! Du får billetter, hver gang du spiller i arkaden. Jo bedre det går, jo flere.', alle: 'Hu-hu! Du har dem allesammen. Der kommer flere præmier en dag!' };
  const navn = p => p.cat === 'acc' ? ACC[p.id].label : p.cat === 'maleri' ? MALERIER[p.id].label : p.id;
  const hvorTekst = p => p.cat === 'maleri' ? 'Det hænger på din billedvæg i værelset.' : 'Du finder den i skaberen under Tilbehør.';
  const ejer = p => isFree(p.cat, p.id);
  function billede(p){
    /* uden hat og med kort hår, så staven ikke gemmer sig bag håret */
    if (p.cat === 'acc'){ const st = JSON.parse(JSON.stringify(heroState())); st.acc = { [p.id]: ACC[p.id].color }; st.hat = Object.assign({}, st.hat, { id:'ingen' }); st.back = 'kort'; return dollImg(st, { viewBox: ACC_VB[p.id] || VB.full, pet: false }); }
    /* mesterværket er pakket ind i brunt papir med snor og et mærke, indtil man har købt det */
    if (p.cat === 'maleri' && HEMMELIG.includes(p.id) && !ejer(p)) return el('span', { class:'mal', html: pakke() });
    if (p.cat === 'maleri') return el('span', { class:'mal', html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 228 228">${maleriRamme(p.id, -10, -10, 220, 220, 'm', 'sh' + p.id)}</svg>` });
    return el('span');
  }
  const HEMMELIG = ['far'];
  function pakke(){
    const P = '#C8A06A', PD = '#9A7440', S = '#B0306A';
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 228 228"><rect x="-4" y="2" width="208" height="206" rx="8" fill="#000" opacity=".18"/>`;
    o += `<rect x="-8" y="-6" width="208" height="206" rx="6" fill="${P}" stroke="${E}" stroke-width="3.5"/>`;
    /* papirets folder og lidt struktur */
    o += `<path d="M -8 30 L 30 -6 M 200 160 L 162 200 M -8 150 Q 40 140 60 200" stroke="${PD}" stroke-width="2" fill="none" opacity=".6"/>`;
    o += [[20, 40], [140, 30], [60, 150], [170, 120], [110, 80], [30, 100]].map(([x, y]) => `<path d="M ${x} ${y} q 6 -3 12 0" stroke="${PD}" stroke-width="1.6" fill="none" opacity=".5"/>`).join('');
    /* snoren på kryds og en stor sløjfe */
    o += `<path d="M 92 -6 V 200 M -8 94 H 200" stroke="${E}" stroke-width="10"/><path d="M 92 -6 V 200 M -8 94 H 200" stroke="${S}" stroke-width="6"/>`;
    o += `<path d="M 92 94 C 60 60 46 84 58 98 C 66 108 82 100 92 94 Z M 92 94 C 124 60 138 84 126 98 C 118 108 102 100 92 94 Z" fill="${S}" stroke="${E}" stroke-width="3" stroke-linejoin="round"/>`;
    o += `<path d="M 92 94 L 78 132 L 88 128 L 92 138 Z M 92 94 L 106 132 L 96 128 L 92 138 Z" fill="${S}" stroke="${E}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="92" cy="94" r="9" fill="#FF6FA8" stroke="${E}" stroke-width="3"/>`;
    /* et mærke med et spørgsmålstegn og et "rør ikke" stempel */
    o += `<path d="M 150 120 L 186 112 L 192 150 L 156 158 Z" fill="#FFF6E0" stroke="${E}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="158" cy="124" r="3" fill="${P}" stroke="${E}" stroke-width="1.5"/><path d="M 158 124 Q 128 110 112 102" stroke="${E}" stroke-width="1.5" fill="none"/>`;
    o += `<text x="174" y="147" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="30" fill="#B0306A" transform="rotate(-12 174 136)">?</text>`;
    o += `<g transform="rotate(-14 40 168)"><rect x="6" y="152" width="74" height="30" rx="4" fill="none" stroke="#C8302A" stroke-width="3" opacity=".75"/><text x="43" y="173" text-anchor="middle" font-family="${FONT_C}" font-weight="700" font-size="15" fill="#C8302A" opacity=".75">HEMMELIG</text></g>`;
    return o + `</svg>`;
  }
  let box = null;
  function open(){
    sfx.open(); SND.play('praemie.klokke', () => sfx.twinkle());
    const host = $('#arkadeBody'); if (box) box.remove();
    box = el('div', { class:'ak-shopwrap' }); host.append(box); tegn('hej');
  }
  function luk(){ sfx.undo(); if (box){ box.remove(); box = null; } }
  function tegn(sig){
    const liste = praemierNu(), har = prog.billetter || 0, ikkeEjet = liste.filter(p => !ejer(p));
    const tekst = !liste.length ? SIG.tom : !ikkeEjet.length ? SIG.alle : sig === 'hej' && har < Math.min(...ikkeEjet.map(p => p.pris)) ? SIG.fattig : SIG[sig] || sig;
    const owl = `<svg viewBox="-60 -110 120 160" aria-hidden="true"><defs><linearGradient id="akBrass2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E2A0"/><stop offset=".45" stop-color="#D9A848"/><stop offset="1" stop-color="#8A6420"/></linearGradient>${defs}</defs>${ugle(true).replace(/url\(#akBrass\)/g, 'url(#akBrass2)')}</svg>`;
    const grid = el('div', { class:'ak-prizes' });
    for (const p of liste){
      const own = ejer(p), kan = !own && har >= p.pris;
      grid.append(el('button', { class:'ak-prize' + (own ? ' own' : kan ? ' kan' : ' mangler'), type:'button', 'aria-label': `${navn(p)}, ${own ? 'din' : p.pris + ' billetter'}`,
        on:{ click: () => vaelg(p) } }, [ el('span', { class:'pic' }, [ billede(p) ]), el('span', { class:'nm' }, navn(p)),
        own ? el('span', { class:'pris din' }, 'Din!') : el('span', { class:'pris', html: TICKET_SVG + `<b>${p.pris}</b>` + (kan ? '' : `<small>mangler ${p.pris - har}</small>`) }) ]));
    }
    box.innerHTML = '';
    box.append(el('div', { class:'ak-shop-panel' }, [
      el('div', { class:'ak-shop-top' }, [ el('div', { class:'owl', html: owl }), el('p', { class:'say' }, tekst), billetPill(),
        el('button', { class:'btn', type:'button', on:{ click: luk } }, 'Luk') ]),
      liste.length ? grid : null ]));
  }
  function vaelg(p){
    if (ejer(p)){ sfx.pick(); tegn(`Hu-hu! ${navn(p)} er allerede din. ${hvorTekst(p)}`); return; }
    const har = prog.billetter || 0;
    if (har < p.pris){ sfx.nope(); tegn(`Hu-hu! ${navn(p)} koster ${p.pris} billetter. Du mangler ${p.pris - har}. Spil lidt mere, så gemmer jeg den til dig.`); return; }
    sfx.pick();
    const card = el('div', { class:'ak-end' }, [ el('div', { class:'ak-card' }, [ el('h2', {}, navn(p)), el('div', { class:'ak-art' }, [ billede(p) ]),
      el('p', { class:'ak-tix', html: TICKET_SVG + `<span>${p.pris} billetter</span>` }), el('p', {}, `Vil du bytte ${p.pris} billetter for den?`),
      el('div', { class:'row' }, [ el('button', { class:'btn primary', type:'button', on:{ click: () => { card.remove(); koeb(p); } } }, 'Ja, byt!'),
        el('button', { class:'btn', type:'button', on:{ click: () => { sfx.undo(); card.remove(); } } }, 'Ikke nu') ]) ]) ]);
    box.append(card); card.querySelector('.btn.primary').focus();
  }
  function koeb(p){
    if (ejer(p) || (prog.billetter || 0) < p.pris) return;
    addBilletter(-p.pris);
    const k = p.cat + ':' + p.id; if (!prog.unlocked.includes(k)) prog.unlocked.push(k); if (!prog.fresh.includes(k)) prog.fresh.push(k); saveProg();
    SND.play('praemie.koeb', () => sfx.fanfare());
    const hang = p.cat === 'maleri' ? haengOp(p.id) : true;
    const hvor = p.cat === 'maleri' ? (hang ? 'Det hænger nu på din billedvæg i værelset.' : 'Tryk på en billedvæg i værelset for at hænge det op.') : 'Den ligger nu i skaberen under Tilbehør.';
    tegn(`Hu-hu! ${navn(p)} er din! ${hvor}`);
    const card = el('div', { class:'ak-end' }, [ el('div', { class:'ak-card' }, [ el('h2', {}, HEMMELIG.includes(p.id) ? 'Pakket ud! Overraskelse!' : 'Den er din!'), el('div', { class:'ak-art' }, [ billede(p) ]),
      el('p', {}, p.cat === 'maleri' ? hvor : `${navn(p)} ligger nu i skaberen under Tilbehør.`),
      el('div', { class:'row' }, [ el('button', { class:'btn primary', type:'button', on:{ click: () => { sfx.pick(); card.remove(); } } }, 'Hurra!') ]) ]) ]);
    box.append(card); card.querySelector('.btn').focus();
  }
  return { luge, open, luk };
})();
