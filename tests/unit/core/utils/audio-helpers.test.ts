/**
 * Unit Tests for Audio Helpers
 *
 * Tests for audio auto-play eligibility and validation functions.
 * Target Coverage: 85%+
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isEligibleForAutoPlay, validateTaskAudio } from '@/modules/core/utils/audio-helpers';
import type { Task } from '@/modules/core/types/services';
import type { AudioSettings } from '@/modules/core/entities/audio-settings';

// Helper function to create mock Task objects
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-123',
    learningPathId: 'path-1',
    templateId: 'template-1',
    type: 'multiple-choice',
    content: {
      question: 'Test question',
      options: ['A', 'B', 'C'],
      correctAnswer: 0,
    },
    metadata: {
      difficulty: 'easy',
      tags: ['test'],
      estimatedTime: 60,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Task;
}

// Helper function to create mock AudioSettings objects
function createMockAudioSettings(overrides: Partial<AudioSettings> = {}): AudioSettings {
  return {
    version: 2,
    autoPlayEnabled: true,
    languageFilter: 'non-German only',
    perTopicOverrides: {},
    accessibilityMode: false,
    ...overrides,
  };
}

describe('audio-helpers', () => {
  describe('isEligibleForAutoPlay', () => {
    describe('audio availability checks', () => {
      it('should return false when task has no audio (hasAudio=false)', () => {
        const task = createMockTask({ hasAudio: false, audioUrl: '/audio/test.mp3' });
        const settings = createMockAudioSettings();

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should return false when task hasAudio is undefined', () => {
        const task = createMockTask({ audioUrl: '/audio/test.mp3' });
        const settings = createMockAudioSettings();

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should return false when task has no audioUrl', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: undefined });
        const settings = createMockAudioSettings();

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should return false when task audioUrl is null', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: null });
        const settings = createMockAudioSettings();

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should return false when task audioUrl is empty string', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: '' });
        const settings = createMockAudioSettings();

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });
    });

    describe('auto-play enabled setting', () => {
      it('should return false when autoPlayEnabled=false', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: '/audio/test.mp3' });
        const settings = createMockAudioSettings({ autoPlayEnabled: false });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should proceed with language filter checks when autoPlayEnabled=true', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'Spanish',
        });
        const settings = createMockAudioSettings({ autoPlayEnabled: true });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });
    });

    describe('language filter: none', () => {
      it('should return false when languageFilter="none"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'Spanish',
        });
        const settings = createMockAudioSettings({ languageFilter: 'none' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should return false for all languages when filter is "none"', () => {
        const languages = ['German', 'Spanish', 'French', 'English', 'Italian'];
        const settings = createMockAudioSettings({ languageFilter: 'none' });

        languages.forEach((language) => {
          const task = createMockTask({
            hasAudio: true,
            audioUrl: '/audio/test.mp3',
            language,
          });

          const result = isEligibleForAutoPlay(task, settings);

          expect(result).toBe(false);
        });
      });
    });

    describe('language filter: all languages', () => {
      it('should return true when languageFilter="all languages"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'Spanish',
        });
        const settings = createMockAudioSettings({ languageFilter: 'all languages' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return true for German when filter is "all languages"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'German',
        });
        const settings = createMockAudioSettings({ languageFilter: 'all languages' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return true for all supported languages when filter is "all languages"', () => {
        const languages = ['German', 'Spanish', 'French', 'English', 'Italian'];
        const settings = createMockAudioSettings({ languageFilter: 'all languages' });

        languages.forEach((language) => {
          const task = createMockTask({
            hasAudio: true,
            audioUrl: '/audio/test.mp3',
            language,
          });

          const result = isEligibleForAutoPlay(task, settings);

          expect(result).toBe(true);
        });
      });
    });

    describe('language filter: non-German only', () => {
      it('should return true for Spanish when languageFilter="non-German only"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'Spanish',
        });
        const settings = createMockAudioSettings({ languageFilter: 'non-German only' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return true for French when languageFilter="non-German only"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'French',
        });
        const settings = createMockAudioSettings({ languageFilter: 'non-German only' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return true for English when languageFilter="non-German only"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'English',
        });
        const settings = createMockAudioSettings({ languageFilter: 'non-German only' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return true for Italian when languageFilter="non-German only"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'Italian',
        });
        const settings = createMockAudioSettings({ languageFilter: 'non-German only' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return false for German when languageFilter="non-German only"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'German',
        });
        const settings = createMockAudioSettings({ languageFilter: 'non-German only' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });
    });

    describe('default language handling', () => {
      it('should default task language to "German" when not specified', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: undefined,
        });
        const settings = createMockAudioSettings({ languageFilter: 'non-German only' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false); // Should be treated as German
      });

      it('should treat undefined language as German with "all languages" filter', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: undefined,
        });
        const settings = createMockAudioSettings({ languageFilter: 'all languages' });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });
    });

    describe('edge cases and combined conditions', () => {
      it('should return false when all conditions fail', () => {
        const task = createMockTask({ hasAudio: false, audioUrl: undefined });
        const settings = createMockAudioSettings({
          autoPlayEnabled: false,
          languageFilter: 'none',
        });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });

      it('should return true when all positive conditions are met', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/spanish.mp3',
          language: 'Spanish',
        });
        const settings = createMockAudioSettings({
          autoPlayEnabled: true,
          languageFilter: 'all languages',
        });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(true);
      });

      it('should return false for invalid languageFilter value (default case)', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/test.mp3',
          language: 'Spanish',
        });
        const settings = createMockAudioSettings({
          languageFilter: 'invalid-filter' as unknown as AudioSettings['languageFilter'], // Force invalid value to test default case
        });

        const result = isEligibleForAutoPlay(task, settings);

        expect(result).toBe(false);
      });
    });
  });

  describe('validateTaskAudio', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    describe('hasAudio and audioUrl consistency', () => {
      it('should warn when hasAudio=true but audioUrl is missing', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: undefined });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: hasAudio is true but audioUrl is missing'
        );
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });

      it('should warn when hasAudio=true but audioUrl is null', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: null });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: hasAudio is true but audioUrl is missing'
        );
      });

      it('should warn when audioUrl is provided but hasAudio=false', () => {
        const task = createMockTask({ hasAudio: false, audioUrl: '/audio/test.mp3' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl provided but hasAudio is false'
        );
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });

      it('should warn when audioUrl is provided but hasAudio is undefined', () => {
        const task = createMockTask({ hasAudio: undefined, audioUrl: '/audio/test.mp3' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl provided but hasAudio is false'
        );
      });
    });

    describe('audioUrl format validation', () => {
      it('should warn when audioUrl does not start with "/audio/"', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: 'https://example.com/audio/test.mp3',
        });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl must start with /audio/, got: https://example.com/audio/test.mp3'
        );
      });

      it('should warn when audioUrl has wrong prefix', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: '/files/audio/test.mp3' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl must start with /audio/, got: /files/audio/test.mp3'
        );
      });

      it('should not warn when audioUrl starts with "/audio/"', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: '/audio/test.mp3' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('audioUrl must start with /audio/')
        );
      });

      it('should not warn about audioUrl format when audioUrl is missing', () => {
        const task = createMockTask({ hasAudio: false, audioUrl: undefined });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('audioUrl must start with /audio/')
        );
      });
    });

    describe('language validation', () => {
      it('should warn when task has unknown language', () => {
        const task = createMockTask({ language: 'Chinese' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: Unknown language: Chinese'
        );
      });

      it('should not warn for valid language: German', () => {
        const task = createMockTask({ language: 'German' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown language')
        );
      });

      it('should not warn for valid language: Spanish', () => {
        const task = createMockTask({ language: 'Spanish' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown language')
        );
      });

      it('should not warn for valid language: French', () => {
        const task = createMockTask({ language: 'French' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown language')
        );
      });

      it('should not warn for valid language: English', () => {
        const task = createMockTask({ language: 'English' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown language')
        );
      });

      it('should not warn for valid language: Italian', () => {
        const task = createMockTask({ language: 'Italian' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown language')
        );
      });

      it('should not warn when language is undefined', () => {
        const task = createMockTask({ language: undefined });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown language')
        );
      });
    });

    describe('IPA notation validation', () => {
      it('should warn when German task has IPA notation', () => {
        const task = createMockTask({ language: 'German', ipa: 'ˈhaloː' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: IPA notation not typically needed for German'
        );
      });

      it('should not warn when non-German task has IPA notation', () => {
        const task = createMockTask({ language: 'Spanish', ipa: 'ˈola' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('IPA notation not typically needed')
        );
      });

      it('should not warn when German task has no IPA notation', () => {
        const task = createMockTask({ language: 'German', ipa: undefined });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('IPA notation not typically needed')
        );
      });

      it('should not warn when German task has null IPA notation', () => {
        const task = createMockTask({ language: 'German', ipa: null });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('IPA notation not typically needed')
        );
      });

      it('should not warn when German task has empty IPA notation', () => {
        const task = createMockTask({ language: 'German', ipa: '' });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('IPA notation not typically needed')
        );
      });
    });

    describe('valid task configurations', () => {
      it('should not warn for task with valid audio configuration', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: '/audio/spanish/hola.mp3',
          language: 'Spanish',
          ipa: 'ˈola',
        });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should not warn for task without audio', () => {
        const task = createMockTask({
          hasAudio: false,
          audioUrl: undefined,
          language: 'German',
          ipa: undefined,
        });

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should not warn for minimal valid task', () => {
        const task = createMockTask({});

        validateTaskAudio(task);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('multiple validation issues', () => {
      it('should warn for multiple issues in single task', () => {
        const task = createMockTask({
          hasAudio: true,
          audioUrl: 'wrong-path/test.mp3',
          language: 'Unknown',
          ipa: undefined,
        });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl must start with /audio/, got: wrong-path/test.mp3'
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: Unknown language: Unknown'
        );
        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      });

      it('should collect all validation warnings', () => {
        const task = createMockTask({
          hasAudio: false,
          audioUrl: '/wrong/path/test.mp3',
          language: 'InvalidLang',
          ipa: undefined,
        });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl provided but hasAudio is false'
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl must start with /audio/, got: /wrong/path/test.mp3'
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: Unknown language: InvalidLang'
        );
      });
    });

    describe('edge cases', () => {
      it('should handle task with different id format', () => {
        const task = createMockTask({
          id: 'custom-id-456',
          hasAudio: true,
          audioUrl: undefined,
        });

        validateTaskAudio(task);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task custom-id-456: hasAudio is true but audioUrl is missing'
        );
      });

      it('should handle empty string audioUrl correctly', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: '' });

        validateTaskAudio(task);

        // Empty string is falsy, so should trigger missing audioUrl warning
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: hasAudio is true but audioUrl is missing'
        );
      });

      it('should handle whitespace-only audioUrl', () => {
        const task = createMockTask({ hasAudio: true, audioUrl: '   ' });

        validateTaskAudio(task);

        // Whitespace is truthy but doesn't start with /audio/
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Task task-123: audioUrl must start with /audio/, got:    '
        );
      });
    });
  });
});
