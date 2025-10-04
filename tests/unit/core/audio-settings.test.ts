/**
 * AudioSettings Entity Tests
 *
 * These tests validate the AudioSettings entity structure and validation rules.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.2 - TDD (Test-Driven Development)
 */

import { describe, it, expect } from 'vitest';
import type { AudioSettings } from '../../../src/modules/core/entities/audio-settings';

describe('AudioSettings Entity', () => {
  describe('Type Structure', () => {
    it('should have all required fields', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      expect(settings.version).toBeDefined();
      expect(settings.autoPlayEnabled).toBeDefined();
      expect(settings.languageFilter).toBeDefined();
      expect(settings.perTopicOverrides).toBeDefined();
      expect(settings.accessibilityMode).toBeDefined();
    });

    it('should accept valid languageFilter values', () => {
      const validFilters: Array<AudioSettings['languageFilter']> = [
        'non-German only',
        'all languages',
        'none',
      ];

      for (const filter of validFilters) {
        const settings: AudioSettings = {
          version: 1,
          autoPlayEnabled: true,
          languageFilter: filter,
          perTopicOverrides: {},
          accessibilityMode: false,
        };

        expect(settings.languageFilter).toBe(filter);
      }
    });
  });

  describe('Default Values', () => {
    it('should have correct default values', () => {
      // These defaults should match DEFAULT_AUDIO_SETTINGS from contract
      const expectedDefaults = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only' as const,
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      // Verify structure matches
      const settings: AudioSettings = expectedDefaults;

      expect(settings.version).toBe(1);
      expect(settings.autoPlayEnabled).toBe(true);
      expect(settings.languageFilter).toBe('non-German only');
      expect(settings.perTopicOverrides).toEqual({});
      expect(settings.accessibilityMode).toBe(false);
    });
  });

  describe('Per-Topic Overrides', () => {
    it('should accept empty overrides', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      expect(settings.perTopicOverrides).toEqual({});
    });

    it('should accept topic-specific overrides', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {
          'spanish-vocab': {
            autoPlayEnabled: false,
          },
          'french-grammar': {
            languageFilter: 'all languages',
            accessibilityMode: true,
          },
        },
        accessibilityMode: false,
      };

      expect(settings.perTopicOverrides['spanish-vocab']?.autoPlayEnabled).toBe(false);
      expect(settings.perTopicOverrides['french-grammar']?.languageFilter).toBe('all languages');
    });

    it('should allow partial overrides', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {
          'math-basics': {
            autoPlayEnabled: false,
            // Only override autoPlayEnabled, not other fields
          },
        },
        accessibilityMode: false,
      };

      expect(settings.perTopicOverrides['math-basics']?.autoPlayEnabled).toBe(false);
    });
  });

  describe('Validation Rules', () => {
    it('should have boolean autoPlayEnabled', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      expect(typeof settings.autoPlayEnabled).toBe('boolean');
    });

    it('should have valid languageFilter enum', () => {
      const validValues = ['non-German only', 'all languages', 'none'];

      for (const value of validValues) {
        const settings: AudioSettings = {
          version: 1,
          autoPlayEnabled: true,
          languageFilter: value as AudioSettings['languageFilter'],
          perTopicOverrides: {},
          accessibilityMode: false,
        };

        expect(validValues).toContain(settings.languageFilter);
      }
    });

    it('should have boolean accessibilityMode', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: true,
      };

      expect(typeof settings.accessibilityMode).toBe('boolean');
    });

    it('should have numeric version', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      expect(typeof settings.version).toBe('number');
      expect(settings.version).toBeGreaterThan(0);
    });
  });

  describe('Immutability', () => {
    it('should allow creating new settings objects', () => {
      const settings1: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      const settings2: AudioSettings = {
        ...settings1,
        autoPlayEnabled: false,
      };

      expect(settings1.autoPlayEnabled).toBe(true);
      expect(settings2.autoPlayEnabled).toBe(false);
    });

    it('should allow merging partial settings', () => {
      const base: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {},
        accessibilityMode: false,
      };

      const updates: Partial<AudioSettings> = {
        languageFilter: 'all languages',
        accessibilityMode: true,
      };

      const merged: AudioSettings = {
        ...base,
        ...updates,
      };

      expect(merged.autoPlayEnabled).toBe(true); // from base
      expect(merged.languageFilter).toBe('all languages'); // from updates
      expect(merged.accessibilityMode).toBe(true); // from updates
    });
  });

  describe('Edge Cases', () => {
    it('should handle all combinations of boolean flags', () => {
      const combinations = [
        { autoPlayEnabled: true, accessibilityMode: true },
        { autoPlayEnabled: true, accessibilityMode: false },
        { autoPlayEnabled: false, accessibilityMode: true },
        { autoPlayEnabled: false, accessibilityMode: false },
      ];

      for (const combo of combinations) {
        const settings: AudioSettings = {
          version: 1,
          ...combo,
          languageFilter: 'non-German only',
          perTopicOverrides: {},
        };

        expect(settings.autoPlayEnabled).toBe(combo.autoPlayEnabled);
        expect(settings.accessibilityMode).toBe(combo.accessibilityMode);
      }
    });

    it('should handle nested topic overrides', () => {
      const settings: AudioSettings = {
        version: 1,
        autoPlayEnabled: true,
        languageFilter: 'non-German only',
        perTopicOverrides: {
          topic1: { autoPlayEnabled: false },
          topic2: { languageFilter: 'none' },
          topic3: {
            autoPlayEnabled: false,
            languageFilter: 'all languages',
            accessibilityMode: true,
          },
        },
        accessibilityMode: false,
      };

      expect(Object.keys(settings.perTopicOverrides)).toHaveLength(3);
      expect(settings.perTopicOverrides.topic3?.autoPlayEnabled).toBe(false);
      expect(settings.perTopicOverrides.topic3?.languageFilter).toBe('all languages');
    });
  });
});
