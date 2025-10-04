/**
 * Audio Helpers
 *
 * Utility functions for audio auto-play feature.
 *
 * Feature: Auto-Play Audio for Language Learning Tasks
 * Branch: 005-issue-23
 * Phase: 3.3 - Core Entities
 */

import type { Task } from '../types/services';
import type { AudioSettings } from '../entities/audio-settings';

/**
 * Determine if a task is eligible for auto-play based on settings
 *
 * @param task - The task to check
 * @param settings - Current audio settings
 * @returns true if audio should auto-play for this task
 */
export function isEligibleForAutoPlay(task: Task, settings: AudioSettings): boolean {
  // Rule 1: Must have audio
  if (!task.hasAudio || !task.audioUrl) {
    return false;
  }

  // Rule 2: Auto-play must be enabled globally
  if (!settings.autoPlayEnabled) {
    return false;
  }

  // Rule 3: Check language filter
  const taskLanguage = task.language || 'German';

  switch (settings.languageFilter) {
    case 'none':
      return false;
    case 'all languages':
      return true;
    case 'non-German only':
      return taskLanguage !== 'German';
    default:
      return false;
  }

  // Note: Per-topic overrides would be checked here if task had topicId
  // Currently not implemented as Task interface doesn't expose topicId directly
}

/**
 * Validate task audio fields
 *
 * @param task - The task to validate
 * @throws Warning (console.warn) for inconsistencies
 */
export function validateTaskAudio(task: Task): void {
  if (task.hasAudio && !task.audioUrl) {
    console.warn(`Task ${task.id}: hasAudio is true but audioUrl is missing`);
  }

  if (task.audioUrl && !task.hasAudio) {
    console.warn(`Task ${task.id}: audioUrl provided but hasAudio is false`);
  }

  if (task.audioUrl && !task.audioUrl.startsWith('/audio/')) {
    console.warn(`Task ${task.id}: audioUrl must start with /audio/, got: ${task.audioUrl}`);
  }

  const validLanguages = ['German', 'Spanish', 'French', 'English', 'Italian'];
  if (task.language && !validLanguages.includes(task.language)) {
    console.warn(`Task ${task.id}: Unknown language: ${task.language}`);
  }

  if (task.ipa && task.language === 'German') {
    console.warn(`Task ${task.id}: IPA notation not typically needed for German`);
  }
}
