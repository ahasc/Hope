'use client';

import { useState } from 'react';
import { usePlayers, useGameActions } from '@/store/gameStore';
import { Button, Card, SectionTitle } from './ui';

export function TransactionPanel() {
  const players = usePlayers();
  const actions = useGameActions();
  const alive = players.filter((p) => p.isAlive);

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [currency, setCurrency] = useState<'livres' | 'faveurs'>('livres');
  const [amount, setAmount] = useState(1);

  const [secretFromId, setSecretFromId] = useState('');
  const [secretToId, setSecretToId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');

  const [hopeFromId, setHopeFromId] = useState('');
  const [hopeToId, setHopeToId] = useState('');
  const [hopePrice, setHopePrice] = useState(0);
  const [forceMode, setForceMode] = useState(false);

  const fromPlayer = alive.find((p) => p.id === fromId);
  const secretFromPlayer = alive.find((p) => p.id === secretFromId);

  function handleTransfer() {
    if (!fromId || !toId || fromId === toId) return;
    if (currency === 'livres') actions.transferLivres(fromId, toId, amount);
    else actions.transferFaveurs(fromId, toId, amount);
  }

  function handleSecretTransfer() {
    if (!secretFromId || !secretToId || !selectedCardId) return;
    actions.giveManiganceCard(secretFromId, secretToId, selectedCardId);
    setSelectedCardId('');
  }

  function handleHopeTransfer() {
    if (!hopeToId) return;
    if (forceMode && hopeFromId) {
      actions.forcePassHope(hopeFromId, hopeToId);
    } else {
      actions.passHope(hopeToId, { livres: hopePrice });
    }
  }

  const select = 'w-full bg-black/40 border border-border rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:border-hope';

  return (
    <div className="space-y-4">
      <SectionTitle>Transactions</SectionTitle>

      {/* Resources */}
      <Card>
        <div className="text-xs text-muted font-cinzel tracking-wider mb-3">Livres / Faveurs</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-muted block mb-1">De</label>
            <select className={select} value={fromId} onChange={(e) => setFromId(e.target.value)}>
              <option value="">—</option>
              {alive.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Vers</label>
            <select className={select} value={toId} onChange={(e) => setToId(e.target.value)}>
              <option value="">—</option>
              {alive.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-muted block mb-1">Type</label>
            <select className={select} value={currency} onChange={(e) => setCurrency(e.target.value as 'livres' | 'faveurs')}>
              <option value="livres">Livres 💰</option>
              <option value="faveurs">Faveurs 🤝</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Montant</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className={select}
            />
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleTransfer} disabled={!fromId || !toId || fromId === toId}>
          Confirmer
        </Button>
      </Card>

      {/* Secrets */}
      <Card>
        <div className="text-xs text-muted font-cinzel tracking-wider mb-3">Manigances</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-muted block mb-1">De</label>
            <select className={select} value={secretFromId} onChange={(e) => { setSecretFromId(e.target.value); setSelectedCardId(''); }}>
              <option value="">—</option>
              {alive.filter((p) => p.maniganceCards.length > 0).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Vers</label>
            <select className={select} value={secretToId} onChange={(e) => setSecretToId(e.target.value)}>
              <option value="">—</option>
              {alive.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        {secretFromPlayer && (
          <div className="mb-3">
            <label className="text-xs text-muted block mb-1">Carte</label>
            <select className={select} value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}>
              <option value="">— choisir —</option>
              {secretFromPlayer.maniganceCards.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={handleSecretTransfer} disabled={!secretFromId || !secretToId || !selectedCardId}>
          Transférer
        </Button>
      </Card>

      {/* Hope */}
      <Card>
        <div className="text-xs text-muted font-cinzel tracking-wider mb-3">Diamand Hope</div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setForceMode(false)}
            className={`flex-1 text-xs py-1.5 border rounded font-cinzel transition-colors ${!forceMode ? 'border-hope text-hope bg-hope/10' : 'border-border text-muted'}`}
          >
            Volontaire
          </button>
          <button
            onClick={() => setForceMode(true)}
            className={`flex-1 text-xs py-1.5 border rounded font-cinzel transition-colors ${forceMode ? 'border-danger text-danger bg-danger/10' : 'border-border text-muted'}`}
          >
            Forcé (Faveur)
          </button>
        </div>
        {forceMode && (
          <div className="mb-2">
            <label className="text-xs text-muted block mb-1">Qui utilise sa Faveur</label>
            <select className={select} value={hopeFromId} onChange={(e) => setHopeFromId(e.target.value)}>
              <option value="">—</option>
              {alive.filter((p) => p.faveurs > 0).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.faveurs}F)</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-2">
          <label className="text-xs text-muted block mb-1">Recevoir le Hope</label>
          <select className={select} value={hopeToId} onChange={(e) => setHopeToId(e.target.value)}>
            <option value="">—</option>
            {alive.filter((p) => !p.isHopeHolder).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {!forceMode && (
          <div className="mb-3">
            <label className="text-xs text-muted block mb-1">Prix (Livres)</label>
            <input
              type="number"
              min={0}
              value={hopePrice}
              onChange={(e) => setHopePrice(Math.max(0, parseInt(e.target.value) || 0))}
              className={select}
            />
          </div>
        )}
        <Button variant="danger" size="sm" onClick={handleHopeTransfer} disabled={!hopeToId}>
          Transmettre le Hope
        </Button>
      </Card>
    </div>
  );
}
