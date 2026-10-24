import {useEffect,useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import './ClockTransition.css';

const CLOCK_DURATION=1.2,HAND_DURATION=.72,FADE_AT=.82;
const numerals=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];

function gearPath(teeth,outer,inner,hole){
  const step=Math.PI*2/teeth,pts=[];
  for(let i=0;i<teeth;i++){
    const a=i*step;
    pts.push([inner,a],[outer,a+step*.18],[outer,a+step*.48],[inner,a+step*.66]);
  }
  const d=pts.map(([r,a],i)=>`${i?'L':'M'}${(Math.cos(a)*r).toFixed(1)} ${(Math.sin(a)*r).toFixed(1)}`).join('')+'Z';
  return d+`M${hole} 0A${hole} ${hole} 0 1 0 ${-hole} 0A${hole} ${hole} 0 1 0 ${hole} 0Z`;
}

// [x, y, teeth, outer radius, rotation direction]
const gears=[
  [-330,-270,26,235,1],[350,260,22,205,-1],[305,-330,14,125,1],[-345,335,16,150,-1],
  [0,0,20,168,-1],[118,128,12,72,1],[-120,118,10,58,1],[0,-150,15,62,1],
];

// The dial is 1120 units wide (viewBox -560..560). Every moving part is its own small SVG layer, so GSAP can
// turn it with a compositor-only transform instead of re-rasterising the whole clock on every frame.
const DIAL=1120,pct=v=>((v+DIAL/2)/DIAL*100)+'%';
function Gear({x,y,teeth,outer,spokes,className,innerRef}){
  const inner=outer*.86,hole=outer*.14,pad=outer*1.02;
  return <svg ref={innerRef} className="ct-layer ct-gear" viewBox={`${-pad} ${-pad} ${pad*2} ${pad*2}`} aria-hidden="true" style={{left:pct(x-pad),top:pct(y-pad),width:(pad*2/DIAL*100)+'%',height:(pad*2/DIAL*100)+'%'}}>
    <g className={className}>
      <path d={gearPath(teeth,outer,inner,hole)} fillRule="evenodd"/>
      <circle r={inner*.78} className="gear-rim"/>
      {Array.from({length:spokes},(_,i)=><rect key={i} x={-outer*.045} y={-inner*.78} width={outer*.09} height={inner*.78-hole} transform={`rotate(${i*360/spokes})`} className="gear-spoke"/>)}
      <circle r={hole*1.5} className="gear-hub"/>
    </g>
  </svg>;
}
const Layer=({children,innerRef,className=''})=><svg ref={innerRef} className={'ct-layer '+className} viewBox="-560 -560 1120 1120" aria-hidden="true">{children}</svg>;

