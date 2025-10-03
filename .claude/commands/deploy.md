---
description: Deploy the learning platform to production environment (requires confirmation). Arguments: --force (skip checks), --skip-test (skip test env verification)
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Deploy to production environment at `/learning-platform/` with full safety checks and user confirmation.

**⚠️ CRITICAL**: This deploys to PRODUCTION. Requires explicit user confirmation.

Execution steps:

1. **Parse user input** from `$ARGUMENTS`:
   - If contains `--force` or `force`: Skip pre-deployment checks (DANGEROUS, not recommended)
   - If contains `--skip-test` or `skip-test`: Skip test environment verification
   - Otherwise: Run full safety checks

2. **Pre-deployment safety checks**:
   a. Verify git status is clean:
      ```bash
      git status --porcelain
      ```
      - If dirty: Ask user to commit or stash changes first

   b. Verify on main branch:
      ```bash
      git branch --show-current
      ```
      - If not main: Ask user to switch to main branch

   c. Verify tests pass:
      ```bash
      npm run build
      ```
      - If build fails: ABORT deployment and show errors

   d. Check if test environment was deployed recently (recommended):
      ```bash
      gh run list --workflow=deploy-test.yml --limit=1 --json conclusion,updatedAt
      ```
      - If not deployed recently: Suggest running `/deploy-test` first

3. **Request explicit confirmation**:
   Ask user:
   ```
   ⚠️  PRODUCTION DEPLOYMENT CONFIRMATION

   You are about to deploy to: https://trsdn.github.io/learning-platform/

   Pre-deployment checks:
   - [x] Git status: Clean
   - [x] Branch: main
   - [x] Build: Successful
   - [x] Test environment: Verified (optional)

   This will:
   - Update production site immediately
   - Affect all users
   - Use database: mindforge-academy

   Type "deploy to production" to confirm:
   ```

   - Wait for exact confirmation text
   - If user types anything else: ABORT deployment

4. **Production deployment**:
   a. Create deployment tag (optional but recommended):
      ```bash
      git tag -a "v$(date +%Y%m%d-%H%M%S)" -m "Production deployment"
      git push --tags
      ```

   b. Run deployment:
      ```bash
      npm run deploy
      ```

   c. Monitor deployment output for errors

   d. Verify deployment command completed successfully

5. **Post-deployment verification**:
   a. Provide production URL: https://trsdn.github.io/learning-platform/

   b. Remind user to:
      - Wait 2-3 minutes for GitHub Pages to update
      - Clear browser cache (Ctrl+Shift+Delete)
      - Test in incognito/private window

   c. Verification checklist:
      - [ ] Production site loads
      - [ ] Open DevTools → Application → IndexedDB
      - [ ] Verify database name: `mindforge-academy` (not `-test`)
      - [ ] Test critical user flows:
        * Select topic
        * Start practice session
        * Answer questions
        * View results
        * Check dashboard/progress
      - [ ] Test on mobile device (if possible)
      - [ ] Check service worker updates correctly

6. **Rollback instructions** (if issues found):
   ```bash
   # Option 1: Deploy previous commit
   git checkout HEAD~1
   npm run deploy
   git checkout main

   # Option 2: Deploy specific tag
   git checkout v20241003-120000  # Replace with tag
   npm run deploy
   git checkout main
   ```

7. **Post-deployment actions**:
   - Update CHANGELOG.md with deployment notes
   - Notify stakeholders (if applicable)
   - Monitor for user reports/issues
   - Check analytics/metrics (if available)

Behavior rules:
- ALWAYS require explicit confirmation ("deploy to production")
- NEVER skip safety checks unless `--force` flag used
- NEVER deploy if build fails
- ALWAYS verify git status and branch
- ALWAYS provide rollback instructions
- RECOMMEND testing in test environment first
- ASK user if they want to create a git tag for this deployment

Safety guardrails:
- Git must be clean (no uncommitted changes)
- Must be on main branch
- Build must succeed
- User must type exact confirmation phrase
- Provide clear rollback path

Environment configuration:
- Base path: `/learning-platform/`
- Database: `mindforge-academy`
- Service worker scope: `/`
- Target: Production (live users)

Context: $ARGUMENTS
