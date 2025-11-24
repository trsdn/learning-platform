# Learning Content Agent Guidelines

**Last Updated**: 2025-11-24
**Parent Guide**: [../AGENTS.md](../AGENTS.md)

> **For AI Agents**: This guide contains specific instructions for working with learning paths, tasks, and educational content.

---

## 🎯 Purpose

This guide provides content-specific guidelines for AI agents working with:
- Learning paths (JSON files)
- Task creation and validation
- Audio content
- Content templates
- Educational quality assurance

---

## 📁 Directory Structure

```
public/
├── learning-paths/      # Learning path JSON files
│   ├── test/           # Test content
│   ├── mathematik/     # Math content
│   ├── german/         # German language content
│   ├── spanisch/       # Spanish content
│   └── englisch/       # English content
├── audio/              # Audio files for pronunciation
│   ├── spanish/        # Spanish audio (verbs, words)
│   └── ...
└── templates/          # Content templates (if any)
```

---

## 📚 Learning Path Structure

### JSON File Format

```json
{
  "learningPath": {
    "id": "unique-learning-path-id",
    "topicId": "topic-id",
    "title": "Learning Path Title",
    "description": "Brief description of what students will learn",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "estimatedTime": 30,
    "tags": ["tag1", "tag2"]
  },
  "tasks": [
    {
      "id": "task-1",
      "type": "multiple-choice",
      "content": {
        // Task-type-specific content
      },
      "explanation": "Why this answer is correct",
      "hint": "Helpful hint without revealing answer"
    }
  ]
}
```

### File Naming Convention

```
public/learning-paths/{topic}/{learning-path-id}.json

Examples:
- public/learning-paths/mathematik/algebra-basics.json
- public/learning-paths/spanisch/irregular-verbs-present.json
- public/learning-paths/test/all-task-types.json
```

---

## 🎓 Task Types Reference

The platform supports 8 task types. Each has unique content structure:

### 1. Multiple Choice
```json
{
  "type": "multiple-choice",
  "content": {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1
  }
}
```

### 2. Cloze Deletion
```json
{
  "type": "cloze-deletion",
  "content": {
    "text": "The capital of France is {{Paris}}.",
    "blanks": [
      {
        "id": "0",
        "correctAnswers": ["Paris", "paris"],
        "caseSensitive": false
      }
    ]
  }
}
```

### 3. True/False
```json
{
  "type": "true-false",
  "content": {
    "statement": "The Earth is flat.",
    "correctAnswer": false
  }
}
```

### 4. Ordering
```json
{
  "type": "ordering",
  "content": {
    "items": ["First", "Second", "Third"],
    "correctOrder": [0, 1, 2]
  }
}
```

### 5. Matching
```json
{
  "type": "matching",
  "content": {
    "pairs": [
      { "left": "Dog", "right": "Animal" },
      { "left": "Rose", "right": "Plant" }
    ]
  }
}
```

### 6. Multiple Select
```json
{
  "type": "multiple-select",
  "content": {
    "question": "Select all prime numbers:",
    "options": ["2", "3", "4", "5"],
    "correctAnswers": [0, 1, 3]
  }
}
```

### 7. Slider
```json
{
  "type": "slider",
  "content": {
    "question": "What is the approximate value of π?",
    "min": 0,
    "max": 5,
    "step": 0.1,
    "correctValue": 3.14,
    "tolerance": 0.1
  }
}
```

### 8. Word Scramble
```json
{
  "type": "word-scramble",
  "content": {
    "scrambledWord": "OLELH",
    "correctWord": "HELLO"
  }
}
```

---

## ✅ Content Quality Standards

### Task Quality Checklist

- [ ] **Clear question**: Unambiguous wording
- [ ] **Correct answer**: Definitively correct
- [ ] **Plausible distractors**: Wrong answers seem reasonable
- [ ] **Helpful explanation**: Teaches why answer is correct
- [ ] **Useful hint**: Guides without revealing
- [ ] **Appropriate difficulty**: Matches learning path level
- [ ] **No typos**: Spell-checked
- [ ] **Consistent formatting**: Follows guidelines

