---
name: deploy
description: Deploy to production after validation and release.
agent: platform-deploy-orchestrator
---
Deploy to production safely:
1) Confirm release exists and `/validate-implementation` is green (type-check, lint, unit, integration, E2E, accessibility, build).
2) If not already, run `/deploy-test` and sanity-check preview.
3) Run `/deploy`; include health checks and rollback steps. Never auto-seed prod; Supabase is primary DB.
4) Report status, logs, and blockers; note protected areas (schema, task types, precache).
Reference `.claude/AGENTS.md`, `.claude/COMMANDS.md`, and repo AGENTS/instructions.
