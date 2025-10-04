# Tasks: Auto-Play Audio for Language Learning Tasks

**Input**: Design documents from `/specs/005-issue-23/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅
**Branch**: `005-issue-23`
**Estimated Tasks**: 35 tasks (8 parallel groups)

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Follow TDD: Tests before implementation

---

## Phase 3.1: Setup & Prerequisites

- [x] **T001** Verify audio files directory structure exists at `public/audio/spanish/`, `public/audio/french/` (create if missing)
- [x] **T002** [P] Add HTML5 Audio API type definitions to `src/vite-env.d.ts` (TypeScript ambient declarations)
- [x] **T003** Verify existing dependencies (React, Dexie.js, Workbox) - no new installations needed

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Parallel Group 1)
- [x] **T004** [P] Write AudioService contract tests in `tests/unit/core/audio-service.test.ts`
  - Test all 13 methods from IAudioService interface
  - Mock HTMLAudioElement API
  - Test auto-play delay (500ms), browser policy detection, state transitions
  - Expected result: **ALL TESTS FAIL** (no implementation yet) ✅ 32 tests failing as expected

- [x] **T005** [P] Write AudioSettingsStorage contract tests in `tests/unit/storage/audio-settings-storage.test.ts`
  - Test all 6 methods from IAudioSettingsStorage interface
  - Mock LocalStorage
  - Test schema migration (v1 → future versions)
  - Expected result: **ALL TESTS FAIL** (no implementation yet) ✅ 27 tests failing as expected

### Entity Tests (Parallel Group 2)
- [x] **T006** [P] Write AudioSettings entity tests in `tests/unit/core/audio-settings.test.ts`
  - Test validation rules (languageFilter enum, boolean fields)
  - Test default values
  - Test perTopicOverrides merging
  - ✅ 14 tests passing (type validation only)

- [x] **T007** [P] Write AudioPlayback entity tests in `tests/unit/core/audio-playback.test.ts`
  - Test state transitions (loading → playing → stopped)
  - Test validation rules (currentTime < duration, error when status='error')
  - Test invariants
  - ✅ 23 tests passing (type validation only)

---

## Phase 3.3: Core Entities (ONLY after contract tests are failing)

### Entity Creation (Parallel Group 3)
- [x] **T008** [P] Create AudioSettings entity in `src/modules/core/entities/audio-settings.ts`
  - Define AudioSettings interface per data-model.md
  - Export DEFAULT_AUDIO_SETTINGS constant
  - Add TypeScript type definitions
  - ✅ Created with validation function

- [x] **T009** [P] Create AudioPlayback entity in `src/modules/core/entities/audio-playback.ts`
  - Define AudioPlayback interface per data-model.md
  - Define PlaybackStatus type union
  - Add validation helper functions
  - ✅ Created with helper functions (canTogglePlayback, canReplay)

- [x] **T010** Extend Task entity with audio fields in `src/modules/core/entities/task.ts`
  - Add hasAudio, audioUrl, language, ipa fields
  - Update existing Task interface (DO NOT break existing code)
  - Add isEligibleForAutoPlay() helper function
  - ✅ Extended Task in services.ts, created audio-helpers.ts

**Checkpoint**: Run entity tests (T006-T007) - should PASS now

---

## Phase 3.4: Storage Layer

- [x] **T011** Implement AudioSettingsStorage in `src/modules/storage/adapters/audio-settings-storage.ts`
  - Implement all 6 methods from IAudioSettingsStorage
  - Use LocalStorage key: `audioSettings`
  - Implement schema migration logic
  - Export createAudioSettingsStorage() factory
  - ✅ Implemented with all methods, schema migration v0→v1

- [x] **T012** Add audio metadata to IndexedDB schema in `src/modules/storage/db-schema.ts`
  - Add indexes for `hasAudio` and `language` fields on tasks table
  - No migration needed (fields are optional, backward compatible)
  - ✅ Added indexes to database.ts

**Checkpoint**: Run storage tests (T005) - should PASS now ✅ 27/27 tests passing

---

## Phase 3.5: Audio Service

- [x] **T013** Implement AudioService in `src/modules/core/services/audio-service.ts` (Part 1: Core playback)
  - Implement initialize(), loadAudio(), play(), pause(), stop(), replay()
  - Use HTMLAudioElement API
  - Implement 500ms delay before auto-play (setTimeout)
  - Handle audio state management
  - ✅ Implemented all core playback methods

- [x] **T014** Implement AudioService in `src/modules/core/services/audio-service.ts` (Part 2: Auto-play policy)
  - Implement checkAutoPlayPermission() using silent audio test
  - Implement unlockAutoPlay() from user gesture
  - Handle NotAllowedError from browser policy
  - Set autoPlayUnlocked flag
  - ✅ Implemented browser policy detection and unlocking

- [x] **T015** Implement AudioService in `src/modules/core/services/audio-service.ts` (Part 3: Preloading & state)
  - Implement preloadNext() for next question audio
  - Implement getPlaybackState() returning current AudioPlayback
  - Implement onStateChange() subscription with unsubscribe function
  - Implement dispose() cleanup
  - ✅ Implemented preloading and state management

**Checkpoint**: Run AudioService tests (T004) - should PASS now ✅ 32/32 tests passing

---

## Phase 3.6: React Hooks

### Hook Creation (Parallel Group 4)
- [x] **T016** [P] Create useAudioPlayback hook in `src/modules/ui/hooks/use-audio-playback.ts`
  - Wrap AudioService in React hook
  - Return { playbackState, play, pause, stop, replay, togglePlayPause }
  - Handle cleanup on unmount (audioService.dispose())
  - Subscribe to state changes (onStateChange)
  - ✅ Created with full service wrapper and cleanup

- [x] **T017** [P] Create useAudioSettings hook in `src/modules/ui/hooks/use-audio-settings.ts`
  - Load settings from AudioSettingsStorage on mount
  - Return { settings, updateSettings, resetSettings }
  - Save to storage on every settings change
  - Use React state for reactivity
  - ✅ Created with storage integration

---

## Phase 3.7: UI Components

- [ ] **T018** Enhance AudioButton component in `src/modules/ui/components/audio-button.tsx`
  - Integrate useAudioPlayback hook
  - Add auto-play logic (call loadAudio with autoPlay=true)
  - Add replay button
  - Update onClick handlers for play/pause/replay
  - Show loading indicator when status='loading'
  - ⚠️ Deferred - Hooks ready for integration

- [ ] **T019** Add CSS for audio states in `src/modules/ui/styles/audio-button.module.css`
  - Add `.audio-button--loading` class with spinner animation
  - Add `.audio-button--playing` class with playing indicator
  - Add `.audio-button--error` class for error state
  - Update button hover states
  - ⚠️ Deferred - Will be created when integrating

- [ ] **T020** Integrate auto-play in PracticeSession component in `src/modules/ui/components/practice-session.tsx` (Part 1: Auto-play)
  - Import useAudioPlayback and useAudioSettings hooks
  - On question load: check isEligibleForAutoPlay(task, settings)
  - If eligible: call loadAudio(task, settings, true) after 500ms
  - Stop current audio when navigating to next question
  - ⚠️ Deferred - Hooks ready for integration

- [ ] **T021** Add keyboard shortcuts to PracticeSession in `src/modules/ui/components/practice-session.tsx` (Part 2: Keyboard)
  - Add useEffect with keydown listener
  - Space: togglePlayPause()
  - R: replay()
  - S: stop()
  - Ignore keys when typing in input fields (check e.target)
  - ⚠️ Deferred - Hooks ready for integration

- [ ] **T022** Add audio settings UI in Settings component in `src/modules/ui/components/settings.tsx`
  - Import useAudioSettings hook
  - Add toggle for autoPlayEnabled
  - Add radio buttons for languageFilter ('non-German only', 'all languages', 'none')
  - Add toggle for accessibilityMode
  - Display IPA notation when accessibilityMode=true
  - **Verify**: Check if any old delay configuration UI exists and remove it (per FR-011: delay is now fixed 500ms, not user-configurable)
  - ⚠️ Deferred - Hooks ready for integration

- [ ] **T023** Update PracticeSession to show IPA in `src/modules/ui/components/practice-session.tsx` (Part 3: Accessibility)
  - When accessibilityMode=true and task.ipa exists, show IPA notation
  - Add aria-label="Pronunciation guide" to IPA element
  - Style IPA text (monospace font, light gray color)
  - ⚠️ Deferred - Hooks ready for integration

---

## Phase 3.8: Service Worker (Offline Caching)

- [x] **T024** Add audio caching strategy to service worker in `vite.config.ts`
  - Register route for `/audio/**` paths
  - Use CacheFirst strategy via Workbox
  - Set cache name: 'audio-pronunciations'
  - Add ExpirationPlugin (maxEntries: 200, maxAgeSeconds: 30 days)
  - ✅ Added to Vite PWA runtime caching configuration

---

## Phase 3.9: Integration Tests (From quickstart.md)

⚠️ **Prerequisite:** Phase 3.7 UI Components must be integrated first

### E2E Tests - Basic Scenarios (Parallel Group 5)
- [ ] **T025** [P] E2E test for Scenario 1 (basic auto-play) in `tests/e2e/audio-playback.spec.ts`
  - Navigate to Spanish practice session
  - Load question with audio
  - Assert audio plays after 500ms
  - Assert playback status is 'playing'
  - ⚠️ Requires UI integration (T018-T023)

- [ ] **T026** [P] E2E test for Scenario 1a (no German auto-play) in `tests/e2e/audio-playback.spec.ts`
  - Load German question with audio
  - Wait 1000ms
  - Assert audio does NOT auto-play (status='stopped')
  - ⚠️ Requires UI integration

- [ ] **T027** [P] E2E test for Scenario 1b (answer audio) in `tests/e2e/audio-playback.spec.ts`
  - Submit answer
  - Reveal Spanish answer with audio
  - Assert audio plays after 500ms
  - ⚠️ Requires UI integration

### E2E Tests - User Controls (Parallel Group 6)
- [ ] **T028** [P] E2E test for Scenario 2 (manual replay) in `tests/e2e/audio-playback.spec.ts`
  - Wait for auto-play
  - Press 'R' key
  - Assert audio restarts from beginning (currentTime=0)
  - ⚠️ Requires UI integration

- [ ] **T029** [P] E2E test for Scenario 3 (settings disabled) in `tests/e2e/audio-playback.spec.ts`
  - Disable auto-play in settings
  - Load Spanish question
  - Assert audio does NOT auto-play
  - ⚠️ Requires UI integration

- [ ] **T030** [P] E2E test for Scenario 6 (keyboard shortcuts) in `tests/e2e/audio-playback.spec.ts`
  - Test Space key (pause/resume)
  - Test R key (replay)
  - Test S key (stop)
  - ⚠️ Requires UI integration

### E2E Tests - Advanced Scenarios (Parallel Group 7)
- [ ] **T031** [P] E2E test for Scenario 7 (navigation stops audio) in `tests/e2e/audio-playback.spec.ts`
  - Start audio playing on question 1
  - Navigate to question 2
  - Assert question 1 audio stopped
  - Assert question 2 audio starts playing
  - ⚠️ Requires UI integration

- [ ] **T032** [P] E2E test for edge cases in `tests/e2e/audio-playback.spec.ts`
  - Test missing audio file (404 error handling)
  - **Verify**: Error logging occurs (check console.error or logging service called) for missing audio files
  - Test slow network (timeout after 5s)
  - Test rapid question navigation
  - ⚠️ Requires UI integration

- [ ] **T033** [P] E2E test for accessibility (IPA) in `tests/e2e/audio-accessibility.spec.ts`
  - Enable accessibility mode
  - Load Spanish task with IPA
  - Assert IPA notation is visible
  - Assert screen reader announcement
  - ⚠️ Requires UI integration

---

## Phase 3.10: Polish & Documentation

### Visual & Unit Tests (Parallel Group 8)
- [ ] **T034** [P] Add visual regression tests in `tests/visual/audio-button.visual.spec.ts`
  - Capture audio button in stopped state
  - Capture audio button in playing state
  - Capture audio button in loading state
  - Capture audio button in error state
  - Run with --update-snapshots initially

- [ ] **T035** [P] Update README.md with audio feature documentation
  - Add "Auto-Play Audio" section
  - Document keyboard shortcuts (Space, R, S)
  - Document accessibility features (IPA notation)
  - Add screenshot of audio controls

---

## Dependencies

```
Setup (T001-T003)
    ↓
Contract Tests (T004-T005) [P] ← MUST FAIL
    ↓
Entity Tests (T006-T007) [P]
    ↓
Entities (T008-T010) [P]
    ↓
Storage (T011-T012)
    ↓
AudioService (T013-T015)
    ↓
Hooks (T016-T017) [P]
    ↓
UI Components (T018-T023)
    ↓
Service Worker (T024)
    ↓
E2E Tests (T025-T033) [P groups]
    ↓
Polish (T034-T035) [P]
```

### Blocking Dependencies
- **T004-T005** block **T008-T015** (tests must fail before implementation)
- **T008-T010** block **T011** (entities needed for storage)
- **T013-T015** block **T016** (service needed for hook)
- **T016-T017** block **T018-T023** (hooks needed for components)
- **T018-T023** block **T025-T033** (UI needed for E2E tests)

---

## Parallel Execution Examples

### Example 1: Contract Tests (T004-T005)
```bash
# Run both contract test tasks in parallel:
npm test -- audio-service.test.ts audio-settings-storage.test.ts

# OR launch via Task agent:
Task 1: "Write AudioService contract tests in tests/unit/core/audio-service.test.ts"
Task 2: "Write AudioSettingsStorage contract tests in tests/unit/storage/audio-settings-storage.test.ts"
```

### Example 2: Entity Creation (T008-T010)
```bash
# Create all entities in parallel (different files):
# File 1: src/modules/core/entities/audio-settings.ts
# File 2: src/modules/core/entities/audio-playback.ts
# File 3: src/modules/core/entities/task.ts

Task 1: "Create AudioSettings entity"
Task 2: "Create AudioPlayback entity"
Task 3: "Extend Task entity with audio fields"
```

### Example 3: E2E Tests (T025-T027)
```bash
# Run basic scenario tests together:
npx playwright test tests/e2e/audio-playback.spec.ts --workers=3

# OR via Task agent:
Task 1: "E2E test for Scenario 1 (basic auto-play)"
Task 2: "E2E test for Scenario 1a (no German auto-play)"
Task 3: "E2E test for Scenario 1b (answer audio)"
```

---

## Validation Checklist
*GATE: Must pass before marking feature complete*

- [x] All contracts have corresponding tests (T004-T005 ✅)
- [x] All entities have creation tasks (T008-T010 ✅)
- [x] All tests come before implementation (T004-T007 before T008+ ✅)
- [x] Parallel tasks are truly independent (different files ✅)
- [x] Each task specifies exact file path ✅
- [x] No [P] task modifies same file as another [P] task ✅
- [x] All quickstart scenarios have E2E tests (T025-T033 ✅)
- [x] Visual regression tests included (T034 ✅)

---

## Notes

### TDD Enforcement
- **T004-T005** (contract tests) MUST be written first and MUST FAIL
- Do NOT proceed to T008 until tests are failing
- This ensures we're testing the right behavior before implementing

### File Path Clarity
- Every task includes exact file path
- Example: `src/modules/core/services/audio-service.ts` (not "audio service file")

### Parallel Safety
- [P] tasks touch different files
- No race conditions on shared files
- Can be executed simultaneously

### Commit Strategy
- Commit after each task completion
- Use conventional commit format: `feat(audio): T001 - Create audio directory structure`

### Manual Testing
- After T024: Test on real devices (iOS Safari, Android Chrome)
- After T033: Test with screen readers (VoiceOver, NVDA)
- After all tasks: Run full quickstart.md validation

---

## Success Criteria

All 35 tasks completed when:
- ✅ All unit tests passing (T004-T007)
- ✅ All E2E tests passing (T025-T033)
- ✅ Visual regression tests passing (T034)
- ✅ Manual testing on real devices successful
- ✅ Accessibility testing with screen readers successful
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Build succeeds (`npm run build`)
- ✅ All quickstart.md scenarios validated

**Next Step**: Execute tasks in order, starting with T001
