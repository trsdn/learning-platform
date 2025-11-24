# Implementation Plan: Issue #82 - Refactor practice-session.tsx (UPDATED FOR ACTUAL CODEBASE)

## Issue Summary
- **Issue**: #82
- **Title**: Refactor: Reorganize components directory and split practice-session.tsx
- **Branch**: `refactor/issue-82-split-practice-session`
- **Type**: Refactoring
- **Priority**: High (Critical)
- **Complexity**: Very Large
- **Estimated Effort**: 24-40 hours (3-5 days)

## Current State Analysis

### Actual File Location & Size
```
File: src/modules/ui/components/practice-session.tsx
Lines: 1,761
Size: 68KB
Architecture: Modules-based (@core, @storage, @ui aliases)
```

### Component Type
This is a **language learning platform** practice session component, NOT a simple quiz component. It supports:

**10 Different Task Types**:
1. Multiple Choice
2. Cloze Deletion (fill-in-the-blank)
3. True/False
4. Ordering (drag and drop)
5. Matching (pairs)
6. Multiple Select (checkboxes)
7. Slider (range input)
8. Word Scramble
9. Flashcard
10. Text Input

### State Management Complexity
**77+ state variables** including:
- Session state (session, currentTask, currentTaskIndex)
- Answer state (per task type - 10 different sets)
- Audio playback state (via hooks)
- Keyboard/accessibility state
- UI state (feedback, hints, shortcuts)

### Key Dependencies
```typescript
// Core services
import { PracticeSessionService } from '@core/services/practice-session-service';
import { SpacedRepetitionService } from '@core/services/spaced-repetition-service';

// Repositories
import {
  getPracticeSessionRepository,
  getTaskRepository,
  getSpacedRepetitionRepository,
} from '@storage/factory';

// Custom hooks
import { useAudioPlayback } from '../hooks/use-audio-playback';
import { useAudioSettings } from '../hooks/use-audio-settings';

// Components
import { AudioButton } from './audio-button';
import { FeedbackCard } from './common/FeedbackCard';
import { Input, Checkbox, Select, Slider } from './forms';
```

### Current Structure Analysis

**Lines 1-100**: Imports & State Declarations
- Complex type imports
- 10+ separate state groups (one per task type)
- Audio hooks initialization

**Lines 100-270**: Business Logic Functions
- `repeatQuestionAudio()` - Audio replay
- `canSubmit()` - Validation logic for all 10 task types
- `handleAnswerSubmit()` - Answer checking for all 10 task types (100+ lines!)
- `handleComplete()` - Session completion
- `handleNextTask()` - Navigation

**Lines 270-550**: Effects & Event Handlers
- Session initialization effects
- Task loading effects
- Cursor management effects
- **Massive keyboard handler** (280+ lines!)
- Audio control effects

**Lines 550-1380**: Render Functions (Task-Specific UI)
- `renderMultipleChoice()` - ~80 lines
- `renderClozeDeletion()` - ~90 lines
- `renderTrueFalse()` - ~60 lines
- `renderOrdering()` - ~100 lines (drag & drop!)
- `renderMatching()` - ~120 lines (complex matching UI)
- `renderMultipleSelect()` - ~80 lines
- `renderSlider()` - ~70 lines
- `renderWordScramble()` - ~80 lines
- `renderFlashcard()` - ~90 lines
- `renderTextInput()` - ~80 lines

**Lines 1380-1550**: Helper Functions
- `initializeSession()` - 30 lines
- `loadCurrentTask()` - 170+ lines (handles all task type initialization!)

**Lines 1550-1761**: Main Render & JSX
- Progress bar
- Task renderer (switches between 10 task types)
- Navigation controls
- Feedback display
- Keyboard shortcut help modal

## Critical Problems

### 1. **Massive Cyclomatic Complexity**
- `handleAnswerSubmit()`: 10 different code paths (one per task type)
- `canSubmit()`: 10 different validation logics
- `loadCurrentTask()`: 10 different initialization routines
- Keyboard handler: 50+ conditional branches

### 2. **Tight Coupling**
- All task types in one file
- State management mixed with UI rendering
- Business logic mixed with presentation

### 3. **Testing Nightmare**
- Cannot test task types in isolation
- Need to mock entire session flow for simple UI tests
- 1,761 lines = impossible to achieve good test coverage

### 4. **Performance Issues**
- All task type code loaded even if only using one type
- No code splitting
- Large bundle chunk (68KB for one component!)

