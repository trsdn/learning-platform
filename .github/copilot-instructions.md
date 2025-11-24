# GitHub Copilot Instructions - MindForge Academy Learning Platform

**Last Updated**: 2024-11-24 | **For**: GitHub Copilot Coding Agent

## 🎯 Repository Overview

**Purpose**: Offline-first learning platform for German Gymnasium students (ages 10-19)  
**Tech Stack**: TypeScript 5.x + React 18.3 + Vite + IndexedDB (Dexie.js) + CSS Modules  
**Core Features**: 8 task types, spaced repetition (SM-2), offline PWA, German UI  
**Target Scale**: <100 concurrent users  
**Deployment**: GitHub Pages (static hosting)

## 🏗️ Architecture

### Directory Structure
```
src/modules/
├── core/        # Domain logic, entities, services, types
├── storage/     # IndexedDB adapters, repositories, seed data
└── ui/          # React components (*.tsx + *.module.css), hooks, styles

tests/
├── unit/        # Unit tests
├── integration/ # Integration tests
├── contract/    # Contract tests
└── e2e/        # End-to-end tests (Playwright)

public/learning-paths/  # JSON content files
data/templates/         # Task type schemas
docs/                   # Documentation
```

### Key Patterns
- **Repository pattern** for data access
- **Service layer** for business logic
- **Strict TypeScript** throughout (no `any` types)
- **Offline-first** with IndexedDB + Service Workers
- **CSS Modules** for styling (mandatory)

### Critical Files
- `src/modules/core/types/services.ts` - Type definitions (authoritative source)
- `src/modules/ui/components/practice-session.tsx` - Main UI (1000+ lines)
- `src/modules/storage/database.ts` - Database schema
- `src/modules/storage/json-loader.ts` - Content loader
- `src/modules/ui/styles/variables.css` - Design tokens

## 🔨 Development Workflow

### Essential Commands
```bash
npm install           # Install dependencies
npm run dev          # Development server (http://localhost:5173)
npm run build        # Production build (validates TypeScript)
npm test             # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier formatting
npm run type-check   # TypeScript type checking
```

### Before Making Changes
1. **Always** run `npm install` first
2. **Always** run `npm run build` to check current state
3. **Always** run `npm test` to understand baseline test results
4. **Never** assume the build is clean - verify first

### Testing Requirements
- **Unit tests**: Required for business logic, services, utilities
- **E2E tests**: Required for critical user flows
- **Coverage**: Minimum 80% for business logic
- **Accessibility**: Use `jest-axe` for new components
- **Test framework**: Vitest (unit), Playwright (E2E)

### Build & Validation
```bash
# Full validation before committing
npm run type-check && npm run lint && npm test && npm run build
```

## 📝 Code Style & Standards

### TypeScript Rules
- **Strict mode** enabled (no `any` types)
- **Explicit types** for function parameters and returns
- **No implicit any** - use `unknown` if necessary
- **Interfaces** for object shapes
- **Type guards** for runtime checks

**Good Example**:
```typescript
interface TaskContent {
  question: string;
  answer: string;
}

function validateTask(content: TaskContent): boolean {
  return content.question.length > 0 && content.answer.length > 0;
}
```

**Bad Example**:
```typescript
function validateTask(content: any) {  // ❌ Never use 'any'
  return content.question.length > 0;
}
```

### CSS Modules (MANDATORY)
Every component **must** have a `.module.css` file. No inline styles, no Tailwind.

**File Structure**:
```
Button.tsx
Button.module.css  ← REQUIRED
Button.test.tsx
```

**Design Tokens**: Always use `src/modules/ui/styles/variables.css`
```css
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}
```

**Class Naming**: BEM-inspired kebab-case
```css
.card { }                /* Element */
.card--highlighted { }   /* Modifier */
.card__header { }        /* Child */
```

**Conditional Classes**: Use `clsx` helper
```tsx
import clsx from 'clsx';

<button className={clsx(
  styles.button,
  isPrimary && styles['button--primary'],
  isDisabled && styles['button--disabled']
)}>
```

**Dynamic Values**: Use CSS custom properties
```tsx
<div
  className={styles.progressBar}
  style={{
    '--progress-percentage': `${percentage}%`,
  } as React.CSSProperties}
/>
```

**Reference**: See `docs/css-modules.md` for comprehensive guide

