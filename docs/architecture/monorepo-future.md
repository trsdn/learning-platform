# Monorepo Migration Plan (Future)

**Status**: Planning / Not Yet Needed
**Last Updated**: 2024-11-24

## Current Architecture

Single repository with monolithic structure:
- Frontend: React + TypeScript in `src/`
- Database: Supabase (external service)
- Deployment: Vercel (frontend only)

## When to Migrate to Monorepo

Consider monorepo when ANY of these become true:

1. **Backend API Required**
   - Need custom backend beyond Supabase
   - Complex business logic that can't run in Supabase Functions
   - Multiple services that share code

2. **Multiple Deployable Apps**
   - Admin dashboard as separate app
   - Mobile app (React Native) sharing logic
   - Landing page separate from main app

3. **Code Sharing Pain**
   - Duplicating types across projects
   - Copying utilities between repos
   - Versioning shared code is difficult

4. **Team Growth**
   - Multiple teams working on different parts
   - Need independent deployment cycles
   - Different release schedules

## Proposed Structure (When Ready)

```
learning-platform/
├── apps/                       # Deployable applications
│   ├── web/                   # Main web app (current src/)
│   ├── admin/                 # Admin dashboard (future)
│   └── mobile/                # Mobile app (future)
├── packages/                   # Shared packages
│   ├── shared/                # Shared types & utils
│   ├── ui/                    # Shared UI components
│   └── api-client/            # API client library
├── services/                   # Backend services
│   └── api/                   # REST API (future)
├── infrastructure/             # Infrastructure as code
│   ├── supabase/
│   └── vercel/
└── tools/                      # Development tools
    ├── scripts/
    └── generators/
```

## Migration Steps (When Needed)

### Phase 1: Preparation
- [ ] Move `src/modules/core/types` to `src/shared/types`
- [ ] Move `src/modules/core/utils` to `src/shared/utils`
- [ ] Identify portable code that could be shared
- [ ] Document shared interfaces

### Phase 2: Tooling Setup
- [ ] Choose monorepo tool: **Turborepo** (recommended) or Nx
- [ ] Install and configure chosen tool
- [ ] Set up package manager: **pnpm** (recommended)
- [ ] Configure build caching

### Phase 3: Code Migration
- [ ] Create `apps/web/` and move `src/` there
- [ ] Create `packages/shared/` and move shared code
- [ ] Update import paths
- [ ] Test thoroughly

### Phase 4: New Packages
- [ ] Create backend API in `services/api/`
- [ ] Extract UI components to `packages/ui/`
- [ ] Create shared API client

## Recommended Tools

### Turborepo (Recommended)
- **Pros**: Simple, fast, great caching, minimal config
- **Cons**: Less features than Nx
- **Best for**: Small-medium teams, straightforward monorepos

### Nx
- **Pros**: Feature-rich, great for large teams, code generation
- **Cons**: More complex, steeper learning curve
- **Best for**: Large teams, complex dependency graphs

### pnpm Workspaces
- **Pros**: Fast, efficient disk usage, strict dependency management
- **Cons**: Need additional tooling for build orchestration
- **Recommended**: Use with Turborepo

## Current Lightweight Preparation

Already done to ease future migration:

1. ✅ `infrastructure/supabase/` - Infrastructure isolated
2. ✅ `scripts/` organized by purpose
3. ✅ `src/shared/` - Placeholder for portable code
4. ✅ Modular architecture in `src/modules/`

## Decision: Wait Until Needed

**Current recommendation**: **Do NOT migrate to monorepo yet.**

**Reasons**:
- No backend API exists
- Single deployable app
- Small team/solo developer
- Monorepo adds complexity without current benefit

**Re-evaluate when**:
- Building separate backend API
- Creating mobile app
- Adding admin dashboard as separate app
- Team grows beyond 3 developers

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Nx Monorepo Guide](https://nx.dev/getting-started/intro)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo.tools](https://monorepo.tools/)

---

**Next Review Date**: When planning backend API or second app