### Learning Path Quality Checklist

- [ ] **10-20 tasks**: Optimal length
- [ ] **Varied task types**: Mix of 3+ types
- [ ] **Progressive difficulty**: Easy → Hard
- [ ] **Clear learning objective**: Students know what they'll learn
- [ ] **Accurate time estimate**: 20-40 minutes typical
- [ ] **Consistent topic**: All tasks relate to main topic
- [ ] **Valid JSON**: No syntax errors

---

## 🎵 Audio Content

### Audio File Management

**Location**: `public/audio/{language}/`

**Naming Convention**:
```
{word-or-phrase}.mp3

Examples:
- ser.mp3 (Spanish verb "ser")
- estar.mp3 (Spanish verb "estar")
- hello.mp3 (English word)
```

### Generating Audio

```bash
# Generate Spanish audio
npm run generate-audio

# This uses: scripts/generate-spanish-audio.py
```

### Audio Requirements

- **Format**: MP3
- **Bitrate**: 128 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Mono
- **Duration**: Keep concise (<3 seconds)

### Linking Audio to Tasks

```json
{
  "type": "multiple-choice",
  "content": {
    "question": "Listen and choose the correct verb:",
    "audio": "/audio/spanish/ser.mp3",
    "options": ["ser", "estar", "tener"],
    "correctAnswer": 0
  }
}
```

---

## 🔧 Content Creation Workflow

### Step 1: Plan Learning Path

```markdown
**Topic**: Spanish Irregular Verbs
**Difficulty**: Beginner
**Objectives**:
- Recognize 10 common irregular verbs
- Conjugate in present tense
- Use in simple sentences

**Task Breakdown**:
- Tasks 1-5: Recognition (multiple-choice)
- Tasks 6-10: Application (cloze-deletion)
- Tasks 11-15: Production (text-input or matching)
```

### Step 2: Create JSON File

```bash
# Create file
touch public/learning-paths/spanisch/irregular-verbs-present.json

# Edit with your preferred editor
code public/learning-paths/spanisch/irregular-verbs-present.json
```

### Step 3: Validate JSON

```bash
# Check JSON syntax
npx jsonlint public/learning-paths/spanisch/irregular-verbs-present.json

# Or use online validator
# https://jsonlint.com/
```

### Step 4: Register in Loader

```typescript
// src/modules/storage/json-loader.ts
const learningPathFiles = {
  // ... existing paths
  'spanisch/irregular-verbs-present': () =>
    import('../../public/learning-paths/spanisch/irregular-verbs-present.json')
}
```

### Step 5: Test in Browser

```bash
# Start dev server
npm run dev

# Open: http://localhost:5173
# 1. Click "🔄 DB Aktualisieren"
# 2. Navigate to your learning path
# 3. Test all tasks
```

### Step 6: Request Review (Optional)

```bash
# Use content-designer agent for pedagogical review
/review-learning-path spanisch/irregular-verbs-present
```

---

## 📋 Content Templates

### Using Templates

```bash
# Copy template
cp data/templates/multiple-choice-basic.json \
   public/learning-paths/your-topic/your-path.json

# Edit placeholders
# Replace {{PLACEHOLDER}} with actual content
```

### Creating Templates

Save reusable task patterns in `data/templates/`:

```json
// data/templates/vocabulary-multiple-choice.json
{
  "type": "multiple-choice",
  "content": {
    "question": "What is the {{LANGUAGE}} word for '{{ENGLISH_WORD}}'?",
    "options": [
      "{{CORRECT_ANSWER}}",
      "{{DISTRACTOR_1}}",
      "{{DISTRACTOR_2}}",
      "{{DISTRACTOR_3}}"
    ],
    "correctAnswer": 0
  },
  "explanation": "{{EXPLANATION}}",
  "hint": "{{HINT}}"
}
```

