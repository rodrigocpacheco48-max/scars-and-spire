// ─── Persistence — localStorage helpers for Scars & Spire ───────────────────
// All keys are namespaced under 'ss_' to avoid collisions.

import type { GameState, Character } from '@/types/game';

const KEY_SAVE       = 'ss_save';
const KEY_ACTIVE_RUN = 'scars_active_run';
const KEY_IMPORT     = 'ss_import';
const KEY_GRAVEYARD  = 'scars_graveyard';
const SAVE_VERSION   = 1;

// ─── Graveyard ────────────────────────────────────────────────────────────────

export interface GraveyardEntry {
  id: string;
  character: Character;
  contractLabel: string;
  contractTier: string;
  causeOfDeath: string;
  timestamp: number;
}

export function logToGraveyard(
  character: Character,
  contractLabel = 'Unknown Contract',
  contractTier = 'I',
  cause = 'Abandoned to the Void'
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY_GRAVEYARD);
    const entries: GraveyardEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: GraveyardEntry = {
      id: Math.random().toString(36).slice(2, 9),
      character,
      contractLabel,
      contractTier,
      causeOfDeath: cause,
      timestamp: Date.now(),
    };
    entries.unshift(newEntry);
    localStorage.setItem(KEY_GRAVEYARD, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function getGraveyard(): GraveyardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_GRAVEYARD);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Serialisation ────────────────────────────────────────────────────────────

export function saveGame(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ ...state, saveVersion: SAVE_VERSION });
    localStorage.setItem(KEY_SAVE, payload);
    localStorage.setItem(KEY_ACTIVE_RUN, payload);
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY_SAVE) || localStorage.getItem(KEY_ACTIVE_RUN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState & { saveVersion?: number };
    // Reject saves from incompatible versions
    if ((parsed.saveVersion ?? 0) < SAVE_VERSION) return null;
    // Sanity check: must have a character and be in a resumable phase
    if (!parsed.character || parsed.phase === 'creation') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY_SAVE);
    localStorage.removeItem(KEY_ACTIVE_RUN);
  } catch { /* ignore */ }
}

// ─── Character Import (carry-over to higher-tier contracts) ───────────────────

export function importCharacter(character: Character): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_IMPORT, JSON.stringify(character));
  } catch { /* ignore */ }
}

export function loadImportedCharacter(): Character | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY_IMPORT);
    if (!raw) return null;
    return JSON.parse(raw) as Character;
  } catch {
    return null;
  }
}

export function clearImportedCharacter(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(KEY_IMPORT); } catch { /* ignore */ }
}

// ─── Chronicle / Epitaph helpers ─────────────────────────────────────────────

export interface ChronicleData {
  character: Character;
  contractLabel: string;
  contractTier: string;
  legacyScore: number;
  epitaphLines: string[];
  timestamp: number;
}

const TIER_MULTIPLIER: Record<string, number> = { I: 1, II: 2, III: 3 };

/** Build a Chronicle summary from the final game state. */
export function buildChronicle(state: GameState): ChronicleData {
  const char = state.character!;
  const contract = state.contract;
  const tier = contract?.tier ?? 'I';
  const tierMult = TIER_MULTIPLIER[tier] ?? 1;

  const legacyScore = char.tags.length * char.level * tierMult * 10;

  const epitaphLines = generateEpitaph(char, tier);

  return {
    character: char,
    contractLabel: contract?.label ?? 'Unknown Contract',
    contractTier: tier,
    legacyScore,
    epitaphLines,
    timestamp: Date.now(),
  };
}

// ─── Local Epitaph Generator (zero API cost) ──────────────────────────────────

const DARK_FANTASY_OPENERS = [
  'The bards sing of {name} in hushed, fearful tones.',
  'No gravestone marks where {name} fell — only silence.',
  '{name} walked the razor between duty and doom, and fell on the wrong side.',
  'They say the Greyspire still echoes with {name}\'s last words.',
  'The contract closed. {name} did not.',
];

const ELDRITCH_OPENERS = [
  '{name} dissolved into the space between stars. A pattern, now.',
  'The void remembers {name}, even if no one else does.',
  'Somewhere beyond the veil, {name} is still screaming — or still listening.',
  'Those who found the letter knew only that {name} had gone through the door.',
  '{name}\'s name appears in texts written centuries before their birth.',
];

const PERK_LINES: Record<string, string> = {
  default: 'Their perks were hard-won marks of survival.',
};
const SCAR_LINES: Record<string, string> = {
  default: 'The scars they carried were the price of every step forward.',
};
const TITLE_LINES: Record<string, string> = {
  default: 'They earned a title few dare speak aloud.',
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEpitaph(char: Character, tier: string): string[] {
  const openers = char.theme === 'dark-fantasy' ? DARK_FANTASY_OPENERS : ELDRITCH_OPENERS;
  const opener = pick(openers).replace('{name}', char.name);

  const lines: string[] = [opener];

  const perks  = char.tags.filter(t => t.type === 'perk');
  const scars  = char.tags.filter(t => t.type === 'scar');
  const titles = char.tags.filter(t => t.type === 'title');

  if (perks.length > 0) {
    const names = perks.map(p => p.name).join(', ');
    lines.push(`Bearing the gifts of ${names} — power at a price.`);
  } else {
    lines.push(PERK_LINES.default);
  }

  if (scars.length > 0) {
    const names = scars.map(s => s.name).join(' and ');
    lines.push(`Marked forever by ${names}.`);
  } else {
    lines.push(SCAR_LINES.default);
  }

  if (titles.length > 0) {
    lines.push(`Known to the end as "${titles[titles.length - 1].name}".`);
  } else {
    lines.push(TITLE_LINES.default);
  }

  const tierTexts: Record<string, string> = {
    I:   'A Whisper Contract — modest stakes, true ruin.',
    II:  'A Crimson Contract — blood and iron to the last.',
    III: 'A Void Contract — the highest stakes imaginable. The world noticed.',
  };
  lines.push(tierTexts[tier] ?? tierTexts['I']);

  return lines;
}
