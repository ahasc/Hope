'use client';

import { useRouter } from 'next/navigation';
import { useGameStore, useGameActions, usePlayers, useCurrentTurn } from '@/store/gameStore';
import { CHARACTERS } from '@/lib/gameData';
import { IconVictory, IconGloire, IconSkull, IconAristocrate } from '@/components/GameIcons';

const CONFETTI = [
  { left: '5%', duration: '4s', delay: '0s', width: 3, height: 3 },
  { left: '15%', duration: '5s', delay: '0.5s', width: 2, height: 6 },
  { left: '28%', duration: '3.5s', delay: '1s', width: 3, height: 3 },
  { left: '42%', duration: '6s', delay: '0.2s', width: 4, height: 4 },
  { left: '58%', duration: '4.5s', delay: '1.5s', width: 3, height: 3 },
  { left: '70%', duration: '5.5s', delay: '0.8s', width: 3, height: 3 },
  { left: '82%', duration: '4s', delay: '2s', width: 2, height: 8 },
  { left: '92%', duration: '3.8s', delay: '0.3s', width: 3, height: 3 },
  { left: '35%', duration: '7s', delay: '1.2s', width: 3, height: 3 },
  { left: '65%', duration: '4.2s', delay: '2.5s', width: 5, height: 2 },
];

