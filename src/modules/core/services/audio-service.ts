/**
 * Audio Service Implementation
 *
 * Manages audio playback lifecycle for language learning tasks.
 * Handles browser auto-play policies, preloading, and state management.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.5 - Audio Service
 */

import type { Task } from '../types/services';
import type { AudioSettings } from '../entities/audio-settings';
import type { AudioPlayback } from '../entities/audio-playback';
import { INITIAL_PLAYBACK_STATE } from '../entities/audio-playback';

const AUTO_PLAY_DELAY_MS = 500;
const MAX_AUDIO_URL_LENGTH = 2048; // Maximum URL length for security
const MIN_PLAY_INTERVAL_MS = 100; // Minimum time between play() calls (rate limiting)

/**
 * Audio Service Interface
 */
export interface IAudioService {
  initialize(): Promise<void>;
  loadAudio(task: Task, settings: AudioSettings, autoPlay: boolean): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  replay(): Promise<void>;
  togglePlayPause(): Promise<void>;
  preloadNext(nextTask: Task): void;
  checkAutoPlayPermission(): Promise<boolean>;
  unlockAutoPlay(): Promise<boolean>;
  getPlaybackState(): AudioPlayback;
  onStateChange(callback: (state: AudioPlayback) => void): () => void;
  dispose(): void;
}

/**
 * AudioService implementation using HTMLAudioElement
 */
class AudioService implements IAudioService {
  private audio: HTMLAudioElement | null = null;
  private state: AudioPlayback = { ...INITIAL_PLAYBACK_STATE };
  private stateListeners: Set<(state: AudioPlayback) => void> = new Set();
  private preloadedAudio: HTMLAudioElement | null = null;
  private autoPlayTimer: number | null = null;
  private lastPlayTime: number = 0; // For rate limiting

  async initialize(): Promise<void> {
    // Service is ready to use
    this.setState({ ...INITIAL_PLAYBACK_STATE });
  }

