/**
 * Tests for useAudioPlayback hook
 *
 * Tests the audio playback hook which handles:
 * - Initializing the audio service
 * - Managing playback state
 * - Loading audio from tasks
 * - Play/pause functionality
 * - Progress tracking
 * - Error handling
 * - Auto-play permission management
 * - Preloading next audio
 * - Cleanup on unmount
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioPlayback } from '@/modules/ui/hooks/use-audio-playback';
import { createAudioService, type IAudioService } from '@/modules/core/services/audio-service';
import type { AudioPlayback } from '@/modules/core/entities/audio-playback';
import type { Task } from '@/modules/core/types/services';
import type { AudioSettings } from '@/modules/core/entities/audio-settings';

// Mock the audio service
vi.mock('@/modules/core/services/audio-service', () => ({
  createAudioService: vi.fn(),
}));

describe('useAudioPlayback', () => {
  // Mock audio service
  let mockAudioService: {
    initialize: ReturnType<typeof vi.fn>;
    loadAudio: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    replay: ReturnType<typeof vi.fn>;
    togglePlayPause: ReturnType<typeof vi.fn>;
    preloadNext: ReturnType<typeof vi.fn>;
    checkAutoPlayPermission: ReturnType<typeof vi.fn>;
    unlockAutoPlay: ReturnType<typeof vi.fn>;
    getPlaybackState: ReturnType<typeof vi.fn>;
    onStateChange: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  };

  // Mock data
  const mockTask: Task = {
    id: 'task-1',
    type: 'vocabulary',
    audioUrl: '/audio/test.mp3',
    data: {
      spanish: 'Hola',
      german: 'Hallo',
    },
  } as Task;

  const mockSettings: AudioSettings = {
    version: 2,
    autoPlayEnabled: true,
    languageFilter: 'non-German only',
    perTopicOverrides: {},
    accessibilityMode: false,
  };

  const initialPlaybackState: AudioPlayback = {
    audioUrl: null,
    status: 'stopped',
    currentTime: 0,
    duration: 0,
    autoPlayUnlocked: false,
    preloadedNextUrl: null,
    error: null,
  };

  const playingState: AudioPlayback = {
    audioUrl: '/audio/test.mp3',
    status: 'playing',
    currentTime: 5,
    duration: 10,
    autoPlayUnlocked: true,
    preloadedNextUrl: null,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock audio service
    mockAudioService = {
      initialize: vi.fn().mockResolvedValue(undefined),
      loadAudio: vi.fn().mockResolvedValue(undefined),
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      stop: vi.fn(),
      replay: vi.fn().mockResolvedValue(undefined),
      togglePlayPause: vi.fn().mockResolvedValue(undefined),
      preloadNext: vi.fn(),
      checkAutoPlayPermission: vi.fn().mockResolvedValue(false),
      unlockAutoPlay: vi.fn().mockResolvedValue(true),
      getPlaybackState: vi.fn().mockReturnValue(initialPlaybackState),
      onStateChange: vi.fn().mockReturnValue(() => {}), // Returns unsubscribe function
      dispose: vi.fn(),
    };

    // Setup createAudioService mock
    vi.mocked(createAudioService).mockReturnValue(mockAudioService as unknown as IAudioService);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // Initial state tests
  describe('Initial State', () => {
    it('should initialize with stopped playback state', () => {
      const { result } = renderHook(() => useAudioPlayback());

      expect(result.current.playbackState).toEqual(initialPlaybackState);
    });

    it('should create audio service on mount', () => {
      renderHook(() => useAudioPlayback());

      expect(createAudioService).toHaveBeenCalledTimes(1);
    });

    it('should initialize audio service on mount', async () => {
      renderHook(() => useAudioPlayback());

      await waitFor(() => {
        expect(mockAudioService.initialize).toHaveBeenCalledTimes(1);
      });
    });

    it('should subscribe to audio service state changes', () => {
      renderHook(() => useAudioPlayback());

      expect(mockAudioService.onStateChange).toHaveBeenCalledTimes(1);
      expect(mockAudioService.onStateChange).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should update state when service state changes', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      expect(result.current.playbackState).toEqual(initialPlaybackState);

      // Simulate state change from service
      act(() => {
        stateChangeCallback?.(playingState);
      });

      expect(result.current.playbackState).toEqual(playingState);
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useAudioPlayback());

      expect(result.current).toHaveProperty('playbackState');
      expect(result.current).toHaveProperty('loadAudio');
      expect(result.current).toHaveProperty('play');
      expect(result.current).toHaveProperty('pause');
      expect(result.current).toHaveProperty('stop');
      expect(result.current).toHaveProperty('replay');
      expect(result.current).toHaveProperty('togglePlayPause');
      expect(result.current).toHaveProperty('preloadNext');
      expect(result.current).toHaveProperty('checkAutoPlayPermission');
      expect(result.current).toHaveProperty('unlockAutoPlay');
    });

    it('should have correct function types', () => {
      const { result } = renderHook(() => useAudioPlayback());

      expect(typeof result.current.loadAudio).toBe('function');
      expect(typeof result.current.play).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.replay).toBe('function');
      expect(typeof result.current.togglePlayPause).toBe('function');
      expect(typeof result.current.preloadNext).toBe('function');
      expect(typeof result.current.checkAutoPlayPermission).toBe('function');
      expect(typeof result.current.unlockAutoPlay).toBe('function');
    });
  });

  // Cleanup tests
  describe('Cleanup on Unmount', () => {
    it('should unsubscribe from state changes on unmount', () => {
      const unsubscribe = vi.fn();
      mockAudioService.onStateChange.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should stop audio on unmount', () => {
      const { unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(mockAudioService.stop).toHaveBeenCalledTimes(1);
    });

    it('should dispose audio service on unmount', () => {
      const { unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(mockAudioService.dispose).toHaveBeenCalledTimes(1);
    });

    it('should cleanup in correct order: stop → unsubscribe → dispose', () => {
      const unsubscribe = vi.fn();
      mockAudioService.onStateChange.mockReturnValue(unsubscribe);

      const callOrder: string[] = [];
      mockAudioService.stop.mockImplementation(() => {
        callOrder.push('stop');
      });
      unsubscribe.mockImplementation(() => {
        callOrder.push('unsubscribe');
      });
      mockAudioService.dispose.mockImplementation(() => {
        callOrder.push('dispose');
      });

      const { unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(callOrder).toEqual(['stop', 'unsubscribe', 'dispose']);
    });

    it('should clear audio service reference on unmount', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      // After unmount, calling methods should throw
      await expect(async () => {
        await result.current.play();
      }).rejects.toThrow('Audio service not initialized');
    });
  });

  // Load audio tests
  describe('loadAudio', () => {
    it('should call service loadAudio with correct parameters', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.loadAudio(mockTask, mockSettings, true);
      });

      expect(mockAudioService.loadAudio).toHaveBeenCalledTimes(1);
      expect(mockAudioService.loadAudio).toHaveBeenCalledWith(mockTask, mockSettings, true);
    });

    it('should load audio with autoPlay disabled', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.loadAudio(mockTask, mockSettings, false);
      });

      expect(mockAudioService.loadAudio).toHaveBeenCalledWith(mockTask, mockSettings, false);
    });

    it('should throw error if service not initialized', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(async () => {
        await result.current.loadAudio(mockTask, mockSettings, true);
      }).rejects.toThrow('Audio service not initialized');
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Failed to load audio');
      mockAudioService.loadAudio.mockRejectedValue(error);

      const { result } = renderHook(() => useAudioPlayback());

      await expect(async () => {
        await result.current.loadAudio(mockTask, mockSettings, true);
      }).rejects.toThrow('Failed to load audio');
    });

    it('should handle loading different tasks sequentially', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      const task1 = { ...mockTask, id: 'task-1', audioUrl: '/audio/test1.mp3' };
      const task2 = { ...mockTask, id: 'task-2', audioUrl: '/audio/test2.mp3' };

      await act(async () => {
        await result.current.loadAudio(task1, mockSettings, false);
      });

      await act(async () => {
        await result.current.loadAudio(task2, mockSettings, false);
      });

      expect(mockAudioService.loadAudio).toHaveBeenCalledTimes(2);
      expect(mockAudioService.loadAudio).toHaveBeenNthCalledWith(1, task1, mockSettings, false);
      expect(mockAudioService.loadAudio).toHaveBeenNthCalledWith(2, task2, mockSettings, false);
    });
  });

  // Play functionality tests
  describe('play', () => {
    it('should call service play method', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play();
      });

      expect(mockAudioService.play).toHaveBeenCalledTimes(1);
    });

    it('should throw error if service not initialized', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(async () => {
        await result.current.play();
      }).rejects.toThrow('Audio service not initialized');
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Playback failed');
      mockAudioService.play.mockRejectedValue(error);

      const { result } = renderHook(() => useAudioPlayback());

      await expect(async () => {
        await result.current.play();
      }).rejects.toThrow('Playback failed');
    });

    it('should handle multiple play calls', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play();
      });

      await act(async () => {
        await result.current.play();
      });

      expect(mockAudioService.play).toHaveBeenCalledTimes(2);
    });
  });

  // Pause functionality tests
  describe('pause', () => {
    it('should call service pause method', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.pause();
      });

      expect(mockAudioService.pause).toHaveBeenCalledTimes(1);
    });

    it('should not throw if service not initialized', () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(() => {
        result.current.pause();
      }).not.toThrow();
    });

    it('should handle multiple pause calls', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.pause();
        result.current.pause();
      });

      expect(mockAudioService.pause).toHaveBeenCalledTimes(2);
    });
  });

  // Stop functionality tests
  describe('stop', () => {
    it('should call service stop method', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.stop();
      });

      expect(mockAudioService.stop).toHaveBeenCalledTimes(1);
    });

    it('should not throw if service not initialized', () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(() => {
        result.current.stop();
      }).not.toThrow();
    });

    it('should handle multiple stop calls', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.stop();
        result.current.stop();
      });

      // stop is called once on unmount in beforeEach, plus 2 explicit calls
      expect(mockAudioService.stop).toHaveBeenCalledTimes(2);
    });
  });

  // Replay functionality tests
  describe('replay', () => {
    it('should call service replay method', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.replay();
      });

      expect(mockAudioService.replay).toHaveBeenCalledTimes(1);
    });

    it('should throw error if service not initialized', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(async () => {
        await result.current.replay();
      }).rejects.toThrow('Audio service not initialized');
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Replay failed');
      mockAudioService.replay.mockRejectedValue(error);

      const { result } = renderHook(() => useAudioPlayback());

      await expect(async () => {
        await result.current.replay();
      }).rejects.toThrow('Replay failed');
    });
  });

  // Toggle play/pause tests
  describe('togglePlayPause', () => {
    it('should call service togglePlayPause method', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(mockAudioService.togglePlayPause).toHaveBeenCalledTimes(1);
    });

    it('should throw error if service not initialized', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(async () => {
        await result.current.togglePlayPause();
      }).rejects.toThrow('Audio service not initialized');
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Toggle failed');
      mockAudioService.togglePlayPause.mockRejectedValue(error);

      const { result } = renderHook(() => useAudioPlayback());

      await expect(async () => {
        await result.current.togglePlayPause();
      }).rejects.toThrow('Toggle failed');
    });

    it('should handle rapid toggle calls', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.togglePlayPause();
        await result.current.togglePlayPause();
        await result.current.togglePlayPause();
      });

      expect(mockAudioService.togglePlayPause).toHaveBeenCalledTimes(3);
    });
  });

  // Preload functionality tests
  describe('preloadNext', () => {
    it('should call service preloadNext method with task', () => {
      const { result } = renderHook(() => useAudioPlayback());

      const nextTask = { ...mockTask, id: 'task-2', audioUrl: '/audio/next.mp3' };

      act(() => {
        result.current.preloadNext(nextTask);
      });

      expect(mockAudioService.preloadNext).toHaveBeenCalledTimes(1);
      expect(mockAudioService.preloadNext).toHaveBeenCalledWith(nextTask);
    });

    it('should not throw if service not initialized', () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      expect(() => {
        result.current.preloadNext(mockTask);
      }).not.toThrow();
    });

    it('should handle preloading multiple tasks', () => {
      const { result } = renderHook(() => useAudioPlayback());

      const task1 = { ...mockTask, id: 'task-1' };
      const task2 = { ...mockTask, id: 'task-2' };

      act(() => {
        result.current.preloadNext(task1);
        result.current.preloadNext(task2);
      });

      expect(mockAudioService.preloadNext).toHaveBeenCalledTimes(2);
      expect(mockAudioService.preloadNext).toHaveBeenNthCalledWith(1, task1);
      expect(mockAudioService.preloadNext).toHaveBeenNthCalledWith(2, task2);
    });
  });

  // Auto-play permission tests
  describe('checkAutoPlayPermission', () => {
    it('should call service checkAutoPlayPermission method', async () => {
      mockAudioService.checkAutoPlayPermission.mockResolvedValue(true);

      const { result } = renderHook(() => useAudioPlayback());

      const hasPermission = await result.current.checkAutoPlayPermission();

      expect(mockAudioService.checkAutoPlayPermission).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(true);
    });

    it('should return false when service not initialized', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      const hasPermission = await result.current.checkAutoPlayPermission();

      expect(hasPermission).toBe(false);
    });

    it('should return false when permission denied', async () => {
      mockAudioService.checkAutoPlayPermission.mockResolvedValue(false);

      const { result } = renderHook(() => useAudioPlayback());

      const hasPermission = await result.current.checkAutoPlayPermission();

      expect(hasPermission).toBe(false);
    });
  });

  describe('unlockAutoPlay', () => {
    it('should call service unlockAutoPlay method', async () => {
      mockAudioService.unlockAutoPlay.mockResolvedValue(true);

      const { result } = renderHook(() => useAudioPlayback());

      const success = await result.current.unlockAutoPlay();

      expect(mockAudioService.unlockAutoPlay).toHaveBeenCalledTimes(1);
      expect(success).toBe(true);
    });

    it('should return false when service not initialized', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      const success = await result.current.unlockAutoPlay();

      expect(success).toBe(false);
    });

    it('should return false when unlock fails', async () => {
      mockAudioService.unlockAutoPlay.mockResolvedValue(false);

      const { result } = renderHook(() => useAudioPlayback());

      const success = await result.current.unlockAutoPlay();

      expect(success).toBe(false);
    });
  });

  // State management tests
  describe('State Management', () => {
    it('should update playback state when service emits state change', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      expect(result.current.playbackState.status).toBe('stopped');

      // Simulate loading state
      const loadingState: AudioPlayback = {
        ...initialPlaybackState,
        status: 'loading',
        audioUrl: '/audio/test.mp3',
      };

      act(() => {
        stateChangeCallback?.(loadingState);
      });

      expect(result.current.playbackState.status).toBe('loading');
      expect(result.current.playbackState.audioUrl).toBe('/audio/test.mp3');
    });

    it('should track progress updates', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      // Simulate progress at 25%
      act(() => {
        stateChangeCallback?.({
          ...playingState,
          currentTime: 2.5,
          duration: 10,
        });
      });

      expect(result.current.playbackState.currentTime).toBe(2.5);
      expect(result.current.playbackState.duration).toBe(10);

      // Simulate progress at 50%
      act(() => {
        stateChangeCallback?.({
          ...playingState,
          currentTime: 5,
          duration: 10,
        });
      });

      expect(result.current.playbackState.currentTime).toBe(5);
    });

    it('should handle error state', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      const errorState: AudioPlayback = {
        ...initialPlaybackState,
        status: 'error',
        error: 'Failed to load audio file',
      };

      act(() => {
        stateChangeCallback?.(errorState);
      });

      expect(result.current.playbackState.status).toBe('error');
      expect(result.current.playbackState.error).toBe('Failed to load audio file');
    });

    it('should handle all playback statuses', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      const statuses: Array<AudioPlayback['status']> = ['loading', 'stopped', 'playing', 'paused', 'error'];

      for (const status of statuses) {
        act(() => {
          stateChangeCallback?.({
            ...initialPlaybackState,
            status,
            error: status === 'error' ? 'Test error' : null,
          });
        });

        expect(result.current.playbackState.status).toBe(status);
      }
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle initialization failure gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const initError = new Error('Init failed');
      mockAudioService.initialize.mockRejectedValue(initError);

      renderHook(() => useAudioPlayback());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize audio service:', initError);
      });

      consoleErrorSpy.mockRestore();
    });

    it('should throw when play called without service', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(result.current.play()).rejects.toThrow('Audio service not initialized');
    });

    it('should throw when loadAudio called without service', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(result.current.loadAudio(mockTask, mockSettings, true)).rejects.toThrow('Audio service not initialized');
    });

    it('should throw when replay called without service', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(result.current.replay()).rejects.toThrow('Audio service not initialized');
    });

    it('should throw when togglePlayPause called without service', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayback());

      unmount();

      await expect(result.current.togglePlayPause()).rejects.toThrow('Audio service not initialized');
    });
  });

  // Edge cases tests
  describe('Edge Cases', () => {
    it('should handle rapid mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderHook(() => useAudioPlayback());
      const { unmount: unmount2 } = renderHook(() => useAudioPlayback());
      const { unmount: unmount3 } = renderHook(() => useAudioPlayback());

      expect(() => {
        unmount1();
        unmount2();
        unmount3();
      }).not.toThrow();

      expect(createAudioService).toHaveBeenCalledTimes(3);
    });

    it('should handle state updates after unmount gracefully', () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { unmount } = renderHook(() => useAudioPlayback());

      unmount();

      // This should not cause errors
      expect(() => {
        stateChangeCallback?.(playingState);
      }).not.toThrow();
    });

    it('should maintain separate instances for multiple hooks', () => {
      const { result: result1 } = renderHook(() => useAudioPlayback());
      const { result: result2 } = renderHook(() => useAudioPlayback());

      expect(createAudioService).toHaveBeenCalledTimes(2);
      expect(result1.current).not.toBe(result2.current);
    });

    it('should handle service returning null for optional calls', () => {
      const { result } = renderHook(() => useAudioPlayback());

      // Pause when no service (should not throw)
      act(() => {
        result.current.pause();
      });

      // Stop when no service (should not throw)
      act(() => {
        result.current.stop();
      });

      // Preload when no service (should not throw)
      act(() => {
        result.current.preloadNext(mockTask);
      });

      expect(mockAudioService.pause).toHaveBeenCalled();
      expect(mockAudioService.stop).toHaveBeenCalled();
      expect(mockAudioService.preloadNext).toHaveBeenCalled();
    });
  });

  // Integration scenarios tests
  describe('Integration Scenarios', () => {
    it('should handle complete playback workflow: load → play → pause → replay', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      // Load audio
      await act(async () => {
        await result.current.loadAudio(mockTask, mockSettings, false);
      });

      act(() => {
        stateChangeCallback?.({ ...initialPlaybackState, status: 'stopped', audioUrl: '/audio/test.mp3' });
      });

      expect(mockAudioService.loadAudio).toHaveBeenCalled();

      // Play
      await act(async () => {
        await result.current.play();
      });

      act(() => {
        stateChangeCallback?.({ ...playingState, status: 'playing' });
      });

      expect(mockAudioService.play).toHaveBeenCalled();
      expect(result.current.playbackState.status).toBe('playing');

      // Pause
      act(() => {
        result.current.pause();
      });

      act(() => {
        stateChangeCallback?.({ ...playingState, status: 'paused' });
      });

      expect(mockAudioService.pause).toHaveBeenCalled();
      expect(result.current.playbackState.status).toBe('paused');

      // Replay
      await act(async () => {
        await result.current.replay();
      });

      expect(mockAudioService.replay).toHaveBeenCalled();
    });

    it('should handle auto-play unlock workflow', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      // Check permission (initially false)
      mockAudioService.checkAutoPlayPermission.mockResolvedValue(false);
      const hasPermission = await result.current.checkAutoPlayPermission();
      expect(hasPermission).toBe(false);

      // Unlock auto-play
      mockAudioService.unlockAutoPlay.mockResolvedValue(true);
      const unlocked = await result.current.unlockAutoPlay();
      expect(unlocked).toBe(true);

      // Update state
      act(() => {
        stateChangeCallback?.({ ...initialPlaybackState, autoPlayUnlocked: true });
      });

      // Check permission (now true)
      mockAudioService.checkAutoPlayPermission.mockResolvedValue(true);
      const hasPermissionNow = await result.current.checkAutoPlayPermission();
      expect(hasPermissionNow).toBe(true);
    });

    it('should handle loading task with preload', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      const currentTask = { ...mockTask, id: 'current' };
      const nextTask = { ...mockTask, id: 'next', audioUrl: '/audio/next.mp3' };

      // Load current task
      await act(async () => {
        await result.current.loadAudio(currentTask, mockSettings, false);
      });

      // Preload next
      act(() => {
        result.current.preloadNext(nextTask);
      });

      expect(mockAudioService.loadAudio).toHaveBeenCalledWith(currentTask, mockSettings, false);
      expect(mockAudioService.preloadNext).toHaveBeenCalledWith(nextTask);
    });

    it('should handle error recovery', async () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      // Load audio
      await act(async () => {
        await result.current.loadAudio(mockTask, mockSettings, false);
      });

      // Simulate error
      act(() => {
        stateChangeCallback?.({
          ...initialPlaybackState,
          status: 'error',
          error: 'Network error',
        });
      });

      expect(result.current.playbackState.status).toBe('error');
      expect(result.current.playbackState.error).toBe('Network error');

      // Retry by loading again
      await act(async () => {
        await result.current.loadAudio(mockTask, mockSettings, false);
      });

      act(() => {
        stateChangeCallback?.({
          ...initialPlaybackState,
          status: 'stopped',
          audioUrl: '/audio/test.mp3',
        });
      });

      expect(result.current.playbackState.status).toBe('stopped');
      expect(result.current.playbackState.error).toBe(null);
    });
  });

  // Function behavior tests
  describe('Function Behavior', () => {
    it('should create new function instances on each render', () => {
      const { result, rerender } = renderHook(() => useAudioPlayback());

      const initialFunctions = {
        loadAudio: result.current.loadAudio,
        play: result.current.play,
        pause: result.current.pause,
        stop: result.current.stop,
        replay: result.current.replay,
        togglePlayPause: result.current.togglePlayPause,
        preloadNext: result.current.preloadNext,
        checkAutoPlayPermission: result.current.checkAutoPlayPermission,
        unlockAutoPlay: result.current.unlockAutoPlay,
      };

      rerender();

      // Functions are recreated on each render since they're not memoized
      expect(result.current.loadAudio).not.toBe(initialFunctions.loadAudio);
      expect(result.current.play).not.toBe(initialFunctions.play);
      expect(result.current.pause).not.toBe(initialFunctions.pause);
      expect(result.current.stop).not.toBe(initialFunctions.stop);
      expect(result.current.replay).not.toBe(initialFunctions.replay);
      expect(result.current.togglePlayPause).not.toBe(initialFunctions.togglePlayPause);
      expect(result.current.preloadNext).not.toBe(initialFunctions.preloadNext);
      expect(result.current.checkAutoPlayPermission).not.toBe(initialFunctions.checkAutoPlayPermission);
      expect(result.current.unlockAutoPlay).not.toBe(initialFunctions.unlockAutoPlay);
    });

    it('should recreate functions on state change', () => {
      let stateChangeCallback: ((state: AudioPlayback) => void) | null = null;

      mockAudioService.onStateChange.mockImplementation((callback) => {
        stateChangeCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAudioPlayback());

      const initialPlay = result.current.play;

      // Trigger state change which causes re-render
      act(() => {
        stateChangeCallback?.(playingState);
      });

      // Functions are recreated on state change
      expect(result.current.play).not.toBe(initialPlay);
    });

    it('should maintain service reference across re-renders', async () => {
      const { result, rerender } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play();
      });

      expect(mockAudioService.play).toHaveBeenCalledTimes(1);

      rerender();

      await act(async () => {
        await result.current.play();
      });

      // Same service instance is used
      expect(mockAudioService.play).toHaveBeenCalledTimes(2);
      expect(createAudioService).toHaveBeenCalledTimes(1); // Only created once
    });
  });
});
