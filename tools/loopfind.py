# Finder gode loop-punkter i et musikstykke og laver lytteprøver (8 s før hoppet + 8 s efter).
# Brug: python3 tools/loopfind.py sang.mp3 udmappe [antal] [mindste loop i sekunder]
import sys, os, json, subprocess, numpy as np
src, out = sys.argv[1], sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 3; MINL = float(sys.argv[4]) if len(sys.argv) > 4 else 40
os.makedirs(out, exist_ok=True)
def dec(sr, ch): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',src,'-f','f32le','-ac',str(ch),'-ar',str(sr),'-'], capture_output=True, check=True).stdout, dtype=np.float32)
x = dec(22050, 1); sr = 22050
# 1) grove kandidater: lignende klang i 5 s på hver side (rammer på 0,1 s)
hop, n = 2205, 4096; win = np.hanning(n); fr = 1 + (len(x) - n)//hop
edges = np.unique(np.geomspace(3, n//2, 49).astype(int))
F = np.array([np.log1p(np.add.reduceat(np.abs(np.fft.rfft(x[k*hop:k*hop+n]*win)), edges)[:48]) for k in range(fr)])
F -= F.mean(1, keepdims=True); F /= np.linalg.norm(F, axis=1, keepdims=True) + 1e-9
S = F @ F.T; W = 50; best = []
for lag in range(int(MINL*10), fr - 60):
    d = np.diagonal(S, offset=lag)
    if len(d) < 2*W + 1: continue
    c = np.convolve(d, np.ones(2*W+1)/(2*W+1), 'valid'); i = int(np.argmax(c)); best.append((float(c[i]), i + W, i + W + lag))
best.sort(reverse=True); cand = []
for sc, i, j in best:
    if j < fr - 30 and all(abs(j - b) > 60 or abs(i - a) > 60 for _, a, b in cand): cand.append((sc, i/10, j/10))
    if len(cand) == N * 8: break
# 2) tempo og anslags-kurve (fin opløsning)
h2 = 64; n2 = 1024; w2 = np.hanning(n2); f2 = 1 + (len(x) - n2)//h2; fps = sr/h2
Sp = np.array([np.log1p(np.abs(np.fft.rfft(x[k*h2:k*h2+n2]*w2))*10) for k in range(f2)], dtype=np.float32)
env = np.r_[0, np.maximum(np.diff(Sp, axis=0), 0).sum(1)]; e0 = env - env.mean()
ac = np.correlate(e0[:int(60*fps)], e0[:int(60*fps)], 'full')[int(60*fps)-1:]
lo, hi = int(fps*.3), int(fps*1.5); beat = (lo + int(np.argmax(ac[lo:hi]))) / fps
def onsetc(s, e, Wd=10):
    a = int(s*fps); seg = env[a:a+int(Wd*fps)]; b0 = int(e*fps); b = env[b0:b0+len(seg)]
    if len(b) < len(seg): return -1
    return float(np.dot(seg-seg.mean(), b-b.mean())/(np.std(seg)*np.std(b)*len(seg)+1e-9))
X = dec(48000, 2).reshape(-1, 2); SR = 48000; M = X.mean(1)
res = []
for sc, s, e in cand:
    # længden skal være et helt antal slag; prøv også et halvt slag forskudt, og vælg det der rammer anslagene bedst
    nb = round((e - s)/beat); opts = []
    for L0 in (nb*beat, (nb - .5)*beat, (nb + .5)*beat):
        for d in np.arange(-0.12, 0.12, 1/fps):
            opts.append((onsetc(s, s + L0 + d), s + L0 + d))
    oc, e2 = max(opts)
    si, ei = int(s*SR), int(e2*SR); w = M[si:si+4800]
    ei += max(range(-240, 241), key=lambda k: float(np.dot(w, M[ei+k:ei+k+4800])))
    res.append({'start': round(s, 5), 'end': round(ei/SR, 5), 'klang': round(sc, 3), 'anslag': round(oc, 3)})
res.sort(key=lambda r: -(r['klang'] + r['anslag']))
uniq = []
for r in res:   # kun bud der er tydeligt forskellige: start eller slut mindst 3 s fra et bedre bud
    if all(abs(r['start'] - u['start']) > 3 or abs(r['end'] - u['end']) > 3 for u in uniq): uniq.append(r)
res = uniq[:N]
for k, r in enumerate(res):
    si, ei = int(r['start']*SR), int(r['end']*SR)
    pre = X[ei-8*SR:ei].copy(); post = X[si:si+8*SR]; f = int(.006*SR); rr = np.linspace(0, 1, f)[:, None]
    pre[-f:] = pre[-f:]*(1-rr) + post[:f]*rr
    name = 'Loop ' + 'ABCDEFG'[k]; r['navn'] = name
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','48000','-ac','2','-i','-','-b:a','160k',os.path.join(out, name + '.mp3')], input=np.concatenate([pre, post[f:]]).astype(np.float32).tobytes(), check=True)
print(json.dumps({'tempo': round(60/beat, 1), 'loops': res}, indent=1, ensure_ascii=False))
