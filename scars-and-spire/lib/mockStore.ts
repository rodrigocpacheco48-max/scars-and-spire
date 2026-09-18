'use client';

import { useState, useCallback } from 'react';
import type { GameState, Character, LogEntry } from '@/types/game';
import {
  LEVEL_TITLES,
} from '@/types/game';
import {
  ARCHETYPES,
  SCARS,
  CONTRACTS,
  OPENING_NARRATIVES,
  MOCK_CHOICES,
  getArchetypesByTheme,
  getScarsByTheme,
} from '@/lib/gameData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeLogEntry(
  kind: LogEntry['kind'],
  text: string
): LogEntry {
  return { id: makeId(), kind, text, timestamp: Date.now() };
}

const CONSEQUENCE_RESPONSES: Record<string, { narrative: string; tensionDelta: number }[]> = {
  // Dark Fantasy
  'Head for the Greyspire immediately.': [
    {
      narrative:
        'You take the eastern road without ceremony. The path narrows as twilight bleeds into the hills. By nightfall you can see the tower — a jagged silhouette against a bruised sky. Something about its windows makes you feel watched.',
      tensionDelta: 8,
    },
  ],
  'Seek a local guide in the tavern.': [
    {
      narrative:
        'The Crooked Antler reeks of cheap tallow and cheaper ale. A woman in the corner nurses a wound on her palm and doesn\'t look up when you enter — but she\'s been waiting. "You\'re the one with the contract," she says. It isn\'t a question.',
      tensionDelta: 3,
    },
  ],
  'Study the ruins\' history at the abbey.': [
    {
      narrative:
        'The abbey\'s records room smells of rot and old prayer. A young monk leads you to a locked cabinet. The ledger inside has entries in three different hands — each set ends mid-sentence. The last date is six months ago.',
      tensionDelta: 5,
    },
  ],
  // Eldritch Horror
  'Follow the map\'s marked route.': [
    {
      narrative:
        'The route bends in ways that don\'t match the terrain — yet every landmark matches perfectly. By the third mile, you realize the map isn\'t describing geography. It\'s describing *choices.*',
      tensionDelta: 10,
    },
  ],
  'Investigate who delivered the envelope.': [
    {
      narrative:
        'The postal clerk remembers nothing. The ink on the registry is yours — date, signature, everything. Security footage shows an empty corridor at the time of delivery. Your hand is shaking. You stop looking at it.',
      tensionDelta: 12,
    },
  ],
  'Wait and watch for patterns.': [
    {
      narrative:
        'Forty-seven minutes. You count eleven events that shouldn\'t correlate — a cough, a power flicker, a pigeon striking glass. They\'re evenly spaced. They\'re a countdown. You stop waiting.',
      tensionDelta: 7,
    },
  ],
};

function getNextChoices(prevChoice: string, theme: string): string[] {
  if (theme === 'dark-fantasy') {
    if (prevChoice.includes('Greyspire')) {
      return [
        'Approach the tower gate directly.',
        'Circle the perimeter first.',
        'Call out — someone might be inside.',
      ];
    }
    if (prevChoice.includes('guide')) {
      return [
        'Accept her offer.',
        'Decline — you work alone.',
        'Ask what wounded her.',
      ];
    }
    return [
      'Read the final entry aloud.',
      'Take the ledger and leave.',
      'Ask the monk what he knows.',
    ];
  } else {
    if (prevChoice.includes('map')) {
      return [
        'Make the choice the map implies.',
        'Deviate deliberately.',
        'Burn the map.',
      ];
    }
    if (prevChoice.includes('delivered')) {
      return [
        'Accept the impossibility and proceed.',
        'Seek a rational explanation.',
        'Contact someone who might understand.',
      ];
    }
    return [
      'Follow the countdown\'s implied destination.',
      'Disrupt the pattern.',
      'Document everything first.',
    ];
  }
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  phase: 'creation',
  character: null,
  log: [],
  currentChoices: [],
  contract: CONTRACTS[0],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameStore() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  // ── Confirm character creation ──────────────────────────────────────────────
  const startGame = useCallback(
    (character: Character) => {
      const openingText = OPENING_NARRATIVES[character.theme];
      const choices = MOCK_CHOICES[character.theme];

      setState({
        phase: 'playing',
        character,
        log: [
          makeLogEntry('system', `You are ${character.name}, ${character.levelTitle}.`),
          makeLogEntry('narrative', openingText),
        ],
        currentChoices: choices,
        contract: CONTRACTS[0],
      });
    },
    []
  );

  // ── Make a choice ───────────────────────────────────────────────────────────
  const makeChoice = useCallback((choice: string) => {
    setState((prev) => {
      if (!prev.character) return prev;

      const responses = CONSEQUENCE_RESPONSES[choice];
      const response = responses?.[0] ?? {
        narrative: `You chose: "${choice}". The world shifts around that decision.`,
        tensionDelta: 5,
      };

      const newTension = Math.min(
        100,
        Math.max(0, prev.character!.tension + response.tensionDelta)
      );

      const nextChoices = getNextChoices(choice, prev.character!.theme);

      const newLog: LogEntry[] = [
        ...prev.log,
        makeLogEntry('choice', `> ${choice}`),
        makeLogEntry('narrative', response.narrative),
      ];

      // Add a tension spike consequence at high tension
      if (newTension >= 80 && prev.character!.tension < 80) {
        newLog.push(
          makeLogEntry(
            'consequence',
            '⚠ Your tension crests a dangerous threshold. Something fundamental is beginning to shift.'
          )
        );
      }

      return {
        ...prev,
        character: { ...prev.character!, tension: newTension },
        log: newLog,
        currentChoices: nextChoices,
      };
    });
  }, []);

  // ── Submit custom action ────────────────────────────────────────────────────
  const submitCustomAction = useCallback((text: string) => {
    setState((prev) => {
      if (!prev.character) return prev;

      const newTension = Math.min(100, prev.character.tension + 4);

      return {
        ...prev,
        character: { ...prev.character, tension: newTension },
        log: [
          ...prev.log,
          makeLogEntry('choice', `> ${text}`),
          makeLogEntry(
            'narrative',
            `You act on your own instinct. The weight of that choice settles on your shoulders. The world doesn't immediately respond — but it noticed.`
          ),
        ],
        currentChoices: prev.currentChoices,
      };
    });
  }, []);

  // ── Randomize character ─────────────────────────────────────────────────────
  const randomizeCharacter = useCallback(
    (theme: 'dark-fantasy' | 'eldritch-horror'): Partial<Character> => {
      const archetypes = getArchetypesByTheme(theme);
      const scars = getScarsByTheme(theme);
      const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
      const scar = scars[Math.floor(Math.random() * scars.length)];
      const fantasyNames = {
        'dark-fantasy': ['Morvaine', 'Aldric', 'Sereveth', 'Kaspar', 'Toryn', 'Dryssa'],
        'eldritch-horror': ['Elara', 'Nevros', 'Quillian', 'Syme', 'Vashti', 'Korrigan'],
      };
      const names = fantasyNames[theme];
      const name = names[Math.floor(Math.random() * names.length)];

      return {
        name,
        theme,
        archetypeId: archetype.id,
        scarId: scar.id,
        level: 1,
        levelTitle: LEVEL_TITLES[theme][1],
        tension: 10,
        tags: [archetype.startingTag, { name: scar.name, type: 'scar' }],
      };
    },
    []
  );

  const abandonRun = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    startGame,
    abandonRun,
    makeChoice,
    submitCustomAction,
    randomizeCharacter,
    // expose data for components
    ARCHETYPES,
    SCARS,
  };
}
