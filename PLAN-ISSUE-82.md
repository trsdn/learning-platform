# Implementation Plan: Issue #82 - Refactor: Reorganize components directory and split practice-session.tsx

## Issue Summary
- **Issue**: #82
- **Title**: Refactor: Reorganize components directory and split practice-session.tsx
- **Branch**: `refactor/issue-82-split-practice-session`
- **Type**: Refactoring
- **Priority**: High (Critical)
- **Complexity**: Large
- **Estimated Effort**: 16-24 hours (2-3 days)

## Current State Analysis

### Problem Statement
The `practice-session.tsx` file has grown to **1,653 lines (72KB)**, making it:
- Difficult to maintain and understand
- Hard to test in isolation
- Challenging to review in PRs
- Risk of merge conflicts
- Performance implications (large bundle chunk)

### Current File Metrics
```
File: src/components/practice-session.tsx
Lines: 1,653
Size: 72KB
Responsibilities: 7+ distinct concerns
Dependencies: 13 icons, 9 UI components, 3 custom hooks, 2 external libraries
```

### Key Responsibilities in Current File
1. **Session Orchestration** - State management, lifecycle
2. **Timer Management** - Countdown, warnings, expiration
3. **Question Display** - Rendering questions, code snippets
4. **Answer Input** - MCQ, text, code input handling
5. **Feedback Display** - Correct/incorrect feedback
6. **Progress Tracking** - Progress bar, counters
7. **Navigation** - Previous/next, submit logic
8. **Results Display** - Score, statistics, review
9. **Styling Logic** - Color utilities, formatters

### Dependencies
```typescript
// Hooks
usePracticeSession, useToast, useState, useEffect, useCallback, useMemo

// UI Components
Card, Button, RadioGroup, Label, Textarea, Badge, Progress, Alert

// External Libraries
react-syntax-highlighter, @monaco-editor/react

// Types
PracticeQuestion, DifficultyLevel, SessionResults
```

### Current Test Coverage
- **Tests**: 0 tests for practice-session.tsx
- **Coverage**: 0%
- **Risk**: Very high for regressions

## Proposed Solution

### Architecture Strategy
Transform the monolithic component into a **compound component architecture**:

1. **Container/Presentational Pattern** - Separate logic from UI
2. **Feature-based Organization** - Group related components
3. **Custom Hooks** - Extract reusable logic
4. **Type-Safe Interfaces** - Strong TypeScript contracts
5. **Test-Driven Refactoring** - Ensure no regressions

### New Directory Structure
```
src/components/features/practice/
├── index.ts
├── PracticeSessionContainer.tsx
├── PracticeSessionContainer.test.tsx
├── types.ts
├── QuestionDisplay/
│   ├── index.ts
│   ├── QuestionDisplay.tsx
│   ├── QuestionDisplay.test.tsx
│   ├── QuestionHeader.tsx
│   ├── QuestionHeader.test.tsx
│   ├── MultipleChoiceInput.tsx
│   ├── MultipleChoiceInput.test.tsx
│   ├── TextAnswerInput.tsx
│   ├── TextAnswerInput.test.tsx
│   ├── CodeAnswerInput.tsx
│   ├── CodeAnswerInput.test.tsx
│   ├── QuestionFeedback.tsx
│   └── QuestionFeedback.test.tsx
├── SessionProgress/
│   ├── index.ts
│   ├── SessionProgress.tsx
│   ├── SessionProgress.test.tsx
│   ├── SessionTimer.tsx
│   └── SessionTimer.test.tsx
├── SessionControls/
│   ├── index.ts
│   ├── SessionControls.tsx
│   └── SessionControls.test.tsx
└── SessionResults/
    ├── index.ts
    ├── SessionResults.tsx
    ├── SessionResults.test.tsx
    ├── ScoreOverview.tsx
    ├── StatisticsGrid.tsx
    ├── QuestionReview.tsx
    └── PerformanceInsights.tsx

src/hooks/
├── use-practice-timer.ts
├── use-practice-timer.test.ts
├── use-session-results.ts
└── use-session-results.test.ts

src/lib/
├── practice-utils.ts
└── practice-utils.test.ts
```

