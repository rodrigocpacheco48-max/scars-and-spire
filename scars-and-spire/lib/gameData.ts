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
  {
    id: 'df-bloodsmith',
    name: 'Sanguine Forge',
    description: 'An outcast smith who tempers iron in living blood. Metal remembers the agony of its forging.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Blood-Tempered Edge', type: 'perk', description: 'Sacrifice vitality to grant weapons critical piercing armor.' },
    flavorIcon: '🩸',
  },
  {
    id: 'df-ashbound',
    name: 'Ashbound Pilgrim',
    description: 'Wanderer from a burnt domain, carrying embers of a holy fire that burns without fuel.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Cinder Sanctuary', type: 'perk', description: 'Can light fires in unnatural darkness to ward off beastly shadows.' },
    flavorIcon: '🪵',
  },
  {
    id: 'df-shadowstalker',
    name: 'Nightstalker',
    description: 'Trained in the shadowed crypts of forgotten assassins. You walk without casting a shadow.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Umbral Step', type: 'perk', description: 'Melt into deep darkness to bypass sentries or escape ambushes.' },
    flavorIcon: '🗡️',
  },
  {
    id: 'df-soulweaver',
    name: 'Soul Weaver',
    description: 'A necromantic artisan who knits broken spirits into armor and ephemeral wards.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Phantom Thread', type: 'perk', description: 'Bind a slain enemy’s echo to absorb one lethal blow.' },
    flavorIcon: '🧵',
  },
  {
    id: 'df-ironbulwark',
    name: 'Iron Bulwark',
    description: 'A mercenary knight clad in scarred plate. Your shield bears the crest of a fallen noble house.',
    theme: 'dark-fantasy',
    startingTag: { name: 'Unbreakable Resolve', type: 'perk', description: 'Negate tension spikes once per scene through sheer grit.' },
    flavorIcon: '🛡️',
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
  {
    id: 'eh-astralseeker',
    name: 'Void Astrologer',
    description: 'You chart stars that do not appear in any sky, reading horoscopes of cosmic doom.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Cosmic Alignment', type: 'perk', description: 'Predict hazards and spatial anomalies before they manifest.' },
    flavorIcon: '🌌',
  },
  {
    id: 'eh-hollowone',
    name: 'Hollow Vessel',
    description: 'Part of your soul was devoured by something elder. The cavernous void inside calls to dark energies.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Echoing Void', type: 'perk', description: 'Absorb incoming sanity attacks and convert them into void pulse.' },
    flavorIcon: '🕳️',
  },
  {
    id: 'eh-dreamweaver',
    name: 'Dream Weaver',
    description: 'You walk the sleeping realms, bringing horrors back into waking reality.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Lucid Mirage', type: 'perk', description: 'Manifest nightmares as physical obstructions or illusions.' },
    flavorIcon: '🌙',
  },
  {
    id: 'eh-distortionist',
    name: 'Warp Scholar',
    description: 'An academic who cracked the mathematics of non-Euclidean geometry and folded space.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Spatial Rift', type: 'perk', description: 'Briefly compress distances or breach locked portals.' },
    flavorIcon: '🌀',
  },
  {
    id: 'eh-chimekeeper',
    name: 'Bell Ringer',
    description: 'Keeper of bronze chimes pitched to frequencies that unravel human sanity.',
    theme: 'eldritch-horror',
    startingTag: { name: 'Sanity Toll', type: 'perk', description: 'Ring a chime that stuns aberrant creatures and destabilizes reality.' },
    flavorIcon: '🔔',
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
  {
    id: 'df-scar-phantomheart',
    name: 'Phantom Pulse',
    description: 'Your heart stopped beating years ago. Something else beats inside your chest now.',
    effect: 'Immune to poison and bleed, but healing effects are halved.',
    theme: 'dark-fantasy',
    flavorIcon: '🫀',
  },
  {
    id: 'df-scar-ashenthroat',
    name: 'Ashen Throat',
    description: 'You swallowed dragon ash during a siege. Your voice is a harsh rasp.',
    effect: 'Intimidation is enhanced, but subtle persuasion is impossible.',
    theme: 'dark-fantasy',
    flavorIcon: '🗣️',
  },
  {
    id: 'df-scar-ironveins',
    name: 'Iron Toxicity',
    description: 'Shrapnel from an ancient war machine rests near your spine, leeching cold iron into your blood.',
    effect: 'High armor resilience, but movement causes constant low tension decay.',
    theme: 'dark-fantasy',
    flavorIcon: '⚙️',
  },
  {
    id: 'df-scar-gravemarked',
    name: 'Grave Marker',
    description: 'The specters of those you failed follow your steps like silent shadows.',
    effect: 'Resting yields less tension relief when spirits are restless.',
    theme: 'dark-fantasy',
    flavorIcon: '🪦',
  },
  {
    id: 'df-scar-shadowtether',
    name: 'Shadow Tether',
    description: 'Your shadow doesn\'t always match your movements; sometimes it lunges ahead.',
    effect: '+1 stealth in darkness, but shadows draw wild beast aggression.',
    theme: 'dark-fantasy',
    flavorIcon: '👥',
  },
  {
    id: 'df-scar-rotblight',
    name: 'Rotting Touch',
    description: 'A necrotic affliction rots food, flowers, and fine textiles at your touch.',
    effect: 'Corrosive damage against plant/organic enemies, but ruins non-magical items.',
    theme: 'dark-fantasy',
    flavorIcon: '☣️',
  },
  {
    id: 'df-scar-shatteredoath',
    name: 'Broken Vow',
    description: 'You broke a sacred oath sworn before an ancient god. Remorse haunts your dreams.',
    effect: 'Divine relics react volatilely to your touch.',
    theme: 'dark-fantasy',
    flavorIcon: '💔',
  },
  {
    id: 'df-scar-serpentgaze',
    name: 'Viper\'s Stare',
    description: 'Slit pupils and yellow irises earned from drinking basilisk venom.',
    effect: 'NPCs distrust you on sight, but gaze paralyzes weak-willed foes.',
    theme: 'dark-fantasy',
    flavorIcon: '🐍',
  },
  {
    id: 'df-scar-frostbound',
    name: 'Frostbitten Soul',
    description: 'Surviving a winter in the Black Peak left frost lingering under your fingernails.',
    effect: 'Resist ice damage, but cold environments cause tension spikes.',
    theme: 'dark-fantasy',
    flavorIcon: '❄️',
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
  {
    id: 'eh-scar-murmurs',
    name: 'Murmuring Veins',
    description: 'Your blood blackens under skin, whispering eldritch names whenever your pulse spikes.',
    effect: 'Eldritch spells cost less focus, but stress increases exponentially.',
    theme: 'eldritch-horror',
    flavorIcon: '🩸',
  },
  {
    id: 'eh-scar-thirdeye',
    name: 'Blind Third Eye',
    description: 'A slit in your forehead leaks black fluid whenever a cosmic presence approaches.',
    effect: 'Warns of unseen horrors, but drains mental stability.',
    theme: 'eldritch-horror',
    flavorIcon: '👁️‍🗨️',
  },
  {
    id: 'eh-scar-temporal',
    name: 'Desynchronized Time',
    description: 'You experience moments out of order. Memories bleed into future events.',
    effect: 'Can forewarn of traps, but causes temporal confusion in combat.',
    theme: 'eldritch-horror',
    flavorIcon: '⏳',
  },
  {
    id: 'eh-scar-parasite',
    name: 'Symbiont Spore',
    description: 'Fungal growths pulse beneath your ribs, feeding on your adrenaline.',
    effect: 'Rapid natural healing in moist dark, but spores provoke horror from onlookers.',
    theme: 'eldritch-horror',
    flavorIcon: '🍄',
  },
  {
    id: 'eh-scar-geometry',
    name: 'Impossible Angles',
    description: 'Your shadow bends at right angles regardless of light sources.',
    effect: 'Dodge attacks via spatial twisting, but causes spatial disorientation.',
    theme: 'eldritch-horror',
    flavorIcon: '📐',
  },
  {
    id: 'eh-scar-spiral',
    name: 'Spiral Madness',
    description: 'You see concentric spirals in clouds, smoke, and skin textures.',
    effect: 'Decipher alien runes quickly, but intense concentration risks panic.',
    theme: 'eldritch-horror',
    flavorIcon: '🌀',
  },
  {
    id: 'eh-scar-echoingmind',
    name: 'Thoughts Audible',
    description: 'Your inner monologue vibrates softly in nearby ears like a radio whisper.',
    effect: 'Secrecy is nearly impossible, but mind-readers are deafened.',
    theme: 'eldritch-horror',
    flavorIcon: '🧠',
  },
  {
    id: 'eh-scar-glassbones',
    name: 'Glass Bones',
    description: 'Your skeletal structure has mineralized into fragile obsidian-like crystal.',
    effect: 'Resist psychic crush, but blunt trauma deals severe damage.',
    theme: 'eldritch-horror',
    flavorIcon: '💎',
  },
  {
    id: 'eh-scar-deeplungs',
    name: 'Drowned Whispers',
    description: 'You breathe seawater brine when agitated; cold salt drips from your nostrils.',
    effect: 'Breathe underwater, but dry desert heat causes suffocation panic.',
    theme: 'eldritch-horror',
    flavorIcon: '🌊',
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
