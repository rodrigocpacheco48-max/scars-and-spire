'use client';

import { useEffect, useRef } from 'react';
import type { LogEntry } from '@/types/game';

interface StoryLogProps {
  entries: LogEntry[];
}

const ENTRY_STYLES: Record<LogEntry['kind'], string> = {
  narrative: 'log-narrative',
  choice: 'log-choice',
  system: 'log-system',
  consequence: 'log-consequence',
};

const ENTRY_ICONS: Record<LogEntry['kind'], string> = {
  narrative: '',
  choice: '›',
  system: '—',
  consequence: '⚠',
};

export default function StoryLog({ entries }: StoryLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="story-log" id="story-log" role="log" aria-live="polite" aria-label="Story log">
      <div className="story-log__inner">
        {entries.length === 0 && (
          <p className="text-muted text-sm italic text-center py-8">Your story awaits…</p>
        )}
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            id={`log-entry-${entry.id}`}
            className={`log-entry ${ENTRY_STYLES[entry.kind]} ${
              idx === entries.length - 1 ? 'log-entry--latest' : ''
            }`}
            style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
          >
            {ENTRY_ICONS[entry.kind] && (
              <span className="log-entry__icon" aria-hidden="true">
                {ENTRY_ICONS[entry.kind]}
              </span>
            )}
            <p className="log-entry__text">{entry.text}</p>
          </div>
        ))}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
