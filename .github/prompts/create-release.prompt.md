---
name: create-release
description: Prepare and create a production release with semantic versioning and validation.
argument-hint: "[major|minor|patch]"
agent: platform-deploy-orchestrator
---
Perform release prep and creation:
1) Confirm scope and version bump (semantic). Ensure main is up to date.
2) Verify: type-check, lint, unit, integration, E2E, accessibility (jest-axe), build.
3) Generate changelog summary; ensure protected areas untouched (schema, task types, precache).
4) Execute `/create-release <bump>` then recommend `/deploy-test` -> `/deploy`.
5) Output: version chosen, validation results, blockers, and next actions.
Reference `.claude/AGENTS.md`, `.claude/COMMANDS.md`, and repo AGENTS/instructions.
