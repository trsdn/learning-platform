/**
 * AudioService Contract Tests
 *
 * These tests validate the IAudioService interface contract.
 * CRITICAL: These tests MUST FAIL initially (no implementation exists yet).
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.2 - TDD (Test-Driven Development)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAudioService, type IAudioService } from '../../../src/modules/core/services/audio-service';
import type { AudioSettings } from '../../../src/modules/core/entities/audio-settings';
import type { Task } from '../../../src/modules/core/types/services';

describe('AudioService (Contract Tests)', () => {
  let audioService: IAudioService;

  // Mock HTMLAudioElement
  const mockAudio = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    duration: 0,
    src: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockAudio.currentTime = 0;
    mockAudio.duration = 0;
    mockAudio.src = '';

    // Mock global Audio constructor
    global.Audio = vi.fn().mockImplementation(() => mockAudio) as any;

    // Create service instance (will fail until implementation exists)
    audioService = createAudioService();
  });

  afterEach(() => {
    audioService?.dispose();
  });

  describe('Interface Implementation', () => {
    it('should implement all required IAudioService methods', () => {
      expect(audioService.initialize).toBeDefined();
      expect(audioService.loadAudio).toBeDefined();
      expect(audioService.play).toBeDefined();
      expect(audioService.pause).toBeDefined();
      expect(audioService.stop).toBeDefined();
      expect(audioService.replay).toBeDefined();
      expect(audioService.togglePlayPause).toBeDefined();
      expect(audioService.preloadNext).toBeDefined();
      expect(audioService.checkAutoPlayPermission).toBeDefined();
      expect(audioService.unlockAutoPlay).toBeDefined();
      expect(audioService.getPlaybackState).toBeDefined();
      expect(audioService.onStateChange).toBeDefined();
      expect(audioService.dispose).toBeDefined();
    });

    it('should have methods with correct signatures', () => {
      expect(typeof audioService.initialize).toBe('function');
      expect(typeof audioService.loadAudio).toBe('function');
      expect(typeof audioService.play).toBe('function');
      expect(typeof audioService.pause).toBe('function');
      expect(typeof audioService.stop).toBe('function');
      expect(typeof audioService.replay).toBe('function');
      expect(typeof audioService.togglePlayPause).toBe('function');
      expect(typeof audioService.preloadNext).toBe('function');
      expect(typeof audioService.checkAutoPlayPermission).toBe('function');
      expect(typeof audioService.unlockAutoPlay).toBe('function');
      expect(typeof audioService.getPlaybackState).toBe('function');
      expect(typeof audioService.onStateChange).toBe('function');
      expect(typeof audioService.dispose).toBe('function');
    });
  });

  describe('initialize()', () => {
    it('should initialize without errors', async () => {
      await expect(audioService.initialize()).resolves.not.toThrow();
    });

    it('should be callable before other methods', async () => {
      await audioService.initialize();
      const state = audioService.getPlaybackState();
      expect(state).toBeDefined();
    });
  });

  describe('loadAudio()', () => {
    const mockTask: Task = {
      id: 'test-task-1',
      type: 'vocabulary',
      question: '¿Cómo estás?',
      answer: 'How are you?',
      difficulty: 'beginner',
      hasAudio: true,
      audioUrl: '/audio/spanish/como-estas.mp3',
      language: 'Spanish',
    } as any;

    const mockSettings: AudioSettings = {
      version: 1,
      autoPlayEnabled: true,
      languageFilter: 'non-German only',
      perTopicOverrides: {},
      accessibilityMode: false,
    };

    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should load audio without auto-play', async () => {
      await expect(
        audioService.loadAudio(mockTask, mockSettings, false)
      ).resolves.not.toThrow();
    });

    it('should load audio with auto-play enabled', async () => {
      await expect(
        audioService.loadAudio(mockTask, mockSettings, true)
      ).resolves.not.toThrow();
    });

    it('should auto-play after 500ms delay when autoPlay=true', async () => {
      // First unlock auto-play
      await audioService.unlockAutoPlay();

      const startTime = Date.now();
      await audioService.loadAudio(mockTask, mockSettings, true);

      // Wait for auto-play delay + a bit extra
      await new Promise(resolve => setTimeout(resolve, 600));

      const elapsed = Date.now() - startTime;

      // Should wait at least 500ms before playing
      expect(elapsed).toBeGreaterThanOrEqual(500);

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('playing');
    });

    it('should NOT auto-play when autoPlay=false', async () => {
      await audioService.loadAudio(mockTask, mockSettings, false);

      const state = audioService.getPlaybackState();
      expect(state.status).not.toBe('playing');
    });

    it('should update playback state with correct audioUrl', async () => {
      await audioService.loadAudio(mockTask, mockSettings, false);

      const state = audioService.getPlaybackState();
      expect(state.audioUrl).toBe('/audio/spanish/como-estas.mp3');
    });
  });

  describe('play()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should throw error if no audio loaded', async () => {
      await expect(audioService.play()).rejects.toThrow('No audio loaded');
    });

    it('should play loaded audio', async () => {
      const mockTask: Task = {
        id: 'test-task-1',
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
        language: 'Spanish',
      } as any;

      const mockSettings: AudioSettings = {
        autoPlayEnabled: false,
        languageFilter: 'non-German only',
      } as any;

      await audioService.loadAudio(mockTask, mockSettings, false);
      await audioService.play();

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('playing');
    });

    it('should update playback status to playing', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
        language: 'Spanish',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();

      expect(audioService.getPlaybackState().status).toBe('playing');
    });
  });

  describe('pause()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should pause playing audio', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
        language: 'Spanish',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();
      audioService.pause();

      expect(audioService.getPlaybackState().status).toBe('paused');
    });

    it('should preserve currentTime when paused', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();

      // Simulate some playback
      mockAudio.currentTime = 1.5;

      audioService.pause();

      const state = audioService.getPlaybackState();
      expect(state.currentTime).toBe(1.5);
    });
  });

  describe('stop()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should stop audio and reset position', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();

      mockAudio.currentTime = 2.0;

      audioService.stop();

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('stopped');
      expect(state.currentTime).toBe(0);
    });
  });

  describe('replay()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should replay from beginning', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();

      mockAudio.currentTime = 2.5;

      await audioService.replay();

      const state = audioService.getPlaybackState();
      expect(state.currentTime).toBe(0);
      expect(state.status).toBe('playing');
    });
  });

  describe('togglePlayPause()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should toggle from playing to paused', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();

      expect(audioService.getPlaybackState().status).toBe('playing');

      await audioService.togglePlayPause();

      expect(audioService.getPlaybackState().status).toBe('paused');
    });

    it('should toggle from paused to playing', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();
      audioService.pause();

      expect(audioService.getPlaybackState().status).toBe('paused');

      await audioService.togglePlayPause();

      expect(audioService.getPlaybackState().status).toBe('playing');
    });
  });

  describe('preloadNext()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should preload next task audio', () => {
      const nextTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/spanish/next.mp3',
      } as any;

      expect(() => audioService.preloadNext(nextTask)).not.toThrow();
    });

    it('should update preloadedNextUrl in state', () => {
      const nextTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/spanish/next.mp3',
      } as any;

      audioService.preloadNext(nextTask);

      const state = audioService.getPlaybackState();
      expect(state.preloadedNextUrl).toBe('/audio/spanish/next.mp3');
    });
  });

  describe('checkAutoPlayPermission()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should return boolean indicating auto-play permission', async () => {
      const result = await audioService.checkAutoPlayPermission();
      expect(typeof result).toBe('boolean');
    });

    it('should return true when auto-play is allowed', async () => {
      mockAudio.play.mockResolvedValue(undefined);
      const result = await audioService.checkAutoPlayPermission();
      expect(result).toBe(true);
    });

    it('should return false when auto-play is blocked', async () => {
      const error = new Error('NotAllowedError');
      error.name = 'NotAllowedError';
      mockAudio.play.mockRejectedValue(error);

      const result = await audioService.checkAutoPlayPermission();
      expect(result).toBe(false);
    });
  });

  describe('unlockAutoPlay()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should return true when unlock succeeds', async () => {
      mockAudio.play.mockResolvedValue(undefined);
      const result = await audioService.unlockAutoPlay();
      expect(result).toBe(true);
    });

    it('should update autoPlayUnlocked flag', async () => {
      await audioService.unlockAutoPlay();
      const state = audioService.getPlaybackState();
      expect(state.autoPlayUnlocked).toBe(true);
    });
  });

  describe('getPlaybackState()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should return current playback state', () => {
      const state = audioService.getPlaybackState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('audioUrl');
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('currentTime');
      expect(state).toHaveProperty('duration');
      expect(state).toHaveProperty('autoPlayUnlocked');
      expect(state).toHaveProperty('preloadedNextUrl');
    });

    it('should have valid initial state', () => {
      const state = audioService.getPlaybackState();
      expect(state.audioUrl).toBeNull();
      expect(state.status).toBe('stopped');
      expect(state.currentTime).toBe(0);
      expect(state.duration).toBe(0);
      expect(state.autoPlayUnlocked).toBe(false);
      expect(state.preloadedNextUrl).toBeNull();
    });
  });

  describe('onStateChange()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should call callback when state changes', async () => {
      const callback = vi.fn();
      audioService.onStateChange(callback);

      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);

      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = audioService.onStateChange(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should stop calling callback after unsubscribe', async () => {
      const callback = vi.fn();
      const unsubscribe = audioService.onStateChange(callback);

      unsubscribe();

      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('dispose()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should cleanup resources without errors', () => {
      expect(() => audioService.dispose()).not.toThrow();
    });

    it('should stop playback when disposed', async () => {
      const mockTask: Task = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      } as any;

      await audioService.loadAudio(mockTask, {} as any, false);
      await audioService.play();

      audioService.dispose();

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('stopped');
    });
  });
});
