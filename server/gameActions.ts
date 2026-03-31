import type { GameState, Player, PlayerSetup, IntelCard } from '@/store/types';
import { CHARACTERS, EVENT_CARDS, MANIGANCE_CARDS, shuffle } from '@/lib/gameData';
import { applyEventEffect, checkVictory, isGameOver } from '@/lib/gameLogic';

export const initialState: GameState = {
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

export function createInitialState(): GameState {
  return { ...initialState };
}

export function processAction(
  state: GameState,
  action: string,
  payload: Record<string, any> = {}
): GameState {
  switch (action) {
    case 'initGame':       return initGame(state, payload.playerSetups, payload.firstHolderIdx);
    case 'setThreshold':   return setThreshold(state, payload.playerId, payload.value);
    case 'startGame':      return { ...state, phase: 'accumulation' };
    case 'resolveAccumulation': return resolveAccumulation(state);
    case 'startMarket':    return { ...state, marketTimerStart: Date.now(), marketStep: 'silent', phase: 'marche-noir' };
    case 'setSilentOffer': return { ...state, silentOffers: { ...state.silentOffers, [payload.playerId]: payload.offer } };
    case 'openMarket':     return { ...state, marketStep: 'open', silentOffers: {} };
    case 'closeMarket':    return { ...state, marketStep: 'closed', phase: 'legs' };
    case 'drawAndTriggerEvent': return drawAndTriggerEvent(state);
    case 'resolveEvent':   return resolveEvent(state, payload.targetId);
    case 'dismissEvent':   return dismissEvent(state);
    case 'passHope':       return passHope(state, payload.toPlayerId, payload.price);
    case 'forcePassHope':  return forcePassHope(state, payload.fromId, payload.toId);
    case 'keepHope':       return advanceTurn(state);
    case 'receleurConceal': return receleurConceal(state);
    case 'receleurUncover': return receleurUncover(state);
    case 'marchandForceAuction': return { ...state, phase: 'legs' };
    case 'transferLivres': return transferLivres(state, payload.fromId, payload.toId, payload.amount);
    case 'transferFaveurs': return transferFaveurs(state, payload.fromId, payload.toId, payload.amount);
    case 'giveSecretCard': return giveSecretCard(state, payload.fromId, payload.toId, payload.cardId);
    case 'giveManiganceCard': return giveManiganceCard(state, payload.fromId, payload.toId, payload.cardId);
    case 'giveIntelCard':     return giveIntelCard(state, payload.fromId, payload.toId, payload.cardId);
    case 'discardManigance':  return discardManigance(state, payload.playerId, payload.cardId);
    case 'discardIntel':      return discardIntel(state, payload.playerId, payload.cardId);
    case 'chanterIntel':      return chanterIntel(state, payload.playerId, payload.cardId, payload.targetId, payload.livres ?? 0, payload.faveurs ?? 0);
    case 'playManigance':     return playManigance(state, payload.playerId, payload.cardId, payload.targetId, payload.livres ?? 0, payload.faveurs ?? 0);
    case 'marchandBuyIntel':  return marchandBuyIntel(state, payload.playerId);
    case 'eliminatePlayer':   return eliminatePlayer(state, payload.playerId);
    case 'advanceTurn':    return advanceTurn(state);
    case 'endGame':        return endGame(state);
    case 'resetGame':      return { ...initialState };
    case 'updatePlayer':   return applyUpdatePlayer(state, payload.playerId, payload.patch);
    default: return state;
  }
}

function generateIntelPool(players: Player[]): IntelCard[] {
  const pool: IntelCard[] = [];
  let idx = 0;
  for (const p of players) {
    // Seuil (sauf Héritier dont le seuil est public)
    if (p.character !== 'heritier') {
      pool.push({
        id: `intel_${idx++}`,
        targetPlayerId: p.id,
        category: 'seuil',
        title: `Dossier — ${p.name}`,
        content: `Le Seuil de Malédiction de ${p.name} est ${p.threshold}.`,
      });
    }
    // Une intel par Manigance détenue
    for (const m of p.maniganceCards) {
      pool.push({
        id: `intel_${idx++}`,
        targetPlayerId: p.id,
        category: 'manigance',
        title: `Rumeur — ${p.name}`,
        content: `${p.name} détient la Manigance "${m.title}".`,
      });
    }
  }
  return shuffle(pool);
}

function initGame(state: GameState, playerSetups: PlayerSetup[], firstHolderIdx: number): GameState {
  // Step 1 — Distribute Manigances
  const shuffledManigances = shuffle([...MANIGANCE_CARDS]);
  let mCursor = 0;
  const maniganceSlices = playerSetups.map((setup) => {
    const count = CHARACTERS[setup.character].startingManigances;
    return shuffledManigances.slice(mCursor, mCursor += count);
  });

  // Step 2 — Create players with their Manigances (no intelCards yet)
  const players: Player[] = playerSetups.map((setup, i) => {
    const char = CHARACTERS[setup.character];
    return {
      id: `p${i}`,
      name: setup.name,
      character: setup.character,
      livres: char.startingLivres,
      faveurs: char.startingFaveurs,
      maniganceCards: maniganceSlices[i],
      intelCards: [],
      glory: 0,
      curseTokens: 0,
      threshold: setup.character === 'heritier' ? 3 : (Math.random() < 0.5 ? 4 : 5),
      thresholdRevealed: setup.character === 'heritier',
      isAlive: true,
      isHopeHolder: i === firstHolderIdx,
      isHidden: false,
      isFrozen: false,
      gloryFrozenTurns: 0,
      consecutiveHopeTurns: 0,
      aristocrateEventImmunityUsed: false,
      receleurHasConcealed: false,
      receleurDetected: false,
      aristocrateHeldTwoConsecutive: false,
      journalisteClaimedFrom: [],
      isBot: setup.isBot ?? false,
      eliminatedAt: null,
    };
  });

  // Step 3 — Generate IntelCards from player state and distribute (no self-targeting)
  const intelPool = generateIntelPool(players);
  const intelSlices: IntelCard[][] = players.map(() => []);
  const poolCopy = [...intelPool];
  for (let i = 0; i < players.length; i++) {
    const count = CHARACTERS[playerSetups[i].character].startingIntel;
    let picked = 0;
    for (let j = 0; j < poolCopy.length && picked < count; j++) {
      if (poolCopy[j].targetPlayerId !== players[i].id) {
        intelSlices[i].push(poolCopy.splice(j, 1)[0]);
        j--;
        picked++;
      }
    }
  }
  players.forEach((p, i) => { p.intelCards = intelSlices[i]; });

  return {
    phase: 'thresholds',
    currentTurn: 1,
    currentHolderIndex: firstHolderIdx,
    players,
    eventDeck: shuffle([...EVENT_CARDS]),
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
}

function setThreshold(state: GameState, playerId: string, value: number): GameState {
  return {
    ...state,
    players: state.players.map((p) => p.id === playerId ? { ...p, threshold: value } : p),
  };
}

function resolveAccumulation(state: GameState): GameState {
  const updated = state.players.map((p) => {
    if (!p.isHopeHolder || !p.isAlive) return p;
    const isHeritier = p.character === 'heritier';
    const gloryGain = p.gloryFrozenTurns > 0 ? 0 : isHeritier ? 2 : 1;
    const newConsecutive = p.consecutiveHopeTurns + 1;
    return {
      ...p,
      glory: p.glory + gloryGain,
      curseTokens: p.curseTokens + 1,
      livres: p.livres + (isHeritier ? 1 : 0),
      gloryFrozenTurns: Math.max(0, p.gloryFrozenTurns - 1),
      consecutiveHopeTurns: newConsecutive,
      aristocrateHeldTwoConsecutive:
        p.character === 'aristocrate' && newConsecutive >= 2
          ? true
          : p.aristocrateHeldTwoConsecutive,
    };
  });

  const holder = updated.find((p) => p.isHopeHolder);
  const triggered = holder && holder.curseTokens >= holder.threshold;
  const isAristocrateImmune = holder?.character === 'aristocrate' && !holder.aristocrateEventImmunityUsed;
  const base = { ...state, players: updated };

  if (!triggered) return { ...base, phase: 'marche-noir' };
  if (isAristocrateImmune) {
    return {
      ...base,
      players: updated.map((p) =>
        p.isHopeHolder ? { ...p, curseTokens: 0, aristocrateEventImmunityUsed: true } : p
      ),
      phase: 'marche-noir',
    };
  }
  if (holder?.isHidden) return { ...base, phase: 'marche-noir' };
  return drawAndTriggerEvent({ ...base, phase: 'evenement' });
}

function drawAndTriggerEvent(state: GameState): GameState {
  if (state.eventDeck.length === 0) return endGame(state);
  const [card, ...rest] = state.eventDeck;
  return { ...state, pendingEvent: card, eventDeck: rest, phase: 'evenement' };
}

function resolveEvent(state: GameState, targetId?: string): GameState {
  if (!state.pendingEvent) return state;
  const holder = state.players.find((p) => p.isHopeHolder);
  const newState = applyEventEffect(state, state.pendingEvent, targetId);
  const resolved = {
    ...state,
    ...newState,
    eventDiscard: [...state.eventDiscard, state.pendingEvent],
    pendingEvent: null,
    phase: 'legs' as const,
  };

  // Médium gets intel about the Hope holder each time an event resolves
  const medium = resolved.players.find((p) => p.character === 'medium' && p.isAlive && !p.isHopeHolder);
  if (medium && holder && medium.id !== holder.id) {
    const card = generateOneIntelFor(resolved, medium.id);
    if (card) {
      return {
        ...resolved,
        players: resolved.players.map((p) => p.id === medium.id ? { ...p, intelCards: [...p.intelCards, card] } : p),
      };
    }
  }

  return resolved;
}

function dismissEvent(state: GameState): GameState {
  if (!state.pendingEvent) return state;
  return {
    ...state,
    eventDiscard: [...state.eventDiscard, state.pendingEvent],
    pendingEvent: null,
    phase: 'legs',
  };
}

function passHope(state: GameState, toPlayerId: string, price?: { livres?: number; faveurs?: number }): GameState {
  const holder = state.players.find((p) => p.isHopeHolder);
  const isAristocrate = holder?.character === 'aristocrate';
  const newIntel = isAristocrate && holder ? generateOneIntelFor(state, holder.id) : null;
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.isHopeHolder) {
        const base = { ...p, isHopeHolder: false, isHidden: false, consecutiveHopeTurns: 0, livres: p.livres + (price?.livres ?? 0), faveurs: p.faveurs + (price?.faveurs ?? 0) };
        return newIntel ? { ...base, intelCards: [...base.intelCards, newIntel] } : base;
      }
      if (p.id === toPlayerId) return { ...p, isHopeHolder: true, livres: p.livres - (price?.livres ?? 0), faveurs: p.faveurs - (price?.faveurs ?? 0) };
      return p;
    }),
  };
}

