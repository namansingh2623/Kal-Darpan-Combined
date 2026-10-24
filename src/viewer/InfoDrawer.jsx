import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import ListenButton from './ListenButton';

export default function InfoDrawer({ poi, index, total, onClose, onPrev, onNext, narrator, compact = false, className = '', t = (text) => text }) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const closeBtn = (extra) => (
    <button type="button" onClick={onClose} aria-label={t('Close details')} className={'grid h-11 w-11 shrink-0 place-items-center rounded-full kd-photo-chip transition ' + extra}>
      <X size={18} />
    </button>
  );
  useEffect(() => {
    if (!imageExpanded) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setImageExpanded(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [imageExpanded]);
  return (
    <aside key={poi.id} className={'kd-slide-in pointer-events-auto flex flex-col overflow-hidden rounded-2xl border kd-line-2 kd-panel shadow-2xl backdrop-blur-md ' + className} aria-label={poi.title}>
      <div className={'relative shrink-0 overflow-hidden kd-photo-ph ' + (compact ? 'h-28' : 'h-36')}>
        {poi.image ? (
          <button
            type="button"
            onClick={() => setImageExpanded(true)}
            aria-label={`Expand photo: ${poi.imageAlt || poi.title}`}
            className="group absolute inset-0 h-full w-full cursor-zoom-in"
          >
            <img src={poi.image} alt={poi.imageAlt || poi.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full kd-photo-chip opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
              <Expand size={16} />
            </span>
          </button>
        ) : (
          <div className="grid h-full place-items-center text-center kd-text-4">
            <div className="px-6 text-[11px] tracking-wide">{t(poi.imageCaption || 'Photograph to be added')}</div>
          </div>
        )}
        {closeBtn('absolute right-2 top-2')}
        {poi.image && poi.imageSource && (
          <a href={poi.imageSource} target="_blank" rel="noreferrer" className="absolute bottom-2 left-2 z-[1] max-w-[calc(100%-1rem)] rounded-md kd-photo-chip px-2 py-1 text-[10px] underline decoration-current/40 underline-offset-2">
            {poi.imageCredit} · resized · {poi.imageLicense}
          </a>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.24em] kd-gold">{poi.kicker}</div>
            <h2 className="mt-1 kd-display text-xl leading-tight kd-text lg:text-2xl">{poi.title}</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed kd-text-2">{poi.description}</p>
        <ListenButton
          narrator={narrator}
          id={`poi:${poi.id}`}
          label={t(poi.title)}
          onToggle={() => narrator.toggleReadPoi(poi)}
          t={t}
          className="mt-3"
        />
        {poi.facts?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {poi.facts.map((f) => (
              <span key={f} className="rounded-full border kd-accent-line-soft kd-accent-soft px-3 py-1 text-xs kd-gold">{f}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t kd-line px-3 py-1 text-xs kd-text-3">
        <button type="button" onClick={onPrev} className="kd-drawer-nav-button flex min-h-11 items-center gap-1 rounded-lg px-3 transition"><ChevronLeft size={14} /> {t('Prev')}</button>
        <span className="tabular-nums kd-text-2" aria-label={`Feature ${index + 1} of ${total}`}>{index + 1} / {total}</span>
        <button type="button" onClick={onNext} className="kd-drawer-nav-button flex min-h-11 items-center gap-1 rounded-lg px-3 transition">{t('Next')} <ChevronRight size={14} /></button>
      </div>
      {imageExpanded && (
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Full-size photo: ${poi.imageAlt || poi.title}`}
            className="fixed inset-0 z-[100] grid place-items-center kd-scrim p-4 backdrop-blur-sm sm:p-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) setImageExpanded(false);
            }}
          >
            <button
              type="button"
              onClick={() => setImageExpanded(false)}
              aria-label="Close full-size photo"
              className="absolute right-4 top-4 z-[1] grid h-12 w-12 place-items-center rounded-full border kd-photo-chip transition"
            >
              <X size={22} />
            </button>
            <img
              src={poi.image}
              alt={poi.imageAlt || poi.title}
              className="max-h-[calc(100dvh-7rem)] max-w-full object-contain"
            />
            {poi.imageSource && (
              <a
                href={poi.imageSource}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 max-w-[calc(100%-2rem)] rounded-md kd-photo-chip px-3 py-2 text-center text-xs underline decoration-current/40 underline-offset-2"
              >
                {poi.imageCredit} · resized · {poi.imageLicense} · View source
              </a>
            )}
          </div>,
          document.body,
        )
      )}
    </aside>
  );
}