/**
 * useAudioSettings Hook
 *
 * React hook for managing audio settings persistence.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.6 - React Hooks
 */

import { useState, useEffect, useRef } from 'react';
import {
  createAudioSettingsStorage,
  type IAudioSettingsStorage,
} from '../../storage/adapters/audio-settings-storage';
import type { AudioSettings } from '../../core/entities/audio-settings';

/**
 * Hook return type
 */
export interface UseAudioSettingsReturn {
  settings: AudioSettings;
  updateSettings: (updates: Partial<AudioSettings>) => void;
  resetSettings: () => void;
  isLoaded: boolean;
}

/**
 * React hook for audio settings
 *
 * @returns Audio settings and update functions
 *
 * @example
 * const { settings, updateSettings, resetSettings } = useAudioSettings();
 *
 * // Update a setting
 * updateSettings({ autoPlayEnabled: false });
 *
 * // Reset to defaults
 * resetSettings();
 */
export function useAudioSettings(): UseAudioSettingsReturn {
  const storageRef = useRef<IAudioSettingsStorage | null>(null);
  const [settings, setSettings] = useState<AudioSettings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize storage and load settings
  useEffect(() => {
    const storage = createAudioSettingsStorage();
    storageRef.current = storage;

    // Load settings from storage
    const loadedSettings = storage.load();
    setSettings(loadedSettings);
    setIsLoaded(true);
  }, []);

  // Update settings
  const updateSettings = (updates: Partial<AudioSettings>) => {
    if (!storageRef.current || !settings) {
      console.warn('Audio settings not loaded yet');
      return;
    }

    // Update storage
    storageRef.current.update(updates);

    // Reload settings from storage
    const newSettings = storageRef.current.load();
    setSettings(newSettings);
  };

  // Reset settings to defaults
  const resetSettings = () => {
    if (!storageRef.current) {
      console.warn('Audio settings not loaded yet');
      return;
    }

    storageRef.current.reset();

    // Reload settings (will be defaults now)
    const newSettings = storageRef.current.load();
    setSettings(newSettings);
  };

  return {
    settings: settings || {
      version: 1,
      autoPlayEnabled: true,
      languageFilter: 'non-German only',
      perTopicOverrides: {},
      accessibilityMode: false,
    },
    updateSettings,
    resetSettings,
    isLoaded,
  };
}
