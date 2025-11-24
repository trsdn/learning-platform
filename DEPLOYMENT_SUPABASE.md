# Supabase Deployment Guide

**Last Updated:** 2025-11-24
**Branch:** `feature/supabase-migration`

This guide walks you through deploying the Supabase-enabled MindForge Academy to production.

---

## Prerequisites

- [x] Supabase project created
- [x] Database schema applied
- [x] Content seeded
- [x] Local development tested
- [ ] Supabase redirect URLs configured
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

Set the **Site URL** to your production domain:
```
https://torstenmahr.github.io/learning-platform/
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

**Production:**
```
https://torstenmahr.github.io/learning-platform/auth/callback
https://torstenmahr.github.io/learning-platform/
```

### 1.4 Save Configuration

Click **Save** and wait for the changes to propagate (usually instant).

---

## Step 2: Test Authentication Locally

**Time Required:** 10 minutes
**Priority:** HIGH

### 2.1 Start Development Server

```bash
npm run dev
```

### 2.2 Test Email/Password Signup

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

### 2.3 Test Login

1. Click **🔑 Anmelden**
2. Enter your email and password
3. Click **🔑 Anmelden**
4. Verify you see **👋 Abmelden** button
5. Verify your email shows in the header

### 2.4 Test Logout

1. Click **👋 Abmelden**
2. Verify you're logged out
3. Verify **🔑 Anmelden** button returns

### 2.5 Test Magic Link (Optional)

1. Click **🔑 Anmelden**
2. Enter your email
3. Click **✨ Magic Link senden**
4. Check your email
5. Click the magic link
6. Verify you're logged in

---

## Step 3: Configure OAuth Providers (Optional)

**Time Required:** 30 minutes each
**Priority:** MEDIUM (optional feature)

### 3.1 Google OAuth

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application type**: Web application
6. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://torstenmahr.github.io
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

### 3.2 GitHub OAuth

#### Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: MindForge Academy
   - **Homepage URL**: https://torstenmahr.github.io/learning-platform/
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

## Step 4: Configure Production Environment

**Time Required:** 5 minutes
**Priority:** HIGH

### 4.1 GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add the following secrets:

```
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-IsBAkX_OodrewKfm9Zdkw_S6RGl_rP
```

⚠️ **NEVER** commit the service role key to Git!

### 4.2 Update GitHub Actions Workflow

If you have a GitHub Actions deployment workflow, ensure it uses the secrets:

```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## Step 5: Build and Deploy

**Time Required:** 5 minutes
**Priority:** HIGH

### 5.1 Build Production Bundle

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle with Vite
- Optimize assets
- Generate service worker

### 5.2 Test Production Build Locally

```bash
npm run preview
```

Navigate to http://localhost:4173 and test:
- [ ] App loads
- [ ] Auth modal opens
- [ ] Can navigate between pages
- [ ] No console errors

### 5.3 Deploy to GitHub Pages

```bash
npm run deploy
```

Or manually:
```bash
npm run build
cp dist/index.html dist/404.html
gh-pages -d dist
```

---

## Step 6: Verify Production Deployment

**Time Required:** 10 minutes
**Priority:** CRITICAL

### 6.1 Access Production Site

Open https://torstenmahr.github.io/learning-platform/

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

### 6.4 Test on Multiple Devices (Optional)

1. Open on mobile device
2. Log in with same account
3. Verify data syncs (when Phase 9 is complete)

---

## Step 7: Monitor and Maintain

### 7.1 Monitor Supabase Dashboard

Regularly check:
- **Authentication**: User signups, logins
- **Database**: Table row counts, storage usage
- **API**: Request rates, error rates
- **Logs**: Auth logs, database logs

### 7.2 Set Up Alerts (Optional)

In Supabase Dashboard → **Settings** → **Billing**:
- Set usage alerts
- Monitor API quota
- Track storage limits

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
2. Ensure your domain is in **Redirect URLs**
3. Wait 1-2 minutes for changes to propagate
4. Clear browser cache and try again

### Issue: Email Confirmation Not Working

**Symptoms:**
- User clicks email link but not confirmed
- Redirect doesn't work

**Fix:**
1. Check **Site URL** is set correctly in Supabase
2. Verify email template redirect URL:
   - Go to Authentication → Email Templates
   - Check "Confirm signup" template
   - Ensure `{{ .SiteURL }}/auth/callback` is correct

### Issue: OAuth Redirect Fails

**Symptoms:**
- OAuth window opens but fails
- Redirect doesn't return to app

**Fix:**
1. Verify OAuth redirect URI matches exactly:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
2. Check OAuth provider settings (Google/GitHub)
3. Ensure production URL is in authorized origins

### Issue: User Not Staying Logged In

**Symptoms:**
- User logged out on page refresh
- Session not persisting

**Fix:**
1. Check browser local storage is enabled
2. Verify Supabase client configuration:
   ```typescript
   auth: {
     persistSession: true,
     storage: window.localStorage,
   }
   ```

---

## Environment Variables Reference

### Development (.env.local)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-IsBAkX_OodrewKfm9Zdkw_S6RGl_rP

# Service Role (for seeding only - NEVER expose in frontend!)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ZyDbMl6l21TFMhp5w2GwdQ_4fmL0FWv
```

### Production (GitHub Secrets)
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
- [ ] HTTPS is enforced (GitHub Pages does this automatically)
- [ ] OAuth secrets are stored securely
- [ ] Redirect URLs are whitelisted

---

## Performance Optimization

### Enable Edge Functions (Optional)

For faster auth responses in different regions:
1. Go to Supabase Dashboard → Settings → API
2. Enable **Edge Functions**
3. Select regions closest to your users

### Enable Connection Pooling

For better database performance:
1. Go to Supabase Dashboard → Settings → Database
2. Enable **Connection Pooler**
3. Use pooler connection string in production

---

## Rollback Plan

If you need to rollback to IndexedDB:

### Quick Rollback
```bash
git checkout main
npm run deploy
```

### Gradual Rollback
1. Keep Supabase authentication
2. Revert to Dexie repositories
3. Update factory.ts to use old adapters

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

## Support

For issues or questions:

1. **Supabase Documentation:** https://supabase.com/docs
2. **Supabase Community:** https://github.com/supabase/supabase/discussions
3. **Project Issues:** https://github.com/torstenmahr/learning-platform/issues

---

## Deployment Checklist

### Pre-Deployment
- [x] Database schema applied
- [x] Content seeded to Supabase
- [x] Authentication system tested locally
- [ ] Supabase URLs configured
- [ ] Environment variables set

### Deployment
- [ ] Production build successful
- [ ] Deployed to GitHub Pages
- [ ] Authentication works in production
- [ ] No console errors

### Post-Deployment
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout flow
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

---

## Maintenance Schedule

### Daily
- Check error logs in Supabase Dashboard
- Monitor API usage

### Weekly
- Review user signup trends
- Check database storage usage
- Update dependencies if needed

### Monthly
- Review and optimize RLS policies
- Analyze authentication patterns
- Update documentation

---

**Deployment Complete! 🎉**

Your Supabase-powered learning platform is now ready for production use.