### Component Breakdown

#### 1. PracticeSessionContainer (~200 lines)
**Responsibility**: Orchestrate session, manage state
**State**:
- Answer state (selected, text, code)
- Feedback state (show, isCorrect)
- Session state (questions, results, timestamps)

#### 2. QuestionDisplay (~150 lines)
**Responsibility**: Display question and delegate to input type
**Sub-components**:
- QuestionHeader (difficulty, category, timer)
- Code snippet renderer
- Polymorphic input (MCQ/Text/Code)
- Feedback display

#### 3. SessionProgress (~50 lines)
**Responsibility**: Show progress and timer
**Sub-components**:
- Progress bar with percentage
- Question counter
- Session timer

#### 4. SessionControls (~80 lines)
**Responsibility**: Navigation and submission
**Features**:
- Previous/next buttons
- Submit/continue logic
- Disabled state management

#### 5. SessionResults (~300 lines)
**Responsibility**: Display results and insights
**Sub-components**:
- ScoreOverview (performance level)
- StatisticsGrid (correct, incorrect, time)
- QuestionReview (question-by-question)
- PerformanceInsights (achievements, recommendations)

### Custom Hooks

#### usePracticeTimer
**Purpose**: Manage countdown timer
**API**:
```typescript
const { timeRemaining, resetTimer } = usePracticeTimer({
  timeLimit: 60,
  onTimeUp: handleTimeUp,
  enabled: true
});
```

#### useSessionResults
**Purpose**: Calculate session results
**API**:
```typescript
const results = useSessionResults({
  answeredQuestions,
  totalQuestions,
  sessionStartTime,
  difficulty
});
```

### Utility Functions

#### practice-utils.ts
```typescript
formatTime(seconds: number): string
getDifficultyColor(difficulty: DifficultyLevel): string
getTimerColor(timeRemaining: number, timeLimit: number): string
getPerformanceLevel(score: number): PerformanceLevel
```

## Implementation Phases

### Phase 1: Test Foundation (4-6 hours)
**Goal**: Create safety net before refactoring

#### Tasks:
1. Create integration test suite for current behavior
2. Set up test utilities and factories
3. Achieve baseline coverage
4. Document current component API

#### Deliverables:
- [ ] `src/components/__tests__/practice-session.integration.test.tsx`
- [ ] `src/test/test-utils.tsx`
- [ ] `src/test/factories/practice-question-factory.ts`
- [ ] Baseline test coverage report

#### Success Criteria:
- All user flows tested (start → answer → results)
- Timer functionality tested
- All question types tested
- Tests pass with current implementation

---

### Phase 2: Extract Components (8-12 hours)
**Goal**: Split monolith into focused components (TDD)

#### Process (for each component):
1. Write failing unit test
2. Extract component from monolith
3. Make test pass
4. Verify integration test still passes
5. Refactor for clarity

#### Tasks (in order):

**2.1: Extract SessionTimer** (1 hour)
- [ ] Create `SessionTimer.tsx` and test
- [ ] Extract timer display logic
- [ ] Test warning colors, formatting

**2.2: Extract QuestionHeader** (1 hour)
- [ ] Create `QuestionHeader.tsx` and test
- [ ] Extract difficulty badge, category badge
- [ ] Test difficulty color mapping

**2.3: Extract MultipleChoiceInput** (1.5 hours)
- [ ] Create `MultipleChoiceInput.tsx` and test
- [ ] Extract radio group with options
- [ ] Test selection, feedback, disabled states

**2.4: Extract TextAnswerInput** (0.5 hours)
- [ ] Create `TextAnswerInput.tsx` and test
- [ ] Extract textarea component
- [ ] Test value changes, disabled state

**2.5: Extract CodeAnswerInput** (1 hour)
- [ ] Create `CodeAnswerInput.tsx` and test
- [ ] Extract Monaco editor wrapper
- [ ] Test language switching, disabled state

**2.6: Extract QuestionFeedback** (1 hour)
- [ ] Create `QuestionFeedback.tsx` and test
- [ ] Extract feedback alert with explanation
- [ ] Test correct/incorrect states

