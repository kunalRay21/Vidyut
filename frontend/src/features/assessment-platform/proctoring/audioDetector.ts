import { AudioDetectionResult } from '../types/proctoring';

export class AudioDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private timeData: Uint8Array | null = null;
  private freqData: Uint8Array | null = null;
  private sustainedSpeechCounter: number = 0;
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
      this.analyser.smoothingTimeConstant = 0.6;

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.isInitialized = true;
      this.sustainedSpeechCounter = 0;

      // Ensure audioContext is active if suspended
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

  public analyzeAudio(): AudioDetectionResult {
    if (!this.isInitialized || !this.analyser || !this.timeData || !this.freqData) {
      return {
        volumeRms: 0,
        peakFrequency: 0,
        isSustainedNoise: false,
        isSpeechLikely: false,
      };
    }

    try {
      // 1. Time-domain data for RMS Volume calculation
      this.analyser.getByteTimeDomainData(this.timeData as any);
      let sumSquares = 0;
      for (let i = 0; i < this.timeData.length; i++) {
        // Center around 128
        const norm = (this.timeData[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / this.timeData.length);
      // Scale to 0-100 visual volume
      const volumeRms = Math.min(100, Math.round(rms * 280));

      // 2. Frequency data for speech profile estimation
      this.analyser.getByteFrequencyData(this.freqData as any);
      let maxEnergy = 0;
      let peakBin = 0;

      // Sample rate usually 44100 or 48000. Bin size = sampleRate / fftSize (~86Hz-93Hz per bin)
      const sampleRate = this.audioContext?.sampleRate || 44100;
      const binWidth = sampleRate / this.analyser.fftSize;

      // Human speech fundamental & formants are primarily between 150Hz and 3400Hz (bins ~2 to 38)
      let speechEnergySum = 0;
      let speechBinsCount = 0;

      for (let i = 0; i < this.freqData.length; i++) {
        const energy = this.freqData[i];
        if (energy > maxEnergy) {
          maxEnergy = energy;
          peakBin = i;
        }
        const freq = i * binWidth;
        if (freq >= 180 && freq <= 3200) {
          speechEnergySum += energy;
          speechBinsCount++;
        }
      }

      const peakFrequency = Math.round(peakBin * binWidth);
      const avgSpeechEnergy = speechBinsCount > 0 ? speechEnergySum / speechBinsCount : 0;

      // Speech heuristic: volume above quiet background and concentrated in human vocal band
      const isSpeechLikely = volumeRms > 22 && avgSpeechEnergy > 35;

      // Sustained noise: speech or continuous noise over consecutive samples
      if (volumeRms > 24) {
        this.sustainedSpeechCounter++;
      } else {
        this.sustainedSpeechCounter = Math.max(0, this.sustainedSpeechCounter - 1);
      }

      // If sustained across ~7 consecutive checks (~3.5 seconds at 2 checks/sec)
      const isSustainedNoise = this.sustainedSpeechCounter >= 7;

      return {
        volumeRms,
        peakFrequency,
        isSustainedNoise,
        isSpeechLikely,
      };
    } catch (err) {
      console.warn('[AudioDetector] Audio analysis error:', err);
      return {
        volumeRms: 0,
        peakFrequency: 0,
        isSustainedNoise: false,
        isSpeechLikely: false,
      };
    }
  }

  public resetSustainedCounter(): void {
    this.sustainedSpeechCounter = 0;
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
