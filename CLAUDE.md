# Learning Platform Development Guidelines

**Last Updated**: 2025-10-05

> **AI Agents**: Read [AGENTS.md](./AGENTS.md) first - it has all workflows, architecture, and task patterns.

## Stack

TypeScript 5.x + React 18.3 + Vite + IndexedDB + CSS Modules + PWA

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (validates TypeScript)
npm test         # Run tests
npm run deploy   # Deploy to GitHub Pages
```

## Critical Rules

### Styling
- **Every component** needs `.module.css` file (see `docs/css-modules.md`)
- Use design tokens from `src/modules/ui/styles/variables.css`
- No inline styles, no Tailwind, no CSS-in-JS
- BEM-inspired class naming: `.button`, `.button--primary`, `.button__icon`

### Code Standards
- TypeScript strict mode (no `any`)
- Component naming: PascalCase
- File naming: kebab-case
- Test with `jest-axe` for accessibility (WCAG 2.1 AA)

### Architecture
```
src/modules/
├── core/        # Types, entities, services
├── storage/     # IndexedDB repos, JSON loader
└── ui/          # React components (*.tsx + *.module.css)
```

## Documentation

- **[AGENTS.md](./AGENTS.md)** - Complete workflows, architecture, task types
- **[docs/css-modules.md](./docs/css-modules.md)** - Styling guide
- **`src/modules/core/types/services.ts`** - All type definitions

## Features

- 8 task types (multiple-choice, cloze, true/false, ordering, matching, multi-select, slider, word-scramble)
- Spaced repetition (SM-2 algorithm)
- Offline-first PWA
- German language interface
- Target: Gymnasium students (ages 10-19)

---

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
