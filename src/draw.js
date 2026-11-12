'use strict';
/* ================= Magiske Mig — tegning af dukken (SVG i lag) ================= */
const W = 800, H = 1100;

/* ---------- farver ---------- */
function hex2rgb(h){ h=String(h).replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16)||0; return [n>>16&255,n>>8&255,n&255]; }
function rgb2hex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function rgb2hsl(r,g,b){ r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0,s=0; const l=(mx+mn)/2;
  if(mx!==mn){ const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h= mx===r?(g-b)/d+(g<b?6:0): mx===g?(b-r)/d+2:(r-g)/d+4; h/=6; } return [h,s,l]; }
function hsl2rgb(h,s,l){ if(s===0) return [l*255,l*255,l*255]; const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q;
  const f=t=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
  return [f(h+1/3)*255,f(h)*255,f(h-1/3)*255]; }
function adj(hex, dl, ds=0){ const [h,s,l]=rgb2hsl(...hex2rgb(hex)); return rgb2hex(...hsl2rgb(h, Math.max(0,Math.min(1,s+ds)), Math.max(0,Math.min(1,l+dl)))); }
const shade = c => adj(c,-0.12);
const outline = c => adj(c,-0.32,0.05);

/* ---------- animation (kun i spejlet) ---------- */
let ANIM = false;
const easeKeys = n => ({ kt: Array.from({length:n},(_,i)=>(i/(n-1)).toFixed(3)).join(';'), ks: Array(n-1).fill('0.45 0 0.55 1').join(';') });
function spin(s, cx, cy, vals, dur, begin=0){
  if (!ANIM) return s; const e = easeKeys(vals.length);
  return `<g><animateTransform attributeName="transform" type="rotate" values="${vals.map(v=>`${v} ${cx} ${cy}`).join(';')}" keyTimes="${e.kt}" calcMode="spline" keySplines="${e.ks}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${s}</g>`;
}
function squash(s, cx, cy, vals, dur, begin=0){
  if (!ANIM) return s; const e = easeKeys(vals.length);
  return `<g transform="translate(${cx},${cy})"><g><animateTransform attributeName="transform" type="scale" values="${vals.join(';')}" keyTimes="${e.kt}" calcMode="spline" keySplines="${e.ks}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><g transform="translate(${-cx},${-cy})">${s}</g></g></g>`;
}
function blinkLid(content, period, begin=0){
  if (!ANIM) return '';
  return `<g opacity="0"><animate attributeName="opacity" values="0;1;0" keyTimes="0;0.94;0.975" calcMode="discrete" dur="${period}s" begin="${begin}s" repeatCount="indefinite"/>${content}</g>`;
}

