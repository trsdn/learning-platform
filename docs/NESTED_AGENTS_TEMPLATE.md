# Nested `AGENTS.md` Files – Structure & Rules

This document defines how **nested `AGENTS.md` files** (in subfolders like `src/`, `tests/`, `public/`, `templates/`, etc.) must be structured and which details they should contain.

These rules are intentionally **lightweight but consistent** so that any human or agent can open an `AGENTS.md` anywhere in the repo and very quickly understand:

- What this folder is responsible for
- How to work safely in this area
- Where to look next for deeper details

---

## 1. Purpose of Nested `AGENTS.md`

Each nested `AGENTS.md` answers three core questions:

1. **Scope** – What lives in *this* folder and what is it responsible for?
2. **Rules** – What are the important constraints, conventions, and “do / don’t” rules here?
3. **Navigation** – Where should I go next for more detail (other guides, docs, code entry points)?

If a file doesn’t add value on at least these three axes, it shouldn’t exist.

---

## 2. Mandatory Sections

Every nested `AGENTS.md` **must** contain the following top‑level sections, in this exact order and with these exact headings:

1. `# AI Agent Guide – <Folder Name>`
2. `## Scope`
3. `## Responsibilities`
4. `## Entry Points`
5. `## Conventions`
6. `## Do & Don’t`
7. `## Testing`
8. `## Related Guides`

Details for each section below.

### 2.1 Title: `# AI Agent Guide – <Folder Name>`

- Use a **human‑readable folder name** (not the full path).
- Examples:
  - `# AI Agent Guide – Core Types`
  - `# AI Agent Guide – UI Components`
  - `# AI Agent Guide – E2E Tests`

The title should make it obvious *which* area of the repo this file describes.

### 2.2 `## Scope`

Describe **what belongs in this folder** in 2–4 sentences:

- What kind of files live here (e.g., "React components for the practice session UI")?
- What problem domain it covers (e.g., "learning tasks", "database migrations")?
- What **does not** belong here (if commonly confused)?

### 2.3 `## Responsibilities`

Short bullet list (3–7 items) describing **what this folder is responsible for** in the overall architecture.

Typical content:

- High‑level responsibilities (e.g., "Define task type interfaces for all 8 task types").
- Couplings to other modules (e.g., "Consumed by `src/modules/ui/components/practice-session.tsx`").
- Any critical invariants (e.g., "No breaking changes to public types without updating tests").

### 2.4 `## Entry Points`

Point agents/humans to the **most important files** in this folder.

- List 3–10 key files or subfolders.
- For each, provide a 1‑line description.

Example:

- `services.ts` – Central type definitions for all task types and core services
- `practice-session.tsx` – Main practice session UI (1000+ lines, task rendering, SM‑2 integration)

### 2.5 `## Conventions`

Describe the **local rules and patterns** for this area:

- Naming conventions (files, components, tests)
- Folder structure patterns
- Technology choices specific to this folder
  - E.g. in UI folders: "Every component must have a matching `.module.css` file."
- TypeScript / typing rules specific to this layer
- Any performance or security constraints that are especially relevant here

Use bullets for readability. Keep it practical and concise.

### 2.6 `## Do & Don’t`

A compact **checklist of best practices and anti‑patterns** for this folder.

Split into two sub‑sections:

- `### Do`
- `### Don’t`

Each list: 3–10 bullets, action‑oriented.

Example:

```markdown
### Do
- Update type definitions in `services.ts` before touching UI components.
- Add or extend tests in `tests/unit/` when changing business logic.

### Don’t
- Introduce `any` types – use explicit interfaces.
- Change database schema from here; use `infrastructure/supabase` instead.
```

### 2.7 `## Testing`

Explain **how changes in this folder should be tested**:

- Which test suites are most relevant (unit, integration, e2e, visual)?
- Where the tests live (paths).
- Any required commands.

Example:

