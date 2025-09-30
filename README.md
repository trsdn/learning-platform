# MindForge Academy - Learning Platform

A modern, offline-first learning platform built with TypeScript, React, and the SM-2 spaced repetition algorithm. Level up your brain, one question at a time! 🧠

## 🚀 Features

- **8 Task Types**: Multiple choice, cloze deletion, true/false, ordering, matching, multiple select, slider, and word scramble
- **Spaced Repetition**: SM-2 algorithm for optimal learning retention
- **Offline-First PWA**: Works completely offline after initial load
- **German Language**: Full German interface and content
- **Progress Tracking**: Comprehensive analytics and progress dashboard
- **Multiple Topics**: Mathematics, Biology, Test/Demo, and extensible for more
- **Type-Safe**: 100% TypeScript with strict mode
- **Deployed**: Live on GitHub Pages

## 📋 Project Status

### Completed ✅
- ✅ **Phase 3.1: Setup** - Project structure, build tools, testing infrastructure
- ✅ **Phase 3.2: Tests** - Contract tests, entity tests, integration tests, E2E tests
- ✅ **Phase 3.3: Core Implementation** - Domain entities, services, storage layer
- ✅ **Phase 3.4: UI Implementation** - All components, 8 task types, dashboard
- ✅ **Phase 3.5: PWA & Offline Features** - Service workers, IndexedDB, full offline support
- ✅ **Phase 3.6: Content & Templates** - JSON-based content system, 8 task type templates
- ✅ **Phase 3.7: Polish & Deployment** - TypeScript strict mode, production build, GitHub Pages

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite
- **Storage**: IndexedDB (Dexie.js)
- **PWA**: Workbox
- **Testing**: Vitest, Playwright
- **Styling**: CSS Modules (planned)
- **i18n**: react-i18next

## 📦 Installation

```bash
# Install dependencies
npm install

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
│   ├── storage/        # Storage adapters (IndexedDB, LocalStorage)
│   ├── ui/             # Presentation layer (components, pages, hooks)
│   └── templates/      # Task template system
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── contract/           # Contract tests
└── e2e/               # End-to-end tests
data/templates/         # Task template files (JSON)
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
- **Offline-First**: IndexedDB + Service Workers
- **Type-Safe**: Strict TypeScript throughout
- **JSON-Based Content**: Easy to add new learning paths and tasks

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow TDD practices and maintain test coverage.

## 📝 Notes

This project is built following best practices:
- TypeScript strict mode
- Comprehensive test coverage
- Accessibility considerations
- Performance optimized (<300KB total bundle)
- PWA with offline support

## 🎓 Content Structure

Content is organized in JSON files under `public/learning-paths/`:
```
public/learning-paths/
├── test/
│   └── all-task-types.json     # Demo of all 8 task types
├── mathematik/
│   ├── algebra-basics.json
│   ├── geometry-basics.json
│   └── advanced-tasks.json
└── biologie/
    ├── zellbiologie.json
    └── genetik-basics.json
```

Each JSON file contains:
- Learning path metadata (title, difficulty, estimated time)
- Array of tasks with questions, answers, and explanations
- Template references for validation

See `data/templates/` for task type schemas.