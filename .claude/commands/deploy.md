---
description: Deploy the learning platform to Vercel production (requires confirmation). Arguments: --force (skip checks)
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Deploy to Vercel production environment with full safety checks and user confirmation.

**⚠️ CRITICAL**: This deploys to PRODUCTION on Vercel. Requires explicit user confirmation.

Execution steps:

1. **Parse user input** from `$ARGUMENTS`:
   - If contains `--force` or `force`: Skip pre-deployment checks (DANGEROUS, not recommended)
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

   c. Verify build succeeds:
      ```bash
      npm run build
      ```
      - If build fails: ABORT deployment and show errors

3. **Request explicit confirmation**:
   Ask user:
   ```
   ⚠️  PRODUCTION DEPLOYMENT CONFIRMATION

   You are about to deploy to: Vercel Production

   Pre-deployment checks:
   - [x] Git status: Clean
   - [x] Branch: main
   - [x] Build: Successful

   This will:
   - Update production site immediately
   - Affect all users
   - Use database: mindforge-academy (production)

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

   b. **Deploy to Vercel**:
      ```bash
      npx vercel --prod
      ```

      **IMPORTANT**:
      - Uses Vercel CLI for deployment
      - Automatically builds and deploys
      - Vercel project must be linked (run `vercel link` if not)
      - Uses production environment variables from Vercel dashboard

   c. Monitor deployment output for errors

   d. Capture and display the production URL from Vercel output

5. **Post-deployment verification**:
   a. Display the Vercel production URL provided in deployment output

   b. Remind user to:
      - Wait 1-2 minutes for deployment to propagate
      - Clear browser cache (Ctrl+Shift+Delete)
      - Test in incognito/private window

   c. Verification checklist:
      - [ ] Production site loads
      - [ ] Open DevTools → Application → Supabase connection works
      - [ ] Verify database: `mindforge-academy` (not `-test`)
      - [ ] Test critical user flows:
        * Authentication
        * Select topic
        * Start practice session
        * Answer questions
        * View results
        * Check dashboard/progress
      - [ ] Test on mobile device (if possible)
      - [ ] Check service worker updates correctly

6. **Rollback instructions** (if issues found):
   ```bash
   # Rollback to previous deployment via Vercel CLI
   vercel rollback

   # Or via Vercel Dashboard:
   # 1. Go to https://vercel.com/dashboard
   # 2. Select project
   # 3. Go to Deployments
   # 4. Find previous working deployment
   # 5. Click "..." → "Promote to Production"
   ```

7. **Post-deployment actions**:
   - Update CHANGELOG.md with deployment notes
   - Notify stakeholders (if applicable)
   - Monitor Vercel analytics
   - Check for runtime errors in Vercel logs

Behavior rules:
- ALWAYS require explicit confirmation ("deploy to production")
- NEVER skip safety checks unless `--force` flag used
- NEVER deploy if build fails
- ALWAYS verify git status and branch
- ALWAYS provide rollback instructions
- ALWAYS display the deployed URL

Safety guardrails:
- Git must be clean (no uncommitted changes)
- Must be on main branch
- Build must succeed
- User must type exact confirmation phrase
- Vercel project must be linked

Environment configuration:
- Platform: Vercel
- Database: `mindforge-academy` (Supabase production)
- Build command: `npm run build`
- Output directory: `dist`
- Framework: React + Vite
- Target: Production (live users)

Vercel setup requirements:
- Vercel CLI installed: `npm i -g vercel`
- Project linked: `vercel link`
- Environment variables configured in Vercel dashboard
- Production domain configured (if custom domain used)

Context: $ARGUMENTS
