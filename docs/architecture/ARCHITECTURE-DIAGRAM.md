# Practice Session Architecture Diagram

## 📊 Complete System Architecture (After Phase 4)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           PracticeSessionContainer (Main Orchestrator)     │ │
│  │                        (424 lines)                         │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  State Management                                    │ │ │
│  │  │  - useSessionManagement (session lifecycle)          │ │ │
│  │  │  - useMultipleChoice, useTrueFalse, etc. (10 hooks) │ │ │
│  │  │  - Audio config & playback                           │ │ │
│  │  │  - Keyboard shortcuts                                │ │ │
│  │  │  - UI state (hints, dialogs)                         │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │ SessionHeader│  │ TaskRenderer │  │ FeedbackDisplay│  │ │
│  │  │              │  │              │  │                │   │ │
│  │  │ - Title      │  │ - Dynamic    │  │ - Success/Error│  │ │
│  │  │ - Counter    │  │   Loading    │  │ - Explanation  │   │ │
│  │  │ - Progress   │  │ - Suspense   │  │ - Audio        │   │ │
│  │  │ - Cancel     │  │ - 10 Tasks   │  │                │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐                      │ │
│  │  │Navigation    │  │ SessionStats │                      │ │
│  │  │Controls      │  │              │                      │ │
│  │  │              │  │ - Answered   │                      │ │
│  │  │ - Submit     │  │ - Correct    │                      │ │
│  │  │ - Skip       │  │ - Accuracy   │                      │ │
│  │  │ - Next       │  │              │                      │ │
│  │  └──────────────┘  └──────────────┘                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                    TaskRenderer (Dynamic Loader)                │
│                                                                  │
│     ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│     │Multiple│  │True    │  │Text    │  │Slider  │  │Multiple││
│     │Choice  │  │False   │  │Input   │  │        │  │Select  ││
│     │        │  │        │  │        │  │        │  │        ││
│     │ Hook + │  │ Hook + │  │ Hook + │  │ Hook + │  │ Hook + ││
│     │Component  │Component  │Component  │Component  │Component││
│     └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
│                                                                  │
│     ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│     │Word    │  │Flash   │  │Cloze   │  │Ordering│  │Matching││
│     │Scramble│  │card    │  │Deletion│  │        │  │        ││
│     │        │  │        │  │        │  │        │  │        ││
│     │ Hook + │  │ Hook + │  │ Hook + │  │ Hook + │  │ Hook + ││
│     │Component  │Component  │Component  │Component  │Component││
│     └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
│                                                                  │
│               Lazy Loading with Code Splitting                  │
└──────────────────────────────────────────────────────────────────┘

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                 Session Management Layer                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         use-session-management.ts (240 lines)              │ │
│  │                                                            │ │
│  │  - initializeSession()                                     │ │
│  │  - loadCurrentTask()                                       │ │
│  │  - submitAnswer(correct: boolean)                          │ │
│  │  - nextTask()                                              │ │
│  │  - completeSession()                                       │ │
│  │                                                            │ │
│  │  State:                                                    │ │
│  │  - session, currentTask, currentTaskIndex                 │ │
│  │  - isLoading, showFeedback, isCorrect                     │ │
│  │  - progress calculation                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Practice      │  │Spaced        │  │Task          │         │
│  │Session       │  │Repetition    │  │Repository    │         │
│  │Service       │  │Service       │                 │         │
│  │              │  │              │                 │         │
│  │- recordAnswer│  │- recordAnswer│  │- getById()   │         │
│  │- complete    │  │- calculate   │                 │         │
│  │  Session     │  │  intervals   │                 │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────────────────────────────────────────┘

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                     Database Layer (Supabase)                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │practice_     │  │spaced_       │  │tasks         │         │
│  │sessions      │  │repetition    │                 │         │
│  │              │  │              │                 │         │
│  │- id          │  │- task_id     │  │- id          │         │
│  │- status      │  │- next_review │  │- type        │         │
│  │- task_ids    │  │- interval    │  │- content     │         │
│  │- completed   │  │- ease_factor │  │- metadata    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. Session Initialization
```
User clicks "Start Practice"
    ↓
PracticeSessionContainer mounts
    ↓
useSessionManagement.initializeSession()
    ↓
Load session from Supabase
    ↓
useSessionManagement.loadCurrentTask()
    ↓
TaskRenderer dynamically loads task component
    ↓
Task component renders with its hook
```

### 2. Answer Submission
```
User submits answer
    ↓
Task hook validates answer (checkAnswer())
    ↓
PracticeSessionContainer.handleSubmit()
    ↓
useSessionManagement.submitAnswer(correct)
    ↓
PracticeSessionService.recordSessionAnswer()
    ↓
SpacedRepetitionService.recordAnswer()
    ↓
Update Supabase database
    ↓
Show FeedbackDisplay
```

### 3. Navigation
```
User clicks "Next Task"
    ↓
useSessionManagement.nextTask()
    ↓
Increment currentTaskIndex OR completeSession()
    ↓
useSessionManagement.loadCurrentTask()
    ↓
TaskRenderer loads next task component
    ↓
Reset task state, start timer
```

