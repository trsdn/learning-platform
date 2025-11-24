# Deployment Guide

## Overview

This project uses **GitHub Actions** with modern GitHub Pages deployment actions to deploy to production. The deployment workflow is configured to use the `actions/deploy-pages` action, which is the current recommended method for GitHub Pages deployments.

## Production Deployment

### Trigger Deployment

```bash
# Via GitHub CLI (recommended)
gh workflow run deploy.yml -f confirm=deploy-production

# Monitor deployment
gh run watch
```

### Deployment Workflow

The production deployment:
1. Validates user confirmation input
2. Builds the application with production settings
3. Uploads build artifacts using `actions/upload-pages-artifact@v3`
4. Deploys to GitHub Pages using `actions/deploy-pages@v4`

**Production URL**: https://trsdn.github.io/learning-platform/

## Critical Issue: Deployment Method

### ⚠️ Problem: Workflow Runs But Site Doesn't Update

**Symptoms:**
- GitHub Actions workflow completes successfully ✅
- Files are committed to `gh-pages` branch (if using old method) ✅
- Live site serves old cached version ❌
- No actual GitHub Pages deployment triggered ❌

**Root Cause:**

GitHub Pages has two deployment methods:

1. **Branch-based** (legacy): Push to `gh-pages` branch → GitHub auto-detects and deploys
2. **Workflow-based** (modern): Use GitHub Actions with `actions/deploy-pages` action

Our repository is configured with `build_type: workflow`, which means GitHub Pages expects deployments via the modern `actions/deploy-pages` action.

You can check your configuration:
```bash
gh api repos/trsdn/learning-platform/pages | jq .build_type
# Should output: "workflow"
```

### ❌ Wrong Method (Outdated)

**DO NOT USE** the `peaceiris/actions-gh-pages` action:

```yaml
# ❌ WRONG - This pushes to gh-pages branch but doesn't trigger deployment
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

**Why it fails:**
- This action pushes files to `gh-pages` branch
- When `build_type: workflow`, GitHub ignores branch pushes
- No actual deployment happens
- Live site continues serving old content

### ✅ Correct Method (Current)

**USE** the modern GitHub Pages deployment actions:

```yaml
# ✅ CORRECT - Modern GitHub Pages deployment
jobs:
  deploy-production:
    permissions:
      contents: read
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      # ... build steps ...

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Why it works:**
- Uses official GitHub Pages deployment action
- Creates proper deployment via GitHub API
- Triggers immediate cache invalidation
- Visible in repository deployments: `gh api repos/OWNER/REPO/deployments`

## Verification Steps

### 1. Check Workflow Run

```bash
gh run list --workflow=deploy.yml --limit 1
```

Ensure status is `completed` and conclusion is `success`.

### 2. Check Deployment Created

```bash
gh api repos/trsdn/learning-platform/deployments --jq '.[0] | "\(.environment)\t\(.created_at)\t\(.sha)"'
```

Should show recent `github-pages` deployment with current commit SHA.

### 3. Verify Live Site

```bash
curl -s https://trsdn.github.io/learning-platform/ | grep deployment-version
```

Check the deployment version meta tag matches your expected build.

### 4. Browser Testing

1. Open https://trsdn.github.io/learning-platform/ in **incognito/private window**
2. Check DevTools console for errors
3. Verify functionality works as expected
4. Check that database name is `mindforge-academy` (not `-test`)

## Troubleshooting

### Issue: Deployment Succeeds But Old Version Still Served

**Check 1: Verify deployment method**
```bash
cat .github/workflows/deploy.yml | grep "deploy-pages"
```
Should contain `uses: actions/deploy-pages@v4`

**Check 2: Verify GitHub Pages configuration**
```bash
gh api repos/trsdn/learning-platform/pages | jq '{build_type, source}'
```
Should show `"build_type": "workflow"`

**Check 3: Compare deployed vs live**
```bash
# Check what's on gh-pages branch (if it exists)
git fetch origin gh-pages
git show origin/gh-pages:index.html | grep index-.*\.js

# Check what's live
curl -s https://trsdn.github.io/learning-platform/ | grep index-.*\.js
```

If they differ, the deployment action isn't being used correctly.

### Issue: Deployment Fails with Permission Error

Add required permissions to job:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Issue: "Not Found" Error for Deployment API

This is normal if using the workflow method. The `/pages/builds` endpoint only works for branch-based deployments. Use `/deployments` instead:

```bash
# ❌ Doesn't work with workflow method
gh api repos/trsdn/learning-platform/pages/builds/latest

# ✅ Works with workflow method
gh api repos/trsdn/learning-platform/deployments --jq '.[0]'
```

## Migration from Old Method

If you have an existing workflow using `peaceiris/actions-gh-pages`:

1. **Update workflow file** (`.github/workflows/deploy.yml`):
   - Add `pages: write` and `id-token: write` permissions
   - Add `environment: github-pages` configuration
   - Replace `peaceiris/actions-gh-pages@v3` with three steps:
     - `actions/configure-pages@v4`
     - `actions/upload-pages-artifact@v3`
     - `actions/deploy-pages@v4`

2. **Test deployment**:
   ```bash
   gh workflow run deploy.yml -f confirm=deploy-production
   gh run watch
   ```

3. **Verify**:
   ```bash
   # Should show recent deployment
   gh api repos/trsdn/learning-platform/deployments --jq '.[0]'

   # Should serve new version
   curl -s https://trsdn.github.io/learning-platform/ | grep deployment-version
   ```

## Test Environment

For testing deployments before production, use:

```bash
/deploy-test
```

This deploys to: https://trsdn.github.io/learning-platform/test/

See [TEST_DEPLOYMENT.md](./TEST_DEPLOYMENT.md) for details.

## References

- [GitHub Pages Deployment Actions](https://github.com/actions/deploy-pages)
- [Configuring Pages](https://github.com/actions/configure-pages)
- [Upload Pages Artifact](https://github.com/actions/upload-pages-artifact)
- [GitHub Pages Documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## History

- **2025-10-05**: Fixed deployment workflow to use modern `actions/deploy-pages` instead of `peaceiris/actions-gh-pages`. Previous method was pushing to `gh-pages` branch but not triggering actual deployments due to `build_type: workflow` configuration.
