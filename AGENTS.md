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

```text
.env.local        → Local development (dev Supabase)
.env.development  → CI/Preview (dev Supabase)
.env.production   → Production (prod Supabase)
```

All `.env.*` files are encrypted with SOPS. Use `npm run secrets:decrypt` to decrypt.

### Deployment Workflow

```text
Feature branch → PR → Preview (dev DB) → Merge → Create Release → Production (prod DB)
```

See [docs/guides/ENVIRONMENT_SETUP.md](./docs/guides/ENVIRONMENT_SETUP.md) for detailed setup.

---

## 📍 Agent Guide Navigation

**Choose your path based on your task**:

| I need to... | Read this guide | Priority |
|--------------|----------------|----------|
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

- 🤖 Working with AI agents? → `.claude/AGENTS.md`
- 📚 Creating learning content? → `public/AGENTS.md`
- 🧪 Running tests? → `tests/AGENTS.md`
- 🗄️ Database operations? → `infrastructure/supabase/AGENTS.md`
- 📝 Writing docs? → `docs/AGENTS.md`
- 🎨 Building UI? → `npm run storybook` + `templates/AGENTS.md`

---

## 📐 Architecture at a Glance (High-Level)

**Nesting & Guides**

- Root guide: this file – when in doubt, start here.
- Nested guides: each major folder has an `AGENTS.md` following `docs/NESTED_AGENTS_TEMPLATE.md`:
  - `src/AGENTS.md` – Source code layout, imports, TypeScript conventions.
  - `tests/AGENTS.md` – Test types, structure, artifacts.
  - `public/AGENTS.md` – Learning paths, audio, static content.
  - `data/AGENTS.md` – Task type templates and schemas.
  - `scripts/AGENTS.md` – Automation, seeding, deployment helpers.
  - `infrastructure/supabase/AGENTS.md` – DB migrations + RLS.
  - `templates/AGENTS.md` – Component/code scaffolding.

Each nested guide owns the **domain details** for its folder. This root file stays at the “map of maps” level and doesn’t repeat them.

---

## 📖 Where to Find Domain Details

This root guide intentionally stays **high-level**. For concrete, domain‑specific rules use:

- Styling & components → `src/AGENTS.md` + `docs/css-modules.md`
- Storybook usage → `src/AGENTS.md` and Storybook itself (`npm run storybook`)
- Task type schemas → `data/AGENTS.md`
- Learning path JSON structure → `public/AGENTS.md`
- Testing rules & coverage → `tests/AGENTS.md`
- Database schema & RLS → `infrastructure/supabase/AGENTS.md`

Each of those nested guides applies the shared structure from `docs/NESTED_AGENTS_TEMPLATE.md` and owns its local details.

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
