'use client';

import { create } from 'zustand';

interface SessionState {
  roomCode: string | null;
  playerId: string | null;
  isHost: boolean;
  setupNames: string[];
  setRoom: (roomCode: string, playerId: string | null, isHost: boolean) => void;
  setPlayerId: (playerId: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setSetupNames: (names: string[]) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  roomCode: null,
  playerId: null,
  isHost: false,
  setupNames: [],
  setRoom: (roomCode, playerId, isHost) => set({ roomCode, playerId, isHost }),
  setPlayerId: (playerId) => set({ playerId }),
  setIsHost: (isHost) => set({ isHost }),
  setSetupNames: (setupNames) => set({ setupNames }),
  clear: () => set({ roomCode: null, playerId: null, isHost: false, setupNames: [] }),
}));

export const useIsHost = () => useSessionStore((s) => s.isHost);
export const usePlayerId = () => useSessionStore((s) => s.playerId);
export const useRoomCode = () => useSessionStore((s) => s.roomCode);
