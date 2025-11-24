# Vercel + Supabase Deployment Guide

**Last Updated:** 2025-11-24
**Branch:** `feature/supabase-migration`

This guide walks you through deploying MindForge Academy on Vercel with Supabase backend.

---

## 🎯 Why Vercel + Supabase?

- ✅ Everything in 2 consolidated platforms (no GitHub Pages needed)
- ✅ Automatic deployments from Git
- ✅ Perfect for React + Vite apps
- ✅ Zero configuration needed
- ✅ Free tier included
- ✅ Custom domains supported
- ✅ No CORS issues
- ✅ Built-in CDN and edge network
- ✅ Automatic HTTPS
- ✅ Preview deployments for PRs

---

## Prerequisites

- [x] Supabase project created
- [x] Database schema applied
- [x] Content seeded (622 tasks)
- [x] Local development tested
- [ ] GitHub repository access
- [ ] Vercel account (free)

---

## Step 1: Create Vercel Account

**Time Required:** 2 minutes

### 1.1 Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub repositories
4. Complete account setup

**Note:** Use GitHub authentication for seamless integration.

---

## Step 2: Import Your Project to Vercel

**Time Required:** 3 minutes

### 2.1 Create New Project

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Find your repository: `learning-platform`
4. Click **Import**

### 2.2 Configure Build Settings

Vercel will auto-detect Vite, but verify these settings:

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

✅ These are already configured in `vercel.json`

### 2.3 Add Environment Variables

Click **Environment Variables** and add:

```bash
VITE_SUPABASE_URL
Value: https://knzjdckrtewoigosaxoh.supabase.co

VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuempk...
```

