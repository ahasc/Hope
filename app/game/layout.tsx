'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, usePhase } from '@/store/gameStore';
import { useRoomCode } from '@/store/sessionStore';
import { GameHUD } from '@/components/GameHUD';

const PHASE_ROUTES: Record<string, string> = {
  accumulation: '/game/accumulation',
  'marche-noir': '/game/marche-noir',
  evenement: '/game/evenement',
  legs: '/game/legs',
  end: '/game/end',
};

// Pages that the user can navigate to manually — don't force-redirect away from them on phase change
const SIDE_PAGES = ['/game/scoreboard', '/game/private'];

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const phase = usePhase();
  const players = useGameStore((s) => s.players);
  const roomCode = useRoomCode();

  useEffect(() => {
    if (!roomCode) {
      router.replace('/');
      return;
    }
    if (phase === 'setup' || phase === 'thresholds') {
      router.replace('/setup');
      return;
    }
    const target = PHASE_ROUTES[phase];
    if (target && typeof window !== 'undefined') {
      const current = window.location.pathname;
      const onSidePage = SIDE_PAGES.some((p) => current.startsWith(p));
      if (!onSidePage && current !== target) {
        router.replace(target);
      }
    }
  }, [phase, roomCode, router]);

  if (!roomCode || players.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <GameHUD />
      <div className="flex-1">{children}</div>
    </div>
  );
}