**2.7: Extract QuestionDisplay** (1.5 hours)
- [ ] Create `QuestionDisplay.tsx` and test
- [ ] Compose all question sub-components
- [ ] Test question type switching
- [ ] Test code snippet rendering

**2.8: Extract SessionProgress** (0.5 hours)
- [ ] Create `SessionProgress.tsx` and test
- [ ] Extract progress bar with counter
- [ ] Test percentage calculation

**2.9: Extract SessionControls** (1 hour)
- [ ] Create `SessionControls.tsx` and test
- [ ] Extract navigation buttons
- [ ] Test disabled states, button text changes

**2.10: Extract Results Components** (2 hours)
- [ ] Create `ScoreOverview.tsx` and test
- [ ] Create `StatisticsGrid.tsx` and test
- [ ] Create `QuestionReview.tsx` and test
- [ ] Create `PerformanceInsights.tsx` and test
- [ ] Create `SessionResults.tsx` (composition) and test

**2.11: Create Container** (1.5 hours)
- [ ] Create `PracticeSessionContainer.tsx` and test
- [ ] Compose all extracted components
- [ ] Migrate state management
- [ ] Test complete user flows

**2.12: Create Index Files** (0.5 hours)
- [ ] Create index.ts for each subdirectory
- [ ] Export public API only
- [ ] Document exports

#### Success Criteria:
- Each component < 300 lines
- Each component has tests (80%+ coverage)
- Integration tests still pass
- No functionality regressions

---

### Phase 3: Extract Hooks & Utils (2-3 hours)
**Goal**: Extract reusable logic

#### Tasks:

**3.1: Extract usePracticeTimer** (1 hour)
- [ ] Create `use-practice-timer.ts` and test
- [ ] Extract countdown logic
- [ ] Test timer lifecycle, callbacks

**3.2: Extract useSessionResults** (0.5 hours)
- [ ] Create `use-session-results.ts` and test
- [ ] Extract results calculation
- [ ] Test score calculations

**3.3: Extract Utilities** (1 hour)
- [ ] Create `practice-utils.ts` and test
- [ ] Extract formatting functions
- [ ] Extract color mapping functions
- [ ] Test all utility functions

#### Success Criteria:
- Hooks are pure and testable
- Utilities have 95%+ coverage
- No business logic in components

---

### Phase 4: Update Imports & Cleanup (1 hour)
**Goal**: Switch to new components, remove old file

#### Tasks:

**4.1: Update Practice Page** (0.25 hours)
- [ ] Update `src/pages/practice.tsx` import
- [ ] Rename component usage to `PracticeSessionContainer`
- [ ] Test page still works

**4.2: Delete Old File** (0.25 hours)
- [ ] Remove `src/components/practice-session.tsx`
- [ ] Verify no import errors

**4.3: Run Full Test Suite** (0.5 hours)
- [ ] `npm run test` - all tests pass
- [ ] `npm run test:coverage` - coverage improved
- [ ] `npm run lint` - no errors
- [ ] `npm run build` - builds successfully
- [ ] Manual smoke test all pages

#### Success Criteria:
- Old monolithic file deleted
- All tests pass
- No import errors
- Application works correctly

---

### Phase 5: Directory Reorganization (3-4 hours)
**Goal**: Reorganize all components into feature-based structure

#### Tasks:

**5.1: Create Directory Structure** (0.5 hours)
```bash
mkdir -p src/components/features/{lessons,courses,achievements,progress,dashboard,profile}
mkdir -p src/components/shared/{layout,forms,debug,analytics}
```

**5.2: Move Components by Feature** (2 hours)

**Lessons** (0.25 hours):
- [ ] Move lesson-content.tsx → features/lessons/LessonContent.tsx
- [ ] Move lesson-viewer.tsx → features/lessons/LessonViewer.tsx
- [ ] Move enhanced-lesson-content.tsx → features/lessons/EnhancedLessonContent.tsx
- [ ] Move lesson-list.tsx → features/lessons/LessonList.tsx
- [ ] Create features/lessons/index.ts