---

## 🚨 Common Content Mistakes

### ❌ DON'T

```json
// Vague question
"question": "What is it?"

// Obvious correct answer
"options": ["cat", "dog", "ELEPHANT!!!"]

// No explanation
"explanation": ""

// Revealing hint
"hint": "The answer is Paris"

// Inconsistent difficulty
// Task 1: Very easy
// Task 2: Extremely hard

// Too many tasks
"tasks": [ /* 50 tasks */ ]
```

### ✅ DO

```json
// Clear question
"question": "Which verb means 'to be' (permanent state) in Spanish?"

// Plausible options
"options": ["ser", "estar", "tener", "hacer"]

// Helpful explanation
"explanation": "Ser is used for permanent characteristics, estar for temporary states"

// Guiding hint
"hint": "Think about permanent vs temporary characteristics"

// Progressive difficulty
// Task 1-5: Easy
// Task 6-10: Medium
// Task 11-15: Hard

// Optimal length
"tasks": [ /* 15 tasks */ ]
```

---

## 🎯 Content Best Practices

### Pedagogical Principles

1. **Spaced repetition compatible**: Design for review
2. **Progressive complexity**: Build on previous knowledge
3. **Varied task types**: Engage different learning modes
4. **Clear feedback**: Explanations teach, not just confirm
5. **Appropriate hints**: Guide thinking, don't reveal

### Cognitive Load

- **Intrinsic load**: Match difficulty to level
- **Extraneous load**: Clear language, minimal clutter
- **Germane load**: Meaningful connections, deep processing

### Content Distribution

**Recommended Mix**:
- 40% Recognition (multiple-choice, true-false)
- 30% Application (cloze, matching, ordering)
- 20% Engagement (text-input, word-scramble)
- 10% Assessment (multiple-select, slider)

---

## 📊 Content Analytics

### Tracking Performance

```typescript
// Check task performance
const stats = await db.userProgress
  .where('taskId').equals('task-1')
  .toArray()

// Calculate success rate
const successRate = stats.filter(s => s.correct).length / stats.length
```

### Identifying Problem Tasks

- Success rate <50%: Too hard, unclear, or wrong answer
- Success rate >95%: Too easy or obvious
- High skip rate: Confusing or broken
- Long completion time: Complex or unclear

---

## 📚 Related Documentation

- **Parent Guide**: [../AGENTS.md](../AGENTS.md)
- **Task Types**: `../src/modules/core/types/services.ts`
- **JSON Loader**: `../src/modules/storage/json-loader.ts`
- **Templates**: `../data/templates/`

---

## 🎯 Agent Commands

```bash
# Create new learning path (interactive)
/new-learning-path {topic-id} {learning-path-id}

# Review learning path
/review-learning-path {topic-id}/{learning-path-id}

# Generate audio
npm run generate-audio

# Validate JSON
npx jsonlint public/learning-paths/**/*.json

# Test in browser
npm run dev
# Then click "🔄 DB Aktualisieren"
```

---

## 🔍 Content Validation

### Automated Checks

```typescript
// Validate learning path structure
function validateLearningPath(data: any): boolean {
  // Check required fields
  if (!data.learningPath || !data.tasks) return false

  // Check task count
  if (data.tasks.length < 5 || data.tasks.length > 25) return false

  // Check each task
  for (const task of data.tasks) {
    if (!task.id || !task.type || !task.content) return false
  }

  return true
}
```

### Manual Review Checklist

- [ ] All JSON files valid
- [ ] All tasks have unique IDs
- [ ] All referenced audio files exist
- [ ] No typos or grammar errors
- [ ] Explanations are helpful
- [ ] Hints don't reveal answers
- [ ] Difficulty progression is smooth
- [ ] Time estimate is realistic

---

**Maintained By**: content-designer, content-creator, content-reviewer
**Questions?**: See [../AGENTS.md](../AGENTS.md) or use `/review-learning-path` command
