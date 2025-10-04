# Research: Auto-Play Audio for Language Learning Tasks

**Feature**: Auto-Play Audio for Language Learning Tasks
**Branch**: 005-issue-23
**Date**: 2025-10-04

## Overview
This document contains technical research and decision rationale for implementing automatic audio playback in the learning platform. All clarifications from the spec have been resolved through the /clarify workflow.

---

## 1. Browser Auto-Play Policy Handling

### Decision
Use a two-phase approach: (1) Attempt auto-play on question load, (2) If blocked, show one-time notification requesting user interaction, then enable auto-play after first click.

### Rationale
- Modern browsers (Chrome 66+, Safari 11+, Firefox 66+) block auto-play without user interaction
- `HTMLMediaElement.play()` returns a Promise that rejects if blocked
- User gesture requirement can be satisfied with any click/tap/keyboard interaction
- Once unlocked, auto-play works for the remainder of the session

### Implementation Pattern
```typescript
async function attemptAutoPlay(audio: HTMLAudioElement): Promise<boolean> {
  try {
    await audio.play();
    return true; // Auto-play succeeded
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      // Show one-time notification, wait for user interaction
      return false; // Auto-play blocked
    }
    throw err; // Other error (network, format, etc.)
  }
}
```

### Alternatives Considered
- **Always require manual play**: Rejected - defeats the purpose of auto-play feature
- **Mute first, then unmute after interaction**: Rejected - doesn't work in Safari, poor UX
- **Background audio context trick**: Rejected - violates browser policies, inconsistent behavior