### Naming Conventions
- **Components**: PascalCase (`TaskCard`, `PracticeSession`)
- **Files**: kebab-case (`task-card.tsx`, `practice-session.tsx`)
- **Functions**: camelCase (`loadTask`, `validateAnswer`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`TaskType`, `UserProgress`)

### File Organization
```typescript
// 1. Imports (external, then internal)
import React, { useState } from 'react';
import { TaskType } from '@core/types/services';
import styles from './Component.module.css';

// 2. Types/Interfaces
interface Props {
  taskId: string;
}

// 3. Constants
const MAX_ATTEMPTS = 3;

// 4. Component/Function
export function Component({ taskId }: Props) {
  // Implementation
}
```

## ♿ Accessibility (WCAG 2.1 AA)

**Required**:
- Semantic HTML (`<button>` not `<div>` for clickable elements)
- Keyboard navigation support
- Focus indicators (`:focus-visible`)
- ARIA labels where needed
- Color contrast: 4.5:1 (normal text), 3:1 (large text)

**Testing**: Use `jest-axe` (see `tests/unit/ui/components/TopicCard.a11y.test.tsx`)

## 📋 Task Types (8 Total)

Each task type has a unique content interface defined in `src/modules/core/types/services.ts`:

1. **multiple-choice**: `question`, `options[]`, `correctAnswer` (index)
2. **cloze-deletion**: `text` with `{{blank}}`, `blanks[]` with answers
3. **true-false**: `statement`, `correctAnswer` (boolean)
4. **ordering**: `items[]`, `correctOrder[]` (indices)
5. **matching**: `pairs[]` with `{left, right}`
6. **multiple-select**: `options[]`, `correctAnswers[]` (indices)
7. **slider**: `min`, `max`, `correctValue`, `tolerance`
8. **word-scramble**: `scrambledWord`, `correctWord`

**Important**: When modifying task types:
1. Update type definitions in `src/modules/core/types/services.ts` first
2. Update `practice-session.tsx` component logic
3. Create/update template in `data/templates/{type}-basic.json`
4. Add test content in `public/learning-paths/test/all-task-types.json`
5. Run `npm run build` to validate TypeScript
6. Test all 8 task types in the UI

## 📁 Content Management

### Adding Learning Paths

1. **Create JSON**: `public/learning-paths/{topic}/{name}.json`
2. **Structure**:
```json
{
  "learningPath": {
    "id": "unique-id",
    "topicId": "topic-slug",
    "title": "Path Title"
  },
  "tasks": [
    {
      "id": "task-1",
      "type": "multiple-choice",
      "content": { /* task-specific content */ }
    }
  ]
}
```
3. **Register**: Add to `src/modules/storage/json-loader.ts` → `learningPathFiles` map
4. **Test**: Use "🔄 DB Aktualisieren" button in UI

**Example**: `public/learning-paths/test/all-task-types.json`

## 🚀 Deployment

### GitHub Pages (Production)
- **URL**: https://trsdn.github.io/learning-platform/
- **Method**: GitHub Actions workflow (`actions/deploy-pages`)
- **Command**: `gh workflow run deploy.yml -f confirm=deploy-production`

**IMPORTANT**: 
- DO NOT push to `gh-pages` branch manually
- DO NOT use `npm run deploy` directly
- Use GitHub Actions workflow only

### Test Environment
- **URL**: https://trsdn.github.io/learning-platform/test/
- **Command**: `/deploy-test` or `npm run deploy:test`
- **Database**: Uses separate `mindforge-academy-test` database

## 🔒 Security & Privacy

### DO NOT:
- Commit secrets, API keys, or credentials
- Hardcode passwords or tokens
- Share sensitive data with 3rd party systems
- Introduce security vulnerabilities

### DO:
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize data before storage
- Follow OWASP best practices

## 🚫 Boundaries - DO NOT MODIFY

### Protected Areas
- `.github/agents/` directory (instructions for other agents)
- Service worker precache manifest (auto-generated)
- Existing task type interfaces (breaking change)
- Database schema (causes data loss)

### Protected Files (Modify Only If Essential)
- `vite.config.ts` (build configuration)
- `tsconfig.json` (TypeScript configuration)
- `package.json` dependencies (unless required for feature)

## 🎯 Common Workflows

