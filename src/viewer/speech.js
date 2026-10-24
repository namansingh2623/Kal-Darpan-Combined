import { applyPronunciations } from './pronunciation.js';

const AudioContextClass = typeof window !== 'undefined'
  ? window.AudioContext || window.webkitAudioContext
  : null;
export const speechSupported = Boolean(AudioContextClass && typeof fetch === 'function');

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const below100 = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));

function yearToWords(year) {
  if (year >= 2000 && year < 2010) return year === 2000 ? 'two thousand' : 'two thousand ' + ONES[year - 2000];
  const hi = Math.floor(year / 100);
  const lo = year % 100;
  if (lo === 0) return below100(hi) + ' hundred';
  return below100(hi) + ' ' + (lo < 10 ? 'oh ' + ONES[lo] : below100(lo));
}

export function forSpeech(text) {
  let out = String(text)
    .replace(/\b(\d{4})\s*[–—-]\s*(\d{2,4})\b/g, (_, a, b) => `${a} to ${b.length === 2 ? a.slice(0, 2) + b : b}`)
    .replace(/(\d)\s*[–—-]\s*(\d)/g, '$1 to $2')
    .replace(/(\d+(?:\.\d+)?)\s*m\b/gi, '$1 metres')
    .replace(/[–—]/g, ', ')
    .replace(/&/g, ' and ')
    .replace(/\bc\.\s*(?=\d)/gi, 'around ')
    .replace(/\b(1\d{3}|20\d{2})\b/g, (year) => yearToWords(Number(year)))
    .replace(/\s+/g, ' ')
    .trim();
  return applyPronunciations(out);
}

const splitSentences = (text) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
export function splitAtRequestLimit(text, maxLength = 4500) {
  if (text.length <= maxLength) return [text];
  const groups = [];
  for (const sentence of splitSentences(text)) {
    const words = sentence.match(/\S+\s*/g) || [];
    let chunk = '';
    for (const word of words) {
      if (chunk && chunk.length + word.length > maxLength) {
        groups.push(chunk.trim());
        chunk = '';
      }
      chunk += word;
    }
    const last = groups.length - 1;
    if (chunk && last >= 0 && groups[last].length + chunk.length + 1 <= maxLength) {
      groups[last] += ` ${chunk.trim()}`;
    } else if (chunk) groups.push(chunk.trim());
  }
  return groups;
}

async function getStaticAudioManifest() {
  if (!staticAudioManifestPromise) {
    staticAudioManifestPromise = fetch('/narration/manifest.json', { cache: 'force-cache' })
      .then((response) => {
        if (response.status === 404) return {};
        if (!response.ok) throw new Error(`Bundled narration manifest returned ${response.status}.`);
        return response.json();
      })
      .then((manifest) => manifest?.clips || {})
      .catch((error) => { throw new Error(`Could not load bundled narration manifest: ${error.message}`); });
  }
  return staticAudioManifestPromise;
}

let token = 0;
let requestController = null;
let activeSources = [];
let audioContext = null;
const audioCache = new Map();
const audioRequests = new Map();
const maxCachedClips = 64;
const staticAudioRate = 0.92;
const staticAudioBuffers = new WeakSet();
let staticAudioManifestPromise;

function getAudioContext() {
  if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
  audioContext ||= new AudioContextClass();
  return audioContext;
}

function waitFor(promise, signal) {
  if (!signal) return promise;
  const aborted = () => new DOMException('Narration request cancelled.', 'AbortError');
  if (signal.aborted) return Promise.reject(aborted());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(aborted());
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => { signal.removeEventListener('abort', onAbort); resolve(value); },
      (error) => { signal.removeEventListener('abort', onAbort); reject(error); },
    );
  });
}

async function fetchClip(text, rate, context, language) {
  if (language !== 'ta-IN' && language !== 'hi-IN') throw new Error('English narration must be loaded from bundled audio.');
  if (import.meta.env?.DEV) console.debug('[narration] sending:', text);
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch('/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, rate, language }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw Object.assign(new Error(result.error || `Narration failed (${response.status}).`), { status: response.status });
      }
      return await context.decodeAudioData(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      const transient = error instanceof TypeError || error.status === 502 || error.status === 504;
      if (!transient || attempt === 1) break;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }
  throw lastError;
}

