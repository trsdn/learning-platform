---
name: validate-implementation
description: Run full validation for a change (types, lint, tests, build) and summarize results.
argument-hint: "[issue-number]"
agent: platform-orchestrator
---
Run a full validation for the specified issue (or current context):
1) Collect scope and recent changes.
2) Run type-check, lint, unit, integration, e2e, accessibility (jest-axe), and build.
3) Summarize failures, logs, and next actions. Include any blockers.
4) Recommend whether to proceed to /deploy-test or /deploy.
Use repository instructions: `.github/copilot-instructions.md`, `AGENTS.md`, `.claude/AGENTS.md`, `.claude/COMMANDS.md`.
