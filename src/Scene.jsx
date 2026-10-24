import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {makeHall,makeMonument,makePedestal,galleryPositions} from './models';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {galleryExhibits,monuments} from './data';

function applySceneTheme(lights,mode,light){
  const hall=mode==='hall';
  const background=light?(hall?'#ddd7ca':'#cfc9bc'):lights.background;
  // Toned down exposure in light mode for less brightness
  lights.renderer.toneMappingExposure=light?(hall?1.3:1.15):(hall?1.05:1.1);
  // The hall's image-based light is nearly off in dark mode; lift it in light mode so the room reads clearly brighter.
  if(hall)lights.scene.environmentIntensity=light?.45:.12;
  lights.scene.background.set(background);
  lights.fog.color.set(background);
  // Darker hemisphere colors in light mode
  lights.hemisphere.color.set(light?'#e8dcc8':(mode==='hall'?'#6f7f9c':'#d9c39a'));
  lights.hemisphere.groundColor.set(light?(hall?'#a09078':'#807060'):(mode==='hall'?'#1a120a':'#15131a'));
  lights.hemisphere.intensity=light?(hall?2.5:1.8):(hall?.55:1.5);
  // Slightly darker sun in light mode
  lights.sun.color.set(light?'#f5e8cc':(mode==='hall'?'#9fb2d4':'#ffd08f'));
  lights.sun.intensity=light?(hall?2.6:2.8):(hall?1.6:2.6);
  lights.fill.color.set(light?'#e8dcc8':(mode==='hall'?'#e0b878':'#8796b4'));
  lights.fill.intensity=light?(hall?1.8:1.5):(hall?.5:1.1);
  lights.candles.forEach(candle=>{candle.color.set(light?'#ffd89b':'#ffb35c');candle.intensity=light?(hall?40:32):22;});
  if(lights.floor)lights.floor.material.color.set(light?'#b8b0a0':'#15141a');
  if(lights.grid)(Array.isArray(lights.grid.material)?lights.grid.material:[lights.grid.material]).forEach(material=>material.color.set(light?'#807050':'#5a4a30'));
  lights.render?.();
}