  async loadAudio(task: Task, _settings: AudioSettings, autoPlay: boolean): Promise<void> {
    // Stop and cleanup previous audio
    this.stop();
    this.clearAutoPlayTimer();

    if (!task.audioUrl) {
      throw new Error('Task does not have an audio URL');
    }

    // Validate audio URL
    const validatedUrl = this.validateAudioUrl(task.audioUrl);
    if (!validatedUrl) {
      throw new Error('Invalid audio URL');
    }

    // Create new audio element
    this.audio = new Audio(task.audioUrl);

    // Set initial state
    this.setState({
      audioUrl: task.audioUrl,
      status: 'loading',
      currentTime: 0,
      duration: 0,
      autoPlayUnlocked: this.state.autoPlayUnlocked,
      preloadedNextUrl: this.state.preloadedNextUrl,
      error: null,
    });

    // Setup event listeners
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.setState({
          ...this.state,
          duration: this.audio.duration,
          status: 'stopped',
        });
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && this.state.status === 'playing') {
        this.setState({
          ...this.state,
          currentTime: this.audio.currentTime,
        });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.setState({
        ...this.state,
        status: 'stopped',
        currentTime: 0,
      });
    });

    this.audio.addEventListener('error', (e) => {
      this.setState({
        ...this.state,
        status: 'error',
        error: `Failed to load audio: ${e.message || 'Unknown error'}`,
      });
    });

    // Load the audio
    this.audio.load();

    // Auto-play if requested and unlocked
    if (autoPlay && this.state.autoPlayUnlocked) {
      this.autoPlayTimer = window.setTimeout(async () => {
        try {
          await this.play();
        } catch (error) {
          console.error('Auto-play failed:', error);
        }
      }, AUTO_PLAY_DELAY_MS);
    }
  }

  async play(): Promise<void> {
    if (!this.audio) {
      throw new Error('No audio loaded');
    }

    // Rate limiting: prevent rapid successive play() calls
    const now = Date.now();
    const timeSinceLastPlay = now - this.lastPlayTime;
    if (timeSinceLastPlay < MIN_PLAY_INTERVAL_MS) {
      console.warn('Rate limit: Too many play() calls. Please wait.');
      return;
    }
    this.lastPlayTime = now;

    try {
      await this.audio.play();
      this.setState({
        ...this.state,
        status: 'playing',
      });
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        this.setState({
          ...this.state,
          status: 'error',
          error: 'Auto-play blocked by browser. Please click to enable audio.',
        });
      }
      throw error;
    }
  }

  pause(): void {
    if (!this.audio) {
      return;
    }

    this.audio.pause();
    this.setState({
      ...this.state,
      status: 'paused',
      currentTime: this.audio.currentTime,
    });
  }

  stop(): void {
    if (!this.audio) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
    this.setState({
      ...this.state,
      status: 'stopped',
      currentTime: 0,
    });
  }

  async replay(): Promise<void> {
    if (!this.audio) {
      throw new Error('No audio loaded');
    }

    this.audio.currentTime = 0;
    await this.play();
  }

  async togglePlayPause(): Promise<void> {
    if (this.state.status === 'playing') {
      this.pause();
    } else if (this.state.status === 'paused' || this.state.status === 'stopped') {
      await this.play();
    }
  }

  preloadNext(nextTask: Task): void {
    if (!nextTask.audioUrl) {
      return;
    }

    // Create preload audio element
    this.preloadedAudio = new Audio(nextTask.audioUrl);
    this.preloadedAudio.preload = 'auto';

    this.setState({
      ...this.state,
      preloadedNextUrl: nextTask.audioUrl,
    });
  }

  async checkAutoPlayPermission(): Promise<boolean> {
    // Return current unlock status
    // Auto-play permission will be validated on actual play attempt
    return this.state.autoPlayUnlocked;
  }

  async unlockAutoPlay(): Promise<boolean> {
    // Simply mark as unlocked - will be validated on first actual play attempt
    // This avoids CSP issues with data URIs
    this.setState({
      ...this.state,
      autoPlayUnlocked: true,
    });

    return true;
  }

  getPlaybackState(): AudioPlayback {
    return { ...this.state };
  }

  onStateChange(callback: (state: AudioPlayback) => void): () => void {
    this.stateListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  dispose(): void {
    this.clearAutoPlayTimer();

    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }

    if (this.preloadedAudio) {
      this.preloadedAudio.src = '';
      this.preloadedAudio = null;
    }

    this.setState({
      ...INITIAL_PLAYBACK_STATE,
    });

    this.stateListeners.clear();
  }

  // Private helpers

  private setState(newState: AudioPlayback): void {
    this.state = newState;

    // Notify all listeners
    this.stateListeners.forEach((listener) => {
      listener(newState);
    });
  }

  private clearAutoPlayTimer(): void {
    if (this.autoPlayTimer !== null) {
      window.clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  /**
   * Validate audio URL for security
   * Only allows /audio/ paths and data URIs for testing
   */
  private validateAudioUrl(url: string): boolean {
    // Check length
    if (url.length > MAX_AUDIO_URL_LENGTH) {
      console.warn('Audio URL exceeds maximum length');
      return false;
    }

    // Only allow /audio/ paths (relative URLs) or data URIs (for testing)
    if (url.startsWith('/audio/') || url.startsWith('data:audio/')) {
      return true;
    }

    console.warn('Audio URL must start with /audio/ or data:audio/', url);
    return false;
  }
}

/**
 * Factory function to create audio service instance
 */
export function createAudioService(): IAudioService {
  return new AudioService();
}

/**
 * Legacy singleton export for backward compatibility
 * @deprecated Use createAudioService() instead
 */
export const audioService = {
  hasAudio: () => false,
  playSpanish: async () => {},
  initialize: async () => {},
} as any;
