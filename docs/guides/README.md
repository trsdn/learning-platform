# Guides

This directory contains how-to guides and documentation for working with the learning platform.

## Available Guides

- `AGENT_SWITCHING.md` - Guide for switching between Claude and GitHub Copilot agents
- `contributing.md` - How to contribute to the project
- `deployment.md` - Deployment instructions
- `test-deployment.md` - Test environment deployment
- `new-task-type.md` - Creating new task types
- `ENVIRONMENT_SETUP.md` - Environment configuration
- `AUTOMATED_SEEDING.md` - Database seeding automation
- `SETUP_SUPABASE.md` - Supabase setup instructions

## AI Agents

This repository supports two AI coding agents:

| Agent | Configuration | Trigger |
|-------|---------------|---------|
| **Claude** | `.claude/`, `CLAUDE.md` | `@claude` in issue/PR |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Copilot Workspace |

See `AGENT_SWITCHING.md` for detailed instructions on when to use each agent.

## Quick Start

1. Read `contributing.md` for development setup
2. Read `AGENT_SWITCHING.md` if using AI coding agents
3. Follow `deployment.md` for deployment instructions
4. See `new-task-type.md` to add new learning task types
