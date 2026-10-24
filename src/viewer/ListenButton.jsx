import { Loader2, Square, Volume2 } from 'lucide-react';

export default function ListenButton({ narrator, id, label, onToggle, compact = false, children, t = (text) => text, className = '' }) {
  if (!narrator?.supported) return null;
  const active = narrator.userSpeakingId === id;
  const loading = active && narrator.preparing;
  const text = loading ? t('Preparing…') : active ? t('Stop') : (children ?? t('Listen'));
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? t(`Stop listening: ${label}`) : t(`Listen: ${label}`)}
      className={'kd-timeline-control inline-flex shrink-0 items-center gap-1.5 rounded-full border text-xs transition-all duration-200 active:scale-95 ' + className + ' ' +
        (compact ? 'h-9 px-3 ' : 'min-h-9 px-3 ') +
        (active ? 'kd-accent-line kd-accent-soft kd-gold' : 'kd-line-2 kd-text-2 kd-hover-line kd-hover-text')}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : active ? <Square size={12} /> : <Volume2 size={14} />}
      <span>{text}</span>
    </button>
  );
}