### References
- [Chrome Auto-Play Policy](https://developer.chrome.com/blog/autoplay/)
- [MDN: HTMLMediaElement.play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)
- [Web Audio API Best Practices](https://web.dev/webaudio-intro/)

---

## 2. Audio Preloading Strategy

### Decision
Preload only the next question's audio file using `<audio preload="auto">` attribute. Load current question's audio immediately.

### Rationale
- From spec clarification: "Next question only - Preload just the next question's audio"
- Balances performance (minimal delay) with bandwidth conservation
- Most users complete questions sequentially, so next-question prediction is highly accurate
- Average audio file size: 50-100KB per pronunciation clip
- Preloading 1 file = ~100KB, acceptable overhead

### Implementation Pattern
```typescript
interface AudioPreloader {
  currentAudio: HTMLAudioElement;  // Playing now
  nextAudio: HTMLAudioElement | null;  // Preloaded, ready to play

  preloadNext(url: string): void {
    this.nextAudio = new Audio(url);
    this.nextAudio.preload = 'auto';
  }

  moveToNext(): void {
    this.currentAudio = this.nextAudio || new Audio();
    this.nextAudio = null;
  }
}
```

### Alternatives Considered
- **Batch preload multiple questions**: Rejected per spec clarification - wastes bandwidth, may preload unused audio
- **No preloading (on-demand only)**: Rejected - causes 1-2s delay on slow connections, poor UX
- **Preload entire session**: Rejected - wastes bandwidth for incomplete sessions, slow initial load

### Performance Metrics
- Target: <1s load time for preloaded audio
- Fallback: 5s timeout before showing manual play button
- Loading indicator: Show after 1s if audio not ready

### References
- [MDN: HTMLMediaElement.preload](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preload)
- [Preloading Audio for Better UX](https://web.dev/fast/#preload-critical-assets)

---

## 3. Language-Based Content Filtering

### Decision
Use a language property on the Task entity to determine auto-play eligibility. Auto-play only when `task.language !== 'German'`.

### Rationale
- From spec clarification: "Auto-play for non-German content after 500ms delay"
- Task entity already has `language` field (from existing schema)
- Simple boolean check: `if (task.language !== 'German' && task.hasAudio)`
- German questions/answers remain silent (manual play button available)

### Implementation Pattern
```typescript
function shouldAutoPlay(task: Task, settings: AudioSettings): boolean {
  // Check 1: Task has audio
  if (!task.hasAudio || !task.audioUrl) return false;

  // Check 2: Non-German content only
  if (task.language === 'German') return false;

  // Check 3: User settings allow auto-play
  if (!settings.autoPlayEnabled) return false;

  // Check 4: Language filter (default: non-German only)
  if (settings.languageFilter === 'none') return false;

  return true;
}
```

### Edge Cases
- **Answer audio**: When answer is revealed, check `answer.language !== 'German'` before auto-play
- **Mixed-language questions**: Use question language field, not answer language
- **Missing language field**: Default to German (no auto-play) for safety

### Alternatives Considered
- **Whitelist approach (e.g., Spanish, French only)**: Rejected - requires maintenance, breaks when new languages added
- **User-configurable language list**: Rejected - adds complexity, not in spec requirements
- **Auto-detect audio file language from filename**: Rejected - brittle, requires naming convention

---

## 4. Audio Playback Timing & Delays

### Decision
Fixed 500ms delay using `setTimeout` before calling `audio.play()`. No user configuration.

### Rationale
- From spec clarification: "Short delay (500ms) for non-German content only"
- 500ms provides smooth transition without feeling sluggish
- Consistent timing across all difficulty levels
- Simplified UX (no delay slider in settings)

### Implementation Pattern
```typescript
async function autoPlayWithDelay(audio: HTMLAudioElement): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  await audio.play();
}
```

### Timing Considerations
- **Question appear → 500ms → auto-play start**
- **Answer revealed → 500ms → auto-play start**
- **User navigates to next question → current audio stops immediately, new audio queues**

### Alternatives Considered
- **Immediate playback (0ms)**: Rejected - feels jarring, no time to read question
- **User-configurable delay**: Rejected per spec clarification - fixed 500ms only
- **Adaptive delay based on question length**: Rejected - over-engineered, not in requirements

---

## 5. Background Playback (Tab Focus Behavior)

### Decision
Audio continues playing when tab loses focus. No pause on blur, no resume on focus.

### Rationale
- From spec clarification: "Keep playing - Continue playing audio in background"
- HTML5 Audio API plays in background by default (no action needed)
- Supports multitasking (students can read notes while listening)
- Uninterrupted learning experience

### Implementation Pattern
```typescript
// No special handling needed - browser default behavior
// Audio continues playing when:
// - User switches to another tab
// - User switches to another app
// - Browser window is minimized
```

### Alternatives Considered
- **Pause on blur, resume on focus**: Rejected per spec clarification
- **Show notification when tab unfocused**: Rejected - unnecessary distraction
- **Lower volume when unfocused**: Rejected - not in requirements, confusing UX

### Browser Compatibility
- Chrome: ✅ Background audio works
- Firefox: ✅ Background audio works
- Safari: ✅ Background audio works
- Edge: ✅ Background audio works

---

## 6. Keyboard Shortcuts

### Decision
Implement three keyboard shortcuts: Space (pause/resume), R (replay), S (stop). Global event listener at practice-session level.

### Rationale
- From spec FR-008: "Users MUST be able to control audio using keyboard shortcuts"
- Space is standard for media pause/resume (YouTube, Spotify, etc.)
- R for replay is mnemonic and doesn't conflict with common browser shortcuts
- S for stop is clear and doesn't conflict

### Implementation Pattern
```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) return; // Ignore if typing

    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'r':
      case 'R':
        replayAudio();
        break;
      case 's':
      case 'S':
        stopAudio();
        break;
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Accessibility
- Document shortcuts in help modal
- Screen reader announcements for playback state changes
- Visible focus indicators on audio button

### Alternatives Considered
- **Arrow keys for seek**: Rejected - not in requirements, adds complexity
- **Number keys for playback speed**: Rejected per spec (fixed 1x speed only)
- **Ctrl/Cmd modifiers**: Rejected - conflicts with browser shortcuts

---

## 7. Service Worker Audio Caching

### Decision
Use Workbox's `CacheFirst` strategy for audio files. Cache audio on first play, serve from cache on subsequent plays.

### Rationale
- Audio files are static and immutable (safe to cache indefinitely)
- `CacheFirst` minimizes network requests, improves offline experience
- Workbox already integrated in existing PWA setup
- Average session: 10-20 questions, ~1-2MB total audio

### Workbox Configuration
```javascript
// In service-worker.js
registerRoute(
  ({url}) => url.pathname.startsWith('/audio/'),
  new CacheFirst({
    cacheName: 'audio-pronunciations',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200, // ~200 audio files = ~20MB
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);
```

### Alternatives Considered
- **NetworkFirst**: Rejected - unnecessary network requests, slower
- **StaleWhileRevalidate**: Rejected - audio files don't change, wastes bandwidth
- **No caching**: Rejected - violates offline-first PWA principle

### Cache Invalidation
- Audio files use content-hash filenames (e.g., `spanish-hello-a3f2b1.mp3`)
- File updates → new hash → automatic cache bypass
- Old audio expires after 30 days (ExpirationPlugin)

---

## 8. Audio Settings Persistence

### Decision
Store settings in LocalStorage using JSON serialization. Key: `audioSettings`. Load on app init, save on every change.

### Rationale
- LocalStorage is synchronous, fast (<1ms read/write)
- Settings are small (~100 bytes JSON)
- No IndexedDB needed for settings (reserve for larger data)
- Survives browser restart

### Data Schema
```typescript
interface AudioSettingsStorage {
  version: number;  // For future migrations
  autoPlayEnabled: boolean;
  languageFilter: 'non-German only' | 'all languages' | 'none';
  perTopicOverrides: Record<string, Partial<AudioSettingsStorage>>;
  accessibilityMode: boolean;
}
```

### Implementation Pattern
```typescript
class AudioSettingsStore {
  private static KEY = 'audioSettings';

  static load(): AudioSettings {
    const json = localStorage.getItem(this.KEY);
    if (!json) return DEFAULT_SETTINGS;

    const stored = JSON.parse(json);
    return this.migrate(stored); // Handle version changes
  }

  static save(settings: AudioSettings): void {
    const json = JSON.stringify({
      version: CURRENT_VERSION,
      ...settings,
    });
    localStorage.setItem(this.KEY, json);
  }
}
```

### Migration Strategy
- Version 1: Initial schema
- Future versions: Add migration functions (v1→v2, v2→v3, etc.)
- Unknown version: Reset to defaults, preserve user data if possible

---

## 9. Accessibility: IPA Pronunciation Guides

### Decision
Add optional IPA (International Phonetic Alphabet) notation alongside Spanish text when accessibility mode is enabled.

### Rationale
- From spec FR-017: "Alternative learning mode for deaf/hearing-impaired users with visual pronunciation guides (IPA notation)"
- IPA is universal standard for pronunciation representation
- Can be pre-generated and stored with task data (no runtime processing)
- Toggled via accessibility settings

### Implementation Pattern
```typescript
interface Task {
  text: string;  // e.g., "¿Cómo estás?"
  audioUrl?: string;  // e.g., "/audio/spanish/como-estas.mp3"
  ipa?: string;  // e.g., "[ˈko.mo esˈtas]"
}

// In UI component:
{accessibilityMode && task.ipa && (
  <div className={styles.ipa} aria-label="Pronunciation guide">
    IPA: {task.ipa}
  </div>
)}
```

### Content Creation
- IPA notation added to task templates during content authoring
- Spanish: Use [IPA Chart for Spanish](https://en.wikipedia.org/wiki/Help:IPA/Spanish)
- Other languages: Language-specific IPA guides

### Alternatives Considered
- **Text-to-speech synthesis**: Rejected - requires API, not offline-capable, poor quality
- **Phonetic spelling (e.g., "KOH-moh")**: Rejected - not standardized, ambiguous
- **No visual guide**: Rejected - violates accessibility requirement (FR-017)

---

## 10. Error Handling & Fallbacks

### Decision
Multi-level fallback: (1) Retry once on network error, (2) Show manual play button after 5s timeout, (3) Log errors for debugging.

### Rationale
- Transient network errors are common (mobile, spotty WiFi)
- 5s timeout balances user patience with loading time
- Manual button always available as ultimate fallback
- Error logging helps identify broken audio files

### Implementation Pattern
```typescript
async function loadAudioWithFallback(url: string): Promise<AudioState> {
  try {
    // Attempt 1: Normal load
    await loadAudio(url);
    return { status: 'ready', url };
  } catch (err) {
    console.warn(`Audio load failed, retrying: ${url}`, err);

    try {
      // Attempt 2: Retry after 1s
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadAudio(url);
      return { status: 'ready', url };
    } catch (retryErr) {
      console.error(`Audio load failed after retry: ${url}`, retryErr);
      return { status: 'error', url, error: retryErr };
    }
  }
}
```

### Error States
- **Network error**: Retry once, then show manual button
- **404 Not Found**: Log error, show manual button (audio file missing)
- **Format unsupported**: Log error, show manual button (browser compatibility)
- **Auto-play blocked**: Show one-time notification (see #1 above)

### User Feedback
- Loading indicator (spinner) after 1s of loading
- Error message: "Audio unavailable - click to retry"
- Manual play button always visible as fallback

---

## Summary of Technical Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Auto-play policy** | Two-phase: attempt + notification | Handles browser restrictions gracefully |
| **Preloading** | Next question only | Balances performance with bandwidth |
| **Language filter** | Non-German content only | Per spec clarification |
| **Playback delay** | Fixed 500ms | Per spec clarification, simplified UX |
| **Background playback** | Continue when unfocused | Per spec clarification, uninterrupted learning |
| **Keyboard shortcuts** | Space, R, S | Standard media controls, accessibility |
| **Caching** | CacheFirst via Workbox | Offline-first PWA, fast playback |
| **Settings storage** | LocalStorage JSON | Fast, simple, survives restart |
| **Accessibility** | IPA notation when enabled | Visual pronunciation guide (FR-017) |
| **Error handling** | Retry once, 5s timeout, manual fallback | Robust, user-friendly |

---

## Open Questions
None - All clarifications resolved through /clarify workflow.

---

## Next Steps
Proceed to Phase 1: Design & Contracts
- Generate data-model.md (AudioSettings, AudioPlayback, Task entities)
- Generate contracts/ (audio service interface)
- Generate quickstart.md (integration test scenarios)
- Update CLAUDE.md with audio feature context
