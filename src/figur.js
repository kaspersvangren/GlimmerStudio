'use strict';
/* ================= Glimmer Studio — figuren i eventyrstil (SVG i lag) =================
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
const PUPILS = { rund:'Runde', glimt:'Glimt', stjerne:'Stjerner', hjerte:'Hjerter' };
const LIPSHAPES = { smil:'Smil', grin:'Stort grin', pust:'Lille mund' };
const MARKS = { ingen:'Intet', fregner:'Fregner', hjerte:'Hjerte', stjerne:'Stjerne', glimmer:'Glimmer' };
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
  else p = `<circle cy="4" r="7" fill="${INK}"/>`;
  const shine = c.pupil === 'glimt' ? twinkle(-4, -3, 7, '#FFF') + `<circle cx="6" cy="9" r="2.2" fill="#FFF"/>` : `<circle cx="-5" cy="-3" r="4.8" fill="#FFF"/><circle cx="5" cy="8" r="2.2" fill="#FFF" opacity=".9"/>`;
  return `<g transform="translate(${x},304)"><ellipse rx="17" ry="20" fill="#FFF"/><ellipse cy="-8" rx="17" ry="10" fill="${c.skS}" opacity=".18"/>`
    + `<g>${eyeLook()}<circle cy="3" r="14.5" fill="url(#irisF)" stroke="${fdk(c.eye,0.45)}" stroke-width="1.5"/>${p}${shine}</g>`
    + `<path d="M -19 -6 Q 0 -27 19 -6" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M ${17*f} -8 l ${6*f} -5 M ${12*f} -14 l ${4*f} -6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M -12 16 Q 0 22 12 16" stroke="${c.sk}" stroke-width="1.6" fill="none" opacity=".7"/>`
    + blinkLid(`<ellipse rx="20" ry="23" fill="${c.skin}"/><path d="M -19 2 Q 0 14 19 2" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M ${17*f} 2 l ${6*f} 3" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`, 4.4, 0.6)
    + `</g>`;
}
function mouthF(c){
  const L = c.lips, Ld = fdk(L,0.3);
  if (c.lipShape === 'grin') return `<path d="M 282 340 Q 300 346 318 340 Q 316 366 300 367 Q 284 366 282 340 Z" fill="${fdk(L,0.45)}" stroke="${Ld}" stroke-width="2" stroke-linejoin="round"/><path d="M 286 342 Q 300 346 314 342 L 313 349 Q 300 351 287 349 Z" fill="#FFF"/><path d="M 291 360 Q 300 354 309 360 Q 300 366 291 360 Z" fill="${lt(L,0.35)}"/>`;
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
function capeBody(c, D, bottom, stars){
  const k = c.cape;
  return `<path d="${D}" fill="${k.a}" stroke="${k.s}" stroke-width="3" stroke-linejoin="round"/>`
    + clipG(D, `<path d="M 330 400 C 380 520 420 680 460 830 L 520 830 L 520 400 Z" fill="${k.D}" opacity=".55"/>`
      + `<path d="M 238 410 C 214 520 188 660 180 ${bottom+8} L 214 ${bottom+10} C 222 660 240 520 258 420 Z" fill="${k.b}"/><path d="M 238 410 C 220 520 200 660 196 ${bottom+8}" stroke="${k.bD}" stroke-width="5" fill="none" opacity=".6"/>`
      + `<path d="M 410 520 Q 424 680 432 ${bottom+6} M 384 560 Q 398 700 404 ${bottom+6}" stroke="${k.D}" stroke-width="4" fill="none" opacity=".7"/>`
      + (stars ? [[170,640],[196,520],[420,600],[440,740],[178,770],[410,470]].map(([x,y],i) => starP(x, y, i % 2 ? 6 : 8, k.b, .85)).join('') : '')
      + `<path d="M 140 ${bottom-8} Q 200 ${bottom+4} 300 ${bottom-2} Q 400 ${bottom+4} 460 ${bottom-8}" stroke="#F2C14E" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>`);
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
const CAPES = {
  ingen: { label:'Ingen kappe' },
  lang: { label:'Lang kappe', back: c => capeBody(c, CAPE_LONG, 820) },
  kort: { label:'Kort slag', back: c => capeBody(c, CAPE_SHORT, 594) },
  haette: { label:'Kappe med hætte', back: c => capeBody(c, CAPE_LONG, 820) },
  stjerner: { label:'Stjernekappe', back: c => capeBody(c, CAPE_LONG, 820, true) },
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
  } else {
    b += `<path d="M -20 806 Q -20 798 -12 798 L 12 798 Q 20 798 20 808 L 20 836 Q 36 840 40 850 Q 40 858 30 858 L -20 858 Q -26 858 -24 850 L -24 820 Q -24 808 -20 806 Z" fill="${B}" stroke="${bk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    b += `<path d="M 6 800 L 18 800 L 18 836 Q 32 840 36 848 L 20 848 Q 10 830 6 800 Z" fill="${bD}" opacity=".6"/><path d="M -24 852 L 40 852 Q 40 860 30 860 L -20 860 Q -26 860 -24 852 Z" fill="${fdk(B,0.45)}"/>`;
    b += `<path d="M -21 800 Q 0 794 21 802 L 21 812 Q 0 804 -21 810 Z" fill="${x}" stroke="${fdk(x,0.35)}" stroke-width="1.5"/>`;
    b += `<path d="M 2 816 L 15 823 M 15 816 L 2 823 M 2 828 L 15 835 M 15 828 L 2 835" stroke="${lt(x,0.4)}" stroke-width="2.2" stroke-linecap="round"/>`;
    b += `<path d="M -16 842 Q -10 836 -4 842" stroke="${bL}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }
  return b + `</g>`;
}
const BOOTS = { snoer:{ label:'Snørestøvler' }, spidse:{ label:'Spidse sko' }, hoeje:{ label:'Høje støvler' } };
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
/* højre arm med stav (som piloten) */
function staffHand(c){
  const r = c.robe, SX = 436;
  let s = '';
  s += `<path d="M 396 532 L 414 524 L 432 552 L 418 566 Z" fill="${c.skin}" stroke="${c.sk}" stroke-width="2.2" stroke-linejoin="round"/><path d="M 404 548 L 424 538 L 428 548 L 414 560 Z" fill="${c.skS}" opacity=".55"/>`;
  s += `<path d="${SLEEVE_R}" fill="${r.a}" stroke="${r.s}" stroke-width="3" stroke-linejoin="round"/>`;
  s += clipG(SLEEVE_R, `<path d="M 352 420 C 380 450 396 490 404 540 L 440 540 L 440 420 Z" fill="${r.D}" opacity=".55"/><path d="M 370 480 Q 384 476 392 486 M 376 500 Q 390 496 400 506" stroke="${r.D}" stroke-width="3" fill="none" opacity=".7"/>`);
  s += cuffBand(c, [422.6,519.3], [382.6,537.3], [428,530], [388,548], [404,532], [416,558]);
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
  s += staffHand(c);
  return s;
}
/* højre arm med tryllestav: samme arm og greb som staven, tryllestaven står lodret i hånden */
function armWand(c, col){
  const SX = 436, w = '#5A3A2A', tipY = 458;
  let s = `<path d="M ${SX} 604 L ${SX} ${tipY+10}" stroke="${w}" stroke-width="7" stroke-linecap="round"/><path d="M ${SX-1.6} 600 L ${SX-1.6} ${tipY+12}" stroke="${lt(w,0.35)}" stroke-width="2" stroke-linecap="round"/>`;
  s += `<rect x="${SX-5}" y="${tipY+8}" width="10" height="6" rx="2" fill="#F2C14E" stroke="#B98516" stroke-width="1.5"/>`;
  s += starP(SX, tipY, 14, col) + starP(SX, tipY, 6.5, lt(col,0.6));
  s += [[SX-20,tipY-16,5],[SX+22,tipY-10,4],[SX+16,tipY+20,3.5],[SX-14,tipY+16,3]].map(([x,y,rr], i) => { const tw = twinkle(x, y, rr, lt(col,0.5)); return ANIM ? `<g>${tw}<animate attributeName="opacity" values="1;0.15;1" dur="${1.4+i*0.4}s" repeatCount="indefinite"/></g>` : tw; }).join('');
  return s + staffHand(c);
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
};
const ACC_SLOTS = [ ['stav','tryllestav'], ['toerklaede','halskaede'] ];
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

