'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Character, LogEntry, Tag, SceneMeta } from '@/types/game';
import { LEVEL_TITLES } from '@/types/game';
import {
  ARCHETYPES,
  SCARS,
  CONTRACTS,
  OPENING_NARRATIVES,
  MOCK_CHOICES,
  getArchetypesByTheme,
  getScarsByTheme,
} from '@/lib/gameData';
import { saveGame, loadGame, clearSave } from '@/lib/persistence';
import type { TurnRequestBody, TurnResponse } from '@/app/api/game/turn/route';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeLogEntry(kind: LogEntry['kind'], text: string): LogEntry {
  return { id: makeId(), kind, text, timestamp: Date.now() };
}

const INITIAL_STATE: GameState = {
  phase: 'creation',
  character: null,
  log: [],
  currentChoices: [],
  contract: CONTRACTS[0],
};

// ─── Chronicle trigger threshold ─────────────────────────────────────────────
// Act 3 concludes when tension reaches this value OR after MAX_TURNS choices.
const CHRONICLE_TENSION_THRESHOLD = 95;
const MAX_TURNS = 20;

// ─── Sliding Window ──────────────────────────────────────────────────────────
// We keep only the last WINDOW_SIZE player+narrator pairs to send to the API.
const WINDOW_SIZE = 2;

interface HistoryEntry {
  role: 'player' | 'narrator';
  text: string;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameStore() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sceneMeta, setSceneMeta] = useState<SceneMeta | null>(null);
  const [hasSave, setHasSave] = useState(false);

  // Always-current ref so async callbacks don't close over stale state
  const stateRef = useRef<GameState>(INITIAL_STATE);
  const turnCountRef = useRef(0);

  const setStateSynced = useCallback((updater: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      // Auto-save whenever we're in a resumable phase
      if (next.phase === 'playing' || next.phase === 'chronicle') {
        saveGame(next);
      }
      return next;
    });
  }, []);

  // ── Hydrate from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setHasSave(true);
      // Restore sliding window length from log (rough estimate)
      turnCountRef.current = Math.floor(
        saved.log.filter((e) => e.kind === 'choice').length
      );
      stateRef.current = saved;
      setState(saved);
    }
  }, []);

  // Sliding window history (not part of GameState to avoid re-renders)
  const historyRef = useRef<HistoryEntry[]>([]);

  // ── Chronicle transition helper ────────────────────────────────────────────
  const triggerChronicle = useCallback(() => {
    setStateSynced((prev) => {
      const concludingLog: LogEntry[] = [
        ...prev.log,
        makeLogEntry(
          'consequence',
          '✦ The tale is complete. Your legend is sealed in the Chronicle.'
        ),
      ];
      const next: GameState = { ...prev, phase: 'chronicle', log: concludingLog };
      return next;
    });
  }, [setStateSynced]);

  // ── Start game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(
    (character: Character, contractIndex = 0) => {
      historyRef.current = [];
      turnCountRef.current = 0;
      clearSave();
      const openingText = OPENING_NARRATIVES[character.theme];
      const choices = MOCK_CHOICES[character.theme];
      const contract = CONTRACTS[Math.min(contractIndex, CONTRACTS.length - 1)];
      const nextState: GameState = {
        phase: 'playing',
        character,
        log: [
          makeLogEntry('system', `You are ${character.name}, ${character.levelTitle}.`),
          makeLogEntry('narrative', openingText),
        ],
        currentChoices: choices,
        contract,
      };
      stateRef.current = nextState;
      setState(nextState);
      setHasSave(false);
    },
    []
  );

  // ── Dismiss save / new game ────────────────────────────────────────────────
  const dismissSave = useCallback(() => {
    clearSave();
    stateRef.current = INITIAL_STATE;
    setState(INITIAL_STATE);
    setHasSave(false);
  }, []);

  // ── Call Gemini API ────────────────────────────────────────────────────────
  const callGemini = useCallback(
    async (playerAction: string, currentState: GameState): Promise<TurnResponse | null> => {
      if (!currentState.character) return null;

      // Build sliding window: last WINDOW_SIZE pairs
      const recentHistory = historyRef.current.slice(-(WINDOW_SIZE * 2));

      const body: TurnRequestBody = {
        character: currentState.character,
        contract: currentState.contract,
        recentHistory,
        playerAction,
      };

      const res = await fetch('/api/game/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error ${res.status}`);
      }

      return res.json();
    },
    []
  );

  // ── Make a choice ──────────────────────────────────────────────────────────
  const makeChoice = useCallback(
    async (choice: string) => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);

      // Optimistically add player choice to log
      setStateSynced((prev) => ({
        ...prev,
        log: [...prev.log, makeLogEntry('choice', `> ${choice}`)],
        currentChoices: [],
      }));

      try {
        // Read current state from ref (always up-to-date)
        const result = await callGemini(choice, stateRef.current);
        if (!result) return;

        // Update scene meta from this turn
        if (result.sceneMeta) setSceneMeta(result.sceneMeta);

        // Push to sliding window
        historyRef.current.push({ role: 'player', text: choice });
        historyRef.current.push({ role: 'narrator', text: result.narrative });

        // Increment turn counter
        turnCountRef.current += 1;

        setStateSynced((prev) => {
          if (!prev.character) return prev;

          const newTension = Math.min(
            100,
            Math.max(0, prev.character.tension + result.tensionDelta)
          );

          const newLog: LogEntry[] = [
            ...prev.log,
            makeLogEntry('narrative', result.narrative),
          ];

          if (result.isCriticalCrisis) {
            newLog.push(
              makeLogEntry('consequence', '⚠ A critical crisis unfolds. Every choice matters.')
            );
          }

          const newTags: Tag[] = result.acquiredTag
            ? [...prev.character!.tags, result.acquiredTag]
            : prev.character!.tags;

          if (result.acquiredTag) {
            newLog.push(
              makeLogEntry(
                'consequence',
                `✦ New ${result.acquiredTag.type}: ${result.acquiredTag.name} — ${result.acquiredTag.description}`
              )
            );
          }

          return {
            ...prev,
            character: { ...prev.character!, tension: newTension, tags: newTags },
            log: newLog,
            currentChoices: result.choices,
          };
        });

        // ── Chronicle trigger: tension cap OR max turns ──────────────────────
        const currentTension = stateRef.current.character?.tension ?? 0;
        if (
          currentTension >= CHRONICLE_TENSION_THRESHOLD ||
          turnCountRef.current >= MAX_TURNS
        ) {
          // Small delay so final narrative renders first
          setTimeout(() => triggerChronicle(), 1200);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        // Restore choices on failure
        setStateSynced((prev) => ({
          ...prev,
          currentChoices: prev.currentChoices.length ? prev.currentChoices : ['Try again.'],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, callGemini, setStateSynced, triggerChronicle]
  );

  // ── Submit custom action ───────────────────────────────────────────────────
  const submitCustomAction = useCallback(
    async (text: string) => {
      if (isLoading) return;
      await makeChoice(text);
    },
    [isLoading, makeChoice]
  );

  // ── Randomize character ────────────────────────────────────────────────────
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

  return {
    state,
    isLoading,
    error,
    sceneMeta,
    hasSave,
    startGame,
    dismissSave,
    makeChoice,
    submitCustomAction,
    randomizeCharacter,
    triggerChronicle,
    ARCHETYPES,
    SCARS,
    CONTRACTS,
  };
}
