import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { computeExplodeVec } from './explode';

function POI({ poi, number, explodeCfg, shared, active, onSelect, t }) {
  const group = useRef();
  const lastShown = useRef(false);
  const [shown, setShown] = useState(false);
  const base = useMemo(() => new THREE.Vector3(...poi.position), [poi]);
  const anchor = useMemo(() => new THREE.Vector3(...(poi.anchor || poi.position)), [poi]);
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const s = shared.current;
    const visible = s.t >= (poi.appearsAt ?? 0) - 0.002;
    if (visible !== lastShown.current) { lastShown.current = visible; setShown(visible); }
    if (group.current) {
      computeExplodeVec(explodeCfg, poi.part, poi.phase, anchor, vec);
      group.current.position.copy(base).addScaledVector(vec, s.explode);
    }
  });

  if (!shown) return null;
  return (
    <group ref={group} position={base}>
      <Html center zIndexRange={[1, 0]}>
        <button
          type="button"
          className={'kd-poi' + (active ? ' is-active' : '')}
          onClick={(e) => { e.stopPropagation(); onSelect(poi); }}
          aria-label={t(poi.title)}
        >
          <span className="kd-poi-ring" />
          <span className="kd-poi-dot">{number}</span>
          <span className="kd-poi-label">{t(poi.title)}</span>
        </button>
      </Html>
    </group>
  );
}

export default function POIMarkers({ pois, explodeCfg, shared, activeId, onSelect, t = (text) => text }) {
  return pois.map((poi, index) => (
    <POI key={poi.id} poi={poi} number={index + 1} explodeCfg={explodeCfg} shared={shared} active={poi.id === activeId} onSelect={onSelect} t={t} />
  ));
}
