import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {Travel, TRAVEL_FRAMES, FPS as TFPS} from './Travel';
import tl from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={Math.round(tl.total * tl.fps)}
    fps={tl.fps}
    width={1080}
    height={1920}
    defaultProps={{withMusic: true}}
  />
  <Composition id="Travel" component={Travel} durationInFrames={TRAVEL_FRAMES} fps={TFPS} width={1080} height={1920} />
  </>
);
