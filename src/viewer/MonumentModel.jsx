import { useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { makeMonument } from './models';
import ConstructionRig from './ConstructionRig';

/** Scale to `size` scene units (longest side), centre on X/Z and sit on y = 0. */
function normalize(root, size = 12) {
  const wrapper = new THREE.Group();
  const box = new THREE.Box3().setFromObject(root);
  const dim = box.getSize(new THREE.Vector3());
  root.scale.multiplyScalar(size / Math.max(dim.x, dim.y, dim.z, 1e-6));
  root.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(root);
  root.position.x -= (b.min.x + b.max.x) / 2;
  root.position.z -= (b.min.z + b.max.z) / 2;
  root.position.y -= b.min.y;
  wrapper.add(root);
  return wrapper;
}

function Procedural({ monument, rig }) {
  const object = useMemo(() => makeMonument(monument.model.builder, { surroundings: true }), [monument]);
  useEffect(() => () => object.traverse((o) => o.geometry?.dispose()), [object]);
  return <ConstructionRig object={object} {...rig} />;
}

function GLB({ monument, rig }) {
  const gltf = useGLTF(monument.model.path);
  const object = useMemo(() => normalize(gltf.scene.clone(true), monument.model.size), [gltf, monument]);
  return <ConstructionRig object={object} {...rig} />;
}

function OBJ({ monument, rig }) {
  const obj = useLoader(OBJLoader, monument.model.path);
  const object = useMemo(() => {
    const c = obj.clone(true);
    c.traverse((o) => {
      if (o.isMesh) o.material = new THREE.MeshStandardMaterial({ color: monument.model.color || '#e8dcc4', roughness: 0.7 });
    });
    return normalize(c, monument.model.size);
  }, [obj, monument]);
  return <ConstructionRig object={object} {...rig} />;
}

export default function MonumentModel({ monument, ...rig }) {
  const rigProps = { construction: monument.construction, explodeCfg: monument.explode, ...rig };
  switch (monument.model.type) {
    case 'glb': return <GLB monument={monument} rig={rigProps} />;
    case 'obj': return <OBJ monument={monument} rig={rigProps} />;
    default: return <Procedural monument={monument} rig={rigProps} />;
  }
}
