# Implementation Plan: Refactor Practice Session Component (Issue #9)

## Overview
Refactor the Practice Session component to use design system components and eliminate inline styles. This is a large file (1452 lines) that needs to be reduced to under 1000 lines.

## Current State
**File**: `src/modules/ui/components/practice-session.tsx`
**Current size**: 1452 lines
**Target**: < 1000 lines (reduction of 450+ lines needed)

**Already completed in Issue #7**:
✅ Form components (Input, Checkbox, Select, Slider) - replaced inline form elements
✅ FeedbackCard component - already imported

## Implementation Strategy

### Phase 1: Add Missing Component Imports
Add Button and design token imports:
```typescript
import { Button } from './common/Button';
import { Card } from './common/Card';
import {
  semanticColors,
  spacing,
  typography,
  colors,
  borderRadius,
  shadows,
  transitions,
} from '@ui/design-tokens';
```

### Phase 2: Replace All Buttons (11 total)

#### 2.1 Primary Action Buttons (4 locations)
- Line ~393: "Antwort überprüfen" → `<Button variant="primary">`
- Line ~1004: "Antwort überprüfen" → `<Button variant="primary">`
- Line ~1079: "Antwort überprüfen" → `<Button variant="primary">`
- Line ~1268: "Antwort überprüfen" → `<Button variant="primary">`

#### 2.2 Secondary Action Buttons (3 locations)
- Line ~521: "Weiter" → `<Button variant="secondary">`
- Line ~1113: "Weiter" → `<Button variant="secondary">`
- Line ~1392: "Weiter" → `<Button variant="secondary">`

#### 2.3 Cancel Button (1 location)
- Line ~1357: "Abbrechen" → `<Button variant="ghost" onClick={onCancel}>`

#### 2.4 Flashcard Reveal Button (1 location)
- Line ~1373: "Antwort anzeigen" → `<Button variant="secondary">`

#### 2.5 Arrow Buttons (2 locations)
- Lines ~596, ~614: Up/down arrows → Keep as is or create custom IconButton

### Phase 3: Replace Inline Styles with Design Tokens

Priority areas for token replacement:

#### 3.1 Main Container & Layout
Replace hardcoded values in main container, progress bar, task container

#### 3.2 Feedback Messages
Already using FeedbackCard, but check for any remaining inline feedback styling

#### 3.3 Statistics Footer
Lines likely around bottom of file - replace with Card component or design tokens

#### 3.4 Task-Specific Styling
- Flashcard containers
- Ordering task items
- True/False option styling
- Word scramble buttons

### Phase 4: Extract Repeated Patterns into Components

To achieve the 450+ line reduction, extract these sections:

#### 4.1 ProgressHeader Component (~50 lines saved)
Extract the progress bar and header section:
```typescript
interface ProgressHeaderProps {
  currentTaskIndex: number;
  totalTasks: number;
  onCancel: () => void;
}
```

#### 4.2 TaskPrompt Component (~30 lines saved)
Extract task prompt/question display:
```typescript
interface TaskPromptProps {
  task: Task;
  showAudio?: boolean;
}
```

#### 4.3 ActionButtons Component (~40 lines saved)
Extract the check answer / continue / skip button logic:
```typescript
interface ActionButtonsProps {
  showFeedback: boolean;
  isCorrect: boolean;
  onCheck: () => void;
  onContinue: () => void;
  onSkip: () => void;
  disabled?: boolean;
}
```

#### 4.4 StatisticsFooter Component (~50 lines saved)
Extract the statistics display at the bottom:
```typescript
interface StatisticsFooterProps {
  correctCount: number;
  completedCount: number;
  accuracy: number;
}
```

### Phase 5: Task Type Renderers (Optional - if more reduction needed)

If we need more line reduction, extract each render function to separate files:
- `renderClozeDeletion()` → `ClozeDeletionTask.tsx`
- `renderMultipleChoice()` → `MultipleChoiceTask.tsx`
- `renderTrueFalse()` → `TrueFalseTask.tsx`
- etc.

This could save 200-300 additional lines if needed.

## Implementation Order

1. **Add imports** (Button, Card, design tokens)
2. **Replace all 11 buttons** with Button component
3. **Replace hardcoded colors** with design token values
4. **Replace spacing/padding** with spacing[] tokens
5. **Replace typography** with typography tokens
6. **Extract ProgressHeader component**
7. **Extract ActionButtons component**
8. **Extract StatisticsFooter component**
9. **Test all task types** to ensure nothing broke
10. **Run build and verify line count** (should be < 1000)

## Acceptance Criteria

- ✅ File size < 1000 lines
- ✅ No inline `<button>` elements (all use Button component)
- ✅ All hardcoded colors replaced with design tokens
- ✅ All spacing uses spacing[] tokens
- ✅ All task types work correctly
- ✅ Visual appearance maintained
- ✅ Build passes without errors
- ✅ Code review completed

## Expected Results

**Before**: 1452 lines with inline styles
**After**: ~950 lines using design system

**Removed**:
- ~200 lines (button inline styles → Button component)
- ~100 lines (hardcoded values → tokens)
- ~200 lines (component extraction)

**Benefits**:
1. Significantly more maintainable
2. Consistent with design system
3. Easier to test individual components
4. Better code organization