### Adding a New Task Type
1. Update `src/modules/core/types/services.ts` (add to `TaskType` union, create content interface)
2. Update `practice-session.tsx`:
   - Add state management
   - Add `loadCurrentTask()` logic
   - Add validation function
   - Add render function
3. Create template: `data/templates/{type}-basic.json`
4. Add test content: `public/learning-paths/test/all-task-types.json`
5. Test: `npm run build && npm run dev`

### Fixing Bugs
1. Reproduce issue → Check console errors
2. Find relevant component/service (see Key Files)
3. Make minimal fix
4. Add/update tests
5. Verify: `npm run build && npm test`

### Adding Features
1. Types first (`src/modules/core/types/`)
2. Service layer (`src/modules/core/services/`)
3. UI components (`src/modules/ui/components/`)
4. Tests (`tests/unit/`, `tests/e2e/`)
5. Documentation updates

### Refactoring
1. Ensure tests pass first
2. Make changes while keeping tests green
3. Run `npm run build && npm test` frequently
4. No behavior changes - only code improvements

## 📚 Documentation

### Key Docs
- `README.md` - Project overview, quick start
- `CONTRIBUTING.md` - Contribution guidelines, commit format
- `AGENTS.md` - AI agent development guide (comprehensive)
- `docs/css-modules.md` - Complete CSS Modules guide
- `docs/DEPLOYMENT.md` - Deployment procedures
- `docs/NEW_TASK_TYPE_GUIDE.md` - Task type creation guide

### When to Update Docs
- New features or task types
- API/interface changes
- Build/deployment process changes
- Breaking changes (always)

## 🐛 Debugging

### Build Errors
- Check `npm run type-check` for TypeScript errors
- Review imports and type definitions
- Verify all dependencies installed

### Test Failures
- Run `npm test -- --reporter=verbose` for detailed output
- Check test file paths and imports
- Verify mock data matches interfaces

### UI Issues
- Check browser console for errors
- Verify CSS Modules imported correctly
- Test in development mode: `npm run dev`
- Use React DevTools for component inspection

## 💡 Tips

### Do
- Make minimal, focused changes
- Test early and often
- Use existing patterns and conventions
- Follow TDD when possible
- Check existing code for examples
- Use design tokens from `variables.css`
- Run `clsx` for conditional CSS classes
- Add `jest-axe` tests for new components

### Don't
- Make sweeping changes without tests
- Modify unrelated code
- Add unnecessary dependencies
- Use inline styles (except CSS custom properties)
- Use `any` type in TypeScript
- Skip building/testing before commit
- Remove working code unless necessary
- Change file structure without discussion

## 🔄 Spaced Repetition (SM-2 Algorithm)

The platform uses the SM-2 algorithm for optimal learning retention:
- Initial interval: 1 day
- Second interval: 6 days
- Subsequent: `interval × efactor`
- Maximum interval: 365 days
- Efactor range: 1.3 - 2.5

**Reference**: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📊 Performance Targets

- Initial load: <3 seconds
- Interactions: <100ms
- Bundle size: <300KB total
- IndexedDB operations: <50ms

## 🎓 Language & Content

- **Primary Language**: German (full interface and content)
- **UI Labels**: All in German
- **Error Messages**: German
- **Content**: Organized by topic (Mathematik, Biologie, etc.)

## 📦 Dependencies

### Core Dependencies
- React 18.3 - UI framework
- TypeScript 5.x - Type safety
- Vite - Build tool
- Dexie.js - IndexedDB wrapper
- Workbox - PWA/Service workers
- react-i18next - Internationalization

### Development Dependencies
- Vitest - Unit testing
- Playwright - E2E testing
- ESLint - Linting
- Prettier - Code formatting

**When adding dependencies**:
1. Check if existing library can be used
2. Evaluate bundle size impact
3. Verify TypeScript support
4. Update package.json with specific version
5. Run `npm install` and test

## ✅ Definition of Done

Before marking a task complete:
- [ ] Code follows style guidelines
- [ ] TypeScript strict mode passes
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Accessibility tested (if UI changes)
- [ ] Documentation updated (if needed)
- [ ] Tested in browser (manual verification)
- [ ] No console errors/warnings

---

**Maintained by**: @trsdn  
**License**: MIT  
**Last Review**: 2024-11-24
