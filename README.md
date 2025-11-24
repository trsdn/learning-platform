# MindForge Academy - Learning Platform

A modern, cloud-based learning platform built with TypeScript, React, Supabase, and the SM-2 spaced repetition algorithm. Level up your brain, one question at a time! 🧠

## 🚀 Features

- **8 Task Types**: Multiple choice, cloze deletion, true/false, ordering, matching, multiple select, slider, and word scramble
- **Spaced Repetition**: SM-2 algorithm for optimal learning retention
- **Cloud-Synced**: Data stored in Supabase PostgreSQL, accessible across devices
- **Multi-User**: Supabase authentication with Row Level Security (RLS)
- **German Language**: Full German interface and content
- **Progress Tracking**: Comprehensive analytics and progress dashboard
- **Multiple Topics**: Mathematics, Biology, English, Spanish, and extensible for more
- **Type-Safe**: 100% TypeScript with strict mode
- **Deployed**: Live on Vercel

## 📋 Project Status

### Completed ✅
- ✅ **Phase 3.1: Setup** - Project structure, build tools, testing infrastructure
- ✅ **Phase 3.2: Tests** - Contract tests, entity tests, integration tests, E2E tests
- ✅ **Phase 3.3: Core Implementation** - Domain entities, services, storage layer
- ✅ **Phase 3.4: UI Implementation** - All components, 8 task types, dashboard
- ✅ **Phase 3.5: PWA & Offline Features** - Service workers, full offline support
- ✅ **Phase 3.6: Content & Templates** - JSON-based content system, 8 task type templates
- ✅ **Phase 3.7: Polish & Deployment** - TypeScript strict mode, production build
- ✅ **Phase 4: Supabase Migration** - Migrated from IndexedDB to Supabase PostgreSQL
- ✅ **Phase 5: Vercel Deployment** - Production deployment on Vercel

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with RLS
- **Deployment**: Vercel
- **PWA**: Workbox
- **Testing**: Vitest, Playwright
- **Styling**: CSS Modules
- **i18n**: react-i18next

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Required environment variables for Supabase:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) for detailed setup instructions.

## 🚀 Deployment

### Pre-deployment Checklist

Before deploying, run the pre-deployment check to catch common issues:

```bash
npm run pre-deploy
```

This validates:
- Environment variables are configured
- Dependencies are installed
- TypeScript compiles without errors
- Linting passes
- Production build succeeds
- Vercel configuration is valid

### Vercel Production Deployment

The platform is deployed on Vercel with automatic deployments from the `main` branch.

**Production URL**: Check your Vercel project dashboard

#### Initial Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Set up environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Set for Production, Preview, and Development environments

#### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Automatic Deployments

- **Production**: Pushes to `main` branch trigger production deployments
- **Preview**: Pull requests trigger preview deployments

#### Troubleshooting

If you encounter deployment issues, see [Vercel Troubleshooting Guide](docs/deployment/VERCEL_TROUBLESHOOTING.md) for common solutions:
- Missing environment variables
- Build timeouts
- Configuration errors

See [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) for:
- Complete deployment guide
- Environment variable configuration
- Domain setup
- CI/CD pipeline details

### Test Environment

Deploy to test environment automatically on PR creation via GitHub Actions.

## 🧪 Testing

The project follows Test-Driven Development (TDD):

```bash
# Run all unit and integration tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 📁 Project Structure

```
src/
├── modules/
│   ├── core/           # Domain logic (entities, services)
│   ├── storage/        # Storage adapters (Supabase repositories)
│   ├── ui/             # Presentation layer (components, pages, hooks)
│   └── templates/      # Task template system
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── contract/           # Contract tests
└── e2e/               # End-to-end tests
scripts/                # Utility scripts (seeding, schema management)
public/                 # Static assets, PWA manifest
```

## 🎯 Development Workflow

1. **Tests First**: Write failing tests before implementation (TDD)
2. **Implementation**: Implement features to make tests pass
3. **Refactor**: Clean up code while keeping tests green
4. **Commit**: Commit with meaningful messages

## 📚 Key Concepts

### Task Types (8 Total)
1. **Multiple Choice** (📝) - Single correct answer from 2-6 options
2. **Cloze Deletion** (✏️) - Fill in the blanks with correct answers
3. **True/False** (✓/✗) - Evaluate statement accuracy
4. **Ordering** (🔢) - Sort items into correct sequence
5. **Matching** (🔗) - Match pairs between two columns
6. **Multiple Select** (☑️) - Select multiple correct answers
7. **Slider** (🎚️) - Numeric answer with tolerance range
8. **Word Scramble** (🔤) - Unscramble letters to form correct word

### Spaced Repetition (SM-2 Algorithm)
- Initial interval: 1 day
- Second interval: 6 days
- Subsequent: `interval × efactor`
- Maximum interval: 365 days
- Efactor range: 1.3 - 2.5

### Architecture
- **Layered**: UI → Application → Domain → Infrastructure
- **Modular**: Independent modules with clear boundaries
- **Cloud-First**: Supabase PostgreSQL + Row Level Security
- **Type-Safe**: Strict TypeScript throughout
- **Repository Pattern**: Clean separation of data access logic

## 🗄️ Database Management

### Seeding Data

Seed the Supabase database with initial content:

```bash
npm run seed:supabase
```

### Schema Management

Apply database schema changes:

```bash
npm run supabase:schema
```

Generate TypeScript types from schema:

```bash
npm run supabase:types
```

See [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) for detailed database setup.

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow TDD practices and maintain test coverage.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 Notes

This project is built following best practices:
- TypeScript strict mode
- Comprehensive test coverage
- Accessibility considerations
- Performance optimized
- PWA with offline support
- Row Level Security (RLS) for multi-user isolation
- Automated CI/CD pipeline

## 🎓 Content Structure

Content is stored in Supabase PostgreSQL with the following schema:

- **Topics**: Subject areas (Math, Biology, English, etc.)
- **Learning Paths**: Collections of related tasks within a topic
- **Tasks**: Individual learning items (questions, exercises)
- **User Progress**: Tracking completion and performance
- **Spaced Repetition**: SM-2 algorithm scheduling data
- **Answer History**: Detailed answer records for analytics

Tasks can be added via:
1. Database seeding scripts (`scripts/seed-supabase.ts`)
2. Admin panel (coming soon)
3. Direct database management via Supabase dashboard

## 📚 Documentation

- [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) - Supabase setup guide
- [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) - Vercel deployment guide
- [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) - Migration from IndexedDB
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [AGENTS.md](./AGENTS.md) - AI agent workflows and patterns

## 🔒 Security

- Authentication via Supabase Auth (email/password, OAuth providers)
- Row Level Security (RLS) policies for data isolation
- Environment variables for sensitive credentials
- HTTPS enforced on all deployments
- Regular security audits

## 🚦 CI/CD Pipeline

- **CI**: Type checking, linting, unit tests, E2E tests
- **Test Deployment**: Automatic deployment to test environment on PRs
- **Production Deployment**: Automatic deployment to Vercel on merge to `main`

See `.github/workflows/` for workflow definitions.
