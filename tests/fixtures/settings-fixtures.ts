/**
 * Shared Test Fixtures for App Settings
 *
 * Factory functions for creating mock AppSettings and related objects.
 * Use these instead of duplicating mock data across test files.
 *
 * @example
 * import { createMockAppSettings, createMockAudioSettings } from '@tests/fixtures';
 *
 * const settings = createMockAppSettings({ theme: 'dark' });
 * const audioSettings = createMockAudioSettings({ autoPlayEnabled: false });
 */

import type { AppSettings } from '@core/entities/app-settings';
import type { AudioSettings } from '@core/entities/audio-settings';

/**
 * Default app settings matching DEFAULT_APP_SETTINGS
 */
export const DEFAULT_TEST_SETTINGS: AppSettings = {
  version: 1,
  theme: 'light',
  fontScale: 1.0,
  reducedMotion: false,
  soundEnabled: true,
  vibrationEnabled: true,
  streakReminders: true,
  dailyGoal: 20,
  language: 'de',
  lastUpdated: new Date('2024-01-01').toISOString(),
};

/**
 * Create mock AppSettings with optional overrides
 */
export function createMockAppSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    ...DEFAULT_TEST_SETTINGS,
    ...overrides,
  };
}

/**
 * Create dark theme settings
 */
export function createMockDarkSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return createMockAppSettings({
    theme: 'dark',
    ...overrides,
  });
}

/**
 * Create system theme settings
 */
export function createMockSystemThemeSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return createMockAppSettings({
    theme: 'system',
    ...overrides,
  });
}

/**
 * Create accessibility-focused settings
 */
export function createMockAccessibilitySettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return createMockAppSettings({
    reducedMotion: true,
    fontScale: 1.25,
    soundEnabled: true,
    vibrationEnabled: false,
    ...overrides,
  });
}

/**
 * Default audio settings matching DEFAULT_AUDIO_SETTINGS
 */
export const DEFAULT_TEST_AUDIO_SETTINGS: AudioSettings = {
  version: 1,
  autoPlayEnabled: true,
  languageFilter: 'non-German only',
  perTopicOverrides: {},
  accessibilityMode: false,
};

/**
 * Create mock AudioSettings with optional overrides
 */
export function createMockAudioSettings(overrides: Partial<AudioSettings> = {}): AudioSettings {
  return {
    ...DEFAULT_TEST_AUDIO_SETTINGS,
    ...overrides,
  };
}

/**
 * Create audio settings with auto-play disabled
 */
export function createMockDisabledAudioSettings(overrides: Partial<AudioSettings> = {}): AudioSettings {
  return createMockAudioSettings({
    autoPlayEnabled: false,
    ...overrides,
  });
}

/**
 * Create audio settings with all languages enabled
 */
export function createMockAllLanguagesAudioSettings(overrides: Partial<AudioSettings> = {}): AudioSettings {
  return createMockAudioSettings({
    languageFilter: 'all languages',
    ...overrides,
  });
}

/**
 * Create audio settings with per-topic overrides
 */
export function createMockAudioSettingsWithOverrides(
  topicOverrides: Record<string, Partial<Omit<AudioSettings, 'version' | 'perTopicOverrides'>>>,
  baseOverrides: Partial<AudioSettings> = {}
): AudioSettings {
  return createMockAudioSettings({
    perTopicOverrides: topicOverrides,
    ...baseOverrides,
  });
}

/**
 * Pre-built fixture sets for common scenarios
 */
export const settingsFixtures = {
  // App Settings
  default: createMockAppSettings(),
  dark: createMockDarkSettings(),
  system: createMockSystemThemeSettings(),
  accessibility: createMockAccessibilitySettings(),

  // Font scales
  smallFont: createMockAppSettings({ fontScale: 0.875 }),
  largeFont: createMockAppSettings({ fontScale: 1.25 }),
  extraLargeFont: createMockAppSettings({ fontScale: 1.5 }),

  // Sound/vibration combinations
  silentMode: createMockAppSettings({
    soundEnabled: false,
    vibrationEnabled: false,
  }),
  soundOnly: createMockAppSettings({
    soundEnabled: true,
    vibrationEnabled: false,
  }),
  vibrationOnly: createMockAppSettings({
    soundEnabled: false,
    vibrationEnabled: true,
  }),

  // Language settings
  englishLanguage: createMockAppSettings({ language: 'en' }),
  germanLanguage: createMockAppSettings({ language: 'de' }),

  // Audio Settings
  audioDefault: createMockAudioSettings(),
  audioDisabled: createMockDisabledAudioSettings(),
  audioAllLanguages: createMockAllLanguagesAudioSettings(),
  audioNone: createMockAudioSettings({ languageFilter: 'none' }),
  audioAccessibility: createMockAudioSettings({ accessibilityMode: true }),

  // Audio with overrides
  audioWithTopicOverrides: createMockAudioSettingsWithOverrides({
    'spanish-topic': { autoPlayEnabled: false },
    'german-topic': { languageFilter: 'all languages' },
  }),
};

/**
 * Storage keys used in settings tests
 */
export const settingsStorageKeys = {
  appSettings: 'mindforge.app-settings.v1',
  audioSettings: 'mindforge.audio-settings.v1',
};

/**
 * Mock localStorage data for testing
 */
export function createMockStoredSettings(settings: AppSettings = DEFAULT_TEST_SETTINGS): string {
  return JSON.stringify(settings);
}

/**
 * Mock invalid JSON for error testing
 */
export const invalidStoredData = {
  malformedJson: '{ invalid json }',
  emptyObject: '{}',
  wrongVersion: JSON.stringify({ version: 999, theme: 'dark' }),
  missingFields: JSON.stringify({ theme: 'dark' }),
  invalidTheme: JSON.stringify({ ...DEFAULT_TEST_SETTINGS, theme: 'invalid' }),
  invalidFontScale: JSON.stringify({ ...DEFAULT_TEST_SETTINGS, fontScale: 'large' }),
};
