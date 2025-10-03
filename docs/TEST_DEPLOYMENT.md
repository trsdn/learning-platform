# Test Environment Deployment Guide

This guide explains how to deploy to the test environment for safe testing without affecting production.

## 📋 Overview

The learning platform supports **two separate environments**:

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| **Production** | `/learning-platform/` | `mindforge-academy` | Live site for users |
| **Test** | `/learning-platform/test/` | `mindforge-academy-test` | Testing new features |

**Key Benefits**:
- ✅ Test changes without breaking production
- ✅ Separate database (no data mixing)
- ✅ Easy rollback (just deploy prod again)
- ✅ Safe for experimental features

---

## 🚀 Deployment Methods

### Method 1: GitHub Actions (Recommended)

**Via GitHub UI:**

1. Go to repository on GitHub
2. Click **Actions** tab
3. Select **"Deploy to Test Environment"** workflow
4. Click **"Run workflow"** dropdown
5. Type `deploy-test` to confirm
6. Click **"Run workflow"** button
7. Wait 2-3 minutes for deployment
8. Visit: https://trsdn.github.io/learning-platform/test/

**Benefits**:
- Clean environment (no local dependencies)
- Consistent builds
- Audit trail in GitHub

### Method 2: Command Line (Local)

```bash
# Deploy test environment
npm run deploy:test
```

**What this does:**
1. Sets environment variables (`VITE_ENV=test`, `VITE_DB_NAME=mindforge-academy-test`)
2. Builds with base path `/learning-platform/test/`
3. Deploys to `test/` subdirectory on gh-pages branch

### Method 3: Claude Command (For AI Agents)

If using Claude Code:

```
/deploy-test
```

This triggers the workflow defined in `.claude/commands/deploy-test.md`.

---

## 🔧 How It Works

### Environment Variables

Three environment variables control the test build:

```bash
VITE_ENV=test                                 # Environment identifier
VITE_BASE_PATH=/learning-platform/test/       # URL base path
VITE_DB_NAME=mindforge-academy-test           # IndexedDB database name
```

### Build Configuration

**vite.config.ts**:
```typescript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/learning-platform/',
  define: {
    'import.meta.env.VITE_DB_NAME': JSON.stringify(process.env.VITE_DB_NAME || 'mindforge-academy'),
    'import.meta.env.VITE_ENV': JSON.stringify(process.env.VITE_ENV || 'production'),
  },
  // ...
});
```

**database.ts**:
```typescript
constructor() {
  const dbName = import.meta.env.VITE_DB_NAME || 'mindforge-academy';
  super(dbName);
}
```

### Deployment Structure

GitHub Pages branch (`gh-pages`) structure:

```
gh-pages/
├── index.html           # Production
├── assets/              # Production assets
├── learning-paths/      # Production data
└── test/                # Test environment
    ├── index.html       # Test
    ├── assets/          # Test assets
    └── learning-paths/  # Test data
```

---

## 🧪 Testing Workflow

### 1. Make Changes Locally

```bash
# Create feature branch
git checkout -b feature/new-task-type

# Make your changes
# ... edit files ...

# Test locally
npm run dev
```

### 2. Deploy to Test

```bash
# Commit changes
git add -A
git commit -m "Add new task type"
git push origin feature/new-task-type

# Deploy to test environment
npm run deploy:test
```

**OR** use GitHub Actions (see Method 1 above)

### 3. Test in Browser

1. Open test URL: https://trsdn.github.io/learning-platform/test/
2. **Clear browser cache** (Ctrl+Shift+Delete) - **IMPORTANT!**
3. Open DevTools → Application → IndexedDB
4. Verify database name: `mindforge-academy-test`
5. Click "🔄 DB Aktualisieren" to reload data
6. Test your changes thoroughly

### 4. Verify Production Unaffected

1. Open production URL: https://trsdn.github.io/learning-platform/
2. Verify it still works correctly
3. Check database name: `mindforge-academy` (not `-test`)

### 5. Deploy to Production

Once testing is successful:

```bash
# Merge to main
git checkout main
git merge feature/new-task-type

# Deploy to production
npm run deploy
```

---

## 🔍 Debugging

### Check Which Environment You're In

Open browser console:

