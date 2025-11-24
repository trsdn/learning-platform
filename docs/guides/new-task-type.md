# Adding a New Task Type - Complete Guide

This guide walks you through **all steps** to implement a new task type in the learning platform.

## 📋 Overview

To add a new task type (e.g., `fill-in-table`, `diagram-labeling`), you need to update:
1. Type definitions
2. Practice session component
3. Template files
4. Test content
5. Documentation

**Estimated time**: 2-4 hours for a complete implementation

---

## Step 1: Define Type Interface

**File**: `src/modules/core/types/services.ts`

### 1.1 Add to TaskType Union

Find the `TaskType` type and add your new type:

```typescript
export type TaskType =
  | 'multiple-choice'
  | 'cloze-deletion'
  | 'true-false'
  | 'flashcard'
  | 'ordering'
  | 'matching'
  | 'multiple-select'
  | 'slider'
  | 'word-scramble'
  | 'text-input'
  | 'your-new-type';  // ← Add here
```

### 1.2 Create Content Interface

Add your content interface **before** the main `Task` interface:

```typescript
/**
 * Your New Type Content
 * Description of what this task type does
 */
export interface YourNewTypeContent {
  question: string;           // Required: The question/prompt
  // ... your specific fields
  explanation?: string;       // Optional: Explanation shown after answer
  hint?: string;             // Optional: Hint shown before answer
}
```

**Example** (Fill-in-Table):
```typescript
export interface FillInTableContent {
  question: string;
  headers: string[];          // Column headers
  rows: Array<{
    cells: Array<{
      content?: string;       // Pre-filled content
      isBlank: boolean;       // User must fill this
      correctAnswer?: string; // Correct answer for blank
    }>;
  }>;
  explanation?: string;
  hint?: string;
}
```

### 1.3 Update Task Content Union

Find the `Task` interface and update its `content` property:

```typescript
export interface Task {
  id: string;
  // ... other properties
  content:
    | MultipleChoiceContent
    | ClozeDeletionContent
    | TrueFalseContent
    | FlashcardContent
    | OrderingContent
    | MatchingContent
    | MultipleSelectContent
    | SliderContent
    | WordScrambleContent
    | TextInputContent
    | YourNewTypeContent;  // ← Add here
}
```

---

## Step 2: Update Practice Session Component

**File**: `src/modules/ui/components/practice-session.tsx`

This is the **most important** file - it handles all task rendering and answer validation.

### 2.1 Add State Variables (if needed)

Near the top of the component (around line 30-60), add any state you need:

```typescript
// Your New Type state
const [yourNewTypeAnswer, setYourNewTypeAnswer] = useState<YourAnswerType>(initialValue);
```

**Example** (Fill-in-Table):
```typescript
// Fill-in-Table state
const [tableAnswers, setTableAnswers] = useState<Record<string, string>>({});
```

### 2.2 Reset State in loadCurrentTask()

In the `loadCurrentTask()` function (around line 100-172), add reset logic:

```typescript
async function loadCurrentTask() {
  // ... existing code

  // Reset all state
  setSelectedAnswer(null);
  // ... other resets
  setYourNewTypeAnswer(initialValue);  // ← Add here

  // ... rest of function
}
```

### 2.3 Add Answer Validation in handleAnswerSubmit()

In `handleAnswerSubmit()` (around line 174-261), add validation logic:

```typescript
async function handleAnswerSubmit() {
  if (!currentTask || !session) return;

  let correct = false;

  // Check answer based on task type
  if (currentTask.type === 'multiple-choice') {
    // ... existing code
  } else if (currentTask.type === 'your-new-type') {
    if (!yourNewTypeAnswer) return;  // Prevent empty submission
    const content = currentTask.content as YourNewTypeContent;
    correct = validateYourAnswer(yourNewTypeAnswer, content);
  }

  // ... rest of function
}
```

**Example** (Fill-in-Table):
```typescript
} else if (currentTask.type === 'fill-in-table') {
  const content = currentTask.content as FillInTableContent;
  correct = content.rows.every((row, rowIndex) =>
    row.cells.every((cell, cellIndex) => {
      if (!cell.isBlank) return true;
      const key = `${rowIndex}-${cellIndex}`;
      return tableAnswers[key]?.trim().toLowerCase() === cell.correctAnswer?.toLowerCase();
    })
  );
}
```

### 2.4 Update canSubmit()

In `canSubmit()` (around line 309-327), add logic to check if answer is ready:

