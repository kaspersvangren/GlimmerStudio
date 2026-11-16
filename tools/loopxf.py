# Finjusterer et loop (start + lokal forskydning) på sample-niveau og laver lytteprøve med overtoning,
# præcis som spillet gør det (lyd.js: m.xf sekunders overtoning lige før hoppet).
# Brug: python3 tools/loopxf.py sang.mp3 ud.mp3 start ca-forskydning overtoning [fast]   (fast = brug forskydningen som den er)
import sys, subprocess, numpy as np
src, out, S, LAG, XF = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
SR = 44100
X = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',src,'-f','f32le','-ac','2','-ar',str(SR),'-'], capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2)
M = X.mean(1)
# finjustering: overtoningsområdet før start skal ligne området før slut mest muligt
a = int((S - XF) * SR); w = M[a:int(S * SR)]
best = max(range(int((LAG - .03) * SR), int((LAG + .03) * SR)), key=lambda k: float(np.dot(w, M[a + k:a + k + len(w)])) / (np.linalg.norm(M[a + k:a + k + len(w)]) + 1e-9))
E = S + (LAG if len(sys.argv) > 6 and sys.argv[6] == 'fast' else best / SR)
si, ei, f = int(S * SR), int(E * SR), int(XF * SR)
Y = X.copy(); t = np.linspace(0, 1, f)[:, None]
Y[ei - f:ei] = X[ei - f:ei] * np.cos(t * np.pi / 2) + X[si - f:si] * np.sin(t * np.pi / 2)
prev = np.concatenate([Y[ei - 8 * SR:ei], Y[si:si + 8 * SR]])
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-b:a','160k',out], input=prev.astype(np.float32).tobytes(), check=True)
print('start %.5f slut %.5f (forskydning %.5f)' % (S, E, E - S))
