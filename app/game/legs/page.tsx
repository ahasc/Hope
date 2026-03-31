'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, useGameActions, useHolder, usePlayers, useCurrentTurn } from '@/store/gameStore';
import { useIsHost, usePlayerId } from '@/store/sessionStore';
import { CHARACTERS } from '@/lib/gameData';
import { HopeDiamond } from '@/components/HopeDiamond';
import { CHAR_ICON_MAP, IconGloire, IconMalediction, IconCheck, IconScoreboard, IconLivres, IconFaveurs, IconSecrets } from '@/components/GameIcons';

export default function LegsPage() {
  const router = useRouter();
  const actions = useGameActions();
  const holder = useHolder();
  const players = usePlayers();
  const currentTurn = useCurrentTurn();

  const isHost = useIsHost();
  const playerId = usePlayerId();
  const [mode, setMode] = useState<'choose' | 'propose' | 'force' | 'keep' | null>(null);
  const [targetId, setTargetId] = useState('');
  const [priceLivres, setPriceLivres] = useState(0);
  const [forcerId, setForcerId] = useState('');

  if (!holder) return null;

  const alive = players.filter((p) => p.isAlive);
  const others = alive.filter((p) => !p.isHopeHolder);
  const char = CHARACTERS[holder.character];
  const holderWithFaveurs = alive.filter((p) => p.faveurs > 0);
  const journalisteForced = holder.character === 'journaliste' && holder.consecutiveHopeTurns >= 2;
  const isReceleur = holder.character === 'receleur';
  const isHolder = playerId === holder.id;
  const canAct = isHost || isHolder;
  const LegCharIcon = CHAR_ICON_MAP[holder.character];

  function handlePropose() {
    if (!targetId) return;
    actions.passHope(targetId, { livres: priceLivres });
    actions.advanceTurn();
    router.push('/game/accumulation');
  }

  function handleForce() {
    if (!forcerId || !targetId) return;
    actions.forcePassHope(forcerId, targetId);
    actions.advanceTurn();
    router.push('/game/accumulation');
  }

  function handleKeep() {
    actions.keepHope();
    router.push('/game/accumulation');
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#04040f' }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5"
        style={{ borderBottom: '1px solid rgba(200,164,74,0.1)' }}
      >
        <div>
          <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em' }}>
            Tour {currentTurn} · Phase 4
          </div>
          <h2 className="font-cinzel text-2xl font-semibold mt-1" style={{ color: '#c8a44a' }}>
            Le Legs
          </h2>
        </div>
        <div
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{ padding: '8px 20px', border: '1px solid rgba(200,164,74,0.3)', color: '#c8a44a', background: 'rgba(200,164,74,0.06)', fontSize: '0.95rem', letterSpacing: '0.25em' }}
        >
          {holder.name} passe le Hope
        </div>
      </header>

      <div
        className="grid flex-1"
        style={{ gridTemplateColumns: '1fr 160px 1fr', gap: 40, padding: '40px 48px', alignItems: 'start' }}
      >

        {/* ── Left: holder side ── */}
        <div className="flex flex-col gap-4">
          <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em', paddingBottom: 10, borderBottom: '1px solid rgba(200,164,74,0.1)' }}>
            Détenteur actuel
          </div>

          {/* Profile */}
          <div
            className="relative p-5"
            style={{ background: 'rgba(8,8,28,0.8)', border: '1px solid rgba(48,112,208,0.3)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(48,112,208,0.7), transparent)' }}/>
            <div className="flex items-start gap-3 mb-4">
              <LegCharIcon size={32} color="#c8a44a" />
              <div className="flex-1">
                <span className="font-cinzel text-xl font-bold block" style={{ color: '#80b0ff' }}>{holder.name}</span>
                <span className="font-spectral italic text-sm block mt-1" style={{ color: '#60584a' }}>{char.name}</span>
              </div>
              <span
                className="font-cinzel text-xs tracking-widest uppercase"
                style={{ padding: '5px 12px', border: '1px solid rgba(48,112,208,0.4)', background: 'rgba(20,50,120,0.2)', color: '#6090d0', fontSize: '1rem', letterSpacing: '0.25em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <IconGloire size={14} color="#6090d0" /> Hope
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-cinzel text-xs tracking-widest uppercase mb-1" style={{ color: '#4a4038', fontSize: '1rem', letterSpacing: '0.35em' }}>Peut offrir</div>
              {([
                [<IconLivres size={14} />, holder.livres, 'Livres', '#c8a44a'],
                [<IconFaveurs size={14} />, holder.faveurs, 'Faveurs', '#60c060'],
                [<IconSecrets size={14} />, holder.maniganceCards.length + holder.intelCards.length, 'Cartes', '#c06060'],
              ] as [React.ReactNode, number, string, string][]).map(([icon, val, label, color]) => (
                <div
                  key={String(label)}
                  className="flex items-center gap-3 px-3 py-2"
                  style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <span>{icon}</span>
                  <span className="font-spectral text-sm flex-1" style={{ color: '#d8d0c0' }}>{label}</span>
                  <span className="font-cinzel font-bold text-lg" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {journalisteForced && (
            <div className="p-3 text-xs font-spectral" style={{ border: '1px solid rgba(40,120,40,0.4)', background: 'rgba(0,40,0,0.2)', color: '#60c060', lineHeight: 1.6 }}>
              <strong className="font-cinzel">Journaliste :</strong> 2 tours consécutifs atteints. Vous devez passer le Hope maintenant.
            </div>
          )}

          {isReceleur && !holder.isHidden && canAct && (
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#808080', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
                Pouvoir du Receleur
              </div>
              <p className="font-spectral italic text-xs mb-3" style={{ color: '#5a5040', lineHeight: 1.6 }}>
                Dissimulez le Hope — personne ne sait que vous le détenez. Les Événements ciblés ne vous atteignent pas.
              </p>
              <button
                onClick={() => { actions.receleurConceal(); actions.advanceTurn(); router.push('/game/accumulation'); }}
                className="btn-ghost-dark text-xs"
              >
                Dissimuler le Hope
              </button>
            </div>
          )}

          {/* Mode buttons */}
          {!mode && canAct && (
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={() => setMode('propose')} className="btn-gold w-full" style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                Proposer une transaction →
              </button>
              <button
                onClick={() => setMode('force')}
                disabled={holderWithFaveurs.length === 0}
                className="btn-ghost-dark w-full"
                style={{ textAlign: 'left', paddingLeft: '1.5rem' }}
              >
                Forcer un échange (Faveur)
                {holderWithFaveurs.length === 0 && <span className="block text-xs opacity-50 mt-0.5">Aucune Faveur disponible</span>}
              </button>
              {!journalisteForced && (
                <button
                  onClick={() => setMode('keep')}
                  className="btn-ghost-dark w-full"
                  style={{ textAlign: 'left', paddingLeft: '1.5rem' }}
                >
                  Garder le Hope ce tour
                </button>
              )}
            </div>
          )}

          {!canAct && !mode && (
            <p className="font-spectral italic text-xs mt-2" style={{ color: '#3a3028', lineHeight: 1.6, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              En attente que {holder.name} décide du sort du Hope.
            </p>
          )}

          {/* Propose form */}
          {mode === 'propose' && (
            <div className="flex flex-col gap-3 p-4" style={{ background: 'rgba(200,164,74,0.04)', border: '1px dashed rgba(200,164,74,0.25)' }}>
              <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#c8a44a', fontSize: '1rem', letterSpacing: '0.3em' }}>
                Proposition d'échange
              </div>
              <div>
                <label className="font-cinzel text-xs block mb-1" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Transmettre à</label>
                <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="input-dark">
                  <option value="">— choisir —</option>
                  {others.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.livres}L, {p.faveurs}F)</option>)}
                </select>
              </div>
              <div>
                <label className="font-cinzel text-xs block mb-1" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Prix demandé (Livres)</label>
                <input
                  type="number" min={0} value={priceLivres}
                  onChange={(e) => setPriceLivres(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-dark"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setMode(null)} className="btn-ghost-dark flex-1 text-xs">Retour</button>
                <button onClick={handlePropose} disabled={!targetId} className="btn-gold flex-1 text-xs">Confirmer</button>
              </div>
            </div>
          )}

          {/* Force form */}
          {mode === 'force' && (
            <div className="flex flex-col gap-3 p-4" style={{ background: 'rgba(60,0,0,0.15)', border: '1px solid rgba(140,20,20,0.3)' }}>
              <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#c06060', fontSize: '1rem', letterSpacing: '0.3em' }}>
                Transfert Forcé — coûte 1 Faveur
              </div>
              <div>
                <label className="font-cinzel text-xs block mb-1" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Qui dépense sa Faveur</label>
                <select value={forcerId} onChange={(e) => setForcerId(e.target.value)} className="input-dark">
                  <option value="">—</option>
                  {holderWithFaveurs.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.faveurs}F)</option>)}
                </select>
              </div>
              <div>
                <label className="font-cinzel text-xs block mb-1" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Forcer vers</label>
                <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="input-dark">
                  <option value="">—</option>
                  {others.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setMode(null)} className="btn-ghost-dark flex-1 text-xs">Retour</button>
                <button onClick={handleForce} disabled={!forcerId || !targetId} className="btn-danger flex-1 text-xs">Forcer</button>
              </div>
            </div>
          )}

          {mode === 'keep' && (
            <div className="p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-spectral italic text-sm mb-4" style={{ color: '#8a8070', lineHeight: 1.6 }}>
                {holder.name} conserve le Hope. La Malédiction continue d'accumuler au prochain tour.
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setMode(null)} className="btn-ghost-dark text-xs">Retour</button>
                <button onClick={handleKeep} className="btn-gold text-xs">
                  Confirmer — Fin du tour {currentTurn}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Center: diamond ── */}
        <div className="flex flex-col items-center gap-4 pt-10">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(48,112,208,0.2) 0%, transparent 70%)',
                animation: 'diamond-aura 3s ease-in-out infinite',
              }}
            />
            <HopeDiamond size="md" hidden={holder.isHidden} />
          </div>
          {/* Arrow */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              animation: 'diamond-aura 2s ease-in-out infinite',
            }}
          >
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, rgba(200,164,74,0.2), rgba(200,164,74,0.6))' }}/>
            <span style={{ color: '#c8a44a', opacity: 0.7 }}>→</span>
          </div>
          <div
            className="font-cinzel text-xs tracking-widest uppercase text-center"
            style={{ color: '#3a3028', fontSize: '1rem', letterSpacing: '0.3em', lineHeight: 1.7 }}
          >
            Qui prend<br/>le fardeau ?
          </div>
        </div>

        {/* ── Right: recipients ── */}
        <div className="flex flex-col gap-3">
          <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em', paddingBottom: 10, borderBottom: '1px solid rgba(200,164,74,0.1)' }}>
            Destinataires possibles
          </div>

          {others.map((p) => {
            const pc = CHARACTERS[p.character];
            const curseRisk = p.curseTokens / p.threshold;
            const isDanger = curseRisk >= 0.7;

            return (
              <div
                key={p.id}
                className="p-4 flex flex-col gap-3 transition-all"
                style={{
                  background: 'linear-gradient(160deg, #0a0a1e 0%, #070714 100%)',
                  border: '1px solid rgba(200,164,74,0.12)',
                  cursor: 'default',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-cinzel text-base font-semibold block" style={{ color: '#f0d070' }}>
                      {p.name}
                    </span>
                    <span className="font-spectral italic text-xs block mt-0.5" style={{ color: '#60584a' }}>
                      {pc.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-cinzel" style={{ color: '#c8a44a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconGloire size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} /> {p.glory}
                    </span>
                    <span className="font-cinzel" style={{ color: isDanger ? '#cc3030' : '#7020c0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconMalediction size={14} color={isDanger ? '#cc3030' : '#7020c0'} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} /> {p.curseTokens}
                    </span>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between pt-2 text-xs"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="font-spectral italic" style={{ color: '#4a4038' }}>
                    {p.livres}L · {p.faveurs}F · {p.maniganceCards.length + p.intelCards.length}C
                  </span>
                  {mode === 'propose' && (
                    <button
                      onClick={() => setTargetId(p.id)}
                      className="font-cinzel text-xs tracking-widest uppercase"
                      style={{
                        padding: '4px 12px',
                        border: targetId === p.id ? '1px solid rgba(200,164,74,0.6)' : '1px solid rgba(200,164,74,0.2)',
                        background: targetId === p.id ? 'rgba(200,164,74,0.12)' : 'none',
                        color: targetId === p.id ? '#c8a44a' : '#60584a',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        letterSpacing: '0.2em',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {targetId === p.id ? <><IconCheck size={12} style={{ display: 'inline', marginRight: 4 }} />Sélectionné</> : 'Choisir'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-10 py-4"
        style={{ borderTop: '1px solid rgba(200,164,74,0.1)', marginTop: 'auto' }}
      >
        <p className="font-spectral italic text-sm" style={{ color: '#4a4038', maxWidth: 500, lineHeight: 1.6 }}>
          Si aucun joueur n'accepte et qu'aucune Faveur n'est disponible, le Hope reste avec {holder.name} jusqu'au prochain tour.
        </p>
        <div className="flex gap-3">
          <button onClick={() => router.push('/game/scoreboard')} className="btn-ghost-dark text-xs" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconScoreboard size={14} /> Tableau de bord
          </button>
        </div>
      </footer>
    </main>
  );
}