```markdown
- Unit tests: `tests/unit/ui/**/*.test.tsx`
- E2E flows: `tests/e2e/practice-session/*.spec.ts`
- Recommended commands:
  - `npm test`
  - `npm run test:e2e`
```

You do **not** need to duplicate the full global testing description – link to `tests/AGENTS.md` in `## Related Guides`.

### 2.8 `## Related Guides`

Link to **other documentation that is relevant** to this area:

- The top‑level `AGENTS.md`
- Area‑specific guides (e.g., `docs/css-modules.md`, `tests/AGENTS.md`, `data/AGENTS.md`)
- Architecture docs where appropriate

Example:

```markdown
- [Root AI Agent Guide](../AGENTS.md)
- [CSS Modules Guide](../docs/css-modules.md)
- [Testing Guide](../tests/AGENTS.md)
```

Paths can be absolute or relative – they just need to work from the nested file’s location.

---

## 3. Optional Sections

The following sections are **optional** and should only be added when they add clear value:

- `## Data Contracts` – For folders that define or consume JSON/DB schemas.
- `## Error Handling` – For areas with non‑trivial error/edge case logic.
- `## Performance Notes` – For hot paths where performance rules are important.
- `## Security Notes` – For anything touching authentication, authorization, or secrets.

If you add one of these, keep it short and concrete.

---

## 4. Agent & Command Usage

Nested `AGENTS.md` files should give **concrete guidance** on which agents and commands from `.claude/agents` and `.claude/commands` are relevant for this folder.

Add a subsection called `## Agent & Command Usage` (place it **before** `## Tone & Style Rules`) with these elements:

### 4.1 Referencing Agents (`.claude/agents`)

- Mention only the **agents that are actually useful** in this area.
- Use the exact agent names from `.claude/agents`.
- For each agent, add a short explanation of *when* to use it.

Example:

```markdown
## Agent & Command Usage

### Recommended agents
- `code-refactor` – For safe refactorings of TypeScript/React components in this folder.
- `test-specialist` – For creating or updating tests when changing logic here.

### When to prefer the root agent
- Use the **root GitHub Copilot agent** for cross-cutting changes that touch multiple folders (e.g. types + UI + tests).
```

If no specialized agent is needed, explicitly say so:

```markdown
### Recommended agents
- No specialized agents required here; the root GitHub Copilot agent is sufficient.
```

### 4.2 Referencing Commands (`.claude/commands`)

- Link or name only the **commands that are directly helpful** when working in this folder.
- Prefer commands that:
  - Scaffold common tasks (e.g. "create new task type")
  - Run focused tests (e.g. "run e2e tests for practice session")
  - Perform recurring maintenance (e.g. "regenerate learning paths index")

Example:

```markdown
### Helpful commands
- `run-unit-tests` – Run unit tests for this folder's domain.
- `update-learning-paths-index` – Regenerate the learning paths index after adding new content.
```

If no folder-specific commands exist, say so and point to the root docs:

```markdown
### Helpful commands
- No folder-specific commands. See root `AGENTS.md` and `.claude/commands` for global commands.
```

Keep this section **short and practical** – 3–5 bullets are usually enough.

---

## 5. Tone & Style Rules

- **Audience**: Human developers *and* AI agents.
- **Language**: English for `AGENTS.md` files (UI and content remain German).
- **Voice**: Concise, instructional, friendly.
- Avoid long essays – aim for **1–2 screens** of text per file.
- Prefer bullet lists over paragraphs where possible.

---

## 6. Example Skeleton

Use this as a starting point when creating a new nested `AGENTS.md`:

```markdown
# AI Agent Guide – <Folder Name>

## Scope
- Short description of what belongs in this folder.

## Responsibilities
- Bullet 1
- Bullet 2

## Entry Points
- `ImportantFile.ts` – What it does
- `Subfolder/` – What lives there

## Conventions

## Agent & Command Usage

### Recommended agents
- Which `.claude/agents` are most helpful here and when to use them.

### Helpful commands
- Which `.claude/commands` are relevant here and when to run them.
- Rule 1
- Rule 2

## Do & Don’t

### Do
- Helpful practice 1
- Helpful practice 2

### Don’t
- Anti‑pattern 1
- Anti‑pattern 2

## Testing
- How to test changes in this folder.
- Where the tests live.
- Recommended commands.

## Related Guides
- [Root AI Agent Guide](../AGENTS.md)
- [Other relevant guide](../docs/AGENTS.md)
```

---

## 6. When to Create a Nested `AGENTS.md`

Create a nested `AGENTS.md` when **both** of the following are true:

1. The folder represents a **meaningful domain / technical boundary** (e.g., `src/modules/core`, `tests/e2e`, `data/templates`).
2. There are **non‑obvious rules or workflows** that a newcomer (human or agent) must know to work safely.

Avoid creating `AGENTS.md` files for:

- Tiny folders with only 1–2 trivial files.
- Purely generated or vendor code.

---

## 7. Maintenance

When the structure or rules of a folder change:

1. **Update its `AGENTS.md` in the same PR.**
2. Keep examples and file paths in sync with the actual code.
3. If responsibilities move between folders, update both source and target guides.

If in doubt: **opt for clarity.** A slightly over‑documented `AGENTS.md` is better than an outdated or missing one.
