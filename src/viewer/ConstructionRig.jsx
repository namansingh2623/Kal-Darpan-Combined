import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { computeExplodeVec } from './explode';
import { clamp01 } from './timelineUtils';

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const partTag = (mesh) => mesh.userData.hotspot || mesh.userData.part || null;

function ancestry(mesh, root) {
  let n = mesh;
  let s = '';
  while (n) {
    s += ' ' + n.name;
    if (n === root) break;
    n = n.parent;
  }
  return s;
}

function matches(part, rule) {
  if (rule.tags && !(part.tag && rule.tags.includes(part.tag))) return false;
  if (rule.notTags && part.tag && rule.notTags.includes(part.tag)) return false;
  if (rule.names && !rule.names.some((n) => new RegExp(n, 'i').test(part.names))) return false;
  if (rule.y && !(part.center.y >= rule.y[0] && part.center.y < rule.y[1])) return false;
  return true;
}

/** Walks every mesh in the model, assigns it to a construction phase and a build window. */
function buildParts(object, construction, explodeCfg) {
  const { phases } = construction;
  object.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(object.matrixWorld).invert();
  const parts = [];

  object.traverse((mesh) => {
    if (!mesh.isMesh) return;
    mesh.receiveShadow = true;
    if (!mesh.userData.noShadow) mesh.castShadow = true; // thin slabs and decals never cast shadows

    const box = new THREE.Box3().setFromObject(mesh).applyMatrix4(inv);
    const center = box.getCenter(new THREE.Vector3());
    const origin = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld).applyMatrix4(inv);
    const parentRel = new THREE.Matrix4().multiplyMatrices(inv, mesh.parent.matrixWorld);
    const toLocal = new THREE.Matrix3().setFromMatrix4(parentRel).invert();

    // Materials are shared between meshes, so clone them to fade each mesh independently.
    const wasArray = Array.isArray(mesh.material);
    const mats = (wasArray ? mesh.material : [mesh.material]).map((m) => m.clone());
    mesh.material = wasArray ? mats : mats[0];

    parts.push({
      mesh, mats,
      baseOpacity: mats.map((m) => m.opacity),
      baseTransparent: mats.map((m) => m.transparent),
      basePos: mesh.position.clone(),
      baseScale: mesh.scale.clone(),
      center, origin,
      pivotBottom: new THREE.Vector3(center.x, box.min.y, center.z),
      bottomY: box.min.y,
      index: parts.length,
      toLocal,
      tag: partTag(mesh),
      names: ancestry(mesh, object),
      cur: 0, start: 0, end: 1,
      lastCur: -1, lastEx: -1,
    });
  });

  const fallback = phases.find((p) => !p.match) || phases[phases.length - 1];
  parts.forEach((p) => {
    p.phase = phases.find((ph) => ph.match && matches(p, ph.match)) || fallback;
    p.style = p.phase.style || 'rise';
    p.exVec = computeExplodeVec(explodeCfg, p.tag, p.phase.id, p.origin);
  });

  // Inside a phase, build from the bottom up (stagger), each part gets its own window.
  phases.forEach((ph) => {
    const group = parts.filter((p) => p.phase === ph).sort((a, b) => a.bottomY - b.bottomY || a.index - b.index);
    const span = ph.to - ph.from;
    const own = span * 0.38;
    group.forEach((p, i) => {
      p.start = ph.from + (group.length > 1 ? ((span - own) * i) / (group.length - 1) : 0);
      p.end = p.start + own;
    });
  });
  return parts;
}

const d = new THREE.Vector3();
const tmp = new THREE.Vector3();

