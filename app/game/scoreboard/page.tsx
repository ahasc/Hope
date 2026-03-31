'use client';

import Link from 'next/link';
import { usePlayers, useCurrentTurn, usePhase, useGameStore } from '@/store/gameStore';
import { CHARACTERS, EVENT_CARDS } from '@/lib/gameData';
import { IconWarning, IconSkull, IconDiamond } from '@/components/GameIcons';

const PHASE_ROUTES: Record<string, string> = {
  accumulation: '/game/accumulation',
  'marche-noir': '/game/marche-noir',
  evenement: '/game/evenement',
  legs: '/game/legs',
  end: '/game/end',
};

const TOTAL_EVENTS = EVENT_CARDS.length;

export default function ScoreboardPage() {
  const players = usePlayers();
  const turn = useCurrentTurn();
  const phase = usePhase();
  const eventDeck = useGameStore((s) => s.eventDeck);

  const alive = players.filter((p) => p.isAlive);
  const sorted = [...players].sort((a, b) => {
    if (!a.isAlive && b.isAlive) return 1;
    if (a.isAlive && !b.isAlive) return -1;
    return b.glory - a.glory;
  });

  const backRoute = PHASE_ROUTES[phase] ?? '/game/accumulation';
  const eventsUsed = TOTAL_EVENTS - eventDeck.length;
  const deckLow = eventDeck.length <= 6;

  // Podium top 3 from alive sorted
  const podium = [...players]
    .sort((a, b) => {
      if (!a.isAlive && b.isAlive) return 1;
      if (a.isAlive && !b.isAlive) return -1;
      return b.glory - a.glory;
    })
    .slice(0, Math.min(5, players.length));

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#03030c' }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-12 py-5"
        style={{ borderBottom: '1px solid rgba(200,164,74,0.15)' }}
      >
        <div>
          <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.4em' }}>
            État de la partie
          </div>
          <h2 className="font-cinzel text-2xl font-semibold mt-1" style={{ color: '#c8a44a' }}>
            Tableau de Bord
          </h2>
        </div>

        <div className="flex items-center gap-8">
          {/* Meta stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <span className="font-cinzel font-bold block" style={{ fontSize: '1.4rem', color: '#c8a44a' }}>{turn}</span>
              <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tour actuel</span>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(200,164,74,0.15)' }} />
            <div className="text-center">
              <span className="font-cinzel font-bold block" style={{ fontSize: '1.4rem', color: '#c8a44a' }}>8</span>
              <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tours total</span>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(200,164,74,0.15)' }} />
            <div className="text-center">
              <span className="font-cinzel font-bold block" style={{ fontSize: '1.4rem', color: '#c8a44a' }}>{alive.length}</span>
              <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Joueurs</span>
            </div>
          </div>

          {deckLow && (
            <div
              className="font-cinzel text-xs tracking-widest uppercase"
              style={{
                padding: '8px 18px',
                border: '1px solid rgba(160,60,60,0.4)',
                color: '#c06060',
                background: 'rgba(60,0,0,0.2)',
                fontSize: '0.95rem',
                letterSpacing: '0.2em',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <IconWarning size={14} color="#c06060" /> {eventDeck.length} événements restants
            </div>
          )}
        </div>
      </header>

      {/* Main grid */}
      <div
        className="flex-1 p-10"
        style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}
      >
        {/* Score table */}
        <div className="flex flex-col gap-3">

          {/* Table header */}
          <div
            className="pb-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr 1fr 1fr 1fr 1fr',
              borderBottom: '1px solid rgba(200,164,74,0.15)',
            }}
          >
            {['Joueur', 'Gloire', 'Malédiction', 'Seuil', 'Risque', 'Historique'].map((h, i) => (
              <div
                key={h}
                className="font-cinzel text-xs tracking-widest uppercase"
                style={{
                  color: '#60584a',
                  fontSize: '1rem',
                  letterSpacing: '0.3em',
                  padding: '0 8px',
                  textAlign: i === 0 ? 'left' : 'center',
                  paddingLeft: i === 0 ? 0 : undefined,
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Player rows */}
          {sorted.map((p, i) => {
            const char = CHARACTERS[p.character];
            const cursePercent = Math.min(100, (p.curseTokens / p.threshold) * 100);
            const isDanger = cursePercent >= 80;
            const isMedium = cursePercent >= 60 && !isDanger;
            const isLeader = i === 0 && p.isAlive;
            const isHolder = p.isHopeHolder;

            const dotColor = isHolder ? '#3070d0' : isDanger ? '#cc3030' : isLeader ? '#c8a44a' : '#60584a';
            const dotShadow = isHolder
              ? '0 0 6px rgba(48,112,208,0.7)'
              : isDanger
              ? '0 0 6px rgba(200,30,30,0.7)'
              : isLeader
              ? '0 0 6px rgba(200,164,74,0.7)'
              : undefined;

            const borderColor = isLeader
              ? 'rgba(200,164,74,0.35)'
              : isHolder
              ? 'rgba(48,112,208,0.35)'
              : isDanger
              ? 'rgba(160,20,20,0.35)'
              : 'rgba(200,164,74,0.1)';

            const accentColor = isLeader
              ? 'linear-gradient(180deg, transparent, #c8a44a, transparent)'
              : isHolder
              ? 'linear-gradient(180deg, transparent, #3070d0, transparent)'
              : isDanger
              ? 'linear-gradient(180deg, transparent, #cc3030, transparent)'
              : 'none';

            const riskFillColor = isDanger
              ? 'rgba(200,60,60,0.8)'
              : isMedium
              ? 'rgba(200,164,74,0.7)'
              : 'rgba(60,160,60,0.6)';

            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr 1fr 1fr 1fr 1fr',
                  background: '#070712',
                  border: `1px solid ${borderColor}`,
                  alignItems: 'center',
                  position: 'relative',
                  opacity: p.isAlive ? 1 : 0.4,
                  animation: isDanger && p.isAlive ? 'curse-danger 2s ease-in-out infinite' : undefined,
                }}
              >
                {/* Left accent bar */}
                {(isLeader || isHolder || isDanger) && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accentColor }} />
                )}

                {/* Identity cell */}
                <div style={{ padding: '16px 12px 16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: dotColor,
                    boxShadow: dotShadow,
                    animation: isDanger && p.isAlive ? 'hint-blink 1.5s ease-in-out infinite' : undefined,
                  }} />
                  <div>
                    <span
                      className="font-cinzel text-sm block"
                      style={{ color: isHolder ? '#80b0ff' : isDanger ? '#e08080' : '#d8d0c0', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {p.name}
                      {isHolder && <IconDiamond size={14} color="#80b0ff" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />}
                      {!p.isAlive && <IconSkull size={14} color="#cc3030" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />}
                    </span>
                    <span className="font-spectral italic text-xs block" style={{ color: '#60584a' }}>
                      {char.name}
                    </span>
                  </div>
                </div>

                {/* Glory */}
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <span
                    className="font-cinzel font-bold"
                    style={{
                      fontSize: '1.5rem',
                      color: isHolder ? '#80b0ff' : isLeader ? '#f0d070' : '#c8a44a',
                      filter: isLeader ? 'drop-shadow(0 0 8px rgba(200,164,74,0.4))' : undefined,
                    }}
                  >
                    {p.glory}
                  </span>
                </div>

                {/* Curse */}
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <span
                    className="font-cinzel font-bold"
                    style={{ fontSize: '1.4rem', color: isDanger ? '#cc3030' : '#7020c0' }}
                  >
                    {p.curseTokens}
                  </span>
                </div>

                {/* Threshold */}
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <span
                    className="font-cinzel"
                    style={{
                      fontSize: '1.1rem',
                      color: p.thresholdRevealed
                        ? isDanger ? '#cc4444' : '#9040c0'
                        : '#3a3028',
                    }}
                  >
                    {p.thresholdRevealed
                      ? p.character === 'heritier'
                        ? `${p.threshold} (fixe)`
                        : `${p.threshold} !`
                      : '?'}
                  </span>
                </div>

                {/* Risk bar */}
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{
                    width: '100%', maxWidth: 80, height: 6,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 3, overflow: 'hidden',
                    margin: '0 auto',
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 3,
                      width: `${cursePercent}%`,
                      background: riskFillColor,
                      animation: isDanger ? 'hint-blink 1s ease-in-out infinite' : undefined,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>

                {/* Hope history — turns held */}
                <div style={{ padding: '16px 12px', display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {Array.from({ length: Math.max(turn, 1) }, (_, t) => {
                    const isCurrentHolder = isHolder && t === turn - 1;
                    return (
                      <div
                        key={t}
                        style={{
                          width: 14, height: 14, borderRadius: 2,
                          background: isCurrentHolder
                            ? 'rgba(48,112,208,0.3)'
                            : 'rgba(255,255,255,0.03)',
                          border: isCurrentHolder
                            ? '1px solid rgba(48,112,208,0.4)'
                            : '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {isCurrentHolder ? <IconDiamond size={8} color="#3070d0" /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side panel */}
        <div className="flex flex-col gap-6">

          {/* Event deck */}
          <div
            style={{
              background: '#070712',
              border: '1px solid rgba(200,164,74,0.15)',
              padding: '24px',
            }}
          >
            <div
              className="font-cinzel text-xs tracking-widest uppercase pb-2 mb-4"
              style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.4em', borderBottom: '1px solid rgba(200,164,74,0.1)' }}
            >
              Événements Funestes
            </div>

            {/* Card stack visual */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 16 }}>
              {Array.from({ length: Math.min(eventDeck.length, 6) }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 60 - i * 5,
                    background: 'linear-gradient(180deg, #0e0810 0%, #080008 100%)',
                    border: '1px solid rgba(160,30,30,0.25)',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
              ))}
              {eventDeck.length === 0 && (
                <span className="font-spectral italic text-xs" style={{ color: '#4a4038' }}>Deck vide</span>
              )}
            </div>

            <div className="font-cinzel font-black" style={{ fontSize: '2rem', color: '#8b4040' }}>
              {eventDeck.length}
            </div>
            <div className="font-spectral italic text-sm mt-1" style={{ color: '#60584a' }}>
              restantes sur {TOTAL_EVENTS}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, rgba(160,30,30,0.4), rgba(200,50,50,0.7))',
                borderRadius: 2,
                width: `${(eventsUsed / TOTAL_EVENTS) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Podium */}
          <div
            style={{
              background: '#070712',
              border: '1px solid rgba(200,164,74,0.15)',
              padding: '24px',
            }}
          >
            <div
              className="font-cinzel text-xs tracking-widest uppercase pb-2 mb-4"
              style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.4em', borderBottom: '1px solid rgba(200,164,74,0.1)' }}
            >
              Classement actuel
            </div>

            <div className="flex flex-col gap-2">
              {podium.map((p, i) => {
                const rankColors = ['#f0d070', '#c0c0c0', '#c08040'];
                const rankColor = rankColors[i] ?? '#60584a';
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      opacity: p.isAlive ? 1 : 0.5,
                    }}
                  >
                    <div
                      className="font-cinzel font-black text-center"
                      style={{ fontSize: '1.1rem', width: 30, color: rankColor }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 font-cinzel text-sm" style={{ color: '#d8d0c0' }}>
                      {p.name}
                    </div>
                    <div className="font-cinzel font-bold" style={{ fontSize: '1.25rem', color: '#c8a44a' }}>
                      {p.glory}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="flex items-center justify-end px-10 py-4 gap-3"
        style={{ borderTop: '1px solid rgba(200,164,74,0.1)' }}
      >
        <Link href={backRoute}>
          <button className="btn-gold" style={{ letterSpacing: '0.3em' }}>
            Retour à la partie →
          </button>
        </Link>
      </footer>
    </main>
  );
}
