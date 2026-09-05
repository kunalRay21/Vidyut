import { AudioDetectionResult } from '../types/proctoring';

export class AudioDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private timeData: Uint8Array | null = null;
  private freqData: Uint8Array | null = null;
  private speechStreakCounter: number = 0;
  private noiseStreakCounter: number = 0;
  private isInitialized: boolean = false;

  public initialize(stream: MediaStream): boolean {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[AudioDetector] Web Audio API not supported in this browser.');
        return false;
      }

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3; // Low smoothing for rapid responsive volume spikes

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.isInitialized = true;
      this.speechStreakCounter = 0;
      this.noiseStreakCounter = 0;

      // Ensure audioContext is actively running
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      return true;
    } catch (err) {
      console.warn('[AudioDetector] Initialization error:', err);
      this.destroy();
      return false;
    }
  }

  public async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.warn('[AudioDetector] AudioContext resume failed:', err);
      }
    }
  }

  public analyzeAudio(): AudioDetectionResult {
    if (!this.isInitialized || !this.analyser || !this.timeData || !this.freqData) {
      return {
        volumeRms: 0,
        peakFrequency: 0,
        isSustainedNoise: false,
        isSpeechLikely: false,
        isTalking: false,
        isBackgroundNoise: false,
      };
    }

    try {
      // Auto-resume suspended AudioContext if browser policy temporarily paused it
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      // 1. Time-Domain Signal Analysis (RMS + Peak Detection for lively response)
      this.analyser.getByteTimeDomainData(this.timeData as any);
      let sumSquares = 0;
      let maxPeak = 0;

      for (let i = 0; i < this.timeData.length; i++) {
        const norm = Math.abs(this.timeData[i] - 128) / 128;
        if (norm > maxPeak) maxPeak = norm;
        sumSquares += norm * norm;
      }

      const rms = Math.sqrt(sumSquares / this.timeData.length);

      // Perceptual sensitivity formula: detects whispers, normal speech, and background noise
      // Converts raw audio energy into a visible, responsive 0-100% fluctuation scale
      const combinedSignal = Math.max(rms * 2.2, maxPeak * 0.9);
      const volumeRms = Math.min(100, Math.max(0, Math.round(Math.pow(combinedSignal, 0.72) * 135)));

      // 2. Frequency Spectral Analysis (Speech vs Ambient Noise Separation)
      this.analyser.getByteFrequencyData(this.freqData as any);
      let maxEnergy = 0;
      let peakBin = 0;

      const sampleRate = this.audioContext?.sampleRate || 44100;
      const binWidth = sampleRate / this.analyser.fftSize; // ~86 Hz per bin

      let vocalBandEnergy = 0;
      let vocalBinsCount = 0;
      let lowBandEnergy = 0;
      let highBandEnergy = 0;

      for (let i = 0; i < this.freqData.length; i++) {
        const energy = this.freqData[i];
        if (energy > maxEnergy) {
          maxEnergy = energy;
          peakBin = i;
        }

        const freq = i * binWidth;
        if (freq >= 120 && freq <= 3200) {
          // Human voice fundamental & vocal formants band
          vocalBandEnergy += energy;
          vocalBinsCount++;
        } else if (freq < 120) {
          lowBandEnergy += energy;
        } else {
          highBandEnergy += energy;
        }
      }

      const peakFrequency = Math.round(peakBin * binWidth);
      const avgVocalEnergy = vocalBinsCount > 0 ? vocalBandEnergy / vocalBinsCount : 0;

      // 3. Speech & Talking Classification
      // Human voice exhibits concentrated power in vocal band and volume > 15%
      const isSpeechLikely = volumeRms >= 14 && avgVocalEnergy >= 30;

      if (isSpeechLikely) {
        this.speechStreakCounter++;
        this.noiseStreakCounter = 0;
      } else {
        this.speechStreakCounter = Math.max(0, this.speechStreakCounter - 1);
      }

      // Candidate is talking if speech persists across multiple samples (~1.0 - 1.5s)
      const isTalking = this.speechStreakCounter >= 3;

      // 4. Background Noise Classification
      // Ambient noise has general broadband energy without vocal formant concentration
      const isNoiseActive = volumeRms >= 18 && !isSpeechLikely;
      if (isNoiseActive) {
        this.noiseStreakCounter++;
      } else {
        this.noiseStreakCounter = Math.max(0, this.noiseStreakCounter - 1);
      }

      const isBackgroundNoise = this.noiseStreakCounter >= 4;
      const isSustainedNoise = isBackgroundNoise || this.speechStreakCounter >= 6;

      return {
        volumeRms,
        peakFrequency,
        isSustainedNoise,
        isSpeechLikely,
        isTalking,
        isBackgroundNoise,
      };
    } catch (err) {
      console.warn('[AudioDetector] Audio analysis error:', err);
      return {
        volumeRms: 0,
        peakFrequency: 0,
        isSustainedNoise: false,
        isSpeechLikely: false,
        isTalking: false,
        isBackgroundNoise: false,
      };
    }
  }

  public resetCounters(): void {
    this.speechStreakCounter = 0;
    this.noiseStreakCounter = 0;
  }

  public destroy(): void {
    try {
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      if (this.analyser) {
        this.analyser.disconnect();
        this.analyser = null;
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().catch(() => {});
        this.audioContext = null;
      }
    } catch (err) {
      console.warn('[AudioDetector] Destroy error:', err);
    } finally {
      this.isInitialized = false;
      this.timeData = null;
      this.freqData = null;
    }
  }
}
