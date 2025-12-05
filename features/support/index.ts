/**
 * Barrel file for step definition discovery
 * Playwright-BDD uses this to ensure all step definitions are loaded
 */

// Re-export fixtures and step definition creators
export { test, Given, When, Then } from './fixtures';
export type { TestFixtures } from './fixtures';

// Import all step definitions for side effects (registration)
import './common-steps';
import '../authentication/step-definitions/auth-steps';
import '../learning/step-definitions/browse-steps';
import '../session/step-definitions/practice-steps';
import '../settings/step-definitions/settings-steps';
