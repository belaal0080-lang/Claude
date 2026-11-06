"""Build the cut list, ffmpeg filter graph and Remotion timeline for the Enova reel."""
import json, os

W = "/home/user/tools/enova/work/"
RAW = "/home/user/tools/raw/"
FPS = 30
keeps = json.load(open(W + "keeps.json"))

# beat: id, source take, source window (s), visual spec, caption info, source-time events
BEATS = [
    dict(id="hook", src="IMG_9944", win=(12.32, 15.98), vis=dict(kind="broll", file="clip5.mov", ss=0.0),
         con="naya", key="Commercial", mod="hub", ev={"hit": 14.4}),
    dict(id="intro", src="IMG_9944", win=(0.0, 2.20), vis=dict(kind="aroll", scale=1.0),
         con="aaj hum hain", key="Giga Mall", mod="extension"),
    dict(id="question", src="IMG_9944", win=(3.47, 8.24), vis=dict(kind="aroll", scale=1.0, punch=7.55),
         con="sab se ahem sawal", key="Location", mod="kya hai?", ev={"pin": 7.55}),
    dict(id="best", src="IMG_9944", win=(8.90, 11.92), vis=dict(kind="aroll", scale=1.0),
         con="yeh hai", key="Best", mod="location"),
    dict(id="burst", src="IMG_9944", win=(16.10, 20.10), vis=dict(kind="burst"),
         con="renowned developer ka", key="Successful", mod="project"),
    dict(id="malls", src="IMG_9944", win=(20.75, 23.45), vis=dict(kind="aroll", scale=1.06),
         con="saamne aur saath", key="Malls", mod="all around", ev={"pin1": 20.9, "pin2": 22.2}),
    dict(id="offer", src="IMG_9946", win=(0.30, 10.70), vis=dict(kind="offer", split=4.0),
         con="kuch units abhi bhi", key="Available", mod="",
         ev={"ground": 4.2, "lg": 5.3, "mezz": 6.4}),
    dict(id="cta", src="IMG_9953", win=(0.20, 6.48), vis=dict(kind="aroll", scale=1.08),
         con="apna unit", key="Book", mod="karwain aaj hi", ev={"number": 4.3}),
]
END_CARD = 2.6

def segs_in(src, a, b):
    out = []
    for s0, s1 in keeps[src]:
        lo, hi = max(s0, a), min(s1, b)
        lo, hi = round(lo * FPS) / FPS, round(hi * FPS) / FPS
        if hi - lo >= 2 / FPS:
            out.append((round(lo, 4), round(hi, 4)))
    return out

def to_out(segs, t_src, beat_start):
    acc = beat_start
    for s0, s1 in segs:
        if t_src <= s0:
            return acc
        if t_src <= s1:
            return acc + (t_src - s0)
        acc += s1 - s0
    return acc

timeline, cursor, all_segs = [], 0.0, []
for b in BEATS:
    segs = segs_in(b["src"], *b["win"])
    dur = sum(s1 - s0 for s0, s1 in segs)
    ev = {k: round(to_out(segs, v, cursor), 3) for k, v in b.get("ev", {}).items()}
    vis = dict(b["vis"])
    if "punch" in vis:
        vis["punch_out"] = round(to_out(segs, vis["punch"], cursor), 3)
    if "split" in vis:
        vis["split_out"] = round(to_out(segs, vis["split"], cursor), 3)
    timeline.append(dict(id=b["id"], start=round(cursor, 3), end=round(cursor + dur, 3),
                         con=b["con"], key=b["key"], mod=b["mod"], ev=ev, vis=vis))
    for s0, s1 in segs:
        all_segs.append(dict(beat=b["id"], src=b["src"], s0=s0, s1=s1, o0=round(cursor, 3)))
        cursor += s1 - s0
total_voice = cursor
timeline.append(dict(id="end", start=round(cursor, 3), end=round(cursor + END_CARD, 3)))
total = cursor + END_CARD

# ---------- ffmpeg graph ----------
GRADE = ("eq=contrast=1.06:saturation=1.14:gamma=0.98,"
         "colorbalance=rs=-0.02:bs=0.03:rm=0.035:gm=0.01:bm=-0.03:rh=0.02:bh=-0.01,"
         "unsharp=5:5:0.45:5:5:0")
