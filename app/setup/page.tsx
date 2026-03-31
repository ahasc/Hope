'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameActions, usePhase } from '@/store/gameStore';
import { useIsHost, useRoomCode, useSessionStore } from '@/store/sessionStore';
import { CHARACTERS } from '@/lib/gameData';
import { CHAR_ICON_MAP, IconHourglass, IconDiamond } from '@/components/GameIcons';
import type { CharacterID } from '@/store/types';

const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterID[];

const CHAR_THEME: Record<CharacterID, { bg: string; accent: string; glow: string }> = {
  marchand:    { bg: 'linear-gradient(160deg, #2a1800 0%, #0a0800 70%)', accent: '#c8a44a', glow: 'rgba(200,164,74,0.45)' },
  aristocrate: { bg: 'linear-gradient(160deg, #2a0028 0%, #0a000e 70%)', accent: '#d060d0', glow: 'rgba(200,60,200,0.45)' },
  receleur:    { bg: 'linear-gradient(160deg, #1c1c1c 0%, #060606 70%)',  accent: '#a0a0a0', glow: 'rgba(160,160,160,0.35)' },
  journaliste: { bg: 'linear-gradient(160deg, #002818 0%, #000e08 70%)', accent: '#40c860', glow: 'rgba(50,180,80,0.45)'  },
  medium:      { bg: 'linear-gradient(160deg, #1a0030 0%, #080010 70%)', accent: '#9060ff', glow: 'rgba(120,60,220,0.45)' },
  heritier:    { bg: 'linear-gradient(160deg, #280c00 0%, #0e0400 70%)', accent: '#e06030', glow: 'rgba(200,80,30,0.45)'  },
};

// ── Card back ─────────────────────────────────────────────

function CardBack({ name, isBot }: { name: string; isBot?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #0d0d22 0%, #060614 100%)',
        border: '1px solid rgba(200,164,74,0.25)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.5), transparent)' }} />

      {/* Corner ornaments */}
      {(['tl','tr','bl','br'] as const).map((pos) => (
        <div key={pos} style={{
          position: 'absolute',
          top:    pos.startsWith('t') ? 10 : undefined,
          bottom: pos.startsWith('b') ? 10 : undefined,
          left:   pos.endsWith('l')  ? 10 : undefined,
          right:  pos.endsWith('r')  ? 10 : undefined,
          width: 14, height: 14,
          borderTop:    pos.startsWith('t') ? '1px solid rgba(200,164,74,0.3)' : 'none',
          borderBottom: pos.startsWith('b') ? '1px solid rgba(200,164,74,0.3)' : 'none',
          borderLeft:   pos.endsWith('l')   ? '1px solid rgba(200,164,74,0.3)' : 'none',
          borderRight:  pos.endsWith('r')   ? '1px solid rgba(200,164,74,0.3)' : 'none',
        }} />
      ))}

      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(200,164,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,164,74,1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Central diamond */}
      <div style={{
        width: 64, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse, rgba(48,112,208,0.15) 0%, transparent 70%)',
        marginBottom: 12,
      }}>
        <IconDiamond size={40} color="rgba(200,164,74,0.4)" />
      </div>

      {/* Divider */}
      <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.3), transparent)', marginBottom: 12 }} />

      {/* Player name */}
      <div className="font-cinzel font-semibold" style={{ color: 'rgba(200,164,74,0.7)', fontSize: '0.8rem', letterSpacing: '0.15em', textAlign: 'center', padding: '0 12px' }}>
        {name}
      </div>
      {isBot && (
        <div className="font-cinzel text-xs" style={{ color: 'rgba(200,164,74,0.5)', letterSpacing: '0.2em', marginTop: 4, fontSize: '0.65rem' }}>
          — BOT —
        </div>
      )}

      {/* Bottom accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.3), transparent)' }} />
    </div>
  );
}

// ── Card front ────────────────────────────────────────────

function CardFront({ character, playerName }: { character: CharacterID; playerName: string }) {
  const char  = CHARACTERS[character];
  const theme = CHAR_THEME[character];
  const Icon  = CHAR_ICON_MAP[character];

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: theme.bg,
        border: `1px solid ${theme.accent}55`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />

      {/* Player name header */}
      <div style={{ padding: '10px 12px 0', textAlign: 'center' }}>
        <span className="font-cinzel font-semibold" style={{ color: theme.accent, fontSize: '0.78rem', letterSpacing: '0.1em' }}>
          {playerName}
        </span>
      </div>

      {/* Icon */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(ellipse at 50% 60%, ${theme.glow} 0%, transparent 65%)`,
      }}>
        <Icon size={56} color={theme.accent} style={{ filter: `drop-shadow(0 0 16px ${theme.glow})` }} />
      </div>

      {/* Bottom: character info */}
      <div style={{
        padding: '10px 12px 10px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        textAlign: 'center',
      }}>
        <div className="font-cinzel font-semibold" style={{ color: theme.accent, fontSize: '0.82rem', letterSpacing: '0.06em', marginBottom: 2 }}>
          {char.name}
        </div>
        <div className="font-spectral italic" style={{ color: `${theme.accent}99`, fontSize: '0.72rem' }}>
          {char.subtitle}
        </div>
      </div>

      {/* Bottom accent */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent}88, transparent)` }} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

