import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
function mesh(group,geometry,material,x=0,y=0,z=0,hotspot){
  const part=new THREE.Mesh(geometry,material); part.position.set(x,y,z); const thin=!!geometry.parameters&&geometry.parameters.height!==undefined&&geometry.parameters.height<.12;part.castShadow=!thin;part.receiveShadow=true;if(thin)part.userData.noShadow=true;
  if(hotspot) part.userData.hotspot=hotspot;
  group.add(part); return part;
}
function box(g,m,w,h,d,x,y,z,id){return mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z,id);}
function cylinder(g,m,top,bottom,h,x,y,z,id,segments=32){return mesh(g,new THREE.CylinderGeometry(top,bottom,h,segments),m,x,y,z,id);}
function dome(g,m,r,x,y,z,id){
  const profile=[[0,0],[.8*r,0],[r,.35*r],[.94*r,.65*r],[.65*r,1.05*r],[.25*r,1.35*r],[0,1.55*r]].map(([a,b])=>new THREE.Vector2(a,b));
  return mesh(g,new THREE.LatheGeometry(profile,32),m,x,y,z,id);
}
function arch(g,m,width,height,x,y,z){
  const s=new THREE.Shape();s.moveTo(-width/2,0);s.lineTo(-width/2,height*.58);s.quadraticCurveTo(-width/2,height*.84,0,height);s.quadraticCurveTo(width/2,height*.84,width/2,height*.58);s.lineTo(width/2,0);s.closePath();
  const a=mesh(g,new THREE.ShapeGeometry(s),m,x,y,z);a.castShadow=false;a.userData.noShadow=true;return a;
}
// Merge many small identical parts (flutes, battlements) into ONE mesh: far fewer draw calls.
function merged(group,material,geometries,hotspot){
  const geo=mergeGeometries(geometries);geometries.forEach(x=>x.dispose());
  geo.computeBoundingBox();const c=geo.boundingBox.getCenter(new THREE.Vector3());
  geo.translate(-c.x,-c.y,-c.z);
  return mesh(group,geo,material,c.x,c.y,c.z,hotspot);
}
// A slanted rib (flute) between two heights on a tapering tower. `segs` 3 = angular, 8 = rounded.
function rib(rBot,rTop,y0,y1,angle,thick,segs){
  const bx=Math.sin(angle)*rBot,bz=Math.cos(angle)*rBot,tx=Math.sin(angle)*rTop,tz=Math.cos(angle)*rTop;
  const dir=new THREE.Vector3(tx-bx,y1-y0,tz-bz),len=dir.length();dir.normalize();
  const geo=new THREE.CylinderGeometry(thick*.8,thick,len,segs);
  geo.rotateY(angle);
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir));
  geo.translate((bx+tx)/2,(y0+y1)/2,(bz+tz)/2);
  return geo;
}
export function makeMonument(id,{surroundings=false}={}){
  const g=new THREE.Group();
  const marble=mat('#eee4cb'),gold=mat('#c9a45c',{metalness:.5}),stone=mat('#963e29'),dark=mat('#463d32',{side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),grass=mat('#3c6546'),water=mat('#337f86',{metalness:.4,roughness:.2});
  if(id==='taj'){
    // Orientation: +z is south, toward the great gate; -z is the river side.
    box(g,grass,10,.15,14,0,.075,3,'garden');
    box(g,marble,9,.4,9,0,.3,0);
    {
      const S=2.7,C=.75,sh=new THREE.Shape();
      sh.moveTo(-S+C,-S);sh.lineTo(S-C,-S);sh.lineTo(S,-S+C);sh.lineTo(S,S-C);sh.lineTo(S-C,S);sh.lineTo(-S+C,S);sh.lineTo(-S,S-C);sh.lineTo(-S,-S+C);sh.closePath();
      const bodyGeo=new THREE.ExtrudeGeometry(sh,{depth:2.5,bevelEnabled:false});bodyGeo.rotateX(-Math.PI/2);
      mesh(g,bodyGeo,marble,0,.5,0);
      const onFace=(nx,nz,off,u,w,h,y)=>{const a=arch(g,dark,w,h,nx*off+nz*u,y,nz*off-nx*u);a.rotation.y=Math.atan2(nx,nz);return a;};
      for(const [nx,nz] of [[0,1],[1,0],[0,-1],[-1,0]]){
        onFace(nx,nz,S+.011,0,1.3,2.15,.5);
        for(const u of [-1.4,1.4])for(const y of [.55,1.5])onFace(nx,nz,S+.011,u,.62,.85,y);
      }
      for(const sx of [-1,1])for(const sz of [-1,1]){
        const c=S-C/2,o=Math.SQRT1_2*.011;
        for(const y of [.55,1.5]){const a=arch(g,dark,.55,.85,sx*c+sx*o,y,sz*c+sz*o);a.rotation.y=Math.atan2(sx,sz);}
      }
    }
    cylinder(g,marble,1,1,.8,0,3.4,0,'dome');dome(g,marble,1,0,3.8,0,'dome');
    cylinder(g,gold,0,.08,1,0,5.8,0,'dome');
    for(const x of [-3.7,3.7])for(const z of [-3.7,3.7]){
      cylinder(g,marble,.17,.26,3.65,x,2.3,z,'minaret');
      for(const y of [1.4,2.6,4.05])cylinder(g,marble,.33,.33,.12,x,y,z,'minaret');
      dome(g,marble,.29,x,4.14,z,'minaret');
    }
    for(const x of [-1.9,1.9])for(const z of [-1.9,1.9]){
      cylinder(g,marble,.44,.44,.5,x,3.25,z);dome(g,marble,.51,x,3.5,z,'dome');
    }
    box(g,water,.55,.03,5.8,0,.17,7.4,'garden');
    box(g,water,9,.03,.5,0,.17,7.4,'garden');
    box(g,marble,1.3,.14,1.3,0,.22,7.4,'garden');box(g,water,1,.03,1,0,.3,7.4,'garden');
    for(const x of [-4.4,4.4]){
      box(g,marble,.8,.12,.8,x,.2,7.4,'garden');
      cylinder(g,marble,.28,.28,.5,x,.5,7.4,'garden',16);dome(g,marble,.3,x,.75,7.4,'garden');
    }
    for(const x of [-3.3,3.3])for(const z of [5.2,6.3,8.5,9.6]){
      cylinder(g,grass,.16,.28,1.2,x,.7,z,'garden');
    }
  }else if(id==='qutub'){
    // Orientation: +z is south, +x is east.
    box(g,mat('#bca88a'),6,.3,6,0,.15,0,'base');
    const heights=[2.45,1.65,1.4,1.05,.9],radii=[.74,.56,.42,.31,.23,.14];let y=.3;const fluteMat=mat('#b96843');
    heights.forEach((h,i)=>{
      const m=i<3?stone:marble;
      const y0=y;
      cylinder(g,m,radii[i+1],radii[i],h,0,y0+h/2,0,'tower',48);
      y+=h;
      cylinder(g,m,radii[i+1]+.16,radii[i+1]+.12,.14,0,y,0,'balcony');
      if(i<3){
        const at=yy=>radii[i]+(radii[i+1]-radii[i])*((yy-y0)/h),n=i===0?24:20,ribs=[];
        for(let j=0;j<n;j++){
          const round=i===1||(i===0&&j%2===0),a=j/n*Math.PI*2;
          ribs.push(rib(at(y0+.04)+.005,at(y-.1)+.005,y0+.04,y-.1,a,round?.05:.065,round?8:3));
        }
        merged(g,fluteMat,ribs,'tower');
      }
    });
    cylinder(g,marble,.13,.14,.2,0,y+.17,0,'tower',24);
  }else if(id==='humayun'){
    const sandstone=mat('#a74e36'),pale=mat('#e7d8bd'),inlay=mat('#d8c39d');
    box(g,mat('#547044'),14,.12,14,0,.06,0,'ground');
    box(g,sandstone,9.2,.7,9.2,0,.45,0,'platform');
    box(g,inlay,8.1,.16,8.1,0,.88,0,'platform');
    const S=3.2,C=.72,bodyShape=new THREE.Shape();
    bodyShape.moveTo(-S+C,-S);bodyShape.lineTo(S-C,-S);bodyShape.lineTo(S,-S+C);bodyShape.lineTo(S,S-C);
    bodyShape.lineTo(S-C,S);bodyShape.lineTo(-S+C,S);bodyShape.lineTo(-S,S-C);bodyShape.lineTo(-S,-S+C);bodyShape.closePath();
    const bodyGeo=new THREE.ExtrudeGeometry(bodyShape,{depth:3.5,bevelEnabled:false});bodyGeo.rotateX(-Math.PI/2);
    mesh(g,bodyGeo,sandstone,0,.95,0,'tomb');
    for(const [nx,nz] of [[0,1],[1,0],[0,-1],[-1,0]]){
      const band=box(g,pale,5.8,.09,.06,nx*3.23,4.22,nz*3.23,'tomb');
      band.rotation.y=Math.atan2(nx,nz);
      const faceArch=(offset,y,width,height,tag='arches')=>{
        const x=nx*3.22+nz*offset,z=nz*3.22-nx*offset,rotation=Math.atan2(nx,nz);
        const frame=arch(g,inlay,width+.14,height+.14,x,y-.04,z);
        frame.rotation.y=rotation;frame.userData.hotspot=tag;
        const opening=arch(g,dark,width,height,x+nx*.025,y,z+nz*.025);
        opening.rotation.y=rotation;opening.userData.hotspot=tag;
      };
      for(const offset of [-2.05,2.05]){
        faceArch(offset,.98,.92,1.5);
      }
      for(const offset of [-2.72,-2.04,-1.36,1.36,2.04,2.72]){
        faceArch(offset,2.65,.42,.58);
        faceArch(offset,3.48,.4,.55);
      }
      faceArch(0,.95,1.7,2.35);
    }
    for(const x of [-5.6,5.6])for(const z of [-5.6,5.6]){
      cylinder(g,sandstone,.3,.4,.42,x,.33,z,'chhatri',20);
      cylinder(g,sandstone,.2,.27,4.85,x,2.965,z,'chhatri',20);
      for(const y of [1.4,2.7,4,5.35]){
        cylinder(g,pale,.32,.32,.12,x,y,z,'chhatri',20);
      }
      dome(g,pale,.28,x,5.39,z,'chhatri');
    }
    for(const x of [-3.12,3.12])for(const z of [-3.12,3.12]){
      box(g,inlay,.48,3.15,.48,x,2.55,z,'tomb');
      cylinder(g,sandstone,.23,.3,1.3,x,5.1,z,'chhatri',20);
      cylinder(g,pale,.4,.4,.28,x,5.88,z,'chhatri',20);
      dome(g,pale,.46,x,6.02,z,'chhatri');
    }
    cylinder(g,sandstone,1.62,1.62,.46,0,4.68,0,'dome');
    dome(g,pale,1.66,0,4.92,0,'dome');
    cylinder(g,gold,.05,.11,.62,0,7.48,0,'dome');
  }else if(id==='jantar-mantar'){
    const red=mat('#9e493a'),terracotta=mat('#b65b43'),ochre=mat('#bc8b60');
    const lime=mat('#e4d8bd'),weathered=mat('#c6b99c'),shadow=mat('#503d33');
    box(g,mat('#b8a68b'),17,.32,15,0,.16,0,'foundation');
    box(g,ochre,14,.32,12,0,.48,0,'foundation');
    box(g,weathered,.055,.02,11,0,.65,0,'foundation');
    for(const x of [-6,6])box(g,weathered,.045,.02,11,x,.65,0,'foundation');
    for(const z of [-5,5])box(g,weathered,13,.02,.045,0,.65,z,'foundation');

    const samratTop=6.38,samratRise=samratTop-.66;
    const samratShape=new THREE.Shape();
    samratShape.moveTo(-5.25,.66);
    samratShape.lineTo(5.25,.66);
    samratShape.lineTo(5.25,samratTop);
    samratShape.closePath();
    const samratGeo=new THREE.ExtrudeGeometry(samratShape,{depth:.82,bevelEnabled:false});
    samratGeo.translate(0,0,-.41);
    mesh(g,samratGeo,red,0,0,3,'samrat');
    const slope=Math.atan2(samratRise,10.5);
    const slopeLength=Math.hypot(10.5,samratRise);
    const scaleEdge=box(g,lime,slopeLength,.12,.08,0,.66+samratRise/2,4.22,'samrat');
    scaleEdge.rotation.z=slope;
    const stepCount=20,pitch=10.5/stepCount,rise=samratRise/stepCount;
    for(let i=0;i<stepCount;i++){
      const step=box(g,terracotta,pitch+.025,rise*.82,1.12,
        -5.25+(i+.5)*pitch,.66+(i+1)*rise,3.62,'samrat');
      step.userData.noShadow=true;
    }
    for(let i=0;i<=28;i++){
      const x=-5.05+i*(10.1/28),y=.66+(x+5.25)*(samratRise/10.5);
      const tick=box(g,i%4===0?lime:weathered,i%4===0?.2:.1,.045,.055,x,y,4.22,'samrat');
      tick.rotation.z=slope;
    }
    for(const sign of [-1,1]){
      for(let i=0;i<8;i++){
        const x=sign*(5.15-i*.43),y=.76+i*.34;
        box(g,ochre,.66,.16,.92,x,y,4.22,'samrat');
      }
    }

    for(const x of [-4.35,4.35]){
      const z=-.25,tag='ram-yantra';
      const floor=mesh(g,new THREE.RingGeometry(.4,1.48,48),lime,x,.79,z,tag);
      floor.rotation.x=-Math.PI/2;
      cylinder(g,terracotta,1.48,1.48,.16,x,.72,z,tag,48);
      mesh(g,new THREE.TorusGeometry(1.48,.09,8,48),weathered,x,2.82,z,tag).rotation.x=Math.PI/2;
      mesh(g,new THREE.TorusGeometry(1.48,.08,8,48),lime,x,.94,z,tag).rotation.x=Math.PI/2;
      for(let i=0;i<24;i++){
        const angle=i*Math.PI/12;
        const px=x+Math.sin(angle)*1.42,pz=z+Math.cos(angle)*1.42;
        const pier=box(g,i%3===0?lime:terracotta,.2,1.95,.26,px,1.9,pz,tag);
        pier.rotation.y=angle;
      }
      for(let i=0;i<24;i++){
        const angle=(i+.5)*Math.PI/12;
        const px=x+Math.sin(angle)*1.37,pz=z+Math.cos(angle)*1.37;
        const crown=arch(g,terracotta,.32,1.9,px,.88,pz);
        crown.rotation.y=angle;
        crown.userData.hotspot=tag;
        const opening=arch(g,shadow,.2,1.58,
          px+Math.sin(angle)*.025,.88,pz+Math.cos(angle)*.025);
        opening.rotation.y=angle;
        opening.userData.hotspot=tag;
      }
      cylinder(g,red,.19,.25,2.45,x,1.98,z,tag,24);
      cylinder(g,lime,.34,.36,.28,x,.98,z,tag,24);
      for(let i=0;i<24;i++){
        const angle=i*Math.PI/12;
        const major=i%3===0;
        const tick=box(g,major?red:weathered,major?.14:.075,.045,.045,
          x+Math.sin(angle)*1.18,.84,z+Math.cos(angle)*1.18,tag);
        tick.rotation.y=angle;
        if(i%2===0){
          const spoke=box(g,lime,1.06,.035,.035,
            x+Math.sin(angle)*.72,.84,z+Math.cos(angle)*.72,tag);
          spoke.rotation.y=angle-Math.PI/2;
        }
      }
    }

    for(const x of [-3.25,3.25]){
      const z=-3.45,baseY=.68,radius=1.55,height=1.52,tag='jai-prakash';
      const profile=[[0,.04],[.28,.055],[.58,.16],[.9,.35],[1.2,.67],[1.42,1.05],[1.53,1.37],[1.58,1.52],[1.42,1.5],[1.38,1.32],[1.27,.94],[1.04,.58],[.72,.31],[.35,.14],[0,.12]]
        .map(([r,y])=>new THREE.Vector2(r,y));
      mesh(g,new THREE.LatheGeometry(profile,64),terracotta,x,baseY,z,tag);
      const rim=mesh(g,new THREE.TorusGeometry(radius,.09,8,64),lime,x,baseY+height,z,tag);
      rim.rotation.x=Math.PI/2;
      const bowlY=(r)=>baseY+.12+height*(1-Math.sqrt(Math.max(0,1-(r/radius)**2)));
      for(let ring=0;ring<3;ring++){
        const r=.63+ring*.27,y=bowlY(r);
        for(let i=0;i<24;i++){
          const angle=i*Math.PI/12;
          const mark=box(g,i%3===0?lime:weathered,i%3===0?.13:.065,.035,.04,
            x+Math.sin(angle)*r,y,z+Math.cos(angle)*r,tag);
          mark.rotation.y=angle;
        }
      }
      for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
        const r=.98,y=baseY+height*.8;
        const bridge=box(g,lime,.16,.11,1.9,
          x+Math.sin(angle)*r/2,y,z+Math.cos(angle)*r/2,tag);
        bridge.rotation.y=angle;
      }
      cylinder(g,weathered,.045,.06,1.85,x,1.72,z,tag,12);
    }

    const misraZ=-6.15,tag='misra';
    box(g,shadow,5.45,.22,2.6,0,.78,misraZ,tag);
    box(g,red,5.05,.22,2.25,0,.98,misraZ,tag);
    box(g,lime,5.1,.08,.16,0,1.13,misraZ+1.05,tag);
    box(g,lime,5.1,.08,.16,0,1.13,misraZ-1.05,tag);
    for(const side of [-1,1]){
      const wallShape=new THREE.Shape();
      wallShape.moveTo(side*.18,1.12);
      wallShape.lineTo(side*2.05,1.12);
      wallShape.lineTo(side*2.05,2.55);
      wallShape.closePath();
      const wallGeo=new THREE.ExtrudeGeometry(wallShape,{depth:.24,bevelEnabled:false});
      wallGeo.translate(0,0,-.12);
      mesh(g,wallGeo,terracotta,0,0,misraZ+.18,tag);
      const edge=box(g,lime,Math.hypot(1.87,1.43),.09,.07,
        side*1.115,1.835,misraZ+.34,tag);
      edge.rotation.z=side*Math.atan2(1.43,1.87);
      for(let i=0;i<9;i++){
        const x=side*(.3+i*.2),y=1.12+i*.155;
        box(g,weathered,.055,.065,.32,x,y,misraZ+.38,tag);
      }
    }
    mesh(g,new THREE.TorusGeometry(1.9,.13,10,48,Math.PI),red,0,1.12,misraZ-.22,tag);
    mesh(g,new THREE.TorusGeometry(1.9,.055,8,48,Math.PI),lime,0,1.12,misraZ-.08,tag);
    for(let i=0;i<=12;i++){
      const angle=i*Math.PI/12;
      box(g,i%3===0?lime:weathered,i%3===0?.14:.07,.055,.055,
        1.84*Math.cos(angle),1.12+1.84*Math.sin(angle),misraZ-.01,tag);
    }
    cylinder(g,shadow,.09,.1,1.45,0,1.72,misraZ-.2,tag,12);
  }else if(id==='fort'){
    // Orientation: +z is west (the city side); -z is east toward the river.
    box(g,mat('#ad9471'),11,.25,8,0,.125,0);
    box(g,stone,11,1.9,.4,0,1.2,3,'walls');box(g,stone,11,1.9,.4,0,1.2,-3,'walls');
    if(!surroundings)for(const x of [-5.3,5.3])box(g,stone,.4,1.9,6,x,1.2,0,'walls');
    box(g,stone,3.1,3.5,1.7,0,2,2.55,'gate');arch(g,dark,1.25,2.3,0,.25,3.411).userData.hotspot='gate';
    for(const x of [-5.3,-1.8,1.8,5.3]){
      cylinder(g,stone,.48,.58,2.8,x,1.65,3,'walls',Math.abs(x)<3?8:16);dome(g,marble,.45,x,3.05,3,'gate');
    }
    for(let i=-3;i<=3;i++)dome(g,marble,.16,i*.4,3.75,2.55,'gate');
    {const m=[];for(let x=-5;x<=5;x+=.5){const b=new THREE.BoxGeometry(.2,.3,.48);b.translate(x,2.25,3);m.push(b);}merged(g,stone,m,'walls');}
    for(const x of [-2.6,0,2.6]){
      box(g,marble,1.8,.06,1.1,x,.28,-2.1,'palace');
      for(const dx of [-.75,-.25,.25,.75])for(const dz of [-.4,.4])cylinder(g,marble,.05,.05,1,x+dx,.81,-2.1+dz,'palace',10);
      box(g,marble,1.9,.12,1.2,x,1.37,-2.1,'palace');
      for(const dx of [-.8,.8])dome(g,marble,.14,x+dx,1.43,-2.1,'palace');
    }
    box(g,water,8.6,.03,.3,0,.3,-2.1,'palace');
  }
  if(surroundings)addSurroundings(g,id);
  return g;
}

