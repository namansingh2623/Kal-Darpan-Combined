import { useCallback, useEffect, useRef, useState } from 'react';
import { halls, chronicleLogs, STORAGE_KEY, TOTAL } from './gameData';
import { HallArt, Glyph } from './GameArt';
import './Game.css';

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const valid = new Set(halls.flatMap((h) => h.artifacts.map((a) => a.id)));
    return {
      found: Array.isArray(d?.found) ? d.found.filter((id) => valid.has(id)) : [],
      badgeSeen: d?.badgeSeen === true,
      archives: Array.isArray(d?.archives) ? d.archives.filter((id) => halls.some((h) => h.id === id)) : [],
    };
  } catch {
    return { found: [], badgeSeen: false, archives: [] };
  }
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Game({ onClose }) {
  const [state, setState] = useState(load);
  const [hallIdx, setHallIdx] = useState(0);
  const [briefing, setBriefing] = useState(true);
  const [card, setCard] = useState(null); // {type:'artifact'|'archive'|'badge', id?}
  const [zoom, setZoom] = useState(null); // {x,y} in px relative to stage
  const [drawer, setDrawer] = useState(false);
  const [hint, setHint] = useState(false);
  const viewRef = useRef(null);
  const stageRef = useRef(null);
  const closeRef = useRef(null);
  const hintTimer = useRef(0);

  const hall = halls[hallIdx];
  const { found, archives, badgeSeen } = state;
  const hallFound = hall.artifacts.filter((a) => found.includes(a.id)).length;
  const left = hall.artifacts.length - hallFound;
  const allDone = found.length === TOTAL;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage blocked: progress lasts this session */ }
  }, [state]);

  // Centre the scrollable scene (matters on narrow screens) and show the briefing whenever a hall is entered.
  useEffect(() => {
    const v = viewRef.current;
    if (v) { v.scrollLeft = (v.scrollWidth - v.clientWidth) / 2; v.scrollTop = 0; }
    setBriefing(true);
    const t = setTimeout(() => setBriefing(false), 8000);
    return () => clearTimeout(t);
  }, [hallIdx]);

  // Gentle parallax "camera". It is paused while a card is open.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || card || reduced()) return;
    const move = (e) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2;
      const py = (e.clientY / window.innerHeight - 0.5) * 2;
      stage.style.setProperty('--px', px.toFixed(3));
      stage.style.setProperty('--py', py.toFixed(3));
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [card]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; clearTimeout(hintTimer.current); };
  }, []);

  const closeCard = useCallback(() => { setCard(null); setZoom(null); }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (card) closeCard(); else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, closeCard, onClose]);

  useEffect(() => { if (card) closeRef.current?.focus(); }, [card]);

  function openArtifact(a, e) {
    const stage = stageRef.current;
    if (stage && e?.currentTarget) {
      const s = stage.getBoundingClientRect(), b = e.currentTarget.getBoundingClientRect();
      setZoom({ x: b.left + b.width / 2 - s.left, y: b.top + b.height / 2 - s.top });
    }
    setBriefing(false);
    setCard({ type: 'artifact', id: a.id });
  }

  function collect(a) {
    if (found.includes(a.id)) { closeCard(); return; }
    const nextFound = [...found, a.id];
    const hallDone = hall.artifacts.every((x) => nextFound.includes(x.id));
    const everything = nextFound.length === TOTAL;
    setState((s) => ({ ...s, found: nextFound, archives: hallDone && !s.archives.includes(hall.id) ? [...s.archives, hall.id] : s.archives }));
    setZoom(null);
    if (everything) setCard({ type: 'badge' });
    else if (hallDone) setCard({ type: 'archive', id: hall.id });
    else setCard(null);
  }

  function whisper() {
    setHint(true);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(false), 2600);
  }

  function resetProgress() {
    if (!window.confirm('Reset all your collected artifacts?')) return;
    setState({ found: [], badgeSeen: false, archives: [] });
    setCard(null); setZoom(null);
  }

  const activeArtifact = card?.type === 'artifact' ? halls.flatMap((h) => h.artifacts).find((a) => a.id === card.id) : null;
  const archiveHall = card?.type === 'archive' ? halls.find((h) => h.id === card.id) : null;
  const stageStyle = zoom ? { transformOrigin: `${zoom.x}px ${zoom.y}px`, transform: 'scale(1.35)' } : undefined;

  return (
    <div className="lore" role="dialog" aria-modal="true" aria-label="Hidden Lore game">
      <div className="lore-view" ref={viewRef}>
        <div className={'lore-stage' + (zoom ? ' is-zoomed' : '')} ref={stageRef} style={stageStyle} key={hall.id}>
          <HallArt hall={hall} />
          <div className="lore-dust" aria-hidden="true" />
          {hall.artifacts.map((a, i) => {
            const got = found.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                className={'lore-spot' + (got ? ' is-found' : '') + (hint && !got ? ' is-hint' : '')}
                style={{ left: a.x + '%', top: a.y + '%', '--d': i * 1.7 + 's' }}
                aria-label={got ? `Collected: ${a.name}` : 'Something faintly shimmers here'}
                onClick={(e) => openArtifact(a, e)}
              >
                {got && <span aria-hidden="true">✦</span>}
              </button>
            );
          })}
        </div>
      </div>

      <header className="lore-top">
        <div className="lore-title">
          <span className="eyebrow">Hidden Lore</span>
          <strong>{hall.name}</strong>
          <small>{hall.place}</small>
        </div>
        <nav className="lore-tabs" aria-label="Choose a hall">
          {halls.map((h, i) => {
            const n = h.artifacts.filter((a) => found.includes(a.id)).length;
            return (
              <button key={h.id} type="button" aria-current={i === hallIdx} className={i === hallIdx ? 'is-on' : ''} onClick={() => { closeCard(); setHallIdx(i); }}>
                {h.name}<span>{n}/{h.artifacts.length}</span>
              </button>
            );
          })}
        </nav>
        <div className="lore-right">
          <button type="button" className="lore-counter" onClick={() => setDrawer((d) => !d)} aria-expanded={drawer}>
            Artifacts Found: <b>{found.length}/{TOTAL}</b>
          </button>
          <button type="button" className="lore-x" onClick={onClose} aria-label="Leave the game">×</button>
        </div>
      </header>

      {briefing && !card && (
        <div className="lore-briefing" role="status">
          <p>
            {left === 0
              ? `Every artifact in this hall is found. Visit another hall to keep going.`
              : `${left} royal artifact${left > 1 ? 's are' : ' is'} lost in this hall. Find ${left > 1 ? 'them' : 'it'} to unlock the secret archives.`}
          </p>
          <button type="button" onClick={() => setBriefing(false)} aria-label="Dismiss">Begin</button>
        </div>
      )}

      <div className="lore-actions">
        <button type="button" className="lore-hint" onClick={whisper} disabled={left === 0}>✦ Whisper a hint</button>
        {archives.length > 0 && (
          <button type="button" className="lore-hint" onClick={() => setCard({ type: 'archive', id: archives.includes(hall.id) ? hall.id : archives[0] })}>Secret archives {archives.length}/3</button>
        )}
        {badgeSeen && <button type="button" className="lore-hint gold" onClick={() => setCard({ type: 'badge' })}>Chronicle Master</button>}
      </div>

      <aside className={'lore-drawer' + (drawer ? ' is-open' : '')} aria-label="Collected artifacts" aria-hidden={!drawer}>
        <div className="lore-drawer-head">
          <span className="eyebrow">Your collection</span>
          <button type="button" onClick={resetProgress} tabIndex={drawer ? 0 : -1}>Reset</button>
        </div>
        <ul>
          {halls.flatMap((h) => h.artifacts).map((a) => {
            const got = found.includes(a.id);
            return (
              <li key={a.id} className={got ? 'is-got' : ''}>
                {got ? <Glyph kind={a.kind} size={30} /> : <span className="lore-q">?</span>}
                <span>{got ? a.name : 'Undiscovered'}</span>
              </li>
            );
          })}
        </ul>
      </aside>

      {card && (
        <div className="lore-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) closeCard(); }}>
          {activeArtifact && (
            <article className="lore-card" aria-labelledby="lore-card-title">
              <Glyph kind={activeArtifact.kind} size={72} />
              <span className="eyebrow">{hall.name} · Artifact</span>
              <h2 id="lore-card-title">{activeArtifact.name}</h2>
              <hr className="gold-rule" />
              <p>{activeArtifact.text}</p>
              <div className="lore-card-btns">
                <button type="button" className="lore-primary" ref={closeRef} onClick={() => collect(activeArtifact)}>
                  {found.includes(activeArtifact.id) ? 'Close' : 'Add to collection'}
                </button>
              </div>
            </article>
          )}
          {archiveHall && (
            <article className="lore-card" aria-labelledby="lore-card-title">
              <span className="lore-seal" aria-hidden="true">✦</span>
              <span className="eyebrow">Secret archive unlocked</span>
              <h2 id="lore-card-title">{archiveHall.archive.title}</h2>
              <hr className="gold-rule" />
              <p>{archiveHall.archive.text}</p>
              <div className="lore-card-btns">
                <button type="button" className="lore-primary" ref={closeRef} onClick={closeCard}>Continue</button>
              </div>
            </article>
          )}
          {card.type === 'badge' && (
            <article className="lore-card lore-badge-card" aria-labelledby="lore-card-title">
              <svg className="lore-badge" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id="bdg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f3d98f" /><stop offset=".5" stopColor="#b08d57" /><stop offset="1" stopColor="#e6c27a" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 16 }, (_, i) => <path key={i} d="M60 4 L66 20 H54Z" fill="url(#bdg)" transform={`rotate(${i * 22.5} 60 60)`} />)}
                <circle cx="60" cy="60" r="40" fill="#0d0a08" stroke="url(#bdg)" strokeWidth="3" />
                <circle cx="60" cy="60" r="32" fill="none" stroke="url(#bdg)" strokeWidth="1" strokeDasharray="2 4" />
                <path d="M40 74 V50 L50 58 L60 40 L70 58 L80 50 V74Z" fill="url(#bdg)" />
              </svg>
              <span className="eyebrow">{allDone ? 'All 9 artifacts found' : 'Badge'}</span>
              <h2 id="lore-card-title">Chronicle Master</h2>
              <hr className="gold-rule" />
              <p>You recovered every lost artifact across the Taj Mahal, Qutub Minar and the Red Fort. The deep-dive historical logs are now open to you.</p>
              <div className="lore-logs">
                {chronicleLogs.map((l) => (
                  <details key={l.title}><summary>{l.title}</summary><p>{l.text}</p></details>
                ))}
              </div>
              <div className="lore-card-btns">
                <button type="button" className="lore-primary" ref={closeRef} onClick={() => { setState((s) => ({ ...s, badgeSeen: true })); closeCard(); }}>Wear the badge</button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