### 5. **Maintenance Hell**
- Adding/modifying task type affects entire file
- High risk of regression bugs
- Merge conflicts likely

## Proposed Solution

### Architecture Strategy: **Feature Slicing + Compound Components**

Instead of just splitting by UI concerns, we'll split by **task type features**:

```
src/modules/ui/components/practice/
├── PracticeSessionContainer.tsx          # Main orchestrator (~200 lines)
├── types.ts                              # Shared types
├── hooks/
│   ├── use-session-management.ts         # Session CRUD
│   ├── use-task-navigation.ts            # Next/prev/complete
│   ├── use-keyboard-shortcuts.ts         # Keyboard handling
│   └── use-answer-submission.ts          # Answer validation & submission
├── session/
│   ├── SessionHeader.tsx                 # Progress, audio controls
│   ├── SessionProgress.tsx               # Progress bar
│   ├── NavigationControls.tsx            # Next/prev buttons
│   └── FeedbackDisplay.tsx               # Correct/incorrect feedback
├── tasks/
│   ├── TaskRenderer.tsx                  # Task type switcher
│   ├── MultipleChoice/
│   │   ├── MultipleChoiceTask.tsx        # Main component
│   │   ├── MultipleChoiceOption.tsx      # Single option
│   │   └── use-multiple-choice.ts        # State & logic
│   ├── ClozeDeletion/
│   │   ├── ClozeDeletionTask.tsx
│   │   ├── ClozeDeletionBlank.tsx
│   │   └── use-cloze-deletion.ts
│   ├── TrueFalse/
│   │   ├── TrueFalseTask.tsx
│   │   └── use-true-false.ts
│   ├── Ordering/
│   │   ├── OrderingTask.tsx
│   │   ├── DraggableItem.tsx
│   │   └── use-ordering.ts
│   ├── Matching/
│   │   ├── MatchingTask.tsx
│   │   ├── MatchingPair.tsx
│   │   └── use-matching.ts
│   ├── MultipleSelect/
│   │   ├── MultipleSelectTask.tsx
│   │   └── use-multiple-select.ts
│   ├── Slider/
│   │   ├── SliderTask.tsx
│   │   └── use-slider.ts
│   ├── WordScramble/
│   │   ├── WordScrambleTask.tsx
│   │   └── use-word-scramble.ts
│   ├── Flashcard/
│   │   ├── FlashcardTask.tsx
│   │   └── use-flashcard.ts
│   └── TextInput/
│       ├── TextInputTask.tsx
│       └── use-text-input.ts
└── keyboard/
    ├── KeyboardShortcutHelp.tsx          # Help modal
    └── use-task-keyboard.ts              # Per-task keyboard logic
```

### Design Principles

**1. Task Type Encapsulation**
Each task type becomes a self-contained module:
- Own component (UI)
- Own hook (state + logic)
- Own validation logic
- Own keyboard shortcuts

**2. Separation of Concerns**
- **Container**: Session management, navigation, completion
- **Task Components**: Rendering & user input
- **Hooks**: Business logic, state management
- **Services**: Database operations (already separated)

**3. Code Splitting**
- Lazy load task type components
- Only load what's needed for current session
- Reduce initial bundle size from 68KB to ~15KB

**4. Testability**
- Unit test each task type independently
- Mock minimal surface area (just task data)
- Integration test session flow with one task type
- E2E test critical paths

## Implementation Phases

### Phase 1: Setup & Foundation (4-6 hours)

#### Tasks:
1. **Create new directory structure**
   ```bash
   mkdir -p src/modules/ui/components/practice/{hooks,session,tasks,keyboard}
   mkdir -p src/modules/ui/components/practice/tasks/{MultipleChoice,ClozeDeletion,TrueFalse,Ordering,Matching,MultipleSelect,Slider,WordScramble,Flashcard,TextInput}
   ```

2. **Create shared types file**
   - Extract all interfaces to `types.ts`
   - Export task content types
   - Export answer validation types

3. **Set up test infrastructure**
   - Create test factories for all 10 task types
   - Set up mock repositories
   - Create test utilities for rendering with context

4. **Create baseline integration test**
   - Test current component behavior (one task type)
   - Establish safety net before refactoring

### Phase 2: Extract Task Components (16-24 hours)

**Strategy**: Extract one task type at a time, test, verify.

