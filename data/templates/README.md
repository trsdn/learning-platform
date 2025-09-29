# Task Templates

This directory contains JSON templates that define the structure of different task types in the learning platform.

## Available Templates

### multiple-choice-basic.json
Standard multiple choice questions with 2-6 answer options.

**Use cases:**
- Mathematics problems
- Science questions
- Language comprehension
- General knowledge

**Example:**
```json
{
  "question": "Was ist 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": 1,
  "explanation": "2 + 2 = 4"
}
```

## Creating New Templates

To create a new task template:

1. Create a JSON file with the template ID as the filename (e.g., `fill-in-blank.json`)
2. Include these fields:
   - `id`: Unique template identifier
   - `name`: Human-readable name
   - `description`: What the template is used for
   - `type`: Task type (multiple-choice, fill-in-blank, etc.)
   - `schema`: Field definitions with types and requirements
   - `metadata`: Additional metadata fields
   - `examples`: Sample usage

3. Register the template in `src/modules/core/services/task-template-service.ts`

## Template Schema

All templates must define:
- **Required fields**: Fields that must be present in every task
- **Optional fields**: Fields that can be omitted
- **Validation rules**: Type constraints, min/max values, etc.

## Future Templates

Planned templates for v2.0:
- `fill-in-blank`: Fill in missing words
- `true-false`: True/false questions
- `matching`: Match items between two lists
- `ordering`: Put items in correct order
- `short-answer`: Free text responses
- `code-challenge`: Programming exercises