/* ---------- markering af en ny ting: pulserende kant, resten dæmpet ---------- */
const HLW = (on, s) => on && s ? '<!--HL-->' + s + '<!--/HL-->' : s;
function hlCompose(content, settle=4.6){
  if (!content.includes('<!--HL-->')) return content;
  const parts = content.split(/<!--HL-->|<!--\/HL-->/);
  const paint = (x, col) => x.replace(/(fill|stroke)="(?!none)[^"]*"/g, `$1="${col}"`).replace(/ id="([^"]+)"/g, ' id="m_$1"').replace(/url\(#([^)]+)\)/g, 'url(#m_$1)');
  const maskBody = parts.map((x, i) => paint(x, i % 2 ? '#FFFFFF' : '#000000')).join('');
  const clean = parts.join('');
  return `<defs><mask id="hlM" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1600" height="1900">${maskBody}</mask>`
    + `<filter id="hlGlow" x="-40%" y="-40%" width="180%" height="180%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"><animate attributeName="radius" values="3;10;3" dur="1.3s" repeatCount="indefinite"/></feMorphology>`
    + `<feFlood flood-color="#FF3D8F">${settle ? `<animate attributeName="flood-opacity" from="1" to="0" begin="${settle}s" dur="0.9s" fill="freeze"/>` : ''}</feFlood><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="2.5" result="ob"/><feMerge><feMergeNode in="ob"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    + `<filter id="hlDim"><feColorMatrix type="saturate" values="0.3">${settle ? `<animate attributeName="values" from="0.3" to="1" begin="${settle}s" dur="1s" fill="freeze"/>` : ''}</feColorMatrix></filter></defs>`
    + `<g opacity="0.4" filter="url(#hlDim)">${settle ? `<animate attributeName="opacity" from="0.4" to="1" begin="${settle}s" dur="1s" fill="freeze"/>` : ''}${clean}</g><g filter="url(#hlGlow)"><g mask="url(#hlM)">${clean}</g></g>`;
}

/* ---------- dukken i ro: kigger til siden og vinker en gang imellem ---------- */
let IDLE = null;
function makeIdle(canWave){
  const T = +(15 + Math.random()*7).toFixed(2), ev = [];
  const free = (a, b) => ev.every(e => b < e.a - 0.6 || a > e.b + 0.6);
  if (canWave){ for (let i=0;i<20;i++){ const a = 2 + Math.random()*(T-6); if (free(a, a+2.6)){ ev.push({ kind:'wave', a, b:a+2.6 }); break; } } }
  for (let n=0;n<2;n++) for (let i=0;i<30;i++){ const a = 1 + Math.random()*(T-3.5), b = a + 1.6 + Math.random()*0.8; if (free(a, b)){ ev.push({ kind:'look', a, b, d: Math.random()<0.5 ? -1 : 1 }); break; } }
  ev.sort((x,y) => x.a - y.a);
  return { T, ev };
}
function trackPoints(kind, valFn){
  const pts = [[0,0]];
  for (const e of IDLE.ev.filter(e => e.kind === kind)){ const v = valFn(e); pts.push([e.a,0],[e.a+0.25,v],[e.b-0.25,v],[e.b,0]); }
  pts.push([IDLE.T,0]);
  return pts;
}
function lookAnim(sign){
  if (!IDLE || !ANIM) return '';
  const pts = trackPoints('look', e => e.d * 10 * sign);
  return `<animateTransform attributeName="transform" type="translate" values="${pts.map(p=>p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p=>(p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>`;
}
function headTurn(s){
  if (!IDLE || !ANIM) return s;
  const pts = trackPoints('look', e => e.d * 6);
  return `<g><animateTransform attributeName="transform" type="translate" values="${pts.map(p=>p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p=>(p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>${s}</g>`;
}
/* vis en gruppe kun i bestemte tidsrum */
function showDuring(s, wins){
  if (!IDLE || !ANIM) return s;
  const T = IDLE.T, inWin = t => wins.some(([a,b]) => t >= a && t < b);
  const cuts = [0, ...wins.flat().filter(t => t > 0 && t < T)].sort((a,b)=>a-b);
  const vals = cuts.map(t => inWin(t + 0.001) ? 1 : 0);
  return `<g opacity="${vals[0]}"><animate attributeName="opacity" calcMode="discrete" values="${vals.join(';')}" keyTimes="${cuts.map(t=>(t/T).toFixed(4)).join(';')}" dur="${T}s" repeatCount="indefinite"/>${s}</g>`;
}

/* ---------- små figurer ---------- */
function star4(cx, cy, r, fill='#FFFFFF', op=1){
  return `<path d="M ${cx} ${cy-r} Q ${cx} ${cy} ${cx+r} ${cy} Q ${cx} ${cy} ${cx} ${cy+r} Q ${cx} ${cy} ${cx-r} ${cy} Q ${cx} ${cy} ${cx} ${cy-r} Z" fill="${fill}" opacity="${op}"/>`; }
function star5pts(cx, cy, R, r, rot=-90){ const p=[]; for(let i=0;i<10;i++){ const a=(rot+i*36)*Math.PI/180, rad=i%2?r:R; p.push(`${(cx+rad*Math.cos(a)).toFixed(1)},${(cy+rad*Math.sin(a)).toFixed(1)}`);} return p.join(' '); }
function heart(cx, cy, s, fill, stroke='none', sw=0, extra=''){
  return `<path transform="translate(${cx},${cy}) scale(${s})" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`; }
const mirror = s => `<g transform="translate(${W},0) scale(-1,1)">${s}</g>`;
const lines = (list, color, op=0.35, w=3) => list.map(d=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`).join('');


function strokeBoth(d, fill, line, w, cap='round'){
  return `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w+5}" stroke-linecap="${cap}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`; }
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const PET_X = 660, PET_Y = 1050, PET_S = 0.85;
const PET_KINDS = {
  ingen: { label:'Intet dyr' },
  kat: { label:'Kat' }, hund: { label:'Hund' }, kanin: { label:'Kanin' },
  enhjoerning: { label:'Enhjørning' }, bjoern: { label:'Bjørn' }, drage: { label:'Drage' },
};
const PET_PATTERNS = { ingen:'Ensfarvet', pletter:'Pletter', striber:'Striber', sokker:'Sokker', oejeplet:'Plet om øjet' };
const PET_ACC = {
  halsbaand: { label:'Halsbånd', color:'#FF5FA8' }, sloejfe: { label:'Sløjfe', color:'#B79BFF' },
  krone: { label:'Krone', color:'#FF5FA8' }, vinger: { label:'Feevinger', color:'#7FD8FF' },
};
const ellPath = (cx,cy,rx,ry) => `M ${cx-rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx+rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx-rx} ${cy} Z`;

function petHelpers(P){
  const sw = 3.5;
  const H = {
    ell: (x,y,rx,ry,fill,rot=0,line=P.L) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot?` transform="rotate(${rot} ${x} ${y})"`:''} fill="${fill}" stroke="${line}" stroke-width="${sw}"/>`,
    path: (d, fill, line=P.L, w=sw) => `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`,
    thick: (d, fill, line, w) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w+7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
    mirror: (s, cx=0) => s + `<g transform="translate(${2*cx},0) scale(-1,1)">${s}</g>`,
    clip: (id, d) => `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>`,
    pat: (clipId, spots=[], stripes=[], patch=null) => {
      let s = '';
      if (P.pat==='pletter') s += spots.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.B}"/>`).join('');
      if (P.pat==='striber') s += stripes.map(d=>`<path d="${d}" fill="none" stroke="${P.B}" stroke-width="11" stroke-linecap="round"/>`).join('');
      if (P.pat==='oejeplet' && patch) s += `<ellipse cx="${patch[0]}" cy="${patch[1]}" rx="${patch[2]}" ry="${patch[3]}" fill="${P.B}"/>`;
      return s ? HLW(P.hl==='petpat', `<g clip-path="url(#${clipId})">${s}</g>`) : '';
    },
    sock: P.pat==='sokker',
    eye: (x,y,s=1,slit=false,flick=-1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse rx="21" ry="25" fill="#FFFFFF" stroke="#1B1330" stroke-width="3"/><ellipse cy="3" rx="17" ry="21" fill="url(#petIris)"/>`
      + (slit ? `<ellipse cy="3" rx="5" ry="16" fill="#14122B"/>` : `<ellipse cy="4" rx="9" ry="12" fill="#14122B"/>`)
      + `<circle cx="-7" cy="-8" r="7" fill="#FFFFFF"/><circle cx="7" cy="14" r="3" fill="#FFFFFF"/>`
      + `<path d="M ${flick*20} -12 Q ${flick*26} -19 ${flick*31} -21" fill="none" stroke="#1B1330" stroke-width="3.2" stroke-linecap="round"/>`
      + blinkLid(`<ellipse rx="25" ry="29" fill="${P.A}"/><path d="M -23 2 Q 0 18 23 2" fill="none" stroke="#1B1330" stroke-width="3.6" stroke-linecap="round"/>`, 3.7, 1.8) + `</g>`,
    blush: (x,y) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="#FF7FA6" opacity="0.5"/>`,
    collar: (x,y,hw,rot=0) => { const h = P.acc.halsbaand; if (!h) return '';
      return HLW(P.hl==='petacc:halsbaand', `<g transform="rotate(${rot} ${x} ${y})"><path d="M ${x-hw} ${y} Q ${x} ${y+18} ${x+hw} ${y}" fill="none" stroke="${outline(h)}" stroke-width="15" stroke-linecap="round"/><path d="M ${x-hw} ${y} Q ${x} ${y+18} ${x+hw} ${y}" fill="none" stroke="${h}" stroke-width="10" stroke-linecap="round"/>`
        + (t => P.walk ? spin(t, x, y+8, [-14,14,-14], 0.6) : t)(`<circle cx="${x}" cy="${y+18}" r="9" fill="#FFD54A" stroke="#C99A12" stroke-width="2.5"/><path d="M ${x-5} ${y+19} L ${x+5} ${y+19}" stroke="#C99A12" stroke-width="2"/>`) + `</g>`); },
  };
  return H;
}
const NOSE_DARK = '#2E1F3A';

const PET_SPECIES = {
  /* ---------- KAT: slank, sidder højt, halen snoet om poterne ---------- */
  kat: { anchors:{ crown:[0,-258], bow:[46,-244,20], bowCrown:[72,-252,30,0.5], collar:[0,-134,28], wings:[0,-100] }, shadow:66, head:(P,H) => {
    let o = '';
    o += H.mirror(H.path("M -72 -212 L -62 -298 L -18 -254 Z", P.A) + `<path d="M -62 -226 L -57 -282 L -32 -254 Z" fill="#FFB3D1"/>`);
    const head = "M 0 -264 C 44 -264, 72 -244, 76 -210 C 92 -194, 90 -164, 72 -152 C 54 -138, 30 -134, 0 -134 C -30 -134, -54 -138, -72 -152 C -90 -164, -92 -194, -76 -210 C -72 -244, -44 -264, 0 -264 Z";
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[46,-236,14],[-58,-176,9]], ["M -16 -266 L -12 -234","M 0 -268 L 0 -230","M 16 -266 L 12 -234","M -94 -186 L -70 -180","M 94 -186 L 70 -180"], [-32,-200,32,30]);
    o += `<ellipse cx="-11" cy="-166" rx="14" ry="11" fill="${P.B}"/><ellipse cx="11" cy="-166" rx="14" ry="11" fill="${P.B}"/>`;
    o += H.eye(-32,-202,0.95,true,-1) + H.eye(32,-202,0.95,true,1) + H.blush(-54,-172) + H.blush(54,-172);
    o += `<path d="M -7 -178 Q 0 -182 7 -178 Q 4 -171 0 -170 Q -4 -171 -7 -178 Z" fill="#FF8FB0" stroke="#D9577F" stroke-width="2" stroke-linejoin="round"/><path d="M -11 -163 Q -5 -157 0 -166 Q 5 -157 11 -163" fill="none" stroke="#3A2440" stroke-width="2.8" stroke-linecap="round"/>`;
    o += `<path d="M -26 -170 L -78 -180 M -26 -164 L -76 -158 M 26 -170 L 78 -180 M 26 -164 L 76 -158" stroke="${P.L}" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>`;
    return o; },
    draw:(P,H) => {
    let o = H.ell(-34,-34,26,32,'url(#petFur)') + H.ell(34,-34,26,32,'url(#petFur)');
    const body = "M -40 -8 C -58 -50, -50 -124, -24 -154 L 24 -154 C 50 -124, 58 -50, 40 -8 Q 0 2 -40 -8 Z";
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-30,-112,10],[28,-62,12],[-24,-38,8]], ["M -60 -124 Q -36 -114 -24 -128","M -62 -94 Q -38 -84 -28 -96","M 60 -124 Q 36 -114 24 -128","M 62 -94 Q 38 -84 28 -96"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-88" rx="22" ry="54" fill="${P.B}"/></g>`;
    o += spin(H.thick("M 32 -24 C 92 -28, 96 10, 42 4 C 14 1, -18 5, -46 0", P.A, P.L, 17) + (P.pat==='striber' || H.sock ? `<circle cx="-46" cy="0" r="8.5" fill="${P.B}"/>` : ''), 32, -24, [0,-2.5,0,2,0], 2.6);
    for (const x of [-13,13]){
      o += H.path(`M ${x-11} -100 L ${x-11} -14 Q ${x-11} -2 ${x} -2 Q ${x+11} -2 ${x+11} -14 L ${x+11} -100`, 'url(#petFur)');
      if (H.sock) o += H.path(`M ${x-11} -32 L ${x-11} -14 Q ${x-11} -2 ${x} -2 Q ${x+11} -2 ${x+11} -14 L ${x+11} -32 Z`, P.B);
      o += `<path d="M ${x-4} -12 l 0 8 M ${x+4} -12 l 0 8" stroke="${P.L}" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>`;
    }
    o += H.collar(...PET_SPECIES.kat.anchors.collar);
    o += PET_SPECIES.kat.head(P,H);
    return o; } },

  /* ---------- HUND: buttet, stor snude, hængeører, tunge ude ---------- */
  hund: { anchors:{ crown:[0,-266], bow:[54,-246,20], bowCrown:[80,-254,25,0.5], collar:[0,-130,44], wings:[0,-92] }, shadow:86, head:(P,H) => {
    let o = '';
    const head = ellPath(0,-202,78,68);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[44,-240,15],[-52,-226,9]], ["M -18 -270 L -14 -240","M 0 -272 L 0 -236","M 18 -270 L 14 -240"], [-30,-212,34,30]);
    o += H.eye(-30,-212,0.92,false,-1) + H.eye(30,-212,0.92,false,1);
    o += `<ellipse cx="-30" cy="-246" rx="8" ry="4" fill="${P.ASh}"/><ellipse cx="30" cy="-246" rx="8" ry="4" fill="${P.ASh}"/>`;
    o += H.ell(0,-166,42,30,P.B) + H.blush(-58,-182) + H.blush(58,-182);
    o += `<path d="M -9 -152 Q -11 -128 0 -126 Q 11 -128 9 -152 Z" fill="#FF7FA6" stroke="#D9577F" stroke-width="2" stroke-linejoin="round"/><path d="M 0 -150 L 0 -134" stroke="#D9577F" stroke-width="2" stroke-linecap="round"/>`;
    o += `<path d="M 0 -172 L 0 -160 M -18 -156 Q -9 -147 0 -160 Q 9 -147 18 -156" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<ellipse cx="0" cy="-180" rx="15" ry="10" fill="${NOSE_DARK}"/><ellipse cx="-4" cy="-183" rx="5" ry="2.6" fill="#FFFFFF" opacity="0.8"/>`;
    o += H.mirror(H.path("M -46 -258 C -100 -268, -120 -196, -106 -140 C -100 -120, -78 -120, -72 -142 C -66 -184, -60 -224, -28 -252 Z", P.pat==='oejeplet'?P.B:P.ASh));
    return o; },
    draw:(P,H) => {
    let o = spin(H.thick("M 56 -56 C 96 -72, 108 -106, 94 -128", P.A, P.L, 20) + `<circle cx="94" cy="-128" r="9.5" fill="${P.B}"/>`, 56, -56, [0,16,0,-10,0], 0.7);
    o += H.ell(-60,-28,32,28,'url(#petFur)') + H.ell(60,-28,32,28,'url(#petFur)');
    o += H.ell(-74,-9,26,12, H.sock?P.B:P.A) + H.ell(74,-9,26,12, H.sock?P.B:P.A);
    const body = "M -66 -8 C -88 -62, -64 -132, 0 -134 C 64 -132, 88 -62, 66 -8 Q 0 6 -66 -8 Z";
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-44,-96,14],[40,-110,10],[50,-50,13]], ["M -86 -110 Q -60 -100 -48 -114","M -88 -76 Q -62 -66 -50 -80","M 86 -110 Q 60 -100 48 -114","M 88 -76 Q 62 -66 50 -80"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-60" rx="38" ry="48" fill="${P.B}"/></g>`;
    for (const x of [-20,20]){
      o += H.path(`M ${x-14} -104 L ${x-14} -14 Q ${x-14} 0 ${x} 0 Q ${x+14} 0 ${x+14} -14 L ${x+14} -104`, 'url(#petFur)');
      if (H.sock) o += H.path(`M ${x-14} -34 L ${x-14} -14 Q ${x-14} 0 ${x} 0 Q ${x+14} 0 ${x+14} -14 L ${x+14} -34 Z`, P.B);
      o += `<path d="M ${x-5} -12 l 0 9 M ${x+5} -12 l 0 9" stroke="${P.L}" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>`;
    }
    o += H.collar(...PET_SPECIES.hund.anchors.collar);
    o += PET_SPECIES.hund.head(P,H);
    return o; } },

  /* ---------- KANIN: pæreform, store bagfødder, poter oppe ---------- */
  kanin: { anchors:{ crown:[0,-236], bow:[34,-236,30], bowCrown:[-34,-288,-8,0.5], collar:[0,-116,36], wings:[0,-74] }, shadow:78, head:(P,H) => {
    let o = '';
    o += `<g transform="rotate(-8 -26 -232)">${H.ell(-26,-294,20,64,'url(#petFur)')}<ellipse cx="-26" cy="-290" rx="10" ry="48" fill="#FFB3D1"/></g>`;
    o += spin(`<g transform="rotate(24 26 -232)">${H.ell(26,-294,20,64,'url(#petFur)')}<ellipse cx="26" cy="-290" rx="10" ry="48" fill="#FFB3D1"/></g>`, 26, -232, [0,0,-10,0,0], 3.1);
    const head = ellPath(0,-180,70,64);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[40,-218,13],[-48,-206,8]], ["M -16 -244 L -12 -216","M 0 -246 L 0 -212","M 16 -244 L 12 -216"], [-28,-188,30,28]);
    o += H.eye(-28,-188,0.88,false,-1) + H.eye(28,-188,0.88,false,1) + H.blush(-50,-160) + H.blush(50,-160);
    o += `<ellipse cx="-13" cy="-152" rx="15" ry="12" fill="${P.B}"/><ellipse cx="13" cy="-152" rx="15" ry="12" fill="${P.B}"/>`;
    o += `<rect x="-6" y="-150" width="12" height="10" rx="2" fill="#FFFFFF" stroke="#3A2440" stroke-width="1.8"/><path d="M 0 -150 L 0 -141" stroke="#3A2440" stroke-width="1.4"/>`;
    o += `<path d="M -7 -165 Q 0 -169 7 -165 Q 4 -159 0 -158 Q -4 -159 -7 -165 Z" fill="#FF8FB0" stroke="#D9577F" stroke-width="2" stroke-linejoin="round"/><path d="M -11 -151 Q -5 -146 0 -154 Q 5 -146 11 -151" fill="none" stroke="#3A2440" stroke-width="2.6" stroke-linecap="round"/>`;
    return o; },
    draw:(P,H) => {
    let o = `<circle cx="60" cy="-28" r="21" fill="${P.B}" stroke="${P.L}" stroke-width="3.5"/>`;
    const body = "M -54 -8 C -82 -42, -66 -116, 0 -120 C 66 -116, 82 -42, 54 -8 Q 0 4 -54 -8 Z";
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-40,-84,12],[42,-96,9],[-46,-36,9]], ["M -76 -90 Q -52 -82 -42 -96","M -78 -60 Q -54 -52 -44 -66","M 76 -90 Q 52 -82 42 -96","M 78 -60 Q 54 -52 44 -66"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-54" rx="34" ry="42" fill="${P.B}"/></g>`;
    for (const s of [-1,1]){ const x = 42*s;
      o += H.ell(x,-10,36,14, H.sock?P.B:'url(#petFur)');
      o += `<ellipse cx="${x+10*s}" cy="-9" rx="11" ry="6" fill="#FFB3D1"/>` + [0,1,2].map(i=>`<circle cx="${x+(22+i*0)*s}" cy="${-15+i*6}" r="3" fill="#FFB3D1"/>`).join('');
    }
    o += H.ell(-16,-64,12,16, H.sock?P.B:'url(#petFur)') + H.ell(16,-64,12,16, H.sock?P.B:'url(#petFur)');
    o += H.collar(...PET_SPECIES.kanin.anchors.collar);
    o += PET_SPECIES.kanin.head(P,H);
    return o; } },

  /* ---------- ENHJØRNING: buttet pony på korte ben, stort hoved ---------- */
  enhjoerning: { anchors:{ crown:[-34,-262,0], bow:[16,-232,25], bowCrown:[34,-252,20,0.5], collar:[-30,-130,30,-6], wings:[44,-136], wingsSide:true }, shadow:92, head:(P,H) => {
    let o = '';
    o += H.path("M -94 -222 L -90 -280 L -64 -246 Z", P.A) + `<path d="M -89 -232 L -87 -266 L -71 -246 Z" fill="${P.B}"/>`;
    o += H.path("M 24 -222 L 20 -280 L -4 -246 Z", P.A) + `<path d="M 19 -232 L 17 -266 L 3 -246 Z" fill="${P.B}"/>`;
    const head = ellPath(-34,-198,68,60);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[0,-234,10],[-86,-194,8]], ["M -50 -258 L -48 -234","M -18 -258 L -20 -234"], [-58,-206,30,28]);
    o += H.eye(-58,-206,0.9,false,-1) + H.eye(-10,-206,0.9,false,1) + H.blush(-86,-176) + H.blush(18,-176);
    o += H.ell(-34,-164,38,26,P.B);
    o += `<ellipse cx="-46" cy="-167" rx="4.5" ry="5.5" fill="${outline(P.B)}"/><ellipse cx="-22" cy="-167" rx="4.5" ry="5.5" fill="${outline(P.B)}"/><path d="M -46 -153 Q -34 -146 -22 -153" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round"/>`;
    const lock = [[-62,-250,15],[-6,-250,15],[-48,-262,13],[-20,-264,13]];
    o += lock.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+3}" fill="${P.CL}"/>`).join('') + lock.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.C}"/>`).join('');
    o += `<path d="M -47 -258 L -34 -322 L -21 -258 Z" fill="#FFE27A" stroke="#C99A12" stroke-width="3" stroke-linejoin="round"/><path d="M -44 -272 L -25 -278 M -41 -290 L -28 -294 M -38 -306 L -31 -308" stroke="#C99A12" stroke-width="2.5" stroke-linecap="round"/>`;
    return o; },
    draw:(P,H) => {
    const HOOF = P.C, HOOFL = P.CL;
    const legRaw = (x, fill) => H.path(`M ${x-14} -70 L ${x-14} -14 L ${x+14} -14 L ${x+14} -70`, fill) + (H.sock ? H.path(`M ${x-14} -34 L ${x-14} -14 L ${x+14} -14 L ${x+14} -34 Z`, P.B) : '')
      + `<path d="M ${x-16} -18 L ${x+16} -18 L ${x+16} -5 Q ${x+16} 0 ${x+10} 0 L ${x-10} 0 Q ${x-16} 0 ${x-16} -5 Z" fill="${HOOF}" stroke="${HOOFL}" stroke-width="3" stroke-linejoin="round"/>`;
    const leg = (x, fill) => P.walk ? spin(legRaw(x, fill), x, -70, (x === -42 || x === 74) ? [16,-16,16] : [-16,16,-16], 0.6) : legRaw(x, fill);
    let o = spin(H.path("M 80 -114 C 134 -126, 148 -70, 124 -34 C 118 -56, 106 -66, 92 -70 C 102 -86, 96 -102, 78 -98 Z", P.C, P.CL) + `<path d="M 96 -112 C 120 -106, 130 -84, 126 -58" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.5" stroke-linecap="round"/>`, 80, -108, [0,7,0,-4,0], 2.4);
    o += leg(-18, P.ASh) + leg(74, P.ASh);
    o += H.path("M -66 -96 C -70 -138, -60 -168, -44 -186 L 0 -178 C -6 -156, 2 -128, 20 -100 Z", 'url(#petFur)');
    const body = ellPath(16,-94,74,54);
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[46,-112,13],[-6,-82,10],[72,-84,9]], ["M 6 -146 Q 12 -118 4 -96","M 36 -148 Q 42 -120 34 -98","M 66 -142 Q 72 -114 64 -94"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="14" cy="-48" rx="56" ry="22" fill="${P.B}"/></g>`;
    o += leg(-42, 'url(#petFur)') + leg(52, 'url(#petFur)');
    const mane = [[8,-232,20],[16,-208,19],[20,-184,18],[20,-160,16],[16,-138,14]];
    o += mane.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+3}" fill="${P.CL}"/>`).join('') + mane.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.C}"/>`).join('');
    o += mane.map(([x,y,r])=>`<path d="M ${x-r*0.5} ${y-r*0.2} Q ${x} ${y-r*0.7} ${x+r*0.5} ${y-r*0.3}" fill="none" stroke="#FFFFFF" stroke-width="3.5" opacity="0.45" stroke-linecap="round"/>`).join('');
    o += H.collar(...PET_SPECIES.enhjoerning.anchors.collar);
    o += PET_SPECIES.enhjoerning.head(P,H);
    return o; } },

  /* ---------- BJØRN: rund bamse, benene strakt frem ---------- */
  bjoern: { anchors:{ crown:[0,-256], bow:[52,-238,20], bowCrown:[68,-254,20,0.5], collar:[0,-130,44], wings:[0,-96] }, shadow:88, head:(P,H) => {
    let o = '';
    o += H.mirror(`<circle cx="-56" cy="-244" r="24" fill="${P.A}" stroke="${P.L}" stroke-width="3.5"/><circle cx="-56" cy="-244" r="12" fill="${P.B}"/>`);
    const head = ellPath(0,-190,74,66);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[46,-224,13],[-54,-210,9]], ["M -16 -256 L -12 -228","M 0 -258 L 0 -224","M 16 -256 L 12 -228"], [-30,-198,32,30]);
    o += H.eye(-30,-198,0.85,false,-1) + H.eye(30,-198,0.85,false,1) + H.blush(-54,-170) + H.blush(54,-170);
    o += H.ell(0,-164,30,22,P.B);
    o += `<path d="M -11 -176 Q 0 -182 11 -176 Q 8 -166 0 -164 Q -8 -166 -11 -176 Z" fill="${NOSE_DARK}"/><path d="M 0 -164 L 0 -158 M -10 -153 Q -5 -149 0 -158 Q 5 -149 10 -153" fill="none" stroke="#3A2440" stroke-width="2.8" stroke-linecap="round"/>`;
    return o; },
    draw:(P,H) => {
    const body = ellPath(0,-86,70,64);
    let o = H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-44,-112,12],[46,-60,10],[30,-128,8]], ["M -72 -110 Q -48 -100 -40 -114","M -74 -80 Q -50 -70 -42 -84","M 72 -110 Q 48 -100 40 -114","M 74 -80 Q 50 -70 42 -84"]);
    o += `<g clip-path="url(#pbC)"><circle cx="0" cy="-80" r="40" fill="${P.B}"/><circle cx="0" cy="-80" r="33" fill="none" stroke="${outline(P.B)}" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.6"/></g>`;
    o += H.ell(-64,-96,18,32,'url(#petFur)',24) + H.ell(64,-96,18,32,'url(#petFur)',-24);
    if (H.sock) o += H.ell(-72,-74,12,10,P.B,24) + H.ell(72,-74,12,10,P.B,-24);
    for (const s of [-1,1]){ const x = 46*s;
      o += H.ell(x,-26,30,26,'url(#petFur)');
      o += H.ell(x+4*s,-24,18,20, P.B) + [[-11,-40],[0,-45],[11,-40]].map(([dx,dy])=>`<circle cx="${x+4*s+dx}" cy="${dy}" r="5" fill="${P.B}" stroke="${outline(P.B)}" stroke-width="2"/>`).join('');
    }
    o += H.collar(...PET_SPECIES.bjoern.anchors.collar);
    o += PET_SPECIES.bjoern.head(P,H);
    return o; } },

  /* ---------- DRAGE: buttet babydrage, stort hoved, små vinger, hjertehale ---------- */
  drage: { anchors:{ crown:[0,-262], bow:[52,-240,20], bowCrown:[74,-252,20,0.5], collar:[0,-136,40], wings:[0,-104] }, shadow:80, head:(P,H) => {
    let o = '';
    o += H.mirror(H.path("M -30 -250 C -34 -274, -46 -286, -58 -286 C -54 -274, -52 -262, -52 -244 Z", P.C, P.CL));
    const head = ellPath(0,-198,74,64);
    o += H.clip('phC', head) + H.path(head,'url(#petFur)');
    o += H.pat('phC', [[46,-230,11],[-52,-214,8]], ["M -14 -260 L -10 -234","M 14 -260 L 10 -234"], [-30,-206,30,28]);
    o += [[-16,-258,0.7],[0,-263,0.9],[16,-258,0.7]].map(([x,y,s])=>`<path d="M ${x-9*s} ${y+6} Q ${x} ${y-18*s} ${x+9*s} ${y+6} Z" fill="${P.C}" stroke="${P.CL}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
    o += H.path(head, 'none');
    o += H.eye(-30,-206,0.95,false,-1) + H.eye(30,-206,0.95,false,1) + H.blush(-56,-176) + H.blush(56,-176);
    o += H.ell(0,-162,36,22,P.B);
    o += `<ellipse cx="-11" cy="-168" rx="4" ry="3.2" fill="${outline(P.B)}"/><ellipse cx="11" cy="-168" rx="4" ry="3.2" fill="${outline(P.B)}"/><path d="M -14 -155 Q 0 -146 14 -155" fill="none" stroke="#3A2440" stroke-width="3" stroke-linecap="round"/><path d="M 5 -152 L 8 -145 L 11 -153 Z" fill="#FFFFFF" stroke="#3A2440" stroke-width="1.5" stroke-linejoin="round"/>`;
    return o; },
    draw:(P,H) => {
    const wing = `<g transform="translate(-44,-118) scale(0.62)"><path d="M 0 0 C -48 -76, -104 -80, -124 -40 C -106 -40, -96 -24, -98 -8 C -84 -18, -70 -14, -62 0 C -52 -12, -36 -10, -26 6 Z" fill="${P.C}" stroke="${P.CL}" stroke-width="5" stroke-linejoin="round"/><path d="M -20 -6 L -104 -40 M -20 -2 L -76 -18" stroke="${P.CL}" stroke-width="4" opacity="0.5"/></g>`;
    let o = H.mirror(spin(wing, -44, -118, [0,-14,0], 1.1));
    o += spin(H.thick("M 48 -36 C 92 -28, 112 -50, 110 -82", P.A, P.L, 26)
      + `<path transform="translate(110,-96) rotate(10) scale(1.7)" d="M 0 6 C -10 -2, -8 -10, -3 -10 C -1 -10, 0 -8, 0 -6 C 0 -8, 1 -10, 3 -10 C 8 -10, 10 -2, 0 6 Z" fill="${P.C}" stroke="${P.CL}" stroke-width="2" stroke-linejoin="round"/>`
      + H.path("M 76 -38 L 84 -54 L 92 -36 Z", P.C, P.CL, 2.5) + H.path("M 98 -48 L 112 -58 L 110 -42 Z", P.C, P.CL, 2.5), 48, -36, [0,6,0,-4,0], 2.2);
    o += H.ell(-44,-30,28,28,'url(#petFur)') + H.ell(44,-30,28,28,'url(#petFur)');
    const body = ellPath(0,-82,66,62);
    o += H.clip('pbC', body) + H.path(body,'url(#petFur)');
    o += H.pat('pbC', [[-44,-110,10],[46,-62,11],[-46,-50,8]], ["M -72 -76 Q -50 -66 -40 -80","M -72 -52 Q -50 -42 -40 -56","M -66 -30 Q -48 -22 -40 -34","M 72 -76 Q 50 -66 40 -80","M 72 -52 Q 50 -42 40 -56","M 66 -30 Q 48 -22 40 -34"]);
    o += `<g clip-path="url(#pbC)"><ellipse cx="0" cy="-74" rx="40" ry="48" fill="${P.B}"/>` + [-112,-94,-76,-58,-40].map(y=>`<path d="M -36 ${y} Q 0 ${y+9} 36 ${y}" fill="none" stroke="${outline(P.B)}" stroke-width="2.5" opacity="0.45"/>`).join('') + `</g>`;
    for (const s of [-1,1]){ o += H.ell(36*s,-10,28,13, H.sock?P.B:P.A); o += [0,1,2].map(i=>`<path d="M ${36*s+(-14+i*14)} -4 l -4 6 l 8 0 Z" fill="#FFFFFF" stroke="${P.L}" stroke-width="1.5" stroke-linejoin="round"/>`).join(''); }
    o += H.mirror(H.ell(-52,-112,15,20,'url(#petFur)',-35) + `<path d="M -66 -128 l -5 -7 M -61 -132 l -1 -8 M -55 -131 l 2 -7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`);
    o += H.collar(...PET_SPECIES.drage.anchors.collar);
    o += PET_SPECIES.drage.head(P,H);
    return o; } },
};

