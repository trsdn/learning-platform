# Data Model: Auto-Play Audio for Language Learning Tasks

**Feature**: Auto-Play Audio for Language Learning Tasks
**Branch**: 005-issue-23
**Date**: 2025-10-04

## Overview
This document defines the data entities, their fields, relationships, validation rules, and state transitions for the auto-play audio feature.

---

## Entity Diagram

```
┌─────────────────────┐
│   AudioSettings     │
│  (LocalStorage)     │
├─────────────────────┤
│ - autoPlayEnabled   │
│ - languageFilter    │
│ - perTopicOverrides │
│ - accessibilityMode │
└──────────┬──────────┘
           │
           │ 1:1 per user
           │
           ▼
┌─────────────────────┐         ┌─────────────────────┐
│  AudioPlayback      │  uses   │       Task          │
│   (Runtime State)   ├────────▶│   (Existing +       │
├─────────────────────┤         │    Extended)        │
│ - audioUrl          │         ├─────────────────────┤
│ - status            │         │ - hasAudio          │
│ - currentTime       │         │ - audioUrl          │
│ - duration          │         │ - language          │
│ - autoPlayUnlocked  │         │ - ipa (optional)    │
│ - preloadedNextUrl  │         └─────────────────────┘
└─────────────────────┘
```

---

## 1. AudioSettings

**Purpose**: Stores user preferences for audio playback behavior
**Storage**: LocalStorage (key: `audioSettings`)
**Lifecycle**: Persisted across sessions, loaded on app initialization

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `autoPlayEnabled` | `boolean` | Yes | `true` | Master switch for auto-play feature |
| `languageFilter` | `'non-German only' \| 'all languages' \| 'none'` | Yes | `'non-German only'` | Which content triggers auto-play |
| `perTopicOverrides` | `Record<string, Partial<AudioSettings>>` | No | `{}` | Per-topic setting overrides (key = topic ID) |
| `accessibilityMode` | `boolean` | Yes | `false` | Enable visual pronunciation guides (IPA) |
| `version` | `number` | Yes | `1` | Schema version for migrations |

### Validation Rules

```typescript
function validateAudioSettings(settings: unknown): AudioSettings {
  const s = settings as Partial<AudioSettings>;

  if (typeof s.autoPlayEnabled !== 'boolean') {
    throw new Error('autoPlayEnabled must be boolean');
  }

  if (!['non-German only', 'all languages', 'none'].includes(s.languageFilter ?? '')) {
    throw new Error('Invalid languageFilter value');
  }

  if (s.perTopicOverrides && typeof s.perTopicOverrides !== 'object') {
    throw new Error('perTopicOverrides must be object');
  }

  if (typeof s.accessibilityMode !== 'boolean') {
    throw new Error('accessibilityMode must be boolean');
  }

  return s as AudioSettings;
}
```

### State Transitions

```
Initial Load:
  ┌─────────────┐
  │  App Start  │
  └──────┬──────┘
         │
         ▼
  ┌─────────────────────┐
  │ Load from Storage   │◄─── If not found: use defaults
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ Validate & Migrate  │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │   Settings Ready    │
  └─────────────────────┘

User Changes:
  ┌─────────────────────┐
  │  User Toggles       │
  │  Auto-Play Switch   │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ Update State        │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ Save to Storage     │
  └─────────────────────┘
```

### Example Data

```json
{
  "version": 1,
  "autoPlayEnabled": true,
  "languageFilter": "non-German only",
  "perTopicOverrides": {
    "spanish-vocab": {
      "autoPlayEnabled": true
    },
    "math-basics": {
      "autoPlayEnabled": false
    }
  },
  "accessibilityMode": false
}
```

---

## 2. AudioPlayback

**Purpose**: Tracks the current audio playback state during a practice session
**Storage**: Runtime only (React state), not persisted
**Lifecycle**: Created when question loads, destroyed when session ends

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `audioUrl` | `string \| null` | Yes | `null` | URL of currently playing/loaded audio |
| `status` | `'playing' \| 'paused' \| 'stopped' \| 'loading' \| 'error'` | Yes | `'stopped'` | Current playback status |
| `currentTime` | `number` | Yes | `0` | Current playback position in seconds |
| `duration` | `number` | Yes | `0` | Total audio duration in seconds |
| `autoPlayUnlocked` | `boolean` | Yes | `false` | Whether browser has granted auto-play permission |
| `preloadedNextUrl` | `string \| null` | No | `null` | URL of preloaded next question's audio |
| `error` | `string \| null` | No | `null` | Error message if status === 'error' |

### Validation Rules

