# Source Code Organization Agent Guidelines

**Last Updated**: 2025-12-01
**Parent Guide**: [../AGENTS.md](../AGENTS.md)
**Status**: 🏆 **Authoritative Source** for source code structure and conventions

> **For AI Agents**: This guide contains specific instructions for working with the source code structure, module organization, and coding conventions.

**Related Guides**: [templates/AGENTS.md](../templates/AGENTS.md) for component scaffolding, [tests/AGENTS.md](../tests/AGENTS.md) for test organization

---

## 🎯 Purpose

This guide provides source code organization guidelines for AI agents working with:

- Module structure and organization
- Import conventions
- File naming rules
- Code organization patterns
- Dependency management

---

## 📁 Directory Structure

```text
src/
├── main.tsx              # Application entry point
├── index.css             # Global styles
├── vite-env.d.ts         # Vite type definitions
├── components/           # Deprecated - being migrated to modules/ui
├── hooks/                # Shared React hooks
├── modules/              # Core application modules
│   ├── core/            # Domain logic, entities, services
│   │   ├── entities/    # Domain entities
│   │   ├── services/    # Business logic services
│   │   └── types/       # TypeScript type definitions
│   ├── storage/         # Data persistence layer
│   │   ├── adapters/    # IndexedDB adapters
│   │   ├── repositories/ # Repository pattern implementations
│   │   └── seed/        # Seed data
│   └── ui/              # User interface components
│       ├── components/  # React components (*.tsx + *.module.css)
│       ├── hooks/       # UI-specific hooks
│       └── styles/      # Shared styles, design tokens
├── shared/              # Shared utilities across modules
└── test/                # Test utilities and mocks
```

---

## 🏗️ Module Architecture

### Core Module (`src/modules/core/`)

**Purpose**: Domain logic, business rules, and type definitions

**Structure**:

```text
core/
├── entities/          # Domain entities (Task, Topic, LearningPath)
├── services/          # Business logic (spaced repetition, scoring)
└── types/            # TypeScript definitions
    └── services.ts   # Authoritative type definitions
```

**Key File**: `src/modules/core/types/services.ts`

- ✅ **Authoritative source** for all type definitions
- ✅ Always update types here first
- ✅ Export from barrel file (`index.ts`)

**Example Entity**:

```typescript
// src/modules/core/entities/task.ts
import type { Task, TaskType } from '@/modules/core/types/services'

export class TaskEntity {
  constructor(private task: Task) {}

  isComplete(): boolean {
    return this.task.lastReviewDate !== null
  }

  getType(): TaskType {
    return this.task.type
  }
}
```

**Example Service**:

```typescript
// src/modules/core/services/spaced-repetition.ts
import type { UserProgress } from '@/modules/core/types/services'

export class SpacedRepetitionService {
  calculateNextReview(progress: UserProgress): Date {
    // SM-2 algorithm implementation
  }
}
```

---

### Storage Module (`src/modules/storage/`)

**Purpose**: Data persistence, database operations, repositories

**Structure**:

```text
storage/
├── adapters/          # IndexedDB adapters
│   └── dexie-adapter.ts
├── repositories/      # Repository pattern
│   ├── topic-repository.ts
│   ├── learning-path-repository.ts
│   └── task-repository.ts
├── seed/             # Seed data
│   └── initial-data.ts
├── database.ts       # Dexie database schema
└── json-loader.ts    # JSON content loader
```

**Repository Pattern**:

```typescript
// src/modules/storage/repositories/topic-repository.ts
import { db } from '../database'
import type { Topic } from '@/modules/core/types/services'

export class TopicRepository {
  async findAll(): Promise<Topic[]> {
    return await db.topics.toArray()
  }

  async findById(id: string): Promise<Topic | undefined> {
    return await db.topics.get(id)
  }

  async create(topic: Topic): Promise<string> {
    return await db.topics.add(topic)
  }

  async update(id: string, topic: Partial<Topic>): Promise<void> {
    await db.topics.update(id, topic)
  }

  async delete(id: string): Promise<void> {
    await db.topics.delete(id)
  }
}
```

**Database Schema** (`database.ts`):

```typescript
import Dexie, { type Table } from 'dexie'
import type { Topic, LearningPath, Task } from '@/modules/core/types/services'

export class AppDatabase extends Dexie {
  topics!: Table<Topic>
  learningPaths!: Table<LearningPath>
  tasks!: Table<Task>

  constructor() {
    super('mindforge-academy')
    this.version(1).stores({
      topics: 'id, name',
      learningPaths: 'id, topicId, title',
      tasks: 'id, learningPathId, type'
    })
  }
}

export const db = new AppDatabase()
```

---

### UI Module (`src/modules/ui/`)

**Purpose**: React components, UI logic, styles

**Structure**:

```text
ui/
├── components/        # React components
│   ├── practice-session.tsx         # Main practice UI
│   ├── practice-session.module.css
│   ├── topic-card.tsx
│   ├── topic-card.module.css
│   └── ...
├── hooks/            # UI-specific hooks
│   ├── use-spaced-repetition.ts
│   └── use-task-state.ts
└── styles/           # Shared styles
    ├── variables.css  # Design tokens (AUTHORITATIVE)
    └── global.css
```

**Component Structure** (Mandatory):

Every component MUST have:

