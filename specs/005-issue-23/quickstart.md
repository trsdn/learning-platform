# Quickstart: Auto-Play Audio for Language Learning Tasks

**Feature**: Auto-Play Audio for Language Learning Tasks
**Branch**: 005-issue-23
**Date**: 2025-10-04
**Purpose**: Integration test scenarios derived from user stories in spec.md

---

## Prerequisites

Before running these scenarios, ensure:
- [x] Feature implementation is complete
- [x] All contract tests are passing
- [x] Audio files are available in `public/audio/` directory
- [x] Development server is running (`npm run dev`)

---

## Scenario 1: Basic Auto-Play for Spanish Question

**User Story**: As a student starting a Spanish vocabulary practice session, when the first Spanish question appears with audio available, then the audio plays automatically after 500ms delay and I hear the Spanish pronunciation.

### Setup
```typescript
// Test data
const spanishTask: Task = {
  id: 'spanish-vocab-001',
  type: 'vocabulary',
  question: '¿Cómo estás?',
  answer: 'How are you?',
  difficulty: 'beginner',
  hasAudio: true,
  audioUrl: '/audio/spanish/como-estas.mp3',
  language: 'Spanish',
};

const settings: AudioSettings = {
  version: 1,
  autoPlayEnabled: true,
  languageFilter: 'non-German only',
  perTopicOverrides: {},
  accessibilityMode: false,
};
```

### Steps
1. Navigate to Spanish vocabulary practice session
2. Load the first question (Spanish task)
3. Wait for audio to auto-play

### Expected Result
```typescript
// After 500ms:
audioPlayback.status === 'playing'
audioPlayback.audioUrl === '/audio/spanish/como-estas.mp3'
audioPlayback.currentTime > 0
audioPlayback.autoPlayUnlocked === true

// Audio is audible
// Visual indicator shows "playing" state
```

### Validation
```bash
npm test -- quickstart-scenario-1.spec.ts
```

---

## Scenario 1a: No Auto-Play for German Question

**User Story**: As a student, when a German language question appears, then NO audio plays automatically (audio only for non-German content).

### Setup
```typescript
const germanTask: Task = {
  id: 'german-grammar-001',
  type: 'grammar',
  question: 'Was ist das Subjekt im Satz?',
  answer: 'Das Subjekt ist "er"',
  difficulty: 'beginner',
  hasAudio: true,
  audioUrl: '/audio/german/subjekt.mp3',
  language: 'German',
};
```

### Steps
1. Navigate to German grammar practice session
2. Load the first question (German task)
3. Wait 1000ms (double the auto-play delay)

### Expected Result
```typescript
// After 1000ms:
audioPlayback.status === 'stopped'  // NOT 'playing'
audioPlayback.audioUrl === null
audioPlayback.currentTime === 0

// Manual play button is visible
// No audio is playing
```

### Validation
```bash
npm test -- quickstart-scenario-1a.spec.ts
```

---

## Scenario 1b: Auto-Play Answer Audio When Revealed

**User Story**: As a student, when a Spanish answer is revealed, then the Spanish audio plays automatically after 500ms delay.

### Setup
```typescript
const spanishTaskWithAnswerAudio: Task = {
  id: 'spanish-vocab-002',
  type: 'vocabulary',
  question: 'Translate: Thank you',
  answer: 'Gracias',
  difficulty: 'beginner',
  hasAudio: true,
  audioUrl: '/audio/spanish/gracias.mp3',  // Answer audio
  language: 'Spanish',
};
```

### Steps
1. Load Spanish task
2. Submit answer
3. System reveals correct answer with audio
4. Wait for answer audio to auto-play

### Expected Result
```typescript
// After 500ms from answer reveal:
audioPlayback.status === 'playing'
audioPlayback.audioUrl === '/audio/spanish/gracias.mp3'
audioPlayback.currentTime > 0

// Answer text "Gracias" is visible
// Audio plays pronunciation of "Gracias"
```

### Validation
```bash
npm test -- quickstart-scenario-1b.spec.ts
```