```typescript
function validateAudioPlayback(state: unknown): AudioPlayback {
  const s = state as Partial<AudioPlayback>;

  const validStatuses = ['playing', 'paused', 'stopped', 'loading', 'error'];
  if (!validStatuses.includes(s.status ?? '')) {
    throw new Error(`Invalid status: ${s.status}`);
  }

  if (s.currentTime !== undefined && (s.currentTime < 0 || !isFinite(s.currentTime))) {
    throw new Error('currentTime must be non-negative finite number');
  }

  if (s.duration !== undefined && (s.duration < 0 || !isFinite(s.duration))) {
    throw new Error('duration must be non-negative finite number');
  }

  if (s.status === 'error' && !s.error) {
    throw new Error('error message required when status is error');
  }

  return s as AudioPlayback;
}
```

### State Transitions

```
Question Loaded:
  ┌─────────────────────┐
  │  Question Appears   │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ status: 'loading'   │
  └──────┬──────────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ Load Success │  │ Load Timeout │  │ Load Error   │
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                 │                 │
         ▼                 ▼                 ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ Auto-play    │  │ status:      │  │ status:      │
  │ (500ms delay)│  │ 'stopped'    │  │ 'error'      │
  └──────┬───────┘  │ (manual btn) │  │ (retry btn)  │
         │          └──────────────┘  └──────────────┘
         ▼
  ┌──────────────┐
  │ status:      │
  │ 'playing'    │
  └──────────────┘

Playback Controls:
  ┌─────────────────────┐
  │  User Presses       │
  │  Space (pause)      │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ status: 'playing'   │◄───┐
  │        ↕            │    │
  │ status: 'paused'    │────┘
  └─────────────────────┘

  ┌─────────────────────┐
  │  User Presses R     │
  │  (replay)           │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ currentTime = 0     │
  │ status: 'playing'   │
  └─────────────────────┘

  ┌─────────────────────┐
  │  User Presses S     │
  │  (stop)             │
  └──────┬──────────────┘
         │
         ▼
  ┌─────────────────────┐
  │ currentTime = 0     │
  │ status: 'stopped'   │
  └─────────────────────┘
```

### Example Data

```typescript
// Playing state
{
  audioUrl: '/audio/spanish/como-estas.mp3',
  status: 'playing',
  currentTime: 1.25,
  duration: 2.8,
  autoPlayUnlocked: true,
  preloadedNextUrl: '/audio/spanish/gracias.mp3',
  error: null
}

// Error state
{
  audioUrl: '/audio/spanish/missing.mp3',
  status: 'error',
  currentTime: 0,
  duration: 0,
  autoPlayUnlocked: true,
  preloadedNextUrl: null,
  error: 'Failed to load audio: 404 Not Found'
}
```

---

## 3. Task (Extended)

**Purpose**: Represents a learning task/question with optional audio
**Storage**: IndexedDB (existing storage layer)
**Lifecycle**: Loaded from templates, cached during session
**Changes**: Extended existing Task entity with audio-related fields

### New/Modified Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `hasAudio` | `boolean` | Yes | `false` | Whether this task has pronunciation audio |
| `audioUrl` | `string \| null` | No | `null` | Path to audio file (relative to `/audio/`) |
| `language` | `string` | Yes | `'German'` | Content language (e.g., 'Spanish', 'French', 'German') |
| `ipa` | `string \| null` | No | `null` | IPA pronunciation guide (for accessibility) |

### Existing Fields (No Changes)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique task identifier |
| `type` | `string` | Yes | Task type (e.g., 'vocabulary', 'grammar') |
| `question` | `string` | Yes | Question text |
| `answer` | `string \| object` | Yes | Correct answer |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | Yes | Difficulty level |

### Validation Rules

```typescript
function validateTaskAudio(task: Task): void {
  if (task.hasAudio && !task.audioUrl) {
    throw new Error('hasAudio is true but audioUrl is missing');
  }

  if (task.audioUrl && !task.hasAudio) {
    console.warn('audioUrl provided but hasAudio is false');
  }

  if (task.audioUrl && !task.audioUrl.startsWith('/audio/')) {
    throw new Error('audioUrl must start with /audio/');
  }

  const validLanguages = ['German', 'Spanish', 'French', 'English', 'Italian'];
  if (!validLanguages.includes(task.language)) {
    console.warn(`Unknown language: ${task.language}`);
  }

  if (task.ipa && task.language === 'German') {
    console.warn('IPA notation not typically needed for German');
  }
}
```

### Auto-Play Eligibility Logic

```typescript
function isEligibleForAutoPlay(task: Task, settings: AudioSettings): boolean {
  // Rule 1: Must have audio
  if (!task.hasAudio || !task.audioUrl) return false;

  // Rule 2: Auto-play must be enabled globally
  if (!settings.autoPlayEnabled) return false;

  // Rule 3: Check language filter
  switch (settings.languageFilter) {
    case 'none':
      return false;
    case 'all languages':
      return true;
    case 'non-German only':
      return task.language !== 'German';
    default:
      return false;
  }

  // Rule 4: Check per-topic override
  const topicId = task.topicId; // Assuming task has topicId
  const override = settings.perTopicOverrides[topicId];
  if (override?.autoPlayEnabled !== undefined) {
    return override.autoPlayEnabled;
  }

  return true;
}
```

