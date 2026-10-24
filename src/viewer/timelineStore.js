import { clamp01, segmentIndexAt } from './timelineUtils';

/**
 * Tiny external store so the 3D loop and the UI share timeline time
 * without re-rendering the whole React tree every frame.
 * `snap` increases whenever the model must jump to the new time instantly
 * (restart / reset) instead of animating there.
 */
export function createTimelineStore({ playSeconds = 24, initialT = 1 } = {}) {
  let state = { t: initialT, playing: false, snap: 0 };
  let timeScale = 1;
  let gate = null;
  let segments = [];
  const listeners = new Set();
  const set = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };
  const restart = () => set({ t: 0, playing: true, snap: state.snap + 1 });
  return {
    getState: () => state,
    subscribe: (l) => {
      listeners.add(l);
      return () => { listeners.delete(l); };
    },
    setTimeScale: (scale) => {
      if (!Number.isFinite(scale) || scale <= 0) {
        throw new RangeError('Timeline time scale must be a positive finite number.');
      }
      timeScale = scale;
    },
    setGate: (t) => {
      gate = t == null ? null : clamp01(t);
    },
    setSegments: (nextSegments) => {
      segments = Array.isArray(nextSegments) ? nextSegments : [];
    },
    setT: (t, { keepPlaying = false, snap = false } = {}) =>
      set({ t: clamp01(t), playing: keepPlaying ? state.playing : false, ...(snap ? { snap: state.snap + 1 } : {}) }),
    // Relative steps preserve play/pause, stopping only when playback reaches the end.
    nudge: (delta) => {
      const t = clamp01(state.t + delta);
      set({ t, playing: state.playing && t < 0.999 });
    },
    play: () => (state.t >= 0.999 ? restart() : set({ playing: true })),
    pause: () => set({ playing: false }),
    toggle: () => {
      if (state.playing) set({ playing: false });
      else if (state.t >= 0.999) restart();
      else set({ playing: true });
    },
    tick: (dt) => {
      if (!state.playing) return;
      let t = state.t + (dt * timeScale) / playSeconds;
      const segmentIndex = segmentIndexAt(segments, state.t);
      const currentSegment = segments[segmentIndex];
      if (currentSegment && t > currentSegment.to) t = currentSegment.to;
      if (gate != null && t > gate) t = gate;
      if (t >= 1) set({ t: 1, playing: false });
      else if (t > state.t) set({ t });
    },
  };
}