import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfetti } from '../../../../src/modules/ui/hooks/use-confetti';
import * as confettiServiceModule from '../../../../src/modules/core/services/confetti-service';
import * as celebrationSoundServiceModule from '../../../../src/modules/core/services/celebration-sound-service';
import * as useAppSettingsModule from '../../../../src/modules/ui/hooks/use-app-settings';
import type { AppSettings } from '../../../../src/modules/core/entities/app-settings';

// Mock the services
const mockFire = vi.fn().mockResolvedValue(undefined);
const mockCancel = vi.fn();
const mockSetEnabledCheck = vi.fn();
const mockSetAccessibilityCheck = vi.fn();
const mockIsSupported = vi.fn().mockReturnValue(true);

const mockConfettiService = {
  fire: mockFire,
  fireStandard: vi.fn().mockResolvedValue(undefined),
  fireFirework: vi.fn().mockResolvedValue(undefined),
  fireCannon: vi.fn().mockResolvedValue(undefined),
  fireEmoji: vi.fn().mockResolvedValue(undefined),
  cancel: mockCancel,
  setEnabledCheck: mockSetEnabledCheck,
  setAccessibilityCheck: mockSetAccessibilityCheck,
  isSupported: mockIsSupported,
};

const mockPlayConfettiSound = vi.fn().mockResolvedValue(undefined);
const mockPreload = vi.fn();
const mockCelebrationSoundService = {
  isSupported: vi.fn().mockReturnValue(true),
  playConfettiSound: mockPlayConfettiSound,
  setEnabledCheck: vi.fn(),
  setVolumeGetter: vi.fn(),
  preload: mockPreload,
};

vi.spyOn(confettiServiceModule, 'getConfettiService').mockReturnValue(
  mockConfettiService as unknown as confettiServiceModule.ConfettiService
);

vi.spyOn(celebrationSoundServiceModule, 'getCelebrationSoundService').mockReturnValue(
  mockCelebrationSoundService as unknown as celebrationSoundServiceModule.CelebrationSoundService
);

// Mock settings
const createMockSettings = (overrides?: Partial<AppSettings>): AppSettings => ({
  version: 1,
  theme: {
    mode: 'system',
    fontScale: 'medium',
    animationsEnabled: true,
    reducedMotion: false,
  },
  audio: {
    autoPlayEnabled: true,
    autoPlayRepeats: 1,
    autoPlayDelayMs: 1000,
    soundEffectsEnabled: true,
    soundEffectsVolume: 0.8,
    successChimeEnabled: true,
    playbackRate: 1,
  },
  learning: {
    algorithm: 'fsrs',
    dailyGoal: 20,
    sessionSize: 10,
    repeatDifficultTasks: true,
    randomizeOrder: true,
  },
  notifications: {
    dailyReminderEnabled: false,
    dailyReminderTime: '18:00',
    dailyReminderMessage: 'Zeit zum Lernen!',
    streakWarningEnabled: true,
    weeklyReportEnabled: false,
  },
  interaction: {
    vibrationsEnabled: true,
    vibrationOnCorrect: true,
    vibrationOnIncorrect: true,
    vibrationOnSessionComplete: false,
    confettiEnabled: true,
    confettiStyle: 'standard',
    confettiIntensity: 'medium',
    confettiSoundEnabled: true,
    wakeLockEnabled: true,
    keyboardShortcutsEnabled: true,
  },
  ai: {
    explanationsEnabled: false,
    explanationDepth: 'medium',
    includeExamples: true,
    showLearningTips: true,
    trainingOptIn: false,
    dailyUsageLimit: 20,
    usageToday: 0,
  },
  privacy: {
    dataStorageMode: 'local',
    analyticsEnabled: false,
    errorReportsEnabled: false,
    betaFeaturesEnabled: false,
  },
  language: {
    interfaceLanguage: 'de',
    timezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
  },
  database: {
    lastUpdatedAt: null,
    storageUsageBytes: null,
  },
  lastSavedAt: null,
  ...overrides,
});

