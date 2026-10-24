const deva='०१२३४५६७८९';
export const toDevanagari=n=>String(n).replace(/\d/g,d=>deva[d]);

/** Large clock-dial / mandala ring drawn behind the cover title. */
export function MandalaRing({className=''}){
  const petals=Array.from({length:24},(_,i)=>i*15);
  return <svg className={className} viewBox="-500 -500 1000 1000" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="mr-spectral" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="hsl(0 22% 70%)"/><stop offset=".2" stopColor="hsl(45 24% 72%)"/><stop offset=".4" stopColor="hsl(120 16% 66%)"/><stop offset=".6" stopColor="hsl(195 20% 70%)"/><stop offset=".8" stopColor="hsl(260 18% 74%)"/><stop offset="1" stopColor="hsl(320 18% 70%)"/></linearGradient>
      <path id="mr-text" d="M0 0 m-405 0 a405 405 0 1 1 810 0 a405 405 0 1 1 -810 0"/>
    </defs>
    <g className="mr-outer">
      <circle r="470" className="mr-line" strokeDasharray="2 12"/>
      <circle r="452" className="mr-spectral" stroke="url(#mr-spectral)"/>
      {Array.from({length:120},(_,i)=><line key={i} y1="-440" y2={i%10?-428:-412} transform={`rotate(${i*3})`} className={i%10?'mr-tick':'mr-tick major'}/>)}
      <text className="mr-text"><textPath href="#mr-text">KAAL DARPAN · THE MIRROR OF TIME · काल दर्पण · HERITAGE ARCHIVE · KAAL DARPAN · THE MIRROR OF TIME · काल दर्पण · HERITAGE ARCHIVE ·</textPath></text>
    </g>
    <g className="mr-inner">
      <circle r="360" className="mr-line"/>
      <circle r="345" className="mr-line" strokeDasharray="60 10 4 10"/>
      {petals.map(a=><path key={a} d="M0 -340 Q26 -290 0 -235 Q-26 -290 0 -340Z" transform={`rotate(${a})`} className="mr-petal"/>)}
      {Array.from({length:12},(_,i)=><text key={i} className="mr-num" x="0" y="-198" transform={`rotate(${i*30})`}>{toDevanagari(i||12)}</text>)}
      <circle r="170" className="mr-line" strokeDasharray="1 6"/>
    </g>
  </svg>;
}

/** Faint jaali lattice texture used behind glass panels. */
export function JaaliTexture({className=''}){
  return <svg className={className} aria-hidden="true" focusable="false" width="100%" height="100%">
    <defs>
      <pattern id="jaali" width="56" height="56" patternUnits="userSpaceOnUse">
        <path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke="#c9a86a" strokeWidth=".8"/>
        <circle cx="28" cy="28" r="9" fill="none" stroke="#c9a86a" strokeWidth=".8"/>
        <path d="M28 19 Q34 28 28 37 Q22 28 28 19Z M19 28 Q28 34 37 28 Q28 22 19 28Z" fill="none" stroke="#c9a86a" strokeWidth=".6"/>
        <circle cx="0" cy="0" r="3" fill="#c9a86a"/><circle cx="56" cy="0" r="3" fill="#c9a86a"/><circle cx="0" cy="56" r="3" fill="#c9a86a"/><circle cx="56" cy="56" r="3" fill="#c9a86a"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#jaali)"/>
  </svg>;
}

/** Ashoka-chakra-style wheel used as a faint panel watermark. */
export function Chakra({className=''}){
  return <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
    <circle r="92" fill="none" stroke="#c9a86a" strokeWidth="2"/><circle r="80" fill="none" stroke="#c9a86a" strokeWidth=".8"/>
    {Array.from({length:24},(_,i)=><path key={i} d="M0 -14 L3 -50 L0 -80 L-3 -50Z" transform={`rotate(${i*15})`} fill="#c9a86a"/>)}
    <circle r="14" fill="none" stroke="#c9a86a" strokeWidth="2"/>
  </svg>;
}

/** Small lotus-diamond marker for timelines and rules. */
export function Marker({className=''}){
  return <svg className={className} viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">
    <path d="M0 -10 L10 0 L0 10 L-10 0Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M0 -5 Q4 0 0 5 Q-4 0 0 -5Z" fill="currentColor"/>
  </svg>;
}
