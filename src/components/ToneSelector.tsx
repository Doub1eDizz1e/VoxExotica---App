import React from 'react';
import { ToneId, ToneOption } from '../types/audio';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ToneSelectorProps {
  tones: ToneOption[];
  selectedTone: ToneId;
  onSelectTone: (tone: ToneId) => void;
  customModifier: string;
  onChangeCustomModifier: (value: string) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  tones,
  selectedTone,
  onSelectTone,
  customModifier,
  onChangeCustomModifier,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          <span>Vocal Tone & Emotion</span>
        </label>
        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Modulates delivery intent & prosody
        </span>
      </div>

      {/* Tone selection buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {tones.map((t) => {
          const isSelected = t.id === selectedTone;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTone(t.id)}
              className={`px-3 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? isDark
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white shadow-sm ring-1 ring-cyan-500/40'
                    : 'bg-cyan-50/90 border-cyan-500 text-cyan-950 shadow-sm ring-1 ring-cyan-500/50'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{t.emotionEmoji}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#22d3ee]" />
                )}
              </div>
              <div>
                <div
                  className={`text-xs font-medium truncate ${
                    isSelected
                      ? isDark
                        ? 'text-white'
                        : 'text-cyan-950 font-semibold'
                      : isDark
                      ? 'text-slate-200'
                      : 'text-slate-800'
                  }`}
                >
                  {t.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom vocal modifier input */}
      <div className="pt-1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customModifier}
              onChange={(e) => onChangeCustomModifier(e.target.value)}
              placeholder="Custom nuance (e.g., breathless wheeze, echoing laughs, venomous hiss)..."
              className={`w-full border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900/70 border-slate-800 focus:border-cyan-500/60 text-slate-200 placeholder-slate-400'
                  : 'bg-slate-50 border-slate-300 focus:border-cyan-500 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          {customModifier && (
            <button
              onClick={() => onChangeCustomModifier('')}
              className={`text-xs px-2 py-1 cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
