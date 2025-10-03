---
description: Deploy the learning platform to test environment with isolated database
arguments:
  - name: method
    description: Deployment method (local|github)
    required: false
    default: local
---

# Deploy to Test Environment

Deploy the learning platform to a test environment at `/test` with isolated database.

## Usage

```
/deploy-test [method]
```

**Arguments:**
- `method` (optional): Deployment method
  - `local` - Deploy from local machine (default)
  - `github` - Trigger GitHub Action workflow

**Examples:**
```
/deploy-test              # Deploy locally
/deploy-test local        # Deploy locally (explicit)
/deploy-test github       # Deploy via GitHub Actions
```

## What this does

1. Creates a production build with test configuration
2. Deploys to GitHub Pages at `/learning-platform/test/`
3. Uses separate IndexedDB database name (`mindforge-academy-test`)
4. Allows testing without affecting production

## Implementation

### Local Deployment

```bash
# Deploy using npm script
npm run deploy:test
```

This command:
1. Sets environment variables (`VITE_ENV=test`, `VITE_DB_NAME=mindforge-academy-test`)
2. Builds with base path `/learning-platform/test/`
3. Deploys to `test/` subdirectory on gh-pages branch

### GitHub Actions Deployment

To trigger GitHub Action:

1. Go to repository Actions tab
2. Select "Deploy to Test Environment" workflow
3. Click "Run workflow"
4. Type `deploy-test` to confirm
5. Click "Run workflow" button

Or via GitHub CLI:
```bash
gh workflow run deploy-test.yml
```

## Verification

After deployment, check:
- [ ] Test site loads at `/learning-platform/test/`
- [ ] Separate database is used (check IndexedDB in DevTools)
- [ ] Production site at `/learning-platform/` is unaffected
- [ ] All features work in test environment

## Notes

- Test environment uses same codebase but different base path
- Database name: `mindforge-academy-test` (vs `mindforge-academy` in prod)
- Service worker scope limited to `/test/`