#### Task Type Extraction Order:
1. **MultipleChoice** (simplest - good starting point)
2. **TrueFalse** (second simplest)
3. **TextInput** (simple text validation)
4. **Slider** (simple range input)
5. **MultipleSelect** (similar to MultipleChoice)
6. **ClozeDeletion** (moderate - multiple inputs)
7. **WordScramble** (moderate - text manipulation)
8. **Flashcard** (moderate - two-phase interaction)
9. **Ordering** (complex - drag & drop)
10. **Matching** (most complex - pairing logic)

#### Per Task Type (2-3 hours each):

**Step 1: Create Hook** (30 min)
```typescript
// Example: use-multiple-choice.ts
export function useMultipleChoice(task: Task) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Initialize on mount
  useEffect(() => {
    // Shuffle logic
  }, [task]);

  // Validation
  const canSubmit = () => selectedAnswer !== null;

  // Check answer
  const checkAnswer = () => {
    return selectedAnswer === correctAnswerIndex;
  };

  return {
    selectedAnswer,
    setSelectedAnswer,
    shuffledOptions,
    canSubmit,
    checkAnswer,
  };
}
```

**Step 2: Create Component** (45 min)
```typescript
// Example: MultipleChoiceTask.tsx
export function MultipleChoiceTask({ task, onSubmit }: Props) {
  const {
    selectedAnswer,
    setSelectedAnswer,
    shuffledOptions,
    canSubmit,
    checkAnswer,
  } = useMultipleChoice(task);

  const handleSubmit = () => {
    const correct = checkAnswer();
    onSubmit(correct);
  };

  return (
    <div>
      {shuffledOptions.map((option, index) => (
        <MultipleChoiceOption
          key={index}
          option={option}
          index={index}
          selected={selectedAnswer === index}
          onSelect={() => setSelectedAnswer(index)}
        />
      ))}
    </div>
  );
}
```

**Step 3: Write Tests** (45 min)
- Unit test hook logic
- Unit test component rendering
- Test answer validation
- Test edge cases

**Step 4: Integration Test** (30 min)
- Test in isolation with mock task data
- Verify keyboard shortcuts
- Verify audio integration

### Phase 3: Extract Session Management (4-6 hours)

#### Extract Hooks:

**use-session-management.ts** (2 hours)
- Initialize session
- Load tasks
- Persist progress
- Tests

**use-task-navigation.ts** (1.5 hours)
- Next/previous logic
- Completion logic
- Progress calculation
- Tests

**use-answer-submission.ts** (1.5 hours)
- Record answer
- Update spaced repetition
- Calculate time spent
- Tests

**use-keyboard-shortcuts.ts** (1 hour)
- Global shortcuts (Escape, ?)
- Tests

### Phase 4: Extract UI Components (3-4 hours)

**SessionHeader.tsx** (45 min)
- Progress bar
- Audio controls
- Timer (if needed)

**NavigationControls.tsx** (45 min)
- Next/previous buttons
- Submit button
- Disabled states

**FeedbackDisplay.tsx** (1 hour)
- Correct/incorrect indicator
- Explanation text
- Correct answer reveal

**KeyboardShortcutHelp.tsx** (45 min)
- Modal with keyboard shortcuts
- Per-task type shortcuts

### Phase 5: Create Container & TaskRenderer (3-4 hours)

**TaskRenderer.tsx** (1.5 hours)
- Dynamic import task components
- Code splitting configuration
- Loading states
- Tests

**PracticeSessionContainer.tsx** (2 hours)
- Compose all hooks
- Compose session UI components
- Pass props to TaskRenderer
- Handle callbacks
- Tests

### Phase 6: Integration & Migration (2-3 hours)

1. **Update imports in pages** (30 min)
   - Find files importing old component
   - Update to new container

2. **Delete old file** (5 min)
   - Remove practice-session.tsx
   - Remove practice-session.module.css (if separate)

3. **Run full test suite** (1 hour)
   - All unit tests
   - All integration tests
   - Manual smoke test

4. **Performance testing** (30 min)
   - Check bundle sizes
   - Verify code splitting works
   - Test lazy loading

5. **Fix issues** (1 hour buffer)

### Phase 7: Documentation (2 hours)

1. **Update README**
   - New component structure
   - How to add new task types

2. **Create ARCHITECTURE.md**
   - Component hierarchy
   - Data flow diagrams
   - Task type patterns

3. **Inline documentation**
   - JSDoc comments
   - Usage examples

## Testing Strategy

