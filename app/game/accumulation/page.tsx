'use client';

import { useRouter } from 'next/navigation';
import { useGameStore, useGameActions, useHolder, useCurrentTurn } from '@/store/gameStore';
import { useIsHost, usePlayerId } from '@/store/sessionStore';
import { CHARACTERS } from '@/lib/gameData';
import { HopeDiamond } from '@/components/HopeDiamond';
import { IconGloire, IconMalediction, IconLivres, IconWarning, IconZap, IconVision, IconScoreboard } from '@/components/GameIcons';

export default function AccumulationPage() {
  const router = useRouter();
  const actions = useGameActions();
  const holder = useHolder();
  const turn = useCurrentTurn();
  const players = useGameStore((s) => s.players);
  const eventDeck = useGameStore((s) => s.eventDeck);
  const isHost = useIsHost();
  const playerId = usePlayerId();

  if (!holder) return null;

  const char = CHARACTERS[holder.character];
  const isHeritier = holder.character === 'heritier';
  const gloryGain = holder.gloryFrozenTurns > 0 ? 0 : isHeritier ? 2 : 1;
  const livresGain = isHeritier ? 1 : 0;
  const newCurse = holder.curseTokens + 1;
  const threshold = holder.threshold;
  const willTrigger = newCurse >= threshold;

  const medium = players.find((p) => p.character === 'medium' && p.isAlive);
  const nextEvent = eventDeck[0];

  const isAristocrateImmune = holder.character === 'aristocrate' && !holder.aristocrateEventImmunityUsed;

  function handleContinue() {
    if (!holder) return;
    actions.resolveAccumulation();
    if (willTrigger && !isAristocrateImmune && !holder.isHidden) {
      router.push('/game/evenement');
    } else {
      router.push('/game/marche-noir');
    }
  }

  const alive = players.filter((p) => p.isAlive);

  return (
    <main className="min-h-screen" style={{ background: '#04040f' }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: '1fr 400px 1fr',
          gap: 40,
          padding: '40px 48px',
          maxWidth: 1400,
          margin: '0 auto',
          alignItems: 'start',
        }}
      >
        {/* ── Left: mini scores ── */}
        <div className="flex flex-col gap-3 pt-2">
          <div
            className="font-cinzel text-xs tracking-widest uppercase pb-2 mb-1"
            style={{
              color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em',
              borderBottom: '1px solid rgba(200,164,74,0.1)',
            }}
          >
            Joueurs
          </div>

          {alive.map((p) => {
            const pc = CHARACTERS[p.character];
            const isHolder = p.isHopeHolder;
            const isDanger = p.character === 'heritier'
              ? p.curseTokens >= 2
              : p.curseTokens >= 4;

            return (
              <div
                key={p.id}
                className="flex items-center gap-3 transition-all"
                style={{
                  padding: '10px 14px',
                  border: isHolder
                    ? '1px solid rgba(48,112,208,0.45)'
                    : isDanger
                    ? '1px solid rgba(160,20,20,0.4)'
                    : '1px solid rgba(255,255,255,0.05)',
                  background: isHolder
                    ? 'rgba(20,50,120,0.1)'
                    : isDanger
                    ? 'rgba(60,0,0,0.1)'
                    : 'rgba(255,255,255,0.02)',
                  animation: isDanger && !isHolder ? 'curse-danger 2s ease-in-out infinite' : undefined,
                }}
              >
                <div
                  style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: isHolder ? '#3070d0' : isDanger ? '#cc3030' : '#60584a',
                    boxShadow: isHolder ? '0 0 8px rgba(48,112,208,0.8)' : undefined,
                    animation: isHolder ? 'hint-blink 1.5s ease-in-out infinite' : undefined,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-cinzel text-sm font-semibold truncate"
                    style={{ color: isHolder ? '#80b0ff' : '#d8d0c0' }}
                  >
                    {p.name}
                  </div>
                  <div className="font-spectral italic text-xs" style={{ color: '#4a4038' }}>
                    {pc.name}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <IconGloire size={12} color="#c8a44a" />
                    <span className="font-cinzel text-sm font-bold" style={{ color: '#c8a44a' }}>{p.glory}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconMalediction size={12} color="#7020c0" />
                    <span
                      className="font-cinzel text-sm font-bold"
                      style={{ color: isDanger ? '#cc3030' : '#7020c0' }}
                    >
                      {p.curseTokens}
                    </span>
                  </div>
                  {isHolder && (
                    <HopeDiamond size="sm" pulse={willTrigger} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Médium peek — only visible to the medium player */}
          {medium && nextEvent && playerId === medium.id && (
            <div
              className="mt-2 p-3"
              style={{ border: '1px solid rgba(30,150,150,0.3)', background: 'rgba(10,60,60,0.1)' }}
            >
              <div className="font-cinzel text-xs tracking-widest mb-2" style={{ color: '#40a0a0', fontSize: '0.95rem', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconVision size={14} color="#40a0a0" /> Votre vision
              </div>
              <p className="font-spectral italic text-xs" style={{ color: '#406060', lineHeight: 1.5 }}>
                Vous voyez en secret le prochain Événement.
              </p>
              <button
                onClick={() => router.push('/game/private?view=medium')}
                className="btn-ghost-dark mt-2 text-xs"
                style={{ padding: '4px 12px', fontSize: '1rem' }}
              >
                Voir ma vision →
              </button>
            </div>
          )}
        </div>

        {/* ── Center: diamond + holder ── */}
        <div className="flex flex-col items-center gap-7">
          <div className="text-center">
            <div className="font-cinzel text-xl font-semibold" style={{ color: '#c8a44a' }}>
              Accumulation des ressources
            </div>
          </div>

          {/* Diamond with aura */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                position: 'absolute', width: 180, height: 180, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(48,112,208,0.25) 0%, transparent 70%)',
                animation: 'diamond-aura 3s ease-in-out infinite',
              }}
            />
            <HopeDiamond size="lg" pulse={willTrigger} />
          </div>

          {/* Holder card */}
          <div
            className="w-full relative"
            style={{
              background: 'rgba(8,8,28,0.8)',
              border: '1px solid rgba(48,112,208,0.3)',
              padding: '24px 28px',
              textAlign: 'center',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(48,112,208,0.7), transparent)' }}/>
            <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#60584a', letterSpacing: '0.5em', fontSize: '0.95rem' }}>
              Détenteur du Diamand Hope
            </div>
            <div className="font-cinzel text-2xl font-bold" style={{ color: '#f0d070' }}>
              {holder.name}
            </div>
            <div className="font-spectral italic mt-1" style={{ color: '#60584a' }}>{char.name}</div>
          </div>

          {/* Gains */}
          <div className="flex gap-3 w-full">
            {gloryGain > 0 ? (
              <div
                className="flex-1 text-center p-3"
                style={{ border: '1px solid rgba(200,164,74,0.2)', background: 'rgba(200,164,74,0.04)' }}
              >
                <IconGloire size={20} color="#c8a44a" style={{ marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
                <div className="font-cinzel text-xl font-bold" style={{ color: '#c8a44a' }}>+{gloryGain}</div>
                <div className="font-spectral italic text-xs mt-1" style={{ color: '#60584a' }}>Gloire gagnée</div>
              </div>
            ) : (
              <div
                className="flex-1 text-center p-3"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                <IconGloire size={20} color="#c8a44a" style={{ marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
                <div className="font-cinzel text-xl font-bold" style={{ color: '#60584a' }}>0</div>
                <div className="font-spectral italic text-xs mt-1" style={{ color: '#4a4038' }}>Gloire gelée</div>
              </div>
            )}
            {livresGain > 0 && (
              <div
                className="flex-1 text-center p-3"
                style={{ border: '1px solid rgba(200,164,74,0.15)', background: 'rgba(200,164,74,0.03)' }}
              >
                <IconLivres size={20} color="#c8a44a" style={{ marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
                <div className="font-cinzel text-xl font-bold" style={{ color: '#c8a44a' }}>+{livresGain}</div>
                <div className="font-spectral italic text-xs mt-1" style={{ color: '#60584a' }}>Livre compensatoire</div>
              </div>
            )}
            <div
              className="flex-1 text-center p-3"
              style={{ border: '1px solid rgba(112,32,192,0.2)', background: 'rgba(112,32,192,0.05)' }}
            >
              <IconMalediction size={20} color="#8040c0" style={{ marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
              <div className="font-cinzel text-xl font-bold" style={{ color: '#8040c0' }}>+1</div>
              <div className="font-spectral italic text-xs mt-1" style={{ color: '#60584a' }}>Malédiction reçue</div>
            </div>
          </div>

          {/* Curse tokens */}
          <div className="w-full">
            <div
              className="font-cinzel text-xs tracking-widest uppercase text-center mb-3"
              style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.4em' }}
            >
              Malédictions accumulées
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {Array.from({ length: Math.max(newCurse, threshold) }, (_, i) => {
                const filled = i < newCurse;
                const overflow = i >= threshold;
                return (
                  <div
                    key={i}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: filled
                        ? overflow
                          ? '1px solid rgba(200,30,30,0.7)'
                          : '1px solid rgba(112,32,192,0.5)'
                        : i === threshold - 1
                          ? '1px solid rgba(112,32,192,0.3)'
                          : '1px solid rgba(255,255,255,0.06)',
                      background: filled
                        ? overflow
                          ? 'radial-gradient(ellipse, rgba(180,20,20,0.8) 0%, rgba(80,0,0,0.5) 100%)'
                          : 'radial-gradient(ellipse, rgba(80,20,140,0.7) 0%, rgba(40,10,80,0.4) 100%)'
                        : 'rgba(255,255,255,0.02)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: filled ? overflow ? '0 0 8px rgba(200,30,30,0.4)' : '0 0 8px rgba(112,32,192,0.3)' : 'none',
                      outline: i === threshold - 1 && !filled ? '1px dashed rgba(112,32,192,0.4)' : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {filled ? <IconMalediction size={14} color={overflow ? '#ff4040' : '#9040d0'} /> : null}
                  </div>
                );
              })}
            </div>
            <div
              className="font-cinzel text-xs text-center mt-3"
              style={{ color: '#8040c0', letterSpacing: '0.2em' }}
            >
              Total : <strong style={{ fontSize: '1rem', color: '#9040d0' }}>{newCurse}</strong> jetons
              {' · '}Seuil : <strong style={{ fontSize: '1rem', color: playerId === holder.id || holder.thresholdRevealed ? '#9040d0' : '#60584a' }}>
                {playerId === holder.id || holder.thresholdRevealed ? threshold : '?'}
              </strong>
              {!holder.thresholdRevealed && playerId !== holder.id && <span style={{ color: '#4a4038' }}> (secret)</span>}
            </div>
          </div>

          {/* Threshold warning */}
          {willTrigger && (
            <div
              className="w-full flex items-start gap-3 animate-warning"
              style={{
                padding: '14px 18px',
                border: '1px solid rgba(160,20,20,0.5)',
                background: 'rgba(60,0,0,0.2)',
              }}
            >
              <IconWarning size={20} color="#cc4444" style={{ flexShrink: 0 }} />
              <div>
                <div className="font-cinzel text-xs font-bold" style={{ color: '#cc4444', letterSpacing: '0.2em' }}>
                  ÉVÉNEMENT FUNESTE
                </div>
                <p className="font-spectral text-xs mt-1" style={{ color: '#a06060', lineHeight: 1.5 }}>
                  {holder.name} atteint son seuil.{' '}
                  {isAristocrateImmune && (
                    <span style={{ color: '#a060c0' }}>L'Aristocrate annule ce premier Événement (immunité consommée).</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: actions ── */}
        <div className="flex flex-col gap-3 pt-2">
          <div
            className="font-cinzel text-xs tracking-widest uppercase pb-2 mb-1"
            style={{
              color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em',
              borderBottom: '1px solid rgba(200,164,74,0.1)',
            }}
          >
            Actions
          </div>

          {isHost && (
            willTrigger && !isAristocrateImmune ? (
              <button onClick={handleContinue} className="btn-danger w-full" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', letterSpacing: '0.25em', textAlign: 'left', paddingLeft: '1.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconZap size={16} />Déclencher l'Événement</span>
              </button>
            ) : (
              <button onClick={handleContinue} className="btn-gold w-full" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', letterSpacing: '0.25em', textAlign: 'left', paddingLeft: '1.5rem' }}>
                Ouvrir le Marché Noir →
              </button>
            )
          )}

          <button
            onClick={() => router.push('/game/private')}
            className="btn-ghost-dark w-full"
            style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', textAlign: 'left', paddingLeft: '1.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconVision size={16} />Mes infos privées</span>
          </button>

          <button
            onClick={() => router.push('/game/scoreboard')}
            className="btn-ghost-dark w-full"
            style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', textAlign: 'left', paddingLeft: '1.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconScoreboard size={16} />Tableau de bord complet</span>
          </button>

          {!isHost && (
            <p className="font-spectral italic text-xs mt-2" style={{ color: '#3a3028', lineHeight: 1.6, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              En attente que l'hôte déclenche la prochaine phase.
            </p>
          )}

          <p
            className="font-spectral italic text-xs mt-2"
            style={{
              color: '#4a4038', lineHeight: 1.6,
              padding: '12px 0',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {holder.name} annonce son total de Malédictions à voix haute.
            {willTrigger && !isAristocrateImmune
              ? " L'Événement Funeste se déclenche avant le Marché Noir."
              : " Si son seuil n'est pas atteint, on passe au Marché Noir."}
          </p>
        </div>
      </div>
    </main>
  );
}