## 📦 Module Structure

```
src/modules/ui/components/practice/
│
├── index.ts                          # Barrel exports
├── types.ts                          # Shared type definitions
│
├── PracticeSessionContainer.tsx      # Main orchestrator (424 lines)
├── TaskRenderer.tsx                  # Dynamic task loader (147 lines)
│
├── session/                          # Session management (5 files)
│   ├── index.ts
│   ├── use-session-management.ts     # Session lifecycle hook (240 lines)
│   ├── SessionHeader.tsx             # Header component (63 lines)
│   ├── NavigationControls.tsx        # Navigation buttons (75 lines)
│   ├── FeedbackDisplay.tsx           # Feedback display (60 lines)
│   └── SessionStats.tsx              # Statistics display (55 lines)
│
└── tasks/                            # Task types (40+ files)
    ├── index.ts                      # Barrel exports
    │
    ├── MultipleChoice/
    │   ├── index.ts
    │   ├── use-multiple-choice.ts    # Logic hook
    │   └── MultipleChoiceTask.tsx    # UI component
    │
    ├── TrueFalse/
    │   ├── index.ts
    │   ├── use-true-false.ts
    │   └── TrueFalseTask.tsx
    │
    ├── TextInput/
    │   ├── index.ts
    │   ├── use-text-input.ts
    │   └── TextInputTask.tsx
    │
    ├── Slider/
    │   ├── index.ts
    │   ├── use-slider.ts
    │   └── SliderTask.tsx
    │
    ├── MultipleSelect/
    │   ├── index.ts
    │   ├── use-multiple-select.ts
    │   └── MultipleSelectTask.tsx
    │
    ├── WordScramble/
    │   ├── index.ts
    │   ├── use-word-scramble.ts
    │   └── WordScrambleTask.tsx
    │
    ├── Flashcard/
    │   ├── index.ts
    │   ├── use-flashcard.ts
    │   └── FlashcardTask.tsx
    │
    ├── ClozeDeletion/
    │   ├── index.ts
    │   ├── use-cloze-deletion.ts
    │   └── ClozeDeletionTask.tsx
    │
    ├── Ordering/
    │   ├── index.ts
    │   ├── use-ordering.ts
    │   └── OrderingTask.tsx
    │
    └── Matching/
        ├── index.ts
        ├── use-matching.ts
        └── MatchingTask.tsx
```

## 🎯 Key Design Patterns

### 1. Container/Presentational Pattern
- **Container**: `PracticeSessionContainer` (logic)
- **Presentational**: Session & Task components (UI)

### 2. Hook Pattern
- Custom hooks for reusable logic
- Separation of concerns (logic vs UI)
- Easy to test in isolation

### 3. Lazy Loading Pattern
- Dynamic imports in `TaskRenderer`
- Code splitting for performance
- Suspense boundaries for loading

### 4. Composition Pattern
- Small, focused components
- Compose to build complex UIs
- Easy to understand and maintain

### 5. Factory Pattern (Tests)
- Test factories for mock data
- Consistent test setup
- Reusable across tests

## 📊 Component Responsibilities

| Component | Responsibility | LOC |
|-----------|----------------|-----|
| PracticeSessionContainer | Orchestrate entire session | 424 |
| TaskRenderer | Dynamic task loading | 147 |
| use-session-management | Session lifecycle | 240 |
| SessionHeader | Display header & progress | 63 |
| NavigationControls | Handle navigation | 75 |
| FeedbackDisplay | Show feedback | 60 |
| SessionStats | Display statistics | 55 |
| Task Hooks (10) | Task-specific logic | 70-135 |
| Task Components (10) | Task-specific UI | 90-170 |

## 🚀 Performance Optimizations

### Code Splitting
```
Initial Bundle:
- PracticeSessionContainer
- TaskRenderer
- Session components

On Demand:
- MultipleChoiceTask (only when needed)
- TrueFalseTask (only when needed)
- ... (all other task types)
```

### Lazy Loading
```javascript
const MultipleChoiceTask = lazy(() =>
  import('./tasks/MultipleChoice')
);
// Not loaded until required!
```

### Memoization Opportunities
- Task validation functions
- Audio configuration
- Computed statistics
- Keyboard shortcut handlers

## ✅ Quality Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total Files | 60+ | ✅ |
| Total Lines | ~6,500 | ✅ |
| Avg File Size | ~100 lines | ✅ |
| Max File Size | 424 lines | ✅ |
| Test Files | 10+ | ✅ |
| Unit Tests | 184 (tasks) + 317 (other) | ✅ |
| Test Pass Rate | 100% | ✅ |
| Type Coverage | 100% | ✅ |

---

**This architecture provides**:
- ✅ Clear separation of concerns
- ✅ Easy to test and maintain
- ✅ Scalable and extensible
- ✅ Performance optimized
- ✅ Type-safe
- ✅ Well-documented
