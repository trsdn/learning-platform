# AI Agent Development Guide

**Last Updated**: 2025-12-02 | **Platform**: MindForge Academy Learning Platform

## 🎯 Quick Start

**Target Users**: German Gymnasium students (ages 10-19), <100 concurrent users
**Tech Stack**: TypeScript 5.x + React 18.3 + Vite + Supabase PostgreSQL + CSS Modules + Storybook 8
**Core Features**: 8 task types, spaced repetition (SM-2), offline PWA, German UI

### Essential Commands

```bash
npm run dev        # Development server
npm run build      # Production build (validates TypeScript)
npm test           # Run tests
npm run storybook  # Component library (http://localhost:6006)
npm run deploy     # Deploy to GitHub Pages
```

---

## 🌍 Environment Configuration

This project uses **separate environments** for development and production:

| Environment | Supabase Project | Seeding | Deployment Trigger |
|-------------|-----------------|---------|-------------------|
| **Local** | Development | Manual | N/A |
| **CI/Preview** | Development | Automatic | PR / Push |
| **Production** | Production | NEVER | GitHub Release only |

### Key Points

- **Development database** is auto-seeded with test data
- **Production database** is NEVER seeded automatically
- **Preview deployments** (PRs) use dev Supabase - safe to test incomplete work
- **Production deployments** require a GitHub Release

### Environment Files

```
.env.local        → Local development (dev Supabase)
.env.development  → CI/Preview (dev Supabase)
.env.production   → Production (prod Supabase)
```

All `.env.*` files are encrypted with SOPS. Use `npm run secrets:decrypt` to decrypt.

### Deployment Workflow

```
Feature branch → PR → Preview (dev DB) → Merge → Create Release → Production (prod DB)
```

See [docs/guides/ENVIRONMENT_SETUP.md](./docs/guides/ENVIRONMENT_SETUP.md) for detailed setup.

---

## 🤖 Supported AI Agents

This repository supports two AI coding agents:

| Agent | Primary Use | Configuration | Trigger |
|-------|-------------|---------------|---------|
| **Claude** | Complex tasks, multi-file changes, PR reviews | `.claude/`, `CLAUDE.md` | `@claude` in issue/PR |
| **GitHub Copilot** | Issue implementation, code completion | `.github/copilot-instructions.md` | Copilot Workspace / Assignment |

**📖 Full Guide**: [docs/guides/AGENT_SWITCHING.md](./docs/guides/AGENT_SWITCHING.md)

### Quick Agent Selection

| Task Type | Recommended Agent |
|-----------|-------------------|
| Quick bug fix | GitHub Copilot |
| Complex refactoring | Claude |
| New learning content | Claude (content agents) |
| Test generation | GitHub Copilot |
| PR review | Claude (automatic) |
| Release management | Claude (`/create-release`) |

---

## 📍 Agent Guide Navigation

**Choose your path based on your task**:

| I need to... | Read this guide | Priority |
|--------------|----------------|----------|
| Switch between agents | [docs/guides/AGENT_SWITCHING.md](./docs/guides/AGENT_SWITCHING.md) | 🔴 Critical |
| Understand agent architecture | [.claude/AGENTS.md](./.claude/AGENTS.md) | 🔴 Critical |
| Create/modify components | [templates/AGENTS.md](./templates/AGENTS.md) | 🟡 High |
| Add/modify learning content | [public/AGENTS.md](./public/AGENTS.md) | 🟡 High |
| Run/create tests | [tests/AGENTS.md](./tests/AGENTS.md) | 🟡 High |
| Work with database | [infrastructure/supabase/AGENTS.md](./infrastructure/supabase/AGENTS.md) | 🟡 High |
| Develop UI components | See Storybook section below | 🟡 High |
| Run/create scripts | [scripts/AGENTS.md](./scripts/AGENTS.md) | 🟢 Medium |
| Update documentation | [docs/AGENTS.md](./docs/AGENTS.md) | 🟢 Medium |
| Understand source code | [src/AGENTS.md](./src/AGENTS.md) | 🔵 Reference |
| Work with data templates | [data/AGENTS.md](./data/AGENTS.md) | 🔵 Reference |

**Quick Decision Tree**:

