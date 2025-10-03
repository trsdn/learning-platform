# AI Agent Development Guide

This document provides guidance for AI agents working on the MindForge Academy learning platform.

## 🎯 Project Overview

**MindForge Academy** is a TypeScript-based learning platform featuring:
- 8 different task/question types
- Spaced repetition algorithm (SM-2)
- Offline-first PWA architecture
- German language interface
- JSON-based content system

## 🏗️ Architecture

### Module Structure
```
src/modules/
├── core/           # Domain logic and business rules
│   ├── entities/   # Domain entity classes
│   ├── services/   # Business logic services
│   └── types/      # Type definitions
├── storage/        # Data persistence layer
│   ├── adapters/   # Repository implementations
│   ├── types/      # Storage interfaces
│   └── database.ts # Dexie.js IndexedDB setup
└── ui/             # React components and UI
    ├── components/ # React components
    └── types/      # UI-specific types
```

### Key Design Patterns
1. **Repository Pattern**: All data access through repositories
2. **Service Layer**: Business logic separated from UI
3. **Entity Classes**: Domain objects with validation
4. **Type Safety**: Strict TypeScript throughout

## 📋 Task Types System

The platform supports 8 task types, each with its own content interface:

### 1. Multiple Choice (`multiple-choice`)
```typescript
interface MultipleChoiceContent {
  question: string;
  options: string[];
  correctAnswer: number;  // Index of correct option
  explanation?: string;
  hint?: string;
}
```

### 2. Cloze Deletion (`cloze-deletion`)
```typescript
interface ClozeDeletionContent {
  text: string;  // Text with {{blank}} markers
  blanks: Array<{
    index: number;
    correctAnswer: string;
    alternatives?: string[];
  }>;
  explanation?: string;
  hint?: string;
}
```

### 3. True/False (`true-false`)
```typescript
interface TrueFalseContent {
  statement: string;
  correctAnswer: boolean;
  requireJustification?: boolean;
  explanation?: string;
  hint?: string;
}
```

### 4. Ordering (`ordering`)
```typescript
interface OrderingContent {
  question: string;
  items: string[];
  correctOrder: number[];  // Indices in correct order
  explanation?: string;
  hint?: string;
}
```

### 5. Matching (`matching`)
```typescript
interface MatchingContent {
  question: string;
  pairs: Array<{
    left: string;
    right: string;
  }>;
  explanation?: string;
  hint?: string;
}
```

### 6. Multiple Select (`multiple-select`)
```typescript
interface MultipleSelectContent {
  question: string;
  options: string[];
  correctAnswers: number[];  // Array of correct indices
  minRequired?: number;
  explanation?: string;
  hint?: string;
}
```

### 7. Slider (`slider`)
```typescript
interface SliderContent {
  question: string;
  min: number;
  max: number;
  step?: number;
  correctValue: number;
  tolerance?: number;  // ±tolerance for correct
  unit?: string;       // e.g., "°C", "%"
  explanation?: string;
  hint?: string;
}
```

### 8. Word Scramble (`word-scramble`)
```typescript
interface WordScrambleContent {
  question: string;
  scrambledWord: string;
  correctWord: string;
  showLength?: boolean;
  explanation?: string;
  hint?: string;
}
```

## 📁 Content Management

### Adding New Learning Paths

1. Create JSON file in `public/learning-paths/{topic}/`
2. Follow this structure:
```json
{
  "learningPath": {
    "id": "unique-id",
    "topicId": "mathematik",
    "title": "Path Title",
    "description": "Description",
    "difficulty": "easy|medium|hard",
    "estimatedTime": 30,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "requirements": {
      "minimumAccuracy": 60,
      "requiredTasks": 10
    }
  },
  "tasks": [
    {
      "id": "task-1",
      "learningPathId": "unique-id",
      "templateId": "multiple-choice-basic",
      "type": "multiple-choice",
      "content": { /* see type interfaces above */ },
      "metadata": {
        "difficulty": "easy",
        "tags": ["algebra", "basics"],
        "estimatedTime": 30,
        "points": 10
      }
    }
  ]
}
```

3. Register in `src/modules/storage/json-loader.ts`:
```typescript
const learningPathFiles: Record<string, string[]> = {
  mathematik: ['algebra-basics.json', 'your-new-file.json'],
  // ...
};
```

### Template Files

Each task type has a template schema in `data/templates/`:
- `multiple-choice-basic.json`
- `cloze-deletion-basic.json`
- `true-false-basic.json`
- `ordering-basic.json`
- `matching-basic.json`
- `multiple-select-basic.json`
- `slider-basic.json`
- `word-scramble-basic.json`