BROLL_CROP = "crop=590:1050:65:230"   # removes the logo strip at the top of the drone clips
inputs, idx = [], {}
def inp(path):
    if path not in idx:
        idx[path] = len(inputs); inputs.append(path)
    return idx[path]
for s in ["IMG_9944", "IMG_9946", "IMG_9953"]:
    inp(RAW + s + ".mov")
for s in ["IMG_9944", "IMG_9946", "IMG_9953"]:
    inp(W + s + ".df.wav")
for c in ["clip5.mov", "clip6.mov", "clip7.mov"]:
    inp(RAW + c)

vf, af, vlabels, alabels = [], [], [], []
n = 0
def scale_expr(scale):
    if scale == 1.0:
        return "scale=1080:1920:flags=lanczos"
    w = int(1080 / scale) // 2 * 2; h = int(1920 / scale) // 2 * 2
    return f"crop={w}:{h}:(iw-{w})/2:(ih-{h})*0.55,scale=1080:1920:flags=lanczos"

def drift(dur, z1=1.06):
    # slow push 1.00 -> z1 over the shot, rendered on an upscaled canvas
    frames = max(int(round(dur * FPS)), 1)
    return (f"scale=2160:3840:flags=lanczos,zoompan=z='1+({z1}-1)*on/{frames}':"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS}")

BURST = [("clip5.mov", 4.0), ("clip6.mov", 0.8), ("clip7.mov", 3.6), ("clip6.mov", 3.6), ("clip7.mov", 6.2), ("clip5.mov", 7.0)]
for t in timeline:
    if t["id"] == "end":
        continue
    vis = t["vis"]
    segs = [s for s in all_segs if s["beat"] == t["id"]]
    dur = t["end"] - t["start"]
    # audio: every kept piece, 4 ms fades to avoid clicks
    ai = idx[W + segs[0]["src"] + ".df.wav"]
    for s in segs:
        d = s["s1"] - s["s0"]
        af.append(f"[{ai}:a]atrim={s['s0']}:{s['s1']},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d=0.004,afade=t=out:st={max(d-0.004,0):.3f}:d=0.004[a{n}]")
        alabels.append(f"[a{n}]"); n += 1
    vi = idx[RAW + segs[0]["src"] + ".mov"]
    if vis["kind"] == "broll":
        bi = idx[RAW + vis["file"]]
        vf.append(f"[{bi}:v]trim={vis['ss']}:{vis['ss']+dur:.4f},setpts=PTS-STARTPTS,fps={FPS},{BROLL_CROP},{drift(dur)},{GRADE},setsar=1[v{n}]")
        vlabels.append(f"[v{n}]"); n += 1
    elif vis["kind"] == "burst":
        tot_f = int(round(dur * FPS)); base_f = tot_f // len(BURST)
        for j, (f, ss) in enumerate(BURST):
            nf = base_f + (tot_f - base_f * len(BURST) if j == len(BURST) - 1 else 0)
            per = nf / FPS
            bi = idx[RAW + f]
            vf.append(f"[{bi}:v]trim={ss}:{ss+per:.4f},setpts=PTS-STARTPTS,fps={FPS},{BROLL_CROP},{drift(per,1.08)},{GRADE},setsar=1[v{n}]")
            vlabels.append(f"[v{n}]"); n += 1
    elif vis["kind"] == "offer":
        split = vis["split_out"]; last_end = t["start"]
        for s in segs:
            o0 = s["o0"]; d = s["s1"] - s["s0"]
            if o0 + d <= split + 1e-6:
                last_end = o0 + d
                vf.append(f"[{vi}:v]trim={s['s0']}:{s['s1']},setpts=PTS-STARTPTS,fps={FPS},{scale_expr(1.0)},{GRADE},setsar=1[v{n}]")
                vlabels.append(f"[v{n}]"); n += 1
        rest = t["end"] - last_end
        vis["split_out"] = round(last_end, 4); t["vis"]["split_out"] = round(last_end, 4)
        # tower cutaway: top-left of the A-roll frame where only the building is, slow tilt up
        i44 = idx[RAW + "IMG_9944.mov"]
        frames = int(round(rest * FPS))
        rest = round(rest * FPS) / FPS
        vf.append(f"[{i44}:v]trim=15.3:{15.3+rest:.4f},setpts=PTS-STARTPTS,fps={FPS},crop=562:1000:30:0,"
                  f"scale=2160:3840:flags=lanczos,zoompan=z='1.04':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(1-on/{frames})':d=1:s=1080x1920:fps={FPS},"
                  f"{GRADE},setsar=1[v{n}]")
        vlabels.append(f"[v{n}]"); n += 1
    else:  # aroll
        punch = vis.get("punch_out")
        for s in segs:
            d = s["s1"] - s["s0"]
            sc = vis.get("scale", 1.0)
            if punch is not None and s["o0"] + d > punch:
                if s["o0"] < punch:  # split this piece at the punch point
                    cut = round((s["s0"] + (punch - s["o0"])) * FPS) / FPS
                    vf.append(f"[{vi}:v]trim={s['s0']}:{cut:.4f},setpts=PTS-STARTPTS,fps={FPS},{scale_expr(sc)},{GRADE},setsar=1[v{n}]")
                    vlabels.append(f"[v{n}]"); n += 1
                    vf.append(f"[{vi}:v]trim={cut:.4f}:{s['s1']},setpts=PTS-STARTPTS,fps={FPS},{scale_expr(1.12)},{GRADE},setsar=1[v{n}]")
                    vlabels.append(f"[v{n}]"); n += 1
                    continue
                sc = 1.12
            vf.append(f"[{vi}:v]trim={s['s0']}:{s['s1']},setpts=PTS-STARTPTS,fps={FPS},{scale_expr(sc)},{GRADE},setsar=1[v{n}]")
            vlabels.append(f"[v{n}]"); n += 1

