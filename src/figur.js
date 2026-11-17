'use strict';
/* ================= Magiske Mig — figuren i eventyrstil (SVG i lag) =================
   Figuren tegnes i sine egne mål (P: 600 bred, fødder ved y 860) og flyttes ind i 800×1100-rammen.
   Lys fra venstre. Skygger er kølige lilla flader klippet til hver del. */
const mixC = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t, A[2]+(B[2]-A[2])*t); };
const SHC = '#3B2363', INK = '#3A2340';
const fdk = (c, t=0.25) => mixC(c, '#2A1838', t), lt = (c, t=0.3) => mixC(c, '#FFFFFF', t), sd = (c, t=0.3) => mixC(c, SHC, t);
const FIG_T = 'translate(400 1046) scale(1.15) translate(-300 -860)';
const HEAD_T = 'translate(300 384) scale(1.13) translate(-300 -384)';
const MIR = s => `<g transform="translate(600,0) scale(-1,1)">${s}</g>`;
function starP(x, y, r, fill, op=1){ const p = []; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*0.45 : r; p.push((x+rr*Math.cos(a)).toFixed(1)+','+(y+rr*Math.sin(a)).toFixed(1)); } return `<polygon points="${p.join(' ')}" fill="${fill}" opacity="${op}"/>`; }
const twinkle = (x, y, r, fill) => `<path d="M ${x} ${y-r} Q ${x} ${y} ${x+r} ${y} Q ${x} ${y} ${x} ${y+r} Q ${x} ${y} ${x-r} ${y} Q ${x} ${y} ${x} ${y-r} Z" fill="${fill}"/>`;
const moon = (x, y, r, fill, op=1) => `<path d="M ${x} ${y-r} A ${r} ${r} 0 1 0 ${x} ${y+r} A ${r*0.72} ${r*0.86} 0 1 1 ${x} ${y-r} Z" fill="${fill}" opacity="${op}"/>`;
let CLIPN = 0;
function clipG(d, inner){ const id = 'k' + (CLIPN++); return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; }
function gradV(id, y1, y2, a, b){ return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`; }

/* ---------- farver ---------- */
function pal(x){ return { a:x.a, b:x.b, s:fdk(x.a,0.32), D:sd(x.a,0.32), L:lt(x.a,0.18), bs:fdk(x.b,0.35), bL:lt(x.b,0.45), bD:sd(x.b,0.4) }; }
function figColors(st){
  const c = {};
  c.skin = st.skin; c.sk = fdk(st.skin,0.3); c.skS = sd(st.skin,0.22);
  const h = st.hair.a; c.hair = h; c.hs = fdk(h,0.32); c.hD = sd(h,0.3); c.hL = lt(h,0.4);
  c.tip = st.hair.ombre ? st.hair.b : h; c.tie = st.hair.tie;
  c.eye = st.eyes.color; c.pupil = st.eyes.pupil;
  c.blush = st.mk.blush; c.lips = st.mk.lips; c.lipShape = st.mk.lipShape; c.mark = st.mk.mark; c.markColor = st.mk.markColor;
  c.robe = pal(st.robe); c.cape = pal(st.cape); c.hat = pal(st.hat); c.boots = pal(st.boots);
  return c;
}

/* ================= HÅR ================= */
const HAIR_LONG = 'M 300 194 C 214 194 186 262 190 336 C 194 404 180 466 186 530 C 190 576 204 604 224 620 C 220 600 226 586 236 578 C 238 598 250 610 262 614 L 262 470 L 338 470 L 338 614 C 350 610 362 598 364 578 C 374 586 380 600 376 620 C 396 604 410 576 414 530 C 420 466 406 404 410 336 C 414 262 386 194 300 194 Z';
const HAIR_CAP = 'M 300 186 C 214 186 190 250 196 320 C 199 350 206 372 222 386 Q 300 404 378 386 C 394 372 401 350 404 320 C 410 250 386 186 300 186 Z';
const PONY = 'M 340 206 C 420 190 460 250 452 322 C 446 384 462 436 438 496 C 432 460 416 436 406 404 C 396 372 388 336 382 300 C 376 272 360 250 334 236 Z';
const hairFill = (c, id, y1, y2, base) => c.tip !== c.hair ? `<defs>${gradV(id, y1, y2, base, c.tip)}</defs>` : '';
const hairUrl = (c, id, base) => c.tip !== c.hair ? `url(#${id})` : base;
function strandWedges(c, list){
  return list.map(([x1,y1,x2,y2]) => { const cx = (x1+x2)/2 + (x1 < 300 ? -8 : 8), cy = (y1+y2)/2; return `<path d="M ${x1-8} ${y1} Q ${cx-8} ${cy} ${x2} ${y2} Q ${cx+8} ${cy} ${x1+8} ${y1} Z" fill="${c.hair}" opacity=".6"/>`; }).join('');
}
function capBack(c){
  return hairFill(c,'hcG',190,410,mixC(c.hair,c.hs,0.35)) + `<path d="${HAIR_CAP}" fill="${hairUrl(c,'hcG',mixC(c.hair,c.hs,0.35))}" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`;
}
function braid(c, x){
  let o = '';
  for (let i = 5; i >= 0; i--){ const y = 382 + i*25, dx = i % 2 ? 4 : -4, rot = i % 2 ? 22 : -22, col = mixC(c.hair, c.tip, i/5);
    o += `<ellipse cx="${x+dx}" cy="${y}" rx="17" ry="15" transform="rotate(${rot} ${x+dx} ${y})" fill="${col}" stroke="${c.hs}" stroke-width="2.5"/>`
      + `<path d="M ${x+dx-9} ${y-5} Q ${x+dx} ${y-11} ${x+dx+8} ${y-6}" transform="rotate(${rot} ${x+dx} ${y})" stroke="${lt(col,0.45)}" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
  const ty = 382 + 6*25 - 8;
  return `<path d="M ${x-10} ${ty} Q ${x-16} ${ty+22} ${x-20} ${ty+36} Q ${x-4} ${ty+28} ${x} ${ty+40} Q ${x+4} ${ty+28} ${x+20} ${ty+36} Q ${x+16} ${ty+22} ${x+10} ${ty} Z" fill="${c.tip}" stroke="${c.hs}" stroke-width="2.5" stroke-linejoin="round"/>`
    + o + `<ellipse cx="${x}" cy="${ty+1}" rx="13" ry="7" fill="${c.tie}" stroke="${fdk(c.tie,0.4)}" stroke-width="2.5"/>`;
}
function curls(c){
  const base = sd(c.hair,0.3), L = [[198,282],[188,316],[182,352],[178,388],[176,424],[176,460],[178,496],[182,532],[188,568],[200,600]];
  let d = 'M 300 186 C 222 186 196 236 198 290 ';
  for (let i = 1; i < L.length; i++){ const [x0,y0] = L[i-1], [x1,y1] = L[i]; d += `Q ${Math.min(x0,x1)-26} ${(y0+y1)/2} ${x1} ${y1} `; }
  d += 'L 400 600 ';
  const R = L.map(([x,y]) => [600-x, y]).reverse();
  for (let i = 1; i < R.length; i++){ const [x0,y0] = R[i-1], [x1,y1] = R[i]; d += `Q ${Math.max(x0,x1)+26} ${(y0+y1)/2} ${x1} ${y1} `; }
  d += 'C 404 236 378 186 300 186 Z';
  let o = hairFill(c,'krG',190,600,base);
  o += `<path d="${d}" fill="${hairUrl(c,'krG',base)}" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`;
  const coil = (x, y, f) => `<path d="M ${x} ${y} c ${-9*f} -2 ${-11*f} 10 ${-2*f} 13 c ${10*f} 3 ${14*f} -10 ${4*f} -16" fill="none" stroke="${c.hs}" stroke-width="2.6" opacity=".5" stroke-linecap="round"/>`;
  let det = '';
  for (let i = 1; i < L.length; i++){ const [x0,y0] = L[i-1], [x1,y1] = L[i], mx = Math.min(x0,x1) - 4, my = (y0+y1)/2;
    det += coil(mx + 6, my - 6, 1) + coil(600 - mx - 6, my - 6, -1);
    det += `<path d="M ${mx-2} ${my-14} q -6 10 0 20" stroke="${c.hL}" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/><path d="M ${602-mx} ${my-14} q 6 10 0 20" stroke="${c.hL}" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>`; }
  o += clipG(d, det + `<path d="M 340 200 C 400 220 420 300 420 400 L 440 400 L 440 180 Z" fill="${c.hD}" opacity=".35"/>`);
  return o;
}
function bunAt(c, x, y, r=32){
  const k = r / 32, f = x < 300 ? 1 : -1;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.hair}" stroke="${c.hs}" stroke-width="3"/>`
    + `<path d="M ${x-20*k} ${y-10*k} C ${x-8*k} ${y-28*k} ${x+18*k} ${y-24*k} ${x+20*k} ${y-2*k} C ${x+20*k} ${y+14*k} ${x+4*k} ${y+20*k} ${x-8*k} ${y+14*k}" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`
    + `<path d="M ${x-14*k} ${y+4*k} C ${x-10*k} ${y-8*k} ${x+4*k} ${y-12*k} ${x+12*k} ${y-4*k}" stroke="${c.hD}" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>`
    + `<path d="M ${x-22*k} ${y+2*k} C ${x-22*k} ${y-14*k} ${x-12*k} ${y-24*k} ${x} ${y-26*k}" stroke="${c.hL}" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>`
    + (f === 1 ? `<path d="M ${x+r*0.62} ${y-r*0.8} q 12 -8 6 -20 M ${x+r*0.62} ${y-r*0.8} q 2 -10 -4 -14" stroke="${c.hs}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
              : `<path d="M ${x-r*0.15} ${y-r*0.98} q -2 -12 -14 -14" stroke="${c.hs}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
}
/* baghår: back = bag kroppen, over = foran skuldrene, lock = sidelokkernes længde */
const BACK = {
  langt: { label:'Langt hår', lock:'lang', back: c => {
      const base = sd(c.hair,0.36);
      return `<defs>${gradV('hbG',190,620,c.hD,c.tip !== c.hair ? sd(c.tip,0.3) : base)}</defs>`
        + `<path d="${HAIR_LONG}" fill="url(#hbG)" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(HAIR_LONG, strandWedges(c, [[196,350,214,560],[214,360,232,600],[404,350,386,560],[386,360,368,600]])
          + `<path d="M 200 380 C 196 450 194 520 204 590 M 400 380 C 404 450 406 520 396 590" stroke="${c.hs}" stroke-width="2" fill="none" opacity=".55"/>`); } },
  kort: { label:'Kort hår', lock:'kort', back: c => capBack(c) },
  hestehale: { label:'Hestehale', lock:'ingen', back: c => spin(hairFill(c,'pnG',220,500,c.hair)
      + `<path d="${PONY}" fill="${hairUrl(c,'pnG',c.hair)}" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`
      + clipG(PONY, `<path d="M 380 250 C 420 280 432 360 428 430 C 424 380 414 310 372 262 Z" fill="${c.hD}" opacity=".5"/><path d="M 412 224 C 440 260 444 320 438 380" stroke="${c.hL}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>`)
      + `<ellipse cx="372" cy="214" rx="12" ry="18" transform="rotate(-40 372 214)" fill="${c.tie}" stroke="${fdk(c.tie,0.4)}" stroke-width="2.5"/>`, 372, 214, [0,-3,0,2.5,0], 2.8) },
  fletninger: { label:'Fletninger', lock:'kort', back: c => capBack(c), over: c => spin(braid(c, 222), 222, 380, [0,2,0,-1.6,0], 3.4) + spin(braid(c, 378), 378, 380, [0,-2,0,1.6,0], 3.4) },
  knolde: { label:'Knolde', lock:'ingen', back: c => '', top: c => bunAt(c, 232, 186, 38) + bunAt(c, 368, 186, 38) },
  kroeller: { label:'Krøller', lock:'krol', back: c => '' },
  rottehaler: { label:'To hestehaler', lock:'ingen', back: c => { const one = `<path d="${PONY}" fill="${hairUrl(c,'pnG',c.hair)}" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`
      + clipG(PONY, `<path d="M 380 250 C 420 280 432 360 428 430 C 424 380 414 310 372 262 Z" fill="${c.hD}" opacity=".5"/><path d="M 412 224 C 440 260 444 320 438 380" stroke="${c.hL}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>`)
      + `<ellipse cx="372" cy="214" rx="12" ry="18" transform="rotate(-40 372 214)" fill="${c.tie}" stroke="${fdk(c.tie,0.4)}" stroke-width="2.5"/>`;
      return hairFill(c,'pnG',220,500,c.hair) + spin(one, 372, 214, [0,-3,0,2.5,0], 2.8) + spin(MIR(one), 228, 214, [0,3,0,-2.5,0], 2.8); } },
  sidefletning: { label:'Sidefletning', lock:'kort', back: c => capBack(c), over: c => spin(braid(c, 368), 368, 380, [0,-2,0,1.6,0], 3.4) },
  topknold: { label:'Topknold', lock:'ingen', back: c => '', top: c => bunAt(c, 300, 166, 42) + `<path d="M 268 196 Q 300 206 332 196" stroke="${c.tie}" stroke-width="7" fill="none" stroke-linecap="round"/>` },
  skulder: { label:'Skulderlangt hår', lock:'kort', back: c => {
      const base = sd(c.hair,0.36), d = 'M 300 186 C 214 186 188 250 192 320 C 194 380 196 420 186 452 C 200 470 220 466 234 452 Q 300 470 366 452 C 380 466 400 470 414 452 C 404 420 406 380 408 320 C 412 250 386 186 300 186 Z';
      return `<defs>${gradV('hsG',190,470,c.hD,c.tip !== c.hair ? sd(c.tip,0.3) : base)}</defs><path d="${d}" fill="url(#hsG)" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(d, strandWedges(c, [[200,340,206,450],[400,340,394,450]]) + `<path d="M 196 420 Q 202 440 194 452 M 404 420 Q 398 440 406 452" stroke="${c.hL}" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`); } },
};

/* ---- håret foran: ÉN form med én kontur (sidehår + isse + pandehårets kant), så der ingen samlinger er ved tindingen ----
   Venstre side beskrives fra spidsen og op; højre side er spejlet. Pandehåret giver kun kanten hen over panden. */
const mxP = p => [600 - p[0], p[1]];
const segStr = segs => segs.map(([a, b, e]) => `C ${a[0]} ${a[1]} ${b[0]} ${b[1]} ${e[0]} ${e[1]}`).join(' ');
function revSegs(start, segs){ const pts = [start, ...segs.map(x => x[2])], out = []; for (let i = segs.length - 1; i >= 0; i--) out.push([segs[i][1], segs[i][0], pts[i]]); return [pts[pts.length - 1], out]; }
const mirSegs = segs => segs.map(x => x.map(mxP));
function wavy(from, to, n, amp){ /* bølget kant fra -> to, buler ud mod venstre (amp > 0) */
  const out = []; let p = from;
  for (let i = 1; i <= n; i++){ const t = i / n, e = [from[0] + (to[0]-from[0])*t, from[1] + (to[1]-from[1])*t];
    const dy = (e[1]-p[1]), c1 = [p[0] - amp, p[1] + dy*0.15], c2 = [e[0] - amp, e[1] - dy*0.15]; out.push([c1, c2, e]); p = e; }
  return out;
}
const LOCKS = {
  lang: { tip:[222,502], out:[[[204,494],[198,470],[206,440]], [[214,400],[202,340],[206,290]]], inn:[[[236,340],[250,410],[234,450]], [[226,470],[216,484],[222,502]]] },
  kort: { tip:[222,384], out:[[[212,380],[206,370],[208,356]], [[210,330],[202,310],[206,290]]], inn:[[[236,320],[242,336],[232,350]], [[226,362],[220,372],[222,384]]] },
  ingen:{ tip:[226,326], out:[[[216,316],[208,304],[207,290]]], inn:[[[238,302],[236,316],[226,326]]] },
  krol: { tip:[224,512], out:[[[210,508],[200,496],[202,482]], ...wavy([202,482],[204,290],7,16)], inn:[...wavy([240,290],[236,470],6,-7), [[232,486],[226,500],[224,512]]] },
};
function hairShape(fringe, lockKind){
  const L = LOCKS[lockKind] || LOCKS.lang;
  const [rTop, rOut] = revSegs(mxP(L.tip), mirSegs(L.out));            /* højre yderkant, oppefra og ned */
  const [rIn0, rIn] = revSegs([360,290], mirSegs(L.inn));               /* højre inderkant, nedefra og op */
  return `M ${L.tip[0]} ${L.tip[1]} ${segStr(L.out)} C 202 232 250 194 302 194 C 354 194 398 232 394 290 ${segStr(rOut)} ${segStr(rIn)} ${fringe} ${segStr(L.inn)} Z`;
}
function lockDetails(c, kind){
  let one;
  if (kind === 'lang') one = `<path d="M 238 270 C 248 340 242 420 228 466 C 238 420 236 340 238 270 Z" fill="${c.hD}" opacity=".5"/><path d="M 217 266 C 208 330 214 392 208 436 C 218 394 223 330 217 266 Z" fill="${c.hL}" opacity=".85"/><path d="M 228 330 C 228 380 224 420 216 452 C 224 420 226 380 230 330 Z" fill="${c.hL}" opacity=".5"/>`;
  else if (kind === 'kort') one = `<path d="M 238 270 C 246 316 238 340 228 360 C 234 336 238 310 238 270 Z" fill="${c.hD}" opacity=".5"/><path d="M 217 266 C 209 310 212 338 212 356 C 219 338 223 306 217 266 Z" fill="${c.hL}" opacity=".85"/>`;
  else if (kind === 'krol'){ one = ''; for (let y = 312; y < 490; y += 26){ const x = 214 + ((y/26)%2) * 6;
      one += `<path d="M ${x} ${y} c -8 -2 -10 9 -2 12 c 9 3 13 -9 4 -15" fill="none" stroke="${c.hs}" stroke-width="2.4" opacity=".5" stroke-linecap="round"/><path d="M ${x-8} ${y-8} q -5 8 0 16" stroke="${c.hL}" stroke-width="3.5" fill="none" opacity=".6" stroke-linecap="round"/>`; } }
  else one = `<path d="M 216 296 C 214 306 216 314 222 320" stroke="${c.hL}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  return one + MIR(one);
}
function hairFront(c, fr, lockKind, hatOn){
  const d = hairShape(fr.edge, lockKind), L = LOCKS[lockKind] || LOCKS.lang;
  const fill = c.tip !== c.hair ? 'url(#hfG)' : c.hair;
  let o = c.tip !== c.hair ? `<defs>${gradV('hfG', 300, L.tip[1], c.hair, c.tip)}</defs>` : '';
  o += `<path d="${d}" fill="${fill}"/>`;
  o += clipG(d, lockDetails(c, lockKind) + fr.det(c)
    + `<path d="M 330 196 C 384 210 404 260 400 330 L 420 330 L 420 190 Z" fill="${c.hD}" opacity=".35"/>`
    + (hatOn ? `<path d="M 190 190 L 410 190 L 410 248 Q 300 268 190 248 Z" fill="${c.hD}" opacity=".5"/>`
             : (fr.shine ? `<path d="M 238 230 Q 284 206 334 216" stroke="${c.hL}" stroke-width="8" stroke-linecap="round" fill="none" opacity=".85"/>` : `<path d="M 236 222 Q 270 204 300 200" stroke="${c.hL}" stroke-width="6" stroke-linecap="round" fill="none" opacity=".6"/>`)));
  o += `<path d="${d}" fill="none" stroke="${c.hs}" stroke-width="3" stroke-linejoin="round"/>`;
  return { svg: o, d };
}

/* pandehår (hovedets mål) */
const FRONT = {
  side: { label:'Sideskilning', shine:true, edge:'C 358 272 346 256 330 244 C 306 266 272 272 250 268 C 244 276 241 283 240 290',
    det: c => `<path d="M 330 246 C 316 258 296 264 276 266 M 346 258 C 340 240 328 222 310 212" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>` },
  lige: { label:'Lige pandehår', shine:true, edge:'C 361 282 362 276 362 270 Q 300 282 238 270 C 238 276 239 282 240 290',
    det: c => `<path d="M 256 272 L 258 236 M 280 276 L 281 228 M 304 277 L 304 226 M 328 275 L 327 228 M 350 272 L 348 236" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  midt: { label:'Midterskilning', shine:false, edge:'C 356 256 332 230 300 222 C 268 230 244 256 240 290',
    det: c => `<path d="M 300 196 L 300 222 M 290 226 C 264 238 248 258 242 282 M 310 226 C 336 238 352 258 358 282" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  pjusket: { label:'Pjusket', shine:true, edge:'L 358 266 L 346 256 L 336 276 L 320 252 L 306 274 L 292 252 L 278 274 L 264 254 L 252 278 L 242 264 L 240 290',
    det: c => `<path d="M 336 270 C 330 244 318 226 300 214 M 278 268 C 276 248 268 232 256 222" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  gardin: { label:'Gardinpandehår', shine:false, edge:'C 358 266 342 244 316 234 C 308 246 304 256 300 264 C 296 256 292 246 284 234 C 258 244 242 266 240 290',
    det: c => `<path d="M 300 196 L 300 262 M 314 238 C 330 246 346 262 354 280 M 286 238 C 270 246 254 262 246 280" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  mini: { label:'Mini pandehår', shine:true, edge:'C 362 270 362 252 360 244 Q 300 254 240 244 C 238 252 238 270 240 290',
    det: c => `<path d="M 262 246 L 263 222 M 284 250 L 284 216 M 306 250 L 306 214 M 330 248 L 329 218 M 350 246 L 348 226" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  venstre: { label:'Sideskilning til venstre', shine:true, edge:'C 359 283 356 276 350 268 C 328 272 294 266 270 244 C 254 256 242 272 240 290',
    det: c => `<path d="M 270 246 C 284 258 304 264 324 266 M 254 258 C 260 240 272 222 290 212" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>` },
  boelget: { label:'Bølget pandehår', shine:true, edge:'C 362 280 360 268 356 260 Q 346 278 332 264 Q 318 280 304 264 Q 290 280 276 264 Q 262 280 250 264 Q 242 272 240 290',
    det: c => `<path d="M 332 262 C 330 240 322 222 310 212 M 276 262 C 276 240 270 226 260 216" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  lang: { label:'Langt pandehår', shine:true, edge:'C 362 288 364 286 364 282 Q 300 296 236 282 C 236 286 238 288 240 290',
    det: c => `<path d="M 254 284 L 256 236 M 278 288 L 279 228 M 302 289 L 302 226 M 326 288 L 325 228 M 348 284 L 346 236" stroke="${c.hD}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` },
  tilbage: { label:'Strøget tilbage', shine:false, edge:'C 352 248 330 230 300 228 C 270 230 248 248 240 290',
    det: c => `<path d="M 300 228 C 300 214 300 204 300 196 M 272 232 C 264 220 258 210 254 202 M 328 232 C 336 220 342 210 346 202 M 252 244 C 242 234 236 226 232 218 M 348 244 C 358 234 364 226 368 218" stroke="${c.hD}" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round"/>` },
};

/* ================= HATTE (hovedets mål) ================= */
function hatBand(c){
  const h = c.hat;
  return `<path d="M 240 190 Q 300 204 362 190 L 366 210 Q 300 224 236 210 Z" fill="${h.b}" stroke="${h.bs}" stroke-width="2.5"/><path d="M 330 194 Q 348 192 364 192 L 366 210 Q 348 214 332 214 Z" fill="${h.bD}" opacity=".5"/><path d="M 244 196 Q 300 208 356 196" stroke="${h.bL}" stroke-width="2" fill="none"/>`;
}
function hatBrim(c, w=1){
  const h = c.hat, x1 = 300-152*w, x2 = 300+152*w;
  return `<path d="M ${x1} 212 C ${x1} 190 ${300-80*w} 176 300 178 C ${300+80*w} 180 ${x2} 192 ${x2} 214 C ${x2} 236 ${300+80*w} 248 300 248 C ${300-80*w} 248 ${x1} 236 ${x1} 212 Z" fill="${h.a}" stroke="${h.s}" stroke-width="3"/>`
    + `<path d="M ${x1+4} 216 C ${x1+12} 236 ${300-70*w} 248 300 248 C ${300+70*w} 248 ${x2-6} 236 ${x2-2} 218 C ${x2-22} 230 ${300+70*w} 238 300 238 C ${300-70*w} 238 ${x1+20} 230 ${x1+4} 216 Z" fill="${h.D}" opacity=".6"/>`
    + `<path d="M ${300-114*w} 204 Q ${300-50*w} 186 316 186" stroke="${lt(h.a,0.22)}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
}
const CONE = 'M 236 206 C 250 150 268 100 300 64 C 320 40 352 30 378 38 C 360 50 350 62 352 80 C 346 120 356 170 366 206 Z';
const CONE_BENT = 'M 236 206 C 246 158 262 118 288 90 C 304 74 330 68 352 76 C 378 86 396 106 404 132 C 390 118 372 112 356 116 C 344 128 350 172 366 206 Z';
const CONE_LOW = 'M 246 206 C 254 170 270 138 300 118 C 330 138 346 170 354 206 Z';
const CAP_TAIL = 'M 330 140 C 372 150 400 186 412 222 C 422 252 438 276 456 296 C 426 302 404 284 392 260 C 382 238 372 214 350 196 Z';
const CAP_SOFT = 'M 204 240 C 208 172 258 132 306 130 C 352 132 374 162 386 200 C 398 240 424 270 446 296 C 414 296 394 274 382 252 L 380 236 Z';
const HATS = {
  ingen: { label:'Ingen hat' },
  spids: { label:'Spids hat', draw: c => {
      const h = c.hat;
      return `<path d="${CONE}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(CONE, `<path d="M 312 40 C 304 110 318 170 330 230 L 400 230 L 400 30 Z" fill="${h.D}" opacity=".5"/><path d="M 262 190 C 270 140 282 104 300 74" stroke="${lt(h.a,0.22)}" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/><path d="M 300 92 Q 316 100 332 94 M 294 110 Q 314 120 336 110" stroke="${h.s}" stroke-width="2.5" fill="none" opacity=".6"/>`
          + `<g transform="translate(276,150) rotate(-10)"><rect x="-14" y="-12" width="28" height="24" rx="3" fill="${h.bL}" stroke="${h.bs}" stroke-width="1.5"/><path d="M -14 -6 h 28 M -14 6 h 28" stroke="${lt(h.b,0.7)}" stroke-width="2"/><path d="M -12 -10 h 24 v 20 h -24 Z" fill="none" stroke="${h.b}" stroke-width="1" stroke-dasharray="2 2"/></g>`)
        + hatBand(c) + starP(318, 201, 12, '#F2C14E') + starP(318, 201, 6, '#FFE7A0') + hatBrim(c); } },
  knaek: { label:'Hat med knæk', draw: c => {
      const h = c.hat;
      return `<path d="${CONE_BENT}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(CONE_BENT, `<path d="M 316 100 C 314 140 322 180 332 230 L 420 230 L 420 60 Z" fill="${h.D}" opacity=".5"/><path d="M 260 188 C 268 146 280 116 300 92" stroke="${lt(h.a,0.22)}" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/><path d="M 330 84 Q 344 98 356 116" stroke="${h.s}" stroke-width="2.5" fill="none" opacity=".6"/>`)
        + `<path d="M 403 130 L 404 146" stroke="${h.s}" stroke-width="2"/><circle cx="404" cy="154" r="10" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/><path d="M 397 156 Q 404 162 411 156" stroke="#B98516" stroke-width="2" fill="none"/><circle cx="401" cy="150" r="2.5" fill="#FFF" opacity=".85"/>`
        + hatBand(c) + `<circle cx="252" cy="200" r="6" fill="${h.bL}" stroke="${h.bs}" stroke-width="2"/>` + hatBrim(c); } },
  kort: { label:'Bred hat', draw: c => {
      const h = c.hat;
      return `<path d="${CONE_LOW}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(CONE_LOW, `<path d="M 304 118 C 312 150 322 180 330 230 L 380 230 L 380 100 Z" fill="${h.D}" opacity=".5"/><path d="M 268 186 C 274 160 284 142 298 128" stroke="${lt(h.a,0.22)}" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`)
        + hatBand(c) + `<g transform="translate(350,190) rotate(18)"><path d="M 0 0 C -6 -24 6 -40 14 -46 C 12 -30 10 -14 0 0 Z" fill="${h.bL}" stroke="${h.bs}" stroke-width="2"/><path d="M 2 -4 C 4 -20 8 -32 12 -40" stroke="${h.bs}" stroke-width="1.5" fill="none"/></g>`
        + hatBrim(c, 1.22); } },
  blomst: { label:'Hat med blomster', draw: c => {
      const h = c.hat, leaf = mixC('#5FB86A', h.a, 0.15);
      return `<path d="${CONE}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(CONE, `<path d="M 312 40 C 304 110 318 170 330 230 L 400 230 L 400 30 Z" fill="${h.D}" opacity=".5"/><path d="M 262 190 C 270 140 282 104 300 74" stroke="${lt(h.a,0.22)}" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`
          + [[296,120,6],[318,92,4.5],[330,140,5]].map(([x,y,r]) => flowerP(x, y, r, h.bL, '#FFF6D0', .75)).join(''))
        + hatBand(c) + hatBrim(c)
        + leafP(236, 180, -25, leaf, 28) + leafP(254, 164, -70, leaf, 24) + leafP(296, 170, 25, leaf, 22) + leafP(270, 190, 10, leaf, 20)
        + flowerP(256, 176, 17, h.b, '#FFE27A') + flowerP(284, 170, 12, lt(h.b,0.35), '#FFE27A') + flowerP(240, 158, 10, lt(h.b,0.55), '#FFE27A'); } },
  hoej: { label:'Høj hat', draw: c => {
      const h = c.hat, crown = 'M 242 208 L 234 78 Q 300 64 366 78 L 358 208 Z', brass = '#C9952E', glass = '#BFE6FF';
      let o = `<path d="${crown}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`;
      o += clipG(crown, `<path d="M 322 60 L 330 220 L 380 220 L 380 60 Z" fill="${h.D}" opacity=".5"/><path d="M 252 196 L 246 92" stroke="${lt(h.a,0.22)}" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`);
      o += `<ellipse cx="300" cy="78" rx="66" ry="12" fill="${lt(h.a,0.12)}" stroke="${h.s}" stroke-width="3"/><path d="M 252 76 Q 300 70 340 74" stroke="${lt(h.a,0.35)}" stroke-width="3" fill="none" opacity=".6"/>`;
      o += `<path d="M 239 136 Q 300 148 361 136 L 360 170 Q 300 182 240 170 Z" fill="${h.b}" stroke="${h.bs}" stroke-width="2.5"/><path d="M 330 142 Q 346 140 361 138 L 360 170 Q 346 174 330 176 Z" fill="${h.bD}" opacity=".5"/>`;
      /* briller af messing på båndet */
      o += [278, 322].map(x => `<circle cx="${x}" cy="153" r="17" fill="${fdk(brass,0.3)}"/><circle cx="${x}" cy="153" r="15" fill="${glass}" stroke="${brass}" stroke-width="5"/><path d="M ${x-8} 147 Q ${x-4} 141 ${x+2} 141" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>`).join('')
        + `<rect x="292" y="149" width="16" height="7" rx="3" fill="${brass}" stroke="${fdk(brass,0.35)}" stroke-width="1.5"/>`
        + [[278,136],[322,136],[263,153],[337,153]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${fdk(brass,0.4)}"/>`).join('');
      return o + hatBrim(c, 0.84); } },
  krone: { label:'Krone', light: true, draw: c => {
      const h = c.hat, G = '#F2C14E', Gs = '#B98516', GL = '#FFE7A0';
      const crown = 'M 252 214 Q 300 198 348 214 L 352 172 L 334 186 L 324 150 L 312 180 L 300 138 L 288 180 L 276 150 L 266 186 L 248 172 Z';
      let o = `<path d="${crown}" fill="${G}" stroke="${Gs}" stroke-width="3" stroke-linejoin="round"/>`;
      o += clipG(crown, `<path d="M 318 140 L 360 140 L 360 220 L 326 220 Z" fill="#D9A32A" opacity=".55"/><path d="M 252 200 Q 300 186 348 200 L 348 216 L 252 216 Z" fill="${Gs}" opacity=".35"/>`);
      o += `<path d="M 254 196 Q 300 182 346 196" stroke="${Gs}" stroke-width="2" fill="none"/><path d="M 258 204 Q 282 194 300 192" stroke="${GL}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
      o += [[276,150],[300,138],[324,150]].map(([x,y]) => `<circle cx="${x}" cy="${y-4}" r="5" fill="${GL}" stroke="${Gs}" stroke-width="2"/>`).join('');
      o += `<path d="M 300 188 L 310 200 L 300 212 L 290 200 Z" fill="${h.a}" stroke="${h.s}" stroke-width="2"/><path d="M 296 196 L 300 192 L 304 196" stroke="#FFF" stroke-width="2" fill="none" opacity=".8"/>`;
      o += [[272,203],[328,203]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${h.b}" stroke="${h.bs}" stroke-width="2"/><circle cx="${x-1.5}" cy="${y-1.5}" r="1.6" fill="#FFF" opacity=".85"/>`).join('');
      return o; } },
  baret: { label:'Baret', draw: c => {
      const h = c.hat, top = 'M 212 212 C 196 176 244 142 312 144 C 384 146 418 176 404 202 C 396 216 360 224 304 224 C 250 224 220 224 212 212 Z';
      let o = `<path d="${top}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`;
      o += clipG(top, `<path d="M 330 140 C 390 160 410 190 404 230 L 440 230 L 440 130 Z" fill="${h.D}" opacity=".5"/><path d="M 232 196 C 240 170 270 156 310 154" stroke="${lt(h.a,0.25)}" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/><path d="M 280 160 Q 300 190 290 220 M 340 162 Q 346 192 330 222" stroke="${h.D}" stroke-width="3" fill="none" opacity=".5"/>`);
      o += `<path d="M 226 212 Q 300 236 382 212 L 380 226 Q 300 250 228 226 Z" fill="${fdk(h.a,0.15)}" stroke="${h.s}" stroke-width="2.5" stroke-linejoin="round"/>`;
      o += `<path d="M 306 144 Q 304 132 312 128" stroke="${h.s}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      o += `<g transform="rotate(14 360 192)">${starP(360, 192, 13, h.b)}${starP(360, 192, 6, h.bL)}</g>`;
      return o; } },
  sloejfe: { label:'Stor hårsløjfe', light: true, draw: c => {
      const h = c.hat, X = 258, Y = 188;
      let o = `<path d="M ${X-4} ${Y+6} Q ${X-20} ${Y+36} ${X-30} ${Y+58} L ${X-16} ${Y+56} L ${X-12} ${Y+70} Q ${X-2} ${Y+38} ${X+6} ${Y+8} Z M ${X+6} ${Y+6} Q ${X+18} ${Y+30} ${X+34} ${Y+50} L ${X+20} ${Y+50} L ${X+18} ${Y+64} Q ${X+6} ${Y+36} ${X-2} ${Y+8} Z" fill="${fdk(h.a,0.08)}" stroke="${h.s}" stroke-width="2.5" stroke-linejoin="round"/>`;
      const loops = `M ${X} ${Y} C ${X-30} ${Y-40} ${X-74} ${Y-30} ${X-68} ${Y+2} C ${X-62} ${Y+30} ${X-24} ${Y+22} ${X} ${Y+8} Z M ${X+2} ${Y} C ${X+30} ${Y-44} ${X+76} ${Y-36} ${X+72} ${Y-2} C ${X+68} ${Y+28} ${X+28} ${Y+22} ${X+2} ${Y+8} Z`;
      o += `<path d="${loops}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`;
      o += clipG(loops, [[X-46,Y-10],[X-30,Y+8],[X-52,Y+10],[X+36,Y-18],[X+54,Y-4],[X+30,Y+4],[X+50,Y+14],[X-30,Y-18]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${h.b}"/>`).join('')
        + `<path d="M ${X+10} ${Y+10} C ${X+40} ${Y+20} ${X+70} ${Y+10} ${X+80} ${Y-20} L ${X+90} ${Y+30} L ${X+10} ${Y+30} Z" fill="${h.D}" opacity=".45"/>`);
      o += `<path d="M ${X-8} ${Y-4} C ${X-30} ${Y-28} ${X-56} ${Y-24} ${X-58} ${Y-6}" stroke="${lt(h.a,0.35)}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
      o += `<ellipse cx="${X+1}" cy="${Y+4}" rx="12" ry="14" fill="${h.a}" stroke="${h.s}" stroke-width="3"/><path d="M ${X-5} ${Y-2} Q ${X+1} ${Y-6} ${X+7} ${Y-2}" stroke="${lt(h.a,0.4)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      return o; } },
  hue: { label:'Nathue', draw: c => {
      const h = c.hat, body = 'M 204 240 C 208 172 258 132 306 130 C 350 132 384 160 396 210 L 400 240 Z';
      return `<path d="${body}" fill="${h.a}" stroke="${h.s}" stroke-width="3" stroke-linejoin="round"/>`
        + clipG(body, `<path d="M 330 130 C 360 160 372 200 392 240 L 420 240 L 420 120 Z" fill="${h.D}" opacity=".5"/><path d="M 244 214 C 248 178 266 152 296 142" stroke="${lt(h.a,0.22)}" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>`
          + [[260,170],[300,160],[332,190],[284,206],[248,218]].map(([x,y]) => twinkle(x, y, 6, h.bL)).join(''))
        + `<path d="M 198 226 Q 300 198 402 226 L 406 256 Q 300 230 194 256 Z" fill="${h.b}" stroke="${h.bs}" stroke-width="2.5" stroke-linejoin="round"/>`
        + `<path d="M 220 238 Q 300 218 380 238" stroke="${h.bL}" stroke-width="2" fill="none" stroke-dasharray="3 5"/><path d="M 344 222 Q 370 224 400 228 L 404 252 Q 370 244 346 242 Z" fill="${h.bD}" opacity=".5"/>`
        + `<path d="${CAP_TAIL}" fill="${h.a}"/><path d="${CAP_TAIL.replace(/ Z$/, '').replace(/^M 330 140 C 372 150 400 186 412 222/, 'M 404 204 C 408 210 410 216 412 222')}" fill="none" stroke="${h.s}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
        + clipG(CAP_TAIL, `<path d="M 380 150 C 410 200 420 250 460 300 L 470 300 L 470 140 Z" fill="${h.D}" opacity=".55"/><path d="M 352 156 C 380 176 392 206 400 232" stroke="${lt(h.a,0.25)}" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>` + twinkle(392, 236, 5, h.bL))
        + `<circle cx="452" cy="300" r="16" fill="${h.b}" stroke="${h.bs}" stroke-width="2.5"/><circle cx="447" cy="294" r="5" fill="${h.bL}"/>`; } },
};

/* ================= ANSIGT (hovedets mål) ================= */
const FACE = 'M 222 292 C 220 240 252 206 300 206 C 348 206 380 240 378 292 C 377 338 346 380 300 384 C 254 380 223 338 222 292 Z';
const PUPILS = { rund:'Runde', glimt:'Glimt', stjerne:'Stjerner', hjerte:'Hjerter', maane:'Måner', diamant:'Diamanter', blomst:'Blomster', kat:'Katteøjne', spiral:'Snurrende', stor:'Store og blanke' };
const LIPSHAPES = { smil:'Smil', grin:'Stort grin', pust:'Lille mund', tunge:'Rækker tunge', kys:'Kyssemund', kysstor:'Store kyslæber', skaev:'Skævt smil', oh:'Overrasket', tand:'Små hjørnetænder', kat:'Kattemund', glad:'Bredt smil' };
const MARKS = { ingen:'Intet', fregner:'Fregner', hjerte:'Hjerte', stjerne:'Stjerne', glimmer:'Glimmer', ar:'Ar', plaster:'Plaster', maane:'Måne', maling:'Ansigtsmaling', prik:'Skønhedsplet' };
function eyeLook(){
  if (!IDLE || !ANIM) return '';
  const pts = trackPoints('look', e => e.d * 3.5);
  return `<animateTransform attributeName="transform" type="translate" values="${pts.map(p => p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p => (p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>`;
}
function eyeOne(c, x, f){
  let p;
  if (c.pupil === 'stjerne') p = starP(0, 4, 9, INK);
  else if (c.pupil === 'hjerte') p = heart(0, 6, 0.95, INK);
  else if (c.pupil === 'glimt') p = `<circle cy="4" r="5.5" fill="${INK}"/>`;
  else if (c.pupil === 'maane') p = moon(1, 4, 9, INK);
  else if (c.pupil === 'diamant') p = `<path d="M 0 -6 L 8 4 L 0 14 L -8 4 Z" fill="${INK}"/>`;
  else if (c.pupil === 'blomst') p = flowerP(0, 4, 9, INK, lt(c.eye,0.35));
  else if (c.pupil === 'kat') p = `<ellipse cy="4" rx="3.4" ry="11.5" fill="${INK}"/>`;
  else if (c.pupil === 'spiral') p = `<path d="M 0 4 m 0 0 q 3 -3 5 0 q 2 5 -5 7 q -8 1 -9 -7 q 0 -10 10 -10 q 11 1 11 12" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if (c.pupil === 'stor') p = `<circle cy="4" r="10" fill="${INK}"/>`;
  else p = `<circle cy="4" r="7" fill="${INK}"/>`;
  const shine = c.pupil === 'stor' ? `<circle cx="-5" cy="-3" r="6" fill="#FFF"/><circle cx="6" cy="9" r="3" fill="#FFF" opacity=".9"/><circle cx="-8" cy="8" r="1.6" fill="#FFF" opacity=".8"/>` : c.pupil === 'glimt' ? twinkle(-4, -3, 7, '#FFF') + `<circle cx="6" cy="9" r="2.2" fill="#FFF"/>` : `<circle cx="-5" cy="-3" r="4.8" fill="#FFF"/><circle cx="5" cy="8" r="2.2" fill="#FFF" opacity=".9"/>`;
  return `<g transform="translate(${x},304)"><ellipse rx="17" ry="20" fill="#FFF"/><ellipse cy="-8" rx="17" ry="10" fill="${c.skS}" opacity=".18"/>`
    + `<g>${eyeLook()}<circle cy="3" r="14.5" fill="url(#irisF)" stroke="${fdk(c.eye,0.45)}" stroke-width="1.5"/>${p}${shine}</g>`
    + `<path d="M -19 -6 Q 0 -27 19 -6" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M ${17*f} -8 l ${6*f} -5 M ${12*f} -14 l ${4*f} -6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M -12 16 Q 0 22 12 16" stroke="${c.sk}" stroke-width="1.6" fill="none" opacity=".7"/>`
    + blinkLid(`<ellipse rx="20" ry="23" fill="${c.skin}"/><path d="M -19 2 Q 0 14 19 2" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M ${17*f} 2 l ${6*f} 3" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`, 4.4, 0.6)
    + `</g>`;
}
function mouthF(c){
  const L = c.lips, Ld = fdk(L,0.3);
  if (c.lipShape === 'grin') return `<path d="M 282 340 Q 300 346 318 340 Q 316 366 300 367 Q 284 366 282 340 Z" fill="${fdk(L,0.45)}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 286 342 Q 300 346 314 342 L 313 349 Q 300 351 287 349 Z" fill="#FFF"/><path d="M 291 360 Q 300 354 309 360 Q 300 366 291 360 Z" fill="${lt(L,0.35)}"/>`;
  const dimp = `<path d="M 281 341 q 2 -2 4 0 M 315 341 q 2 -2 4 0" stroke="${c.sk}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  if (c.lipShape === 'tunge') return `<path d="M 284 342 Q 300 362 316 342 Q 300 350 284 342 Z" fill="${fdk(L,0.45)}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 292 350 Q 290 366 300 368 Q 310 366 308 350 Z" fill="#FF8FA3" stroke="${fdk('#FF8FA3',0.35)}" stroke-width="1.8"/><path d="M 300 352 L 300 362" stroke="${fdk('#FF8FA3',0.3)}" stroke-width="1.5" stroke-linecap="round"/>` + dimp;
  if (c.lipShape === 'kys') return `<path d="M 294 340 Q 300 336 306 340 Q 310 346 306 352 Q 300 356 294 352 Q 290 346 294 340 Z" fill="${L}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 295 346 Q 300 344 305 346" stroke="${Ld}" stroke-width="1.6" fill="none"/><path d="M 296 343 Q 299 341 302 342" stroke="${lt(L,0.5)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` + heart(322, 330, 0.5, lt(L,0.2));
  if (c.lipShape === 'kysstor') return `<path d="M 284 345 Q 290 333 297 337 Q 300 339 303 337 Q 310 333 316 345 Q 300 349 284 345 Z" fill="${L}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 284 345 Q 300 349 316 345 Q 312 362 300 363 Q 288 362 284 345 Z" fill="${lt(L,0.08)}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 286 345 Q 300 350 314 345" stroke="${Ld}" stroke-width="1.6" fill="none"/><path d="M 292 354 Q 300 358 307 354" stroke="${lt(L,0.5)}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 289 339 Q 292 336 295 338" stroke="${lt(L,0.5)}" stroke-width="2" fill="none" stroke-linecap="round"/>` + heart(326, 330, 0.6, lt(L,0.2));
  if (c.lipShape === 'skaev') return `<path d="M 286 346 Q 302 360 318 338 Q 302 352 286 346 Z" fill="${L}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 316 337 q 3 -1 4 2" stroke="${c.sk}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  if (c.lipShape === 'oh') return `<ellipse cx="300" cy="350" rx="8" ry="10" fill="${fdk(L,0.45)}" stroke="${Ld}" stroke-width="2.4"/><path d="M 294 356 Q 300 352 306 356 Q 300 360 294 356 Z" fill="${lt(L,0.35)}"/>`;
  if (c.lipShape === 'tand') return `<path d="M 284 342 Q 300 362 316 342 Q 300 350 284 342 Z" fill="${fdk(L,0.45)}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 289 345 L 292 353 L 295 346 Z M 311 345 L 308 353 L 305 346 Z" fill="#FFF" stroke="${c.sk}" stroke-width="1" stroke-linejoin="round"/>` + dimp;
  if (c.lipShape === 'kat') return `<path d="M 286 342 Q 292 352 300 344 Q 308 352 314 342" stroke="${Ld}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M 296 341 L 304 341 L 300 345 Z" fill="${lt(L,0.2)}"/>`;
  if (c.lipShape === 'glad') return `<path d="M 278 338 Q 300 366 322 338 Q 300 348 278 338 Z" fill="${L}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 290 350 Q 300 356 310 350" stroke="${lt(L,0.45)}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 274 336 q 2 -3 5 -1 M 321 335 q 3 -2 5 1" stroke="${c.sk}" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="272" cy="346" r="2" fill="${c.sk}" opacity=".35"/><circle cx="328" cy="346" r="2" fill="${c.sk}" opacity=".35"/>`;
  if (c.lipShape === 'pust') return `<path d="M 292 346 Q 300 354 308 346 Q 300 350 292 346 Z" fill="${L}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 289 345 q 2 -2 4 0 M 307 345 q 2 -2 4 0" stroke="${c.sk}" stroke-width="1.5" fill="none"/>`;
  return `<path d="M 284 342 Q 300 362 316 342 Q 300 350 284 342 Z" fill="${L}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 292 352 Q 300 357 308 352" stroke="${lt(L,0.45)}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 281 341 q 2 -2 4 0 M 315 341 q 2 -2 4 0" stroke="${c.sk}" stroke-width="1.5" fill="none"/>`;
}
function markF(c){
  const m = c.markColor;
  switch (c.mark){
    case 'fregner': return [[245,334],[253,330],[261,335],[249,341],[258,342],[355,334],[347,330],[339,335],[351,341],[342,342]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="${m}" opacity=".75"/>`).join('');
    case 'hjerte': return heart(346, 337, 0.75, m);
    case 'stjerne': return starP(346, 336, 8, m);
    case 'glimmer': return twinkle(347, 334, 7, m) + twinkle(337, 342, 3.5, m) + twinkle(357, 343, 3, m) + twinkle(254, 336, 4, m);
    case 'ar': { const S = mixC(c.skin, '#B84A5E', 0.35); return `<path d="M 334 328 L 352 346" stroke="${S}" stroke-width="3.2" stroke-linecap="round"/><path d="M 335 330 L 351 344" stroke="${lt(S,0.4)}" stroke-width="1" stroke-linecap="round"/>` + [[338,332],[343,337],[348,342]].map(([x,y]) => `<path d="M ${x-4} ${y+3.5} L ${x+4} ${y-3.5}" stroke="${S}" stroke-width="2" stroke-linecap="round"/>`).join(''); }
    case 'plaster': return `<g transform="rotate(-28 348 336)"><rect x="330" y="329" width="36" height="14" rx="7" fill="${lt(m,0.55)}" stroke="${fdk(m,0.2)}" stroke-width="1.6"/><rect x="342" y="329" width="12" height="14" fill="${lt(m,0.25)}"/>${[[337,334],[337,339],[359,334],[359,339]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1" fill="${fdk(m,0.25)}"/>`).join('')}</g>`;
    case 'maane': return moon(348, 340, 7.5, m) + twinkle(338, 331, 3, m);
    case 'maling': return [[256,-1],[344,1]].map(([x,f]) => [0, 9].map(dy => `<path d="M ${x - 12*f} ${328+dy} Q ${x} ${324+dy} ${x + 12*f} ${330+dy}" stroke="${m}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>`).join('')).join('');
    case 'prik': return `<circle cx="290" cy="336" r="1.9" fill="${m}"/>`;
    default: return '';
  }
}
function faceF(c, hl, frontD){
  let s = `<path d="${FACE}" fill="${c.skin}" stroke="${c.sk}" stroke-width="3"/>`;
  s += clipG(FACE, `<path d="${frontD}" transform="translate(0,9)" fill="${c.skS}" opacity=".55"/><path d="M 352 250 Q 384 300 360 368 L 400 380 L 400 240 Z" fill="${c.skS}" opacity=".4"/>`
    + (c.blush ? `<ellipse cx="254" cy="336" rx="18" ry="11" fill="${c.blush}" opacity=".4"/><ellipse cx="346" cy="336" rx="18" ry="11" fill="${c.blush}" opacity=".32"/>` : ''));
  s += HLW(hl === 'pupil', eyeOne(c, 266, -1) + eyeOne(c, 334, 1));
  s += `<path d="M 246 266 Q 264 256 282 262 M 318 262 Q 336 256 354 266" stroke="${c.hs}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M 300 316 Q 296 326 302 328" stroke="${c.skS}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
  return s + HLW(hl === 'lip', mouthF(c)) + HLW(hl === 'mark', markF(c));
}

/* ================= KJOLER ================= */
/* små mønstre til kjoler og kapper */
function flowerP(x, y, r, col, mid, op=1){
  let o = `<g opacity="${op}">`;
  for (let i = 0; i < 5; i++){ const a = -Math.PI/2 + i*2*Math.PI/5; o += `<circle cx="${(x + Math.cos(a)*r*0.58).toFixed(1)}" cy="${(y + Math.sin(a)*r*0.58).toFixed(1)}" r="${(r*0.48).toFixed(1)}" fill="${col}"/>`; }
  return o + `<circle cx="${x}" cy="${y}" r="${(r*0.36).toFixed(1)}" fill="${mid}"/></g>`;
}
const leafP = (x, y, a, col, len=14) => `<ellipse cx="${x}" cy="${y}" rx="${len/2}" ry="${len/4.2}" transform="rotate(${a} ${x} ${y})" fill="${col}"/>`;
const ROBE_LONG = 'M 246 410 Q 300 398 354 410 L 350 520 Q 400 640 432 784 Q 412 800 392 790 Q 372 806 350 794 Q 326 810 302 798 Q 278 810 252 796 Q 230 808 210 792 Q 188 802 168 786 Q 200 640 250 520 Z';
const ROBE_SHORT = 'M 246 410 Q 300 398 354 410 L 350 520 Q 382 590 398 680 Q 380 694 362 686 Q 342 698 322 688 Q 300 700 278 688 Q 258 698 238 686 Q 220 694 202 680 Q 218 590 250 520 Z';
const SLEEVE_L = 'M 252 420 C 220 440 200 500 190 562 Q 216 584 246 570 C 246 522 256 482 270 458 Z';
const SLEEVE_R = 'M 348 420 C 386 436 414 484 428 530 Q 412 552 388 548 C 378 506 362 474 332 456 Z';
function hemBand(c, y){
  const r = c.robe, w = (dy) => `M 150 ${y+10+dy} Q 172 ${y+22+dy} 196 ${y+14+dy} Q 218 ${y+30+dy} 244 ${y+18+dy} Q 272 ${y+32+dy} 302 ${y+20+dy} Q 328 ${y+32+dy} 354 ${y+16+dy} Q 380 ${y+28+dy} 404 ${y+12+dy} Q 428 ${y+22+dy} 452 ${y+6+dy}`;
  return `<path d="${w(0)} L 460 ${y+60} L 140 ${y+60} Z" fill="${r.b}" stroke="${r.bs}" stroke-width="2"/><path d="${w(8)}" stroke="${r.bL}" stroke-width="2" fill="none"/>`;
}
function robeFolds(c, yEnd){
  const r = c.robe, k = (yEnd - 548) / 252;
  return [[262,226,-1],[300,302,0],[336,372,1],[284,262,-0.5],[318,342,0.5]].map(([x1,x2]) => { const y1 = x1 === 284 || x1 === 318 ? 560 : 548, xx2 = 300 + (x2-300)*k, y2 = yEnd;
    return `<path d="M ${x1} ${y1} Q ${(x1+xx2)/2 - 6} ${(y1+y2)/2} ${xx2-10} ${y2} L ${xx2+10} ${y2} Q ${(x1+xx2)/2 + 4} ${(y1+y2)/2} ${x1+2} ${y1} Z" fill="${r.D}" opacity=".38"/>`
      + `<path d="M ${x1-3} ${y1+6} Q ${(x1+xx2)/2 - 12} ${(y1+y2)/2} ${xx2-16} ${y2}" stroke="${r.L}" stroke-width="2.5" fill="none" opacity=".55"/>`; }).join('');
}
const ROBES = {
  stjerner: { label:'Stjernekjole', deco: c => starP(236,700,9,c.robe.b,.85) + starP(350,650,7,c.robe.b,.7) + starP(322,742,8,c.robe.b,.75) + starP(270,616,6,c.robe.b,.85) + starP(388,722,6,c.robe.b,.6) + starP(208,760,5,c.robe.b,.8) },
  maane: { label:'Månekjole', deco: c => moon(240,690,10,c.robe.b,.85) + moon(344,640,8,c.robe.b,.7) + moon(316,744,9,c.robe.b,.75) + moon(276,610,7,c.robe.b,.8)
      + [[262,660],[300,700],[372,700],[224,740],[296,624],[350,590],[260,580]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${c.robe.b}" opacity=".7"/>`).join('') },
  knapper: { label:'Kjole med knapper', deco: c => `<path d="M 300 420 L 302 790" stroke="${c.robe.s}" stroke-width="3" opacity=".6"/><path d="M 296 420 L 298 790" stroke="${c.robe.L}" stroke-width="2" opacity=".6"/>`
      + [440,476,580,630,680,730].map(y => `<circle cx="${(300 + (y-420)*0.005).toFixed(1)}" cy="${y}" r="7" fill="${c.robe.b}" stroke="${c.robe.bs}" stroke-width="2"/><circle cx="${(298 + (y-420)*0.005).toFixed(1)}" cy="${y-2}" r="2" fill="#FFF" opacity=".8"/>`).join('') },
  lag: { label:'Lagkjole', deco: c => [600, 690].map(y => { const w = (dy) => `M 160 ${y+dy} Q 190 ${y+16+dy} 220 ${y+4+dy} Q 250 ${y+20+dy} 280 ${y+6+dy} Q 310 ${y+22+dy} 340 ${y+6+dy} Q 370 ${y+20+dy} 400 ${y+2+dy} Q 424 ${y+14+dy} 450 ${y-2+dy}`;
      return `<path d="${w(0)} L 460 ${y+60} L 140 ${y+60} Z" fill="${c.robe.L}" opacity=".45"/><path d="${w(0)}" stroke="${c.robe.b}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${w(7)}" stroke="${c.robe.bL}" stroke-width="2" fill="none" stroke-dasharray="3 5"/>`; }).join('') },
  blomster: { label:'Blomsterkjole', deco: c => { const r = c.robe, leaf = mixC('#5FB86A', r.a, 0.2), mid = lt(r.b, 0.65);
      const F = [[236,690,15],[350,640,12],[318,744,14],[270,604,11],[392,716,11],[204,756,10],[300,556,9],[366,782,9],[246,520,8],[372,560,8]];
      return F.map(([x,y,rr], i) => leafP(x + rr*0.9, y + rr*0.6, 30 + i*17, leaf, rr*1.3) + leafP(x - rr*0.9, y + rr*0.5, -40 - i*11, leaf, rr*1.1) + flowerP(x, y, rr, r.b, mid, .95)).join(''); } },
  striber: { label:'Stribet kjole', deco: c => { const r = c.robe; let o = '';
      for (let y = 470; y < 800; y += 46){ const k = (y - 470) / 330, sag = 10 + k * 14, h = 15 + k * 4;
        o += `<path d="M 120 ${y} Q 300 ${y + sag} 480 ${y} L 480 ${y + h} Q 300 ${y + sag + h} 120 ${y + h} Z" fill="${r.b}" opacity=".88"/><path d="M 120 ${y + 3} Q 300 ${y + sag + 3} 480 ${y + 3}" stroke="${r.bL}" stroke-width="2" fill="none" opacity=".7"/>`; }
      return o; } },
  forklaede: { label:'Kjole med forklæde', deco: c => { const r = c.robe, A = '#FFF8EE', As = '#D9C3A6', Ad = '#EADBC4';
      const ap = 'M 254 528 Q 300 536 346 528 L 374 706 Q 300 728 226 706 Z';
      let o = `<path d="${ap}" fill="${A}" stroke="${As}" stroke-width="2.5" stroke-linejoin="round"/>`;
      o += `<path d="M 320 534 L 346 530 L 374 706 Q 352 714 330 718 Z" fill="${Ad}" opacity=".7"/>`;
      /* flæse forneden */
      o += Array.from({ length: 8 }, (_, i) => { const x = 230 + i*18.6, y = 708 + Math.sin(i/7*Math.PI)*12; return `<path d="M ${x} ${y-4} q 9.3 18 18.6 0" fill="${A}" stroke="${As}" stroke-width="2"/>`; }).join('');
      o += `<path d="M 236 700 Q 300 720 364 700" stroke="${r.b}" stroke-width="3" fill="none" stroke-dasharray="3 6" stroke-linecap="round"/>`;
      /* lomme med et hjerte */
      o += `<path d="M 270 608 L 330 608 L 328 646 Q 300 656 272 646 Z" fill="${A}" stroke="${As}" stroke-width="2.5" stroke-linejoin="round"/><path d="M 272 616 L 328 616" stroke="${As}" stroke-width="1.8" stroke-dasharray="3 4"/>` + heart(300, 634, 1.1, r.b);
      /* linning og bånd */
      o += `<path d="M 248 518 Q 300 530 352 518 L 352 536 Q 300 548 248 536 Z" fill="${r.b}" stroke="${r.bs}" stroke-width="2"/><path d="M 340 534 Q 346 560 338 588 M 350 532 Q 362 556 360 580" stroke="${r.b}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      return o; } },
  hjerter: { label:'Hjertekjole', deco: c => { const r = c.robe;
      return [[236,690,1.5],[350,640,1.2],[318,744,1.4],[270,604,1.1],[392,716,1.1],[206,756,1],[300,556,.9],[366,782,.9],[250,520,.8],[372,562,.8],[290,660,.9],[196,640,.8],[404,650,.8]]
        .map(([x,y,k], i) => `<g transform="rotate(${(i % 2 ? 1 : -1) * 10} ${x} ${y})">${heart(x, y, k * 1.6, i % 3 === 2 ? r.bL : r.b)}</g>`).join(''); } },
  sloejfe: { label:'Kjole med sløjfe', deco: c => [[236,700],[364,690],[300,760],[214,760],[388,762],[250,620],[352,610]].map(([x,y]) => starP(x, y, 6, c.robe.b, .6)).join(''),
    /* sløjfen sidder foran på brystet, oven på krave og bælte */
    over: c => { const r = c.robe, B = r.b, Bs = r.bs, BL = r.bL, Y = 474;
      let o = `<path d="M 294 ${Y+4} Q 284 ${Y+50} 272 ${Y+104} L 286 ${Y+98} L 293 ${Y+112} Q 300 ${Y+60} 304 ${Y+6} Z M 306 ${Y+4} Q 316 ${Y+50} 330 ${Y+100} L 316 ${Y+96} L 312 ${Y+110} Q 306 ${Y+60} 296 ${Y+6} Z" fill="${B}" stroke="${Bs}" stroke-width="2.5" stroke-linejoin="round"/>`;
      o += `<path d="M 298 ${Y} C 274 ${Y-26} 246 ${Y-20} 248 ${Y} C 250 ${Y+20} 276 ${Y+24} 298 ${Y+8} Z M 302 ${Y} C 326 ${Y-26} 354 ${Y-20} 352 ${Y} C 350 ${Y+20} 324 ${Y+24} 302 ${Y+8} Z" fill="${B}" stroke="${Bs}" stroke-width="2.5" stroke-linejoin="round"/>`;
      o += `<path d="M 292 ${Y-4} C 278 ${Y-14} 262 ${Y-12} 260 ${Y-2} M 308 ${Y-4} C 322 ${Y-14} 338 ${Y-12} 340 ${Y-2}" stroke="${BL}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      return o + `<rect x="291" y="${Y-7}" width="18" height="20" rx="6" fill="${B}" stroke="${Bs}" stroke-width="2.5"/><path d="M 295 ${Y-1} L 305 ${Y-1}" stroke="${BL}" stroke-width="2" stroke-linecap="round"/>`; } },
  prikker: { label:'Prikket kort kjole', short: true, deco: c => { const r = c.robe; let o = '';
      for (let row = 0; row < 9; row++) for (let col = 0; col < 10; col++){ const x = 150 + col*34 + (row % 2 ? 17 : 0), y = 466 + row*28; o += `<circle cx="${x}" cy="${y}" r="6.5" fill="${r.b}" opacity=".9"/><circle cx="${x-2}" cy="${y-2}" r="2" fill="${r.bL}" opacity=".8"/>`; }
      return o; } },
  kort: { label:'Kort kjole', short: true, deco: c => starP(240,620,6,c.robe.b,.85) + starP(330,600,5,c.robe.b,.7) + starP(286,654,6,c.robe.b,.8) + starP(370,650,5,c.robe.b,.6) },
};
function robeF(c, robe){
  const r = c.robe, D = robe.short ? ROBE_SHORT : ROBE_LONG, hem = robe.short ? 656 : 768;
  return `<path d="${D}" fill="${r.a}" stroke="${r.s}" stroke-width="3" stroke-linejoin="round"/>`
    + clipG(D, `<path d="M 318 400 C 330 520 368 640 400 800 L 460 800 L 460 400 Z" fill="${r.D}" opacity=".5"/>`
      + `<path d="M 230 440 L 370 440 L 370 470 Q 300 486 230 470 Z" fill="${r.D}" opacity=".45"/>`
      + robeFolds(c, robe.short ? 700 : 800) + `<path d="M 238 420 Q 236 470 246 510" stroke="${r.L}" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>`
      + robe.deco(c) + hemBand(c, hem))
    + `<path d="${D}" fill="none" stroke="${r.s}" stroke-width="3" stroke-linejoin="round"/>`;
}

/* ================= KAPPER (bag kroppen) ================= */
const CAPE_LONG = 'M 238 410 C 196 520, 158 680, 146 820 Q 176 830 200 822 Q 230 834 260 826 L 340 826 Q 370 834 400 822 Q 426 830 454 820 C 442 680, 404 520, 362 410 Z';
const CAPE_SHORT = 'M 238 410 C 214 460, 196 520, 186 590 Q 214 602 244 594 L 356 594 Q 386 602 414 590 C 404 520, 386 460, 362 410 Z';
const HOOD = 'M 192 424 C 156 340 188 214 300 204 C 412 214 444 340 408 424 Z';
function capeBody(c, D, bottom, stars, zig){
  const k = c.cape;
  return `<path d="${D}" fill="${k.a}" stroke="${k.s}" stroke-width="3" stroke-linejoin="round"/>`
    + clipG(D, `<path d="M 330 400 C 380 520 420 680 460 830 L 520 830 L 520 400 Z" fill="${k.D}" opacity=".55"/>`
      + `<path d="M 238 410 C 214 520 188 660 180 ${bottom+8} L 214 ${bottom+10} C 222 660 240 520 258 420 Z" fill="${k.b}"/><path d="M 238 410 C 220 520 200 660 196 ${bottom+8}" stroke="${k.bD}" stroke-width="5" fill="none" opacity=".6"/>`
      + `<path d="M 410 520 Q 424 680 432 ${bottom+6} M 384 560 Q 398 700 404 ${bottom+6}" stroke="${k.D}" stroke-width="4" fill="none" opacity=".7"/>`
      + (stars === true ? [[170,640],[196,520],[420,600],[440,740],[178,770],[410,470]].map(([x,y],i) => starP(x, y, i % 2 ? 6 : 8, k.b, .85)).join('') : typeof stars === 'function' ? stars(k) : '')
      + (zig ? `<path d="${zig}" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round" stroke-linejoin="round"/>`
             : `<path d="M 140 ${bottom-8} Q 200 ${bottom+4} 300 ${bottom-2} Q 400 ${bottom+4} 460 ${bottom-8}" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>`));
}
/* hætten oppe (kun uden hat): foret bag hovedet, kanten om ansigtet foran håret (hovedets mål) */
const HOOD_OUT = 'M 196 392 C 176 330 180 262 200 220 C 222 176 262 156 300 140 C 338 156 378 176 400 220 C 420 262 424 330 404 392 Q 300 424 196 392 Z';
const HOOD_IN = 'M 228 372 C 208 320 210 248 246 220 C 268 204 286 200 300 200 C 314 200 332 204 354 220 C 390 248 392 320 372 372 Q 300 400 228 372 Z';
function hoodBack(c){ const k = c.cape; return `<path d="${HOOD_OUT}" fill="${sd(k.b,0.35)}" stroke="${k.s}" stroke-width="3"/>`; }
function hoodFront(c){
  const k = c.cape, rim = HOOD_OUT.replace(/ Z$/, '') + ' ' + HOOD_IN.replace(/^M /, 'M ').replace(/ Z$/, ' Z');
  let o = `<path d="${rim}" fill="${k.a}" fill-rule="evenodd" stroke="${k.s}" stroke-width="3" stroke-linejoin="round"/>`;
  o += clipG(HOOD_OUT, `<path d="M 300 140 C 360 160 420 240 412 400 L 440 400 L 440 130 Z" fill="${k.D}" opacity=".45"/>`
    + `<path d="M 214 330 C 206 280 214 236 240 206 M 386 330 C 394 280 386 236 360 206 M 300 144 C 296 168 300 186 300 200" stroke="${k.D}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`
    + `<path d="M 206 300 C 204 250 228 196 290 160" stroke="${lt(k.a,0.3)}" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>`);
  o += `<path d="${HOOD_IN}" fill="none" stroke="${k.b}" stroke-width="5"/><path d="${HOOD_IN}" fill="none" stroke="${k.s}" stroke-width="2"/>`;
  return o;
}
/* takket kappe: spidser forneden som flagermusvinger */
const CAPE_ZIG = 'M 238 410 C 196 520, 158 680, 146 822 L 176 790 L 204 830 L 236 794 L 268 832 L 300 796 L 332 832 L 364 794 L 396 830 L 424 790 L 454 822 C 442 680, 404 520, 362 410 Z';
const CAPE_ZIG_HEM = 'M 154 810 L 176 780 L 204 818 L 236 784 L 268 820 L 300 786 L 332 820 L 364 784 L 396 818 L 424 780 L 446 810';
const CAPES = {
  ingen: { label:'Ingen kappe' },
  lang: { label:'Lang kappe', back: c => capeBody(c, CAPE_LONG, 820) },
  kort: { label:'Kort slag', back: c => capeBody(c, CAPE_SHORT, 594) },
  haette: { label:'Kappe med hætte', back: c => capeBody(c, CAPE_LONG, 820) },
  stjerner: { label:'Stjernekappe', back: c => capeBody(c, CAPE_LONG, 820, true) },
  maane: { label:'Månekappe', back: c => capeBody(c, CAPE_LONG, 820, k => [[172,640,10],[198,520,8],[420,600,9],[440,744,10],[180,770,8],[410,470,7]].map(([x,y,r],i) => moon(x, y, r, k.b, .9) + twinkle(x + (i % 2 ? -16 : 16), y - 14, 4, k.b)).join('')) },
  takket: { label:'Takket kappe', back: c => capeBody(c, CAPE_ZIG, 820, false, CAPE_ZIG_HEM) },
  blomster: { label:'Blomsterkappe', back: c => capeBody(c, CAPE_LONG, 820, k => { const leaf = mixC('#5FB86A', k.a, 0.25);
      return [[172,640,12],[198,520,9],[420,600,11],[440,744,12],[180,770,10],[410,470,8],[430,680,7]].map(([x,y,r],i) => leafP(x + r, y + r*0.6, 30 + i*20, leaf, r*1.4) + flowerP(x, y, r, k.b, lt(k.b,0.6))).join(''); }) },
  stribet: { label:'Stribet kappe', back: c => capeBody(c, CAPE_LONG, 820, k => [150, 196, 404, 446].map(x => `<path d="M ${x+(x<300?40:-40)} 410 L ${x} 830 L ${x+18} 830 L ${x+(x<300?52:-28)} 410 Z" fill="${k.b}" opacity=".75"/>`).join('')) },
  pelskant: { label:'Kappe med pelskant', back: c => capeBody(c, CAPE_LONG, 820, k => {
      const F = '#FFF6E8', Fs = '#D9C7B0'; let o = '';
      for (let i = 0; i <= 20; i++){ const t = i / 20, x = 146 + t * 308, y = 810 + Math.sin(t * Math.PI) * 10 + (i % 2 ? 4 : 0); o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="${F}" stroke="${Fs}" stroke-width="2"/>`; }
      return o + [[200,812],[300,820],[400,812]].map(([x,y]) => `<path d="M ${x} ${y+2} l 0 6" stroke="#5A4A3A" stroke-width="3" stroke-linecap="round" opacity=".6"/>`).join(''); }) },
};

/* ================= STØVLER ================= */
function bootOne(c, f, kind){
  const B = c.boots.a, bx = 300 + f*36, bD = sd(B,0.35), bL = lt(B,0.3), bk = fdk(B,0.4), x = c.boots.b;
  let b = `<g transform="translate(${bx},0) scale(${f},1)">`;
  if (kind === 'spidse'){
    b += `<path d="M -18 832 L 14 832 Q 30 836 44 842 Q 56 842 60 828 Q 68 842 58 854 Q 48 862 30 860 L -20 860 Q -26 860 -24 850 L -22 838 Q -22 832 -18 832 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 10 834 Q 28 840 44 846 Q 54 846 58 834 Q 60 848 50 854 Q 30 856 14 848 Z" fill="${bD}" opacity=".55"/><path d="M -24 854 L 46 854 Q 40 862 30 862 L -20 862 Q -26 862 -24 854 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M -20 834 Q 0 828 16 836 L 16 842 Q 0 836 -20 840 Z" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/><circle cx="60" cy="828" r="4.5" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/>`;
  } else if (kind === 'hoeje'){
    b += `<path d="M -21 768 Q 0 760 21 768 L 20 836 Q 36 840 40 850 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -24 790 Q -24 774 -21 768 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 6 768 L 20 768 L 20 836 Q 32 840 36 848 L 20 848 Q 8 820 6 768 Z" fill="${bD}" opacity=".6"/><path d="M -24 852 L 40 852 Q 40 860 30 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M -23 766 Q 0 756 23 766 L 23 782 Q 0 772 -23 782 Z" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="2"/><path d="M -24 806 L 22 806 L 22 816 L -24 816 Z" fill="${fdk(B,0.2)}"/><rect x="6" y="802" width="11" height="18" rx="2" fill="none" stroke="${x}" stroke-width="3"/><path d="M 11.5 804 L 11.5 818" stroke="${x}" stroke-width="2"/>`;
    b += `<path d="M -16 790 Q -12 820 -14 840" stroke="${bL}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  } else if (kind === 'ballerina'){
    /* bånd snøret op om anklen, en flad sko med sløjfe */
    /* båndene følger benet, der sidder lidt inde i forhold til skoens midte */
    b += [[836,816],[816,796],[796,778]].map(([y1,y2]) => { const d = `M -14 ${y1} L 8 ${y2} M 8 ${y1} L -14 ${y2}`; return `<path d="${d}" stroke="${fdk(x,0.3)}" stroke-width="5.5" stroke-linecap="round"/><path d="${d}" stroke="${x}" stroke-width="3.5" stroke-linecap="round"/>`; }).join('');
    b += `<path d="M -20 838 Q 0 830 18 836 Q 34 838 40 848 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -22 842 Q -22 838 -20 838 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M -16 842 Q 4 836 20 842 Q 30 846 32 850 Q 12 846 -18 848 Z" fill="${lt(B,0.5)}" opacity=".7"/><path d="M -24 853 L 40 853 Q 40 860 30 860 L -20 860 Q -26 860 -24 853 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M 14 838 q -9 -8 -12 0 q 3 8 12 0 q 9 -8 12 0 q -3 8 -12 0 Z" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/><circle cx="14" cy="838" r="2.5" fill="${fdk(x,0.2)}"/>`;
  } else if (kind === 'sandaler'){
    /* bare tæer og remme over foden */
    b += `<path d="M -18 842 Q 0 834 18 838 Q 34 840 38 848 Q 38 854 30 854 L -18 854 Q -24 854 -22 848 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2" stroke-linejoin="round"/>`;
    b += [18, 25, 31].map(tx => `<path d="M ${tx} 846 q 3 -4 6 0" stroke="${c.sk}" stroke-width="1.4" fill="none"/>`).join('');
    b += `<path d="M -24 852 L 40 852 Q 42 860 32 860 L -20 860 Q -27 860 -24 852 Z" fill="${B}" stroke="${bk}" stroke-width="2.2"/>`;
    const st = 'M -15 830 L 9 830 M -3 830 L 8 845 M -16 846 L 26 845';
    b += `<path d="${st}" stroke="${fdk(B,0.3)}" stroke-width="6" stroke-linecap="round" fill="none"/><path d="${st}" stroke="${B}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
    b += starP(7, 845, 5.5, x);
  } else if (kind === 'krul'){
    /* nissesko med opkrøllet snude og en lille bjælde */
    b += `<path d="M -20 820 Q 0 812 20 820 L 22 836 Q 40 836 52 826 Q 64 812 56 800 Q 70 806 68 822 Q 64 846 40 856 L -20 858 Q -26 858 -24 850 L -22 826 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 8 822 L 20 822 L 22 836 Q 40 836 52 826 Q 50 846 30 850 L 18 850 Q 10 836 8 822 Z" fill="${bD}" opacity=".5"/><path d="M -24 852 L 38 852 Q 32 860 22 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M -22 818 L -16 828 L -10 818 L -4 828 L 2 818 L 8 828 L 14 818 L 20 828 L 22 818" stroke="${x}" stroke-width="3" fill="none" stroke-linejoin="round"/>`;
    b += `<circle cx="57" cy="798" r="6" fill="#F2C14E" stroke="#B98516" stroke-width="2"/><path d="M 54 800 L 60 800" stroke="#B98516" stroke-width="1.5"/>`;
  } else if (kind === 'spaende'){
    /* lave sko med en stor messingspænde, som i gamle dage */
    b += `<path d="M -20 830 Q 0 822 18 828 Q 36 834 40 848 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -22 836 Q -22 830 -20 830 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 6 830 Q 30 834 36 848 L 20 848 Q 12 836 6 830 Z" fill="${bD}" opacity=".55"/><path d="M -24 852 L 40 852 Q 40 860 30 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M -8 826 Q 6 818 22 826 L 20 836 Q 6 830 -6 836 Z" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/>`;
    b += `<rect x="-2" y="828" width="18" height="15" rx="2.5" fill="none" stroke="#C9952E" stroke-width="4"/><rect x="-2" y="828" width="18" height="15" rx="2.5" fill="none" stroke="#F2C14E" stroke-width="1.6"/><path d="M 7 829 L 7 842" stroke="#C9952E" stroke-width="2.5"/>`;
  } else if (kind === 'knap'){
    /* knapstøvler: høje, smalle, med en række små knapper i siden */
    b += `<path d="M -20 772 Q 0 766 20 772 L 20 836 Q 36 840 40 850 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -23 790 Q -23 776 -20 772 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 6 772 L 20 772 L 20 836 Q 32 840 36 848 L 20 848 Q 8 820 6 772 Z" fill="${bD}" opacity=".6"/><path d="M -24 852 L 40 852 Q 40 860 30 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M 8 772 Q 6 806 14 838 Q 24 840 30 846" stroke="${x}" stroke-width="12" fill="none" stroke-linejoin="round" opacity=".9"/><path d="M 8 772 Q 6 806 14 838 Q 24 840 30 846" stroke="${fdk(x,0.3)}" stroke-width="1.5" fill="none" stroke-dasharray="1 0" opacity=".6"/>`;
    b += [782, 794, 806, 818, 830].map((y, i) => `<circle cx="${9 + i*1.1}" cy="${y}" r="2.8" fill="#F2C14E" stroke="#8A6418" stroke-width="1.2"/>`).join('');
    b += `<path d="M -15 790 Q -12 820 -14 840" stroke="${bL}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/><path d="M -22 770 Q 0 762 22 770 L 22 776 Q 0 768 -22 776 Z" fill="${fdk(B,0.3)}"/>`;
  } else if (kind === 'gummi'){
    b += `<path d="M -23 770 Q 0 762 23 770 L 22 834 Q 38 838 42 849 Q 42 859 31 859 L -21 859 Q -28 859 -26 850 L -25 776 Q -25 771 -23 770 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 8 770 L 22 770 L 22 834 Q 34 838 38 846 L 22 846 Q 10 820 8 770 Z" fill="${bD}" opacity=".55"/>`;
    b += `<path d="M -24 851 L 42 851 Q 42 861 31 861 L -21 861 Q -28 861 -26 851 Z" fill="${x}" stroke="${fdk(x,0.4)}" stroke-width="1.5"/>`;
    b += `<path d="M -24 768 Q 0 758 24 768 L 24 778 Q 0 768 -24 778 Z" fill="${x}" stroke="${fdk(x,0.4)}" stroke-width="1.5"/>`;
    b += [[-10,796],[8,808],[-12,826],[10,830],[-4,812]].map(([cx,cy]) => `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${x}" opacity=".9"/>`).join('');
    b += `<path d="M -17 784 Q -14 812 -16 840" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`;
  } else if (kind === 'pels'){
    const F = '#FFF6E8', Fs = '#D9C7B0';
    b += `<path d="M -21 796 L 21 796 L 20 836 Q 36 840 40 850 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -23 806 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 6 798 L 20 798 L 20 836 Q 32 840 36 848 L 20 848 Q 10 830 6 798 Z" fill="${bD}" opacity=".6"/><path d="M -24 852 L 40 852 Q 40 860 30 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += [-20,-10,0,10,20].map((dx, i) => `<circle cx="${dx}" cy="${792 + (i % 2 ? 2 : -1)}" r="9.5" fill="${F}" stroke="${Fs}" stroke-width="2"/>`).join('')
      + [-15,-5,5,15].map(dx => `<circle cx="${dx}" cy="786" r="7" fill="${F}"/>`).join('') + `<path d="M -18 786 Q -10 782 -4 786" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    b += `<path d="M 12 800 Q 18 812 14 822" stroke="${fdk(x,0.2)}" stroke-width="2" fill="none"/><circle cx="14" cy="826" r="5.5" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/>`;
    b += `<path d="M -16 842 Q -10 836 -4 842" stroke="${bL}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  } else {
    b += `<path d="M -20 806 Q -20 798 -12 798 L 12 798 Q 20 798 20 808 L 20 836 Q 36 840 40 850 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -24 820 Q -24 808 -20 806 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 6 800 L 18 800 L 18 836 Q 32 840 36 848 L 20 848 Q 10 830 6 800 Z" fill="${bD}" opacity=".6"/><path d="M -24 852 L 40 852 Q 40 860 30 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M -21 800 Q 0 794 21 802 L 21 812 Q 0 804 -21 810 Z" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/>`;
    b += `<path d="M 2 816 L 15 823 M 15 816 L 2 823 M 2 828 L 15 835 M 15 828 L 2 835" stroke="${lt(x,0.4)}" stroke-width="2.2" stroke-linecap="round"/>`;
    b += `<path d="M -16 842 Q -10 836 -4 842" stroke="${bL}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }
  return b + `</g>`;
}
const BOOTS = { snoer:{ label:'Snørestøvler' }, spidse:{ label:'Spidse sko' }, hoeje:{ label:'Høje støvler' }, ballerina:{ label:'Ballerinasko' }, gummi:{ label:'Gummistøvler' }, pels:{ label:'Støvler med pels' }, sandaler:{ label:'Sandaler' }, krul:{ label:'Nissesko' }, spaende:{ label:'Sko med spænde' }, knap:{ label:'Knapstøvler' } };
function legsF(c, short){
  if (!short) return `<path d="M 270 776 L 266 836 M 330 776 L 334 836" stroke="${c.skS}" stroke-width="22"/>`;
  const r = c.robe; let o = '';
  for (const [x1,x2] of [[270,266],[330,334]]){
    const d = `M ${x1-12} 676 L ${x2-12} 846 L ${x2+12} 846 L ${x1+12} 676 Z`;
    o += `<path d="${d}" fill="${r.b}" stroke="${r.bs}" stroke-width="2"/>` + clipG(d, [690,712,734,756,778,800,822].map(y => `<rect x="${x1-20}" y="${y}" width="40" height="11" fill="${r.a}"/>`).join('') + `<rect x="${x1+2}" y="676" width="14" height="170" fill="${SHC}" opacity=".18"/>`);
  }
  return o;
}

/* ================= ARME OG HÆNDER ================= */
function cuffBand(c, a1, b1, a2, b2, q1, q2){
  const r = c.robe;
  return `<path d="M ${a1} Q ${q1} ${b1} L ${b2} Q ${q2} ${a2} Z" fill="${r.b}" stroke="${r.bs}" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<path d="M ${(a1[0]*0.6+a2[0]*0.4)} ${(a1[1]*0.6+a2[1]*0.4)} Q ${(q1[0]+q2[0])/2} ${(q1[1]+q2[1])/2} ${(b1[0]*0.6+b2[0]*0.4)} ${(b1[1]*0.6+b2[1]*0.4)}" stroke="${r.bL}" stroke-width="1.8" fill="none" stroke-dasharray="3 4"/>`;
}
/* hænge-hånd set fra siden: fingrene let bøjede ind mod kroppen, tommelfingeren foran langs pegefingeren */
const HAND_L = 'M 205 578 C 200 588 197 598 198 608 C 199 619 203 628 210 634 C 214 637.5 219 637.5 221 633 C 223 627 223.5 618 224 610 L 227 580 Z';
function handRest(c, dark, thumb=true){
  let o = `<path d="${HAND_L}" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2" stroke-linejoin="round"/>`;
  o += clipG(HAND_L, `<path d="M 219 576 C 226 594 227 616 219 640 L 240 640 L 240 576 Z" fill="${c.skS}" opacity=".35"/>` + (dark ? `<path d="M 190 576 L 236 576 L 236 640 L 190 640 Z" fill="${c.skS}" opacity=".25"/>` : ''));
  o += `<path d="M 201 613 Q 205 624 212 631 M 206 610 Q 211 622 217.5 630" stroke="${c.sk}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  o += `<path d="M 202 590 Q 200 598 201 606" stroke="${lt(c.skin,0.5)}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  if (thumb) o += `<path d="M 223 590 C 229 593 233 603 233 612 C 233 620 231 625.5 228 625.5 C 225 625.5 224 621 224 616 C 224 608 223.5 600 223 590 Z" fill="${c.skin}"/>`
    + `<path d="M 223.6 603 C 224 610 224 621 228 625.5 C 231 625.5 233 620 233 612 C 233 604 230 596 226 592" stroke="${c.sk}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    + `<path d="M 229 600 Q 231.5 608 231 617" stroke="${c.skS}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` + (dark ? `<path d="M 226 596 Q 232 604 231 620" stroke="${c.skS}" stroke-width="4" fill="none" opacity=".35"/>` : '');
  return o;
}
const THUMB_L = 'M 224 590 C 231 592 234 600 233 608 C 232 615 230 620 226 620 C 222 620 220 615 221 610 C 222 603 222 596 224 590 Z';
/* hånd der bærer bogen (som referencen, drejet så armen kommer oppefra):
   håndryggen ligger foran bogens kant, fingrene fortsætter ned over omslaget; tommelfingeren er bag bogen */
const GRIP_F = [[201.9,621],[209.6,626],[217.4,628],[225.1,624.5]];
function handGrip(c){
  const r = 3.9;
  const back = 'M 205 576 C 201 586 198 595 198 606 L 229 606 C 229.5 594 228.5 586 227 576 Z';
  const fingers = GRIP_F.map(([x,t]) => `<rect x="${x-r}" y="600" width="${2*r}" height="${t-600}" rx="${r}"/>`).join('');
  const shapes = `<path d="${back}"/>` + fingers, cid = 'hg' + (CLIPN++);
  let o = `<g transform="translate(1.6,2.4)" fill="${SHC}" opacity=".2">${fingers}</g>`;
  o += `<clipPath id="${cid}">${shapes}</clipPath>`;
  o += `<g fill="${c.sk}" stroke="${c.sk}" stroke-width="4.4" stroke-linejoin="round">${shapes}</g><g fill="${c.skin}">${shapes}</g>`;
  o += `<g clip-path="url(#${cid})"><path d="M 220 574 C 228 592 230 612 226 632 L 240 632 L 240 574 Z" fill="${c.skS}" opacity=".35"/><path d="M 196 612 Q 214 617 232 612 L 232 632 L 196 632 Z" fill="${c.skS}" opacity=".2"/></g>`;
  o += [205.75,213.5,221.25].map((x, i) => `<path d="M ${x} 607 L ${x} ${[619,624,623][i]}" stroke="${c.sk}" stroke-width="1.5" stroke-linecap="round"/>`).join('');
  o += GRIP_F.map(([x]) => `<ellipse cx="${x}" cy="604.5" rx="2.2" ry="1.3" fill="${lt(c.skin,0.5)}" opacity=".55"/>`).join('');
  o += GRIP_F.map(([x,t]) => `<rect x="${x-2.3}" y="${t-6.2}" width="4.6" height="4.8" rx="1.8" fill="${lt(c.skin,0.45)}" stroke="${c.sk}" stroke-width="0.9"/>`).join('');
  o += `<path d="M 202 588 Q 200 596 201 602" stroke="${lt(c.skin,0.5)}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  return o;
}
/* vinke-hånd: håndfladen fremad, let spredte fingre (tegnet opret og drejet ind i armen) */
function handWave(c){
  const fingers = [[-9,-12,-14,20],[-3,-13,-5,23],[3,-13,4,22],[9,-12,13,17]];
  const cap = (x, y, a, L, w) => `<rect x="${-w/2}" y="${-L}" width="${w}" height="${L+4}" rx="${w/2}" transform="translate(${x},${y}) rotate(${a})"/>`;
  const palm = `<path d="M -13 10 C -15 0 -14 -10 -11 -14 L 11 -14 C 14 -8 15 2 13 10 C 11 16 5 18 0 18 C -6 18 -11 16 -13 10 Z"/>`;
  const shapes = fingers.map(([x,y,a,L]) => cap(x, y, a, L, 7.5)).join('') + cap(11, 4, 58, 15, 8.5) + palm;
  return `<g transform="translate(217,600) rotate(180) scale(-1.15,1.15)"><g fill="${c.sk}" stroke="${c.sk}" stroke-width="4.4" stroke-linejoin="round">${shapes}</g><g fill="${c.skin}">${shapes}</g>`
    + `<path d="M -7 6 Q 0 10 8 3 M -4 -6 Q 2 -4 6 -8" stroke="${c.skS}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="2" cy="2" rx="7" ry="6" fill="${c.skS}" opacity=".25"/></g>`;
}
/* åben arm i venstre side; dark = skyggesiden (den spejlede højre arm); wave = null | 'altid' | [fra, til] */
function armOpen(c, dark, inHand='', wave=null){
  const r = c.robe;
  let s = `<path d="M 207 556 L 228 556 L 226 590 L 207 590 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2"/>`;
  if (wave === 'bog') s += inHand + handGrip(c);
  else s += (wave === 'vink' ? handWave(c) : handRest(c, dark)) + inHand;
  s += `<path d="${SLEEVE_L}" fill="${r.a}" stroke="${r.s}" stroke-width="3" stroke-linejoin="round"/>`;
  s += clipG(SLEEVE_L, `<path d="M 230 430 C 222 480 226 530 240 580 L 280 580 L 280 430 Z" fill="${r.D}" opacity=".45"/><path d="M 214 500 Q 228 506 236 500 M 210 520 Q 226 528 238 520" stroke="${r.D}" stroke-width="3" fill="none" opacity=".7"/>`
    + (dark ? `<path d="M 180 420 L 280 420 L 280 600 L 180 600 Z" fill="${r.D}" opacity=".3"/>` : `<path d="M 236 440 Q 214 480 206 540" stroke="${r.L}" stroke-width="4" fill="none" opacity=".5"/>`));
  return s + cuffBand(c, [192.6,550.3], [248.6,558.3], [190,562], [246,570], [220,560], [218,590]);
}
/* knytnæve i venstre side (spejles til højre), med noget i hånden */
function armFist(c, held, flip){
  const r = c.robe, X = 210, Y = 600;
  let s = `<path d="M 207 556 L 228 556 L 226 590 L 207 590 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2"/>`;
  s += held.behind || '';
  s += flip ? `<g transform="translate(420 0) scale(-1 1)">` : '';
  s += `<path d="M ${X-16} ${Y-12} Q ${X-16} ${Y-22} ${X-6} ${Y-22} L ${X+10} ${Y-20} Q ${X+20} ${Y-18} ${X+19} ${Y-9} Q ${X+23} ${Y-4} ${X+19} ${Y+1} Q ${X+23} ${Y+6} ${X+19} ${Y+11} Q ${X+20} ${Y+20} ${X+10} ${Y+20} L ${X-6} ${Y+20} Q ${X-17} ${Y+19} ${X-17} ${Y+9} Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += `<path d="M ${X+11} ${Y-9} h 9 M ${X+11} ${Y+1} h 9 M ${X+11} ${Y+11} h 8" stroke="${c.sk}" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M ${X-12} ${Y-14} Q ${X-4} ${Y-24} ${X+10} ${Y-17} Q ${X+8} ${Y-9} ${X-4} ${Y-9} Q ${X-11} ${Y-9} ${X-12} ${Y-14} Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += `<path d="M ${X-16} ${Y+4} L ${X+20} ${Y+4} L ${X+20} ${Y+20} L ${X-16} ${Y+20} Z" fill="${c.skS}" opacity=".3"/>`;
  s += flip ? '</g>' : '';
  s += held.front || '';
  s += `<path d="${SLEEVE_L}" fill="${r.a}" stroke="${r.s}" stroke-width="3" stroke-linejoin="round"/>`;
  s += clipG(SLEEVE_L, `<path d="M 230 430 C 222 480 226 530 240 580 L 280 580 L 280 430 Z" fill="${r.D}" opacity=".45"/><path d="M 180 420 L 280 420 L 280 600 L 180 600 Z" fill="${r.D}" opacity=".3"/><path d="M 214 500 Q 228 506 236 500 M 210 520 Q 226 528 238 520" stroke="${r.D}" stroke-width="3" fill="none" opacity=".7"/>`);
  return s + cuffBand(c, [192.6,550.3], [248.6,558.3], [190,562], [246,570], [220,560], [218,590]);
}
/* højre arm med stav (som piloten). Armen tegnes på sin plads i kroppen, men staven og hånden om den tegnes til sidst,
   så staven altid står foran håret og hatten */
function staffArm(c){
  const r = c.robe, SX = 436;
  let s = '';
  s += `<path d="M 396 532 L 414 524 L 432 552 L 418 566 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2" stroke-linejoin="round"/><path d="M 404 548 L 424 538 L 428 548 L 414 560 Z" fill="${c.skS}" opacity=".55"/>`;
  s += `<path d="${SLEEVE_R}" fill="${r.a}" stroke="${r.s}" stroke-width="3" stroke-linejoin="round"/>`;
  s += clipG(SLEEVE_R, `<path d="M 352 420 C 380 450 396 490 404 540 L 440 540 L 440 420 Z" fill="${r.D}" opacity=".55"/><path d="M 370 480 Q 384 476 392 486 M 376 500 Q 390 496 400 506" stroke="${r.D}" stroke-width="3" fill="none" opacity=".7"/>`);
  s += cuffBand(c, [422.6,519.3], [382.6,537.3], [428,530], [388,548], [404,532], [416,558]);
  return s;
}
/* knytnæven om staven: tegnes oven på staven */
function staffFist(c){
  const SX = 436;
  let s = '';
  s += `<path d="M ${SX-16} 548 Q ${SX-16} 538 ${SX-6} 538 L ${SX+10} 540 Q ${SX+20} 542 ${SX+19} 551 Q ${SX+23} 556 ${SX+19} 561 Q ${SX+23} 566 ${SX+19} 571 Q ${SX+20} 580 ${SX+10} 580 L ${SX-6} 580 Q ${SX-17} 579 ${SX-17} 569 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += `<path d="M ${SX+11} 551 h 9 M ${SX+11} 561 h 9 M ${SX+11} 571 h 8" stroke="${c.sk}" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M ${SX-14} 572 Q ${SX+2} 582 ${SX+16} 574 L ${SX+16} 578 Q ${SX+2} 584 ${SX-14} 576 Z" fill="${c.skS}" opacity=".55"/>`;
  s += `<path d="M ${SX-12} 546 Q ${SX-4} 536 ${SX+10} 543 Q ${SX+8} 551 ${SX-4} 551 Q ${SX-11} 551 ${SX-12} 546 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="${SX+5}" cy="545" rx="3" ry="2.2" fill="${lt(c.skin,0.4)}"/>`;
  return s;
}
function armStaff(c, orb){
  const r = c.robe, SX = 436, OY = 300, st = '#9C6B43', stD = sd(st,0.35), stL = lt(st,0.3), wrap = '#E0457A';
  let s = `<defs><radialGradient id="orbG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="${lt(orb,0.4)}"/><stop offset="1" stop-color="${orb}"/></radialGradient><radialGradient id="glowG"><stop offset="0" stop-color="${lt(orb,0.5)}" stop-opacity=".75"/><stop offset="1" stop-color="${orb}" stop-opacity="0"/></radialGradient></defs>`;
  s += `<path d="M ${SX} ${OY+40} L ${SX+4} 852" stroke="${st}" stroke-width="12" stroke-linecap="round"/><path d="M ${SX+3} ${OY+44} L ${SX+7} 850" stroke="${stD}" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M ${SX-3} ${OY+48} L ${SX+1} 848" stroke="${stL}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
  s += [420, 470, 640, 700, 760].map(y => `<path d="M ${SX-3} ${y} q 3 8 1 16" stroke="${stD}" stroke-width="1.5" fill="none" opacity=".7"/>`).join('');
  s += Array.from({length:7}, (_, i) => `<path d="M ${SX-6} ${592+i*9} L ${SX+8} ${586+i*9}" stroke="${wrap}" stroke-width="5" stroke-linecap="round"/><path d="M ${SX-6} ${592+i*9} L ${SX+1} ${589+i*9}" stroke="${lt(wrap,0.4)}" stroke-width="2" stroke-linecap="round"/>`).join('');
  s += `<path d="M ${SX+6} 652 q 8 14 2 26 M ${SX+6} 652 q 14 10 14 24" stroke="${wrap}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const glow = `<circle cx="${SX}" cy="${OY}" r="70" fill="url(#glowG)"/>`;
  s += ANIM ? `<g>${glow}<animate attributeName="opacity" values="1;0.55;1" dur="2.6s" repeatCount="indefinite"/></g>` : glow;
  s += `<path d="M ${SX} ${OY+44} C ${SX-30} ${OY+38} ${SX-32} ${OY} ${SX-16} ${OY-18}" stroke="${st}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="${SX}" cy="${OY+2}" r="25" fill="url(#orbG)" stroke="${fdk(orb,0.3)}" stroke-width="2.5"/><path d="M ${SX-14} ${OY+14} Q ${SX} ${OY+26} ${SX+16} ${OY+12}" stroke="${fdk(orb,0.15)}" stroke-width="4" fill="none" opacity=".5"/><ellipse cx="${SX-8}" cy="${OY-8}" rx="7" ry="5" fill="#FFF" opacity=".9"/><circle cx="${SX+8}" cy="${OY-12}" r="2" fill="#FFF"/>`;
  s += `<path d="M ${SX} ${OY+44} C ${SX+30} ${OY+38} ${SX+32} ${OY} ${SX+16} ${OY-18}" stroke="${st}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M ${SX+4} ${OY+40} C ${SX+26} ${OY+34} ${SX+28} ${OY+4} ${SX+18} ${OY-10}" stroke="${stL}" stroke-width="2" fill="none" opacity=".7"/>`;
  s += `<rect x="${SX-10}" y="${OY+38}" width="20" height="10" rx="3" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`;
  const sp = [[SX+48,OY-36,9],[SX-48,OY-50,6],[SX+40,OY+36,5],[SX-42,OY+28,4],[SX+20,OY-62,4]].map(([x,y,rr], i) => { const t = twinkle(x, y, rr, lt(orb,0.55)); return ANIM ? `<g>${t}<animate attributeName="opacity" values="1;0.2;1" dur="${1.8+i*0.37}s" repeatCount="indefinite"/></g>` : t; }).join('');
  s += sp;
  s += staffFist(c);
  return s;
}
/* højre arm med tryllestav: samme arm og greb som staven, tryllestaven står lodret i hånden */
function armWand(c, col){
  const SX = 436, w = '#5A3A2A', tipY = 458;
  let s = `<path d="M ${SX} 604 L ${SX} ${tipY+10}" stroke="${w}" stroke-width="7" stroke-linecap="round"/><path d="M ${SX-1.6} 600 L ${SX-1.6} ${tipY+12}" stroke="${lt(w,0.35)}" stroke-width="2" stroke-linecap="round"/>`;
  s += `<rect x="${SX-5}" y="${tipY+8}" width="10" height="6" rx="2" fill="#F2C14E" stroke="#B98516" stroke-width="1.5"/>`;
  s += starP(SX, tipY, 14, col) + starP(SX, tipY, 6.5, lt(col,0.6));
  s += [[SX-20,tipY-16,5],[SX+22,tipY-10,4],[SX+16,tipY+20,3.5],[SX-14,tipY+16,3]].map(([x,y,rr], i) => { const tw = twinkle(x, y, rr, lt(col,0.5)); return ANIM ? `<g>${tw}<animate attributeName="opacity" values="1;0.15;1" dur="${1.4+i*0.4}s" repeatCount="indefinite"/></g>` : tw; }).join('');
  return s + staffFist(c);
}
/* ---------- præmiestave fra arkadens præmiebutik ----------
   Lange stave holdes som staven med kugle (hovedet omkring SX, OY), korte som tryllestaven (spidsen i SX, 458).
   Hver stav har et skaft og et hoved; farven c er den, man vælger i skaberen. */
const PST = 'stroke-linejoin="round" stroke-linecap="round"';
function pStar(x, y, R, r, n = 5, rot = 0){ let d = ''; for (let i = 0; i < n * 2; i++){ const a = -Math.PI/2 + rot + i*Math.PI/n, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (x + rr*Math.cos(a)).toFixed(1) + ' ' + (y + rr*Math.sin(a)).toFixed(1); } return d + 'Z'; }
function pHeart(x, y, r){ return `M ${x} ${y + r} C ${x - r*1.7} ${y - r*0.2} ${x - r*0.75} ${y - r*1.45} ${x} ${y - r*0.45} C ${x + r*0.75} ${y - r*1.45} ${x + r*1.7} ${y - r*0.2} ${x} ${y + r} Z`; }
/* halvmåne: en cirkel minus en forskudt cirkel, regnet ud som to buer */
function pCrescent(cx, cy, R, dx, dy, r2){
  const d = Math.hypot(dx, dy), ux = dx/d, uy = dy/d, a = (R*R - r2*r2 + d*d) / (2*d), h = Math.sqrt(Math.max(0, R*R - a*a));
  const p1 = [cx + a*ux - h*uy, cy + a*uy + h*ux], p2 = [cx + a*ux + h*uy, cy + a*uy - h*ux], f = v => v.toFixed(1);
  return `M ${f(p1[0])} ${f(p1[1])} A ${R} ${R} 0 1 1 ${f(p2[0])} ${f(p2[1])} A ${r2} ${r2} 0 1 0 ${f(p1[0])} ${f(p1[1])} Z`;
}
function pSparkles(list, col){ return list.map(([x, y, r], i) => { const t = twinkle(x, y, r, col); return ANIM ? `<g>${t}<animate attributeName="opacity" values="1;0.2;1" dur="${1.6 + i*0.37}s" repeatCount="indefinite"/></g>` : t; }).join(''); }
function pGlow(x, y, r, col, id){
  const g = `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${lt(col,0.5)}" stop-opacity=".7"/><stop offset="1" stop-color="${lt(col,0.5)}" stop-opacity="0"/></radialGradient></defs>`;
  const c = `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`;
  return g + (ANIM ? `<g>${c}<animate attributeName="opacity" values="1;0.55;1" dur="2.6s" repeatCount="indefinite"/></g>` : c);
}
/* skaftet på en lang stav: træ, sølv, vinranke eller slikstang */
function pShaft(SX, OY, kind){
  const y0 = OY + 40, x1 = SX + 4, y1 = 852;
  const line = (col, w, dx = 0, op = 1) => `<path d="M ${SX + dx} ${y0} L ${x1 + dx} ${y1}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  if (kind === 'slik'){
    let o = line('#7A2A3A', 15) + line('#FFFFFF', 11);
    for (let y = y0 + 6; y < y1 - 8; y += 24){ const k = (y - y0) / (y1 - y0), x = SX + 4*k; o += `<path d="M ${x - 5.5} ${y + 7} L ${x + 5.5} ${y - 4}" stroke="#FF4F7B" stroke-width="7" stroke-linecap="round"/>`; }
    return o + line('#FFFFFF', 2.5, -3, .8);
  }
  if (kind === 'vin'){
    let o = line('#2E6A2A', 13) + line('#5AB84A', 9) + line('#9BE36A', 2.5, -2, .8);
    for (const [y, s] of [[440, -1], [520, 1], [700, -1], [780, 1]]){ const k = (y - y0) / (y1 - y0), x = SX + 4*k;
      o += `<path d="M ${x} ${y} q ${s*18} -10 ${s*30} -2 q ${s*-12} 14 ${s*-30} 2 Z" fill="#6CCB5A" stroke="#2E6A2A" stroke-width="2.2" ${PST}/><path d="M ${x} ${y} q ${s*14} -4 ${s*24} -1" stroke="#2E6A2A" stroke-width="1.4" fill="none"/>`; }
    return o;
  }
  const st = kind === 'soelv' ? '#C8CCE0' : kind === 'hvid' ? '#F7F4FF' : kind === 'lys' ? '#D9A868' : '#9C6B43';
  let o = line(fdk(st, 0.45), 14) + line(st, 10) + line(sd(st, 0.3), 3.5, 3, .7) + line(lt(st, 0.4), 2.5, -3, .8);
  if (kind === 'hvid' || kind === 'soelv') o += [430, 520, 760].map(y => { const k = (y - y0) / (y1 - y0), x = SX + 4*k; return `<rect x="${x - 8}" y="${y}" width="16" height="9" rx="3" fill="#F2C14E" stroke="#B98516" stroke-width="1.8"/>`; }).join('');
  return o;
}
function pGrip(SX, col){ return Array.from({length:6}, (_, i) => `<path d="M ${SX-6} ${594+i*9} L ${SX+8} ${588+i*9}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><path d="M ${SX-6} ${594+i*9} L ${SX+1} ${591+i*9}" stroke="${lt(col,0.4)}" stroke-width="2" stroke-linecap="round"/>`).join(''); }
const P_HEADS = {
  /* en stor stjerne med to bånd, der flagrer */
  stjerne(SX, OY, col){
    let o = pGlow(SX, OY, 78, col, 'psG1');
    o += `<path d="M ${SX-2} ${OY+30} C ${SX-30} ${OY+50} ${SX-10} ${OY+80} ${SX-38} ${OY+108}" stroke="#2A1838" stroke-width="10" fill="none" ${PST}/><path d="M ${SX-2} ${OY+30} C ${SX-30} ${OY+50} ${SX-10} ${OY+80} ${SX-38} ${OY+108}" stroke="#FF8FC7" stroke-width="6" fill="none" ${PST}/>`;
    o += `<path d="M ${SX+2} ${OY+30} C ${SX+30} ${OY+56} ${SX+12} ${OY+88} ${SX+34} ${OY+118}" stroke="#2A1838" stroke-width="10" fill="none" ${PST}/><path d="M ${SX+2} ${OY+30} C ${SX+30} ${OY+56} ${SX+12} ${OY+88} ${SX+34} ${OY+118}" stroke="#7FD8FF" stroke-width="6" fill="none" ${PST}/>`;
    o += `<rect x="${SX-11}" y="${OY+28}" width="22" height="14" rx="4" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`;
    o += `<path d="${pStar(SX, OY - 4, 44, 20)}" fill="${col}" stroke="${fdk(col,0.35)}" stroke-width="3.5" ${PST}/><path d="${pStar(SX, OY - 4, 22, 10)}" fill="${lt(col,0.55)}"/>`;
    o += `<path d="M ${SX-12} ${OY-30} L ${SX-4} ${OY-42}" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity=".85"/>`;
    return o + pSparkles([[SX+52,OY-40,9],[SX-50,OY-30,6],[SX+44,OY+30,5],[SX-26,OY-62,5]], lt(col,0.55));
  },
  /* en gylden halvmåne, der holder en lille kugle, og en stjerne i en kæde */
  maane(SX, OY, col){
    const G = '#F2C14E', GD = '#B98516';
    let o = pGlow(SX + 4, OY - 4, 74, col, 'psG2');
    o += `<rect x="${SX-10}" y="${OY+30}" width="20" height="12" rx="3" fill="${G}" stroke="${GD}" stroke-width="2"/>`;
    o += `<path d="${pCrescent(SX - 6, OY - 4, 42, 22, -14, 34)}" fill="${G}" stroke="${GD}" stroke-width="3"/><path d="${pCrescent(SX - 8, OY - 2, 34, 22, -14, 30)}" fill="${lt(G,0.35)}" opacity=".7"/>`;
    o += `<defs><radialGradient id="psO2" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#FFF"/><stop offset=".4" stop-color="${lt(col,0.35)}"/><stop offset="1" stop-color="${col}"/></radialGradient></defs>`;
    o += `<circle cx="${SX + 14}" cy="${OY - 14}" r="16" fill="url(#psO2)" stroke="${fdk(col,0.3)}" stroke-width="2.5"/><ellipse cx="${SX + 9}" cy="${OY - 20}" rx="4.5" ry="3.2" fill="#FFF" opacity=".9"/>`;
    o += `<path d="M ${SX - 40} ${OY + 4} q -4 16 -2 30" stroke="${GD}" stroke-width="2" fill="none" stroke-dasharray="3 3"/><path d="${pStar(SX - 42, OY + 44, 11, 5)}" fill="${G}" stroke="${GD}" stroke-width="2" ${PST}/>`;
    return o + pSparkles([[SX+50,OY-44,8],[SX-30,OY-54,5],[SX+40,OY+26,5]], lt(col,0.5));
  },
  /* tre krystaller i en sølvklo */
  krystal(SX, OY, col){
    const S = '#C8CCE0', SD = '#7A7E98';
    const kr = (x, yb, h, w, rot) => `<g transform="rotate(${rot} ${x} ${yb})"><path d="M ${x-w} ${yb} V ${yb-h+w} L ${x} ${yb-h} L ${x+w} ${yb-h+w} V ${yb} Z" fill="${col}" fill-opacity=".9" stroke="${fdk(col,0.4)}" stroke-width="2.6" ${PST}/><path d="M ${x-w} ${yb-h+w} L ${x} ${yb-h} L ${x} ${yb} L ${x-w} ${yb} Z" fill="#FFF" opacity=".35"/><path d="M ${x} ${yb-h} V ${yb}" stroke="${fdk(col,0.25)}" stroke-width="1.6"/><path d="M ${x-w+4} ${yb-h+w+6} V ${yb-10}" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></g>`;
    let o = pGlow(SX, OY - 6, 80, col, 'psG3');
    o += kr(SX - 16, OY + 30, 54, 11, -24) + kr(SX + 16, OY + 30, 58, 11, 22) + kr(SX, OY + 32, 86, 15, 0);
    o += [-1, 1].map(s => `<path d="M ${SX + s*4} ${OY+40} C ${SX + s*26} ${OY+36} ${SX + s*28} ${OY+14} ${SX + s*22} ${OY+2}" stroke="${SD}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M ${SX + s*4} ${OY+40} C ${SX + s*26} ${OY+36} ${SX + s*28} ${OY+14} ${SX + s*22} ${OY+2}" stroke="${S}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
    o += `<rect x="${SX-12}" y="${OY+34}" width="24" height="12" rx="3" fill="${S}" stroke="${SD}" stroke-width="2"/>`;
    return o + pSparkles([[SX+44,OY-56,8],[SX-46,OY-36,6],[SX+40,OY+10,4],[SX-6,OY-82,5]], '#FFFFFF');
  },
  /* en stor blomst i toppen af en vinranke */
  blomst(SX, OY, col){
    let o = pGlow(SX, OY, 70, col, 'psG4');
    o += [-1, 1].map(s => `<path d="M ${SX} ${OY+40} q ${s*30} -2 ${s*44} -22 q ${s*-26} -4 ${s*-44} 22 Z" fill="#6CCB5A" stroke="#2E6A2A" stroke-width="2.4" ${PST}/>`).join('');
    for (let i = 0; i < 6; i++){ const a = i * 60; o += `<ellipse cx="${SX}" cy="${OY - 26}" rx="15" ry="25" transform="rotate(${a} ${SX} ${OY - 2})" fill="${col}" stroke="${fdk(col,0.35)}" stroke-width="2.6"/>`; }
    for (let i = 0; i < 6; i++){ const a = i * 60; o += `<ellipse cx="${SX}" cy="${OY - 24}" rx="6" ry="13" transform="rotate(${a} ${SX} ${OY - 2})" fill="${lt(col,0.45)}" opacity=".8"/>`; }
    o += `<circle cx="${SX}" cy="${OY - 2}" r="15" fill="#FFD23E" stroke="#C7920A" stroke-width="2.6"/>` + [[-5,-6],[5,-5],[0,3],[-6,4],[6,5]].map(([x, y]) => `<circle cx="${SX + x}" cy="${OY - 2 + y}" r="1.8" fill="#C7920A"/>`).join('');
    return o + pSparkles([[SX+50,OY-40,7],[SX-48,OY-34,6],[SX+30,OY+34,4]], lt(col,0.55));
  },
  /* et hjerte med to fjervinger og en lille glorie */
  vinger(SX, OY, col){
    let o = pGlow(SX, OY, 80, col, 'psG5');
    const wing = s => { let d = `M ${SX + s*14} ${OY - 6} C ${SX + s*40} ${OY - 40} ${SX + s*72} ${OY - 38} ${SX + s*78} ${OY - 20}`; for (const [x, y] of [[66, -6], [52, 8], [36, 16]]) d += ` Q ${SX + s*(x + 10)} ${OY + y - 8} ${SX + s*x} ${OY + y}`; d += ` Q ${SX + s*24} ${OY + 18} ${SX + s*14} ${OY + 10} Z`;
      return `<path d="${d}" fill="#FFFFFF" stroke="#2A1838" stroke-width="3" ${PST}/><path d="M ${SX + s*24} ${OY - 4} Q ${SX + s*46} ${OY - 20} ${SX + s*66} ${OY - 20} M ${SX + s*24} ${OY + 4} Q ${SX + s*42} ${OY - 4} ${SX + s*56} ${OY - 2}" stroke="#C8C4E8" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; };
    o += `<g transform="translate(${SX} ${OY}) scale(.8) translate(${-SX} ${-OY})">${wing(-1) + wing(1)}</g>`;
    o += `<ellipse cx="${SX}" cy="${OY - 50}" rx="22" ry="6" fill="none" stroke="#F2C14E" stroke-width="5"/><ellipse cx="${SX}" cy="${OY - 50}" rx="22" ry="6" fill="none" stroke="#FFF6A0" stroke-width="1.8"/>`;
    o += `<path d="${pHeart(SX, OY + 2, 30)}" fill="${col}" stroke="${fdk(col,0.35)}" stroke-width="3.2"/><path d="M ${SX - 22} ${OY - 6} q -4 10 2 18" stroke="${lt(col,0.55)}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    o += `<rect x="${SX-10}" y="${OY+30}" width="20" height="12" rx="3" fill="#F2C14E" stroke="#B98516" stroke-width="2"/>`;
    return o + pSparkles([[SX+56,OY-50,7],[SX-56,OY-52,6],[SX+30,OY+42,4]], '#FFF6D0');
  },
  /* skaftet snor sig i en krølle, og en sommerfugl sidder øverst */
  sommerfugl(SX, OY, col){
    /* skaftet snor sig op i en stor spiral, og sommerfuglen sidder inde midt i den */
    const cx = SX - 6, cy = OY - 34, pts = [];
    for (let i = 0; i <= 44; i++){ const t = i / 44, a = Math.PI * (0.42 - 1.9 * t), r = 40 - 12 * t; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    const d = `M ${SX} ${OY + 44} C ${SX} ${OY + 20} ${pts[0][0].toFixed(1)} ${(pts[0][1] + 18).toFixed(1)} ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ` + pts.slice(1).map(p => `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    let o = pGlow(cx, cy, 72, col, 'psG6');
    o += `<path d="${d}" stroke="#7A5230" stroke-width="13" fill="none" ${PST}/><path d="${d}" stroke="#D9A868" stroke-width="8" fill="none" ${PST}/><circle cx="${pts[44][0].toFixed(1)}" cy="${pts[44][1].toFixed(1)}" r="6" fill="#D9A868" stroke="#7A5230" stroke-width="2.5"/>`;
    const bx = cx + 2, by = cy + 2, flap = ANIM ? `<animateTransform attributeName="transform" type="scale" values="1 1;0.35 1;1 1" dur="1.1s" repeatCount="indefinite" additive="sum"/>` : '';
    const w = s => `<g transform="translate(${bx} ${by}) scale(.62)"><g>${flap}<path d="M 0 -2 C ${s*-30} -38 ${s*-58} -16 ${s*-42} 2 C ${s*-50} 10 ${s*-40} 30 ${s*-20} 22 C ${s*-8} 18 ${s*-2} 8 0 2 Z" fill="${col}" stroke="#2A1838" stroke-width="3.6" stroke-linejoin="round"/><circle cx="${s*-30}" cy="-10" r="6" fill="${lt(col,0.6)}"/><circle cx="${s*-22}" cy="14" r="4" fill="${lt(col,0.6)}"/></g></g>`;
    o += w(1) + w(-1) + `<ellipse cx="${bx}" cy="${by + 1}" rx="3.4" ry="11" fill="#3A2448" stroke="#2A1838" stroke-width="1.6"/><path d="M ${bx - 1.5} ${by - 8} q -4 -9 -8 -10 M ${bx + 1.5} ${by - 8} q 4 -9 8 -10" stroke="#2A1838" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    return o + pSparkles([[SX+48,OY-30,7],[SX-50,OY-56,6],[SX+30,OY+30,4]], lt(col,0.55));
  },
  /* en kæmpe slikkepind med sløjfe */
  slik(SX, OY, col){
    let o = pGlow(SX, OY, 72, col, 'psG7');
    o += `<circle cx="${SX}" cy="${OY - 4}" r="44" fill="#FFFFFF" stroke="#2A1838" stroke-width="3.5"/>`;
    let d = ''; for (let i = 0; i <= 64; i++){ const t = i / 64 * Math.PI * 5.2, r = 3 + t * 2.5; d += (i ? 'L' : 'M') + (SX + Math.cos(t) * r).toFixed(1) + ' ' + (OY - 4 + Math.sin(t) * r).toFixed(1); }
    o += `<path d="${d}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${lt(col,0.45)}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
    o += `<circle cx="${SX}" cy="${OY - 4}" r="44" fill="none" stroke="#2A1838" stroke-width="3.5"/><path d="M ${SX - 30} ${OY - 26} A 36 36 0 0 1 ${SX - 6} ${OY - 40}" stroke="#FFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>`;
    o += [-1, 1].map(s => `<path d="M ${SX} ${OY + 46} C ${SX + s*14} ${OY + 34} ${SX + s*30} ${OY + 40} ${SX + s*26} ${OY + 52} C ${SX + s*22} ${OY + 62} ${SX + s*8} ${OY + 54} ${SX} ${OY + 46} Z" fill="#FFD23E" stroke="#2A1838" stroke-width="2.6" ${PST}/><path d="M ${SX} ${OY + 48} L ${SX + s*12} ${OY + 72}" stroke="#2A1838" stroke-width="8" stroke-linecap="round"/><path d="M ${SX} ${OY + 48} L ${SX + s*12} ${OY + 72}" stroke="#FFD23E" stroke-width="4" stroke-linecap="round"/>`).join('') + `<circle cx="${SX}" cy="${OY + 47}" r="6" fill="#FFD23E" stroke="#2A1838" stroke-width="2.4"/>`;
    return o + pSparkles([[SX+56,OY-44,7],[SX-54,OY-30,6]], '#FFF6D0');
  },
};
const P_TIPS = {
  /* hvid tryllestav med et hjerte og et bånd */
  hjerte(SX, Y, col){
    let o = `<path d="M ${SX - 2} ${Y + 18} C ${SX - 22} ${Y + 30} ${SX - 8} ${Y + 52} ${SX - 26} ${Y + 66}" stroke="#2A1838" stroke-width="8" fill="none" ${PST}/><path d="M ${SX - 2} ${Y + 18} C ${SX - 22} ${Y + 30} ${SX - 8} ${Y + 52} ${SX - 26} ${Y + 66}" stroke="#FF8FC7" stroke-width="4.5" fill="none" ${PST}/>`;
    o += `<path d="${pHeart(SX, Y - 2, 22)}" fill="${col}" stroke="${fdk(col,0.35)}" stroke-width="3"/><path d="M ${SX - 15} ${Y - 9} q -3 8 1 13" stroke="${lt(col,0.55)}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    return o + pSparkles([[SX-24,Y-18,5],[SX+24,Y-12,4],[SX+18,Y+22,3.5]], lt(col,0.5));
  },
  /* en lille sky med en regnbue over */
  regnbue(SX, Y, col){ return `<g transform="translate(${SX} ${Y + 10}) scale(1.25) translate(${-SX} ${-Y - 10})">${P_TIPS.regnbue0(SX, Y, col)}</g>`; },
  regnbue0(SX, Y, col){
    const C = ['#FF5C7A', '#FFA040', '#FFE04A', '#6CCB5A', '#4AA8FF', '#9B6BFF'];
    let o = C.map((c, i) => `<path d="M ${SX - 30 + i*4} ${Y + 2} A ${30 - i*4} ${30 - i*4} 0 0 1 ${SX + 30 - i*4} ${Y + 2}" stroke="${c}" stroke-width="4.6" fill="none"/>`).join('');
    o += `<path d="M ${SX - 34} ${Y + 2} A 34 34 0 0 1 ${SX + 34} ${Y + 2}" stroke="#2A1838" stroke-width="2" fill="none"/><path d="M ${SX - 8} ${Y + 2} A 8 8 0 0 1 ${SX + 8} ${Y + 2}" stroke="#2A1838" stroke-width="2" fill="none"/>`;
    o += `<path d="M ${SX - 22} ${Y + 18} C ${SX - 34} ${Y + 18} ${SX - 34} ${Y + 2} ${SX - 22} ${Y + 2} C ${SX - 20} ${Y - 10} ${SX - 4} ${Y - 12} ${SX} ${Y - 2} C ${SX + 6} ${Y - 10} ${SX + 24} ${Y - 6} ${SX + 22} ${Y + 4} C ${SX + 34} ${Y + 4} ${SX + 34} ${Y + 18} ${SX + 22} ${Y + 18} Z" fill="${col}" stroke="#2A1838" stroke-width="2.6" ${PST}/>`;
    o += `<path d="M ${SX - 22} ${Y + 6} q 4 -8 12 -6" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="${SX - 7}" cy="${Y + 10}" r="1.8" fill="#2A1838"/><circle cx="${SX + 7}" cy="${Y + 10}" r="1.8" fill="#2A1838"/><path d="M ${SX - 4} ${Y + 13} q 4 4 8 0" stroke="#2A1838" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    return o + pSparkles([[SX-38,Y-16,5],[SX+38,Y-14,4]], '#FFF6D0');
  },
};
function armStaffP(c, col, head, shaft, grip){
  const SX = 436, OY = 300;
  return pShaft(SX, OY, shaft) + (grip ? pGrip(SX, grip) : '') + P_HEADS[head](SX, OY, col) + staffFist(c);
}
function armWandP(c, col, tip, wood){
  const SX = 436, tipY = 458;
  let s = `<path d="M ${SX} 604 L ${SX} ${tipY+16}" stroke="${fdk(wood,0.45)}" stroke-width="10" stroke-linecap="round"/><path d="M ${SX} 604 L ${SX} ${tipY+16}" stroke="${wood}" stroke-width="7" stroke-linecap="round"/><path d="M ${SX-1.6} 600 L ${SX-1.6} ${tipY+18}" stroke="${lt(wood,0.35)}" stroke-width="2" stroke-linecap="round"/>`;
  s += `<rect x="${SX-5}" y="${tipY+14}" width="10" height="6" rx="2" fill="#F2C14E" stroke="#B98516" stroke-width="1.5"/>`;
  return s + P_TIPS[tip](SX, tipY, col) + staffFist(c);
}
/* tryllestav i knytnæven (tegnes i venstre sides mål og spejles) */
function wandHeld(col){
  const tip = [158, 520], w = '#5A3A2A';
  const t = starP(tip[0], tip[1], 13, col) + starP(tip[0], tip[1], 6, lt(col,0.6));
  const sp = [[140,500,5],[176,498,4],[150,540,3.5]].map(([x,y,r], i) => { const tw = twinkle(x, y, r, lt(col,0.5)); return ANIM ? `<g>${tw}<animate attributeName="opacity" values="1;0.15;1" dur="${1.4+i*0.4}s" repeatCount="indefinite"/></g>` : tw; }).join('');
  return { behind: `<path d="M 222 616 L ${tip[0]+4} ${tip[1]+8}" stroke="${w}" stroke-width="7" stroke-linecap="round"/><path d="M 220 612 L ${tip[0]+3} ${tip[1]+6}" stroke="${lt(w,0.35)}" stroke-width="2" stroke-linecap="round"/>` + t + sp };
}
/* bog i venstre hånd */
/* bogen bæres i ryggen (den lange side) med ryggen opad: omslaget lidt større end sideblokken,
   bagsiden og siderne ses som en tyk kant til højre og forneden */
function bookF(col){
  const D = fdk(col,0.35), S = sd(col,0.3), G = '#F2C14E', P = '#FFF6E0', PL = '#E2D3B0';
  const x0 = 166, x1 = 260, y0 = 595, y1 = 661, t = 6;
  let o = `<path d="M ${x0+t} ${y0+t} L ${x1+t} ${y0+t} L ${x1+t} ${y1+t-3} Q ${x1+t} ${y1+t} ${x1+t-3} ${y1+t} L ${x0+t+3} ${y1+t} Q ${x0+t} ${y1+t} ${x0+t} ${y1+t-3} Z" fill="${S}" stroke="${D}" stroke-width="2"/>`;
  o += `<path d="M ${x1} ${y0+t+3} L ${x1+t-1.5} ${y0+t+3} L ${x1+t-1.5} ${y1+t-2} L ${x1} ${y1-1} Z" fill="${P}" stroke="${PL}" stroke-width="1"/>`;
  /* ryggens afrundede ende i hjørnet: omslaget bøjer fra forsiden rundt til bagsiden */
  o += `<path d="M ${x1-2} ${y0} C ${x1+2} ${y0} ${x1+t} ${y0+1.5} ${x1+t} ${y0+t+1} L ${x1+t} ${y0+t+4} L ${x1} ${y0+t+4} Z" fill="${S}" stroke="${D}" stroke-width="2" stroke-linejoin="round"/>`;
  o += `<path d="M ${x0+3} ${y1} L ${x1-1} ${y1} L ${x1+t-2} ${y1+t-1.5} L ${x0+t+2} ${y1+t-1.5} Z" fill="${P}" stroke="${PL}" stroke-width="1"/>`;
  o += [1.5,3,4.5].map(k => `<path d="M ${x1+k} ${y0+t+7} L ${x1+k} ${y1-1+k}" stroke="${PL}" stroke-width=".8"/><path d="M ${x0+4+k} ${y1+k} L ${x1-1+k} ${y1+k}" stroke="${PL}" stroke-width=".8"/>`).join('');
  o += `<rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" rx="3" fill="${col}" stroke="${D}" stroke-width="2.5"/>`;
  o += `<path d="M ${x0+1.5} ${y0+9} L ${x1-1.5} ${y0+9}" stroke="${S}" stroke-width="2"/><path d="M ${x0+2} ${y0+2} L ${x1-2} ${y0+2} L ${x1-2} ${y0+8} L ${x0+2} ${y0+8} Z" fill="${S}" opacity=".45"/>`;
  o += `<path d="M ${x0+3} ${y0+14} L ${x0+3} ${y1-4}" stroke="${lt(col,0.35)}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  o += `<rect x="${x0+12}" y="${y0+18}" width="${x1-x0-24}" height="${y1-y0-26}" rx="3" fill="none" stroke="${G}" stroke-width="2"/>`;
  o += moon(206, 638, 9, G) + starP(226, 632, 5, G) + `<circle cx="236" cy="645" r="1.6" fill="${G}"/><circle cx="188" cy="628" r="1.3" fill="${G}"/>`;
  return `<g transform="translate(213 595) scale(1.2) translate(-213 -595)">${o}</g>`;
}

/* ================= TILBEHØR ================= */
const ACC = {
  stav: { label:'Stav med kugle', color:'#5FD0FF', hand:'R' },
  tryllestav: { label:'Tryllestav', color:'#FFC02E', hand:'R' },
  bog: { label:'Tryllebog', color:'#7B4FD0', hand:'L' },
  baelte: { label:'Bælte med taske', color:'#8A4B2E' },
  toerklaede: { label:'Halstørklæde', color:'#E0457A' },
  halskaede: { label:'Månekæde', color:'#F2C14E' },
  briller: { label:'Runde briller', color:'#B98516' },
  lanterne: { label:'Lanterne', color:'#FFB347', hand:'L' },
  perler: { label:'Perlekæde', color:'#E0457A' },
  lommeur: { label:'Lommeur', color:'#F2C14E' },
  /* præmiestave: kan kun fås i arkadens præmiebutik */
  stjernestav: { label:'Stjernestav', color:'#FFD23E', hand:'R', draw: (c, col) => armStaffP(c, col, 'stjerne', 'hvid') },
  maanestav: { label:'Månestav', color:'#7FD8FF', hand:'R', draw: (c, col) => armStaffP(c, col, 'maane', 'mork', '#7B4FD0') },
  krystalstav: { label:'Krystalstav', color:'#B79BFF', hand:'R', draw: (c, col) => armStaffP(c, col, 'krystal', 'soelv') },
  blomsterstav: { label:'Blomsterstav', color:'#FF8FC7', hand:'R', draw: (c, col) => armStaffP(c, col, 'blomst', 'vin') },
  vingestav: { label:'Hjerte med vinger', color:'#FF5C8A', hand:'R', draw: (c, col) => armStaffP(c, col, 'vinger', 'hvid') },
  sommerfuglestav: { label:'Sommerfuglestav', color:'#43D3BE', hand:'R', draw: (c, col) => armStaffP(c, col, 'sommerfugl', 'lys', '#FF8FC7') },
  slikstav: { label:'Slikkepindestav', color:'#FF4F7B', hand:'R', draw: (c, col) => armStaffP(c, col, 'slik', 'slik') },
  hjertetryllestav: { label:'Hjertetryllestav', color:'#FF5C8A', hand:'R', draw: (c, col) => armWandP(c, col, 'hjerte', '#F7F4FF') },
  regnbuestav: { label:'Regnbuestav', color:'#FFFFFF', hand:'R', draw: (c, col) => armWandP(c, col, 'regnbue', '#7FD8FF') },
};
const PRAEMIE_STAVE = ['stjernestav','maanestav','krystalstav','blomsterstav','vingestav','sommerfuglestav','slikstav','hjertetryllestav','regnbuestav'];
const ACC_SLOTS = [ ['stav','tryllestav', ...PRAEMIE_STAVE], ['toerklaede','halskaede','perler'], ['bog','lanterne'] ];
const ACC_HIDDEN_BY = {};
function accConflicts(k){ const out = new Set(); for (const slot of ACC_SLOTS) if (slot.includes(k)) slot.forEach(x => { if (x !== k) out.add(x); }); return [...out]; }
/* rydder op, så tegningen aldrig viser to ting oven i hinanden */
function resolveLayers(st){
  const keys = Object.keys(st.acc || {});
  if (!keys.length) return st;
  const acc = {};
  for (const k of keys){ if (!ACC[k] || accConflicts(k).some(x => acc[x])) continue; acc[k] = st.acc[k]; }
  for (const [k, by] of Object.entries(ACC_HIDDEN_BY)) if (acc[k] && by.some(x => acc[x])) delete acc[k];
  return Object.assign({}, st, { acc });
}
function beltF(col){
  const D = fdk(col,0.4), L = lt(col,0.3);
  return `<path d="M 250 512 Q 300 526 350 512 L 352 534 Q 300 548 248 534 Z" fill="${col}" stroke="${D}" stroke-width="2.5"/><path d="M 252 516 Q 300 530 348 516" stroke="${L}" stroke-width="2" fill="none" stroke-dasharray="4 4"/>`
    + `<rect x="286" y="511" width="28" height="30" rx="6" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/><rect x="294" y="519" width="12" height="14" rx="3" fill="${fdk(col,0.25)}"/><path d="M 289 515 L 296 515" stroke="#FFF" stroke-width="2" opacity=".7"/>`
    + `<g transform="translate(336,540)"><path d="M -12 -6 L 14 -6 L 16 22 Q 2 30 -14 22 Z" fill="${lt(col,0.15)}" stroke="${D}" stroke-width="2"/><path d="M -13 -6 L 15 -6 L 13 8 Q 1 14 -11 8 Z" fill="${col}" stroke="${D}" stroke-width="2"/><circle cx="1" cy="8" r="3" fill="#F2C14E"/><path d="M 4 -4 L 14 18" stroke="${sd(col,0.4)}" stroke-width="5" opacity=".4"/></g>`
    + `<path d="M 262 538 L 258 566" stroke="#B98516" stroke-width="1.5"/>` + starP(258, 572, 7, '#F2C14E') + `<circle cx="256" cy="569" r="1.5" fill="#FFF"/>`;
}
function scarfF(col){
  const D = fdk(col,0.35), L = lt(col,0.55), S = sd(col,0.35);
  const wrap = 'M 262 392 Q 300 410 338 392 Q 352 400 350 418 Q 300 438 250 418 Q 248 400 262 392 Z';
  const tail = 'M 318 418 L 340 418 L 352 520 L 346 528 L 340 520 L 334 530 L 328 520 L 322 528 L 316 520 Z';
  return `<path d="${tail}" fill="${col}" stroke="${D}" stroke-width="2.5" stroke-linejoin="round"/>` + clipG(tail, `<rect x="300" y="446" width="80" height="12" fill="${L}"/><rect x="300" y="478" width="80" height="12" fill="${L}"/><path d="M 334 418 L 360 418 L 360 530 L 346 530 Z" fill="${S}" opacity=".45"/>`)
    + `<path d="${wrap}" fill="${col}" stroke="${D}" stroke-width="2.5" stroke-linejoin="round"/>` + clipG(wrap, `<rect x="270" y="380" width="12" height="60" fill="${L}"/><rect x="306" y="380" width="12" height="60" fill="${L}"/><path d="M 310 380 L 360 380 L 360 440 L 300 440 Z" fill="${S}" opacity=".4"/>`);
}
function necklaceF(col){
  const D = fdk(col,0.3);
  return `<path d="M 284 393 Q 280 428 300 440 Q 320 428 316 393" stroke="${D}" stroke-width="3" fill="none"/><path d="M 284 393 Q 280 428 300 440 Q 320 428 316 393" stroke="${col}" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>`
    + `<circle cx="300" cy="443" r="4" fill="none" stroke="${D}" stroke-width="2.4"/>`
    + `<circle cx="300" cy="460" r="14" fill="${col}" stroke="${D}" stroke-width="2.4"/><circle cx="300" cy="460" r="10" fill="none" stroke="${lt(col,0.45)}" stroke-width="1.2"/>`
    + moon(298, 460, 8, fdk(col,0.5)) + starP(306, 455, 3, fdk(col,0.5)) + `<circle cx="294" cy="452" r="2.2" fill="#FFF" opacity=".85"/>`;
}
/* lanterne der hænger fra venstre hånd: messingramme, glas og en lille flamme */
function lanternF(col){
  const B = '#C9952E', Bs = '#8A6418', BL = '#F2C14E', X = 214, top = 642, y0 = 658, y1 = 716;
  let o = `<defs><radialGradient id="lanG"><stop offset="0" stop-color="${lt(col,0.5)}" stop-opacity=".75"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>`;
  const glow = `<circle cx="${X}" cy="${(y0+y1)/2}" r="58" fill="url(#lanG)"/>`;
  o += ANIM ? `<g>${glow}<animate attributeName="opacity" values="1;0.7;1" dur="2.2s" repeatCount="indefinite"/></g>` : glow;
  o += `<path d="M ${X-10} ${top} Q ${X} 602 ${X+10} ${top}" stroke="${Bs}" stroke-width="4.5" fill="none"/><path d="M ${X-10} ${top} Q ${X} 604 ${X+10} ${top}" stroke="${BL}" stroke-width="2" fill="none"/>`;
  o += `<path d="M ${X-20} ${y0} L ${X-12} ${top} L ${X+12} ${top} L ${X+20} ${y0} Z" fill="${B}" stroke="${Bs}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${X}" cy="${top-2}" r="5" fill="${B}" stroke="${Bs}" stroke-width="2"/>`;
  o += `<rect x="${X-18}" y="${y0}" width="36" height="${y1-y0}" rx="3" fill="${lt(col,0.55)}" stroke="${Bs}" stroke-width="2.5"/>`;
  o += `<rect x="${X-18}" y="${y0}" width="36" height="${y1-y0}" rx="3" fill="${col}" opacity=".35"/>`;
  const flame = `<path d="M ${X} ${y0+18} q -10 14 -6 24 q 6 8 12 0 q 4 -10 -6 -24 Z" fill="#FFC02E" stroke="#E07A1F" stroke-width="2"/><path d="M ${X} ${y0+30} q -4 6 -2 10 q 2 3 4 0 q 2 -4 -2 -10 Z" fill="#FFF3B0"/>`;
  o += ANIM ? `<g>${flame}<animateTransform attributeName="transform" type="scale" values="1 1;1 1.08;1 0.95;1 1" dur="1.4s" repeatCount="indefinite" additive="sum"/></g>` : flame;
  o += `<rect x="${X-4}" y="${y0+42}" width="8" height="12" rx="2" fill="#FFF6E0" stroke="#D9C7B0" stroke-width="1.5"/>`;
  o += `<path d="M ${X} ${y0} L ${X} ${y1} M ${X-18} ${(y0+y1)/2} L ${X+18} ${(y0+y1)/2}" stroke="${Bs}" stroke-width="2" opacity=".5"/><path d="M ${X-12} ${y0+6} L ${X-12} ${y1-8}" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  o += `<path d="M ${X-22} ${y1} L ${X+22} ${y1} L ${X+18} ${y1+10} L ${X-18} ${y1+10} Z" fill="${B}" stroke="${Bs}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${X-22}" y="${y0-4}" width="44" height="7" rx="3" fill="${BL}" stroke="${Bs}" stroke-width="2"/>`;
  return o;
}
/* lommeur i en kæde fra bæltet, som en gammeldags opfinder */
function watchF(col){
  const D = fdk(col,0.35), L = lt(col,0.45), X = 340, Y = 586;
  let o = `<path d="M 318 528 Q 316 560 ${X-6} ${Y-14}" stroke="${D}" stroke-width="3.4" fill="none" stroke-dasharray="4 2.5" stroke-linecap="round"/><path d="M 318 528 Q 316 560 ${X-6} ${Y-14}" stroke="${col}" stroke-width="1.8" fill="none" stroke-dasharray="4 2.5" stroke-linecap="round"/>`;
  o += `<circle cx="318" cy="528" r="4" fill="${col}" stroke="${D}" stroke-width="1.6"/>`;
  o += `<rect x="${X-4}" y="${Y-22}" width="8" height="7" rx="2" fill="${col}" stroke="${D}" stroke-width="1.6"/><circle cx="${X}" cy="${Y-24}" r="3.5" fill="none" stroke="${D}" stroke-width="2"/>`;
  o += `<circle cx="${X}" cy="${Y}" r="16" fill="${col}" stroke="${D}" stroke-width="2.4"/><circle cx="${X}" cy="${Y}" r="12" fill="#FFF8EC" stroke="${D}" stroke-width="1.4"/>`;
  o += [0,1,2,3,4,5,6,7,8,9,10,11].map(i => { const a = i * Math.PI / 6; return `<circle cx="${(X + Math.sin(a) * 9.5).toFixed(1)}" cy="${(Y - Math.cos(a) * 9.5).toFixed(1)}" r="${i % 3 ? 0.7 : 1.2}" fill="${INK}"/>`; }).join('');
  o += `<path d="M ${X} ${Y} L ${X} ${Y-7} M ${X} ${Y} L ${X+5} ${Y+2}" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${X}" cy="${Y}" r="1.4" fill="${D}"/>`;
  return o + `<path d="M ${X-11} ${Y-6} Q ${X-8} ${Y-12} ${X-2} ${Y-13}" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`;
}
/* perlekæde med et lille hjerte */
function pearlsF(col){
  let o = '';
  for (let i = 0; i <= 14; i++){ const t = i / 14, x = 282 + 36*t, y = 394 + Math.sin(t*Math.PI) * 42 - (t < .5 ? 0 : 0);
    o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#FFF8F2" stroke="#C9B6C6" stroke-width="1.4"/><circle cx="${(x-1.4).toFixed(1)}" cy="${(y-1.6).toFixed(1)}" r="1.5" fill="#FFF"/>`; }
  return o + `<path d="M 300 440 L 300 446" stroke="#C9B6C6" stroke-width="2"/>` + heart(300, 456, 1.3, col, fdk(col,0.35), 1.6) + `<circle cx="297" cy="450" r="1.6" fill="#FFF" opacity=".85"/>`;
}
function glassesArms(col){ return `<path d="M 243 300 L 222 292 M 357 300 L 378 292" stroke="${fdk(col,0.3)}" stroke-width="4" stroke-linecap="round"/>`; }
function glassesF(col){
  const D = fdk(col,0.3);
  return `<circle cx="266" cy="306" r="23" fill="#E8F6FF" fill-opacity=".18" stroke="${D}" stroke-width="5"/><circle cx="334" cy="306" r="23" fill="#E8F6FF" fill-opacity=".18" stroke="${D}" stroke-width="5"/>`
    + `<circle cx="266" cy="306" r="23" fill="none" stroke="${col}" stroke-width="2.5"/><circle cx="334" cy="306" r="23" fill="none" stroke="${col}" stroke-width="2.5"/>`
    + `<path d="M 289 302 Q 300 294 311 302" stroke="${D}" stroke-width="4" fill="none"/><path d="M 252 294 Q 258 288 266 288" stroke="#FFF" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`;
}

/* ================= VINK ================= */
function waveArm(inner, ev, forever){
  if (!ANIM) return inner;
  const P = '252 418';
  if (forever) return `<g><animateTransform attributeName="transform" type="rotate" values="106 ${P};120 ${P};106 ${P}" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="1.1s" repeatCount="indefinite"/>${inner}</g>`;
  if (!ev) return inner;
  const T = IDLE.T, pts = [[0,0],[ev.a,0],[ev.a+0.35,110]];
  let t = ev.a + 0.35, up = false;
  while (t + 0.3 < ev.b - 0.35){ t += 0.3; pts.push([t, up ? 110 : 122]); up = !up; }
  pts.push([ev.b-0.35, 110], [ev.b, 0], [T, 0]);
  return `<g><animateTransform attributeName="transform" type="rotate" values="${pts.map(p => p[1]+' '+P).join(';')}" keyTimes="${pts.map(p => (p[0]/T).toFixed(4)).join(';')}" dur="${T}s" repeatCount="indefinite"/>${inner}</g>`;
}

/* ================= KLADDER =================
   Nye ting, der venter på Kaspers godkendelse på Tegnebordet. De kan tegnes (og ses på Tegnebordet),
   men vises ikke i spillet: ikke i skaberen, ikke på gæster og ikke i kuglerne. Godkendt = slet linjen her. */
const KLADDE = new Set([
  'acc:sommerfuglestav',
  ...['maane','blomster','hav','svampe','enhjoerning','drage','kaeledyr','selv','kunst','gnoma','far'].map(k => 'maleri:' + k),
  'rum:ting.teleskop', 'rum:ting.ovn',
]);
const isKladde = (cat, id) => KLADDE.has(cat + ':' + id);

/* ================= SAMLING ================= */
const FIG_DEFAULT = {
  skin:'#FFD9C2',
  eyes:{ color:'#3FAE6A', pupil:'rund' },
  mk:{ blush:'#FF8FA3', lips:'#C2465E', lipShape:'smil', mark:'fregner', markColor:'#B07A45' },
  front:'side', back:'langt',
  hair:{ a:'#F2B33D', b:'#FF8FC7', ombre:false, tie:'#E0457A' },
  robe:{ id:'stjerner', a:'#7B4FD0', b:'#F2C14E' },
  cape:{ id:'lang', a:'#2E3F8F', b:'#B79BFF' },
  hat:{ id:'spids', a:'#5B3FA8', b:'#E0457A' },
  boots:{ id:'snoer', a:'#8A4B2E', b:'#F2C14E' },
  acc:{ stav:'#5FD0FF', baelte:'#8A4B2E' },
  pet:{ kind:'kat', a:'#FFC9E2', b:'#FFFFFF', c:'#B79BFF', pattern:'ingen', eyes:'#3D8BFF', acc:{ halsbaand:'#7B5CFF' }, name:'' },
};
const DEFAULT_STATE = FIG_DEFAULT;

let ONLY = null;
function figureSvg(st, c, hl, wave){
  const acc = st.acc || {}, A = k => acc[k];
  const back = BACK[st.back] || BACK.langt, robe = ROBES[st.robe.id] || ROBES.stjerner, cape = CAPES[st.cape.id] || CAPES.ingen, hat = HATS[st.hat.id] || HATS.ingen;
  const bootKind = BOOTS[st.boots.id] ? st.boots.id : 'snoer';
  CLIPN = 0;
  let s = `<defs><radialGradient id="irisF" cx=".5" cy=".7" r=".65"><stop offset="0" stop-color="${lt(c.eye,0.45)}"/><stop offset=".6" stop-color="${c.eye}"/><stop offset="1" stop-color="${fdk(c.eye,0.35)}"/></radialGradient></defs>`;
  s += `<ellipse cx="300" cy="862" rx="160" ry="20" fill="${SHC}" opacity=".16"/>`;
  const sway = (inner) => spin(inner, 300, 404, [0,1.2,0,-1.2,0], 7);
  /* bagerst: kappen og det lange hår */
  if (cape.back && !ONLY) s += HLW(hl === 'cape', sway(cape.back(c)));
  const hoodOn = st.cape.id === 'haette' && !HATS[st.hat.id]?.draw;
  if (!hoodOn && !ONLY) s += HLW(hl === 'back', sway(back.back(c)));
  /* ben, støvler, kjole */
  s += legsF(c, robe.short);
  s += HLW(hl === 'boots', bootOne(c, -1, bootKind) + bootOne(c, 1, bootKind));
  if (ONLY === 'boots') return s;   /* kun fodtøjet (fx når det kommer ud af en boble) */
  s += HLW(hl === 'robe', robeF(c, robe));
  if (A('baelte')) s += HLW(hl === 'acc:baelte', beltF(A('baelte')));
  if (A('lommeur')) s += HLW(hl === 'acc:lommeur', watchF(A('lommeur')));
  /* venstre arm (kan vinke); bogen ligger i hånden */
  const waveEv = IDLE && IDLE.ev.find(e => e.kind === 'wave');
  /* når hun vinker, spejles armen om sin egen akse, så albuen peger ud og ned */
  const AXIS = 'translate(252 418) rotate(100.88) scale(1,-1) rotate(-100.88) translate(-252 -418)';
  const raised = () => `<g transform="${AXIS}">${armOpen(c, false, '', 'vink')}</g>`;
  let left;
  if (A('bog')) left = armOpen(c, false, HLW(hl === 'acc:bog', bookF(A('bog'))), 'bog');
  else if (A('lanterne')) left = HLW(hl === 'acc:lanterne', lanternF(A('lanterne'))) + armOpen(c, false);
  else if (wave && ANIM) left = `<g transform="translate(-26 50)">${waveArm(raised(), null, true)}</g>`;
  else if (waveEv && ANIM) left = showDuring(armOpen(c, false), [[0, waveEv.a], [waveEv.b, IDLE.T]]) + showDuring(`<g transform="translate(-26 50)">${waveArm(raised(), waveEv, false)}</g>`, [[waveEv.a, waveEv.b]]);
  else left = armOpen(c, false);
  s += HLW(hl === 'robe', left);
  /* højre arm: stav, tryllestav eller tom hånd */
  const pk = PRAEMIE_STAVE.find(k => A(k));
  /* staven (og hånden om den) gemmes til sidst, så den står foran håret */
  const rk = A('stav') ? 'stav' : A('tryllestav') ? 'tryllestav' : pk;
  let stavForan = '';
  if (rk){ s += HLW(hl === 'acc:' + rk, staffArm(c)); stavForan = HLW(hl === 'acc:' + rk, rk === 'stav' ? armStaff(c, A('stav')) : rk === 'tryllestav' ? armWand(c, A('tryllestav')) : ACC[rk].draw(c, A(rk))); }
  else s += MIR(armOpen(c, true));
  /* hals, krave og skuldre (kappens skulderstykke, eller kjolens bærestykke) */
  s += `<path d="M 284 360 L 284 406 Q 300 416 316 406 L 316 360 Z" fill="${c.skin}"/><path d="M 284 360 L 284 404 M 316 360 L 316 404" stroke="${c.sk}" stroke-width="2.5"/>`;
  s += `<path d="M 282 372 Q 300 404 318 372 L 318 392 Q 300 404 282 392 Z" fill="${c.skS}" opacity=".75"/>`;
  const r = c.robe;
  s += `<path d="M 262 406 L 300 448 L 338 406 Q 300 396 262 406 Z" fill="${lt(r.a,0.6)}" stroke="${r.s}" stroke-width="2.5"/><path d="M 300 430 L 336 406 L 338 410 L 300 448 Z" fill="${r.D}" opacity=".25"/><path d="M 278 410 L 300 434 L 322 410" fill="${c.skin}"/><path d="M 286 410 Q 300 420 314 410" stroke="${c.skS}" stroke-width="4" fill="none" opacity=".6"/>`;
  const sh = cape.back ? c.cape : c.robe;
  const SHOULD = 'M 238 404 Q 300 388 362 404 Q 384 420 388 452 Q 300 474 212 452 Q 216 420 238 404 Z';
  let shp = `<path d="${SHOULD}" fill="${sh.a}" stroke="${sh.s}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="M 330 398 Q 366 404 384 432 L 388 452 Q 350 464 320 466 Z" fill="${sh.D}" opacity=".45"/><path d="M 244 410 Q 230 424 226 444" stroke="${lt(sh.a,0.3)}" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>`
    + `<path d="M 216 450 Q 300 472 384 450" stroke="${cape.back ? '#F2C14E' : r.b}" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>`;
  if (cape.back) shp += `<path d="M 214 452 Q 300 476 386 452" stroke="${c.cape.b}" stroke-width="3" fill="none" opacity=".8"/><circle cx="300" cy="412" r="11" fill="#F2C14E" stroke="#B98516" stroke-width="2.5"/>${starP(300, 412, 7, '#B98516')}<circle cx="296" cy="408" r="2.5" fill="#FFF" opacity=".8"/>`;
  else shp = shp.replace(SHOULD, 'M 246 406 Q 300 394 354 406 Q 372 418 376 444 Q 300 462 224 444 Q 228 418 246 406 Z');
  s += HLW(hl === (cape.back ? 'cape' : 'robe'), shp);
  if (robe.over) s += HLW(hl === 'robe', robe.over(c));
  if (A('halskaede')) s += HLW(hl === 'acc:halskaede', necklaceF(A('halskaede')));
  if (A('toerklaede')) s += HLW(hl === 'acc:toerklaede', scarfF(A('toerklaede')));
  if (A('perler')) s += HLW(hl === 'acc:perler', pearlsF(A('perler')));
  if (back.over) s += HLW(hl === 'back', back.over(c));
  /* hovedet */
  const fr = FRONT[st.front] || FRONT.side;
  const hoodUp = st.cape.id === 'haette' && !hat.draw;
  let head = hoodUp ? HLW(hl === 'cape', hoodBack(c)) : '';
  if (back.top) head += HLW(hl === 'back', back.top(c));
  const hair = hairFront(c, fr, hoodUp && back.lock === 'lang' ? 'kort' : back.lock, !!hat.draw && !hat.light);
  head += faceF(c, hl, hair.d);
  if (A('briller')) head += HLW(hl === 'acc:briller', glassesArms(A('briller')));
  head += HLW(hl === 'front' || hl === 'back', hair.svg);
  if (A('briller')) head += HLW(hl === 'acc:briller', glassesF(A('briller')));
  if (hoodUp) head += HLW(hl === 'cape', hoodFront(c));
  if (hat.draw) head += HLW(hl === 'hat', `<g transform="translate(0 10) rotate(-6 300 214)">${hat.draw(c)}</g>`);
  const look = IDLE && ANIM ? (() => { const pts = trackPoints('look', e => e.d * 4); return `<animateTransform attributeName="transform" type="translate" values="${pts.map(p => p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p => (p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>`; })() : '';
  s += sway(`<g>${look}<g transform="${HEAD_T}">${head}</g></g>`);
  return s + stavForan;
}

function renderDoll(st, opts={}){
  st = resolveLayers(st);
  const c = figColors(st);
  ANIM = !!opts.anim;
  IDLE = opts.greet && ANIM ? { T: 3, ev: [{ kind:'hop', a:0.1, b:0.8 }] } : opts.idle && ANIM ? makeIdle(false) : null;
  if (IDLE && opts.idle){ const a = 3 + Math.random() * (IDLE.T - 6); if (IDLE.ev.every(e => a + 0.8 < e.a - 0.4 || a > e.b + 0.4)) IDLE.ev.push({ kind:'hop', a, b:a+0.7 }); }
  const hl = opts.hl || '';
  ONLY = opts.only || null;
  const vb = opts.viewBox || `0 0 ${W} ${H}`;
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${opts.size ? ` width="${opts.size[0]}" height="${opts.size[1]}"` : ''}>`];
  o.push(`<defs>${grad('bgG', opts.bg1 || '#FFF3F8', opts.bg2 || '#EBDDFF')}</defs>`);
  if (opts.petOnly){ o.push(hlCompose(petDraw(st.pet, hl, opts.petMode))); o.push(`</svg>`); return o.join(''); }
  if (opts.bg){
    o.push(`<rect x="-400" y="-400" width="1600" height="1900" fill="url(#bgG)"/>`);
    [[110,150,16,.9],[690,120,22,.9],[720,520,12,.8],[80,620,14,.8],[650,900,18,.8],[140,930,12,.8],[610,240,8,.7]].forEach(([x,y,r,op],i) => o.push(ANIM ? `<g>${star4(x,y,r,'#FFFFFF',op)}<animate attributeName="opacity" values="1;0.25;1" dur="${2.4+i*0.37}s" repeatCount="indefinite"/></g>` : star4(x,y,r,'#FFFFFF',op)));
  }
  let content = `<g transform="${FIG_T}">${figureSvg(st, c, hl, opts.wave)}</g>`;
  content = squash(content, 400, 1046, ['1 1','1.006 1.012','1 1'], 3.6);
  const hop = IDLE && ANIM && IDLE.ev.find(e => e.kind === 'hop');
  if (hop){ const T = IDLE.T, a = hop.a, P = [[0,0],[a,0],[a+0.16,-30],[a+0.32,0],[a+0.44,-10],[a+0.56,0],[T,0]];
    content = `<g><animateTransform attributeName="transform" type="translate" values="${P.map(p => '0 ' + p[1]).join(';')}" keyTimes="${P.map(p => (p[0]/T).toFixed(4)).join(';')}" dur="${T}s" repeatCount="indefinite"/>${content}</g>`; }
  if (opts.walk && ANIM) content = bob(spin(content, 400, 1046, [-3,3,-3], 0.64), -12, 0.32);
  if (opts.pet !== false) content += petDraw(st.pet, hl);
  o.push(hl ? hlCompose(content) : content);
  o.push(`</svg>`);
  return o.join('');
}

if (typeof module !== 'undefined') module.exports = { resolveLayers, accConflicts, renderDoll, DEFAULT_STATE, BACK, FRONT, ROBES, CAPES, HATS, BOOTS, ACC, PUPILS, LIPSHAPES, MARKS, PET_KINDS, PET_PATTERNS, PET_ACC, adj };