### Example Data

```typescript
// Spanish vocabulary task with audio
{
  id: 'spanish-vocab-001',
  type: 'vocabulary',
  question: '¿Cómo estás?',
  answer: 'How are you?',
  difficulty: 'beginner',
  hasAudio: true,
  audioUrl: '/audio/spanish/como-estas.mp3',
  language: 'Spanish',
  ipa: '[ˈko.mo esˈtas]'
}

// Math task without audio
{
  id: 'math-basics-001',
  type: 'arithmetic',
  question: 'Was ist 5 + 3?',
  answer: '8',
  difficulty: 'beginner',
  hasAudio: false,
  audioUrl: null,
  language: 'German',
  ipa: null
}
```

---

## Relationships

### AudioSettings ↔ AudioPlayback
- **Cardinality**: 1:1 (one settings object per user, one playback state per session)
- **Direction**: AudioSettings influences AudioPlayback behavior
- **Example**: If `audioSettings.autoPlayEnabled === false`, AudioPlayback won't auto-play

### AudioPlayback ↔ Task
- **Cardinality**: 1:1 (one playback state per current task)
- **Direction**: Task provides `audioUrl` to AudioPlayback
- **Example**: When `task.audioUrl` changes (new question), AudioPlayback loads new audio

### Task ↔ AudioSettings
- **Cardinality**: Many:1 (many tasks share one settings object)
- **Direction**: Task language/audio fields determine if auto-play happens based on AudioSettings
- **Example**: Spanish task + `languageFilter: 'non-German only'` → auto-play enabled

---

## Indexes (for IndexedDB)

### Task Index for Audio Queries

```typescript
// In IndexedDB schema
db.tasks.createIndex('hasAudio', 'hasAudio');
db.tasks.createIndex('language', 'language');

// Fast query for all Spanish tasks with audio
const spanishAudioTasks = await db.tasks
  .where('language').equals('Spanish')
  .and(task => task.hasAudio === true)
  .toArray();
```

---

## Data Migrations

### Version 1 → Version 2 (Future Example)

```typescript
function migrateAudioSettings_v1_to_v2(v1: AudioSettingsV1): AudioSettingsV2 {
  return {
    ...v1,
    version: 2,
    // New field in v2: playbackSpeed
    playbackSpeed: 1.0,
  };
}
```

### Task Schema Migration (Adding Audio Fields)

```typescript
async function migrateTaskSchema_addAudio(db: Dexie): Promise<void> {
  const tasks = await db.tasks.toArray();

  for (const task of tasks) {
    if (!task.hasOwnProperty('hasAudio')) {
      await db.tasks.update(task.id, {
        hasAudio: false,
        audioUrl: null,
        language: 'German',
        ipa: null,
      });
    }
  }
}
```

---

## Invariants

### AudioSettings Invariants
1. `autoPlayEnabled` and `accessibilityMode` are always booleans (never null/undefined)
2. `languageFilter` is always one of the three allowed values
3. `perTopicOverrides` keys are valid topic IDs
4. `version` is always a positive integer

### AudioPlayback Invariants
1. `currentTime` never exceeds `duration`
2. `status === 'error'` implies `error !== null`
3. `status === 'playing'` implies `audioUrl !== null`
4. `currentTime` and `duration` are always non-negative finite numbers

### Task Invariants
1. `hasAudio === true` implies `audioUrl !== null`
2. `audioUrl !== null` implies it starts with `/audio/`
3. `language` is always a non-empty string
4. `ipa` is only meaningful when `hasAudio === true`

---

## Performance Considerations

### LocalStorage Size
- AudioSettings: ~100-200 bytes per user
- Max size: ~5MB (LocalStorage limit)
- Estimated capacity: 25,000+ users' settings (far exceeds single-user need)

### IndexedDB Size
- Task with audio metadata: +50 bytes per task
- 1000 tasks × 50 bytes = ~50KB overhead
- Negligible impact on existing storage

### Memory Usage
- AudioPlayback: ~200 bytes per active session
- HTMLAudioElement: ~1MB per loaded audio file (browser memory)
- Preloaded audio: 2× memory (current + next) = ~2MB total

---

## Summary

| Entity | Storage | Persistence | Size | Primary Use |
|--------|---------|-------------|------|-------------|
| **AudioSettings** | LocalStorage | Permanent | ~100 bytes | User preferences |
| **AudioPlayback** | React State | Session only | ~200 bytes | Playback control |
| **Task (extended)** | IndexedDB | Permanent | +50 bytes | Audio metadata |

**Key Relationships**:
- AudioSettings controls auto-play behavior for all tasks
- AudioPlayback manages current playback state for one task
- Task provides audio URL and language for auto-play eligibility

**Next Steps**: Proceed to contracts/ generation (service interfaces)
