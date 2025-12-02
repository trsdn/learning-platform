# Environment Setup Guide

This document describes the dual-environment setup for the Learning Platform.

## Overview

The project uses **separate Supabase projects** for development and production to ensure:

- Safe testing without affecting real users
- Automatic seeding of test data in development
- Protected production deployments via GitHub Releases
- Preview deployments for every PR

## Environments

### Development Environment

- **Supabase Project**: `mindforge-academy-dev`
- **Project Ref**: `ngasmbisrysigagtqpzj`
- **URL**: `https://ngasmbisrysigagtqpzj.supabase.co`
- **Usage**: Local development, CI, preview deployments
- **Seeding**: Automatic on learning path changes
- **Safe to**: Test, experiment, reset data

### Production Environment

- **Supabase Project**: `mindforge-academy`
- **Project Ref**: `knzjdckrtewoigosaxoh`
- **URL**: `https://knzjdckrtewoigosaxoh.supabase.co`
- **Usage**: Live application for real users
- **Seeding**: NEVER automatic (blocked by script)
- **Protected by**: GitHub Release requirement

## Environment Files

| File | Purpose | Tracked in Git |
|------|---------|----------------|
| `.env.local` | Local development | No (encrypted version tracked) |
| `.env.development` | CI/Preview deployments | No (encrypted version tracked) |
| `.env.production` | Production builds | No (encrypted version tracked) |
| `.env.*.enc` | SOPS encrypted versions | Yes |

### Required Variables

```bash
# Common
VITE_ENV=development|production
VITE_BASE_PATH=/

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Dev/CI only (for seeding)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# E2E Tests (dev only)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword
```

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/trsdn/learning-platform.git
   cd learning-platform
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Decrypt environment files** (requires SOPS age key):
   ```bash
   npm run secrets:decrypt
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

Local development uses the **development Supabase** project automatically.

## Deployment Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Create branch   │────▶│ Open PR         │────▶│ Auto Preview    │
│ feat/my-feature │     │                 │     │ (dev Supabase)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                              ┌─────────────────────────┘
                              ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Test on preview │────▶│ Merge to main   │────▶│ Still preview   │
│ URL with dev DB │     │ (after review)  │     │ (no prod yet!)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                              ┌─────────────────────────┘
                              ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Create Release  │────▶│ Auto triggers   │────▶│ Production!     │
│ v1.2.0          │     │ deploy workflow │     │ (prod Supabase) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Points

- **Every PR** gets an automatic preview URL with dev database
- **Merging to main** does NOT deploy to production
- **Only GitHub Releases** trigger production deployment
- Safe to test incomplete work on preview

## Vercel Configuration

Vercel has separate environment configurations:

| Vercel Environment | When Used | Supabase |
|-------------------|-----------|----------|
| **Preview** | PRs, branches | Development |
| **Production** | GitHub Release | Production |

### Configured Variables

In Vercel Dashboard → Settings → Environment Variables:

**Preview Environment**:
- `VITE_SUPABASE_URL` = dev URL
- `VITE_SUPABASE_ANON_KEY` = dev anon key
- `VITE_ENV` = development

**Production Environment**:
- `VITE_SUPABASE_URL` = prod URL
- `VITE_SUPABASE_ANON_KEY` = prod anon key
- `VITE_ENV` = production

## GitHub Secrets

Required secrets in GitHub repository settings:

```
# Development
SUPABASE_DEV_URL
SUPABASE_DEV_ANON_KEY
SUPABASE_DEV_SERVICE_ROLE_KEY

# Production
SUPABASE_PROD_URL
SUPABASE_PROD_ANON_KEY

# Vercel (for deployment workflows)
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# SOPS (for decryption)
SOPS_AGE_KEY
```

## Seeding

### Development Seeding

Development database is automatically seeded when:
- Learning path JSON files change on main branch
- Manual trigger via GitHub Actions

```bash
# Local seeding (uses dev Supabase from .env.local)
npm run seed:supabase
```

### Production Seeding (Blocked)

Production seeding is **blocked by default** to protect user data.

The seed script checks the Supabase URL and will:
- Exit with error if targeting production
- Only allow with explicit `FORCE_PRODUCTION_SEED=true` flag
- Show 5-second warning before proceeding (if forced)

```bash
# This will be BLOCKED:
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co npm run seed:supabase

# Only works with explicit force (NOT RECOMMENDED):
FORCE_PRODUCTION_SEED=true npm run seed:supabase
```

## Branch Protection

The `main` branch is protected with:

- Require pull request before merging
- Require 1 approval
- Require CI status checks to pass
- Require branches to be up to date
- No direct pushes allowed

## Troubleshooting

### Can't decrypt environment files

Ensure you have the SOPS age key:
```bash
# Set via environment variable
export SOPS_AGE_KEY="AGE-SECRET-KEY-..."

# Or save to file
mkdir -p ~/.config/sops/age
echo "AGE-SECRET-KEY-..." > ~/.config/sops/age/keys.txt
```

### Preview deployment using wrong database

Check that GitHub secrets are configured correctly:
- `SUPABASE_DEV_URL` should point to dev project
- `SUPABASE_DEV_ANON_KEY` should be dev anon key

### Production deployment not triggering

Production deployments only trigger on:
1. GitHub Release published
2. Manual workflow dispatch with confirmation

Check:
- Release is published (not draft)
- GitHub Actions workflow is enabled
- Required secrets are set

### Seed script blocked

If you see "PRODUCTION SEEDING BLOCKED":
- This is expected! The script protects production.
- For development, ensure `.env.local` has dev Supabase URL
- Never seed production via CI
