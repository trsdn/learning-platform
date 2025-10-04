/**
 * AudioSettingsStorage Contract Tests
 *
 * These tests validate the IAudioSettingsStorage interface contract.
 * CRITICAL: These tests MUST FAIL initially (no implementation exists yet).
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.2 - TDD (Test-Driven Development)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createAudioSettingsStorage,
  DEFAULT_AUDIO_SETTINGS,
  type IAudioSettingsStorage,
} from '../../../src/modules/storage/adapters/audio-settings-storage';
import type { AudioSettings } from '../../../src/modules/core/entities/audio-settings';

describe('AudioSettingsStorage (Contract Tests)', () => {
  let storage: IAudioSettingsStorage;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock LocalStorage
    localStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as any;

    // Create storage instance (will fail until implementation exists)
    storage = createAudioSettingsStorage();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Interface Implementation', () => {
    it('should implement all required IAudioSettingsStorage methods', () => {
      expect(storage.load).toBeDefined();
      expect(storage.save).toBeDefined();
      expect(storage.update).toBeDefined();
      expect(storage.reset).toBeDefined();
      expect(storage.exists).toBeDefined();
      expect(storage.migrate).toBeDefined();
    });

    it('should have methods with correct signatures', () => {
      expect(typeof storage.load).toBe('function');
      expect(typeof storage.save).toBe('function');
      expect(typeof storage.update).toBe('function');
      expect(typeof storage.reset).toBe('function');
      expect(typeof storage.exists).toBe('function');
      expect(typeof storage.migrate).toBe('function');
    });
  });

  describe('load()', () => {
    it('should return default settings when no settings exist', () => {
      const settings = storage.load();

      expect(settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });

    it('should return saved settings when they exist', () => {
      const customSettings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        perTopicOverrides: {},
        accessibilityMode: true,
      };

      storage.save(customSettings);
      const loaded = storage.load();

      expect(loaded).toEqual(customSettings);
    });

    it('should return default settings if parsing fails', () => {
      localStorageMock['audioSettings'] = 'invalid json{';

      const settings = storage.load();

      expect(settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });

    it('should call migrate if version mismatch detected', () => {
      const oldSettings = {
        version: 0,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
      };

      localStorageMock['audioSettings'] = JSON.stringify(oldSettings);

      const migrateSpy = vi.spyOn(storage, 'migrate');

      storage.load();

      expect(migrateSpy).toHaveBeenCalledWith(oldSettings);
    });
  });

  describe('save()', () => {
    it('should save settings to LocalStorage', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'none',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      storage.save(settings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'audioSettings',
        JSON.stringify(settings)
      );
    });

    it('should overwrite existing settings', () => {
      const settings1: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      const settings2: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        perTopicOverrides: {},
        accessibilityMode: true,
      };

      storage.save(settings1);
      storage.save(settings2);

      const loaded = storage.load();
      expect(loaded).toEqual(settings2);
    });

    it('should persist settings across load calls', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'none',
        perTopicOverrides: { 'spanish-vocab': { autoPlayEnabled: true } },
        accessibilityMode: true,
      };

      storage.save(settings);
      const loaded = storage.load();

      expect(loaded).toEqual(settings);
    });
  });

  describe('update()', () => {
    it('should merge partial updates with existing settings', () => {
      const initial: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      storage.save(initial);

      storage.update({
        autoPlayEnabled: false,
        languageFilter: 'all languages',
      });

      const loaded = storage.load();

      expect(loaded.autoPlayEnabled).toBe(false);
      expect(loaded.languageFilter).toBe('all languages');
      expect(loaded.accessibilityMode).toBe(false); // unchanged
    });

    it('should create settings if none exist', () => {
      storage.update({
        autoPlayEnabled: false,
      });

      const loaded = storage.load();

      expect(loaded.autoPlayEnabled).toBe(false);
      expect(loaded.languageFilter).toBe(DEFAULT_AUDIO_SETTINGS.languageFilter);
    });

    it('should update perTopicOverrides correctly', () => {
      storage.update({
        perTopicOverrides: {
          'spanish-vocab': { autoPlayEnabled: false },
        },
      });

      const loaded = storage.load();

      expect(loaded.perTopicOverrides).toEqual({
        'spanish-vocab': { autoPlayEnabled: false },
      });
    });
  });

  describe('reset()', () => {
    it('should clear all stored settings', () => {
      const customSettings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        perTopicOverrides: {},
        accessibilityMode: true,
      };

      storage.save(customSettings);
      storage.reset();

      expect(localStorage.removeItem).toHaveBeenCalledWith('audioSettings');
    });

    it('should return default settings after reset', () => {
      const customSettings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'none',
        perTopicOverrides: {},
        accessibilityMode: true,
      };

      storage.save(customSettings);
      storage.reset();

      const loaded = storage.load();

      expect(loaded).toEqual(DEFAULT_AUDIO_SETTINGS);
    });
  });

  describe('exists()', () => {
    it('should return false when no settings exist', () => {
      expect(storage.exists()).toBe(false);
    });

    it('should return true when settings exist', () => {
      storage.save(DEFAULT_AUDIO_SETTINGS);
      expect(storage.exists()).toBe(true);
    });

    it('should return false after reset', () => {
      storage.save(DEFAULT_AUDIO_SETTINGS);
      storage.reset();
      expect(storage.exists()).toBe(false);
    });
  });

  describe('migrate()', () => {
    it('should migrate settings from old schema to current', () => {
      const oldSettings = {
        version: 0,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
      };

      const migrated = storage.migrate(oldSettings);

      expect(migrated.version).toBe(1);
      expect(migrated.autoPlayEnabled).toBe(true);
      expect(migrated.languageFilter).toBe('non-German only');
      expect(migrated.perTopicOverrides).toBeDefined();
      expect(migrated.accessibilityMode).toBeDefined();
    });

    it('should handle invalid/unknown schemas gracefully', () => {
      const invalidSettings = {
        foo: 'bar',
        version: 999,
      };

      const migrated = storage.migrate(invalidSettings);

      expect(migrated).toBeDefined();
      expect(migrated.version).toBe(1);
    });

    it('should preserve valid fields during migration', () => {
      const oldSettings = {
        version: 0,
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        accessibilityMode: true,
      };

      const migrated = storage.migrate(oldSettings);

      expect(migrated.autoPlayEnabled).toBe(false);
      expect(migrated.languageFilter).toBe('all languages');
      expect(migrated.accessibilityMode).toBe(true);
    });

    it('should add missing fields with defaults', () => {
      const partialSettings = {
        version: 0,
        autoPlayEnabled: true,
      };

      const migrated = storage.migrate(partialSettings);

      expect(migrated.languageFilter).toBe(DEFAULT_AUDIO_SETTINGS.languageFilter);
      expect(migrated.perTopicOverrides).toEqual({});
      expect(migrated.accessibilityMode).toBe(false);
    });
  });

  describe('LocalStorage Integration', () => {
    it('should use correct storage key', () => {
      storage.save(DEFAULT_AUDIO_SETTINGS);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'audioSettings',
        expect.any(String)
      );
    });

    it('should serialize settings as JSON', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'none',
        perTopicOverrides: { test: { autoPlayEnabled: true } },
        accessibilityMode: true,
      };

      storage.save(settings);

      const savedData = localStorageMock['audioSettings'];
      const parsed = JSON.parse(savedData);

      expect(parsed).toEqual(settings);
    });

    it('should deserialize JSON correctly on load', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: false,
        languageFilter: 'all languages',
        perTopicOverrides: {},
        accessibilityMode: true,
      };

      localStorageMock['audioSettings'] = JSON.stringify(settings);

      const loaded = storage.load();

      expect(loaded).toEqual(settings);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty perTopicOverrides', () => {
      const settings: AudioSettings = {
        ...DEFAULT_AUDIO_SETTINGS,
        perTopicOverrides: {},
      };

      storage.save(settings);
      const loaded = storage.load();

      expect(loaded.perTopicOverrides).toEqual({});
    });

    it('should handle complex perTopicOverrides', () => {
      const settings: AudioSettings = {
        ...DEFAULT_AUDIO_SETTINGS,
        perTopicOverrides: {
          'spanish-vocab': { autoPlayEnabled: false, languageFilter: 'none' },
          'french-grammar': { accessibilityMode: true },
        },
      };

      storage.save(settings);
      const loaded = storage.load();

      expect(loaded.perTopicOverrides).toEqual(settings.perTopicOverrides);
    });

    it('should handle all valid languageFilter values', () => {
      const filters: Array<AudioSettings['languageFilter']> = [
        'non-German only',
        'all languages',
        'none',
      ];

      for (const filter of filters) {
        storage.update({ languageFilter: filter });
        const loaded = storage.load();
        expect(loaded.languageFilter).toBe(filter);
      }
    });
  });
});
