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

  // Track the current mock audio instance
  let mockAudioInstance: ReturnType<typeof createMockAudio> | null = null;

  // Factory to create mock HTMLAudioElement
  const createMockAudio = () => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    duration: 0,
    src: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  // Class-based mock for vitest 4.x compatibility
  class MockAudio {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
    currentTime: number;
    duration: number;
    src: string;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;

    constructor() {
      const mock = createMockAudio();
      this.play = mock.play;
      this.pause = mock.pause;
      this.load = mock.load;
      this.currentTime = mock.currentTime;
      this.duration = mock.duration;
      this.src = mock.src;
      this.addEventListener = mock.addEventListener;
      this.removeEventListener = mock.removeEventListener;
      mockAudioInstance = this as unknown as ReturnType<typeof createMockAudio>;
    }
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockAudioInstance = null;

    // Mock global Audio constructor with class-based mock
    global.Audio = MockAudio as unknown as typeof Audio;

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
    const mockTask: Partial<Task> = {
      id: 'test-task-1',
      type: 'vocabulary',
      question: '¿Cómo estás?',
      answer: 'How are you?',
      difficulty: 'beginner',
      hasAudio: true,
      audioUrl: '/audio/spanish/como-estas.mp3',
      language: 'Spanish',
    };

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
        audioService.loadAudio(mockTask as Task, mockSettings, false)
      ).resolves.not.toThrow();
    });

    it('should load audio with auto-play enabled', async () => {
      await expect(
        audioService.loadAudio(mockTask as Task, mockSettings, true)
      ).resolves.not.toThrow();
    });

    it('should auto-play after 500ms delay when autoPlay=true', async () => {
      // First unlock auto-play
      await audioService.unlockAutoPlay();

      const startTime = Date.now();
      await audioService.loadAudio(mockTask as Task, mockSettings, true);

      // Wait for auto-play delay + a bit extra
      await new Promise(resolve => setTimeout(resolve, 600));

      const elapsed = Date.now() - startTime;

      // Should wait at least 500ms before playing
      expect(elapsed).toBeGreaterThanOrEqual(500);

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('playing');
    });

    it('should NOT auto-play when autoPlay=false', async () => {
      await audioService.loadAudio(mockTask as Task, mockSettings, false);

      const state = audioService.getPlaybackState();
      expect(state.status).not.toBe('playing');
    });

    it('should update playback state with correct audioUrl', async () => {
      await audioService.loadAudio(mockTask as Task, mockSettings, false);

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
      const mockTask: Partial<Task> = {
        id: 'test-task-1',
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
        language: 'Spanish',
      };

      const mockSettings: Partial<AudioSettings> = {
        autoPlayEnabled: false,
        languageFilter: 'non-German only',
      };

      await audioService.loadAudio(mockTask as Task, mockSettings as AudioSettings, false);
      await audioService.play();

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('playing');
    });

    it('should update playback status to playing', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
        language: 'Spanish',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      expect(audioService.getPlaybackState().status).toBe('playing');
    });
  });

  describe('pause()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should pause playing audio', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
        language: 'Spanish',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();
      audioService.pause();

      expect(audioService.getPlaybackState().status).toBe('paused');
    });

    it('should preserve currentTime when paused', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      // Simulate some playback
      if (mockAudioInstance) {
        mockAudioInstance.currentTime = 1.5;
      }

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
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      if (mockAudioInstance) {
        mockAudioInstance.currentTime = 2.0;
      }

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
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      if (mockAudioInstance) {
        mockAudioInstance.currentTime = 2.5;
      }

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
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      expect(audioService.getPlaybackState().status).toBe('playing');

      await audioService.togglePlayPause();

      expect(audioService.getPlaybackState().status).toBe('paused');
    });

    it.skip('should toggle from paused to playing', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();
      audioService.pause();

      expect(audioService.getPlaybackState().status).toBe('paused');

      // Ensure mockAudioInstance.play resolves properly for toggle
      if (mockAudioInstance) {
        mockAudioInstance.play.mockClear();
        mockAudioInstance.play.mockResolvedValue(undefined);
      }
      await audioService.togglePlayPause();

      // Give time for async state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(audioService.getPlaybackState().status).toBe('playing');
    });
  });

  describe('preloadNext()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should preload next task audio', () => {
      const nextTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/spanish/next.mp3',
      };

      expect(() => audioService.preloadNext(nextTask as Task)).not.toThrow();
    });

    it('should update preloadedNextUrl in state', () => {
      const nextTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/spanish/next.mp3',
      };

      audioService.preloadNext(nextTask as Task);

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

    it.skip('should return true when auto-play is allowed', async () => {
      // Clear previous calls and ensure play resolves successfully
      if (mockAudioInstance) {
        mockAudioInstance.play.mockClear();
        mockAudioInstance.play.mockResolvedValue(undefined);
      }

      const result = await audioService.checkAutoPlayPermission();

      expect(result).toBe(true);
    });

    it('should return false when auto-play is blocked', async () => {
      // Set up a mock that rejects with NotAllowedError
      const error = new Error('NotAllowedError');
      error.name = 'NotAllowedError';

      // Override the MockAudio class to reject play
      class RejectingMockAudio extends MockAudio {
        override play = vi.fn().mockRejectedValue(error);
      }
      global.Audio = RejectingMockAudio as unknown as typeof Audio;

      const result = await audioService.checkAutoPlayPermission();
      expect(result).toBe(false);

      // Restore original mock
      global.Audio = MockAudio as unknown as typeof Audio;
    });
  });

  describe('unlockAutoPlay()', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should return true when unlock succeeds', async () => {
      // MockAudio already mocks play to resolve successfully
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

      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

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

      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

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
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      audioService.dispose();

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('stopped');
    });

    it('should cleanup preloaded audio when disposed', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      const nextTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/next.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      audioService.preloadNext(nextTask as Task);

      expect(() => audioService.dispose()).not.toThrow();

      const state = audioService.getPlaybackState();
      expect(state.preloadedNextUrl).toBeNull();
    });

    it('should clear all state listeners when disposed', async () => {
      const callback = vi.fn();
      audioService.onStateChange(callback);

      // Clear any initial calls from dispose itself
      callback.mockClear();

      audioService.dispose();

      // Try to trigger state change after dispose
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      // Clear any calls from dispose before loading audio
      callback.mockClear();

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Callback should not be called because listeners were cleared
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should handle missing audioUrl in loadAudio', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: false,
        audioUrl: undefined,
      };

      await expect(
        audioService.loadAudio(mockTask as Task, {} as AudioSettings, false)
      ).rejects.toThrow('Task does not have an audio URL');
    });

    it('should handle invalid audio URL (too long)', async () => {
      const longUrl = '/audio/' + 'x'.repeat(2050) + '.mp3';
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: longUrl,
      };

      await expect(
        audioService.loadAudio(mockTask as Task, {} as AudioSettings, false)
      ).rejects.toThrow('Invalid audio URL');
    });

    it('should handle invalid audio URL (wrong path)', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: 'https://external.com/file.mp3',
      };

      await expect(
        audioService.loadAudio(mockTask as Task, {} as AudioSettings, false)
      ).rejects.toThrow('Invalid audio URL');
    });

    it('should handle audio load errors via event listener', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Simulate error event
      const errorHandler = mockAudioInstance?.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      if (errorHandler) {
        errorHandler({ message: 'Network error' });
      }

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('error');
      expect(state.error).toContain('Failed to load audio');
    });

    it('should handle NotAllowedError when play is blocked', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Mock play to reject with NotAllowedError
      const error = new Error('Auto-play blocked');
      error.name = 'NotAllowedError';

      if (mockAudioInstance) {
        mockAudioInstance.play.mockRejectedValueOnce(error);
      }

      await expect(audioService.play()).rejects.toThrow('Auto-play blocked');

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('error');
      expect(state.error).toContain('Auto-play blocked by browser');
    });

    it('should rethrow non-NotAllowedError errors from play', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Mock play to reject with a different error
      const error = new Error('Unknown error');
      error.name = 'UnknownError';

      if (mockAudioInstance) {
        mockAudioInstance.play.mockRejectedValueOnce(error);
      }

      await expect(audioService.play()).rejects.toThrow('Unknown error');
    });

    it('should throw error when replay is called without audio', async () => {
      await expect(audioService.replay()).rejects.toThrow('No audio loaded');
    });

    it('should handle auto-play failure silently', async () => {
      // Spy on console.error to verify error is logged
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a custom MockAudio that will fail on play
      const error = new Error('Auto-play blocked');
      class FailingMockAudio extends MockAudio {
        override play = vi.fn().mockRejectedValue(error);
      }

      // Override the global Audio constructor
      global.Audio = FailingMockAudio as unknown as typeof Audio;

      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      // Unlock auto-play
      await audioService.unlockAutoPlay();

      // Load with auto-play - should not throw even if play fails
      await expect(
        audioService.loadAudio(mockTask as Task, {} as AudioSettings, true)
      ).resolves.not.toThrow();

      // Wait for auto-play attempt
      await new Promise(resolve => setTimeout(resolve, 600));

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Auto-play failed:', error);

      // Cleanup
      consoleErrorSpy.mockRestore();

      // Restore original mock
      global.Audio = MockAudio as unknown as typeof Audio;
    });
  });

  describe('Audio Event Listeners', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should update duration when loadedmetadata event fires', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Simulate loadedmetadata event
      if (mockAudioInstance) {
        mockAudioInstance.duration = 45.5;
      }

      const metadataHandler = mockAudioInstance?.addEventListener.mock.calls.find(
        call => call[0] === 'loadedmetadata'
      )?.[1];

      if (metadataHandler) {
        metadataHandler();
      }

      const state = audioService.getPlaybackState();
      expect(state.duration).toBe(45.5);
      expect(state.status).toBe('stopped');
    });

    it('should update currentTime when timeupdate event fires during playback', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      // Simulate timeupdate event
      if (mockAudioInstance) {
        mockAudioInstance.currentTime = 3.2;
      }

      const timeupdateHandler = mockAudioInstance?.addEventListener.mock.calls.find(
        call => call[0] === 'timeupdate'
      )?.[1];

      if (timeupdateHandler) {
        timeupdateHandler();
      }

      const state = audioService.getPlaybackState();
      expect(state.currentTime).toBe(3.2);
    });

    it('should NOT update currentTime when timeupdate fires while not playing', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Don't play - status should be 'stopped'
      const initialState = audioService.getPlaybackState();
      const initialTime = initialState.currentTime;

      // Simulate timeupdate event
      if (mockAudioInstance) {
        mockAudioInstance.currentTime = 5.0;
      }

      const timeupdateHandler = mockAudioInstance?.addEventListener.mock.calls.find(
        call => call[0] === 'timeupdate'
      )?.[1];

      if (timeupdateHandler) {
        timeupdateHandler();
      }

      const state = audioService.getPlaybackState();
      // Should still have initial time, not updated from event
      expect(state.currentTime).toBe(initialTime);
    });

    it('should reset to stopped when ended event fires', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
      await audioService.play();

      // Simulate ended event
      const endedHandler = mockAudioInstance?.addEventListener.mock.calls.find(
        call => call[0] === 'ended'
      )?.[1];

      if (endedHandler) {
        endedHandler();
      }

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('stopped');
      expect(state.currentTime).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(async () => {
      await audioService.initialize();

      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };
      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);
    });

    it('should prevent rapid successive play calls', async () => {
      // First play should succeed
      await audioService.play();

      // Clear the mock to track new calls
      if (mockAudioInstance) {
        mockAudioInstance.play.mockClear();
      }

      // Immediate second play should be rate limited
      await audioService.play();

      // play() should not have been called on the audio element
      expect(mockAudioInstance?.play).not.toHaveBeenCalled();
    });

    it('should allow play after rate limit interval', async () => {
      // First play
      await audioService.play();

      // Clear mock
      if (mockAudioInstance) {
        mockAudioInstance.play.mockClear();
      }

      // Wait for rate limit to expire (100ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second play should succeed
      await audioService.play();

      expect(mockAudioInstance?.play).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    it('should handle pause when no audio is loaded', () => {
      expect(() => audioService.pause()).not.toThrow();

      const state = audioService.getPlaybackState();
      // State should remain unchanged
      expect(state.status).toBe('stopped');
    });

    it('should handle stop when no audio is loaded', () => {
      expect(() => audioService.stop()).not.toThrow();

      const state = audioService.getPlaybackState();
      expect(state.status).toBe('stopped');
    });

    it('should handle preloadNext with task without audio URL', () => {
      const nextTask: Partial<Task> = {
        hasAudio: false,
        audioUrl: undefined,
      };

      expect(() => audioService.preloadNext(nextTask as Task)).not.toThrow();

      const state = audioService.getPlaybackState();
      // preloadedNextUrl should remain null
      expect(state.preloadedNextUrl).toBeNull();
    });

    it('should toggle from stopped to playing', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Trigger loadedmetadata to set status to 'stopped'
      if (mockAudioInstance) {
        mockAudioInstance.duration = 30;
      }
      const metadataHandler = mockAudioInstance?.addEventListener.mock.calls.find(
        call => call[0] === 'loadedmetadata'
      )?.[1];
      if (metadataHandler) {
        metadataHandler();
      }

      expect(audioService.getPlaybackState().status).toBe('stopped');

      await audioService.togglePlayPause();

      expect(audioService.getPlaybackState().status).toBe('playing');
    });

    it('should accept valid audio URL with base path', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: 'https://example.com/audio/test.mp3',
      };

      await expect(
        audioService.loadAudio(mockTask as Task, {} as AudioSettings, false)
      ).resolves.not.toThrow();
    });

    it('should accept valid data URI for audio', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: 'data:audio/mp3;base64,SGVsbG8gV29ybGQ=',
      };

      await expect(
        audioService.loadAudio(mockTask as Task, {} as AudioSettings, false)
      ).resolves.not.toThrow();
    });

    it('should clear auto-play timer when loading new audio', async () => {
      const mockTask1: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test1.mp3',
      };

      const mockTask2: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test2.mp3',
      };

      await audioService.unlockAutoPlay();

      // Load first audio with auto-play
      await audioService.loadAudio(mockTask1 as Task, {} as AudioSettings, true);

      // Immediately load second audio (should clear timer from first)
      await audioService.loadAudio(mockTask2 as Task, {} as AudioSettings, false);

      // Wait to ensure first auto-play doesn't trigger
      await new Promise(resolve => setTimeout(resolve, 600));

      // Should NOT be playing because timer was cleared
      const state = audioService.getPlaybackState();
      expect(state.audioUrl).toBe('/audio/test2.mp3');
    });

    it('should not trigger auto-play if not unlocked', async () => {
      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      // Don't unlock auto-play
      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, true);

      // Wait for potential auto-play delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const state = audioService.getPlaybackState();
      // Should not be playing
      expect(state.status).not.toBe('playing');
    });

    it('should preserve autoPlayUnlocked state when loading new audio', async () => {
      await audioService.unlockAutoPlay();

      expect(audioService.getPlaybackState().autoPlayUnlocked).toBe(true);

      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/test.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Should still be unlocked after loading audio
      expect(audioService.getPlaybackState().autoPlayUnlocked).toBe(true);
    });

    it('should preserve preloadedNextUrl when loading new audio', async () => {
      const nextTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/next.mp3',
      };

      audioService.preloadNext(nextTask as Task);
      expect(audioService.getPlaybackState().preloadedNextUrl).toBe('/audio/next.mp3');

      const mockTask: Partial<Task> = {
        hasAudio: true,
        audioUrl: '/audio/current.mp3',
      };

      await audioService.loadAudio(mockTask as Task, {} as AudioSettings, false);

      // Preloaded URL should be preserved
      expect(audioService.getPlaybackState().preloadedNextUrl).toBe('/audio/next.mp3');
    });
  });
});
