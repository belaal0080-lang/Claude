set -e
cd /home/user/tools/enova
python3 -I build.py | tail -12
cd work
rm -f pieces/*.mov cmds/*.sh
python3 -I -c "
for k,l in enumerate(open('pieces.sh').read().strip().split('\n')): open(f'cmds/c{k:03d}.sh','w').write(l+'\n')"
ls cmds/*.sh | xargs -P 2 -n 1 bash
/usr/bin/ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i pieces.txt -c copy -an ../public/base.mp4
sed -e 's/\[3:a\]/[0:a]/g; s/\[4:a\]/[1:a]/g; s/\[5:a\]/[2:a]/g' agraph.txt > agraph2.txt
/usr/bin/ffmpeg -hide_banner -loglevel error -y -i IMG_9944.df.wav -i IMG_9946.df.wav -i IMG_9953.df.wav -/filter_complex agraph2.txt -map "[aout]" -ar 48000 voice.wav 2>/dev/null || /usr/bin/ffmpeg -hide_banner -loglevel error -y -i IMG_9944.df.wav -i IMG_9946.df.wav -i IMG_9953.df.wav -filter_complex_script agraph2.txt -map "[aout]" -ar 48000 voice.wav
/usr/bin/ffmpeg -hide_banner -loglevel error -y -i voice.wav -af "equalizer=f=2500:t=q:w=1.4:g=2,equalizer=f=120:t=q:w=1:g=1.5,acompressor=threshold=-26dB:ratio=2.5:attack=5:release=100:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=6" -ar 48000 ../public/voice.wav
cp timeline.json ../src/timeline.json
cd ..
T=$(python3 -c "import json;print(json.load(open('src/timeline.json'))['total'])")
E=$(python3 -c "import json;print([b for b in json.load(open('src/timeline.json'))['beats'] if b['id']=='end'][0]['start'])")
# music body runs to the end card, song's real ending crossfades in exactly on the end card
BODY=$(python3 -c "print($E+0.25)")
/usr/bin/ffmpeg -hide_banner -loglevel error -y -i /home/user/tools/music/Inspired.mp3 -filter_complex "[0:a]atrim=34.987:$(python3 -c "print(34.987+$BODY)"),asetpts=PTS-STARTPTS[b];[0:a]atrim=277.9:282,asetpts=PTS-STARTPTS[t];[b][t]acrossfade=d=0.5:c1=tri:c2=tri,atrim=0:$T,afade=t=out:st=$(python3 -c "print($T-0.4)"):d=0.4,aresample=48000,loudnorm=I=-16:TP=-2:linear=true" -ac 2 public/music.wav
echo "base $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/base.mp4)  voice $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/voice.wav)  music $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/music.wav)  total $T"
