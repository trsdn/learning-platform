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

## Release Procedure

### Step-by-Step Release Process

#### 1. Pre-Release Checklist

Before creating a release, ensure:

- [ ] All PRs for the release are merged to `main`
- [ ] CI passes on `main` branch
- [ ] No blocking issues in the milestone
- [ ] CHANGELOG.md is updated (if not using auto-generation)

```bash
# Check CI status on main
gh run list --branch main --limit 3

# Check for any failing workflows
gh run list --status failure --limit 5
```

#### 2. Determine Version Type

Follow [Semantic Versioning](https://semver.org/):

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking changes | `major` | 1.0.0 → 2.0.0 |
| New features (backward compatible) | `minor` | 1.0.0 → 1.1.0 |
| Bug fixes only | `patch` | 1.0.0 → 1.0.1 |

#### 3. Create the Release

**Option A: Using the slash command (recommended)**

```bash
/create-release minor
```

**Option B: Manual process**

```bash
# 1. Update package.json version
npm version minor --no-git-tag-version

# 2. Commit version bump
git add package.json
git commit -m "chore: release v1.2.0"

# 3. Create and push tag
git tag v1.2.0
git push origin main --tags

# 4. Create GitHub release
gh release create v1.2.0 --title "v1.2.0" --notes "Release notes here..."
```

#### 4. Monitor Deployment

The release triggers the `deploy-production.yml` workflow automatically:

```bash
# Watch the deployment
gh run list --workflow=deploy-production.yml --limit 1
gh run watch <run-id>

# Or watch in real-time
gh run list --workflow=deploy-production.yml --limit 1 --json databaseId -q '.[0].databaseId' | xargs gh run watch
```

#### 5. Verify Deployment

After deployment completes:

```bash
# Check production site is healthy
curl -s -o /dev/null -w "%{http_code}" https://learning-platform.vercel.app

# Verify version in app (Settings → Info & Support)
```

### Hotfix Releases

For urgent production fixes:

```bash
# 1. Create hotfix branch from tag
git checkout -b hotfix/critical-fix v1.1.0

# 2. Apply fix and commit
git commit -m "fix: critical bug description"

# 3. Merge to main
git checkout main
git merge hotfix/critical-fix
git push origin main

# 4. Create patch release
/create-release patch
```

### Rollback Procedure

If a deployment causes issues:

```bash
# Option 1: Re-deploy previous version
gh workflow run deploy-production.yml --ref v1.0.0 -f confirm_production=deploy-to-production

# Option 2: Revert via Vercel Dashboard
# Go to Vercel → Deployments → Find previous successful deployment → Promote to Production
```

### Release Artifacts

Each release should include:

1. **Git tag** (e.g., `v1.1.0`)
2. **GitHub Release** with:
   - Summary of changes
   - Link to CHANGELOG or PR list
   - Any migration notes
3. **Vercel deployment** to production

### Vercel Credentials Setup

If secrets need to be updated (e.g., new team member):

```bash
# Get correct IDs using Vercel CLI
npx vercel login
npx vercel link --yes

# Read the generated IDs
cat .vercel/project.json
# Output: {"projectId":"prj_xxx","orgId":"team_xxx","projectName":"learning-platform"}

# Update GitHub secrets
gh secret set VERCEL_PROJECT_ID --body "prj_xxx"
gh secret set VERCEL_ORG_ID --body "team_xxx"
```

### Common Issues

#### Deployment fails with "prebuilt output not found"

The workflow uses `vercel build` to create `.vercel/output/`. If this fails:

1. Check that `vercel.json` is valid
2. Ensure the build command in workflow matches project setup
3. Verify Vercel CLI version is up to date

#### Health check fails after deployment

The workflow checks if the site returns HTTP 200:

1. Check Vercel function logs for errors
2. Verify environment variables are set correctly
3. Check if Supabase connection is working

```bash
# View recent Vercel logs
vercel logs --prod
```

## History

- **2025-12-04**: Added comprehensive release procedure documentation
- **2025-12-04**: Fixed deployment workflow to use `vercel build` for prebuilt output
- **2025-12-04**: Documented Vercel deployment and no-auto-deploy design decision
- **2025-10-05**: Migrated from GitHub Pages to Vercel for production hosting