function forcePassHope(state: GameState, fromId: string, toId: string): GameState {
  const from = state.players.find((p) => p.id === fromId);
  if (!from || from.faveurs < 1) return state;
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === fromId) return { ...p, faveurs: p.faveurs - 1 };
      if (p.id === toId) return { ...p, isHopeHolder: true, consecutiveHopeTurns: 0 };
      if (p.isHopeHolder) return { ...p, isHopeHolder: false, consecutiveHopeTurns: 0 };
      return p;
    }),
  };
}

function receleurConceal(state: GameState): GameState {
  const receleur = state.players.find((p) => p.character === 'receleur' && p.isHopeHolder);
  const newIntel = receleur ? generateOneIntelFor(state, receleur.id) : null;
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.character === 'receleur' && p.isHopeHolder) {
        const base = { ...p, isHidden: true, receleurHasConcealed: true };
        return newIntel ? { ...base, intelCards: [...base.intelCards, newIntel] } : base;
      }
      return p;
    }),
  };
}

function receleurUncover(state: GameState): GameState {
  const receleur = state.players.find((p) => p.character === 'receleur');
  if (!receleur || !receleur.isHidden) return state;
  const uncovered = {
    ...state,
    players: state.players.map((p) =>
      p.character === 'receleur' ? { ...p, isHidden: false, receleurDetected: true } : p
    ),
  };
  return drawAndTriggerEvent(uncovered);
}

