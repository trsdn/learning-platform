# AI Agent Development Guide

**Last Updated**: 2025-10-05 | **Platform**: MindForge Academy Learning Platform

## 🎯 Quick Start

**Target Users**: German Gymnasium students (ages 10-19), <100 concurrent users
**Tech Stack**: TypeScript 5.x + React 18.3 + Vite + IndexedDB (Dexie.js) + CSS Modules
**Core Features**: 8 task types, spaced repetition (SM-2), offline PWA, German UI

### Essential Commands
```bash
npm run dev      # Development server
npm run build    # Production build (validates TypeScript)
npm test         # Run tests
npm run deploy   # Deploy to GitHub Pages
```

---

## 📐 Architecture at a Glance

```
src/modules/
├── core/        # Domain logic, entities, services, types
├── storage/     # IndexedDB adapters, repositories, seed data
└── ui/          # React components (*.tsx + *.module.css), hooks, styles
```

**Patterns**: Repository pattern, service layer, strict TypeScript, offline-first

**Key Files**:
- Types: `src/modules/core/types/services.ts`
- Main UI: `src/modules/ui/components/practice-session.tsx` (1000+ lines)
- Database: `src/modules/storage/database.ts`
- Content loader: `src/modules/storage/json-loader.ts`

---

## 🎨 Styling Rules (CSS Modules)

**Mandatory**: Every component has a `.module.css` file. No inline styles, no Tailwind.

**Design tokens**: Use `src/modules/ui/styles/variables.css` (colors, spacing, typography)
**Class naming**: BEM-inspired kebab-case (`.button`, `.button--primary`, `.button__icon`)
**Conditional classes**: Use `clsx` helper
**Dynamic values**: Pass via CSS custom properties

**Details**: See `docs/css-modules.md` and reference implementation `TopicCard.tsx`

---

## ♿ Accessibility (WCAG 2.1 AA)

**Required**:
- Semantic HTML (`<button>` not `<div>`)
- Keyboard navigation
- Focus indicators (`:focus-visible`)
- ARIA labels where needed
- Color contrast: 4.5:1 (normal text), 3:1 (large text)

**Testing**: Use `jest-axe` (see `tests/unit/ui/components/TopicCard.a11y.test.tsx`)

---

## 📋 Task Types (8 Total)

Each type has unique content interface:

1. **multiple-choice**: `question`, `options[]`, `correctAnswer` (index)
2. **cloze-deletion**: `text` with `{{blank}}`, `blanks[]` with answers
3. **true-false**: `statement`, `correctAnswer` (boolean)
4. **ordering**: `items[]`, `correctOrder[]` (indices)
5. **matching**: `pairs[]` with `{left, right}`
6. **multiple-select**: `options[]`, `correctAnswers[]` (indices)
7. **slider**: `min`, `max`, `correctValue`, `tolerance`
8. **word-scramble**: `scrambledWord`, `correctWord`

**Full interfaces**: See `src/modules/core/types/services.ts`
**Templates**: `data/templates/{type}-basic.json` (schema + examples)

---

## 📁 Content Management

### Adding Learning Paths

1. **Create JSON**: `public/learning-paths/{topic}/{name}.json`
2. **Structure**:
   ```json
   {
     "learningPath": { "id": "...", "topicId": "...", "title": "..." },
     "tasks": [{ "id": "...", "type": "multiple-choice", "content": {...} }]
   }
   ```
3. **Register**: Add to `src/modules/storage/json-loader.ts` → `learningPathFiles` map
4. **Test**: Use "🔄 DB Aktualisieren" button in UI

**Example paths**: `public/learning-paths/test/all-task-types.json`

---

## 🛠️ Common Workflows

### Adding a New Task Type

1. Update `src/modules/core/types/services.ts`: Add to `TaskType` union, create content interface
2. Update `practice-session.tsx`: Add state, `loadCurrentTask()` logic, validation, render function
3. Create template: `data/templates/{type}-basic.json`
4. Add test content: `public/learning-paths/test/all-task-types.json`
5. Build & verify: `npm run build`

### Fixing Bugs

1. Reproduce issue → Check console
2. Find component/service (see Key Files above)
3. Make minimal fix
4. Verify: `npm run build` (TypeScript errors break prod)

### Adding Features

1. Types first (`src/modules/core/types/`)
2. Service layer (`src/modules/core/services/`)
3. UI components (`src/modules/ui/components/`)
4. Tests (`tests/unit/`, `tests/e2e/`)

---

## 🚨 Critical Rules

### Don't Break
- TypeScript strict mode
- Existing task type interfaces
- Database schema (causes data loss)
- Service worker precache

### Always Do
- Use design tokens from `variables.css`
- Test all 8 task types after changes
- Check `npm run build` before commit
- Use `clsx` for conditional CSS classes
- Add `jest-axe` tests for new components

---

## 📚 Deep Dive References

**Styling**: `docs/css-modules.md` (comprehensive CSS Modules guide)
**Types**: `src/modules/core/types/services.ts` (all task type interfaces)
**SM-2 Algorithm**: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
**Dexie.js**: https://dexie.org/

---

## 🎓 Learning Platform Specifics

**Target Audience**: Gymnasium students (grades 5-13, ages 10-19)
**Language**: German interface required
**Performance**: <3s initial load, <100ms interactions
**Deployment**: GitHub Pages (zero-cost static hosting)
**Storage**: IndexedDB for tasks/progress, LocalStorage for settings/audio prefs

---

**For exhaustive details, consult**:
- `docs/css-modules.md` (complete styling guide)
- `src/modules/core/types/services.ts` (authoritative type definitions)
