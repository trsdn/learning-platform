---
description: Guide user through implementing a new task type with interactive prompts and code generation. Arguments: [task-type-name]
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Interactively guide the user through all steps to implement a new task type for the learning platform, generating code and ensuring nothing is missed.

**Reference**: See `docs/NEW_TASK_TYPE_GUIDE.md` for complete documentation.

Execution steps:

1. **Parse user input** from `$ARGUMENTS`:
   - If task type name provided: Use it (e.g., `fill-in-table`, `diagram-labeling`)
   - If empty: Ask user "What task type do you want to implement?" and wait for response
   - Validate name: kebab-case, descriptive, not already existing

2. **Pre-implementation check**:
   a. Check if task type already exists:
      ```bash
      grep -r "type: '$TASK_TYPE'" src/modules/core/types/services.ts
      ```
      - If exists: Ask if user wants to modify existing or create new variant

   b. Verify development environment ready:
      ```bash
      npm run build
      ```
      - If build fails: Ask user to fix errors first

3. **Gather requirements** (interactive Q&A):
   Ask user sequentially:

   a. **Description**: "What does this task type do? (1-2 sentences)"

   b. **Content fields**: "What data fields does the task need?"
      - Example: "For fill-in-table: headers, rows with cells (content, isBlank, correctAnswer)"
      - Generate TypeScript interface based on answer

   c. **User interaction**: "How does the user answer this task?"
      - Example: "Fill in blank cells", "Drag and drop", "Click to select"

   d. **Validation logic**: "How is the answer checked for correctness?"
      - Example: "Compare each blank cell with correctAnswer"

   e. **Complexity**: "Is this task type: simple (like true-false), medium (like multiple-choice), or complex (like matching)?"

4. **Step 1: Update type definitions** (`src/modules/core/types/services.ts`):

   a. Read current file

   b. Generate and show user:
      ```typescript
      // Add to TaskType union
      export type TaskType =
        | 'existing-types...'
        | 'your-new-type';  // ← NEW

      // Create content interface
      export interface YourNewTypeContent {
        question: string;
        // ... generated based on user's requirements
        explanation?: string;
        hint?: string;
      }
      ```

   c. Add to Task content union

   d. Ask: "Shall I add this to services.ts?" → If yes, apply edits

5. **Step 2: Update practice session component** (`src/modules/ui/components/practice-session.tsx`):

   This is the CRITICAL step. Create in this order:

   a. **Add state variables** (around line 30-65):
      ```typescript
      const [yourAnswer, setYourAnswer] = useState<YourType>(initialValue);
      ```

   b. **Reset in loadCurrentTask()** (around line 112-124):
      ```typescript
      setYourAnswer(initialValue);
      ```

   c. **Validation in handleAnswerSubmit()** (around line 174-229):
      ```typescript
      } else if (currentTask.type === 'your-new-type') {
        if (!yourAnswer) return;
        const content = currentTask.content as YourNewTypeContent;
        correct = /* validation logic */;
      }
      ```

   d. **Update canSubmit()** (around line 309-327):
      ```typescript
      if (currentTask?.type === 'your-new-type') return isAnswerComplete();
      ```

   e. **Create renderYourNewType()** function:
      - Generate complete render function with:
        * Input/interaction UI
        * Visual feedback (green/red borders)
        * Solution display after wrong answer
        * Disabled state during feedback
      - Use UI guidelines:
        * Correct: `#86efac` border, `#dcfce7` background
        * Wrong: `#fca5a5` border, `#fee2e2` background
        * Font sizes: Question `1.1rem`, Options `0.95rem`

   f. **Add to renderTaskContent()** (around line 337-355)

   g. **Update question header** if needed (around line 1374-1390)

   h. Show user complete code for each section
   i. Ask: "Shall I update practice-session.tsx?" → If yes, apply all edits

6. **Step 3: Create template file** (`data/templates/your-new-type-basic.json`):

   a. Generate template JSON with:
      - Schema definition
      - Field validation rules
      - 2-3 examples
      - Usage notes

   b. Show template to user
   c. Ask: "Shall I create this template?" → If yes, write file

7. **Step 4: Add test content** (`public/learning-paths/test/all-task-types.json`):

   a. Read existing test file
   b. Generate 2-3 test tasks
   c. Show user the test tasks
   d. Ask: "Shall I add these test tasks?" → If yes, edit file

8. **Step 5: Update documentation**:

   a. Update `AGENTS.md`:
      - Add to "Task Types System" section
      - Update task type count

   b. Ask: "Shall I update AGENTS.md?" → If yes, edit file

9. **Step 6: Testing instructions**:

   Provide step-by-step testing guide:
   ```
   1. Run: npm run dev
   2. Open: http://localhost:5173
   3. Click: "🔄 DB Aktualisieren"
   4. Navigate to test learning path
   5. Test your new task type

   Verify:
   - [ ] Task loads without errors
   - [ ] Can interact with UI
   - [ ] Can submit answer
   - [ ] Correct validation works
   - [ ] Wrong validation works
   - [ ] Feedback colors correct
   - [ ] Solution shows after wrong answer
   ```

10. **Checklist summary**:

    Present final checklist:
    ```
    ✅ Type definitions updated
    ✅ Practice session component updated
    ✅ Template file created
    ✅ Test content added
    ✅ Documentation updated
    ⏳ Testing (user must do)
    ```

11. **Next steps**:

    Remind user:
    - Run `npm run build` to check TypeScript
    - Test thoroughly in browser
    - If working, commit: `git commit -m "Add task type: your-new-type"`
    - Optional: Deploy to test environment first (`/deploy-test`)

Behavior rules:
- ASK before making ANY file changes
- SHOW code before applying edits
- GENERATE complete, working code (no placeholders like `// TODO`)
- FOLLOW existing code style and patterns
- USE similar task types as reference (recommend which one)
- VALIDATE task type name (kebab-case, descriptive)
- PROVIDE specific line numbers for edits
- ENSURE TypeScript type safety
- TEST instructions must be actionable and specific

Interactive prompts:
- When user provides incomplete info: Ask clarifying questions
- When user unsure about UI: Suggest similar existing task types
- When user requests changes: Regenerate code and ask for approval again
- Always confirm before writing/editing files

Reference patterns to copy from:
- **Simple**: `true-false`, `text-input`, `slider`
- **Medium**: `multiple-choice`, `ordering`, `word-scramble`
- **Complex**: `cloze-deletion`, `matching`, `multiple-select`, `flashcard`

Safety checks:
- NEVER overwrite files without user approval
- NEVER skip validation logic
- NEVER forget to update all 5 required files
- ALWAYS provide rollback instructions if something breaks

Context: $ARGUMENTS
