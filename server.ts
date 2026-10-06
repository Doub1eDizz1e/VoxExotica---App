import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize shared Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Available exotic voice archetypes
interface ExoticVoiceDef {
  id: string;
  name: string;
  category: 'demonic' | 'horror' | 'spectral' | 'scifi' | 'alien' | 'fantasy' | 'vintage';
  description: string;
  avatarIcon: string;
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr';
  personaStyle: string;
  dspDefaults: {
    pitchSemitones: number;
    speed: number;
    echoDelay: number;
    echoFeedback: number;
    reverbDecay: number;
    reverbWet: number;
    distortion: number;
    ringModFreq: number;
    ringModMix: number;
    bitcrush: number;
    filterType: 'none' | 'lowpass' | 'highpass' | 'bandpass';
    filterCutoff: number;
  };
}

const EXOTIC_VOICES: ExoticVoiceDef[] = [
  // 1. Demonic: Abyssal Demon
  {
    id: 'abyssal_demon',
    name: 'Abyssal Demon',
    category: 'demonic',
    description: 'Deep infernal entity with a guttural growl from the subterranean abyss.',
    avatarIcon: 'Flame',
    geminiVoice: 'Fenrir',
    personaStyle: 'Deep, guttural demonic entity growling with infernal subterranean gravel and menace',
    dspDefaults: {
      pitchSemitones: -7,
      speed: 0.9,
      echoDelay: 220,
      echoFeedback: 0.35,
      reverbDecay: 3.5,
      reverbWet: 0.45,
      distortion: 35,
      ringModFreq: 40,
      ringModMix: 0.15,
      bitcrush: 0,
      filterType: 'lowpass',
      filterCutoff: 3800,
    },
  },

  // 2. Demonic: Lord of the Underworld
  {
    id: 'infernal_archdemon',
    name: 'Lord of the Underworld',
    category: 'demonic',
    description: 'Ancient titan devil with rumbling sub-harmonics and vicious malice.',
    avatarIcon: 'Skull',
    geminiVoice: 'Charon',
    personaStyle: 'Commanding apocalyptic devil lord with menacing deep resonance and wrathful cadence',
    dspDefaults: {
      pitchSemitones: -9,
      speed: 0.85,
      echoDelay: 280,
      echoFeedback: 0.4,
      reverbDecay: 4.8,
      reverbWet: 0.55,
      distortion: 45,
      ringModFreq: 50,
      ringModMix: 0.2,
      bitcrush: 0,
      filterType: 'lowpass',
      filterCutoff: 3200,
    },
  },

  // 3. Demonic: Brimstone Hellhound Alpha
  {
    id: 'hellhound_alpha',
    name: 'Brimstone Hellhound',
    category: 'demonic',
    description: 'Feral infernal pack-leader snarling through hot embers and vicious predatory wrath.',
    avatarIcon: 'Flame',
    geminiVoice: 'Fenrir',
    personaStyle: 'Feral infernal predatory beast snarling between smoldering brimstone and guttural rage',
    dspDefaults: {
      pitchSemitones: -5,
      speed: 1.05,
      echoDelay: 140,
      echoFeedback: 0.28,
      reverbDecay: 2.2,
      reverbWet: 0.35,
      distortion: 48,
      ringModFreq: 120,
      ringModMix: 0.22,
      bitcrush: 1,
      filterType: 'lowpass',
      filterCutoff: 3400,
    },
  },

  // 4. Sci-Fi: Cyber Sentinel Mech
  {
    id: 'cyber_mech',
    name: 'Cyber Sentinel Mech',
    category: 'scifi',
    description: 'Futuristic combat droid with metallic vocoder modulation and cold calculations.',
    avatarIcon: 'Bot',
    geminiVoice: 'Puck',
    personaStyle: 'Robotic militarized cyborg with cold metallic monotone inflection and precise articulation',
    dspDefaults: {
      pitchSemitones: -3,
      speed: 1.05,
      echoDelay: 110,
      echoFeedback: 0.25,
      reverbDecay: 1.2,
      reverbWet: 0.25,
      distortion: 18,
      ringModFreq: 140,
      ringModMix: 0.45,
      bitcrush: 3,
      filterType: 'bandpass',
      filterCutoff: 2200,
    },
  },

  // 5. Sci-Fi: Glitch Corrupted AI
  {
    id: 'glitch_droid',
    name: 'Glitch Corrupted AI',
    category: 'scifi',
    description: 'Malfunctioning mainframe unit with 8-bit artifacts, stutter, and electrical arcs.',
    avatarIcon: 'Cpu',
    geminiVoice: 'Kore',
    personaStyle: 'Stuttering glitching android experiencing system buffer overflow and computational anomalies',
    dspDefaults: {
      pitchSemitones: 3,
      speed: 1.15,
      echoDelay: 75,
      echoFeedback: 0.5,
      reverbDecay: 0.8,
      reverbWet: 0.2,
      distortion: 28,
      ringModFreq: 320,
      ringModMix: 0.35,
      bitcrush: 7,
      filterType: 'highpass',
      filterCutoff: 650,
    },
  },

  // 6. Sci-Fi: Quantum Hyper-AI
  {
    id: 'quantum_oracle',
    name: 'Quantum Hyper-AI',
    category: 'scifi',
    description: 'Omniscient synthetic intelligence speaking in multidimensional parallel frequencies.',
    avatarIcon: 'Binary',
    geminiVoice: 'Kore',
    personaStyle: 'Ultra-advanced sentient supercomputer delivering predictive calculations with immaculate stillness',
    dspDefaults: {
      pitchSemitones: 0,
      speed: 1.02,
      echoDelay: 200,
      echoFeedback: 0.35,
      reverbDecay: 2.5,
      reverbWet: 0.35,
      distortion: 8,
      ringModFreq: 90,
      ringModMix: 0.25,
      bitcrush: 0,
      filterType: 'none',
      filterCutoff: 2000,
    },
  },

  // 7. Sci-Fi: Deep Space Nav-AI
  {
    id: 'void_navigator',
    name: 'Deep Space Nav-AI',
    category: 'scifi',
    description: 'Interstellar vessel navigation synthetic intercom transmitting through hull transducers.',
    avatarIcon: 'Compass',
    geminiVoice: 'Zephyr',
    personaStyle: 'Analytical interstellar ship computer transmitting through shipwide bulkhead comms with cold clarity',
    dspDefaults: {
      pitchSemitones: -1,
      speed: 0.98,
      echoDelay: 260,
      echoFeedback: 0.32,
      reverbDecay: 3.2,
      reverbWet: 0.4,
      distortion: 12,
      ringModFreq: 75,
      ringModMix: 0.28,
      bitcrush: 2,
      filterType: 'bandpass',
      filterCutoff: 2400,
    },
  },

  // 8. Sci-Fi: Planetary Siege Dreadnought
  {
    id: 'cyber_dreadnought',
    name: 'Siege Dreadnought',
    category: 'scifi',
    description: 'Automated planetary bombardment warship broadcasting demands via megawatt transmitters.',
    avatarIcon: 'ShieldAlert',
    geminiVoice: 'Fenrir',
    personaStyle: 'Thundering militarized war-machine sovereign barking apocalyptic ultimatums through heavy sub-frequencies',
    dspDefaults: {
      pitchSemitones: -8,
      speed: 0.88,
      echoDelay: 210,
      echoFeedback: 0.38,
      reverbDecay: 3.6,
      reverbWet: 0.45,
      distortion: 38,
      ringModFreq: 85,
      ringModMix: 0.35,
      bitcrush: 2,
      filterType: 'lowpass',
      filterCutoff: 2900,
    },
  },

  // 9. Sci-Fi: Neon Alley Cyborg Ronin
  {
    id: 'cyberpunk_street_ronin',
    name: 'Cyborg Street Ronin',
    category: 'scifi',
    description: 'Black-market chrome mercenary with an overclocked vocal synthesizer and gritty distortion.',
    avatarIcon: 'Terminal',
    geminiVoice: 'Puck',
    personaStyle: 'Edgy cyber-augmented street mercenary with gritty synthesizer distortion and rapid sardonic inflection',
    dspDefaults: {
      pitchSemitones: -2,
      speed: 1.1,
      echoDelay: 130,
      echoFeedback: 0.3,
      reverbDecay: 1.5,
      reverbWet: 0.28,
      distortion: 25,
      ringModFreq: 110,
      ringModMix: 0.3,
      bitcrush: 4,
      filterType: 'bandpass',
      filterCutoff: 2600,
    },
  },

  // 10. Horror: Eldritch Deep Sleeper
  {
    id: 'eldritch_cthulhu',
    name: 'Eldritch Deep Sleeper',
    category: 'horror',
    description: 'Unfathomable slumbering Leviathan speaking from the ocean trench with cyclopean madness.',
    avatarIcon: 'Eye',
    geminiVoice: 'Charon',
    personaStyle: 'Monolithic cosmic dread entity droning with mind-bending sub-bass and ancient submerged resonance',
    dspDefaults: {
      pitchSemitones: -10,
      speed: 0.75,
      echoDelay: 380,
      echoFeedback: 0.5,
      reverbDecay: 5.8,
      reverbWet: 0.62,
      distortion: 32,
      ringModFreq: 35,
      ringModMix: 0.22,
      bitcrush: 0,
      filterType: 'lowpass',
      filterCutoff: 2200,
    },
  },

  // 11. Horror: Gothic Crypt Vampire
  {
    id: 'nosferatu_vampire',
    name: 'Gothic Crypt Vampire',
    category: 'horror',
    description: 'Ancient aristocratic blood-drinker whispering with predatory elegance and freezing velvet chill.',
    avatarIcon: 'Moon',
    geminiVoice: 'Charon',
    personaStyle: 'Aristocratic ancient nocturnal predator speaking with hypnotic velvet chill and cruel elegance',
    dspDefaults: {
      pitchSemitones: -3,
      speed: 0.88,
      echoDelay: 220,
      echoFeedback: 0.35,
      reverbDecay: 4.2,
      reverbWet: 0.48,
      distortion: 6,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 0,
      filterType: 'lowpass',
      filterCutoff: 4200,
    },
  },

  // 12. Horror: Cursed Porcelain Doll
  {
    id: 'cursed_effigy',
    name: 'Cursed Porcelain Doll',
    category: 'horror',
    description: 'Haunted Victorian antique laughing through cracked enamel with sweet, hair-raising dread.',
    avatarIcon: 'Sparkles',
    geminiVoice: 'Kore',
    personaStyle: 'Eerie sweet child voice warped by a malevolent parasitic spirit with chilling micro-tonal shifts',
    dspDefaults: {
      pitchSemitones: 6,
      speed: 0.94,
      echoDelay: 170,
      echoFeedback: 0.42,
      reverbDecay: 3.2,
      reverbWet: 0.45,
      distortion: 12,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 4,
      filterType: 'highpass',
      filterCutoff: 650,
    },
  },

  // 13. Horror: Cavern Ghoul Shrieker
  {
    id: 'poltergeist_ghoul',
    name: 'Cavern Ghoul Shrieker',
    category: 'horror',
    description: 'Starved catacomb stalker shrieking and rasping in dark underground burial chambers.',
    avatarIcon: 'Ghost',
    geminiVoice: 'Puck',
    personaStyle: 'Frenzied tomb-stalking ghoul shrieking frantically with manic hunger and wet raspy breaths',
    dspDefaults: {
      pitchSemitones: 5,
      speed: 1.2,
      echoDelay: 140,
      echoFeedback: 0.45,
      reverbDecay: 2.8,
      reverbWet: 0.5,
      distortion: 25,
      ringModFreq: 180,
      ringModMix: 0.2,
      bitcrush: 2,
      filterType: 'highpass',
      filterCutoff: 700,
    },
  },

  // 14. Spectral: Spectral Wraith
  {
    id: 'wraith_phantom',
    name: 'Spectral Wraith',
    category: 'spectral',
    description: 'Hollow, icy whisper resonating from an incorporeal ghostly spirit.',
    avatarIcon: 'Ghost',
    geminiVoice: 'Zephyr',
    personaStyle: 'Eerie breathless phantom whispering from beyond the veil with chilling icy cadence',
    dspDefaults: {
      pitchSemitones: 3,
      speed: 0.9,
      echoDelay: 350,
      echoFeedback: 0.5,
      reverbDecay: 5.2,
      reverbWet: 0.65,
      distortion: 0,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 0,
      filterType: 'highpass',
      filterCutoff: 850,
    },
  },

  // 15. Spectral: Shadow Siren Whisperer
  {
    id: 'banshee_shadow',
    name: 'Shadow Siren Whisperer',
    category: 'spectral',
    description: 'Intimate, hypnotic whispers shrouded in dark mist and cavernous echoes.',
    avatarIcon: 'Wind',
    geminiVoice: 'Kore',
    personaStyle: 'Hypnotic dark enchantress whispering close to the ear with ethereal secrets',
    dspDefaults: {
      pitchSemitones: 1,
      speed: 0.88,
      echoDelay: 290,
      echoFeedback: 0.45,
      reverbDecay: 4.2,
      reverbWet: 0.5,
      distortion: 5,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 0,
      filterType: 'none',
      filterCutoff: 2000,
    },
  },

  // 16. Alien: Xenomorph Hive Overlord
  {
    id: 'xenomorph_hive',
    name: 'Xenomorph Hive Overlord',
    category: 'alien',
    description: 'Insectoid alien consciousness communicating through multi-tonal chitters.',
    avatarIcon: 'Radio',
    geminiVoice: 'Fenrir',
    personaStyle: 'Bizarre otherworldly extraterrestrial intelligence with clicking predatory resonance',
    dspDefaults: {
      pitchSemitones: -5,
      speed: 1.1,
      echoDelay: 160,
      echoFeedback: 0.45,
      reverbDecay: 2.8,
      reverbWet: 0.4,
      distortion: 25,
      ringModFreq: 210,
      ringModMix: 0.48,
      bitcrush: 2,
      filterType: 'bandpass',
      filterCutoff: 1800,
    },
  },

  // 17. Alien: Celestial Cosmic Entity
  {
    id: 'cosmic_ethereal',
    name: 'Celestial Cosmic Entity',
    category: 'alien',
    description: 'Vast astral being echoing across light years in crystalline harmony.',
    avatarIcon: 'Sparkles',
    geminiVoice: 'Zephyr',
    personaStyle: 'Serene majestic cosmic deity speaking across interstellar expanses with shimmering clarity',
    dspDefaults: {
      pitchSemitones: 2,
      speed: 0.92,
      echoDelay: 420,
      echoFeedback: 0.55,
      reverbDecay: 6.5,
      reverbWet: 0.7,
      distortion: 0,
      ringModFreq: 60,
      ringModMix: 0.1,
      bitcrush: 0,
      filterType: 'highpass',
      filterCutoff: 450,
    },
  },

  // 18. Fantasy: Stone Titan Golem
  {
    id: 'stone_titan',
    name: 'Stone Titan Golem',
    category: 'fantasy',
    description: 'Ancient monolithic giant forged from tectonic granite and mountain roots.',
    avatarIcon: 'Mountain',
    geminiVoice: 'Charon',
    personaStyle: 'Earth-shattering ancient stone colossus speaking in rumbling tectonic cadences',
    dspDefaults: {
      pitchSemitones: -11,
      speed: 0.78,
      echoDelay: 320,
      echoFeedback: 0.3,
      reverbDecay: 4.8,
      reverbWet: 0.5,
      distortion: 20,
      ringModFreq: 30,
      ringModMix: 0.15,
      bitcrush: 0,
      filterType: 'lowpass',
      filterCutoff: 2600,
    },
  },

  // 19. Fantasy: Goblincraft Imp
  {
    id: 'goblin_trickster',
    name: 'Goblincraft Imp',
    category: 'fantasy',
    description: 'Hyperactive, screechy mischievous cavern creature obsessed with shiny trinkets.',
    avatarIcon: 'Zap',
    geminiVoice: 'Puck',
    personaStyle: 'High-pitched cackling goblin trickster speaking rapidly with eccentric wicked glee',
    dspDefaults: {
      pitchSemitones: 7,
      speed: 1.25,
      echoDelay: 90,
      echoFeedback: 0.2,
      reverbDecay: 1.1,
      reverbWet: 0.25,
      distortion: 18,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 2,
      filterType: 'highpass',
      filterCutoff: 750,
    },
  },

  // 20. Fantasy: Elder Sylvan Treant
  {
    id: 'ancient_treant',
    name: 'Elder Sylvan Treant',
    category: 'fantasy',
    description: 'Primeval wooden colossus creaking with mossy bark, root systems, and wind in leaves.',
    avatarIcon: 'TreePine',
    geminiVoice: 'Charon',
    personaStyle: 'Millennia-old ancient forest guardian speaking through creaking oak boughs and deep earthy timber',
    dspDefaults: {
      pitchSemitones: -8,
      speed: 0.8,
      echoDelay: 260,
      echoFeedback: 0.35,
      reverbDecay: 4.5,
      reverbWet: 0.52,
      distortion: 16,
      ringModFreq: 40,
      ringModMix: 0.12,
      bitcrush: 0,
      filterType: 'lowpass',
      filterCutoff: 2800,
    },
  },

  // 21. Fantasy: High Elven Spellweaver
  {
    id: 'elven_archmage',
    name: 'High Elven Spellweaver',
    category: 'fantasy',
    description: 'Immortal celestial sorcerer intoning arcane incantations with crystalline harmonics.',
    avatarIcon: 'Wand2',
    geminiVoice: 'Zephyr',
    personaStyle: 'Noble immortal elven arcanist chanting with luminous regal poise and shimmering mystical resonance',
    dspDefaults: {
      pitchSemitones: 2,
      speed: 0.94,
      echoDelay: 310,
      echoFeedback: 0.42,
      reverbDecay: 5.5,
      reverbWet: 0.6,
      distortion: 0,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 0,
      filterType: 'none',
      filterCutoff: 3000,
    },
  },

  // 22. Fantasy: Crypt Necromancer Lich
  {
    id: 'shadow_necromancer',
    name: 'Crypt Lich Necromancer',
    category: 'fantasy',
    description: 'Skeletal death-mage speaking with withered lungs, bone dust, and necromantic incantations.',
    avatarIcon: 'Bone',
    geminiVoice: 'Fenrir',
    personaStyle: 'Undead sorcerer intoning forbidden soul-binding rites with dry rasping hiss and dark magical echo',
    dspDefaults: {
      pitchSemitones: -4,
      speed: 0.88,
      echoDelay: 270,
      echoFeedback: 0.44,
      reverbDecay: 4.4,
      reverbWet: 0.55,
      distortion: 22,
      ringModFreq: 45,
      ringModMix: 0.22,
      bitcrush: 1,
      filterType: 'highpass',
      filterCutoff: 400,
    },
  },

  // 23. Vintage: Wasteland Radio 1947
  {
    id: 'vintage_broadcaster',
    name: 'Wasteland Radio 1947',
    category: 'vintage',
    description: 'Post-apocalyptic vacuum tube radio transmission crackling through old speakers.',
    avatarIcon: 'Mic',
    geminiVoice: 'Charon',
    personaStyle: 'Vintage mid-century radio announcer speaking through dusty vacuum tube transmission',
    dspDefaults: {
      pitchSemitones: 0,
      speed: 1.0,
      echoDelay: 85,
      echoFeedback: 0.18,
      reverbDecay: 1.0,
      reverbWet: 0.2,
      distortion: 28,
      ringModFreq: 0,
      ringModMix: 0,
      bitcrush: 5,
      filterType: 'bandpass',
      filterCutoff: 1400,
    },
  },
];

