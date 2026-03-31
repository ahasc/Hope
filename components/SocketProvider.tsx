'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import { useSessionStore } from '@/store/sessionStore';
import type { GameState } from '@/store/types';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onStateUpdate({ state }: { state: GameState }) {
      useGameStore.getState().syncFromServer(state);
    }

    function onPlayerAssigned({ playerId }: { playerId: string | null }) {
      useSessionStore.getState().setPlayerId(playerId);
    }

    function onHostAssigned() {
      useSessionStore.getState().setIsHost(true);
    }

    socket.on('state_update', onStateUpdate);
    socket.on('player_assigned', onPlayerAssigned);
    socket.on('host_assigned', onHostAssigned);

    // Rejoin room on reconnect if we have a session
    socket.on('connect', () => {
      const { roomCode, playerId } = useSessionStore.getState();
      if (roomCode) {
        socket.emit('rejoin_room', { roomCode, playerId });
      }
    });

    return () => {
      socket.off('state_update', onStateUpdate);
      socket.off('player_assigned', onPlayerAssigned);
      socket.off('host_assigned', onHostAssigned);
    };
  }, []);

  return <>{children}</>;
}
