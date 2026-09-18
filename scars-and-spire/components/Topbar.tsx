'use client';

import type { Character } from '@/types/game';

interface TopbarProps {
  character: Character;
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

export default function Topbar({ character }: TopbarProps) {
  const { name, level, levelTitle, tension, tags, theme } = character;
  const perks = tags.filter((t) => t.type === 'perk');
  const scars = tags.filter((t) => t.type === 'scar');
  const titles = tags.filter((t) => t.type === 'title');

  const themeIcon = theme === 'dark-fantasy' ? '⚔️' : '👁️';

  return (
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

      {/* Center: Tags */}
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

      {/* Right: Tension meter */}
      <div className="flex flex-col items-end gap-1 shrink-0 min-w-[140px]">
        <div className="flex items-center gap-2 w-full justify-end">
          <span className="text-xs text-muted uppercase tracking-widest">Tension</span>
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
    </header>
  );
}
