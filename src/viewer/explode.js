import * as THREE from 'three';

const ZERO = [0, 0, 0];

/**
 * Offset (in model space) a part should travel when the model is fully exploded.
 * Rule lookup order: part tag -> phase id -> cfg.default.
 * offset = (position - center) * scale + offset, all multiplied by cfg.factor.
 */
export function computeExplodeVec(cfg, tag, phaseId, pos, out = new THREE.Vector3()) {
  if (!cfg) return out.set(0, 0, 0);
  const rule = (tag && cfg.rules?.[tag]) || (phaseId && cfg.rules?.[phaseId]) || cfg.default || {};
  const c = cfg.center || ZERO;
  const s = rule.scale || ZERO;
  const o = rule.offset || ZERO;
  const f = cfg.factor ?? 1;
  return out.set(
    ((pos.x - c[0]) * s[0] + o[0]) * f,
    ((pos.y - c[1]) * s[1] + o[1]) * f,
    ((pos.z - c[2]) * s[2] + o[2]) * f,
  );
}
