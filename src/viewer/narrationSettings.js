import { useSyncExternalStore } from 'react';

const KEY = 'kd.narration.v8';
const LEGACY_KEYS = ['kd.narration.v7', 'kd.narration.v6', 'kd.narration.v5', 'kd.narration.v4'];
const DEFAULTS = { enabled: true, speed: 1, volume: 1, language: 'en' };
export const narrationRate = (speed) => Math.min(1.2, Math.max(0.7, speed * 0.82));
const num = (v, lo, hi, fallback) => (typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback);
const sanitize = (value) => ({
  enabled: typeof value.enabled === 'boolean' ? value.enabled : DEFAULTS.enabled,
  speed: num(value.speed, 0.75, 1.5, DEFAULTS.speed),
  volume: num(value.volume, 0, 1, DEFAULTS.volume),
  language: value.language === 'ta-IN' || value.language === 'hi-IN' ? value.language : DEFAULTS.language,
});

function load() {
  try {
    const current = localStorage.getItem(KEY);
    if (current) return sanitize(JSON.parse(current));

    const legacy = LEGACY_KEYS
      .map((key) => localStorage.getItem(key))
      .find(Boolean);
    const previous = legacy ? JSON.parse(legacy) : {};
    return sanitize({ ...previous, enabled: DEFAULTS.enabled });
  } catch {
    return { ...DEFAULTS };
  }
}

let state = load();
const listeners = new Set();

export const narrationSettings = {
  get: () => state,
  set(patch) {
    state = sanitize({ ...state, ...patch });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
    listeners.forEach((l) => l());
  },
  subscribe(l) { listeners.add(l); return () => { listeners.delete(l); }; },
};

export const useNarrationSettings = () => useSyncExternalStore(narrationSettings.subscribe, narrationSettings.get);
