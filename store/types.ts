export type CharacterID =
  | 'marchand'
  | 'aristocrate'
  | 'receleur'
  | 'journaliste'
  | 'medium'
  | 'heritier';

export type CurrencyKey = 'livres' | 'faveurs';

export type EventCategory = 'materiel' | 'position' | 'gloire';

export type PhaseID =
  | 'setup'
  | 'thresholds'
  | 'accumulation'
  | 'marche-noir'
  | 'evenement'
  | 'legs'
  | 'end';

export type MechanicKey =
  | 'RUINE_SOUDAINE'
  | 'SCANDALE_PUBLIC'
  | 'TESTAMENT'
  | 'RANCON'
  | 'DON_FORCE'
  | 'OBLIGATION_ACHAT'
  | 'FOLIE_PASSAGERE'
  | 'CHANGEMENT_DE_MAINS'
  | 'MORT_SYMBOLIQUE'
  | 'DISGRACE'
  | 'GLOIRE_REDISTRIBUEE'
  | 'GLOIRE_GELEE';

export type ManiganceMechanicKey =
  | 'CHANTAGE_TRANSFER'   // extorquer 2L ou 1F — joueur choisit
  | 'VOL_FAVEUR'          // voler 1F à une cible
  | 'SOCIAL';             // effet narratif, pas de transfert automatisé

export interface ManiganceCard {
  id: string;
  title: string;
  effect: string;
  mechanicKey: ManiganceMechanicKey;
}

export interface IntelCard {
  id: string;
  targetPlayerId: string;
  category: 'seuil' | 'manigance';
  title: string;
  content: string;
}

export interface EventCard {
  id: string;
  category: EventCategory;
  title: string;
  effect: string;
  mechanicKey: MechanicKey;
}

export interface Player {
  id: string;
  name: string;
  character: CharacterID;
  livres: number;
  faveurs: number;
  maniganceCards: ManiganceCard[];
  intelCards: IntelCard[];
  glory: number;
  curseTokens: number;
  threshold: number;
  thresholdRevealed: boolean;
  isAlive: boolean;
  isHopeHolder: boolean;
  isHidden: boolean;
  isFrozen: boolean;
  gloryFrozenTurns: number;
  consecutiveHopeTurns: number;
  aristocrateEventImmunityUsed: boolean;
  receleurHasConcealed: boolean;
  receleurDetected: boolean;
  aristocrateHeldTwoConsecutive: boolean;
  journalisteClaimedFrom: string[];
  isBot: boolean;
  eliminatedAt: number | null;
}

export interface PlayerSetup {
  name: string;
  character: CharacterID;
  isBot?: boolean;
}

export interface VictoryResult {
  type: 'gloire' | 'survie' | null;
  winnerId: string | null;
  reason: string;
}

export interface GameState {
  phase: PhaseID;
  currentTurn: number;
  currentHolderIndex: number;
  players: Player[];
  eventDeck: EventCard[];
  eventDiscard: EventCard[];
  pendingEvent: EventCard | null;
  marketTimerStart: number | null;
  marketStep: 'silent' | 'open' | 'closed';
  silentOffers: Record<string, string>;
  finalEventTriggered: boolean;
  gameOver: boolean;
  victory: VictoryResult | null;
  thresholdSetupIndex: number;
}
