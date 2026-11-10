'use strict';
/* ================= Glimmer Studio — fælles værktøjer ================= */
const VERSION = 'v0.6.0';
const $ = s => document.querySelector(s);
const clone = o => JSON.parse(JSON.stringify(o));
const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
  del(k){ try { localStorage.removeItem(k); } catch(e){} }
};
const KEY = 'glimmerstudiet.dukker.v1', KEY_SOUND = 'glimmerstudiet.lyd', KEY_PROG = 'glimmerstudiet.fremskridt.v1';
const pick = a => a[Math.floor(Math.random()*a.length)];
const pickOther = (a, not) => { let v; do { v = pick(a); } while (v===not && a.length>1); return v; };
const shuffle = a => { const b = a.slice(); for (let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- farvepaletter ---------- */
const SKIN = ['#FFE6D6','#FAD4BE','#F8CDAE','#EDB98F','#E0A274','#D9A074','#C68653','#A86B42','#8E5B3C','#734429','#5A321D','#3F2214','#C9E6FF','#C8F2DE','#E1D3FF','#FFD1E6'];
const COLORS = ['#FF5FA8','#FF8FC7','#FFC1DC','#E0457A','#B79BFF','#8A5BE8','#5E3BC4','#6FA8FF','#2F6FE0','#7FD8FF','#62E0CB','#22B39E','#9BE36A','#3FA34D','#FFE27A','#FFC02E','#FF9A4D','#FF5A4A','#C2272D','#FFFFFF','#E8E4F2','#9C95B5','#4A4560','#1E1A2E'];
const HAIR = ['#1F1A2B','#3B2A20','#5C3A24','#8A5A35','#B07A45','#D8A55B','#F2D27A','#FFE9A8','#E8E4EE','#B5432A','#E2672E','#FF9ACB','#FF5FA8','#8A5BE8','#B79BFF','#4F7BFF','#7FD8FF','#3FD6C2','#62E0CB','#9BE36A','#FFE07A','#FF7A45'];
const EYES = ['#16B3B8','#3D8BFF','#7FB8E8','#3FA34D','#7BC96F','#8A5B2E','#5C3A24','#C98A2E','#E58E1C','#8A5BE8','#B79BFF','#FF5FA8','#E0457A','#7A7A8C','#2A2340'];
const SHADOW = ['#FF62B0','#FFB3D1','#B48CFF','#7FD8FF','#62E0CB','#FFC02E','#FF9A4D','#C9A27A','#9BE36A','#4F7BFF','#2A2340','#F5E6FF'];
const LIPS = ['#EE4C86','#FF8FB0','#D0246B','#C2272D','#FF5A4A','#E8957F','#C77B6A','#A0526B','#8A5BE8','#B79BFF','#62E0CB','#4A2338'];
const BLUSH = ['#FF7FA6','#FF9E86','#FFB3D1','#E0457A','#B79BFF'];
const FUR = ['#FFFFFF','#F5EEFF','#FFE9D6','#F2D9B8','#E0B98A','#C68653','#8A5A35','#5C3A24','#3B2A20','#9C95B5','#4A4560','#1E1A2E','#FFC9E2','#FF8FC7','#B79BFF','#7FD8FF','#62E0CB','#9BE36A','#FFE27A','#FF9A4D'];

/* ---------- udsnit til miniaturer ---------- */
const VB = { head:'150 110 500 500', hair:'40 80 720 820', eye:'226 352 190 170', lips:'348 494 104 72', face:'190 310 420 290',
  top:'240 570 320 320', bottom:'230 715 340 340', shoes:'270 900 260 180', neck:'300 560 200 140', hand:'400 600 300 300', pet:'520 750 280 310', full:'60 80 680 1000' };
const ACC_VB = { sloejfe:VB.head, tiara:VB.head, katteoerer:VB.head, spaender:VB.head, kasket:VB.head, briller:'200 340 400 220', halskaede:VB.neck, butterfly:VB.neck, armbaand:VB.hand, taske:VB.hand, stav:'400 470 330 330' };

/* ---------- DOM ---------- */
function el(tag, attrs={}, kids=[]){
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)){ if (k==='on') for (const [ev,fn] of Object.entries(v)) e.addEventListener(ev, fn); else if (k==='html') e.innerHTML = v; else if (v!==undefined && v!==null && v!==false) e.setAttribute(k, v); }
  for (const kid of [].concat(kids)) if (kid!==null && kid!==undefined && kid!==false) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}
