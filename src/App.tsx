/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Flame,
  Radio,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  AlertCircle,
  Copy,
  Check,
  Volume2,
  Info,
  Loader2,
  Sliders,
  Settings2,
  Sun,
  Moon,
} from 'lucide-react';
import { EXOTIC_VOICES, TONE_OPTIONS, PRESET_PHRASES } from './data/voices';
import { ExoticVoice, ToneId, AudioEffectSettings, GenerationMetadata } from './types/audio';
import { VoiceSelector } from './components/VoiceSelector';
import { ToneSelector } from './components/ToneSelector';
import { EffectsRack } from './components/EffectsRack';
import { PlayerControls } from './components/PlayerControls';
import { RecordingsHistory } from './components/RecordingsHistory';
import { DemonicLogo } from './components/DemonicLogo';
import { useTheme } from './context/ThemeContext';
import {
  getAudioContext,
  decodeBase64AudioToBuffer,
  createSyntheticDemoBuffer,
  buildAudioGraph,
  renderProcessedAudioBuffer,
  audioBufferToMp3,
  audioBufferToWav,
  triggerFileDownload,
} from './utils/audioEngine';

export default function App() {
  const { theme, toggleTheme, isDark } = useTheme();

  // Input state
  const [inputText, setInputText] = useState<string>(
    'I am the ancient horror that slumbers beneath the continental plates. Your fragile kingdoms are dust before my gaze.'
  );
  const [selectedVoice, setSelectedVoice] = useState<ExoticVoice>(EXOTIC_VOICES[0]);
  const [selectedTone, setSelectedTone] = useState<ToneId>('sinister');
  const [customModifier, setCustomModifier] = useState<string>('');
  const [effects, setEffects] = useState<AudioEffectSettings>(EXOTIC_VOICES[0].dspDefaults);

  // Generation & Status state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Audio Playback state
  const [rawAudioBuffer, setRawAudioBuffer] = useState<AudioBuffer | null>(null);
  const [rawAudioBase64, setRawAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Session recordings history
  const [recordings, setRecordings] = useState<GenerationMetadata[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);

  // Web Audio Nodes references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const playbackTimerRef = useRef<number | null>(null);

  // Sync theme color with voice category
  const getThemeColor = () => {
    switch (selectedVoice.category) {
      case 'demonic':
        return '#ef4444';
      case 'scifi':
        return '#06b6d4';
      case 'horror':
        return '#f43f5e';
      case 'fantasy':
        return '#f59e0b';
      case 'spectral':
        return '#a855f7';
      case 'alien':
        return '#10b981';
      case 'vintage':
        return '#f97316';
      default:
        return '#06b6d4';
    }
  };

  // When selecting an exotic voice, auto-apply its tuned DSP defaults
  const handleSelectVoice = (voice: ExoticVoice) => {
    setSelectedVoice(voice);
    setEffects({ ...voice.dspDefaults });
  };

  // Quick preset phrase selection
  const handleSelectPreset = (preset: typeof PRESET_PHRASES[0]) => {
    setInputText(preset.text);
    const foundVoice = EXOTIC_VOICES.find((v) => v.id === preset.recommendedVoice);
    if (foundVoice) {
      handleSelectVoice(foundVoice);
    }
    setSelectedTone(preset.recommendedTone as ToneId);
  };

  // Stop current active playback node
  const stopAudioPlayback = () => {
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.onended = null;
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch (e) {
        // already stopped
      }
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
    setIsPreviewing(false);
  };

  // Preview the active effects processing on the current sound file
  const handleTogglePreview = async () => {
    if (isPreviewing) {
      stopAudioPlayback();
      return;
    }

    const ctx = getAudioContext();
    audioCtxRef.current = ctx;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    stopAudioPlayback();

    // Use loaded buffer or fallback synthetic vocal demo buffer
    let targetBuffer = rawAudioBuffer;
    if (!targetBuffer) {
      targetBuffer = createSyntheticDemoBuffer(ctx);
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    analyserNodeRef.current = analyser;

    const source = ctx.createBufferSource();
    source.buffer = targetBuffer;

    const pitchFactor = Math.pow(2, effects.pitchSemitones / 12);
    const effectiveRate = Math.max(0.2, effects.speed * pitchFactor);
    source.playbackRate.setValueAtTime(effectiveRate, ctx.currentTime);

    const masterGain = buildAudioGraph(ctx, source, analyser, {
      ...effects,
      volume,
    });
    analyser.connect(ctx.destination);
    masterGainRef.current = masterGain;

    currentSourceRef.current = source;
    startTimeRef.current = ctx.currentTime;
    pauseOffsetRef.current = 0;

    const calculatedDuration = targetBuffer.duration / effectiveRate;
    setDuration(calculatedDuration);

    source.onended = () => {
      setIsPreviewing(false);
      setIsPlaying(false);
      setCurrentTime(0);
      pauseOffsetRef.current = 0;
    };

    source.start(0);
    setIsPreviewing(true);
    setIsPlaying(true);

    const updateProgress = () => {
      if (!ctx || !currentSourceRef.current) return;
      const elapsed = (ctx.currentTime - startTimeRef.current) * effectiveRate;
      if (elapsed >= targetBuffer!.duration) {
        setCurrentTime(targetBuffer!.duration / effectiveRate);
      } else {
        setCurrentTime(elapsed);
        playbackTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };
    playbackTimerRef.current = requestAnimationFrame(updateProgress);
  };

  // Play audio buffer through real-time DSP effects graph
  const startAudioPlayback = async (offsetSeconds = 0) => {
    if (!rawAudioBuffer) return;

    const ctx = getAudioContext();
    audioCtxRef.current = ctx;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    stopAudioPlayback();

    // Create Analyser for visualization
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    analyserNodeRef.current = analyser;

    // Create BufferSource
    const source = ctx.createBufferSource();
    source.buffer = rawAudioBuffer;

    // Calculate effective playback rate from pitch & speed
    const pitchFactor = Math.pow(2, effects.pitchSemitones / 12);
    const effectiveRate = Math.max(0.2, effects.speed * pitchFactor);
    source.playbackRate.setValueAtTime(effectiveRate, ctx.currentTime);

    // Build DSP graph connecting source -> effects -> analyser -> destination
    const masterGain = buildAudioGraph(ctx, source, analyser, {
      ...effects,
      volume,
    });
    analyser.connect(ctx.destination);
    masterGainRef.current = masterGain;

    currentSourceRef.current = source;
    startTimeRef.current = ctx.currentTime - offsetSeconds / effectiveRate;
    pauseOffsetRef.current = offsetSeconds;

    // Effective duration considering speed and pitch
    const calculatedDuration = rawAudioBuffer.duration / effectiveRate;
    setDuration(calculatedDuration);

    source.onended = () => {
      if (isLooping) {
        startAudioPlayback(0);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        pauseOffsetRef.current = 0;
      }
    };

    source.start(0, offsetSeconds);
    setIsPlaying(true);

    // Track playback progress
    const updateProgress = () => {
      if (!ctx || !currentSourceRef.current) return;
      const elapsed = (ctx.currentTime - startTimeRef.current) * effectiveRate;
      if (elapsed >= rawAudioBuffer.duration) {
        setCurrentTime(rawAudioBuffer.duration / effectiveRate);
      } else {
        setCurrentTime(elapsed);
        playbackTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };
    playbackTimerRef.current = requestAnimationFrame(updateProgress);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioCtxRef.current) {
        const pitchFactor = Math.pow(2, effects.pitchSemitones / 12);
        const effectiveRate = Math.max(0.2, effects.speed * pitchFactor);
        pauseOffsetRef.current = (audioCtxRef.current.currentTime - startTimeRef.current) * effectiveRate;
      }
      stopAudioPlayback();
    } else {
      const resumeFrom = currentTime >= duration ? 0 : pauseOffsetRef.current;
      startAudioPlayback(resumeFrom);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    pauseOffsetRef.current = newTime;
    if (isPlaying) {
      startAudioPlayback(newTime);
    }
  };

  const handleChangeVolume = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // When effects change while playing, seamlessly restart to hear new DSP in real time
  const handleEffectsChange = (newEffects: AudioEffectSettings) => {
    setEffects(newEffects);
    if (isPlaying && rawAudioBuffer) {
      const currentPos = currentTime;
      setTimeout(() => {
        if (isPlaying) startAudioPlayback(currentPos);
      }, 50);
    }
  };

  // Synthesize voice via backend Gemini TTS endpoint
  const handleGenerateVoice = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please type text to synthesize.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('Transmuting text into exotic voice stream...');
    stopAudioPlayback();

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          voiceId: selectedVoice.id,
          tone: selectedTone,
          customPromptModifier: customModifier.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize exotic voice.');
      }

      setStatusMessage('Decoding acoustic audio waveform...');
      const ctx = getAudioContext();
      const decodedBuffer = await decodeBase64AudioToBuffer(data.audioBase64, ctx);

      setRawAudioBuffer(decodedBuffer);
      setRawAudioBase64(data.audioBase64);
      setDuration(decodedBuffer.duration);
      setCurrentTime(0);
      pauseOffsetRef.current = 0;

      // Add to session recordings vault
      const newRec: GenerationMetadata = {
        id: `vox_${Date.now()}`,
        title: `${selectedVoice.name} - ${selectedTone.toUpperCase()}`,
        text: inputText.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        tone: selectedTone,
        createdAt: Date.now(),
        duration: decodedBuffer.duration,
        rawAudioBase64: data.audioBase64,
        sampleRate: decodedBuffer.sampleRate,
        effects: { ...effects },
      };

      setRecordings((prev) => [newRec, ...prev]);
      setActiveRecordingId(newRec.id);
      setStatusMessage(null);

      // Immediately autoplay with DSP pipeline
      setTimeout(() => {
        startAudioPlayback(0);
      }, 100);
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setErrorMessage(err.message || 'Error occurred while contacting voice engine.');
      setStatusMessage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export & Download high-quality MP3 directly to local device storage
  const handleExportMp3 = async (bitrate: number = 192) => {
    if (!rawAudioBuffer) return;
    setIsExporting(true);
    try {
      // 1. Bake all active DSP effects (pitch, speed, reverb, echo, distortion, ring mod)
      const processedBuffer = await renderProcessedAudioBuffer(rawAudioBuffer, effects);

      // 2. Encode to high quality MP3
      const mp3Blob = await audioBufferToMp3(processedBuffer, bitrate);

      // 3. Trigger local file download
      const cleanName = selectedVoice.id.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `voxexotica-${cleanName}-${selectedTone}-${Date.now()}.mp3`;
      triggerFileDownload(mp3Blob, filename);
    } catch (err) {
      console.error('MP3 export failed:', err);
      setErrorMessage('Failed to export MP3. Try exporting WAV instead.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export lossless WAV directly to local device storage
  const handleExportWav = async () => {
    if (!rawAudioBuffer) return;
    setIsExporting(true);
    try {
      // Bake effects through OfflineAudioContext
      const processedBuffer = await renderProcessedAudioBuffer(rawAudioBuffer, effects);
      const wavBlob = audioBufferToWav(processedBuffer);

      const cleanName = selectedVoice.id.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `voxexotica-${cleanName}-${selectedTone}-${Date.now()}.wav`;
      triggerFileDownload(wavBlob, filename);
    } catch (err) {
      console.error('WAV export failed:', err);
      setErrorMessage('Failed to export WAV file.');
    } finally {
      setIsExporting(false);
    }
  };

  // Play a historical recording from the vault
  const handlePlayRecording = async (rec: GenerationMetadata) => {
    if (activeRecordingId === rec.id && isPlaying) {
      togglePlay();
      return;
    }

    try {
      const ctx = getAudioContext();
      const buf = await decodeBase64AudioToBuffer(rec.rawAudioBase64, ctx);
      setRawAudioBuffer(buf);
      setRawAudioBase64(rec.rawAudioBase64);
      setActiveRecordingId(rec.id);
      setEffects(rec.effects);
      setDuration(buf.duration);
      setCurrentTime(0);
      pauseOffsetRef.current = 0;

      const foundVoice = EXOTIC_VOICES.find((v) => v.id === rec.voiceId);
      if (foundVoice) setSelectedVoice(foundVoice);
      setSelectedTone(rec.tone);
      setInputText(rec.text);

      setTimeout(() => {
        startAudioPlayback(0);
      }, 50);
    } catch (e) {
      console.error('Failed to load recording:', e);
    }
  };

  // Download a recording from the vault directly
  const handleDownloadHistoricalRecording = async (
    rec: GenerationMetadata,
    format: 'mp3' | 'wav'
  ) => {
    try {
      const ctx = getAudioContext();
      const buf = await decodeBase64AudioToBuffer(rec.rawAudioBase64, ctx);
      const processed = await renderProcessedAudioBuffer(buf, rec.effects);

      const cleanName = rec.voiceId.replace(/[^a-zA-Z0-9]/g, '_');
      if (format === 'mp3') {
        const mp3Blob = await audioBufferToMp3(processed, 192);
        triggerFileDownload(mp3Blob, `voxexotica-${cleanName}-${rec.tone}-${rec.id}.mp3`);
      } else {
        const wavBlob = audioBufferToWav(processed);
        triggerFileDownload(wavBlob, `voxexotica-${cleanName}-${rec.tone}-${rec.id}.wav`);
      }
    } catch (e) {
      console.error('Vault download error:', e);
    }
  };

  // Load a recording back into studio
  const handleLoadIntoStudio = async (rec: GenerationMetadata) => {
    setInputText(rec.text);
    const foundVoice = EXOTIC_VOICES.find((v) => v.id === rec.voiceId);
    if (foundVoice) setSelectedVoice(foundVoice);
    setSelectedTone(rec.tone);
    setEffects({ ...rec.effects });
    setActiveRecordingId(rec.id);

    try {
      const ctx = getAudioContext();
      const buf = await decodeBase64AudioToBuffer(rec.rawAudioBase64, ctx);
      setRawAudioBuffer(buf);
      setRawAudioBase64(rec.rawAudioBase64);
      setDuration(buf.duration);
    } catch (e) {
      console.error(e);
    }
  };

  // Clean up audio nodes on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
    };
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 selection:bg-cyan-500/30 selection:text-cyan-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/85'
            : 'border-slate-200/90 bg-white/90 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <DemonicLogo size={44} glow={isDark} />
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`font-extrabold text-lg tracking-tight ${
                    isDark
                      ? 'bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-red-600 via-orange-600 to-cyan-700 bg-clip-text text-transparent'
                  }`}
                >
                  VoxExotica
                </h1>
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-red-950/80 text-red-400 border-red-900/60'
                      : 'bg-red-50 text-red-700 border-red-300'
                  }`}
                >
                  Double D Audio Lab
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Non-Human Voice Synthesis & Real-Time DSP Audio Workstation
              </p>
            </div>
          </div>

          {/* Quick status & Theme switcher */}
          <div className="flex items-center gap-2.5">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-850 text-amber-300 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline font-medium">Dark</span>
                </>
              )}
            </button>

            <div
              className={`hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${
                isDark
                  ? 'text-slate-400 bg-slate-900 border-slate-800'
                  : 'text-slate-600 bg-slate-100 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#34d399]" />
              <span>MP3 DSP Engine Active</span>
            </div>

            <a
              href="#vault"
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-800'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span>Recordings ({recordings.length})</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6 w-full">
        {/* Error Notification */}
        {errorMessage && (
          <div
            className={`border rounded-xl p-3.5 text-xs flex items-start gap-2.5 animate-in fade-in ${
              isDark
                ? 'bg-red-950/60 border-red-500/50 text-red-200'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Generation Notice: </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Grid: Text Input + Presets */}
        <section
          className={`rounded-2xl border p-5 space-y-4 shadow-xl transition-colors duration-200 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Text Script Input</span>
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ({inputText.length} / 1500 chars)
              </span>
            </div>

            {/* Preset phrases selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none text-xs">
              <span className={`text-[11px] whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Try Preset:
              </span>
              {PRESET_PHRASES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap text-[11px] transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700/60'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste any text to translate into an exotic or non-human voice..."
              rows={3}
              maxLength={1500}
              className={`w-full border rounded-xl p-3.5 text-sm outline-none resize-none transition-colors leading-relaxed font-sans ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 focus:border-cyan-500/70 text-slate-100 placeholder-slate-400'
                  : 'bg-slate-50 border-slate-300 focus:border-cyan-500 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Selected Voice:</span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">{selectedVoice.name}</span>
              <span>•</span>
              <span>Tone:</span>
              <span className="capitalize text-purple-600 dark:text-purple-300 font-medium">{selectedTone}</span>
            </div>

            <button
              onClick={handleGenerateVoice}
              disabled={isGenerating || !inputText.trim()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-cyan-600 hover:from-red-500 hover:via-orange-400 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Exotic Audio...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>Synthesize Voice & Open Audio Lab</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Section 1: Exotic Voice Archetypes Matrix */}
        <section
          className={`rounded-2xl border p-5 space-y-3.5 shadow-xl transition-colors duration-200 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                <span>Exotic & Non-Human Voice Archetypes</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Choose from infernal demons, cybernetic mechs, spectral phantoms, extraterrestrials, and ancient golems
              </p>
            </div>
            <span
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                isDark
                  ? 'text-cyan-400 bg-slate-950 border-slate-800'
                  : 'text-cyan-700 bg-slate-100 border-slate-300'
              }`}
            >
              {EXOTIC_VOICES.length} Unique Personas
            </span>
          </div>

          <VoiceSelector
            voices={EXOTIC_VOICES}
            selectedVoiceId={selectedVoice.id}
            onSelectVoice={handleSelectVoice}
          />
        </section>

        {/* Section 2: Vocal Tone & Emotional Delivery */}
        <section
          className={`rounded-2xl border p-5 shadow-xl transition-colors duration-200 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <ToneSelector
            tones={TONE_OPTIONS}
            selectedTone={selectedTone}
            onSelectTone={setSelectedTone}
            customModifier={customModifier}
            onChangeCustomModifier={setCustomModifier}
          />
        </section>

        {/* Section 3: Post-Creation DSP Effects Rack (Pitch, Speed, Echo, Reverb, etc.) */}
        <section>
          <EffectsRack
            effects={effects}
            onChangeEffects={handleEffectsChange}
            onResetToDefaults={() => setEffects({ ...selectedVoice.dspDefaults })}
            onTogglePreview={handleTogglePreview}
            isPreviewing={isPreviewing}
            hasAudio={Boolean(rawAudioBuffer)}
          />
        </section>

        {/* Section 4: Master Acoustic Visualizer & Device Storage Export Bar */}
        <section>
          <PlayerControls
            analyserNode={analyserNodeRef.current}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isLooping={isLooping}
            volume={volume}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onToggleLoop={() => setIsLooping(!isLooping)}
            onChangeVolume={handleChangeVolume}
            onExportMp3={handleExportMp3}
            onExportWav={handleExportWav}
            isExporting={isExporting}
            themeColor={getThemeColor()}
            hasAudio={Boolean(rawAudioBuffer)}
          />
        </section>

        {/* Section 5: Session Recordings Vault & Local Storage Downloads */}
        <section id="vault" className="pt-2">
          <RecordingsHistory
            recordings={recordings}
            activeRecordingId={activeRecordingId}
            isPlaying={isPlaying}
            onPlayRecording={handlePlayRecording}
            onDeleteRecording={(id) => {
              setRecordings((prev) => prev.filter((r) => r.id !== id));
              if (activeRecordingId === id) stopAudioPlayback();
            }}
            onDownloadRecording={handleDownloadHistoricalRecording}
            onLoadIntoStudio={handleLoadIntoStudio}
          />
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-5 text-center text-xs mt-10 transition-colors duration-200 ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/80 text-slate-400'
            : 'border-slate-200 bg-white text-slate-500'
        }`}
      >
        <p>
          VoxExotica Audio Lab • Pure Client/Server DSP Audio Synthesis • MP3 Quality Audio Export Direct to Local Device Storage
        </p>
      </footer>
    </div>
  );
}
