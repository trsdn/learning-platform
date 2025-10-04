/**
 * Audio Service Contract
 *
 * Defines the public interface for the audio playback service.
 * This contract must be satisfied by the AudioService implementation.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Date: 2025-10-04
 */

import type { AudioSettings } from '../../../src/modules/core/entities/audio-settings';
import type { AudioPlayback } from '../../../src/modules/core/entities/audio-playback';
import type { Task } from '../../../src/modules/core/entities/task';

/**
 * Audio Service Interface
 *
 * Responsibilities:
 * - Manage audio playback lifecycle (load, play, pause, stop, replay)
 * - Handle browser auto-play policy detection and unlocking
 * - Preload next question's audio for smooth transitions
 * - Respect user settings for auto-play behavior
 * - Provide playback state updates via callbacks/events
 */
export interface IAudioService {
  /**
   * Initialize the audio service
   * Must be called before any other methods
   *
   * @throws {Error} If initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Load and optionally auto-play audio for a task
   *
   * @param task - The task with audio to play
   * @param settings - User audio settings
   * @param autoPlay - Whether to auto-play (respects browser policies)
   * @returns Promise that resolves when audio is loaded (not necessarily playing)
   *
   * @example
   * await audioService.loadAudio(spanishTask, settings, true);
   * // Audio starts playing after 500ms delay (if auto-play unlocked)
   */
  loadAudio(task: Task, settings: AudioSettings, autoPlay: boolean): Promise<void>;

  /**
   * Play the currently loaded audio
   *
   * @throws {Error} If no audio is loaded
   * @returns Promise that resolves when playback starts
   *
   * @example
   * await audioService.play();
   */
  play(): Promise<void>;

  /**
   * Pause the currently playing audio
   * Preserves current playback position
   *
   * @example
   * audioService.pause();
   */
  pause(): void;

  /**
   * Stop audio and reset playback position to 0
   *
   * @example
   * audioService.stop();
   */
  stop(): void;

  /**
   * Replay audio from the beginning
   * Equivalent to: stop() + play()
   *
   * @returns Promise that resolves when playback starts
   *
   * @example
   * await audioService.replay();
   */
  replay(): Promise<void>;

  /**
   * Toggle between play and pause states
   *
   * @returns Promise that resolves when state transition completes
   *
   * @example
   * // If playing → pause
   * // If paused → play
   * await audioService.togglePlayPause();
   */
  togglePlayPause(): Promise<void>;

  /**
   * Preload audio for the next task
   * Does not start playback
   *
   * @param nextTask - The upcoming task with audio
   *
   * @example
   * audioService.preloadNext(nextTask);
   * // Audio file starts downloading in background
   */
  preloadNext(nextTask: Task): void;

  /**
   * Check if browser allows auto-play
   * Attempts a silent audio play to test policy
   *
   * @returns Promise resolving to true if auto-play is allowed
   *
   * @example
   * const canAutoPlay = await audioService.checkAutoPlayPermission();
   * if (!canAutoPlay) {
   *   showNotification('Click anywhere to enable audio auto-play');
   * }
   */
  checkAutoPlayPermission(): Promise<boolean>;

  /**
   * Unlock auto-play after user interaction
   * Must be called from a user gesture event handler
   *
   * @returns Promise resolving to true if unlock succeeded
   *
   * @example
   * button.addEventListener('click', async () => {
   *   const unlocked = await audioService.unlockAutoPlay();
   *   if (unlocked) {
   *     console.log('Auto-play enabled');
   *   }
   * });
   */
  unlockAutoPlay(): Promise<boolean>;

  /**
   * Get current playback state
   *
   * @returns Current AudioPlayback state
   *
   * @example
   * const state = audioService.getPlaybackState();
   * console.log(`Playing: ${state.audioUrl}, Position: ${state.currentTime}s`);
   */
  getPlaybackState(): AudioPlayback;

  /**
   * Subscribe to playback state changes
   *
   * @param callback - Function called when state changes
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = audioService.onStateChange((newState) => {
   *   console.log('Playback status:', newState.status);
   * });
   *
   * // Later: unsubscribe()
   */
  onStateChange(callback: (state: AudioPlayback) => void): () => void;

  /**
   * Cleanup resources and stop playback
   * Should be called when component unmounts
   *
   * @example
   * useEffect(() => {
   *   return () => audioService.dispose();
   * }, []);
   */
  dispose(): void;
}

/**
 * Audio Service Factory
 * Creates a new instance of the audio service
 */
export function createAudioService(): IAudioService {
  throw new Error('Not implemented - to be implemented in Phase 3');
}
