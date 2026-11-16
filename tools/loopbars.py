# Loop-forslag der følger musikkens takter: hoppet sker lige før et taktslag, og loopet er et helt antal
# 4-taktsfraser, valgt så de 16 slag før og efter hoppet ligner hinanden mest (melodi og klang).
# Brug: [BPM=82] python3 tools/loopbars.py sang.mp3 udmappe [antal] [mindste andel af sangen, fx 0.4] [prefix]
import sys, os, json, subprocess, numpy as np, librosa
src, out = sys.argv[1], sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 3
MINF = float(sys.argv[4]) if len(sys.argv) > 4 else 0.4; PRE = sys.argv[5] if len(sys.argv) > 5 else 'Loop'
os.makedirs(out, exist_ok=True)
y, sr = librosa.load(src, sr=22050); H = 128
on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=H)
tempo, bf = librosa.beat.beat_track(onset_envelope=on, sr=sr, hop_length=H, tightness=400, **({'start_bpm': float(os.environ['BPM'])} if os.environ.get('BPM') else {}))
bt = librosa.frames_to_time(bf, sr=sr, hop_length=H); nb = len(bt)
ch = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=H)
mel = librosa.power_to_db(librosa.feature.melspectrogram(y=y, sr=sr, hop_length=H, n_mels=48))
def sync(F):
    s = librosa.util.sync(F, bf, aggregate=np.mean)[:, 1:nb]; s = s - s.mean(1, keepdims=True); return s / (np.linalg.norm(s, axis=0, keepdims=True) + 1e-9)
C, M = sync(ch), sync(mel); S = 0.5 * C.T @ C + 0.5 * M.T @ M; n = S.shape[0]   # S[i] = slag i -> i+1
W = 16; res = []
for i in range(W, n - W):
    for L in range(16, n, 16):
        j = i + L
        if j + W > n or bt[j] - bt[i] < MINF * len(y) / sr: continue
        pre = np.mean([S[i - k, j - k] for k in range(1, W + 1)]); post = np.mean([S[i + k, j + k] for k in range(W)])
        res.append((pre + post, i, j))
res.sort(reverse=True); pick = []
for sc, i, j in res:
    if all(abs(bt[i] - bt[a]) > 3 or abs(bt[j] - bt[b]) > 3 for _, a, b in pick): pick.append((sc, i, j))
    if len(pick) == N: break
X = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',src,'-f','f32le','-ac','2','-ar','44100','-'], capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2); SR = 44100
fps = sr / H
def refine(t):   # læg tiden præcis på anslaget (±25 ms)
    a = int((t - .025) * fps); seg = on[a:a + int(.05 * fps) + 1]; return (a + int(np.argmax(seg))) / fps
out_l = []
for k, (sc, i, j) in enumerate(pick):
    s, e = refine(bt[i]) - .015, refine(bt[j]) - .015
    si, ei, f = int(s * SR), int(e * SR), int(.01 * SR); Y = X.copy(); t = np.linspace(0, 1, f)[:, None]
    Y[ei - f:ei] = X[ei - f:ei] * np.cos(t * np.pi / 2) + X[si - f:si] * np.sin(t * np.pi / 2)
    pv = np.concatenate([Y[max(0, ei - 8 * SR):ei], Y[si:si + 8 * SR]]); name = f'{PRE} ' + 'ABCDEFG'[k]
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i','-','-b:a','160k',os.path.join(out, name + '.mp3')], input=pv.astype(np.float32).tobytes(), check=True)
    out_l.append({'navn': name, 'start': round(s, 5), 'slut': round(e, 5), 'slag': j - i, 'score': round(float(sc), 3)})
print(json.dumps({'tempo': round(float(np.atleast_1d(tempo)[0]), 1), 'loops': out_l}, ensure_ascii=False, indent=1))
