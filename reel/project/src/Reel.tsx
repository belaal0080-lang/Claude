import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import tl from './timeline.json';

// Brand tokens (Ember sheet, applied to Enova)
const C = {ink: '#121110', bone: '#F4EEE3', sand: '#B8AC9B', ember: '#FF5B22', emberDeep: '#C8410F'};
const BRAND = 'Enova Real Estate & Builders';
const PHONE = '+92 343 5546056';
const FPS = tl.fps;
const f = (s: number) => Math.round(s * FPS);
type Beat = (typeof tl.beats)[number] & {ev?: Record<string, number>; vis?: any};
const beats = tl.beats as Beat[];
const B = Object.fromEntries(beats.map((b) => [b.id, b])) as Record<string, Beat>;

const display: React.CSSProperties = {fontFamily: 'Archivo', fontVariationSettings: '"wdth" 125', fontWeight: 850};
const shadow = '0 4px 24px rgba(18,17,16,.45)';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Archivo', `url(${staticFile('fonts/archivo.woff2')})`, {weight: '400 900', stretch: '62% 125%'}),
      new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-italic.woff2')})`, {style: 'italic'}),
      new FontFace('Manrope', `url(${staticFile('fonts/manrope.woff2')})`, {weight: '500 800'}),
    ];
    Promise.all(faces.map((x) => x.load())).then((loaded) => {
      loaded.forEach((x) => (document as any).fonts.add(x));
      continueRender(handle);
    });
  }, [handle]);
};