---

## Scenario 2: Manual Replay

**User Story**: As a student, when audio is playing automatically, I can replay the audio using a replay button or keyboard shortcut without waiting for it to finish.

### Setup
Use Scenario 1 setup (Spanish task auto-playing)

### Steps
1. Wait for auto-play to start (500ms)
2. Press "R" key (or click replay button)
3. Observe audio restarts from beginning

### Expected Result
```typescript
// After pressing R:
audioPlayback.status === 'playing'
audioPlayback.currentTime === 0  // Reset to beginning
audioPlayback.audioUrl === '/audio/spanish/como-estas.mp3'

// Audio replays from start
```

### Validation
```bash
npm test -- quickstart-scenario-2.spec.ts
```

---

## Scenario 3: Auto-Play Disabled in Settings

**User Story**: As a student who has disabled auto-play in settings, when a new question with audio appears, then the audio does NOT play automatically and the play button is shown instead.

### Setup
```typescript
const settingsDisabled: AudioSettings = {
  version: 1,
  autoPlayEnabled: false,  // ← Disabled
  languageFilter: 'non-German only',
  perTopicOverrides: {},
  accessibilityMode: false,
};
```

### Steps
1. Set audio settings to `autoPlayEnabled: false`
2. Navigate to Spanish vocabulary session
3. Load Spanish question with audio
4. Wait 1000ms

### Expected Result
```typescript
// After 1000ms:
audioPlayback.status === 'stopped'  // NOT 'playing'
audioPlayback.audioUrl === null

// Manual play button is visible and clickable
// No audio is playing
```

### Validation
```bash
npm test -- quickstart-scenario-3.spec.ts
```

---

## Scenario 4: Browser Auto-Play Policy Blocked

**User Story**: As a student, when the browser blocks auto-play due to policy restrictions, and I first interact with the page (any click), then auto-play becomes enabled for subsequent questions and I am notified.

### Setup
- Fresh browser session (no prior interaction)
- Browser auto-play policy is restrictive (Chrome Incognito mode)

### Steps
1. Navigate to Spanish vocabulary session (no prior clicks)
2. First question loads with audio
3. Auto-play is blocked by browser
4. System shows notification: "Click anywhere to enable audio"
5. Student clicks anywhere on the page
6. Next question loads

### Expected Result
```typescript
// Question 1 (before click):
audioPlayback.status === 'stopped'
audioPlayback.autoPlayUnlocked === false
// Notification visible: "Click anywhere to enable audio"

// After user clicks:
audioPlayback.autoPlayUnlocked === true

// Question 2 (after click):
audioPlayback.status === 'playing'  // Auto-play works now
audioPlayback.audioUrl === '/audio/spanish/next-question.mp3'
```

### Validation
```bash
npm test -- quickstart-scenario-4.spec.ts --browser=chromium --incognito
```

---

## Scenario 5: Single Playback (No Auto-Repeat)

**User Story**: As a student on any Spanish lesson (beginner or advanced), when audio plays automatically, it plays once and I can use the replay button for additional listening.

### Setup
Use Scenario 1 setup (Spanish task)

### Steps
1. Load Spanish question
2. Wait for auto-play (500ms)
3. Wait for audio to finish playing (~2-3 seconds)
4. Wait additional 2 seconds

### Expected Result
```typescript
// After audio finishes:
audioPlayback.status === 'stopped'  // NOT 'playing' again
audioPlayback.currentTime === audioPlayback.duration

// Audio does NOT automatically replay
// Replay button is available
```

### Validation
```bash
npm test -- quickstart-scenario-5.spec.ts
```

---

## Scenario 6: Keyboard Shortcuts

**User Story**: As a student using keyboard navigation, when I press the replay shortcut key, then the current question's audio plays from the beginning.

### Setup
Use Scenario 1 setup (Spanish task)

### Steps
1. Load Spanish question (auto-play starts)
2. Wait until audio is halfway through (`currentTime ≈ duration / 2`)
3. Press "R" key
4. Observe audio restarts

