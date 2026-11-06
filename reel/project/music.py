"""Original 100 BPM percussive bed + SFX for the Enova reel. Everything is synthesised here (royalty-free)."""
import json, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
W = "/home/user/tools/enova/work/"
OUT = "/home/user/tools/enova/public/"
tl = json.load(open(W + "timeline.json"))
TOTAL = tl["total"]
B = {b["id"]: b for b in tl["beats"]}
rng = np.random.default_rng(7)

def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(t / a, 1.0) * np.exp(-curve * t / d)
    return e
def place(buf, snd, t, gain=1.0):
    i = int(t * SR)
    if i < 0:
        snd = snd[-i:]; i = 0
    if i >= len(buf) or len(snd) == 0: return
    j = min(len(buf), i + len(snd)); buf[i:j] += snd[: j - i] * gain

# ---------- instruments ----------
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.001, 0.35, 3.2)
    click = hp(rng.standard_normal(n), 2500) * env(n, 0.0005, 0.008, 5)
    return np.tanh(1.6 * (s + 0.25 * click))
def clap():
    n = int(0.3 * SR); nz = bp(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR); e[i:] += env(n - i, 0.0005, 0.03 if k < 2 else 0.18, 4)
    return nz * e * 0.8
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return hp(rng.standard_normal(n), 7000, 4) * env(n, 0.0005, 0.2 if open_ else 0.03, 4) * 0.35
def saw(f, n):
    t = np.arange(n) / SR
    return 2 * ((t * f) % 1.0) - 1
def bass(f, dur):
    n = int(dur * SR)
    s = lp(saw(f, n) + 0.5 * np.sin(2 * np.pi * f * np.arange(n) / SR), 220, 2)
    e = np.minimum(np.arange(n) / (0.005 * SR), 1) * np.clip((n - np.arange(n)) / (0.04 * SR), 0, 1)
    return np.tanh(2.2 * s) * e * 0.55
def pad(freqs, dur):
    n = int(dur * SR); s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            s += saw(f * 2 ** (det / 12), n)
    s = lp(s / (3 * len(freqs)), 1400, 2)
    a = int(0.25 * SR); r = int(0.4 * SR)
    e = np.ones(n); e[:a] = np.linspace(0, 1, a); e[-r:] = np.linspace(1, 0, r)
    return s * e * 0.22
def pluck(f, dur=0.35):
    n = int(dur * SR)
    return lp(saw(f, n) * env(n, 0.001, 0.18, 4), 3200) * 0.18

# ---------- arrangement ----------
BPM = 100; beat = 60 / BPM; bar = 4 * beat
drop = B["hook"]["ev"]["hit"]                 # first downbeat lands on "hub"
t0 = drop - bar * np.ceil(drop / bar)          # grid origin (<= 0)
n = int((TOTAL + 1.5) * SR)
drums, low, harm = np.zeros(n), np.zeros(n), np.zeros(n)
A, F, C, G = 55.0, 43.65, 65.41, 49.0          # A minor: Am F C G
chords = [(A, [220, 261.6, 329.6]), (F, [174.6, 220, 261.6]), (C, [130.8, 164.8, 196, 261.6]), (G, [196, 246.9, 293.7])]
burst = (B["burst"]["start"], B["burst"]["end"])
end_start = B["end"]["start"]
music_end = TOTAL - 0.2

k = 0; t = t0
while t < music_end:
    root, notes = chords[(k // 1) % 4]
    in_intro = t < drop - 1e-6
    if not in_intro:
        harm_seg = pad(notes, bar + 0.3); place(harm, harm_seg, t)
        for q in range(4):
            tb = t + q * beat
            if tb >= music_end: break
            place(drums, kick(), tb, 1.0 if q in (0, 2) else (0.75 if burst[0] <= tb < burst[1] else 0.0))
            if q in (1, 3): place(drums, clap(), tb, 0.9)
            for e8 in (0, 0.5):
                th = tb + e8 * beat
                if th < music_end: place(drums, hat(open_=(e8 == 0.5 and q == 3)), th, 0.9 if e8 else 0.55)
            if burst[0] <= tb < burst[1]:
                for s16 in (0.25, 0.75): place(drums, hat(), tb + s16 * beat, 0.5)
            # bass: root on 1, octave pickup on the "and" of 2 and 4
            place(low, bass(root, beat * 0.9), tb, 1.0 if q in (0, 2) else 0.0)
            if q in (1, 3): place(low, bass(root * 2, beat * 0.4), tb + 0.5 * beat, 0.6)
        # pluck motif in the burst and end card
        if burst[0] - bar <= t < burst[1] or t >= end_start - bar:
            for i, m in enumerate([2, 1, 0, 1, 2, 3, 2, 1]):
                place(harm, pluck(notes[m % len(notes)] * 2), t + i * beat / 2, 1.0)
    else:
        # intro: filtered pad swell into the drop
        place(harm, lp(pad(notes, bar + 0.3), 600), t, 0.8)
    k += 1; t += bar

mix = drums * 0.9 + low * 0.9 + harm
fade = int(0.8 * SR); stop = int(music_end * SR)
mix[stop - fade:stop] *= np.linspace(1, 0, fade); mix[stop:] = 0
mix = np.tanh(1.2 * mix) / np.tanh(1.2)
mix = mix[: int(TOTAL * SR)]
mix /= np.max(np.abs(mix)) + 1e-9
st = np.stack([mix, mix], 1) * 0.8
wavfile.write(OUT + "music.wav", SR, (st * 32767).astype(np.int16))

# ---------- SFX ----------
def write(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(OUT + name, SR, (np.stack([x, x], 1) * 32767).astype(np.int16))
nT = int(0.05 * SR); tt = np.arange(nT) / SR
write("tick.wav", np.sin(2 * np.pi * 2600 * tt) * env(nT, 0.0003, 0.012, 5) + 0.4 * hp(rng.standard_normal(nT), 5000) * env(nT, 0.0002, 0.004, 5))
nW = int(0.45 * SR); sweep = np.zeros(nW); x = rng.standard_normal(nW)
for i in range(0, nW, 480):
    f = 400 + 5000 * np.sin(np.pi * i / nW); seg = bp(x[i:i + 960], max(f * 0.6, 100), min(f * 1.4, 20000), 1)[:480]
    sweep[i:i + len(seg)] = seg
write("whoosh.wav", sweep * np.sin(np.pi * np.arange(nW) / nW) ** 2)
nR = int(1.6 * SR); tr = np.arange(nR) / SR
riser = hp(rng.standard_normal(nR), 1500) * (tr / tr[-1]) ** 2.2 * 0.6 + 0.35 * np.sin(2 * np.pi * np.cumsum(200 + 900 * (tr / tr[-1]) ** 2) / SR) * (tr / tr[-1]) ** 2
write("riser.wav", riser)
nS = int(0.9 * SR); ts = np.arange(nS) / SR
write("subhit.wav", np.tanh(2 * np.sin(2 * np.pi * np.cumsum(32 + 40 * np.exp(-ts * 9)) / SR)) * env(nS, 0.002, 0.7, 3))
nP = int(0.12 * SR); tp = np.arange(nP) / SR
write("pop.wav", np.sin(2 * np.pi * np.cumsum(900 - 500 * tp / tp[-1]) / SR) * env(nP, 0.001, 0.06, 4))
print("music", round(len(mix) / SR, 2), "s; drop at", round(drop, 3), "grid origin", round(t0, 3))