```typescript
function canSubmit(): boolean {
  if (showFeedback) return false;

  if (currentTask?.type === 'multiple-choice') return selectedAnswer !== null;
  // ... other types
  if (currentTask?.type === 'your-new-type') return isAnswerComplete();

  return false;
}
```

### 2.5 Create Render Function

Create a new render function (around line 350-1300):

```typescript
function renderYourNewType() {
  if (!currentTask || currentTask.type !== 'your-new-type') return null;
  const content = currentTask.content as YourNewTypeContent;

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      {/* Your UI here */}

      {/* Show correct answer after feedback */}
      {showFeedback && !isCorrect && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Richtige Antwort:
          </div>
          {/* Display correct answer */}
        </div>
      )}
    </div>
  );
}
```

**UI Guidelines**:
- ✅ Correct: Green border `#86efac`, background `#dcfce7`
- ❌ Wrong: Red border `#fca5a5`, background `#fee2e2`
- ⚪ Neutral: Gray border `#d1d5db`, white background
- Disabled buttons after submission: `disabled={showFeedback}`
- Font sizes: Question `1.1rem`, Options `0.95rem`, Hints `0.875rem`

### 2.6 Add to renderTaskContent()

In `renderTaskContent()` (around line 337-355), add your case:

```typescript
function renderTaskContent() {
  if (!currentTask) return null;

  if (currentTask.type === 'multiple-choice') {
    return renderMultipleChoice();
  } else if (currentTask.type === 'your-new-type') {
    return renderYourNewType();  // ← Add here
  }
  // ... other types

  return null;
}
```

### 2.7 Update Question Header (if needed)

If your task type needs a question header, update the conditional around line 1374-1390:

```typescript
{(currentTask.type === 'multiple-choice' ||
  currentTask.type === 'your-new-type' ||  // ← Add here
  // ... other types
  currentTask.type === 'text-input') && (
  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <h3 style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.4', flex: 1 }}>
      {(currentTask.content as any).question}
    </h3>
  </div>
)}
```

---

## Step 3: Create Template File

**File**: `data/templates/your-new-type-basic.json`

Create a template file that defines the structure and validation rules:

```json
{
  "templateId": "your-new-type-basic",
  "name": "Your New Type - Basic",
  "type": "your-new-type",
  "description": "Description of what this task type does",
  "version": "1.0.0",
  "schema": {
    "content": {
      "required": ["question"],
      "optional": ["explanation", "hint"],
      "fields": {
        "question": {
          "type": "string",
          "minLength": 5,
          "maxLength": 500
        },
        "explanation": {
          "type": "string",
          "maxLength": 1000
        },
        "hint": {
          "type": "string",
          "maxLength": 200
        }
      }
    },
    "metadata": {
      "required": ["difficulty", "tags", "estimatedTime", "points"],
      "fields": {
        "difficulty": {
          "type": "enum",
          "values": ["easy", "medium", "hard"]
        },
        "tags": {
          "type": "array",
          "items": "string"
        },
        "estimatedTime": {
          "type": "number",
          "min": 10,
          "max": 600
        },
        "points": {
          "type": "number",
          "min": 1,
          "max": 100
        }
      }
    }
  },
  "examples": [
    {
      "id": "example-1",
      "learningPathId": "test-path",
      "templateId": "your-new-type-basic",
      "type": "your-new-type",
      "content": {
        "question": "Example question?",
        "explanation": "This is why..."
      },
      "metadata": {
        "difficulty": "easy",
        "tags": ["example"],
        "estimatedTime": 60,
        "points": 10
      }
    }
  ],
  "usageNotes": [
    "Best for: Use cases",
    "Difficulty: How to assess",
    "Tips: Best practices"
  ]
}
```

---

## Step 4: Add Test Content

**File**: `public/learning-paths/test/all-task-types.json`

Add at least 2-3 example tasks to test your implementation:

```json
{
  "learningPath": {
    "id": "all-task-types-test",
    "topicId": "test",
    "title": "All Task Types Test",
    "description": "...",
    "difficulty": "easy",
    "estimatedTime": 60,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "tasks": [
    // ... existing tasks
    {
      "id": "test-your-new-type-1",
      "learningPathId": "all-task-types-test",
      "templateId": "your-new-type-basic",
      "type": "your-new-type",
      "content": {
        "question": "Test question?",
        "explanation": "Test explanation"
      },
      "metadata": {
        "difficulty": "easy",
        "tags": ["test"],
        "estimatedTime": 60,
        "points": 10
      }
    }
  ]
}
```

---

## Step 5: Update Documentation

### 5.1 Update AGENTS.md

Add your task type to the "Task Types System" section (around line 38-139):

