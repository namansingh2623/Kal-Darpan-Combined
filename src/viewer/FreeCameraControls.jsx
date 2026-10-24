import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const clampPitch = (pitch) => THREE.MathUtils.clamp(pitch, -0.48, 0.48);
const movementKeys = new Set(['w', 'a', 's', 'd', 'shift']);

export default function FreeCameraControls({ goal }) {
  const camera = useThree((state) => state.camera);
  const { gl, invalidate } = useThree();
  const look = useRef({ yaw: 0, pitch: 0 });
  const keys = useRef(new Set());
  const dragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const animation = useRef(null);
  const vectors = useMemo(() => ({
    direction: new THREE.Vector3(),
    target: new THREE.Vector3(),
    position: new THREE.Vector3(),
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    movement: new THREE.Vector3(),
    worldUp: new THREE.Vector3(0, 1, 0),
  }), []);
  const eyeHeight = useRef(1.65);

  const syncLook = useCallback(() => {
    vectors.direction.set(0, 0, -1).applyQuaternion(camera.quaternion);
    look.current.yaw = Math.atan2(-vectors.direction.x, -vectors.direction.z);
    look.current.pitch = clampPitch(Math.asin(THREE.MathUtils.clamp(vectors.direction.y, -1, 1)));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = look.current.yaw;
    camera.rotation.x = look.current.pitch;
    camera.rotation.z = 0;
  }, [camera, vectors]);

  useEffect(() => {
    syncLook();
  }, [syncLook]);

  useEffect(() => {
    if (!goal) return;
    const { target, position, direction } = vectors;
    target.set(...(goal.focus || goal.target));
    if (goal.position) {
      position.set(...goal.position);
      eyeHeight.current = position.y;
    } else {
      camera.getWorldDirection(direction);
      position.copy(target).addScaledVector(direction, -(goal.distance || 13));
      eyeHeight.current = position.y;
    }
    animation.current = { target: target.clone(), position: position.clone(), time: 0 };
    invalidate();
  }, [goal, camera, invalidate, vectors]);

  useEffect(() => {
    const canvas = gl.domElement;
    const pressedKeys = keys.current;
    const previousTabIndex = canvas.getAttribute('tabindex');
    const previousLabel = canvas.getAttribute('aria-label');
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Visitor mode. Drag to look around; use W A S D to walk.');

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      dragging.current = true;
      previousPointer.current = { x: event.clientX, y: event.clientY };
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerMove = (event) => {
      if (!dragging.current) return;
      const dx = event.clientX - previousPointer.current.x;
      const dy = event.clientY - previousPointer.current.y;
      previousPointer.current = { x: event.clientX, y: event.clientY };
      look.current.yaw -= dx * 0.003;
      look.current.pitch = clampPitch(look.current.pitch - dy * 0.003);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(look.current.pitch, look.current.yaw, 0);
      invalidate();
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerUp = (event) => {
      if (!dragging.current) return;
      dragging.current = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      event.stopPropagation();
    };
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target !== canvas) return;
      pressedKeys.add(key);
      event.preventDefault();
      event.stopPropagation();
      invalidate();
    };
    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (movementKeys.has(key)) pressedKeys.delete(key);
    };
    const onBlur = () => {
      pressedKeys.clear();
      dragging.current = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      pressedKeys.clear();
      if (previousTabIndex === null) canvas.removeAttribute('tabindex');
      else canvas.setAttribute('tabindex', previousTabIndex);
      if (previousLabel === null) canvas.removeAttribute('aria-label');
      else canvas.setAttribute('aria-label', previousLabel);
    };
  }, [camera, gl, invalidate]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const currentAnimation = animation.current;
    if (currentAnimation) {
      const k = 1 - Math.exp(-dt * 4);
      camera.position.lerp(currentAnimation.position, k);
      camera.lookAt(currentAnimation.target);
      currentAnimation.time += dt;
      if (camera.position.distanceTo(currentAnimation.position) < 0.03 || currentAnimation.time > 3.5) {
        camera.position.copy(currentAnimation.position);
        camera.lookAt(currentAnimation.target);
        animation.current = null;
        syncLook();
        if (keys.current.size > 0) invalidate();
      } else {
        invalidate();
      }
      return;
    }

    if (keys.current.size === 0) return;
    camera.getWorldDirection(vectors.forward);
    vectors.forward.y = 0;
    vectors.forward.normalize();
    vectors.right.crossVectors(vectors.forward, vectors.worldUp).normalize();
    vectors.movement.set(0, 0, 0);
    if (keys.current.has('w')) vectors.movement.add(vectors.forward);
    if (keys.current.has('s')) vectors.movement.sub(vectors.forward);
    if (keys.current.has('d')) vectors.movement.add(vectors.right);
    if (keys.current.has('a')) vectors.movement.sub(vectors.right);
    if (vectors.movement.lengthSq() > 0) {
      const speed = keys.current.has('shift') ? 8 : 4.5;
      camera.position.addScaledVector(vectors.movement.normalize(), speed * dt);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -30, 30);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -30, 30);
      camera.position.y = eyeHeight.current;
    }
    invalidate();
  });

  return null;
}
