/**
 * Tests for AppSettings Domain Model
 *
 * Tests the application settings including:
 * - Default settings initialization
 * - Settings validation and sanitization
 * - Edge cases for all preference categories
 * - Null/undefined handling
 * - Boundary testing for numeric values
 * - Timezone resolution
 * - Type guards for all enums
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_APP_SETTINGS,
  validateAppSettings,
  type AppSettings,
  type ThemeMode,
  type FontScale,
  type LearningAlgorithm,
  type ConfettiStyle,
  type ConfettiIntensity,
  type AIDepth,
  type DataStorageMode,
  type InterfaceLanguage,
  type DateFormat,
} from '../../../../src/modules/core/entities/app-settings';

describe('AppSettings', () => {
  describe('DEFAULT_APP_SETTINGS', () => {
    it('should have valid default settings', () => {
      expect(DEFAULT_APP_SETTINGS).toBeDefined();
      expect(DEFAULT_APP_SETTINGS.version).toBe(1);
    });

    it('should have valid theme defaults', () => {
      expect(DEFAULT_APP_SETTINGS.theme.mode).toBe('system');
      expect(DEFAULT_APP_SETTINGS.theme.fontScale).toBe('medium');
      expect(DEFAULT_APP_SETTINGS.theme.animationsEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.theme.reducedMotion).toBe(false);
    });

    it('should have valid audio defaults', () => {
      expect(DEFAULT_APP_SETTINGS.audio.autoPlayEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.audio.autoPlayRepeats).toBe(1);
      expect(DEFAULT_APP_SETTINGS.audio.autoPlayDelayMs).toBe(1000);
      expect(DEFAULT_APP_SETTINGS.audio.soundEffectsEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.audio.soundEffectsVolume).toBe(0.8);
      expect(DEFAULT_APP_SETTINGS.audio.successChimeEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.audio.playbackRate).toBe(1);
    });

    it('should have valid learning defaults', () => {
      expect(DEFAULT_APP_SETTINGS.learning.algorithm).toBe('fsrs');
      expect(DEFAULT_APP_SETTINGS.learning.dailyGoal).toBe(20);
      expect(DEFAULT_APP_SETTINGS.learning.sessionSize).toBe(10);
      expect(DEFAULT_APP_SETTINGS.learning.repeatDifficultTasks).toBe(true);
      expect(DEFAULT_APP_SETTINGS.learning.randomizeOrder).toBe(true);
    });

    it('should have valid notification defaults', () => {
      expect(DEFAULT_APP_SETTINGS.notifications.dailyReminderEnabled).toBe(false);
      expect(DEFAULT_APP_SETTINGS.notifications.dailyReminderTime).toBe('18:00');
      expect(DEFAULT_APP_SETTINGS.notifications.dailyReminderMessage).toBe('Zeit zum Lernen! 📚');
      expect(DEFAULT_APP_SETTINGS.notifications.streakWarningEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.notifications.weeklyReportEnabled).toBe(false);
    });

    it('should have valid interaction defaults', () => {
      expect(DEFAULT_APP_SETTINGS.interaction.vibrationsEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.interaction.vibrationOnCorrect).toBe(true);
      expect(DEFAULT_APP_SETTINGS.interaction.vibrationOnIncorrect).toBe(true);
      expect(DEFAULT_APP_SETTINGS.interaction.vibrationOnSessionComplete).toBe(false);
      expect(DEFAULT_APP_SETTINGS.interaction.confettiEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.interaction.confettiStyle).toBe('standard');
      expect(DEFAULT_APP_SETTINGS.interaction.confettiIntensity).toBe('medium');
      expect(DEFAULT_APP_SETTINGS.interaction.confettiSoundEnabled).toBe(false);
      expect(DEFAULT_APP_SETTINGS.interaction.wakeLockEnabled).toBe(true);
      expect(DEFAULT_APP_SETTINGS.interaction.keyboardShortcutsEnabled).toBe(true);
    });

    it('should have valid AI defaults', () => {
      expect(DEFAULT_APP_SETTINGS.ai.explanationsEnabled).toBe(false);
      expect(DEFAULT_APP_SETTINGS.ai.explanationDepth).toBe('medium');
      expect(DEFAULT_APP_SETTINGS.ai.includeExamples).toBe(true);
      expect(DEFAULT_APP_SETTINGS.ai.showLearningTips).toBe(true);
      expect(DEFAULT_APP_SETTINGS.ai.trainingOptIn).toBe(false);
      expect(DEFAULT_APP_SETTINGS.ai.dailyUsageLimit).toBe(20);
      expect(DEFAULT_APP_SETTINGS.ai.usageToday).toBe(0);
    });

    it('should have valid privacy defaults', () => {
      expect(DEFAULT_APP_SETTINGS.privacy.dataStorageMode).toBe('local');
      expect(DEFAULT_APP_SETTINGS.privacy.analyticsEnabled).toBe(false);
      expect(DEFAULT_APP_SETTINGS.privacy.errorReportsEnabled).toBe(false);
      expect(DEFAULT_APP_SETTINGS.privacy.betaFeaturesEnabled).toBe(false);
    });

    it('should have valid language defaults', () => {
      expect(DEFAULT_APP_SETTINGS.language.interfaceLanguage).toBe('de');
      expect(DEFAULT_APP_SETTINGS.language.timezone).toBeDefined();
      expect(DEFAULT_APP_SETTINGS.language.dateFormat).toBe('DD.MM.YYYY');
    });

    it('should have valid database defaults', () => {
      expect(DEFAULT_APP_SETTINGS.database.lastUpdatedAt).toBeNull();
      expect(DEFAULT_APP_SETTINGS.database.storageUsageBytes).toBeNull();
    });

    it('should have lastSavedAt as null', () => {
      expect(DEFAULT_APP_SETTINGS.lastSavedAt).toBeNull();
    });
  });

  describe('validateAppSettings - null/undefined handling', () => {
    it('should return default settings when input is null', () => {
      const result = validateAppSettings(null);
      expect(result).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should return default settings when input is undefined', () => {
      const result = validateAppSettings(undefined);
      expect(result).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should return default settings when input is not an object (string)', () => {
      const result = validateAppSettings('invalid');
      expect(result).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should return default settings when input is not an object (number)', () => {
      const result = validateAppSettings(123);
      expect(result).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should return default settings when input is not an object (boolean)', () => {
      const result = validateAppSettings(true);
      expect(result).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should return default settings when input is an array', () => {
      const result = validateAppSettings([]);
      expect(result).toEqual(DEFAULT_APP_SETTINGS);
    });
  });

  describe('validateAppSettings - valid input', () => {
    it('should accept valid complete settings', () => {
      const validSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        version: 2,
      };

      const result = validateAppSettings(validSettings);
      expect(result.version).toBe(2);
    });

    it('should accept partial settings and fill in defaults', () => {
      const partialSettings = {
        version: 1,
        theme: {
          mode: 'dark' as ThemeMode,
        },
      };

      const result = validateAppSettings(partialSettings);
      expect(result.theme.mode).toBe('dark');
      expect(result.theme.fontScale).toBe(DEFAULT_APP_SETTINGS.theme.fontScale);
      expect(result.audio).toEqual(DEFAULT_APP_SETTINGS.audio);
    });

    it('should use default version if not a number', () => {
      const settings = {
        version: 'invalid',
      };

      const result = validateAppSettings(settings);
      expect(result.version).toBe(DEFAULT_APP_SETTINGS.version);
    });

    it('should handle valid lastSavedAt as string', () => {
      const settings = {
        lastSavedAt: '2025-01-01T00:00:00Z',
      };

      const result = validateAppSettings(settings);
      expect(result.lastSavedAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should handle lastSavedAt as null', () => {
      const settings = {
        lastSavedAt: null,
      };

      const result = validateAppSettings(settings);
      expect(result.lastSavedAt).toBeNull();
    });

    it('should use default lastSavedAt for invalid types', () => {
      const settings = {
        lastSavedAt: 123,
      };

      const result = validateAppSettings(settings);
      expect(result.lastSavedAt).toBe(DEFAULT_APP_SETTINGS.lastSavedAt);
    });
  });

  describe('Theme settings validation', () => {
    it('should accept valid theme modes', () => {
      const modes: ThemeMode[] = ['light', 'dark', 'system'];

      modes.forEach(mode => {
        const result = validateAppSettings({
          theme: { mode },
        });
        expect(result.theme.mode).toBe(mode);
      });
    });

    it('should use default mode for invalid theme mode', () => {
      const result = validateAppSettings({
        theme: { mode: 'invalid' },
      });
      expect(result.theme.mode).toBe(DEFAULT_APP_SETTINGS.theme.mode);
    });

    it('should accept valid font scales', () => {
      const scales: FontScale[] = ['small', 'medium', 'large', 'x-large'];

      scales.forEach(fontScale => {
        const result = validateAppSettings({
          theme: { fontScale },
        });
        expect(result.theme.fontScale).toBe(fontScale);
      });
    });

    it('should use default font scale for invalid value', () => {
      const result = validateAppSettings({
        theme: { fontScale: 'invalid' },
      });
      expect(result.theme.fontScale).toBe(DEFAULT_APP_SETTINGS.theme.fontScale);
    });

    it('should handle animationsEnabled as boolean', () => {
      const result1 = validateAppSettings({
        theme: { animationsEnabled: true },
      });
      expect(result1.theme.animationsEnabled).toBe(true);

      const result2 = validateAppSettings({
        theme: { animationsEnabled: false },
      });
      expect(result2.theme.animationsEnabled).toBe(false);
    });

    it('should coerce truthy values to boolean for animationsEnabled', () => {
      const result = validateAppSettings({
        theme: { animationsEnabled: 'yes' },
      });
      expect(result.theme.animationsEnabled).toBe(true);
    });

    it('should handle reducedMotion as boolean', () => {
      const result1 = validateAppSettings({
        theme: { reducedMotion: true },
      });
      expect(result1.theme.reducedMotion).toBe(true);

      const result2 = validateAppSettings({
        theme: { reducedMotion: false },
      });
      expect(result2.theme.reducedMotion).toBe(false);
    });

    it('should handle null theme object', () => {
      const result = validateAppSettings({
        theme: null,
      });
      expect(result.theme).toEqual(DEFAULT_APP_SETTINGS.theme);
    });

    it('should handle undefined theme object', () => {
      const result = validateAppSettings({
        theme: undefined,
      });
      expect(result.theme).toEqual(DEFAULT_APP_SETTINGS.theme);
    });
  });

  describe('Audio preferences validation', () => {
    it('should accept valid autoPlayRepeats values', () => {
      const repeats: Array<1 | 2 | 3> = [1, 2, 3];

      repeats.forEach(value => {
        const result = validateAppSettings({
          audio: { autoPlayRepeats: value },
        });
        expect(result.audio.autoPlayRepeats).toBe(value);
      });
    });

    it('should use default for invalid autoPlayRepeats', () => {
      const result = validateAppSettings({
        audio: { autoPlayRepeats: 5 },
      });
      expect(result.audio.autoPlayRepeats).toBe(1);
    });

    it('should clamp autoPlayDelayMs to valid range', () => {
      const result1 = validateAppSettings({
        audio: { autoPlayDelayMs: -100 },
      });
      expect(result1.audio.autoPlayDelayMs).toBe(0);

      const result2 = validateAppSettings({
        audio: { autoPlayDelayMs: 10000 },
      });
      expect(result2.audio.autoPlayDelayMs).toBe(5000);

      const result3 = validateAppSettings({
        audio: { autoPlayDelayMs: 2500 },
      });
      expect(result3.audio.autoPlayDelayMs).toBe(2500);
    });

    it('should handle NaN for autoPlayDelayMs', () => {
      const result = validateAppSettings({
        audio: { autoPlayDelayMs: NaN },
      });
      expect(result.audio.autoPlayDelayMs).toBe(0);
    });

    it('should clamp soundEffectsVolume to 0-1 range', () => {
      const result1 = validateAppSettings({
        audio: { soundEffectsVolume: -0.5 },
      });
      expect(result1.audio.soundEffectsVolume).toBe(0);

      const result2 = validateAppSettings({
        audio: { soundEffectsVolume: 1.5 },
      });
      expect(result2.audio.soundEffectsVolume).toBe(1);

      const result3 = validateAppSettings({
        audio: { soundEffectsVolume: 0.5 },
      });
      expect(result3.audio.soundEffectsVolume).toBe(0.5);
    });

    it('should handle NaN for soundEffectsVolume', () => {
      const result = validateAppSettings({
        audio: { soundEffectsVolume: NaN },
      });
      expect(result.audio.soundEffectsVolume).toBe(0);
    });

    it('should accept valid playback rates', () => {
      const rates: Array<0.5 | 0.75 | 1 | 1.25 | 1.5> = [0.5, 0.75, 1, 1.25, 1.5];

      rates.forEach(rate => {
        const result = validateAppSettings({
          audio: { playbackRate: rate },
        });
        expect(result.audio.playbackRate).toBe(rate);
      });
    });

    it('should use default for invalid playback rate', () => {
      const result = validateAppSettings({
        audio: { playbackRate: 2 },
      });
      expect(result.audio.playbackRate).toBe(DEFAULT_APP_SETTINGS.audio.playbackRate);
    });

    it('should handle boolean audio flags', () => {
      const result = validateAppSettings({
        audio: {
          autoPlayEnabled: false,
          soundEffectsEnabled: false,
          successChimeEnabled: false,
        },
      });
      expect(result.audio.autoPlayEnabled).toBe(false);
      expect(result.audio.soundEffectsEnabled).toBe(false);
      expect(result.audio.successChimeEnabled).toBe(false);
    });

    it('should handle null audio object', () => {
      const result = validateAppSettings({
        audio: null,
      });
      expect(result.audio).toEqual(DEFAULT_APP_SETTINGS.audio);
    });
  });

  describe('Learning preferences validation', () => {
    it('should accept valid learning algorithms', () => {
      const algorithms: LearningAlgorithm[] = ['sm-2', 'fsrs', 'neural'];

      algorithms.forEach(algorithm => {
        const result = validateAppSettings({
          learning: { algorithm },
        });
        expect(result.learning.algorithm).toBe(algorithm);
      });
    });

    it('should use default for invalid algorithm', () => {
      const result = validateAppSettings({
        learning: { algorithm: 'invalid' },
      });
      expect(result.learning.algorithm).toBe(DEFAULT_APP_SETTINGS.learning.algorithm);
    });

    it('should clamp dailyGoal to 1-200 range', () => {
      const result1 = validateAppSettings({
        learning: { dailyGoal: 0 },
      });
      expect(result1.learning.dailyGoal).toBe(1);

      const result2 = validateAppSettings({
        learning: { dailyGoal: 300 },
      });
      expect(result2.learning.dailyGoal).toBe(200);

      const result3 = validateAppSettings({
        learning: { dailyGoal: 50 },
      });
      expect(result3.learning.dailyGoal).toBe(50);
    });

    it('should handle NaN for dailyGoal', () => {
      const result = validateAppSettings({
        learning: { dailyGoal: NaN },
      });
      expect(result.learning.dailyGoal).toBe(1);
    });

    it('should clamp sessionSize to 1-100 range', () => {
      const result1 = validateAppSettings({
        learning: { sessionSize: 0 },
      });
      expect(result1.learning.sessionSize).toBe(1);

      const result2 = validateAppSettings({
        learning: { sessionSize: 150 },
      });
      expect(result2.learning.sessionSize).toBe(100);

      const result3 = validateAppSettings({
        learning: { sessionSize: 25 },
      });
      expect(result3.learning.sessionSize).toBe(25);
    });

    it('should handle NaN for sessionSize', () => {
      const result = validateAppSettings({
        learning: { sessionSize: NaN },
      });
      expect(result.learning.sessionSize).toBe(1);
    });

    it('should handle boolean learning flags', () => {
      const result = validateAppSettings({
        learning: {
          repeatDifficultTasks: false,
          randomizeOrder: false,
        },
      });
      expect(result.learning.repeatDifficultTasks).toBe(false);
      expect(result.learning.randomizeOrder).toBe(false);
    });

    it('should handle null learning object', () => {
      const result = validateAppSettings({
        learning: null,
      });
      expect(result.learning).toEqual(DEFAULT_APP_SETTINGS.learning);
    });
  });

  describe('Notification preferences validation', () => {
    it('should validate time format for dailyReminderTime', () => {
      const result1 = validateAppSettings({
        notifications: { dailyReminderTime: '09:30' },
      });
      expect(result1.notifications.dailyReminderTime).toBe('09:30');

      const result2 = validateAppSettings({
        notifications: { dailyReminderTime: '23:59' },
      });
      expect(result2.notifications.dailyReminderTime).toBe('23:59');
    });

    it('should use default for invalid time format', () => {
      const result1 = validateAppSettings({
        notifications: { dailyReminderTime: '9:30' },
      });
      expect(result1.notifications.dailyReminderTime).toBe(DEFAULT_APP_SETTINGS.notifications.dailyReminderTime);

      const result2 = validateAppSettings({
        notifications: { dailyReminderTime: 'invalid' },
      });
      expect(result2.notifications.dailyReminderTime).toBe(DEFAULT_APP_SETTINGS.notifications.dailyReminderTime);

      const result3 = validateAppSettings({
        notifications: { dailyReminderTime: '1:00' },
      });
      expect(result3.notifications.dailyReminderTime).toBe(DEFAULT_APP_SETTINGS.notifications.dailyReminderTime);
    });

    it('should accept time with valid format even if semantically invalid', () => {
      // Note: The current implementation only checks format \d{2}:\d{2}, not actual time validity
      const result = validateAppSettings({
        notifications: { dailyReminderTime: '25:00' },
      });
      expect(result.notifications.dailyReminderTime).toBe('25:00');
    });

    it('should validate message length (max 120 characters)', () => {
      const validMessage = 'A'.repeat(120);
      const result1 = validateAppSettings({
        notifications: { dailyReminderMessage: validMessage },
      });
      expect(result1.notifications.dailyReminderMessage).toBe(validMessage);

      const tooLong = 'A'.repeat(121);
      const result2 = validateAppSettings({
        notifications: { dailyReminderMessage: tooLong },
      });
      expect(result2.notifications.dailyReminderMessage).toBe(DEFAULT_APP_SETTINGS.notifications.dailyReminderMessage);
    });

    it('should use default for non-string message', () => {
      const result = validateAppSettings({
        notifications: { dailyReminderMessage: 123 },
      });
      expect(result.notifications.dailyReminderMessage).toBe(DEFAULT_APP_SETTINGS.notifications.dailyReminderMessage);
    });

    it('should handle boolean notification flags', () => {
      const result = validateAppSettings({
        notifications: {
          dailyReminderEnabled: true,
          streakWarningEnabled: false,
          weeklyReportEnabled: true,
        },
      });
      expect(result.notifications.dailyReminderEnabled).toBe(true);
      expect(result.notifications.streakWarningEnabled).toBe(false);
      expect(result.notifications.weeklyReportEnabled).toBe(true);
    });

    it('should handle null notifications object', () => {
      const result = validateAppSettings({
        notifications: null,
      });
      expect(result.notifications).toEqual(DEFAULT_APP_SETTINGS.notifications);
    });
  });

  describe('Interaction preferences validation', () => {
    it('should accept valid confetti styles', () => {
      const styles: ConfettiStyle[] = ['standard', 'firework', 'cannon', 'emoji'];

      styles.forEach(confettiStyle => {
        const result = validateAppSettings({
          interaction: { confettiStyle },
        });
        expect(result.interaction.confettiStyle).toBe(confettiStyle);
      });
    });

    it('should use default for invalid confetti style', () => {
      const result = validateAppSettings({
        interaction: { confettiStyle: 'invalid' },
      });
      expect(result.interaction.confettiStyle).toBe(DEFAULT_APP_SETTINGS.interaction.confettiStyle);
    });

    it('should accept valid confetti intensities', () => {
      const intensities: ConfettiIntensity[] = ['light', 'medium', 'strong'];

      intensities.forEach(confettiIntensity => {
        const result = validateAppSettings({
          interaction: { confettiIntensity },
        });
        expect(result.interaction.confettiIntensity).toBe(confettiIntensity);
      });
    });

    it('should use default for invalid confetti intensity', () => {
      const result = validateAppSettings({
        interaction: { confettiIntensity: 'invalid' },
      });
      expect(result.interaction.confettiIntensity).toBe(DEFAULT_APP_SETTINGS.interaction.confettiIntensity);
    });

    it('should handle all boolean interaction flags', () => {
      const result = validateAppSettings({
        interaction: {
          vibrationsEnabled: false,
          vibrationOnCorrect: false,
          vibrationOnIncorrect: false,
          vibrationOnSessionComplete: true,
          confettiEnabled: false,
          confettiSoundEnabled: true,
          wakeLockEnabled: false,
          keyboardShortcutsEnabled: false,
        },
      });
      expect(result.interaction.vibrationsEnabled).toBe(false);
      expect(result.interaction.vibrationOnCorrect).toBe(false);
      expect(result.interaction.vibrationOnIncorrect).toBe(false);
      expect(result.interaction.vibrationOnSessionComplete).toBe(true);
      expect(result.interaction.confettiEnabled).toBe(false);
      expect(result.interaction.confettiSoundEnabled).toBe(true);
      expect(result.interaction.wakeLockEnabled).toBe(false);
      expect(result.interaction.keyboardShortcutsEnabled).toBe(false);
    });

    it('should handle null interaction object', () => {
      const result = validateAppSettings({
        interaction: null,
      });
      expect(result.interaction).toEqual(DEFAULT_APP_SETTINGS.interaction);
    });
  });

  describe('AI settings validation', () => {
    it('should accept valid AI depths', () => {
      const depths: AIDepth[] = ['short', 'medium', 'detailed'];

      depths.forEach(explanationDepth => {
        const result = validateAppSettings({
          ai: { explanationDepth },
        });
        expect(result.ai.explanationDepth).toBe(explanationDepth);
      });
    });

    it('should use default for invalid AI depth', () => {
      const result = validateAppSettings({
        ai: { explanationDepth: 'invalid' },
      });
      expect(result.ai.explanationDepth).toBe(DEFAULT_APP_SETTINGS.ai.explanationDepth);
    });

    it('should clamp dailyUsageLimit to 0-9999 range', () => {
      const result1 = validateAppSettings({
        ai: { dailyUsageLimit: -10 },
      });
      expect(result1.ai.dailyUsageLimit).toBe(0);

      const result2 = validateAppSettings({
        ai: { dailyUsageLimit: 10000 },
      });
      expect(result2.ai.dailyUsageLimit).toBe(9999);

      const result3 = validateAppSettings({
        ai: { dailyUsageLimit: 100 },
      });
      expect(result3.ai.dailyUsageLimit).toBe(100);
    });

    it('should clamp usageToday to not exceed dailyUsageLimit', () => {
      const result = validateAppSettings({
        ai: { dailyUsageLimit: 50, usageToday: 100 },
      });
      expect(result.ai.usageToday).toBe(50);
    });

    it('should accept usageToday within dailyUsageLimit', () => {
      const result = validateAppSettings({
        ai: { dailyUsageLimit: 100, usageToday: 50 },
      });
      expect(result.ai.usageToday).toBe(50);
    });

    it('should handle NaN for dailyUsageLimit', () => {
      const result = validateAppSettings({
        ai: { dailyUsageLimit: NaN },
      });
      expect(result.ai.dailyUsageLimit).toBe(0);
    });

    it('should handle NaN for usageToday', () => {
      const result = validateAppSettings({
        ai: { usageToday: NaN },
      });
      expect(result.ai.usageToday).toBe(0);
    });

    it('should handle boolean AI flags', () => {
      const result = validateAppSettings({
        ai: {
          explanationsEnabled: true,
          includeExamples: false,
          showLearningTips: false,
          trainingOptIn: true,
        },
      });
      expect(result.ai.explanationsEnabled).toBe(true);
      expect(result.ai.includeExamples).toBe(false);
      expect(result.ai.showLearningTips).toBe(false);
      expect(result.ai.trainingOptIn).toBe(true);
    });

    it('should handle null AI object', () => {
      const result = validateAppSettings({
        ai: null,
      });
      expect(result.ai).toEqual(DEFAULT_APP_SETTINGS.ai);
    });
  });

  describe('Privacy settings validation', () => {
    it('should accept valid data storage modes', () => {
      const modes: DataStorageMode[] = ['local', 'cloud'];

      modes.forEach(dataStorageMode => {
        const result = validateAppSettings({
          privacy: { dataStorageMode },
        });
        expect(result.privacy.dataStorageMode).toBe(dataStorageMode);
      });
    });

    it('should use default for invalid storage mode', () => {
      const result = validateAppSettings({
        privacy: { dataStorageMode: 'invalid' },
      });
      expect(result.privacy.dataStorageMode).toBe(DEFAULT_APP_SETTINGS.privacy.dataStorageMode);
    });

    it('should handle boolean privacy flags', () => {
      const result = validateAppSettings({
        privacy: {
          analyticsEnabled: true,
          errorReportsEnabled: true,
          betaFeaturesEnabled: true,
        },
      });
      expect(result.privacy.analyticsEnabled).toBe(true);
      expect(result.privacy.errorReportsEnabled).toBe(true);
      expect(result.privacy.betaFeaturesEnabled).toBe(true);
    });

    it('should handle null privacy object', () => {
      const result = validateAppSettings({
        privacy: null,
      });
      expect(result.privacy).toEqual(DEFAULT_APP_SETTINGS.privacy);
    });
  });

  describe('Language settings validation', () => {
    it('should accept valid interface languages', () => {
      const languages: InterfaceLanguage[] = ['de', 'en', 'es'];

      languages.forEach(interfaceLanguage => {
        const result = validateAppSettings({
          language: { interfaceLanguage },
        });
        expect(result.language.interfaceLanguage).toBe(interfaceLanguage);
      });
    });

    it('should use default for invalid interface language', () => {
      const result = validateAppSettings({
        language: { interfaceLanguage: 'fr' },
      });
      expect(result.language.interfaceLanguage).toBe(DEFAULT_APP_SETTINGS.language.interfaceLanguage);
    });

    it('should accept valid date formats', () => {
      const formats: DateFormat[] = ['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

      formats.forEach(dateFormat => {
        const result = validateAppSettings({
          language: { dateFormat },
        });
        expect(result.language.dateFormat).toBe(dateFormat);
      });
    });

    it('should use default for invalid date format', () => {
      const result = validateAppSettings({
        language: { dateFormat: 'invalid' },
      });
      expect(result.language.dateFormat).toBe(DEFAULT_APP_SETTINGS.language.dateFormat);
    });

    it('should accept valid timezone string', () => {
      const result = validateAppSettings({
        language: { timezone: 'America/New_York' },
      });
      expect(result.language.timezone).toBe('America/New_York');
    });

    it('should use resolved timezone for empty string', () => {
      const result = validateAppSettings({
        language: { timezone: '' },
      });
      expect(result.language.timezone).toBeDefined();
      expect(result.language.timezone.length).toBeGreaterThan(0);
    });

    it('should use resolved timezone for non-string', () => {
      const result = validateAppSettings({
        language: { timezone: 123 },
      });
      expect(result.language.timezone).toBeDefined();
      expect(result.language.timezone.length).toBeGreaterThan(0);
    });

    it('should handle null language object', () => {
      const result = validateAppSettings({
        language: null,
      });
      expect(result.language.interfaceLanguage).toBe(DEFAULT_APP_SETTINGS.language.interfaceLanguage);
      expect(result.language.timezone).toBeDefined();
      expect(result.language.dateFormat).toBe(DEFAULT_APP_SETTINGS.language.dateFormat);
    });
  });

  describe('Database metadata validation', () => {
    it('should accept valid lastUpdatedAt as string', () => {
      const result = validateAppSettings({
        database: { lastUpdatedAt: '2025-01-01T00:00:00Z' },
      });
      expect(result.database.lastUpdatedAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should accept lastUpdatedAt as null', () => {
      const result = validateAppSettings({
        database: { lastUpdatedAt: null },
      });
      expect(result.database.lastUpdatedAt).toBeNull();
    });

    it('should use default for invalid lastUpdatedAt type', () => {
      const result = validateAppSettings({
        database: { lastUpdatedAt: 123 },
      });
      expect(result.database.lastUpdatedAt).toBe(DEFAULT_APP_SETTINGS.database.lastUpdatedAt);
    });

    it('should accept valid storageUsageBytes as number', () => {
      const result = validateAppSettings({
        database: { storageUsageBytes: 1024 },
      });
      expect(result.database.storageUsageBytes).toBe(1024);
    });

    it('should accept storageUsageBytes as null', () => {
      const result = validateAppSettings({
        database: { storageUsageBytes: null },
      });
      expect(result.database.storageUsageBytes).toBeNull();
    });

    it('should use default for invalid storageUsageBytes type', () => {
      const result = validateAppSettings({
        database: { storageUsageBytes: 'invalid' },
      });
      expect(result.database.storageUsageBytes).toBe(DEFAULT_APP_SETTINGS.database.storageUsageBytes);
    });

    it('should handle null database object', () => {
      const result = validateAppSettings({
        database: null,
      });
      expect(result.database).toEqual(DEFAULT_APP_SETTINGS.database);
    });
  });

  describe('Timezone resolution', () => {
    let originalIntl: typeof Intl;

    beforeEach(() => {
      originalIntl = global.Intl;
    });

    afterEach(() => {
      global.Intl = originalIntl;
    });

    it('should resolve timezone from Intl.DateTimeFormat', () => {
      const result = validateAppSettings({});
      expect(result.language.timezone).toBeDefined();
      expect(typeof result.language.timezone).toBe('string');
    });

    it('should fallback to Europe/Berlin when Intl throws error', () => {
      // Mock Intl to throw an error
      Object.defineProperty(global, 'Intl', {
        value: {
          DateTimeFormat: function() {
            throw new Error('Intl not available');
          },
        },
        writable: true,
        configurable: true,
      });

      const result = validateAppSettings({});
      expect(result.language.timezone).toBe('Europe/Berlin');
    });

    it('should fallback to Europe/Berlin when timezone is null', () => {
      // Mock Intl to return null timezone
      Object.defineProperty(global, 'Intl', {
        value: {
          DateTimeFormat: function() {
            return {
              resolvedOptions: () => ({ timeZone: null }),
            };
          },
        },
        writable: true,
        configurable: true,
      });

      const result = validateAppSettings({});
      expect(result.language.timezone).toBe('Europe/Berlin');
    });

    it('should fallback to Europe/Berlin when timezone is undefined', () => {
      // Mock Intl to return undefined timezone
      Object.defineProperty(global, 'Intl', {
        value: {
          DateTimeFormat: function() {
            return {
              resolvedOptions: () => ({ timeZone: undefined }),
            };
          },
        },
        writable: true,
        configurable: true,
      });

      const result = validateAppSettings({});
      expect(result.language.timezone).toBe('Europe/Berlin');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle empty object', () => {
      const result = validateAppSettings({});
      expect(result).toBeDefined();
      expect(result.version).toBe(DEFAULT_APP_SETTINGS.version);
    });

    it('should handle deeply nested null values', () => {
      const result = validateAppSettings({
        theme: {
          mode: null,
          fontScale: null,
          animationsEnabled: null,
          reducedMotion: null,
        },
      });
      expect(result.theme.mode).toBe(DEFAULT_APP_SETTINGS.theme.mode);
      expect(result.theme.fontScale).toBe(DEFAULT_APP_SETTINGS.theme.fontScale);
    });

    it('should handle undefined nested properties', () => {
      const result = validateAppSettings({
        audio: {
          autoPlayEnabled: undefined,
        },
      });
      expect(result.audio.autoPlayEnabled).toBe(DEFAULT_APP_SETTINGS.audio.autoPlayEnabled);
    });

    it('should handle boundary values for numeric settings', () => {
      const result = validateAppSettings({
        learning: {
          dailyGoal: 1,
          sessionSize: 100,
        },
        ai: {
          dailyUsageLimit: 9999,
        },
      });
      expect(result.learning.dailyGoal).toBe(1);
      expect(result.learning.sessionSize).toBe(100);
      expect(result.ai.dailyUsageLimit).toBe(9999);
    });

    it('should handle all settings at once', () => {
      const customSettings: AppSettings = {
        version: 2,
        theme: {
          mode: 'dark',
          fontScale: 'large',
          animationsEnabled: false,
          reducedMotion: true,
        },
        audio: {
          autoPlayEnabled: false,
          autoPlayRepeats: 3,
          autoPlayDelayMs: 2000,
          soundEffectsEnabled: false,
          soundEffectsVolume: 0.5,
          successChimeEnabled: false,
          playbackRate: 1.5,
        },
        learning: {
          algorithm: 'neural',
          dailyGoal: 50,
          sessionSize: 25,
          repeatDifficultTasks: false,
          randomizeOrder: false,
        },
        notifications: {
          dailyReminderEnabled: true,
          dailyReminderTime: '09:00',
          dailyReminderMessage: 'Custom message',
          streakWarningEnabled: false,
          weeklyReportEnabled: true,
        },
        interaction: {
          vibrationsEnabled: false,
          vibrationOnCorrect: false,
          vibrationOnIncorrect: false,
          vibrationOnSessionComplete: true,
          confettiEnabled: false,
          confettiStyle: 'emoji',
          confettiIntensity: 'strong',
          confettiSoundEnabled: true,
          wakeLockEnabled: false,
          keyboardShortcutsEnabled: false,
        },
        ai: {
          explanationsEnabled: true,
          explanationDepth: 'detailed',
          includeExamples: false,
          showLearningTips: false,
          trainingOptIn: true,
          dailyUsageLimit: 100,
          usageToday: 25,
        },
        privacy: {
          dataStorageMode: 'cloud',
          analyticsEnabled: true,
          errorReportsEnabled: true,
          betaFeaturesEnabled: true,
        },
        language: {
          interfaceLanguage: 'en',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
        },
        database: {
          lastUpdatedAt: '2025-01-01T00:00:00Z',
          storageUsageBytes: 1024000,
        },
        lastSavedAt: '2025-01-01T12:00:00Z',
      };

      const result = validateAppSettings(customSettings);
      expect(result).toEqual(customSettings);
    });

    it('should handle mixed valid and invalid values', () => {
      const result = validateAppSettings({
        version: 'invalid',
        theme: {
          mode: 'dark',
          fontScale: 'invalid',
        },
        audio: {
          playbackRate: 2.0,
          soundEffectsVolume: 0.7,
        },
      });

      expect(result.version).toBe(DEFAULT_APP_SETTINGS.version);
      expect(result.theme.mode).toBe('dark');
      expect(result.theme.fontScale).toBe(DEFAULT_APP_SETTINGS.theme.fontScale);
      expect(result.audio.playbackRate).toBe(DEFAULT_APP_SETTINGS.audio.playbackRate);
      expect(result.audio.soundEffectsVolume).toBe(0.7);
    });
  });

  describe('Integration scenarios', () => {
    it('should create a complete custom settings profile', () => {
      const userSettings = {
        theme: {
          mode: 'dark' as ThemeMode,
          fontScale: 'large' as FontScale,
        },
        learning: {
          algorithm: 'sm-2' as LearningAlgorithm,
          dailyGoal: 30,
        },
        privacy: {
          dataStorageMode: 'cloud' as DataStorageMode,
          analyticsEnabled: true,
        },
      };

      const result = validateAppSettings(userSettings);

      expect(result.theme.mode).toBe('dark');
      expect(result.theme.fontScale).toBe('large');
      expect(result.learning.algorithm).toBe('sm-2');
      expect(result.learning.dailyGoal).toBe(30);
      expect(result.privacy.dataStorageMode).toBe('cloud');
      expect(result.privacy.analyticsEnabled).toBe(true);

      // Other settings should use defaults
      expect(result.audio).toEqual(DEFAULT_APP_SETTINGS.audio);
      expect(result.notifications).toEqual(DEFAULT_APP_SETTINGS.notifications);
    });

    it('should sanitize user input from untrusted sources', () => {
      const untrustedInput = {
        theme: {
          mode: 'hacker-mode',
          fontScale: 'xxl',
        },
        audio: {
          soundEffectsVolume: 999,
          autoPlayDelayMs: -1000,
        },
        learning: {
          dailyGoal: 99999,
        },
        notifications: {
          dailyReminderMessage: 'A'.repeat(500),
        },
      };

      const result = validateAppSettings(untrustedInput);

      expect(result.theme.mode).toBe(DEFAULT_APP_SETTINGS.theme.mode);
      expect(result.theme.fontScale).toBe(DEFAULT_APP_SETTINGS.theme.fontScale);
      expect(result.audio.soundEffectsVolume).toBe(1);
      expect(result.audio.autoPlayDelayMs).toBe(0);
      expect(result.learning.dailyGoal).toBe(200);
      expect(result.notifications.dailyReminderMessage).toBe(DEFAULT_APP_SETTINGS.notifications.dailyReminderMessage);
    });
  });
});
