# AI Agent Guide – Source Code (`src/`)

## Scope

- Describes how source code under `src/` is structured and how modules relate to each other.
- Covers module boundaries, import conventions, file naming, and code organization patterns.
- Does **not** cover tests, scripts, or content JSON (see `tests/`, `scripts/`, and `public/` guides instead).

## Responsibilities

- Define and enforce the **source-level architecture** (core, storage, UI modules).
- Provide patterns for services, repositories, React components, and hooks.
- Describe and enforce TypeScript, import, and naming conventions for `src/`.
- Point to authoritative type definitions and key entry points.

## Entry Points

- `main.tsx` – React application entry point.
- `index.css` – Global styles imported by Vite entry.
- `modules/core/types/services.ts` – Authoritative type definitions for domain entities and task types.
- `modules/storage/database.ts` – IndexedDB database schema.
- `modules/ui/components/practice-session.tsx` – Main practice session UI (task rendering + SM‑2 logic).

## Conventions

- Use **strict TypeScript** – no `any`; prefer explicit interfaces and types.
- Use the `@/` alias for imports from `src/` instead of long relative paths.
- Organize code by **module** (`core`, `storage`, `ui`) and **concern** (entities, services, repositories, components, hooks, styles).
- Every React component in `modules/ui/components/` must have a matching `.module.css` file and (ideally) a unit test.
- Use CSS design tokens from `modules/ui/styles/variables.css`; avoid hard‑coded colors/sizes.
- Prefer barrel files (`index.ts`) for module exports where it improves clarity.

## Agent & Command Usage

### Recommended agents

- `platform-dev-orchestrator` – For multi-step changes that affect several modules (core + storage + UI).
- `component-library-architect` – When designing or refactoring shared UI components in `modules/ui/components/`.
- `unit-tester` – When you add or modify logic that must be covered by unit tests in `src/`.

### Helpful commands

- `/validate-implementation <issue-number>` – Run the full implementation validation workflow (build, lint, tests) for source changes.
- `/new-task-type <task-type-name>` – When introducing a brand‑new task type that affects types, services, and the practice session UI.
- `/deploy-test` – After major changes in `src/` to verify the test deployment.

## Do & Don’t

### Do

- Update `modules/core/types/services.ts` **first** when introducing or changing domain types.
- Keep module boundaries clear: domain logic in `core`, persistence in `storage`, UI in `ui`.
- Add or update unit tests in `tests/unit/` when modifying business logic or complex components.
- Use `clsx` for conditional class names in React components.
- Reuse existing patterns and utilities from `shared/` and `modules/**/hooks/`.

### Don’t

- Don’t introduce `any` or loosen TypeScript strictness to “make it compile”.
- Don’t access Supabase or external services directly from UI components – go through services/repositories.
- Don’t place new React components in the legacy `components/` root folder; prefer `modules/ui/components/`.
- Don’t change the database schema (`database.ts`) without coordinating with `infrastructure/supabase/AGENTS.md`.

## Testing

- Unit tests for source code live in `tests/unit/` (mirroring `src/modules/**` structure).
- Integration tests that touch multiple layers live in `tests/integration/`.
- E2E tests for critical flows (e.g., practice session) live in `tests/e2e/`.
- Recommended commands:
  - `npm test` – Run unit tests.
  - `npm run test:e2e` – Run Playwright end‑to‑end tests.
  - `npm run type-check` – Strict TypeScript validation for all source files.

## Related Guides

- [Root AI Agent Guide](../AGENTS.md)
- [Testing Agent Guidelines](../tests/AGENTS.md)
- [Template Management Agent Guidelines](../templates/AGENTS.md)

**Forbidden Dependencies** (❌ Not Allowed):

```text
Core → UI (business logic should not depend on UI)
Core → Storage (domain logic should not depend on persistence)
Storage → UI (data layer should not depend on UI)
```

---

## 🧪 Testing Organization

Tests should mirror source structure:

```text
src/modules/core/services/scoring-service.ts
tests/unit/core/services/scoring-service.test.ts

src/modules/ui/components/TopicCard.tsx
tests/unit/ui/components/TopicCard.test.tsx
```

See [tests/AGENTS.md](../tests/AGENTS.md) for detailed testing guidelines.

---

## 🎯 Common Patterns

### Adding a New Task Type

1. Update types in `src/modules/core/types/services.ts`
2. Update practice session UI in `src/modules/ui/components/practice-session.tsx`
3. Create template in `data/templates/{type}-basic.json`
4. Add test content in `public/learning-paths/test/`

See [../AGENTS.md](../AGENTS.md) for detailed workflow.

### Adding a New Component

1. Create directory: `src/modules/ui/components/ComponentName/`
2. Create files:
   - `ComponentName.tsx`
   - `ComponentName.module.css`
   - `ComponentName.test.tsx` (recommended)
   - `index.ts` (barrel export)
3. Use design tokens from `variables.css`
4. Write accessibility tests

See [templates/AGENTS.md](../templates/AGENTS.md) for templates.

### Adding a New Service

1. Create in `src/modules/core/services/`
2. Define types in `src/modules/core/types/services.ts`
3. Write unit tests in `tests/unit/core/services/`
4. Export from barrel file

---

## 💡 Best Practices

### Type Safety

```typescript
// ✅ DO: Explicit types
function calculateScore(answer: string, correct: string): number {
  return answer === correct ? 100 : 0
}

// ❌ DON'T: Implicit or any types
function calculateScore(answer, correct) {
  return answer === correct ? 100 : 0
}
```

### Component Composition

```typescript
// ✅ DO: Small, focused components
export function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className={styles.card}>
      <TopicIcon icon={topic.icon} />
      <TopicTitle title={topic.title} />
      <TopicDescription description={topic.description} />
    </div>
  )
}

// ❌ DON'T: Monolithic components
export function TopicCard() {
  // 500 lines of mixed logic and UI
}
```

### Dependency Injection

```typescript
// ✅ DO: Inject dependencies
export class TaskService {
  constructor(private repository: TaskRepository) {}

  async getTask(id: string): Promise<Task> {
    return await this.repository.findById(id)
  }
}

// ❌ DON'T: Hard-coded dependencies
export class TaskService {
  async getTask(id: string): Promise<Task> {
    return await db.tasks.get(id) // Direct database access
  }
}
```

---

## 🔍 Debugging Tips

### Module Not Found

**Error**: `Cannot find module '@/modules/...'`

**Solution**: Check `tsconfig.json` has path aliases configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Circular Dependencies

**Error**: `ReferenceError: Cannot access '...' before initialization`

**Solution**:

1. Check import order (types should be imported separately)
2. Use barrel exports to break cycles
3. Refactor to remove circular dependencies

### Type Errors

**Error**: `Type 'any' is not assignable to type '...'`

**Solution**: Always define proper types in `services.ts` first

---

## 📚 Related Documentation

- **Main Guide**: [../AGENTS.md](../AGENTS.md) - Architecture overview
- **Templates**: [../templates/AGENTS.md](../templates/AGENTS.md) - Component scaffolding
- **Tests**: [../tests/AGENTS.md](../tests/AGENTS.md) - Testing guidelines
- **CSS Modules**: [../docs/architecture/css-modules.md](../docs/architecture/css-modules.md) - Styling guide
- **Types**: `src/modules/core/types/services.ts` - Authoritative type definitions

---

**Last Updated**: 2025-12-01
**Maintained by**: @trsdn
**Questions?**: See main [AGENTS.md](../AGENTS.md)
