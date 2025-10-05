# Learning Platform Development Guidelines

**Last Updated**: 2025-10-05

agen> **AI Agents**: See [AGENTS.md](./AGENTS.md) for quick-start workflows and architecture guidance.

## Project Essentials

**Target**: Gymnasium students (ages 10-19), German interface, <100 users
**Stack**: TypeScript 5.x + React 18.3 + Vite + IndexedDB + CSS Modules + PWA

### Quick Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
npm run deploy   # Deploy to GitHub Pages
```

---

## Critical Constraints

### Styling (CSS Modules)
- **Every component** needs `.module.css` file
- **Use design tokens**: `src/modules/ui/styles/variables.css`
- **No inline styles**, no Tailwind, no CSS-in-JS
- **Class naming**: BEM-inspired kebab-case
- **Reference**: `docs/css-modules.md`

### Accessibility (WCAG 2.1 AA)
- Semantic HTML (`<button>` not `<div>`)
- Keyboard navigation + focus indicators
- Test with `jest-axe` (see `tests/unit/ui/components/TopicCard.a11y.test.tsx`)

### Code Standards
- TypeScript strict mode (no `any`)
- Component naming: PascalCase
- File naming: kebab-case
- ESLint + Prettier (pre-commit hooks)

---

## Architecture Summary

```
src/modules/
├── core/        # Types, entities, services (business logic)
├── storage/     # IndexedDB repos, JSON loader, seed data
└── ui/          # React components (*.tsx + *.module.css), hooks, styles
```

**Key files**:
- Types: `src/modules/core/types/services.ts`
- Main UI: `src/modules/ui/components/practice-session.tsx`
- Database: `src/modules/storage/database.ts`
- Content: `public/learning-paths/{topic}/*.json`

---

## Features & Technologies

### Active Technologies
- **Language**: TypeScript 5.x / JavaScript ES2022
- **Framework**: React 18.3
- **Build**: Vite (zero-config bundler)
- **Styling**: CSS Modules (component-scoped)
- **Storage**: IndexedDB (Dexie.js) + LocalStorage
- **Testing**: Vitest (unit), Playwright (E2E), jest-axe (a11y)
- **PWA**: Workbox service worker, Web App Manifest
- **Audio**: HTML5 Audio API (vocabulary pronunciation)

### Core Features
- 8 task/question types (multiple-choice, cloze, true/false, ordering, matching, multi-select, slider, word-scramble)
- Spaced repetition (SM-2 algorithm)
- Offline-first PWA
- Progress tracking & analytics
- Audio pronunciation support
- Zero-cost hosting (GitHub Pages)

---

## Development Workflows

### Adding Content
1. Create JSON in `public/learning-paths/{topic}/`
2. Register in `src/modules/storage/json-loader.ts`
3. Test with "🔄 DB Aktualisieren" button

### Adding Task Types
1. Update types in `src/modules/core/types/services.ts`
2. Update UI in `src/modules/ui/components/practice-session.tsx`
3. Create template in `data/templates/{type}-basic.json`
4. Verify with `npm run build`

### Debugging
- Check console for errors
- IndexedDB viewer: DevTools → Application
- Network tab for JSON loading issues

---

## Detailed Documentation

**For all details, see**:
- **[AGENTS.md](./AGENTS.md)**: Complete AI agent guide (workflows, architecture, task types)
- **[docs/css-modules.md](./docs/css-modules.md)**: CSS Modules styling guide
- **`src/modules/core/types/services.ts`**: Authoritative type definitions

---

## Performance & Deployment

**Targets**:
- Initial load: <3s
- Interactions: <100ms
- Offline-capable after first load

**Deployment**: GitHub Pages (static hosting)
```bash
npm run build    # Creates dist/
npm run deploy   # Pushes to gh-pages branch
```

---

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
