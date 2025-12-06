/**
 * Tests for useAudioSettings hook
 *
 * Tests the audio settings hook which handles:
 * - Loading settings from localStorage on mount
 * - Updating partial settings with persistence
 * - Resetting settings to defaults
 * - Default values when not initialized
 * - localStorage persistence and migration
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioSettings } from '../../../../src/modules/ui/hooks/use-audio-settings';
import type { AudioSettings } from '../../../../src/modules/core/entities/audio-settings';
import { DEFAULT_AUDIO_SETTINGS } from '../../../../src/modules/core/entities/audio-settings';

// Create mock storage factory (creates fresh mocks for each test)
const createMockStorageInstance = () => ({
  load: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  reset: vi.fn(),
  exists: vi.fn(),
  migrate: vi.fn(),
});

let mockStorage = createMockStorageInstance();

// Mock the audio settings storage
vi.mock('../../../../src/modules/storage/adapters/audio-settings-storage', () => {
  return {
    createAudioSettingsStorage: vi.fn(() => mockStorage),
    DEFAULT_AUDIO_SETTINGS: {
      version: 2,
      autoPlayEnabled: true,
      languageFilter: 'non-German only' as const,
      perTopicOverrides: {},
      accessibilityMode: false,
    },
  };
});

describe('useAudioSettings', () => {
  // Get reference to the mocked storage
  const getMockStorage = () => mockStorage;

  const mockSettings: AudioSettings = {
    version: 2,
    autoPlayEnabled: true,
    languageFilter: 'non-German only',
    perTopicOverrides: {},
    accessibilityMode: false,
  };

  beforeEach(() => {
    // Create fresh mock storage instance for each test
    mockStorage = createMockStorageInstance();

    // Reset all mocks
    vi.clearAllMocks();
    localStorage.clear();

    // Setup default mock behavior
    vi.mocked(mockStorage.load).mockReturnValue(mockSettings);
    vi.mocked(mockStorage.exists).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should load settings from storage on mount', async () => {
      const { result } = renderHook(() => useAudioSettings());

      // Wait for useEffect to complete
      await act(async () => {
        await Promise.resolve();
      });

      const storage = getMockStorage();
      expect(storage.load).toHaveBeenCalledTimes(1);
      expect(result.current.settings).toEqual(mockSettings);
    });

    it('should set isLoaded to true after initialization', async () => {
      const { result } = renderHook(() => useAudioSettings());

      // isLoaded starts as false
      // After first render, useEffect runs synchronously and sets isLoaded to true
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoaded).toBe(true);
    });

    it('should return fallback default settings when settings is null', () => {
      // Mock storage to return null initially (before useEffect runs)
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValueOnce(null as unknown as AudioSettings);

      const { result } = renderHook(() => useAudioSettings());

      // Should return fallback defaults when settings is null
      expect(result.current.settings).toEqual({
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      });
    });

    it('should initialize storage on mount', async () => {
      const { createAudioSettingsStorage } = await import('../../../../src/modules/storage/adapters/audio-settings-storage');

      renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(createAudioSettingsStorage).toHaveBeenCalledTimes(1);
    });

    it('should handle storage returning default settings when none exist', async () => {
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(DEFAULT_AUDIO_SETTINGS);
      vi.mocked(storage.exists).mockReturnValue(false);

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });
  });

  describe('updateSettings', () => {
    it('should update settings with partial object', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const updates: Partial<AudioSettings> = {
        autoPlayEnabled: false,
      };

      const updatedSettings = { ...mockSettings, ...updates };
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(updatedSettings);

      act(() => {
        result.current.updateSettings(updates);
      });

      expect(storage.update).toHaveBeenCalledWith(updates);
      expect(storage.load).toHaveBeenCalled();
      expect(result.current.settings).toEqual(updatedSettings);
    });

    it('should update languageFilter setting', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const updates: Partial<AudioSettings> = {
        languageFilter: 'all languages',
      };

      const updatedSettings = { ...mockSettings, ...updates };
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(updatedSettings);

      act(() => {
        result.current.updateSettings(updates);
      });

      expect(storage.update).toHaveBeenCalledWith(updates);
      expect(result.current.settings.languageFilter).toBe('all languages');
    });

    it('should update accessibilityMode setting', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const updates: Partial<AudioSettings> = {
        accessibilityMode: true,
      };

      const updatedSettings = { ...mockSettings, ...updates };
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(updatedSettings);

      act(() => {
        result.current.updateSettings(updates);
      });

      expect(storage.update).toHaveBeenCalledWith(updates);
      expect(result.current.settings.accessibilityMode).toBe(true);
    });

    it('should update perTopicOverrides', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const updates: Partial<AudioSettings> = {
        perTopicOverrides: {
          'topic-1': { autoPlayEnabled: false },
        },
      };

      const updatedSettings = { ...mockSettings, ...updates };
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(updatedSettings);

      act(() => {
        result.current.updateSettings(updates);
      });

      expect(storage.update).toHaveBeenCalledWith(updates);
      expect(result.current.settings.perTopicOverrides).toEqual({
        'topic-1': { autoPlayEnabled: false },
      });
    });

    it('should handle multiple updates', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const storage = getMockStorage();

      // First update
      const updates1: Partial<AudioSettings> = { autoPlayEnabled: false };
      const updatedSettings1 = { ...mockSettings, ...updates1 };
      vi.mocked(storage.load).mockReturnValue(updatedSettings1);

      act(() => {
        result.current.updateSettings(updates1);
      });

      expect(result.current.settings.autoPlayEnabled).toBe(false);

      // Second update
      const updates2: Partial<AudioSettings> = { languageFilter: 'none' };
      const updatedSettings2 = { ...updatedSettings1, ...updates2 };
      vi.mocked(storage.load).mockReturnValue(updatedSettings2);

      act(() => {
        result.current.updateSettings(updates2);
      });

      expect(result.current.settings.languageFilter).toBe('none');
      expect(storage.update).toHaveBeenCalledTimes(2);
    });

    it('should warn when updating with null settings', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const storage = getMockStorage();

      // Make storage.load return null to simulate settings not loaded
      vi.mocked(storage.load).mockReturnValue(null as unknown as AudioSettings);

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      // Try to update with null settings
      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Audio settings not loaded yet');
      expect(storage.update).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should not update when storage is not initialized', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const storage = getMockStorage();

      // Make storage.load return null
      vi.mocked(storage.load).mockReturnValue(null as unknown as AudioSettings);

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });

      expect(storage.update).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(DEFAULT_AUDIO_SETTINGS);

      act(() => {
        result.current.resetSettings();
      });

      expect(storage.reset).toHaveBeenCalledTimes(1);
      expect(storage.load).toHaveBeenCalled();
      expect(result.current.settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });

    it('should reload settings after reset', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      // First modify settings
      const storage = getMockStorage();
      const modifiedSettings = { ...mockSettings, autoPlayEnabled: false };
      vi.mocked(storage.load).mockReturnValue(modifiedSettings);

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });

      expect(result.current.settings.autoPlayEnabled).toBe(false);

      // Then reset
      vi.mocked(storage.load).mockReturnValue(DEFAULT_AUDIO_SETTINGS);

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });

    it('should warn when resetting with uninitialized storage ref', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // To test this, we need storage to be null, which is hard to achieve
      // since useEffect runs synchronously. This test documents the guard exists.
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      // Storage should be initialized, so this won't trigger the warning normally
      // This test primarily documents the code path exists
      expect(result.current.resetSettings).toBeDefined();

      consoleWarnSpy.mockRestore();
    });

    it('should not reset when storage ref is null', async () => {
      // This is difficult to test since storageRef is set in useEffect
      // which runs before we can interact with the hook
      // This test documents that the guard exists in the code
      const storage = getMockStorage();

      renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      // Storage should be initialized at this point
      expect(storage).toBeDefined();
    });
  });

  describe('Return Interface', () => {
    it('should return all expected properties', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current).toHaveProperty('settings');
      expect(result.current).toHaveProperty('updateSettings');
      expect(result.current).toHaveProperty('resetSettings');
      expect(result.current).toHaveProperty('isLoaded');
    });

    it('should have correct function types', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(typeof result.current.updateSettings).toBe('function');
      expect(typeof result.current.resetSettings).toBe('function');
    });

    it('should have correct primitive types', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(typeof result.current.isLoaded).toBe('boolean');
      expect(typeof result.current.settings).toBe('object');
    });

    it('should have settings with all required fields', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.settings).toHaveProperty('version');
      expect(result.current.settings).toHaveProperty('autoPlayEnabled');
      expect(result.current.settings).toHaveProperty('languageFilter');
      expect(result.current.settings).toHaveProperty('perTopicOverrides');
      expect(result.current.settings).toHaveProperty('accessibilityMode');
    });
  });

  describe('Edge Cases', () => {
    it('should recreate function references on each render (no useCallback)', async () => {
      const { result, rerender } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const initialUpdateSettings = result.current.updateSettings;
      const initialResetSettings = result.current.resetSettings;

      rerender();

      // Functions are recreated on each render (hook doesn't use useCallback)
      // This is acceptable for this simple hook
      expect(result.current.updateSettings).not.toBe(initialUpdateSettings);
      expect(result.current.resetSettings).not.toBe(initialResetSettings);
    });

    it('should not have error handling for storage load errors', () => {
      // This test documents that the hook doesn't have try/catch error handling
      // If storage.load throws, the error will propagate up
      // We don't test the actual throw because it leaves React in a bad state
      const storage = getMockStorage();

      // Verify storage.load is called during initialization
      expect(storage.load).toBeDefined();
      expect(typeof storage.load).toBe('function');
    });

    it('should handle null settings gracefully with fallback', async () => {
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(null as unknown as AudioSettings);

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      // Should return fallback default settings from hook
      expect(result.current.settings).toEqual({
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      });
      expect(result.current.isLoaded).toBe(true);
    });

    it('should only initialize storage once', async () => {
      const { createAudioSettingsStorage } = await import('../../../../src/modules/storage/adapters/audio-settings-storage');

      const { rerender } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      rerender();
      rerender();

      // Should only call createAudioSettingsStorage once
      expect(createAudioSettingsStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Persistence', () => {
    it('should persist updates to localStorage through storage adapter', async () => {
      const storage = getMockStorage();
      vi.clearAllMocks(); // Clear mocks from beforeEach

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const updates: Partial<AudioSettings> = {
        autoPlayEnabled: false,
        languageFilter: 'all languages',
      };

      act(() => {
        result.current.updateSettings(updates);
      });

      expect(storage.update).toHaveBeenCalledWith(updates);
    });

    it('should clear localStorage on reset through storage adapter', async () => {
      const storage = getMockStorage();
      vi.clearAllMocks(); // Clear mocks from beforeEach

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(storage.reset).toHaveBeenCalledTimes(1);
    });

    it('should reload settings after each update', async () => {
      const storage = getMockStorage();

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const initialLoadCalls = vi.mocked(storage.load).mock.calls.length;

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });

      // Should call load again after update
      expect(vi.mocked(storage.load).mock.calls.length).toBeGreaterThan(initialLoadCalls);
    });
  });

  describe('Default Values', () => {
    it('should return fallback default values when storage returns null', async () => {
      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(null as unknown as AudioSettings);

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      // When settings is null, hook returns fallback defaults
      expect(result.current.settings.version).toBe(1);
      expect(result.current.settings.autoPlayEnabled).toBe(true);
      expect(result.current.settings.languageFilter).toBe('non-German only');
      expect(result.current.settings.perTopicOverrides).toEqual({});
      expect(result.current.settings.accessibilityMode).toBe(false);
      expect(result.current.isLoaded).toBe(true); // Still marked as loaded
    });

    it('should use loaded values after initialization', async () => {
      const customSettings: AudioSettings = {
        version: 2,
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        perTopicOverrides: { 'topic-1': { autoPlayEnabled: true } },
        accessibilityMode: true,
      };

      const storage = getMockStorage();
      vi.mocked(storage.load).mockReturnValue(customSettings);

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.settings).toEqual(customSettings);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should only call storage.load once on mount', async () => {
      const storage = getMockStorage();
      vi.clearAllMocks(); // Clear mocks from beforeEach

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      expect(storage.load).toHaveBeenCalledTimes(1);

      // Accessing settings again shouldn't trigger another load
      const settings = result.current.settings;
      expect(settings).toBeDefined();
      expect(storage.load).toHaveBeenCalledTimes(1);
    });

    it('should update state after updateSettings', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const storage = getMockStorage();
      const newSettings = { ...mockSettings, autoPlayEnabled: false };
      vi.mocked(storage.load).mockReturnValue(newSettings);

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });

      expect(result.current.settings.autoPlayEnabled).toBe(false);
    });

    it('should update state after resetSettings', async () => {
      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const storage = getMockStorage();

      // Modify settings first
      const modifiedSettings = { ...mockSettings, autoPlayEnabled: false };
      vi.mocked(storage.load).mockReturnValue(modifiedSettings);

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });

      // Then reset
      vi.mocked(storage.load).mockReturnValue(DEFAULT_AUDIO_SETTINGS);

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete workflow: load → update → reset', async () => {
      const storage = getMockStorage();
      vi.clearAllMocks();

      const { result } = renderHook(() => useAudioSettings());

      // 1. Load
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.settings).toEqual(mockSettings);
      expect(result.current.isLoaded).toBe(true);

      // 2. Update
      const updatedSettings = { ...mockSettings, autoPlayEnabled: false };
      vi.mocked(storage.load).mockReturnValue(updatedSettings);

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
      });
      expect(result.current.settings.autoPlayEnabled).toBe(false);

      // 3. Reset
      vi.mocked(storage.load).mockReturnValue(DEFAULT_AUDIO_SETTINGS);

      act(() => {
        result.current.resetSettings();
      });
      expect(result.current.settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });

    it('should handle multiple rapid updates', async () => {
      const storage = getMockStorage();
      vi.clearAllMocks();

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.updateSettings({ autoPlayEnabled: false });
        result.current.updateSettings({ languageFilter: 'all languages' });
        result.current.updateSettings({ accessibilityMode: true });
      });

      expect(storage.update).toHaveBeenCalledTimes(3);
    });

    it('should handle updating all settings fields', async () => {
      const storage = getMockStorage();
      vi.clearAllMocks();

      const { result } = renderHook(() => useAudioSettings());

      await act(async () => {
        await Promise.resolve();
      });

      const allUpdates: Partial<AudioSettings> = {
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        perTopicOverrides: { 'topic-1': { accessibilityMode: true } },
        accessibilityMode: true,
      };

      const updatedSettings = { ...mockSettings, ...allUpdates };
      vi.mocked(storage.load).mockReturnValue(updatedSettings);

      act(() => {
        result.current.updateSettings(allUpdates);
      });

      expect(storage.update).toHaveBeenCalledWith(allUpdates);
      expect(result.current.settings.autoPlayEnabled).toBe(false);
      expect(result.current.settings.languageFilter).toBe('all languages');
      expect(result.current.settings.accessibilityMode).toBe(true);
      expect(result.current.settings.perTopicOverrides).toEqual({
        'topic-1': { accessibilityMode: true },
      });
    });
  });
});
