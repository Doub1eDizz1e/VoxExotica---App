import React, { useState } from 'react';
import {
  Flame,
  Skull,
  Bot,
  Cpu,
  Ghost,
  Wind,
  Radio,
  Sparkles,
  Mountain,
  Zap,
  Mic,
  Binary,
  Volume2,
  Eye,
  Moon,
  Compass,
  ShieldAlert,
  Terminal,
  TreePine,
  Wand2,
  Bone,
} from 'lucide-react';
import { ExoticVoice, VoiceCategory } from '../types/audio';
import { useTheme } from '../context/ThemeContext';

interface VoiceSelectorProps {
  voices: ExoticVoice[];
  selectedVoiceId: string;
  onSelectVoice: (voice: ExoticVoice) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-5 h-5" />,
  Skull: <Skull className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Ghost: <Ghost className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Radio: <Radio className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Mountain: <Mountain className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Mic: <Mic className="w-5 h-5" />,
  Binary: <Binary className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Moon: <Moon className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />,
  TreePine: <TreePine className="w-5 h-5" />,
  Wand2: <Wand2 className="w-5 h-5" />,
  Bone: <Bone className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<VoiceCategory, { border: string; glow: string; text: string; bg: string }> = {
  demonic: {
    border: 'border-red-500/50 hover:border-red-500',
    glow: 'shadow-red-950/50',
    text: 'text-red-400',
    bg: 'bg-red-950/20',
  },
  scifi: {
    border: 'border-cyan-500/50 hover:border-cyan-500',
    glow: 'shadow-cyan-950/50',
    text: 'text-cyan-400',
    bg: 'bg-cyan-950/20',
  },
  horror: {
    border: 'border-rose-500/50 hover:border-rose-500',
    glow: 'shadow-rose-950/50',
    text: 'text-rose-400',
    bg: 'bg-rose-950/20',
  },
  fantasy: {
    border: 'border-amber-500/50 hover:border-amber-500',
    glow: 'shadow-amber-950/50',
    text: 'text-amber-400',
    bg: 'bg-amber-950/20',
  },
  spectral: {
    border: 'border-purple-500/50 hover:border-purple-500',
    glow: 'shadow-purple-950/50',
    text: 'text-purple-400',
    bg: 'bg-purple-950/20',
  },
  alien: {
    border: 'border-emerald-500/50 hover:border-emerald-500',
    glow: 'shadow-emerald-950/50',
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
  },
  vintage: {
    border: 'border-orange-500/50 hover:border-orange-500',
    glow: 'shadow-orange-950/50',
    text: 'text-orange-400',
    bg: 'bg-orange-950/20',
  },
};

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
}) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: `All Archetypes (${voices.length})` },
    { id: 'scifi', label: `Sci-Fi (${voices.filter((v) => v.category === 'scifi').length})` },
    { id: 'fantasy', label: `Fantasy (${voices.filter((v) => v.category === 'fantasy').length})` },
    { id: 'horror', label: `Horror (${voices.filter((v) => v.category === 'horror').length})` },
    { id: 'demonic', label: `Demonic (${voices.filter((v) => v.category === 'demonic').length})` },
    { id: 'spectral', label: `Spectral (${voices.filter((v) => v.category === 'spectral').length})` },
    { id: 'alien', label: `Alien (${voices.filter((v) => v.category === 'alien').length})` },
    { id: 'vintage', label: `Vintage (${voices.filter((v) => v.category === 'vintage').length})` },
  ];

  const filteredVoices = voices.filter(
    (v) => activeCategory === 'all' || v.category === activeCategory
  );

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeCategory === cat.id
                ? isDark
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'bg-slate-200 text-slate-900 shadow-sm border border-slate-300'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredVoices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          const styling = CATEGORY_COLORS[voice.category];

          return (
            <button
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`group relative text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? isDark
                    ? `bg-slate-900/90 ${styling.border} ring-2 ring-cyan-500/30 shadow-lg ${styling.glow}`
                    : `bg-white ${styling.border} ring-2 ring-cyan-500/40 shadow-md`
                  : isDark
                  ? 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? `${styling.bg} ${styling.text} border border-current/20`
                        : isDark
                        ? 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                        : 'bg-slate-200/80 text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {ICON_MAP[voice.avatarIcon] || <Volume2 className="w-5 h-5" />}
                  </div>

                  <span
                    className={`text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full ${styling.bg} ${styling.text}`}
                  >
                    {voice.category}
                  </span>
                </div>

                <h4
                  className={`font-semibold text-sm mb-1 transition-colors ${
                    isDark
                      ? 'text-slate-100 group-hover:text-white'
                      : 'text-slate-900 group-hover:text-black'
                  }`}
                >
                  {voice.name}
                </h4>

                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {voice.description}
                </p>
              </div>

              {/* Pitch & Reverb tag */}
              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                  isDark
                    ? 'border-slate-800/60 text-slate-400'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span>Pitch:</span>
                  <span
                    className={`font-mono font-medium ${
                      voice.dspDefaults.pitchSemitones < 0
                        ? 'text-red-500 dark:text-red-400'
                        : voice.dspDefaults.pitchSemitones > 0
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : isDark
                        ? 'text-slate-300'
                        : 'text-slate-700'
                    }`}
                  >
                    {voice.dspDefaults.pitchSemitones > 0 ? '+' : ''}
                    {voice.dspDefaults.pitchSemitones} st
                  </span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    isDark
                      ? 'text-slate-400 bg-slate-800/60'
                      : 'text-slate-600 bg-slate-200/60'
                  }`}
                >
                  {voice.dspDefaults.reverbWet > 0.4 ? 'Cavernous' : 'Tight DSP'}
                </span>
              </div>

              {/* Selected corner pip */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
