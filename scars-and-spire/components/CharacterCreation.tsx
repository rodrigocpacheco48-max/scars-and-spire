'use client';

import { useState } from 'react';
import type { Archetype, Character, Contract, Scar, Theme } from '@/types/game';
import { LEVEL_TITLES } from '@/types/game';
import { getArchetypesByTheme, getScarsByTheme, CONTRACTS } from '@/lib/gameData';

interface CharacterCreationProps {
  onComplete: (character: Character, contractIndex?: number) => void;
  onRandomize: (theme: Theme) => Partial<Character>;
  contracts?: Contract[];
}

const DRAFT_ARCHETYPE_COUNT = 3;
const DRAFT_SCAR_COUNT = 4;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function draftOfferings(targetTheme: Theme) {
  const allArchetypes = getArchetypesByTheme(targetTheme);
  const allScars = getScarsByTheme(targetTheme);
  return {
    archetypes: shuffleArray(allArchetypes).slice(0, DRAFT_ARCHETYPE_COUNT),
    scars: shuffleArray(allScars).slice(0, DRAFT_SCAR_COUNT),
    totalArchetypes: allArchetypes.length,
    totalScars: allScars.length,
  };
}

export default function CharacterCreation({ onComplete, onRandomize, contracts = CONTRACTS }: CharacterCreationProps) {
  const [theme, setTheme] = useState<Theme>('dark-fantasy');
  const [name, setName] = useState('');
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('');
  const [selectedScarId, setSelectedScarId] = useState<string>('');
  const [selectedContractIdx, setSelectedContractIdx] = useState<number>(0);
  const [nameError, setNameError] = useState(false);
  const [selectionError, setSelectionError] = useState(false);

  // Dynamic offered draft pools
  const [draftState, setDraftState] = useState(() => draftOfferings('dark-fantasy'));
  const offeredArchetypes = draftState.archetypes;
  const offeredScars = draftState.scars;

  const handleThemeSwitch = (newTheme: Theme) => {
    setTheme(newTheme);
    setDraftState(draftOfferings(newTheme));
    setSelectedArchetypeId('');
    setSelectedScarId('');
  };

  const handleReshuffleOfferings = () => {
    const fresh = draftOfferings(theme);
    setDraftState(fresh);

    // Deselect if currently selected item is no longer in the newly drafted pool
    if (!fresh.archetypes.some((a) => a.id === selectedArchetypeId)) {
      setSelectedArchetypeId('');
    }
    if (!fresh.scars.some((s) => s.id === selectedScarId)) {
      setSelectedScarId('');
    }
  };

  const handleQuickFate = () => {
    const randomized = onRandomize(theme);
    if (randomized.name) setName(randomized.name);

    // Select from current drafted offerings
    const currentArchetype = offeredArchetypes[Math.floor(Math.random() * offeredArchetypes.length)];
    const currentScar = offeredScars[Math.floor(Math.random() * offeredScars.length)];

    if (currentArchetype) setSelectedArchetypeId(currentArchetype.id);
    if (currentScar) setSelectedScarId(currentScar.id);

    setNameError(false);
    setSelectionError(false);
  };

  const handleBegin = () => {
    let valid = true;
    if (!name.trim()) { setNameError(true); valid = false; }
    if (!selectedArchetypeId || !selectedScarId) { setSelectionError(true); valid = false; }
    if (!valid) return;

    const allArchetypes = getArchetypesByTheme(theme);
    const allScars = getScarsByTheme(theme);

    const archetype = offeredArchetypes.find((a) => a.id === selectedArchetypeId)
      || allArchetypes.find((a) => a.id === selectedArchetypeId)!;
    const scar = offeredScars.find((s) => s.id === selectedScarId)
      || allScars.find((s) => s.id === selectedScarId)!;

    const character: Character = {
      name: name.trim(),
      theme,
      level: 1,
      levelTitle: LEVEL_TITLES[theme][1],
      tension: 10,
      archetypeId: selectedArchetypeId,
      scarId: selectedScarId,
      tags: [
        archetype.startingTag,
        { name: scar.name, type: 'scar', description: scar.effect },
      ],
    };

    onComplete(character, selectedContractIdx);
  };

  const isDark = theme === 'dark-fantasy';

  return (
    <div className="min-h-screen bg-void text-ash flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">⚰️</div>
        <h1 className="text-4xl font-display font-bold text-bone tracking-widest uppercase">
          Scars <span className="text-crimson">&</span> Spire
        </h1>
        <p className="text-sm text-muted mt-2 tracking-widest uppercase">Character Creation</p>
      </div>

      <div className="w-full max-w-2xl space-y-8">

        {/* ── Theme Toggle ──────────────────────────────── */}
        <section className="card">
          <label className="section-label">Choose Your World</label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {(
              [
                { value: 'dark-fantasy' as Theme, icon: '⚔️', label: 'Dark Fantasy', sub: 'Swords, curses & dying gods' },
                { value: 'eldritch-horror' as Theme, icon: '👁️', label: 'Eldritch Horror', sub: 'Void, madness & cosmic dread' },
              ] as const
            ).map(({ value, icon, label, sub }) => (
              <button
                key={value}
                id={`theme-${value}`}
                onClick={() => handleThemeSwitch(value)}
                className={`theme-btn ${theme === value ? 'theme-btn--active' : ''}`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-sm text-bone">{label}</span>
                <span className="text-xs text-muted">{sub}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Name Input ───────────────────────────────── */}
        <section className="card">
          <label htmlFor="char-name" className="section-label">Your Name</label>
          <input
            id="char-name"
            type="text"
            placeholder={isDark ? 'e.g. Morvaine the Eyeless' : 'e.g. Elara of the Static'}
            value={name}
            maxLength={40}
            onChange={(e) => { setName(e.target.value); setNameError(false); }}
            className={`name-input ${nameError ? 'name-input--error' : ''}`}
          />
          {nameError && <p className="text-xs text-crimson mt-1">A name is required before you may proceed.</p>}
        </section>

        {/* ── Archetype Selection ──────────────────────── */}
        <section className="card">
          <div className="flex items-center justify-between">
            <label className="section-label">Choose Your Archetype</label>
            <span className="text-xs text-muted">
              Offered {offeredArchetypes.length} of {draftState.totalArchetypes}
            </span>
          </div>
          <div className="space-y-2 mt-3">
            {offeredArchetypes.map((arch) => (
              <button
                key={arch.id}
                id={`arch-${arch.id}`}
                onClick={() => { setSelectedArchetypeId(arch.id); setSelectionError(false); }}
                className={`option-card ${selectedArchetypeId === arch.id ? 'option-card--selected' : ''}`}
              >
                <span className="text-2xl shrink-0">{arch.flavorIcon}</span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-bone text-sm">{arch.name}</span>
                  <span className="text-xs text-muted text-left leading-relaxed">{arch.description}</span>
                  <span className="text-xs text-gold mt-1">
                    Perk: <em>{arch.startingTag.name}</em>
                  </span>
                </span>
                {selectedArchetypeId === arch.id && (
                  <span className="ml-auto text-crimson shrink-0">✦</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Scar Selection ───────────────────────────── */}
        <section className="card">
          <div className="flex items-center justify-between">
            <label className="section-label">Choose Your Scar</label>
            <span className="text-xs text-muted">
              Offered {offeredScars.length} of {draftState.totalScars}
            </span>
          </div>
          <p className="text-xs text-muted mb-3">Scars shape who you are — for better and worse.</p>
          <div className="space-y-2">
            {offeredScars.map((scar) => (
              <button
                key={scar.id}
                id={`scar-${scar.id}`}
                onClick={() => { setSelectedScarId(scar.id); setSelectionError(false); }}
                className={`option-card ${selectedScarId === scar.id ? 'option-card--selected' : ''}`}
              >
                <span className="text-2xl shrink-0">{scar.flavorIcon}</span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-bone text-sm">{scar.name}</span>
                  <span className="text-xs text-muted text-left leading-relaxed">{scar.description}</span>
                  <span className="text-xs text-amber-500 mt-1">
                    Effect: <em>{scar.effect}</em>
                  </span>
                </span>
                {selectedScarId === scar.id && (
                  <span className="ml-auto text-crimson shrink-0">✦</span>
                )}
              </button>
            ))}
          </div>
          {selectionError && (
            <p className="text-xs text-crimson mt-2">Select both an archetype and a scar to continue.</p>
          )}
        </section>

        {/* ── Contract Tier ─────────────────────────────── */}
        <section className="card">
          <label className="section-label">Contract Tier</label>
          <p className="text-xs text-muted mb-3">Higher tiers multiply tension and reward — but mercy is scarce.</p>
          <div className="space-y-2">
            {contracts.map((c, idx) => (
              <button
                key={c.tier}
                id={`contract-tier-${c.tier}`}
                onClick={() => setSelectedContractIdx(idx)}
                className={`option-card ${selectedContractIdx === idx ? 'option-card--selected' : ''}`}
              >
                <span className="text-xl shrink-0">
                  {c.tier === 'I' ? '📜' : c.tier === 'II' ? '🩸' : '🌑'}
                </span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-bone text-sm">Tier {c.tier} · {c.label}</span>
                  <span className="text-xs text-muted text-left leading-relaxed">{c.description}</span>
                  {c.rewardBonus !== 'None' && (
                    <span className="text-xs text-gold mt-1">Bonus: {c.rewardBonus}</span>
                  )}
                </span>
                {selectedContractIdx === idx && (
                  <span className="ml-auto text-crimson shrink-0">✦</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Actions ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="reshuffle-offerings-btn"
            onClick={handleReshuffleOfferings}
            className="fate-btn border-purple-900/50 hover:border-purple-600 text-purple-200"
            title="Reshuffle fate offerings"
          >
            🔮 Reshuffle Offerings
          </button>
          <button
            id="quick-fate-btn"
            onClick={handleQuickFate}
            className="fate-btn"
          >
            🎲 Quick Fate
          </button>
          <button
            id="begin-btn"
            onClick={handleBegin}
            className="begin-btn"
          >
            Begin Your Story →
          </button>
        </div>

      </div>
    </div>
  );
}