export default function Scene({mode='hall',monument,onSelect,onHotspot,resetCount=0,activeHotspot,zoomRequest=0,theme='dark',t=(text)=>text}){
  const host=useRef(null),label=useRef(null),markers=useRef([]),callbacks=useRef({onSelect,onHotspot}),controlsRef=useRef(null),cameraRef=useRef(null),homeRef=useRef(null),zoomRef=useRef(null),lightingRef=useRef(null);
  const themeRef=useRef(theme);themeRef.current=theme;
  const [error,setError]=useState('');
  const id=monument?.id;
  useEffect(()=>{callbacks.current={onSelect,onHotspot};},[onSelect,onHotspot]);
  useEffect(()=>{zoomRef.current=null;controlsRef.current?.reset();},[resetCount]);
  useEffect(()=>{
    const controls=controlsRef.current,camera=cameraRef.current,home=homeRef.current;
    const hotspot=monument?.hotspots.find(item=>item.id===activeHotspot);
    if(!controls||!camera||!home||!hotspot)return;
    const target=new THREE.Vector3(...hotspot.position);
    const direction=home.position.clone().sub(home.target).normalize();
    const distance=Math.max(4.5,home.position.distanceTo(home.target)*.45);
    zoomRef.current={position:target.clone().addScaledVector(direction,distance),target};
    controls.dispatchEvent({type:'change'});
  },[activeHotspot,id,zoomRequest]);
  useEffect(()=>{
    const lights=lightingRef.current;
    if(!lights)return;
    applySceneTheme(lights,mode,theme==='light');
  },[theme,mode,id]);
  useEffect(()=>{
    const container=host.current;let renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});}catch{
      const failedFrame=requestAnimationFrame(()=>setError('3D could not start. Enable hardware acceleration in your browser, or use the monument index to read and learn.'));return()=>cancelAnimationFrame(failedFrame);
    }
    const background=theme==='light'?'#cfc9bc':(mode==='hall'?'#08070b':'#09080c');
    const scene=new THREE.Scene();scene.background=new THREE.Color(background);scene.fog=new THREE.Fog(background,mode==='hall'?22:30,mode==='hall'?48:70);
    cameraRef.current=null;homeRef.current=null;zoomRef.current=null;
    const camera=new THREE.PerspectiveCamera(48,1,.1,140);
    cameraRef.current=camera;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.25));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=mode==='hall'?1.05:1.1;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label',mode==='hall'?'Interactive museum. Drag to look around, use WASD or the arrow keys to walk, and select an interactive miniature.':'Interactive monument. Drag to rotate, scroll to zoom, or select a numbered hotspot.');
    container.appendChild(canvas);
    const controls=new OrbitControls(camera,canvas);controlsRef.current=controls;controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=Math.PI*.47;
    let selectable=[],environmentTarget,hemisphere,sun,fill,candles=[],floor,grid,disposed=false,animation=0;
    if(mode==='hall'){
      hemisphere=new THREE.HemisphereLight('#6f7f9c','#1a120a',.55);scene.add(hemisphere);
      sun=new THREE.DirectionalLight('#9fb2d4',1.6);sun.position.set(18,14,5);sun.target.position.set(-5,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:.1,far:70});sun.shadow.bias=-.00012;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
      fill=new THREE.DirectionalLight('#e0b878',.5);fill.position.set(-7,6,13);scene.add(fill);
      galleryExhibits.forEach((_,i)=>{const [x,,z]=galleryPositions[i];const candle=new THREE.PointLight('#ffb35c',22,9,1.6);candle.position.set(x+.6,4.2,z+1.4);scene.add(candle);candles.push(candle);});
      const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environmentTarget=pmrem.fromScene(room,.04);scene.environment=environmentTarget.texture;scene.environmentIntensity=.12;room.dispose();pmrem.dispose();
      scene.add(makeHall());
      galleryExhibits.forEach((m,i)=>{
        const interactive=monuments.some(item=>item.id===m.id),p=makePedestal(m.id,i,t(m.name),interactive);
        p.position.set(...galleryPositions[i]);scene.add(p);selectable.push(p);
        if(m.id==='jantar-mantar'){
          new GLTFLoader().load('/models/jantar-mantar.glb',(gltf)=>{
            if(disposed)return;
            const model=gltf.scene;
            const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
            model.scale.multiplyScalar(14/Math.max(size.x,size.y,size.z,1e-6));
            model.updateMatrixWorld(true);
            bounds.setFromObject(model);
            model.position.x-=(bounds.min.x+bounds.max.x)/2;
            model.position.z-=(bounds.min.z+bounds.max.z)/2;
            model.position.y-=bounds.min.y;
            model.scale.multiplyScalar(.3);
            model.position.y+=1.25;
            model.traverse((part)=>{if(part.isMesh){part.castShadow=true;part.receiveShadow=true;}});
            p.add(model);
            scheduleRender();
          },undefined,(loadError)=>{
            if(!disposed)setError(`Could not load the Jantar Mantar gallery model: ${loadError.message}`);
          });
        }
      });
      controls.target.set(0,1.8,-1);controls.minDistance=11;controls.maxDistance=22;controls.enablePan=false;controls.minPolarAngle=Math.PI*.38;controls.maxPolarAngle=Math.PI*.493;controls.minAzimuthAngle=-.37;controls.maxAzimuthAngle=.37;
    }else{
      hemisphere=new THREE.HemisphereLight('#d9c39a','#15131a',1.5);scene.add(hemisphere);
      sun=new THREE.DirectionalLight('#ffd08f',2.6);sun.position.set(8,16,9);sun.castShadow=true;sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20});scene.add(sun);
      fill=new THREE.DirectionalLight('#8796b4',1.1);fill.position.set(-10,7,-6);scene.add(fill);
      floor=new THREE.Mesh(new THREE.CircleGeometry(24,80),new THREE.MeshStandardMaterial({color:'#15141a',roughness:.85}));floor.rotation.x=-Math.PI/2;floor.position.y=-.01;floor.receiveShadow=true;scene.add(floor);
      const model=makeMonument(id);scene.add(model);selectable=[model];controls.target.set(0,2,id==='taj'?2:0);controls.minDistance=7;controls.maxDistance=38;
      grid=new THREE.GridHelper(42,28,'#5a4a30','#24222a');grid.position.y=.01;scene.add(grid);
    }
    lightingRef.current={scene,fog:scene.fog,background,renderer,hemisphere,sun,fill,candles,floor,grid};
    applySceneTheme(lightingRef.current,mode,themeRef.current==='light');
    let firstResize=true;
    const v=new THREE.Vector3();
    function scheduleRender(){if(!animation&&!disposed)animation=requestAnimationFrame(renderFrame);}
    // --- Hall walking: WASD / arrow keys move the camera rig (camera + orbit target together) across the floor.
    // Drag-to-look (OrbitControls) is untouched; the rig is clamped to the hall and eased with exponential damping.
    const walkKeys=new Set(),walkVelocity=new THREE.Vector3(),walkForward=new THREE.Vector3(),walkRight=new THREE.Vector3(),walkDelta=new THREE.Vector3(),walkBefore=new THREE.Vector3();
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const WALK_SPEED=4.6,HALL_X=8.6,HALL_Z_MIN=-15.3,HALL_Z_MAX=16.5,PEDESTAL_CLEARANCE=3.1;
    const walkMap={arrowup:'f',w:'f',arrowdown:'b',s:'b',arrowleft:'l',a:'l',arrowright:'r',d:'r'};
    let lastFrame=0;
    function walkStep(dt){
      if(mode!=='hall')return false;
      const f=(walkKeys.has('f')?1:0)-(walkKeys.has('b')?1:0),side=(walkKeys.has('r')?1:0)-(walkKeys.has('l')?1:0);
      walkForward.set(controls.target.x-camera.position.x,0,controls.target.z-camera.position.z);
      if(walkForward.lengthSq()<1e-6)walkForward.set(0,0,-1);else walkForward.normalize();
      walkRight.set(-walkForward.z,0,walkForward.x);
      walkDelta.set(0,0,0).addScaledVector(walkForward,f).addScaledVector(walkRight,side);
      if(walkDelta.lengthSq()>1)walkDelta.normalize();
      walkDelta.multiplyScalar(WALK_SPEED);
      const ease=reduceMotion.matches?1:1-Math.exp(-dt*9);
      walkVelocity.lerp(walkDelta,ease);
      if(!f&&!side&&walkVelocity.lengthSq()<.0004){walkVelocity.set(0,0,0);return false;}
      walkBefore.copy(camera.position);
      camera.position.addScaledVector(walkVelocity,dt);
      camera.position.x=THREE.MathUtils.clamp(camera.position.x,-HALL_X,HALL_X);
      camera.position.z=THREE.MathUtils.clamp(camera.position.z,HALL_Z_MIN,HALL_Z_MAX);
      // Keep the walker out of the monument plinths.
      galleryExhibits.forEach((_,i)=>{
        const [px,,pz]=galleryPositions[i];
        const dx=camera.position.x-px,dz=camera.position.z-pz,d=Math.hypot(dx,dz);
        if(d<PEDESTAL_CLEARANCE){const k=d>1e-4?PEDESTAL_CLEARANCE/d:1;camera.position.x=d>1e-4?px+dx*k:px+PEDESTAL_CLEARANCE;camera.position.z=d>1e-4?pz+dz*k:pz;}
      });
      // The orbit target travels by exactly the distance the camera actually moved, so the view direction is preserved.
      controls.target.x+=camera.position.x-walkBefore.x;controls.target.z+=camera.position.z-walkBefore.z;
      return true;
    }
    function renderFrame(now=performance.now()){
      animation=0;if(disposed)return;
      const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):1/60;lastFrame=now;
      const walking=walkStep(dt);
      if(walking)scheduleRender();else lastFrame=0;
      controls.update();
      const zoom=zoomRef.current;
      if(zoom){
        camera.position.lerp(zoom.position,.16);controls.target.lerp(zoom.target,.16);
        if(camera.position.distanceToSquared(zoom.position)<.0025&&controls.target.distanceToSquared(zoom.target)<.0025)zoomRef.current=null;
        else scheduleRender();
        controls.update();
      }
      if(mode!=='hall')monument.hotspots.forEach((hotspot,i)=>{
        const button=markers.current[i];if(!button)return;
        v.set(...hotspot.position).project(camera);
        button.style.left=((v.x+1)/2*container.clientWidth)+'px';
        button.style.top=((-v.y+1)/2*container.clientHeight)+'px';
        const visible=v.z>-1&&v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.9;
        button.style.visibility=visible?'visible':'hidden';
      });
      renderer.render(scene,camera);
    }
    lightingRef.current.render=scheduleRender;
    controls.addEventListener('change',scheduleRender);
    const resize=()=>{
      const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
      if(firstResize){if(mode==='hall'){camera.fov=w/h<1?70:58;camera.position.set(0,6.8,w/h<1?26:17);camera.updateProjectionMatrix();}else{camera.position.set(13,9,w/h<1?26:17);}controls.update();controls.saveState();homeRef.current={position:camera.position.clone(),target:controls.target.clone()};firstResize=false;}
      scheduleRender();
    };
    const observer=new ResizeObserver(resize);observer.observe(container);resize();
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
    function target(event){
      const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
      const hits=raycaster.intersectObjects(selectable,true);
      for(const hit of hits){let obj=hit.object;while(obj){if(mode==='hall'&&obj.userData.monument)return {type:'monument',id:obj.userData.monument};if(mode!=='hall'&&obj.userData.hotspot)return {type:'hotspot',id:obj.userData.hotspot};obj=obj.parent;}}
      return null;
    }
    const pointerdown=e=>{down={x:e.clientX,y:e.clientY};};
    const pointerup=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;const hit=target(e);if(hit?.type==='monument')callbacks.current.onSelect?.(hit.id);if(hit?.type==='hotspot')callbacks.current.onHotspot?.(hit.id);};
    const names=Object.fromEntries(galleryExhibits.map(m=>[m.id,t(m.name)]));
    const pointermove=e=>{const hit=target(e);canvas.style.cursor=hit?'pointer':'grab';const tag=label.current;if(!tag)return;
      if(!hit||e.pointerType!=='mouse'){tag.classList.remove('show');return;}
      const rect=container.getBoundingClientRect();tag.textContent=hit.type==='monument'?names[hit.id]+' — open timeline':(monument?.hotspots.find(h=>h.id===hit.id)?.title||'');
      tag.style.transform=`translate(${e.clientX-rect.left+22}px,${e.clientY-rect.top+18}px)`;tag.classList.add('show');};
    const pointerleave=()=>label.current?.classList.remove('show');
    const keydown=e=>{if(e.key.toLowerCase()==='r')controls.reset();};
    const typing=el=>el instanceof Element&&(el.closest('input,textarea,select,[contenteditable="true"]')!==null);
    const walkDown=e=>{
      if(mode!=='hall'||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)||document.querySelector('dialog[open]'))return;
      const dir=walkMap[e.key.toLowerCase()];if(!dir)return;
      e.preventDefault();walkKeys.add(dir);scheduleRender();
    };
    const walkUp=e=>{const dir=walkMap[e.key.toLowerCase()];if(dir){walkKeys.delete(dir);scheduleRender();}};
    const walkStop=()=>walkKeys.clear();
    window.addEventListener('keydown',walkDown);window.addEventListener('keyup',walkUp);window.addEventListener('blur',walkStop);
    const contextlost=e=>{e.preventDefault();setError('The browser lost the 3D connection. Refresh this page to restore the scene. Your saved progress remains available.');};
    canvas.addEventListener('pointerdown',pointerdown);canvas.addEventListener('pointerup',pointerup);canvas.addEventListener('pointermove',pointermove);canvas.addEventListener('pointerleave',pointerleave);canvas.addEventListener('keydown',keydown);canvas.addEventListener('webglcontextlost',contextlost);
    scheduleRender();
    return ()=>{
      disposed=true;cancelAnimationFrame(animation);observer.disconnect();controls.removeEventListener('change',scheduleRender);controls.dispose();controlsRef.current=null;
      if(cameraRef.current===camera)cameraRef.current=null;
      homeRef.current=null;zoomRef.current=null;lightingRef.current=null;
      canvas.removeEventListener('pointerdown',pointerdown);canvas.removeEventListener('pointerup',pointerup);canvas.removeEventListener('pointermove',pointermove);canvas.removeEventListener('pointerleave',pointerleave);canvas.removeEventListener('keydown',keydown);canvas.removeEventListener('webglcontextlost',contextlost);
      window.removeEventListener('keydown',walkDown);window.removeEventListener('keyup',walkUp);window.removeEventListener('blur',walkStop);
      const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>{materials.add(m);if(m.map)textures.add(m.map);});});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environmentTarget?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    };
  },[mode,id,monument]);
  return <div className={'scene '+mode}>
    <div className="canvas-host" ref={host}/>
    <div className="scene-label" ref={label} aria-hidden="true"/>
    {!error&&mode!=='hall'&&<div className="scene-hint">Drag to rotate · Scroll / pinch to zoom</div>}
    {!error&&mode!=='hall'&&monument.hotspots.map((h,i)=><button key={h.id} ref={el=>markers.current[i]=el} className={'hotspot '+(h.id===activeHotspot?'active':'')} onClick={()=>onHotspot(h.id)} title={h.title} aria-label={h.title}>{i+1}</button>)}
    {error&&<div className="scene-error" role="status">{error}</div>}
  </div>;
}
