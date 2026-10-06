import React from 'react';
import {
  Download,
  Play,
  Pause,
  Trash2,
  Clock,
  Sparkles,
  Volume2,
  Layers,
  FileAudio,
} from 'lucide-react';
import { GenerationMetadata } from '../types/audio';
import { useTheme } from '../context/ThemeContext';

interface RecordingsHistoryProps {
  recordings: GenerationMetadata[];
  activeRecordingId: string | null;
  isPlaying: boolean;
  onPlayRecording: (recording: GenerationMetadata) => void;
  onDeleteRecording: (id: string) => void;
  onDownloadRecording: (recording: GenerationMetadata, format: 'mp3' | 'wav') => void;
  onLoadIntoStudio: (recording: GenerationMetadata) => void;
}

export const RecordingsHistory: React.FC<RecordingsHistoryProps> = ({
  recordings,
  activeRecordingId,
  isPlaying,
  onPlayRecording,
  onDeleteRecording,
  onDownloadRecording,
  onLoadIntoStudio,
}) => {
  const { isDark } = useTheme();

  if (recordings.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-8 text-center space-y-3 ${
          isDark
            ? 'bg-slate-900/50 border-slate-800/80'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
            isDark
              ? 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          <Layers className="w-6 h-6" />
        </div>
        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          No Recordings in Session Vault
        </h4>
        <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Type text above, select an exotic voice, and click Synthesize to create voice recordings that you can save directly to your device storage.
        </p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          className={`text-sm font-semibold flex items-center gap-2 ${
            isDark ? 'text-slate-200' : 'text-slate-900'
          }`}
        >
          <span>Session Recordings Vault</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
              isDark
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-100 text-cyan-700 border-slate-300'
            }`}
          >
            {recordings.length}
          </span>
        </h3>
        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Download directly to local device storage at any time
        </span>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {recordings.map((rec) => {
          const isActive = rec.id === activeRecordingId;
          const isCurrentPlaying = isActive && isPlaying;

          return (
            <div
              key={rec.id}
              className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isActive
                  ? isDark
                    ? 'bg-slate-900 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-cyan-50/50 border-cyan-400 shadow-sm ring-1 ring-cyan-400/30'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onPlayRecording(rec)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    isCurrentPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                      : 'bg-slate-100 hover:bg-slate-200 text-cyan-600 border border-slate-200'
                  }`}
                  title={isCurrentPlaying ? 'Pause' : 'Play recording'}
                >
                  {isCurrentPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`font-semibold text-xs truncate ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {rec.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        isDark
                          ? 'bg-slate-800 text-cyan-300 border-slate-700/60'
                          : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      }`}
                    >
                      {rec.voiceName}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${
                        isDark
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      {rec.tone}
                    </span>
                  </div>

                  <p
                    className={`text-xs italic line-clamp-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    "{rec.text}"
                  </p>

                  <div
                    className={`flex items-center gap-3 mt-1 text-[11px] font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTime(rec.duration)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(rec.createdAt)}</span>
                    {rec.effects.pitchSemitones !== 0 && (
                      <>
                        <span>•</span>
                        <span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                          {rec.effects.pitchSemitones > 0 ? '+' : ''}
                          {rec.effects.pitchSemitones} st
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onLoadIntoStudio(rec)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title="Load text and effects back into studio editor"
                >
                  Edit DSP
                </button>

                <button
                  onClick={() => onDownloadRecording(rec, 'mp3')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                  title="Download MP3 file directly to local storage"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>MP3</span>
                </button>

                <button
                  onClick={() => onDownloadRecording(rec, 'wav')}
                  className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title="Download WAV file directly to local storage"
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  <span>WAV</span>
                </button>

                <button
                  onClick={() => onDeleteRecording(rec.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/40'
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Delete recording from vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
