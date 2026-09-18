import type { Archetype, Scar, Contract, Theme } from '@/types/game';

// ─── Archetypes ───────────────────────────────────────────────────────────────

export const ARCHETYPES: Archetype[] = [
  // Dark Fantasy
  {
    id: 'df-graveblade',
    name: 'Graveblade',
    description: 'A warrior who binds death to their weapon. Every kill leaves a mark — on the blade and the soul.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Death-Bound Steel', type: 'perk', description: 'Weapons count as consecrated against the undead.' },
    flavorIcon: '⚔️',
  },
  {
    id: 'df-hexwarden',
    name: 'Hexwarden',
    description: 'Once a hedge-witch turned mercenary. Curses linger in your wake like smoke from a funeral pyre.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Lingering Hex', type: 'perk', description: 'Curses you cast persist one scene longer than normal.' },
    flavorIcon: '🌑',
  },
  {
    id: 'df-ruinpriest',
    name: 'Ruin Priest',
    description: 'A fallen cleric whose god is dead — or worse, still listening. You preach to empty altars.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Apostate Rites', type: 'perk', description: 'Profane prayers can bolster allies or unsettle enemies.' },
    flavorIcon: '🕯️',
  },
  // Eldritch Horror
  {
    id: 'eh-veilseer',
    name: 'Veil Seer',
    description: 'You peek beyond the curtain of reality. What you find is never meant for mortal eyes.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Fractured Sight', type: 'perk', description: 'You can perceive entities hidden from normal vision.' },
    flavorIcon: '👁️',
  },
  {
    id: 'eh-deepwhisper',
    name: 'Deep Whisper',
    description: 'Something vast and cold chose you as its mouthpiece. You didn\'t agree, but refusal wasn\'t an option.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Borrowed Voice', type: 'perk', description: 'Compel truth from NPCs once per scene.' },
    flavorIcon: '🦑',
  },
  {
    id: 'eh-fleshscribe',
    name: 'Flesh Scribe',
    description: 'Reality is a text. You edit it with your body as the pen. Rewrites are permanent.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Living Glyph', type: 'perk', description: 'Inscribe temporary wards on skin — yours or another\'s.' },
    flavorIcon: '📜',
  },
];

// ─── Scars ────────────────────────────────────────────────────────────────────

export const SCARS: Scar[] = [
  // Dark Fantasy
  {
    id: 'df-scar-branded',
    name: 'The Brand of Shame',
    description: 'You were marked as a traitor. The symbol still burns on cold nights.',
    effect: 'Gain +1 tension whenever you enter a settlement.',
    theme: 'dark-fantasy',
    flavorIcon: '🔥',
  },
  {
    id: 'df-scar-eyeless',
    name: 'Eyeless Vigil',
    description: 'You traded one eye to a hagwitch for a secret. You\'ve forgotten what the secret was.',
    effect: 'Perception rolls are hindered but you sense invisible threats.',
    theme: 'dark-fantasy',
    flavorIcon: '🩸',
  },
  {
    id: 'df-scar-cursedblood',
    name: 'Cursed Bloodline',
    description: 'Your ancestors made a pact. Debt collects whether you signed or not.',
    effect: 'Once per session, a dark entity may call in a "favor."',
    theme: 'dark-fantasy',
    flavorIcon: '⛓️',
  },
  // Eldritch Horror
  {
    id: 'eh-scar-static',
    name: 'The Static',
    description: 'There\'s a frequency in your mind that never stops. It\'s not random. It\'s a message.',
    effect: '+2 tension at scene start; may receive cryptic clues.',
    theme: 'eldritch-horror',
    flavorIcon: '📻',
  },
  {
    id: 'eh-scar-mirror',
    name: 'Mirror Dread',
    description: 'Reflections show a version of you that moves half a second too late.',
    effect: 'Cannot use Steady actions in areas with mirrors or water.',
    theme: 'eldritch-horror',
    flavorIcon: '🪞',
  },
  {
    id: 'eh-scar-hungering',
    name: 'The Hungering Void',
    description: 'A hole opened in your chest the night of your Initiation. Figuratively. Mostly.',
    effect: 'Each scene you don\'t gain new knowledge costs 1 tension.',
    theme: 'eldritch-horror',
    flavorIcon: '🌌',
  },
];

// ─── Contracts ────────────────────────────────────────────────────────────────

export const CONTRACTS: Contract[] = [
  {
    tier: 'I',
    label: 'Whisper Contract',
    description: 'Low-stakes work. Scouting, errand-running, minor hauntings.',
    tensionMultiplier: 1,
    rewardBonus: 'None',
  },
  {
    tier: 'II',
    label: 'Crimson Contract',
    description: 'Serious risk. Dungeon raids, assassination, relic retrieval.',
    tensionMultiplier: 1.5,
    rewardBonus: '+1 Tag slot',
  },
  {
    tier: 'III',
    label: 'Void Contract',
    description: 'Near-suicidal. World-altering stakes. You may not return as yourself.',
    tensionMultiplier: 2,
    rewardBonus: '+2 Tag slots + Title Tag',
  },
];

// ─── Theme helpers ────────────────────────────────────────────────────────────

export function getArchetypesByTheme(theme: Theme): Archetype[] {
  return ARCHETYPES.filter((a) => a.theme === theme);
}

export function getScarsByTheme(theme: Theme): Scar[] {
  return SCARS.filter((s) => s.theme === theme);
}

// ─── Mock opening narrative ───────────────────────────────────────────────────

export const OPENING_NARRATIVES: Record<Theme, string> = {
  'dark-fantasy':
    'The guildmaster\'s seal is still wet when you break it. The contract describes a ruin three days east — a tower that locals call the Greyspire. Something stirs inside it. Something old. You check your blade, then the road, then the horizon where storm-clouds gather like a bad omen. You\'ve seen worse. Probably.',
  'eldritch-horror':
    'The envelope arrived addressed in your own handwriting, dated six weeks from now. Inside: a contract, a map, and the words *do not hesitate when you see the door.* You don\'t remember writing it. You take the job anyway. Some part of you already knows how this ends.',
};

export const MOCK_CHOICES: Record<Theme, string[]> = {
  'dark-fantasy': [
    'Head for the Greyspire immediately.',
    'Seek a local guide in the tavern.',
    'Study the ruins\' history at the abbey.',
  ],
  'eldritch-horror': [
    'Follow the map\'s marked route.',
    'Investigate who delivered the envelope.',
    'Wait and watch for patterns.',
  ],
};