### Expected Result
```typescript
// Before pressing R:
audioPlayback.currentTime ≈ 1.4  // Halfway through 2.8s audio

// After pressing R:
audioPlayback.status === 'playing'
audioPlayback.currentTime === 0  // Reset to beginning
```

### Additional Keyboard Tests
```typescript
// Space key: pause/resume
press('Space') → audioPlayback.status === 'paused'
press('Space') → audioPlayback.status === 'playing'

// S key: stop
press('s') → audioPlayback.status === 'stopped'
press('s') → audioPlayback.currentTime === 0
```

### Validation
```bash
npm test -- quickstart-scenario-6.spec.ts
```

---

## Scenario 7: Audio Stops When Navigating to Next Question

**User Story**: As a student, when audio is currently playing and I navigate to the next question, then the current audio stops and the new question's audio begins playing.

### Setup
```typescript
const task1: Task = {
  id: 'spanish-vocab-001',
  question: '¿Cómo estás?',
  audioUrl: '/audio/spanish/como-estas.mp3',
  language: 'Spanish',
  hasAudio: true,
};

const task2: Task = {
  id: 'spanish-vocab-002',
  question: '¿Dónde está el baño?',
  audioUrl: '/audio/spanish/donde-bano.mp3',
  language: 'Spanish',
  hasAudio: true,
};
```

### Steps
1. Load task1 (auto-play starts)
2. Wait 1 second (audio is playing)
3. Navigate to task2 (next question)
4. Observe audio transition

### Expected Result
```typescript
// Task 1 playing:
audioPlayback.audioUrl === '/audio/spanish/como-estas.mp3'
audioPlayback.status === 'playing'

// Immediately after navigating to task 2:
audioPlayback.status === 'loading'  // Brief transition
audioPlayback.audioUrl === '/audio/spanish/donde-bano.mp3'

// After 500ms delay:
audioPlayback.status === 'playing'
audioPlayback.currentTime === 0  // New audio starts from beginning
audioPlayback.preloadedNextUrl !== null  // Next question preloaded
```

### Validation
```bash
npm test -- quickstart-scenario-7.spec.ts
```

---

## Scenario 8: Background Playback (Tab Unfocused)

**User Story**: As a student, when audio is playing in a browser tab and I switch to a different tab or app, then the audio continues playing in the background without interruption.

### Setup
Use Scenario 1 setup (Spanish task)

### Steps
1. Load Spanish question (auto-play starts)
2. Wait for audio to start playing
3. Switch to a different browser tab
4. Wait 2 seconds
5. Switch back to the learning platform tab

### Expected Result
```typescript
// While on different tab (background):
audioPlayback.status === 'playing'  // Still playing
audioPlayback.currentTime > 0  // Continues advancing

// When returning to tab:
audioPlayback.status === 'playing'  // Still playing
// No interruption, audio never paused
```

### Validation
```bash
npm test -- quickstart-scenario-8.spec.ts
```

---

## Edge Case Scenarios

### Edge Case 1: Missing Audio File

**Scenario**: Audio URL points to non-existent file

### Steps
1. Load task with `audioUrl: '/audio/spanish/missing.mp3'`
2. Wait for auto-play attempt

### Expected Result
```typescript
audioPlayback.status === 'error'
audioPlayback.error === 'Failed to load audio: 404 Not Found'

// Manual play button shown
// Error message: "Audio unavailable - click to retry"
```

---

### Edge Case 2: Slow Network

**Scenario**: Audio file takes >5 seconds to load

### Steps
1. Simulate slow network (Playwright: `page.route()` with delay)
2. Load Spanish task with audio
3. Observe timeout behavior

### Expected Result
```typescript
// After 1 second:
// Loading indicator visible

// After 5 seconds (timeout):
audioPlayback.status === 'error'
audioPlayback.error === 'Audio load timeout'

// Manual play button shown
```

---

### Edge Case 3: Rapid Question Navigation

**Scenario**: Student navigates through 5 questions in 2 seconds

