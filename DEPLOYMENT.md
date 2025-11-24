# Deployment Guide - Supabase + Vercel

**Last Updated:** 2025-11-24
**Architecture:** Supabase (PostgreSQL) + Vercel (Hosting)

This guide walks you through deploying MindForge Academy to production on Vercel with Supabase as the backend.

---

## Architecture Overview

- **Frontend**: React + TypeScript hosted on Vercel
- **Backend**: Supabase PostgreSQL database
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Deployment**: Automatic via GitHub Actions → Vercel
- **CI/CD**: Type checking, linting, tests on every push

---

## Prerequisites

- [x] Supabase project created
- [x] Database schema applied
- [x] Content seeded
- [x] Local development tested
- [ ] Supabase redirect URLs configured
- [ ] Vercel project created and linked
- [ ] OAuth providers configured (optional)
- [ ] Production environment variables set

---

## Step 1: Configure Supabase Authentication URLs

**Time Required:** 5 minutes
**Priority:** CRITICAL

### 1.1 Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `knzjdckrtewoigosaxoh`
3. Navigate to **Authentication** → **URL Configuration**

### 1.2 Configure Site URL

Set the **Site URL** to your Vercel production domain:
```
https://your-app.vercel.app
```

### 1.3 Add Redirect URLs

Add the following **Redirect URLs** (one per line):

**Development:**
```
http://localhost:5173/auth/callback
http://localhost:5173/
http://127.0.0.1:5173/auth/callback
http://127.0.0.1:5173/
```

**Production (Vercel):**
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/
https://your-custom-domain.com/auth/callback  # If using custom domain
https://your-custom-domain.com/
```

### 1.4 Save Configuration

Click **Save** and wait for the changes to propagate (usually instant).

---

## Step 2: Set Up Vercel Project

**Time Required:** 10 minutes
**Priority:** HIGH

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Link Project to Vercel

```bash
vercel link
```

Or create a new project via Vercel dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings
4. Deploy

### 2.3 Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Add these for all environments (Production, Preview, Development)

---

## Step 3: Test Authentication Locally

**Time Required:** 10 minutes
**Priority:** HIGH

### 3.1 Start Development Server

```bash
npm run dev
```

### 3.2 Test Email/Password Signup

1. Open http://localhost:5173
2. Click **🔑 Anmelden**
3. Switch to **Registrieren** tab
4. Enter:
   - Name: Test User (optional)
   - Email: your-email@example.com
   - Password: testpassword123
5. Click **✨ Konto erstellen**
6. Check your email for confirmation link
7. Click confirmation link
8. Return to app and log in

### 3.3 Test Login

1. Click **🔑 Anmelden**
2. Enter your email and password
3. Click **🔑 Anmelden**
4. Verify you see **👋 Abmelden** button
5. Verify your email shows in the header

### 3.4 Test Logout

1. Click **👋 Abmelden**
2. Verify you're logged out
3. Verify **🔑 Anmelden** button returns

---

## Step 4: Configure OAuth Providers (Optional)

**Time Required:** 30 minutes each
**Priority:** MEDIUM (optional feature)

### 4.1 Google OAuth

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type**: Web application
6. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
7. Add **Authorized redirect URIs**:
   ```
   https://knzjdckrtewoigosaxoh.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**

#### Configure in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click **Edit**
3. Enable **Google enabled**
4. Paste **Client ID** and **Client Secret**
5. Click **Save**

### 4.2 GitHub OAuth

#### Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: MindForge Academy
   - **Homepage URL**: https://your-app.vercel.app
   - **Authorization callback URL**: https://knzjdckrtewoigosaxoh.supabase.co/auth/v1/callback
4. Click **Register application**
5. Copy **Client ID**
6. Generate a **Client Secret** and copy it

#### Configure in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and click **Edit**
3. Enable **GitHub enabled**
4. Paste **Client ID** and **Client Secret**
5. Click **Save**

---

## Step 5: Deploy to Vercel

**Time Required:** 5 minutes
**Priority:** HIGH

### 5.1 Automatic Deployment (Recommended)

Every push to `main` branch automatically deploys to production via GitHub Actions.

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 5.2 Manual Deployment via CLI

```bash
vercel --prod
```

### 5.3 Monitor Deployment

Watch deployment progress:
- Via Vercel Dashboard
- Via GitHub Actions tab
- Via CLI: `vercel logs`

---

## Step 6: Verify Production Deployment

**Time Required:** 10 minutes
**Priority:** CRITICAL

### 6.1 Access Production Site