function figureSvg(st, c, hl, wave){
  const acc = st.acc || {}, A = k => acc[k];
  const back = BACK[st.back] || BACK.langt, robe = ROBES[st.robe.id] || ROBES.stjerner, cape = CAPES[st.cape.id] || CAPES.ingen, hat = HATS[st.hat.id] || HATS.ingen;
  const bootKind = BOOTS[st.boots.id] ? st.boots.id : 'snoer';
  CLIPN = 0;
  let s = `<defs><radialGradient id="irisF" cx=".5" cy=".7" r=".65"><stop offset="0" stop-color="${lt(c.eye,0.45)}"/><stop offset=".6" stop-color="${c.eye}"/><stop offset="1" stop-color="${fdk(c.eye,0.35)}"/></radialGradient></defs>`;
  s += `<ellipse cx="300" cy="862" rx="160" ry="20" fill="${SHC}" opacity=".16"/>`;
  const sway = (inner) => spin(inner, 300, 404, [0,1.2,0,-1.2,0], 7);
  /* bagerst: kappen og det lange hår */
  if (cape.back) s += HLW(hl === 'cape', sway(cape.back(c)));
  const hoodOn = st.cape.id === 'haette' && !HATS[st.hat.id]?.draw;
  if (!hoodOn) s += HLW(hl === 'back', sway(back.back(c)));
  /* ben, støvler, kjole */
  s += legsF(c, robe.short);
  s += HLW(hl === 'boots', bootOne(c, -1, bootKind) + bootOne(c, 1, bootKind));
  s += HLW(hl === 'robe', robeF(c, robe));
  if (A('baelte')) s += HLW(hl === 'acc:baelte', beltF(A('baelte')));
  /* venstre arm (kan vinke); bogen ligger i hånden */
  const waveEv = IDLE && IDLE.ev.find(e => e.kind === 'wave');
  /* når hun vinker, spejles armen om sin egen akse, så albuen peger ud og ned */
  const AXIS = 'translate(252 418) rotate(100.88) scale(1,-1) rotate(-100.88) translate(-252 -418)';
  const raised = () => `<g transform="${AXIS}">${armOpen(c, false, '', 'vink')}</g>`;
  let left;
  if (A('bog')) left = armOpen(c, false, HLW(hl === 'acc:bog', bookF(A('bog'))), 'bog');
  else if (wave && ANIM) left = `<g transform="translate(-26 50)">${waveArm(raised(), null, true)}</g>`;
  else if (waveEv && ANIM) left = showDuring(armOpen(c, false), [[0, waveEv.a], [waveEv.b, IDLE.T]]) + showDuring(`<g transform="translate(-26 50)">${waveArm(raised(), waveEv, false)}</g>`, [[waveEv.a, waveEv.b]]);
  else left = armOpen(c, false);
  s += HLW(hl === 'robe', left);
  /* højre arm: stav, tryllestav eller tom hånd */
  if (A('stav')) s += HLW(hl === 'acc:stav', armStaff(c, A('stav')));
  else if (A('tryllestav')) s += HLW(hl === 'acc:tryllestav', armWand(c, A('tryllestav')));
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
  if (A('halskaede')) s += HLW(hl === 'acc:halskaede', necklaceF(A('halskaede')));
  if (A('toerklaede')) s += HLW(hl === 'acc:toerklaede', scarfF(A('toerklaede')));
  if (back.over) s += HLW(hl === 'back', back.over(c));
  /* hovedet */
  const fr = FRONT[st.front] || FRONT.side;
  const hoodUp = st.cape.id === 'haette' && !hat.draw;
  let head = hoodUp ? HLW(hl === 'cape', hoodBack(c)) : '';
  if (back.top) head += HLW(hl === 'back', back.top(c));
  const hair = hairFront(c, fr, hoodUp && back.lock === 'lang' ? 'kort' : back.lock, !!hat.draw);
  head += faceF(c, hl, hair.d);
  if (A('briller')) head += HLW(hl === 'acc:briller', glassesArms(A('briller')));
  head += HLW(hl === 'front' || hl === 'back', hair.svg);
  if (A('briller')) head += HLW(hl === 'acc:briller', glassesF(A('briller')));
  if (hoodUp) head += HLW(hl === 'cape', hoodFront(c));
  if (hat.draw) head += HLW(hl === 'hat', `<g transform="translate(0 10) rotate(-6 300 214)">${hat.draw(c)}</g>`);
  const look = IDLE && ANIM ? (() => { const pts = trackPoints('look', e => e.d * 4); return `<animateTransform attributeName="transform" type="translate" values="${pts.map(p => p[1].toFixed(1)+' 0').join(';')}" keyTimes="${pts.map(p => (p[0]/IDLE.T).toFixed(4)).join(';')}" dur="${IDLE.T}s" repeatCount="indefinite"/>`; })() : '';
  s += sway(`<g>${look}<g transform="${HEAD_T}">${head}</g></g>`);
  return s;
}

function renderDoll(st, opts={}){
  st = resolveLayers(st);
  const c = figColors(st);
  ANIM = !!opts.anim;
  IDLE = opts.greet && ANIM ? { T: 3, ev: [{ kind:'hop', a:0.1, b:0.8 }] } : opts.idle && ANIM ? makeIdle(false) : null;
  if (IDLE && opts.idle){ const a = 3 + Math.random() * (IDLE.T - 6); if (IDLE.ev.every(e => a + 0.8 < e.a - 0.4 || a > e.b + 0.4)) IDLE.ev.push({ kind:'hop', a, b:a+0.7 }); }
  const hl = opts.hl || '';
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
