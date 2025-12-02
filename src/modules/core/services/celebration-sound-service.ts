/**
 * Celebration Sound Service Implementation
 *
 * Provides celebratory sound effects for achievements.
 * Uses Web Audio API to synthesize sounds - no external files needed.
 */

/**
 * Celebration Sound Service Interface
 */
export interface ICelebrationSoundService {
  isSupported(): boolean;
  playConfettiSound(): Promise<void>;
  setEnabledCheck(check: () => boolean): void;
  setVolumeGetter(getter: () => number): void;
  preload(): void;
}

/**
 * CelebrationSoundService implementation using Web Audio API
 * Synthesizes a pleasant celebration chime without needing external files
 */
export class CelebrationSoundService implements ICelebrationSoundService {
  private enabledCheck: (() => boolean) | null = null;
  private volumeGetter: (() => number) | null = null;
  private audioContext: AudioContext | null = null;

  /**
   * Check if Web Audio API is supported
   */
  isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined';
  }

  /**
   * Set a callback to check if sound is enabled in settings
   */
  setEnabledCheck(check: () => boolean): void {
    this.enabledCheck = check;
  }

  /**
   * Set a callback to get the current volume level
   */
  setVolumeGetter(getter: () => number): void {
    this.volumeGetter = getter;
  }

  /**
   * Initialize audio context (called on user interaction)
   */
  preload(): void {
    if (this.audioContext) return;

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('[CelebrationSound] Failed to create AudioContext:', error);
    }
  }

  /**
   * Get or create AudioContext
   */
  private getAudioContext(): AudioContext | null {
    if (!this.audioContext) {
      this.preload();
    }
    return this.audioContext;
  }

  /**
   * Play a synthesized celebration chime
   * Creates a pleasant ascending arpeggio (C-E-G-C)
   */
  async playConfettiSound(): Promise<void> {
    if (!this.isSupported()) return;

    // Check if sound is enabled
    if (this.enabledCheck && !this.enabledCheck()) {
      return;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    const volume = Math.min(1, Math.max(0, this.volumeGetter?.() ?? 0.8));
    const now = ctx.currentTime;

    // Create master gain for volume control
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume * 0.3; // Scale down to avoid being too loud
    masterGain.connect(ctx.destination);

    // Celebration chord frequencies (C major arpeggio: C5, E5, G5, C6)
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    const noteDuration = 0.12;
    const noteGap = 0.08;

    frequencies.forEach((freq, index) => {
      const startTime = now + index * (noteDuration + noteGap);
      this.playNote(ctx, masterGain, freq, startTime, noteDuration * 1.5);
    });

    // Add a final sustain chord
    const chordTime = now + frequencies.length * (noteDuration + noteGap);
    [523.25, 659.25, 783.99].forEach((freq) => {
      this.playNote(ctx, masterGain, freq, chordTime, 0.4, 0.5);
    });
  }

  /**
   * Play a single note with envelope
   */
  private playNote(
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    startTime: number,
    duration: number,
    volumeMultiplier = 1
  ): void {
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Create gain for envelope
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    // ADSR envelope
    const attackTime = 0.01;
    const decayTime = 0.1;
    const sustainLevel = 0.6 * volumeMultiplier;
    const releaseTime = duration * 0.5;

    // Attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volumeMultiplier, startTime + attackTime);

    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);

    // Release
    gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.1);
  }
}

// Singleton instance
let celebrationSoundServiceInstance: CelebrationSoundService | null = null;

/**
 * Get the CelebrationSoundService singleton instance
 */
export function getCelebrationSoundService(): CelebrationSoundService {
  if (!celebrationSoundServiceInstance) {
    celebrationSoundServiceInstance = new CelebrationSoundService();
  }
  return celebrationSoundServiceInstance;
}
