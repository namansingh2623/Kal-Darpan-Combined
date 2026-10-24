import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import MonumentModel from './MonumentModel';
import POIMarkers from './POIMarkers';
import CameraRig from './CameraRig';
import FreeCameraControls from './FreeCameraControls';
import ResponsiveFraming from './ResponsiveFraming';
import useViewerTheme from './useViewerTheme';

// Scene colours per site theme (mirrors the museum hall's dark / light lighting).
const PALETTES = {
  dark: {
    bg: '#080609', sky: '#fff0db', ground: '#24150f', hemi: 1.5, sun: 3, sunColor: '#ffe2b0',
    fill: 1.2, fillColor: '#d18a55', point: 60, floor: '#10090b', grid: ['#563823', '#291812'], ring: '#c9a86a', ringOpacity: 0.4,
  },
  light: {
    bg: '#cfc9bc', sky: '#fff2d6', ground: '#8b806d', hemi: 2.1, sun: 3.4, sunColor: '#fff1d5',
    fill: 1.0, fillColor: '#fff0d5', point: 38, floor: '#c9c0ae', grid: ['#8e7e62', '#b3a78f'], ring: '#8b6b3c', ringOpacity: 0.5,
  },
};

const SEASON_PALETTES = {
  sunset: {
    bg: '#30202d', skyTop: '#3b315a', skyMid: '#a65f83', skyHorizon: '#f0aa84',
    ground: '#302019', hemi: 1.15, sun: 2.4, sunColor: '#ffd2a0',
    fill: 1.1, fillColor: '#e58ba0', point: 42, floor: '#21151d', grid: ['#74435b', '#3c2935'],
    cloudTop: '#fff0df', cloudBody: '#e9b5a5', cloudLight: '#fff7e8', cloudGlow: '#ffbd9b',
    monumentTint: '#e8a078', tintStrength: 0.34,
  },
  sunrise: {
    bg: '#3c3344', skyTop: '#647f9f', skyMid: '#e8ad9c', skyHorizon: '#ffe2b0',
    ground: '#30231d', hemi: 1.55, sun: 2.8, sunColor: '#fff0c4',
    fill: 1.2, fillColor: '#f0b48b', point: 48, floor: '#271c1c', grid: ['#8a6651', '#49352d'],
    cloudTop: '#fff7e9', cloudBody: '#f1c8b1', cloudLight: '#fffdf1', cloudGlow: '#ffe0b0',
    monumentTint: '#f2c28e', tintStrength: 0.3,
  },
  cloudy: {
    bg: '#202a36', skyTop: '#66788c', skyMid: '#aab6c1', skyHorizon: '#d4d2cc',
    ground: '#2b2928', hemi: 1.65, sun: 1.8, sunColor: '#e5e2d9',
    fill: 1.0, fillColor: '#bdc8d4', point: 36, floor: '#191e24', grid: ['#59616b', '#343a41'],
    cloudTop: '#f4f4f0', cloudBody: '#d3d9df', cloudLight: '#fffefa', cloudGlow: '#c0cbd5',
    monumentTint: '#9cadbd', tintStrength: 0.32,
  },
  rain: {
    bg: '#111b2b', skyTop: '#26364c', skyMid: '#52677a', skyHorizon: '#82919a',
    ground: '#20252b', hemi: 1.25, sun: 1.25, sunColor: '#b7c8d4',
    fill: 0.8, fillColor: '#8ca8bf', point: 28, floor: '#111820', grid: ['#3a5264', '#25323d'],
    cloudTop: '#aebdca', cloudBody: '#8296a7', cloudLight: '#cad5dc', cloudGlow: '#70869a',
    monumentTint: '#829bb0', tintStrength: 0.38,
  },
  night: {
    bg: '#080d1b', skyTop: '#080d24', skyMid: '#172640', skyHorizon: '#35445b',
    ground: '#191c25', hemi: 0.55, sun: 0.55, sunColor: '#a7c8f3',
    fill: 0.8, fillColor: '#617ca9', point: 18, floor: '#0d101b', grid: ['#293a55', '#192438'],
    cloudTop: '#9cabc2', cloudBody: '#60728d', cloudLight: '#c4d0df', cloudGlow: '#6f83a5',
    monumentTint: '#7186ad', tintStrength: 0.42,
  },
};