```markdown
### 9. Your New Type (`your-new-type`)
\`\`\`typescript
interface YourNewTypeContent {
  question: string;
  // ... your fields
  explanation?: string;
  hint?: string;
}
\`\`\`
```

Update the count in the overview section:
```markdown
**MindForge Academy** is a TypeScript-based learning platform featuring:
- 9 different task/question types  <!-- Update number -->
```

### 5.2 Update README.md (Optional)

If this is a significant new feature, add it to the features list.

---

## Step 6: Testing

### 6.1 Local Testing

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Test in browser**:
   - Open http://localhost:5173
   - Click "🔄 DB Aktualisieren" to load test content
   - Navigate to your test learning path
   - Complete 2-3 tasks of your new type

3. **Check TypeScript**:
   ```bash
   npm run build
   ```

### 6.2 Test Checklist

- [ ] Task loads without errors
- [ ] All UI elements render correctly
- [ ] Can submit answer
- [ ] Correct answer validation works
- [ ] Wrong answer validation works
- [ ] Feedback colors are correct (green/red)
- [ ] Solution display shows after wrong answer
- [ ] Explanation shows (if provided)
- [ ] Hint shows (if provided)
- [ ] No TypeScript errors
- [ ] Session statistics update correctly
- [ ] "Next Task" button works
- [ ] Spaced repetition updates (check Dashboard)

### 6.3 Edge Cases to Test

- Empty/incomplete submissions
- All correct answers
- All wrong answers
- Mixed correct/wrong (if applicable)
- Very long text
- Special characters
- Mobile viewport

---

## Step 7: Commit and Deploy

```bash
# Commit changes
git add -A
git commit -m "Add new task type: your-new-type"
git push

# Deploy
npm run deploy
```

---

## 📚 Reference: Existing Task Types

Study these for examples:

### Simple Types (Good Starting Point)
- **True/False**: `renderTrueFalse()` - Binary choice
- **Text Input**: `renderTextInput()` - Single text field
- **Slider**: `renderSlider()` - Single numeric value

### Medium Complexity
- **Multiple Choice**: `renderMultipleChoice()` - Options with shuffle
- **Ordering**: `renderOrdering()` - Drag to reorder
- **Word Scramble**: `renderWordScramble()` - Unscramble letters

### Complex Types
- **Cloze Deletion**: `renderClozeDeletion()` - Multiple blanks
- **Matching**: `renderMatching()` - Pair left/right
- **Multiple Select**: `renderMultipleSelect()` - Multiple checkboxes
- **Flashcard**: `renderFlashcard()` - Reveal mechanic

---

## 🚨 Common Pitfalls

1. **Forgetting to reset state** in `loadCurrentTask()`
   - Causes previous answers to leak into new tasks

2. **Not checking `showFeedback`** in render
   - UI elements should be disabled after submission

3. **Wrong type casting**
   - Always cast: `currentTask.content as YourNewTypeContent`

4. **Missing in `canSubmit()`**
   - Submit button stays disabled

5. **Not handling empty submissions**
   - Add `if (!answer) return;` in `handleAnswerSubmit()`

6. **TypeScript errors ignored**
   - Always run `npm run build` before committing

---

## 💡 Tips

- **Start simple**: Implement basic version first, add features later
- **Copy existing code**: Find the most similar task type and adapt it
- **Use inline styles**: Keeps component self-contained
- **Test early**: Don't wait until everything is done
- **Ask for help**: Check existing implementations or AGENTS.md

---

## 📝 Checklist

Use this checklist to track your progress:

### Type Definitions
- [ ] Added to `TaskType` union
- [ ] Created content interface
- [ ] Added to `Task.content` union

### Practice Session Component
- [ ] Added state variables
- [ ] Reset state in `loadCurrentTask()`
- [ ] Added validation in `handleAnswerSubmit()`
- [ ] Updated `canSubmit()`
- [ ] Created `renderYourNewType()`
- [ ] Added to `renderTaskContent()`
- [ ] Updated question header (if needed)

### Templates & Content
- [ ] Created template file
- [ ] Added test content
- [ ] Tested with real data

### Documentation
- [ ] Updated AGENTS.md
- [ ] Updated this guide (if needed)
- [ ] Added code comments

### Testing
- [ ] Local testing passed
- [ ] TypeScript build succeeds
- [ ] Edge cases tested
- [ ] Mobile tested

### Deployment
- [ ] Code committed
- [ ] Deployed to production
- [ ] Verified on live site

---

**Last Updated**: 2025-10-03
**Author**: Development Team
