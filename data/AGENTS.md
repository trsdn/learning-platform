# Data Templates Agent Guidelines

**Last Updated**: 2025-12-01
**Parent Guide**: [../AGENTS.md](../AGENTS.md)
**Status**: 🏆 **Authoritative Source** for data templates and task type schemas

> **For AI Agents**: This guide contains specific instructions for working with data templates, task type schemas, and JSON validation.

**Related Guides**: [public/AGENTS.md](../public/AGENTS.md) for learning content, [src/AGENTS.md](../src/AGENTS.md) for type definitions

---

## 🎯 Purpose

This guide provides data template guidelines for AI agents working with:

- Task type templates
- JSON schema validation
- Template creation and modification
- Task content structure
- Template versioning

---

## 📁 Directory Structure

```text
data/
└── templates/              # Task type templates
    ├── README.md          # Template documentation
    ├── cloze-deletion-basic.json
    ├── flashcard-basic.json
    ├── matching-basic.json
    ├── multiple-choice-basic.json
    ├── multiple-select-basic.json
    ├── ordering-basic.json
    ├── slider-basic.json
    ├── true-false-basic.json
    └── word-scramble-basic.json
```

**Note**: Templates in `public/templates/` are deprecated. Use `data/templates/` as the authoritative source.

---

## 📋 Template Structure

Each template file contains:

1. **Schema definition** - JSON structure for the task type
2. **Example content** - Real-world examples
3. **Validation rules** - Required fields and constraints
4. **Best practices** - Tips for creating effective tasks

### Template File Format

```json
{
  "taskType": "multiple-choice",
  "version": "1.0.0",
  "schema": {
    "question": {
      "type": "string",
      "required": true,
      "description": "The question to ask the learner"
    },
    "options": {
      "type": "array<string>",
      "required": true,
      "minLength": 2,
      "maxLength": 6,
      "description": "Array of answer options"
    },
    "correctAnswer": {
      "type": "number",
      "required": true,
      "min": 0,
      "description": "Index of the correct option (0-based)"
    }
  },
  "examples": [
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ],
  "bestPractices": [
    "Keep questions clear and concise",
    "Provide plausible distractors",
    "Avoid 'all of the above' options"
  ]
}
```

---

## 🎓 Task Type Templates

### 1. Multiple Choice (`multiple-choice-basic.json`)

**Purpose**: Single correct answer from multiple options

**Schema**:

```json
{
  "question": "string (required)",
  "options": "string[] (2-6 items, required)",
  "correctAnswer": "number (0-based index, required)",
  "explanation": "string (optional)",
  "hint": "string (optional)"
}
```

**Example**:

```json
{
  "type": "multiple-choice",
  "content": {
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correctAnswer": 1,
    "explanation": "Paris is the capital and largest city of France.",
    "hint": "Think of the Eiffel Tower."
  }
}
```

**Validation Rules**:

- ✅ Must have 2-6 options
- ✅ `correctAnswer` must be valid index (0 to options.length-1)
- ✅ All options must be unique
- ✅ Question must not be empty

---

### 2. Cloze Deletion (`cloze-deletion-basic.json`)

**Purpose**: Fill in missing words in a sentence

**Schema**:

```json
{
  "text": "string with {{placeholders}} (required)",
  "blanks": "array of blank objects (required)",
  "caseSensitive": "boolean (optional, default: false)"
}
```

**Blank Object**:

```json
{
  "id": "string (matches placeholder)",
  "correctAnswers": "string[] (at least one)",
  "caseSensitive": "boolean (optional)"
}
```

**Example**:

```json
{
  "type": "cloze-deletion",
  "content": {
    "text": "The capital of France is {{0}}.",
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

**Validation Rules**:

- ✅ Each `{{id}}` in text must have corresponding blank object
- ✅ Each blank must have at least one correct answer
- ✅ IDs must be unique
- ✅ No orphaned blank objects (without placeholder in text)

---

### 3. True/False (`true-false-basic.json`)

**Purpose**: Determine if a statement is true or false

**Schema**:

```json
{
  "statement": "string (required)",
  "correctAnswer": "boolean (required)",
  "explanation": "string (optional)"
}
```

**Example**:

```json
{
  "type": "true-false",
  "content": {
    "statement": "The Earth is flat.",
    "correctAnswer": false,
    "explanation": "The Earth is an oblate spheroid."
  }
}
```

**Validation Rules**:

- ✅ `correctAnswer` must be boolean (true or false)
- ✅ Statement must not be empty
- ✅ Avoid ambiguous statements

---

### 4. Ordering (`ordering-basic.json`)

**Purpose**: Arrange items in correct order

**Schema**:

```json
{
  "items": "string[] (required, 2-10 items)",
  "correctOrder": "number[] (0-based indices, required)"
}
```

**Example**:

```json
{
  "type": "ordering",
  "content": {
    "items": ["First", "Second", "Third"],
    "correctOrder": [0, 1, 2]
  }
}
```

**Validation Rules**:

- ✅ `correctOrder` must contain all indices from 0 to items.length-1
- ✅ No duplicate indices
- ✅ Must have 2-10 items
- ✅ Each index must be valid (0 to items.length-1)

---

### 5. Matching (`matching-basic.json`)

**Purpose**: Match pairs of related items

**Schema**:

```json
{
  "pairs": "array of pair objects (required, 2-8 pairs)"
}
```

**Pair Object**:

```json
{
  "left": "string (required)",
  "right": "string (required)"
}
```

**Example**:

```json
{
  "type": "matching",
  "content": {
    "pairs": [
      { "left": "Dog", "right": "Animal" },
      { "left": "Rose", "right": "Plant" },
      { "left": "Paris", "right": "City" }
    ]
  }
}
```

**Validation Rules**:

- ✅ Must have 2-8 pairs
- ✅ All `left` values must be unique
- ✅ All `right` values must be unique
- ✅ No empty strings

---

### 6. Multiple Select (`multiple-select-basic.json`)

**Purpose**: Select multiple correct answers

**Schema**:

```json
{
  "question": "string (required)",
  "options": "string[] (2-8 items, required)",
  "correctAnswers": "number[] (indices, required, at least 1)"
}
```

**Example**:

```json
{
  "type": "multiple-select",
  "content": {
    "question": "Select all prime numbers:",
    "options": ["2", "3", "4", "5", "6"],
    "correctAnswers": [0, 1, 3]
  }
}
```

**Validation Rules**:

- ✅ Must have 2-8 options
- ✅ `correctAnswers` must have at least 1 index
- ✅ All indices must be valid (0 to options.length-1)
- ✅ No duplicate indices
- ✅ At least one correct answer

---

### 7. Slider (`slider-basic.json`)

**Purpose**: Select a value on a continuous scale

**Schema**:

```json
{
  "question": "string (required)",
  "min": "number (required)",
  "max": "number (required)",
  "step": "number (optional, default: 1)",
  "correctValue": "number (required)",
  "tolerance": "number (optional, default: 0)"
}
```

**Example**:

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

**Validation Rules**:

- ✅ `min` < `max`
- ✅ `correctValue` must be between `min` and `max`
- ✅ `step` must be positive
- ✅ `tolerance` must be non-negative

---

### 8. Word Scramble (`word-scramble-basic.json`)

**Purpose**: Unscramble letters to form a word

**Schema**:

```json
{
  "scrambledWord": "string (required)",
  "correctWord": "string (required)",
  "hint": "string (optional)"
}
```

**Example**:

```json
{
  "type": "word-scramble",
  "content": {
    "scrambledWord": "OLELH",
    "correctWord": "HELLO",
    "hint": "A common greeting"
  }
}
```

**Validation Rules**:

- ✅ `scrambledWord` must contain same letters as `correctWord`
- ✅ `scrambledWord` must be different from `correctWord`
- ✅ Both must be non-empty
- ✅ Case-insensitive validation

---

### 9. Flashcard (`flashcard-basic.json`)

**Purpose**: Memorization with front/back cards

**Schema**:

```json
{
  "front": "string (required)",
  "back": "string (required)",
  "frontAudio": "string (optional, path to audio)",
  "backAudio": "string (optional, path to audio)"
}
```

**Example**:

```json
{
  "type": "flashcard",
  "content": {
    "front": "Buenos días",
    "back": "Good morning",
    "frontAudio": "/audio/spanish/buenos-dias.mp3",
    "backAudio": "/audio/english/good-morning.mp3"
  }
}
```

**Validation Rules**:

- ✅ Both `front` and `back` must be non-empty
- ✅ Audio paths must be valid if provided
- ✅ Audio files must exist in `public/audio/`

---

## 🔧 Creating New Templates

### Step 1: Define Schema

Create a new JSON file in `data/templates/`:

```json
{
  "taskType": "new-task-type",
  "version": "1.0.0",
  "schema": {
    "field1": {
      "type": "string",
      "required": true,
      "description": "Description of field1"
    }
  },
  "examples": [],
  "bestPractices": []
}
```

### Step 2: Add Type Definitions

Update `src/modules/core/types/services.ts`:

```typescript
// Add to TaskType union
export type TaskType = 
  | 'multiple-choice'
  | 'new-task-type' // Add here
  // ... other types

