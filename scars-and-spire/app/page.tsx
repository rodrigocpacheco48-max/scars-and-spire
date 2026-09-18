'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const CharacterCreation = dynamic(
  () => import('@/components/CharacterCreation'),
  { ssr: false }
); import Topbar from '@/components/Topbar';
import StoryLog from '@/components/StoryLog';
import ActionDock from '@/components/ActionDock';
import PixelScene from '@/components/PixelScene';
import CodexModal from '@/components/CodexModal';
import ChronicleModal from '@/components/ChronicleModal';
import { useGameStore } from '@/lib/gameStore';
import { loadImportedCharacter, clearImportedCharacter } from '@/lib/persistence';

export default function Home() {
  const {
    state,
    isLoading,
    error,
    sceneMeta,
    hasSave,
    startGame,
    dismissSave,
    abandonRun,
    makeChoice,
    submitCustomAction,
    randomizeCharacter,
    CONTRACTS,
  } = useGameStore();

  const [codexOpen, setCodexOpen] = useState(false);

  // ── Handle starting a new game (optionally with carry-over character) ───────
  const handleNewGame = (contractIndex = 0) => {
    const imported = loadImportedCharacter();
    if (imported) {
      clearImportedCharacter();
      startGame(imported, contractIndex);
    } else {
      // Dismiss back to creation screen
      dismissSave();
    }
  };

  // ── Chronicle phase ──────────────────────────────────────────────────────
  if (state.phase === 'chronicle') {
    return (
      <ChronicleModal
        state={state}
        onNewGame={(contractIndex) => {
          const imported = loadImportedCharacter();
          if (imported) {
            clearImportedCharacter();
            startGame(imported, contractIndex ?? 0);
          } else {
            dismissSave();
          }
        }}
      />
    );
  }

  // ── Creation phase ───────────────────────────────────────────────────────
  if (state.phase === 'creation') {
    return (
      <>
        {/* Resume banner — shown if a save exists */}
        {hasSave && (
          <div className="resume-banner" role="status">
            <span>📜 A previous legend was found.</span>
            <div className="resume-banner__actions">
              <button
                id="resume-dismiss-btn"
                className="resume-btn resume-btn--ghost"
                onClick={dismissSave}
              >
                Discard
              </button>
            </div>
          </div>
        )}
        <CharacterCreation
          onComplete={startGame}
          onRandomize={randomizeCharacter}
          contracts={CONTRACTS}
        />
      </>
    );
  }

  // ── Playing phase ────────────────────────────────────────────────────────
  return (
    <div className="game-shell" id="game-shell">
      <Topbar
        character={state.character!}
        onOpenCodex={() => setCodexOpen(true)}
        onAbandonRun={abandonRun}
      />

      {/* Procedural pixel scene — updates from Gemini sceneMeta each turn */}
      <PixelScene sceneMeta={sceneMeta} theme={state.character!.theme} />

      {error && (
        <div className="api-error-banner" role="alert">
          ⚠ {error}
        </div>
      )}
      <main className="game-main">
        <StoryLog
          entries={state.log}
          isLoading={isLoading}
          tension={state.character!.tension}
        />
        <ActionDock
          choices={state.currentChoices}
          onChoice={makeChoice}
          onCustomAction={submitCustomAction}
          disabled={isLoading}
        />
      </main>

      {/* Codex modal */}
      {codexOpen && state.character && (
        <CodexModal
          character={state.character}
          onClose={() => setCodexOpen(false)}
        />
      )}
    </div>
  );
}
