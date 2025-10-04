/**
 * AudioSettings Entity
 *
 * Represents user preferences for audio playback behavior.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.3 - Core Entities
 */

/**
 * Language filter options for auto-play
 */
export type LanguageFilter = 'non-German only' | 'all languages' | 'none';

/**
 * Audio settings configuration
 * Stored in LocalStorage (key: 'audioSettings')
 */
export interface AudioSettings {
  /** Schema version for migrations */
  version: number;

  /** Master switch for auto-play feature */
  autoPlayEnabled: boolean;

  /** Which content languages trigger auto-play */
  languageFilter: LanguageFilter;

  /** Per-topic setting overrides (key = topic ID) */
  perTopicOverrides: Record<string, Partial<Omit<AudioSettings, 'version' | 'perTopicOverrides'>>>;

  /** Enable visual pronunciation guides (IPA notation) */
  accessibilityMode: boolean;
}

/**
 * Default audio settings
 * Used when no settings exist in LocalStorage
 */
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  version: 1,
  autoPlayEnabled: true,
  languageFilter: 'non-German only',
  perTopicOverrides: {},
  accessibilityMode: false,
};

/**
 * Validate audio settings object
 * @throws Error if validation fails
 */
export function validateAudioSettings(settings: unknown): AudioSettings {
  const s = settings as Partial<AudioSettings>;

  if (typeof s.autoPlayEnabled !== 'boolean') {
    throw new Error('autoPlayEnabled must be boolean');
  }

  const validFilters: LanguageFilter[] = ['non-German only', 'all languages', 'none'];
  if (!validFilters.includes(s.languageFilter as LanguageFilter)) {
    throw new Error(`Invalid languageFilter value: ${s.languageFilter}`);
  }

  if (s.perTopicOverrides && typeof s.perTopicOverrides !== 'object') {
    throw new Error('perTopicOverrides must be object');
  }

  if (typeof s.accessibilityMode !== 'boolean') {
    throw new Error('accessibilityMode must be boolean');
  }

  if (typeof s.version !== 'number' || s.version < 1) {
    throw new Error('version must be positive integer');
  }

  return s as AudioSettings;
}
