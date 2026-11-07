import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';

// Deadpan solo-travel selfie montage. Cuts every 2 beats of "Local Forecast - Elevator" (Kevin MacLeod, 109.3 BPM).
export const FPS = 30;
const BEAT = 60 / 109.3;
const SLOT = 2 * BEAT;               // seconds per photo
const TR = 9;                        // transition length in frames
const MUSIC_START = 0.39;            // first downbeat in the track
const END_HOLD = 1.3;                // extra time on the last photo

const PHOTOS: {src: string; place: string}[] = [
  {src: 'p01', place: 'Barcelona, Spain'},
  {src: 'p02', place: 'Uluwatu, Bali'},
  {src: 'p03', place: 'Colosseum, Rome'},
  {src: 'p04', place: 'Hagia Sophia, Istanbul'},
  {src: 'p05', place: 'Nusa Penida, Bali'},
  {src: 'p06', place: 'Valletta, Malta'},
  {src: 'p07', place: 'Mount Bromo, Java'},
  {src: 'p16', place: 'Eiffel Tower, Paris'},
  {src: 'p08', place: 'Tiber River, Rome'},
  {src: 'p09', place: 'Ubud, Bali'},
  {src: 'p10', place: 'Bosphorus, Istanbul'},
  {src: 'p11', place: 'Malta'},
  {src: 'p12', place: 'Sunset, Bali'},
  {src: 'p13', place: 'Hagia Sophia, again'},
  {src: 'p14', place: 'Bromo sunrise, Java'},
  {src: 'p15', place: 'Next stop: ?'},
];
const TRANSITIONS = ['cube', 'burn', 'fold', 'spin', 'push', 'glitch', 'fade'] as const;
type T = (typeof TRANSITIONS)[number];

const start = (i: number) => Math.round(i * SLOT * FPS);
export const TRAVEL_FRAMES = start(PHOTOS.length - 1) + Math.round((SLOT + END_HOLD) * FPS);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const f = new FontFace('Manrope', `url(${staticFile('fonts/manrope.woff2')})`, {weight: '500 800'});
    f.load().then((l) => {(document as any).fonts.add(l); continueRender(h);});
  }, [h]);
};

