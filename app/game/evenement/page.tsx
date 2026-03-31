'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, useGameActions, useHolder, usePlayers } from '@/store/gameStore';
import { useIsHost, usePlayerId } from '@/store/sessionStore';
import { CHARACTERS } from '@/lib/gameData';
import { IconWarning, IconZap, IconGloire, IconVision, IconMalediction, IconScoreboard } from '@/components/GameIcons';
import { Coins, RotateCcw, Handshake } from 'lucide-react';

const CATEGORY_LABELS = {
  materiel: 'Événement Matériel',
  position: 'Événement de Position',
  gloire:   'Événement de Gloire',
};

export default function EvenementPage() {
  const router = useRouter();
  const actions = useGameActions();
  const holder = useHolder();
  const players = usePlayers();
  const pendingEvent = useGameStore((s) => s.pendingEvent);
  const finalEventTriggered = useGameStore((s) => s.finalEventTriggered);
  const isHost = useIsHost();
  const playerId = usePlayerId();
  const [targetId, setTargetId] = useState('');

  if (!holder || !pendingEvent) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#02020a' }}>
        <div className="text-center">
          <p className="font-spectral italic text-sm mb-4" style={{ color: '#60584a' }}>Aucun événement en cours.</p>
          <button onClick={() => router.push('/game/legs')} className="btn-gold text-xs">
            Continuer →
          </button>
        </div>
      </main>
    );
  }

  const holderChar = CHARACTERS[holder.character];
  const alive = players.filter((p) => p.isAlive);
  const others = alive.filter((p) => !p.isHopeHolder);

  const needsTarget = ['DON_FORCE', 'OBLIGATION_ACHAT', 'GLOIRE_REDISTRIBUEE'].includes(pendingEvent.mechanicKey);
  const isImmune = holder.character === 'aristocrate' && !holder.aristocrateEventImmunityUsed;
  const isMediumDouble = holder.character === 'medium';
  const journaliste = players.find((p) => p.character === 'journaliste' && p.isAlive && p.id !== holder.id);
  const journalisteBonus = journaliste && journaliste.intelCards.some((c) => c.targetPlayerId === holder?.id);

  function getResolutionText(): string {
    const h = holder!;
    const ev = pendingEvent!;
    switch (ev.mechanicKey) {
      case 'RUINE_SOUDAINE': {
        const loss = Math.ceil(h.livres / 2);
        const base = `${h.name} perd ${loss} Livres (${h.livres} → ${h.livres - loss}).`;
        return isMediumDouble ? base + ` Double : perd encore ${Math.ceil((h.livres - loss) / 2)} Livres.` : base;
      }
      case 'SCANDALE_PUBLIC': return `Toutes les Manigances de ${h.name} sont révélées (${h.maniganceCards.length} cartes).`;
      case 'TESTAMENT': return `${h.name} perd ses ${h.faveurs} Faveurs, redistribuées aléatoirement.`;
      case 'RANCON': return `Chaque joueur peut réclamer 1 Livre à ${h.name} (${h.livres} disponibles).`;
      case 'DON_FORCE': return `${h.name} transmet le Hope sans contrepartie au joueur de son choix.`;
      case 'OBLIGATION_ACHAT': return `${h.name} désigne un joueur qui doit acheter le Hope. ${h.name} fixe le prix.`;
      case 'FOLIE_PASSAGERE': return `${h.name} passe son prochain tour sans action.`;
      case 'CHANGEMENT_DE_MAINS': return `Le Hope est mis aux enchères immédiatement.`;
      case 'MORT_SYMBOLIQUE': {
        const gain = h.character === 'heritier' ? 2 : 1;
        const loss = isMediumDouble ? gain * 2 : gain;
        return `${h.name} perd ${loss} Gloire. Total : ${Math.max(0, h.glory - loss)}.`;
      }
      case 'DISGRACE': { const loss = isMediumDouble ? 4 : 2; return `${h.name} perd ${loss} Gloire. Total : ${Math.max(0, h.glory - loss)}.`; }
      case 'GLOIRE_REDISTRIBUEE': return `Chaque autre joueur vivant gagne 1 Gloire prélevée sur ${h.name}.`;
      case 'GLOIRE_GELEE': return isMediumDouble ? `La Gloire de ${h.name} est gelée pour 4 tours.` : `La Gloire de ${h.name} est gelée pour 2 tours.`;
      default: return ev.effect;
    }
  }

  function handleResolve() {
    actions.resolveEvent(targetId || undefined);
    if (finalEventTriggered) {
      actions.endGame();
      router.push('/game/end');
    } else {
      router.push('/game/legs');
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#02020a', padding: '80px 24px 40px' }}
    >
      {/* Background shock */}
      <div
        aria-hidden
        className="animate-shockwave"
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(80,0,0,0.35) 0%, rgba(40,0,0,0.18) 35%, transparent 65%)',
        }}
      />

      {/* Top announcement bar */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-10 py-5"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(160,20,20,0.3)',
          zIndex: 20,
        }}
      >
        <div>
          {finalEventTriggered && (
            <div
              className="font-cinzel text-xs tracking-widest uppercase mb-1"
              style={{ color: '#cc3030', letterSpacing: '0.4em', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <IconWarning size={14} style={{ display: 'inline', marginRight: 4 }} />Malédiction Finale
            </div>
          )}
          <div className="font-cinzel text-xs tracking-widest uppercase mb-1" style={{ color: '#604040', fontSize: '0.95rem', letterSpacing: '0.4em' }}>
            Événement Funeste — Victime
          </div>
          <div className="font-cinzel text-xl font-semibold" style={{ color: '#e08080' }}>{holder.name}</div>
          <div className="font-spectral italic text-sm mt-0.5" style={{ color: '#604040' }}>
            {holderChar.name} · Seuil {holder.thresholdRevealed || true ? holder.threshold : '???'} atteint
          </div>
        </div>
        <div className="text-center">
          <div className="font-cinzel text-xs tracking-widest uppercase mb-2" style={{ color: '#604040', fontSize: '0.95rem', letterSpacing: '0.3em' }}>
            Jetons Malédiction
          </div>
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: holder.curseTokens }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(100,20,160,0.8) 0%, rgba(50,10,80,0.6) 100%)',
                  border: '1px solid rgba(120,40,180,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 6px rgba(100,20,160,0.4)',
                }}
              >
                <IconMalediction size={12} color="#9040d0" />
              </div>
            ))}
          </div>
        </div>
        <div
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{
            padding: '8px 20px',
            border: '1px solid rgba(160,20,20,0.5)',
            color: '#cc4444',
            background: 'rgba(60,0,0,0.3)',
            fontSize: '1rem',
            letterSpacing: '0.2em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconZap size={14} color="#cc4444" /> Seuil {holder.threshold} révélé
        </div>
      </div>

      {/* Event card */}
      <div
        className="flex flex-col relative"
        style={{
          width: 320,
          minHeight: 440,
          background: 'linear-gradient(175deg, #120008 0%, #0a0004 40%, #080010 100%)',
          border: '1px solid rgba(180,30,30,0.5)',
          boxShadow: '0 0 60px rgba(160,0,0,0.3), 0 30px 80px rgba(0,0,0,0.8)',
          animation: 'diamond-float 0s', // no floating, just appear
          zIndex: 10,
        }}
      >
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(200,40,40,0.9), transparent)' }}/>

        {/* Corner decorations */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div
            key={`${v}-${h}`}
            style={{
              position: 'absolute',
              [v]: 20, [h]: 20,
              width: 20, height: 20,
              borderTop: v === 'top' ? '1px solid rgba(160,30,30,0.3)' : 'none',
              borderBottom: v === 'bottom' ? '1px solid rgba(160,30,30,0.3)' : 'none',
              borderLeft: h === 'left' ? '1px solid rgba(160,30,30,0.3)' : 'none',
              borderRight: h === 'right' ? '1px solid rgba(160,30,30,0.3)' : 'none',
            }}
          />
        ))}

        {/* Category + number */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <span
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{
              padding: '3px 10px',
              border: '1px solid rgba(160,40,40,0.25)',
              background: 'rgba(80,0,0,0.2)',
              color: '#804040',
              fontSize: '1rem',
              letterSpacing: '0.35em',
            }}
          >
            {CATEGORY_LABELS[pendingEvent.category]}
          </span>
          <span className="font-cinzel text-xs" style={{ color: '#4a2828' }}>
            {pendingEvent.category === 'materiel' ? <Coins size={18} color="#4a2828"/> : pendingEvent.category === 'position' ? <RotateCcw size={18} color="#4a2828"/> : <IconGloire size={18} color="#4a2828"/>}
          </span>
        </div>

        {/* Icon + name */}
        <div className="flex flex-col items-center px-5 pt-6 pb-4">
          <div
            style={{
              filter: 'drop-shadow(0 0 20px rgba(200,40,40,0.5)) drop-shadow(0 0 50px rgba(150,0,0,0.3))',
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {pendingEvent.category === 'materiel'
              ? <Coins size={64} color="#cc4040" />
              : pendingEvent.category === 'position'
              ? <Handshake size={64} color="#cc4040" />
              : <IconVision size={64} color="#cc4040" />}
          </div>
          <div
            className="font-cinzel font-black text-center"
            style={{ fontSize: '1.4rem', color: '#e05050', letterSpacing: '0.04em', lineHeight: 1.2 }}
          >
            {pendingEvent.title}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(160,30,30,0.3), transparent)', margin: '0 20px' }}/>

        {/* Rule text */}
        <div className="flex-1 px-7 py-5 flex flex-col gap-3">
          <p className="font-spectral text-sm leading-relaxed text-center" style={{ color: '#b09090' }}>
            {pendingEvent.effect}
          </p>
          <div
            className="text-xs font-spectral"
            style={{
              padding: '10px 14px',
              background: 'rgba(80,0,0,0.2)',
              borderLeft: '2px solid rgba(160,30,30,0.4)',
              color: '#804040',
              lineHeight: 1.6,
            }}
          >
            {getResolutionText()}
          </div>
        </div>
      </div>

      {/* Special notices + target selector */}
      <div className="flex flex-col gap-3 mt-6 w-full" style={{ maxWidth: 400, zIndex: 10 }}>

        {isImmune && (
          <div
            className="p-3 text-xs font-spectral"
            style={{ border: '1px solid rgba(140,40,140,0.4)', background: 'rgba(60,0,60,0.2)', color: '#c080c0', lineHeight: 1.6 }}
          >
            <strong className="font-cinzel" style={{ color: '#d090d0' }}>Immunité de l'Aristocrate</strong> — cet Événement est annulé. L'immunité est consommée.
          </div>
        )}

        {isMediumDouble && (
          <div
            className="p-3 text-xs font-spectral"
            style={{ border: '1px solid rgba(40,140,140,0.4)', background: 'rgba(0,60,60,0.2)', color: '#60c0c0', lineHeight: 1.6 }}
          >
            <strong className="font-cinzel" style={{ color: '#80d0d0' }}>Visions inversées</strong> — la Médium subit cet Événement en double.
          </div>
        )}

        {journalisteBonus && journaliste && (
          <div
            className="p-3 text-xs font-spectral"
            style={{ border: '1px solid rgba(40,120,40,0.4)', background: 'rgba(0,40,0,0.2)', color: '#60c060', lineHeight: 1.6 }}
          >
            <strong className="font-cinzel" style={{ color: '#80d080' }}>{journaliste.name}</strong> gagne {isMediumDouble ? 4 : 2} Gloire (Journaliste).
          </div>
        )}

        {needsTarget && !isImmune && (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="input-dark font-cinzel text-xs"
            style={{ letterSpacing: '0.15em' }}
          >
            <option value="">— {pendingEvent.mechanicKey === 'DON_FORCE' ? 'Transmettre le Hope à' : 'Choisir le joueur ciblé'} —</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {CHARACTERS[p.character].name}</option>
            ))}
          </select>
        )}

        {pendingEvent.mechanicKey === 'RANCON' && (
          <div className="flex flex-col gap-2">
            {others.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <span className="font-cinzel text-sm" style={{ color: '#d8d0c0' }}>{p.name}</span>
                <button
                  onClick={() => actions.transferLivres(holder.id, p.id, 1)}
                  disabled={holder.livres <= 0}
                  className="btn-gold text-xs"
                  style={{ padding: '5px 14px' }}
                >
                  Exiger 1 Livre
                </button>
              </div>
            ))}
          </div>
        )}

        {pendingEvent.mechanicKey === 'SCANDALE_PUBLIC' && holder.maniganceCards.length > 0 && (
          <div className="flex flex-col gap-2">
            {holder.maniganceCards.map((c) => (
              <div
                key={c.id}
                className="p-2 text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,164,74,0.15)' }}
              >
                <span style={{ color: '#d4a020', fontFamily: 'Cinzel', fontWeight: 700 }}>{c.title}</span>
                <span style={{ color: '#60584a' }}> — </span>
                <span className="font-spectral" style={{ color: '#9a8070' }}>{c.effect}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isHost ? (
            <button
              onClick={handleResolve}
              disabled={needsTarget && !targetId && !isImmune}
              className={finalEventTriggered ? 'btn-danger flex-1' : 'btn-gold flex-1'}
              style={{ letterSpacing: '0.25em' }}
            >
              {isImmune
                ? 'Immunité — Annuler l\'Événement'
                : finalEventTriggered
                ? 'Fin de Partie →'
                : 'Appliquer et Continuer →'}
            </button>
          ) : (
            <div
              className="flex-1 flex items-center justify-center font-cinzel text-xs tracking-widest"
              style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', color: '#3a3028', fontSize: '0.95rem', letterSpacing: '0.3em' }}
            >
              En attente de l'hôte...
            </div>
          )}
          <button
            onClick={() => router.push('/game/scoreboard')}
            className="btn-ghost-dark"
            style={{ padding: '0.75rem 1.2rem', fontSize: '0.95rem' }}
          >
            <IconScoreboard size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
