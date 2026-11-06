import sys, wave, numpy as np, torch
from df.enhance import enhance, init_df
model, state, _ = init_df("/home/user/tools/dfmodel/DeepFilterNet3")
sr = state.sr()
for src in sys.argv[1:]:
    w = wave.open(src); assert w.getframerate() == sr, w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    y = enhance(model, state, torch.from_numpy(x)[None]).squeeze().numpy()
    out = src.replace('.48k.wav', '.df.wav')
    o = wave.open(out, 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
    o.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
    print('wrote', out)
