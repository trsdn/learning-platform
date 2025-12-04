# Deployment Guide

## Overview

This project uses **Vercel** for production hosting with **GitHub Actions** for controlled release deployments. Auto-deploy is intentionally disabled to ensure production deployments only happen through the release workflow.

## Vercel Production Deployment

### Design Decision: No Auto-Deploy

**Auto-deploy from `main` branch is intentionally disabled** in `vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": false
    }
  }
}
```

**Rationale:**
- Production deployments should be intentional, not automatic
- Each production release should have a version tag and changelog
- Prevents accidental deployments of incomplete features
- Enables proper release management with semantic versioning

### Production Deployment Workflow

Production deployments are triggered **only** by GitHub Releases:

1. **Create a release** using `/create-release` command or manually
2. **Publish the release** on GitHub
3. **GitHub Actions** (`deploy-production.yml`) automatically:
   - Runs tests and type-check
   - Builds with production environment variables
   - Deploys to Vercel production

```bash
# Create and publish a release
/create-release minor

# Or manually trigger (requires confirmation)
gh workflow run deploy-production.yml
# Enter: deploy-to-production
```

### Required GitHub Secrets

The Vercel deployment requires these secrets in GitHub:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Account → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Team/Organization ID | Vercel Team Settings → General |
| `VERCEL_PROJECT_ID` | Project ID | Vercel Project Settings → General |
| `SUPABASE_PROD_URL` | Production Supabase URL | Supabase Dashboard |
| `SUPABASE_PROD_ANON_KEY` | Production anon key | Supabase Dashboard |

### Deployment Process

The `deploy-production.yml` workflow:

1. **Validates** the release trigger
2. **Runs tests** (`npm test -- --run`)
3. **Type-checks** (`npm run type-check`)
4. **Builds** with production environment variables
5. **Pulls Vercel environment** (`vercel pull`)
6. **Deploys** to Vercel production (`vercel deploy --prebuilt --prod`)
7. **Health checks** the deployed site
8. **Reports** deployment status

### Troubleshooting

#### Error: "Project not found"

```
Error: Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})
```

This means the Vercel secrets are misconfigured. Fix by:

1. Go to your Vercel dashboard
2. Get correct Project ID and Org ID from settings
3. Update secrets at: `https://github.com/trsdn/learning-platform/settings/secrets/actions`

#### Re-run Failed Deployment

```bash
# Re-run the deployment workflow for a specific tag
gh workflow run deploy-production.yml --ref v1.1.0
```

#### Check Deployment Status

```bash
# List recent deployments
gh api repos/trsdn/learning-platform/deployments --jq '.[0:5] | .[] | "\(.created_at) | \(.environment) | \(.ref) | \(.state)"'

# Check workflow runs
gh run list --workflow=deploy-production.yml --limit 5
```

## Environment Configuration

### Production Environment

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_ENV` | `production` | Environment mode |
| `VITE_SUPABASE_URL` | Production URL | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production key | Supabase anon key |
| `VITE_DB_NAME` | `mindforge-academy` | IndexedDB database name |

### Development Environment

Local development uses `.env.local` with development Supabase instance:

```bash
# .env.local (not committed)
VITE_SUPABASE_URL=https://ngasmbisrysigagtqpzj.supabase.co
VITE_SUPABASE_ANON_KEY=<dev-anon-key>
VITE_ENV=development
```

## Vercel Configuration

The `vercel.json` configuration includes:

- **Build settings**: Vite framework, `dist` output directory
- **Rewrites**: SPA routing (`/(.*) → /index.html`)
- **Security headers**: CSP, X-Frame-Options, XSS protection
- **Cache headers**: Long-term caching for `/assets/*`
- **Git settings**: Auto-deploy disabled for `main`

## History

- **2025-12-04**: Documented Vercel deployment and no-auto-deploy design decision
- **2025-10-05**: Migrated from GitHub Pages to Vercel for production hosting
