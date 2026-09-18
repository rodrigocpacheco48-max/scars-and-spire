'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  startDictation,
  stopDictation,
  isSpeechRecognitionSupported,
} from '@/lib/speech';

interface ActionDockProps {
  choices: string[];
  onChoice: (choice: string) => void;
  onCustomAction: (text: string) => void;
  disabled?: boolean;
}

export default function ActionDock({
  choices,
  onChoice,
  onCustomAction,
  disabled = false,
}: ActionDockProps) {
  const [customText, setCustomText] = useState('');
  const [recentChoice, setRecentChoice] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check STT support once on client
  const [sttSupported, setSttSupported] = useState(false);
  useEffect(() => {
    setSttSupported(isSpeechRecognitionSupported());
  }, []);

  const handleChoice = (choice: string) => {
    if (disabled) return;
    setRecentChoice(choice);
    onChoice(choice);
    setTimeout(() => setRecentChoice(null), 600);
  };

  const handleSubmitCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed || disabled) return;
    onCustomAction(trimmed);
    setCustomText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmitCustom();
  };

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopDictation();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    startDictation(
      (text) => {
        setCustomText((prev) => (prev ? `${prev} ${text}` : text));
        inputRef.current?.focus();
      },
      () => setIsListening(false)
    );
  }, [isListening]);

  // Stop dictation on unmount
  useEffect(() => () => stopDictation(), []);

  return (
    <div className="action-dock" id="action-dock">
      {/* Choice buttons */}
      <div className="choice-grid" role="group" aria-label="Story choices">
        {choices.map((choice, idx) => (
          <button
            key={choice}
            id={`choice-btn-${idx}`}
            onClick={() => handleChoice(choice)}
            disabled={disabled}
            className={`choice-btn ${recentChoice === choice ? 'choice-btn--active' : ''}`}
            aria-label={`Choice: ${choice}`}
          >
            <span className="choice-btn__index" aria-hidden="true">
              {idx + 1}
            </span>
            <span className="choice-btn__text">{choice}</span>
            <span className="choice-btn__arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="dock-divider">
        <span className="dock-divider__label">or forge your own path</span>
      </div>

      {/* Custom action input */}
      <div className="custom-action" role="group" aria-label="Custom action">
        <input
          ref={inputRef}
          id="custom-action-input"
          type="text"
          placeholder={isListening ? 'Listening…' : 'Describe your action…'}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={200}
          className="custom-input"
          aria-label="Custom action text"
        />

        {/* Mic button (hidden if STT not supported) */}
        {sttSupported && (
          <button
            id="mic-btn"
            className={`mic-btn ${isListening ? 'mic-btn--listening' : ''}`}
            onClick={handleMicClick}
            disabled={disabled}
            aria-label={isListening ? 'Stop listening' : 'Dictate action'}
            title={isListening ? 'Stop listening' : 'Speak your action'}
            type="button"
          >
            <span aria-hidden="true">{isListening ? '⏹' : '🎙'}</span>
          </button>
        )}

        <button
          id="custom-submit-btn"
          onClick={handleSubmitCustom}
          disabled={disabled || !customText.trim()}
          className="custom-submit-btn"
          aria-label="Submit custom action"
        >
          ↵ Act
        </button>
      </div>
    </div>
  );
}
