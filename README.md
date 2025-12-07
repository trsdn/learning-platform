# MindForge Academy - Learning Platform

A modern, cloud-based learning platform built with TypeScript, React, Supabase, and the SM-2 spaced repetition algorithm. Level up your brain, one question at a time! 🧠

## 🚀 Features

- **8 Task Types**: Multiple choice, cloze deletion, true/false, ordering, matching, multiple select, slider, and word scramble
- **Spaced Repetition**: SM-2 algorithm for optimal learning retention
- **Cloud-Synced**: Data stored in Supabase PostgreSQL, accessible across devices
- **Multi-User**: Supabase authentication with Row Level Security (RLS)
- **German Language**: Full German interface and content
- **Progress Tracking**: Comprehensive analytics and progress dashboard
- **Type-Safe**: 100% TypeScript with strict mode
- **Deployed**: Live on Vercel

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite, CSS Modules
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel
- **Testing**: Vitest, Playwright
- **Tooling**: Storybook 8, ESLint, Prettier

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment (see docs/guides/ENVIRONMENT_SETUP.md)
cp .env.example .env.local

# Run development server
npm run dev
```

**Setup Guide**: See [docs/guides/ENVIRONMENT_SETUP.md](./docs/guides/ENVIRONMENT_SETUP.md) for complete environment configuration, Supabase setup, and database seeding.

## 🚀 Deployment

The platform is deployed on Vercel with automatic deployments:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests

**Deployment Guide**: See [docs/guides/deployment.md](./docs/guides/deployment.md) for complete deployment instructions, environment setup, and troubleshooting.

## 🧪 Testing

```bash
npm test              # Unit & integration tests
npm run test:e2e      # E2E tests (Playwright)
npm run storybook     # Component library
```

**Testing Guide**: See [tests/AGENTS.md](./tests/AGENTS.md) for testing strategy, coverage requirements, and TDD workflow.

## 📖 Component Library

UI components available in Storybook at `http://localhost:6006`:

```bash
npm run storybook
```

**Component Guide**: See [src/AGENTS.md](./src/AGENTS.md) for component architecture, styling conventions, and development patterns.

## 📁 Project Structure

```text
src/modules/          # Layered architecture (core/storage/ui)
tests/                # Unit, integration, contract, E2E tests
scripts/              # Automation (seeding, deployment)
public/               # Learning content, audio, static assets
docs/                 # Technical documentation
```

**Architecture Guide**: See [AGENTS.md](./AGENTS.md) for complete project structure, development workflow, and TDD practices.

## 📚 Key Concepts

### Task Types

8 interactive task types: Multiple choice, cloze deletion, true/false, ordering, matching, multiple select, slider, word scramble.

**Task Type Guide**: See [docs/guides/new-task-type.md](./docs/guides/new-task-type.md) for creating new task types.

### Spaced Repetition

SM-2 algorithm with intervals from 1 day to 365 days based on performance.

**Algorithm Details**: See [AGENTS.md](./AGENTS.md#-spaced-repetition-sm-2-algorithm) for complete SM-2 implementation.

## 🗄️ Database

**Database Documentation**:

- [docs/guides/SETUP_SUPABASE.md](./docs/guides/SETUP_SUPABASE.md) - Setup and configuration
- [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Schema with ERD
- [docs/ROW_LEVEL_SECURITY.md](./docs/ROW_LEVEL_SECURITY.md) - Security policies
- [docs/guides/AUTOMATED_SEEDING.md](./docs/guides/AUTOMATED_SEEDING.md) - Data seeding

## 🤝 Contributing

Contributions welcome! See [docs/guides/contributing.md](./docs/guides/contributing.md) for guidelines.

## 📄 License

MIT

## 📚 Documentation

### For Developers

- [AGENTS.md](./AGENTS.md) - Start here: Project overview, architecture, workflows
- [docs/guides/ENVIRONMENT_SETUP.md](./docs/guides/ENVIRONMENT_SETUP.md) - Environment configuration
- [docs/guides/contributing.md](./docs/guides/contributing.md) - Contribution guidelines
- [tests/AGENTS.md](./tests/AGENTS.md) - Testing strategy
- [src/AGENTS.md](./src/AGENTS.md) - Code organization

### Database & Infrastructure

- [docs/guides/SETUP_SUPABASE.md](./docs/guides/SETUP_SUPABASE.md) - Supabase setup
- [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Schema documentation
- [docs/ROW_LEVEL_SECURITY.md](./docs/ROW_LEVEL_SECURITY.md) - Security policies
- [infrastructure/supabase/AGENTS.md](./infrastructure/supabase/AGENTS.md) - Database operations

### Content & Deployment

- [public/AGENTS.md](./public/AGENTS.md) - Learning content structure
- [docs/guides/deployment.md](./docs/guides/deployment.md) - Deployment guide
