// @ts-ignore
import lamejs from 'lamejs';
import { AudioEffectSettings } from '../types/audio';

// Shared Web Audio Context
let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Decode Base64 audio string (WAV or MP3) into an AudioBuffer
 */
export async function decodeBase64AudioToBuffer(
  base64Data: string,
  ctx?: AudioContext
): Promise<AudioBuffer> {
  const audioCtx = ctx || getAudioContext();
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioCtx.decodeAudioData(bytes.buffer);
}

/**
 * Synthesizes a vocal demonstration buffer in case the user wants to preview
 * DSP effects prior to synthesizing their own custom script prompt.
 */
export function createSyntheticDemoBuffer(ctx: BaseAudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 2.8;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Formant vocal synthesis simulating vowel phrase: "Vox - E - Xo - Ti - Ca"
  const baseFreq = 140; // Fundamental pitch

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Vibrato
    const vibrato = Math.sin(t * 5.5 * Math.PI * 2) * 4;
    const f0 = baseFreq + vibrato;

    // Harmonic pulse train
    let val = 0;
    for (let h = 1; h <= 12; h++) {
      // Vowel formant peak shaping
      const freq = h * f0;
      let gain = 1 / h;
      if (freq > 400 && freq < 900) gain *= 2.5; // F1 formant
      if (freq > 1400 && freq < 2200) gain *= 2.0; // F2 formant
      val += Math.sin(t * freq * Math.PI * 2) * gain;
    }

    // Envelope
    let env = 1;
    if (t < 0.1) env = t / 0.1;
    else if (t > duration - 0.3) env = Math.max(0, (duration - t) / 0.3);

    data[i] = val * 0.18 * env;
  }

  return buffer;
}

/**
 * Synthesize a realistic impulse response for the reverb node
 */
export function createImpulseResponse(
  ctx: BaseAudioContext,
  durationSeconds: number,
  roomType: 'crypt' | 'cathedral' | 'tank' | 'space' | 'chamber' = 'crypt'
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * Math.max(0.2, durationSeconds)));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  let decayFactor = 3.0;
  let diffusionFactor = 0.5;

  switch (roomType) {
    case 'crypt':
      decayFactor = 2.2;
      diffusionFactor = 0.8;
      break;
    case 'cathedral':
      decayFactor = 1.6;
      diffusionFactor = 0.6;
      break;
    case 'tank':
      decayFactor = 4.0;
      diffusionFactor = 0.95;
      break;
    case 'space':
      decayFactor = 0.9;
      diffusionFactor = 0.4;
      break;
    case 'chamber':
    default:
      decayFactor = 3.5;
      diffusionFactor = 0.5;
      break;
  }

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Exponential decay envelope
    const envelope = Math.exp(-t * decayFactor);

    // Filtered noise with multi-reflection taps
    const noiseL = (Math.random() * 2 - 1) * envelope;
    const noiseR = (Math.random() * 2 - 1) * envelope;

    // Early reflection echoes
    const earlyEchoL = i > 1200 ? left[i - 1200] * 0.25 : 0;
    const earlyEchoR = i > 1800 ? right[i - 1800] * 0.25 : 0;

    left[i] = noiseL + earlyEchoL * diffusionFactor;
    right[i] = noiseR + earlyEchoR * diffusionFactor;
  }

  return impulse;
}

/**
 * Generate a non-linear saturation curve for distortion & overdrive
 */
