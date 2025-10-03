---
description: Deploy the learning platform to test environment with isolated database (default: GitHub Actions)
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Deploy to test environment at `/learning-platform/test/` with separate database for safe testing without affecting production.

**Default behavior**: Deploy via GitHub Actions (recommended for clean, consistent builds).

Execution steps:

1. **Parse user input** from `$ARGUMENTS`:
   - If empty or `github`: Use GitHub Actions deployment (default)
   - If `local`: Use local npm script deployment
   - If unrecognized: Ask user to clarify

2. **GitHub Actions deployment** (default):
   a. Verify GitHub CLI is available: `gh --version`
   b. Check if workflow exists: `gh workflow list | grep "Deploy to Test Environment"`
   c. Trigger workflow:
      ```bash
      gh workflow run deploy-test.yml
      ```
   d. Show workflow status:
      ```bash
      gh run list --workflow=deploy-test.yml --limit=1
      ```
   e. Provide instructions:
      - "Deployment triggered via GitHub Actions"
      - "View progress: gh run watch"
      - "Or visit: https://github.com/trsdn/learning-platform/actions"
      - "Test URL (in ~2-3 min): https://trsdn.github.io/learning-platform/test/"

3. **Local deployment** (if requested):
   a. Verify dependencies: `npm list gh-pages`
   b. Run deployment script:
      ```bash
      npm run deploy:test
      ```
   c. Monitor output for errors
   d. Upon success, provide test URL

4. **Post-deployment verification checklist**:
   - [ ] Test site loads at `/learning-platform/test/`
   - [ ] Open DevTools → Application → IndexedDB
   - [ ] Verify database name: `mindforge-academy-test` (not `mindforge-academy`)
   - [ ] Click "🔄 DB Aktualisieren" to reload data
   - [ ] Test 2-3 features to verify functionality
   - [ ] Check production site still works: `/learning-platform/`

5. **If deployment fails**:
   - Check GitHub Actions logs
   - Verify environment variables are set correctly
   - Ensure gh-pages branch exists
   - Check repository permissions

Behavior rules:
- DEFAULT to GitHub Actions unless user explicitly requests `local`
- ALWAYS provide the test URL after deployment
- ALWAYS remind to clear browser cache (Ctrl+Shift+Delete)
- NEVER deploy to production accidentally
- VERIFY database name in DevTools before approving

Environment configuration:
- Base path: `/learning-platform/test/`
- Database: `mindforge-academy-test`
- Service worker scope: `/test/`

Context: $ARGUMENTS

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
