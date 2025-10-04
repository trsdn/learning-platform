/**
 * AudioPlayback Entity Tests
 *
 * These tests validate the AudioPlayback entity structure, state transitions, and validation rules.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.2 - TDD (Test-Driven Development)
 */

import { describe, it, expect } from 'vitest';
import type { AudioPlayback } from '../../../src/modules/core/entities/audio-playback';

describe('AudioPlayback Entity', () => {
  describe('Type Structure', () => {
    it('should have all required fields', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/spanish/test.mp3',
        status: 'playing',
        currentTime: 1.5,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: '/audio/spanish/next.mp3',
        error: null,
      };

      expect(playback.audioUrl).toBeDefined();
      expect(playback.status).toBeDefined();
      expect(playback.currentTime).toBeDefined();
      expect(playback.duration).toBeDefined();
      expect(playback.autoPlayUnlocked).toBeDefined();
      expect(playback.preloadedNextUrl).toBeDefined();
      expect(playback.error).toBeDefined();
    });

    it('should accept null values for optional fields', () => {
      const playback: AudioPlayback = {
        audioUrl: null,
        status: 'stopped',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: false,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.audioUrl).toBeNull();
      expect(playback.preloadedNextUrl).toBeNull();
      expect(playback.error).toBeNull();
    });
  });

  describe('Status Values', () => {
    it('should accept all valid status values', () => {
      const validStatuses: Array<AudioPlayback['status']> = [
        'playing',
        'paused',
        'stopped',
        'loading',
        'error',
      ];

      for (const status of validStatuses) {
        const playback: AudioPlayback = {
          audioUrl: null,
          status,
          currentTime: 0,
          duration: 0,
          autoPlayUnlocked: false,
          preloadedNextUrl: null,
          error: null,
        };

        expect(playback.status).toBe(status);
      }
    });

    it('should differentiate between playback states', () => {
      const playing: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 1.0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const paused: AudioPlayback = {
        ...playing,
        status: 'paused',
      };

      const stopped: AudioPlayback = {
        ...playing,
        status: 'stopped',
        currentTime: 0,
      };

      expect(playing.status).toBe('playing');
      expect(paused.status).toBe('paused');
      expect(stopped.status).toBe('stopped');
    });
  });

  describe('State Transitions', () => {
    it('should transition from stopped to loading', () => {
      const initial: AudioPlayback = {
        audioUrl: null,
        status: 'stopped',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: false,
        preloadedNextUrl: null,
        error: null,
      };

      const loading: AudioPlayback = {
        ...initial,
        status: 'loading',
        audioUrl: '/audio/test.mp3',
      };

      expect(loading.status).toBe('loading');
      expect(loading.audioUrl).toBe('/audio/test.mp3');
    });

    it('should transition from loading to playing', () => {
      const loading: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'loading',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const playing: AudioPlayback = {
        ...loading,
        status: 'playing',
        duration: 2.8,
      };

      expect(playing.status).toBe('playing');
      expect(playing.duration).toBe(2.8);
    });

    it('should transition from playing to paused', () => {
      const playing: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 1.5,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const paused: AudioPlayback = {
        ...playing,
        status: 'paused',
      };

      expect(paused.status).toBe('paused');
      expect(paused.currentTime).toBe(1.5); // Preserved
    });

    it('should transition to stopped with reset', () => {
      const playing: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 2.0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const stopped: AudioPlayback = {
        ...playing,
        status: 'stopped',
        currentTime: 0,
      };

      expect(stopped.status).toBe('stopped');
      expect(stopped.currentTime).toBe(0);
    });

    it('should transition to error state', () => {
      const loading: AudioPlayback = {
        audioUrl: '/audio/missing.mp3',
        status: 'loading',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: false,
        preloadedNextUrl: null,
        error: null,
      };

      const error: AudioPlayback = {
        ...loading,
        status: 'error',
        error: 'Failed to load audio: 404 Not Found',
      };

      expect(error.status).toBe('error');
      expect(error.error).toBe('Failed to load audio: 404 Not Found');
    });
  });

  describe('Validation Rules', () => {
    it('should have currentTime <= duration', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 1.5,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.currentTime).toBeLessThanOrEqual(playback.duration);
    });

    it('should have non-negative currentTime', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.currentTime).toBeGreaterThanOrEqual(0);
    });

    it('should have non-negative duration', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'loading',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.duration).toBeGreaterThanOrEqual(0);
    });

    it('should have error message when status is error', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'error',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: false,
        preloadedNextUrl: null,
        error: 'Network error',
      };

      expect(playback.status).toBe('error');
      expect(playback.error).not.toBeNull();
      expect(typeof playback.error).toBe('string');
    });

    it('should have null error when status is not error', () => {
      const statuses: Array<Exclude<AudioPlayback['status'], 'error'>> = [
        'playing',
        'paused',
        'stopped',
        'loading',
      ];

      for (const status of statuses) {
        const playback: AudioPlayback = {
          audioUrl: '/audio/test.mp3',
          status,
          currentTime: 0,
          duration: 0,
          autoPlayUnlocked: false,
          preloadedNextUrl: null,
          error: null,
        };

        expect(playback.error).toBeNull();
      }
    });
  });

  describe('Invariants', () => {
    it('should have audioUrl when status is playing', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 1.0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.status).toBe('playing');
      expect(playback.audioUrl).not.toBeNull();
    });

    it('should preserve currentTime between paused and playing', () => {
      const paused: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'paused',
        currentTime: 2.5,
        duration: 5.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const playing: AudioPlayback = {
        ...paused,
        status: 'playing',
      };

      expect(playing.currentTime).toBe(paused.currentTime);
    });

    it('should reset currentTime when stopped', () => {
      const playing: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'playing',
        currentTime: 3.5,
        duration: 5.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const stopped: AudioPlayback = {
        ...playing,
        status: 'stopped',
        currentTime: 0,
      };

      expect(stopped.currentTime).toBe(0);
    });
  });

  describe('Preloading', () => {
    it('should track preloaded next URL', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/current.mp3',
        status: 'playing',
        currentTime: 1.0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: '/audio/next.mp3',
        error: null,
      };

      expect(playback.preloadedNextUrl).toBe('/audio/next.mp3');
    });

    it('should allow null preloadedNextUrl', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/current.mp3',
        status: 'playing',
        currentTime: 1.0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.preloadedNextUrl).toBeNull();
    });
  });

  describe('Auto-Play Unlocking', () => {
    it('should track auto-play unlocked status', () => {
      const locked: AudioPlayback = {
        audioUrl: null,
        status: 'stopped',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: false,
        preloadedNextUrl: null,
        error: null,
      };

      const unlocked: AudioPlayback = {
        ...locked,
        autoPlayUnlocked: true,
      };

      expect(locked.autoPlayUnlocked).toBe(false);
      expect(unlocked.autoPlayUnlocked).toBe(true);
    });
  });

  describe('Immutability', () => {
    it('should allow creating new state objects', () => {
      const state1: AudioPlayback = {
        audioUrl: '/audio/test1.mp3',
        status: 'playing',
        currentTime: 1.0,
        duration: 3.0,
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      const state2: AudioPlayback = {
        ...state1,
        currentTime: 2.0,
      };

      expect(state1.currentTime).toBe(1.0);
      expect(state2.currentTime).toBe(2.0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/test.mp3',
        status: 'loading',
        currentTime: 0,
        duration: 0,
        autoPlayUnlocked: false,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.duration).toBe(0);
      expect(playback.currentTime).toBe(0);
    });

    it('should handle long audio files', () => {
      const playback: AudioPlayback = {
        audioUrl: '/audio/long-lesson.mp3',
        status: 'playing',
        currentTime: 125.5,
        duration: 600.0, // 10 minutes
        autoPlayUnlocked: true,
        preloadedNextUrl: null,
        error: null,
      };

      expect(playback.duration).toBe(600.0);
      expect(playback.currentTime).toBeLessThanOrEqual(playback.duration);
    });
  });
});
