'use client';

import { useState } from 'react';
import type { Character } from '@/types/game';

interface TopbarProps {
  character: Character;
  onOpenCodex: () => void;
  onAbandonRun?: () => void;
}

const TENSION_COLOR = (t: number) => {
  if (t < 33) return 'bg-emerald-500';
  if (t < 60) return 'bg-amber-400';
  if (t < 80) return 'bg-orange-500';
  return 'bg-crimson animate-pulse';
};

const TENSION_LABEL = (t: number) => {
  if (t < 33) return 'Calm';
  if (t < 60) return 'Uneasy';
  if (t < 80) return 'Volatile';
  return 'Breaking Point';
};

export default function Topbar({ character, onOpenCodex, onAbandonRun }: TopbarProps) {
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const { name, level, levelTitle, tension, tags, theme } = character;
  const perks = tags.filter((t) => t.type === 'perk');
  const scars = tags.filter((t) => t.type === 'scar');
  const titles = tags.filter((t) => t.type === 'title');

  const themeIcon = theme === 'dark-fantasy' ? '⚔️' : '👁️';

  return (
    <>
      <header className="topbar" id="topbar">
        {/* Left: character identity */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{themeIcon}</span>
          <div className="min-w-0">
            <h2 className="text-bone font-display font-bold text-lg leading-none truncate" title={name}>
              {name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gold font-mono uppercase tracking-widest">
                Lvl {level} · {levelTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tags (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-center">
          {perks.map((tag) => (
            <span key={tag.name} className="tag tag--perk" title={tag.description}>
              ✦ {tag.name}
            </span>
          ))}
          {scars.map((tag) => (
            <span key={tag.name} className="tag tag--scar" title={tag.description}>
              ✧ {tag.name}
            </span>
          ))}
          {titles.map((tag) => (
            <span key={tag.name} className="tag tag--title" title={tag.description}>
              ★ {tag.name}
            </span>
          ))}
        </div>

        {/* Right: Tension meter + Codex button + Abandon button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-col items-end gap-1 min-w-[120px] sm:min-w-[140px]">
            <div className="flex items-center gap-2 w-full justify-end">
              <span className="text-xs text-muted uppercase tracking-widest hidden sm:inline">Tension</span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  tension >= 80 ? 'text-crimson animate-pulse' : tension >= 60 ? 'text-orange-400' : 'text-muted'
                }`}
              >
                {TENSION_LABEL(tension)}
              </span>
              <span className="text-xs font-mono text-bone">{tension}%</span>
            </div>
            <div
              className="tension-track"
              role="progressbar"
              aria-valuenow={tension}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Tension: ${tension}%`}
            >
              <div
                className={`tension-fill ${TENSION_COLOR(tension)}`}
                style={{ width: `${tension}%` }}
              />
              {/* tick marks */}
              {[33, 60, 80].map((mark) => (
                <div
                  key={mark}
                  className="tension-tick"
                  style={{ left: `${mark}%` }}
                />
              ))}
            </div>
          </div>

          {/* Codex button */}
          <button
            id="codex-open-btn"
            className="codex-open-btn"
            onClick={onOpenCodex}
            aria-label="Open Character Codex"
            title="Character Codex (Perks, Scars, Titles)"
          >
            📖
          </button>

          {/* Abandon Run / Forfeit button */}
          <button
            id="abandon-vessel-btn"
            className="abandon-btn"
            onClick={() => setShowAbandonConfirm(true)}
            aria-label="Abandon Vessel"
            title="Abandon Vessel (Forfeit Run)"
          >
            💀 <span className="hidden sm:inline font-mono uppercase tracking-wider text-[0.7rem]">Abandon</span>
          </button>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showAbandonConfirm && (
        <div className="codex-backdrop" id="abandon-confirm-modal" role="dialog" aria-modal="true">
          <div className="card max-w-md w-full border-edge bg-abyss p-6 text-center shadow-2xl relative">
            <div className="text-4xl mb-3">☠️</div>
            <h3 className="font-display font-bold text-xl text-bone mb-2">Abandon Vessel?</h3>
            <p className="font-body text-ash text-base mb-6 leading-relaxed">
              Are you sure you want to abandon this vessel? All progress for this contract will be lost.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                id="abandon-cancel-btn"
                className="fate-btn"
                onClick={() => setShowAbandonConfirm(false)}
              >
                Retain Vessel
              </button>
              <button
                id="abandon-confirm-btn"
                className="begin-btn"
                onClick={() => {
                  setShowAbandonConfirm(false);
                  onAbandonRun?.();
                }}
              >
                Abandon to Void
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
