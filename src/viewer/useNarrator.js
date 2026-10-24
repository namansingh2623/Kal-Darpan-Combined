import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cancelSpeech, preloadSpeech, say, speechSupported } from './speech';
import { narrationRate, narrationSettings, useNarrationSettings } from './narrationSettings';
import { PRONUNCIATION_TEST } from './pronunciation';
import { buildSegments, segmentIndexAt } from './timelineUtils';
import { eventSpeech, laterHistorySpeech, poiSpeech } from './narrationText';

export default function useNarrator({ store, monument }) {
  const settings = useNarrationSettings();
  const segments = useMemo(
    () => buildSegments(monument.construction, settings.enabled),
    [monument, settings.enabled],
  );
  // "Additional info" = events that happened after construction ended. Read ONLY when the visitor asks.
  const additionalInfo = useMemo(() => laterHistorySpeech(monument), [monument]);

  const [timelineSpeaking, setTimelineSpeaking] = useState(false);
  const [userSpeakingId, setUserSpeakingId] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const state = useRef({
    lastT: store.getState().t,
    lastSnap: store.getState().snap,
    lastPlaying: store.getState().playing,
    spokenIdx: null,
    timelineActive: false,
    userActive: false,
    userId: null,
    userText: null,
  }).current;
  const previousLanguage = useRef(settings.language);
  const replayTimeline = useRef(null);

  useEffect(() => {
    store.setTimeScale(settings.enabled ? settings.speed : 1);
  }, [store, settings.enabled, settings.speed]);

  useEffect(() => {
    store.setSegments(segments);
  }, [store, segments]);

  // Errors used to be visible only inside the closed settings popover. Surface them, then clear.
  useEffect(() => {
    if (!speechError) return undefined;
    const id = setTimeout(() => setSpeechError(''), 8000);
    return () => clearTimeout(id);
  }, [speechError]);

  const setTimelineActive = (active) => {
    state.timelineActive = active;
    setTimelineSpeaking(active);
  };

  const stopTimeline = useCallback(() => {
    if (state.timelineActive) {
      cancelSpeech();
      setPreparing(false);
    }
    state.timelineActive = false;
    setTimelineSpeaking(false);
    store.setGate(null);
    store.setTimeScale(narrationSettings.get().enabled ? narrationSettings.get().speed : 1);
  }, [state, store]);

  const stopUser = useCallback(() => {
    if (state.userActive) {
      cancelSpeech();
      setPreparing(false);
    }
    state.userActive = false;
    state.userId = null;
    state.userText = null;
    setUserSpeakingId(null);
  }, [state]);

  const speakUser = useCallback((id, text) => {
    store.pause();
    stopTimeline();
    const current = narrationSettings.get();
    state.userActive = true;
    state.userId = id;
    state.userText = text;
    setUserSpeakingId(id);
    setPreparing(true);
    setSpeechError('');
    const finish = () => {
      if (state.userId !== id) return; // a newer clip has taken over
      state.userActive = false;
      state.userId = null;
      state.userText = null;
      setUserSpeakingId(null);
      setPreparing(false);
    };
    say(text, {
      rate: narrationRate(current.speed),
      volume: current.volume,
      language: current.language,
      onStart: () => { if (state.userId === id) setPreparing(false); },
      onEnd: finish,
      onError: (error) => { finish(); setSpeechError(error); },
    });
  }, [state, stopTimeline, store]);
  const speakUserRef = useRef(speakUser);
  speakUserRef.current = speakUser;

  const toggleUser = useCallback((id, text) => {
    if (state.userActive && state.userId === id) stopUser();
    else speakUser(id, text);
  }, [state, speakUser, stopUser]);

  const toggleReadPoi = useCallback((poi) => toggleUser(`poi:${poi.id}`, poiSpeech(poi)), [toggleUser]);
  const toggleReadEvent = useCallback((event, index) => toggleUser(`event:${index}`, eventSpeech(event)), [toggleUser]);
  const toggleAdditionalInfo = useCallback(() => {
    if (additionalInfo) toggleUser('additional-info', additionalInfo);
  }, [additionalInfo, toggleUser]);

  const readFeature = useCallback((poi) => {
    if (poi) return toggleReadPoi(poi);
    const index = segmentIndexAt(segments, store.getState().t);
    const segment = segments[index];
    const text = segment?.text || segment?.phase?.description;
    if (text) toggleUser(`phase:${segment.index}`, text);
  }, [segments, store, toggleReadPoi, toggleUser]);

  const preview = useCallback(() => toggleUser('preview', PRONUNCIATION_TEST), [toggleUser]);

  const toggleEnabled = useCallback(() => {
    const enabled = !narrationSettings.get().enabled;
    narrationSettings.set({ enabled });
    if (!enabled) {
      stopTimeline();
      stopUser();
      cancelSpeech();
    }
  }, [stopTimeline, stopUser]);

  useEffect(() => {
    const speakSegment = (index) => {
      const segment = segments[index];
      const current = narrationSettings.get();
      state.spokenIdx = index;
      if (!segment || !current.enabled || !segment.text) {
        store.setGate(null);
        return;
      }
      // Pressing play on the timeline takes over from any read-aloud clip (it used to silently skip narration).
      if (state.userActive) stopUser();

      const startT = store.getState().t;
      const remaining = (segment.to - startT) / (segment.to - segment.from);
      store.setGate(startT);
      setTimelineActive(true);
      setPreparing(true);
      setSpeechError('');
      say(segment.text, {
        rate: narrationRate(current.speed),
        volume: current.volume,
        language: current.language,
        onStart: (duration) => {
          setPreparing(false);
          const nextSegment = segments[index + 1];
          if (state.timelineActive && nextSegment?.text) {
            preloadSpeech(nextSegment.text, {
              rate: narrationRate(current.speed),
              language: current.language,
            }).then(({ failed }) => {
              if (failed && import.meta.env?.DEV) console.warn('[narration] next timeline segment could not be preloaded');
            });
          }
          if (!state.timelineActive || !Number.isFinite(duration) || duration <= 0) return;
          store.setTimeScale((segment.seconds * remaining) / duration);
          store.setGate(segment.to);
        },
        onEnd: () => {
          setTimelineActive(false);
          setPreparing(false);
          store.setGate(null);
          store.setTimeScale(narrationSettings.get().enabled ? narrationSettings.get().speed : 1);
          const latest = store.getState();
          if (latest.playing && latest.t < segment.to - 0.001) {
            store.setT(segment.to, { keepPlaying: true });
          }
        },
        onError: (error) => {
          setTimelineActive(false);
          setPreparing(false);
          setSpeechError(error);
          store.setGate(null);
          store.setTimeScale(narrationSettings.get().enabled ? narrationSettings.get().speed : 1);
        },
      });
    };
    replayTimeline.current = () => {
      const current = store.getState();
      if (!current.playing || !narrationSettings.get().enabled) return;
      speakSegment(segmentIndexAt(segments, current.t));
    };

    const onChange = () => {
      const current = store.getState();
      const jumped = current.snap !== state.lastSnap || Math.abs(current.t - state.lastT) > 0.015;
      const wasPlaying = state.lastPlaying;
      const previousT = state.lastT;
      state.lastT = current.t;
      state.lastSnap = current.snap;
      state.lastPlaying = current.playing;

      if (jumped) {
        stopTimeline();
        state.spokenIdx = null;
      }

      if (!current.playing) {
        if (wasPlaying || current.t !== previousT) stopTimeline();
        return;
      }

      const index = segmentIndexAt(segments, current.t);
      if (!wasPlaying || jumped) {
        speakSegment(index);
        return;
      }
      if (index !== state.spokenIdx) speakSegment(index);
    };

    const onVisibility = () => {
      if (document.hidden) store.pause();
    };
    const unsubscribe = store.subscribe(onChange);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelSpeech();
      state.timelineActive = false;
      state.userActive = false;
      store.setGate(null);
    };
  }, [monument, segments, state, stopTimeline, stopUser, store]);

  useEffect(() => {
    if (previousLanguage.current === settings.language) return;
    previousLanguage.current = settings.language;
    if (state.userActive && state.userId && state.userText) {
      speakUserRef.current(state.userId, state.userText);
    } else if (state.timelineActive) {
      cancelSpeech();
      state.timelineActive = false;
      setTimelineSpeaking(false);
      setPreparing(false);
      replayTimeline.current?.();
    }
  }, [settings.language, state]);

  useEffect(() => () => {
    cancelSpeech();
    store.setGate(null);
  }, [store]);

  return {
    supported: speechSupported,
    settings,
    speaking: timelineSpeaking,
    preparing,
    userSpeakingId,
    error: speechError,
    setSettings: narrationSettings.set,
    toggleEnabled,
    preview,
    readFeature,
    toggleUser,
    stopUser,
    toggleReadPoi,
    toggleReadEvent,
    hasAdditionalInfo: Boolean(additionalInfo),
    toggleAdditionalInfo,
  };
}
