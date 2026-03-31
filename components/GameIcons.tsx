/**
 * Centralized game icon mapping using Lucide React.
 * Use these instead of emojis throughout the app.
 */

import {
  Star, Gem, ScrollText, Handshake, Search,
  Zap, AlertTriangle, BarChart3, Eye, Lock,
  Check, Hourglass, Skull, Swords, Crown,
  Landmark, Newspaper, Flower2, Sparkles,
  Drama, Diamond, CircleDot, Shield,
  ChevronRight, RotateCcw, VolumeX, Coins,
  TrendingDown, Users,
} from 'lucide-react';

export {
  // Resources
  ScrollText  as IconLivres,
  Handshake   as IconFaveurs,
  Search      as IconSecrets,

  // Scores
  Star        as IconGloire,
  Gem         as IconMalediction,

  // Hope Diamond
  Diamond     as IconDiamond,

  // Characters
  Landmark    as IconMarchand,
  Crown       as IconAristocrate,
  Drama       as IconReceleur,
  Newspaper   as IconJournaliste,
  Sparkles    as IconMedium,
  Flower2     as IconHeritier,

  // UI / actions
  Zap            as IconZap,
  AlertTriangle  as IconWarning,
  BarChart3      as IconScoreboard,
  Eye            as IconVision,
  Lock           as IconLock,
  Check          as IconCheck,
  Hourglass      as IconHourglass,
  Skull          as IconSkull,
  Swords         as IconVictory,
  Shield         as IconImmunity,
  ChevronRight   as IconArrow,
  RotateCcw      as IconRotation,
  VolumeX        as IconSilent,
  Coins          as IconCoins,
  TrendingDown   as IconRuine,
  Users          as IconPlayers,
  CircleDot      as IconDot,
};

/** Maps a CharacterID to its Lucide icon component */
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import type { CharacterID } from '@/store/types';

export const CHAR_ICON_MAP: Record<CharacterID, ComponentType<LucideProps>> = {
  marchand:    Landmark,
  aristocrate: Crown,
  receleur:    Drama,
  journaliste: Newspaper,
  medium:      Sparkles,
  heritier:    Flower2,
};