async function getAudioBuffer(text, rate, signal, language) {
  const key = JSON.stringify([text, rate, language]);
  const cached = audioCache.get(key);
  if (cached) {
    audioCache.delete(key);
    audioCache.set(key, cached);
    return cached;
  }
  let request = audioRequests.get(key);
  if (!request) {
    const context = getAudioContext();
    request = getStaticAudioManifest()
      .then(async (clips) => {
        const url = clips[JSON.stringify([text, language])];
        if (!url) {
          if (language === 'en') {
            throw new Error('This English narration clip is missing from the bundled audio files.');
          }
          return fetchClip(text, rate, context, language);
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Bundled narration audio returned ${response.status}.`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        staticAudioBuffers.add(buffer);
        return buffer;
      })
      .then((buffer) => {
        audioCache.set(key, buffer);
        while (audioCache.size > maxCachedClips) audioCache.delete(audioCache.keys().next().value);
        return buffer;
      })
      .finally(() => { audioRequests.delete(key); });
    audioRequests.set(key, request);
  }
  return waitFor(request, signal);
}

export async function preloadSpeech(textOrArray, opts = {}) {
  if (!speechSupported) throw new Error('Audio playback is not supported in this browser.');
  const { rate = 1, language = 'en' } = opts;
  const items = (Array.isArray(textOrArray) ? textOrArray : [textOrArray]).filter(Boolean);
  const queue = items.flatMap((item) => splitAtRequestLimit(forSpeech(item), language === 'en' ? 4500 : 1000));
  let index = 0;
  let failed = 0;
  const worker = async () => {
    while (index < queue.length) {
      const text = queue[index++];
      try { await getAudioBuffer(text, rate, undefined, language); } catch { failed += 1; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(2, queue.length) }, worker));
  return { total: queue.length, failed };
}

export function cancelSpeech() {
  token += 1;
  requestController?.abort();
  requestController = null;
  activeSources.forEach((source) => {
    source.onended = null;
    try { source.stop(); } catch { /* already ended */ }
  });
  activeSources = [];
}

export function say(textOrArray, opts = {}) {
  const { rate = 1, volume = 1, language = 'en', onStart, onEnd, onError } = opts;
  cancelSpeech();
  if (!speechSupported) {
    onError?.('Audio playback is not supported in this browser.');
    return;
  }
  let context;
  let audioReady;
  try {
    context = getAudioContext();
    audioReady = context.state === 'running' ? Promise.resolve() : context.resume();
  } catch (error) {
    onError?.(error.message || 'Audio playback could not be initialized.');
    return;
  }
  const id = token;
  const items = (Array.isArray(textOrArray) ? textOrArray : [textOrArray]).filter(Boolean);
  const queue = [];
  items.forEach((item) => {
    const groups = splitAtRequestLimit(forSpeech(item), language === 'en' ? 4500 : 1000);
    groups.forEach((text) => queue.push(text));
  });
  if (queue.length === 0) { onEnd?.(); return; }
  const controller = new AbortController();
  requestController = controller;
  const fail = (message) => {
    if (id !== token) return;
    cancelSpeech();
    onError?.(message);
  };
  const prepareAndPlay = async () => {
    const buffers = Array.from({ length: queue.length });
    let nextIndex = 0;
    const prepareWorker = async () => {
      while (nextIndex < queue.length && id === token) {
        const index = nextIndex++;
        buffers[index] = await getAudioBuffer(queue[index], rate, controller.signal, language);
      }
    };
    await Promise.all(Array.from({ length: Math.min(2, queue.length) }, prepareWorker));
    if (id !== token) return;
    requestController = null;
    try {
      await audioReady;
      if (context.state !== 'running') await context.resume();
    } catch (error) {
      fail(error.message || 'Audio playback could not be initialized.');
      return;
    }
    if (id !== token) return;
    const rates = buffers.map((buffer) => staticAudioBuffers.has(buffer) ? rate / staticAudioRate : 1);
    const durations = buffers.map((buffer, index) => buffer.duration / rates[index]);
    const duration = durations.reduce((total, item) => total + item, 0);
    const startedAt = context.currentTime + 0.03;
    let finished = 0;
    activeSources = buffers.map((buffer, index) => {
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.value = volume;
      source.buffer = buffer;
      source.playbackRate.value = rates[index];
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        if (id !== token) return;
        finished += 1;
        if (finished === buffers.length) {
          activeSources = [];
          onEnd?.();
        }
      };
      source.start(startedAt + durations.slice(0, index).reduce((total, item) => total + item, 0));
      return source;
    });
    onStart?.(duration);
  };

  prepareAndPlay().catch((error) => fail(error.message || 'Narration could not be prepared.'));
}