1. `ComponentName.tsx` - Component logic
2. `ComponentName.module.css` - Styles (CSS Modules)
3. `ComponentName.test.tsx` - Unit tests (optional but recommended)

**Component Example**:

```typescript
// src/modules/ui/components/topic-card.tsx
import { clsx } from 'clsx'
import styles from './topic-card.module.css'
import type { Topic } from '@/modules/core/types/services'

export interface TopicCardProps {
  topic: Topic
  onClick?: () => void
  className?: string
}

export function TopicCard({ topic, onClick, className }: TopicCardProps) {
  return (
    <div 
      className={clsx(styles.card, className)} 
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.icon}>{topic.icon}</div>
      <h3 className={styles.title}>{topic.title}</h3>
      <p className={styles.description}>{topic.description}</p>
    </div>
  )
}
```

**CSS Module Example**:

```css
/* src/modules/ui/components/topic-card.module.css */
.card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.card:hover {
  background-color: var(--color-surface-hover);
  transform: translateY(-2px);
}

.card:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.icon {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-sm);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

---

## 📝 File Naming Conventions

### TypeScript/React Files

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `TopicCard.tsx` |
| **Hooks** | camelCase with `use-` prefix | `use-spaced-repetition.ts` |
| **Services** | kebab-case | `spaced-repetition-service.ts` |
| **Repositories** | kebab-case with `-repository` suffix | `topic-repository.ts` |
| **Types** | kebab-case or `types.ts` | `services.ts`, `database.types.ts` |
| **Utilities** | kebab-case | `date-utils.ts`, `string-helpers.ts` |
| **Tests** | Same as source + `.test.ts(x)` | `TopicCard.test.tsx` |
| **CSS Modules** | Same as component + `.module.css` | `TopicCard.module.css` |

### Directories

- **Lowercase with hyphens**: `learning-paths/`, `user-progress/`
- **No underscores**: Use hyphens instead
- **Plural for collections**: `components/`, `services/`, `hooks/`

---

## 📦 Import Conventions

### Path Aliases

Use `@/` alias for absolute imports from `src/`:

```typescript
// ✅ DO: Use path alias
import { Task } from '@/modules/core/types/services'
import { TopicRepository } from '@/modules/storage/repositories/topic-repository'

// ❌ DON'T: Use relative paths for cross-module imports
import { Task } from '../../core/types/services'
```

### Import Order

```typescript
// 1. External dependencies (React, libraries)
import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import Dexie from 'dexie'

// 2. Internal modules - types first
import type { Task, Topic } from '@/modules/core/types/services'

// 3. Internal modules - services/repositories
import { SpacedRepetitionService } from '@/modules/core/services/spaced-repetition'
import { TopicRepository } from '@/modules/storage/repositories/topic-repository'

// 4. Internal modules - components
import { TopicCard } from '@/modules/ui/components/topic-card'

// 5. Styles (always last)
import styles from './Component.module.css'
```

### Barrel Exports

Each module should have an `index.ts` for cleaner imports:

```typescript
// src/modules/core/types/index.ts
export * from './services'
export * from './database.types'

// Usage:
import { Task, Topic } from '@/modules/core/types'
```

---

## 🔧 Code Organization Patterns

### Service Pattern

**When to use**: Business logic, calculations, algorithms

```typescript
// src/modules/core/services/scoring-service.ts
export class ScoringService {
  calculateScore(userAnswer: string, correctAnswer: string): number {
    // Scoring logic
  }

  calculateAccuracy(correct: number, total: number): number {
    return (correct / total) * 100
  }
}
```

### Repository Pattern

**When to use**: Database operations, data access

```typescript
// src/modules/storage/repositories/task-repository.ts
export class TaskRepository {
  async findByLearningPath(pathId: string): Promise<Task[]> {
    return await db.tasks.where('learningPathId').equals(pathId).toArray()
  }
}
```

### Custom Hooks

**When to use**: Reusable React stateful logic

```typescript
// src/modules/ui/hooks/use-task-state.ts
export function useTaskState(taskId: string) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load task logic
  }, [taskId])

  return { task, loading }
}
```

---

## 🚨 Critical Rules

### DO

- ✅ Use **TypeScript strict mode** (no `any` types)
- ✅ Define types in `src/modules/core/types/services.ts` first
- ✅ Use **CSS Modules** for all component styles
- ✅ Use **path aliases** (`@/`) for absolute imports
- ✅ Follow **repository pattern** for data access
- ✅ Export from barrel files (`index.ts`)
- ✅ Use **design tokens** from `variables.css`
- ✅ Write **unit tests** for business logic

### DON'T

- ❌ Use `any` type (use `unknown` if necessary)
- ❌ Use inline styles (except CSS custom properties)
- ❌ Mix business logic with UI components
- ❌ Access database directly from components (use repositories)
- ❌ Create circular dependencies
- ❌ Hardcode values (use constants or config)
- ❌ Skip type definitions

---

## 🔄 Migration Notes

### Deprecated Paths

**Old**: `src/components/` → **New**: `src/modules/ui/components/`

**Status**: Migrating incrementally. New components should go to `src/modules/ui/components/`.

**Old**: Inline type definitions → **New**: `src/modules/core/types/services.ts`

**Status**: All type definitions should be centralized.

---

## 📊 Module Dependencies

**Dependency Flow** (✅ Allowed):

```text
UI → Storage → Core
UI → Core
Storage → Core
```

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
