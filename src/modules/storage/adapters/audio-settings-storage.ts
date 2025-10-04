/**
 * AudioSettingsStorage Adapter
 *
 * LocalStorage adapter for persisting audio settings.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.4 - Storage Layer
 */

import type { AudioSettings } from '../../core/entities/audio-settings';
import { DEFAULT_AUDIO_SETTINGS, validateAudioSettings } from '../../core/entities/audio-settings';

const STORAGE_KEY = 'audioSettings';
const DEBOUNCE_DELAY_MS = 500; // Delay for debouncing localStorage writes

/**
 * Audio settings storage interface
 */
export interface IAudioSettingsStorage {
  /** Load settings from LocalStorage (returns defaults if not found) */
  load(): AudioSettings;

  /** Save settings to LocalStorage */
  save(settings: AudioSettings): void;

  /** Update partial settings (merge with existing) */
  update(updates: Partial<AudioSettings>): void;

  /** Reset to default settings (clears LocalStorage) */
  reset(): void;

  /** Check if settings exist in storage */
  exists(): boolean;

  /** Migrate old settings schema to current version */
  migrate(oldSettings: any): AudioSettings;
}

/**
 * LocalStorage-based audio settings storage
 */
class AudioSettingsStorage implements IAudioSettingsStorage {
  private saveTimer: number | null = null;

  load(): AudioSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return { ...DEFAULT_AUDIO_SETTINGS };
      }

      const parsed = JSON.parse(stored);

      // Check if migration is needed
      if (parsed.version !== DEFAULT_AUDIO_SETTINGS.version) {
        return this.migrate(parsed);
      }

      // Validate and return
      return validateAudioSettings(parsed);
    } catch (error) {
      console.error('Failed to load audio settings, using defaults:', error);
      return { ...DEFAULT_AUDIO_SETTINGS };
    }
  }

  save(settings: AudioSettings): void {
    try {
      validateAudioSettings(settings);

      // Debounce localStorage writes for better performance
      if (this.saveTimer !== null) {
        window.clearTimeout(this.saveTimer);
      }

      this.saveTimer = window.setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        this.saveTimer = null;
      }, DEBOUNCE_DELAY_MS);
    } catch (error) {
      console.error('Failed to save audio settings:', error);
      throw error;
    }
  }


  update(updates: Partial<AudioSettings>): void {
    const current = this.load();
    const merged: AudioSettings = {
      ...current,
      ...updates,
      // Preserve version unless explicitly updated
      version: updates.version ?? current.version,
      // Deep merge perTopicOverrides
      perTopicOverrides: {
        ...current.perTopicOverrides,
        ...(updates.perTopicOverrides ?? {}),
      },
    };

    this.save(merged);
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  exists(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  migrate(oldSettings: any): AudioSettings {
    // Migration from v0 to v1 (if needed in the future)
    // Currently only supports v1, so we apply defaults for missing fields

    const migrated: AudioSettings = {
      version: 1,
      autoPlayEnabled: oldSettings.autoPlayEnabled ?? DEFAULT_AUDIO_SETTINGS.autoPlayEnabled,
      languageFilter: oldSettings.languageFilter ?? DEFAULT_AUDIO_SETTINGS.languageFilter,
      perTopicOverrides: oldSettings.perTopicOverrides ?? {},
      accessibilityMode: oldSettings.accessibilityMode ?? DEFAULT_AUDIO_SETTINGS.accessibilityMode,
    };

    try {
      validateAudioSettings(migrated);
      // Save migrated settings
      this.save(migrated);
      return migrated;
    } catch (error) {
      console.error('Migration failed, using defaults:', error);
      return { ...DEFAULT_AUDIO_SETTINGS };
    }
  }
}

/**
 * Factory function to create audio settings storage instance
 */
export function createAudioSettingsStorage(): IAudioSettingsStorage {
  return new AudioSettingsStorage();
}

/**
 * Export default settings for convenience
 */
export { DEFAULT_AUDIO_SETTINGS };
