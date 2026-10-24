import {useEffect,useRef} from 'react';

const NODES=8,BASE_RADIUS=9,MAX_PARTICLES=84;
const vert=`attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}`;
const frag=`precision highp float;
uniform vec3 uPts[${NODES}];uniform float uTime,uAlpha,uScale;
vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
void main(){
  vec2 p=gl_FragCoord.xy;float f=0.;vec2 g=vec2(0.);
  for(int i=0;i<${NODES};i++){vec2 d=p-uPts[i].xy;float r=uPts[i].z;float d2=dot(d,d)+1.;float k=r*r/d2;f+=k;g-=2.*k/d2*d;}
  float inside=smoothstep(.88,1.08,f);
  vec2 n2=-g/(length(g)+1e-4);
  float depth=clamp(1.-1./max(f,1e-3),0.,1.);
  vec3 N=normalize(vec3(n2*(1.-depth)*1.6,depth+.2));
  vec3 L=normalize(vec3(-.45,.6,.75));
  float diff=max(dot(N,L),0.);
  float spec=pow(max(dot(reflect(-L,N),vec3(0.,0.,1.)),0.),28.);
  float fres=pow(1.-N.z,2.2);
  vec3 bronze=vec3(.69,.55,.34),gold=vec3(.95,.83,.6);
  vec3 col=mix(bronze*.28,gold,diff*.75);
  float h=atan(n2.y,n2.x)/6.2831+uTime*.04+fres*.7;
  vec3 iri=mix(vec3(1.),hue(h),.38);
  col=mix(col,iri*gold*1.1,fres*.6)+spec*.85;
  float a=inside*(.22+.6*fres+.35*spec+.12*diff);
  float halo=smoothstep(.22,.95,f)*(1.-inside)*.16;
  float core=smoothstep(3.6*uScale,1.2*uScale,length(p-uPts[0].xy));
  vec3 outc=col*a+bronze*halo+vec3(1.,.95,.84)*core*.85;
  gl_FragColor=vec4(outc,clamp(a+halo+core*.85,0.,1.))*uAlpha;
}`;
const pvert=`attribute vec2 aPos;attribute vec3 aData;uniform vec2 uRes;varying vec2 vData;
void main(){gl_Position=vec4(aPos/uRes*2.-1.,0.,1.);gl_PointSize=aData.x;vData=aData.yz;}`;
const pfrag=`precision mediump float;varying vec2 vData;
vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
void main(){vec2 q=gl_PointCoord-.5;float d=length(q);
  float glow=pow(max(0.,1.-d*2.),3.);
  float cross=max(0.,1.-abs(q.x)*16.)*max(0.,1.-abs(q.y)*2.2)+max(0.,1.-abs(q.y)*16.)*max(0.,1.-abs(q.x)*2.2);
  vec2 r=vec2(q.x+q.y,q.x-q.y)*.7071;
  float xcross=max(0.,1.-abs(r.x)*18.)*max(0.,1.-abs(r.y)*3.)+max(0.,1.-abs(r.y)*18.)*max(0.,1.-abs(r.x)*3.);
  float twinkle=smoothstep(.5,1.,vData.x);
  float v=(glow+cross*(.7+.5*twinkle)+xcross*.4*twinkle)*vData.x;
  vec3 c=mix(vec3(1.,.88,.62),hue(vData.y),.55);
  gl_FragColor=vec4(c*v,v);}`;

