'use client';

import { useEffect, useState } from 'react';
import { useGameStore, useGameActions } from '@/store/gameStore';
import { useIsHost } from '@/store/sessionStore';

const SILENT_DURATION = 30_000;
const OPEN_DURATION = 150_000;
const TOTAL_DURATION = SILENT_DURATION + OPEN_DURATION;

export function useMarketTimer() {
  const marketTimerStart = useGameStore((s) => s.marketTimerStart);
  const marketStep = useGameStore((s) => s.marketStep);
  const silentOffers = useGameStore((s) => s.silentOffers);
  const players = useGameStore((s) => s.players);
  const actions = useGameActions();
  const isHost = useIsHost();
  const [, forceUpdate] = useState(0);

  const alive = players.filter((p) => p.isAlive);
  const allReady =
    marketStep === 'open' &&
    alive.length > 0 &&
    alive.every((p) => silentOffers[p.id] === '__ready__');

  useEffect(() => {
    if (!marketTimerStart) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - marketTimerStart;

      if (isHost && elapsed >= SILENT_DURATION && marketStep === 'silent') {
        actions.openMarket();
      }

      if (isHost && elapsed >= TOTAL_DURATION && marketStep === 'open') {
        actions.closeMarket();
      }

      forceUpdate((n) => n + 1);
    }, 500);
    return () => clearInterval(id);
  }, [marketTimerStart, marketStep, isHost]);

  // Auto-close when all players are ready
  useEffect(() => {
    if (isHost && allReady) {
      actions.closeMarket();
    }
  }, [isHost, allReady]);

  if (!marketTimerStart) return { step: 'closed' as const, elapsed: 0, remaining: 0, progress: 0, allReady: false, readyCount: 0 };

  const elapsed = Date.now() - marketTimerStart;
  const readyCount = alive.filter((p) => silentOffers[p.id] === '__ready__').length;

  if (elapsed < SILENT_DURATION) {
    const remaining = SILENT_DURATION - elapsed;
    return {
      step: 'silent' as const,
      elapsed,
      remaining,
      progress: elapsed / SILENT_DURATION,
      allReady: false,
      readyCount,
    };
  }

  const openElapsed = elapsed - SILENT_DURATION;
  const remaining = Math.max(0, OPEN_DURATION - openElapsed);
  return {
    step: elapsed >= TOTAL_DURATION ? ('closed' as const) : ('open' as const),
    elapsed: openElapsed,
    remaining,
    progress: openElapsed / OPEN_DURATION,
    allReady,
    readyCount,
  };
}
