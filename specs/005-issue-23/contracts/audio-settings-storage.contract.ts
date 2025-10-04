/**
 * Audio Settings Storage Contract
 *
 * Defines the interface for persisting and retrieving audio settings.
 * Implementation will use LocalStorage.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Date: 2025-10-04
 */

import type { AudioSettings } from '../../../src/modules/core/entities/audio-settings';

/**
 * Audio Settings Storage Interface
 *
 * Responsibilities:
 * - Persist audio settings to LocalStorage
 * - Retrieve audio settings from LocalStorage
 * - Handle schema migrations
 * - Provide default settings if none exist
 */
export interface IAudioSettingsStorage {
  /**
   * Load audio settings from storage
   * Returns default settings if none exist or if parsing fails
   *
   * @returns Audio settings from storage or defaults
   *
   * @example
   * const settings = audioSettingsStorage.load();
   * console.log('Auto-play enabled:', settings.autoPlayEnabled);
   */
  load(): AudioSettings;

  /**
   * Save audio settings to storage
   * Overwrites existing settings
   *
   * @param settings - Settings to persist
   *
   * @example
   * audioSettingsStorage.save({
   *   ...settings,
   *   autoPlayEnabled: false,
   * });
   */
  save(settings: AudioSettings): void;

  /**
   * Update specific settings fields
   * Merges with existing settings
   *
   * @param updates - Partial settings to update
   *
   * @example
   * audioSettingsStorage.update({
   *   languageFilter: 'all languages',
   * });
   */
  update(updates: Partial<AudioSettings>): void;

  /**
   * Reset settings to defaults
   * Clears all stored settings
   *
   * @example
   * audioSettingsStorage.reset();
   * const settings = audioSettingsStorage.load();
   * // settings === DEFAULT_AUDIO_SETTINGS
   */
  reset(): void;

  /**
   * Check if settings exist in storage
   *
   * @returns True if settings have been saved before
   *
   * @example
   * if (!audioSettingsStorage.exists()) {
   *   // First-time user - show tutorial
   * }
   */
  exists(): boolean;

  /**
   * Migrate settings from old schema to current schema
   * Called automatically by load() if version mismatch detected
   *
   * @param oldSettings - Settings in old schema
   * @returns Settings migrated to current schema
   */
  migrate(oldSettings: unknown): AudioSettings;
}

/**
 * Default Audio Settings
 */
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  version: 1,
  autoPlayEnabled: true,
  languageFilter: 'non-German only',
  perTopicOverrides: {},
  accessibilityMode: false,
};

/**
 * Audio Settings Storage Factory
 * Creates a new instance of the storage adapter
 */
export function createAudioSettingsStorage(): IAudioSettingsStorage {
  throw new Error('Not implemented - to be implemented in Phase 3');
}
