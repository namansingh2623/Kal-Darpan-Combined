import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, BookOpen, CloudRain, CloudSun, Eye, EyeOff, Home, Keyboard, Moon, Move3d, SlidersHorizontal, Sun, Sunrise, Sunset, X } from 'lucide-react';
import './viewer.css';
import { getMonument } from './monumentsData';
import { createTimelineStore } from './timelineStore';
import { nextMilestone } from './timelineUtils';
import { computeExplodeVec } from './explode';
import MonumentCanvas from './MonumentCanvas';
import TimelineBar from './TimelineBar';
import useNarrator from './useNarrator';
import WeatherControl from './WeatherControl';
import ViewerToolbar from './ViewerToolbar';
import InfoDrawer from './InfoDrawer';
import ListenButton from './ListenButton';
import LoadingOverlay from './LoadingOverlay';
import ViewerErrorBoundary from './ViewerErrorBoundary';
import TimelineBackdrop from './TimelineBackdrop';
import useViewerTheme from './useViewerTheme';
import { LanguageToggle } from '../i18n.jsx';
import { monumentInfoSpeech } from './narrationText';

const PRESET_KEYS = ['front', 'top', 'iso', 'details'];
const SHORTCUTS = [
  ['Space / K', 'Play or pause construction'],
  ['← / →', 'Step back / forward (Shift = bigger step)'],
  ['Home / End', 'Jump to start / finish'],
  ['[ / ]', 'Previous / next building phase'],
  ['1 2 3 4', 'Camera: front, top, isometric, details'],
  ['Visitor mode · drag + W/A/S/D', 'Look around and walk at ground level'],
  ['Shift (canvas)', 'Walk faster in visitor mode'],
  ['E (outside free-fly canvas)', 'Explode / assemble'],
  ['N / P', 'Next / previous feature'],
  ['H', 'Hide / show the interface'],
  ['Esc', 'Close panels'],
  ['?', 'Show or hide this list'],
];

