'use client';

import { create } from 'zustand';
import type { GameState, Player, PlayerSetup } from './types';
import { getSocket } from '@/lib/socket';
import { useSessionStore } from './sessionStore';

const initialState: GameState = {
  phase: 'setup',
  currentTurn: 1,
  currentHolderIndex: 0,
  players: [],
  eventDeck: [],
  eventDiscard: [],
  pendingEvent: null,
  marketTimerStart: null,
  marketStep: 'closed',
  silentOffers: {},
  finalEventTriggered: false,
  gameOver: false,
  victory: null,
  thresholdSetupIndex: 0,
};

interface GameStoreState extends GameState {
  syncFromServer: (state: GameState) => void;
}

export const useGameStore = create<GameStoreState>()((set) => ({
  ...initialState,
  syncFromServer: (state) => set({ ...state }),
}));

function emitAction(action: string, payload: Record<string, any> = {}) {
  const socket = getSocket();
  const { roomCode } = useSessionStore.getState();
  if (socket && roomCode) {
    socket.emit('game_action', { roomCode, action, payload });
  }
}

export function useGameActions() {
  return {
    initGame: (playerSetups: PlayerSetup[], firstHolderIdx: number) =>
      emitAction('initGame', { playerSetups, firstHolderIdx }),
    setThreshold: (playerId: string, value: number) =>
      emitAction('setThreshold', { playerId, value }),
    confirmThreshold: (playerId: string, value: number) =>
      emitAction('confirmThreshold', { playerId, value }),
    advanceThresholdSetup: () => emitAction('advanceThresholdSetup'),
    startGame: () => emitAction('startGame'),
    resolveAccumulation: () => emitAction('resolveAccumulation'),
    startMarket: () => emitAction('startMarket'),
    setSilentOffer: (playerId: string, offer: string) =>
      emitAction('setSilentOffer', { playerId, offer }),
    openMarket: () => emitAction('openMarket'),
    closeMarket: () => emitAction('closeMarket'),
    drawAndTriggerEvent: () => emitAction('drawAndTriggerEvent'),
    resolveEvent: (targetId?: string) => emitAction('resolveEvent', { targetId }),
    dismissEvent: () => emitAction('dismissEvent'),
    passHope: (toPlayerId: string, price?: { livres?: number; faveurs?: number }) =>
      emitAction('passHope', { toPlayerId, price }),
    forcePassHope: (fromId: string, toId: string) =>
      emitAction('forcePassHope', { fromId, toId }),
    keepHope: () => emitAction('keepHope'),
    receleurConceal: () => emitAction('receleurConceal'),
    receleurUncover: (revealerId: string) => emitAction('receleurUncover', { revealerId }),
    marchandForceAuction: () => emitAction('marchandForceAuction'),
    transferLivres: (fromId: string, toId: string, amount: number) =>
      emitAction('transferLivres', { fromId, toId, amount }),
    transferFaveurs: (fromId: string, toId: string, amount: number) =>
      emitAction('transferFaveurs', { fromId, toId, amount }),
    giveManiganceCard: (fromId: string, toId: string, cardId: string) =>
      emitAction('giveManiganceCard', { fromId, toId, cardId }),
    giveIntelCard: (fromId: string, toId: string, cardId: string) =>
      emitAction('giveIntelCard', { fromId, toId, cardId }),
    discardManigance: (playerId: string, cardId: string) =>
      emitAction('discardManigance', { playerId, cardId }),
    discardIntel: (playerId: string, cardId: string) =>
      emitAction('discardIntel', { playerId, cardId }),
    chanterIntel: (playerId: string, cardId: string, targetId: string, livres: number, faveurs: number) =>
      emitAction('chanterIntel', { playerId, cardId, targetId, livres, faveurs }),
    playManigance: (playerId: string, cardId: string, targetId: string | undefined, livres: number, faveurs: number) =>
      emitAction('playManigance', { playerId, cardId, targetId, livres, faveurs }),
    marchandBuyIntel: (playerId: string) =>
      emitAction('marchandBuyIntel', { playerId }),
    eliminatePlayer: (playerId: string) =>
      emitAction('eliminatePlayer', { playerId }),
    advanceTurn: () => emitAction('advanceTurn'),
    endGame: () => emitAction('endGame'),
    resetGame: () => emitAction('resetGame'),
    updatePlayer: (playerId: string, patch: Partial<Player>) =>
      emitAction('updatePlayer', { playerId, patch }),
  };
}

export const usePlayers = () => useGameStore((s) => s.players);
export const usePhase = () => useGameStore((s) => s.phase);
export const useHolder = () => useGameStore((s) => s.players.find((p) => p.isHopeHolder));
export const useCurrentTurn = () => useGameStore((s) => s.currentTurn);
