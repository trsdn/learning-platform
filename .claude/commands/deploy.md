---
description: Deploy the learning platform. Arguments: [environment] (preview|production) --force (skip checks)
agent: platform-deploy-orchestrator
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Deploy to Vercel with environment-aware configuration.

## Environment Overview

| Environment | Database | Trigger | Use Case |
|-------------|----------|---------|----------|
| **Preview** | Dev Supabase | Manual / PR | Safe testing |
| **Production** | Prod Supabase | GitHub Release | Live users |

## Execution Steps

1. **Parse user input** from `$ARGUMENTS`:
   - If empty or `preview`: Deploy to PREVIEW environment (safe, uses dev Supabase)
   - If `production` or `prod`: Trigger PRODUCTION deployment (requires GitHub Release)
   - If `--force`: Skip pre-deployment checks (not recommended)

---

## PREVIEW DEPLOYMENT (Default)

When deploying to preview (default):

2. **Pre-deployment checks** (skip if `--force`):
   a. Verify build succeeds:
      ```bash
      npm run build
      ```
      - If build fails: ABORT and show errors

3. **Deploy to Vercel Preview**:
   ```bash
   npx vercel
   ```

   This will:
   - Create a preview deployment
   - Use DEVELOPMENT Supabase (test data)
   - Generate a unique preview URL
   - NOT affect production

4. **Display result**:
   - Show preview URL
   - Note: "This preview uses dev Supabase with test data"

---

## PRODUCTION DEPLOYMENT

When deploying to production:

2. **Check for existing GitHub Release**:
   - Production deployments should go through GitHub Releases
   - This triggers the `deploy-production.yml` workflow automatically

3. **If no recent release exists**:
   Ask user:
   ```
   Production deployments require a GitHub Release.

   Options:
   1. Create a release now using `/create-release`
   2. Manually trigger the deploy-production workflow on GitHub Actions
   3. Cancel

   Which would you prefer?
   ```

4. **If user wants to create release**:
   - Run `/create-release` which will:
     - Generate changelog
     - Create git tag
     - Publish GitHub Release
     - Automatically trigger production deployment

5. **If user wants manual trigger**:
   Provide instructions:
   ```
   To manually trigger production deployment:

   1. Go to GitHub Actions:
      https://github.com/trsdn/learning-platform/actions/workflows/deploy-production.yml

   2. Click "Run workflow"

   3. Type "deploy-to-production" to confirm

   4. Click "Run workflow" button
   ```

6. **Post-deployment verification** (for production):
   - Wait for GitHub Actions workflow to complete
   - Check deployment status
   - Verify at production URL

---

## Rollback Instructions

If issues are found after deployment:

**Preview rollback**: Not needed (just deploy again)

**Production rollback**:
```bash
# Via Vercel CLI
vercel rollback

# Or via Vercel Dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select project → Deployments
# 3. Find previous working deployment
# 4. Click "..." → "Promote to Production"
```

---

## Environment Configuration

**Preview Environment**:
- Database: `mindforge-academy-dev` (Supabase development)
- Auto-seeded with test data
- Safe for incomplete work
- Uses dev environment variables

**Production Environment**:
- Database: `mindforge-academy` (Supabase production)
- NEVER seeded automatically
- Requires GitHub Release
- Uses prod environment variables

---

## Safety Guardrails

- Production requires GitHub Release (no direct deploys)
- Build must succeed before any deployment
- Vercel auto-deploy to production is DISABLED
- Preview uses dev Supabase (safe to test)

Context: $ARGUMENTS
