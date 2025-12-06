/**
 * Shared Test Fixtures
 *
 * Central export for all test fixtures and factory functions.
 * Import from '@tests/fixtures' to use in your tests.
 *
 * @example
 * import {
 *   createMockTopic,
 *   createMockUser,
 *   createMockAppSettings,
 *   contentFixtures,
 *   authFixtures,
 *   settingsFixtures
 * } from '@tests/fixtures';
 */

// Content fixtures (Topic, LearningPath, Task)
export {
  createMockTopic,
  createMockLearningPath,
  createMockTask,
  createMockFlashcardTask,
  createMockTrueFalseTask,
  createMockTopics,
  createMockLearningPaths,
  createMockTasks,
  contentFixtures,
} from './content-fixtures';

// Auth fixtures (User, Session, AuthResponse)
export {
  createMockUserMetadata,
  createMockUser,
  createMockSession,
  createMockAuthError,
  createMockAuthResponse,
  createMockSignupResponse,
  createMockAuthErrorResponse,
  createMockOAuthResponse,
  createMockOAuthErrorResponse,
  authErrors,
  authFixtures,
  testCredentials,
} from './auth-fixtures';

// Settings fixtures (AppSettings, AudioSettings)
export {
  DEFAULT_TEST_SETTINGS,
  createMockAppSettings,
  createMockDarkSettings,
  createMockSystemThemeSettings,
  createMockAccessibilitySettings,
  DEFAULT_TEST_AUDIO_SETTINGS,
  createMockAudioSettings,
  createMockDisabledAudioSettings,
  createMockAllLanguagesAudioSettings,
  createMockAudioSettingsWithOverrides,
  settingsFixtures,
  settingsStorageKeys,
  createMockStoredSettings,
  invalidStoredData,
} from './settings-fixtures';
