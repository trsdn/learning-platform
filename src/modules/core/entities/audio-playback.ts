/**
 * AudioPlayback Entity
 *
 * Represents the current audio playback state during a practice session.
 * This is runtime state only (not persisted to storage).
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.3 - Core Entities
 */

/**
 * Playback status values
 */
export type PlaybackStatus = 'playing' | 'paused' | 'stopped' | 'loading' | 'error';

/**
 * Audio playback state
 * Tracks current audio playback during a practice session
 */
export interface AudioPlayback {
  /** URL of currently playing/loaded audio */
  audioUrl: string | null;

  /** Current playback status */
  status: PlaybackStatus;

  /** Current playback position in seconds */
  currentTime: number;

  /** Total audio duration in seconds */
  duration: number;

  /** Whether browser has granted auto-play permission */
  autoPlayUnlocked: boolean;

  /** URL of preloaded next question's audio */
  preloadedNextUrl: string | null;

  /** Error message if status === 'error' */
  error: string | null;
}

/**
 * Initial/default playback state
 */
export const INITIAL_PLAYBACK_STATE: AudioPlayback = {
  audioUrl: null,
  status: 'stopped',
  currentTime: 0,
  duration: 0,
  autoPlayUnlocked: false,
  preloadedNextUrl: null,
  error: null,
};

/**
 * Validate audio playback state
 * @throws Error if validation fails
 */
export function validateAudioPlayback(state: unknown): AudioPlayback {
  const s = state as Partial<AudioPlayback>;

  const validStatuses: PlaybackStatus[] = ['playing', 'paused', 'stopped', 'loading', 'error'];
  if (!validStatuses.includes(s.status as PlaybackStatus)) {
    throw new Error(`Invalid status: ${s.status}`);
  }

  if (s.currentTime !== undefined && (s.currentTime < 0 || !isFinite(s.currentTime))) {
    throw new Error('currentTime must be non-negative finite number');
  }

  if (s.duration !== undefined && (s.duration < 0 || !isFinite(s.duration))) {
    throw new Error('duration must be non-negative finite number');
  }

  if (s.currentTime !== undefined && s.duration !== undefined && s.currentTime > s.duration) {
    throw new Error('currentTime cannot exceed duration');
  }

  if (s.status === 'error' && !s.error) {
    throw new Error('error message required when status is error');
  }

  if (s.status === 'playing' && !s.audioUrl) {
    throw new Error('audioUrl required when status is playing');
  }

  return s as AudioPlayback;
}

/**
 * Check if playback state allows play/pause toggle
 */
export function canTogglePlayback(state: AudioPlayback): boolean {
  return state.status === 'playing' || state.status === 'paused';
}

/**
 * Check if playback state allows replay
 */
export function canReplay(state: AudioPlayback): boolean {
  return state.audioUrl !== null && state.status !== 'loading';
}
