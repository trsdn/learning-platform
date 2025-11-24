# Supabase Setup Instructions

## Quick Start

Your Supabase project is configured! Follow these steps to complete the setup:

### 1. Apply Database Schema ⚡

**Option A: Manual (Recommended - Easiest)**

1. Open the Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/sql
   ```

2. Copy the entire contents of:
   ```
   supabase/migrations/20250123000001_initial_schema.sql
   ```

3. Paste into the SQL Editor and click **"Run"**

4. Verify tables were created - you should see 9 new tables:
   - profiles
   - user_settings
   - topics
   - learning_paths
   - tasks
   - user_progress
   - practice_sessions
   - answer_history
   - spaced_repetition

**Option B: CLI (Requires Access Token)**

1. Get your Supabase access token:
   ```
   https://supabase.com/dashboard/account/tokens
   ```

2. Set the token and run:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   npm run supabase:schema
   ```

---

### 2. Generate TypeScript Types 📝

After applying the schema, generate TypeScript types:

```bash
npm run supabase:types
```

This will update `src/modules/storage/database.types.ts` with types from your actual database schema.

---

### 3. Configure Authentication Providers 🔐

Enable auth providers in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/auth/providers

2. **Email Auth** (Already enabled by default)
   - ✅ Enable Email provider
   - ✅ Enable Email confirmations (recommended)

3. **Magic Link**
   - ✅ Enable Magic Link (same as Email provider)

4. **Google OAuth**
   - Click "Google" provider
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Set redirect URI: `https://knzjdckrtewoigosaxoh.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
   - ✅ Enable provider

5. **GitHub OAuth**
   - Click "GitHub" provider
   - Create OAuth App in [GitHub Settings](https://github.com/settings/developers)
   - Set callback URL: `https://knzjdckrtewoigosaxoh.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
   - ✅ Enable provider

---

### 4. Test the Connection 🧪

Run the dev server:

```bash
npm run dev
```

Check the browser console - you should see no Supabase connection errors.

---

## Environment Configuration

Your `.env.local` is already configured with:

```env
VITE_SUPABASE_URL=https://knzjdckrtewoigosaxoh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-IsBAkX_OodrewKfm9Zdkw_S6RGl_rP
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ZyDbMl6l21TFMhp5w2GwdQ_4fmL0FWv
```

⚠️ **Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

---

## Verify Setup

### Check Tables

Run this query in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 9 tables listed.

### Check RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

### Test Auth

Try creating a test user in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/auth/users
2. Click "Add user"
3. Create a test account
4. Check that a profile was automatically created in the `profiles` table

---

## Next Steps

After completing the setup:

1. ✅ Schema applied
2. ✅ Types generated
3. ✅ Auth providers configured
4. ⏭️ Continue with implementation:
   - Implement Auth Service
   - Create Auth Context
   - Build Login/Signup UI
   - Implement repositories
   - Create seeding script

See `SUPABASE_MIGRATION.md` for the full migration plan.

---

## Troubleshooting

### Error: "relation does not exist"
- The schema wasn't applied correctly
- Re-run the SQL migration

### Error: "JWT expired" or "Invalid API key"
- Check that your anon key in `.env.local` matches the one in Supabase Dashboard
- Project Settings → API → anon key

### Error: "Row Level Security policy violation"
- RLS policies weren't applied
- Re-run the schema migration
- Check policies in Supabase Dashboard → Authentication → Policies

### Can't generate types
- Make sure you have Supabase CLI installed: `brew install supabase/tap/supabase`
- Check project ID is correct in package.json script
- Try with access token: `SUPABASE_ACCESS_TOKEN=<token> npm run supabase:types`

---

## Useful Links

- **Project Dashboard:** https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh
- **SQL Editor:** https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/sql
- **Auth Settings:** https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/auth/providers
- **Database Tables:** https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/editor
- **API Docs:** https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/api

---

**Last Updated:** 2025-01-23
