'use client';

import CharacterCreation from '@/components/CharacterCreation';
import Topbar from '@/components/Topbar';
import StoryLog from '@/components/StoryLog';
import ActionDock from '@/components/ActionDock';
import { useGameStore } from '@/lib/mockStore';

export default function Home() {
  const { state, startGame, makeChoice, submitCustomAction, randomizeCharacter } = useGameStore();

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
      <main className="game-main">
        <StoryLog entries={state.log} />
        <ActionDock
          choices={state.currentChoices}
          onChoice={makeChoice}
          onCustomAction={submitCustomAction}
        />
      </main>
    </div>
  );
}