// Tone modifiers mapped to speech direction
const TONES: Record<string, { label: string; promptGuide: string; emotionEmoji: string }> = {
  angry: {
    label: 'Angry & Snarling',
    promptGuide: 'Furious, intensely aggressive, snarling with venomous wrath and explosive emphasis',
    emotionEmoji: '🔥',
  },
  excited: {
    label: 'Excited & Manic',
    promptGuide: 'Hyper-excited, breathless, overflowing with manic adrenaline and high pitch surges',
    emotionEmoji: '⚡',
  },
  sinister: {
    label: 'Sinister & Plotting',
    promptGuide: 'Darkly amused, calculating, chillingly calm and quietly malicious',
    emotionEmoji: '😈',
  },
  whispery: {
    label: 'Hushed Whisper',
    promptGuide: 'Close-up conspiratorial whisper, intense breathy secrecy without vocal fold vibration',
    emotionEmoji: '🤫',
  },
  terrified: {
    label: 'Terrified & Panicked',
    promptGuide: 'Gasping, trembling with dread, hyperventilating in sheer panic',
    emotionEmoji: '😱',
  },
  commanding: {
    label: 'Commanding & Authoritative',
    promptGuide: 'Thunderous, unyielding authority, regal monarch issuing absolute decrees',
    emotionEmoji: '👑',
  },
  sorrowful: {
    label: 'Mournful & Tragic',
    promptGuide: 'Heavy despair, weeping melancholy, weeping pauses and slow heartbreak',
    emotionEmoji: '🌧️',
  },
  mocking: {
    label: 'Mocking & Sarcastic',
    promptGuide: 'Taunting sneer, eccentric ridicule, condescending giggles and sarcastic drawl',
    emotionEmoji: '🎭',
  },
  robotic_flat: {
    label: 'Cold Monotone',
    promptGuide: 'Flat unfeeling algorithmic delivery, devoid of human sentiment or pitch inflection',
    emotionEmoji: '🤖',
  },
};

