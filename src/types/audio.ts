export type VoiceCategory =
  | 'demonic'
  | 'horror'
  | 'spectral'
  | 'scifi'
  | 'alien'
  | 'fantasy'
  | 'vintage';

export interface ExoticVoice {
  id: string;
  name: string;
  category: VoiceCategory;
  description: string;
  avatarIcon: string;
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr';
  personaStyle: string;
  dspDefaults: AudioEffectSettings;
}

export type ToneId =
  | 'angry'
  | 'excited'
  | 'sinister'
  | 'whispery'
  | 'terrified'
  | 'commanding'
  | 'sorrowful'
  | 'mocking'
  | 'robotic_flat';

export interface ToneOption {
  id: ToneId;
  label: string;
  promptGuide: string;
  emotionEmoji: string;
}

export interface AudioEffectSettings {
  pitchSemitones: number; // -12 to +12
  speed: number; // 0.5 to 2.5
  echoDelay: number; // ms: 20 to 1000
  echoFeedback: number; // 0 to 0.85
  reverbDecay: number; // seconds: 0.2 to 8.0
  reverbWet: number; // 0 to 1.0
  reverbRoomType?: 'crypt' | 'cathedral' | 'tank' | 'space' | 'chamber';
  distortion: number; // 0 to 100 (overdrive/sub-saturation)
  ringModFreq: number; // 0 to 600 Hz (robot metallic modulator)
  ringModMix: number; // 0 to 1.0
  bitcrush: number; // 0 (off) to 12 (crushed lo-fi)
  filterType: 'none' | 'lowpass' | 'highpass' | 'bandpass';
  filterCutoff: number; // 100 to 10000 Hz
  volume?: number; // 0 to 1.5

  // Expanded post effects
  vocoderEnabled?: boolean;
  vocoderCarrierFreq?: number; // 60 to 400 Hz (robot pitch)
  vocoderMix?: number; // 0 to 1.0
  stutterEnabled?: boolean;
  stutterRate?: number; // 1 to 20 Hz
  stutterDepth?: number; // 0 to 1.0
  telephoneEnabled?: boolean;
  chorusEnabled?: boolean;
  chorusRate?: number; // 0.2 to 4.0 Hz
  chorusDepth?: number; // 0 to 1.0
}

export interface PostEffectPreset {
  id: string;
  name: string;
  category: 'Sci-Fi & Robot' | 'Vintage & Lo-Fi' | 'Dark & Nether' | 'Atmospheric & Space';
  icon: string;
  description: string;
  tag: string;
  settings: Partial<AudioEffectSettings>;
}


export interface GenerationMetadata {
  id: string;
  title: string;
  text: string;
  voiceId: string;
  voiceName: string;
  tone: ToneId;
  createdAt: number;
  duration: number;
  rawAudioBase64: string;
  sampleRate: number;
  effects: AudioEffectSettings;
  mp3Blob?: Blob;
  wavBlob?: Blob;
}
