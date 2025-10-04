<!-- Sync Impact Report
Version change: 2.0.0 → 2.1.0
Modified principles:
- II. Separation of Concerns → II. Modular Architecture & Separation of Concerns (expanded)
Added principles:
- VI. Maintainability First
Added sections:
- Module Guidelines subsection in Architecture Patterns
Templates requiring updates:
- plan-template.md (✅ in sync)
- spec-template.md (✅ compatible)
- tasks-template.md (✅ compatible)
- agent-file-template.md (✅ compatible)
- .claude/commands/constitution.md (✅ updated 2025-10-04)
Follow-up TODOs: None
-->

# Learning Platform Constitution

## Core Principles

### I. Zero-Cost Static Hosting
Application MUST be purely static with no backend infrastructure or ongoing costs.
All functionality runs client-side using GitHub Pages for free hosting. Single-user
focus eliminates need for user management, authentication servers, or databases.
Local storage handles all data persistence.

### II. Modular Architecture & Separation of Concerns
System MUST be built as composable, independent modules with clear boundaries.
Each module owns a single responsibility and exposes a well-defined interface.
Dependencies flow in one direction only (no circular dependencies). Modules must
be independently testable, replaceable, and versioned. UI components, domain logic,
and storage adapters remain strictly separated across module boundaries.

### III. Complete Automation
All development workflows MUST be automated via GitHub Actions. This includes
testing on every commit, building for production, deploying to GitHub Pages,
and dependency updates. No manual deployment steps allowed. CI/CD pipeline
must be self-healing and require zero maintenance.

### IV. Type-Safe & Testable
Code MUST be type-safe using TypeScript or JSDoc type annotations. Every function
must have explicit input/output types. Business logic requires 100% test coverage.
UI components need interaction tests. No any types or type assertions without
documented justification.

### V. Offline-First PWA
Application MUST function completely offline after initial load. Service workers
cache all assets and code. Data syncs when online but never blocks functionality.
Install prompts for add-to-home-screen. Updates download in background without
disrupting active sessions.

### VI. Maintainability First
Code MUST be optimized for long-term maintenance over initial development speed.
Every module requires comprehensive documentation. Complex logic needs inline
comments explaining "why" not "what". Public APIs must be stable with deprecation
notices. Refactoring must be safe through comprehensive test coverage. Technical
debt must be tracked and addressed regularly.

## Architecture Patterns

### Layered Architecture
```
Presentation Layer (UI Components)
    ↕ (Events/State)
Application Layer (Use Cases/Workflows)
    ↕ (Commands/Queries)
Domain Layer (Business Logic/Rules)
    ↕ (Interfaces)
Infrastructure Layer (Storage/External APIs)
```

### Module Guidelines
- **Module Structure**: Each module in its own directory with index file
- **Module Interface**: Export only public API, hide internal implementation
- **Module Dependencies**: Declare explicitly in module manifest
- **Module Testing**: Each module has dedicated test suite
- **Module Documentation**: README per module with usage examples
- **Module Versioning**: Semantic versioning for breaking changes

### Data Flow
- Unidirectional data flow (UI → Actions → State → UI)
- Immutable state updates
- Event-driven communication between layers
- Command Query Responsibility Segregation (CQRS) where appropriate
- Dependency injection for loose coupling

## Development Standards

### Build & Deploy
- Vite or similar zero-config bundler
- GitHub Actions workflow for CI/CD
- Automated lighthouse checks (Performance: 95+, Accessibility: 100)
- Bundle size monitoring (<200KB gzipped initial load)
- Module bundling with code splitting

### Code Quality
- TypeScript strict mode or comprehensive JSDoc
- ESLint + Prettier with pre-commit hooks
- Test-Driven Development (write tests first)
- Code coverage gates (100% for domain, 80% for UI)
- Cyclomatic complexity limits (max 10 per function)
- Module cohesion metrics

### Accessibility & UX
- WCAG 2.1 AA compliance mandatory
- Touch targets minimum 44x44px
- Keyboard navigation for all interactions
- Response time <100ms for user actions
- Smooth 60fps animations

### Documentation Standards
- JSDoc for all public APIs
- Architecture Decision Records (ADRs) for major changes
- Module-level README files
- Interactive Storybook for UI components
- Automated API documentation generation

## Technology Constraints

### Required Stack
- TypeScript or JavaScript with JSDoc types
- Modern bundler (Vite, Parcel, or Webpack)
- Testing framework (Vitest, Jest, or native test runner)
- Service Workers for offline functionality
- GitHub Actions for automation

### Storage Strategy
- LocalStorage for settings and small data
- IndexedDB for larger datasets
- In-memory adapter for testing
- Export/Import functionality for data portability
- Automatic data migration between versions

### Module Management
- ES6 modules for all code
- NPM workspaces or similar for multi-package repos
- Barrel exports for clean module interfaces
- Tree shaking for optimal bundle size
- Dynamic imports for code splitting

## Governance

### Amendment Process
1. Proposed changes require issue discussion first
2. Breaking changes need migration strategy
3. Version bump follows semantic versioning
4. Constitution changes need 48-hour review period

### Compliance Verification
- Automated checks in GitHub Actions enforce all principles
- Pull requests blocked if constitution violated
- Type coverage and test coverage reports required
- Performance budgets enforced before merge
- Module dependency analysis in CI
- Complexity metrics tracking

### Version Control
- All features developed in feature branches
- Squash merge to main with conventional commits
- Automated changelog generation
- Semantic versioning with git tags
- Module versions tracked independently

**Version**: 2.1.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29