export default function EndPage() {
  const router = useRouter();
  const actions = useGameActions();
  const players = usePlayers();
  const turn = useCurrentTurn();
  const { victory } = useGameStore((s) => ({ victory: s.victory }));

  const winner = victory?.winnerId ? players.find((p) => p.id === victory.winnerId) : null;
  const winnerChar = winner ? CHARACTERS[winner.character] : null;

  const standings = players
    .map((p) => {
      const receleurBonus = p.character === 'receleur' && p.receleurHasConcealed && !p.receleurDetected ? 3 : 0;
      const aristocratePenalty = p.character === 'aristocrate' && !p.aristocrateHeldTwoConsecutive && p.isAlive ? -2 : 0;
      const curseOverflow = p.isAlive ? Math.max(0, p.curseTokens - p.threshold) : 0;
      const gloryAfterChar = Math.max(0, p.glory + receleurBonus + aristocratePenalty);
      const cursePenalty = curseOverflow > 0
        ? -Math.min(gloryAfterChar, Math.ceil(gloryAfterChar * curseOverflow / p.threshold))
        : 0;
      return {
        ...p,
        finalGlory: Math.max(0, gloryAfterChar + cursePenalty),
        receleurBonus,
        aristocratePenalty,
        cursePenalty,
      };
    })
    .sort((a, b) => {
      if (!a.isAlive && b.isAlive) return 1;
      if (a.isAlive && !b.isAlive) return -1;
      return b.finalGlory - a.finalGlory;
    });

  const lastHolder = players.find((p) => p.isHopeHolder);

  const rankColors = ['#f0d070', '#c0c0c0', '#c08040'];

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#03030c', overflowX: 'hidden' }}>

      {/* Background aura */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(30,20,5,0.5) 0%, transparent 70%)',
      }} />

      {/* Confetti */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.left,
              top: 0,
              width: c.width,
              height: c.height,
              background: i % 3 === 0 ? 'rgba(200,164,74,0.5)' : i % 3 === 1 ? 'rgba(180,140,40,0.6)' : '#c8a44a',
              transform: 'rotate(45deg)',
              animation: `confetti-fall ${c.duration} linear ${c.delay} infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header
        className="flex items-center justify-between px-12 py-6 relative z-10"
        style={{ borderBottom: '1px solid rgba(200,164,74,0.1)' }}
      >
        <div
          className="font-cinzel font-black"
          style={{ fontSize: '1.25rem', color: '#c8a44a', letterSpacing: '0.15em' }}
        >
          Hope
        </div>
        <div
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.3em' }}
        >
          Fin de partie · Tour {turn}
        </div>
      </header>

      {/* Winner spotlight */}
      <div className="relative z-10 text-center" style={{ padding: '64px 48px 48px' }}>
        <div
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.6em', marginBottom: 16 }}
        >
          Et il ne reste qu'un·e
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 12,
          filter: 'drop-shadow(0 0 20px rgba(200,164,74,0.6))',
          animation: 'gold-pulse 3s ease-in-out infinite',
        }}>
          <IconAristocrate size={64} color="#c8a44a" />
        </div>

        {winner && winnerChar ? (
          <>
            <div
              className="font-cinzel font-black"
              style={{
                fontSize: '4rem',
                letterSpacing: '0.1em',
                lineHeight: 1,
                background: 'linear-gradient(180deg, #fff8e0 0%, #f0d070 25%, #c8a44a 60%, #8b6914 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(200,164,74,0.4))',
              }}
            >
              {winner.name}
            </div>
            <div className="font-spectral italic mt-2" style={{ fontSize: '1.4rem', color: '#60584a' }}>
              {winnerChar.name}
            </div>
            <div
              className="inline-flex items-center gap-2 font-cinzel text-xs tracking-widest uppercase"
              style={{
                marginTop: 20,
                padding: '10px 24px',
                border: '1px solid rgba(200,164,74,0.35)',
                background: 'rgba(200,164,74,0.07)',
                color: '#c8a44a',
                fontSize: '1rem',
                letterSpacing: '0.25em',
              }}
            >
              {victory?.type === 'survie'
                ? <><IconVictory size={16} color="#c8a44a" style={{ display: 'inline', marginRight: 6 }} />Victoire de Survie</>
                : <><IconGloire size={16} color="#c8a44a" style={{ display: 'inline', marginRight: 6 }} />Victoire en Gloire</>}
            </div>
            {victory?.reason && (
              <p className="font-spectral italic mt-6" style={{ color: '#5a5040', fontSize: '1.1rem', maxWidth: 500, margin: '24px auto 0', lineHeight: 1.7 }}>
                "{victory.reason}"
              </p>
            )}
          </>
        ) : (
          <div className="font-cinzel text-2xl font-semibold" style={{ color: '#c8a44a' }}>
            Fin de Partie
          </div>
        )}
      </div>

      {/* Ornament */}
      <div className="relative z-10 flex items-center justify-center gap-3" style={{ margin: '0 48px 40px' }}>
        <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.3))' }} />
        <div style={{ width: 8, height: 8, background: 'rgba(200,164,74,0.5)', transform: 'rotate(45deg)' }} />
        <div style={{ width: 5, height: 5, background: 'rgba(200,164,74,0.3)', transform: 'rotate(45deg)' }} />
        <div style={{ width: 8, height: 8, background: 'rgba(200,164,74,0.5)', transform: 'rotate(45deg)' }} />
        <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(90deg, rgba(200,164,74,0.3), transparent)' }} />
      </div>

      {/* Final curse notice */}
      {lastHolder && lastHolder.id !== winner?.id && (
        <div className="relative z-10" style={{ maxWidth: 900, margin: '0 auto 40px', width: '100%', padding: '0 48px' }}>
          <div
            className="flex items-center gap-4"
            style={{
              border: '1px solid rgba(160,30,30,0.3)',
              background: 'rgba(40,0,0,0.2)',
              padding: '16px 20px',
            }}
          >
            <IconSkull size={24} color="#cc3030" />
            <p className="font-spectral text-sm" style={{ color: '#a06060', lineHeight: 1.6 }}>
              <strong className="font-cinzel" style={{ color: '#e06060' }}>Malédiction du dernier détenteur :</strong>{' '}
              {lastHolder.name} tenait le Hope au moment de la fin de partie et a subi les conséquences finales de la malédiction.
            </p>
          </div>
        </div>
      )}

      {/* Final scores */}
      <div className="relative z-10" style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 48px 48px' }}>
        <div
          className="font-cinzel text-xs tracking-widest uppercase text-center mb-6"
          style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.5em' }}
        >
          Décompte final
        </div>

        <div className="flex flex-col gap-2">
          {standings.map((p, i) => {
            const char = CHARACTERS[p.character];
            const isWinner = p.id === winner?.id;
            const rankColor = rankColors[i] ?? '#3a3028';

            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 80px 80px 80px 120px',
                  alignItems: 'center',
                  background: '#070712',
                  border: `1px solid ${isWinner ? 'rgba(200,164,74,0.4)' : !p.isAlive ? 'rgba(160,30,30,0.2)' : 'rgba(200,164,74,0.1)'}`,
                  position: 'relative',
                  opacity: !p.isAlive ? 0.4 : 1,
                }}
              >
                {/* Gold left bar for winner */}
                {isWinner && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#c8a44a' }} />
                )}

                {/* Rank */}
                <div
                  className="font-cinzel font-bold text-center"
                  style={{ padding: '14px 0', fontSize: '1rem', color: rankColor }}
                >
                  {i + 1}
                </div>

                {/* Name/role */}
                <div style={{ padding: '14px 16px' }}>
                  <span className="font-cinzel text-sm block" style={{ color: isWinner ? '#f0d070' : !p.isAlive ? '#6a4040' : '#d8d0c0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.name}
                    {!p.isAlive && <IconSkull size={14} color="#cc3030" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />}
                  </span>
                  <span className="font-spectral italic text-xs" style={{ color: '#60584a' }}>{char.name}</span>
                </div>

                {/* Glory */}
                <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                  <span className="font-cinzel font-bold block" style={{ fontSize: '1.35rem', color: isWinner ? '#f0d070' : !p.isAlive ? '#6a4040' : '#c8a44a' }}>
                    {p.glory}
                  </span>
                  <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Gloire</span>
                </div>

                {/* Curse */}
                <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                  <span className="font-cinzel font-bold block" style={{ fontSize: '1.35rem', color: '#7020c0' }}>
                    {p.curseTokens}
                  </span>
                  <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Malédiction</span>
                </div>

                {/* Bonus/Penalty */}
                <div style={{ padding: '14px 12px', textAlign: 'center' }}>
                  {p.receleurBonus > 0 ? (
                    <>
                      <span className="font-cinzel font-bold block" style={{ fontSize: '1.35rem', color: '#60c060' }}>
                        +{p.receleurBonus}
                      </span>
                      <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Receleur</span>
                    </>
                  ) : p.cursePenalty < 0 ? (
                    <>
                      <span className="font-cinzel font-bold block" style={{ fontSize: '1.35rem', color: '#cc3030' }}>
                        {p.cursePenalty}
                      </span>
                      <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Malédiction</span>
                    </>
                  ) : p.aristocratePenalty < 0 ? (
                    <>
                      <span className="font-cinzel font-bold block" style={{ fontSize: '1.35rem', color: '#cc3030' }}>
                        {p.aristocratePenalty}
                      </span>
                      <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Aristocrate</span>
                    </>
                  ) : (
                    <span className="font-cinzel font-bold block" style={{ fontSize: '1.35rem', color: '#3a3028' }}>—</span>
                  )}
                </div>

                {/* Total */}
                <div style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <span
                    className="font-cinzel font-black block"
                    style={{
                      fontSize: '1.6rem',
                      color: isWinner ? '#f0d070' : !p.isAlive ? '#6a4040' : '#d8d0c0',
                      filter: isWinner ? 'drop-shadow(0 0 8px rgba(200,164,74,0.5))' : undefined,
                    }}
                  >
                    {p.finalGlory}
                  </span>
                  <span className="font-cinzel text-xs block mt-0.5" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {!p.isAlive ? 'Éliminé' : 'Points totaux'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <footer
        className="relative z-10 flex items-center justify-center gap-5 mt-auto"
        style={{ padding: '32px 48px', borderTop: '1px solid rgba(200,164,74,0.1)' }}
      >
        <button
          onClick={() => { actions.resetGame(); router.push('/'); }}
          className="btn-gold"
          style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', letterSpacing: '0.3em', fontSize: '1rem' }}
        >
          Nouvelle Partie
        </button>
      </footer>

      <p className="relative z-10 text-center font-spectral italic pb-8" style={{ color: '#3a3028', fontSize: '0.95rem' }}>
        Le diamant attend sa prochaine victime.
      </p>
    </main>
  );
}
