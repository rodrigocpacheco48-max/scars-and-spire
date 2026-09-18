import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// ─── Response Schema ───────────────────────────────────────────────────────

export const TurnResponseSchema = z.object({
  narrative: z
    .string()
    .describe('Vivid atmospheric prose continuing the story. Max 85 words.'),
  tensionDelta: z
    .number()
    .min(-30)
    .max(35)
    .describe('Tension change. Negative = relief, positive = escalation.'),
  choices: z
    .array(z.string())
    .length(3)
    .describe('Exactly 3 distinct, meaningful choices. Each 5-12 words.'),
  isCriticalCrisis: z
    .boolean()
    .describe('True when this is a critical crisis demanding immediate resolution.'),
  sceneMeta: z.object({
    biome: z.string(),
    lighting: z.string(),
    weather: z.string(),
  }),
  acquiredTag: z
    .object({
      name: z.string(),
      type: z.enum(['perk', 'scar', 'title']),
      description: z.string(),
    })
    .optional()
    .describe('A new tag earned this turn. Omit if none — do NOT award every turn.'),
});

export type TurnResponse = z.infer<typeof TurnResponseSchema>;

// ─── Request Body ──────────────────────────────────────────────────────────

export interface TurnRequestBody {
  character: {
    name: string;
    theme: string;
    level: number;
    levelTitle: string;
    tension: number;
    tags: { name: string; type: string; description?: string }[];
    archetypeId: string;
    scarId: string;
  };
  contract: {
    tier: string;
    label: string;
    description: string;
  } | null;
  /** Sliding window: last 2 player-action + narrator-response pairs only. */
  recentHistory: { role: 'player' | 'narrator'; text: string }[];
  playerAction: string;
}

// ─── System Prompt ─────────────────────────────────────────────────────────

function buildSystemPrompt(body: TurnRequestBody): string {
  const { character, contract } = body;
  const tagList = character.tags
    .map((t) => `${t.name} (${t.type}${t.description ? ': ' + t.description : ''})`)
    .join('; ');
  const tensionLabel =
    character.tension >= 80
      ? 'CRITICAL - near breaking point'
      : character.tension >= 50
      ? 'HIGH - fraying at the edges'
      : 'manageable';

  return `You are the narrator of SCARS & SPIRE, a dark narrative RPG.
Your prose is cinematic, terse, and atmospheric - never whimsical or verbose.
Theme: "${character.theme}".

CHARACTER SHEET:
  Name      : ${character.name}
  Title     : ${character.levelTitle} (Level ${character.level})
  Theme     : ${character.theme}
  Tension   : ${character.tension}/100 [${tensionLabel}]
  Tags      : ${tagList || 'none'}
  Contract  : ${contract ? `${contract.label} (Tier ${contract.tier}) - ${contract.description}` : 'none'}

NARRATION RULES:
1. "narrative" MUST be <=85 words. Be evocative, specific, and in-world.
2. "choices" MUST be exactly 3 strings, each 5-12 words, meaningfully different.
3. "tensionDelta": danger/revelation -> large positive; retreat/relief -> negative.
4. "isCriticalCrisis" = true only when tension >=80 AND the scene is genuinely dire.
5. "acquiredTag" is RARE - only for pivotal, earned moments, not every turn.
6. Tone: dark-fantasy = grim medieval dread; eldritch-horror = cosmic creeping unease.
7. Never break the fourth wall. Never mention "the game", "the player", or "choices".
8. Each response must move the story forward - no stalling or repeating prior beats.`.trim();
}

// ─── Route Handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: TurnRequestBody = await req.json();

    if (!body.character || !body.playerAction) {
      return NextResponse.json(
        { error: 'Missing required fields: character and playerAction.' },
        { status: 400 }
      );
    }

    const historyLines = body.recentHistory
      .map((h) => (h.role === 'player' ? `Player action: ${h.text}` : `Narrator: ${h.text}`))
      .join('\n\n');

    const userMessage = [historyLines, `Player action: ${body.playerAction}`]
      .filter(Boolean)
      .join('\n\n');

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: TurnResponseSchema,
      system: buildSystemPrompt(body),
      prompt: userMessage,
    });

    return NextResponse.json(object);
  } catch (err: unknown) {
    console.error('[/api/game/turn] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
