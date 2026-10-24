import * as THREE from 'three';
const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
function mesh(group,geometry,material,x=0,y=0,z=0,hotspot){
  const part=new THREE.Mesh(geometry,material); part.position.set(x,y,z); part.castShadow=true; part.receiveShadow=true;
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
  return mesh(g,new THREE.ShapeGeometry(s),m,x,y,z);
}
export function makeMonument(id){
  const g=new THREE.Group();
  const marble=mat('#eee4cb'),gold=mat('#c9a45c',{metalness:.5}),stone=mat('#963e29'),dark=mat('#463d32',{side:THREE.DoubleSide}),grass=mat('#3c6546'),water=mat('#3d5560',{metalness:.4,roughness:.2});
  if(id==='taj'){
    box(g,grass,10,.15,14,0,.075,3,'garden');
    box(g,marble,9,.4,9,0,.3,0);
    box(g,marble,4.8,2.5,4.8,0,1.75,0);
    cylinder(g,marble,1.45,1.45,.45,0,3.23,0,'dome');dome(g,marble,1.5,0,3.45,0,'dome');
    cylinder(g,gold,0,.08,.65,0,6,0,'dome');
    for(const x of [-3.7,3.7])for(const z of [-3.7,3.7]){
      cylinder(g,marble,.17,.26,3.65,x,2.3,z,'minaret');
      for(const y of [1.4,2.6,4.05])cylinder(g,marble,.33,.33,.12,x,y,z,'minaret');
      dome(g,marble,.29,x,4.14,z,'minaret');
    }
    for(const x of [-1.9,1.9])for(const z of [-1.9,1.9]){
      cylinder(g,marble,.44,.44,.5,x,3.25,z);dome(g,marble,.51,x,3.5,z,'dome');
    }
    for(const x of [-1.65,0,1.65]){
      arch(g,dark,x===0?1.45:.72,x===0?2.15:1.7,x,.5,2.411);
      const side=arch(g,dark,.8,1.7,2.411,.5,x);side.rotation.y=Math.PI/2;
    }
    box(g,water,.55,.03,5,0,.17,7,'garden');box(g,marble,8,.02,.35,0,.17,7,'garden');
    for(const x of [-3.3,3.3])for(const z of [5.5,7.5,9.5]){
      cylinder(g,grass,.16,.28,1.2,x,.7,z,'garden');
    }
  }else if(id==='qutub'){
    box(g,mat('#bca88a'),6,.3,6,0,.15,0,'base');
    const heights=[2.45,1.65,1.4,1.05,.9],radii=[1,.77,.58,.43,.33,.23];let y=.3;
    heights.forEach((h,i)=>{
      const m=i<3?stone:marble;
      cylinder(g,m,radii[i+1],radii[i],h,0,y+h/2,0,'tower',48);
      y+=h;cylinder(g,m,radii[i+1]+.2,radii[i+1]+.15,.16,0,y,0,'balcony');
      if(i<3)for(let j=0;j<20;j++){
        const a=j/20*Math.PI*2,r=(radii[i]+radii[i+1])/2;
        cylinder(g,mat('#b96843'),.04,.065,h-.2,Math.sin(a)*r,y-h/2,Math.cos(a)*r,'tower',6);
      }
    });
    cylinder(g,stone,.02,.24,.35,0,y+.17,0,'tower');
  }else if(id==='fort'){
    box(g,mat('#ad9471'),11,.25,8,0,.125,0);
    box(g,stone,11,1.9,.4,0,1.2,3,'walls');box(g,stone,11,1.9,.4,0,1.2,-3,'walls');
    for(const x of [-5.3,5.3])box(g,stone,.4,1.9,6,x,1.2,0,'walls');
    box(g,stone,3.1,3.5,1.7,0,2,2.55,'gate');arch(g,dark,1.25,2.3,0,.25,3.411).userData.hotspot='gate';
    for(const x of [-5.3,-1.8,1.8,5.3]){
      cylinder(g,stone,.48,.58,2.8,x,1.65,3,'walls',16);dome(g,marble,.45,x,3.05,3,'gate');
    }
    for(let x=-5;x<=5;x+=.5)box(g,stone,.2,.3,.48,x,2.25,3,'walls');
    box(g,marble,4,.18,2,0,.35,-1,'palace');box(g,marble,4,.18,2,0,1.9,-1,'palace');
    for(const x of [-1.8,-.6,.6,1.8])for(const z of [-1.8,-.2])cylinder(g,marble,.065,.065,1.4,x,1.1,z,'palace',12);
    box(g,water,.2,.04,3,0,.4,-.5,'palace');
  }else if(id==='humayun'){
    const sandstone=mat('#a74e36'),lightStone=mat('#e7d8bd'),inlay=mat('#d8c39d');
    box(g,grass,14,.12,14,0,.06,0,'garden');
    box(g,water,.42,.025,12,0,.14,0,'garden');box(g,water,12,.025,.22,0,.14,0,'garden');
    box(g,sandstone,8.8,.65,8.8,0,.42,0,'platform');
    box(g,lightStone,7.7,.16,7.7,0,.83,0,'platform');
    box(g,sandstone,6.1,3.15,6.1,0,2.48,0,'arches');
    box(g,lightStone,1.5,.06,12,0,.11,0,'garden');
    box(g,lightStone,12,.06,.18,0,.11,0,'garden');
    for(const [nx,nz] of [[0,1],[1,0],[0,-1],[-1,0]]){
      const rotation=Math.atan2(nx,nz);
      const faceArch=(offset,y,width,height)=>{
        const x=nx*3.06+nz*offset,z=nz*3.06-nx*offset;
        const frame=arch(g,inlay,width+.14,height+.14,x,y-.04,z);
        frame.rotation.y=rotation;
        const opening=arch(g,dark,width,height,x+nx*.025,y,z+nz*.025);
        opening.rotation.y=rotation;opening.userData.hotspot='arches';
      };
      for(const offset of [-2.05,2.05])faceArch(offset,.98,.92,1.5);
      for(const offset of [-2.72,-2.04,-1.36,1.36,2.04,2.72]){
        faceArch(offset,2.65,.42,.58);
        faceArch(offset,3.48,.4,.55);
      }
      faceArch(0,.95,1.7,2.35);
    }
    for(const x of [-5.6,5.6])for(const z of [-5.6,5.6]){
      cylinder(g,sandstone,.3,.4,.42,x,.33,z,'chhatris',20);
      cylinder(g,sandstone,.2,.27,4.65,x,2.865,z,'chhatris',20);
      for(const y of [1.4,2.65,3.9,5.2])cylinder(g,lightStone,.31,.31,.12,x,y,z,'chhatris',20);
      dome(g,lightStone,.28,x,5.26,z,'chhatris');
    }
    for(const x of [-3.08,3.08])for(const z of [-3.08,3.08]){
      box(g,inlay,.56,3.05,.56,x,2.42,z,'arches');
      cylinder(g,sandstone,.24,.3,1.4,x,4.75,z,'chhatris',20);
      dome(g,lightStone,.38,x,5.45,z,'chhatris');
    }
    for(const x of [-4,-2.3,2.3,4])for(const z of [4.8,6.1]){
      mesh(g,new THREE.ConeGeometry(.3,2.2,8),grass,x,1.12,z,'garden');
    }
    cylinder(g,sandstone,1.55,1.55,.42,0,4.27,0,'dome');
    dome(g,lightStone,1.55,0,4.48,0,'dome');
    cylinder(g,gold,.05,.1,.7,0,6.95,0,'dome');
  }else if(id==='india-gate'){
    const sandstone=mat('#b27a4b'),trim=mat('#d4a774'),shadow=mat('#463b32',{side:THREE.DoubleSide});
    box(g,mat('#9a6946'),8.5,.25,5.2,0,.125,0,'base');
    box(g,sandstone,5.8,6.15,1.55,0,3.2,0,'arch');
    arch(g,shadow,2.15,3.65,0,.28,.79).userData.hotspot='arch';
    box(g,trim,6.05,.24,1.75,0,6.27,0,'cornice');
    box(g,sandstone,5.2,.72,1.5,0,6.72,0,'attic');
    box(g,trim,5.55,.14,1.65,0,7.16,0,'cornice');
    box(g,trim,.13,5.35,.08,-2.7,3.15,.82,'inlay');
    box(g,trim,.13,5.35,.08,2.7,3.15,.82,'inlay');
    for(const y of [4.15,4.45,6.55,6.92])box(g,trim,5.15,.055,.08,0,y,.82,'inlay');
    const wreath=new THREE.Mesh(new THREE.TorusGeometry(.38,.065,8,32),gold);
    wreath.position.set(0,6.72,.81);wreath.castShadow=true;g.add(wreath);
    box(g,trim,.11,.68,.11,0,7.58,0,'finial');
    cylinder(g,gold,.12,.12,.12,0,7.97,0,'finial',16);
  }else if(id==='purana-qila'){
    const red=mat('#98452f'),ochre=mat('#c99a68'),darkStone=mat('#51463a',{side:THREE.DoubleSide});
    box(g,mat('#aa8a68'),11,.22,9,0,.11,0,'base');
    box(g,red,10.4,2.5,.55,0,1.35,3.85,'walls');
    box(g,red,10.4,2.5,.55,0,1.35,-3.85,'walls');
    for(const x of [-4.95,4.95])box(g,red,.55,2.5,7.7,x,1.35,0,'walls');
    for(const x of [-4.6,-3.8,-3,-2.2,-1.4,1.4,2.2,3,3.8,4.6]){
      box(g,ochre,.35,.45,.62,x,2.78,3.85,'crenellation');
      box(g,ochre,.35,.45,.62,x,2.78,-3.85,'crenellation');
    }
    for(const x of [-4.8,4.8]){
      cylinder(g,red,.88,.92,3.2,x,1.7,3.35,'bastion',20);
      dome(g,ochre,.84,x,3.36,3.35,'pavilion');
      cylinder(g,red,.88,.92,3.2,x,1.7,-3.35,'bastion',20);
    }
    box(g,red,4.2,4.25,1.7,0,2.2,3.25,'gate');
    arch(g,darkStone,1.85,2.75,0,.25,4.111).userData.hotspot='gate';
    for(const x of [-1.8,1.8]){
      box(g,ochre,.24,3.6,.1,x,2.15,4.13,'inlay');
      cylinder(g,red,.45,.52,3.3,x,1.9,3.1,'tower',16);
      dome(g,ochre,.5,x,3.65,3.1,'pavilion');
    }
    box(g,ochre,4.55,.18,1.86,0,4.38,3.25,'cornice');
  }else if(id==='agrasen-baoli'){
    const sandstone=mat('#9b7457'),warmStone=mat('#c3a17d'),deep=mat('#273842',{roughness:.22,metalness:.25});
    box(g,warmStone,10,.3,10,0,.15,0,'rim');
    box(g,grass,8.9,.06,8.9,0,.33,0,'garden');
    for(let level=0;level<7;level++){
      const half=4.05-level*.48,y=3.45-level*.42,wall=.4;
      box(g,sandstone,half*2,wall,.48,0,y,-half,'steps');
      box(g,sandstone,half*2,wall,.48,0,y,half,'steps');
      box(g,sandstone,.48,wall,half*2,-half,y,0,'steps');
      box(g,sandstone,.48,wall,half*2,half,y,0,'steps');
      box(g,warmStone,half*2,.06,.54,0,y+wall*.48,-half,'treads');
      box(g,warmStone,.54,.06,half*2,-half,y+wall*.48,0,'treads');
      if(level<5){
        for(const x of [-half*.48,half*.48]){
          arch(g,dark,Math.max(.48,half*.2),.62,x,y-wall*.42,half-.23);
          const pier=box(g,warmStone,.15,.8,.2,x,y+.15,half-.2,'pillars');
          pier.castShadow=true;
        }
      }
    }
    box(g,deep,2.15,.12,2.15,0,.58,0,'water');
    for(const x of [-2.9,2.9])for(const z of [-2.9,2.9]){
      box(g,warmStone,.8,.16,.8,x,3.68,z,'pavilion');
      cylinder(g,sandstone,.27,.32,1.25,x,4.34,z,'pavilion',16);
      dome(g,warmStone,.36,x,5.12,z,'pavilion');
    }
  }else if(id==='safdarjung-tomb'){
    const sandstone=mat('#a74732'),pale=mat('#efe4ce'),trim=mat('#d8bd8b');
    box(g,grass,10,.12,12,0,.06,2,'garden');
    box(g,water,.42,.025,8,0,.15,4,'garden');
    box(g,sandstone,8.6,.55,8.6,0,.39,0,'plinth');
    box(g,trim,7.6,.12,7.6,0,.73,0,'plinth');
    box(g,sandstone,6.2,3.2,6.2,0,2.36,0,'tomb');
    for(const x of [-3.1,3.1])for(const z of [-3.1,3.1]){
      box(g,trim,.42,3.05,.42,x,2.3,z,'corner');
      cylinder(g,sandstone,.23,.31,3.2,x,4.15,z,'minaret',20);
      for(const y of [3.55,4.65])cylinder(g,trim,.34,.34,.1,x,y,z,'minaret',20);
      dome(g,pale,.39,x,5.85,z,'minaret');
    }
    for(const x of [-1.8,0,1.8]){
      arch(g,dark,x===0?1.55:.85,2.25,x,.78,3.111);
      const side=arch(g,dark,.85,2.1,3.111,.78,x);side.rotation.y=Math.PI/2;
      box(g,trim,.09,2.42,.1,x,2.08,3.13,'inlay');
    }
    cylinder(g,sandstone,1.4,1.4,.42,0,4.2,0,'dome');
    dome(g,pale,1.5,0,4.4,0,'dome');
    cylinder(g,gold,.04,.1,.7,0,6.72,0,'finial');
    for(const x of [-1.7,1.7])for(const z of [-1.7,1.7]){
      cylinder(g,trim,.4,.4,.38,x,4.08,z,'chhatri',24);
      dome(g,pale,.46,x,4.28,z,'chhatri');
    }
  }
  return g;
}