function WeatherSky({ palette, weather }) {
  const moonRef = useRef(null);
  const sunRef = useRef(null);
  const starsRef = useRef(null);
  const cloudMotionRef = useRef(null);
  const rainRef = useRef(null);
  const motionClock = useRef(0);
  const celestial = useMemo(() => ({
    direction: new THREE.Vector3(),
    up: new THREE.Vector3(),
    right: new THREE.Vector3(),
    base: new THREE.Vector3(),
  }), []);
  const cloudMaterial = useMemo(() => ({
    top: new THREE.MeshBasicMaterial({ color: palette.cloudTop, transparent: true, opacity: 0.94, depthWrite: false, fog: false }),
    body: new THREE.MeshBasicMaterial({ color: palette.cloudBody, transparent: true, opacity: 0.91, depthWrite: false, fog: false }),
    light: new THREE.MeshBasicMaterial({ color: palette.cloudLight, transparent: true, opacity: 0.92, depthWrite: false, fog: false }),
    glow: new THREE.MeshBasicMaterial({ color: palette.cloudGlow, transparent: true, opacity: 0.8, depthWrite: false, fog: false }),
  }), [palette]);
  const cloudGeometry = useMemo(() => new THREE.SphereGeometry(1, 14, 10), []);
  const sunMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: palette.sunColor, fog: false }), [palette.sunColor]);
  const isNight = weather === 'night';
  const moonTexture = useMemo(() => {
    if (!isNight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create the moon texture canvas context.');
    const base = context.createLinearGradient(0, 0, 0, canvas.height);
    base.addColorStop(0, '#cbd7e5');
    base.addColorStop(0.5, '#e4eaf1');
    base.addColorStop(1, '#b7c5d5');
    context.fillStyle = base;
    context.fillRect(0, 0, canvas.width, canvas.height);
    let seed = 43;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 125; i++) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const radius = 2 + random() * 15;
      const shade = Math.floor(82 + random() * 62);
      const crater = context.createRadialGradient(x - radius * 0.25, y - radius * 0.25, radius * 0.12, x, y, radius);
      crater.addColorStop(0, `rgba(${shade}, ${shade + 8}, ${shade + 18}, .26)`);
      crater.addColorStop(0.72, 'rgba(112, 132, 154, .18)');
      crater.addColorStop(1, 'rgba(247, 250, 255, .46)');
      context.fillStyle = crater;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [isNight]);
  const stars = useMemo(() => {
    const positions = new Float32Array(1600 * 3);
    let seed = 127;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (random() - 0.5) * 76;
      positions[i + 1] = -12 + random() * 30;
      positions[i + 2] = 0;
    }
    return positions;
  }, []);
  const haloMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: isNight ? '#9bc7ff' : weather === 'sunset' ? '#ff83ab' : '#ffba8e',
    transparent: true,
    opacity: isNight ? 0.2 : 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  }), [isNight, weather]);
  useFrame((state, delta) => {
    const { camera } = state;
    const step = Math.min(delta, 0.05);
    motionClock.current += step;
    camera.getWorldDirection(celestial.direction);
    celestial.up.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    celestial.right.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    celestial.base.copy(camera.position).addScaledVector(celestial.direction, 65);
    if (cloudMotionRef.current) {
      cloudMotionRef.current.position.x = Math.sin(motionClock.current * 0.28) * 5;
    }
    if (rainRef.current) {
      const attribute = rainRef.current.geometry.getAttribute('position');
      const positions = attribute.array;
      for (let i = 0, drop = 0; i < positions.length; i += 6, drop++) {
        positions[i + 1] -= step * 22;
        positions[i + 4] -= step * 22;
        if (positions[i + 4] <= 0.06) {
          const top = 13 + (drop * 17 % 12);
          positions[i + 1] = top;
          positions[i + 4] = top - 0.85;
        }
      }
      attribute.needsUpdate = true;
    }
    if (starsRef.current) {
      starsRef.current.position.copy(celestial.base).addScaledVector(celestial.up, 12);
      starsRef.current.quaternion.copy(camera.quaternion);
    }
    if (moonRef.current) {
      moonRef.current.position.copy(celestial.base)
        .addScaledVector(celestial.up, 18);
    }
    if (sunRef.current) {
      const direction = weather === 'sunset' ? -1 : 1;
      sunRef.current.position.copy(celestial.base)
        .addScaledVector(celestial.up, 17)
        .addScaledVector(celestial.right, direction * 9);
    }
    state.invalidate();
  });
  const starMaterial = useMemo(() => new THREE.PointsMaterial({
    color: '#dceaff',
    size: 1.2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false,
  }), []);
  const isRaining = weather === 'rain';
  const clouds = useMemo(() => {
    const layers = { top: [], body: [], light: [], glow: [] };
    const count = isNight ? 5 : isRaining ? 11 : 9;
    for (let i = 0; i < count; i++) {
      const x = isNight ? [-25, -16, -8, 18, 27][i] : ((i / (count - 1)) - 0.5) * 40;
      const z = isRaining ? -16 + Math.sin(i * 1.7) * 4 : isNight ? -20 + Math.sin(i * 1.7) * 2 : -22 + Math.sin(i * 1.7) * 5;
      const width = 3.5 + (i % 4) * 0.35;
      const y = isNight ? 4.25 + (i % 2) * 0.35 : 6 + (i % 3) * 0.65;
      for (let puff = 0; puff < 7; puff++) {
        const u = puff - 3;
        const size = (0.9 + ((i + puff * 3) % 4) * 0.22) * (isNight ? 0.72 : 1);
        const xOffset = u * width * 0.23;
        const zOffset = Math.sin(puff * 2.1 + i) * 0.75;
        const highlightLayer = puff % 3 === 0 ? 'light' : puff % 3 === 1 ? 'body' : 'top';
        layers[highlightLayer].push({
          position: [x + xOffset, y + Math.cos(puff * 1.7 + i) * 0.42, z + zOffset],
          scale: [size * 1.3, size * 0.68, size * 0.8],
        });
        layers[isRaining ? 'top' : 'glow'].push({
          position: [x + xOffset * 0.78, y - 0.52 - (puff % 2) * 0.14, z + zOffset + 0.1],
          scale: [size * 1.25, size * 0.42, size * 0.72],
        });
      }
    }
    return layers;
  }, [isNight, isRaining]);
  const rainGeometry = useMemo(() => {
    if (!isRaining) return null;
    const positions = [];
    let seed = 311;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 220; i++) {
      const x = (random() - 0.5) * 54;
      const y = 1 + random() * 20;
      const z = -20 + random() * 38;
      positions.push(x, y, z, x - 0.16, y - 0.75, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [isRaining]);
  const cloudRefs = useRef({});
  useLayoutEffect(() => {
    const puff = new THREE.Object3D();
    Object.entries(clouds).forEach(([layer, instances]) => {
      const mesh = cloudRefs.current[layer];
      if (!mesh) return;
      instances.forEach((instance, index) => {
        puff.position.fromArray(instance.position);
        puff.scale.fromArray(instance.scale);
        puff.updateMatrix();
        mesh.setMatrixAt(index, puff.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [clouds]);
  useEffect(() => () => {
    cloudGeometry.dispose();
    Object.values(cloudMaterial).forEach((material) => material.dispose());
    sunMaterial.dispose();
    haloMaterial.dispose();
    starMaterial.dispose();
    moonTexture?.dispose();
    rainGeometry?.dispose();
  }, [cloudGeometry, cloudMaterial, sunMaterial, haloMaterial, starMaterial, moonTexture, rainGeometry]);

  return (
    <>
      <mesh scale={100} renderOrder={-100}>
        <sphereGeometry args={[1, 32, 20]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
          uniforms={{
            skyTop: { value: new THREE.Color(palette.skyTop) },
            skyMid: { value: new THREE.Color(palette.skyMid) },
            skyHorizon: { value: new THREE.Color(palette.skyHorizon) },
          }}
          vertexShader="varying float skyHeight; void main(){ skyHeight=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }"
          fragmentShader="uniform vec3 skyTop; uniform vec3 skyMid; uniform vec3 skyHorizon; varying float skyHeight; void main(){ float h=clamp(skyHeight*.5+.5,0.0,1.0); vec3 low=mix(skyHorizon,skyMid,smoothstep(.02,.55,h)); vec3 col=mix(low,skyTop,smoothstep(.48,1.0,h)); gl_FragColor=vec4(col,1.0); }"
        />
      </mesh>
      <group ref={cloudMotionRef}>
        {Object.entries(clouds).map(([layer, instances]) => (
          <instancedMesh
            key={layer}
            ref={(mesh) => { cloudRefs.current[layer] = mesh; }}
            args={[cloudGeometry, cloudMaterial[layer], instances.length]}
            count={instances.length}
            frustumCulled={false}
            renderOrder={-5}
          />
        ))}
      </group>
      {rainGeometry && (
        <lineSegments ref={rainRef} geometry={rainGeometry} renderOrder={-3} frustumCulled={false}>
          <lineBasicMaterial color="#d5eaff" transparent opacity={0.7} depthWrite={false} depthTest />
        </lineSegments>
      )}
      {isNight && (
        <>
          <points ref={starsRef} renderOrder={-4} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[stars, 3]} />
            </bufferGeometry>
            <primitive object={starMaterial} attach="material" />
          </points>
          <group ref={moonRef}>
            <mesh geometry={cloudGeometry} material={haloMaterial} scale={[5, 5, 0.7]} renderOrder={-2} />
            <mesh renderOrder={-1}>
              <sphereGeometry args={[1.8, 32, 24]} />
              <meshBasicMaterial map={moonTexture} color="#e1ecfa" fog={false} />
            </mesh>
            <pointLight color="#a9c9f5" intensity={48} distance={78} decay={2} />
          </group>
        </>
      )}
      {!isRaining && weather !== 'cloudy' && !isNight && (
        <group ref={sunRef}>
          <mesh geometry={cloudGeometry} material={haloMaterial} scale={[4.1, 4.1, 0.7]} renderOrder={-2} />
          <mesh geometry={cloudGeometry} material={sunMaterial} scale={[1.75, 1.75, 1.1]} renderOrder={-1} />
          <pointLight color={palette.sunColor} intensity={weather === 'sunset' ? 80 : 58} distance={64} decay={2} />
        </group>
      )}
    </>
  );
}

function ResetCameraForStandardMode({ cameraMode, cameraResetKey, position, target }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  const previousMode = useRef(cameraMode);
  useLayoutEffect(() => {
    const enteredStandardMode = cameraMode !== 'free' && previousMode.current !== cameraMode;
    if (!enteredStandardMode) {
      previousMode.current = cameraMode;
      return;
    }
    if (!controls) return;
    camera.position.set(...position);
    controls.target.set(...target);
    controls.update();
    previousMode.current = cameraMode;
  }, [cameraMode, cameraResetKey, camera, controls, position, target]);
  return null;
}

function SeasonTint({ season, modelRef }) {
  const seasonPalette = season ? SEASON_PALETTES[season] : null;
  useLayoutEffect(() => {
    const tint = seasonPalette?.monumentTint;
    const strength = seasonPalette?.tintStrength ?? 0;
    modelRef.current?.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!material.color) return;
        material.userData.seasonBaseColor ??= material.color.clone();
        material.userData.seasonBaseEmissive ??= material.emissive?.clone();
        material.userData.seasonBaseEmissiveIntensity ??= material.emissiveIntensity;
        material.color.copy(material.userData.seasonBaseColor);
        if (tint) {
          const seasonColor = new THREE.Color(tint);
          material.color.lerp(seasonColor, strength);
          if (material.emissive) {
            material.emissive.copy(seasonColor).multiplyScalar(strength * 0.11);
            material.emissiveIntensity = 1;
          }
        } else if (material.emissive && material.userData.seasonBaseEmissive) {
          material.emissive.copy(material.userData.seasonBaseEmissive);
          material.emissiveIntensity = material.userData.seasonBaseEmissiveIntensity;
        }
        material.needsUpdate = true;
      });
    });
  }, [season, modelRef, seasonPalette]);
  return null;
}

export default function MonumentCanvas({
  monument, store, explode, cameraMode, cameraGoal, cameraResetKey = 0, shared, activePoiId,
  onSelectPoi, onBackgroundClick, pois, insets = { top: 0, bottom: 0 }, compact = false, season = null, t = (text) => text,
}) {
  const cam = monument.camera;
  const theme = useViewerTheme();
  const seasonPalette = season ? SEASON_PALETTES[season] : null;
  const palette = useMemo(() => {
    const base = PALETTES[theme];
    if (!seasonPalette) return base;
    return {
      ...base,
      ...seasonPalette,
      ring: base.ring,
      ringOpacity: base.ringOpacity,
    };
  }, [theme, seasonPalette]);
  const modelRef = useRef(null);
  const shadowSize = compact ? 1024 : 2048;
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, compact ? 1.5 : 2]}
      camera={{ fov: 42, near: 0.4, far: 220, position: cam.position }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={onBackgroundClick}
    >
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 50, 120]} />

      <hemisphereLight args={[palette.sky, palette.ground, palette.hemi]} />
      <directionalLight position={[10, 18, 10]} intensity={palette.sun} color={palette.sunColor} castShadow shadow-mapSize={[shadowSize, shadowSize]} shadow-bias={-0.0004} shadow-normalBias={0.04}>
        <orthographicCamera attach="shadow-camera" args={[-24, 24, 24, -24, 0.5, 70]} />
      </directionalLight>
      <directionalLight position={[-12, 8, -8]} intensity={palette.fill} color={palette.fillColor} />
      <pointLight position={[0, 9, 0]} intensity={palette.point} distance={40} color={palette.sunColor} />

      <Suspense fallback={null}>
        <group ref={modelRef}>
          <MonumentModel monument={monument} store={store} explode={explode} shared={shared} />
        </group>
        <SeasonTint season={season} modelRef={modelRef} />
      </Suspense>
      {season && <WeatherSky palette={palette} weather={season} />}
      <POIMarkers pois={pois || monument.pois} explodeCfg={monument.explode} shared={shared} activeId={activePoiId} onSelect={onSelectPoi} t={t} />

      {/* Museum floor: dark disc, faint grid, gold ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <circleGeometry args={[34, 64]} />
        <meshStandardMaterial color={palette.floor} roughness={0.85} metalness={0.2} />
      </mesh>
      <gridHelper args={[60, 60, palette.grid[0], palette.grid[1]]} position={[0, -0.02, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[19.8, 20, 96]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={palette.ringOpacity} />
      </mesh>

      <OrbitControls
        makeDefault
        enabled={cameraMode !== 'free'}
        enableDamping
        dampingFactor={0.07}
        target={cam.target}
        autoRotate={cameraMode === 'turntable'}
        autoRotateSpeed={1.2}
        enablePan={false}
        minDistance={cam.minDistance}
        maxDistance={cam.maxDistance}
        maxPolarAngle={Math.PI * 0.495}
      />
      <ResetCameraForStandardMode cameraMode={cameraMode} cameraResetKey={cameraResetKey} position={cam.position} target={cam.target} />
      {cameraMode === 'free'
        ? <FreeCameraControls goal={cameraGoal} />
        : <CameraRig key={cameraResetKey} goal={cameraGoal} />}
      <ResponsiveFraming top={insets.top} bottom={insets.bottom} />
    </Canvas>
  );
}