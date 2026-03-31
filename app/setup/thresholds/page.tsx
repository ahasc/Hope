'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, useGameActions, usePhase } from '@/store/gameStore';
import { usePlayerId } from '@/store/sessionStore';
import { CHARACTERS } from '@/lib/gameData';
import { IconHourglass, IconCheck } from '@/components/GameIcons';

export default function ThresholdsPage() {
  const router = useRouter();
  const actions = useGameActions();
  const phase = usePhase();
  const playerId = usePlayerId();
  const players = useGameStore((s) => s.players);
  const [confirmed, setConfirmed] = useState(false);

  // Auto-navigate when phase advances
  useEffect(() => {
    if (phase === 'accumulation') {
      router.push('/game/accumulation');
    }
  }, [phase, router]);

  const ownPlayer = players.find((p) => p.id === playerId);

  if (!ownPlayer) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#02020a' }}>
        <div className="text-center">
          <div style={{ marginBottom: 24 }}><IconHourglass size={48} color="#4a4038" /></div>
          <p className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#4a4038', letterSpacing: '0.4em', fontSize: '1rem' }}>
            Identification en cours...
          </p>
        </div>
      </main>
    );
  }

  const char = CHARACTERS[ownPlayer.character];
  const isHeritier = ownPlayer.character === 'heritier';

  function handleConfirm() {
    actions.confirmThreshold(ownPlayer!.id, ownPlayer!.threshold);
    setConfirmed(true);
  }

  const THRESHOLD_DESCS: Record<number, string> = {
    4: "Risqué — Vous explosez vite, mais les autres ne s'y attendent pas.",
    5: 'Prudent — Vous pouvez encaisser un tour de plus avant de vous effondrer.',
  };

  if (confirmed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#02020a' }}>
        <div className="text-center" style={{ maxWidth: 380 }}>
          <div style={{ marginBottom: 24 }}><IconCheck size={48} color="#c8a44a" /></div>
          <div
            className="font-cinzel font-semibold mb-2"
            style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(180deg, #f0d070 0%, #c8a44a 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            Seuil enregistré
          </div>
          <p className="font-spectral italic text-sm mt-3 mb-8" style={{ color: '#5a5040', lineHeight: 1.7 }}>
            En attente que tous les joueurs confirment leur seuil secret. La partie démarrera automatiquement.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            border: '1px solid rgba(200,164,74,0.2)',
            background: 'rgba(200,164,74,0.04)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8a44a', animation: 'hint-blink 1.5s ease-in-out infinite' }} />
            <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
              En attente des autres joueurs
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#02020a' }}>
      <div
        style={{
          width: '100%', maxWidth: 340,
          background: 'linear-gradient(160deg, #0d0d22 0%, #080818 60%)',
          border: '1px solid rgba(200,164,74,0.2)',
          padding: 32, position: 'relative',
        }}
      >
        {/* Corner decorations */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={`${v}-${h}`} style={{
            position: 'absolute', [v]: 16, [h]: 16, width: 16, height: 16,
            borderTop: v === 'top' ? '1px solid rgba(200,164,74,0.25)' : 'none',
            borderBottom: v === 'bottom' ? '1px solid rgba(200,164,74,0.25)' : 'none',
            borderLeft: h === 'left' ? '1px solid rgba(200,164,74,0.25)' : 'none',
            borderRight: h === 'right' ? '1px solid rgba(200,164,74,0.25)' : 'none',
          }} />
        ))}

        <div
          className="font-cinzel font-semibold text-center mb-1"
          style={{
            fontSize: '1.6rem',
            background: 'linear-gradient(180deg, #f0d070 0%, #c8a44a 60%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          {ownPlayer.name}
        </div>
        <p className="font-spectral italic text-center mb-1" style={{ color: '#60584a', fontSize: '1rem' }}>
          {char.name}
        </p>
        <p className="font-spectral italic text-center mb-8" style={{ color: '#4a4038', fontSize: '0.95rem' }}>
          {isHeritier ? 'Votre seuil est fixé à 3 — public' : 'Votre Seuil de Malédiction a été tiré aléatoirement'}
        </p>

        <div className="text-center mb-6">
          <div
            className="font-cinzel font-black"
            style={{
              fontSize: '5rem', lineHeight: 1,
              background: 'linear-gradient(180deg, #c080ff 0%, #8040c0 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 14px rgba(120,40,200,0.4))',
            }}
          >
            {ownPlayer.threshold}
          </div>
          <p className="font-spectral italic text-xs mt-3" style={{ color: '#6040a0', lineHeight: 1.6 }}>
            {isHeritier ? 'Seuil fixe — tous les joueurs le savent.' : THRESHOLD_DESCS[ownPlayer.threshold] ?? ''}
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={false}
          className="btn-gold w-full"
          style={{ letterSpacing: '0.3em' }}
        >
          Confirmer
        </button>

        <p className="font-cinzel text-xs tracking-widest text-center mt-4" style={{ color: '#3a3028', letterSpacing: '0.2em', fontSize: '1rem', textTransform: 'uppercase' }}>
          {isHeritier ? 'Votre seuil est public' : 'Ne montrez pas votre seuil aux autres joueurs'}
        </p>
      </div>
    </main>
  );
}