### Unit Tests (60+ tests)
- 10 task type hooks (6 tests each = 60)
- 10 task type components (5 tests each = 50)
- Session management hooks (10 tests)
- UI components (20 tests)
- **Total**: ~140 unit tests

### Integration Tests (12 tests)
- Session initialization
- Each task type in session context
- Navigation flow
- Keyboard shortcuts

### E2E Tests (3 tests)
- Complete session (multiple task types)
- Session with all correct answers
- Session with interruption

## Risk Mitigation

### High-Risk Areas
1. **Keyboard shortcuts** - Complex logic, many edge cases
   - Mitigation: Extract early, test thoroughly

2. **Audio playback** - Timing issues, state synchronization
   - Mitigation: Keep existing hooks, minimal changes

3. **Drag & drop (Ordering)** - Complex DOM manipulation
   - Mitigation: Extract last, consider library (react-beautiful-dnd)

4. **State management** - Easy to break existing flows
   - Mitigation: Integration tests before refactoring

### Rollback Strategy
- Keep old file until fully tested
- Feature flag for new component
- Gradual rollout by task type

## Success Criteria

### Code Quality
- [ ] No file > 300 lines
- [ ] Each task type isolated
- [ ] Test coverage > 80%
- [ ] All ESLint rules passing

### Performance
- [ ] Initial bundle < 20KB (down from 68KB)
- [ ] Task types lazy loaded
- [ ] No performance regression in session

### Functionality
- [ ] All 10 task types working
- [ ] Keyboard shortcuts working
- [ ] Audio playback working
- [ ] Spaced repetition recording working
- [ ] No bugs in production

### Maintainability
- [ ] Adding new task type takes < 2 hours
- [ ] Clear documentation
- [ ] Easy to test changes
- [ ] Reduced merge conflicts

## Timeline Estimate

**Optimistic**: 24 hours (3 days)
**Realistic**: 32 hours (4 days)
**Pessimistic**: 40 hours (5 days)

### Daily Breakdown

**Day 1** (8 hours):
- Phase 1: Setup & Foundation (4 hours)
- Phase 2: Extract 2 task types (MultipleChoice, TrueFalse) (4 hours)

**Day 2** (8 hours):
- Phase 2: Extract 4 task types (TextInput, Slider, MultipleSelect, ClozeDeletion) (8 hours)

**Day 3** (8 hours):
- Phase 2: Extract 4 task types (WordScramble, Flashcard, Ordering, Matching) (8 hours)

**Day 4** (8 hours):
- Phase 3: Extract session management (5 hours)
- Phase 4: Extract UI components (3 hours)

**Day 5** (8 hours):
- Phase 5: Container & TaskRenderer (4 hours)
- Phase 6: Integration & Migration (3 hours)
- Phase 7: Documentation (1 hour)

## File Size Comparison

### Before Refactoring
| File | Lines | Size |
|------|-------|------|
| practice-session.tsx | 1,761 | 68KB |
| **Total** | **1,761** | **68KB** |

### After Refactoring
| Component Type | Files | Avg Lines | Total Lines |
|----------------|-------|-----------|-------------|
| Container | 1 | 200 | 200 |
| Hooks | 8 | 80 | 640 |
| Session UI | 4 | 60 | 240 |
| Task Components | 20 | 80 | 1,600 |
| Task Hooks | 10 | 100 | 1,000 |
| Keyboard | 2 | 100 | 200 |
| Types | 1 | 150 | 150 |
| **Total** | **46** | **~90** | **~4,030** |

**Notes**:
- Total lines increased due to better separation
- Average file size: ~90 lines (very maintainable!)
- Largest file will be ~200 lines (container)
- Code duplication reduced through shared hooks
- Better test coverage possible

## Bundle Size Impact

### Current
- Single chunk: 68KB (minified)
- Loaded upfront: All 10 task types

### After Refactoring
- Initial chunk: ~15KB (container + session UI)
- Task chunks: ~5KB each (lazy loaded)
- Typical session loads: 1-3 task types = 20-30KB total

**Savings**: ~40KB initial load reduction!

## Conclusion

This refactoring is **CRITICAL** and **COMPLEX** but will provide:
- ✅ Better maintainability
- ✅ Better testability
- ✅ Better performance (code splitting)
- ✅ Easier feature additions
- ✅ Reduced bug risk

The investment of 3-5 days will pay off in:
- Faster future development
- Fewer bugs
- Better developer experience
- Better user experience (faster loads)
