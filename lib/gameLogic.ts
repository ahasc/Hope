import type { Player, EventCard, GameState, VictoryResult } from '@/store/types';

export function applyEventEffect(
  state: GameState,
  card: EventCard,
  targetId?: string
): Partial<GameState> {
  const players = state.players.map((p) => ({ ...p }));
  const holderIdx = players.findIndex((p) => p.isHopeHolder);
  if (holderIdx === -1) return {};
  const holder = players[holderIdx];
  const others = players.filter((p) => !p.isHopeHolder && p.isAlive);

  const isMediumDoubled =
    holder.character === 'medium';

  const applyDouble = (fn: () => void) => {
    fn();
    if (isMediumDoubled) fn();
  };

  // Journaliste bonus: +2 glory only if they hold a secret targeting this specific holder
  const journaliste = players.find((p) => p.character === 'journaliste' && p.isAlive);
  const journalisteGetsBonus =
    journaliste &&
    journaliste.id !== holder.id &&
    journaliste.intelCards.some((c) => c.targetPlayerId === holder.id);

  switch (card.mechanicKey) {
    case 'RUINE_SOUDAINE':
      applyDouble(() => {
        holder.livres = holder.livres - Math.ceil(holder.livres / 2);
      });
      break;

    case 'SCANDALE_PUBLIC':
      // Cards are already visible via UI when this resolves — no state change needed
      // We mark a flag for UI to show all cards
      break;

    case 'TESTAMENT':
      applyDouble(() => {
        const favs = holder.faveurs;
        holder.faveurs = 0;
        const alive = players.filter((p) => p.isAlive && p.id !== holder.id);
        alive.forEach((p, i) => {
          players[players.findIndex((pl) => pl.id === p.id)].faveurs += Math.floor(
            favs / alive.length
          ) + (i < favs % alive.length ? 1 : 0);
        });
      });
      break;

    case 'RANCON':
      applyDouble(() => {
        others.forEach((p) => {
          if (holder.livres > 0) {
            const idx = players.findIndex((pl) => pl.id === p.id);
            players[idx].livres += 1;
            holder.livres = Math.max(0, holder.livres - 1);
          }
        });
      });
      break;

    case 'DON_FORCE':
      if (targetId) {
        const toIdx = players.findIndex((p) => p.id === targetId);
        if (toIdx !== -1) {
          players[holderIdx].isHopeHolder = false;
          players[holderIdx].consecutiveHopeTurns = 0;
          players[holderIdx].isHidden = false;
          players[toIdx].isHopeHolder = true;
        }
      }
      break;

    case 'OBLIGATION_ACHAT':
      // Handled by UI: admin picks buyer and price.
      break;

    case 'FOLIE_PASSAGERE':
      holder.isFrozen = true;
      break;

    case 'CHANGEMENT_DE_MAINS':
      // Triggers immediate auction — handled in UI
      break;

    case 'MORT_SYMBOLIQUE':
      applyDouble(() => {
        const holderChar = holder.character;
        const gained = holderChar === 'heritier' ? 2 : 1;
        holder.glory = Math.max(0, holder.glory - gained);
      });
      break;

    case 'DISGRACE':
      applyDouble(() => {
        holder.glory = Math.max(0, holder.glory - 2);
      });
      break;

    case 'GLOIRE_REDISTRIBUEE': {
      const alive = players.filter((p) => p.isAlive && p.id !== holder.id);
      const toTake = Math.min(holder.glory, alive.length);
      applyDouble(() => {
        alive.slice(0, toTake).forEach((p) => {
          const idx = players.findIndex((pl) => pl.id === p.id);
          players[idx].glory += 1;
          holder.glory = Math.max(0, holder.glory - 1);
        });
      });
      break;
    }

    case 'GLOIRE_GELEE':
      holder.gloryFrozenTurns = isMediumDoubled ? 4 : 2;
      break;
  }

  // Journaliste bonus — once per victim per game
  if (journalisteGetsBonus && journaliste) {
    const jIdx = players.findIndex((p) => p.id === journaliste.id);
    if (!players[jIdx].journalisteClaimedFrom.includes(holder.id)) {
      players[jIdx].glory += isMediumDoubled ? 4 : 2;
      players[jIdx].journalisteClaimedFrom = [...players[jIdx].journalisteClaimedFrom, holder.id];
    }
  }

  // Aristocrate immunity
  if (holder.character === 'aristocrate' && !holder.aristocrateEventImmunityUsed) {
    // Don't apply — return original players, just mark immunity used
    const original = state.players.map((p) => ({ ...p }));
    original[holderIdx].aristocrateEventImmunityUsed = true;
    original[holderIdx].curseTokens = 0;
    return { players: original };
  }

  // Reset curse
  players[holderIdx] = { ...holder, curseTokens: 0 };
  players[holderIdx] = { ...players[holderIdx] };

  return { players };
}

export function checkVictory(state: GameState): VictoryResult {
  const alive = state.players.filter((p) => p.isAlive);

  // Survival victory
  if (alive.length === 1) {
    return {
      type: 'survie',
      winnerId: alive[0].id,
      reason: `${alive[0].name} est le dernier survivant.`,
    };
  }

  // Apply all end-game glory adjustments to alive players
  const adjusted = state.players
    .filter((p) => p.isAlive)
    .map((p) => {
      let glory = p.glory;

      // Receleur bonus
      if (p.character === 'receleur' && p.receleurHasConcealed && !p.receleurDetected) {
        glory += 3;
      }

      // Aristocrate penalty
      if (p.character === 'aristocrate' && !p.aristocrateHeldTwoConsecutive) {
        glory = Math.max(0, glory - 2);
      }

      // Curse overflow penalty — proportional to glory
      const overflow = Math.max(0, p.curseTokens - p.threshold);
      if (overflow > 0) {
        const penalty = Math.min(glory, Math.ceil(glory * overflow / p.threshold));
        glory = glory - penalty;
      }

      return { ...p, glory };
    });

  const sorted = [...adjusted].sort((a, b) => {
    if (b.glory !== a.glory) return b.glory - a.glory;
    return a.curseTokens - b.curseTokens;
  });

  const winner = sorted[0];
  const overflow = Math.max(0, winner.curseTokens - winner.threshold);
  const reason = overflow > 0
    ? `${winner.name} remporte la partie avec ${winner.glory} points de Gloire (malédiction excessive).`
    : `${winner.name} remporte la partie avec ${winner.glory} points de Gloire.`;

  return { type: 'gloire', winnerId: winner.id, reason };
}

export function isGameOver(state: GameState): boolean {
  const alive = state.players.filter((p) => p.isAlive);
  return (
    alive.length <= 1 ||
    state.eventDeck.length === 0 ||
    state.currentTurn > 8
  );
}
