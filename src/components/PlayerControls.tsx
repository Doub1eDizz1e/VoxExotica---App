import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Repeat,
  Radio,
  FileAudio,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';
import { Visualizer } from './Visualizer';
import { useTheme } from '../context/ThemeContext';

interface PlayerControlsProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onChangeVolume: (vol: number) => void;
  onExportMp3: (bitrate: number) => Promise<void>;
  onExportWav: () => Promise<void>;
  isExporting: boolean;
  themeColor?: string;
  hasAudio: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  analyserNode,
  isPlaying,
  currentTime,
  duration,
  isLooping,
  volume,
  onTogglePlay,
  onSeek,
  onToggleLoop,
  onChangeVolume,
  onExportMp3,
  onExportWav,
  isExporting,
  themeColor = '#06b6d4',
  hasAudio,
}) => {
  const { isDark } = useTheme();
  const [visualizerMode, setVisualizerMode] = useState<'wave' | 'bars' | 'pulse'>('wave');
  const [mp3Bitrate, setMp3Bitrate] = useState<number>(192);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMp3Download = async () => {
    try {
      await onExportMp3(mp3Bitrate);
      setDownloadSuccess('MP3 Saved!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWavDownload = async () => {
    try {
      await onExportWav();
      setDownloadSuccess('WAV Saved!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 shadow-xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Visualizer header & mode switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Acoustic Visualizer & Master Output
          </span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded-lg border text-[10px] ${
            isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => setVisualizerMode('wave')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              visualizerMode === 'wave'
                ? isDark
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'bg-white text-cyan-700 font-semibold shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Oscilloscope
          </button>
          <button
            onClick={() => setVisualizerMode('bars')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              visualizerMode === 'bars'
                ? isDark
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'bg-white text-cyan-700 font-semibold shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FFT Spectrum
          </button>
          <button
            onClick={() => setVisualizerMode('pulse')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              visualizerMode === 'pulse'
                ? isDark
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'bg-white text-cyan-700 font-semibold shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Radial Pulse
          </button>
        </div>
      </div>

      {/* Visualizer Canvas */}
      <Visualizer
        analyserNode={analyserNode}
        isPlaying={isPlaying}
        themeColor={themeColor}
        mode={visualizerMode}
      />

      {/* Scrubber Bar */}
      <div className="space-y-1">
        <div
          className={`relative w-full h-2 rounded-full cursor-pointer group overflow-hidden ${
            isDark ? 'bg-slate-950' : 'bg-slate-200'
          }`}
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            disabled={!hasAudio}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <div
          className={`flex justify-between items-center text-[11px] font-mono ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Master Controls & Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            disabled={!hasAudio}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
            title={isPlaying ? 'Pause' : 'Play synthesized recording'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSeek(0)}
            disabled={!hasAudio}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-40 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
            title="Rewind to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleLoop}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              isLooping
                ? isDark
                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-400'
                : isDark
                ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300'
            }`}
            title={isLooping ? 'Looping Enabled' : 'Enable Looping'}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Volume Slider */}
          <div
            className={`flex items-center gap-2 pl-2 border-l ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => onChangeVolume(volume > 0 ? 0 : 1)}
              className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-16 accent-cyan-500 cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>

        {/* Local Storage Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bitrate picker */}
          <select
            value={mp3Bitrate}
            onChange={(e) => setMp3Bitrate(parseInt(e.target.value, 10))}
            className={`text-xs rounded-xl px-2.5 py-2 outline-none cursor-pointer border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
            title="MP3 Quality Bitrate"
          >
            <option value={192}>192 kbps (High)</option>
            <option value={320}>320 kbps (Studio Max)</option>
            <option value={128}>128 kbps (Standard)</option>
          </select>

          {/* Save MP3 directly to local device */}
          <button
            onClick={handleMp3Download}
            disabled={!hasAudio || isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Render all effects and download directly to your computer as MP3"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : downloadSuccess?.includes('MP3') ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Save MP3</span>
          </button>

          {/* Save Lossless WAV */}
          <button
            onClick={handleWavDownload}
            disabled={!hasAudio || isExporting}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Download uncompressed 16-bit WAV file with all effects baked in"
          >
            <FileAudio className="w-3.5 h-3.5 text-cyan-500" />
            <span>Save WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