export default function ClockTransition({label,onDone}){
  const root=useRef(null),clock=useRef(null),text=useRef(null),hour=useRef(null),minute=useRef(null),second=useRef(null),gearRefs=useRef([]);
  const callbacks=useRef({onDone});
  useLayoutEffect(()=>{callbacks.current={onDone};});
  useEffect(()=>{
    let tl;
    const ctx=gsap.context(()=>{
      // will-change is only present while this overlay is mounted (the class is removed before it unmounts).
      root.current.classList.add('is-animating');
      tl=gsap.timeline({defaults:{force3D:true}})
        .set(root.current,{autoAlpha:1})
        .fromTo('.clock-veil',{opacity:0},{opacity:1,duration:.28,ease:'power2.out'},0)
        .fromTo(clock.current,{scale:.82,opacity:0},{scale:1,opacity:1,duration:.7,ease:'expo.out'},0)
        .to(hour.current,{rotation:-120,duration:HAND_DURATION,ease:'power2.inOut'},0)
        .to(minute.current,{rotation:-1080,duration:HAND_DURATION,ease:'power2.inOut'},0)
        .to(second.current,{rotation:-2880,duration:HAND_DURATION,ease:'power2.inOut'},0)
        .fromTo(text.current,{opacity:0,y:14},{opacity:1,y:0,duration:.35,ease:'power2.out'},.2)
        .to(clock.current,{scale:1.12,duration:CLOCK_DURATION-FADE_AT,ease:'power2.in'},FADE_AT)
        .to(root.current,{opacity:0,duration:CLOCK_DURATION-FADE_AT,ease:'power2.inOut'},FADE_AT)
        .add(()=>{root.current?.classList.remove('is-animating');callbacks.current.onDone?.();});
      gears.forEach((g,index)=>{
        const element=gearRefs.current[index];if(!element)return;
        tl.to(element,{rotation:g[4]*5400/g[2],duration:HAND_DURATION,ease:'power2.inOut'},0);
      });
    },root);
    // Wall-clock guarantee: if frames stall (slow GPU / heavy scene mount), finish on time anyway.
    const fallback=setTimeout(()=>tl?.progress(1,false),CLOCK_DURATION*1000+250);
    return()=>{clearTimeout(fallback);ctx.revert();};
  },[]);
  return <div className="clock-transition" ref={root} role="status" aria-live="polite">
    <div className="clock-veil"/>
    <div className="clock-wrap" ref={clock}>
      <svg className="ct-layer ct-defs" viewBox="-560 -560 1120 1120" aria-hidden="true">
        <defs>
          <linearGradient id="ct-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3c58c"/><stop offset=".35" stopColor="#b08d57"/><stop offset=".6" stopColor="#6e5430"/><stop offset="1" stopColor="#c9a86a"/></linearGradient>
          <linearGradient id="ct-brass-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7a5f36"/><stop offset=".5" stopColor="#3d2e1a"/><stop offset="1" stopColor="#6b5230"/></linearGradient>
          <radialGradient id="ct-face" r=".5"><stop offset=".62" stopColor="#120e0a" stopOpacity=".2"/><stop offset=".7" stopColor="#1a140d" stopOpacity=".92"/><stop offset="1" stopColor="#0b0806"/></radialGradient>
          <linearGradient id="ct-spectral" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="hsl(0 25% 70%)"/><stop offset=".2" stopColor="hsl(45 25% 70%)"/><stop offset=".4" stopColor="hsl(120 18% 66%)"/><stop offset=".6" stopColor="hsl(195 22% 68%)"/><stop offset=".8" stopColor="hsl(260 20% 72%)"/><stop offset="1" stopColor="hsl(320 20% 70%)"/></linearGradient>
        </defs>
      </svg>
      {gears.slice(0,4).map((g,i)=><Gear key={i} x={g[0]} y={g[1]} teeth={g[2]} outer={g[3]} spokes={6} className="gear gear-back" innerRef={element=>gearRefs.current[i]=element}/>)}
      <Layer className="ct-static"><circle r="420" fill="url(#ct-face)"/></Layer>
      {gears.slice(4).map((g,i)=><Gear key={i} x={g[0]} y={g[1]} teeth={g[2]} outer={g[3]} spokes={g[2]>14?5:4} className="gear gear-front" innerRef={element=>gearRefs.current[i+4]=element}/>)}
      <Layer className="ct-static">
        <circle r="432" className="spectral-edge" stroke="url(#ct-spectral)"/>
        <circle r="412" className="rim" stroke="url(#ct-brass)"/>
        <circle r="392" className="rim-thin"/>
        <circle r="290" className="chapter"/>
        <circle r="276" className="rim-thin"/>
        <g className="ticks">{Array.from({length:60},(_,i)=><line key={i} y1={i%5?-382:-388} y2={i%5?-366:-352} transform={`rotate(${i*6})`} className={i%5?'tick':'tick major'}/>)}</g>
        <g className="numerals">{numerals.map((n,i)=>{const a=(i*30-90)*Math.PI/180;return <text key={n} x={Math.cos(a)*322} y={Math.sin(a)*322} transform={`rotate(${i*30} ${Math.cos(a)*322} ${Math.sin(a)*322})`}>{n}</text>;})}</g>
      </Layer>
      <Layer innerRef={hour} className="ct-hand"><g className="hand hand-hour"><path d="M-12 40 L-9 -120 Q-34 -150 0 -196 Q34 -150 9 -120 L12 40 Z"/><circle cy="-150" r="14" className="hand-cut"/></g></Layer>
      <Layer innerRef={minute} className="ct-hand"><g className="hand hand-minute"><path d="M-8 52 L-5 -230 Q-20 -250 0 -300 Q20 -250 5 -230 L8 52 Z"/><circle cy="-245" r="8" className="hand-cut"/></g></Layer>
      <Layer innerRef={second} className="ct-hand"><g className="hand hand-second"><path d="M-2 80 L-1.5 -350 L1.5 -350 L2 80 Z"/><circle cy="62" r="12"/></g><circle r="24" fill="url(#ct-brass)"/><circle r="8" fill="#1a130b"/></Layer>
    </div>
    <div className="clock-text" ref={text}><p className="clock-eyebrow">Travelling through time</p>{label&&<h2>{label}</h2>}</div>
  </div>;
}
