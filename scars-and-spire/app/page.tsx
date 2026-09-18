'use client';

import CharacterCreation from '@/components/CharacterCreation';
import Topbar from '@/components/Topbar';
import StoryLog from '@/components/StoryLog';
import ActionDock from '@/components/ActionDock';
import PixelScene from '@/components/PixelScene';
import { useGameStore } from '@/lib/gameStore';

export default function Home() {
  const {
    state,
    isLoading,
    error,
    sceneMeta,
    startGame,
    makeChoice,
    submitCustomAction,
    randomizeCharacter,
  } = useGameStore();

  if (state.phase === 'creation') {
    return (
      <CharacterCreation
        onComplete={startGame}
        onRandomize={randomizeCharacter}
      />
    );
  }

  return (
    <div className="game-shell" id="game-shell">
      <Topbar character={state.character!} />

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
    </div>
  );
}
