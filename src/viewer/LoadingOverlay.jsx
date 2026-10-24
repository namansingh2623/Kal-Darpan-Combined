import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingOverlay({ title }) {
  const { active, progress } = useProgress();
  const [minShown, setMinShown] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinShown(true), 350);
    return () => clearTimeout(id);
  }, []);
  const visible = !minShown || active;
  return (
    <div className={'pointer-events-none absolute inset-0 z-20 grid place-items-center kd-bg transition-opacity duration-700 ' + (visible ? 'opacity-100' : 'opacity-0')} role="status" aria-hidden={!visible}>
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 kd-spinner" />
        <div className="mt-4 text-[10px] uppercase tracking-[0.3em] kd-gold-2">Preparing the model</div>
        <div className="mt-2 kd-display text-xl kd-text">{title}</div>
        {active && <div className="mt-2 text-xs tabular-nums kd-text-4">{Math.round(progress)}%</div>}
      </div>
    </div>
  );
}
