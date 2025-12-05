# Feature Registry

This document tracks all features with their unique IDs, status, and test coverage.

## Feature ID Convention

| Prefix | Domain | Example |
|--------|--------|---------|
| `LP-` | Learning Paths | LP-001 (Browse topics) |
| `PS-` | Practice Session | PS-001 (Start session) |
| `TT-` | Task Types | TT-MC-001 (Multiple choice) |
| `SR-` | Spaced Repetition | SR-001 (New item intervals) |
| `UP-` | User Progress | UP-001 (View progress) |
| `US-` | User Settings | US-001 (Access settings) |
| `AU-` | Authentication | AU-001 (Login options) |

## Feature Status Legend

| Status | Description |
|--------|-------------|
| :white_check_mark: | Implemented and tested |
| :construction: | Implemented, needs tests |
| :hourglass: | In development |
| :memo: | Planned/Specified |
| :x: | Deprecated |

---

## Learning Paths (LP)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| LP-001 | View available topics on dashboard | :construction: | `browse-topics.feature` | Smoke test |
| LP-002 | Navigate to a topic | :construction: | `browse-topics.feature` | |
| LP-003 | View learning path details | :construction: | `browse-topics.feature` | |
| LP-004 | Filter topics by progress | :memo: | `browse-topics.feature` | Not yet implemented |
| LP-005 | Keyboard navigation for topics | :construction: | `browse-topics.feature` | Accessibility |

---

## Practice Session (PS)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| PS-001 | Start a practice session | :construction: | `practice-session.feature` | Smoke test |
| PS-002 | Answer multiple choice correctly | :construction: | `practice-session.feature` | |
| PS-003 | Answer multiple choice incorrectly | :construction: | `practice-session.feature` | |
| PS-004 | Complete cloze deletion task | :construction: | `practice-session.feature` | |
| PS-005 | Complete matching task | :construction: | `practice-session.feature` | |
| PS-006 | Complete ordering task | :construction: | `practice-session.feature` | |
| PS-007 | Complete word scramble task | :construction: | `practice-session.feature` | |
| PS-008 | Complete true/false task | :construction: | `practice-session.feature` | |
| PS-009 | Complete error detection task | :construction: | `practice-session.feature` | |
| PS-010 | Complete full practice session | :construction: | `practice-session.feature` | Smoke test |
| PS-011 | Navigate back during session | :construction: | `practice-session.feature` | |
| PS-012 | Session progress is saved | :memo: | `practice-session.feature` | Resume functionality |

---

## Task Types (TT)

### Multiple Choice (TT-MC)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-MC-001 | Display all options | :construction: | `task-types.feature` | |
| TT-MC-002 | Selection is clear | :construction: | `task-types.feature` | |

### Multiple Select (TT-MS)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-MS-001 | Allow multiple selections | :construction: | `task-types.feature` | |
| TT-MS-002 | Partial credit feedback | :construction: | `task-types.feature` | |

### Cloze Deletion (TT-CD)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-CD-001 | Display context | :construction: | `task-types.feature` | |
| TT-CD-002 | Provide hints | :memo: | `task-types.feature` | Not yet implemented |

### Matching (TT-MA)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-MA-001 | Display pairs | :construction: | `task-types.feature` | |
| TT-MA-002 | Drag and drop | :construction: | `task-types.feature` | |

### Ordering (TT-OR)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-OR-001 | Display items | :construction: | `task-types.feature` | |
| TT-OR-002 | Drag and drop | :construction: | `task-types.feature` | |

### Word Scramble (TT-WS)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-WS-001 | Display scrambled letters | :construction: | `task-types.feature` | |

### True/False (TT-TF)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-TF-001 | Display statement | :construction: | `task-types.feature` | |

### Error Detection (TT-ED)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-ED-001 | Display text with errors | :construction: | `task-types.feature` | |
| TT-ED-002 | Allow unmarking | :construction: | `task-types.feature` | |

### Flashcard (TT-FC)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| TT-FC-001 | Display front | :construction: | `task-types.feature` | |
| TT-FC-002 | Flip reveals answer | :construction: | `task-types.feature` | |

---

