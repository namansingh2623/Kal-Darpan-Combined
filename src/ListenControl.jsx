import { Loader2, Square, Volume2 } from 'lucide-react';

export default function ListenControl({ speech, id, text, label }) {
  if (!speech.supported) return null;
  const active = speech.activeId === id;
  const loading = active && speech.preparing;
  return (
    <>
      <button type="button" className={'secondary listen-control' + (active ? ' is-active' : '')} data-reveal
        aria-pressed={active} aria-label={(active ? 'Stop listening: ' : 'Listen: ') + label}
        onClick={() => speech.toggle(id, text)}>
        {loading ? <Loader2 size={14} className="spin" /> : active ? <Square size={12} /> : <Volume2 size={14} />}
        {loading ? 'PREPARING…' : active ? 'STOP' : 'LISTEN'}
      </button>
      {speech.error && <p role="alert" className="muted small">{speech.error}</p>}
    </>
  );
}
