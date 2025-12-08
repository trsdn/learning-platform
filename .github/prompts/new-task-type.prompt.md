---
name: new-task-type
description: Implement a new task type end-to-end with types, UI, templates, and tests.
argument-hint: "[task-type-name]"
agent: platform-orchestrator
---
Implement a new task type:
1) Define/extend types in `src/modules/core/types/services.ts` (authoritative). Maintain strict TS, no `any`.
2) Update practice session UI (`src/modules/ui/components/practice-session.tsx`) and any related services/repositories.
3) Add template `data/templates/{type}-basic.json` and test content in `public/learning-paths/test/all-task-types.json`.
4) Add/adjust tests (unit/integration/E2E; include jest-axe for UI). Use CSS Modules and design tokens.
5) Run `/validate-implementation`; summarize results and blockers.
Reference `.claude/AGENTS.md`, `.claude/COMMANDS.md`, and repo AGENTS/instructions.
