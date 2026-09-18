// ─── Core Tag System ──────────────────────────────────────────────────────────

export type TagType = 'perk' | 'scar' | 'title';

export interface Tag {
  name: string;
  type: TagType;
  description?: string;
}

// ─── Themes ───────────────────────────────────────────────────────────────────

export type Theme = 'dark-fantasy' | 'eldritch-horror';

// ─── Archetype ────────────────────────────────────────────────────────────────

export interface Archetype {
  id: string;
  name: string;
  description: string;
  theme: Theme;
  startingTag: Tag;
  flavorIcon: string; // emoji used as icon
}

// ─── Scar ─────────────────────────────────────────────────────────────────────

export interface Scar {
  id: string;
  name: string;
  description: string;
  theme: Theme;
  effect: string;
  flavorIcon: string;
}

// ─── Character ────────────────────────────────────────────────────────────────

export interface Character {
  name: string;
  theme: Theme;
  level: number;
  levelTitle: string;
  tension: number; // 0–100
  tags: Tag[];
  archetypeId: string;
  scarId: string;
}

// ─── Contract Tiers ───────────────────────────────────────────────────────────

export type ContractTier = 'I' | 'II' | 'III';

export interface Contract {
  tier: ContractTier;
  label: string;
  description: string;
  tensionMultiplier: number;
  rewardBonus: string;
}

// ─── Scene Meta (returned by Gemini each turn) ────────────────────────────────

export interface SceneMeta {
  biome: string;
  lighting: string;
  weather: string;
}

// ─── Story / Narrative ────────────────────────────────────────────────────────

export type LogEntryKind = 'narrative' | 'choice' | 'system' | 'consequence';

export interface LogEntry {
  id: string;
  kind: LogEntryKind;
  text: string;
  timestamp: number;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase = 'creation' | 'playing';

export interface GameState {
  phase: GamePhase;
  character: Character | null;
  log: LogEntry[];
  currentChoices: string[];
  contract: Contract | null;
}

// ─── Level Titles ─────────────────────────────────────────────────────────────

export const LEVEL_TITLES: Record<Theme, Record<number, string>> = {
  'dark-fantasy': {
    1: 'Wretch',
    2: 'Blade-Sworn',
    3: 'Oath-Breaker',
    4: 'Dread Wanderer',
    5: 'Herald of Ruin',
  },
  'eldritch-horror': {
    1: 'Uninitiated',
    2: 'Touched',
    3: 'Fractured Mind',
    4: 'Herald of the Void',
    5: 'Consumed',
  },
};
