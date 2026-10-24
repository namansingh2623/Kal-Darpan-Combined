// Procedural SVG artwork for the three halls plus the artifact glyphs. No external assets.

function Defs({ id, p }) {
  return (
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.sky[0]} />
        <stop offset="1" stopColor={p.sky[1]} />
      </linearGradient>
      <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.stone} />
        <stop offset="1" stopColor={p.shade} />
      </linearGradient>
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.shade} stopOpacity=".55" />
        <stop offset="1" stopColor={p.floor} />
      </linearGradient>
      <radialGradient id={`${id}-moon`}>
        <stop offset="0" stopColor={p.glow} stopOpacity=".9" />
        <stop offset=".35" stopColor={p.glow} stopOpacity=".18" />
        <stop offset="1" stopColor={p.glow} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-vig`} cx=".5" cy=".5" r=".75">
        <stop offset=".45" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".75" />
      </radialGradient>
    </defs>
  );
}

const stars = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 389) % 1600,
  y: (i * 197) % 420,
  r: 0.6 + ((i * 7) % 5) / 5,
}));

function Backdrop({ id, p }) {
  return (
    <g data-depth="2">
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity=".35" />)}
      <circle cx="1280" cy="170" r="260" fill={`url(#${id}-moon)`} />
      <circle cx="1280" cy="170" r="42" fill={p.glow} opacity=".85" />
    </g>
  );
}

function Floor({ id }) {
  return (
    <g data-depth="6">
      <rect y="690" width="1600" height="210" fill={`url(#${id}-floor)`} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${800 + (i - 4) * 40} 700 L${800 + (i - 4) * 260} 900`} stroke="#fff" strokeOpacity=".05" strokeWidth="2" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1="0" x2="1600" y1={725 + i * i * 9} y2={725 + i * i * 9} stroke="#fff" strokeOpacity=".05" />
      ))}
    </g>
  );
}

// Pointed Mughal arch frame used in the foreground of every hall.
function Frame({ id, p }) {
  const arch = 'M0 900 V260 Q0 90 260 40 Q150 150 150 330 V900Z';
  return (
    <g data-depth="14">
      <path d={arch} fill={p.floor} opacity=".92" />
      <path d={arch} transform="translate(1600 0) scale(-1 1)" fill={p.floor} opacity=".92" />
      <path d="M150 900 V330" stroke={p.stone} strokeOpacity=".28" strokeWidth="3" />
      <path d="M1450 900 V330" stroke={p.stone} strokeOpacity=".28" strokeWidth="3" />
      <path d="M0 40 Q800 -60 1600 40 V0 H0Z" fill={p.floor} />
      <rect width="1600" height="900" fill={`url(#${id}-vig)`} />
    </g>
  );
}

function Taj({ id, p }) {
  const fill = `url(#${id}-stone)`;
  return (
    <>
      <Backdrop id={id} p={p} />
      <g data-depth="5">
        {[520, 1080].map((x) => (
          <g key={x}>
            <rect x={x - 18} y="340" width="36" height="380" fill={fill} />
            <rect x={x - 26} y="320" width="52" height="24" fill={fill} />
            <path d={`M${x - 22} 320 Q${x} 270 ${x + 22} 320Z`} fill={fill} />
            {[400, 470, 540, 610].map((y) => <rect key={y} x={x - 22} y={y} width="44" height="6" fill={p.shade} opacity=".7" />)}
          </g>
        ))}
        <rect x="560" y="500" width="480" height="220" fill={fill} />
        <path d="M640 500 C640 360 740 300 800 230 C860 300 960 360 960 500Z" fill={fill} />
        <line x1="800" y1="190" x2="800" y2="240" stroke={p.stone} strokeWidth="4" />
        <circle cx="800" cy="188" r="6" fill={p.glow} />
        {[600, 1000].map((x) => <path key={x} d={`M${x - 26} 500 Q${x} 430 ${x + 26} 500Z`} fill={fill} />)}
        <path d="M740 720 V610 Q740 550 800 515 Q860 550 860 610 V720Z" fill={p.floor} opacity=".85" />
        {[600, 680, 920, 1000].map((x) => <path key={x} d={`M${x - 16} 700 V610 Q${x - 16} 585 ${x} 575 Q${x + 16} 585 ${x + 16} 610 V700Z`} fill={p.floor} opacity=".55" />)}
      </g>
      <g data-depth="8" opacity=".5">
        <rect x="520" y="720" width="560" height="170" fill={p.glow} opacity=".08" />
        <path d="M640 740 C640 800 740 840 800 880 C860 840 960 800 960 740Z" fill={p.stone} opacity=".18" />
      </g>
      <Floor id={id} />
      <Frame id={id} p={p} />
    </>
  );
}

function Qutub({ id, p }) {
  const fill = `url(#${id}-stone)`;
  const tiers = [
    { y: 700, h: 120, w: 150, t: 128 },
    { y: 580, h: 110, w: 128, t: 108 },
    { y: 470, h: 100, w: 108, t: 90 },
    { y: 370, h: 80, w: 90, t: 76 },
    { y: 290, h: 70, w: 76, t: 64 },
  ];
  return (
    <>
      <Backdrop id={id} p={p} />
      <g data-depth="4" opacity=".6">
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${60 + i * 120} 720 V560 Q${60 + i * 120} 480 ${120 + i * 120} 450 Q${180 + i * 120} 480 ${180 + i * 120} 560 V720Z`} fill={p.shade} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${920 + i * 120} 720 V560 Q${920 + i * 120} 480 ${980 + i * 120} 450 Q${1040 + i * 120} 480 ${1040 + i * 120} 560 V720Z`} fill={p.shade} />
        ))}
      </g>
      <g data-depth="6">
        {tiers.map((t, i) => (
          <g key={i}>
            <path d={`M${800 - t.w / 2} ${t.y} L${800 - t.t / 2} ${t.y - t.h} H${800 + t.t / 2} L${800 + t.w / 2} ${t.y}Z`} fill={fill} />
            {Array.from({ length: 5 }, (_, k) => (
              <line key={k} x1={800 - t.w / 2 + (k + 1) * (t.w / 6)} x2={800 - t.t / 2 + (k + 1) * (t.t / 6)} y1={t.y} y2={t.y - t.h} stroke="#000" strokeOpacity=".25" strokeWidth="2" />
            ))}
            <rect x={800 - t.t / 2 - 8} y={t.y - t.h - 8} width={t.t + 16} height="12" fill={p.shade} />
            <rect x={800 - t.t / 2 + 6} y={t.y - t.h + 22} width={t.t - 12} height="5" fill={p.glow} opacity=".3" />
          </g>
        ))}
        <path d="M770 290 Q800 220 830 290Z" fill={fill} />
        <rect x="372" y="520" width="14" height="200" fill="#2b2420" />
        <rect x="364" y="508" width="30" height="16" fill="#2b2420" />
      </g>
      <Floor id={id} />
      <Frame id={id} p={p} />
    </>
  );
}