## Spaced Repetition (SR)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| SR-001 | New items start with short intervals | :memo: | `spaced-repetition.feature` | Core algorithm |
| SR-002 | Correct answers increase intervals | :memo: | `spaced-repetition.feature` | Core algorithm |
| SR-003 | Incorrect answers reset intervals | :memo: | `spaced-repetition.feature` | Core algorithm |
| SR-004 | Easy items have longer intervals | :memo: | `spaced-repetition.feature` | |
| SR-005 | Hard items have shorter intervals | :memo: | `spaced-repetition.feature` | |
| SR-006 | Due items are prioritized | :memo: | `spaced-repetition.feature` | |
| SR-007 | Mastery level reflects retention | :memo: | `spaced-repetition.feature` | |

---

## User Progress (UP)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| UP-001 | View overall progress | :construction: | `user-progress.feature` | Smoke test |
| UP-002 | View learning path progress | :construction: | `user-progress.feature` | |
| UP-003 | View streak information | :construction: | `user-progress.feature` | |
| UP-004 | Streak resets after missing day | :construction: | `user-progress.feature` | |
| UP-005 | View session history | :memo: | `user-progress.feature` | Not yet implemented |
| UP-006 | View performance by task type | :memo: | `user-progress.feature` | Not yet implemented |
| UP-007 | Progress syncs across devices | :construction: | `user-progress.feature` | Supabase sync |
| UP-008 | View today's practice summary | :memo: | `user-progress.feature` | |

---

## User Settings (US)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| US-001 | Access settings page | :construction: | `user-settings.feature` | |
| US-002 | Toggle audio feedback | :construction: | `user-settings.feature` | Audio |
| US-003 | Adjust audio volume | :construction: | `user-settings.feature` | Audio |
| US-004 | Toggle haptic feedback | :construction: | `user-settings.feature` | Mobile |
| US-005 | Toggle confetti celebrations | :construction: | `user-settings.feature` | |
| US-006 | Toggle celebration sounds | :construction: | `user-settings.feature` | |
| US-007 | Settings persist across sessions | :construction: | `user-settings.feature` | |
| US-008 | Reduce motion setting | :memo: | `user-settings.feature` | Accessibility |
| US-009 | Reset settings to defaults | :memo: | `user-settings.feature` | |

---

## Authentication (AU)

| ID | Feature | Status | Test File | Notes |
|----|---------|--------|-----------|-------|
| AU-001 | View login options | :construction: | `auth.feature` | Smoke test |
| AU-002 | Login with email/password | :construction: | `auth.feature` | |
| AU-003 | Login with invalid credentials | :construction: | `auth.feature` | |
| AU-004 | Login with social provider | :construction: | `auth.feature` | OAuth |
| AU-005 | Logout | :construction: | `auth.feature` | |
| AU-006 | Session persists on refresh | :construction: | `auth.feature` | |
| AU-007 | Protected routes redirect | :construction: | `auth.feature` | |
| AU-008 | Register new account | :construction: | `auth.feature` | |
| AU-009 | Password reset request | :construction: | `auth.feature` | |
| AU-010 | Session expires after inactivity | :memo: | `auth.feature` | Security |

---

## Summary

| Domain | Total | Implemented | Tested | Coverage |
|--------|-------|-------------|--------|----------|
| Learning Paths | 5 | 4 | 0 | 0% |
| Practice Session | 12 | 11 | 0 | 0% |
| Task Types | 14 | 14 | 0 | 0% |
| Spaced Repetition | 7 | 0 | 0 | 0% |
| User Progress | 8 | 4 | 0 | 0% |
| User Settings | 9 | 6 | 0 | 0% |
| Authentication | 10 | 8 | 0 | 0% |
| **Total** | **65** | **47** | **0** | **0%** |

---

## How to Use This Registry

### Adding a New Feature

1. Assign the next ID in the appropriate domain
2. Add the feature to the corresponding `.feature` file with the ID as a tag
3. Update this registry with the new entry
4. Implement the feature
5. Write step definitions
6. Update status to :white_check_mark: when tested

### Running Tests by Feature ID

```bash
# Run all tests for a specific feature
npm run test:bdd -- --grep @LP-001

# Run all tests for a domain
npm run test:bdd -- --grep @learning

# Run smoke tests only
npm run test:bdd -- --grep @smoke
```

### Generating Coverage Report

```bash
npm run test:bdd:coverage
```
