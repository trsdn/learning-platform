---
name: new-learning-path
description: Create or extend a learning path with tasks, following pedagogy and task-type schemas.
argument-hint: "[topic-id] [learning-path-id]"
agent: content-orchestrator
---
Create or update a learning path:
1) Confirm topic-id and path-id; gather title, description, target grade, difficulty progression.
2) Plan task mix using the 8 task types (see `src/modules/core/types/services.ts`); ensure SM-2 compatibility and German UI.
3) Generate tasks with answers, hints, and audio needs; reference templates in `data/templates` and examples in `public/learning-paths`.
4) Validate pedagogy: difficulty ramp, cognitive load, Bloom levels, accessibility.
5) Output: JSON ready for `public/learning-paths/{topic}/{id}.json` and update map in `src/modules/storage/json-loader.ts` if needed.
Consult `.claude/AGENTS.md`, `.claude/COMMANDS.md`, and repository AGENTS.md files for domain rules.
