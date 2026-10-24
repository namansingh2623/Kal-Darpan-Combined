import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { formatYear, nextMilestone, phaseAt, tAtYear, yearAt } from './timelineUtils';
import NarrationControls from './NarrationControls';
import ListenButton from './ListenButton';

const round = 'grid shrink-0 place-items-center rounded-full border transition-all duration-200 active:scale-95 ';
const STEP = 0.02;
const BIG_STEP = 0.1;
const keep = { keepPlaying: true };

export default function TimelineBar({ store, construction, events = [], source, translate = (text) => text, narrator, onRead, onListenEvent, onListenPhase, onListenAdditionalInfo }) {
  const { t, playing } = useSyncExternalStore(store.subscribe, store.getState);
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const resumeAfterDrag = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [openEventId, setOpenEventId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const phase = phaseAt(construction, t);
  const complete = t >= 0.999;
  const year = formatYear(construction, yearAt(construction, t));
  const status = translate(complete ? 'Construction complete' : phase?.label);
  const glide = !playing && !isDragging ? ' transition-[left,width] duration-300 ease-out' : '';

  const marks = useMemo(() => {
    const list = [
      { id: 'start', at: 0, start: true, title: translate('Groundbreaking'), label: formatYear(construction, yearAt(construction, 0)) },
      ...construction.phases
        .filter((phase) => phase.from > 0.001)
        .map((phase) => ({
          id: phase.id,
          at: phase.from,
          title: translate(`Start ${phase.label}`),
          label: formatYear(construction, yearAt(construction, phase.from)),
        })),
    ];
    return list;
  }, [construction, translate]);

  const timeline = useMemo(
    () => events.map((e, i) => ({ ...e, id: 'ev' + i })),
    [events],
  );
  const openEvent = timeline.find((e) => e.id === openEventId) || null;

  const seek = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    store.setT((e.clientX - r.left) / r.width);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    if (resumeAfterDrag.current && store.getState().t < 0.999) store.play();
  };
  const pickEvent = (e) => {
    setOpenEventId((id) => (id === e.id ? null : e.id));
    const eventT = tAtYear(construction, Number(e.year));
    if (eventT !== null) store.setT(eventT, { snap: true });
  };
  const onKeyDown = (e) => {
    const step = e.shiftKey ? BIG_STEP : STEP;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') store.nudge(step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') store.nudge(-step);
    else if (e.key === 'Home') store.setT(0, { snap: true, keepPlaying: true });
    else if (e.key === 'End') store.setT(1);
    else if (e.key === ' ') store.toggle();
    else return;
    e.preventDefault();
  };

  return (
    <div className="kd-timeline-card pointer-events-auto min-w-0 max-w-4xl rounded-2xl border kd-line kd-panel p-4 shadow-[0_0_40px_rgba(201,164,92,0.10)] backdrop-blur-md md:p-5">
      <div className="sr-only" role="status" aria-live="polite">{status}</div>
      <p id="timeline-help" className="sr-only">{translate('Use left and right arrow keys to move through time, shift for bigger steps, space to play or pause, home and end to jump to the start or finish.')}</p>

      <div className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
        <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
        <button type="button" onClick={() => store.setT(nextMilestone(construction, store.getState().t, -1), keep)} aria-label={translate('Previous building phase')}
          className={round + 'kd-timeline-control h-10 w-10 kd-line-2 kd-text-2 kd-hover-line kd-hover-text'}><SkipBack size={16} /></button>
        <button
          type="button"
          onClick={store.toggle}
          aria-label={translate(playing ? 'Pause construction' : complete ? 'Replay construction' : 'Play construction')}
          className={round + 'kd-timeline-control kd-timeline-play h-10 w-10 kd-accent-line kd-accent-soft kd-gold kd-accent-hover'}
        >
          {playing ? <Pause size={20} /> : <Play size={20} className="translate-x-px" />}
        </button>
        <button type="button" onClick={() => store.setT(nextMilestone(construction, store.getState().t, 1), keep)} aria-label={translate('Next building phase')}
          className={round + 'kd-timeline-control h-10 w-10 kd-line-2 kd-text-2 kd-hover-line kd-hover-text'}><SkipForward size={16} /></button>
        <button type="button" onClick={() => store.setT(0, { snap: true })} aria-label={translate('Reset to groundbreaking')}
          className={round + 'kd-timeline-control h-10 w-10 kd-line-2 kd-text-2 kd-hover-line kd-hover-text'}><RotateCcw size={16} /></button>
          </div>

          <NarrationControls narrator={narrator} onRead={onRead} />

          <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-[5rem]">
            <div className="text-[11px] uppercase tracking-[0.2em] kd-gold">{translate('Year')}</div>
            <div className="kd-year text-2xl leading-none kd-text">{year}</div>
          </div>

          <div className="min-w-0 flex-1">
            <div key={(phase?.id ?? '') + complete} className="truncate text-sm kd-display kd-text kd-fade">{status}</div>
          </div>
          </div>
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
            className="kd-rainbow-button flex min-h-10 shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-sm transition"
        >
            <span className="kd-rainbow-text">{translate(detailsOpen ? 'Hide details' : 'History & notes')}</span>
            <ChevronDown size={14} className={'kd-gold ' + (detailsOpen ? 'rotate-180 transition-transform' : 'transition-transform')} />
        </button>
      </div>

      <div className="relative mx-3 mt-2 h-10">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={translate('Construction timeline')}
          aria-describedby="timeline-help"
          aria-keyshortcuts="Space ArrowLeft ArrowRight Home End"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          aria-valuetext={year + ', ' + status}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            resumeAfterDrag.current = store.getState().playing;
            setIsDragging(true);
            seek(e);
          }}
          onPointerMove={(e) => { if (dragging.current) seek(e); }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute inset-0 cursor-pointer touch-none select-none rounded outline-none kd-focus-ring"
        >
          <div className="absolute inset-x-0 top-2 h-2 -translate-y-1/2 rounded-full kd-track" />
          <div
            className={'absolute left-0 top-2 h-2 -translate-y-1/2 rounded-full kd-progress' + glide}
            style={{ width: `${t * 100}%` }}
          />
        </div>

        <div role="group" aria-label={translate('Building phases and events')} className="pointer-events-none absolute inset-0">
          {marks.map((m) => {
            const reached = m.start ? t > 0.001 : t >= m.at - 0.001;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => store.setT(m.at, m.start ? { snap: true, keepPlaying: true } : keep)}
                title={`${m.title} (${m.label})`}
                aria-label={translate(m.start ? `Jump to the start, ${m.label}` : `Jump to ${m.title}, ${m.label}`)}
                className="kd-milestone-button group pointer-events-auto absolute top-2 -translate-x-1/2 -translate-y-1/2 p-2"
                style={{ left: `${m.at * 100}%` }}
              >
                <span className={'block h-3.5 w-3.5 rotate-45 border-2 transition-all duration-300 ' + (reached ? 'kd-gold-line kd-gold-bg' : 'kd-line-3 kd-bg kd-ghover-gold-line')} />
              </button>
            );
          })}

          <div
            className={'pointer-events-none absolute top-2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 kd-thumb' + glide}
            style={{ left: `${t * 100}%` }}
          />
        </div>
      </div>

      {detailsOpen && (
        <div>
          <div className="mb-3 border-t kd-line pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="kd-display text-sm kd-text">{translate(phase?.label || status)}</div>
              {phase?.description && (
                <ListenButton
                  narrator={narrator}
                  id="phase-details"
                  label={translate(phase.label)}
                  onToggle={() => onListenPhase?.(phase)}
                  t={translate}
                />
              )}
            </div>
            {phase?.description && <p className="mt-2 text-sm leading-relaxed kd-text-2">{translate(phase.description)}</p>}
            {narrator?.hasAdditionalInfo && (
              <ListenButton
                narrator={narrator}
                id="additional-info"
                label={translate('Later history')}
                onToggle={onListenAdditionalInfo}
                t={translate}
                className="mt-3"
              />
            )}
          </div>
          {timeline.length > 0 && (
            <div>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="text-xs uppercase tracking-[0.22em] kd-gold">{translate('Historical moments')}</div>
                <p className="text-xs kd-text-4">{translate('Events during construction jump to that year; later events are context only. Swipe for more →')}</p>
              </div>
              <ul aria-label="Historical moments" className="kd-history-list -mx-1 m-0 flex list-none gap-2 overflow-x-auto px-1 pb-2">
                {timeline.map((e) => (
                  <li key={e.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => pickEvent(e)}
                      aria-pressed={openEventId === e.id}
                      className={'kd-history-event rounded-full border px-3 py-1.5 text-xs transition-all duration-200 ' +
                        (openEventId === e.id ? 'is-active' : '')}
                    >
                      <span className="kd-year">{e.year}</span> · <span className="kd-display">{translate(e.label)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {openEvent && (
                <div key={openEvent.id} className="kd-fade mt-2 rounded-xl border kd-line kd-soft p-3">
                  <div className="kd-display text-sm kd-gold">{openEvent.year} · {translate(openEvent.label)}</div>
                  <p className="kd-body mt-1 text-sm leading-relaxed kd-text-2">{translate(openEvent.text)}</p>
                  <ListenButton
                    narrator={narrator}
                    id={`event:${Number(openEvent.id.slice(2))}`}
                    label={translate(openEvent.label)}
                    onToggle={() => onListenEvent?.(openEvent, Number(openEvent.id.slice(2)))}
                    t={translate}
                    className="mt-3"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t kd-line pt-3 text-xs kd-text-4">
            <span>{translate('The 3D reconstruction is illustrative and not to scale.')}</span>
            {source && <a href={source} target="_blank" rel="noreferrer" className="kd-gold underline underline-offset-2">{translate('Historical overview ↗')}</a>}
          </div>
          {construction.note && <p className="mt-2 text-xs leading-relaxed kd-text-4">{translate(construction.note)}</p>}
        </div>
      )}
    </div>
  );
}
