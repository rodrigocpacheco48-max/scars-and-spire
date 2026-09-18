'use client';

import CharacterCreation from '@/components/CharacterCreation';
import Topbar from '@/components/Topbar';
import StoryLog from '@/components/StoryLog';
import ActionDock from '@/components/ActionDock';
import { useGameStore } from '@/lib/gameStore';

export default function Home() {
  const {
    state,
    isLoading,
    error,
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
      {error && (
        <div className="api-error-banner" role="alert">
          ⚠ {error}
        </div>
      )}
      <main className="game-main">
        <StoryLog entries={state.log} isLoading={isLoading} />
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