// API route to get catalog of voices and tones
app.get('/api/tts/catalog', (req, res) => {
  res.json({
    voices: EXOTIC_VOICES,
    tones: TONES,
  });
});

// API route to generate TTS audio with Gemini
app.post('/api/tts/generate', async (req, res) => {
  try {
    const {
      text,
      voiceId = 'abyssal_demon',
      tone = 'sinister',
      customPromptModifier = '',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    if (text.length > 1500) {
      return res.status(400).json({ error: 'Text length cannot exceed 1500 characters.' });
    }

    const selectedVoice = EXOTIC_VOICES.find((v) => v.id === voiceId) || EXOTIC_VOICES[0];
    const selectedTone = TONES[tone] || TONES['sinister'];

    // Construct rich directing prompt for the TTS model
    const speechStyleDescription = [
      selectedVoice.personaStyle,
      `Tone of delivery: ${selectedTone.promptGuide}.`,
      customPromptModifier ? `Additional nuance: ${customPromptModifier}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const ai = getGeminiClient();

    // Call Gemini 3.8 Flash Lite TTS
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: speechStyleDescription,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice.geminiVoice,
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const inlineAudio = candidate?.content?.parts?.[0]?.inlineData;

    if (!inlineAudio || !inlineAudio.data) {
      return res.status(502).json({
        error: 'Failed to obtain synthesized audio stream from model.',
      });
    }

    // Unary output is standard WAV 24kHz mono 16-bit
    res.json({
      success: true,
      audioBase64: inlineAudio.data,
      mimeType: inlineAudio.mimeType || 'audio/wav',
      voiceId: selectedVoice.id,
      voiceName: selectedVoice.name,
      tone: tone,
      sampleRate: 24000,
    });
  } catch (err: any) {
    console.error('Error in /api/tts/generate:', err);
    const errorMessage = err?.message || 'Internal server error while generating voice.';
    const statusCode = err?.status || 500;
    res.status(statusCode).json({
      error: errorMessage,
      details: err?.toString(),
    });
  }
});

// Mount Vite or serve static
const startServer = async () => {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`VoxExotica Audio Server listening on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