// Phones, tablets, and any window that is short (e.g. a small VS Code panel) use the compact layout.
const COMPACT_QUERY = '(max-width: 1023px), (max-height: 639px)';
function useCompact() {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const on = () => setCompact(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return compact;
}

const idle = 'kd-text-2 kd-hover kd-hover-text';
const on = 'kd-accent-bg';
const iconCls = 'h-11 w-11 shrink-0 place-items-center rounded-xl transition ';
const labelCls = 'flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs uppercase tracking-[0.12em] kd-gold transition kd-hover kd-hover-text';

const SEASON_OPTIONS = [
  { id: 'sunset', label: 'Sunset', Icon: Sunset },
  { id: 'sunrise', label: 'Sunrise', Icon: Sunrise },
  { id: 'cloudy', label: 'Cloudy', Icon: CloudSun },
  { id: 'rain', label: 'Rainy', Icon: CloudRain },
  { id: 'night', label: 'Night', Icon: Moon },
];

function SeasonControl({ season, onSelect, t }) {
  const [open, setOpen] = useState(false);
  const current = SEASON_OPTIONS.find((option) => option.id === season);
  return (
    <div className="kd-season-control">
      <button
        type="button"
        className="kd-season-launcher"
        aria-expanded={open}
        aria-controls="kd-season-options"
        onClick={() => setOpen((value) => !value)}
      >
        <CloudSun size={16} />
        <span>{t('Season')}</span>
        {current && <span className="kd-season-current">{t(current.label)}</span>}
      </button>
      {open && (
        <div className="kd-season-options" id="kd-season-options" role="group" aria-label="Season lighting">
          <button type="button" className={!season ? 'is-selected' : ''} aria-pressed={!season} onClick={() => { onSelect(null); setOpen(false); }}>{t('Original')}</button>
          {SEASON_OPTIONS.map(({ id, label, Icon }) => (
            <button key={id} type="button" className={season === id ? 'is-selected' : ''} aria-pressed={season === id} onClick={() => { onSelect(id); setOpen(false); }}>
              <Icon size={15} /> {t(label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Viewer({ monument, onBack, backLabel, onBackHome, onLearn, onExplorePoi, onToggleTheme, language, setLanguage, t }) {
  const theme = useViewerTheme();
  const store = useMemo(
    () => createTimelineStore({ playSeconds: monument.construction.playSeconds, initialT: 1 }),
    [monument],
  );
  const narrator = useNarrator({ store, monument });
  const shared = useRef({ t: 0, explode: 0 });
  const keysRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const compact = useCompact();
  const [explode, setExplode] = useState(false);
  const [cameraMode, setCameraMode] = useState('orbit');
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [cameraGoal, setCameraGoal] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const [season, setSeason] = useState(null);
  const [insets, setInsets] = useState({ top: 0, bottom: 0 });

  const poiIndex = monument.pois.findIndex((p) => p.id === activeId);
  const activePoi = poiIndex >= 0 ? monument.pois[poiIndex] : null;

  const selectPoi = (poi) => {
    if (!poi) return setActiveId(null);
    onExplorePoi?.(poi.id);
    // Make sure the part the marker belongs to has been built.
    if (store.getState().t < (poi.appearsAt ?? 0)) store.setT(poi.appearsAt);
    setActiveId(poi.id);
    const v = computeExplodeVec(monument.explode, poi.part, poi.phase, new THREE.Vector3(...(poi.anchor || poi.position)));
    const ex = shared.current.explode;
    setCameraGoal({ focus: [poi.position[0] + v.x * ex, poi.position[1] + v.y * ex, poi.position[2] + v.z * ex], distance: 13 });
  };
  const step = (dir) => {
    const n = monument.pois.length;
    selectPoi(monument.pois[poiIndex < 0 ? (dir > 0 ? 0 : n - 1) : (poiIndex + dir + n) % n]);
  };
  const preset = (key) => {
    const p = monument.camera.presets[key];
    setCameraGoal({ position: p.position, target: p.target || monument.camera.target });
  };
  const changeCameraMode = (mode) => {
    if (mode !== cameraMode && mode !== 'free') setCameraResetKey((key) => key + 1);
    setCameraGoal(mode === 'free' ? { position: [0, 1.65, 16], target: [0, 1.65, 0] } : null);
    setCameraMode(mode);
  };
  // Hand the exact state (timeline position, explode) to the quiz page so it shows the same model.
  const learn = () => onLearn?.({ t: store.getState().t, explode });

  // Always points at the latest state, so the listener below is attached only once.
  keysRef.current = (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.target;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName) || el?.isContentEditable) return;
    const onControl = !!el?.closest?.('button, a, summary, [role="slider"]');
    const t = store.getState().t;
    const big = e.shiftKey ? 0.1 : 0.02;
    switch (e.key) {
      case 'Escape': setActiveId(null); setHelpOpen(false); setToolsOpen(false); break;
      case ' ': if (onControl) return; store.toggle(); break; // buttons keep their native Space
      case 'k': case 'K': store.toggle(); break;
      case 'ArrowRight': store.nudge(big); break;
      case 'ArrowLeft': store.nudge(-big); break;
      case 'Home': store.setT(0, { snap: true, keepPlaying: true }); break;
      case 'End': store.setT(1); break;
      case ']': case 'PageDown': store.setT(nextMilestone(monument.construction, t, 1), { keepPlaying: true }); break;
      case '[': case 'PageUp': store.setT(nextMilestone(monument.construction, t, -1), { keepPlaying: true }); break;
      case 'e': case 'E': setExplode((v) => !v); break;
      case '1': case '2': case '3': case '4': preset(PRESET_KEYS[Number(e.key) - 1]); break;
      case 'n': case 'N': step(1); break;
      case 'p': case 'P': step(-1); break;
      case 'h': case 'H': setUiHidden((v) => !v); break;
      case '?': setHelpOpen((v) => !v); break;
      default: return;
    }
    e.preventDefault();
  };
  useEffect(() => {
    const onKey = (e) => keysRef.current?.(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Measure the panels so the camera can centre the model in the free space between them.
  useEffect(() => {
    const measure = () => {
      const top = !uiHidden && compact ? (topRef.current?.offsetHeight ?? 0) : 0;
      const bottom = uiHidden ? 0 : (bottomRef.current?.offsetHeight ?? 0);
      setInsets((o) => (o.top === top && o.bottom === bottom ? o : { top, bottom }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (topRef.current) ro.observe(topRef.current);
    if (bottomRef.current) ro.observe(bottomRef.current);
    return () => ro.disconnect();
  }, [compact, uiHidden, toolsOpen, activeId]);

  const themeButton = onToggleTheme ? (
    <button type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'light'} className={'flex min-h-11 items-center gap-2 rounded-lg border kd-line-2 px-4 text-xs uppercase tracking-[0.16em] kd-text-3 transition kd-hover-line kd-hover-text backdrop-blur-md kd-panel'}>
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      <span>{t(theme === 'dark' ? 'Light' : 'Dark')}</span>
    </button>
  ) : null;

  const toolbarProps = {
    explode, onToggleExplode: () => setExplode((v) => !v), cameraMode, onCameraMode: changeCameraMode, onPreset: preset,
    t,
  };

  return (
    <main className="kd-root fixed inset-0 z-[60] overflow-hidden kd-bg kd-text" aria-label={t(monument.title) + ' construction timeline'}>
      <ViewerErrorBoundary onBack={onBack}>
        <MonumentCanvas
          monument={monument}
          t={t}
          store={store}
          explode={explode}
          cameraMode={cameraMode}
          cameraGoal={cameraGoal}
          cameraResetKey={cameraResetKey}
          shared={shared}
          activePoiId={activeId}
          season={season}
          onSelectPoi={selectPoi}
          onBackgroundClick={() => setActiveId(null)}
          insets={insets}
          compact={compact}
        />
      </ViewerErrorBoundary>
      <TimelineBackdrop />
      <LoadingOverlay title={t(monument.title)} />

      <button
        type="button"
        onClick={() => setUiHidden(false)}
        aria-label="Show interface"
        tabIndex={uiHidden ? 0 : -1}
        className={'absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full border kd-line-2 kd-panel kd-text backdrop-blur-md transition-all duration-300 kd-hover ' +
          (uiHidden ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0')}
      >
        <Eye size={18} />
      </button>

      <div className={'pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out ' + (uiHidden ? 'opacity-0' : 'opacity-100')} inert={uiHidden} aria-hidden={uiHidden}>
          {compact ? (
            <div ref={topRef} className={'pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-2 sm:p-3 ' + (toolsOpen ? 'z-30' : '')}>
              <div className="pointer-events-auto mx-auto flex w-full max-w-4xl items-center gap-1 rounded-2xl border kd-line-2 kd-panel px-1.5 py-1 backdrop-blur-md">
                <button type="button" onClick={onBackHome} aria-label={t('Open the homepage')} className={'kd-home-button grid ' + iconCls + idle}><Home size={17} /></button>
                <button type="button" onClick={onBack} aria-label={`${t('Back')} ${t(backLabel)}`} className={'grid ' + iconCls + idle}><ArrowLeft size={18} /></button>
                <div className="min-w-0 flex-1 px-1">
                  <h1 className="truncate kd-display text-lg leading-tight kd-text sm:text-xl">{t(monument.title)}</h1>
                  <div className="truncate text-[11px] kd-text-3">{monument.yearsLabel} · {t(monument.location)}</div>
                </div>
                <button type="button" onClick={() => setToolsOpen((v) => !v)} aria-expanded={toolsOpen} aria-controls="kd-tools" aria-label="Tools: camera and model controls" className={'flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs ' + (toolsOpen ? on : idle)}><SlidersHorizontal size={18} /><span>{t('Tools')}</span></button>
                <button type="button" onClick={learn} aria-label={t('Notes and quiz')} className={labelCls}><BookOpen size={18} /><span className="hidden sm:inline">{t('Notes & quiz')}</span></button>
                <button type="button" onClick={() => setHelpOpen((v) => !v)} aria-label="Keyboard shortcuts" aria-haspopup="dialog" className={'hidden sm:grid ' + iconCls + idle}><Keyboard size={18} /></button>
                <LanguageToggle language={language} onChange={setLanguage} />
                {themeButton}
                <button type="button" onClick={() => setUiHidden(true)} aria-label="Hide interface" className={'grid ' + iconCls + idle}><EyeOff size={18} /></button>
              </div>
              <div
                className={'mx-auto grid w-full max-w-4xl transition-[grid-template-rows,opacity] duration-300 ease-out ' +
                  (toolsOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0')}
                inert={!toolsOpen}
              >
                <div className="min-h-0 overflow-hidden">
                  <div id="kd-tools" className="pointer-events-auto max-h-[55dvh] w-full overflow-y-auto rounded-2xl border kd-line-2 kd-panel p-3 backdrop-blur-md">
                    <ViewerToolbar {...toolbarProps} className="flex flex-wrap gap-2" />
                    <details className="mt-3 text-sm kd-text-2">
                      <summary className="min-h-11 cursor-pointer py-2 kd-text-3 kd-hover-text">{t('About, sources & model notes')}</summary>
                      <p className="leading-relaxed">{t(monument.description)}</p>
                      {monument.construction.note && <p className="mt-2 text-xs leading-relaxed kd-text-4">{monument.construction.note}</p>}
                      <p className="mt-2 text-xs kd-text-4">{t('The 3D reconstruction is illustrative and not to scale.')}</p>
                      <ListenButton narrator={narrator} id="monument-info" label={t('Monument information')} onToggle={() => narrator.toggleUser('monument-info', monumentInfoSpeech(monument))} t={t} className="mt-3" />
                      <a href={monument.source} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs kd-gold underline underline-offset-2">{t('Historical overview ↗')}</a>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="pointer-events-auto absolute left-5 top-5 bottom-auto w-[20rem] rounded-2xl border kd-line kd-panel p-5 backdrop-blur-md">
                <div className="mt-2 text-[11px] uppercase tracking-[0.24em] kd-gold">{monument.dynasty} · {monument.yearsLabel}</div>
                <h1 className="mt-1 kd-display text-3xl leading-none kd-text">{t(monument.title)}</h1>
                <div className="mt-1 text-sm kd-text-3">{t(monument.location)}</div>
                <details className="mt-3 text-sm kd-text-2">
                  <summary className="min-h-11 cursor-pointer py-2 kd-text-3 kd-hover-text">{t('About, sources & model notes')}</summary>
                  <p className="mt-2 leading-relaxed">{t(monument.description)}</p>
                  {monument.construction.note && <p className="mt-2 text-xs leading-relaxed kd-text-4">{monument.construction.note}</p>}
                  <p className="mt-2 text-xs kd-text-4">{t('The 3D reconstruction is illustrative and not to scale.')}</p>
                  <ListenButton narrator={narrator} id="monument-info" label={t('Monument information')} onToggle={() => narrator.toggleUser('monument-info', monumentInfoSpeech(monument))} t={t} className="mt-3" />
                  <a href={monument.source} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs kd-gold underline underline-offset-2">{t('Historical overview ↗')}</a>
                </details>
              </div>

              <div className="pointer-events-auto absolute left-5 top-[28rem] flex flex-col gap-2">
                <button type="button" onClick={onBackHome} aria-label={t('Open the homepage')} title={t('Open the homepage')} className={'kd-home-button grid ' + iconCls + idle}><Home size={17} /></button>
                <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-2 rounded-lg border kd-line-2 px-4 text-xs uppercase tracking-[0.16em] kd-text-3 transition kd-hover-line kd-hover-text backdrop-blur-md kd-panel"><ArrowLeft size={16} /> {t(backLabel)}</button>
                <button type="button" onClick={learn} className="flex min-h-11 items-center gap-2 rounded-lg border kd-line-2 px-4 text-xs uppercase tracking-[0.16em] kd-gold transition kd-hover-line kd-hover-text backdrop-blur-md kd-panel"><BookOpen size={16} /> {t('Notes & quiz')}</button>
                <button type="button" onClick={() => setHelpOpen((v) => !v)} aria-expanded={helpOpen} aria-haspopup="dialog" className="flex min-h-11 items-center gap-2 rounded-lg border kd-line-2 px-4 text-xs uppercase tracking-[0.16em] kd-text-3 transition kd-hover-line kd-hover-text backdrop-blur-md kd-panel"><Keyboard size={16} /> {t('Keys')}</button>
                <div className="flex items-center gap-2">
                  {themeButton}
                  <button type="button" onClick={() => setUiHidden(true)} aria-label="Hide interface" className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border kd-line-2 px-4 text-xs uppercase tracking-[0.16em] kd-text-3 transition kd-hover-line kd-hover-text backdrop-blur-md kd-panel"><EyeOff size={16} /> Hide</button>
                </div>
              </div>

              <ViewerToolbar {...toolbarProps} className="pointer-events-auto absolute right-5 top-5 flex max-w-[calc(100%-22rem)] flex-wrap justify-end gap-2" />
              {activePoi && (
                <InfoDrawer
                  poi={activePoi} index={poiIndex} total={monument.pois.length}
                  onClose={() => setActiveId(null)} onPrev={() => step(-1)} onNext={() => step(1)}
                  narrator={narrator} t={t}
                  className="absolute bottom-40 right-5 top-36 w-[22rem]"
                />
              )}
            </>
          )}

          {!compact && (
            <div className="kd-language-anchor pointer-events-auto absolute left-[24rem] top-5 z-30">
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>
          )}

          {helpOpen && (
            <div role="dialog" aria-label="Keyboard shortcuts" className="pointer-events-auto absolute left-1/2 top-1/2 z-40 max-h-[85dvh] w-[min(26rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border kd-line-2 kd-panel p-5 kd-text shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h2 className="kd-display text-xl kd-text">{t('Keyboard shortcuts')}</h2>
                <button type="button" autoFocus onClick={() => setHelpOpen(false)} aria-label="Close shortcuts" className="grid h-11 w-11 place-items-center rounded-full kd-text-2 kd-hover"><X size={18} /></button>
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
                {SHORTCUTS.map(([keys, what]) => (
                  <Fragment key={keys}>
                    <dt><kbd className="rounded-md border kd-line-2 kd-soft px-2 py-0.5 font-mono text-xs kd-gold">{keys}</kbd></dt>
                    <dd className="kd-text-2">{t(what)}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          )}

          {/* Bottom stack: on compact screens the info drawer docks above the timeline */}
          <div ref={bottomRef} className={'kd-timeline-layout pointer-events-none absolute inset-x-0 bottom-0 z-20 p-2 sm:p-3 lg:p-5 ' + (compact && toolsOpen ? 'z-10' : '')}>
            <div className="kd-season-inline pointer-events-auto flex shrink-0 items-end">
              <SeasonControl season={season} onSelect={setSeason} t={t} />
            </div>
            {compact && activePoi && (
              <InfoDrawer
                compact
                poi={activePoi} index={poiIndex} total={monument.pois.length}
                onClose={() => setActiveId(null)} onPrev={() => step(-1)} onNext={() => step(1)} narrator={narrator} t={t}
                className="mx-auto max-h-[34dvh] w-full max-w-4xl"
              />
            )}
            <TimelineBar
              store={store}
              construction={monument.construction}
              events={monument.events}
              source={monument.source}
              translate={t}
              narrator={narrator}
              onRead={() => narrator.readFeature(activePoi || undefined)}
              onListenEvent={(event, index) => narrator.toggleReadEvent(event, index)}
              onListenPhase={(phase) => narrator.toggleUser('phase-details', phase.narration || phase.description)}
              onListenAdditionalInfo={narrator.toggleAdditionalInfo}
            />
            <div className="kd-timeline-actions pointer-events-auto flex shrink-0 flex-col items-stretch gap-2">
              <WeatherControl location={monument.weather} monument={monument} t={t} language={language} />
              <button
                type="button"
                className={'kd-visitor-button ' + (cameraMode === 'free' ? 'is-active' : '')}
                aria-pressed={cameraMode === 'free'}
                onClick={() => changeCameraMode(cameraMode === 'free' ? 'orbit' : 'free')}
                title={t('Click the model, drag to look, and use W/A/S/D to walk')}
              >
                <Move3d size={16} />
                {t(cameraMode === 'free' ? 'Exit visitor mode' : 'Visitor mode')}
              </button>
            </div>
          </div>
      </div>
    </main>
  );
}

export default function MonumentViewer({ monumentId, onBack, backLabel = 'Museum', onBackHome, onLearn, onExplorePoi, onToggleTheme, language, setLanguage, t }) {
  const monument = getMonument(monumentId);
  return monument ? <Viewer key={monument.id} monument={monument} onBack={onBack} backLabel={backLabel} onBackHome={onBackHome} onLearn={onLearn} onExplorePoi={onExplorePoi} onToggleTheme={onToggleTheme} language={language} setLanguage={setLanguage} t={t} /> : null;
}