const bob = (s, dy, dur, begin=0) => ANIM ? `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${s}</g>` : s;
/* sløjfe og krone samtidig: sløjfen flytter ned ved øret, så den ikke ligger oven på kronen */
const bowAt = (an, acc) => acc.krone && an.bowCrown ? an.bowCrown : an.bow;
const QUAD_K = 1.3;
const QUAD = {
  kat:    { rx:64, ry:27, cy:-70, w:14, tail:'kat',   hs:0.72, hx:58, hy:-104, step:0.5 },
  hund:   { rx:68, ry:34, cy:-72, w:18, tail:'hund',  hs:0.74, hx:62, hy:-110, step:0.42 },
  bjoern: { rx:72, ry:42, cy:-74, w:24, tail:'bjoern',hs:0.72, hx:58, hy:-118, step:0.62 },
};
function quadWalk(kind, P, H, an, hl){
  const q = QUAD[kind], hipY = q.cy + q.ry*0.35, sw = 20;
  const legPath = (x, fill) => H.path(`M ${x-q.w/2} ${hipY} L ${x-q.w/2} -9 Q ${x-q.w/2} 0 ${x} 0 Q ${x+q.w/2} 0 ${x+q.w/2} -9 L ${x+q.w/2} ${hipY}`, fill)
    + (H.sock ? H.path(`M ${x-q.w/2} -22 L ${x-q.w/2} -9 Q ${x-q.w/2} 0 ${x} 0 Q ${x+q.w/2} 0 ${x+q.w/2} -9 L ${x+q.w/2} -22 Z`, P.B) : '');
  const leg = (x, fill, phase) => spin(legPath(x, fill), x, hipY, phase ? [sw,-sw,sw] : [-sw,sw,-sw], q.step*2);
  let o = '';
  // halen bagved
  if (q.tail === 'kat') o += spin(H.thick(`M ${-q.rx+8} ${q.cy-8} C ${-q.rx-40} ${q.cy-20}, ${-q.rx-48} ${q.cy-70}, ${-q.rx-22} ${q.cy-96}`, P.A, P.L, 15), -q.rx+8, q.cy-8, [0,12,0,-8,0], 1.6);
  if (q.tail === 'hund') o += spin(H.thick(`M ${-q.rx+8} ${q.cy-12} C ${-q.rx-24} ${q.cy-30}, ${-q.rx-30} ${q.cy-56}, ${-q.rx-20} ${q.cy-72}`, P.A, P.L, 18) + `<circle cx="${-q.rx-20}" cy="${q.cy-72}" r="8.5" fill="${P.B}"/>`, -q.rx+8, q.cy-12, [0,22,0,-14,0], 0.5);
  if (q.tail === 'bjoern') o += `<circle cx="${-q.rx+4}" cy="${q.cy-14}" r="13" fill="${P.A}" stroke="${P.L}" stroke-width="3.5"/>`;
  // ben i den fjerne side
  o += leg(-q.rx*0.42, P.ASh, false) + leg(q.rx*0.5, P.ASh, true);
  // feevinger på ryggen
  if (P.acc.vinger){ const v = P.acc.vinger, f = (bx,by,ang,rx,ry) => { const r=ang*Math.PI/180, cx=bx+Math.cos(r)*rx*0.92, cy=by+Math.sin(r)*rx*0.92; return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${ang} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${v}" fill-opacity="0.55" stroke="${outline(v)}" stroke-width="3"/>`; };
    o += HLW(hl==='petacc:vinger', spin(f(-6, q.cy-q.ry+4, -110, 50, 24) + f(-6, q.cy-q.ry+8, -150, 38, 18), -6, q.cy-q.ry, [0,-14,0], 0.5)); }
  // kroppen
  const body = ellPath(0, q.cy, q.rx, q.ry);
  o += H.clip('pwC', body) + H.path(body, 'url(#petFur)');
  o += H.pat('pwC', [[-24,q.cy-10,10],[14,q.cy-16,8],[36,q.cy+4,7]], [`M -30 ${q.cy-q.ry-4} Q -24 ${q.cy} -30 ${q.cy+q.ry}`,`M -4 ${q.cy-q.ry-4} Q 2 ${q.cy} -4 ${q.cy+q.ry}`,`M 22 ${q.cy-q.ry-4} Q 28 ${q.cy} 22 ${q.cy+q.ry}`]);
  o += `<g clip-path="url(#pwC)"><ellipse cx="6" cy="${q.cy+q.ry*0.7}" rx="${q.rx*0.7}" ry="${q.ry*0.45}" fill="${P.B}"/></g>`;
  // ben i den nære side
  o += leg(-q.rx*0.56, 'url(#petFur)', true) + leg(q.rx*0.36, 'url(#petFur)', false);
  // hovedet (samme hoved som når dyret sidder) med pynt
  /* halsbåndet hører til hovedet, så det sidder samme sted under hagen som når dyret sidder */
  let head = H.collar(...an.collar) + PET_SPECIES[kind].head(P, H);
  if (P.acc.sloejfe){ const b = P.acc.sloejfe, [x,y,r,bs=0.6] = bowAt(an, P.acc); head += HLW(hl==='petacc:sloejfe', `<g transform="translate(${x},${y}) rotate(${r}) scale(${bs})"><path d="M 0 0 C -30 -34, -62 -30, -58 0 C -62 30, -30 34, 0 0 Z M 0 0 C 30 -34, 62 -30, 58 0 C 62 30, 30 34, 0 0 Z" fill="${b}" stroke="${outline(b)}" stroke-width="4" stroke-linejoin="round"/><rect x="-13" y="-16" width="26" height="32" rx="10" fill="${shade(b)}" stroke="${outline(b)}" stroke-width="4"/></g>`); }
  if (P.acc.krone){ const g = P.acc.krone, [x,y,r=-8] = an.crown; head += HLW(hl==='petacc:krone', `<g transform="translate(${x},${y}) rotate(${r}) scale(0.7)"><path d="M -44 14 L -48 -26 L -24 -6 L 0 -38 L 24 -6 L 48 -26 L 44 14 Z" fill="#FFD54A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="0" r="8" fill="${g}" stroke="${outline(g)}" stroke-width="2.5"/></g>`); }
  o += bob(`<g transform="translate(${q.hx},${q.hy}) scale(${q.hs}) translate(0,196)">${head}</g>`, -5, q.step, 0.1);
  /* gående figur forstørres, så hovedet er (næsten) lige så stort som når dyret sidder */
  return bob(`<g transform="scale(${QUAD_K})">${o}</g>`, -4, q.step);
}

function petDraw(p, hl, mode){
  if (!p || !PET_SPECIES[p.kind]) return '';
  const P = { A:p.a, ASh:shade(p.a), L:outline(p.a), B:p.b, C:p.c, CL:outline(p.c), pat:p.pattern, acc:p.acc||{}, hl, walk: mode === 'walk' };
  const sp = PET_SPECIES[p.kind], H = petHelpers(P), an = sp.anchors;
  let o = `<g transform="translate(${PET_X},${PET_Y}) scale(${PET_S})">`;
  o += `<defs><linearGradient id="petIris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${adj(p.eyes,-0.25)}"/><stop offset="0.6" stop-color="${p.eyes}"/><stop offset="1" stop-color="${adj(p.eyes,0.28)}"/></linearGradient>`
    + `<linearGradient id="petFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.A}"/><stop offset="1" stop-color="${P.ASh}"/></linearGradient></defs>`;
  o += `<ellipse cx="${p.kind==='enhjoerning'?18:0}" cy="2" rx="${sp.shadow}" ry="11" fill="#5B3A8C" opacity="0.14"/>`;
  const body0 = o.length;
  if (P.walk && QUAD[p.kind]){
    o += quadWalk(p.kind, P, H, an, hl);
    if (hl === 'pet' || (hl === 'petpat' && !o.includes('<!--HL-->'))) o = o.slice(0, body0) + HLW(true, o.slice(body0));
    return o + `</g>`;
  }
  /* feevinger: hver vinge udgår fra et fast punkt på ryggen og peger ud */
  const fairy = (bx, by, ang, rx, ry, v, op=0.55) => { const r = ang*Math.PI/180, cx = bx + Math.cos(r)*rx*0.92, cy = by + Math.sin(r)*rx*0.92;
    return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${ang} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${v}" fill-opacity="${op}" stroke="${outline(v)}" stroke-width="3"/>`
      + `<path d="M ${bx} ${by} L ${(bx+Math.cos(r)*rx*1.5).toFixed(1)} ${(by+Math.sin(r)*rx*1.5).toFixed(1)}" stroke="${outline(v)}" stroke-width="2" opacity="0.35"/>`
      + star4(+(cx+Math.cos(r)*rx*0.35).toFixed(1), +(cy+Math.sin(r)*rx*0.35-6).toFixed(1), 6); };
  let nearWing = '';
  if (P.acc.vinger){ const v = P.acc.vinger, [wx,wy] = an.wings;
    if (an.wingsSide){
      o += HLW(hl==='petacc:vinger', `<g opacity="0.6">${spin(fairy(wx-12,wy-2,-74,50,24,v) + fairy(wx-12,wy+2,-32,36,18,v), wx-12, wy, [0,10,0], 0.9)}</g>`);
      nearWing = spin(fairy(wx,wy,-58,56,27,v) + fairy(wx,wy+4,-16,40,19,v), wx, wy, [0,-12,0], 0.9) + `<circle cx="${wx}" cy="${wy+2}" r="6" fill="${outline(v)}"/>`;
    } else {
      const w = fairy(wx,wy-6,202,74,34,v) + fairy(wx,wy+10,152,52,24,v);
      o += HLW(hl==='petacc:vinger', H.mirror(spin(w, wx, wy, [0,-9,0], 0.9), wx));
    } }
  o += sp.draw(P, H);
  o += HLW(hl==='petacc:vinger', nearWing);
  if (P.acc.sloejfe){ const b = P.acc.sloejfe, [x,y,r,bs=0.6] = bowAt(an, P.acc);
    o += HLW(hl==='petacc:sloejfe', `<g transform="translate(${x},${y}) rotate(${r}) scale(${bs})"><path d="M 0 0 C -30 -34, -62 -30, -58 0 C -62 30, -30 34, 0 0 Z M 0 0 C 30 -34, 62 -30, 58 0 C 62 30, 30 34, 0 0 Z" fill="${b}" stroke="${outline(b)}" stroke-width="4" stroke-linejoin="round"/><rect x="-13" y="-16" width="26" height="32" rx="10" fill="${shade(b)}" stroke="${outline(b)}" stroke-width="4"/></g>`); }
  if (P.acc.krone){ const g = P.acc.krone, [x,y,r=-8] = an.crown;
    o += HLW(hl==='petacc:krone', `<g transform="translate(${x},${y}) rotate(${r}) scale(0.7)"><path d="M -44 14 L -48 -26 L -24 -6 L 0 -38 L 24 -6 L 48 -26 L 44 14 Z" fill="#FFD54A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="0" r="8" fill="${g}" stroke="${outline(g)}" stroke-width="2.5"/><circle cx="-48" cy="-26" r="5" fill="#FFFFFF"/><circle cx="48" cy="-26" r="5" fill="#FFFFFF"/><circle cx="0" cy="-38" r="5" fill="#FFFFFF"/></g>`); }
  if ((hl === 'pet' || (hl === 'petpat' && !o.includes('<!--HL-->'))) ) o = o.slice(0, body0) + HLW(true, o.slice(body0));
  if (P.walk && p.kind === 'kanin') o = o.slice(0, body0) + (ANIM ? `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -46;0 0;0 0" keyTimes="0;0.35;0.7;1" calcMode="spline" keySplines="0.2 0.8 0.4 1;0.6 0 0.8 0.2;0 0 1 1" dur="0.7s" repeatCount="indefinite"/>${o.slice(body0)}</g>` : o.slice(body0));
  else if (P.walk && p.kind === 'drage') o = o.slice(0, body0) + bob(spin(o.slice(body0), 0, 0, [-7,7,-7], 0.8), -6, 0.4);
  else if (P.walk) o = o.slice(0, body0) + bob(o.slice(body0), -3, 0.3);
  else o = o.slice(0, body0) + squash(o.slice(body0), 0, 0, ['1 1','1.012 1.02','1 1'], 2.8, 0.4);
  return o + `</g>`;
}

/* ================= LAGREGLER =================
   Pladser: kun én ting ad gangen på samme plads. Skjult: ting, der ikke kan ses under en anden.
   Nye ting skal have en plads her, hvis de deler plads med noget. */