// one photo with a slow Ken Burns push
const Photo: React.FC<{i: number; frame: number; style?: React.CSSProperties}> = ({i, frame, style}) => {
  const local = frame - start(i);
  const s = interpolate(local, [-TR, start(i + 1) - start(i) + TR], [1.0, 1.07], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dx = (i % 2 ? -1 : 1) * interpolate(local, [0, 40], [0, 12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...style}}>
      <Img src={staticFile(`travel/${PHOTOS[i].src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: PHOTOS[i].src === 'p10' ? 'brightness(1.12) contrast(1.08) saturate(1.1)' : 'none', transform: `scale(${s}) translateX(${dx}px)`}} />
    </AbsoluteFill>
  );
};

// p goes 0 -> 1 across the transition from photo a (out) to photo b (in)
const Transition: React.FC<{kind: T; p: number; a: number; b: number; frame: number}> = ({kind, p, a, b, frame}) => {
  const e = Easing.inOut(Easing.cubic)(p);
  switch (kind) {
    case 'cube':
      return (
        <AbsoluteFill style={{perspective: 1600, background: '#000'}}>
          <Photo i={a} frame={frame} style={{transformOrigin: 'right center', transform: `translateX(${-e * 100}%) rotateY(${-e * 90}deg)`, backfaceVisibility: 'hidden'}} />
          <Photo i={b} frame={frame} style={{transformOrigin: 'left center', transform: `translateX(${(1 - e) * 100}%) rotateY(${(1 - e) * 90}deg)`, backfaceVisibility: 'hidden'}} />
        </AbsoluteFill>
      );
    case 'burn': {
      // a ragged burning edge sweeps up the frame, glowing orange
      const y = interpolate(e, [0, 1], [115, -25]);
      const pts = Array.from({length: 13}, (_, k) => {
        const x = (k / 12) * 100;
        const jag = Math.sin(k * 2.3 + frame * 0.9) * 4 + Math.sin(k * 5.1) * 3;
        return `${x}% ${y + jag}%`;
      });
      const clip = `polygon(0% 0%, 100% 0%, ${pts.reverse().join(', ')})`;
      return (
        <AbsoluteFill>
          <Photo i={b} frame={frame} />
          <Photo i={a} frame={frame} style={{clipPath: clip}} />
          <AbsoluteFill style={{background: `linear-gradient(0deg, transparent ${100 - y - 8}%, rgba(255,140,20,.95) ${100 - y - 2}%, rgba(255,230,120,.9) ${100 - y}%, rgba(255,90,0,.7) ${100 - y + 3}%, transparent ${100 - y + 10}%)`, mixBlendMode: 'screen', filter: 'blur(6px)'}} />
        </AbsoluteFill>
      );
    }
    case 'fold': {
      // chevron window opens from the middle, like an old kaleidoscope wipe
      const r = e * 120;
      const clip = `polygon(50% ${50 - r}%, ${50 + r}% 50%, 50% ${50 + r}%, ${50 - r}% 50%)`;
      return (
        <AbsoluteFill style={{background: '#000'}}>
          <Photo i={a} frame={frame} style={{opacity: 1 - e * 0.4}} />
          <Photo i={b} frame={frame} style={{clipPath: clip}} />
        </AbsoluteFill>
      );
    }
    case 'spin':
      return (
        <AbsoluteFill style={{background: '#000'}}>
          <Photo i={a} frame={frame} style={{transform: `scale(${1 + e * 0.8}) rotate(${e * 25}deg)`, opacity: 1 - e, filter: `blur(${e * 12}px)`}} />
          <Photo i={b} frame={frame} style={{transform: `scale(${0.6 + e * 0.4}) rotate(${(e - 1) * 25}deg)`, opacity: e}} />
        </AbsoluteFill>
      );
    case 'push':
      return (
        <AbsoluteFill>
          <Photo i={a} frame={frame} style={{transform: `translateY(${-e * 100}%)`}} />
          <Photo i={b} frame={frame} style={{transform: `translateY(${(1 - e) * 100}%)`}} />
        </AbsoluteFill>
      );
    case 'glitch': {
      const which = p < 0.5 ? a : b;
      const off = Math.sin(p * Math.PI) * 28;
      return (
        <AbsoluteFill style={{background: '#000'}}>
          <Photo i={which} frame={frame} style={{transform: `translateX(${off}px)`, mixBlendMode: 'screen', filter: 'url(#r)'}} />
          <Photo i={which} frame={frame} style={{transform: `translateX(${-off}px)`, mixBlendMode: 'screen', filter: 'url(#gb)'}} />
          <AbsoluteFill style={{background: `repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 3px, transparent 3px 7px)`, opacity: Math.sin(p * Math.PI)}} />
        </AbsoluteFill>
      );
    }
    default:
      return (
        <AbsoluteFill>
          <Photo i={a} frame={frame} />
          <Photo i={b} frame={frame} style={{opacity: e}} />
        </AbsoluteFill>
      );
  }
};

const shadow = '0 2px 4px rgba(0,0,0,.7), 0 0 22px rgba(0,0,0,.55), 0 0 4px rgba(0,0,0,.5)';

export const Travel: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  // which photo / transition are we in?
  let i = 0;
  while (i < PHOTOS.length - 1 && frame >= start(i + 1)) i++;
  const next = i + 1;
  const tStart = next < PHOTOS.length ? start(next) - Math.floor(TR / 2) : Infinity;
  const inTr = frame >= tStart - 0 && frame < tStart + TR && next < PHOTOS.length;
  // previous transition still finishing?
  const prevStart = start(i) - Math.floor(TR / 2);
  const inPrev = i > 0 && frame >= prevStart && frame < prevStart + TR;

  let scene: React.ReactNode;
  if (inTr) scene = <Transition kind={TRANSITIONS[i % TRANSITIONS.length]} p={(frame - tStart) / TR} a={i} b={next} frame={frame} />;
  else if (inPrev) scene = <Transition kind={TRANSITIONS[(i - 1) % TRANSITIONS.length]} p={(frame - prevStart) / TR} a={i - 1} b={i} frame={frame} />;
  else scene = <Photo i={i} frame={frame} />;

  const capIn = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const placeOp = interpolate(frame - start(i), [0, 4], [0.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const total = TRAVEL_FRAMES;
  const musicVol = (f: number) => interpolate(f, [0, 4, total - 24, total - 1], [0, 0.9, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="r"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="gb"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
      </svg>
      {scene}
      <div style={{position: 'absolute', top: 250, left: 90, right: 90, textAlign: 'center', fontFamily: 'Manrope', fontWeight: 700, fontSize: 62, lineHeight: 1.18, color: '#fff', textShadow: shadow, opacity: capIn}}>
        Solo travel means<br />taking photos like<br />a divorced dad
      </div>
      <div style={{position: 'absolute', top: 500, left: 0, right: 0, textAlign: 'center', fontFamily: 'Manrope', fontWeight: 700, fontSize: 40, letterSpacing: '.03em', color: '#fff', textShadow: shadow, opacity: placeOp}}>
        {PHOTOS[i].place}
      </div>
      <Audio src={staticFile('elevator.mp3')} startFrom={Math.round(MUSIC_START * FPS)} volume={musicVol} />
    </AbsoluteFill>
  );
};
