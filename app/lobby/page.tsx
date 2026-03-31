'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import { useSessionStore } from '@/store/sessionStore';
import type { GameState } from '@/store/types';

type Screen = 'connect' | 'waiting';

interface Member {
  name: string;
  isHost: boolean;
}

const PHASE_ROUTES: Record<string, string> = {
  thresholds: '/setup/thresholds',
  accumulation: '/game/accumulation',
  'marche-noir': '/game/marche-noir',
  evenement: '/game/evenement',
  legs: '/game/legs',
  end: '/game/end',
};

export default function LobbyPage() {
  const router = useRouter();
  const syncFromServer = useGameStore((s) => s.syncFromServer);
  const setRoom = useSessionStore((s) => s.setRoom);
  const setPlayerId = useSessionStore((s) => s.setPlayerId);
  const setSetupNames = useSessionStore((s) => s.setSetupNames);

  const [screen, setScreen] = useState<Screen>('connect');
  const [currentIsHost, setCurrentIsHost] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  const [hostName, setHostName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onMembers = ({ members: list }: { members: Member[] }) => {
      setMembers(list);
    };

    const onSetupStarted = ({ names }: { names: string[] }) => {
      useSessionStore.getState().setSetupNames(names);
      router.push('/setup');
    };

    socket.on('room_members', onMembers);
    socket.on('setup_started', onSetupStarted);

    return () => {
      socket.off('room_members', onMembers);
      socket.off('setup_started', onSetupStarted);
    };
  }, [router]);

  function handleCreate() {
    const name = hostName.trim();
    if (!name) return;
    setLoading(true);
    setError('');
    const socket = getSocket();
    if (!socket) { setError('Connexion impossible.'); setLoading(false); return; }

    socket.once('room_created', ({ roomCode, playerId, isHost, state }: { roomCode: string; playerId: string | null; isHost: boolean; state: GameState }) => {
      setRoom(roomCode, playerId, isHost);
      syncFromServer(state);
      setLoading(false);
      setCurrentRoomCode(roomCode);
      setCurrentIsHost(true);
      setMembers([{ name, isHost: true }]);
      setScreen('waiting');
    });

    socket.emit('create_room', { hostName: name });
  }

  function handleJoin() {
    const name = joinName.trim();
    const code = joinCode.trim().toUpperCase();
    if (!name || !code) return;
    setLoading(true);
    setError('');
    const socket = getSocket();
    if (!socket) { setError('Connexion impossible.'); setLoading(false); return; }

    const cleanup = () => {
      socket.off('room_joined');
      socket.off('room_error');
    };

    socket.once('room_joined', ({ roomCode, playerId, isHost, state }: { roomCode: string; playerId: string | null; isHost: boolean; state: GameState }) => {
      cleanup();
      setRoom(roomCode, playerId, isHost);
      syncFromServer(state);
      if (playerId === null) setPlayerId(null);
      setLoading(false);

      // If game already in progress, navigate directly
      if (state.phase !== 'setup') {
        router.push(PHASE_ROUTES[state.phase] ?? '/setup');
        return;
      }

      setCurrentRoomCode(roomCode);
      setCurrentIsHost(false);
      setScreen('waiting');
    });

    socket.once('room_error', ({ message }: { message: string }) => {
      cleanup();
      setError(message);
      setLoading(false);
    });

    socket.emit('join_room', { roomCode: code, playerName: name });
  }

  function handleStart() {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('start_setup', { roomCode: currentRoomCode });
  }

  // ── Waiting room ────────────────────────────────────────
  if (screen === 'waiting') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#04040f', padding: '40px 24px' }}>
        <div aria-hidden style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'conic-gradient(from 180deg at 50% 110%, transparent 0deg, rgba(20,50,140,0.06) 15deg, transparent 30deg)',
          animation: 'rays-spin 30s linear infinite',
        }} />

        <div className="relative z-10 w-full" style={{ maxWidth: 480 }}>
          {/* Room code */}
          <div className="text-center mb-10">
            <p className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#4a4038', letterSpacing: '0.5em', fontSize: '0.95rem' }}>
              Code de salle
            </p>
            <div
              className="font-cinzel font-black"
              style={{
                fontSize: '2.8rem', letterSpacing: '0.5em', color: '#c8a44a',
                padding: '16px 32px',
                border: '1px solid rgba(200,164,74,0.3)',
                background: 'rgba(200,164,74,0.05)',
                display: 'inline-block',
              }}
            >
              {currentRoomCode}
            </div>
            <p className="font-spectral italic mt-3" style={{ color: '#5a5040', fontSize: '1rem' }}>
              Partagez ce code avec les autres joueurs
            </p>
          </div>

          {/* Member list */}
          <div style={{
            background: 'linear-gradient(160deg, #0d0d22 0%, #080818 100%)',
            border: '1px solid rgba(200,164,74,0.18)',
            marginBottom: 24,
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.5), transparent)' }} />
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div className="font-cinzel text-xs tracking-widest uppercase mb-4" style={{ color: '#60584a', letterSpacing: '0.4em', fontSize: '0.95rem' }}>
                Joueurs connectés — {members.length}
              </div>
              <div className="flex flex-col gap-3">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#40c060',
                      boxShadow: '0 0 6px rgba(60,180,80,0.5)',
                      flexShrink: 0,
                    }} />
                    <span className="font-cinzel font-semibold flex-1" style={{ color: '#d8d0c0', fontSize: '1.05rem' }}>
                      {m.name}
                    </span>
                    {m.isHost && (
                      <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#c8a44a', fontSize: '0.8rem', letterSpacing: '0.3em' }}>
                        Hôte
                      </span>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="font-spectral italic" style={{ color: '#4a4038', fontSize: '1rem' }}>
                    En attente de joueurs...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action */}
          {currentIsHost ? (
            <button
              onClick={handleStart}
              disabled={members.length < 1}
              className="btn-gold w-full"
              style={{ letterSpacing: '0.3em', paddingTop: '1rem', paddingBottom: '1rem' }}
            >
              Commencer la configuration →
            </button>
          ) : (
            <div className="text-center" style={{ padding: '20px', border: '1px solid rgba(200,164,74,0.1)', background: 'rgba(200,164,74,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8a44a', animation: 'hint-blink 1.5s ease-in-out infinite' }} />
                <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#60584a', letterSpacing: '0.3em', fontSize: '0.95rem' }}>
                  En attente de l'hôte
                </span>
              </div>
              <p className="font-spectral italic" style={{ color: '#4a4038', fontSize: '1rem' }}>
                L'hôte lancera la configuration de la partie.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Connect screen ───────────────────────────────────────
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#04040f', padding: '40px 24px' }}
    >
      {/* Background */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'conic-gradient(from 180deg at 50% 110%, transparent 0deg, rgba(20,50,140,0.06) 15deg, transparent 30deg)',
        animation: 'rays-spin 30s linear infinite',
      }} />

      {/* Title */}
      <div className="text-center mb-10 relative z-10">
        <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#4a4038', letterSpacing: '0.5em', fontSize: '0.95rem' }}>
          Le Diamant Hope
        </div>
        <h1
          className="font-cinzel-decorative font-black"
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            letterSpacing: '0.16em',
            background: 'linear-gradient(180deg, #fff0c0 0%, #f0d070 25%, #c8a44a 60%, #8b6914 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          Hope
        </h1>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth: 520,
          background: 'linear-gradient(160deg, #0d0d22 0%, #080818 100%)',
          border: '1px solid rgba(200,164,74,0.2)',
        }}
      >
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(200,164,74,0.5), transparent)' }} />

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(200,164,74,0.1)' }}>
          {(['create', 'join'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 font-cinzel text-xs tracking-widest uppercase py-4 transition-colors"
              style={{
                fontSize: '0.95rem', letterSpacing: '0.3em',
                color: tab === t ? '#c8a44a' : '#60584a',
                background: tab === t ? 'rgba(200,164,74,0.05)' : 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid rgba(200,164,74,0.5)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {t === 'create' ? 'Créer une salle' : 'Rejoindre'}
            </button>
          ))}
        </div>

        <div style={{ padding: '32px 40px 40px' }}>
          {tab === 'create' ? (
            <>
              <p className="font-spectral italic text-sm mb-6" style={{ color: '#5a5040', lineHeight: 1.7 }}>
                Vous serez l'hôte de la partie. Partagez le code de salle avec les autres joueurs.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-cinzel text-xs tracking-widest uppercase block mb-2" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
                    Votre nom
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder="Ex: Alexandre"
                    maxLength={20}
                    className="input-dark w-full font-cinzel"
                    style={{ fontSize: '1rem' }}
                  />
                </div>
                <button
                  onClick={handleCreate}
                  disabled={!hostName.trim() || loading}
                  className="btn-gold w-full"
                  style={{ letterSpacing: '0.3em', paddingTop: '0.9rem', paddingBottom: '0.9rem' }}
                >
                  {loading ? 'Création...' : 'Créer la salle →'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-spectral italic text-sm mb-6" style={{ color: '#5a5040', lineHeight: 1.7 }}>
                Entrez le code partagé par l'hôte et votre prénom pour rejoindre la salle.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-cinzel text-xs tracking-widest uppercase block mb-2" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
                    Code de salle
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Ex: AB12CD"
                    maxLength={8}
                    className="input-dark w-full font-cinzel text-center"
                    style={{ fontSize: '1.4rem', letterSpacing: '0.5em' }}
                  />
                </div>
                <div>
                  <label className="font-cinzel text-xs tracking-widest uppercase block mb-2" style={{ color: '#60584a', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
                    Votre prénom
                  </label>
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    placeholder="Ex: Alexandre"
                    maxLength={20}
                    className="input-dark w-full font-cinzel"
                    style={{ fontSize: '1rem' }}
                  />
                </div>
                <button
                  onClick={handleJoin}
                  disabled={!joinName.trim() || !joinCode.trim() || loading}
                  className="btn-gold w-full"
                  style={{ letterSpacing: '0.3em', paddingTop: '0.9rem', paddingBottom: '0.9rem' }}
                >
                  {loading ? 'Connexion...' : 'Rejoindre →'}
                </button>
              </div>
            </>
          )}

          {error && (
            <div
              className="font-spectral italic text-sm mt-4 text-center"
              style={{
                color: '#c06060', padding: '10px 16px',
                background: 'rgba(60,0,0,0.2)',
                border: '1px solid rgba(160,30,30,0.3)',
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-10 mt-10 relative z-10">
        {[['3–6', 'Joueurs'], ['45\'', 'Durée'], ['8', 'Tours']].map(([val, lbl]) => (
          <div key={lbl} className="text-center">
            <div className="font-cinzel font-bold" style={{ color: '#c8a44a', fontSize: '1.1rem' }}>{val}</div>
            <div className="font-cinzel text-xs tracking-widest uppercase" style={{ color: '#4a4038', fontSize: '1rem', marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
