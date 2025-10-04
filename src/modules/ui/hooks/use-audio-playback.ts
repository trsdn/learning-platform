/**
 * useAudioPlayback Hook
 *
 * React hook for managing audio playback in components.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.6 - React Hooks
 */

import { useState, useEffect, useRef } from 'react';
import { createAudioService, type IAudioService } from '../../core/services/audio-service';
import type { AudioPlayback } from '../../core/entities/audio-playback';
import type { Task } from '../../core/types/services';
import type { AudioSettings } from '../../core/entities/audio-settings';

/**
 * Hook return type
 */
export interface UseAudioPlaybackReturn {
  playbackState: AudioPlayback;
  loadAudio: (task: Task, settings: AudioSettings, autoPlay: boolean) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  replay: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  preloadNext: (nextTask: Task) => void;
  checkAutoPlayPermission: () => Promise<boolean>;
  unlockAutoPlay: () => Promise<boolean>;
}

/**
 * React hook for audio playback
 *
 * @returns Audio playback controls and state
 *
 * @example
 * const { playbackState, play, pause, loadAudio } = useAudioPlayback();
 *
 * // Load and auto-play audio
 * await loadAudio(task, settings, true);
 *
 * // Manual controls
 * await play();
 * pause();
 */
export function useAudioPlayback(): UseAudioPlaybackReturn {
  const audioServiceRef = useRef<IAudioService | null>(null);
  const [playbackState, setPlaybackState] = useState<AudioPlayback>({
    audioUrl: null,
    status: 'stopped',
    currentTime: 0,
    duration: 0,
    autoPlayUnlocked: false,
    preloadedNextUrl: null,
    error: null,
  });

  // Initialize service
  useEffect(() => {
    const service = createAudioService();
    audioServiceRef.current = service;

    // Initialize service
    service.initialize().catch((error) => {
      console.error('Failed to initialize audio service:', error);
    });

    // Subscribe to state changes
    const unsubscribe = service.onStateChange((newState) => {
      setPlaybackState(newState);
    });

    // Cleanup on unmount - stop all audio and clean up resources
    return () => {
      // Stop audio playback immediately
      service.stop();

      // Unsubscribe from state changes
      unsubscribe();

      // Clean up all resources (audio elements, timers, etc.)
      service.dispose();

      // Clear the service reference
      audioServiceRef.current = null;
    };
  }, []);

  // Wrap service methods
  const loadAudio = async (task: Task, settings: AudioSettings, autoPlay: boolean) => {
    if (!audioServiceRef.current) {
      throw new Error('Audio service not initialized');
    }
    await audioServiceRef.current.loadAudio(task, settings, autoPlay);
  };

  const play = async () => {
    if (!audioServiceRef.current) {
      throw new Error('Audio service not initialized');
    }
    await audioServiceRef.current.play();
  };

  const pause = () => {
    audioServiceRef.current?.pause();
  };

  const stop = () => {
    audioServiceRef.current?.stop();
  };

  const replay = async () => {
    if (!audioServiceRef.current) {
      throw new Error('Audio service not initialized');
    }
    await audioServiceRef.current.replay();
  };

  const togglePlayPause = async () => {
    if (!audioServiceRef.current) {
      throw new Error('Audio service not initialized');
    }
    await audioServiceRef.current.togglePlayPause();
  };

  const preloadNext = (nextTask: Task) => {
    audioServiceRef.current?.preloadNext(nextTask);
  };

  const checkAutoPlayPermission = async () => {
    if (!audioServiceRef.current) {
      return false;
    }
    return audioServiceRef.current.checkAutoPlayPermission();
  };

  const unlockAutoPlay = async () => {
    if (!audioServiceRef.current) {
      return false;
    }
    return audioServiceRef.current.unlockAutoPlay();
  };

  return {
    playbackState,
    loadAudio,
    play,
    pause,
    stop,
    replay,
    togglePlayPause,
    preloadNext,
    checkAutoPlayPermission,
    unlockAutoPlay,
  };
}