function applyPart(p, ex) {
  const m = p.mesh;
  if (p.cur <= 0.001) {
    m.visible = false;
    return;
  }
  m.visible = true;
  const e = easeInOutCubic(p.cur);
  let sx = 1, sy = 1, sz = 1, op = 1, dy = 0, pivot = null;
  switch (p.style) {
    case 'scale': sx = sy = sz = Math.max(e, 0.001); op = Math.min(1, e * 2.2); pivot = p.center; break;
    case 'fade': op = e; break;
    case 'drop': op = Math.min(1, e * 2); dy = (1 - e) * 4; break;
    default: sx = sz = 0.45 + 0.55 * e; sy = Math.max(e, 0.001); op = Math.min(1, e * 2.2); pivot = p.pivotBottom; // 'rise'
  }
  m.scale.set(p.baseScale.x * sx, p.baseScale.y * sy, p.baseScale.z * sz);

  // Scaling about a pivot: displacement = (1 - S) * (pivot - origin)
  d.set(0, dy, 0);
  if (pivot) d.set((1 - sx) * (pivot.x - p.origin.x), (1 - sy) * (pivot.y - p.origin.y) + dy, (1 - sz) * (pivot.z - p.origin.z));
  d.add(tmp.copy(p.exVec).multiplyScalar(ex));
  d.applyMatrix3(p.toLocal);
  m.position.copy(p.basePos).add(d);

  for (let i = 0; i < p.mats.length; i++) {
    const mat = p.mats[i];
    mat.opacity = p.baseOpacity[i] * op;
    mat.transparent = p.baseTransparent[i] || op < 0.999;
  }
}

/**
 * Drives construction (timeline) and explode (spring) for any Object3D.
 * `shared.current` receives { t, explode } every frame so POI markers can follow.
 * The canvas renders on demand, so this rig asks for new frames only while something moves.
 */
export default function ConstructionRig({ object, construction, explodeCfg, store, explode, shared }) {
  const parts = useMemo(() => {
    const initialT = store.getState().t;
    return buildParts(object, construction, explodeCfg).map((part) => ({
      ...part,
      cur: clamp01((initialT - part.start) / (part.end - part.start)),
    }));
  }, [object, construction, explodeCfg, store]);
  const invalidate = useThree((s) => s.invalidate);
  const explodeRef = useRef(explode);
  const spring = useRef({ x: 0, v: 0 });
  const snapSeen = useRef(store.getState().snap);

  useEffect(() => { explodeRef.current = explode; invalidate(); }, [explode, invalidate]);
  useEffect(() => store.subscribe(() => invalidate()), [store, invalidate]);
  useEffect(() => { invalidate(); }, [parts, invalidate]);
  useEffect(() => () => parts.forEach((p) => p.mats.forEach((m) => m.dispose())), [parts]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    store.tick(dt);
    const state = store.getState();
    const t = state.t;
    const snap = state.snap !== snapSeen.current;
    snapSeen.current = state.snap;

    // Underdamped spring -> slight overshoot, then settles.
    const sp = spring.current;
    const goal = explodeRef.current ? 1 : 0;
    sp.v += ((goal - sp.x) * 110 - sp.v * 13) * dt;
    sp.x += sp.v * dt;
    if (Math.abs(sp.x - goal) < 0.0004 && Math.abs(sp.v) < 0.002) { sp.x = goal; sp.v = 0; }

    shared.current.t = t;
    shared.current.explode = sp.x;

    // Exponential smoothing toward the timeline target; parts that disappear do so quickly.
    const kUp = 1 - Math.exp(-dt * 3.5);
    const kDown = 1 - Math.exp(-dt * 9);
    let busy = false;
    for (const p of parts) {
      const target = clamp01((t - p.start) / (p.end - p.start));
      if (snap) p.cur = target;
      else {
        p.cur += (target - p.cur) * (target < p.cur ? kDown : kUp);
        if (Math.abs(target - p.cur) < 0.0008) p.cur = target;
      }
      if (p.cur !== target) busy = true;
      if (p.cur !== p.lastCur || sp.x !== p.lastEx) {
        applyPart(p, sp.x);
        p.lastCur = p.cur;
        p.lastEx = sp.x;
      }
    }
    if (busy || state.playing || sp.x !== goal || sp.v !== 0) invalidate();
  });

  return <primitive object={object} />;
}