// Create content interface
export interface NewTaskTypeContent {
  field1: string
  field2?: number
}
```

### Step 3: Add Examples

Add at least 3 examples to the template file.

### Step 4: Document Best Practices

Add best practices for creating effective tasks of this type.

### Step 5: Update Documentation

Update [public/AGENTS.md](../public/AGENTS.md) with the new task type.

---

## ✅ Validation

### JSON Validation

```bash
# Validate JSON syntax
npx jsonlint data/templates/multiple-choice-basic.json

# Or use online validator
# https://jsonlint.com/
```

### Schema Validation

Each template should be validated against its schema before use:

```typescript
import { z } from 'zod'

const multipleChoiceSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional(),
  hint: z.string().optional()
})

// Validate content
try {
  multipleChoiceSchema.parse(content)
  console.log('Valid!')
} catch (error) {
  console.error('Validation failed:', error)
}
```

---

## 📊 Template Versioning

### Version Format

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to schema
- **MINOR**: New optional fields
- **PATCH**: Bug fixes, documentation updates

### Migration Strategy

When updating templates:

1. **Increment version** in template file
2. **Document changes** in `CHANGELOG.md`
3. **Provide migration guide** if breaking changes
4. **Support old versions** for backward compatibility

---

## 🚨 Common Mistakes

### ❌ DON'T

- Use inconsistent field names across task types
- Omit required fields
- Use invalid JSON syntax
- Create overly complex schemas
- Skip validation
- Hardcode values that should be configurable

### ✅ DO

- Follow existing naming conventions
- Provide clear descriptions
- Include multiple examples
- Document constraints
- Validate all templates
- Keep schemas simple and focused

---

## 🧪 Testing Templates

### Manual Testing

```bash
# 1. Create test learning path
cp data/templates/multiple-choice-basic.json \
   public/learning-paths/test/template-test.json

# 2. Start dev server
npm run dev

# 3. Test in browser
# Navigate to test learning path and verify task displays correctly
```

### Automated Validation

```typescript
// tests/unit/templates/template-validation.test.ts
import { describe, it, expect } from 'vitest'
import multipleChoiceTemplate from '@/data/templates/multiple-choice-basic.json'

describe('Template Validation', () => {
  it('should have valid schema', () => {
    expect(multipleChoiceTemplate).toHaveProperty('taskType')
    expect(multipleChoiceTemplate).toHaveProperty('version')
    expect(multipleChoiceTemplate).toHaveProperty('schema')
    expect(multipleChoiceTemplate).toHaveProperty('examples')
  })

  it('should have at least one example', () => {
    expect(multipleChoiceTemplate.examples.length).toBeGreaterThan(0)
  })
})
```

---

## 📚 Related Documentation

- **Main Guide**: [../AGENTS.md](../AGENTS.md) - Task types overview
- **Content Guide**: [../public/AGENTS.md](../public/AGENTS.md) - Authoritative task type specs
- **Type Definitions**: [../src/AGENTS.md](../src/AGENTS.md) - TypeScript types
- **New Task Type Guide**: [../docs/guides/new-task-type.md](../docs/guides/new-task-type.md) - Step-by-step guide

---

## 💡 Best Practices

### Template Design

1. **Keep it simple**: Avoid unnecessary complexity
2. **Be consistent**: Follow naming conventions
3. **Provide examples**: Real-world usage scenarios
4. **Document constraints**: Validation rules and limits
5. **Version properly**: Use semantic versioning

### Content Quality

1. **Clear instructions**: Learners should understand immediately
2. **Appropriate difficulty**: Match target audience
3. **Meaningful feedback**: Explanations help learning
4. **Helpful hints**: Guide without revealing answer
5. **Accessible**: Work with screen readers

### Validation

1. **Validate early**: Check schemas before deployment
2. **Test thoroughly**: Manual + automated testing
3. **Handle errors gracefully**: Provide clear error messages
4. **Document examples**: Show correct usage
5. **Maintain backward compatibility**: Support old versions

---

## 🔍 Troubleshooting

### Template Not Loading

**Problem**: Template file not recognized

**Solution**:

1. Check JSON syntax with validator
2. Verify file is in `data/templates/`
3. Ensure file name matches convention: `{type}-basic.json`
4. Check that `taskType` field matches filename

### Validation Errors

**Problem**: Content doesn't match schema

**Solution**:

1. Compare content against template schema
2. Check required fields are present
3. Verify data types match (string, number, boolean, array)
4. Ensure arrays have correct length (min/max)
5. Validate indices are within bounds

### Type Mismatches

**Problem**: TypeScript errors when using template

**Solution**:

1. Update types in `src/modules/core/types/services.ts`
2. Ensure template schema matches TypeScript interface
3. Run `npm run type-check` to verify
4. Rebuild project: `npm run build`

---

**Last Updated**: 2025-12-01
**Maintained by**: @trsdn
**Questions?**: See main [AGENTS.md](../AGENTS.md)