type DrawPhase = 'names' | 'drawing';

export default function SetupPage() {
  const router    = useRouter();
  const actions   = useGameActions();
  const isHost    = useIsHost();
  const roomCode  = useRoomCode();
  const phase     = usePhase();

  // Navigate once the server confirms initGame
  useEffect(() => {
    if (phase === 'thresholds') router.push('/setup/thresholds');
    else if (phase === 'accumulation') router.push('/game/accumulation');
  }, [phase, router]);

  const MIN_PLAYERS = 3;

  // Initialise from lobby names — always skip names phase when coming from lobby,
  // auto-padding with bots if fewer than MIN_PLAYERS real players.
  const [playerCount, setPlayerCount] = useState(() => {
    const n = useSessionStore.getState().setupNames.length;
    return n >= 1 ? Math.max(n, MIN_PLAYERS) : MIN_PLAYERS;
  });
  const [names, setNames] = useState<string[]>(() => {
    const sn = useSessionStore.getState().setupNames;
    if (sn.length < 1) return Array(6).fill('');
    const padded = [...sn];
    let botNum = 0;
    while (padded.length < MIN_PLAYERS) { botNum++; padded.push(`Bot ${botNum}`); }
    return [...padded, ...Array(Math.max(0, 6 - padded.length)).fill('')];
  });
  const [drawPhase, setDrawPhase] = useState<DrawPhase>(() =>
    useSessionStore.getState().setupNames.length >= 1 ? 'drawing' : 'names'
  );
  const [assignments, setAssignments] = useState<CharacterID[]>(() => {
    const n = useSessionStore.getState().setupNames.length;
    const total = Math.max(n, MIN_PLAYERS);
    if (n >= 1) return [...CHARACTER_IDS].sort(() => Math.random() - 0.5).slice(0, total) as CharacterID[];
    return [];
  });
  const [firstHolder, setFirstHolder] = useState(() => {
    const n = useSessionStore.getState().setupNames.length;
    const total = Math.max(n, MIN_PLAYERS);
    return n >= 1 ? Math.floor(Math.random() * total) : 0;
  });
  const [dealing, setDealing] = useState(() =>
    useSessionStore.getState().setupNames.length >= 1
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [drawKey,       setDrawKey]       = useState(0);
  const [botFlags, setBotFlags] = useState<boolean[]>(() => {
    const n = useSessionStore.getState().setupNames.length;
    const total = Math.max(n, MIN_PLAYERS);
    // Lobby players = false, auto-added bot slots = true
    return Array(total).fill(false).map((_, i) => i >= n);
  });

  // Clear lobby names after reading (they're now in component state)
  useEffect(() => {
    useSessionStore.getState().setSetupNames([]);
  }, []);

  const activeNames = names.slice(0, playerCount);
  const allRevealed = revealedCount >= playerCount;

  // After deal animation, start auto-flipping cards one by one
  useEffect(() => {
    if (!dealing) return;
    const dealDuration = playerCount * 130 + 550;
    const t = setTimeout(() => setDealing(false), dealDuration);
    return () => clearTimeout(t);
  }, [dealing, playerCount, drawKey]);

  useEffect(() => {
    if (dealing || drawPhase !== 'drawing' || allRevealed) return;
    const t = setTimeout(() => setRevealedCount((n) => n + 1), 650);
    return () => clearTimeout(t);
  }, [dealing, drawPhase, revealedCount, allRevealed]);

  function startDraw() {
    let count = playerCount;
    let newNames = [...names];
    let newBotFlags = [...botFlags];

    // Auto-fill bots to reach minimum player count
    if (count < MIN_PLAYERS) {
      let botNum = newBotFlags.slice(0, count).filter(Boolean).length;
      while (count < MIN_PLAYERS) {
        botNum++;
        newNames[count] = `Bot ${botNum}`;
        newBotFlags[count] = true;
        count++;
      }
      setNames(newNames);
      setBotFlags(newBotFlags);
      setPlayerCount(count);
    }

    const shuffled = [...CHARACTER_IDS]
      .sort(() => Math.random() - 0.5)
      .slice(0, count) as CharacterID[];
    setAssignments(shuffled);
    setRevealedCount(0);
    setDealing(true);
    setDrawPhase('drawing');
    setDrawKey((k) => k + 1);
    setFirstHolder(Math.floor(Math.random() * count));
  }

  function addBot() {
    if (playerCount >= 6) return;
    const botNum = botFlags.slice(0, playerCount).filter(Boolean).length + 1;
    const newCount = playerCount + 1;
    setNames((prev) => { const n = [...prev]; n[playerCount] = `Bot ${botNum}`; return n; });
    setBotFlags((prev) => { const f = [...prev]; f[playerCount] = true; return f; });
    setPlayerCount(newCount);
    const shuffled = [...CHARACTER_IDS].sort(() => Math.random() - 0.5).slice(0, newCount) as CharacterID[];
    setAssignments(shuffled);
    setRevealedCount(0);
    setDealing(true);
    setDrawKey((k) => k + 1);
    setFirstHolder(Math.floor(Math.random() * newCount));
  }

  function removeBot() {
    if (playerCount <= 3 || !botFlags[playerCount - 1]) return;
    const newCount = playerCount - 1;
    setPlayerCount(newCount);
    setBotFlags((prev) => { const f = [...prev]; f[newCount] = false; return f; });
    const shuffled = [...CHARACTER_IDS].sort(() => Math.random() - 0.5).slice(0, newCount) as CharacterID[];
    setAssignments(shuffled);
    setRevealedCount(0);
    setDealing(true);
    setDrawKey((k) => k + 1);
    setFirstHolder(Math.floor(Math.random() * newCount));
  }

  function handleConfirm() {
    const setups = activeNames.map((name, i) => ({
      name: name.trim(),
      character: assignments[i],
      isBot: botFlags[i] ?? false,
    }));
    actions.initGame(setups, firstHolder);
  }

  // ── Non-host waiting screen ──────────────────────────────
  if (!isHost) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#04040f' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <IconHourglass size={48} color="#4a4038" />
          </div>
          <div className="font-cinzel font-semibold mb-2" style={{
            fontSize: '1.5rem',
            background: 'linear-gradient(180deg, #f0d070 0%, #c8a44a 60%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            L'hôte configure la partie
          </div>
          <p className="font-spectral italic text-sm mt-4 mb-8" style={{ color: '#5a5040', lineHeight: 1.7 }}>
            Les personnages vont être tirés au sort. La partie démarrera automatiquement.
          </p>
          {roomCode && (
            <div className="font-cinzel font-black text-center" style={{
              fontSize: '2rem', letterSpacing: '0.4em',
              color: '#c8a44a', padding: '20px 32px',
              border: '1px solid rgba(200,164,74,0.3)',
              background: 'rgba(200,164,74,0.05)',
            }}>
              {roomCode}
            </div>
          )}
          <p className="font-cinzel text-xs mt-3" style={{ color: '#4a4038', letterSpacing: '0.2em' }}>
            CODE DE SALLE
          </p>
        </div>
      </main>
    );
  }

  // ── Phase : saisie des noms ──────────────────────────────
  if (drawPhase === 'names') {
    const canDraw = activeNames.every((n) => n.trim().length > 0);

    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#04040f', padding: '40px 24px' }}>
        {/* Background glow */}
        <div aria-hidden style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(48,112,208,0.06) 0%, transparent 70%)',
        }} />

        <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div className="text-center mb-10">
            {roomCode && (
              <div className="font-cinzel font-black mb-6" style={{ fontSize: '1.8rem', letterSpacing: '0.4em', color: '#c8a44a' }}>
                {roomCode}
              </div>
            )}
            <p className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#60584a', letterSpacing: '0.45em' }}>
              Mise en place
            </p>
            <h2 className="font-cinzel font-semibold" style={{
              fontSize: '2rem',
              background: 'linear-gradient(180deg, #f0d070 0%, #c8a44a 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Les joueurs
            </h2>
          </div>

          {/* Player count */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', letterSpacing: '0.35em' }}>
              Joueurs
            </span>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className="font-cinzel font-bold"
                style={{
                  width: 44, height: 44, fontSize: '1rem',
                  border: n === playerCount ? '1px solid rgba(200,164,74,0.7)' : '1px solid rgba(200,164,74,0.2)',
                  background: n === playerCount ? 'rgba(200,164,74,0.14)' : 'none',
                  color: n === playerCount ? '#f0d070' : '#5a5040',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Bot fill notice */}
          {playerCount < MIN_PLAYERS && (
            <div className="font-cinzel text-xs text-center mb-6" style={{ color: '#6a5a3a', letterSpacing: '0.1em', lineHeight: 1.6 }}>
              {MIN_PLAYERS - playerCount} bot{MIN_PLAYERS - playerCount > 1 ? 's' : ''} seront ajoutés automatiquement pour atteindre {MIN_PLAYERS} joueurs
            </div>
          )}

          {/* Name inputs */}
          <div className="flex flex-col gap-3 mb-8">
            {Array.from({ length: playerCount }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-cinzel text-xs" style={{ color: '#60584a', width: 20, textAlign: 'right', flexShrink: 0, fontSize: '0.85rem' }}>
                  {i + 1}
                </span>
                <input
                  type="text"
                  placeholder={botFlags[i] ? `Bot ${botFlags.slice(0, i+1).filter(Boolean).length}` : `Joueur ${i + 1}`}
                  value={names[i]}
                  onChange={(e) => {
                    if (botFlags[i]) return;
                    setNames((prev) => { const next = [...prev]; next[i] = e.target.value; return next; });
                  }}
                  disabled={botFlags[i]}
                  maxLength={16}
                  className="input-dark font-cinzel flex-1"
                  style={{ fontSize: '1rem', letterSpacing: '0.05em', opacity: botFlags[i] ? 0.5 : 1 }}
                />
                <button
                  onClick={() => {
                    const isNowBot = !botFlags[i];
                    setBotFlags((prev) => { const f = [...prev]; f[i] = isNowBot; return f; });
                    if (isNowBot) {
                      const botNum = botFlags.slice(0, playerCount).filter((b, j) => b && j !== i).length + 1;
                      setNames((prev) => { const n = [...prev]; n[i] = `Bot ${botNum}`; return n; });
                    } else {
                      setNames((prev) => { const n = [...prev]; n[i] = ''; return n; });
                    }
                  }}
                  className="font-cinzel text-xs"
                  style={{
                    padding: '6px 10px',
                    border: botFlags[i] ? '1px solid rgba(200,164,74,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: botFlags[i] ? 'rgba(200,164,74,0.1)' : 'rgba(255,255,255,0.02)',
                    color: botFlags[i] ? '#c8a44a' : '#4a4038',
                    cursor: 'pointer',
                    flexShrink: 0,
                    letterSpacing: '0.1em',
                    fontSize: '0.75rem',
                  }}
                >
                  BOT
                </button>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={startDraw}
            disabled={!canDraw}
            className="btn-gold w-full"
            style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem', letterSpacing: '0.3em', fontSize: '1rem' }}
          >
            Tirer les personnages →
          </button>
        </div>
      </main>
    );
  }

  // ── Phase : tirage des cartes ────────────────────────────

  const CARD_W = 158;
  const CARD_H = 240;
  const GAP    = 16;
  const totalW = playerCount * CARD_W + (playerCount - 1) * GAP;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#04040f', padding: '40px 24px' }}>
      {/* Background glow */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(48,112,208,0.07) 0%, transparent 70%)',
      }} />

      {/* Title */}
      <div className="text-center mb-12 relative z-10">
        <p className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#60584a', letterSpacing: '0.5em' }}>
          {dealing ? 'Distribution en cours…' : allRevealed ? 'Les destins sont scellés' : 'Révélation des personnages'}
        </p>
        <h2 className="font-cinzel font-semibold" style={{
          fontSize: '1.8rem',
          background: 'linear-gradient(180deg, #f0d070 0%, #c8a44a 60%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {dealing ? 'Le sort en est jeté' : allRevealed ? 'Confirmez les rôles' : 'Qui sera maudit ?'}
        </h2>
      </div>

      {/* Cards */}
      <div
        key={drawKey}
        style={{
          display: 'flex', gap: GAP,
          maxWidth: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative', zIndex: 10,
        }}
      >
        {activeNames.map((name, i) => {
          const character  = assignments[i];
          const isFlipped  = !dealing && i < revealedCount;
          const theme      = character ? CHAR_THEME[character] : null;
          const dealDelay  = `${i * 130}ms`;

          return (
            <div
              key={i}
              style={{
                perspective: '900px',
                width: CARD_W, height: CARD_H, flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '100%', height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
                  // Deal animation
                  animation: `card-deal 0.5s ease both`,
                  animationDelay: dealDelay,
                  // Post-reveal glow
                  ...(isFlipped && theme ? {
                    '--glow-color': theme.glow,
                    animation: `card-glow-reveal 1.2s ease forwards`,
                  } as React.CSSProperties : {}),
                }}
              >
                {/* Back */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
                  <CardBack name={name} isBot={botFlags[i] ?? false} />
                </div>
                {/* Front */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  {character && <CardFront character={character} playerName={name} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls (visible once all revealed) */}
      {allRevealed && (
        <div
          className="flex flex-col items-center gap-6 mt-12 relative z-10"
          style={{ width: '100%', maxWidth: 560 }}
        >
          {/* First holder display */}
          <div style={{ width: '100%', padding: '16px 24px', border: '1px solid rgba(48,112,208,0.25)', background: 'rgba(20,40,100,0.08)', textAlign: 'center' }}>
            <div className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: '#60584a', letterSpacing: '0.4em' }}>
              Premier détenteur du Hope Diamond
            </div>
            <div className="font-cinzel font-bold flex items-center justify-center gap-2" style={{ color: '#80b0ff', fontSize: '1.2rem' }}>
              <IconDiamond size={16} color="#3070d0" />
              {activeNames[firstHolder]}
            </div>
          </div>

          {/* Bot management */}
          <div className="flex items-center justify-between w-full">
            <div className="font-cinzel text-xs" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.2em' }}>
              {botFlags.slice(0, playerCount).filter(Boolean).length} bot{botFlags.slice(0, playerCount).filter(Boolean).length !== 1 ? 's' : ''} · {playerCount - botFlags.slice(0, playerCount).filter(Boolean).length} humain{playerCount - botFlags.slice(0, playerCount).filter(Boolean).length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              {botFlags[playerCount - 1] && playerCount > 3 && (
                <button onClick={removeBot} className="btn-ghost-dark text-xs" style={{ padding: '6px 14px' }}>
                  − Retirer bot
                </button>
              )}
              {playerCount < 6 && (
                <button onClick={addBot} className="btn-ghost-dark text-xs" style={{ padding: '6px 14px', color: '#c8a44a', borderColor: 'rgba(200,164,74,0.3)' }}>
                  + Ajouter bot
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 w-full">
            <button
              onClick={startDraw}
              className="btn-ghost-dark flex-1"
              style={{ letterSpacing: '0.2em' }}
            >
              Relancer le tirage
            </button>
            <button
              onClick={handleConfirm}
              className="btn-gold flex-1"
              style={{ letterSpacing: '0.25em', paddingTop: '0.9rem', paddingBottom: '0.9rem' }}
            >
              Confirmer →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
