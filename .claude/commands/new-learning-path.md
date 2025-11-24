---
description: Create a new learning path with tasks interactively. Arguments: [topic-id] [learning-path-id] (optional)
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Interactively guide the user through creating a new learning path with tasks, generating properly structured JSON content.

**Reference**: See `AGENTS.md` section "Adding New Learning Paths" for documentation.

Execution steps:

1. **Parse user input** from `$ARGUMENTS`:
   - Extract topic ID (e.g., `mathematik`, `spanisch`, `biologie`)
   - Extract learning path ID (optional, e.g., `algebra-basics`)
   - If missing: Ask user interactively

2. **Validate topic**:
   a. Check if topic exists:
      ```bash
      ls public/learning-paths/
      ```
   b. If topic doesn't exist: Ask if user wants to create new topic
   c. List available topics to user

3. **Gather learning path metadata** (interactive Q&A):

   Ask user sequentially:

   a. **Learning Path ID**: "Enter learning path ID (kebab-case, e.g., 'algebra-basics'):"
      - Validate: kebab-case, unique
      - Check doesn't already exist

   b. **Title**: "Enter title (German, e.g., 'Algebra Grundlagen'):"

   c. **Description**: "Enter description (1-2 sentences):"

   d. **Difficulty**: "Select difficulty: easy, medium, or hard?"
      - Validate: must be one of three

   e. **Estimated time**: "Estimated completion time in minutes (e.g., 30):"
      - Validate: number, 5-600 range

   f. **Requirements** (optional):
      - "Minimum accuracy required (%):" (default: 60)
      - "Required tasks to complete:" (default: 10)

4. **Generate learning path metadata**:

   Show user the generated structure:
   ```json
   {
     "learningPath": {
       "id": "user-provided-id",
       "topicId": "user-provided-topic",
       "title": "User Title",
       "description": "User description",
       "difficulty": "easy|medium|hard",
       "estimatedTime": 30,
       "isActive": true,
       "createdAt": "2025-10-03T00:00:00.000Z",
       "requirements": {
         "minimumAccuracy": 60,
         "requiredTasks": 10
       }
     },
     "tasks": []
   }
   ```

5. **Task creation loop**:

   Ask user: "How many tasks do you want to add?" (recommend 10-20)

   For each task (loop):

   a. Ask: "Task #N - Select task type:"
      ```
      1. multiple-choice
      2. flashcard
      3. text-input
      4. matching
      5. ordering
      6. true-false
      7. cloze-deletion
      8. multiple-select
      9. slider
      10. word-scramble
      ```

   b. Based on task type, gather required fields:

      **For multiple-choice**:
      - Question text
      - 4 options (array)
      - Correct answer index (0-3)
      - Explanation (optional)
      - Hint (optional)

      **For flashcard**:
      - Front text
      - Back text
      - Explanation (optional)

      **For text-input**:
      - Question text
      - Correct answer
      - Alternative answers (optional)
      - Explanation (optional)

      **For matching**:
      - Question text
      - Number of pairs
      - Each pair: left and right
      - Explanation (optional)

      **For ordering**:
      - Question text
      - Items to order (array)
      - Correct order (indices array)
      - Explanation (optional)

      (Similar for other types - reference `docs/NEW_TASK_TYPE_GUIDE.md`)

   c. Ask: "Task metadata:"
      - Difficulty: easy/medium/hard
      - Tags: comma-separated (e.g., "algebra,basics,equations")
      - Estimated time (seconds): default based on type
      - Points: default 10

   d. Generate task ID: `{topic-id}-{learning-path-id}-{task-number}`

   e. Show generated task JSON to user

   f. Ask: "Add this task? (yes/no/edit)"
      - yes: Add to tasks array
      - no: Skip this task
      - edit: Let user modify specific fields

   g. Ask: "Add another task? (yes/no)"
      - yes: Continue loop
      - no: Exit loop

6. **Review and validation**:

   a. Show complete learning path JSON
   b. Validate:
      - All required fields present
      - Task IDs unique
      - Correct answer indices valid
      - JSON syntax correct

   c. Show summary:
      ```
      Learning Path: {title}
      Topic: {topicId}
      Difficulty: {difficulty}
      Tasks: {count}
      Task types breakdown:
        - multiple-choice: X
        - flashcard: Y
        - text-input: Z
      ```