function tree(g,leaf,trunk,x,z,id,s=1){
  cylinder(g,trunk,.07*s,.1*s,.9*s,x,.45*s,z,id,8);
  mesh(g,new THREE.IcosahedronGeometry(.68*s,1),leaf,x,1.35*s,z,id);
  for(const [dx,dy,dz,size] of [[-.34,1.18,0,.46],[.34,1.2,0,.46],[0,1.18,.34,.44]]){
    mesh(g,new THREE.IcosahedronGeometry(size*s,1),leaf,x+dx*s,dy*s,z+dz*s,id);
  }
}
function addSurroundings(g,id){
  const marble=mat('#eee4cb'),paving=mat('#cdbf9f'),pale=mat('#c9b48c'),redstone=mat('#b4553a'),stone=mat('#963e29'),ruin=mat('#a9835a'),
    dark=mat('#463d32',{side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),water=mat('#337f86',{metalness:.4,roughness:.2}),lawn=mat('#5f7d4a'),
    leaf=mat('#4f7a45'),trunk=mat('#6a5237'),iron=mat('#3d3f3c',{metalness:.7,roughness:.4});
  if(id==='taj'){
    box(g,paving,22,.05,19,0,.03,3);                    // paved terrace (untagged = builds with the plinth, never explodes)
    box(g,water,46,.04,9.5,0,.02,-11.25);               // the Yamuna behind the tomb
    // Red sandstone mosque (west) and its twin (east), flanking the plinth
    for(const [x,s] of [[-7.6,1],[7.6,-1]]){
      box(g,redstone,3.4,.4,6.4,x,.3,0,'garden');
      box(g,redstone,2.4,1.5,5,x,1.25,0,'garden');
      box(g,marble,2.5,.1,5.1,x,2.05,0,'garden');
      for(const z of [-1.6,0,1.6]){
        dome(g,marble,.62,x,2.1,z,'garden');
        const a=arch(g,dark,.9,1.15,x+s*1.211,.62,z);a.rotation.y=s*Math.PI/2;a.userData.hotspot='garden';
      }
    }
    // Great gate: two piers + lintel leave a real opening, so the tomb stays visible through it
    for(const x of [-2.025,2.025])box(g,redstone,2.35,3.4,1.6,x,1.8,11.2,'garden');
    box(g,redstone,1.7,.6,1.6,0,3.2,11.2,'garden');
    for(let i=-5;i<=5;i++)dome(g,marble,.2,i*.5,3.5,11.2,'garden');
    // Enclosure walls (open towards the river) and extra cypresses
    for(const x of [-1,1]){
      box(g,redstone,6.8,1.5,.5,x*6.6,.85,11.2,'garden');
      box(g,redstone,.5,1.5,16.2,x*10,.85,3.1,'garden');
    }
    for(const x of [-8.2,8.2])for(const z of [5.5,7.5,9.5])cylinder(g,leaf,0,.3,1.4,x,.8,z,'garden',12);
    for(const x of [-12.5,12.5])for(const z of [-5,1,7,13])tree(g,leaf,trunk,x,z,'garden',1.25);
    for(const x of [-9.5,-6.5,6.5,9.5])tree(g,leaf,trunk,x,14,'garden',1);
    for(const x of [-10,-7,7,10])for(const z of [-4,10])mesh(g,new THREE.IcosahedronGeometry(.55,1),leaf,x,.38,z,'garden');
  }else if(id==='qutub'){
    // +z = south, +x = east. The tower stands OUTSIDE the south-east corner of the oldest mosque courtyard,
    // inside Iltutmish's eastward extension. The prayer-hall screen is on the WEST side.
    box(g,lawn,28,.04,28,-3,.02,-1,'base');
    box(g,pale,9.2,.18,7.2,-6.4,.11,-5.4,'base');
    box(g,pale,7.8,.18,12.2,2.1,.11,-2.9,'base');
    box(g,ruin,.9,2.5,7.2,-10.4,1.45,-5.4,'base');
    box(g,pale,1,.15,7.4,-10.4,2.775,-5.4,'base');
    for(const z of [-8,-6.7,-5.4,-4.1,-2.8]){
      const big=z===-5.4,a=arch(g,dark,big?1.3:.9,big?2:1.6,-9.939,.21,z);a.rotation.y=Math.PI/2;a.userData.hotspot='base';
    }
    for(const z of [-8.4,-2.4]){
      box(g,pale,7,.14,1.3,-6.7,1.77,z,'base');
      for(let x=-9.5;x<=-3.5;x+=1.5)cylinder(g,ruin,.09,.11,1.5,x,.95,z,'base',10);
    }
    box(g,pale,7.2,.14,1.3,2,1.77,-8.4,'base');
    for(let x=-.5;x<=5;x+=1.5)cylinder(g,ruin,.09,.11,1.5,x,.95,-8.4,'base',10);
    box(g,pale,.7,.2,.7,-7.4,.3,-5.4,'base');
    cylinder(g,iron,.07,.1,.9,-7.4,.85,-5.4,'base',16);
    cylinder(g,iron,.16,.09,.2,-7.4,1.4,-5.4,'base',16);
    {
      const x=-2,z=6.8;
      box(g,redstone,1.8,1.3,1.8,x,.69,z,'base');
      for(const [nx,nz] of [[0,1],[1,0],[0,-1],[-1,0]]){const a=arch(g,dark,.8,1,x+nx*.911,.05,z+nz*.911);a.rotation.y=Math.atan2(nx,nz);a.userData.hotspot='base';}
      const d=dome(g,pale,.7,x,1.34,z,'base');d.scale.y=.55;
    }
    cylinder(g,ruin,1.15,1.3,2.6,4.2,1.34,-10.5,'base',24);
    for(const [x,z] of [[-13,-9],[-13,1],[7,-9],[8,4],[-6,9],[4,10],[-15,7],[10,-12],[11,9],[-15,-12]])tree(g,leaf,trunk,x,z,'base',1.2);
    for(const x of [-15,-12,10,13])for(const z of [-5,5])mesh(g,new THREE.IcosahedronGeometry(.62,1),leaf,x,.42,z,'base');
  }else if(id==='fort'){
    // Orientation: +z = WEST (city side, Lahori Gate), -z = EAST (Yamuna side). The ceremonial axis runs west to east.
    box(g,lawn,28,.04,24,0,.02,2,'walls');
    box(g,water,28,.06,1.6,0,.04,7.1,'walls');
    box(g,paving,2.6,.05,5.7,0,.035,10.85,'walls');
    box(g,redstone,2.8,.2,1.9,0,.13,7.1,'walls');
    for(const x of [-1.3,1.3])box(g,redstone,.2,.4,1.9,x,.43,7.1,'walls');
    box(g,stone,4.6,2.4,.5,0,1.25,4.9,'walls');
    box(g,stone,.5,2.4,1.8,-2.1,1.25,4.25,'walls');
    {const m=[];for(let x=-2.2;x<=2.2;x+=.5){const b=new THREE.BoxGeometry(.2,.3,.48);b.translate(x,2.55,4.9);m.push(b);}merged(g,stone,m,'walls');}
    for(const z of [3,-3])for(const s of [-1,1]){
      box(g,stone,8,2.15,.4,s*9.5,1.075,z,'walls');
      const m=[];for(let k=0;k<16;k++){const b=new THREE.BoxGeometry(.2,.3,.48);b.translate(s*(5.75+k*.5),2.25,z);m.push(b);}
      merged(g,stone,m,'walls');
    }
    {const m=[];for(let x=-5;x<=5;x+=.5){const b=new THREE.BoxGeometry(.2,.3,.48);b.translate(x,2.25,-3);m.push(b);}merged(g,stone,m,'walls');}
    const bastion=(x,z)=>{cylinder(g,stone,.48,.58,3.05,x,1.525,z,'walls',16);dome(g,marble,.45,x,3.05,z,'gate');};
    for(const s of [-1,1]){
      bastion(s*9.5,3);bastion(s*9.5,-3);bastion(s*5.3,-3);
      cylinder(g,stone,.58,.58,.25,s*5.3,.125,3,'walls',16);
    }
    for(const s of [-1,1])box(g,stone,.9,2,.8,s*1.05,1.3,1.3,'gate');
    box(g,stone,3,.14,.8,0,2.37,1.3,'gate');
    box(g,stone,3,1.5,.6,0,1,.55,'palace');box(g,marble,3.1,.1,.7,0,1.8,.55,'palace');
    for(const x of [-1.1,0,1.1])dome(g,marble,.28,x,1.85,.55,'palace');
    arch(g,dark,1.1,1.1,0,.25,.861).userData.hotspot='palace';
    box(g,stone,4.4,.3,1,0,.4,-.55,'palace');
    for(const x of [-1.8,-.9,0,.9,1.8])for(const z of [-.85,-.25])cylinder(g,stone,.07,.07,1,x,1.05,z,'palace',10);
    box(g,stone,4.6,.14,1.2,0,1.62,-.55,'palace');
    box(g,marble,1.1,.9,.12,0,1,-1.02,'palace');
    for(const x of [-2.6,0,2.6]){
      box(g,marble,1.8,.06,1.1,x,.28,-2.1,'palace');
      for(const dx of [-.75,-.25,.25,.75])for(const dz of [-.4,.4])cylinder(g,marble,.05,.05,1,x+dx,.81,-2.1+dz,'palace',10);
      box(g,marble,1.9,.12,1.2,x,1.37,-2.1,'palace');
      for(const dx of [-.8,.8])dome(g,marble,.14,x+dx,1.43,-2.1,'palace');
    }
    box(g,water,8.6,.03,.3,0,.3,-2.1,'palace');
    for(const x of [-12,12])for(const z of [-8,0,9])tree(g,leaf,trunk,x,z,'walls',1.35);
    for(const x of [-8,-4,4,8])for(const z of [-10,11])mesh(g,new THREE.IcosahedronGeometry(.65,1),leaf,x,.43,z,'walls');
  }else if(id==='jantar-mantar'){
    box(g,paving,20,.08,18,0,.04,0,'foundation');
    box(g,lawn,18,.04,16,0,.02,0,'foundation');
    for(const x of [-8.5,8.5])box(g,paving,.35,.045,16,x,.065,0,'foundation');
    for(const z of [-7.5,7.5])box(g,paving,17,.045,.35,0,.065,z,'foundation');
  }else if(id==='humayun'){
    box(g,lawn,24,.04,24,0,.02,0,'landscape');
    box(g,paving,1.5,.06,22,0,.065,0,'landscape');
    box(g,paving,22,.06,1.5,0,.065,0,'landscape');
    box(g,water,.62,.035,20,0,.11,0,'landscape');
    box(g,water,20,.035,.34,0,.11,0,'landscape');
    for(const x of [-10,10])for(const z of [-10,10])tree(g,leaf,trunk,x,z,'landscape',1.3);
    for(const x of [-8,-6,6,8])for(const z of [-8,8])mesh(g,new THREE.IcosahedronGeometry(.55,1),leaf,x,.36,z,'landscape');
    for(const x of [-5,-2.6,2.6,5])for(const z of [5.8,8.3,10.5]){
      mesh(g,new THREE.ConeGeometry(.34,2.5,8),leaf,x,1.27,z,'landscape');
    }
  }
}

// Gallery materials and furnishings are procedural, so no external image downloads are needed.
function canvasTexture(draw,size=512){
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;draw(canvas.getContext('2d'),size);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function floorTexture(){
  const texture=canvasTexture((c,size)=>{
    let seed=187;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    c.fillStyle='#b2afa7';c.fillRect(0,0,size,size);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const brightness=169+Math.floor(random()*20);c.fillStyle=`rgb(${brightness+6},${brightness+5},${brightness})`;c.fillRect(col*128+1,row*128+1,126,126);
    }
    for(let n=0;n<22000;n++){const value=random()>.5?255:55;c.fillStyle=`rgba(${value},${value},${value},.035)`;c.fillRect(random()*size,random()*size,random()*4,1);}
    c.strokeStyle='#c9c6bf';c.lineWidth=1.4;for(let n=0;n<=4;n++){c.beginPath();c.moveTo(n*128,0);c.lineTo(n*128,size);c.stroke();c.beginPath();c.moveTo(0,n*128);c.lineTo(size,n*128);c.stroke();}
  });texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,6);texture.anisotropy=4;return texture;
}
function artTexture(index){return canvasTexture((c,size)=>{
  const bg=['#ddd8c8','#27333a','#8d4e38','#cbc3ab'][index%4];c.fillStyle=bg;c.fillRect(0,0,size,size);
  c.strokeStyle=index%4===1?'#dfcc94':'#453c30';c.fillStyle=c.strokeStyle;c.lineWidth=3;c.textAlign='center';
  c.font='22px Georgia';c.fillText(['FORM & SYMMETRY','TOWERS OF TIME','WALLS & GATEWAYS','INDIAN HERITAGE'][index%4],size/2,65);
  c.font='12px Arial';c.fillText('KAAL DARPAN  /  HERITAGE COLLECTION',size/2,95);
  if(index%4===0){
    c.strokeRect(105,310,302,125);c.beginPath();c.ellipse(256,282,80,72,0,Math.PI,0);c.lineTo(336,310);c.lineTo(176,310);c.lineTo(176,282);c.stroke();
    for(const x of [70,442]){c.strokeRect(x-10,260,20,175);c.beginPath();c.moveTo(x-15,260);c.lineTo(x,228);c.lineTo(x+15,260);c.stroke();}
    for(const x of [166,256,346]){c.beginPath();c.moveTo(x-20,434);c.lineTo(x-20,370);c.quadraticCurveTo(x,320,x+20,370);c.lineTo(x+20,434);c.stroke();}
  }else if(index%4===1){
    c.beginPath();c.moveTo(195,445);c.lineTo(235,160);c.lineTo(277,160);c.lineTo(317,445);c.closePath();c.stroke();
    for(const y of [230,300,370,440]){c.beginPath();c.moveTo(180+(440-y)*.12,y);c.lineTo(330-(440-y)*.12,y);c.stroke();}
    for(let n=0;n<7;n++){c.beginPath();c.moveTo(205+n*16,435);c.lineTo(240+n*5,168);c.stroke();}
  }else{
    c.strokeRect(75,285,360,150);c.strokeRect(205,205,100,230);for(let x=75;x<435;x+=24)c.strokeRect(x,271,14,14);
    c.beginPath();c.moveTo(235,435);c.lineTo(235,320);c.quadraticCurveTo(256,285,277,320);c.lineTo(277,435);c.stroke();
  }
  c.globalAlpha=.35;for(let i=0;i<18;i++){c.beginPath();c.moveTo(35,140+i*18);c.lineTo(477,140+i*18);c.stroke();}
});}
function framedArt(g,index,x,y,z,rotation=0){
  const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rotation;
  box(frame,mat('#5a4935'),2,2.4,.10,0,0,0);
  box(frame,mat('#ece6d9'),1.85,2.25,.035,0,0,.07);
  const picture=new THREE.Mesh(new THREE.PlaneGeometry(1.64,2.04),new THREE.MeshStandardMaterial({map:artTexture(index),roughness:.85}));picture.position.z=.095;frame.add(picture);g.add(frame);
}
function bench(g,x,z,rotation=0){
  const seat=new THREE.Group();seat.position.set(x,0,z);seat.rotation.y=rotation;
  const leather=mat('#604638',{roughness:.9}),legs=mat('#282a29',{metalness:.4});
  box(seat,leather,3.1,.44,1.05,0,.59,0);
  for(const x of [-1.28,1.28])box(seat,legs,.14,.38,.72,x,.23,0);
  for(const x of [-.52,.52])box(seat,mat('#382f29'),.012,.003,1.03,x,.812,0);
  g.add(seat);
}
function artifactTable(g,x,z,w=2.1){
  const white=mat('#f1f0eb',{roughness:.45});box(g,white,w,.95,1.3,x,.475,z);box(g,mat('#b5b1a5'),w-.08,.035,1.22,x,.98,z);
  const pottery=mat('#7e7054',{roughness:.86});
  for(let i=0;i<3;i++){
    const a=x+(i-1)*.48;const profile=[[0,0],[.15,0],[.22,.15],[.15,.33],[.075,.36],[.08,.46]].map(v=>new THREE.Vector2(...v));
    mesh(g,new THREE.LatheGeometry(profile,20),pottery,a,1,z);
  }
}
export function makeHall(){
  const hall=new THREE.Group();const white=mat('#e9e9e2',{roughness:.85}),trim=mat('#cfcdc4'),frame=mat('#556368',{metalness:.3}),black=mat('#232526'),light=new THREE.MeshStandardMaterial({color:'#fff8e8',emissive:'#fff4d5',emissiveIntensity:2.3});
  box(hall,mat('#ffffff',{map:floorTexture(),roughness:.72}),20,.16,36,0,-.08,0);
  // White walls, a recessed rear gallery, and a large glazed side wall.
  box(hall,white,.28,8.2,32,-10,4.1,1);
  for(const x of [-6.4,6.4])box(hall,white,7.2,8.2,.28,x,4.1,-13.5);
  box(hall,white,5.6,1.65,.28,0,7.375,-13.5);
  box(hall,white,5.6,8.2,.28,0,4.1,-17.5);
  for(const x of [-2.8,2.8])box(hall,white,.25,8.2,4,x,4.1,-15.5);
  box(hall,white,.28,1.4,32,10,.7,1);box(hall,white,.28,1.9,32,10,7.25,1);
  box(hall,trim,.10,.18,32,-9.8,.1,1);box(hall,trim,.10,.18,32,9.8,.1,1);
  const glass=new THREE.MeshPhysicalMaterial({color:'#c5e6ec',transparent:true,opacity:.10,roughness:.08,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
  for(let z=-11.4;z<16;z+=4){
    const panel=box(hall,glass,.025,4.8,3.82,10,3.8,z);panel.castShadow=false;
    box(hall,frame,.15,4.95,.12,9.86,3.8,z-1.97);
  }
  for(const y of [1.35,3.35,6.3])box(hall,frame,.18,.12,30,9.86,y,1);
  // Dark slatted central ceiling with white perimeter soffits and luminous fixtures.
  box(hall,black,20,.18,32,0,8.25,1);
  for(const x of [-7.4,7.4])box(hall,white,5.2,1.05,32,x,7.62,1);
  for(let z=-13;z<=16;z+=.7)box(hall,mat('#363937'),9.8,.12,.15,0,8.04,z);
  for(const x of [-2.6,2.6])box(hall,black,.16,.3,27,x,7.87,1);
  for(let z=-10;z<=13;z+=4.5){
    for(const x of [-7.4,7.4])box(hall,light,.45,.035,2.1,x,7.065,z);
    for(const x of [-2.6,2.6]){
      const fixture=cylinder(hall,black,.10,.10,.27,x,7.59,z,undefined,16);
      fixture.rotation.x=.14;cylinder(hall,light,.076,.076,.02,x,7.44,z,undefined,16);
    }
  }
  framedArt(hall,0,-9.82,3.3,7,Math.PI/2);framedArt(hall,1,-9.82,3.3,.2,Math.PI/2);framedArt(hall,2,-9.82,3.3,-7,Math.PI/2);
  framedArt(hall,1,-6.4,3.4,-13.3);framedArt(hall,2,6.4,3.4,-13.3);framedArt(hall,0,0,3.6,-17.28);
  // Seating and smaller object displays leave clear aisles around the three monuments.
  bench(hall,-4.5,5.5);bench(hall,6.2,5.3,Math.PI/2);bench(hall,-4.8,-6.4);
  artifactTable(hall,-8.2,5,2.25);artifactTable(hall,7.5,-7,2.3);artifactTable(hall,0,-14.8,2.3);
  const rug=canvasTexture((c,s)=>{c.fillStyle='#948d7f';c.fillRect(0,0,s,s);for(let row=0;row<9;row++)for(let col=0;col<8;col++){c.fillStyle=['#b6b0a2','#76756c','#d6d0be'][(row*3+col)%3];c.fillRect(col*s/8+(row%2)*16,row*s/9,s/11,s/10);}});
  const carpet=new THREE.Mesh(new THREE.PlaneGeometry(5.6,4),mat('#ffffff',{map:rug,roughness:1}));carpet.rotation.x=-Math.PI/2;carpet.position.set(-4.2,.014,5);carpet.receiveShadow=true;hall.add(carpet);
  // Outdoor greenery is actual geometry seen through the windows.
  box(hall,mat('#95a88d'),18,.1,54,20,-.15,0);
  const leaf=mat('#8ba282'),trunk=mat('#8b8068');
  for(let i=0;i<10;i++){const x=14+(i%3)*3,z=-15+i*3.4;cylinder(hall,trunk,.10,.15,3,x,1.5,z);mesh(hall,new THREE.IcosahedronGeometry(1.7,1),leaf,x,4.1,z);}
  return hall;
}
export const galleryPositions = [[0,0,6],[0,0,-4.5],[-5.5,0,-1.1]];
export function makePedestal(id,index){
  const p=new THREE.Group();p.userData.monument=id;
  const white=mat('#f2f1ed',{roughness:.43}),edge=mat('#dedbd2',{roughness:.55});
  const width=id==='taj'?4.45:id==='fort'?4.2:3.2,depth=id==='taj'?5.2:id==='fort'?3.1:3.2;
  box(p,mat('#585b56'),width-.2,.13,depth-.2,0,.07,0);
  box(p,white,width,1.1,depth,0,.65,0);box(p,edge,width+.015,.025,depth+.015,0,1.215,0);
  const model=makeMonument(id),scale=id==='taj'?.335:id==='qutub'?.34:.335;model.scale.setScalar(scale);model.position.set(0,1.25,id==='taj'?-3*scale:0);p.add(model);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#f5f1e7';c.fillRect(0,0,1024,256);c.fillStyle='#806b43';c.font='24px Arial';c.fillText('0'+(index+1)+'  /  HERITAGE COLLECTION',42,53);
  c.fillStyle='#252d2a';c.font='54px Georgia';c.fillText(['Taj Mahal','Qutub Minar','Red Fort'][index],42,132);
  c.fillStyle='#65716c';c.font='23px Arial';c.fillText('SELECT THE MINIATURE TO EXPLORE',42,200);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const label=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width-.45,3.6),.65),new THREE.MeshBasicMaterial({map:texture}));label.position.set(0,.73,depth/2+.008);p.add(label);
  return p;
}
