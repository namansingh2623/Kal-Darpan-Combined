import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelSpeech, say, speechSupported } from './viewer/speech';
import { narrationRate, narrationSettings, useNarrationSettings } from './viewer/narrationSettings';

// On-demand read-aloud for the museum pages. Nothing here preloads or autoplays.
export default function useOnDemandSpeech() {
  const settings = useNarrationSettings();
  const [activeId, setActiveId] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState('');
  const activeRef = useRef(null);
  const activeTextRef = useRef(null);
  const previousLanguage = useRef(settings.language);

  const clear = useCallback(() => {
    activeRef.current = null;
    activeTextRef.current = null;
    setActiveId(null);
    setPreparing(false);
  }, []);

  const stop = useCallback(() => {
    if (activeRef.current !== null) cancelSpeech();
    clear();
  }, [clear]);

  const start = useCallback((id, text) => {
    const { speed, volume, language } = narrationSettings.get();
    activeRef.current = id;
    activeTextRef.current = text;
    setActiveId(id);
    setPreparing(true);
    setError('');
    say(text, {
      rate: narrationRate(speed),
      volume,
      language,
      onStart: () => { if (activeRef.current === id) setPreparing(false); },
      onEnd: () => { if (activeRef.current === id) clear(); },
      onError: (message) => { if (activeRef.current === id) { clear(); setError(message); } },
    });
  }, [clear]);

  const toggle = useCallback((id, text) => {
    if (activeRef.current === id) { stop(); return; }
    start(id, text);
  }, [start, stop]);

  useEffect(() => {
    if (previousLanguage.current === settings.language) return;
    previousLanguage.current = settings.language;
    if (activeRef.current !== null && activeTextRef.current) {
      start(activeRef.current, activeTextRef.current);
    }
  }, [settings.language, start]);

  useEffect(() => stop, [stop]); // stop when the page unmounts
  return { supported: speechSupported, activeId, preparing, error, toggle, stop };
}
