'use client';

import { useEffect, useCallback } from 'react';
import type { Character } from '@/types/game';

interface CodexModalProps {
  character: Character;
  onClose: () => void;
}

const TAG_META = {
  perk: {
    label: 'Perks',
    glyph: '✦',
    colorClass: 'codex-section--perk',
    emptyText: 'No perks earned yet. Survive long enough.',
  },
  scar: {
    label: 'Scars',
    glyph: '✧',
    colorClass: 'codex-section--scar',
    emptyText: 'No scars recorded. The worst is ahead.',
  },
  title: {
    label: 'Titles',
    glyph: '★',
    colorClass: 'codex-section--title',
    emptyText: 'No titles bestowed. Prove yourself first.',
  },
} as const;

export default function CodexModal({ character, onClose }: CodexModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const perks  = character.tags.filter((t) => t.type === 'perk');
  const scars  = character.tags.filter((t) => t.type === 'scar');
  const titles = character.tags.filter((t) => t.type === 'title');
  const grouped = { perk: perks, scar: scars, title: titles };

  const themeIcon = character.theme === 'dark-fantasy' ? '⚔️' : '👁️';

  return (
    <div
      className="codex-backdrop"
      id="codex-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Character Codex"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="codex-panel" id="codex-panel">
        {/* Header */}
        <div className="codex-header">
          <div className="codex-header__title">
            <span className="codex-header__icon" aria-hidden="true">{themeIcon}</span>
            <div>
              <h2 className="codex-name">{character.name}</h2>
              <p className="codex-subtitle">
                Lvl {character.level} · {character.levelTitle}
              </p>
            </div>
          </div>
          <button
            id="codex-close-btn"
            className="codex-close-btn"
            onClick={onClose}
            aria-label="Close Codex"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="codex-divider" aria-hidden="true" />

        {/* Sections */}
        <div className="codex-body">
          {(['perk', 'scar', 'title'] as const).map((type) => {
            const meta = TAG_META[type];
            const tags = grouped[type];
            return (
              <section key={type} className={`codex-section ${meta.colorClass}`}>
                <h3 className="codex-section__heading">
                  <span aria-hidden="true">{meta.glyph}</span> {meta.label}
                  <span className="codex-section__count">{tags.length}</span>
                </h3>
                {tags.length === 0 ? (
                  <p className="codex-empty">{meta.emptyText}</p>
                ) : (
                  <ul className="codex-tag-list" role="list">
                    {tags.map((tag) => (
                      <li key={tag.name} className="codex-tag-card">
                        <span className="codex-tag-card__glyph" aria-hidden="true">
                          {meta.glyph}
                        </span>
                        <div className="codex-tag-card__body">
                          <span className="codex-tag-card__name">{tag.name}</span>
                          {tag.description && (
                            <p className="codex-tag-card__desc">{tag.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer: tension */}
        <div className="codex-footer">
          <span className="codex-footer__label">Current Tension</span>
          <div className="codex-tension-track">
            <div
              className="codex-tension-fill"
              style={{ width: `${character.tension}%` }}
            />
          </div>
          <span className="codex-footer__value">{character.tension}%</span>
        </div>
      </div>
    </div>
  );
}
