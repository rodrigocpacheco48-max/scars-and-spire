'use client';

import { useEffect, useCallback, useState } from 'react';
import type { GameState } from '@/types/game';
import type { ChronicleData } from '@/lib/persistence';
import { buildChronicle, importCharacter } from '@/lib/persistence';
import { CONTRACTS } from '@/lib/gameData';

interface ChronicleModalProps {
  state: GameState;
  /** Called when the player wants to start a new game (fresh or carry-over). */
  onNewGame: (contractIndex?: number) => void;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ChronicleModal({ state, onNewGame }: ChronicleModalProps) {
  const [chronicle] = useState<ChronicleData>(() => buildChronicle(state));
  const [copied, setCopied] = useState(false);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Export to clipboard ────────────────────────────────────────────────────
  const exportToClipboard = useCallback(async () => {
    const char = chronicle.character;
    const lines = [
      `╔══ SCARS & SPIRE — CHRONICLE ══╗`,
      `  ${char.name}`,
      `  ${char.levelTitle} (Level ${char.level})`,
      `  Contract: ${chronicle.contractLabel} (Tier ${chronicle.contractTier})`,
      `  Legacy Score: ${chronicle.legacyScore}`,
      ``,
      `  EPITAPH:`,
      ...chronicle.epitaphLines.map((l) => `  "${l}"`),
      ``,
      `  TAGS:`,
      ...char.tags.map((t) => `  [${t.type.toUpperCase()}] ${t.name}${t.description ? ' — ' + t.description : ''}`),
      ``,
      `  Sealed on ${formatTimestamp(chronicle.timestamp)}`,
      `╚══════════════════════════════╝`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently ignore
    }
  }, [chronicle]);

  // ── Carry character to higher contract ────────────────────────────────────
  const handleCarryOver = useCallback(
    (contractIndex: number) => {
      importCharacter(chronicle.character);
      onNewGame(contractIndex);
    },
    [chronicle.character, onNewGame]
  );

  const perks  = chronicle.character.tags.filter((t) => t.type === 'perk');
  const scars  = chronicle.character.tags.filter((t) => t.type === 'scar');
  const titles = chronicle.character.tags.filter((t) => t.type === 'title');

  // Higher-tier contracts available for carry-over
  const higherContracts = CONTRACTS.filter(
    (c) => c.tier !== 'I' || chronicle.contractTier === 'I'
  );

  return (
    <div className="chronicle-backdrop" id="chronicle-backdrop" role="dialog" aria-modal="true" aria-label="Chronicle">
      <div className="chronicle-panel" id="chronicle-panel">

        {/* Ornament */}
        <div className="chronicle-ornament" aria-hidden="true">✦ ─── ✦ ─── ✦</div>

        {/* Title */}
        <h1 className="chronicle-title">Chronicle</h1>
        <p className="chronicle-date">{formatTimestamp(chronicle.timestamp)}</p>

        {/* Character identity */}
        <div className="chronicle-identity">
          <span className="chronicle-char-name">{chronicle.character.name}</span>
          <span className="chronicle-char-title">
            {chronicle.character.levelTitle} · Level {chronicle.character.level}
          </span>
          <span className="chronicle-contract-badge">
            {chronicle.contractLabel} · Tier {chronicle.contractTier}
          </span>
        </div>

        {/* Divider */}
        <div className="chronicle-rule" aria-hidden="true" />

        {/* Epitaph */}
        <blockquote className="chronicle-epitaph">
          {chronicle.epitaphLines.map((line, i) => (
            <p key={i} className="chronicle-epitaph__line">{line}</p>
          ))}
        </blockquote>

        {/* Divider */}
        <div className="chronicle-rule" aria-hidden="true" />

        {/* Tags summary */}
        <div className="chronicle-tags">
          {perks.length > 0 && (
            <div className="chronicle-tag-group chronicle-tag-group--perk">
              <h3 className="chronicle-tag-group__heading">✦ Perks</h3>
              <ul>
                {perks.map((t) => <li key={t.name}>{t.name}</li>)}
              </ul>
            </div>
          )}
          {scars.length > 0 && (
            <div className="chronicle-tag-group chronicle-tag-group--scar">
              <h3 className="chronicle-tag-group__heading">✧ Scars</h3>
              <ul>
                {scars.map((t) => <li key={t.name}>{t.name}</li>)}
              </ul>
            </div>
          )}
          {titles.length > 0 && (
            <div className="chronicle-tag-group chronicle-tag-group--title">
              <h3 className="chronicle-tag-group__heading">★ Titles</h3>
              <ul>
                {titles.map((t) => <li key={t.name}>{t.name}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Legacy Score */}
        <div className="legacy-score" id="legacy-score">
          <span className="legacy-score__label">Legacy Score</span>
          <span className="legacy-score__value">{chronicle.legacyScore}</span>
        </div>

        {/* Divider */}
        <div className="chronicle-rule" aria-hidden="true" />

        {/* CTA row */}
        <div className="chronicle-cta">
          <button
            id="chronicle-copy-btn"
            className="chronicle-btn chronicle-btn--secondary"
            onClick={exportToClipboard}
          >
            {copied ? '✓ Copied!' : '📋 Copy Epitaph'}
          </button>

          <button
            id="chronicle-new-btn"
            className="chronicle-btn chronicle-btn--ghost"
            onClick={() => onNewGame()}
          >
            New Legend
          </button>
        </div>

        {/* Carry-over contracts */}
        <div className="chronicle-carryover">
          <p className="chronicle-carryover__label">
            — Import {chronicle.character.name} into a higher contract —
          </p>
          <div className="chronicle-carryover__btns">
            {higherContracts.map((c, idx) => {
              const contractIndex = CONTRACTS.findIndex((cc) => cc.tier === c.tier);
              const isCurrentTier = c.tier === chronicle.contractTier;
              return (
                <button
                  key={c.tier}
                  id={`carryover-tier-${c.tier}-btn`}
                  className={`chronicle-carry-btn ${isCurrentTier ? 'chronicle-carry-btn--dim' : ''}`}
                  onClick={() => handleCarryOver(contractIndex)}
                  title={c.description}
                >
                  <span className="chronicle-carry-btn__tier">Tier {c.tier}</span>
                  <span className="chronicle-carry-btn__label">{c.label}</span>
                  {!isCurrentTier && (
                    <span className="chronicle-carry-btn__bonus">{c.rewardBonus}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom ornament */}
        <div className="chronicle-ornament" aria-hidden="true">✦ ─── ✦ ─── ✦</div>
      </div>
    </div>
  );
}