export function createDistortionCurve(amount: number): Float32Array {
  const k = typeof amount === 'number' ? amount : 50;
  const nSamples = 44100;
  const curve = new Float32Array(nSamples);
  const deg = Math.PI / 180;

  if (k <= 0) {
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = x;
    }
    return curve;
  }

  for (let i = 0; i < nSamples; ++i) {
    const x = (i * 2) / nSamples - 1;
    // Classic soft-clipping saturation formula
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

/**
 * Connect the full DSP effects pipeline into a BaseAudioContext
 */
export function buildAudioGraph(
  ctx: BaseAudioContext,
  sourceNode: AudioNode,
  destinationNode: AudioNode,
  effects: AudioEffectSettings
) {
  let currentNode = sourceNode;

  // 1. Bitcrusher / Lo-Fi Quantization (if active)
  if (effects.bitcrush && effects.bitcrush > 0) {
    // We implement bitcrush wave-shaping
    const steps = Math.pow(2, Math.max(2, 16 - effects.bitcrush));
    const crushCurve = new Float32Array(4096);
    for (let i = 0; i < 4096; i++) {
      const x = (i / 4096) * 2 - 1;
      crushCurve[i] = Math.round(x * steps) / steps;
    }
    const crusher = ctx.createWaveShaper();
    crusher.curve = crushCurve as any;
    currentNode.connect(crusher);
    currentNode = crusher;
  }

  // 1b. Old Telephone 1920s Carbon Filter & Bandpass
  if (effects.telephoneEnabled) {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(450, ctx.currentTime);
    hp.Q.setValueAtTime(2.2, ctx.currentTime);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, ctx.currentTime);
    lp.Q.setValueAtTime(2.6, ctx.currentTime);

    const carbonDrive = ctx.createWaveShaper();
    carbonDrive.curve = createDistortionCurve(35) as any;

    currentNode.connect(hp);
    hp.connect(lp);
    lp.connect(carbonDrive);
    currentNode = carbonDrive;
  }

  // 1c. Vocoder (Robot Carrier Formant Modulator)
  if (effects.vocoderEnabled) {
    const carrierPitch = effects.vocoderCarrierFreq || 120;
    const mix = effects.vocoderMix !== undefined ? effects.vocoderMix : 0.65;

    const carrier = ctx.createOscillator();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(carrierPitch, ctx.currentTime);

    const vocGain = ctx.createGain();
    vocGain.gain.setValueAtTime(0, ctx.currentTime);

    const vocDry = ctx.createGain();
    const vocWet = ctx.createGain();
    const vocSummer = ctx.createGain();

    vocDry.gain.setValueAtTime(Math.max(0, 1 - mix * 0.6), ctx.currentTime);
    vocWet.gain.setValueAtTime(mix, ctx.currentTime);

    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(1400, ctx.currentTime);
    formant.Q.setValueAtTime(3.5, ctx.currentTime);

    carrier.connect(formant);
    formant.connect(vocGain.gain);

    currentNode.connect(vocDry);
    vocDry.connect(vocSummer);

    currentNode.connect(vocGain);
    vocGain.connect(vocWet);
    vocWet.connect(vocSummer);

    carrier.start(ctx.currentTime);
    currentNode = vocSummer;
  }

  // 1d. Stutter / Chopper Rhythmic Gate
  if (effects.stutterEnabled) {
    const rate = effects.stutterRate || 8.0;
    const depth = effects.stutterDepth !== undefined ? effects.stutterDepth : 0.85;

    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(rate, ctx.currentTime);

    const lfoDepthGain = ctx.createGain();
    lfoDepthGain.gain.setValueAtTime(depth * 0.5, ctx.currentTime);

    const chopGain = ctx.createGain();
    chopGain.gain.setValueAtTime(1 - depth * 0.5, ctx.currentTime);

    lfo.connect(lfoDepthGain);
    lfoDepthGain.connect(chopGain.gain);

    currentNode.connect(chopGain);
    lfo.start(ctx.currentTime);
    currentNode = chopGain;
  }

  // 1e. Chorus / Flanger / Space Wobble
  if (effects.chorusEnabled) {
    const cRate = effects.chorusRate || 1.2;
    const cDepth = effects.chorusDepth !== undefined ? effects.chorusDepth : 0.55;

    const chorusDelay = ctx.createDelay(0.05);
    chorusDelay.delayTime.setValueAtTime(0.015, ctx.currentTime);

    const chorusLfo = ctx.createOscillator();
    chorusLfo.type = 'sine';
    chorusLfo.frequency.setValueAtTime(cRate, ctx.currentTime);

    const chorusLfoGain = ctx.createGain();
    chorusLfoGain.gain.setValueAtTime(0.006 * cDepth, ctx.currentTime);

    chorusLfo.connect(chorusLfoGain);
    chorusLfoGain.connect(chorusDelay.delayTime);

    const chorusWet = ctx.createGain();
    chorusWet.gain.setValueAtTime(cDepth * 0.65, ctx.currentTime);

    const chorusSummer = ctx.createGain();

    currentNode.connect(chorusSummer);
    currentNode.connect(chorusDelay);
    chorusDelay.connect(chorusWet);
    chorusWet.connect(chorusSummer);

    chorusLfo.start(ctx.currentTime);
    currentNode = chorusSummer;
  }

  // 2. Overdrive / Distortion WaveShaper
  if (effects.distortion && effects.distortion > 0) {
    const shaper = ctx.createWaveShaper();
    shaper.curve = createDistortionCurve(effects.distortion) as any;
    shaper.oversample = '4x';
    currentNode.connect(shaper);
    currentNode = shaper;
  }

  // 3. Ring Modulator (Robotic / Cyber comb modulation)
  if (effects.ringModMix && effects.ringModMix > 0 && effects.ringModFreq > 0) {
    // Carrier oscillator * signal
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(effects.ringModFreq, ctx.currentTime);

    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0, ctx.currentTime);

    // Wet / Dry split for ring modulation
    const ringDry = ctx.createGain();
    const ringWet = ctx.createGain();
    const ringSummer = ctx.createGain();

    ringDry.gain.setValueAtTime(1 - effects.ringModMix, ctx.currentTime);
    ringWet.gain.setValueAtTime(effects.ringModMix, ctx.currentTime);

    currentNode.connect(ringDry);
    ringDry.connect(ringSummer);

    // Modulate audio via carrier
    carrier.connect(ringGain.gain);
    currentNode.connect(ringGain);
    ringGain.connect(ringWet);
    ringWet.connect(ringSummer);

    carrier.start(ctx.currentTime);
    currentNode = ringSummer;
  }

  // 4. Equalizer / BiquadFilter (Cutoffs)
  if (effects.filterType && effects.filterType !== 'none') {
    const filter = ctx.createBiquadFilter();
    filter.type = effects.filterType;
    filter.frequency.setValueAtTime(effects.filterCutoff || 2000, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    currentNode.connect(filter);
    currentNode = filter;
  }

  // 5. Echo / Delay Network
  if (effects.echoDelay && effects.echoDelay > 10) {
    const delayTimeSec = Math.max(0.01, effects.echoDelay / 1000);
    const feedbackAmount = Math.min(0.85, Math.max(0, effects.echoFeedback || 0.3));

    const delayNode = ctx.createDelay(5.0);
    delayNode.delayTime.setValueAtTime(delayTimeSec, ctx.currentTime);

    const feedbackNode = ctx.createGain();
    feedbackNode.gain.setValueAtTime(feedbackAmount, ctx.currentTime);

    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(4500, ctx.currentTime); // natural tape/air absorption

    const echoWet = ctx.createGain();
    echoWet.gain.setValueAtTime(0.7, ctx.currentTime);

    const echoSummer = ctx.createGain();

    // Dry passes through
    currentNode.connect(echoSummer);

    // Wet passes through delay loop
    currentNode.connect(delayNode);
    delayNode.connect(delayFilter);
    delayFilter.connect(feedbackNode);
    feedbackNode.connect(delayNode);

    delayFilter.connect(echoWet);
    echoWet.connect(echoSummer);

    currentNode = echoSummer;
  }

  // 6. Reverb Convolver Network
  if (effects.reverbWet && effects.reverbWet > 0.05 && effects.reverbDecay > 0.1) {
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(
      ctx,
      effects.reverbDecay || 3.0,
      effects.reverbRoomType || 'crypt'
    );

    const reverbDry = ctx.createGain();
    const reverbWet = ctx.createGain();
    const reverbSummer = ctx.createGain();

    const wetMix = Math.min(1.0, effects.reverbWet);
    reverbDry.gain.setValueAtTime(Math.max(0, 1 - wetMix * 0.4), ctx.currentTime);
    reverbWet.gain.setValueAtTime(wetMix, ctx.currentTime);

    currentNode.connect(reverbDry);
    reverbDry.connect(reverbSummer);

    currentNode.connect(convolver);
    convolver.connect(reverbWet);
    reverbWet.connect(reverbSummer);

    currentNode = reverbSummer;
  }

  // 7. Master Output Gain
  const masterGain = ctx.createGain();
  const vol = effects.volume !== undefined ? effects.volume : 1.0;
  masterGain.gain.setValueAtTime(vol, ctx.currentTime);

  currentNode.connect(masterGain);
  masterGain.connect(destinationNode);

  return masterGain;
}