// ---------- caption stack: connector / KEYWORD (ember swipe) / modifier ----------
const Stack: React.FC<{con: string; word: string; mod: string; top: number; dur: number}> = ({con, word, mod, top, dur}) => {
  const fr = useCurrentFrame();
  const t = fr - 2; // land 2 frames after the cut
  const swipe = interpolate(t, [0, 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const kScale = interpolate(t, [0, 3], [1.14, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const kBlur = interpolate(t, [0, 3], [3, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kOp = interpolate(t, [-1, 0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cOp = interpolate(t, [-2, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mT = t - 1;
  const mY = interpolate(mT, [0, 4], [10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const mOp = interpolate(mT, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 86, right: 130, top, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      {con ? (
        <div style={{fontFamily: 'Manrope', fontWeight: 650, fontSize: 56, color: C.bone, opacity: cOp, textShadow: '0 2px 12px rgba(0,0,0,.6)', marginBottom: 4}}>{con}</div>
      ) : null}
      <div style={{position: 'relative', padding: '4px 18px 12px', transform: `scale(${kScale})`, transformOrigin: 'left center', filter: `blur(${kBlur}px)`, opacity: kOp}}>
        <div style={{position: 'absolute', left: 0, bottom: 10, height: '38%', width: '100%', background: C.ember, transform: `scaleX(${swipe})`, transformOrigin: 'left'}} />
        <div style={{position: 'relative', ...display, fontSize: Math.min(158, Math.floor(800 / (word.length * 0.9))), lineHeight: 1, textTransform: 'uppercase', color: C.bone, textShadow: shadow, whiteSpace: 'nowrap'}}>{word}</div>
      </div>
      {mod ? (
        <div style={{marginLeft: '28%', marginTop: 6, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 120, lineHeight: 1, color: C.ember, opacity: mOp, transform: `translateY(${mY}px)`, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,.7), 0 2px 16px rgba(0,0,0,.55)'}}>{mod}</div>
      ) : null}
    </div>
  );
};

const Bug: React.FC = () => (
  <div style={{position: 'absolute', top: 120, right: 140, width: 84, height: 84, borderRadius: 20, background: C.ember, color: C.ink, display: 'grid', placeItems: 'center', ...display, fontSize: 46, opacity: 0.92}}>E</div>
);

// 3-frame ember flash at section changes
const Flash: React.FC = () => {
  const fr = useCurrentFrame();
  const op = interpolate(fr, [0, 1, 3], [0.6, 0.45, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: C.ember, mixBlendMode: 'screen', opacity: op}} />;
};

// whip: a blurred ember streak crossing the frame in 8 frames
const Whip: React.FC = () => {
  const fr = useCurrentFrame();
  const x = interpolate(fr, [0, 8], [-1300, 1300], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const op = interpolate(fr, [0, 2, 6, 8], [0, 0.85, 0.85, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: -200, bottom: -200, left: 0, width: 900, transform: `translateX(${x}px) skewX(-12deg)`, background: `linear-gradient(90deg, transparent, ${C.ember} 45%, #FFD2BF 50%, ${C.ember} 55%, transparent)`, filter: 'blur(40px)', opacity: op}} />
    </AbsoluteFill>
  );
};

const MapPin: React.FC<{x: number; y: number}> = ({x, y}) => {
  const fr = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: fr, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
  const dy = interpolate(s, [0, 1], [-160, 0]);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translateY(${dy}px)`, opacity: Math.min(1, fr / 2)}}>
      <svg width="96" height="128" viewBox="0 0 48 64"><path d="M24 2C12 2 3 11 3 23c0 16 21 38 21 38s21-22 21-38C45 11 36 2 24 2z" fill={C.ember} /><circle cx="24" cy="23" r="8" fill={C.ink} /></svg>
    </div>
  );
};

const Tag: React.FC<{text: string; sub: string; side: 'left' | 'right'; top: number}> = ({text, sub, side, top}) => {
  const fr = useCurrentFrame();
  const x = interpolate(fr, [0, 6], [side === 'left' ? -420 : 420, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  return (
    <div style={{position: 'absolute', top, [side]: 70, transform: `translateX(${x}px)`, background: C.ember, color: C.ink, borderRadius: 18, padding: '14px 24px', display: 'flex', flexDirection: 'column', boxShadow: shadow}}>
      <span style={{...display, fontSize: 52, lineHeight: 1}}>{side === 'left' ? '◂ ' : ''}{text}{side === 'right' ? ' ▸' : ''}</span>
      <span style={{fontFamily: 'Manrope', fontWeight: 700, fontSize: 30, marginTop: 6}}>{sub}</span>
    </div>
  );
};

const FloorTag: React.FC<{label: string; bottom: number}> = ({label, bottom}) => {
  const fr = useCurrentFrame();
  const y = interpolate(fr, [0, 5], [60, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const op = interpolate(fr, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  const bar = interpolate(fr, [0, 4], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 86, right: 150, bottom, transform: `translateY(${y}px)`, opacity: op, background: 'rgba(18,17,16,.84)', display: 'flex', alignItems: 'center'}}>
      <div style={{width: 24, alignSelf: 'stretch', background: C.ember, transform: `scaleY(${bar})`}} />
      <span style={{...display, fontVariationSettings: '"wdth" 112', fontSize: 78, color: C.bone, padding: '22px 34px', textTransform: 'uppercase'}}>{label}</span>
    </div>
  );
};

const NumberCard: React.FC = () => {
  const fr = useCurrentFrame();
  const y = interpolate(fr, [0, 6], [80, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const op = interpolate(fr, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 70, right: 150, top: 1250, transform: `translateY(${y}px)`, opacity: op, background: C.ink, display: 'flex'}}>
      <div style={{width: 22, background: C.ember}} />
      <div style={{padding: '24px 32px', display: 'flex', flexDirection: 'column'}}>
        <span style={{fontFamily: 'Manrope', fontWeight: 700, fontSize: 40, color: C.sand}}>WhatsApp</span>
        <span style={{...display, fontVariationSettings: '"wdth" 112', fontSize: 84, color: C.bone, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{PHONE}</span>
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const a = (d: number) => interpolate(fr, [d, d + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: C.ink, justifyContent: 'flex-end', padding: '0 110px 520px'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 34}}>
        <div style={{height: 22, width: 200 * a(0), background: C.ember}} />
        <div style={{fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 132, lineHeight: 1.02, color: C.bone, opacity: a(2), transform: `translateY(${(1 - a(2)) * 14}px)`}}>Book your unit</div>
        <div style={{...display, fontVariationSettings: '"wdth" 112', fontSize: 96, color: C.ember, opacity: a(5), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{PHONE}</div>
        <div style={{fontFamily: 'Manrope', fontWeight: 650, fontSize: 44, color: C.sand, opacity: a(8)}}>WhatsApp · {BRAND}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 50, opacity: a(10)}}>
          <div style={{width: 110, height: 110, borderRadius: 26, background: C.ember, color: C.ink, display: 'grid', placeItems: 'center', ...display, fontSize: 62}}>E</div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{...display, fontSize: 70, color: C.bone, lineHeight: 1}}>ENOVA</span>
            <span style={{fontFamily: 'Manrope', fontWeight: 650, fontSize: 34, color: C.sand, letterSpacing: '.18em', marginTop: 8}}>REAL ESTATE &amp; BUILDERS</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- audio helpers ----------
const sfx: {file: string; at: number; vol: number}[] = [];
const add = (file: string, at: number, vol = 0.5) => sfx.push({file, at, vol});
beats.forEach((b) => b.key && add('tick.wav', b.start + 2 / FPS, 0.28));
add('riser.wav', B.hook.ev!.hit - 1.6, 0.35);
add('subhit.wav', B.hook.ev!.hit, 0.6);
add('whoosh.wav', B.burst.start - 0.12, 0.45);
for (let i = 1; i < 6; i++) add('tick.wav', B.burst.start + ((B.burst.end - B.burst.start) * i) / 6, 0.22);
add('pop.wav', B.question.ev!.pin, 0.45);
add('pop.wav', B.malls.ev!.pin1, 0.45);
add('pop.wav', B.malls.ev!.pin2, 0.45);
add('riser.wav', B.offer.ev!.mezz - 1.6, 0.25);
['ground', 'lg'].forEach((k) => add('tick.wav', B.offer.ev![k], 0.3));
add('subhit.wav', B.offer.ev!.mezz, 0.5);
add('tick.wav', B.cta.ev!.number, 0.3);
add('whoosh.wav', B.end.start - 0.1, 0.35);

const musicVolume = (frame: number) => {
  const t = frame / FPS;
  const ramp = (a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (t < B.hook.ev!.hit) return 0.22;                              // filtered intro under the voice
  if (t >= B.burst.start - 0.1 && t < B.burst.end) return 0.42;    // lift for the burst (voice continues)
  if (t >= B.end.start - 0.15) return ramp(B.end.start - 0.15, B.end.start + 0.2, 0.17, 0.85);
  return 0.17;                                                      // ~ -15 dB under speech
};

export const Reel: React.FC<{withMusic: boolean}> = ({withMusic}) => {
  useFonts();
  const flashAt = ['intro', 'question', 'malls', 'offer', 'cta'].map((id) => B[id].start);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <OffthreadVideo src={staticFile('base.mp4')} muted />

      {beats.filter((b) => b.key).map((b) => {
        const isOffer = b.id === 'offer';
        const top = isOffer ? 300 : 560;
        return (
          <Sequence key={b.id} from={f(b.start)} durationInFrames={f(b.end) - f(b.start)} layout="none">
            <Stack con={b.con} word={b.key} mod={b.mod} top={top} dur={f(b.end - b.start)} />
          </Sequence>
        );
      })}

      <Sequence from={f(B.question.ev!.pin)} durationInFrames={f(B.question.end) - f(B.question.ev!.pin)} layout="none">
        <MapPin x={780} y={700} />
      </Sequence>
      <Sequence from={f(B.malls.ev!.pin1)} durationInFrames={f(B.malls.end) - f(B.malls.ev!.pin1)} layout="none">
        <Tag text="Zeta Mall" sub="saamne · opposite" side="left" top={250} />
      </Sequence>
      <Sequence from={f(B.malls.ev!.pin2)} durationInFrames={f(B.malls.end) - f(B.malls.ev!.pin2)} layout="none">
        <Tag text="Giga Mall" sub="saath · next door" side="right" top={395} />
      </Sequence>
      {([['Ground floor', 'ground', 560], ['LG floor', 'lg', 720], ['Mezzanine', 'mezz', 880]] as const).map(([label, k, bottom]) => (
        <Sequence key={k} from={f(B.offer.ev![k])} durationInFrames={f(B.offer.end) - f(B.offer.ev![k])} layout="none">
          <FloorTag label={label} bottom={bottom} />
        </Sequence>
      ))}
      <Sequence from={f(B.cta.ev!.number)} durationInFrames={f(B.cta.end) - f(B.cta.ev!.number)} layout="none">
        <NumberCard />
      </Sequence>

      {flashAt.map((s) => (
        <Sequence key={s} from={f(s)} durationInFrames={4}><Flash /></Sequence>
      ))}
      <Sequence from={f(B.burst.start) - 4} durationInFrames={9}><Whip /></Sequence>

      <Sequence from={f(B.end.start)}><EndCard /></Sequence>
      <Sequence durationInFrames={f(B.end.start)} layout="none"><Bug /></Sequence>

      <Audio src={staticFile('voice.wav')} />
      {withMusic ? <Audio src={staticFile('music.wav')} volume={musicVolume} /> : null}
      {withMusic ? sfx.map((s, i) => (
        <Sequence key={i} from={Math.max(0, f(s.at))} layout="none"><Audio src={staticFile(s.file)} volume={s.vol} /></Sequence>
      )) : null}
    </AbsoluteFill>
  );
};