function compile(gl,type,source){
  const shader=gl.createShader(type);
  if(!shader)throw new Error('Unable to create cursor shader.');
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Unable to compile cursor shader.');
  return shader;
}
function createProgram(gl,vertexSource,fragmentSource){
  const result=gl.createProgram();
  if(!result)throw new Error('Unable to create cursor shader program.');
  gl.attachShader(result,compile(gl,gl.VERTEX_SHADER,vertexSource));
  gl.attachShader(result,compile(gl,gl.FRAGMENT_SHADER,fragmentSource));
  gl.linkProgram(result);
  if(!gl.getProgramParameter(result,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(result)||'Unable to link cursor shader program.');
  return result;
}
const interactive='a[href],button:not(:disabled),[role=tab],label,summary,select,[data-cursor-hover]';

/** Compact liquid-metal cursor with the original iridescent edge and glitter trail. */
export default function LiquidCursor(){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(!fine.matches||reduce.matches)return;
    const canvas=canvasRef.current;
    if(!canvas)return;
    const gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,powerPreference:'low-power'});
    if(!gl)return;
    let blob,glitter;
    try{blob=createProgram(gl,vert,frag);glitter=createProgram(gl,pvert,pfrag);}
    catch(error){console.error('Unable to initialize the liquid cursor.',error);return;}
    document.documentElement.classList.add('liquid-cursor');
    const quad=gl.createBuffer(),particleBuffer=gl.createBuffer();
    if(!quad||!particleBuffer)throw new Error('Unable to create liquid cursor buffers.');
    gl.bindBuffer(gl.ARRAY_BUFFER,quad);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const particleData=new Float32Array(MAX_PARTICLES*5);
    const uniforms={
      points:gl.getUniformLocation(blob,'uPts'),
      time:gl.getUniformLocation(blob,'uTime'),
      alpha:gl.getUniformLocation(blob,'uAlpha'),
      scale:gl.getUniformLocation(blob,'uScale'),
      resolution:gl.getUniformLocation(glitter,'uRes'),
    };
    const blobPosition=gl.getAttribLocation(blob,'aPos');
    const particlePosition=gl.getAttribLocation(glitter,'aPos');
    const particleAttributes=gl.getAttribLocation(glitter,'aData');
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    let scale=1,width=0,height=0;
    const pointer={x:innerWidth/2,y:innerHeight/2,seen:false};
    const nodes=Array.from({length:NODES},()=>({x:pointer.x,y:pointer.y}));
    const points=new Float32Array(NODES*3),particles=[];
    let hover=0,hoverTarget=0,alpha=0,alphaTarget=0,press=1,raf=0,last=performance.now(),running=false;
    function spawn(x,y,count){
      for(let i=0;i<count&&particles.length<MAX_PARTICLES;i++){
        const angle=Math.random()*Math.PI*2,r=Math.random()*BASE_RADIUS*1.6;
        particles.push({x:x+Math.cos(angle)*r,y:y+Math.sin(angle)*r,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40+18,life:1,decay:.8+Math.random()*.9,size:3+Math.random()*5,hue:Math.random()});
      }
    }
    function frame(now){
      const dt=Math.min((now-last)/1000,.05);last=now;
      hover+=(hoverTarget-hover)*.15;alpha+=(alphaTarget-alpha)*.18;press+=(1-press)*.2;
      nodes[0].x+=(pointer.x-nodes[0].x)*.42;nodes[0].y+=(pointer.y-nodes[0].y)*.42;
      for(let i=1;i<NODES;i++){nodes[i].x+=(nodes[i-1].x-nodes[i].x)*.36;nodes[i].y+=(nodes[i-1].y-nodes[i].y)*.36;}
      const radius=BASE_RADIUS*(1+.45*hover)*press;let motion=0;
      nodes.forEach((node,i)=>{
        points[i*3]=node.x*scale;points[i*3+1]=(innerHeight-node.y)*scale;
        points[i*3+2]=radius*(1-i*.085)*scale;
        motion+=Math.abs(node.x-pointer.x)+Math.abs(node.y-pointer.y);
      });
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(blob);gl.bindBuffer(gl.ARRAY_BUFFER,quad);
      gl.enableVertexAttribArray(blobPosition);gl.vertexAttribPointer(blobPosition,2,gl.FLOAT,false,0,0);
      gl.uniform3fv(uniforms.points,points);gl.uniform1f(uniforms.time,now/1000);
      gl.uniform1f(uniforms.alpha,alpha);gl.uniform1f(uniforms.scale,scale);
      gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(blobPosition);
      for(let i=particles.length-1;i>=0;i--){
        const particle=particles[i];particle.life-=dt*particle.decay;
        if(particle.life<=0){particles.splice(i,1);continue;}
        particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;
        particle.vx*=.96;particle.vy*=.96;
      }
      if(particles.length){
        particles.forEach((particle,i)=>{
          const tw=.55+.45*Math.sin(now/70+i*1.7);
          particleData.set([particle.x*scale,(innerHeight-particle.y)*scale,particle.size*scale*(.6+particle.life*.6),particle.life*tw*alpha,particle.hue],i*5);
        });
        gl.useProgram(glitter);gl.uniform2f(uniforms.resolution,width,height);
        gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,particleData.subarray(0,particles.length*5),gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(particlePosition);gl.enableVertexAttribArray(particleAttributes);
        gl.vertexAttribPointer(particlePosition,2,gl.FLOAT,false,20,0);
        gl.vertexAttribPointer(particleAttributes,3,gl.FLOAT,false,20,8);
        gl.drawArrays(gl.POINTS,0,particles.length);
        gl.disableVertexAttribArray(particlePosition);gl.disableVertexAttribArray(particleAttributes);
      }
      const settled=motion<.3&&!particles.length&&Math.abs(hover-hoverTarget)<.01&&Math.abs(alpha-alphaTarget)<.01&&Math.abs(press-1)<.01;
      if(settled){running=false;return;}
      raf=requestAnimationFrame(frame);
    }
    function wake(){if(!running){running=true;last=performance.now();raf=requestAnimationFrame(frame);}}
    const resize=()=>{
      scale=Math.min(window.devicePixelRatio||1,1.5)*.6;
      width=Math.ceil(innerWidth*scale);height=Math.ceil(innerHeight*scale);
      canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);wake();
    };
    const move=event=>{
      if(event.pointerType&&event.pointerType!=='mouse')return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      pointer.x=event.clientX;pointer.y=event.clientY;
      if(!pointer.seen){pointer.seen=true;nodes.forEach(node=>{node.x=pointer.x;node.y=pointer.y;});}
      alphaTarget=1;
      const target=event.target instanceof Element?event.target:null;
      hoverTarget=target&&(target.closest(interactive)||target.style?.cursor==='pointer')?1:0;
      const distance=Math.hypot(dx,dy);
      if(distance>2&&Math.random()<.58)spawn(pointer.x,pointer.y,Math.min(2,Math.ceil(distance/24)));
      wake();
    };
    const down=event=>{if(event.pointerType!=='mouse')return;press=.75;spawn(event.clientX,event.clientY,5);wake();};
    const up=()=>{press=1;wake();};
    const out=event=>{if(!event.relatedTarget){alphaTarget=0;wake();}};
    const lost=event=>{event.preventDefault();cancelAnimationFrame(raf);running=true;document.documentElement.classList.remove('liquid-cursor');};
    resize();
    window.addEventListener('resize',resize);
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerdown',down,{passive:true});
    window.addEventListener('pointerup',up,{passive:true});
    document.addEventListener('mouseout',out);
    canvas.addEventListener('webglcontextlost',lost);
    return()=>{
      cancelAnimationFrame(raf);window.removeEventListener('resize',resize);
      window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);
      window.removeEventListener('pointerup',up);document.removeEventListener('mouseout',out);
      canvas.removeEventListener('webglcontextlost',lost);document.documentElement.classList.remove('liquid-cursor');
      gl.deleteBuffer(quad);gl.deleteBuffer(particleBuffer);gl.deleteProgram(blob);gl.deleteProgram(glitter);
    };
  },[]);
  return <canvas ref={canvasRef} className="liquid-cursor-canvas" aria-hidden="true" style={{position:'fixed',inset:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:200}}/>;
}
