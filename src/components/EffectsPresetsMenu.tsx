import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Phone,
  Megaphone,
  Waves,
  Radio,
  Flame,
  Disc,
  Cpu,
  Mountain,
  ChevronDown,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { PostEffectPreset, AudioEffectSettings } from '../types/audio';
import { POST_EFFECT_PRESETS } from '../data/effectPresets';
import { useTheme } from '../context/ThemeContext';

interface EffectsPresetsMenuProps {
  currentEffects: AudioEffectSettings;
  onApplyPreset: (preset: PostEffectPreset) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Bot: <Bot className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
  Waves: <Waves className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Disc: <Disc className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Mountain: <Mountain className="w-4 h-4" />,
};

export const EffectsPresetsMenu: React.FC<EffectsPresetsMenuProps> = ({
  currentEffects,
  onApplyPreset,
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const categories = ['All', 'Sci-Fi & Robot', 'Vintage & Lo-Fi', 'Dark & Nether', 'Atmospheric & Space'];

  const filteredPresets = POST_EFFECT_PRESETS.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleSelect = (preset: PostEffectPreset) => {
    setActivePresetId(preset.id);
    onApplyPreset(preset);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
          isOpen
            ? 'bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-500/30'
            : isDark
            ? 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border-slate-700/80 hover:border-cyan-500/50'
            : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-300'
        }`}
        title="Open post effects presets menu"
      >
        <Sparkles className="w-3.5 h-3.5 fill-current" />
        <span>Post-FX Menu</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isOpen
              ? 'bg-slate-950 text-cyan-300'
              : isDark
              ? 'bg-slate-900 text-cyan-400'
              : 'bg-cyan-200 text-cyan-900'
          }`}
        >
          {POST_EFFECT_PRESETS.length} FX
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Scrolling Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 sm:left-auto sm:right-0 mt-2 w-[340px] sm:w-[420px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-slate-100'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Post-Effects Presets Library
                </h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select vocoder, stutter, telephone & specialty FX
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Filter Chips */}
          <div
            className={`px-3 py-2 border-b flex gap-1.5 overflow-x-auto scrollbar-none text-[11px] ${
              isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-100/50'
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrolling Presets List */}
          <div className="max-h-[320px] overflow-y-auto p-2 space-y-1.5 divide-y divide-transparent">
            {filteredPresets.map((preset) => {
              const isSelected = activePresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? isDark
                        ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
                        : 'bg-cyan-50 border-cyan-400 ring-1 ring-cyan-400/50'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800/70 hover:bg-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : isDark
                          ? 'bg-slate-800 text-cyan-400 group-hover:bg-slate-700'
                          : 'bg-slate-200 text-cyan-800 group-hover:bg-cyan-100'
                      }`}
                    >
                      {ICON_MAP[preset.icon] || <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold truncate">
                          {preset.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {preset.tag}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] leading-snug line-clamp-2 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(preset);
                    }}
                    className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : isDark
                        ? 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300'
                        : 'bg-slate-200 hover:bg-cyan-500 hover:text-slate-950 text-slate-700'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div
            className={`px-3 py-2 border-t text-[10px] flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <span>Click any preset to apply to the DSP rack</span>
            <span className="font-mono">Real-Time DSP</span>
          </div>
        </div>
      )}
    </div>
  );
};