**Courses** (0.25 hours):
- [ ] Move course-card.tsx → features/courses/CourseCard.tsx
- [ ] Move enhanced-course-card.tsx → features/courses/EnhancedCourseCard.tsx
- [ ] Move course-list.tsx → features/courses/CourseList.tsx
- [ ] Move course-filters.tsx → features/courses/CourseFilters.tsx
- [ ] Create features/courses/index.ts

**Achievements** (0.25 hours):
- [ ] Move achievements-card.tsx → features/achievements/AchievementsCard.tsx
- [ ] Move achievements-display.tsx → features/achievements/AchievementsDisplay.tsx
- [ ] Move skill-tree.tsx → features/achievements/SkillTree.tsx
- [ ] Create features/achievements/index.ts

**Progress** (0.25 hours):
- [ ] Move progress-chart.tsx → features/progress/ProgressChart.tsx
- [ ] Move progress-tracker.tsx → features/progress/ProgressTracker.tsx
- [ ] Move activity-calendar.tsx → features/progress/ActivityCalendar.tsx
- [ ] Move streak-display.tsx → features/progress/StreakDisplay.tsx
- [ ] Create features/progress/index.ts

**Dashboard** (0.25 hours):
- [ ] Move dashboard-layout.tsx → features/dashboard/DashboardLayout.tsx
- [ ] Move dashboard-metrics.tsx → features/dashboard/DashboardMetrics.tsx
- [ ] Move instructor-dashboard.tsx → features/dashboard/InstructorDashboard.tsx
- [ ] Create features/dashboard/index.ts

**Profile** (0.25 hours):
- [ ] Move profile-settings.tsx → features/profile/ProfileSettings.tsx
- [ ] Create features/profile/index.ts

**Shared Components** (0.5 hours):
- [ ] Move layout components to shared/layout/
- [ ] Move form components to shared/forms/
- [ ] Move debug components to shared/debug/
- [ ] Move analytics components to shared/analytics/
- [ ] Create index files for each

**5.3: Update All Imports** (1 hour)
- [ ] Update page imports
- [ ] Update App.tsx
- [ ] Update component cross-references
- [ ] Run search for old import paths

**5.4: Verify Everything Works** (0.5 hours)
- [ ] Run test suite
- [ ] Manual test all pages
- [ ] Check for console errors

#### Success Criteria:
- All components organized by feature
- All imports updated
- All tests pass
- Application works correctly

---

### Phase 6: Documentation (2 hours)
**Goal**: Document new structure and patterns

#### Tasks:

**6.1: Update README** (0.5 hours)
- [ ] Document new component organization
- [ ] Add component guidelines
- [ ] Update development workflow

**6.2: Create Component Guidelines** (1 hour)
- [ ] Create COMPONENT_GUIDELINES.md
- [ ] Document patterns (container/presentational)
- [ ] Add testing guidelines
- [ ] Include code examples

**6.3: Create Architecture Doc** (0.5 hours)
- [ ] Create ARCHITECTURE-practice-session.md
- [ ] Document component hierarchy
- [ ] Add data flow diagrams
- [ ] Explain design decisions

#### Success Criteria:
- Clear documentation of new structure
- Guidelines for future development
- Architecture decisions documented

---

## Testing Strategy

### Test-Driven Refactoring (TDR)
1. **Write integration test** for current behavior (safety net)
2. **Extract component** with unit tests
3. **Verify integration test** still passes
4. **Refactor** for clarity
5. **Repeat** for next component

### Test Coverage Goals
- **Unit Tests**: 80%+ for all components
- **Integration Tests**: Full user flows
- **Utilities**: 95%+ coverage

### Test Types

#### Integration Tests
```typescript
describe('PracticeSession Integration', () => {
  it('should complete full session flow', async () => {
    // Start session → answer questions → see results
  });
});
```

#### Unit Tests
```typescript
describe('SessionTimer', () => {
  it('should display time in MM:SS format', () => {});
  it('should apply warning color when low', () => {});
});
```

#### Hook Tests
```typescript
describe('usePracticeTimer', () => {
  it('should countdown from time limit', () => {});
  it('should call onTimeUp when expired', () => {});
});
```

## Risk Mitigation

### Risks & Mitigation Strategies