function transferLivres(state: GameState, fromId: string, toId: string, amount: number): GameState {
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === fromId) return { ...p, livres: Math.max(0, p.livres - amount) };
      if (p.id === toId) return { ...p, livres: p.livres + amount };
      return p;
    }),
  };
}

function transferFaveurs(state: GameState, fromId: string, toId: string, amount: number): GameState {
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === fromId) return { ...p, faveurs: Math.max(0, p.faveurs - amount) };
      if (p.id === toId) return { ...p, faveurs: p.faveurs + amount };
      return p;
    }),
  };
}

function giveSecretCard(state: GameState, fromId: string, toId: string, cardId: string): GameState {
  // Legacy — kept for compatibility; delegates to giveManiganceCard
  return giveManiganceCard(state, fromId, toId, cardId);
}

function giveManiganceCard(state: GameState, fromId: string, toId: string, cardId: string): GameState {
  const card = state.players.find((p) => p.id === fromId)?.maniganceCards.find((c) => c.id === cardId);
  if (!card) return state;
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === fromId) return { ...p, maniganceCards: p.maniganceCards.filter((c) => c.id !== cardId) };
      if (p.id === toId)   return { ...p, maniganceCards: [...p.maniganceCards, card] };
      return p;
    }),
  };
}

function giveIntelCard(state: GameState, fromId: string, toId: string, cardId: string): GameState {
  const card = state.players.find((p) => p.id === fromId)?.intelCards.find((c) => c.id === cardId);
  if (!card) return state;
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === fromId) return { ...p, intelCards: p.intelCards.filter((c) => c.id !== cardId) };
      if (p.id === toId)   return { ...p, intelCards: [...p.intelCards, card] };
      return p;
    }),
  };
}

