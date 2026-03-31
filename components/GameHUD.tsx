'use client';

import Link from 'next/link';
import { useCurrentTurn, useHolder, usePhase, useGameStore } from '@/store/gameStore';
import { HopeDiamond } from './HopeDiamond';

const PHASE_LABELS: Record<string, string> = {
  accumulation: 'Phase 1 — Accumulation',
  'marche-noir': 'Phase 2 — Marché Noir',
  evenement: 'Phase 3 — Événement Funeste',
  legs: 'Phase 4 — Le Legs',
  end: 'Fin de Partie',
};

const PHASE_NUMS: Record<string, string> = {
  accumulation: '01',
  'marche-noir': '02',
  evenement: '03',
  legs: '04',
};

export function GameHUD() {
  const turn = useCurrentTurn();
  const phase = usePhase();
  const holder = useHolder();
  const eventDeckLen = useGameStore((s) => s.eventDeck.length);

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between gap-4 px-6 py-3"
      style={{
        background: 'rgba(4,4,15,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(200,164,74,0.12)',
      }}
    >
      {/* Left: diamond + phase */}
      <div className="flex items-center gap-3">
        <HopeDiamond size="sm" hidden={holder?.isHidden} />
        <div>
          <div
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: '#c8a44a', opacity: 0.6, letterSpacing: '0.35em', fontSize: '0.6rem' }}
          >
            {PHASE_NUMS[phase] ? `Phase ${PHASE_NUMS[phase]}` : ''}
          </div>
          <div className="font-cinzel text-sm font-semibold" style={{ color: '#c8a44a' }}>
            {PHASE_LABELS[phase] ?? phase}
          </div>
        </div>
      </div>

      {/* Center: holder */}
      {holder && (
        <div className="text-center hidden sm:block">
          <div
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: '#60584a', fontSize: '0.6rem', letterSpacing: '0.35em' }}
          >
            Détenteur du Hope
          </div>
          <div className="font-cinzel text-sm font-bold" style={{ color: '#d8d0c0' }}>
            {holder.isHidden ? '???' : holder.name}
          </div>
        </div>
      )}

      {/* Right: turn + scores */}
      <div className="flex items-center gap-5">
        <div className="text-right">
          <div
            className="font-cinzel text-xs"
            style={{ color: '#60584a', letterSpacing: '0.3em', fontSize: '0.6rem', textTransform: 'uppercase' }}
          >
            Tour
          </div>
          <div className="font-cinzel font-bold" style={{ color: '#c8a44a', fontSize: '1.1rem' }}>
            {turn} / 8
          </div>
        </div>
        <div
          className="text-right"
          style={{ borderLeft: '1px solid rgba(200,164,74,0.1)', paddingLeft: '1.25rem' }}
        >
          <div
            className="font-cinzel text-xs"
            style={{ color: '#60584a', letterSpacing: '0.25em', fontSize: '0.6rem', textTransform: 'uppercase' }}
          >
            Événements
          </div>
          <div
            className="font-cinzel font-semibold"
            style={{ color: eventDeckLen <= 6 ? '#cc3030' : '#8b4040', fontSize: '0.95rem' }}
          >
            {eventDeckLen}
          </div>
        </div>
        <Link
          href="/game/scoreboard"
          className="font-cinzel text-xs tracking-widest uppercase transition-colors"
          style={{
            color: '#60584a',
            letterSpacing: '0.25em',
            fontSize: '0.6rem',
            borderLeft: '1px solid rgba(200,164,74,0.1)',
            paddingLeft: '1.25rem',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#c8a44a')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#60584a')}
        >
          Scores →
        </Link>
      </div>
    </div>
  );
}
