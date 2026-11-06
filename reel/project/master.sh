set -e
CH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
cd /home/user/tools/enova
npx remotion render src/index.ts Reel out/reel_raw.mov --browser-executable=$CH --concurrency=2 --codec=h264 --crf=12 --audio-codec=pcm-16 --log=error
npx remotion render src/index.ts Reel out/reel_voice_raw.mov --props='{"withMusic":false}' --browser-executable=$CH --concurrency=2 --codec=h264 --crf=12 --audio-codec=pcm-16 --log=error
cd out
for v in reel reel_voice; do
  J=$(/usr/bin/ffmpeg -hide_banner -i ${v}_raw.mov -af loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  set -- $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'])")
  /usr/bin/ffmpeg -hide_banner -loglevel error -y -i ${v}_raw.mov -af "loudnorm=I=-13.7:TP=-1.5:LRA=7:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:linear=true,alimiter=limit=0.85:attack=2:release=60:level=disabled,aresample=48000" \
    -c:v libx264 -profile:v high -preset slow -b:v 16M -maxrate 20M -bufsize 32M -pix_fmt yuv420p -r 30 -c:a aac -b:a 320k -ar 48000 -movflags +faststart ${v}_final.mp4
  echo "$v: $(/usr/bin/ffmpeg -hide_banner -i ${v}_final.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|Peak):' | tr -s ' ' | tr '\n' ' ')"
done
