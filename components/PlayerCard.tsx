'use client';

import type { Player } from '@/store/types';
import { CHARACTERS } from '@/lib/gameData';
import { Badge } from './ui';

interface Props {
  player: Player;
  showPrivate?: boolean;
  compact?: boolean;
  highlight?: boolean;
}

export function PlayerCard({ player, showPrivate = false, compact = false, highlight = false }: Props) {
  const char = CHARACTERS[player.character];
  const cursePercent = Math.min(100, (player.curseTokens / player.threshold) * 100);
  const danger = cursePercent >= 80;
  const warning = cursePercent >= 60 && !danger;

  const curseBarColor = danger ? 'bg-danger' : warning ? 'bg-amber-500' : 'bg-curse';

  return (
    <div className={`rounded-lg border p-3 transition-all ${highlight ? 'border-hope bg-hope/5' : 'border-border bg-surface'} ${!player.isAlive ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-cinzel text-sm font-bold ${char.color}`}>{player.name}</span>
            {player.isHopeHolder && (
              <span className="text-xs text-hope animate-pulse">◆ Hope</span>
            )}
            {player.isHidden && (
              <span className="text-xs text-gray-500">◈ caché</span>
            )}
            {player.isFrozen && (
              <span className="text-xs text-muted">⊘ gelé</span>
            )}
          </div>
          <div className="text-xs text-muted font-spectral">{char.name}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="glory">✦ {player.glory}</Badge>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge variant="default">💰 {player.livres}L</Badge>
            <Badge variant="default">🤝 {player.faveurs}F</Badge>
            <Badge variant="default">🃏 {player.maniganceCards.length + player.intelCards.length}</Badge>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Malédiction</span>
              <span className={danger ? 'text-danger font-bold' : ''}>
                {player.curseTokens} / {player.thresholdRevealed ? player.threshold : '?'}
              </span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${curseBarColor}`}
                style={{ width: `${cursePercent}%` }}
              />
            </div>
          </div>
        </>
      )}

      {showPrivate && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted mb-1">Seuil secret</div>
          <span className="font-cinzel text-hope text-xl">{player.threshold}</span>
          {player.maniganceCards.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted mb-1">Manigances</div>
              <div className="flex flex-col gap-1">
                {player.maniganceCards.map((c) => (
                  <div key={c.id} className="text-xs bg-black/30 rounded p-2 border border-border">
                    <div className="text-amber-300 font-bold">{c.title}</div>
                    <div className="text-muted font-spectral mt-0.5">{c.effect}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