# end card slot: ink frame (Remotion draws the card)
vf.append(f"color=c=0x121110:s=1080x1920:r={FPS}:d={END_CARD},setsar=1[v{n}]"); vlabels.append(f"[v{n}]"); n += 1
af.append(f"anullsrc=r=48000:cl=mono,atrim=0:{END_CARD}[a{n}]"); alabels.append(f"[a{n}]"); n += 1

graph = ";\n".join(vf + af)
graph += f";\n{''.join(vlabels)}concat=n={len(vlabels)}:v=1:a=0,format=yuv420p[vout]"
graph += (f";\n{''.join(alabels)}concat=n={len(alabels)}:v=0:a=1,"
          "highpass=f=90,lowpass=f=15000,"
          "equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=4000:t=q:w=1.5:g=3,"
          "deesser=i=0.4,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=4,"
          "alimiter=limit=0.89[aout]")
open(W + "graph.txt", "w").write(graph)
open(W + "inputs.txt", "w").write("\n".join(inputs))
json.dump(dict(fps=FPS, total=round(total, 3), voice=round(total_voice, 3), beats=timeline),
          open(W + "timeline.json", "w"), indent=1)
json.dump(all_segs, open(W + "segments.json", "w"), indent=1)
print(f"voice {total_voice:.2f}s + end {END_CARD}s = {total:.2f}s; video pieces {len(vlabels)}, audio pieces {len(alabels)}")
for t in timeline:
    print(f"  {t['id']:9s} {t['start']:6.2f}-{t['end']:6.2f}  {t.get('ev', '')}")

# ---------- per-piece rendering (keeps memory low) ----------
import re
cmds = []
for k, line in enumerate(vf):
    m = re.match(r"\[(\d+):v\](.*)\[v\d+\]$", line, re.S)
    out = f"{W}pieces/p{k:03d}.mov"
    if m:
        src = inputs[int(m.group(1))]
        cmds.append(f'/usr/bin/ffmpeg -hide_banner -loglevel error -y -i "{src}" -filter_complex "[0:v]{m.group(2)},format=yuv420p[o]" -map "[o]" -an -c:v libx264 -preset fast -crf 12 -r {FPS} "{out}"')
    else:
        chain = line.rsplit("[", 1)[0]
        cmds.append(f'/usr/bin/ffmpeg -hide_banner -loglevel error -y -f lavfi -i "{chain},format=yuv420p" -an -c:v libx264 -preset fast -crf 12 -r {FPS} "{out}"')
os.makedirs(W + "pieces", exist_ok=True)
open(W + "pieces.sh", "w").write("\n".join(cmds) + "\n")
open(W + "pieces.txt", "w").write("".join(f"file 'pieces/p{k:03d}.mov'\n" for k in range(len(vf))))
agraph = ";\n".join(af) + f";\n{''.join(alabels)}" + graph.split(f"{''.join(alabels)}", 1)[1]
open(W + "agraph.txt", "w").write(agraph)
print("pieces", len(cmds))