// Gallery materials and furnishings are procedural, so no external image downloads are needed.
function canvasTexture(draw,size=512){
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;draw(canvas.getContext('2d'),size);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function floorTexture(){
  const texture=canvasTexture((c,size)=>{
    let seed=187;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    c.fillStyle='#16151a';c.fillRect(0,0,size,size);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const brightness=22+Math.floor(random()*10);c.fillStyle=`rgb(${brightness+4},${brightness+2},${brightness+5})`;c.fillRect(col*128+1,row*128+1,126,126);
    }
    for(let n=0;n<22000;n++){const value=random()>.5?255:55;c.fillStyle=`rgba(${value},${value},${value},.035)`;c.fillRect(random()*size,random()*size,random()*4,1);}
    c.strokeStyle='#5a4a32';c.lineWidth=1.4;for(let n=0;n<=4;n++){c.beginPath();c.moveTo(n*128,0);c.lineTo(n*128,size);c.stroke();c.beginPath();c.moveTo(0,n*128);c.lineTo(size,n*128);c.stroke();}
  });texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,6);texture.anisotropy=4;return texture;
}
function artTexture(index){return canvasTexture((c,size)=>{
  const bg=['#1a1712','#151820','#1c1410','#18161a'][index%4];c.fillStyle=bg;c.fillRect(0,0,size,size);
  c.strokeStyle=index%4===1?'#c9a86a':'#b08d57';c.fillStyle=c.strokeStyle;c.lineWidth=3;c.textAlign='center';
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
  box(frame,mat('#6b5532',{metalness:.6,roughness:.4}),2,2.4,.10,0,0,0);
  box(frame,mat('#0d0b0a'),1.85,2.25,.035,0,0,.07);
  const picture=new THREE.Mesh(new THREE.PlaneGeometry(1.64,2.04),new THREE.MeshStandardMaterial({map:artTexture(index),roughness:.85}));picture.position.z=.095;frame.add(picture);g.add(frame);
}
function bench(g,x,z,rotation=0){
  const seat=new THREE.Group();seat.position.set(x,0,z);seat.rotation.y=rotation;
  const leather=mat('#3a281e',{roughness:.9}),legs=mat('#282a29',{metalness:.4});
  box(seat,leather,3.1,.44,1.05,0,.59,0);
  for(const x of [-1.28,1.28])box(seat,legs,.14,.38,.72,x,.23,0);
  for(const x of [-.52,.52])box(seat,mat('#382f29'),.012,.003,1.03,x,.812,0);
  g.add(seat);
}
function artifactTable(g,x,z,w=2.1){
  const table=mat('#1d1b20',{roughness:.45});box(g,table,w,.95,1.3,x,.475,z);box(g,mat('#8a6e44',{metalness:.6,roughness:.35}),w-.08,.035,1.22,x,.98,z);
  const pottery=mat('#7e7054',{roughness:.86});
  for(let i=0;i<3;i++){
    const a=x+(i-1)*.48;const profile=[[0,0],[.15,0],[.22,.15],[.15,.33],[.075,.36],[.08,.46]].map(v=>new THREE.Vector2(...v));
    mesh(g,new THREE.LatheGeometry(profile,20),pottery,a,1,z);
  }
}
export function makeHall(){
  const hall=new THREE.Group();const trim=mat('#8a6e44',{metalness:.6,roughness:.4}),frame=mat('#3a3f48',{metalness:.5}),black=mat('#0c0b0e'),light=new THREE.MeshStandardMaterial({color:'#ffd9a0',emissive:'#ffb866',emissiveIntensity:1.6});
  box(hall,mat('#18151a',{map:floorTexture(),roughness:.38,metalness:.15}),20,.16,36,0,-.08,0);
  // Darker walls, a recessed rear gallery, and a large glazed side wall.
  box(hall,mat('#1a181d',{roughness:.85}),.28,8.2,32,-10,4.1,1);
  for(const x of [-6.4,6.4])box(hall,mat('#1a181d',{roughness:.85}),7.2,8.2,.28,x,4.1,-13.5);
  box(hall,mat('#1a181d',{roughness:.85}),5.6,1.65,.28,0,7.375,-13.5);
  box(hall,mat('#1a181d',{roughness:.85}),5.6,8.2,.28,0,4.1,-17.5);
  for(const x of [-2.8,2.8])box(hall,mat('#1a181d',{roughness:.85}),.25,8.2,4,x,4.1,-15.5);
  box(hall,mat('#1a181d',{roughness:.85}),.28,1.4,32,10,.7,1);box(hall,mat('#1a181d',{roughness:.85}),.28,1.9,32,10,7.25,1);
  box(hall,trim,.10,.18,32,-9.8,.1,1);box(hall,trim,.10,.18,32,9.8,.1,1);
  const glass=new THREE.MeshPhysicalMaterial({color:'#7f93b0',transparent:true,opacity:.14,roughness:.08,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
  for(let z=-11.4;z<16;z+=4){
    const panel=box(hall,glass,.025,4.8,3.82,10,3.8,z);panel.castShadow=false;
    box(hall,frame,.15,4.95,.12,9.86,3.8,z-1.97);
  }
  for(const y of [1.35,3.35,6.3])box(hall,frame,.18,.12,30,9.86,y,1);
  // Darker ceiling with darker perimeter soffits and luminous fixtures.
  box(hall,black,20,.18,32,0,8.25,1);
  for(const x of [-7.4,7.4])box(hall,mat('#14161a',{roughness:.85}),5.2,1.05,32,x,7.62,1);
  for(let z=-13;z<=16;z+=.7)box(hall,mat('#0f0e12'),9.8,.12,.15,0,8.04,z);
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
  // Seating and smaller object displays leave clear aisles around the five monument exhibits.
  bench(hall,-6,-14.4);bench(hall,0,-14.4);bench(hall,6,-14.4);
  artifactTable(hall,-8.8,8,1.5);artifactTable(hall,8.8,-1,1.5);artifactTable(hall,8.8,-10,1.5);
  const rug=canvasTexture((c,s)=>{c.fillStyle='#2a1c16';c.fillRect(0,0,s,s);for(let row=0;row<9;row++)for(let col=0;col<8;col++){c.fillStyle=['#5a3a26','#3a2a20','#7a5a36'][(row*3+col)%3];c.fillRect(col*s/8+(row%2)*16,row*s/9,s/11,s/10);}});
  const carpet=new THREE.Mesh(new THREE.PlaneGeometry(5.6,4),mat('#ffffff',{map:rug,roughness:1}));carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.014,13.5);carpet.receiveShadow=true;hall.add(carpet);
  // Outdoor greenery is actual geometry seen through the windows.
  box(hall,mat('#141a1e'),18,.1,54,20,-.15,0);
  const leaf=mat('#1e2a2c'),trunk=mat('#2a2622');
  for(let i=0;i<10;i++){const x=14+(i%3)*3,z=-15+i*3.4;cylinder(hall,trunk,.10,.15,3,x,1.5,z);mesh(hall,new THREE.IcosahedronGeometry(1.7,1),leaf,x,4.1,z);}
  return hall;
}
export const galleryPositions = [
  [-3.4,0,5],[3.4,0,5],
  [-5.8,0,-7.5],[0,0,-7.5],[5.8,0,-7.5],
];
export function makePedestal(id,index,name,interactive=true){
  const p=new THREE.Group();if(interactive)p.userData.monument=id;
  const white=mat('#1a181d',{roughness:.43}),edge=mat('#b08d57',{roughness:.3,metalness:.8});
  const width=4.5,depth=5.2;
  box(p,mat('#0e0d10'),width-.2,.13,depth-.2,0,.07,0);
  box(p,white,width,1.1,depth,0,.65,0);box(p,edge,width+.015,.025,depth+.015,0,1.215,0);
  if(id!=='jantar-mantar'){
    const model=makeMonument(id),scales={taj:.335,qutub:.34,fort:.335,'purana-qila':.4,humayun:.34},scale=scales[id]??.42;
    model.scale.setScalar(scale);model.position.set(0,1.25,id==='taj'?-3*scale:0);p.add(model);
  }
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#0d0b0c';c.fillRect(0,0,1024,256);c.fillStyle='#b08d57';c.font='24px Arial';c.fillText('0'+(index+1)+'  /  HERITAGE COLLECTION',42,53);
  c.fillStyle='#e8dcc8';c.font='54px Georgia';c.fillText(name,42,132);
  c.fillStyle='#ede0d4e5';c.font='23px Arial';c.fillText(interactive?'SELECT THE MINIATURE TO EXPLORE':'GALLERY MODEL · VIEW FROM ALL SIDES',42,200);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const label=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width-.45,3.6),.65),new THREE.MeshBasicMaterial({map:texture}));label.position.set(0,.73,depth/2+.008);p.add(label);
  return p;
}
