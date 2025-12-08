# Changelog

<!-- markdownlint-disable MD024 MD034 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-07

### Features

- Add responsive styles for iPad Mini landscape mode (#220) @trsdn
- Remove session configuration screen and rely on settings defaults (#217) @trsdn
- Add Spanish Unit 3 learning paths and audio assets (#216, #219) @trsdn
- Generate missing Spanish audio files and update fixtures @trsdn
- Implement BDD testing framework and step definitions (#205, #182) @trsdn

### Bug Fixes

- Prevent last flashcard from appearing twice (#197) @trsdn
- Constrain auth modal width on mobile (#203) @trsdn
- Display correct version from package.json in Settings (#201) @trsdn
- Suppress console warnings for tasks without audio URLs (#200) @trsdn
- Improve UI layout and spacing for flashcards on small tablets (#220) @trsdn

### Testing & Quality

- Improve unit and E2E coverage across practice flows, feedback, and keyboard shortcuts (#204, #206, #202, #198, #199, #196, #194) @trsdn
- Add contract and integration tests for storage and spaced repetition services (#205) @trsdn

### Documentation

- Streamline README and align agent guides @trsdn

**Full Changelog**: [https://github.com/trsdn/learning-platform/compare/v1.2.0...v1.3.0](https://github.com/trsdn/learning-platform/compare/v1.2.0...v1.3.0)

## [1.2.0] - 2025-12-06

### Features

- Expand agent workforce with 14 new agents and 3 orchestrators (#185) @trsdn
- Add BDD feature files with Playwright-BDD integration (#186) @trsdn

### Bug Fixes

- Fix first task repeating and not registering correct answer (#168) @trsdn

### Refactoring

- Replace hardcoded CSS values with design tokens in Error Detection Task (#150) @AVBharath10

**Full Changelog**: [https://github.com/trsdn/learning-platform/compare/v1.1.2...v1.2.0](https://github.com/trsdn/learning-platform/compare/v1.1.2...v1.2.0)

## [1.1.0] - 2025-12-04

### Features

- Implement error-detection task type (#148) @trsdn
- Add animated progress bars with Framer Motion (#97) @trsdn
- Add confetti celebration animations (#96) @trsdn
- Implement Screen Wake Lock API (#95) @trsdn
- Integrate Vibration API for haptic feedback (#94) @trsdn
- Storybook 8 Integration with Component Library (#92) @trsdn
- SOPS encryption for environment secrets (#88) @trsdn
- Pre-commit secret detection with git-secrets and detect-secrets (#87) @trsdn
- Mobile UX Enhancements (#86) @trsdn
- Implement dev/prod environment separation with release workflow (#102) @trsdn

### Bug Fixes

- Address code review security concerns (#103) @trsdn
- Update vite to 6.4.1 for security vulnerability fix (#101) @trsdn
- Fix incorrect Spanish translation answer for "Guten Abend" (#90) @copilot-swe-agent
- Remove dark mode toggle from main screen (#142) @trsdn
- Remove '(Spanisch)' from audio auto-play setting label (#143) @trsdn
- Resolve Intermittent Vercel Deployment Failures (#85) @trsdn

### Chores

- Remove database & storage section from settings (#141) @trsdn
- Remove test & demo data from production (#144) @trsdn
- Improve seed script and update docs (#108) @trsdn
- Bump happy-dom from 19.0.2 to 20.0.11 (#98) @dependabot

**Full Changelog**: [https://github.com/trsdn/learning-platform/compare/v20251004-101103...v1.1.0](https://github.com/trsdn/learning-platform/compare/v20251004-101103...v1.1.0)

## [1.0.0] - 2025-10-04

- Initial release
