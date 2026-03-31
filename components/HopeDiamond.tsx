'use client';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  hidden?: boolean;
}

const DIM = { sm: 36, md: 72, lg: 120 };

export function HopeDiamond({ size = 'md', pulse = false, hidden = false }: Props) {
  const px = DIM[size];
  const id = `dg-${size}`;
  const id2 = `dg2-${size}`;

  if (hidden) {
    return (
      <span style={{ display:'inline-block', width: px, height: px, opacity: 0.25, filter: 'grayscale(1)' }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
          <polygon points="50,5 95,38 75,95 25,95 5,38" fill="#2a2a3e"/>
          <polygon points="50,5 95,38 75,95 25,95 5,38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7"/>
        </svg>
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-block',
        width: px,
        height: px,
        animation: pulse ? 'diamond-aura 2s ease-in-out infinite' : undefined,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          filter: pulse
            ? 'drop-shadow(0 0 16px rgba(48,112,208,1)) drop-shadow(0 0 40px rgba(20,60,200,0.7))'
            : 'drop-shadow(0 0 10px rgba(48,112,208,0.9)) drop-shadow(0 0 28px rgba(20,60,200,0.5))',
        }}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#0a2060"/>
            <stop offset="28%"  stopColor="#1a4a9a"/>
            <stop offset="52%"  stopColor="#4080e0"/>
            <stop offset="66%"  stopColor="#6090f0"/>
            <stop offset="82%"  stopColor="#2050a0"/>
            <stop offset="100%" stopColor="#0a1840"/>
          </linearGradient>
          <linearGradient id={id2} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(180,220,255,0.55)"/>
            <stop offset="100%" stopColor="rgba(20,60,180,0.1)"/>
          </linearGradient>
        </defs>
        <polygon points="50,5 95,38 75,95 25,95 5,38" fill={`url(#${id})`}/>
        <polygon points="50,5 95,38 50,40" fill={`url(#${id2})`} opacity="0.75"/>
        <polygon points="5,38 50,40 25,95" fill="rgba(20,60,160,0.35)"/>
        <polygon points="95,38 75,95 50,40" fill="rgba(10,30,100,0.45)"/>
        <polygon points="50,5 95,38 75,95 25,95 5,38" fill="none" stroke="rgba(100,160,255,0.5)" strokeWidth="0.7"/>
        <line x1="50" y1="5" x2="50" y2="40" stroke="rgba(150,200,255,0.3)" strokeWidth="0.5"/>
        <line x1="5" y1="38" x2="95" y2="38" stroke="rgba(150,200,255,0.2)" strokeWidth="0.5"/>
      </svg>
    </span>
  );
}