**Risk 1: Breaking Existing Functionality**
- **Mitigation**: Write integration tests first
- **Mitigation**: Incremental refactoring with tests
- **Mitigation**: Manual testing at each phase

**Risk 2: Import Path Issues**
- **Mitigation**: Update imports systematically
- **Mitigation**: Use TypeScript compiler to find errors
- **Mitigation**: Search for old paths after migration

**Risk 3: Performance Regression**
- **Mitigation**: Use React.memo for expensive components
- **Mitigation**: Profile before/after
- **Mitigation**: Monitor bundle size

**Risk 4: Time Overrun**
- **Mitigation**: Break into small phases
- **Mitigation**: Each phase is independently valuable
- **Mitigation**: Can pause between phases

## Success Criteria

### Phase 1 Complete
- [ ] Integration tests written and passing
- [ ] Test utilities created
- [ ] Baseline coverage established

### Phase 2 Complete
- [ ] All components extracted
- [ ] Each component < 300 lines
- [ ] Unit tests for each component
- [ ] Integration tests still passing

### Phase 3 Complete
- [ ] Custom hooks extracted
- [ ] Utilities extracted
- [ ] All have tests

### Phase 4 Complete
- [ ] Old monolithic file deleted
- [ ] Imports updated
- [ ] All tests pass
- [ ] Build succeeds

### Phase 5 Complete
- [ ] All components reorganized
- [ ] Feature-based structure implemented
- [ ] All tests pass

### Phase 6 Complete
- [ ] Documentation updated
- [ ] Guidelines created
- [ ] Architecture documented

### Overall Success
- [ ] No single file > 500 lines
- [ ] Test coverage > 80%
- [ ] All tests passing
- [ ] No performance regression
- [ ] Clear component organization
- [ ] Documentation complete

## Rollback Plan

If issues arise during implementation:

1. **Phase 1-3**: Abandon feature branch, start over
2. **Phase 4**: Revert import changes, restore old file
3. **Phase 5**: Keep new structure, fix imports
4. **Phase 6**: Documentation can be updated anytime

## Timeline

**Optimistic**: 16 hours (2 days)
**Realistic**: 20 hours (2.5 days)
**Pessimistic**: 24 hours (3 days)

### Daily Breakdown

**Day 1** (8 hours):
- Phase 1: Test Foundation (4 hours)
- Phase 2: Start component extraction (4 hours)

**Day 2** (8 hours):
- Phase 2: Complete component extraction (4 hours)
- Phase 3: Extract hooks & utils (3 hours)
- Phase 4: Update imports & cleanup (1 hour)

**Day 3** (4 hours):
- Phase 5: Directory reorganization (2 hours)
- Phase 6: Documentation (2 hours)

## Notes

### Design Decisions

**Why Container/Presentational?**
- Clear separation of concerns
- Easier testing
- Better reusability

**Why not Context for state?**
- Prop drilling is fine for 2-3 levels
- Context adds complexity
- Easier to test with props

**Why feature-based structure?**
- Scales better
- Mirrors domain logic
- Easier navigation
- Clear boundaries

### Future Improvements

After this refactoring:
- Consider extracting quiz.tsx (similar pattern)
- Add Storybook for component documentation
- Add visual regression tests
- Consider React Server Components for performance

### Related Issues

This refactoring will make these easier:
- Adding new question types
- A/B testing UI variations
- Performance optimizations
- Feature flags

## Appendix

### Current vs Proposed Comparison

| Metric | Current | Proposed |
|--------|---------|----------|
| Largest file | 1,653 lines | ~300 lines |
| Test coverage | 0% | 80%+ |
| Component count | 1 | 20+ |
| Responsibilities | 9 | 1 per component |
| Maintainability | Low | High |

### File Size Targets

| Component | Target Lines |
|-----------|--------------|
| PracticeSessionContainer | ~200 |
| QuestionDisplay | ~150 |
| SessionResults | ~300 |
| All others | < 100 |

### Test Count Target

| Type | Count |
|------|-------|
| Integration | 5-10 |
| Unit (components) | 50+ |
| Unit (hooks) | 10+ |
| Unit (utils) | 10+ |
| **Total** | **75+** |
