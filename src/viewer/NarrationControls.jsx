import { useEffect, useId, useRef, useState } from 'react';
import { AudioLines, Loader2, Settings2, Volume2, VolumeX, X } from 'lucide-react';

const mini = 'kd-timeline-control grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-200 active:scale-95 ';
const idle = 'kd-line-2 kd-text-2 kd-hover-line kd-hover-text';
const active = 'kd-accent-line kd-accent-soft kd-gold';

export default function NarrationControls({ narrator, onRead }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const gearRef = useRef(null);
  const controlsRef = useRef(null);
  const previousEnabled = useRef(narrator?.settings.enabled);
  const [announce, setAnnounce] = useState('');
  const { settings, setSettings, speaking, userSpeakingId } = narrator || {};
  const reading = userSpeakingId !== null && userSpeakingId !== 'preview';

  useEffect(() => {
    if (!narrator?.supported || previousEnabled.current === settings?.enabled) return;
    previousEnabled.current = settings.enabled;
    setAnnounce(settings.enabled ? 'Narration on' : 'Narration off');
  }, [narrator?.supported, settings?.enabled]);

  useEffect(() => {
    if (!open || !narrator?.supported) return undefined;
    const onPointerDown = (event) => {
      if (!controlsRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
      gearRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, narrator?.supported]);

  if (!narrator?.supported) return <span className="text-xs kd-text-3" role="status">Audio playback is not available in this browser.</span>;

  return (
    <div ref={controlsRef} className="relative flex items-center gap-1.5">
      <span className="sr-only" role="status">{announce}</span>
      {narrator.error && !open && (
        <p role="alert" className="absolute bottom-full left-0 z-40 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border kd-line-2 kd-panel p-3 text-xs leading-relaxed kd-text-2 shadow-2xl backdrop-blur-md">{narrator.error}</p>
      )}
      <span className="mx-0.5 h-5 w-px shrink-0 kd-track" aria-hidden="true" />
      <button type="button" onClick={narrator.toggleEnabled} aria-pressed={settings.enabled} aria-keyshortcuts="M"
        aria-label={narrator.preparing ? 'Narration, preparing audio' : 'Narration'} title="Narration on/off (M)"
        className={mini + (settings.enabled ? active : idle)}>
        {narrator.preparing && userSpeakingId === null
          ? <Loader2 size={14} className="animate-spin" />
          : settings.enabled
            ? <Volume2 size={14} className={speaking ? 'animate-pulse' : ''} />
            : <VolumeX size={14} />}
      </button>
      <button type="button" onClick={onRead} aria-pressed={reading} aria-keyshortcuts="R"
        aria-label="Read this feature aloud" title="Read aloud (R)"
        className={mini + (reading ? active : idle)}>
        <AudioLines size={14} />
      </button>
      <button ref={gearRef} type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={panelId}
        aria-label="Narration settings" title="Narration settings"
        className={mini + (open ? active : idle)}>
        <Settings2 size={14} />
      </button>

      {open && (
        <div id={panelId} role="group" aria-label="Narration settings"
          className="absolute bottom-full left-0 z-40 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border kd-line-2 kd-panel p-4 text-sm kd-text shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="kd-display text-base kd-text">Narration</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close narration settings" className="grid h-9 w-9 place-items-center rounded-full kd-text-2 kd-hover"><X size={16} /></button>
          </div>
          <p className="mt-2 text-xs leading-relaxed kd-text-3">Timeline narration plays automatically while the timeline runs. Feature, event and history audio plays only when you press its Listen button.</p>

          <label className="mt-3 flex min-h-9 cursor-pointer items-center justify-between gap-3">
            <span>Narrate the timeline</span>
            <input type="checkbox" role="switch" checked={settings.enabled} onChange={narrator.toggleEnabled} className="h-5 w-5 accent-current kd-gold" />
          </label>

          <label className="mt-2 block">
            <span className="flex justify-between"><span>Speed</span><span className="tabular-nums kd-text-3">{settings.speed.toFixed(2)}×</span></span>
            <input type="range" min="0.75" max="1.5" step="0.05" value={settings.speed} onChange={(e) => setSettings({ speed: Number(e.target.value) })} className="mt-1 w-full accent-current kd-gold" />
          </label>

          <label className="mt-2 block">
            <span className="flex justify-between"><span>Volume</span><span className="tabular-nums kd-text-3">{Math.round(settings.volume * 100)}%</span></span>
            <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={(e) => setSettings({ volume: Number(e.target.value) })} className="mt-1 w-full accent-current kd-gold" />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block">Narration language</span>
            <select value={settings.language} onChange={(event) => setSettings({ language: event.target.value })} className="w-full rounded-lg border kd-line-2 kd-panel px-3 py-2 kd-text">
              <option value="en">English</option>
              <option value="hi-IN">Hindi · हिन्दी</option>
              <option value="ta-IN">Tamil · தமிழ்</option>
            </select>
          </label>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={narrator.preview} className="min-h-10 rounded-lg border kd-line-2 px-3 text-xs uppercase tracking-[0.14em] kd-gold kd-hover-line">Test voice and pronunciation</button>
            <span className="text-[11px] kd-text-4">Keys: M narration · R read aloud</span>
          </div>
          {narrator.error && <p role="alert" className="mt-2 text-xs kd-text-3">{narrator.error}</p>}
        </div>
      )}
    </div>
  );
}
