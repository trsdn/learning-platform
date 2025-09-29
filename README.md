# German Learning Platform with Spaced Repetition

A modern, offline-first learning platform built with TypeScript, React, and the SM-2 spaced repetition algorithm.

## 🚀 Features

- **Spaced Repetition**: SM-2 algorithm for optimal learning retention
- **Offline-First PWA**: Works completely offline after initial load
- **German Language**: Full German interface and content
- **Progress Tracking**: Comprehensive analytics and progress dashboard
- **Multiple Topics**: Mathematics, Biology, and extensible for more
- **Type-Safe**: 100% TypeScript with strict mode
- **Test-Driven**: Comprehensive test coverage with TDD approach

## 📋 Project Status

### Completed ✅
- **Phase 3.1: Setup** - Project structure, build tools, testing infrastructure
- **Phase 3.2: Tests (Partial)** - Contract tests, entity tests, integration tests, E2E tests

### In Progress 🏗️
- **Phase 3.3: Core Implementation** - Domain entities, services, storage layer

### Pending ⏳
- Phase 3.4: UI Implementation
- Phase 3.5: PWA & Offline Features
- Phase 3.6: Content & Templates
- Phase 3.7: Polish & Optimization

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
- 80%+ test coverage target
- Accessibility (WCAG 2.1 AA)
- Performance (<3s initial load, <100ms interactions)
- Bundle size (<200KB gzipped)