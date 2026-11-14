/* ================= fælles lærred til arkadespillene på skærm =================
   Spillet tegner i et fast koordinatsæt på 1600 x 1000, uanset skærmens størrelse. Lærredet fylder scenen,
   og koordinaterne skaleres, så hele spillefeltet altid kan ses (resten fyldes med baggrundsfarven).
   Tryk og træk kommer tilbage i spillets koordinater. */
function akCanvas(stage, bg, opts = {}){
  const cv = document.createElement('canvas'); stage.append(cv);
  const ctx = cv.getContext('2d');
  const V = { W: opts.W || 1600, H: opts.H || 1000, k: 1, ox: 0, oy: 0, dpr: 1 };
  function fit(){
    const w = stage.clientWidth || 800, h = stage.clientHeight || 500, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); V.dpr = dpr;
    V.k = Math.min(w / V.W, h / V.H); V.ox = (w - V.W * V.k) / 2; V.oy = (h - V.H * V.k) / 2;
  }
  fit();
  const onResize = () => fit(); window.addEventListener('resize', onResize);
  /* tegning: kald begin() før hver frame; så er koordinaterne spillets egne */
  function begin(){
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(V.k * V.dpr, 0, 0, V.k * V.dpr, V.ox * V.dpr, V.oy * V.dpr);
  }
  const toGame = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - V.ox) / V.k, y: (e.clientY - r.top - V.oy) / V.k }; };
  /* hvor meget af spillets bredde, der faktisk kan ses (bredere skærme viser mere til siderne) */
  const visX = () => [Math.max(-V.ox / V.k, -400), Math.min(V.W + V.ox / V.k, V.W + 400)];
  return { cv, ctx, V, begin, toGame, visX, dispose: () => window.removeEventListener('resize', onResize) };
}
/* små tegnehjælpere til lærredet */
function akStar(ctx, x, y, r, rot = 0){
  ctx.beginPath();
  for (let i = 0; i < 10; i++){ const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath();
}
function akRound(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