function discardManigance(state: GameState, playerId: string, cardId: string): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, maniganceCards: p.maniganceCards.filter((c) => c.id !== cardId) } : p
    ),
  };
}

function discardIntel(state: GameState, playerId: string, cardId: string): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, intelCards: p.intelCards.filter((c) => c.id !== cardId) } : p
    ),
  };
}

function chanterIntel(state: GameState, playerId: string, cardId: string, targetId: string, livres: number, faveurs: number): GameState {
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === playerId) return { ...p, intelCards: p.intelCards.filter((c) => c.id !== cardId), livres: p.livres + livres, faveurs: p.faveurs + faveurs };
      if (p.id === targetId) return { ...p, livres: Math.max(0, p.livres - livres), faveurs: Math.max(0, p.faveurs - faveurs) };
      return p;
    }),
  };
}

function generateOneIntelFor(state: GameState, forPlayerId: string): IntelCard | null {
  const pool: IntelCard[] = [];
  let idxBase = Date.now() % 1000000;
  for (const p of state.players) {
    if (p.id === forPlayerId || !p.isAlive) continue;
    if (p.character !== 'heritier') {
      pool.push({ id: `intel_x${idxBase++}`, targetPlayerId: p.id, category: 'seuil', title: `Dossier — ${p.name}`, content: `Le Seuil de Malédiction de ${p.name} est ${p.threshold}.` });
    }
    for (const m of p.maniganceCards) {
      pool.push({ id: `intel_x${idxBase++}`, targetPlayerId: p.id, category: 'manigance', title: `Rumeur — ${p.name}`, content: `${p.name} détient la Manigance "${m.title}".` });
    }
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateIntelForJournaliste(state: GameState): GameState {
  const journaliste = state.players.find((p) => p.character === 'journaliste' && p.isAlive && !p.isHopeHolder);
  if (!journaliste) return state;

  const pool: IntelCard[] = [];
  let idxBase = state.players.reduce((acc, p) => acc + p.intelCards.length + p.maniganceCards.length, 0) * 100 + Date.now() % 100000;

  for (const p of state.players) {
    if (p.id === journaliste.id || !p.isAlive) continue;
    if (p.character !== 'heritier') {
      pool.push({ id: `intel_j${idxBase++}`, targetPlayerId: p.id, category: 'seuil', title: `Dossier — ${p.name}`, content: `Le Seuil de Malédiction de ${p.name} est ${p.threshold}.` });
    }
    for (const m of p.maniganceCards) {
      pool.push({ id: `intel_j${idxBase++}`, targetPlayerId: p.id, category: 'manigance', title: `Rumeur — ${p.name}`, content: `${p.name} détient la Manigance "${m.title}".` });
    }
  }

  if (pool.length === 0) return state;
  const card = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...state,
    players: state.players.map((p) => p.id === journaliste.id ? { ...p, intelCards: [...p.intelCards, card] } : p),
  };
}

function playManigance(state: GameState, playerId: string, cardId: string, targetId: string | undefined, livres: number, faveurs: number): GameState {
  const card = state.players.find((p) => p.id === playerId)?.maniganceCards.find((c) => c.id === cardId);
  if (!card) return state;
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === playerId) return { ...p, maniganceCards: p.maniganceCards.filter((c) => c.id !== cardId), livres: p.livres + livres, faveurs: p.faveurs + faveurs };
      if (p.id === targetId) return { ...p, livres: Math.max(0, p.livres - livres), faveurs: Math.max(0, p.faveurs - faveurs) };
      return p;
    }),
  };
}