- 🔄 Switching agents? → `docs/guides/AGENT_SWITCHING.md`
- 🤖 Working with AI agents? → `.claude/AGENTS.md`
- 📚 Creating learning content? → `public/AGENTS.md`
- 🧪 Running tests? → `tests/AGENTS.md`
- 🗄️ Database operations? → `infrastructure/supabase/AGENTS.md`
- 📝 Writing docs? → `docs/AGENTS.md`
- 🎨 Building UI? → `npm run storybook` + `templates/AGENTS.md`

---

## 📐 Architecture at a Glance

```txt
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

## 📖 Storybook (Component Development)

**All 33 components have stories** in `*.stories.tsx` files alongside their components.

### Commands

```bash
npm run storybook       # Start dev server at http://localhost:6006
npm run build-storybook # Build static site to storybook-static/
```

### Writing Stories

Stories live next to components:

```
src/modules/ui/components/
├── common/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── Button.stories.tsx  ← Story file
```

### Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Category/MyComponent',  // Sidebar path
  component: MyComponent,
  tags: ['autodocs'],             // Auto-generate docs
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { /* props */ },
};
```

### When to Use Storybook

- ✅ **Developing new components**: Build in isolation before integration
- ✅ **Testing visual states**: All variants (loading, error, empty, filled)
- ✅ **Dark mode verification**: Toggle via toolbar
- ✅ **Accessibility checks**: Built-in a11y addon
- ✅ **Component documentation**: Auto-generated from props

### Story Categories

| Category | Count | Path |
|----------|-------|------|
| Common | 6 | `common/*.stories.tsx` |
| Forms | 4 | `forms/*.stories.tsx` |
| Tasks | 10 | `practice/tasks/**/*.stories.tsx` |
| Session | 4 | `practice/session/*.stories.tsx` |
| Error | 3 | `error/*.stories.tsx` |
| Features | 6 | Various locations |

### Mock Data Pattern

Components using external services use mock implementations:

```tsx
// Mock for components that fetch data
const MockDashboard = ({ stats, isLoading }) => {
  // Render UI without real data fetching
};

export const Loading: Story = {
  render: () => <MockDashboard isLoading={true} />,
};
```

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

### Adding Features (TDD Approach)

**We follow Test-Driven Development (TDD)**. Write tests first, then implementation.

1. **Write failing tests** (`tests/unit/`, `tests/e2e/`)
2. Types (`src/modules/core/types/`)
3. Service layer (`src/modules/core/services/`)
4. UI components (`src/modules/ui/components/`)
5. **Verify tests pass**
6. Refactor if needed

**TDD Cycle**: Red → Green → Refactor

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

## 🧪 Testing & Artifacts

For comprehensive testing guidelines, see domain-specific guides:

- **Testing**: [tests/AGENTS.md](./tests/AGENTS.md) - Unit, E2E, visual testing, test artifacts
- **Artifacts**: Test artifacts managed in `tests/artifacts/` (gitignored)
- **Screenshots**: Agent screenshots in `.agent-workforce/screenshots/` (gitignored)

**Quick Rules**:

- ✅ Save screenshots to `.agent-workforce/screenshots/{category}/`
- ✅ Run `npm test` before committing
- ✅ Check `tests/AGENTS.md` for detailed testing procedures

---

## 📚 Domain-Specific Agent Guides

For specialized work in specific areas, consult these domain-specific guides:

| Domain | Guide | Purpose |
|--------|-------|---------|
| **Testing** | [tests/AGENTS.md](./tests/AGENTS.md) | Unit, E2E, visual testing, test artifacts |
| **Templates** | [templates/AGENTS.md](./templates/AGENTS.md) | Component templates, code scaffolding |
| **Database** | [supabase/AGENTS.md](./supabase/AGENTS.md) | Migrations, schema, RLS, seeding |
| **Documentation** | [docs/AGENTS.md](./docs/AGENTS.md) | Technical docs, screenshots, guides |
| **Content** | [public/AGENTS.md](./public/AGENTS.md) | Learning paths, tasks, audio |

**When to use domain guides**:

- ✅ Working extensively in that domain
- ✅ Need detailed rules for that area
- ✅ Creating new content/tests/docs
- ✅ Following domain-specific conventions

---

## 📚 Deep Dive References

- **Styling**: `docs/css-modules.md` (comprehensive CSS Modules guide)
- **Types**: `src/modules/core/types/services.ts` (all task type interfaces)
- **SM-2 Algorithm**: <https://www.supermemo.com/en/archives1990-2015/english/ol/sm2>
- **Dexie.js**: <https://dexie.org/>

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