describe('useConfetti', () => {
  const mockSettings = createMockSettings();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
      settings: mockSettings,
      loading: false,
      saveState: 'idle',
      storageEstimate: null,
      updateSettings: vi.fn(),
      resetSettings: vi.fn(),
      exportSettings: vi.fn(),
      importSettingsFromText: vi.fn(),
    });
  });

  describe('initialization', () => {
    it('should return isSupported based on service', () => {
      const { result } = renderHook(() => useConfetti());
      // isSupported is set from the ref on mount
      expect(result.current.isSupported).toBeDefined();
    });

    it('should return isEnabled based on settings', () => {
      const { result } = renderHook(() => useConfetti());
      expect(result.current.isEnabled).toBe(true);
    });

    it('should return isEnabled as false when confetti is disabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: {
            ...mockSettings.interaction,
            confettiEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      const { result } = renderHook(() => useConfetti());
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('fire', () => {
    it('should call service.fire with settings values', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire();
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'medium');
    });

    it('should allow overriding style and intensity', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ style: 'firework', intensity: 'strong' });
      });

      expect(mockFire).toHaveBeenCalledWith('firework', 'strong');
    });

    it('should play sound when withSound is true and sound is enabled', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ withSound: true });
      });

      expect(mockPlayConfettiSound).toHaveBeenCalled();
    });

    it('should not fire when confetti is disabled', async () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: {
            ...mockSettings.interaction,
            confettiEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire();
      });

      expect(mockFire).not.toHaveBeenCalled();
    });
  });

  describe('firePerfectSession', () => {
    it('should call fire with sound enabled', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.firePerfectSession();
      });

      expect(mockFire).toHaveBeenCalled();
      expect(mockPlayConfettiSound).toHaveBeenCalled();
    });
  });

  describe('fireStreakMilestone', () => {
    it('should use light intensity for streaks under 30 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(7);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'light');
    });

    it('should use medium intensity for streaks 30-99 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(50);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'medium');
    });

    it('should use strong intensity for streaks 100+ days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(100);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'strong');
    });
  });

  describe('fireLevelUp', () => {
    it('should call fire with sound enabled', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireLevelUp();
      });

      expect(mockFire).toHaveBeenCalled();
      expect(mockPlayConfettiSound).toHaveBeenCalled();
    });
  });

  describe('fireFirstAchievement', () => {
    it('should use firework style', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireFirstAchievement();
      });

      expect(mockFire).toHaveBeenCalledWith('firework', 'medium');
    });
  });

  describe('fireSpecialEvent', () => {
    it('should use emoji style and strong intensity', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireSpecialEvent();
      });

      expect(mockFire).toHaveBeenCalledWith('emoji', 'strong');
    });
  });

  describe('cancel', () => {
    it('should call service cancel', () => {
      const { result } = renderHook(() => useConfetti());

      act(() => {
        result.current.cancel();
      });

      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe('settings edge cases', () => {
    it('should handle null settings in enabled check', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: null as any,
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // The setEnabledCheck callback should be called during initialization
      expect(mockSetEnabledCheck).toHaveBeenCalled();

      // Call the enabled check callback with null settings
      const enabledCheckCallback = mockSetEnabledCheck.mock.calls[0][0];
      const result = enabledCheckCallback();

      expect(result).toBe(false);
    });

    it('should return true in enabled check when confetti is enabled in settings', () => {
      renderHook(() => useConfetti());

      // The setEnabledCheck callback should be called during initialization
      expect(mockSetEnabledCheck).toHaveBeenCalled();

      // Call the enabled check callback with valid settings where confetti is enabled
      const enabledCheckCallback = mockSetEnabledCheck.mock.calls[0][0];
      const result = enabledCheckCallback();

      expect(result).toBe(true);
    });

    it('should return false in enabled check when confetti is disabled in settings', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: {
            ...mockSettings.interaction,
            confettiEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // The setEnabledCheck callback should be called during initialization
      expect(mockSetEnabledCheck).toHaveBeenCalled();

      // Call the enabled check callback with valid settings where confetti is disabled
      const enabledCheckCallback = mockSetEnabledCheck.mock.calls[0][0];
      const result = enabledCheckCallback();

      expect(result).toBe(false);
    });

    it('should handle null settings in accessibility check', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: null as any,
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // The setAccessibilityCheck callback should be called during initialization
      expect(mockSetAccessibilityCheck).toHaveBeenCalled();

      // Call the accessibility check callback with null settings
      const accessibilityCheckCallback = mockSetAccessibilityCheck.mock.calls[0][0];
      const result = accessibilityCheckCallback();

      expect(result).toBe(false);
    });

    it('should return true in accessibility check when reducedMotion is enabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          theme: {
            ...mockSettings.theme,
            reducedMotion: true,
            animationsEnabled: true,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // Get the accessibility check callback
      const accessibilityCheckCallback = mockSetAccessibilityCheck.mock.calls[0][0];
      const result = accessibilityCheckCallback();

      expect(result).toBe(true);
    });

    it('should return true in accessibility check when animations are disabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          theme: {
            ...mockSettings.theme,
            reducedMotion: false,
            animationsEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // Get the accessibility check callback
      const accessibilityCheckCallback = mockSetAccessibilityCheck.mock.calls[0][0];
      const result = accessibilityCheckCallback();

      expect(result).toBe(true);
    });
  });

  describe('sound configuration', () => {
    it('should configure sound service when confetti sound is disabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: {
            ...mockSettings.interaction,
            confettiSoundEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // Verify the sound service enabled check was configured
      expect(mockCelebrationSoundService.setEnabledCheck).toHaveBeenCalled();

      // Get the enabled check callback and verify it returns false
      const enabledCheckCallback = mockCelebrationSoundService.setEnabledCheck.mock.calls[0][0];
      const result = enabledCheckCallback();

      expect(result).toBe(false);
    });

    it('should configure sound service when sound effects are disabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          audio: {
            ...mockSettings.audio,
            soundEffectsEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      renderHook(() => useConfetti());

      // Verify the sound service enabled check was configured
      expect(mockCelebrationSoundService.setEnabledCheck).toHaveBeenCalled();

      // Get the enabled check callback and verify it returns false
      const enabledCheckCallback = mockCelebrationSoundService.setEnabledCheck.mock.calls[0][0];
      const result = enabledCheckCallback();

      expect(result).toBe(false);
    });

    it('should not play sound when withSound is explicitly false', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ withSound: false });
      });

      expect(mockPlayConfettiSound).not.toHaveBeenCalled();
    });

    it('should not play sound when confetti sound is disabled in settings', async () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: {
            ...mockSettings.interaction,
            confettiSoundEnabled: false,
          },
        }),
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ withSound: true });
      });

      expect(mockPlayConfettiSound).not.toHaveBeenCalled();
    });
  });

  describe('confetti style variations', () => {
    it('should fire with cannon style when specified', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ style: 'cannon' });
      });

      expect(mockFire).toHaveBeenCalledWith('cannon', 'medium');
    });

    it('should fire with emoji style when specified', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ style: 'emoji' });
      });

      expect(mockFire).toHaveBeenCalledWith('emoji', 'medium');
    });
  });

  describe('intensity variations', () => {
    it('should fire with light intensity when specified', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ intensity: 'light' });
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'light');
    });

    it('should fire with strong intensity when specified', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fire({ intensity: 'strong' });
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'strong');
    });
  });

  describe('streak milestone edge cases', () => {
    it('should use light intensity for exactly 29 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(29);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'light');
    });

    it('should use medium intensity for exactly 30 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(30);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'medium');
    });

    it('should use medium intensity for exactly 99 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(99);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'medium');
    });

    it('should use strong intensity for exactly 100 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(100);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'strong');
    });

    it('should use light intensity for 0 days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(0);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'light');
    });

    it('should use strong intensity for very high streak days', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireStreakMilestone(365);
      });

      expect(mockFire).toHaveBeenCalledWith('standard', 'strong');
    });
  });

  describe('isEnabled edge case', () => {
    it('should return false when settings is null', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: null as any,
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      const { result } = renderHook(() => useConfetti());

      expect(result.current.isEnabled).toBe(false);
    });

    it('should return false when settings is undefined', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: undefined as any,
        loading: false,
        saveState: 'idle',
        storageEstimate: null,
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
      });

      const { result } = renderHook(() => useConfetti());

      expect(result.current.isEnabled).toBe(false);
    });
  });
});