/**
 * Render AudioBuffer with all DSP effects (pitch, speed, reverb, delay, distortion)
 * into a pristine processed AudioBuffer using OfflineAudioContext.
 */
export async function renderProcessedAudioBuffer(
  originalBuffer: AudioBuffer,
  effects: AudioEffectSettings
): Promise<AudioBuffer> {
  const pitchFactor = Math.pow(2, effects.pitchSemitones / 12);
  const totalRate = Math.max(0.2, (effects.speed || 1.0) * pitchFactor);

  // Calculate extended duration for reverb & echo tails
  const baseDuration = originalBuffer.duration / totalRate;
  const reverbTail = effects.reverbWet && effects.reverbWet > 0.05 ? effects.reverbDecay || 2.5 : 0;
  const echoTail = effects.echoDelay > 20 ? (effects.echoDelay / 1000) * 4 : 0;
  const tailDuration = Math.max(reverbTail, echoTail, 0.5);
  const totalDuration = baseDuration + tailDuration;

  const sampleRate = 44100;
  const totalFrames = Math.ceil(totalDuration * sampleRate);

  const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

  // Source node
  const source = offlineCtx.createBufferSource();
  source.buffer = originalBuffer;
  source.playbackRate.setValueAtTime(totalRate, 0);

  // Connect through DSP rack
  buildAudioGraph(offlineCtx, source, offlineCtx.destination, effects);

  source.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Convert AudioBuffer to 16-bit PCM RIFF WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const bufferLength = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, format, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write audio samples interleaved
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Convert AudioBuffer into high quality MP3 Blob (192kbps / 320kbps) using lamejs
 */
export async function audioBufferToMp3(
  buffer: AudioBuffer,
  bitRateKbps: number = 192
): Promise<Blob> {
  const Mp3Encoder = (lamejs as any).Mp3Encoder || (lamejs as any).default?.Mp3Encoder;

  if (!Mp3Encoder) {
    console.warn('lamejs Mp3Encoder unavailable, falling back to WAV');
    return audioBufferToWav(buffer);
  }

  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const encoder = new Mp3Encoder(channels, sampleRate, bitRateKbps);
  const mp3Data: Int8Array[] = [];

  const sampleBlockSize = 1152;
  const numSamples = buffer.length;

  if (channels === 1) {
    const leftData = buffer.getChannelData(0);
    const leftInt16 = new Int16Array(leftData.length);
    for (let i = 0; i < leftData.length; i++) {
      const s = Math.max(-1, Math.min(1, leftData[i]));
      leftInt16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    for (let i = 0; i < numSamples; i += sampleBlockSize) {
      const chunk = leftInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
  } else {
    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);
    const leftInt16 = new Int16Array(leftData.length);
    const rightInt16 = new Int16Array(rightData.length);

    for (let i = 0; i < leftData.length; i++) {
      const sl = Math.max(-1, Math.min(1, leftData[i]));
      const sr = Math.max(-1, Math.min(1, rightData[i]));
      leftInt16[i] = sl < 0 ? sl * 0x8000 : sl * 0x7fff;
      rightInt16[i] = sr < 0 ? sr * 0x8000 : sr * 0x7fff;
    }

    for (let i = 0; i < numSamples; i += sampleBlockSize) {
      const chunkL = leftInt16.subarray(i, i + sampleBlockSize);
      const chunkR = rightInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(chunkL, chunkR);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) {
    mp3Data.push(flushed);
  }

  return new Blob(mp3Data as any, { type: 'audio/mp3' });
}

/**
 * Trigger local device browser download for any Blob
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
