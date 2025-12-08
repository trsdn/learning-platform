---
name: review-learning-path
description: Pedagogical review of a learning path for correctness, pacing, and accessibility.
argument-hint: "[filepath or topic-id/learning-path-id]"
agent: content-orchestrator
---
Review a learning path:
1) Load path JSON; check task mix vs 8 task types, difficulty progression, SM-2 compatibility.
2) Assess cognitive load, Bloom alignment, German UI language, and accessibility.
3) Check answers, hints, audio needs; note gaps against templates in `data/templates` and examples in `public/learning-paths`.
4) Output issues, fixes, and go/no-go; suggest next steps (content-reviewer/content-tester, then publish).
Reference `.claude/AGENTS.md`, `.claude/COMMANDS.md`, and repo AGENTS/instructions.
