---
name: deploy-test
description: Deploy to the test/preview environment with validation summary.
agent: platform-deploy-orchestrator
---
Deploy to test/preview:
1) Ensure `/validate-implementation` has run or summarize current validation state (type-check, lint, unit, integration, E2E, accessibility, build).
2) Run `/deploy-test`; capture preview URL and basic health checks.
3) Note Supabase dev DB usage; no prod data changes.
4) Output status, preview URL, checks performed, and blockers; recommend next steps toward `/deploy`.
Reference `.claude/AGENTS.md`, `.claude/COMMANDS.md`, and repo AGENTS/instructions.