**Important:**
- Add to **Production**, **Preview**, and **Development** environments
- Never add `SUPABASE_SERVICE_ROLE_KEY` (that's for seeding only)

### 2.4 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Get your production URL: `https://your-project.vercel.app`

---

## Step 3: Configure Supabase Redirect URLs

**Time Required:** 5 minutes
**Priority:** CRITICAL

### 3.1 Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `knzjdckrtewoigosaxoh`
3. Navigate to **Authentication** → **URL Configuration**

### 3.2 Configure Site URL

Set the **Site URL** to your Vercel production domain:
```
https://your-project.vercel.app
```

### 3.3 Add Redirect URLs

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
https://your-project.vercel.app/auth/callback
https://your-project.vercel.app/
```

**Preview Deployments (Optional):**
```
https://*.vercel.app/auth/callback
https://*.vercel.app/
```

### 3.4 Save Configuration

Click **Save** and wait for changes to propagate (usually instant).

---

## Step 4: Test Production Deployment

**Time Required:** 10 minutes
**Priority:** CRITICAL

### 4.1 Access Production Site

Open your Vercel URL: `https://your-project.vercel.app`

### 4.2 Test Authentication

1. Click **🔑 Anmelden**
2. Switch to **Registrieren** tab
3. Enter:
   - Name: Test User (optional)
   - Email: your-email@example.com
   - Password: testpassword123
4. Click **✨ Konto erstellen**
5. Check your email for confirmation link
6. Click confirmation link
7. Return to app and log in

### 4.3 Verify Login

1. Enter your email and password
2. Click **🔑 Anmelden**
3. Verify you see **👋 Abmelden** button
4. Verify your email shows in the header

### 4.4 Test Logout

1. Click **👋 Abmelden**
2. Verify you're logged out
3. Verify **🔑 Anmelden** button returns

### 4.5 Check Console

Open browser DevTools (F12) and verify:
- [ ] No console errors
- [ ] Auth events logging correctly
- [ ] Supabase connection successful

---

## Step 5: Set Up Automatic Deployments

**Time Required:** Already configured! ✅

Vercel automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches or PRs
- **Instant:** Typically 2-3 minutes per deployment

### How It Works

1. Push code to GitHub
2. Vercel detects the push
3. Builds your app automatically
4. Deploys to production or preview URL
5. Notifies you via email/Slack (optional)

---

## Step 6: Configure Custom Domain (Optional)

**Time Required:** 10 minutes

### 6.1 Add Domain in Vercel

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Domains**
3. Enter your domain: `mindforge-academy.com`
4. Click **Add**

### 6.2 Update DNS Records

Vercel will provide DNS records. Add to your domain registrar:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6.3 Update Supabase URLs

Add your custom domain to Supabase redirect URLs:
```
https://mindforge-academy.com/auth/callback
https://mindforge-academy.com/
https://www.mindforge-academy.com/auth/callback
https://www.mindforge-academy.com/
```

---

## Step 7: Configure OAuth Providers (Optional)

**Time Required:** 30 minutes each
**Priority:** MEDIUM

### 7.1 Google OAuth

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type**: Web application
6. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-project.vercel.app
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

### 7.2 GitHub OAuth

#### Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: MindForge Academy
   - **Homepage URL**: https://your-project.vercel.app
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

## Step 8: Monitor and Maintain

### 8.1 Vercel Analytics (Optional)

Enable Vercel Analytics for insights:
1. Go to Vercel Dashboard → Your Project
2. Click **Analytics**
3. Enable **Web Analytics**
4. See real-time visitor data, performance metrics, etc.

### 8.2 Supabase Dashboard

Regularly check:
- **Authentication**: User signups, logins
- **Database**: Table row counts, storage usage
- **API**: Request rates, error rates
- **Logs**: Auth logs, database logs

### 8.3 Set Up Alerts

**Vercel:**
- Email notifications for deployments
- Slack integration (optional)

**Supabase:**
- Usage alerts in Settings → Billing
- Monitor API quota
- Track storage limits

---

## Troubleshooting

### Issue: Deployment Failed

**Symptoms:**
```
Error: Build failed
```

**Fix:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors

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
- App loads but shows errors
- "Supabase client not initialized"

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Ensure they're added to **Production** environment
4. Redeploy: Deployments → Three dots → Redeploy

### Issue: 404 on Page Refresh

**Symptoms:**
- SPA routes work on initial load
- 404 error when refreshing on `/topics` or other routes

**Fix:**
✅ Already configured in `vercel.json`:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

If still occurring, verify `vercel.json` is committed to Git.

### Issue: Preview Deployments Not Working

**Symptoms:**
- Preview URLs return auth errors
- Can't test PRs before merging

**Fix:**
1. Add wildcard to Supabase redirect URLs:
   ```
   https://*.vercel.app/auth/callback
   ```
2. Or add each preview URL individually

---

## Comparison: Vercel vs GitHub Pages

| Feature | Vercel | GitHub Pages |
|---------|--------|--------------|
| Setup Time | 5 minutes | 10 minutes |
| Automatic Deployments | ✅ Yes | ✅ Yes (via Actions) |
| Preview Deployments | ✅ Yes | ❌ No |
| Custom Domains | ✅ Free | ✅ Free |
| HTTPS | ✅ Automatic | ✅ Automatic |
| SPA Routing | ✅ Built-in | ⚠️ Manual (404.html) |
| Build Logs | ✅ Detailed | ⚠️ In Actions |
| Analytics | ✅ Built-in | ❌ Need Google Analytics |
| Edge Network | ✅ Global CDN | ✅ GitHub CDN |
| Rollback | ✅ One-click | ⚠️ Manual |
| Environment Variables | ✅ Dashboard | ⚠️ GitHub Secrets |
| Base Path | ❌ Not needed (root) | ⚠️ `/learning-platform/` |

**Verdict:** Vercel is better for React apps! 🚀

---

## Environment Variables Reference

### Production (Vercel Dashboard)
```bash
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Development (.env.local)
```bash
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (for seeding only)
```

⚠️ **IMPORTANT:** Never commit `.env.local` to Git!

---

## Vercel Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Security Checklist

Before going live:

- [ ] Service role key is NOT in Git
- [ ] Service role key is NOT in Vercel environment variables
- [ ] RLS policies are enabled on all tables
- [ ] Email confirmation is enabled
- [ ] Password requirements are enforced
- [ ] Redirect URLs are whitelisted in Supabase
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Security headers configured (in vercel.json)
- [ ] OAuth secrets are secure

---

## Deployment Workflow

### Daily Development

```bash
# 1. Make changes locally
git checkout -b feature/my-feature
# ... make changes ...

# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/my-feature

# 4. Vercel automatically creates preview deployment
# Preview URL: https://learning-platform-git-feature-my-feature.vercel.app

# 5. Test preview deployment
# Click link in GitHub PR or Vercel dashboard

# 6. Merge to main when ready
# Vercel automatically deploys to production
```

### Production Deployment

```bash
# Option 1: Via GitHub (recommended)
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
# Vercel deploys automatically

# Option 2: Via Vercel Dashboard
# Deployments → Redeploy → Production
```

### Rollback

```bash
# In Vercel Dashboard:
# Deployments → Find previous deployment → Three dots → Promote to Production
```

---

## Next Steps After Deployment

1. **Complete Phase 9:**
   - Update UI components to use Supabase repositories
   - Enable multi-device sync
   - Test with real users

2. **Phase 7: Settings Migration**
   - Migrate user settings to Supabase
   - Sync preferences across devices

3. **Monitor Usage:**
   - Track signup rates
   - Monitor database growth
   - Optimize queries if needed

4. **Gather Feedback:**
   - Test with beta users
   - Fix any authentication issues
   - Improve UX based on feedback

---

## Vercel CLI (Optional)

For advanced users, install Vercel CLI:

```bash
# Install globally
npm i -g vercel

# Login
vercel login

# Deploy from command line
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## Cost Estimate

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments
- ✅ Analytics (limited)

**Enough for:** ~10,000 monthly visitors

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Social OAuth providers

**Enough for:** Small to medium app

### Total Cost: $0/month for both! 🎉

---

## Support

For issues or questions:

1. **Vercel Documentation:** https://vercel.com/docs
2. **Supabase Documentation:** https://supabase.com/docs
3. **Vercel Community:** https://github.com/vercel/vercel/discussions
4. **Supabase Community:** https://github.com/supabase/supabase/discussions
5. **Project Issues:** https://github.com/torstenmahr/learning-platform/issues

---

## Deployment Checklist

### Pre-Deployment
- [x] Code committed to GitHub
- [x] Environment variables documented
- [x] Supabase project configured
- [x] Content seeded (622 tasks)
- [ ] Vercel account created
- [ ] Project imported to Vercel

### Deployment
- [ ] Environment variables set in Vercel
- [ ] Initial deployment successful
- [ ] Supabase redirect URLs configured
- [ ] Authentication tested
- [ ] No console errors

### Post-Deployment
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test on mobile device
- [ ] Monitor for errors
- [ ] Verify RLS working

---

## Success Criteria

✅ **Deployment is successful when:**
- Users can sign up and receive confirmation email
- Users can log in with email/password
- Users stay logged in across page refreshes
- No console errors in production
- RLS prevents unauthorized access
- OAuth providers work (if configured)
- App loads quickly (< 3 seconds)
- Mobile experience is smooth

---

**Deployment Complete! 🎉**

Your learning platform is now live on Vercel with Supabase backend!

**Next:** Share your production URL and start onboarding users! 🚀
