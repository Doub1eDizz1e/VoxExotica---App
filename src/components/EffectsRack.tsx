import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Waves,
  Zap,
  Radio,
  Flame,
  Volume2,
  Bot,
  Phone,
  Play,
  Square,
  Activity,
  Layers,
} from 'lucide-react';
import { AudioEffectSettings, PostEffectPreset } from '../types/audio';
import { useTheme } from '../context/ThemeContext';
import { EffectsPresetsMenu } from './EffectsPresetsMenu';

interface EffectsRackProps {
  effects: AudioEffectSettings;
  onChangeEffects: (newEffects: AudioEffectSettings) => void;
  onResetToDefaults: () => void;
  onTogglePreview: () => void;
  isPreviewing: boolean;
  hasAudio: boolean;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({
  effects,
  onChangeEffects,
  onResetToDefaults,
  onTogglePreview,
  isPreviewing,
  hasAudio,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'pitch_speed' | 'space' | 'vocoder_stutter' | 'vintage_mod'>('pitch_speed');

  const update = (partial: Partial<AudioEffectSettings>) => {
    onChangeEffects({
      ...effects,
      ...partial,
    });
  };

  const handleApplyPreset = (preset: PostEffectPreset) => {
    onChangeEffects({
      ...effects,
      ...preset.settings,
    });
  };

  const subCardBg = isDark
    ? 'bg-slate-950/40 border-slate-800/70'
    : 'bg-slate-50 border-slate-200 shadow-sm';
  const badgeBg = isDark
    ? 'bg-slate-900 border-slate-800 text-cyan-400'
    : 'bg-white border-slate-300 text-cyan-700';
  const textMain = isDark ? 'text-slate-200' : 'text-slate-800';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 shadow-xl transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header with Title, FX Presets Menu & Preview Button */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${
              isDark
                ? 'bg-cyan-950/50 border-cyan-800/40 text-cyan-400'
                : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3
              className={`text-sm font-semibold flex items-center gap-2 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Post-Creation DSP Effects Rack
              <span
                className={`text-[10px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'text-cyan-400 bg-cyan-950/60 border-cyan-900/40'
                    : 'text-cyan-800 bg-cyan-100 border-cyan-300'
                }`}
              >
                Real-Time Web Audio
              </span>
            </h3>
            <p className={`text-[11px] ${textSub}`}>
              Customize vocoder, stutter chopper, telephone, pitch, echo & reverb
            </p>
          </div>
        </div>

        {/* Action Controls: Preset Menu, Preview Button, Reset Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Post-Effects Presets Scrolling Menu Button */}
          <EffectsPresetsMenu
            currentEffects={effects}
            onApplyPreset={handleApplyPreset}
          />

          {/* Preview Processing Button */}
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
              isPreviewing
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 ring-2 ring-amber-500/40 animate-pulse'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 hover:border-amber-400'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Preview the active effects processing on the current sound file"
          >
            {isPreviewing ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Preview FX</span>
              </>
            )}
            {isPreviewing && (
              <Activity className="w-3 h-3 text-slate-950 animate-bounce" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetToDefaults}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
            title="Reset effects to voice defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* DSP Sub-Navigation Tabs */}
      <div
        className={`flex gap-1.5 p-1 rounded-xl border text-xs font-medium overflow-x-auto scrollbar-none ${
          isDark
            ? 'bg-slate-950/60 border-slate-800/60'
            : 'bg-slate-100 border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveTab('pitch_speed')}
          className={`flex-1 min-w-[100px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'pitch_speed'
              ? isDark
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'bg-white text-cyan-700 shadow-sm border border-slate-300 font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>Pitch & Speed</span>
        </button>

        <button
          onClick={() => setActiveTab('space')}
          className={`flex-1 min-w-[100px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'space'
              ? isDark
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'bg-white text-cyan-700 shadow-sm border border-slate-300 font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Echo & Reverb</span>
        </button>

        <button
          onClick={() => setActiveTab('vocoder_stutter')}
          className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'vocoder_stutter'
              ? isDark
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'bg-white text-cyan-700 shadow-sm border border-slate-300 font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Vocoder & Stutter</span>
          {(effects.vocoderEnabled || effects.stutterEnabled) && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('vintage_mod')}
          className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'vintage_mod'
              ? isDark
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'bg-white text-cyan-700 shadow-sm border border-slate-300 font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Telephone & Mod</span>
          {(effects.telephoneEnabled || effects.chorusEnabled) && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Tab 1: Pitch & Speed */}
      {activeTab === 'pitch_speed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Pitch Slider */}
          <div className={`${subCardBg} p-3.5 rounded-xl border space-y-2.5`}>
            <div className="flex items-center justify-between text-xs">
              <label className={`font-semibold ${textMain} flex items-center gap-1.5`}>
                <span>Pitch Transpose</span>
                <span className={`text-[10px] ${textSub} font-normal`}>(-12 to +12 semitones)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-semibold px-2 py-0.5 rounded border ${badgeBg}`}>
                  {effects.pitchSemitones > 0 ? `+${effects.pitchSemitones}` : effects.pitchSemitones} st
                </span>
                <button
                  onClick={() => update({ pitchSemitones: 0 })}
                  className={`text-[10px] ${textSub} hover:underline cursor-pointer`}
                >
                  Reset
                </button>
              </div>
            </div>

            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={effects.pitchSemitones}
              onChange={(e) => update({ pitchSemitones: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span className="text-red-500 dark:text-red-400">-12 (Demonic Beast)</span>
              <span className={textSub}>0 (Natural)</span>
              <span className="text-emerald-500 dark:text-emerald-400">+12 (High Imp)</span>
            </div>
          </div>

          {/* Speed Slider */}
          <div className={`${subCardBg} p-3.5 rounded-xl border space-y-2.5`}>
            <div className="flex items-center justify-between text-xs">
              <label className={`font-semibold ${textMain} flex items-center gap-1.5`}>
                <span>Speech Speed</span>
                <span className={`text-[10px] ${textSub} font-normal`}>(0.5x to 2.0x)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-semibold px-2 py-0.5 rounded border ${badgeBg}`}>
                  {effects.speed.toFixed(2)}x
                </span>
                <button
                  onClick={() => update({ speed: 1.0 })}
                  className={`text-[10px] ${textSub} hover:underline cursor-pointer`}
                >
                  Reset
                </button>
              </div>
            </div>

            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={effects.speed}
              onChange={(e) => update({ speed: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />

            <div className={`flex justify-between text-[10px] font-mono ${textSub}`}>
              <span>0.5x (Slow Dread)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Rapid Frenzy)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Echo & Reverb */}
      {activeTab === 'space' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Echo / Delay Unit */}
          <div className={`${subCardBg} p-3.5 rounded-xl border space-y-3`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1.5`}>
                <Radio className="w-3.5 h-3.5 text-cyan-500" />
                <span>Echo / Delay Unit</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 text-xs">
                {effects.echoDelay} ms ({Math.round(effects.echoFeedback * 100)}% fb)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Delay Time</span>
                <span className="font-mono">{effects.echoDelay} ms</span>
              </div>
              <input
                type="range"
                min={0}
                max={800}
                step={10}
                value={effects.echoDelay}
                onChange={(e) => update({ echoDelay: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Feedback (Repeats)</span>
                <span className="font-mono">{Math.round(effects.echoFeedback * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={effects.echoFeedback}
                onChange={(e) => update({ echoFeedback: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Reverb Space Unit */}
          <div className={`${subCardBg} p-3.5 rounded-xl border space-y-3`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1.5`}>
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Acoustic Reverb Chamber</span>
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400 text-xs">
                {Math.round(effects.reverbWet * 100)}% Wet
              </span>
            </div>

            {/* Room type selection */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              {(['crypt', 'cathedral', 'tank', 'space', 'chamber'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => update({ reverbRoomType: r })}
                  className={`py-1 px-1.5 rounded border capitalize truncate transition-colors cursor-pointer ${
                    effects.reverbRoomType === r
                      ? isDark
                        ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 font-semibold'
                        : 'bg-purple-100 border-purple-400 text-purple-900 font-semibold'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Decay Length</span>
                <span className="font-mono">{effects.reverbDecay.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={7.0}
                step={0.2}
                value={effects.reverbDecay}
                onChange={(e) => update({ reverbDecay: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Wet / Dry Blend</span>
                <span className="font-mono">{Math.round(effects.reverbWet * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={effects.reverbWet}
                onChange={(e) => update({ reverbWet: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Vocoder & Stutter Chopper */}
      {activeTab === 'vocoder_stutter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Vocoder 3000 Module */}
          <div className={`${subCardBg} p-3.5 rounded-xl border space-y-3`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1.5`}>
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Cyber Vocoder Synthesizer</span>
              </span>

              <button
                onClick={() => update({ vocoderEnabled: !effects.vocoderEnabled })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effects.vocoderEnabled
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {effects.vocoderEnabled ? 'VOCODER ON' : 'BYPASS'}
              </button>
            </div>

            <p className={`text-[11px] ${textSub}`}>
              Modulates input voice with a synthetic sawtooth carrier wave for authentic robotic timbre.
            </p>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Carrier Synth Pitch</span>
                <span className="font-mono">{effects.vocoderCarrierFreq || 120} Hz</span>
              </div>
              <input
                type="range"
                min={60}
                max={300}
                step={5}
                disabled={!effects.vocoderEnabled}
                value={effects.vocoderCarrierFreq || 120}
                onChange={(e) => update({ vocoderCarrierFreq: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 cursor-pointer disabled:opacity-40"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>60Hz (Deep Droid)</span>
                <span>120Hz (Classic)</span>
                <span>300Hz (Alien Cylon)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Vocoder Blend Mix</span>
                <span className="font-mono">{Math.round((effects.vocoderMix || 0.65) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                disabled={!effects.vocoderEnabled}
                value={effects.vocoderMix !== undefined ? effects.vocoderMix : 0.65}
                onChange={(e) => update({ vocoderMix: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* Stutter Chopper Module */}
          <div className={`${subCardBg} p-3.5 rounded-xl border space-y-3`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1.5`}>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Rhythmic Stutter Chopper</span>
              </span>

              <button
                onClick={() => update({ stutterEnabled: !effects.stutterEnabled })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  effects.stutterEnabled
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {effects.stutterEnabled ? 'STUTTER ON' : 'BYPASS'}
              </button>
            </div>

            <p className={`text-[11px] ${textSub}`}>
              Applies a high-speed square-wave tremolo gate that rapidly stutters vocal delivery.
            </p>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Stutter Chopping Speed</span>
                <span className="font-mono">{(effects.stutterRate || 8.0).toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                disabled={!effects.stutterEnabled}
                value={effects.stutterRate || 8.0}
                onChange={(e) => update({ stutterRate: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>2Hz (Slow Chop)</span>
                <span>8Hz (Rhythmic Gate)</span>
                <span>20Hz (Machine Buzz)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className={`flex justify-between text-[11px] ${textSub}`}>
                <span>Chopping Depth</span>
                <span className="font-mono">{Math.round((effects.stutterDepth || 0.85) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.05}
                disabled={!effects.stutterEnabled}
                value={effects.stutterDepth !== undefined ? effects.stutterDepth : 0.85}
                onChange={(e) => update({ stutterDepth: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Vintage Telephone & Modulations */}
      {activeTab === 'vintage_mod' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* 1920s Old Telephone Module */}
          <div className={`${subCardBg} p-3 rounded-xl border space-y-2`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1`}>
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>1920s Telephone</span>
              </span>

              <button
                onClick={() => update({ telephoneEnabled: !effects.telephoneEnabled })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  effects.telephoneEnabled
                    ? 'bg-amber-500 text-slate-950'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {effects.telephoneEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <p className={`text-[10px] ${textSub}`}>
              Cuts lows & highs (450Hz-3.2kHz) with carbon mic saturation.
            </p>

            <div className="pt-2 border-t border-slate-800/40 space-y-1">
              <div className={`flex justify-between text-[10px] ${textSub}`}>
                <span>Overdrive / Saturation</span>
                <span className="font-mono">{effects.distortion}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={2}
                value={effects.distortion}
                onChange={(e) => update({ distortion: parseInt(e.target.value, 10) })}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Space Chorus / Alien Flanger Module */}
          <div className={`${subCardBg} p-3 rounded-xl border space-y-2`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1`}>
                <Waves className="w-3.5 h-3.5 text-emerald-500" />
                <span>Chorus & Flanger</span>
              </span>

              <button
                onClick={() => update({ chorusEnabled: !effects.chorusEnabled })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  effects.chorusEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {effects.chorusEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="space-y-1">
              <div className={`flex justify-between text-[10px] ${textSub}`}>
                <span>LFO Sweep Speed</span>
                <span className="font-mono">{(effects.chorusRate || 1.2).toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={4.0}
                step={0.1}
                disabled={!effects.chorusEnabled}
                value={effects.chorusRate || 1.2}
                onChange={(e) => update({ chorusRate: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer disabled:opacity-40"
              />
            </div>

            <div className="space-y-1">
              <div className={`flex justify-between text-[10px] ${textSub}`}>
                <span>Modulation Depth</span>
                <span className="font-mono">{Math.round((effects.chorusDepth || 0.55) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                disabled={!effects.chorusEnabled}
                value={effects.chorusDepth !== undefined ? effects.chorusDepth : 0.55}
                onChange={(e) => update({ chorusDepth: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* 8-Bit Bitcrush & EQ Cutoff */}
          <div className={`${subCardBg} p-3 rounded-xl border space-y-2`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${textMain} flex items-center gap-1`}>
                <Radio className="w-3.5 h-3.5 text-cyan-500" />
                <span>EQ Filter & Bitcrush</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 text-[10px] uppercase">
                {effects.filterType}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px]">
              {(['none', 'lowpass', 'highpass', 'bandpass'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => update({ filterType: mode })}
                  className={`py-0.5 rounded border capitalize truncate transition-colors cursor-pointer ${
                    effects.filterType === mode
                      ? isDark
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 font-semibold'
                        : 'bg-cyan-100 border-cyan-400 text-cyan-900 font-semibold'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className={`flex justify-between text-[10px] ${textSub}`}>
                <span>8-Bit Lo-Fi Crush</span>
                <span className="font-mono">{effects.bitcrush > 0 ? `${effects.bitcrush}x` : 'Off'}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={effects.bitcrush}
                onChange={(e) => update({ bitcrush: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