const dollImg = (st, opts={}) => el('img', { src: svgUrl(renderDoll(st, opts)), alt: opts.alt || '' });
const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="#FFC02E" stroke="#C98A00" stroke-width="1.4" stroke-linejoin="round"/></svg>';
const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3" fill="#7B5CFF"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#7B5CFF" stroke-width="2.6"/><circle cx="12" cy="15.5" r="1.8" fill="#FFFFFF"/></svg>';

/* ---------- skærme ---------- */
const SCREENS = ['#title','#town','#home','#editor','#balls','#game'];
function showScreen(id){ for (const s of SCREENS) $(s).hidden = s !== id; window.scrollTo(0,0); }

/* ---------- lyd ---------- */
let AC = null, soundOn = store.get(KEY_SOUND, true);
function tone(f, dur=0.09, type='sine', vol=0.07, delay=0, slide=1.45){
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f*slide, t+dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.012); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+0.03);
  } catch(e){}
}
const sfx = {
  pick: () => tone(820, 0.07, 'triangle', 0.06),
  color: () => tone(1040, 0.05, 'sine', 0.045),
  magic: () => [523,659,784,1047,1319].forEach((f,i)=>tone(f,0.13,'triangle',0.06,i*0.06)),
  undo: () => tone(520, 0.09, 'sine', 0.05),
  open: () => [660,880].forEach((f,i)=>tone(f,0.08,'triangle',0.05,i*0.07)),
  nope: () => { tone(300, 0.12, 'square', 0.035, 0, 0.8); tone(240, 0.14, 'square', 0.035, 0.1, 0.8); },
  coin: () => [988,1319].forEach((f,i)=>tone(f,0.09,'square',0.035,i*0.07,1.02)),
  wobble: () => tone(380, 0.12, 'sine', 0.07, 0, 1.8),
  crack: () => { [1568,1319,1047,784,1047,1319,1568,2093].forEach((f,i)=>tone(f,0.11,'triangle',0.06,i*0.05,1.1)); },
  paddle: s => { const base = 300 + s*60; tone(base, 0.14, 'triangle', 0.07, 0, 1.2); if (s>=8) tone(base*1.5, 0.16, 'triangle', 0.06, 0.1, 1.2); },
  fanfare: () => [523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f, i===6?0.4:0.12, 'square', 0.04, i*0.11, 1.0)),
  whoosh: () => tone(200, 0.25, 'sine', 0.05, 0, 3),
};

/* ---------- små beskeder og dialog ---------- */
let toastTimer = null;
function toast(text){ const t = $('#toast'); t.textContent = text; t.hidden = false; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>{ t.hidden = true; }, 2200); }
function showModal(title, text, buttons){
  $('#modalTitle').textContent = title; $('#modalText').textContent = text || '';
  const row = $('#modalRow'); row.innerHTML = '';
  for (const b of buttons) row.append(el('button', { class:'btn' + (b.hot?' hot':''), type:'button', on:{ click: () => { if (!b.keep) hideModal(); b.fn && b.fn(); } } }, b.label));
  $('#modal').hidden = false; const first = row.querySelector('button'); first && first.focus();
}
const hideModal = () => { $('#modal').hidden = true; };
function confetti(host, n=40){
  const cols = ['#FF3D8F','#7B5CFF','#43D3BE','#FFC02E','#FF9A4D','#7FD8FF'];
  for (let i=0;i<n;i++){ const c = el('span', { class:'confetti', 'aria-hidden':'true' }); c.style.left = (Math.random()*100)+'%'; c.style.background = pick(cols); c.style.animationDelay = (Math.random()*0.6)+'s'; c.style.animationDuration = (1.6+Math.random()*1.4)+'s'; c.style.transform = `rotate(${Math.random()*360}deg)`; host.append(c); setTimeout(()=>c.remove(), 3600); }
}
