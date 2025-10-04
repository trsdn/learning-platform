# Audio Feature Contracts

This directory contains TypeScript interface contracts for the auto-play audio feature. These contracts define the public APIs that must be implemented in Phase 3.

## Contracts Overview

### 1. `audio-service.contract.ts`
**Purpose**: Core audio playback service interface

**Key Methods**:
- `loadAudio()` - Load and optionally auto-play audio for a task
- `play()`, `pause()`, `stop()`, `replay()` - Playback controls
- `togglePlayPause()` - Toggle between play/pause
- `preloadNext()` - Preload next question's audio
- `checkAutoPlayPermission()` - Test browser auto-play policy
- `unlockAutoPlay()` - Unlock auto-play after user interaction
- `getPlaybackState()` - Get current playback state
- `onStateChange()` - Subscribe to state updates
- `dispose()` - Cleanup resources

**Implementation Location**: `src/modules/core/services/audio-service.ts`

### 2. `audio-settings-storage.contract.ts`
**Purpose**: Audio settings persistence interface

**Key Methods**:
- `load()` - Load settings from LocalStorage
- `save()` - Save settings to LocalStorage
- `update()` - Update specific fields
- `reset()` - Reset to defaults
- `exists()` - Check if settings exist
- `migrate()` - Handle schema migrations

**Implementation Location**: `src/modules/storage/adapters/audio-settings-storage.ts`

## Contract Testing

Each contract will have a corresponding test file that validates the implementation:

```
tests/unit/core/audio-service.test.ts        → Tests IAudioService
tests/unit/storage/audio-settings-storage.test.ts → Tests IAudioSettingsStorage
```

## Contract Tests (TDD - Write Tests First)

Tests should be written **before** implementation to ensure contract compliance:

```typescript
// Example: audio-service.test.ts
describe('AudioService (Contract)', () => {
  let service: IAudioService;

  beforeEach(() => {
    service = createAudioService();
  });

  it('should implement IAudioService interface', () => {
    expect(service.initialize).toBeDefined();
    expect(service.loadAudio).toBeDefined();
    expect(service.play).toBeDefined();
    // ... test all methods exist
  });

  it('should throw error if play() called before loadAudio()', async () => {
    await expect(service.play()).rejects.toThrow('No audio loaded');
  });

  it('should auto-play after 500ms delay when autoPlay=true', async () => {
    const task = createMockTask({ hasAudio: true, language: 'Spanish' });
    const settings = { autoPlayEnabled: true, languageFilter: 'non-German only' };

    const start = Date.now();
    await service.loadAudio(task, settings, true);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(500);
    expect(service.getPlaybackState().status).toBe('playing');
  });

  // ... more contract tests
});
```

## Usage in Implementation

```typescript
// src/modules/core/services/audio-service.ts
import type { IAudioService } from '../../../specs/005-issue-23/contracts/audio-service.contract';

export class AudioService implements IAudioService {
  async initialize(): Promise<void> {
    // Implementation here
  }

  async loadAudio(task: Task, settings: AudioSettings, autoPlay: boolean): Promise<void> {
    // Implementation here
  }

  // ... implement all interface methods
}
```

## Contract Validation

Run contract tests to ensure implementations satisfy the interface:

```bash
npm test -- audio-service.test.ts
npm test -- audio-settings-storage.test.ts
```

All tests must pass before proceeding to integration testing.

## Next Steps

1. **Phase 2 (/tasks)**: Generate tasks.md with contract test tasks
2. **Phase 3 (Implementation)**:
   - Write contract tests (failing)
   - Implement services to satisfy contracts
   - Verify all contract tests pass
3. **Phase 4 (Integration)**: Test services together in quickstart scenarios
