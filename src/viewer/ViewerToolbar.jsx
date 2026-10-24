import { Box, Boxes, Move3d, RotateCw, Rotate3d, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function Seg({ active, onClick, icon: Icon, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={'flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs tracking-wide transition whitespace-nowrap ' + className + ' ' +
        (active ? 'kd-accent-bg' : 'kd-text-3 kd-hover-text')}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Dropdown({ label, children, isOpen, onToggle }) {
  return (
    <div className="relative shrink-0 group">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition ' +
          (isOpen ? 'kd-gold-line kd-accent-bg' : 'kd-accent-line kd-panel-soft kd-gold kd-accent-hover')}
      >
        {label}
        <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      <div className={'absolute top-full left-0 mt-2 transition-opacity duration-200 z-50 ' + (isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className="flex flex-col gap-1 py-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ViewerToolbar({ explode, onToggleExplode, cameraMode, onCameraMode, onPreset, className = '', t = (text) => text }) {
  const [modeOpen, setModeOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggleExplode}
        aria-pressed={explode}
        className={'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition ' +
          (explode
            ? 'kd-gold-line kd-accent-bg shadow-[0_0_24px_rgba(240,200,120,0.55)]'
            : 'kd-accent-line kd-panel-soft kd-gold kd-accent-hover')}
      >
        {explode ? <Box size={15} /> : <Boxes size={15} />}
        {t(explode ? 'Assemble' : 'Explode')}
      </button>

      <Dropdown label={t('MODE')} isOpen={modeOpen} onToggle={() => { setModeOpen(!modeOpen); setViewOpen(false); }}>
        <Seg active={cameraMode === 'orbit'} onClick={() => { onCameraMode('orbit'); setModeOpen(false); }} icon={Rotate3d}>{t('Orbit')}</Seg>
        <Seg active={cameraMode === 'turntable'} onClick={() => { onCameraMode('turntable'); setModeOpen(false); }} icon={RotateCw}>{t('Turntable')}</Seg>
        <Seg active={cameraMode === 'free'} onClick={() => { onCameraMode('free'); setModeOpen(false); }} icon={Move3d}>{t('Visitor mode')}</Seg>
      </Dropdown>

      <Dropdown label={t('VIEW')} isOpen={viewOpen} onToggle={() => { setViewOpen(!viewOpen); setModeOpen(false); }}>
        {['front', 'top', 'iso'].map((key) => (
          <Seg key={key} onClick={() => { onPreset(key); setViewOpen(false); }}>
            {t(key.charAt(0).toUpperCase() + key.slice(1))}
          </Seg>
        ))}
      </Dropdown>

      <Seg onClick={() => onPreset('details')} className="kd-details-preset">{t('Details')}</Seg>

      {cameraMode === 'free' && (
        <p className="basis-full text-xs kd-text-3">{t('Click the model · drag to look · W/A/S/D to walk · Shift to move faster')}</p>
      )}
    </div>
  );
}
