'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, useGameActions, usePlayers, useCurrentTurn } from '@/store/gameStore';
import { useIsHost, usePlayerId } from '@/store/sessionStore';
import { useMarketTimer } from '@/hooks/useMarketTimer';
import { TransactionPanel } from '@/components/TransactionPanel';
import { CHARACTERS } from '@/lib/gameData';
import { IconZap, IconScoreboard, IconSilent, IconLivres, IconFaveurs, IconSecrets, IconDiamond } from '@/components/GameIcons';

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function MarcheNoirPage() {
  const router = useRouter();
  const actions = useGameActions();
  const players = usePlayers();
  const turn = useCurrentTurn();
  const marketTimerStart = useGameStore((s) => s.marketTimerStart);
  const silentOffers = useGameStore((s) => s.silentOffers);
  const marketStep = useGameStore((s) => s.marketStep);
  const timer = useMarketTimer();
  const [offersRevealed, setOffersRevealed] = useState(false);
  const [activeTab, setActiveTab] = useState<'marche' | 'transactions'>('marche');
  const isHost = useIsHost();
  const playerId = usePlayerId();

  const alive = players.filter((p) => p.isAlive);
  const isReady = !!playerId && silentOffers[playerId] === '__ready__';
  const readyCount = alive.filter((p) => silentOffers[p.id] === '__ready__').length;
  const marchand = players.find((p) => p.character === 'marchand' && p.isAlive);
  const ownPlayer = alive.find((p) => p.id === playerId);
  const isStarted = !!marketTimerStart;

  const urgent = timer.remaining < 30000;
  const timerColor = urgent ? '#cc3030' : timer.remaining < 60000 ? '#d4a020' : '#f0d070';

  const phaseDone = timer.step === 'silent' && offersRevealed ? false : timer.step !== 'silent';
  const silentDone = offersRevealed || phaseDone;

  function handleStart() { actions.startMarket(); }
  function handleReveal() { actions.openMarket(); setOffersRevealed(true); }
  function handleClose() { actions.closeMarket(); router.push('/game/legs'); }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#04040f' }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5"
        style={{ borderBottom: '1px solid rgba(200,164,74,0.1)' }}
      >
        <div>
          <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em' }}>
            Tour {turn} · Phase 2
          </div>
          <h2 className="font-cinzel text-2xl font-semibold mt-1" style={{ color: '#c8a44a' }}>
            Le Marché Noir
          </h2>
        </div>

        {/* Timer central */}
        {isStarted && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex overflow-hidden"
              style={{ border: '1px solid rgba(200,164,74,0.2)' }}
            >
              {[
                { key: 'silent', label: '30s — Offres silencieuses', done: silentDone },
                { key: 'open',   label: '2:30 — Négociation libre', done: timer.step === 'closed' },
              ].map(({ key, label, done }) => (
                <div
                  key={key}
                  className="font-cinzel text-xs"
                  style={{
                    padding: '4px 14px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.2em',
                    borderRight: '1px solid rgba(200,164,74,0.15)',
                    color: done ? '#3a3028' : timer.step === key ? '#c8a44a' : '#60584a',
                    background: timer.step === key ? 'rgba(200,164,74,0.08)' : 'none',
                    textDecoration: done ? 'line-through' : 'none',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            {timer.step !== 'closed' ? (
              <>
                <div
                  className="font-cinzel font-black tabular-nums"
                  style={{
                    fontSize: '3rem',
                    color: timerColor,
                    lineHeight: 1,
                    animation: urgent ? 'timer-urgent 1s ease-in-out infinite' : undefined,
                  }}
                >
                  {fmt(timer.remaining)}
                </div>
                <div
                  style={{
                    width: 160, height: 2,
                    background: 'rgba(200,164,74,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, rgba(200,164,74,0.5), ${urgent ? '#cc3030' : '#c8a44a'})`,
                      width: `${(1 - timer.progress) * 100}%`,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="font-cinzel font-bold" style={{ color: '#cc3030', fontSize: '1.2rem' }}>
                MARCHÉ FERMÉ
              </div>
            )}
          </div>
        )}

        <div className="font-cinzel text-xs tracking-widest" style={{ color: '#60584a', fontSize: '0.95rem' }}>
          Tour {turn} / 8
        </div>
      </header>

      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid rgba(200,164,74,0.1)' }}
      >
        {(['marche', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="font-cinzel text-xs tracking-widest uppercase px-8 py-3 transition-colors"
            style={{
              fontSize: '0.95rem',
              letterSpacing: '0.3em',
              color: activeTab === tab ? '#c8a44a' : '#60584a',
              background: activeTab === tab ? 'rgba(200,164,74,0.05)' : 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid rgba(200,164,74,0.5)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab === 'marche' ? 'Marché' : 'Échanges manuels'}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <div className="p-8 max-w-2xl">
          <TransactionPanel />
        </div>
      )}

      {activeTab === 'marche' && (
        <>
          {!isStarted ? (
            /* Pre-start: silent offers input */
            <div className="flex-1 flex flex-col items-center justify-center px-10 py-8">
              <div style={{ maxWidth: 560, width: '100%' }}>
                <p
                  className="font-spectral italic text-sm mb-6"
                  style={{ color: '#5a5040', textAlign: 'center', lineHeight: 1.7 }}
                >
                  Soumettez secrètement votre offre initiale. L'hôte démarre le marché quand tout le monde est prêt.
                </p>

                {/* Own offer input */}
                {ownPlayer && (
                  <div className="flex flex-col gap-2 mb-6">
                    <label className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
                      Votre offre silencieuse ({ownPlayer.name})
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 3 Livres + 1 Faveur (optionnel)..."
                      value={silentOffers[ownPlayer.id] ?? ''}
                      onChange={(e) => actions.setSilentOffer(ownPlayer.id, e.target.value)}
                      className="input-dark w-full font-spectral"
                      style={{ fontSize: '1rem' }}
                    />
                    <p className="font-spectral italic text-xs" style={{ color: '#4a4038' }}>
                      Ne montrez pas ceci aux autres joueurs.
                    </p>
                  </div>
                )}

                {/* Offers submitted count */}
                <div
                  className="flex items-center justify-between p-3 mb-6"
                  style={{ border: '1px solid rgba(200,164,74,0.1)', background: 'rgba(200,164,74,0.03)' }}
                >
                  <span className="font-spectral italic text-sm" style={{ color: '#5a5040' }}>
                    Offres soumises
                  </span>
                  <span className="font-cinzel font-bold" style={{ color: '#c8a44a' }}>
                    {Object.values(silentOffers).filter(Boolean).length} / {alive.length}
                  </span>
                </div>

                {isHost && (
                  <div className="flex justify-center">
                    <button onClick={handleStart} className="btn-gold" style={{ paddingLeft: '3rem', paddingRight: '3rem', letterSpacing: '0.35em' }}>
                      Démarrer le Marché
                    </button>
                  </div>
                )}
                {!isHost && (
                  <p className="font-cinzel text-xs tracking-widest text-center" style={{ color: '#3a3028', letterSpacing: '0.3em', fontSize: '0.95rem' }}>
                    En attente que l'hôte démarre le marché...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Silent offers reveal */}
              {offersRevealed && Object.values(silentOffers).some(Boolean) && (
                <div
                  className="flex items-start gap-4 mx-10 mt-5 p-4"
                  style={{ border: '1px solid rgba(200,164,74,0.15)', background: 'rgba(200,164,74,0.03)' }}
                >
                  <IconSilent size={20} style={{ flexShrink: 0 }} />
                  <div className="flex-1">
                    <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#c8a44a', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
                      Offres silencieuses révélées
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {alive.map((p) => silentOffers[p.id] ? (
                        <span key={p.id} className="font-spectral italic text-sm" style={{ color: '#9a8070' }}>
                          <span style={{ color: '#c8a44a' }}>{p.name}</span> : {silentOffers[p.id]}
                        </span>
                      ) : null)}
                    </div>
                  </div>
                  <span
                    className="font-cinzel text-xs tracking-widest uppercase"
                    style={{
                      padding: '5px 14px',
                      border: '1px solid rgba(200,164,74,0.3)',
                      color: '#c8a44a',
                      fontSize: '0.95rem',
                      background: 'rgba(200,164,74,0.06)',
                    }}
                  >
                    Libres
                  </span>
                </div>
              )}

              {!offersRevealed && timer.step === 'silent' && isHost && (
                <div className="flex justify-center mt-4">
                  <button onClick={handleReveal} className="btn-ghost-dark text-xs">
                    Révéler les offres maintenant
                  </button>
                </div>
              )}

              {/* Players grid */}
              <div
                className="grid gap-4 p-10 flex-1"
                style={{ gridTemplateColumns: `repeat(${Math.min(alive.length, 5)}, 1fr)` }}
              >
                {alive.map((p) => {
                  const pc = CHARACTERS[p.character];
                  const isHolder = p.isHopeHolder;
                  const curseRisk = p.curseTokens / p.threshold;

                  return (
                    <div
                      key={p.id}
                      style={{
                        background: 'linear-gradient(160deg, #0a0a1e 0%, #070714 100%)',
                        border: isHolder ? '1px solid rgba(48,112,208,0.5)' : '1px solid rgba(200,164,74,0.12)',
                        position: 'relative',
                      }}
                    >
                      {isHolder && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(48,112,208,0.8), transparent)' }}/>
                      )}

                      {/* Header */}
                      <div
                        className="flex items-start justify-between p-3 pb-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div>
                          <span
                            className="font-cinzel text-sm font-semibold block"
                            style={{ color: isHolder ? '#80b0ff' : '#f0d070' }}
                          >
                            {p.name}
                          </span>
                          <span className="font-spectral italic text-xs" style={{ color: '#60584a' }}>
                            {pc.name}
                          </span>
                        </div>
                        {isHolder && <IconDiamond size={18} color="#3070d0" style={{ filter: 'drop-shadow(0 0 6px rgba(48,112,208,0.8))' }} />}
                      </div>

                      {/* Resources */}
                      <div className="p-3 flex flex-col gap-2">
                        {([
                          [<IconLivres size={14} />, p.livres, 'Livres', '#c8a44a'],
                          [<IconFaveurs size={14} />, p.faveurs, 'Faveurs', '#60c060'],
                          [<IconSecrets size={14} />, p.maniganceCards.length + p.intelCards.length, 'Cartes', '#c06060'],
                        ] as [React.ReactNode, number, string, string][]).map(([icon, val, label, color]) => (
                          <div key={String(label)} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#60584a' }}>
                              <span>{icon}</span>
                              <span className="font-spectral italic">{label}</span>
                            </div>
                            <span className="font-cinzel font-bold text-sm" style={{ color }}>
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Scores */}
                      <div
                        className="flex"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div className="flex-1 text-center py-3">
                          <span className="font-cinzel font-bold block" style={{ fontSize: '1.2rem', color: '#c8a44a' }}>{p.glory}</span>
                          <span className="font-cinzel text-xs" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Gloire</span>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }}/>
                        <div className="flex-1 text-center py-3">
                          <span
                            className="font-cinzel font-bold block"
                            style={{ fontSize: '1.2rem', color: curseRisk >= 0.8 ? '#cc3030' : '#7020c0' }}
                          >
                            {p.curseTokens}
                          </span>
                          <span className="font-cinzel text-xs" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Malédiction</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-10 py-4 mt-auto"
        style={{ borderTop: '1px solid rgba(200,164,74,0.1)' }}
      >
        <div className="font-spectral italic text-sm" style={{ color: '#4a4038' }}>
          {timer.step !== 'closed' && isStarted
            ? "Le sablier s'arrête à la fin du décompte. Les transactions non finalisées sont annulées."
            : 'Finalisez les derniers échanges avant de passer au Legs.'}
        </div>
        <div className="flex items-center gap-3">
          {/* Ready-up during open phase */}
          {isStarted && timer.step === 'open' && playerId && (
            <button
              onClick={() => actions.setSilentOffer(playerId, isReady ? '' : '__ready__')}
              className="btn-ghost-dark text-xs"
              style={{
                color: isReady ? '#40c860' : '#60584a',
                borderColor: isReady ? 'rgba(60,180,80,0.4)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {isReady ? '✓ Prêt' : 'Terminer mes échanges'}
            </button>
          )}
          {isStarted && timer.step === 'open' && (
            <span className="font-cinzel text-xs" style={{ color: readyCount === alive.length ? '#40c860' : '#60584a', letterSpacing: '0.15em' }}>
              {readyCount}/{alive.length} prêts
            </span>
          )}

          {isHost && marchand && isStarted && (
            <button
              onClick={() => { actions.marchandForceAuction(); router.push('/game/legs'); }}
              className="btn-ghost-dark text-xs"
              style={{ color: '#d4a020', borderColor: 'rgba(200,164,74,0.3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconZap size={14} />Enchère Forcée (Marchand)</span>
            </button>
          )}
          {isHost && (
            <button onClick={handleClose} className="btn-gold" style={{ letterSpacing: '0.3em' }}>
              Passer au Legs →
            </button>
          )}
          {!isHost && (
            <span className="font-cinzel text-xs tracking-widest" style={{ color: '#3a3028', fontSize: '0.95rem', letterSpacing: '0.3em', alignSelf: 'center' }}>
              En attente de l'hôte...
            </span>
          )}
        </div>
      </footer>
    </main>
  );
}