Templates define:
- Field requirements (required/optional)
- Validation rules (min/max, types)
- Examples
- Metadata structure

## 🔧 Development Guidelines

### Adding New Task Types

1. **Update Type Definitions** (`src/modules/core/types/services.ts`):
   - Add to `TaskType` union
   - Create content interface
   - Add to `Task.content` union

2. **Update PracticeSession Component** (`src/modules/ui/components/practice-session.tsx`):
   - Add state variables
   - Update `loadCurrentTask()` for initialization
   - Add validation in `handleAnswerSubmit()`
   - Update `canSubmit()` logic
   - Create render function (e.g., `renderNewType()`)
   - Update question header logic

3. **Create Template** (`data/templates/`):
   - Create `{type}-basic.json`
   - Define schema, examples, metadata

4. **Add Test Content** (`public/learning-paths/test/`):
   - Add examples to `all-task-types.json`

### Code Style

- **TypeScript**: Strict mode, explicit types
- **Naming**:
  - Components: PascalCase
  - Files: kebab-case
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
- **Imports**: Use path aliases (@core, @storage, @ui)
- **Comments**: JSDoc for public APIs

### Testing

```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests with Playwright
npm run build         # Production build (checks TypeScript)
```

## 🎨 UI Patterns

### Feedback System

After answer submission:
- ✅ Correct answers: Green (`#86efac` border, `#dcfce7` background)
- ❌ Wrong filled answers: Red (`#fca5a5` border, `#fee2e2` background)
- ⚪ Empty/unselected: Neutral gray (`#d1d5db` border, white background)

### Solution Display

Show correct answers in a box:
```jsx
{showFeedback && (
  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
    <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
      Richtige Antwort:
    </div>
    <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
      {/* Solution here */}
    </div>
  </div>
)}
```

## 🚀 Deployment

### Build Process
```bash
npm run build
```

Outputs to `dist/`:
- Minified JS/CSS bundles
- Service worker for PWA
- Manifest and assets

### GitHub Pages

1. Build creates production files
2. Deploy to `gh-pages` branch
3. Configure repository settings for Pages

## 🔍 Common Tasks

### Finding Code References
- Task type implementations: `practice-session.tsx` (search for `renderXXX()`)
- Type definitions: `src/modules/core/types/services.ts`
- Database schema: `src/modules/storage/database.ts`
- Content loading: `src/modules/storage/json-loader.ts`

### Debugging
- Check browser console for database logs
- IndexedDB viewer in DevTools → Application
- Network tab for JSON loading issues

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `src/main.tsx` | App entry point, routing logic |
| `src/modules/ui/components/practice-session.tsx` | Main learning interface (1000+ lines) |
| `src/modules/ui/components/dashboard.tsx` | Progress tracking UI |
| `src/modules/ui/components/session-results.tsx` | Session completion screen |
| `src/modules/core/types/services.ts` | All type definitions |
| `src/modules/storage/database.ts` | Dexie.js schema |
| `src/modules/storage/seed-data.ts` | Initial data loading |
| `public/learning-paths/**/*.json` | Content files |

## ⚠️ Important Notes

### Don't Break These:
- TypeScript strict mode compliance
- Existing task type interfaces
- Database schema (causes data loss)
- Service worker precache manifest

### Always Do:
- Add non-null assertions (`!`) carefully with confidence
- Test with "🔄 DB Aktualisieren" button after content changes
- Verify all 8 task types still work after changes
- Check TypeScript build (`npm run build`)

## 🤖 AI Agent Workflows

### Adding Educational Content
1. Identify topic and difficulty level
2. Choose appropriate task type(s)
3. Create JSON file following template
4. Add to json-loader.ts
5. Test with DB refresh button

### Fixing Bugs
1. Reproduce issue
2. Check console for errors
3. Find relevant component/service
4. Make minimal fix
5. Verify with `npm run build`

### Adding Features
1. Update types first
2. Implement in service layer
3. Connect to UI components
4. Add content examples
5. Update documentation

## 📖 Resources

- **SM-2 Algorithm**: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- **Dexie.js Docs**: https://dexie.org/
- **React TypeScript**: https://react-typescript-cheatsheet.netlify.app/
- **Vite**: https://vitejs.dev/guide/

---

**Last Updated**: 2025-09-30
**Platform Version**: 1.0.0
**Task Types**: 8