### Steps
1. Load question 1
2. Immediately navigate to question 2 (within 100ms)
3. Immediately navigate to question 3
4. Immediately navigate to question 4
5. Immediately navigate to question 5
6. Wait for auto-play

### Expected Result
```typescript
// Only question 5's audio plays
audioPlayback.audioUrl === '/audio/spanish/question-5.mp3'
audioPlayback.status === 'playing'

// Previous audio requests were cancelled
// No audio queue backlog
```

---

## Accessibility Scenario

### Accessibility: IPA Pronunciation Guide

**User Story**: As a deaf student with accessibility mode enabled, when a Spanish question appears, I see IPA pronunciation notation instead of hearing audio.

### Setup
```typescript
const settingsAccessibility: AudioSettings = {
  version: 1,
  autoPlayEnabled: false,
  languageFilter: 'none',
  perTopicOverrides: {},
  accessibilityMode: true,  // ← Enabled
};

const taskWithIPA: Task = {
  id: 'spanish-vocab-001',
  question: '¿Cómo estás?',
  audioUrl: '/audio/spanish/como-estas.mp3',
  language: 'Spanish',
  hasAudio: true,
  ipa: '[ˈko.mo esˈtas]',  // ← IPA notation
};
```

### Steps
1. Enable accessibility mode in settings
2. Load Spanish task with IPA
3. Observe UI

### Expected Result
```typescript
// UI shows:
// Question: ¿Cómo estás?
// IPA: [ˈko.mo esˈtas]

// No audio auto-plays
// Manual play button available (for those who can hear)
// Screen reader announces: "Pronunciation guide: ko-mo es-tas"
```

### Validation
```bash
npm test -- quickstart-accessibility.spec.ts
```

---

## Performance Validation

### Performance: Audio Preloading

**Objective**: Verify next question's audio is preloaded

### Setup
```typescript
const task1: Task = {
  id: 'spanish-vocab-001',
  audioUrl: '/audio/spanish/question-1.mp3',
  language: 'Spanish',
  hasAudio: true,
};

const task2: Task = {
  id: 'spanish-vocab-002',
  audioUrl: '/audio/spanish/question-2.mp3',
  language: 'Spanish',
  hasAudio: true,
};
```

### Steps
1. Load task1
2. Wait for auto-play
3. Check playback state for preloaded audio
4. Navigate to task2
5. Measure time until audio plays

### Expected Result
```typescript
// While on task1:
audioPlayback.preloadedNextUrl === '/audio/spanish/question-2.mp3'

// When navigating to task2:
const navigationTime = measureTime(() => {
  navigateToNext();
  waitForAudioPlaying();
});

expect(navigationTime).toBeLessThan(1000);  // <1s due to preloading
```

---

## Running All Quickstart Tests

```bash
# Run all quickstart scenarios
npm test -- quickstart

# Run specific scenario
npm test -- quickstart-scenario-1.spec.ts

# Run with coverage
npm test -- quickstart --coverage

# Run in headed browser (visual debugging)
npx playwright test quickstart --headed
```

---

## Success Criteria

All quickstart scenarios must pass before feature is considered complete:

- [x] Scenario 1: Basic auto-play works
- [x] Scenario 1a: German content does not auto-play
- [x] Scenario 1b: Answer audio auto-plays
- [x] Scenario 2: Manual replay works
- [x] Scenario 3: Settings disable auto-play
- [x] Scenario 4: Browser policy handled gracefully
- [x] Scenario 5: No auto-repeat behavior
- [x] Scenario 6: Keyboard shortcuts functional
- [x] Scenario 7: Audio stops on navigation
- [x] Scenario 8: Background playback works
- [x] Edge Case 1: Missing audio handled
- [x] Edge Case 2: Slow network handled
- [x] Edge Case 3: Rapid navigation handled
- [x] Accessibility: IPA guides shown
- [x] Performance: Preloading verified

---

## Next Steps

After all quickstart tests pass:
1. Run full E2E test suite
2. Perform manual testing on real devices
3. Verify accessibility with screen readers
4. Check performance with Lighthouse
5. Merge to main branch