function marchandBuyIntel(state: GameState, playerId: string): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.livres < 3 || state.phase !== 'marche-noir') return state;
  const card = generateOneIntelFor(state, playerId);
  if (!card) return state;
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, livres: p.livres - 3, intelCards: [...p.intelCards, card] } : p
    ),
  };
}

function eliminatePlayer(state: GameState, playerId: string): GameState {
  const eliminated = state.players.find((p) => p.id === playerId);
  const heritier = state.players.find((p) => p.character === 'heritier' && p.isAlive && p.id !== playerId);
  const intelToTransfer = eliminated?.intelCards ?? [];
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.id === playerId) return { ...p, isAlive: false, eliminatedAt: state.currentTurn, intelCards: [] };
      if (heritier && p.id === heritier.id && intelToTransfer.length > 0) return { ...p, intelCards: [...p.intelCards, ...intelToTransfer] };
      return p;
    }),
  };
}

function applyUpdatePlayer(state: GameState, playerId: string, patch: Partial<Player>): GameState {
  return {
    ...state,
    players: state.players.map((p) => p.id === playerId ? { ...p, ...patch } : p),
  };
}

function advanceTurn(state: GameState): GameState {
  const nextTurn = state.currentTurn + 1;
  const players = state.players.map((p) => {
    if (p.character === 'journaliste' && p.isHopeHolder && p.consecutiveHopeTurns >= 2) {
      return { ...p, consecutiveHopeTurns: 0 };
    }
    return p;
  });
  const nextState = { ...state, players, currentTurn: nextTurn };

  if (isGameOver(nextState)) {
    if (state.eventDeck.length > 0) {
      const [card, ...rest] = state.eventDeck;
      return { ...nextState, eventDeck: rest, pendingEvent: card, finalEventTriggered: true, phase: 'evenement' };
    }
    return endGame({ ...nextState, finalEventTriggered: true });
  }

  const withIntel = generateIntelForJournaliste(nextState);
  return { ...withIntel, phase: 'accumulation', silentOffers: {}, marketTimerStart: null, marketStep: 'closed' };
}

function endGame(state: GameState): GameState {
  const victory = checkVictory(state);
  return { ...state, gameOver: true, victory, phase: 'end' };
}
