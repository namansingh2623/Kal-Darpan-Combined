import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import './viewer.css';
import { getMonument } from './monumentsData';
import { createTimelineStore } from './timelineStore';
import MonumentCanvas from './MonumentCanvas';
import { computeExplodeVec } from './explode';

export default function StaticMonumentView({ monumentId, initial, hotspots, activeHotspot, onHotspot, zoomRequest = 0, resetCount = 0, visitorMode = false }) {
  const monument = getMonument(monumentId);
  const startT = initial?.t ?? 1;
  const store = useMemo(
    () => createTimelineStore({ playSeconds: monument.construction.playSeconds, initialT: startT }),
    [monument, startT],
  );
  const { t } = useSyncExternalStore(store.subscribe, store.getState);
  const shared = useRef({ t: startT, explode: initial?.explode ? 1 : 0 });
  const [cameraGoal, setCameraGoal] = useState(null);
  useEffect(() => {
    setCameraGoal(visitorMode
      ? { position: [0, 1.65, 16], target: [0, 1.65, 0] }
      : { position: monument.camera.position, target: monument.camera.target });
  }, [visitorMode, monument]);
  useEffect(() => {
    if (!activeHotspot) return;
    const poi = monument.pois.find((item) => item.id === activeHotspot);
    if (!poi) return;
    const offset = computeExplodeVec(
      monument.explode,
      poi.part,
      poi.phase,
      new THREE.Vector3(...(poi.anchor || poi.position)),
    );
    const explode = shared.current.explode;
    setCameraGoal({
      focus: [poi.position[0] + offset.x * explode, poi.position[1] + offset.y * explode, poi.position[2] + offset.z * explode],
      distance: 13,
    });
  }, [activeHotspot, monument, zoomRequest]);
  useEffect(() => {
    if (resetCount) setCameraGoal({ position: monument.camera.position, target: monument.camera.target });
  }, [resetCount, monument]);
  // The notes panel's hotspots become markers on the same canvas.
  const pois = useMemo(
    () => hotspots.map((h) => {
      const poi = monument.pois.find((p) => p.id === h.id);
      return {
        id: h.id, title: h.title, position: poi?.position || h.position,
        anchor: poi?.anchor, part: poi?.part || h.id,
        appearsAt: poi?.appearsAt ?? 0,
      };
    }),
    [hotspots, monument],
  );
  return (
    <>
      <MonumentCanvas
        monument={monument}
        store={store}
        explode={!!initial?.explode}
        cameraMode={visitorMode ? 'free' : 'orbit'}
        cameraGoal={cameraGoal}
        cameraResetKey={resetCount}
        shared={shared}
        activePoiId={activeHotspot}
        pois={pois}
        onSelectPoi={(poi) => onHotspot(poi.id)}
      />
      {t < 0.999 && (
        <button type="button" className="secondary" style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 5 }} onClick={() => store.setT(1)}>
          SHOW FINISHED MONUMENT
        </button>
      )}
    </>
  );
}