Open your Vercel production URL (e.g., https://your-app.vercel.app)

### 6.2 Test Production Authentication

1. Click **🔑 Anmelden**
2. Try signing up with a new email
3. Confirm email
4. Log in
5. Verify user email shows in header
6. Test logout

### 6.3 Check Console for Errors

Open browser DevTools (F12) and check:
- [ ] No console errors
- [ ] Auth events logging correctly
- [ ] Supabase connection successful

### 6.4 Test Data Persistence

1. Create a practice session
2. Complete some tasks
3. Check dashboard for statistics
4. Log out and log back in
5. Verify data persists

---

## Step 7: Seed Production Database

**Time Required:** 5 minutes
**Priority:** HIGH

Seed the production database with initial content:

```bash
npm run seed:supabase
```

This will populate:
- Topics (Mathematics, Biology, English, Spanish)
- Learning paths
- Tasks

---

## Step 8: Monitor and Maintain

### 8.1 Monitor Supabase Dashboard

Regularly check:
- **Authentication**: User signups, logins
- **Database**: Table row counts, storage usage
- **API**: Request rates, error rates
- **Logs**: Auth logs, database logs

### 8.2 Monitor Vercel Dashboard

Check:
- **Deployments**: Build status, errors
- **Analytics**: Page views, performance
- **Logs**: Runtime errors, API calls
- **Usage**: Bandwidth, function executions

### 8.3 Set Up Alerts

**Supabase Alerts:**
In Supabase Dashboard → Settings → Billing:
- Set usage alerts
- Monitor API quota
- Track storage limits

**Vercel Alerts:**
In Vercel Dashboard → Your Project → Settings → Notifications:
- Failed deployments
- High bandwidth usage
- Performance degradation

---

## Troubleshooting

### Issue: CORS Error on Authentication

**Symptoms:**
```
Failed to fetch
AuthRetryableFetchError: Failed to fetch
```

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Ensure your Vercel domain is in **Redirect URLs**
3. Wait 1-2 minutes for changes to propagate
4. Clear browser cache and try again

### Issue: Environment Variables Not Working

**Symptoms:**
- `VITE_SUPABASE_URL is undefined`
- Authentication fails in production

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all `VITE_*` variables are set
3. Ensure they're enabled for Production, Preview, and Development
4. Redeploy: `vercel --prod --force`

### Issue: Build Fails on Vercel

**Symptoms:**
- Deployment fails during build step
- TypeScript errors in logs

**Fix:**
1. Run `npm run build` locally to reproduce
2. Fix any TypeScript errors
3. Run `npm run type-check` to verify
4. Commit and push fixes

### Issue: Database Connection Fails

**Symptoms:**
- "Failed to load topics from Supabase"
- Database queries return errors

**Fix:**
1. Verify Supabase project is active
2. Check environment variables are correct
3. Test connection with: `curl $VITE_SUPABASE_URL/rest/v1/`
4. Verify RLS policies allow reads

---

## Environment Variables Reference

### Development (.env.local)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service Role (for seeding only - NEVER expose in frontend!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Production (Vercel Environment Variables)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

⚠️ **IMPORTANT:** Never commit secrets to Git!

---

## Security Checklist

Before deploying to production:

- [ ] Service role key is NOT in frontend code
- [ ] Service role key is NOT in Git history
- [ ] RLS policies are enabled on all tables
- [ ] Email confirmation is enabled
- [ ] Password requirements are enforced (6+ characters)
- [ ] Rate limiting is configured in Supabase
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] OAuth secrets are stored securely
- [ ] Redirect URLs are whitelisted
- [ ] Environment variables are properly scoped

---

## Performance Optimization

### Enable Vercel Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable **Web Analytics**
3. Monitor Core Web Vitals

### Enable Supabase Connection Pooling

For better database performance:
1. Go to Supabase Dashboard → Settings → Database
2. Enable **Connection Pooler**
3. Use pooler connection string in production

### Enable Edge Functions (Optional)

For faster auth responses in different regions:
1. Go to Supabase Dashboard → Settings → API
2. Enable **Edge Functions**
3. Select regions closest to your users

---

## CI/CD Pipeline

### GitHub Actions Workflows

- **`.github/workflows/ci.yml`**: Type check, lint, tests
- **`.github/workflows/deploy-test.yml`**: Deploy to test environment on PR
- **Vercel Integration**: Automatic production deployment on merge to main

### Deployment Flow

```
Push to main → GitHub Actions (CI) → Vercel Build → Deploy → Verify
```

---

## Custom Domain Setup (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for DNS propagation (up to 48 hours)

### Update Supabase Redirect URLs

After custom domain is active:
1. Add custom domain URLs to Supabase redirect URLs
2. Update Site URL if using custom domain as primary

---

## Support

For issues or questions:

1. **Vercel Documentation:** https://vercel.com/docs
2. **Supabase Documentation:** https://supabase.com/docs
3. **Supabase Community:** https://github.com/supabase/supabase/discussions
4. **Project Issues:** https://github.com/torstenmahr/learning-platform/issues

---

## Deployment Checklist

### Pre-Deployment
- [x] Database schema applied
- [x] Content seeded to Supabase
- [x] Authentication system tested locally
- [ ] Supabase URLs configured
- [ ] Vercel project created
- [ ] Environment variables set

### Deployment
- [ ] Production build successful
- [ ] Deployed to Vercel
- [ ] Authentication works in production
- [ ] No console errors
- [ ] Database queries work

### Post-Deployment
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Monitor for errors
- [ ] Verify RLS working
- [ ] Seed production database

---

## Success Criteria

✅ **Deployment is successful when:**
- Users can sign up and receive confirmation email
- Users can log in with email/password
- Users stay logged in across page refreshes
- Data persists across sessions
- No console errors in production
- RLS prevents unauthorized access
- OAuth providers work (if configured)
- Performance metrics are good (Core Web Vitals)

---

## Maintenance Schedule

### Daily
- Check error logs in Vercel Dashboard
- Monitor Supabase error logs
- Check deployment status

### Weekly
- Review user signup trends
- Check database storage usage
- Monitor API usage
- Update dependencies if needed

### Monthly
- Review and optimize RLS policies
- Analyze authentication patterns
- Review performance metrics
- Update documentation

---

**Deployment Complete! 🎉**

Your Supabase + Vercel powered learning platform is now ready for production use.
