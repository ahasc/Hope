'use client';

import { useRouter } from 'next/navigation';
import { HopeDiamond } from '@/components/HopeDiamond';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen text-center relative overflow-hidden"
      style={{ background: '#04040f' }}
    >
      {/* Background rays */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'conic-gradient(from 180deg at 50% 110%, transparent 0deg, rgba(20,50,140,0.07) 15deg, transparent 30deg, rgba(20,50,140,0.05) 50deg, transparent 65deg, rgba(20,50,140,0.06) 80deg, transparent 100deg)',
        animation: 'rays-spin 25s linear infinite',
      }} />
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(4,4,15,0.7) 70%, #04040f 100%)',
      }} />

      {/* Diamond */}
      <div className="relative mb-10" style={{ animation: 'diamond-aura 4s ease-in-out infinite' }}>
        <div aria-hidden style={{
          position: 'absolute', width: 200, height: 200,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(48,112,208,0.25) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <HopeDiamond size="lg" />
      </div>

      {/* Title */}
      <div className="relative z-10 px-6">
        <p className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: '#4a4038', letterSpacing: '0.55em' }}>
          Le Diamand Hope
        </p>
        <h1
          className="font-cinzel-decorative font-black leading-none"
          style={{
            fontSize: 'clamp(48px, 10vw, 96px)',
            letterSpacing: '0.16em',
            background: 'linear-gradient(180deg, #fff0c0 0%, #f0d070 20%, #c8a44a 55%, #8b6914 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(200,164,74,0.35))',
          }}
        >
          Hope
        </h1>
        <p className="font-spectral italic text-lg mt-4" style={{ color: '#5a5040', maxWidth: 440, margin: '16px auto 0' }}>
          "Il a traversé les siècles. Il ne vous laissera pas passer."
        </p>
      </div>

      {/* Ornament */}
      <div className="flex items-center gap-3 my-10" style={{ width: 320 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.4))' }}/>
        <div style={{ width: 6, height: 6, background: 'rgba(200,164,74,0.6)', transform: 'rotate(45deg)' }}/>
        <div style={{ width: 4, height: 4, background: 'rgba(200,164,74,0.3)', transform: 'rotate(45deg)' }}/>
        <div style={{ width: 6, height: 6, background: 'rgba(200,164,74,0.6)', transform: 'rotate(45deg)' }}/>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200,164,74,0.4), transparent)' }}/>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex flex-col gap-3 w-full" style={{ maxWidth: 300 }}>
        <button
          onClick={() => router.push('/lobby')}
          className="btn-gold w-full"
          style={{ paddingTop: '1rem', paddingBottom: '1rem', letterSpacing: '0.35em' }}
        >
          Jouer en ligne
          <span className="block font-spectral italic normal-case mt-1" style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.05em' }}>
            3 à 6 joueurs · 45 à 75 min
          </span>
        </button>
      </div>

      {/* Footer info */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-10" style={{ zIndex: 10 }}>
        {[['3–6','Joueurs'],['45\'','Durée'],['12+','Âge'],['8','Tours']].map(([val, lbl]) => (
          <div key={lbl} className="text-center">
            <div className="font-cinzel font-bold" style={{ color: '#c8a44a', fontSize: '1.3rem' }}>{val}</div>
            <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#4a4038', fontSize: '1rem', marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
