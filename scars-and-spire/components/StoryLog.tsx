'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LogEntry } from '@/types/game';
import {
  speak,
  cancelSpeech,
  isSpeechSynthesisSupported,
} from '@/lib/speech';

interface StoryLogProps {
  entries: LogEntry[];
  isLoading?: boolean;
  tension?: number;
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

export default function StoryLog({
  entries,
  isLoading = false,
  tension = 0,
}: StoryLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastNarrativeRef = useRef<string>('');

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsSupported = typeof window !== 'undefined' && isSpeechSynthesisSupported();

  // Whispers of Madness: tension > 70 → glitch class
  const whispers = tension > 70;

  // Auto-scroll to the latest entry or the loading indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, isLoading]);

  // TTS: speak the latest narrative entry when it changes
  useEffect(() => {
    if (!ttsEnabled || isLoading) return;
    const narratives = entries.filter((e) => e.kind === 'narrative');
    const last = narratives[narratives.length - 1];
    if (!last || last.text === lastNarrativeRef.current) return;
    lastNarrativeRef.current = last.text;
    setIsSpeaking(true);
    speak(last.text, () => setIsSpeaking(false));
  }, [entries, ttsEnabled, isLoading]);

  // Stop speech when TTS is toggled off
  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => {
      if (prev) {
        cancelSpeech();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  // Stop speech on unmount
  useEffect(() => () => cancelSpeech(), []);

  return (
    <div
      className={`story-log ${whispers ? 'story-log--whispers' : ''}`}
      id="story-log"
      role="log"
      aria-live="polite"
      aria-label="Story log"
    >
      {/* TTS toggle */}
      {ttsSupported && (
        <button
          id="tts-toggle-btn"
          className={`tts-toggle-btn ${ttsEnabled ? 'tts-toggle-btn--on' : ''}`}
          onClick={toggleTts}
          aria-label={ttsEnabled ? 'Disable narrator voice' : 'Enable narrator voice'}
          title={ttsEnabled ? 'Voice: ON — click to mute' : 'Voice: OFF — click to enable'}
        >
          {isSpeaking ? (
            <span className="tts-speaking-icon" aria-hidden="true">
              <span /><span /><span />
            </span>
          ) : (
            <span aria-hidden="true">{ttsEnabled ? '🔊' : '🔇'}</span>
          )}
        </button>
      )}

      <div className={`story-log__inner ${whispers ? 'story-log__inner--whispers' : ''}`}>
        {entries.length === 0 && !isLoading && (
          <p className="text-muted text-sm italic text-center py-8">Your story awaits…</p>
        )}
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            id={`log-entry-${entry.id}`}
            className={`log-entry ${ENTRY_STYLES[entry.kind]} ${
              idx === entries.length - 1 && !isLoading ? 'log-entry--latest' : ''
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

        {/* Typing indicator while Gemini is generating */}
        {isLoading && (
          <div className="log-entry log-narrative log-entry--latest" aria-label="Narrator is writing…">
            <span className="typing-indicator" aria-hidden="true">
              <span /><span /><span />
            </span>
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