function Fort({ id, p }) {
  const fill = `url(#${id}-stone)`;
  return (
    <>
      <Backdrop id={id} p={p} />
      <g data-depth="4">
        <rect x="0" y="470" width="1600" height="250" fill={fill} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={i * 40 + 6} y="440" width="26" height="30" fill={fill} />)}
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${60 + i * 160} 720 V600 Q${60 + i * 160} 540 ${100 + i * 160} 520 Q${140 + i * 160} 540 ${140 + i * 160} 600 V720Z`} fill={p.floor} opacity=".55" />)}
      </g>
      <g data-depth="6">
        <rect x="600" y="380" width="400" height="340" fill={fill} />
        <rect x="600" y="372" width="400" height="14" fill={p.shade} />
        {[600, 1000].map((x) => (
          <g key={x}>
            <rect x={x - 24} y="320" width="48" height="400" fill={fill} />
            <path d={`M${x - 30} 320 Q${x} 250 ${x + 30} 320Z`} fill={fill} />
          </g>
        ))}
        <path d="M730 720 V540 Q730 470 800 430 Q870 470 870 540 V720Z" fill={p.floor} opacity=".9" />
        {[690, 910].map((x) => <path key={x} d={`M${x - 18} 600 V520 Q${x - 18} 495 ${x} 485 Q${x + 18} 495 ${x + 18} 520 V600Z`} fill={p.floor} opacity=".6" />)}
        {[660, 800, 940].map((x) => (
          <g key={x}>
            <rect x={x - 20} y="340" width="40" height="30" fill={fill} />
            <path d={`M${x - 24} 340 Q${x} 290 ${x + 24} 340Z`} fill={fill} />
          </g>
        ))}
      </g>
      <Floor id={id} />
      <Frame id={id} p={p} />
    </>
  );
}

export function HallArt({ hall }) {
  const id = `art-${hall.id}`;
  const Scene = { taj: Taj, qutub: Qutub, fort: Fort }[hall.id];
  return (
    <svg className="lore-art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Defs id={id} p={hall.palette} />
      <Scene id={id} p={hall.palette} />
    </svg>
  );
}

const G = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function Glyph({ kind, size = 64 }) {
  const shapes = {
    tile: <><rect x="8" y="8" width="48" height="48" rx="4" {...G} /><circle cx="32" cy="32" r="4" {...G} />{[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="32" cy="19" rx="5" ry="9" transform={`rotate(${a} 32 32)`} {...G} />)}</>,
    brush: <><path d="M12 52 L40 24" {...G} /><path d="M40 24 L52 12 L54 10 L52 20Z" {...G} /><path d="M10 54 Q14 46 20 48" {...G} /></>,
    blueprint: <><rect x="8" y="10" width="48" height="44" {...G} /><path d="M8 24 H56 M8 38 H56 M24 10 V54 M40 10 V54" {...G} strokeOpacity=".5" /><path d="M16 46 Q32 12 48 46" {...G} /></>,
    pillar: <><rect x="24" y="12" width="16" height="42" {...G} /><path d="M18 12 H46 M20 54 H44" {...G} /><path d="M32 6 V12" {...G} /></>,
    script: <><rect x="8" y="14" width="48" height="36" rx="4" {...G} /><path d="M16 36 Q22 22 28 34 T40 30 T50 38 M16 42 H48" {...G} /></>,
    rod: <><rect x="6" y="26" width="52" height="12" {...G} />{[14, 22, 30, 38, 46].map((x) => <path key={x} d={`M${x} 26 V32`} {...G} />)}</>,
    seal: <><circle cx="32" cy="20" r="12" {...G} /><path d="M32 32 V44 M22 52 H42 M26 44 H38" {...G} /><path d="M27 20 H37 M32 15 V25" {...G} /></>,
    cannon: <><path d="M8 30 L44 22 L48 34 L12 42Z" {...G} /><circle cx="36" cy="46" r="9" {...G} /><circle cx="36" cy="46" r="2" {...G} /><path d="M50 26 L58 22" {...G} /></>,
    gem: <><path d="M16 22 L24 10 H40 L48 22 L32 54Z" {...G} /><path d="M16 22 H48 M24 10 L28 22 L32 54 M40 10 L36 22 L32 54" {...G} strokeOpacity=".6" /></>,
  };
  return <svg className="lore-glyph" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">{shapes[kind]}</svg>;
}