```javascript
// Check environment
console.log(import.meta.env.VITE_ENV);  // "test" or "production"

// Check database name
console.log(import.meta.env.VITE_DB_NAME);  // "mindforge-academy-test" or "mindforge-academy"

// Check base path
console.log(import.meta.env.BASE_URL);  // "/learning-platform/test/" or "/learning-platform/"
```

### Common Issues

#### 1. Test site shows old version

**Solution**: Clear browser cache (Ctrl+Shift+Delete)

Service workers cache aggressively. You must clear cache to see new deployments.

#### 2. Test uses production database

**Symptoms**:
- IndexedDB shows `mindforge-academy` instead of `mindforge-academy-test`
- Test changes affect production data

**Solution**:
- Clear all site data
- Hard refresh (Ctrl+Shift+R)
- Check deployment logs for environment variables

#### 3. 404 errors for assets

**Symptoms**: CSS/JS files return 404

**Solution**:
- Verify base path in build output
- Check gh-pages branch has `test/` directory
- Wait 2-3 minutes after deployment for GitHub Pages to update

#### 4. Database not updating

**Solution**:
- Click "🔄 DB Aktualisieren" button
- Check browser console for errors
- Verify JSON files deployed to `test/learning-paths/`

---

## 📊 Monitoring Deployments

### GitHub Actions

View deployment history:
1. Go to repository → Actions
2. Click "Deploy to Test Environment"
3. See all runs with timestamps and logs

### Manual Verification

After deployment, check:

```bash
# View gh-pages branch
git checkout gh-pages

# Check test directory exists
ls -la test/

# View files
ls -la test/assets/
```

---

## 🔐 Permissions

### Required Permissions

The GitHub Action needs:
- `contents: write` - To push to gh-pages branch
- `pages: write` - To deploy to GitHub Pages

These are automatically available via `GITHUB_TOKEN`.

### Manual Deployment Permissions

For local `npm run deploy:test`, you need:
- GitHub authentication configured
- Write access to repository
- gh-pages installed (`npm install`)

---

## 📝 Best Practices

### 1. Always Test Before Production

```bash
# WRONG: Direct to production
npm run deploy  ❌

# RIGHT: Test first
npm run deploy:test  ✅
# ... test thoroughly ...
npm run deploy       ✅
```

### 2. Clear Cache Between Tests

Always clear browser cache when testing:
- Chrome/Edge: Ctrl+Shift+Delete
- Safari: Cmd+Option+E
- Firefox: Ctrl+Shift+Delete

### 3. Use Feature Branches

```bash
# Create feature branch
git checkout -b feature/my-feature

# Deploy to test
npm run deploy:test

# Test thoroughly
# ... testing ...

# Merge to main only when ready
git checkout main
git merge feature/my-feature
npm run deploy
```

### 4. Document Breaking Changes

If your changes require database reset:

1. Add warning in commit message
2. Document in pull request
3. Consider migration script
4. Test migration in test environment first

### 5. Monitor Both Environments

After test deployment:
- ✅ Check test site works
- ✅ Check production still works
- ✅ Verify separate databases
- ✅ Check no cross-contamination

---

## 🗑️ Cleanup

### Remove Test Deployment

If you want to remove the test environment:

```bash
# Clone gh-pages branch
git clone -b gh-pages https://github.com/trsdn/learning-platform.git gh-pages-temp
cd gh-pages-temp

# Remove test directory
rm -rf test/

# Commit and push
git add -A
git commit -m "Remove test environment"
git push

# Cleanup
cd ..
rm -rf gh-pages-temp
```

### Reset Test Database

Users can reset test database:
1. Open DevTools → Application → IndexedDB
2. Delete `mindforge-academy-test` database
3. Refresh page
4. Click "🔄 DB Aktualisieren"

---

## 🔗 Related Documentation

- [AGENTS.md](../AGENTS.md) - AI agent development guide
- [NEW_TASK_TYPE_GUIDE.md](NEW_TASK_TYPE_GUIDE.md) - Adding task types
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

## 📞 Support

If you encounter issues:

1. Check [Common Issues](#common-issues) section
2. Review deployment logs in GitHub Actions
3. Open browser DevTools console for errors
4. Check gh-pages branch for file structure

---

**Last Updated**: 2025-10-03
**Environments**: Production + Test
**Database Names**: `mindforge-academy` (prod), `mindforge-academy-test` (test)