7. **File creation**:

   a. Determine file path:
      ```
      public/learning-paths/{topicId}/{learningPathId}.json
      ```

   b. Check if file already exists:
      - If exists: Ask user to confirm overwrite or choose new name

   c. Show user: "I will create file at: {filepath}"

   d. Ask: "Create this file? (yes/no)"
      - yes: Write file
      - no: Ask if user wants to save JSON to different location

8. **Register in json-loader**:

   a. Read `src/modules/storage/json-loader.ts`

   b. Find learningPathFiles object

   c. Generate update:
      ```typescript
      const learningPathFiles: Record<string, string[]> = {
        topicId: [
          'existing-file-1.json',
          'existing-file-2.json',
          'your-new-file.json',  // ← NEW
        ],
      };
      ```

   d. Show diff to user

   e. Ask: "Update json-loader.ts to include new learning path? (yes/no)"
      - yes: Apply edit
      - no: Remind user to do it manually

9. **Testing instructions**:

   Provide step-by-step guide:
   ```
   1. Run: npm run dev
   2. Open: http://localhost:5173
   3. Click: "🔄 DB Aktualisieren"
   4. Verify new learning path appears under topic
   5. Start practice session
   6. Test 2-3 tasks

   Checklist:
   - [ ] Learning path appears in topic list
   - [ ] Title and description correct
   - [ ] Difficulty badge shows correctly
   - [ ] Tasks load without errors
   - [ ] Answer validation works
   - [ ] Progress tracking works
   ```

10. **Educational Review** (RECOMMENDED):

    Ask user: "Would you like the content-designer to review this learning path for pedagogical effectiveness? (yes/no)"

    If yes:
    - Launch content-designer agent via Task tool
    - Provide: learning path JSON, topic context
    - content-designer will analyze:
      * Task type distribution
      * Difficulty progression
      * Cognitive load appropriateness
      * Spaced repetition compatibility
      * Alignment with learning science
    - Review feedback and suggestions
    - Ask if user wants to make recommended changes

11. **Post-creation options**:

    Ask user: "What would you like to do next?"
    ```
    1. Request learning design review (if skipped above)
    2. Add more tasks to this learning path (edit JSON)
    3. Create another learning path
    4. Deploy to test environment (/deploy-test)
    5. Nothing, I'm done
    ```

12. **Final summary**:

    ```
    ✅ Learning path created: {title}
    ✅ File: {filepath}
    ✅ Tasks: {count}
    ✅ Registered in json-loader.ts

    Next steps:
    - Test in browser (npm run dev)
    - Add audio files if Spanish content (npm run generate-audio)
    - Deploy to test: /deploy-test
    - Deploy to prod: /deploy
    ```

Behavior rules:
- ASK for each piece of information (don't assume)
- VALIDATE all inputs (types, ranges, formats)
- SHOW generated JSON before writing files
- NEVER overwrite files without confirmation
- PROVIDE examples for each field
- SUGGEST sensible defaults
- ALLOW user to go back and edit
- GENERATE unique, consistent task IDs
- FOLLOW existing learning path patterns in `public/learning-paths/`

Input validation rules:
- Learning path ID: kebab-case, 3-50 chars, unique
- Topic ID: must exist or user confirms new topic
- Difficulty: exactly "easy", "medium", or "hard"
- Estimated time: 5-600 minutes
- Task options: at least 2, maximum 10
- Correct answer index: within options array bounds
- Tags: lowercase, comma-separated, no special chars

Smart defaults:
- isActive: true
- createdAt: current timestamp (ISO 8601)
- minimumAccuracy: 60
- requiredTasks: 10
- Points per task: 10
- Estimated time per task: 30-60 seconds based on type

Task type templates to reference:
- Read existing files in `public/learning-paths/*/` for examples
- Match JSON structure exactly
- Include all required fields per type
- Optional fields can be omitted

Helper suggestions:
- If user creating Spanish content: Remind about audio generation
- If user creating math content: Suggest using TeX/LaTeX for formulas (future)
- If creating flashcards: Recommend 10-20 cards per learning path
- If creating quiz: Recommend mix of task types

Error handling:
- Invalid JSON: Show syntax error and location
- Missing required fields: List what's missing
- Duplicate task IDs: Auto-generate unique ID
- File write errors: Provide fallback (save to clipboard)

Context: $ARGUMENTS
