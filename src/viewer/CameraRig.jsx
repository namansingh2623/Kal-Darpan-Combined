import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Smoothly flies the camera to `goal` = { position, target } or { focus:[x,y,z], distance }.
 * Any user interaction with OrbitControls cancels the flight.
 */
export default function CameraRig({ goal }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const invalidate = useThree((s) => s.invalidate);
  const anim = useRef(null);

  useEffect(() => {
    if (!goal || !controls) return;
    const target = new THREE.Vector3(...(goal.focus || goal.target));
    let position;
    if (goal.position) position = new THREE.Vector3(...goal.position);
    else {
      const dir = camera.position.clone().sub(controls.target).normalize();
      const dist = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.65, controls.minDistance || 1, goal.distance || 14);
      position = target.clone().addScaledVector(dir, dist);
    }
    anim.current = { position, target, time: 0 };
    invalidate();
  }, [goal, camera, controls, invalidate]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => { anim.current = null; };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a || !controls) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3.2);
    camera.position.lerp(a.position, k);
    controls.target.lerp(a.target, k);
    controls.update();
    a.time += dt;
    if ((camera.position.distanceTo(a.position) < 0.03 && controls.target.distanceTo(a.target) < 0.03) || a.time > 3.5) anim.current = null;
    if (anim.current) invalidate();
  });
  return null;
}