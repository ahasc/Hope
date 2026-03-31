'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore, useGameActions } from '@/store/gameStore';
import { usePlayerId } from '@/store/sessionStore';
import { CHARACTERS } from '@/lib/gameData';
import { CHAR_ICON_MAP, IconHourglass, IconLivres, IconFaveurs, IconSecrets, IconVision } from '@/components/GameIcons';

type ManiganceAction = { cardId: string; type: 'jouer' | 'vendre'; targetId?: string; livres: number; faveurs: number; chantagePick?: 'livres' | 'faveurs' };
type IntelAction = { cardId: string; targetId?: string; livres: number; faveurs: number };

function PrivatePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get('view');
  const playerId = usePlayerId();
  const players = useGameStore((s) => s.players);
  const eventDeck = useGameStore((s) => s.eventDeck);
  const phase = useGameStore((s) => s.phase);
  const actions = useGameActions();
  const [maniganceAction, setManiganceAction] = useState<ManiganceAction | null>(null);
  const [intelAction, setIntelAction] = useState<IntelAction | null>(null);

  const player = players.find((p) => p.id === playerId);
  const nextEvent = eventDeck[0];

  if (!player) {
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

  const char = CHARACTERS[player.character];
  const CharIcon = CHAR_ICON_MAP[player.character];

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#04040f' }}>
      <div
        className="grid flex-1"
        style={{ gridTemplateColumns: '280px 1fr' }}
      >

        {/* Left: identity panel */}
        <div
          className="flex flex-col gap-6 px-7 py-8"
          style={{ borderRight: '1px solid rgba(200,164,74,0.1)', background: 'rgba(0,0,0,0.2)' }}
        >
          {/* Identity */}
          <div className="text-center">
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <CharIcon size={52} color="#c8a44a" />
            </div>
            <span className="font-cinzel text-2xl font-semibold block" style={{ color: '#f0d070' }}>{player.name}</span>
            <span className="font-spectral italic block mt-1" style={{ color: '#60584a' }}>{char.name}</span>
          </div>

          <div className="divider-gold" />

          {/* Threshold */}
          <div
            className="relative text-center p-5"
            style={{ background: 'rgba(80,20,130,0.1)', border: '1px solid rgba(100,30,170,0.25)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(120,40,200,0.6), transparent)' }}/>
            <div className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: '#8040b0', fontSize: '0.95rem', letterSpacing: '0.35em' }}>
              Votre seuil secret
            </div>
            <div
              className="font-cinzel font-black"
              style={{
                fontSize: '4.5rem', lineHeight: 1,
                background: 'linear-gradient(180deg, #c080ff 0%, #8040c0 60%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: 'drop-shadow(0 0 14px rgba(120,40,200,0.4))',
              }}
            >
              {player.threshold}
            </div>
            <div className="font-spectral italic text-xs mt-2" style={{ color: '#6030a0' }}>
              {player.character === 'heritier' ? 'Seuil fixe — connu de tous' : 'Ne révélez pas ce chiffre'}
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-2">
            <div className="font-cinzel text-xs tracking-widest uppercase mb-1" style={{ color: '#4a4038', fontSize: '1rem', letterSpacing: '0.35em' }}>
              Ressources
            </div>
            {([
              [<IconLivres size={16} />, player.livres, 'Livres', 'Monnaie universelle', '#c8a44a'],
              [<IconFaveurs size={16} />, player.faveurs, 'Faveurs', 'Peut forcer un échange', '#60c060'],
              [<IconSecrets size={16} />, player.maniganceCards.length + player.intelCards.length, 'Cartes', 'Manigances et Secrets', '#c06060'],
            ] as [React.ReactNode, number, string, string, string][]).map(([icon, val, name, sub, color]) => (
              <div
                key={String(name)}
                className="flex items-center gap-3 px-3 py-2"
                style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span>{icon}</span>
                <div className="flex-1">
                  <span className="font-spectral text-sm block" style={{ color: '#d8d0c0' }}>{name}</span>
                  <span className="font-spectral italic text-xs" style={{ color: '#4a4038' }}>{sub}</span>
                </div>
                <span className="font-cinzel font-bold text-xl" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Scores */}
          <div className="flex" style={{ border: '1px solid rgba(200,164,74,0.15)' }}>
            <div className="flex-1 text-center py-3" style={{ borderRight: '1px solid rgba(200,164,74,0.1)' }}>
              <span className="font-cinzel font-bold block" style={{ fontSize: '1.6rem', color: '#c8a44a' }}>{player.glory}</span>
              <span className="font-cinzel text-xs block mt-1" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Gloire</span>
            </div>
            <div className="flex-1 text-center py-3">
              <span className="font-cinzel font-bold block" style={{ fontSize: '1.6rem', color: '#7020c0' }}>{player.curseTokens}</span>
              <span className="font-cinzel text-xs block mt-1" style={{ color: '#60584a', fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Malédiction</span>
            </div>
          </div>
        </div>

        {/* Right: secrets + abilities */}
        <div className="p-8 flex flex-col gap-6">
          <div>
            <div className="font-cinzel text-xs tracking-widest uppercase mb-1" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.45em' }}>
              Informations secrètes
            </div>
            <h3 className="font-cinzel text-xl font-semibold" style={{ color: '#c8a44a' }}>
              Vos Secrets et Capacités
            </h3>
          </div>

          {/* Ability */}
          <div
            className="p-5"
            style={{ background: 'rgba(80,20,130,0.08)', border: '1px solid rgba(100,30,170,0.2)' }}
          >
            <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#6040a0', fontSize: '0.95rem', letterSpacing: '0.35em' }}>
              Capacité — {char.name}
            </div>
            <p className="font-spectral text-sm" style={{ color: '#7050a0', lineHeight: 1.7 }}>
              <strong style={{ color: '#c080e0', fontFamily: 'Cinzel' }}>Atout : </strong>{char.atout}
              <br/><br/>
              <strong style={{ color: '#c08080', fontFamily: 'Cinzel' }}>Faiblesse : </strong>{char.faiblesse}
            </p>
          </div>

          {/* Intel acquisition */}
          <div
            className="p-4"
            style={{ background: 'rgba(0,40,20,0.12)', border: '1px solid rgba(30,120,60,0.25)' }}
          >
            <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#307050', fontSize: '0.95rem', letterSpacing: '0.35em' }}>
              Comment gagner des Secrets
            </div>
            <p className="font-spectral italic text-sm" style={{ color: '#60a080', lineHeight: 1.6 }}>
              {char.intelAcquisition}
            </p>
            {player.character === 'marchand' && (
              <button
                onClick={() => actions.marchandBuyIntel(player.id)}
                disabled={player.livres < 3 || phase !== 'marche-noir'}
                className="font-cinzel text-xs tracking-widest uppercase mt-3"
                style={{
                  padding: '5px 12px',
                  border: player.livres >= 3 && phase === 'marche-noir' ? '1px solid rgba(30,120,60,0.5)' : '1px solid rgba(30,120,60,0.2)',
                  color: player.livres >= 3 && phase === 'marche-noir' ? '#80d0a0' : '#407050',
                  background: 'rgba(0,40,20,0.2)',
                  cursor: player.livres >= 3 && phase === 'marche-noir' ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.15em',
                  opacity: player.livres >= 3 && phase === 'marche-noir' ? 1 : 0.5,
                }}
              >
                Acheter une Rumeur — 3 Livres
                {phase !== 'marche-noir' && <span style={{ display: 'block', fontSize: '0.75em', marginTop: 2, color: '#405040' }}>Disponible au Marché Noir</span>}
              </button>
            )}
          </div>

          {/* Medium vision */}
          {view === 'medium' && player.character === 'medium' && nextEvent && (
            <div
              className="p-5"
              style={{ background: 'rgba(0,60,60,0.15)', border: '1px solid rgba(40,140,140,0.3)' }}
            >
              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#40a0a0', fontSize: '0.95rem', letterSpacing: '0.35em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconVision size={14} color="#40a0a0" /> Votre Vision — Prochain Événement
              </div>
              <div className="font-cinzel text-base font-bold mb-2" style={{ color: '#80d0d0' }}>{nextEvent.title}</div>
              <p className="font-spectral italic text-sm" style={{ color: '#50a0a0', lineHeight: 1.6 }}>{nextEvent.effect}</p>
              <p className="font-spectral italic text-xs mt-3" style={{ color: '#3a6060' }}>
                Vous pouvez vendre cette information comme un Secret — ou l'utiliser pour éviter d'être la prochaine victime.
              </p>
            </div>
          )}

          {/* Manigance cards */}
          <div>
            <div className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: '#4a4038', fontSize: '0.95rem', letterSpacing: '0.35em' }}>
              Vos Manigances ({player.maniganceCards.length})
            </div>
            {player.maniganceCards.length > 0 ? (
              <div className="flex flex-col gap-4">
                {player.maniganceCards.map((c) => {
                  const isActive = maniganceAction?.cardId === c.id;
                  const otherAlive = players.filter((p) => p.isAlive && p.id !== player.id);

                  return (
                    <div
                      key={c.id}
                      className="relative p-4"
                      style={{ background: 'linear-gradient(160deg, #080018 0%, #040010 100%)', border: `1px solid ${isActive ? 'rgba(80,60,200,0.5)' : 'rgba(80,60,200,0.25)'}` }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(80,60,200,0.5), transparent)' }}/>
                      <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#5040a0', fontSize: '0.95rem', letterSpacing: '0.25em' }}>
                        Manigance
                      </div>
                      <div className="font-cinzel text-sm font-semibold mb-2" style={{ color: '#a090e0' }}>{c.title}</div>
                      <p className="font-spectral italic text-xs" style={{ color: '#7060a0', lineHeight: 1.6 }}>{c.effect}</p>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {(['jouer', 'vendre'] as const).map((type) => {
                          const label = type === 'jouer' ? 'Jouer' : 'Vendre';
                          const active = isActive && maniganceAction?.type === type;
                          return (
                            <button
                              key={type}
                              onClick={() => setManiganceAction(active ? null : { cardId: c.id, type, livres: 0, faveurs: 0 })}
                              className="font-cinzel text-xs tracking-widest uppercase"
                              style={{
                                padding: '4px 10px',
                                border: active ? '1px solid rgba(120,100,220,0.6)' : '1px solid rgba(80,60,200,0.3)',
                                color: active ? '#c0b0ff' : '#8070c0',
                                background: active ? 'rgba(40,20,100,0.3)' : 'rgba(20,10,60,0.15)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                letterSpacing: '0.15em',
                                transition: 'all 0.15s',
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Action panel */}
                      {isActive && maniganceAction && (
                        <div className="mt-3 p-3" style={{ background: 'rgba(40,20,100,0.2)', border: '1px solid rgba(80,60,200,0.2)' }}>
                          {maniganceAction.type === 'jouer' && c.mechanicKey === 'SOCIAL' && (
                            <>
                              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#8070c0', letterSpacing: '0.2em' }}>
                                Effet de la Manigance
                              </div>
                              <p className="font-spectral italic text-sm" style={{ color: '#a090e0', lineHeight: 1.6, borderLeft: '2px solid rgba(80,60,200,0.4)', paddingLeft: 10 }}>
                                "{c.effect}"
                              </p>
                              <p className="font-spectral italic text-xs mt-2" style={{ color: '#5a4a70' }}>Appliquez l'effet à voix haute, puis confirmez.</p>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => { actions.discardManigance(player.id, c.id); setManiganceAction(null); }}
                                  className="btn-gold text-xs"
                                  style={{ padding: '6px 12px' }}
                                >
                                  Confirmer — consommer
                                </button>
                                <button onClick={() => setManiganceAction(null)} className="btn-ghost-dark text-xs" style={{ padding: '6px 12px' }}>Annuler</button>
                              </div>
                            </>
                          )}
                          {maniganceAction.type === 'jouer' && c.mechanicKey === 'VOL_FAVEUR' && (
                            <>
                              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#8070c0', letterSpacing: '0.2em' }}>
                                Choisir la cible
                              </div>
                              <div className="flex flex-col gap-1 mb-3">
                                {otherAlive.map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setManiganceAction({ ...maniganceAction, targetId: p.id, faveurs: 1 })}
                                    className="font-cinzel text-sm text-left px-3 py-2"
                                    style={{
                                      background: maniganceAction.targetId === p.id ? 'rgba(80,60,200,0.2)' : 'rgba(255,255,255,0.03)',
                                      border: maniganceAction.targetId === p.id ? '1px solid rgba(120,100,220,0.5)' : '1px solid rgba(255,255,255,0.06)',
                                      color: maniganceAction.targetId === p.id ? '#c0b0ff' : '#9a8080',
                                      cursor: 'pointer',
                                      opacity: p.faveurs > 0 ? 1 : 0.4,
                                    }}
                                  >
                                    {p.name} <span style={{ color: '#4a4038', fontSize: '0.8em' }}>— {p.faveurs}F disponible{p.faveurs !== 1 ? 's' : ''}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (maniganceAction.targetId) {
                                      actions.playManigance(player.id, c.id, maniganceAction.targetId, 0, 1);
                                      setManiganceAction(null);
                                    }
                                  }}
                                  disabled={!maniganceAction.targetId}
                                  className="btn-gold text-xs flex-1"
                                  style={{ padding: '6px 12px', opacity: maniganceAction.targetId ? 1 : 0.4 }}
                                >
                                  Confirmer — voler 1 Faveur
                                </button>
                                <button onClick={() => setManiganceAction(null)} className="btn-ghost-dark text-xs" style={{ padding: '6px 12px' }}>Annuler</button>
                              </div>
                            </>
                          )}
                          {maniganceAction.type === 'jouer' && c.mechanicKey === 'CHANTAGE_TRANSFER' && (
                            <>
                              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#8070c0', letterSpacing: '0.2em' }}>
                                Choisir la cible
                              </div>
                              <div className="flex flex-col gap-1 mb-3">
                                {otherAlive.map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setManiganceAction({ ...maniganceAction, targetId: p.id })}
                                    className="font-cinzel text-sm text-left px-3 py-2"
                                    style={{
                                      background: maniganceAction.targetId === p.id ? 'rgba(80,60,200,0.2)' : 'rgba(255,255,255,0.03)',
                                      border: maniganceAction.targetId === p.id ? '1px solid rgba(120,100,220,0.5)' : '1px solid rgba(255,255,255,0.06)',
                                      color: maniganceAction.targetId === p.id ? '#c0b0ff' : '#9a8080',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {p.name} <span style={{ color: '#4a4038', fontSize: '0.8em' }}>— {p.livres}L · {p.faveurs}F</span>
                                  </button>
                                ))}
                              </div>
                              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#8070c0', letterSpacing: '0.2em' }}>
                                Exiger
                              </div>
                              <div className="flex gap-2 mb-3">
                                {(['livres', 'faveurs'] as const).map((cur) => (
                                  <button
                                    key={cur}
                                    onClick={() => setManiganceAction({ ...maniganceAction, chantagePick: cur, livres: cur === 'livres' ? 2 : 0, faveurs: cur === 'faveurs' ? 1 : 0 })}
                                    className="font-cinzel text-xs flex-1"
                                    style={{
                                      padding: '6px 8px',
                                      border: maniganceAction.chantagePick === cur ? '1px solid rgba(120,100,220,0.6)' : '1px solid rgba(80,60,200,0.25)',
                                      background: maniganceAction.chantagePick === cur ? 'rgba(40,20,100,0.35)' : 'rgba(20,10,60,0.15)',
                                      color: maniganceAction.chantagePick === cur ? '#c0b0ff' : '#8070c0',
                                      cursor: 'pointer',
                                      letterSpacing: '0.1em',
                                    }}
                                  >
                                    {cur === 'livres' ? '2 Livres 💰' : '1 Faveur 🤝'}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (maniganceAction.targetId && maniganceAction.chantagePick) {
                                      actions.playManigance(player.id, c.id, maniganceAction.targetId, maniganceAction.livres, maniganceAction.faveurs);
                                      setManiganceAction(null);
                                    }
                                  }}
                                  disabled={!maniganceAction.targetId || !maniganceAction.chantagePick}
                                  className="btn-gold text-xs flex-1"
                                  style={{ padding: '6px 12px', opacity: maniganceAction.targetId && maniganceAction.chantagePick ? 1 : 0.4 }}
                                >
                                  Confirmer le chantage
                                </button>
                                <button onClick={() => setManiganceAction(null)} className="btn-ghost-dark text-xs" style={{ padding: '6px 12px' }}>Annuler</button>
                              </div>
                            </>
                          )}
                          {maniganceAction.type === 'vendre' && (
                            <>
                              <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#8070c0', letterSpacing: '0.2em' }}>
                                Transférer cette Manigance à :
                              </div>
                              <div className="flex flex-col gap-1 mb-3">
                                {otherAlive.map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setManiganceAction({ ...maniganceAction, targetId: p.id })}
                                    className="font-cinzel text-sm text-left px-3 py-2"
                                    style={{
                                      background: maniganceAction.targetId === p.id ? 'rgba(80,60,200,0.2)' : 'rgba(255,255,255,0.03)',
                                      border: maniganceAction.targetId === p.id ? '1px solid rgba(120,100,220,0.5)' : '1px solid rgba(255,255,255,0.06)',
                                      color: maniganceAction.targetId === p.id ? '#c0b0ff' : '#9a8080',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {p.name} <span style={{ color: '#4a4038', fontSize: '0.8em' }}>({CHARACTERS[p.character].name})</span>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (maniganceAction.targetId) {
                                      actions.giveManiganceCard(player.id, maniganceAction.targetId, c.id);
                                      setManiganceAction(null);
                                    }
                                  }}
                                  disabled={!maniganceAction.targetId}
                                  className="btn-gold text-xs flex-1"
                                  style={{ padding: '6px 12px', opacity: maniganceAction.targetId ? 1 : 0.4 }}
                                >
                                  Confirmer le transfert
                                </button>
                                <button
                                  onClick={() => setManiganceAction(null)}
                                  className="btn-ghost-dark text-xs"
                                  style={{ padding: '6px 12px' }}
                                >
                                  Annuler
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-spectral italic text-sm" style={{ color: '#4a4038' }}>Vous n'avez aucune Manigance.</p>
            )}
          </div>

          {/* Intel / Secret cards */}
          <div>
            <div className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: '#4a4038', fontSize: '0.95rem', letterSpacing: '0.35em' }}>
              Vos Secrets ({player.intelCards.length})
            </div>
            {player.intelCards.length > 0 ? (
              <div className="flex flex-col gap-4">
                {player.intelCards.map((c) => {
                  const isActive = intelAction?.cardId === c.id;
                  const otherAlive = players.filter((p) => p.isAlive && p.id !== player.id);
                  const target = players.find((p) => p.id === c.targetPlayerId);

                  return (
                    <div
                      key={c.id}
                      className="relative p-4"
                      style={{ background: 'linear-gradient(160deg, #100008 0%, #080004 100%)', border: `1px solid ${isActive ? 'rgba(160,30,30,0.5)' : 'rgba(160,30,30,0.25)'}` }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(160,30,30,0.5), transparent)' }}/>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#6a3030', fontSize: '0.95rem', letterSpacing: '0.25em' }}>
                          Secret
                        </div>
                        {target && (
                          <div className="font-cinzel text-xs" style={{ color: '#c06060', background: 'rgba(100,0,0,0.25)', border: '1px solid rgba(160,30,30,0.35)', padding: '2px 8px', letterSpacing: '0.1em' }}>
                            À propos de : <span style={{ color: '#ff9090' }}>{target.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="font-cinzel text-sm font-semibold mb-2" style={{ color: '#e07070' }}>{c.title}</div>
                      <p className="font-spectral italic text-xs" style={{ color: '#9a8080', lineHeight: 1.6 }}>{c.content}</p>

                      {/* Action button */}
                      <div className="flex gap-1.5 mt-3">
                        <button
                          onClick={() => setIntelAction(isActive ? null : { cardId: c.id, livres: 0, faveurs: 0 })}
                          className="font-cinzel text-xs tracking-widest uppercase"
                          style={{
                            padding: '4px 10px',
                            border: isActive ? '1px solid rgba(200,80,80,0.6)' : '1px solid rgba(160,30,30,0.3)',
                            color: isActive ? '#ff9090' : '#c06060',
                            background: isActive ? 'rgba(100,0,0,0.3)' : 'rgba(60,0,0,0.15)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            letterSpacing: '0.15em',
                            transition: 'all 0.15s',
                          }}
                        >
                          Faire chanter
                        </button>
                      </div>

                      {/* Action panel */}
                      {isActive && intelAction && (
                        <div className="mt-3 p-3" style={{ background: 'rgba(80,0,0,0.2)', border: '1px solid rgba(160,30,30,0.2)' }}>
                          <div className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: '#c06060', letterSpacing: '0.2em' }}>
                            Choisir la cible
                          </div>
                          <div className="flex flex-col gap-1 mb-3">
                            {otherAlive.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => setIntelAction({ ...intelAction, targetId: p.id })}
                                className="font-cinzel text-sm text-left px-3 py-2"
                                style={{
                                  background: intelAction.targetId === p.id ? 'rgba(160,30,30,0.25)' : 'rgba(255,255,255,0.03)',
                                  border: intelAction.targetId === p.id ? '1px solid rgba(200,80,80,0.5)' : '1px solid rgba(255,255,255,0.06)',
                                  color: intelAction.targetId === p.id ? '#ff9090' : '#9a8080',
                                  cursor: 'pointer',
                                }}
                              >
                                {p.name} <span style={{ color: '#4a4038', fontSize: '0.8em' }}>({CHARACTERS[p.character].name})</span>
                              </button>
                            ))}
                          </div>
                          <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#c06060', letterSpacing: '0.2em' }}>
                            Contrepartie exigée
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <label className="font-spectral italic text-xs block mb-1" style={{ color: '#7a5050' }}>Livres 💰</label>
                              <input
                                type="number" min={0}
                                value={intelAction.livres}
                                onChange={(e) => setIntelAction({ ...intelAction, livres: Math.max(0, parseInt(e.target.value) || 0) })}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(160,30,30,0.3)', color: '#e07070', padding: '4px 8px', fontSize: '0.85rem', fontFamily: 'Cinzel' }}
                              />
                            </div>
                            <div>
                              <label className="font-spectral italic text-xs block mb-1" style={{ color: '#7a5050' }}>Faveurs 🤝</label>
                              <input
                                type="number" min={0}
                                value={intelAction.faveurs}
                                onChange={(e) => setIntelAction({ ...intelAction, faveurs: Math.max(0, parseInt(e.target.value) || 0) })}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(160,30,30,0.3)', color: '#e07070', padding: '4px 8px', fontSize: '0.85rem', fontFamily: 'Cinzel' }}
                              />
                            </div>
                          </div>
                          {intelAction.targetId && (
                            <p className="font-spectral italic text-xs mb-3" style={{ color: '#e07070', lineHeight: 1.6, borderLeft: '2px solid rgba(160,30,30,0.4)', paddingLeft: 10 }}>
                              "{c.content}"
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (intelAction.targetId) {
                                  actions.chanterIntel(player.id, c.id, intelAction.targetId, intelAction.livres, intelAction.faveurs);
                                  setIntelAction(null);
                                }
                              }}
                              disabled={!intelAction.targetId}
                              className="btn-gold text-xs flex-1"
                              style={{ padding: '6px 12px', opacity: intelAction.targetId ? 1 : 0.4 }}
                            >
                              Confirmer le chantage
                            </button>
                            <button
                              onClick={() => setIntelAction(null)}
                              className="btn-ghost-dark text-xs"
                              style={{ padding: '6px 12px' }}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-spectral italic text-sm" style={{ color: '#4a4038' }}>Vous n'avez aucun Secret.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-8 py-4"
        style={{ borderTop: '1px solid rgba(200,164,74,0.1)' }}
      >
        <p className="font-spectral italic text-sm" style={{ color: '#4a4038' }}>
          Ces informations ne sont visibles que par vous.
        </p>
        <button onClick={() => router.back()} className="btn-ghost-dark text-xs">
          ← Retour
        </button>
      </footer>
    </main>
  );
}

export default function PrivatePage() {
  return (
    <Suspense>
      <PrivatePageInner />
    </Suspense>
  );
}
