'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePhase } from '@/store/gameStore';

const PHASE_ROUTES: Record<string, string> = {
  accumulation: '/game/accumulation',
  'marche-noir': '/game/marche-noir',
  evenement: '/game/evenement',
  legs: '/game/legs',
  end: '/game/end',
};

export default function GamePage() {
  const router = useRouter();
  const phase = usePhase();

  useEffect(() => {
    const target = PHASE_ROUTES[phase];
    if (target) router.replace(target);
    else router.replace('/');
  }, [phase, router]);

  return null;
}
